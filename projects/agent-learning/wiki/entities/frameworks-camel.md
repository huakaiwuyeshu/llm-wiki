# CAMEL

> TL;DR:轻量级多智能体框架,核心是「角色扮演 (Role-Playing) + Inception Prompting(引导性提示)」。设计哲学「轻架构、重提示」——AI User 与 AI Assistant 通过初始提示注入自主对话协作。优势是极简协作设定;局限是高度依赖提示工程、缺路由/分布式/仲裁机制。

## 它是什么

**Role-Playing + Inception Prompting**:AI User(提需求、下指令,如「股票交易员」)× AI Assistant(执行,如「Python 程序员」)。初始提示注入四要素:明确自身角色、告知协作者角色、定义共同目标、设定行为约束与沟通协议(AI 用户一次只提一个步骤;完成标志 `<SOLUTION>`;任务完成标记 `<CAMEL_TASK_DONE>`)。

## 关键事实

- 实战(ch06):AI 科普电子书(拖延症心理学,8000-10000 字)。`RolePlaying(assistant_role_name="心理学家", user_role_name="作家", task_prompt=..., with_task_specify=False)`;循环 `step(input_msg)` 驱动每轮,`chat_turn_limit=30`。协作自然分四阶段:框架搭建与目标对齐(1-5 轮)→ 核心内容生成与知识转译(6-20 轮)→ 迭代优化与质量保证(21-25 轮)→ 总结升华。
- **优势**:「轻架构、重提示」;已扩展多模态、工具集成、多模型适配,与 LangChain/CrewAI/AutoGen 互操作。
- **局限**:对提示工程高度依赖(设计门槛/调试复杂/跨模型一致性)、协作规模受限(缺对话路由/分布式状态/仲裁机制)、严格流程控制不如 LangGraph、高并发不如 AgentScope、多方决策不如 AutoGen。

## 关系

- 设计哲学属「**涌现式协作**」一极,与 [AutoGen](./frameworks-autogen.md) 同侧(见 [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md))。
- 在 multi-agent 七模式中,其双角色对话对应 **Peer Discussion/Debate 对等讨论**模式的代表(与 ChatDev、MetaGPT 并列,适用决策类问题,见 [../concepts/multi-agent.md](../concepts/multi-agent.md))。

## 出现在哪些笔记

- [ch06](../sources/hello-agents/ch06-agent-frameworks.md) 6.4(p167-173)— 主要定义与实战
- [agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)— Peer Discussion/Debate 模式代表(p17)

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 四框架对比
- [../concepts/multi-agent.md](../concepts/multi-agent.md) — 对等讨论模式
- [./frameworks-autogen.md](./frameworks-autogen.md)、[./frameworks-agentscope.md](./frameworks-agentscope.md)、[./frameworks-langgraph.md](./frameworks-langgraph.md)
