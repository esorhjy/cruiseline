import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function assertReadable(value, label) {
  assert.equal(typeof value, 'string', `${label} should be a string`);
  assert(value.trim().length > 0, `${label} should not be empty`);
  assert(!value.includes('\uFFFD'), `${label} should not contain replacement characters`);
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
    evidenceRole: options.evidenceRole || 'core-answer',
    navTarget: options.navTarget || {
      type: 'playbook',
      missionId: 'daily-plan',
      itemId: options.parentId || id
    },
    structuredText: options.structuredText || `${options.fieldLabel || '建議做法'}：${text}`,
    text
  };
}

const worker = await loadWorker();

const shortQuery = await invokeWorker(worker, {
  query: '太短',
  mode: 'grounded_qa_v1',
  chunks: [
    buildChunk('chunk-a', '禮賓酒廊', '禮賓酒廊提供下午茶與休息空間。'),
    buildChunk('chunk-b', '劇院優先入場 SOP', '晚秀前 40 分鐘可在指定地點集合。')
  ]
});

assert.equal(shortQuery.response.status, 200);
assert.equal(shortQuery.payload.insufficientData, true);
assertReadable(shortQuery.payload.answer, 'short query answer');
assertReadable(shortQuery.payload.missingReason, 'short query missingReason');

const reportFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              answer: '禮賓的獨有服務主要集中在酒廊補給、劇院優先入場與專屬協助。',
              bullets: [
                '先把禮賓酒廊、劇院優先入場、Royal Meet & Greet 排進同一份整理。',
                '若想看完整細節，應同時讀服務內容、SOP、注意事項與時段。'
              ],
              confidence: 'high',
              primarySourceType: 'playbook',
              missingReason: '',
              citationIds: ['chunk-a', 'chunk-b', 'chunk-c'],
              insufficientData: false,
              sections: {
                directAnswer: '禮賓最有價值的差異化服務，是酒廊補給、劇院優先入場與專屬協助。',
                recommendedSteps: [
                  '先確認你要盤點的是禮賓酒廊、劇院優先入場與 Meet & Greet。',
                  '再把各卡片裡的時段、位置、限制與實作細節合併來看。'
                ],
                whyThisWorks: [
                  '這樣能避免只看到單一卡片，漏掉同主題的流程與限制。'
                ],
                watchOuts: [
                  '若只看單一卡片，很容易漏掉時段與現場集合細節。'
                ]
              },
              sourceBreakdown: [
                {
                  type: 'concierge',
                  summary: '禮賓加值內容主要來自酒廊、優先入場與專屬協助。'
                },
                {
                  type: 'community',
                  summary: '社群心得通常補充實際集合時間與順序。'
                }
              ],
              followUpHint: '如果要更完整，可再問禮賓劇院、酒廊、Meet & Greet 分別有哪些細節。',
              report: {
                headline: '禮賓服務完整盤點',
                executiveSummary: [
                  '禮賓的高價值內容不是只有酒廊，而是酒廊、劇院與專屬協助一起看。',
                  '真正有用的是把時段、位置、SOP、限制與來源差異一起整理。'
                ],
                recommendedPlan: [
                  '先看禮賓酒廊的補給與休息用途。',
                  '再看劇院優先入場的集合位置與時段。',
                  '最後補上 Meet & Greet 與社群心得。'
                ],
                fullCardInventory: [
                  {
                    parentId: 'chunk-a',
                    title: 'Concierge Lounge',
                    cardType: 'service',
                    groupLabel: '禮賓服務',
                    categoryFamilies: ['服務', '酒廊'],
                    sourceLabels: ['攻略', '禮賓加值'],
                    detailBullets: [
                      '可作為全天候補給與休息據點。',
                      '不同時段可能提供輕食、下午茶或飲料。'
                    ],
                    citationIds: ['chunk-a'],
                    renderOrigin: 'model'
                  }
                ],
                detailBreakdown: [
                  '酒廊與劇院優先入場的價值，在於能同時處理補給與晚秀排隊壓力。'
                ],
                sourceComparison: [
                  {
                    sourceDetailType: 'concierge',
                    stance: '禮賓加值',
                    summary: '酒廊與優先入場屬於禮賓差異化體驗。',
                    confidenceNote: '仍以當晚通知與現場指示為準。'
                  }
                ]
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

const report = await invokeWorker(worker, {
  query: '禮賓可以享受哪些獨有的服務',
  mode: 'grounded_qa_v1',
  responseMode: 'report',
  analysisPlan: {
    responseMode: 'report',
    intentType: 'operational-detail',
    inventoryIntent: true,
    coverageMode: 'exhaustive',
    breadthProfile: 'maximum-expansion',
    activeFacetNames: ['goal', 'entityPlace'],
    activeFacetCount: 2,
    triggerReasons: ['需要完整盤點同主題卡片'],
    evidenceBudget: 24,
    maxParentCards: 10,
    hardAnchors: ['禮賓', 'concierge'],
    softModifiers: ['完整盤點', '所有細節'],
    subjectClusters: ['禮賓', '酒廊', '優先入場', 'Royal Meet & Greet'],
    preferredClusters: ['concierge-service'],
    mustCoverCategories: ['服務', '酒廊', '表演'],
    categoryCoveragePlan: [
      {
        categoryId: 'service',
        label: '服務',
        parentCount: 2,
        sourceMix: ['concierge', 'community'],
        detailHints: ['酒廊補給', '專屬協助']
      },
      {
        categoryId: 'show',
        label: '表演',
        parentCount: 1,
        sourceMix: ['concierge'],
        detailHints: ['劇院優先入場']
      }
    ],
    facetSummary: {
      goal: ['完整盤點'],
      time: [],
      entityPlace: ['禮賓'],
      audience: [],
      risk: [],
      alternatives: []
    }
  },
  coverageContract: {
    mode: 'inventory',
    targetCoverageCount: 3,
    minimumCoverageRatio: 1,
    mustRenderParentIds: ['chunk-a', 'chunk-b', 'chunk-c'],
    preferredParentIds: [],
    mustCoverCategories: ['服務', '酒廊', '表演'],
    preferredClusters: ['concierge-service'],
    relevantSourceTypes: ['playbook'],
    coverageReason: '完整盤點題要覆蓋酒廊、劇院優先入場與 Meet & Greet。'
  },
  parentDossiers: [
    {
      parentId: 'chunk-a',
      title: 'Concierge Lounge',
      cardType: 'service',
      groupLabel: '禮賓服務',
      categoryFamilies: ['服務', '酒廊'],
      sourceLabels: ['攻略', '禮賓加值'],
      detailBullets: ['可作為全天候補給與休息區。', '不同時段有輕食、下午茶或飲料。'],
      citationIds: ['chunk-a'],
      sourceClusterKey: 'concierge-service',
      renderPriority: 5
    },
    {
      parentId: 'chunk-b',
      title: '劇院優先入場 SOP',
      cardType: 'service',
      groupLabel: '禮賓服務',
      categoryFamilies: ['服務', '表演'],
      sourceLabels: ['攻略', '禮賓加值'],
      detailBullets: ['晚秀前 40 分鐘可在指定位置集合。', '實際集合時間仍以當晚通知為準。'],
      citationIds: ['chunk-b'],
      sourceClusterKey: 'concierge-service',
      renderPriority: 5
    },
    {
      parentId: 'chunk-c',
      title: 'Royal Meet & Greet',
      cardType: 'service',
      groupLabel: '禮賓服務',
      categoryFamilies: ['服務'],
      sourceLabels: ['攻略', '社群實戰'],
      detailBullets: ['可請管家協助確認預約時段。', '現場順序與集合方式要提早確認。'],
      citationIds: ['chunk-c'],
      sourceClusterKey: 'concierge-service',
      renderPriority: 4
    }
  ],
  categoryDossiers: [
    {
      categoryId: 'service',
      label: '服務',
      parentCount: 3,
      sourceMix: ['concierge', 'community'],
      detailHints: ['專屬協助', '酒廊補給', 'Meet & Greet'],
      preferredParentIds: ['chunk-a', 'chunk-b', 'chunk-c']
    },
    {
      categoryId: 'show',
      label: '表演',
      parentCount: 1,
      sourceMix: ['concierge'],
      detailHints: ['劇院優先入場', '晚秀前集合'],
      preferredParentIds: ['chunk-b']
    }
  ],
  coverageStats: {
    selectedParentCount: 3,
    selectedChunkCount: 3,
    targetParentCount: 3,
    sourceCounts: {
      concierge: 2,
      community: 1
    },
    primarySubject: '禮賓'
  },
  chunks: [
    buildChunk('chunk-a', 'Concierge Lounge', '禮賓酒廊可作為全天候補給與休息區，並在不同時段提供輕食與飲料。', {
      sourceDetailType: 'concierge',
      fieldType: 'summary',
      fieldLabel: '重點摘要'
    }),
    buildChunk('chunk-b', '劇院優先入場 SOP', '每次主秀當晚、開演前 40 分鐘可在指定位置集合，身上要帶房卡與預約證明。', {
      sourceDetailType: 'concierge',
      fieldType: 'action',
      fieldLabel: '建議做法'
    }),
    buildChunk('chunk-c', 'Royal Meet & Greet', '可請管家協助確認預約時段，社群經驗建議提早再次確認集合地點。', {
      sourceDetailType: 'community',
      fieldType: 'tripFit',
      fieldLabel: '實戰提醒'
    })
  ]
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: reportFetch
});

assert.equal(report.response.status, 200);
assert.equal(report.payload.insufficientData, false);
assertReadable(report.payload.answer, 'report answer');
assert(Array.isArray(report.payload.report.fullCardInventory), 'fullCardInventory should exist');
assert(report.payload.report.fullCardInventory.some((item) => item.parentId === 'chunk-b'), 'normalizer should backfill missing parent inventory');
assert(report.payload.report.fullCardInventory.some((item) => item.parentId === 'chunk-c'), 'normalizer should backfill all must-render parents');
assert(Array.isArray(report.payload.report.topicAppendix) && report.payload.report.topicAppendix.length >= 1, 'topicAppendix should be generated');
assert(report.payload.report.topicAppendix.some((item) => item.categoryId === 'service'), 'topicAppendix should include category dossiers');
assert.equal(report.payload.report.coverageSummary.renderedParentCount, 3);
assert.equal(report.payload.report.coverageSummary.targetParentCount, 3);
assert(report.payload.report.coverageSummary.coverageRatio >= 1 || report.payload.report.coverageSummary.coverageRatio === 1);
