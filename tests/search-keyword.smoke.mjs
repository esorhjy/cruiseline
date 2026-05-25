import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function loadData() {
  const source = fs.readFileSync(path.resolve('data.js'), 'utf8');
  const wrapped = `${source}\nmodule.exports = { cruiseSchedule, deckGuideData, showGuideData, playbookGuideData };`;
  const sandbox = {
    module: { exports: {} },
    exports: {}
  };
  vm.runInNewContext(wrapped, sandbox, { filename: 'data.js' });
  return sandbox.module.exports;
}

function loadSearchHooks() {
  const hooks = {};
  const data = loadData();

  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const windowObject = {
    SEARCH_ENTITY_REGISTRY: {},
    SEARCH_KEYWORD_TAXONOMY: {},
    __SEARCH_TEST_HOOKS__: hooks,
    __SEARCH_SKIP_BOOTSTRAP__: true,
    __DCL_GUIDE_BUILD__: 'test-build',
    matchMedia: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {}
    }),
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    requestAnimationFrame: (callback) => {
      callback(0);
      return 0;
    },
    cancelAnimationFrame() {},
    scrollY: 0,
    scrollTo() {},
    addEventListener() {},
    removeEventListener() {},
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    },
    IntersectionObserver: NoopIntersectionObserver
  };

  const documentObject = {
    documentElement: {
      dataset: {
        appBuild: 'test-build'
      }
    },
    body: {
      classList: {
        add() {},
        remove() {}
      },
      appendChild() {},
      contains() { return false; }
    },
    hidden: false,
    addEventListener(eventName, callback) {
      if (eventName === 'DOMContentLoaded') {
        callback();
      }
    },
    getElementById() {
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };

  const sandbox = {
    window: windowObject,
    document: documentObject,
    localStorage: windowObject.localStorage,
    navigator: { userAgent: 'node' },
    console,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    IntersectionObserver: NoopIntersectionObserver,
    fetch: async () => new Response(JSON.stringify({ current_weather: { temperature: 28, weathercode: 2 } })),
    Request,
    Response,
    Headers,
    cruiseSchedule: data.cruiseSchedule,
    deckGuideData: data.deckGuideData,
    showGuideData: data.showGuideData,
    playbookGuideData: data.playbookGuideData
  };

  const registrySource = fs.readFileSync(path.resolve('search-entity-registry.js'), 'utf8');
  vm.runInNewContext(registrySource, sandbox, { filename: 'search-entity-registry.js' });

  const taxonomySource = fs.readFileSync(path.resolve('search-keyword-taxonomy.js'), 'utf8');
  vm.runInNewContext(taxonomySource, sandbox, { filename: 'search-keyword-taxonomy.js' });

  const onboardLookupSource = fs.readFileSync(path.resolve('onboard-lookup-data.js'), 'utf8');
  vm.runInNewContext(onboardLookupSource, sandbox, { filename: 'onboard-lookup-data.js' });

  const menuLookupSource = fs.readFileSync(path.resolve('menu-lookup-data.js'), 'utf8');
  vm.runInNewContext(menuLookupSource, sandbox, { filename: 'menu-lookup-data.js' });

  const scriptSource = fs.readFileSync(path.resolve('script.js'), 'utf8');
  vm.runInNewContext(scriptSource, sandbox, { filename: 'script.js' });

  return hooks;
}

function loadMenuLookupData() {
  const sandbox = { window: {} };
  const menuLookupSource = fs.readFileSync(path.resolve('menu-lookup-data.js'), 'utf8');
  vm.runInNewContext(menuLookupSource, sandbox, { filename: 'menu-lookup-data.js' });
  return sandbox.window.MENU_LOOKUP_DATA;
}

function titlesFor(hooks, query) {
  const { results } = hooks.getRankedSearchResults(query);
  return results.map((item) => String(item.title || ''));
}

function hasAnyTitle(titles, patterns) {
  return titles.some((title) => patterns.some((pattern) => pattern.test(title)));
}

