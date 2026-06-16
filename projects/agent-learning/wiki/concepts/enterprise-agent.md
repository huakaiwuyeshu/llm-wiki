# Enterprise Agent(企业业务 Agent)

> TL;DR:企业业务 Agent 不是"更会聊天的机器人",而是一个承接高频业务流程的**工作系统**——LLM 只负责理解与表达增强,由 Workflow、Schema+Validator、Skill、Task State、Memory、Audit 和人工审核共同负责稳定、可控、可复盘。判断标准不是"回答得像不像",而是"能不能按流程稳定推进";架构选型遵循「Workflow 负责边界,Agent 负责弹性」——不是越自主越好。

## 概念定义

**企业业务 Agent** = 识别任务 → 校验参数 → 调用 Skill 的流程系统,对照普通**聊天机器人** = 理解 → 生成 → 回答(来源:enterprise-agent-module-handbook p2,图1)。判别要点:普通聊天可以"说错了再改",企业业务流程不行——接入凭证、上线发布、数据结论、规则更新都需要稳定判断、权限边界和可追溯记录(p4)。核心论点:**LLM 是增强点,不是唯一决策者。**

## 关键机制

### 一、混合架构选型:不是越自主越好

四阶段自主度演进(来源:enterprise-agent-module-handbook p3,图2;handbook-page3-rewrite 03):早期 Agent(聊天+工具调用,短链路)→ 工作流 Agent(流程编排,企业稳定流程)→ 自主 Agent(规划+执行,开放复杂任务)→ 自进化 Agent(Skill+Memory,沉淀经验资产)。核心启发:**对企业业务,不是越自主越好,而是要把模型能力放进可控流程里**(p3)。

[handbook-page3-rewrite](../sources/handbook-page3-rewrite.md) 补上了"为什么混合架构"的论证暗线——**控制权钟摆**:早期全用规则(死板)→ 自主 Agent 全交 LLM(灵活但失控跑偏,"业务最怕的不是系统不够聪明,而是系统自作聪明")→ 工程实践收回控制权。收敛于:**「Workflow 负责边界,Agent 负责弹性」**——Workflow 规定哪些步骤必须走、哪些权限不能越、哪些结果必须审核;Agent 在允许范围内处理不确定性。这不是偏好,是行业试错后的收敛终点:能力可以一直长,控制权必须留在确定性工程手里。

**为什么选混合架构(业务特征→需要→模块映射,p3,图3):**

| 业务特征 | Agent 需要什么 | 对应模块 |
|---|---|---|
| 流程顺序稳定 | 不要每次重想流程 | Workflow |
| 字段规则明确 | 判断可校验 | Schema + Validator |
| 问题高度重复 | 复用专家经验 | Skill + 知识库 |
| 任务多轮推进 | 知道走到哪一步 | Task State |
| 凭证上线敏感 | 审计与人工确认 | Audit + 人工审核 |

### 二、职责分工口诀

模块速记(来源:enterprise-agent-module-handbook p7, p12):**Workflow 管流程,Schema 管判断,Clarification Policy 管追问,Skill 管能力,Task State 管推进,Memory 管进化,Audit 和人工审核管风险,LLM 负责理解和表达增强。** 一句话记忆:**Task State 管推进,Memory 管进化,Audit 管风险,人工审核管最终放行。**

### 三、主链路:业务任务如何被接住

业务主流程(来源:enterprise-agent-module-handbook p4,图4):**用户输入 → 会话路由(Session Router)→ 需求转化 → Schema 校验 → 调用 Skill → 输出确认**。LLM 作为"增强层"挂在多个节点(识别意图、抽取字段、追问润色、输出润色),支撑与边界四件套:Task State(记住进度)、Memory(沉淀经验)、Audit(记录风险)、人工确认(高风险放行)。

**LLM 放在哪里:适合做什么 vs 不应独自做什么(p4-5):**

| 节点 | LLM 适合做什么 | 不应该 LLM 独自做什么 |
|---|---|---|
| Session Router | 判断这句话像闲聊、补充信息还是新任务 | 不能因为模型觉得像业务就强行写入任务 |
| 需求识别与转化 | 把自然语言抽取成任务类型、字段、问题类型 | 不能绕过 Schema 自行认定可执行 |
| 追问策略 | 把阻塞项问清楚、少问废话 | 不能为补全信息索要敏感凭证 |
| 知识问答 | 结合检索片段生成易懂回答 | 不能在无依据时编造接口规则 |
| 输出润色 | 把排查建议、分析结论写得更像人话 | 不能替代人工审批和生产操作 |

