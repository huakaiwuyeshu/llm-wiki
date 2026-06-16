# Agent Skills(技能)

> TL;DR:Skill = SOP + 工具 + 资源 的「能力包」,核心是一个 SKILL.md(YAML frontmatter 元数据 + Markdown 操作手册);通过四阶段渐进式加载(Advertise → Load → Read → Run)实现约 10x token 效率——LLM 平时只看到每个 skill ~100 token 的摘要,匹配后才展开完整指令与工具。本质是把工具膨胀问题用 progressive disclosure 解决,信条「记忆是被动的,技能是主动的」。

## 定义与本质

**Skill = SOP + 工具 + 资源**(personal-assistant p17)。每个 Skill 自带完整「操作手册」,价值在于 LLM 不是在「猜」怎么用工具,而是在「按手册操作」——像给新员工一份 SOP 文档,而不是只告诉他工具箱在哪。

灵感来自 OS 的**按需加载(lazy loading)**,即**渐进式披露(Progressive Disclosure)**。要解决两个矛盾:① 上下文占用(50 个工具 schema 可能占 50,000 tokens);② 选择困难(>20 个工具后 LLM 选择准确率明显下降)。关键洞察:**大多数对话只会用到 1-2 个 skill**,没必要让 LLM 看到所有工具的完整定义。

## SKILL.md 结构

独立目录,核心是 `SKILL.md`(YAML frontmatter + Markdown body),可选 `scripts/`(可执行 Python)、`references/`(参考文档)、`assets/`。

- frontmatter 字段:`name`、`description`、`tools`(声明需要的全局 MCP 工具)、`metadata.max_rounds`(skill 内 ReAct 最大轮次)、`mcp_servers`(skill 专属 MCP server,非共享)、`disable-model-invocation`(只能用户主动触发、不自动加载)。
- 为什么用 YAML frontmatter 而非 JSON 配置:SKILL.md 给两个「读者」——人看 Markdown body 理解操作规范,机器解析 frontmatter 取元数据;一个文件解决两个问题,减少同步维护负担。

## 四阶段渐进式加载(10x token 效率)

| 阶段 | 时机 | 动作 | 开销 |
|---|---|---|---|
| **Advertise** | 启动时一次性 | 扫描 skill 目录解析 frontmatter,注入 system prompt 摘要(`- log-diagnosis: 日志诊断助手...`) | ~100 tokens/skill |
| **Load** | 按需 | LLM 判断匹配 → `load_skill()` 返回完整 SKILL.md body,同时 `inject_skill_mcp_tools` 注入 MCP 工具 | 500-2000 tokens,仅需要时 |
| **Read** | 按需 | 指令引用参考资料时 `read_skill_resource("references/error-patterns.md")`,含路径穿越检查(`os.path.realpath` 比较) | 仅引用时 |
| **Run** | 按需 | `run_skill_script("scripts/parse_trace.py")`,subprocess + **30s 超时** + cwd=skill 目录 + 路径穿越检查 | 仅执行时 |

**Token 效率对比**:传统全量注入 ~50,000 tokens(每工具 ~1000)= 1x;Skill Advertise ~5,000 tokens(每 skill ~100 摘要)= **10x**;Skill Load 后再 +1,000~3,000 tokens(仅用到的 1-2 个)。

## 关键机制

- **条件注册**:按能力有无注册工具——load_skill 始终注册;read_skill_resource 仅当存在含资源文件的 skill 时注册;run_skill_script 仅当存在含脚本的 skill 时注册。原因:每个注册工具占 token(run_skill_script 定义约 200 tokens),无脚本时注册纯浪费。
- **四源工具组装**(`get_all_tools_for_skill`):①scoped 原生 run_script ②scoped read_resource ③全局 MCP 工具(`tools:` 字段引用)④skill 专属 MCP 工具(`mcp_servers:` 字段)。
- **分发路由优先级**:scoped run_script → scoped read_resource → skill 专属 MCP → 全局 MCP(兜底)。scoped 优先级最高,因为它是 skill 作者为这个场景特意定制的、不依赖外部服务、最快最可靠。
- **Skill 路由本质是 Router 模式**:Skill advertise→load 本质上是 multi-agent 七模式里的 Router/Dispatch 动态路由(见 [multi-agent.md](./multi-agent.md))。

## 记忆 → 技能的演进(Skill 的来源)

「记忆是被动的(遇到才回忆),而技能是主动的(匹配条件自动触发)」(personal-assistant p5)。三个递进学习层次:

- **L1 记住事实**(被动:只有被检索到才生效)
- **L2 总结规则**(记忆聚合 → 行为约束注入 system prompt,半主动:每次生效但只约束非流程)
- **L3 形成技能**(规则+流程+触发条件=自动执行能力,全自动:匹配触发+完整流程+按需加载工具)

转化四阶段:Phase1 记忆积累 → Phase2 模式识别(同主题 feedback 达阈值聚类)→ Phase3 技能生成(自动生成 SKILL.md:name/trigger/rules/workflow)→ Phase4 自动应用。详见 [agent-memory.md](./agent-memory.md)。

## Skill 为主,Workflow 兜底

paradigm-evolution 的 Workflow 维度结论:**「Skill 为主,Workflow 为辅/兜底」**是当前平衡开发效率与运行稳定性的最佳实践。原本分散在 Workflow 引擎中的步骤定义、约束、判断逻辑「逻辑内聚化」写入 SKILL.md;需精确控制的环节「执行脚本化」用 Script 代码级编排。但极端复杂/容错率极低场景仍保留刚性 Workflow 提供确定性边界——「可控性与稳定性的博弈」。

## 跨资料对比

- personal-assistant 给出 Skill 的**完整工程实现**(四阶段 API、条件注册、四源组装、路由优先级、安全检查);paradigm-evolution 从**范式角度**论述 Skill 如何承接 Workflow(逻辑内聚 + 执行脚本化)与 Prompt(渐进式加载实现动静分离)。两者「Skill 是动态能力的承载、按需加载」方向一致。
- 与 ch10 的 MCP Prompts 能力可类比(都是「指导性模板」),但 Skill 范畴更大,含可执行 scripts 与 references。

## 相关页面

- [agent-memory.md](./agent-memory.md) — 记忆→规则→技能的演进链路
- [context-engineering.md](./context-engineering.md) — progressive disclosure / 动静分离
- [tool-use.md](./tool-use.md) — Skill 缓解工具膨胀;MCP 工具按需注入
- [multi-agent.md](./multi-agent.md) — Skill 路由 = Router/Dispatch 模式
- [agent-frameworks-design.md](./agent-frameworks-design.md) — Skill 为主 / Workflow 兜底
- 来源:[agent-from-scratch-personal-assistant.md](../sources/agent-from-scratch-personal-assistant.md)(p5-8、p16-17、p60-67)、[agent-paradigm-evolution.md](../sources/agent-paradigm-evolution.md)(Prompt/Workflow 维度 p5-6、p10-11)
