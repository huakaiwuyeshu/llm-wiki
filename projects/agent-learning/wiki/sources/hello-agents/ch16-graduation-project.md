> TL;DR：第十六章是全书毕业设计章——指导读者用 HelloAgents 从零构建一个完整的多智能体应用,并通过开源协作(Fork → 开发 → PR)方式贡献到 Hello-Agents 的 co-creation-projects 仓库。本章不是新技术,而是工程闭环教学:项目选题(5 大方向)、环境与 Git/GitHub 准备、目录结构规范、README/requirements/Notebook 编写、大文件管理规范、PR 提交与 review 响应,并给出完整示范项目 CodeReviewAgent(SimpleAgent + ToolRegistry + Python AST 静态分析 + ModelScope Qwen2.5-72B)。这是全书正文最后一章。

来源:《Hello-Agents》第十六章「毕业设计:构建你的多智能体应用」,PDF p614-633(章首 p614,书末 p633,无附录/参考文献)。ingest 日期 2026-06-10。
说明:本 PDF 中文为损坏字体编码,经 PyMuPDF 渲染 PNG + RapidOCR 中文模型识别后蒸馏;代码/标点偶有 OCR 噪声,已据上下文还原,不确定处标 (?)。

## 章节定位与目标(p614)

承接全书:前 1-12 章从零搭 HelloAgents 框架、学习核心概念(智能体范式、记忆、上下文工程、通信协议、强化学习训练、评测/知识构建);第 13-15 章是实战项目(旅行助手、Deep Research 智能体、赛博小镇),展示如何把所学应用到具体场景。

第十六章角色:从"学习者"转为"贡献者"——构建自己的多智能体应用,并通过开源协作贡献社区。核心价值:**综合应用**(把前面学的多种范式、记忆系统、工具调用、通信协议综合到一个完整项目)、锻炼工程能力(Git/GitHub、文档、开源协作)、产出展示性作品。(16.1.1, p614)

注:p613 是第十五章末尾"AI NPC 的挑战与未来"——挑战包括成本(每次对话需调 LLM API、大型多人游戏成本高)、延迟(LLM 生成需时间)、内容可控性(LLM 生成内容不完全可靠,需提示词+内容过滤),展望是成本随模型发展持续下降、本地化小模型可跑在游戏设备上。

## 16.1 毕业设计的意义与形式(p614)

为什么做毕业设计(16.1.1):最好的学习是动手实践;把前面学的范式、记忆、通信协议综合选用,完成一个完整项目;掌握 Git/GitHub 协作,产出可展示作品。

形式(16.1.2):以**开源项目**形式提交到 Hello-Agents 工作项目仓库 `co-creation-projects` 目录,要求:
1. 项目命名:`{你的GitHub用户名}-{项目名称}`,例如 `jjyaoao-CodeReviewAgent`。
2. 项目内容:一个可运行的 Jupyter Notebook(`.ipynb`)或 Python 脚本 + 依赖列表(`requirements.txt`)+ 完整 README(`README.md`)+ 可选(演示视频/截图/数据集)。
3. 提交方式:通过 GitHub Pull Request (PR)。
4. 评审流程:管理员 review 代码,提改进建议,通过后合并到工作仓库。

## 16.2 项目选题指南(p615-616)

选题原则(16.2.1):实用性(解决真实问题)、可行性(追求最小可行 MVP、能在课程时间内完成)、可展示性(有清晰交付物)。

**5 大推荐选题方向**(16.2.2):
1. 工具型:智能代码助手(代码审查/生成/bug 检测/优化)、智能文档助手(API 文档/用户手册)、智能会议助手(纪要/待办)、智能邮件助手(分类/回复)。
2. 学习教育型:智能学习规划、知识问答助手、智能编程导师、语言学习助手。
3. 创意生成型:智能写作助手(故事/小说/剧本/诗歌)、智能游戏 NPC、智能推荐助手(电影/音乐)、智能菜谱助手。
4. 数据分析型:智能数据分析师(分析+可视化+报告)、智能股票分析(财报/新闻+投资建议)、智能舆情监控、智能比价助手。
5. 生活助手型:智能健康助手(健康记录/运动计划)、智能记账助手、智能购物助手、智能家居控制(自然语言控制设备)。

选题示范(16.2.3, p616):以 **CodeReviewAgent(智能代码审查助手)** 贯穿全章——动机:人工代码审查耗时易漏,静态分析工具只查语法不懂业务逻辑,需要能理解语义、给改进建议的助手。核心功能:代码质量分析(规范/注释/可读性)、潜在 bug 检测(空指针/边界/异常)、性能优化建议、安全漏洞扫描(SQL 注入/XSS)、最佳实践推荐。预期交付:可运行 Jupyter Notebook,支持 Python/JavaScript(?),生成结构化 Markdown 审查报告。

## 16.3 开发环境准备(p616-618)

