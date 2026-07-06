const chatButton = document.querySelector(".chat-button");
const chatPanel = document.getElementById("chatPanel");
const chatClose = document.querySelector(".chat-close");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSend = document.querySelector(".chat-send");
const cityDialog = document.getElementById("cityDialog");
const dialogClose = document.querySelector(".dialog-close");
const dialogImage = document.getElementById("dialogImage");
const dialogKicker = document.getElementById("dialogKicker");
const dialogTitle = document.getElementById("dialogTitle");
const dialogSummary = document.getElementById("dialogSummary");
const dialogMeta = document.getElementById("dialogMeta");
const dialogList = document.getElementById("dialogList");
const recommendationButtons = document.querySelectorAll("[data-recommendation-category]");
const recommendationSection = document.getElementById("recommendations");
const recommendationKicker = document.getElementById("recommendation-kicker");
const recommendationTitle = document.getElementById("recommendation-title");
const recommendationDescription = document.getElementById("recommendation-description");
const recommendationGrid = document.getElementById("recommendationGrid");

const recommendationGroups = {
  culture: {
    kicker: "古城文化",
    title: "古城文化推荐",
    description: "从历史古都、城墙街巷和文化遗产中，挑选适合深度漫游的城市。",
    items: [
      { city: "beijing", name: "北京", image: "assets/scenery-4k/beijing.jpg", text: "千年古都，故宫、长城、天安门等历史文化遗产荟萃，适合系统感受中华文明底蕴。" },
      { city: "xian", name: "西安", image: "assets/scenery-4k/xian.jpg", text: "十三朝古都，兵马俑震撼世界，古城墙见证历史风华，适合历史文化路线。" },
      { city: "nanjing", name: "南京", image: "assets/scenery-4k/nanjing.jpg", text: "金陵古城，秦淮河、明城墙和中山陵串起厚重又温柔的城市记忆。" },
      { city: "suzhou", name: "苏州", image: "assets/scenery-4k/suzhou.jpg", text: "园林、水巷和老街交织，适合把江南文化放慢节奏细细看。" },
      { city: "lijiang", name: "丽江", image: "assets/scenery-4k/lijiang.jpg", text: "古城、雪山和纳西风情融合，适合喜欢古镇街巷和人文拍照的人。" },
      { city: "chongqing", name: "重庆", image: "assets/scenery-4k/chongqing.jpg", text: "山城步道、码头记忆和立体街巷交错，适合看城市烟火和历史层次。" },
      { city: "lhasa", name: "拉萨", image: "assets/scenery-4k/lhasa.jpg", text: "布达拉宫、大昭寺和八廓街适合慢节奏体验高原文化与信仰生活。" },
      { city: "shanghai", name: "上海", image: "assets/scenery-4k/shanghai.jpg", text: "外滩建筑群和老街区保留海派文化脉络，适合都市历史漫步。" },
    ],
  },
  nature: {
    kicker: "山水自然",
    title: "山水自然推荐",
    description: "山水、峰林、雪山和湿地风光，适合喜欢自然景观和拍照的人。",
    items: [
      { city: "hangzhou", name: "杭州", image: "assets/scenery-4k/hangzhou.jpg", text: "人间天堂，西湖美景如诗如画，江南水乡的温婉与雅致尽在其中。" },
      { city: "guilin", name: "桂林", image: "assets/scenery-4k/guilin.jpg", text: "山水甲天下，漓江风光秀美，喀斯特地貌奇特，适合自然风光路线。" },
      { city: "zhangjiajie", name: "张家界", image: "assets/scenery-4k/zhangjiajie.jpg", text: "峰林奇观、峡谷栈道和森林公园，适合徒步观景和自然摄影。" },
      { city: "lijiang", name: "丽江", image: "assets/scenery-4k/lijiang.jpg", text: "古城与雪山相邻，玉龙雪山、蓝月谷和束河适合慢游与拍照。" },
      { city: "lhasa", name: "拉萨", image: "assets/scenery-4k/lhasa.jpg", text: "高原天空、宫殿建筑和山地视野开阔，适合有准备的高原旅行。" },
      { city: "sanya", name: "三亚", image: "assets/scenery-4k/sanya.jpg", text: "热带海湾、椰林和滨海步道组合，适合轻松看海和自然度假。" },
      { city: "qingdao", name: "青岛", image: "assets/scenery-4k/qingdao.jpg", text: "海岸线、山海视野和城市绿意结合，适合海风漫步和自然拍照。" },
      { city: "suzhou", name: "苏州", image: "assets/scenery-4k/suzhou.jpg", text: "园林水景、河道街巷和江南植物景观，适合细腻安静的自然慢游。" },
    ],
  },
  island: {
    kicker: "海岛度假",
    title: "海岛度假推荐",
    description: "海滨、沙滩、骑行和度假酒店路线，适合想看海和放松的行程。",
    items: [
      { city: "sanya", name: "三亚", image: "assets/scenery-4k/sanya.jpg", text: "热带天堂，碧海蓝天、椰林沙滩，适合享受阳光海滩假期。" },
      { city: "xiamen", name: "厦门", image: "assets/scenery-4k/xiamen.jpg", text: "海上花园，鼓浪屿文艺浪漫，海滨风光旖旎，适合轻松短途游。" },
      { city: "qingdao", name: "青岛", image: "assets/scenery-4k/qingdao.jpg", text: "海风、欧式建筑和城市海岸线结合，适合海边漫步和啤酒美食。" },
      { city: "shanghai", name: "上海", image: "assets/scenery-4k/shanghai.jpg", text: "外滩、黄浦江和滨江步道适合都市水岸漫游，夜景层次很丰富。" },
      { city: "hangzhou", name: "杭州", image: "assets/scenery-4k/hangzhou.jpg", text: "西湖水岸和湖滨夜景适合轻松散步，也能兼顾江南城市度假感。" },
      { city: "guilin", name: "桂林", image: "assets/scenery-4k/guilin.jpg", text: "漓江游船和阳朔山水适合放慢节奏，享受水岸风光。" },
      { city: "suzhou", name: "苏州", image: "assets/scenery-4k/suzhou.jpg", text: "江南水巷与园林水面适合短途休闲，节奏安静舒适。" },
      { city: "lijiang", name: "丽江", image: "assets/scenery-4k/lijiang.jpg", text: "古城水渠、雪山远景和咖啡小店，适合轻度度假与拍照。" },
    ],
  },
  food: {
    kicker: "美食慢游",
    title: "美食慢游推荐",
    description: "用美食、街区和夜景串起慢节奏路线，适合边吃边逛。",
    items: [
      { city: "chengdu", name: "成都", image: "assets/scenery-4k/chengdu.jpg", text: "天府之国，大熊猫的故乡，美食之都，慢生活的代表。" },
      { city: "chongqing", name: "重庆", image: "assets/scenery-4k/chongqing.jpg", text: "山城夜景、洪崖洞、长江索道和火锅，适合夜景与美食路线。" },
      { city: "nanjing", name: "南京", image: "assets/scenery-4k/nanjing.jpg", text: "秦淮夜色、老门东小吃和金陵风味，适合边逛边吃的城市慢游。" },
      { city: "harbin", name: "哈尔滨", image: "assets/scenery-4k/harbin.jpg", text: "中央大街、俄式建筑和冬季冰雪体验，适合冷季主题美食游。" },
      { city: "xian", name: "西安", image: "assets/scenery-4k/xian.jpg", text: "回民街、面食和古城夜景适合把历史参观与烟火小吃串起来。" },
      { city: "shanghai", name: "上海", image: "assets/scenery-4k/shanghai.jpg", text: "海派餐厅、咖啡街区和夜景路线，适合都市美食慢游。" },
      { city: "qingdao", name: "青岛", image: "assets/scenery-4k/qingdao.jpg", text: "海鲜、啤酒街和海岸建筑漫步，适合清爽的海滨美食路线。" },
      { city: "xiamen", name: "厦门", image: "assets/scenery-4k/xiamen.jpg", text: "沙坡尾、八市和鼓浪屿小店适合边逛边吃，节奏轻松。" },
    ],
  },
};

