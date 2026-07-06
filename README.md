# 旅途灵犀

旅途灵犀是一个智能旅游助手网站。基础功能可直接打开 `index.html` 使用；如果通过 `npm run serve` 启动，会额外启用 Node 侧 LangChain Agent 服务。

## 主要功能

- 城市推荐与景点弹窗介绍
- AI 旅游助手问答
- 全国省份景区知识库
- 国家5A级旅游景区补充知识库，包含介绍、亮点、季节和游玩建议
- 高频景点详细知识库
- 浏览器 IndexedDB 本地知识库存储
- 天气、时间、定位、汇率等实时 API 查询
- LangChain Agent：基于 `createAgent`、Tool Calling 和 Ollama `qwen3:4b`，在知识库检索、地区查询、路线规划和实时 API 路由之间自动调度
- 本地大模型兜底：Agent 或知识库没有命中时，可调用 Ollama 的 `qwen3:4b`

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
- `local-llm.js`：前端调用 LangChain Agent 和本地大模型兜底
- `scripts/travel-agent.mjs`：LangChain Agent 服务，定义旅游知识库检索、地区检索、路线规划、实时 API 路由工具

## 本地运行

```bash
npm install
npm run build
npm run serve
```

打开 `http://127.0.0.1:4173`。

## LangChain Agent 与本地大模型

如果本机安装了 Ollama，并且已有 `qwen3:4b`，通过 `npm run serve` 启动后会启用 `/api/travel-agent`：

```bash
ollama run qwen3:4b
```

Agent 使用 LangChain 的 `createAgent` 创建，并提供以下工具：

- `scenic_knowledge_search`：检索本地 RAG 景点知识库和国家5A级景区知识库
- `region_knowledge_search`：查询省份/直辖市/自治区/港澳台景点资料
- `travel_route_planner`：根据目的地、天数和偏好生成路线
- `realtime_api_router`：识别天气、时间、定位、汇率等实时 API 意图

模型服务地址为 `http://127.0.0.1:11434`。如果 Agent 或模型不可用，页面会自动退回已有知识库和规则兜底，不影响基础使用。

## 测试

```bash
npm run test
npm run test:e2e:dist
```

## 发布

项目已准备好 GitHub Pages、Netlify、Vercel 配置。具体步骤见 [DEPLOY.md](DEPLOY.md)。
