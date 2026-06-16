> TL;DR：第十五章把智能体与游戏引擎结合,构建「赛博小镇」AI 小镇——Godot 4.5 前端 + FastAPI 后端 + HelloAgents 智能体。每个 NPC 是带记忆(短期 WorkingMemory + 长期 EpisodicMemory)的 SimpleAgent,有五级好感度系统(LLM 情感分析驱动),用「批量生成背景对话+即时响应」混合模式降本,HTTP REST 通信。

来源:《Hello-Agents》第十五章「构建赛博小镇」,PDF p574-614(章首 p574)。ingest 日期 2026-06-10。
灵感:《模拟人生》《动物森友会》的 NPC,但 NPC 有真正的"智能"——理解对话、记住互动、按好感度反应。

## 项目概述与架构(15.1, p574-583)

核心功能:智能 NPC 对话(自然语言)、记忆系统(短期+长期)、好感度系统(陌生→挚友)、游戏化交互(2D 像素办公室自由移动按 E 交互)、实时日志。

**四层架构**(图 15.1):
- 前端层:**Godot 4.5** 游戏引擎(开源 2D/3D,渲染/玩家控制/NPC 显示/对话 UI)。
- 后端层:FastAPI(API 路由/NPC 状态管理/对话处理/日志)。
- 智能体层:HelloAgents,每个 NPC 是独立 `SimpleAgent` 实例,有独立记忆和状态。
- 外部服务层:LLM API + **Qdrant 向量数据库** + **SQLite 关系数据库**。

数据流(图 15.2):玩家按 E→Godot HTTP 发对话请求→FastAPI 调 SimpleAgent→Agent 从记忆检索历史→调 LLM 生成回复→更新状态+好感度→记日志→返回 Godot 显示。

环境:Godot 4.2+、Python 3.10+、LLM API Key。后端 `python main.py`(:8000),Godot 导入 `main.tscn` 按 F5 运行。三个 NPC:张三(Python 工程师)、李四(产品经理)、王五(UI 设计师)。好感度变化记 `backend/logs/dialogue_YYYY-MM-DD.log`(前端无显示)。

## NPC 智能体系统(15.2, p577-583)

**基于 SimpleAgent**:每个 NPC 是一个 `SimpleAgent` 实例,配独特系统提示词(身份+性格)。`create_npc_agent(npc_id, name, role, personality)` 构建提示词 + 创建 `MemoryManager`:
- `WorkingMemory(capacity=10, ttl_minutes=120)`:短期记忆,10 条消息/120 分钟,保持对话连贯(理解上下文,如"它"指什么)。
- `EpisodicMemory(db_path=..., collection_name=...)`:长期记忆,SQLite + Qdrant 向量库,语义检索历史对话(如"还记得上次讨论的项目吗")。

**NPC 角色设定**(15.2.2):
- 张三(zhang_san):Python 工程师,严谨专业、说话直接、注重代码质量。
- 李四(li_si):产品经理,外向善沟通、从用户角度思考、爱问"为什么"。
- 王五(wang_wu):UI 设计师,温和有创意、审美独特、注重视觉。

记忆处理流程(15.2.3):短期取最近 5 条 → 长期 `search(query, top_k=3)` 检索相关 → 构建 context → `agent.run(message, context)` → `add_interaction` 存回。

**批量对话生成:轻负载模式**(15.2.4, p580-583,关键设计):
- 问题:多玩家同时对话→后端并发多 LLM 请求→成本高+可能超限。
- 方案:`NPCBatchGenerator` 把多 NPC 对话**合并为一次 LLM 调用**(类比"预制菜"),要求 LLM 一次性生成所有 NPC 回复并以 JSON 返回 `{"张三":"...","李四":"...","王五":"..."}`。**成本降到 1/3**,延迟大减。额外好处:同上下文生成,NPC 间有关联性。
- **混合模式(批量+即时)**:后台定时(每 5 分钟 `asyncio.sleep(300)`)批量生成"背景对话"缓存(玩家靠近未交互时显示"正在调试代码...");玩家按 E 发起交互时切**即时响应**——调该 NPC 专属 Agent 用具体消息+记忆+好感度生成个性化回复。优势:背景对话省成本、玩家交互保质量。

## 好感度系统(15.3, p583-587)

**五级划分**(图 15.8):陌生(0-20,礼貌疏远回复简短) → 熟悉(21-40,自然友好) → 友好(41-60,详细主动问) → 亲密(61-80,热情给建议) → 挚友(81-100,亲切分享内心)。

**计算逻辑**(15.3.2):用 LLM 分析对话情感判断态度,而非固定加分(避免机械)。`RelationshipManager.analyze_sentiment`:友好(+5,礼貌/感谢/赞同)/中立(+2,普通询问)/不友好(-3,粗鲁/批评),返回值限 -3~+5。`update_affinity`:分数 `max(0, min(100, current+change))`,据分数定等级,记互动次数。

**好感度影响对话**(15.3.3):动态修改 NPC 系统提示词——按等级注入不同 `affinity_prompts`(陌生"保持礼貌不过热回复简短"→挚友"无话不谈回复亲切真诚"),让 NPC 行为随关系变化增强沉浸感。

## 后端服务实现(15.4, p587-592)

