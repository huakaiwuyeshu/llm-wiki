import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const outDir = __dirname;

const paths = {
  html: path.join(outDir, "handbook-sample.html"),
  pdf: path.join(outDir, "handbook-sample.pdf"),
  preview1: path.join(outDir, "preview-page-1.png"),
  preview2: path.join(outDir, "preview-page-2.png"),
  preview3: path.join(outDir, "preview-page-3.png"),
};

const fontSans = "file:///C:/Windows/Fonts/NotoSansSC-VF.ttf";
const fontSerif = "file:///C:/Windows/Fonts/NotoSerifSC-VF.ttf";

const css = String.raw`
@font-face {
  font-family: "Noto Sans SC Local";
  src: url("${fontSans}") format("truetype");
  font-weight: 100 900;
}

@font-face {
  font-family: "Noto Serif SC Local";
  src: url("${fontSerif}") format("truetype");
  font-weight: 200 900;
}

:root {
  --accent: #2d5f8a;
  --accent-deep: #224b6d;
  --accent-light: #e8f0f7;
  --ink: #1a1a1a;
  --muted: #6b7280;
  --faint: #9ca3af;
  --line: #e5e7eb;
  --soft: #f7f9fb;
  --paper: #ffffff;
  --warn: #f5f0e7;
}

@page {
  size: A4;
  margin: 25mm 28mm 24mm 28mm;
}

@page body {
  @top-left {
    content: "企业业务 Agent 模块解析手册";
    color: #8a94a3;
    font-size: 8.5pt;
  }
  @top-right {
    content: counter(page);
    color: #8a94a3;
    font-size: 8.5pt;
  }
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: "Noto Sans SC Local", "Microsoft YaHei", sans-serif;
  font-size: 10.5pt;
  line-height: 1.62;
  letter-spacing: 0;
}

body {
  counter-reset: page;
}

.page {
  page: body;
  break-after: page;
  min-height: 247mm;
  position: relative;
}

.sheet {
  width: 210mm;
  min-height: 297mm;
}

@media screen {
  body {
    background: #eef2f6;
  }

  .cover,
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 18px auto;
    background-color: var(--paper);
    box-shadow: 0 16px 48px rgba(28, 42, 58, 0.16);
  }

  .page {
    padding: 25mm 28mm 24mm 28mm;
  }

  .page::before {
    content: "企业业务 Agent 模块解析手册";
    position: absolute;
    left: 28mm;
    top: 10mm;
    color: #8a94a3;
    font-size: 8.5pt;
  }

  .page::after {
    content: "";
    position: absolute;
    right: 28mm;
    top: 10mm;
    color: #8a94a3;
    font-size: 8.5pt;
  }
}

.cover {
  page: cover;
  min-height: 297mm;
  padding: 33mm 31mm 28mm 31mm;
  display: grid;
  grid-template-rows: 1fr auto;
  background:
    linear-gradient(90deg, rgba(45, 95, 138, 0.08) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, rgba(45, 95, 138, 0.08) 0 1px, transparent 1px 100%);
  background-size: 13mm 13mm;
}

@media print {
  .page {
    min-height: auto;
  }
}

@page cover {
  size: A4;
  margin: 0;
}

.cover::before {
  content: "";
  position: absolute;
  left: 31mm;
  top: 28mm;
  width: 42mm;
  height: 4px;
  background: var(--accent);
}

.cover-main {
  align-self: center;
  max-width: 132mm;
}

.kicker {
  color: var(--accent);
  font-weight: 700;
  font-size: 10.5pt;
  letter-spacing: 0.04em;
  margin-bottom: 15mm;
}

.cover h1 {
  margin: 0;
  color: #111827;
  font-family: "Noto Serif SC Local", "Noto Sans SC Local", serif;
  font-weight: 800;
  font-size: 30pt;
  line-height: 1.24;
  letter-spacing: 0;
}

.cover .subtitle {
  margin-top: 11mm;
  max-width: 124mm;
  color: #3f4b5a;
  font-size: 14pt;
  line-height: 1.65;
}

.cover .version {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 13mm;
  padding: 6px 10px;
  border: 1px solid rgba(45, 95, 138, 0.28);
  color: var(--accent-deep);
  background: rgba(232, 240, 247, 0.78);
  font-size: 9.5pt;
  font-weight: 650;
}

.cover-footer {
  display: grid;
  grid-template-columns: 22mm 1fr;
  gap: 8mm;
  align-items: start;
  color: var(--muted);
  font-size: 9.5pt;
  line-height: 1.72;
  border-top: 1px solid var(--line);
  padding-top: 9mm;
}

.cover-footer .label {
  color: var(--accent);
  font-weight: 750;
}

.section-head {
  margin: 0 0 9mm 0;
  padding-top: 5mm;
}

.part-label {
  color: var(--accent);
  font-size: 9.5pt;
  font-weight: 800;
  letter-spacing: 0.03em;
  margin-bottom: 3mm;
}

h2 {
  margin: 0;
  color: #111827;
  font-family: "Noto Serif SC Local", "Noto Sans SC Local", serif;
  font-size: 20pt;
  line-height: 1.28;
  font-weight: 800;
  letter-spacing: 0;
}

h3 {
  margin: 8.5mm 0 3.2mm 0;
  color: #111827;
  font-size: 13pt;
  line-height: 1.38;
  font-weight: 800;
  letter-spacing: 0;
}

h3:first-child {
  margin-top: 0;
}

p {
  margin: 0 0 3.6mm 0;
}

strong {
  font-weight: 800;
}

.lead {
  margin: 0 0 7.5mm 0;
  padding: 4.5mm 5mm 4.8mm 5.5mm;
  background: var(--accent-light);
  border-left: 4px solid var(--accent);
  color: #26384a;
  font-size: 11.2pt;
  line-height: 1.72;
}

.quote {
  margin: 5.5mm 0 5.8mm 0;
  padding: 4.1mm 5mm 4.3mm 5mm;
  background: #f6f9fc;
  border-left: 4px solid var(--accent);
  color: #20384f;
  font-size: 10.8pt;
  line-height: 1.62;
}

.quote .quote-label {
  display: block;
  margin-bottom: 1.5mm;
  color: var(--accent);
  font-size: 8.4pt;
  font-weight: 800;
}

ul {
  margin: 0 0 4.5mm 0;
  padding: 0;
  list-style: none;
}

li {
  position: relative;
  margin: 0 0 2.5mm 0;
  padding-left: 5.5mm;
}

li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 2.4mm;
  height: 2px;
  background: var(--accent);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 4.8mm 0 6mm 0;
  font-size: 9.3pt;
  line-height: 1.48;
  break-inside: avoid;
}

caption {
  caption-side: top;
  text-align: left;
  margin-bottom: 2.5mm;
  color: var(--accent-deep);
  font-weight: 800;
  font-size: 9.8pt;
}

thead th {
  background: #f3f6f9;
  color: #26384a;
  border-top: 1.2px solid #b9c8d7;
  border-bottom: 1.2px solid #b9c8d7;
  font-weight: 800;
}

th,
td {
  padding: 3mm 3.2mm;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

tbody tr:last-child td {
  border-bottom: 1.2px solid #cbd5e1;
}

td:first-child,
th:first-child {
  width: 29%;
}

.criteria {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4mm;
  margin-top: 4.8mm;
}

.criteria-item {
  min-height: 22mm;
  padding: 4mm 4.3mm;
  border: 1px solid var(--line);
  background: #fbfcfd;
}

.criteria-item.good {
  border-color: rgba(45, 95, 138, 0.38);
  background: rgba(232, 240, 247, 0.55);
}

.criteria-mark {
  display: block;
  margin-bottom: 1.6mm;
  color: var(--accent);
  font-weight: 850;
  font-size: 9pt;
}

.criteria-title {
  display: block;
  margin-bottom: 1.4mm;
  font-weight: 800;
  color: #111827;
}

.criteria-text {
  color: #3f4b5a;
  font-size: 9.2pt;
  line-height: 1.52;
}

.muted-note {
  margin-top: 4mm;
  color: var(--muted);
  font-size: 9pt;
  line-height: 1.55;
}

.split {
  display: grid;
  grid-template-columns: 1.03fr 0.97fr;
  gap: 8mm;
  align-items: start;
}

.mini-case {
  margin: 6mm 0 0 0;
  padding: 4.5mm;
  background: #fbfcfd;
  border: 1px solid var(--line);
}

.mini-case-title {
  margin-bottom: 2mm;
  color: var(--accent-deep);
  font-weight: 800;
  font-size: 9.6pt;
}

.mini-case p {
  margin-bottom: 0;
  color: #3f4b5a;
  font-size: 9.3pt;
  line-height: 1.56;
}

.footer-mark {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-top: 1px solid var(--line);
  color: #9aa3af;
  font-size: 8.4pt;
  padding-top: 3mm;
}

.page:last-child {
  break-after: auto;
}
`;

