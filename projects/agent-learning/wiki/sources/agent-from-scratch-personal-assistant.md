# 从0到1搭建 Agent:Agent 原理分析及个人助手实践(精读笔记)

> TL;DR:阿里工程师占旭鹏的 68 页长文,前半部分按时间线梳理 Agent 技术栈九个演进阶段(LLM→记忆→RAG→Function Call/MCP→Agent Loop→Skill→Multi-Agent→Harness→本地客户端),后半部分以"个人云端通用助手"项目为例,逐模块给出带代码的工程实现:ReAct 主循环+六重保障、三步压缩三级降级的 context 管理、文件式三层记忆、Plan 即 todo 工具、四阶段渐进式 Skill 加载、受限并行 SubAgent——核心信条是"能力皆工具、按需加载、Harness 兜底"。

## 元数据

- 原文件:`D:\zuhaowan-ai\llm-wiki\sources\从0到1搭建 Agent ：Agent 原理分析及个人助手实践（长文干货）.pdf`(68 页,微信公众号文章导出)
- 文档类型:技术长文(原理综述 + 项目实践),阅读时间约 50 分钟 (p1)
- 作者:占旭鹏,发布于"阿里技术"公众号,2026-05-21 (p1)
- ingest 日期:2026-06-10
- 注:PDF 为公众号截图导出,部分表格右侧被裁切,个别单元格内容不完整,以下标 (?) 处为此原因

## 全文主线

作者把整条技术线归结为三个递进问题 (p33):

1. **LLM 知道什么** —— 知识:记忆 + RAG 扩展
2. **LLM 能做什么** —— 能力:function call + MCP + skill
3. **LLM 怎么做得好** —— 质量:agent loop + multi-agent + harness

文章亮点设计(作者前置总结,p1-2):越用越懂你的记忆系统(环境事实/用户偏好/会话动态压缩/总结沉淀 skill)、ReAct 模式下的 Plan 能力(灵活切换,简单任务零开销)、全局渐进式加载(能力以 skill 体现,function call & mcp 依 skill 按需加载)、subagent 隔离并行、harness 容错(异常归类分别处理)。

---

## 一、理论篇:九阶段演进

时间线 (p2):① LLM 万能百科 → ② 记忆(对话连续) → ③ RAG(业务/最新信息) → ④ Function Call & MCP(工具调用) → ⑤ Agent(流程编排与 ReAct/Plan) → ⑥ Skill(更精准可控) → ⑦ Multi-agent(领域专家协作) → ⑧ Harness(稳定运行框架) → ⑨ Claw(客户端接管本地电脑)。

### 01 LLM:万能百科全书 (p3)

LLM 本质是海量语料上的 next token prediction。两个核心缺陷:**无记忆**(每次 API 调用无状态)与**知识静态**(训练截止后的信息一概不知)——分别催生记忆系统和 RAG。

### 02 记忆系统 (p3-8)

- 核心问题:**如何在有限上下文窗口中为模型提供最相关的历史信息** (p3)。
- 分类:短期记忆(会话上下文、任务处理状态)vs 长期记忆(事件历史、抽象知识) (p3)。
- 短期记忆/上下文窗口管理策略梯度 (p4):滑动窗口(信息损失高)→ 摘要压缩(中)→ 分层保护(保留首尾压缩中间,中低)→ 结构化摘要(按模板字段压缩,低)→ 虚拟分页(模仿 OS 内存管理按需换入换出,极低,适合超长对话)。
- 长期记忆四个设计决策 (p4):**存什么**(环境事实/用户偏好/行为反馈/参考资料,不同类型不同更新策略)、**何时存**(agent 主动写入 vs 系统自动提取)、**如何取**(全量注入 vs 语义检索 vs LLM 判断相关性)、**如何更新**(新旧冲突处理、过期衰减)。
- 主流方案对比 (p4):Claude Code(Markdown 文件系统、分类文件、全量注入 system prompt)、ChatGPT Memory(服务端数据库、事实陈述句列表、语义检索)、MemGPT/Letta(分层虚拟内存 Core+Recall+Archival,Agent 自主搜索)、Mem0(独立记忆服务,向量+图DB)、Zep(向量+实体图+时序,混合检索)、LangGraph(框架组件、可配置)。
- **记忆 → 用户画像 → Skill 的演进** (p4-8):三个递进学习层次 (p6):
  - L1 记住事实(feedback/user 类型记忆,被动:只有被检索到才生效,可能语义不匹配而漏检)
  - L2 总结规则(记忆聚合 → 行为约束注入 system prompt,半主动:每次生效但只是约束非流程)
  - L3 形成技能(规则+流程+触发条件=自动执行能力,全自动:匹配触发条件+完整执行流程+按需加载工具)
- 核心洞察 (p5):**"记忆是被动的(遇到才回忆),而技能是主动的(匹配条件自动触发)"**;从记忆到技能的转化是从"被提醒才想起"变成"条件反射式执行"。
- 转化链路四阶段 (p5-6):Phase1 记忆积累(feedback 带 Why + How to apply)→ Phase2 模式识别(同主题 feedback 达到阈值后聚类)→ Phase3 技能生成(自动生成 SKILL.md:name/trigger/rules/workflow)→ Phase4 自动应用(后续会话自动匹配加载)。
- 两种转化路径 (p8):路径一 Agent 自主转化(如 Claude Code 方向:观察到第 3 次类似提醒后主动建议生成 Skill,透明可控但需用户确认);路径二 系统自动转化(如 Mem0 + 自动 SOP 引擎:后台定时扫描 feedback 记忆→LLM 主题聚类→同主题 ≥N 条触发生成 SKILL.md 草稿,全自动但可能过度生成需置信度过滤)。
- 记忆系统核心挑战 (p8):上下文占用、相关性检索、记忆过时、矛盾处理、安全威胁(记忆注入攻击)。
- 反直觉经验 (p8):**"对于个人助手场景,几千字符的有界文件记忆往往比复杂的向量检索系统更实用"**。关键在于分类要清晰、**安全要前置(写入时扫描,而非读取时)**、演进要有梯度(记住事实→总结规则→沉淀技能)。记忆系统核心价值不在于"能存多少",而在于"能否减少用户的重复表达"。

