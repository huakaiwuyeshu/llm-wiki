# Hello-Agents 第八章：记忆与检索(Memory & RAG)

TL;DR：本章为 HelloAgents 框架补上「记忆」这一关键能力,从认知科学(感觉/工作/长期记忆)出发,设计了四类记忆模块(Working/Episodic/Semantic/Perceptual)与统一的 MemoryManager,并把记忆和 RAG 都封装为标准工具(memory_tool、rag_tool)而非新 Agent 类;RAG 部分讲解了「五层七步」管道、MarkItDown 统一文档转换、Markdown 结构感知智能分块,以及 MQE/HyDE 两种高级检索策略,最后用一个基于 Gradio 的 PDF 智能学习助手把两者整合实战。

> 原文:sources/Hello-Agents-V1.0.2-20260210.pdf | 类型:教材 | 章节页码 p230-p276(第八章正文,p277 起为第九章) | ingest 日期 2026-06-10
> 配套安装:`pip install "hello-agents[all]==0.2.0"` + `spacy download zh_core_web_sm / en_core_web_sm`(p233)

---

## 8.1 从认知科学到智能体记忆(p230-235)

### 8.1.1 人类记忆系统的启发(p230)
认知心理学经典分层模型(图8.1)为智能体记忆提供理论框架,人类记忆分三层:
1. **感觉记忆(Sensory Memory)**:持续 0.5-3 秒,容量巨大,暂存感官信息。
2. **工作记忆(Working Memory)**:持续 15-30 秒,容量有限(**7±2 个项目**),负责当前任务信息处理。
3. **长期记忆(Long-term Memory)**:持续可达终生,容量几乎无限,进一步分为:
   - 程序性记忆:技能和习惯(如骑自行车)
   - 陈述性记忆:可用语言表达的知识,又分语义记忆(一般知识/概念,如"巴黎是法国首都")和情景记忆(个人经历/事件,如"昨天的会议内容")

### 8.1.2 为何智能体需要记忆与 RAG(p231)
LLM 的两个根本局限:
- **局限一:无状态导致的对话遗忘** —— LLM 每次调用都是独立无关联计算,带来:上下文丢失、个性化缺失、学习能力受限、一致性问题(多轮对话前后矛盾)。→ 引入记忆系统。
- **局限二:内置知识的局限性** —— 知识静态有限,带来:知识时效性(训练截止点)、专业领域深度不足、事实准确性(幻觉)、可解释性缺失。→ RAG 在生成前先从外部知识库(文档/数据库/API)检索相关信息作为上下文。

### 8.1.3 系统架构设计(p232-233,图8.2)
关键设计决策:**记忆和 RAG 都被设计为两个独立的工具** —— `memory_tool` 负责存储/维护对话交互信息,`rag_tool` 负责从用户知识库检索上下文(并可将重要结果自动存入记忆)。

记忆系统四层架构:
- **基础设施层**:MemoryManager(统一调度)、MemoryItem(标准化记忆项)、MemoryConfig(配置)、BaseMemory(基类)
- **记忆类型层**:WorkingMemory、EpisodicMemory、SemanticMemory、PerceptualMemory
- **存储后端层**:QdrantVectorStore(向量)、Neo4jGraphStore(图)、SQLiteDocumentStore(文档)
- **嵌入服务层**:DashScopeEmbedding(通义千问云端API)、LocalTransformerEmbedding(离线)、TFIDFEmbedding(轻量兜底)

RAG 系统分层:文档处理层(DocumentProcessor/Document/Pipeline)、嵌入表示层(复用记忆系统嵌入)、向量存储层(Qdrant 命名空间隔离)、智能问答层(多策略检索:向量+MQE+HyDE,上下文构建,LLM增强生成)。

