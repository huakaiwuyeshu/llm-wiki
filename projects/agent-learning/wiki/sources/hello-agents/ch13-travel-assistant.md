> TL;DR：第十三章是首个完整实战项目——智能旅行助手。前后端分离(Vue3+TS / FastAPI / HelloAgents 多智能体 / 外部 API),用 Pydantic 做数据契约,4 个专职 Agent(景点/天气/酒店/规划)顺序协作,通过 MCP(高德地图,16 工具,共享实例)取数据,实现行程规划+地图可视化+预算计算+行程编辑+导出 PDF/图片。

来源:《Hello-Agents》第十三章「智能旅行助手」,PDF p495-531(章首 p495)。ingest 日期 2026-06-10。
本章起进入「第四部分:实战项目」,把前面所学(范式/工具/记忆/协议/评估)融会贯通成可运行应用。

## 项目概述与架构(13.1, p495-498)

核心功能:智能行程规划、地图可视化(标景点/画路线)、预算计算(门票/酒店/餐饮/交通)、行程编辑(增删调景点实时更新)、导出 PDF/图片。

**四层架构**(图 13.1):
1. 前端层(Vue3+TypeScript):表单、结果展示、地图可视化。
2. 后端层(FastAPI):API 路由、数据验证、业务逻辑。
3. 智能体层(HelloAgents):任务分解、工具调用、结果整合,含 4 个 Agent。
4. 外部服务层:高德地图 API、Unsplash API、LLM API。

数据流:前端表单→后端验证→智能体系统→4 Agent 依次调景点搜索/天气/酒店/规划→各 Agent 经 MCP 调外部 API→整合返回前端渲染。

环境:Python 3.10+、Node 16+、npm 8+。需 LLM API + 高德地图 Web 服务 Key + Unsplash Access Key。后端 `uvicorn app.api.main:app --reload`(:8000/docs),前端 `npm run dev`(:5173)。

## 数据模型设计:Pydantic(13.2, p498-512)

**核心问题**:Web 应用数据多次转换(前端表单→HTTP→后端 Python→外部 API→后端→HTTP→前端 TS→页面),无统一格式则每步易错。外部 API 字段名不统一(lng/lon/longitude)。

从字典 → Pydantic 的三大动机:①字段名不统一 ②类型安全(`price="60"` 字符串不报错却在算预算时出错) ③维护性(加字段要改多处)。Pydantic 用类定义结构,自动验证/转换/序列化。

**自底向上设计**(13.2.4):`Location`(经纬度,`ge/le` 范围验证)→ `Attraction`/`Meal`/`Hotel`(嵌套 Location)→ `Budget`(费用汇总,无位置)→ `DayPlan`(单日,`List[Attraction]` + `default_factory=list`)→ 顶层 `TripPlan`。
- `Field(..., description=)` 中 `...` 表必填;`Optional` 或默认值表可选。
- **自定义验证器** `@field_validator('day_temp', mode='before')`:把高德返回的 `"16°C"` 字符串转 int(去 °C/℃/°,容错返回 0)。

FastAPI 中 Pydantic 模型直接做请求/响应类型:`@app.post("/api/trip/plan", response_model=TripPlan)`,自动验证+序列化+生成 OpenAPI 文档,数据不合格自动返 400。前端定义对应 TypeScript `interface`,前后端统一数据格式(`?` 对应 `Optional`)。

## 多智能体协作设计(13.3, p512-517)

**为何不用单 Agent**:①SimpleAgent 每次 `run()` 只执行一个工具,多次调用要手动传中间结果,代码复杂。②ReactAgent 可一次多工具但每轮调 LLM,串行总时间长。③单 Agent 全任务提示词复杂、易出错、难调试。

**类比旅行社**:景点顾问 + 酒店顾问 + 行程规划师分工协作。设计 4 个专职 Agent:
- `AttractionSearchAgent`(景点搜索):输入城市+偏好,调 `amap_maps_text_search`,出景点列表。
- `WeatherQueryAgent`(天气查询):输入城市,调 `amap_maps_weather`。
- `HotelAgent`(酒店推荐):输入城市+住宿类型,调 `amap_maps_text_search`。
- `PlannerAgent`(行程规划):整合前三者输出 + 用户需求,生成完整 JSON 计划,**不调任何外部工具**,专注整合。

每个 Agent 提示词简洁,明确工具调用格式 `[TOOL_CALL:amap_maps_text_search:keywords=景点,city=北京]`,强调必须用工具不编造。PlannerAgent 提示词要求严格 JSON 输出(city/start_date/end_date/days/weather_info/overall_suggestions/budget),规划要求:温度纯数字、每天 2-3 景点、含三餐、含预算。

