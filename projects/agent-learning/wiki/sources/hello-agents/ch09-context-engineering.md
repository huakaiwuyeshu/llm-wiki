# Hello-Agents 第九章：上下文工程(Context Engineering)

TL;DR：本章把焦点从「提示工程」升级到「上下文工程」——在每次模型调用前,以可复用、可度量、可演进的方式拼装并优化输入上下文,核心是管理 LLM 有限的「注意力预算」对抗「上下文腐蚀(context rot)」;HelloAgents 为此新增三个组件:ContextBuilder(实现 GSSC 四阶段流水线)、NoteTool(Markdown+YAML 结构化外部记忆)、TerminalTool(沙箱化即时文件系统访问),并用一个跨多天会话的「代码库维护助手」实战整合三者,展示长时程任务的连贯性管理。

> 原文:sources/Hello-Agents-V1.0.2-20260210.pdf | 类型:教材 | 章节页码 p277-p333(第九章正文+习题+参考文献,p334 起为第十章) | ingest 日期 2026-06-10
> 配套安装:`pip install "hello-agents[all]==0.2.8"`(p277)
> 参考文献:[1] Anthropic《Effective Context Engineering for AI Agents》;[2] David Kim《Context-Engineering》(GitHub)(p333)

---

## 9.1 什么是上下文工程(p277-278)
- 在数年提示工程(Prompt Engineering)主导后,新术语登场:**上下文工程(Context Engineering)**。核心问题从"找对提示词句式"升级为"什么样的上下文配置最可能让模型产出期望行为"。
- "上下文"= 对 LLM 采样时所包含的那组 tokens。工程问题=在 LLM 固有约束下优化这些 tokens 的效用。需要"在上下文中思考":每次调用都审视 LLM 可见的整体状态,预判其可能诱发的行为。
- **上下文工程 vs 提示工程**(图9.1):提示工程关注如何编写/组织指令(尤其系统提示);上下文工程是其自然演进,在推理阶段策划与维护"最优信息集合(tokens)",涵盖系统指令、工具、MCP、外部数据、消息历史等一切进入上下文窗口的内容。
- 循环运行的智能体不断产生下一轮可能相关的数据,必须周期性提炼;"艺与术"在于从持续扩张的"候选信息宇宙"中甄别哪些应进入有限上下文窗口。

## 9.2 为什么上下文工程重要(p278-280)
- **上下文腐蚀(context rot)**:针堆找针(needle-in-a-haystack)基准揭示——随上下文 tokens 增加,模型从上下文准确回忆信息的能力反而下降。不同模型退化曲线不同但普遍存在。
- 上下文必须视作**有限资源,边际收益递减**。LLM 有一笔"注意力预算",每新增一个 token 都消耗一部分。原因:Transformer 两两注意力是 O(n²) 关系,上下文越长建模能力被"拉薄";训练数据中短序列更常见,模型对"全上下文依赖"经验少;位置编码插值适配长序列会牺牲位置精度。整体是**性能梯度而非悬崖式崩溃**。

### 9.2.1 有效上下文的"解剖学"(p278-279)
目标:用尽可能少但高信号密度的 tokens 最大化期望结果概率。围绕以下组件工程化:
- **系统提示(System Prompt)**:语言清晰直白,信息层级"刚刚好"。两极误区:**过度硬编码**(写复杂脆弱 if-else,维护成本高易碎)和**过于空泛**(只给宏观目标缺具体信号)。建议分区组织(`<background_information>`、工具指引、输出描述等)用 XML/Markdown 分隔,追求"最小必要信息集"("最小"≠"最短")。
- **工具(Tools)**:定义智能体与信息/行动空间的契约,须返回 token 友好信息并鼓励高效行为。要求职责单一、低重叠、接口语义清晰、对错误鲁棒、入参描述无歧义。常见失败模式是"臃肿工具集",应甄别"最小可行工具集(MVTS)"。
- **示例(Few-shot)**:始终推荐提供,但不要罗列所有边界条件,精挑多样典型示例。"好的示例胜过千言万语"。
- 总指导思想:**信息充分但紧致**。

### 9.2.2 上下文检索与智能体式搜索(p279)
- 简洁定义:**智能体 = 在循环中自主调用工具的 LLM**。
- 工程实践从"推理前一次性检索(embedding 检索)"过渡到"**及时(Just-in-time, JIT)上下文**":不预先加载,而是维护轻量引用(文件路径、查询、URL),运行时按需动态加载。认知模式更贴近人类(用文件系统/书签等外部索引按需提取)。
- **渐进式披露(progressive disclosure)**:每一步交互产生新上下文,反过来指导下一步决策(文件大小暗示复杂度、命名暗示用途、时间戳暗示相关性)。智能体按层构建理解,只在工作记忆保留"当前必要子集"。
- 权衡:运行时探索比预计算检索慢,需要有"主见"的工程设计。**混合策略**常更有效:前置加载少量高价值上下文保证速度,再允许按需自主探索(如放入 README/指南,同时提供 glob/grep 原语)。

