TL;DR: 低代码平台是智能体开发的"更高层抽象":Coze 适合零代码快速原型与多渠道发布,Dify 适合开源企业级全栈 LLM 应用(RAG+工作流+插件市场),n8n 适合把 AI 嵌入业务自动化流程;选型按"原型验证→Coze、企业级→Dify、深度业务集成→n8n"。

# 第五章 基于低代码平台的智能体搭建 (p107-149)

## 5.1 平台化构建的兴起 (p107-108)
低代码平台四大价值:降低技术门槛(拖拽节点,非技术人员可参与)、提升开发效率(数小时/分钟完成原型)、可视化可观测性(端到端看数据流动、定位耗时/失败节点)、标准化最佳实践沉淀(预设 ReAct 模板、知识库检索引擎、工具接入规范)。"低代码不是取代代码,而是更高层次的抽象。"

## 5.2 Coze(扣子,字节跳动)(p108-118)

- 定位:零代码/低代码 Agent 构建,可视化界面+丰富插件库,一键发布抖音/飞书/微信公众号等多平台。适合入门用户、产品经理、运营。
- 功能模块:项目开发(智能体:单智能体自主规划/对话流/多智能体模式;AI 应用:网页/小程序/H5)、资源库(工作流/知识库/卡片/提示词库)、插件商店、API 管理、模型管理、效果评测、发布管理。
- **实战:"每日 AI 简报"智能体**:RSS 插件(36氪/虎嗅/IT之家/infoq feed)、GitHub 插件(q:AI, per_page:10, sort:updated)、arXiv 插件(count:5, search_query:AI);可视化编排把信息源节点连到大模型节点;System Prompt 定义编辑角色+输出格式(标注日期、emoji、只保留 AI 相关、必附原始链接),User Prompt 定义任务(10 条新闻+5 篇论文+5 个开源项目);发布到扣子商店/AI 应用。
- 优势:插件生态强、可视化编排直观、提示词控制灵活(支持提示词管理和模板)、多平台部署便捷(手机/硬件厂商陆续接入)。
- 局限:**不支持 MCP**(作者认为最致命,feature-mcp 在 Coze Studio Q4 2025 Roadmap 中但尚未实现)、部分插件配置复杂(需 API Key/js/python 基础)、无法导入导出标准 json(付费版只能导出 zip,只能 Coze 间互导)。

## 5.3 Dify (p118-136)

- 定位:开源 LLM 应用开发与运营平台,BaaS + LLMOps 理念;分层模块化(数据层/开发层/编排层/基础层);模型高度中立(数百开源/专有 LLM,兼容任何 OpenAI API);支持 Docker Compose 本地部署 + SaaS 云端。
- Marketplace 插件生态:模型/工具/Agent Strategies/扩展/捆绑包,超过 **8677 个插件**;插件远程调试可与 IDE 协作。
- 五种应用类型(工作流/Chatflow/聊天助手/Agent/文本生成);知识库支持分段设置(分隔符/最大长度/重叠)、索引方式(高质量 embedding)、检索设置(Top K/Score 阈值/Rerank)。
- **实战:"超级智能体个人助手"**:问题分类器做智能路由 → 多模块:日常问答(结构化提示词:Role/Profile/Skills/Rules/Workflows/Initialization)、文案优化(OpenAI 数据称超 60% 用户用 ChatGPT 做文本优化;提示词五段式:Role/Background/Task/Limit/Example,要求 500 字以上)、多模态生成(豆包 Seedream 生图、Seedance 生视频插件)、数据查询分析(rookie-text2data 插件,提供 DDL 表结构给模型生成 SQL;generate_pie/column/line_chart 可视化工具)、**MCP 工具集成**(ModelScope 魔搭 MCP 市场 hosted 服务,SSE 模式;Agent 策略选 ReAct (Support MCP Tools);高德地图/饮食推荐/新闻资讯)。
- 优势:全栈式(RAG 管道+工作流+模型管理一站式)、低代码与扩展性平衡、企业级安全(AES-256、RBAC、审计日志)、9000+ 工具、活跃开源社区。
- 局限:学习曲线较陡、性能瓶颈(核心服务端 Python 实现,高并发弱)、多模态支持不足(以文本为主)、企业版定价高、**API 格式不兼容 OpenAI**。

## 5.4 n8n (p136-146)

- 定位:通用工作流自动化平台(数百预置节点连接 SaaS/数据库/API),LLM 是流程中的"处理节点";强项是"连接"。
- 核心概念:**Node**(Trigger Node 触发器:Gmail 新邮件/定时/Webhook,每工作流必须且只有一个;Regular Node 常规处理)+ **Workflow**(节点连成的自动化流程图,数据以结构化 JSON 在节点间传递)。
- **实战:智能邮件助手**(接收 → AI Agent 思考/决策/工具调用 → 回复):
  1. 私有知识库流程:Code 节点存 JSON 知识(工作时间/非工作时间政策/自动回复指令)→ Embeddings Google Gemini(gemini-embedding-exp-03-07)→ Simple Vector Store(Insert Documents 模式,Memory Key 如 my-dailytime)
  2. Agent 主工作流:Gmail Trigger(Message Received,OAuth2)→ **AI Agent 节点**(Chat Model=Gemini;Memory=Simple Memory,以邮件 threadId 为 key;Tools=SerpAPI 公网搜索 + Simple Vector Store(Retrieve Documents As Tool 模式,Memory Key 与 Embeddings 模型必须与写入时完全一致))→ Gmail Send(To/Subject/Message 用 n8n 表达式绑定 Agent 输出 JSON 字段)
  - System Message 含角色、可用工具描述、执行步骤(分析问题→并行搜集→草拟回复→按工作时间加状态前缀→输出严格 JSON {shouldReply, subject, body},换行用 `<br>`)
- 优势:开发效率(可视化全链路)、AI Agent 节点把模型/记忆/工具高度整合、Code 节点保功能上限、**私有化部署**(数据不离开自有环境)。
- 局限(表 5.1):复杂逻辑调试繁琐;**内置存储非持久化**(Simple Memory/Vector Store 基于内存,重启丢失,生产须换 Redis/Pinecone);版本控制与多人协作不如代码(JSON diff 不清晰);超高并发实时性场景性能开销。

## 5.5 选型建议 (p146)
- 快速原型验证、非技术用户 → Coze
- 企业级应用、复杂业务逻辑 → Dify
- 深度业务集成、自动化流程 → n8n
- "混合开发"思维:平台快速验证想法+代码精细化控制;平台处理标准流程+代码处理特殊逻辑。

## 金句/洞见
- 工具插件的有无与丰富度直接决定智能体效果上限(Dify 成功的原因:模型可接入、提示词可复制,插件生态才是壁垒)。
- MCP 支持已成为低代码平台竞争的分水岭(Coze 缺位 vs Dify 集成 ModelScope MCP 市场)。