const html = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>企业业务 Agent 模块解析手册 - 样张</title>
  <style>${css}</style>
</head>
<body>
  <section class="cover">
    <div class="cover-main">
      <div class="kicker">内部学习稿 · v2.0 样张</div>
      <h1>企业业务 Agent<br>模块解析手册</h1>
      <div class="subtitle">从普通聊天机器人，到可控、可复盘、可持续沉淀的业务 Agent</div>
      <div class="version">Agent 模块解析增强版</div>
    </div>
    <div class="cover-footer">
      <div class="label">适用对象</div>
      <div>产品经理、业务负责人、运营、商务、技术支持</div>
      <div class="label">示例业务</div>
      <div>API 接入与分析 Agent</div>
      <div class="label">样张范围</div>
      <div>封面 + Part 1 前两页，重点验证中文排版、留白、表格和 callout 视觉方向</div>
    </div>
  </section>

  <section class="page">
    <header class="section-head">
      <div class="part-label">PART 1</div>
      <h2>什么是 Agent + Agent vs Workflow</h2>
    </header>

    <p class="lead">先讲清楚 Agent 的基本概念，再讲它和 Workflow 的分水岭。读者不需要先懂技术，只需要先抓住一个判断：Agent 的价值不在于“回答得像人”，而在于能围绕目标持续感知、判断和行动。</p>

    <h3>Agent 的四要素</h3>
    <p>智能体(Agent)是任何能通过<strong>传感器(Sensors)</strong>感知<strong>环境(Environment)</strong>、并自主地通过<strong>执行器(Actuators)</strong>采取<strong>行动(Action)</strong>以达成特定目标的实体。四要素中，<strong>自主性(Autonomy)</strong>是关键所在，不是被动响应刺激或执行预设指令，而是基于感知和内部状态<strong>独立决策</strong>。</p>

    <p>举个例子：API 接入场景的 Agent，它的环境是“三方接入诉求、API 文档、日志系统、凭证平台”，传感器是“用户输入、文档检索、日志查询”，执行器是“追问、生成排查建议、标记任务状态”，自主性体现在“根据用户回答动态判断下一步该追问什么、该调哪个 Skill”。</p>

    <h3>自主性是分水岭：Agent vs Workflow</h3>
    <p>这是 Agent 和 Workflow 的本质区别：</p>
    <ul>
      <li><strong>Workflow</strong>(工作流)是预先定义的结构化编排，如费用报销审批：提交→部门审批→财务审批→打款。每一步、每个分支都写死。Workflow 是<strong>让 AI 按部就班地执行指令</strong>。</li>
      <li><strong>Agent</strong>(智能体)是以 LLM 为“大脑”的目标导向自主系统。你告诉它目标“帮三方排查签名失败”，它自己决定先追问什么信息、再调哪个 Skill、要不要查文档。Agent 是<strong>赋予 AI 自由度去自主达成目标</strong>。</li>
    </ul>

    <div class="quote">
      <span class="quote-label">核心判断</span>
      <strong>Workflow 是让 AI 按部就班地执行指令，而 Agent 则是赋予 AI 自由度去自主达成目标。</strong>
    </div>

    <p>Agent 的核心价值 = 基于实时信息进行动态推理和决策。同一个“签名失败”问题，Agent 可能因为用户回答不同，走出完全不同的排查路径，这在固定 Workflow 里做不到。</p>

    <div class="footer-mark">样张 · 版式方向验证</div>
  </section>

  <section class="page">
    <h3>LLM Agent 和传统 Agent 的对比</h3>
    <table>
      <caption>表 1 · 传统智能体 vs LLM 驱动智能体</caption>
      <thead>
        <tr>
          <th>维度</th>
          <th>传统智能体</th>
          <th>LLM 驱动智能体</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>核心引擎</strong></td>
          <td>显式编程的逻辑系统</td>
          <td>预训练模型的推理引擎</td>
        </tr>
        <tr>
          <td><strong>知识来源</strong></td>
          <td>工程师预定义规则、算法、知识库</td>
          <td>海量非结构化数据间接学习、内化</td>
        </tr>
        <tr>
          <td><strong>处理指令</strong></td>
          <td>结构化、精确的命令</td>
          <td>高层级、模糊的自然语言</td>
        </tr>
        <tr>
          <td><strong>工作模式</strong></td>
          <td>确定性、可预测</td>
          <td>概率性、生成式</td>
        </tr>
        <tr>
          <td><strong>泛化/适应性</strong></td>
          <td>弱，局限于预设框架</td>
          <td>强，具备涌现能力</td>
        </tr>
        <tr>
          <td><strong>开发范式</strong></td>
          <td>规则设计、算法编程、知识工程</td>
          <td>模型训练、提示工程、微调</td>
        </tr>
      </tbody>
    </table>

    <p>LLM Agent 的三大工作特征(以旅行助手为例)：① <strong>规划与推理</strong>，把“去北京玩三天”分解为订票→订酒店→规划路线；② <strong>tool use</strong>，识别信息缺口主动调工具，如查天气、查航班；③ <strong>动态修正</strong>，用户说“不想去故宫”，把它当新约束重新规划。</p>

    <h3>何时才值得上 Agent?</h3>
    <p><strong>任务规则固定、不需多步推理时，传统软件 + 一次 LLM 调用就够；Agent 只在“任务多步、依赖判断、流程会变”时才划算。</strong></p>

    <div class="criteria">
      <div class="criteria-item">
        <span class="criteria-mark">不值得</span>
        <span class="criteria-title">把用户输入翻译成英文</span>
        <div class="criteria-text">直接调一次翻译 API 即可，不需要 Agent，也不需要引入长期状态和复杂决策。</div>
      </div>
      <div class="criteria-item good">
        <span class="criteria-mark">值得</span>
        <span class="criteria-title">排查三方接入的签名失败问题</span>
        <div class="criteria-text">需要多轮追问、动态判断和不同排查路径。可能是参数顺序错，也可能是编码、密钥或时间戳问题。</div>
      </div>
    </div>

    <div class="mini-case">
      <div class="mini-case-title">PM 读法</div>
      <p>判断一个场景要不要做 Agent，不是看“能不能接上大模型”，而是看它是否存在多步判断、信息缺口和路径变化。如果没有这些复杂性，把 AI 当一次能力调用会更稳。</p>
    </div>

    <div class="footer-mark">样张 · 表格与信息密度验证</div>
  </section>
</body>
</html>`;

fs.writeFileSync(paths.html, html, "utf8");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await page.goto(`file://${paths.html.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.pdf({
  path: paths.pdf,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});

const pageCount = await page.locator(".cover, .page").count();
for (let i = 0; i < pageCount; i += 1) {
  const target = page.locator(".cover, .page").nth(i);
  await target.screenshot({ path: paths[`preview${i + 1}`], type: "png" });
}

await browser.close();
console.log(JSON.stringify(paths, null, 2));
