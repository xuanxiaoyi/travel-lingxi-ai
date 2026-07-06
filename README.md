# 旅途灵犀

旅途灵犀是一个静态网页智能旅游助手项目，打开 `index.html` 即可使用。

## 主要功能

- 城市推荐与景点弹窗介绍
- AI 旅游助手问答
- 全国省份景区知识库
- 国家5A级旅游景区补充知识库，包含介绍、亮点、季节和游玩建议
- 高频景点详细知识库
- 浏览器 IndexedDB 本地知识库存储
- 天气、时间、定位、汇率等实时 API 查询
- 本地大模型兜底：知识库没有命中时，可调用 Ollama 的 `qwen3:4b`

## 常见问法

- `介绍西湖`
- `杭州有哪些景点`
- `浙江景点推荐`
- `成都3天亲子`
- `杭州天气`
- `北京现在几点`
- `我在哪`
- `日元汇率`

## 关键文件

- `index.html`：首页
- `more-cities.html`：更多城市页
- `app.js`：页面交互和问答逻辑
- `province-attractions.js`：全国省份景区基础知识库
- `attraction-knowledge.js`：高频景点详细知识库
- `national-scenic-knowledge.js`：国家5A级旅游景区补充知识库，包含结构化介绍资料
- `knowledge-db.js`：浏览器本地数据库 IndexedDB
- `travel-apis.js`：天气、时间、定位、汇率 API
- `local-llm.js`：本地大模型 qwen3:4b 兜底调用

## 本地运行

```bash
npm install
npm run build
npm run serve
```

打开 `http://127.0.0.1:4173`。

## 本地大模型兜底

如果本机安装了 Ollama，并且已有 `qwen3:4b`，AI 助手在知识库没有命中时会尝试调用：

```bash
ollama run qwen3:4b
```

模型服务地址为 `http://127.0.0.1:11434`。公开部署后，只有访问者自己的电脑也运行了该模型时，兜底能力才会生效；否则会自动退回普通提示。

## 测试

```bash
npm run test
npm run test:e2e:dist
```

## 发布

项目已准备好 GitHub Pages、Netlify、Vercel 配置。具体步骤见 [DEPLOY.md](DEPLOY.md)。
