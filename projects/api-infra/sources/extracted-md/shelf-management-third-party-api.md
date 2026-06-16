# 货架管理三方API文档

- Source PDF: `../raw-pdfs/货架管理三方API文档.pdf`
- Original file: `货架管理三方API文档.pdf`
- Pages: 122

## Page 1

货架管理三方API文档

文档ID:
货架管理三方API文档_1.0

产品:

初版:
1.0

版本分发:
1.0

版本记录

版本

作者
审核人
类型
修订内容
修改日期

(yyyy-mm-
(I-初稿,
dd)

A-添加,M-
修改,D-删
除)

1.0
陈振伟

添加
创建文档
2025-02-18

2.0
陈振伟

添加
• 部分接口新增字段(备注:v2 2025-08-15

新增)

• 新增接口(3.21
-
3.32)

• /v2/orderList已弃用,请使
用/v3/rentOutOrderList

2.1

添加
• 新增货架发布接口
(3.20)
待定

• 新增游戏装备库接口(3.22)

• 新增游戏发布规则配置
(3.23)

• 货架修改接口支持csgo
(3.21)

1.概述

💡 本文档详细说明游戏账号货架管理API的功能规范及调用方式。本套接口为第三方合作伙伴提
供安全高效的平台接入能力,支持通过标准化接口实现货架信息管理,满足账号租赁业务的
系统对接需求。

## Page 2

目录:

1.概述
1.1
文档说明
1.1.1
格式说明
1.2
适用范围
1.3
准备资料
1.4
商戶账号注册方法(请先提供未注册账号给到租号玩商务,后续再进行注册)
1.5
接口用法说明
1.5.1
请求参数和状态码对照
2.
鉴权说明
2.1
签名方法
2.1.1
详细示例-PHP版签名算法
2.1.2
详细示例-JAVA版本签名算法
2.1.3详细示例-Go版本签名算法
3.
接口列表
3.1
游戏列表
基本信息
请求参数
返回数据
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

## Page 3

本文档所描述的API适用于任何需要管理账号的第三方公司。通过我们的API,第三方公司可以访问
本平台上的游戏账号信息,实现账号的管理。如果您的公司需要实现类似的功能,请参考本文档中
提供的API接口,并根据接口用法说明进行调用。

1.3 准备资料

资料准备流程:

资料提供清单:

第三方提供

资料
说明

## Page 4

公司名称(英文)
示例:lbx

商戶账号
第三方公司在租号平台注册的【账号】,详细注册方
法⻅
1.4商戶账号注册方法

租号平台提供

应用信息
说明

appId
用于
app
参数验签,本租号平台开发人员单独提供

appSecret
用于
app
参数验签,本租号平台开发人员单独提供

...
...

1.4 商戶账号注册方法(请先提供未注册账号给到租号玩商务,后续再进行
注册)

1. 打开链接
https://www.zuhaowan.com/

2. 点击⻚面右上【注册】,进入账号注册⻚面

3. 使用【手机号方式】注册账号

## Page 5

4. 注册成功后返回首⻚,注册手机号即为商戶账号

1.5 接口用法说明

内容
说明

传输方式
https
协议
(测试环境http协议)

请求地址
生产环境:https://open-api.23solo.com/

测试环境:暂不对外开放

请求方式
POST

请求路径格式
/shanghu/[platformXYZ]/xx/yy

[platformXYZ]
为公司名称(英文)

(以开发人员最终提供路径为准)

接口鉴权
签名机制,请参考下方2.鉴权说明

字符编码
接口统一UTF-8编码

响应格式
统一采用JSON格式,以下是响应字段说明:

包含四个字段:<status>、<msg>、<data>

<status>:int类型,表示错误码,-1为签名错误,1为
成功,其他值为错误码,具体错误码含义请参考错误
码表1.4.2
请求参数和状态码对照

<msg>:string类型,表示错误信息,当<status>为非
1时,标识错误说明,status=1时<msg>可忽略;

<data>:返回的数据,如果该接口有返回数据,则数
据放在<data>字段内(具体⻅接口说明),没有数据
时,data为null

## Page 6

开发语言
任意,只要可以向租号平台发起HTTP请求的均可

1.5.1 请求参数和状态码对照

a. 公共参数

字段
说明

app_id
公共参数,应用ID
(由开发人员单独提供),详⻅
1.3准备资料

sign
公共参数,参数签名

timestamp
公共参数,当前时间戳(s)

除以上公共参数外,其余必须参数⻅各自接口说明

b. 响应参数

字段
说明

status
状态码

msg
错误消息

data
数据签名

c. 状态码

字段
说明

-1
签名错误

1
执行成功

0
参数错误

d. 服务响应码参照

错误码
说明

## Page 7

0
错误提示

-1
签名错误

-100
系统内部异常

1
成功

2. 鉴权说明

为保证数据传输过程中的数据真实性、完整性和不可抵赖,并防止提交的数据被非法篡改,我们需要
对数据进行数字签名,在接收签名数据之后进行签名校验。

2.1 签名方法

在进行接口调用之前,需要进行鉴权,使用到的参数如下:

参数
说明

app_id

应用ID
(由开发人员单独提供),详⻅1.3准备资料

app_secret
应用ID
(由开发人员单独提供),详⻅1.3准备资料

timestamp
请求时间戳,Unix时间戳,单位:秒

[业务参数]
接口中使用的业务参数

签名生成步骤如下:

1. 将所有请求参数按照ASCII码从小到大排序(不包括sign参数)

2. 把排序后的字段参数,依次转换为“字段名=字段值”
形式的字符串,再以“&”符号拼接

3. 使用hash_hmac算法计算数字签名

4. 将计算后的数字签名转成base64格式

以下是上述步骤的生成示例:

Sign
=

base64_encode(hash_hmac(‘app_id=123456&timestamp=1679801848&Key1=Value1&Key2=Value2&Ke
yN=ValueN’,
app_secret))

注意:所有租号平台提供的接口调用,都会先进行参数加密验签对照,如果验签不通过返回错误信
息,并终止程序。错误码对照如下,具体错误信息请参考
1.5.1请求参数和状态码对照。

## Page 8

错误码
说明
解决方法

0
错误提示

-1
签名错误
1. 检查签名的各个参数是否有缺
失,是否正确,特别确认下复
制的app_id和app_secret是否
正确

2. 检查时间戳格式是否错误,时间
戳单位:秒

3. 检查参数排序错误,所有参数
是否按照ASCII码从小到大排序

4. 检查签名计算错误,是否使用
了正确的加密算法

5. 签名计算完成后需要进行转换
成base64格式,可以检查
base64⻓度是否正常

-100
系统内部异常

1
成功

2.1.1 详细示例-PHP版签名算法

1. //
签名计算

b. ksort($postData);

c. $signStrArr
=
[];

d. foreach
($postData
as
$key
=>
$value)
{

e.

$signStrArr[]
=
$key
.'='.
$value;

f. }

g. $postStr
=
implode('&',
$signStrArr);

h. $sign

=
base64_encode(hash_hmac('sha1',
$postStr,
$app_secret));

i. $postData['sign']
=
$sign;

j.

k. //
请求接口

l. $apiUrl
=
'/api/platformXYZ/hao/list';

m. $return
=
curl($apiUrl,
$postData)

## Page 9

例:以
下单接口
为例,创建post数组

1. //
app_id和app_secret由租号应用开发人员单独提供

b. app_id

=
'123456'

c. app_secret
=
'123456'

d. //
提交的post数组

e. $postData
=
[

f.

'app_id'

=>
$app_id,

g.

'gid'

=>
11,

h.

'page'

=>
'1',

i.

'page_size'
=>
'10',

j. 'timestamp'

=>
'1620639709'

k. ];

PHP版本加密方法的输出:$sign
=

MmU4NDUyOWI2ODhjMDQ0YjA0MmE1N2I1ODQxOTk0MGEzM2U2NTgxOA==

2.1.2 详细示例-JAVA版本签名算法

代码块