function uniqueParentCount(results) {
  return new Set(results.map((item) => String(item.parentId || item.id || ''))).size;
}

const hooks = loadSearchHooks();
hooks.prepareSearchDocuments();
const menuData = loadMenuLookupData();

function lookupResultsFor(query, category = 'all', diningFilter = 'all', restaurantFilter = 'all') {
  return hooks.getBilingualLookupResults(query, { category, diningFilter, restaurantFilter }).results;
}

function hasLookupMatch(results, patterns) {
  return results.some((item) => patterns.some((pattern) =>
    pattern.test(String(item.englishName || '')) || pattern.test(String(item.zhLabel || ''))
  ));
}

assert(hooks.getLookupRecords().length >= 1100, 'bilingual lookup should include registry entities, onboard activity records, and menu item records');
assert.equal(menuData.sourceCount, 550, 'menu lookup snapshot should record the current source count');
assert.equal(menuData.records.length, menuData.sourceCount, 'menu lookup snapshot should include every source menu record');
assert.equal(hooks.getMenuLookupRecords().length, menuData.sourceCount, 'menu lookup records should match the local snapshot source count');
assert(menuData.restaurants.length >= 20, 'menu lookup snapshot should include restaurant metadata');
assert(menuData.courseGroups.some((group) => group.id === 'appetizer'), 'menu lookup snapshot should expose course groups');
assert(menuData.records.some((item) => item.descriptionZh && item.descriptionZh.includes('\u9bae\u83c7')), 'menu lookup snapshot should preserve source descriptions');
hooks.getMenuLookupRecords().forEach((item) => {
  assert(item.id, 'each menu item should have an id');
  assert(item.zhLabel, 'each menu item should have a Chinese label');
  assert(item.englishName, 'each menu item should have an English name');
  assert(item.restaurantId, 'each menu item should keep its restaurant id');
  assert(item.restaurantLabel, 'each menu item should keep its restaurant label');
  assert(item.menuCategory, 'each menu item should keep its menu category');
  assert(item.courseGroup, 'each menu item should keep its ordering course group');
  assert(Number.isFinite(item.sourceRecordIndex), 'each menu item should keep its source record index');
  assert(item.searchText, 'each menu item should keep generated search text');
});

const guestServiceLookup = lookupResultsFor('\u5ba2\u52d9\u4e2d\u5fc3');
assert.equal(guestServiceLookup[0]?.englishName, 'Guest Services', 'Chinese Guest Services lookup should surface the official English name');

const diningLookup = lookupResultsFor('\u9910\u5ef3', 'dining');
assert(hasLookupMatch(diningLookup.slice(0, 8), [/Animator/i, /Enchanted Summer/i, /Pixar Market/i]), 'dining lookup should surface major restaurants or quick-service venues');

const hainanLookup = lookupResultsFor('\u6d77\u5357\u96de\u98ef', 'dining');
assert(hasLookupMatch(hainanLookup.slice(0, 6), [/Hainanese Chicken,\s*Rice/i]), 'Hainanese chicken rice should resolve to the English menu name');

const filetLookup = lookupResultsFor('\u9ed1\u80e1\u6912\u83f2\u529b', 'dining');
assert(hasLookupMatch(filetLookup.slice(0, 6), [/Peppered Filet Mignon/i]), 'black-pepper filet should resolve to Peppered Filet Mignon');

const kidsMealLookup = lookupResultsFor('\u5152\u7ae5\u9910', 'dining', 'kids-side');
assert(kidsMealLookup.some((item) => item.sourceType === 'menu-item' && (item.tags || []).includes('kids')), 'kids dining filter should return kids menu items');

const paloLookup = lookupResultsFor('Palo', 'dining', 'all', 'palo-dinner');
assert(paloLookup.some((item) => item.sourceType === 'menu-item' && item.restaurantGroup === 'palo'), 'Palo dining filter should return Palo menu items');