### 8.1.4 工程配置(p233-234)
- 向量库 Qdrant(默认 `QDRANT_VECTOR_SIZE=384`、`QDRANT_DISTANCE=cosine`),图库 Neo4j(Aura 云服务),Embedding 首选百炼平台。
- 学习路径建议:**先体验(pip安装+跑示例),后实现(从零实现每个组件)**。

---

## 8.2 记忆系统:让智能体拥有记忆(p235-247)

### 8.2.1 记忆系统工作流程(p236,图8.3/8.4)
模仿认知科学,记忆形成五阶段:**编码(Encoding)→ 存储(Storage)→ 检索(Retrieval)→ 整合(Consolidation,短期转长期)→ 遗忘(Forgetting,删除不重要/过时信息)**。

四种记忆模块定位(p237):
- **WorkingMemory**:智能体"短期记忆",存当前对话上下文;容量有意限制(默认 50 条),生命周期与单个会话绑定,会话结束自动清理。
- **EpisodicMemory**:长期存储具体交互事件和学习经历,含丰富上下文,支持按时间序列/主题回顾,是"复盘"基础。
- **SemanticMemory**:存抽象知识/概念/规则(用户偏好、长期指令、领域知识),高持久性,是"知识体系"和关联推理核心。
- **PerceptualMemory**:处理图像/音频等多模态信息,支持跨模态检索,生命周期按重要性和存储空间动态管理。

### 8.2.3 MemoryTool 详解(p239-244)
采用"统一入口,分发处理"模式:`execute(action, **kwargs)`,支持 9 种操作:`add / search / summary / stats / update / remove / forget / consolidate / clear_all`。

- **add 操作**(p239-241):模拟人类编码过程。`importance` 参数默认 **0.5**,范围 0.0-1.0,标记记忆重要程度。自动管理 session_id、推断多模态文件类型、补充时间戳/会话元数据。四种类型用法示例(working/episodic/semantic/perceptual)。
- **search 操作**(p241-242):支持单复数参数(memory_type/memory_types),`min_importance` 默认 **0.1** 过滤低质量记忆。
- **forget 操作**(p242-243):三种策略 —— `importance_based`(删低于阈值,默认 threshold 0.1)、`time_based`(删超过 max_age_days,默认 30 天)、`capacity_based`(接近上限删最不重要)。
- **consolidate 操作**(p243-244):借鉴神经科学记忆固化,默认将 importance > **0.7** 的工作记忆转为情景记忆;可继续 episodic→semantic(阈值 0.8)。

### 8.2.4 MemoryManager(p244-245)
分层设计体现关注点分离:MemoryTool 专注用户接口/参数,MemoryManager 负责核心管理逻辑。MemoryTool 初始化时创建 MemoryManager,默认启用 `["working", "episodic", "semantic"]`(perceptual 默认关闭)。MemoryManager 持有 MemoryStore、MemoryRetriever 及各类型记忆实例。

### 8.2.5 四种记忆类型的实现与评分公式(p246-253)★核心

| 记忆类型 | 存储方案 | 评分公式 |
|---|---|---|
| **WorkingMemory**(p246) | 纯内存 + TTL(默认 60 分钟)自动清理,容量默认 50 | `(向量相似度×0.7 + 关键词×0.3) × 时间衰减 × (0.8 + 重要性×0.4)`;混合检索 TF-IDF 向量化+关键词匹配,失败回退关键词 |
| **EpisodicMemory**(p247-248) | SQLite + Qdrant 混合(SQLite 结构化查询,Qdrant 向量) | `(向量相似度×0.8 + 时间近因性×0.2) × (0.8 + 重要性×0.4)`;先结构化预过滤再向量检索 |
| **SemanticMemory**(p248-251) | Neo4j 图数据库 + Qdrant 向量;用 HuggingFace 中文预训练模型嵌入;spaCy NLP 自动提取实体和关系构建知识图谱 | `(向量相似度×0.7 + 图相似度×0.3) × (0.8 + 重要性×0.4)`;混合排序=向量检索(语义)+图检索(关系推理) |
| **PerceptualMemory**(p251-253) | 按模态分离的向量集合(perceptual_text/image/audio),CLIP 图像编码、CLAP 音频编码 | `(向量相似度×0.8 + 时间近因性×0.2) × (0.8 + 重要性×0.4)`;支持同模态与跨模态检索 |

