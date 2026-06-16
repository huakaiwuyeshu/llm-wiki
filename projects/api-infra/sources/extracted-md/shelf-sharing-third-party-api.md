# 货架共享第三方API接口文档

- Source PDF: `../raw-pdfs/货架共享第三方API接口文档.pdf`
- Original file: `货架共享第三方API接口文档.pdf`
- Pages: 119

## Page 1

货架共享第三方API接口文档

货架共享第三方API接口文档

版本
:2.0

日期
:2024-09-11

文档ID:
货架共享第三方API接口文档_1.0

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
(yyyy-
mm-dd)

(I-初稿,
A-添加,
M-修改,
D-删除)

1.0
朱秉乾

添加
创建文档
2023-03-25

2.0
胡佳期

修改
订单ID由int32改为int64
2024-09-11

2.1
兰利升

修改
1. 修改投诉类型的隐藏逻辑说 2024-09-26

明,半小时后不再取消隐藏

## Page 2

2.2
兰利升

修改
新增号池游戏支持接口
2025-2-10

2.3

M
• 完善接口响应示例
2025-9-03

• 部分接口字段完善

• 增加下单前置提示弹窗接口
(4.21)

• 货架详情增加包早、包午

• 货架列表增加封禁信息

2.4
兰利升

新增
支持三⻆洲哈夫币预付款模式
2025-9-15

2.5
兰利升

修改
订单详情增加哈夫币结算状态及退 2025-11-13

款金额

2.5.1
兰利升

修改
订单详情增加二级密码 2026-02-04

(second_pwd字段)

2.5.2
兰利升

新增
新增代理推广接口:
2026-04-07

• 渠道推广链接列表(5.4)

• 渠道推广链接统计数据(5.5)

2.5.2
兰利升

A/M
代理推广新增接口:
2026-04-28

• 渠道推广链接
-
添加(5.6)

• 渠道推广链接
-
修改(5.7)

字段增加:

• 渠道推广链接列表(5.4)

目录

1
概述

1.1
文档说明

1.1.1
格式说明

1.2
适用范围

1.3
准备资料

1.4
商戶账号注册方法

1.5
接口用法说明

1.5.1
请求参数和状态码对照

## Page 3

2
鉴权说明

2.1
签名方法

2.1.1
详细示例-PHP版签名算法

2.1.1
详细示例-JAVA版本签名算法

3
业务流程

3.1
租号业务流程

3.2
撤单业务流程

3.3
续租业务流程

4
接口列表

4.1
接口关系

4.2
账号搜索条件

4.2.1
接口描述

4.2.2
请求方法

4.3
账号搜索列表

4.3.1
接口描述

4.3.2
请求方法

4.4
账号详情

4.4.1
接口描述

4.4.2
请求方法

4.5
下单接口

4.5.1
接口描述

4.5.2
请求方法

4.6
订单续租

4.6.1
接口描述

4.6.2
请求方法

4.7
订单详情

4.7.1
接口描述

4.7.2
请求方法

4.8
获取租号应用平台投诉类型

4.8.1
接口描述

4.8.2
请求方法

## Page 4

4.9
第三方平台上报手游支付id/用戶id

4.9.1
接口描述

4.9.2
请求方法

4.10
第三方平台发起投诉

4.10.1
接口描述

4.10.2
请求方法

附1
游戏对应投诉类型

附2仲裁规则

1. 概述

在本文档中,将介绍我们的游戏租号平台API的使用方式。我们提供的API可以让第三方公司访问我们
平台的信息,并且执行一些特定的操作。通过这个API,第三方公司可以租用我们平台上的游戏账号,
以及对账号进行管理。

以下是本文档提供的API接口:

• 获取账号搜索条件

• 获取账号搜索列表

• 账号详情

• 下单接口

• 订单续租

• 订单详情

• 获取投诉类型

• 第三方平台发起投诉(撤单)

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

## Page 5

1.2 适用范围

本文档所描述的API适用于任何需要租用游戏账号并管理账号的第三方公司。通过我们的API,第三方
公司可以访问本平台上的游戏账号信息,实现账号的租用和管理。如果您的公司需要实现类似的功
能,请参考本文档中提供的API接口,并根据接口用法说明进行调用。

1.3 准备资料

资料准备流程:

## Page 6

资料提供清单:

第三方提供

资料
说明

公司名称(英文)
lbx

商戶账号
第三方公司在租号平台注册的【账号】,详细注册方
法⻅
1.4商戶账号注册方法

Android应用包名和签名
客戶端1:

用于生成
app_id
和
app_secret

签名采用(MD5,小写,例:
d6cce6df3c1d96e9372928xxxxxxxxxx)

客戶端2:

...
...
配置测试账号
用于后台配置测试,请提供一个尚未在租号玩注册过
的手机号

租号平台提供

账号信息
说明

代下单用戶账号
通过此账号在租号应用平台生成订单,与商戶账号相
同

Android应用信息
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

## Page 7

后台接口信息
说明

手游平台名
在请求地址中用于公司的区分,本租号平台开发人员
单独提供

端游平台名
lbx

手游
app_id

用于后台接口调用验签,本租号平台开发人员单独提
供

手游app_secret
用于后台接口调用验签,本租号平台开发人员单独提
供

端游app_id

X2CjePOU2DPCsUiqCYUi

端游app_secret
iGqEL09kodjXlv0iPlCvM5LnqgIT5wBI

1.4 商戶账号注册方法

注:(请先提供未注册账号给到租号玩商务,后续再进行注册)

1. 打开链接
https://www.zuhaowan.com/

2. 点击⻚面右上【注册】,进入账号注册⻚面

3. 使用【手机号方式】注册账号

## Page 8

4. 注册成功后返回首⻚,注册手机号即为商戶账号

5. 点击【充值】,进入账戶充值⻚面,充值100-200元金额用于接口测试

1.5 接口用法说明

内容
说明

传输方式
https
协议

请求地址
生产环境:https://open-api.23solo.com/

## Page 9

请求方式
POST

请求路径格式
/api/[platformXYZ]/xx/yy

[platformXYZ]
为公司名称(英文)

(以开发人员最终提供路径为准)

接口鉴权
签名机制,请参考下方2.鉴权说明

字符编码
接口统一UTF-8编码

响应格式
统一采用JSON格式,以下是响应字段说明:

包含四个字段:status、msg、data

status:int类型,表示错误码,-1为签名错误,1为成
功,其他值为错误码,具体错误码含义请参考错误码
表1.4.2
请求参数和状态码对照

msg:string类型,表示错误信息,当status为非1
时,标识错误说明,status=1时msg可忽略;

data:返回的数据,如果该接口有返回数据,则数据
放在data字段内(具体⻅接口说明),没有数据时,
data为null

开发语言
任意,只要可以向租号平台发起HTTP请求的均可

1.5.1 请求参数和状态码对照

公共参数

字段
说明

app_id
公共参数,应用ID
(由开发人员单独提供),详⻅1.3准
备资料

sign
公共参数,参数签名

timestamp
公共参数,当前时间戳(s)

除以上公共参数外,其余必须参数⻅各自接口说明

响应参数

字段
说明

## Page 10

status
状态码

msg
错误消息

data
数据签名

状态码

字段
说明

-1
签名错误

1
执行成功

0
参数错误

服务响应码参照

错误码
说明

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

## Page 11

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
2.2请求参数和状态码对照。

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

## Page 12

1
成功

2.1.1 详细示例-PHP版签名算法

//
签名计算

ksort($postData);

$signStrArr
=
[];

foreach
($postData
as
$key
=>
$value)
{

$signStrArr[]
=
$key
.'='.
$value;

}

$postStr
=
implode('&',
$signStrArr);

$sign

=
base64_encode(hash_hmac('sha1',
$postStr,
$app_secret));

$postData['sign']
=
$sign;

//
请求接口

$apiUrl
=
'/api/platformXYZ/hao/list';

$return
=
curl($apiUrl,
$postData)

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

## Page 13

PHP版本加密方法的输出:$sign
=

MmU4NDUyOWI2ODhjMDQ0YjA0MmE1N2I1ODQxOTk0MGEzM2U2NTgxOA==

2.1.2 详细示例-JAVA版本签名算法

代码块

1 private static final String appSecret = "PilljELdnIT50vB0XMI5Lqg9koGwiCvq";
2 private static final String appId = "ODU9qCPiUCsYXj2e";
3
4
5 /**
6 * 生成签名方法
7 * @param params
8 * @param secret
9 * @return
10 * @throws NoSuchAlgorithmException
11 * @throws InvalidKeyException
12 */
13 public static String sign(Map<String, Object> params, String secret)
throws NoSuchAlgorithmException, InvalidKeyException {
14 // 对请求参数按照字母顺序进行排序并组合
15 List<String> keys = new ArrayList<>(params.keySet());
16 Collections.sort(keys);
17 StringBuilder signatureBuilder = new StringBuilder();
18 for (int i = 0; i < keys.size(); i++) {
19 if (i != 0) {
20 signatureBuilder.append("&");
21 }
22 String k = keys.get(i);
23 // 这里没有对键和值进行URL编码,如果需要的话可以使用 URLEncoder.encode
24 signatureBuilder.append(k).append("=").append(params.get(k));
25 }
26 String signature = signatureBuilder.toString();
27 // 将排序后的signature进行HMAC-SHA1操作
28 Mac sha1Mac = Mac.getInstance("HmacSHA1");
29 SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(),
"HmacSHA1");
30 sha1Mac.init(secretKeySpec);
31 byte[] hash = sha1Mac.doFinal(signature.getBytes());
32 // 将哈希结果转换为十六进制字符串
33 String hexHash = String.format("%040x", new BigInteger(1, hash));
34 // 返回Base64编码后的签名
35 return Base64.getEncoder().encodeToString(hexHash.getBytes());
36 }
37

## Page 14

38 /**
39 * 测试
40 * @param args
41 * @throws Exception
42 */
43 public static void main(String[] args) throws Exception{
44 long timeMillis = System.currentTimeMillis() / 1000;
45 Map postData = new HashMap();
46 postData.put("app_id",appId);
47 postData.put("app_secret",appSecret);
48 postData.put("timestamp",timeMillis);
49 String signature = sign(postData, appSecret);
50 System.out.println("Signature: " + signature);
51
52 //入参json
53 Map params = new HashMap();
54 params.put("app_id",appId);
55 params.put("app_secret",appSecret);
56 params.put("timestamp",timeMillis);
57 params.put("sign",signature);
58 String json = JSONObject.toJSONString(params);
59 System.out.println("接口入参:"+json);
60 Response response =
HttpToolUtil.postJsonRequest("http://10.31.4.248:8690/api/kzs/hao/searchFilter"
, json, null);
61 System.out.println("response:" + response);
62 System.out.println("接口响应:" + response.body().string());
63 }
64 }
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

## Page 15

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
3. 业务流程

3.1 租号业务流程

## Page 16

3.2 撤单业务流程

## Page 17

3.3 续租业务流程

## Page 18

4. 接口列表

4.1 API
对接流程

## Page 19

注:

1. 在用戶下单后,首先判断用戶是否支付成功,当用戶支付成功后,请求下单接口;

2. 当请求租号玩下单接口失败,例如:因抢单造成下单失败,执行自动退款流程,为用戶退款

3. 订单状态可以通过4.11上报第三方(信息同步)接口,获取订单状态通知,更新订单状态

4.2 API
功能列表简介

序号
API
描述

1
账号搜索条件
该接口适用于合作方获取对应游戏的筛选条件

/api/platformXYZ/hao/searchFilter

## Page 20

2
账号搜索列表
该接口适用于合作方根据此接口从租号应用获取货架列表信息

/api/platformXYZ/hao/search

3
账号详情
该接口适用于合作方获取货架对应的标题信息、租赁价格信
息、基本的装备数量信息、段位信息等。

/api/platformXYZ/hao/info

4
货架详情
该接口适用于合作方获取货架对应的具体装备图片信息、装备
名称信息等。该接口获取的装备信息更加丰富一些,例如英雄
/api/platformXYZ/hao/detailInfo

图片、装备图片等。

5
下单接口
合作方中转账号通过此接口在租号应用平台找到对应的货架进
行下单操作

/api/platformXYZ/order/placeOrde
r

6
订单续租
合作方中转账号通过此接口在租号应用平台找到对应的货架进
行续租操作

/api/platformXYZ/order/relet

7
订单详情
合作方通过此接口用于获取订单信息,包含订单被投诉后的订
单状态和投诉信息。

/api/platformXYZ/order/info

8
获取投诉类型
合作方通过此接口从租号玩获取该游戏下的所有投诉类型,是
进行订单投诉的前一步骤。

手游:/api/platformXYZ/ts/getType

端游:/api/platformXYZ/ts/getType

9
上报支付ID/用戶ID
合作方通过此接口将订单对应的用戶id和支付id进行上报,后
续租号玩可进行对应的⻛控处理。

/api/platformXYZ/report/payid

10
第三方发起投诉
合作方通过此接口发起订单投诉,支持的投诉类型⻅下方对应
的接口说明。

/api/platformXYZ/ts/add

11
上报第三方(信息同步)接口
主要用于租号应用平台的货架信息更新,订单正常结算,订单
投诉处理后向合作方同步对应状态信息。

12
账号租送功能
为了鼓励用戶下单,部分号主为账号设置包含租送奖励,如租4
送2,租5送3。

租送功能涉及4个接口:

1. 账号搜索列表

2. 账号详情

3. 下单接口

4. 订单续租

## Page 21

对于租送功能,可以在账号列表⻚和账号详情⻚提现租送信
息,鼓励用戶下单。

