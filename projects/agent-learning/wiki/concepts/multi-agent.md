# Multi-Agent

多智能体是用专家分工+并行+上下文隔离破解单 Agent 三困境的方案,但成本翻 N 倍,核心信条是"不到必要不拆"——SubAgent 即工具,需用四维资源控制防失控。

## 为什么需要:单 Agent 三大困境

(来源:../sources/agent-from-scratch-personal-assistant.md p17;../sources/agent-evolution-map-annotated.md p75)

1. **上下文膨胀**:对话越长越容易"忘事",压缩也有不可逆信息损失
2. **注意力分散**:一个 system prompt 难兼顾,复杂任务容易"跑偏"
3. **串行瓶颈**:独立子任务只能排队执行

核心收益(agent-from-scratch-personal-assistant.md p24):上下文隔离(主 agent 只看任务+结果)、并行执行(3个20s子任务并行)、失败隔离、专家化、质量提升(交叉验证减少幻觉和遗漏)。

## 七种协作模式

(来源:agent-from-scratch-personal-assistant.md p17-24,均给出人类团队类比、ASCII架构图、代表产品、优劣、适用场景)

1. **Orchestrator-Worker(主从委托)**:并行快、上下文隔离;Orchestrator是单点瓶颈、Worker间无法直接通信。代表:Claude Code(subagent)、本项目DelegateManager、AutoGen
2. **Sequential/Pipeline(接力传递)**:流程清晰可控、每步可审计;串行慢、一步出错全部受影响、反馈回环困难。代表:GitHub Copilot Workspace、CI/CD
3. **Peer Discussion/Debate(对等讨论)**:多角度避免盲点、决策质量高;Token消耗极高、易陷入无意义循环辩论。代表:ChatDev、CAMEL、MetaGPT。适用决策类问题
4. **Hierarchical(层级分治)**:适合超大型任务;层级增加延迟和通信成本、易"传话走样"、实现复杂度极高。代表:MetaGPT(CEO/CTO/PM/Engineer)
5. **Competition/Voting(竞争选优)**:同一问题发给多个Agent(可不同模型/策略),Judge投票/评分/综合;质量高、鲁棒;Token成本N倍。代表:LLM-as-Judge、AlphaCode、self-consistency
6. **Generator-Critic(评估反馈)**:生成者+评估者循环迭代至达标(需最大迭代限制);质量持续提升、两者可用不同模型(生成用快模型、评估用强模型);Critic本身可能不可靠、可能过度修改。代表:Reflexion、Self-Refine、Constitutional AI
7. **Router/Dispatch(动态路由)**:轻量分类器把请求路由给专家Agent(各有专属system prompt+专属工具);响应快、易水平扩展;Router可能分错类、跨领域问题需转交。**本项目的Skill advertise→load本质上是一种路由**(p23)

**生产组合使用**(p24):成熟系统组合多种模式。本项目 = Router(skill路由)+ Orchestrator-Worker(DelegateManager)+ 隐式Generator-Critic(ReAct循环中LLM自评是否完成)。Claude Code同样是Router + Orchestrator + Generator-Critic + Pipeline的组合。

## "不到必要不拆"原则

(来源:agent-from-scratch-personal-assistant.md p25;agent-evolution-map-annotated.md p77, p79;troubleshooting-nine-stages-case.md p43-44)

**收益 = 上下文隔离 + 并行 + 专家化 + 交叉验证;但成本翻N倍 → 先单Agent + 多Skill,扛不住再拆**。

- PM拍板:忍住"不到必要不拆",默认单Agent + 多Skill(agent-evolution-map-annotated.md p79)
- PM类比:把全能员工拆成项目组;"能一个人干完的别开会"(p78)
- 贯穿案例印证(troubleshooting-nine-stages-case.md p43-44):单"签名失败"工单一个Agent + 多Skill就够;只有升级到"排查 + 近7天失败趋势分析 + 写对外回复"才拆排查专家 + 数据分析专家 + 写作专家 + 协调者。"拆一次成本和协调复杂度翻倍,不到必要别拆"

## SubAgent 即工具(项目实现)

(来源:agent-from-scratch-personal-assistant.md p52-56)

**子agent也是一个工具**:`delegate_task(goal, context, role)`,role ∈ {leaf, orchestrator},默认leaf;leaf不能再委托,orchestrator可继续(`enable_delegate = role=="orchestrator" and current_depth < max_depth-1`)。

执行流程(p52):
1. 深度检查(超限降级为leaf禁止递归)
2. 并发检查(活跃子agent≥3时等待)
3. 提交ThreadPoolExecutor(延迟创建)
4. 带超时等待Future

每个子agent:独立IdleAgent实例、独立messages历史、独立迭代预算(50)、独立TodoStore、受限工具权限。

**子agent身份提示词**(p54):custom_identity注入"你是一个子代理"+ 执行纪律 + 任务目标 + 上下文 + 工作边界 + 结果格式 + 技术约束(角色/最大迭代/禁用工具/完成立即给最终回答);LLM继承父agent的。

### 四维资源控制

(来源:agent-from-scratch-personal-assistant.md p25, p55)

