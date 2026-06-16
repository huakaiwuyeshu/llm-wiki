# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def write_text(relative_path: str, content: str) -> None:
    path = ROOT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")


def write_json(relative_path: str, payload: object) -> None:
    path = ROOT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


SOURCE_PAGES = {
    "api-integration-faq": """
# API对接FAQ整理

一句话：这份文档沉淀 API 对接过程中的高频业务问题，覆盖套餐字段、上号方式、货架详情、回调、列表数据、删除状态、重试和老续租校验等。

## 来源

- 原始 PDF：`sources/raw-pdfs/API对接FAQ整理.pdf`
- 抽取文本：`sources/extracted-md/api-integration-faq.md`
- 页数：3

## 核心要点

- 同一租号客户端不支持同时登录多个游戏账号，只支持先后进入；需要另一个游戏退出后再继续。
- 货架套餐字段包括 `p5`、`p7`、`p8`、`p24`、`p168`、`p10`、`p720`，分别对应包早、包午、包夜、包日、周租、十小时、包月等时段/套餐含义。
- `/api/platformXYZ_client/hao/searchFilter` 的 `game_data` 字段返回量较大，包含英雄、皮肤等数据。
- `client_shfs` 用于 GG 租号按货架上号方式筛选；部分上号方式不支持时，需要三方本地过滤后再推送。
- 租送活动同一货架下单时只会触发一个优惠活动，按当前触发档位生效。
- 特价游戏列表包含 `11,17,25,24,1574,443,683,560,446,1078`，并注明特价游戏不支持续租。
- CSGO 上号由租号玩提供 SDK，三方自己做前端启动项，并把用户选择的上号平台传给租号玩，由 SDK 完成对应平台启动。
- 货架详情信息由两个接口组成：`info` 返回基本信息，`detailinfo` 返回装备、图片等详情内容。
- 投诉行为会按结果回调，直到用户投诉完成；状态变更也会回调，包括货架状态、价格、段位、标题等。
- 列表接口目前返回的都是可租数据；变更接口可包含新增账号、状态变更、价格变更或商品其他信息变更。
- 回调接口存在 2 次重试机制；不需要约定响应格式，按 HTTP 状态码判断，超时或 500 会重试，返回 200 不重试。

## 适合进入 demo 的问题

- 为什么回调失败会重试？重试几次？
- 为什么列表里只看到可租货架？
- 货架删除后渠道侧还要关心吗？
- `info` 和 `detailinfo` 的区别是什么？
- 老续租接口的校验问题在哪里？
""",
    "api-integration-process": """
# API对接流程

一句话：这份文档说明从商务确认到技术接入、资料准备、appid/appsecret 生成、SDK 和后台配置上线的 API 对接流程。

## 来源

- 原始 PDF：`sources/raw-pdfs/API对接流程.pdf`
- 抽取文本：`sources/extracted-md/api-integration-process.md`
- 页数：2

## 对接流程摘要

1. 商务确认合作意向。
2. 产品介入前期沟通，确认合作方式、接入平台、端游/手游类型、是否有 PC/APP 客户端、是否能完成完整租号上号业务，并沟通支付和客服问题。
3. 确认具体合作内容，包括开通游戏、上号方式和货架数据对接方案。
4. 提供 API 文档供合作方学习。
5. 合作方提供前期准备资料，包括未在租号玩注册的手机号、移动端包名和 SHA-1 签名等。
6. 移动端根据包名和签名生成对应 `appid` 和 `appsecret`。
7. 并行推进 SDK 包生成和 PHP 后台合作方配置上线，配置鉴权后合作方才能完成接口调用。
8. 根据合作方对接进度持续技术支持。

## 注意事项

- 移动端接入需要提前提供包名和 SHA-1 签名。
- `appid` 和 `appsecret` 是后续接口鉴权的关键资料。
- PHP 后台配置上线和 SDK 交付是并行任务。
""",
    "api-new-renewal-guide": """
# API新续租完整说明

一句话：新续租需要与租号玩官网保持一致，将续租订单拆单展示，并在下单、展示、结算、投诉和撤单场景中做兼容。

## 来源

- 原始 PDF：`sources/raw-pdfs/API新续租完整说明.pdf`
- 抽取文本：`sources/extracted-md/api-new-renewal-guide.md`
- 页数：3

## 核心规则

- API 侧新增新续租接口；老续租暂时保留，待全部渠道切换到新续租后再下线。
- 新续租接口需要区分端游和手游，并包含请求参数、响应结果、请求示例等说明。
- 新续租接口需要传递套餐字段，新续租支持套餐续租。
- 租客只能有一个未开始的续租单。
- 投诉中状态不允许下续租单。
- 租客被号主拉黑后不允许续租。
- 续租单时间与货架不可租时间冲突时续租失败。
- 续租单是新订单，拥有独立订单号和解锁码。
- 系列续租单之间解锁码通用；用户使用系列订单任一解锁码上号，当前进行哪个订单就展示哪个订单信息，并标记“续租”。
- 续租订单进入时间后，第一个订单自动过渡到第二个订单，无需重新登录。

## 撤单和投诉兼容

- 取消续租单时，从要取消的订单开始，系列订单往后的所有订单都取消续租。
- 正在进行的订单撤单，按投诉类型和扣款规则计算，最多扣完当前订单，不会因当前撤单扣款影响后续续租单。
- 免费撤单次数需要 API 上报的 `userid` 和 `payid` 综合判断唯一用户。
- 号主投诉订单关联取消后续预约单时，按正在进行订单的投诉类型判断预约单退款情况。
""",
    "ios-api-service-integration": """
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
""",
    "android-login-sdk-integration": """
# 安卓上号 SDK 接入文档

一句话：这份文档说明安卓上号 SDK 集成、依赖、混淆、错误代码、上号方式和隐私协议要求。

## 来源

- 原始 PDF：`sources/raw-pdfs/安卓上号 SDK 接入文档.pdf`
- 抽取文本：`sources/extracted-md/android-login-sdk-integration.md`
- 页数：7

## 核心要点

- SDK 自带混淆规则，不需要额外配置混淆规则。
- 上号方式包含 1.3 上号和 1.4 上号。
- 三方 SDK 集成客户的订单和租号玩官方订单不是同一体系，解锁码不能共用；集成时需要通过 API 下单获得订单信息并拿到解锁码。
- APP 隐私协议需要加入相关 SDK 说明，否则过审可能存在问题。

## 错误代码示例

- `ISSUE_1001`：参数缺失无法上号。
- `ISSUE_1002`：未导入相应上号策略实现库。
- `ISSUE_1003`：`quickInfo/dataVO` 数据解析异常。
- `ISSUE_1004`：相应上号策略初始化失败。
- `ISSUE_1005`：1.3 上号获取 Token 失败。
- `ISSUE_1006`：1.3 获取云游戏备用 Token 失败。
- `ISSUE_1007`：没有可用的快速上号方式，需要返回 APP 及时撤单并租用其他账号。
- `ISSUE_1008`：暂时无法打开加速器。
- `ISSUE_5000`：快速上号服务异常。
""",
    "pc-game-sdk-guide": """
# PC端游SDK说明

一句话：这份文档说明 PC 端游 SDK 的本地集成、Windows 签名、回调函数和调试边界。

## 来源

- 原始 PDF：`sources/raw-pdfs/PC端游SDK说明.pdf`
- 抽取文本：`sources/extracted-md/pc-game-sdk-guide.md`
- 页数：7

## 核心要点

- PC 端游 SDK 用于端游上号能力集成。
- 主程序需要 Windows 签名。
- 需要从 `zhplatform.dll` 获取 `ExchangeCallBack` 回调函数接口，本地创建导出函数接收通知信息，包括订单状态等。
- 文档提到部分上号功能可能受防御模块影响，调试时需要关注防御模块是否集成。
""",
    "third-party-standard-number-pool": """
# 三方标准号池方案

一句话：标准号池用于把三方渠道的货架供给规则统一起来，让不同渠道从标准号池按规则取账号数据。

## 来源

- 原始 PDF：`sources/raw-pdfs/三方标准号池方案.pdf`
- 抽取文本：`sources/extracted-md/third-party-standard-number-pool.md`
- 页数：11

## 背景

租号玩与多个三方渠道合作，会向三方平台供给游戏账号出租盈利。原有渠道存在直接从大号池筛选拉取和通过独立号池拉取两类模式，因此需要标准号池统一规则。

## 通用筛选规则

- 从租号玩大号池筛选符合要求的货架进入三方标准号池，满足数量和品质需求。
- 规则综合大小号主判定、号主比例、号主推送货架总量、货架品质、价格区间、货架客单价比例。
- 端游规则关注上号方式、货架品质和数量要求。
- 手游规则关注上号方式、货架品质、货架数量和可选的货架时租价价格。
- 仅推送待租状态货架。
- 高危货架不允许进入标准号池。
- 筛选无押金货架进入标准号池。
- 从大号池筛选时要匹配上号方式是否正确，正确才继续推送。
- 每半小时从大号池向标准号池同步一次货架。

## 剔除和测试机制

- 三单连续撤单的货架需要剔除。
- 七天状态无变化、七天内没有出租状态的数据加入大数据删除库，不再向号池推送。
- 三方端口通过接口 ID 区分，例如 `ggzh_client`、`ggzh`、`sw_client`、`feimen_client`。
- 测试调度和正式环境调度需要互不影响；默认接口不获取带测试标识的货架，测试时可针对三方端口加测试字段。
- 号池预警关注大号池向标准号池推送的数据量，重点游戏可设置 95% 阈值告警。
""",
    "third-party-channel-summary": """
# 三方渠道整理

一句话：这份文档梳理三方渠道类型、典型合作方、对接模式、号池/API 方案和待租货架监测问题。

## 来源

- 原始 PDF：`sources/raw-pdfs/三方渠道整理.pdf`
- 抽取文本：`sources/extracted-md/third-party-channel-summary.md`
- 页数：11

## 渠道类型

- 第一类：拥有自身品牌和租号平台的中大型公司，具备线下渠道和用户群体，但在账号资源、上号技术和风控方面有需求。
- 第二类：同行业内中小型公司，有开发实力和渠道资源，但在账号资源和防御能力上存在短板。

## 数据对接模式

- 本地数据存储：合作伙伴服务端向租号玩服务端发起请求，将货架数据存储到本地系统，便于后续货架管理和调用。
- 在线数据获取：合作伙伴服务端实时请求货架信息，获取实时货架数据。

## 典型渠道

- GG 租号：独立号池 + API 模式。GG 提供游戏和账号要求，租号玩从大号池筛选账号推送到 GG 号池，GG 从专属号池拉取本地存储并展示。
- 顺网：API 模式。租号玩提供搜筛接口，顺网端游通过接口从租号玩大号池获取货架数据进行展示。
- 文档也提到飞门租号等三方端口。

## 运维关注

- 待租货架同步和监测机制。
- GG 侧主动预警机制，每日通过邮箱推送三次待租货架量数据。
- 三方标准号池用于后续统一不同渠道的取数方式。
""",
    "shelf-sharing-third-party-api": """
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
""",
    "shelf-management-third-party-api": """
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
""",
}


