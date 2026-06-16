# 索引

> 查询入口:先读本文件,再打开相关页面。每次 ingest 后必须更新。

## 综述

- [overview.md](overview.md) — Agent 领域全局认知(尚未开始)

## 原始资料笔记(wiki/sources/)

### 《Hello-Agents》教材(sources/Hello-Agents-V1.0.2-20260210.pdf,共 633 页 / 16 章)

- [ch01](wiki/sources/hello-agents/ch01-intro-to-agents.md) — 智能体导论
- [ch02](wiki/sources/hello-agents/ch02-agent-history.md) — 智能体发展史
- [ch03](wiki/sources/hello-agents/ch03-llm-fundamentals.md) — LLM 基础
- [ch04](wiki/sources/hello-agents/ch04-classic-agent-paradigms.md) — 经典智能体范式(ReAct/Plan-and-Solve)
- [ch05](wiki/sources/hello-agents/ch05-low-code-platforms.md) — 低代码平台
- [ch06](wiki/sources/hello-agents/ch06-agent-frameworks.md) — 智能体框架
- [ch07](wiki/sources/hello-agents/ch07-build-your-framework.md) — 构建你的框架(SimpleAgent/Tool/ToolRegistry)
- [ch08](wiki/sources/hello-agents/ch08-memory-and-rag.md) — 记忆与 RAG
- [ch09](wiki/sources/hello-agents/ch09-context-engineering.md) — 上下文工程
- [ch10](wiki/sources/hello-agents/ch10-agent-communication-protocols.md) — 智能体通信协议
- [ch11](wiki/sources/hello-agents/ch11-agentic-rl.md) — Agentic RL(SFT/GRPO/LoRA/GSM8K,p383-435)
- [ch12 前半](wiki/sources/hello-agents/ch12-evaluation-part1.md) — 评估基础+BFCL 引入(12.1/12.2 前半,p437-444)
- [ch12 后半](wiki/sources/hello-agents/ch12-evaluation-gaia-datagen.md) — 评测(BFCL 实现/GAIA)与数据生成(p445-494)
- [ch13](wiki/sources/hello-agents/ch13-travel-assistant.md) — 实战:旅行助手
- [ch14](wiki/sources/hello-agents/ch14-deep-research-agent.md) — 实战:Deep Research 智能体
- [ch15](wiki/sources/hello-agents/ch15-cyber-town.md) — 实战:构建赛博小镇
- [ch16](wiki/sources/hello-agents/ch16-graduation-project.md) — 毕业设计:构建你的多智能体应用(p614-633,全书正文末章)

### 外部资料(PDF/HTML/MD,sources/ 下)

- [agent-first-citizen-infra](wiki/sources/agent-first-citizen-infra.md) — 重新思考研发基础设施:意图→代码循环压到分钟级;四层重建;infra 边界=自主边界
- [agent-from-scratch-personal-assistant](wiki/sources/agent-from-scratch-personal-assistant.md) — 从0到1搭建 Agent:阿里占旭鹏 68 页长文;九阶段演进+个人助手实战(ReAct/三步压缩/文件式记忆/Plan 即 todo/四阶段 Skill/受限并行 SubAgent)
- [agent-paradigm-evolution](wiki/sources/agent-paradigm-evolution.md) — Agent 范式演变:阿里飞樯复盘四阶段(被动式 ReAct→Workflow Agent→自主 Agent→自进化 Agent);六维度对比;「形未变、神已变」
- [agent-evolution-map-annotated](wiki/sources/agent-evolution-map-annotated.md) — Agent 演进图深度注解版(PM 版):九阶段×「上一代缺陷→新设计→为什么」;知识/能力/质量三层;PM 决策点
- [enterprise-agent-module-handbook](wiki/sources/enterprise-agent-module-handbook.md) — 企业业务 Agent 模块解析手册:工作系统而非聊天机器人;Workflow/Schema/Skill/Task State/Memory/Audit/人审
- [harness-security-subsystem](wiki/sources/harness-security-subsystem.md) — Harness 安全底座:六子系统图;「不崩/不闯祸/看得见」三问;上线红线=工具治理+安全+可观测三件套
- [api-agent-template-breakdown](wiki/sources/api-agent-template-breakdown.md) — 实战模板拆解:awesome-llm-apps 的 5 个模板;deterministic-picker/路由兜底/Self-RAG/NL→SQL/审计
- [handbook-page3-rewrite](wiki/sources/handbook-page3-rewrite.md) — 手册第 3 页改写:九阶段→三层→四档自主度;控制权钟摆;「Workflow 负责边界,Agent 负责弹性」
- [pm-5min-hook](wiki/sources/pm-5min-hook.md) — 给 PM 的 5 分钟开场:Agent = 产品形态之变;从设计操作到设计判断与边界
- [troubleshooting-nine-stages-case](wiki/sources/troubleshooting-nine-stages-case.md) — 贯穿案例:同一工单「回调签名验证失败」走完九阶段,终在 Claw 阶段 Agent 本地改代码办结

