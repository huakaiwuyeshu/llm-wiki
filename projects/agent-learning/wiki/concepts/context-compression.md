# 上下文压缩(Context Compression)

> TL;DR:当对话逼近上下文窗口上限时,要把历史"压缩"出空间又不丢关键信息。个人助手长文给出一套生产级方案:**75% 窗口触发**(留 25% 给 completion 和压缩调用自身)→ **HEAD/TAIL 保护区**(护住首尾,压缩中间)→ **三步压缩**(划保护区 → 物理修剪工具输出 → LLM 结构化摘要)→ 仍超限则**三级降级** → **防抖**避免无效压缩。HelloAgents/Anthropic 侧称同类机制为「压缩整合(Compaction)」,并把它与「结构化笔记」「子代理」并列为长时程任务三策略。

## 概念定义

上下文压缩 = 在有限上下文窗口内,通过摘要、修剪、降级等手段腾出空间,同时尽量保留 Agent 决策所需的关键信息。它是上下文工程(见 [context-engineering.md](./context-engineering.md))在"超长对话"场景下的具体落地,也是 Agent Loop 六重保障之一(个人助手, p35)。

注意区分两个层次:GSSC 的 Compress 阶段是"单次调用拼装时"的兜底裁剪;本页讲的是"对话历史累积到逼近窗口"时的主动压缩与重启。

## 关键机制

### 触发时机:75% 而非 90%

prompt token 达到 `context_length × 75%` 时触发(个人助手, p35)。为什么不是 90%?要给 LLM 留 completion tokens 空间(也占窗口),且压缩本身要调 LLM(也需要 token),所以预留 25% 余量(个人助手, p35)。

> 对比:Harness 综述给出更细的四阶段渐进策略——60% 预警(标记可压缩区,无损失)、70% 自动压缩(LLM 结构化摘要替换早期消息)、80% 工具结果截断(只保留 summary)、90% 紧急模式(仅保留 system prompt + 最近 3 轮)(个人助手, p28)。各家阈值不同,本项目取 75% 作为单一触发点。

### 三步压缩(Loop 中最复杂的子系统)

(个人助手, p36-38)

- **Step1 划分保护区**:
  - **HEAD 保护区**(前 3 条):system + 首轮对话。system prompt 含角色定义和工具列表,丢失即"失忆";首轮通常含用户核心目标。
  - **TAIL 保护区**(后 6 条 / 最近 3 轮):最近对话是 LLM 决策的直接依据,丢失会重复劳动。
  - **MIDDLE** 为压缩目标。
- **Step2 物理修剪 MIDDLE 区工具输出**(通常减少 **40-60%** token):`_summarize_tool_result` 按工具类型生成单行摘要——terminal 提取命令 + exit_code(如 `[terminal] ran 'pytest tests' -> exit 1, 42 lines output`)、read_file 提取路径 + 偏移、write_file 提取路径 + 写入行数、search_files 提取模式 + 匹配数;其他工具 ≤200 字符保留,否则截前 150 字符。设计思路:这些信息足以让 LLM"回忆起"之前做了什么,无需保留动辄几千字的完整输出。
- **Step3 LLM 驱动结构化摘要**:把修剪后的 MIDDLE 发给 LLM,按 **13 个字段**生成结构化摘要——Active Task(用户最近未完成请求,逐字复制)/ Goal / Completed Actions(含工具名和结果)/ Active State(当前目录/分支/文件)/ In Progress / Blocked / Key Decisions / Remaining Work / Critical Context(绝不含密钥)等。summarizer 指令要点:把对话当 source material 做 compact record、**摘要使用用户的语言**(中文对话输出中文摘要)、**NEVER include API keys/tokens/passwords,replace with [REDACTED]**。
  - 输入限 `max_total_chars=15000`(约 3750 tokens),每条消息截 500 字;摘要预算 `min(max(200, content_tokens × SUMMARY_RATIO≈0.3), 2000)` tokens。
  - 双重保险:LLM 不可用时回退到基于规则的 `_build_structured_summary`。
- **整体效果**:100+ 条消息 → 约 10 条,token 减少 **60-80%**(个人助手, p36)。

### 三级降级(标准压缩后仍超限)

场景如单轮工具输出 80K token,标准三步压不下来(个人助手, p39-40):

