# Agentic RL(智能体强化学习)

> TL;DR:Agentic RL 把 LLM 当作**可学习的策略**,嵌入"感知-决策-执行"循环,通过 RL 优化**多步任务**的长期累积奖励——这是与传统单步后训练(PBRFT)的根本分野。实战路径:在 LLM 训练全景(预训练→SFT→RM→PPO/RLHF→RLAIF)之上,用 GSM8K 数据 + 三种奖励函数,经 SFT 再 GRPO(去 Value Model、组内相对奖励)训练 Qwen3-0.6B 数学推理智能体,准确率从 SFT 后 40-50% 提升到 60-70%;LoRA 让消费级 GPU 也能训。来源:hello-agents ch11(p383-435)。

## 概念定义

**Agentic RL 核心思想**:将 LLM 作为可学习策略,嵌入智能体的"感知-决策-执行"循环,通过 RL 优化多步任务表现(来源:ch11-agentic-rl p383)。数学问题求解智能体的 RL 映射:智能体=LLM 推理系统,环境=数学问题+验证系统,状态=问题描述+已有推理步骤,行动=生成下一步推理或答案,奖励=答案正确(+1)/错误(0)。

提出动机——传统监督学习三大局限(p383):①数据质量完全决定训练质量,模型只能模仿难以超越;②缺乏探索能力,只能被动学习人类路径;③难以优化长期目标,无法精确优化多步推理的中间过程。

## 关键机制

### 一、PBRFT(单步)vs Agentic RL(多步)MDP 对比

区分两种范式(来源:ch11-agentic-rl p385-386,表11.1):
- **PBRFT**(Preference-Based RL Fine-Tuning,传统后训练):单步,模型生成一个回答按质量打分,适合对话助手。
- **Agentic RL**:LLM 视为可学习策略,嵌入顺序决策循环,在动态环境中多步交互、获中间反馈、优化长期累积奖励。

MDP 五元组 (S, A, P, R, γ) 下对比:

| 维度 | PBRFT | Agentic RL |
|------|-------|-----------|
| 状态 | S_0=prompt,T=1,不变 | s_t=(prompt,o_1,...,o_t),T≫1,随行动演化 |
| 行动 | 只有文本生成 a=y~π(y\|s_0) | a_t∈{a_text, a_tool},含工具调用/环境操作 |
| 转移 | 无状态转移 | s_{t+1}~P(s_{t+1}\|s_t,a_t),动态变化 |
| 奖励 | 单步 R=r(s_0,y),仅结束时 | 多步 r(s_t,a_t),可中间给部分奖励 |

目标函数:PBRFT `J=E[r(s_0,y)]`(单步期望);Agentic RL `J=E_τ[Σγ^t r(s_t,a_t)]`(累积折扣奖励,τ=完整轨迹)。例:"分析 GitHub 仓库代码质量"→调 API 获仓库信息(+0.1)→读代码文件(+0.1)→分析质量(+0.2)→生成报告(+0.6),总奖励累积=1.0。洞见:这是思维方式根本转变——从"生成更好单个回答"到"完成复杂任务",从对话助手进化为自主智能体。

**六大核心能力**(p386-387):推理(Reasoning)、工具使用(Tool Use)、记忆(Memory)、规划(Planning)、自我改进(Self-Improvement)、感知(Perception)。

### 二、LLM 训练全景图

LLM 从"语言模型"到"对话助手"分**预训练 + 后训练**两阶段(来源:ch11-agentic-rl p384-385,图11.1):
- **预训练**:海量文本(数 TB),自监督因果语言建模(Next Token Prediction)。`L_pretrain = -Σ log P(x_t | x_1..x_{t-1}; θ)`。
- **后训练三步**:
  1. **SFT(监督微调)**:学指令遵循和对话格式,数据是 (prompt, completion) 对。`L_SFT = -Σ log P(y_i | c_i; θ)`。数据量小、需人工标注、快速见效。
  2. **RM(奖励建模)**:用偏好对比数据(同一问题的 chosen/rejected 两回答)学人类偏好。`L_RM = -E[log σ(r_Φ(x,y_w) - r_Φ(x,y_l))]`。
  3. **RL 微调**:最经典 **PPO**,`J_PPO = E[r(x,y)] - β·D_KL(π_θ || π_ref)`,最大化奖励同时不偏离原模型太远。
