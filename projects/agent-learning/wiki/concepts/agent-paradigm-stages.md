# Agent 范式演进史

> TL;DR:Agent 范式有两条互补的演进叙事——阿里飞樯的**四阶段**(被动式 ReAct → Workflow Agent → 自主 Agent → 自进化 Agent,2023-2026,时间轴)与手册/注解版的**九阶段能力演进图**(LLM→记忆→RAG→Function Call/MCP→Agent Loop→Skill→Multi-Agent→Harness→Claw,能力补齐先后)。核心论断:"**形未变、神已变**"——经典模块框架依旧,但每个模块的实现范式都被内核重构;底层思想是"通过工程化手段构建确定性,以承载模型不确定性"。

## 一、四阶段演进(时间线,2023-2026)

阿里技术工程师"飞樯"复盘(范式演进, p2-4)。强调:四阶段**并非线性平滑、并非完全替代,而是并存且互补**;落地按业务复杂度、稳定性要求、成本预算选择或组合。

| 阶段 | 名称 | 年份 | 本质 | 代表 |
|---|---|---|---|---|
| 一 | 早期 Agent(被动式 ReAct) | 2023 | "一问一答"增强版 Chatbot;单步 Reasoning→Observe→Response;有 CoT + 简单 Function Call,但只能单点短链路 | Lilian Weng《LLM Powered Autonomous Agents》理论;AgentGPT、AutoGen、MetaGPT |
| 二 | 工作流 Agent | 2024 | **用工程化约束弥补模型不确定性**;固定 Workflow 关键节点嵌 LLM,或 LLM 调预定义子 Workflow;作者类比为"早期 Harness" | LangGraph、Dify |
| 三 | 自主 Agent | 2025 | 复杂 Planning + 长程任务;从"辅助者"向"执行者"根本转变;配 Specs + 轻量 Harness/自我校验 | Manus、Claude Code、Codex;2026 初 OpenClaw |
| 四 | 自进化 Agent | 2026 | **Self-Evolving**:沉淀 Skill/知识库、反馈循环、自我反思、甚至 RL 微调;解决"静态模型 vs 动态世界"矛盾;Agent 从"一次性消耗品"变"可积累资产" | Hermes Agent、LLM-Wiki |

整体主线:**从"简单交互"到"复杂执行",再到"智能成长"**(范式演进, p4)。早期受限"能做好 3 轮以上 Reasoning 的模型都不多"(范式演进, p3)。

## 二、九阶段能力演进图(能力补齐先后)

手册第3页 / 注解版主线(范式演进图;手册第3页 01)。每阶段是被上一代短板逼出来的"补丁",★ = 枢纽阶段(④⑤⑧):

1. **① LLM**(地基,万能百科):能理解生成,但无记性、知识静态、不会动手
2. **② 记忆 Memory**(知识层):补"每次调用都失忆"——短期上下文 + 长期持久化
3. **③ RAG**(知识层):补"不懂私有业务、还会编"——先检索再回答;天花板是知识库不是模型
4. **★ ④ Function Call & MCP**(能力层):补"只会说不会做"——**决策与执行分离是安全可控的根**(deterministic-picker 起源)
5. **★ ⑤ Agent Loop / ReAct**(质量层,主链路):补"多步任务谁来串"——想→做→看→再决定;生产 90% 用 ReAct + 按需 Plan
6. **⑥ Skill**(能力层):补"工具一多就选不准"——渐进式加载 SOP + 工具
7. **⑦ Multi-Agent**(质量层):补"单个脑子带不动"——专家协作;成本翻倍,不到必要不拆
8. **★ ⑧ Harness**(质量层):补"上线就崩"——容错/限流/工具治理/人工审核/可观测;**从"能跑"到"能用"的分水岭**
9. **⑨ Claw**(形态演进):Agent 跑到本地直接动手并验证,闭合"决策-执行-验证"

归纳为**三层框架**:知识(②③)/ 能力(④⑥)/ 质量(⑤⑦⑧);①地基、⑨形态不入三层(范式演进图 01)。

## 三、自主度四档(选型视角 = 手册原图 2)

| 档 | 名称 | 能力 | 适用 |
|---|---|---|---|
| 1 | 早期 Agent | 聊天 + 工具调用 | 短链路任务 |
| 2 | 工作流 Agent | 流程编排 | 企业稳定流程,步骤已知 |
| 3 | 自主 Agent | 规划 + 执行 | 开放复杂任务,自拆解但要兜底 |
| 4 | 自进化 Agent | Skill + Memory | 沉淀经验成资产,越用越懂业务 |

(手册第3页 03)注意:自主度四档与飞樯四阶段**名称几乎一致**,是同一套阶段的两种排法/视角。

## 四、六维度"形未变神已变"(内核重构)

飞樯沿六大经典模块逐一对比前后变化(范式演进, p4-12,总结 p12-13):