const recommendationCategoryProfiles = {
  culture: {
    kicker: "古城文化",
    title: "古城文化推荐",
    description: "算法会优先匹配古都、遗产、街巷、博物馆和历史建筑，筛出文化体验更集中的城市。",
    query: ["古城", "历史", "文化", "遗产", "城墙", "博物馆", "街巷", "建筑"],
    weights: { culture: 3.2, heritage: 2.5, architecture: 1.7, nature: 0.3, food: 0.4 },
  },
  nature: {
    kicker: "山水自然",
    title: "山水自然推荐",
    description: "算法会优先匹配山水、湖泊、峰林、雪山、湿地和适合拍照的自然景观。",
    query: ["山水", "自然", "湖泊", "峰林", "雪山", "湿地", "森林", "摄影"],
    weights: { nature: 3.2, scenery: 2.4, culture: 0.5, island: 0.8, food: 0.2 },
  },
  island: {
    kicker: "海岛度假",
    title: "海岛度假推荐",
    description: "算法会优先匹配海岸、沙滩、骑行、度假、海景和轻松短途体验。",
    query: ["海岛", "海滨", "沙滩", "海景", "度假", "骑行", "放松", "短途"],
    weights: { island: 3.4, scenery: 1.3, leisure: 2.1, culture: 0.3, food: 0.7 },
  },
  food: {
    kicker: "美食慢游",
    title: "美食慢游推荐",
    description: "算法会优先匹配小吃、夜景、街区、火锅、海鲜和适合边吃边逛的城市。",
    query: ["美食", "小吃", "夜景", "街区", "火锅", "海鲜", "慢游", "烟火"],
    weights: { food: 3.4, leisure: 1.8, culture: 0.8, island: 0.6, nature: 0.2 },
  },
};

const recommendationSearchIndex = [
  {
    city: "beijing",
    name: "北京",
    image: "assets/scenery-4k/beijing.jpg",
    text: "千年古都，故宫、长城、天安门等历史文化遗产荟萃，适合系统感受中华文明底蕴。",
    keywords: ["古都", "故宫", "长城", "天安门", "历史", "文化", "博物馆", "遗产"],
    features: { culture: 10, heritage: 10, architecture: 9, nature: 4, scenery: 5, island: 0, leisure: 4, food: 5 },
    popularity: 10,
  },
  {
    city: "xian",
    name: "西安",
    image: "assets/scenery-4k/xian.jpg",
    text: "十三朝古都，兵马俑震撼世界，古城墙见证历史风华，适合历史文化路线。",
    keywords: ["古都", "兵马俑", "城墙", "历史", "文化", "博物馆", "面食", "夜景"],
    features: { culture: 10, heritage: 10, architecture: 8, nature: 3, scenery: 4, island: 0, leisure: 5, food: 7 },
    popularity: 9,
  },
  {
    city: "nanjing",
    name: "南京",
    image: "assets/scenery-4k/nanjing.jpg",
    text: "金陵古城，秦淮河、明城墙和中山陵串起厚重又温柔的城市记忆。",
    keywords: ["金陵", "秦淮河", "明城墙", "中山陵", "历史", "夜景", "小吃", "街区"],
    features: { culture: 9, heritage: 8, architecture: 8, nature: 5, scenery: 6, island: 0, leisure: 7, food: 8 },
    popularity: 8,
  },
  {
    city: "suzhou",
    name: "苏州",
    image: "assets/scenery-4k/suzhou.jpg",
    text: "园林、水巷和老街交织，适合把江南文化放慢节奏细细看。",
    keywords: ["园林", "水巷", "江南", "古城", "文化", "慢游", "水景", "老街"],
    features: { culture: 8, heritage: 8, architecture: 8, nature: 7, scenery: 8, island: 2, leisure: 9, food: 6 },
    popularity: 8,
  },
  {
    city: "hangzhou",
    name: "杭州",
    image: "assets/scenery-4k/hangzhou.jpg",
    text: "人间天堂，西湖美景如诗如画，江南水乡的温婉与雅致尽在其中。",
    keywords: ["西湖", "湖泊", "江南", "茶园", "湿地", "自然", "慢游", "水景"],
    features: { culture: 7, heritage: 6, architecture: 5, nature: 9, scenery: 10, island: 3, leisure: 9, food: 7 },
    popularity: 9,
  },
  {
    city: "guilin",
    name: "桂林",
    image: "assets/scenery-4k/guilin.jpg",
    text: "山水甲天下，漓江风光秀美，喀斯特地貌奇特，适合自然风光路线。",
    keywords: ["山水", "漓江", "峰林", "喀斯特", "自然", "摄影", "游船", "水岸"],
    features: { culture: 3, heritage: 3, architecture: 2, nature: 10, scenery: 10, island: 4, leisure: 8, food: 5 },
    popularity: 9,
  },
  {
    city: "zhangjiajie",
    name: "张家界",
    image: "assets/scenery-4k/zhangjiajie.jpg",
    text: "峰林奇观、峡谷栈道和森林公园，适合徒步观景和自然摄影。",
    keywords: ["峰林", "森林", "峡谷", "栈道", "自然", "徒步", "摄影", "山景"],
    features: { culture: 2, heritage: 4, architecture: 1, nature: 10, scenery: 10, island: 0, leisure: 6, food: 3 },
    popularity: 8,
  },
  {
    city: "lijiang",
    name: "丽江",
    image: "assets/scenery-4k/lijiang.jpg",
    text: "古城、雪山和纳西风情融合，适合喜欢古镇街巷和人文拍照的人。",
    keywords: ["古城", "雪山", "纳西", "玉龙雪山", "街巷", "自然", "摄影", "慢游"],
    features: { culture: 8, heritage: 7, architecture: 6, nature: 9, scenery: 9, island: 1, leisure: 9, food: 6 },
    popularity: 8,
  },
  {
    city: "lhasa",
    name: "拉萨",
    image: "assets/scenery-4k/lhasa.jpg",
    text: "布达拉宫、大昭寺和八廓街适合慢节奏体验高原文化与信仰生活。",
    keywords: ["高原", "布达拉宫", "大昭寺", "八廓街", "文化", "信仰", "建筑", "山地"],
    features: { culture: 9, heritage: 9, architecture: 9, nature: 8, scenery: 8, island: 0, leisure: 5, food: 4 },
    popularity: 7,
  },
  {
    city: "sanya",
    name: "三亚",
    image: "assets/scenery-4k/sanya.jpg",
    text: "热带天堂，碧海蓝天、椰林沙滩，适合享受阳光海滩假期。",
    keywords: ["海岛", "沙滩", "海滨", "椰林", "度假", "放松", "海景", "热带"],
    features: { culture: 2, heritage: 1, architecture: 2, nature: 8, scenery: 9, island: 10, leisure: 10, food: 7 },
    popularity: 9,
  },
  {
    city: "xiamen",
    name: "厦门",
    image: "assets/scenery-4k/xiamen.jpg",
    text: "海上花园，鼓浪屿文艺浪漫，海滨风光旖旎，适合轻松短途游。",
    keywords: ["海滨", "鼓浪屿", "环岛路", "文艺", "短途", "骑行", "沙坡尾", "海景"],
    features: { culture: 7, heritage: 6, architecture: 6, nature: 6, scenery: 8, island: 9, leisure: 10, food: 8 },
    popularity: 8,
  },
  {
    city: "qingdao",
    name: "青岛",
    image: "assets/scenery-4k/qingdao.jpg",
    text: "海风、欧式建筑和城市海岸线结合，适合海边漫步和啤酒美食。",
    keywords: ["海滨", "海岸", "欧式建筑", "啤酒", "海鲜", "漫步", "建筑", "海景"],
    features: { culture: 6, heritage: 5, architecture: 8, nature: 7, scenery: 8, island: 8, leisure: 9, food: 9 },
    popularity: 8,
  },
  {
    city: "shanghai",
    name: "上海",
    image: "assets/scenery-4k/shanghai.jpg",
    text: "外滩建筑群和老街区保留海派文化脉络，适合都市历史漫步。",
    keywords: ["外滩", "海派", "夜景", "建筑", "咖啡", "都市", "滨江", "美食"],
    features: { culture: 7, heritage: 6, architecture: 10, nature: 3, scenery: 7, island: 5, leisure: 8, food: 8 },
    popularity: 9,
  },
  {
    city: "chengdu",
    name: "成都",
    image: "assets/scenery-4k/chengdu.jpg",
    text: "天府之国，大熊猫的故乡，美食之都，慢生活的代表。",
    keywords: ["美食", "火锅", "茶馆", "熊猫", "慢生活", "街巷", "小吃", "休闲"],
    features: { culture: 5, heritage: 4, architecture: 4, nature: 5, scenery: 6, island: 0, leisure: 10, food: 10 },
    popularity: 9,
  },
  {
    city: "chongqing",
    name: "重庆",
    image: "assets/scenery-4k/chongqing.jpg",
    text: "山城夜景、洪崖洞、长江索道和火锅，适合夜景与美食路线。",
    keywords: ["火锅", "夜景", "洪崖洞", "山城", "索道", "街巷", "小吃", "码头"],
    features: { culture: 7, heritage: 5, architecture: 7, nature: 6, scenery: 8, island: 0, leisure: 8, food: 10 },
    popularity: 9,
  },
  {
    city: "harbin",
    name: "哈尔滨",
    image: "assets/scenery-4k/harbin.jpg",
    text: "中央大街、俄式建筑和冬季冰雪体验，适合冷季主题美食游。",
    keywords: ["冰雪", "俄式建筑", "中央大街", "冬季", "美食", "夜景", "街区", "建筑"],
    features: { culture: 6, heritage: 5, architecture: 8, nature: 6, scenery: 7, island: 0, leisure: 7, food: 8 },
    popularity: 7,
  },
];

