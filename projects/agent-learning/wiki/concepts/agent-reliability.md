# Agent Reliability

可靠性工程是让 Agent "不崩"的运行时保障:错误三分类决定重试还是终止,指数退避+jitter 防惊群,context_overflow 应压缩重发而非重试,工具调用容错三件套修复 LLM 输出格式错误,deterministic-picker 用代码兜底 LLM 判断。

## 总纲:不是所有错误都值得重试

**核心原则:"不是所有错误都值得重试,但所有错误都需要被分类处理"**(来源:../sources/agent-from-scratch-personal-assistant.md p26;../sources/harness-security-subsystem.md p71)。

可靠性工程支撑Harness"怎么不崩"三问之首,覆盖错误分类与恢复(#1)、迭代控制(#2)、上下文工程(#3)三个子系统中的"不崩"维度。**LLM工具调用格式错误约5-10%,幻觉率更高,只是被可靠性机制屏蔽了**(agent-from-scratch p26)。

## 错误三分类与15+ FailoverReason

### PM视角的错误三分法

(来源:harness-security-subsystem.md p29, p71)

- **可重试**(超时)→ 自动退避重试
- **可纠正**(格式错)→ 回喂让模型自己改
- **必须中止**(权限拒绝)→ 优雅降级而非抛栈崩掉

### 工程视角的三分类

(来源:agent-from-scratch-personal-assistant.md p26-27)

- **瞬态错误**(网络超时/连接断开/500)→ 指数退避重试+随机抖动 max 3次
- **速率限制**(429/并发限制/配额)→ 尊重Retry-After头或递增等待
- **永久错误**(API Key无效/模型不存在/内容违规/Schema不匹配)→ 终止+报告用户

### 15+ FailoverReason 与三层匹配

(来源:agent-from-scratch-personal-assistant.md p41-43,`agent/error_classifier.py`)

**FailoverReason枚举15+种错误原因**,每种带不同恢复策略:
- auth(临时认证→换凭证)/ auth_permanent(终止)/ billing(终止)
- rate_limit(等待后重试)/ overloaded(切换提供商)
- server_error(重试)/ timeout(重试)
- **context_overflow(不是重试,而是压缩后重新发送)**
- model_not_found(终止)/ format_error(终止)等

**三层匹配**:
1. **Layer1 HTTP状态码**:429→rate_limit、402→billing、401/403→auth、500/502→server_error、503/529→overloaded、400→进一步检查可能是溢出
2. **Layer2 错误消息模式**:"context length"/"too many tokens"→溢出、"rate limit"/"throttled"、"invalid api key";含中文模式"超过最大长度";云厂商特定如阿里云"rate increased too quickly"
3. **Layer3 异常类型名兜底**:ReadTimeout/ConnectError/SSLError→timeout,其他→unknown但标记retryable

线上实例(p42-43):OpenAI 429、400"context length exceeded"、401、阿里云DashScope"rate increased too quickly"、Anthropic 529 Overloaded、ConnectionResetError、vLLM"exceeds the max_model_len"、404"model not found"。

## 指数退避 + Jitter(防惊群效应)

(来源:agent-from-scratch-personal-assistant.md p27)

**Jitter防惊群效应(Thundering Herd)**——若多个请求同时失败、同时按相同退避时间重试,会在同一时刻再次涌向服务器造成二次冲击;加随机抖动打散重试时刻。

```
exponential_backoff_with_jitter = min(base*2^attempt + uniform(0, exp*0.5), 60)
```

AWS推荐**Full Jitter**变体:
```
random.uniform(0, min(cap, base*2^attempt))
```

项目实测参数:RETRY_BASE_DELAY=5s、RETRY_MAX_DELAY=120s,max 3次(p42)。

真实案例:Anthropic SDK内置2次自动重试+指数退避;OpenAI SDK默认重试429/500/503(p27)。

进阶策略(OpenHarness):模型降级(GPT-4失败回退GPT-3.5)、提供商切换、请求拆分(p27)。

## context_overflow:压缩重发而非重试

**关键区分:上下文溢出不应被当作普通瞬态错误重试**(来源:agent-from-scratch-personal-assistant.md p41)。重试只会再次溢出,正确处理是触发上下文压缩后重新发送请求。

这体现在Loop每轮的THINK阶段(p34):`_api_call_with_retry`失败走ErrorClassifier分类——瞬态→指数退避+抖动重试 / **上下文溢出→压缩后重试** / 永久→报告用户退出。

上下文压缩详细机制(75%触发、三步压缩、三级降级、防抖、Todo注入)见 [./context-engineering.md](./context-engineering.md) 与 [./harness.md](./harness.md) #3。

## 工具调用容错三件套

LLM返回的工具调用常见格式问题,需在ToolDispatcher执行前修复(来源:agent-from-scratch-personal-assistant.md p50-52)。

### 1. JSON 修复(`repair_tool_arguments`)

依次尝试四策略(p50):
- 策略1:清理surrogate字符(encode/decode utf-8 errors=replace)
- 策略2:补全缺失的右括号/右方括号(按计数补`}`/`]`)
- 策略3:删除尾随逗号再补括号
- 全失败:返回`{"raw_input": raw_arguments}`供LLM查看自我修正

### 2. 嵌套参数自动包装(`_normalize_mcp_arguments`)

(p50-51)部分MCP工具inputSchema是嵌套包装(`{request:{query:...}}`),LLM常展平为`{query:...}`;检测schema只有一个object属性且参数key落在内层properties时自动包回。

### 3. 工具名模糊匹配(`_repair_tool_name`)

(p51-52)四策略:
- 策略1:小写直接匹配
- 策略2:标准化(`-`/空格→`_`)
- 策略3:候选集(camelCase→snake_case、剥`_tool`/`-tool`/`tool`后缀,两轮扩展交叉组合)
- 策略4:**difflib模糊匹配(相似度cutoff≥0.7取n=1)**

实例:`QueryWeather`→camelToSnake、`QUERY_WEATHER`→小写、`query_weather_tool`→strip后缀、`qeury_weather`(拼写错误)→difflib。

## deterministic-picker:LLM 判断、代码决策兜底

(来源:harness-security-subsystem.md p18, p77;agent-evolution-map-annotated.md p102;troubleshooting-nine-stages-case.md p31, p66)

贯穿用户全部材料的中心概念:**"LLM负责判断、代码负责决策与兜底"**,即"概率系统嫁接在确定性工程上"的具体落地。

- 起源:Function Call阶段的**决策-执行分离**——LLM只决定调什么,代码真执行(agent-evolution-map p53;troubleshooting p31 "决定查日志的是LLM、执行的是代码")
- 运行时表达:**"护甲必须是确定的、不出错的;大脑可以是概率的、会犯错的"**(harness-security-subsystem p18, p77)
- 钟摆收敛终点:早期全用规则(死板)→ 自主Agent全交LLM(灵活但失控会崩)→ 工程实践收回代码/流程(可控可复盘稳定),最终收敛于deterministic-picker(agent-evolution-map p101-102)

可靠性工程中的体现:错误分类、重试决策、工具名修复、context管理——这些都是**代码层确定性逻辑兜底LLM的不确定输出**。例如错误分类器三层匹配是纯代码规则;双重保险:压缩时LLM不可用回退到基于规则的`_build_structured_summary`(agent-from-scratch p36)。

## 迭代控制(防"静默杀手")

**无限循环是生产中最常见"静默杀手"——不会崩溃但持续烧Token**(来源:agent-from-scratch-personal-assistant.md p28)。可靠性的另一支柱,详见 [./harness.md](./harness.md) #2 迭代控制(三层防护:硬性预算/模式检测/进展评估)。

要点:空响应防护——content和tool_calls均空计数+1,连续2次注入提示引导、超限终止(agent-from-scratch p34)。

## 关键量化数据

- LLM工具调用格式错误率5-10%(agent-from-scratch p26;harness-security-subsystem p14)
- 错误分类:15+ FailoverReason,三层匹配(p41-42)
- 重试参数:RETRY_BASE_DELAY=5s、RETRY_MAX_DELAY=120s、max 3次(p42)
- 退避上限60s;AWS Full Jitter变体(p27)
- Anthropic SDK内置2次重试;OpenAI SDK默认重试429/500/503(p27)
- 工具名模糊匹配difflib cutoff=0.7(p51)
- JSON修复全失败返回`{"raw_input":...}`(p50)

## 金句

- "不是所有错误都值得重试,但所有错误都需要被分类处理"(agent-from-scratch p26)
- "LLM的错误率并不低,只是Harness将其屏蔽了。没有Harness的Agent不是不能跑,而是跑不过24小时"(p26)
- "Agent的无限循环是生产中最常见的'静默杀手'"(p28)
- "护甲必须是确定的、不出错的;大脑可以是概率的、会犯错的"(harness-security-subsystem p18)
- "Agent本质上是一个概率系统嫁接在确定性工程上的产物:今天跑得好好的链路,明天模型升级一个版本,可能tool calling的格式变了、推理偏好漂移了,一批业务场景就悄悄退化了"(agent-from-scratch p253/p67)

## 相关页面

- [./harness.md](./harness.md) — 可靠性是Harness三个"不崩"子系统(#1/#2/#3),属体验线
- [./agent-security.md](./agent-security.md) — 安全防护(与可靠性同为Harness支柱)
- [./context-engineering.md](./context-engineering.md) — 上下文压缩(context_overflow处理)
- [./tool-use.md](./tool-use.md) — 工具调用与容错
- [./multi-agent.md](./multi-agent.md) — 子Agent迭代预算与错误传播
- [./agent-loop.md](./agent-loop.md) — ReAct主循环(可靠性嵌入每轮)
- [../sources/agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md) — 错误分类器+重试+容错三件套(p26-27, p41-43, p50-52)
- [../sources/harness-security-subsystem.md](../sources/harness-security-subsystem.md) — 错误三分法+deterministic-picker(p29, p18)
- [../sources/agent-evolution-map-annotated.md](../sources/agent-evolution-map-annotated.md) — 控制权钟摆与deterministic-picker(p101-102)
- [../sources/troubleshooting-nine-stages-case.md](../sources/troubleshooting-nine-stages-case.md) — 案例中的决策-执行分离(p31)
