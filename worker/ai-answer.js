const MAX_CHUNKS = 96;
const COMPACT_MAX_CHUNKS = 8;
const REWRITE_MAX_CHUNKS = 4;
const MIN_CHUNKS = 2;
const MIN_REWRITE_CHUNKS = 1;
const MAX_QUERY_LENGTH = 500;
const MAX_TEXT_LENGTH = 2200;
const MIN_QUERY_SIGNAL = 6;
const MAX_PARENT_BRIEFS = 32;
const MAX_FULL_CARD_INVENTORY = 32;
const ALLOWED_SOURCE_TYPES = ['schedule', 'deck', 'show', 'playbook', 'static'];
const ALLOWED_SOURCE_DETAIL_TYPES = ['official', 'concierge', 'community', 'general'];
const ALLOWED_CONFIDENCE = ['high', 'medium', 'low'];
const ALLOWED_RESPONSE_MODES = ['compact', 'report'];
const REPORT_SECTION_KEYS = [
  'executiveSummary',
  'recommendedPlan',
  'fullCardInventory',
  'topicAppendix',
  'detailBreakdown',
  'decisionAnalysis',
  'risksAndFallbacks',
  'topicGroups',
  'cardHighlights',
  'sourceComparison',
  'unansweredQuestions'
];
const WORKER_BUILD_ID = '2026-04-15-ai-worker-v11';
const WORKER_SCHEMA_VERSION = 'ai-answer-worker-v9';
const WORKER_DEPLOYED_AT = '2026-04-15T18:10:00+08:00';
const WORKER_CAPABILITIES = [
  'health_check',
  'grounded_qa_v1',
  'query_interpretation_v3',
  'query_rewrite_v1',
  'section_narrative_longform'
];

function createCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function attachWorkerMetadata(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
  return {
    ...body,
    workerBuildId: WORKER_BUILD_ID,
    workerSchemaVersion: WORKER_SCHEMA_VERSION,
    workerCapabilities: WORKER_CAPABILITIES
  };
}

function buildHealthPayload(env = {}) {
  return {
    ok: true,
    endpoint: 'ai-answer',
    status: 'healthy',
    geminiModel: String(env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim(),
    deployedAt: WORKER_DEPLOYED_AT
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(attachWorkerMetadata(body)), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...createCorsHeaders()
    }
  });
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueBy(items, getKey) {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    if (!item) return;
    const key = typeof getKey === 'function' ? getKey(item) : item;
    const safeKey = sanitizeString(key, 160);
    if (!safeKey || map.has(safeKey)) return;
    map.set(safeKey, item);
  });
  return Array.from(map.values());
}

function normalizeQuery(text) {
  return String(text || '')
    .normalize('NFKC')
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getQuerySignalLength(text) {
  return normalizeQuery(text).replace(/\s+/g, '').length;
}

function sanitizeString(value, maxLength = MAX_TEXT_LENGTH) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeNavTarget(navTarget) {
  if (!navTarget || typeof navTarget !== 'object') return null;
  return JSON.parse(JSON.stringify(navTarget));
}

function sanitizeSourceType(sourceType) {
  const normalized = sanitizeString(sourceType, 24).toLowerCase();
  return ALLOWED_SOURCE_TYPES.includes(normalized) ? normalized : 'static';
}

function sanitizeSourceDetailType(sourceDetailType) {
  const normalized = sanitizeString(sourceDetailType, 24).toLowerCase();
  return ALLOWED_SOURCE_DETAIL_TYPES.includes(normalized) ? normalized : 'general';
}

function sanitizeResponseMode(responseMode) {
  const normalized = sanitizeString(responseMode, 16).toLowerCase();
  return ALLOWED_RESPONSE_MODES.includes(normalized) ? normalized : 'compact';
}

function sanitizeConfidence(confidence) {
  return ALLOWED_CONFIDENCE.includes(confidence) ? confidence : 'low';
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.round(numeric), min), max);
}

function clampFraction(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Number(numeric.toFixed(2)), 0), 1);
}

function sanitizeTextArray(items, maxItems, maxLength) {
  return (Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeChunks(chunks, maxChunks = MAX_CHUNKS) {
  return (Array.isArray(chunks) ? chunks : [])
    .map((chunk) => ({
      id: sanitizeString(chunk?.id, 120),
      parentId: sanitizeString(chunk?.parentId, 120),
      title: sanitizeString(chunk?.title, 160),
      locationLabel: sanitizeString(chunk?.locationLabel, 200),
      sectionId: sanitizeString(chunk?.sectionId, 80),
      sourceType: sanitizeSourceType(chunk?.sourceType),
      sourceDetailType: sanitizeSourceDetailType(chunk?.sourceDetailType),
      fieldType: sanitizeString(chunk?.fieldType, 40).toLowerCase(),
      fieldLabel: sanitizeString(chunk?.fieldLabel, 80),
      evidenceRole: sanitizeString(chunk?.evidenceRole, 40).toLowerCase(),
      timeHint: sanitizeString(chunk?.timeHint, 160),
      bestTimeHint: sanitizeString(chunk?.bestTimeHint, 160),
      navTarget: sanitizeNavTarget(chunk?.navTarget),
      structuredText: sanitizeString(chunk?.structuredText, MAX_TEXT_LENGTH),
      text: sanitizeString(chunk?.text, MAX_TEXT_LENGTH)
    }))
    .filter((chunk) => chunk.id && chunk.title && (chunk.structuredText || chunk.text))
    .slice(0, maxChunks);
}

function sanitizeAnalysisPlan(plan, responseMode = 'compact') {
  const safePlan = plan && typeof plan === 'object' ? plan : {};
  const facetSummary = safePlan.facetSummary && typeof safePlan.facetSummary === 'object'
    ? safePlan.facetSummary
    : {};
  const evidenceSummary = safePlan.evidenceSummary && typeof safePlan.evidenceSummary === 'object'
    ? safePlan.evidenceSummary
    : {};
  const evidenceLayers = safePlan.evidenceLayers && typeof safePlan.evidenceLayers === 'object'
    ? safePlan.evidenceLayers
    : {};

  return {
    responseMode: sanitizeResponseMode(safePlan.responseMode || responseMode),
    intentType: sanitizeString(safePlan.intentType, 40).toLowerCase() || 'operational-detail',
    activeFacetNames: sanitizeTextArray(safePlan.activeFacetNames, 6, 40),
    activeFacetCount: clampNumber(safePlan.activeFacetCount, 0, 6, 0),
    triggerReasons: sanitizeTextArray(safePlan.triggerReasons, 6, 80),
    isComparisonQuery: Boolean(safePlan.isComparisonQuery),
    hasRiskJudgment: Boolean(safePlan.hasRiskJudgment),
    needsSourceComparison: Boolean(safePlan.needsSourceComparison),
    rewriteTriggered: Boolean(safePlan.rewriteTriggered),
    evidenceBudget: clampNumber(safePlan.evidenceBudget, 2, MAX_CHUNKS, responseMode === 'report' ? MAX_CHUNKS : COMPACT_MAX_CHUNKS),
    maxParentCards: clampNumber(safePlan.maxParentCards, 1, 10, responseMode === 'report' ? 10 : 4),
    hardAnchors: sanitizeTextArray(safePlan.hardAnchors, 14, 80),
    softModifiers: sanitizeTextArray(safePlan.softModifiers, 14, 80),
    subjectClusters: sanitizeTextArray(safePlan.subjectClusters, 16, 80),
    facetSummary: {
      goal: sanitizeTextArray(facetSummary.goal, 8, 80),
      time: sanitizeTextArray(facetSummary.time, 8, 80),
      entityPlace: sanitizeTextArray(facetSummary.entityPlace, 10, 80),
      audience: sanitizeTextArray(facetSummary.audience, 6, 80),
      risk: sanitizeTextArray(facetSummary.risk, 8, 80),
      alternatives: sanitizeTextArray(facetSummary.alternatives, 6, 80)
    },
    evidenceLayers: {
      core: sanitizeTextArray(evidenceLayers.core, 12, 80),
      extension: sanitizeTextArray(evidenceLayers.extension, 16, 80),
      rulesLimits: sanitizeTextArray(evidenceLayers.rulesLimits, 10, 80),
      timingContext: sanitizeTextArray(evidenceLayers.timingContext, 8, 80),
      sourceContrast: sanitizeTextArray(evidenceLayers.sourceContrast, 8, 80)
    },
    evidenceSummary: {
      selectedChunkCount: clampNumber(evidenceSummary.selectedChunkCount, 0, MAX_CHUNKS, 0),
      parentCardCount: clampNumber(evidenceSummary.parentCardCount, 0, 10, 0),
      sourceTypes: sanitizeTextArray(evidenceSummary.sourceTypes, 6, 32).map(sanitizeSourceType),
      sourceDetailTypes: sanitizeTextArray(evidenceSummary.sourceDetailTypes, 4, 32).map(sanitizeSourceDetailType)
    },
    literalAnchors: sanitizeTextArray(safePlan.literalAnchors, 12, 80),
    canonicalEntities: sanitizeTextArray(safePlan.canonicalEntities, 10, 80),
    genericClasses: sanitizeTextArray(safePlan.genericClasses, 8, 80),
    requiredCapabilities: sanitizeTextArray(safePlan.requiredCapabilities, 6, 40),
    disallowedCategories: sanitizeTextArray(safePlan.disallowedCategories, 10, 80),
    answerIntent: sanitizeString(safePlan.answerIntent, 40).toLowerCase() || 'answer',
    expandedCategories: sanitizeTextArray(safePlan.expandedCategories, 12, 80),
    clusterExpansions: sanitizeTextArray(safePlan.clusterExpansions, 16, 80),
    coverageHints: sanitizeTextArray(safePlan.coverageHints, 8, 32),
    breadthSignals: sanitizeTextArray(safePlan.breadthSignals, 8, 60),
    facilityBreadthMode: Boolean(safePlan.facilityBreadthMode),
    breadthProfile: sanitizeString(safePlan.breadthProfile, 40) || 'guided-expansion',
    expansionReasons: sanitizeTextArray(safePlan.expansionReasons, 10, 120),
    preferredClusters: sanitizeTextArray(safePlan.preferredClusters, 12, 80),
    mustCoverCategories: sanitizeTextArray(safePlan.mustCoverCategories, 12, 80),
    mustCoverCapabilities: sanitizeTextArray(safePlan.mustCoverCapabilities, 6, 40),
    categoryCoveragePlan: sanitizeCategoryDossiers(safePlan.categoryCoveragePlan || [])
  };
}

function getSourceDetailLabel(sourceDetailType) {
  const labels = {
    official: '官方規則',
    concierge: '禮賓加值',
    community: '社群實戰',
    general: '站內整理'
  };
  return labels[sourceDetailType] || '站內整理';
}

function getSourceTypeLabel(sourceType) {
  const labels = {
    schedule: '行程',
    deck: '甲板 / 設施',
    show: '表演 / 場館',
    playbook: '攻略本',
    static: '其他資訊'
  };
  return labels[sourceType] || '站內內容';
}

function buildChunkPreview(chunk, maxLength = 96) {
  const text = sanitizeString(chunk.structuredText || chunk.text, maxLength);
  return text.length > maxLength - 1 ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function getSourceDetailLabelV2(sourceDetailType) {
  const labels = {
    official: '官方規則',
    concierge: '禮賓加值',
    community: '社群實戰',
    general: '站內整理'
  };
  return labels[sourceDetailType] || '站內整理';
}

function getSourceTypeLabelV2(sourceType) {
  const labels = {
    schedule: '行程',
    deck: '甲板 / 設施',
    show: '表演 / 娛樂',
    playbook: '攻略卡',
    static: '站內資訊'
  };
  return labels[sourceType] || '站內資訊';
}

function buildSourceBreakdownFromChunks(chunks, citationIds = []) {
  const chunkPool = citationIds.length
    ? citationIds.map((id) => chunks.find((chunk) => chunk.id === id)).filter(Boolean)
    : chunks;
  const grouped = new Map();

  chunkPool.forEach((chunk) => {
    const type = sanitizeSourceDetailType(chunk.sourceDetailType);
    if (grouped.has(type)) return;
    grouped.set(type, {
      type,
      summary: sanitizeString(
        `${chunk.title}：${chunk.fieldLabel || '重點'}是「${buildChunkPreview(chunk, 88)}」`,
        180
      )
    });
  });

  return Array.from(grouped.values()).slice(0, 4);
}

function normalizeSections(sections = {}, fallbackAnswer = '', fallbackBullets = []) {
  const safeSections = sections && typeof sections === 'object' ? sections : {};
  const recommendedSteps = sanitizeTextArray(safeSections.recommendedSteps || fallbackBullets, 12, 260);
  const whyThisWorks = sanitizeTextArray(safeSections.whyThisWorks, 8, 240);
  const watchOuts = sanitizeTextArray(safeSections.watchOuts, 10, 240);

  return {
    directAnswer: sanitizeString(safeSections.directAnswer || fallbackAnswer, 1200),
    recommendedSteps,
    whyThisWorks,
    watchOuts
  };
}

function buildSourceBreakdownFromChunksV2(chunks, citationIds = []) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const chunkPool = citationIds.length
    ? citationIds.map((id) => chunkMap.get(id)).filter(Boolean)
    : chunks;
  const grouped = new Map();

  chunkPool.forEach((chunk) => {
    const type = sanitizeSourceDetailType(chunk.sourceDetailType);
    if (grouped.has(type)) return;
    grouped.set(type, {
      type,
      summary: sanitizeString(
        `${getSourceDetailLabelV2(type)}：${chunk.title}，重點是 ${chunk.fieldLabel || '內容重點'}，${buildChunkPreview(chunk, 88)}`,
        180
      )
    });
  });

  return Array.from(grouped.values()).slice(0, 4);
}

function normalizeSourceBreakdown(items = [], fallbackChunks = [], citationIds = []) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => ({
      type: sanitizeSourceDetailType(item?.type || item?.sourceDetailType),
      summary: sanitizeString(item?.summary, 180)
    }))
    .filter((item) => item.summary)
    .slice(0, 4);

  return normalized.length ? normalized : buildSourceBreakdownFromChunksV2(fallbackChunks, citationIds);
}

function sanitizeSectionCitationIds(sectionCitationIds, validIds = []) {
  const allowedIds = new Set(validIds);
  const safeSectionCitationIds = sectionCitationIds && typeof sectionCitationIds === 'object'
    ? sectionCitationIds
    : {};
  const normalized = {};

  REPORT_SECTION_KEYS.forEach((key) => {
    normalized[key] = uniqueItems((Array.isArray(safeSectionCitationIds[key]) ? safeSectionCitationIds[key] : [])
      .map((item) => sanitizeString(item, 120))
      .filter((item) => allowedIds.has(item)))
      .slice(0, MAX_CHUNKS);
  });

  return normalized;
}

function buildDefaultSectionCitationIds(citationIds = []) {
  const ids = uniqueItems(citationIds).slice(0, MAX_CHUNKS);
  return {
    executiveSummary: ids.slice(0, 2),
    recommendedPlan: ids.slice(0, 10),
    detailBreakdown: ids.slice(0, 10),
    decisionAnalysis: ids.slice(0, 6),
    risksAndFallbacks: ids.slice(0, 6),
    topicGroups: ids.slice(0, 12),
    cardHighlights: ids.slice(0, 8),
    sourceComparison: ids.slice(0, 4),
    unansweredQuestions: ids.slice(0, 2)
  };
}

function buildSourceComparisonFromBreakdown(sourceBreakdown = []) {
  return sourceBreakdown.map((item) => {
    const sourceDetailType = sanitizeSourceDetailType(item?.type || item?.sourceDetailType);
    return {
      sourceDetailType,
      stance: sourceDetailType === 'general' ? '綜合判斷' : getSourceDetailLabelV2(sourceDetailType),
      summary: sanitizeString(item?.summary, 220),
      confidenceNote: ''
    };
  }).filter((item) => item.summary).slice(0, 4);
}

function buildCardHighlightsFromChunks(chunks = [], citationIds = []) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const preferredChunks = citationIds.length
    ? citationIds.map((id) => chunkMap.get(id)).filter(Boolean)
    : chunks;
  const fallbackPool = preferredChunks.length ? preferredChunks : chunks;
  const grouped = new Map();

  fallbackPool.forEach((chunk) => {
    const groupKey = chunk.parentId || chunk.id;
    const current = grouped.get(groupKey);
    const previewText = buildChunkPreview(chunk, 150);
    const detailLine = sanitizeString(
      `${chunk.fieldLabel || '重點'}：${previewText}`,
      220
    );

    if (!current) {
      grouped.set(groupKey, {
        title: sanitizeString(chunk.title, 160),
        sourceType: sanitizeSourceType(chunk.sourceType),
        sourceDetailType: sanitizeSourceDetailType(chunk.sourceDetailType),
        whyRelevant: sanitizeString(
          [
            `${getSourceTypeLabelV2(chunk.sourceType)}資料`,
            chunk.locationLabel ? `對應 ${chunk.locationLabel}` : '',
            chunk.timeHint ? `補充 ${chunk.timeHint}` : '',
            chunk.bestTimeHint ? `補充 ${chunk.bestTimeHint}` : '',
            chunk.evidenceRole ? `聚焦 ${chunk.evidenceRole}` : ''
          ].filter(Boolean).join('，'),
          180
        ),
        detailBullets: detailLine ? [detailLine] : [],
        citationIds: chunk.id ? [chunk.id] : []
      });
      return;
    }

    if (detailLine && current.detailBullets.length < 4 && !current.detailBullets.includes(detailLine)) {
      current.detailBullets.push(detailLine);
    }
    if (chunk.id && current.citationIds.length < MAX_CHUNKS && !current.citationIds.includes(chunk.id)) {
      current.citationIds.push(chunk.id);
    }
  });

  if (grouped.size < 4) {
    chunks.forEach((chunk) => {
      if (grouped.size >= 8) return;
      const groupKey = chunk.parentId || chunk.id;
      if (grouped.has(groupKey)) return;
      grouped.set(groupKey, {
        title: sanitizeString(chunk.title, 160),
        sourceType: sanitizeSourceType(chunk.sourceType),
        sourceDetailType: sanitizeSourceDetailType(chunk.sourceDetailType),
        whyRelevant: sanitizeString(
          `${getSourceTypeLabelV2(chunk.sourceType)}資料補充 ${chunk.fieldLabel || '細節'}，方便快速掃讀重點。`,
          180
        ),
        detailBullets: sanitizeTextArray([
          `${chunk.fieldLabel || '重點'}：${buildChunkPreview(chunk, 150)}`
        ], 4, 220),
        citationIds: chunk.id ? [chunk.id] : []
      });
    });
  }

  return Array.from(grouped.values())
    .map((item) => ({
      title: sanitizeString(item.title, 160),
      sourceType: sanitizeSourceType(item.sourceType),
      sourceDetailType: sanitizeSourceDetailType(item.sourceDetailType),
      whyRelevant: sanitizeString(item.whyRelevant, 180),
      detailBullets: sanitizeTextArray(item.detailBullets, 4, 220),
      citationIds: uniqueItems(item.citationIds.map((id) => sanitizeString(id, 120))).slice(0, MAX_CHUNKS)
    }))
    .filter((item) => item.title && item.detailBullets.length)
    .slice(0, 8);
}

function inferTopicGroupEntityType(chunk) {
  if (!chunk) return 'mixed';
  if (chunk.sourceType === 'deck') return 'facility';
  if (chunk.sourceType === 'show') return 'show';
  if (chunk.sourceType === 'schedule') return 'schedule';
  if (chunk.sourceType === 'playbook') {
    return chunk.sourceDetailType === 'general' ? 'playbook' : 'service';
  }
  return 'mixed';
}

function getTopicGroupKind(chunk) {
  return ['action', 'desc', 'summary', 'theme', 'parent'].includes(chunk?.fieldType || 'parent')
    ? 'core'
    : 'extension';
}

function buildTopicGroupsFromChunks(chunks = [], citationIds = []) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const preferredChunks = citationIds.length
    ? citationIds.map((id) => chunkMap.get(id)).filter(Boolean)
    : chunks;
  const fallbackPool = preferredChunks.length ? preferredChunks : chunks;
  const grouped = new Map();

  fallbackPool.forEach((chunk) => {
    const groupKey = chunk.parentId || chunk.id;
    const current = grouped.get(groupKey);
    const detailLine = sanitizeString(
      `${chunk.fieldLabel || '重點'}：${buildChunkPreview(chunk, 220)}`,
      260
    );

    if (!current) {
      grouped.set(groupKey, {
        groupTitle: sanitizeString(chunk.title, 160),
        groupKind: getTopicGroupKind(chunk),
        entityType: inferTopicGroupEntityType(chunk),
        summary: sanitizeString(
          [
            chunk.timeHint ? `時段：${chunk.timeHint}` : '',
            chunk.bestTimeHint ? `最佳時機：${chunk.bestTimeHint}` : '',
            chunk.locationLabel ? `位置：${chunk.locationLabel}` : ''
          ].filter(Boolean).join(' · '),
          220
        ),
        detailItems: detailLine ? [detailLine] : [],
        sourceMix: [sanitizeSourceDetailType(chunk.sourceDetailType)],
        citationIds: chunk.id ? [chunk.id] : []
      });
      return;
    }

    if (detailLine && current.detailItems.length < 12 && !current.detailItems.includes(detailLine)) {
      current.detailItems.push(detailLine);
    }
    const safeSourceDetailType = sanitizeSourceDetailType(chunk.sourceDetailType);
    if (!current.sourceMix.includes(safeSourceDetailType) && current.sourceMix.length < 4) {
      current.sourceMix.push(safeSourceDetailType);
    }
    if (chunk.id && current.citationIds.length < MAX_CHUNKS && !current.citationIds.includes(chunk.id)) {
      current.citationIds.push(chunk.id);
    }
  });

  return Array.from(grouped.values())
    .map((item) => ({
      groupTitle: sanitizeString(item.groupTitle, 160),
      groupKind: item.groupKind === 'extension' ? 'extension' : 'core',
      entityType: sanitizeString(item.entityType, 24).toLowerCase() || 'mixed',
      summary: sanitizeString(item.summary, 220),
      detailItems: sanitizeTextArray(item.detailItems, 12, 260),
      sourceMix: uniqueItems((Array.isArray(item.sourceMix) ? item.sourceMix : [])
        .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
        .slice(0, 4),
      citationIds: uniqueItems((Array.isArray(item.citationIds) ? item.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120)))
        .slice(0, MAX_CHUNKS)
    }))
    .filter((item) => item.groupTitle && item.detailItems.length)
    .slice(0, 12);
}

function buildFallbackReport({
  answer = '',
  sections = {},
  sourceBreakdown = [],
  citationIds = [],
  followUpHint = '',
  missingReason = '',
  chunks = []
} = {}) {
  const directAnswer = sanitizeString(sections.directAnswer || answer, 240);
  const topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  return {
    headline: sanitizeString(directAnswer || '站內攻略整合報告', 120),
    executiveSummary: sanitizeTextArray([directAnswer, ...(sections.whyThisWorks || [])], 4, 240),
    recommendedPlan: sanitizeTextArray(sections.recommendedSteps, 12, 240),
    detailBreakdown: sanitizeTextArray(
      chunks.slice(0, 6).map((chunk) => `${chunk.title}：${buildChunkPreview(chunk, 120)}`),
      6,
      220
    ),
    decisionAnalysis: sanitizeTextArray(sections.whyThisWorks, 5, 220),
    risksAndFallbacks: sanitizeTextArray(sections.watchOuts, 5, 220),
    cardHighlights: buildCardHighlightsFromChunks(chunks, citationIds),
    sourceComparison: buildSourceComparisonFromBreakdown(sourceBreakdown),
    unansweredQuestions: sanitizeTextArray([missingReason, followUpHint].filter(Boolean), 4, 180),
    sectionCitationIds: buildDefaultSectionCitationIds(citationIds)
  };
}

function normalizeReportObject(report, citationIds, chunks, answer, sections, sourceBreakdown, followUpHint, missingReason) {
  const safeReport = report && typeof report === 'object' ? report : {};
  const normalized = {
    headline: sanitizeString(safeReport.headline, 120),
    executiveSummary: sanitizeTextArray(safeReport.executiveSummary, 3, 220),
    recommendedPlan: sanitizeTextArray(safeReport.recommendedPlan, 8, 220),
    detailBreakdown: sanitizeTextArray(safeReport.detailBreakdown, 8, 220),
    decisionAnalysis: sanitizeTextArray(safeReport.decisionAnalysis, 5, 220),
    risksAndFallbacks: sanitizeTextArray(safeReport.risksAndFallbacks, 5, 220),
    cardHighlights: (Array.isArray(safeReport.cardHighlights) ? safeReport.cardHighlights : [])
      .map((item) => ({
        title: sanitizeString(item?.title, 160),
        sourceType: sanitizeSourceType(item?.sourceType),
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType),
        whyRelevant: sanitizeString(item?.whyRelevant, 180),
        detailBullets: sanitizeTextArray(item?.detailBullets, 4, 220),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.title && item.detailBullets.length)
      .slice(0, 8),
    sourceComparison: (Array.isArray(safeReport.sourceComparison) ? safeReport.sourceComparison : [])
      .map((item) => ({
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType || item?.type),
        stance: sanitizeString(item?.stance, 80),
        summary: sanitizeString(item?.summary, 220),
        confidenceNote: sanitizeString(item?.confidenceNote, 120)
      }))
      .filter((item) => item.summary)
      .slice(0, 4),
    unansweredQuestions: sanitizeTextArray(safeReport.unansweredQuestions, 4, 180),
    sectionCitationIds: sanitizeSectionCitationIds(safeReport.sectionCitationIds, citationIds)
  };

  normalized.executiveSummary = sanitizeTextArray(
    normalized.executiveSummary.length ? normalized.executiveSummary : safeReport.executiveSummary,
    4,
    240
  );
  normalized.recommendedPlan = sanitizeTextArray(
    normalized.recommendedPlan.length ? normalized.recommendedPlan : safeReport.recommendedPlan,
    12,
    240
  );
  normalized.detailBreakdown = sanitizeTextArray(
    normalized.detailBreakdown.length ? normalized.detailBreakdown : safeReport.detailBreakdown,
    20,
    260
  );
  normalized.decisionAnalysis = sanitizeTextArray(
    normalized.decisionAnalysis.length ? normalized.decisionAnalysis : safeReport.decisionAnalysis,
    8,
    240
  );
  normalized.risksAndFallbacks = sanitizeTextArray(
    normalized.risksAndFallbacks.length ? normalized.risksAndFallbacks : safeReport.risksAndFallbacks,
    10,
    240
  );
  normalized.topicGroups = (Array.isArray(safeReport.topicGroups) ? safeReport.topicGroups : [])
    .map((item) => ({
      groupTitle: sanitizeString(item?.groupTitle, 160),
      groupKind: item?.groupKind === 'extension' ? 'extension' : 'core',
      entityType: sanitizeString(item?.entityType, 24).toLowerCase() || 'mixed',
      summary: sanitizeString(item?.summary, 220),
      detailItems: sanitizeTextArray(item?.detailItems, 12, 260),
      sourceMix: uniqueItems((Array.isArray(item?.sourceMix) ? item.sourceMix : [])
        .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
        .slice(0, 4),
      citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120))
        .filter((citationId) => citationIds.includes(citationId)))
        .slice(0, MAX_CHUNKS)
    }))
    .filter((item) => item.groupTitle && item.detailItems.length)
    .slice(0, 20);

  if (!normalized.headline) {
    normalized.headline = sanitizeString(answer || sections.directAnswer || '站內攻略整合報告', 120);
  }
  if (!normalized.executiveSummary.length) {
    normalized.executiveSummary = sanitizeTextArray([sections.directAnswer || answer, ...(sections.whyThisWorks || [])], 4, 240);
  }
  if (!normalized.recommendedPlan.length) {
    normalized.recommendedPlan = sanitizeTextArray(sections.recommendedSteps, 12, 240);
  }
  if (!normalized.detailBreakdown.length) {
    normalized.detailBreakdown = sanitizeTextArray(
      chunks.slice(0, 6).map((chunk) => `${chunk.title}：${buildChunkPreview(chunk, 120)}`),
      6,
      220
    );
  }
  if (!normalized.decisionAnalysis.length) {
    normalized.decisionAnalysis = sanitizeTextArray(sections.whyThisWorks, 8, 240);
  }
  if (!normalized.risksAndFallbacks.length) {
    normalized.risksAndFallbacks = sanitizeTextArray(sections.watchOuts, 10, 240);
  }
  if (!normalized.topicGroups.length) {
    normalized.topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  }
  if (!normalized.cardHighlights.length) {
    normalized.cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  }
  if (!normalized.sourceComparison.length) {
    normalized.sourceComparison = buildSourceComparisonFromBreakdown(sourceBreakdown);
  }
  if (!normalized.unansweredQuestions.length && (missingReason || followUpHint)) {
    normalized.unansweredQuestions = sanitizeTextArray([missingReason, followUpHint], 4, 180);
  }
  if (!Object.values(normalized.sectionCitationIds).some((items) => items.length)) {
    normalized.sectionCitationIds = buildDefaultSectionCitationIds(citationIds);
  }

  const hasCoreContent = normalized.executiveSummary.length
    || normalized.recommendedPlan.length
    || normalized.detailBreakdown.length
    || normalized.decisionAnalysis.length
    || normalized.risksAndFallbacks.length
    || normalized.topicGroups.length
    || normalized.cardHighlights.length;

  if (!hasCoreContent) {
    return buildFallbackReport({
      answer,
      sections,
      sourceBreakdown,
      citationIds,
      followUpHint,
      missingReason,
      chunks
    });
  }

  return normalized;
}

function sanitizeAnalysisPlanOverride(plan, responseMode = 'compact') {
  const safePlan = plan && typeof plan === 'object' ? plan : {};
  const facetSummary = safePlan.facetSummary && typeof safePlan.facetSummary === 'object'
    ? safePlan.facetSummary
    : {};
  const evidenceSummary = safePlan.evidenceSummary && typeof safePlan.evidenceSummary === 'object'
    ? safePlan.evidenceSummary
    : {};
  const evidenceLayers = safePlan.evidenceLayers && typeof safePlan.evidenceLayers === 'object'
    ? safePlan.evidenceLayers
    : {};

  return {
    responseMode: sanitizeResponseMode(safePlan.responseMode || responseMode),
    intentType: sanitizeString(safePlan.intentType, 40).toLowerCase() || 'operational-detail',
    inventoryIntent: Boolean(safePlan.inventoryIntent),
    visibleInventoryMode: Boolean(safePlan.visibleInventoryMode),
    coverageMode: sanitizeString(safePlan.coverageMode, 24).toLowerCase() === 'exhaustive' ? 'exhaustive' : 'standard',
    breadthProfile: sanitizeString(safePlan.breadthProfile, 40) || 'guided-expansion',
    breadthSignals: sanitizeTextArray(safePlan.breadthSignals, 6, 60),
    facilityBreadthMode: Boolean(safePlan.facilityBreadthMode),
    expansionReasons: sanitizeTextArray(safePlan.expansionReasons, 12, 120),
    activeFacetNames: sanitizeTextArray(safePlan.activeFacetNames, 6, 40),
    activeFacetCount: clampNumber(safePlan.activeFacetCount, 0, 6, 0),
    triggerReasons: sanitizeTextArray(safePlan.triggerReasons, 8, 80),
    isComparisonQuery: Boolean(safePlan.isComparisonQuery),
    hasRiskJudgment: Boolean(safePlan.hasRiskJudgment),
    needsSourceComparison: Boolean(safePlan.needsSourceComparison),
    rewriteTriggered: Boolean(safePlan.rewriteTriggered),
    evidenceBudget: clampNumber(
      safePlan.evidenceBudget,
      2,
      MAX_CHUNKS,
      responseMode === 'report' ? MAX_CHUNKS : COMPACT_MAX_CHUNKS
    ),
    maxParentCards: clampNumber(safePlan.maxParentCards, 1, MAX_PARENT_BRIEFS, responseMode === 'report' ? MAX_PARENT_BRIEFS : 4),
    hardAnchors: sanitizeTextArray(safePlan.hardAnchors, 16, 80),
    softModifiers: sanitizeTextArray(safePlan.softModifiers, 16, 80),
    subjectClusters: sanitizeTextArray(safePlan.subjectClusters, 18, 80),
    facetSummary: {
      goal: sanitizeTextArray(facetSummary.goal, 8, 80),
      time: sanitizeTextArray(facetSummary.time, 8, 80),
      entityPlace: sanitizeTextArray(facetSummary.entityPlace, 12, 80),
      audience: sanitizeTextArray(facetSummary.audience, 8, 80),
      risk: sanitizeTextArray(facetSummary.risk, 8, 80),
      alternatives: sanitizeTextArray(facetSummary.alternatives, 8, 80)
    },
    evidenceLayers: {
      core: sanitizeTextArray(evidenceLayers.core, 12, 80),
      extension: sanitizeTextArray(evidenceLayers.extension, 16, 80),
      rulesLimits: sanitizeTextArray(evidenceLayers.rulesLimits, 12, 80),
      timingContext: sanitizeTextArray(evidenceLayers.timingContext, 10, 80),
      sourceContrast: sanitizeTextArray(evidenceLayers.sourceContrast, 10, 80)
    },
    evidenceSummary: {
      selectedChunkCount: clampNumber(evidenceSummary.selectedChunkCount, 0, MAX_CHUNKS, 0),
      parentCardCount: clampNumber(evidenceSummary.parentCardCount, 0, MAX_PARENT_BRIEFS, 0),
      sourceTypes: sanitizeTextArray(evidenceSummary.sourceTypes, 6, 32).map(sanitizeSourceType),
      sourceDetailTypes: sanitizeTextArray(evidenceSummary.sourceDetailTypes, 4, 32).map(sanitizeSourceDetailType)
    },
    literalAnchors: sanitizeTextArray(safePlan.literalAnchors, 12, 80),
    canonicalEntities: sanitizeTextArray(safePlan.canonicalEntities, 10, 80),
    genericClasses: sanitizeTextArray(safePlan.genericClasses, 8, 80),
    expandedCategories: sanitizeTextArray(safePlan.expandedCategories, 12, 80),
    clusterExpansions: sanitizeTextArray(safePlan.clusterExpansions, 16, 80),
    coverageHints: sanitizeTextArray(safePlan.coverageHints, 8, 32),
    preferredClusters: sanitizeTextArray(safePlan.preferredClusters, 10, 80),
    mustCoverCategories: sanitizeTextArray(safePlan.mustCoverCategories, 12, 80),
    categoryCoveragePlan: (Array.isArray(safePlan.categoryCoveragePlan) ? safePlan.categoryCoveragePlan : [])
      .map((item) => ({
        categoryId: sanitizeString(item?.categoryId, 80),
        label: sanitizeString(item?.label, 80),
        parentCount: clampNumber(item?.parentCount, 0, MAX_PARENT_BRIEFS, 0),
        sourceMix: sanitizeTextArray(item?.sourceMix, 4, 24).map(sanitizeSourceDetailType),
        detailHints: sanitizeTextArray(item?.detailHints, 8, 120)
      }))
      .filter((item) => item.categoryId || item.label)
      .slice(0, 16)
  };
}