### 9.2.3 面向长时程任务的上下文工程(p279-280)★三大策略
适用大型代码库迁移、跨数小时系统性研究等。无限增大上下文窗口不能根治污染与相关性退化。
- **压缩整合(Compaction)**:对话接近上限时高保真总结并重启新窗口。保留架构决策、未解决缺陷、实现细节,丢弃重复工具输出与噪声;新窗口携带压缩摘要+最近少量高相关工件。调参:先优化召回再优化精确度;"轻触式"压缩先清理深历史的工具调用与结果。
- **结构化笔记(Structured note-taking)**(即"智能体记忆"):以固定频率将关键信息写入上下文外的持久化存储,按需拉回。极低上下文开销维持持久状态(TODO列表、NOTES.md、关键结论/依赖/阻塞索引)。结合第八章 MemoryTool 可实现文件式/向量式外部记忆。
- **子代理架构(Sub-agent architectures)**:主代理负责高层规划与综合,多个专长子代理在"干净的上下文窗口"中各自深挖,**仅回传凝练摘要(常见 1,000-2,000 tokens)**。实现关注点分离,适合并行探索的复杂研究。
- **经验法则**:压缩整合→需长对话连续性("接力");结构化笔记→有里程碑的迭代式开发;子代理→复杂研究分析(并行探索受益)。

---

## 9.3 ContextBuilder:GSSC 流水线(p280-293)★核心

### 设计动机(p280)
四个目标:**统一入口**(把 Gather-Select-Structure-Compress 抽象为可复用流水线)、**稳定形态**(输出固定骨架模板便于调试/A-B测试)、**预算守护**(token 预算内保留高价值信息+兜底压缩)、**最小规则**(只用相关性+新近性评分,不引入来源/优先级等维度)。

### 核心数据结构(p281-282)
- **ContextPacket**:候选信息基本单元。字段:content、timestamp、token_count、relevance_score(0.0-1.0,默认0.5)、metadata。`__post_init__` 中把 relevance_score 钳制到 [0,1]。
- **ContextConfig**:配置。`max_tokens=3000`、`reserve_ratio=0.2`(为系统指令预留)、`min_relevance=0.1`、`enable_compression=True`、`recency_weight=0.3`、`relevance_weight=0.7`。断言 **recency_weight + relevance_weight 必须 = 1.0**。

### GSSC 四阶段(p282-289)
1. **Gather(多源汇集)**(p282-284):汇集 ①系统指令(relevance=1.0,最高优先级不参与评分)②记忆系统检索(memory_tool, limit=10, min_importance=0.3)③RAG 检索(rag_tool, limit=5, min_score=0.3)④对话历史(默认保留最近 5 条,relevance=0.6)⑤自定义信息包。每个外部源用 try-except 包裹(容错机制),单源失败不影响整体。
2. **Select(智能选择)**(p284-286):分离系统指令与其他信息→计算综合分数 `combined_score = relevance_weight × relevance + recency_weight × recency`→过滤低于 min_relevance→按分数降序→**贪心选择**(从高到低填充直到 token 上限)。
   - `_calculate_relevance`:用 **Jaccard 相似度**(关键词重叠,交集/并集),生产环境可换向量相似度。
   - `_calculate_recency`:指数衰减 `exp(-0.1 × age_hours / 24)`,钳制 [0.1, 1.0],24 小时内保持高分(与第八章感知记忆公式一致)。
3. **Structure(结构化输出)**(p286-288):按类型分组成固定模板分区:`[Role & Policies]`(系统指令)、`[Task]`(用户查询)、`[Evidence]`(RAG/knowledge 证据)、`[Context]`(对话历史+记忆)、`[Output]`(输出要求)。优势:可读性、可调试性、可扩展性。
4. **Compress(兜底压缩)**(p288-289):超 max_tokens 时**分区压缩保持结构完整性**,逐区完整保留,不够时部分保留(至少 50 tokens 才截断,加"[...内容已压缩...]")。`_count_tokens` 简单估算:中文 1 字符≈1 token,英文 1 单词≈1.3 tokens(生产应用精确 tokenizer)。