CONCEPT_PAGES = {
    "api-auth-signature": """
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
""",
    "api-integration-process": """
# API接入流程

一句话：API 接入从商务合作确认开始，经过产品和技术方案确认、资料准备、appid/appsecret 生成、SDK 支撑和后台鉴权配置后进入联调。

## 流程

1. 商务确认合作意向。
2. 产品确认合作方式、接入平台、端游/手游类型、客户端形态、完整租号上号能力、支付和客服问题。
3. 确认开通游戏、上号方式和货架数据对接方案。
4. 提供 API 文档。
5. 合作方提供注册手机号、移动端包名和 SHA-1 签名等资料。
6. 生成 `appid` 和 `appsecret`。
7. 生成 SDK 包并完成 PHP 后台合作方配置和鉴权上线。
8. 根据对接进度提供技术支持。

## Demo 可演示点

- 信息不完整时追问：平台类型、端游/手游、客户端形态、包名、SHA-1 签名、开通游戏、上号方式。
- 鉴权问题排查：确认 `appid/appsecret`、签名算法、时间戳和后台合作方配置。
""",
    "shelf-api": """
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
""",
    "callback-retry": """
# 回调与重试

一句话：货架、投诉、价格、段位、标题等状态变更会通过回调同步给渠道，回调失败时按 HTTP 状态码判断是否重试。

## 规则

- 投诉行为会按照处理结果回调，直到用户投诉完成。
- 状态变更会回调，包含货架状态、价格、段位、标题等信息。
- 其他平台投诉不会返回给当前渠道，存在鉴权隔离。
- 回调接口存在 2 次重试机制。
- 不需要约定特定响应格式，根据状态码判断是否重试。
- 接口超时或返回 500 会重试，返回 200 不重试。

## Demo 可演示问题

- “我们回调接口返回 500，会不会重试？”
- “投诉状态会回调几次？”
- “其他平台的投诉会不会推给我们？”
""",
    "new-renewal": """
# 新续租

一句话：新续租将续租单作为独立订单拆单展示，同时保持系列续租单解锁码通用和订单时间自动衔接。

## 规则

- API 侧新增新续租接口，老续租暂时保留。
- 新续租接口需要区分端游和手游。
- 新续租支持套餐续租，需要传递套餐字段。
- 租客只能有一个未开始的续租单。
- 投诉中不允许下续租单。
- 被号主拉黑不允许续租。
- 续租时间与货架不可租时间冲突时续租失败。
- 续租成功后返回新续租单信息，新续租单有独立订单号和解锁码。
- 系列续租单解锁码通用，当前执行哪个订单就展示哪个订单信息。
- 到续租订单时间后自动过渡，无需重新登录。

## 撤单

取消续租单时，从被取消订单开始，后续系列订单都取消续租；正在进行的订单撤单只按当前订单计算扣款，不因当前订单撤单扣款影响后续续租单。
""",
    "standard-number-pool": """
# 三方标准号池

一句话：三方标准号池用于统一多渠道货架供给规则，按货架品质、上号方式、价格区间、号主比例等条件从大号池同步货架。

## 核心规则

- 从租号玩大号池筛选符合要求的货架进入三方标准号池。
- 只推送待租状态货架。
- 高危货架不允许进入标准号池。
- 优先筛选无押金货架。
- 必须匹配正确的上号方式。
- 每半小时从大号池同步一次货架。
- 三方端口通过接口 ID 区分，例如 `ggzh_client`、`ggzh`、`sw_client`、`feimen_client`。

## 剔除规则

- 三单连续撤单。
- 七天内状态无变化且没有出租状态的数据加入删除库，不再推送。

## 测试和预警

- 测试调度程序和正式调度程序互不影响。
- 默认接口不获取带测试标识货架，测试时针对三方端口加字段。
- 推送量可设置 95% 阈值告警。
""",
    "sdk-login": """
# SDK上号接入

一句话：端游和手游 SDK 负责上号能力，API 下单后需要通过订单信息和解锁码配合 SDK 完成上号流程。

## 安卓 SDK

- SDK 自带混淆规则，不需要额外配置。
- 支持 1.3 上号和 1.4 上号。
- 三方 SDK 集成客户订单和租号玩官方订单不是同一体系，解锁码不能共用。
- 集成时需要通过 API 下单获取订单信息和解锁码。
- APP 隐私协议需要加入相关 SDK 说明。

## PC 端游 SDK

- 主程序需要 Windows 签名。
- 通过 `zhplatform.dll` 获取 `ExchangeCallBack` 回调函数接口。
- 本地创建导出函数接收通知信息，包括订单状态等。

## iOS/移动服务端上号

- `/qsshv3/platformXYZ/quick/getServer` 获取服务端上号 token。
- `/qsshv3/platformXYZ/quick/setOrder` 添加上号队列。
- `/qsshv3/platformXYZ/orderinfo` 快速上号获取订单信息。
""",
    "defense-api": """
# 防御检测接口

一句话：防御接口用于三方平台在下单、上号前接入租号玩风控能力，检测风险并根据处罚规则执行拦截、封禁、人脸验证等处理。

## 接口

- `/api/platformXYZ/defense/detect`：检测及上报接口。
- `/api/platformXYZ/defense/callback`：处罚回调接口。
- 文档示例也出现 `/api/tzh/defense/detect` 和 `/api/tzh/defense/callback`。

## 注意事项

- 调用时至少要存在一种检测类型，否则无实际作用。
- 当处罚执行方为内部时，例如投诉订单自动投诉，不需要三方手动调用投诉接口。
- 部分处罚类型如果三方无法实现，可按自身业务处理跳过策略，例如人脸验证一次后跳过后续人脸。
""",
}


