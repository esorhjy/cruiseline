import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('.');
const output = path.join(os.tmpdir(), 'cruise-journey-phase1-qa');
fs.mkdirSync(output, {recursive: true});
const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
    const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png'};
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
try {
    for (const viewport of [{width: 390, height: 844}, {width: 1440, height: 900}]) {
        const context = await browser.newContext({viewport, serviceWorkers: 'block', reducedMotion: 'reduce'});
        const page = await context.newPage();
        const errors = [], requests = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('request', request => requests.push(request.url()));
        await page.addInitScript(() => localStorage.setItem('dcl_checklist_status', '{"personal-essentials":true}'));
        await page.goto(base, {waitUntil: 'load'});
        assert.equal(await page.locator('.schedule-item').count(), 38);
        assert.equal(await page.locator('[data-confirmation-status="confirmed"]').count(), 4);
        assert.equal(await page.locator('.event-detail[open]').count(), 0);
        assert(!requests.some(url => url.includes('menu-lookup-data.js')), 'no eager menu loading');
        assert(await page.evaluate(() => cruiseSchedule.every(day => day.periods.every(period => period.events.every(event => {
            const paragraphs = [...document.querySelectorAll(`#${event.id}-detail > ul > li`)];
            return paragraphs.length === event.desc.length && paragraphs.every((li, i) => {
                const node = document.createElement('div'); node.innerHTML = event.desc[i];
                return li.innerHTML === node.innerHTML;
            });
        })))), 'every original paragraph remains available');

        // No hash change is required when the user switches days.
        await page.locator('[data-tab="day3"]').click();
        assert((await page.locator('#search-schedule-day3-royal-gathering .schedule-time').textContent()).includes('已確認'));
        assert((await page.locator('#search-schedule-day3-moana .schedule-time').textContent()).includes('待確認'));
        await page.locator('#search-schedule-day3-royal-gathering').scrollIntoViewIfNeeded();
        await page.screenshot({path: path.join(output, `day3-morning-${viewport.width}.png`)});
        await page.locator('#search-schedule-day3-royal-gathering-detail > summary').click();
        const dinner = 'search-schedule-day3-4-0';
        const trigger = page.locator(`#${dinner}-target-0`);
        await trigger.scrollIntoViewIfNeeded();
        await page.screenshot({path: path.join(output, `itinerary-${viewport.width}.png`)});
        await trigger.click();
        await page.waitForSelector('#search-deck-deck8-3');
        const origin = await page.evaluate(() => history.state.journeyReturn);
        assert.equal(origin.dayId, 'day3');
        assert(await page.locator('#search-deck-deck8-3 > details').first().evaluate(el => el.open));
        assert.match(await page.locator('#journey-return-button').textContent(), /1\/27/);
        await page.locator('#search-deck-deck8-3 [data-restaurant-menu]').click();
        await page.waitForSelector('.lookup-result-card');
        assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), 'nav');
        assert.equal(await page.locator('#search-input').inputValue(), '');
        assert(!(await page.locator('#search-input').evaluate(el => document.activeElement === el)), 'no unwanted mobile keyboard');
        await page.locator('#lookup-menu-course-row [data-lookup-dining-filter="entree"]').click();
        const crew = page.locator('.lookup-crew-trigger').last();
        await crew.scrollIntoViewIfNeeded();
        const menuScroll = await page.locator('#search-panel-body').evaluate(el => el.scrollTop);
        await crew.click();
        assert(await page.locator('.lookup-crew-card').isVisible());
        await page.goBack();
        await page.waitForFunction(() => location.hash !== '#crew');
        assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), 'nav');
        assert.equal(await page.locator('#search-panel-body').evaluate(el => el.scrollTop), menuScroll);
        assert(await crew.evaluate(el => document.activeElement === el));
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => location.hash === '#search-deck-deck8-3');
        assert(await page.locator('#search-deck-deck8-3 [data-restaurant-menu]').evaluate(el => document.activeElement === el));
        await page.screenshot({path: path.join(output, `restaurant-${viewport.width}.png`)});

        const checkRestored = async () => {
            await page.waitForFunction(() => !document.querySelector('#day3').hidden && document.activeElement?.id === 'search-schedule-day3-4-0-target-0');
            assert(await page.locator('#search-schedule-day3-royal-gathering-detail').evaluate(el => el.open));
            assert(Math.abs(await page.evaluate(() => scrollY) - origin.scrollY) <= 2, 'exact itinerary scroll restored');
            assert(await page.locator('#journey-return').evaluate(el => el.hidden));
        };
        await page.goBack();
        await checkRestored();
        await page.goForward();
        await page.waitForSelector('#journey-return:not([hidden])');
        await page.locator('#journey-return-button').click();
        await checkRestored();
        assert.equal(await page.evaluate(() => localStorage.getItem('dcl_checklist_status')), '{"personal-essentials":true}');

        // Specific show targets expand without arbitrarily picking a different show.
        await page.locator('#search-schedule-day3-moana-target-0').click();
        await page.waitForSelector('#search-show-open-air-night-0');
        assert(await page.locator('#search-show-open-air-night-0 details').evaluate(el => el.open));
        await page.locator('#journey-return-button').click();
        await page.waitForFunction(() => document.activeElement?.id === 'search-schedule-day3-moana-target-0');
        await page.locator('[data-tab="day1"]').click();
        await page.locator('#search-schedule-day1-2-1-choices > summary').click();
        await page.locator('#search-schedule-day1-2-1-target-0').click();
        await page.waitForSelector('#search-deck-deck5-0');
        assert.equal(await page.locator('#deck-filter').inputValue(), 'deck6');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'search-deck-deck5-0', 'venue route focuses the theatre, not a specific show');
        await page.locator('#journey-return-button').click();
        await page.waitForFunction(() => document.activeElement?.id === 'search-schedule-day1-2-1-target-0');
        await page.locator('#search-schedule-day1-2-1-target-1').click();
        await page.waitForSelector('#search-playbook-concierge-plus-6');
        assert(await page.locator('#search-playbook-concierge-plus-6').evaluate(el => el.open));
        await page.locator('#journey-return-button').click();

        // Direct dinner menus keep the correct pair; opening the normal menu resets it.
        for (const [day, id, restaurant] of [['day1','search-schedule-day1-2-0','animator'], ['day2','search-schedule-day2-4-0','pixar']]) {
            await page.locator(`[data-tab="${day}"]`).click();
            await page.locator(`#${id}-detail > summary`).click();
            await page.locator(`#${id}-detail [data-restaurant-menu]`).click();
            await page.waitForSelector('.lookup-result-card');
            assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), restaurant);
            await page.keyboard.press('Escape');
            await page.waitForSelector('#search-overlay[hidden]', {state:'attached'});
        }
        const nav = page.locator(viewport.width < 761 ? '.mobile-nav' : '.nav-links');
        await nav.locator('a[href="#menu-search"]').click();
        await page.waitForSelector('.lookup-result-card');
        assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), 'all');
        await page.keyboard.press('Escape');
        await page.waitForSelector('#search-overlay[hidden]', {state:'attached'});
        await page.goto(base + '#search-deck-deck17-2', {waitUntil:'load'});
        await page.locator('#search-deck-deck17-2 .restaurant-menu-choices > summary').click();
        assert.equal(await page.locator('#search-deck-deck17-2 [data-restaurant-menu]').count(), 4);
        await page.locator('#search-deck-deck17-2 [data-lookup-restaurant-filter="pizza-planet"]').click();
        await page.waitForSelector('.lookup-result-card');
        assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), 'pizza-planet');
        await page.goto(base + '#day3', {waitUntil:'load'});
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        await page.addStyleTag({content:'* {line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important;} p {margin-bottom:2em !important;}'});
        await page.locator('#search-schedule-day3-moana-target-0').click();
        await page.waitForSelector('#journey-return:not([hidden])');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'new detail/return UI fits at 200% and custom spacing: ' + await page.evaluate(()=>JSON.stringify([...document.querySelectorAll('#explore *')].filter(el=>el.getBoundingClientRect().right>innerWidth).map(el=>[el.tagName,el.className,el.getBoundingClientRect().width]).slice(0,10))));
        const bar = await page.locator('#journey-return-button').boundingBox();
        const header = await page.locator('.sticky-nav').boundingBox();
        assert(bar.y >= header.y + header.height - 1, 'enlarged return control is not under the sticky header');
        await page.screenshot({path: path.join(output, `large-return-${viewport.width}.png`)});
        await page.locator('#journey-return-button').click();
        await page.waitForFunction(() => document.activeElement?.id === 'search-schedule-day3-moana-target-0');
        await page.goto(base + '#search-schedule-day3-royal-gathering', {waitUntil:'load'});
        await page.waitForFunction(() => document.getElementById('search-schedule-day3-royal-gathering-detail').open);
        assert(await page.locator('#day3').isVisible(), 'legacy itinerary links reveal their complete details on the right day');
        assert.deepEqual(errors, []);
        await context.close();
        console.log('Phase 1 journey/menu/return', viewport.width, 'passed');
    }

    // Lazy load errors must retain the chosen restaurant through retry.
    const context = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
    const page = await context.newPage();
    let fail = true;
    await page.route('**/menu-lookup-data.js*', route => fail ? route.abort() : route.continue());
    await page.goto(base + '#search-deck-deck9-animators-table');
    await page.locator('#search-deck-deck9-animators-table [data-restaurant-menu]').click();
    await page.waitForSelector('[data-menu-load-action="retry-search"]');
    assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), 'animator');
    fail = false;
    await page.locator('[data-menu-load-action="retry-search"]').click();
    await page.waitForSelector('.lookup-result-card');
    assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(), 'animator');
    await context.close();
    const fallback = await browser.newContext({serviceWorkers:'block'});
    const fallbackPage = await fallback.newPage();
    await fallbackPage.route('**/journey-presentation-data.js*', route => route.abort());
    await fallbackPage.goto(base);
    assert.equal(await fallbackPage.locator('.schedule-item').count(), 38, 'missing optional presentation must not blank the site');
    assert.match(await fallbackPage.locator('#search-schedule-day1-1-2 .schedule-essential').textContent(), /122.*不穿水鞋/);
    await fallback.close();
    console.log('Restaurant lazy-load retry preserved selection. Screenshots:', output);
} finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
}
