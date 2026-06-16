# AgentScope

> TL;DR:阿里巴巴达摩院的工程化优先多智能体平台,自称「智能体操作系统」。核心概念「消息传递 (Message Passing)」——一切交互抽象为 Msg 收发。代表「工程化」一极:并发、容错、分布式部署、可观测;适合大规模生产级系统,但简单场景过度工程化、生态较新。

## 它是什么

组合式架构 + 消息驱动模式的多智能体平台。分层架构(图 6.2):

- **Foundational Components**:Message / Memory(短长期)/ Model API / Tool+MCP。
- **Agent-level Infrastructure**:预构建 Browser-Use / Deep Research Agent、ReAct 范式、智能体钩子、并行工具调用、**异步执行与实时控制**。
- **Multi-Agent Cooperation**:**MsgHub** 消息中心 + **Pipeline** 顺序/并发编排。
- **Deployment & Development**:AgentScope Runtime 生产运行时(含 Tool Sandbox / A2A 协议);AgentScope Studio 可视化、OpenTelemetry tracing、Ray-based 分布式评估。

## 关键事实

- **消息驱动**:一切交互抽象为 `Msg(name/content/role/metadata)` 收发。优势:异步解耦、位置透明(本地/远程 RPC 自动路由)、可观测(每条消息可追踪)、可靠性(持久化重放,SQLite/MongoDB)。
- AgentBase 生命周期,开发者只需实现 `reply(x: Msg) -> Msg`(可选 observe)。
- 实战(ch06):**三国狼人杀**。三层(游戏控制层/智能体交互层/角色建模层);核心设计 = **以消息驱动代替状态机**:狼人夜谈用 `async with MsgHub(werewolves, announcement=...)` 临时私密频道;投票用 `fanout_pipeline` 并行收集;**结构化输出**(Pydantic BaseModel,如 DiscussionModelCN 含 reach_agreement/confidence_level(1-10)/key_evidence;字段定义自动约束游戏规则);异常时构造默认响应保证游戏继续(容错)。观察:扮狼人的「曹操」更狡猾善伪装,「张飞」更直接冲动。
- **优劣**:适合大规模、高可靠生产级多智能体系统;但要求理解异步/分布式概念,简单场景「过度工程化」,生态较新。

## 关系

- 在 ch06 的两条权衡轴中独占「**工程化程度**」轴(代表「能运行」到「能稳定服务」的跨越),区别于涌现 vs 控制之争(见 [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md))。
- 其 Runtime 含 Tool Sandbox + A2A 协议,与 [../concepts/harness.md](../concepts/harness.md)(沙箱/可观测)、[./a2a-anp.md](./a2a-anp.md) 关联。
- MsgHub + Pipeline 对应 multi-agent 的多种协作模式编排(见 [../concepts/multi-agent.md](../concepts/multi-agent.md))。

## 出现在哪些笔记

- [ch06](../sources/hello-agents/ch06-agent-frameworks.md) 6.3(p160-167)— 唯一详述来源

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 四框架对比、工程化轴
- [../concepts/multi-agent.md](../concepts/multi-agent.md)、[../concepts/harness.md](../concepts/harness.md)
- [./a2a-anp.md](./a2a-anp.md) — Runtime 内置 A2A 协议
- [./frameworks-autogen.md](./frameworks-autogen.md)、[./frameworks-camel.md](./frameworks-camel.md)、[./frameworks-langgraph.md](./frameworks-langgraph.md)