13
下单前验证用戶是否被拉黑
合作方在租客下单前上报用戶id到租号玩平台,查询用戶是否
被号主或平台拉黑,来决定用戶是否能够完成支付下单行为,
接口
拦截恶意租客。

(GET):/tool/verify_blacklist

14
逆战解除安全模式接口
合作方中转账号通过此接口在逆战游戏中进行解除安全模式校
验

1. 首先调用申请安全模式解除接口

(/api/platformXYZ/game/removeSafeModeRequest)
,获取返回值和游戏中的安全码。

2. 后续请求安全模式验证接口
(/api/platformXYZ/game/removeSafeModeRes)并传
递相关参数进行解除校验。

15
API号池全游戏信息推送
针对号池内所有的游戏进行分类推送,分为端游和steam游戏

4.3 号池游戏推送

4.3.1 接口描述

号池内所有游戏通过接口将所有支持的游戏进行推送。

4.3.2 请求方法

请求地址:

/api/platformXYZ/game/all

请求参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

size
string
是
每⻚输出的游戏数据量

offset
string
是
过滤几条数据

比如要第10到20条数据,
就传offset=10过滤前十
条,size=10取十条

## Page 22

响应结果

字段
类型
必填
说明

status
int
是
状态

msg
string
是
消息提示

data
string
是
game_id:游戏信息

game_name:游戏名称

game_type:游戏分类

1为手游
2为端游
3为⻚游

4为steam

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "获取成功",
4 "data": [
5 {
6 "game_id": 11,
7 "game_name": "穿越火线",
8 "game_type": 2
9 },
10 {
11 "game_id": 16,
12 "game_name": "地下城与勇士",
13 "game_type": 2
14 },
15 {
16 "game_id": 17,
17 "game_name": "英雄联盟",
18 "game_type": 2
19 },
20 {
21 "game_id": 582,
22 "game_name": "CSGO",
23 "game_type": 4
24 }
25 ]
26 }

## Page 23

4.4 账号搜索条件

4.4.1 接口描述

第三方平台根据此接口从租号应用获取账号筛选信息,支持PC和移动端的基础筛选和高级筛选功
能,具体⻅下方接口描述。

4.4.2 请求方法

请求地址:

/api/platformXYZ/hao/searchFilter

第三方从此接口获取账号筛选信息

请求参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

game_id
int
否
游戏ID

响应结果

字段
类型
必填
说明

status
int
是
状态

msg
string
是
消息提示

data
string
是
game_id:游戏信息

game_data:游戏装备信
息

{

"list":
[

{

"name":
"0-30V",

## Page 24

"value":
1307

},

{

"name":
"31-
70V",

"value":
6068

}

],

"multi_choose":
0,

//1=多选
0=单选

"name":
"英雄武器数"
}

zone_id:游戏大区信息

server_id:游戏服务器信
息

szq:起租时⻓

price_max:价格区间,
最大价格

price_min:价格区间,
最小价格

qrf_allow:是否可排
位,1=允许
2=不允许

sort:排序,search接口
相对应的传order_type和
order_way

phone_type:适配系统

plat_support:支持平台
(csgo使用)

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": [
5 {
6 "game_data": [

## Page 25

7 {
8 "list": [
9 {
10 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c26335fdc.jpg",
11 "name": "孙悟空",
12 "value": 1536
13 },
14 {
15 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c26e74fd8.jpg",
16 "name": "太乙真人",
17 "value": 1537
18 },
19 {
20 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
26/5ab8c2574aef9.jpg",
21 "name": "孙尚香",
22 "value": 1535
23 }
24 ],
25 "multi_choose": 1,
26 "name": "英雄"
27 },
28 {
29 "list": [
30 {
31 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5aba1038b70f5.png",
32 "name": "倔强⻘铜I",
33 "value": 1830
34 },
35 {
36 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5aba105692369.png",
37 "name": "尊贵铂金I",
38 "value": 1832
39 },
40 {
41 "img": "",
42 "name": "尊贵铂金II",
43 "value": 7483
44 },
45 {
46 "img": "",
47 "name": "尊贵铂金III",
48 "value": 7484

## Page 26

49 },
50 {
51 "img": "",
52 "name": "尊贵铂金IV",
53 "value": 7485
54 },
55 {
56 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5aba107760903.png",
57 "name": "永恒钻石I",
58 "value": 1834
59 },
60 {
61 "img": "",
62 "name": "传奇王者",
63 "value": 9787
64 }
65 ],
66 "multi_choose": 0,
67 "name": "段位"
68 },
69 {
70 "list": [
71 {
72 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5ab9ee0b3eca9.jpg",
73 "name": "鲁班七号 星空梦想",
74 "value": 1797
75 },
76
77 {
78 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2023-10-
13/652914af9bee8.jpg",
79 "name": "鲁班七号 时之奇旅",
80 "value": 37886
81 },
82 {
83 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2023-07-
25/64bf9d685c76f.jpg",
84 "name": "裴擒⻁ 擒涛扼浪",
85 "value": 21759
86 },
87 {
88 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2023-10-
13/652914cb5ff07.jpg",
89 "name": "大乔 时之奇旅",
90 "value": 37887

## Page 27

91 }
92 ],
93 "multi_choose": 1,
94 "name": "皮肤"
95 },
96 {
97 "list": [
98 {
99 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-09-
17/5b9f49d85bd1c.jpg",
100 "name": "0-50",
101 "value": 4950
102 },
103 {
104 "img": "",
105 "name": "51-100",
106 "value": 9648
107 },
108 {
109 "img": "",
110 "name": "100以上",
111 "value": 9649
112 }
113 ],
114 "multi_choose": 0,
115 "name": "英雄数量"
116 },
117 {
118 "list": [
119 {
120 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-03-
27/5aba0fbf14792.png",
121 "name": "0-50",
122 "value": 1829
123 },
124 {
125 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2018-09-
17/5b9f49e42314c.jpg",
126 "name": "51-100",
127 "value": 1837
128 },
129 {
130 "img": "",
131 "name": "101-150",
132 "value": 6049
133 },
134 {

## Page 28

135 "img": "",
136 "name": "151-200",
137 "value": 6050
138 },
139 {
140 "img": "",
141 "name": "201-250",
142 "value": 6051
143 },
144 {
145 "img": "",
146 "name": "251-300",
147 "value": 7908
148 },
149 {
150 "img": "",
151 "name": "301以上",
152 "value": 7909
153 }
154 ],
155 "multi_choose": 0,
156 "name": "皮肤数量"
157 },
158 {
159 "list": [
160 {
161 "img": "http://zhwpic.zuhaowan.com/images/game_data_img/2020-11-
02/5f9fb7c5e5693.jpg",
162 "name": "武则天 倪克斯神谕",
163 "value": 7611
164 }
165 ],
166 "multi_choose": 1,
167 "name": "精选皮肤"
168 },
169 {
170 "list": [
171 {
172 "img": "",
173 "name": "0-10",
174 "value": 8219
175 },
176 {
177 "img": "",
178 "name": "11-20",
179 "value": 8220
180 },

## Page 29

181 {
182 "img": "",
183 "name": "21及以上",
184 "value": 8221
185 }
186 ],
187 "multi_choose": 0,
188 "name": "150铭文套数"
189 },
190 {
191 "list": [
192 {
193 "img": "",
194 "name": "V1",
195 "value": 9542
196 },
197 {
198 "img": "",
199 "name": "V2",
200 "value": 9543
201 },
202 {
203 "img": "",
204 "name": "V10无双贵族",
205 "value": 39418
206 },
207 {
208 "img": "",
209 "name": "V10荣耀贵族",
210 "value": 39419
211 }
212 ],
213 "multi_choose": 0,
214 "name": "VIP等级"
215 },
216 {
217 "list": [
218 {
219 "img": "",
220 "name": "国标",
221 "value": 9589
222 },
223 {
224 "img": "",
225 "name": "省标",
226 "value": 9590
227 },

## Page 30

228 {
229 "img": "",
230 "name": "市标",
231 "value": 9591
232 },
233 {
234 "img": "",
235 "name": "区标",
236 "value": 9592
237 }
238 ],
239 "multi_choose": 0,
240 "name": "在榜排名"
241 },
242 {
243 "list": null,
244 "multi_choose": 1,
245 "name": "星传说"
246 },
247 {
248 "list": [
249 {
250 "img": "",
251 "name": "男",
252 "value": 39785
253 },
254 {
255 "img": "",
256 "name": "女",
257 "value": 39786
258 }
259 ],
260 "multi_choose": 0,
261 "name": "性别信息"
262 }
263 ],
264 "game_id": {
265 "name": "王者荣耀",
266 "value": 443
267 },
268 "phone_type": [
269 {
270 "name": "安卓",
271 "value": "android"
272 },
273 {
274 "name": "苹果",

## Page 31

275 "value": "ios"
276 }
277 ],
278 "price_max": {
279 "name": "最高价格",
280 "value": 999
281 },
282 "price_min": {
283 "name": "最低价格",
284 "value": 0
285 },
286 "server_id": [
287 {
288 "name": "QQ账号",
289 "parent_id": 7717,
290 "value": 7718
291 },
292 {
293 "name": "QQ账号",
294 "parent_id": 7720,
295 "value": 7721
296 },
297 {
298 "name": "微信抢先服 2区",
299 "parent_id": 11533,
300 "value": 11920
301 }
302 ],
303 "sort": [
304 {
305 "name": "Price, low to high",
306 "order_type": "p",
307 "order_way": "asc"
308 },
309 {
310 "name": "Price, high to low",
311 "order_type": "p",
312 "order_way": "desc"
313 }
314 ],
315 "szq": {
316 "name": "起租时⻓",
317 "value": 1
318 },
319 "zone_id": [
320 {
321 "name": "QQ安卓",

## Page 32

322 "value": 7717
323 },
324 {
325 "name": "QQ苹果",
326 "value": 7720
327 },
328 {
329 "name": "微信安卓",
330 "value": 9419
331 },
332 {
333 "name": "微信苹果",
334 "value": 9566
335 },
336 {
337 "name": "QQ安卓抢先服",
338 "value": 11532
339 },
340 {
341 "name": "微信安卓抢先服",
342 "value": 11533
343 }
344 ]
345 }
346 ]
347 }
4.5 搜索返回货架列表

4.5.1 接口描述

第三方平台根据此接口从租号应用获取货架列表信息,是否存储到第三方平台自身由第三方自行操
作。货架从该接口返回给第三方后,如果货架信息发生变化,会在后台将这些变动信息推送给第三
方,因此第三方需要提供接口接收变动信息(具体回调接口)。

4.5.2 请求方法

请求地址:

/api/platformXYZ/hao/search

业务参数

端游

## Page 33

字段
类型
必填
示例
说明

app_id
string
是

公共参数,应用ID
(由开发人员
单独提供)

sign
string
是

公共参数,通过2.1鉴权方法
获
得签名字符串

timestamp
int64
是

公共参数,时间戳

game_id
int
是

端游id

zone_id
int
否

游戏大区编号

server_id
int
否

游戏服务器编号

price_min
float
否

价格区间,最小价格

price_max
float
否

价格区间,最大价格

szq
int
否

起租时⻓

qrf_allow
int
否

是否可排位,1=允许
2=不允许

game_data
string
否

游戏装备,装备编号用英文逗号
(,)分隔

page
int
是

⻚码
最大100

page_size
int
否

每⻚数量
最小10

最大50
keywords
string
否

关键词匹配,分词匹配,根据关
键词内容匹配账号标题、武器装

备等名称

参考关键词:

CF:传奇
枪王荣耀
枪王
幻神音
效卡
M200-幻神
VIP6
斯泰尔-蝴
蝶
幻神宠儿
幻神

LOL:不屈白银
荣耀⻩金
可排
位
排位
璀璨钻石
沙漠玫瑰
最强
王者

绝地求生:柏林
M762
⻮轮
大魔
王
M4
雪地满套
女团

CSGO:蝴蝶刀
⻰狙
宝石
潘多
拉
印花集
爪子刀

order_way
string
是

排序方式

## Page 34

desc/asc

order_type
string
是

t:发布时间

p:价格

s:热度

c:近一个月收藏

usernum:近一个月好评

dp:折扣价格

maintenance_ int
否

游戏维护状态
1:正常,0:维护
status
中

phone_type
string
否

适配系统:安卓:android,苹
果:ios

pc_quick_type
string
否

端游上号方式:

2.1、2.2、1.0

eq_num_1
string
否
提供范围值(使用 装备数量(游戏对应关系):

逗号隔开):

穿越火线-英雄武器数量

例:

英雄联盟-皮肤数量

"0,10"

逆战-武器数量

"10,100"

王者荣耀-皮肤数量

"100,9999"

枪战王者-英雄武器数

火影忍者手游-S级忍者数量

注:最小值0,最
QQ⻜⻋手游-A⻋数量

大值9999

和平精英-套装数量

第五人格-虚妄杰作数量

三国杀手游-史诗武将数量

光遇-头饰数量

无畏契约-英雄数量

元梦之星-赛季时尚分

金铲铲之战-至臻小小英雄数量

eq_num_2
string
否
装备数量(游戏对应关系):

穿越火线-王者武器数量

英雄联盟-英雄数量

逆战-⻆色数量

## Page 35

王者荣耀-英雄数量

枪战王者-王者武器数

火影忍者手游-忍者总数

和平精英-粉装数量

第五人格-金数量

三国杀手游-神将数量

光遇-面具数量

无畏契约-武器皮肤数量

eq_num_3
string
否
装备数量(游戏对应关系):

