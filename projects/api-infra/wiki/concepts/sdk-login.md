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
