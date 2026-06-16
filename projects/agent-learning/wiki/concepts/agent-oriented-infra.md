# Agent-Oriented Infra(面向 Agent 的研发基础设施)

> TL;DR:软件研发从来是"意图(不确定性)驱动 + 代码(确定性)沉淀"的进化体,Agent 没改变这个模式,只把"意图→代码"循环从周/月级压到分钟级;这让为人设计的 developer infra(Git/CI/CD/CR 的全部慢循环假设)系统性失配,必须按「可理解、可操作、可感知、可追溯」四层重建为 Agent-Oriented infra。核心结论:**Agent 的自主程度不取决于它多聪明,而取决于 infra 提供了多强的安全护栏——Infra 的能力边界,就是 agent 的自主边界。**

## 概念定义

**Agent-Oriented Infra** 指把研发基础设施(代码托管、构建部署、测试环境、发布系统、Code Review、身份鉴权)从「为人设计」(People-Oriented)重建为「为 agent 设计」的范式。传统 infra 的安全靠人的自我约束 + 事后审计,设计假设操作者有常识、有责任心、操作频率低、能从口口相传的隐性知识中填补概念裂缝;agent 不符合任何一条(会 hallucinate、操作频率极高、出错需自动恢复、面对概念裂缝会卡住或猜错)。因此面向 agent 的 infra 设计,本质是**把原来隐式依赖人的东西——认知、常识、责任心——显式化为系统机制**(来源:agent-first-citizen-infra p9)。

## 关键机制

### 一、统一框架:"意图驱动 + 代码沉淀"及三推论

无论传统研发还是 agent 研发,软件系统一直是"意图(不确定性)驱动 + 代码(确定性)沉淀"的进化体。模式从未改变,改变的是驱动和沉淀的**速度与机制**(来源:agent-first-citizen-infra p2-3)。

- 传统循环:用户意图 → 产品经理压缩意图 → 研发翻译成代码 → 上线 → 新意图。人是意图到代码的桥梁,桥梁带宽决定循环速度(周/月级),受人的认知带宽物理约束。
- Agent 循环:意图(SKILL.md / 自然语言) → agent 生成代码 → 执行 → 反馈 → 修正意图。桥梁从人变成 agent,循环压到分钟级。

**三个推论**(p3-4):
- **推论一:Agent 不是革命,是加速。** 没有改变软件进化的基本结构,只把循环速度提了几个数量级。不需要推翻已有框架,只需追问:速度变化后,哪些慢速假设不再成立?
- **推论二:静态沉淀不会消失。** 不确定性被消除后,确定的逻辑应该用确定的方式表达——"用一个巨大的概率模型去逼近一个已经确定的函数,在信息论意义上是荒谬的浪费"。
- **推论三(主旨):模式没变,但模式对基础设施的要求彻底变了。** 循环从月级到分钟级后,这些慢循环假设全部失效:Git 假设每次变更都值得 commit;CI/CD 假设构建部署是离散事件;测试环境假设代码稳定可提前准备;发布系统假设发布低频需人工审批;CR 假设有人看每一行代码(p4)。

### 二、瞬态代码 vs 沉淀代码(沉淀粒度分化)

Agent 把代码分化为两种形态(来源:agent-first-citizen-infra p5):
- **瞬态代码(transient)**:on the fly 生成的一次性中间产物,分钟级生命周期,用完即弃,不提交 Git(类比 JIT 编译器生成的机器码)。
- **沉淀代码(durable)**:经过验证、反复出现、固化下来的逻辑,仍需版本控制与测试。

反直觉规律:**越是动态的系统,越需要坚固的静态约束**——类型系统、沙箱、权限边界成为 agent 系统可靠运行的护栏。今天的 Git/CI/CD/CR 不会消失,但管辖范围会收缩到"持久化代码"领域,而那个领域的面积在缩小(p13)。

### 三、Agent 占比的"锯齿形"曲线

把系统中 agent 占比画成时间曲线应呈锯齿形:意图涌入时陡升(不确定性高,agent 探索),逻辑固化时缓降(代码沉淀)。两条典型路径(来源:agent-first-citizen-infra p3-4):
- **agent-native 系统**(周报系统):从接近 100% 高位出发,`connectors.yaml`、CI 配置、`check_connectors.sh` 逐步沉淀,占比下降;新意图涌入又上升,但每次上升幅度递减(骨架越来越稳)。
- **存量系统**(镜像服务):从低位出发,agent 逐步接管,整体趋势爬升。
- **诊断工具**:如果曲线是平线,说明有问题——要么需求没有真的持续变化,要么该做的代码固化没做。**锯齿形本身是系统健康度诊断工具。**

三个变量同时变化的效果是**乘法而非加法**:桥梁带宽(人→agent,提升几个数量级,与"聪明"无关,Standard 级别模型就够)、沉淀粒度(瞬态/沉淀分化)、循环频率(从发布周期到运行时反馈,"发布"概念本身变模糊)(p4-5)。推到极致,传统软件"意图可枚举"假设崩塌——面对开放意图空间,agent 占比有一个不可压缩的下界(p6)。

