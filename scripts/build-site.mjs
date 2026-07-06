import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const dist = join(root, "dist");

const files = [
  "index.html",
  "more-cities.html",
  "styles.css",
  "province-attractions.js",
  "attraction-knowledge.js",
  "knowledge-db.js",
  "travel-apis.js",
  "local-llm.js",
  "app.js",
  "README.md",
  "API_SOURCES.md",
  "KNOWLEDGE_DB.md",
  "DEPLOY.md",
];

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

function copyRecursive(from, to) {
  const stats = statSync(from);
  if (stats.isDirectory()) {
    mkdirSync(to, { recursive: true });
    readdirSync(from).forEach((entry) => copyRecursive(join(from, entry), join(to, entry)));
    return;
  }

  mkdirSync(resolve(to, ".."), { recursive: true });
  copyFileSync(from, to);
}

files.forEach((file) => {
  copyRecursive(join(root, file), join(dist, file));
});

mkdirSync(join(dist, "assets"), { recursive: true });
copyRecursive(join(root, "assets", "scenery-4k"), join(dist, "assets", "scenery-4k"));
writeFileSync(join(dist, ".nojekyll"), "");

console.log(`Built static site in ${dist}`);