### 03 RAG (p9-11)

核心思路:先检索,再生成。流水线:离线索引(文档分块→Embedding→向量库)+ 在线查询(query 向量化→相似度检索→Re-rank→拼 prompt→生成)。

- **Chunking** (p9):固定大小 / 递归分割(LangChain 默认)/ 语义分块 / 结构感知(Markdown/HTML/PDF 段落)/ Agentic(LLM 判断归属)。生产经验:**chunk size 典型 256-1024 tokens,overlap 10-20%**;chunk 越大上下文越完整但检索精度越低;推荐递归分割 + 元数据增强(标题层级、页码、文件路径)。
- **Embedding 选型** (p9-10):OpenAI text-embedding-3-small(1536 维,性价比高)、BGE-M3(1024 维,100+ 语言,dense+sparse)、GTE-Qwen2(阿里,中文表现极强)、Jina-embeddings-v3(8K 长上下文)、Cohere embed-v3。建议:中文首选 BGE-M3 或 GTE-Qwen2(开源免费),英文 OpenAI text-embedding-3-small。
- **向量存储** (p10):ChromaDB(嵌入式,<百万)、pgvector(PG 扩展,<千万)、Qdrant(独立服务,亿级,Rust)、Milvus(分布式,百亿级)、Pinecone(全托管 SaaS,十亿级)。
- **检索优化** (p10):
  - Hybrid Search:`最终得分 = α×向量语义得分 + (1-α)×BM25关键词得分`;纯向量对专有名词(AgentLoop、McpService)效果差,BM25 可精确命中。
  - Re-ranking:检索 Top-50 → Cross-Encoder 精排 → 取 Top-5;**生产中 re-ranking 几乎是标配,精度提升 10-30%**。
  - Query Transformation:Query Rewriting / Decomposition / HyDE(LLM 先写假设答案再用其 embedding 检索)/ Multi-query。
- **高级 RAG 模式** (p10-11):Naive RAG → Advanced RAG(Hybrid+Rerank+查询变换)→ Agentic RAG(Agent 自主决定何时检索/检索什么/结果是否足够,多轮自适应)。Self-RAG(生成中自我评估是否需要检索/是否忠实)、CRAG(检索结果质量评估:Correct 用 / Incorrect 丢弃改用 Web Search / Ambiguous 两者都用,显著减少幻觉)。本项目采用 Agentic RAG。
- 评估:RAGAS 框架四指标 (p11):Faithfulness(回答忠于检索内容)、Answer Relevancy、Context Precision、Context Recall。

### 04 Function Calling & MCP (p11-14)

- 里程碑 (p11):2023.06 OpenAI 引入 Function Calling → 2023.11 Parallel FC → 2024.01 各厂跟进 → 2024.08 Structured Outputs(100% 符合 JSON Schema)→ **2024.11 MCP 发布(Anthropic)** → 2025.03 MCP Streamable HTTP(替代 SSE)。
- 本质 (p11-12):LLM 在"该调用工具时"输出结构化调用指令而非自然语言;**LLM 只负责"决策"(选工具+生成参数),实际执行由应用侧完成——决策-执行分离确保安全可控**。
- MCP (p12-13):解决"工具定义硬编码在应用中"的问题,**建立工具的标准化通信协议,即插即用(对比 function call 无技术差异,本质是约定一套标准规范)**。架构:Host(管理多个 Client 生命周期)/ Client(与单个 Server 1:1 连接)/ Server(暴露 capabilities)。协议层 JSON-RPC 2.0(`tools/list`、`tools/call`)。除 Tools 外还有 Resources(可读数据源)、Prompts(预定义模板)、Sampling(Server 反向调用 LLM)四类能力。
- 选型建议 (p14):**工具 <5 个且只对接一个 LLM 平台 → 直接 Function Calling;工具 >10 个、需跨平台复用或由不同团队提供 → MCP**。
- 工程挑战 (p14):工具选择准确性(工具多时 LLM 选错)、参数提取可靠性(JSON 格式错误/缺字段)、嵌套参数包装(LLM 展平嵌套参数)、工具名拼写(大小写/格式错误)、上下文占用(几十个 tool schema 占满 prompt)。

### 05 Agent Loop (p14-16)

- **Agent 本质上是一个循环(loop)**——不断让 LLM 思考下一步做什么、执行操作、观察结果,再决定下一步,直到任务完成或达到退出条件 (p14)。
- 五种范式对比 (p14-15):ReAct(交替 Thought/Action,实现极简=一个 while 循环,复杂度低、灵活可观测)、Plan-then-Execute(先完整计划再执行,中,全局规划合理)、Plan-React 混合(先规划再执行、执行中可动态调整,中高)、LATS(MCTS 树搜索探索多条路径,高,可回溯找更优解)、Reflexion(失败后自我反思存入记忆,中,从失败中学习)。
- **当前生产环境中 90% 以上的 agent 采用 ReAct 为主循环 + 可选 Plan 能力的混合模式** (p15),自动根据任务复杂度判断是否规划,执行中可重新规划。生产级架构关键保障:迭代预算(防无限循环)、上下文压缩(防溢出)、错误重试(防临时故障)、工具修复(防格式错误)。
- 本项目方案 (p16):**ReAct 循环中通过 `todo` 工具嵌入 Plan 能力,简单任务零开销,复杂任务自动启用计划**。

### 06 Skill (p16-17)

