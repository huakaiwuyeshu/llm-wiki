# Agent 记忆系统(Agent Memory)

> TL;DR:LLM 本身无状态,记忆系统负责"在有限上下文窗口里为模型提供最相关的历史信息"。两条主线:① HelloAgents 从认知科学出发设计**四类记忆**(Working/Episodic/Semantic/Perceptual),用高度同构的评分公式(都含 `0.8 + importance×0.4` 重要性权重项)做检索;② 个人助手长文给出工程演进路线——记忆 → 用户画像 → Skill 的 **L1-L3** 跃迁,以及一个反直觉但经验证的结论:**个人助手场景下,几千字符的有界文件记忆往往比复杂向量检索更实用**。2026 年的大趋势是长期记忆从"向量数据库主导"向"文件系统主导"回归。

## 概念定义

记忆系统解决 LLM 的根本局限:**无状态导致对话遗忘**(每次调用都是独立无关联计算,带来上下文丢失、个性化缺失、一致性问题)(ch08, p231)。

核心问题:**如何在有限上下文窗口中为模型提供最相关的历史信息**(个人助手, p3)。

### 短期 vs 长期(经典二分)

- **短期记忆**:会话上下文、任务处理状态;核心挑战从"存储"转向"管理"与"压缩"(个人助手, p3;范式演进, p7)。其窗口管理详见 [context-compression.md](./context-compression.md)。
- **长期记忆**:事件历史、抽象知识;四个设计决策——**存什么 / 何时存 / 如何取 / 如何更新**(个人助手, p4)。

### 认知科学三层模型(HelloAgents 的理论根)

人类记忆分三层(ch08, p230):感觉记忆(0.5-3 秒)、工作记忆(15-30 秒,容量 **7±2 个项目**)、长期记忆(可达终生)。长期记忆又分程序性(技能/习惯)与陈述性(语义记忆=一般知识、情景记忆=个人经历)。记忆形成五阶段:**编码 → 存储 → 检索 → 整合(短转长)→ 遗忘**(ch08, p236)。

## 关键机制

### 四类记忆及评分公式(HelloAgents)

记忆和 RAG 都被封装为**标准工具**(memory_tool / rag_tool)而非新 Agent 类(ch08, p235)。MemoryTool 统一入口 `execute(action, **kwargs)`,支持 9 种操作:add / search / summary / stats / update / remove / forget / consolidate / clear_all(ch08, p239)。默认启用 working/episodic/semantic,perceptual 默认关闭(ch08, p244)。

| 记忆类型 | 定位 | 存储方案 | 评分公式 |
|---|---|---|---|
| **WorkingMemory** | 短期,当前对话上下文,容量默认 50,会话结束清理 | 纯内存 + TTL(默认 60 分钟) | `(向量相似度×0.7 + 关键词×0.3) × 时间衰减 × (0.8 + 重要性×0.4)` |
| **EpisodicMemory** | 长期,具体交互事件/经历,按时间序列回顾,"复盘"基础 | SQLite + Qdrant 混合 | `(向量相似度×0.8 + 时间近因性×0.2) × (0.8 + 重要性×0.4)` |
| **SemanticMemory** | 长期,抽象知识/概念/规则(偏好、领域知识),关联推理核心 | Neo4j 图 + Qdrant,spaCy 抽实体关系建图谱 | `(向量相似度×0.7 + 图相似度×0.3) × (0.8 + 重要性×0.4)` |
| **PerceptualMemory** | 多模态(图像/音频),跨模态检索 | 按模态分离向量集合,CLIP/CLAP 编码 | `(向量相似度×0.8 + 时间近因性×0.2) × (0.8 + 重要性×0.4)` |

(ch08, p246-253)

- **重要性权重统一为 [0.8, 1.2]** 区间(即 `0.8 + importance×0.4`),目的是"避免重要性过度影响相似度排序"(ch08, p251)。四公式高度同构,区别只在相似度来源权重与时间项。
- **时间近因性指数衰减**:`recency_score = exp(-0.1 × age_hours / 24)`,下限 0.1,24 小时内保持高分(ch08, p253)。此公式在第九章 ContextBuilder 的 `_calculate_recency` 中复用(见 [context-engineering.md](./context-engineering.md))。
- 关键参数:add 的 `importance` 默认 0.5;search 的 `min_importance` 默认 0.1;**consolidate** 默认把 importance > **0.7** 的工作记忆转情景记忆,episodic→semantic 阈值 0.8(ch08, p243-244);**forget** 三策略——importance_based(阈值 0.1)、time_based(默认 30 天)、capacity_based(ch08, p242-243)。

### 记忆 → 用户画像 → Skill 的 L1-L3 演进(个人助手)

三个递进学习层次(个人助手, p4-8):

- **L1 记住事实**:feedback/user 类型记忆。**被动**——只有被检索到才生效,可能语义不匹配而漏检。
- **L2 总结规则**:记忆聚合 → 行为约束注入 system prompt。**半主动**——每次生效但只是约束、非流程。
- **L3 形成技能**:规则 + 流程 + 触发条件 = 自动执行能力。**全自动**——匹配触发条件 + 完整执行流程 + 按需加载工具。

核心洞察(金句):**"记忆是被动的(遇到才回忆),而技能是主动的(匹配条件自动触发)"**(个人助手, p5)。从记忆到技能是从"被提醒才想起"变成"条件反射式执行"。

转化链路四阶段(个人助手, p5-6):Phase1 记忆积累(feedback 带 Why + How to apply)→ Phase2 模式识别(同主题达阈值后聚类)→ Phase3 技能生成(自动生成 SKILL.md:name/trigger/rules/workflow)→ Phase4 自动应用。两种路径:Agent 自主转化(Claude Code 方向,透明可控需用户确认)vs 系统自动转化(Mem0 + SOP 引擎,全自动但可能过度生成需置信度过滤)(个人助手, p8)。Skill 详见 [agent-skills.md](./agent-skills.md)。