const recommendationCategoryPriority = {
  culture: ["beijing", "xian", "nanjing", "suzhou", "lhasa", "lijiang", "shanghai", "chongqing"],
  nature: ["guilin", "zhangjiajie", "hangzhou", "lijiang", "lhasa", "sanya", "qingdao", "suzhou"],
  island: ["sanya", "xiamen", "qingdao", "shanghai", "hangzhou", "guilin", "suzhou", "lijiang"],
  food: ["chengdu", "chongqing", "qingdao", "nanjing", "xian", "xiamen", "shanghai", "harbin"],
};

let recommendationSearchTimer = null;

const cityGuides = {
  beijing: {
    title: "北京",
    kicker: "历史文化之旅",
    summary: "故宫、长城、胡同和国家级博物馆串联起厚重的古都体验，适合第一次深度了解中国历史文化。",
    tags: ["3-5天", "历史古迹", "亲子友好"],
    tips: ["故宫建议提前预约，上午入园更从容。", "长城预留半天到一天，慕田峪体验更舒适。", "晚上可安排前门、什刹海或三里屯。"],
    attractions: [
      ["故宫博物院", "明清两代皇家宫殿群，中轴线、宫殿建筑和珍宝馆都值得慢慢看。", "提前预约，上午入园更从容。"],
      ["慕田峪长城", "山势开阔、城墙保存完整，适合第一次看长城。", "预留半天到一天，穿防滑鞋。"],
      ["天坛公园", "祈年殿和圜丘展现古代礼制建筑之美，公园本身也适合散步。", "清晨能看到更有生活气的北京。"],
      ["颐和园", "昆明湖、长廊和佛香阁结合皇家园林与湖山景色。", "傍晚湖边光线更柔和。"],
    ],
  },
  shanghai: {
    title: "上海",
    kicker: "都市夜景之旅",
    summary: "外滩、陆家嘴、武康路和苏河湾能看到海派建筑、现代天际线与城市漫步的丰富层次。",
    tags: ["2-4天", "城市漫步", "夜景"],
    tips: ["傍晚到外滩，等亮灯后看夜景。", "留半天走武康路、安福路一带。", "黄浦江两岸适合安排一晚。"],
    attractions: [
      ["外滩", "黄浦江沿岸经典建筑群，是上海最有辨识度的城市景观。", "傍晚抵达，等亮灯后看夜景。"],
      ["陆家嘴", "东方明珠、上海中心等高楼集中，可俯瞰城市天际线。", "晴天傍晚视野更好。"],
      ["武康路", "梧桐街道、老洋房和咖啡店密集，适合轻松漫步。", "避开周末正午人流。"],
      ["豫园", "江南园林与城隍庙商圈相邻，可体验传统街巷和小吃。", "夜间灯光更有氛围。"],
    ],
  },
  hangzhou: {
    title: "杭州",
    kicker: "湖山慢游之旅",
    summary: "西湖、灵隐寺、龙井村和京杭大运河适合组成轻松路线，既看自然风景，也感受江南生活。",
    tags: ["2-3天", "自然风光", "情侣慢游"],
    tips: ["清晨或傍晚绕西湖步行，光线更柔和。", "灵隐寺和飞来峰建议安排半天。", "想避开人流可以去九溪或龙井村。"],
    attractions: [
      ["西湖", "杭州最经典的湖山景观，苏堤、白堤、断桥和湖畔步道适合慢走。", "清晨或傍晚游览更舒服。"],
      ["灵隐寺", "寺院与飞来峰石刻相连，兼具宗教文化和山林环境。", "安排半天，不要赶时间。"],
      ["龙井村", "茶园、山路和村落构成安静的杭州另一面。", "春季茶园景色更好。"],
      ["京杭大运河", "沿线有桥西历史街区和运河夜景，可以感受杭州的市井生活。", "晚上坐船或沿河步行都合适。"],
    ],
  },
  chengdu: {
    title: "成都",
    kicker: "美食休闲之旅",
    summary: "把熊猫基地、宽窄巷子、人民公园和火锅串联起来，可以体验成都松弛又热闹的城市气质。",
    tags: ["3-4天", "美食", "熊猫"],
    tips: ["熊猫基地尽量早到，上午更活跃。", "留一顿正餐给火锅或串串。", "下午去人民公园喝茶更有成都感。"],
    attractions: [
      ["成都大熊猫繁育研究基地", "近距离观察大熊猫生活状态，是成都代表性景点。", "上午早点去，熊猫更活跃。"],
      ["宽窄巷子", "传统院落、茶馆和小吃集中，适合感受街巷氛围。", "下午到傍晚体验更完整。"],
      ["武侯祠与锦里", "三国文化与古街夜景相邻，可连在一起安排。", "晚上锦里灯光更好看。"],
      ["人民公园", "喝盖碗茶、看本地生活，是体验成都慢节奏的好地方。", "留一个下午不要排太满。"],
    ],
  },
  xian: {
    title: "西安",
    kicker: "古都探访之旅",
    summary: "兵马俑、古城墙、大雁塔和回民街构成清晰的文化路线，适合喜欢历史和夜游的人。",
    tags: ["3天", "古都", "博物馆"],
    tips: ["兵马俑建议请讲解，体验更完整。", "傍晚骑行古城墙更舒服。", "陕西历史博物馆需要提前预约。"],
    attractions: [
      ["秦始皇兵马俑", "世界级考古遗址，规模和细节都很震撼。", "建议请讲解，理解更完整。"],
      ["西安城墙", "保存完整的古城墙，可步行或骑行俯瞰老城。", "傍晚骑行体感更舒适。"],
      ["大雁塔", "唐代佛教建筑地标，周边夜景适合晚上安排。", "可与大唐不夜城连线。"],
      ["陕西历史博物馆", "馆藏丰富，适合系统了解周秦汉唐历史。", "热门日期要提前预约。"],
    ],
  },
  sanya: {
    title: "三亚",
    kicker: "海岛度假之旅",
    summary: "亚龙湾、蜈支洲岛、椰梦长廊和南山文化旅游区适合按轻松节奏安排海岛假日。",
    tags: ["3-5天", "海滨", "度假"],
    tips: ["海岛项目尽量安排在天气稳定的上午。", "傍晚去椰梦长廊看日落。", "留半天只在酒店或海边放空。"],
    attractions: [
      ["亚龙湾", "沙滩细软、海水清澈，适合游泳和酒店度假。", "上午海面通常更稳定。"],
      ["蜈支洲岛", "海岛项目丰富，适合潜水和看玻璃海。", "关注天气，提前订船票。"],
      ["椰梦长廊", "沿海椰林步道，是三亚看日落的经典地点。", "傍晚抵达最合适。"],
      ["南山文化旅游区", "以海上观音和滨海景观闻名，适合半日游。", "景区较大，注意防晒。"],
    ],
  },
  guilin: {
    title: "桂林",
    kicker: "山水摄影之旅",
    summary: "漓江、阳朔、遇龙河和象鼻山集中呈现喀斯特山水，适合自然风光和摄影路线。",
    tags: ["3-4天", "山水", "摄影"],
    tips: ["漓江游船或竹筏提前确认码头。", "阳朔适合住一晚，节奏更从容。", "遇龙河漂流尽量避开正午强光。"],
    attractions: [
      ["漓江", "江面、峰林和倒影构成经典山水画面。", "游船或竹筏都建议提前确认码头。"],
      ["阳朔西街", "餐饮、酒吧和民宿集中，适合作为山水游停留点。", "住一晚节奏更从容。"],
      ["遇龙河", "河道更安静，竹筏漂流能近距离感受田园山水。", "避开正午强光。"],
      ["象鼻山", "桂林城市地标，适合短时间游览。", "可作为市区第一站。"],
    ],
  },
  xiamen: {
    title: "厦门",
    kicker: "海滨文艺之旅",
    summary: "鼓浪屿、环岛路、沙坡尾和集美学村适合轻松短途游，城市气质清爽又文艺。",
    tags: ["2-3天", "海滨", "文艺街区"],
    tips: ["鼓浪屿船票要提前确认时间。", "环岛路适合骑行或傍晚散步。", "沙坡尾适合咖啡、拍照和小吃。"],
    attractions: [
      ["鼓浪屿", "岛上有万国建筑、巷道和海岸景色，是厦门经典慢游地。", "船票和登岛时间提前确认。"],
      ["环岛路", "沿海骑行和散步都舒服，能看到厦门海滨气质。", "傍晚风景和体感更好。"],
      ["沙坡尾", "老港口与文艺店铺结合，适合拍照、咖啡和小吃。", "下午到晚上更热闹。"],
      ["集美学村", "嘉庚建筑风格鲜明，校园与海景结合。", "与地铁或BRT搭配更方便。"],
    ],
  },
  chongqing: {
    title: "重庆",
    kicker: "山城烟火之旅",
    summary: "洪崖洞、长江索道、解放碑和山城步道串成很有记忆点的立体城市路线。",
    tags: ["3天", "夜景", "火锅"],
    tips: ["傍晚坐长江索道，看两江夜色。", "安排一顿地道火锅或江湖菜。", "山城步道适合慢慢走，不要排太满。"],
    attractions: [
      ["洪崖洞", "吊脚楼建筑与两江夜景结合，是重庆夜游地标。", "夜间人多，尽量错峰拍照。"],
      ["长江索道", "横跨长江的空中交通体验，可看到山城立体感。", "傍晚乘坐更适合看景。"],
      ["解放碑", "核心商圈，餐饮、步行街和周边景点集中。", "适合作为市区行程起点。"],
      ["山城步道", "沿坡道、老街和观景点行走，能感受城市层次。", "穿舒适鞋，慢慢走。"],
    ],
  },
  nanjing: {
    title: "南京",
    kicker: "金陵文化之旅",
    summary: "中山陵、明孝陵、夫子庙秦淮河和老门东能看到古都气质与日常烟火。",
    tags: ["2-3天", "古都", "秦淮夜游"],
    tips: ["中山陵和明孝陵建议同一天安排。", "晚上去秦淮河和夫子庙更有氛围。", "老门东适合小吃和街区漫步。"],
    attractions: [
      ["中山陵", "南京标志性纪念建筑，台阶、轴线和山林环境很有仪式感。", "可与明孝陵同日安排。"],
      ["夫子庙秦淮河", "夜游秦淮可看到灯影、水巷和金陵烟火气。", "晚上氛围更浓。"],
      ["明孝陵", "明代皇家陵寝，神道石像和秋色尤其有辨识度。", "景区较大，预留时间。"],
      ["老门东", "传统街巷、小吃和手作店集中，适合慢慢逛。", "可和中华门城墙连线。"],
    ],
  },
  suzhou: {
    title: "苏州",
    kicker: "园林水巷之旅",
    summary: "拙政园、留园、平江路和山塘街适合安排安静精致的江南周末。",
    tags: ["2天", "园林", "水乡"],
    tips: ["园林建议上午参观，光线和人流更友好。", "平江路适合步行和喝茶。", "晚上可以去山塘街看灯影水巷。"],
    attractions: [
      ["拙政园", "苏州园林代表，水面、亭台和借景布局都很经典。", "上午参观体验更好。"],
      ["平江路", "沿河老街保留江南生活气息，适合步行和喝茶。", "慢慢走，不必赶路。"],
      ["留园", "空间变化丰富，假山、廊道和厅堂适合细看。", "与拙政园错开时间。"],
      ["山塘街", "灯影和水巷是苏州夜游的经典画面。", "傍晚到夜间更有氛围。"],
    ],
  },
  qingdao: {
    title: "青岛",
    kicker: "海滨漫游之旅",
    summary: "栈桥、八大关、五四广场、奥帆中心和啤酒街覆盖海风、建筑与美食。",
    tags: ["2-4天", "海滨", "建筑漫步"],
    tips: ["八大关适合上午或傍晚慢走。", "奥帆中心和五四广场可安排夜景。", "海鲜和啤酒街建议留一晚。"],
    attractions: [
      ["栈桥", "伸向海面的经典地标，是青岛海滨印象的起点。", "清晨人少，拍照更干净。"],
      ["八大关", "林荫道路和各式建筑集中，适合慢走和拍照。", "上午或傍晚光线更好。"],
      ["奥帆中心", "现代海湾、帆船和城市夜景结合。", "可与五四广场连线。"],
      ["崂山", "山海相连的自然景区，适合看青岛海岸线另一面。", "建议安排一整天。"],
    ],
  },
  lijiang: {
    title: "丽江",
    kicker: "古城雪山之旅",
    summary: "丽江古城、束河古镇、玉龙雪山和蓝月谷适合慢游、拍照与自然风景结合。",
    tags: ["3-5天", "古城", "雪山"],
    tips: ["玉龙雪山注意提前预约、保暖和高反。", "古城清晨更安静，夜晚更热闹。", "束河古镇适合留半天慢逛。"],
    attractions: [
      ["丽江古城", "石板路、水渠和纳西院落交织，适合慢逛和住一晚。", "清晨更安静，夜晚更热闹。"],
      ["玉龙雪山", "雪山、索道和高海拔景观构成震撼自然体验。", "提前预约，注意保暖和高反。"],
      ["束河古镇", "比大研古城更安静，适合喝茶、散步和拍照。", "留半天慢逛比较合适。"],
      ["蓝月谷", "湖水颜色清亮，雪山背景下很适合拍照。", "常与玉龙雪山同日安排。"],
    ],
  },
  zhangjiajie: {
    title: "张家界",
    kicker: "峰林奇观之旅",
    summary: "国家森林公园、天门山、玻璃栈道和大峡谷能看到独特的峰林地貌。",
    tags: ["3-4天", "自然奇观", "徒步"],
    tips: ["森林公园面积大，建议拆成两天。", "天门山受天气影响大，出发前看云雾情况。", "穿舒适鞋，减少赶路。"],
    attractions: [
      ["张家界国家森林公园", "石英砂岩峰林密集，是张家界核心自然景区。", "面积很大，建议安排两天。"],
      ["天门山", "索道、天门洞和山顶栈道组成高辨识度体验。", "天气影响大，出发前看云雾。"],
      ["大峡谷玻璃桥", "峡谷景观与高空玻璃桥结合，适合刺激体验。", "恐高者谨慎选择。"],
      ["袁家界", "峰柱景观集中，观景台视野开阔。", "旺季尽量错峰上山。"],
    ],
  },
  harbin: {
    title: "哈尔滨",
    kicker: "冰雪冬游之旅",
    summary: "冰雪大世界、中央大街、圣索菲亚教堂和松花江活动组成完整冬季体验。",
    tags: ["3天", "冰雪", "冬季限定"],
    tips: ["冰雪大世界建议下午入园，亮灯后继续游玩。", "保暖装备要准备充分。", "中央大街适合安排餐饮和建筑漫步。"],
    attractions: [
      ["冰雪大世界", "大型冰雕、雪雕和灯光建筑集中，是冬季核心体验。", "下午入园，亮灯后继续游玩。"],
      ["中央大街", "俄式建筑和老字号集中，适合建筑漫步与美食打卡。", "冬天注意防滑和保暖。"],
      ["圣索菲亚教堂", "哈尔滨标志性建筑，广场和夜景适合拍照。", "可与中央大街同日安排。"],
      ["松花江", "冬季江面活动丰富，夏季也适合沿江散步。", "冰面项目选择正规区域。"],
    ],
  },
  lhasa: {
    title: "拉萨",
    kicker: "高原文化之旅",
    summary: "布达拉宫、大昭寺、八廓街和罗布林卡适合慢节奏体验高原文化。",
    tags: ["4-6天", "高原", "文化"],
    tips: ["初到拉萨先适应海拔，第一天不要剧烈活动。", "布达拉宫需要提前预约。", "八廓街适合慢走，尊重当地习俗。"],
    attractions: [
      ["布达拉宫", "拉萨最重要的地标，宫殿建筑、壁画和高原城市视野都很震撼。", "提前预约，控制游览节奏。"],
      ["大昭寺", "藏传佛教重要寺院，周边转经人流展现拉萨日常信仰生活。", "尊重当地习俗，保持安静。"],
      ["八廓街", "围绕大昭寺的传统街区，适合慢走和体验本地生活。", "第一天可轻量安排。"],
      ["罗布林卡", "园林式宫苑，环境舒缓，适合作为市区慢游补充。", "适合下午轻松游览。"],
    ],
  },
};