- 工具数量增长的两个矛盾 (p16):一是上下文占用——**50 个工具的 schema 可能占 50000 tokens**;二是选择困难——LLM 面对太多工具选择准确率显著下降。
- Skill 灵感来自 OS 的**按需加载(lazy loading)**,即**渐进式加载(Progressive Disclosure)** (p16)。
- Token 效率对比 (p16):传统全量注入 ~50,000 tokens(每工具 ~1000)= 1x;Skill Advertise ~5,000 tokens(每 skill ~100 摘要)= 10x;Skill Load 后 +1,000~3,000 tokens(仅加载用到的 1-2 个 skill)。
- 关键洞察 (p16):**大多数对话只会用到 1-2 个 skill,没必要让 LLM 看到所有工具的完整定义**。
- **Skill = SOP + 工具 + 资源** (p17):每个 Skill 自带完整"操作手册"(SKILL.md + references/ + scripts/),价值在于 LLM 不是在"猜"怎么用工具,而是在"按手册操作"——像给新员工 SOP 文档而非只告诉他工具箱在哪里。

### 07 Multi-Agent (p17-25)

- 单 Agent 三大困境 (p17):上下文膨胀(对话越长越容易"忘事",压缩也有不可逆信息损失)、注意力分散(一个 system prompt 难兼顾,复杂任务容易"跑偏")、串行瓶颈(独立子任务只能排队)。
- 七种协作模式(均给出人类团队类比、ASCII 架构图、代表产品、优劣、适用场景,p17-24):
  1. **Orchestrator-Worker 主从委托**:并行快、上下文隔离;Orchestrator 是单点瓶颈、Worker 间无法直接通信。代表:Claude Code(subagent)、本项目 DelegateManager、AutoGen。
  2. **Sequential/Pipeline 接力传递**:流程清晰可控、每步可审计;串行慢、一步出错全部受影响、反馈回环困难。代表:GitHub Copilot Workspace、CI/CD。
  3. **Peer Discussion/Debate 对等讨论**:多角度避免盲点、决策质量高;Token 消耗极高、易陷入无意义循环辩论。代表:ChatDev、CAMEL、MetaGPT。适用决策类问题。
  4. **Hierarchical 层级分治**:适合超大型任务;层级增加延迟和通信成本、易"传话走样"、实现复杂度极高。代表:MetaGPT(CEO/CTO/PM/Engineer)。
  5. **Competition/Voting 竞争选优**:同一问题发给多个 Agent(可不同模型/策略),Judge 投票/评分/综合;质量高、鲁棒;Token 成本 N 倍。代表:LLM-as-Judge、AlphaCode、self-consistency。
  6. **Generator-Critic 评估反馈**:生成者+评估者循环迭代至达标(需最大迭代限制);质量持续提升、两者可用不同模型(生成用快模型、评估用强模型);Critic 本身可能不可靠、可能过度修改。代表:Reflexion、Self-Refine、Constitutional AI。
  7. **Router/Dispatch 动态路由**:轻量分类器把请求路由给专家 Agent(各有专属 system prompt + 专属工具);响应快、易水平扩展;Router 可能分错类、跨领域问题需转交。**本项目的 Skill advertise→load 本质上是一种路由** (p23)。
- 生产组合使用 (p24):成熟系统会组合多种模式。本项目 = Router(skill 路由)+ Orchestrator-Worker(DelegateManager)+ 隐式 Generator-Critic(ReAct 循环中 LLM 自评是否完成)。Claude Code 同样是 Router + Orchestrator + Generator-Critic + Pipeline 的组合。
- 核心收益 (p24):上下文隔离(主 agent 只看任务+结果)、并行执行(3 个 20s 子任务并行)、失败隔离、专家化、质量提升(交叉验证减少幻觉和遗漏)。
- 关键设计挑战 (p25):任务拆解粒度(太细通信开销大、太粗失去并行意义)、结果聚合、资源控制(防递归创建 Agent:并发数限制+超时+深度限制)、状态一致性(通过主 agent 转发/共享存储)、错误传播(每步输出验证)、成本控制(Token 是单 Agent 数倍,按需使用)。

### 08 Harness (p25-32)

