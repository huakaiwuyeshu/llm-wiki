TL;DR: 从零搭建教学型框架 HelloAgents——核心设计理念是「轻量级 + 标准 OpenAI API + 渐进式版本迭代 + 万物皆为工具」;本章实现 LLM 统一调用中枢(多 provider/本地模型/自动检测)、消息/配置/Agent 抽象基类、四种 Agent 范式的框架化重构(Simple/ReAct/Reflection/PlanAndSolve)与工具系统(Tool 基类+ToolRegistry+工具链+异步执行)。

# 第七章 构建你的智能体框架 (p183-229)

本章起从「框架使用者」转为「框架构建者」,自建 HelloAgents 框架,以版本迭代方式推进(每章新增模块),作为后续高级应用(ch08-16)的技术底座。可 `pip install "hello-agents==0.1.1"` 体验,Python>=3.10。

## 7.1 整体架构设计与设计理念

**为何自建框架**(p183):批判现有框架四大局限——
1. 过度抽象的复杂性(以 LangChain 为例,链式调用学习曲线陡峭,简单任务需理解 Chain/Agent/Tool/Memory/Retriever 等十几个概念)
2. 快速迭代带来的不稳定性(API 频繁变更,版本升级后代码失效)
3. 黑盒化实现逻辑(核心封装过严,难以理解内部机制,依赖社区支持)
4. 依赖关系复杂性(依赖包多、体积大、易冲突)

价值:从「使用者」到「构建者」的能力跃迁——深度理解 Agent 工作原理、获得完全控制权、培养系统设计能力。

**四个核心设计理念**(p183-184):
1. **轻量级与教学友好的平衡**:核心代码按章节区分,极简依赖(除 OpenAI 官方 SDK 和几个基础库外不引入重型依赖)
2. **基于标准 API 的务实选择**:在 OpenAI API 标准之上构建而非重新发明抽象接口(OpenAI API 已成行业标准,主流 LLM 提供商都兼容)
3. **渐进式学习路径**:每章学习代码保存为可 pip 下载的历史版本,每个核心功能自己编写
4. **统一的「工具」抽象——万物皆为工具**:除核心 Agent 类外,一切皆为 Tools。Memory/RAG/RL/MCP 等模块在 HelloAgents 中统一抽象为「工具」,消除不必要抽象层,回归「智能体调用工具」的核心逻辑

架构原则:**分层解耦、职责单一、接口统一**。目录结构:`core/`(agent.py/llm.py/message.py/config.py/exceptions.py)、`agents/`(simple/react/reflection/plan_solve)、`tools/`(base/registry/chain/async_executor/builtin)。

## 7.2 HelloAgentsLLM 扩展(模型调用中枢)

在 ch04 的 HelloAgentsLLM 基础上升级,三大目标:多提供商支持、本地模型集成、自动检测机制。

- **多提供商**(p185):引入 `provider` 参数,内部处理不同服务商(OpenAI/ModelScope/智谱 AI 等)的环境变量命名、默认 base_url、推荐模型差异。推荐通过**继承**扩展(如自定义 `MyLLM` 拦截 `provider="modelscope"`,其余交还 `super().__init__()`),而非直接改库源码(便于升级)。
- **本地模型**(p186-187):
  - **VLLM**:高性能推理库,通过 PagedAttention 等技术实现比标准 Transformers 高数倍吞吐量;`python -m vllm.entrypoints.openai.api_server` 启动,默认 `http://localhost:8000/v1`
  - **Ollama**:封装模型下载/配置/启动到一条命令(`ollama run llama3`),默认 `http://localhost:11434/v1`
  - 二者都暴露 OpenAI 兼容 API,接入只需当作新 provider,核心 Agent 代码无需修改即可在云端/本地切换
- **自动检测机制**(p187-188):`_auto_detect_provider` + `_resolve_credentials` 协同,「约定优于配置」。三级优先级:
  1. 最高:检查特定服务商环境变量(`MODELSCOPE_API_KEY`/`OPENAI_API_KEY`/`ZHIPU_API_KEY`)
  2. 次高:解析 `LLM_BASE_URL`(域名匹配 `api-inference.modelscope.cn`/`api.openai.com`;端口匹配 `:11434`=Ollama、`:8000`=VLLM)
  3. 辅助:分析 API 密钥格式(如 `ms-` 前缀=modelscope;优先级低,有模糊性)

表 7.1 对比 HelloAgentsLLM 不同版本特性(原书为表,具体单元格未提取)。

## 7.3 框架接口实现(三个核心文件)

- **Message 类**(p189):基于 Pydantic BaseModel,字段 content/role/timestamp/metadata。`role` 用 `typing.Literal` 限制为 `user/assistant/system/tool`(对应 OpenAI 规范)。`to_dict()` 转为 OpenAI 兼容字典(「对内丰富,对外兼容」)。后续 ch09 上下文工程会扩展。
- **Config 类**(p190):集中化配置,分 LLM 配置/系统配置等。每项有默认值(零配置可工作),`from_env()` 类方法支持环境变量覆盖。
- **Agent 抽象基类**(p190-191):用 `abc.ABC` 实现顶层抽象,强制所有子类实现 `@abstractmethod run()`,统一执行入口。构造函数定义核心依赖(name/llm/system_prompt/config),提供通用历史管理(add_message/clear_history/get_history)。

## 7.4 Agent 范式的框架化实现

