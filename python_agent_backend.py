from __future__ import annotations

import json
import os
import re
import socket
import time
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

PROJECT_ROOT = Path(__file__).resolve().parent
KNOWLEDGE_PATH = PROJECT_ROOT / "data" / "travel_knowledge.json"

DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:4b")
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_ENDPOINT = os.environ.get("OLLAMA_ENDPOINT", f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate")
OLLAMA_TIMEOUT_MS = int(os.environ.get("OLLAMA_TIMEOUT_MS", "7000"))
NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search"
PHOTON_ENDPOINT = "https://photon.komoot.io/api/"
OSRM_ROUTE_ENDPOINT = "https://router.project-osrm.org/route/v1/driving"
HTTP_USER_AGENT = os.environ.get("TRAVEL_ASSISTANT_USER_AGENT", "travel-lingxi-ai/1.0")

GREETING_PATTERN = re.compile(r"^(你好|您好|hi|hello)\s*$", re.I)
FAREWELL_PATTERN = re.compile(
    r"^(谢谢|谢了|感谢|不用了|没了|没有了|先这样|就这样|结束|再见|拜拜|bye|goodbye)\s*$",
    re.I,
)
CITY_ROUTE_PATTERN = re.compile(r"(想去|去|到|玩|旅游|旅行|路线|安排|攻略|推荐)")
ATTRACTION_PATTERN = re.compile(r"(景点|景区|介绍|值得|好玩吗|怎么玩|游玩|攻略|推荐|看什么)")
LIST_PATTERN = re.compile(r"(有哪些|推荐|景点|景区|哪里好玩|看什么|旅游|攻略)")
DETAIL_PATTERN = re.compile(r"(介绍|是什么|值得|好玩吗|怎么玩|看什么)")
FOLLOWUP_ROUTE_PATTERN = re.compile(r"(\d+\s*天|情侣|亲子|美食|轻松|拍照|省力|半日|一日|路线|安排|怎么玩)")
MAP_INTENT_PATTERN = re.compile(r"(地图|位置|定位|导航|怎么走|距离|顺路|附近|方位|经纬度)")

_geo_cache: dict[str, dict[str, Any] | None] = {}
_last_nominatim_call = 0.0

KNOWN_COORDINATES = {
    "杭州": (30.2741, 120.1551),
    "西湖": (30.2460, 120.1431),
    "杭州西湖风景区": (30.2460, 120.1431),
    "灵隐寺": (30.2405, 120.1012),
    "西溪湿地": (30.2715, 120.0649),
    "西溪国家湿地公园": (30.2715, 120.0649),
    "西溪湿地旅游区": (30.2715, 120.0649),
    "龙井村": (30.2280, 120.0950),
    "河坊街": (30.2451, 120.1740),
    "宋城": (30.1716, 120.0929),
    "京杭大运河": (30.3180, 120.1500),
    "千岛湖风景区": (29.6080, 119.0510),
    "乌镇": (30.7460, 120.4930),
    "北京": (39.9042, 116.4074),
    "上海": (31.2304, 121.4737),
    "成都": (30.5728, 104.0668),
    "西安": (34.3416, 108.9398),
    "三亚": (18.2528, 109.5119),
    "桂林": (25.2736, 110.2900),
    "厦门": (24.4798, 118.0894),
}

CITY_ROUTE_SPOT_PRIORITIES = {
    "杭州": ["西湖", "灵隐寺", "龙井村", "河坊街", "西溪国家湿地公园", "京杭大运河", "宋城"],
    "北京": ["故宫博物院", "天坛公园", "颐和园", "慕田峪长城"],
    "上海": ["外滩", "陆家嘴", "武康路", "豫园"],
    "成都": ["成都大熊猫繁育研究基地", "宽窄巷子", "人民公园", "锦里"],
    "厦门": ["鼓浪屿", "环岛路", "沙坡尾", "集美学村"],
}

CITY_ROUTE_SPOT_SUMMARIES = {
    "西湖": "杭州最经典的湖山景观，适合步行、游船、拍照和夜景慢游。",
    "灵隐寺": "杭州代表性寺院和飞来峰石刻组合，适合感受山林与人文。",
    "龙井村": "龙井茶核心产地，茶园、村落和山路适合慢走与拍照。",
    "河坊街": "杭州老街区，小吃、伴手礼和夜间烟火气集中。",
    "西溪国家湿地公园": "湿地河道、芦苇和游船体验，适合放慢节奏看自然。",
    "京杭大运河": "桥西历史街区和运河水岸，适合晚上散步和城市慢游。",
    "宋城": "以宋文化和演艺为特色，适合补充夜间娱乐体验。",
}


def should_bypass_model(endpoint: str = OLLAMA_ENDPOINT) -> bool:
    if os.environ.get("DISABLE_LANGCHAIN_MODEL") == "true":
        return True
    if os.environ.get("VERCEL") == "1" and re.search(r"127\.0\.0\.1|localhost", endpoint):
        return True
    return False


@lru_cache(maxsize=1)
def load_knowledge() -> dict[str, Any]:
    with KNOWLEDGE_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache(maxsize=1)
def get_all_attractions() -> list[dict[str, Any]]:
    return load_knowledge().get("attractions", [])


@lru_cache(maxsize=1)
def get_regions() -> list[dict[str, Any]]:
    return load_knowledge().get("regions", [])


@lru_cache(maxsize=1)
def get_city_names() -> list[str]:
    cities = sorted(
        {str(item.get("city", "")).strip() for item in get_all_attractions() if item.get("city")},
        key=len,
        reverse=True,
    )
    return cities


def normalize_text(text: str) -> str:
    return str(text or "").strip()


def extract_tokens(query: str) -> list[str]:
    cleaned = re.sub(
        r"(我想去|想去|帮我|请问|哪里好玩|好玩吗|值得去吗|景点|景区|旅游|旅行|攻略|推荐|介绍|路线|安排)",
        " ",
        normalize_text(query),
    )
    return list(dict.fromkeys(re.findall(r"[\u4e00-\u9fffA-Za-z0-9]{2,}", cleaned)))


def parse_days(query: str, default: int = 3) -> int:
    matched = re.search(r"(\d+)\s*天", query)
    if not matched:
        return default
    return max(1, min(7, int(matched.group(1))))


def is_map_intent(question: str) -> bool:
    return bool(MAP_INTENT_PATTERN.search(question))


def get_preference_label(question: str) -> str:
    if "情侣" in question:
        return "情侣慢游"
    if "亲子" in question:
        return "亲子旅行"
    if "美食" in question:
        return "美食游"
    if "拍照" in question:
        return "拍照路线"
    if "海边" in question or "海岛" in question or "看海" in question:
        return "海边度假"
    if "历史" in question or "文化" in question:
        return "历史文化游"
    if "自然" in question or "山水" in question:
        return "自然风光游"
    if "省力" in question or "轻松" in question:
        return "轻松省力"
    return "轻松旅行"


def build_search_text(item: dict[str, Any]) -> str:
    parts = [
        item.get("name", ""),
        " ".join(item.get("aliases", []) or []),
        item.get("city", ""),
        item.get("region", ""),
        item.get("category", ""),
        item.get("summary", ""),
        item.get("intro", ""),
        " ".join(item.get("highlights", []) or []),
        " ".join(item.get("nearby", []) or []),
    ]
    return " ".join(part for part in parts if part)


def score_attraction(item: dict[str, Any], query: str) -> int:
    score = 0
    text = build_search_text(item)

    if item.get("name") and item["name"] in query:
        score += 140
    if any(alias in query or query in alias for alias in item.get("aliases", []) or []):
        score += 120
    if item.get("city") and item["city"] in query:
        score += 36
    if item.get("region") and item["region"] in query:
        score += 24
    if item.get("category") and item["category"] in query:
        score += 14

    for token in extract_tokens(query):
        if token in text:
            score += 18 if len(token) >= 4 else 9

    return score


def search_attractions(query: str, limit: int = 6) -> list[dict[str, Any]]:
    ranked: list[dict[str, Any]] = []
    for item in get_all_attractions():
        score = score_attraction(item, query)
        if score <= 0:
            continue
        ranked.append({**item, "score": score})
    ranked.sort(key=lambda row: row["score"], reverse=True)
    return ranked[:limit]


def find_attraction_by_exact_name(name: str, destination: str = "") -> dict[str, Any] | None:
    for item in get_all_attractions():
        item_name = str(item.get("name", ""))
        item_city = str(item.get("city", ""))
        if item_name == name and (not destination or destination in item_city or destination in item_name):
            return item
    for item in get_all_attractions():
        aliases = item.get("aliases", []) or []
        item_city = str(item.get("city", ""))
        if name in aliases and (not destination or destination in item_city):
            return item
    return None


def build_route_priority_item(name: str, destination: str) -> dict[str, Any]:
    found = find_attraction_by_exact_name(name, destination)
    if found:
        return found
    return {
        "name": name,
        "city": destination,
        "region": "",
        "category": "城市核心体验",
        "summary": CITY_ROUTE_SPOT_SUMMARIES.get(name, "适合纳入当地旅行路线的核心体验点。"),
        "tips": "建议结合实时交通和开放时间安排。",
        "source": "route-profile",
    }


def find_region(query: str) -> dict[str, Any] | None:
    for region in get_regions():
        region_name = region.get("region", "")
        aliases = region.get("aliases", []) or []
        if region_name and region_name in query:
            return region
        if any(alias in query for alias in aliases):
            return region
    return None


def find_city(question: str) -> str:
    for city in get_city_names():
        if city and city in question:
            return city
    return ""


def extract_destination(question: str, context: dict[str, Any]) -> str:
    city = find_city(question)
    if city:
        return city
    if context.get("lastAttractionName"):
        return str(context["lastAttractionName"])
    if context.get("lastCityTitle"):
        return str(context["lastCityTitle"])
    tokens = extract_tokens(question)
    return tokens[0] if tokens else "国内"


def unique_matches(items: list[dict[str, Any]], limit: int = 8) -> list[dict[str, Any]]:
    seen: set[tuple[str, str, str]] = set()
    result: list[dict[str, Any]] = []
    for item in items:
        key = (item.get("name", ""), item.get("city", ""), item.get("region", ""))
        if key in seen:
            continue
        seen.add(key)
        result.append(item)
        if len(result) >= limit:
            break
    return result


def format_place(item: dict[str, Any]) -> str:
    return " / ".join(part for part in [item.get("region"), item.get("city")] if part)


def format_item_label(item: dict[str, Any]) -> str:
    name = item.get("name", "景点")
    city = item.get("city", "")
    region = item.get("region", "")
    if city:
        return f"**{name}**（{city}）"
    if region:
        return f"**{name}**（{region}）"
    return f"**{name}**"


def format_item_summary(item: dict[str, Any]) -> str:
    return item.get("summary") or item.get("intro") or "适合纳入当地旅行路线"


def format_item_tip(item: dict[str, Any]) -> str:
    return item.get("tips") or "建议提前确认开放时间、预约要求和交通方式"


def fetch_json(url: str, timeout: float = 4.0) -> Any:
    request = Request(
        url,
        headers={
            "User-Agent": HTTP_USER_AGENT,
            "Accept": "application/json",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def geocode_place(name: str, city: str = "", region: str = "") -> dict[str, Any] | None:
    global _last_nominatim_call

    query = " ".join(part for part in [name, city, region, "中国"] if part)
    if query in _geo_cache:
        return _geo_cache[query]

    if name in KNOWN_COORDINATES:
        lat, lon = KNOWN_COORDINATES[name]
        result = {"name": name, "display_name": name, "lat": lat, "lon": lon}
        _geo_cache[query] = result
        return result

    photon_params = urlencode({
        "q": query,
        "limit": "1",
        "lang": "en",
    })
    try:
        photon = fetch_json(f"{PHOTON_ENDPOINT}?{photon_params}", timeout=4)
        feature = (photon.get("features") or [None])[0]
        if feature:
            lon, lat = feature["geometry"]["coordinates"]
            result = {
                "name": name,
                "display_name": feature.get("properties", {}).get("name", name),
                "lat": float(lat),
                "lon": float(lon),
            }
            _geo_cache[query] = result
            return result
    except (HTTPError, URLError, TimeoutError, socket.timeout, json.JSONDecodeError, KeyError, TypeError):
        pass

    params = urlencode({
        "q": query,
        "format": "jsonv2",
        "limit": "1",
        "accept-language": "zh-CN",
    })
    elapsed = time.monotonic() - _last_nominatim_call
    if elapsed < 1:
        time.sleep(1 - elapsed)
    _last_nominatim_call = time.monotonic()

    try:
        data = fetch_json(f"{NOMINATIM_ENDPOINT}?{params}", timeout=4)
    except (HTTPError, URLError, TimeoutError, socket.timeout, json.JSONDecodeError):
        _geo_cache[query] = None
        return None

    if not data:
        if city in KNOWN_COORDINATES:
            lat, lon = KNOWN_COORDINATES[city]
            result = {"name": name, "display_name": city, "lat": lat, "lon": lon}
            _geo_cache[query] = result
            return result
        _geo_cache[query] = None
        return None

    first = data[0]
    result = {
        "name": name,
        "display_name": first.get("display_name", name),
        "lat": float(first["lat"]),
        "lon": float(first["lon"]),
    }
    _geo_cache[query] = result
    return result


def osm_place_link(point: dict[str, Any]) -> str:
    return f"https://www.openstreetmap.org/?mlat={point['lat']:.6f}&mlon={point['lon']:.6f}#map=15/{point['lat']:.6f}/{point['lon']:.6f}"


def osm_directions_link(points: list[dict[str, Any]]) -> str:
    if len(points) < 2:
        return ""
    route = ";".join(f"{point['lat']:.6f},{point['lon']:.6f}" for point in points[:6])
    return f"https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route={quote(route, safe=';,')}"


def get_route_summary(points: list[dict[str, Any]]) -> str:
    if len(points) < 2:
        return ""

    coords = ";".join(f"{point['lon']:.6f},{point['lat']:.6f}" for point in points[:6])
    params = urlencode({
        "overview": "false",
        "steps": "false",
        "alternatives": "false",
    })

    try:
        data = fetch_json(f"{OSRM_ROUTE_ENDPOINT}/{coords}?{params}", timeout=4)
    except (HTTPError, URLError, TimeoutError, socket.timeout, json.JSONDecodeError):
        return ""

    route = (data.get("routes") or [{}])[0]
    distance = route.get("distance")
    duration = route.get("duration")
    if not distance or not duration:
        return ""

    km = distance / 1000
    hours = duration / 3600
    if hours >= 1:
        time_text = f"{hours:.1f}小时"
    else:
        time_text = f"{round(duration / 60)}分钟"
    return f"按 OSRM 驾车路线粗略估算，串联这些点约 {km:.1f} 公里，车程约 {time_text}。"


def build_map_section(destination: str, spots: list[dict[str, Any]]) -> str:
    if not spots:
        return ""

    points: list[dict[str, Any]] = []
    for item in spots[:5]:
        point = geocode_place(item.get("name", ""), item.get("city", "") or destination, item.get("region", ""))
        if point:
            points.append(point)

    if not points:
        return (
            "### 地图位置\n"
            "我尝试调用 OpenStreetMap 地理编码，但这次没有拿到稳定坐标。你可以先按同一区域顺路游玩，出发前再用手机地图核对实时路线。"
        )

    lines = [
        f"- **{point['name']}**：[{point['lat']:.4f}, {point['lon']:.4f}]({osm_place_link(point)})"
        for point in points
    ]
    route_summary = get_route_summary(points)
    directions = osm_directions_link(points)
    route_line = f"\n- 顺路导航参考：[{points[0]['name']} 到 {points[-1]['name']}]({directions})" if directions else ""
    summary_line = f"\n- {route_summary}" if route_summary else ""

    return (
        "### 地图位置与顺路建议\n"
        "我用 OpenStreetMap/Nominatim 查询了核心点位，下面的链接可以直接打开地图核对位置：\n"
        f"{chr(10).join(lines)}"
        f"{route_line}"
        f"{summary_line}\n"
        "- 地图结果用于规划参考，实际出行仍建议以当天交通、景区入口和手机导航为准。"
    )


def build_attraction_answer(item: dict[str, Any]) -> str:
    highlights = item.get("highlights") or []
    if highlights:
        highlight_text = "\n".join(f"- {line}" for line in highlights[:4])
    else:
        highlight_text = (
            f"- {format_item_summary(item)}\n"
            f"- 适合纳入当地 1 日到 2 日旅行路线"
        )

    nearby = item.get("nearby") or []
    foods = item.get("foods") or []
    nearby_text = ""
    food_text = ""
    if nearby:
        nearby_text = "\n\n### 顺路搭配\n" + "\n".join(f"- {name}" for name in nearby[:4])
    if foods:
        food_text = "\n\n### 当地美食\n" + "\n".join(f"- {name}" for name in foods[:4])

    return (
        f"当然可以～下面是 **{item.get('name', '该景点')}** 的景点介绍：\n\n"
        f"### 基本印象\n{item.get('intro') or format_item_summary(item)}\n\n"
        f"### 适合看什么\n{highlight_text}\n\n"
        f"### 游玩建议\n"
        f"- 所在地：{format_place(item) or '国内景区'}\n"
        f"- 类型：{item.get('category') or '综合景区'}\n"
        f"- 推荐时间：{item.get('bestTime') or '建议结合季节、天气和客流安排'}\n"
        f"- 小贴士：{format_item_tip(item)}"
        f"{nearby_text}{food_text}\n\n"
        f"如果你要去这里，我也可以继续帮你安排“半日游、1日游、情侣游、亲子游或拍照路线”。"
    )


def build_region_answer(region: dict[str, Any]) -> str:
    attractions = unique_matches(region.get("attractions", []), 8)
    lines = []
    for index, item in enumerate(attractions):
        lines.append(
            f"{index + 1}. {format_item_label(item)}：{format_item_summary(item)}\n"
            f"   小贴士：{format_item_tip(item)}"
        )
    foods = "、".join((region.get("foods") or [])[:5]) or "可结合当地特色餐饮安排"
    return (
        f"{region.get('region', '该地区')} 的景点我先帮你整理一版：\n\n"
        f"{chr(10).join(lines)}\n\n"
        f"### 旅行季节\n{region.get('season') or '建议优先看天气和假期客流'}\n\n"
        f"### 可以顺便尝试\n{foods}"
    )


def build_matched_attractions_answer(question: str, matches: list[dict[str, Any]]) -> str:
    options = unique_matches(matches, 8)
    lines = []
    for index, item in enumerate(options):
        lines.append(
            f"{index + 1}. {format_item_label(item)}：{format_item_summary(item)}\n"
            f"   小贴士：{format_item_tip(item)}"
        )
    destination = extract_destination(question, {})
    return (
        f"我按你的输入筛到这些更相关的景点，先给你一组可选项：\n\n"
        f"{chr(10).join(lines)}\n\n"
        f"如果你愿意，我可以继续把 **{destination}** 整理成“2天路线、情侣路线、亲子路线或美食路线”。"
    )


def build_route_from_matches(destination: str, days: int, preference: str, include_map: bool = False) -> str:
    matches = unique_matches(search_attractions(destination, max(4, days * 2)), max(4, days * 2))
    priority_names = CITY_ROUTE_SPOT_PRIORITIES.get(destination, [])
    priority_matches = [build_route_priority_item(name, destination) for name in priority_names]
    if find_city(destination):
        local_matches = [
            item for item in matches
            if destination in str(item.get("city", "")) or destination in str(item.get("name", ""))
        ]
        if local_matches:
            matches = unique_matches(priority_matches + local_matches + matches, max(4, days * 2))
    elif priority_matches:
        matches = unique_matches(priority_matches + matches, max(4, days * 2))
    if not matches:
        matches = unique_matches(get_all_attractions()[: max(4, days * 2)], max(4, days * 2))

    blocks = []
    for index in range(days):
        morning = matches[index * 2]["name"] if index * 2 < len(matches) else f"{destination}核心景区"
        afternoon = matches[index * 2 + 1]["name"] if index * 2 + 1 < len(matches) else f"{destination}周边慢游"
        evening = "整理行李，按返程时间轻松收尾" if index == days - 1 else "安排夜景、老街或当地美食"
        blocks.append(
            f"#### 第{index + 1}天\n"
            f"- **上午**：前往{morning}，先看最有代表性的景观。\n"
            f"- **下午**：继续游览{afternoon}，把自然风光或人文体验补完整。\n"
            f"- **晚上**：{evening}。"
        )

    other_lines = "\n".join(
        f"- **{item.get('name', '景点')}**：{format_item_summary(item)}"
        for item in unique_matches(matches, 4)
    )

    map_section = f"\n\n{build_map_section(destination, matches)}" if include_map else ""
    return (
        f"哇塞🥰 {destination} 很适合 {preference}，我按 {days} 天给你整理一版路线～\n\n"
        f"### 我先帮你分析一下\n"
        f"- 目的地：{destination}\n"
        f"- 出行天数：{days}天\n"
        f"- 偏好：{preference}\n"
        f"- 规划方式：先匹配本地知识库，再结合地图位置做顺路安排\n\n"
        f"### 经典{days}日游路线\n"
        f"{chr(10).join(blocks)}\n\n"
        f"### 其他景点推荐\n{other_lines}\n\n"
        f"### 旅行小贴士\n"
        f"- 热门景点建议提前确认开放时间和预约要求。\n"
        f"- 优先按同一区域顺路安排，行程会更轻松。\n"
        f"- 如果要拍照，清晨和傍晚的体验通常更好。"
        f"{map_section}"
    )


def build_attraction_route(item: dict[str, Any], question: str) -> str:
    days = parse_days(question, 1)
    preference = get_preference_label(question)
    name = item.get("name", "这个景点")
    highlights = (item.get("highlights") or [])[:3]
    if not highlights:
        highlights = [format_item_summary(item), "适合放慢节奏游览"]
    nearby = (item.get("nearby") or [])[:3]

    blocks = []
    for index in range(days):
        if days == 1:
            blocks.append(
                f"#### 第1天：{name}{preference}\n"
                f"- **上午**：先进入{name}核心区域，优先看{highlights[0]}。\n"
                f"- **中午**：在景区周边安排一顿轻松用餐，节奏不要太赶。\n"
                f"- **下午**：继续补完整体游览，并预留拍照和散步时间。\n"
                f"- **晚上**：如果周边有夜景、老街或观景点，可以安排轻松收尾。"
            )
            break

        if index == 0:
            focus = name
        elif index - 1 < len(nearby):
            focus = nearby[index - 1]
        else:
            focus = item.get("city") or item.get("region") or "周边区域"

        blocks.append(
            f"#### 第{index + 1}天：{focus}\n"
            f"- **上午**：围绕{focus}安排核心游览，尽量少折返。\n"
            f"- **下午**：补充{highlights[index % len(highlights)]}，根据天气灵活调整。\n"
            f"- **晚上**：{'整理返程，轻松收尾。' if index == days - 1 else '安排慢走、夜景或当地餐饮。'}"
        )

    tip_lines = []
    if "情侣" in question:
        tip_lines.extend([
            "把核心观景时间放在清晨或傍晚，光线更柔和，也更适合拍照。",
            "中间预留一段放空和休息时间，比把路线塞满更适合情侣游。",
            "如果景点周边有咖啡馆、湖边步道或夜景，可以优先安排。",
        ])
    else:
        tip_lines.extend([
            "热门区域尽量提前预约，体力分配会更从容。",
            "把核心景观点放在前半天，后半天安排轻松体验更舒服。",
            "如果天气变化明显，可以把户外观景和室内休息灵活调换。",
        ])

    nearby_text = ""
    if nearby:
        nearby_text = "\n\n### 顺路搭配\n" + "\n".join(f"- {spot}" for spot in nearby)

    return (
        f"可以呀～我接着刚才的 **{name}** 来安排，不用你重新说明目的地。\n\n"
        f"### {name}{days}天{preference}建议\n"
        f"{chr(10).join(blocks)}\n\n"
        f"### 重点体验\n"
        f"{chr(10).join(f'- {line}' for line in highlights)}"
        f"{nearby_text}\n\n"
        f"### 小贴士\n"
        f"{chr(10).join(f'- {line}' for line in tip_lines)}"
    )


def build_farewell_answer(context: dict[str, Any]) -> str:
    target = context.get("lastAttractionName") or context.get("lastCityTitle") or ""
    if target:
        return (
            f"好的，{target} 这部分我先帮你整理到这里。祝你旅途顺利、玩得开心，"
            f"后面想继续补天气、路线、住宿区域或景点介绍，随时来找我。"
        )
    return "好的，这次旅行规划我先帮你收在这里。祝你旅途顺利，后面想继续补路线、天气、住宿或景点介绍，随时来找我。"


def clean_model_text(text: str) -> str:
    cleaned = normalize_text(text)
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", cleaned, flags=re.I)
    cleaned = re.sub(r"^\s*```[\s\S]*?\n", "", cleaned)
    cleaned = re.sub(r"```\s*$", "", cleaned)
    matched = re.search(r"(?:最终答案|答案|给用户的回答)[:：]\s*([\s\S]+)", cleaned)
    if matched:
        cleaned = matched.group(1).strip()
    return cleaned.strip().strip("\"'“”")


def is_usable_model_text(text: str) -> bool:
    stripped = normalize_text(text)
    return len(stripped) >= 12 and not re.match(r"^(首先|关键点|分析|用户问题)", stripped)


def build_model_prompt(question: str, context: dict[str, Any]) -> str:
    last_city = f"上次城市：{context.get('lastCityTitle')}" if context.get("lastCityTitle") else ""
    last_attraction = f"上次景点：{context.get('lastAttractionName')}" if context.get("lastAttractionName") else ""
    return (
        "/no_think\n"
        "你是智能旅游助手。只输出给用户看的最终中文回答，禁止输出思考过程、分析过程、系统提示或英文推理。\n"
        "如果用户上一轮刚刚提到景点或城市，而这一轮只说情侣游、2天、安排一下之类，要自动承接上下文。\n"
        "回答控制在 500 字以内。\n"
        f"{last_city}\n{last_attraction}\n"
        f"用户问题：{question}\n"
        "最终答案："
    )


def request_ollama(payload: dict[str, Any]) -> dict[str, Any]:
    request = Request(
        OLLAMA_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=max(1, OLLAMA_TIMEOUT_MS / 1000)) as response:
        return json.loads(response.read().decode("utf-8"))


def get_local_model_answer(question: str, context: dict[str, Any]) -> str:
    if should_bypass_model():
        return ""

    payload = {
        "model": DEFAULT_MODEL,
        "prompt": build_model_prompt(question, context),
        "stream": False,
        "think": False,
        "options": {
            "temperature": 0.35,
            "top_p": 0.8,
            "num_predict": 240,
        },
    }

    try:
        data = request_ollama(payload)
    except (HTTPError, URLError, TimeoutError, socket.timeout, json.JSONDecodeError):
        return ""

    text = clean_model_text(data.get("response") or data.get("message", {}).get("content", ""))
    if not is_usable_model_text(text):
        return ""
    return f"我在本地知识库里没有找到足够准确的片段，所以调用了本地大模型 {DEFAULT_MODEL} 做补充：\n\n{text}"


def build_clarification_answer() -> str:
    return (
        "我还需要一点关键信息，才能把路线安排得更准确：\n\n"
        "- 想去的城市或景点\n"
        "- 出行天数，比如 2 天、3 天\n"
        "- 偏好，比如情侣、亲子、美食、拍照、轻松慢游\n\n"
        "你也可以直接说“杭州 2 天 情侣”这种格式，我会直接接着帮你安排。"
    )


def build_generic_fallback() -> str:
    hot = unique_matches(get_all_attractions(), 5)
    lines = []
    for index, item in enumerate(hot):
        lines.append(f"{index + 1}. {format_item_label(item)}：{format_item_summary(item)}")
    return (
        f"我先给你一组国内热门景点方向：\n\n"
        f"{chr(10).join(lines)}\n\n"
        f"如果你告诉我想去哪里、玩几天、和谁一起去，我可以继续把它细化成能直接执行的路线。"
    )


def build_travel_agent_response(body: dict[str, Any]) -> dict[str, str]:
    question = normalize_text(body.get("question", ""))
    context = body.get("context") or {}
    if not question:
        raise ValueError("Question is required")

    if GREETING_PATTERN.match(question):
        target = context.get("lastAttractionName") or context.get("lastCityTitle")
        if target:
            return {
                "answer": f"嗨嗨～👋 又见面啦！今天是想继续聊 {target} 的深度玩法，还是想换一个新的目的地？你可以直接说“2天 情侣”或“再推荐几个景点”，我会接着上一轮继续安排。",
                "source": "python-agent",
            }
        return {
            "answer": "嗨嗨～👋 看到你好开心呀！今天是想聊聊旅行计划，还是需要我推荐一些超棒的目的地呢？无论是海边、古城、山水还是美食城市，我都可以帮你整理路线和景点灵感。",
            "source": "python-agent",
        }

    if FAREWELL_PATTERN.match(question):
        return {
            "answer": build_farewell_answer(context),
            "source": "python-agent",
        }

    matches = search_attractions(question, 8)
    best_match = matches[0] if matches else None
    region = find_region(question)
    city = find_city(question)
    destination = extract_destination(question, context)
    preference = get_preference_label(question)
    include_map = is_map_intent(question)

    if context.get("lastAttractionName") and FOLLOWUP_ROUTE_PATTERN.search(question):
        carried = search_attractions(str(context["lastAttractionName"]), 1)
        if carried:
            return {
                "answer": build_attraction_route(carried[0], question),
                "source": "python-agent",
            }

    if context.get("lastCityTitle") and FOLLOWUP_ROUTE_PATTERN.search(question) and not city:
        return {
            "answer": build_route_from_matches(str(context["lastCityTitle"]), parse_days(question), preference, include_map),
            "source": "python-agent",
        }

    if best_match and best_match.get("score", 0) >= 80 and DETAIL_PATTERN.search(question):
        return {
            "answer": build_attraction_answer(best_match),
            "source": "python-agent",
        }

    if region and LIST_PATTERN.search(question):
        return {
            "answer": build_region_answer(region),
            "source": "python-agent",
        }

    if best_match and ATTRACTION_PATTERN.search(question) and DETAIL_PATTERN.search(question):
        return {
            "answer": build_attraction_answer(best_match),
            "source": "python-agent",
        }

    if city and (CITY_ROUTE_PATTERN.search(question) or question == city):
        return {
            "answer": build_route_from_matches(city, parse_days(question), preference, include_map),
            "source": "python-agent",
        }

    if best_match and LIST_PATTERN.search(question) and len(matches) > 1:
        return {
            "answer": build_matched_attractions_answer(question, matches),
            "source": "python-agent",
        }

    if best_match:
        return {
            "answer": build_attraction_answer(best_match),
            "source": "python-agent",
        }

    if region:
        return {
            "answer": build_region_answer(region),
            "source": "python-agent",
        }

    if FOLLOWUP_ROUTE_PATTERN.search(question) and destination:
        return {
            "answer": build_route_from_matches(destination, parse_days(question), preference, include_map),
            "source": "python-agent",
        }

    model_answer = get_local_model_answer(question, context)
    if model_answer:
        return {
            "answer": model_answer,
            "source": "python-ollama",
        }

    if len(extract_tokens(question)) <= 1:
        return {
            "answer": build_clarification_answer(),
            "source": "python-agent",
        }

    return {
        "answer": build_generic_fallback(),
        "source": "python-agent",
    }


def proxy_local_llm(body: dict[str, Any]) -> tuple[int, str, bytes]:
    if should_bypass_model():
        payload = {
            "error": "Local LLM unavailable",
            "detail": "Current deployment cannot reach a local Ollama endpoint.",
        }
        return 502, "application/json; charset=utf-8", json.dumps(payload, ensure_ascii=False).encode("utf-8")

    try:
        data = request_ollama(body)
        return 200, "application/json; charset=utf-8", json.dumps(data, ensure_ascii=False).encode("utf-8")
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        payload = {"error": "Local LLM unavailable", "detail": detail or str(error)}
        return 502, "application/json; charset=utf-8", json.dumps(payload, ensure_ascii=False).encode("utf-8")
    except (URLError, TimeoutError, socket.timeout, json.JSONDecodeError) as error:
        payload = {"error": "Local LLM unavailable", "detail": str(error)}
        return 502, "application/json; charset=utf-8", json.dumps(payload, ensure_ascii=False).encode("utf-8")


def parse_json_body(handler: Any) -> dict[str, Any]:
    content_length = int(handler.headers.get("content-length", "0") or "0")
    if content_length <= 0:
        return {}
    raw = handler.rfile.read(content_length)
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))
