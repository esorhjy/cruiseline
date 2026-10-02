import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { applyActivityDocument } from '../tools/activity-document-corrections.mjs';
import { applyHandbookMenus } from '../tools/handbook-menu-supplements.mjs';
import { applyDocumentCorrections } from '../tools/menu-document-corrections.mjs';
import { loadSearchHooks } from './search-keyword.smoke.mjs';

const sandbox = { window: {} };
for (const file of ['onboard-lookup-data.js', 'menu-lookup-data.js', 'travel-reference-data.js']) {
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
}
const plain = value => JSON.parse(JSON.stringify(value));
const activity = plain(sandbox.window.ONBOARD_LOOKUP_DATA);
const menu = plain(sandbox.window.MENU_LOOKUP_DATA);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const baseActivities = activity.records.filter(r => !r.documentSupplement);
const baseMenu = menu.records.filter(r => !r.supplementSourceId);
assert.equal(baseActivities.length, 507);
assert.equal(baseMenu.length, 550);
assert.equal(hash(baseActivities.map(r => r.id)), 'a0a3a76db44a04ad95805ae8230a3af067930567158bfab4ed44780f8b5d755b');
assert.equal(hash(baseMenu.map(r => [r.id, r.sourceRecordIndex, r.englishName, r.price])), '2cd031d6e961407138ab86d9f7d56f3d5d0a26f38cf6b4b23cbf9bc9dab642f3');
assert.equal(activity.supplementCount, 43);
assert.equal(menu.supplementCount, 184);
assert.equal(activity.records.length, 550);
assert.equal(menu.records.length, 734);
assert.equal(hash(applyActivityDocument(activity)), hash(activity), 'activity migration idempotent');
assert.equal(hash(applyHandbookMenus(applyDocumentCorrections(menu))), hash(menu), 'menu pipeline idempotent');
for (const data of [activity, menu]) assert.equal(new Set(data.records.map(r => r.id)).size, data.records.length);
for (const r of activity.records) {
  assert(!/^(Kids|Tweens|Teens|Open house)$/i.test(r.englishName), 'complete English name: ' + r.id);
  if (r.documentSupplement) {
    assert(r.sourceRefs.length && r.audience && r.participation && r.feeNote !== undefined);
    assert.equal(r.sourceTimeHint, '', 'no historical time promoted to current');
    assert(!/\b(tasting|jewelry|spa)\b/i.test(r.englishName), 'family scope');
  }
}
for (const r of menu.records.filter(r => r.supplementSourceId)) {
  assert(r.sourceRefs.length && r.mealPeriod && r.descriptionZh !== undefined);
  assert.equal(r.price, '', 'unlisted prices stay unknown');
  assert.deepEqual(r.tags, [], 'do not infer dietary/allergy labels');
}
assert(menu.records.some(r => r.restaurantId === 'room-service' && r.mealPeriod.includes('早餐')));
assert(menu.records.some(r => r.restaurantId === 'mowgli' && r.englishName === 'Tandoori Chicken'));
assert(menu.records.filter(r => r.restaurantId === 'concierge-food').some(r => r.mealPeriod.includes('全日')));

const hooks = loadSearchHooks();
hooks.prepareSearchDocuments();
const lookup = (q, category = 'all') => hooks.getBilingualLookupResults(q, { category, diningFilter:'all', restaurantFilter:'all' }).results;
for (const [query, name] of [
  ['Cosmic Goo', 'Cosmic Goo with Stitch'], ['Gotcha', 'Gotcha Registration'],
  ['Family Movie Fun Time', 'Family Movie Fun Time'], ['兒童舞會', 'Disney Junior Dance Party']
]) assert(lookup(query, 'activity').some(r => r.englishName === name), query);
const gotcha = lookup('Gotcha', 'activity');
assert(gotcha.some(r => r.englishName === 'Gotcha Registration' && r.venueEnglish === 'Edge'));
assert(gotcha.some(r => r.englishName === 'Gotcha Registration' && r.venueEnglish === 'Vibe'));
assert(gotcha.some(r => r.englishName === 'Gotcha!' && r.participation !== 'registration'));
const dances = lookup('Disney Junior', 'activity');
assert(dances.some(r => r.venueEnglish === 'D Lounge' && /全齡/.test(r.audience)));
assert(dances.some(r => /Oceaneer/.test(r.venueEnglish) && /3–10/.test(r.audience)));
const bingo = lookup('Bingo', 'activity');
assert(bingo.some(r => r.englishName === 'Family Bingo' && /付費/.test(r.feeNote)));
assert(bingo.some(r => r.englishName === 'Bingo' && /免費遊戲/.test(r.feeNote)));
for (const query of ['客房早餐', '印度烤雞', '禮賓熱食']) assert(lookup(query, 'dining').some(r => r.sourceType === 'menu-item'), query);
const breakfast = lookup('客房早餐', 'dining').find(r => r.sourceType === 'menu-item');
assert.match(hooks.buildCrewDisplayCard(breakfast), /餐段/);
const registration = gotcha.find(r => r.englishName === 'Gotcha Registration');
const crew = hooks.buildCrewDisplayCard(registration);
assert.match(crew, /Gotcha Registration/);
assert.match(crew, /11–14/);
assert.match(crew, /事先報名/);
assert.match(crew, /活動整理.docx/);
assert(hooks.getRankedSearchResults('緊急電話').results.some(r => (r.parentId || r.id) === 'search-static-local-info-emergency'));
assert(sandbox.window.TRAVEL_REFERENCE_DATA.records.find(r => r.id === 'search-static-local-info-emergency').bodyHtml.includes('+6596389436'));
console.log('Handbook update: 507 + 43 activities; 550 + 184 menus; IDs, repeatability, eligibility, provenance, search and Crew passed.');
