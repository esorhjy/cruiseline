import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function assertReadable(value, label) {
  assert.equal(typeof value, 'string', `${label} should be a string`);
  assert(value.trim().length > 0, `${label} should not be empty`);
  assert(!value.includes('\uFFFD'), `${label} still contains replacement characters: ${value}`);
  assert(/[\u4e00-\u9fffA-Za-z]/.test(value), `${label} should contain readable text: ${value}`);
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

function buildChunk(id, title, text, options = {}) {
  return {
    id,
    parentId: options.parentId || id,
    title,
    locationLabel: options.locationLabel || 'Day 1',
    sectionId: options.sectionId || 'playbook',
    sourceType: options.sourceType || 'playbook',
    sourceDetailType: options.sourceDetailType || 'community',
    fieldType: options.fieldType || 'action',
    fieldLabel: options.fieldLabel || '建議做法',
    evidenceRole: options.evidenceRole || 'sop-action',
    navTarget: options.navTarget || {
      type: 'playbook',
      missionId: 'daily-ops',
      itemId: options.parentId || id
    },
    structuredText: options.structuredText || `${options.fieldLabel || '建議做法'}：${text}`,
    text
  };
}

const { default: worker } = await loadWorker();

const insufficient = await invokeWorker(worker, {
  query: '太短',
  mode: 'grounded_qa_v1',
  chunks: [
    buildChunk('chunk-a', '登船 3 小時 SOP', '上船後先午餐、再 Lounge、再 Open House。'),
    buildChunk('chunk-b', 'Lounge 當中轉站', '把 Lounge 當短暫補給與同步集合點。', {
      sourceDetailType: 'concierge',
      fieldType: 'tripFit',
      fieldLabel: '這趟為什麼適合',
      evidenceRole: 'why-this-works'
    })
  ]
});

assert.equal(insufficient.response.status, 200);
assert.equal(insufficient.payload.insufficientData, true);
assertReadable(insufficient.payload.answer, 'insufficient answer');
assertReadable(insufficient.payload.missingReason, 'insufficient missingReason');
assertReadable(insufficient.payload.sections.directAnswer, 'insufficient directAnswer');

const groundedFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              answer: '如果你們是提早登船的家庭組合，第一圈最穩的做法通常是先完成午餐與必要報到，再把 Lounge、Open House 和孩子放電串成同一路線。',
              bullets: [
                '先完成 check-in 與坐下式午餐，避免後面邊走邊找吃的。',
                '接著用 Lounge 做短補給和重新集合，再往 Kids Club Open House 移動。',
                '真正要衝的不是全船，而是把第一圈最重要的節奏跑順。'
              ],
              confidence: 'high',
              primarySourceType: 'playbook',
              missingReason: '',
              citationIds: ['chunk-a', 'chunk-b', 'chunk-c'],
              insufficientData: false,
              sections: {
                directAnswer: '先把報到和午餐處理完，再用 Lounge 銜接 Open House 會最穩。',
                recommendedSteps: [
                  '先跟著報到動線完成 QR code 安檢與 check-in。',
                  '午餐結束後去 Lounge 做 15 到 20 分鐘補給與集合。',
                  '再去 Kids Club Open House，最後才進水區放電。'
                ],
                whyThisWorks: [
                  '這樣能同時照顧大人報到、孩子熟悉環境和第一天下午的體力分配。'
                ],
                watchOuts: [
                  '房卡與行李不一定同時到位，不要把回房當第一優先。'
                ]
              },
              sourceBreakdown: [
                {
                  type: 'community',
                  summary: '社群實戰重點在於把第一圈路線固定成 SOP，避免一開始滿船亂衝。'
                },
                {
                  type: 'concierge',
                  summary: '禮賓加值重點在於把 Lounge 當集合與補水中轉站，而不是正餐替代。'
                }
              ],
              followUpHint: '如果想更精準，可以把問題補成「第一天提早登船後先去 Lounge 還是 Open House？」'
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
  query: '第一天提早登船後先去 Lounge 還是 Open House？',
  mode: 'grounded_qa_v1',
  chunks: [
    buildChunk('chunk-a', '登船 3 小時 SOP', '接駁車下車後直接跟指引前進，午餐後再去 Lounge、Open House 和水區。'),
    buildChunk('chunk-b', 'Lounge 當緩衝區', '把 Lounge 當作 15 到 20 分鐘的補水、降噪與重新同步中轉站。', {
      sourceDetailType: 'concierge',
      fieldType: 'action',
      fieldLabel: '建議做法',
      evidenceRole: 'sop-action'
    }),
    buildChunk('chunk-c', '第一天下午節奏', '第一天先保留最重要的第一圈，不要一開始就滿船亂衝。', {
      sourceType: 'schedule',
      sourceDetailType: 'general',
      fieldType: 'desc',
      fieldLabel: '行程重點',
      evidenceRole: 'context-day',
      sectionId: 'schedule'
    })
  ]
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: groundedFetch
});

assert.equal(grounded.response.status, 200);
assert.equal(grounded.payload.insufficientData, false);
assert.equal(grounded.payload.citations.length, 3);
assertReadable(grounded.payload.answer, 'grounded answer');
assertReadable(grounded.payload.sections.directAnswer, 'grounded directAnswer');
assert(Array.isArray(grounded.payload.sections.recommendedSteps) && grounded.payload.sections.recommendedSteps.length >= 2, 'grounded should include recommendedSteps');
assert(Array.isArray(grounded.payload.sourceBreakdown) && grounded.payload.sourceBreakdown.length >= 2, 'grounded should include source breakdown');
assertReadable(grounded.payload.followUpHint, 'grounded followUpHint');

const rewriteFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              rewrittenQuery: '禮賓 劇院 優先入場 金色房卡 預訂證明',
              keywords: ['禮賓', '劇院', '優先入場', '金色房卡', '預訂證明'],
              alternates: ['Deck 5 forward 集合點', '主秀前 40 分鐘'],
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

const rewrite = await invokeWorker(worker, {
  query: '禮賓怎麼提早進劇院？',
  mode: 'query_rewrite_v1',
  chunks: [
    buildChunk('chunk-d', '劇院優先入場 SOP', '演前 40 分鐘先到 Deck 5 forward 集合點，帶好金色房卡與 Navigator App 預訂證明。', {
      sourceDetailType: 'concierge',
      fieldType: 'action',
      fieldLabel: '建議做法',
      evidenceRole: 'sop-action'
    })
  ]
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: rewriteFetch
});

assert.equal(rewrite.response.status, 200);
assert(Array.isArray(rewrite.payload.keywords) && rewrite.payload.keywords.length >= 3, 'rewrite should produce keywords');
assertReadable(rewrite.payload.rewrittenQuery, 'rewrite query');

console.log('AI worker smoke checks passed.');
