TL;DR: 智能体发展史是"问题驱动"的范式迭代:符号主义(规则+推理)→ 明斯基心智社会(分布式协作)→ 学习范式(联结主义+RL)→ 预训练 LLM 智能体,每一代都为解决上一代的核心痛点而生并埋下新局限。

# 第二章 智能体发展史 (p29-49)

核心框架(图 2.1 演进阶梯):符号主义(物理符号系统+规则推理 → 知识瓶颈+脆弱)→ 心智社会(简单智能体协作+涌现 → 缺实现路径)→ 学习范式(神经网络+RL → 依赖海量数据+特定语料)→ LLM 智能体(LLM 为核+工具调用闭环 → 幻觉+工具依赖)。

## 2.1 符号主义早期智能体 (p29-33)

- **物理符号系统假说 (PSSH)**:Newell & Simon, 1976。两个论断:充分性(任何物理符号系统都具备产生通用智能行为的充分手段)+ 必要性(任何展现通用智能的系统本质必是物理符号系统)。即"智能的本质就是符号的计算与处理"。
- **专家系统 (Expert System)**:知识库(Production Rules,IF-THEN)+ 推理机(Inference Engine:Forward Chaining 数据驱动 / Backward Chaining 目标驱动)+ 工作记忆 + 用户界面。知识与推理分离是符号主义重要特征。
- **MYCIN**(斯坦福,1970s):细菌血液感染诊断,约 600 条 IF-THEN 规则,反向链推理;创新点是置信因子 (Certainty Factor, CF, -1~1) 处理不确定性;评估中表现超过非专业医生、达到人类专家水平。
- **SHRDLU**(Terry Winograd, 1968-1970):积木世界综合智能体,首次将语言解析、规划、记忆多模块集成于统一系统;能做指代消解、上下文记忆、动作规划、回答行为动机("BECAUSE YOU ASKED ME TO")。奠定"感知-思考-行动"闭环;也引发"符号处理 vs 真正理解"的长期思辨。
- **符号主义根本挑战**:① 知识获取瓶颈 (Knowledge Acquisition Bottleneck) + 常识问题(Cyc 项目数十年成果有限);② Frame Problem(动作后判断哪些事物未变是逻辑难题)+ 系统脆弱性 (Brittleness)。

## 2.2 ELIZA:规则聊天机器人实践 (p33-37)

Joseph Weizenbaum, MIT, 1966;DOCTOR 脚本模仿罗杰斯学派心理治疗师。算法 = 模式匹配 + 文本替换四步:关键词识别与优先级排序 → 分解规则(通配符捕获)→ 重组规则(随机模板)→ 代词转换(I→you)。本章用 ~60 行 Python(正则 rules dict + pronoun_swap)复现。

根本局限(印证符号主义理论挑战):缺乏语义理解(无法理解"not")、无上下文记忆(Stateless)、规则组合爆炸难维护。但产生了著名的 **ELIZA 效应**——用户对其产生情感依赖,源于巧妙对话策略(被动提问者+开放模板)与人类情感投射心理。

## 2.3 明斯基心智社会 (p37-40)

Marvin Minsky《The Society of Mind》(1986):"The trick is that there is no trick. The power of intelligence stems from our vast diversity, not from any single, perfect principle."

- 反思单一整体智能模型(自上而下、中央处理器式)的弊端
- **智能体 = 极简单、专门化、本身'无心'的心智过程**(如 LINE-FINDER、GRASP);组合成**机构 (Agency)**;**涌现 (Emergence)** 是关键:复杂有目的的智能行为从大量简单底层智能体的局部交互中自发产生。例:BUILD-TOWER → BUILDER(循环逻辑)→ ADD-BLOCK → FIND/GET/PUT → SEE/REACH/GRASP,没有任何一个节点拥有全局规划(图 2.6)。
- 对 MAS 的理论启发:去中心化控制、涌现式计算(蚁群/粒子群算法)、智能体的社会性(通信语言 ACL、契约网协议、协商策略、信任模型)→ 开启分布式人工智能 (DAI) 与多智能体系统研究。