const cityAliases = {
  北京: "beijing",
  上海: "shanghai",
  杭州: "hangzhou",
  成都: "chengdu",
  西安: "xian",
  三亚: "sanya",
  桂林: "guilin",
  厦门: "xiamen",
  重庆: "chongqing",
  南京: "nanjing",
  苏州: "suzhou",
  青岛: "qingdao",
  丽江: "lijiang",
  张家界: "zhangjiajie",
  哈尔滨: "harbin",
  拉萨: "lhasa",
  台州: "taizhou",
};

const extraGuides = {
  taizhou: {
    title: "台州",
    kicker: "山海古城之旅",
    summary: "台州既有临海古城、天台山，也有温岭石塘、大陈岛等海滨风光，适合山海结合的三日游。",
    attractions: [["台州府城墙", "江南保存较完整的古城墙之一，适合临海古城漫步。"], ["紫阳街", "临海老街，小吃和古城烟火气集中。"], ["天台山国清寺", "天台宗祖庭，寺院古朴清幽。"], ["温岭石塘", "海岸线、石屋和千年曙光园组成海滨风情。"]],
  },
};

const cityDetails = Object.fromEntries(
  Object.entries(cityGuides).map(([key, guide]) => [
    key,
    {
      title: guide.title,
      kicker: guide.kicker,
      image: `assets/scenery-4k/${key}.jpg`,
      alt: `${guide.title}4K风景照`,
      summary: guide.summary,
      tags: guide.tags,
      tips: guide.tips,
    },
  ]),
);

