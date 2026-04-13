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
  const registryPath = path.resolve('ai-entity-registry.js');
  const taxonomyPath = path.resolve('ai-query-taxonomy.js');
  const registrySource = fs.readFileSync(registryPath, 'utf8');
  const taxonomySource = fs.readFileSync(taxonomyPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(registrySource, sandbox, { filename: 'ai-entity-registry.js' });
  vm.runInNewContext(taxonomySource, sandbox, { filename: 'ai-query-taxonomy.js' });
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
const swimQuery = '\u6709\u54ea\u4e9b\u8a2d\u65bd\u53ef\u4ee5\u6e38\u6cf3';

const interpretationFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              canonicalQuery: swimQuery,
              literalAnchors: ['\u8a2d\u65bd', '\u6e38\u6cf3'],
              canonicalEntities: ['\u8a2d\u65bd'],
              genericClasses: ['\u8a2d\u65bd'],
              requiredCapabilities: ['swim'],
              expandedAliases: ['pool', 'splash', 'slide'],
              expandedCategories: ['\u6cf3\u6c60', '\u6c34\u5340'],
              clusterExpansions: ['pool deck', 'water play'],
              coverageHints: ['inventory', 'all-details'],
              disallowedCategories: ['\u8868\u6f14', '\u5287\u9662'],
              answerIntent: 'inventory',
              breadthProfile: 'maximum-expansion',
              expansionReasons: ['capability:swim', 'expand:pool'],
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
assert(interpreted.payload.disallowedCategories.includes('\u8868\u6f14'));
assert.equal(interpreted.payload.answerIntent, 'inventory');
assert.equal(interpreted.payload.breadthProfile, 'maximum-expansion');
assert(interpreted.payload.expandedCategories.includes('\u6cf3\u6c60'));

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
  query: 'concierge \u6709\u54ea\u4e9b\u670d\u52d9',
  mode: 'query_interpretation_v3',
  responseLocale: 'zh-Hant',
  taxonomy
}, {
  env: {}
});

assert.equal(bilingual.response.status, 200);
assert(Array.isArray(bilingual.payload.canonicalEntities));
assert(
  bilingual.payload.canonicalEntities.some((item) => /concierge|禮賓/i.test(String(item || ''))),
  `canonicalEntities should retain a concierge subject: ${JSON.stringify(bilingual.payload.canonicalEntities)}`
);
assert(Array.isArray(bilingual.payload.expandedAliases));
assert(
  bilingual.payload.expandedAliases.some((item) => /concierge|lounge|禮賓/i.test(String(item || ''))),
  `expandedAliases should include concierge-related aliases: ${JSON.stringify(bilingual.payload.expandedAliases)}`
);
assert(
  bilingual.payload.clusterExpansions.some((item) => /concierge|lounge|禮賓/i.test(String(item || ''))),
  `clusterExpansions should include concierge-related expansions: ${JSON.stringify(bilingual.payload.clusterExpansions)}`
);

console.log('AI query interpretation smoke passed.');