- **重要性权重统一为 [0.8, 1.2]** 区间(即 `0.8 + importance×0.4`),避免重要性过度影响相似度排序。
- **时间近因性指数衰减模型**(p253):`recency_score = exp(-0.1 × age_hours / 24)`,下限 0.1,24 小时内保持高分;模拟人类遗忘曲线。

---

## 8.3 RAG 系统:知识检索增强(p253-267)

### 8.3.1 RAG 基础知识(p253-254)
RAG = **检索(从知识库查相关内容)+ 增强(融入提示词)+ 生成(输出兼具准确性与透明度的答案)**。

发展三阶段:
1. **朴素 RAG(Naive RAG, 2020-2021)**:"检索-读取"(Retrieve-Read)模式,关键词匹配(TF-IDF/BM25),检索内容直接拼接到提示词。
2. **高级 RAG(Advanced RAG, 2022-2023)**:转向稠密嵌入(Dense Embedding)语义检索,引入查询重写、文档分块、重排序等优化。
3. **模块化 RAG(Modular RAG, 2023-至今)**:可插拔/可组合独立模块;混合检索、多查询扩展、假设性文档嵌入;生成端思维链推理、自我反思与修正。

### 8.3.2-8.3.4 系统工作原理与架构(p254-259,图8.5)
两大流程:数据处理流程(原始文档→预处理→智能分块→元数据提取→向量化→Qdrant 存储)和查询生成流程(查询类型判断→查询增强 HyDE/MQE/基础→向量化→相似度搜索→候选重排→Top-K→上下文构建→LLM 生成→后处理校验)。

**核心架构"五层七步"**(p257):用户层(RAGTool 统一接口)→应用层(智能问答/搜索/管理)→处理层(解析/分块/向量化)→存储层(向量库/文档存储)→基础层(嵌入模型/LLM/数据库)。优势:每层可独立优化替换(如嵌入模型从 sentence-transformers 切到百炼 API 不影响上层)。

整个处理流程:**任意格式文档 → MarkItDown 转换 → Markdown 文本 → 智能分块 → 向量化 → 存储检索**。