火影忍者手游-A级忍者数量

和平精英-枪皮数量

第五人格-时装数量

三国杀手游-传说皮肤数量

光遇-斗篷数量

蛋仔派对-总潮流度

无畏契约-传奇数量

元梦之星-非凡数量

金铲铲之战-小小英雄数量

eq_num_4
string
否
装备数量(游戏对应关系):

英雄联盟-小小英雄数量

火影忍者手游-战力

和平精英-特效枪数量

第五人格-随从数量

三国杀手游-武将数量

光遇-裤子数量

蛋仔派对-隐藏数

无畏契约-终极数量

元梦之星-累计时尚分

金铲铲之战-攻击特效数量

eq_num_5
string
否
装备数量(游戏对应关系):

英雄联盟-棋盘皮肤数量

和平精英-载具数量

第五人格-随身物品数

## Page 36

三国杀手游-皮肤数量

光遇-佩饰数量

蛋仔派对-至臻数

无畏契约-卓越数量

金铲铲之战-竞技场数量

请求示例

代码块

1 {
2 "app_id": "a123456",
3 "app_secret": "b123456789",
4 "eq_num_1": "100,9999",
5 "eq_num_2": "1,9999",
6 "game_id": 446,
7 "isGreat": 0,
8 "phone_type": "android",
9 "price_max": 2,
10 "price_min": 1,
11 "sign": "YmM0YTlhwelODhkZDsdgN2I3N2MxYsdgZjdlYmVmYw==",
12 "timestamp": 1761791611
13 }
响应结果

字段
类型
必填
说明

status
int
是
状态

msg
string
是
消息提示

data
string
是
count:账号总数

list:账号列表
数组格式
每项字段如下:

"id":
10917,货架id
<number>

"pn":
"全装7v戒指都有自己看图吧VIP5有天
秤座毛瑟",账号标题
<string>

"pmoney":
"2.00",每小时租金
<string>

"bzmoney":
"0.00",账号押金
<string>

## Page 37

"gid":
11,游戏id
<number>

"pid":
417,游戏大区
id
<number>

"gsid":
420,服务器
id
<number>

"game_zone_name":
"全区",游戏大区

<string>

"game_server_name":
"全服",游戏服务器

<string>

"role_name":
"⻆色名",⻆色名
<string>

"client_shfs":上号方式,端游2.0,快捷登
录,-
<string>

"p5":
"10.00",包早租金
<string>

"p8":
"12.00",包夜租金
<string>

"p10":
"15.00",十小时租金
<string>

"p24":"99.00",包天租金<string>

"p168":359.3,周租金
<string>

mobile_shfs:手游上号方式

additional:Csgo和Dota2上号扩展信息

app_categoryid:是否为手游,1是/0否

categoryid:
1为手游
2为端游
3为⻚游

credit_score:王者荣耀信誉积分

equipment_info:装备属性信息

game_img:游戏图片

game_name:游戏名称

is_cloud:快速上号-云上号,1是/0否

is_quick_login:快速上号,1是/0否

maintenance_status:游戏维护状态
1:正
常,0:维护中

offline:到时不下线设置,0无1下线2不下线

oms1:可租时间段-开始小时

oms2:可租时间段-结束小时

pc_shq_booster:PC加速器上号器上号,1
是/0否

pic_list:货架图片

## Page 38

qualifying_allow:是否允许排位,0不支
持/1是/2否

szq:最短租期

ban_info:无畏契约封禁信息

ban_info.wwqy_close_zt
:
0未封禁,1封禁

ban_info.wwqy_close_model
:
封禁模式

ban_info.wwqy_close_start_time:
封禁开
始时间

ban_info.wwqy_close_end_time:
封禁结束
时间

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "count": 8730,
6 "list": [
7 {
8 "additional": null,
9 "ban_info": {
10 "wwqy_close_end_time": "",
11 "wwqy_close_model": "",
12 "wwqy_close_start_time": "",
13 "wwqy_close_zt": 0
14 },
15 "app_categoryid": 1,
16 "bzmoney": "0.00",
17 "c_rank": 0,
18 "categoryid": 1,
19 "client_shfs": "-",
20 "credit_score": 0,
21 "dw": "30",
22 "em": "1.00",
23 "equipment_info": {
24 "48": {
25 "dt_name": "段位",
26 "gd_name": "尊贵铂金I"
27 },
28 "51": {
29 "dt_name": "皮肤数量",

## Page 39

30 "gd_name": "51-100"
31 }
32 },
33 "game_img": "//zhwpic.zuhaowan.com/images/images/2024-09-
13/yfzvec66e3e9139f31e.png",
34 "game_name": "王者荣耀",
35 "game_server_name": "QQ账号",
36 "game_zone_name": "QQ安卓",
37 "gid": 443,
38 "gsid": 7718,
39 "hzq": 9999,
40 "id": 404142,
41 "is_cloud": 0,
42 "is_quick_login": 0,
43 "jsm": "耳⻖⻥禾 ",
♕
44 "maintenance_status": 1,
45 "mobile_shfs": "-",
46 "offline": 0,
47 "oms1": 0,
48 "oms2": 24,
49 "p10": "15.00",
50 "p168": "200.00",
51 "p24": "30.00",
52 "p5": "10.00",
53 "p8": "13.00",
54 "pc_shq_booster": 0,
55 "pf": 0,
56 "pic_list": [
57 "//pic.zuhaowan.com/images/account_img/2017-05-17/591c1ca565ecf.jpg",
58 "//pic.zuhaowan.com/images/account_img/2017-05-17/591c1f9bbc7c3.jpg",
59 "//pic.zuhaowan.com/images/account_img/2017-05-17/591c232d846ce.jpg",
60 "//pic.zuhaowan.com/images/account_img/2017-05-17/591c2c9e18e4b.jpg",
61 "//pic.zuhaowan.com/images/account_img/2017-05-17/591c30804c2e4.jpg"
62 ],
63 "pid": 7717,
64 "pmoney": "2.00",
65 "pn": "不会吃亏 不会上当 总之一局没毛病 背包东西不要乱动 谢谢",
66 "qualifying_allow": 2,
67 "role_name": "耳⻖⻥禾 ",
♕
68 "shfs": 0,
69 "szq": 2,
70 "youxi": "铭文全是刺客的 皮肤基本也都是刺客的 喜欢的可以收藏 Q Q 2 2 2 0
9 9 8 3 9 9",
71 "yx": "",
72 "zt": 0
73 },
74 {

## Page 40

75 "additional": null,
76 "app_categoryid": 1,
77 "bzmoney": "0.00",
78 "c_rank": 0,
79 "categoryid": 1,
80 "client_shfs": "-",
81 "credit_score": 100,
82 "dw": "30",
83 "em": "8.00",
84 "equipment_info": {
85 "47": {
86 "dt_name": "英雄",
87 "gd_num": 96
88 },
89 "48": {
90 "dt_name": "段位",
91 "gd_name": "永恒钻石I"
92 },
93 "49": {
94 "dt_name": "皮肤",
95 "gd_num": 206
96 },
97 "51": {
98 "dt_name": "皮肤数量",
99 "gd_name": "0-50"
100 }
101 },
102 "game_img": "//zhwpic.zuhaowan.com/images/images/2024-09-
13/yfzvec66e3e9139f31e.png",
103 "game_name": "王者荣耀",
104 "game_server_name": "QQ账号",
105 "game_zone_name": "QQ安卓",
106 "gid": 443,
107 "gsid": 7718,
108 "hzq": 72,
109 "id": 5595378,
110 "is_cloud": 0,
111 "is_quick_login": 0,
112 "jsm": "2",
113 "maintenance_status": 1,
114 "mobile_shfs": "-",
115 "offline": 0,
116 "oms1": 0,
117 "oms2": 24,
118 "p10": "32.40",
119 "p168": "252.00",
120 "p24": "50.40",

## Page 41

121 "p5": "10.80",
122 "p8": "18.00",
123 "pc_shq_booster": 0,
124 "pf": 0,
125 "pid": 7717,
126 "pmoney": "3.60",
127 "pn": "4荣耀典藏凤求凰天魔缭乱海洋之心武陵仙君地狱之眼优雅恋人狗年",
128 "qualifying_allow": 1,
129 "role_name": "2",
130 "server_info": "手Q140区-禁血狂兽",
131 "shfs": 1,
132 "szq": 2,
133 "youxi": "各位老板不要瞎搞,不要挂机什么的,喜欢此号就收藏,方便下次继续租。只要
信誉分被扣,黑名单⻅,时间到了请老板们在三十分钟内下号\n\n只能打自建房,看清楚在租,租错不
允撤单,别怪我\n\n\n\n\n看清楚在租号,只要号被扣信誉分,挂机,被举报了,撤单,永久拉黑,
望各位老板好好珍惜此号,祝各位老板每天都能中五百万",
134 "yx": "android",
135 "zt": 0
136 }
137 ]
138 }
139 }
4.6 账号详情

4.6.1 接口描述

第三方平台根据此接口从租号应用获取货架详情信息。

4.6.2 请求方法

请求地址:

/api/platformXYZ/hao/info

业务参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

## Page 42

hao_id
int
是
货架id

响应结果

字段
类型
必填
说明

status
int
是
状态

msg
string
是
消息提示

data
string
是
"id":
10917,账号id

<number>

"pn":
"全装7v戒指都有自
己看图吧VIP5有天秤座毛
瑟",账号标题
<string>

"pmoney":
"2.00",每小
时租金
<string>

"bzmoney":
"0.00",账号
押金
<string>

"gid":
11,游戏id

<number>

"pid":
417,游戏大区
id

<number>

"gsid":
420,服务器
id

<number>

"jsm":
"⻆色名",⻆色名

<string>

"equipment":
"装备",装
备信息
<json>

"zt":
"0",货架状态

<number>:-4删除-3审
核不通过-2待审-1下架0
待租1已租2投诉
|21购买
锁定

"remarks":
"货架正常",
货架状态说明
<string>

"youxi":
"货架描述",货架
描述
<string>

"szq":
"1",起租时⻓

<number>

## Page 43

"hzq":
"99",最大可租时
⻓
<number>

"oms1":
"0",可租开始时
间
<number>

"oms2":
"24",可租结束时
间
<number>

pic_list:详情图片

qualifying_allow:1可排
位

power_317:火影战力
steamid:
csgo游戏下的
steam账号id(仅针对部分
三方开放)

account_tag:货架标签

additional:Csgo和
Dota2上号扩展信息

credit_score:王者荣耀
信誉积分

equip_extend:装备扩
展属性信息

equipment:装备信息

game_name:游戏名称

game_zone_name:游
戏大区名称

game_server_name:游
戏服务器名称

premium_pic:货架精品
图片

delta_force_label.coin

:
三⻆洲哈夫币数量

delta_force_label.excha
nge_rate:
三⻆洲哈夫币
兑换比例

delta_force_label.label
:
三⻆洲哈夫币标签

delta_force_label.prepa
yment:
三⻆洲哈夫币预
付款金额

## Page 44

delta_force_label.hf_re
nt_mode:
1-哈夫币模
式,2-租金模式

is_cloud
:
是否快速上号