FAQ_PAGE = """
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

### 特价游戏支持续租吗？

不支持。FAQ 文档列出的特价游戏列表注明特价游戏不支持续租。

来源：`wiki/sources/api-integration-faq.md`

### 新续租单是否有独立订单号？

有。新续租单是新订单，拥有独立订单号和解锁码；系列续租单之间解锁码通用。

来源：`wiki/sources/api-new-renewal-guide.md`

### 新续租失败常见业务原因有哪些？

租客已有一个未开始的续租单、订单处于投诉中、租客被号主拉黑、续租时间与货架不可租时间冲突，都可能导致续租不允许或失败。

来源：`wiki/sources/api-new-renewal-guide.md`
"""


SOP_PAGES = {
    "signature-debug": """
# 签名失败排查 SOP

一句话：签名失败优先按参数完整性、时间戳、排序、算法和 base64 编码顺序排查。

## 适用场景

- 接口返回 `-1`。
- 返回签名错误。
- 合作方反馈同一接口在本地签名和服务端验签不一致。

## 必要信息

- 接口路径。
- `app_id`。
- 请求时间戳。
- 除 `sign` 外的完整请求参数。
- 合作方本地生成的待签名字符串。
- 合作方使用的签名算法和编码方式。

不要要求用户在普通聊天中提供真实 `app_secret`。

## 排查步骤

1. 检查 `app_id` 是否正确，是否匹配当前合作方和环境。
2. 检查 `timestamp` 是否为 Unix 时间戳，单位秒。
3. 确认所有请求参数都参与签名，但不包括 `sign`。
4. 确认参数按 ASCII 码从小到大排序。
5. 确认拼接格式为 `字段名=字段值`，字段之间用 `&` 连接。
6. 确认使用 `hash_hmac`/`HMAC-SHA1` 类签名算法，与文档和接口实际约定一致。
7. 确认计算后的签名已转成 base64 格式。
8. 如接口属于特例，确认是否应使用独立签名方式，例如 `md5(app_secreet + timestamp)`。

## 输出建议

先指出最可能原因，再给出下一步可执行检查项。信息不足时只追问阻塞项。
""",
    "callback-debug": """
# 回调失败排查 SOP

一句话：回调失败优先确认接收接口响应状态、是否超时、是否返回 200，以及渠道侧是否正确处理重复通知。

## 适用场景

- 合作方反馈没有收到状态变更或投诉回调。
- 回调收到但重复触发。
- 回调接口返回 500 或超时。

## 必要信息

- 回调接口地址。
- 触发事件类型：投诉、货架状态、价格、段位、标题等。
- 事件发生时间。
- 渠道侧 HTTP 响应状态码。
- 渠道侧日志中的请求体和响应时间。

## 排查步骤

1. 确认本次事件是否应回调给当前渠道；其他平台投诉不会推给当前渠道。
2. 确认回调地址可访问，且渠道侧能在超时时间内响应。
3. 如果返回 200，平台不会重试。
4. 如果超时或返回 500，会触发重试；当前规则为 2 次。
5. 渠道侧需要做好幂等处理，因为重试可能导致同一事件重复到达。
6. 对投诉类事件，确认流程是否已经处理完成；投诉会按结果持续回调直到完成。

## 输出建议

先判断是否属于“应回调”范围，再判断是否因状态码/超时触发重试。
""",
    "new-renewal-debug": """
# 新续租排查 SOP

一句话：新续租排查要先判断是否使用新接口，再检查套餐字段、未开始续租单、投诉状态、黑名单和不可租时间冲突。

## 适用场景

- 续租失败。
- 续租订单展示异常。
- 续租后解锁码或订单状态不符合预期。

## 必要信息

- 原订单号。
- 续租接口路径和请求参数。
- 是否端游或手游。
- 套餐字段。
- 租客 `userid` 和 `payid`。
- 当前订单状态、投诉状态、不可租时间、黑名单状态。

## 排查步骤

1. 确认使用新续租接口还是老续租接口。
2. 确认新续租接口是否按端游/手游区分。
3. 确认是否传递套餐字段。
4. 检查租客是否已经有一个未开始的续租单。
5. 检查订单是否处于投诉中。
6. 检查租客是否被号主拉黑。
7. 检查续租时间是否与货架不可租时间冲突。
8. 续租成功后，确认新续租单是否拥有独立订单号和解锁码，系列续租单解锁码是否通用。

## 输出建议

区分“业务限制导致不允许续租”和“接口参数/展示兼容问题”。
""",
}


