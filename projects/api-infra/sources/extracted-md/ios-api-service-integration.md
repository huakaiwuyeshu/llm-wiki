# iOS API接口服务接入文档

- Source PDF: `../raw-pdfs/iOS API接口服务接入文档.pdf`
- Original file: `iOS API接口服务接入文档.pdf`
- Pages: 20

## Page 1

iOS
API接口服务接入文档

版本

作者
审核 类型
修订内容
修改日期
(yyyy-mm-
人
dd)

(I-初稿,A-添加,M-修
改,D-删除)

1.0
兰利升

初稿
创建文档
2024-11-15

1. 概述

在本文档中,将介绍我们的游戏租号平台API的使用方式。我们提供的API可以合作方中iOS
APP访问我
们平台的信息,并且执行一些特定的操作。通过这个API,第三方公司可以租用我们平台上的游戏账
号,以及对账号进行管理。

以下是本文档提供的API接口:

• 上号服务接口

• 防御服务接口

1.1 文档说明

1.1.1 格式说明

格式
说明

<
>
变量

[
]
可选项

{
}
必选项

1.2 适用范围

本文档所描述的API适用于任何需要租用游戏账号并管理账号的第三方公司。通过我们的API,第三方
公司可以访问本平台上的游戏账号信息,实现账号的租用和管理。如果您的公司需要实现类似的功
能,请参考本文档中提供的API接口,并根据接口用法说明进行调用。

## Page 2

当前文档仅适用于第三方
iOS
APP
对接使用。

1.2.1 调用顺序:

•
防御检测
->
上号

2. 业务流程

当前业务流程基于目前进行中的对接方进行整理,后续根据合作方的接入而进行扩充,逐步形成标准
化对接流程。

3. 接口列表

上号服务

3.1
API
功能列表简介

序号
API
描述

1
/qsshv3/platformXYZ/quick/getServer 获取服务端上号token

OrderToken

## Page 3

2
/qsshv3/platformXYZ/quick/setOrder 添加上号队列

Queue

3.2
API
对接流程

1.
查询是否需要滑块

## Page 4

a. 请求quick/getServerOrderToken

b. open_type=4
时需要处理滑块
进入2处理,
没有滑块进入5

2. 处理滑块

3. 提交滑块结果

a. 请求
quick/setOrderQueue
提交结果

b. open_type=4

4.
轮询获取滑块结果

a. 请求
quick/getServerOrderToken
接口,查询结果

b. open_type=4时,判定滑块验证成功,进入步骤5

5. 请求上号信息
quick/setOrderQueue

a. open_type=3时,进入上号流程请求上号

6. 轮询获取上号信息

a. quick/getServerOrderToken

b. open_type=3,完成上号

3.3
接口鉴权

租号玩平台提供的接口调用,都会先进行参数加密验签对照,如果验签不通过返回错误信息,并终止
程序。

3.6接口正常传传包信息;上号相关接口正常传公共参数

3.4
请求上号接口

3.4.1
接口描述

获取服务端上号token

3.4.2
请求方法

环境
请求方式
请求类型

线上
post
/qsshv3/platformXYZ/quick/getServerOrderToken

入参示例

代码块

1 {
2 "app_channel": "tzh_123456",

## Page 5

3 "app_id": 800101600,
4 "app_version_code": 222,
5 "app_version_name": "2.2.2",
6 "auth_token": "",
7 "auth_version": "101",
8 "secure_version": "101",
9 "signature_nonce": "",
10 "uncode": "aaaaaa",
11 "source": 111,
12 "qrcode": "axj",
13 "ip": "127.0.0.1",
14 "open_type": 3,
15 "queue_id": 28851066,
16 "quick_version": "33",
17 "order_login": "1128044246_1731897178_jr2XFpXL_9"
18 }
请求参数

字段
类型
必填
说明

app_channel
string
必须
公共参数,应用ID
(由开
发人员单独提供)
做数据

统计\封控
英文_数字

ps:tzh_123456(不同
包可以分开固定一个字符
串)

app_id
int
必须
app_id

app_version_code
int
必须
公共参数:app版本
ps:
111

app_version_name
string
必须
公共参数:app版本
name
ps:1.1.1

auth_token
string
非必传
公共参数:登录token
先
传空

auth_version
string
必须
公共参数:版本
前端固定
101

secure_version
string
必须
公共参数:版本
前端固定
101

## Page 6

signature_nonce
string
非必填
公共参数:8位随机串