1-是,2-不是

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "account_tag": [],
6 "additional": null,
7 "bzmoney": "0.00",
8 "credit_score": 99,
9 "equip_extend": [
10 {
11 "name": "信誉积分",
12 "value": 99
13 },
14 {
15 "name": "排位",
16 "value": "不允许"
17 },
18 {
19 "name": "⻆色名",
20 "value": "yhr卡1"
21 },
22 {
23 "name": "段位信息",
24 "value": "永恒钻石I"
25 },
26 {
27 "list": [
28 "孙悟空 地狱火",
29 "王昭君 偶像歌手",
30 "项羽 苍穹之光",
31 "项羽 海滩派对",
32 "亚瑟 死亡骑士",
33 "虞姬 加勒比小姐",
34 "赵云 皇家上将",
35 "钟馗 地府判官",
36 "阿轲 暗夜猫娘",

## Page 45

37 "白起 白色死神",
38 "白起 狰",
39 "扁鹊 化身博士",
40 "妲己 女仆咖啡",
41 "妲己 少女阿狸",
42 "狄仁杰 超时空战士",
43 "狄仁杰 魔术师",
44 "狄仁杰 阴阳师",
45 "干将莫邪 第七人偶",
46 "宫本武藏 ⻤剑武藏",
47 "⻩忠 芝加哥教父",
48 "铠 ⻰域领主",
49 "兰陵王 暗隐猎兽者",
50 "李白 千年之狐",
51 "刘备 汉昭烈帝",
52 "吕布 末日机甲",
53 "芈月 红桃皇后",
54 "孙尚香 末日机甲",
55 "安琪拉 心灵骇客",
56 "宫本武藏 霸王丸",
57 "后羿 辉光之辰",
58 "鲁班七号 星空梦想",
59 "裴擒⻁ 街头旋⻛",
60 "王昭君 幻想奇妙夜",
61 "杨玉环 霓裳曲",
62 "诸葛亮 武陵仙君",
63 "百里守约 特工魅影",
64 "典⻙ 穷奇",
65 "刘禅 天才⻔将",
66 "铠 曙光守护者",
67 "后羿 ⻩金射手座",
68 "曹操 烛⻰",
69 "盾山 极冰防御线"
70 ],
71 "name": "皮肤数量",
72 "value": 42
73 },
74 {
75 "list": [
76 "百里守约",
77 "阿轲",
78 "安琪拉",
79 "白起",
80 "百里玄策",
81 "扁鹊",
82 "蔡文姬",
83 "曹操",

## Page 46

84 "妲己",
85 "狄仁杰",
86 "典⻙",
87 "东皇太一",
88 "干将莫邪",
89 "高渐离",
90 "宫本武藏",
91 "关羽",
92 "⻤谷子",
93 "韩信",
94 "后羿",
95 "⻩忠",
96 "姜子牙",
97 "铠",
98 "兰陵王",
99 "老夫子",
100 "李白",
101 "廉颇",
102 "刘备",
103 "刘禅",
104 "鲁班七号",
105 "吕布",
106 "芈月",
107 "明世隐",
108 "裴擒⻁",
109 "孙尚香",
110 "孙悟空",
111 "太乙真人",
112 "王昭君",
113 "夏侯惇",
114 "项羽",
115 "小乔",
116 "亚瑟",
117 "杨戬",
118 "杨玉环",
119 "嬴政",
120 "虞姬",
121 "赵云",
122 "钟馗",
123 "诸葛亮",
124 "庄周",
125 "狂铁",
126 "元歌",
127 "孙策",
128 "盾山",
129 "伽罗"
130 ],

## Page 47

131 "name": "英雄数量",
132 "value": 54
133 }
134 ],
135 "equipment": {
136 "47": {
137 "dt_name": "英雄",
138 "gd_num": 54
139 },
140 "48": {
141 "dt_name": "段位",
142 "gd_name": "永恒钻石I"
143 },
144 "49": {
145 "dt_name": "皮肤",
146 "gd_num": 42
147 }
148 },
149 "game_name": "王者荣耀",
150 "game_server_name": "QQ账号",
151 "game_zone_name": "QQ安卓",
152 "gid": 443,
153 "gsid": 7718,
154 "hzq": 30,
155 "id": 3374019,
156 "jsm": "yhr卡1",
157 "oms1": 0,
158 "oms2": 24,
159 "p10": "18.90",
160 "p168": "147.00",
161 "p24": "29.40",
162 "p5": "6.30",
163 "p7": "14.70",
164 "p720": "5.00",
165 "p8": "10.50",
166 "pic_list": [
167 "//zhwimg.zuhaowan.com/images/account_img/2019-03-07/5c7ff82e0ead6.jpg",
168 "//zhwimg.zuhaowan.com/images/account_img/2019-03-07/5c7ff8af95450.jpg",
169 "//zhwimg.zuhaowan.com/images/account_img/2019-03-07/5c7ff8c7328ed.jpg"
170 ],
171 "pid": 7717,
172 "pmoney": "2.10",
173 "pn": "【搜亮点】禁言单水星空┃⻩金射手┃地狱火┃末日机甲┃白昼王子",
174 "premium_pic": "",
175 "qualifying_allow": 2,
176 "remarks": "货架正常",
177 "szq": 5,

## Page 48

178 "youxi": "【租号前必看】大量极品皮肤号【搜亮点】\n1出现挂机逃跑,扣分毁号,故意撤
单,诈骗等情况,一律拉黑并全网封杀;\n2到时请自觉下线,没打完的可以优先打完;\n3喜欢的请
收藏,有建议可以评论留言,我们会收集并进行改善,还会不定时补充新皮肤,给你们更好的体验。",
179 "yx": "android",
180 "zt": 0,
181 "is_cloud": 1
182 }
183 }
4.7 货架详情

4.7.1 接口描述

三方API增加货架详情数据推送,将对应游戏的装备信息图片、名称等传递给三方渠道,提升三方
用戶的租赁体验。

4.7.2 请求方法

接口(POST):

/api/platformXYZ/hao/detailInfo

业务参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

hao_id
int
是
货架id

gid

int
是
游戏id

响应结果

字段
类型
说明

status
int
状态

msg
string
消息提示

## Page 49

data
object
数据

-
dtTopList
object
[]
装备数据(未标注字段可
忽略)

-
advance_search
int
用于搜索项
0
否
1
是

-
dt_name int
装备大类名称

-
dataList
object[]
装备详细数据

-
data_img
string
装备图片

-
data_name
string
装备名称

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "dtTopList": [
6 {
7 "advance_search": 1,
8 "dataList": null,
9 "dt_name": "武器皮肤",
10 "gd_num": 0,
11 "id": 138,
12 "is_nav": 1,
13 "multi_choose": 1,
14 "parent_id": 0
15 },
16 {
17 "advance_search": 1,
18 "dataList": [
19 {
20 "classify": 0,
21 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2023-08-22/64e4285233e3b.png",
22 "data_name": "金战云-人类之光",
23 "dt_id": 74,
24 "first_letter": "",
25 "id": 35342,
26 "parent_id": 0,
27 "pf_type": 0
28 }

## Page 50

29 ],
30 "dt_name": "⻆色",
31 "gd_num": 0,
32 "id": 74,
33 "is_nav": 1,
34 "multi_choose": 1,
35 "parent_id": 0
36 },
37 {
38 "advance_search": 1,
39 "dataList": [
40 {
41 "classify": 0,
42 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2023-07-19/64b77d619c25e.png",
43 "data_name": "G3SG2",
44 "dt_id": 310,
45 "first_letter": "",
46 "id": 32513,
47 "parent_id": 0,
48 "pf_type": 0
49 }
50 ],
51 "dt_name": "主武器",
52 "gd_num": 0,
53 "id": 310,
54 "is_nav": 1,
55 "multi_choose": 1,
56 "parent_id": 0
57 },
58 {
59 "advance_search": 1,
60 "dataList": null,
61 "dt_name": "近身武器",
62 "gd_num": 0,
63 "id": 81,
64 "is_nav": 1,
65 "multi_choose": 1,
66 "parent_id": 0
67 },
68 {
69 "advance_search": 1,
70 "dataList": [
71 {
72 "classify": 0,
73 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2023-07-20/64b9006c96dae.png",

## Page 51

74 "data_name": "薰氛手雷-极昼冰河",
75 "dt_id": 82,
76 "first_letter": "",
77 "id": 33804,
78 "parent_id": 0,
79 "pf_type": 0
80 }
81 ],
82 "dt_name": "投掷武器",
83 "gd_num": 0,
84 "id": 82,
85 "is_nav": 1,
86 "multi_choose": 1,
87 "parent_id": 0
88 },
89 {
90 "advance_search": 1,
91 "dataList": [
92 {
93 "classify": 0,
94 "data_img":
"http://zhwpic.zuhaowan.com/images/game_data_img/2023-07-20/64b907f28c914.png",
95 "data_name": "战⻁面具",
96 "dt_id": 90,
97 "first_letter": "",
98 "id": 34309,
99 "parent_id": 0,
100 "pf_type": 0
101 }
102 ],
103 "dt_name": "⻆色饰品",
104 "gd_num": 0,
105 "id": 90,
106 "is_nav": 1,
107 "multi_choose": 1,
108 "parent_id": 0
109 }
110 ]
111 }
112 }
4.8 下单前置信息提示

🔔 下单前前置信息提示和获取行为的话,是区分游戏的,需要根据游戏来对接对应接口。

## Page 52

4.8.1 弹窗提示信息

4.8.1.1 接口描述

用于无畏契约、穿越火线下单前时的提示弹窗

4.8.1.2 请求方法

请求地址:/api/platformXYZ/hao/rentPreCheck

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

gid
是
游戏id

hao_id
是
货架id

响应结果

字段
类型
说明

status
int
状态1正常,0异常

msg
string
消息提示

data
string
响应数据

--
is_tip
bool
是否需要提示

--
msg
string
提示内容

--
duan_wei
string
段位信息

响应示例

代码块

## Page 53

1 // 无畏契约
2 {
3 "status": 1,
4 "msg": "",
5 "data": {
6 "is_tip": true,
7 "msg": "段位:当前赛季无,禁赛模式:禁止参与竞技模式,处罚开始时间:2025-04-23
10:09:22,处罚结束时间:2025-04-30 00:00:00",
8 "duan_wei": "无畏战神"
9 }
10 }
11
12 // 穿越火线
13 {
14 "status": 1,
15 "msg": "",
16 "data": {
17 "is_tip": true,
18 "msg": "该账号部分模式不可排位,游戏期间禁止中途退出,避免造成其他模式禁赛,恶意行为将
进行平台处罚",
19 "duan_wei": "新锐1"
20 }
21 }
4.8.2 下单前置
-
三⻆洲哈夫币获取

🔔 三⻆洲调用流程完整说明

API支持三⻆洲模式完整说明

4.8.2.1 接口描述

适配游戏:三⻆洲端游,下单前获取货架的哈夫币数量及预付款金额(必须调用)

4.8.2.2 请求方法

请求地址:/api/platformXYZ/hao/getGameData

请求参数

字段
必填
说明

## Page 54

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

gid
是
游戏id

hid
是
货架id

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
data_id
int
查询任务id(用于后续轮询查询结果)

响应示例

代码块

1 // 失败
2 {
3 "status": 201,
4 "msg": "货架出租模式不是哈夫币模式[201]",
5 "data": {
6 "data_id": 0
7 }
8 }
9
10 // 成功
11 {
12 "status": 1,
13 "msg": "发送成功[200]",
14 "data": {
15 "data_id": 691709989
16 }

## Page 55

17 }
4.8.3 下单前置
-
三⻆洲哈夫币获取结果查询

4.8.3.1 接口描述

适配游戏:三⻆洲端游,下单前获取货架的哈夫币数量及预付款金额

4.8.3.2 请求方法

请求地址:/api/platformXYZ/hao/getGameDataRst

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

task_id
是
获取时返回的任务id

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
gid
int
游戏id

--
hid
int
货架id

--
gold_money
float
哈夫币预付金额

--
gold_num
int
哈夫币数量

--
hao_coin_rate
int
1元对应哈夫币兑换比例,例:100000

## Page 56

响应示例

代码块

1 // 示例
2 {
3 "status": 100,
4 "msg": "游戏币获取失败暂时无法下单,请去看看其他货架吧!- 游戏币获取失败[100]",
5 "data": {
6 "gid": 1669,
7 "gold_money": 0,
8 "gold_num": 0,
9 "hao_coin_rate": 0,
10 "hid": 14428391
11 }
12 }
13
4.9 下单前验证用戶是否被号主拉黑

4.9.1
接口描述

三方平台在租客下单前上报用戶id查看用戶是否被拉黑,来决定用戶是否能够继续支付下单。

4.9.2
请求方法

请求地址::/tool/verify_blacklist

Method:
GET

请求参数

字段
必填
说明

hao_id
是
货架id

user_id

是
三方用戶id

响应结果

字段
类型
说明

code
int
状态1命中,0无异常

msg
string
消息提示

## Page 57

data
string
对象类型

-
notice
string
提示内容

-
val
string
用戶信息

响应示例

代码块

1 // 命中
2 {
3 "code": 1,
4 "msg": "用戶被拉黑",
5 "data": {
6 "notice": "当前用戶被商戶拉黑",
7 "val": "2664AD07F3243ED2A19BBF340395AA2F"
8 }
9 }
10
11 //无拉黑
12 {
13 "code": 0,
14 "msg": "无拉黑",
15 "data": null
16 }
4.10 下单接口

4.10.1 接口描述

第三方通过此接口在租号应用平台下单操作

4.10.2 请求方法

请求地址:

/api/platformXYZ/order/placeOrder

请求参数

字段
类型
必填
说明

## Page 58

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

hao_id
int
是
账号id

rent_hours
int
是
租赁时⻓

pay_id
string
是
用戶支付id

微信支付或支付宝的
openid

rent_type
int
否
1:时租,8:包夜,10:10小
时,24:包天,168:包周#请
输入租赁类型

pay_amount
float
否
租赁金额

is_tejia
int32
否
是否特价1是0否

hf_money
float
否
三⻆洲哈夫币预付款金额

响应结果

字段
类型
必填
说明

status
int
是
状态0失败,1成功

msg
string
是
消息提示

data
string
是
数组格式:返回订单id,
解锁码,开始/结束时
间,上号方式等

"oid":
1023274953545,
订单id
<int64>

"unlockcode":

"159723dd37f878dc322

## Page 59

200",订单解锁码

<string>

"stimer":
"2020-09-09

17:59:18",订单开始时间

<string>

"etimer":
"2020-09-09

19:04:18",订单结束时间

<string>

"rent_type":
1,⻅参数

<number>

"shfs":
1上号方式

⻅/hao/list接口返回说明

<number>

zh:
游戏账号(明文时返回)

mm:
游戏密码(明文时返
回)

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "下单成功",
4 "data": {
5 "etimer": "2025-08-25 21:19:21",
6 "mm": "******",
7 "oid": 257878107972357,
8 "order_amount": 13.5,
9 "rent_type": 1,
10 "shfs": 1,
11 "stimer": "2025-08-25 16:14:21",
12 "unlockcode": "sh936ecc71234f50783374019",
13 "zh": "********"
14 }
15 }
返回响应码说明

响应码
说明

20101
租方账号关闭

## Page 60

20201
货架状态不可租

20103
租方账号被出租方拉黑,不能租赁出租方所属货架

20102
租方租号记录不良,被限制租号

20104
租方连续撤单过多,被系统限制租号

20403
租赁些游戏货架受限

20401
该货架已停止出租

20402
游戏官网维护中

20406
逃跑挂机次数过多,不能租赁此货架

20105
撤单率不符合号主做出的限制

20404
该游戏账号可能未结束

10007
租赁时⻓小于号主设置的最小时⻓

10008
租赁时⻓大于号主设置的最大时⻓

10013
货架已被租用,请选择其它货架

10019
货架不在可租时间段内

10012
在所选时间内账号已被租用

20118
游戏官方维护提醒

