import baseConfig from "./playwright.config.js";

export default {
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: "http://127.0.0.1:4181",
  },
  webServer: {
    command: "node scripts/serve-static.mjs --port=4181 --root=dist",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
    timeout: 15000,
  },
};
