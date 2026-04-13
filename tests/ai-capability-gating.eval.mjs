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
    sessionStorage: {
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

  const sandbox = {
    window: windowObject,
    document: documentObject,
    localStorage: windowObject.localStorage,
    sessionStorage: windowObject.sessionStorage,
    navigator: { userAgent: 'node', onLine: true },
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
  vm.runInNewContext(registrySource, sandbox, { filename: 'ai-entity-registry.js' });

  const taxonomySource = fs.readFileSync(path.resolve('ai-query-taxonomy.js'), 'utf8');
  vm.runInNewContext(taxonomySource, sandbox, { filename: 'ai-query-taxonomy.js' });

  const scriptSource = fs.readFileSync(path.resolve('script.js'), 'utf8');
  vm.runInNewContext(scriptSource, sandbox, { filename: 'script.js' });

  return hooks;
}

function hasAnyTitle(results, patterns) {
  return results.some((item) => patterns.some((pattern) => pattern.test(String(item.title || ''))));
}

const hooks = loadScriptHooks();
const simulation = hooks.runAiCoverageSimulation('有哪些設施可以游泳');

assert(simulation.displayResults.length > 0, 'display results should exist for swim facilities query');
assert(Array.isArray(simulation.queryData.requiredCapabilities), 'requiredCapabilities should exist');
assert(simulation.queryData.requiredCapabilities.includes('swim'), 'swim capability should be detected');

const topTitles = simulation.displayResults.slice(0, 8).map((item) => String(item.title || ''));
assert(
  hasAnyTitle(simulation.displayResults, [/Toy Story Pool/i, /Infinity Pool/i, /Sundeck/i, /Moana/i]),
  `expected water facilities in display results, got: ${topTitles.join(' | ')}`
);
assert(
  !simulation.displayResults.slice(0, 5).some((item) => /Baymax|Theatre|Disney Seas/i.test(String(item.title || ''))),
  `top visible results should not be dominated by theatre/cinema cards: ${topTitles.join(' | ')}`
);

assert(simulation.primaryEntityParents.length > 0, 'primary entity parents should exist');
assert(
  simulation.primaryEntityParents.every((item) => Array.isArray(item.capabilityTags) && item.capabilityTags.includes('swim')),
  'all primary entity parents should satisfy swim capability'
);

if (simulation.supportEntityParents.length) {
  assert(
    simulation.supportEntityParents.every((item) => item.sourceType === 'schedule' || item.coverageTier === 'support' || item.coverageTier === 'derived'),
    'support entity parents should stay in support/derived layers'
  );
}

assert(
  Array.isArray(simulation.capabilityCoveragePlan.items) && simulation.capabilityCoveragePlan.items.some((item) => item.capabilityId === 'swim'),
  'capability coverage plan should include swim'
);
