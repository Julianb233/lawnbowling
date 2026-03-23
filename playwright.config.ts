import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://www.lawnbowling.app";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [["html"], ["list"]],
  timeout: 30000,

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "ipad",
      use: { ...devices["iPad Pro 11"] },
    },
    {
      name: "iphone-se",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "mobile-safari-landscape",
      use: {
        ...devices["iPad Pro 11 landscape"],
      },
    },
  ],
});
