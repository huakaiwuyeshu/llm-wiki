> TL;DR：第十四章构建自动化深度研究智能体——提出「TODO 驱动研究范式」(规划→执行→报告三阶段),三个专职 Agent(TODO Planner/Task Summarizer/Report Writer)顺序协作,扩展 `ToolAwareSimpleAgent`(带工具调用监听),用 SearchTool(多搜索引擎)+NoteTool 持久化,通过 SSE 流式推送进度到 Vue 全屏模态前端。

来源:《Hello-Agents》第十四章「自动化深度研究智能体」,PDF p532-573(章首 p532)。ingest 日期 2026-06-10。
相比 ch13 旅行规划,深度研究难点:信息发散、事实快速更新、对引用来源高要求。

## 项目概述与架构(14.1, p532-535)

智能体需三核心能力:①问题剖析(开放主题→可检索查询) ②多轮信息采集(多搜索 API+去重整合) ③反思与总结(识别知识空白,决定是否继续检索)。

价值:1-2 小时研究压缩到 5-10 分钟、系统化避免遗漏、可追溯(记录所有来源)、可扩展。

**四层架构**(图 14.1):前端(Vue3+TS,全屏模态+Markdown 可视化)/后端(FastAPI,`/research/stream`)/智能体层(3 Agent + SearchTool/NoteTool)/外部(搜索引擎+LLM)。

研究请求流转:用户输入→前端 SSE 连 `/research/stream`→后端建研究状态→规划(分 3 子任务)→执行(逐个:SearchTool 搜索→Summarizer 总结→NoteTool 记录)→报告(Report Writer 整合)→SSE 推进度和结果→前端实时更新。

后端用 `uv sync` 或 `pip install -e .`,配 LLM_PROVIDER/LLM_API_KEY/SEARCH_API(duckduckgo/tavily)。前端 `npm run dev`(:5174)。

## TODO 驱动的研究范式(14.2, p535-540)

核心思想:把"研究"复杂任务转化为"规划→执行→整合"流程。传统搜索每链接只覆盖一面、碎片化;TODO 驱动把主题拆 3-5 子任务逐个执行整合。

三核心要素:①智能规划器(TODO Planner,拆 3-5 子任务,太少覆盖不全太多冗余) ②任务执行器(Task Executor,搜索+提取+去冗+存来源) ③报告生成器(Report Writer,逻辑组织+合并重复+加引用)。

**三阶段流程**(14.2.2):
1. **规划(Planning)**:主题+当前日期→JSON 子任务列表,每个含 title/intent/query。分解策略:基础概念→技术现状→实际应用→发展趋势→对比分析。好规划:覆盖全面/逻辑清晰/查询精准/数量适中(3-5)。
2. **执行(Execution)**:逐子任务——`search_tool.run({input,backend,mode:"structured",max_results:5})` 搜索→提取标题/URL/snippet→`summarizer_agent` 总结(提取核心观点,合并相似,保留数字/日期/名称,加 `[1][2]` 来源引用)→`note_tool` 保存。实时 SSE 推 status/task 事件。
3. **报告(Reporting)**:所有总结+主题→Markdown 报告(标题/概述/详细分析/总结/参考文献五部分),按逻辑顺序、合并重复、统一格式、整理引用。

## 智能体系统设计(14.3, p540-547)

三 Agent 职责划分(表 14.1):
- **Agent 1 研究规划专家(TODO Planner)**:主题→3-5 子任务(类比研究前头脑风暴)。提示词含当前日期(获最新信息)、要求纯 JSON 输出、给示例、约束数量与逻辑关系。`PlanningService._extract_tasks` 用正则 `\[.*\]` 提 JSON 数组。
- **Agent 2 任务总结专家(Task Summarizer)**:阅读搜索结果提取关键信息(类比读文献做笔记)。提示词含任务标题/意图/查询上下文,要求核心观点+关键数据+来源引用。
- **Agent 3 报告撰写专家(Report Writer)**:整合所有总结成结构化报告(类比撰写研究报告)。

**`ToolAwareSimpleAgent` 设计**(14.3.2, p543-545):扩展 SimpleAgent 增加 `tool_call_listener` 回调参数,每次工具调用触发。用途:调试/日志/分析/进度展示。重写 `_execute_tool_call`:解析参数→调 `super()._execute_tool_call`→通知监听器(agent_name/tool_name/parsed_parameters/result)。**已集成进 HelloAgents 框架可复用**。深度研究中三 Agent 共用同一监听器,工具调用经 SSE 实时推前端。

