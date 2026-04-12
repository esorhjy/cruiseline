import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

async function loadWorker() {
  const workerPath = path.resolve('worker', 'ai-answer.js');
  const source = fs.readFileSync(workerPath, 'utf8');
  const patchedSource = source.replace('export default {', 'const workerDefault = {') + '\nexport default workerDefault;';
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(patchedSource).toString('base64')}`;
  return import(moduleUrl);
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

const { default: worker } = await loadWorker();
const taxonomy = loadTaxonomy();

const interpretationFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              canonicalQuery: 'concierge 有哪些服務',
              literalAnchors: ['concierge', '服務'],
              canonicalEntities: ['concierge'],
              genericClasses: ['服務'],
              expandedAliases: ['concierge', '禮賓', 'concierge lounge', 'lounge'],
              expandedCategories: ['服務', '酒廊', '表演'],
              clusterExpansions: ['concierge-service', 'priority seating', 'Royal Meet & Greet'],
              coverageHints: ['inventory'],
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
  query: 'concierge 有哪些服務',
  mode: 'query_interpretation_v1',
  responseLocale: 'zh-Hant',
  taxonomy
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: interpretationFetch
});

assert.equal(interpreted.response.status, 200);
assert(Array.isArray(interpreted.payload.canonicalEntities), 'canonicalEntities should exist');
assert(interpreted.payload.canonicalEntities.includes('禮賓'), 'concierge should normalize to 禮賓');
assert(interpreted.payload.expandedAliases.includes('lounge'), 'expandedAliases should keep lounge');
assert(interpreted.payload.coverageHints.includes('inventory'), 'inventory hint should be preserved');
assert.equal(interpreted.payload.confidence, 'high');

const fallback = await invokeWorker(worker, {
  query: '各項設施有哪些',
  mode: 'query_interpretation_v1',
  responseLocale: 'zh-Hant',
  taxonomy
}, {
  env: {}
});

assert.equal(fallback.response.status, 200);
assert(Array.isArray(fallback.payload.expandedCategories), 'fallback expandedCategories should exist');
assert(fallback.payload.expandedCategories.includes('場館'), '設施 should broaden to 場館');
assert(fallback.payload.expandedCategories.includes('服務'), '設施 should broaden to 服務');
assert(fallback.payload.expandedCategories.includes('表演'), '設施 should broaden to 表演');
assert(Array.isArray(fallback.payload.clusterExpansions), 'fallback clusterExpansions should exist');
