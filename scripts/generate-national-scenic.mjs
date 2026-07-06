import { writeFileSync } from "node:fs";
import vm from "node:vm";

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()).filter(Boolean))];
}

function stripYear(name) {
  return name.replace(/\d{4}年?\/?$/u, "").replace(/\/$/u, "").trim();
}

function stripSuffix(name) {
  let current = name;
  const suffixes = [
    "国家AAAAA级旅游景区",
    "国家5A级旅游景区",
    "国家级旅游景区",
    "风景名胜区",
    "文化旅游景区",
    "文化旅游区",
    "生态旅游区",
    "旅游度假区",
    "旅游景区",
    "旅游区",
    "风景区",
    "景区",
    "国家森林公园",
    "森林公园",
    "国家地质公园",
    "地质公园",
    "国家公园",
    "度假区",
    "公园",
  ];

  let changed = true;
  while (changed) {
    changed = false;
    suffixes.forEach((suffix) => {
      if (current.endsWith(suffix) && current.length > suffix.length + 1) {
        current = current.slice(0, -suffix.length).trim();
        changed = true;
      }
    });
  }

  return current;
}

function parseCity(cleanName, province) {
  const normalized = cleanName.replace(/[（(].*?[）)]/gu, "");
  const direct = normalized.match(/^(.{2,12}?)(市|州|盟|地区)/u);
  if (direct) return direct[1];
  if (["北京", "天津", "上海", "重庆"].includes(province)) return province;
  return "";
}

function displayName(cleanName, city, province) {
  let name = cleanName;
  if (city && name.startsWith(`${city}市`)) name = name.slice(city.length + 1);
  if (city && name.startsWith(`${city}州`)) name = name.slice(city.length + 1);
  if (city && name.startsWith(`${city}盟`)) name = name.slice(city.length + 1);
  if (city && name.startsWith(`${city}地区`)) name = name.slice(city.length + 2);
  if (["北京", "天津", "上海", "重庆"].includes(province) && name.startsWith(`${province}市`)) {
    name = name.slice(province.length + 1);
  }
  return name.trim() || cleanName;
}

function aliasesFor(name, officialName, city, province) {
  const withoutProvince = name.replace(new RegExp(`^${province}(市|省|自治区)?`, "u"), "");
  const withoutCity = city ? name.replace(new RegExp(`^${city}(市|州|盟|地区)?`, "u"), "") : "";
  return unique([
    officialName,
    name,
    stripSuffix(name),
    stripSuffix(officialName),
    withoutProvince,
    stripSuffix(withoutProvince),
    withoutCity,
    stripSuffix(withoutCity),
  ]);
}

function inferCategory(name) {
  if (/古城|故城|遗址|故宫|陵|墓|石窟|城墙|宫|庙|寺|祠|园林|楼|文化/u.test(name)) return "人文历史";
  if (/山|峰|峡|谷|岩|洞|瀑布|森林|草原|湖|海|岛|湾|湿地|沙漠|冰川|天池/u.test(name)) return "自然风光";
  if (/乐园|度假|温泉|休闲|街区|古镇|小镇/u.test(name)) return "休闲度假";
  return "综合景区";
}

function inferLandscape(name) {
  const rules = [
    [/长城|关|城墙/u, ["长城关隘", "城墙线和关城空间辨识度高", "适合理解边塞防御与历史地理"]],
    [/古城|古镇|老街|街区/u, ["古城街巷", "街巷肌理和地方生活氛围集中", "适合慢走、拍照和夜游"]],
    [/故宫|宫|府|陵|祠|庙|寺|石窟|遗址|博物馆/u, ["历史文化", "建筑、文物或遗址信息量较大", "配合讲解游览体验更完整"]],
    [/山|峰|岳|岭|崖|岩/u, ["山岳风光", "登高视野和地貌层次明显", "适合徒步、观景和摄影"]],
    [/峡|谷|洞|瀑/u, ["峡谷瀑布", "峡谷、水流或洞穴景观突出", "游览时注意步道、防滑和体力分配"]],
    [/湖|池|湿地|河|江|溪|泉/u, ["湖泊水景", "水面、湿地或河谷景观适合放松游览", "清晨和傍晚通常更适合观景"]],
    [/海|岛|湾|沙滩/u, ["滨海海岛", "海岸线、海风和度假体验突出", "出行前关注风浪、台风和船班"]],
    [/草原|牧场/u, ["草原风光", "开阔草场、民俗体验和季节色彩明显", "景点距离往往较远，适合自驾或包车"]],
    [/沙漠|沙坡|沙湖|鸣沙/u, ["沙漠景观", "沙丘、绿洲或黄河边缘景观有冲击力", "防晒、防风沙和补水很重要"]],
    [/乐园|度假|温泉/u, ["休闲度假", "游乐、住宿或温泉配套更成熟", "建议提前查看项目开放和排队情况"]],
  ];

  return rules.find(([pattern]) => pattern.test(name))?.[1] || ["综合体验", "自然、人文或休闲资源组合较完整", "适合作为当地经典线路中的重点一站"];
}

