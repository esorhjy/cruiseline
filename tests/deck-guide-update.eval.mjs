import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { loadSearchHooks } from './search-keyword.smoke.mjs';

const data = vm.runInNewContext(fs.readFileSync('data.js', 'utf8')
  + ';({cruiseSchedule,deckGuideData,showGuideData,playbookGuideData,checklistData})');
const events = data.cruiseSchedule.flatMap(day => day.periods.flatMap(period => period.events));
const all = [...events, ...data.deckGuideData.flatMap(deck => deck.facilities),
  ...data.showGuideData.flatMap(group => group.shows), ...data.playbookGuideData.flatMap(group => group.items)];
const additions = ['search-deck-deck9-health-center', 'search-deck-deck16-laundry', 'search-deck-deck10-cosmic-kebabs'];
const beforeIds = all.map(item => item.id).filter(id => !additions.includes(id)).sort();
assert.equal(all.length, 132);
assert.equal(events.length, 38);
assert.equal(new Set(all.map(item => item.id)).size, all.length);
assert.equal(createHash('sha256').update(beforeIds.join('\n')).digest('hex'),
  '756c8f09a22320ef2541ed9d41825cbd2351bb8953dbdfe3abf72eedc4d10f55', 'all original 129 card IDs retained');
const deckIds = Array.from(data.deckGuideData, deck => deck.id);
assert.deepEqual(deckIds.slice(deckIds.indexOf('deck11'), deckIds.indexOf('deck17') + 1), ['deck11', 'deck16', 'deck17']);
const text = id => JSON.stringify(all.find(item => item.id === id));
assert.match(text(additions[0]), /Deck 9 船頭/);
assert.match(text(additions[1]), /船頭是影片提供的找路線索/);
assert.match(text(additions[2]), /不保證固定品項/);
assert.match(text('search-deck-deck7-2'), /四.*影廳/);
assert.match(text('search-deck-deck5-0'), /下層.*Deck 6.*上層.*Deck 7/);
assert.match(text('search-deck-deck8-3'), /船尾電梯/);
assert.match(text('search-playbook-stateroom-family-4'), /不假定 App/);
assert.match(text('search-playbook-daily-ops-4'), /不應預期能簽名/);
assert.match(text('search-playbook-family-planning-1'), /不代表所有晚間場次都適合兒童/);
assert.match(text('search-schedule-day1-2-0'), /硬式資料夾/);
assert.match(text('search-schedule-day3-4-0'), /船尾電梯/);
assert.match(text('search-schedule-day3-moana'), /曝曬.*室內活動/);
const folder = data.checklistData.flatMap(group => group.items).filter(item => item.id === 'artwork-folder');
assert.equal(folder.length, 1);
assert(!folder[0].checked, 'new task is not prechecked');

const hooks = loadSearchHooks();
hooks.prepareSearchDocuments();
for (const [query, id] of [
  ['醫務中心', additions[0]], ['Health Center', additions[0]],
  ['洗衣', additions[1]], ['Laundry', additions[1]], ['Deck 16', additions[1]],
  ['Cosmic Kebabs', additions[2]], ['Hollywood 怎麼走', 'search-deck-deck8-3'],
  ['劇院上下層入口', 'search-deck-deck5-0'], ['畫作資料夾', 'search-deck-deck9-animators-table']
]) {
  const results = hooks.getRankedSearchResults(query).results;
  assert(results.slice(0, 8).some(record => record.id === id || record.parentId === id), query + ' reaches its primary card');
}
for (const query of ['Health Center', 'Laundry']) {
  const results = hooks.getBilingualLookupResults(query, { category: 'service' }).results;
  assert(results.length > 0, query + ' available in services lookup');
  assert(results.some(record => hooks.buildCrewDisplayCard(record).includes(query)), query + ' usable in Crew');
}
console.log('Deck guide update: 129 old IDs, 3 additions, 38 events, service lookup and focused search passed.');
