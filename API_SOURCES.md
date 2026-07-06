# 智能旅游助手 API 接入说明

已下载 `public-apis` 到 `vendor/public-apis`，并按它的免费公共 API 选择原则，为当前旅游助手接入以下无需密钥的接口。

## 已接入接口

| 能力 | 接口 | 用途 |
| --- | --- | --- |
| 城市经纬度 | Open-Meteo Geocoding API | 把“杭州天气”“东京时间”等城市名转成经纬度和时区 |
| 实时天气 | Open-Meteo Forecast API | 查询当前气温、体感、湿度、风速和未来 3 天天气 |
| 当地时间 | TimeAPI.io / WorldTimeAPI | 优先查询目的地当前时间，失败时自动使用备用接口和浏览器本地换算 |
| 浏览器定位 | Geolocation API | 获取用户当前位置，需要用户授权 |
| 逆地理编码 | BigDataCloud Reverse Geocode Client | 把经纬度转成城市、省份、国家 |
| IP 定位兜底 | ipwho.is | 浏览器定位被拒绝时，使用 IP 粗略定位 |
| 汇率 | Frankfurter API / ExchangeRate API | 查询人民币到美元、日元、欧元、韩元、泰铢等旅行常用汇率 |

## 使用方式

在右下角 AI 旅游助手中输入：

- `杭州天气`
- `北京现在几点`
- `我在哪`
- `当前位置天气`
- `日元汇率`
- `人民币换美元`

普通路线规划问题仍然走项目本地知识库；只有天气、时间、定位、汇率这类实时问题才会调用外部 API。
