const MAX_CHUNKS = 6;
const MIN_CHUNKS = 2;
const MIN_REWRITE_CHUNKS = 1;
const MAX_QUERY_LENGTH = 500;
const MAX_TEXT_LENGTH = 420;
const MIN_QUERY_SIGNAL = 6;

function createCorsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function jsonResponse(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...createCorsHeaders(origin)
    }
  });
}

function uniqueItems(items) {
  return [...new Set(items)];
}

function normalizeQuery(text) {
  return String(text || '')
    .normalize('NFKC')
    .replace(/[\u2019']/g, '')
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getQuerySignalLength(text) {
  return normalizeQuery(text).replace(/\s+/g, '').length;
}

function sanitizeString(value, maxLength = 200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeNavTarget(navTarget = {}) {
  if (!navTarget || typeof navTarget !== 'object') return null;

  const safeTarget = {};
  if (typeof navTarget.type === 'string') safeTarget.type = navTarget.type;
  if (typeof navTarget.dayId === 'string') safeTarget.dayId = navTarget.dayId;
  if (typeof navTarget.tabId === 'string') safeTarget.tabId = navTarget.tabId;
  if (typeof navTarget.missionId === 'string') safeTarget.missionId = navTarget.missionId;
  if (typeof navTarget.itemId === 'string') safeTarget.itemId = navTarget.itemId;

  return Object.keys(safeTarget).length ? safeTarget : null;
}

function sanitizeChunks(chunks) {
  if (!Array.isArray(chunks)) return [];

  return chunks
    .slice(0, MAX_CHUNKS)
    .map((chunk) => ({
      id: sanitizeString(chunk?.id, 120),
      title: sanitizeString(chunk?.title, 160),
      locationLabel: sanitizeString(chunk?.locationLabel, 180),
      sectionId: sanitizeString(chunk?.sectionId, 80),
      navTarget: sanitizeNavTarget(chunk?.navTarget),
      text: sanitizeString(chunk?.text, MAX_TEXT_LENGTH)
    }))
    .filter((chunk) => chunk.id && chunk.title && chunk.text && chunk.navTarget);
}

function buildGroundedPrompt(query, chunks) {
  const sources = chunks
    .map(
      (chunk, index) =>
        `SOURCE ${index + 1}\n` +
        `id: ${chunk.id}\n` +
        `title: ${chunk.title}\n` +
        `location: ${chunk.locationLabel}\n` +
        `section: ${chunk.sectionId}\n` +
        `text: ${chunk.text}`
    )
    .join('\n\n');

  return [
    `User question: ${query}`,
    '',
    'Answer only from the provided website chunks.',
    'Use the same language as the user question.',
    'If the question asks what to do first, how to arrange, or what order to follow, answer in a recommended order.',
    'Do not add external facts or assumptions beyond the chunks.',
    'If the chunks are incomplete, answer conservatively and explain the gap in missingReason.',
    'Every bullet must be supported by the cited chunk ids.',
    'If there is not enough support, set insufficientData to true.',
    '',
    sources
  ].join('\n');
}

function buildRewritePrompt(query, chunks) {
  const sourceHints = chunks
    .map(
      (chunk, index) =>
        `HINT ${index + 1}\n` +
        `title: ${chunk.title}\n` +
        `location: ${chunk.locationLabel}\n` +
        `text: ${chunk.text}`
    )
    .join('\n\n');

  return [
    `User question: ${query}`,
    '',
    'Do not answer the question.',
    'Rewrite the question into search-friendly hints for this cruise website only.',
    'Return short website-style keywords, aliases, and one rewritten query.',
    'Prefer terms likely to appear in the provided hints.',
    'Prefer Chinese keywords, but keep official English names when helpful.',
    'Do not invent places or activities that are not suggested by the hints.',
    '',
    sourceHints
  ].join('\n');
}

function extractCandidateText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('').trim();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = String(text || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    return JSON.parse(cleaned);
  }
}

function buildGroundedSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      answer: { type: 'string' },
      bullets: {
        type: 'array',
        items: { type: 'string' }
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low']
      },
      missingReason: { type: 'string' },
      citationIds: {
        type: 'array',
        items: { type: 'string' }
      },
      insufficientData: { type: 'boolean' }
    },
    required: ['answer', 'bullets', 'confidence', 'citationIds', 'insufficientData']
  };
}

function buildRewriteSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      rewrittenQuery: { type: 'string' },
      keywords: {
        type: 'array',
        items: { type: 'string' }
      },
      alternates: {
        type: 'array',
        items: { type: 'string' }
      },
      confidence: {
        type: 'string',
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
    missingReason: message,
    insufficientData: true
  };
}

function normalizeConfidence(value, citations, insufficientData) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }

  if (insufficientData || citations.length <= 1) {
    return 'low';
  }

  if (citations.length >= 3) {
    return 'high';
  }

  return 'medium';
}

function buildLowConfidenceFallback(query, chunks) {
  const topChunks = chunks.slice(0, 3);
  const citations = topChunks.map((chunk) => ({
    id: chunk.id,
    title: chunk.title,
    locationLabel: chunk.locationLabel,
    navTarget: chunk.navTarget
  }));
  const bullets = topChunks.map((chunk) => sanitizeString(chunk.title, 120)).filter(Boolean);

  return {
    answer: bullets.length
      ? `我先根據目前站內最接近的片段整理：通常可以先從「${bullets[0]}」開始，再搭配下方引用快速核對。`
      : `我目前只能從少量站內片段整理出方向，建議直接點下方引用來源快速核對。`,
    bullets,
    citations,
    confidence: 'low',
    missingReason: '目前 Gemini 雖然沒有整理出穩定答案，但站內仍有一些相近片段可先提供參考。',
    insufficientData: false
  };
}

function extractKeywordCandidates(text) {
  const normalized = normalizeQuery(text).toLowerCase();
  if (!normalized) return [];

  const chinesePhrases = normalized.match(/[\u4e00-\u9fff]{2,6}/g) || [];
  const wordTerms = normalized
    .split(' ')
    .filter((term) => term.length >= 2 && /[a-z0-9]/.test(term));

  return uniqueItems([...chinesePhrases, ...wordTerms]).slice(0, 8);
}

function buildRewriteFallback(query, chunks) {
  const hintSource = [
    query,
    ...chunks.flatMap((chunk) => [chunk.title, chunk.locationLabel])
  ].join(' ');
  const keywords = extractKeywordCandidates(hintSource).slice(0, 6);

  return {
    rewrittenQuery: sanitizeString(query, 160),
    keywords,
    alternates: keywords.slice(0, 3),
    confidence: keywords.length >= 3 ? 'medium' : 'low'
  };
}

async function callGemini(env, mode, query, chunks) {
  const apiKey = String(env.GEMINI_API_KEY || '').trim();
  const model = String(env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim() || 'gemini-2.5-flash-lite';

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const isRewrite = mode === 'query_rewrite_v1';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: isRewrite
                ? 'You rewrite search queries for a cruise guide website. Never answer the question directly. Return only valid JSON.'
                : 'You are a grounded assistant for a cruise guide website. Answer only from the provided chunks and return only valid JSON.'
            }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: isRewrite ? buildRewritePrompt(query, chunks) : buildGroundedPrompt(query, chunks)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: isRewrite ? 0.2 : 0.1,
          thinkingConfig: {
            thinkingBudget: 0
          },
          responseMimeType: 'application/json',
          responseJsonSchema: isRewrite ? buildRewriteSchema() : buildGroundedSchema()
        }
      })
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(payload?.error?.message || 'Gemini API request failed');
  }

  const text = extractCandidateText(payload);
  if (!text) {
    throw new Error('Gemini returned an empty answer');
  }

  return safeJsonParse(text);
}

