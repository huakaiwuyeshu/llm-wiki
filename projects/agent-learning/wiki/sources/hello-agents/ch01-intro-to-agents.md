TL;DR: 智能体 = 能感知环境、自主决策并行动的实体;LLM 智能体以预训练模型为推理引擎,通过 Thought-Action-Observation 循环把模糊自然语言目标转化为可执行步骤,与 Workflow 的本质区别是自主性。

# 第一章 初识智能体 (p10-28)

## 1.1 智能体定义与传统演进 (p10-12)

**定义**:智能体是任何能通过传感器 (Sensors) 感知环境 (Environment),并自主地通过执行器 (Actuators) 采取行动 (Action) 以达成特定目标的实体。四要素:环境、传感器、执行器、自主性 (Autonomy)。自主性是关键——不是被动响应刺激或执行预设指令,而是基于感知和内部状态独立决策。

**传统智能体演进阶梯**(源自 Russell & Norvig《AI: A Modern Approach》):
1. **Simple Reflex Agent(简单反射)**:条件-动作规则(如恒温器),无记忆无预测
2. **Model-Based Reflex Agent(基于模型)**:维护内部世界模型 (World Model),追踪不可直接感知的状态(如自动驾驶推断被遮挡车辆)
3. **Goal-Based Agent(基于目标)**:主动规划达成目标(如 GPS 导航 + A* 搜索)
4. **Utility-Based Agent(基于效用)**:多目标权衡,最大化期望效用
5. **Learning Agent(学习型)**:性能元件 + 学习元件,通过环境互动自我改进;RL 是代表路径,AlphaGo Zero 是里程碑

## 1.1.2 LLM 驱动的新范式 (p12-13)

表 1.1 传统智能体 vs LLM 智能体核心对比:
| 维度 | 传统智能体 | LLM 驱动智能体 |
|---|---|---|
| 核心引擎 | 显式编程的逻辑系统 | 预训练模型的推理引擎 |
| 知识来源 | 工程师预定义规则/算法/知识库 | 海量非结构化数据间接学习、内化 |
| 处理指令 | 结构化、精确的命令 | 高层级、模糊的自然语言 |
| 工作模式 | 确定性、可预测 | 概率性、生成式 |
| 泛化/适应性 | 弱,局限于预设框架 | 强,涌现能力 |
| 开发范式 | 规则设计、算法编程、知识工程 | 模型训练、提示工程、微调 |

LLM 智能体三大工作特征(以旅行助手为例):规划与推理(目标分解为子任务链)、tool use(识别信息缺口主动调工具)、动态修正(把用户反馈当新约束)。

## 1.1.3 智能体分类三维度 (p13-15)

1. **按内部决策架构**:反应式 → 模型式 → 目标 → 效用(学习能力是可叠加的元能力)
2. **按时间/反应性**:Reactive(快、易局部最优)vs Deliberative(规划式,质量高但慢)vs Hybrid(分层:底层快速反应 + 高层审慎规划)。LLM 智能体是灵活混合体:Reasoning 阶段是审议,Acting & Observing 是反应,把宏大任务拆为"规划-反应"微循环(图 1.3:决策时间 vs 决策质量曲线)
3. **按知识表示**:Symbolic AI(透明可解释、脆弱、知识获取瓶颈)vs Sub-symbolic AI(联结主义,模式识别强但黑箱)vs Neuro-Symbolic AI(混合)。卡尼曼双系统理论类比(注:原书此处系统1/系统2的快慢标注与通行说法相反 (?))。LLM 智能体是神经符号主义的实践范例:内核是神经网络,工作时生成结构化的符号中间步骤(思想、计划、API 调用)

## 1.2 构成与运行原理 (p15-17)

**PEAS 模型**描述任务环境:Performance(性能度量)、Environment、Actuators、Sensors。表 1.2 给出旅行助手 PEAS 实例。

LLM 智能体环境特性:**部分可观察**(需要记忆+探索)、**随机性**(同样调用结果不同,需监控变化)、**多智能体**(其他行动者改变环境)、**序贯且动态**。

**Agent Loop(智能体循环)**(图 1.5):Perception(感知,获得 Observation)→ Thought(思考 = Planning + Tool Selection)→ Action(执行器调用工具)→ 环境 State Change → 新 Observation,闭环迭代。

**交互协议 (Interaction Protocol)**:结构化输出 = Thought(内部决策快照,自然语言)+ Action(函数调用形式,如 `get_weather("北京")`);外部 Parser 解析 Action 并执行;感知系统把原始结果(JSON)封装成简洁自然语言 Observation 反馈给模型。

## 1.3 动手实现第一个智能体 (p17-23)

5 分钟旅行助手,纯 prompt 工程 + 主循环,不依赖任何框架:
- **System prompt 指令模板**:声明角色、可用工具签名(`get_weather(city)`、`get_attraction(city, weather)`)、强制输出格式(每次只输出一对 Thought-Action;`Action: Finish[最终答案]` 结束)
- **工具**:wttr.in 免费天气 API;Tavily Search API(`include_answer=True` 返回综合答案);工具函数放入 `available_tools` dict
- **OpenAICompatibleClient**:任何兼容 OpenAI 接口的服务(OpenAI/Azure/Ollama/vLLM)只需 API_KEY、BASE_URL、MODEL_ID
- **主循环**(最大 5 轮):拼接 prompt_history → LLM 生成 → 正则截断多余的 Thought-Action 对 → 解析 Action → 执行工具或 Finish → 把 Observation 追加进 history
- 案例运行 3 轮完成:查天气(晴 26°C)→ 查景点(颐和园/长城)→ Finish 综合回答

演示了四项基本能力:任务分解、工具调用、上下文理解、结果合成。这正是 LangChain/LlamaIndex 等框架的设计精髓("工具 + 提示工程")。

## 1.4 协作模式与 Workflow vs Agent (p23-26)

两种应用模式:
1. **作为开发者工具**:GitHub Copilot(GitHub+OpenAI,补全+Chat)、Claude Code(Anthropic,终端,支持 headless 模式用于 CI/pre-commit hooks)、Trae(轻量代码生成优化)、Cursor(AI 原生编辑器,强调全代码库上下文理解)
2. **作为自主协作者**:从"命令-执行"到"目标-委托"。三种架构范式:
   - 单智能体自主循环(AgentGPT 式,思考-规划-执行-反思闭环;早期 BabyAGI、AutoGPT)
   - 多智能体协作:角色扮演式对话(CAMEL)、组织化工作流(MetaGPT、CrewAI,模拟虚拟团队/SOP)、灵活对话流(AutoGen、AgentScope)
   - 高级控制流架构(LangGraph,执行过程建模为 State Graph,支持循环/分支/回溯/人工介入)

**Workflow vs Agent**(图 1.6):Workflow 是预先定义的结构化编排(静态流程图,如费用报销审批),Agent 是 LLM 为"大脑"的目标导向自主系统(动态调用 Tool/Memory)。金句:"Workflow 是让 AI 按部就班地执行指令,而 Agent 则是赋予 AI 自由度去自主达成目标。" Agent 的核心价值 = 基于实时信息进行动态推理和决策(没有写死的 if-then 规则)。

## 金句/洞见
- "核心不再是编写代码,而是引导一个通用的'大脑'去规划、行动和学习。"
- LLM 智能体实现了感知与认知、直觉与理性的初步融合(神经符号视角)。
