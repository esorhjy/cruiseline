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

function loadScriptHooks() {
  const hooks = {};
  const data = loadData();

  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const windowObject = {
    AI_ENTITY_REGISTRY: {},
    AI_QUERY_TAXONOMY: {},
    __AI_SEARCH_TEST_HOOKS__: hooks,
    __AI_SEARCH_SKIP_BOOTSTRAP__: true,
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
    },
    createElement() {
      return {
        className: '',
        style: {},
        innerHTML: '',
        addEventListener() {},
        appendChild() {},
        remove() {},
        querySelector() {
          return {
            onclick: null
          };
        }
      };
    }
  };

  const baseSandbox = {
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

  const registrySource = fs.readFileSync(path.resolve('ai-entity-registry.js'), 'utf8');
  vm.runInNewContext(registrySource, baseSandbox, { filename: 'ai-entity-registry.js' });

  const taxonomySource = fs.readFileSync(path.resolve('ai-query-taxonomy.js'), 'utf8');
  vm.runInNewContext(taxonomySource, baseSandbox, { filename: 'ai-query-taxonomy.js' });

  const scriptSource = fs.readFileSync(path.resolve('script.js'), 'utf8');
  vm.runInNewContext(scriptSource, baseSandbox, { filename: 'script.js' });

  return hooks;
}

const hooks = loadScriptHooks();

const report = {
  headline: '禮賓設施整理',
  executiveSummary: ['禮賓的核心設施主要集中在 Concierge Lounge 與 Concierge Sundeck & Pool。'],
  sourceComparison: [
    {
      sourceDetailType: 'concierge',
      summary: '禮賓來源會更強調 lounge 與專屬泳池的使用節奏。'
    }
  ],
  unansweredQuestions: ['若想確認現場供應細節，仍要以當晚通知為主。'],
  fullCardInventory: [
    {
      parentId: 'deck:concierge-lounge',
      title: 'Concierge Lounge',
      cardType: 'deck',
      sourceLabels: ['禮賓', '甲板'],
      detailBullets: [
        '位於 Deck 17，是禮賓家庭最穩定的補給與回氣基地。',
        'Day 1 報到後先熟悉路線，每晚晚餐前後再回來當中轉補位。',
        '供應下午茶、輕食與飲品，適合在看秀前後短暫休息。'
      ],
      citationIds: ['chunk-a']
    },
    {
      parentId: 'deck:concierge-sundeck',
      title: 'Concierge Sundeck & Pool',
      cardType: 'deck',
      sourceLabels: ['禮賓', '泳池'],
      detailBullets: [
        '位於 Deck 19，是禮賓專屬的日光甲板與泳池空間。',
        '適合安排在海上日下午作為放鬆時段，避開一般區域的人潮。',
        '若當天還有其他親子活動，建議把泳池時段與 Lounge 補給順路串在一起。'
      ],
      citationIds: ['chunk-b'],
      coverageTier: 'visible'
    },
    {
      parentId: 'playbook:concierge-value',
      title: '禮賓隱藏加值',
      cardType: 'playbook',
      sourceLabels: ['攻略'],
      detailBullets: [
        'Lounge 最適合當作看秀前後的補給點與中轉站。',
        '如果想把日程排順，先抓主秀與回房節點，再把禮賓設施嵌進空檔會比較穩。',
        '泳池與 Lounge 的價值不同，前者偏放鬆，後者偏補給與協助。'
      ],
      citationIds: ['chunk-c']
    }
  ]
};

const article = hooks.resolveAiRenderableLongformArticle(report);

assert(article, 'front-end should derive a longform article when worker payload lacks one');
assert.equal(article.sections.length, 2, 'fallback longform article should keep only non-empty sections');

const deckShowSection = article.sections.find((section) => section.sectionKey === 'deckShow');
const playbookSection = article.sections.find((section) => section.sectionKey === 'playbook');

assert(deckShowSection, 'deck/show section should be derived from fullCardInventory');
assert(playbookSection, 'playbook section should be derived from fullCardInventory');
assert(Array.isArray(deckShowSection.narrativeParagraphs) && deckShowSection.narrativeParagraphs.length >= 1, 'deck/show section should synthesize readable narratives');
assert(deckShowSection.narrativeParagraphs.some((paragraph) => /sundeck/i.test(paragraph)), 'derived article should mention Concierge Sundeck & Pool');
assert(deckShowSection.narrativeParagraphs.some((paragraph) => /lounge/i.test(paragraph)), 'derived article should mention Concierge Lounge');
assert(Array.isArray(playbookSection.narrativeParagraphs) && playbookSection.narrativeParagraphs.length >= 1, 'playbook section should synthesize readable narratives');
assert(Array.isArray(deckShowSection.citationIds) && deckShowSection.citationIds.length, 'every derived narrative section should keep citations');

