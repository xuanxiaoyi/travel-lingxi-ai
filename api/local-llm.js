const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434/api/generate";
const ollamaTimeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 7000);
const shouldBypassModel = process.env.DISABLE_LANGCHAIN_MODEL === "true"
  || (process.env.VERCEL === "1" && /127\.0\.0\.1|localhost/.test(ollamaEndpoint));

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (shouldBypassModel) {
    response.status(502).json({
      error: "Local LLM unavailable",
      detail: "Current deployment cannot reach a local Ollama endpoint.",
    });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ollamaTimeoutMs);

  try {
    const upstream = await fetch(ollamaEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(request.body || {}),
    });
    const text = await upstream.text();
    response.statusCode = upstream.status;
    response.setHeader("content-type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    response.end(text);
  } catch (error) {
    response.status(502).json({
      error: "Local LLM unavailable",
      detail: error.message,
    });
  } finally {
    clearTimeout(timer);
  }
}
