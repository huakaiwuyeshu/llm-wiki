# 操作日志

> 追加式,新条目在最上方。格式:`## [YYYY-MM-DD] <操作> | <标题>`

## [2026-06-11] lint | 全 wiki 死链检查与修复
修复 10 处真死链:ch16-graduation-project.md 中 8 个同目录链接误写为 `../`(改为 `./`);multi-agent.md 中 2 个实体链接文件名错误(langgraph/autogen → frameworks-langgraph/frameworks-autogen)。剩余 12 处链接指向 8 个尚未创建的页面(agent-evaluation、vector-databases、claude-code、lilian-weng、alibaba-infra、autonomous-agent-products、awesome-llm-apps、enterprise-api-agent),属计划页,待后续按需补建;其中 concepts/agent-evaluation.md 被引 3 次且 ch12 笔记素材充足,优先级最高。

## [2026-06-11] sync | 补登外部资料笔记 11 篇到 index.md
index.md 原始资料笔记区仅有 Hello-Agents 16 章,缺 11 篇外部资料(PDF/HTML/MD)。新建「外部资料」子区,补登:agent-first-citizen-infra、agent-from-scratch-personal-assistant、agent-paradigm-evolution、agent-evolution-map-annotated、enterprise-agent-module-handbook、harness-security-subsystem、api-agent-template-breakdown、handbook-page3-rewrite、pm-5min-hook、troubleshooting-nine-stages-case,每篇附 TL;DR 摘要。Lint 确认无孤儿页面。

## [2026-06-11] synthesize | 完成 overview.md 全局综述
基于全部 27 份已摄入资料(Hello-Agents 全书 16 章 + 11 份外部 PDF/HTML)与 20 个概念页,综合撰写 overview.md。内容:Agent 定义、范式演进(形未变神已变)、核心能力模块(工具/Skill/记忆/RAG/上下文工程/规划/Multi-Agent/协议)、框架与运行时(四框架设计哲学/Harness/Agentic RL)、落地(企业 Agent/Agent-Oriented Infra)、开放问题、学习路径。

## [2026-06-11] sync | 修复 index.md 概念页区严重脱节
index.md 概念页区仅列 4 页,实际盘点 wiki/concepts/ 有 20 页(前次会话创建了 16 页但未更新索引)。补登全部 16 页并分 5 组(基础与范式/能力模块/框架运行时训练/工程与落地),每页附完整 TL;DR 注释。无死链。

## [2026-06-10] synthesize | 工具/技能/协议/框架 概念页与实体页综合
基于 7 份精读笔记(ch05/06/07/10 + personal-assistant + paradigm-evolution + api-template)综合。新建概念页 4:concepts/tool-use.md、agent-skills.md、communication-protocols.md、agent-frameworks-design.md;新建实体页 7:entities/frameworks-{langgraph,autogen,agentscope,camel}.md、hello-agents.md、lowcode-platforms.md、langchain.md、mcp.md、a2a-anp.md。更新 index.md(填充概念页/实体页两区)。互链已建,部分链接指向尚未创建的概念页(agent-memory/rag/multi-agent/harness/agent-planning/context-engineering),待后续补齐。

## [2026-06-10] ingest | Hello-Agents 第十一章 Agentic RL + 第十二章前半(评估基础+BFCL 引入)
新建 wiki/sources/hello-agents/ch11-agentic-rl.md(实测 p383-435,非任务估计的 p383-399;含 LLM 训练全景/SFT/GRPO/LoRA/GSM8K/三种奖励函数)与 ch12-evaluation-part1.md(12.1 评估基础+基准综述、12.2.1/12.2.2 BFCL 引入,p437-444)。OCR 确认:ch11 始于 p383、ch12 始于 p437(此前 ch12 笔记误估 ~p400,已修正其衔接说明)。更新 index.md(补 ch11、拆分 ch12 前/后半、清理孤儿提示)。方法:PyMuPDF 渲染 PNG + RapidOCR。

## [2026-06-10] ingest | Hello-Agents 第十六章 毕业设计:构建你的多智能体应用
新建 wiki/sources/hello-agents/ch16-graduation-project.md(p614-633,全书正文末章,共 633 页 16 章);PDF 中文为损坏字体,用 PyMuPDF 渲染 PNG + RapidOCR 识别。补登 index.md 中此前为空的 hello-agents 全部已有章节笔记。

## [2026-06-10] init | 初始化 wiki 骨架
创建 CLAUDE.md(schema)、index.md、overview.md、log.md 及目录结构。
