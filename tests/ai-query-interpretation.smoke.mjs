import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

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

function loadTaxonomy() {
  const taxonomyPath = path.resolve('ai-query-taxonomy.js');
  const source = fs.readFileSync(taxonomyPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'ai-query-taxonomy.js' });
  return sandbox.window.AI_QUERY_TAXONOMY;
}

async function invokeWorker(worker, body, options = {}) {
  const request = new Request('https://example.com/api/ai-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const originalFetch = globalThis.fetch;
  if (options.fetchImpl) {
    globalThis.fetch = options.fetchImpl;
  }

  try {
    const response = await worker.fetch(request, options.env || {});
    const payload = await response.json();
    return { response, payload };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const worker = await loadWorker();
const taxonomy = loadTaxonomy();
const swimQuery = '有哪些設施可以游泳';

const interpretationFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              canonicalQuery: swimQuery,
              literalAnchors: ['設施', '游泳'],
              canonicalEntities: ['設施'],
              genericClasses: ['設施'],
              requiredCapabilities: ['swim'],
              expandedAliases: ['pool', 'splash', 'slide'],
              expandedCategories: ['泳池', '水區'],
              clusterExpansions: ['pool deck', 'water play'],
              coverageHints: ['inventory', 'all-details'],
              disallowedCategories: ['劇院', '表演'],
              answerIntent: 'inventory',
              breadthProfile: 'maximum-expansion',
              expansionReasons: ['capability:swim', 'expand:泳池'],
              negativeTerms: [],
              confidence: 'high'
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

const interpreted = await invokeWorker(worker, {
  query: swimQuery,
  mode: 'query_interpretation_v3',
  responseLocale: 'zh-Hant',
  taxonomy
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: interpretationFetch
});

assert.equal(interpreted.response.status, 200);
assert(interpreted.payload.requiredCapabilities.includes('swim'));
assert(interpreted.payload.disallowedCategories.includes('劇院'));
assert.equal(interpreted.payload.answerIntent, 'inventory');
assert.equal(interpreted.payload.breadthProfile, 'maximum-expansion');
assert(interpreted.payload.expandedCategories.includes('泳池'));

const fallback = await invokeWorker(worker, {
  query: swimQuery,
  mode: 'query_interpretation_v3',
  responseLocale: 'zh-Hant',
  taxonomy
}, {
  env: {}
});

assert.equal(fallback.response.status, 200);
assert(Array.isArray(fallback.payload.requiredCapabilities));
assert(fallback.payload.requiredCapabilities.includes('swim'));
assert(Array.isArray(fallback.payload.disallowedCategories));
assert(fallback.payload.disallowedCategories.length >= 1);
assert.equal(typeof fallback.payload.answerIntent, 'string');
assert(['inventory', 'answer', 'comparison'].includes(fallback.payload.answerIntent));

const bilingual = await invokeWorker(worker, {
  query: 'concierge 有哪些服務',
  mode: 'query_interpretation_v3',
  responseLocale: 'zh-Hant',
  taxonomy
}, {
  env: {}
});

assert.equal(bilingual.response.status, 200);
assert(Array.isArray(bilingual.payload.canonicalEntities));
assert(bilingual.payload.canonicalEntities.length >= 1);
assert(Array.isArray(bilingual.payload.expandedAliases));