- 定义 (p25):**包裹在 Agent 核心循环外层的运行时保护框架,不改变决策逻辑,负责让 Agent 在真实世界中"活得够久、跑得够稳"**。2024-2025 随 Agent 从 Demo 走向生产被正式提出。
- 代表项目 (p25):DeerFlow(ByteDance)、DeepAgents(LangChain)、SWE-agent(Princeton)、Parlant(Emcie)、OpenHarness(HKUDS)、Hive(Aden)、desloppify、CascadeFlow、Harmonist(GammaLab,186 agents 协议强制执行)、saifctl、avakill 等。趋势:**Harness 正在成为与 Agent Loop 平级的一等公民**——Agent Loop 是"大脑",Harness 是"免疫系统+骨骼+皮肤" (p25)。
- 为什么需要 (p26):**LLM 错误率并不低(工具调用格式错误约 5-10%,幻觉率更高),只是 Harness 将其屏蔽了。没有 Harness 的 Agent 不是不能跑,而是跑不过 24 小时**。
- 六大子系统:
  1. **错误分类与恢复** (p26-27):核心原则"**不是所有错误都值得重试,但所有错误都需要被分类处理**"。三分类:瞬态错误(网络超时/连接断开/500)→ 指数退避重试+随机抖动 max 3 次;速率限制(429/并发限制/配额)→ 尊重 Retry-After 头或递增等待;永久错误(API Key 无效/模型不存在/内容违规/Schema 不匹配)→ 终止+报告用户。进阶策略(OpenHarness):模型降级(GPT-4 失败回退 GPT-3.5)、提供商切换、请求拆分。**Jitter 防惊群效应(Thundering Herd)**:`exponential_backoff_with_jitter = min(base*2^attempt + uniform(0, exp*0.5), 60)`;AWS 推荐 Full Jitter 变体 `random.uniform(0, min(cap, base*2^attempt))` (p27)。真实案例:Anthropic SDK 内置 2 次自动重试+指数退避;OpenAI SDK 默认重试 429/500/503。
  2. **Context Engineering** (p27-28):Parlant 定义为框架核心——"getting the right context, no more and no less, into the prompt at the right time"。**上下文管理不只是防溢出,更是让 Agent 在有限窗口内保持最优决策能力**。四阶段渐进策略:60% 窗口预警(标记可压缩区,无损失,Claude Code 做法 (?))、70% 自动压缩(LLM 结构化摘要替换早期消息,低损失,LangChain (?))、80% 工具结果截断(只保留 summary,中,OpenHarness (?))、90% 紧急模式(仅保留 system prompt+最近 3 轮,高,SWE-agent (?))。Parlant 的创新:**上下文窄化(Context Narrowing)**——按当前对话主题只注入相关规则/知识/工具描述,从"事后压缩"到"事前精选"。
  3. **Iteration Control** (p28-29):无限循环是生产中最常见"静默杀手"——不会崩溃但持续烧 Token。三层防护:Layer1 硬性预算(最大迭代如 200 轮、最大 Token 消耗如 $5/次、最大执行时间如 30 分钟,任一触发强制终止+输出摘要);Layer2 模式检测(重复检测:同工具+同参数连续 N 次;震荡检测:A→B→A→B;空转检测:连续 N 轮无新信息 → 注入反思提示/强制 re-plan/终止);Layer3 进展评估(里程碑机制每 N 轮评估"离目标更近了吗"、衰减因子、LLM 自评置信度低于阈值终止并交还控制权附进展报告)。SWE-agent:cost limit $3/实例,超出强制停止并提交当前最优 patch。DeerFlow:迭代衰减——前 10 轮权重 1.0,之后每轮 0.95^n 递减,累积低于阈值判定"边际收益不足"自动终止。
  4. **Tool Governance** (p29-30):工具调用是最大风险点(副作用且不可逆)。完整生命周期:参数校验清洗(JSON Schema/必填/类型转换/注入检测)→ 权限检查审batch(白名单黑名单/路径范围/危险操作需审批/频率限制)→ 参数修复容错(大小写归一/camelCase↔snake_case/Levenshtein 模糊匹配/缺失参数默认值)→ 沙箱执行(Docker 容器〔SWE-agent、OpenHands〕/WASM/文件系统虚拟化/seccomp/AppArmor)→ 结果验证后处理(返回大小限制/敏感信息脱敏/格式标准化)。avakill:YAML 声明式策略引擎执行前拦截(如 args 含 `rm -rf` → deny;外部 URL → ask_user)。saifctl:规格驱动,先定义 Agent 能力边界 spec,运行时确保不越界(类形式化验证)。
  5. **Security** (p30-31):Agent 特有威胁——**间接提示注入(Indirect Prompt Injection):Agent 处理的内容本身就可能是攻击载荷**。三攻击面:输入侧(直接注入/对抗 prompt);工具返回侧(最危险:网页内容含"Ignore previous instructions"、文件嵌入隐藏指令、API 恶意 payload、邮件操纵);输出/持久化侧(泄漏 system prompt/凭证出现在回复/记忆投毒影响后续行为)。防护矩阵:间接注入→模式匹配+语义分类器(工具返回后、送入 LLM 前);凭证泄漏→正则输出流过滤;路径穿越→规范化+白名单;命令注入→Bash 参数清洗;记忆投毒→写前内容可信度评估;System Prompt 泄漏→输出标签检测+围栏去除。**深层防御原则 Defense in Depth:输入、处理、输出三层各设独立检测,任何一层失守后面仍能拦截** (p31)。
  6. **Observability** (p31):Agent 不确定性远超传统软件,没有可观测出问题只能"重现一下看看"。三支柱:Logging(每轮决策、工具入参出参、错误上下文、安全事件审计)、Tracing(端到端链路、父子 Agent 关系、工具耗时、压缩/降级事件)、Metrics(Token/轮/成本、成功率/重试率、延迟分布、循环检测触发率)。关键追踪维度:Session → Turn → LLM Call → Tool Call → Sub-Agent。代表工具:LangSmith / Langfuse / OpenTelemetry / Helicone。
- **7 条 Harness 设计原则** (p31):分类先于处理(必须先诊断错误类型)、渐进式降级(从温和到激进)、静默优先(能内部恢复的异常不暴露给用户)、预算有限(任何自动恢复都必须有上限)、可观测(静默≠无记录,所有操作必须可审计)、最小权限(工具权限按需授予,危险操作需审批)、声明式策略(安全规则外置为配置,非硬编码)。
- 结论 (p32):**Harness 是 Agent 从「能跑」到「能用」的关键分水岭**,正从"各家自建"走向"标准化框架"。

### 09 Claw:本地客户端 Agent (p32)

2024-2025 出现根本性转变——Agent 以本地客户端形式跑在用户电脑上,直接操控工作环境。实现上区别不大,核心是可获取本地信息、操作本地文件。关键差异:**消除了"告诉用户怎么做"和"用户实际执行"之间的断层——直接动手做,形成完整的"决策-执行-验证"闭环** (p32)。作者注:实际 agent 尚未跑出一个很划时代的范式,仍在探索阶段 (p33)。

---

## 二、实践篇:个人助手项目架构

项目定位:云端通用 agent,处理用户日常问题,后续通过沉淀 mcp 和 skill 持续扩展能力 (p33)。总设计原则:**核心是一个 loop;能力层尽可能抽象,对编排层暴露尽可能少的接口,让 loop 流程尽量简洁,提高持续迭代的可维护性** (p33)。

### 02 核心 Loop:ReAct + 六重保障 (p33-43)

核心方案:**ReAct 主循环(按需可 plan)+ 六重保障(预算/压缩/重试/修复/中断/防抖)** (p33)。

循环每轮顺序 (p34, `agent/loop.py`):预算检查(IterationBudget,默认 90 轮 (?),耗尽生成工作摘要优雅退出)→ 中断检查(`_interrupt_requested`,保存状态退出)→ 上下文压缩检查(token ≥75% 窗口触发三步压缩+注入 Todo 状态)→ 记忆预取(提取用户最近 query → 预取记忆注入 `<memory-context>` 围栏)→ **THINK** 调用 LLM(`_api_call_with_retry`:失败走 ErrorClassifier 分类:瞬态→指数退避+抖动重试 / 上下文溢出→压缩后重试 / 永久→报告用户退出)→ 空响应防护(content 和 tool_calls 均空计数 +1,连续 2 次注入提示引导、超限终止)→ 分支:有 tool_calls → **ACT**(ToolDispatcher:工具名修复模糊匹配、参数 JSON 修复、权限校验、执行、结果写入 messages,回到循环顶部);无 → **DONE**(同步记忆、保存会话、输出最终回答)。

