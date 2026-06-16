# API鉴权与签名

一句话：API 调用默认通过 `app_id`、`timestamp`、业务参数和 `app_secret` 生成签名，服务端验签失败会直接返回错误并终止处理。

## 规则来源

- `wiki/sources/shelf-sharing-third-party-api.md`
- `wiki/sources/shelf-management-third-party-api.md`
- `wiki/sources/api-integration-process.md`

## 默认签名规则

1. 接口调用前需要鉴权。
2. 请求参数包括 `app_id`、`timestamp` 和业务参数；`app_secret` 用于签名计算。
3. 将所有请求参数按 ASCII 码从小到大排序，不包括 `sign` 参数。
4. 把排序后的字段转为 `字段名=字段值` 字符串，并用 `&` 连接。
5. 使用 `hash_hmac` 计算数字签名。
6. 将计算后的签名转为 base64 格式。
7. 把结果作为 `sign` 参数提交。

## 常见错误

- `app_id` 或 `app_secret` 复制错误。
- `timestamp` 格式错误；文档要求 Unix 时间戳，单位秒。
- 参数没有按 ASCII 码升序排序。
- 把 `sign` 参数也参与了签名。
- 使用了错误的加密算法。
- 签名结果没有转成 base64。

## 状态码

- `1`：成功。
- `0`：错误提示。
- `-1`：签名错误。
- `-100`：系统内部异常。

## 特例

部分接口使用独立签名方式，例如渠道客户端更新检查接口使用 `md5(app_secreet + timestamp)`，时间戳 5 分钟内有效。注意文档中 `app_secreet` 可能是拼写错误，应以接口实际约定为准。
