const MAX_CHUNKS = 6;
const MIN_CHUNKS = 2;
const MIN_REWRITE_CHUNKS = 1;
const MAX_QUERY_LENGTH = 500;
const MAX_TEXT_LENGTH = 420;
const MIN_QUERY_SIGNAL = 6;
const ALLOWED_SOURCE_TYPES = ['schedule', 'deck', 'show', 'playbook', 'static'];

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

function sanitizeChunks(chunks) {
  return (Array.isArray(chunks) ? chunks : [])
    .map((chunk) => ({
      id: sanitizeString(chunk?.id, 120),
      title: sanitizeString(chunk?.title, 160),
      locationLabel: sanitizeString(chunk?.locationLabel, 200),
      sectionId: sanitizeString(chunk?.sectionId, 80),
      sourceType: sanitizeSourceType(chunk?.sourceType),
      navTarget: sanitizeNavTarget(chunk?.navTarget),
      text: sanitizeString(chunk?.text, MAX_TEXT_LENGTH)
    }))
    .filter((chunk) => chunk.id && chunk.title && chunk.text)
    .slice(0, MAX_CHUNKS);
}

function buildGroundedPrompt(query, chunks) {
  const sourceDump = chunks
    .map((chunk, index) => {
      return [
        `[#${index + 1}]`,
        `id: ${chunk.id}`,
        `sourceType: ${chunk.sourceType}`,
        `title: ${chunk.title}`,
        `locationLabel: ${chunk.locationLabel || '未標示位置'}`,
        `sectionId: ${chunk.sectionId || 'unknown'}`,
        `text: ${chunk.text}`
      ].join('\n');
    })
    .join('\n\n');

  return `你是「郵輪攻略站內解答助手」，只能根據提供的站內片段回答。

規則：
1. 只能使用下方 sources 的內容回答，不可使用任何外部知識補空白。
2. 若問題是「先做什麼／怎麼安排」，請以建議順序回答。
3. 若 sources 同時有總覽型內容與細節型卡片，優先根據最具體的卡片回答。
4. schedule 只能補充順序與時段，不可蓋過 playbook、deck、show 的細節。
5. 每一個 bullet 都必須能被至少一個 source 支撐。
6. 若資料不足，請明確指出不足，不可幻想。
7. 使用和使用者相同的語言作答（本題通常是繁體中文）。
8. primarySourceType 請填最主要依據的來源類型：schedule / deck / show / playbook / static。

使用者問題：
${query}

sources:
${sourceDump}`;
}

function buildRewritePrompt(query, chunks) {
  const sourceDump = chunks
    .map((chunk, index) => {
      return [
        `[#${index + 1}] ${chunk.title}`,
        `sourceType: ${chunk.sourceType}`,
        `locationLabel: ${chunk.locationLabel || '未標示位置'}`,
        `text: ${chunk.text}`
      ].join('\n');
    })
    .join('\n\n');

  return `你是「郵輪攻略站內搜尋改寫助手」，只能幫忙把問題改寫成更適合站內搜尋的詞，不可以直接回答問題。

規則：
1. 只能根據下方 sources 的語彙改寫，不可加入外部世界知識。
2. rewrittenQuery 要更像站內卡片標題或常見別名。
3. keywords 請提供 3 到 6 個最有用的搜尋詞。
4. alternates 請提供 2 到 4 個替代表達。
5. confidence 只能填 high / medium / low。

使用者問題：
${query}

可參考的站內語彙：
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
        enum: ['high', 'medium', 'low']
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
      insufficientData: { type: 'BOOLEAN' }
    },
    required: ['answer', 'bullets', 'confidence', 'primarySourceType', 'citationIds', 'insufficientData']
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
        enum: ['high', 'medium', 'low']
      }
    },
    required: ['rewrittenQuery', 'keywords', 'alternates', 'confidence']
  };
}

function buildInsufficientDataPayload(message) {
  return {
    answer: message,
    bullets: [],
    citations: [],
    confidence: 'low',
    primarySourceType: 'static',
    missingReason: '目前站內沒有足夠片段可支撐更完整的回答。',
    insufficientData: true
  };
}

function normalizeConfidence(confidence) {
  return ['high', 'medium', 'low'].includes(confidence) ? confidence : 'low';
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
  const topChunks = chunks.slice(0, 3);
  const primarySourceType = topChunks[0]?.sourceType || 'static';
  const citations = topChunks.map((chunk) => ({
    id: chunk.id,
    title: chunk.title,
    locationLabel: chunk.locationLabel,
    navTarget: chunk.navTarget
  }));

  const bullets = topChunks.map((chunk) => {
    const text = chunk.text || '';
    return text.length > 90 ? `${text.slice(0, 90).trim()}…` : text;
  }).filter(Boolean);

  return {
    answer: `我先根據目前最相關的站內卡片整理重點，這題和「${query}」最接近的資料在下方引用來源。`,
    bullets,
    citations,
    confidence: 'low',
    primarySourceType,
    missingReason: '這次主要依據少量站內片段整理，建議點引用來源直接查看原文。',
    insufficientData: false
  };
}

function buildRewriteFallback(query, chunks) {
  const keywords = uniqueItems([
    ...extractKeywordCandidates(query),
    ...chunks.flatMap((chunk) => chunk.title.split(/[／/、\s:：()-]+/))
  ].map((item) => sanitizeString(item, 40))).filter((item) => item.length >= 2).slice(0, 6);

  const alternates = uniqueItems(chunks
    .map((chunk) => sanitizeString(chunk.title, 80))
    .filter(Boolean))
    .slice(0, 4);

  return {
    rewrittenQuery: keywords.join(' '),
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
          maxOutputTokens: mode === 'query_rewrite_v1' ? 500 : 700,
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

  const payload = {
    answer: sanitizeString(modelOutput?.answer, 600),
    bullets: (Array.isArray(modelOutput?.bullets) ? modelOutput.bullets : [])
      .map((item) => sanitizeString(item, 180))
      .filter(Boolean)
      .slice(0, 4),
    citations,
    confidence: normalizeConfidence(modelOutput?.confidence),
    primarySourceType,
    missingReason: sanitizeString(modelOutput?.missingReason, 220),
    insufficientData: Boolean(modelOutput?.insufficientData)
  };

  if (!payload.answer || !payload.citations.length || payload.insufficientData) {
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
    confidence: normalizeConfidence(modelOutput?.confidence)
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
      return jsonResponse(buildInsufficientDataPayload('問題太短，請至少輸入 6 個字以上，AI 才能根據站內資料整理答案。'));
    }

    if ((mode === 'query_rewrite_v1' && chunks.length < MIN_REWRITE_CHUNKS) || (mode !== 'query_rewrite_v1' && chunks.length < MIN_CHUNKS)) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }
      return jsonResponse(buildInsufficientDataPayload('目前站內命中的內容還不夠集中，建議換更具體的設施、時段或步驟再試一次。'));
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
