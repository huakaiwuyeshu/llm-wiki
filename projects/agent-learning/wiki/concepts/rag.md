# RAG(检索增强生成,Retrieval-Augmented Generation)

> TL;DR:RAG = 检索(从外部知识库查相关内容)+ 增强(融入提示词)+ 生成(输出兼具准确性与可溯源的答案),用来弥补 LLM 知识静态、领域深度不足、易幻觉的局限。发展三阶段:Naive(关键词检索-读取)→ Advanced(稠密嵌入语义检索 + 查询重写/分块/重排)→ Modular(可插拔模块、混合检索、Self-RAG/CRAG)。HelloAgents 用「五层七步」管道实现,核心优化是 **MQE(召回率 +30-50%)** 与 **HyDE(用答案找答案)**;个人助手长文补充了 Hybrid Search、Re-rank(精度 +10-30%,生产几乎标配)、RAGAS 评估与 Agentic RAG。

## 概念定义

RAG 在生成前先从外部知识库(文档/数据库/API)检索相关信息作为上下文,解决 LLM 两个根本局限之一:**内置知识的局限性**(知识时效性、专业领域深度不足、事实准确性/幻觉、可解释性缺失)(ch08, p231)。

三个动作(ch08, p253):**检索**(从知识库查相关内容)+ **增强**(融入提示词)+ **生成**(输出兼具准确性与透明度的答案)。

## 关键机制

### 三阶段发展史

(ch08, p253-254)

1. **朴素 RAG(Naive RAG, 2020-2021)**:"检索-读取(Retrieve-Read)"模式,关键词匹配(TF-IDF/BM25),检索内容直接拼接到提示词。
2. **高级 RAG(Advanced RAG, 2022-2023)**:转向稠密嵌入(Dense Embedding)语义检索,引入查询重写、文档分块、重排序等优化。
3. **模块化 RAG(Modular RAG, 2023-至今)**:可插拔/可组合的独立模块;混合检索、多查询扩展、假设性文档嵌入;生成端引入思维链推理、自我反思与修正。

> 个人助手长文给出对应但侧重 Agent 的演进:Naive RAG → Advanced RAG(Hybrid + Rerank + 查询变换)→ **Agentic RAG**(Agent 自主决定何时检索/检索什么/结果是否足够,多轮自适应)(个人助手, p10-11)。本项目采用 Agentic RAG。

### 五层七步管道(HelloAgents)

**五层架构**(ch08, p257):用户层(RAGTool 统一接口)→ 应用层(智能问答/搜索/管理)→ 处理层(解析/分块/向量化)→ 存储层(向量库/文档存储)→ 基础层(嵌入模型/LLM/数据库)。优势:每层可独立优化替换(如嵌入模型从 sentence-transformers 切到百炼 API 不影响上层)。

**查询生成七步**(ch08, p254-259):查询类型判断 → 查询增强(HyDE/MQE/基础)→ 向量化 → 相似度搜索 → 候选重排 → Top-K → 上下文构建 → LLM 生成 → 后处理校验。

整个数据处理流程:**任意格式文档 → MarkItDown 转换 → Markdown 文本 → 智能分块 → 向量化 → 存储检索**。**MarkItDown**(微软开源)作为统一转换引擎,把 PDF/Word/Excel/PPT/图片(OCR)/音频(转录)/文本/代码统一转为 Markdown(ch08, p258)。

### Chunking(分块)