### 长期记忆向文件系统回归(2026 趋势)

范式演进长文判断:长期记忆从"向量数据库主导"向"文件系统主导"回归(范式演进, p7-8),细分两子方向:

- **事项型记忆(Episodic)**:用户偏好、历史行为、每日待办等动态"事实",OpenClaw、Hermes 等倾向用文件系统记录(生成 MEMORY.md 或每日 Memory 日志),比向量检索**更可控、更易读**,Agent 可直接读取并理解时间序列上的状态变化。
- **知识型记忆(Semantic)**:随 Karpathy 的 LLM-Wiki、GBrain 等本地化知识库理念普及,传统纯 RAG 正被**本地文件系统 + Obsidian** 补充甚至替代。
- 限制与混合方案:企业级海量知识场景下,仅"文件系统即记忆 + grep"容易不准确,需搭配 QMD/SQLite 轻量向量检索,更复杂场景需企业级向量检索——本质是"**文件系统化沉淀 + 向量检索混合管理**"。

### 结构化笔记作为"上下文外记忆"(HelloAgents 工程落地)

ch09 把"结构化笔记"列为长时程三策略之一:以固定频率将关键信息写入上下文外的持久化存储,按需拉回(ch09, p279-280)。NoteTool 用 Markdown + YAML 文件(文件名即 ID,维护 `notes_index.json` 索引),与 MemoryTool 互补——后者管对话式记忆,前者管"项目式任务长期追踪",优势是版本友好(纯文本天然支持 Git)、低开销(无需数据库)(ch09, p293-296)。相关性排序:**blocker > action > conclusion**(ch09, p308)。

## 跨资料对比 / 矛盾点 ★ 文件式记忆 vs 向量检索之争

这是四份资料交汇最密集、也最值得显式综合的一点:

- **个人助手长文(实战派)**:**"对于个人助手场景,几千字符的有界文件记忆往往比复杂的向量检索系统更实用——这是一个反直觉但经过验证的结论"**(个人助手, p8)。其项目实现就是三个有界文件:`MEMORY.md`(2200 字符,环境事实/项目约定)、`USER.md`(1375 字符,用户画像/偏好)、`db`(不限,会话历史)(个人助手, p43)。关键经验:分类要清晰、**安全要前置(写入时扫描而非读取时)**、演进要有梯度。记忆系统核心价值"不在于能存多少,而在于能否减少用户的重复表达"(个人助手, p8)。
- **范式演进长文(趋势派)**:独立地得出同向结论——长期记忆正从向量数据库"回归"文件系统,因为文件**更可控、更易读、可解释**(范式演进, p7-8)。两份阿里来源在此呼应:有界文件 + 清晰分类,在个人/中小场景胜过向量检索。
- **HelloAgents(教材派/重型方案)**:走的是另一条路——四类记忆全部以向量库(Qdrant)+ 图库(Neo4j)+ 文档库(SQLite)为后端,评分公式精细(ch08, p246-253)。这与前两者**表面矛盾**:一边说"文件比向量实用",一边重度依赖向量+图。
- **如何调和(非真矛盾,场景分层)**:三方其实在不同场景下都自洽——
  - 个人/中小场景、强调可读可控可演进 → 有界文件记忆(个人助手、范式演进)。
  - 企业级海量知识、需精准语义召回 → 向量 + 图重型方案(HelloAgents);范式演进长文也承认"企业级海量知识场景需企业级向量检索"(范式演进, p8)。
  - 范式演进长文给出的**混合架构**("文件系统沉淀 + 向量检索混合")正是两端的折中,也是 ch09 "结构化笔记 + 可选向量索引"的方向(ch09, p333 预告可集成 RAGTool 向量索引)。
- **结论**:不是"文件 vs 向量"二选一,而是按知识规模、可读性需求、召回精度要求分层选型;个人助手场景下先用有界文件,海量知识再上向量/图。

其他对比:

- **记忆类型命名**:HelloAgents 的 Episodic/Semantic 直接对应认知科学;个人助手长文的分类按"存什么"实用维度(环境事实/用户偏好/行为反馈/参考资料,个人助手 p4),两套分类可映射但粒度不同。
- **安全前置共识**:个人助手长文强调"写入时扫描"(scan_context_threats 通过才保存,个人助手 p44),对应记忆系统核心挑战之一"记忆注入攻击/记忆投毒"(个人助手, p8;详见 [agent-security.md](./agent-security.md))。

## 相关页面

- [context-engineering.md](./context-engineering.md) —— 记忆作为上下文来源、recency 公式复用
- [context-compression.md](./context-compression.md) —— 短期记忆/会话窗口的压缩
- [rag.md](./rag.md) —— 长期知识检索,与记忆同源(共用嵌入与向量库)
- [agent-skills.md](./agent-skills.md) —— L3 技能:记忆演进的终点
- [agent-security.md](./agent-security.md) —— 记忆注入/投毒与写入时安全扫描
- [agent-paradigm-stages.md](./agent-paradigm-stages.md) —— 长期记忆向文件系统回归的演进定位
- 实体:[vector-databases.md](../entities/vector-databases.md)、[hello-agents.md](../entities/hello-agents.md)
- 来源:[ch08 记忆与 RAG](../sources/hello-agents/ch08-memory-and-rag.md)、[个人助手实践长文](../sources/agent-from-scratch-personal-assistant.md)、[Agent 范式演变](../sources/agent-paradigm-evolution.md)、[ch09 上下文工程](../sources/hello-agents/ch09-context-engineering.md)