1 /**
2 * 生成签名方法
3 * @param params
4 * @param secret
5 * @return
6 * @throws NoSuchAlgorithmException
7 * @throws InvalidKeyException
8 */
9 public static String sign(Map<String, Object> params, String secret)
throws NoSuchAlgorithmException, InvalidKeyException {
10 // 对请求参数按照字母顺序进行排序并组合
11 List<String> keys = new ArrayList<>(params.keySet());
12 Collections.sort(keys);
13 StringBuilder signatureBuilder = new StringBuilder();
14 for (int i = 0; i < keys.size(); i++) {
15 if (i != 0) {
16 signatureBuilder.append("&");

## Page 10

17 }
18 String k = keys.get(i);
19 // 这里没有对键和值进行URL编码,如果需要的话可以使用 URLEncoder.encode
20 signatureBuilder.append(k).append("=").append(params.get(k));
21 }
22 String signature = signatureBuilder.toString();
23 // 将排序后的signature进行HMAC-SHA1操作
24 Mac sha1Mac = Mac.getInstance("HmacSHA1");
25 SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(),
"HmacSHA1");
26 sha1Mac.init(secretKeySpec);
27 byte[] hash = sha1Mac.doFinal(signature.getBytes());
28 // 将哈希结果转换为十六进制字符串
29 String hexHash = String.format("%040x", new BigInteger(1, hash));
30 // 返回Base64编码后的签名
31 return Base64.getEncoder().encodeToString(hexHash.
2.1.3详细示例-Go版本签名算法

代码块

1
2 // sign 生成签名函数
3 func sign(postData map[string]interface{}, appSecret string) (string, error) {
4 // 2. 对 postData 进行按键排序
5 keys := make([]string, 0, len(postData))
6 for k := range postData {
7 keys = append(keys, k)
8 }
9 sort.Strings(keys)
10
11 // 3. 初始化 signStrArr 切片
12 var signStrArr []string
13
14 // 4. 遍历 postData,并构建签名字符串数组
15 for _, key := range keys {
16 valueStr := interfaceToString(postData[key])
17 signStrArr = append(signStrArr, fmt.Sprintf("%s=%s", key, valueStr))
18 }
19
20 // 7. 使用 & 连接数组元素,生成待签名字符串
21 postStr := strings.Join(signStrArr, "&")
22
23 // 8. 使用 HMAC-SHA1 算法生成签名
24 hmacSha1 := hmac.New(sha1.New, []byte(appSecret))
25 _, err := hmacSha1.Write([]byte(postStr))

## Page 11

26 if err != nil {
27 return "", err
28 }
29 signature := hmacSha1.Sum(nil)
30
31 s := fmt.Sprintf("%x", signature)
32 // 9. 对签名进行 base64 编码
33 signatureBase64 := base64.StdEncoding.EncodeToString([]byte(s))
34 return signatureBase64, nil
35 }
36
37 // interfaceToString 将 interface{} 类型的值转换为字符串
38 func interfaceToString(value interface{}) string {
39 switch v := value.(type) {
40 case string:
41 return v
42 case int, int64, int32, int16, int8, uint, uint64, uint32, uint16, uint8:
43 return fmt.Sprintf("%d", v)
44 case float32, float64:
45 return fmt.Sprintf("%f", v)
46 case bool:
47 return fmt.Sprintf("%v", v)
48 default:
49 return ""
50 }
51 }
3. 接口列表

3.1 游戏列表

基本信息

Path:
/shanghu/[platformXYZ]/v2/gameList

Method:
POST

接口描述:

请求参数

Headers

## Page 12

Body

返回数据

返回示例

代码块

1 {
2 "status": 1,
3 "msg": "ok",
4 "data": [
5 {
6 "id": 11,
7 "title": "穿越火线"
8 },
9 {
10 "id": 443,
11 "title": "王者荣耀"
12 }
13 ]
14 }
3.2 获取用戶的全部标签

## Page 13

基本信息

Path:
/shanghu/[platformXYZ]/v2/getUserShrLabels

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

返回示例

代码块

1 {
2 "status": 1,
3 "msg": "ok",

## Page 14

4 "data": {
5 "fix_list": [],
6 "fix_max": 8,
7 "list": [
8 {
9 "id": 116,
10 "name": "d"
11 },
12 {
13 "id": 115,
14 "name": "c"
15 },
16 {
17 "id": 114,
18 "name": "b"
19 },
20 {
21 "id": 113,
22 "name": "a"
23 }
24 ]
25 }
26 }

3.3 计算货架套餐价格

基本信息

Path:
/shanghu/[platformXYZ]/v2/calculatePrice

Method:
POST

接口描述:

请求参数

Headers

## Page 15

Body

返回数据

返回示例

代码块

1 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "money_10h": 16,
7 "money_afternoon": 12,
8 "money_day": 28,
9 "money_morning": 6,
10 "money_night": 10,
11 "money_week": 140
12 }
13 }
3.4 货架上架

## Page 16

基本信息

Path:
/shanghu/[platformXYZ]/v1/onRentHao

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

返回示例

代码块

1 //返回示例
2 {
3 "status": 1,
4 "msg": "上架成功!",
5 "data": {
6 "hid": 11210024
7 }
8 }
9

## Page 17

10 //返回失败示例
11 {
12 "status": 0,
13 "msg": "为确保该账号可正常上号,请重新开通端游快速上号。",
14 "data": {
15 "hid": 10195730
16 }
17 }
3.5 货架下架

基本信息

Path:
/shanghu/[platformXYZ]/v1/offRentHao

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 18

返回示例

代码块

1 //返回示例
2 {
3 "status": 1,
4 "msg": "下架成功!",
5 "data": {
6 "hid": 10195731
7 }
8 }
9
10 //返回失败示例
11 {
12 "status": 0,
13 "msg": "非待租状态不允许下架!",
14 "data": {
15 "hid": 10195730
16 }
17 }
3.6 货架批量上架

基本信息

Path:
/shanghu/[platformXYZ]/v1/batchOnRentHao

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 19

返回数据

返回示例

代码块

1 //返回示例
2 {
3 "status": 1,
4 "msg": "批量上架成功!",
5 "data": {
6 "hid": 6407608,
7 "msg": "批量上架成功!"
8 }
9 }
10
11 //返回失败示例
12 {
13 "status": 0,
14 "msg": "为确保该账号可正常上号,请重新开通端游快速上号。涉及货架号:
10195730,10195731",
15 "data": {
16 "hid": 10195731,
17 "msg": "为确保该账号可正常上号,请重新开通端游快速上号。涉及货架号:
10195730,10195731"
18 }
19 }
3.7 货架批量下架

## Page 20

基本信息

Path:
/shanghu/[platformXYZ]/v1/batchOffRentHao

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

返回示例

代码块

1 返回示例
2 {
3 "status": 1,
4 "msg": "批量下架成功!",
5 "data": {
6 "hid": 0,

## Page 21

7 "msg": "批量下架成功!"
8 }
9 }
3.8 删除货架

基本信息

Path:
/shanghu/[platformXYZ]/v1/delHao

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

返回示例

代码块

1 //返回示例

## Page 22

2 {
3 "status": 1,
4 "msg": "删除成功",
5 "data": {}
6 }
7
8 // 失败
9 {
10 "status": 0,
11 "msg": "支付密码错误次数过多,请5分钟后尝试!",
12 "data": {}
13 }
3.9 批量隐藏、消隐货架

基本信息

Path:
/shanghu/[platformXYZ]/v2/hideHaoByIds

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 23

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "操作成功!!",
5 "data": []
6 }
7
8 // 失败
9 {
10 "status": 0,
11 "msg": "货架号:10195730,不是下架状态,只有下架状态才可以隐藏!",
12 "data": []
13 }
3.10 拉黑租客

基本信息

Path:
/shanghu/[platformXYZ]/v2/addBlackUser

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 24

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "拉黑成功!",
5 "data": []
6 }
7
8 // 失败
9 {
10 "status": 0,
11 "msg": "非订单的号主不能拉黑!",
12 "data": []
13 }
3.11 取消拉黑租客

基本信息

Path:
/shanghu/[platformXYZ]/v2/delBlackUser

Method:
POST

接口描述:

## Page 25

请求参数

Headers

Body

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "拉黑已移除黑名单",
5 "data": []
6 }
7 // 失败
8 {
9 "status": 0,
10 "msg": "用戶已经移除黑名单",
11 "data": []
12 }

## Page 26

3.12 货架设置备注

基本信息

Path:
/shanghu/[platformXYZ]/v2/addHaoRemark

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "操作成功!",
5 "data": []
6 }

## Page 27

3.13 货架操作日志

基本信息

Path:
/shanghu/[platformXYZ]/v2/getHaoChangeList

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 28

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "add_time": "2025-02-19 10:10:21",
10 "author_name": "商戶",
11 "do_type_name": "下架",
12 "game_name": "穿越火线",
13 "gid": 11,
14 "hid": 6407311,
15 "id": 20892,
16 "remark": "",
17 "source_name": "官网",

## Page 29

18 "uid": 1
19 }
20 ]
21 }
22 }
3.14 货架预约自动上架

基本信息

Path:
/shanghu/[platformXYZ]/v2/haoAutoOnRent

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 30

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "操作成功!",
5 "data": []
6 }
3.15 货架出租中预约下架

基本信息

Path:
/shanghu/[platformXYZ]/v2/bookHaoDown

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 31

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "货架预约下架成功!",
5 "data": null
6 }
7
8 // 失败
9 {
10 "status": 0,
11 "msg": "出租中的货架才可以预约下架!",
12 "data": null
13 }
3.16 货架列表

基本信息

Path:
/shanghu/[platformXYZ]/v2/searchAccount

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 32

返回数据

## Page 33

(??????)

## Page 34

(??????)

## Page 35

(??????)

## Page 36

返回示例

代码块

