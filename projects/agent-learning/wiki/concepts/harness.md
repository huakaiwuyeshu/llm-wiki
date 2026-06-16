# Harness

包裹在 Agent Loop 外层的运行时保护框架,负责让 Agent 在真实世界中"活得够久、跑得够稳"——是 Agent 从"能跑"到"能用"的分水岭。

## 定义与定位

**Harness 是包裹在 Agent 核心循环外层的运行时保护框架,不改变决策逻辑,负责让 Agent 在真实世界中活得够久、跑得够稳。**作为 2024-2025 年随 Agent 从 Demo 走向生产被正式提出的概念,Harness 正在成为与 Agent Loop 平级的一等公民——**Agent Loop 是"大脑",Harness 是"免疫系统+骨骼+皮肤"**(来源:../sources/agent-from-scratch-personal-assistant.md p25;../sources/agent-evolution-map-annotated.md p87)。

核心论断:**LLM 错误率并不低(工具调用格式错误约 5-10%,幻觉率更高),只是 Harness 将其屏蔽了。没有 Harness 的 Agent 不是不能跑,而是跑不过 24 小时**(来源:agent-from-scratch-personal-assistant.md p26, p106;harness-security-subsystem.md p14;agent-evolution-map-annotated.md p84)。

跨资料视角综合:

- **个人助手长文**(agent-from-scratch-personal-assistant.md):给出六大子系统完整技术实现+7条设计原则,以工程师视角讲"怎么做"
- **Harness安全底座图**(harness-security-subsystem.md):按"不崩/不闯祸/看得见"三问归类子系统,提供六问评审清单和上线红线,以PM视角讲"怎么验收"
- **演进图注解版**(agent-evolution-map-annotated.md):定位Harness为九阶段演进史的第⑧枢纽、质量层三大支柱之一,与企业手册的Audit/工具治理/人工审核对应
- **九阶段贯穿案例**(troubleshooting-nine-stages-case.md):展示Harness在真实排查工单中的作用——容错重试(日志接口超时)、掐断循环(反复调挂掉接口)、高危转人工("重置接入方密钥")、全程留痕且appsecret不落日志

## 六大子系统

按"三问归类法"(来源:harness-security-subsystem.md p22-26):

| 问题 | 属性 | 子系统 |
|---|---|---|
| 问题一:怎么不崩? | 可靠性 | #1 错误分类与恢复、#2 迭代控制、#3 上下文工程 |
| 问题二:怎么不闯祸? | 安全性 | #4 工具治理、#5 安全防护 |
| 问题三:怎么看得见? | 可控性 | #6 可观测性 |

### 1. 错误分类与恢复

**核心原则:"不是所有错误都值得重试,但所有错误都需要被分类处理"**(来源:agent-from-scratch-personal-assistant.md p26)。

**错误三分类**(agent-from-scratch-personal-assistant.md p26-27, p41-43):

- **瞬态错误**(网络超时/连接断开/500)→ 指数退避重试+随机抖动 max 3次
- **速率限制**(429/并发限制/配额)→ 尊重 Retry-After 头或递增等待
- **永久错误**(API Key无效/模型不存在/内容违规/Schema不匹配)→ 终止+报告用户

**指数退避+Jitter**(防惊群效应 Thundering Herd):
```
exponential_backoff_with_jitter = min(base*2^attempt + uniform(0, exp*0.5), 60)
```
AWS推荐Full Jitter变体:`random.uniform(0, min(cap, base*2^attempt))`(来源:agent-from-scratch-personal-assistant.md p27)。项目实测参数:RETRY_BASE_DELAY=5s、RETRY_MAX_DELAY=120s(p42)。

**context_overflow特殊处理**:不是重试,而是**压缩后重新发送**(来源:agent-from-scratch-personal-assistant.md p41-43 ErrorClassifier)。

进阶策略(OpenHarness):模型降级(GPT-4失败回退GPT-3.5)、提供商切换、请求拆分(p27)。真实案例:Anthropic SDK内置2次自动重试;OpenAI SDK默认重试429/500/503(p27)。

工具调用容错三件套(agent-from-scratch-personal-assistant.md p50-52):
- **JSON修复**:`repair_tool_arguments` 四策略(清理surrogate字符→补全括号→删尾随逗号→全失败返回raw_input)
- **嵌套包装**:`_normalize_mcp_arguments` 检测schema单一object属性时自动包装
- **工具名模糊匹配**:`_repair_tool_name` 四策略(小写直接匹配→标准化→候选集camelCase↔snake_case→difflib相似度≥0.7)

### 2. 迭代控制

**无限循环是生产中最常见"静默杀手"——不会崩溃但持续烧Token**(来源:agent-from-scratch-personal-assistant.md p28-29, p33-43)。

**三层防护**:

