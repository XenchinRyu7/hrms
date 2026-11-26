import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  webServer: {
    command: "npx astro dev --port 4321",
    port: 4321,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:4321",
    headless: true,
  },
});
