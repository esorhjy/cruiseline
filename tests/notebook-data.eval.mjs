import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadSearchHooks } from './search-keyword.smoke.mjs';

const source = fs.readFileSync('data.js', 'utf8');
const data = vm.runInNewContext(source + '\n({cruiseSchedule, deckGuideData, showGuideData, playbookGuideData})');
const all = [
  ...data.cruiseSchedule.flatMap(day => day.periods.flatMap(period => period.events)),
  ...data.deckGuideData.flatMap(deck => deck.facilities),
  ...data.showGuideData.flatMap(group => group.shows),
  ...data.playbookGuideData.flatMap(group => group.items)
];
assert.equal(all.length, 127);
assert.equal(new Set(all.map(item => item.id)).size, all.length);
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync('travel-reference-data.js','utf8'), sandbox);
const notes = sandbox.window.TRAVEL_REFERENCE_DATA;
const known = new Set([...all.map(item => item.id), ...notes.records.map(item => item.id)]);
Object.values(notes.redirects).forEach(id => assert(known.has(id), 'redirect destination exists: ' + id));
notes.records.forEach(record => {
  assert(record.bodyHtml && record.title && record.id);
  if (record.targetId) assert(known.has(record.targetId));
});
assert.equal(notes.records.length + Object.keys(notes.redirects).length, 21, 'all former static cards have a destination');

const before = loadSearchHooks();
before.prepareSearchDocuments();
const after = loadSearchHooks(data => {
  data.cruiseSchedule.reverse().forEach(day => day.periods.reverse().forEach(period => period.events.reverse()));
  data.deckGuideData.reverse().forEach(deck => deck.facilities.reverse());
  data.showGuideData.reverse().forEach(group => group.shows.reverse());
  data.playbookGuideData.reverse().forEach(group => group.items.reverse());
  return data;
});
after.prepareSearchDocuments();
const docMap = new Map(after.getSearchDocuments().map(doc => [doc.id, doc]));
before.getSearchDocuments().forEach(doc => {
  const other = docMap.get(doc.id);
  assert(other, 'stable search id survives reordering: ' + doc.id);
  assert.equal(other.title, doc.title);
  assert.deepEqual(JSON.parse(JSON.stringify(other.canonicalEntityIds || [])), JSON.parse(JSON.stringify(doc.canonicalEntityIds || [])));
  assert.equal(other.navTarget?.itemId, doc.navTarget?.itemId);
});

const scope = 'https://example.com/cruiseline/';
const sw = vm.runInNewContext(fs.readFileSync('sw.js','utf8') + '\n({isCoreAssetRequest, CORE_ASSETS_TO_CACHE})', {
  URL,
  self: {location:new URL(scope+'sw.js'), registration:{scope}, addEventListener(){}, skipWaiting(){} }
});
assert(sw.isCoreAssetRequest({url:scope+'travel-reference-data.js?v=test',mode:'cors'}));
assert(sw.isCoreAssetRequest({url:scope+'style.css?v=test',mode:'cors'}));
assert(!sw.isCoreAssetRequest({url:scope+'menu-lookup-data.js?v=test',mode:'cors'}));
assert(!sw.CORE_ASSETS_TO_CACHE.includes('1772539078755.png'), 'unused full-size source image is not precached');
console.log('Notebook data: all 127 cards, 21 legacy cards, reordered IDs, and scoped cache passed.');