在 ch04 三种范式基础上重构,三大目标:提示词工程系统性提升(任务导向→通用化)、接口标准化统一、高度可配置。

- **SimpleAgent**(p191-194):最基础对话 Agent。支持可选工具调用——通过 `_get_enhanced_system_prompt()` 把工具描述注入系统提示词,工具调用格式 `[TOOL_CALL:{tool_name}:{parameters}]`,`_run_with_tools()` 多轮迭代(`max_tool_iterations` 默认 3),正则解析工具调用、执行、把结果回灌再让 LLM 续答。还含 `stream_run()` 流式响应、`add_tool/list_tools` 等便利方法。
- **ReActAgent**(p194-196):保留 ch04 核心逻辑,改进提示词模板(强调「每次只能执行一个步骤」,Action 格式 `tool_name[tool_input]` 或 `Finish[最终答案]`)。`run()` 循环:构建提示词→调 LLM→`_parse_output` 解析 Thought/Action→检查 Finish→否则 `tool_registry.execute_tool` 执行并把 Action/Observation 追加到 history。`max_steps` 防无限循环(默认 5)。
- **ReflectionAgent**(p196):通用化 DEFAULT_PROMPTS(initial/reflect/refine 三段),支持 `custom_prompts` 深度定制(如改成代码生成提示词)。反思阶段若「无需改进」则提前终止。
- **PlanAndSolveAgent**(p196-197):与 ch04 自由文本计划不同,**强制 Planner 以 Python 列表格式输出计划**,带完整异常处理。DEFAULT_PLANNER_PROMPT(分解为独立可执行子任务列表)+ DEFAULT_EXECUTOR_PROMPT(收到原始问题/完整计划/历史步骤,只解决「当前步骤」)。
- **FunctionCallAgent**(p197-198):**hello-agents 0.2.8 之后引入**,基于 OpenAI **原生 function calling** 机制(非 prompt 约束),鲁棒性更强。关键方法:`_build_tool_schemas`(由 description 构建 schema)、`_extract_message_content`、`_parse_function_call_arguments`(解析 JSON 参数)、`_convert_parameter_types`。内部对 OpenAI 原生 functioncall 再封装。

表 7.2 对比 Agent 不同章节实现(ch04 vs ch07,具体单元格未提取)。

## 7.5 工具系统

三大学习目标:统一工具抽象与管理、实战驱动的工具开发、高级整合与优化。

- **Tool 基类**(p199):`@abstractmethod run(parameters: Dict)->str` + `get_parameters()->List[ToolParameter]`。统一接口(字典入/字符串出)+ 自描述能力(内省支持自动文档与参数验证)+ 元数据(name/description 支持可发现性)。
- **ToolParameter**(p199):Pydantic 模型,字段 name/type/description/required/default,支持类型检查、默认值、文档自动生成。
- **ToolRegistry**(p199-200):工具管理中枢。两种注册方式:`register_tool`(Tool 对象,适合复杂工具)、`register_function`(函数直注,适合简单工具)。`get_tools_description()` 生成可直接拼进提示词的描述串;`to_openai_schema()` 生成 OpenAI function calling schema(供 FunctionCallAgent / 原生 SDK)。
- **自定义工具开发**(p201-202):以数学计算工具为例(用 `ast` 安全解析表达式,支持 +-*/ 和 sqrt/pi),最直接方式是 `register_function`。图 7.1 展示 SimpleAgent 运行工作流。
- **多源搜索工具**(p202-204):内置 SearchTool 整合 Tavily(AI 优化搜索)+ SerpApi(传统 Google),`backend="hybrid"` 智能选择。`_search_hybrid` 体现**高可用降级机制**:优先 Tavily,失败切 SerpApi,都不可用则提示配 API key。不同引擎结果统一格式化。类方式更适合需维护状态(API 客户端/配置)的工具。`pip install "hello-agents[search]==0.1.1"`。
- **高级特性**(p205-207):
  - **工具链 ToolChain/ToolChainManager**:多工具顺序执行,`add_step(tool_name, input_template, output_key)`,模板变量替换串联(借鉴 ch06 图概念)。示例:研究链 搜索→计算→总结。
  - **异步执行 AsyncToolExecutor**:用 `ThreadPoolExecutor`(默认 max_workers=4) + asyncio,`execute_tools_parallel` 并行执行多工具(`asyncio.gather`)。
  - 核心理念:单一职责、接口统一、异常处理与输入验证为基本要求、异步提并发、合理管理资源。

## 关键洞见

- 教学框架的价值不在功能多少,而在「能否快速上手又能深入理解」——可读性即第一性。
- 「万物皆为工具」是 HelloAgents 最大架构决策:把 Memory/RAG/RL/MCP 统一为 Tool,牺牲一些表达力换取认知简洁。后续 ch08-10 都建立在此之上(Memory/RAG 是工具、MCP 是新工具类型)。
- 基于 OpenAI 标准 API 构建而非自造抽象,是「务实」而非「优雅」的选择——降低迁移与学习成本。
- prompt 约束工具调用 vs 原生 function calling:后者(FunctionCallAgent)鲁棒性更强,代表框架从教学向生产演进。
- 本章是承上启下的「技术底座」:统一 LLM 接口 + 标准消息系统 + 工具注册机制,支撑 ch08 记忆/RAG、ch09 上下文工程、ch10 协议。
