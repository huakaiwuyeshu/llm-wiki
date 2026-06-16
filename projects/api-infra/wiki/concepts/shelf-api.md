# 货架共享与货架管理

一句话：货架共享 API 面向渠道消费货架并完成下单/续租/投诉等交易流程，货架管理 API 面向商户维护货架上下架、变更、黑名单、订单和财务等管理能力。

## 货架共享 API

常见接口：

- `/api/platformXYZ/hao/searchFilter`：搜索条件。
- `/api/platformXYZ/hao/search`：搜索列表。
- `/api/platformXYZ/hao/info`：基础详情。
- `/api/platformXYZ/hao/detailInfo`：装备、图片等详情。
- `/api/platformXYZ/order/placeOrder`：下单。
- `/api/platformXYZ/order/relet`：续租。
- `/api/platformXYZ/order/info`：订单详情。
- `/api/platformXYZ/ts/getType`：投诉类型。
- `/api/platformXYZ/ts/add`：提交投诉。

## 货架管理 API

常见接口：

- `/shanghu/[platformXYZ]/v1/onRentHao`：上架。
- `/shanghu/[platformXYZ]/v1/offRentHao`：下架。
- `/shanghu/[platformXYZ]/v1/delHao`：删除。
- `/shanghu/[platformXYZ]/v2/hideHaoByIds`：隐藏。
- `/shanghu/[platformXYZ]/v2/getHaoChangeList`：变更列表。
- `/shanghu/[platformXYZ]/v2/searchAccount`：账号搜索。
- `/shanghu/[platformXYZ]/v3/rentOutOrderList`：租出订单列表。

## FAQ 线索

- `info` 返回基础信息，`detailinfo` 返回装备、图片等详情。
- 列表接口目前返回的都是可租货架。
- 平台新增货架不进入号池时不会推送给渠道。
- 商品删除表示号主从平台删除货架，渠道侧后续基本不用关心该货架 ID。
