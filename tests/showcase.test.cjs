const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const playwrightPath = require.resolve('@playwright/test', { paths: [__dirname, path.resolve(__dirname, '../../ws-app')] });
const { chromium, expect } = require(playwrightPath);
const { createServer } = require('../serve.cjs');

test('invitation countdown uses IST, finishes at zero, and fits mobile', { timeout: 60000 }, async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
    const page = await browser.newPage({ timezoneId: 'America/New_York', reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({ time: new Date('2026-10-28T16:59:58+05:30') });
    await page.clock.pauseAt(new Date('2026-10-28T16:59:58+05:30'));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const digits = page.locator('[data-countdown]');
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '02']);
    await page.clock.runFor(1000);
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '01']);
    await page.clock.runFor(1000);
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '00']);
    await expect(page.locator('#launch-message')).toContainText('THE WAIT IS OVER');
    await page.clock.runFor(5000);
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '00']);
    if (await page.locator('.motion-toggle').count()) {
      await page.getByRole('button', { name: 'Pause animation' }).click();
    await expect(page.getByRole('button', { name: 'Resume animation' })).toHaveAttribute('aria-pressed', 'true');
    }
    for (const [width, height] of [[320,568], [360,640], [390,844], [430,932], [768,1024], [1024,768], [1366,768], [1440,900], [1920,1080], [667,375], [844,390]]) {
      await page.setViewportSize({ width, height });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'Fits height at ' + width + 'x' + height);
      await expect(page.locator('h1')).toHaveText('You are invited.');
      await expect(page.locator('.venue')).toContainText('Kallampara, Nedumangad');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.curtain-left')).toBeHidden();
    assert.deepEqual(errors, []);
    await page.screenshot({ path: path.resolve(__dirname, '../../invitation-preview.png'), fullPage: true });
    const noScript = await browser.newPage({ javaScriptEnabled: false });
    await noScript.goto(`http://127.0.0.1:${server.address().port}`);
    await expect(noScript.locator('time')).toBeVisible();
    await expect(noScript.locator('.event-time')).toContainText('5:00 PM');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});






