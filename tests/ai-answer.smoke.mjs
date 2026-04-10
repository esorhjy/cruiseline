import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const suspiciousTokens = ['�', '?芣', '?桀?', '??', '雿', '蝡'];

function assertReadable(value, label) {
  assert.equal(typeof value, 'string', `${label} should be a string`);
  assert(value.trim().length > 0, `${label} should not be empty`);
  assert(!suspiciousTokens.some((token) => value.includes(token)), `${label} still contains garbled text: ${value}`);
}

async function loadWorker() {
  const workerPath = path.resolve('worker', 'ai-answer.js');
  const source = fs.readFileSync(workerPath, 'utf8');
  const patchedSource = source.replace('export default {', 'const workerDefault = {') + '\nexport default workerDefault;';
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(patchedSource).toString('base64')}`;
  return import(moduleUrl);
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

function buildChunk(id, title, text, sourceType = 'schedule') {
  return {
    id,
    title,
    locationLabel: 'Day 1',
    sectionId: 'schedule',
    sourceType,
    navTarget: {
      type: 'schedule',
      dayId: 'day1',
      itemId: id
    },
    text
  };
}

const { default: worker } = await loadWorker();

const insufficient = await invokeWorker(worker, {
  query: '第一天',
  mode: 'grounded_qa_v1',
  chunks: [
    buildChunk('chunk-a', 'Open House', '第一天提早登船後先去 Open House。'),
    buildChunk('chunk-b', 'Concierge Lounge', '之後去 Concierge Lounge 確認晚餐與劇院安排。')
  ]
});

assert.equal(insufficient.response.status, 200);
assert.equal(insufficient.payload.insufficientData, true);
assertReadable(insufficient.payload.answer, 'insufficient answer');
assertReadable(insufficient.payload.missingReason, 'insufficient missingReason');

const groundedFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              answer: '第一天提早登船後，站內內容最一致的建議是先完成 Open House，再去禮賓酒廊確認重點安排。',
              bullets: [
                '先到 Deck 8 完成 Disney Oceaneer Club Open House 與孩子設定。',
                '再到 Deck 17 的 Concierge Lounge 確認晚餐順序與劇院入場安排。'
              ],
              confidence: 'high',
              primarySourceType: 'schedule',
              missingReason: '',
              citationIds: ['chunk-a', 'chunk-b'],
              insufficientData: false
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

const grounded = await invokeWorker(worker, {
  query: '第一天提早登船後最值得先做什麼？',
  mode: 'grounded_qa_v1',
  chunks: [
    buildChunk('chunk-a', 'Open House', '第一天提早登船後先去 Open House，完成孩子手環與接送設定。'),
    buildChunk('chunk-b', 'Concierge Lounge', '之後去 Concierge Lounge 確認晚餐與劇院安排。', 'playbook')
  ]
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: groundedFetch
});

assert.equal(grounded.response.status, 200);
assert.equal(grounded.payload.insufficientData, false);
assert.equal(grounded.payload.citations.length, 2);
assertReadable(grounded.payload.answer, 'grounded answer');

const rewrite = await invokeWorker(worker, {
  query: '禮賓怎麼提早進劇院比較穩？',
  mode: 'query_rewrite_v1',
  chunks: [
    buildChunk('chunk-c', 'Walt Disney Theatre', '若當晚可走禮賓提前入場，演前 40 分鐘到 Deck 5 forward 電梯大廳集合。', 'show')
  ]
});

assert.equal(rewrite.response.status, 200);
assert(Array.isArray(rewrite.payload.keywords) && rewrite.payload.keywords.length > 0, 'rewrite should produce keywords');
assertReadable(rewrite.payload.rewrittenQuery, 'rewrite query');

console.log('AI worker smoke checks passed.');