### 四、根本判断:Infra 能力边界 = Agent 自主边界

核心论点(来源:agent-first-citizen-infra p8-9):**Agent 能不能自主操作,不取决于 agent 有多聪明,而取决于 infra 提供了多强的安全护栏。** 推论:**给 infra 补能力,而非给 agent 加限制。Infra 的安全能力越强,agent 的自主空间越大。** People-Oriented infra 靠人的自我约束 + 事后审计;Agent-Oriented infra 靠机制化保证——资源归属、权限管控、dry-run、分级策略、自动回滚。

配置推送案例(p7-8)精确量化了这一点:同事不敢让 agent 推送配置,顾虑不是"不信任 AI",而是"配置推送的权限管控几乎没有"。假设给出强 dry-run——`config-tool publish data=xxx.json --dry-run` 输出 `diff / affected apps / affected pods: about 1,024`——同事即答"如果是这样,就比较放心让 agent 自己推送了"。瓶颈不在 agent 侧(能力足够),在 infra 侧:没有资源归属治理、没有 dry-run、没有分级策略(影响 3 个 pod 和 1,024 个 pod 走同一条路径)、回滚能力不足。

### 五、四层设计原则(递进:理解→操作→感知→追溯)

每层覆盖 API 接口设计和运行时环境两个维度(来源:agent-first-citizen-infra p10):

1. **可理解(Comprehensible)**——agent 能建立正确心智模型。概念体系必须自洽、完整、不依赖口口相传的隐性知识。**"复杂度不是问题,不一致才是":** 一个概念自包含的 CLI,即使 200 个子命令、每个 30 个参数,agent 也能多轮试探快速学会。
2. **可操作(Operable)**——agent 能安全可靠地行动。关键能力:可试探(dry-run / preview / 幂等重试)、操作原子可组合(输入输出类型化)、隔离执行(每任务一个 sandbox)、**凭证不进 sandbox**(通过 vault / egress proxy 注入)、**渐进信任**(低风险自主执行,高风险准备好变更计划 + dry-run 结果、人来点按钮)。回滚能力把不可逆操作变成可逆操作,等于降低风险等级。
3. **可感知(Observable)**——infra 把状态和结果清晰交回 agent。**"沉默和含糊是 agent 的敌人——Unix 的 'Silence is golden' 对 agent 有害"。** 状态必须 API 可查、结构化、实时;结果要可判定(转成 CI 能识别的 pass/fail)。
4. **可追溯(Traceable)**——过程不丢失、可恢复、可回放(snapshot/checkpoint、保存 artifact 与 execution trace,可 fork/replay)。附加维度:**通过 agent 的行为观测 infra 本身的设计质量**——反复重试某 API → 反馈语义不足;调用顺序混乱 → 前置条件没显式化;用错身份 → 身份体系碎片化。人遇到这些会默默绕过去(不产生信号),agent 每次都忠实撞上去且频率极高——**Agent 的失败模式是 infra 设计缺陷的放大器**,把 infra 设计质量从主观判断变成可度量的东西。

### 六、行动方向与量化锚点

- **Harness 平台化**:把 agent 运行环境从"每个团队自己在云服务器搭"变成平台内建能力。Harness spec 声明式定义(角色、工具、凭证、workspace、skill),handoff 时自动初始化、完成后自动回收。核心约束是**即时供给**——并行 agent 数量对环境供给是乘法压力,初始化时间直接决定并行效率。行业数据:Superset(面向 multi-agent 的 IDE)每个开发者同时跑最多 **12 个 coding agent**,三人团队每天产生约 **600 个 preview deployment**,平均构建时间约 **30 秒**(ref: Vercel Blog 2026-05-10;agent-first-citizen-infra p11)。"环境初始化需要 5 分钟"在 12 个并行 agent 面前就是 60 分钟等待。
- **统一身份体系**:agent 拥有自己的机器人身份,一个身份在所有 infra 上通用,自动轮转、最小权限。远期方向 **credential brokering**——agent 能使用凭证但不持有凭证。
- **Dry-run 基础设施化**:在基础设施层提供统一"变更预览"能力,而非每个工具各自实现。资源归属治理是前提。Dry-run 输出标准化:diff + 影响范围 + 影响规模 + 风险等级 + 是否可回滚。这是渐进信任机制的基础。
- **验证体系演进**:传统测试(验证"代码是否正确实现意图")与 agent 评测(验证"模型是否正确理解意图")从两端走向融合,成为从意图到结果的端到端验证。断言方式从精确匹配(`output == expected`)演进到约束满足;确定性验证与概率性验证分层共存(LLM-as-judge / 统计方法)。
- **判断:验证基础设施的投资优先级应该高于生成能力**(p13)——生成能力的提升是模型厂商在推的事,验证能力是 infra 团队该做的事,验证的可靠性直接决定 agent 的自主空间。