1 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {

## Page 37

6 "count": 4,
7 "criteria": {
8 "account_count": {
9 "all": 4,
10 "deleted": 0,
11 "hide": 0,
12 "noPass": 0,
13 "offRent": 4,
14 "onRent": 0,
15 "verify": 0,
16 "wait": 0
17 },
18 "changeSwitch": 1,
19 "hand_act_info_switch": "1",
20 "hao_score_switch": 1,
21 "quick_client_v22_pc_open": "1",
22 "sync_role_to_remark_switch": "1"
23 },
24 "list": [
25 {
26 "ai_price_status": 0,
27 "allow_no_play": 0,
28 "allow_no_play_v2": 0,
29 "apply": 1,
30 "book_hours": 0,
31 "book_id": 0,
32 "book_minutes": 0,
33 "book_status": 0,
34 "bzmoney": "0.00",
35 "c_rank": 0,
36 "categoryid": 1,
37 "change_price_status": 0,
38 "claim_status": 0,
39 "cpa_status": 0,
40 "cpa_status_str": "未加入",
41 "credit_score": "100",
42 "em": "0.00",
43 "event_guid": "9a52ffc8-9394-4318-b5fa-0a160ec57140",
44 "ft": "2022-07-28 10:44:34",
45 "game_name": "王者荣耀",
46 "game_server_name": "QQ账号",
47 "game_zone_name": "QQ安卓",
48 "gid": 443,
49 "h_account_region": "",
50 "h_remark": "",
51 "h_score": 0,
52 "h_tag": 2,

## Page 38

53 "h_up_pwd_hours": 0,
54 "h_up_pwd_time": "0",
55 "h_up_pwd_timeout": 0,
56 "haoAlertPwdFlag": 0,
57 "hao_game_credit": "-",
58 "hao_score": "0.0",
59 "health_time": null,
60 "hz_game_login_status": 0,
61 "id": 10194766,
62 "insure_id": 0,
63 "is_quick_login": 0,
64 "is_show_battle_gen_token": 0,
65 "is_show_camp_auth_dialog": 0,
66 "is_show_net_account_maintain": 0,
67 "is_show_r_star_phone_token": 0,
68 "is_show_steam_phone_token": 0,
69 "jsm": "倩兮盼兮玲珑",
70 "maybe_face": 0,
71 "no_play": 0,
72 "offrent_time": "",
73 "on_rent_time": "",
74 "partnerid": 0,
75 "partnername": "",
76 "picc": null,
77 "pid": 7717,
78 "pmoney": "10.00",
79 "pn": "【89皮】倩兮dsg盼兮玲珑ffffffffff",
80 "quick_client_auth_1574": 0,
81 "quick_client_auth_1574_status": 0,
82 "quick_client_no_expire": 0,
83 "quick_client_status": 0,
84 "quick_client_time_message": "",
85 "quick_client_type": "",
86 "quick_login_open_style": "--",
87 "quick_login_switch": 1,
88 "quick_login_switch_btn": 1,
89 "quick_open_style_name": "",
90 "quick_wx": 0,
91 "rank_top": 0,
92 "shfs": 1,
93 "show_game_insure": 0,
94 "show_picc_insure": 1,
95 "soft_show": 1,
96 "speed_flag": 0,
97 "szq": 2,
98 "timelimit_id": 0,
99 "up_time": "",

## Page 39

100 "web_login_status": -2,
101 "web_login_time": "",
102 "wwqy_close_end_time": "",
103 "wwqy_close_model": "",
104 "wwqy_close_start_time": "",
105 "wwqy_close_zt": 0,
106 "yaoqiu": "审核通过!",
107 "yx": "android",
108 "zh": "3378736526",
109 "zt": -1,
110 "zz_exclusive_pmoney": "0.00"
111 },
112 {
113 "ai_price_status": 0,
114 "allow_no_play": 0,
115 "allow_no_play_v2": 0,
116 "apply": 1,
117 "book_hours": 0,
118 "book_id": 0,
119 "book_minutes": 0,
120 "book_status": 0,
121 "bzmoney": "1.00",
122 "c_rank": 109,
123 "categoryid": 1,
124 "change_price_status": 0,
125 "claim_status": 0,
126 "cpa_status": 0,
127 "cpa_status_str": "未加入",
128 "credit_score": "100",
129 "em": "0.00",
130 "event_guid": "72818bf1-8a3c-4c22-a12d-4539aaba2bbf",
131 "ft": "2020-07-23 16:00:44",
132 "game_name": "王者荣耀",
133 "game_server_name": "QQ账号",
134 "game_zone_name": "QQ安卓",
135 "gid": 443,
136 "h_account_region": "",
137 "h_remark": "",
138 "h_score": 0,
139 "h_tag": 2,
140 "h_up_pwd_hours": 0,
141 "h_up_pwd_time": "0",
142 "h_up_pwd_timeout": 0,
143 "haoAlertPwdFlag": 0,
144 "hao_game_credit": "-",
145 "hao_score": "0.0",
146 "health_time": null,

## Page 40

147 "hz_game_login_status": 0,
148 "id": 7352531,
149 "insure_id": 0,
150 "is_quick_login": 1,
151 "is_show_battle_gen_token": 0,
152 "is_show_camp_auth_dialog": 0,
153 "is_show_net_account_maintain": 0,
154 "is_show_r_star_phone_token": 0,
155 "is_show_steam_phone_token": 0,
156 "jsm": "zhuzhuxia",
157 "maybe_face": 0,
158 "no_play": 0,
159 "offrent_time": "",
160 "on_rent_time": "",
161 "partnerid": 0,
162 "partnername": "",
163 "picc": null,
164 "pid": 7717,
165 "pmoney": "1.00",
166 "pn": "这这是标题是标题003这是描s这是描s",
167 "quick_client_auth_1574": 0,
168 "quick_client_auth_1574_status": 0,
169 "quick_client_no_expire": 0,
170 "quick_client_status": 0,
171 "quick_client_time_message": "",
172 "quick_client_type": "",
173 "quick_login_open_style": "1.3",
174 "quick_login_switch": 1,
175 "quick_login_switch_btn": 1,
176 "quick_open_style_name": "快速上号1.3",
177 "quick_wx": 0,
178 "rank_top": 0,
179 "shfs": 0,
180 "show_game_insure": 0,
181 "show_picc_insure": 1,
182 "soft_show": 1,
183 "speed_flag": 0,
184 "szq": 1,
185 "timelimit_id": 0,
186 "up_time": "",
187 "web_login_status": -2,
188 "web_login_time": "",
189 "wwqy_close_end_time": "",
190 "wwqy_close_model": "",
191 "wwqy_close_start_time": "",
192 "wwqy_close_zt": 0,
193 "yaoqiu": "中",

## Page 41

194 "yx": "android",
195 "zh": "916817706",
196 "zt": -1,
197 "zz_exclusive_pmoney": "0.00"
198 },
199 {
200 "ai_price_status": 0,
201 "allow_no_play": 0,
202 "allow_no_play_v2": 0,
203 "apply": 1,
204 "book_hours": 0,
205 "book_id": 0,
206 "book_minutes": 0,
207 "book_status": 0,
208 "bzmoney": "0.00",
209 "c_rank": 50,
210 "categoryid": 1,
211 "change_price_status": 0,
212 "claim_status": 0,
213 "cpa_status": 0,
214 "cpa_status_str": "未加入",
215 "credit_score": "120",
216 "em": "1.00",
217 "event_guid": "7c642e3e-deca-485e-9053-7ef73f090fb2",
218 "ft": "2019-05-28 11:11:14",
219 "game_name": "王者荣耀",
220 "game_server_name": "QQ账号",
221 "game_zone_name": "QQ安卓",
222 "gid": 443,
223 "h_account_region": "",
224 "h_remark": "12320",
225 "h_score": 0,
226 "h_tag": 2,
227 "h_up_pwd_hours": 0,
228 "h_up_pwd_time": "0",
229 "h_up_pwd_timeout": 0,
230 "haoAlertPwdFlag": 0,
231 "hao_game_credit": "-",
232 "hao_score": "0.0",
233 "health_time": null,
234 "hz_game_login_status": 0,
235 "id": 4187305,
236 "insure_id": 0,
237 "is_quick_login": 0,
238 "is_show_battle_gen_token": 0,
239 "is_show_camp_auth_dialog": 0,
240 "is_show_net_account_maintain": 0,

## Page 42

241 "is_show_r_star_phone_token": 0,
242 "is_show_steam_phone_token": 0,
243 "jsm": "23g23g",
244 "maybe_face": 0,
245 "no_play": 0,
246 "offrent_time": "",
247 "on_rent_time": "",
248 "partnerid": 0,
249 "partnername": "",
250 "picc": null,
251 "pid": 7717,
252 "pmoney": "4.00",
253 "pn": "技术测试中技术测试中技术测试中",
254 "quick_client_auth_1574": 0,
255 "quick_client_auth_1574_status": 0,
256 "quick_client_no_expire": 0,
257 "quick_client_status": 0,
258 "quick_client_time_message": "",
259 "quick_client_type": "",
260 "quick_login_open_style": "--",
261 "quick_login_switch": 1,
262 "quick_login_switch_btn": 1,
263 "quick_open_style_name": "",
264 "quick_wx": 0,
265 "rank_top": 0,
266 "shfs": 1,
267 "show_game_insure": 0,
268 "show_picc_insure": 1,
269 "soft_show": 1,
270 "speed_flag": 0,
271 "szq": 1,
272 "timelimit_id": 0,
273 "up_time": "",
274 "web_login_status": -2,
275 "web_login_time": "",
276 "wwqy_close_end_time": "",
277 "wwqy_close_model": "",
278 "wwqy_close_start_time": "",
279 "wwqy_close_zt": 0,
280 "yaoqiu": "禁止上架测试账号",
281 "yx": "android",
282 "zh": "3136976006",
283 "zt": -1,
284 "zz_exclusive_pmoney": "0.00"
285 },
286 {
287 "ai_price_status": 0,

## Page 43

288 "allow_no_play": 0,
289 "allow_no_play_v2": 0,
290 "apply": 1,
291 "book_hours": 0,
292 "book_id": 0,
293 "book_minutes": 0,
294 "book_status": 0,
295 "bzmoney": "0.00",
296 "c_rank": 50,
297 "categoryid": 1,
298 "change_price_status": 0,
299 "claim_status": 0,
300 "cpa_status": 0,
301 "cpa_status_str": "未加入",
302 "credit_score": "120",
303 "em": "1.00",
304 "event_guid": "fa29bb12-875b-47d5-a8f3-4c20ede1ffb2",
305 "ft": "2019-01-09 16:41:24",
306 "game_name": "王者荣耀",
307 "game_server_name": "QQ账号",
308 "game_zone_name": "QQ安卓",
309 "gid": 443,
310 "h_account_region": "",
311 "h_remark": "",
312 "h_score": 0,
313 "h_tag": 2,
314 "h_up_pwd_hours": 0,
315 "h_up_pwd_time": "0",
316 "h_up_pwd_timeout": 0,
317 "haoAlertPwdFlag": 0,
318 "hao_game_credit": "-",
319 "hao_score": "0.0",
320 "health_time": null,
321 "hz_game_login_status": 0,
322 "id": 3067971,
323 "insure_id": 0,
324 "is_quick_login": 0,
325 "is_show_battle_gen_token": 0,
326 "is_show_camp_auth_dialog": 0,
327 "is_show_net_account_maintain": 0,
328 "is_show_r_star_phone_token": 0,
329 "is_show_steam_phone_token": 0,
330 "jsm": "sdgsdhsdh6",
331 "maybe_face": 0,
332 "no_play": 0,
333 "offrent_time": "2025-03-13 12:22:17",
334 "on_rent_time": "",

## Page 44

335 "partnerid": 145,
336 "partnername": "慢猪2",
337 "picc": null,
338 "pid": 7717,
339 "pmoney": "1.00",
340 "pn": "测试测试测试22117777",
341 "quick_client_auth_1574": 0,
342 "quick_client_auth_1574_status": 0,
343 "quick_client_no_expire": 0,
344 "quick_client_status": 0,
345 "quick_client_time_message": "",
346 "quick_client_type": "",
347 "quick_login_open_style": "--",
348 "quick_login_switch": 1,
349 "quick_login_switch_btn": 1,
350 "quick_open_style_name": "",
351 "quick_wx": 0,
352 "rank_top": 0,
353 "shfs": 1,
354 "show_game_insure": 0,
355 "show_picc_insure": 1,
356 "soft_show": 1,
357 "speed_flag": 0,
358 "szq": 1,
359 "timelimit_id": 0,
360 "up_time": "",
361 "web_login_status": -2,
362 "web_login_time": "",
363 "wwqy_close_end_time": "",
364 "wwqy_close_model": "",
365 "wwqy_close_start_time": "",
366 "wwqy_close_zt": 0,
367 "yaoqiu": "",
368 "yx": "android",
369 "zh": "3136976006",
370 "zt": -1,
371 "zz_exclusive_pmoney": "0.00"
372 }
373 ]
374 }
375 }
3.17 订单列表(旧版)

