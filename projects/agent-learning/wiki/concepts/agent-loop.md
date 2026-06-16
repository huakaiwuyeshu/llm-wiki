# Agent 的核心循环 (Agent Loop)

> TL;DR:Agent 的本质不是某种产品形态,而是一个 **Thought → Action → Observation** 的循环——"想→做→看→再决定";生产环境 90% 的场景用「ReAct 主循环 + 按需 Plan」,能不规划就不规划。

## 一、什么是 Agent Loop

LLM 智能体循环(ch01, p15-17,图 1.5):

```
Perception(感知,获得 Observation)
  → Thought(思考 = Planning + Tool Selection)
  → Action(执行器调用工具)
  → 环境 State Change → 新 Observation
  → 闭环迭代
```

**交互协议 (Interaction Protocol)**(ch01, p15-17):结构化输出 = **Thought**(内部决策快照,自然语言)+ **Action**(函数调用形式,如 `get_weather("北京")`);外部 **Parser** 解析 Action 并执行;感知系统把原始结果(JSON)封装成简洁自然语言 **Observation** 反馈给模型。

最小实现:5 分钟旅行助手,纯 prompt 工程 + 主循环(最大 5 轮),不依赖任何框架——拼接 prompt_history → LLM 生成 → 正则截断多余的 Thought-Action 对 → 解析 Action → 执行工具或 Finish → 把 Observation 追加进 history(ch01, p17-23)。演示四项基本能力:任务分解、工具调用、上下文理解、结果合成,正是 LangChain/LlamaIndex 的设计精髓("工具 + 提示工程")。

## 二、"Agent 本质是 loop":控制策略而非产品

- 金句:**"Agent 不是一种产品形态,而是一种控制策略——就是这个循环本身。"**(手册第3页,⑤;【老傅1024】金句)
- 在九阶段演进里,Agent Loop / ReAct 是阶段⑤,定位为**质量层、★ 枢纽**:补的痛点是"多步任务谁来串"(如"钉钉文档搬到语雀")(范式演进图,阶段⑤;手册第3页 01)。
- PM 视角:Agent Loop 是 Agent 的"大脑";Harness 才是免疫系统+骨骼+皮肤(范式演进图,阶段⑤/⑧)。

## 三、生产实践:ReAct 主循环 + 按需 Plan

- **生产 90% 场景用「ReAct 主循环 + 按需 Plan」**(范式演进图,阶段⑤ / 关键数据,p?)。
- 设计逻辑:简单任务零开销直接做,复杂才规划——灵活又可控;**"不是越自主越好",能不规划就不规划**(范式演进图,阶段⑤)。
- 自主度边界是**产品决策,不是技术细节**:要划清"哪些步骤 LLM 自由发挥、哪些写死成固定流程"(范式演进图,阶段⑤ PM 拍板)。

## 四、Loop 在不同范式中的形态

Agent Loop 不止 ReAct 一种串法,经典范式各有循环结构(详见 [classic-paradigms.md](./classic-paradigms.md)):

- **ReAct**:Thought-Action-Observation 边想边做(ch04, p78-89)。
- **Plan-and-Solve**:先一次性 Planning,再逐步 Solving 执行(ch04, p89-95)。
- **Reflection**:执行 → 反思 → 优化的迭代循环(ch04, p95-103)。

## 跨资料对比 / 矛盾点

- ch01 把循环称为 **Agent Loop**(Perception-Thought-Action),范式演进图称之为 **Agent Loop / ReAct**(想-做-看-再决定),两者是同一循环的不同表述,术语一致。
- ch01 强调循环是 LLM agent 的**运行原理**(描述性);手册/演进图强调循环是**控制策略**(规范性,"Agent 本质是 loop")——视角互补不矛盾。

## 相关页面

- [classic-paradigms.md](./classic-paradigms.md) —— ReAct / Plan-and-Solve / Reflection 等循环范式
- [agent-planning.md](./agent-planning.md) —— "按需 Plan" 的规划能力演进
- [agent-definition.md](./agent-definition.md) —— 自主性与 Workflow 的区别
- [agent-paradigm-stages.md](./agent-paradigm-stages.md) —— Agent Loop 在九阶段/四阶段中的位置
- 来源:[ch01 初识智能体](../sources/hello-agents/ch01-intro-to-agents.md)、[ch04 经典范式](../sources/hello-agents/ch04-classic-agent-paradigms.md)、[范式演进图·深度注解版](../sources/agent-evolution-map-annotated.md)、[手册第3页改写成稿](../sources/handbook-page3-rewrite.md)
