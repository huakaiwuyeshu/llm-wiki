# 上下文工程(Context Engineering)

> TL;DR:上下文工程是提示工程(Prompt Engineering)的自然演进——焦点从"找对提示词句式"升级为"在每次模型调用前,以可复用、可度量、可演进的方式,把最优 token 集合拼装进有限的上下文窗口"。核心矛盾是 LLM 有一笔随长度递减的「注意力预算」,要对抗「上下文腐蚀(context rot)」;HelloAgents 用 GSSC 四阶段流水线(Gather-Select-Structure-Compress)落地,工程信条是「信息充分但紧致」「最小必要信息集」。

## 概念定义

**上下文(Context)** = 对 LLM 采样时所包含的那一组 tokens(ch09, p277)。**上下文工程**就是在 LLM 固有约束下,优化这些 tokens 效用的工程实践——它要求"在上下文中思考":每次调用都审视 LLM 可见的整体状态,预判它可能诱发的行为(ch09, p278)。

它涵盖一切进入上下文窗口的内容:系统指令、工具定义、MCP、外部数据、消息历史、检索结果等(ch09, p277-278)。

### 上下文工程 vs 提示工程

| 维度 | 提示工程(Prompt Engineering) | 上下文工程(Context Engineering) |
|---|---|---|
| 关注点 | 如何编写/组织指令(尤其系统提示) | 推理阶段策划与维护"最优信息集合(tokens)" |
| 时间范围 | 调用前的一次性写作 | 循环运行中周期性提炼、动态维护 |
| 对象 | 提示词文本 | 系统指令 + 工具 + MCP + 外部数据 + 消息历史 |

(ch09, 图9.1, p277-278)提示工程是上下文工程的子集;后者是前者的"自然演进"。循环运行的智能体不断产生下一轮可能相关的数据,必须周期性提炼;"艺与术"在于从持续扩张的"候选信息宇宙"中甄别哪些应进入有限窗口(ch09, p278)。

这与范式演进长文的判断一致:Prompt 维度从"单体大 System Prompt"演进到"System Prompt + 渐进式加载上下文文件",本质是**上下文的组织形式发生了变化**,实现"动静分离"——System Prompt 保持极度稳定,易变的业务逻辑/领域知识用结构化 Markdown 渐进式披露(范式演进, p5-6)。

## 关键机制

### 上下文腐蚀(context rot)与注意力预算

- **上下文腐蚀**:针堆找针(needle-in-a-haystack)基准揭示——随上下文 tokens 增加,模型从上下文准确回忆信息的能力反而下降。不同模型退化曲线不同,但现象普遍存在(ch09, p278)。
- **注意力预算(attention budget)**:上下文必须被视作**有限资源,边际收益递减**。LLM 每新增一个 token 都消耗一部分注意力预算(ch09, p278)。
- 三个根因(ch09, p278):① Transformer 两两注意力是 O(n²) 关系,上下文越长建模能力被"拉薄";② 训练数据中短序列更常见,模型对"全上下文依赖"经验少;③ 位置编码插值适配长序列会牺牲位置精度。
- 整体是**性能梯度而非悬崖式崩溃**(ch09, p278)。

### 有效上下文的"解剖学"

目标:用尽可能少但高信号密度的 tokens,最大化期望结果概率(ch09, p278-279)。逐组件工程化:

- **系统提示(System Prompt)**:语言清晰直白,信息层级"刚刚好"。两极误区——**过度硬编码**(写复杂脆弱的 if-else,维护成本高易碎)和**过于空泛**(只给宏观目标缺具体信号)。建议分区组织(`<background_information>`、工具指引、输出描述等)用 XML/Markdown 分隔,追求"最小必要信息集"(注意:"最小" ≠ "最短")。
- **工具(Tools)**:定义智能体与信息/行动空间的契约,须返回 token 友好信息。要求职责单一、低重叠、接口语义清晰、对错误鲁棒、入参描述无歧义。常见失败模式是"臃肿工具集",应甄别**最小可行工具集(MVTS, Minimal Viable Tool Set)**。金句:"如果人类工程师都说不准用哪个工具,别指望智能体做得更好"(ch09, p278)。
- **示例(Few-shot)**:始终推荐提供,但不要罗列所有边界条件,精挑多样典型示例。"好的示例胜过千言万语"(ch09, p279)。
- 总指导思想:**信息充分但紧致**(ch09, p279)。

### 检索范式:从预加载到 JIT

- 工程实践从"推理前一次性检索(embedding 检索)"过渡到"**及时(Just-in-time, JIT)上下文**":不预先加载全部,而是维护轻量引用(文件路径、查询、URL),运行时按需动态加载(ch09, p279)。认知类比:人不死记硬背全部信息,而是用文件系统、收件箱、书签等外部索引按需提取(ch09, p279)。
- **渐进式披露(progressive disclosure)**:每一步交互产生新上下文,反过来指导下一步决策(文件大小暗示复杂度、命名暗示用途、时间戳暗示相关性);智能体按层构建理解,只在工作记忆保留"当前必要子集"(ch09, p279)。
- **混合策略**常更有效:前置加载少量高价值上下文保证速度(如 README/指南),再允许按需自主探索(提供 glob/grep 原语)。权衡:运行时探索比预计算检索慢,需要有"主见"的工程设计(ch09, p279)。