const bachaLookup = lookupResultsFor('Bacha', 'dining', 'drinks', 'bev-bacha');
assert(bachaLookup.some((item) => item.sourceType === 'menu-item' && item.restaurantId === 'bev-bacha'), 'Bacha should return beverage or coffee menu items from Bacha Coffee');

const bubbleTeaLookup = lookupResultsFor('\u73cd\u5976', 'dining', 'drinks');
assert(bubbleTeaLookup.some((item) => /Boba|Tea|Milk/i.test(String(item.englishName || ''))), 'Chinese bubble-tea query should return boba or tea items');

const avengersLookup = lookupResultsFor('Avengers', 'show');
assert(hasLookupMatch(avengersLookup.slice(0, 6), [/Avengers Assemble/i]), 'Avengers lookup should surface the activity/show English name');

const oceaneerLookup = lookupResultsFor('Oceaneer', 'kids');
assert(hasLookupMatch(oceaneerLookup.slice(0, 8), [/Disney Oceaneer Club/i, /Oceaneer/i]), 'Oceaneer lookup should surface kids-club names and activity wording');

const magicShotLookup = lookupResultsFor('Magic Shot', 'photo');
assert(hasLookupMatch(magicShotLookup.slice(0, 8), [/Magic Shot/i, /Pics/i, /Photo/i]), 'Magic Shot lookup should surface photo activity wording and Pics-related locations');

const crewMarkup = hooks.buildCrewDisplayCard(guestServiceLookup[0]);
assert(crewMarkup.includes('Guest Services'), 'crew display card should include the English name');
assert(crewMarkup.includes('\u5ba2\u52d9\u4e2d\u5fc3'), 'crew display card should include the Chinese label');
assert(crewMarkup.includes('Could you help us find this?'), 'crew display card should include the default crew phrase');
assert(crewMarkup.includes('data-lookup-crew-close'), 'crew display card should include a close control for the preview pane or bottom sheet');
assert(crewMarkup.includes('\u7d66\u8239\u54e1\u770b'), 'crew display card should include Chinese helper text for the small Crew heading');
assert(crewMarkup.includes('Question / \u554f\u53e5'), 'crew display card should label the English helper phrase with Chinese context');

const menuCrewMarkup = hooks.buildCrewDisplayCard(hainanLookup.find((item) => /Hainanese/i.test(String(item.englishName || ''))));
assert(menuCrewMarkup.includes('Hainanese Chicken'), 'menu crew card should include the English menu name');
assert(menuCrewMarkup.includes('\u6d77\u5357'), 'menu crew card should include the Chinese menu label');
assert(menuCrewMarkup.includes('Could I order this, please?'), 'menu crew card should use an ordering phrase for menu items');
assert(menuCrewMarkup.includes('Ordering phrase / \u9ede\u9910\u53e5'), 'menu crew card should label the ordering phrase bilingually');

const mainMenuHainan = hooks.getMenuQuickResults('\u6d77\u5357\u96de\u98ef');
assert(hasLookupMatch(mainMenuHainan.slice(0, 4), [/Hainanese Chicken,\s*Rice/i]), 'main menu quick lookup should search menu items by Chinese dish name');

const mainMenuFilet = hooks.getMenuQuickResults('\u9ed1\u80e1\u6912\u83f2\u529b');
assert(hasLookupMatch(mainMenuFilet.slice(0, 4), [/Peppered Filet Mignon/i]), 'main menu quick lookup should search menu items by Chinese translated dish name');

const navAppetizers = hooks.getMenuQuickResults('', 'nav', 'appetizer');
assert(navAppetizers.length > 0, 'Navigator/Hollywood appetizers should produce results');
assert(navAppetizers.every((item) => item.restaurantId === 'nav' && item.courseGroup === 'appetizer'), 'Navigator/Hollywood appetizer filter should only include that restaurant and course');

const navEntrees = hooks.getMenuQuickResults('', 'nav', 'entree');
assert(hasLookupMatch(navEntrees, [/Hainanese Chicken,\s*Rice/i]), 'Navigator/Hollywood entree filter should include Hainanese Chicken, Rice');

