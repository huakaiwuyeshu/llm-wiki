> TL;DR：第十一章「Agentic RL」为 HelloAgents 引入强化学习训练能力——从 LLM 训练全景(预训练→SFT→RM→RLHF/RLAIF)讲到 Agentic RL 范式(把 LLM 当可学习策略嵌入多步决策循环),核心实战是用 GSM8K 数据集 + 三种奖励函数(准确率/长度惩罚/步骤奖励) + LoRA,经 SFT 再 GRPO 训练 Qwen3-0.6B 数学推理智能体。GRPO 是去掉 Value Model 的 PPO 简化版,用组内相对奖励替代优势函数。技术栈:TRL + Qwen3-0.6B。

来源:《Hello-Agents》第十一章「Agentic RL」,PDF p383-435(章首 p383「11.1 从 LLM 训练到 Agentic RL」,章末习题 p435,第十二章始于 p437)。ingest 日期 2026-06-10。
**注意**:任务给的页码估计(p383-399)基于损坏文本抽取,实际本章占 p383-435,远超估计。本篇覆盖全章 11.1-11.6 + 小结 + 习题。

## 11.1 从 LLM 训练到 Agentic RL(p383-388)

### 11.1.1 从强化学习到 Agentic RL(p383)
传统监督学习三大局限:①数据质量完全决定训练质量,模型只能模仿难以超越;②缺乏探索能力,只能被动学习人类路径;③难以优化长期目标,无法精确优化多步推理中间过程。
**Agentic RL 核心思想**:将 LLM 作为可学习策略,嵌入智能体的"感知-决策-执行"循环,通过 RL 优化多步任务表现。数学问题求解智能体的 RL 映射:智能体=LLM 推理系统,环境=数学问题+验证系统,状态=问题描述+已有推理步骤,行动=生成下一步推理或答案,奖励=答案正确(+1)/错误(0)。

### 11.1.2 LLM 训练全景图(p384-385, 图11.1)
LLM 从"语言模型"到"对话助手"的演化路径,分**预训练 + 后训练**两阶段。
- **预训练(Pretraining)**:海量文本(数 TB),自监督因果语言建模(Next Token Prediction)。损失 `L_pretrain = -Σ log P(x_t | x_1..x_{t-1}; θ)`。学语法/语义/世界知识/基础推理。特点:数据量巨大、成本高、通用能力、无监督。
- **后训练(Post-training)**三步:
  1. **SFT(监督微调)**:学指令遵循和对话格式,数据是 (prompt, completion) 对。`L_SFT = -Σ log P(y_i | c_i; θ)`。特点:数据量小、需人工标注、快速见效。
  2. **RM(奖励建模)**:用偏好对比数据(同一问题的 chosen/rejected 两回答)学人类偏好。`L_RM = -E[log σ(r_Φ(x,y_w) - r_Φ(x,y_l))]`,σ 为 sigmoid,目标让更好回答得更高分。
  3. **RL 微调**:最经典 **PPO**,`J_PPO = E[r(x,y)] - β·D_KL(π_θ || π_ref)`,最大化奖励同时不偏离原模型太远。
- **RLHF → RLAIF**(p385):RLHF 需大量人工标注偏好(成本高昂);RLAIF 用强 AI 模型(如 GPT-4)替代人类标注员。实验表明 RLAIF 效果接近甚至超过 RLHF,成本大幅降低。

### 11.1.3 Agentic RL 核心理念(p385-386, 表11.1)
区分两种范式:
- **PBRFT**(Preference-Based RL Fine-Tuning,传统后训练):单步,模型生成一个回答按质量打分,适合对话助手。
- **Agentic RL**:LLM 视为可学习策略,嵌入顺序决策循环,在动态环境中多步交互、获中间反馈、优化长期累积奖励。

例:"分析这个 GitHub 仓库代码质量"→调 API 获仓库信息(+0.1)→读代码文件(+0.1)→分析质量(+0.2)→生成报告(+0.6),总奖励累积=1.0。

