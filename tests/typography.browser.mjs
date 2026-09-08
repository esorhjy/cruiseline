import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
const output = path.join(os.tmpdir(), 'cruise-typography-qa');
fs.mkdirSync(output, {recursive: true});
const base = process.env.TEST_BASE_URL || pathToFileURL(path.resolve('index.html')).href;
try {
  for (const width of [360,390,768,844,1440]) {
    const height = width === 360 ? 800 : width === 390 ? 844 : width === 844 ? 390 : 900;
    const context = await browser.newContext({viewport:{width,height}, serviceWorkers:'block'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, {waitUntil:'load'});
    await page.waitForSelector('.schedule-title');
    await page.evaluate(() => document.fonts.ready);
    const size = selector => page.locator(selector).first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    const noOverflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow at '+width);
    assert(await size('.schedule-essential') >= 17);
    assert(await size('.schedule-time') >= 16);
    assert(await size('.schedule-disclaimer') >= 14);
    assert(await size('.schedule-title') >= 20);
    await noOverflow();
    await page.screenshot({path:path.join(output, 'journey-'+width+'.png')});
    if (width < 761) {
      const title = await page.locator('.schedule-title').first().boundingBox();
      const nav = await page.locator('.mobile-nav').boundingBox();
      assert(title.y + title.height <= nav.y, 'first title entirely above bottom navigation: '+JSON.stringify({title,nav}));
    }
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const {root} = await cdp.send('DOM.getDocument');
    const {nodeId} = await cdp.send('DOM.querySelector', {nodeId:root.nodeId, selector:'.schedule-title'});
    const fonts = await cdp.send('CSS.getPlatformFontsForNode', {nodeId});
    console.log('Type', width, {body:await size('.schedule-essential'), fonts:fonts.fonts.map(font=>font.familyName)});
    await page.screenshot({path:path.join(output, 'journey-'+width+'.png')});
    const nav = page.locator(width < 761 ? '.mobile-nav' : '.nav-links');
    await nav.locator('[data-view-link="prepare"]').click();
    assert(await size('.checklist-item') >= 17);
    await page.screenshot({path:path.join(output, 'prepare-'+width+'.png')});
    await nav.locator('a[href="#menu-search"]').click();
    await page.waitForSelector('.lookup-result-card');
    assert(await size('.lookup-result-en') >= 17);
    assert(await size('.lookup-result-meta') >= 14);
    assert(await size('.lookup-menu-select select') >= 16);
    const ratio = await page.evaluate(() => document.querySelector('.search-panel-body').clientHeight / document.querySelector('.search-panel').clientHeight);
    assert(ratio >= .65);
    await page.screenshot({path:path.join(output, 'menu-'+width+'.png')});
    await page.locator('.lookup-crew-trigger').first().click();
    await page.screenshot({path:path.join(output, 'crew-'+width+'.png')});
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => location.hash !== '#crew');
    // Text-only resizing exercises rem scaling without changing the viewport or device pixel ratio.
    await page.evaluate(() => {document.documentElement.style.fontSize = '200%';});
    assert(await size('.lookup-result-en') >= 34);
    await noOverflow();
    await page.screenshot({path:path.join(output, 'large-menu-'+width+'.png')});
    await page.locator('#lookup-menu-restaurant-select').selectOption('nav');
    await page.locator('#lookup-menu-course-row [data-lookup-dining-filter="entree"]').click();
    assert((await page.locator('.lookup-result-list').textContent()).includes('Hainanese Chicken, Rice'), 'enlarged controls remain reachable');
    await page.locator('.lookup-crew-trigger').first().click();
    await page.locator('[data-lookup-crew-close]').click();
    await page.waitForFunction(() => location.hash !== '#crew');
    await page.locator('#search-close-btn').click();
    await page.waitForSelector('#search-overlay[hidden]', {state:'attached'});
    await noOverflow();
    await page.screenshot({path:path.join(output, 'large-text-'+width+'.png')});
    await page.evaluate(() => {document.documentElement.style.fontSize = '';});
    await page.addStyleTag({content:'* {line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important;} p {margin-bottom:2em !important;}'});
    await nav.locator('a[href="#menu-search"]').click();
    await page.waitForSelector('.lookup-result-card');
    await noOverflow();
    await page.locator('.lookup-crew-trigger').first().click();
    await page.locator('[data-lookup-crew-close]').click();
    await page.waitForFunction(() => location.hash !== '#crew');
    await page.locator('#search-close-btn').click();
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('Typography, text-only 200% resizing and user text spacing passed:', output);
} finally { await browser.close(); }
