TL;DR: 从 N-gram → 神经网络词嵌入 → RNN/LSTM → Transformer(自注意力)→ Decoder-Only 自回归 GPT 的演进链;与 LLM 交互靠提示工程(采样参数/few-shot/CoT)与分词(BPE);Scaling Laws 与 Chinchilla 解释能力来源,幻觉是核心局限。

# 第三章 大语言模型基础 (p50-75)

## 3.1 语言模型与 Transformer 架构 (p50-62)

### 3.1.1 从 N-gram 到 RNN
- **语言模型** = 计算词序列概率。链式法则 P(S)=∏P(wi|w1..wi-1) 不可直接算 → **马尔可夫假设**只看前 n-1 个词 → N-gram(Bigram/Trigram),用 MLE 计数估计 P(wi|wi-1)=Count(wi-1,wi)/Count(wi-1)。书中给了手算示例(迷你语料 "datawhale agent learns/works",P≈0.167)。
- N-gram 两大致命缺陷:数据稀疏性 (Sparsity)、泛化能力差(词是孤立离散符号,无法理解 agent≈robot)。
- **神经网络语言模型**(Bengio 2003):词嵌入 (Word Embedding) 构建连续语义空间 + 学习上下文→下一词映射。余弦相似度衡量语义;经典类比 King - Man + Woman ≈ Queen。仍是固定窗口。
- **RNN**:隐藏状态 (hidden state) 作短期记忆,逐步传递;问题 = 长期依赖问题(梯度消失/爆炸)。**LSTM**:细胞状态 (Cell State) + 门控机制(遗忘门/输入门/输出门)。RNN 必须串行计算 → 无法大规模并行训练。

### 3.1.2 Transformer(Vaswani 2017, "Attention is all you need")
- Encoder(理解整句,生成上下文化向量)-Decoder(参考已生成前文 + 咨询编码器,生成下一词)架构;本章用 PyTorch 自顶向下完整实现(EncoderLayer/DecoderLayer/MultiHeadAttention/FFN/PositionalEncoding)。
- **Self-Attention**:每个词元生成 Q(查询)、K(键/索引)、V(值/内容),由可学习矩阵 W^Q/W^K/W^V 投影;Attention(Q,K,V)=softmax(QK^T/√dk)V;除以 √dk 防梯度过小。
- **Multi-Head**:Q/K/V 在维度上切成 h 份独立计算再 concat+线性变换,让模型同时关注多种关系(指代/时态/从属)。
- **FFN(Position-wise)**:两层线性 + ReLU,FFN(x)=max(0, xW1+b1)W2+b2,通常 d_ff = 4×d_model,"先扩大再缩小";逐位置独立、权重共享。
- **Add & Norm**:残差连接解决梯度消失 Output=x+Sublayer(x);LayerNorm 解决内部协变量偏移。
- **Positional Encoding**:自注意力本身无顺序信息;用 sin/cos 固定公式 PE(pos,2i)=sin(pos/10000^(2i/d_model)) 注入绝对+相对位置。

### 3.1.3 Decoder-Only 架构
- GPT 的洞察:"语言的核心任务,就是预测下一个最有可能出现的词吗?" → 完全抛弃编码器,只留解码器。
- **自回归 (Autoregressive)**:文字接龙,逐词生成并拼回输入。
- **Masked Self-Attention**:Softmax 前把当前位置之后的分数置为 -∞,数学上禁止偷看未来。
- 优势:训练目标统一(预测下一词,适合海量无标注数据)、结构简单易于规模化(GPT-4、Llama 均如此)、天然适合生成任务。

## 3.2 与大语言模型交互 (p62-71)

### 3.2.1 提示工程
- **采样参数**:Temperature(softmax 加 T 系数;0-0.3 精确/事实/代码,0.3-0.7 平衡对话,0.7-2 创意发散);Top-k(只保留前 k 个候选再归一化,k=1 即贪心);Top-p(核采样,累积概率≥p 的最小集合,适应长尾分布)。协同顺序:温度调整 → Top-k → Top-p;T=0 时 Top-k/p 失效;Top-k=1 时温度失效。
- **Zero-shot / One-shot / Few-shot prompting**(情感分类示例)。
- **Instruction Tuning**:用"指令-回答"数据微调;GPT-3 是文本补全模型需 few-shot"教会",指令调优后(ChatGPT/DeepSeek/Qwen)可直接下指令。
- 基础技巧:Role-playing(角色扮演)、In-context Example(含 JSON 格式抽取示例)。
- **Chain-of-Thought (CoT)**:加"请一步步思考"/"Let's think step by step",显著提升逻辑/算术/常识推理;同时让回答可信、可检查。

