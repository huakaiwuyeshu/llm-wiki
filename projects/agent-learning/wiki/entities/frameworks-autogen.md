# AutoGen

> TL;DR:微软的多智能体框架,核心概念是「对话的智能体 (Conversable Agent)」,设计哲学「以对话驱动协作」。0.7.4 版完成架构重构(分层 + 异步优先)。优势是协作建模门槛低、天然 Human-in-the-loop;局限是 LLM 对话本质不确定、「对话式调试」困难。

## 它是什么

以**对话驱动协作**的多智能体框架。0.7.4 是架构重构节点:分层(autogen-core 底层 / autogen-agentchat 高级接口)+ **异步优先**(async/await,避免线程阻塞)。生态含 Magentic-One 应用、Studio、Bench。

核心组件:

- **AssistantAgent**:LLM 封装,System Message 赋予专家角色。
- **UserProxyAgent**:双重角色——用户代言人 + 执行器(可执行代码/调用工具),负责发 `TERMINATE`。天然 Human-in-the-loop 接口。
- **RoundRobinGroupChat**:轮询群聊,按 participants 顺序发言;`TextMentionTermination("TERMINATE")` 终止条件;`max_turns=20` 安全阀。

## 关键事实

- 模型客户端:`OpenAIChatCompletionClient`;非 OpenAI 模型(DeepSeek/Qwen)需传 model_info dict(function_calling/max_tokens/context_length/vision/json_output/family/structured_output)。
- 实战(ch06):比特币价格 App 软件开发团队 = ProductManager → Engineer → CodeReviewer → UserProxy,每角色独立函数创建,System Message 末尾嵌入交接指令,`await Console(team_chat.run_stream(task))` 启动。
- **优势**:协作建模门槛低(定义「谁+做什么」而非「如何做」)、角色可复用、UserProxyAgent 天然支持人工介入。
- **局限**:LLM 对话本质不确定(偏离预期、陷入循环)、「对话式调试」难(错误是一长串对话历史)。

## 关系

- 设计哲学属「**涌现式协作**」一极,与 [CAMEL](./frameworks-camel.md) 同侧,对立于 [LangGraph](./frameworks-langgraph.md) 的显式控制(见 [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md))。
- 在 multi-agent 七模式中,其群聊/委托对应 Orchestrator-Worker 主从委托模式的代表(见 [../concepts/multi-agent.md](../concepts/multi-agent.md))。
- paradigm-evolution 将 AutoGen 列为 2023 启蒙期开源项目之一(与 AgentGPT、MetaGPT 并列)。

## 出现在哪些笔记

- [ch06](../sources/hello-agents/ch06-agent-frameworks.md) 6.2(p151-160)— 主要定义与实战
- [agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)— Orchestrator-Worker 模式代表(p17)
- [agent-paradigm-evolution.md](../sources/agent-paradigm-evolution.md)— 2023 启蒙期代表(p2)

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 四框架对比
- [../concepts/multi-agent.md](../concepts/multi-agent.md) — 协作模式
- [./frameworks-camel.md](./frameworks-camel.md)、[./frameworks-langgraph.md](./frameworks-langgraph.md)、[./frameworks-agentscope.md](./frameworks-agentscope.md)