function getSourceDetailLabelOverride(sourceDetailType) {
  const labels = {
    official: '官方規則',
    concierge: '禮賓加值',
    community: '社群心得',
    general: '一般整理'
  };
  return labels[sourceDetailType] || '一般整理';
}

function getSourceTypeLabelOverride(sourceType) {
  const labels = {
    schedule: '行程',
    deck: '設施 / 區域',
    show: '表演 / 娛樂',
    playbook: '攻略',
    static: '站內整理'
  };
  return labels[sourceType] || '站內整理';
}

function buildChunkPreviewOverride(chunk, maxLength = 96) {
  const text = sanitizeString(chunk?.structuredText || chunk?.text, Math.max(maxLength * 2, maxLength));
  if (!text) return '';
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1).trim()}…`
    : text;
}

function getSourceDetailLabelV2Override(sourceDetailType) {
  return getSourceDetailLabel(sourceDetailType);
}

function getSourceTypeLabelV2Override(sourceType) {
  return getSourceTypeLabel(sourceType);
}

function buildSourceBreakdownFromChunksOverride(chunks, citationIds = []) {
  const chunkPool = citationIds.length
    ? citationIds.map((id) => chunks.find((chunk) => chunk.id === id)).filter(Boolean)
    : chunks;
  const grouped = new Map();

  chunkPool.forEach((chunk) => {
    const type = sanitizeSourceDetailType(chunk?.sourceDetailType);
    if (!type || grouped.has(type)) return;

    const fieldLabel = sanitizeString(chunk?.fieldLabel || '重點', 32);
    const preview = buildChunkPreview(chunk, 88);
    grouped.set(type, {
      type,
      summary: sanitizeString(
        `${sanitizeString(chunk?.title, 96)}：${fieldLabel}${preview ? `，${preview}` : ''}`,
        220
      )
    });
  });

  return Array.from(grouped.values()).slice(0, 6);
}

function buildDefaultSectionCitationIdsOverride(citationIds = []) {
  const ids = uniqueItems(citationIds).slice(0, MAX_CHUNKS);
  return {
    executiveSummary: ids.slice(0, 3),
    recommendedPlan: ids.slice(0, 12),
    fullCardInventory: ids.slice(0, 18),
    topicAppendix: ids.slice(0, 18),
    detailBreakdown: ids.slice(0, 12),
    decisionAnalysis: ids.slice(0, 8),
    risksAndFallbacks: ids.slice(0, 8),
    topicGroups: ids.slice(0, 16),
    cardHighlights: ids.slice(0, 10),
    sourceComparison: ids.slice(0, 6),
    unansweredQuestions: ids.slice(0, 4)
  };
}

function buildSourceComparisonFromBreakdownOverride(sourceBreakdown = []) {
  return sourceBreakdown
    .map((item) => {
      const sourceDetailType = sanitizeSourceDetailType(item?.type || item?.sourceDetailType);
      return {
        sourceDetailType,
        stance: sourceDetailType === 'general' ? '綜合整理' : getSourceDetailLabelV2(sourceDetailType),
        summary: sanitizeString(item?.summary, 220),
        confidenceNote: sanitizeString(item?.confidenceNote, 120)
      };
    })
    .filter((item) => item.summary)
    .slice(0, 6);
}

function buildCardHighlightsFromChunksOverride(chunks = [], citationIds = []) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const preferredChunks = citationIds.length
    ? citationIds.map((id) => chunkMap.get(id)).filter(Boolean)
    : chunks;
  const orderedPool = [
    ...preferredChunks,
    ...chunks.filter((chunk) => !preferredChunks.some((item) => item?.id === chunk?.id))
  ];
  const grouped = new Map();

  function buildWhyRelevant(chunk) {
    return sanitizeString(
      [
        getSourceTypeLabelV2(chunk.sourceType),
        getSourceDetailLabelV2(chunk.sourceDetailType),
        chunk.locationLabel ? `位置 ${sanitizeString(chunk.locationLabel, 48)}` : '',
        chunk.timeHint ? `時間 ${sanitizeString(chunk.timeHint, 48)}` : '',
        chunk.bestTimeHint ? `最佳時機 ${sanitizeString(chunk.bestTimeHint, 48)}` : '',
        chunk.evidenceRole ? `用途 ${sanitizeString(chunk.evidenceRole, 48)}` : ''
      ].filter(Boolean).join(' · '),
      180
    );
  }

  function addChunk(chunk) {
    if (!chunk) return;
    const groupKey = chunk.parentId || chunk.id;
    const current = grouped.get(groupKey);
    const fieldLabel = sanitizeString(chunk.fieldLabel || '重點', 32);
    const previewText = buildChunkPreview(chunk, 150);
    const detailLine = sanitizeString(
      `${fieldLabel}${previewText ? `：${previewText}` : ''}`,
      220
    );

    if (!current) {
      if (grouped.size >= 8) return;
      grouped.set(groupKey, {
        title: sanitizeString(chunk.title, 160),
        sourceType: sanitizeSourceType(chunk.sourceType),
        sourceDetailType: sanitizeSourceDetailType(chunk.sourceDetailType),
        whyRelevant: buildWhyRelevant(chunk),
        detailBullets: detailLine ? [detailLine] : [],
        citationIds: chunk.id ? [chunk.id] : []
      });
      return;
    }

    if (detailLine && current.detailBullets.length < 4 && !current.detailBullets.includes(detailLine)) {
      current.detailBullets.push(detailLine);
    }
    if (chunk.id && current.citationIds.length < MAX_CHUNKS && !current.citationIds.includes(chunk.id)) {
      current.citationIds.push(chunk.id);
    }
  }

  orderedPool.forEach(addChunk);

  return Array.from(grouped.values())
    .map((item) => ({
      title: sanitizeString(item.title, 160),
      sourceType: sanitizeSourceType(item.sourceType),
      sourceDetailType: sanitizeSourceDetailType(item.sourceDetailType),
      whyRelevant: sanitizeString(item.whyRelevant, 180),
      detailBullets: sanitizeTextArray(item.detailBullets, 4, 220),
      citationIds: uniqueItems((Array.isArray(item.citationIds) ? item.citationIds : [])
        .map((id) => sanitizeString(id, 120)))
        .slice(0, MAX_CHUNKS)
    }))
    .filter((item) => item.title && item.detailBullets.length)
    .slice(0, 8);
}

function inferTopicGroupEntityTypeOverride(chunk) {
  if (!chunk) return 'mixed';
  if (chunk.sourceType === 'deck') return 'facility';
  if (chunk.sourceType === 'show') return 'show';
  if (chunk.sourceType === 'schedule') return 'schedule';
  if (chunk.sourceType === 'playbook') {
    return chunk.sourceDetailType === 'general' ? 'playbook' : 'service';
  }
  return 'mixed';
}

function getTopicGroupKindOverride(chunk) {
  return ['action', 'desc', 'summary', 'theme', 'parent'].includes(chunk?.fieldType || 'parent')
    ? 'core'
    : 'extension';
}

function buildTopicGroupsFromChunksOverride(chunks = [], citationIds = []) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const preferredChunks = citationIds.length
    ? citationIds.map((id) => chunkMap.get(id)).filter(Boolean)
    : chunks;
  const orderedPool = [
    ...preferredChunks,
    ...chunks.filter((chunk) => !preferredChunks.some((item) => item?.id === chunk?.id))
  ];
  const grouped = new Map();

  function addChunk(chunk) {
    if (!chunk) return;
    const groupKey = chunk.parentId || chunk.id;
    const current = grouped.get(groupKey);
    const fieldLabel = sanitizeString(chunk.fieldLabel || '重點', 32);
    const preview = buildChunkPreview(chunk, 220);
    const detailLine = sanitizeString(
      `${fieldLabel}${preview ? `：${preview}` : ''}`,
      260
    );
    const summaryParts = [
      chunk.timeHint ? `時間 ${sanitizeString(chunk.timeHint, 48)}` : '',
      chunk.bestTimeHint ? `最佳時機 ${sanitizeString(chunk.bestTimeHint, 48)}` : '',
      chunk.locationLabel ? `位置 ${sanitizeString(chunk.locationLabel, 48)}` : ''
    ].filter(Boolean);

    if (!current) {
      if (grouped.size >= 20) return;
      grouped.set(groupKey, {
        groupTitle: sanitizeString(chunk.title, 160),
        groupKind: getTopicGroupKind(chunk),
        entityType: inferTopicGroupEntityType(chunk),
        summary: sanitizeString(summaryParts.join(' · '), 220),
        detailItems: detailLine ? [detailLine] : [],
        sourceMix: [sanitizeSourceDetailType(chunk.sourceDetailType)],
        citationIds: chunk.id ? [chunk.id] : []
      });
      return;
    }

    if (detailLine && current.detailItems.length < 12 && !current.detailItems.includes(detailLine)) {
      current.detailItems.push(detailLine);
    }
    if (current.groupKind !== 'core' && getTopicGroupKind(chunk) === 'core') {
      current.groupKind = 'core';
    }
    const safeSourceDetailType = sanitizeSourceDetailType(chunk.sourceDetailType);
    if (!current.sourceMix.includes(safeSourceDetailType) && current.sourceMix.length < 4) {
      current.sourceMix.push(safeSourceDetailType);
    }
    if (chunk.id && current.citationIds.length < MAX_CHUNKS && !current.citationIds.includes(chunk.id)) {
      current.citationIds.push(chunk.id);
    }
    if (!current.summary && summaryParts.length) {
      current.summary = sanitizeString(summaryParts.join(' · '), 220);
    }
  }

  orderedPool.forEach(addChunk);

  return Array.from(grouped.values())
    .map((item) => ({
      groupTitle: sanitizeString(item.groupTitle, 160),
      groupKind: item.groupKind === 'extension' ? 'extension' : 'core',
      entityType: sanitizeString(item.entityType, 24).toLowerCase() || 'mixed',
      summary: sanitizeString(item.summary, 220),
      detailItems: sanitizeTextArray(item.detailItems, 12, 260),
      sourceMix: uniqueItems((Array.isArray(item.sourceMix) ? item.sourceMix : [])
        .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
        .slice(0, 4),
      citationIds: uniqueItems((Array.isArray(item.citationIds) ? item.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120)))
        .slice(0, MAX_CHUNKS)
    }))
    .filter((item) => item.groupTitle && item.detailItems.length)
    .slice(0, 20);
}

function buildFallbackReportOverride({
  answer = '',
  sections = {},
  sourceBreakdown = [],
  citationIds = [],
  followUpHint = '',
  missingReason = '',
  chunks = []
} = {}) {
  const directAnswer = sanitizeString(sections.directAnswer || answer, 320);
  const topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  const cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  const derivedGroupDetails = topicGroups.flatMap((group) =>
    group.detailItems.map((item) => `${group.groupTitle}：${item}`)
  );
  const derivedRiskItems = chunks
    .filter((chunk) => ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(chunk.fieldType))
    .map((chunk) => `${sanitizeString(chunk.title, 120)}：${buildChunkPreview(chunk, 180)}`);

  return {
    headline: sanitizeString(directAnswer || '站內攻略整理', 120),
    executiveSummary: sanitizeTextArray(
      [directAnswer, ...(sections.whyThisWorks || []), ...derivedGroupDetails.slice(0, 2)],
      4,
      240
    ),
    recommendedPlan: sanitizeTextArray(
      [...(sections.recommendedSteps || []), ...derivedGroupDetails],
      12,
      240
    ),
    detailBreakdown: sanitizeTextArray(
      [...(sections.detailBreakdown || []), ...derivedGroupDetails],
      20,
      260
    ),
    decisionAnalysis: sanitizeTextArray(
      [...(sections.whyThisWorks || []), ...topicGroups.slice(0, 4).map((group) => `${group.groupTitle}：${group.summary || '有對應細節可展開'}`)],
      8,
      240
    ),
    risksAndFallbacks: sanitizeTextArray(
      [...(sections.watchOuts || []), ...derivedRiskItems],
      10,
      240
    ),
    topicGroups,
    cardHighlights,
    sourceComparison: buildSourceComparisonFromBreakdown(sourceBreakdown),
    unansweredQuestions: sanitizeTextArray([missingReason, followUpHint].filter(Boolean), 4, 180),
    sectionCitationIds: buildDefaultSectionCitationIds(citationIds)
  };
}

function normalizeReportObjectOverride(report, citationIds, chunks, answer, sections, sourceBreakdown, followUpHint, missingReason) {
  const safeReport = report && typeof report === 'object' ? report : {};
  const normalized = {
    headline: sanitizeString(safeReport.headline, 120),
    executiveSummary: sanitizeTextArray(safeReport.executiveSummary, 4, 240),
    recommendedPlan: sanitizeTextArray(safeReport.recommendedPlan, 12, 240),
    detailBreakdown: sanitizeTextArray(safeReport.detailBreakdown, 20, 260),
    decisionAnalysis: sanitizeTextArray(safeReport.decisionAnalysis, 8, 240),
    risksAndFallbacks: sanitizeTextArray(safeReport.risksAndFallbacks, 10, 240),
    cardHighlights: (Array.isArray(safeReport.cardHighlights) ? safeReport.cardHighlights : [])
      .map((item) => ({
        title: sanitizeString(item?.title, 160),
        sourceType: sanitizeSourceType(item?.sourceType),
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType),
        whyRelevant: sanitizeString(item?.whyRelevant, 180),
        detailBullets: sanitizeTextArray(item?.detailBullets, 4, 220),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.title && item.detailBullets.length)
      .slice(0, 8),
    topicGroups: (Array.isArray(safeReport.topicGroups) ? safeReport.topicGroups : [])
      .map((item) => ({
        groupTitle: sanitizeString(item?.groupTitle, 160),
        groupKind: item?.groupKind === 'extension' ? 'extension' : 'core',
        entityType: sanitizeString(item?.entityType, 24).toLowerCase() || 'mixed',
        summary: sanitizeString(item?.summary, 220),
        detailItems: sanitizeTextArray(item?.detailItems, 12, 260),
        sourceMix: uniqueItems((Array.isArray(item?.sourceMix) ? item.sourceMix : [])
          .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
          .slice(0, 4),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.groupTitle && item.detailItems.length)
      .slice(0, 20),
    sourceComparison: (Array.isArray(safeReport.sourceComparison) ? safeReport.sourceComparison : [])
      .map((item) => ({
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType || item?.type),
        stance: sanitizeString(item?.stance, 80),
        summary: sanitizeString(item?.summary, 220),
        confidenceNote: sanitizeString(item?.confidenceNote, 120)
      }))
      .filter((item) => item.summary)
      .slice(0, 6),
    unansweredQuestions: sanitizeTextArray(safeReport.unansweredQuestions, 4, 180),
    sectionCitationIds: sanitizeSectionCitationIds(safeReport.sectionCitationIds, citationIds)
  };

  if (!normalized.headline) {
    normalized.headline = sanitizeString(answer || sections.directAnswer || '站內攻略整理', 120);
  }
  if (!normalized.topicGroups.length) {
    normalized.topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  }
  if (!normalized.cardHighlights.length) {
    normalized.cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  }
  if (!normalized.sourceComparison.length) {
    normalized.sourceComparison = buildSourceComparisonFromBreakdown(sourceBreakdown);
  }

  const derivedGroupDetails = normalized.topicGroups.flatMap((group) =>
    group.detailItems.map((item) => `${group.groupTitle}：${item}`)
  );
  const derivedCorePlan = normalized.topicGroups
    .filter((group) => group.groupKind === 'core')
    .flatMap((group) => group.detailItems.slice(0, 2).map((item) => `${group.groupTitle}：${item}`));
  const derivedRiskItems = chunks
    .filter((chunk) => ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(chunk.fieldType))
    .map((chunk) => `${sanitizeString(chunk.title, 120)}：${buildChunkPreview(chunk, 180)}`);

  if (!normalized.executiveSummary.length) {
    normalized.executiveSummary = sanitizeTextArray(
      [sections.directAnswer || answer, ...(sections.whyThisWorks || []), ...derivedCorePlan.slice(0, 2)],
      4,
      240
    );
  }
  if (!normalized.recommendedPlan.length) {
    normalized.recommendedPlan = sanitizeTextArray(
      [...(sections.recommendedSteps || []), ...derivedCorePlan, ...derivedGroupDetails],
      12,
      240
    );
  }
  if (!normalized.detailBreakdown.length) {
    normalized.detailBreakdown = sanitizeTextArray(
      [...(sections.detailBreakdown || []), ...derivedGroupDetails],
      20,
      260
    );
  }
  if (!normalized.decisionAnalysis.length) {
    normalized.decisionAnalysis = sanitizeTextArray(
      [...(sections.whyThisWorks || []), ...normalized.topicGroups.slice(0, 6).map((group) => `${group.groupTitle}：${group.summary || '可補充同主題細節'}`)],
      8,
      240
    );
  }
  if (!normalized.risksAndFallbacks.length) {
    normalized.risksAndFallbacks = sanitizeTextArray(
      [...(sections.watchOuts || []), ...derivedRiskItems],
      10,
      240
    );
  }
  if (!normalized.unansweredQuestions.length && (missingReason || followUpHint)) {
    normalized.unansweredQuestions = sanitizeTextArray([missingReason, followUpHint], 4, 180);
  }
  if (!Object.values(normalized.sectionCitationIds).some((items) => items.length)) {
    normalized.sectionCitationIds = buildDefaultSectionCitationIds(citationIds);
  }

  const hasCoreContent = normalized.executiveSummary.length
    || normalized.recommendedPlan.length
    || normalized.detailBreakdown.length
    || normalized.decisionAnalysis.length
    || normalized.risksAndFallbacks.length
    || normalized.topicGroups.length
    || normalized.cardHighlights.length;

  if (!hasCoreContent) {
    return buildFallbackReport({
      answer,
      sections,
      sourceBreakdown,
      citationIds,
      followUpHint,
      missingReason,
      chunks
    });
  }

  return normalized;
}

sanitizeAnalysisPlan = sanitizeAnalysisPlanOverride;
getSourceDetailLabel = getSourceDetailLabelOverride;
getSourceTypeLabel = getSourceTypeLabelOverride;
buildChunkPreview = buildChunkPreviewOverride;
getSourceDetailLabelV2 = getSourceDetailLabelV2Override;
getSourceTypeLabelV2 = getSourceTypeLabelV2Override;
buildSourceBreakdownFromChunks = buildSourceBreakdownFromChunksOverride;
buildDefaultSectionCitationIds = buildDefaultSectionCitationIdsOverride;
buildSourceComparisonFromBreakdown = buildSourceComparisonFromBreakdownOverride;
buildCardHighlightsFromChunks = buildCardHighlightsFromChunksOverride;
inferTopicGroupEntityType = inferTopicGroupEntityTypeOverride;
getTopicGroupKind = getTopicGroupKindOverride;
buildTopicGroupsFromChunks = buildTopicGroupsFromChunksOverride;
buildFallbackReport = buildFallbackReportOverride;
normalizeReportObject = normalizeReportObjectOverride;

const SOURCE_DETAIL_LABELS_ZH = {
  official: '官方規則',
  concierge: '禮賓加值',
  community: '社群實戰',
  general: '站內整理'
};

const SOURCE_TYPE_LABELS_ZH = {
  schedule: '行程',
  deck: '甲板 / 設施',
  show: '表演 / 場館',
  playbook: '攻略本',
  static: '其他資訊'
};

function getReadableSourceDetailLabel(sourceDetailType) {
  return SOURCE_DETAIL_LABELS_ZH[sanitizeSourceDetailType(sourceDetailType)] || SOURCE_DETAIL_LABELS_ZH.general;
}

function getReadableSourceTypeLabel(sourceType) {
  return SOURCE_TYPE_LABELS_ZH[sanitizeSourceType(sourceType)] || SOURCE_TYPE_LABELS_ZH.static;
}

function sanitizeCoverageStats(stats = {}) {
  const safeStats = stats && typeof stats === 'object' ? stats : {};
  const safeSourceCounts = safeStats.sourceCounts && typeof safeStats.sourceCounts === 'object'
    ? safeStats.sourceCounts
    : {};
  const sourceCounts = {};

  Object.entries(safeSourceCounts).forEach(([key, value]) => {
    const normalizedKey = sanitizeSourceDetailType(key);
    sourceCounts[normalizedKey] = clampNumber(value, 0, MAX_CHUNKS, 0);
  });

  return {
    selectedParentCount: clampNumber(safeStats.selectedParentCount, 0, MAX_PARENT_BRIEFS, 0),
    selectedChunkCount: clampNumber(safeStats.selectedChunkCount, 0, MAX_CHUNKS, 0),
    targetParentCount: clampNumber(safeStats.targetParentCount, 0, MAX_PARENT_BRIEFS, 0),
    backfilledParentCount: clampNumber(safeStats.backfilledParentCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleTargetCount: clampNumber(safeStats.visibleTargetCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleRenderedCount: clampNumber(safeStats.visibleRenderedCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleBackfilledCount: clampNumber(safeStats.visibleBackfilledCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleCoverageRatio: clampFraction(safeStats.visibleCoverageRatio, 0),
    coverageRatio: clampFraction(safeStats.coverageRatio, 0),
    sourceCounts,
    primarySubject: sanitizeString(safeStats.primarySubject, 120)
  };
}

function sanitizeCoverageContract(contract = {}) {
  const safeContract = contract && typeof contract === 'object' ? contract : {};
  return {
    mode: ['inventory', 'visible-inventory'].includes(safeContract.mode) ? safeContract.mode : 'standard',
    targetCoverageCount: clampNumber(safeContract.targetCoverageCount, 0, MAX_PARENT_BRIEFS, 0),
    minimumCoverageRatio: clampNumber(safeContract.minimumCoverageRatio, 0, 1, 0),
    mustRenderParentIds: sanitizeTextArray(safeContract.mustRenderParentIds, MAX_PARENT_BRIEFS, 120),
    preferredParentIds: sanitizeTextArray(safeContract.preferredParentIds, MAX_PARENT_BRIEFS, 120),
    visibleParentIds: sanitizeTextArray(safeContract.visibleParentIds, MAX_PARENT_BRIEFS, 120),
    eligibleVisibleParentIds: sanitizeTextArray(safeContract.eligibleVisibleParentIds, MAX_PARENT_BRIEFS, 120),
    mustRenderVisibleParentIds: sanitizeTextArray(safeContract.mustRenderVisibleParentIds, MAX_PARENT_BRIEFS, 120),
    mustRenderDerivedParentIds: sanitizeTextArray(safeContract.mustRenderDerivedParentIds, MAX_PARENT_BRIEFS, 120),
    preferredSupportParentIds: sanitizeTextArray(safeContract.preferredSupportParentIds, MAX_PARENT_BRIEFS, 120),
    targetVisibleCoverageCount: clampNumber(safeContract.targetVisibleCoverageCount, 0, MAX_PARENT_BRIEFS, 0),
    minimumVisibleCoverageRatio: clampNumber(safeContract.minimumVisibleCoverageRatio, 0, 1, 0),
    mustCoverCategories: sanitizeTextArray(safeContract.mustCoverCategories, 12, 80),
    preferredClusters: sanitizeTextArray(safeContract.preferredClusters, 12, 80),
    relevantSourceTypes: sanitizeTextArray(safeContract.relevantSourceTypes, 6, 24).map(sanitizeSourceType),
    coverageReason: sanitizeString(safeContract.coverageReason, 180)
  };
}

function sanitizeParentBriefs(parentBriefs = [], validIds = []) {
  const allowedIds = validIds.length ? new Set(validIds) : null;
  return (Array.isArray(parentBriefs) ? parentBriefs : [])
    .map((item) => ({
      parentId: sanitizeString(item?.parentId, 120),
      title: sanitizeString(item?.title, 160),
      cardType: sanitizeString(item?.cardType, 24).toLowerCase() || 'mixed',
      sourceType: sanitizeSourceType(item?.sourceType),
      groupLabel: sanitizeString(item?.groupLabel, 120),
      sourceLabels: sanitizeTextArray(item?.sourceLabels, 5, 60),
      categoryFamilies: sanitizeTextArray(item?.categoryFamilies, 6, 60),
      capabilityTags: sanitizeTextArray(item?.capabilityTags, 6, 40),
      entityFamilies: sanitizeTextArray(item?.entityFamilies, 6, 60),
      supportOfParentIds: sanitizeTextArray(item?.supportOfParentIds, 8, 120),
      detailBullets: sanitizeTextArray(item?.detailBullets, 10, 260),
      venueKey: sanitizeString(item?.venueKey, 120),
      seriesKey: sanitizeString(item?.seriesKey, 120),
      sourceClusterKey: sanitizeString(item?.sourceClusterKey, 120),
      coverageTier: ['visible', 'derived', 'support'].includes(item?.coverageTier) ? item.coverageTier : 'support',
      renderPriority: clampNumber(item?.renderPriority, 0, MAX_PARENT_BRIEFS, 0),
      citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120))
        .filter((citationId) => !allowedIds || allowedIds.has(citationId)))
        .slice(0, MAX_CHUNKS)
    }))
    .filter((item) => item.parentId && item.title && item.detailBullets.length)
    .slice(0, MAX_PARENT_BRIEFS);
}

function sanitizeCategoryDossiers(categoryDossiers = []) {
  return (Array.isArray(categoryDossiers) ? categoryDossiers : [])
    .map((item) => ({
      categoryId: sanitizeString(item?.categoryId, 80),
      label: sanitizeString(item?.label, 80),
      parentCount: clampNumber(item?.parentCount, 0, MAX_PARENT_BRIEFS, 0),
      sourceMix: sanitizeTextArray(item?.sourceMix, 4, 24).map(sanitizeSourceDetailType),
      detailHints: sanitizeTextArray(item?.detailHints, 8, 120),
      preferredParentIds: sanitizeTextArray(item?.preferredParentIds, 8, 120)
    }))
    .filter((item) => item.categoryId || item.label)
    .slice(0, 16);
}

function sanitizeCapabilityCoveragePlan(plan = {}) {
  const safePlan = plan && typeof plan === 'object' ? plan : {};
  return {
    requiredCapabilities: sanitizeTextArray(safePlan.requiredCapabilities, 6, 40),
    disallowedCategories: sanitizeTextArray(safePlan.disallowedCategories, 10, 80),
    items: (Array.isArray(safePlan.items) ? safePlan.items : [])
      .map((item) => ({
        capabilityId: sanitizeString(item?.capabilityId, 40),
        label: sanitizeString(item?.label, 80),
        matchedParentIds: sanitizeTextArray(item?.matchedParentIds, 12, 120),
        categoryFamilies: sanitizeTextArray(item?.categoryFamilies, 8, 80),
        disallowedCategories: sanitizeTextArray(item?.disallowedCategories, 8, 80)
      }))
      .filter((item) => item.capabilityId || item.label)
      .slice(0, 8)
  };
}

function sanitizeSectionDossiers(sectionDossiers = []) {
  return (Array.isArray(sectionDossiers) ? sectionDossiers : [])
    .map((section) => ({
      sectionKey: ['schedule', 'deckShow', 'playbook'].includes(sanitizeString(section?.sectionKey, 40))
        ? sanitizeString(section?.sectionKey, 40)
        : 'deckShow',
      sectionTitle: sanitizeString(section?.sectionTitle, 120),
      cards: (Array.isArray(section?.cards) ? section.cards : [])
        .map((card) => ({
          parentId: sanitizeString(card?.parentId, 120),
          title: sanitizeString(card?.title, 160),
          cardType: sanitizeString(card?.cardType, 40),
          sourceLabels: sanitizeTextArray(card?.sourceLabels, 5, 60),
          detailBullets: sanitizeTextArray(card?.detailBullets, 10, 220),
          citationIds: sanitizeTextArray(card?.citationIds, MAX_CHUNKS, 120)
        }))
        .filter((card) => card.parentId && card.title)
        .slice(0, 32)
    }))
    .filter((section) => section.sectionTitle && section.cards.length)
    .slice(0, 3);
}

function sanitizeSectionWritingRules(rules = {}) {
  const safeRules = rules && typeof rules === 'object' ? rules : {};
  return {
    mode: sanitizeString(safeRules.mode, 40) || 'section-first-guide',
    targetParagraphsPerSection: safeRules.targetParagraphsPerSection && typeof safeRules.targetParagraphsPerSection === 'object'
      ? {
          schedule: sanitizeTextArray(safeRules.targetParagraphsPerSection.schedule, 2, 4),
          deckShow: sanitizeTextArray(safeRules.targetParagraphsPerSection.deckShow, 2, 4),
          playbook: sanitizeTextArray(safeRules.targetParagraphsPerSection.playbook, 2, 4)
        }
      : {},
    priorities: safeRules.priorities && typeof safeRules.priorities === 'object'
      ? {
          schedule: sanitizeString(safeRules.priorities.schedule, 220),
          deckShow: sanitizeString(safeRules.priorities.deckShow, 220),
          playbook: sanitizeString(safeRules.priorities.playbook, 220)
        }
      : {},
    dedupeRule: sanitizeString(safeRules.dedupeRule, 220),
    proseStyle: sanitizeString(safeRules.proseStyle, 220)
  };
}

function buildParentBriefLineFromChunk(chunk) {
  if (!chunk) return '';
  const prefix = sanitizeString(chunk.fieldLabel || '內容重點', 36);
  const preview = buildChunkPreview(chunk, ['parent', 'action', 'summary', 'theme', 'desc'].includes(chunk.fieldType || 'parent') ? 240 : 180);
  const line = `${prefix}：${preview}`.replace(/\s+/g, ' ').trim();
  return sanitizeString(line, 260);
}

function deriveParentBriefsFromChunks(chunks = []) {
  const grouped = new Map();
  chunks.forEach((chunk) => {
    const parentId = sanitizeString(chunk?.parentId || chunk?.id, 120);
    if (!parentId) return;
    const current = grouped.get(parentId);
    const sourceLabels = uniqueItems([
      getReadableSourceTypeLabel(chunk?.sourceType),
      getReadableSourceDetailLabel(chunk?.sourceDetailType)
    ]);
    const detailLine = buildParentBriefLineFromChunk(chunk);

    if (!current) {
      grouped.set(parentId, {
        parentId,
        title: sanitizeString(chunk?.title, 160),
        cardType: inferTopicGroupEntityType(chunk),
        groupLabel: sanitizeString(chunk?.locationLabel || getReadableSourceTypeLabel(chunk?.sourceType), 120),
        sourceLabels,
        detailBullets: detailLine ? [detailLine] : [],
        citationIds: chunk?.id ? [sanitizeString(chunk.id, 120)] : []
      });
      return;
    }

    sourceLabels.forEach((label) => {
      if (current.sourceLabels.length < 5 && !current.sourceLabels.includes(label)) {
        current.sourceLabels.push(label);
      }
    });
    if (detailLine && current.detailBullets.length < 10 && !current.detailBullets.includes(detailLine)) {
      current.detailBullets.push(detailLine);
    }
    if (chunk?.id && current.citationIds.length < MAX_CHUNKS) {
      const citationId = sanitizeString(chunk.id, 120);
      if (citationId && !current.citationIds.includes(citationId)) {
        current.citationIds.push(citationId);
      }
    }
  });

  return Array.from(grouped.values())
    .filter((item) => item.parentId && item.title && item.detailBullets.length)
    .slice(0, MAX_PARENT_BRIEFS);
}

function buildFullCardInventoryFromParentBriefs(parentBriefs = [], citationIds = []) {
  const allowedIds = citationIds.length ? new Set(citationIds) : null;
  return sanitizeParentBriefs(parentBriefs, citationIds).map((item) => ({
    parentId: item.parentId,
    title: item.title,
    cardType: item.cardType || 'mixed',
    groupLabel: item.groupLabel,
    sourceLabels: item.sourceLabels,
    detailBullets: item.detailBullets,
    citationIds: uniqueItems(item.citationIds.filter((citationId) => !allowedIds || allowedIds.has(citationId))).slice(0, MAX_CHUNKS)
  }))
    .filter((item) => item.title && item.detailBullets.length)
    .slice(0, MAX_FULL_CARD_INVENTORY);
}

function buildCoverageSummaryFromInventory(fullCardInventory = [], chunks = [], coverageStats = null) {
  const safeCoverageStats = sanitizeCoverageStats(coverageStats);
  const derivedSourceCounts = {};

  chunks.forEach((chunk) => {
    const key = sanitizeSourceDetailType(chunk?.sourceDetailType);
    derivedSourceCounts[key] = (derivedSourceCounts[key] || 0) + 1;
  });

  return {
    selectedParentCount: safeCoverageStats.selectedParentCount
      || uniqueItems(chunks.map((chunk) => sanitizeString(chunk?.parentId || chunk?.id, 120))).length,
    renderedParentCount: clampNumber(fullCardInventory.length, 0, MAX_FULL_CARD_INVENTORY, 0),
    sourceCounts: Object.keys(safeCoverageStats.sourceCounts || {}).length
      ? safeCoverageStats.sourceCounts
      : derivedSourceCounts,
    primarySubject: safeCoverageStats.primarySubject
      || sanitizeString(fullCardInventory[0]?.title || chunks[0]?.title, 120)
  };
}

function buildCoverageOutlineV4(parentBriefs = [], analysisPlan = {}, chunks = []) {
  const safeBriefs = sanitizeParentBriefs(parentBriefs, chunks.map((chunk) => chunk.id));
  const primarySubject = sanitizeString(
    analysisPlan?.hardAnchors?.[0]
      || analysisPlan?.subjectClusters?.[0]
      || analysisPlan?.facetSummary?.entityPlace?.[0]
      || safeBriefs[0]?.title
      || chunks[0]?.title,
    120
  );

  return {
    primarySubject,
    mustCoverParentIds: safeBriefs.map((item) => item.parentId).slice(0, 16),
    inventoryNotes: safeBriefs.slice(0, 12).map((item) =>
      `${item.title} | ${item.groupLabel || '站內整理'} | ${(item.sourceLabels || []).join(' / ')} | ${(item.detailBullets || []).slice(0, 3).join('；')}`
    )
  };
}

function inferSourceMixFromParentBriefs(parentBriefs = []) {
  const sourceMix = new Set();
  (Array.isArray(parentBriefs) ? parentBriefs : []).forEach((item) => {
    (item.sourceLabels || []).forEach((label) => {
      const normalized = sanitizeString(label, 60);
      if (normalized.includes('官方')) sourceMix.add('official');
      if (normalized.includes('禮賓')) sourceMix.add('concierge');
      if (normalized.includes('社群')) sourceMix.add('community');
    });
  });
  return Array.from(sourceMix).slice(0, 4);
}

function buildTopicAppendixFromCategoryDossiers(categoryDossiers = [], parentBriefs = [], citationIds = []) {
  const safeDossiers = sanitizeCategoryDossiers(categoryDossiers);
  const safeBriefs = sanitizeParentBriefs(parentBriefs, citationIds.length ? citationIds : parentBriefs.flatMap((item) => item.citationIds || []));

  return safeDossiers.map((dossier) => {
    const matchedBriefs = safeBriefs.filter((item) =>
      (item.categoryFamilies || []).includes(dossier.label)
      || dossier.preferredParentIds.includes(item.parentId)
    );
    const detailItems = uniqueItems([
      ...matchedBriefs.flatMap((item) => (item.detailBullets || []).slice(0, 4).map((detail) => `${item.title}：${detail}`)),
      ...dossier.detailHints.map((hint) => `${dossier.label || dossier.categoryId}：${hint}`)
    ]).slice(0, 12);
    const appendixCitationIds = uniqueItems(matchedBriefs.flatMap((item) => item.citationIds || [])).slice(0, MAX_CHUNKS);
    return {
      groupTitle: sanitizeString(dossier.label || dossier.categoryId || '延伸附錄', 120),
      categoryId: sanitizeString(dossier.categoryId || dossier.label, 80),
      summary: sanitizeString(
        `${dossier.label || dossier.categoryId || '這組主題'}整理 ${matchedBriefs.length || dossier.parentCount || 0} 張相關卡片，補充流程、限制、時段與細節。`,
        220
      ),
      detailItems,
      sourceMix: dossier.sourceMix.length ? dossier.sourceMix : inferSourceMixFromParentBriefs(matchedBriefs),
      citationIds: appendixCitationIds
    };
  })
    .filter((item) => item.groupTitle && item.detailItems.length)
    .slice(0, 16);
}

function sanitizeInventoryItemsV3(items = [], citationIds = [], defaultRenderOrigin = 'model') {
  const allowedIds = citationIds.length ? new Set(citationIds) : null;
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      parentId: sanitizeString(item?.parentId, 120),
      title: sanitizeString(item?.title, 160),
      cardType: sanitizeString(item?.cardType, 24).toLowerCase() || 'mixed',
      groupLabel: sanitizeString(item?.groupLabel, 120),
      sourceLabels: sanitizeTextArray(item?.sourceLabels, 5, 60),
      categoryFamilies: sanitizeTextArray(item?.categoryFamilies, 6, 60),
      detailBullets: sanitizeTextArray(item?.detailBullets, 10, 260),
      citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120))
        .filter((citationId) => !allowedIds || allowedIds.has(citationId)))
        .slice(0, MAX_CHUNKS),
      coverageTier: ['visible', 'derived', 'support'].includes(item?.coverageTier) ? item.coverageTier : 'support',
      renderOrigin: ['visible-backfill', 'derived-backfill', 'support-backfill', 'backfill', 'model'].includes(item?.renderOrigin)
        ? item.renderOrigin
        : defaultRenderOrigin
    }))
    .filter((item) => item.parentId && item.title && item.detailBullets.length)
    .slice(0, MAX_FULL_CARD_INVENTORY);
}

function buildFullCardInventoryCoverageV3(parentBriefs = [], citationIds = [], options = {}) {
  return sanitizeParentBriefs(parentBriefs, citationIds).map((item) => ({
    parentId: item.parentId,
    title: item.title,
    cardType: item.cardType || 'mixed',
    groupLabel: item.groupLabel,
    sourceLabels: item.sourceLabels,
    categoryFamilies: item.categoryFamilies,
    detailBullets: item.detailBullets,
    citationIds: item.citationIds.slice(0, MAX_CHUNKS),
    coverageTier: item.coverageTier || 'support',
    renderOrigin: options.renderOrigin || (
      item.coverageTier === 'visible'
        ? 'visible-backfill'
        : item.coverageTier === 'derived'
          ? 'derived-backfill'
          : 'support-backfill'
    )
  }))
    .filter((item) => item.title && item.detailBullets.length)
    .slice(0, MAX_FULL_CARD_INVENTORY);
}

function mergeCoverageInventoryV3(fullCardInventory = [], parentBriefs = [], coverageContract = null, citationIds = []) {
  const safeContract = sanitizeCoverageContract(coverageContract);
  const baseInventory = sanitizeInventoryItemsV3(fullCardInventory, citationIds, 'model');
  const backfillInventory = buildFullCardInventoryCoverageV3(parentBriefs, citationIds);
  const briefMap = new Map(backfillInventory.map((item) => [item.parentId, item]));
  const orderedParentIds = uniqueItems([
    ...safeContract.mustRenderVisibleParentIds,
    ...safeContract.mustRenderDerivedParentIds,
    ...safeContract.preferredSupportParentIds,
    ...safeContract.mustRenderParentIds,
    ...safeContract.preferredParentIds
  ]);
  const seenParentIds = new Set(baseInventory.map((item) => item.parentId));
  const mergedInventory = [...baseInventory];

  orderedParentIds.forEach((parentId) => {
    if (mergedInventory.length >= MAX_FULL_CARD_INVENTORY) return;
    if (seenParentIds.has(parentId)) return;
    const item = briefMap.get(parentId);
    if (!item) return;
    mergedInventory.push(item);
    seenParentIds.add(parentId);
  });

  const orderMap = new Map(orderedParentIds.map((parentId, index) => [parentId, index]));
  return mergedInventory
    .sort((a, b) => {
      const orderA = orderMap.has(a.parentId) ? orderMap.get(a.parentId) : Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.has(b.parentId) ? orderMap.get(b.parentId) : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      if (a.coverageTier !== b.coverageTier) {
        const tierOrder = { visible: 0, derived: 1, support: 2 };
        return (tierOrder[a.coverageTier] ?? 9) - (tierOrder[b.coverageTier] ?? 9);
      }
      if (a.renderOrigin !== b.renderOrigin) return a.renderOrigin === 'model' ? -1 : 1;
      return a.title.localeCompare(b.title, 'zh-Hant');
    })
    .slice(0, MAX_FULL_CARD_INVENTORY);
}

function buildCoverageSummaryFromInventoryV4(fullCardInventory = [], chunks = [], coverageStats = null, coverageContract = null) {
  const safeCoverageStats = sanitizeCoverageStats(coverageStats);
  const safeCoverageContract = sanitizeCoverageContract(coverageContract);
  const derivedSourceCounts = {};
  const renderedParentIds = uniqueItems(fullCardInventory.map((item) => sanitizeString(item?.parentId, 120)).filter(Boolean));
  const visibleTargetIds = uniqueItems([
    ...safeCoverageContract.mustRenderVisibleParentIds,
    ...safeCoverageContract.visibleParentIds
  ]);
  const renderedVisibleIds = renderedParentIds.filter((parentId) => visibleTargetIds.includes(parentId));
  const targetParentCount = safeCoverageStats.targetParentCount
    || safeCoverageContract.targetCoverageCount
    || safeCoverageContract.mustRenderParentIds.length
    || safeCoverageStats.selectedParentCount
    || uniqueItems(chunks.map((chunk) => sanitizeString(chunk?.parentId || chunk?.id, 120))).length;
  const backfilledParentCount = safeCoverageStats.backfilledParentCount
    || fullCardInventory.filter((item) => String(item?.renderOrigin || '').endsWith('backfill')).length;
  const coverageRatio = targetParentCount
    ? Number((Math.min(1, renderedParentIds.length / Math.max(targetParentCount, 1))).toFixed(2))
    : (safeCoverageStats.coverageRatio || 0);
  const visibleTargetCount = safeCoverageStats.visibleTargetCount
    || safeCoverageContract.targetVisibleCoverageCount
    || visibleTargetIds.length;
  const visibleBackfilledCount = safeCoverageStats.visibleBackfilledCount
    || fullCardInventory.filter((item) => item?.renderOrigin === 'visible-backfill').length;
  const visibleCoverageRatio = visibleTargetCount
    ? Number((Math.min(1, renderedVisibleIds.length / Math.max(visibleTargetCount, 1))).toFixed(2))
    : (safeCoverageStats.visibleCoverageRatio || 0);

  chunks.forEach((chunk) => {
    const key = sanitizeSourceDetailType(chunk?.sourceDetailType);
    derivedSourceCounts[key] = (derivedSourceCounts[key] || 0) + 1;
  });

  return {
    selectedParentCount: safeCoverageStats.selectedParentCount
      || uniqueItems(chunks.map((chunk) => sanitizeString(chunk?.parentId || chunk?.id, 120))).length,
    targetParentCount: clampNumber(targetParentCount, 0, MAX_PARENT_BRIEFS, 0),
    renderedParentCount: clampNumber(renderedParentIds.length, 0, MAX_FULL_CARD_INVENTORY, 0),
    backfilledParentCount: clampNumber(backfilledParentCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleTargetCount: clampNumber(visibleTargetCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleRenderedCount: clampNumber(renderedVisibleIds.length, 0, MAX_FULL_CARD_INVENTORY, 0),
    visibleBackfilledCount: clampNumber(visibleBackfilledCount, 0, MAX_PARENT_BRIEFS, 0),
    visibleCoverageRatio: clampFraction(visibleCoverageRatio, 0),
    coverageRatio: clampFraction(coverageRatio, 0),
    sourceCounts: Object.keys(safeCoverageStats.sourceCounts || {}).length
      ? safeCoverageStats.sourceCounts
      : derivedSourceCounts,
    primarySubject: safeCoverageStats.primarySubject
      || sanitizeString(fullCardInventory[0]?.title || chunks[0]?.title, 120)
  };
}

function buildCapabilityCoverageSummary(fullCardInventory = [], capabilityCoveragePlan = null) {
  const safePlan = sanitizeCapabilityCoveragePlan(capabilityCoveragePlan);
  const renderedParentIds = uniqueItems((Array.isArray(fullCardInventory) ? fullCardInventory : [])
    .map((item) => sanitizeString(item?.parentId, 120))
    .filter(Boolean));
  const items = safePlan.items.map((item) => ({
    capabilityId: item.capabilityId,
    label: item.label || item.capabilityId,
    matchedParentCount: item.matchedParentIds.filter((parentId) => renderedParentIds.includes(parentId)).length,
    targetParentCount: item.matchedParentIds.length,
    categoryFamilies: item.categoryFamilies,
    disallowedCategories: item.disallowedCategories
  }));
  return {
    requiredCapabilities: safePlan.requiredCapabilities,
    disallowedCategories: safePlan.disallowedCategories,
    items
  };
}

function buildCoverageOutlineV3(parentBriefs = [], analysisPlan = {}, chunks = [], coverageContract = null) {
  const safeBriefs = sanitizeParentBriefs(parentBriefs, chunks.map((chunk) => chunk.id));
  const safeCoverageContract = sanitizeCoverageContract(coverageContract);
  const primarySubject = sanitizeString(
    analysisPlan?.hardAnchors?.[0]
      || analysisPlan?.subjectClusters?.[0]
      || analysisPlan?.facetSummary?.entityPlace?.[0]
      || safeBriefs[0]?.title
      || chunks[0]?.title,
    120
  );
  const mustCoverParentIds = safeCoverageContract.mustRenderParentIds.length
    ? safeCoverageContract.mustRenderParentIds.slice(0, 16)
    : safeBriefs.map((item) => item.parentId).slice(0, 16);
  const briefMap = new Map(safeBriefs.map((item) => [item.parentId, item]));

  return {
    primarySubject,
    mustCoverParentIds,
    inventoryNotes: mustCoverParentIds
      .map((parentId) => briefMap.get(parentId))
      .filter(Boolean)
      .slice(0, 12)
      .map((item) =>
        `${item.title} | ${item.groupLabel || '站內內容'} | ${(item.sourceLabels || []).join(' / ')} | ${(item.detailBullets || []).slice(0, 3).join(' | ')}`
      )
  };
}

function buildFallbackReportCoverageV3({
  answer = '',
  sections = {},
  sourceBreakdown = [],
  citationIds = [],
  followUpHint = '',
  missingReason = '',
  chunks = [],
  parentBriefs = [],
  categoryDossiers = [],
  coverageStats = null,
  coverageContract = null
} = {}) {
  const directAnswer = sanitizeString(sections.directAnswer || answer, 320);
  const topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  const cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  const fallbackParentBriefs = sanitizeParentBriefs(parentBriefs, chunks.map((chunk) => chunk.id));
  const derivedParentBriefs = fallbackParentBriefs.length ? fallbackParentBriefs : deriveParentBriefsFromChunks(chunks);
  const safeCategoryDossiers = sanitizeCategoryDossiers(categoryDossiers);
  const fullCardInventory = mergeCoverageInventoryV3([], derivedParentBriefs, coverageContract, citationIds);
  const topicAppendix = buildTopicAppendixFromCategoryDossiers(safeCategoryDossiers, derivedParentBriefs, citationIds);
  const derivedInventoryDetails = fullCardInventory.flatMap((item) =>
    (item.detailBullets || []).slice(0, 3).map((detail) => `${item.title}：${detail}`)
  );
  const derivedAppendixDetails = topicAppendix.flatMap((group) =>
    (group.detailItems || []).slice(0, 3).map((detail) => `${group.groupTitle}：${detail}`)
  );
  const derivedGroupDetails = topicGroups.flatMap((group) =>
    (group.detailItems || []).map((item) => `${group.groupTitle}：${item}`)
  );
  const derivedRiskItems = chunks
    .filter((chunk) => ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(chunk.fieldType))
    .map((chunk) => `${sanitizeString(chunk.title, 120)}：${buildChunkPreview(chunk, 180)}`);

  return {
    headline: sanitizeString(directAnswer || '站內整理報告', 120),
    coverageSummary: buildCoverageSummaryFromInventoryV4(fullCardInventory, chunks, coverageStats, coverageContract),
    executiveSummary: sanitizeTextArray(
      [directAnswer, ...(sections.whyThisWorks || []), ...derivedInventoryDetails.slice(0, 2)],
      4,
      240
    ),
    recommendedPlan: sanitizeTextArray(
      [...(sections.recommendedSteps || []), ...derivedInventoryDetails, ...derivedAppendixDetails, ...derivedGroupDetails],
      16,
      240
    ),
    fullCardInventory,
    topicAppendix,
    detailBreakdown: sanitizeTextArray(
      [...(sections.detailBreakdown || []), ...derivedInventoryDetails, ...derivedAppendixDetails, ...derivedGroupDetails],
      24,
      260
    ),
    decisionAnalysis: sanitizeTextArray(
      [...(sections.whyThisWorks || []), ...topicGroups.slice(0, 6).map((group) => `${group.groupTitle}：${group.summary || '可從對應卡片補充細節'}`)],
      10,
      240
    ),
    risksAndFallbacks: sanitizeTextArray(
      [...(sections.watchOuts || []), ...derivedRiskItems],
      12,
      240
    ),
    topicGroups,
    cardHighlights,
    sourceComparison: buildSourceComparisonFromBreakdown(sourceBreakdown),
    unansweredQuestions: sanitizeTextArray([missingReason, followUpHint].filter(Boolean), 6, 180),
    sectionCitationIds: {
      ...buildDefaultSectionCitationIds(citationIds),
      fullCardInventory: uniqueItems(fullCardInventory.flatMap((item) => item.citationIds || [])).slice(0, MAX_CHUNKS),
      topicAppendix: uniqueItems(topicAppendix.flatMap((item) => item.citationIds || [])).slice(0, MAX_CHUNKS)
    }
  };
}

function normalizeReportObjectCoverageV3(report, citationIds, chunks, answer, sections, sourceBreakdown, followUpHint, missingReason, options = {}) {
  const safeReport = report && typeof report === 'object' ? report : {};
  const safeCoverageContract = sanitizeCoverageContract(options.coverageContract || null);
  const fallbackParentBriefs = sanitizeParentBriefs(options.parentBriefs, chunks.map((chunk) => chunk.id));
  const derivedParentBriefs = fallbackParentBriefs.length ? fallbackParentBriefs : deriveParentBriefsFromChunks(chunks);
  const safeCategoryDossiers = sanitizeCategoryDossiers(options.categoryDossiers || []);
  const modelInventory = sanitizeInventoryItemsV3(safeReport.fullCardInventory || [], citationIds, 'model');
  const mergedInventory = mergeCoverageInventoryV3(modelInventory, derivedParentBriefs, safeCoverageContract, citationIds);
  const normalized = {
    headline: sanitizeString(safeReport.headline, 120),
    coverageSummary: buildCoverageSummaryFromInventoryV4(
      mergedInventory,
      chunks,
      safeReport.coverageSummary || options.coverageStats || null,
      safeCoverageContract
    ),
    capabilityCoverageSummary: buildCapabilityCoverageSummary(
      mergedInventory,
      safeReport.capabilityCoverageSummary || options.capabilityCoveragePlan || null
    ),
    executiveSummary: sanitizeTextArray(safeReport.executiveSummary, 4, 240),
    recommendedPlan: sanitizeTextArray(safeReport.recommendedPlan, 16, 240),
    fullCardInventory: mergedInventory,
    topicAppendix: (Array.isArray(safeReport.topicAppendix) ? safeReport.topicAppendix : [])
      .map((item) => ({
        groupTitle: sanitizeString(item?.groupTitle, 160),
        categoryId: sanitizeString(item?.categoryId, 80),
        summary: sanitizeString(item?.summary, 220),
        detailItems: sanitizeTextArray(item?.detailItems, 14, 260),
        sourceMix: uniqueItems((Array.isArray(item?.sourceMix) ? item.sourceMix : [])
          .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
          .slice(0, 4),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.groupTitle && item.detailItems.length)
      .slice(0, 16),
    detailBreakdown: sanitizeTextArray(safeReport.detailBreakdown, 24, 260),
    decisionAnalysis: sanitizeTextArray(safeReport.decisionAnalysis, 10, 240),
    risksAndFallbacks: sanitizeTextArray(safeReport.risksAndFallbacks, 12, 240),
    topicGroups: (Array.isArray(safeReport.topicGroups) ? safeReport.topicGroups : [])
      .map((item) => ({
        groupTitle: sanitizeString(item?.groupTitle, 160),
        groupKind: item?.groupKind === 'extension' ? 'extension' : 'core',
        entityType: sanitizeString(item?.entityType, 24).toLowerCase() || 'mixed',
        summary: sanitizeString(item?.summary, 220),
        detailItems: sanitizeTextArray(item?.detailItems, 12, 260),
        sourceMix: uniqueItems((Array.isArray(item?.sourceMix) ? item.sourceMix : [])
          .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
          .slice(0, 4),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.groupTitle && item.detailItems.length)
      .slice(0, 24),
    cardHighlights: (Array.isArray(safeReport.cardHighlights) ? safeReport.cardHighlights : [])
      .map((item) => ({
        title: sanitizeString(item?.title, 160),
        sourceType: sanitizeSourceType(item?.sourceType),
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType),
        whyRelevant: sanitizeString(item?.whyRelevant, 180),
        detailBullets: sanitizeTextArray(item?.detailBullets, 4, 220),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.title && item.detailBullets.length)
      .slice(0, 12),
    sourceComparison: (Array.isArray(safeReport.sourceComparison) ? safeReport.sourceComparison : [])
      .map((item) => ({
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType || item?.type),
        stance: sanitizeString(item?.stance, 80),
        summary: sanitizeString(item?.summary, 220),
        confidenceNote: sanitizeString(item?.confidenceNote, 120)
      }))
      .filter((item) => item.summary)
      .slice(0, 6),
    unansweredQuestions: sanitizeTextArray(safeReport.unansweredQuestions, 6, 180),
    sectionCitationIds: sanitizeSectionCitationIds(safeReport.sectionCitationIds, citationIds)
  };

  if (!normalized.headline) {
    normalized.headline = sanitizeString(answer || sections.directAnswer || '站內整理報告', 120);
  }
  if (!normalized.topicGroups.length) {
    normalized.topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  }
  if (!normalized.cardHighlights.length) {
    normalized.cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  }
  if (!normalized.topicAppendix.length) {
    normalized.topicAppendix = buildTopicAppendixFromCategoryDossiers(safeCategoryDossiers, derivedParentBriefs, citationIds);
  }
  if (!normalized.fullCardInventory.length) {
    normalized.fullCardInventory = mergeCoverageInventoryV3([], derivedParentBriefs, safeCoverageContract, citationIds);
  } else {
    normalized.fullCardInventory = mergeCoverageInventoryV3(normalized.fullCardInventory, derivedParentBriefs, safeCoverageContract, citationIds);
  }
  normalized.coverageSummary = buildCoverageSummaryFromInventoryV4(
    normalized.fullCardInventory,
    chunks,
    safeReport.coverageSummary || options.coverageStats || null,
    safeCoverageContract
  );
  if (!normalized.sourceComparison.length) {
    normalized.sourceComparison = buildSourceComparisonFromBreakdown(sourceBreakdown);
  }

  const derivedGroupDetails = normalized.topicGroups.flatMap((group) =>
    (group.detailItems || []).map((item) => `${group.groupTitle}：${item}`)
  );
  const derivedCorePlan = normalized.topicGroups
    .filter((group) => group.groupKind === 'core')
    .flatMap((group) => (group.detailItems || []).slice(0, 2).map((item) => `${group.groupTitle}：${item}`));
  const derivedInventoryDetails = normalized.fullCardInventory.flatMap((item) =>
    (item.detailBullets || []).slice(0, 3).map((detail) => `${item.title}：${detail}`)
  );
  const derivedAppendixDetails = normalized.topicAppendix.flatMap((item) =>
    (item.detailItems || []).slice(0, 3).map((detail) => `${item.groupTitle}：${detail}`)
  );
  const derivedRiskItems = chunks
    .filter((chunk) => ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(chunk.fieldType))
    .map((chunk) => `${sanitizeString(chunk.title, 120)}：${buildChunkPreview(chunk, 180)}`);

  if (!normalized.executiveSummary.length) {
    normalized.executiveSummary = sanitizeTextArray(
      [sections.directAnswer || answer, ...(sections.whyThisWorks || []), ...derivedInventoryDetails.slice(0, 2), ...derivedCorePlan.slice(0, 2)],
      4,
      240
    );
  }
  if (!normalized.recommendedPlan.length) {
    normalized.recommendedPlan = sanitizeTextArray(
      [...(sections.recommendedSteps || []), ...derivedCorePlan, ...derivedInventoryDetails, ...derivedAppendixDetails, ...derivedGroupDetails],
      16,
      240
    );
  }
  if (!normalized.detailBreakdown.length) {
    normalized.detailBreakdown = sanitizeTextArray(
      [...(sections.detailBreakdown || []), ...derivedInventoryDetails, ...derivedAppendixDetails, ...derivedGroupDetails],
      24,
      260
    );
  }
  if (!normalized.decisionAnalysis.length) {
    normalized.decisionAnalysis = sanitizeTextArray(
      [...(sections.whyThisWorks || []), ...normalized.topicGroups.slice(0, 6).map((group) => `${group.groupTitle}：${group.summary || '可補充同主題細節'}`)],
      10,
      240
    );
  }
  if (!normalized.risksAndFallbacks.length) {
    normalized.risksAndFallbacks = sanitizeTextArray(
      [...(sections.watchOuts || []), ...derivedRiskItems],
      12,
      240
    );
  }
  if (!normalized.unansweredQuestions.length && (missingReason || followUpHint)) {
    normalized.unansweredQuestions = sanitizeTextArray([missingReason, followUpHint], 6, 180);
  }
  if (!Object.values(normalized.sectionCitationIds).some((items) => items.length)) {
    normalized.sectionCitationIds = buildDefaultSectionCitationIds(citationIds);
  }
  if (!Array.isArray(normalized.sectionCitationIds.fullCardInventory) || !normalized.sectionCitationIds.fullCardInventory.length) {
    normalized.sectionCitationIds.fullCardInventory = uniqueItems(
      normalized.fullCardInventory.flatMap((item) => item.citationIds || [])
    ).slice(0, MAX_CHUNKS);
  }
  if (!Array.isArray(normalized.sectionCitationIds.topicAppendix) || !normalized.sectionCitationIds.topicAppendix.length) {
    normalized.sectionCitationIds.topicAppendix = uniqueItems(
      normalized.topicAppendix.flatMap((item) => item.citationIds || [])
    ).slice(0, MAX_CHUNKS);
  }

  const hasCoreContent = normalized.executiveSummary.length
    || normalized.recommendedPlan.length
    || normalized.fullCardInventory.length
    || normalized.topicAppendix.length
    || normalized.detailBreakdown.length
    || normalized.decisionAnalysis.length
    || normalized.risksAndFallbacks.length
    || normalized.topicGroups.length
    || normalized.cardHighlights.length;

  if (!hasCoreContent) {
    return buildFallbackReportCoverageV3({
      answer,
      sections,
      sourceBreakdown,
      citationIds,
      followUpHint,
      missingReason,
      chunks,
      parentBriefs: derivedParentBriefs,
      categoryDossiers: safeCategoryDossiers,
      coverageStats: options.coverageStats || null,
      coverageContract: safeCoverageContract
    });
  }

  return normalized;
}

function buildCoverageOutline(parentBriefs = [], analysisPlan = {}, chunks = []) {
  const safeBriefs = sanitizeParentBriefs(parentBriefs, chunks.map((chunk) => chunk.id));
  const primarySubject = sanitizeString(
    analysisPlan?.hardAnchors?.[0]
      || analysisPlan?.subjectClusters?.[0]
      || analysisPlan?.facetSummary?.entityPlace?.[0]
      || safeBriefs[0]?.title
      || chunks[0]?.title,
    120
  );

  return {
    primarySubject,
    mustCoverParentIds: safeBriefs.map((item) => item.parentId).slice(0, 16),
    inventoryNotes: safeBriefs.slice(0, 12).map((item) =>
      `${item.title} | ${item.groupLabel || '綜合整理'} | ${(item.sourceLabels || []).join(' / ')} | ${(item.detailBullets || []).slice(0, 3).join(' | ')}`
    )
  };
}

function buildCoverageSummaryFromInventoryV3(fullCardInventory = [], chunks = [], coverageStats = null, coverageContract = null) {
  const safeCoverageStats = sanitizeCoverageStats(coverageStats);
  const safeCoverageContract = sanitizeCoverageContract(coverageContract);
  const derivedSourceCounts = {};
  const renderedParentIds = uniqueItems(fullCardInventory.map((item) => sanitizeString(item?.parentId, 120)).filter(Boolean));
  const targetParentCount = safeCoverageContract.mustRenderParentIds.length
    || safeCoverageStats.targetParentCount
    || safeCoverageContract.targetCoverageCount
    || safeCoverageStats.selectedParentCount
    || uniqueItems(chunks.map((chunk) => sanitizeString(chunk?.parentId || chunk?.id, 120))).length;
  const backfilledParentCount = safeCoverageStats.backfilledParentCount
    || fullCardInventory.filter((item) => item?.renderOrigin === 'backfill').length;
  const coverageRatio = targetParentCount
    ? Number((Math.min(1, renderedParentIds.length / Math.max(targetParentCount, 1))).toFixed(2))
    : (safeCoverageStats.coverageRatio || 0);

  chunks.forEach((chunk) => {
    const key = sanitizeSourceDetailType(chunk?.sourceDetailType);
    derivedSourceCounts[key] = (derivedSourceCounts[key] || 0) + 1;
  });

  return {
    selectedParentCount: safeCoverageStats.selectedParentCount
      || uniqueItems(chunks.map((chunk) => sanitizeString(chunk?.parentId || chunk?.id, 120))).length,
    targetParentCount: clampNumber(targetParentCount, 0, MAX_PARENT_BRIEFS, 0),
    renderedParentCount: clampNumber(renderedParentIds.length, 0, MAX_FULL_CARD_INVENTORY, 0),
    backfilledParentCount: clampNumber(backfilledParentCount, 0, MAX_PARENT_BRIEFS, 0),
    coverageRatio: clampFraction(coverageRatio, 0),
    sourceCounts: Object.keys(safeCoverageStats.sourceCounts || {}).length
      ? safeCoverageStats.sourceCounts
      : derivedSourceCounts,
    primarySubject: safeCoverageStats.primarySubject
      || sanitizeString(fullCardInventory[0]?.title || chunks[0]?.title, 120)
  };
}

function buildFallbackReportCoverageV2({
  answer = '',
  sections = {},
  sourceBreakdown = [],
  citationIds = [],
  followUpHint = '',
  missingReason = '',
  chunks = [],
  parentBriefs = [],
  coverageStats = null,
  coverageContract = null
} = {}) {
  const directAnswer = sanitizeString(sections.directAnswer || answer, 320);
  const topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  const cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  const fallbackParentBriefs = sanitizeParentBriefs(parentBriefs, chunks.map((chunk) => chunk.id));
  const derivedParentBriefs = fallbackParentBriefs.length ? fallbackParentBriefs : deriveParentBriefsFromChunks(chunks);
  const fullCardInventory = mergeCoverageInventoryV3([], derivedParentBriefs, coverageContract, citationIds);
  const derivedInventoryDetails = fullCardInventory.flatMap((item) =>
    (item.detailBullets || []).slice(0, 3).map((detail) => `${item.title}：${detail}`)
  );
  const derivedGroupDetails = topicGroups.flatMap((group) =>
    (group.detailItems || []).map((item) => `${group.groupTitle}：${item}`)
  );
  const derivedRiskItems = chunks
    .filter((chunk) => ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(chunk.fieldType))
    .map((chunk) => `${sanitizeString(chunk.title, 120)}：${buildChunkPreview(chunk, 180)}`);

  return {
    headline: sanitizeString(directAnswer || '站內攻略整理重點', 120),
    coverageSummary: buildCoverageSummaryFromInventoryV3(fullCardInventory, chunks, coverageStats, coverageContract),
    executiveSummary: sanitizeTextArray(
      [directAnswer, ...(sections.whyThisWorks || []), ...derivedInventoryDetails.slice(0, 2)],
      4,
      240
    ),
    recommendedPlan: sanitizeTextArray(
      [...(sections.recommendedSteps || []), ...derivedInventoryDetails, ...derivedGroupDetails],
      16,
      240
    ),
    fullCardInventory,
    detailBreakdown: sanitizeTextArray(
      [...(sections.detailBreakdown || []), ...derivedInventoryDetails, ...derivedGroupDetails],
      24,
      260
    ),
    decisionAnalysis: sanitizeTextArray(
      [...(sections.whyThisWorks || []), ...topicGroups.slice(0, 6).map((group) => `${group.groupTitle}：${group.summary || '這組內容來自同主題卡片的綜合整理。'}`)],
      10,
      240
    ),
    risksAndFallbacks: sanitizeTextArray(
      [...(sections.watchOuts || []), ...derivedRiskItems],
      12,
      240
    ),
    topicGroups,
    cardHighlights,
    sourceComparison: buildSourceComparisonFromBreakdown(sourceBreakdown),
    unansweredQuestions: sanitizeTextArray([missingReason, followUpHint].filter(Boolean), 6, 180),
    sectionCitationIds: {
      ...buildDefaultSectionCitationIds(citationIds),
      fullCardInventory: uniqueItems(fullCardInventory.flatMap((item) => item.citationIds || [])).slice(0, MAX_CHUNKS)
    }
  };
}

function normalizeReportObjectCoverageV2(report, citationIds, chunks, answer, sections, sourceBreakdown, followUpHint, missingReason, options = {}) {
  const safeReport = report && typeof report === 'object' ? report : {};
  const safeCoverageContract = sanitizeCoverageContract(options.coverageContract || null);
  const fallbackParentBriefs = sanitizeParentBriefs(options.parentBriefs, chunks.map((chunk) => chunk.id));
  const derivedParentBriefs = fallbackParentBriefs.length ? fallbackParentBriefs : deriveParentBriefsFromChunks(chunks);
  const modelInventory = sanitizeInventoryItemsV3(safeReport.fullCardInventory || [], citationIds, 'model');
  const mergedInventory = mergeCoverageInventoryV3(modelInventory, derivedParentBriefs, safeCoverageContract, citationIds);
  const normalized = {
    headline: sanitizeString(safeReport.headline, 120),
    coverageSummary: buildCoverageSummaryFromInventoryV3(
      mergedInventory,
      chunks,
      safeReport.coverageSummary || options.coverageStats || null,
      safeCoverageContract
    ),
    executiveSummary: sanitizeTextArray(safeReport.executiveSummary, 4, 240),
    recommendedPlan: sanitizeTextArray(safeReport.recommendedPlan, 16, 240),
    fullCardInventory: mergedInventory,
    detailBreakdown: sanitizeTextArray(safeReport.detailBreakdown, 24, 260),
    decisionAnalysis: sanitizeTextArray(safeReport.decisionAnalysis, 10, 240),
    risksAndFallbacks: sanitizeTextArray(safeReport.risksAndFallbacks, 12, 240),
    topicGroups: (Array.isArray(safeReport.topicGroups) ? safeReport.topicGroups : [])
      .map((item) => ({
        groupTitle: sanitizeString(item?.groupTitle, 160),
        groupKind: item?.groupKind === 'extension' ? 'extension' : 'core',
        entityType: sanitizeString(item?.entityType, 24).toLowerCase() || 'mixed',
        summary: sanitizeString(item?.summary, 220),
        detailItems: sanitizeTextArray(item?.detailItems, 12, 260),
        sourceMix: uniqueItems((Array.isArray(item?.sourceMix) ? item.sourceMix : [])
          .map((sourceDetailType) => sanitizeSourceDetailType(sourceDetailType)))
          .slice(0, 4),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.groupTitle && item.detailItems.length)
      .slice(0, 24),
    cardHighlights: (Array.isArray(safeReport.cardHighlights) ? safeReport.cardHighlights : [])
      .map((item) => ({
        title: sanitizeString(item?.title, 160),
        sourceType: sanitizeSourceType(item?.sourceType),
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType),
        whyRelevant: sanitizeString(item?.whyRelevant, 180),
        detailBullets: sanitizeTextArray(item?.detailBullets, 4, 220),
        citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
          .map((citationId) => sanitizeString(citationId, 120))
          .filter((citationId) => citationIds.includes(citationId)))
          .slice(0, MAX_CHUNKS)
      }))
      .filter((item) => item.title && item.detailBullets.length)
      .slice(0, 12),
    sourceComparison: (Array.isArray(safeReport.sourceComparison) ? safeReport.sourceComparison : [])
      .map((item) => ({
        sourceDetailType: sanitizeSourceDetailType(item?.sourceDetailType || item?.type),
        stance: sanitizeString(item?.stance, 80),
        summary: sanitizeString(item?.summary, 220),
        confidenceNote: sanitizeString(item?.confidenceNote, 120)
      }))
      .filter((item) => item.summary)
      .slice(0, 6),
    unansweredQuestions: sanitizeTextArray(safeReport.unansweredQuestions, 6, 180),
    sectionCitationIds: sanitizeSectionCitationIds(safeReport.sectionCitationIds, citationIds)
  };

  if (!normalized.headline) {
    normalized.headline = sanitizeString(answer || sections.directAnswer || '站內攻略整理重點', 120);
  }
  if (!normalized.topicGroups.length) {
    normalized.topicGroups = buildTopicGroupsFromChunks(chunks, citationIds);
  }
  if (!normalized.cardHighlights.length) {
    normalized.cardHighlights = buildCardHighlightsFromChunks(chunks, citationIds);
  }
  if (!normalized.fullCardInventory.length) {
    normalized.fullCardInventory = mergeCoverageInventoryV3([], derivedParentBriefs, safeCoverageContract, citationIds);
  } else {
    normalized.fullCardInventory = mergeCoverageInventoryV3(normalized.fullCardInventory, derivedParentBriefs, safeCoverageContract, citationIds);
  }
  normalized.coverageSummary = buildCoverageSummaryFromInventoryV3(
    normalized.fullCardInventory,
    chunks,
    safeReport.coverageSummary || options.coverageStats || null,
    safeCoverageContract
  );
  if (!normalized.sourceComparison.length) {
    normalized.sourceComparison = buildSourceComparisonFromBreakdown(sourceBreakdown);
  }

  const derivedGroupDetails = normalized.topicGroups.flatMap((group) =>
    (group.detailItems || []).map((item) => `${group.groupTitle}：${item}`)
  );
  const derivedCorePlan = normalized.topicGroups
    .filter((group) => group.groupKind === 'core')
    .flatMap((group) => (group.detailItems || []).slice(0, 2).map((item) => `${group.groupTitle}：${item}`));
  const derivedInventoryDetails = normalized.fullCardInventory.flatMap((item) =>
    (item.detailBullets || []).slice(0, 3).map((detail) => `${item.title}：${detail}`)
  );
  const derivedRiskItems = chunks
    .filter((chunk) => ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(chunk.fieldType))
    .map((chunk) => `${sanitizeString(chunk.title, 120)}：${buildChunkPreview(chunk, 180)}`);

  if (!normalized.executiveSummary.length) {
    normalized.executiveSummary = sanitizeTextArray(
      [sections.directAnswer || answer, ...(sections.whyThisWorks || []), ...derivedInventoryDetails.slice(0, 2), ...derivedCorePlan.slice(0, 2)],
      4,
      240
    );
  }
  if (!normalized.recommendedPlan.length) {
    normalized.recommendedPlan = sanitizeTextArray(
      [...(sections.recommendedSteps || []), ...derivedCorePlan, ...derivedInventoryDetails, ...derivedGroupDetails],
      16,
      240
    );
  }
  if (!normalized.detailBreakdown.length) {
    normalized.detailBreakdown = sanitizeTextArray(
      [...(sections.detailBreakdown || []), ...derivedInventoryDetails, ...derivedGroupDetails],
      24,
      260
    );
  }
  if (!normalized.decisionAnalysis.length) {
    normalized.decisionAnalysis = sanitizeTextArray(
      [...(sections.whyThisWorks || []), ...normalized.topicGroups.slice(0, 6).map((group) => `${group.groupTitle}：${group.summary || '這組內容來自同主題卡片的綜合整理。'}`)],
      10,
      240
    );
  }
  if (!normalized.risksAndFallbacks.length) {
    normalized.risksAndFallbacks = sanitizeTextArray(
      [...(sections.watchOuts || []), ...derivedRiskItems],
      12,
      240
    );
  }
  if (!normalized.unansweredQuestions.length && (missingReason || followUpHint)) {
    normalized.unansweredQuestions = sanitizeTextArray([missingReason, followUpHint], 6, 180);
  }
  if (!Object.values(normalized.sectionCitationIds).some((items) => items.length)) {
    normalized.sectionCitationIds = buildDefaultSectionCitationIds(citationIds);
  }
  if (!Array.isArray(normalized.sectionCitationIds.fullCardInventory) || !normalized.sectionCitationIds.fullCardInventory.length) {
    normalized.sectionCitationIds.fullCardInventory = uniqueItems(
      normalized.fullCardInventory.flatMap((item) => item.citationIds || [])
    ).slice(0, MAX_CHUNKS);
  }

  const hasCoreContent = normalized.executiveSummary.length
    || normalized.recommendedPlan.length
    || normalized.fullCardInventory.length
    || normalized.detailBreakdown.length
    || normalized.decisionAnalysis.length
    || normalized.risksAndFallbacks.length
    || normalized.topicGroups.length
    || normalized.cardHighlights.length;

  if (!hasCoreContent) {
    return buildFallbackReportCoverageV2({
      answer,
      sections,
      sourceBreakdown,
      citationIds,
      followUpHint,
      missingReason,
      chunks,
      parentBriefs: derivedParentBriefs,
      coverageStats: options.coverageStats || null,
      coverageContract: safeCoverageContract
    });
  }

  return normalized;
}

function buildAnalysisPlanTextV3(analysisPlan) {
  if (!analysisPlan || typeof analysisPlan !== 'object') return 'analysis plan: none';

  const facetSummary = analysisPlan.facetSummary || {};
  const facetLines = [
    ['goal', facetSummary.goal],
    ['time', facetSummary.time],
    ['entity/place', facetSummary.entityPlace],
    ['audience', facetSummary.audience],
    ['risk', facetSummary.risk],
    ['alternatives', facetSummary.alternatives]
  ]
    .filter(([, values]) => Array.isArray(values) && values.length)
    .map(([label, values]) => `- ${label}: ${values.join(', ')}`);

  return [
    `responseMode: ${analysisPlan.responseMode || 'compact'}`,
    `intentType: ${analysisPlan.intentType || 'operational-detail'}`,
    `activeFacetNames: ${(analysisPlan.activeFacetNames || []).join(', ') || 'none'}`,
    `triggerReasons: ${(analysisPlan.triggerReasons || []).join(', ') || 'none'}`,
    `isComparisonQuery: ${analysisPlan.isComparisonQuery ? 'true' : 'false'}`,
    `hasRiskJudgment: ${analysisPlan.hasRiskJudgment ? 'true' : 'false'}`,
    `needsSourceComparison: ${analysisPlan.needsSourceComparison ? 'true' : 'false'}`,
    `rewriteTriggered: ${analysisPlan.rewriteTriggered ? 'true' : 'false'}`,
    `evidenceBudget: ${analysisPlan.evidenceBudget || 0}`,
    `maxParentCards: ${analysisPlan.maxParentCards || 0}`,
    facetLines.length ? `facets:\n${facetLines.join('\n')}` : 'facets: none'
  ].join('\n');
}

function buildAnalysisPlanTextV4(analysisPlan) {
  if (!analysisPlan || typeof analysisPlan !== 'object') return 'analysis plan: none';
  return buildAnalysisPlanTextV3(analysisPlan);
}

buildFallbackReport = buildFallbackReportCoverageV3;
normalizeReportObject = normalizeReportObjectCoverageV3;
buildFullCardInventoryFromParentBriefs = buildFullCardInventoryCoverageV3;

const LONGFORM_SECTION_META_V4 = {
  schedule: {
    sectionKey: 'schedule',
    sectionTitle: '行程區塊',
    sectionSummary: '先把跟問題有關的時段與安排脈絡整理出來。'
  },
  deckShow: {
    sectionKey: 'deckShow',
    sectionTitle: '甲板設施 / 表演區塊',
    sectionSummary: '再把設施、服務、表演與位置細節整合成主要攻略。'
  },
  playbook: {
    sectionKey: 'playbook',
    sectionTitle: '攻略區塊',
    sectionSummary: '最後補上做法、心得、注意事項與小技巧。'
  }
};
const LONGFORM_SECTION_ORDER_V4 = ['schedule', 'deckShow', 'playbook'];

function inferSectionKeyFromInventoryItemV4(item = {}) {
  const sourceType = sanitizeSourceType(item?.sourceType);
  const cardType = sanitizeSourceType(item?.cardType);
  const parentId = sanitizeString(item?.parentId, 160).toLowerCase();
  const sourceLabels = sanitizeTextArray(item?.sourceLabels, 6, 80).join(' ');
  const groupLabel = sanitizeString(item?.groupLabel, 120);
  const title = sanitizeString(item?.title, 160);
  const searchable = `${parentId} ${sourceLabels} ${groupLabel} ${title}`.toLowerCase();

  if (
    sourceType === 'schedule'
    || cardType === 'schedule'
    || /^schedule[-:_]/.test(parentId)
    || /行程|day\s*\d|報到|登船|時段/.test(searchable)
  ) {
    return 'schedule';
  }
  if (
    sourceType === 'playbook'
    || cardType === 'playbook'
    || /^playbook[-:_]/.test(parentId)
    || /攻略|sop|做法|注意事項|提醒|心得|技巧|加值|優先入場|meet\s*&?\s*greet|royal meet|royal society/.test(searchable)
  ) {
    return 'playbook';
  }
  return 'deckShow';
}

function buildSectionNarrativeParagraphsV4(sectionKey = 'deckShow', inventoryItems = []) {
  const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
  const sectionLead = {
    schedule: '先把和問題直接相關的行程與時段脈絡整理起來：',
    deckShow: '再看實際的甲板設施、服務與表演內容，重點可以這樣理解：',
    playbook: '最後把攻略卡片裡比較實戰的做法、提醒與小技巧整理如下：'
  }[sectionKey] || '';

  const summaryFacts = [];
  const supportFacts = [];
  const seen = new Set();
  const pushFact = (target, text) => {
    const safeText = sanitizeString(text, 420);
    const key = normalizeComparableQueryText(safeText);
    if (!safeText || !key || seen.has(key)) return;
    seen.add(key);
    target.push(safeText);
  };

  inventoryItems.forEach((item) => {
    const title = sanitizeString(item?.title, 120);
    const bullets = sanitizeTextArray(item?.detailBullets, 8, 220);
    const primaryFacts = bullets.slice(0, 2);
    const support = bullets.slice(2, 5);
    if (primaryFacts.length) {
      pushFact(summaryFacts, title ? `${title}：${primaryFacts.join('；')}` : primaryFacts.join('；'));
    } else if (title) {
      pushFact(summaryFacts, title);
    }
    if (support.length) {
      pushFact(supportFacts, title ? `${title}另外可以留意 ${support.join('；')}` : `另外可以留意 ${support.join('；')}`);
    }
  });

  const groupedParagraphs = [];
  const appendGroups = (facts, prefix = '', groupSize = 2) => {
    for (let index = 0; index < facts.length; index += groupSize) {
      const group = facts.slice(index, index + groupSize);
      const lead = index === 0 && prefix ? prefix : '';
      const paragraph = sanitizeString(`${lead}${group.join('。')}`.replace(/\s+/g, ' '), 1400);
      if (paragraph) groupedParagraphs.push(paragraph);
    }
  };

  appendGroups(summaryFacts, sectionLead, sectionKey === 'schedule' ? 3 : 2);
  appendGroups(supportFacts, groupedParagraphs.length ? '另外也可以一起留意：' : sectionLead, 2);

  if (groupedParagraphs.length) {
    return groupedParagraphs.slice(0, sectionKey === 'schedule' ? 3 : 4);
  }

  return meta.sectionSummary ? [meta.sectionSummary] : [];
}

function buildSectionNarrativesFromReportV4(report = {}, citationIds = []) {
  const fullCardInventory = Array.isArray(report?.fullCardInventory) ? report.fullCardInventory : [];
  const grouped = {
    schedule: [],
    deckShow: [],
    playbook: []
  };

  fullCardInventory.forEach((item) => {
    const cardType = sanitizeSourceType(item?.cardType || item?.sourceType);
    const sectionKey = inferSectionKeyFromInventoryItemV4(item);
    grouped[sectionKey].push({
      parentId: sanitizeString(item?.parentId, 120),
      title: sanitizeString(item?.title, 160),
      cardType,
      sourceLabels: sanitizeTextArray(item?.sourceLabels, 5, 60),
      detailBullets: sanitizeTextArray(item?.detailBullets, 8, 220),
      citationIds: uniqueItems((Array.isArray(item?.citationIds) ? item.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120))
        .filter((citationId) => !citationIds.length || citationIds.includes(citationId)))
        .slice(0, MAX_CHUNKS),
      renderOrigin: sanitizeString(item?.renderOrigin, 40) || 'backfill'
    });
  });

  const sections = LONGFORM_SECTION_ORDER_V4.map((sectionKey) => {
    const cards = grouped[sectionKey];
    if (!cards.length) return null;
    const meta = LONGFORM_SECTION_META_V4[sectionKey];
    return {
      sectionKey,
      sectionTitle: meta.sectionTitle,
      sectionSummary: meta.sectionSummary,
      narrativeParagraphs: buildSectionNarrativeParagraphsV4(sectionKey, cards),
      citationIds: uniqueItems(cards.flatMap((card) => card.citationIds || [])).slice(0, MAX_CHUNKS),
      renderOrigin: cards.some((card) => String(card?.renderOrigin || '').endsWith('backfill')) ? 'backfill' : 'model',
      cards
    };
  }).filter(Boolean);

  return {
    headline: sanitizeString(report?.headline, 120) || '站內攻略整理',
    introSummary: sanitizeString(
      (Array.isArray(report?.executiveSummary) ? report.executiveSummary[0] : '')
      || (Array.isArray(report?.recommendedPlan) ? report.recommendedPlan[0] : ''),
      360
    ),
    sections,
    sourceComparison: Array.isArray(report?.sourceComparison) ? report.sourceComparison : [],
    unansweredQuestions: sanitizeTextArray(report?.unansweredQuestions, 6, 180)
  };
}

function splitAiArticleDetailBucketsV5(detailBullets = []) {
  const buckets = {
    time: [],
    location: [],
    content: [],
    insight: [],
    caution: []
  };
  const timePattern = /^(時段|日期|時間|最佳時機|時段提示|開演前|集合時間|時機|day\s*\d+)/i;
  const locationPattern = /^(地點|位置|相關位置|樓層|甲板|Deck|場館|區域|船頭|船尾)/i;
  const cautionPattern = /^(注意事項|提醒|限制|風險|備註|避免踩雷|注意|限制提醒)/i;
  const insightPattern = /^(心得|亮點|旅程連結|這趟用途|建議做法|建議|適合|值得|玩法|加值|最順)/i;

  (Array.isArray(detailBullets) ? detailBullets : []).forEach((detail) => {
    const line = sanitizeString(detail, 220);
    if (!line) return;
    if (timePattern.test(line) || /(上午|下午|晚上|海上日|登船日|晚餐前|開演前|每次主秀|day\s*\d+)/i.test(line)) {
      buckets.time.push(line);
      return;
    }
    if (locationPattern.test(line) || /(deck\s*\d+|甲板|樓層|forward|aft|midship|劇院|酒廊|泳池|花園|餐廳)/i.test(line.toLowerCase())) {
      buckets.location.push(line);
      return;
    }
    if (cautionPattern.test(line) || /(注意|提醒|限制|風險|避免|踩雷|壓縮|錯過|晚到|以當晚通知為主|仍以)/i.test(line)) {
      buckets.caution.push(line);
      return;
    }
    if (insightPattern.test(line) || /(心得|亮點|旅程連結|適合|值得|加值|最順|推薦|這趟)/i.test(line)) {
      buckets.insight.push(line);
      return;
    }
    buckets.content.push(line);
  });

  return buckets;
}

function normalizeAiArticleFactTextV5(value = '') {
  return sanitizeString(value, 220)
    .replace(/^(時段|日期|時間|最佳時機|時段提示|開演前|集合時間|時機|地點|位置|相關位置|樓層|甲板|場館|區域|船頭|船尾|心得|亮點|旅程連結|這趟用途|建議做法|建議|適合|值得|玩法|加值|最順|注意事項|提醒|限制|風險|備註|避免踩雷|注意|限制提醒)\s*[：:]\s*/i, '')
    .trim();
}

function joinNarrativeTitlesV5(items = []) {
  const safeItems = uniqueItems((Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, 120))
    .filter(Boolean));
  if (!safeItems.length) return '';
  if (safeItems.length === 1) return safeItems[0];
  if (safeItems.length === 2) return `${safeItems[0]}和${safeItems[1]}`;
  return `${safeItems.slice(0, -1).join('、')}，以及${safeItems[safeItems.length - 1]}`;
}

function buildSectionNarrativeParagraphsV5(sectionKey = 'deckShow', inventoryItems = []) {
  const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
  const titles = [];
  const timeFacts = [];
  const locationFacts = [];
  const contentFacts = [];
  const insightFacts = [];
  const cautionFacts = [];
  const seenFacts = new Set();

  const pushFact = (target, value) => {
    const text = normalizeAiArticleFactTextV6(value);
    const key = normalizeComparableQueryText(text);
    if (!text || isAiNarrativeNoiseV6(text) || !key || seenFacts.has(key)) return;
    seenFacts.add(key);
    target.push(text);
  };

  const pushBucketFacts = (buckets = {}, maxItems = 3) => {
    sanitizeTextArray((buckets.time || []).map(normalizeAiArticleFactTextV6), maxItems, 220).forEach((item) => pushFact(timeFacts, item));
    sanitizeTextArray((buckets.location || []).map(normalizeAiArticleFactTextV6), maxItems, 220).forEach((item) => pushFact(locationFacts, item));
    sanitizeTextArray((buckets.content || []).map(normalizeAiArticleFactTextV6), maxItems, 220).forEach((item) => pushFact(contentFacts, item));
    sanitizeTextArray((buckets.insight || []).map(normalizeAiArticleFactTextV6), maxItems, 220).forEach((item) => pushFact(insightFacts, item));
    sanitizeTextArray((buckets.caution || []).map(normalizeAiArticleFactTextV6), maxItems, 220).forEach((item) => pushFact(cautionFacts, item));
  };

  (Array.isArray(inventoryItems) ? inventoryItems : []).forEach((item) => {
    const title = sanitizeString(item?.title, 120);
    if (title && !isAiNarrativeNoiseV6(title) && !titles.includes(title)) {
      titles.push(title);
    }
    const bullets = sanitizeTextArray(item?.detailBullets, 10, 220);
    if (bullets.length) {
      pushBucketFacts(splitAiArticleDetailBucketsV5(bullets));
    }
  });

  const titleLead = joinNarrativeTitlesV6(titles);
  const paragraphs = [];

  if (sectionKey === 'schedule') {
    const planningSentences = [];
    if (titleLead) {
      planningSentences.push(`和這題最相關的行程安排，主要圍繞 ${titleLead} 來串接。`);
    }
    if (timeFacts.length) {
      planningSentences.push(`排程上可以先抓 ${timeFacts.join('； ')}。`);
    }
    if (contentFacts.length) {
      planningSentences.push(contentFacts.slice(0, 2).join('； '));
    }
    if (planningSentences.length) {
      paragraphs.push(sanitizeString(planningSentences.join(' '), 1400));
    }

    const supportSentences = [];
    if (locationFacts.length) {
      supportSentences.push(`如果要對位置有概念，可以先記 ${locationFacts.join('； ')}。`);
    }
    if (insightFacts.length) {
      supportSentences.push(insightFacts.slice(0, 2).join('； '));
    }
    if (cautionFacts.length) {
      supportSentences.push(`時間安排上另外要留意 ${cautionFacts.join('； ')}。`);
    }
    if (supportSentences.length) {
      paragraphs.push(sanitizeString(supportSentences.join(' '), 1400));
    }
  } else if (sectionKey === 'deckShow') {
    const coreSentences = [];
    if (titleLead) {
      coreSentences.push(`和這題最直接相關的甲板設施與表演，重點集中在 ${titleLead}。`);
    }
    if (contentFacts.length) {
      coreSentences.push(contentFacts.slice(0, 3).join('； '));
    }
    if (coreSentences.length) {
      paragraphs.push(sanitizeString(coreSentences.join(' '), 1400));
    }

    const detailSentences = [];
    if (locationFacts.length) {
      detailSentences.push(`位置上可以先記 ${locationFacts.join('； ')}。`);
    }
    if (timeFacts.length) {
      detailSentences.push(`若要抓順序或時機，${timeFacts.join('； ')}。`);
    }
    if (detailSentences.length) {
      paragraphs.push(sanitizeString(detailSentences.join(' '), 1400));
    }

    const supportSentences = [];
    if (insightFacts.length) {
      supportSentences.push(insightFacts.slice(0, 2).join('； '));
    }
    if (cautionFacts.length) {
      supportSentences.push(`實際使用時要注意 ${cautionFacts.join('； ')}。`);
    }
    if (supportSentences.length) {
      paragraphs.push(sanitizeString(supportSentences.join(' '), 1400));
    }
  } else {
    const guideSentences = [];
    if (titleLead) {
      guideSentences.push(`攻略與實戰心得主要集中在 ${titleLead}。`);
    }
    if (insightFacts.length) {
      guideSentences.push(insightFacts.slice(0, 3).join('； '));
    } else if (contentFacts.length) {
      guideSentences.push(contentFacts.slice(0, 2).join('； '));
    }
    if (guideSentences.length) {
      paragraphs.push(sanitizeString(guideSentences.join(' '), 1400));
    }

    const methodSentences = [];
    if (timeFacts.length) {
      methodSentences.push(`如果要抓使用時機，可以先看 ${timeFacts.join('； ')}。`);
    }
    if (locationFacts.length) {
      methodSentences.push(`搭配位置資訊來看，${locationFacts.join('； ')}。`);
    }
    if (contentFacts.length && insightFacts.length) {
      methodSentences.push(contentFacts.slice(0, 2).join('； '));
    }
    if (methodSentences.length) {
      paragraphs.push(sanitizeString(methodSentences.join(' '), 1400));
    }

    if (cautionFacts.length) {
      paragraphs.push(sanitizeString(`最後要留意 ${cautionFacts.join('； ')}。`, 1400));
    }
  }

  const sanitizedParagraphs = sanitizeTextArray(paragraphs, sectionKey === 'schedule' ? 2 : 4, 1400);
  if (sanitizedParagraphs.length) {
    return sanitizedParagraphs;
  }
  return meta.sectionSummary ? [meta.sectionSummary] : [];
}

function buildSectionNarrativesFromReportV5(report = {}, citationIds = []) {
  const fallback = buildSectionNarrativesFromReportV4(report, citationIds);
  return {
    ...fallback,
    sections: LONGFORM_SECTION_ORDER_V4.map((sectionKey) => {
      const section = Array.isArray(fallback.sections)
        ? fallback.sections.find((item) => item.sectionKey === sectionKey)
        : null;
      if (!section) return null;
      return {
        ...section,
        narrativeParagraphs: buildSectionNarrativeParagraphsV9(sectionKey, Array.isArray(section.cards) ? section.cards : [])
      };
    }).filter(Boolean)
  };
}

function buildSectionNarrativesFromSectionDossiersV5(sectionDossiers = [], citationIds = []) {
  const safeSections = sanitizeSectionDossiers(sectionDossiers);
  const sections = LONGFORM_SECTION_ORDER_V4.map((sectionKey) => {
    const sourceSection = safeSections.find((section) => section.sectionKey === sectionKey);
    if (!sourceSection || !Array.isArray(sourceSection.cards) || !sourceSection.cards.length) return null;

    const cards = sourceSection.cards.map((card) => ({
      parentId: sanitizeString(card?.parentId, 120),
      title: sanitizeString(card?.title, 160),
      cardType: sanitizeString(card?.cardType, 40) || (sectionKey === 'playbook' ? 'playbook' : (sectionKey === 'schedule' ? 'schedule' : 'deck')),
      sourceLabels: sanitizeTextArray(card?.sourceLabels, 5, 60),
      detailBullets: sanitizeTextArray(card?.detailBullets, 10, 220),
      citationIds: uniqueItems((Array.isArray(card?.citationIds) ? card.citationIds : [])
        .map((citationId) => sanitizeString(citationId, 120))
        .filter((citationId) => !citationIds.length || citationIds.includes(citationId))).slice(0, MAX_CHUNKS),
      renderOrigin: 'backfill'
    }));
    const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
    const sectionCitationIds = uniqueItems(cards.flatMap((card) => card.citationIds || [])).slice(0, MAX_CHUNKS);
    return {
      sectionKey,
      sectionTitle: sanitizeString(sourceSection.sectionTitle, 120) || meta.sectionTitle,
      sectionSummary: meta.sectionSummary,
      narrativeParagraphs: buildSectionNarrativeParagraphsV9(sectionKey, cards),
      citationIds: sectionCitationIds,
      renderOrigin: 'backfill',
      cards
    };
  }).filter(Boolean);

  return {
    headline: '站內資料整合攻略',
    introSummary: '',
    sections,
    sourceComparison: [],
    unansweredQuestions: []
  };
}

function normalizeAiArticleFactTextV6(value = '') {
  return sanitizeString(value, 220)
    .replace(/^(時段|日期|時間|時間\s*\/\s*時段|最佳時機|時段提示|開演前|集合時間|時機|地點|位置|相關位置|樓層|甲板|場館|區域|船頭|船尾|心得|亮點|旅程連結|這趟用途|建議做法|建議|適合|值得|玩法|加值|最順|注意事項|提醒|限制|風險|備註|避免踩雷|注意|限制提醒|行程重點|活動標籤|目的|節奏判斷|點心補給|重點摘要|適用時機)\s*[：:]\s*/i, '')
    .replace(/\s*[|｜]\s*/g, '，')
    .replace(/\s*\/\s*/g, '／')
    .replace(/[?？]{2,}/g, ' ')
    .trim();
}

function isAiNarrativeNoiseV6(text = '') {
  const normalized = sanitizeString(text, 220).trim();
  if (!normalized) return true;
  if (normalized.length <= 2) return true;
  if (/^(day\s*\d+|deck\s*\d+)$/i.test(normalized)) return true;
  if (/^(行程重點|活動標籤|時間|日期|地點|位置|樓層|甲板|注意事項|提醒|限制)$/i.test(normalized)) return true;
  return false;
}

function joinNarrativeTitlesV6(items = []) {
  const safeItems = uniqueItems((Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, 120))
    .filter((item) => item && !isAiNarrativeNoiseV6(item)));
  if (!safeItems.length) return '';
  if (safeItems.length === 1) return safeItems[0];
  if (safeItems.length === 2) return `${safeItems[0]}和${safeItems[1]}`;
  if (safeItems.length > 3) return `${safeItems.slice(0, 2).join('、')}等重點`;
  return `${safeItems.slice(0, -1).join('、')}，以及${safeItems[safeItems.length - 1]}`;
}

function buildSectionNarrativeParagraphsV6(sectionKey = 'deckShow', inventoryItems = []) {
  const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
  const titles = [];
  const timeFacts = [];
  const locationFacts = [];
  const contentFacts = [];
  const insightFacts = [];
  const cautionFacts = [];
  const seenFacts = new Set();

  const pushFact = (target, value) => {
    const text = sanitizeString(value, 420);
    const key = normalizeComparableQueryText(text);
    if (!text || !key || seenFacts.has(key)) return;
    seenFacts.add(key);
    target.push(text);
  };

  const pushBucketFacts = (buckets = {}, maxItems = 3) => {
    sanitizeTextArray((buckets.time || []).map(normalizeAiArticleFactTextV5), maxItems, 220).forEach((item) => pushFact(timeFacts, item));
    sanitizeTextArray((buckets.location || []).map(normalizeAiArticleFactTextV5), maxItems, 220).forEach((item) => pushFact(locationFacts, item));
    sanitizeTextArray((buckets.content || []).map(normalizeAiArticleFactTextV5), maxItems, 220).forEach((item) => pushFact(contentFacts, item));
    sanitizeTextArray((buckets.insight || []).map(normalizeAiArticleFactTextV5), maxItems, 220).forEach((item) => pushFact(insightFacts, item));
    sanitizeTextArray((buckets.caution || []).map(normalizeAiArticleFactTextV5), maxItems, 220).forEach((item) => pushFact(cautionFacts, item));
  };

  (Array.isArray(inventoryItems) ? inventoryItems : []).forEach((item) => {
    const title = sanitizeString(item?.title, 120);
    if (title && !titles.includes(title)) {
      titles.push(title);
    }
    const bullets = sanitizeTextArray(item?.detailBullets, 10, 220);
    if (bullets.length) {
      pushBucketFacts(splitAiArticleDetailBucketsV5(bullets));
    }
  });

  const titleLead = joinNarrativeTitlesV5(titles);
  const paragraphs = [];

  if (sectionKey === 'schedule') {
    const planningSentences = [];
    if (titleLead) {
      planningSentences.push(`如果你是為了這題安排整體節奏，最值得先留意的是 ${titleLead} 這幾段行程怎麼串在一起。`);
    }
    if (timeFacts.length) {
      planningSentences.push(`排程上可以先抓 ${timeFacts.join('； ')}。`);
    }
    if (contentFacts.length) {
      planningSentences.push(contentFacts.slice(0, 2).join('； '));
    }
    if (planningSentences.length) {
      paragraphs.push(sanitizeString(planningSentences.join(' '), 1400));
    }

    const supportSentences = [];
    if (locationFacts.length) {
      supportSentences.push(`如果要把移動路線想清楚，可以先記 ${locationFacts.join('； ')}。`);
    }
    if (insightFacts.length) {
      supportSentences.push(insightFacts.slice(0, 2).join('； '));
    }
    if (cautionFacts.length) {
      supportSentences.push(`實際排程時另外要留意 ${cautionFacts.join('； ')}。`);
    }
    if (supportSentences.length) {
      paragraphs.push(sanitizeString(supportSentences.join(' '), 1400));
    }
  } else if (sectionKey === 'deckShow') {
    const coreSentences = [];
    if (titleLead) {
      coreSentences.push(`就設施與表演本體來看，最值得先掌握的是 ${titleLead} 這幾個重點。`);
    }
    if (contentFacts.length) {
      coreSentences.push(contentFacts.slice(0, 3).join('； '));
    }
    if (coreSentences.length) {
      paragraphs.push(sanitizeString(coreSentences.join(' '), 1400));
    }

    const detailSentences = [];
    if (locationFacts.length) {
      detailSentences.push(`先把位置記熟會更容易規劃動線，像是 ${locationFacts.join('； ')}。`);
    }
    if (timeFacts.length) {
      detailSentences.push(`如果要抓順序或使用時機，可以先看 ${timeFacts.join('； ')}。`);
    }
    if (detailSentences.length) {
      paragraphs.push(sanitizeString(detailSentences.join(' '), 1400));
    }

    const supportSentences = [];
    if (insightFacts.length) {
      supportSentences.push(insightFacts.slice(0, 2).join('； '));
    }
    if (cautionFacts.length) {
      supportSentences.push(`實際去用時，最容易影響體驗的是 ${cautionFacts.join('； ')}。`);
    }
    if (supportSentences.length) {
      paragraphs.push(sanitizeString(supportSentences.join(' '), 1400));
    }
  } else {
    const guideSentences = [];
    if (titleLead) {
      guideSentences.push(`真正讓行程更順的做法，主要集中在 ${titleLead} 這些攻略重點。`);
    }
    if (insightFacts.length) {
      guideSentences.push(insightFacts.slice(0, 3).join('； '));
    } else if (contentFacts.length) {
      guideSentences.push(contentFacts.slice(0, 2).join('； '));
    }
    if (guideSentences.length) {
      paragraphs.push(sanitizeString(guideSentences.join(' '), 1400));
    }

    const methodSentences = [];
    if (timeFacts.length) {
      methodSentences.push(`如果要抓最佳使用時機，可以先看 ${timeFacts.join('； ')}。`);
    }
    if (locationFacts.length) {
      methodSentences.push(`搭配位置一起看，會更知道什麼時候該切過去，像是 ${locationFacts.join('； ')}。`);
    }
    if (contentFacts.length && insightFacts.length) {
      methodSentences.push(contentFacts.slice(0, 2).join('； '));
    }
    if (methodSentences.length) {
      paragraphs.push(sanitizeString(methodSentences.join(' '), 1400));
    }

    if (cautionFacts.length) {
      paragraphs.push(sanitizeString(`最後要留意 ${cautionFacts.join('； ')}。`, 1400));
    }
  }

  const sanitizedParagraphs = sanitizeTextArray(paragraphs, sectionKey === 'schedule' ? 2 : 4, 1400);
  if (sanitizedParagraphs.length) {
    return sanitizedParagraphs;
  }
  return meta.sectionSummary ? [meta.sectionSummary] : [];
}

function normalizeAiArticleFactTextV7(value = '') {
  return sanitizeString(value, 220)
    .replace(/^(時段|日期|時間|時間\s*\/\s*時段|最佳時機|時段提示|開演前|集合時間|時機|地點|位置|相關位置|樓層|甲板|場館|區域|船頭|船尾|心得|亮點|旅程連結|這趟用途|建議做法|建議|適合|值得|玩法|加值|最順|注意事項|提醒|限制|風險|備註|避免踩雷|注意|限制提醒|行程重點|活動標籤|目的|節奏判斷|點心補給|重點摘要|適用時機)\s*[：:]\s*/i, '')
    .replace(/\s*[|｜]\s*/g, '，')
    .replace(/\s*\/\s*/g, '／')
    .replace(/[?？]{2,}/g, ' ')
    .trim();
}

function isAiNarrativeNoiseV7(text = '') {
  const normalized = sanitizeString(text, 220).trim();
  if (!normalized) return true;
  if (normalized.length <= 2) return true;
  if (/^(day\s*\d+|deck\s*\d+)$/i.test(normalized)) return true;
  if (/^(行程重點|活動標籤|時間|日期|地點|位置|樓層|甲板|注意事項|提醒|限制)$/i.test(normalized)) return true;
  if ((normalized.match(/[、；]/g) || []).length >= 4 && /(deck\s*\d+|day\s*\d+|登船|海上|下船)/i.test(normalized)) return true;
  return false;
}

function condenseAiNarrativeFactV7(text = '', maxClauses = 2) {
  const normalized = normalizeAiArticleFactTextV7(text);
  if (!normalized) return '';
  const clauses = normalized
    .split(/[；。]/)
    .map((item) => sanitizeString(item, 220).trim())
    .filter(Boolean);
  if (!clauses.length) return '';
  return sanitizeString(clauses.slice(0, maxClauses).join('，'), 220);
}

function joinNarrativeTitlesV7(items = []) {
  const safeItems = uniqueItems((Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, 120))
    .filter((item) => item && !isAiNarrativeNoiseV7(item)));
  if (!safeItems.length) return '';
  if (safeItems.length === 1) return safeItems[0];
  if (safeItems.length === 2) return `${safeItems[0]}和${safeItems[1]}`;
  if (safeItems.length > 3) return `${safeItems.slice(0, 2).join('、')}等重點`;
  return `${safeItems.slice(0, -1).join('、')}，以及${safeItems[safeItems.length - 1]}`;
}

function collectSectionMaterialFactsV8(inventoryItems = []) {
  const titles = [];
  const timeFacts = [];
  const locationFacts = [];
  const contentFacts = [];
  const insightFacts = [];
  const cautionFacts = [];
  const seenFacts = new Set();

  const pushFact = (target, value) => {
    const text = condenseAiNarrativeFactV7(value);
    const key = normalizeComparableQueryText(text);
    if (!text || isAiNarrativeNoiseV7(text) || !key || seenFacts.has(key)) return;
    seenFacts.add(key);
    target.push(text);
  };

  const pushBucketFacts = (buckets = {}, maxItems = 3) => {
    sanitizeTextArray((buckets.time || []).map(normalizeAiArticleFactTextV7), maxItems, 220).forEach((item) => pushFact(timeFacts, item));
    sanitizeTextArray((buckets.location || []).map(normalizeAiArticleFactTextV7), maxItems, 220).forEach((item) => pushFact(locationFacts, item));
    sanitizeTextArray((buckets.content || []).map(normalizeAiArticleFactTextV7), maxItems, 220).forEach((item) => pushFact(contentFacts, item));
    sanitizeTextArray((buckets.insight || []).map(normalizeAiArticleFactTextV7), maxItems, 220).forEach((item) => pushFact(insightFacts, item));
    sanitizeTextArray((buckets.caution || []).map(normalizeAiArticleFactTextV7), maxItems, 220).forEach((item) => pushFact(cautionFacts, item));
  };

  (Array.isArray(inventoryItems) ? inventoryItems : []).forEach((item) => {
    const title = sanitizeString(item?.title, 120);
    if (title && !isAiNarrativeNoiseV7(title) && !titles.includes(title)) {
      titles.push(title);
    }
    const bullets = sanitizeTextArray(item?.detailBullets, 10, 220);
    if (bullets.length) {
      pushBucketFacts(splitAiArticleDetailBucketsV5(bullets));
    }
  });

  return {
    titles,
    timeFacts,
    locationFacts,
    contentFacts,
    insightFacts,
    cautionFacts
  };
}

function buildSectionNarrativeParagraphsV7(sectionKey = 'deckShow', inventoryItems = []) {
  const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
  const {
    titles,
    timeFacts,
    locationFacts,
    contentFacts,
    insightFacts,
    cautionFacts
  } = collectSectionMaterialFactsV8(inventoryItems);

  const titleLead = joinNarrativeTitlesV7(titles);
  const paragraphs = [];
  const takeFacts = (items, maxItems = 2) => sanitizeTextArray(items, maxItems, 220)
    .map((item) => sanitizeString(item, 220).trim())
    .filter((item) => item && !isAiNarrativeNoiseV7(item));
  const joinGuideFacts = (items, maxItems = 2) => {
    const picked = takeFacts(items, maxItems);
    if (!picked.length) return '';
    if (picked.length === 1) return picked[0];
    if (picked.length === 2) return `${picked[0]}，也可以順手處理 ${picked[1]}`;
    return `${picked[0]}，再搭配 ${picked[1]}，最後留意 ${picked[2]}`;
  };
  const pushParagraph = (sentences = []) => {
    const paragraph = sanitizeString(
      (Array.isArray(sentences) ? sentences : [])
        .map((item) => sanitizeString(item, 1400).trim())
        .filter(Boolean)
        .join(' '),
      1400
    ).trim();
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  };

  if (sectionKey === 'schedule') {
    pushParagraph([
      titleLead ? `如果你是為了把這題的節奏排順，先把 ${titleLead} 當成主要安排順序。` : '',
      timeFacts.length ? `排程上最值得先抓的是 ${joinGuideFacts(timeFacts)}。` : '',
      contentFacts.length ? `把 ${joinGuideFacts(contentFacts)} 串起來看，整體節奏會更清楚。` : ''
    ]);

    pushParagraph([
      locationFacts.length ? `移動路線上可以先記 ${joinGuideFacts(locationFacts)}。` : '',
      insightFacts.length ? `實際執行時，${joinGuideFacts(insightFacts)}。` : '',
      cautionFacts.length ? `另外要避開的點是 ${joinGuideFacts(cautionFacts)}。` : ''
    ]);
  } else if (sectionKey === 'deckShow') {
    pushParagraph([
      titleLead ? `就設施與表演本體來看，先認識 ${titleLead} 這幾個重點最有幫助。` : '',
      contentFacts.length ? `真正能用上的內容，重點是 ${joinGuideFacts(contentFacts, 3)}。` : '',
      locationFacts.length ? `位置上主要會落在 ${joinGuideFacts(locationFacts)}。` : ''
    ]);

    pushParagraph([
      timeFacts.length ? `如果要抓什麼時候去最順，可以先看 ${joinGuideFacts(timeFacts)}。` : '',
      insightFacts.length ? `比較值得提前知道的是 ${joinGuideFacts(insightFacts)}。` : '',
      cautionFacts.length ? `實際去用時要特別留意 ${joinGuideFacts(cautionFacts)}。` : ''
    ]);
  } else {
    pushParagraph([
      titleLead ? `如果把這題整理成一版真的好執行的攻略，先抓 ${titleLead} 這幾個重點就夠用了。` : '',
      insightFacts.length ? `比較有幫助的做法是 ${joinGuideFacts(insightFacts, 3)}。` : '',
      !insightFacts.length && contentFacts.length ? `可以先記 ${joinGuideFacts(contentFacts)}。` : ''
    ]);

    pushParagraph([
      timeFacts.length ? `排進行程時，${joinGuideFacts(timeFacts)} 會比較順。` : '',
      locationFacts.length ? `切換位置或動線時，也可以一起記 ${joinGuideFacts(locationFacts)}。` : '',
      cautionFacts.length ? `最後最容易被忽略的是 ${joinGuideFacts(cautionFacts)}。` : ''
    ]);
  }

  const sanitizedParagraphs = sanitizeTextArray(paragraphs, sectionKey === 'schedule' ? 2 : 3, 1400);
  if (sanitizedParagraphs.length) {
    return sanitizedParagraphs;
  }
  return meta.sectionSummary ? [meta.sectionSummary] : [];
}

function buildSectionNarrativeParagraphsV8(sectionKey = 'deckShow', inventoryItems = []) {
  const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
  const {
    titles,
    timeFacts,
    locationFacts,
    contentFacts,
    insightFacts,
    cautionFacts
  } = collectSectionMaterialFactsV8(inventoryItems);

  const paragraphs = [];
  const takeFacts = (items, maxItems = 2) => sanitizeTextArray(items, maxItems, 220)
    .map((item) => sanitizeString(item, 220).trim())
    .filter((item) => item && !isAiNarrativeNoiseV7(item));
  const joinFacts = (items, maxItems = 2) => {
    const picked = takeFacts(items, maxItems);
    if (!picked.length) return '';
    if (picked.length === 1) return picked[0];
    if (picked.length === 2) return `${picked[0]}，也可以順手留意 ${picked[1]}`;
    return `${picked[0]}、${picked[1]}，以及 ${picked[2]}`;
  };
  const joinTitles = (items, maxItems = 3) => {
    const picked = sanitizeTextArray(items, maxItems, 120)
      .map((item) => sanitizeString(item, 120).trim())
      .filter((item) => item && !isAiNarrativeNoiseV7(item));
    if (!picked.length) return '';
    if (picked.length === 1) return picked[0];
    if (picked.length === 2) return `${picked[0]}和${picked[1]}`;
    return `${picked.slice(0, -1).join('、')}，以及${picked[picked.length - 1]}`;
  };
  const pushParagraph = (sentences = []) => {
    const paragraph = sanitizeString(
      (Array.isArray(sentences) ? sentences : [])
        .map((item) => sanitizeString(item, 1400).trim())
        .filter(Boolean)
        .join(' '),
      1400
    ).trim();
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  };

  const titleLead = joinTitles(titles);

  if (sectionKey === 'schedule') {
    pushParagraph([
      timeFacts.length ? `先看排程的話，最值得先抓的是 ${joinFacts(timeFacts, 3)}。` : '',
      contentFacts.length ? `這段時間通常會穿插 ${joinFacts(contentFacts, 2)}，所以安排行程時可以把它當成節奏線索。` : '',
      titleLead ? `如果你看到像 ${titleLead} 這幾段安排，通常代表這題相關的活動就是沿著這個順序串起來的。` : ''
    ]);

    pushParagraph([
      locationFacts.length ? `動線上則可以一起記住 ${joinFacts(locationFacts, 2)}，這樣在切換場地時比較不會亂。` : '',
      insightFacts.length ? `實際安排時，${joinFacts(insightFacts, 2)} 這些節奏判斷通常最有幫助。` : '',
      cautionFacts.length ? `如果要少踩雷，最後再提醒自己 ${joinFacts(cautionFacts, 2)}。` : ''
    ]);
  } else if (sectionKey === 'deckShow') {
    pushParagraph([
      titleLead ? `真正和這題最相關的甲板設施、服務或表演，會集中在 ${titleLead} 這幾個主體。` : '',
      contentFacts.length ? `把它們放在一起看時，核心內容大致就是 ${joinFacts(contentFacts, 3)}。` : '',
      locationFacts.length ? `位置上多半會落在 ${joinFacts(locationFacts, 2)}，先有這個概念，現場會比較好找。` : ''
    ]);

    pushParagraph([
      timeFacts.length ? `如果想把體驗排順，通常可以抓 ${joinFacts(timeFacts, 2)} 這些時段。` : '',
      insightFacts.length ? `實際玩起來比較有感的地方，往往是 ${joinFacts(insightFacts, 2)}。` : '',
      cautionFacts.length ? `要避免現場手忙腳亂，記得留意 ${joinFacts(cautionFacts, 2)}。` : ''
    ]);
  } else {
    pushParagraph([
      titleLead ? `如果把攻略卡放在一起看，${titleLead} 這幾張最能回答這題。` : '',
      insightFacts.length ? `它們比較像旅伴會提醒你的重點，像是 ${joinFacts(insightFacts, 3)}。` : '',
      !insightFacts.length && contentFacts.length ? `整理後最實用的做法通常是 ${joinFacts(contentFacts, 2)}。` : ''
    ]);

    pushParagraph([
      contentFacts.length ? `具體做法可以從 ${joinFacts(contentFacts, 2)} 開始照著排。` : '',
      timeFacts.length ? `如果要抓節奏，${joinFacts(timeFacts, 2)} 這類時機通常最值得優先記。` : '',
      cautionFacts.length ? `另外也別忽略 ${joinFacts(cautionFacts, 2)} 這些提醒，通常就是現場最容易出狀況的地方。` : ''
    ]);
  }

  const sanitizedParagraphs = sanitizeTextArray(paragraphs, sectionKey === 'schedule' ? 2 : 3, 1400);
  if (sanitizedParagraphs.length) {
    return sanitizedParagraphs;
  }
  return meta.sectionSummary ? [meta.sectionSummary] : [];
}

function buildSectionNarrativeParagraphsV9(sectionKey = 'deckShow', inventoryItems = []) {
  const meta = LONGFORM_SECTION_META_V4[sectionKey] || LONGFORM_SECTION_META_V4.deckShow;
  const cards = (Array.isArray(inventoryItems) ? inventoryItems : [])
    .map((item) => ({
      title: sanitizeString(item?.title, 120).trim(),
      detailBullets: sanitizeTextArray(item?.detailBullets, 6, 200)
        .map((bullet) => sanitizeString(bullet, 200).trim())
        .filter((bullet) => bullet && !isAiNarrativeNoiseV7(bullet))
    }))
    .filter((item) => item.title || item.detailBullets.length);
  const {
    timeFacts,
    contentFacts,
    insightFacts,
    cautionFacts
  } = collectSectionMaterialFactsV8(cards);

  const takeFacts = (items, maxItems = 2) => sanitizeTextArray(items, maxItems, 220)
    .map((item) => sanitizeString(item, 220).trim())
    .filter((item) => item && !isAiNarrativeNoiseV7(item));
  const joinFacts = (items, maxItems = 2) => {
    const picked = takeFacts(items, maxItems);
    if (!picked.length) return '';
    if (picked.length === 1) return picked[0];
    if (picked.length === 2) return `${picked[0]}，再加上 ${picked[1]}`;
    return `${picked[0]}、${picked[1]}，以及 ${picked[2]}`;
  };
  const describeCard = (card, index = 0) => {
    if (!card) return '';
    const bullets = sanitizeTextArray(card.detailBullets, 2, 180);
    if (!card.title && !bullets.length) return '';
    if (!bullets.length) {
      return index === 0
        ? `${card.title} 會是這段最值得先抓的主體。`
        : `${card.title} 也可以一起放進這段安排裡。`;
    }
    if (index === 0) {
      return `先把重點放在 ${card.title}，${bullets.join('，')}。`;
    }
    return `接著可以把 ${card.title} 串進來，${bullets.join('，')}。`;
  };
  const pushParagraph = (target, sentences = []) => {
    const paragraph = sanitizeString(
      (Array.isArray(sentences) ? sentences : [])
        .map((item) => sanitizeString(item, 1400).trim())
        .filter(Boolean)
        .join(' '),
      1400
    ).trim();
    if (paragraph) {
      target.push(paragraph);
    }
  };

  const paragraphs = [];
  const firstCard = cards[0] || null;
  const secondCard = cards[1] || null;
  const thirdCard = cards[2] || null;

  if (sectionKey === 'schedule') {
    pushParagraph(paragraphs, [
      timeFacts.length ? `排程上先抓 ${joinFacts(timeFacts, 3)} 這條主線，最容易看懂這題的節奏。` : '',
      describeCard(firstCard, 0),
      secondCard ? describeCard(secondCard, 1) : ''
    ]);

    pushParagraph(paragraphs, [
      contentFacts.length ? `如果要把安排串得更順，可以把 ${joinFacts(contentFacts, 2)} 一起放進同一段動線裡。` : '',
      insightFacts.length ? `實際排起來時，${joinFacts(insightFacts, 2)} 這種節奏判斷通常最有幫助。` : '',
      cautionFacts.length ? `最後別忘了 ${joinFacts(cautionFacts, 2)}，這通常就是最容易忽略的提醒。` : ''
    ]);
  } else if (sectionKey === 'deckShow') {
    pushParagraph(paragraphs, [
      describeCard(firstCard, 0),
      secondCard ? describeCard(secondCard, 1) : '',
      thirdCard ? describeCard(thirdCard, 2) : ''
    ]);

    pushParagraph(paragraphs, [
      timeFacts.length ? `如果想把體驗排順，通常可以抓 ${joinFacts(timeFacts, 2)} 這些時段。` : '',
      contentFacts.length ? `把這幾張資料放在一起看時，最值得留意的共通點其實是 ${joinFacts(contentFacts, 2)}。` : '',
      cautionFacts.length ? `現場最實用的提醒則是 ${joinFacts(cautionFacts, 2)}。` : ''
    ]);
  } else {
    pushParagraph(paragraphs, [
      describeCard(firstCard, 0),
      secondCard ? describeCard(secondCard, 1) : '',
      thirdCard ? describeCard(thirdCard, 2) : ''
    ]);

    pushParagraph(paragraphs, [
      insightFacts.length ? `如果只記幾個真正有用的小技巧，通常會是 ${joinFacts(insightFacts, 3)}。` : '',
      contentFacts.length ? `換成實際操作時，可以優先照著 ${joinFacts(contentFacts, 2)} 去安排。` : '',
      cautionFacts.length ? `另外也別忽略 ${joinFacts(cautionFacts, 2)}，這些通常就是最容易出錯的地方。` : ''
    ]);
  }

  const sanitizedParagraphs = sanitizeTextArray(paragraphs, sectionKey === 'schedule' ? 2 : 3, 1400);
  if (sanitizedParagraphs.length) {
    return sanitizedParagraphs;
  }
  return meta.sectionSummary ? [meta.sectionSummary] : [];
}

const buildFallbackReportCoverageV4Base = buildFallbackReport;
function buildFallbackReportCoverageV4(options = {}) {
  const report = buildFallbackReportCoverageV4Base(options);
  const fallbackInventory = buildFullCardInventoryFromParentBriefs(
    options.parentBriefs || options.parentDossiers || [],
    options.citationIds || []
  );
  if (fallbackInventory.length) {
    report.fullCardInventory = uniqueBy(
      [
        ...(Array.isArray(report.fullCardInventory) ? report.fullCardInventory : []),
        ...fallbackInventory
      ],
      (item) => sanitizeString(item?.parentId, 120) || sanitizeString(item?.title, 160)
    );
  }
  const dossierArticle = buildSectionNarrativesFromSectionDossiersV5(options.sectionDossiers || [], options.citationIds || []);
  const reportArticle = buildSectionNarrativesFromReportV5(report, options.citationIds || []);
  report.longformArticle = reportArticle.sections?.length ? reportArticle : dossierArticle;
  return report;
}

const normalizeReportObjectCoverageV4Base = normalizeReportObject;
function normalizeReportObjectCoverageV4(report, citationIds, chunks, answer, sections, sourceBreakdown, followUpHint, missingReason, options = {}) {
  const normalized = normalizeReportObjectCoverageV4Base(
    report,
    citationIds,
    chunks,
    answer,
    sections,
    sourceBreakdown,
    followUpHint,
    missingReason,
    options
  );

  const dossierArticle = buildSectionNarrativesFromSectionDossiersV5(options.sectionDossiers || [], citationIds);
  const fallbackArticle = buildSectionNarrativesFromReportV5(normalized, citationIds);
  const mergedFallbackArticle = fallbackArticle.sections?.length ? fallbackArticle : dossierArticle;
  const safeArticle = report && typeof report === 'object' && report.longformArticle && typeof report.longformArticle === 'object'
    ? report.longformArticle
    : {};

  normalized.longformArticle = {
    headline: sanitizeString(safeArticle.headline, 120) || mergedFallbackArticle.headline,
    introSummary: sanitizeString(safeArticle.introSummary, 360) || mergedFallbackArticle.introSummary,
    sections: LONGFORM_SECTION_ORDER_V4.map((sectionKey) => {
      const fallbackSection = (mergedFallbackArticle.sections || []).find((section) => section.sectionKey === sectionKey);
      const modelSection = Array.isArray(safeArticle.sections)
        ? safeArticle.sections.find((section) => sanitizeString(section?.sectionKey, 40) === sectionKey)
        : null;
      if (!fallbackSection && !modelSection) return null;
      return {
        sectionKey,
        sectionTitle: sanitizeString(modelSection?.sectionTitle, 120) || fallbackSection?.sectionTitle || LONGFORM_SECTION_META_V4[sectionKey].sectionTitle,
        sectionSummary: sanitizeString(modelSection?.sectionSummary, 260) || fallbackSection?.sectionSummary || LONGFORM_SECTION_META_V4[sectionKey].sectionSummary,
        narrativeParagraphs: sanitizeTextArray(modelSection?.narrativeParagraphs, 5, 1400).length
          ? sanitizeTextArray(modelSection?.narrativeParagraphs, 5, 1400)
          : (fallbackSection?.narrativeParagraphs || []),
        citationIds: uniqueItems([
          ...(Array.isArray(modelSection?.citationIds) ? modelSection.citationIds : []),
          ...((fallbackSection?.citationIds || []))
        ]).slice(0, MAX_CHUNKS),
        renderOrigin: sanitizeString(modelSection?.renderOrigin, 40) || fallbackSection?.renderOrigin || 'backfill',
        cards: uniqueBy(
          [
            ...(Array.isArray(modelSection?.cards) ? modelSection.cards : []),
            ...(Array.isArray(fallbackSection?.cards) ? fallbackSection.cards : [])
          ],
          (card) => sanitizeString(card?.parentId, 120) || sanitizeString(card?.title, 160)
        )
      };
    }).filter(Boolean),
    sourceComparison: Array.isArray(safeArticle.sourceComparison) && safeArticle.sourceComparison.length
      ? safeArticle.sourceComparison
      : (Array.isArray(normalized.sourceComparison) ? normalized.sourceComparison : []),
    unansweredQuestions: sanitizeTextArray(
      Array.isArray(safeArticle.unansweredQuestions) && safeArticle.unansweredQuestions.length
        ? safeArticle.unansweredQuestions
        : normalized.unansweredQuestions,
      6,
      180
    )
  };

  return normalized;
}

buildFallbackReport = buildFallbackReportCoverageV4;
normalizeReportObject = normalizeReportObjectCoverageV4;
buildCoverageSummaryFromInventory = buildCoverageSummaryFromInventoryV4;
buildCoverageOutline = buildCoverageOutlineV4;
buildAnalysisPlanText = buildAnalysisPlanTextV3;
buildAnalysisPlanTextV2 = buildAnalysisPlanTextV4;

function buildAnalysisPlanText(analysisPlan) {
  if (!analysisPlan || typeof analysisPlan !== 'object') return '未提供額外分析計畫。';

  const facetSummary = analysisPlan.facetSummary || {};
  const facetLines = [
    ['goal', facetSummary.goal],
    ['time', facetSummary.time],
    ['entity/place', facetSummary.entityPlace],
    ['audience', facetSummary.audience],
    ['risk', facetSummary.risk],
    ['alternatives', facetSummary.alternatives]
  ]
    .filter(([, values]) => Array.isArray(values) && values.length)
    .map(([label, values]) => `- ${label}: ${values.join('、')}`);

  return [
    `responseMode: ${analysisPlan.responseMode || 'compact'}`,
    `intentType: ${analysisPlan.intentType || 'operational-detail'}`,
    `activeFacetNames: ${(analysisPlan.activeFacetNames || []).join('、') || '未提供'}`,
    `triggerReasons: ${(analysisPlan.triggerReasons || []).join('、') || '未提供'}`,
    `isComparisonQuery: ${analysisPlan.isComparisonQuery ? 'true' : 'false'}`,
    `hasRiskJudgment: ${analysisPlan.hasRiskJudgment ? 'true' : 'false'}`,
    `needsSourceComparison: ${analysisPlan.needsSourceComparison ? 'true' : 'false'}`,
    `rewriteTriggered: ${analysisPlan.rewriteTriggered ? 'true' : 'false'}`,
    `evidenceBudget: ${analysisPlan.evidenceBudget || 0}`,
    `maxParentCards: ${analysisPlan.maxParentCards || 0}`,
    facetLines.length ? `facets:\n${facetLines.join('\n')}` : 'facets: 未提供'
  ].join('\n');
}

function buildAnalysisPlanTextV2(analysisPlan) {
  if (!analysisPlan || typeof analysisPlan !== 'object') return 'analysis plan: 未提供';

  const facetSummary = analysisPlan.facetSummary || {};
  const facetEntries = [
    ['goal', facetSummary.goal],
    ['time', facetSummary.time],
    ['entity/place', facetSummary.entityPlace],
    ['audience', facetSummary.audience],
    ['risk', facetSummary.risk],
    ['alternatives', facetSummary.alternatives]
  ]
    .filter(([, values]) => Array.isArray(values) && values.length)
    .map(([label, values]) => `- ${label}: ${values.join('、')}`);

  return [
    `responseMode: ${analysisPlan.responseMode || 'compact'}`,
    `intentType: ${analysisPlan.intentType || 'operational-detail'}`,
    `activeFacetNames: ${(analysisPlan.activeFacetNames || []).join('、') || '未提供'}`,
    `triggerReasons: ${(analysisPlan.triggerReasons || []).join('、') || '未提供'}`,
    `isComparisonQuery: ${analysisPlan.isComparisonQuery ? 'true' : 'false'}`,
    `hasRiskJudgment: ${analysisPlan.hasRiskJudgment ? 'true' : 'false'}`,
    `needsSourceComparison: ${analysisPlan.needsSourceComparison ? 'true' : 'false'}`,
    `rewriteTriggered: ${analysisPlan.rewriteTriggered ? 'true' : 'false'}`,
    `evidenceBudget: ${analysisPlan.evidenceBudget || 0}`,
    `maxParentCards: ${analysisPlan.maxParentCards || 0}`,
    facetEntries.length ? `facets:\n${facetEntries.join('\n')}` : 'facets: 未提供'
  ].join('\n');
}

function buildAnalysisPlanSummary(analysisPlan) {
  if (!analysisPlan || typeof analysisPlan !== 'object') return 'analysis plan: none';

  const facetSummary = analysisPlan.facetSummary || {};
  const evidenceLayers = analysisPlan.evidenceLayers || {};
  const facetLines = [
    ['goal', facetSummary.goal],
    ['time', facetSummary.time],
    ['entity/place', facetSummary.entityPlace],
    ['audience', facetSummary.audience],
    ['risk', facetSummary.risk],
    ['alternatives', facetSummary.alternatives]
  ]
    .filter(([, values]) => Array.isArray(values) && values.length)
    .map(([label, values]) => `- ${label}: ${values.join(', ')}`);
  const layerLines = [
    ['core', evidenceLayers.core],
    ['extension', evidenceLayers.extension],
    ['rulesLimits', evidenceLayers.rulesLimits],
    ['timingContext', evidenceLayers.timingContext],
    ['sourceContrast', evidenceLayers.sourceContrast]
  ]
    .filter(([, values]) => Array.isArray(values) && values.length)
    .map(([label, values]) => `- ${label}: ${values.join(', ')}`);

  return [
    `responseMode: ${analysisPlan.responseMode || 'compact'}`,
    `intentType: ${analysisPlan.intentType || 'operational-detail'}`,
    `inventoryIntent: ${analysisPlan.inventoryIntent ? 'true' : 'false'}`,
    `coverageMode: ${analysisPlan.coverageMode || 'standard'}`,
    `breadthProfile: ${analysisPlan.breadthProfile || 'guided-expansion'}`,
    `answerIntent: ${analysisPlan.answerIntent || 'answer'}`,
    `hardAnchors: ${(analysisPlan.hardAnchors || []).join(', ') || 'none'}`,
    `softModifiers: ${(analysisPlan.softModifiers || []).join(', ') || 'none'}`,
    `subjectClusters: ${(analysisPlan.subjectClusters || []).join(', ') || 'none'}`,
    `requiredCapabilities: ${(analysisPlan.requiredCapabilities || []).join(', ') || 'none'}`,
    `disallowedCategories: ${(analysisPlan.disallowedCategories || []).join(', ') || 'none'}`,
    `preferredClusters: ${(analysisPlan.preferredClusters || []).join(', ') || 'none'}`,
    `mustCoverCategories: ${(analysisPlan.mustCoverCategories || []).join(', ') || 'none'}`,
    `mustCoverCapabilities: ${(analysisPlan.mustCoverCapabilities || []).join(', ') || 'none'}`,
    `expansionReasons: ${(analysisPlan.expansionReasons || []).join(', ') || 'none'}`,
    `activeFacetNames: ${(analysisPlan.activeFacetNames || []).join(', ') || 'none'}`,
    `triggerReasons: ${(analysisPlan.triggerReasons || []).join(', ') || 'none'}`,
    `isComparisonQuery: ${analysisPlan.isComparisonQuery ? 'true' : 'false'}`,
    `hasRiskJudgment: ${analysisPlan.hasRiskJudgment ? 'true' : 'false'}`,
    `needsSourceComparison: ${analysisPlan.needsSourceComparison ? 'true' : 'false'}`,
    `rewriteTriggered: ${analysisPlan.rewriteTriggered ? 'true' : 'false'}`,
    `evidenceBudget: ${analysisPlan.evidenceBudget || 0}`,
    `maxParentCards: ${analysisPlan.maxParentCards || 0}`,
    facetLines.length ? `facets:\n${facetLines.join('\n')}` : 'facets: none',
    layerLines.length ? `evidenceLayers:\n${layerLines.join('\n')}` : 'evidenceLayers: none'
  ].join('\n');
}

function buildGroundedPromptV3(query, chunks, responseMode = 'compact', analysisPlan = null) {
  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `parentId: ${chunk.parentId || chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || 'unknown'}`,
      `sectionId: ${chunk.sectionId || 'unknown'}`,
      `fieldType: ${chunk.fieldType || 'parent'}`,
      `fieldLabel: ${chunk.fieldLabel || 'detail'}`,
      `evidenceRole: ${chunk.evidenceRole || 'supporting'}`,
      `timeHint: ${chunk.timeHint || 'none'}`,
      `bestTimeHint: ${chunk.bestTimeHint || 'none'}`,
      `structuredText: ${chunk.structuredText || chunk.text}`,
      `text: ${chunk.text || chunk.structuredText}`
    ].join('\n'))
    .join('\n\n');

  const reportInstructions = responseMode === 'report'
    ? `You are writing a grounded site-only answer in Traditional Chinese.
