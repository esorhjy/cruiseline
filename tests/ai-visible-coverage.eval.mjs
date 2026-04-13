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
    AI_ENTITY_REGISTRY: {},
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

  const registrySource = fs.readFileSync(path.resolve('ai-entity-registry.js'), 'utf8');
  vm.runInNewContext(registrySource, baseSandbox, { filename: 'ai-entity-registry.js' });

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

const conciergeFacilitiesQuery = '\u54ea\u4e9b\u6a13\u5c64\u6709\u79ae\u8cd3\u8a2d\u65bd\uff0c\u6709\u54ea\u4e9b\u5167\u5bb9\uff1f';
const hooks = loadScriptHooks();
const simulation = hooks.runAiCoverageSimulation(conciergeFacilitiesQuery);

assert(simulation.displayResults.length > 0, 'display results should exist');

const visibleSundeck = simulation.displayResults.find((item) => /concierge sundeck/i.test(String(item.title || '')));
const visibleLounge = simulation.displayResults.find((item) => /concierge lounge/i.test(String(item.title || '')));

assert(visibleSundeck, 'right-side visible results should include Concierge Sundeck & Pool');
assert(visibleLounge, 'right-side visible results should include Concierge Lounge');

const visibleParentIds = simulation.coverageContract.mustRenderVisibleParentIds || [];
const derivedParentIds = simulation.coverageContract.mustRenderDerivedParentIds || [];
const supportParentIds = simulation.coverageContract.preferredSupportParentIds || [];

assert(
  visibleParentIds.includes(visibleLounge.parentId || visibleLounge.id)
    || derivedParentIds.includes(visibleLounge.parentId || visibleLounge.id),
  'right-side visible lounge card should still be retained in visible or derived coverage'
);
assert(
  visibleParentIds.includes(visibleSundeck.parentId || visibleSundeck.id)
    || derivedParentIds.includes(visibleSundeck.parentId || visibleSundeck.id),
  'right-side visible sundeck card should still be retained in visible or derived coverage'
);

const requiredLoungeBrief = simulation.parentBriefs.find((item) => /concierge lounge/i.test(String(item.title || '')));
const requiredSundeckBrief = simulation.parentBriefs.find((item) => /concierge sundeck/i.test(String(item.title || '')));

assert(requiredLoungeBrief, 'coverage planning should retain a lounge parent brief for the left-side answer');
assert(requiredSundeckBrief, 'coverage planning should retain a sundeck parent brief for the left-side answer');

assert(
  visibleParentIds.includes(requiredLoungeBrief.parentId) || derivedParentIds.includes(requiredLoungeBrief.parentId),
  'coverage contract should keep a lounge-related parent in visible or derived coverage'
);
assert(
  visibleParentIds.includes(requiredSundeckBrief.parentId) || derivedParentIds.includes(requiredSundeckBrief.parentId),
  'coverage contract should keep a sundeck-related parent in visible or derived coverage'
);

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
  derivedParentIds.includes(relevantScheduleBrief.parentId) || supportParentIds.includes(relevantScheduleBrief.parentId),
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
              answer: 'Concierge facilities are centered around the lounge, with additional deck and schedule support.',
              confidence: 'high',
              primarySourceType: 'deck',
              missingReason: '',
              citationIds: loungeBrief.citationIds,
              insufficientData: false,
              sections: {
                directAnswer: 'The lounge is one core concierge facility, but the final report should include other concierge decks and support context.',
                recommendedSteps: [
                  'Start with the lounge as the primary concierge hub.'
                ],
                whyThisWorks: [
                  'The concierge topic should keep visible facility cards, not only one lounge summary.'
                ],
                watchOuts: [
                  'Do not let visible concierge deck cards drop out of the final inventory.'
                ]
              },
              report: {
                headline: 'Concierge facilities overview',
                executiveSummary: [
                  'The model only wrote the lounge on purpose so the post-process must backfill the missing visible cards.'
                ],
                recommendedPlan: [
                  'Use the lounge as one primary concierge stop.'
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
                  'Concierge coverage should still include deck-specific facilities and relevant schedule context.'
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
  query: conciergeFacilitiesQuery,
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
  mustRenderVisibleParents: simulation.parentBriefs.filter((item) => visibleParentIds.includes(item.parentId)),
  mustRenderDerivedParents: simulation.parentBriefs.filter((item) => derivedParentIds.includes(item.parentId)),
  preferredRenderParents: simulation.parentBriefs.filter((item) => (simulation.coverageContract.preferredParentIds || []).includes(item.parentId)),
  preferredSupportParents: simulation.parentBriefs.filter((item) => supportParentIds.includes(item.parentId)),
  parentDossiers: simulation.parentBriefs,
  answerDepthMode: 'exhaustive',
  coverageStats: {
    selectedParentCount: simulation.parentBriefs.length,
    targetParentCount: simulation.coverageContract.targetCoverageCount || 0,
    visibleTargetCount: simulation.coverageContract.targetVisibleCoverageCount || 0,
    primarySubject: 'concierge facilities'
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
  scheduleInventory.detailBullets.some((detail) => /(day\s*[13]|上午|下午|晚上|晚間|時段)/i.test(String(detail || ''))),
  'schedule inventory should keep detailed time or itinerary bullets'
);

assert.equal(report.payload.report.coverageSummary.visibleTargetCount, visibleParentIds.length);
assert.equal(report.payload.report.coverageSummary.visibleRenderedCount, visibleParentIds.length);
assert(report.payload.report.coverageSummary.visibleBackfilledCount >= 1, 'visible backfill count should reflect missing visible cards');
assert.equal(report.payload.report.coverageSummary.visibleCoverageRatio, 1);

console.log('AI visible coverage eval passed.');