## 概念页(wiki/concepts/)

### 基础与范式
- [agent-definition](wiki/concepts/agent-definition.md) — Agent 定义:感知-决策-行动;自主性是与 Workflow 的分水岭;Thought-Action-Observation
- [agent-loop](wiki/concepts/agent-loop.md) — 核心循环 Thought→Action→Observation;生产 90% 用「ReAct 主循环 + 按需 Plan」
- [classic-paradigms](wiki/concepts/classic-paradigms.md) — 三经典范式:ReAct / Plan-and-Solve / Reflection(+CoT/ToT);选型策略
- [agent-planning](wiki/concepts/agent-planning.md) — 规划:从提示词技巧到决策中枢;结构化分解/Todo/长程协同;基座推理驱动
- [agent-paradigm-stages](wiki/concepts/agent-paradigm-stages.md) — 范式演进:阿里四阶段 + 手册九阶段能力图;「形未变、神已变」

### 能力模块
- [tool-use](wiki/concepts/tool-use.md) — 工具使用:决策-执行分离;FC→MCP→CLI/Script 演进;选型阈值;格式错误率 5-10%;工具治理
- [agent-skills](wiki/concepts/agent-skills.md) — Skill=SOP+工具+资源;SKILL.md;四阶段渐进式加载(10x token);Skill 为主 Workflow 兜底
- [agent-memory](wiki/concepts/agent-memory.md) — 记忆:四类记忆(Working/Episodic/Semantic/Perceptual);L1-L3 跃迁;文件记忆回归
- [rag](wiki/concepts/rag.md) — RAG:检索+增强+生成;Naive→Advanced→Modular;MQE/HyDE/Re-rank/RAGAS/Agentic RAG
- [context-engineering](wiki/concepts/context-engineering.md) — 上下文工程:注意力预算 vs context rot;GSSC 四阶段流水线
- [context-compression](wiki/concepts/context-compression.md) — 上下文压缩:75% 触发;HEAD/TAIL 保护;三步压缩+三级降级;Compaction
- [multi-agent](wiki/concepts/multi-agent.md) — 多智能体:专家分工破单 Agent 三困境;「不到必要不拆」;SubAgent 即工具;四维资源控制
- [communication-protocols](wiki/concepts/communication-protocols.md) — MCP/A2A/ANP 三协议对比;MCP 四类能力与时间线

### 框架、运行时与训练
- [agent-frameworks-design](wiki/concepts/agent-frameworks-design.md) — 框架价值;四框架设计哲学(涌现 vs 控制);自建四理念;LangChain 批判
- [harness](wiki/concepts/harness.md) — 包裹 Agent Loop 的运行时保护框架;从「能跑」到「能用」的分水岭
- [agent-reliability](wiki/concepts/agent-reliability.md) — 可靠性:错误三分类;指数退避+jitter;context_overflow 压缩重发;工具容错;deterministic-picker
- [agent-security](wiki/concepts/agent-security.md) — 安全:间接提示注入(工具返回最危险);Defense in Depth 三层;审计哈希链;凭证隔离
- [agentic-rl](wiki/concepts/agentic-rl.md) — Agentic RL:LLM 作可学习策略;SFT→GRPO;LoRA;GSM8K;三种奖励函数(ch11)

### 工程与落地
- [enterprise-agent](wiki/concepts/enterprise-agent.md) — 企业业务 Agent:工作系统而非聊天机器人;Workflow 负责边界,Agent 负责弹性
- [agent-oriented-infra](wiki/concepts/agent-oriented-infra.md) — 面向 Agent 的研发基础设施:四层重建(可理解/可操作/可感知/可追溯);Infra 边界=自主边界

## 实体页(wiki/entities/)

- [frameworks-langgraph](wiki/entities/frameworks-langgraph.md) — LangGraph:状态图、显式控制、原生循环
- [frameworks-autogen](wiki/entities/frameworks-autogen.md) — AutoGen:对话驱动、Conversable Agent
- [frameworks-agentscope](wiki/entities/frameworks-agentscope.md) — AgentScope:消息驱动、工业级工程化
- [frameworks-camel](wiki/entities/frameworks-camel.md) — CAMEL:角色扮演、Inception Prompting
- [hello-agents](wiki/entities/hello-agents.md) — 自建教学框架:LLM/SimpleAgent/ReActAgent/Tool/ToolRegistry,贯穿 ch07/10/13-16
- [lowcode-platforms](wiki/entities/lowcode-platforms.md) — Coze/Dify/n8n 合一页,选型建议
- [langchain](wiki/entities/langchain.md) — 被批判的过度抽象代表
- [mcp](wiki/entities/mcp.md) — Model Context Protocol 标准实体
- [a2a-anp](wiki/entities/a2a-anp.md) — A2A 与 ANP 合一页

## 我的输出(notes/)

*(空)*
