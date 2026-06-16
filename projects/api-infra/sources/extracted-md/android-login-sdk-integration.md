# 安卓上号 SDK 接入文档

- Source PDF: `../raw-pdfs/安卓上号 SDK 接入文档.pdf`
- Original file: `安卓上号 SDK 接入文档.pdf`
- Pages: 7

## Page 1

手游上号
SDK
接入文档

1.提供给的第三方

xxxx

2.第三方接入的形式。

以aar的形式提供,对方进行放在libs中集成。

1
使用说明

1.1
将
aar文件
XXXX.aar
添加到
项目
libs

1.2
配置

1.2.1
添加依赖和配置
在你的build.gradle
添加
implementation
fileTree(include:

['*.jar',
'*.aar'],
dir:
'libs')

1.2.2
app目录下
build.gradle
增加依赖

代码块

1
2 implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4'
3 implementation 'androidx.core:core-ktx:1.5.0'
4 implementation 'androidx.core:core:1.8.0'
5 implementation 'androidx.appcompat:appcompat:1.4.0'
6 implementation 'com.google.android.material:material:1.5.0'
7 implementation 'androidx.activity:activity-ktx:1.4.0'
8 implementation 'androidx.fragment:fragment-ktx:1.4.0'
9 implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.4.0'
10 implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.4.0'
11 implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.4.0'
12 // retrofit=>okhttp3:okhttp:3.14.9
13 implementation("com.squareup.retrofit2:retrofit:2.9.0")
14 //=>gson:2.8.5
15 implementation("com.squareup.retrofit2:converter-gson:2.9.0")
16 implementation("com.squareup.retrofit2:converter-scalars:2.9.0")
17 implementation 'com.squareup.okhttp3:okhttp:4.9.1'
18 implementation 'com.google.code.gson:gson:2.9.0'
19 implementation 'com.github.cocomikes:power-gson:8.0'
20 implementation 'com.airbnb.android:lottie:5.0.3'

## Page 2

21 implementation 'com.github.JavaNoober.BackgroundLibrary:libraryx:1.7.5'
22 implementation 'androidx.datastore:datastore-preferences:1.0.0'
23 implementation ('io.socket:socket.io-client:1.0.0') {
24 exclude group: 'org.json', module: 'json'
25 }
26 implementation 'com.github.getActivity:ToastUtils:10.5'
27 implementation 'com.getkeepsafe.relinker:relinker:1.4.4'
28 implementation 'androidx.work:work-multiprocess:2.7.1'
29 implementation 'com.jakewharton.timber:timber:5.0.1'
30 implementation 'androidx.preference:preference:1.2.0'
31 implementation group: 'dnsjava', name: 'dnsjava', version: '3.5.1'
32 implementation 'com.orhanobut:logger:2.2.0'
33
34 implementation 'com.alibaba:fastjson:1.2.0'
35 implementation 'com.android.volley:volley:1.1.0'
36 implementation'pl.droidsonroids.gif:android-gif-drawable:1.2.24'
37 implementation'com.qiniu:qiniu-android-sdk:8.5.2'
38 implementation 'com.jonathanfinerty.once:once:1.0.3'
39 implementation 'org.lsposed.hiddenapibypass:hiddenapibypass:2.0'
40
41 //新增的
42 api("com.tencent:mmkv-static:1.3.9")
43 api("com.getkeepsafe.relinker:relinker:1.4.4")
44
45 //bl锁
46 api("com.google.guava:guava:29.0-jre")
47 api("co.nstant.in:cbor:0.9")
48 api("org.bouncycastle:bcpkix-jdk15on:1.67")
49 api("com.scottyab:rootbeer-lib:0.1.1")
50 //火山云
51 api("org.slf4j:slf4j-api:1.7.36")
52
53 //微信iPad登录新增依赖关系:
54 api("com.github.getActivity:EasyWindow:10.6")
55 implementation("com.squareup.retrofit2:adapter-rxjava2:2.9.0")
56 implementation("io.reactivex.rxjava2:rxjava:2.2.21")
57 implementation("io.reactivex.rxjava2:rxandroid:2.1.1")
58
59
60 api("com.fasterxml.jackson.core:jackson-databind:2.15.0")
61 api("com.fasterxml.jackson.core:jackson-annotations:2.15.0")
62 api("commons-codec:commons-codec:1.15")
63 api("com.squareup.okhttp3:mockwebserver:4.9.0")
64
65 //火山云存储
66 api("com.volcengine:ve-tos-android-sdk:2.6.0")
67

## Page 3

68 建议的Maven仓库:
69 google()
70 mavenCentral()
71
72 maven { url 'https://maven.aliyun.com/repository/public' }
73 maven { url 'https://maven.aliyun.com/repository/google' }
74 maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
75 maven { url 'https://jitpack.io' }
76 mavenLocal()
代码块

1 gradle.properties配置:
2 android.useAndroidX=true
3 # Kotlin code style for this project: "official" or "obsolete":
4 kotlin.code.style=official
5 # Enables namespacing of each library's R class so that its R class includes
only the
6 # resources declared in the library itself and none from the library's
dependencies,
7 # thereby reducing the size of the R class for that library
8 android.nonTransitiveRClass=true
9
10 android.enableJetifier=true
2
集成

2.1

代码块