### 集成与最佳实践(p289-293)
- 完整示例(p289-291):数据工程顾问场景,展示构建出的结构化上下文(含 [Evidence] Pandas 内存优化建议如"int64 降 int32 省 50% 内存")。
- `ContextAwareAgent`(p291-293):继承 SimpleAgent,run 方法自动 build 上下文→调 LLM→更新历史→记 episodic 记忆(importance=0.6)。ContextBuilder 成为 Agent 的"上下文管理大脑"。
- 最佳实践(p293):动态调整 token 预算、相关性计算换向量相似度、缓存系统指令/知识库、监控日志(选中数量/token使用率)、A/B 测试关键权重参数。

---

## 9.4 NoteTool:结构化笔记(p293-308)
为长时程任务提供的结构化外部记忆,以 Markdown 文件为载体,头部 YAML 前置元数据,正文记状态/结论/阻塞/行动项。

### 设计理念(p293-296)
- 与 MemoryTool(对话式记忆:工作/情景/语义)互补,填补"项目式任务长期追踪"的 gap。优势:**结构化记录**(Markdown+YAML 机器/人类双友好)、**版本友好**(纯文本天然支持 Git)、**低开销**(无需数据库)、**灵活分类**(type+tags)。
- 典型场景:长期项目追踪、研究任务管理、与 ContextBuilder 配合(每轮对话前 search/list 检索笔记注入上下文)。
- **存储格式**(p295-296):每个笔记是独立 .md 文件,**文件名即 ID**;维护 `notes_index.json` 索引(快速检索、元数据管理、完整性校验)。

### 七个核心操作(p296-303)
`create / read / update / search / list / summary / delete`,覆盖完整生命周期。
- 笔记类型:`task_state`(阶段进展)、`conclusion`(结论)、`blocker`(阻塞,优先级最高)、`action`(行动计划)、`reference`(参考)、`general`。
- create:生成 ID `note_{timestamp}_{len(index)}`,`_build_markdown` 用 yaml.dump(allow_unicode=True) 拼 `---\n{yaml}---\n\n{content}`。
- search:类型/标签过滤 + 标题/正文关键词匹配,按 updated_at 倒序。
- summary:统计 total_notes、type_distribution、最近 5 条。

### 与 ContextBuilder 深度集成(p303-308)
- `ProjectAssistant`(继承 SimpleAgent):run 方法检索相关笔记→转 ContextPacket→build 上下文→调 LLM→可选 `_save_as_note`(根据关键词判断 blocker/action/conclusion 类型)。
- `_retrieve_relevant_notes`:**优先检索 blocker 和 action 类型**笔记 + 通用搜索,合并去重。
- 运行效果(p307):汇集 8 个候选包→选 7 个共 3500 tokens→回答引用历史笔记并自动标记 blocker。
- **最佳实践**(p308):合理分类;定期清理归档(已解决 blocker→conclusion,过时 action 删除);相关性分数排序 **blocker > action > conclusion**;人机协作(Git 版本控制、人工审核);自动化(定期摘要、同步 Notion/Confluence)。

---

## 9.5 TerminalTool:即时文件系统访问(p308-317)
实现 9.2.2 的 JIT 上下文理念——不预先索引,按需探索文件系统(查看日志、分析代码库、检索配置)。

### 安全机制(p309-311)★四层
允许智能体执行命令强大但危险,通过四层确保安全:
1. **命令白名单**:只允许只读命令(`ls/dir/tree/cat/head/tail/less/more/find/grep/egrep/fgrep/wc/sort/uniq/cut/awk/sed/pwd/cd/file/stat/du/df/echo/which/whereis`),禁止 rm 等修改操作。
2. **工作目录限制(沙箱)**:只能访问指定 workspace 及子目录,禁止访问外部路径,禁止 `..` 逃逸(用 `relative_to(workspace)` 校验)。
3. **超时控制**:每命令有执行时间限制(默认示例 30 秒,长程助手用 60 秒),防无限循环。
4. **输出大小限制**:限制输出大小(默认 10MB / 10485760 字节)防内存溢出,超限截断。

### 核心功能(p311-317)
- `_execute_command`:`subprocess.run(shell=True, cwd=current_dir, capture_output, timeout, env)`,合并 stdout+stderr,检查输出大小,非零返回码标警告,超时/异常妥善处理。
- `_handle_cd`:支持目录导航(`..`/`~`等),校验在 workspace 内、目录存在且是目录。
- **典型使用模式**:探索式导航(ls/tree/grep -r)、数据文件分析(head/wc -l/cut+sort+uniq)、日志分析(tail+grep ERROR/awk 统计错误分布)、代码库分析(find+wc -l 统计行数/grep -rn 查函数)。
- **与其他工具协同**:发现的信息存 MemoryTool(语义记忆,importance=0.8);重要发现记 NoteTool(blocker 笔记);输出转 ContextPacket 喂 ContextBuilder。

---

## 9.6 长程智能体实战:代码库维护助手(p317-331)
整合 ContextBuilder + NoteTool + TerminalTool + MemoryTool,构建跨会话的 `CodebaseMaintainer`。

