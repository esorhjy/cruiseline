import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
const scriptJs = fs.readFileSync(path.resolve('script.js'), 'utf8');
const swJs = fs.readFileSync(path.resolve('sw.js'), 'utf8');
const styleCss = fs.readFileSync(path.resolve('style.css'), 'utf8');
const generatorJs = fs.readFileSync(path.resolve('tools/generate-menu-lookup-data.mjs'), 'utf8');
const devVarsExamplePath = path.resolve('.dev.vars.example');
const devVarsExample = fs.existsSync(devVarsExamplePath)
  ? fs.readFileSync(devVarsExamplePath, 'utf8')
  : '';

assert(!indexHtml.includes('search-ai-answer'), 'index.html should not render an AI answer pane');
assert(!indexHtml.includes('search-mode-switch'), 'index.html should not include search mode toggles');
assert(!indexHtml.includes('/api/ai-answer'), 'index.html should not point to an AI endpoint');
assert(indexHtml.includes('id="search-results"'), 'index.html should keep the keyword search results container');
assert(indexHtml.includes('id="quick-start"'), 'index.html should expose a lightweight quick-start guide');
assert(indexHtml.includes('search-command-bar'), 'index.html should use a compact search command bar');
assert(indexHtml.includes('id="search-shortcut-toggle"'), 'index.html should expose a compact shortcut drawer toggle');
assert(indexHtml.includes('id="search-shortcut-drawer" hidden'), 'quick search chips should be collapsed by default');
assert(indexHtml.includes('search-chip-groups'), 'index.html should preserve grouped quick search chips inside the drawer');
assert(indexHtml.includes('search-chip-group'), 'index.html should keep quick chips collapsible by task');
assert(indexHtml.includes('data-search-tool-mode="lookup"'), 'index.html should expose the bilingual lookup mode');
assert(indexHtml.includes('lookup-filter-strip'), 'index.html should expose compact bilingual lookup category filters');
assert(indexHtml.includes('id="lookup-dining-filter-row"'), 'index.html should expose compact dining filters for lookup mode');
assert(indexHtml.includes('id="lookup-menu-restaurant-select"'), 'lookup overlay should expose a restaurant selector for dining mode');
assert(indexHtml.includes('id="lookup-menu-course-row"'), 'lookup overlay should expose compact course filters for dining mode');
assert(indexHtml.includes('onboard-lookup-data.js'), 'index.html should load onboard lookup data');
assert(!indexHtml.includes('<script src="menu-lookup-data.js'), 'index.html should lazy-load menu lookup data instead of blocking the homepage');
assert(indexHtml.includes('id="menu-lookup"'), 'index.html should expose the main menu quick lookup section');
assert(indexHtml.includes('id="menu-group-filters"'), 'menu lookup should expose restaurant group filters');
assert(indexHtml.includes('id="menu-category-filters"'), 'menu lookup should expose category filters');
assert(indexHtml.includes('menu-restaurant-panel'), 'menu lookup should render restaurant-first navigation');
assert(indexHtml.includes('1772539078755-hero.jpg'), 'index.html should use the optimized hero image');

const indexBuildMatch = indexHtml.match(/window\.__DCL_GUIDE_BUILD__ = '([^']+)'/);
const swBuildMatch = swJs.match(/APP_BUILD_ID = '([^']+)'/);
assert(indexBuildMatch, 'index.html should expose a build id');
assert(swBuildMatch, 'sw.js should expose the service worker build id');
assert.equal(indexBuildMatch[1], swBuildMatch[1], 'index.html and sw.js build ids should stay in sync');
const versionedScriptMatches = [...indexHtml.matchAll(/<script src="([^"]+)\?v=([^"]+)"><\/script>/g)];
assert(versionedScriptMatches.length > 0, 'index.html should version script assets');
versionedScriptMatches.forEach((match) => {
  assert.equal(match[2], indexBuildMatch[1], `${match[1]} query version should match the app build id`);
});