### 七、关键量化锚点(全部保留)

- 镜像仓库建站:跨 6+ 异构平台、12+ 配置文件的结构化 SOP,传统排期 **2 人日**,AI 辅助后 **1–1.5 小时**完成;agent 占比约 **50%**(agent 执行全部技术操作,人处理风控环节)。"新手 + AI = 老手的产出"(来源:agent-first-citizen-infra p2-4)。
- 周报系统:agent 占比约 **90%**,意图→执行循环周期为分钟级,代码生命周期从"月/年"缩短到"分钟"。若走传统管线每次迭代可能半天、全做完约两周(p2-3)。
- 配置推送案例:dry-run 输出 `affected pods: about 1,024`(p7-8)。
- 身份碎片化:角色融合使身份体系数量从"**每人 2-3 套**"膨胀到"**每 agent 5-8 套**";沙盒环境短期 Token **2-8 小时**过期(凌晨 3 点 token 过期 agent 卡死),解法是长效 Private Token(来源:agent-first-citizen-infra p8-9)。

### 八、Agent DX vs Human DX;The agent is not a trusted operator

Human DX 和 Agent DX 是**正交的**(ref: Justin Poehnelt 2026-03-04;agent-first-citizen-infra p12):Human DX 优化**可发现性(discoverability)**,Agent DX 优化**可预测性(predictability)**。关键实践:schema 自省替代静态文档、输入加固防 hallucination(路径沙箱化、拒绝控制字符、资源 ID 校验——因为 agent 会 hallucinate 出 `../../.ssh` 这样的路径穿越)、发布 SKILL.md 编码不变量、响应消毒防 prompt injection。核心观点:**agent 不是可信的操作者**——面向 agent 的设计需要把 Unix 哲学里 "Trust the user" 的假设翻转过来。

**Credential Brokering 行业趋同**(ref: Tony Dang / Infisical 2026-05-23;p12):agent 需要凭证但不能被信任持有凭证(prompt injection 可能导致泄露)。解法是在 agent 和凭证之间加信任边界——broker:agent 携带占位符(如 `__github_token__`),broker 认证身份后替换为真实凭证转发,agent 全程见不到真实凭证。Anthropic、Vercel、Cloudflare、LangChain 各自在不同层实现同一范式。

## 跨资料对比/矛盾

- **与 enterprise-agent 的关系(视角不同,结论同源)**:本页是「底层 infra 视角」——讨论支撑 agent + code 动态混合体的研发基础设施(Harness 平台化、身份、dry-run、验证)。[enterprise-agent](./enterprise-agent.md) 是「业务模块视角」——讨论单个企业业务 Agent 内部如何用 Workflow/Schema/Skill/Audit 分工。两者都强调"安全护栏决定自主空间":本页的"Infra 能力边界 = agent 自主边界"与 enterprise-agent 的"Workflow 负责边界,Agent 负责弹性"是同一思想在不同层的表述。本页的 dry-run / 渐进信任 / credential brokering 是 enterprise-agent 中 Tool Governance + 人工审核的底层实现机制。
- **dry-run 的层次矛盾**:本文(案例一,p7)明确指出研发场景里 `--dry-run` 只停留在研发 CLI 层、**无法穿透到底层平台**,这正是要把 dry-run "基础设施化"的动机;而 enterprise-agent 把 dry-run 当作 Tool Governance 的一项能力直接列出,没有处理"穿透性"问题——可见手册视角假设底层 dry-run 已存在,而本文指出这一假设在现实 infra 中并不成立。
- **与 pm-5min-hook / handbook-page3 一致**:本页"瞬态/沉淀代码分化""快循环失配"在 [pm-5min-hook](../sources/pm-5min-hook.md) 和 [handbook-page3-rewrite](../sources/handbook-page3-rewrite.md) 中以"模型负责猜,工程负责兜底""控制权钟摆"的更通俗形式出现,但量化锚点(2 人日→1-1.5 小时、90% 占比、1,024 pods)仅本文独有。

## 相关页面

- [enterprise-agent](./enterprise-agent.md) — 企业业务 Agent(业务模块视角,与本页底层 infra 视角互补)
- [harness](./harness.md) — Harness 运行环境(本页"Harness 平台化"的概念基础)
- [agent-security](./agent-security.md) — Agent 安全(credential brokering、权限边界)
- [agent-reliability](./agent-reliability.md) — 可靠性/护栏
- [tool-use](./tool-use.md) — 工具调用与 dry-run
- [agent-evaluation](./agent-evaluation.md) — 验证体系演进(本页"验证优先级高于生成")
- 来源:[agent-first-citizen-infra](../sources/agent-first-citizen-infra.md)、[pm-5min-hook](../sources/pm-5min-hook.md)、[handbook-page3-rewrite](../sources/handbook-page3-rewrite.md)
- 实体:[alibaba-infra](../entities/alibaba-infra.md)