产品经理对外口径(p5):"我们不是让大模型直接接管业务,而是让大模型嵌入到可控流程里:它负责听懂、抽取、解释和表达;能不能执行、是否要追问、是否涉及安全边界,由 Schema、规则、权限和人工审核共同决定。"

### 四、十二模块与关键子机制

十二模块(p5-7):①入口层 ②Session Router(会话分诊台)③需求识别与转化 ④Schema Builder + Validator ⑤Clarification Policy ⑥Skill Router + SkillLoader ⑦知识库与文档检索 ⑧Tool Governance ⑨Task State ⑩Memory ⑪Runtime Logs/Audit ⑫人工审核发布。

**Schema 三态**(④,p5-6):Validator 校验结果三类——`executable`(可继续执行)/ `needs_clarification`(需要追问)/ `blocked`(触发规则或安全边界,不能继续)。例:用户发了 appsecret 或要求 Agent 生成 appsecret → 进入 `security_flags` 而非继续对话。核心理解:**LLM 可以帮你填表,但不能自己决定表是否合格;表是否合格,要靠 Schema 和业务规则校验。**

**追问策略四类**(⑤,p6):**缺失**(必须字段没有)、**模糊**(表达不清楚)、**冲突**(用户说法和规则冲突)、**非法**(触发权限或安全边界)。原则"缺什么就只问什么";可让 LLM 做话术润色,但问哪些字段由 Schema 和规则决定。

**SkillLoader 渐进式加载**(⑥,p6):不是一开始把所有 Skill 全塞给模型,而是分阶段——**Advertise(先知道有哪些 Skill)→ Load(命中后读取完整 Skill)→ Read(需要时读参考资料)→ Run(必要时运行脚本或工具)**。Skill Router 像派单系统(新接入→接入流程 Skill,签名失败→鉴权排查 Skill,续租失败→续租规则 Skill)。

**Task State**(⑨,p7):企业 Agent 与普通聊天机器人最大区别之一,要记住任务状态(需求确认中、资料待补充、凭证待生成、沙箱联调中、上线前检查中、已上线等)。解决"多轮推进,而不是每轮从零开始"。

**Memory**(⑩,p7):不是简单记聊天记录,而是记录识别错误、用户纠正、真实联调案例、重复问题、高频 FAQ 和 Skill 优化建议——"把个体经验逐步变成组织能力"。

**Audit**(⑪,p7):记录用户输入摘要、识别成什么任务、Schema 校验结果、命中哪个 Skill、是否触发安全边界等,但**不能记录敏感信息**(appsecret、真实密钥)。

**人工审核**(⑫,p7):最后一道边界。Agent 可生成建议/草稿/排查步骤,但**不能自动生成 appsecret、发放凭证、改后台配置、正式上线、自动更新生产 Skill**。"Agent 是帮人推进流程,不是绕过人和权限系统。"

### 五、落地七步与 80 分验收

**落地七步(p11):** ① 选一个业务闭环,不做万能入口 → ② 写清 Workflow → ③ 定义 Schema(只保留影响判断/追问/阻断的字段)→ ④ 整理一期 Skill(高频 SOP/文档问答/排查/分析)→ ⑤ 接入 LLM 做理解表达增强,保留规则兜底和安全边界 → ⑥ 做验收集压测识别/追问/路由/安全 → ⑦ 误判、纠错、重复问题进 Memory,人工审核更新 Skill。落地五步精简版(p8-9):业务流程 → 字段规则 → 追问策略 → 业务能力 → 验收沉淀。

选第一期场景四条判断标准(p9):**高频 / 规则明确 / 可人工确认 / 能做验收。**

**80 分验收口径(p11):** 初版不追求"无所不答",而是追求在核心场景里达到 80 分——**识别稳定、追问克制、输出有依据、安全边界清楚**。验收不看"回答好不好看",看是否稳定走完正确链路(需求识别、追问、Skill 路由、安全边界、人工确认)。

示例业务 API 接入与分析 Agent 三条任务链(共用底座 Schema/Skill/Task State/Memory/Audit,p9):新 API 接入(需求确认→资料补齐→凭证准备→上线检查)、联调问题(识别问题→补齐日志→排查建议→沉淀案例)、单量分析(确认口径→趋势分析→异常判断→输出周报)。安全边界:**appsecret 不进模型上下文、不在对话中复述、不写入普通日志;查看/重置/发放必须走有权限和审计的安全通道**(p10)。