function finalizeGroundedAnswer(modelOutput, chunks, query) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const citationIds = Array.isArray(modelOutput?.citationIds) ? modelOutput.citationIds : [];
  const citations = citationIds
    .map((id) => chunkMap.get(id))
    .filter(Boolean)
    .slice(0, 4)
    .map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      locationLabel: chunk.locationLabel,
      navTarget: chunk.navTarget
    }));
  const insufficientData = Boolean(modelOutput?.insufficientData);
  const answer = sanitizeString(modelOutput?.answer, 320);

  if ((!answer || !citations.length || insufficientData) && chunks.length >= MIN_CHUNKS) {
    return buildLowConfidenceFallback(query, chunks);
  }

  return {
    answer: answer || '我已根據站內片段整理出方向，建議搭配下方引用快速核對。',
    bullets: Array.isArray(modelOutput?.bullets)
      ? modelOutput.bullets.map((bullet) => sanitizeString(bullet, 180)).filter(Boolean).slice(0, 4)
      : [],
    citations,
    confidence: normalizeConfidence(modelOutput?.confidence, citations, insufficientData),
    missingReason: sanitizeString(modelOutput?.missingReason, 220),
    insufficientData
  };
}

function finalizeRewriteOutput(modelOutput, query, chunks) {
  const rewrittenQuery = sanitizeString(modelOutput?.rewrittenQuery, 160);
  const keywords = uniqueItems(
    (Array.isArray(modelOutput?.keywords) ? modelOutput.keywords : [])
      .map((keyword) => sanitizeString(keyword, 40))
      .filter(Boolean)
  ).slice(0, 6);
  const alternates = uniqueItems(
    (Array.isArray(modelOutput?.alternates) ? modelOutput.alternates : [])
      .map((alternate) => sanitizeString(alternate, 80))
      .filter(Boolean)
  ).slice(0, 4);
  const confidence = ['high', 'medium', 'low'].includes(modelOutput?.confidence) ? modelOutput.confidence : 'low';

  if (!rewrittenQuery && !keywords.length && !alternates.length) {
    return buildRewriteFallback(query, chunks);
  }

  return {
    rewrittenQuery: rewrittenQuery || sanitizeString(query, 160),
    keywords,
    alternates,
    confidence
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: createCorsHeaders(origin)
      });
    }

    if (url.pathname !== '/api/ai-answer') {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'Missing GEMINI_API_KEY secret' }, 500, origin);
    }

    const body = await request.json().catch(() => null);
    const mode = sanitizeString(body?.mode || 'grounded_qa_v1', 40);
    const query = sanitizeString(body?.query, MAX_QUERY_LENGTH);
    const normalizedQuery = normalizeQuery(query);
    const chunks = sanitizeChunks(body?.chunks);

    if (!query || getQuerySignalLength(normalizedQuery) < MIN_QUERY_SIGNAL) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks), 200, origin);
      }
      return jsonResponse(buildInsufficientDataPayload('請把問題再問得完整一些，至少 6 個字會更容易整理站內資料。'), 200, origin);
    }

    if (mode === 'query_rewrite_v1') {
      if (chunks.length < MIN_REWRITE_CHUNKS) {
        return jsonResponse(buildRewriteFallback(query, chunks), 200, origin);
      }

      try {
        const modelOutput = await callGemini(env, mode, query, chunks);
        return jsonResponse(finalizeRewriteOutput(modelOutput, query, chunks), 200, origin);
      } catch (error) {
        return jsonResponse(buildRewriteFallback(query, chunks), 200, origin);
      }
    }

    if (chunks.length < MIN_CHUNKS) {
      return jsonResponse(buildInsufficientDataPayload('目前站內抓到的片段還不夠集中，請換更具體的問法或先看下方搜尋結果。'), 200, origin);
    }

    try {
      const modelOutput = await callGemini(env, mode, query, chunks);
      return jsonResponse(finalizeGroundedAnswer(modelOutput, chunks, query), 200, origin);
    } catch (error) {
      return jsonResponse(
        {
          error: 'Gemini request failed',
          detail: error.message || 'Unknown error'
        },
        502,
        origin
      );
    }
  }
};