**MDP 五元组** (S, A, P, R, γ) 下 PBRFT vs Agentic RL 对比(表11.1):
| 维度 | PBRFT | Agentic RL |
|------|-------|-----------|
| 状态 | S_0=prompt,T=1,不变 | s_t=(prompt,o_1,...,o_t),T≫1,随行动演化(o_t=第t步观察) |
| 行动 | 只有文本生成 a=y~π(y\|s_0) | a_t∈{a_text, a_tool},含工具调用/环境操作 |
| 转移 | 无状态转移 P(s'\|s,a)=δ(s'-s_terminal) | s_{t+1}~P(s_{t+1}\|s_t,a_t),动态变化 |
| 奖励 | 单步 R=r(s_0,y),仅结束时 | 多步 r(s_t,a_t),可中间给部分奖励 |

目标函数:PBRFT `J=E[r(s_0,y)]`(单步期望);Agentic RL `J=E_τ[Σγ^t r(s_t,a_t)]`(累积折扣奖励),τ=完整轨迹 trajectory。
洞见:这不只是技术差异,是思维方式根本转变——从"生成更好单个回答"到"完成复杂任务",从对话助手进化为自主智能体。

### Agentic RL 六大核心能力(p386-387, 图11.2)
1. **推理(Reasoning)**:学有效推理策略,发现训练数据没有的推理路径。建模为序列决策:给定问题 q,生成推理链 c=(c_1..c_n)+答案 a,`r(q,c,a)=1 if a=a* else 0`。
2. **工具使用(Tool Use)**:学会何时用、用哪个、如何组合工具。
3. **记忆(Memory)**:学记忆管理策略(记什么/何时更新/何时删除),超越静态 RAG。
4. **规划(Planning)**:动态规划,试错发现有效行动序列,权衡短期/长期收益。
5. **自我改进(Self-Improvement)**:自我反思,识别错误、分析失败、调整策略。
6. **感知(Perception)**:多模态理解,视觉推理和视觉工具使用。

### 11.1.4 HelloAgents 的 Agentic RL 设计(p387, 图11.3)
技术选型:**TRL**(Transformer Reinforcement Learning,Hugging Face 的 RL 库)+ **Qwen3-0.6B**(阿里云小模型,0.6B 参数适合普通 GPU)。
四层架构:①数据集层(`GSM8KDataset`、`create_sft_dataset()`、`create_rl_dataset()`);②奖励函数层(`MathRewardFunction` 基类、`AccuracyReward`、`LengthPenaltyReward`、`StepReward`、`create_*reward()`);③训练器层(`SFTTrainerWrapper`、`GRPOTrainerWrapper`,支持 LoRA);④统一接口层(`RLTrainingTool`,支持 action="train"/"load_dataset"/"create_reward"/"evaluate")。
安装:`pip install "hello-agents[rl]==0.2.5"`。

### 11.1.5 快速上手(p387-388)
`RLTrainingTool().run({action,algorithm,model_name,output_dir,max_samples,num_epochs,batch_size,use_lora})`。完整流程:SFT 训练(学格式)→GRPO 训练(优化策略)→评估。注:跑完准确率很低正常(只见过 0.7% 样本、只跑一轮)。GRPO 的 batch_size 必须能被 num_generations(8)整除。

## 11.2 数据集与奖励函数(p388-399)

### 11.2.1 GSM8K 数学推理数据集(p388-390, 表11.2)
**GSM8K**(Grade School Math 8K)[4]:**7473 训练 + 1319 测试**样本,小学数学(2-8 年级),应用题,需 **2-8 步**推理。选数学的理由:有明确答案可自动评估、需多步推导、推理能力可迁移。
样本格式:答案含 `<<48/2=24>>` 中间计算标记、`#### 72` 最终答案标记。
**三种数据格式**(图11.4, 表11.3):
- **原始格式**:question + answer(含步骤),人类阅读。
- **SFT 格式**:prompt(对话模板,如 Qwen `<|im_start|>` 标记) + completion(完整解答),学格式化输出和分步推理。
- **RL 格式**:prompt 同 SFT + ground_truth(只有最终答案),迫使模型自主生成推理过程而非记忆答案。