## Page 45

基本信息

Path:
/shanghu/[platformXYZ]/v2/orderList

Method:
POST

接口描述:此接口弃用,建议使用v3版本

请求参数

Headers

Body

返回数据

## Page 46

返回示例

代码块

1 {
2 "status": 1,
3 "msg": "ok",

## Page 47

4 "data": {
5 "count": 6,
6 "list": [
7 {
8 "deposit": 1,
9 "end_time": "2025-01-09 19:11:32",
10 "game_name": "王者荣耀",
11 "game_server_name": "QQ账号",
12 "game_zone_name": "QQ安卓",
13 "gid": 443,
14 "h_tag": "-",
15 "hid": 7352531,
16 "is_black": 0,
17 "money_1h": 1.4,
18 "order_num": "96557401006597",
19 "owner_money": 1,
20 "partner_name": "",
21 "rent_hour": 1,
22 "role_name": "zhuzhuxia",
23 "start_time": "2025-01-09 18:06:32",
24 "status_str": "已完成",
25 "title": "这这是标题是标题003这是描s这是描s",
26 "zk_user": "17****11"
27 },
28 {
29 "deposit": 0,
30 "end_time": "2024-12-05 18:37:28",
31 "game_name": "王者荣耀",
32 "game_server_name": "QQ账号",
33 "game_zone_name": "QQ安卓",
34 "gid": 443,
35 "h_tag": "-",
36 "hid": 10194766,
37 "is_black": 0,
38 "money_1h": 12.8,
39 "order_num": "18t0b60j2h0d3sfw8jraxjx3ljgpeb19",
40 "owner_money": 20,
41 "partner_name": "",
42 "rent_hour": 2,
43 "role_name": "倩兮盼兮玲珑",
44 "start_time": "2024-07-18 11:30:53",
45 "status_str": "已完成",
46 "title": "go-【89皮】倩兮dsg盼兮玲珑ffffffffff",
47 "zk_user": "15****88"
48 }
49 ]
50 }

## Page 48

51 }
3.18 货架上传图片

基本信息

Path:
/shanghu/[platformXYZ]/v2/uploadPic

Method:
POST

接口描述:

💡 上传图片接口比较特殊,考虑到接口安全及鉴权因素,并不适用于前端直接调用。需要三
方后端接入再提供给前端使用。

请求参数

Headers

Body

返回数据

返回示例

代码块

## Page 49

1 返回示例
2 {
3 "status": 1,
4 "msg": "success",
5 "data": {
6 "image_url": "http://zhwpic.zuhaowan.com/images/account_img/2025-02-
18/67b43ee23feb5.jpg"
7 }
8 }
3.19 货架详情

基本信息

Path:
/shanghu/[platformXYZ]/v2/haoInfo

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 50

(??????)

## Page 51

(??????)

## Page 52

(??????)

## Page 53

返回示例

代码块

## Page 54

