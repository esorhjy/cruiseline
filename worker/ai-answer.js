const MAX_CHUNKS = 8;
const MIN_CHUNKS = 2;
const MIN_REWRITE_CHUNKS = 1;
const MAX_QUERY_LENGTH = 500;
const MAX_TEXT_LENGTH = 560;
const MIN_QUERY_SIGNAL = 6;
const ALLOWED_SOURCE_TYPES = ['schedule', 'deck', 'show', 'playbook', 'static'];
const ALLOWED_SOURCE_DETAIL_TYPES = ['official', 'concierge', 'community', 'general'];
const ALLOWED_CONFIDENCE = ['high', 'medium', 'low'];

function createCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
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

function sanitizeConfidence(confidence) {
  return ALLOWED_CONFIDENCE.includes(confidence) ? confidence : 'low';
}

function sanitizeTextArray(items, maxItems, maxLength) {
  return (Array.isArray(items) ? items : [])
    .map((item) => sanitizeString(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeChunks(chunks) {
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
    .slice(0, MAX_CHUNKS);
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
  const recommendedSteps = sanitizeTextArray(safeSections.recommendedSteps || fallbackBullets, 4, 180);
  const whyThisWorks = sanitizeTextArray(safeSections.whyThisWorks, 3, 180);
  const watchOuts = sanitizeTextArray(safeSections.watchOuts, 3, 180);

  return {
    directAnswer: sanitizeString(safeSections.directAnswer || fallbackAnswer, 600),
    recommendedSteps,
    whyThisWorks,
    watchOuts
  };
}

function normalizeSourceBreakdown(items = [], fallbackChunks = [], citationIds = []) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => ({
      type: sanitizeSourceDetailType(item?.type || item?.sourceDetailType),
      summary: sanitizeString(item?.summary, 180)
    }))
    .filter((item) => item.summary)
    .slice(0, 4);

  return normalized.length ? normalized : buildSourceBreakdownFromChunks(fallbackChunks, citationIds);
}

function buildGroundedPrompt(query, chunks) {
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
  return {
    type: 'OBJECT',
    properties: {
      answer: { type: 'STRING' },
      bullets: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: 4
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
      citationIds: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        minItems: 0,
        maxItems: MAX_CHUNKS
      },
      insufficientData: { type: 'BOOLEAN' },
      sections: {
        type: 'OBJECT',
        properties: {
          directAnswer: { type: 'STRING' },
          recommendedSteps: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 4
          },
          whyThisWorks: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 3
          },
          watchOuts: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 0,
            maxItems: 3
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
      followUpHint: { type: 'STRING' }
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
  const answer = sanitizeString(
    message || '目前站內命中的內容還不足以整理出穩定答案，建議把問題再問得更具體一點。',
    600
  );
  const bullets = sanitizeTextArray(options.bullets, 4, 180);
  const citations = Array.isArray(options.citations) ? options.citations.slice(0, MAX_CHUNKS) : [];
  const sections = normalizeSections(options.sections, answer, bullets);
  const sourceBreakdown = normalizeSourceBreakdown(options.sourceBreakdown, options.chunks || [], citations.map((item) => item.id));

  return {
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

function buildLowConfidenceFallback(query, chunks) {
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
    answer,
    bullets,
    citations,
    confidence: 'low',
    primarySourceType,
    missingReason: '目前可引用的證據還偏零碎，建議同時點開下方來源快速核對細節。',
    insufficientData: false,
    sections,
    sourceBreakdown: buildSourceBreakdownFromChunks(topChunks, citations.map((item) => item.id)),
    followUpHint: '若想更準，可以在問題裡補上 Day、時段、設施名或想達成的目標。'
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

async function callGemini(env, mode, query, chunks) {
  const apiKey = String(env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = String(env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim();
  const schema = mode === 'query_rewrite_v1' ? buildRewriteSchema() : buildGroundedSchema();
  const prompt = mode === 'query_rewrite_v1'
    ? buildRewritePrompt(query, chunks)
    : buildGroundedPrompt(query, chunks);

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
          temperature: 0.2,
          maxOutputTokens: mode === 'query_rewrite_v1' ? 500 : 1100,
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

function finalizeGroundedAnswer(modelOutput, chunks, query) {
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

  const answer = sanitizeString(modelOutput?.answer, 600);
  const bullets = sanitizeTextArray(modelOutput?.bullets, 4, 180);
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
        chunks
      }
    );
  }

  if (!payload.answer || !payload.citations.length) {
    return buildLowConfidenceFallback(query, chunks);
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
    const mode = body?.mode === 'query_rewrite_v1' ? 'query_rewrite_v1' : 'grounded_qa_v1';
    const chunks = sanitizeChunks(body?.chunks);

    if (getQuerySignalLength(query) < MIN_QUERY_SIGNAL) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }

      return jsonResponse(buildInsufficientDataPayload(
        '問題太短了，站內資料還抓不到足夠線索來整理 AI 解答。',
        {
          missingReason: '請把問題補到至少 6 個字，最好直接帶上 Day、時段、設施或想完成的步驟。',
          chunks
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
          chunks
        }
      ));
    }

    try {
      const modelOutput = await callGemini(env, mode, query, chunks);
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(finalizeRewriteOutput(modelOutput, query, chunks));
      }

      return jsonResponse(finalizeGroundedAnswer(modelOutput, chunks, query));
    } catch (error) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }

      return jsonResponse({
        error: 'Gemini request failed',
        detail: error?.message || 'Unknown error'
      }, 502);
    }
  }
};
