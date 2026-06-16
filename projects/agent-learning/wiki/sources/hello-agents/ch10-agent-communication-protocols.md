> TL;DR：第十章为 HelloAgents 引入三种智能体通信协议——MCP(智能体↔工具)、A2A(智能体↔智能体点对点)、ANP(大规模智能体网络服务发现),三者在框架中统一抽象为 Tool,实现无缝集成。

来源：《Hello-Agents》第十章「智能体通信协议」,PDF p334-382(印刷页约 334-381)。ingest 日期 2026-06-10。

## 为何需要通信协议(10.1)

单体 ReAct 智能体面临三个根本限制(p334):
1. **工具集成困境**:每接入新服务(GitHub/数据库/文件系统)都要手写专门的 Tool 类,工作量大且不互通。
2. **能力扩展瓶颈**:能力被限制在预定义工具集内,无法运行时动态发现新服务。
3. **协作缺失**:多专业智能体协作(研究员+撰写员+编辑)只能手动编排。

通信协议提供**标准化接口规范**,类比互联网的 TCP/IP——让不同设备无需专门通信代码即可互通(p335)。带来:标准化接口、互操作性、动态发现、可扩展性。

## 三种协议设计理念对比(10.1.2, p335-337)

| 协议 | 提出方 | 核心解决 | 设计哲学 | 拓扑 |
|------|--------|---------|---------|------|
| **MCP** (Model Context Protocol) | Anthropic | 如何访问工具 | "上下文共享" | Host-Client-Server |
| **A2A** (Agent-to-Agent) | Google | 如何与其他智能体对话 | "对等通信" P2P | 网状 |
| **ANP** (Agent Network Protocol) | 开源社区(概念性) | 大规模网络中发现连接智能体 | "去中心化服务发现" | 大规模网络 |

- MCP 不只是 RPC,还能共享丰富上下文(代码结构、依赖关系、提交历史等)。
- A2A 核心是 **Task(任务)** 和 **Artifact(工件)** 两个抽象,这是与 MCP 最大区别。每个智能体既是服务提供者也是消费者,避免中心协调器瓶颈。
- ANP 通过 **DID(去中心化身份)** + `.well-known/agent-descriptions` 标准端点实现服务发现与可信通信。目前尚无成熟生态。
- **选型建议**:访问外部服务→MCP;多智能体协作→A2A;大规模生态→ANP。MCP 生态最成熟,推荐选大公司背书的工具。

## HelloAgents 三层协议架构(10.1.3, p337)

1. **协议实现层**:MCP 基于 FastMCP 库;A2A 基于 Google 官方 a2a-sdk;ANP 为自研轻量级概念模拟实现。
2. **工具封装层**:MCPTool/A2ATool/ANPTool 均继承 BaseTool,提供一致 `run()` 方法。
3. **智能体集成层**:所有智能体(ReActAgent/SimpleAgent)通过 Tool System 使用协议工具,无需关心底层细节。

安装:`pip install "hello-agents[protocol]==0.2.2"`(需 NodeJS)。

## MCP 协议实战(10.2)

### 概念(10.2.1, p338-341)
- **MCP = 智能体的 USB-C**:统一智能体与外部工具交互方式,跨模型(Claude/GPT/Llama)通用。
- **三层架构**(p339):Host(宿主,如 Claude Desktop,管理对话)、Client(协议通信)、Server(执行具体功能)。关注点分离——开发者只需开发 Server。
- **三大核心能力**(表 10.2):**Tools**(主动,执行操作)、**Resources**(被动,提供数据)、**Prompts**(指导性,提供模板)。
- **工具选择流程**(p339):工具发现`list_tools()` → 上下文构建(转为系统提示词) → 模型推理 → 工具执行 → 结果整合。工具描述质量决定 LLM 能否正确使用。
- **MCP vs Function Calling**(p340-341):**非竞争而是互补**。Function Calling 是 LLM 内在能力(知道何时/如何调用),MCP 是基础设施协议(标准化工具描述与连接)。类比:Function Calling = "学会打电话"的技能,MCP = "全球统一电话通信标准"。

### 客户端使用(10.2.2, p342-344)
- 基于 FastMCP 2.0,提供异步(推荐)和同步 API。
- 连接用 `MCPClient([...])` + `async with`;核心方法:`list_tools()` / `call_tool(name, args)` / `list_resources()` / `read_resource()` / `list_prompts()` / `get_prompt()`。
- 最常用 Stdio 模式(标准输入输出与本地进程通信),`npx` 自动下载社区包。

### 五种传输方式(10.2.3, 表10.4, p345-348)
1. **Memory** — 内存传输,单元测试/快速原型(`MCPTool()` 无参数即内置演示服务器)
2. **Stdio** — 标准输入输出,本地开发/调试/Python脚本
3. **HTTP** — 生产环境/远程服务/微服务
4. **SSE** (Server-Sent Events) — 实时通信/流式/长连接
5. **StreamableHTTP** — 双向流式 HTTP

MCPTool 主要用于 Stdio 和 Memory;HTTP/SSE/StreamableHTTP 建议直接用底层 MCPClient(`transport_type="sse"/"streamable_http"`)。MCP 协议特性:**传输层无关性**(Transport Agnostic)。

### 智能体中使用 MCP(10.2.4, p348-353)
- **自动展开机制**:添加一个 MCPTool 到 Agent,会自动将 Server 提供的所有工具展开为独立工具。例如内置计算器展开为 6 个:`calculator_add/subtract/multiply/divide/greet/get_system_info`。
- 多 MCP 服务器时**必须为每个 MCPTool 指定不同 name**作为前缀避免冲突(如 `name="fs"` → `fs_read_file`)。
- 自动类型转换:Agent 生成 `a=25,b=16`(字符串) → 系统转 `{"a":25.0,"b":16.0}`(数字)。
- 实战案例:多 Agent 协作智能文档助手——GitHub 搜索专家(gh_search_repositories)+ 文档生成专家(fs 文件系统),结果链式传递保存到 report.md。