### 六、trust-gated 信任打分闸门(代码实现参考)

在开源模板 `trust_gated_agent_team` 中找到对应 Tool Governance + Audit + 人工审核的具体实现(来源:api-agent-template-breakdown):多 agent 流水线(Researcher→Analyst→Writer),每个 agent 参与前必须通过**信任打分(0–100,金/银/铜分级)**,不达标直接被挡;每步操作写进 **SHA-256 哈希链审计日志**,任一条被篡改后面全部对不上。"参与前先过闸"的 gating 模式 = 凭证发放/上线/改配置前人工审核"达标才放行"闸门的代码参考。注意:用户版本要叠加"敏感信息不进日志"(appsecret 不落盘)——这是该模板未强调、用户更严的地方。

其余可抄模板(把判断交给代码而非 LLM 的 deterministic-picker 思路):`rag_failure_diagnostics_clinic`(预定义 12 种失败模式 P01–P12,System Prompt 硬写死"只能从枚举里选,不许发明新 id",对应 Schema 需求识别)、`rag_database_routing`(路由+多库+兜底,对应 Session/Skill Router)、`corrective_rag`(检索后先给证据相关性打分,不够就走"未找到依据",LangGraph 状态机=Task State 技术地基)、`ai_data_analysis_agent`(NL→SQL 用 DuckDB 执行,"让 DuckDB 算数、LLM 只翻译解读",对应单量分析)。统一抄法三问:① 把"判断"交给 LLM 还是代码?② 兜底怎么处理?③ 沉淀了什么可复盘记录?——对应 deterministic-picker、安全边界、Audit 三大支柱。

## 跨资料对比/矛盾

- **与 agent-oriented-infra 的关系(视角不同,结论同源)**:本页是「业务模块视角」——单个企业业务 Agent 内部用 Workflow/Schema/Skill/Audit 分工。[agent-oriented-infra](./agent-oriented-infra.md) 是「底层 infra 视角」——支撑 agent+code 的研发基础设施。本页"Workflow 负责边界,Agent 负责弹性"与 agent-oriented-infra "Infra 能力边界 = agent 自主边界"是同一思想在不同层。本页 Tool Governance / 人工审核所依赖的 dry-run、渐进信任、credential brokering 的底层实现,正是 agent-oriented-infra 讨论的内容;反过来 agent-oriented-infra 指出"dry-run 无法穿透到底层平台"这一现实障碍,是本页 Tool Governance"一期轻量、接真实系统前加强"务实态度的注脚。
- **兜底口径比开源默认更保守**(来源:api-agent-template-breakdown):用户手册口径比开源模板默认更严——开源 `rag_database_routing` 没命中就联网搜索,用户版本改为"明说未找到依据";开源哈希链审计,用户版本叠加"敏感信息不落盘"。
- **四阶段 vs 九阶段的轴差异**:本手册(enterprise-agent-module-handbook)用四阶段自主度演进;[handbook-page3-rewrite](../sources/handbook-page3-rewrite.md) 把它降级为"粗看法/选型视角",升级九阶段能力演进为主叙事。两者不矛盾,轴不同(自主度高低 vs 能力补齐先后),详见 [agent-paradigm-stages](./agent-paradigm-stages.md)。

## 相关页面

- [agent-oriented-infra](./agent-oriented-infra.md) — 面向 Agent 的研发基础设施(底层 infra 视角,与本页业务模块视角互补)
- [agent-skills](./agent-skills.md) — Skill 与渐进式加载(Advertise→Load→Read→Run)
- [agent-memory](./agent-memory.md) — Memory(个体经验→组织能力)
- [rag](./rag.md) — 知识库检索与"无依据明说未找到"
- [agent-security](./agent-security.md) — 安全边界、敏感信息不落盘
- [agent-paradigm-stages](./agent-paradigm-stages.md) — 自主度四档与能力演进九阶段
- [harness](./harness.md) — 运行时护甲(Tool Governance / 人工审核的上位概念)
- 来源:[enterprise-agent-module-handbook](../sources/enterprise-agent-module-handbook.md)、[handbook-page3-rewrite](../sources/handbook-page3-rewrite.md)、[pm-5min-hook](../sources/pm-5min-hook.md)、[api-agent-template-breakdown](../sources/api-agent-template-breakdown.md)
- 实体:[enterprise-api-agent](../entities/enterprise-api-agent.md)、[awesome-llm-apps](../entities/awesome-llm-apps.md)