API_DOCS = [
    {
        "id": "auth-signature-default",
        "category": "auth",
        "title": "默认 API 签名规则",
        "content": "接口调用前需要鉴权。除 sign 外所有请求参数按 ASCII 升序排序，拼接为 字段名=字段值，并用 & 连接；使用 hash_hmac/HMAC-SHA1 计算签名后转 base64，作为 sign 提交。timestamp 为秒级 Unix 时间戳。",
        "source": "wiki/concepts/api-auth-signature.md",
    },
    {
        "id": "auth-signature-status",
        "category": "auth",
        "title": "签名相关状态码",
        "content": "常见状态码：1 表示成功，0 表示错误提示，-1 表示签名错误，-100 表示系统内部异常。",
        "source": "wiki/concepts/api-auth-signature.md",
    },
    {
        "id": "integration-process",
        "category": "integration",
        "title": "API 对接流程",
        "content": "商务确认合作意向后，产品确认合作方式、接入平台、端游/手游、客户端形态、支付和客服问题；再确认开通游戏、上号方式和货架数据方案；合作方提供注册手机号、移动端包名和 SHA-1 签名；生成 appid/appsecret；SDK 包和 PHP 后台鉴权配置并行上线。",
        "source": "wiki/concepts/api-integration-process.md",
    },
    {
        "id": "shelf-sharing-core",
        "category": "shelf-sharing",
        "title": "货架共享核心接口",
        "content": "货架共享常见接口包括 /api/platformXYZ/hao/searchFilter、/api/platformXYZ/hao/search、/api/platformXYZ/hao/info、/api/platformXYZ/hao/detailInfo、/api/platformXYZ/order/placeOrder、/api/platformXYZ/order/relet、/api/platformXYZ/order/info、/api/platformXYZ/ts/getType、/api/platformXYZ/ts/add。",
        "source": "wiki/concepts/shelf-api.md",
    },
    {
        "id": "shelf-management-core",
        "category": "shelf-management",
        "title": "货架管理核心接口",
        "content": "货架管理常见接口包括 /shanghu/[platformXYZ]/v1/onRentHao、offRentHao、batchOnRentHao、batchOffRentHao、delHao，以及 /v2/hideHaoByIds、addBlackUser、getHaoChangeList、searchAccount 和 /v3/rentOutOrderList。",
        "source": "wiki/concepts/shelf-api.md",
    },
    {
        "id": "callback-retry",
        "category": "callback",
        "title": "回调与重试规则",
        "content": "投诉和货架状态、价格、段位、标题等状态变更会回调。回调接口存在 2 次重试机制；不需要约定响应格式，按 HTTP 状态码判断，超时或 500 会重试，返回 200 不重试。",
        "source": "wiki/concepts/callback-retry.md",
    },
    {
        "id": "new-renewal",
        "category": "renewal",
        "title": "新续租规则",
        "content": "新续租新增接口，老续租暂时保留。新续租单是新订单，有独立订单号和解锁码；系列续租单解锁码通用；进入续租时间后自动过渡，无需重新登录。投诉中、已有未开始续租单、被拉黑、与不可租时间冲突等会导致不允许续租或续租失败。",
        "source": "wiki/concepts/new-renewal.md",
    },
    {
        "id": "standard-number-pool",
        "category": "number-pool",
        "title": "三方标准号池规则",
        "content": "标准号池从大号池筛选符合要求的货架，只推送待租状态、非高危、无押金且上号方式匹配的货架；每半小时同步一次。三单连续撤单或七天状态无变化的货架会进入剔除逻辑。",
        "source": "wiki/concepts/standard-number-pool.md",
    },
    {
        "id": "sdk-login",
        "category": "sdk",
        "title": "SDK 上号接入",
        "content": "安卓 SDK 自带混淆规则，三方订单和租号玩官方订单不是同一体系，解锁码不能共用，需要通过 API 下单获取订单信息和解锁码。PC 端游 SDK 需要 Windows 签名，并通过 zhplatform.dll 的 ExchangeCallBack 接收通知。",
        "source": "wiki/concepts/sdk-login.md",
    },
    {
        "id": "defense-api",
        "category": "defense",
        "title": "防御检测接口",
        "content": "防御接口用于三方平台在下单、上号前接入风控能力。检测接口包括 /api/platformXYZ/defense/detect，回调接口包括 /api/platformXYZ/defense/callback；调用时至少存在一种检测类型，否则无实际作用。",
        "source": "wiki/concepts/defense-api.md",
    },
]