1 {
2 "status": 1,
3 "msg": "ok",
4 "data": {
5 "account":
"ZF4OQIoCZFKV8beBnZemnuGRmaFkFiIRlO3jpKT2r41ZgushL/Ysb5X5PrtmCPDm",
6 "channel": 1,
7 "client_quick_type": {
8 "message": "",
9 "name": "",
10 "quick_type": 0,
11 "status": 0
12 },
13 "client_quick_type_support": 0,
14 "credit_score": 120,
15 "deposit": 0,
16 "describe": "技术测试中技术测试中技术测试中",
17 "equipment_data": [
18 {
19 "dt_name": "英雄",
20 "game_id": 443,
21 "gd_num": 0,
22 "id": 47,
23 "list": [
24 {
25 "classify": 1,
26 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c194084d8.jpg",
27 "data_name": "刘禅",
28 "dt_id": 47,
29 "dt_name": "英雄",
30 "gd_id": 1519,
31 "gd_num": 0,
32 "hid": 4187305,
33 "parent_id": 0,
34 "pf_type": 0
35 },
36 {
37 "classify": 3,
38 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c26335fdc.jpg",
39 "data_name": "孙悟空",
40 "dt_id": 47,
41 "dt_name": "英雄",
42 "gd_id": 1536,

## Page 55

43 "gd_num": 0,
44 "hid": 4187305,
45 "parent_id": 0,
46 "pf_type": 0
47 },
48 {
49 "classify": 1,
50 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c296373d6.jpg",
51 "data_name": "夏侯惇",
52 "dt_id": 47,
53 "dt_name": "英雄",
54 "gd_id": 1540,
55 "gd_num": 0,
56 "hid": 4187305,
57 "parent_id": 0,
58 "pf_type": 0
59 },
60 {
61 "classify": 1,
62 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2a47e368.jpg",
63 "data_name": "项羽",
64 "dt_id": 47,
65 "dt_name": "英雄",
66 "gd_id": 1541,
67 "gd_num": 0,
68 "hid": 4187305,
69 "parent_id": 0,
70 "pf_type": 0
71 },
72 {
73 "classify": 4,
74 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2b0bfc7b.jpg",
75 "data_name": "小乔",
76 "dt_id": 47,
77 "dt_name": "英雄",
78 "gd_id": 1542,
79 "gd_num": 0,
80 "hid": 4187305,
81 "parent_id": 0,
82 "pf_type": 0
83 },

## Page 56

84 {
85 "classify": 2,
86 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2bb4a537.jpg",
87 "data_name": "雅典娜",
88 "dt_id": 47,
89 "dt_name": "英雄",
90 "gd_id": 1543,
91 "gd_num": 0,
92 "hid": 4187305,
93 "parent_id": 0,
94 "pf_type": 0
95 },
96 {
97 "classify": 2,
98 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2c94e4c1.jpg",
99 "data_name": "亚瑟",
100 "dt_id": 47,
101 "dt_name": "英雄",
102 "gd_id": 1544,
103 "gd_num": 0,
104 "hid": 4187305,
105 "parent_id": 0,
106 "pf_type": 0
107 },
108 {
109 "classify": 4,
110 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2f450a29.jpg",
111 "data_name": "嬴政",
112 "dt_id": 47,
113 "dt_name": "英雄",
114 "gd_id": 1548,
115 "gd_num": 0,
116 "hid": 4187305,
117 "parent_id": 0,
118 "pf_type": 0
119 },
120 {
121 "classify": 5,
122 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2fd43f3f.jpg",

## Page 57

123 "data_name": "虞姬",
124 "dt_id": 47,
125 "dt_name": "英雄",
126 "gd_id": 1549,
127 "gd_num": 0,
128 "hid": 4187305,
129 "parent_id": 0,
130 "pf_type": 0
131 },
132 {
133 "classify": 6,
134 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c308b2134.jpg",
135 "data_name": "张⻜",
136 "dt_id": 47,
137 "dt_name": "英雄",
138 "gd_id": 1550,
139 "gd_num": 0,
140 "hid": 4187305,
141 "parent_id": 0,
142 "pf_type": 0
143 },
144 {
145 "classify": 2,
146 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c3215a3df.jpg",
147 "data_name": "赵云",
148 "dt_id": 47,
149 "dt_name": "英雄",
150 "gd_id": 1552,
151 "gd_num": 0,
152 "hid": 4187305,
153 "parent_id": 0,
154 "pf_type": 0
155 },
156 {
157 "classify": 2,
158 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c33585c5f.jpg",
159 "data_name": "钟馗",
160 "dt_id": 47,
161 "dt_name": "英雄",
162 "gd_id": 1554,
163 "gd_num": 0,

## Page 58

164 "hid": 4187305,
165 "parent_id": 0,
166 "pf_type": 0
167 },
168 {
169 "classify": 1,
170 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c349a4e9b.jpg",
171 "data_name": "钟无艳",
172 "dt_id": 47,
173 "dt_name": "英雄",
174 "gd_id": 1555,
175 "gd_num": 0,
176 "hid": 4187305,
177 "parent_id": 0,
178 "pf_type": 0
179 },
180 {
181 "classify": 4,
182 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c36310481.jpg",
183 "data_name": "诸葛亮",
184 "dt_id": 47,
185 "dt_name": "英雄",
186 "gd_id": 1557,
187 "gd_num": 0,
188 "hid": 4187305,
189 "parent_id": 0,
190 "pf_type": 0
191 },
192 {
193 "classify": 5,
194 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-09-
27/5bac7096a647c.jpg",
195 "data_name": "伽罗",
196 "dt_id": 47,
197 "dt_name": "英雄",
198 "gd_id": 5114,
199 "gd_num": 0,
200 "hid": 4187305,
201 "parent_id": 0,
202 "pf_type": 0
203 },
204 {

## Page 59

205 "classify": 2,
206 "data_img": "//zhwpic.zuhaowan.com/images/game_data_img/2018-11-
22/5bf60b967f0df.jpg",
207 "data_name": "李信",
208 "dt_id": 47,
209 "dt_name": "英雄",
210 "gd_id": 5226,
211 "gd_num": 0,
212 "hid": 4187305,
213 "parent_id": 0,
214 "pf_type": 0
215 }
216 ],
217 "multi_choose": 1
218 },
219 {
220 "dt_name": "星传说",
221 "game_id": 443,
222 "gd_num": 0,
223 "id": 226,
224 "list": [],
225 "multi_choose": 1
226 },
227 {
228 "dt_name": "在榜排名",
229 "game_id": 443,
230 "gd_num": 0,
231 "id": 205,
232 "list": [],
233 "multi_choose": 0
234 },
235 {
236 "dt_name": "VIP等级",
237 "game_id": 443,
238 "gd_num": 0,
239 "id": 201,
240 "list": [],
241 "multi_choose": 0
242 },
243 {
244 "dt_name": "150铭文套数",
245 "game_id": 443,
246 "gd_num": 0,
247 "id": 198,
248 "list": [],
249 "multi_choose": 0
250 },

## Page 60

251 {
252 "dt_name": "精选皮肤",
253 "game_id": 443,
254 "gd_num": 0,
255 "id": 195,
256 "list": [],
257 "multi_choose": 1
258 },
259 {
260 "dt_name": "皮肤数量",
261 "game_id": 443,
262 "gd_num": 0,
263 "id": 51,
264 "list": [],
265 "multi_choose": 0
266 },
267 {
268 "dt_name": "英雄数量",
269 "game_id": 443,
270 "gd_num": 0,
271 "id": 50,
272 "list": [],
273 "multi_choose": 0
274 },
275 {
276 "dt_name": "皮肤",
277 "game_id": 443,
278 "gd_num": 0,
279 "id": 49,
280 "list": [
281 {
282 "classify": 0,
283 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a06273828.png",
284 "data_name": "项羽 霸王别姬",
285 "dt_id": 49,
286 "dt_name": "皮肤",
287 "gd_id": 1580,
288 "gd_num": 0,
289 "hid": 4187305,
290 "parent_id": 1541,
291 "pf_type": 2
292 },
293 {
294 "classify": 0,

## Page 61

295 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a06b8ce19.png",
296 "data_name": "项羽 苍穹之光",
297 "dt_id": 49,
298 "dt_name": "皮肤",
299 "gd_id": 1581,
300 "gd_num": 0,
301 "hid": 4187305,
302 "parent_id": 1541,
303 "pf_type": 4
304 },
305 {
306 "classify": 0,
307 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a077c2c88.png",
308 "data_name": "项羽 帝国元帅",
309 "dt_id": 49,
310 "dt_name": "皮肤",
311 "gd_id": 1582,
312 "gd_num": 0,
313 "hid": 4187305,
314 "parent_id": 1541,
315 "pf_type": 0
316 },
317 {
318 "classify": 0,
319 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a082549b9.png",
320 "data_name": "项羽 海滩派对",
321 "dt_id": 49,
322 "dt_name": "皮肤",
323 "gd_id": 1583,
324 "gd_num": 0,
325 "hid": 4187305,
326 "parent_id": 1541,
327 "pf_type": 2
328 },
329 {
330 "classify": 0,
331 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2023-09-
11/64fee4bf9f795.jpg",
332 "data_name": "项羽 职棒王牌",
333 "dt_id": 49,

## Page 62

334 "dt_name": "皮肤",
335 "gd_id": 1584,
336 "gd_num": 0,
337 "hid": 4187305,
338 "parent_id": 1541,
339 "pf_type": 0
340 },
341 {
342 "classify": 0,
343 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a0b1034d5.png",
344 "data_name": "小乔 缤纷独⻆兽",
345 "dt_id": 49,
346 "dt_name": "皮肤",
347 "gd_id": 1585,
348 "gd_num": 0,
349 "hid": 4187305,
350 "parent_id": 1542,
351 "pf_type": 4
352 },
353 {
354 "classify": 0,
355 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a0bbb46f7.png",
356 "data_name": "小乔 纯白花嫁",
357 "dt_id": 49,
358 "dt_name": "皮肤",
359 "gd_id": 1586,
360 "gd_num": 0,
361 "hid": 4187305,
362 "parent_id": 1542,
363 "pf_type": 2
364 },
365 {
366 "classify": 0,
367 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a0d3d1611.png",
368 "data_name": "小乔 天鹅之梦",
369 "dt_id": 49,
370 "dt_name": "皮肤",
371 "gd_id": 1588,
372 "gd_num": 0,
373 "hid": 4187305,
374 "parent_id": 1542,

## Page 63

375 "pf_type": 1
376 },
377 {
378 "classify": 0,
379 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a0decb0b2.png",
380 "data_name": "小乔 万圣前夜",
381 "dt_id": 49,
382 "dt_name": "皮肤",
383 "gd_id": 1589,
384 "gd_num": 0,
385 "hid": 4187305,
386 "parent_id": 1542,
387 "pf_type": 0
388 },
389 {
390 "classify": 0,
391 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a30732efd.png",
392 "data_name": "赵云 白执事",
393 "dt_id": 49,
394 "dt_name": "皮肤",
395 "gd_id": 1611,
396 "gd_num": 0,
397 "hid": 4187305,
398 "parent_id": 1552,
399 "pf_type": 0
400 },
401 {
402 "classify": 0,
403 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a31bb2610.png",
404 "data_name": "赵云 皇家上将",
405 "dt_id": 49,
406 "dt_name": "皮肤",
407 "gd_id": 1613,
408 "gd_num": 0,
409 "hid": 4187305,
410 "parent_id": 1552,
411 "pf_type": 2
412 },
413 {
414 "classify": 0,

## Page 64

415 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a325012eb.png",
416 "data_name": "赵云 忍·炎影",
417 "dt_id": 49,
418 "dt_name": "皮肤",
419 "gd_id": 1614,
420 "gd_num": 0,
421 "hid": 4187305,
422 "parent_id": 1552,
423 "pf_type": 0
424 },
425 {
426 "classify": 0,
427 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a338bdf2e.png",
428 "data_name": "赵云 嘻哈天王",
429 "dt_id": 49,
430 "dt_name": "皮肤",
431 "gd_id": 1616,
432 "gd_num": 0,
433 "hid": 4187305,
434 "parent_id": 1552,
435 "pf_type": 0
436 },
437 {
438 "classify": 0,
439 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a3cab2a39.png",
440 "data_name": "钟无艳 海滩丽影",
441 "dt_id": 49,
442 "dt_name": "皮肤",
443 "gd_id": 1623,
444 "gd_num": 0,
445 "hid": 4187305,
446 "parent_id": 1555,
447 "pf_type": 0
448 },
449 {
450 "classify": 0,
451 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a3d434617.png",
452 "data_name": "钟无艳 生化警戒",
453 "dt_id": 49,

## Page 65

454 "dt_name": "皮肤",
455 "gd_id": 1624,
456 "gd_num": 0,
457 "hid": 4187305,
458 "parent_id": 1555,
459 "pf_type": 0
460 },
461 {
462 "classify": 0,
463 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9a3dee6920.png",
464 "data_name": "钟无艳 王者之锤",
465 "dt_id": 49,
466 "dt_name": "皮肤",
467 "gd_id": 1625,
468 "gd_num": 0,
469 "hid": 4187305,
470 "parent_id": 1555,
471 "pf_type": 2
472 },
473 {
474 "classify": 0,
475 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-11-
10/5be6d6b4c16b8.jpg",
476 "data_name": "项羽 科学大爆炸",
477 "dt_id": 49,
478 "dt_name": "皮肤",
479 "gd_id": 5216,
480 "gd_num": 0,
481 "hid": 4187305,
482 "parent_id": 1541,
483 "pf_type": 0
484 }
485 ],
486 "multi_choose": 1
487 },
488 {
489 "dt_name": "段位",
490 "game_id": 443,
491 "gd_num": 0,
492 "id": 48,
493 "list": [
494 {
495 "classify": 0,

## Page 66

496 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5aba108387801.png",
497 "data_name": "至尊星耀I",
498 "dt_id": 48,
499 "dt_name": "段位",
500 "gd_id": 1835,
501 "gd_num": 0,
502 "hid": 4187305,
503 "parent_id": 0,
504 "pf_type": 0
505 }
506 ],
507 "multi_choose": 0
508 },
509 {
510 "dt_name": "性别信息",
511 "game_id": 443,
512 "gd_num": 0,
513 "id": 359,
514 "list": [],
515 "multi_choose": 0
516 }
517 ],
518 "exclusive_game_min_price": 0.26,
519 "exclusive_pmoney": 0,
520 "free_play": 1,
521 "game_server_name": "手Q2区-绝代智谋",
522 "game_zone_name": "QQ安卓",
523 "h_auth_phone": "",
524 "h_auth_phone_status": 0,
525 "h_game_phone_conf": {
526 "is_must": 0,
527 "support": 1
528 },
529 "hao_channel": {
530 "is_channel": 0
531 },
532 "hao_remark": "12320",
533 "hao_short_rent_list": [],
534 "hao_short_rent_price": {
535 "discount_money": 0,
536 "short_rent_discount": 0,
537 "short_rent_hour": 3,
538 "short_rent_price": 0,
539 "short_rent_status": 2
540 },

## Page 67

541 "id": 4187305,
542 "image": [
543 "http://zhwpic.zuhaowan.com/images/account_img/2019-05-
28/5ceca6c0eac85.png"
544 ],
545 "is_exclusive": 0,
546 "is_muted": 0,
547 "is_region": 1,
548 "is_shield_exclusive": 0,
549 "level": 0,
550 "max_rent_hour": 30,
551 "min_rent_hour": 1,
552 "money_10h": 20,
553 "money_1h": 4,
554 "money_afternoon": 28,
555 "money_day": 27,
556 "money_morning": 10,
557 "money_night": 15,
558 "money_week": 168,
559 "mw_num": 0,
560 "no_play": -1,
561 "rank_allow": 2,
562 "region": {
563 "cid": 160,
564 "cname": "景德镇市",
565 "level": 0,
566 "pid": 15,
567 "pname": "江西省"
568 },
569 "rent_give_conf": {
570 "confArr": [
571 {
572 "give": "2",
573 "rent": "4"
574 },
575 {
576 "give": "4",
577 "rent": "6"
578 },
579 {
580 "give": "5",
581 "rent": "7"
582 },
583 {
584 "give": "1",
585 "rent": "5"
586 },

## Page 68

587 {
588 "give": "1",
589 "rent": "3"
590 }
591 ],
592 "game_id": 443,
593 "give_max": 9,
594 "give_min": 1,
595 "is_rent_larger": 1,
596 "recom_conf": "4_2,6_4,7_5,5_1,3_1,",
597 "rent_max": 9,
598 "rent_min": 1,
599 "set_max_num": 6
600 },
601 "rent_give_list": [
602 {
603 "add_ip": "60.174.83.97",
604 "add_time": "2021-05-12 17:44:50",
605 "game_id": 443,
606 "game_rg_id": 50,
607 "give": 3,
608 "hao_id": 4187305,
609 "id": 2798,
610 "remark": "租3送3",
611 "rent": 3,
612 "status": 1,
613 "uid": 529436
614 }
615 ],
616 "rent_hour_end": 24,
617 "rent_hour_start": 0,
618 "rent_num_limit": 0,
619 "reserve_allow": 0,
620 "role_name": "23g23g",
621 "shfs_str": "明文账号密码",
622 "short_rent_rule": {
623 "describe_url": "https://www.zuhaowan.com/help/hzxt/info?
id=12&detid=741",
624 "discount_max": 9,
625 "discount_min": 1,
626 "game_id": 0,
627 "recom_conf": [
628 {
629 "rent_discount": 7,
630 "rent_hour": "6"
631 }
632 ],

## Page 69

633 "rent_max": 10,
634 "rent_min": 1,
635 "set_max_num": 4
636 },
637 "show_exclusive_price": 1,
638 "show_shield_exclusive": 1,
639 "sublet_max_szq": 2,
640 "sublet_min_rent_hour": 0,
641 "tejia": {
642 "discount_max": 0.7,
643 "support": 1,
644 "tejia_discount": 0
645 },
646 "title": "技术测试中技术测试中技术测试中",
647 "wegame_sms_auth": 0,
648 "zz_rent_give_hao": null,
649 "zz_rent_give_rule": {
650 "confArr": [
651 {
652 "give": "1",
653 "rent": "5"
654 }
655 ],
656 "give_max": 3,
657 "give_min": 1,
658 "id": 2,
659 "recom_conf": "5_1,",
660 "rent_max": 7,
661 "rent_min": 5,
662 "set_max_num": 10
663 }
664 }
665 }
3.20 货架添加/发布

