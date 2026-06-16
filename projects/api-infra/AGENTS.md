# API Infra Wiki Schema

这是 API 基础设施知识库，后续服务 `D:/zuhaowan-ai/agent` 的 agent-demo。

## 目标

把 API 相关 PDF、FAQ、错误码、接入规范、排查 SOP 整理成可检索、可导出、可追溯的知识库。

## 目录结构

```text
api-infra/
  AGENTS.md
  index.md
  overview.md
  log.md
  sources/
    raw-pdfs/       # 用户放置原始 API PDF
    extracted-md/   # 从 PDF 抽取后的 Markdown 或文本
    attachments/    # 图片、表格截图、补充附件
  wiki/
    sources/        # 每份原始资料的精读笔记
    concepts/       # API 领域概念，如签名、鉴权、幂等、回调
    entities/       # 系统、接口、产品、错误码集合等实体
    faq/            # FAQ 条目
    sops/           # 排查 SOP
  notes/
    ingest/         # 摄入过程记录
    export-drafts/  # 导出前草稿
  exports/
    agent-demo/     # 给 agent-demo 使用的轻量知识包
```

## 资料边界

- 本项目只处理 API 基础设施资料。
- 原始 PDF 只从 `sources/raw-pdfs/` 读取。
- 不默认读取 `../agent-learning/` 中的 Agent 学习资料。
- 如果需要借用 Agent 理论说明，必须在回答或日志中明确标注为“跨项目参考”。

## Ingest 流程

1. 读取 `sources/raw-pdfs/` 中的新 PDF。
2. 抽取文本到 `sources/extracted-md/`。
3. 为每份文档建立 `wiki/sources/<slug>.md`。
4. 按主题沉淀到 `wiki/concepts/`、`wiki/faq/`、`wiki/sops/`。
5. 更新 `index.md`、`overview.md`、`log.md`。
6. 需要对接 demo 时，生成 `exports/agent-demo/` 下的 JSON/Markdown 知识包。

## Demo 导出约定

agent-demo 只应该消费 `exports/agent-demo/` 里的文件，不直接读取 PDF。

建议导出：

```text
exports/agent-demo/api_docs.json
exports/agent-demo/faq.json
exports/agent-demo/error_codes.json
exports/agent-demo/sops.json
exports/agent-demo/manifest.json
```
