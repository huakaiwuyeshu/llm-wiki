# Agent 的定义

> TL;DR:智能体 = 能通过传感器感知环境、自主决策并通过执行器行动以达成目标的实体;**自主性 (Autonomy)** 是它与固定流程/Workflow 的分水岭。LLM agent 把预训练模型当推理引擎,用 Thought-Action-Observation 循环把模糊的自然语言目标转成可执行步骤。

## 一、经典定义与四要素

智能体是任何能通过**传感器 (Sensors)** 感知**环境 (Environment)**、并自主地通过**执行器 (Actuators)** 采取**行动 (Action)** 以达成特定目标的实体(ch01, p10)。四要素:

1. 环境 (Environment)
2. 传感器 (Sensors)
3. 执行器 (Actuators)
4. **自主性 (Autonomy)** —— 关键所在:不是被动响应刺激或执行预设指令,而是基于感知和内部状态**独立决策**(ch01, p10-12)。

描述任务环境用 **PEAS 模型**:Performance(性能度量)、Environment、Actuators、Sensors(ch01, p15)。

## 二、传统 5 类 agent(Russell & Norvig 演进阶梯)

源自《AI: A Modern Approach》,按内部决策架构递进(ch01, p10-12):

1. **Simple Reflex Agent(简单反射)**:条件-动作规则(如恒温器),无记忆无预测。
2. **Model-Based Reflex Agent(基于模型)**:维护内部世界模型 (World Model),追踪不可直接感知的状态(如自动驾驶推断被遮挡车辆)。
3. **Goal-Based Agent(基于目标)**:主动规划达成目标(如 GPS 导航 + A* 搜索)。
4. **Utility-Based Agent(基于效用)**:多目标权衡,最大化期望效用。
5. **Learning Agent(学习型)**:性能元件 + 学习元件,通过环境互动自我改进;RL 是代表路径,AlphaGo Zero 是里程碑。

学习能力是**可叠加的元能力**,可附加到前四类之上(ch01, p13-15)。

## 三、传统 agent vs LLM agent(核心对比)

表 1.1(ch01, p12-13):

| 维度 | 传统智能体 | LLM 驱动智能体 |
|---|---|---|
| 核心引擎 | 显式编程的逻辑系统 | 预训练模型的推理引擎 |
| 知识来源 | 工程师预定义规则/算法/知识库 | 海量非结构化数据间接学习、内化 |
| 处理指令 | 结构化、精确的命令 | 高层级、模糊的自然语言 |
| 工作模式 | 确定性、可预测 | 概率性、生成式 |
| 泛化/适应性 | 弱,局限于预设框架 | 强,涌现能力 |
| 开发范式 | 规则设计、算法编程、知识工程 | 模型训练、提示工程、微调 |

LLM agent 三大工作特征(以旅行助手为例,ch01, p13):规划与推理(目标分解为子任务链)、tool use(识别信息缺口主动调工具)、动态修正(把用户反馈当新约束)。

## 四、自主性是分水岭:Workflow vs Agent

- **Workflow** 是预先定义的结构化编排(静态流程图,如费用报销审批);**Agent** 是以 LLM 为"大脑"的目标导向自主系统,动态调用 Tool/Memory(ch01, p23-26,图 1.6)。
- 金句:"**Workflow 是让 AI 按部就班地执行指令,而 Agent 则是赋予 AI 自由度去自主达成目标。**"(ch01, p26)
- Agent 的核心价值 = 基于实时信息进行动态推理和决策,没有写死的 if-then 规则(ch01, p26)。
- 业务侧呼应:**"一个固定流程,不会因为中间接了大模型,就自动变成智能体;会调用工具,也不等于就是 Agent。"**(手册第3页,导语,【老傅1024】金句)
- 何时才值得上 Agent:任务规则固定、不需多步推理时,传统软件 + 一次 LLM 调用就够;Agent 只在"任务多步、依赖判断、流程会变"时才划算(范式演进图,阶段①PM 拍板)。

## 五、LLM agent 的理论坐标

- **神经-符号主义 (Neuro-Symbolic) 的实践范例**:内核是神经网络,工作时生成结构化的符号中间步骤(思想、计划、API 调用)(ch01, p13-15;ch02, p44-46)。GPT 本身是联结主义产物,却成为执行符号推理、工具调用和规划决策的"大脑"。
- **混合体 (Hybrid)**:Reasoning 阶段是审议 (Deliberative),Acting & Observing 是反应 (Reactive),把宏大任务拆为"规划-反应"微循环(ch01, p13-15,图 1.3 决策时间 vs 决策质量曲线)。
- LLM 的双重角色 = 海量知识库 + 通用推理引擎,跨越规模阈值后出现**涌现能力 (Emergent Abilities)**:In-context Learning、Chain-of-Thought(ch02, p40-46)。

## 跨资料对比 / 矛盾点

- 三份资料对"什么是 Agent"的视角不同但不冲突:ch01 给**学术定义**(感知-行动-自主),范式演进图与手册给**业务定义**(概率系统嫁接在确定性工程上,见 [agent-paradigm-stages.md](./agent-paradigm-stages.md))。两者交汇于"自主性"这一核心。
- 注:ch01 提到卡尼曼双系统理论类比时,原书系统1/系统2 的快慢标注与通行说法相反 (?)(ch01, p13-15)。

## 相关页面

- [agent-loop.md](./agent-loop.md) —— 自主性如何落地为 Thought-Action-Observation 循环
- [classic-paradigms.md](./classic-paradigms.md) —— 自主决策的具体范式(ReAct 等)
- [agent-paradigm-stages.md](./agent-paradigm-stages.md) —— 从传统到 LLM agent 的演进史
- [agent-planning.md](./agent-planning.md) —— 规划能力
- 来源:[ch01 初识智能体](../sources/hello-agents/ch01-intro-to-agents.md)、[ch02 智能体发展史](../sources/hello-agents/ch02-agent-history.md)、[范式演进图·深度注解版](../sources/agent-evolution-map-annotated.md)