六重保障一览 (p35):① IterationBudget ② `_interrupt_requested` ③ ContextCompressor(token ≥75%)④ ErrorClassifier + jittered_backoff ⑤ 空响应计数器 ⑥ ToolDispatcher 工具修复。

**上下文压缩(整个 Loop 最复杂的子系统)**:

- 触发时机:prompt token 达 context_length × **75%**。为什么不是 90%?要给 LLM 留 completion tokens 空间(也占窗口),且压缩本身要调 LLM(也需要 token),所以预留 25% 余量 (p35)。
- **三步压缩** (p36):
  - Step1 划分保护区:HEAD 保护区(前 3 条:system + 首轮对话——system prompt 含角色定义和工具列表,丢失即"失忆";首轮通常含用户核心目标)+ TAIL 保护区(后 6 条/最近 3 轮——最近对话是 LLM 决策的直接依据,丢失会重复劳动);MIDDLE 为压缩目标。
  - Step2 修剪 MIDDLE 区工具输出("物理压缩",通常减少 40-60% token):`_summarize_tool_result` 按工具类型生成单行摘要——terminal 提取命令+exit_code(`[terminal] ran 'pytest tests' -> exit 1, 42 lines output`)、read_file 提取路径+偏移、write_file 提取路径+写入行数、search_files 提取模式+匹配数;其他工具 ≤200 字符保留、否则截前 150 字符 (p37)。设计思路:这些信息足以让 LLM 在摘要中"回忆起"之前做了什么,而不需保留完整输出(动辄几千字)。
  - Step3 LLM 驱动结构化摘要:把修剪后的 MIDDLE 发给 LLM 按 **13 个字段**生成摘要(Active Task〔用户最近未完成请求,逐字复制〕/ Goal / Completed Actions〔含工具名和结果〕/ Active State〔当前工作状态:目录/分支/文件〕/ In Progress / Blocked / Key Decisions / Remaining Work / Critical Context〔绝不含密钥〕等)(p36)。summarizer 指令要点:把对话当 source material 做 compact record、**摘要使用用户的语言**(中文对话输出中文摘要)、**NEVER include API keys/tokens/passwords — replace with [REDACTED]** (p38)。输入限 max_total_chars=15000(约 3750 tokens),每条消息截 500 字;摘要预算 `min(max(200, content_tokens × SUMMARY_RATIO≈0.3), 2000)` tokens (p38)。双重保险:LLM 不可用时回退到基于规则的 `_build_structured_summary`。
  - 效果:100+ 条消息 → 约 10 条,token 减少 60-80% (p36)。
- **三级降级**(标准压缩后仍超限,如单轮工具输出 80K token,p39-40):降级① 损失低:尾部保护从 6 条减到 3 条再压;降级② 损失中:删除最早 10 条工具结果消息;降级③ 损失高:只保留 system prompt + 最近 3 轮 + 插入 `[Context overflow]` 说明消息(Agent 相当于"重启")。
- **压缩防抖** (p40):若最近几次(保留 5 次记录)压缩平均节省率 <10%(COMPRESSION_DEBOUNCE_THRESHOLD=0.1),跳过压缩避免浪费 LLM 调用(如单条 system prompt 占 60% 窗口的场景反复压也压不下来)。
- **Todo 状态注入** (p40-41):压缩可能把 todo 工具调用的历史消息压掉导致 LLM "忘记自己做到哪了"。解法:压缩完成后 `_inject_todo_state` 把未完成 todo 作为独立 user 消息注入(插到尾部保护区之前)。为什么不放 system prompt:system prompt 是固定的而 todo 动态变化,且在保护区内不会被压缩、放里面只会越来越大。

**错误分类器** (p41-43, `agent/error_classifier.py`):FailoverReason 枚举 15+ 种错误原因,每种带不同恢复策略:auth(临时认证→换凭证)/ auth_permanent(终止)/ billing(终止)/ rate_limit(等待后重试)/ overloaded(切换提供商)/ server_error(重试)/ timeout(重试)/ **context_overflow(不是重试,而是压缩后重新发送)** / model_not_found(终止)/ format_error(终止)等。三层匹配:Layer1 HTTP 状态码(429→rate_limit、402→billing、401/403→auth、500/502→server_error、503/529→overloaded、400→进一步检查可能是溢出);Layer2 错误消息模式("context length"/"too many tokens"→溢出、"rate limit"/"throttled"、"invalid api key",含中文模式"超过最大长度",云厂商特定如阿里云"rate increased too quickly");Layer3 异常类型名兜底(ReadTimeout/ConnectError/SSLError→timeout,其他→unknown 但标记 retryable)。重试参数:RETRY_BASE_DELAY 默认 5s、RETRY_MAX_DELAY 默认 120s (p42)。线上实例 (p42-43):OpenAI 429、400 "context length exceeded"、401、阿里云 DashScope "rate increased too quickly"、Anthropic 529 Overloaded、ConnectionResetError、vLLM "exceeds the max_model_len"、404 "model not found"。

### 03 记忆模块 (p43-46)

三部分设计 (p43):

1. **跨会话长期记忆(持久化文件)**,三个文件分存不同维度、按需取用:
   - `MEMORY.md`(2200 字符)— 环境事实、项目约定
   - `USER.md`(1375 字符)— 用户画像、偏好
   - `db`(不限字数)— 会话历史
2. **记忆预取注入(每轮对话前)**:相关记忆以 `<memory-context>` 围栏注入 messages。
3. **会话内短期记忆(messages 数组)**:超 75% 窗口触发压缩。