10021
租方账号余额不足

30044
租号设备违规租号被封

4.11 订单续租

🔔 4.11续租接口与4.21续租接口为新旧续租接口区别。

其中,4.11续租是直接在原订单上增加时⻓进行续租,订单号不变;

4.21续租接口会进行订单拆分,续租订单的订单号和解锁码都会生成新的(上号侧续租订单不
需要重新上号,可以无缝过渡,租客无感),在前端展示⻚面也会显示两个订单,可进行续租
单单独取消。

4.11.1 接口描述

## Page 61

第三方通过此接口在租号应用平台进行订单续租操作。

4.11.2 请求方法

请求地址:

/api/platformXYZ/order/relet

请求参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

oid
int64
是
订单id

relet_hours
int
是
续租小时数

响应结果

字段
类型
必填
说明

status
int
是
状态0失败,1成功

msg
string
是
消息提示

data
string
是
数组格式:返回续租时⻓

"relet_hours":
1,

"etimer":续租后订单结束时间

"relet_fee":续租支付金额

响应示例

代码块

1 // 失败
2 {
3 "status": 0,

## Page 62

4 "msg": "续租订单不存在",
5 "data": null
6 }
7 // 成功
8 {
9 "status": 1,
10 "msg": "续租成功!",
11 "data": {
12 "etimer": "2025-08-25 22:19:21",
13 "relet_fee": "2.70",
14 "relet_hours": "1"
15 }
16 }
返回响应码说明

响应码
说明

10338
续租类型错误

10301
由于您的租号记录不良,已暂停您的租用功能

10302
由于您的租号记录不良,已暂停您的租用功能

10303
您在出租方的黑名单中,无法续租此账号

10304
订单不符合续租条件

10305
订单结算中

10306
当前订单已结束

10307
此游戏账号状态不可用

10308
游戏官方维护中

10309
游戏官方维护中

10310
游戏官方维护中

10315
超出账号允许的最大租赁时⻓

10316
此时间段内账号已被租用

10317
不在账号可租时间段内

10332
金额异常

## Page 63

10318
可用余额不足,请充值后租用

4.12 订单详情

4.12.1 接口描述

此接口用于获取订单信息包含订单被投诉后的订单状态和投诉信息。

4.12.2 请求方法

请求地址:

/api/platformXYZ/order/info

业务参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

oid
int64
是
订单id

响应结果

字段
类型
必填
说明

status
int
是
状态

0为正常

1为投诉中

2为
正常结算

3为撤单

msg
string
是
消息提示

data
string
否
对象类型
返回订单id和投
诉id

"hao_id":
1547441,货架
id
<number>

## Page 64

"order_id":

1023274953545,订单id

<int64>

"order_status":
0订单状
态
<number>

"unlock_code":

"adf2sfawdfasdfasf654"
解锁码
<string>

"start_time":
"2021-07-
01
15:00:00"订单开始时
间
<string>

"end_time":
"2021-07-
01
17:05:00"订单结束时
间
<string>

"pay_amount":
"2"支付
金额
<number>

"deposit":
"0"保证金
(押金)
<number>

"lease_term":
"1"租期

<number>

"role_name":
"⻆色
名"⻆色名
<string>

"game_name":
"王者荣
耀"游戏名
<string>

"server":
"区服"区服

<string>

"complain_time":

"2021-07-01
17:15:00"订
单投诉时间
<string>

"handle_opinion":
"允许
退款"客服处理意⻅

<string>

"refund_amount":
2.0订
单退款金额
<number>

"refund_deposit":
0订单
返还保证金
<number>

"hfb_status":
三⻆洲哈
夫币结算状态(0不支
持,1已支付【订单下
单】、2待结算【订单结

## Page 65

算】、3已结算【哈夫币
结算】、4已冻结)

<number>

"refund_hfb":
三⻆洲哈
夫币预付款退款金额

<number>

"refund_rent":
租赁支付
的退款金额(不包含预付
款)
<number>

"second_pwd":
游戏二
级密码(目前仅支持绝地
求生)
<string>

响应示例

FAQ:在三⻆洲行动端游中,可能会出现在投诉订单结算后,租金金额返还,但哈夫币金额为0的情
况,此时订单可能为⻛险订单,租号玩侧在进行哈夫币核实,会进行延迟结算。

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "complain_time": "2025-11-13 11:28:57",
6 "deposit": "0.00",
7 "end_time": "2025-11-13 13:33:04",
8 "game_name": "三⻆洲行动端游",
9 "handle_opinion": "哒哒哒",
10 "hao_id": 14430435,
11 "hfb_status": 3,
12 "lease_term": 2,
13 "order_id": 314360492802565,
14 "order_status": 3,
15 "pay_amount": 6,
16 "refund_amount": 440.39,
17 "refund_deposit": 0,
18 "refund_hfb": 434.42,
19 "refund_rent": 5.97,
20 "role_name": "小知了喳喳",
21 "server": "WeGame/QQ账号",
22 "start_time": "2025-11-13 11:28:04",
23 "second_pwd": "123456789",
24 "unlock_code": "shb24115b399c6d91714430435"
25 }

## Page 66

26 }
4.13 获取租号应用平台投诉类型

4.13.1 接口描述

此接口从租号应用平台获取所有投诉类型,是进行订单投诉的前一步骤。

这个请求获取的是平台全部投诉类型,可以拉取到本地后做投诉类型的多对一的映射、归类处理

投诉撤单的对应类型,请⻅附1
游戏对应投诉类型

4.13.2 请求方法

请求地址:

/api/platformXYZ/ts/getType

请求参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

响应结果

字段
类型
必填
说明

status
int
是
状态

msg
string
是
消息提示

data
string
是
对象类型
返回count投诉
类型总数和list数组类型

"count":
25,...

<number>
投诉类型总数

-"list":
{...<object>
数组
格式
投诉类型id:类型说

## Page 67

明

"1":
"账号描述与实际不
符",...
<string>

"2":
"账号密码错误",...

<string>

"3":
"无法登陆(非密码
错误问题)",...
<string>

"4":
"租错号了",...

<string>

"5":
"被挤号(顶号)
了",...
<string>

"6":
"不想玩了或其它理
由不玩了",...
<string>

"7":
"裁决之廉",...

<string>

"8":
"号被封了",...

<string>

"9":
"QQ冻结(QQ暂时
无法登陆)",...
<string>

"10":
"会员时间到期",...

<string>

"11":
"账号禁赛",...

<string>

"12":
"无法下载上号
器",...
<string>

"13":
"提示有外挂残
留",...
<string>

"14":
"安装不了上号
器",...
<string>

"15":
"一直云检测",...

<string>

"16":
"不输入账号密
码",...
<string>

"17":
"信誉积分不足",...

<string>

"18":
"游戏账号未实名认
证",...
<string>

"19":
"TP检测16-2",...

<string>

## Page 68

"20":
"steam客服已冻结
该帐戶",...
<string>

"21":
"复活币不足",...

<string>

"22":
"因财产密码",...

<string>

"23":
"安全问题错误",...

<string>

"24":
"游戏维护",...

<string>

"25":
"无法登录
(wegame错误码:
282)"...
<string>

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "count": 40,
6 "list": {
7 "1": "账号描述与实际不符",
8 "2": "账号密码错误",
9 "3": "无法登录(登录不上)",
10 "4": "租错号了",
11 "5": "被挤号(顶号)了",
12 "6": "不想玩了或其它理由不玩了",
13 "7": "裁决之廉",
14 "8": "号被封了",
15 "9": "账号冻结",
16 "10": "会员时间到期",
17 "11": "账号禁言",
18 "12": "无法下载上号器",
19 "13": "提示有外挂残留",
20 "14": "安装不了上号器",
21 "15": "一直云检测",
22 "16": "不输入账号密码",
23 "17": "信誉积分不足",
24 "18": "游戏账号未实名认证/未成年",
25 "19": "TP检测16-2/36-2",
26 "20": "steam客服已冻结该帐戶",

## Page 69

27 "21": "复活币不足",
28 "22": "因财产密码",
29 "23": "安全问题错误",
30 "24": "游戏维护",
31 "26": "健康时间",
32 "27": "设备锁",
33 "28": "Uplay无法登陆",
34 "29": "账号触发人脸验证",
35 "30": "⻨克⻛不能用",
36 "31": "游戏网络卡顿",
37 "32": "游戏画质不清晰",
38 "33": "登录后无账号信息",
39 "34": "其他理由",
40 "35": "账号禁赛",
41 "36": "柯恩币不足",
42 "37": "完美登录失败",
43 "38": "5E登录失败",
44 "39": "信用分不足",
45 "40": "段位不符",
46 "41": "哈夫币描述不符"
47 }
48 }
49 }
4.14 订单投诉类型分类

4.12.1
接口描述

第三方通过此接口返回带分类的投诉类型。

可以通过上传订单ID的方式来直接获取对应游戏的投诉类型信息使用。

4.12.2
请求方法

/api/platformXYZ/ts/getMultiType

业务参数

字段
必填
说明

order_id
是
订单id

响应结果

## Page 70

字段
必填
说明

status
是
状态

msg
是
消息提示

data
是
[

{

"list":
[

{

"id":
"4",

"name":
"租错号了"

},

{

"id":
"6",

"name":
"不想玩了或其它理由不玩了"

}

],

"name":
"其他"

}

]

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": [
5 {
6 "list": [
7 {
8 "child": [
9 {
10 "id": "2",
11 "name": "新手账号"
12 },
13 {
14 "id": "3",
15 "name": "段位不符"

## Page 71

16 },
17 {
18 "id": "4",
19 "name": "贵族/VIP等级不符"
20 },
21 {
22 "id": "5",
23 "name": "英雄/皮肤不符"
24 }
25 ],
26 "id": "1",
27 "name": "账号描述与实际不符"
28 },
29 {
30 "id": "11",
31 "name": "账号禁言"
32 },
33 {
34 "id": "35",
35 "name": "账号禁赛"
36 }
37 ],
38 "name": "描述不符"
39 },
40 {
41 "list": [
42 {
43 "id": "8",
44 "name": "号被封了"
45 },
46 {
47 "id": "9",
48 "name": "账号冻结"
49 },
50 {
51 "child": [
52 {
53 "id": "6",
54 "name": "80分≤信誉积分<90分"
55 },
56 {
57 "id": "7",
58 "name": "信誉积分<80分"
59 }
60 ],
61 "id": "17",
62 "name": "信誉积分不足"

## Page 72

63 },
64 {
65 "id": "5",
66 "name": "被挤号(顶号)了"
67 },
68 {
69 "id": "26",
70 "name": "健康时间"
71 },
72 {
73 "id": "29",
74 "name": "账号触发人脸验证"
75 },
76 {
77 "id": "39",
78 "name": "信用分不足"
79 }
80 ],
81 "name": "账号问题"
82 },
83 {
84 "list": [
85 {
86 "id": "2",
87 "name": "账号密码错误"
88 },
89 {
90 "id": "3",
91 "name": "无法登录(登录不上)"
92 }
93 ],
94 "name": "登录问题"
95 },
96 {
97 "list": [
98 {
99 "id": "6",
100 "name": "不想玩了或其它理由不玩了"
101 },
102 {
103 "id": "34",
104 "name": "其他理由"
105 }
106 ],
107 "name": "个人原因"
108 },
109 {

## Page 73

110 "list": [
111 {
112 "id": "24",
113 "name": "游戏维护"
114 }
115 ],
116 "name": "其他问题"
117 }
118 ]
119 }
4.15 第三方平台上报手游支付id/用戶id

4.15.1 接口描述

此接口用于第三方平台将订单对应的用戶id和支付id进行上报。

4.15.2 请求方法

请求地址:

/api/platformXYZ/report/payid

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1鉴权方法
获得
签名字符串

timestamp
是
公共参数,时间戳

oid
是
订单id

userid
是
第三方用戶id

payids
是
支付id/支付方式(base64编码提
交)

数据json格式:

pay_way
:支付方式(微信:wx,支付
宝:alipay,银联:union_pay)

## Page 74

有需要可再增加

pay_id:支付id

[

{

"pay_way":
"wx/alipay",

"pay_id":
"xxx"

}

]

响应结果

字段
必填
说明

status
是
状态

msg
是
消息提示

data
否
对象类型
提交的支付id和支付方式
原样返回
可忽略

{

"status":
1,

"msg":
"成功",

"data":
{

"pay_id":
[

{

"pay_id":

"wei_xin_pay_2023",

"pay_way":
"wx"

}

]

}

}

响应示例

代码块

1 {

## Page 75

2 "status": 1,
3 "msg": "成功",
4 "data": {
5 "pay_id": [
6 {
7 "pay_id": "dsgswwwxxx",
8 "pay_way": "wx/alipay"
9 }
10 ]
11 }
12 }
4.16 第三方平台发起投诉

🔔 订单投诉撤单分为三类:租客投诉、号主撤单、上号器检测到异常后自动投诉。

其中,当发生号主主动撤单和上号器投诉时,订单状态发生变化完结后,不允许租客再次发
起投诉(此时订单已经结束)。

只有订单正常进行中时,租客可以发起投诉来进行撤单。

目前租客发起投诉后,只有平台取消通知,不支持主动取消接口

4.16.1 接口描述

此接口用于第三方平台发起订单投诉,投诉类型⻅上接口说明。

4.16.2 请求方法

请求地址:

/api/platformXYZ/ts/add

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

## Page 76

timestamp
是
公共参数,时间戳

ts_type
是
投诉类型
参⻅获取投诉类型接口
返
回的data中“key“值

