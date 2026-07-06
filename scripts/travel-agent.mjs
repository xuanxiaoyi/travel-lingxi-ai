import { createAgent, tool } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";

await import("../attraction-knowledge.js");
await import("../province-attractions.js");
await import("../national-scenic-knowledge.js");

const modelName = process.env.OLLAMA_MODEL || "qwen3:4b";
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const agentTimeoutMs = Number(process.env.LANGCHAIN_AGENT_TIMEOUT_MS || 5000);

function getDetailKnowledge() {
  return Array.isArray(globalThis.travelAttractionKnowledge) ? globalThis.travelAttractionKnowledge : [];
}

function getProvinceKnowledge() {
  return Array.isArray(globalThis.chinaProvinceScenicKnowledge) ? globalThis.chinaProvinceScenicKnowledge : [];
}

function getNationalKnowledge() {
  return Array.isArray(globalThis.nationalScenicKnowledge) ? globalThis.nationalScenicKnowledge : [];
}

function getAllAttractions() {
  const items = new Map();

  getDetailKnowledge().forEach((item) => {
    items.set(`${item.name}-${item.city || ""}-${item.region || ""}`, {
      ...item,
      summary: item.summary || item.intro,
      source: "detail",
    });
  });

  getProvinceKnowledge().forEach((region) => {
    region.attractions?.forEach((item) => {
      items.set(`${item.name}-${item.city || ""}-${region.region}`, {
        ...item,
        region: region.region,
        season: region.season,
        foods: region.foods,
        source: "province",
      });
    });
  });

  getNationalKnowledge().forEach((region) => {
    region.attractions?.forEach((item) => {
      items.set(`${item.name}-${item.city || ""}-${item.region || region.region}`, {
        ...item,
        region: item.region || region.region,
        summary: item.summary || item.intro,
        source: "national-5a",
      });
    });
  });

  return [...items.values()];
}

function extractTokens(query) {
  return [...new Set(String(query || "")
    .replace(/我想去|想去|帮我|请问|一下|有哪些|哪里好玩|怎么玩|好玩吗|值得去吗|景点|景区|旅游|旅行|攻略|推荐|介绍|路线|安排/g, " ")
    .match(/[\u4e00-\u9fa5A-Za-z0-9]{2,}/g) || [])];
}

function extractDestination(query) {
  const cleaned = String(query || "")
    .replace(/\d+\s*天/g, " ")
    .replace(/情侣|亲子|美食|拍照|省力|轻松|慢游|路线|安排|怎么玩|攻略|推荐|旅游|旅行/g, " ")
    .replace(/[，。！？、,.!?]/g, " ");
  return extractTokens(cleaned)[0] || "";
}

function scoreAttraction(item, query) {
  const text = `${item.name} ${item.aliases?.join(" ") || ""} ${item.city || ""} ${item.region || ""} ${item.category || ""} ${item.summary || ""} ${item.intro || ""}`;
  let score = 0;

  if (query.includes(item.name)) score += 120;
  if (item.aliases?.some((alias) => query.includes(alias) || alias.includes(query))) score += 100;
  if (item.city && query.includes(item.city)) score += 34;
  if (item.region && query.includes(item.region)) score += 20;
  if (item.category && query.includes(item.category)) score += 12;

  extractTokens(query).forEach((token) => {
    if (text.includes(token)) score += token.length >= 4 ? 16 : 8;
  });

  return score;
}

