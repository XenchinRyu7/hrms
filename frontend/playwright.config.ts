import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  webServer: {
    command: "npx astro preview --port 4323",
    port: 4323,
    reuseExistingServer: false,
  },
  use: {
    baseURL: "http://localhost:4323",
    headless: true,
  },
});
