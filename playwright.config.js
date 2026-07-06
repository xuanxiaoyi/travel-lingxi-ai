import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: { timeout: 12000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4180",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node scripts/serve-static.mjs --port=4180",
    url: "http://127.0.0.1:4180",
    reuseExistingServer: false,
    timeout: 15000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