assert(!scriptJs.includes('requestAiAnswer('), 'script.js should not include AI answer requests');
assert(!scriptJs.includes("activeMode: 'ai'"), 'script.js should not keep AI mode state');
assert(!scriptJs.includes('EXPECTED_WORKER_SCHEMA_VERSION'), 'script.js should not keep worker schema checks');
assert(scriptJs.includes('buildSearchResultSummaryLine('), 'script.js should build a single summary line for each result card');
assert(scriptJs.includes('dedupeSearchResults('), 'script.js should dedupe ranked search results');
assert(scriptJs.includes('getBilingualLookupResults('), 'script.js should expose bilingual lookup search helpers');
assert(scriptJs.includes('buildMenuItemLookupRecords('), 'script.js should build menu lookup records');
assert(scriptJs.includes('loadMenuLookupData('), 'script.js should lazy-load the menu lookup data');
assert(scriptJs.includes('data-menu-load-action'), 'script.js should render retry/load controls for menu data');
assert(scriptJs.includes('initializeMenuQuickLookup('), 'script.js should initialize the main menu quick lookup section');
assert(scriptJs.includes('getMenuRestaurantOptions('), 'script.js should expose restaurant-first menu helpers');
assert(scriptJs.includes('data-menu-course-filter'), 'script.js should render course filters for menu browsing');
assert(scriptJs.includes('data-menu-description-id'), 'script.js should let menu cards expand source descriptions');
assert(scriptJs.includes('buildCrewDisplayCard('), 'script.js should render a Crew-facing display card');
assert(scriptJs.includes('setShortcutDrawerOpen('), 'script.js should manage collapsed shortcut drawer state');
assert(!scriptJs.includes('search-result-highlights'), 'script.js should not render highlight lists in result cards');
assert(!scriptJs.includes('search-result-snippet'), 'script.js should not render snippet blocks in result cards');
assert(!scriptJs.includes('search-result-location'), 'script.js should not render a duplicated location row in result cards');

assert(!swJs.includes('/api/ai-answer'), 'sw.js should not special-case AI endpoints');
assert(swJs.includes('1772539078755-hero.jpg'), 'sw.js should cache the optimized hero image');
assert(swJs.includes('onboard-lookup-data.js'), 'sw.js should cache onboard lookup data');
assert(!swJs.includes('menu-lookup-data.js'), 'sw.js should not precache the large menu lookup data file');
assert(!devVarsExample.includes('GEMINI'), '.dev.vars.example should not advertise Gemini secrets in the pure keyword-search build');

assert(styleCss.includes('.lookup-workspace.has-crew-preview'), 'style.css should give lookup mode a preview workspace');
assert(styleCss.includes('grid-template-columns: minmax(360px, 1fr) minmax(320px, 420px)'), 'desktop lookup preview should use a right-side pane');
assert(styleCss.includes('.lookup-crew-pane') && styleCss.includes('position: fixed'), 'mobile Crew card should be able to display as a bottom sheet');
assert(styleCss.includes('.search-command-bar'), 'style.css should style the compact command bar');
assert(styleCss.includes('.lookup-inline-label'), 'lookup micro labels should have compact bilingual helper styling');
assert(styleCss.includes('.lookup-dining-filter-strip'), 'style.css should style lookup dining filters compactly');
assert(styleCss.includes('.menu-lookup-workspace.has-crew-preview'), 'style.css should give the menu quick lookup a right-side Crew pane');
assert(styleCss.includes('.menu-restaurant-panel'), 'style.css should style the restaurant-first menu panel');
assert(styleCss.includes('.menu-lookup-result-section'), 'style.css should group menu results by restaurant or course');
assert(styleCss.includes('.menu-lookup-description'), 'style.css should style expanded menu descriptions');
assert(styleCss.includes('.menu-crew-pane') && styleCss.includes('position: fixed'), 'mobile menu Crew card should be able to display as a bottom sheet');

assert(generatorJs.includes('SOURCE_PAGE_URL') && generatorJs.includes('SOURCE_DATA_URL'), 'menu generator should keep source URLs explicit');
assert(generatorJs.includes('COURSE_CATEGORY_MAP'), 'menu generator should encode course grouping rules');