- HelloAgents:利用 Markdown 标题层次(#/##/###)做语义分割,保持结构完整;基于 Token 数量分块带重叠(overlap);Token 估算支持中英文混合(CJK 字符按 1 token,非 CJK 按空白分词)(ch08, p259-262)。实战默认 `chunk_size=1000, chunk_overlap=200`(ch08, p268)。
- 个人助手长文:五种策略——固定大小 / 递归分割(LangChain 默认)/ 语义分块 / 结构感知(Markdown/HTML/PDF 段落)/ Agentic(LLM 判断归属)。生产经验:**chunk size 典型 256-1024 tokens,overlap 10-20%**;chunk 越大上下文越完整但检索精度越低;推荐递归分割 + 元数据增强(标题层级、页码、文件路径)(个人助手, p9)。

### Embedding 与向量存储

- 嵌入选型(个人助手, p9-10):OpenAI text-embedding-3-small(1536 维)、BGE-M3(1024 维,100+ 语言,dense+sparse)、GTE-Qwen2(阿里,中文极强)、Jina-v3(8K 长上下文)、Cohere embed-v3。建议中文首选 BGE-M3 或 GTE-Qwen2,英文用 OpenAI。HelloAgents 默认维度 384,百炼 API 优先,回退 sentence-transformers(all-MiniLM-L6-v2)再回退 TF-IDF(ch08, p262-263)。
- 向量存储分级(个人助手, p10):ChromaDB(嵌入式,<百万)、pgvector(<千万)、Qdrant(独立服务,亿级,Rust)、Milvus(分布式,百亿级)、Pinecone(全托管,十亿级)。详见 [vector-databases.md](../entities/vector-databases.md)。

### 高级检索策略

**MQE(多查询扩展,Multi-Query Expansion)**(ch08, p263-266, p271):用 LLM 生成语义等价的多样化查询(如"如何学习 Python"→"Python 入门教程"/"Python 学习方法"),并行执行后合并结果。**实测提升召回率 30%-50%**(ch08, p271)。擅长处理用词多样性。

**HyDE(假设文档嵌入,Hypothetical Document Embeddings)**(ch08, p264):核心是**"用答案找答案"**。问题(疑问句)和答案(陈述句)语义空间分布有差异,HyDE 让 LLM 先生成假设性答案段落,再用该段落去检索真实文档,缩小查询与文档的语义鸿沟。金句:即使假设答案不完全正确,其关键术语/概念/表述风格也能有效引导检索(ch08, p264)。擅长处理语义鸿沟,专业领域查询效果显著。

- 扩展框架(ch08, p263-266):`enable_mqe`/`enable_hyde` 参数选择启用;机制"扩展-检索-合并"三步;`candidate_pool_multiplier`(默认 4)扩大候选池并智能去重。选型建议:一般查询用 MQE;专业领域查询 MQE+HyDE;性能敏感场景只用基础检索或仅 MQE(ch08, p266)。

**Hybrid Search(混合检索)**(个人助手, p10):`最终得分 = α×向量语义得分 + (1-α)×BM25 关键词得分`;纯向量对专有名词(如 AgentLoop、McpService)效果差,BM25 可精确命中。

**Re-ranking(重排)**(个人助手, p10):检索 Top-50 → Cross-Encoder 精排 → 取 Top-5;**生产中 re-ranking 几乎是标配,精度提升 10-30%**。

**Query Transformation**(个人助手, p10):Query Rewriting / Decomposition / HyDE / Multi-query。

### 评估:RAGAS

四指标(个人助手, p11):**Faithfulness**(回答忠于检索内容)、**Answer Relevancy**、**Context Precision**、**Context Recall**。

### Self-RAG / CRAG(模块化进阶)

(个人助手, p10-11)

- **Self-RAG**:生成过程中自我评估是否需要检索、生成是否忠实于检索内容。
- **CRAG**:检索结果质量评估——Correct(用)/ Incorrect(丢弃,改用 Web Search)/ Ambiguous(两者都用),显著减少幻觉。

## 跨资料对比 / 矛盾点

- **RAG 与记忆同源**:HelloAgents 中记忆系统与 RAG 复用同一套嵌入服务与向量库(Qdrant 命名空间隔离),长期记忆(语义记忆)本质就是一种 RAG(ch08, p232-234)。详见 [agent-memory.md](./agent-memory.md)。
- **RAG 的"退潮"争议**:范式演进长文指出长期知识记忆正从"纯 RAG/向量数据库"向"文件系统 + Obsidian 知识库"回归,认为个人/中小场景下文件系统更可控易读,RAG 在海量知识场景才不可替代(范式演进, p7-8)。这与 HelloAgents 重度依赖向量检索的立场形成张力——非真矛盾,而是**场景分层**:个人助手用有界文件,企业海量知识用 RAG,混合架构折中。详见 [agent-memory.md](./agent-memory.md) 的"文件式记忆 vs 向量检索之争"。
- **召回 vs 精确度的次序**:ch09 压缩整合给出口诀"先优化召回再优化精确度"(ch09, p280),与 RAG 中"MQE 先扩召回、Re-rank 再提精度"的管道次序一致——是同一工程哲学在不同模块的体现。
- **量化数据无冲突**:MQE 召回 +30-50%(ch08, p271)与 Re-rank 精度 +10-30%(个人助手, p10)分别来自两份资料、针对不同环节,可叠加理解。

## 相关页面

- [agent-memory.md](./agent-memory.md) —— 记忆与 RAG 同源;文件式记忆 vs 向量检索之争
- [context-engineering.md](./context-engineering.md) —— 检索结果作为上下文来源、JIT 检索
- [tool-use.md](./tool-use.md) —— Agentic RAG 把检索封装为工具
- 实体:[vector-databases.md](../entities/vector-databases.md)、[hello-agents.md](../entities/hello-agents.md)
- 来源:[ch08 记忆与 RAG](../sources/hello-agents/ch08-memory-and-rag.md)、[个人助手实践长文](../sources/agent-from-scratch-personal-assistant.md)、[Agent 范式演变](../sources/agent-paradigm-evolution.md)