- **RLHF → RLAIF**(p385):RLHF 需大量人工标注偏好(成本高昂);RLAIF 用强 AI 模型(如 GPT-4)替代人类标注员,效果接近甚至超过 RLHF,成本大幅降低。

本章小结(p433):预训练(用现成模型)→ SFT(学格式和基础推理)→ RL(试错优化超越数据质量)。**没有 SFT 的基础,RL 很难成功;没有 RL 的优化,模型只能模仿训练数据。** SFT 是桥梁:预训练模型输出冗长无结构,无法提取答案/评估/给奖励;SFT 后输出结构清晰("Step 1/Step 2/Final Answer"),可用于 RL(p401)。

### 三、GRPO:去 Value Model,组内相对奖励

**PPO 在 LLM 训练的问题**(来源:ch11-agentic-rl p406-407,表11.6):需训 Value Model(增复杂度和显存)、需同时维护四个模型(Policy/Reference/Value/Reward)、训练不稳定易奖励崩塌。

**GRPO**(Group Relative Policy Optimization,DeepSeekMath)= 专为 LLM 设计的 PPO 简化版。核心:**不需要 Value Model,用组内相对奖励代替绝对奖励(优势函数)**;只需 Policy + Reference 两模型;提稳定性减奖励崩塌。
- PPO 目标:`J_PPO = E[min(ratio·A, clip(ratio,1-ε,1+ε)·A)]`,优势 `A(s,a)=Q-V`(需 Value Model)。
- GRPO 目标:`J_GRPO = E[(r(s,a) - r_group) - β·D_KL(π_θ||π_ref)]`,用 `r(s,a)-r_group`(组内平均奖励)替代 A,不需 Value Model,减方差。

训练循环 5 步(p409-410):①采样(每问题生成 num_generations 个答案构成"组")→②奖励计算→③相对奖励(组内减方差)→④策略更新(+KL 惩罚防偏离)→⑤重复。具体例(q="48+24?",4 答案):奖励 [1.0,1.0,0.0,0.8],组内均值 0.7,相对奖励 [+0.3,+0.3,-0.7,+0.1]——鼓励生成"比平均更好"的答案而非追求绝对高奖励。KL 散度惩罚 `D_KL` 逐 token 计算求和,防遗忘 SFT 知识;`kl_coef` 选择:0.01 太小偏离 / 0.5 太大学慢 / **0.05-0.1 平衡**。GRPO 的 `batch_size` 必须能被 `num_generations`(典型 4-8,默认 8)整除。

**关键量化锚点:Qwen3-0.6B SFT 后 GSM8K 准确率 40-50% 正常,经 RL(GRPO)可提升到 60-70%**(p405-406)。技术栈:TRL(Hugging Face)+ Qwen3-0.6B(0.6B 参数适合普通 GPU)。

### 四、LoRA:参数高效微调

全量微调显存:Qwen3-0.6B 需 ~12GB(FP16)/24GB(FP32);7B/13B 几乎不可能在消费级 GPU(来源:ch11-agentic-rl p401-402)。

**LoRA**(Low-Rank Adaptation)核心:微调参数变化可用低秩矩阵表示。`W'=W+ΔW`,**`ΔW=BA`**(B∈R^{d×r}, A∈R^{r×k}, r≪min(d,k))。前向 `h=Wx+BAx`,W 冻结只训 B、A。
参数量:原 d×k vs LoRA r(d+k)。例 d=k=4096, r=8:原 16,777,216 vs LoRA 65,536,**减少 256 倍**。
关键超参:**rank r**(4-64,默认 8,越大表达力越强);**alpha α**(缩放因子,典型 = 2×rank,rank=8→alpha=16);**target_modules**(通常注意力层 q/k/v/o_proj)。优势:显存大降、训练快、防过拟合;缺点效果通常略差于全量。生产部署:`PeftModel...merge_and_unload()` 合并 LoRA 权重再 `save_pretrained`(p430)。

