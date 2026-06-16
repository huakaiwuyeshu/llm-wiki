# 实战模板拆解:对照我的 API 接入 Agent

> TL;DR:从开源项目 awesome-llm-apps 选 5 个与「API 接入与分析 Agent」最贴合的模板逐一拆解,提炼可直接抄的设计思路(deterministic-picker 的 prompt 写法、路由+兜底、Self-RAG 证据评分、NL→SQL、信任闸门+哈希链审计),并给出三问统一抄法。

## 元数据
- 原文件:`D:\zuhaowan-ai\llm-wiki\sources\实战模板拆解-对照我的API接入Agent.md`
- 文档类型:模板拆解(Markdown 笔记)。**疑似用户自撰**——通篇第一人称"我的 Agent / 你手册",自述"已本地 clone 查阅真实代码"
- 来源对象:开源项目 `Shubhamsaboo/awesome-llm-apps`;选取标准 = 与手册「API 接入与分析 Agent」三条任务链(新接入 / 联调排查 / 单量分析)+ 安全闸门最贴合的 5 个模板
- ingest 日期:2026-06-10

## 核心内容

### 总览:5 个模板拼起来 ≈ 整个 Agent
| 模板路径 | 对应模块/任务链 | 一句话价值 |
|---|---|---|
| `rag_tutorials/rag_failure_diagnostics_clinic` | ⭐ 联调排查 + Skill 案例库 + deterministic-picker | 几乎是「签名失败排查」的现成骨架 |
| `rag_tutorials/rag_database_routing` | Session/Skill Router + 知识库检索 | 把问题路由到正确的知识库 + 兜底 |
| `rag_tutorials/corrective_rag` | 知识库检索(#7) | "无依据就纠错/兜底"标准实现,建在 LangGraph |
| `starter_ai_agents/ai_data_analysis_agent` | 单量分析任务链 | 自然语言→SQL→分析的现成做法 |
| `advanced_ai_agents/.../trust_gated_agent_team` | ⭐ Tool Governance + Audit + 人工审核 | 信任打分闸门 + 防篡改审计链 |

### 1. ⭐ rag_failure_diagnostics_clinic —「联调排查」骨架
做什么:贴入真实 bug 描述,LLM 归类到**预定义 12 种失败模式库(P01–P12)**,给"最小结构化修复方案"。把"RAG 失败模式库"换成"API 联调问题库"(签名失败/回调异常/续租失败…),逻辑一模一样。
可抄的 3 个设计:
1. **deterministic-picker 活样本**(对应手册 #3/#4):System Prompt 硬写死「只能从 P01–P12 选一个主分类,不许发明新 id」。抄点:需求识别让 LLM 从定义好的 `request_type` 枚举里选,而非自由生成——"LLM 填表、不自己拍板"在 prompt 层的具体写法
2. **问题模式库 = Skill 案例库**(对应 #6/#10 Memory):每种失败模式写成 `{id, name, summary}` 结构化清单喂给模型;Memory 沉淀的真实联调案例直接往里加
3. **强制输出结构 + 落盘 JSON 报告**(对应 #11 Audit):按"主分类/次选/推理/最小修复"四段输出,存成 `rag_failure_report.json` 当增量案例库;排查输出固定四段,技术支持直接可用,天然形成复盘记录
看哪里:`rag_failure_diagnostics_clinic.py` 的 `PATTERNS` 列表 + `build_system_prompt()` 函数。**5 个里最该先读。**

### 2. rag_database_routing —「分诊 + 派单 + 检索」
做什么:文档分进 **3 个专用库**(产品信息/客服FAQ/财务);router agent 判断该查哪个库;3 库都没命中**兜底走联网搜索**。对应模块 #2 Session Router + #6 Skill Router + #7 知识库检索一次性串起来。
可抄:「路由 + 多库 + 兜底」三件套(API 文档/错误码/续租规则/号池规则本来就是不同知识域);兜底机制要改——它"没命中就联网",用户版本应改成"**没命中就明说'文档未找到依据'**"(手册安全口径,比联网更稳)。
看哪里:`rag_database_routing.py` 的 router agent 判断逻辑 + fallback 分支。

### 3. corrective_rag —「知识库检索」标准件(Self-RAG/CRAG)
做什么:检索→LLM 给每篇文档**相关性打分**→不够相关就**改写查询重试**→还不行**联网兜底**→生成答案;全流程用 **LangGraph 状态机**编排。对应手册 #7 的进阶版,即附录所说 Self-RAG / CRAG 范式的真实代码。
可抄:"检索完先判断证据够不够"这道关卡——回答 API 字段含义前先判断检索片段能否回答,不够就走"未找到依据",直接落实可追溯口径;LangGraph 编排与手册"Task State 状态机"是同一技术地基。
看哪里:`corrective_rag.py` 的 grading 节点和 LangGraph 图定义。

### 4. ai_data_analysis_agent —「单量分析」任务链
做什么:上传 CSV/Excel→自动推断 schema→自然语言提问→模型转 **SQL(DuckDB 执行)**→结果 + 可视化。对应任务链:单量分析(确认口径→趋势分析→异常判断→输出周报)。
可抄:**让 DuckDB 算数、LLM 只负责翻译和解读**——又一次 deterministic-picker,算数交给确定性引擎,别让 LLM 心算;schema 自动推断对应"确认口径"(先把字段/口径摆清楚再分析)。
看哪里:`ai_data_analyst.py` 的 NL→SQL prompt + DuckDB 执行部分。

### 5. ⭐ trust_gated_agent_team —「Tool Governance + Audit + 人工审核」
做什么:多 agent 流水线(Researcher→Analyst→Writer),每个 agent 参与前必须通过**信任打分(0–100,金/银/铜分级)**,不达标直接被挡;每步操作写进 **SHA-256 哈希链审计日志**,任一条被篡改后面全部对不上。对应手册 #8 Tool Governance + #11 Audit + #12 人工审核。
可抄:"参与前先过闸"的 gating 模式(凭证发放/上线/改配置前的人工审核 = "达标才放行"闸门的代码实现参考);哈希链审计给"可复盘、可审计"一个**防篡改**的具体实现,对凭证/上线类敏感操作特别有说服力。
注意:用户版本要叠加"敏感信息不进日志"(appsecret 不落盘)——这是该模板没强调、用户更严的地方。
看哪里:README 架构图 + 源码 trust check 的 gating 逻辑。

### 学习路线(按优先级)
1. 先读 #1(failure_diagnostics)——最贴近、代码最短、deterministic-picker 最清楚
2. 再读 #3(corrective_rag)——Self-RAG + LangGraph 状态机,补 #7 和 Task State 的实现认知
3. #2 + #4 + #5 按需——分别对应路由、单量分析、安全闸门

### 统一抄法(三问)
每个模板问自己:① 它把"判断"交给了 LLM 还是代码?② 它的兜底(没命中/不达标)怎么处理?③ 它沉淀了什么可复盘的记录?——三问正好对应手册的 **deterministic-picker、安全边界、Audit 三大支柱**。

## 关键细节
- 失败模式库:12 种,编号 P01–P12;输出四段:主分类/次选/推理/最小修复;落盘文件 `rag_failure_report.json`
- 路由模板:3 个专用库(产品信息/客服FAQ/财务)
- 信任闸门:打分 0–100,金/银/铜三级;审计 = SHA-256 哈希链
- 手册「API 接入与分析 Agent」三条任务链:新接入 / 联调排查 / 单量分析
- 手册模块编号(由映射反推):#2 Session Router、#3/#4 需求识别相关(deterministic-picker)、#6 Skill(Router/Loader)、#7 知识库检索、#8 Tool Governance、#10 Memory、#11 Audit、#12 人工审核

## 洞见
- 这是六份材料里唯一指向**具体代码实现**的一份,把手册的产品概念落到"代码里具体怎么转";三问抄法是把任何开源 Agent 模板映射回自家架构的通用方法论
- 文中两处对开源模板的"改造"都体现用户手册的口径比开源默认更保守:联网兜底→改为"明说未找到依据";哈希链审计→叠加"敏感信息不落盘"
- 由本文可确认用户的业务域:API 接入/回调签名/续租/号池/单量——疑似租号/号池类平台的 API 开放平台场景 (?)