| 级别 | 损失 | 动作 |
|---|---|---|
| 降级① | 低 | 尾部保护从 6 条减到 3 条再压 |
| 降级② | 中 | 删除最早 10 条工具结果消息 |
| 降级③ | 高 | 只保留 system prompt + 最近 3 轮 + 插入 `[Context overflow]` 说明消息(Agent 相当于"重启") |

### 压缩防抖(Debounce)

若最近几次(保留 5 次记录)压缩平均节省率 <10%(`COMPRESSION_DEBOUNCE_THRESHOLD=0.1`),跳过压缩,避免浪费 LLM 调用——典型如单条 system prompt 占 60% 窗口的场景,反复压也压不下来(个人助手, p40)。

### Todo 状态注入(防"忘记进度")

压缩可能把 todo 工具调用的历史消息压掉,导致 LLM"忘记自己做到哪了"。解法:压缩完成后 `_inject_todo_state` 把未完成 todo 作为独立 user 消息注入(插到尾部保护区之前)。不放进 system prompt 的原因:system prompt 固定而 todo 动态变化,且若放在保护区内只会越压越大(个人助手, p40-41)。配套 `format_for_injection()` 仅输出 pending 和 in_progress(已完成/取消的会让 LLM 误以为需重做),详见 [agent-planning.md](./agent-planning.md)。

### 压缩整合(Compaction)与长时程三策略

ch09 把同类机制称为**压缩整合(Compaction)**,并将其与另两种策略并列为面向长时程任务(大型代码库迁移、跨数小时研究等)的三大策略(ch09, p279-280):

1. **压缩整合(Compaction)**:对话接近上限时高保真总结并重启新窗口。保留架构决策、未解决缺陷、实现细节,丢弃重复工具输出与噪声;新窗口携带压缩摘要 + 最近少量高相关工件。调参口诀:**先优化召回再优化精确度**;"轻触式"压缩先清理深历史的工具调用与结果。→ 适用「需长对话连续性(接力)」。
2. **结构化笔记(Structured note-taking)**:以固定频率将关键信息写入上下文外的持久化存储,按需拉回,极低上下文开销维持持久状态(TODO 列表、NOTES.md、关键结论/依赖/阻塞索引)。→ 适用「有里程碑的迭代式开发」。详见 [agent-memory.md](./agent-memory.md)。
3. **子代理架构(Sub-agent architectures)**:主代理负责高层规划与综合,多个专长子代理在"干净的上下文窗口"中各自深挖,**仅回传凝练摘要(常见 1,000-2,000 tokens)**。→ 适用「复杂研究分析(并行探索受益)」。详见 [multi-agent.md](./multi-agent.md)。

## 跨资料对比 / 矛盾点

- **术语对应**:个人助手长文的"三步压缩 + 三级降级" ≈ ch09 的"压缩整合(Compaction)";前者是工程实现细节(13 字段、75% 阈值、防抖),后者是理论框架(召回优先、轻触式)。两者方向完全一致,可互为印证。
- **保护区的共识**:个人助手长文 HEAD/TAIL 保护区(护首尾压中间)与 ch09 "保留头尾关键指令与最终结论"(范式演进, p7-8 亦同)三处口径一致——首尾比中间更值得保护。
- **压缩 vs 笔记/子代理的关系**:ch09 明确指出无限增大上下文窗口不能根治污染与相关性退化,压缩只是三策略之一;个人助手长文也提到压缩有"不可逆信息损失",这是其引入 SubAgent 上下文隔离的动因之一(个人助手, p17)。两份资料都认为压缩不是万能解,需与隔离/外部记忆组合。

## 相关页面

- [context-engineering.md](./context-engineering.md) —— 上下文工程总论、GSSC、注意力预算
- [agent-memory.md](./agent-memory.md) —— 结构化笔记作为压缩的互补手段
- [agent-planning.md](./agent-planning.md) —— Todo 状态如何在压缩中存活
- [multi-agent.md](./multi-agent.md) —— 子代理上下文隔离
- [harness.md](./harness.md) —— 上下文压缩作为 Harness 子系统、四阶段阈值
- 来源:[个人助手实践长文](../sources/agent-from-scratch-personal-assistant.md)、[ch09 上下文工程](../sources/hello-agents/ch09-context-engineering.md)、[Agent 范式演变](../sources/agent-paradigm-evolution.md)