安装必要工具(16.3.1):
- Python:`pip install "hello-agents[all]"`
- Git/GitHub:`git --version` 验证;`git config --global user.name/user.email`;推荐配 SSH key(`ssh-keygen -t ed25519 -C "邮箱"`,公钥加到 GitHub Settings,`ssh -T git@github.com` 测试)。
- Jupyter:`pip install jupyter notebook`(或 `jupyterlab`),`jupyter lab` 启动。

Fork 项目仓库(16.3.2):
1. 访问 `https://github.com/datawhalechina/hello-agents`,点右上角 Fork(图 16.1)。
2. 克隆 Fork:`git clone git@github.com:你的用户名/hello-agents.git`,`cd hello-agents`,加 upstream:`git remote add upstream https://github.com/datawhalechina/hello-agents.git`(图 16.2)。
3. 创建功能分支:`git checkout -b feature/项目名`,如 `feature/code-review-agent`。

目录结构(16.3.3):在 `co-creation-projects/` 下建 `用户名-项目名/` 文件夹。推荐结构:`README.md`、`requirements.txt`、`main.ipynb`(主 Notebook)、`data/`(数据/样例,可选)、`outputs/`(输出/截图,可选)、`src/`(源码 `agents/`、`tools/`、`utils/`,可选,代码多时)。

## 16.4 项目开发指南(p618-625)

### README 编写(16.4.1, p618-621)
README 是项目门面,应含:项目名称(一句话简介)→ 项目简介(解决什么问题/什么角色功能/用什么技术)→ 核心功能 → 技术栈(HelloAgents、用的智能体范式如 ReAct/Plan-and-Solve、工具和 API)→ 快速开始(环境要求 Python 3.10+、安装 `pip install -r requirements.txt`、配 API Key `cp .env.example .env`、运行 `jupyter lab`)→ 使用示例 → 项目特点 → 性能指标(准确率/响应时间等)→ 未来计划 → 贡献指南 → 开源许可(MIT)→ 联系方式 → 致谢(感谢 Datawhale)。

### requirements.txt(16.4.2, p621)
列依赖与版本,如:`hello-agents[all]>=0.2.7`、可视化 `matplotlib>=3.7.0` `plotly>=5.14.0`、Web `fastapi>=0.109.0` `uvicorn>=0.27.0`。

### Notebook 编写(16.4.3, p621-623)
推荐 **7 部分结构**(以 Markdown 单元分隔):
1. 项目介绍(标题/简介/作者信息)。
2. 环境配置:`!pip install -q hello-agents[all]`,导入 `from hello_agents import SimpleAgent, HelloAgentsLLM`、`from hello_agents.tools import BaseTool`,`load_dotenv()` 加载环境变量。
3. 工具定义:继承 `BaseTool`,定义 `name`、`description`、`run(self, query: str) -> str`。
4. 智能体构建:`llm = HelloAgentsLLM()`,`agent = SimpleAgent(name=..., llm=llm, system_prompt=...)`,`agent.add_tool(CustomTool())`。
5. 功能演示:多个 `agent.run("用户问题")` 示例。
6. 高级功能(可选)。
7. 总结与展望(实现的功能/遇到的挑战/未来改进)。

### 测试项目(16.4.4, p623)
提交前自检清单:代码能正常运行无报错、README 完整、requirements 完整、有使用示例、关键代码有注释、性能符合预期、有错误异常处理、目录结构和文件命名规范。

### 大文件处理指南(16.4.5, p623-625)——**重要**
- 文件大小限制:单项目总大小**建议不超过 5MB**;禁止直接提交大视频/数据集/模型文件。
- 三种处理方式:
  1. **外部链接(推荐)**:大文件传外部平台,README 给链接。推荐平台——数据集(百度网盘/Google Drive/Kaggle/HuggingFace Datasets)、视频(B站/YouTube/腾讯视频)、模型(HuggingFace Models/ModelScope)、图片(GitHub Issues 图床)。
  2. **单独资源仓库**:资源多时建 `项目名-resources` 仓库,README 说明克隆方式。
  3. **示例数据**:仓库只放小规模示例数据(如 `data/sample.csv` 100 条记录,完整数据集给外链)。

## 16.5 提交 Pull Request(p625-627)

提交代码到 GitHub(16.5.1):`git status` → `git add .`(或 `git add co-creation-projects/用户名-项目名/`)→ `git commit -m "feat:..."` → `git push origin feature/项目名`。
**提交类型规范(Conventional Commits)**:`feat`(新功能,毕业项目用此)、`fix`(修 bug)、`docs`(文档)、`style`(格式)、`refactor`(重构)、`test`(测试)、`chore`(构建/杂项)。

创建 PR(16.5.2):在 Fork 仓库点 Pull requests → New pull request;Base 选 `datawhalechina/hello-agents` 的 `main`,Head 选你的 fork 的 `feature/项目名`。
**PR 标题统一格式**:`[毕业设计]项目名称:简短描述`,如 `[毕业设计]CodeReviewAgent:智能代码审查助手`、`[毕业设计]StudyBuddy:AI学习助手`、`[毕业设计]DataAnalyst:智能数据分析师`。PR 描述模板含:项目信息、项目简介、核心功能、技术亮点、演示效果、自检清单、其他说明。

