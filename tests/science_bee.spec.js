// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL = `file://${path.resolve(__dirname, '..', 'science_bee_practice.html')}`;

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

// ─── Intro screen ────────────────────────────────────────────────────────────

test('intro screen is shown on load', async ({ page }) => {
  await expect(page.locator('#introCard')).toBeVisible();
  await expect(page.locator('.intro-title')).toContainText('Science Bee Practice');
});

test('question set checkboxes are present and checked by default', async ({ page }) => {
  // Core Science is checked by default
  await expect(page.locator('#setCoreQ')).toBeChecked();
  // Gold 2025-26 is checked by default
  await expect(page.locator('#setGold2526Q')).toBeChecked();
  // 2022 MS rounds are unchecked by default
  await expect(page.locator('#setms2022bkQ')).not.toBeChecked();
});

test('question set checkboxes can be toggled', async ({ page }) => {
  const coreCheckbox = page.locator('#setCoreQ');
  await coreCheckbox.uncheck();
  await expect(coreCheckbox).not.toBeChecked();
  await coreCheckbox.check();
  await expect(coreCheckbox).toBeChecked();
});

test('privacy notice is visible on intro screen', async ({ page }) => {
  await expect(page.locator('.privacy-notice')).toBeVisible();
  await expect(page.locator('.pn-header')).toContainText('Parents');
});

// ─── No-mic mode entry ───────────────────────────────────────────────────────

test('no-mic mode button is present on intro screen', async ({ page }) => {
  await expect(page.locator('button.btn-go-nomics')).toBeVisible();
  await expect(page.locator('button.btn-go-nomics')).toContainText('No Mic');
});

test('clicking no-mic mode hides intro and shows quiz UI', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();

  await expect(page.locator('#introCard')).not.toBeVisible();
  await expect(page.locator('#mainCard')).toBeVisible();
  await expect(page.locator('#appHeader')).toBeVisible();
  await expect(page.locator('#filterRow')).toBeVisible();
});

// ─── Quiz UI elements ─────────────────────────────────────────────────────────

test('quiz screen shows START + LISTEN button', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#btnStart')).toBeVisible();
  await expect(page.locator('#btnStart')).toContainText('START + LISTEN');
});

test('BUZZ button is disabled before quiz starts', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#btnBuzz')).toBeDisabled();
});

test('SKIP button is disabled before quiz starts', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#btnSkip')).toBeDisabled();
});

test('score starts at 0/0', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#sC')).toHaveText('0');
  await expect(page.locator('#sT')).toHaveText('0');
});

// ─── Category filter ──────────────────────────────────────────────────────────

test('category filter buttons are visible after entering quiz', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  const filters = page.locator('#filterRow .fb');
  await expect(filters).toHaveCount(9); // ALL + 8 categories
  await expect(filters.first()).toContainText('ALL');
});

test('ALL filter button is active by default', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  const allBtn = page.locator('#filterRow .fb.on');
  await expect(allBtn).toHaveText('ALL');
});

test('clicking a category filter does not throw and keeps quiz visible', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  const biologyBtn = page.locator('#filterRow .fb', { hasText: 'BIOLOGY' });
  await biologyBtn.click();
  // After filter click the main card should still be present
  await expect(page.locator('#mainCard')).toBeVisible();
});

// ─── Settings panel ───────────────────────────────────────────────────────────

test('settings panel is visible in quiz mode', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#appSettings')).toBeVisible();
});

test('TTS speed selector has three options', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  const options = page.locator('#ttsRate option');
  await expect(options).toHaveCount(3);
});

test('timer selector defaults to 10 seconds', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#timerSec')).toHaveValue('10');
});

test('shuffle checkbox is checked by default', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await expect(page.locator('#chkShuffle')).toBeChecked();
});

// ─── Starting a round ─────────────────────────────────────────────────────────

test('starting a round reveals BUZZ and SKIP buttons', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  // Mock speechSynthesis so TTS does not block the test
  await page.addInitScript(() => {
    window.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
      speaking: false,
      pending: false,
      paused: false,
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; }
    };
  });
  await page.reload();
  await page.locator('button.btn-go-nomics').click();
  await page.locator('#btnStart').click();
  await expect(page.locator('#btnBuzz')).toBeEnabled();
  await expect(page.locator('#btnSkip')).toBeEnabled();
});

test('pressing BUZZ during a round shows manual grading buttons', async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
      speaking: false,
      pending: false,
      paused: false,
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; }
    };
  });
  await page.reload();
  await page.locator('button.btn-go-nomics').click();
  await page.locator('#btnStart').click();
  await page.locator('#btnBuzz').click();

  // Correct and Wrong buttons should be visible
  await expect(page.locator('#btnOk')).toBeVisible();
  await expect(page.locator('#btnNg')).toBeVisible();
});

test('marking correct increments the score', async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
      speaking: false,
      pending: false,
      paused: false,
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; }
    };
  });
  await page.reload();
  await page.locator('button.btn-go-nomics').click();
  await page.locator('#btnStart').click();
  await page.locator('#btnBuzz').click();
  await page.locator('#btnOk').click();

  await expect(page.locator('#sC')).toHaveText('1');
  await expect(page.locator('#sT')).toHaveText('1');
});

test('marking wrong does not increment correct count', async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
      speaking: false,
      pending: false,
      paused: false,
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; }
    };
  });
  await page.reload();
  await page.locator('button.btn-go-nomics').click();
  await page.locator('#btnStart').click();
  await page.locator('#btnBuzz').click();
  await page.locator('#btnNg').click();

  await expect(page.locator('#sC')).toHaveText('0');
  await expect(page.locator('#sT')).toHaveText('1');
});

// ─── End screen ───────────────────────────────────────────────────────────────

test('FINISH button leads to end screen', async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
      speaking: false,
      pending: false,
      paused: false,
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; }
    };
  });
  await page.reload();
  await page.locator('button.btn-go-nomics').click();
  await page.locator('button', { hasText: 'FINISH' }).click();

  await expect(page.locator('#endCard')).toBeVisible();
  await expect(page.locator('.end-title')).toContainText('Session Complete');
});

test('end screen has a review table and Play Again button', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await page.locator('button', { hasText: 'FINISH' }).click();

  await expect(page.locator('#reviewTable')).toBeVisible();
  await expect(page.locator('button.btn-restart')).toBeVisible();
});

test('Play Again restarts the quiz and shows main card', async ({ page }) => {
  await page.locator('button.btn-go-nomics').click();
  await page.locator('button', { hasText: 'FINISH' }).click();
  await page.locator('button.btn-restart').click();

  // restart() re-enters the quiz rather than returning to the intro screen
  await expect(page.locator('#endCard')).not.toBeVisible();
  await expect(page.locator('#mainCard')).toBeVisible();
});