const duplicateHeavyReport = {
  fullCardInventory: [
    {
      parentId: 'deck:lounge-a',
      title: 'Concierge Lounge',
      cardType: 'deck',
      sourceLabels: ['禮賓'],
      detailBullets: [
        '位於 Deck 17，是禮賓家庭的補給基地。',
        '位於 Deck 17，是禮賓家庭的補給基地。',
        '適合在晚餐前後短暫休息。'
      ],
      citationIds: ['chunk-a']
    },
    {
      parentId: 'deck:lounge-b',
      title: 'Concierge Lounge 使用節奏',
      cardType: 'deck',
      sourceLabels: ['禮賓'],
      detailBullets: [
        '位於 Deck 17，是禮賓家庭的補給基地。',
        '適合在晚餐前後短暫休息。',
        '若看秀前想補充飲品，回 Lounge 最順。'
      ],
      citationIds: ['chunk-b']
    }
  ]
};

const dedupedArticle = hooks.resolveAiRenderableLongformArticle(duplicateHeavyReport);
const dedupedDeckSection = dedupedArticle.sections.find((section) => section.sectionKey === 'deckShow');
assert(dedupedDeckSection, 'deduped article should still create a deck/show section');
assert(dedupedDeckSection.narrativeParagraphs.length <= 2, 'section narrative should dedupe highly repetitive card content');

const legacyPayload = {
  answer: '禮賓設施主要可分成補給休息與放鬆泳池兩條線。',
  bullets: [
    'Concierge Lounge 是主要補給站。',
    'Concierge Sundeck & Pool 適合放鬆。'
  ],
  responseMode: 'report'
};

hooks.materializeAiClientReportFallback(legacyPayload, {
  responseMode: 'report',
  parentBriefs: report.fullCardInventory.map((item) => ({
    parentId: item.parentId,
    title: item.title,
    cardType: item.cardType,
    groupLabel: item.groupLabel || '',
    sourceLabels: item.sourceLabels || [],
    categoryFamilies: item.categoryFamilies || [],
    detailBullets: item.detailBullets || [],
    citationIds: item.citationIds || [],
    coverageTier: item.coverageTier || 'support'
  })),
  coverageStats: {
    selectedParentCount: 3,
    targetParentCount: 3,
    visibleTargetCount: 1,
    visibleRenderedCount: 1,
    sourceCounts: {
      concierge: 2,
      general: 1
    }
  },
  coverageContract: {
    targetCoverageCount: 3,
    targetVisibleCoverageCount: 1
  },
  queryData: {
    canonicalEntities: ['禮賓'],
    normalizedQuery: '禮賓的設施與服務'
  }
});

assert(legacyPayload.report, 'legacy payload should be upgraded into a report client-side');
assert(Array.isArray(legacyPayload.report.fullCardInventory) && legacyPayload.report.fullCardInventory.length >= 3, 'legacy payload should receive inventory from parent briefs');
assert(legacyPayload.report.longformArticle, 'legacy payload should receive a longformArticle fallback');
assert(legacyPayload.report.coverageSummary, 'legacy payload should receive a coverage summary fallback');
assert(legacyPayload.report.longformArticle.sections.some((section) => (section.narrativeParagraphs || []).some((paragraph) => /sundeck/i.test(paragraph))), 'client fallback should carry Concierge Sundeck & Pool into longform section narratives');

const renderedHtml = hooks.renderAiLongformArticle(legacyPayload.report);
assert(/search-ai-article-section-body/.test(renderedHtml), 'longform renderer should output section narrative bodies');
assert(!/search-ai-article-card-title/.test(renderedHtml), 'longform renderer should not output per-card article headings');

const staleWorkerPayload = hooks.annotateAiWorkerVersionStatus({
  answer: 'test',
  workerBuildId: 'legacy-build',
  workerSchemaVersion: 'legacy-schema'
});

assert.equal(staleWorkerPayload.workerVersionMismatch, true, 'stale worker payload should be flagged as mismatch');
assert(/legacy-schema/.test(staleWorkerPayload.workerVersionMessage), 'worker mismatch message should include actual schema');

const freshWorkerPayload = hooks.annotateAiWorkerVersionStatus({
  answer: 'test',
  workerBuildId: '2026-04-15-ai-worker-v11',
  workerSchemaVersion: 'ai-answer-worker-v9'
});

assert.equal(freshWorkerPayload.workerVersionMismatch, false, 'matching worker payload should not be flagged');

console.log('AI longform render fallback eval passed.');
