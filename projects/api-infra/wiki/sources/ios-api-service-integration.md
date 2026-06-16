# iOS API接口服务接入文档

一句话：这份文档主要覆盖 iOS/移动端服务端上号、防御检测和处罚回调等 API 接入能力。

## 来源

- 原始 PDF：`sources/raw-pdfs/iOS API接口服务接入文档.pdf`
- 抽取文本：`sources/extracted-md/ios-api-service-integration.md`
- 页数：20

## 上号服务接口

- `/qsshv3/platformXYZ/quick/getServer`：获取服务端上号 token。
- `/qsshv3/platformXYZ/quick/setOrder`：添加上号队列。
- `/qsshv3/platformXYZ/quick/getServerOrderToken`：获取上号 token 结果。
- `/qsshv3/platformXYZ/quick/setOrderQueue`：添加上号队列。
- `/qsshv3/platformXYZ/orderinfo`：快速上号获取订单信息。

## 防御接口

- 防御接口用于三方平台在下单、上号前接入风控能力，进行风险检测与验证。
- `/api/platformXYZ/defense/detect` 或 `/api/tzh/defense/detect`：检测及上报接口。
- `/api/platformXYZ/defense/callback` 或 `/api/tzh/defense/callback`：处罚回调接口。
- 当处罚执行方为内部时，例如投诉订单为调用接口时自动投诉，不需要三方手动调用投诉接口。
- 部分处罚类型如果三方无法实现，可以结合自身业务跳过，例如人脸验证可按平台要求处理一次后跳过后续人脸。

## 参数线索

文档中频繁出现 `auth_token`、`signature_nonce`、`uncode`、`qrcode`、`pkg_sign`、`pkg_secret`、`queue_id`、`order_id` 等字段。