Return detailed, high-information, list-heavy output.
Prefer exhaustive inventory over short summary when evidence is sufficient.

Rules:
1. Always answer in Traditional Chinese.
2. Treat hard anchors as the main subject. Treat soft modifiers as organizing hints, not as strict filters.
3. First answer the core question, then expand into a detailed inventory of same-subject details from the retrieved cards.
4. Merge same-subject cards into grouped topic lists instead of dropping details.
5. Include floor / deck, timing, activities, food, services, rules, community tips, and official constraints whenever supported by the evidence.
6. If a conclusion is synthesized across multiple cards rather than stated in one card, explicitly label it as 綜合判斷.
7. Keep official / concierge / community differences separated inside sourceComparison.
8. Aim for roughly 1800-3500 Traditional Chinese characters when evidence is rich.

Required report object:
- headline
- executiveSummary: 2-4 bullets
- recommendedPlan: 6-12 bullets
- detailBreakdown: 8-20 bullets
- decisionAnalysis: 4-8 bullets
- risksAndFallbacks: 4-10 bullets
- topicGroups: 6-20 groups when evidence is rich
- sourceComparison: 2-6 items when sources differ
- unansweredQuestions: only if there is a real gap
- sectionCitationIds

For each topicGroups item return:
- groupTitle
- groupKind: core or extension
- entityType: facility | service | schedule | show | playbook | mixed
- summary
- detailItems: 3-12 bullets
- sourceMix
- citationIds

