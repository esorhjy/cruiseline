import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
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
    AI_QUERY_TAXONOMY: {},
    __AI_SEARCH_TEST_HOOKS__: hooks,
    __AI_SEARCH_SKIP_BOOTSTRAP__: true,
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

  const taxonomySource = fs.readFileSync(path.resolve('ai-query-taxonomy.js'), 'utf8');
  vm.runInNewContext(taxonomySource, baseSandbox, { filename: 'ai-query-taxonomy.js' });

  const scriptSource = fs.readFileSync(path.resolve('script.js'), 'utf8');
  vm.runInNewContext(scriptSource, baseSandbox, { filename: 'script.js' });

  return hooks;
}

async function loadWorker() {
  const workerPath = path.resolve('worker', 'ai-answer.js');
  const source = fs.readFileSync(workerPath, 'utf8');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-worker-smoke-'));
  const tempPath = path.join(tempDir, 'ai-answer.test.mjs');
  fs.writeFileSync(tempPath, source, 'utf8');
  const moduleUrl = `${pathToFileURL(tempPath).href}?t=${Date.now()}`;
  const module = await import(moduleUrl);
  fs.rmSync(tempDir, { recursive: true, force: true });
  return module.default;
}

async function invokeWorker(worker, body, fetchImpl) {
  const request = new Request('https://example.com/api/ai-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;

  try {
    const response = await worker.fetch(request, { GEMINI_API_KEY: 'test-key' });
    const payload = await response.json();
    return { response, payload };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const hooks = loadScriptHooks();
const simulation = hooks.runAiCoverageSimulation('哪些樓層有禮賓設施，有哪些內容？');

assert(simulation.displayResults.length > 0, 'display results should exist');

const visibleSundeck = simulation.displayResults.find((item) => /concierge sundeck/i.test(String(item.title || '')));
const visibleLounge = simulation.displayResults.find((item) => /concierge lounge/i.test(String(item.title || '')));

assert(visibleSundeck, 'right-side visible results should include Concierge Sundeck & Pool');
assert(visibleLounge, 'right-side visible results should include Concierge Lounge');

const visibleParentIds = simulation.coverageContract.mustRenderVisibleParentIds || [];
assert(
  visibleParentIds.includes(visibleLounge.parentId || visibleLounge.id)
    || (simulation.coverageContract.mustRenderDerivedParentIds || []).includes(visibleLounge.parentId || visibleLounge.id),
  'right-side visible lounge card should still be retained in visible or derived coverage'
);

const requiredLoungeBrief = simulation.parentBriefs.find((item) => /concierge lounge/i.test(String(item.title || '')));
assert(requiredLoungeBrief, 'coverage planning should retain a lounge parent brief for the left-side answer');
assert(
  visibleParentIds.includes(requiredLoungeBrief.parentId)
    || (simulation.coverageContract.mustRenderDerivedParentIds || []).includes(requiredLoungeBrief.parentId),
  'coverage contract should keep a lounge-related parent in visible or derived coverage'
);
assert(
  (simulation.coverageContract.mustRenderDerivedParentIds || []).includes(visibleSundeck.parentId || visibleSundeck.id),
  'right-side visible sundeck card should still be retained in derived coverage'
);

const requiredSundeckBrief = simulation.parentBriefs.find((item) => /concierge sundeck/i.test(String(item.title || '')));
assert(requiredSundeckBrief, 'coverage planning should retain a sundeck parent brief for the left-side answer');
assert(
  visibleParentIds.includes(requiredSundeckBrief.parentId)
    || (simulation.coverageContract.mustRenderDerivedParentIds || []).includes(requiredSundeckBrief.parentId),
  'coverage contract should keep a sundeck-related parent in visible or derived coverage'
);

const parentBriefIds = simulation.parentBriefs.map((item) => item.parentId);
assert(parentBriefIds.includes(requiredLoungeBrief.parentId), 'parent briefs should retain lounge coverage brief');
assert(parentBriefIds.includes(requiredSundeckBrief.parentId), 'parent briefs should retain sundeck coverage brief');

const relevantScheduleBrief = simulation.parentBriefs.find((item) =>
  item.cardType === 'schedule'
  && /concierge|day 1|day 3/i.test(String(item.title || '') + ' ' + String((item.detailBullets || []).join(' ')))
);
assert(relevantScheduleBrief, 'coverage planning should retain a relevant schedule brief for the left-side answer');
assert(
  ['derived', 'support'].includes(relevantScheduleBrief.coverageTier),
  'relevant schedule brief should stay in derived or support coverage tier'
);
assert(
  (simulation.coverageContract.mustRenderDerivedParentIds || []).includes(relevantScheduleBrief.parentId)
    || (simulation.coverageContract.preferredSupportParentIds || []).includes(relevantScheduleBrief.parentId),
  'relevant schedule brief should be retained in derived/support coverage contract'
);

const worker = await loadWorker();

const loungeBrief = requiredLoungeBrief;
assert(loungeBrief, 'lounge brief should exist');

const partialGeminiFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              answer: '禮賓設施主要集中在 Lounge，但也會延伸到其他禮賓空間。',
              confidence: 'high',
              primarySourceType: 'deck',
              missingReason: '',
              citationIds: loungeBrief.citationIds,
              insufficientData: false,
              sections: {
                directAnswer: '禮賓設施不只一處，至少包含 Lounge 與其他禮賓專屬空間。',
                recommendedSteps: [
                  '先把 Lounge 當成主補給與報到點，再依需求看其他禮賓空間。'
                ],
                whyThisWorks: [
                  '這樣可以先抓穩主要補給點，再延伸到次要禮賓設施。'
                ],
                watchOuts: [
                  '不同禮賓空間的用途和時段不完全相同。'
                ]
              },
              report: {
                headline: '禮賓設施整理',
                executiveSummary: [
                  '禮賓設施分散在不同樓層，不只 Concierge Lounge。'
                ],
                recommendedPlan: [
                  '先看主要報到與補給點，再整理其他禮賓設施。'
                ],
                fullCardInventory: [
                  {
                    parentId: loungeBrief.parentId,
                    title: loungeBrief.title,
                    cardType: loungeBrief.cardType,
                    groupLabel: loungeBrief.groupLabel,
                    sourceLabels: loungeBrief.sourceLabels,
                    categoryFamilies: loungeBrief.categoryFamilies,
                    detailBullets: loungeBrief.detailBullets.slice(0, 4),
                    citationIds: loungeBrief.citationIds.slice(0, 4),
                    coverageTier: 'visible',
                    renderOrigin: 'model'
                  }
                ],
                detailBreakdown: [
                  'Lounge 是禮賓行程裡最常用的報到與補給據點。'
                ],
                topicAppendix: [],
                sourceComparison: []
              }
            })
          }
        ]
      }
    }
  ]
}), {
  status: 200,
  headers: {
    'Content-Type': 'application/json'
  }
});