基本信息

Path:
/shanghu/[platformXYZ]/v1/addHao

Method:
POST

接口描述:

请求参数

Headers

## Page 70

Body

## Page 71

(??????)

## Page 72

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "success",
5 "data": {}
6 }
3.21 货架修改

## Page 73

基本信息

Path:
/shanghu/[platformXYZ]/v1/editHao

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 74

(??????)

## Page 75

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "success",
5 "data": {}
6 }
3.22 获取游戏装备数据

基本信息

Path:
/shanghu/[platformXYZ]/v3/getEquipmentInfo

Method:
POST

接口描述:

请求参数

## Page 76

Headers

Body

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 200,

## Page 77

4 "msg": "",
5 "data": [
6 {
7 "dt_name": "狙击枪",
8 "game_id": 582,
9 "gd_num": 1,
10 "id": 307,
11 "multi_choose": 1,
12 "list": [
13 {
14 "data_id": 45924,
15 "data_name": "AWP-CMYK",
16 "dt_id": 307,
17 "dt_name": "狙击枪",
18 "dt_parent_id": 0,
19 "parent_id": 0
20 },
21 {
22 "data_id": 46334,
23 "data_name": "AWP-克拉考",
24 "dt_id": 307,
25 "dt_name": "狙击枪",
26 "dt_parent_id": 0,
27 "choose": 1,
28 "parent_id": 0
29 }
30 ]
31 }
32 ]
33 }

3.23 获取游戏发布规则配置

基本信息

Path:
/shanghu/[platformXYZ]/v3/publishAccountConf

Method:
POST

接口描述:

请求参数

Headers

## Page 78

Body

返回数据

## Page 79

(??????)

## Page 80

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "",
5 "data": {
6 "base_rule": {
7 "allow_port": 111,
8 "content_max": 100,
9 "content_min": 10,
10 "gameid": 0,
11 "gname": "全部游戏",
12 "id": 24,
13 "image_max": 10,
14 "image_min": 1,
15 "is_check_image": 1,
16 "is_check_word": 0,
17 "is_real_name": 1,
18 "pmoeny_max": 100,

## Page 81

19 "pn_max": 50,
20 "pn_min": 0,
21 "specialEqument": []
22 },
23 "give_conf": {
24 "confArr": [],
25 "give_max": 4,
26 "give_min": 1,
27 "is_rent_larger": 1,
28 "rent_max": 5,
29 "rent_min": 3,
30 "set_max_num": 5
31 },
32 "price_conf": {
33 "rent_p10": 5,
34 "rent_p10_max": 8,
35 "rent_p10_min": 3,
36 "rent_p168": 7,
37 "rent_p168_max": 15,
38 "rent_p168_min": 5,
39 "rent_p24": 8,
40 "rent_p24_max": 12,
41 "rent_p24_min": 6,
42 "rent_p5": 3,
43 "rent_p5_max": 5,
44 "rent_p5_min": 2,
45 "rent_p7": 2,
46 "rent_p7_max": 3,
47 "rent_p7_min": 1,
48 "rent_p8": 6,
49 "rent_p8_max": 10,
50 "rent_p8_min": 4
51 },
52 "short_rent_rule": {
53 "describe_url": "https://www.zuhaowan.com/help/hzxt/info?
id=12&detid=741",
54 "discount_max": 5,
55 "discount_min": 3,
56 "game_id": 582,
57 "recom_conf": [
58 {
59 "rent_discount": 3,
60 "rent_hour": "3"
61 }
62 ],
63 "rent_max": 5,
64 "rent_min": 1,

## Page 82

65 "set_max_num": 5
66 }
67 }
68 }

3.24 获取游戏区服

基本信息

Path:
/shanghu/[platformXYZ]/v2/gameZoneServer

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 83

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "server_list": [
7 {
8 "ID": 7718,
9 "ParentID": 7717,
10 "ServerName": "QQ账号"
11 },
12 {
13 "ID": 7721,
14 "ParentID": 7720,
15 "ServerName": "QQ账号"
16 },
17 {
18 "ID": 9420,
19 "ParentID": 9419,
20 "ServerName": "微信账号"
21 },

## Page 84

22 {
23 "ID": 9567,
24 "ParentID": 9566,
25 "ServerName": "微信账号"
26 },
27 {
28 "ID": 11536,
29 "ParentID": 11532,
30 "ServerName": "QQ抢先服 1区"
31 },
32 {
33 "ID": 11919,
34 "ParentID": 11532,
35 "ServerName": "QQ抢先服 2区"
36 },
37 {
38 "ID": 11537,
39 "ParentID": 11533,
40 "ServerName": "微信抢先服 1区"
41 },
42 {
43 "ID": 11920,
44 "ParentID": 11533,
45 "ServerName": "微信抢先服 2区"
46 }
47 ],
48 "zone_list": [
49 {
50 "ID": 7717,
51 "ParentID": 0,
52 "ServerName": "QQ安卓"
53 },
54 {
55 "ID": 7720,
56 "ParentID": 0,
57 "ServerName": "QQ苹果"
58 },
59 {
60 "ID": 9419,
61 "ParentID": 0,
62 "ServerName": "微信安卓"
63 },
64 {
65 "ID": 9566,
66 "ParentID": 0,
67 "ServerName": "微信苹果"
68 },

## Page 85

69 {
70 "ID": 11532,
71 "ParentID": 0,
72 "ServerName": "QQ安卓抢先服"
73 },
74 {
75 "ID": 11533,
76 "ParentID": 0,
77 "ServerName": "微信安卓抢先服"
78 }
79 ]
80 }
81 }
3.25 我出租的订单列表

