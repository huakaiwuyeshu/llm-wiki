# 经典单智能体范式对比

> TL;DR:三大经典单智能体范式——ReAct(边想边做、动态纠错)、Plan-and-Solve(先规划后执行、结构稳定)、Reflection(执行-反思-优化迭代提质);加上更早的 CoT 提示与 ToT 等树状搜索。选型策略:不确定性高选 ReAct,路径确定选 Plan-and-Solve,质量要求极高选 Reflection。

## 一、CoT(Chain-of-Thought,前置基础)

- LLM 跨越规模阈值后出现的**涌现能力**之一:让模型 "Let's think step by step" 做线性、串行的逻辑推导(ch02, p40-46;范式演进 Planning 维度,p6)。
- 局限:纯思考型(CoT)无法与外部世界交互、易幻觉;复杂多步问题易"偏离轨道"或陷入逻辑断层/死循环(ch04, p78;范式演进, p6)。这正是 ReAct、Plan-and-Solve 要解决的痛点。

## 二、ReAct(Reasoning + Acting)

- 提出:Shunyu Yao, 2022 [ICLR 2023](ch04, p78-89)。
- 核心洞察:**思考与行动相辅相成——推理使行动更具目的性,行动为推理提供事实依据**(ch04, p78)。
- 形式化:`(th_t, a_t) = π(q, (a1,o1),...,(a_{t-1},o_{t-1}))`;`o_t = T(a_t)`;循环至 Thought 判断完成(ch04, p78-89)。
- 工具定义三要素:Name(唯一标识)、**Description**(自然语言用途说明——LLM 靠它判断何时用哪个工具,**是整个机制中最关键的部分**)、执行逻辑(ch04, p78-89)。
- 比喻:**侦探**——随蛛丝马迹调整方向(ch04, p89)。
- 特点:高可解释性(Thought 链透明)、动态规划与纠错(走一步看一步)、工具协同。
- 局限:强依赖 LLM 能力(推理/指令遵循/格式化不足则流程中断)、执行效率低(串行多次调用)、提示词脆弱、可能"原地打转"陷入局部最优(ch04, p78-89)。

## 三、Plan-and-Solve

- 提出:Lei Wang, 2023 (arXiv:2305.04091)。动机:解决 CoT 处理多步复杂问题时"偏离轨道"(ch04, p89-95)。
- 两阶段解耦:**Planning Phase**(把问题分解为清晰分步行动计划,计划本身是一次 LLM 调用产物)+ **Solving Phase**(严格按计划逐步执行,每步独立 LLM 调用)。形式化:`P = π_plan(q)`;`s_i = π_solve(q, P, (s1..s_{i-1}))`(ch04, p89-95)。
- 比喻:**建筑师**——先蓝图后施工(ch04, p89)。
- 关键机制:Executor 的**状态管理**——每步结果作为下一步上下文;Orchestrator 协调,体现"组合优于继承"(ch04, p89-95)。
- 实例:苹果销量应用题分解 4 步(15→30→25→总和 70),信息在任务链中正确传递。
- 备注:图 4.2 含 **Replan 节点**(执行中可请求更多任务/重新规划),但正文实现为静态计划 (?)(ch04, p89-95)。

## 四、Reflection

- 灵感:人类校对/验算;Shinn, Noah 2023 **Reflexion** 框架(verbal reinforcement learning, NeurIPS 2023)(ch04, p95-103)。
- 三步循环:**执行 (Execution)**(用 ReAct 或 Plan-and-Solve 生成"初稿")→ **反思 (Reflection)**(独立"评审员"角色 LLM,从事实性错误/逻辑漏洞/效率问题/遗漏信息多维评估,生成结构化 Feedback)→ **优化 (Refinement)**(结合初稿+反馈生成修订稿)。`F_i = π_reflect(Task, O_i)`;`O_{i+1} = π_refine(Task, O_i, F_i)`;重复至无新问题或达最大迭代(默认 max_iterations=3)(ch04, p95-103)。
- 价值:**内部纠错回路**(不依赖外部工具反馈,可纠正更高层次逻辑/策略错误)、一次性执行变持续优化、构建临时**短期记忆**(完整执行-反思轨迹)。
- 案例:找素数函数,初稿 O(n·√n) 试除法 → 反思建议埃拉托斯特尼筛法 → 优化为 O(n log log n) → 第二轮反思判断"无需改进"收敛(ch04, p95-103)。
- 成本收益:成本 = 每轮迭代至少 **2 次额外 LLM 调用** + 串行延迟 + 提示工程复杂度上升;收益 = 质量跃迁(合格→优秀)+ 鲁棒性增强。"以成本换质量"(ch04, p95-103)。

## 五、ToT / GoT 等(树/图状搜索)

- ch02 在 LLM 智能体 Planning Module 中列出:Reflection、Self-critics、CoT、**ToT (Tree of Thoughts)**、**GoT (Graph of Thoughts)**(ch02, p40-46,图 2.10)。
- 注:ch04 重点手写 ReAct / Plan-and-Solve / Reflection 三种,ToT/GoT 仅在 ch02 架构图中点名,未展开 (?)。

## 六、选型策略(表 4.1)

| 任务特征 | 优先选择 | 核心原因 |
|---|---|---|
| 充满不确定性、需与外部 API/反馈交互 | **ReAct** | 根据实时反馈动态调整路径 |
| 逻辑路径清晰、侧重内部推理和步骤分解 | **Plan-and-Solve** | 稳定、结构化的执行过程 |
| 对最终结果质量和可靠性有极高要求 | **Reflection** | 迭代优化,"合格"提升至"优秀" |

(ch04, p95-103,表 4.1)

## 跨资料对比 / 矛盾点

- ch04 把三范式当**并列可选的设计模式**(按任务特征选型);范式演进图/演进史则把 ReAct 当作**演进阶段⑤/阶段一的起点**(被后续 Workflow、自主规划继承重构),视角不同——ch04 是"怎么造",演进文档是"怎么变"。详见 [agent-paradigm-stages.md](./agent-paradigm-stages.md)。
- Reflection 与四阶段中的"自我校验 / Self-Evolving"有承继关系:Reflection 的反思回路是后期自进化 Agent "沉淀经验"机制的雏形(范式演进, 阶段四)。

## 相关页面

- [agent-loop.md](./agent-loop.md) —— 各范式都是 loop 的不同串法
- [agent-planning.md](./agent-planning.md) —— 从 CoT 到结构化分解的规划演进
- [agent-paradigm-stages.md](./agent-paradigm-stages.md) —— ReAct 作为演进起点
- [agent-definition.md](./agent-definition.md)
- 来源:[ch04 经典范式](../sources/hello-agents/ch04-classic-agent-paradigms.md)、[ch02 智能体发展史](../sources/hello-agents/ch02-agent-history.md)、[范式演进](../sources/agent-paradigm-evolution.md)
