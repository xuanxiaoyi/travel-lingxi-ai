# 智能旅游助手知识库说明

当前项目的基础问答可在静态网页中运行；通过 `npm run serve` 启动时，会额外启用 Node 侧 LangChain Agent。知识库采用三层结构：

1. 数据源文件
   - `province-attractions.js`：全国省级景区基础资料。
   - `attraction-knowledge.js`：高频景点详细资料，用于用户问答。
   - `national-scenic-knowledge.js`：国家5A级旅游景区补充资料，包含介绍、亮点、最佳时间、游玩建议、关键词和数据来源。

2. 浏览器本地数据库
   - `knowledge-db.js` 会把上面的知识库写入浏览器 IndexedDB。
   - 用户问“介绍西湖”“浙江景点推荐”“杭州有哪些景点”时，问答逻辑会优先从 IndexedDB 搜索。
   - 如果浏览器不支持 IndexedDB，会自动退回到内存知识库，不影响使用。

3. LangChain Agent 工具层
   - `scripts/travel-agent.mjs` 使用 LangChain `createAgent` 构建旅游 Agent。
   - Agent 工具包括景点知识库检索、地区知识库检索、路线规划和实时 API 意图路由。
   - 当前本地模型为 Ollama `qwen3:4b`；模型不可用或输出不稳定时，会退回确定性的工具检索结果。

## 已支持问法

- 具体景点介绍：`介绍西湖`、`兵马俑怎么玩`、`黄山值得去吗`
- 城市景点清单：`杭州有哪些景点`、`厦门景点推荐`
- 省份/城市景区推荐：`浙江景点推荐`、`四川哪里好玩`、`南充景点推荐`
- 5A景区资料：`介绍阆中古城`、`喀纳斯怎么玩`、`圆明园遗址公园景区值得去吗`
- 路线规划：`杭州2天情侣`、`成都3天亲子`
- 实时信息：`杭州天气`、`北京现在几点`、`我在哪`、`日元汇率`
- LangChain Agent 兜底：知识库没有命中时，优先调用 `/api/travel-agent`，由 Agent 选择知识库工具、路线规划工具或本地模型
- 本地模型兜底：Agent 不可用时，继续尝试调用本机 Ollama 的 `qwen3:4b`

## 维护方式

后续扩充知识库时，优先往 `attraction-knowledge.js` 追加详细景点对象；如果是省份基础清单，则追加到 `province-attractions.js`。国家5A级景区名录可以通过 `scripts/generate-national-scenic.mjs` 重新生成。