- **Layer1 硬性预算**:最大迭代(如200轮,项目实现主agent默认90轮、子agent 50轮)、最大Token消耗(如$5/次)、最大执行时间(如30分钟),任一触发强制终止+输出摘要
- **Layer2 模式检测**:
  - 重复检测:同工具+同参数连续N次
  - 震荡检测:A→B→A→B循环
  - 空转检测:连续N轮无新信息 → 注入反思提示/强制re-plan/终止
  - 空响应防护:content和tool_calls均空连续2次注入提示引导、超限终止(项目实现,p34)
- **Layer3 进展评估**:里程碑机制每N轮评估"离目标更近了吗"、衰减因子、LLM自评置信度低于阈值终止并交还控制权附进展报告

真实案例:SWE-agent cost limit $3/实例,超出强制停止并提交当前最优patch;DeerFlow迭代衰减——前10轮权重1.0,之后每轮0.95^n递减,累积低于阈值判定"边际收益不足"自动终止(来源:agent-from-scratch-personal-assistant.md p29)。

### 3. 上下文工程(Context Engineering)

Parlant定义为框架核心——**"getting the right context, no more and no less, into the prompt at the right time"**。上下文管理不只是防溢出,更是让Agent在有限窗口内保持最优决策能力(来源:agent-from-scratch-personal-assistant.md p27-28)。

**四阶段渐进策略**(通用框架,p28):
- 60% 窗口预警(标记可压缩区,无损失,Claude Code做法(?))
- 70% 自动压缩(LLM结构化摘要替换早期消息,低损失,LangChain(?))
- 80% 工具结果截断(只保留summary,中,OpenHarness(?))
- 90% 紧急模式(仅保留system prompt+最近3轮,高,SWE-agent(?))

**项目实战:三步压缩+三级降级**(agent-from-scratch-personal-assistant.md p35-41):

触发时机:prompt token达context_length × **75%**(留25%给completion tokens空间+压缩本身调用)。

三步压缩:
1. **划分保护区**:HEAD保护区(前3条:system+首轮对话)+ TAIL保护区(后6条/最近3轮)+ MIDDLE为压缩目标
2. **物理修剪MIDDLE区工具输出**(通常减少40-60% token):按工具类型生成单行摘要(terminal提取命令+exit_code、read_file提取路径+偏移、其他≤200字符保留否则截前150)
3. **LLM驱动结构化摘要**:13字段(Active Task/Goal/Completed Actions/Active State/In Progress/Blocked/Key Decisions/Remaining Work/Critical Context等);输入限max_total_chars=15000(约3750 tokens),每条截500字;摘要预算`min(max(200, content_tokens × 0.3), 2000)` tokens;**摘要使用用户语言、NEVER include API keys/tokens/passwords — replace with [REDACTED]**

效果:100+条消息→约10条,token减少60-80%(p36)。

三级降级(标准压缩后仍超限,p39-40):
- 降级① 损失低:尾部保护从6条减到3条再压
- 降级② 损失中:删除最早10条工具结果消息
- 降级③ 损失高:只保留system prompt+最近3轮+插入`[Context overflow]`说明消息(Agent相当于"重启")

**压缩防抖**(p40):最近5次压缩平均节省率<10%(COMPRESSION_DEBOUNCE_THRESHOLD=0.1),跳过压缩避免浪费LLM调用。

**Todo状态注入**(p40-41):压缩可能把todo工具调用历史压掉导致LLM"忘记自己做到哪了",解法:`_inject_todo_state`把未完成todo作为独立user消息注入(插到尾部保护区之前,不放system prompt因为system prompt固定而todo动态变化)。

Parlant创新:**上下文窄化(Context Narrowing)**——按当前对话主题只注入相关规则/知识/工具描述,从"事后压缩"到"事前精选"(p28)。

### 4. 工具治理(Tool Governance)

**工具调用是最大风险点(副作用且不可逆)**(来源:agent-from-scratch-personal-assistant.md p29-30;agent-evolution-map-annotated.md p54)。

**完整生命周期**:
1. **参数校验清洗**:JSON Schema/必填/类型转换/注入检测
2. **权限检查审批**:白名单黑名单/路径范围/危险操作需审批/频率限制
3. **参数修复容错**(见"错误分类与恢复"三件套)
4. **沙箱执行**:Docker容器(SWE-agent、OpenHands)/WASM/文件系统虚拟化/seccomp/AppArmor
5. **结果验证后处理**:返回大小限制/敏感信息脱敏/格式标准化

**声明式策略引擎**:avakill YAML策略执行前拦截(如args含`rm -rf`→deny;外部URL→ask_user);saifctl规格驱动——先定义Agent能力边界spec,运行时确保不越界(类形式化验证)(p30)。

