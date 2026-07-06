import { expect, test } from "@playwright/test";

async function openAssistant(page) {
  await page.getByRole("button", { name: "打开AI旅游助手" }).click();
  await expect(page.getByLabel("AI旅游助手对话")).toBeVisible();
}

async function askAssistant(page, question, expected) {
  await page.getByLabel("输入你的旅游问题").fill(question);
  await page.getByRole("button", { name: "发送旅游问题" }).click();
  await expect(page.getByText(expected).last()).toBeVisible({ timeout: 45000 });
}

test.beforeEach(async ({ page }) => {
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        results: [{ name: "杭州", country: "中国", admin1: "浙江", latitude: 30.2741, longitude: 120.1551, timezone: "Asia/Shanghai" }],
      }),
    });
  });

  await page.route("https://api.open-meteo.com/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        current: { temperature_2m: 28, apparent_temperature: 30, relative_humidity_2m: 68, weather_code: 1, wind_speed_10m: 8 },
        daily: {
          time: ["2026-07-06", "2026-07-07", "2026-07-08"],
          weather_code: [1, 2, 61],
          temperature_2m_min: [24, 25, 24],
          temperature_2m_max: [31, 32, 29],
          precipitation_probability_max: [10, 20, 65],
        },
      }),
    });
  });

  await page.route("https://timeapi.io/**", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ date: "2026-07-06", time: "13:30:00" }) });
  });

  await page.route("https://api.frankfurter.app/**", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ rates: { JPY: 22.3, USD: 0.14 } }) });
  });

  await page.route("**/api/generate", async (route) => {
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-allow-private-network": "true",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }

    await route.fulfill({
      headers,
      contentType: "application/json",
      body: JSON.stringify({
        model: "qwen3:4b",
        response: "可以把这个问题先拆成目的地、时间、预算和同行人四项，再根据偏好选择自然风光、城市文化或美食路线。",
        done: true,
      }),
    });
  });
});

test("首页核心流程：推荐、弹窗、AI问答、实时天气", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "下一站，由你定义" })).toBeVisible();
  await expect(page.getByText("智能旅游助手").first()).toBeVisible();

  await page.getByRole("button", { name: "山水自然" }).click();
  await expect(page.locator("#recommendations")).toContainText("桂林");
  await page.locator("#recommendationGrid [data-city='guilin']").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "桂林" })).toBeVisible();
  await page.getByRole("button", { name: "关闭城市详情" }).click();

  await openAssistant(page);
  await askAssistant(page, "介绍普陀山", "普陀山是中国佛教四大名山之一");
  await askAssistant(page, "杭州天气", "当前：大部晴朗");
  await askAssistant(page, "我想要一个知识库没有的旅行灵感", "本地大模型 qwen3:4b");
});

test("更多城市页：城市卡片和知识库问答可用", async ({ page }) => {
  await page.goto("/more-cities.html");
  await expect(page.getByRole("heading", { name: "更多值得收藏的目的地" })).toBeVisible();
  await page.locator("[data-city='xiamen']").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "厦门" })).toBeVisible();
  await page.getByRole("button", { name: "关闭城市详情" }).click();

  await openAssistant(page);
  await askAssistant(page, "浙江景点推荐", "普陀山");
});

test("静态站点没有控制台错误，主要资源加载完成", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("img").first()).toBeVisible();
  expect(errors).toEqual([]);
});