- **写入**:LLM 主动调用 `memory` 工具,schema description 详细写明何时保存(WHEN TO SAVE proactively:用户纠正你或说 remember this / 用户分享偏好习惯个人信息 / 发现环境事实 / 学到约定、API quirk、workflow)、两个 target('user'=用户是谁,'memory'=环境事实和项目约定)、三个 action(add/replace/remove,old_text 定位)、SKIP 琐碎信息 (p43-44)。用户画像的具体规则交给模型总结,**总结后做安全扫描(`scan_context_threats`),通过才保存**——安全前置在写入时 (p44)。
- **预取注入实现** (p45):每轮先移除上一轮围栏消息(`_is_memory_fence` 标记,避免累积)→ 反向找最近 user query → `prefetch_all` → 包装为 `<memory-context>` 围栏 user 消息 append。围栏文本明确告诉 LLM:"this is recalled memory context, NOT new user input. Treat as authoritative reference data"。构建前先 `sanitize_context` 剥离可能嵌套的围栏标签(防注入)。
- **StreamingContextScrubber** (p46-47):流式输出清理器,防止 `<memory-context>` 标签泄漏给用户。难点:流式 delta 可能把 16 字符的标签拆在两个 delta 中;方案:有状态缓冲区,未见完整开标签前只输出 safe 部分(保留尾部可能是截断标签的字符),`flush()` 时丢弃未关闭围栏内容。

### 03b 工具模块 (p47-52)

- **通用性抽象**:所有能力均是工具;核心分 schema、registry、handler 三模块,分别控制 LLM 交互、工具注册、工具执行 (p47)。`register(name, schema, handler, check_fn, is_async, toolset, description)` 注册到注册表;dispatcher 从 registry `get_tool` 拿到 entry 再调 handler。
- **MCP 工具按需注入** (p49):`load_skill` 触发时,`inject_skill_mcp_tools` 把该 skill 声明的 MCP 工具 schema 注入 tools 列表(去重后 append)——调用模型的 tool 列表中只有当前需要的 MCP 工具,免得上下文过长或失焦。
- **工具参数 JSON 修复** (p50, `repair_tool_arguments`):LLM 返回的参数常见格式问题,依次尝试:策略1 清理 surrogate 字符(encode/decode utf-8 errors=replace)→ 策略2 补全缺失的右括号/右方括号(按计数补 `}`/`]`)→ 策略3 删除尾随逗号再补括号 → 全失败返回 `{"raw_input": raw_arguments}` 供 LLM 查看。
- **嵌套参数自动包装** (p50-51, `_normalize_mcp_arguments`):部分 MCP 工具 inputSchema 是嵌套包装(`{request:{query:...}}`),LLM 常展平为 `{query:...}`;检测 schema 只有一个 object 属性且参数 key 落在内层 properties 时自动包回。
- **工具名多策略修复** (p51-52, `_repair_tool_name`):策略1 小写直接匹配 → 策略2 标准化(`-`/空格→`_`)→ 策略3 候选集(camelCase→snake_case、剥 `_tool`/`-tool`/`tool` 后缀,两轮扩展交叉组合)→ 策略4 difflib 模糊匹配(相似度 ≥0.7 取 n=1)。实例:`QueryWeather`→camelToSnake、`QUERY_WEATHER`→小写、`query_weather_tool`→strip 后缀、`qeury_weather`(拼写错误)→difflib。
- **工具进度预览** (p52, `_build_tool_preview`):为 delegate_task/memory/todo/搜索类工具生成人类可读的进度文案("正在委托子代理执行 — {goal[:40]}"),通过 callback 推送前端,让用户感知 agent 在调什么工具。

### 04 SubAgent 设计 (p52-56)

- 设计目标:复杂任务可拆解并行执行,同时确保子任务不会失控 (p52)。
- **子 agent 也是一个工具**:`delegate_task(goal, context, role)`,role ∈ {leaf, orchestrator},默认 leaf;leaf 不能再委托,orchestrator 可继续(`enable_delegate = role=="orchestrator" and current_depth < max_depth-1`)(p53-54)。
- 执行流程 (p52):深度检查(超限降级为 leaf 禁止递归)→ 并发检查(活跃子 agent ≥3 时等待)→ 提交 ThreadPoolExecutor(延迟创建)→ 带超时等待 Future。每个子 agent:独立 IdleAgent 实例、独立 messages 历史、独立迭代预算(50)、独立 TodoStore、受限工具权限。
- 子 agent 身份提示词 (p54):custom_identity 注入"你是一个子代理"+ 执行纪律 + 任务目标 + 上下文 + 工作边界 + 结果格式 + 技术约束(角色/最大迭代/禁用工具/完成立即给最终回答);LLM 继承父 agent 的。
- **DelegateResult 结构化指标** (p55):goal/success/final_answer/error/tool_calls_count/iterations_used/tokens_used/duration_seconds。为什么记录:主 Agent 据此判断子任务质量——**"如果一个子 agent 用了 50 次迭代(预算耗尽)但声称成功,主 agent 应该怀疑结果的完整性"**;指标也展示给用户。
- 资源控制四维度 (p55):并发最多 3 个子 agent(防 API 并发耗尽)、迭代预算子 agent 独立 50 次、超时 600 秒强制取消、深度最多 1 层委托(防无限嵌套)。
- **权限隔离** (p55-56):子 agent(leaf)禁用 delegate_task(防止递归)、**memory(并行执行下多个子 Agent 可能冲突写入,记忆修改应由主 Agent 统一决策)**、clarify(子 Agent 在线程池中无法与用户交互,允许会阻塞等待而用户看不到请求);可用 load_skill、MCP 工具(enabled_toolsets 继承)、独立 todo、内置工具。

### 05 ReAct 模式下的 Plan 能力(Plan 即工具)(p56-60)