cardHighlights may still be returned for compatibility, but topicGroups should be the primary detailed structure.`
    : `You are writing a grounded compact answer in Traditional Chinese.
Return a concise but useful answer with directAnswer, recommendedSteps, whyThisWorks, and watchOuts.`;

  return `You are a grounded answer composer for a cruise guide website.
Only use the provided sources. Do not invent facts beyond them.
If evidence is insufficient, set insufficientData to true and explain the gap.

analysis plan:
${buildAnalysisPlanSummary(analysisPlan)}

${reportInstructions}

User query:
${query}

Sources:
${sourceDump}`;
}

function buildGroundedCoveragePromptV4(query, chunks, responseMode = 'compact', analysisPlan = null, options = {}) {
  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `parentId: ${chunk.parentId || chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || 'unknown'}`,
      `sectionId: ${chunk.sectionId || 'unknown'}`,
      `fieldType: ${chunk.fieldType || 'parent'}`,
      `fieldLabel: ${chunk.fieldLabel || 'detail'}`,
      `evidenceRole: ${chunk.evidenceRole || 'supporting'}`,
      `timeHint: ${chunk.timeHint || 'none'}`,
      `bestTimeHint: ${chunk.bestTimeHint || 'none'}`,
      `structuredText: ${chunk.structuredText || chunk.text}`,
      `text: ${chunk.text || chunk.structuredText}`
    ].join('\n'))
    .join('\n\n');

  const coverageSummary = sanitizeCoverageStats(options.coverageStats);
  const coverageContract = sanitizeCoverageContract(options.coverageContract);
  const parentBriefs = sanitizeParentBriefs(options.parentDossiers || options.parentBriefs, chunks.map((chunk) => chunk.id));
  const primaryEntityParents = sanitizeParentBriefs(options.primaryEntityParents, chunks.map((chunk) => chunk.id));
  const supportEntityParents = sanitizeParentBriefs(options.supportEntityParents, chunks.map((chunk) => chunk.id));
  const capabilityCoveragePlan = sanitizeCapabilityCoveragePlan(options.capabilityCoveragePlan);
  const categoryDossiers = sanitizeCategoryDossiers(options.categoryDossiers || options.categoryCoveragePlan);
  const coverageOutline = buildCoverageOutline(parentBriefs, analysisPlan, chunks, coverageContract);
  const parentBriefDump = parentBriefs.length
    ? parentBriefs.map((item, index) => [
      `[parent-brief ${index + 1}]`,
      `parentId: ${item.parentId}`,
      `title: ${item.title}`,
      `cardType: ${item.cardType}`,
      `groupLabel: ${item.groupLabel || 'none'}`,
      `sourceLabels: ${(item.sourceLabels || []).join(', ') || 'none'}`,
      `categoryFamilies: ${(item.categoryFamilies || []).join(', ') || 'none'}`,
      `detailBullets: ${(item.detailBullets || []).join(' | ') || 'none'}`,
      `citationIds: ${(item.citationIds || []).join(', ') || 'none'}`
    ].join('\n')).join('\n\n')
    : 'none';
  const categoryDossierDump = categoryDossiers.length
    ? categoryDossiers.map((item, index) => [
      `[category-dossier ${index + 1}]`,
      `categoryId: ${item.categoryId || 'none'}`,
      `label: ${item.label || 'none'}`,
      `parentCount: ${item.parentCount || 0}`,
      `sourceMix: ${(item.sourceMix || []).join(', ') || 'none'}`,
      `detailHints: ${(item.detailHints || []).join(' | ') || 'none'}`,
      `preferredParentIds: ${(item.preferredParentIds || []).join(', ') || 'none'}`
    ].join('\n')).join('\n\n')
    : 'none';
  const primaryEntityDump = primaryEntityParents.length
    ? primaryEntityParents.map((item, index) => [
      `[primary-entity ${index + 1}]`,
      `parentId: ${item.parentId}`,
      `title: ${item.title}`,
      `sourceType: ${item.sourceType || 'unknown'}`,
      `cardType: ${item.cardType}`,
      `categoryFamilies: ${(item.categoryFamilies || []).join(', ') || 'none'}`,
      `capabilityTags: ${(item.capabilityTags || []).join(', ') || 'none'}`,
      `detailBullets: ${(item.detailBullets || []).join(' | ') || 'none'}`
    ].join('\n')).join('\n\n')
    : 'none';
  const supportEntityDump = supportEntityParents.length
    ? supportEntityParents.map((item, index) => [
      `[support-entity ${index + 1}]`,
      `parentId: ${item.parentId}`,
      `title: ${item.title}`,
      `sourceType: ${item.sourceType || 'unknown'}`,
      `cardType: ${item.cardType}`,
      `supportOfParentIds: ${(item.supportOfParentIds || []).join(', ') || 'none'}`,
      `detailBullets: ${(item.detailBullets || []).join(' | ') || 'none'}`
    ].join('\n')).join('\n\n')
    : 'none';
  const capabilityCoverageDump = capabilityCoveragePlan.items.length
    ? capabilityCoveragePlan.items.map((item, index) => [
      `[capability ${index + 1}]`,
      `capabilityId: ${item.capabilityId}`,
      `label: ${item.label || item.capabilityId}`,
      `matchedParentIds: ${(item.matchedParentIds || []).join(', ') || 'none'}`,
      `categoryFamilies: ${(item.categoryFamilies || []).join(', ') || 'none'}`,
      `disallowedCategories: ${(item.disallowedCategories || []).join(', ') || 'none'}`
    ].join('\n')).join('\n\n')
    : 'none';

  const reportInstructions = responseMode === 'report'
    ? `You are writing an exhaustive grounded report in Traditional Chinese for an internal cruise guide website.