lb_third
是
投诉子类型

oid
是
投诉的订单id

content
是
投诉内容

投诉详情里面会限制两点:

1. 敏感词过滤,我们这边会校验

2. ⻓度
10-100
字

响应结果

字段
类型
必填
说明

status
int
是
状态1成功,0失败

msg
string
是
消息提示

data
string
否
对象类型
返回订单id和投
诉id

"oid":
1023274953545,
订单id
<int64>

"tsid":
"249118252"投诉
id
<string>

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "oid": 257883387781893,
6 "tsid": 249149613
7 }
8 }
4.17 上报第三方(信息同步)接口

## Page 77

4.17.1 接口描述

主要用于租号应用平台的货架信息更新,订单正常结算,订单投诉处理后向第三方同步这些信息。

请求地址:地址由第三方提供

4.17.2 请求方法

请求方式:post

请求header:Content-Type:
application/json

post请求内容体格式为:

1. [{

"t":
"时间",

"e_type":
"事件类型",

"e_desc":
"事件描述",

"e_data":
[""]

},
{
"t":
"时间",

"e_type":
"事件类型",

"e_desc":
"事件描述",

"e_data":
[""]

}]

事件类型/描述说明:

order_js
:订单结算,对应e_data为
:

## Page 78

1. [{

"t":
"2020-09-14
18:53:33",

"e_type":
"order_js",

"e_desc":
"订单结算",

"e_data":
{

"oid":
["订单id1",
"订单id2"]

}

}]

order_ts
:订单被投诉,对应e_data为
:

1. [{

"t":
"2020-09-14
18:53:33",

"e_type":
"order_ts",

"e_desc":
"订单投诉",

"e_data":
{

"oid":
["订单id1",
"订单id2"]

}

}]

order_ts_cancel:订单投诉取消,对应e_data为
:

代码块

1 [
2 {
3 "t": "2020-09-1913:24:29",
4 "e_type": "order_ts_cancel",
5 "e_desc": "订单投诉取消",
6 "e_data": {
7 "oid": [
8 274953806
9 ],
10 "detail": [
11 {

## Page 79

12 "customer_service_message": "客服留言"
13 }
14 ]
15 }
16 }
17 ]
18
19 // customer_service_message:客服处理投诉时候的留言信息,取消投诉也是客服处理投诉的一
种。
order_ts_deal
:
订单投诉处理完成,对应e_data为
:

代码块

1 [
2 {
3 "t": "2020-09-1819:12:22",
4 "e_type": "order_ts_deal",
5 "e_desc": "订单投诉处理",
6 "e_data": {
7 "oid": [
8 274953800
9 ],
10 "detail": [
11 {
12 "order_rent_return": "2.00",
13 "order_bzm_return": 0,
14 "order_processing_results": 0,
15 "customer_service_message": "客服留言",
16 "type_id": "1买家投诉 2卖家投诉 3系统",
17 "lb_id": "投诉类别ID",
18 "lx": "投诉类别"
19 }
20 ]
21 }
22 }
23 ]
24
25 /*
26 order_rent_return:租金返还金额
27 order_bzm_return:订单押金退还金额
28 order_processing_results:第三方要求与定义的订单状态 1:撤单, 0:订单正常结算
29 customer_service_message:客服处理投诉时候的留言信息

## Page 80

30 */
hao_change:货架价格变更同步

代码块

1 [
2 {
3 "e_data": {
4 "field_new_value": [
5 {
6 "bzmoney": "0.0",
7 "dw": "30",
8 "em": "0.0",
9 "gid": "443",
10 "gsid": "7718",
11 "hzq": "200",
12 "id": "14769796",
13 "jsm": "Q70中",
14 "offline": "0",
15 "oms1": "0",
16 "oms2": "24",
17 "p10": "18.4",
18 "p168": "161",
19 "p24": "32.2",
20 "p5": "6.9",
21 "p8": "11.5",
22 "pf": "557",
23 "pid": "7717",
24 "pmoney": "2.3",
25 "pn": "V10十二水8金牌省标548皮蛇年
限定全套8无双4珍传器灵·螭⻰剑怪盗基德离恨烟花合斗无双贵族",
26 "qualifying_allow": "1",
27 "szq": "2",
28 "youxi":
"u003eu003eu003eu003eu003eu003e毁号,涉及毁坏虚拟财产罪及计算机安全罪,请文明游戏素质
游戏,让我们共建美好租号平台u003eu003eu003eu003eu003eu003en本游戏账号: V10无双贵族用
戶,基础段位:最强王者,英雄多,皮肤多。典藏皮肤10个,感受典藏皮肤带来的优质体验快感,FMVP皮肤
7个,尽情享受FMVP皮肤带来的主⻆光环, 私人所属英雄皮肤有:虞姬 神鉴启示录||武则天 倪克斯神
谕||鲁班七号 星空梦想||小乔 天鹅之梦||貂蝉 幻阙歌||夏侯惇 无限飓⻛号||瑶 拾光映像||伽罗
最初的交响||铠 银白咏叹调||孙悟空 全息碎影,等等n注意事项:nA.游戏过程中请不要恶意挂机或者
不文明发言;B.恶意挂机、顶号等行为将被拉黑无法再次下单;C.进入游戏后中途请勿退出登陆,否则无
法再次上号;D.部分账号由于异地登录可能会出现密码错误提示,通常再尝试5-6次后可上号。
n|||||||||u003e喜欢本账号请点 ☆收藏☆ 方便下次租用,谢谢光临惠顾|||||||||",
29 "yx": "android",
30 "zt": "1"

## Page 81

31 }
32 ],
33 "hid": [
34 14769796
35 ]
36 },
37 "e_desc": "账号信息变更",
38 "e_type": "hao_change",
39 "t": "2025-08-01 14:16:33.478"
40 }
41 ]
hfb_order_settle:三⻆洲哈夫币订单结算

代码块

1 [
2 {
3 "e_data": {
4 "oid": 269977068134917, // 订单id
5 "pay_money": 2.5, // 结算后支付金额
6 "ratio": 40000, // 哈夫币兑换比例
7 "rent_money": 11.06, // 哈夫币支付金额
8 "return_money": 8.56 // 结算后返还金额
9 },
10 "e_desc": "三⻆洲订单哈夫币结算",
11 "e_type": "hfb_order_settle",
12 "t": "2025-09-11 18:35:44.308" // 结算时间
13 }
14 ]
响应结果

相应结果以第三方接口返回为准

注意:
租号应用记录第三方接口返回失败的日志,如果重放,需要第三方接口进行防重处理。

参数加密方法:

1. //
app_id和app_secret由租号开发人员单独提供

## Page 82

app_id

=
'123456'

app_secret
=
'123456'$post
=
[

[

"t"
=>
"2021-05-14
18:53:33",

"e_type"
=>
"order_js",

"e_desc"
=>
"订单结算",

"e_data"
=>
[

"oid"
=>
[

"订单id1",

"订单id2"

]

]

]

];

$post_json
=
json_encode($post,
JSON_UNESCAPED_UNICODE);

$sign
=
base64_encode(hash_hmac('sha1',
$post_json,
$app_secret));

PHP版本加密方法的输出:

$sign
=
OTRhNjE5NGQyNDYyZjliOThiNDcwMWIwNDFlNjcyYjEyYWVkMzdjZQ==

请求方式:url地址?app_id=$app_id&sign=$sign

post方式请求

"Content-Type:
application/json"
格式提交数据
$post_json

4.18 账号租送功能使用方法

4.18.1 接口描述

为了鼓励用戶下单,部分号主为账号设置包含租送奖励,如租4送2,租5送3。

租送功能涉及4个接口:

1. 账号搜索列表

2. 账号详情

3. 下单接口

4. 订单续租

## Page 83

对于租送功能,可以在账号列表⻚和账号详情⻚提现租送信息,鼓励用戶下单。

4.18.2 使用方法

首先,如需租送功能,需要与商务经理沟通,确认开通租送功能权限。

◦ 账号列表&账号详情

在已经开通了租送功能权限后,账号列表&账号详情两个接口中,"rent_give"和"rent_give_desc"字
段将包含返回值,其中:

["4,1"
“4,2"],为具体的租送数值

"租4送1,租4送2",为租送信息的描述

注:如上述示例,当同一个租赁时间有多个赠送时间,取更大的数值,如"租4送1,租4送2",可取"租4
送2"。

◦ 下单接口&订单续租

在已经开通租送功能权限后,并且账号包含租送,如果租4送2,调用下单或续租接口后,订单结束时
间将会包含赠送时间。

即,"etimer":
"2020-09-09
19:04:18",订单结束时间
<string>,将会包含赠送时间

4.19 逆战解除安全模式

4.19.1 逆战申请解除安全模式接口

4.19.1.1
接口描述
逆战订单用戶游戏内触发安全模式验证时,请求该接口进行解除。

4.19.1.2
请求方法
请求地址:/api/platformXYZ/game/removeSafeModeRequest

请求参数

## Page 84

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

oid
是
订单id

响应结果

字段
类型
必填
说明

status
int
是
状态:

0申请失败

1申请成功

2申请解除中请稍后再试

msg
string
是
消息提示

data
string
否
对象类型,失败为
null

返回申请解除id

"queue_id":
123,申请解
除id
<number>

响应示例

代码块

1 {
2 "status": 0,
3 "msg": "2.2数据异常",
4 "data": null
5 }
4.19.2 验证逆战解除安全模式接口

4.19.2.1
接口描述

## Page 85

逆战订单用戶游戏内触发安全模式验证时,在请求申请成功接口之后,获得验证码请求该接口进行验
证。

4.19.2.2
请求方法
请求地址(POST请求):/api/platformXYZ/game/removeSafeModeRes

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

oid
是
订单id

code
是
验证码

queue_id
是
申请解除id

响应结果

字段
类型
必填
说明

status
int
是
状态:

0申请失败

1申请成功

2申请解除中请稍后再试

msg
string
是
消息提示

data
string
否
对象类型为
null

响应示例

代码块

1 {
2 "status": 1,

## Page 86

3 "msg": "申请成功",
4 "data": {}
5 }
4.20
特价货架调用

4.20.1 接口描述

返回特价货架数据。需要先申请开通特价请求接口,才能请求

4.20.2 请求方法

请求地址:/api/platformXYZ/hao/discountedList

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

gid
是
游戏id

响应结果

字段
类型
必填
说明

status
int
是
状态

msg
string
是
消息提示

data
string
是
count:账号总数

list:账号列表
数组格式

每项字段如下:

"id":
10917,账号id

<number>

## Page 87

"pn":
"全装7v戒指都有自
己看图吧VIP5有天秤座毛
瑟",账号标题
<string>

"pmoney":
"2.00",每小
时租金
<string>

"bzmoney":
"0.00",账号
押金
<string>

"gid":
11,游戏id

<number>

"pid":
417,游戏大区
id

<number>

"gsid":
420,服务器
id

<number>

"game_zone_name":

"全区",游戏大区
<string>

"game_server_name":

"全服",游戏服务器

<string>

"role_name":
"⻆色名",
⻆色名
<string>

"client_shfs":上号方
式,端游2.0,快捷登
录,-
<string>

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": {
5 "count": 8809,
6 "list": [
7 {
8 "additional": null,
9 "app_categoryid": 1,
10 "bzmoney": "0.00",
11 "c_rank": 80,
12 "categoryid": 1,
13 "client_shfs": "-",
14 "credit_score": 100,
15 "dw": "30",

## Page 88

16 "em": "8.00",
17 "equipment_info": {
18 "51": {
19 "dt_name": "皮肤数量",
20 "gd_name": "0-50"
21 }
22 },
23 "game_img": "//zhwpic.zuhaowan.com/images/images/2024-09-
13/yfzvec66e3e9139f31e.png",
24 "game_name": "王者荣耀",
25 "game_server_name": "QQ账号",
26 "game_zone_name": "QQ安卓",
27 "gid": 443,
28 "gsid": 7718,
29 "hzq": 1000,
30 "id": 4336863,
31 "is_cloud": 0,
32 "is_quick_login": 0,
33 "jsm": "禁赛浪情",
34 "maintenance_status": 1,
35 "mobile_shfs": "-",
36 "offline": 0,
37 "oms1": 0,
38 "oms2": 24,
39 "p10": "30.00",
40 "p168": "300.00",
41 "p24": "50.00",
42 "p5": "10.00",
43 "p8": "25.00",
44 "pc_shq_booster": 0,
45 "pf": 0,
46 "pid": 7717,
47 "pmoney": "4.00",
48 "pn": "V8/195皮★武则天星空★凤求凰至尊宝双狗限白⻁志★禁言中",
49 "qualifying_allow": 2,
50 "role_name": "禁赛浪情",
51 "server_info": "手Q68区-凶残之力",
52 "shfs": 1,
53 "szq": 3,
54 "youxi": "超时间不下线连续开游戏,永久拉黑!!!请大家不要扣信誉分,扣信誉分拉黑
拉黑,永久拉黑!麻烦各位大佬爱护一下,祝各位有更愉快的游戏体验!",
55 "yx": "android",
56 "zt": 0
57 },
58 {
59 "additional": null,
60 "app_categoryid": 1,

## Page 89

61 "bzmoney": "5.00",
62 "c_rank": 0,
63 "categoryid": 1,
64 "client_shfs": "-",
65 "credit_score": 0,
66 "dw": "30",
67 "em": "1.00",
68 "equipment_info": null,
69 "game_img": "//zhwpic.zuhaowan.com/images/images/2024-09-
13/yfzvec66e3e9139f31e.png",
70 "game_name": "王者荣耀",
71 "game_server_name": "QQ账号",
72 "game_zone_name": "QQ安卓",
73 "gid": 443,
74 "gsid": 7718,
75 "hzq": 30,
76 "id": 668487,
77 "is_cloud": 0,
78 "is_quick_login": 0,
79 "jsm": "鹿Boy",
80 "maintenance_status": 1,
81 "mobile_shfs": "-",
82 "offline": 0,
83 "oms1": 0,
84 "oms2": 24,
85 "p10": "15.00",
86 "p168": "130.00",
87 "p24": "20.00",
88 "p5": "10.00",
89 "p8": "10.00",
90 "pc_shq_booster": 0,
91 "pf": 0,
92 "pic_list": [
93 "//pic.zuhaowan.com/images/act_shs_img/2018-01-09/5a5476b413686.jpg"
94 ],
95 "pid": 7717,
96 "pmoney": "1.00",
97 "pn": "王者v7 武则天 皮肤很多 赶快来租",
98 "qualifying_allow": 1,
99 "role_name": "鹿Boy",
100 "shfs": 0,
101 "szq": 1,
102 "youxi": "王者v7 吕布-末日机甲 ⻢克菠萝-激情绿茵 孙尚香-末日机甲 孙悟空-地狱
火 宫本武藏-地狱之眼 韩信-白⻰吟花木兰-水晶猎⻰者 后羿-精灵王 貂蝉-逐梦之音 干将魔邪-第七
人偶 庄周和钟无艳都有皮肤 武则天 神级号,",
103 "yx": "android",
104 "zt": 0

## Page 90

105 }
106 ]
107 }
108 }
4.21 新版续租(订单拆分展示、处理)