FAQ_ITEMS = [
    {
        "id": "faq-single-client-multi-game",
        "question": "同一个租号客户端能同时登录多个游戏账号吗？",
        "answer": "不能。同一个租号客户端不支持同时登录多个游戏账号，只支持先后进入；需要另一个游戏退出后才能继续。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-callback-retry",
        "question": "回调接口失败会重试吗？",
        "answer": "会。当前回调接口存在 2 次重试机制；不需要约定响应格式，按 HTTP 状态码判断，超时或 500 会重试，返回 200 不重试。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-complaint-callback",
        "question": "投诉状态会回调几次？",
        "answer": "投诉行为会按照结果持续回调，直到用户投诉完成。状态变更也会回调，包括货架状态、价格、段位、标题等信息。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-other-platform-complaint",
        "question": "其他平台投诉会推给当前渠道吗？",
        "answer": "不会。其他平台投诉不会返回给当前渠道，存在鉴权隔离。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-list-rentable",
        "question": "列表接口返回的都是可租货架吗？",
        "answer": "目前列表返回的都是可租货架。回调接口中会包含新增账号、状态变更、价格变更或商品其他信息变更等数据。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-not-in-pool",
        "question": "平台新增货架没有进入号池，会推送给渠道吗？",
        "answer": "不会。平台新增货架不进入号池时，不会推送给渠道。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-deleted-shelf",
        "question": "商品删除状态是什么意思？",
        "answer": "商品删除指号主将货架从平台删除，该货架 ID 后续可以不再关注，渠道侧基本收不到。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-info-detailinfo",
        "question": "info 和 detailinfo 有什么区别？",
        "answer": "info 返回货架基础信息，detailinfo 返回货架装备信息、图片等详情内容。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-signature-debug",
        "question": "签名错误应该排查什么？",
        "answer": "重点检查 app_id、app_secret 是否正确，timestamp 是否为秒级 Unix 时间戳，参数是否按 ASCII 升序排序，是否错误地把 sign 参与签名，是否使用正确算法，以及结果是否 base64 编码。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-discount-renewal",
        "question": "特价游戏支持续租吗？",
        "answer": "不支持。FAQ 文档列出的特价游戏列表注明特价游戏不支持续租。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-new-renewal-order",
        "question": "新续租单是否有独立订单号？",
        "answer": "有。新续租单是新订单，拥有独立订单号和解锁码；系列续租单之间解锁码通用。",
        "source": "wiki/faq/api-integration-faq.md",
    },
    {
        "id": "faq-new-renewal-failure",
        "question": "新续租失败常见业务原因有哪些？",
        "answer": "租客已有一个未开始的续租单、订单处于投诉中、租客被号主拉黑、续租时间与货架不可租时间冲突，都可能导致续租不允许或失败。",
        "source": "wiki/faq/api-integration-faq.md",
    },
]


