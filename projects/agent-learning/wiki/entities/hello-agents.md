# HelloAgents(自建教学框架)

> TL;DR:《Hello-Agents》教材从零搭建的轻量级教学框架,设计理念「轻量级 + 标准 OpenAI API + 渐进式版本迭代 + 万物皆为工具」。从 ch07 起以版本迭代方式推进(每章新增模块),贯穿 ch07/10/13/14/15/16 成为高级应用的技术底座。`pip install "hello-agents"`,Python>=3.10。

## 它是什么

一个以「可读性即第一性」为目标的教学型框架,带读者从「框架使用者」转为「框架构建者」。四个核心设计理念:① 轻量级与教学友好;② 基于标准 OpenAI API 构建(而非自造抽象);③ 渐进式学习路径(每章代码存为可 pip 下载历史版本);④ **万物皆为工具**(Memory/RAG/RL/MCP 统一抽象为 Tool)。架构原则:分层解耦、职责单一、接口统一。目录:`core/`、`agents/`、`tools/`。

## 核心 API

- **HelloAgentsLLM**(模型调用中枢):多提供商支持(`provider` 参数处理 OpenAI/ModelScope/智谱差异)、本地模型集成(VLLM `:8000` / Ollama `:11434`,都暴露 OpenAI 兼容 API)、**自动检测机制**(`_auto_detect_provider` + `_resolve_credentials`,三级优先级:特定服务商环境变量 → 解析 LLM_BASE_URL 域名/端口 → API 密钥格式如 `ms-` 前缀)。推荐通过继承扩展。
- **Message 类**(core/message.py):Pydantic BaseModel,字段 content/role/timestamp/metadata;`role` 用 Literal 限 `user/assistant/system/tool`;`to_dict()` 转 OpenAI 兼容字典(「对内丰富,对外兼容」)。
- **Config 类**:集中化配置,默认值零配置可工作,`from_env()` 环境变量覆盖。
- **Agent 抽象基类**:`abc.ABC` + `@abstractmethod run()`,通用历史管理(add_message/clear_history/get_history)。
- **四种 Agent 范式**:
  - **SimpleAgent**:工具描述注入 system prompt,格式 `[TOOL_CALL:{name}:{params}]`,`_run_with_tools()` 多轮迭代(max_tool_iterations 默认 3),含 stream_run。
  - **ReActAgent**:Action 格式 `tool_name[tool_input]` 或 `Finish[答案]`,`run()` 循环解析 Thought/Action,`max_steps` 默认 5。
  - **ReflectionAgent**:initial/reflect/refine 三段 prompt,支持 custom_prompts,「无需改进」提前终止。
  - **PlanAndSolveAgent**:强制 Planner 以 Python 列表输出计划,Planner + Executor 双 prompt。
  - **FunctionCallAgent**(0.2.8 后):基于 OpenAI **原生 function calling**(非 prompt 约束),鲁棒性更强。
- **工具系统**:`Tool` 基类(`run(params)->str` + `get_parameters()`)、`ToolParameter`(Pydantic)、**ToolRegistry**(`register_tool` / `register_function`;`get_tools_description()` 拼提示词;`to_openai_schema()` 生成 FC schema);高级特性 ToolChain/ToolChainManager(多工具顺序执行)、AsyncToolExecutor(ThreadPoolExecutor max_workers=4 + asyncio 并行)。内置 SearchTool 整合 Tavily+SerpApi,`backend="hybrid"` 高可用降级。

## 关键事实

- **「万物皆为工具」是最大架构决策**:把 Memory/RAG/RL/MCP/SubAgent 统一为 Tool,牺牲表达力换认知简洁,ch08-16 都建立在此之上(协议即新工具类型,见 [./mcp.md](./mcp.md))。
- 三协议(MCP/A2A/ANP)在框架中统一封装为 MCPTool/A2ATool/ANPTool(均继承 BaseTool),见 [../concepts/communication-protocols.md](../concepts/communication-protocols.md)。
- 自建动机是批判 [LangChain](./langchain.md) 等现有框架的过度抽象/不稳定/黑盒/依赖复杂(见 [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md))。

## 出现在哪些笔记

- [ch07](../sources/hello-agents/ch07-build-your-framework.md)(p183-229)— 框架核心构建(LLM/Message/Config/Agent 基类/四范式/工具系统),是技术底座
- [ch10](../sources/hello-agents/ch10-agent-communication-protocols.md)— 协议工具(MCPTool/A2ATool/ANPTool)
- 贯穿 ch08(记忆/RAG)、ch09(上下文工程)、ch13/14/15/16(实战与毕业设计)

## 相关页面

- [../concepts/agent-frameworks-design.md](../concepts/agent-frameworks-design.md) — 自建框架四理念、对现有框架批判
- [../concepts/tool-use.md](../concepts/tool-use.md) — Tool/ToolRegistry/FunctionCallAgent
- [../concepts/communication-protocols.md](../concepts/communication-protocols.md) — 协议工具封装
- [./langchain.md](./langchain.md) — 被批判的对照对象
- [./mcp.md](./mcp.md)、[./a2a-anp.md](./a2a-anp.md)
