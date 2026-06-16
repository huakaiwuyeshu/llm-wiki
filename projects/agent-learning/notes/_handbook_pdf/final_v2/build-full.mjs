import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function requireRuntime(name, fallback) {
  try {
    return require(name);
  } catch {
    return require(fallback);
  }
}

const runtimeRoot =
  "C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const { chromium } = requireRuntime(
  "playwright",
  `${runtimeRoot}/.pnpm/playwright@1.60.0/node_modules/playwright`
);
const { PDFDocument } = requireRuntime(
  "pdf-lib",
  `${runtimeRoot}/.pnpm/pdf-lib@1.17.1/node_modules/pdf-lib`
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const sourceMdPath = path.join(repoRoot, "notes/企业业务Agent手册-v2-正文.md");
const flowchartPath = path.join(repoRoot, "notes/_handbook_pdf/flowchart-data.json");

const out = {
  coverHtml: path.join(__dirname, "handbook-cover.html"),
  bodyHtml: path.join(__dirname, "handbook-body.html"),
  coverPdf: path.join(__dirname, "handbook-cover.pdf"),
  bodyPdf: path.join(__dirname, "handbook-body.pdf"),
  finalPdf: path.join(__dirname, "enterprise-agent-handbook-v2.pdf"),
  previewCover: path.join(__dirname, "preview-cover.png"),
  previewBodyTop: path.join(__dirname, "preview-body-top.png"),
  previewMainChart: path.join(__dirname, "preview-main-chart.png"),
};

const fontSans = "file:///C:/Windows/Fonts/NotoSansSC-VF.ttf";
const fontSerif = "file:///C:/Windows/Fonts/NotoSerifSC-VF.ttf";
const footerMascotLogoDataUri = `data:image/svg+xml;base64,${fs
  .readFileSync(path.join(__dirname, "assets/footer-mascot-logo.svg"))
  .toString("base64")}`;

const md = fs.readFileSync(sourceMdPath, "utf8");
const chartData = JSON.parse(fs.readFileSync(flowchartPath, "utf8"));

const coverMeta = {
  title: "企业业务 Agent\n模块解析手册",
  subtitle: "从普通聊天机器人，到可控、可复盘、可持续沉淀的业务 Agent",
  audience: "产品经理、业务负责人、运营、商务、技术支持",
  example: "API 接入与分析 Agent",
  version: "Agent 模块解析增强版 / 内部学习稿",
  author: "Felixlan",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(value) {
  let html = escapeHtml(value)
    .replaceAll("普通聊天天机器人", "普通聊天机器人")
    .replaceAll("可转线流沉", "可持续沉淀");

  const codeSpans = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const id = codeSpans.length;
    codeSpans.push(`<code>${code}</code>`);
    return `@@CODE_${id}@@`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replaceAll("❌", '<span class="tag bad">不值得</span>');
  html = html.replaceAll("✅", '<span class="tag good">值得</span>');
  html = html.replace(/@@CODE_(\d+)@@/g, (_, id) => codeSpans[Number(id)]);
  return html;
}

function slugify(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function stripInline(text) {
  return text.replace(/\*\*/g, "").replace(/`/g, "");
}

function isTableStart(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isListLine(line) {
  return /^\s*(?:[-*]\s+|\d+\.\s+)/.test(line);
}

function isSpecialLine(line) {
  return (
    /^#{2,4}\s+/.test(line) ||
    /^---\s*$/.test(line) ||
    /^>\s?/.test(line) ||
    /^```\s*$/.test(line) ||
    isTableStart(line) ||
    isListLine(line)
  );
}

function parseTable(lines) {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  const header = rows[0] ?? [];
  const body = rows.slice(2);
  return { header, body };
}

function tableCaption(header) {
  const key = header.join("|");
  if (key.includes("以前 · 调一次 API 的产品")) return "对比 · 调一次 API 的产品 vs Agent 产品";
  if (key.includes("传统智能体")) return "表 1 · 传统智能体 vs LLM 驱动智能体";
  if (key.includes("业务特征")) return "表 2 · 业务特征、Agent 需求与模块映射";
  if (key.includes("阶段") && key.includes("特征") && key.includes("适用场景")) return "四阶段演进概览";
  if (key.includes("LLM 适合做什么")) return "LLM 放在哪里：适合做什么 vs 不应独自做什么";
  if (key.includes("一期建议")) return "表 3 · 一期范围建议";
  if (key.includes("验收场景")) return "表 4 · API 接入验收场景";
  if (key.includes("Agent 做什么")) return "表 5 · 签名失败案例链路";
  return "";
}

function renderTable(table) {
  const caption = tableCaption(table.header);
  const columnCount = table.header.length;
  const className = ["data-table", `cols-${columnCount}`, columnCount >= 3 ? "wide" : ""].join(" ");
  const head = table.header.map((cell) => `<th>${inline(cell)}</th>`).join("");
  const body = table.body
    .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="${className}">${caption ? `<caption>${caption}</caption>` : ""}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderList(items, ordered) {
  const tag = ordered ? "ol" : "ul";
  const html = items
    .map(({ text, indent }) => {
      const klass = indent > 0 ? ` class="indent-${Math.min(indent, 2)}"` : "";
      return `<li${klass}>${inline(text)}</li>`;
    })
    .join("");
  return `<${tag}>${html}</${tag}>`;
}

function renderMetaCard(items) {
  const rows = items
    .map(({ text }) => {
      const parts = text.split(":");
      const label = parts.shift() || "";
      const value = parts.join(":") || text;
      return `<div class="meta-label">${inline(label)}</div><div class="meta-value">${inline(value)}</div>`;
    })
    .join("");
  return `<section class="meta-card"><h3>版本信息</h3><div class="meta-grid">${rows}</div></section>`;
}

function renderQuote(lines) {
  const text = cleanLeadLabel(lines.map((line) => line.replace(/^>\s?/, "")).join(" "));
  return `<aside class="quote">${inline(text)}</aside>`;
}

function cleanLeadLabel(text) {
  let value = text.trim();
  value = value.replace(/^\s*[-*]\s+/, "");
  value = value.replace(
    /^\*\*(?:金句|一句话|设计逻辑|核心启发)\*\*\s*[：:]\s*/u,
    ""
  );
  value = value.replace(/^\s*["“]([\s\S]+?)["”]\s*$/u, "$1");
  return value;
}

function isLeadCallout(text) {
  return /^\s*(?:[-*]\s+)?\*\*(?:金句|一句话|设计逻辑|核心启发)\*\*\s*[：:]/u.test(text.trim());
}

function renderParagraph(text) {
  const cleaned = cleanLeadLabel(text);
  if (isLeadCallout(text)) return `<aside class="quote">${inline(cleaned)}</aside>`;
  return `<p>${inline(cleaned)}</p>`;
}

function renderHeading(level, text, state) {
  const clean = stripInline(text).trim();
  const id = slugify(clean) || `section-${state.headingCount++}`;
  if (level === 2) {
    const partMatch = clean.match(/^Part\s+(\d+)/i);
    const part = partMatch ? `PART ${partMatch[1]}` : "SECTION";
    const title = clean.replace(/^Part\s+\d+\s*[:：]\s*/i, "");
    const firstClass = state.h2Count === 0 ? " first-part" : "";
    const finalClass = partMatch?.[1] === "8" ? " final-part" : "";
    state.h2Count += 1;
    return `<section class="part-start${firstClass}${finalClass}" id="${id}"><div class="part-label">${part}</div><h2>${inline(title)}</h2></section>`;
  }
  if (level === 3) return `<h3 id="${id}">${inline(clean)}</h3>`;
  return `<h4 id="${id}">${inline(clean)}</h4>`;
}

function labelLines(label) {
  return String(label).split("\n").map((line) => escapeHtml(line));
}

function svgText(x, y, lines, options = {}) {
  const {
    anchor = "middle",
    size = 17,
    weight = 700,
    fill = "#1a1a1a",
    lineHeight = 22,
    klass = "",
  } = options;
  const tspans = lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`)
    .join("");
  return `<text class="${klass}" x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}">${tspans}</text>`;
}

function figure(title, number, svg, note = "") {
  return `<figure class="chart" id="figure-${number}">${svg}<figcaption>图 ${number} · ${title}${note ? `<span>${note}</span>` : ""}</figcaption></figure>`;
}

function renderOpeningSpread() {
  return `<section class="opening opening-a" id="part-0-opening">
    <div class="opening-kicker">PART 0</div>
    <h2>为什么是 Agent，为什么是现在</h2>
    <p class="opening-deck">在讲“Agent 由哪几块组成”之前，先回答每个 PM 心里的三个问题：它和以前做的 AI 产品到底差在哪？为什么偏偏是现在？作为 PM，我的活儿会变成什么样？</p>
    <aside class="opening-thesis">
      <p>过去我们做的产品，是<strong>把流程写死、让用户照着点</strong>。<br>Agent 第一次让我们能做<strong>「给个目标，让它自己想办法办成」</strong>的产品。</p>
      <span>这不是又一个技术名词，而是产品形态本身变了：从“设计每一步操作”，变成“设计一个会自己决策的员工”。</span>
    </aside>
    <div class="opening-question">
      <span>Q1</span>
      <h3>它和“普通调了 AI 的产品”差在哪？</h3>
    </div>
    <div class="opening-vs">
      <div class="opening-card muted">
        <div class="card-kicker">以前 · 调一次 API 的产品</div>
        <h4>你设计好每一步，AI 只是其中一环</h4>
        <ul>
          <li><strong>流程是你写死的</strong>：点 A → 填 B → 提交 C，路径固定</li>
          <li><strong>AI 只做一件小事</strong>：翻译、总结、分类</li>
          <li><strong>不会用工具、没有记性</strong>：每次调用都是一锤子买卖</li>
          <li>出错是确定的：同样输入通常同样输出，好测</li>
        </ul>
      </div>
      <div class="opening-card accent">
        <div class="card-kicker">现在 · Agent 产品</div>
        <h4>你给目标，它自己拆步骤、调工具、办成</h4>
        <ul>
          <li><strong>流程是它自己决定的</strong>：同一目标可能走不同路径</li>
          <li><strong>会动手</strong>：查库、调接口、改文件，不只是“说”</li>
          <li><strong>有记性、能多步</strong>：查了 A 才知道下一步该查 B</li>
          <li>结果是概率的：这正是强大之处，也是要“上护甲”的原因</li>
        </ul>
      </div>
    </div>
  </section>
  <section class="opening opening-b">
    <div class="opening-question">
      <span>Q2</span>
      <h3>为什么偏偏是现在能做了？</h3>
    </div>
    <div class="why-grid">
      <div class="why-card"><b>① 模型终于“听得懂指令、还会用工具”了</b><p>三年前模型只会续写文本；现在能稳定理解任务、输出结构化工具调用。这是 Agent 能“动手”的前提。</p></div>
      <div class="why-card"><b>② 工程实践摸索出“让它不失控”的办法</b><p>决策与执行分离、流程固化、运行时护甲逐渐成熟，Agent 才从 demo 惊艳走到敢上生产。</p></div>
      <div class="why-card"><b>③ 它不是“会过去的风口”，而是新的产品底座</b><p>它解决的是流程多变、依赖判断、需要边做边调整的任务。这类需求一直都在，只是过去只能靠人。</p></div>
    </div>
    <aside class="opening-punch">模型负责猜，工程负责兜底。两件事同时成熟，才有了今天能落地的 Agent。</aside>
    <div class="opening-question q3">
      <span>Q3</span>
      <h3>那作为 PM，我的活儿会变成什么样？</h3>
    </div>
    <div class="pm-shift">
      <div><em>以前</em><p>画流程图，定义每一步用户怎么点</p></div><strong>→</strong><div><em>现在</em><p>定义目标和边界：它能做什么、绝不能做什么</p></div>
      <div><em>以前</em><p>写清楚每个按钮的交互逻辑</p></div><strong>→</strong><div><em>现在</em><p>写 SOP / 划工具权限：把业务经验喂给 Agent</p></div>
      <div><em>以前</em><p>功能测通了就能上</p></div><strong>→</strong><div><em>现在</em><p>盯成功率和 badcase：概率系统要持续观测、迭代</p></div>
      <div><em>以前</em><p>需求评审时和开发对功能</p></div><strong>→</strong><div><em>现在</em><p>评审时拍安全红线：高危动作要不要人工审核</p></div>
    </div>
    <aside class="opening-thesis closing">
      <p>PM 的核心工作没消失，只是<strong>从“设计操作”上移到了“设计判断与边界”</strong>。</p>
      <span>接下来再进入 Agent 是什么、怎么工作，以及企业里为什么最终会收敛成混合架构。</span>
    </aside>
  </section>`;
}

function agentLoopSvg() {
  return `<svg viewBox="0 0 900 360" role="img" aria-label="智能体与环境交互的基本循环">
    ${svgDefs()}
    <rect x="36" y="38" width="560" height="210" rx="22" fill="#E8F0F7" stroke="#8FB0CA" stroke-width="1.5" />
    <text x="316" y="70" text-anchor="middle" font-size="19" font-weight="800" fill="#111827">Agent 智能体</text>

    <rect x="70" y="112" width="138" height="66" rx="10" class="node endpoint" />
    ${svgText(139, 140, ["Perception", "感知"], { size: 13, lineHeight: 17 })}

    <rect x="298" y="82" width="292" height="126" rx="12" fill="#DDE9F7" stroke="#7EA2C1" stroke-width="1.4" />
    <text x="333" y="151" font-size="15" font-weight="800" fill="#111827">Thought</text>
    <text x="333" y="170" font-size="13" font-weight="700" fill="#2D5F8A">思考决策</text>
    <rect x="422" y="82" width="168" height="63" rx="10" fill="#EAF2FA" stroke="#7EA2C1" stroke-width="1.2" />
    ${svgText(506, 120, ["Planning", "规划"], { size: 13, lineHeight: 17 })}
    <rect x="422" y="145" width="168" height="63" rx="10" fill="#EAF2FA" stroke="#7EA2C1" stroke-width="1.2" />
    ${svgText(506, 183, ["Tool Selection", "工具选择"], { size: 13, lineHeight: 17 })}

    <rect x="702" y="82" width="160" height="126" rx="18" fill="#EEF6F1" stroke="#86AE84" stroke-width="1.6" />
    <text x="782" y="116" text-anchor="middle" font-size="17" font-weight="800" fill="#111827">Environment</text>
    <text x="782" y="137" text-anchor="middle" font-size="13" font-weight="700" fill="#3A7A55">环境</text>
    <ellipse cx="782" cy="166" rx="67" ry="30" fill="none" stroke="#86AE84" stroke-width="1.5" stroke-dasharray="5 5" />
    ${svgText(782, 163, ["State Change", "状态变化"], { size: 12.5, lineHeight: 16 })}

    <path d="M 208 145 L 292 145" class="edge" marker-end="url(#arrow)" />
    <path d="M 596 145 L 694 145" class="edge" marker-end="url(#arrow)" />
    <text x="642" y="128" text-anchor="middle" font-size="13" font-weight="800" fill="#111827">Action</text>
    <text x="642" y="162" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2D5F8A">行动</text>
    <path d="M 782 208 L 782 278 L 139 278 L 139 181" class="edge back" marker-end="url(#arrow)" />
    <text x="470" y="264" text-anchor="middle" font-size="13" font-weight="800" fill="#111827">Observation 观察反馈</text>
  </svg>`;
}

function ordinaryVsEnterpriseSvg() {
  return `<svg viewBox="0 0 860 350" role="img" aria-label="普通聊天与企业 Agent 对比">
    ${svgDefs()}
    <rect x="24" y="30" width="372" height="284" rx="12" class="panel" />
    <rect x="464" y="30" width="372" height="284" rx="12" class="panel accent-panel" />
    ${svgText(210, 72, ["普通聊天"], { size: 20, fill: "#1A1A1A" })}
    ${svgText(650, 72, ["企业业务 Agent"], { size: 20, fill: "#1A1A1A" })}
    ${stepBox(85, 120, 250, 48, "理解问题")}
    ${stepBox(85, 184, 250, 48, "生成回答")}
    ${stepBox(85, 248, 250, 48, "结束对话")}
    ${stepBox(508, 105, 284, 42, "识别任务")}
    ${stepBox(508, 155, 284, 42, "校验参数")}
    ${stepBox(508, 205, 284, 42, "调用 Skill / 工具")}
    ${stepBox(508, 255, 284, 42, "状态、审计、人工确认")}
    <path d="M 210 168 L 210 182" class="edge small" marker-end="url(#arrow)" />
    <path d="M 210 232 L 210 246" class="edge small" marker-end="url(#arrow)" />
    <path d="M 650 147 L 650 153" class="edge small" marker-end="url(#arrow)" />
    <path d="M 650 197 L 650 203" class="edge small" marker-end="url(#arrow)" />
    <path d="M 650 247 L 650 253" class="edge small" marker-end="url(#arrow)" />
    <text x="210" y="329" text-anchor="middle" font-size="13" fill="#6B7280">回答像不像</text>
    <text x="650" y="329" text-anchor="middle" font-size="13" fill="#2D5F8A" font-weight="800">能否按流程稳定推进</text>
  </svg>`;
}

function workflowVsAgentSvg() {
  return fs.readFileSync(path.join(__dirname, "assets/workflow-vs-agent-comparison-v2.svg"), "utf8");
}

function reactPlanRuntimeSvg() {
  return fs.readFileSync(path.join(__dirname, "assets/react-plan-runtime.svg"), "utf8");
}

function controlPendulumBlock() {
  return `<section class="pendulum-block">
    <div class="block-heading"><span>控制权钟摆</span><strong>为什么企业最终收敛到混合架构</strong></div>
    <div class="pendulum-flow">
      <div class="pendulum-node rules"><b>早期 · 全用规则</b><p>流程写死，稳定但死板；新场景要改规则，流程变化要发版。</p></div>
      <div class="pendulum-arrow">→</div>
      <div class="pendulum-node llm"><b>中期 · 全交 LLM</b><p>灵活但失控；模型会自作聪明、跳过安全检查、触碰敏感凭证。</p></div>
      <div class="pendulum-arrow">→</div>
      <div class="pendulum-node hybrid"><b>收敛 · 混合架构</b><p>确定部分交给 Workflow / Schema / 权限；不确定部分交给 Agent 处理。</p></div>
    </div>
    <aside class="pendulum-conclusion">最终稳定在<strong>「Workflow 负责边界，Agent 负责弹性」</strong>。能力可以一直长，但控制权必须留在确定性工程手里。</aside>
  </section>`;
}

function evolutionMatrixBlock() {
  const rows = [
    ["1", "LLM", "地基", "能理解和生成，但无记性、知识静态、不会动手"],
    ["2", "Memory", "知识层", "补“每次调用都失忆”：短期上下文 + 长期持久化"],
    ["3", "RAG", "知识层", "补“不懂私有业务、还会编”：先检索再回答，没依据明说未找到"],
    ["4", "Function Call / MCP", "能力层", "补“只会说不会做”：LLM 输出调用指令，代码负责执行"],
    ["5", "Agent Loop", "质量层", "补“多步任务谁来串”：想 → 做 → 看 → 再决定"],
    ["6", "Skill", "能力层", "补“工具一多就选不准”：渐进式加载 SOP + 工具"],
    ["7", "Multi-Agent", "质量层", "补“单个脑子带不动”：专家协作，成本翻倍，不到必要不拆"],
    ["8", "Harness", "质量层", "补“上线就崩”：容错、限流、工具治理、人工审核、可观测"],
    ["9", "Claw", "形态", "部署形态演进：Agent 跑到电脑上，直接动手并验证"],
  ];
  const body = rows
    .map(([num, name, layer, fix]) => {
      const klass =
        layer === "知识层" ? "knowledge" : layer === "能力层" ? "capability" : layer === "质量层" ? "quality" : "base";
      const pivot = ["4", "5", "8"].includes(num) ? " pivot" : "";
      return `<div class="evo-row${pivot}"><span class="evo-num">${num}</span><span class="evo-name">${name}</span><span class="evo-layer ${klass}">${layer}</span><span class="evo-fix">${fix}</span></div>`;
    })
    .join("");
  return `<section class="evo-matrix">
    <div class="block-heading"><span>九阶段主线</span><strong>每一步都在补上一代的短板</strong></div>
    <div class="evo-table">${body}</div>
    <figcaption class="module-caption">图 4 · 九阶段能力补齐主线</figcaption>
    <div class="layer-summary">
      <div class="layer-card knowledge"><b>知道什么</b><p>② Memory / ③ RAG</p></div>
      <div class="layer-card capability"><b>能做什么</b><p>④ Function Call & MCP / ⑥ Skill</p></div>
      <div class="layer-card quality"><b>怎么做得好</b><p>⑤ Agent Loop / ⑦ Multi-Agent / ⑧ Harness</p></div>
    </div>
  </section>`;
}

function fourStageCardsBlock() {
  const stages = [
    ["第 1 档", "早期 Agent", "聊天 + 工具调用", "适合短链路任务：问一句、调个工具、答一句"],
    ["第 2 档", "工作流 Agent", "流程编排", "适合企业稳定流程：步骤已知，按图执行，可控"],
    ["第 3 档", "自主 Agent", "规划 + 执行", "适合开放复杂任务：自己拆解规划，灵活但要兜底"],
    ["第 4 档", "自进化 Agent", "Skill + Memory", "沉淀经验成资产，越用越懂业务"],
  ];
  const cards = stages
    .map(
      ([step, name, cap, fit]) =>
        `<div class="stage-card"><span>${step}</span><b>${name}</b><em>${cap}</em><p>${fit}</p></div>`
    )
    .join("");
  return `<section class="stage-cards-block">
    <div class="block-heading"><span>选型粗看法</span><strong>按自主度分四档</strong></div>
    <div class="stage-cards">${cards}</div>
    <figcaption class="module-caption">图 5 · 四阶段自主度选型视角</figcaption>
    <div class="axis-note"><span>自主度低</span><i></i><span>自主度高</span></div>
    <aside class="soft-note">九阶段是“能力补齐顺序”，四阶段是“自主度选型视角”。轴不同，位置自然会变；不要纠结顺序，看它解决什么问题。</aside>
  </section>`;
}

function harnessReviewBlock() {
  const rows = [
    ["工具调用失败时，系统会重试 / 纠正 / 降级，而不是直接崩？", "错误恢复"],
    ["有没有最大步数 / token 预算上限，防止死循环烧钱？", "迭代控制"],
    ["长对话会不会超窗变笨？上下文怎么管？", "上下文工程"],
    ["高危工具有没有权限分级和执行前关卡？", "工具治理"],
    ["不可逆动作有没有人工审核闸门？能挡提示注入吗？", "安全防护"],
    ["线上 badcase 能不能回放、归因？日志会不会存敏感信息？", "可观测性"],
  ];
  const checks = rows
    .map(([q, sys]) => `<div class="check-row"><span></span><p>${q}<em>${sys}</em></p></div>`)
    .join("");
  return `<section class="harness-review">
    <div class="block-heading"><span>上线红线</span><strong>六问没答全，就别说“能上线”</strong></div>
    <div class="harness-triad">
      <div><b>怎么不崩？</b><p>错误恢复 / 迭代控制 / 上下文工程</p></div>
      <div><b>怎么不闯祸？</b><p>工具治理 / 安全防护</p></div>
      <div><b>怎么看得见？</b><p>可观测性 / Audit</p></div>
    </div>
    <div class="check-grid">${checks}</div>
    <aside class="soft-note">上线前必须有：工具治理 + 安全防护 + 可观测性。它们管的是“不闯祸”和“出事查得到”。</aside>
  </section>`;
}

function fourStageSvg() {
  const nodes = chartData.chart_3_four_stages.nodes;
  const x = [116, 318, 520, 722];
  const cards = nodes
    .map((node, i) => {
      const lines = labelLines(node.label);
      const meta = node.meta.replace("适用场景:", "");
      return `<g>
        <circle cx="${x[i]}" cy="92" r="9" class="dot" />
        <rect x="${x[i] - 82}" y="124" width="164" height="118" rx="8" class="node" />
        ${svgText(x[i], 156, lines, { size: 15, lineHeight: 21 })}
        <text x="${x[i]}" y="214" text-anchor="middle" font-size="12" fill="#6B7280">${escapeHtml(meta)}</text>
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 840 300" role="img" aria-label="四阶段演进时间轴">
    ${svgDefs()}
    <rect x="28" y="44" width="784" height="220" rx="14" class="chart-bg" />
    <path d="M 116 92 L 722 92" class="timeline" />
    <path d="M 195 92 L 240 92" class="edge small" marker-end="url(#arrow)" />
    <path d="M 397 92 L 442 92" class="edge small" marker-end="url(#arrow)" />
    <path d="M 599 92 L 644 92" class="edge small" marker-end="url(#arrow)" />
    ${cards}
  </svg>`;
}

function nineStageSvg() {
  const stages = [
    ["LLM", "地基", "base"],
    ["记忆", "知识", "knowledge"],
    ["RAG", "知识", "knowledge"],
    ["Function Call / MCP", "能力", "capability"],
    ["Agent Loop", "质量", "quality"],
    ["Skill", "能力", "capability"],
    ["Multi-Agent", "质量", "quality"],
    ["Harness", "质量", "quality"],
    ["Claw", "形态", "base"],
  ];
  const lanes = [
    ["知识", 104, "knowledge"],
    ["能力", 184, "capability"],
    ["质量", 264, "quality"],
  ];
  const boxes = stages
    .map(([name, lane, klass], i) => {
      const laneY = lane === "知识" ? 92 : lane === "能力" ? 172 : lane === "质量" ? 252 : 332;
      const x = 72 + i * 84;
      const y = name === "LLM" || name === "Claw" ? 332 : laneY;
      return `<g>
        <rect x="${x - 36}" y="${y - 24}" width="72" height="48" rx="7" class="stage ${klass}" />
        <text x="${x}" y="${y - 3}" text-anchor="middle" font-size="${name.length > 10 ? 10.5 : 12}" font-weight="800" fill="#1A1A1A">${escapeHtml(name)}</text>
        <text x="${x}" y="${y + 14}" text-anchor="middle" font-size="10" fill="#6B7280">${i + 1}</text>
      </g>`;
    })
    .join("");
  const laneLabels = lanes
    .map(
      ([name, y, klass]) =>
        `<rect x="22" y="${y - 30}" width="74" height="60" rx="8" class="lane ${klass}" /><text x="59" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#2D5F8A">${name}</text>`
    )
    .join("");
  const arrows = stages
    .slice(0, -1)
    .map((_, i) => {
      const x1 = 72 + i * 84 + 39;
      const x2 = 72 + (i + 1) * 84 - 39;
      const y1 = i === 0 || i === 8 ? 332 : stages[i][1] === "知识" ? 92 : stages[i][1] === "能力" ? 172 : 252;
      const y2 =
        i + 1 === 0 || i + 1 === 8
          ? 332
          : stages[i + 1][1] === "知识"
            ? 92
            : stages[i + 1][1] === "能力"
              ? 172
              : 252;
      return `<path d="M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}" class="edge faint" marker-end="url(#arrow)" />`;
    })
    .join("");
  return `<svg viewBox="0 0 860 390" role="img" aria-label="九阶段能力演进">
    ${svgDefs()}
    <rect x="14" y="28" width="832" height="334" rx="14" class="chart-bg" />
    ${laneLabels}
    ${arrows}
    ${boxes}
  </svg>`;
}

function mainPipelineSvg() {
  const flow = chartData.chart_5_main_pipeline.main_flow.nodes;
  const support = chartData.chart_5_main_pipeline.support_layer.items;
  const x = [80, 218, 356, 494, 632, 770];
  const main = flow
    .map((node, i) => {
      const lines = labelLines(node.label);
      if (node.shape === "oval") {
        return `<ellipse cx="${x[i]}" cy="225" rx="54" ry="27" class="node endpoint" />${svgText(x[i], 220, lines, { size: 13, lineHeight: 17 })}`;
      }
      if (node.shape === "diamond") {
        return `<polygon points="${x[i]},185 ${x[i] + 62},225 ${x[i]},265 ${x[i] - 62},225" class="node decision" />${svgText(x[i], 220, lines, { size: 13, lineHeight: 17 })}`;
      }
      return `<rect x="${x[i] - 58}" y="195" width="116" height="60" rx="8" class="node" />${svgText(x[i], 219, lines, { size: 13, lineHeight: 17 })}`;
    })
    .join("");
  const edges = x
    .slice(0, -1)
    .map((value, i) => `<path d="M ${value + 60} 225 L ${x[i + 1] - 64} 225" class="edge" marker-end="url(#arrow)" />`)
    .join("");
  const llmX = [218, 356, 494, 770];
  const llm = chartData.chart_5_main_pipeline.llm_layer.items
    .map((item, i) => `${stepBox(llmX[i] - 48, 72, 96, 42, item.label, "llm-node")}<path d="M ${llmX[i]} 114 L ${llmX[i]} 188" class="edge attach" marker-end="url(#arrow)" />`)
    .join("");
  const supportBoxes = support
    .map((item, i) => {
      const bx = 128 + i * 188;
      const lines = labelLines(item.label);
      return `<rect x="${bx - 72}" y="332" width="144" height="56" rx="8" class="support-node" />${svgText(bx, 352, lines, { size: 13, lineHeight: 17 })}`;
    })
    .join("");
  return `<svg viewBox="0 0 900 430" role="img" aria-label="主链路全景">
    ${svgDefs()}
    <rect x="24" y="38" width="852" height="360" rx="14" class="chart-bg" />
    <text x="54" y="66" font-size="13" font-weight="800" fill="#6B7280">LLM 增强层</text>
    <text x="54" y="173" font-size="13" font-weight="800" fill="#6B7280">业务主流程</text>
    <text x="54" y="315" font-size="13" font-weight="800" fill="#6B7280">支撑与边界</text>
    ${llm}
    ${edges}
    ${main}
    <path d="M 494 265 L 494 304 L 770 304 L 770 253" class="edge attach" marker-end="url(#arrow)" />
    ${supportBoxes}
  </svg>`;
}

function apiChainsSvg() {
  const lanes = [
    ["新 API 接入", ["需求确认", "资料补齐", "凭证准备", "上线检查"]],
    ["联调问题", ["识别问题", "补齐日志", "排查建议", "沉淀案例"]],
    ["单量分析", ["确认口径", "趋势分析", "异常判断", "输出周报"]],
  ];
  const laneSvg = lanes
    .map(([label, steps], row) => {
      const y = 74 + row * 86;
      const stepsSvg = steps
        .map((step, i) => {
          const x = 208 + i * 142;
          return `${stepBox(x - 52, y - 22, 104, 44, step, row === 0 ? "chain-a" : row === 1 ? "chain-b" : "chain-c")}${i < steps.length - 1 ? `<path d="M ${x + 54} ${y} L ${x + 86} ${y}" class="edge small" marker-end="url(#arrow)" />` : ""}`;
        })
        .join("");
      return `<g>
        <rect x="38" y="${y - 26}" width="112" height="52" rx="8" class="lane-title" />
        <text x="94" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#2D5F8A">${escapeHtml(label)}</text>
        ${stepsSvg}
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 820 370" role="img" aria-label="API 接入三条任务链">
    ${svgDefs()}
    <rect x="18" y="28" width="784" height="304" rx="14" class="chart-bg" />
    ${laneSvg}
    <rect x="130" y="294" width="560" height="46" rx="8" class="support-node" />
    <text x="410" y="323" text-anchor="middle" font-size="14" font-weight="800" fill="#1A1A1A">共用底座：Schema / Skill / Task State / Memory / Audit</text>
  </svg>`;
}

function skillLoadingBlock() {
  const steps = [
    ["Advertise", "先知道有哪些 Skill", "只给模型一份目录，每个 Skill 一句话"],
    ["Load", "命中后读取完整 SOP", "确定要用哪个专家，再加载完整手册"],
    ["Read", "需要时读取参考资料", "执行中再查 API 文档、FAQ、案例"],
    ["Run", "必要时运行工具", "按 Skill 里的脚本或接口完成动作"],
  ];
  const cards = steps
    .map(
      ([name, title, desc], i) => `<div class="load-card">
        <span>0${i + 1}</span>
        <b>${name}</b>
        <strong>${title}</strong>
        <p>${desc}</p>
      </div>`
    )
    .join("");
  return `<section class="visual-module skill-load">
    <div class="visual-title"><b>Skill 按需加载</b><span>先看目录，命中后再展开，不把所有手册一次性塞进上下文</span></div>
    <div class="load-steps">${cards}</div>
  </section>`;
}

function taskStateTrackBlock() {
  const states = [
    ["需求确认中", "确认任务类型与目标"],
    ["资料待补充", "缺字段、缺截图、缺日志"],
    ["凭证待生成", "进入高风险前等待确认"],
    ["沙箱联调中", "真实问题持续推进"],
    ["上线前检查中", "跑完清单再放行"],
    ["已上线", "进入监控与复盘"],
    ["暂停 / 阻塞", "等待人补信息或审批"],
  ];
  const items = states
    .map(([name, desc], i) => `<div class="state-node">
      <span>${i + 1}</span>
      <b>${name}</b>
      <p>${desc}</p>
    </div>`)
    .join("");
  return `<section class="visual-module state-track">
    <div class="visual-title"><b>Task State 不是聊天记录</b><span>它记录任务推进到哪一步，让多轮对话不会每次从头开始</span></div>
    <div class="state-grid">${items}</div>
  </section>`;
}

function landingStepsBlock() {
  const steps = [
    ["选场景", "选一个业务闭环，不做万能入口"],
    ["写主流程", "从发起到结束的 Workflow"],
    ["定 Schema", "只保留影响判断的字段"],
    ["整理 Skill", "先覆盖高频 SOP、问答、排查"],
    ["接入 LLM", "做理解和表达增强，保留规则底座"],
    ["验收收集", "用真实问题压测识别、追问、路由和安全"],
    ["沉淀 Memory", "把误判、纠错、重复问题更新回 Skill"],
  ];
  const cards = steps
    .map(([title, desc], i) => `<div class="landing-step">
      <span>${i + 1}</span>
      <b>${title}</b>
      <p>${desc}</p>
    </div>`)
    .join("");
  return `<section class="visual-module landing-roadmap">
    <div class="visual-title"><b>落地七步</b><span>先把一个核心闭环跑通，再扩成通用底座</span></div>
    <div class="roadmap-grid">${cards}</div>
  </section>`;
}

function stepBox(x, y, width, height, label, klass = "") {
  const lines = labelLines(label);
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="7" class="step ${klass}" />${svgText(x + width / 2, y + height / 2 - (lines.length - 1) * 8 + 5, lines, { size: 13, lineHeight: 17 })}`;
}

function svgDefs() {
  return `<defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2D5F8A" />
    </marker>
  </defs>`;
}

function shouldSkipLine(line) {
  return /^\*\(Part 4-8 继续/.test(line.trim());
}

function shouldSkipStandaloneText(text) {
  const clean = stripInline(text).trim().replace(/[：:]\s*$/u, "");
  return /^(Workflow 归位说明|产品经理对外口径(?:\(再次强调\))?|简版收束|关键安全口径(?:\(再次强调\))?)$/u.test(clean);
}

function extractBody(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const firstDivider = lines.findIndex((line, i) => i > 0 && /^---\s*$/.test(line));
  const body = firstDivider >= 0 ? lines.slice(firstDivider + 1) : lines;
  const part1Index = body.findIndex((line) => /^##\s+Part\s+1\b/.test(line));
  const mainBody = part1Index >= 0 ? body.slice(part1Index) : body;
  return reorganizeEarlyParts(mainBody);
}

function sectionRange(lines, headingPattern) {
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start < 0) return [];
  let end = lines.length;
  const level = lines[start].match(/^(#+)\s+/)?.[1].length ?? 3;
  for (let i = start + 1; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{2,4})\s+/);
    if (match && match[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end);
}

function partRange(lines, partNumber) {
  const start = lines.findIndex((line) => new RegExp(`^##\\s+Part\\s+${partNumber}\\b`).test(line));
  if (start < 0) return { start: -1, end: -1, lines: [] };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+Part\s+\d+\b/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return { start, end, lines: lines.slice(start, end) };
}

function stripHeading(sectionLines) {
  return sectionLines.length ? sectionLines.slice(1) : [];
}

function reorganizeEarlyParts(lines) {
  const part1 = partRange(lines, 1);
  const part2 = partRange(lines, 2);
  const part3 = partRange(lines, 3);
  const part4 = partRange(lines, 4);
  if (part1.start < 0 || part2.start < 0 || part3.start < 0 || part4.start < 0) return lines;

  const agentElements = sectionRange(part1.lines, /^###\s+Agent 的四要素/);
  const workflowVsAgent = sectionRange(part1.lines, /^###\s+自主性是分水岭/);
  const llmVsTraditional = sectionRange(part1.lines, /^###\s+LLM Agent 和传统 Agent/);
  const whenAgent = sectionRange(part1.lines, /^###\s+何时才值得上 Agent/);
  const loopWhat = sectionRange(part2.lines, /^###\s+循环是什么/);
  const loopExample = sectionRange(part2.lines, /^###\s+业务例子/);
  const reactPractice = sectionRange(part2.lines, /^###\s+生产实践/);

  const part3Lines = [...part3.lines];
  const insertIndex = part3Lines.findIndex((line) => /^###\s+一句话收束/.test(line));
  const reactInsert = [
    "### 生产实践:ReAct 主循环 + 按需 Plan",
    "",
    ...stripHeading(reactPractice),
    "",
  ];
  const mergedPart3 =
    insertIndex >= 0
      ? [...part3Lines.slice(0, insertIndex), ...reactInsert, ...part3Lines.slice(insertIndex)]
      : [...part3Lines, "", ...reactInsert];

  const reordered = [
    "## Part 1: 什么是Agent：定义、循环与范式变化",
    "",
    ...agentElements,
    "",
    ...loopWhat,
    "",
    ...loopExample,
    "",
    ...llmVsTraditional,
    "",
    ...whenAgent,
    "",
    "---",
    "",
    "## Part 2: Agent vs Workflow",
    "",
    ...workflowVsAgent,
    "",
    "---",
    "",
    ...mergedPart3,
    "",
    ...lines.slice(part4.start),
  ];

  return reordered;
}

function renderMarkdown(lines) {
  const parts = [];
  const state = {
    headingCount: 0,
    h2Count: 0,
    currentH3: "",
    currentH4: "",
    lastH3: "",
    inserted: new Set(),
    skipUntilH3: null,
  };

  for (let i = 0; i < lines.length; ) {
    let line = lines[i] ?? "";
    if (state.skipUntilH3 && !/^###\s+/.test(line) && !/^##\s+/.test(line)) {
      i += 1;
      continue;
    }
    if (state.skipUntilH3 && (/^###\s+/.test(line) || /^##\s+/.test(line))) {
      state.skipUntilH3 = null;
    }
    if (shouldSkipLine(line) || line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.trim() === "**版本信息**") {
      i += 1;
      while (i < lines.length && lines[i].trim() === "") i += 1;
      const items = [];
      while (i < lines.length && isListLine(lines[i])) {
        const text = lines[i].replace(/^\s*(?:[-*]\s+|\d+\.\s+)/, "");
        items.push({ text, indent: 0 });
        i += 1;
      }
      parts.push(renderMetaCard(items));
      continue;
    }

    if (/^---\s*$/.test(line)) {
      parts.push('<div class="rule"></div>');
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 2) {
        state.currentH3 = "";
        state.currentH4 = "";
      }
      if (level === 3) {
        state.currentH3 = stripInline(text);
        state.currentH4 = "";
      }
      if (level === 4) state.currentH4 = stripInline(text);

      const hiddenHeading = /承上启下的钩子|一句话收束|5\.3 一句话速记|产品经理对外口径|落地七步/.test(text);
      if (!hiddenHeading) parts.push(renderHeading(level, text, state));

      if (/5\.3 一句话速记/.test(text)) {
        state.skipUntilH3 = text;
        i += 1;
        continue;
      }

      if (/自主性是分水岭/.test(text) && !state.inserted.has("ordinary")) {
        parts.push(figure("Workflow vs Agent：控制权在哪里", 2, workflowVsAgentSvg()));
        state.inserted.add("ordinary");
      }
      if (/生产实践:ReAct 主循环 \+ 按需 Plan/.test(text) && !state.inserted.has("react-plan")) {
        parts.push(figure("ReAct 主循环 + 按需 Plan 运行骨架", 3, reactPlanRuntimeSvg()));
        state.inserted.add("react-plan");
      }
      if (/控制权钟摆/.test(text) && !state.inserted.has("pendulum")) {
        parts.push(controlPendulumBlock());
        state.inserted.add("pendulum");
        state.skipUntilH3 = text;
      }
      if (/四阶段演进/.test(text) && !state.inserted.has("evolution-matrix")) {
        parts[parts.length - 1] = `<h3 id="${slugify("演进主线 能力补齐 自主度选型")}">演进主线：能力补齐 + 自主度选型</h3>`;
        parts.push(evolutionMatrixBlock());
        parts.push(fourStageCardsBlock());
        state.inserted.add("evolution-matrix");
        state.inserted.add("four-stage");
        state.inserted.add("nine-stage");
        state.skipUntilH3 = text;
      }
      if (/九阶段能力演进/.test(text) && state.inserted.has("evolution-matrix")) {
        state.skipUntilH3 = text;
      }
      if (/5\.0 主链路全景/.test(text) && !state.inserted.has("main")) {
        parts.push(figure("企业业务 Agent 主链路全景图", 6, mainPipelineSvg()));
        state.inserted.add("main");
      }
      if (/80 分验收口径/.test(text) && !state.inserted.has("harness-review")) {
        parts.push(harnessReviewBlock());
        state.inserted.add("harness-review");
      }
      if (/三条任务链/.test(text) && !state.inserted.has("api")) {
        parts.push(figure("API 接入三条任务链", 7, apiChainsSvg()));
        state.inserted.add("api");
      }
      i += 1;
      continue;
    }

    if (/^```\s*$/.test(line)) {
      const code = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      const text = code.join("\n");
      if (/Perception/.test(text) && !state.inserted.has("agent-loop")) {
        parts.push(figure("Agent Loop 循环示意图", 1, agentLoopSvg()));
        state.inserted.add("agent-loop");
      } else {
        parts.push(`<pre><code>${escapeHtml(text)}</code></pre>`);
      }
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i]);
        i += 1;
      }
      parts.push(renderQuote(quote));
      continue;
    }

    if (isTableStart(line)) {
      const tableLines = [];
      while (i < lines.length && isTableStart(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const table = parseTable(tableLines);
      parts.push(renderTable(table));
      const caption = tableCaption(table.header);
      if (/四阶段演进概览/.test(caption) && !state.inserted.has("four-stage")) {
        parts.push(figure("四阶段演进时间轴", 3, fourStageSvg()));
        state.inserted.add("four-stage");
      }
      continue;
    }

    if (isListLine(line)) {
      const items = [];
      const ordered = /^\s*\d+\.\s+/.test(line);
      while (i < lines.length && isListLine(lines[i])) {
        const raw = lines[i];
        const indent = Math.floor((raw.match(/^\s*/)?.[0].length ?? 0) / 2);
        const text = raw.replace(/^\s*(?:[-*]\s+|\d+\.\s+)/, "");
        items.push({ text, indent });
        i += 1;
      }
      const joinedItems = items.map((item) => stripInline(item.text)).join(" | ");
      if (/Advertise/.test(joinedItems) && /Load/.test(joinedItems) && /Read/.test(joinedItems) && /Run/.test(joinedItems)) {
        parts.push(skillLoadingBlock());
      } else if (/Task State/.test(state.currentH4) && /需求确认中/.test(joinedItems) && /暂停\/阻塞/.test(joinedItems)) {
        parts.push(taskStateTrackBlock());
      } else if (ordered && /落地七步/.test(state.currentH3) && items.length >= 7) {
        parts.push(landingStepsBlock());
      } else {
        parts.push(renderList(items, ordered));
      }
      if (/九阶段能力演进/.test(state.currentH3) && !state.inserted.has("nine-stage")) {
        parts.push(figure("九阶段能力演进简图", 4, nineStageSvg()));
        state.inserted.add("nine-stage");
      }
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i])) {
      if (!shouldSkipLine(lines[i])) paragraph.push(lines[i].trim());
      i += 1;
    }
    const text = paragraph.join(" ");
    if (text && !shouldSkipStandaloneText(text)) parts.push(renderParagraph(text));
  }

  return parts.join("\n");
}

const baseCss = String.raw`
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
  --warm: #f5f0e7;
  --warm-border: #d9c8a8;
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

strong {
  font-weight: 800;
}

code {
  font-family: "Consolas", "JetBrains Mono", monospace;
  font-size: 0.92em;
  color: #173d5c;
  background: #edf3f8;
  padding: 0.08em 0.32em;
  border-radius: 3px;
}

p {
  margin: 0 0 3.55mm 0;
  orphans: 2;
  widows: 2;
}

.tag {
  display: inline-block;
  margin-right: 0.8mm;
  padding: 0.3mm 1.6mm;
  border-radius: 3px;
  font-size: 8.4pt;
  font-weight: 800;
}

.tag.bad {
  color: #7a3c32;
  background: #f7ebe8;
}

.tag.good {
  color: #1d5b3a;
  background: #eaf5ee;
}

.part-start {
  break-before: page;
  margin: 0 0 8.5mm 0;
  padding-top: 4mm;
}

.part-start.first-part {
  break-before: auto;
}

.part-start.final-part {
  break-before: auto;
  margin-top: 9mm;
  padding-top: 0;
}

.opening {
  break-before: page;
  min-height: 246mm;
  position: relative;
}

.opening-a {
  break-before: auto;
}

.opening-kicker {
  color: var(--accent);
  font-size: 9.4pt;
  font-weight: 850;
  letter-spacing: 0.03em;
  margin-bottom: 2.4mm;
}

.opening h2 {
  max-width: 132mm;
  margin: 0;
  color: #111827;
  font-family: "Noto Serif SC Local", "Noto Sans SC Local", serif;
  font-size: 23pt;
  line-height: 1.22;
  font-weight: 850;
}

.opening-deck {
  max-width: 145mm;
  margin-top: 5.5mm;
  color: #3f4b5a;
  font-size: 11pt;
  line-height: 1.72;
}

.opening-thesis {
  break-inside: avoid;
  margin: 10mm 0 8mm 0;
  padding: 7mm 8mm;
  color: #f5f3ee;
  background: #15191e;
  border-radius: 8px;
}

.opening-thesis p {
  margin: 0;
  font-size: 13.6pt;
  line-height: 1.65;
  font-weight: 500;
}

.opening-thesis strong {
  color: #fff;
  box-shadow: inset 0 -0.45em 0 rgba(45, 95, 138, 0.72);
}

.opening-thesis span {
  display: block;
  margin-top: 3.3mm;
  color: #cfd4dc;
  font-size: 9.6pt;
  line-height: 1.62;
}

.opening-question {
  display: flex;
  align-items: baseline;
  gap: 4mm;
  margin: 7.5mm 0 4.5mm 0;
}

.opening-question span {
  color: var(--accent);
  font-family: "Noto Serif SC Local", "Noto Sans SC Local", serif;
  font-size: 11pt;
  font-weight: 850;
}

.opening-question h3 {
  margin: 0;
  font-size: 14.2pt;
}

.opening-vs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6mm;
}

.opening-card {
  break-inside: avoid;
  min-height: 87mm;
  padding: 6mm;
  border: 1px solid var(--line);
  border-top: 3px solid #9aa3af;
  background: #fbfcfd;
}

.opening-card.accent {
  border-top-color: var(--accent);
  background: #f6f9fc;
}

.card-kicker {
  color: var(--muted);
  font-size: 8.4pt;
  font-weight: 850;
  margin-bottom: 2mm;
}

.opening-card.accent .card-kicker {
  color: var(--accent);
}

.opening-card h4 {
  margin: 0 0 4mm 0;
  font-size: 11.4pt;
  line-height: 1.45;
}

.opening-card ul {
  margin: 0;
}

.opening-card li {
  margin-bottom: 3mm;
  padding-left: 4.8mm;
  color: #3f4b5a;
  font-size: 9.2pt;
  line-height: 1.55;
}

.why-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4mm;
}

.why-card {
  break-inside: avoid;
  padding: 4.2mm 5mm;
  background: #fbfcfd;
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
}

.why-card b {
  display: block;
  margin-bottom: 1.6mm;
  color: #111827;
  font-size: 10.5pt;
}

.why-card p {
  margin: 0;
  color: #3f4b5a;
  font-size: 9.3pt;
  line-height: 1.58;
}

.opening-punch {
  margin: 4.8mm 0 7.2mm 0;
  padding: 4mm 5mm;
  color: var(--accent-deep);
  background: var(--accent-light);
  border-left: 4px solid var(--accent);
  font-weight: 850;
  line-height: 1.58;
}

.q3 {
  margin-top: 6.6mm;
}

.pm-shift {
  display: grid;
  grid-template-columns: 1fr 12mm 1.2fr;
  gap: 3mm 4mm;
  align-items: stretch;
}

.pm-shift > div {
  padding: 3.1mm 3.8mm;
  border: 1px solid var(--line);
  background: #fbfcfd;
}

.pm-shift > div:nth-child(3n) {
  background: #f6f9fc;
  border-color: #c9d9e7;
}

.pm-shift strong {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.pm-shift em {
  display: block;
  margin-bottom: 1mm;
  color: var(--accent);
  font-style: normal;
  font-size: 8pt;
  font-weight: 850;
}

.pm-shift p {
  margin: 0;
  color: #26384a;
  font-size: 8.9pt;
  line-height: 1.45;
}

.opening-thesis.closing {
  margin-top: 7mm;
  padding: 5mm 6mm;
}

.opening-thesis.closing p {
  font-size: 12pt;
}

.part-label {
  color: var(--accent);
  font-size: 9.4pt;
  font-weight: 850;
  letter-spacing: 0.03em;
  margin-bottom: 2.6mm;
}

h2 {
  margin: 0;
  color: #111827;
  font-family: "Noto Serif SC Local", "Noto Sans SC Local", serif;
  font-size: 19.4pt;
  line-height: 1.28;
  font-weight: 850;
}

h3 {
  break-after: avoid;
  margin: 7.6mm 0 3mm 0;
  color: #111827;
  font-size: 12.6pt;
  line-height: 1.36;
  font-weight: 850;
}

h4 {
  break-after: avoid;
  margin: 6mm 0 2.5mm 0;
  color: #1f2d3d;
  font-size: 11.2pt;
  line-height: 1.36;
  font-weight: 850;
}

ul,
ol {
  margin: 0 0 4.2mm 0;
  padding: 0;
}

ul {
  list-style: none;
}

ol {
  padding-left: 6mm;
}

li {
  position: relative;
  margin: 0 0 2.2mm 0;
  padding-left: 5.4mm;
}

ol li {
  padding-left: 1.6mm;
}

ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.78em;
  width: 2.3mm;
  height: 2px;
  background: var(--accent);
}

li.indent-1 {
  margin-left: 7mm;
  color: #374151;
}

.quote {
  break-inside: avoid;
  margin: 5mm 0 5.4mm 0;
  padding: 4.1mm 5mm 4.3mm 5mm;
  background: #f6f9fc;
  border-left: 4px solid var(--accent);
  color: #20384f;
  font-size: 10.7pt;
  line-height: 1.62;
}

.block-heading {
  break-after: avoid;
  display: flex;
  align-items: baseline;
  gap: 3mm;
  margin: 5.5mm 0 3.8mm 0;
}

.block-heading span {
  color: var(--accent);
  font-size: 8.3pt;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.block-heading strong {
  color: #111827;
  font-size: 11.7pt;
  font-weight: 850;
}

.pendulum-block,
.evo-matrix,
.stage-cards-block,
.harness-review {
  break-inside: avoid;
  margin: 5mm 0 7mm 0;
}

.pendulum-flow {
  display: grid;
  grid-template-columns: 1fr 8mm 1fr 8mm 1fr;
  gap: 3mm;
  align-items: stretch;
}

.pendulum-node {
  padding: 4mm;
  border: 1px solid var(--line);
  background: #fbfcfd;
}

.pendulum-node b {
  display: block;
  margin-bottom: 1.7mm;
  font-size: 9.6pt;
}

.pendulum-node p {
  margin: 0;
  color: #3f4b5a;
  font-size: 8.6pt;
  line-height: 1.48;
}

.pendulum-node.rules {
  border-top: 3px solid #9aa3af;
}

.pendulum-node.llm {
  border-top: 3px solid #b36a5e;
  background: #fbf6f5;
}

.pendulum-node.hybrid {
  border-top: 3px solid var(--accent);
  background: #f6f9fc;
}

.pendulum-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-weight: 850;
}

.pendulum-conclusion,
.soft-note {
  margin-top: 3.5mm;
  padding: 3.6mm 4.4mm;
  color: var(--accent-deep);
  background: var(--accent-light);
  border-left: 4px solid var(--accent);
  font-size: 9.2pt;
  line-height: 1.58;
}

.evo-table {
  border: 1px solid var(--line);
}

.evo-row {
  display: grid;
  grid-template-columns: 9mm 38mm 21mm 1fr;
  gap: 3mm;
  align-items: center;
  padding: 2.7mm 3.2mm;
  border-bottom: 1px solid var(--line);
  background: #fff;
}

.evo-row:last-child {
  border-bottom: 0;
}

.evo-row.pivot {
  background: #f6f9fc;
}

.evo-num {
  display: flex;
  width: 6.8mm;
  height: 6.8mm;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--accent);
  border-radius: 50%;
  font-family: "Noto Serif SC Local", serif;
  font-size: 8.2pt;
  font-weight: 850;
}

.evo-name {
  color: #111827;
  font-size: 9pt;
  font-weight: 850;
}

.evo-layer {
  justify-self: start;
  padding: 0.5mm 2mm;
  border-radius: 999px;
  font-size: 7.6pt;
  font-weight: 850;
  white-space: nowrap;
}

.knowledge {
  color: #2d5f8a;
  background: #e8f0f7;
}

.capability {
  color: #6f5428;
  background: #f7f2e7;
}

.quality {
  color: #2f6546;
  background: #eef6f1;
}

.base {
  color: #6b7280;
  background: #f3f4f6;
}

.evo-fix {
  color: #3f4b5a;
  font-size: 8.7pt;
  line-height: 1.42;
}

.layer-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 3.5mm;
  margin-top: 4mm;
}

.layer-card {
  padding: 3.5mm;
  border: 1px solid var(--line);
}

.layer-card b {
  display: block;
  margin-bottom: 1mm;
  color: #111827;
  font-size: 9.1pt;
}

.layer-card p {
  margin: 0;
  color: #3f4b5a;
  font-size: 8.2pt;
  line-height: 1.4;
}

.stage-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3.2mm;
}

.stage-card {
  padding: 3.6mm;
  border: 1px solid var(--line);
  border-top: 3px solid #9aa3af;
  background: #fbfcfd;
}

.stage-card:nth-child(2) {
  border-top-color: #8fb0ca;
}

.stage-card:nth-child(3) {
  border-top-color: #5e83a5;
}

.stage-card:nth-child(4) {
  border-top-color: var(--accent);
}

.stage-card span {
  display: block;
  color: var(--muted);
  font-size: 7.8pt;
  font-weight: 850;
}

.stage-card b {
  display: block;
  margin-top: 1mm;
  color: #111827;
  font-size: 9.4pt;
}

.stage-card em {
  display: block;
  margin: 1mm 0 2mm 0;
  color: var(--accent);
  font-size: 8pt;
  font-style: normal;
  font-weight: 850;
}

.stage-card p {
  margin: 0;
  color: #3f4b5a;
  font-size: 8pt;
  line-height: 1.42;
}

.axis-note {
  display: flex;
  align-items: center;
  gap: 2.4mm;
  margin-top: 3mm;
  color: var(--muted);
  font-size: 8pt;
  font-weight: 750;
}

.axis-note i {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #9aa3af, var(--accent));
}

.harness-triad {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 3.2mm;
  margin-bottom: 4mm;
}

.harness-triad div {
  padding: 3.2mm 3.5mm;
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
  background: #fbfcfd;
}

.harness-triad div:nth-child(2) {
  border-left-color: #b36a5e;
}

.harness-triad div:nth-child(3) {
  border-left-color: #3a7a55;
}

.harness-triad b {
  display: block;
  margin-bottom: 1mm;
  color: #111827;
  font-size: 9.3pt;
}

.harness-triad p {
  margin: 0;
  color: #3f4b5a;
  font-size: 8pt;
  line-height: 1.4;
}

.check-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.6mm 4mm;
}

.check-row {
  display: grid;
  grid-template-columns: 5mm 1fr;
  gap: 2mm;
  align-items: start;
}

.check-row span {
  width: 4.2mm;
  height: 4.2mm;
  margin-top: 0.7mm;
  border: 1.5px solid #b9c8d7;
  border-radius: 3px;
}

.check-row p {
  margin: 0;
  color: #26384a;
  font-size: 8.5pt;
  line-height: 1.45;
}

.check-row em {
  display: block;
  margin-top: 0.7mm;
  color: var(--muted);
  font-style: normal;
  font-size: 7.6pt;
  font-weight: 750;
}

.visual-module {
  break-inside: avoid;
  margin: 4.8mm 0 6.5mm 0;
  padding: 4.4mm 4.8mm;
  border: 1px solid var(--line);
  background: #fbfcfd;
}

.visual-title {
  display: flex;
  align-items: baseline;
  gap: 3mm;
  margin-bottom: 3.4mm;
}

.visual-title b {
  color: #111827;
  font-size: 10.2pt;
  font-weight: 850;
}

.visual-title span {
  color: var(--muted);
  font-size: 8.2pt;
  line-height: 1.35;
}

.load-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3mm;
}

.load-card {
  position: relative;
  min-height: 34mm;
  padding: 3.2mm 3.2mm 3.4mm 3.2mm;
  border: 1px solid #d7e0ea;
  border-top: 3px solid var(--accent);
  background: #ffffff;
}

.load-card::after {
  content: "";
  position: absolute;
  right: -2.8mm;
  top: 17mm;
  width: 3.6mm;
  height: 2px;
  background: var(--accent);
}

.load-card:last-child::after {
  display: none;
}

.load-card span,
.landing-step span,
.state-node span {
  display: inline-flex;
  width: 6.5mm;
  height: 6.5mm;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  background: var(--accent);
  font-size: 7.4pt;
  font-weight: 850;
}

.load-card b {
  display: block;
  margin-top: 2mm;
  color: #111827;
  font-size: 9.5pt;
}

.load-card strong {
  display: block;
  margin-top: 1mm;
  color: var(--accent-deep);
  font-size: 8.2pt;
}

.load-card p,
.state-node p,
.landing-step p {
  margin: 1.5mm 0 0 0;
  color: #3f4b5a;
  font-size: 7.9pt;
  line-height: 1.38;
}

.state-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3mm;
}

.state-track {
  padding: 4mm 4.4mm;
}

.state-track .visual-title {
  margin-bottom: 2.8mm;
}

.state-track .state-grid {
  grid-template-columns: repeat(7, 1fr);
  gap: 2mm;
}

.state-node {
  min-height: 24mm;
  padding: 2.5mm 2.2mm;
  border: 1px solid #d7e0ea;
  background: #ffffff;
}

.state-track .state-node:nth-child(7) {
  grid-column: auto;
  background: #fbf6f5;
  border-color: #dbc8c3;
}

.state-node b,
.landing-step b {
  display: block;
  margin-top: 1.5mm;
  color: #111827;
  font-size: 8.8pt;
}

.state-track .state-node b {
  font-size: 7.8pt;
}

.state-track .state-node p {
  font-size: 7pt;
  line-height: 1.3;
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1.8mm;
}

.landing-step {
  min-height: 29mm;
  padding: 2.6mm 2.2mm;
  border: 1px solid #d7e0ea;
  border-top: 3px solid #9aa3af;
  background: #ffffff;
}

.landing-step b {
  font-size: 8.2pt;
}

.landing-step p {
  font-size: 7.35pt;
  line-height: 1.32;
}

.landing-step:nth-child(2),
.landing-step:nth-child(3),
.landing-step:nth-child(4) {
  border-top-color: #8fb0ca;
}

.landing-step:nth-child(5),
.landing-step:nth-child(6),
.landing-step:nth-child(7) {
  border-top-color: var(--accent);
}

.rule {
  height: 1px;
  margin: 5mm 0;
  background: var(--line);
}

.meta-card {
  break-inside: avoid;
  margin-top: 5mm;
  padding: 4.5mm 5mm;
  background: #fbfcfd;
  border: 1px solid var(--line);
}

.meta-card h3 {
  margin: 0 0 3mm 0;
  font-size: 11.3pt;
}

.meta-grid {
  display: grid;
  grid-template-columns: 24mm 1fr;
  column-gap: 5mm;
  row-gap: 2mm;
  font-size: 8.8pt;
  line-height: 1.45;
}

.meta-label {
  color: var(--accent-deep);
  font-weight: 850;
}

.meta-value {
  color: #374151;
  overflow-wrap: anywhere;
}

pre {
  break-inside: avoid;
  margin: 4.4mm 0 5.5mm 0;
  padding: 4mm 4.5mm;
  background: #f5f7fa;
  border: 1px solid var(--line);
  white-space: pre-wrap;
  line-height: 1.52;
}

pre code {
  padding: 0;
  color: #1f2937;
  background: transparent;
  font-size: 9pt;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 4.5mm 0 6mm 0;
  font-size: 9pt;
  line-height: 1.44;
  break-inside: avoid;
}

.data-table.wide {
  font-size: 8.75pt;
}

.data-table caption {
  caption-side: top;
  text-align: left;
  margin-bottom: 2.4mm;
  color: var(--accent-deep);
  font-weight: 850;
  font-size: 9.5pt;
}

.data-table thead th {
  background: #f3f6f9;
  color: #26384a;
  border-top: 1.2px solid #b9c8d7;
  border-bottom: 1.2px solid #b9c8d7;
  font-weight: 850;
}

.data-table th,
.data-table td {
  padding: 2.75mm 3mm;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.data-table tbody tr:last-child td {
  border-bottom: 1.2px solid #cbd5e1;
}

.data-table.cols-2 td:first-child,
.data-table.cols-2 th:first-child {
  width: 38%;
}

.data-table.cols-3 td:first-child,
.data-table.cols-3 th:first-child {
  width: 26%;
}

.chart {
  break-inside: avoid;
  margin: 5.6mm 0 7mm 0;
}

.chart svg {
  display: block;
  width: 100%;
  height: auto;
}

.chart figcaption {
  margin-top: 2.4mm;
  color: var(--accent-deep);
  font-size: 9.2pt;
  font-weight: 850;
}

.module-caption {
  margin-top: 2.3mm;
  color: var(--accent-deep);
  font-size: 9pt;
  font-weight: 850;
}

.chart figcaption span {
  display: block;
  margin-top: 0.8mm;
  color: var(--muted);
  font-weight: 500;
}

svg {
  font-family: "Noto Sans SC Local", "Microsoft YaHei", sans-serif;
}

.chart-bg {
  fill: #fbfcfd;
  stroke: #e2e8f0;
  stroke-width: 1;
}

.panel {
  fill: #fbfcfd;
  stroke: #e2e8f0;
}

.accent-panel {
  fill: #f5f9fc;
  stroke: #c7d8e7;
}

.node,
.step {
  fill: #ffffff;
  stroke: #a9bdcf;
  stroke-width: 1.2;
}

.node.endpoint {
  fill: #e8f0f7;
  stroke: #8fb0ca;
}

.node.alt {
  fill: #f3f7fb;
}

.node.decision {
  fill: #ffffff;
  stroke: #2d5f8a;
}

.llm-node {
  fill: #fbf6ea;
  stroke: #d7bf82;
}

.support-node {
  fill: #f3f6f9;
  stroke: #cbd5e1;
}

.chain-a {
  fill: #eef5fb;
}

.chain-b {
  fill: #f7f7f2;
}

.chain-c {
  fill: #f3f6f9;
}

.lane-title,
.lane {
  fill: #e8f0f7;
  stroke: #b9c8d7;
}

.stage {
  stroke: #cbd5e1;
  stroke-width: 1.1;
}

.stage.base {
  fill: #f8fafc;
}

.stage.knowledge {
  fill: #e8f0f7;
}

.stage.capability {
  fill: #f7f2e7;
}

.stage.quality {
  fill: #eef6f1;
}

.dot {
  fill: #2d5f8a;
}

.edge {
  fill: none;
  stroke: #2d5f8a;
  stroke-width: 1.8;
}

.edge.small {
  stroke-width: 1.5;
}

.edge.back,
.edge.attach {
  stroke-dasharray: 5 4;
}

.edge.faint {
  stroke: #93a7ba;
  stroke-width: 1.2;
}

.timeline {
  fill: none;
  stroke: #8fb0ca;
  stroke-width: 2;
}
`;

const coverCss = String.raw`
${baseCss}

@page {
  size: A4;
  margin: 0;
}

.cover {
  width: 210mm;
  min-height: 297mm;
  padding: 33mm 31mm 28mm 31mm;
  display: grid;
  grid-template-rows: 1fr auto;
  position: relative;
  background:
    linear-gradient(90deg, rgba(45, 95, 138, 0.08) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, rgba(45, 95, 138, 0.08) 0 1px, transparent 1px 100%);
  background-size: 13mm 13mm;
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
  font-weight: 750;
  font-size: 10.5pt;
  letter-spacing: 0.04em;
  margin-bottom: 15mm;
}

.cover h1 {
  margin: 0;
  color: #111827;
  font-family: "Noto Serif SC Local", "Noto Sans SC Local", serif;
  font-weight: 850;
  font-size: 30pt;
  line-height: 1.24;
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
  font-weight: 700;
}

.cover .author {
  margin-top: 7mm;
  color: #5a6878;
  font-size: 10.5pt;
  font-weight: 650;
  letter-spacing: 0;
}

.cover .author span {
  color: var(--accent-deep);
  font-weight: 800;
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
  font-weight: 800;
}
`;

const bodyCss = String.raw`
${baseCss}

@page {
  size: A4;
  margin: 25mm 28mm 24mm 28mm;
}

@media screen {
  body {
    background: #eef2f6;
  }

  .manual {
    width: 210mm;
    min-height: 297mm;
    margin: 18px auto;
    padding: 25mm 28mm 24mm 28mm;
    background: #fff;
    box-shadow: 0 16px 48px rgba(28, 42, 58, 0.16);
  }
}
`;

const coverHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><title>封面</title><style>${coverCss}</style></head><body>
<section class="cover">
  <div class="cover-main">
    <div class="kicker">内部学习稿 · v2.0</div>
    <h1>${coverMeta.title.split("\n").map(escapeHtml).join("<br>")}</h1>
    <div class="subtitle">${escapeHtml(coverMeta.subtitle)}</div>
    <div class="version">${escapeHtml(coverMeta.version)}</div>
    <div class="author">作者 <span>${escapeHtml(coverMeta.author)}</span></div>
  </div>
  <div class="cover-footer">
    <div class="label">适用对象</div><div>${escapeHtml(coverMeta.audience)}</div>
    <div class="label">示例业务</div><div>${escapeHtml(coverMeta.example)}</div>
    <div class="label">版本日期</div><div>2026-06-11 · 重构版</div>
  </div>
</section>
</body></html>`;

const bodyContent = renderOpeningSpread() + renderMarkdown(extractBody(md));
const bodyHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><title>企业业务 Agent 模块解析手册</title><style>${bodyCss}</style></head><body><main class="manual">${bodyContent}</main></body></html>`;

fs.writeFileSync(out.coverHtml, coverHtml, "utf8");
fs.writeFileSync(out.bodyHtml, bodyHtml, "utf8");

const browser = await chromium.launch({ headless: true });

async function renderPdf(htmlPath, pdfPath, options = {}) {
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
  await page.goto(`file://${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    ...options,
  });
  await page.close();
}

await renderPdf(out.coverHtml, out.coverPdf);
await renderPdf(out.bodyHtml, out.bodyPdf, {
  displayHeaderFooter: true,
  headerTemplate: `<div style="font-family: 'Noto Sans SC', sans-serif; font-size:8px; color:#8a94a3; width:100%; padding:0 28mm; display:flex; justify-content:space-between;"><span>企业业务 Agent 模块解析手册</span><span>内部学习稿 · v2.0</span></div>`,
  footerTemplate: `<div style="font-family: 'Noto Sans SC', sans-serif; font-size:8px; color:#8a94a3; width:100%; padding:0 28mm; display:grid; grid-template-columns:1fr 36mm 1fr; align-items:end;"><span>从普通聊天机器人，到可控、可复盘、可持续沉淀的业务 Agent</span><span style="text-align:center; line-height:0;"><img src="${footerMascotLogoDataUri}" style="width:23mm; height:auto; opacity:.72;" /></span><span style="text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
});

const merged = await PDFDocument.create();
for (const pdfPath of [out.coverPdf, out.bodyPdf]) {
  const pdf = await PDFDocument.load(fs.readFileSync(pdfPath));
  const pages = await merged.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => merged.addPage(page));
}
fs.writeFileSync(out.finalPdf, await merged.save());

const previewPage = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await previewPage.goto(`file://${out.coverHtml.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await previewPage.locator(".cover").screenshot({ path: out.previewCover, type: "png" });
await previewPage.goto(`file://${out.bodyHtml.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await previewPage.locator(".manual").screenshot({ path: out.previewBodyTop, type: "png" });
await previewPage.locator("#figure-6").screenshot({ path: out.previewMainChart, type: "png" });
await previewPage.close();

await browser.close();

const finalDoc = await PDFDocument.load(fs.readFileSync(out.finalPdf));
console.log(
  JSON.stringify(
    {
      ...out,
      pageCount: finalDoc.getPageCount(),
    },
    null,
    2
  )
);
