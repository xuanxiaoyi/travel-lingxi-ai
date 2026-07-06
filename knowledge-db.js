const TravelKnowledgeDB = (() => {
  const DB_NAME = "smart_travel_knowledge";
  const DB_VERSION = 1;
  let seedPromise = null;

  function hasIndexedDB() {
    return typeof indexedDB !== "undefined";
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!hasIndexedDB()) {
        reject(new Error("IndexedDB is not available"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("attractions")) {
          db.createObjectStore("attractions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("regions")) {
          db.createObjectStore("regions", { keyPath: "region" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function txDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function getAll(storeName) {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    }));
  }

  function buildAttractionRecords() {
    const records = [];
    const detailed = Array.isArray(globalThis.travelAttractionKnowledge) ? globalThis.travelAttractionKnowledge : [];
    const regions = Array.isArray(globalThis.chinaProvinceScenicKnowledge) ? globalThis.chinaProvinceScenicKnowledge : [];

    detailed.forEach((item) => {
      records.push({
        ...item,
        id: `detail-${item.name}-${item.city || item.region || ""}`,
        summary: item.summary || item.intro,
        source: "detail",
      });
    });

    regions.forEach((region) => {
      region.attractions?.forEach((item) => {
        records.push({
          id: `province-${region.region}-${item.name}-${item.city}`,
          name: item.name,
          aliases: [],
          city: item.city,
          region: region.region,
          category: item.category,
          summary: item.summary,
          intro: item.summary,
          tips: item.tips,
          bestTime: region.season,
          foods: region.foods,
          source: "province",
        });
      });
    });

    return records;
  }

  async function writeSeed() {
    if (!hasIndexedDB()) return false;
    const db = await openDB();
    const transaction = db.transaction(["attractions", "regions", "meta"], "readwrite");
    const attractionStore = transaction.objectStore("attractions");
    const regionStore = transaction.objectStore("regions");
    const metaStore = transaction.objectStore("meta");
    attractionStore.clear();
    regionStore.clear();
    metaStore.clear();

    const records = buildAttractionRecords();
    records.forEach((record) => attractionStore.put(record));
    (globalThis.chinaProvinceScenicKnowledge || []).forEach((region) => regionStore.put(region));
    metaStore.put({
      key: "seededAt",
      value: new Date().toISOString(),
      attractionCount: records.length,
      regionCount: (globalThis.chinaProvinceScenicKnowledge || []).length,
    });

    await txDone(transaction);
    db.close();
    return true;
  }

  function seed() {
    seedPromise = writeSeed();
    return seedPromise;
  }

  function ensureSeeded() {
    if (!seedPromise) seedPromise = writeSeed();
    return seedPromise;
  }

  function scoreAttraction(item, question) {
    const text = `${item.name} ${item.aliases?.join(" ") || ""} ${item.city || ""} ${item.region || ""} ${item.category || ""} ${item.summary || ""}`;
    let score = 0;
    if (question.includes(item.name)) score += 120;
    if (item.aliases?.some((alias) => question.includes(alias))) score += 110;
    if (item.city && question.includes(item.city)) score += 28;
    if (item.region && question.includes(item.region)) score += 18;
    if (item.category && question.includes(item.category)) score += 16;
    ["古城", "历史", "文化", "海边", "海岛", "山水", "自然", "亲子", "美食", "夜景", "拍照", "徒步", "博物馆", "寺庙", "草原", "雪山", "湖泊"].forEach((keyword) => {
      if (question.includes(keyword) && text.includes(keyword)) score += 8;
    });
    return score;
  }

  async function searchAttractions(question, limit = 5) {
    if (!hasIndexedDB()) return [];
    await ensureSeeded();
    const records = await getAll("attractions");
    return records
      .map((item) => ({ ...item, score: scoreAttraction(item, question) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async function findRegion(question) {
    if (!hasIndexedDB()) return null;
    await ensureSeeded();
    const regions = await getAll("regions");
    return regions.find((region) => question.includes(region.region) || region.aliases?.some((alias) => question.includes(alias))) || null;
  }

  async function stats() {
    if (!hasIndexedDB()) return { storage: "memory", attractionCount: buildAttractionRecords().length, regionCount: (globalThis.chinaProvinceScenicKnowledge || []).length };
    await ensureSeeded();
    const attractions = await getAll("attractions");
    const regions = await getAll("regions");
    return { storage: "indexedDB", attractionCount: attractions.length, regionCount: regions.length };
  }

  if (hasIndexedDB()) {
    seed().catch(() => {});
  }

  return {
    seed,
    searchAttractions,
    findRegion,
    stats,
  };
})();
