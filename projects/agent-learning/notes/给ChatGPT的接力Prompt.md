# 给 ChatGPT 的接力 Prompt

> 用法:把下面「Prompt 正文」整段复制粘贴给 ChatGPT(建议用支持文件上传 + Code Interpreter / Advanced Data Analysis 的对话),并按「附:上传材料清单」上传文件。

---

## Prompt 正文(直接复制此区块)

```
你是一位资深的企业级文档设计师,专长是把内部学习材料做成专业、克制、易读的中文 PDF 手册。

## 你的任务

我有一份已经定稿的中文 markdown 正文《企业业务 Agent 模块解析手册 v2.0》,需要你排版成一份美观的 PDF。要求中文清晰不乱码,图表精致,版式专业,适合给产品经理培训用。

## 项目背景(请通读后再动手)

这份手册来自我的个人知识库 llm-wiki,该 wiki 由 LLM 增量维护(参考 Karpathy 的 LLM Wiki 理念),目录结构是 `sources/`(原始资料)→ `wiki/sources/`(精读笔记)→ `wiki/concepts/`(概念页) + `wiki/entities/`(实体页)→ `notes/`(我的学习输出)。

本次任务的来龙去脉:
1. **v1 原始手册**:`sources/企业业务Agent模块解析手册-增强版.pdf`(12 页,内部学习稿,我自撰),已蒸馏成精读笔记 `wiki/sources/enterprise-agent-module-handbook.md`。
2. **v1 的问题**:对受众"先入为主"——第 2 页就抛出"业务 Agent 不是聊天机器人"做对比,但读者此时还不知道什么是 Agent。缺前置认知章节,Agent vs Workflow 没讲清,Workflow 在 12 模块编号外但又被反复强调,读者会困惑。
3. **v2 重构思路**(已与我对齐确认):新增 3 个前置章节(Part 1 是什么 + Agent vs Workflow / Part 2 Agent Loop / Part 3 企业落地认知 → 控制权钟摆),采用「先立区别再讲收敛」的张力叙事,然后才进 Part 4 演进、Part 5 模块解析、Part 6 落地方法、Part 7 API 实战、Part 8 结语。
4. **v2 当前状态**:正文已写完并通过我的审核(逻辑链没问题),现在缺的就是一份漂亮的 PDF。之前另一个 AI 试着用 ReportLab + matplotlib 出过一版,工程上能跑但视觉效果不行,所以我把任务交给你。

## 输入材料(我会作为文件上传给你)

| 文件 | 用途 | 你的处理 |
|---|---|---|
| `企业业务Agent手册-v2-正文.md` | **主要素材**,已定稿 | 严格依照,不要擅改文字 |
| `企业业务Agent手册-重构大纲-v2.md` | 含 9 张图表清单和章节字数预估 | 用作图表与版式规划依据 |
| `enterprise-agent-module-handbook.md` | v1 精读笔记,含原 PDF 的图表描述 | 参考原图意图,可重新设计 |
| `flowchart-data.json` | 我已经构造好的 3 张流程图节点和边数据 | 直接用作流程图源数据 |

## 设计要求

**受众**:产品经理、业务负责人、运营、商务、技术支持。读者基本不写代码,术语要解释清楚,案例要具体到"三方说签名失败"这种场景。

**篇幅**:A4,21-23 页(正文 + 图表)。

**字体**:
- 中文正文:思源黑体(Noto Sans SC)Regular 10.5pt,粗体 Bold
- 中文标题:思源黑体 Bold(必要时 H1 用 Noto Serif SC 增加分量)
- 英文/数字:Inter 或 IBM Plex Sans
- 代码:JetBrains Mono 或 Fira Code
- 字体必须子集化嵌入,确保跨平台不掉字

**配色**(克制,不超过 4 色):
- 强调色 accent:`#2D5F8A`(沉稳的工程蓝)
- 次强调 accent_lt(浅化版,用于 callout 背景):`#E8F0F7`
- 文本主色:`#1A1A1A`
- 弱化文字:`#6B7280`
- 分隔线:`#E5E7EB`
- 背景:纯白 `#FFFFFF`
- 引言/金句 callout:左侧 4px 强调色竖条 + 浅化背景

**版式**:
- 页边距:左右 2.8cm,上下 2.5cm
- 行距:1.6,段间距 8pt
- 章节起始页留白多,标题与正文有呼吸感
- 表格:无外框,只用横线分隔表头和行,表头加浅灰背景
- 代码块:浅灰背景 + 等宽字体
- 页眉:左侧手册名称(灰),右侧页码
- 封面:简洁,标题居中或左对齐,副标题"从普通聊天机器人,到可控、可复盘、可持续沉淀的业务 Agent",底部小字写适用对象/示例业务/版本

**9 张图表清单**(大纲里规划的,请逐个落实):