**子Agent权限隔离**(agent-from-scratch-personal-assistant.md p55-56):子agent(leaf)禁用delegate_task(防递归)、**memory(并行执行下多个子Agent可能冲突写入,记忆修改应由主Agent统一决策)**、clarify(子Agent在线程池中无法与用户交互);可用load_skill、MCP工具、独立todo、内置工具。

真实案例(troubleshooting-nine-stages-case.md p48):想调"重置接入方密钥"高危操作→挡下转人工审核。

### 5. 安全防护

Agent特有威胁——**间接提示注入(Indirect Prompt Injection):Agent处理的内容本身就可能是攻击载荷**(来源:agent-from-scratch-personal-assistant.md p30-31)。

**三攻击面**:
1. **输入侧**:直接注入/对抗prompt
2. **工具返回侧(最危险)**:网页内容含"Ignore previous instructions"、文件嵌入隐藏指令、API恶意payload、邮件操纵
3. **输出/持久化侧**:泄漏system prompt/凭证出现在回复/记忆投毒影响后续行为

**防护矩阵**:
- 间接注入→模式匹配+语义分类器(工具返回后、送入LLM前)
- 凭证泄漏→正则输出流过滤
- 路径穿越→规范化+白名单
- 命令注入→Bash参数清洗
- 记忆投毒→写前内容可信度评估
- System Prompt泄漏→输出标签检测+围栏去除

**深层防御原则 Defense in Depth**:**输入、处理、输出三层各设独立检测,任何一层失守后面仍能拦截**(p31)。

**记忆安全前置**(agent-from-scratch-personal-assistant.md p44, p48):用户画像总结后做安全扫描(`scan_context_threats`),通过才保存——**安全前置在写入时,而非读取时**。`StreamingContextScrubber`流式输出清理器防止`<memory-context>`标签(16字符)泄漏,有状态缓冲区处理delta拆分(p46-47)。

真实案例(troubleshooting-nine-stages-case.md p48):appsecret不落日志。

### 6. 可观测性(Observability)

**Agent不确定性远超传统软件,没有可观测出问题只能"重现一下看看"**(来源:agent-from-scratch-personal-assistant.md p31)。

**三支柱**:
- **Logging**:每轮决策、工具入参出参、错误上下文、安全事件审计
- **Tracing**:端到端链路、父子Agent关系、工具耗时、压缩/降级事件
- **Metrics**:Token/轮/成本、成功率/重试率、延迟分布、循环检测触发率

**关键追踪维度**:Session → Turn → LLM Call → Tool Call → Sub-Agent

代表工具:LangSmith / Langfuse / OpenTelemetry / Helicone

真实案例(troubleshooting-nine-stages-case.md p48):排查轨迹全程留痕可复盘。

## 7条Harness设计原则

(来源:agent-from-scratch-personal-assistant.md p31)

1. **分类先于处理**:必须先诊断错误类型
2. **渐进式降级**:从温和到激进
3. **静默优先**:能内部恢复的异常不暴露给用户
4. **预算有限**:任何自动恢复都必须有上限
5. **可观测**:静默≠无记录,所有操作必须可审计
6. **最小权限**:工具权限按需授予,危险操作需审批
7. **声明式策略**:安全规则外置为配置,非硬编码

## 上线红线 vs 体验线

(来源:harness-security-subsystem.md p66-68)

**上线前必须有(红线)**:#4 工具治理 + #5 安全防护 + #6 可观测性——管"不闯祸"和"出事查得到";**缺了它们一次幻觉就可能是真实事故且无从追责,是企业敢按发布键的底线**。

**可随流量迭代(体验线)**:#1 错误恢复 + #2 迭代控制 + #3 上下文工程——管"稳和省",影响成功率/成本/长对话体验;初版做基础版,按真实badcase持续打磨;"观测先行,数据驱动迭代"。

## 六问评审清单

(来源:harness-security-subsystem.md p58-63,PM验收话术模板,没答全别说"能上线")