const paloDrinks = hooks.getMenuQuickResults('', 'palo-brunch', 'drinks');
assert(hasLookupMatch(paloDrinks, [/Palo Spritz/i, /Bellini/i]), 'Palo Brunch drinks filter should include Palo Spritz or Bellini');

const bachaDrinks = hooks.getMenuQuickResults('', 'bev-bacha', 'drinks');
assert(bachaDrinks.length > 0 && bachaDrinks.every((item) => item.restaurantId === 'bev-bacha' && item.courseGroup === 'drinks'), 'Bacha Coffee drinks filter should only include Bacha drinks');

const allDesserts = hooks.getMenuQuickResults('', 'all', 'dessert');
assert(allDesserts.length > 20, 'all restaurants dessert filter should include cross-restaurant desserts');
assert(new Set(allDesserts.map((item) => item.restaurantId)).size > 2, 'all restaurants dessert filter should span multiple restaurants');

const fullMenuBrowse = hooks.getMenuQuickResults('', 'all', 'all');
assert.equal(fullMenuBrowse.length, menuData.sourceCount, 'main menu browse should not cap all restaurants at 48 records');

const conciergePayload = hooks.getRankedSearchResults('concierge');
const conciergeTitles = conciergePayload.results.map((item) => String(item.title || ''));
assert(conciergeTitles.length > 0, 'concierge should return keyword search results');
assert.deepEqual(new Set(conciergeTitles.slice(0, 2)), new Set(['Concierge Lounge', 'Concierge Sundeck & Pool']), 'concierge should keep lounge and sundeck as the top two results');
assert(!conciergeTitles.slice(0, 6).includes('爆米花桶先進隨身包，不要上船後才想起來'), 'broad playbook cards should not crowd the top concierge results');
assert(!conciergePayload.results.slice(0, 6).some((item) => item.sourceType === 'schedule'), 'schedule cards should not dominate concierge results without schedule intent');
assert.equal(uniqueParentCount(conciergePayload.results), conciergePayload.results.length, 'search results should be deduped by parent');
assert(hasAnyTitle(conciergeTitles, [/Concierge Lounge/i, /Concierge Sundeck/i]), 'concierge query should surface concierge-related results');

const zhConciergeTitles = titlesFor(hooks, '\u79ae\u8cd3');
assert(zhConciergeTitles.length > 0, 'Chinese concierge query should return keyword search results');
assert.deepEqual(new Set(zhConciergeTitles.slice(0, 2)), new Set(['Concierge Lounge', 'Concierge Sundeck & Pool']), 'Chinese concierge query should keep concierge lounge and sundeck at the top');
assert(hasAnyTitle(zhConciergeTitles, [/Concierge Lounge/i, /Concierge Sundeck/i]), 'Chinese concierge query should surface concierge-related results');

const sundeckTitles = titlesFor(hooks, 'Concierge Sundeck');
assert(hasAnyTitle(sundeckTitles, [/Concierge Sundeck/i]), 'Concierge Sundeck query should surface the sundeck result');

const baymaxTitles = titlesFor(hooks, 'Baymax Cinemas');
assert(hasAnyTitle(baymaxTitles, [/Baymax Cinemas/i]), 'Baymax Cinemas query should surface cinema results');

const theatreTitles = titlesFor(hooks, 'Walt Disney Theatre');
assert(hasAnyTitle(theatreTitles, [/Walt Disney Theatre/i, /Disney Seas the Adventure/i, /Remember/i]), 'Walt Disney Theatre query should surface theatre-related results');

const photoTitles = titlesFor(hooks, '\u62cd\u7167');
assert(photoTitles.length > 0, 'photo query should return keyword search results');
assert(hasAnyTitle(photoTitles, [/Pics Photo Shop/i, /Disney Cruise Line Photos/i, /Photo: Unlimited Package/i, /\u62cd\u7167\u5957\u88dd/i]), 'photo query should surface ship photo entities or guide cards');

