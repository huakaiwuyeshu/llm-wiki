# LLM Wiki Root Schema

这个根目录只负责项目分流，不直接承载具体知识内容。

## 当前项目

- `projects/agent-learning/`: 原有 Agent 学习知识库。
- `projects/api-infra/`: API 基础设施知识库，供 agent-demo 后续使用。

## 工作规则

1. 处理某个知识域前，先进入对应 `projects/<name>/`。
2. 只读取该项目内的 `index.md`、`wiki/`、`sources/`、`notes/` 和 `exports/`。
3. 除非用户明确要求跨项目引用，否则不要跨项目检索资料。
4. API demo 相关资料只允许进入 `projects/api-infra/`。
5. 原 Agent 学习和手册资料只在 `projects/agent-learning/` 内继续维护。

## API demo 资料边界

后续处理 agent-demo 的知识来源时，默认只使用：

```text
projects/api-infra/
```

不要读取：

```text
projects/agent-learning/
```

这样可以避免 demo 在检索 API FAQ、错误码、签名规则时误命中 Agent 学习资料。