ERROR_CODES = [
    {"code": "1", "meaning": "成功", "suggestion": "接口处理成功。", "source": "wiki/concepts/api-auth-signature.md"},
    {"code": "0", "meaning": "错误提示", "suggestion": "读取返回消息，根据具体业务错误处理。", "source": "wiki/concepts/api-auth-signature.md"},
    {"code": "-1", "meaning": "签名错误", "suggestion": "检查 app_id/app_secret、timestamp 秒级格式、参数 ASCII 升序、sign 是否排除、算法和 base64 编码。", "source": "wiki/concepts/api-auth-signature.md"},
    {"code": "-100", "meaning": "系统内部异常", "suggestion": "确认请求参数无误后，结合服务端日志排查内部异常。", "source": "wiki/concepts/api-auth-signature.md"},
    {"code": "ISSUE_1001", "meaning": "快速上号服务参数缺失无法上号", "suggestion": "检查解锁码等必要参数。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1002", "meaning": "未导入相应上号策略实现库", "suggestion": "检查安卓 SDK 依赖和上号策略库是否集成。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1003", "meaning": "quickInfo/dataVO 数据解析异常", "suggestion": "检查接口返回结构和 SDK 解析逻辑。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1004", "meaning": "上号策略初始化失败", "suggestion": "检查策略初始化参数和 SDK 环境。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1005", "meaning": "1.3 上号获取 Token 失败", "suggestion": "检查上号 token 获取接口和订单信息。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1006", "meaning": "1.3 获取云游戏备用 Token 失败", "suggestion": "检查云游戏备用 token 服务。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1007", "meaning": "没有可用的快速上号方式", "suggestion": "提示用户返回 APP 及时撤单并租用其他账号。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_1008", "meaning": "暂时无法打开加速器", "suggestion": "检查 VPN/加速器启动链路。", "source": "wiki/sources/android-login-sdk-integration.md"},
    {"code": "ISSUE_5000", "meaning": "快速上号服务异常", "suggestion": "稍后重试或联系客服，并结合 SDK 日志排查。", "source": "wiki/sources/android-login-sdk-integration.md"},
]


