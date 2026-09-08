import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { loadSearchHooks } from './search-keyword.smoke.mjs';
import { applyDocumentCorrections } from '../tools/menu-document-corrections.mjs';

const data = vm.runInNewContext(fs.readFileSync('data.js', 'utf8')
  + ';({cruiseSchedule,deckGuideData,showGuideData,playbookGuideData,checklistData})');
const events = data.cruiseSchedule.flatMap(day => day.periods.flatMap(period => period.events));
const all = [...events, ...data.deckGuideData.flatMap(deck => deck.facilities),
  ...data.showGuideData.flatMap(group => group.shows), ...data.playbookGuideData.flatMap(group => group.items)];
const byId = id => all.find(item => item.id === id);
const text = id => JSON.stringify(byId(id));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const newIds = ["search-deck-deck6-navigators-club","search-deck-deck9-animators-table","search-deck-deck8-nursery","search-show-mickey-color-spin","search-playbook-dining-pairs","search-playbook-drink-offers","search-playbook-rainforest-day-pass"];
assert.equal(all.length, 127);
assert.equal(hash(all.filter(item => !newIds.includes(item.id)).map(item => item.id).sort()),
  '3a69ada48fcecd1a92976a7d50af17b18ca317dad368057fc3b99b95748081dc', 'all 120 previous card IDs retained');
assert.equal(hash(data.checklistData.flatMap(group => group.items).map(item => item.id).sort()),
  '224f7d81c0b98da91980399bd239c19d46deacb5c7c1b3e906267ee6138dd191', 'existing checklist storage keys retained');
assert.match(text('search-playbook-embark-sprint-1'), /13:30.*18:00/);
assert.match(text('search-schedule-day1-1-3'), /每人刷卡/);
assert.match(text('search-playbook-daily-ops-7'), /DCL-GUEST.*出生日期.*房號.*dclwifi.com/);
assert(!fs.readFileSync('data.js', 'utf8').includes('login.com'));
assert.match(text('search-playbook-stateroom-family-0'), /US\$25/);
assert.match(text('search-deck-deck8-0'), /自行如廁/);
assert.match(text('search-deck-deck7-0'), /貼紙/);
assert.match(text('search-playbook-daily-ops-4'), /未滿 8 歲/);
assert.match(text('search-deck-deck11-2'), /10 歲以上/);
assert.match(text('search-deck-deck8-nursery'), /6 個月至 3 歲.*1 小時/);
assert.match(text('search-playbook-last-night-0'), /22:00.*00:00/);
assert.match(text('search-playbook-last-night-1'), /06:30.*08:00.*09:00/);
assert.match(text('search-playbook-dining-pairs'), /三晚航程.*不套用四晚/);
assert.match(text('search-playbook-rainforest-day-pass'), /沒有甲板位置/);
assert(data.deckGuideData.find(deck => deck.id === 'deck6').facilities.some(item => item.id === 'search-deck-deck5-0'));
assert(data.showGuideData.find(group => group.id === 'stage-musicals').shows.some(item => item.id === 'search-show-garden-shows-1'));

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync('menu-lookup-data.js','utf8'), sandbox);
const menu = JSON.parse(JSON.stringify(sandbox.window.MENU_LOOKUP_DATA));
assert.equal(menu.records.length, 550);
assert.equal(menu.sourceCount, 550);
assert.equal(hash(menu.records.map(item => [item.id, item.sourceRecordIndex, item.englishName, item.price])),
  '2cd031d6e961407138ab86d9f7d56f3d5d0a26f38cf6b4b23cbf9bc9dab642f3', 'menu identities, order and snapshot prices retained');
assert.equal(hash(applyDocumentCorrections(menu)), hash(menu), 'corrections are repeatable without accumulating text');
for (const english of ["Dead Man's Chest", 'Teatime Tini', "Bruno's Fizz", 'Beignet Shake']) {
  const item = menu.records.find(record => record.englishName === english);
  assert(item.descriptionZh.length > 0);
  assert.equal(item.courseGroup, 'drinks');
  assert.equal(item.crewPhrase, 'Could I order this drink, please?');
}
assert(menu.records.filter(record => record.restaurantId === 'bev-garden').every(record => record.restaurantEnglish === 'Garden Bar'));

const hooks = loadSearchHooks();
hooks.prepareSearchDocuments();
for (const [query, expected] of [
  ['dclwifi.com', 'search-playbook-daily-ops-7'],
  ['Rainforest Day Pass', 'search-playbook-rainforest-day-pass'],
  ['咖啡集點', 'search-playbook-drink-offers']
]) {
  assert(hooks.getRankedSearchResults(query).results.some(record => record.id === expected || record.parentId === expected), query);
}
for (const english of ["Bruno's Fizz", 'Beignet Shake']) {
  const results = hooks.getBilingualLookupResults(english, {category:'dining', diningFilter:'drinks', restaurantFilter:'all'}).results;
  assert(results.some(record => record.englishName === english), english + ' found in drinks');
  assert(hooks.buildCrewDisplayCard(results.find(record => record.englishName === english)).includes('Could I order this drink, please?'));
}
for (const english of ['Animator’s Table', 'Infinite Bliss Spa', 'Rainforest Day Pass']) {
  assert(hooks.getBilingualLookupResults(english, {category:'all'}).results.length > 0, english);
}
console.log('Boarding update: source rules, stable IDs, complete menu, lookup and Crew checks passed.');