| 维度 | 早期"形" | 现在"神" |
|---|---|---|
| **Prompt** | 单体"小作文"(深耦合) | 解耦的上下文工程,渐进式加载(SKILL.md/CLAUDE.md 等) |
| **Planning** | 线性 CoT 思维链 | 复杂长程任务拆解 + Todo List + 子 Agent |
| **Memory** | 传统前置向量检索(RAG) | 文件系统化 + 向量检索混合架构 |
| **Tools** | 高成本 API 封装(Function Call/MCP) | 回归原生 CLI + Script(变化最大) |
| **Workflow** | 刚性外部编排(状态机/Pipeline) | 内化为灵活 Skill 封装,"Skill 为主 Workflow 为辅" |
| **Environment** | 无状态调用 | 有状态隔离运行时 Runtime(本地/沙箱) |

论断:宏观架构仍由 Prompt/Planning/Memory/Tools 等经典模块组成,与 Lilian Weng 早期框架**并无二致——"形"未变,但"神"已大不同,是一场内核重构**(范式演进, p12)。"Agent 正从'魔法调优'走向'系统工程'"(范式演进, p13)。

## 五、控制权钟摆(为什么混合架构)

贯穿用户全部材料的暗线(范式演进图 03;手册第3页 04):

> 早期·全用规则(死板)→ 自主 Agent·全交 LLM(灵活但失控跑偏、上线就崩)→ 工程实践·收回控制权(确定部分固化,只在需判断处放 LLM)

收敛结论的两种表述(同义不同受众):
- **"LLM 负责判断、代码负责决策与兜底" = deterministic-picker**(范式演进图,工程师向)
- **"Workflow 负责边界,Agent 负责弹性"**(手册第3页,业务方向)

金句:"**业务最怕的不是系统不够聪明,而是系统自作聪明**"(手册第3页 04,【老傅1024】)。混合架构不是偏好,是**行业试错后的收敛终点**:能力可以一直长(九步),控制权必须留在确定性工程手里。Agent 本质 = "**概率系统嫁接在确定性工程上**"(范式演进图,总纲)。

## 六、更长的前史(传统 agent 思想史)

ch02 把 LLM 之前的智能体史也串成"问题驱动"的范式迭代(ch02, p29-49):符号主义(PSSH、专家系统 MYCIN、SHRDLU、ELIZA → 知识瓶颈+脆弱)→ 明斯基心智社会(分布式协作+涌现 → 缺实现路径)→ 学习范式(联结主义+RL+预训练 → 依赖数据)→ LLM 智能体(LLM 为核+工具闭环 → 幻觉+工具依赖)。"每个新范式都为解决上一代核心痛点而生"——与九阶段"每步被上一代短板逼出"是同构的演进逻辑。

## 跨资料对比 / 矛盾点

- **"两张图对不上"(资料内部已自我化解)**:同样是「记忆」「Skill」,九步里靠前(按**能力补齐先后**排),四档里靠后(按**自主度高低**排)——轴不一样位置自然变,不是矛盾(手册第3页 03 桥接话术)。
- **四阶段 vs 九阶段的对应关系**:飞樯四阶段是**时间线**(2023-2026,谁先出现),九阶段是**能力栈**(谁补谁的短板);两者可对齐——阶段一≈①-⑤起步,阶段二≈Workflow,阶段三≈完整 Loop+Planning,阶段四≈Skill/Memory 沉淀;手册自主度四档与飞樯四阶段名称几乎相同。
- **Harness 的位置差异**:飞樯把 2024 Workflow Agent 类比为"早期 Harness"(p3);注解版把 Harness 单列为阶段⑧(运行时护甲)。前者是"约束思想"的早期形态,后者是工程化成熟产物——同名不同成熟度,需注意 (?)。
- 量化数据:LLM 工具调用格式错误率 5-10%、幻觉更高;50 个工具说明书 ≈ 5 万 token、Skill 摘要 ~100 token/个(10 倍 token 效率);生产 90% 用 ReAct + 按需 Plan(范式演进图,关键数据)。

## 相关页面

- [agent-definition.md](./agent-definition.md) —— 传统 5 类 agent 与 LLM agent
- [agent-loop.md](./agent-loop.md) —— 阶段⑤ Agent Loop
- [classic-paradigms.md](./classic-paradigms.md) —— ReAct 作为阶段一/⑤ 起点
- [agent-planning.md](./agent-planning.md) —— 自主 Agent 阶段的规划跃升
- 实体:[lilian-weng.md](../entities/lilian-weng.md)、[claude-code.md](../entities/claude-code.md)、[autonomous-agent-products.md](../entities/autonomous-agent-products.md)
- 来源:[范式演进](../sources/agent-paradigm-evolution.md)、[范式演进图·深度注解版](../sources/agent-evolution-map-annotated.md)、[手册第3页改写成稿](../sources/handbook-page3-rewrite.md)、[ch02 智能体发展史](../sources/hello-agents/ch02-agent-history.md)
