# LLM Wiki 剩余任务清单

## 当前状态(2026-06-10 下班前)

✅ **已完成**:
- 11 份原始资料精读笔记(wiki/sources/ 下 10 份 + hello-agents/ 下 16 章)
- 17 个概念页(wiki/concepts/):agent-definition, agent-loop, classic-paradigms, agent-planning, agent-paradigm-stages, context-engineering, context-compression, agent-memory, rag, tool-use, agent-skills, communication-protocols, harness, multi-agent, agent-security, agent-reliability, agent-frameworks-design
- 9 个实体页(wiki/entities/):frameworks-{langgraph,autogen,agentscope,camel}, hello-agents, lowcode-platforms, langchain, mcp, a2a-anp

⏳ **进行中(agent 运行被上下文中断)**:
- 最后一批概念页创建 agent(agent af5a9d0c073cd9731)在写 4 个概念页:agent-oriented-infra, enterprise-agent, agentic-rl, agent-evaluation

## 剩余任务(按优先级)

### 1. 补齐最后 4 个概念页(高优先级)
对 Claude 说:「继续创建剩余 4 个概念页:agent-oriented-infra, enterprise-agent, agentic-rl, agent-evaluation,参考 TODO.md 里的详细要求」

详细要求:
- agent-oriented-infra.md:读 agent-first-citizen-infra.md,提取"意图驱动+代码沉淀"框架、瞬态代码、四层设计原则、dry-run/credential brokering/Agent DX、量化锚点
- enterprise-agent.md:读 enterprise-agent-module-handbook.md + handbook-page3-rewrite.md + pm-5min-hook.md,提取混合架构、职责分工、Schema 三态、追问策略、80 分验收
- agentic-rl.md:读 hello-agents/ch11-agentic-rl.md,提取 PBRFT vs Agentic RL、GRPO、LoRA、奖励函数、GSM8K 数据
- agent-evaluation.md:读 hello-agents/ch12-evaluation-part1.md + ch12-evaluation-gaia-datagen.md,提取三挑战、三层评估体系(BFCL/GAIA/数据生成)

### 2. 补齐缺失实体页(中优先级)
对 Claude 说:「创建缺失的实体页,参考已有实体页格式」

需要创建:
- vector-databases.md(Qdrant/ChromaDB/Pinecone/Milvus,被 agent-memory.md/rag.md 链接)
- enterprise-api-agent.md(用户的 API 接入 Agent 业务,被多个企业手册相关笔记引用)
- alibaba-infra.md(许晓斌/阿里巴巴研发基础设施团队)
- bfcl-gaia.md(评估基准,UC Berkeley BFCL + GAIA)
- awesome-llm-apps.md(开源模板项目,api-agent-template-breakdown.md 引用)
- datawhale.md(Hello-Agents 作者团队)
- qwen-models.md(Qwen3/Qwen2.5,多处实战用)
- modelscope.md(阿里云推理 API)

来源:读对应的 wiki/sources/ 笔记提取,每个实体页格式:TL;DR → 它是什么 → 关键事实 → 在我们哪些笔记出现 → 相关页面链接。

### 3. 创建 hello-agents/_index.md(中优先级)
对 Claude 说:「创建 hello-agents 教材的全书概览 _index.md」

要求:
- 路径:D:\zuhaowan-ai\llm-wiki\wiki\sources\hello-agents\_index.md
- 内容:一句话 TL;DR、作者/版本信息(Datawhale,V1.0.2-20260210,633 页 16 章)、全书结构地图(每章一句话,ch01-ch16)、全书最重要的 10-12 个收获
- 方法:快速 Read 每个 chNN-xxx.md 的首行 TL;DR,汇总成结构地图

### 4. 更新中央文件(高优先级)
对 Claude 说:「更新 overview.md、index.md、log.md」

- **overview.md**:Agent 领域综述,从"尚未开始"改为完整综述。需要综合所有笔记提炼:核心范式(ReAct/Reflection/Planning 等)、关键技术维度(记忆/工具/上下文/多智能体/Harness)、主要流派(Workflow vs Autonomous,混合架构趋势)、开放问题(安全/可靠性/评估)。保持在 3-5 屏可读完的长度。
- **index.md**:补全概念页区(当前只列了 4 个,应该 21 个)、补全实体页区(当前 9 个,应该更多)、补登非 hello-agents 的 10 份资料笔记链接。
- **log.md**:追加一条 `## [2026-06-10] ingest | 批量摄入 11 份 Agent 学习资料`,下面列:新建 wiki/sources/ 下 11 份笔记(含 hello-agents 16 章)、新建 17-21 个概念页、9-17 个实体页、index/overview 已更新。

### 5. Lint 检查(可选,时间充裕时)
对 Claude 说:「lint」

会检查:死链、index.md 与实际文件是否同步、孤儿页面(无任何入链)、log 格式。

## 如何恢复工作

明天回来直接说:「继续昨天的 llm-wiki 准备任务,按 TODO.md 里的顺序执行」

或者分步说:
1. 「先补齐 4 个概念页」
2. 「再创建缺失的实体页」
3. 「然后写 hello-agents 的 _index.md」
4. 「最后更新 overview.md、index.md、log.md」
5. 「跑一次 lint 检查」

---
*创建时间:2026-06-10 下班前。当前 token 预算已接近上限(94K/200K),context 即将压缩,留此文件作为断点恢复标记。*
