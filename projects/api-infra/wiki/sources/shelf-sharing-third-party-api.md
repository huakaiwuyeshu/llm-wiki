# 货架共享第三方API接口文档

一句话：这份文档是三方渠道消费租号玩货架、下单、续租、订单、投诉、风控、装备获取等能力的主要 API 文档。

## 来源

- 原始 PDF：`sources/raw-pdfs/货架共享第三方API接口文档.pdf`
- 抽取文本：`sources/extracted-md/shelf-sharing-third-party-api.md`
- 页数：119

## 文档范围

- API 鉴权与签名方法。
- 货架搜索条件、搜索列表、详情、装备详情。
- 下单、续租、订单详情、租客撤单、订单列表、订单登录日志。
- 投诉类型、投诉提交、支付账号上报。
- 游戏安全模式解除、游戏数据获取、特价货架、代理推广、装备获取等扩展接口。
- 防御和回调类接口在 iOS 接入文档中也有补充。

## 关键接口示例

- `/api/platformXYZ/hao/searchFilter`：账号搜索条件。
- `/api/platformXYZ/hao/search`：账号搜索列表。
- `/api/platformXYZ/hao/info`：账号/货架基础详情。
- `/api/platformXYZ/hao/detailInfo`：货架装备、图片等详情。
- `/api/platformXYZ/order/placeOrder`：下单。
- `/api/platformXYZ/order/relet`：续租。
- `/api/platformXYZ/order/info`：订单详情。
- `/api/platformXYZ/ts/getType`：投诉类型。
- `/api/platformXYZ/ts/add`：提交投诉。
- `/api/platformXYZ/report/payid`：上报支付账号。
- `/api/platformXYZ/game/removeSafeModeRequest`：发起安全模式解除。
- `/api/platformXYZ/game/removeSafeModeRes`：提交安全模式解除结果。
- `/api/platformXYZ/hao/discountedList`：特价货架列表。
- `/api/platformXYZ/order/renterCancel`：租客撤单。
- `/api/{platform_name}/order/orderList`：订单列表。
- `/eq/platformXYZ/v1/setOpenServerQueue`：装备获取开通队列。
- `/eq/platformXYZ/v1/getOpenServerProcess`：装备获取开通进度。

## 鉴权摘要

- 公共参数包括 `app_id`、`app_secret`、`timestamp` 和业务参数。
- 默认签名方法是对除 `sign` 外所有请求参数按 ASCII 升序排序，拼接为 `字段名=字段值`，用 `&` 连接，再使用 `hash_hmac` 计算签名，最后 base64 编码。
- `timestamp` 是 Unix 时间戳，单位秒。
- 验签失败会返回错误并终止程序。
- 部分接口存在独立签名方式，例如渠道客户端更新检查使用 `md5(app_secreet + timestamp)`，且时间戳 5 分钟内有效。