- 设计目标:简单任务不增加额外开销,复杂任务自动获得全局规划能力。**核心方案:Plan 不是模式切换,而是 ReAct 循环中的一个普通工具(todo)** (p56)。传统做法需要 ReAct 和 Plan 之间切换模式(两套循环逻辑),本项目"Plan 即工具",和 query_weather 没有本质区别。
- 同一个 ReAct 循环:简单任务 Think→Act(query_weather)→Answer;复杂任务 Think→Act(todo:创建计划)→Act(step1 工具)→Act(todo:更新状态)→…;计划调整 Think(发现新情况)→Act(todo:替换整个计划) (p56)。
- Todo 行为规范完全写在工具 description 中,不污染 system prompt (p56):管理当前 session 任务列表;3+ 步复杂任务或用户给多个任务时使用;无参调用=读取;merge=false(默认)替换整个列表、merge=true 按 id 增量更新;item={id, content, status: pending|in_progress|completed|cancelled};列表顺序即优先级;同一时间只有一个 in_progress;完成立即标 completed。
- **每次返回完整列表+统计摘要**(total/pending/in_progress/completed):因为 LLM 没有"记住上次工具调用结果"的可靠能力,只返回 diff 容易忘其他任务状态;完整列表多耗 tokens 但保证全局视角 (p57)。
- 存储刻意选最简方案:纯内存 `list[dict]`,无数据库无文件 IO——todo 是会话级的,下次对话不需要;持久化只会增加复杂度 (p57)。
- 写入两种语义 (p58):替换模式(新计划/推翻重来)vs 合并模式(按 id 更新状态/追加新步骤,只更新 LLM 实际提供的字段);`_dedupe_by_id` 同批内按 id 去重保留最后一个(LLM 有时同一调用中发重复 id);`_validate` 缺失字段安全降级(无效 status 回退 pending)。
- TodoStore 每个 agent 实例私有,由 ToolDispatcher 运行时注入 store 参数;**不用全局单例:主/子 agent 共享任务列表会互相干扰** (p59)。
- **压缩存活** (p59-60):`format_for_injection()` 仅输出 pending 和 in_progress(已完成/取消的会导致 LLM 在压缩后误以为需要重做),markers:completed=[x]、in_progress=[>]、pending=[ ]、cancelled=[~];压缩后注入回 messages。会话从持久化恢复时 `hydrate_todo_store` 反向扫描消息历史找最近一个含 todos 的工具返回值恢复状态。
- 对比传统方案优势表 (p60):简单任务零开销(传统也要 Plan 阶段)/只有一套 ReAct loop(传统需两套)/todo(merge=False) 随时换计划(传统需专门 re-plan 触发机制)/format_for_injection 保证压缩存活(传统计划可能压缩丢失)。

### 06 Skill 设计 (p60-66)

- 问题量化 (p61):50+ 工具全注入 → context 膨胀(每工具 schema 约 200-500 tokens,50 个占 10K-25K)、选择困难(**实测超过 20 个工具后 LLM 选对概率明显下降**)、指令冲突(不同场景操作规范混在一起 LLM 容易串台)。
- 方案:**把工具+指令+资源打包成一个"能力包",按需加载。LLM 平时只看到"这里有 N 个能力可用"(每个约 100 tokens),选中后才展开完整指令和工具** (p61)。
- Skill = 独立目录,核心是 `SKILL.md`(YAML frontmatter 元数据 + Markdown body 操作手册),可选 `scripts/`(可执行 Python)、`references/`(参考文档)、`assets/` (p61)。frontmatter 字段:name、description、tools(声明需要的全局 MCP 工具)、metadata.max_rounds(skill 内 ReAct 最大轮次)、mcp_servers(skill 专属 MCP server,非共享)。
- 为什么 YAML frontmatter 而非 JSON 配置:SKILL.md 给两个"读者"——人看 Markdown body 理解操作规范,机器解析 frontmatter 获取元数据;一个文件解决两个问题,减少同步维护负担 (p62)。
- **四阶段渐进式加载** (p62):
  1. **Advertise**(启动时一次性):扫描 skill 目录解析 frontmatter,注入 system prompt 摘要(`- log-diagnosis: 日志诊断助手...`),开销 ~100 tokens/skill。支持 `disable-model-invocation` 元数据(只能用户主动触发、不自动加载)。
  2. **Load**(按需):LLM 判断匹配 → `load_skill()` 返回完整 SKILL.md body(操作手册),同时触发 `inject_skill_mcp_tools` 注入 MCP 工具,开销 500-2000 tokens 仅在需要时。
  3. **Read**(按需):指令中引用了参考资料时 `read_skill_resource("references/error-patterns.md")`,含路径穿越安全检查(`os.path.realpath` 比较,资源必须在 skill 目录内);资源找不到时列出可用资源帮 LLM 自我修正 (p64)。
  4. **Run**(按需):`run_skill_script("scripts/parse_trace.py", args=[...])`,subprocess + **30s 超时**(防死循环)+ cwd 设为 skill 目录,同样做路径穿越检查;stderr 和 exit code 拼回输出 (p64)。
- **条件注册** (p64-65):按能力有无注册——load_skill 始终注册(只要有 skill);read_skill_resource 仅当存在含资源文件的 skill 时注册;run_skill_script 仅当存在含脚本的 skill 时注册。原因:每个注册的工具占 tokens,系统中无任何 skill 包含脚本时 run_skill_script 定义是纯浪费(约 200 tokens);条件注册确保 LLM 看到的每个工具都是实际可用的。
- **skill 的四源工具组装** (p65-66, `get_all_tools_for_skill`):①scoped 原生工具 run_script(把可用脚本列表写入 description 帮 LLM 选)②scoped read_resource ③全局 MCP 工具(SKILL.md tools: 字段引用,从 McpService 取完整定义)④skill 专属 MCP 工具(mcp_servers: 字段,启动时已连接、工具定义已缓存)。
- **分发路由优先级** (p66, `dispatch_tool_call`):scoped run_script → scoped read_resource → skill 专属 MCP → 全局 MCP(兜底)。**为什么 scoped 优先级最高:scoped 原生工具是 skill 自带的、不依赖外部服务、执行最快且最可靠;如果全局 MCP 恰好有同名工具,scoped 版本应该优先,因为它是 skill 作者特意为这个场景定制的**。
- 端到端示例 (p66-67):用户"帮我查一下圈子服务昨天的报错日志"→ LLM 看到 system prompt 中 skill 摘要 → 匹配调用 load_skill("log-diagnosis") → 返回完整 SKILL.md 并注入 query_sls_logs 工具 → 按手册执行:①query_sls_logs(time_range=昨天, keyword=ERROR) ②read_resource("references/error-patterns.md") ③综合分析输出结构化诊断报告 → 用户看到"发现 3 类错误:1) NullPointerException..."。

