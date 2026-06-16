# Agent Demo Exports

这里是给 agent-demo 使用的 API 知识导出包。

优先检索文件：

- `manifest.json`: 导出版本、来源文档和生成时间
- `api_docs.json`: API 文档知识块
- `faq.json`: FAQ 知识块
- `error_codes.json`: 错误码知识块
- `sops.json`: 排查 SOP

远程兜底文件：

- `search_index.json`: 从 `wiki/**/*.md` 和 `sources/extracted-md/*.md` 生成的轻量检索索引，供 agent-demo 在本地导出包未命中时在线检索。

agent-demo 应优先消费这些导出文件，不直接读取原始 PDF 或跨项目读取 `projects/agent-learning/`。
