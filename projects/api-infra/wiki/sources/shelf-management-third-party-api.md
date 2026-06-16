# 货架管理三方API文档

一句话：这份文档面向三方商户管理货架，覆盖账号上下架、隐藏、黑名单、备注、变更列表、发布、订单和财务等管理能力。

## 来源

- 原始 PDF：`sources/raw-pdfs/货架管理三方API文档.pdf`
- 抽取文本：`sources/extracted-md/shelf-management-third-party-api.md`
- 页数：122

## 文档范围

- 商户账号准备、应用信息、接口用法和状态码。
- 鉴权与签名方法。
- 游戏列表、用户标签、价格计算、上下架、批量上下架、删除、隐藏、黑名单、备注、变更列表、预约下架、账号搜索、图片上传、账号详情、新增/修改货架等。
- v3 订单、财务、置顶、合租、租出/租入订单列表等扩展接口。

## 关键接口示例

- `/shanghu/[platformXYZ]/v2/gameList`：游戏列表。
- `/shanghu/[platformXYZ]/v2/getUserShrLabels`：用户标签。
- `/shanghu/[platformXYZ]/v2/calculatePrice`：价格计算。
- `/shanghu/[platformXYZ]/v1/onRentHao`：上架货架。
- `/shanghu/[platformXYZ]/v1/offRentHao`：下架货架。
- `/shanghu/[platformXYZ]/v1/batchOnRentHao`：批量上架。
- `/shanghu/[platformXYZ]/v1/batchOffRentHao`：批量下架。
- `/shanghu/[platformXYZ]/v1/delHao`：删除货架。
- `/shanghu/[platformXYZ]/v2/hideHaoByIds`：隐藏货架。
- `/shanghu/[platformXYZ]/v2/addBlackUser`：添加黑名单。
- `/shanghu/[platformXYZ]/v2/delBlackUser`：删除黑名单。
- `/shanghu/[platformXYZ]/v2/getHaoChangeList`：货架变更列表。
- `/shanghu/[platformXYZ]/v2/searchAccount`：账号搜索。
- `/shanghu/[platformXYZ]/v3/rentOutOrderList`：租出订单列表，替代已弃用的 `/v2/orderList`。

## 鉴权摘要

- 规则与货架共享 API 基本一致：除 `sign` 外按 ASCII 升序排序，拼接后使用 `hash_hmac`，结果 base64 编码。
- 常见状态码：`1` 表示成功，`-1` 表示签名错误，`-100` 表示系统内部异常，`0` 表示错误提示。