SOPS_EXPORT = [
    {
        "id": "signature-debug",
        "title": "签名失败排查 SOP",
        "applies_to": ["签名错误", "验签失败", "返回 -1"],
        "required_info": ["接口路径", "app_id", "请求时间戳", "除 sign 外完整请求参数", "待签名字符串", "签名算法和编码方式"],
        "steps": ["检查 app_id 是否匹配合作方和环境", "检查 timestamp 是否为秒级 Unix 时间戳", "确认 sign 未参与签名", "确认参数按 ASCII 升序排序", "确认拼接格式为 字段名=字段值 并用 & 连接", "确认算法与接口约定一致", "确认结果已 base64 编码", "确认是否属于独立签名接口"],
        "source": "wiki/sops/signature-debug.md",
    },
    {
        "id": "callback-debug",
        "title": "回调失败排查 SOP",
        "applies_to": ["未收到回调", "回调重复", "回调 500", "回调超时"],
        "required_info": ["回调地址", "事件类型", "事件发生时间", "HTTP 响应状态码", "渠道侧日志和响应时间"],
        "steps": ["确认事件是否应回调给当前渠道", "确认回调地址可访问", "返回 200 不重试", "超时或 500 会重试", "当前规则为 2 次重试", "渠道侧需要做幂等处理", "投诉会持续回调直到完成"],
        "source": "wiki/sops/callback-debug.md",
    },
    {
        "id": "new-renewal-debug",
        "title": "新续租排查 SOP",
        "applies_to": ["续租失败", "续租展示异常", "解锁码异常"],
        "required_info": ["原订单号", "续租接口路径和参数", "端游/手游", "套餐字段", "userid/payid", "订单状态/投诉状态/不可租时间/黑名单状态"],
        "steps": ["确认使用新续租还是老续租接口", "确认端游/手游区分", "确认是否传递套餐字段", "检查是否已有未开始续租单", "检查是否投诉中", "检查是否被号主拉黑", "检查不可租时间冲突", "确认独立订单号和解锁码通用逻辑"],
        "source": "wiki/sops/new-renewal-debug.md",
    },
]


def build_manifest() -> dict:
    source_manifest_path = ROOT / "notes/ingest/source-manifest.json"
    source_manifest = json.loads(source_manifest_path.read_text(encoding="utf-8"))
    return {
        "name": "api-infra-agent-demo-knowledge",
        "version": "2026-06-16",
        "generated_at": "2026-06-16",
        "source_project": "D:/zuhaowan-ai/llm-wiki/projects/api-infra",
        "sources": [
            {
                "title": item["title"],
                "slug": item["slug"],
                "pages": item["pages"],
                "raw_pdf": item.get("source_pdf_display", f"sources/raw-pdfs/{item['title']}.pdf"),
                "extracted_md": item["extracted_md"],
                "wiki_source": f"wiki/sources/{item['slug']}.md",
                "sha256_16": item["sha256_16"],
            }
            for item in source_manifest
        ],
        "exports": ["api_docs.json", "faq.json", "error_codes.json", "sops.json"],
        "boundary": "agent-demo should consume exports/agent-demo only, not raw PDFs or projects/agent-learning.",
    }