基本信息

Path:
/shanghu/[platformXYZ]/v3/rentOutOrderList

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 86

返回数据

## Page 87

(??????)

## Page 88

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "all_sys_fee": "-",
10 "complaint_time": "-",
11 "deduct_deposit": 0,
12 "deposit": "0.00",
13 "end_time": "2025-08-15 11:24:43",
14 "game_name": "王者荣耀",
15 "game_server_name": "手Q1区-王者独尊",
16 "game_zone_name": "QQ安卓",
17 "gid": 443,
18 "hid": 3067971,
19 "is_black": 0,
20 "money_1h": "1.00",
21 "order_num": "250625910874629",
22 "order_source": 3,
23 "partner_name": "慢猪2",
24 "real_amount": "-",
25 "rent_hour": 1,
26 "role_name": "sdgsdhsdh6",
27 "start_time": "2025-08-15 10:19:43",
28 "status": 0,
29 "status_str": "租赁中",
30 "title": "go--测试测试测试22117777",
31 "zk_user": "zh****x7"
32 }
33 ],

## Page 89

34 "order_status_total": [
35 {
36 "count": 115,
37 "zt": 1
38 },
39 {
40 "count": 3,
41 "zt": 4
42 },
43 {
44 "count": 0,
45 "zt": 8
46 },
47 {
48 "count": 0,
49 "zt": 9
50 }
51 ]
52 }
53 }
3.26 我租的订单列表

基本信息

Path:
/shanghu/[platformXYZ]/v3/rentInOrderList

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 90

返回数据

## Page 91

(??????)

## Page 92

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 2,
7 "list": [
8 {
9 "all_sys_fee": "2.80",
10 "complaint_time": "-",
11 "deduct_deposit": 0,
12 "deposit": "0.00",
13 "end_time": "2025-07-30 11:39:05",
14 "game_name": "王者荣耀",
15 "game_server_name": "手Q94区-吉凶卜兆",
16 "game_zone_name": "QQ苹果",
17 "gid": 443,
18 "hid": 13760240,
19 "is_black": 0,
20 "money_1h": "1.78",
21 "order_num": "238630053765637",
22 "order_source": 1,
23 "partner_name": "-",
24 "real_amount": "-",
25 "rent_hour": 24,
26 "role_name": "剥离却芥子a",
27 "start_time": "2025-07-29 11:34:05",
28 "status": 2,
29 "status_str": "已完成",

## Page 93

30 "title": "go--66亚瑟♉后羿♉裴擒⻁♉盘古♉李元芳♉兰陵王♉喜欢可收藏",
31 "zk_user": "as****ao"
32 },
33 {
34 "all_sys_fee": "0.60",
35 "complaint_time": "-",
36 "deduct_deposit": 0,
37 "deposit": "0.00",
38 "end_time": "2025-07-29 12:39:56",
39 "game_name": "王者荣耀",
40 "game_server_name": "手Q479区-丹⻘不绝",
41 "game_zone_name": "QQ安卓",
42 "gid": 443,
43 "hid": 14122184,
44 "is_black": 0,
45 "money_1h": "2.60",
46 "order_num": "238600984904197",
47 "order_source": 1,
48 "partner_name": "-",
49 "real_amount": "-",
50 "rent_hour": 2,
51 "role_name": "dinyding",
52 "start_time": "2025-07-29 10:34:56",
53 "status": 2,
54 "status_str": "已完成",
55 "title": "go--孙悟空☆地狱火☆上号快",
56 "zk_user": "as****ao"
57 }
58 ],
59 "order_status_total": [
60 {
61 "count": 0,
62 "zt": 1
63 },
64 {
65 "count": 3,
66 "zt": 4
67 },
68 {
69 "count": 0,
70 "zt": 8
71 },
72 {
73 "count": 0,
74 "zt": 9
75 }
76 ]

## Page 94

77 }
78 }
3.27 余额明细

基本信息

Path:
/shanghu/[platformXYZ]/v3/financeList

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 95

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 479,
7 "expend": 0,
8 "income": 0,
9 "list": [
10 {
11 "id": 10212654255,
12 "jkx_bz": "租号",
13 "jkx_charge_id": "243665553129989",
14 "jkx_mc": "租号收入(可用资金)-结算",
15 "jkx_money": "0.01",
16 "jkx_tjtimer": "2025-08-05 18:09:35",
17 "jkx_usermoney": "66.78"
18 },
19 {
20 "id": 10212654253,

## Page 96

21 "jkx_bz": "租号",
22 "jkx_charge_id": "243661789069829",
23 "jkx_mc": "租号收入(可用资金)-结算",
24 "jkx_money": "0.01",
25 "jkx_tjtimer": "2025-08-05 18:08:35",
26 "jkx_usermoney": "66.77"
27 },
28 {
29 "id": 10212654207,
30 "jkx_bz": "租号",
31 "jkx_charge_id": "243681303478789",
32 "jkx_mc": "租号收入(可用资金)-结算",
33 "jkx_money": "0.01",
34 "jkx_tjtimer": "2025-08-05 17:21:25",
35 "jkx_usermoney": "66.76"
36 },
37 {
38 "id": 10212654070,
39 "jkx_bz": "租号",
40 "jkx_charge_id": "243585048347141",
41 "jkx_mc": "租号减少(可用资金)- 下单",
42 "jkx_money": "-1.00",
43 "jkx_tjtimer": "2025-08-05 11:35:02",
44 "jkx_usermoney": "65.83"
45 }
46 ]
47 }
48 }
3.28 点券明细

基本信息

Path:
/shanghu/[platformXYZ]/v3/goupPointRecord

Method:
POST

接口描述:

请求参数

Headers

## Page 97

Body

返回数据

## Page 98

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 2,
7 "free_point": "0.00",
8 "frozen_point": "0.00",
9 "list": [
10 {
11 "buy_type_str": "购买至尊宝-用戶使用",
12 "create_time": "2025-08-15 10:56:17",
13 "desc": "购买至尊宝",
14 "free_point": "-",
15 "hao_id": 14429969,
16 "id": 45390,
17 "left_free_point": "0.00",
18 "left_point": "2960.00",
19 "point": "-40.00",
20 "uid": 529436
21 },
22 {
23 "buy_type_str": "购买增值点券",
24 "create_time": "2025-08-15 10:55:34",
25 "desc": "余额购买",
26 "free_point": "-",
27 "hao_id": 0,
28 "id": 45389,
29 "left_free_point": "0.00",
30 "left_point": "3000.00",
31 "point": "3000.00",
32 "uid": 529436
33 }
34 ],
35 "total_vas_point": 2960,
36 "user_dismoney": "2960.00"
37 }
38 }
3.29 限时货架

基本信息

## Page 99

Path:
/shanghu/[platformXYZ]/v3/getHaoTimelimitList

Method:
POST

接口描述:

请求参数

Headers

Body

返回数据

## Page 100

(??????)

## Page 101

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 2,
7 "list": [
8 {
9 "addtime": 1755226944,
10 "buy_type": 1,
11 "c": 100,
12 "conf_id": 270,
13 "days": 30,
14 "end_time": "2025-09-14 11:02:24",
15 "game_id": 11,
16 "game_name": "穿越火线",
17 "hao_id": 6407311,
18 "hao_timelimit_id": 183688,
19 "id": 37776,
20 "is_auto_renew": 0,
21 "is_ending": 0,
22 "jsm": "lol测试0621",
23 "money": "80.50",
24 "pn": "删除测试删除测试删除测试删除测",
25 "remark": "【官网批量购买限时货架】",
26 "sc": 200,
27 "server_id": 418,
28 "server_name": "安徽一区",
29 "start_time": "2025-08-15 11:02:24",
30 "status": 1,
31 "status_str": "进行中",
32 "zone_id": 417,
33 "zone_name": "电信区"
34 },
35 {
36 "addtime": 1755226942,

## Page 102

37 "buy_type": 1,
38 "c": 100,
39 "conf_id": 270,
40 "days": 30,
41 "end_time": "2025-09-14 11:02:22",
42 "game_id": 11,
43 "game_name": "穿越火线",
44 "hao_id": 6408090,
45 "hao_timelimit_id": 183687,
46 "id": 37775,
47 "is_auto_renew": 0,
48 "is_ending": 0,
49 "jsm": "~Andy宝宝~",
50 "money": "80.50",
51 "pn": "测试标题测试标题",
52 "remark": "【官网批量购买限时货架】",
53 "sc": 200,
54 "server_id": 444,
55 "server_name": "北京一区",
56 "start_time": "2025-08-15 11:02:22",
57 "status": 1,
58 "status_str": "进行中",
59 "zone_id": 442,
60 "zone_name": "网通区"
61 }
62 ],
63 "status_arr": {
64 "0": "全部",
65 "1": "进行中",
66 "2": "已完成",
67 "5": "未开始",
68 "6": "已暂停",
69 "7": "已取消"
70 }
71 }
72 }
3.30 置顶货架

