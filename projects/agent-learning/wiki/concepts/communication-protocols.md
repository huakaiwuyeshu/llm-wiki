# Communication Protocols(智能体通信协议)

> TL;DR:三种通信协议各解决一类问题——MCP(Anthropic,智能体↔工具,"USB-C")、A2A(Google,智能体↔智能体点对点对话)、ANP(开源概念,大规模网络去中心化服务发现)。类比互联网的 TCP/IP:让不同智能体/工具无需专门代码即可互通。选型:访问外部服务→MCP(生态最成熟)、多智能体协作→A2A、大规模生态→ANP。

## 为何需要通信协议

单体 ReAct 智能体面临三个根本限制(ch10 p334):① 工具集成困境(每接入新服务都要手写 Tool 类,不互通);② 能力扩展瓶颈(无法运行时动态发现新服务);③ 协作缺失(多专业智能体协作只能手动编排)。通信协议提供**标准化接口规范**,带来标准化接口、互操作性、动态发现、可扩展性。

## 三协议对比

| 协议 | 提出方 | 核心解决 | 设计哲学 | 拓扑 |
|------|--------|---------|---------|------|
| **MCP** (Model Context Protocol) | Anthropic | 如何访问工具 | "上下文共享" | Host-Client-Server |
| **A2A** (Agent-to-Agent) | Google | 如何与其他智能体对话 | "对等通信" P2P | 网状 |
| **ANP** (Agent Network Protocol) | 开源社区(概念性) | 大规模网络中发现连接智能体 | "去中心化服务发现" | 大规模网络 |

一句话总结(ch10 p379):MCP=智能体与工具的桥梁(增强单体能力);A2A=智能体间对话系统(小规模紧密协作);ANP=智能体的「互联网」(大规模开放网络)。三者在 HelloAgents 框架中**统一抽象为 Tool**:`agent.add_tool(MCPTool(...) / A2ATool(...) / ANPTool(...))`。

## MCP:智能体的 USB-C

- 统一智能体与外部工具交互方式,跨模型(Claude/GPT/Llama)通用。解决「工具定义硬编码在应用中」的问题——即插即用,本质是约定一套标准规范(对比 Function Call 无技术差异)。
- **三层架构**:Host(宿主,如 Claude Desktop,管理 Client 生命周期与对话)、Client(与单个 Server 1:1 协议通信)、Server(暴露 capabilities、执行功能)。关注点分离——开发者只需开发 Server。协议层 JSON-RPC 2.0(`tools/list`、`tools/call`)。
- **四类核心能力**:**Tools**(主动,执行操作)、**Resources**(被动,提供可读数据源)、**Prompts**(指导性,预定义模板)、**Sampling**(Server 反向调用 LLM)。ch10 表 10.2 列前三类为主。
- **MCP vs Function Calling 非竞争而是互补**:Function Calling 是 LLM 内在能力(知道何时/如何调用),MCP 是基础设施协议(标准化工具描述与连接)。类比:FC = "学会打电话"的技能,MCP = "全球统一电话通信标准"。
- **时间线**:2024.11 MCP 发布(Anthropic)→ 2025.03 Streamable HTTP 替代 SSE。五种传输方式(传输层无关性):Memory(单测/原型)、Stdio(本地开发,最常用)、HTTP(生产/远程)、SSE(流式/长连接)、StreamableHTTP(双向流式)。
- 详见 [../entities/mcp.md](../entities/mcp.md)。

## A2A:智能体间对等通信

- 设计动机:解决多智能体协作。中央协调器(星型)有三问题——单点故障、性能瓶颈、扩展困难;A2A 用 **P2P 网状拓扑**解决,每个智能体既是服务提供者也是消费者。
- **核心抽象 = Task(任务)+ Artifact(工件)**,这是与 MCP 最大区别(MCP 是工具调用,A2A 是任务委托)。任务有标准化生命周期(创建/协商/代理/执行中/完成/失败)。
- 请求生命周期四步:代理发现、身份验证、发送消息 API、发送消息流 API。支持 Agent 间协商(propose/negotiate,如 deadline≥7 天才接受否则给 counter_proposal)。
- 现有实现多为 Sample Code,HelloAgents 基于 Google 官方 a2a-sdk 模拟协议思想。

## ANP:去中心化服务发现

- 解决大规模开放网络三挑战:**服务发现**(找到能处理任务的智能体)、**智能路由**(多候选时按负载/成本选)、**动态扩展**(新智能体被发现)。
- **核心机制**:① 服务发现与匹配(爬取 `.well-known/agent-descriptions` 标准端点建索引,语义/功能查询);② 基于 **DID(去中心化身份)** 的身份验证(私钥签名,解析 DID 取公钥验签);③ 标准化服务执行。核心是用 DID 构建去中心化信任根基。
- 目前**尚无成熟生态**,HelloAgents 为自研轻量级概念模拟实现。技术白皮书:arXiv:2508.00007。
- 详见 [../entities/a2a-anp.md](../entities/a2a-anp.md)。

## HelloAgents 三层协议架构

1. **协议实现层**:MCP 基于 FastMCP 库;A2A 基于 a2a-sdk;ANP 自研模拟。
2. **工具封装层**:MCPTool/A2ATool/ANPTool 均继承 BaseTool,统一 `run()` 方法。
3. **智能体集成层**:所有 Agent 通过 Tool System 使用协议工具,无需关心底层细节。

安装 `pip install "hello-agents[protocol]==0.2.2"`(需 NodeJS)。这正是「万物皆为工具」理念的体现——协议即新的工具类型(见 [../entities/hello-agents.md](../entities/hello-agents.md))。

## 跨资料对比

- ch10 给出三协议的**完整定义、API 与实战**;personal-assistant 从工程实践角度补充 MCP 落地细节(MCP 工具按需注入、嵌套参数自动包装、Host/Client/Server 架构),并强调选型阈值(工具 >10 用 MCP)。两者对 MCP「标准化协议、对 FC 无技术差异」口径一致。
- ch05 低代码平台佐证 MCP 生态地位:**MCP 支持已成为低代码平台竞争分水岭**(Coze 缺位 vs Dify 集成 ModelScope MCP 市场)。

## 相关页面

- [tool-use.md](./tool-use.md) — MCP 是工具承载的演进一环
- [multi-agent.md](./multi-agent.md) — A2A 服务于多智能体协作拓扑
- [../entities/mcp.md](../entities/mcp.md) — MCP 标准实体页
- [../entities/a2a-anp.md](../entities/a2a-anp.md) — A2A 与 ANP 实体页
- [../entities/hello-agents.md](../entities/hello-agents.md) — 协议工具封装实现
- 来源:[ch10](../sources/hello-agents/ch10-agent-communication-protocols.md)(p334-382)、[agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)(p11-14 FC&MCP)、[ch05](../sources/hello-agents/ch05-low-code-platforms.md)(MCP 分水岭)