- **FastAPI 结构**(15.4.1):`main.py` 入口,CORS 中间件(`allow_origins=["*"]`,生产应限域名),初始化 `NPCAgentManager`/`RelationshipManager`/`StateManager`/`DialogueLogger`,`startup_event` 初始化 NPC。
- **API 路由**(15.4.2):`GET /npcs/status`(所有 NPC 状态)、`GET /npcs/{id}/status`、`POST /dialogue`(核心,9 步:验证存在→检查忙碌→标记忙碌→取好感度→调 Agent 生成→更新好感度→记日志→返回→finally 释放忙碌)、`GET /affinity/{npc_id}/{player_name}`。
- **状态管理**(15.4.3):`StateManager` 跟踪每 NPC 位置/is_busy/current_action,**防并发**(避免一 NPC 同时对多玩家,返 409)。`set_npc_busy` 加锁。
- **日志系统**:`DialogueLogger` 双输出(控制台 StreamHandler + 文件 FileHandler,按日期 `dialogue_YYYY-MM-DD.log`),记 NPC/玩家/消息/回复/好感度/互动次数。

## Godot 场景系统(15.4.4-15.5, p592-597)

**核心概念**:节点(Node,基本构建块,类比乐高,Sprite2D/AudioStreamPlayer/CharacterBody2D 等上百种)+ 场景(Scene,节点集合存 `.tscn`,类比"预制件",可复用/嵌套/实例化)。父子节点树状结构,移动/隐藏父节点联动子节点。

**为何选 Godot 4.5**:①2D 引擎成熟(TileMap/AnimatedSprite2D/CharacterBody2D),开发效率高于 Unity ②完全开源免费(MIT,无版权费/分成;对比 Unity 2024 运行时费政策争议) ③学习成本低(GDScript 类似 Python,Python 用户几小时上手) ④与 Python 后端集成简单(内置 HTTPRequest 节点)。局限:3D 能力不如 Unreal/Unity。

四核心场景:Main(主)、Player(玩家)、NPC(通用模板,三 NPC 都是其实例,改一次影响全部)、DialogueUI(CanvasLayer)。场景间用信号通信,低耦合。

**玩家控制**(15.5.2,`player.gd`):`CharacterBody2D` 根节点。WASD 移动(`Input.get_vector`+`move_and_slide`)、4 方向动画(walk_up/down/left/right)、按 E 交互(`call_group("dialogue_system","start_dialogue")`)、走路音效、交互时禁移动(`set_interacting`)。`add_to_group("player")` 供 NPC 识别。

**NPC 行为**(15.5.3,`npc.gd`):随机巡逻(出生点 `wander_range` 内,每 `wander_interval_min~max` 秒选新目标)、`InteractionArea`(Area2D)检测玩家进入交互范围(`body_entered`→`set_nearby_npc(self)`)、对话气泡(`update_dialogue` 显示 10 秒)、交互时停移动。

## 前后端通信(15.6, p597-614)

- **API 客户端**(`api_client.gd`,15.6.1):设为 AutoLoad 单例。用 `HTTPRequest` 异步节点(不阻塞游戏),**信号机制**通知响应(非 await,允许多脚本监听同一响应)。三功能:`send_chat`(对话)/`get_npc_status`/`get_npc_list`,各独立 HTTPRequest 节点。信号 `chat_response_received`/`npc_status_received` 等。
- **对话 UI**(`dialogue_ui.gd`,15.6.2):CanvasLayer(始终最上层)。`RichTextLabel.append_text` 显示对话(支持颜色富文本),等待响应时禁输入防重发,显示时通知玩家禁移动。
- **主场景整合**(`main.gd`,15.6.3):连接 `npc_status_received` 信号,`_process` 每 `NPC_STATUS_UPDATE_INTERVAL`(默认 30 秒)调 `get_npc_status`,更新各 NPC 对话气泡——即使玩家不交互也能看 NPC 间自主对话。

## 扩展方向 + 思考(15.7, p607-614)
扩展:多人在线(WebSocket)、任务系统(好感度解锁)、NPC 间互动、情感系统、动态事件、更大世界、个性化学习。
**AI NPC 挑战**:成本(每次对话调 LLM)、延迟(推理需时间)、内容控制(LLM 输出不完全可控,需提示词+过滤)。未来:推理更快更便宜、本地小型 LLM 在玩家设备直接运行无需网络。

## 金句/洞见
- 批量生成混合模式:背景对话用批量(省成本)、玩家交互用即时(保质量)——"正常情况下玩家感受不到差异,但后端成本性能显著优化"(p583)。这是高并发 AI 应用的通用降本思路。
- 好感度用 LLM 情感分析而非固定加分,让关系演化自然——"玩家不需要刻意讨好 NPC,只需正常交流"。
- 用动态系统提示词让好感度真正影响行为,而非只是个数字。

## 关联
- 每个 NPC = 带记忆的 SimpleAgent,记忆系统(WorkingMemory/EpisodicMemory)承接 ch09;SimpleAgent 见 [ch07](ch07-build-your-framework.md)。
- 与 [ch13](ch13-travel-assistant.md)/[ch14](ch14-deep-research-agent.md) 同为实战项目,但首次引入游戏引擎前端 + 向量库长期记忆 + 好感度状态机。