### 3.2.2 分词 (Tokenization)
- Word-based(词表爆炸 + OOV + 无法捕捉 look/looks 关联)vs Character-based(无 OOV 但语义弱、效率低)→ **Subword Tokenization**。
- **BPE (Byte-Pair Encoding)**(GPT 系列):初始化为基本字符 → 迭代合并最高频相邻词元对 → 直到词表阈值。书中给出表 3.1 手算示例({hug,pug,pun,bun} → 词表 10)及 Python 实现;未见过的 "bug" 切为 ['b','ug']。
- **WordPiece**(BERT):合并标准是"最大化提升语料库语言模型概率"而非频率。**SentencePiece**(Llama):空格视为普通字符(_),完全可逆、语言无关(适合中文)。
- 对开发者的意义:上下文窗口按 Token 计;API 按 Token 计费;模型表现异常可能源于分词("2+2"无空格可能是单独 token;首字母大小写改变 token 序列)。

### 3.2.3 本地部署开源模型
Hugging Face Transformers:`AutoModelForCausalLM` + `AutoTokenizer`;示例用 Qwen/Qwen1.5-0.5B-Chat(阿里 0.5B 对话模型);流程 = apply_chat_template(add_generation_prompt=True)→ tokenize → model.generate(max_new_tokens=512) → 截掉输入部分 → batch_decode。

### 3.2.4 模型选型
关键考量:性能(LMSys Chatbot Arena 排行)、成本(API 按 token / 本地硬件)、速度延迟、上下文窗口(8K/128K)、部署方式(隐私 vs 便捷)、生态工具链、可微调性、安全伦理。
- 闭源:OpenAI GPT(GPT-3→RLHF→ChatGPT→GPT-4 多模态→GPT-5)、Google Gemini(原生多模态,Ultra/Pro/Nano,Gemini 2.5 Pro/Flash)、Anthropic Claude(安全为先,Claude 3 Opus/Sonnet/Haiku,Claude 4 Opus)、国产(文心 ERNIE、混元、盘古、星火、Kimi/Moonshot)
- 开源:Meta Llama(Llama 4,2025-04,首个 MoE:Scout 支持 1000 万 token 上下文,Maverick 多模态,Behemoth 最强 STEM)、Mistral(Mistral Medium 3.1,2025-08,基准优于 Claude Sonnet 3.7 与 Llama 4 Maverick (?原书说法),内置"语调适配层")、国内 Qwen 系列、ChatGLM。

## 3.3 缩放法则与局限性 (p71-73)

- **Scaling Laws**(Kaplan et al. 2020):性能(Loss)与参数量、数据量、计算量在 log-log 坐标下呈平滑幂律,无明显瓶颈。
- **Chinchilla 定律**(DeepMind 2022, Hoffmann et al.):给定计算预算下参数与数据存在最优配比;最优模型应比以前认为的更小、用更多数据。700 亿参数 Chinchilla 用比 GPT-3(1750 亿)多 4 倍数据训练,性能反超。纠正"越大越好",指导了 Llama 系列。
- **能力涌现**:规模过阈值后突现 CoT、Instruction Following、多步推理、代码生成——对智能体开发者:选择足够大规模的模型是实现复杂自主决策的前提。
- **幻觉 (Hallucination)** 分类(Ji et al. 2023):Factual(与事实不符)/ Faithfulness(摘要翻译不忠实于源文)/ Intrinsic(与输入直接矛盾)。成因:训练数据错误、自回归机制只预测最可能词无事实核查模块、复杂推理链出错。缓解三层面:数据层(清洗、事实知识、RLHF)、模型层(表达不确定性)、推理生成层(**RAG**、多步推理与验证、外部工具:搜索/计算器/代码解释器)。
- 还有知识时效性截止、训练数据偏见 (Stochastic Parrots, Bender et al. 2021) 问题。

## 金句/洞见
- "选择语言模型并非简单地追求'最大、最强',而是性能、成本、速度和部署方式之间权衡的决策过程。"
- 幻觉短期内难以完全消除,RAG + 工具调用是工程上最有效的缓解路径。