1. **并发**:最多 **3** 个子agent(防API并发耗尽)
2. **迭代预算**:子agent独立 **50** 次
3. **超时**:**600** 秒强制取消
4. **深度**:最多 **1** 层委托(防无限嵌套递归创建Agent)

### Leaf 权限隔离

(来源:agent-from-scratch-personal-assistant.md p55-56)

子agent(leaf)禁用:
- **delegate_task**(防止递归)
- **memory**(并行执行下多个子Agent可能冲突写入,**记忆修改应由主Agent统一决策**)
- **clarify**(子Agent在线程池中无法与用户交互,允许会阻塞等待而用户看不到请求)

可用:load_skill、MCP工具(enabled_toolsets继承)、独立todo、内置工具。

TodoStore每个agent实例私有,由ToolDispatcher运行时注入store参数;**不用全局单例:主/子agent共享任务列表会互相干扰**(p59)。

### DelegateResult 结构化指标

(来源:agent-from-scratch-personal-assistant.md p55)

字段:goal / success / final_answer / error / tool_calls_count / iterations_used / tokens_used / duration_seconds。

为什么记录:主Agent据此判断子任务质量——**"如果一个子agent用了50次迭代(预算耗尽)但声称成功,主agent应该怀疑结果的完整性"**;指标也展示给用户。

## 关键设计挑战

(来源:agent-from-scratch-personal-assistant.md p25)

- 任务拆解粒度(太细通信开销大、太粗失去并行意义)
- 结果聚合
- 资源控制(防递归创建Agent:并发数限制+超时+深度限制)
- 状态一致性(通过主agent转发/共享存储)
- 错误传播(每步输出验证)
- 成本控制(Token是单Agent数倍,按需使用)

## 跨资料对比:框架层的多智能体实现

不同框架对多智能体的设计哲学(来源:../sources/hello-agents/ch06-agent-frameworks.md p180):

- **核心权衡:涌现式协作 vs 显式控制**
  - **AutoGen**(对话驱动协作):RoundRobinGroupChat轮询群聊、AssistantAgent+UserProxyAgent;定义"谁+做什么"而非"如何做",贴近人类但难预测调试。对应Peer Discussion/Orchestrator模式
  - **CAMEL**(角色扮演+Inception Prompting):AI User × AI Assistant轻量自主协作,初始提示注入角色/目标/协议;"轻架构、重提示",对应Debate模式
  - **AgentScope**(消息驱动+工业级):MsgHub消息中心 + Pipeline顺序/并发编排,代表"能运行"到"能稳定服务"的工程化跨越(并发、容错、分布式)
  - **LangGraph**(State Graph显式控制流):明确定义每步与跳转,牺牲涌现换取可靠性/可控性/可观测性;原生支持循环,对应Generator-Critic/Reflection
- **设计权衡2 工程化**:AgentScope代表生产级多智能体系统(分布式部署、消息持久化重放),但简单场景"过度工程化"

注:hello-agents框架章侧重单框架内的多Agent编排API(MsgHub/GroupChat/RolePlaying/StateGraph),个人助手长文侧重模式分类学+从零实现的资源控制工程,两者互补——前者讲"框架提供什么",后者讲"自己造时如何防失控"。

## 关键量化数据

- SubAgent四维:并发≤3、迭代预算50、超时600s、深度≤1层(agent-from-scratch-personal-assistant.md p55)
- 主agent默认迭代预算90轮(?)(p35)
- DelegateResult 8个指标字段(p55)
- AutoGen RoundRobinGroupChat max_turns=20安全阀(hello-agents/ch06-agent-frameworks.md p18)
- CAMEL chat_turn_limit=30(ch06 p33)

## 相关页面

- [./harness.md](./harness.md) — 运行时护甲(SubAgent资源控制属迭代控制子系统)
- [./agent-reliability.md](./agent-reliability.md) — 可靠性工程(子agent错误传播)
- [./agent-security.md](./agent-security.md) — 安全(子agent权限隔离/记忆冲突)
- [./agent-skills.md](./agent-skills.md) — Skill路由(本质是Router模式)
- [./communication-protocols.md](./communication-protocols.md) — Agent间通信协议
- [./agent-frameworks-design.md](./agent-frameworks-design.md) — 框架设计哲学
- [../entities/frameworks-langgraph.md](../entities/frameworks-langgraph.md) — LangGraph(State Graph显式控制)
- [../entities/frameworks-autogen.md](../entities/frameworks-autogen.md) — AutoGen(对话驱动)
- [../sources/agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md) — 七模式+SubAgent实现(p17-25, p52-56)
- [../sources/hello-agents/ch06-agent-frameworks.md](../sources/hello-agents/ch06-agent-frameworks.md) — 四框架多Agent编排对比
- [../sources/agent-evolution-map-annotated.md](../sources/agent-evolution-map-annotated.md) — 第⑦阶段定位与PM克制原则(p74-80)
- [../sources/troubleshooting-nine-stages-case.md](../sources/troubleshooting-nine-stages-case.md) — 案例中的按需拆分(p42-44)
