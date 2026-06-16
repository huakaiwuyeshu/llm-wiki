# A2A 与 ANP(智能体↔智能体协议)

> TL;DR:两种面向智能体间通信的协议合一页。A2A(Google,Agent-to-Agent)解决多智能体点对点协作,核心抽象是 Task + Artifact,用 P2P 网状拓扑替代中央协调器;ANP(Agent Network Protocol,开源概念性)解决大规模开放网络的服务发现/智能路由/动态扩展,核心是 DID 去中心化身份 + `.well-known/agent-descriptions` 标准端点。两者均在 HelloAgents 中封装为 Tool。

## A2A(Agent-to-Agent)

- **提出方**:Google。**核心解决**:智能体如何与其他智能体对话。**设计哲学**:对等通信(P2P),**拓扑**:网状。
- **设计动机**:中央协调器(星型)有三大问题——单点故障、性能瓶颈、扩展困难;A2A 让每个智能体既是服务提供者也是消费者,避免中心瓶颈。
- **核心抽象 = Task(任务)+ Artifact(工件)**,这是与 MCP 最大区别(MCP 是工具调用,A2A 是任务委托)。任务有标准化生命周期(创建/协商/代理/执行中/完成/失败)。
- **请求生命周期四步**:代理发现、身份验证、发送消息 API、发送消息流 API。
- **API**(HelloAgents,基于 Google 官方 a2a-sdk):服务端 `A2AServer(name, description, version, capabilities)` + `@server.skill("name")` 装饰器 + `server.run(host, port)`;客户端 `A2AClient(url)` + `client.execute_skill(skill, query)`。多 Server 跑不同端口(researcher:5000/writer:5001/editor:5002)串联协作。
- **高级**:支持 Agent 间协商(propose/negotiate,如 deadline≥7 天才接受否则给 counter_proposal)。
- 现有实现多为 Sample Code,Python 实现繁琐,HelloAgents 仅模拟协议思想(`A2A_AVAILABLE` 标志检测)。封装为 **A2ATool**(`A2ATool(name, description, agent_url)`)。

## ANP(Agent Network Protocol)

- **提出方**:开源社区(概念性)。**核心解决**:大规模网络中发现、连接智能体。**设计哲学**:去中心化服务发现,**拓扑**:大规模网络。
- 解决三挑战:**服务发现**(找到能处理任务的智能体)、**智能路由**(多候选时按负载/成本选)、**动态扩展**(新智能体被发现)。
- **核心机制**:① 服务发现与匹配(爬取 `.well-known/agent-descriptions` 标准端点建索引,语义/功能查询);② 基于 **DID(去中心化身份)** 的身份验证(私钥签名,解析 DID 取公钥验签);③ 标准化服务执行。核心是用 DID 构建去中心化信任根基。
- **API**(HelloAgents,自研轻量级概念模拟):`ANPDiscovery()` 发现中心,`register_service(...)` 注册(metadata 含 load/price/version),`discover_service(...)` 发现,`ANPNetwork(network_id)` 构建网络;选最佳服务 `min(services, key=lambda s: s.metadata.get("load"))`(负载均衡)。封装为 **ANPTool**。
- **目前尚无成熟生态**。技术白皮书:Chang et al. (2025), arXiv:2508.00007。

## 关系与对比

| 维度 | A2A | ANP |
|---|---|---|
| 规模定位 | 小规模紧密协作 | 大规模开放网络 |
| 一句话 | 智能体间对话系统 | 智能体的「互联网」 |
| 身份信任 | 身份验证 | DID 去中心化信任 |
| 成熟度 | Sample Code 阶段 | 概念性、无成熟生态 |

- 三协议总览与 MCP 对比见 [../concepts/communication-protocols.md](../concepts/communication-protocols.md)、[./mcp.md](./mcp.md)。选型:多智能体协作→A2A,大规模生态→ANP。
- A2A 服务于 multi-agent 协作拓扑(见 [../concepts/multi-agent.md](../concepts/multi-agent.md));AgentScope Runtime 已内置 A2A 协议(见 [./frameworks-agentscope.md](./frameworks-agentscope.md))。
- 均统一抽象为 Tool(继承 BaseTool),体现 HelloAgents「万物皆为工具」(见 [./hello-agents.md](./hello-agents.md))。

## 出现在哪些笔记

- [ch10](../sources/hello-agents/ch10-agent-communication-protocols.md) 10.3(A2A,p355-365)+ 10.4(ANP,p365-369)— 唯一详述来源

## 相关页面

- [../concepts/communication-protocols.md](../concepts/communication-protocols.md) — 三协议总览
- [../concepts/multi-agent.md](../concepts/multi-agent.md) — 多智能体协作拓扑
- [./mcp.md](./mcp.md)、[./frameworks-agentscope.md](./frameworks-agentscope.md)、[./hello-agents.md](./hello-agents.md)
