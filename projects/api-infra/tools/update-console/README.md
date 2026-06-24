# LLM Wiki Update Console

本地 API 知识库更新入口。

## 启动

```powershell
cd D:\zuhaowan-ai\llm-wiki\projects\api-infra\tools\update-console
python .\server.py --port 8765
```

打开：

```text
http://127.0.0.1:8765/
```

## 工作方式

- 页面只要求填写“文档名称、行为、内容”，不需要用户理解 wiki、FAQ、exports 等内部结构。
- 行为包括：存量更新、新增补充、新增文件。
- 服务端把请求和附件保存到 `projects/api-infra/notes/update-requests/`。
- 后续让 Codex 处理“最新更新请求”，Codex 会读取该目录，自行检索并更新 wiki、exports、search_index 和 log。

当前入口默认只服务 `projects/api-infra/`，不跨项目读取 `projects/agent-learning/`。
