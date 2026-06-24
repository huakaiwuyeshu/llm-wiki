# API 对接 FAQ

一句话：本页汇总后续 agent-demo 最适合检索和演示的 API 高频问答。

## FAQ

### 同一个租号客户端能同时登录多个游戏账号吗？

不能。同一个租号客户端不支持同时登录多个游戏账号，只支持先后进入；需要另一个游戏退出后才能继续。

来源：`wiki/sources/api-integration-faq.md`

### 回调接口失败会重试吗？

会。当前同步规则是回调接口存在 2 次重试机制；不需要约定响应格式，按 HTTP 状态码判断，超时或 500 会重试，返回 200 不重试。

来源：`wiki/sources/api-integration-faq.md`

### 投诉状态会回调几次？

投诉行为会按照结果持续回调，直到用户投诉完成。状态变更也会回调，包括货架状态、价格、段位、标题等信息。

来源：`wiki/sources/api-integration-faq.md`

### 其他平台的投诉会推给当前渠道吗？

不会。其他平台投诉不会返回给当前渠道，存在鉴权隔离。

来源：`wiki/sources/api-integration-faq.md`

### 列表接口返回的都是可租货架吗？

目前列表返回的都是可租货架。回调接口中会包含新增账号、状态变更、价格变更或商品其他信息变更等数据。

来源：`wiki/sources/api-integration-faq.md`

### 平台新增货架没有进入号池，会推送给渠道吗？

不会。平台新增货架不进入号池时，不会推送给渠道。

来源：`wiki/sources/api-integration-faq.md`

### 商品删除状态是什么意思？

商品删除指号主将货架从平台删除，该货架 ID 后续可以不再关注，渠道侧基本收不到。

来源：`wiki/sources/api-integration-faq.md`

### `info` 和 `detailinfo` 有什么区别？

`info` 返回货架基础信息，`detailinfo` 返回货架装备信息、图片等详情内容。

来源：`wiki/sources/api-integration-faq.md`

### 签名错误应该排查什么？

重点检查 `app_id`、`app_secret` 是否正确，`timestamp` 是否为秒级 Unix 时间戳，参数是否按 ASCII 升序排序，是否错误地把 `sign` 参与签名，是否使用正确算法，以及结果是否 base64 编码。

来源：`wiki/concepts/api-auth-signature.md`

### 接口返回“平台不存在”怎么办？

接口返回报错“平台不存在”时，可能是接口请求字段内的平台标识填写错误，或者平台标识不存在，需要联系对接商务/产品确认处理。

来源：`wiki/sources/api-integration-faq.md`

### 特价游戏支持续租吗？

不支持。FAQ 文档列出的特价游戏列表注明特价游戏不支持续租。

来源：`wiki/sources/api-integration-faq.md`

### 新续租单是否有独立订单号？

有。新续租单是新订单，拥有独立订单号和解锁码；系列续租单之间解锁码通用。

来源：`wiki/sources/api-new-renewal-guide.md`

### 新续租失败常见业务原因有哪些？

租客已有一个未开始的续租单、订单处于投诉中、租客被号主拉黑、续租时间与货架不可租时间冲突，都可能导致续租不允许或失败。

来源：`wiki/sources/api-new-renewal-guide.md`