const shuttersTitles = titlesFor(hooks, 'Shutters');
assert(hasAnyTitle(shuttersTitles, [/Pics Photo Shop/i, /Disney Cruise Line Photos/i, /Photo: Unlimited Package/i]), 'Shutters alias should resolve to Adventure photo entities');

const photoPackageTitles = titlesFor(hooks, 'photo package');
assert(hasAnyTitle(photoPackageTitles, [/Photo: Unlimited Package/i, /\u62cd\u7167\u5957\u88dd/i, /Pics Photo Shop/i]), 'photo package query should surface package-related results');

const photosSystemTitles = titlesFor(hooks, 'Disney Cruise Line Photos');
assert(hasAnyTitle(photosSystemTitles, [/Disney Cruise Line Photos/i, /Pics Photo Shop/i]), 'Disney Cruise Line Photos query should surface the onboard photo system');

const deck9Titles = titlesFor(hooks, 'Deck 9');
assert.equal(deck9Titles[0], 'Pics Photo Observatory', 'Deck 9 query should prioritize the dedicated photo observatory card');

const photoObservatoryTitles = titlesFor(hooks, 'Pics Photo Observatory');
assert.equal(photoObservatoryTitles[0], 'Pics Photo Observatory', 'Pics Photo Observatory query should prioritize the Deck 9 photo card');

const lightsaberTitles = titlesFor(hooks, 'Star Wars Lightsaber');
assert.equal(lightsaberTitles[0], 'Pics Photo Observatory', 'lightsaber query should find the Deck 9 photo observatory card');

const zhLightsaberTitles = titlesFor(hooks, '\u5149\u528d');
assert.equal(zhLightsaberTitles[0], 'Pics Photo Observatory', 'Chinese lightsaber query should find the Deck 9 photo observatory card');

const lanternTitles = titlesFor(hooks, 'Rapunzel Lantern');
assert.equal(lanternTitles[0], 'Pics Photo Observatory', 'Rapunzel lantern query should find the Deck 9 photo observatory card');

const zhLanternTitles = titlesFor(hooks, '\u5929\u71c8');
assert.equal(zhLanternTitles[0], 'Pics Photo Observatory', 'Chinese lantern query should find the Deck 9 photo observatory card');

const frozenPhotoTitles = titlesFor(hooks, '\u51b0\u96ea\u5947\u7de3\u62cd\u7167');
assert.equal(frozenPhotoTitles[0], 'Pics Photo Observatory', 'Frozen photo query should find the Deck 9 photo observatory card');

const thorTitles = titlesFor(hooks, 'Thor hammer');
assert.equal(thorTitles[0], 'Hollywood Spotlight Club', 'Thor hammer query should find the Deck 8 photo spot support card');

const mjolnirTitles = titlesFor(hooks, 'Mjolnir');
assert.equal(mjolnirTitles[0], 'Hollywood Spotlight Club', 'Mjolnir query should find the Deck 8 photo spot support card');

const doryNemoTitles = titlesFor(hooks, 'Dory Nemo');
assert.equal(doryNemoTitles[0], 'Wayfinder Bay + Discovery Reef', 'Dory Nemo query should find the Deck 10 Discovery Reef card');

const sorcererMickeyTitles = titlesFor(hooks, 'Sorcerer Mickey');
assert.equal(sorcererMickeyTitles[0], 'Imagination Garden 上層環繞區', 'Sorcerer Mickey query should find the Deck 11 photo-support card');

const onboardFunTitles = titlesFor(hooks, 'Onboard Fun');
assert.equal(onboardFunTitles[0], '想看的秀先在 Live Shows 點愛心，再排角色見面會', 'Onboard Fun query should find the My Plan booking strategy card');

const roomServiceTitles = titlesFor(hooks, 'Room Service');
assert.equal(roomServiceTitles[0], 'Room Service 很適合儀式感，但一定要提早下單', 'Room Service should prioritize the exact playbook guide over generic Guest Services');