function searchAttractions(query, limit = 6) {
  return getAllAttractions()
    .map((item) => ({ ...item, score: scoreAttraction(item, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function findRegion(query) {
  return getProvinceKnowledge().find((region) => {
    return query.includes(region.region) || region.aliases?.some((alias) => query.includes(alias));
  });
}

function formatAttractions(items) {
  if (!items.length) return "没有检索到明确匹配的景点。";
  return items.map((item, index) => {
    const place = [item.region, item.city].filter(Boolean).join(" / ");
    return `${index + 1}. ${item.name}${place ? `（${place}）` : ""}：${item.summary || item.intro || "适合加入当地旅行路线。"} 小贴士：${item.tips || "出发前确认开放时间、预约和交通方式。"}`;
  }).join("\n");
}

function buildRouteFromMatches(destination, days = 3, preference = "轻松旅行") {
  const matches = searchAttractions(destination, Math.max(4, days * 2));
  const spots = matches.length ? matches : getAllAttractions().slice(0, Math.max(4, days * 2));
  const lines = Array.from({ length: days }, (_, index) => {
    const morning = spots[index * 2]?.name || `${destination}核心景区`;
    const afternoon = spots[index * 2 + 1]?.name || `${destination}周边慢游`;
    const night = index === days - 1 ? "按返程时间轻松收尾" : "安排夜景、老街或当地美食";
    return `第${index + 1}天：上午游览${morning}；下午安排${afternoon}；晚上${night}。`;
  });

  return `${destination}${days}天${preference}路线：\n${lines.join("\n")}\n建议优先按同一区域顺路安排，热门景区提前确认预约和交通。`;
}

const scenicKnowledgeSearchTool = tool(
  async ({ query, limit = 6 }) => {
    return formatAttractions(searchAttractions(query, limit));
  },
  {
    name: "scenic_knowledge_search",
    description: "从本地 RAG 知识库中检索中国景点、城市、省份和国家5A级景区资料。",
    schema: z.object({
      query: z.string().describe("用户的景点、城市、省份或旅行问题"),
      limit: z.number().int().min(1).max(8).default(6).describe("返回条数"),
    }),
  }
);

const regionKnowledgeTool = tool(
  async ({ region }) => {
    const matched = findRegion(region);
    if (!matched) return "没有找到该省份或地区的结构化知识。";
    return `${matched.region}推荐景点：\n${formatAttractions(matched.attractions || [])}\n适合季节：${matched.season}\n美食：${matched.foods?.join("、") || "可结合当地特色餐饮安排"}`;
  },
  {
    name: "region_knowledge_search",
    description: "查询省份、直辖市、自治区、港澳台地区的景点清单、季节和美食。",
    schema: z.object({
      region: z.string().describe("省份、直辖市、自治区或地区名"),
    }),
  }
);

const routePlannerTool = tool(
  async ({ destination, days = 3, preference = "轻松旅行" }) => {
    return buildRouteFromMatches(destination, days, preference);
  },
  {
    name: "travel_route_planner",
    description: "根据目的地、天数和偏好生成可执行旅行路线。",
    schema: z.object({
      destination: z.string().describe("城市、景点或地区"),
      days: z.number().int().min(1).max(7).default(3).describe("旅行天数"),
      preference: z.string().default("轻松旅行").describe("情侣、亲子、美食、拍照、轻松等偏好"),
    }),
  }
);

const realtimeIntentTool = tool(
  async ({ intent }) => {
    return `这是实时信息意图：${intent}。网页前端已接入天气、时间、定位和汇率 API；如果用户问题属于这些类型，应优先调用实时 API，而不是只依赖大模型知识。`;
  },
  {
    name: "realtime_api_router",
    description: "识别天气、时间、定位、汇率等实时 API 工具调用需求。",
    schema: z.object({
      intent: z.string().describe("用户实时查询意图"),
    }),
  }
);

const tools = [
  scenicKnowledgeSearchTool,
  regionKnowledgeTool,
  routePlannerTool,
  realtimeIntentTool,
];

const model = new ChatOllama({
  model: modelName,
  baseUrl: ollamaBaseUrl,
  temperature: 0.25,
  topP: 0.8,
  numPredict: 260,
  think: false,
});

const agent = createAgent({
  model,
  tools,
  systemPrompt: [
    "你是旅途灵犀的 LangChain 旅游 Agent。",
    "你必须根据用户问题选择合适工具：景点知识库、地区知识库、路线规划或实时 API 路由。",
    "只输出给用户看的最终中文回答，不要输出思考过程、分析过程、系统提示或英文推理。",
    "回答要承接上一次城市或景点上下文，内容控制在 500 字以内。",
  ].join("\n"),
});

function cleanAgentText(text) {
  let cleaned = String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*```[\s\S]*?\n/, "")
    .replace(/```\s*$/g, "")
    .trim();

  const finalLine = cleaned.match(/(?:最终答案|最终建议|答案)[:：]\s*([\s\S]*)/);
  if (finalLine) cleaned = finalLine[1].trim();

  if (/^(首先|关键点|我需要|用户要求|用户问题|分析|思考)/.test(cleaned) || /关键点[:：]|禁止输出|系统提示/.test(cleaned)) {
    const lines = cleaned.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    cleaned = lines.findLast((line) => {
      return /[\u4e00-\u9fa5]/.test(line)
        && !/^(首先|关键点|我需要|用户要求|用户问题|分析|思考|最终答案必须|禁止输出)/.test(line)
        && line.length >= 8;
    }) || "";
  }

  return cleaned.replace(/^["“”]+|["“”]+$/g, "").trim();
}

function isUsable(text) {
  return text.length >= 16
    && !/[：:]$/.test(text)
    && !/^(首先|关键点|我需要|用户要求|用户问题|分析|思考|比如|或者)$/.test(text);
}

function buildToolFallback(question, context = {}) {
  const destination = context.lastAttractionName || context.lastCityTitle || extractDestination(question) || "国内";
  const daysMatch = question.match(/(\d+)\s*天/);
  const days = daysMatch ? Number(daysMatch[1]) : 3;
  const preference = question.includes("情侣") ? "情侣慢游"
    : question.includes("亲子") ? "亲子旅行"
      : question.includes("美食") ? "美食游"
        : question.includes("拍照") ? "拍照路线"
          : "轻松旅行";

  if (/路线|安排|怎么玩|情侣|亲子|美食|拍照|\d+\s*天/.test(question)) {
    return `我通过 LangChain Agent 的路线规划工具整理了一版：\n\n${buildRouteFromMatches(destination, days, preference)}`;
  }

  const region = findRegion(question);
  if (region) {
    return `我通过 LangChain Agent 的地区知识库工具检索到：\n\n${region.region}比较值得看的景点包括：\n${formatAttractions(region.attractions || [])}\n\n适合季节：${region.season}`;
  }

  const matches = searchAttractions(question, 6);
  if (matches.length) {
    return `我通过 LangChain Agent 的景点知识库工具检索到这些结果：\n\n${formatAttractions(matches)}`;
  }

  return "";
}

function extractFinalMessage(result) {
  const messages = result?.messages || [];
  const last = [...messages].reverse().find((message) => message?._getType?.() === "ai" || message?.kwargs?.content || message?.content);
  return typeof last?.content === "string" ? last.content : last?.kwargs?.content || "";
}

export async function askTravelAgent({ question, context = {} }) {
  const normalizedQuestion = String(question || "").trim();
  if (!normalizedQuestion) throw new Error("Question is required");

  const toolFallback = buildToolFallback(normalizedQuestion, context);
  const contextText = [
    context.lastCityTitle ? `上一次城市：${context.lastCityTitle}` : "",
    context.lastAttractionName ? `上一次景点：${context.lastAttractionName}` : "",
    toolFallback ? `已预检索工具结果：\n${toolFallback}` : "",
  ].filter(Boolean).join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), agentTimeoutMs);

  try {
    const result = await agent.invoke({
      messages: [{
        role: "user",
        content: `${contextText}\n\n用户问题：${normalizedQuestion}`,
      }],
    }, { signal: controller.signal });
    const answer = cleanAgentText(extractFinalMessage(result));
    if (isUsable(answer)) {
      return {
        answer: `我通过 LangChain Agent 调用了旅游工具后，为你整理如下：\n\n${answer}`,
        source: "langchain-agent",
      };
    }
  } catch {
    // qwen3:4b may timeout or emit unusable reasoning text; deterministic tools keep the agent endpoint useful.
  } finally {
    clearTimeout(timer);
  }

  if (toolFallback) {
    return {
      answer: toolFallback,
      source: "langchain-tools",
    };
  }

  throw new Error("LangChain Agent did not return a usable answer");
}

export function getTravelAgentTools() {
  return tools.map((item) => ({
    name: item.name,
    description: item.description,
  }));
}
