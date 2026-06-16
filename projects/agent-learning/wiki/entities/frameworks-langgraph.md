# LangGraph

> TL;DR:LangChain 生态下的智能体编排框架,将执行流程建模为「状态机 + 有向图」(State Graph)。核心价值是**显式控制流 + 原生支持循环与条件分支**,牺牲「涌现」换取可靠性、可控性、可观测性;适合 Reflection、迭代优化、需人工介入的工作流。

## 它是什么

把智能体执行流程建模为**状态机 + 有向图**。三要素:

- **State**:全局共享状态对象(TypedDict),所有节点读写,如 `AgentState{messages, current_task, final_answer}`;支持 `Annotated[list, add_messages]` 聚合。
- **Nodes**:接收 state、返回更新后 state 的 Python 函数。
- **Edges**:常规边(固定流向)+ **条件边 (Conditional Edges)**(判断函数返回 key 映射到目标节点)——实现循环与分支的关键。

组装流程:`StateGraph(AgentState)` → add_node → set_entry_point → add_edge / add_conditional_edges(`{"continue_to_planner": "planner", "end_workflow": END}`)→ `compile(checkpointer=InMemorySaver)` → `app.stream(inputs)`。

## 关键事实

- 设计哲学属「**显式控制**」一极(对立面是 AutoGen/CAMEL 的涌现式协作)。
- **优势**:高度可控可预测、**循环 (Cycles) 原生支持**(反思-修正回路、容错回退)、节点即独立函数高度模块化、易插入人工审核节点(Human-in-the-loop)。
- **局限**:前期 boilerplate 代码多、缺少「涌现」式动态交互、调试需理解全图运行机制。
- 实战(ch06):三步问答助手 Understand → Search → Answer,understand_query_node 把 user_query 与 search_query 分离设计显著提升搜索质量;tavily_search_node 失败置 `step="search_failed"`;generate_answer_node 检查 step,失败则 fallback 用 LLM 自身知识并告知用户。

## 关系

- 与 [Corrective RAG / Self-RAG](../concepts/rag.md) 的技术地基相同:corrective_rag 模板的 grading 节点与图定义就建在 LangGraph 上,与 personal-assistant「Task State 状态机」是同一套思路。
- 是 [LangChain](./langchain.md) 生态的一部分,但定位更聚焦工作流编排;paradigm-evolution 将 LangGraph 列为 2024「Workflow Agent 阶段」代表(「用工程化约束弥补模型不确定性」)。
- DeepAgents(LangChain 出品)是其 Harness 方向延伸(见 [../concepts/harness.md](../concepts/harness.md))。

## 出现在哪些笔记

- [ch06](../sources/hello-agents/ch06-agent-frameworks.md) 6.5(p173-180)— 主要定义与实战
- [api-agent-template-breakdown.md](../sources/api-agent-template-breakdown.md)— corrective_rag 模板的 LangGraph 状态机编排
- [agent-paradigm-evolution.md](../sources/agent-paradigm-evolution.md)— 2024 Workflow 阶段代表(p3)

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 四框架对比、涌现 vs 控制
- [../concepts/rag.md](../concepts/rag.md) — Corrective/Self-RAG 建于 LangGraph
- [../concepts/agent-planning.md](../concepts/agent-planning.md) — 状态图实现规划与循环
- [./langchain.md](./langchain.md)、[./frameworks-autogen.md](./frameworks-autogen.md)、[./frameworks-agentscope.md](./frameworks-agentscope.md)、[./frameworks-camel.md](./frameworks-camel.md)