uncode
string
必须
订单解锁码

source
int
必须
第三方快速上号来源

qrcode
string
非必填
qrcode

ip
string
非必填
ip

open_type
int
必须
队列类型;
默认0-1.3,
1-
1.5,
3-2.3扫码上号,
4-

2.3上号前检测

queue_id
int
非必填

1.5和2.3队列id

quick_version
string
必须
快速上号版本

order_login
string
必须
订单登录唯一码

响应结果

返参示例

代码块

1 {"status":1,"message":"正在处理中, 请稍候..","data":
{"queue_id":123456,"verify_url":""},"timestamp":"17308762848359"}
响应参数

字段
类型
必填
说明

status
int
是
状态
1成功
其他错误码失
败

msg
string
是
消息提示

data
string
是
data
⻅下面json

代码块

1 getServerOrderToken(open_type=4)2.3上号前检测 参数
order_id,userid,app_id_real,app_version,quick_version
2 轮询获取滑块结果,也调这个接口(提交滑块结果接口返回1)

## Page 7

3 {"status":0,"message":"上号参数错误~~~","data":
{"queue_id":0,"verify_url":""},"timestamp":"17308762848359"}
4 {"status":1,"message":"正在处理中, 请稍候..","data":
{"queue_id":123456,"verify_url":""},"timestamp":"17308762848359"}
5 {"status":2,"message":"需要进行滑块验证","data":
{"queue_id":123456,"verify_url":""},"timestamp":"17308762848359"}
6 {"status":3,"message":"{remark(不需要滑块/请求滑块失败等)}, 请直接上号~","data":
{"queue_id":0,"verify_url":""},"timestamp":"17308762848359"}
7 getServerOrderToken(open_type=3)获取上号token结果 参数queue_id,userid
8 {"status":0,"message":"上号参数错误~~~","data":
{"queue_id":0,"verify_url":""},"timestamp":"17308762848359"}
9 {"status":1,"message":"正在进行, 请稍候..","data":
{"queue_id":123456,"verify_url":""},"timestamp":"17308762848359"}
10 {"status":3,"message":"操作成功, 上号中..","data":
{"queue_id":123456,"verify_url":""},"timestamp":"17308762848359"}
11 {"status":4,"message":"上号失败,{错误信息},请重试~","data":
{"queue_id":0,"verify_url":""},"timestamp":"17308762848359"}
3.5
添加上号队列

3.5.1
接口描述

添加上号队列

3.5.2
请求方法

环境
请求方式
请求类型

线上
post
/qsshv3/platformXYZ/quick/setOrderQueue

入参示例

代码块

1 {
2 "app_channel": "tzh_123456",
3 "app_id": 800101600,
4 "app_version_code": 222,
5 "app_version_name": "2.2.2",
6 "auth_token": "",
7 "auth_version": "101",
8 "secure_version": "101",
9 "signature_nonce": "",
10 "uncode": "aaaaaa",
11 "source": 111,

## Page 8

12 "order_login": "1128044246_1731897178_jr2XFpXL_9",
13 "qrcode": "axj",
14 "verify_data": "hh",
15 "ip": "127.0.0.1",
16 "device-ident": "1",
17 "open_type": 3,
18 "queue_id": 28851066,
19 "quick_version": "33"
20 }
请求参数

字段
类型
必填
说明

app_channel
string
必须
公共参数,应用ID
(由开
发人员单独提供)
做数据
统计\封控
英文_数字

ps:tzh_123456(不同
包可以分开固定一个字符
串)

app_id
int
必须
app_id

app_version_code
int
必须
公共参数:app版本

app_version_name
string
必须
公共参数:app版本
name

auth_token
string
非必传
公共参数:登录token
传
空

auth_version
string
必须
公共参数:版本
前端固定
101

secure_version
string
必须
公共参数:版本
前端固定
101

signature_nonce
string
非必填
公共参数:8位随机串

uncode
string
必传
订单解锁码

source
int
必须
第三方快速上号来源

order_login
string
必须
订单登录唯一码

## Page 9

qrcode
string
必须
qrcode

verify_data
string
非必填
验证数据

ip
string
非必填
ip

device-ident
string
非必填
ios设备号相当于imei
同
步免费玩兼容的

open_type
int
必须
队列类型;
默认0-1.3,
1-
1.5,
2-云QQ,
3-2.3扫码上

号,
4-2.3上号前检测

queue_id
int
非必填

1.5和2.3队列id