基本信息

Path:
/shanghu/[platformXYZ]/v3/haoTopOrder
Method:
POST

接口描述:

## Page 103

请求参数

Headers

Body

返回数据

## Page 104

返回示例

## Page 105

代1 码块//
返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "add_time": "2025-08-15 11:09:38",
10 "conf_type": 1,
11 "end_time": "2025-08-15 11:13:40",
12 "game_id": 581,
13 "game_name": "绝地求生",
14 "hao_id": 7812415,
15 "id": 1742,
16 "jsm": "sdg",
17 "minutes": 4,
18 "pn": "gsdgdsfge",
19 "price": "11.00",
20 "server_id": 7742,
21 "server_name": "全服",
22 "show_num": 0,
23 "start_time": "2025-08-15 11:09:40",
24 "status": 1,
25 "status_str": "生效中",
26 "zone_id": 7741,
27 "zone_name": "全区"
28 }
29 ],
30 "status_map": {
31 "1": "生效中",
32 "2": "已结束",
33 "3": "排队中",
34 "4": "审核中",
35 "5": "审核不通过,请修改货架"
36 }
37 }
38 }
3.31 热搜词置顶货架

基本信息

Path:
/shanghu/[platformXYZ]/v3/haoTopHotwordOrder

Method:
POST

## Page 106

接口描述:

请求参数

Headers

Body

返回数据

## Page 107

返回示例

## Page 108

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "conf_type": 2,
10 "end_time": "2025-08-16 11:14:03",
11 "game_id": 17,
12 "game_name": "英雄联盟",
13 "hao_id": 3732115,
14 "id": 649,
15 "jsm": "lol测试0666",
16 "key_word": "艾欧尼亚",
17 "minutes": 1440,
18 "pn": "lol测试0666",
19 "price": "1.00",
20 "server_id": 34,
21 "server_name": "艾欧尼亚",
22 "start_time": "2025-08-15 11:14:03",
23 "top_status": 1,
24 "top_status_str": "进行中",
25 "zone_id": 11900,
26 "zone_name": "艾欧尼亚"
27 }
28 ],
29 "status_map": {
30 "1": "进行中",
31 "2": "已结束",
32 "3": "排队中",
33 "4": "审核中",
34 "5": "审核不通过,请修改货架"
35 }
36 }
37 }
3.32 至尊宝

基本信息

Path:
/shanghu/[platformXYZ]/v3/insureOrderList

Method:
POST

接口描述:

## Page 109

请求参数

Headers

Body

返回数据

## Page 110

(??????)

## Page 111

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "success",
5 "data": {
6 "count": 2,
7 "list": [
8 {
9 "account_no": "916817702",
10 "add_c": 50,
11 "amount": 4000,
12 "claim_amount": "0.00",
13 "days": 7,
14 "end_time": "2025-08-22 11:26:38",
15 "game_id": 560,
16 "game_name": "火影忍者(手游)",
17 "hao_id": 9054375,
18 "id": 348362,
19 "insurance_status": 1,
20 "insurance_status_str": "生效中",
21 "is_over": 0,
22 "policy_no": "20250815501342",
23 "premium": 56,
24 "start_time": "2025-08-15 11:26:38",
25 "surplus_amount": "4000.00"
26 },
27 {
28 "account_no": "270580441",
29 "add_c": 100,
30 "amount": 4000,
31 "claim_amount": "0.00",
32 "days": 7,
33 "end_time": "2025-08-22 11:01:17",
34 "game_id": 1755,
35 "game_name": "三⻆洲行动(手游)",
36 "hao_id": 14429969,
37 "id": 348361,
38 "insurance_status": 1,
39 "insurance_status_str": "生效中",
40 "is_over": 0,
41 "policy_no": "20250815574891",

## Page 112

42 "premium": 40,
43 "start_time": "2025-08-15 11:01:17",
44 "surplus_amount": "4000.00"
45 }
46 ],
47 "picc_game": [
48 {
49 "game_id": 11,
50 "game_name": "穿越火线"
51 },
52 {
53 "game_id": 581,
54 "game_name": "绝地求生"
55 },
56 {
57 "game_id": 443,
58 "game_name": "王者荣耀"
59 },
60 {
61 "game_id": 17,
62 "game_name": "英雄联盟"
63 },
64 {
65 "game_id": 24,
66 "game_name": "逆战"
67 },
68 {
69 "game_id": 446,
70 "game_name": "枪战王者"
71 },
72 {
73 "game_id": 576,
74 "game_name": "H1Z1"
75 },
76 {
77 "game_id": 449,
78 "game_name": "球球大作战"
79 },
80 {
81 "game_id": 49,
82 "game_name": "NBA2KOL"
83 },
84 {
85 "game_id": 5,
86 "game_name": "剑灵"
87 },
88 {

## Page 113

89 "game_id": 560,
90 "game_name": "火影忍者(手游)"
91 },
92 {
93 "game_id": 10,
94 "game_name": "九阴真经"
95 },
96 {
97 "game_id": 683,
98 "game_name": "和平精英"
99 },
100 {
101 "game_id": 1,
102 "game_name": "三国杀"
103 },
104 {
105 "game_id": 23,
106 "game_name": "YY号码"
107 },
108 {
109 "game_id": 1317,
110 "game_name": "奥比岛:梦想国度"
111 },
112 {
113 "game_id": 1024,
114 "game_name": "枪火重生(wegame)"
115 },
116 {
117 "game_id": 36,
118 "game_name": "枪神纪"
119 },
120 {
121 "game_id": 1050,
122 "game_name": "世界online"
123 },
124 {
125 "game_id": 1026,
126 "game_name": "原神(PC)"
127 },
128 {
129 "game_id": 25,
130 "game_name": "QQ⻜⻋"
131 },
132 {
133 "game_id": 1101,
134 "game_name": "暗区突围"
135 },

## Page 114

136 {
137 "game_id": 1669,
138 "game_name": "三⻆洲行动(pc)"
139 },
140 {
141 "game_id": 1755,
142 "game_name": "三⻆洲行动(手游)"
143 }
144 ],
145 "status_map": [
146 {
147 "name": "全部",
148 "val": -1
149 },
150 {
151 "name": "预约待生效",
152 "val": 0
153 },
154 {
155 "name": "生效中",
156 "val": 1
157 },
158 {
159 "name": "已完成",
160 "val": 2
161 },
162 {
163 "name": "保额已用完",
164 "val": 3
165 },
166 {
167 "name": "手动关闭",
168 "val": 5
169 }
170 ]
171 }
172 }
3.33 喇叭

基本信息

Path:
/shanghu/[platformXYZ]/v3/trumptOrder

Method:
POST

接口描述:

## Page 115

请求参数

Headers

Body

返回数据

## Page 116

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "add_time": "2025-08-15 11:26:31",
10 "buyfre": 5,
11 "buyprice": 1,
12 "buytime": 1755228391,
13 "buytotal": 5,
14 "dislong": 30,
15 "game_id": 560,
16 "game_name": "火影忍者",

## Page 117

17 "haoid": 9054375,
18 "id": 1502,
19 "keywords": "非顶不可sdhs",
20 "status": 1,
21 "status_str": "进行中"
22 }
23 ]
24 }
25 }
3.34 渠道置顶

基本信息

Path:
/shanghu/[platformXYZ]/v3/channelTopOrder

Method:
POST

接口描述:

请求参数

Headers

Body

## Page 118

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "success",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "end_time": "2025-08-18 00:00:00",
10 "game_name": "火影忍者",
11 "hao_id": 9054375,

## Page 119

12 "id": 12928,
13 "jsm": "gegegege",
14 "pn": "sfdsdf习地sdgsd",
15 "price": "1.00",
16 "rent_num": 30,
17 "server_name": "QQ账号区服",
18 "status": 3,
19 "status_str": "进行中",
20 "valid_day": 3,
21 "zone_name": "QQ账号"
22 }
23 ],
24 "status_map": [
25 {
26 "id": 0,
27 "val": "全部"
28 },
29 {
30 "id": 1,
31 "val": "进行中"
32 },
33 {
34 "id": 2,
35 "val": "已完成"
36 }
37 ]
38 }
39 }
3.35 合租展位

基本信息

Path:
/shanghu/[platformXYZ]/v3/cotenancyOrder

Method:
POST

接口描述:

请求参数

Headers

## Page 120

Body

返回数据

返回示例

代码块

1 // 返回示例
2 {
3 "status": 1,
4 "msg": "OK",
5 "data": {
6 "count": 1,
7 "list": [
8 {

## Page 121

9 "buy_days": 7,
10 "buy_money": "2.00",
11 "end_time": "-",
12 "flow_status_str": "审核中",
13 "game_name": "穿越火线",
14 "id": 499,
15 "start_time": "2001-01-01 00:00:00"
16 }
17 ]
18 }
19 }
4. 参考

4.1 账号字段加密

💡 针对货架详情接口返回的游戏账号密码字段进行说明

account字段为json格式,示例:{"account":
"88977452","pwd":
"zz123456"}

接口返回时该字段会使用base64编码以及AES-128-ECB方式进行加密,加密密钥由平台
对接人员提供。

解密示例代码

代码块

1 // php
2 json_decode($cryptAes->decrypt(base64_decode($body)),true) // 自行实现解密方法
4.2 上传图片接口说明

💡 上传图片接口比较特殊,考虑到安全及鉴权因素,并不适用于前端直接调用。需要三
方后端接入后再提供给前端使用。

4.3 字典

## Page 122

4.3.1 货架状态

4.3.2 订单状态