### 11.2.2 奖励函数设计(p391-394, 图11.5)
好奖励函数:清楚定义成功、提供梯度信号、方差不过大、易调整组合。坏奖励:稀疏(只结束给)、奖励欺骗(reward hacking)、目标矛盾、方差过大不收敛。
**三种内置奖励**(可单用或组合):
1. **准确率奖励(AccuracyReward)**:`r_acc=1 if a=a* else 0`,二值。答案提取法:查 "Final Answer:" 后数字 / "####" 后数字 / 正则取最后数字。比较需处理数值精度(72.0≡72)、单位(1000≡1k)、格式(72≡seventy-two)。优点简单直接,缺点稀疏。
2. **长度惩罚(LengthPenaltyReward)**:`r_length = r_acc - α·max(0, l - l_target)`,α 默认 0.001。只在答案正确时惩罚。例:目标 200 字符、实际 500、α=0.001 → 1-0.001×300=0.7。控制推理成本。
3. **步骤奖励(StepReward)**:`r_step = r_acc + β·s`,s=推理步骤数,β 默认 0.1。只在正确时给。例:3 步正确答案 → 1+0.1×3=1.3。鼓励可解释推理,缺点可能生成冗余步骤。
**组合策略**:准确率+长度惩罚(对话/问答);准确率+步骤(教育/可解释 AI);三者平衡 `r=r_acc - α·max(0,l-l_target) + β·s`(需调权重 α、β 避免某目标主导)。

### 11.2.3 自定义数据集和奖励函数(p394-399)
- **SFT 格式字段**:prompt(system+user)、completion、text(可选)。**RL 格式字段**:question、prompt、ground_truth、full_answer。
- 转换:`format_math_dataset(dataset, format_type="sft"/"rl", model_name)`,从含 question/answer 的原始数据转。
- 三种用法:①`custom_dataset` 参数直接传;②`register_dataset(name, ds)` 注册后用(推荐);③同理 `register_reward_function(name, fn)`。
- **自定义奖励函数签名**:`def fn(completions: List[str], **kwargs) -> List[float]`,kwargs 含 ground_truth,返回值在 0.0-1.0 间。示例用 `re.findall(r'-?\d+\.?\d*', completion)` 提数字,按误差(<0.01→1.0, <1.0→0.8, <5.0→0.5)给分,含 "step"/"=" 额外 +0.1。

## 11.3 SFT 训练(p399-406)

### 11.3.1 SFT 是桥梁(p401, 图11.6)
预训练模型输出冗长、无结构、无明确答案,无法用于 RL(无法提取答案/评估/给奖励)。SFT 后输出结构清晰("Step 1/Step 2/Final Answer" 标记)、推理正确、格式统一,可用于 RL。

### 11.3.2 LoRA:参数高效微调(p401-402)
全量微调显存:Qwen3-0.6B 需 ~12GB(FP16)/24GB(FP32);7B/13B 几乎不可能在消费级 GPU。
**LoRA**(Low-Rank Adaptation)[3]核心:微调参数变化可用低秩矩阵表示。`W'=W+ΔW`,`ΔW=BA`(B∈R^{d×r}, A∈R^{r×k}, r≪min(d,k))。前向 `h=Wx+BAx`,W 冻结只训 B、A。
参数量:原 d×k vs LoRA r(d+k)。例 d=k=4096, r=8:原 16,777,216 vs LoRA 65,536,**减少 256 倍**。
优势:显存大降、训练快、易部署、防过拟合;缺点:效果通常略差于全量。
关键超参:**rank r**(4-64,默认 8,越大表达力越强);**alpha α**(缩放因子,典型=rank,rank=8→alpha=16);**target_modules**(通常注意力层 q/k/v/o_proj,可含 MLP gate/up/down_proj)。