| 编号 | 位置 | 类型 | 内容 |
|---|---|---|---|
| 表 1 | Part 1 | 对比表 | 传统 agent vs LLM agent(6 维度:核心引擎/知识来源/处理指令/工作模式/泛化/开发范式)|
| **图 1** | Part 2 | 循环示意图 | Agent Loop:Perception → Thought → Action → State Change → Observation → 回到 Thought 闭环 |
| 图 2 | Part 3 | 对比框图 | 普通聊天(理解→生成→回答) vs 企业 Agent(识别任务→校验参数→调用 Skill)|
| 表 2 | Part 3 | 映射表 | 业务特征 → Agent 需要什么 → 对应模块(5 行)|
| **图 3** | Part 4 | 时间轴 | 四阶段演进:早期 Agent → 工作流 Agent → 自主 Agent → 自进化 Agent |
| 图 4 | Part 4 | 能力演进图 | 九阶段:LLM → 记忆 → RAG → Function Call/MCP → Agent Loop → Skill → Multi-Agent → Harness → Claw,分知识/能力/质量三层用色块区分 |
| **图 5** | Part 5 | 主链路图 | 主流程(用户输入→Session Router→需求转化→Schema 校验→调 Skill→输出确认) + LLM 增强层 + 支撑四件套(Task State/Memory/Audit/人工审核)|
| 表 3 | Part 6 | 范围表 | 一期必须做/后续增强(11 模块 × 一期建议 + 原因)|
| 表 4 | Part 6 | 验收表 | 6 种场景 × 应该看到的结果 |
| 图 6 | Part 7 | 任务链图 | API 接入三条链(新接入/联调/单量),共用底座 |
| 表 5 | Part 7 | 案例表 | 签名失败 8 阶段 × Agent 做什么 + PM 关注什么 |

加粗的图 1、图 3、图 5 是必做的核心流程图,数据已在 `flowchart-data.json` 里,请用矢量(SVG)渲染,不要用 matplotlib 这种学术风格。

## 技术建议(供你选择)

推荐路径:用 **HTML + CSS + Playwright (Chromium headless)** 渲染 PDF,理由:
- 中文字体最稳(直接用 @font-face 加载 Noto Sans SC)
- 图表用 SVG 或 mermaid 渲染,矢量清晰
- CSS Print(@page、page-break)对版式控制最强
- Code Interpreter 环境可用 `playwright` + `chromium`

备选:WeasyPrint(纯 Python,无浏览器依赖,但对 SVG/复杂 CSS 支持弱一些)。

不推荐:ReportLab(底层 API,版式控制繁琐,做不出现代感)、matplotlib 画流程图(学术感太重)。

## 输出与交付节奏

**先出样张,不要直接出全本**:
1. **第 1 步**:先做封面 + Part 1 的前 2 页(含表 1 的版式),作为视觉样张给我看,确认配色/字体/留白是不是想要的方向。
2. **第 2 步**:确认后,再产出图 1(Agent Loop 循环图)和图 3(四阶段时间轴)单独的 SVG/PNG 让我看图表风格。
3. **第 3 步**:全部确认后,出完整 PDF。
4. **每一步**都把:① 渲染脚本(HTML/CSS/Python)给我,② 中间产物(SVG/PNG)给我,③ 最终 PDF 给我。

## 风格底线

- 不要在文档里加无关的 emoji、装饰性渐变、阴影、3D 效果
- 不要用大色块或饱和度高的颜色填充
- 强调色只用在标题下划线、callout 竖条、表头底色、关键词加粗——不要泛滥
- 流程图节点用细线框 + 浅色填充,不要用厚重阴影
- 留白比信息密度更重要,宁愿多翻一页也别挤
- 中文字号不要小于 10pt(注脚除外)

请先确认你已经读完所有上传材料,然后开始第 1 步样张。
```

---

## 附:上传材料清单

把以下文件打包成一个 zip(或逐个上传),给 ChatGPT:

| 项目内文件 | 必要性 | 说明 |
|---|---|---|
| `notes/企业业务Agent手册-v2-正文.md` | **必须** | 主要素材,正文 |
| `notes/企业业务Agent手册-重构大纲-v2.md` | **必须** | 大纲 + 图表清单 + 字数预估 |
| `wiki/sources/enterprise-agent-module-handbook.md` | **必须** | v1 精读笔记,含原图描述 |
| `notes/_handbook_pdf/flowchart-data.json` | **必须** | 我已构造的 3 张流程图节点和边 |
| `sources/企业业务Agent模块解析手册-增强版.pdf` | 可选 | v1 原版 PDF,供 ChatGPT 视觉对比"以前长这样,现在不要这样" |
| `wiki/concepts/agent-definition.md` | 可选 | Agent 定义页,如 ChatGPT 觉得正文需要补充时参考 |
| `wiki/concepts/agent-loop.md` | 可选 | Agent Loop 概念页 |
| `wiki/concepts/enterprise-agent.md` | 可选 | 企业 Agent 概念页 |

「flowchart-data.json」我会另外写出来给你。