const cityAttractionDetails = Object.fromEntries(
  Object.entries(cityGuides).map(([key, guide]) => [
    key,
    {
      image: `assets/scenery-4k/${key}.jpg`,
      alt: `${guide.title}4K风景照`,
      attractions: guide.attractions.map(([name, description, tip]) => ({ name, description, tip })),
    },
  ]),
);

let activeCityKey = "";
let chatIsStreaming = false;
let lastCityKey = "";

function setDialogImage(cityKey, detail, attractionDetail) {
  activeCityKey = cityKey;
  dialogImage.src = attractionDetail?.image || detail.image;
  dialogImage.alt = attractionDetail?.alt || detail.alt;
}

function createAttractionItem(attraction) {
  const item = document.createElement("li");
  const title = document.createElement("h4");
  const description = document.createElement("p");
  const tip = document.createElement("span");

  title.textContent = attraction.name;
  description.textContent = attraction.description;
  tip.textContent = attraction.tip || "建议结合当天交通和体力灵活安排。";

  item.append(title, description, tip);
  return item;
}

function headerHeight() {
  return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
}

function scrollToTarget(target) {
  window.scrollTo({
    top: Math.max(0, target.offsetTop - headerHeight() - 18),
    behavior: "smooth",
  });
}

function scoreRecommendation(item, profile, category) {
  const featureScore = Object.entries(profile.weights).reduce((total, [feature, weight]) => {
    return total + (item.features[feature] || 0) * weight;
  }, 0);

  const keywordScore = profile.query.reduce((total, keyword) => {
    return total + (item.keywords.includes(keyword) || item.text.includes(keyword) ? 6 : 0);
  }, 0);

  const priority = recommendationCategoryPriority[category] || [];
  const priorityIndex = priority.indexOf(item.city);
  const priorityScore = priorityIndex === -1 ? 0 : (priority.length - priorityIndex) * 12;
  const categoryFit = (item.features[category] || 0) * 2.2;
  const contentScore = Math.min(item.text.length / 18, 5);
  return featureScore + keywordScore + priorityScore + categoryFit + item.popularity * 1.15 + contentScore;
}