### 11.3.3 SFT 训练实战(p402-405)
参数详解:max_samples(快测 100-1000,全量 7473)、num_epochs(建议从 3 起)、batch_size(按显存:4GB→1-2, 8GB→4-8, 16GB→8-16)、learning_rate(SFT 推荐 5e-5,LoRA 可 1e-4)、lora_rank(4-8 小任务/16-32 复杂/64 大规模)、lora_alpha(rank 的 2 倍)、warmup_ratio(默认 0.1)、weight_decay(默认 0.01)。
完整训练配置示例适合 8GB GPU,预计 30-60 分钟。
**训练监控三指标**(p404):Loss(应下降,不降=学习率太小/数据问题,降后升=学习率太大/过拟合)、Gradient Norm(合理 0.1-10,>100 梯度爆炸,<0.01 梯度消失)、Learning Rate(按 warmup 前 10% 线性增后衰减)。

### 11.3.4 模型评估(p405-406)
指标:准确率、平均奖励、推理质量(需人工或评估模型)。**Qwen3-0.6B SFT 后 GSM8K 准确率 40-50% 正常,经 RL 可提升到 60-70%**。可对比预训练/SFT/GRPO 三模型。

## 11.4 GRPO 训练(p406-415)

### 11.4.1 从 PPO 到 GRPO(p406-407, 图11.7, 表11.6)
**PPO 在 LLM 训练的问题**:需训 Value Model(增复杂度和显存)、需同时维护四个模型(Policy/Reference/Value/Reward)、训练不稳定易奖励崩塌。
**GRPO**(Group Relative Policy Optimization)[2]:专为 LLM 设计的 PPO 简化版。核心——**不需要 Value Model,用组内相对奖励代替绝对奖励(优势函数)**;只需 Policy + Reference 两模型;提稳定性减奖励崩塌。
- PPO 目标:`J_PPO = E[min(ratio·A, clip(ratio,1-ε,1+ε)·A)]`,优势 `A(s,a)=Q-V=r+V(s')-V(s)`(需 Value Model)。
- GRPO 目标:`J_GRPO = E[(r(s,a) - r_group) - β·D_KL(π_θ||π_ref)]`,用 `r(s,a)-r_group`(组内平均奖励)替代 A,不需 Value Model,减方差。
结论:LLM 训练 GRPO 更优——更简单、更稳定、显存更低。

### 11.4.2 GRPO 训练实战(p407-409)
前提:先完成 SFT(GRPO 需合理初始策略,`model_name` 从 SFT 模型开始)。
**GRPO 特定参数**:num_generations(每问题生成几答案,典型 4-8,用于算组内相对奖励)、max_new_tokens(建议 256-512)、temperature(建议 0.7-1.0 保探索)、learning_rate(比 SFT 小,1e-5 到 5e-5)、kl_coef(KL 惩罚系数,0.05-0.1;太小 0.01 偏离太远,太大 0.5 学习受限)、clip_range(建议 0.2)、reward_type(accuracy/length_penalty/step/combined)。

### 11.4.3 GRPO 训练过程解析(p409-410)
**训练循环 5 步**:①采样(每问题生成 num_generations 个答案构成"组")→②奖励计算→③相对奖励(组内,减方差)→④策略更新(+KL 惩罚防偏离)→⑤重复。
具体例(q="48+24?",4 答案):奖励 [1.0,1.0,0.0,0.8](第 4 个正确但长被罚),组内均值 0.7,相对奖励 [+0.3,+0.3,-0.7,+0.1]。机制鼓励生成"比平均更好"的答案而非追求绝对高奖励,减方差提稳定。
**KL 散度惩罚**(p410):`D_KL(π_θ||π_ref)=Σ_t log(π_θ(a_t|...)/π_ref(a_t|...))`,逐 token 计算求和,防遗忘 SFT 知识。kl_coef 选择:0.01 太小偏离/0.5 太大学慢/0.05-0.1 平衡。
**训练监控**:平均奖励应渐升(不升=学习率小/KL 罚大/奖励设计差;先升后降=过拟合/奖励崩塌)。