响应 Review 意见(16.5.3, p627):查看 reviewer 评论 → 改代码 → `git commit -m "fix:根据 review 意见修改..."` → `git push` → 在 GitHub 回复 reviewer 说明修改。

## 16.6 示范项目 CodeReviewAgent 完整代码(p628-633)

项目信息:作者 @jjyaoao,路径 `co-creation-projects/jjyaoao-CodeReviewAgent/`。结构含 `README.md`、`requirements.txt`、`main.ipynb`、`.env.example`、`.gitignore`、`data/sample_code.py`、`outputs/review_report.md`。

**核心代码思路**(`main.ipynb`,p628-631):
- 导入:`from hello_agents import SimpleAgent, HelloAgentsLLM, ToolRegistry`、`from hello_agents.tools import Tool, ToolParameter`、`import ast`。
- LLM 配置(环境变量):`LLM_MODEL_ID="Qwen/Qwen2.5-72B-Instruct"`、`LLM_API_KEY=...`、`LLM_BASE_URL="https://api-inference.modelscope.cn/v1/"`、`LLM_TIMEOUT="60"`(ModelScope 推理 API)。
- **工具1 `CodeAnalysisTool(Tool)`**:`name="code_analysis"`,用 Python `ast` 模块静态分析——`ast.parse(code)` 得 AST,`ast.walk` 遍历统计 `FunctionDef`(函数)、`ClassDef`(类),返回 dict {函数数量、类数量、代码行数、函数列表、类列表};捕获 `SyntaxError`。`get_parameters` 返回 `ToolParameter(name="code", type="string", required=True)`。
- **工具2 `StyleCheckTool(Tool)`**:`name="style_check"`,检查是否符合 **PEP8**——逐行检查行长 >79 字符报"超过79个字符"、缩进非 [0,4,8,12] 报"缩进不规范",无问题返回"代码风格良好,符合PEP8规范"。
- 注册:`tool_registry = ToolRegistry()`,`register_tool(CodeAnalysisTool())` + `register_tool(StyleCheckTool())`。
- 智能体:`agent = SimpleAgent(name="代码审查智能体", llm=llm, system_prompt=system_prompt, tool_registry=tool_registry)`。系统提示词:扮演经验丰富的代码审查专家,工作流程——①用 `code_analysis` 分析结构 ②用 `style_check` 检查风格 ③基于结果生成详细审查报告(代码结构概述、风格问题、潜在 bug、性能优化建议、最佳实践建议),用 Markdown 格式输出。
- 运行:读 `data/sample_code.py` → `agent.run(f"请审查...{sample_code}...")` → 写入 `outputs/review_report.md`。

技术栈(README,p631-632):HelloAgents(SimpleAgent + ToolRegistry)、Python AST 模块(代码分析)、ModelScope API(Qwen2.5-72B 模型)。两种 LLM 配置方式:`.env` 文件 或 直接在 Notebook 改环境变量(项目预置 ModelScope API 可直接运行)。

## 16.7 总结与展望(p633)

完成毕业设计后掌握:多智能体系统设计与开发全流程、用 HelloAgents 各种功能和智能体范式、自定义工具扩展、Git/GitHub 开源协作、编写工程文档。

后续学习方向:拓展技术栈(Web 开发/构建生产应用)、学习数据库实现持久化、学习自适应学习路线、优化项目(加功能/优化性能与用户体验/控制测试与文档)。强调"教是最好的学"——贡献社区帮助他人即帮助自己。

## 金句/洞见

- "学习编程最好的方式不是看教程,而是动手实践。"(16.1.1, p614)—— 全书贯穿的实践第一理念。
- "代码能跑通是基础,代码能被理解才是工程。"(基于 16.4 文档/规范全节精神的概括,(?)非逐字原文)
- "最好的学习方式是动手实践。"(p633)—— 收束全书。
- "这不是终点,而是新的起点。"(p633)—— 全书正文最后的勉励:从第一章的简单智能体到能构建完整多智能体应用,是一段完整学习旅程,AI 的未来有无限可能。

## 与已有 wiki 的关联

- 综合应用前序章节:智能体范式([ch04](./ch04-classic-agent-paradigms.md) ReAct/Plan-and-Solve)、框架([ch07](./ch07-build-your-framework.md) SimpleAgent/Tool/ToolRegistry 的实战收口)、记忆([ch08](./ch08-memory-and-rag.md))、通信协议([ch10](./ch10-agent-communication-protocols.md))。
- 与第 13-15 章实战项目([ch13](./ch13-travel-assistant.md)、[ch14](./ch14-deep-research-agent.md)、[ch15](./ch15-cyber-town.md))同属"应用篇",但本章侧重**工程交付与开源协作流程**而非新技术。
- 代码层面与 [ch07](./ch07-build-your-framework.md) 直接呼应:`SimpleAgent`、`Tool`/`BaseTool`、`ToolRegistry`、`HelloAgentsLLM`、`ToolParameter` 都是 ch07 自建框架的 API,本章是其综合落地示范。
