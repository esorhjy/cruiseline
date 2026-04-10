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
    .map((chunk, index) => [
      `[#${index + 1}]`,
      `id: ${chunk.id}`,
      `sourceType: ${chunk.sourceType}`,
      `title: ${chunk.title}`,
      `locationLabel: ${chunk.locationLabel || '未標示位置'}`,
      `sectionId: ${chunk.sectionId || 'unknown'}`,
      `text: ${chunk.text}`
    ].join('\n'))
    .join('\n\n');

  return `你是「星海攻略」站內問答整理器。你只能根據提供的 sources 回答，不可補充外部知識。

規則：
1. 只能使用 sources 已經出現的資訊；如果資料不足，必須直接說明站內資料不足。
2. answer 用繁體中文寫成 1 段精簡回答，語氣務實，不要誇大或保證。
3. bullets 最多 4 點，每點都必須可以回溯到 sources，沒有必要就回傳空陣列。
4. citationIds 只能填提供的 chunk id，不能發明新的 id。
5. 若問題偏流程，可優先整理 schedule；若偏技巧、規則或服務細節，可優先整理 playbook，再視需要補 deck/show。
6. 若 sources 只有零碎片段，請明確說目前無法完整回答，不要硬補缺漏資訊。
7. primarySourceType 必須是 schedule / deck / show / playbook / static 其中之一。
8. insufficientData 為 true 時，answer 與 missingReason 仍要用繁體中文說清楚缺什麼。

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
      `locationLabel: ${chunk.locationLabel || '未標示位置'}`,
      `text: ${chunk.text}`
    ].join('\n'))
    .join('\n\n');

  return `你是「星海攻略」站內搜尋改寫器。你只能根據提供的 sources，把使用者原問題改寫成更適合本站本地搜尋的查詢，不可新增外部知識。

規則：
1. rewrittenQuery 要保留原意，但改成更容易命中站內內容的查詢句。
2. keywords 提供 3 到 6 個關鍵詞，優先用站內已出現的設施、服務、時間或規則詞。
3. alternates 提供 2 到 4 個可替代問法，仍然要貼近原問題。
4. 不要捏造新的活動、設施、制度或時段。
5. confidence 只能填 high / medium / low。

原問題：
${query}

可參考的站內片段：
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

function buildInsufficientDataPayload(message, options = {}) {
  return {
    answer: sanitizeString(
      message || '目前站內命中的內容不足，還不能穩定整理出完整答案。',
      600
    ),
    bullets: (Array.isArray(options.bullets) ? options.bullets : [])
      .map((item) => sanitizeString(item, 180))
      .filter(Boolean)
      .slice(0, 4),
    citations: Array.isArray(options.citations) ? options.citations.slice(0, MAX_CHUNKS) : [],
    confidence: 'low',
    primarySourceType: sanitizeSourceType(options.primarySourceType || 'static'),
    missingReason: sanitizeString(
      options.missingReason || '目前站內只有零碎片段，還缺少足夠證據來把步驟、限制或例外情況講完整。',
      220
    ),
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

  const bullets = topChunks
    .map((chunk) => {
      const text = chunk.text || '';
      return text.length > 90 ? `${text.slice(0, 90).trim()}...` : text;
    })
    .filter(Boolean);

  return {
    answer: `我先根據目前最接近的站內片段整理重點，但關於「${query}」的證據還不夠完整，建議同時點開引用來源快速核對。`,
    bullets,
    citations,
    confidence: 'low',
    primarySourceType,
    missingReason: '目前召回到的內容偏片段，還不足以把完整流程、限制條件或例外情況講清楚。',
    insufficientData: false
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

  if (payload.insufficientData) {
    return buildInsufficientDataPayload(
      payload.answer || `目前站內還沒有足夠資料可以完整回答「${query}」。`,
      {
        bullets: payload.bullets,
        citations,
        primarySourceType,
        missingReason: payload.missingReason
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

      return jsonResponse(buildInsufficientDataPayload(
        '請把問題再具體一點，至少輸入 6 個以上有意義的字，AI 才能先用站內資料做召回。',
        {
          missingReason: '目前問題太短，還不足以穩定判斷你要找的是哪一段流程、設施或服務。'
        }
      ));
    }

    if ((mode === 'query_rewrite_v1' && chunks.length < MIN_REWRITE_CHUNKS) || (mode !== 'query_rewrite_v1' && chunks.length < MIN_CHUNKS)) {
      if (mode === 'query_rewrite_v1') {
        return jsonResponse(buildRewriteFallback(query, chunks));
      }

      return jsonResponse(buildInsufficientDataPayload(
        '目前站內命中的證據太少，還不足以整理成穩定答案，建議把問題改得更聚焦，例如加入 Day、設施名、服務名或具體步驟。',
        {
          missingReason: '這次召回到的內容太少，還無法交叉比對出足夠可靠的站內答案。'
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
