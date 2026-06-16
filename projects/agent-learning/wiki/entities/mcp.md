# MCP(Model Context Protocol)

> TL;DR:Anthropic 2024.11 发布的智能体↔工具标准化通信协议,定位「智能体的 USB-C」。解决「工具定义硬编码在应用中」的问题,实现即插即用。三层架构 Host-Client-Server,四类能力 Tools/Resources/Prompts/Sampling,协议层 JSON-RPC 2.0;与 Function Calling 互补而非竞争。生态最成熟,已成为低代码平台竞争分水岭。

## 它是什么

统一智能体与外部工具交互方式的协议,跨模型(Claude/GPT/Llama)通用。本质是约定一套标准规范——对比 Function Calling 无技术差异,但建立了工具的标准化通信与发现机制(「一次注册,自动暴露」)。

- **三层架构**:Host(宿主,如 Claude Desktop,管理 Client 生命周期与对话)、Client(与单个 Server 1:1 协议通信)、Server(暴露 capabilities、执行功能)。关注点分离——开发者只需开发 Server。
- **协议层**:JSON-RPC 2.0(`tools/list`、`tools/call`)。
- **四类核心能力**:**Tools**(主动,执行操作)、**Resources**(被动,提供可读数据源)、**Prompts**(指导性,预定义模板)、**Sampling**(Server 反向调用 LLM)。

## 关键事实

- **时间线**:2024.11 发布(Anthropic)→ 2025.03 Streamable HTTP 替代 SSE。
- **五种传输方式**(传输层无关性 Transport Agnostic):Memory(单测/原型)、Stdio(本地开发,最常用,`npx` 自动下载社区包)、HTTP(生产/远程)、SSE(流式/长连接)、StreamableHTTP(双向流式)。
- **MCP vs Function Calling 互补**:FC 是 LLM 内在能力(知道何时/如何调用),MCP 是基础设施协议(标准化描述与连接)。类比:FC = 学会打电话,MCP = 全球统一电话标准。
- **选型阈值**:工具 <5 个且单 LLM 平台 → 直接 Function Calling;工具 >10 个、跨平台复用或多团队提供 → MCP(personal-assistant p14)。
- **工程落地细节**(personal-assistant):MCP 工具按需注入(load_skill 时才注入该 skill 声明的 MCP 工具 schema)、嵌套参数自动包装(LLM 常把 `{request:{query}}` 展平,需检测 schema 自动包回)。
- **生态**:三大资源库 Awesome MCP Servers、mcpservers.org、官方 modelcontextprotocol/servers;发布平台 **Smithery**(类比 PyPI/npm,标准目录含 smithery.yaml + Dockerfile 端口 8081)。
- 在 HelloAgents 中封装为 **MCPTool**(基于 FastMCP),添加一个 MCPTool 会自动展开 Server 的所有工具为独立工具(多 server 须不同 name 前缀避免冲突)。

## 关系

- 三协议中的工具访问层,对比 A2A(智能体对话)、ANP(大规模发现),见 [../concepts/communication-protocols.md](../concepts/communication-protocols.md)、[./a2a-anp.md](./a2a-anp.md)。
- 工具承载演进的一环:Function Call → **MCP** → CLI/Script(见 [../concepts/tool-use.md](../concepts/tool-use.md));paradigm-evolution 认为 MCP「仍停留在接口标准化层面」,未改变底层逻辑。
- 是 Skill 按需加载机制中被注入的工具来源(`inject_skill_mcp_tools`,见 [../concepts/agent-skills.md](../concepts/agent-skills.md))。
- **MCP 支持已成低代码平台竞争分水岭**(Coze 缺位 vs Dify 集成,见 [./lowcode-platforms.md](./lowcode-platforms.md))。

## 出现在哪些笔记

- [ch10](../sources/hello-agents/ch10-agent-communication-protocols.md) 10.2 + 10.5(p338-379)— 概念/传输/实战/自建 Server/Smithery 发布
- [agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)(p11-14 架构与选型、p49-51 工程落地)
- [agent-paradigm-evolution.md](../sources/agent-paradigm-evolution.md)(Tools 维度,MCP 仅接口标准化)
- [ch05](../sources/hello-agents/ch05-low-code-platforms.md)(MCP 分水岭、Dify ModelScope MCP)

## 相关页面

- [../concepts/communication-protocols.md](../concepts/communication-protocols.md) — 三协议总览
- [../concepts/tool-use.md](../concepts/tool-use.md) — 工具承载演进
- [../concepts/agent-skills.md](../concepts/agent-skills.md) — MCP 工具按需注入
- [./a2a-anp.md](./a2a-anp.md)、[./hello-agents.md](./hello-agents.md)、[./lowcode-platforms.md](./lowcode-platforms.md)
