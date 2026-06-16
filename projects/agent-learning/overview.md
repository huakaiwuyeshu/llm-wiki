# Agent 领域综述

一句话:本页是对所有已摄入资料的全局综合,随每次 ingest 持续修订。

---

## 什么是 Agent

**Agent = 能感知环境、自主决策并行动以达成目标的实体。** 自主性(Autonomy)是它与固定 Workflow 的本质分野。LLM Agent 把预训练模型当推理引擎,用 **Thought → Action → Observation** 循环把模糊的自然语言目标转成可执行步骤。

Agent 不是某种产品形态,而是一个循环——"想→做→看→再决定"。生产环境 90% 的场景用「ReAct 主循环 + 按需 Plan」,能不规划就不规划。

## 范式演进:形未变、神已变

Agent 范式有两条互补的演进叙事:

1. **阿里飞樯的四阶段**(时间轴,2023-2026):被动式 ReAct → Workflow Agent → 自主 Agent → 自进化 Agent
2. **手册/注解版的九阶段能力图**(能力补齐先后):LLM → 记忆 → RAG → Function Call/MCP → Agent Loop → Skill → Multi-Agent → Harness → Claw

核心论断:**「形未变、神已变」**——经典模块框架依旧(规划、记忆、工具、RAG),但每个模块的实现范式都被内核重构。底层思想:**通过工程化手段构建确定性,以承载模型不确定性。**

经典单智能体三范式:
- **ReAct**(边想边做、动态纠错,不确定性高时选)
- **Plan-and-Solve**(先规划后执行、结构稳定,路径确定时选)
- **Reflection**(执行-反思-优化迭代,质量要求极高时选)

## 核心能力模块

### 工具使用(Tool Use)
**决策-执行分离** 是设计原则:LLM 决定调什么,代码执行调用。演进路径:Function Call → MCP → CLI/Script;选型阈值看任务复杂度;格式错误率 5-10% 需工具容错三件套兜底。MCP 是当前协议标准,四类能力(Prompts/Resources/Tools/Sampling)。

### Skill
**Skill = SOP + 工具 + 资源**,是比单工具更高阶的复用单元。用 SKILL.md 定义,四阶段渐进式加载可节省 10 倍 token。生产选型信条:**Skill 为主、Workflow 兜底**——自主与控制的平衡点。

### 记忆(Memory)
LLM 无状态,记忆系统负责在有限窗口提供最相关历史。两条主线:
- **HelloAgents**:认知科学出发的四类记忆(Working/Episodic/Semantic/Perceptual),高度同构的评分公式
- **个人助手长文**:L1(记忆)→ L2(用户画像)→ L3(Skill)跃迁;反直觉结论:**个人助手场景,几千字符的有界文件记忆往往比复杂向量检索更实用**

2026 年大趋势:长期记忆从"向量数据库主导"向"文件系统主导"回归。

### RAG
**RAG = 检索 + 增强 + 生成**,弥补 LLM 知识静态、幻觉多的局限。三阶段演进:Naive(关键词)→ Advanced(稠密嵌入 + 查询重写/分块/重排)→ Modular(可插拔、混合检索、Self-RAG/CRAG)。核心优化:
- **MQE**(多查询嵌入,召回率 +30-50%)
- **HyDE**(用答案找答案)
- **Re-rank**(精度 +10-30%,生产几乎标配)

### 上下文工程(Context Engineering)
提示工程的自然演进——焦点从"找对句式"升级为"每次调用前,把最优 token 集合拼装进有限窗口"。核心矛盾:LLM 有笔随长度递减的「注意力预算」,要对抗「上下文腐蚀(context rot)」。HelloAgents 用 **GSSC 四阶段流水线**(Gather-Select-Structure-Compress)落地,信条:「信息充分但紧致」「最小必要信息集」。

**上下文压缩**:对话逼近窗口上限时,个人助手长文给出生产方案——75% 触发 → HEAD/TAIL 保护区 → 三步压缩(划保护区 → 物理修剪工具输出 → LLM 结构化摘要)→ 三级降级 → 防抖。

### 规划(Planning)
从早期依赖模型原生 CoT 的"提示词技巧"(易逻辑断层/死循环),演进为真正的"智能决策中枢"——结构化任务分解、Todo List、多步长程协同、子 Agent 动态构建。核心驱动力:**基座模型推理能力升级**。