---

## 三、关键细节与数据汇总

- 上下文窗口演进:早期 4K tokens → 现在 128K-1M (p4)
- chunk size 典型 256-1024 tokens,overlap 10-20% (p9)
- Re-ranking 生产几乎标配,精度提升 10-30%;Top-50 → Cross-Encoder → Top-5 (p10)
- 工具 <5 个用 Function Calling,>10 个用 MCP (p14)
- 90%+ 生产 agent 用 ReAct 主循环 + 可选 Plan (p15)
- 50 个工具 schema ≈ 50,000 tokens;Skill Advertise ≈ 5,000 tokens(10x);Load 后 +1,000-3,000 (p16)
- 每工具 schema 200-500 tokens;>20 个工具后 LLM 选择准确率明显下降(实测)(p61)
- LLM 工具调用格式错误率约 5-10% (p26)
- 重试:指数退避 `base*2^attempt` + 0~50% 随机抖动,上限 60s,max 3 次;AWS Full Jitter 变体 (p27);项目内 RETRY_BASE_DELAY=5s、RETRY_MAX_DELAY=120s (p42)
- Anthropic SDK 内置 2 次自动重试;OpenAI SDK 默认重试 429/500/503 (p27)
- 上下文分阶段:60% 预警 / 70% 压缩 / 80% 截断 / 90% 紧急 (p28);本项目压缩触发 75%(留 25% 给 completion 和压缩调用)(p35)
- SWE-agent cost limit $3/实例;DeerFlow 迭代衰减 0.95^n (p29)
- 压缩:HEAD 保护前 3 条、TAIL 保护后 6 条(约 3 轮);物理修剪减 40-60%;13 字段结构化摘要;summarizer 输入上限 15000 字符(约 3750 tokens)、每条消息截 500 字;摘要预算 min(max(200, 0.3×原内容), 2000) tokens;整体效果 100+ 条→约 10 条、token 减 60-80% (p36-38)
- 压缩防抖阈值:近 5 次平均节省率 <10% 跳过 (p40)
- 错误分类:15+ 种 FailoverReason,三层匹配(HTTP 状态码→消息模式→异常类型名)(p41-42)
- 记忆文件:MEMORY.md 2200 字符、USER.md 1375 字符、db 不限 (p43)
- `<memory-context>` 标签 16 字符,流式 delta 可能拆分,需有状态缓冲 (p47)
- SubAgent:并发 ≤3、迭代预算 50、超时 600s、深度 ≤1 层;主 agent 默认预算 90 轮 (?) (p35, p55)
- skill 脚本执行超时 30s,cwd=skill 目录 (p64);run_skill_script 工具定义约 200 tokens (p65)
- 工具名模糊匹配 difflib cutoff=0.7 (p51)
- MCP 时间线:2024.11 发布,2025.03 Streamable HTTP 替代 SSE (p11)

## 四、金句/洞见

- "记忆是被动的(遇到才回忆),而技能是主动的(匹配条件自动触发)" (p5)
- "记忆系统的核心价值不在于'能存多少',而在于'能否减少用户的重复表达'" (p8)
- "对于个人助手场景,几千字符的有界文件记忆往往比复杂的向量检索系统更实用——这是一个反直觉但经过验证的结论" (p8)
- "Agent 本质上是一个循环(loop)" (p14);"无论哪种范式,agent 的核心都是这个 loop" (p16)
- "Skill = SOP + 工具 + 资源……LLM 不是在'猜'怎么用工具,而是在'按手册操作'" (p17)
- "大多数对话只会用到 1-2 个 skill,没必要让 LLM '看到'所有工具的完整定义" (p16)
- "LLM 的错误率并不低(工具调用格式错误约 5-10%),只是 Harness 将其屏蔽了。没有 Harness 的 Agent 不是不能跑,而是跑不过 24 小时" (p26)
- "不是所有错误都值得重试,但所有错误都需要被分类处理" (p26)
- "如果 Agent Loop 是'大脑',Harness 就是'免疫系统 + 骨骼 + 皮肤'" (p25)
- "上下文管理不只是防溢出,更是让 Agent 在有限窗口内保持最优决策能力" (p27);Parlant:"getting the right context, no more and no less, into the prompt at the right time" (p27)
- "Agent 的无限循环是生产中最常见的'静默杀手'——不会崩溃,但会持续消耗 Token 和时间,直到预算耗尽" (p28)
- "与传统 Web 安全不同,攻击面在于 Agent 处理的内容本身就可能是攻击载荷" (p30)
- "Harness 是 Agent 从「能跑」到「能用」的关键分水岭" (p32)
- "Claw Agent 消除了'告诉用户怎么做'和'用户实际执行'之间的断层——直接动手做,形成完整的'决策-执行-验证'闭环" (p32)
- "Agent 不像传统的 Java 工程——写完、测完、上线就算交付了。它本质上是一个概率系统嫁接在确定性工程上的产物:今天跑得好好的链路,明天模型升级一个版本,可能 tool calling 的格式变了、推理偏好漂移了,一批业务场景就悄悄退化了" (p67)
- "观测比开发更重要……这不是上线后的'维护',而是 agent 工程的常态" (p67)
- "这个领域半年一个代际,一个好的架构思路(比如渐进式加载、结构化压缩)往往比堆人力调参有效 10 倍。与其闷头优化旧方案,不如花 20% 的时间看看社区在做什么" (p67)