Use only the provided evidence. Do not invent facts.

This is coverage-first mode:
1. Hard anchors are the subject. Soft modifiers are organizing hints only.
2. Prefer coverage over brevity. If multiple parent cards are relevant, include them instead of over-compressing.
3. Write a rich answer with many bullets and enough detail. When evidence is rich, aim for roughly 3000-6500 Traditional Chinese characters.
4. After the core answer, produce a fullCardInventory section that covers as many relevant parent cards as possible.
5. fullCardInventory is the primary inventory layer. topicAppendix is the deep appendix layer. topicGroups is the shorter analysis layer.
6. Include floor / deck, timing, services, activities, food, SOP, cautions, community tips, concierge add-ons, and official constraints whenever evidence supports them.
7. If a statement is synthesized across multiple cards rather than stated by one card, explicitly label it as 綜合判斷.
8. Keep official / concierge / community / general differences separated inside sourceComparison.
9. Use the coverage outline, coverage contract, and parent briefs as a must-cover checklist. If a parent brief is inside mustRenderVisibleParentIds, it must appear in fullCardInventory. If it is inside mustRenderDerivedParentIds, it should appear unless evidence is clearly too weak.
10. If preferredSupportParentIds include relevant schedule segments, keep those schedule details in the answer as supporting context instead of dropping them. Facilities / decks / playbooks stay first, but matched schedule evidence should still be summarized clearly.
11. Use category dossiers to make sure the answer includes broad category coverage, not just many cards from one narrow slice.
12. For venue-based theatre questions, list each relevant show or theatre support card separately instead of collapsing them into one vague sentence.
13. primaryEntityParents are the main answer body. supportEntityParents are attached context only.
14. If requiredCapabilities exist, stay inside that capability family for the primary answer body. Do not let unrelated venue or show cards replace the main subject.
15. Schedule or support cards may add timing context, but they must stay attached to matching primary entities instead of becoming the dominant inventory.