### 场景与挑战(p317)
中型 Python Flask Web 应用(约 50 个文件/3500 行),存在技术债。三大挑战及对策:
- 信息量超上下文窗口 → TerminalTool 即时按需探索
- 跨会话状态管理(任务持续数天) → NoteTool 记录进展/待办/决策
- 上下文质量与相关性 → ContextBuilder 智能筛选保高信号密度

### 核心实现(p317-325)
`CodebaseMaintainer` 三层架构(图9.3)。run 方法六步:预处理(按 mode)→检索相关笔记→构建上下文→调 LLM→后处理→更新历史。
- **四种模式**:`explore`(探索结构)、`analyze`(代码质量,查 TODO/FIXME/统计行数)、`plan`(任务规划,加载 task_state 笔记)、`auto`(自动决策)。
- `_notes_to_packets` 相关性映射:**blocker=0.9, action=0.8, task_state=0.75, conclusion=0.7**。
- `_postprocess_response`:发现"问题/bug/错误/阻塞"关键词自动创建 blocker 笔记;"计划/下一步/任务"自动创建 action 笔记。
- 对话历史限制保留最近 20 条(10 轮)。
- 便捷方法:explore/analyze/plan_next_steps/execute_command/create_note/get_stats/generate_report。

### 完整使用示例(p325-330)
模拟跨三天+一周的真实工作流:
- 第一天探索:扫描出 Flask 应用模块结构(models/routes/services/utils/tests/migrations),约 3500 行;深入分析 models 发现 User.email 缺唯一约束、Order 缺时间字段等问题,自动创建 blocker 笔记。
- 第二天分析:质量报告——代码重复(HIGH,建议提取 BaseService)、复杂度过高(process_order 8 层嵌套)、测试覆盖率仅 45%、12 个 TODO;给出 process_order 重构建议(早返回/提取方法/事务)。
- 第三天规划:整理重构任务优先级(高/中/低),手动创建详细周计划笔记。
- 一周后:笔记摘要 total_notes=8(blocker:3, action:2, task_state:2, conclusion:1);会话报告 duration 172800 秒(2天)、commands_executed=24、notes_created=8、issues_found=3。

### 运行效果分析(p331)
长程智能体五大关键特性:**跨会话连贯性**(NoteTool 保持多天任务连续)、**智能上下文管理**(ContextBuilder 自动汇集 blocker、按模式调整)、**即时文件访问**(TerminalTool 无需预索引)、**自动化知识管理**(自动建 blocker/action 笔记、存记忆)、**人机协作**(自动化+人工干预平衡)。可扩展方向:集成 RAGTool 向量索引、拆分多智能体(探索者/分析者/规划者)、集成测试工具、git 命令追踪、Gradio/Streamlit 可视化。

---

## 9.7 本章总结(p331-333)
- **理论**:上下文工程本质(管理有限注意力预算)、上下文腐蚀(上下文是稀缺资源)、三大策略(压缩整合/结构化笔记/子代理)。
- **工程**:ContextBuilder(GSSC)、NoteTool(Markdown+YAML)、TerminalTool(安全命令行)、长程智能体(整合三工具)。
- **核心收获**:分层设计 = 即时访问(TerminalTool)+ 会话记忆(MemoryTool)+ 持久笔记(NoteTool);智能筛选(相关性+新近性);安全第一;人机协作。
- 预告:第十章讲智能体通信协议(MCP/A2A/ANP)。

## 金句/洞见
- "上下文必须被视作一种有限资源,且具有边际收益递减" —— LLM 像人类一样有"注意力预算"。(p278)
- "如果人类工程师都说不准用哪个工具,别指望智能体做得更好" —— 警惕臃肿工具集,追求 MVTS。(p278)
- "好的示例胜过千言万语" —— Few-shot 精挑多样典型而非罗列边界条件。(p279)
- HyDE/JIT 的认知类比:"我们不会死记硬背全部信息,而是用文件系统、收件箱、书签等外部索引按需提取"。(p279)
- 子代理回传"凝练摘要(常见 1,000-2,000 tokens)" —— 庞杂搜索上下文留在子代理内部,主代理专注整合。(p280)

## 关联与矛盾
- 直接承接第八章:NoteTool 与 MemoryTool 互补(对话式记忆 vs 项目式结构化笔记);ContextBuilder 的 `_calculate_recency` 指数衰减公式与第八章感知记忆完全一致(exp(-0.1×age/24))。
- 子代理架构是第十一/十二章(多智能体)的理论铺垫。
- 上下文工程理论大量引用 Anthropic 官方工程博客,与 Claude Code 的实际工程实践高度对应。