1. 工具调用失败会重试/纠正/降级而非直接崩?(#1)问开发:格式错、超时、5xx分别怎么处理?
2. 有没有最大步数/token预算上限防死循环烧钱?(#2)问开发:一个任务最坏花多少token?触顶怎么收场?
3. 长对话会不会超窗变笨?(#3)问开发:聊到第50轮还准不准?靠摘要还是截断?
4. 高危工具(删除/扣款/改配置)有没有权限分级和执行前关卡?(#4)问开发:模型能直接调的工具清单?哪些要dry-run?
5. 不可逆动作有没有人工审核闸门?能挡提示注入吗?(#5)问开发:哪些动作必须人点确认?敏感数据怎么隔离?
6. 线上badcase能不能回放、归因?日志会不会存敏感信息?(#6)问开发:出问题多久能定位到哪一步想错?

## 代表项目与趋势

(来源:agent-from-scratch-personal-assistant.md p25)

DeerFlow(ByteDance)、DeepAgents(LangChain)、SWE-agent(Princeton)、Parlant(Emcie)、OpenHarness(HKUDS)、Hive(Aden)、desloppify、CascadeFlow、Harmonist(GammaLab,186 agents协议强制执行)、saifctl、avakill等。

**趋势:Harness正在成为与Agent Loop平级的一等公民**,从"各家自建"走向"标准化框架"(p25, p32)。

## 关键量化数据汇总

- LLM工具调用格式错误率:**5-10%**(agent-from-scratch-personal-assistant.md p26, p106;harness-security-subsystem.md p14, p70)
- 重试参数:RETRY_BASE_DELAY=5s、RETRY_MAX_DELAY=120s,max 3次(p27, p42)
- Anthropic SDK内置2次自动重试;OpenAI SDK默认重试429/500/503(p27)
- 上下文压缩触发:**75%**窗口(留25%给completion+压缩调用);渐进策略分界点:60%/70%/80%/90%(p28, p35)
- 压缩效果:物理修剪减40-60%;整体100+条→约10条,token减60-80%(p36, p37)
- 13字段结构化摘要输入限15000字符(约3750 tokens)、每条截500字;摘要预算`min(max(200, 0.3×原内容), 2000)` tokens(p38)
- 压缩防抖阈值:近5次平均节省率<10%跳过(p40)
- 主agent默认迭代预算90轮(?);子agent 50轮、并发≤3、超时600s、深度≤1层(p35, p55)
- 错误分类:15+ FailoverReason,三层匹配(HTTP状态码→消息模式→异常类型名)(p41-42)
- 工具名模糊匹配difflib cutoff=0.7(p51)
- skill脚本执行超时30s(p64)
- 检查清单第3问基准:第50轮对话(harness-security-subsystem.md p70)

## 与企业手册模块映射

(来源:harness-security-subsystem.md p22-26, p72-73;agent-evolution-map-annotated.md p86)

- #1 错误分类与恢复 → 手册·容错重试机制
- #2 迭代控制 → 手册·主链路的步数/预算约束
- #3 上下文工程 → 手册·Memory #10(短期上下文管理)
- #4 工具治理 → 手册·Tool Governance #8(受控工具)
- #5 安全防护 → 手册·人工审核发布 #12
- #6 可观测性 → 手册·Runtime Logs / Audit #11

**对PM而言,Harness对应手册里的Audit、工具治理、人工审核、容错重试,合起来=一套企业版Harness**(harness-security-subsystem.md p14)。

## 架构定位与金句

**架构位置**(harness-security-subsystem.md p18):虚线外壳「HARNESS·运行时护甲」包住内核「Agent Loop(决策核心):思考→调用工具→观察→再决定」。**Harness不参与"调哪个工具"的决策(那是大脑的事),只在决策外圈做拦截、校验、重试、记录。大脑可以是概率的、会犯错的;护甲必须是确定的、不出错的——"概率系统嫁接在确定性工程上"最直接的体现**。

金句:
- "没有Harness的Agent不是不能跑,而是跑不过24小时"
- "不是所有错误都值得重试,但所有错误都需要被分类处理"
- "上下文管理不只是防溢出,更是让Agent在有限窗口内保持最优决策能力"
- "Agent的无限循环是生产中最常见的'静默杀手'——不会崩溃,但会持续消耗Token和时间,直到预算耗尽"
- "工具调用是最大风险点(副作用且不可逆)"
- "与传统Web安全不同,攻击面在于Agent处理的内容本身就可能是攻击载荷"
- "Harness是Agent从「能跑」到「能用」的关键分水岭"
- "如果Agent Loop是'大脑',Harness就是'免疫系统+骨骼+皮肤'"
- "Demo能跑≠能上线"

## 相关页面

- [./agent-reliability.md](./agent-reliability.md) — 可靠性工程详细机制(错误分类/重试/工具修复)
- [./agent-security.md](./agent-security.md) — 安全防护深入(间接注入/Defense in Depth/审计链)
- [./multi-agent.md](./multi-agent.md) — 多智能体资源控制(SubAgent四维约束)
- [./context-engineering.md](./context-engineering.md) — 上下文工程完整方案
- [./tool-use.md](./tool-use.md) — 工具治理与Function Calling
- [../sources/agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md) — 六大子系统技术实现+7条原则(p25-32, p33-66)
- [../sources/harness-security-subsystem.md](../sources/harness-security-subsystem.md) — 三问归类+六问清单+红线(完整)
- [../sources/agent-evolution-map-annotated.md](../sources/agent-evolution-map-annotated.md) — 演进史第⑧枢纽定位(p84-88)
- [../sources/troubleshooting-nine-stages-case.md](../sources/troubleshooting-nine-stages-case.md) — 真实工单中的Harness作用(p48)
