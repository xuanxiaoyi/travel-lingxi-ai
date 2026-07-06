import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith("--port="));
const port = Number(portArg?.split("=")[1] || process.env.PORT || 4173);
const rootArg = args.find((arg) => arg.startsWith("--root="));
const serveRoot = rootArg?.split("=")[1] || process.env.SERVE_ROOT || ".";
const root = resolve(process.cwd(), serveRoot);
const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434/api/generate";
const ollamaTimeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 7000);
let travelAgentModulePromise = null;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const target = resolve(join(root, clean === "/" ? "index.html" : clean));
  if (!target.startsWith(root)) return "";
  if (existsSync(target) && statSync(target).isDirectory()) return join(target, "index.html");
  return target;
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        rejectBody(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolveBody(body));
    request.on("error", rejectBody);
  });
}

async function handleLocalLlmProxy(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.writeHead(405, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ollamaTimeoutMs);

  try {
    const body = await readRequestBody(request);
    const upstream = await fetch(ollamaEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body,
    });
    const text = await upstream.text();
    response.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    });
    response.end(text);
  } catch (error) {
    response.writeHead(502, {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    });
    response.end(JSON.stringify({ error: "Local LLM unavailable", detail: error.message }));
  } finally {
    clearTimeout(timer);
  }
}

async function handleTravelAgentProxy(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.writeHead(405, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const body = JSON.parse(await readRequestBody(request) || "{}");
    travelAgentModulePromise ||= import("./travel-agent.mjs");
    const { askTravelAgent } = await travelAgentModulePromise;
    const result = await askTravelAgent(body);

    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    });
    response.end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(502, {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    });
    response.end(JSON.stringify({ error: "LangChain Agent unavailable", detail: error.message }));
  }
}

createServer((request, response) => {
  const pathname = new URL(request.url || "/", `http://localhost:${port}`).pathname;
  if (pathname === "/api/travel-agent") {
    handleTravelAgentProxy(request, response);
    return;
  }

  if (pathname === "/api/local-llm") {
    handleLocalLlmProxy(request, response);
    return;
  }

  const target = resolveRequestPath(request.url || "/");
  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": types[extname(target).toLowerCase()] || "application/octet-stream",
    "cache-control": target.endsWith(".html") ? "no-cache" : "public, max-age=3600",
  });
  createReadStream(target).pipe(response);
}).listen(port, () => {
  console.log(`Smart Travel Assistant running at http://127.0.0.1:${port}`);
});