### 五、奖励函数设计与 reward hacking

好奖励函数(来源:ch11-agentic-rl p391-394):清楚定义成功、提供梯度信号、方差不过大、易调整组合。坏奖励:**稀疏**(只结束给)、**奖励欺骗(reward hacking)**、目标矛盾、方差过大不收敛。

三种内置奖励(可单用或组合):
1. **准确率奖励(AccuracyReward)**:`r_acc=1 if a=a* else 0`,二值。答案比较需处理数值精度(72.0≡72)、单位(1000≡1k)、格式。优点简单,缺点稀疏。
2. **长度惩罚(LengthPenaltyReward)**:`r_length = r_acc - α·max(0, l - l_target)`,α 默认 0.001,只在正确时惩罚。例:目标 200、实际 500、α=0.001 → 1-0.001×300=0.7。控制推理成本。
3. **步骤奖励(StepReward)**:`r_step = r_acc + β·s`,s=推理步骤数,β 默认 0.1,只在正确时给。例:3 步正确 → 1+0.1×3=1.3。鼓励可解释推理,缺点可能生成冗余步骤。

组合策略:准确率+长度惩罚(对话/问答);准确率+步骤(教育/可解释);三者平衡需调权重避免某目标主导。自定义奖励函数签名:`def fn(completions: List[str], **kwargs) -> List[float]`,kwargs 含 ground_truth,返回 0.0-1.0。错误分析四类(p415):计算错误、推理错误、理解错误、格式错误。

数据集 GSM8K(p388-390):7473 训练 + 1319 测试,小学数学需 2-8 步推理;三种格式——原始格式、SFT 格式(prompt+completion 含步骤)、RL 格式(prompt + ground_truth 只有最终答案,迫使模型自主生成推理而非记忆答案)。

## 跨资料对比/矛盾

- **与 agent-evaluation 同源**:本页训练的 GSM8K/数学推理智能体,正是 [agent-evaluation](./agent-evaluation.md) 中 BFCL/GAIA 的被评估对象;ch11 数学推理与 ch12.4 AIME 数据生成同属数学领域。训练(ch11)与评估(ch12)是闭环两端。
- **"六大核心能力"与其他概念页对应**:推理/工具使用/记忆/规划分别呼应 [agent-planning](./agent-planning.md)、[tool-use](./tool-use.md)、[agent-memory](./agent-memory.md)、[classic-paradigms](./classic-paradigms.md)(ReAct)。本页提供的是这些能力的"训练/优化"视角,其余概念页是"运行时机制"视角,无矛盾。
- **与 agent-oriented-infra 的隐含张力**:agent-oriented-infra 强调 agent 自主程度"与聪明无关,Standard 级模型就够,取决于 infra 护栏";本页则讨论如何让模型本身"更会推理/规划"。两者不矛盾——前者谈系统层自主边界,后者谈模型层能力上限,是正交的两条提升路径。

## 相关页面

- [agent-evaluation](./agent-evaluation.md) — 智能体评估(训练-评估闭环的另一端,GSM8K/AIME 同源)
- [classic-paradigms](./classic-paradigms.md) — ReAct 等经典范式(推理能力的运行时形态)
- [agent-planning](./agent-planning.md) — 规划能力
- [tool-use](./tool-use.md) — 工具使用能力
- [agent-memory](./agent-memory.md) — 记忆能力
- 来源:[ch11-agentic-rl](../sources/hello-agents/ch11-agentic-rl.md)
- 实体:[hello-agents](../entities/hello-agents.md)
