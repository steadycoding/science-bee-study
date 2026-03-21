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
  await expect(page.locator('.pn-header')).toContainText('Privacy');
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

// ─── Local AI voice mode ───────────────────────────────────────────────────

test('voice mode button is present and references local AI', async ({ page }) => {
  await expect(page.locator('button.btn-go')).toBeVisible();
  await expect(page.locator('button.btn-go')).toContainText('Local AI');
});

test('privacy notice states audio stays on device', async ({ page }) => {
  await expect(page.locator('.privacy-notice')).toContainText('never leaves your device');
});

test('CSP allows HuggingFace connect for model download', async ({ page }) => {
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain('huggingface.co');
  expect(csp).toContain('wasm-unsafe-eval');
  expect(csp).toContain('worker-src blob:');
});

test('importmap pins transformers.js to an exact version with SRI hash', async ({ page }) => {
  const importmap = await page.locator('script[type="importmap"]').textContent();
  const map = JSON.parse(importmap);
  // Bare specifier must resolve to a fully-pinned URL (no floating @major ranges)
  const url = map.imports['@huggingface/transformers'];
  expect(url).toMatch(/@\d+\.\d+\.\d+\//); // e.g. @3.8.1/
  expect(url).not.toContain('@3/');         // reject floating major range
  // Integrity entry must exist and be a valid SRI hash
  const hash = map.integrity?.[url];
  expect(hash).toMatch(/^sha384-[A-Za-z0-9+/]+=*$/);
});

test('privacy notice does not mention Google speech servers', async ({ page }) => {
  const noticeText = await page.locator('.privacy-notice').innerText();
  expect(noticeText).not.toContain('Google');
});

// Helper: fake MediaStream that satisfies getTracks() without a real mic
const fakeMicScript = () => {
  const fakeTrack = { stop: () => {}, kind: 'audio', enabled: true };
  const fakeStream = { getTracks: () => [fakeTrack], getAudioTracks: () => [fakeTrack] };
  navigator.mediaDevices.getUserMedia = async () => fakeStream;
  navigator.mediaDevices.enumerateDevices = async () => [];
};

test('voice mode entry with mocked mic shows quiz UI', async ({ page }) => {
  await page.addInitScript(fakeMicScript);
  await page.reload();
  await page.locator('button.btn-go').click();
  await expect(page.locator('#mainCard')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#introCard')).not.toBeVisible();
});

test('buzzing in voice mode before model loads shows manual grading buttons', async ({ page }) => {
  await page.addInitScript(() => {
    // Silence TTS
    window.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [], speaking: false, pending: false, paused: false };
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    // Fake mic
    const fakeTrack = { stop: () => {}, kind: 'audio', enabled: true };
    const fakeStream = { getTracks: () => [fakeTrack], getAudioTracks: () => [fakeTrack] };
    navigator.mediaDevices.getUserMedia = async () => fakeStream;
    navigator.mediaDevices.enumerateDevices = async () => [];
  });
  await page.reload();
  await page.locator('button.btn-go').click();
  await expect(page.locator('#mainCard')).toBeVisible({ timeout: 5000 });
  await page.locator('#btnStart').click();
  await page.locator('#btnBuzz').click();
  // whisperReady is false (model can't load in offline test env) → manual buttons appear
  await expect(page.locator('#btnOk')).toBeVisible();
  await expect(page.locator('#btnNg')).toBeVisible();
});

test('buzzing in voice mode before model loads shows loading status message', async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [], speaking: false, pending: false, paused: false };
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    const fakeTrack = { stop: () => {}, kind: 'audio', enabled: true };
    const fakeStream = { getTracks: () => [fakeTrack], getAudioTracks: () => [fakeTrack] };
    navigator.mediaDevices.getUserMedia = async () => fakeStream;
    navigator.mediaDevices.enumerateDevices = async () => [];
  });
  await page.reload();
  await page.locator('button.btn-go').click();
  await expect(page.locator('#mainCard')).toBeVisible({ timeout: 5000 });
  await page.locator('#btnStart').click();
  await page.locator('#btnBuzz').click();
  await expect(page.locator('#statusMsg')).toContainText(/loading|tap/i);
});

test('voice mode and no-mic mode both reach the same quiz UI', async ({ page }) => {
  await page.addInitScript(fakeMicScript);
  await page.reload();
  await page.locator('button.btn-go').click();
  await expect(page.locator('#btnStart')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#btnBuzz')).toBeDisabled();
  await expect(page.locator('#sC')).toHaveText('0');
  await expect(page.locator('#sT')).toHaveText('0');
});

// ─── Whisper transcription path (mocked pipeline) ─────────────────────────

test('transcription result is shown in voice strip after Whisper resolves', async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [], speaking: false, pending: false, paused: false };
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };

    // Fake mic with a real MediaStream so MediaRecorder can attach
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = ctx.createMediaStreamDestination();
    const fakeStream = dest.stream;
    navigator.mediaDevices.getUserMedia = async () => fakeStream;
    navigator.mediaDevices.enumerateDevices = async () => [];

    // Pre-seed whisper state so the code skips loading and uses a stub
    window.__whisperStubText = 'photosynthesis';
  });

  // Inject whisper mock after page load but before the app runs
  await page.addInitScript(() => {
    // Override initLocalRecognition to immediately mark whisper as ready
    // and install a stub pipeline
    const _orig = window.addEventListener;
    // Use a MutationObserver trick: patch after DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      // Directly set the globals the app uses
      window.whisperReady = true;
      window.whisperPipe = async ({ raw, sampling_rate }) => ({ text: window.__whisperStubText });
    });
  });

  await page.reload();
  await page.locator('button.btn-go').click();
  await expect(page.locator('#mainCard')).toBeVisible({ timeout: 5000 });
  await page.locator('#btnStart').click();
  await page.locator('#btnBuzz').click();

  // Wait for voice strip to show the transcribed text
  await expect(page.locator('#voiceTx')).toContainText('photosynthesis', { timeout: 10000 });
});