Required report object:
- headline
- coverageSummary
- executiveSummary: 2-4 bullets
- recommendedPlan: 6-14 bullets
- fullCardInventory: 8-24 items when evidence is rich
- topicAppendix: 4-16 groups when evidence is rich
- detailBreakdown: 10-28 bullets
- decisionAnalysis: 4-8 bullets
- risksAndFallbacks: 4-12 bullets
- topicGroups: 6-20 groups when evidence is rich
- sourceComparison: 2-6 items when sources differ
- unansweredQuestions: only if there is a real gap
- sectionCitationIds

For each fullCardInventory item return:
- parentId
- title
- cardType
- groupLabel
- categoryFamilies
- sourceLabels
- detailBullets: 4-10 bullets
- citationIds

For each topicAppendix item return:
- groupTitle
- categoryId
- summary
- detailItems: 4-14 bullets
- sourceMix
- citationIds

For each topicGroups item return:
- groupTitle
- groupKind: core or extension
- entityType: facility | service | schedule | show | playbook | mixed
- summary
- detailItems: 3-12 bullets
- sourceMix
- citationIds

cardHighlights may still be returned for compatibility, but fullCardInventory should be the primary inventory structure.`
    : `You are writing a grounded compact answer in Traditional Chinese.
Return a concise but useful answer with directAnswer, recommendedSteps, whyThisWorks, and watchOuts.`;

  return `You are a grounded answer composer for a cruise guide website.
Only use the provided sources. Do not invent facts beyond them.
If evidence is insufficient, set insufficientData to true and explain the gap.

analysis plan:
${buildAnalysisPlanSummary(analysisPlan)}

coverage summary:
- selectedParentCount: ${coverageSummary.selectedParentCount || 0}
- selectedChunkCount: ${coverageSummary.selectedChunkCount || 0}
- targetParentCount: ${coverageSummary.targetParentCount || 0}
- visibleTargetCount: ${coverageSummary.visibleTargetCount || 0}
- visibleRenderedCount: ${coverageSummary.visibleRenderedCount || 0}
- primarySubject: ${coverageSummary.primarySubject || 'none'}
- sourceCounts: ${Object.entries(coverageSummary.sourceCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}

coverage contract:
- mode: ${coverageContract.mode}
- targetCoverageCount: ${coverageContract.targetCoverageCount || 0}
- minimumCoverageRatio: ${coverageContract.minimumCoverageRatio || 0}
- mustRenderParentIds: ${(coverageContract.mustRenderParentIds || []).join(', ') || 'none'}
- mustRenderVisibleParentIds: ${(coverageContract.mustRenderVisibleParentIds || []).join(', ') || 'none'}
- mustRenderDerivedParentIds: ${(coverageContract.mustRenderDerivedParentIds || []).join(', ') || 'none'}
- preferredSupportParentIds: ${(coverageContract.preferredSupportParentIds || []).join(', ') || 'none'}
- targetVisibleCoverageCount: ${coverageContract.targetVisibleCoverageCount || 0}
- minimumVisibleCoverageRatio: ${coverageContract.minimumVisibleCoverageRatio || 0}
- preferredParentIds: ${(coverageContract.preferredParentIds || []).join(', ') || 'none'}
- mustCoverCategories: ${(coverageContract.mustCoverCategories || []).join(', ') || 'none'}
- preferredClusters: ${(coverageContract.preferredClusters || []).join(', ') || 'none'}
- relevantSourceTypes: ${(coverageContract.relevantSourceTypes || []).join(', ') || 'none'}
- coverageReason: ${coverageContract.coverageReason || 'none'}

coverage outline:
- primarySubject: ${coverageOutline.primarySubject || 'none'}
- mustCoverParentIds: ${(coverageOutline.mustCoverParentIds || []).join(', ') || 'none'}
- inventoryNotes:
${(coverageOutline.inventoryNotes || []).map((item) => `  - ${item}`).join('\n') || '  - none'}

parent briefs:
${parentBriefDump}

primary entity parents:
${primaryEntityDump}

support entity parents:
${supportEntityDump}

capability coverage plan:
${capabilityCoverageDump}

category dossiers:
${categoryDossierDump}

${reportInstructions}

User query:
${query}

Sources:
${sourceDump}`;
}

function buildSectionDossierDumpV5(sectionDossiers = []) {
  const safeSections = sanitizeSectionDossiers(sectionDossiers);
  if (!safeSections.length) return 'none';

  return safeSections.map((section, index) => {
    const cards = Array.isArray(section.cards) ? section.cards : [];
    const {
      titles,
      timeFacts,
      locationFacts,
      contentFacts,
      insightFacts,
      cautionFacts
    } = collectSectionMaterialFactsV8(cards);
    const focusTitles = joinNarrativeTitlesV7(titles);
    const citationIds = uniqueItems(cards.flatMap((card) => Array.isArray(card?.citationIds) ? card.citationIds : [])).slice(0, MAX_CHUNKS);

    return [
      `[section ${index + 1}]`,
      `sectionKey: ${section.sectionKey}`,
      `sectionTitle: ${section.sectionTitle}`,
      `focusTitles: ${focusTitles || 'none'}`,
      `cardCount: ${cards.length}`,
      `timeFacts: ${timeFacts.slice(0, 3).join(' || ') || 'none'}`,
      `locationFacts: ${locationFacts.slice(0, 3).join(' || ') || 'none'}`,
      `contentFacts: ${contentFacts.slice(0, 4).join(' || ') || 'none'}`,
      `insightFacts: ${insightFacts.slice(0, 3).join(' || ') || 'none'}`,
      `cautionFacts: ${cautionFacts.slice(0, 3).join(' || ') || 'none'}`,
      `citationIds: ${citationIds.join(', ') || 'none'}`
    ].join('\n');
  }).join('\n\n');
}

function buildSectionWritingRulesDumpV5(sectionWritingRules = {}) {
  const safeRules = sanitizeSectionWritingRules(sectionWritingRules);
  return [
    `mode: ${safeRules.mode || 'section-first-guide'}`,
    `schedule target: ${(safeRules.targetParagraphsPerSection?.schedule || []).join(', ') || '2-3 paragraphs'}`,
    `deckShow target: ${(safeRules.targetParagraphsPerSection?.deckShow || []).join(', ') || '2-4 paragraphs'}`,
    `playbook target: ${(safeRules.targetParagraphsPerSection?.playbook || []).join(', ') || '2-4 paragraphs'}`,
    `schedule priority: ${safeRules.priorities?.schedule || 'Use schedule as sequencing context only.'}`,
    `deckShow priority: ${safeRules.priorities?.deckShow || 'Use deck/show as the main body for facilities, services, and show details.'}`,
    `playbook priority: ${safeRules.priorities?.playbook || 'Use playbook as the advice, caution, and tactics layer.'}`,
    `dedupeRule: ${safeRules.dedupeRule || 'State shared facts once in the best-fit section and let support cards only add differences.'}`,
    `proseStyle: ${safeRules.proseStyle || 'Write natural guide prose in Traditional Chinese, not card-by-card summaries.'}`
  ].join('\n');
}

function buildGroundedCoveragePromptV5(query, chunks, responseMode = 'compact', analysisPlan = null, options = {}) {
  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `parentId: ${chunk.parentId || chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || 'unknown'}`,
      `evidenceRole: ${chunk.evidenceRole || 'supporting'}`,
      `timeHint: ${chunk.timeHint || 'none'}`,
      `bestTimeHint: ${chunk.bestTimeHint || 'none'}`,
      `body: ${chunk.structuredText || chunk.text}`
    ].join('\n'))
    .join('\n\n');

  if (responseMode !== 'report') {
    return buildGroundedCoveragePromptV4(query, chunks, responseMode, analysisPlan, options);
  }

  const sectionDossierDump = buildSectionDossierDumpV5(options.sectionDossiers || options.cardDossiersByBlock || []);
  const sectionWritingRulesDump = buildSectionWritingRulesDumpV5(options.sectionWritingRules || {});
  const coverageSummary = sanitizeCoverageStats(options.coverageStats);
  const coverageContract = sanitizeCoverageContract(options.coverageContract);

  return `You are writing a grounded cruise guide article in Traditional Chinese.
Use only the provided sources. Do not invent facts.
Return JSON only.

Default instruction:
Write one readable cruise guide article that answers the original question. First, use the schedule materials to explain the timing and sequencing that matter. Second, use the deck, venue, service, and show materials to explain what the user will actually find and how those places or experiences fit together. Third, use the playbook materials to explain practical tactics, cautions, community tips, and small tricks. Merge overlapping facts before writing. Do not sound like a database export.
根據找到的「行程、甲板、表演、攻略卡片資料」，生成一篇解決「原始提問問題」的攻略文章。請一步一步撰寫，先根據行程資料梳理出跟問題有關的回答，然後改寫成第一部分攻略，強調排程。再根據甲板上的設施與表演資料找出跟問題有關的回答，改寫成第二部分攻略，強調設施、服務、表演內容細節。最後根據攻略卡片資料梳理跟問題有關的回答，改寫成第三部分攻略，強調社群心得、注意事項與小技巧。

Article structure:
1. sections: keep this exact order when a section has usable evidence:
   - schedule
   - deckShow
   - playbook
2. sourceComparison: only if source types disagree or add meaningful nuance.
3. unansweredQuestions: only if there is a real evidence gap.

Writing rules:
- Write natural, readable guide prose in Traditional Chinese.
- Do not produce a separate opening summary block. Go directly into the three guide sections.
- Each section should be 2-4 readable paragraphs when evidence is rich, or 1 paragraph when evidence is light.
- Use the section dossiers as your main writing material. Use the raw sources only to verify details and citations.
- Do not write card-by-card summaries.
- Do not copy raw field labels, raw Day/Deck markers, or raw source snippets into the prose.
- Do not sound like a database export, checklist, or concatenated note dump.
- Merge overlapping card facts into cohesive prose before writing.
- Mention the same fact once in the best-fit section; support cards should only add differences.
- Absorb noisy raw labels such as 時間 / 行程重點 / 活動標籤 / 適用時機 / Day / Deck into natural sentences instead of copying them.
- Do not open with a comma-separated list of matched cards or raw source snippets.
- Write like a travel companion explaining what matters next.
- If schedule data is relevant, weave it into timing strategy rather than letting schedule dominate the answer.
- If playbook cards overlap with facilities, keep the facility facts in deckShow and move tactics, cautions, and little tricks to playbook.
- Write like a helpful cruise guide, not like a summary of cards or fields.
- If a conclusion is synthesized across cards rather than directly stated by one card, label it as 綜合判斷.
- Keep official / concierge / community / general differences separated in sourceComparison.
- Keep citations attached at the section level, not per bullet.

analysis plan:
${buildAnalysisPlanSummary(analysisPlan)}

coverage summary:
- selectedParentCount: ${coverageSummary.selectedParentCount || 0}
- selectedChunkCount: ${coverageSummary.selectedChunkCount || 0}
- targetParentCount: ${coverageSummary.targetParentCount || 0}
- visibleTargetCount: ${coverageSummary.visibleTargetCount || 0}
- visibleRenderedCount: ${coverageSummary.visibleRenderedCount || 0}
- primarySubject: ${coverageSummary.primarySubject || 'none'}

coverage contract:
- mode: ${coverageContract.mode}
- mustRenderVisibleParentIds: ${(coverageContract.mustRenderVisibleParentIds || []).join(', ') || 'none'}
- mustRenderDerivedParentIds: ${(coverageContract.mustRenderDerivedParentIds || []).join(', ') || 'none'}
- preferredSupportParentIds: ${(coverageContract.preferredSupportParentIds || []).join(', ') || 'none'}
- mustCoverCategories: ${(coverageContract.mustCoverCategories || []).join(', ') || 'none'}
- preferredClusters: ${(coverageContract.preferredClusters || []).join(', ') || 'none'}
- relevantSourceTypes: ${(coverageContract.relevantSourceTypes || []).join(', ') || 'none'}

section dossiers:
${sectionDossierDump}

section writing rules:
${sectionWritingRulesDump}

Required JSON shape:
{
  "answer": string,
  "confidence": "high" | "medium" | "low",
  "primarySourceType": "schedule" | "deck" | "show" | "playbook" | "static",
  "missingReason": string,
  "citationIds": string[],
  "insufficientData": boolean,
  "report": {
    "headline": string,
    "longformArticle": {
      "headline": string,
      "sections": [
        {
          "sectionKey": "schedule" | "deckShow" | "playbook",
          "sectionTitle": string,
          "narrativeParagraphs": string[],
          "citationIds": string[],
          "renderOrigin": "model"
        }
      ],
      "sourceComparison": [{"sourceDetailType": string, "summary": string, "stance": string, "confidenceNote": string}],
      "unansweredQuestions": string[]
    },
    "sourceComparison": [{"sourceDetailType": string, "summary": string, "stance": string, "confidenceNote": string}],
    "unansweredQuestions": string[]
  }
}

User query:
${query}

Sources:
${sourceDump}`;
}

function buildGroundedCoveragePromptV6(query, chunks, responseMode = 'compact', analysisPlan = null, options = {}) {
  if (responseMode !== 'report') {
    return buildGroundedCoveragePromptV4(query, chunks, responseMode, analysisPlan, options);
  }

  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `parentId: ${chunk.parentId || chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || 'unknown'}`,
      `evidenceRole: ${chunk.evidenceRole || 'supporting'}`,
      `timeHint: ${chunk.timeHint || 'none'}`,
      `bestTimeHint: ${chunk.bestTimeHint || 'none'}`,
      `body: ${chunk.structuredText || chunk.text}`
    ].join('\n'))
    .join('\n\n');

  const sectionDossierDump = buildSectionDossierDumpV5(options.sectionDossiers || options.cardDossiersByBlock || []);
  const sectionWritingRulesDump = buildSectionWritingRulesDumpV5(options.sectionWritingRules || {});
  const coverageSummary = sanitizeCoverageStats(options.coverageStats);
  const coverageContract = sanitizeCoverageContract(options.coverageContract);

  return `You are writing a grounded cruise guide article in Traditional Chinese.
Use only the provided sources. Do not invent facts.
Return JSON only.

Default instruction:
根據找到的行程、甲板、表演、攻略卡片資料，生成一篇解決原始提問問題的攻略文章。請一步一步撰寫，先根據行程資料梳理出跟問題有關的回答，然後改寫成第一部分攻略，強調排程。再根據甲板上的設施與表演資料找出跟問題有關的回答，改寫成第二部分攻略，強調設施、服務、表演內容細節。最後根據攻略卡片資料梳理跟問題有關的回答，改寫成第三部分攻略，強調社群心得、注意事項與小技巧。

Article structure:
1. sections: keep this exact order when a section has usable evidence:
   - schedule
   - deckShow
   - playbook
2. sourceComparison: only if source types disagree or add meaningful nuance.
3. unansweredQuestions: only if there is a real evidence gap.

Writing rules:
- Write natural, readable guide prose in Traditional Chinese.
- Go directly into the guide sections. Do not write a separate opening summary block.
- Each section should be 2-4 readable paragraphs when evidence is rich, or 1 paragraph when evidence is light.
- Use the section dossiers as your main writing material. Use the raw sources only to verify details and citations.
- Do not write card-by-card summaries.
- Do not copy raw field labels, raw Day or Deck markers, or raw source snippets into the prose.
- Rewrite raw itinerary labels into natural timing phrases when possible instead of exposing raw markers like Day 1, 行程重點, or 活動標籤.
- Do not sound like a database export, checklist, or concatenated note dump.
- Merge overlapping facts before writing.
- Mention the same fact once in the best-fit section; support cards should only add differences.
- Do not open with a comma-separated list of matched cards or raw snippets.
- Write like a travel companion explaining what matters next.
- Let schedule explain timing and sequencing, not dominate the whole answer.
- Let deckShow carry the main body for facilities, services, venues, and shows.
- Let playbook carry tactics, cautions, edge cases, and small tricks.
- If a conclusion is synthesized across multiple cards rather than directly stated by one card, label it as 綜合判斷.
- Keep official / concierge / community / general differences separated in sourceComparison.
- Keep citations attached at the section level, not per bullet.

analysis plan:
${buildAnalysisPlanSummary(analysisPlan)}

coverage summary:
- selectedParentCount: ${coverageSummary.selectedParentCount || 0}
- selectedChunkCount: ${coverageSummary.selectedChunkCount || 0}
- targetParentCount: ${coverageSummary.targetParentCount || 0}
- visibleTargetCount: ${coverageSummary.visibleTargetCount || 0}
- visibleRenderedCount: ${coverageSummary.visibleRenderedCount || 0}
- primarySubject: ${coverageSummary.primarySubject || 'none'}

coverage contract:
- mode: ${coverageContract.mode}
- mustRenderVisibleParentIds: ${(coverageContract.mustRenderVisibleParentIds || []).join(', ') || 'none'}
- mustRenderDerivedParentIds: ${(coverageContract.mustRenderDerivedParentIds || []).join(', ') || 'none'}
- preferredSupportParentIds: ${(coverageContract.preferredSupportParentIds || []).join(', ') || 'none'}
- mustCoverCategories: ${(coverageContract.mustCoverCategories || []).join(', ') || 'none'}
- preferredClusters: ${(coverageContract.preferredClusters || []).join(', ') || 'none'}
- relevantSourceTypes: ${(coverageContract.relevantSourceTypes || []).join(', ') || 'none'}

section dossiers:
${sectionDossierDump}

section writing rules:
${sectionWritingRulesDump}

Required JSON shape:
{
  "answer": string,
  "confidence": "high" | "medium" | "low",
  "primarySourceType": "schedule" | "deck" | "show" | "playbook" | "static",
  "missingReason": string,
  "citationIds": string[],
  "insufficientData": boolean,
  "report": {
    "headline": string,
    "longformArticle": {
      "headline": string,
      "sections": [
        {
          "sectionKey": "schedule" | "deckShow" | "playbook",
          "sectionTitle": string,
          "narrativeParagraphs": string[],
          "citationIds": string[],
          "renderOrigin": "model"
        }
      ],
      "sourceComparison": [{"sourceDetailType": string, "summary": string, "stance": string, "confidenceNote": string}],
      "unansweredQuestions": string[]
    },
    "sourceComparison": [{"sourceDetailType": string, "summary": string, "stance": string, "confidenceNote": string}],
    "unansweredQuestions": string[]
  }
}

User query:
${query}

Sources:
${sourceDump}`;
}

function buildGroundedPrompt(query, chunks, responseMode = 'compact', analysisPlan = null) {
  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `parentId: ${chunk.parentId || chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || '未提供位置'}`,
      `sectionId: ${chunk.sectionId || 'unknown'}`,
      `fieldType: ${chunk.fieldType || 'parent'}`,
      `fieldLabel: ${chunk.fieldLabel || '內容重點'}`,
      `evidenceRole: ${chunk.evidenceRole || 'supporting'}`,
      `timeHint: ${chunk.timeHint || '未提供'}`,
      `bestTimeHint: ${chunk.bestTimeHint || '未提供'}`,
      `structuredText: ${chunk.structuredText || chunk.text}`,
      `text: ${chunk.text || chunk.structuredText}`
    ].join('\n'))
    .join('\n\n');

  const reportInstructions = responseMode === 'report'
    ? `這次要輸出「一頁式簡單報告」，請在維持 grounded answer 的前提下，整理成更完整、可掃讀的報告。

報告模式額外要求：
1. answer 仍要先給一句直接結論，sections 也必須完整，保持相容。
2. 另外請輸出 report 物件，欄位包含：
   - headline
   - executiveSummary：2 到 3 點
   - recommendedPlan：3 到 6 點
   - detailBreakdown：2 到 4 點
   - decisionAnalysis：2 到 4 點
   - risksAndFallbacks：2 到 4 點
   - sourceComparison：按來源層級分開整理
   - unansweredQuestions：只有真的有缺口時才填
   - sectionCitationIds：每一段對應可引用的 chunk id
3. 若某段結論是綜合多張卡片推論，不能寫成官方事實，請在 stance 或句子中明示「綜合判斷」。
4. 若 official / concierge / community 指向不同結論，不可混寫，必須在 sourceComparison 分開呈現。
5. 文字要完整但可掃讀，目標是使用者能快速看完一頁，而不是冗長散文。`
    : '這次維持 compact mode，請用精簡但完整的方式回答。';

  return `你是站內搜尋的語意整理助手，只能根據提供的 sources 作答，不能補外部資訊，也不能假設網站沒寫的內容。

請嚴格遵守：
1. 全部輸出使用繁體中文，語氣自然、好懂、像熟悉攻略的旅伴。
2. answer 先給一句直接結論，不能空泛。
3. sections 必須依據證據整理成：
   - directAnswer：一句最直接的回答
   - recommendedSteps：1 到 4 點，偏 SOP / 順序 / 做法
   - whyThisWorks：0 到 3 點，解釋為什麼這樣安排
   - watchOuts：0 到 3 點，提醒風險、例外、限制
4. sourceBreakdown 要明確區分證據層級：
   - official = 官方規則
   - concierge = 禮賓加值
   - community = 社群實戰
   - general = 一般站內整理
5. citationIds 只能填 sources 內真的存在的 chunk id，不能杜撰。
6. 若 sources 足以回答，insufficientData 必須是 false；若站內證據不夠，就設 true，並在 answer 與 missingReason 明確說缺什麼資訊。
7. primarySourceType 只能填 schedule / deck / show / playbook / static。
8. followUpHint 請給一句「如果還想更準，可以怎麼換問法」的建議；若已足夠完整，也可給空字串。
9. 不要逐字重抄 sources，要整合後再回答，但所有結論都必須能被引用支持。
10. 若 analysis plan 顯示需要來源對照或比較判斷，請主動整理差異，而不是只給單一結論。

analysis plan:
${buildAnalysisPlanTextV2(analysisPlan)}

${reportInstructions}

使用者問題：
${query}

sources:
${sourceDump}`;
}

function buildGroundedPromptV2(query, chunks, responseMode = 'compact', analysisPlan = null) {
  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `parentId: ${chunk.parentId || chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || '未提供位置'}`,
      `sectionId: ${chunk.sectionId || 'unknown'}`,
      `fieldType: ${chunk.fieldType || 'parent'}`,
      `fieldLabel: ${chunk.fieldLabel || '內容重點'}`,
      `evidenceRole: ${chunk.evidenceRole || 'supporting'}`,
      `timeHint: ${chunk.timeHint || '未提供'}`,
      `bestTimeHint: ${chunk.bestTimeHint || '未提供'}`,
      `structuredText: ${chunk.structuredText || chunk.text}`,
      `text: ${chunk.text || chunk.structuredText}`
    ].join('\n'))
    .join('\n\n');

  const reportInstructions = responseMode === 'report'
    ? `這次請輸出「詳細列表式報告」，目標是繁中約 1200 到 2200 字，讓使用者能快速掌握多張攻略卡整合後的細節。

報告模式額外要求：
1. answer 仍要先給一句直接結論，sections 也必須完整，保持相容。
2. sections 要偏詳細，不要只有 1 到 2 點：
   - directAnswer：一句清楚結論
   - recommendedSteps：4 到 8 點，按順序寫出做法
   - whyThisWorks：3 到 6 點，說明安排邏輯與判斷依據
   - watchOuts：3 到 5 點，整理限制、踩雷點、備案
3. 另外請輸出 report 物件，欄位包含：
   - headline
   - executiveSummary：2 到 3 點
   - recommendedPlan：4 到 8 點
   - detailBreakdown：4 到 8 點
   - decisionAnalysis：3 到 5 點
   - risksAndFallbacks：3 到 5 點
   - cardHighlights：4 到 8 張關鍵攻略卡，每張都要帶出卡片細節
   - sourceComparison：2 到 4 筆，按來源層級分開整理
   - unansweredQuestions：只有真的有缺口時才填
   - sectionCitationIds：每一段對應可引用的 chunk id
4. cardHighlights 每項都要包含：
   - title
   - sourceType
   - sourceDetailType
   - whyRelevant
   - detailBullets：2 到 4 點，必須摘要該卡真正有用的細節，不要只重複標題
   - citationIds
5. 回答請優先把多張卡片的可操作細節整理成條列，而不是寫成一大段散文。
6. 若某段結論是綜合多張卡片推論，不能寫成官方事實，請在 stance 或句子中明示「綜合判斷」。
7. 若 official / concierge / community 指向不同結論，不可混寫，必須在 sourceComparison 分開呈現。`
    : `這次維持 compact mode，但仍請充分利用命中的 chunk 細節。

compact 模式要求：
1. answer 與 sections 要清楚、完整，不要空泛。
2. recommendedSteps 盡量提供 3 到 5 點。
3. watchOuts 若有風險、限制、注意事項，請明確列出。`;

  return `你是站內攻略整理助手，只能根據提供的 sources 回答，不可捏造、不可以外部常識補完，也不能把來源沒寫的內容講成確定事實。
回答原則：
1. 優先使用繁體中文，語氣自然但精準，避免空話、避免過度客套、避免重複句。
2. 你現在不是只要簡答，而是要把命中的卡片細節整理成高資訊密度的條列答案。
3. answer 要先給直接結論，然後再補充能執行的說法。
4. sections 需要結構化整理：
   - directAnswer：一句直接可執行的建議
   - recommendedSteps：偏 SOP / 順序 / 做法，請盡量寫完整
   - whyThisWorks：補充判斷依據、適用情境、安排邏輯
   - watchOuts：整理限制、風險、替代方案
5. sourceBreakdown 需要說明來源層級：
   - official = 官方規則
   - concierge = 禮賓加值
   - community = 社群實戰
   - general = 一般站內整理
6. citationIds 必須只引用 sources 中真的存在的 chunk id。
7. 如果 sources 不足以回答，insufficientData 設為 true，並把 answer 與 missingReason 寫清楚。
8. primarySourceType 只能是 schedule / deck / show / playbook / static。
9. followUpHint 要給下一步最有幫助的追問方向，但不要要求使用者去做外部搜尋。
10. 不要逐字貼上 sources，而是整理成更好讀的條列與摘要；能綜合多張卡時，就要主動統整，不要只回單一卡片摘要。
11. 若 analysis plan 顯示這題是比較、排序或風險判斷，回答時請把差異、取捨、適用情境寫清楚。
analysis plan:
${buildAnalysisPlanText(analysisPlan)}

${reportInstructions}

使用者問題：
${query}

sources:
${sourceDump}`;
}

function buildRewritePrompt(query, chunks) {
  const sourceDump = chunks
    .map((chunk, index) => [
      `[#${index + 1}] ${chunk.title}`,
      `sourceType: ${chunk.sourceType}`,
      `sourceDetailType: ${chunk.sourceDetailType}`,
      `fieldLabel: ${chunk.fieldLabel || '內容重點'}`,
      `locationLabel: ${chunk.locationLabel || '未提供位置'}`,
      `text: ${chunk.structuredText || chunk.text}`
    ].join('\n'))
    .join('\n\n');

  return `你是站內搜尋的查詢改寫助手，只能根據已命中的站內片段，把原始問題改寫成更容易在網站內找到答案的搜尋詞。

規則：
1. rewrittenQuery 請保留原本意圖，但改成更容易命中站內攻略的問法。
2. keywords 提供 3 到 6 個關鍵詞，優先保留站內實際常見名詞、別名、設施名、時段或任務詞。
3. alternates 提供 2 到 4 個可替代搜尋角度。
4. 不要加入 sources 以外的新資訊，也不要把問題改寫得太長。
5. confidence 只能是 high / medium / low。

原始問題：
${query}

已命中的線索：
${sourceDump}`;
}

