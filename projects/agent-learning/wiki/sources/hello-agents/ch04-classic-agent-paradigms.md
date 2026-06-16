TL;DR: 从零手写三大经典单智能体范式——ReAct(边想边做、动态纠错)、Plan-and-Solve(先规划后执行、结构稳定)、Reflection(执行-反思-优化迭代提质)——并给出选型策略:不确定性高选 ReAct,路径确定选 Plan-and-Solve,质量要求极高选 Reflection。

# 第四章 智能体经典范式构建 (p76-106)

为什么造轮子:框架(LangChain/LlamaIndex)工程效率高但掩盖设计机制;亲手处理输出解析、调用重试、防死循环是培养系统设计能力的最直接方式;掌握原理才能从框架"使用者"变"创造者"。

## 4.1 基础设施 (p76-78)
- `pip install openai python-dotenv`;`.env` 配 LLM_API_KEY/LLM_MODEL_ID/LLM_BASE_URL
- **HelloAgentsLLM** 类:封装 OpenAI 兼容客户端,`think(messages, temperature=0)` 流式输出;参数优先传入、缺省读环境变量。这是全书后续框架的种子。

## 4.2 ReAct (p78-89)

- 提出:Shunyu Yao, 2022 [ICLR 2023]。背景:纯思考型(CoT)无法与外部世界交互、易幻觉;纯行动型缺规划纠错。ReAct 洞察:**思考与行动相辅相成——推理使行动更具目的性,行动为推理提供事实依据**。
- 形式化:(th_t, a_t) = π(q, (a1,o1),...,(a_{t-1},o_{t-1}));o_t = T(a_t);循环至 Thought 判断完成。
- 适用:需要外部知识(实时信息)、精确计算(计算器)、API 交互的任务。
- **工具定义三要素**:Name(唯一标识)、Description(自然语言用途说明——LLM 靠它判断何时用哪个工具,是整个机制中最关键的部分)、执行逻辑。
- 实现组件:
  - `search` 工具(SerpApi):智能解析——优先 answer_box → knowledge_graph → 前三条 organic_results 摘要,为 LLM 提供高质量输入
  - **ToolExecutor**:registerTool(name, description, func) / getTool / getAvailableTools(格式化工具清单注入 prompt)
  - **ReActAgent**:REACT_PROMPT_TEMPLATE 含角色定义、{tools} 工具清单、Thought/Action 格式规约(`tool_name[tool_input]` 或 `Finish[最终答案]`)、{question}/{history} 动态上下文;run() 主循环(max_steps=5 安全阀):格式化提示词 → think → _parse_output 正则提取 Thought/Action → Finish 则返回 / 否则 _parse_action 解析 `(\w+)\[(.*)\]` 执行工具 → Observation 追加 history
- 运行实例:"华为最新手机"两步完成(搜索 → Finish 综合 Mate 70 / Pura 80 Pro+,截至 2025-09-08 准确)。
- **特点**:高可解释性(Thought 链透明)、动态规划与纠错(走一步看一步)、工具协同(LLM 运筹+工具执行)。
- **局限**:对 LLM 能力强依赖(推理/指令遵循/格式化输出不足则流程中断)、执行效率问题(串行多次调用,延迟与成本高)、提示词脆弱性(微小变动影响行为)、可能陷入局部最优("原地打转"循环)。
- **调试技巧**:打印完整提示词;解析失败时看原始输出;验证工具输入输出格式;加 few-shot 成功案例;换模型或 temperature=0。

## 4.3 Plan-and-Solve (p89-95)

- 提出:Lei Wang, 2023 (arXiv:2305.04091)。动机:解决 CoT 处理多步复杂问题时"偏离轨道"。
- 两阶段解耦:**Planning Phase**(将问题分解为清晰分步行动计划,计划本身是一次 LLM 调用产物)+ **Solving Phase**(严格按计划逐步执行,每步独立 LLM 调用)。形式化:P = π_plan(q);s_i = π_solve(q, P, (s1..s_{i-1}))。
- 比喻:ReAct 是侦探(随蛛丝马迹调整),Plan-and-Solve 是建筑师(先蓝图后施工)。
- 适用:多步数学应用题、多信息源报告撰写、代码生成等结构性强可分解任务。
- 实现:**Planner**(提示词强制输出 ```python 列表格式,ast.literal_eval 安全解析)+ **Executor**(提示词含原始问题/完整计划/历史步骤与结果/当前步骤,**状态管理**:每步结果作为下一步上下文)+ **PlanAndSolveAgent** 协调者 (Orchestrator),体现"组合优于继承"。
- 实例:苹果销量应用题分解为 4 步(周一 15 → 周二 30 → 周三 25 → 总和 70),信息在任务链中正确传递。
- 图 4.2 还包含 Replan 节点:执行中可请求更多任务/重新规划 (?书中图示提及,正文实现为静态计划)。

## 4.4 Reflection (p95-103)

- 灵感:人类校对/验算;Shinn, Noah 2023 Reflexion 框架(verbal reinforcement learning, NeurIPS 2023)。
- 三步循环:**执行 (Execution)**(ReAct 或 Plan-and-Solve 生成"初稿")→ **反思 (Reflection)**(独立"评审员"角色 LLM 从事实性错误/逻辑漏洞/效率问题/遗漏信息多维评估,生成结构化 Feedback)→ **优化 (Refinement)**(结合初稿+反馈生成修订稿)。F_i = π_reflect(Task, O_i);O_{i+1} = π_refine(Task, O_i, F_i)。重复至无新问题或达最大迭代。
- 价值:内部纠错回路(不依赖外部工具反馈,可纠正更高层次逻辑/策略错误)、一次性执行变持续优化、构建了临时**短期记忆**(完整执行-反思轨迹,可多模态)。
- 实现:**Memory** 类(records 列表,add_record(type='execution'|'reflection'), get_trajectory() 序列化为提示词上下文,get_last_execution());三个提示词:INITIAL(直接完成任务)、REFLECT(扮演"极其严格的代码评审专家",专注算法效率,可回复"无需改进")、REFINE(根据反馈优化);**ReflectionAgent.run()**:初始执行 → 循环{反思 → 含"无需改进"则 break → 优化}(max_iterations=3)。
- 案例:找素数函数。初稿 O(n*sqrt(n)) 试除法 → 反思指出瓶颈并建议埃拉托斯特尼筛法 → 优化为 O(n log log n) → 第二轮反思提及分段筛/奇数筛但判断"无需改进"收敛。
- **成本收益**:成本=每轮迭代至少 2 次额外 LLM 调用、串行延迟显著、提示工程复杂度上升;收益=质量跃迁(合格→优秀)、鲁棒性可靠性增强。"以成本换质量",适合关键业务代码/技术报告、科研逻辑推演、决策支持;需要快速响应或"大致正确"够用时选 ReAct/Plan-and-Solve。

## 表 4.1 范式选型策略
| 任务特征 | 优先选择 | 核心原因 |
|---|---|---|
| 充满不确定性、需与外部API/反馈交互 | ReAct | 根据实时反馈动态调整路径 |
| 逻辑路径清晰、侧重内部推理和步骤分解 | Plan-and-Solve | 稳定、结构化的执行过程 |
| 对最终结果质量和可靠性有极高要求 | Reflection | 迭代优化,"合格"提升至"优秀" |

参考文献:[1] Yao et al. ReAct (ICLR 2023);[2] Wang et al. Plan-and-Solve (arXiv:2305.04091);[3] Shinn et al. Reflexion (NeurIPS 2023, 36:8634-8652)。
