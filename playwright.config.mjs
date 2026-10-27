import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  timeout:30_000,
  expect:{timeout:7000},
  fullyParallel:true,
  retries:process.env.CI ? 1 : 0,
  workers:process.env.CI ? 2 : undefined,
  reporter:process.env.CI ? [['list'],['html',{open:'never'}]] : 'list',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:'node scripts/serve.mjs',port:4173,reuseExistingServer:!process.env.CI,timeout:15_000}
});
