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

const reportFetch = async () => new Response(JSON.stringify({
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              answer: '如果你們是第一天提早登船、又想兼顧孩子體力與禮賓動線，最穩的做法通常不是只衝單一點，而是把午餐、Lounge、Open House 串成一條順路流程。',
              bullets: [
                '先處理報到和午餐，避免後面邊走邊補給。',
                '再用 Lounge 做短暫集合與補水，接著進 Open House。',
                '最後才去水區或第二輪自由活動。'
              ],
              confidence: 'high',
              primarySourceType: 'playbook',
              missingReason: '',
              citationIds: ['chunk-a', 'chunk-b', 'chunk-c'],
              insufficientData: false,
              sections: {
                directAnswer: '先把報到與午餐完成，再用 Lounge 接 Open House，整體會比先衝單點更穩。',
                recommendedSteps: [
                  '先完成 check-in 與午餐，讓第一圈不被補給打斷。',
                  '把 Lounge 當 15 到 20 分鐘的補水與集合緩衝站。',
                  '接著進 Open House，等孩子熟悉環境後再去水區或自由活動。'
                ],
                whyThisWorks: [
                  '這樣能同時照顧大人報到節奏、孩子情緒與第一天下午的體力分配。'
                ],
                watchOuts: [
                  '不要把回房當第一優先，因為房卡與行李不一定同步到位。'
                ]
              },
              sourceBreakdown: [
                {
                  type: 'community',
                  summary: '社群實戰重點在於把第一圈固定成 SOP，避免一上船就滿船亂衝。'
                },
                {
                  type: 'concierge',
                  summary: '禮賓加值重點在於把 Lounge 當短補給與集合中轉站。'
                }
              ],
              followUpHint: '如果你想更精準，可以再問「第一天午餐後先去 Lounge 還是直接衝 Open House？」',
              report: {
                headline: '第一天提早登船時，最穩的做法是先完成午餐與報到，再用 Lounge 銜接 Open House。',
                executiveSummary: [
                  '綜合判斷：如果你們想兼顧孩子、體力與第一圈節奏，先午餐再 Lounge 再 Open House 會比先衝單點更穩。',
                  '這樣做能把補給、集合、孩子熟悉環境三件事放在同一條路線處理。'
                ],
                recommendedPlan: [
                  '先完成報到與午餐，避免後面臨時找吃的。',
                  '接著去 Lounge 做短暫補水、集合與同步下一段行程。',
                  '再進 Open House，讓孩子熟悉環境與動線。',
                  '如果孩子狀態還好，再安排水區或第二輪自由活動。'
                ],
                fullCardInventory: [
                  {
                    parentId: 'chunk-a',
                    title: '登船 3 小時 SOP',
                    cardType: 'playbook',
                    groupLabel: '攻略本',
                    sourceLabels: ['攻略本', '社群實戰'],
                    detailBullets: [
                      '先午餐，再把 Lounge 當短暫同步與補給點。',
                      '之後再銜接 Open House，比較不會在第一圈就亂掉節奏。'
                    ],
                    citationIds: ['chunk-a'],
                    renderOrigin: 'model'
                  }
                ],
                detailBreakdown: [
                  'Lounge 在這裡比較像節奏緩衝站，不是第一站主秀。',
                  'Open House 放在補給後進行，孩子通常比較願意配合。'
                ],
                decisionAnalysis: [
                  '這樣的順序把補給、集合、親子節奏放在同一路線，所以整體更省力。',
                  '它同時保留第一天下午後段的彈性，不會一開始就把全家體力用掉。'
                ],
                risksAndFallbacks: [
                  '如果午餐排隊偏長，就縮短 Lounge 停留時間，先保住 Open House。',
                  '如果孩子已經很累，可以把水區移到第二輪，不要硬塞在第一圈。'
                ],
                cardHighlights: [
                  {
                    title: '?餉 3 撠? SOP',
                    sourceType: 'playbook',
                    sourceDetailType: 'community',
                    whyRelevant: '綜合多張卡片後，這張卡最能當成第一天的主流程。',
                    detailBullets: [
                      '先把登船後的必要流程做完，再安排 Lounge 與 Open House，節奏會更穩。',
                      '這張卡同時涵蓋第一天的時間序列與活動優先順序，適合當回答主幹。',
                      '如果同行有孩子，這張卡也適合搭配 Kids Club 的參觀節點一起看。'
                    ],
                    citationIds: ['chunk-a', 'chunk-c']
                  },
                  {
                    title: 'Lounge ?嗥楨銵?',
                    sourceType: 'playbook',
                    sourceDetailType: 'concierge',
                    whyRelevant: '這張卡補了 Lounge 的現場操作細節，能讓答案不只停在高層排序。',
                    detailBullets: [
                      'Lounge 適合在 check-in 後 15 到 20 分鐘內先去，比較容易銜接後面的安排。',
                      '禮賓角度可以補足動線與現場節奏，但仍應與其他來源分開說明。',
                      '如果 Open House 有時間壓力，這張卡能幫助決定 Lounge 要停留多久。'
                    ],
                    citationIds: ['chunk-b']
                  }
                ],
                sourceComparison: [
                  {
                    sourceDetailType: 'community',
                    stance: '綜合判斷',
                    summary: '社群實戰偏向把第一圈做成固定 SOP，先跑最關鍵的三站。',
                    confidenceNote: '適合需要節奏感與少踩雷的家庭。'
                  },
                  {
                    sourceDetailType: 'concierge',
                    stance: '禮賓加值',
                    summary: '禮賓角度更強調把 Lounge 當成集合與補給緩衝區。',
                    confidenceNote: '比較適合有 Lounge 使用情境的旅客。'
                  }
                ],
                unansweredQuestions: [
                  '如果你們第一天實際登船時間偏晚，順序可能要再依午餐與 Open House 時段微調。'
                ],
                sectionCitationIds: {
                  executiveSummary: ['chunk-a', 'chunk-b'],
                  recommendedPlan: ['chunk-a', 'chunk-b', 'chunk-c'],
                  detailBreakdown: ['chunk-b', 'chunk-c'],
                  decisionAnalysis: ['chunk-a', 'chunk-c'],
                  risksAndFallbacks: ['chunk-a', 'chunk-c'],
                  cardHighlights: ['chunk-a', 'chunk-b', 'chunk-c'],
                  sourceComparison: ['chunk-a', 'chunk-b'],
                  unansweredQuestions: ['chunk-c']
                }
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
  query: '第一天提早登船後先去 Lounge 還是 Open House？請整理成完整報告',
  mode: 'grounded_qa_v1',
  responseMode: 'report',
  analysisPlan: {
    responseMode: 'report',
    intentType: 'sequence',
    activeFacetNames: ['goal', 'time', 'entityPlace', 'audience'],
    activeFacetCount: 4,
    triggerReasons: ['多面向問題', '需要比較或取捨', '證據橫跨多張卡片'],
    isComparisonQuery: true,
    hasRiskJudgment: false,
    needsSourceComparison: true,
    rewriteTriggered: false,
    evidenceBudget: 14,
    maxParentCards: 7,
    facetSummary: {
      goal: ['順序', '最順'],
      time: ['第一天', '登船後'],
      entityPlace: ['Lounge', 'Open House'],
      audience: ['孩子', '親子'],
      risk: [],
      alternatives: ['Lounge', 'Open House']
    },
    evidenceSummary: {
      selectedChunkCount: 3,
      parentCardCount: 3,
      sourceTypes: ['playbook', 'schedule'],
      sourceDetailTypes: ['community', 'concierge']
    }
  },
  coverageContract: {
    mode: 'inventory',
    targetCoverageCount: 3,
    minimumCoverageRatio: 1,
    mustRenderParentIds: ['chunk-a', 'chunk-b', 'chunk-c'],
    preferredParentIds: [],
    relevantSourceTypes: ['playbook', 'schedule'],
    coverageReason: '測試模型只回部分 inventory items 時，normalizer 會補齊其餘 parent cards。'
  },
  parentBriefs: [
    {
      parentId: 'chunk-a',
      title: '登船 3 小時 SOP',
      cardType: 'playbook',
      groupLabel: '攻略本',
      sourceLabels: ['攻略本', '社群實戰'],
      detailBullets: ['先午餐，再 Lounge，再 Open House。'],
      citationIds: ['chunk-a'],
      sourceClusterKey: 'boarding-flow',
      renderPriority: 5
    },
    {
      parentId: 'chunk-b',
      title: 'Lounge 當緩衝區',
      cardType: 'service',
      groupLabel: '攻略本',
      sourceLabels: ['攻略本', '禮賓加值'],
      detailBullets: ['先補水、降噪，再重新同步接下來要跑的點。'],
      citationIds: ['chunk-b'],
      sourceClusterKey: 'concierge-service',
      renderPriority: 5
    },
    {
      parentId: 'chunk-c',
      title: '第一天下午節奏',
      cardType: 'schedule',
      groupLabel: '行程',
      sourceLabels: ['行程', '站內整理'],
      detailBullets: ['第一圈先保留最重要的點，不要一開始就滿船亂衝。'],
      citationIds: ['chunk-c'],
      sourceClusterKey: 'boarding-flow',
      renderPriority: 2
    }
  ],
  mustRenderParents: [
    {
      parentId: 'chunk-a',
      title: '登船 3 小時 SOP',
      cardType: 'playbook',
      groupLabel: '攻略本',
      sourceLabels: ['攻略本', '社群實戰'],
      detailBullets: ['先午餐，再 Lounge，再 Open House。'],
      citationIds: ['chunk-a'],
      renderPriority: 5
    },
    {
      parentId: 'chunk-b',
      title: 'Lounge 當緩衝區',
      cardType: 'service',
      groupLabel: '攻略本',
      sourceLabels: ['攻略本', '禮賓加值'],
      detailBullets: ['先補水、降噪，再重新同步接下來要跑的點。'],
      citationIds: ['chunk-b'],
      renderPriority: 5
    },
    {
      parentId: 'chunk-c',
      title: '第一天下午節奏',
      cardType: 'schedule',
      groupLabel: '行程',
      sourceLabels: ['行程', '站內整理'],
      detailBullets: ['第一圈先保留最重要的點，不要一開始就滿船亂衝。'],
      citationIds: ['chunk-c'],
      renderPriority: 2
    }
  ],
  chunks: [
    buildChunk('chunk-a', '登船 3 小時 SOP', '接駁車下車後先跟著指引前進，午餐後再去 Lounge、Open House 和水區。'),
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
  fetchImpl: reportFetch
});

assert.equal(report.response.status, 200);
assert.equal(report.payload.insufficientData, false);
assert.equal(typeof report.payload.report, 'object');
assertReadable(report.payload.report.headline, 'report headline');
assert.equal(typeof report.payload.report.coverageSummary, 'object', 'report should include coverageSummary');
assert(report.payload.report.coverageSummary.selectedParentCount >= 1, 'coverageSummary should include selectedParentCount');
assert(report.payload.report.coverageSummary.targetParentCount >= 3, 'coverageSummary should include targetParentCount');
assert(report.payload.report.coverageSummary.renderedParentCount >= 1, 'coverageSummary should include renderedParentCount');
assert(report.payload.report.coverageSummary.backfilledParentCount >= 1, 'coverageSummary should include backfilledParentCount');
assert(report.payload.report.coverageSummary.coverageRatio >= 1, 'report coverageSummary should reflect full must-render coverage');
assert(Array.isArray(report.payload.report.recommendedPlan) && report.payload.report.recommendedPlan.length >= 3, 'report should include recommendedPlan');
assert(Array.isArray(report.payload.report.fullCardInventory) && report.payload.report.fullCardInventory.length >= 3, 'report should include fullCardInventory');
assertReadable(report.payload.report.fullCardInventory[0].title, 'report fullCardInventory title');
assert(Array.isArray(report.payload.report.fullCardInventory[0].detailBullets) && report.payload.report.fullCardInventory[0].detailBullets.length >= 1, 'report fullCardInventory should include detailBullets');
assert(report.payload.report.fullCardInventory.some((item) => item.renderOrigin === 'backfill'), 'report fullCardInventory should include backfilled items');
assert.deepEqual(
  ['chunk-a', 'chunk-b', 'chunk-c'],
  report.payload.report.fullCardInventory
    .map((item) => item.parentId)
    .filter((parentId) => ['chunk-a', 'chunk-b', 'chunk-c'].includes(parentId))
    .sort(),
  'report fullCardInventory should include every mustRender parent'
);
assert(Array.isArray(report.payload.report.detailBreakdown) && report.payload.report.detailBreakdown.length >= 2, 'report should include detailBreakdown');
assert(Array.isArray(report.payload.report.risksAndFallbacks) && report.payload.report.risksAndFallbacks.length >= 2, 'report should include risksAndFallbacks');
assert(Array.isArray(report.payload.report.sourceComparison) && report.payload.report.sourceComparison.length >= 2, 'report should include sourceComparison');
assert(Array.isArray(report.payload.report.executiveSummary) && report.payload.report.executiveSummary.length >= 2, 'report should include executiveSummary');
assert(Array.isArray(report.payload.report.topicGroups) && report.payload.report.topicGroups.length >= 1, 'report should include topicGroups');
assertReadable(report.payload.report.topicGroups[0].groupTitle, 'report topicGroups title');
assert(Array.isArray(report.payload.report.topicGroups[0].detailItems) && report.payload.report.topicGroups[0].detailItems.length >= 1, 'report topicGroups should include detailItems');
assert(Array.isArray(report.payload.report.cardHighlights) && report.payload.report.cardHighlights.length >= 2, 'report should include cardHighlights');
assertReadable(report.payload.report.cardHighlights[0].title, 'report cardHighlights title');
assert(Array.isArray(report.payload.report.cardHighlights[0].detailBullets) && report.payload.report.cardHighlights[0].detailBullets.length >= 2, 'report cardHighlights should include detailBullets');

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