function inferBestTime(name, region, category) {
  if (/黑龙江|吉林|辽宁|内蒙古/.test(region) && /冰|雪|滑雪|雪乡|亚布力/u.test(name)) return "冬季冰雪体验最有代表性，防寒装备要准备充分。";
  if (/新疆|西藏|青海|甘肃|宁夏|内蒙古/.test(region)) return "5-10月整体更适合旅行，昼夜温差明显，注意防晒和保暖。";
  if (/海南|广东|广西|福建/.test(region)) return "秋冬到春季体感更舒服，夏季注意防晒、降雨和台风。";
  if (/山|峰|岳|峡|谷|森林|草原/.test(name)) return "春秋季体感更舒适；夏季适合避暑但要关注降雨，冬季注意防滑保暖。";
  if (/海|岛|湾|沙滩/.test(name)) return "春秋和初冬更适合看海，夏季适合亲水但要关注风浪和台风。";
  if (category === "人文历史") return "四季都适合参观，春秋体感更好；节假日建议提前预约并错峰。";
  return "春秋季整体更舒适，热门节假日建议提前预约并错峰出行。";
}

function buildIntro(name, officialName, city, region, category) {
  const [theme] = inferLandscape(name);
  const place = [region, city].filter(Boolean).join(" / ") || region;
  return `${name}位于${place}，是国家5A级旅游景区。它以${theme}为主要看点，适合纳入${region}经典旅行路线；如果用户第一次到当地，可以把这里作为了解地方风景、人文和成熟旅游配套的重要一站。`;
}

function buildHighlights(name) {
  const [theme, scene, value] = inferLandscape(name);
  const highlights = [`${theme}辨识度高，适合作为目的地核心景点`, scene, value];
  if (/夜|古城|街|湾|港|江|河/u.test(name)) highlights.push("傍晚到夜间通常更有氛围，适合安排轻松收尾");
  if (/山|峡|谷|森林|草原|沙漠/u.test(name)) highlights.push("户外时间较长，建议穿舒适鞋并预留体力");
  return unique(highlights).slice(0, 4);
}

function buildKeywords(name, officialName, city, region, category, aliases) {
  return unique([name, officialName, city, region, category, ...aliases, ...inferLandscape(name)]);
}

const response = await fetch("https://sjfw.mct.gov.cn/site/dataservice/rural?type=10");
const html = await response.text();
const match = html.match(/<script>window\.__NUXT__=([\s\S]*?)<\/script>/u);
if (!match) throw new Error("未找到文化和旅游部景区数据");

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(`window.__NUXT__=${match[1]}`, ctx);

const groups = ctx.window.__NUXT__.data[0].Provinces.flat().filter((item) => item?.province && Array.isArray(item.list));
const output = groups.map((group) => {
  const region = group.province.name;
  return {
    region,
    source: "文化和旅游部数据服务-国家5A级旅游景区名单",
    attractions: group.list.map((item) => {
      const officialName = stripYear(item.name);
      const city = parseCity(officialName, region);
      const name = displayName(officialName, city, region);
      const category = inferCategory(name);
      const aliases = aliasesFor(name, officialName, city, region);
      const bestTime = inferBestTime(name, region, category);
      const tips = "出发前确认开放时间、预约要求和交通方式；节假日建议错峰，并按景区分布预留往返时间。";

      return {
        name,
        officialName,
        aliases,
        city,
        region,
        category,
        intro: buildIntro(name, officialName, city, region, category),
        summary: `${name}是${region}收录的国家5A级旅游景区，核心类型为${category}，适合加入当地经典旅行路线。`,
        highlights: buildHighlights(name),
        bestTime,
        tips,
        keywords: buildKeywords(name, officialName, city, region, category, aliases),
        dataSource: "文化和旅游部数据服务-国家5A级旅游景区名单",
        sourceUrl: "https://sjfw.mct.gov.cn/site/dataservice/rural?type=10",
      };
    }),
  };
});

const header = "// 根据文化和旅游部数据服务页生成的国家5A级旅游景区补充知识库。\n";
writeFileSync("national-scenic-knowledge.js", `${header}globalThis.nationalScenicKnowledge = ${JSON.stringify(output, null, 2)};\n`, "utf8");

const attractionCount = output.reduce((sum, group) => sum + group.attractions.length, 0);
console.log(`生成 national-scenic-knowledge.js：${output.length} 个地区，${attractionCount} 个5A景区`);