**协作流程**(`TripPlannerAgent.plan_trip`):5 步顺序——景点搜索→天气查询→酒店推荐→`_build_planner_query` 整合→`_parse_trip_plan` 解析 JSON。每步输出作下一步输入。

## MCP 工具集成(13.4, p517-526)

**为何不直接调 HTTP API**:①Agent 失去自主调用能力(变成普通函数调用) ②参数传递复杂(POI 搜索十几个参数) ③响应解析困难 ④工具管理混乱(十几个 API 各写函数)。

用 `amap-mcp-server`(Node.js 实现的 MCP server):
```python
mcp_tool = MCPTool(name="amap_mcp", command="npx",
    args=["-y", "@sugarforever/amap-mcp-server"],
    env={"AMAP_API_KEY": settings.amap_api_key}, auto_expand=True)
```
- MCP 用进程间通信(stdin/stdout JSON-RPC)而非 HTTP,更高效易管理。
- **`auto_expand=True` 是关键**:自动查询 server 提供的工具,为每个创建独立 Tool 对象——只创建一个 MCPTool,Agent 却获得 **16 个工具**(`amap_maps_text_search`/`amap_maps_weather`...)。
- 调用流程(图 13.8):Agent 生成 `[TOOL_CALL:...]` → 框架解析 → MCPTool 构造 JSON-RPC `tools/call` 经 stdin 发给 server → server 调高德 HTTP API → 结果经 stdout 返回。
- 注:文档示例用 `npx`,实际代码仓用 `uvx`(Python 生态,PyPI),两者理念一致按需选。

**共享 MCP 实例**(13.4.3):3 个 Agent 各建实例会有 3 个 server 进程,可能超 API 限速、耗资源。更好做法:在 `TripPlannerAgent.__init__` 建一个共享 `MCPTool`,`add_tool` 到每个子 Agent——只启一个 server 进程,统一控速。

**Unsplash 图片 API**(13.4.4):`UnsplashService` 封装,`search_photos`/`get_photo_url`。**不封装成 Tool**,直接在 API 路由中调用——图片搜索不需 Agent 智能决策,只是数据增强。注:Unsplash 是国外免费 API 结果可能不准,实际可换必应/百度/高德 POI 图(需付费)。

## 前端 + 功能实现(13.5-13.6, p526-540)

前端技术栈:Vue3 Composition API + TypeScript + Axios + Ant Design Vue + 高德地图 JS API。API 封装 `api.ts` 中 Axios 实例 `timeout: 120000`(2 分钟,因生成需 10-30 秒调多 Agent)。前端类型定义与后端 Pydantic 一一对应。

功能要点:
- **预算计算**:在后端 PlannerAgent 提示词中要求 LLM 估算(基于景点门票/酒店价/餐饮/交通),不在前端算(避免重复逻辑/不准)。前端 `a-statistic` 组件展示,`v-if="tripPlan.budget"` 容错。
- **加载进度条**:`setInterval` 每 500ms 模拟进度(无法知后端真实进度),让用户知系统在工作。
- **行程编辑**:`JSON.parse(JSON.stringify())` 深拷贝原始计划(对象是引用类型,直接赋值会联动)。移动景点用 ES6 解构交换 `[a,b]=[b,a]`,删除用 `splice`,保存后 `initMap()` 重绘地图。
- **导出 PDF/图片**:`html2canvas` + `jsPDF`。难点:地图是 Canvas,html2canvas 处理嵌套 Canvas 兼容性差 + 高德跨域限制。当前**简化方案**:导出时隐藏地图只导文字。替代方案:静态地图 API/分开导出/Puppeteer 服务端截图。
- **侧边导航**:`scrollIntoView({behavior:'smooth'})` 锚点跳转。

## 金句/洞见
- "系统设计思维:如何将复杂问题分解为多个简单任务"——多 Agent 分工的核心价值(p531)。
- PlannerAgent 不调工具、只做整合,体现「编排型 Agent」与「执行型 Agent」的职责分离。
- MCP `auto_expand` 一行配置换 16 个工具,展示协议化集成相对手写 Tool 的杠杆。

## 关联
- 多 Agent 顺序协作,与 [ch14](ch14-deep-research-agent.md) 深度研究助手的三 Agent 顺序协作是同一模式。
- MCP 集成承接 [ch10](ch10-agent-communication-protocols.md) 协议章;基于 SimpleAgent([ch07](ch07-build-your-framework.md))。