function extractCandidateText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('\n')
    .trim() || '';
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildGroundedSchema() {
  const citationIdArray = {
    type: 'ARRAY',
    items: { type: 'STRING' },
    minItems: 0,
    maxItems: MAX_CHUNKS
  };

  return {
    type: 'OBJECT',
    properties: {
      answer: { type: 'STRING' },
      bullets: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 6
      },
      confidence: {
        type: 'STRING',
        enum: ALLOWED_CONFIDENCE
      },
      primarySourceType: {
        type: 'STRING',
        enum: ALLOWED_SOURCE_TYPES
      },
      missingReason: { type: 'STRING' },
      citationIds: citationIdArray,
      insufficientData: { type: 'BOOLEAN' },
      sections: {
        type: 'OBJECT',
        properties: {
          directAnswer: { type: 'STRING' },
          recommendedSteps: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 6
          },
          whyThisWorks: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          watchOuts: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          }
        },
        required: ['directAnswer', 'recommendedSteps', 'whyThisWorks', 'watchOuts']
      },
      sourceBreakdown: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            type: {
              type: 'STRING',
              enum: ALLOWED_SOURCE_DETAIL_TYPES
            },
            summary: { type: 'STRING' }
          },
          required: ['type', 'summary']
        },
        minItems: 0,
        maxItems: 4
      },
      followUpHint: { type: 'STRING' },
      report: {
        type: 'OBJECT',
        properties: {
          headline: { type: 'STRING' },
          executiveSummary: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 3
          },
          recommendedPlan: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 6
          },
          detailBreakdown: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          decisionAnalysis: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          risksAndFallbacks: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          sourceComparison: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                sourceDetailType: {
                  type: 'STRING',
                  enum: ALLOWED_SOURCE_DETAIL_TYPES
                },
                stance: { type: 'STRING' },
                summary: { type: 'STRING' },
                confidenceNote: { type: 'STRING' }
              },
              required: ['sourceDetailType', 'summary']
            },
            minItems: 0,
            maxItems: 4
          },
          unansweredQuestions: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          sectionCitationIds: {
            type: 'OBJECT',
            properties: {
              executiveSummary: citationIdArray,
              recommendedPlan: citationIdArray,
              detailBreakdown: citationIdArray,
              decisionAnalysis: citationIdArray,
              risksAndFallbacks: citationIdArray,
              sourceComparison: citationIdArray,
              unansweredQuestions: citationIdArray
            }
          }
        }
      }
    },
    required: [
      'answer',
      'bullets',
      'confidence',
      'primarySourceType',
      'citationIds',
      'insufficientData',
      'sections',
      'sourceBreakdown',
      'followUpHint'
    ]
  };
}

function buildGroundedSchemaV2() {
  const citationIdArray = {
    type: 'ARRAY',
    items: { type: 'STRING' },
    minItems: 0,
    maxItems: MAX_CHUNKS
  };

  return {
    type: 'OBJECT',
    properties: {
      answer: { type: 'STRING' },
      bullets: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 16
      },
      confidence: {
        type: 'STRING',
        enum: ALLOWED_CONFIDENCE
      },
      primarySourceType: {
        type: 'STRING',
        enum: ALLOWED_SOURCE_TYPES
      },
      missingReason: { type: 'STRING' },
      citationIds: citationIdArray,
      insufficientData: { type: 'BOOLEAN' },
      sections: {
        type: 'OBJECT',
        properties: {
          directAnswer: { type: 'STRING' },
          recommendedSteps: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 16
          },
          whyThisWorks: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 10
          },
          watchOuts: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 12
          }
        },
        required: ['directAnswer', 'recommendedSteps', 'whyThisWorks', 'watchOuts']
      },
      sourceBreakdown: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            type: {
              type: 'STRING',
              enum: ALLOWED_SOURCE_DETAIL_TYPES
            },
            summary: { type: 'STRING' }
          },
          required: ['type', 'summary']
        },
        minItems: 0,
        maxItems: 4
      },
      followUpHint: { type: 'STRING' },
      report: {
        type: 'OBJECT',
        properties: {
          headline: { type: 'STRING' },
          coverageSummary: {
            type: 'OBJECT',
            properties: {
              selectedParentCount: { type: 'NUMBER' },
              targetParentCount: { type: 'NUMBER' },
              renderedParentCount: { type: 'NUMBER' },
              backfilledParentCount: { type: 'NUMBER' },
              visibleTargetCount: { type: 'NUMBER' },
              visibleRenderedCount: { type: 'NUMBER' },
              visibleBackfilledCount: { type: 'NUMBER' },
              visibleCoverageRatio: { type: 'NUMBER' },
              coverageRatio: { type: 'NUMBER' },
              sourceCounts: { type: 'OBJECT' },
              primarySubject: { type: 'STRING' }
            }
          },
          executiveSummary: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          recommendedPlan: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 16
          },
          fullCardInventory: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                parentId: { type: 'STRING' },
                title: { type: 'STRING' },
                cardType: { type: 'STRING' },
                groupLabel: { type: 'STRING' },
                sourceLabels: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 0,
                  maxItems: 5
                },
                categoryFamilies: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 0,
                  maxItems: 6
                },
                detailBullets: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 0,
                  maxItems: 10
                },
                citationIds: citationIdArray,
                coverageTier: {
                  type: 'STRING',
                  enum: ['visible', 'derived', 'support']
                },
                renderOrigin: {
                  type: 'STRING',
                  enum: ['model', 'backfill', 'visible-backfill', 'derived-backfill', 'support-backfill']
                }
              },
              required: ['parentId', 'title', 'cardType', 'groupLabel', 'sourceLabels', 'detailBullets', 'citationIds']
            },
            minItems: 0,
            maxItems: MAX_FULL_CARD_INVENTORY
          },
          topicAppendix: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                groupTitle: { type: 'STRING' },
                categoryId: { type: 'STRING' },
                summary: { type: 'STRING' },
                detailItems: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 0,
                  maxItems: 14
                },
                sourceMix: {
                  type: 'ARRAY',
                  items: {
                    type: 'STRING',
                    enum: ALLOWED_SOURCE_DETAIL_TYPES
                  },
                  minItems: 0,
                  maxItems: 4
                },
                citationIds: citationIdArray
              },
              required: ['groupTitle', 'categoryId', 'summary', 'detailItems', 'sourceMix', 'citationIds']
            },
            minItems: 0,
            maxItems: 16
          },
          detailBreakdown: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 24
          },
          decisionAnalysis: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 10
          },
          risksAndFallbacks: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 12
          },
          topicGroups: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                groupTitle: { type: 'STRING' },
                groupKind: {
                  type: 'STRING',
                  enum: ['core', 'extension']
                },
                entityType: {
                  type: 'STRING',
                  enum: ['facility', 'service', 'schedule', 'show', 'playbook', 'mixed']
                },
                summary: { type: 'STRING' },
                detailItems: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 0,
                  maxItems: 12
                },
                sourceMix: {
                  type: 'ARRAY',
                  items: {
                    type: 'STRING',
                    enum: ALLOWED_SOURCE_DETAIL_TYPES
                  },
                  minItems: 0,
                  maxItems: 4
                },
                citationIds: citationIdArray
              },
              required: ['groupTitle', 'groupKind', 'entityType', 'summary', 'detailItems', 'sourceMix', 'citationIds']
            },
            minItems: 0,
            maxItems: 24
          },
          cardHighlights: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                sourceType: {
                  type: 'STRING',
                  enum: ALLOWED_SOURCE_TYPES
                },
                sourceDetailType: {
                  type: 'STRING',
                  enum: ALLOWED_SOURCE_DETAIL_TYPES
                },
                whyRelevant: { type: 'STRING' },
                detailBullets: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 0,
                  maxItems: 4
                },
                citationIds: citationIdArray
              },
              required: ['title', 'sourceType', 'sourceDetailType', 'whyRelevant', 'detailBullets', 'citationIds']
            },
            minItems: 0,
            maxItems: 12
          },
          sourceComparison: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                sourceDetailType: {
                  type: 'STRING',
                  enum: ALLOWED_SOURCE_DETAIL_TYPES
                },
                stance: { type: 'STRING' },
                summary: { type: 'STRING' },
                confidenceNote: { type: 'STRING' }
              },
              required: ['sourceDetailType', 'summary']
            },
            minItems: 0,
            maxItems: 6
          },
          unansweredQuestions: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 6
          },
          sectionCitationIds: {
            type: 'OBJECT',
            properties: {
              executiveSummary: citationIdArray,
              recommendedPlan: citationIdArray,
              fullCardInventory: citationIdArray,
              topicAppendix: citationIdArray,
              detailBreakdown: citationIdArray,
              decisionAnalysis: citationIdArray,
              risksAndFallbacks: citationIdArray,
              topicGroups: citationIdArray,
              cardHighlights: citationIdArray,
              sourceComparison: citationIdArray,
              unansweredQuestions: citationIdArray
            }
          }
        }
      }
    },
    required: [
      'answer',
      'bullets',
      'confidence',
      'primarySourceType',
      'missingReason',
      'citationIds',
      'insufficientData',
      'sections',
      'sourceBreakdown',
      'followUpHint'
    ]
  };
}

function buildGroundedSchemaV3() {
  const citationIdArray = {
    type: 'ARRAY',
    items: { type: 'STRING' },
    minItems: 0,
    maxItems: MAX_CHUNKS
  };

  return {
    type: 'OBJECT',
    properties: {
      answer: { type: 'STRING' },
      bullets: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 8
      },
      confidence: {
        type: 'STRING',
        enum: ALLOWED_CONFIDENCE
      },
      primarySourceType: {
        type: 'STRING',
        enum: ALLOWED_SOURCE_TYPES
      },
      missingReason: { type: 'STRING' },
      citationIds: citationIdArray,
      insufficientData: { type: 'BOOLEAN' },
      sections: {
        type: 'OBJECT',
        properties: {
          directAnswer: { type: 'STRING' },
          recommendedSteps: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 8
          },
          whyThisWorks: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 6
          },
          watchOuts: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 8
          }
        },
        required: ['directAnswer', 'recommendedSteps', 'whyThisWorks', 'watchOuts']
      },
      sourceBreakdown: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            type: {
              type: 'STRING',
              enum: ALLOWED_SOURCE_DETAIL_TYPES
            },
            summary: { type: 'STRING' }
          },
          required: ['type', 'summary']
        },
        minItems: 0,
        maxItems: 4
      },
      followUpHint: { type: 'STRING' },
      report: {
        type: 'OBJECT',
        properties: {
          headline: { type: 'STRING' },
          longformArticle: {
            type: 'OBJECT',
            properties: {
              headline: { type: 'STRING' },
              introSummary: { type: 'STRING' },
              sections: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    sectionKey: {
                      type: 'STRING',
                      enum: ['schedule', 'deckShow', 'playbook']
                    },
                    sectionTitle: { type: 'STRING' },
                    sectionSummary: { type: 'STRING' },
                    narrativeParagraphs: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                      minItems: 0,
                      maxItems: 4
                    },
                    citationIds: citationIdArray,
                    renderOrigin: {
                      type: 'STRING',
                      enum: ['model', 'backfill']
                    }
                  },
                  required: ['sectionKey', 'sectionTitle', 'narrativeParagraphs', 'citationIds']
                },
                minItems: 0,
                maxItems: 3
              },
              sourceComparison: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    sourceDetailType: {
                      type: 'STRING',
                      enum: ALLOWED_SOURCE_DETAIL_TYPES
                    },
                    stance: { type: 'STRING' },
                    summary: { type: 'STRING' },
                    confidenceNote: { type: 'STRING' }
                  },
                  required: ['sourceDetailType', 'summary']
                },
                minItems: 0,
                maxItems: 6
              },
              unansweredQuestions: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                minItems: 0,
                maxItems: 6
              }
            },
            required: ['sections']
          }
        }
      }
    },
    required: [
      'answer',
      'bullets',
      'confidence',
      'primarySourceType',
      'missingReason',
      'citationIds',
      'insufficientData',
      'sections',
      'sourceBreakdown',
      'followUpHint'
    ]
  };
}

function buildGroundedSchemaV4() {
  const citationIdArray = {
    type: 'ARRAY',
    items: { type: 'STRING' },
    minItems: 0,
    maxItems: MAX_CHUNKS
  };

  return {
    type: 'OBJECT',
    properties: {
      answer: { type: 'STRING' },
      confidence: {
        type: 'STRING',
        enum: ALLOWED_CONFIDENCE
      },
      primarySourceType: {
        type: 'STRING',
        enum: ALLOWED_SOURCE_TYPES
      },
      missingReason: { type: 'STRING' },
      citationIds: citationIdArray,
      insufficientData: { type: 'BOOLEAN' },
      report: {
        type: 'OBJECT',
        properties: {
          headline: { type: 'STRING' },
          longformArticle: {
            type: 'OBJECT',
            properties: {
              headline: { type: 'STRING' },
              sections: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    sectionKey: {
                      type: 'STRING',
                      enum: ['schedule', 'deckShow', 'playbook']
                    },
                    sectionTitle: { type: 'STRING' },
                    narrativeParagraphs: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                      minItems: 0,
                      maxItems: 4
                    },
                    citationIds: citationIdArray,
                    renderOrigin: {
                      type: 'STRING',
                      enum: ['model', 'backfill']
                    }
                  },
                  required: ['sectionKey', 'sectionTitle', 'narrativeParagraphs', 'citationIds']
                },
                minItems: 0,
                maxItems: 3
              },
              sourceComparison: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    sourceDetailType: {
                      type: 'STRING',
                      enum: ALLOWED_SOURCE_DETAIL_TYPES
                    },
                    stance: { type: 'STRING' },
                    summary: { type: 'STRING' },
                    confidenceNote: { type: 'STRING' }
                  },
                  required: ['sourceDetailType', 'summary']
                },
                minItems: 0,
                maxItems: 6
              },
              unansweredQuestions: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                minItems: 0,
                maxItems: 6
              }
            },
            required: ['sections']
          },
          sourceComparison: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                sourceDetailType: {
                  type: 'STRING',
                  enum: ALLOWED_SOURCE_DETAIL_TYPES
                },
                stance: { type: 'STRING' },
                summary: { type: 'STRING' },
                confidenceNote: { type: 'STRING' }
              },
              required: ['sourceDetailType', 'summary']
            },
            minItems: 0,
            maxItems: 6
          },
          unansweredQuestions: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 6
          }
        },
        required: ['longformArticle']
      }
    },
    required: [
      'answer',
      'confidence',
      'primarySourceType',
      'missingReason',
      'citationIds',
      'insufficientData',
      'report'
    ]
  };
}

function buildRewriteSchema() {
  return {
    type: 'OBJECT',
    properties: {
      rewrittenQuery: { type: 'STRING' },
      keywords: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 6
      },
      alternates: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 4
      },
      confidence: {
        type: 'STRING',
        enum: ALLOWED_CONFIDENCE
      }
    },
    required: ['rewrittenQuery', 'keywords', 'alternates', 'confidence']
  };
}

function buildInsufficientDataPayload(message, options = {}) {
  const responseMode = sanitizeResponseMode(options.responseMode);
  const answer = sanitizeString(
    message || '目前站內命中的內容還不足以整理出穩定答案，建議把問題再問得更具體一點。',
    600
  );
  const bullets = sanitizeTextArray(options.bullets, 6, 180);
  const citations = Array.isArray(options.citations) ? options.citations.slice(0, MAX_CHUNKS) : [];
  const sections = normalizeSections(options.sections, answer, bullets);
  const sourceBreakdown = normalizeSourceBreakdown(options.sourceBreakdown, options.chunks || [], citations.map((item) => item.id));
  const payload = {
    answer,
    bullets,
    citations,
    confidence: 'low',
    primarySourceType: sanitizeSourceType(options.primarySourceType || 'static'),
    missingReason: sanitizeString(
      options.missingReason || '目前命中的站內片段還缺少關鍵步驟、時段或限制條件，無法更精準地下結論。',
      220
    ),
    insufficientData: true,
    sections,
    sourceBreakdown,
    followUpHint: sanitizeString(
      options.followUpHint || '可以改問更具體的設施、時段、對象或步驟，例如直接問「晚餐前去 Lounge 最順嗎？」',
      160
    )
  };

  if (responseMode === 'report') {
    payload.report = buildFallbackReport({
      answer,
      sections,
      sourceBreakdown,
      citationIds: citations.map((item) => item.id),
      followUpHint: payload.followUpHint,
      missingReason: payload.missingReason,
      chunks: options.chunks || [],
      parentBriefs: options.parentBriefs || options.parentDossiers || [],
      sectionDossiers: options.sectionDossiers || [],
      categoryDossiers: options.categoryDossiers || options.categoryCoveragePlan || [],
      coverageStats: options.coverageStats || null,
      coverageContract: options.coverageContract || null
    });
  }

  return payload;
}

function extractKeywordCandidates(query) {
  const normalized = normalizeQuery(query).toLowerCase();
  if (!normalized) return [];

  const asciiTokens = normalized
    .split(/[^a-z0-9\u4e00-\u9fff]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  const compactChinese = normalized.replace(/[^\u4e00-\u9fff]/g, '');
  const chineseNgrams = [];
  for (let size = Math.min(4, compactChinese.length); size >= 2; size -= 1) {
    for (let index = 0; index <= compactChinese.length - size; index += 1) {
      chineseNgrams.push(compactChinese.slice(index, index + size));
    }
  }

  return uniqueItems([...asciiTokens, ...chineseNgrams]).slice(0, 6);
}

function buildLowConfidenceFallback(query, chunks, options = {}) {
  const responseMode = sanitizeResponseMode(options.responseMode);
  const topChunks = chunks.slice(0, 4);
  const primarySourceType = topChunks[0]?.sourceType || 'static';
  const citations = topChunks.map((chunk) => ({
    id: chunk.id,
    title: chunk.title,
    locationLabel: chunk.locationLabel,
    navTarget: chunk.navTarget
  }));
  const bullets = topChunks
    .map((chunk) => buildChunkPreview(chunk, 100))
    .filter(Boolean)
    .slice(0, 4);
  const answer = `我先根據目前命中的站內片段整理了一版方向：關於「${query}」，最相關的內容集中在 ${topChunks.map((chunk) => chunk.title).join('、')}。`;
  const sections = normalizeSections({
    directAnswer: answer,
    recommendedSteps: bullets,
    whyThisWorks: [],
    watchOuts: []
  }, answer, bullets);

  return {
    ...((responseMode === 'report')
      ? {
          report: buildFallbackReport({
            answer,
            sections,
            sourceBreakdown: buildSourceBreakdownFromChunksV2(topChunks, citations.map((item) => item.id)),
            citationIds: citations.map((item) => item.id),
            followUpHint: '若想更準，可以在問題裡補上 Day、時段、設施名或想達成的目標。',
            missingReason: '目前可引用的證據還偏零碎，建議同時點開下方來源快速核對細節。',
            chunks: topChunks,
            parentBriefs: options.parentBriefs || [],
            sectionDossiers: options.sectionDossiers || [],
            coverageStats: options.coverageStats || null,
            coverageContract: options.coverageContract || null
          })
        }
      : {}),
    answer,
    bullets,
    citations,
    confidence: 'low',
    primarySourceType,
    missingReason: '目前可引用的證據還偏零碎，建議同時點開下方來源快速核對細節。',
    insufficientData: false,
    sections,
    sourceBreakdown: buildSourceBreakdownFromChunksV2(topChunks, citations.map((item) => item.id)),
    followUpHint: '若想更準，可以在問題裡補上 Day、時段、設施名或想達成的目標。'
  };
}

function sanitizeQueryTaxonomy(taxonomy = {}) {
  const safeTaxonomy = taxonomy && typeof taxonomy === 'object' ? taxonomy : {};
  const sanitizeTerms = (items, maxItems = 16, maxLength = 80) => uniqueItems((Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, maxLength))
    .filter(Boolean))
    .slice(0, maxItems);

  return {
    version: sanitizeString(safeTaxonomy.version, 40) || 'fallback',
    aliases: (Array.isArray(safeTaxonomy.aliases) ? safeTaxonomy.aliases : [])
      .map((entry) => ({
        canonical: sanitizeString(entry?.canonical, 80),
        terms: sanitizeTerms([entry?.canonical, ...(Array.isArray(entry?.terms) ? entry.terms : [])], 16, 80)
      }))
      .filter((entry) => entry.canonical && entry.terms.length)
      .slice(0, 160),
    genericClasses: (Array.isArray(safeTaxonomy.genericClasses) ? safeTaxonomy.genericClasses : [])
      .map((entry) => ({
        canonical: sanitizeString(entry?.canonical, 80),
        terms: sanitizeTerms([entry?.canonical, ...(Array.isArray(entry?.terms) ? entry.terms : [])], 12, 80),
        expandsTo: sanitizeTerms(entry?.expandsTo, 10, 80)
      }))
      .filter((entry) => entry.canonical && entry.terms.length)
      .slice(0, 32),
    categoryFamilies: (Array.isArray(safeTaxonomy.categoryFamilies) ? safeTaxonomy.categoryFamilies : [])
      .map((entry) => ({
        id: sanitizeString(entry?.id || entry?.label, 60),
        label: sanitizeString(entry?.label || entry?.id, 80),
        terms: sanitizeTerms([entry?.label, entry?.id, ...(Array.isArray(entry?.terms) ? entry.terms : [])], 16, 80),
        keywords: sanitizeTerms([...(Array.isArray(entry?.keywords) ? entry.keywords : []), ...(Array.isArray(entry?.terms) ? entry.terms : [])], 20, 80)
      }))
      .filter((entry) => entry.label && entry.terms.length)
      .slice(0, 40),
    clusterRelations: (Array.isArray(safeTaxonomy.clusterRelations) ? safeTaxonomy.clusterRelations : [])
      .map((entry) => ({
        key: sanitizeString(entry?.key || entry?.label, 60),
        label: sanitizeString(entry?.label || entry?.key, 80),
        triggers: sanitizeTerms([entry?.label, ...(Array.isArray(entry?.triggers) ? entry.triggers : [])], 16, 80),
        relatedEntities: sanitizeTerms(entry?.relatedEntities, 10, 80),
        relatedCategories: sanitizeTerms(entry?.relatedCategories, 10, 80),
        relatedTerms: sanitizeTerms(entry?.relatedTerms, 16, 80)
      }))
      .filter((entry) => entry.key && entry.triggers.length)
      .slice(0, 80),
    relatedEdges: (Array.isArray(safeTaxonomy.relatedEdges) ? safeTaxonomy.relatedEdges : [])
      .map((entry) => ({
        source: sanitizeString(entry?.source, 80),
        target: sanitizeString(entry?.target, 80),
        relation: sanitizeString(entry?.relation, 60),
        terms: sanitizeTerms(entry?.terms, 12, 80)
      }))
      .filter((entry) => entry.source && entry.target)
      .slice(0, 160),
    capabilityProfiles: (Array.isArray(safeTaxonomy.capabilityProfiles) ? safeTaxonomy.capabilityProfiles : [])
      .map((entry) => ({
        id: sanitizeString(entry?.id || entry?.label, 40),
        label: sanitizeString(entry?.label || entry?.id, 80),
        terms: sanitizeTerms([entry?.label, entry?.id, ...(Array.isArray(entry?.terms) ? entry.terms : [])], 20, 80),
        categoryFamilies: sanitizeTerms(entry?.categoryFamilies, 10, 80),
        preferredSourceTypes: sanitizeTerms(entry?.preferredSourceTypes, 6, 24).map(sanitizeSourceType),
        disallowedCategories: sanitizeTerms(entry?.disallowedCategories, 10, 80)
      }))
      .filter((entry) => entry.id && entry.terms.length)
      .slice(0, 32),
    supportedSourceTypes: sanitizeTerms(safeTaxonomy.supportedSourceTypes, 6, 24).map(sanitizeSourceType)
  };
}