- **多模态文档载入**(p258):**MarkItDown** 是微软开源的通用文档转换工具,作为统一转换引擎,把 PDF/Word/Excel/PPT/图片(OCR)/音频(转录)/文本/代码统一转为 Markdown。PDF 走增强处理 `_enhanced_pdf_processing`。
- **智能分块策略**(p259-262):利用 Markdown 标题层次(#/##/###)做语义分割,保持结构完整性;基于 Token 数量分块,带重叠策略(overlap)保持上下文连续。**Token 估算算法**支持中英文混合:CJK 字符按 1 token,非 CJK 按空白分词;`_is_cjk` 判断 Unicode 范围(0x4E00-0x9FFF 等)。
- **统一嵌入与向量存储**(p262-263):默认维度 384,百炼 API 优先,回退 sentence-transformers(all-MiniLM-L6-v2),再回退 TF-IDF;批量编码 batch_size=64,带维度检查/调整和重试机制。

### 8.3.5 高级检索策略(p263-266)★核心
三种互补策略解决"用户查询表述与文档实际用词存在差异"的问题:
- **MQE(多查询扩展,Multi-Query Expansion)**:用 LLM 生成语义等价的多样化查询(如"如何学习Python"→"Python入门教程"/"Python学习方法"),并行执行后合并结果,提升召回率。**实测提升召回率 30%-50%**(p271)。擅长处理用词多样性。
- **HyDE(假设文档嵌入,Hypothetical Document Embeddings)**:核心是"用答案找答案"。问题(疑问句)和答案(陈述句)语义空间分布有差异,HyDE 让 LLM 先生成假设性答案段落,再用该段落去检索真实文档,缩小查询与文档的语义鸿沟。擅长处理语义鸿沟,专业领域查询效果显著。
- **扩展检索框架**:用 `enable_mqe`/`enable_hyde` 参数选择启用;核心机制"扩展-检索-合并"三步;`candidate_pool_multiplier`(默认 4)扩大候选池,智能去重避免重复。

选型建议:一般查询启用 MQE;专业领域查询同时启用 MQE+HyDE;性能敏感场景只用基础检索或仅 MQE。

---

## 8.4 实战:构建智能文档问答助手(p267-274)

基于 Datawhale 的 **Happy-LLM**(Happy-LLM-0727.pdf)构建基于 **Gradio** 的 Web 应用,整合 RAGTool + MemoryTool。

核心类 `PDFLearningAssistant`(p267-273):
- **初始化**:`user_id` 实现用户级记忆隔离;`rag_namespace=f"pdf_{user_id}"` 实现知识库命名空间隔离;`session_id` 追踪单次学习会话;`stats` 字典记录学习指标。
- **load_document**(p268-270):一行 `rag_tool.execute("add_document", chunk_size=1000, chunk_overlap=200)` 触发完整流程;加载后用 episodic 记忆记录(importance=0.9,event_type="document_loaded")。
- **ask**(p270-271):提问先记 working 记忆(importance=0.6),用 RAG 高级检索(MQE+HyDE)获取答案,再记 episodic 记忆(importance=0.7)。
- **其他功能**(p271-273):add_note(存 semantic 记忆,importance=0.8)、recall(检索学习历程)、get_stats、generate_report(生成 JSON 学习报告)。

五步闭环(图8.6):①PDF处理→②RAG检索问答→③记忆系统→④集成助手(智能路由)→⑤学习报告。
运行效果(p273-274,图8.7-8.10):主页面初始化助手→加载 PDF(耗时约 30.4 秒)→智能问答(返回参考来源+相似度,如 transformer_architecture.md 相似度 0.806)→学习笔记→学习统计/报告。完整代码在 `code/chapter8/11_Q&A_Assistant.py`,访问 `http://localhost:7860`。

---

## 8.5 本章总结(p274-276,图8.11思维导图)
成功为 HelloAgents 增加记忆系统和 RAG 系统两大核心能力。思维导图围绕:记忆系统重构(四种记忆类型、统一接口、认知科学启发、自适应遗忘)、RAG系统升级(统一管道、多策略融合、多格式文档处理、命名空间隔离)、专业数据库集成(Qdrant/Neo4j/SQLite)、未来发展方向(多模态融合、个性化服务、分布式架构、企业级应用)。
预告:第九章讲上下文工程,进一步提升对话质量。

## 金句/洞见
- "记忆和 RAG 不是新建 Agent 类,而是封装为标准工具" —— 遵循第七章设计原则,工具化降低耦合。(p235)
- 重要性权重统一限制在 [0.8, 1.2] —— "避免重要性过度影响相似度排序,保持检索准确性"。(p251)
- HyDE 的核心洞察:"用答案找答案",即使假设答案不完全正确,其关键术语/概念/表述风格也能有效引导检索。(p264)
- 遗忘是"最具认知科学色彩的功能",模拟人类大脑的选择性遗忘。(p242)

## 关联与矛盾
- 与第七章(框架构建/工具系统)直接衔接:记忆/RAG 复用 BaseTool 接口、ToolRegistry。
- 时间衰减模型(exp(-0.1×age/24))在 PerceptualMemory 和第九章 ContextBuilder 的 `_calculate_recency` 中复用,公式一致。
- 四种记忆类型的评分公式高度同构(都含 `0.8 + importance×0.4` 重要性权重项),区别在相似度来源权重和时间项。