**Agent 协作模式**(14.3.3):顺序协作——线性流程、明确输入输出、无并发。`DeepResearchAgent` 是核心协调器,`run()` 调度规划→执行(循环 search+summarize)→报告,每步 `_emit_event` 推 SSE。

## 工具系统集成(14.4, p547-552)

- **SearchTool 扩展**(14.4.1):ch07 已有 Tavily+SerpApi,本章新增 DuckDuckGo/Perplexity/SearXNG + Advanced 模式(组合多引擎)。统一搜索接口,配置 `SearchAPI` 枚举,改 `.env` 即可切换无需改码。返回字典:results/backend/answer(仅 Perplexity)/notices。特殊处理:`deduplicate_sources`(按 URL 去重)、`limit_source_tokens`(限每来源 Token,1 Token≈4 字符,默认 2000)。
- **NoteTool**(14.4.2):ch09 集成的内置工具(增删改查笔记)。持久化研究进度(中断可续 + 审计)。笔记按任务 ID 存 Markdown,目录 `workspace/notes/{id}.md` + `reports/final_report.md`。
- **ToolRegistry**(14.4.3):ch07 支持的工具注册表,统一管理 SearchTool/NoteTool。`register_tool` 注册后传给 Agent。调用流程:Agent 生成 `[TOOL_CALL:search_tool:{...}]`→Registry 解析+查找+调 `run`→格式化结果返回。

## 服务层实现(14.5, p552-563)

四核心服务连接 Agent 和工具:
- **PlanningService**:构建规划 Prompt→调 Agent→解析 JSON→验证字段(title/intent/query 必需)。**健壮 JSON 解析**:正则提 `\[.*\]`,失败再直接 `json.loads` 整个响应。可加 `evaluate_plan`(数量检查、查询质量评分)。
- **SummarizationService**:格式化搜索结果→构建 Prompt→调 Agent→提取来源 URL,返回 `(summary, source_urls)`。
- **ReportingService**:格式化所有子任务总结(含意图+来源 URL)→构建 Prompt→调 Agent 生成最终报告。
- **SearchService**:调度搜索引擎(读 `.env` 选引擎)→执行→去重+限 Token→错误降级(失败返 `[]`)。**注意**:此处没让 SimpleAgent 直接调工具,而是经中间层把 SearchTool 结果返回 Agent,让 Agent 更专注处理信息。可加**搜索结果缓存**(MD5(query+max_results+backend) 作键,存 `./cache/search/`)降本提效。

## 前端交互设计(14.6, p563-573)

- **全屏模态对话框**(`ResearchModal.vue`):沉浸式、清晰层次、ESC 关闭、响应式(媒体查询适配平板/手机)。含顶部栏/进度区/内容区(marked 渲染 Markdown)/底部栏。
- **SSE 实时进度**(14.6.2):服务器推送技术。后端 FastAPI `StreamingResponse` + `media_type="text/event-stream"`,`async generator` yield `data: {json}\n\n`,事件类型 progress/plan/task_summary/report/error。规划 10%→执行 10-80%→报告 90%→完成 100%。前端 `EventSource` 监听 `onmessage`,switch 事件类型更新 UI。`composables/useResearch.ts` 封装。
- **Markdown 可视化**(14.6.3):`marked` 配置 `breaks:true`(换行) + `gfm:true`(GitHub 风格)。

## 金句/洞见
- "将'研究'这个复杂任务转化为'规划→执行→整合'的流程"——TODO 驱动范式的本质。
- TODO 驱动优势:可控性强(每子任务明确范围)、质量可靠(专职 Agent)、易调试(单独调子任务)、可扩展。
- `ToolAwareSimpleAgent` 用一个回调把黑盒 Agent 变可观测,是工程化的关键抽象。
- SearchService 用中间层而非让 Agent 直接调工具——"让 Agent 更专注处理得到的信息"(p552),一种解耦思路。

## 关联
- 三 Agent 顺序协作 = [ch13](ch13-travel-assistant.md) 旅行助手同模式;`ToolAwareSimpleAgent` 扩展自 SimpleAgent([ch07](ch07-build-your-framework.md))。
- SSE 属通信技术,协议章 [ch10](ch10-agent-communication-protocols.md) 有讲解。
- SearchTool/NoteTool/ToolRegistry 均承接 ch07/ch09 工具系统。
