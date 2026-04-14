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

async function invokeWorkerRequest(worker, request, options = {}) {
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
    fieldLabel: options.fieldLabel || '內容重點',
    evidenceRole: options.evidenceRole || 'core-answer',
    navTarget: options.navTarget || {
      type: 'playbook',
      missionId: 'daily-plan',
      itemId: options.parentId || id
    },
    structuredText: options.structuredText || `${options.fieldLabel || '內容重點'}：${text}`,
    text
  };
}

const worker = await loadWorker();

const shortQuery = await invokeWorker(worker, {
  query: '禮賓',
  mode: 'grounded_qa_v1',
  chunks: [
    buildChunk('chunk-a', 'Concierge Lounge', '禮賓酒廊可作為全天候補給與休息據點。'),
    buildChunk('chunk-b', '劇院優先入場 SOP', '每次主秀開演前 40 分鐘集合。')
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
              answer: '禮賓服務最值得先掌握的是 Lounge、劇院優先入場 SOP，以及 Royal Meet & Greet 這三組內容。',
              bullets: [
                '登船日可先去 Concierge Lounge 報到，整理當天可用的補給與服務。',
                '主秀當晚可依劇院優先入場 SOP 預留更舒服的排隊與進場節奏。'
              ],
              confidence: 'high',
              primarySourceType: 'playbook',
              missingReason: '',
              citationIds: ['chunk-a', 'chunk-b', 'chunk-c'],
              insufficientData: false,
              sections: {
                directAnswer: '禮賓服務可以先從 Lounge、劇院優先入場與 Royal Meet & Greet 這三張卡一起看。',
                recommendedSteps: [
                  '登船後先去 Concierge Lounge 報到，確認當天通知與可用加值。',
                  '若要看主秀，提早依 SOP 到指定集合點，減少臨場壓力。'
                ],
                whyThisWorks: [
                  '這樣排可以把補給、主秀與角色互動的節奏串起來，不會讓每張卡分散成孤立資訊。'
                ],
                watchOuts: [
                  '當晚集合細節與通知仍要以禮賓現場資訊為準。'
                ]
              },
              sourceBreakdown: [
                {
                  type: 'concierge',
                  summary: '禮賓來源會更聚焦在 Lounge、優先入場與加值流程。'
                },
                {
                  type: 'community',
                  summary: '社群來源補的是實際體感、動線與安排心得。'
                }
              ],
              followUpHint: '如果要更細，可以再問 Lounge 開放內容或 Meet & Greet 的安排時機。',
              report: {
                headline: '禮賓服務重點整理',
                executiveSummary: [
                  '禮賓的主體是 Lounge、劇院優先入場 SOP 與 Royal Meet & Greet 三組加值內容。',
                  '如果想快速上手，先看 Lounge 的定位，再把主秀進場流程與角色互動安排串起來。'
                ],
                recommendedPlan: [
                  '先把 Lounge 當作全天候補給與休息據點。',
                  '主秀當晚提早到指定集合點，走優先入場流程。',
                  '再把 Meet & Greet 的預約與角色互動排進整體節奏。'
                ],
                longformArticle: {
                  headline: '禮賓服務重點整理',
                  introSummary: '這份長文章會把 Lounge、主秀優先入場 SOP 與 Meet & Greet 分開整理，讓你可以一路往下讀。',
                  sections: [
                    {
                      sectionKey: 'playbook',
                      sectionTitle: '攻略區塊摘要',
                      sectionSummary: '先把禮賓相關的服務卡與 SOP 卡整合成可連續閱讀的小節。',
                      cards: [
                        {
                          parentId: 'chunk-a',
                          title: 'Concierge Lounge',
                          cardType: 'service',
                          sourceLabels: ['攻略', '禮賓加值'],
                          timeSummary: '登船日可先去報到',
                          locationSummary: 'Deck 17',
                          contentParagraph: '可作為全天候補給與休息據點，並整理禮賓服務的使用方式。',
                          insightParagraph: '把 Lounge 當成中繼站，能順手把補給、晚秀與 Meet & Greet 安排串起來。',
                          cautionParagraph: '實際供應內容與通知仍以當天禮賓資訊為主。',
                          citationIds: ['chunk-a'],
                          renderOrigin: 'model'
                        }
                      ]
                    }
                  ],
                  sourceComparison: [
                    {
                      sourceDetailType: 'concierge',
                      stance: '禮賓加值',
                      summary: '由禮賓角度整理 Lounge 與優先入場的實際用法。'
                    }
                  ],
                  unansweredQuestions: []
                },
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
                    summary: '禮賓來源更偏向實際操作與當晚流程。',
                    confidenceNote: '仍需依現場通知微調。'
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
  query: '禮賓有哪些服務與注意事項？',
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
    triggerReasons: ['需要完整盤點禮賓服務'],
    evidenceBudget: 24,
    maxParentCards: 10,
    hardAnchors: ['禮賓', 'concierge'],
    softModifiers: ['服務', '注意事項'],
    subjectClusters: ['禮賓', 'Lounge', '劇院優先入場', 'Royal Meet & Greet'],
    preferredClusters: ['concierge-service'],
    mustCoverCategories: ['服務', '酒廊', '表演'],
    categoryCoveragePlan: [
      {
        categoryId: 'service',
        label: '服務',
        parentCount: 2,
        sourceMix: ['concierge', 'community'],
        detailHints: ['Lounge 使用方式', '角色互動安排']
      },
      {
        categoryId: 'show',
        label: '表演',
        parentCount: 1,
        sourceMix: ['concierge'],
        detailHints: ['劇院優先入場 SOP']
      }
    ],
    facetSummary: {
      goal: ['整理服務與注意事項'],
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
    coverageReason: '要把禮賓相關的三張主卡都整理進回答。'
  },
  parentDossiers: [
    {
      parentId: 'chunk-a',
      title: 'Concierge Lounge',
      cardType: 'service',
      groupLabel: '禮賓服務',
      categoryFamilies: ['服務', '酒廊'],
      sourceLabels: ['攻略', '禮賓加值'],
      detailBullets: ['登船日可先去報到。', '可作為全天候補給與休息據點。'],
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
      detailBullets: ['每次主秀開演前 40 分鐘集合。', '可依禮賓流程優先入場。'],
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
      detailBullets: ['可與角色互動安排一起整理。', '社群多把它視為行程串接點。'],
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
      detailHints: ['Lounge 使用方式', 'Meet & Greet 串接'],
      preferredParentIds: ['chunk-a', 'chunk-b', 'chunk-c']
    },
    {
      categoryId: 'show',
      label: '表演',
      parentCount: 1,
      sourceMix: ['concierge'],
      detailHints: ['劇院優先入場 SOP'],
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
  articleMode: 'longform-by-section',
  articlePlan: {
    articleMode: 'longform-by-section',
    sections: [
      {
        sectionKey: 'playbook',
        sectionTitle: '攻略區塊摘要',
        parentIds: ['chunk-a', 'chunk-b', 'chunk-c']
      }
    ]
  },
  cardDossiersByBlock: [
    {
      sectionKey: 'playbook',
      sectionTitle: '攻略區塊摘要',
      cards: [
        {
          parentId: 'chunk-a',
          title: 'Concierge Lounge',
          cardType: 'service',
          sourceLabels: ['攻略', '禮賓加值'],
          timeSummary: '登船日可先去報到',
          locationSummary: 'Deck 17',
          contentParagraph: '可作為全天候補給與休息據點。',
          insightParagraph: '能當成串接晚秀與 Meet & Greet 的中繼站。',
          cautionParagraph: '當天供應內容仍以禮賓通知為主。',
          citationIds: ['chunk-a'],
          renderOrigin: 'backfill'
        },
        {
          parentId: 'chunk-b',
          title: '劇院優先入場 SOP',
          cardType: 'service',
          sourceLabels: ['攻略', '禮賓加值'],
          timeSummary: '每次主秀開演前 40 分鐘',
          locationSummary: 'Deck 5 船頭集合',
          contentParagraph: '先到指定集合點，再依禮賓流程優先入場。',
          insightParagraph: '把優先入場跟晚餐後動線一起排，體感最順。',
          cautionParagraph: '實際集合細節仍以當晚禮賓通知為主。',
          citationIds: ['chunk-b'],
          renderOrigin: 'backfill'
        },
        {
          parentId: 'chunk-c',
          title: 'Royal Meet & Greet',
          cardType: 'service',
          sourceLabels: ['攻略', '社群實戰'],
          timeSummary: '',
          locationSummary: '',
          contentParagraph: '把角色拍照與禮賓加值服務一起安排，能減少臨場切換成本。',
          insightParagraph: '社群經驗多半會把 Meet & Greet 視為行程串接點，而不是孤立任務。',
          cautionParagraph: '仍需依預約時段與現場安排調整。',
          citationIds: ['chunk-c'],
          renderOrigin: 'backfill'
        }
      ]
    }
  ],
  chunks: [
    buildChunk('chunk-a', 'Concierge Lounge', '禮賓酒廊可作為全天候補給與休息據點，並協助整理當天可用服務。', {
      sourceDetailType: 'concierge',
      fieldType: 'summary',
      fieldLabel: '重點摘要'
    }),
    buildChunk('chunk-b', '劇院優先入場 SOP', '主秀當晚通常會在開演前 40 分鐘先集合，再依禮賓流程優先入場。', {
      sourceDetailType: 'concierge',
      fieldType: 'action',
      fieldLabel: '建議做法'
    }),
    buildChunk('chunk-c', 'Royal Meet & Greet', '社群多把角色互動安排與禮賓加值服務一起規劃，避免臨場切換太碎。', {
      sourceDetailType: 'community',
      fieldType: 'tripFit',
      fieldLabel: '旅程連結'
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
assert(report.payload.report.longformArticle && Array.isArray(report.payload.report.longformArticle.sections), 'longformArticle should exist');
const longformSections = report.payload.report.longformArticle.sections;
const longformDeckShow = longformSections.find((section) => section.sectionKey === 'deckShow');
const longformPlaybook = longformSections.find((section) => section.sectionKey === 'playbook');
assert(longformPlaybook, 'longformArticle should keep the playbook block');
assert(Array.isArray(longformPlaybook.narrativeParagraphs) && longformPlaybook.narrativeParagraphs.length >= 1, 'playbook block should expose readable narrative paragraphs');
assert(longformPlaybook.narrativeParagraphs.length <= 5, 'playbook narratives should consolidate multiple cards into a few readable paragraphs');
assert(longformPlaybook.narrativeParagraphs.some((paragraph) => /禮賓隱藏加值|劇院優先入場|concierge|Royal Meet/i.test(paragraph)), 'playbook narratives should merge card content into readable prose');
assert(longformPlaybook.narrativeParagraphs.every((paragraph) => !/活動標籤|行程重點|適用時機/i.test(paragraph)), 'playbook narratives should not leak raw field labels');
assert(Array.isArray(longformPlaybook.citationIds) && longformPlaybook.citationIds.length >= 1, 'playbook narratives should keep citations');
assert(Array.isArray(longformPlaybook.cards) && longformPlaybook.cards.some((card) => card.parentId === 'chunk-b'), 'longformArticle should still retain the core playbook cards internally');
assert(
  report.payload.report.longformArticle.sections.some((section) => Array.isArray(section?.cards) && section.cards.some((card) => card.parentId === 'chunk-c')),
  'longformArticle should still retain all must-render cards internally'
);
assert.equal(report.payload.report.coverageSummary.renderedParentCount, 3);
assert.equal(report.payload.report.coverageSummary.targetParentCount, 3);
assert(report.payload.report.coverageSummary.coverageRatio >= 1 || report.payload.report.coverageSummary.coverageRatio === 1);
assertReadable(report.payload.workerBuildId, 'workerBuildId');
assert.equal(report.payload.workerSchemaVersion, 'ai-answer-worker-v9');
assert(Array.isArray(report.payload.workerCapabilities) && report.payload.workerCapabilities.includes('health_check'), 'workerCapabilities should include health_check');

const health = await invokeWorkerRequest(worker, new Request('https://example.com/api/ai-answer?health=1', {
  method: 'GET'
}), {
  env: {
    GEMINI_API_KEY: 'test-key'
  }
});

assert.equal(health.response.status, 200);
assert.equal(health.payload.ok, true);
assert.equal(health.payload.endpoint, 'ai-answer');
assert.equal(health.payload.status, 'healthy');
assert.equal(health.payload.workerSchemaVersion, 'ai-answer-worker-v9');
assertReadable(health.payload.workerBuildId, 'health workerBuildId');
assert(Array.isArray(health.payload.workerCapabilities) && health.payload.workerCapabilities.includes('query_interpretation_v3'), 'health workerCapabilities should expose query_interpretation_v3');

const geminiFailureFallback = await invokeWorker(worker, {
  query: '禮賓的設施與服務',
  mode: 'grounded_qa_v1',
  responseMode: 'report',
  parentDossiers: [
    {
      parentId: 'chunk-a',
      title: 'Concierge Lounge',
      cardType: 'service',
      groupLabel: '禮賓服務',
      categoryFamilies: ['service'],
      sourceLabels: ['攻略本', '禮賓服務'],
      detailBullets: ['位於 Deck 17，是禮賓家庭常用的補給與休息據點。'],
      citationIds: ['chunk-a']
    }
  ],
  categoryDossiers: [
    {
      categoryId: 'service',
      label: '服務',
      parentCount: 1,
      sourceMix: ['concierge'],
      detailHints: ['Lounge 供應與中繼用途'],
      preferredParentIds: ['chunk-a']
    }
  ],
  coverageStats: {
    selectedParentCount: 1,
    targetParentCount: 1,
    sourceCounts: {
      concierge: 1
    },
    primarySubject: '禮賓'
  },
  coverageContract: {
    mode: 'inventory',
    targetCoverageCount: 1,
    minimumCoverageRatio: 1,
    mustRenderParentIds: ['chunk-a'],
    preferredParentIds: [],
    mustCoverCategories: ['service'],
    preferredClusters: ['concierge-service'],
    relevantSourceTypes: ['playbook'],
    coverageReason: '測試 Gemini 失敗時的 report fallback'
  },
  chunks: [
    buildChunk('chunk-a', 'Concierge Lounge', '位於 Deck 17，是禮賓家庭常用的補給與休息據點。', {
      sourceDetailType: 'concierge',
      fieldType: 'summary',
      fieldLabel: '重點摘要'
    })
  ]
}, {
  env: {
    GEMINI_API_KEY: 'test-key'
  },
  fetchImpl: async () => {
    throw new Error('Gemini request failed');
  }
});

assert.equal(geminiFailureFallback.response.status, 200, 'Gemini failure should still return a readable fallback payload');
assert(geminiFailureFallback.payload.report?.longformArticle?.sections?.length, 'Gemini failure fallback should still contain longformArticle');

console.log('AI answer smoke passed.');