function searchRecommendations(category) {
  const profile = recommendationCategoryProfiles[category] || recommendationCategoryProfiles.culture;
  return recommendationSearchIndex
    .map((item) => ({
      ...item,
      score: scoreRecommendation(item, profile, category),
    }))
    .sort((a, b) => b.score - a.score);
}

function optimizeRecommendationResults(results) {
  const selected = [];
  const seen = new Set();

  for (const item of results) {
    if (seen.has(item.city)) continue;
    seen.add(item.city);
    selected.push(item);
    if (selected.length >= 8) break;
  }

  return selected;
}

function recommendationCardTemplate(item) {
  return `
    <a class="recommendation-card" href="#city-${item.city}" data-city="${item.city}">
      <span class="recommendation-media">
        <img src="${item.image}" alt="${item.name}4K风景照" loading="lazy" />
        <span class="recommendation-location">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          ${item.name}
        </span>
      </span>
      <span class="recommendation-copy"><p>${item.text}</p></span>
    </a>
  `;
}

function setRecommendationSearching(isSearching) {
  recommendationSection?.setAttribute("aria-busy", String(isSearching));
  recommendationGrid?.classList.toggle("is-searching", isSearching);
  recommendationButtons.forEach((button) => {
    button.disabled = isSearching;
  });
}

function renderRecommendations(category = "culture", shouldScroll = false) {
  const group = recommendationCategoryProfiles[category] || recommendationCategoryProfiles.culture;
  const results = optimizeRecommendationResults(searchRecommendations(category));
  if (!recommendationGrid) return;

  setRecommendationSearching(false);
  recommendationKicker.textContent = group.kicker;
  recommendationTitle.textContent = group.title;
  recommendationDescription.textContent = group.description;
  recommendationGrid.innerHTML = results.map(recommendationCardTemplate).join("");

  recommendationButtons.forEach((button) => {
    const isActive = button.dataset.recommendationCategory === category;
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (shouldScroll && recommendationSection) scrollToTarget(recommendationSection);
}

function requestRecommendations(category = "culture", shouldScroll = false) {
  window.clearTimeout(recommendationSearchTimer);
  setRecommendationSearching(true);
  recommendationSearchTimer = window.setTimeout(() => {
    renderRecommendations(category, shouldScroll);
  }, 320);
}

function openCity(cityKey) {
  const detail = cityDetails[cityKey];
  const attractionDetail = cityAttractionDetails[cityKey];
  if (!detail || !cityDialog) return;

  setDialogImage(cityKey, detail, attractionDetail);
  dialogKicker.textContent = detail.kicker;
  dialogTitle.textContent = detail.title;
  dialogSummary.textContent = detail.summary;
  dialogMeta.replaceChildren(...detail.tags.map((tag) => Object.assign(document.createElement("span"), { textContent: tag })));
  dialogList.replaceChildren(...(attractionDetail?.attractions || []).map(createAttractionItem));
  dialogList.scrollTop = 0;

  if (typeof cityDialog.showModal === "function") {
    if (!cityDialog.open) cityDialog.showModal();
    cityDialog.querySelector(".dialog-body")?.scrollTo({ top: 0 });
    history.replaceState(null, "", `#city-${cityKey}`);
    return;
  }

  window.location.hash = `city-${cityKey}`;
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const cityKey = link.dataset.city;
    const targetId = link.getAttribute("href")?.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;

    if (cityKey) {
      event.preventDefault();
      openCity(cityKey);
      return;
    }

    if (target) {
      event.preventDefault();
      scrollToTarget(target);
      history.pushState(null, "", `#${targetId}`);
    }
  });
});

recommendationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    requestRecommendations(button.dataset.recommendationCategory, true);
  });
});

recommendationGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-city]");
  if (!card) return;
  event.preventDefault();
  openCity(card.dataset.city);
});

dialogClose?.addEventListener("click", () => cityDialog?.close());
cityDialog?.addEventListener("click", (event) => {
  if (event.target === cityDialog) cityDialog.close();
});
cityDialog?.addEventListener("close", () => {
  if (window.location.hash.startsWith("#city-")) history.replaceState(null, "", window.location.pathname);
});

function applyInitialHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  if (hash.startsWith("city-")) {
    openCity(hash.replace("city-", ""));
    return;
  }
  if (hash === "chat") openChatPanel();
}

