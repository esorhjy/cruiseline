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

  const scriptSource = fs.readFileSync(path.resolve('script.js'), 'utf8');
  vm.runInNewContext(scriptSource, sandbox, { filename: 'script.js' });

  return hooks;
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

const roomServiceTitles = titlesFor(hooks, 'Room Service');
assert.equal(roomServiceTitles[0], 'Room Service 很適合儀式感，但一定要提早下單', 'Room Service should prioritize the exact playbook guide over generic Guest Services');

const onboardFirstTitles = titlesFor(hooks, '\u4e0a\u8239\u5148\u505a\u4ec0\u9ebc');
assert.equal(onboardFirstTitles[0], '登船 3 小時 SOP：只跑第一圈，不要一開始就滿船亂衝', 'natural-language embarkation query should surface the Day 1 SOP card first');
assert(hasAnyTitle(onboardFirstTitles.slice(0, 5), [/Oceaneer Club/i, /RFID \u624b\u74b0/, /Toy Story Pool/i]), 'embarkation query should still surface kids/water first-day context');

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
