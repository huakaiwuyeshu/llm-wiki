# Agent 的规划能力 (Planning)

> TL;DR:Planning 从早期依赖模型原生 CoT 的"提示词技巧"(线性串行推导,易逻辑断层/死循环),演进为真正的"智能决策中枢"——结构化任务分解、Todo List、多步长程协同、子 Agent 动态构建;核心驱动力是底层基座模型推理能力的升级。

## 一、规划在 agent 架构中的位置

- Lilian Weng 早期经典框架把 agent 拆为 **LLM + Planning + Tools + Memory**;Planning 是四大经典模块之一(范式演进, p2)。
- ch02 的 LLM 智能体架构图(图 2.10)里,**Planning Module** 包含 Reflection、Self-critics、CoT、ToT、GoT,与 LLM 中枢协同(ch02, p40-46)。
- 思考阶段 = Planning + Tool Selection(ch01, p15-17);"规划与推理"(目标分解为子任务链)是 LLM agent 三大工作特征之一(ch01, p13)。

## 二、早期:Planning ≈ 提示词技巧(CoT 时代)

- 早期许多人坚信"会对任务做 Planning 的 Agent 才是真正意义上的 Agent";但基座模型不够强的时代,Planning 实现朴素,**主要依赖模型原生 CoT 能力**(如 "Let's think step by step")做线性、串行的逻辑推导(范式演进, p6)。
- 局限:简单任务尚可,复杂场景易陷入**逻辑断层或死循环**;早期"能做好 3 轮以上 Reasoning 的模型都不多"(范式演进, p3, p6)。

## 三、现在:三种高级规划能力

随 Reasoning 能力显著增强,Planning 模块具备三种更高级能力(范式演进, p6-7):

1. **复杂问题的结构化分解**:主动将宏大模糊目标拆为可执行子任务 (Sub-tasks),生成**结构化 Todo List**。
2. **多步协同与长程推理**:按任务列表有序执行,执行中**动态调整计划**,可处理极长上下文依赖的复杂任务并保持逻辑一致性、连贯性。
3. **子 Agent 的动态构建**:根据子任务需求**动态实例化/调用特定子 Agent** 专项解决某环节,从"单体思考"到"协同作战"。

核心驱动力:**底层基座模型推理能力升级**——模型在逻辑推理、长文本理解、复杂指令遵循上越来越强,Planning 从"提示词技巧"演变成真正的"**智能决策中枢**"(范式演进, p7)。

## 四、规划范式的两条具体路线

- **Plan-and-Solve**:先一次性规划(Planning Phase 产出完整计划),再严格按计划逐步执行(Solving Phase);适合逻辑路径清晰、可分解的任务(ch04, p89-95)。详见 [classic-paradigms.md](./classic-paradigms.md)。
- **ReAct + 按需 Plan**:不预先全量规划,边想边做,只在复杂时才规划——**生产 90% 场景采用此方式**;"能不规划就不规划"(范式演进图,阶段⑤)。详见 [agent-loop.md](./agent-loop.md)。

## 五、规划与自主度 / 长程任务

- 在自主度四档中,**自主 Agent(第 3 档)= 规划 + 执行**:面对开放复杂任务自己拆解规划,灵活但要兜底(手册第3页 03)。
- 自主 Agent 阶段(2025)的核心变化:不再满足于"调用几个工具后给结论",具备**复杂 Planning** 能力,面对模糊/宏大需求自行拆解任务、规划路径、多轮迭代;配合 Specs(开发规范)可连续运行很长时间处理企业级长程任务(范式演进, p3-4)。详见 [agent-paradigm-stages.md](./agent-paradigm-stages.md)。

## 跨资料对比 / 矛盾点

- ch04 的 Plan-and-Solve 是**静态一次性规划**(先蓝图后施工);范式演进强调现代 Planning 能**动态调整计划**——这是同一能力在模型变强后的升级,不是矛盾。
- "Replan 节点"在 ch04 图 4.2 出现但正文实现为静态 (?)(ch04, p89-95),恰好印证范式演进所说"动态调整"是后来才真正落地的能力。
- ToT/GoT 等树/图状规划仅在 ch02 架构图点名,未在其余资料展开 (?)。

## 相关页面

- [classic-paradigms.md](./classic-paradigms.md) —— CoT / Plan-and-Solve 等规划范式细节
- [agent-loop.md](./agent-loop.md) —— ReAct 主循环 + 按需 Plan
- [agent-paradigm-stages.md](./agent-paradigm-stages.md) —— 规划能力在自主 Agent 阶段的跃升
- [agent-definition.md](./agent-definition.md)
- 来源:[范式演进](../sources/agent-paradigm-evolution.md)、[ch04 经典范式](../sources/hello-agents/ch04-classic-agent-paradigms.md)、[ch02 智能体发展史](../sources/hello-agents/ch02-agent-history.md)、[ch01 初识智能体](../sources/hello-agents/ch01-intro-to-agents.md)、[范式演进图·深度注解版](../sources/agent-evolution-map-annotated.md)、[手册第3页改写成稿](../sources/handbook-page3-rewrite.md)