quick_version
int
必须
快速上号版本

返参示例

代码块

1 {"status":1,"message":"正在进行, 请稍候..","data":
{"queue_id":123456},"timestamp":"17308760625435"}
响应结果

字段
类型
必填
说明

status
int
是
状态
1成功
其他错误码失
败

msg
string
是
消息提示

data
string
是
data
⻅下面json

代码块

1 setOrderQueue(open_type=4)提交滑块结果 参数 order_id,userid,verify_data均必填
2 {"status":0,"message":"参数错误","data":
{"order_id":0},"timestamp":"17308760625435"}
3 {"status":1,"message":"正在处理滑块验证中, 请稍候..","data":
{"order_id":23563429},"timestamp":"17308760625435"}
4 {"status":2,"message":"请求滑块验证失败, 请直接上号~","data":
{"order_id":23563429},"timestamp":"17308760625435"}

## Page 10

5 setOrderQueue(open_type=3)请求上号 参数 order_id,order_login,source,
scan_ip,client_ip,qrcode,app_id_real,app_version,quick_version
6 {"status":0,"message":"参数错误","data":
{"queue_id":0},"timestamp":"17308760625435"}
7 {"status":1,"message":"正在进行, 请稍候..","data":
{"queue_id":123456},"timestamp":"17308760625435"}
8 {"status":2,"message":"检测到此账号状态异常,已为您自动撤单,租金已返还,请更换账
号!","data":{"queue_id":0},"timestamp":"17308760625435"}
9 {"status":4,"message":"上号初始化失败, 请重试~","data":
{"queue_id":0},"timestamp":"17308760625435"}
3.6
快速上号获取订单信息

3.6.1
接口描述

快速上号获取订单信息

3.6.2
请求方法

环境
请求方式
请求类型

线上
post
/qsshv3/platformXYZ/orderinfo

入参示例

代码块

1 {
2 "uncode": "aaaaa",
3 "app_version_code": 45,
4 "quick_version": "14",
5 "platform_name": "tzh",
6 "pkg_sign": "xxxx",
7 "pkg_secret": "xxxxx",
8 "pkg_name": "xxxx"
9 }
请求参数

字段
类型
必填
说明

uncode
string
必传
订单解锁码

## Page 11

app_version_code
int
必须
公共参数:app版本
ps:
111

quick_version
string
必须
快速上号版本

platform_name
string
必须
平台名

pkg_sign
string
必须
包签名
(找产品提供)

pkg_secret
string
必须
包密钥(找产品提供)

pkg_name
string
必须
包名(找产品提供)

返参示例

代码块

1 {"status":200,"message":"获取成功","data":{"address":"qk-
hao.zuhaowan.com","auth_captcha_url":"","auth_plan_vpn":0,"cloud_access_key":""
,"cloud_bid":"","cloud_device_data":"","cloud_login":0,"cloud_openid":"","cloud
_plan":0,"cloud_proto_data":"","cloud_scheduling":0,"cloud_timeout":0,"cloud_ui
d":"","default_source":"","download_url":"","etimer":"2024-11-21
14:47:24","fast_token":"","game_auth":"","game_auth_88":"","game_auth_address":
"","game_auth_port":"","game_auth_ports":
[],"game_auth_type":0,"game_info":null,"game_mm":"","game_sign":"","game_update
_tip":"","gameappid":"","gamepkgname":null,"gid":11,"haima_cloud":0,"hid":64069
98,"huoshan_cloud":null,"id":1162863362,"inhibit_speech":-1,"is_wx_server":0,"j
sm":"你们好烦啊","last_source":"","loading":"启动游戏最多需要30秒,请勿退出本⻚
面...","mm":"3adef6b2bcf489a8c213487fe82d8376","nl_cloud_appid":"","nl_cloud_to
ken":"","no_typing":-1,"offline_switch":0,"order_login":"1279160170_1732068658_
Wa1DiThd_0","order_scheduling":0,"port":"20002","process_set":
[],"qrcode_err_report":0,"qrcode_risk_switch":0,"qrcode_white_url":"","quick_84
_switch":-1,"quick_cloud":"","quick_device":"","quick_identity":"","quick_token
":"","quick_type":[{"name":"zz23","weight":99,"source":"570","quick_desc":"账密
开通2.3","off_rent":["账号或密码不正确","账号/密码错误","授权已经过期","此处已按照过期
处理"],"retry":
[],"retry_times":0,"loading":""}],"quick_type_sub":"","quick_vbox_phone_memory"
:0,"rent_auth_address":"","rent_auth_port":"","rent_auth_ports":"","reopen_islo
ck":0,"reopen_timelock":0,"reopen_timeout":0,"reopen_tips":
[],"repair_switch":0,"scan_barrier_switch":0,"scan_risk_switch":0,"scheduling_r
eason":"","shfs":0,"stimer":"2024-09-05
09:42:24","total_times":0,"try_times":0,"uncode":"7bfccbd79c4c60276406998","usa
ble_times":0,"vbox_offline_switch":0,"vpn_device":0,"vpn_switch":0,"zh":"123456
512","zq":5}}
响应结果

## Page 12

字段
类型
必填
说明

status
int
是
状态
200成功
其他错误码
失败

msg
string
是
消息提示

data
string
是
string
;
order_login
上
号接口需要,透传;上号
需要的source从
quick_type下面取
透
传;

防御服务

🚅 防御接口主要为三方平台在下单、上号前接入租号玩平台的防御能力,进行⻛险检测与验
证。通过这些接口,平台可以根据设定的防御规则对用戶行为进行实时监测。当系统检测到
某些异常或⻛险行为并触发防御规则时,接口会返回相应的处罚规则。调用方根据返回的规
则进行后续处理,如用戶行为拦截、账号封禁、人脸验证等。该机制旨在提升平台的安全
性,防止恶意行为,保障用戶和平台的安全。

4.1
API
功能列表简介

序号
API
描述

1

/api/platformXYZ/defense/detect
检测及上报接口

2
/api/platformXYZ/defense/callback
回调接口

4.2
检测接口

接口描述

注意事项

💡 目前支持的检测类型参考检测类型标识,调用时请确保至少存在一种检测类型,否则无任何
作用。

Body中加粗参数对应检测类型

## Page 13

请求方法

Path:
/api/tzh/defense/detect

Method:
POST

请求参数

Headers

Body

请求示例

## Page 14

代码块

1 {"app_id":800101600,"sign":"abc","timestamp":123123123,"trace_id":"afdskfsdfkj"
,"business_type":"zhw","scene":"shanghao","xdid":"224ff8ab5e29f3988ed60d5313282
240","ip":"127.0.0.1","client_ip":"127.0.0.2","os_type":1,"sh_type":0,"order_id
":1279162606,"quick_type":"server","app_version_code":"5252","device_label":
["isjail","isRoot"],"uid":1885250619,"idcard":"341281199611068995","applist":"2
947f8ae3edc513c673b4381ff47eb5fd3cae36a013112191b049cee207c69281d145092ef48dcf5
b8dc93483793fe3b85acaad6b341bd5adf2e43707ff68b35828d55d65a1eb55d28c6a7eb85426d2
804e7a12d670c1d4c225fa509a56737276e5fb14be9ee0be16125cb6e7b3ec87b4c85635a9f5435
339037c2bb1859556387deb5a01085a36540f7656225ae4c010c924e481e0a35042b1e87c1e99b4
1013878a74c30b7760de02c00b79b889907914f4989c84e0c4b31af929b0785a7fb60d7e1190c5b
1afbbdb840cc351fb94825ea59be77fd8235e3af1c8fe3e73dec50fcd0729de9c5611e77b7fa7a7
d2e205d5b962d32535773cc6e3cc9ca3d9fb87975a0be792775e15e56bb48423b17a95a9cbc6aa4
85c45687c0d8a9904da0006b9132156d3ee172af6b04a3c455188765d23848988658af3e8a680cf
51dc0af5c7c2d3e73ab73cbd4ad9e398cd68f2c8f648ec0ef0c4aefa2477da3128cbc97f91afe7b
cb95f2503e613dd5cf6310474edda51754a6b2797bca640b1c32f0b833c73dbdd8487c1a7152d09
dd46c300b7c358786510faad0a5d9becca0bb88e32e1f4f56e1f0d26ed4bd3897889a4f94ee23dc
436f9aaa373f151f2d816f","hardware_id":"00000000-026d-e838-f27b-
491f0033c587","smid":"20241009103527cee94eb5a4bde57c0b4f3ab6713c46cd0186cf29a36
f7c14","smanti_id":"BATuGY56sOu2aXqPq1rd2YGrJNB2o2AlqQ8NT7K6/axkyoJOZ7LrKFmGUrT
dN98AvxEpdwsHa2L/vme8d+FY1Sw=="}
返回数据

💡 注:当处罚执行方为内部时,例如:投诉订单为调用接口时会自动投诉,不需要三方手动
调用投诉接口触发

另外部分处罚类型如果三方无法实现或者根据自身的业务进行跳过。例如人脸验证存在人
脸一次后解除和每次调用人脸,这时三方可以根据自己平台的要求人脸一次后跳过后续的
人脸。

## Page 15

响应数据示例

代码块

1 {
2 "status": 400,
3 "msg": "success",
4 "data": {
5 "punishList": [
6 {
7 "Action": "block", // 禁止下一步
8 "Data": null,
9 "DetectorType": "xdid", // xdid检测导致的处罚
10 "ExcuteType": 0, // 0调用方执行,1接口自动执行
11 "Remark": "",
12 "RuleID": 329, // 关联的规则id
13 "SerialNo": ""
14 },
15 {
16 "Action": "ts_order", // 投诉订单
17 "Data": { // 投诉时用到的扩展信息
18 "app_id": 0,
19 "ip": "",
20 "lb": 3,
21 "lb_sub": 24,
22 "order_id": 0,
23 "remark": "xdid:gdsgsdgsdgsdg",
24 "source_type": 0,
25 "uid": 0,

## Page 16

26 "user_id": ""
27 },
28 "DetectorType": "xdid",
29 "ExcuteType": 1, // 0调用方执行,1接口自动执行
30 "Remark": "",
31 "RuleID": 329,
32 "SerialNo": ""
33 },
34 {
35 "Action": "close_user", // 关闭用戶
36 "Data": {
37 "day": 3,
38 "remark": "",
39 "uid": 0,
40 "user_id": ""
41 },
42 "DetectorType": "xdid",
43 "ExcuteType": 0,
44 "Remark": "",
45 "RuleID": 329,
46 "SerialNo": ""
47 },
48 {
49 "Action": "close_relevant_user", // 关闭关联用戶
50 "Data": {
51 "day": 3,
52 "remark": "",
53 "uid": 0,
54 "user_id": ""
55 },
56 "DetectorType": "xdid",
57 "ExcuteType": 0,
58 "Remark": "",
59 "RuleID": 329,
60 "SerialNo": ""
61 },
62 {
63 "Action": "face", // 人脸验证
64 "Data": null,
65 "DetectorType": "xdid",
66 "ExcuteType": 1,
67 "Remark": "",
68 "RuleID": 329,
69 "SerialNo": "abcdefg001" // 回调时用于关联的业务订单号
70 }
71 ]
72 }

## Page 17

73 }
4.3
处罚回调接口

接口描述

请求方法

Path:
/api/tzh/defense/callback

Method:
POST

注意事项

💡 回调接口用于处理需要用戶验证的处罚规则(例如人脸验证、短信验证等)。在用戶验证通
过后,系统会通过该接口通知我方,触发解除处罚等后续操作。此接口确保在验证成功后及
时更新处罚状态,以便恢复正常服务。

请求参数

Headers

Body

返回数据

## Page 18

4.4
字典

处罚动作

检测类型标识

设备标签

## Page 19

APP列表
请求示例
(applist参数rc4加密前格式)

代码块

1 {
2 "applist": [
3 {
4 "name": "\u5361\u7535\u8111\u5728\u7ebf",
5 "package": "com.CC.kdnzx",
6 "versionname": "1.0",

## Page 20

7 "versioncode": "1",
8 "sign": "60aab914b360d1761246a5d12481464b"
9 },
10 {
11 "name": "\u7edd\u5730\u6c42\u751f \u5168\u519b\u51fa\u51fb",
12 "package": "com.tencent.tmgp.pubgm",
13 "versionname": "1.0.4.10.0",
14 "versioncode": "107",
15 "sign": "965206959fdd7ff3678ca911b02375a2"
16 },
17 {
18 "name": "\u738b\u8005\u8363\u8000",
19 "package": "com.tencent.tmgp.sgame",
20 "versionname": "1.33.1.35",
21 "versioncode": "33013506",
22 "sign": "e9b518b0fa85c7b7d5c2c5bfba79217d"
23 }
24 ]
25 }
FAQ

1. 滑块验证机制可以根据第三方自己的业务机制进行跳过或者跟租号玩保持一致进行一直验证,但验
证不通过进行跳过的话,很可能出现货架无法上号的情况。

2. 滑块验证可以进行一直验证,不存在多次验证后报错的情况。