const onboardFirstTitles = titlesFor(hooks, '\u4e0a\u8239\u5148\u505a\u4ec0\u9ebc');
assert.equal(onboardFirstTitles[0], '登船 3 小時 SOP：只跑第一圈，不要一開始就滿船亂衝', 'natural-language embarkation query should surface the Day 1 SOP card first');
assert(hasAnyTitle(onboardFirstTitles.slice(0, 5), [/Oceaneer Club/i, /RFID \u624b\u74b0/, /Toy Story Pool/i]), 'embarkation query should still surface kids/water first-day context');

const sunscreenTitles = titlesFor(hooks, '\u9632\u66ec');
assert.equal(sunscreenTitles[0], 'Toy Story Pool / Splash Pad / Flying Saucer Splash Zone', 'sun-protection query should prioritize the outdoor water deck card');
assert(hasAnyTitle(sunscreenTitles.slice(0, 4), [/\u96a8\u8eab\u5305/, /Toy Story Pool/]), 'sun-protection query should keep packing or water-play support nearby');

const photoSpotTitles = titlesFor(hooks, '\u62cd\u7167\u9ede');
assert.equal(photoSpotTitles[0], 'Pics Photo Observatory', 'photo spot query should prioritize the Deck 9 photo spot card over the photo package guide');

const photoDownloadTitles = titlesFor(hooks, '\u7167\u7247\u8981\u4ec0\u9ebc\u6642\u5019\u4e0b\u8f09');
assert.equal(photoDownloadTitles[0], '拍照套裝怎麼買才不浪費，下載時機更重要', 'photo download query should prioritize the photo package guide');

const gardenRouteTitles = titlesFor(hooks, '\u82b1\u5712\u821e\u53f0\u600e\u9ebc\u8d70');
assert.equal(gardenRouteTitles[0], 'Disney Imagination Garden', 'garden stage route query should prioritize the Imagination Garden deck card');

const lastBreakfastTitles = titlesFor(hooks, '\u6700\u5f8c\u4e00\u5929\u65e9\u9910');
assert.equal(lastBreakfastTitles[0], '撤船日早餐與房務供應，要先分清楚', 'last-day breakfast query should prioritize the disembarkation breakfast guide');
assert(hasAnyTitle(lastBreakfastTitles, [/\u65e9\u9910\uff0b\u6700\u5f8c\u78ba\u8a8d/]), 'last-day breakfast query should retain the Day 4 schedule event as support');

assert.equal(titlesFor(hooks, 'zzzznotfound').length, 0, 'unknown queries should not fall back to unrelated generic cards');

const swimPayload = hooks.getRankedSearchResults('\u6709\u54ea\u4e9b\u8a2d\u65bd\u53ef\u4ee5\u6e38\u6cf3');
const swimTitles = swimPayload.results.map((item) => String(item.title || ''));
assert(swimTitles.length > 0, 'swim/facility query should still return results');
assert(swimTitles.slice(0, 4).every((title) => /Pool|Splash|Slide|Sundeck|Infinity/i.test(title)), 'top swim results should stay water-related');
assert(!swimTitles.slice(0, 6).some((title) => /Moana|Animator|Pixar Market/i.test(title)), 'swim query should not mix unrelated shows or restaurants into the top results');

const conciergeTopResult = conciergePayload.results[0];
assert(conciergeTopResult, 'concierge query should produce a top result for render smoke');
const summaryLine = hooks.buildSearchResultSummaryLine(conciergeTopResult, conciergePayload.queryData);
assert(typeof summaryLine === 'string' && summaryLine.length > 0, 'search result summary line should render');
assert(!/(日期|時段|重點|任務|來源層級)\s*[:：]/.test(summaryLine), 'summary line should not expose raw field labels');
const metaLine = hooks.getSearchResultMetaLine(conciergeTopResult);
assert(typeof metaLine === 'string' && metaLine.includes('•'), 'search result meta line should stay compact');
assert(!/Deck 19\s*[·•]\s*Deck 19/.test(metaLine), 'search result meta line should not duplicate the same deck label');
