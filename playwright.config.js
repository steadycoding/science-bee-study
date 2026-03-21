const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    // Open the local HTML file directly — no server needed
    baseURL: `file://${path.resolve(__dirname)}`,
    // Grant microphone permission so tests can exercise both code paths
    permissions: ['microphone'],
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
