import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith("--port="));
const port = Number(portArg?.split("=")[1] || process.env.PORT || 4173);
const rootArg = args.find((arg) => arg.startsWith("--root="));
const serveRoot = rootArg?.split("=")[1] || process.env.SERVE_ROOT || ".";
const root = resolve(process.cwd(), serveRoot);

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

createServer((request, response) => {
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