function addChatMessage(role, text = "") {
  const message = document.createElement("div");
  const bubble = document.createElement("div");
  message.className = `chat-message chat-message-${role}`;
  bubble.className = "chat-bubble";
  bubble.textContent = text;
  message.append(bubble);
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

function updateChatInputState() {
  chatForm?.classList.toggle("has-input", Boolean(chatInput?.value.length));
}

function openChatPanel() {
  if (!chatPanel || !chatButton) return;
  chatPanel.hidden = false;
  chatButton.setAttribute("aria-expanded", "true");
  chatInput?.focus();
  if (!chatMessages.dataset.ready) {
    addChatMessage("bot", "嗨嗨～👋 看到你好开心呀！今天是想聊聊旅行计划，还是需要我推荐一些超棒的目的地呢？");
    chatMessages.dataset.ready = "true";
  }
}

function closeChatPanel() {
  if (!chatPanel || !chatButton) return;
  chatPanel.hidden = true;
  chatButton.setAttribute("aria-expanded", "false");
}

function findCityKey(text) {
  return Object.entries(cityAliases).find(([name]) => text.includes(name))?.[1] || "";
}

function parseDays(text) {
  const match = text.match(/(\d+)\s*天/);
  return match ? Number(match[1]) : 3;
}

function getProvinceKnowledge() {
  return Array.isArray(globalThis.chinaProvinceScenicKnowledge) ? globalThis.chinaProvinceScenicKnowledge : [];
}

function getAttractionDetailKnowledge() {
  return Array.isArray(globalThis.travelAttractionKnowledge) ? globalThis.travelAttractionKnowledge : [];
}

function getAttractionKnowledgeBase() {
  const items = new Map();

  getAttractionDetailKnowledge().forEach((item) => {
    items.set(`${item.name}-${item.city || ""}`, {
      ...item,
      source: "detail",
      summary: item.intro || item.summary,
    });
  });

  getProvinceKnowledge().forEach((region) => {
    region.attractions?.forEach((attraction) => {
      const key = `${attraction.name}-${attraction.city || region.region}`;
      if (items.has(key)) return;
      items.set(key, {
        name: attraction.name,
        aliases: [],
        city: attraction.city,
        region: region.region,
        category: attraction.category,
        summary: attraction.summary,
        intro: attraction.summary,
        tips: attraction.tips,
        bestTime: region.season,
        foods: region.foods,
        source: "province",
      });
    });
  });

  Object.values(cityGuides).forEach((guide) => {
    guide.attractions.forEach(([name, summary, tip]) => {
      const key = `${name}-${guide.title}`;
      if (items.has(key)) return;
      items.set(key, {
        name,
        aliases: [],
        city: guide.title,
        region: guide.title,
        category: guide.kicker,
        summary,
        intro: summary,
        tips: tip,
        bestTime: guide.tags?.[0] || "",
        source: "city",
      });
    });
  });

  return [...items.values()];
}

function findRegionKnowledge(question) {
  return getProvinceKnowledge().find((region) => {
    return question.includes(region.region) || region.aliases?.some((alias) => question.includes(alias));
  });
}

function scoreAttraction(item, question) {
  const text = `${item.name} ${item.aliases?.join(" ") || ""} ${item.city || ""} ${item.region || ""} ${item.category || ""} ${item.summary || ""}`;
  let score = 0;

  if (question.includes(item.name)) score += 120;
  if (item.aliases?.some((alias) => question.includes(alias))) score += 110;
  if (item.city && question.includes(item.city)) score += 28;
  if (item.region && question.includes(item.region)) score += 18;
  if (item.category && question.includes(item.category)) score += 16;

  ["古城", "历史", "文化", "海边", "海岛", "山水", "自然", "亲子", "美食", "夜景", "拍照", "徒步", "博物馆"].forEach((keyword) => {
    if (question.includes(keyword) && text.includes(keyword)) score += 8;
  });

  return score;
}

function findAttractionMatches(question, limit = 5) {
  return getAttractionKnowledgeBase()
    .map((item) => ({ ...item, score: scoreAttraction(item, question) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function findAttractionMatchesFromKnowledge(question, limit = 5) {
  if (typeof TravelKnowledgeDB !== "undefined") {
    try {
      const matches = await TravelKnowledgeDB.searchAttractions(question, limit);
      if (matches.length) return matches;
    } catch {
      // Fall back to in-memory knowledge below.
    }
  }

  return findAttractionMatches(question, limit);
}

async function findRegionKnowledgeFromDB(question) {
  if (typeof TravelKnowledgeDB !== "undefined") {
    try {
      const region = await TravelKnowledgeDB.findRegion(question);
      if (region) return region;
    } catch {
      // Fall back to in-memory knowledge below.
    }
  }

  return findRegionKnowledge(question);
}

function buildAttractionAnswer(item) {
  const highlights = item.highlights?.length
    ? item.highlights.map((highlight) => `- ${highlight}`).join("\n")
    : `- ${item.summary || item.intro}\n- 适合结合${item.category || "当地特色"}安排半日到一日游`;
  const nearby = item.nearby?.length ? `\n\n### 顺路搭配\n${item.nearby.map((name) => `- ${name}`).join("\n")}` : "";
  const foods = item.foods?.length ? `\n\n### 当地美食\n${item.foods.slice(0, 4).map((name) => `- ${name}`).join("\n")}` : "";

  return `当然可以～下面是 **${item.name}** 的景点介绍：\n\n### 基本印象\n${item.intro || item.summary}\n\n### 适合看什么\n${highlights}\n\n### 游玩建议\n- 所在地：${[item.region, item.city].filter(Boolean).join(" / ") || "国内景区"}\n- 类型：${item.category || "综合景区"}\n- 推荐时间：${item.bestTime || "建议结合季节和天气安排"}\n- 小贴士：${item.tips || "出发前确认开放时间、交通方式和当天客流"}${nearby}${foods}\n\n如果你要去这里，我也可以继续帮你安排“半日游、1日游、亲子游、情侣游或拍照路线”。`;
}

function buildCityAttractionAnswer(cityKey) {
  const guide = cityGuides[cityKey] || extraGuides[cityKey];
  if (!guide) return "";
  lastCityKey = cityKey;

  const provinceMatches = getAttractionKnowledgeBase()
    .filter((item) => item.city?.includes(guide.title) || item.region === guide.title)
    .slice(0, 6);
  const guideItems = guide.attractions.map(([name, summary, tip]) => ({ name, summary, tips: tip }));
  const merged = [...guideItems, ...provinceMatches].filter((item, index, arr) => {
    return arr.findIndex((candidate) => candidate.name === item.name) === index;
  }).slice(0, 8);

  return `可以呀～${guide.title}比较值得看的景点我给你整理好了：\n\n${merged.map((item, index) => `${index + 1}. **${item.name}**：${item.summary || item.intro}${item.tips ? `\n   小贴士：${item.tips}` : ""}`).join("\n")}\n\n如果你想继续细化，可以直接问“${guide.title}2天怎么玩”“${guide.title}情侣路线”“介绍${merged[0]?.name || "某个景点"}”。`;
}

function buildRegionAttractionAnswer(region) {
  const attractions = region.attractions.slice(0, 8);
  return `${region.region}的景点知识库我已经整理到问答里了，适合优先看这些：\n\n${attractions.map((item, index) => `${index + 1}. **${item.name}**（${item.city}）：${item.summary}\n   小贴士：${item.tips}`).join("\n")}\n\n### 旅行季节\n${region.season}\n\n### 可以顺便尝尝\n${region.foods.slice(0, 5).join("、")}`;
}

function buildRoute(guide, days, preference = "") {
  const spots = guide.attractions.map(([name]) => name);
  const tips = guide.tips?.length ? guide.tips : ["热门景点建议提前确认开放时间和预约要求。", "景点之间距离较远时，优先按区域顺路安排。", "如果天气变化明显，可以把室外景点和室内展馆互相替换。"];
  const dayLines = Array.from({ length: days }, (_, index) => {
    const a = spots[(index * 2) % spots.length];
    const b = spots[(index * 2 + 1) % spots.length];
    const night = index === days - 1 ? "整理行李，按返程时间轻松收尾" : "安排夜景、老街或当地美食";
    return `#### 第${index + 1}天\n- **上午**：前往${a}，先看最有代表性的景观。\n- **下午**：继续游览${b}，把自然风光或人文体验补完整。\n- **晚上**：${night}。`;
  }).join("\n\n");

  return `哇塞🥰 ${guide.title}很适合${preference || "轻松旅行"}，我按${days}天给你整理一版路线～\n\n### 经典${days}日游路线\n${dayLines}\n\n### 其他景点推荐\n${guide.attractions.map(([name, description]) => `- **${name}**：${description}`).join("\n")}\n\n### 旅行小贴士\n${tips.map((tip) => `- ${tip}`).join("\n")}\n\n如果你想继续细化，我可以再按“情侣游、亲子游、美食游、预算、省力路线”继续调整。`;
}

function buildCityAnswer(cityKey, question) {
  const guide = cityGuides[cityKey] || extraGuides[cityKey];
  if (!guide) return "";
  lastCityKey = cityKey;
  const days = /(\d+)\s*天/.test(question) ? parseDays(question) : 3;
  const preference = question.includes("情侣") ? "情侣慢游" : question.includes("亲子") ? "亲子旅行" : question.includes("美食") ? "美食游" : "";
  return buildRoute(guide, days, preference);
}

function buildClarificationAnswer() {
  return "我还需要更多信息，才能安排得更准确一点哦～😊\n\n你可以按这个格式告诉我：\n- 想去的城市：例如杭州、台州、绍兴、黄山、敦煌、喀什、广州、长沙等\n- 出行天数：例如2天、3天、5天\n- 偏好：历史文化、美食、亲子、海边、自然风光、拍照、轻松慢游";
}

async function getLocalModelFallback(question, context = {}) {
  if (typeof TravelLocalLLM === "undefined") return "";

  try {
    return await TravelLocalLLM.ask(question, context);
  } catch {
    return "";
  }
}

async function getBotResponse(question) {
  const normalized = question.replace(/\s+/g, "");
  const cityKey = findCityKey(question);
  const lastGuide = (lastCityKey && (cityGuides[lastCityKey] || extraGuides[lastCityKey])) || null;

  try {
    const realtimeAnswer = typeof TravelApis !== "undefined" ? await TravelApis.handleRealtimeIntent(question, {
      lastCityTitle: lastGuide?.title || "",
    }) : "";
    if (realtimeAnswer) return realtimeAnswer;
  } catch (error) {
    return `实时接口暂时没有获取成功，可能是网络、浏览器权限或接口限流导致的。\n\n你可以稍后再试，或者换成“杭州天气”“北京现在几点”“日元汇率”这种更明确的问法。`;
  }

  if (/^(你好|您好|嗨|hi|hello)$/i.test(normalized)) {
    return lastCityKey
      ? `嗨嗨～👋 又见面啦！今天是想继续聊${lastGuide?.title || "这个城市"}的深度玩法，还是想换一个城市？你可以直接说“2天 情侣”“亲子 3天”这种格式，我会接着上一次内容安排。`
      : "嗨嗨～👋 看到你好开心呀！今天是想聊聊旅行计划，还是需要我推荐一些超棒的目的地呢？无论是浪漫海岛、文化古城，还是美食天堂，我都能帮你找到旅行灵感哦！";
  }

  const attractionIntent = /景点|景区|介绍|怎么玩|值得|好玩吗|哪里好玩|游玩|攻略|推荐|看什么/.test(question);
  const attractionMatches = await findAttractionMatchesFromKnowledge(question);
  if (attractionMatches[0]?.score >= 80) {
    return buildAttractionAnswer(attractionMatches[0]);
  }

  if (cityKey && /景点|景区|哪里好玩|有哪些|推荐|看什么/.test(question)) {
    return buildCityAttractionAnswer(cityKey);
  }

  const regionKnowledge = await findRegionKnowledgeFromDB(question);
  if (regionKnowledge && /景点|景区|哪里好玩|有哪些|推荐|旅游|攻略|看什么/.test(question)) {
    return buildRegionAttractionAnswer(regionKnowledge);
  }

  if (attractionIntent && !cityKey && attractionMatches.length) {
    return buildAttractionAnswer(attractionMatches[0]);
  }

  if (cityKey) return buildCityAnswer(cityKey, question);

  if (lastGuide && /(\d+\s*天|情侣|亲子|美食|轻松|拍照|省力)/.test(question)) {
    return buildRoute(lastGuide, parseDays(question), question.includes("情侣") ? "情侣慢游" : question);
  }

  if (/海边|海岛|看海/.test(question)) {
    return "想看海的话，我会优先推荐三亚、厦门、青岛。三亚适合度假放空，厦门适合文艺短途，青岛适合海风建筑漫步。你告诉我出行天数和同行人，我可以继续细化路线。";
  }

  if (/古城|历史|文化/.test(question)) {
    return "偏历史文化的话，可以优先看北京、西安、南京、苏州、丽江。北京和西安更厚重，南京更适合城市慢游，苏州和丽江更适合古城街巷体验。";
  }

  const localAnswer = await getLocalModelFallback(question, {
    lastCityTitle: lastGuide?.title || "",
  });
  return localAnswer || buildClarificationAnswer();
}

function streamText(bubble, text) {
  chatIsStreaming = true;
  chatSend.disabled = true;
  bubble.classList.add("is-streaming");
  bubble.textContent = "";

  let index = 0;
  const step = () => {
    bubble.textContent += text[index] || "";
    index += 1;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (index < text.length) {
      window.setTimeout(step, text[index - 1] === "\n" ? 90 : 26);
      return;
    }

    bubble.classList.remove("is-streaming");
    chatIsStreaming = false;
    chatSend.disabled = false;
    chatInput?.focus();
  };
  step();
}

chatButton?.addEventListener("click", openChatPanel);
chatClose?.addEventListener("click", closeChatPanel);
chatInput?.addEventListener("input", updateChatInputState);

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (chatIsStreaming) return;

  const question = chatInput.value;
  if (!question.trim()) return;

  addChatMessage("user", question);
  chatInput.value = "";
  updateChatInputState();
  chatIsStreaming = true;
  chatSend.disabled = true;

  const thinkingBubble = addChatMessage("bot", "正在整理旅行灵感");
  thinkingBubble.classList.add("is-thinking");

  window.setTimeout(async () => {
    let response = "";
    try {
      response = await getBotResponse(question);
    } catch {
      response = "刚刚调用实时接口时出现了问题，我先保留原来的旅游路线能力。你可以稍后再试一次天气、时间、定位或汇率查询。";
    }
    thinkingBubble.classList.remove("is-thinking");
    streamText(thinkingBubble, response);
  }, 1000 + Math.round(Math.random() * 2000));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && chatPanel && !chatPanel.hidden) closeChatPanel();
});

window.addEventListener("load", () => {
  requestAnimationFrame(() => window.setTimeout(applyInitialHash, 80));
});
window.addEventListener("hashchange", applyInitialHash);

if (document.readyState !== "loading") {
  requestAnimationFrame(() => window.setTimeout(applyInitialHash, 80));
} else {
  document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => window.setTimeout(applyInitialHash, 80));
  });
}

updateChatInputState();
renderRecommendations();
