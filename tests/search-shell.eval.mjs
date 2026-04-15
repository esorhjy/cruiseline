import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
const scriptJs = fs.readFileSync(path.resolve('script.js'), 'utf8');
const swJs = fs.readFileSync(path.resolve('sw.js'), 'utf8');

assert(!indexHtml.includes('search-ai-answer'), 'index.html should not render an AI answer pane');
assert(!indexHtml.includes('search-mode-switch'), 'index.html should not include search mode toggles');
assert(!indexHtml.includes('/api/ai-answer'), 'index.html should not point to an AI endpoint');
assert(indexHtml.includes('id="search-results"'), 'index.html should keep the keyword search results container');

assert(!scriptJs.includes('requestAiAnswer('), 'script.js should not include AI answer requests');
assert(!scriptJs.includes("activeMode: 'ai'"), 'script.js should not keep AI mode state');
assert(!scriptJs.includes('EXPECTED_WORKER_SCHEMA_VERSION'), 'script.js should not keep worker schema checks');
assert(scriptJs.includes('buildSearchResultSummaryLine('), 'script.js should build a single summary line for each result card');
assert(scriptJs.includes('dedupeSearchResults('), 'script.js should dedupe ranked search results');
assert(!scriptJs.includes('search-result-highlights'), 'script.js should not render highlight lists in result cards');
assert(!scriptJs.includes('search-result-snippet'), 'script.js should not render snippet blocks in result cards');
assert(!scriptJs.includes('search-result-location'), 'script.js should not render a duplicated location row in result cards');

assert(!swJs.includes('/api/ai-answer'), 'sw.js should not special-case AI endpoints');