### GSSC 四阶段流水线

HelloAgents 的 `ContextBuilder` 把上下文构建抽象为可复用的 Gather-Select-Structure-Compress 四阶段流水线(ch09, p280-289)。设计目标四点:统一入口、稳定形态(固定骨架模板便于调试/A-B 测试)、预算守护(token 预算内保留高价值信息 + 兜底压缩)、最小规则(只用相关性 + 新近性两维评分)。

核心配置(`ContextConfig`, ch09, p281-282):`max_tokens=3000`、`reserve_ratio=0.2`(为系统指令预留)、`min_relevance=0.1`、`recency_weight=0.3`、`relevance_weight=0.7`(断言两者之和必须 = 1.0)。

1. **Gather(多源汇集)**(ch09, p282-284):汇集五类源——① 系统指令(relevance=1.0,最高优先级,不参与评分)② 记忆系统检索(memory_tool, limit=10, min_importance=0.3)③ RAG 检索(rag_tool, limit=5, min_score=0.3)④ 对话历史(默认保留最近 5 条,relevance=0.6)⑤ 自定义信息包。每个外部源用 try-except 包裹,单源失败不影响整体。
2. **Select(智能选择)**(ch09, p284-286):综合分数 `combined_score = relevance_weight × relevance + recency_weight × recency`,过滤低于 `min_relevance`,按分降序后**贪心选择**填充至 token 上限。相关性用 **Jaccard 相似度**(关键词重叠,交集/并集,生产可换向量相似度);新近性用指数衰减 `exp(-0.1 × age_hours / 24)`,钳制 [0.1, 1.0](与第八章感知记忆公式一致,见 [agent-memory.md](./agent-memory.md))。
3. **Structure(结构化输出)**(ch09, p286-288):按类型分组成固定模板分区——`[Role & Policies]`(系统指令)、`[Task]`(用户查询)、`[Evidence]`(RAG/knowledge 证据)、`[Context]`(对话历史 + 记忆)、`[Output]`(输出要求)。优势:可读性、可调试性、可扩展性。
4. **Compress(兜底压缩)**(ch09, p288-289):超 `max_tokens` 时**分区压缩保持结构完整性**,逐区完整保留,不够时部分保留(至少 50 tokens 才截断,加"[...内容已压缩...]")。`_count_tokens` 简单估算:中文 1 字符 ≈ 1 token,英文 1 单词 ≈ 1.3 tokens(生产应精确 tokenizer)。

> 说明:GSSC 的 Compress 是"调用前拼装时"的兜底裁剪;面向超长对话的「压缩整合(Compaction)」与「三步三级降级」是另一套机制,详见 [context-compression.md](./context-compression.md)。

## 跨资料对比 / 矛盾点

- **同一思想的两条独立路线**:ch09 从认知科学与 Anthropic 官方博客《Effective Context Engineering for AI Agents》出发给出理论框架(GSSC、注意力预算、JIT);个人助手长文从生产工程出发给出 Parlant 的定义"getting the right context, no more and no less, into the prompt at the right time",并提出**上下文窄化(Context Narrowing)**——按当前对话主题只注入相关规则/知识/工具(个人助手, p27)。两者高度同构:都是"从事后压缩走向事前精选"。
- **"渐进式披露"在三份资料中复用**:ch09 把它用于上下文检索;个人助手长文与范式演进长文把同一术语(Progressive Disclosure)用于 Skill 的按需加载(见 [agent-skills.md](./agent-skills.md))。本质都是"平时只看摘要,按需才展开"。
- **触发阈值不一致(非矛盾,层次不同)**:ch09 的 GSSC `max_tokens=3000` 是单次拼装预算;个人助手长文的压缩触发在 75% 窗口(个人助手, p35);Harness 综述给出 60/70/80/90% 四阶段(个人助手, p28)。三者作用于不同层次,不冲突——详见 [context-compression.md](./context-compression.md)。

## 相关页面

- [context-compression.md](./context-compression.md) —— 超长对话的压缩整合、三步压缩、三级降级、长时程三策略
- [agent-memory.md](./agent-memory.md) —— 结构化笔记/记忆作为"上下文外持久存储"
- [rag.md](./rag.md) —— 检索作为上下文的一个来源
- [agent-skills.md](./agent-skills.md) —— 渐进式披露在能力加载上的应用
- [harness.md](./harness.md) —— Context Engineering 作为 Harness 子系统
- [agent-paradigm-stages.md](./agent-paradigm-stages.md) —— Prompt 维度"动静分离"的演进定位
- 来源:[ch09 上下文工程](../sources/hello-agents/ch09-context-engineering.md)、[ch08 记忆与 RAG](../sources/hello-agents/ch08-memory-and-rag.md)、[个人助手实践长文](../sources/agent-from-scratch-personal-assistant.md)、[Agent 范式演变](../sources/agent-paradigm-evolution.md)