## 2.4 学习范式演进 (p40-46)

- **2.4.1 联结主义 (Connectionism)**(1980s 再兴,Rumelhart & McClelland PDP):知识分布式存储于连接权重;简单处理单元;通过学习(反向传播)调整权重。解决感知问题。
- **2.4.2 强化学习**:解决序贯决策。五要素:Agent、Environment、State、Action、Reward;Policy π = 状态→行动映射;目标是最大化 Cumulative Reward (Return) 而非即时奖励(围棋"弃子"= 牺牲即时奖励)。AlphaGo 自我对弈是经典体现。
- **2.4.3 预训练**:Pre-training + Fine-tuning 范式取代单任务从零训练。预训练 = 互联网级语料上自监督学习("预测下一个词");微调 = 少量标注数据适配下游任务。LLM 以高度压缩的隐式模型解决了符号主义最棘手的"知识获取瓶颈"。规模跨越阈值后出现**涌现能力 (Emergent Abilities)**:In-context Learning(few-shot/zero-shot 无需调权重)、Chain-of-Thought 推理。LLM = 海量知识库 + 通用推理引擎双重角色。
- **2.4.4 LLM 智能体架构**(图 2.10):Perception Module(传感器+感知记忆)→ Planning Module(Reflection、Self-critics、CoT、ToT、GoT)+ LLM 中枢 + Memory(短期=context,长期=DB)→ Execution Module → Tool Use(信息检索/代码执行/外部 API/文件操作)→ Tool Result + 环境状态变化 → 新 Observation + Memory Update。

## 2.4.5 三大思潮与时间线 (p44-46)

- **符号主义**(Simon、Minsky):Logic Theorist (1956)、GPS (1959, Means-Ends Analysis)、Shakey (1966-1972)、专家系统 MYCIN/XCON、深蓝 (1997)
- **联结主义**(Hinton):反向传播、LeNet-5 (1998)、AlexNet (2012)、Transformer (2017)
- **行为主义/RL**:TD-Gammon (1992)、Q-Learning、DQN (2013)、AlphaGo (2016)
- 大模型时代 (2020-2022):GPT-3 (2020)、CoT (2022);智能体时代 (2023至今):ReAct、AutoGPT/BabyAGI (2023)、AutoGen (2023)、Voyager (2023)、ChatGPT Agent (2025)、Google Big Sleep (2024-2025, 智能体安全)
- 图 2.12:Letta 公司 2024 年 11 月发布的 AI Agents Stack:Vertical Agents(Decagon/Sierra/Replit/Perplexity/Harvey/Cognition 等)、Hosting & Serving(Letta/LangGraph/Assistants API/Bedrock)、Observability(LangSmith/Arize/Langfuse/Braintrust)、Frameworks(LangGraph/AutoGen/LlamaIndex/CrewAI/DSPy/Semantic Kernel)、Memory(MemGPT/zep/LangMem/mem0)、Tool Libraries(Composio/Browserbase/Exa)、Sandboxes(E2B/Modal)、Model Serving(vLLM/Ollama/SGLang/together/groq)、Storage(Chroma/Qdrant/Milvus/Pinecone/Weaviate/Neon/Supabase)

## 金句/洞见
- "每一个新范式的出现,都是为了解决上一代范式的核心'痛点'或根本局限。"
- GPT 本身是联结主义产物,却成为执行符号推理、工具调用和规划决策的"大脑"——神经-符号结合的现代智能体架构。
- 智能体发展不是技术迭代,而是关于如何定义"智能"、获取"知识"、进行"决策"的思想革命。

参考文献亮点:Newell & Simon 1976 (CACM)、MYCIN (Buchanan & Shortliffe 1984)、Winograd 1972、Cyc (Lenat 1990)、Frame Problem (McCarthy & Hayes 1969)、ELIZA (Weizenbaum 1966, CACM)、Society of Mind (Minsky 1986)、PDP (Rumelhart 1986)、AlphaGo (Silver et al. Nature 2016)。