function normalizeComparableQueryText(text) {
  return normalizeQuery(text)
    .toLowerCase()
    .replace(/[\u3000]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryIncludesTerm(normalizedQuery, term) {
  const normalizedTerm = normalizeComparableQueryText(term);
  return Boolean(normalizedTerm) && normalizedQuery.includes(normalizedTerm);
}

function sanitizeInterpretationArray(items, maxItems = 12, maxLength = 80) {
  return uniqueItems((Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, maxLength))
    .filter(Boolean))
    .slice(0, maxItems);
}

function detectCoverageHintsForQuery(normalizedQuery) {
  return uniqueItems([
    ...(queryIncludesTerm(normalizedQuery, '全部') || queryIncludesTerm(normalizedQuery, '所有') || queryIncludesTerm(normalizedQuery, '細節') || queryIncludesTerm(normalizedQuery, '完整')
      ? ['all-details']
      : []),
    ...(queryIncludesTerm(normalizedQuery, '流程') || queryIncludesTerm(normalizedQuery, '步驟') || queryIncludesTerm(normalizedQuery, '怎麼做')
      ? ['all-processes']
      : []),
    ...(queryIncludesTerm(normalizedQuery, '哪些') || queryIncludesTerm(normalizedQuery, '有哪些') || queryIncludesTerm(normalizedQuery, '有什麼') || queryIncludesTerm(normalizedQuery, '清單') || queryIncludesTerm(normalizedQuery, '盤點') || queryIncludesTerm(normalizedQuery, '各項')
      ? ['inventory']
      : []),
    ...(queryIncludesTerm(normalizedQuery, '注意事項') || queryIncludesTerm(normalizedQuery, '風險') || queryIncludesTerm(normalizedQuery, '限制') || queryIncludesTerm(normalizedQuery, '規則')
      ? ['risks']
      : []),
    ...(queryIncludesTerm(normalizedQuery, '比較') || queryIncludesTerm(normalizedQuery, '還是') || queryIncludesTerm(normalizedQuery, '要不要') || queryIncludesTerm(normalizedQuery, '值不值得')
      ? ['comparison']
      : [])
  ]);
}

function detectNegativeTermsForQuery(normalizedQuery) {
  return uniqueItems([
    ...(queryIncludesTerm(normalizedQuery, '不要') || queryIncludesTerm(normalizedQuery, '不用') ? ['不要'] : []),
    ...(queryIncludesTerm(normalizedQuery, '不是') ? ['不是'] : []),
    ...(queryIncludesTerm(normalizedQuery, '排除') || queryIncludesTerm(normalizedQuery, '扣掉') ? ['排除'] : [])
  ]);
}

function findCategoryFamilyByLabel(taxonomy, label) {
  const normalizedLabel = normalizeComparableQueryText(label);
  return taxonomy.categoryFamilies.find((entry) =>
    entry.terms.some((term) => normalizeComparableQueryText(term) === normalizedLabel)
      || normalizeComparableQueryText(entry.label) === normalizedLabel
      || normalizeComparableQueryText(entry.id) === normalizedLabel
  ) || null;
}

function findCanonicalEntityByTerm(taxonomy, term) {
  const normalizedTerm = normalizeComparableQueryText(term);
  if (!normalizedTerm) return null;

  return taxonomy.aliases.find((entry) =>
    normalizeComparableQueryText(entry.canonical) === normalizedTerm
      || entry.terms.some((candidate) => normalizeComparableQueryText(candidate) === normalizedTerm)
  ) || null;
}

function findCapabilityProfileById(taxonomy, capabilityId) {
  const normalizedCapabilityId = normalizeComparableQueryText(capabilityId);
  return (taxonomy.capabilityProfiles || []).find((entry) =>
    normalizeComparableQueryText(entry.id) === normalizedCapabilityId
      || normalizeComparableQueryText(entry.label) === normalizedCapabilityId
  ) || null;
}

function detectCapabilityProfilesForQuery(taxonomy, normalizedQuery) {
  return uniqueItems((taxonomy.capabilityProfiles || [])
    .filter((entry) => entry.terms.some((term) => queryIncludesTerm(normalizedQuery, term)))
    .map((entry) => entry.id))
    .slice(0, 6);
}

function findClusterRelationByKey(taxonomy, key) {
  const normalizedKey = normalizeComparableQueryText(key);
  return taxonomy.clusterRelations.find((entry) =>
    normalizeComparableQueryText(entry.key) === normalizedKey
      || normalizeComparableQueryText(entry.label) === normalizedKey
  ) || null;
}

function getClusterKeysForQueryTerm(taxonomy, term) {
  const normalizedTerm = normalizeComparableQueryText(term);
  if (!normalizedTerm) return [];

  return taxonomy.clusterRelations
    .filter((entry) => {
      const relatedTerms = [
        ...entry.triggers,
        ...entry.relatedEntities,
        ...entry.relatedCategories,
        ...entry.relatedTerms
      ];
      return relatedTerms.some((candidate) => normalizeComparableQueryText(candidate) === normalizedTerm);
    })
    .map((entry) => entry.key);
}

function expandCategoryTermsFromLabels(taxonomy, labels = []) {
  return uniqueItems(labels.flatMap((label) => {
    const entry = findCategoryFamilyByLabel(taxonomy, label);
    if (!entry) return [sanitizeString(label, 80)];
    return [entry.label, ...entry.terms, ...entry.keywords];
  }).map((item) => sanitizeString(item, 80)).filter(Boolean)).slice(0, 24);
}

function expandClusterTermsFromKeys(taxonomy, clusterKeys = []) {
  return uniqueItems(clusterKeys.flatMap((key) => {
    const entry = findClusterRelationByKey(taxonomy, key);
    if (!entry) return [];
    return [entry.label, ...entry.relatedEntities, ...entry.relatedCategories, ...entry.relatedTerms];
  }).map((item) => sanitizeString(item, 80)).filter(Boolean)).slice(0, 24);
}

function expandCanonicalEntitiesFromClusterKeys(taxonomy, clusterKeys = []) {
  return uniqueItems(clusterKeys.flatMap((key) => {
    const entry = findClusterRelationByKey(taxonomy, key);
    if (!entry) return [];
    return (entry.relatedEntities || []).map((item) => findCanonicalEntityByTerm(taxonomy, item)?.canonical || sanitizeString(item, 80));
  }).filter(Boolean)).slice(0, 10);
}

function expandRelatedEdgeTerms(taxonomy, terms = []) {
  const normalizedTerms = uniqueItems((Array.isArray(terms) ? terms : [])
    .map((item) => normalizeComparableQueryText(item))
    .filter(Boolean));
  return uniqueItems((taxonomy.relatedEdges || []).flatMap((entry) => {
    const source = normalizeComparableQueryText(entry.source);
    const target = normalizeComparableQueryText(entry.target);
    if (!normalizedTerms.includes(source) && !normalizedTerms.includes(target)) {
      return [];
    }
    return [entry.source, entry.target, ...(entry.terms || [])];
  }).map((item) => sanitizeString(item, 80)).filter(Boolean)).slice(0, 24);
}

function buildQueryInterpretationFallback(query, taxonomyInput = null) {
  const taxonomy = sanitizeQueryTaxonomy(taxonomyInput);
  const normalizedQuery = normalizeComparableQueryText(query);
  const literalAnchors = sanitizeInterpretationArray(extractKeywordCandidates(query), 12, 60);
  const directCanonicalEntities = uniqueItems(taxonomy.aliases
    .filter((entry) => entry.terms.some((term) => queryIncludesTerm(normalizedQuery, term)))
    .map((entry) => entry.canonical))
    .slice(0, 10);
  const genericClasses = uniqueItems(taxonomy.genericClasses
    .filter((entry) => entry.terms.some((term) => queryIncludesTerm(normalizedQuery, term)))
    .map((entry) => entry.canonical))
    .slice(0, 8);
  const categoryMatches = uniqueItems(taxonomy.categoryFamilies
    .filter((entry) => entry.terms.some((term) => queryIncludesTerm(normalizedQuery, term)))
    .map((entry) => entry.label))
    .slice(0, 10);
  const clusterKeys = uniqueItems([
    ...directCanonicalEntities.flatMap((item) => getClusterKeysForQueryTerm(taxonomy, item)),
    ...literalAnchors.flatMap((item) => getClusterKeysForQueryTerm(taxonomy, item)),
    ...categoryMatches.flatMap((item) => getClusterKeysForQueryTerm(taxonomy, item))
  ]).slice(0, 8);
  const canonicalEntities = uniqueItems([
    ...directCanonicalEntities,
    ...expandCanonicalEntitiesFromClusterKeys(taxonomy, clusterKeys)
  ]).slice(0, 10);
  const expandedCategories = uniqueItems([
    ...genericClasses.flatMap((item) => taxonomy.genericClasses.find((entry) => entry.canonical === item)?.expandsTo || []),
    ...categoryMatches,
    ...clusterKeys.flatMap((item) => findClusterRelationByKey(taxonomy, item)?.relatedCategories || [])
  ]).slice(0, 12);
  const expandedAliases = uniqueItems([
    ...canonicalEntities.flatMap((item) => taxonomy.aliases.find((entry) => entry.canonical === item)?.terms || [item]),
    ...expandRelatedEdgeTerms(taxonomy, [...canonicalEntities, ...genericClasses, ...expandedCategories])
  ]).slice(0, 24);
  const coverageHints = detectCoverageHintsForQuery(normalizedQuery);
  const requiredCapabilities = detectCapabilityProfilesForQuery(taxonomy, normalizedQuery);
  const disallowedCategories = uniqueItems(requiredCapabilities.flatMap((capabilityId) =>
    findCapabilityProfileById(taxonomy, capabilityId)?.disallowedCategories || []
  )).slice(0, 10);
  const negativeTerms = detectNegativeTermsForQuery(normalizedQuery);
  const breadthProfile = coverageHints.includes('all-details') || coverageHints.includes('inventory')
    ? 'maximum-expansion'
    : (genericClasses.length || expandedCategories.length ? 'broad-expansion' : 'guided-expansion');
  const answerIntent = coverageHints.includes('comparison')
    ? 'comparison'
    : ((coverageHints.includes('inventory') || coverageHints.includes('all-details') || !canonicalEntities.length) ? 'inventory' : 'answer');
  const expansionReasons = uniqueItems([
    ...genericClasses.slice(0, 4).map((item) => `泛稱展開：${item}`),
    ...expandedCategories.slice(0, 4).map((item) => `類別補全：${item}`),
    ...clusterKeys.slice(0, 4).map((item) => `主題群組：${item}`)
  ]).slice(0, 10);

  return {
    canonicalQuery: sanitizeString(query, 160),
    literalAnchors,
    canonicalEntities,
    genericClasses,
    requiredCapabilities,
    expandedAliases,
    expandedCategories,
    expandedCategoryTerms: expandCategoryTermsFromLabels(taxonomy, expandedCategories),
    clusterKeys,
    clusterExpansions: expandClusterTermsFromKeys(taxonomy, clusterKeys),
    coverageHints,
    disallowedCategories,
    answerIntent,
    breadthProfile,
    expansionReasons,
    negativeTerms,
    confidence: canonicalEntities.length
      ? 'high'
      : (genericClasses.length || expandedCategories.length || literalAnchors.length ? 'medium' : 'low')
  };
}

function buildQueryInterpretationSchema() {
  return {
    type: 'OBJECT',
    properties: {
      canonicalQuery: { type: 'STRING' },
      literalAnchors: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 12
      },
      canonicalEntities: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 10
      },
      genericClasses: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 8
      },
      requiredCapabilities: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 6
      },
      expandedAliases: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 20
      },
      expandedCategories: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 12
      },
      clusterExpansions: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 16
      },
      coverageHints: {
        type: 'ARRAY',
        items: {
          type: 'STRING',
          enum: ['all-details', 'all-processes', 'inventory', 'risks', 'comparison']
        },
        minItems: 0,
        maxItems: 6
      },
      disallowedCategories: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 10
      },
      answerIntent: { type: 'STRING' },
      breadthProfile: { type: 'STRING' },
      expansionReasons: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 10
      },
      negativeTerms: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 6
      },
      confidence: {
        type: 'STRING',
        enum: ALLOWED_CONFIDENCE
      }
    },
    required: [
      'canonicalQuery',
      'literalAnchors',
      'canonicalEntities',
      'genericClasses',
      'requiredCapabilities',
      'expandedAliases',
      'expandedCategories',
      'clusterExpansions',
      'coverageHints',
      'disallowedCategories',
      'answerIntent',
      'breadthProfile',
      'expansionReasons',
      'negativeTerms',
      'confidence'
    ]
  };
}

function buildQueryInterpretationPrompt(query, taxonomyInput = null) {
  const taxonomy = sanitizeQueryTaxonomy(taxonomyInput);
  const aliasDump = taxonomy.aliases
    .map((entry) => `- ${entry.canonical}: ${entry.terms.join(' / ')}`)
    .join('\n');
  const classDump = taxonomy.genericClasses
    .map((entry) => `- ${entry.canonical}: ${entry.terms.join(' / ')} -> ${entry.expandsTo.join(' / ')}`)
    .join('\n');
  const clusterDump = taxonomy.clusterRelations
    .map((entry) => `- ${entry.key}: triggers=${entry.triggers.join(' / ')} | related=${[...entry.relatedEntities, ...entry.relatedCategories, ...entry.relatedTerms].join(' / ')}`)
    .join('\n');
  const relatedEdgeDump = (taxonomy.relatedEdges || [])
    .map((entry) => `- ${entry.source} -> ${entry.target}: ${entry.relation || 'related'} | ${entry.terms.join(' / ')}`)
    .join('\n');

  return `你是站內搜尋的查詢解譯助手，任務是把自然語言問題轉成可檢索的語意輪廓，不直接回答問題。

請嚴格遵守：
1. 全部輸出使用繁體中文。
2. 只根據使用者原句與提供的 taxonomy 做理解，不可捏造網站沒有的專有名詞。
3. canonicalEntities 要優先抽出主題主體，例如「禮賓」「劇院」「Room Service」。
4. genericClasses 要抽出泛稱概念，例如「設施」「服務」「表演」。
5. expandedAliases 要補中英別名與常見寫法。
6. expandedCategories 要補泛稱展開後的重要類別，但不能亂加太多無關分類。
7. clusterExpansions 要補同主題常一起檢索的群組詞。
8. coverageHints 只能用：all-details / all-processes / inventory / risks / comparison。
9. breadthProfile 只能描述展開力度，例如 guided-expansion / broad-expansion / maximum-expansion。
10. expansionReasons 要用簡短片語說明為什麼要擴張，例如「泛稱展開：設施」「同主題群：劇院體驗群」。
11. negativeTerms 只保留明確排除詞，例如「不要」「不是」「排除」。
12. confidence 只能是 high / medium / low。

taxonomy aliases:
${aliasDump || '- 無'}

taxonomy generic classes:
${classDump || '- 無'}

taxonomy clusters:
${clusterDump || '- 無'}

taxonomy related edges:
${relatedEdgeDump || '- 無'}

使用者問題：
${query}`;
}

function buildQueryInterpretationPromptV3(query, taxonomyInput = null) {
  const taxonomy = sanitizeQueryTaxonomy(taxonomyInput);
  const aliasDump = taxonomy.aliases
    .map((entry) => `- ${entry.canonical}: ${entry.terms.join(' / ')}`)
    .join('\n');
  const classDump = taxonomy.genericClasses
    .map((entry) => `- ${entry.canonical}: ${entry.terms.join(' / ')} -> ${entry.expandsTo.join(' / ')}`)
    .join('\n');
  const clusterDump = taxonomy.clusterRelations
    .map((entry) => `- ${entry.key}: triggers=${entry.triggers.join(' / ')} | related=${[...entry.relatedEntities, ...entry.relatedCategories, ...entry.relatedTerms].join(' / ')}`)
    .join('\n');
  const relatedEdgeDump = (taxonomy.relatedEdges || [])
    .map((entry) => `- ${entry.source} -> ${entry.target}: ${entry.relation || 'related'} | ${entry.terms.join(' / ')}`)
    .join('\n');
  const capabilityDump = (taxonomy.capabilityProfiles || [])
    .map((entry) => `- ${entry.id}: ${entry.terms.join(' / ')} | categories=${entry.categoryFamilies.join(' / ') || 'none'} | disallow=${entry.disallowedCategories.join(' / ') || 'none'}`)
    .join('\n');

  return `You are a query planner for a cruise guide website.
Return JSON only. Do not answer the user question.

Extract and normalize:
- canonicalQuery
- literalAnchors
- canonicalEntities
- genericClasses
- requiredCapabilities
- expandedAliases
- expandedCategories
- clusterExpansions
- coverageHints
- disallowedCategories
- answerIntent
- breadthProfile
- expansionReasons
- negativeTerms
- confidence

Rules:
1. Keep explicit entities, time, negation, and comparison grounded in the query.
2. Treat words like process, details, notes, worth-it, and should-I as coverage hints, not as hard search filters.
3. If the query asks what facilities can do something, convert that something into requiredCapabilities.
4. If a capability implies exclusions, list them in disallowedCategories.
5. Use the taxonomy only as the allowed expansion boundary.
6. answerIntent should be one of: answer, inventory, comparison.
7. breadthProfile should be one of: guided-expansion, broad-expansion, maximum-expansion.

taxonomy aliases:
${aliasDump || '- none'}

taxonomy generic classes:
${classDump || '- none'}

taxonomy clusters:
${clusterDump || '- none'}

taxonomy related edges:
${relatedEdgeDump || '- none'}

taxonomy capability profiles:
${capabilityDump || '- none'}

query:
${query}`;
}

function finalizeQueryInterpretation(modelOutput, query, taxonomyInput = null) {
  const taxonomy = sanitizeQueryTaxonomy(taxonomyInput);
  const fallback = buildQueryInterpretationFallback(query, taxonomy);
  const safeOutput = modelOutput && typeof modelOutput === 'object' ? modelOutput : {};
  const canonicalEntities = uniqueItems([
    ...fallback.canonicalEntities,
    ...sanitizeInterpretationArray(safeOutput.canonicalEntities, 10, 80)
      .map((item) => findCanonicalEntityByTerm(taxonomy, item)?.canonical || sanitizeString(item, 80))
  ]).slice(0, 10);
  const genericClasses = uniqueItems([
    ...fallback.genericClasses,
    ...sanitizeInterpretationArray(safeOutput.genericClasses, 8, 80)
      .map((item) => taxonomy.genericClasses.find((entry) =>
        entry.terms.some((term) => normalizeComparableQueryText(term) === normalizeComparableQueryText(item))
      )?.canonical || sanitizeString(item, 80))
  ]).slice(0, 8);
  const expandedCategories = uniqueItems([
    ...fallback.expandedCategories,
    ...sanitizeInterpretationArray(safeOutput.expandedCategories, 12, 80)
      .map((item) => findCategoryFamilyByLabel(taxonomy, item)?.label || sanitizeString(item, 80)),
    ...genericClasses.flatMap((item) => taxonomy.genericClasses.find((entry) => entry.canonical === item)?.expandsTo || [])
  ]).slice(0, 12);
  const clusterKeys = uniqueItems([
    ...fallback.clusterKeys,
    ...sanitizeInterpretationArray(safeOutput.clusterExpansions, 16, 80).flatMap((item) => {
      const direct = findClusterRelationByKey(taxonomy, item);
      if (direct) return [direct.key];
      return getClusterKeysForQueryTerm(taxonomy, item);
    }),
    ...canonicalEntities.flatMap((item) => getClusterKeysForQueryTerm(taxonomy, item))
  ]).slice(0, 8);
  const normalizedCanonicalEntities = uniqueItems([
    ...canonicalEntities,
    ...expandCanonicalEntitiesFromClusterKeys(taxonomy, clusterKeys)
  ]).slice(0, 10);
  const expandedAliases = uniqueItems([
    ...fallback.expandedAliases,
    ...sanitizeInterpretationArray(safeOutput.expandedAliases, 20, 80),
    ...normalizedCanonicalEntities.flatMap((item) => taxonomy.aliases.find((entry) => entry.canonical === item)?.terms || [item]),
    ...expandRelatedEdgeTerms(taxonomy, [...normalizedCanonicalEntities, ...genericClasses, ...expandedCategories])
  ]).slice(0, 28);
  const coverageHints = uniqueItems([
    ...fallback.coverageHints,
    ...sanitizeInterpretationArray(safeOutput.coverageHints, 6, 24)
      .map((item) => normalizeComparableQueryText(item))
      .filter((item) => ['all-details', 'all-processes', 'inventory', 'risks', 'comparison'].includes(item))
  ]).slice(0, 6);
  const requiredCapabilities = uniqueItems([
    ...fallback.requiredCapabilities,
    ...sanitizeInterpretationArray(safeOutput.requiredCapabilities, 6, 40)
      .map((item) => findCapabilityProfileById(taxonomy, item)?.id || sanitizeString(item, 40))
  ]).slice(0, 6);
  const disallowedCategories = uniqueItems([
    ...fallback.disallowedCategories,
    ...sanitizeInterpretationArray(safeOutput.disallowedCategories, 10, 80),
    ...requiredCapabilities.flatMap((capabilityId) => findCapabilityProfileById(taxonomy, capabilityId)?.disallowedCategories || [])
  ]).slice(0, 10);
  const negativeTerms = uniqueItems([
    ...fallback.negativeTerms,
    ...sanitizeInterpretationArray(safeOutput.negativeTerms, 6, 60)
  ]).slice(0, 6);
  const breadthProfile = sanitizeString(safeOutput?.breadthProfile, 40)
    || (coverageHints.includes('all-details') || coverageHints.includes('inventory')
      ? 'maximum-expansion'
      : (genericClasses.length || expandedCategories.length ? 'broad-expansion' : 'guided-expansion'));
  const expansionReasons = uniqueItems([
    ...sanitizeInterpretationArray(safeOutput?.expansionReasons, 10, 120),
    ...genericClasses.slice(0, 4).map((item) => `泛稱展開：${item}`),
    ...expandedCategories.slice(0, 4).map((item) => `類別補全：${item}`),
    ...clusterKeys.slice(0, 4).map((item) => `主題群組：${item}`)
  ]).slice(0, 10);

  return {
    canonicalQuery: sanitizeString(safeOutput.canonicalQuery || fallback.canonicalQuery || query, 160),
    literalAnchors: uniqueItems([
      ...fallback.literalAnchors,
      ...sanitizeInterpretationArray(safeOutput.literalAnchors, 12, 60)
    ]).slice(0, 12),
    canonicalEntities: normalizedCanonicalEntities,
    genericClasses,
    requiredCapabilities,
    expandedAliases,
    expandedCategories,
    clusterExpansions: uniqueItems([
      ...fallback.clusterExpansions,
      ...sanitizeInterpretationArray(safeOutput.clusterExpansions, 16, 80),
      ...expandClusterTermsFromKeys(taxonomy, clusterKeys)
    ]).slice(0, 24),
    coverageHints,
    disallowedCategories,
    answerIntent: sanitizeString(safeOutput?.answerIntent, 24).toLowerCase() || fallback.answerIntent || 'answer',
    breadthProfile,
    expansionReasons,
    negativeTerms,
    confidence: safeOutput?.confidence === 'high'
      ? 'high'
      : ((normalizedCanonicalEntities.length || genericClasses.length || expandedCategories.length) ? 'medium' : fallback.confidence)
  };
}

function buildRewriteFallback(query, chunks) {
  const keywords = uniqueItems([
    ...extractKeywordCandidates(query),
    ...chunks.flatMap((chunk) => chunk.title.split(/[\s:/()\-]+/))
  ]
    .map((item) => sanitizeString(item, 40))
    .filter((item) => item.length >= 2))
    .slice(0, 6);

  const alternates = uniqueItems(chunks
    .map((chunk) => sanitizeString(chunk.title, 80))
    .filter(Boolean))
    .slice(0, 4);

  return {
    rewrittenQuery: sanitizeString(keywords.join(' '), 160),
    keywords,
    alternates,
    confidence: keywords.length >= 3 ? 'medium' : 'low'
  };
}

async function callGemini(env, mode, query, chunks, options = {}) {
  const apiKey = String(env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = String(env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim();
  const isRewriteMode = mode === 'query_rewrite_v1';
  const isInterpreterMode = mode === 'query_interpretation_v1' || mode === 'query_interpretation_v2' || mode === 'query_interpretation_v3';
  const isReportMode = !isRewriteMode && !isInterpreterMode && sanitizeResponseMode(options.responseMode) === 'report';
  const schema = isRewriteMode
    ? buildRewriteSchema()
    : (isInterpreterMode ? buildQueryInterpretationSchema() : (isReportMode ? buildGroundedSchemaV4() : buildGroundedSchemaV2()));
  const prompt = isRewriteMode
    ? buildRewritePrompt(query, chunks)
    : (isInterpreterMode
      ? buildQueryInterpretationPromptV3(query, options.taxonomy || null)
      : buildGroundedCoveragePromptV6(query, chunks, options.responseMode || 'compact', options.analysisPlan || null, options));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: isRewriteMode ? 0.2 : (isInterpreterMode ? 0.15 : 0.12),
          maxOutputTokens: isRewriteMode
            ? 500
            : (isInterpreterMode
              ? 1400
              : (options.responseMode === 'report'
                ? (options.answerDepthMode === 'exhaustive' ? 7800 : 6800)
                : 1600)),
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      })
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.error?.message || 'Gemini request failed');
  }

  const candidateText = extractCandidateText(data);
  const parsed = safeJsonParse(candidateText);
  if (!parsed) {
    throw new Error('Gemini returned invalid JSON');
  }

  return parsed;
}

function finalizeGroundedAnswer(modelOutput, chunks, query, responseMode = 'compact', options = {}) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const citationIds = uniqueItems((Array.isArray(modelOutput?.citationIds) ? modelOutput.citationIds : [])
    .map((item) => sanitizeString(item, 120))
    .filter((item) => chunkMap.has(item)));

  const citations = citationIds.map((id) => {
    const chunk = chunkMap.get(id);
    return {
      id: chunk.id,
      title: chunk.title,
      locationLabel: chunk.locationLabel,
      navTarget: chunk.navTarget
    };
  });

  const primarySourceType = ALLOWED_SOURCE_TYPES.includes(modelOutput?.primarySourceType)
    ? modelOutput.primarySourceType
    : citations[0]
      ? chunkMap.get(citations[0].id)?.sourceType || 'static'
      : chunks[0]?.sourceType || 'static';

  const answer = sanitizeString(modelOutput?.answer, responseMode === 'report' ? 3200 : 1800);
  const bullets = sanitizeTextArray(modelOutput?.bullets, responseMode === 'report' ? 16 : 8, 240);
  const sections = normalizeSections(modelOutput?.sections, answer, bullets);
  const sourceBreakdown = normalizeSourceBreakdown(modelOutput?.sourceBreakdown, chunks, citationIds);
  const followUpHint = sanitizeString(modelOutput?.followUpHint, 160);
  const payload = {
    answer: answer || sections.directAnswer,
    bullets: bullets.length ? bullets : sections.recommendedSteps.slice(0, 4),
    citations,
    confidence: sanitizeConfidence(modelOutput?.confidence),
    primarySourceType,
    missingReason: sanitizeString(modelOutput?.missingReason, 220),
    insufficientData: Boolean(modelOutput?.insufficientData),
    sections,
    sourceBreakdown,
    followUpHint
  };

  if (payload.insufficientData) {
    return buildInsufficientDataPayload(
      payload.answer || `目前站內資料還不足以直接回答「${query}」。`,
      {
        bullets: payload.bullets,
        citations,
        primarySourceType,
        missingReason: payload.missingReason,
        sections,
        sourceBreakdown,
        followUpHint,
        chunks,
        responseMode
      }
    );
  }

  if (!payload.answer || !payload.citations.length) {
    return buildLowConfidenceFallback(query, chunks, {
      responseMode,
      parentBriefs: options.parentBriefs,
      sectionDossiers: options.sectionDossiers,
      coverageStats: options.coverageStats,
      coverageContract: options.coverageContract
    });
  }

  if (responseMode === 'report') {
    payload.report = normalizeReportObject(
      modelOutput?.report,
      citationIds,
      chunks,
      payload.answer,
      sections,
      sourceBreakdown,
      followUpHint,
      payload.missingReason,
      {
        parentBriefs: options.parentBriefs || [],
        primaryEntityParents: options.primaryEntityParents || [],
        supportEntityParents: options.supportEntityParents || [],
        capabilityCoveragePlan: options.capabilityCoveragePlan || null,
        sectionDossiers: options.sectionDossiers || [],
        sectionWritingRules: options.sectionWritingRules || {},
        categoryDossiers: options.categoryDossiers || [],
        coverageStats: options.coverageStats || null,
        coverageContract: options.coverageContract || null
      }
    );
  }

  if (!payload.bullets.length && payload.report?.recommendedPlan?.length) {
    payload.bullets = payload.report.recommendedPlan.slice(0, 8);
  } else if (!payload.bullets.length && payload.report?.fullCardInventory?.length) {
    payload.bullets = payload.report.fullCardInventory
      .flatMap((item) => item.detailBullets || [])
      .slice(0, 12);
  } else if (!payload.bullets.length && payload.report?.topicAppendix?.length) {
    payload.bullets = payload.report.topicAppendix
      .flatMap((item) => item.detailItems || [])
      .slice(0, 12);
  } else if (!payload.bullets.length && payload.report?.topicGroups?.length) {
    payload.bullets = payload.report.topicGroups
      .flatMap((group) => group.detailItems || [])
      .slice(0, 12);
  }

  return payload;
}

function finalizeRewriteOutput(modelOutput, query, chunks) {
  const keywords = uniqueItems((Array.isArray(modelOutput?.keywords) ? modelOutput.keywords : [])
    .map((item) => sanitizeString(item, 40))
    .filter((item) => item.length >= 2))
    .slice(0, 6);

  const alternates = uniqueItems((Array.isArray(modelOutput?.alternates) ? modelOutput.alternates : [])
    .map((item) => sanitizeString(item, 80))
    .filter(Boolean))
    .slice(0, 4);

  const rewrittenQuery = sanitizeString(modelOutput?.rewrittenQuery, 160) || keywords.join(' ');

  if (!rewrittenQuery && !keywords.length && !alternates.length) {
    return buildRewriteFallback(query, chunks);
  }

  return {
    rewrittenQuery,
    keywords,
    alternates,
    confidence: sanitizeConfidence(modelOutput?.confidence)
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: createCorsHeaders()
      });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/api/ai-answer') {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    if (request.method === 'GET' && url.searchParams.get('health') === '1') {
      return jsonResponse(buildHealthPayload(env));
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const query = normalizeQuery(body?.query).slice(0, MAX_QUERY_LENGTH);
    const mode = body?.mode === 'query_rewrite_v1'
      ? 'query_rewrite_v1'
      : ((body?.mode === 'query_interpretation_v1' || body?.mode === 'query_interpretation_v2' || body?.mode === 'query_interpretation_v3')
        ? 'query_interpretation_v3'
        : 'grounded_qa_v1');
    const responseMode = mode === 'query_rewrite_v1' || mode === 'query_interpretation_v3'
      ? 'compact'
      : sanitizeResponseMode(body?.responseMode);
    const taxonomy = sanitizeQueryTaxonomy(body?.taxonomy);
    const analysisPlan = sanitizeAnalysisPlan(body?.analysisPlan, responseMode);
    const chunks = sanitizeChunks(
      body?.chunks,
      mode === 'query_rewrite_v1'
        ? REWRITE_MAX_CHUNKS
        : (responseMode === 'report' ? MAX_CHUNKS : COMPACT_MAX_CHUNKS)
    );
    const mustRenderParents = sanitizeParentBriefs(body?.mustRenderParents, chunks.map((chunk) => chunk.id));
    const mustRenderVisibleParents = sanitizeParentBriefs(body?.mustRenderVisibleParents, chunks.map((chunk) => chunk.id))
      .map((item) => ({ ...item, coverageTier: 'visible' }));
    const mustRenderDerivedParents = sanitizeParentBriefs(body?.mustRenderDerivedParents, chunks.map((chunk) => chunk.id))
      .map((item) => ({ ...item, coverageTier: 'derived' }));
    const preferredRenderParents = sanitizeParentBriefs(body?.preferredRenderParents, chunks.map((chunk) => chunk.id));
    const preferredSupportParents = sanitizeParentBriefs(body?.preferredSupportParents, chunks.map((chunk) => chunk.id))
      .map((item) => ({ ...item, coverageTier: 'support' }));
    const requestedParentBriefs = sanitizeParentBriefs(body?.parentDossiers || body?.parentBriefs, chunks.map((chunk) => chunk.id));
    const parentBriefMap = new Map();
    [...mustRenderVisibleParents, ...mustRenderDerivedParents, ...mustRenderParents, ...requestedParentBriefs, ...preferredRenderParents, ...preferredSupportParents].forEach((item) => {
      if (item?.parentId && !parentBriefMap.has(item.parentId)) {
        parentBriefMap.set(item.parentId, item);
      }
    });
    const parentBriefs = Array.from(parentBriefMap.values()).slice(0, MAX_PARENT_BRIEFS);
    const categoryDossiers = sanitizeCategoryDossiers(body?.categoryDossiers || body?.categoryCoveragePlan);
    const primaryEntityParents = sanitizeParentBriefs(body?.primaryEntityParents, chunks.map((chunk) => chunk.id));
    const supportEntityParents = sanitizeParentBriefs(body?.supportEntityParents, chunks.map((chunk) => chunk.id));
    const capabilityCoveragePlan = sanitizeCapabilityCoveragePlan(body?.capabilityCoveragePlan);
    const articleMode = sanitizeString(body?.articleMode, 40) === 'longform-by-section'
      ? 'longform-by-section'
      : (sanitizeString(body?.articleMode, 40) === 'longform-by-block' ? 'longform-by-block' : 'standard');
    const sectionDossiers = sanitizeSectionDossiers(body?.sectionDossiers || body?.cardDossiersByBlock);
    const sectionWritingRules = sanitizeSectionWritingRules(body?.sectionWritingRules);
    const coverageContract = sanitizeCoverageContract(body?.coverageContract);
    const coverageStats = sanitizeCoverageStats(body?.coverageStats);
    const answerDepthMode = sanitizeString(body?.answerDepthMode, 24) === 'exhaustive' ? 'exhaustive' : 'broad';

    if (mode === 'query_interpretation_v3') {
      if (getQuerySignalLength(query) < 2) {
        return jsonResponse(buildQueryInterpretationFallback(query, taxonomy));
      }

      try {
        const modelOutput = await callGemini(env, mode, query, [], {
          taxonomy
        });
        return jsonResponse(finalizeQueryInterpretation(modelOutput, query, taxonomy));
      } catch {
        return jsonResponse(buildQueryInterpretationFallback(query, taxonomy));
      }
    }

    if (getQuerySignalLength(query) < MIN_QUERY_SIGNAL) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }

      return jsonResponse(buildInsufficientDataPayload(
        '問題太短了，站內資料還抓不到足夠線索來整理 AI 解答。',
        {
          missingReason: '請把問題補到至少 6 個字，最好直接帶上 Day、時段、設施或想完成的步驟。',
          chunks,
          responseMode,
          parentBriefs,
          categoryDossiers,
          coverageStats,
          coverageContract
        }
      ));
    }

    if ((mode === 'query_rewrite_v1' && chunks.length < MIN_REWRITE_CHUNKS) || (mode !== 'query_rewrite_v1' && chunks.length < MIN_CHUNKS)) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }

      return jsonResponse(buildInsufficientDataPayload(
        '目前命中的站內片段還不夠，無法整理成穩定答案。',
        {
          missingReason: '至少需要兩個可引用的站內片段，才能把步驟、限制或時機整理得更可靠。',
          chunks,
          responseMode,
          parentBriefs,
          categoryDossiers,
          coverageStats,
          coverageContract
        }
      ));
    }

    try {
      const modelOutput = await callGemini(env, mode, query, chunks, {
        responseMode,
        analysisPlan,
        taxonomy,
        parentBriefs,
        parentDossiers: parentBriefs,
        primaryEntityParents,
        supportEntityParents,
        capabilityCoveragePlan,
        articleMode,
        sectionDossiers,
        sectionWritingRules,
        categoryCoveragePlan: categoryDossiers,
        categoryDossiers,
        answerDepthMode,
        coverageStats,
        coverageContract
      });
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(finalizeRewriteOutput(modelOutput, query, chunks));
      }

      return jsonResponse(finalizeGroundedAnswer(modelOutput, chunks, query, responseMode, {
        parentBriefs,
        categoryDossiers,
        primaryEntityParents,
        supportEntityParents,
        capabilityCoveragePlan,
        articleMode,
        sectionDossiers,
        sectionWritingRules,
        answerDepthMode,
        coverageStats,
        coverageContract
      }));
    } catch (error) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }

      return jsonResponse(buildLowConfidenceFallback(query, chunks, {
        responseMode,
        parentBriefs,
        categoryDossiers,
        primaryEntityParents,
        supportEntityParents,
        capabilityCoveragePlan,
        articleMode,
        sectionDossiers,
        sectionWritingRules,
        answerDepthMode,
        coverageStats,
        coverageContract,
        workerFallbackReason: error?.message || 'Gemini request failed'
      }));
    }
  }
};
