# 低代码平台(Coze / Dify / n8n)

> TL;DR:三大低代码/无代码 Agent 构建平台合一页。低代码是「比框架更高层次的抽象」:Coze(字节)适合零代码快速原型与多渠道发布,Dify 适合开源企业级全栈 LLM 应用(RAG+工作流+插件市场),n8n 适合把 AI 嵌入业务自动化流程。选型:原型验证→Coze、企业级→Dify、深度业务集成→n8n。

## 平台化构建的价值

低代码四大价值(ch05 5.1):降低技术门槛(拖拽节点)、提升开发效率(数小时/分钟出原型)、可视化可观测性(端到端看数据流、定位耗时/失败节点)、标准化最佳实践沉淀(预设 ReAct 模板、知识库检索引擎、工具接入规范)。「低代码不是取代代码,而是更高层次的抽象。」

## Coze(扣子,字节跳动)

- **定位**:零代码/低代码 Agent 构建,可视化界面 + 丰富插件库,一键发布抖音/飞书/微信公众号等多平台。适合入门用户、产品经理、运营。
- 功能模块:项目开发(单智能体/对话流/多智能体;网页/小程序/H5 应用)、资源库(工作流/知识库/卡片/提示词库)、插件商店、API/模型管理、效果评测、发布管理。
- 实战:「每日 AI 简报」智能体(RSS + GitHub + arXiv 插件 → 大模型节点;System Prompt 定义编辑角色+输出格式)。
- **优势**:插件生态强、可视化编排直观、提示词控制灵活、多平台部署便捷。
- **局限**:**不支持 MCP**(作者认为最致命,feature-mcp 在 Coze Studio Q4 2025 Roadmap 但尚未实现)、部分插件配置复杂、无法导入导出标准 json(付费版只能导出 zip,只能 Coze 间互导)。

## Dify

- **定位**:开源 LLM 应用开发与运营平台,BaaS + LLMOps;分层模块化;模型高度中立(数百 LLM,兼容任何 OpenAI API);Docker Compose 本地部署 + SaaS。
- Marketplace 插件生态:模型/工具/Agent Strategies/扩展/捆绑包,超过 **8677 个插件**(另处称 9000+);插件远程调试可与 IDE 协作。
- 五种应用类型(工作流/Chatflow/聊天助手/Agent/文本生成);知识库支持分段、索引、检索设置(Top K/Score 阈值/Rerank)。
- 实战:「超级智能体个人助手」(问题分类器智能路由 → 日常问答/文案优化/多模态生成/数据查询分析/**MCP 工具集成**:Agent 策略选 ReAct (Support MCP Tools),接 ModelScope 魔搭 MCP 市场 SSE)。
- **优势**:全栈式(RAG+工作流+模型管理一站式)、低代码与扩展性平衡、企业级安全(AES-256、RBAC、审计日志)、活跃开源社区。
- **局限**:学习曲线陡、性能瓶颈(核心 Python 实现,高并发弱)、多模态支持不足、企业版定价高、**API 格式不兼容 OpenAI**。

## n8n

- **定位**:通用工作流自动化平台(数百预置节点连接 SaaS/数据库/API),LLM 是流程中的「处理节点」;强项是「连接」。
- 核心概念:**Node**(Trigger Node 触发器:Gmail/定时/Webhook,每工作流必须且唯一;Regular Node 常规处理)+ **Workflow**(节点连成的自动化流程图,数据以结构化 JSON 在节点间传递)。
- 实战:智能邮件助手(Gmail Trigger → AI Agent 节点〔Chat Model=Gemini + Simple Memory 以 threadId 为 key + Tools=SerpAPI + Vector Store〕→ Gmail Send;输出严格 JSON `{shouldReply, subject, body}`)。
- **优势**:开发效率高、AI Agent 节点高度整合模型/记忆/工具、Code 节点保功能上限、**私有化部署**(数据不离开自有环境)。
- **局限**:复杂逻辑调试繁琐、**内置存储非持久化**(Simple Memory/Vector Store 基于内存,重启丢失,生产须换 Redis/Pinecone)、版本控制/多人协作弱(JSON diff 不清晰)、超高并发性能开销。

## 选型建议

- 快速原型验证、非技术用户 → **Coze**
- 企业级应用、复杂业务逻辑 → **Dify**
- 深度业务集成、自动化流程 → **n8n**
- 「混合开发」思维:平台快速验证 + 代码精细化控制;平台处理标准流程 + 代码处理特殊逻辑。

## 关系

- 是 [Agent 框架](../concepts/agent-frameworks-design.md)之上「更高层次的抽象」;Dify 也被 paradigm-evolution 列为 2024 Workflow Agent 阶段代表(与 LangGraph 并列)。
- **MCP 支持已成为低代码平台竞争分水岭**(Coze 缺位 vs Dify 集成 ModelScope MCP 市场),呼应 [../concepts/communication-protocols.md](../concepts/communication-protocols.md) 的 MCP 生态地位。
- 工具插件的有无与丰富度直接决定智能体效果上限(Dify 成功原因:模型可接入、提示词可复制,插件生态才是壁垒)——与 [../concepts/tool-use.md](../concepts/tool-use.md) 呼应。

## 出现在哪些笔记

- [ch05](../sources/hello-agents/ch05-low-code-platforms.md)(p107-149)— 唯一详述来源

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 框架 vs 低代码抽象层次
- [../concepts/communication-protocols.md](../concepts/communication-protocols.md) — MCP 分水岭
- [../concepts/tool-use.md](../concepts/tool-use.md) — 插件生态即壁垒
- [./mcp.md](./mcp.md)、[./frameworks-langgraph.md](./frameworks-langgraph.md)