## 11.5 完整案例:数学推理智能体训练(p~411-419)
完整 pipeline 分阶段:数据准备 → 阶段1/2 SFT 训练 → 阶段3 SFT 评估 → 阶段4 GRPO 训练 → 评估对比。
三模型对比表(预训练/SFT/GRPO),指标 accuracy/average_length/format_correctness。
### 11.5.3 错误分析(p415)
仅看准确率不够,模型错误分四类:**计算错误**(推理对但算错,如 48/2=25,数值能力不足)、**推理错误**(逻辑错,如先加后除,逻辑能力不足)、**理解错误**(没理解问题,如问"总共"只算一部分,语言理解不足)、**格式错误**(答案对但缺 "Final Answer:" 标记,格式学习不足)。

## 11.6 进阶:超参调优与生产部署(p~420-431)
- **超参搜索**(p425):网格搜索 / **随机搜索**(对数均匀采样 lr、随机选 lora_rank/kl_coef,效率高)/ **贝叶斯优化**(Optuna,`suggest_loguniform`/`suggest_categorical`,概率模型指导更智能)。
- **分布式训练**(p430):总 batch=per_device_batch × num_gpus × gradient_accumulation;**线性缩放规则** `lr_new=lr_base×sqrt(total_batch_new/total_batch_base)`(例 4GPU batch=64 → lr=5e-5×sqrt(64/16)=1e-4);监控 `ACCELERATE_LOG_LEVEL=INFO`、`NCCL_DEBUG=INFO`。
- **生产部署**(p430):LoRA 权重合并 `PeftModel.from_pretrained(base, lora_dir).merge_and_unload()` 再 `save_pretrained`,方便部署。

## 本章小结(p433)
- **六大核心能力**:推理/工具使用/记忆/规划/自我改进/感知。
- **训练流程**:预训练(用现成模型)→ SFT(学格式和基础推理)→ RL(试错优化超越数据质量)。**SFT 是基础,RL 是提升;没 SFT 的 RL 很难成功,没 RL 模型只能模仿数据**。
- 学习路径:基础阶段(MDP/策略梯度/PPO + Transformer/预训练 + 跑示例)→ 进阶(深入 TRL/自定义数据集/奖励/调参)→ 高级(多步推理/工具学习/多智能体/前沿论文)。

## 金句/洞见
- "Agentic RL 的核心思想:将 LLM 作为可学习策略,嵌入智能体的感知-决策-执行循环,通过强化学习优化多步任务表现。"(p383)
- "这种转变不仅是技术细节差异,而是思维方式的根本转变……使 LLM 从'对话助手'进化为'自主智能体'。"(p386)
- GRPO 的精髓:用组内相对奖励替代需 Value Model 估计的优势函数——既减一个模型,又降方差。(p406)
- "没有 SFT 的基础,RL 很难成功;没有 RL 的优化,模型只能模仿训练数据。"(p433)

## 关联
- 11.1.1 与 11.1.3 多次回指第二章 2.4.2「基于强化学习的智能体」([ch02](ch02-agent-history.md))与 MDP 概念。
- 六大能力中"工具使用/记忆/规划"分别呼应 [ch10](ch10-agent-communication-protocols.md)(MCP/工具)、[ch08](ch08-memory-and-rag.md)(记忆/RAG)、[ch04](ch04-classic-agent-paradigms.md)(ReAct/规划)。
- RLTrainingTool 延续 ch07 的 Tool 抽象([ch07](ch07-build-your-framework.md));训练出的模型可装回 SimpleAgent。
- 训练好的智能体用第十二章评估([ch12 前半](ch12-evaluation-part1.md), [ch12 后半](ch12-evaluation-gaia-datagen.md)),GSM8K/数学推理与 12.4 AIME 数据生成同源。

## 参考文献(本章引用)
- [1] PPO — Schulman et al. Proximal Policy Optimization.
- [2] GRPO — DeepSeekMath (Group Relative Policy Optimization).
- [3] LoRA — Hu et al. Low-Rank Adaptation.
- [4] GSM8K — Cobbe et al. Training Verifiers to Solve Math Word Problems.
- [5] RLHF;[7] RLAIF;[9] TRL(Hugging Face);[10] Qwen3。(编号依 OCR,部分 (?))
