const TravelApis = (() => {
  const cityTimezoneFallback = {
    北京: "Asia/Shanghai",
    上海: "Asia/Shanghai",
    杭州: "Asia/Shanghai",
    成都: "Asia/Shanghai",
    西安: "Asia/Shanghai",
    三亚: "Asia/Shanghai",
    桂林: "Asia/Shanghai",
    厦门: "Asia/Shanghai",
    重庆: "Asia/Shanghai",
    南京: "Asia/Shanghai",
    苏州: "Asia/Shanghai",
    青岛: "Asia/Shanghai",
    丽江: "Asia/Shanghai",
    张家界: "Asia/Shanghai",
    哈尔滨: "Asia/Shanghai",
    拉萨: "Asia/Shanghai",
    台州: "Asia/Shanghai",
    东京: "Asia/Tokyo",
    首尔: "Asia/Seoul",
    曼谷: "Asia/Bangkok",
    新加坡: "Asia/Singapore",
    巴黎: "Europe/Paris",
    伦敦: "Europe/London",
    纽约: "America/New_York",
    洛杉矶: "America/Los_Angeles",
  };

  const currencyMap = {
    人民币: "CNY",
    美元: "USD",
    美金: "USD",
    日元: "JPY",
    韩元: "KRW",
    欧元: "EUR",
    英镑: "GBP",
    港币: "HKD",
    澳元: "AUD",
    泰铢: "THB",
    新币: "SGD",
    新加坡元: "SGD",
  };

  const weatherMap = {
    0: "晴朗",
    1: "大部晴朗",
    2: "局部多云",
    3: "阴天",
    45: "有雾",
    48: "雾凇",
    51: "小毛毛雨",
    53: "中等毛毛雨",
    55: "较强毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "阵雨",
    81: "中等阵雨",
    82: "强阵雨",
    95: "雷雨",
    96: "雷雨伴冰雹",
    99: "强雷雨伴冰雹",
  };

  function withTimeout(ms = 9000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), ms);
    return { controller, timer };
  }

  async function fetchJson(url, options = {}) {
    const { controller, timer } = withTimeout(options.timeout || 9000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`接口返回 ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function pickPlace(question, fallback = "") {
    const text = question.replace(/\s+/g, "");
    const knownCity = Object.keys(cityTimezoneFallback).find((name) => text.includes(name));
    if (knownCity) return knownCity;

    const match = text.match(/([\u4e00-\u9fa5]{2,12})(?:天气|气温|温度|下雨|降雨|风力|时间|几点)/);
    if (!match) return fallback;

    return match[1]
      .replace(/今天|明天|现在|当前|当地|实时|查询|看看/g, "")
      .replace(/我想知道|帮我查|查一下/g, "") || fallback;
  }

  function formatDateTime(date, timezone) {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }

  function formatTimeApiData(data, timezone) {
    if (data.date && data.time) return `${data.date} ${data.time}`;
    if (data.dateTime) return data.dateTime.replace("T", " ").slice(0, 19);
    return formatDateTime(new Date(), timezone);
  }

  async function geocodePlace(place) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=zh&format=json`;
    const data = await fetchJson(url);
    const result = data.results?.[0];
    if (!result) throw new Error(`没有找到“${place}”的位置数据`);
    return {
      name: result.name,
      country: result.country,
      admin1: result.admin1,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone || cityTimezoneFallback[place] || "Asia/Shanghai",
    };
  }

  function getBrowserPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("浏览器不支持定位"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 300000,
      });
    });
  }

  async function reverseGeocode(latitude, longitude) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`;
    const data = await fetchJson(url);
    return {
      name: data.city || data.locality || data.principalSubdivision || "当前位置",
      country: data.countryName || "",
      admin1: data.principalSubdivision || "",
      latitude,
      longitude,
      timezone: data.localityInfo?.informative?.find((item) => item.description === "time zone")?.name || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai",
    };
  }

  async function locateByIp() {
    const data = await fetchJson("https://ipwho.is/");
    if (data.success === false || !data.latitude || !data.longitude) throw new Error("IP 定位失败");
    return {
      name: data.city || data.region || "当前位置",
      country: data.country || "",
      admin1: data.region || "",
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai",
    };
  }

  async function getCurrentLocation() {
    try {
      const position = await getBrowserPosition();
      return await reverseGeocode(position.coords.latitude, position.coords.longitude);
    } catch {
      return locateByIp();
    }
  }

  async function getWeatherByLocation(location) {
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      forecast_days: "3",
      timezone: "auto",
    });
    const data = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    const current = data.current;
    const daily = data.daily;
    const weather = weatherMap[current.weather_code] || "天气变化";
    const lines = daily.time.map((date, index) => {
      const dayWeather = weatherMap[daily.weather_code[index]] || "天气变化";
      return `- ${date}：${dayWeather}，${Math.round(daily.temperature_2m_min[index])}℃-${Math.round(daily.temperature_2m_max[index])}℃，降雨概率 ${daily.precipitation_probability_max[index] ?? 0}%`;
    });

    const placeName = [location.admin1, location.name].filter(Boolean).join(" ");
    return `已接入实时天气接口，为你查到 ${placeName || "当前位置"} 的天气：\n\n当前：${weather}，气温 ${Math.round(current.temperature_2m)}℃，体感 ${Math.round(current.apparent_temperature)}℃，湿度 ${current.relative_humidity_2m}% ，风速 ${current.wind_speed_10m} km/h。\n\n未来3天：\n${lines.join("\n")}\n\n旅行建议：出门前再看一次临近预报；如果降雨概率高，景点优先安排室内馆、老街短线和交通更方便的区域。`;
  }

  async function getWeather(question, fallbackPlace = "") {
    const place = pickPlace(question, fallbackPlace);
    const location = /当前位置|本地|我这里|附近/.test(question) || !place
      ? await getCurrentLocation()
      : await geocodePlace(place);
    return getWeatherByLocation(location);
  }

  async function getTime(question, fallbackPlace = "") {
    const place = pickPlace(question, fallbackPlace) || "北京";
    let timezone = cityTimezoneFallback[place];

    if (!timezone) {
      try {
        timezone = (await geocodePlace(place)).timezone;
      } catch {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
      }
    }

    try {
      const data = await fetchJson(`https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(timezone)}`);
      return `${place} 当前时间：${formatTimeApiData(data, timezone)}。\n\n旅行建议：订票、预约景区和看日出日落时，最好按当地时间再核对一次。`;
    } catch {
      try {
        const data = await fetchJson(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`);
        return `${place} 当前时间：${formatDateTime(new Date(data.datetime), timezone)}。\n\n旅行建议：订票、预约景区和看日出日落时，最好按当地时间再核对一次。`;
      } catch {
        return `${place} 当前时间：${formatDateTime(new Date(), timezone)}。\n\n旅行建议：当前使用浏览器时间换算，订票和预约前建议再核对官方时间。`;
      }
    }
  }

  async function getLocationAnswer() {
    const location = await getCurrentLocation();
    const placeName = [location.country, location.admin1, location.name].filter(Boolean).join(" ");
    return `定位结果：你当前大致在 ${placeName || "当前位置"}。\n\n经纬度：${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}。\n\n我可以继续帮你查当前位置天气，或者按附近城市推荐适合今天出发的景点路线。`;
  }

  function pickCurrency(question) {
    const names = Object.keys(currencyMap).filter((name) => question.includes(name));
    if (names.length >= 2) return { from: currencyMap[names[0]], to: currencyMap[names[1]], fromName: names[0], toName: names[1] };
    if (names.length === 1) return { from: "CNY", to: currencyMap[names[0]], fromName: "人民币", toName: names[0] };
    return { from: "CNY", to: "USD,JPY,EUR,KRW,THB", fromName: "人民币", toName: "常用旅行货币" };
  }

  async function getCurrency(question) {
    const currency = pickCurrency(question);
    let ratesData = {};

    try {
      const data = await fetchJson(`https://api.frankfurter.app/latest?from=${currency.from}&to=${currency.to}`);
      ratesData = data.rates || {};
    } catch {
      const fallback = await fetchJson(`https://open.er-api.com/v6/latest/${currency.from}`);
      const targets = currency.to.split(",");
      ratesData = Object.fromEntries(targets.filter((code) => fallback.rates?.[code]).map((code) => [code, fallback.rates[code]]));
    }

    const rates = Object.entries(ratesData)
      .map(([code, value]) => `- 1 ${currency.from} ≈ ${Number(value).toFixed(4)} ${code}`)
      .join("\n");
    return `已接入汇率接口，当前 ${currency.fromName} 到 ${currency.toName} 的参考汇率：\n\n${rates}\n\n旅行建议：实际换汇和刷卡会包含手续费、买卖价差，出行预算建议预留 3%-8% 浮动。`;
  }

  async function handleRealtimeIntent(question, context = {}) {
    if (/天气|气温|温度|下雨|降雨|风力|穿衣/.test(question)) {
      return getWeather(question, context.lastCityTitle || "");
    }

    if (/现在几点|几点了|当前时间|当地时间|时差|时间/.test(question)) {
      return getTime(question, context.lastCityTitle || "");
    }

    if (/我在哪|当前位置|定位|附近/.test(question)) {
      return getLocationAnswer();
    }

    if (/汇率|换钱|人民币|美元|美金|日元|韩元|欧元|英镑|港币|澳元|泰铢|新币|新加坡元/.test(question)) {
      return getCurrency(question);
    }

    return "";
  }

  return {
    handleRealtimeIntent,
    getWeather,
    getTime,
    getCurrentLocation,
    getCurrency,
  };
})();
