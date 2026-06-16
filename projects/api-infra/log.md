# API Infra Log

> 新日志写在最上方。格式：`## [YYYY-MM-DD] <操作> | <标题>`

## [2026-06-16] ingest | 摄入 10 份 API PDF 并生成 agent-demo 知识包

抽取 `sources/raw-pdfs/` 下 10 份 API PDF 到 `sources/extracted-md/`，新建 10 篇 `wiki/sources/` 来源笔记、8 篇 `wiki/concepts/` 概念页、1 篇 FAQ 和 3 篇 SOP，并生成 `exports/agent-demo/` 下的 JSON 知识包。

## [2026-06-16] init | 创建 API 基础设施知识库

新建独立 API 知识项目，用于接收后续 API PDF，并为 agent-demo 生成隔离的知识导出包。