### 社区生态(10.2.5, p354-355)
三大资源库:Awesome MCP Servers (github.com/punkpeye/awesome-mcp-servers)、MCP Servers Website (mcpservers.org)、Official MCP Servers (github.com/modelcontextprotocol/servers)。趣味案例:Playwright 网页测试、Obsidian+Perplexity 笔记、Jira+GitHub 项目管理、YouTube+Notion+Spotify 内容创作。

## A2A 协议实战(10.3, p355-365)

- **设计动机**:解决多智能体协作。中央协调器(星型)有三大问题:单点故障、性能瓶颈、扩展困难。A2A 用 P2P 网状拓扑解决。
- **核心概念**(表10.7):Task(任务)、Artifact(工件)。
- **任务生命周期**(图10.7):创建、协商、代理、执行中、完成、失败等标准化状态。
- **请求生命周期四步骤**(p356):代理发现、身份验证、发送消息API、发送消息流API。
- 实现说明:A2A 现有实现多为 Sample Code,Python 实现繁琐,本书仅通过 a2a-sdk 模拟协议思想。`pip install a2a-sdk`,`A2A_AVAILABLE` 标志检测。
- **服务端**:`A2AServer(name, description, version, capabilities)` + `@server.skill("name")` 装饰器定义技能,`server.run(host, port)` 启动。
- **客户端**:`A2AClient(url)` + `client.execute_skill(skill, query)`。
- **Agent 网络**:多个 A2AServer 跑在不同端口(researcher:5000, writer:5001, editor:5002),通过多个 A2AClient 串联协作流程(研究→撰写→编辑)。
- **A2ATool 包装器**(10.3.4):`A2ATool(name, description, agent_url)` 让 SimpleAgent 调用远程 Agent。实战案例:智能客服系统(接待员 SimpleAgent + 技术专家 A2AServer:6000 + 销售顾问 A2AServer:6001)。
- **高级**:支持 Agent 间协商(propose/negotiate 技能,如 deadline≥7 天才接受,否则给 counter_proposal)。

## ANP 协议实战(10.4, p365-369)

- 解决大规模开放网络的三挑战:**服务发现**(找到能处理任务的智能体)、**智能路由**(多个候选时按负载/成本选择)、**动态扩展**(新智能体被发现)。
- **核心机制**(图10.9):①服务发现与匹配(爬取 `.well-known/agent-descriptions` 建索引,语义/功能查询);②基于 DID 的身份验证(私钥签名,解析 DID 取公钥验签);③标准化服务执行。核心是用 DID 构建去中心化信任根基。
- API:`ANPDiscovery()` 发现中心,`register_service(discovery, service_id, service_name, service_type, capabilities, endpoint, metadata)` 注册(metadata 含 load/price/version),`discover_service(discovery, service_type)` 发现,`ANPNetwork(network_id)` 构建网络。
- 选最佳服务:`min(services, key=lambda s: s.metadata.get("load"))`(负载均衡)。
- 实战案例:分布式任务调度系统(10 个计算节点,metadata 含 cpu_cores/memory_gb/gpu),SimpleAgent + ANPTool 智能选节点。

## 构建自定义 MCP 服务器(10.5, p370-379)

- **动机**:封装业务逻辑、访问私有数据、性能专项优化、功能定制扩展。
- **教学案例:天气查询 MCP 服务器**(p371-374):`MCPServer(name, description)` + 定义函数(get_weather/list_supported_cities/get_server_info) + `server.add_tool(fn)` 注册 + `server.run()`。数据源 wttr.in API(`?format=j1`)。测试用 MCPClient 调用,Agent 用 MCPTool 集成。
- **发布到 Smithery**(10.5.2, p375-379):Smithery 是 MCP 服务器官方发布平台(类比 PyPI/npm)。
  - 标准发布目录:README.md、LICENSE、Dockerfile、pyproject.toml(必需)、requirements.txt、**smithery.yaml**(必需)、server.py。
  - smithery.yaml 关键字段:name(小写连字符唯一标识)、displayName、description、version、runtime(python/node)、`startCommand.type: http`、tools 列表。
  - Dockerfile:基础镜像 python:3.12-slim-bookworm,**端口 8081**(Smithery 标准端口),`CMD ["python","server.py"]`。
  - 提交流程:Fork hello-agents 仓库取源码 → 建自己的 weather-mcp-server 仓库 → 访问 smithery.ai → GitHub 登录 → Publish Server 输入仓库 URL。
  - 三种使用方式:Smithery CLI(`npm install -g @smithery/cli; smithery install`)、Claude Desktop 配置、HelloAgents(`MCPTool(server_command=["smithery","run","weather-mcp-server"])`)。

## 本章总结金句(10.6, p379-380)
- MCP=智能体与工具的桥梁(增强单体能力);A2A=智能体间对话系统(小规模紧密协作);ANP=智能体的"互联网"(大规模开放网络)。
- 三协议在框架中统一抽象为 Tool:`agent.add_tool(MCPTool(...))` / `A2ATool(...)` / `ANPTool(...)`。
- 实战经验:优先用成熟社区 MCP 服务;按规模选协议(小规模 A2A,大规模 ANP)。

## 参考文献(p382)
- [1] Anthropic (2024). Model Context Protocol. modelcontextprotocol.io
- [2] The A2A Project (2025). a2a-protocol.org
- [3] Chang et al. (2025). Agent Network Protocol technical white paper. arXiv:2508.00007
