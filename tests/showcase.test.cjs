const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwrightPath = require.resolve('@playwright/test', { paths: [__dirname, path.resolve(__dirname, '../../ws-app')] });
const { chromium, expect } = require(playwrightPath);
const { createServer } = require('../serve.cjs');

test('launch countdown ticks to midnight India time and stays at zero', { timeout: 30000 }, async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  try {
    const page = await browser.newPage({ timezoneId: 'America/New_York' });
    await page.clock.install({ time: new Date('2026-11-14T23:59:58+05:30') });
    await page.clock.pauseAt(new Date('2026-11-14T23:59:58+05:30'));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const digits = page.locator('[data-countdown]');
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '02']);
    await page.clock.runFor(1000);
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '01']);
    await page.clock.runFor(1000);
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '00']);
    await expect(page.locator('#launch-message')).toHaveText('The wait is over');
    await page.clock.runFor(5000);
    assert.deepEqual(await digits.allTextContents(), ['00', '00', '00', '00']);
    await page.reload();
    await expect(page.locator('#launch-message')).toHaveText('The wait is over');
    await page.setViewportSize({ width: 320, height: 568 });
    await page.clock.runFor(5000);
    await expect(page.locator('#launch-dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close launch announcement' }).click();
    await page.clock.runFor(1000);
    await expect(page.locator('#launch-dialog')).not.toBeVisible();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const countdownBounds = await page.locator('#launch-countdown').boundingBox();
    const footerBounds = await page.locator('.hero-bottom').boundingBox();
    assert.ok(countdownBounds.y + countdownBounds.height < footerBounds.y);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('brand showcase preloader, lookbook, navigation and responsive layout', { timeout: 90000 }, async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  const output = path.resolve(__dirname, '../../test-results');
  fs.mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await expect(page.locator('#preloader')).toBeHidden({ timeout: 5000 });
    await expect(page.locator('#launch-dialog')).toBeVisible();
    assert.equal(await page.locator('#launch-dialog').evaluate(dialog => getComputedStyle(dialog, '::backdrop').backdropFilter), 'blur(12px)');
    await page.evaluate(() => document.fonts.ready);
    for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
      await page.setViewportSize(viewport);
      const fit = await page.locator('#launch-dialog').evaluate(dialog => ({
        fits: dialog.scrollHeight <= dialog.clientHeight + 1,
        scrollbar: getComputedStyle(dialog).scrollbarWidth
      }));
      assert.ok(fit.fits, `Launch modal should fit ${viewport.width}×${viewport.height}`);
      assert.equal(fit.scrollbar, 'none');
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(output, 'launch-modal-desktop.png') });
    await page.getByRole('button', { name: 'Close launch announcement' }).click();
    await expect(page.locator('#launch-dialog')).not.toBeVisible();
    await expect(page.locator('#launch-home-slot #launch-countdown')).toBeVisible();
    await expect(page.locator('.hero .button')).toBeFocused();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('The art of');
    await expect(page.locator('.look-card')).toHaveCount(4);
    await expect(page.getByRole('button', { name: /save|buy|rent/i })).toHaveCount(0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll('main img')].map(img => {
        img.loading = 'eager';
        return img.decode();
      }));
    });
    await expect.poll(() => page.locator('main img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    const imageStatus = await page.locator('main img').evaluateAll(images => images.map(img => ({ src: img.getAttribute('src'), complete: img.complete, width: img.naturalWidth })));
    assert.ok(imageStatus.every(img => img.complete && img.width > 0), JSON.stringify(imageStatus));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const element of await page.locator('.reveal').all()) await element.scrollIntoViewIfNeeded();
    await expect(page.locator('.reveal:not(.is-visible)')).toHaveCount(0);
    await page.waitForTimeout(950);
    await page.screenshot({ path: path.join(output, 'showcase-desktop.png'), fullPage: true });

    await page.getByRole('button', { name: 'Explore the bridal story' }).click();
    await expect(page.getByRole('dialog', { name: 'Bridal stories' })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#look-dialog-count')).toHaveText('02 / 04');
    await expect(page.locator('#look-dialog-title')).toContainText('For him');
    await page.keyboard.press('Escape');
    await expect(page.locator('#look-dialog')).not.toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.locator('#mobile-menu').getByRole('link', { name: /The collections/ }).click();
    await expect(page.locator('#mobile-menu')).toBeHidden();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const element of await page.locator('.reveal').all()) await element.scrollIntoViewIfNeeded();
    const arrowMask = await page.locator('.look-card-arrow .icon-arrow').first().evaluate(icon => getComputedStyle(icon).maskImage || getComputedStyle(icon).webkitMaskImage);
    assert.match(arrowMask, /arrow-up-right\.svg/);
    await page.locator('.look-card-arrow').first().screenshot({ path: path.join(output, 'showcase-mobile-arrow.png') });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: path.join(output, 'showcase-mobile.png'), fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('#launch-dialog')).toBeVisible();
    const modalBounds = await page.locator('#launch-dialog').boundingBox();
    assert.ok(modalBounds.x >= 0 && modalBounds.x + modalBounds.width <= 390);
    await page.screenshot({ path: path.join(output, 'launch-modal-mobile.png') });
    await page.keyboard.press('Escape');
    await expect(page.locator('#launch-dialog')).not.toBeVisible();
    await expect(page.locator('#launch-home-slot #launch-countdown')).toBeVisible();
    assert.equal(await page.evaluate(() => document.body.classList.contains('launch-open')), false);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
