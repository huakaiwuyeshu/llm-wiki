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