def main() -> None:
    for slug, content in SOURCE_PAGES.items():
        write_text(f"wiki/sources/{slug}.md", content)
    for slug, content in CONCEPT_PAGES.items():
        write_text(f"wiki/concepts/{slug}.md", content)
    write_text("wiki/faq/api-integration-faq.md", FAQ_PAGE)
    for slug, content in SOP_PAGES.items():
        write_text(f"wiki/sops/{slug}.md", content)

    write_text(
        "index.md",
        """
# API Infra Index

> API 基础设施知识库入口。agent-demo 后续只应读取 `exports/agent-demo/` 或同步后的 `D:/zuhaowan-ai/agent/data/knowledge/`。

## 状态

已摄入 10 份 API PDF，并生成抽取文本、wiki 页面和 agent-demo 导出知识包。

## 原始资料

- [API对接FAQ整理](wiki/sources/api-integration-faq.md)
- [API对接流程](wiki/sources/api-integration-process.md)
- [API新续租完整说明](wiki/sources/api-new-renewal-guide.md)
- [iOS API接口服务接入文档](wiki/sources/ios-api-service-integration.md)
- [PC端游SDK说明](wiki/sources/pc-game-sdk-guide.md)
- [三方标准号池方案](wiki/sources/third-party-standard-number-pool.md)
- [三方渠道整理](wiki/sources/third-party-channel-summary.md)
- [安卓上号 SDK 接入文档](wiki/sources/android-login-sdk-integration.md)
- [货架共享第三方API接口文档](wiki/sources/shelf-sharing-third-party-api.md)
- [货架管理三方API文档](wiki/sources/shelf-management-third-party-api.md)

## 概念页

- [API鉴权与签名](wiki/concepts/api-auth-signature.md)
- [API接入流程](wiki/concepts/api-integration-process.md)
- [货架共享与货架管理](wiki/concepts/shelf-api.md)
- [回调与重试](wiki/concepts/callback-retry.md)
- [新续租](wiki/concepts/new-renewal.md)
- [三方标准号池](wiki/concepts/standard-number-pool.md)
- [SDK上号接入](wiki/concepts/sdk-login.md)
- [防御检测接口](wiki/concepts/defense-api.md)

## FAQ 和 SOP

- [API 对接 FAQ](wiki/faq/api-integration-faq.md)
- [签名失败排查 SOP](wiki/sops/signature-debug.md)
- [回调失败排查 SOP](wiki/sops/callback-debug.md)
- [新续租排查 SOP](wiki/sops/new-renewal-debug.md)

## 导出文件

- `exports/agent-demo/manifest.json`
- `exports/agent-demo/api_docs.json`
- `exports/agent-demo/faq.json`
- `exports/agent-demo/error_codes.json`
- `exports/agent-demo/sops.json`
""",
    )
    write_text(
        "overview.md",
        """
# API Infra Overview

一句话：本项目已将 API 基础设施 PDF 整理为独立知识库，并为 agent-demo 生成可检索的业务知识包。

## 当前覆盖范围

- API 对接流程和资料准备。
- 鉴权、签名、状态码和签名失败排查。
- 货架共享 API：搜索、详情、下单、续租、投诉、订单、游戏安全模式、特价货架等。
- 货架管理 API：上下架、隐藏、黑名单、变更、订单、财务、发布等。
- 新续租：拆单、独立订单号、解锁码通用、撤单和投诉兼容。
- 回调和重试：投诉、状态变更、HTTP 状态码、2 次重试。
- 三方渠道和标准号池：GG、顺网、飞门等渠道的号池/API 模式和筛选规则。
- 端游/手游 SDK 上号和 iOS 防御检测接口。

## 与 agent-demo 的关系

本项目负责维护真实业务知识来源；agent-demo 只消费 `exports/agent-demo/` 下的轻量 JSON，不直接读取 PDF 或整个 wiki。

## 已知注意点

PDF 文本层存在部分字体编码问题，已通过 `pdfplumber` 和 Unicode 规范化抽取。主要知识点已可读，但如果后续要做逐字段级接口文档展示，建议再对长接口表做一次人工校对或视觉 OCR 复核。
""",
    )
    write_text(
        "log.md",
        """
# API Infra Log

> 新日志写在最上方。格式：`## [YYYY-MM-DD] <操作> | <标题>`

## [2026-06-16] ingest | 摄入 10 份 API PDF 并生成 agent-demo 知识包

抽取 `sources/raw-pdfs/` 下 10 份 API PDF 到 `sources/extracted-md/`，新建 10 篇 `wiki/sources/` 来源笔记、8 篇 `wiki/concepts/` 概念页、1 篇 FAQ 和 3 篇 SOP，并生成 `exports/agent-demo/` 下的 JSON 知识包。

## [2026-06-16] init | 创建 API 基础设施知识库

新建独立 API 知识项目，用于接收后续 API PDF，并为 agent-demo 生成隔离的知识导出包。
""",
    )

    write_json("exports/agent-demo/manifest.json", build_manifest())
    write_json("exports/agent-demo/api_docs.json", API_DOCS)
    write_json("exports/agent-demo/faq.json", FAQ_ITEMS)
    write_json("exports/agent-demo/error_codes.json", ERROR_CODES)
    write_json("exports/agent-demo/sops.json", SOPS_EXPORT)


if __name__ == "__main__":
    main()
