# LangChain

> TL;DR:最具代表性的早期 LLM 应用开发框架,在本 wiki 中主要作为「过度抽象」的批判对象出现——HelloAgents 自建框架的四大动机之一就是反对 LangChain 式的复杂抽象、不稳定 API、黑盒实现与复杂依赖。其子项目 LangGraph 则被正面评价。

## 它是什么

链式调用范式的 LLM 应用框架,提供 Chain / Agent / Tool / Memory / Retriever 等一系列抽象组件。生态衍生出 [LangGraph](./frameworks-langgraph.md)(状态图编排)、LangSmith(可观测)、DeepAgents(Harness 方向)等。

## 关键事实(作为批判对象)

ch07 7.1 以 LangChain 为典型,列出现有框架四大局限,构成自建 HelloAgents 的动机:

1. **过度抽象的复杂性**:链式调用学习曲线陡峭,简单任务也需理解 Chain/Agent/Tool/Memory/Retriever 等十几个概念。
2. **快速迭代带来的不稳定性**:API 频繁变更,版本升级后代码失效。
3. **黑盒化实现逻辑**:核心封装过严,难以理解内部机制,依赖社区支持。
4. **依赖关系复杂性**:依赖包多、体积大、易冲突。

HelloAgents 的回应:基于标准 OpenAI API 构建而非自造抽象、极简依赖、「万物皆为工具」消除不必要抽象层(见 [./hello-agents.md](./hello-agents.md))。

## 关系

- 批判语境来自 [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md)「对现有框架的批判」一节。
- 注意区分:批判针对 LangChain **核心链式抽象**;其子项目 [LangGraph](./frameworks-langgraph.md) 在 ch06 获正面评价(显式控制、原生循环)。RAG 笔记也提到 LangChain 的递归分割是默认 chunking 方案(见 [../concepts/rag.md](../concepts/rag.md))。
- 生态产物 LangSmith/Langfuse 是 Observability 代表工具(见 [../concepts/harness.md](../concepts/harness.md))。

## 出现在哪些笔记

- [ch07](../sources/hello-agents/ch07-build-your-framework.md) 7.1(p183)— 作为批判对象
- [agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)— 递归分割默认方案、LangChain(70% 自动压缩做法 (?))(p9、p28)
- CAMEL 笔记提到与 LangChain 互操作(ch06)

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 现有框架批判
- [./hello-agents.md](./hello-agents.md) — 反向设计的自建框架
- [./frameworks-langgraph.md](./frameworks-langgraph.md) — 同生态、正面评价的子项目
