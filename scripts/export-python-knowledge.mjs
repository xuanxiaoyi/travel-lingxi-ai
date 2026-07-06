await import("../attraction-knowledge.js");
await import("../province-attractions.js");
await import("../national-scenic-knowledge.js");

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function getDetailKnowledge() {
  return Array.isArray(globalThis.travelAttractionKnowledge) ? globalThis.travelAttractionKnowledge : [];
}

function getProvinceKnowledge() {
  return Array.isArray(globalThis.chinaProvinceScenicKnowledge) ? globalThis.chinaProvinceScenicKnowledge : [];
}

function getNationalKnowledge() {
  return Array.isArray(globalThis.nationalScenicKnowledge) ? globalThis.nationalScenicKnowledge : [];
}

function buildMergedAttractions() {
  const items = new Map();

  getDetailKnowledge().forEach((item) => {
    items.set(`${item.name}-${item.city || ""}-${item.region || ""}`, {
      ...item,
      summary: item.summary || item.intro || "",
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
        summary: item.summary || item.intro || "",
        source: "national-5a",
      });
    });
  });

  return [...items.values()];
}

const outputPath = resolve(process.cwd(), "data", "travel_knowledge.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify({
  attractions: buildMergedAttractions(),
  regions: getProvinceKnowledge(),
}, null, 2));

console.log(`Exported Python knowledge data to ${outputPath}`);