1 在Application中初始化
2 override fun attachBaseContext(base: Context) {
3 super.attachBaseContext(base)
4 DofunGameClient.INSTANCE.attachBaseContext(base)
5 }
6
7 override fun onCreate() {
8 super.onCreate()
9 DofunGameClient.INSTANCE.onCreate(this, true)
10 DofunGameClient.INSTANCE.callAfterAgreePrivacy(this)
11 }
12
13 override fun onConfigurationChanged(newConfig: Configuration) {

## Page 4

14 super.onConfigurationChanged(newConfig)
15 DofunGameClient.INSTANCE.onConfigurationChanged(newConfig)
16 }
2.2

2.3
通过解锁码授权

代码块

1 先申请悬浮窗权限,权限申请通过之后
2 调用
3 private fun initListener() {
4 binding.btnPlatformAccount.setOnClickListener {
5 var iiUnlockCode = binding.etUnlockCode.text.toString()
6 DofunGameClient.startGame(this@TestMainActivity,
"a7a5211bca2145b8e6c0f41ffc0b1e2f3a6bb1da", iiUnlockCode) { activityResult ->
7 if(activityResult.resultCode == GameResult.RESULT_OK){
8
9 } else if(activityResult.resultCode == GameResult.RESULT_CANCELED){
10
(activityResult.data?.getStringExtra(GameResult.KEY_ERROR_MSG)).showToast()
11 }
12 }
13 }
14 }
3
混淆

代码块

1 手游库自带混淆规则,不需要您额外配置混淆规则.
4
错误代码

## Page 5

const
val
ISSUE_1001
=
"快速上号服务[1]遇到问题,参数缺失无法上号"

//解锁码必要参数缺
失

const
val
ISSUE_1002
=
"快速上号服务[2]遇到问题,请稍后重试或联系客服"

//未导入相应上
号策略实现库

const
val
ISSUE_1003
=
"快速上号服务[3]遇到问题,请稍后重试或联系客服"

//quickInfo/dataVO
数据解析异常

const
val
ISSUE_1004
=
"快速上号服务[4]遇到问题,请稍后重试或联系客服"

//相应上号策略
初始化失败

const
val
ISSUE_1005
=
"快速上号服务[5]遇到问题,请稍后重试或联系客服"

//1.3上号获取
Token失败

const
val
ISSUE_1006
=
"云快速上号服务[6]遇到问题,请稍后重试或联系客服"

//1.3获取云游
戏备用Token失败

const
val
ISSUE_1007
=
"没有可用的快速上号方式,请返回APP及时撤单,租用其他账号游玩"

//无
快速上号配置时的1.3备用Token上号,已废弃不再使用

const
val
ISSUE_1008
=
"快速上号服务[8]遇到问题,暂时无法打开加速器"

//非云游戏上号前置开
启VPN失败,中断上号

const
val
ISSUE_5000
=
"快速上号服务[异常]遇到问题,请稍后重试或联系客服"

3.上号方式

1.3上号、1.4上号

注意事项:

三方SDK集成客戶的订单和租号玩官方订单不是一个体系,解锁码不能共用。集成时需要通过api下单
获得订单信息,拿到解锁码。

隐私协议说明

需要在APP隐私协议内加上以下两个SDK的相关说明,不然过审会存在问题。

SDK名 运营方
使用场景及目 收集信息与所需权限
共享方 隐私政
称
的
式
策链接

## Page 6

腾讯灯 深圳市 用戶浏览数据 收集信息
SDK本 https://
塔
腾讯计 上报,敏捷分 机采集
cloud.t
[设备信息]

算机系 析,自动化运 encent.
统有限 营
com/d
设备标识符(Android
ID、GID、
MAC、VAID、
公司
ocume
AAID、IMSI、UAID、SN、BSSID、设备连接WIFI的
nt/pro
SSID、ICCID、SIM信息)

duct/1
558/69
[Android独有信息]
012

设备ID(OAID、GAID)(IMEI
,MEID用戶授权才
收集)

设备型号

[网络信息]

运营商信息、运营商网络状态

[应用信息]

SDK宿主应用包名及版本号、本应用运行中的进程

获取信息(并未收集)

传感器列表(重力加速度传感器、陀螺仪传感器、
光线传感器、加速度传感器)

获取权限
无

敏感权限

写入/读取存储
权限调用
不涉及

数 北京数 数美移动安全 收集信息
SDK本 https://
美
SDK
美时代 仅会出于安全 机采集
www.is
[设备信息]

科技有 保障的需要以 humei.
设备品牌、设备制造商、设备型号、设备名称、设
限公司
及目的,并通 com/le
备系统类型及版本信息、设备基本设置、设备环境

常会在征得您 gal/cn/
同意的情况下 [Android独有信息] privacy
收集和使用您 .html?
设备ID(OAID、GAID)(IMEI用戶授权才收集)

和您用戶的信 produc
AndroidID

息
tHelp=
[ios独有信息]
/docs/t
w/sdk/
设备ID(IDFA用戶授权才收集)、IDFV

guide/
[网络信息]

## Page 7

网络的接入形式、无线路由器标识(BSSID、 develo
SSID)及IP地址、周边WIFI列表、网络运营商信 pDoc/

息、网络基站信息、网络连接状态、SIM国家代码

[应用信息]

SDK宿主应用包名及版本号、本应用运行中的进程

获取信息(并未收集)

传感器列表(磁场、陀螺仪、加速度传感器)

获取权限无

敏感权限

写入/读取存储
权限调用不涉及
