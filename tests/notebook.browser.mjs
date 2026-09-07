import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('.');
const output = process.env.QA_OUTPUT || path.join(os.tmpdir(), 'cruise-notebook-qa');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.TEST_BASE_URL || `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
try {
  for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:360,height:800}]) {
    const context = await browser.newContext({viewport, serviceWorkers:'block'});
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.addInitScript(() => {window.__SEARCH_TEST_HOOKS__ = {};});
    await page.goto(base, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.querySelectorAll('.schedule-item').length === 36);
    assert.deepEqual(errors, []);
    assert(!requests.some(url => url.includes('menu-lookup-data.js')));
    assert.equal(await page.locator('.lookup-result-card').count(), 0);
    const cover = await page.locator('.voyage-cover-image').boundingBox();
    assert(cover.height >= 190, 'cover remains a prominent image');
    const first = await page.locator('#day1 .schedule-title').first().boundingBox();
    assert(first.y < viewport.height - (viewport.width < 761 ? 66 : 0), 'first itinerary title visible');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
    await page.screenshot({path:path.join(output, `journey-${viewport.width}.png`), animations:'disabled', timeout:15000});
    console.log('Journey', viewport.width, {cover:cover.height, firstEventY:first.y});

    const nav = page.locator(viewport.width < 761 ? '.mobile-nav' : '.nav-links');
    await nav.locator('[data-view-link="explore"]').click();
    await page.locator('[data-purpose="swim"]').click();
    assert(await page.locator('.facility-card').count() > 0);
    await page.locator('#deck-filter').selectOption('deck17');
    assert((await page.locator('.facility-card').allTextContents()).every(text => text.includes('Deck 17')));
    await page.screenshot({path:path.join(output, `explore-${viewport.width}.png`), animations:'disabled', timeout:15000});
    await nav.locator('[data-view-link="prepare"]').click();
    const checkbox = page.locator('.checklist-item input').first();
    await checkbox.check();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForSelector('#prepare:not([hidden])');
    assert(await page.locator('.checklist-item input').first().isChecked());
    await page.locator('[data-checklist-filter="pending"]').click();
    assert.equal(await page.locator('.checklist-item:visible input:checked').count(),0);
    await page.goto(base + '#search-static-facilities-0', {waitUntil:'domcontentloaded'});
    await page.waitForSelector('#explore:not([hidden])');
    assert(await page.locator('#search-deck-deck17-1').isVisible(), 'legacy pool link works');

    await nav.locator('a[href="#menu-search"]').click();
    await page.waitForSelector('.lookup-result-card', {timeout:20000});
    assert(await page.evaluate(() => window.MENU_LOOKUP_DATA.records.length === 550));
    assert.notEqual(await page.locator('#search-input').evaluate(el => document.activeElement === el), true, 'menu does not focus the keyboard');
    const ratio = await page.evaluate(() => document.querySelector('.search-panel-body').getBoundingClientRect().height / document.querySelector('.search-panel').getBoundingClientRect().height);
    assert(ratio >= .65, 'results should take at least 65%: ' + ratio);
    const allMenu = await page.evaluate(() => window.__SEARCH_TEST_HOOKS__.getBilingualLookupResults('', {category:'dining',diningFilter:'all',restaurantFilter:'all'}).results);
    assert.equal(allMenu.reduce((n,record) => n + (record.menuVariants?.length || 0),0),550,'no source menu records lost by merging');
    await page.locator('#search-input').fill('海南雞飯');
    await page.waitForFunction(() => window.__SEARCH_TEST_HOOKS__.getSearchUiState().query === '海南雞飯');
    await page.locator('.lookup-crew-trigger').first().click();
    assert(await page.locator('.lookup-crew-card').isVisible());
    assert((await page.locator('.lookup-crew-card').textContent()).includes('Could I order this, please?'));
    if (viewport.width < 761) assert.equal(await page.locator('.lookup-crew-pane').evaluate(el => getComputedStyle(el).position),'fixed');
    await page.screenshot({path:path.join(output, `crew-${viewport.width}.png`), animations:'disabled', timeout:15000});
    await page.keyboard.press('Escape');
    assert(await page.locator('.lookup-crew-pane').isHidden());
    assert(await page.locator('#search-overlay').isVisible());
    await page.locator('#search-input').fill('');
    await page.waitForFunction(() => window.__SEARCH_TEST_HOOKS__.getSearchUiState().query === '' && document.querySelectorAll('.lookup-result-card').length > 24);
    await page.locator('.lookup-result-column').evaluate(el => {el.scrollTop=400;});
    const scrollBefore = await page.locator('.lookup-result-column').evaluate(el => el.scrollTop);
    const visibleId = await page.locator('.lookup-result-column').evaluate(el => {
      const bounds = el.getBoundingClientRect();
      return [...el.querySelectorAll('[data-lookup-id]')].find(button => {
        const rect = button.getBoundingClientRect();
        return rect.top > bounds.top && rect.bottom < bounds.bottom;
      }).dataset.lookupId;
    });
    await page.locator(`[data-lookup-id="${visibleId}"]`).click();
    await page.locator('[data-lookup-crew-close]').click();
    await page.waitForFunction(() => location.hash !== '#crew');
    assert.equal(await page.locator('.lookup-result-column').evaluate(el => el.scrollTop),scrollBefore);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.lookupId),visibleId);
    await page.locator(`[data-lookup-id="${visibleId}"]`).click();
    await page.goBack();
    assert(await page.locator('.lookup-crew-pane').isHidden());
    assert.equal(await page.evaluate(() => document.activeElement.dataset.lookupId),visibleId);
    await page.goForward();
    assert(await page.locator('.lookup-crew-pane').isVisible(), 'Forward restores Crew card');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => location.hash !== '#crew');
    assert.equal(await page.locator('.lookup-result-column').evaluate(el => el.scrollTop),scrollBefore);
    await page.locator('#search-close-btn').click();
    await page.waitForFunction(() => !['#crew','#search','#menu-search'].includes(location.hash));
    await page.locator('#nav-search-trigger').click();
    assert.equal(await page.locator('.lookup-result-column').evaluate(el => el.scrollTop),scrollBefore);
    assert.deepEqual(errors, []);
    console.log('Lookup', viewport.width, {ratio,records:allMenu.length,errors});
    await context.close();
  }

  const context = await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/menu-lookup-data.js*', route => route.fulfill({status:404,body:'missing'}));
  await page.goto(base+'#menu-search', {waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-menu-load-action="retry-search"]');
  await page.unroute('**/menu-lookup-data.js*');
  await page.locator('[data-menu-load-action="retry-search"]').click();
  await page.waitForSelector('.lookup-result-card');
  await page.locator('#lookup-menu-restaurant-select').selectOption('nav');
  await page.locator('#lookup-menu-course-row [data-lookup-dining-filter="entree"]').click();
  assert((await page.locator('.lookup-result-list').textContent()).includes('Hainanese Chicken, Rice'));
  assert((await page.locator('.lookup-result-card').allTextContents()).every(text => text.includes('航海家 / 好萊塢')));
  await page.screenshot({path:path.join(output,'menu-filtered-mobile.png'),animations:'disabled'});
  await page.locator('.menu-lookup-description summary').first().click();
  assert(await page.locator('.menu-variant').first().isVisible());
  await page.locator('#search-close-btn').click();
  await page.waitForSelector('#search-overlay[hidden]', {state:'attached'});
  await page.locator('#nav-search-trigger').click();
  await page.locator('[data-search-tool-mode="guide"]').click();
  await page.locator('#search-input').fill('Room Service');
  await page.waitForSelector('.search-result-card');
  await page.locator('.search-result-card').first().click();
  await page.waitForSelector('#explore:not([hidden])');
  assert(await page.locator('.playbook-card[open]').count() > 0);
  await page.goto(base+'#journey', {waitUntil:'domcontentloaded'});
  await page.locator('[data-tab="day3"]').click();
  await page.locator('.mobile-nav [data-view-link="prepare"]').click();
  await page.locator('.mobile-nav [data-view-link="journey"]').click();
  assert(await page.locator('#day3').isVisible());
  await page.evaluate(() => window.scrollTo(0, 500));
  const pageScroll = await page.evaluate(() => window.scrollY);
  await page.locator('#nav-search-trigger').click();
  await page.goBack();
  await page.waitForSelector('#search-overlay[hidden]', {state:'attached'});
  assert.equal(await page.evaluate(() => window.scrollY),pageScroll, 'Back preserves the underlying page position');
  assert.deepEqual(errors, []);
  await context.close();
  console.log('Retry, filtering, descriptions, search destinations and Back passed.');

  if (!process.env.TEST_BASE_URL) {
    const local = await browser.newContext({serviceWorkers:'block'});
    const filePage = await local.newPage();
    await filePage.goto(pathToFileURL(path.join(root,'index.html')).href, {waitUntil:'domcontentloaded'});
    await filePage.waitForFunction(() => document.querySelectorAll('.schedule-item').length === 36);
    await filePage.locator('.nav-links [data-view-link="prepare"]').click();
    assert(await filePage.locator('#prepare').isVisible(), 'file URL hash navigation');
    await filePage.locator('.nav-links a[href="#menu-search"]').click();
    await filePage.waitForSelector('.lookup-result-card');
    assert.equal(await filePage.evaluate(() => window.MENU_LOOKUP_DATA.records.length), 550);
    await local.close();

    const offline = await browser.newContext({serviceWorkers:'allow'});
    const offlinePage = await offline.newPage();
    await offlinePage.goto(base, {waitUntil:'domcontentloaded'});
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.waitForFunction(() => !!navigator.serviceWorker.controller, null, {timeout:10000}).catch(async error => {
      console.log('SW diagnostic', await offlinePage.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return {url:location.href, active:registration?.active?.state, waiting:registration?.waiting?.state, controller:navigator.serviceWorker.controller?.state, caches:await caches.keys()};
      }));
      throw error;
    });
    await offlinePage.reload({waitUntil:'domcontentloaded'});
    await offlinePage.locator('.nav-links a[href="#menu-search"]').click();
    await offlinePage.waitForSelector('.lookup-result-card');
    await offlinePage.waitForFunction(async () => {
      const names = await caches.keys();
      for (const name of names.filter(value => value.endsWith('-runtime'))) {
        const cache = await caches.open(name);
        if ((await cache.keys()).some(request => request.url.includes('menu-lookup-data.js'))) return true;
      }
      return false;
    });
    await offline.setOffline(true);
    await offlinePage.goto(base, {waitUntil:'domcontentloaded'});
    await offlinePage.waitForFunction(() => document.querySelectorAll('.schedule-item').length === 36);
    await offlinePage.locator('.nav-links a[href="#menu-search"]').click();
    await offlinePage.waitForSelector('.lookup-result-card');
    assert.equal(await offlinePage.evaluate(() => window.MENU_LOOKUP_DATA.records.length),550);
    await offline.close();
    console.log('file:// and offline runtime-cached menu passed.');
  }
  console.log('Screenshots:', output);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
