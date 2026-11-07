import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve('.'),output=path.join(os.tmpdir(),'cruise-planner-phase3-qa');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`,key='dcl_itinerary_draft_v1',slot='search-schedule-day2-2-0';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'msedge',headless:true});
const openEditor=async(page,day='day2',id=slot)=>{
    await page.locator(`[data-tab="${day}"]`).click();
    if(await page.locator(`#${day}-planner-toggle`).getAttribute('aria-pressed')!=='true')await page.locator(`#${day}-planner-toggle`).click();
    await page.locator(`#${id}-edit`).click();
};
const submit=page=>page.locator('#planner-form [type="submit"]').click();
const close=page=>page.locator('#planner-dialog [data-planner-close]').first().click();
const manage=async page=>{
    await page.locator('.day-container:not([hidden]) [data-planner-action="manage"]').click();
};
try {
    for(const width of [360,390,1440]) {
        const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
        const page=await context.newPage(),errors=[],requests=[];
        page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
        await page.goto(base);
        await page.evaluate(()=>localStorage.setItem('dcl_checklist_status','{"personal-essentials":true}'));
        await openEditor(page);
        await page.locator('#planner-kind').selectOption('restaurant');await page.locator('#planner-query').fill('毛克利');
        await page.locator('#planner-query').press('Enter');assert(await page.locator('#planner-dialog').evaluate(el=>el.open),'Enter in candidate search does not save');
        await page.locator('#planner-candidate').selectOption('entity:mowglis-eatery');
        await page.locator('.planner-body').evaluate(el=>el.scrollTop=0);
        await page.screenshot({path:path.join(output,`candidates-${width}.png`)});
        assert.equal(await page.locator('#planner-time').inputValue(),'時間待確認');
        await page.locator('#planner-time').fill('12:30');await page.locator('#planner-backup').check();
        await page.screenshot({path:path.join(output,`editor-${width}.png`)});
        assert.equal(await page.locator('.planner-primary').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(24, 49, 61)','save button has visible dark background');
        await submit(page);assert(!(await page.locator('#planner-dialog').evaluate(el=>el.open)));
        assert.match(await page.locator(`#${slot}`).textContent(),/毛克利餐館/);
        assert.match(await page.locator(`#${slot}`).textContent(),/本機備案/);
        assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).edits['search-schedule-day2-2-0'].time.value,key),'12:30');
        assert(!requests.some(x=>x.includes('menu-lookup-data.js')),'editing never loads menus');
        await page.reload();await page.locator('[data-tab="day2"]').click();
        assert.match(await page.locator(`#${slot}`).textContent(),/12:30/);
        await openEditor(page);
        await page.locator('#planner-day').selectOption('day3');await page.locator('#planner-period').selectOption('2');
        await page.locator('#planner-before').selectOption('search-schedule-day3-2-0');await submit(page);
        assert.equal(await page.locator(`#${slot}`).evaluate(el=>el.closest('.day-container').id),'day3');
        assert(await page.locator('#day3').isVisible());
        await page.locator(`#${slot}-target-0`).click();
        assert(await page.locator('#search-deck-deck10-3').isVisible());
        await page.locator('#search-deck-deck10-3 [data-restaurant-menu]').click();await page.waitForSelector('.lookup-result-card');
        assert.equal(await page.locator('#lookup-menu-restaurant-select').inputValue(),'mowgli');
        await page.keyboard.press('Escape');await page.locator('#journey-return-button').click();
        assert(await page.locator(`#${slot}`).isVisible());assert(await page.locator('#day3').isVisible());
        await manage(page);const downloadPromise=page.waitForEvent('download');
        await page.locator('#planner-dialog [data-planner-action="export"]').click();const download=await downloadPromise;
        const exported=fs.readFileSync(await download.path(),'utf8');assert.equal(JSON.parse(exported).schemaVersion,1);
        const saved=await page.evaluate(k=>localStorage.getItem(k),key);
        await page.locator('#planner-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
        assert.match(await page.locator('#planner-error').textContent(),/JSON/);
        assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved);
        await page.locator('#planner-import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(exported)});
        await page.waitForFunction(()=>document.querySelector('#planner-title').textContent==='匯入前確認差異');
        await close(page);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved,'cancel import unchanged');
        await manage(page);await page.locator('#planner-dialog [data-planner-action="reset"]').click();await submit(page);
        assert.equal(await page.evaluate(k=>Object.keys(JSON.parse(localStorage.getItem(k)).edits).length,key),0);
        await manage(page);await page.locator('#planner-dialog [data-planner-action="undo"]').click();
        assert.equal(await page.evaluate(k=>Object.keys(JSON.parse(localStorage.getItem(k)).edits).length,key),1);
        await manage(page);await page.locator('#planner-import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(exported)});
        await page.waitForFunction(()=>document.querySelector('#planner-title').textContent==='匯入前確認差異');await submit(page);
        assert.equal(await page.evaluate(()=>localStorage.getItem('dcl_checklist_status')),'{"personal-essentials":true}');
        // Protected bookings cannot be changed by a casual submit.
        await openEditor(page,'day1','search-schedule-day1-2-0');await page.locator('#planner-time').fill('21:00');await submit(page);
        assert.match(await page.locator('#planner-error').textContent(),/勾選確認/);
        await page.locator('#planner-ack').check();await submit(page);
        assert.equal(await page.locator('#search-schedule-day1-2-0 [data-confirmation-status]').getAttribute('data-confirmation-status'),'draft');
        assert.match(await page.locator('#search-schedule-day1-2-0 .planner-official').textContent(),/20:15/);
        // A changed official time conflicts only with that field. Candidate and placement survive.
        await page.route('**/data.js?*',async route=>{
            const response=await route.fetch();await route.fulfill({response,body:(await response.text())+"\ncruiseSchedule[1].periods[2].events[0].time='13:10';"});
        });
        await page.reload();assert.match(await page.locator('#planner-status').textContent(),/正式版本不同/);
        await page.locator('[data-tab="day3"]').click();assert.match(await page.locator(`#${slot} .schedule-time`).textContent(),/13:10/);
        await page.locator('#day3-planner-toggle').click();await manage(page);await page.locator('[data-planner-action="resolve"]').click();
        await page.locator('[data-conflict="0"]').selectOption('draft');await page.locator('#planner-ack').check();await submit(page);
        assert.match(await page.locator(`#${slot} .schedule-time`).textContent(),/12:30/);
        // Native modal remains scrollable at 200% text and spacing overrides.
        await openEditor(page,'day3',slot);
        await page.addStyleTag({content:'html{font-size:32px!important} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}'});
        assert(await page.locator('.planner-body').evaluate(el=>el.scrollHeight>el.clientHeight));
        await page.locator('.planner-body').evaluate(el=>el.scrollTop=el.scrollHeight);
        assert(await page.locator('.planner-body').evaluate(el=>el.scrollTop>0));
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        assert(await page.locator('#planner-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
        await page.screenshot({path:path.join(output,`editor-zoom-${width}.png`)});await page.keyboard.press('Escape');
        assert.deepEqual(errors,[]);
        console.log(`Planner edit/move/menu/return/backup/import/conflict/zoom ${width} PASS`);await context.close();
    }
    const landscape=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'}),lp=await landscape.newPage();
    await lp.goto(base);await openEditor(lp);await lp.addStyleTag({content:'html{font-size:32px!important} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}'});
    assert(await lp.locator('.planner-body').evaluate(el=>el.clientHeight>40 && el.scrollHeight>el.clientHeight));
    assert(await lp.locator('.planner-footer').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight));
    await lp.keyboard.press('Escape');await landscape.close();
    // Activity targets route to their venue and unfold, including unknown locations.
    const activities=await browser.newContext({serviceWorkers:'block'}),ap=await activities.newPage();await ap.goto(base);
    await openEditor(ap);await ap.locator('#planner-kind').selectOption('activity');await ap.locator('#planner-candidate').selectOption('activity:onboard-001');await submit(ap);
    assert.match(await ap.locator(`#${slot} .schedule-time`).textContent(),/時間待確認/);
    await ap.locator(`#${slot}-target-0`).click();assert(await ap.locator('#explore-activity-onboard-001').isVisible());
    assert(await ap.locator('#explore-activity-onboard-001').evaluate(el=>el.open));assert.equal(await ap.locator('#deck-filter').inputValue(),'unknown');
    await ap.locator('#explore-activity-onboard-001 [data-search-query]').click();await ap.waitForSelector('.lookup-result-card');
    await ap.keyboard.press('Escape');await ap.locator('#journey-return-button').click();assert(await ap.locator(`#${slot}`).isVisible());
    await openEditor(ap);await ap.locator('#planner-kind').selectOption('rest');await ap.locator('#planner-candidate').selectOption('rest');await submit(ap);
    assert.match(await ap.locator(`#${slot} .schedule-title`).textContent(),/休息/);
    await ap.locator(`#${slot} [data-planner-action="reset"]`).click();await submit(ap);
    assert.equal(await ap.evaluate(k=>Object.keys(JSON.parse(localStorage.getItem(k)).edits).length,key),0);await activities.close();
    // Saving disabled: no false saved message, downloadable in-memory draft.
    const blocked=await browser.newContext({serviceWorkers:'block'}),p=await blocked.newPage();
    await p.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='dcl_itinerary_draft_v1')throw new DOMException('blocked','QuotaExceededError');return original.call(this,k,v);};});
    await p.goto(base);await openEditor(p);await p.locator('#planner-time').fill('早餐後');await submit(p);
    assert.match(await p.locator('#planner-status').textContent(),/未能安全儲存/);assert.match(await p.locator(`#${slot}`).textContent(),/早餐後/);await blocked.close();
    // Corrupt storage is preserved, rather than silently replaced on the next edit.
    const bad=await browser.newContext({serviceWorkers:'block'}),b=await bad.newPage();await b.goto(base);await b.evaluate(k=>localStorage.setItem(k,'{bad'),key);await b.reload();
    await openEditor(b);await b.locator('#planner-time').fill('稍後');await submit(b);assert.match(await b.locator('#planner-error').textContent(),/先匯出原記錄/);
    assert.equal(await b.evaluate(k=>localStorage.getItem(k),key),'{bad');await bad.close();
    // Concurrent tab change requires explicit reload, never overwrites the other draft.
    const tabs=await browser.newContext({serviceWorkers:'block'}),a=await tabs.newPage(),other=await tabs.newPage();
    await a.goto(base);await other.goto(base);await openEditor(other);await other.locator('#planner-time').fill('14:00');await submit(other);
    await a.waitForFunction(()=>document.querySelector('#planner-status').textContent.includes('另一個分頁'));
    await openEditor(a);await a.locator('#planner-time').fill('15:00');await submit(a);assert.match(await a.locator('#planner-error').textContent(),/另一分頁/);
    assert.equal(await a.evaluate(k=>JSON.parse(localStorage.getItem(k)).edits['search-schedule-day2-2-0'].time.value,key),'14:00');await tabs.close();
    // Core cache includes planner; offline edit and refresh remain available.
    const offline=await browser.newContext(),op=await offline.newPage();await op.goto(base);await op.evaluate(()=>navigator.serviceWorker.ready);await op.reload();
    await op.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));await offline.setOffline(true);await op.reload();
    await openEditor(op);await op.locator('#planner-time').fill('午餐後');await submit(op);await op.reload();await op.locator('[data-tab="day2"]').click();
    assert.match(await op.locator(`#${slot}`).textContent(),/午餐後/);await offline.close();
    console.log('Planner storage failure/corrupt data/concurrent tabs/offline PASS. Screenshots: '+output);
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
