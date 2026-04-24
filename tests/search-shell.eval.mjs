import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
const scriptJs = fs.readFileSync(path.resolve('script.js'), 'utf8');
const swJs = fs.readFileSync(path.resolve('sw.js'), 'utf8');
const devVarsExamplePath = path.resolve('.dev.vars.example');
const devVarsExample = fs.existsSync(devVarsExamplePath)
  ? fs.readFileSync(devVarsExamplePath, 'utf8')
  : '';

assert(!indexHtml.includes('search-ai-answer'), 'index.html should not render an AI answer pane');
assert(!indexHtml.includes('search-mode-switch'), 'index.html should not include search mode toggles');
assert(!indexHtml.includes('/api/ai-answer'), 'index.html should not point to an AI endpoint');
assert(indexHtml.includes('id="search-results"'), 'index.html should keep the keyword search results container');
assert(indexHtml.includes('search-quick-chips'), 'index.html should expose quick search chips');
assert(indexHtml.includes('search-embark-panel'), 'index.html should expose the Day 1 quick panel');
assert(indexHtml.includes('1772539078755-hero.jpg'), 'index.html should use the optimized hero image');

const indexBuildMatch = indexHtml.match(/window\.__DCL_GUIDE_BUILD__ = '([^']+)'/);
const swBuildMatch = swJs.match(/APP_BUILD_ID = '([^']+)'/);
assert(indexBuildMatch, 'index.html should expose a build id');
assert(swBuildMatch, 'sw.js should expose the service worker build id');
assert.equal(indexBuildMatch[1], swBuildMatch[1], 'index.html and sw.js build ids should stay in sync');

assert(!scriptJs.includes('requestAiAnswer('), 'script.js should not include AI answer requests');
assert(!scriptJs.includes("activeMode: 'ai'"), 'script.js should not keep AI mode state');
assert(!scriptJs.includes('EXPECTED_WORKER_SCHEMA_VERSION'), 'script.js should not keep worker schema checks');
assert(scriptJs.includes('buildSearchResultSummaryLine('), 'script.js should build a single summary line for each result card');
assert(scriptJs.includes('dedupeSearchResults('), 'script.js should dedupe ranked search results');
assert(!scriptJs.includes('search-result-highlights'), 'script.js should not render highlight lists in result cards');
assert(!scriptJs.includes('search-result-snippet'), 'script.js should not render snippet blocks in result cards');
assert(!scriptJs.includes('search-result-location'), 'script.js should not render a duplicated location row in result cards');

assert(!swJs.includes('/api/ai-answer'), 'sw.js should not special-case AI endpoints');
assert(swJs.includes('1772539078755-hero.jpg'), 'sw.js should cache the optimized hero image');
assert(!devVarsExample.includes('GEMINI'), '.dev.vars.example should not advertise Gemini secrets in the pure keyword-search build');
