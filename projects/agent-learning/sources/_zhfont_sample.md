# 企业业务 Agent 模块解析手册

这是一份用于验证 **中文字体渲染** 的样张文档。如果你能清晰看到下面所有中文,且**加粗中文**不发虚、不乱码,说明 Deng.ttf / Dengb.ttf 字体补丁生效了。

## 一、Agent 与 Workflow 的区别

**自主性(Autonomy)** 是分水岭。Workflow 是让 AI 按部就班地执行指令,而 Agent 则是赋予 AI 自由度去自主达成目标。

核心要点:

- 任务规则固定、不需多步推理时,传统软件加一次 LLM 调用就够
- Agent 只在「任务多步、依赖判断、流程会变」时才划算
- 企业落地遵循:**Workflow 负责边界,Agent 负责弹性**

## 二、十二个核心模块

| 模块 | 职责 | 一期是否必须 |
|---|---|---|
| 入口层 | 让人把任务交给 Agent | 必须 |
| Session Router | 会话分诊,分清闲聊与任务 | 必须 |
| Schema + Validator | 校验任务能否继续执行 | 必须 |
| 人工审核发布 | 高风险操作的最后一道闸门 | 必须 |

> **关键洞见**:业务最怕的不是系统不够聪明,而是系统自作聪明。控制权必须留在确定性工程手里。

## 三、安全边界(代码示例)

```python
def validate_request(req):
    # appsecret 不进模型上下文、不写入日志
    if "appsecret" in req.fields:
        return "blocked", "敏感凭证不可进入对话"
    return "executable", None
```

## 四、单量趋势分析

第一期 Agent 可基于样例数据做单量趋势、成功率与异常波动分析,自动生成周报。