### Multi-Agent
用专家分工 + 并行 + 上下文隔离破解单 Agent 三困境(窗口不够、专业不够、串行慢),但成本翻 N 倍。核心信条:**「不到必要不拆」**——SubAgent 即工具,需用四维资源控制防失控。

### 通信协议
三协议对比:**MCP**(模型-工具,Anthropic 主导,四类能力)、**A2A**(Agent 间异步消息,OpenAI 草案)、**ANP**(LangGraph 专用)。MCP 当前最成熟。

## 框架与运行时

### 框架设计哲学
四主流框架设计取向:
- **LangGraph**:状态图、显式控制、原生循环
- **AutoGen**:对话驱动、Conversable Agent
- **AgentScope**:消息驱动、工业级工程化
- **CAMEL**:角色扮演、Inception Prompting

分野:**涌现 vs 控制**。自建框架四理念(来自 HelloAgents 教学框架):LLM 是无状态函数、SimpleAgent 骨架、ReActAgent、ToolRegistry。**LangChain 批判**:过度抽象、学习曲线陡峭。

### Harness
包裹在 Agent Loop 外层的运行时保护框架,负责让 Agent "活得够久、跑得够稳"——是从「能跑」到「能用」的分水岭。包含:
- **可靠性**:错误三分类、指数退避+jitter、context_overflow 压缩重发、工具容错、deterministic-picker 代码兜底
- **安全**:间接提示注入防护(工具返回侧最危险)、Defense in Depth 三层、审计哈希链、凭证隔离

### Agentic RL
把 LLM 当**可学习的策略**,嵌入感知-决策-执行循环,用 RL 优化多步任务长期累积奖励——与单步后训练(PBRFT)的根本分野。实战路径:SFT → GRPO(去 Value Model、组内相对奖励)+ LoRA,在 GSM8K 上训 Qwen3-0.6B 数学推理智能体,准确率从 40-50% 提升到 60-70%。

## 落地与工程化

### 企业业务 Agent
不是"更会聊天的机器人",而是承接高频业务流程的**工作系统**。判断标准不是"回答得像不像",而是"能不能按流程稳定推进"。架构选型:**Workflow 负责边界,Agent 负责弹性**——不是越自主越好。由 Workflow、Schema+Validator、Skill、Task State、Memory、Audit、人工审核共同负责稳定、可控、可复盘。

### Agent-Oriented Infra(面向 Agent 的研发基础设施)
软件研发是"意图(不确定性)驱动 + 代码(确定性)沉淀"的进化体,Agent 把"意图→代码"循环从周/月级压到分钟级,这让为人设计的 developer infra(Git/CI/CD/CR 全部慢循环假设)系统性失配。必须按「可理解、可操作、可感知、可追溯」四层重建。

**核心结论:Agent 的自主程度不取决于它多聪明,而取决于 infra 提供了多强的安全护栏——Infra 的能力边界,就是 agent 的自主边界。**

## 开放问题与挑战

1. **Context Rot**:注意力预算随长度递减,长时程任务仍需更好的压缩/遗忘机制
2. **工具格式错误率**:5-10% 仍需工程容错兜底,未被底层模型能力完全解决
3. **安全:间接提示注入**:工具返回是最危险侧信道,防护需多层纵深
4. **成本**:Multi-Agent 成本翻 N 倍,"不到必要不拆" 是实战信条
5. **涌现 vs 控制**:框架设计哲学的根本矛盾,无银弹
6. **Infra 重建**:现有 DevOps/GitOps 为人设计,Agent-first 基础设施才刚起步

## 学习路径建议

1. **基础**:先理解 Agent 定义、Agent Loop、ReAct 范式
2. **能力**:工具使用 → Skill → 记忆/RAG → 上下文工程 → 规划
3. **框架**:选一个主流框架深入(LangGraph/AutoGen),理解设计哲学,或从零构建教学框架
4. **进阶**:Multi-Agent、Harness、可靠性工程、安全
5. **落地**:企业场景、Agent-Oriented Infra、评估与数据生成
6. **前沿**:Agentic RL、自进化 Agent

---

**最后更新**:2026-06-11(基于 27 份已摄入资料:Hello-Agents 全书 16 章 + 11 份外部 PDF/HTML)