🔔 使用新版续租接口前,请确保接口(4.15接口)内上传了用戶的userid和payids参数,不然无
法使用新版接口。

新版续租接口会进行订单拆分,续租订单的订单号和解锁码都会生成新的(上号侧续租订单不
需要重新上号,可以无缝过渡,租客无感),在前端展示⻚面也会显示两个订单,可进行续租
单单独取消。

API新续租完整说明

4.21.1 续租订单下单

4.21.1.1 接口描述

进行新版续租时,再次调用下单接口进行处理,但新增续租参数需要传递。

4.21.1.2 请求方法

请求地址:

/api/platformXYZ/order/placeOrder

请求参数

字段
类型
必填
说明

app_id
string
是
公共参数,应用ID
(由开
发人员单独提供)

sign
string
是
公共参数,通过2.1签名
方法
获得签名字符串

timestamp
int64
是
公共参数,时间戳

hao_id
int
是
账号id

rent_hours
int
是
租赁时⻓

## Page 91

pay_id
string
是
用戶支付id

rent_type
int
否
1,8,10,24,168#请输入租
赁类型

pay_amount
float
否
租赁金额

is_tejia
int32
否
是否特价1是0否

main_did
int64
否
新续租使用(主订单id)

hf_money
float
否
三⻆洲哈夫币预付款金额

响应结果

字段
类型
必填
说明

status
int
是
状态0失败,1成功

msg
string
是
消息提示

data
string
是
数组格式:返回订单id,
解锁码,开始/结束时
间,上号方式等

"oid":
1023274953545,
订单id
<int64>

"unlockcode":

"159723dd37f878dc322
200",订单解锁码

<string>

"stimer":
"2020-09-09

17:59:18",订单开始时间

<string>

"etimer":
"2020-09-09

19:04:18",订单结束时间

<string>

"rent_type":
1,⻅参数

<number>

"shfs":
1上号方式

⻅/hao/list接口返回说明

<number>

zh:
游戏账号(明文时返回)

## Page 92

mm:
游戏密码(明文时返
回)

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "下单成功",
4 "data": {
5 "etimer": "2025-08-25 21:19:21",
6 "mm": "******",
7 "oid": 257878107972357,
8 "order_amount": 13.5,
9 "rent_type": 1,
10 "shfs": 1,
11 "stimer": "2025-08-25 16:14:21",
12 "unlockcode": "sh936ecc71234f50783374019",
13 "zh": "********"
14 }
15 }
返回响应码说明

响应码
说明

20101
租方账号关闭

20201
货架状态不可租

20103
租方账号被出租方拉黑,不能租赁出租方所属货架

20102
租方租号记录不良,被限制租号

20104
租方连续撤单过多,被系统限制租号

20403
租赁些游戏货架受限

20401
该货架已停止出租

20402
游戏官网维护中

20406
逃跑挂机次数过多,不能租赁此货架

20105
撤单率不符合号主做出的限制

## Page 93

20404
该游戏账号可能未结束

10007
租赁时⻓小于号主设置的最小时⻓

10008
租赁时⻓大于号主设置的最大时⻓

10013
货架已被租用,请选择其它货架

10019
货架不在可租时间段内

10012
在所选时间内账号已被租用

20118
游戏官方维护提醒

10021
租方账号余额不足

30044
租号设备违规租号被封

4.21.2 预约订单取消

4.21.2.1 接口描述

用于新版续租拆分订单的取消

4.21.2.2 请求方法

请求地址:/api/platformXYZ/order/renterCancel

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

order_id
是
订单id

响应结果

字段
类型
说明

## Page 94

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

响应示例

代码块

1 // 成功
2 {
3 "status": 1,
4 "msg": "success",
5 "data": null
6 }
7
8
9 // 失败
10 {
11 "status": 1015,
12 "msg": "此订单不支持取消预约",
13 "data": null
14 }
5. 三方特殊调用接口

🔔 目前仅限部分网吧渠道核对订单时使用

5.1 订单信息查询接口

5.1.1
接口描述

租号玩提供查询接口,回传给合作方注册/活跃/订单/结算等信息,便于合作方区分不同下级推广
员的数据;

5.1.2 使用方法

请求地址:(POST):/api/{platform_name}/order/orderList

请求参数

## Page 95

字段
必填
示例
说明

app_id
是

公共参数,应用ID
(由开发人
员单独提供)

sign
是

公共参数,通过2.1签名方法

获得签名字符串

timestamp
是

公共参数,时间戳

fdate
是
20240531
年月日

响应结果

字段
类型
说明

status
int
状态:

0申请失败

1申请成功

2申请解除中请稍后再试

msg
string
消息提示

data
object[]

-
base_money
string
基准价

-
start_time
string
订单开始时间

-
end_time
string
订单结束时间

-
order_id
int
订单号

-
order_status
int
订单状态
2完结,其他撤单

-
promotion_money
string
加价金额

-
promotion_ratio
int
加价比例

-
title
string
订单标题

-
game_name
string
游戏名称

province_money
int
省代理加价收入

## Page 96

province_ratio
int
省代理加价比例

third_id
int
三方网吧id

wangba_id
int
下单网吧

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "",
4 "data": [
5 {
6 "base_money": "1.00",
7 "end_time": "2024-08-20 14:02:12",
8 "game_name": "和平精英",
9 "order_id": 1062861740,
10 "order_status": 2,
11 "promotion_money": "1.30",
12 "promotion_name": "a17774004972",
13 "promotion_ratio": 130,
14 "province_money": "0.20",
15 "province_ratio": 20,
16 "start_time": "2024-08-20 12:57:11",
17 "title": "go-和平精英卡US留上号发布测试",
18 "wangba_id": 46329,
19 "wangba_name": "10005694"
20 }
21 ]
22 }
5.2 端游上号登录日志

5.2.1 接口描述

用于查询当前用戶是否真正进行上号,可用于用戶投诉前核对使用。

5.2.2 请求方法

请求地址:/api/platformXYZ/order/orderGameLoginLog

请求参数

## Page 97

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

order_id
是
订单id

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
event
int
日志类型:1-上号,2-进入游戏大厅

--
gid
int
游戏id

--
order_id
float
订单id

--
remark
int
失败的返回原因

--
start_time
int
点击开始游戏的时间

--
status
int
1成功
2失败

--
unlock_code
int
解锁码

响应示例

代码块

1 // 示例
2 {
3 "status": 1,
4 "msg": "",
5 "data": {
6 "event": 1,

## Page 98

7 "gid": 1669,
8 "order_id": 1279177867,
9 "remark": "错误码(38)",
10 "start_time": "2025-09-05 15:03:16",
11 "status": 2,
12 "unlock_code": "9abdb9ec23f809e714428699"
13 }
14 }
15
5.3 渠道客戶端更新检查

5.3.1 接口描述

用于检测网吧渠道客戶端最新版本

注:此接口使用独立的签名方式

5.3.2 请求方法

Method:
GET

请求地址:/mini/soft/checketChannelClientVersion

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数

签名方式:md5(app_secreet
+

timestamp)

timestamp
是
公共参数,时间戳(5分钟内有
效)

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

## Page 99

msg
string
消息提示

data
string
响应数据

--
version
int
当前应用最新版本号

--
download_url
int
下载地址

响应示例

代码块

1 // 示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "version": "5.19.251119.1",
7 "download_url": "https://download-
pkg.didikaihei.cn/electron/checkupdate/zuhaowanT2/tuiguang/zuhaowan_5.19.251119
.1.7z"
8 }
9 }
10
5.4 渠道推广链接列表

5.4.1 接口描述

获取渠道下已添加的所有推广链接集合

5.4.2 请求方法

Method:
GET

请求地址:/open/popularize/getPopuCodeList

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

## Page 100

sign
是
公共参数

签名方式:md5(app_secreet
+

timestamp)

timestamp
是
公共参数,时间戳(5分钟内有
效)

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
count
int
总数

--
pagesize
int
每⻚数量

--
list
object
数据列表

--
create_time
string
创建时间

--
name
string
名称

--
popu_url
string
推广链接

--
popularize_code
string
推广码

--
pull_user_num
string
累计注册人数

--
remark
string
备注

--
update_time
string
更新时间

--
pack_logo
string
推广微端logo

--
pack_download_url
string
微端下载地址

--
pack_status
string
微端打包状态

0=待打包

1=打包完成

响应示例

## Page 101

代1 块// 示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": {
6 "count": 1,
7 "list": [
8 {
9 "create_time": "2026-03-10 09:30:51",
10 "name": "二级推广⻚1",
11 "popu_url": "https://www1.zuhaowan.com:126/popu/p2oxgk73",
12 "popularize_code": "p2oxgk73",
13 "pull_user_num": "2",
14 "remark": "二级推广⻚1",
15 "update_time": "2026-03-18 18:16:19"
16 }
17 ],
18 "pagesize": 50
19 }
20 }
5.5 渠道推广链接统计数据

5.5.1 接口描述

获取每个推广链接统计数据,一次查一天

5.5.2 请求方法

Method:
GET

请求地址:/open/popularize/getPopuCodeStat

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单独提
供)

sign
是
公共参数

签名方式:md5(app_secreet
+

timestamp)

## Page 102

timestamp
是
公共参数,时间戳(5分钟内有效)

fdate
是
统计日期(Ymd格式),例:
20260401

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
count
int
总数

--
pagesize
int
每⻚数量

--
list
object
数据列表

--
divide_money
string
分成收益

--
popularize_code
string
推广码

--
pull_user_num
string
注册人数

响应示例

代码块

1 {
2 "status": 1,
3 "msg": "ok",
4 "data": {
5 "count": 1,
6 "list": [
7 {
8 "divide_money": "75.84",
9 "popularize_code": "p2oxgk73",
10 "pull_user_num": "0"
11 }
12 ],
13 "pagesize": 50
14 }

## Page 103

15 }
5.6 渠道推广链接
-
添加

5.6.1 接口描述

添加生成新的推广链接

5.6.2 请求方法

Method:
GET

请求地址:/open/popularize/addPopuCode

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单独
提供)

sign
是
公共参数

签名方式:md5(app_secreet
+

timestamp)

timestamp
是
公共参数,时间戳(5分钟内有效)

name
是
推广⻚标题

remark
是
推广⻚备注

pack_logo
是
推广微端logo

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

## Page 104

响应示例

代码块

1 // 示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": []
6 }
5.7 渠道推广链接
-
修改

5.7.1 接口描述

修改已有的推广链接

5.7.2 请求方法

Method:
GET

请求地址:/open/popularize/editPopuCode

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单独
提供)

sign
是
公共参数

签名方式:md5(app_secreet
+

timestamp)

timestamp
是
公共参数,时间戳(5分钟内有效)

popularize_code
是
推广码

name
是
推广⻚标题

remark
是
推广⻚备注

pack_logo
是
推广微端logo

## Page 105

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

响应示例

代码块

1 // 示例
2 {
3 "status": 1,
4 "msg": "ok",
5 "data": []
6 }
附1
游戏对应投诉类型
游戏对应投诉类型:

1.
订单开始前30分钟,展示游戏对应投诉类型,详细⻅下表;

游戏名称
投诉类型

王者荣耀
账号描述与实际不符,账号密码错误,无法登录(登
录不上),租错号了,被挤号(顶号)了,不想玩了
或其他理由不玩了,号被封了,账号冻结,信誉积分
不足,游戏账号未实名认证/未成年,游戏维护

## Page 106

英雄联盟
账号描述与实际不符,账号密码错误,无法登录(登
录不上),租错号了,被挤号(顶号)了,不想玩了
或其他理由不玩了,号被封了,账号冻结,会员时间
到期,无法下载上号器,提示有外挂残留,安装不了
上号器,一直云检测,信誉积分不足,游戏账号未实
名认证/未成年,游戏维护
穿越火线
账号描述与实际不符,账号密码错误,无法登录(登
录不上),租错号了,被挤号(顶号)了,不想玩了
或其他理由不玩了,号被封了,账号冻结,会员时间
到期,无法下载上号器,提示有外挂残留,安装不了
上号器,一直云检测,不输入账号密码,游戏维护

