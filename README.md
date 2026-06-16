# LLM Wiki Workspace

这个目录现在按“知识项目”隔离管理，避免不同 demo 或资料域互相污染。

## 项目边界

- `projects/agent-learning/`
  - 原有 Agent 学习资料、手册、wiki、notes 和 sources。
  - 这部分是历史项目归档和继续维护区。
  - 后续 agent-demo 处理 API 资料时，不从这里读取业务知识。

- `projects/api-infra/`
  - 后续 API 基础设施、FAQ、错误码、签名、回调、接入规范等资料的独立知识库。
  - 你后面要放的 10 个 PDF 请放到：
    `projects/api-infra/sources/raw-pdfs/`
  - agent-demo 后续只消费这里整理并导出的资料。

## 推荐流程

1. 把 API 相关 PDF 放到 `projects/api-infra/sources/raw-pdfs/`。
2. 在 `projects/api-infra/wiki/` 下整理可追溯知识条目。
3. 在 `projects/api-infra/exports/agent-demo/` 下生成给 demo 使用的轻量知识包。
4. 同步导出结果到 `D:/zuhaowan-ai/agent/data/knowledge/`。

## 约束

- 不要让 agent-demo 直接读取 `projects/agent-learning/`。
- 不要把 API PDF 放到根目录或 `projects/agent-learning/sources/`。
- 每个项目维护自己的 `index.md`、`overview.md` 和 `log.md`。
