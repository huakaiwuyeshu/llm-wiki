# Tool Use(工具使用)

> TL;DR:工具使用的本质是「决策-执行分离」——LLM 只负责选工具+生成参数,实际执行由应用侧完成,以确保安全可控。承载形态沿 Function Call → MCP → CLI 原生化 / Script 脚本化 演进;选型有明确阈值(工具 <5 用 FC,>10 用 MCP,>20 准确率下降,50 工具≈5 万 token),且 LLM 工具调用格式错误率约 5-10%,需配合工具治理与修复机制。

## 定义与本质

Agent 的「能做什么」由工具决定。**决策-执行分离**是核心信条:LLM 在「该调用工具时」输出结构化调用指令(选工具 + 生成参数)而非自然语言,真正的执行交还应用侧完成——这道边界确保安全可控。在 HelloAgents 的设计哲学里更进一步抽象为「万物皆为工具」:Memory/RAG/RL/MCP 乃至 SubAgent 全部统一抽象为 Tool,消除不必要的抽象层(见 [../entities/hello-agents.md](../entities/hello-agents.md))。

## 演进:Function Call → MCP → CLI/Script

「飞樯」笔记认为 Tools 是六大维度里**变化最大的部分**:

1. **Function Call**(2023.06 OpenAI 引入):把系统能力封装成标准 API 注册为模型可调函数。痛点是**极高的开发与维护成本**——大量系统/数据源没有现成 API,需团队投入精力「补全」,且工具膨胀后 Schema 管理极复杂。里程碑:2023.11 Parallel FC → 2024.08 Structured Outputs(100% 符合 JSON Schema)。
2. **MCP**(2024.11 Anthropic):在协议层优化工具注册与发现,「一次注册,自动暴露」,但本质仍停留在**接口标准化层面**,未改变工具调用的底层逻辑(详见 [communication-protocols.md](./communication-protocols.md)、[../entities/mcp.md](../entities/mcp.md))。
3. **CLI 命令行原生化 + Script 脚本化**(真正的范式转移):
   - **CLI 零样本优势**:grep/cat/vim 等 Unix 命令对人类是高门槛,对模型却是预训练数据中的「先天知识」,无需定义复杂 Schema 即可操作文件系统/网络,节省巨大 token 与调试成本;遵循 `--help` 等标准规范的第三方 CLI 可被模型运行时查帮助「按需查询、即时学习」。
   - **Script 脚本**(Agent Skills 的 Resources 形态):工具逻辑封装为独立脚本,实现「本地与远程统一」「协议黑盒化」(鉴权/拼参藏在脚本内,Agent 只关心调哪个脚本、传什么核心参数)。
   - 本质:从「**人为适配模型**」转向「**利用模型原生能力**」。

## 关键机制

- **格式约束 vs 原生 function calling**:HelloAgents 早期 SimpleAgent 用 prompt 注入工具描述 + 正则解析 `[TOOL_CALL:{name}:{params}]`;0.2.8 后引入 FunctionCallAgent 基于 OpenAI 原生 function calling,鲁棒性更强,代表框架从教学走向生产。
- **工具修复(Harness 一环)**:LLM 工具调用问题常见,需多策略修复——参数 JSON 修复(清 surrogate 字符 → 补缺失括号 → 删尾随逗号)、嵌套参数自动包装(LLM 常把 `{request:{query}}` 展平为 `{query}`)、工具名模糊匹配(小写归一 → camelCase↔snake_case → 剥 `_tool` 后缀 → difflib cutoff=0.7)。
- **MCP 工具按需注入**:`load_skill` 时才把该 skill 声明的 MCP 工具 schema 注入 tools 列表,避免上下文膨胀失焦(见 [agent-skills.md](./agent-skills.md))。

## 量化数据(跨资料一致)

| 指标 | 数值 | 来源 |
|---|---|---|
| 选型阈值:Function Calling | 工具 <5 个且单 LLM 平台 | personal-assistant p14 |
| 选型阈值:MCP | 工具 >10 个 / 跨平台 / 多团队 | personal-assistant p14 |
| LLM 选择准确率拐点 | **>20 个工具后明显下降**(实测) | personal-assistant p61 |
| 单工具 schema 体积 | 200-500 tokens(另处估 ~1000) | p61 / p16 |
| 50 个工具全量注入 | **≈50,000 tokens** | p16 |
| 工具调用格式错误率 | **约 5-10%**(幻觉率更高) | p26 |

## 工程挑战(工具治理)

工具调用是 Agent 最大风险点(有副作用且不可逆)。五类挑战:工具选择准确性、参数提取可靠性(JSON 错误/缺字段)、嵌套参数包装、工具名拼写、上下文占用。完整治理生命周期见 [harness.md](./harness.md) 的 Tool Governance:参数校验清洗 → 权限检查审批 → 参数修复容错 → 沙箱执行 → 结果验证脱敏。开源实践对照见 trust_gated_agent_team 的「参与前先过闸」信任打分(0-100,金/银/铜)+ SHA-256 哈希链审计。

## 跨资料对比

- personal-assistant 与 paradigm-evolution 在「FC → MCP → CLI/Script」演进方向上一致;前者偏工程实现(修复策略、阈值实测),后者偏范式论述(CLI 零样本、利用原生能力)。
- ch10(Hello-Agents)强调 **MCP vs Function Calling 非竞争而是互补**:FC 是 LLM 内在能力(知道何时/如何调),MCP 是基础设施协议(标准化描述与连接)——与 personal-assistant「MCP 对 FC 无技术差异,本质是约定一套标准」口径一致。

## 相关页面

- [agent-skills.md](./agent-skills.md) — 工具+指令+资源打包按需加载,缓解工具膨胀
- [communication-protocols.md](./communication-protocols.md) — MCP/A2A/ANP 协议层
- [harness.md](./harness.md) — 工具治理、参数修复、沙箱执行
- [../entities/mcp.md](../entities/mcp.md) — MCP 标准实体
- [../entities/hello-agents.md](../entities/hello-agents.md) — Tool/ToolRegistry/FunctionCallAgent API
- 来源:[agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)(p11-14、p47-52)、[agent-paradigm-evolution.md](../sources/agent-paradigm-evolution.md)(Tools 维度 p8-10)、[ch10](../sources/hello-agents/ch10-agent-communication-protocols.md)、[ch07](../sources/hello-agents/ch07-build-your-framework.md)(7.5 工具系统)、[api-agent-template-breakdown.md](../sources/api-agent-template-breakdown.md)(trust_gated_agent_team)