绝地求生
账号描述与实际不符,账号密码错误,无法登录(登
录不上),租错号了,被挤号(顶号)了,不想玩了
或其他理由不玩了,号被封了,账号冻结,会员时间
到期,无法下载上号器,提示有外挂残留,安装不了
上号器,一直云检测,游戏维护

附2仲裁规则

详细仲裁规则参考如下

王者荣耀、和平精英仲裁规则:

https://www.zuhaowan.com/help/hzxt/info?id=12&detid=189

注:上述规则暂只适用于王者荣耀、和平精英的租客投诉。

另外,针对新用戶、信誉积分低的用戶,可能有不同的仲裁规则,具体可参考:
https://www.zuhaowan.com/help/hzxt/info?id=12&detid=190

6. 装备获取业务接口

⚠ 针对游戏装备获取业务,
相关接口请配合sdk使用,后端进行接口转发。

转发时保留
“/v1/*”
路由地址供前端sdk使用,接收参数使用“application/json”方式,
其它不需要做任何调整,原数据格式返回至前端即可

SDK:
装备获取js文档

6.1 发起开通快速上号队列

## Page 107

6.1.1 接口描述

开通快速上号

6.1.2 请求方法

请求地址:/eq/platformXYZ/v1/setOpenServerQueue

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

zh
是
游戏账号

mm
是
游戏密码

gid
是
租号玩平台游戏id

英雄联盟:
17

穿越火线:
11

逆战:
24

无畏契约:
1574

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
queue_id
int
开通任务id(后续业务流程使用)

响应示例

## Page 108

1 // 成功
2 {
3 "status": 1,
4 "msg": "操作成功",
5 "data": {
6 "queue_id": 9026
7 }
8 }
9
10 // 失败
11 {
12 "status": 0,
13 "msg": "暂不支持开通",
14 "data": {
15 "queue_id": 0
16 }
17 }
6.2 获取开通结果

6.2.1 接口描述

轮询开通快速上号任务的结果

6.2.2 请求方法

请求地址:/eq/platformXYZ/v1/getOpenServerProcess

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

queue_id
是
发起开通时返回的任务id

## Page 109

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
memo
string
sdk使用

--
verify_type
string
sdk使用

--
verify_info
int
sdk使用

--
vpn_info
string
sdk使用

响应示例

代码块

1 // 成功
2 {
3 "status": 3,
4 "msg": "开通中, 请耐心等待",
5 "data": {
6 "memo": "",
7 "verify_info": "",
8 "verify_type": 0,
9 "vpn_info": null
10 }
11 }
6.3 提交快速上号验证信息

6.3.1 接口描述

轮询开通快速上号任务的结果

6.3.2 请求方法

请求地址:/eq/platformXYZ/v1/setVerify

请求参数

## Page 110

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

queue_id
是
发起开通时返回的任务id

verify_type
是
获取开通结果接口返回

verify_result
是
滑块地址

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
memo
string
sdk使用

--
verify_type
string
sdk使用

响应示例

代码块

1 // 成功
2 {
3 "status": 1,
4 "msg": "验证中, 请继续等待",
5 "data": {
6 "memo": "",
7 "verify_type": 0
8 }
9 }

## Page 111

6.4 装备获取-获取配置
6.4.1 接口描述

初始装备获取配置信息

6.4.2 请求方法

请求地址:/eq/platformXYZ/v1/getThirdConfig

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

zh
是
游戏账号

gid
是
租号玩平台游戏id

英雄联盟:
17

穿越火线:
11

逆战:
24

无畏契约:
1574

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
author_time_out
int
1是账号已经授权,0是未授权

## Page 112

--
tool_download_href
string
小工具下载地址

--
work_version
string
小工具可用版本号

响应示例

代码块

1 // 成功
2 {
3 "status": 1,
4 "msg": "获取成功",
5 "data": {
6 "author_time_out": 0,
7 "tool_download_href": "https://down.x.cn/xx.exe",
8 "work_version": "0010"
9 }
10 }
6.5 发起装备获取请求

6.5.1 接口描述

发起装备获

6.5.2 请求方法

请求地址:/eq/platformXYZ/v1/openThirdGetGameEq

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

zh
是
游戏账号

mm
是
游戏密码

## Page 113

gid
是
租号玩平台游戏id

英雄联盟:
17

穿越火线:
11

逆战:
24

无畏契约:
1574

server_name
是
官方游戏服务器名称

zone_name
是
官方游戏大区名称

did
否
订单id(包含订单时传入)

port
是
端口
:"发布修改",
"订单结算"

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
log_id
int
任务日志id,查询结果时使用

--
request_no
string
请求流水request_no

响应示例

代码块

1 // 成功
2 {
3 "status": 1,
4 "msg": "",
5 "data": {
6 "log_id": 691714375,
7 "request_no": "UThird17615557623886143"
8 }
9 }

## Page 114

6.6 轮询装备获取结果

6.6.1 接口描述

装备获取结果

6.6.2 请求方法

请求地址:/eq/platformXYZ/v1/getThirdGetGameEqResult

请求参数

字段
必填
说明

app_id
是
公共参数,应用ID
(由开发人员单
独提供)

sign
是
公共参数,通过2.1签名方法
获得
签名字符串

timestamp
是
公共参数,时间戳

log_id
是
发起装备获取时返回的任务日志id

响应结果

字段
类型
说明

status
int
状态1正常,其它为异常

msg
string
消息提示

data
string
响应数据

--
roles
string
装备数据

--
weapons
string
装备数据

--
props
string
装备数据

--
baseInfo
string
装备数据

响应示例

代码块

## Page 115

1 // 成功
2 {
3 "status": 1,
4 "msg": "获取成功",
5 "data": {
6 "baseInfo": {
7 "roleInfo": {
8 "accountId": "710488061",
9 "accountType": 1,
10 "app_tier": 0,
11 "areaId": 1,
12 "areaName": "艾欧尼亚 电信",
13 "battle_count": {
14 "total": 0,
15 "total_ai": 0,
16 "total_arm": 0,
17 "total_match": 0,
18 "total_rank": 0,
19 "total_rotate": 0,
20 "total_strawberry": 0,
21 "total_trank": 0,
22 "win_ai": 0,
23 "win_arm": 0,
24 "win_arm_rate": "�",
25 "win_match": 0,
26 "win_match_rate": "�",
27 "win_rank": 0,
28 "win_rank_rate": "�",
29 "win_rotate": 0,
30 "win_rotate_rate": "�",
31 "win_strawberry": 0,
32 "win_trank": 0,
33 "win_trank_rate": "�"
34 },
35 "content": "",
36 "dsRate": "100%",
37 "dsTotal": "0",
38 "gameId": "lol",
39 "game_area": "1",
40 "game_open_id": "710488061",
41 "game_partition": "",
42 "game_plat": "",
43 "game_role_id": "2091171024437728",
44 "heroNum": 1,
45 "iconUrl":
"https://down.qq.com/lolapp/lol/summoner/profileicon/2.jpg",
46 "level": 14,

## Page 116

47 "lhpw": "",
48 "lhpwRate": "100%",
49 "lhpwTotal": "0",
50 "nickId": "",
51 "rank": 255,
52 "roleId": "凤雏之型#49006",
53 "roleIdentity": "178834b57b8842faf484897b23fbdb1d",
54 "roleName": "凤雏之型#49006",
55 "roleText": "",
56 "roleType": 1,
57 "scene":
"v3__9NZubl9wguVsg4UHyB3kfILg_SbhtJSLOSJEwPnUm9_Kf3Uy3XF_43QyK7PXIRFZMHmTnTPn4U
VlFaHj3f5WZ4EM-L1-pRpWkerDlerSHqCyPMaHu6y1yyzLrt230xEMvXzzsC5B9MuLKOrZ01mOw==",
58 "skinColorNum": 0,
59 "skinNum": 0,
60 "tier": 255,
61 "uuid": "1508f101-7ada-4758-8bc2-8ff8b194f624",
62 "visible": 1
63 },
64 "spareOne": {
65 "tid":
"DC2C0FDF6BEACEA67C33FF663635BCEC667576F241B68D5DBE1C7A7C803E496A0CAE39922AB164
8D73B0E87CED484A4259F5A4E24FBCA30B1F7D4511A8302C76ADF419DC519E3D556E301C7D83A41
F82EDE3D5BE28E9086A819D833D26DA6CD77F0B35937170E76E6E6D154C49B02605E7FF2EB8AEB4
920CA34EB680C5EDE1B66B2C1779DFA2E2CFF60F640FFF4259C140DC36F3B359A4E1F4611DCD41E
554EE4DA3E113DBFB13412295BA8EF3DBBAE9",
66 "userid": "1508f101-7ada-4758-8bc2-8ff8b194f624"
67 },
68 "tftInfo": {
69 "accountId": "710488061",
70 "accountType": 1,
71 "app_tier": 0,
72 "areaId": 1,
73 "areaName": "艾欧尼亚 电信",
74 "arena": [
75 {
76 "name": "默认棋盘"
77 }
78 ],
79 "asset": {
80 "err_msg": "",
81 "is_hide_property": 0,
82 "property_list": [
83 {
84 "first": {
85 "cash": 3000,
86 "coin": 0,

## Page 117

87 "title": "余额"
88 },
89 "type": "coin"
90 },
91 {
92 "first": {
93 "empty_content": "暂无小小英雄",
94 "intent": "qtpage://tft/asset/hero?
type=tiny\u0026scene=v3_gOpcEP0D052ueqxqlqo-2Ya-
IZRR8h7FonUY7S4mLfRsKTLAICQaX7UxDlm7lLKEi3wZnCEE_ZGmHpEC-
LVgiq0_bstccakAOxhSt8T14_mlVr-CpSAlrFbilYWwbOBh4e2X7D7a5otLKPkr6kZOtg%3D%3D",
95 "limit_count": 5,
96 "list": [
97 {
98 "img_url":
"https://game.gtimg.cn/images/lol/act/img/tft/hero/lolapp_0001.png"
99 }
100 ],
101 "own_count": 1,
102 "title": "拥有的小小英雄",
103 "total_count": 1915
104 },
105 "type": "single"
106 },
107 {
108 "first": {
109 "empty_content": "暂无棋盘皮肤",
110 "intent": "qtpage://tft/asset/arenas?
type=map\u0026scene=v3_gOpcEP0D052ueqxqlqo-2Ya-
IZRR8h7FonUY7S4mLfRsKTLAICQaX7UxDlm7lLKEi3wZnCEE_ZGmHpEC-
LVgiq0_bstccakAOxhSt8T14_mlVr-CpSAlrFbilYWwbOBh4e2X7D7a5otLKPkr6kZOtg%3D%3D",
111 "limit_count": 5,
112 "list": [
113 {
114 "img_url":
"https://game.gtimg.cn/images/lol/TFTMapSkins/Square_Battlefield_Lg_Base.png"
115 }
116 ],
117 "own_count": 1,
118 "title": "拥有的棋盘皮肤",
119 "total_count": 123
120 },
121 "type": "single"
122 },
123 {
124 "first": {
125 "empty_content": "暂无进攻特效",

## Page 118

126 "intent": "qtpage://tft/asset/effect?
type=attach\u0026scene=v3_gOpcEP0D052ueqxqlqo-2Ya-
IZRR8h7FonUY7S4mLfRsKTLAICQaX7UxDlm7lLKEi3wZnCEE_ZGmHpEC-
LVgiq0_bstccakAOxhSt8T14_mlVr-CpSAlrFbilYWwbOBh4e2X7D7a5otLKPkr6kZOtg%3D%3D",
127 "limit_count": 5,
128 "list": [
129 {
130 "img_url":
"https://game.gtimg.cn/images/lol/TFTDamageSkins/Boom_Default_Large.png"
131 }
132 ],
133 "own_count": 1,
134 "title": "拥有的进攻特效",
135 "total_count": 307
136 },
137 "type": "single"
138 }
139 ],
140 "result": 0
141 },
142 "content": "",
143 "effect": [
144 {
145 "name": "默认 进攻特效"
146 }
147 ],
148 "expression": [],
149 "gameId": "tft",
150 "game_area": "1",
151 "game_open_id": "710488061",
152 "game_partition": "",
153 "game_plat": "",
154 "game_role_id": "2091171024437728",
155 "iconUrl":
"https://down.qq.com/lolapp/lol/summoner/profileicon/2.jpg",
156 "level": 14,
157 "nickId": "",
158 "rank": 255,
159 "roleId": "凤雏之型#49006",
160 "roleIdentity": "557df4c4c86b62484f049c62f18bc7ec",
161 "roleName": "凤雏之型#49006",
162 "roleText": "",
163 "roleType": 1,
164 "scene": "v3_gOpcEP0D052ueqxqlqo-2Ya-
IZRR8h7FonUY7S4mLfRsKTLAICQaX7UxDlm7lLKEi3wZnCEE_ZGmHpEC-
LVgiq0_bstccakAOxhSt8T14_mlVr-CpSAlrFbilYWwbOBh4e2X7D7a5otLKPkr6kZOtg==",
165 "tier": 255,

## Page 119

166 "tiny": [
167 {
168 "name": "小河灵"
169 }
170 ],
171 "uuid": "1508f101-7ada-4758-8bc2-8ff8b194f624",
172 "visible": 1
173 }
174 },
175 "props": [],
176 "roles": [
177 {
178 "name": "无极剑圣"
179 }
180 ],
181 "weapons": []
182 }
183 }