const workerBody = {
  query: '哪些樓層有禮賓設施，有哪些內容？',
  mode: 'grounded_qa_v1',
  responseMode: 'report',
  analysisPlan: {
    responseMode: 'report',
    intentType: simulation.reportPlan.intentType,
    inventoryIntent: simulation.reportPlan.inventoryIntent,
    visibleInventoryMode: simulation.reportPlan.visibleInventoryMode,
    coverageMode: simulation.reportPlan.coverageMode,
    breadthSignals: simulation.reportPlan.breadthSignals || [],
    facilityBreadthMode: simulation.reportPlan.facilityBreadthMode,
    hardAnchors: simulation.reportPlan.hardAnchors || [],
    softModifiers: simulation.reportPlan.softModifiers || [],
    subjectClusters: simulation.reportPlan.subjectClusters || [],
    preferredClusters: simulation.reportPlan.preferredClusters || [],
    mustCoverCategories: simulation.reportPlan.mustCoverCategories || []
  },
  chunks: simulation.chunks,
  coverageContract: simulation.coverageContract,
  visibleCoverageContract: {
    visibleParentIds: simulation.coverageContract.visibleParentIds || [],
    eligibleVisibleParentIds: simulation.coverageContract.eligibleVisibleParentIds || [],
    targetVisibleCoverageCount: simulation.coverageContract.targetVisibleCoverageCount || 0,
    minimumVisibleCoverageRatio: simulation.coverageContract.minimumVisibleCoverageRatio || 0,
    coverageReason: simulation.coverageContract.coverageReason || ''
  },
  mustRenderParents: simulation.parentBriefs.filter((item) => (simulation.coverageContract.mustRenderParentIds || []).includes(item.parentId)),
  mustRenderVisibleParents: simulation.parentBriefs.filter((item) => (simulation.coverageContract.mustRenderVisibleParentIds || []).includes(item.parentId)),
  mustRenderDerivedParents: simulation.parentBriefs.filter((item) => (simulation.coverageContract.mustRenderDerivedParentIds || []).includes(item.parentId)),
  preferredRenderParents: simulation.parentBriefs.filter((item) => (simulation.coverageContract.preferredParentIds || []).includes(item.parentId)),
  preferredSupportParents: simulation.parentBriefs.filter((item) => (simulation.coverageContract.preferredSupportParentIds || []).includes(item.parentId)),
  parentDossiers: simulation.parentBriefs,
  answerDepthMode: 'exhaustive',
  coverageStats: {
    selectedParentCount: simulation.parentBriefs.length,
    targetParentCount: simulation.coverageContract.targetCoverageCount || 0,
    visibleTargetCount: simulation.coverageContract.targetVisibleCoverageCount || 0,
    primarySubject: '禮賓設施'
  }
};

const report = await invokeWorker(worker, workerBody, partialGeminiFetch);
assert.equal(report.response.status, 200);

const inventory = report.payload.report.fullCardInventory || [];
const inventoryParentIds = inventory.map((item) => item.parentId);

visibleParentIds.forEach((parentId) => {
  assert(inventoryParentIds.includes(parentId), `fullCardInventory should include visible parent ${parentId}`);
});

const sundeckInventory = inventory.find((item) => /concierge sundeck/i.test(String(item.title || '')));
assert(sundeckInventory, 'worker should backfill Concierge Sundeck & Pool into fullCardInventory');
assert(['visible', 'derived'].includes(sundeckInventory.coverageTier), 'sundeck coverage should be visible or derived tier');
assert(String(sundeckInventory.renderOrigin).includes('backfill'), 'sundeck coverage should be backfilled when model omitted it');

const scheduleInventory = inventory.find((item) => item.parentId === relevantScheduleBrief.parentId);
assert(scheduleInventory, 'worker should retain a relevant schedule inventory item when model omits it');
assert(
  ['derived', 'support'].includes(scheduleInventory.coverageTier),
  'schedule coverage should stay in derived or support tier'
);
assert(
  scheduleInventory.detailBullets.some((detail) => /day 1|day 3|時段|行程/i.test(String(detail || ''))),
  'schedule inventory should keep detailed time or itinerary bullets'
);

assert.equal(report.payload.report.coverageSummary.visibleTargetCount, visibleParentIds.length);
assert.equal(report.payload.report.coverageSummary.visibleRenderedCount, visibleParentIds.length);
assert(report.payload.report.coverageSummary.visibleBackfilledCount >= 1, 'visible backfill count should reflect missing visible cards');
assert.equal(report.payload.report.coverageSummary.visibleCoverageRatio, 1);

console.log('AI visible coverage eval passed.');
