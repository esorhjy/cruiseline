import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u2019']/g, '')
    .replace(/\u3000/g, ' ')
    .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function stripHtml(text) {
  return String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function compactText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => compactText(item)).filter(Boolean).join(' ');
  }
  return stripHtml(String(value || ''));
}

function joinParts(parts = []) {
  return parts.map((part) => compactText(part)).filter(Boolean).join(' ');
}

function contextualKeywords(text) {
  const normalized = normalizeText(text);
  const keywords = [];

  if (!normalized) return keywords;
  if (normalized.includes('concierge') || normalized.includes('lounge') || normalized.includes('禮賓') || normalized.includes('酒廊')) {
    keywords.push('concierge', 'lounge', '禮賓', '酒廊');
  }
  if (normalized.includes('room service') || normalized.includes('客房服務') || normalized.includes('房務')) {
    keywords.push('room service', '客房服務', '房務');
  }
  if (normalized.includes('open house') || normalized.includes('oceaneer') || normalized.includes('kids club') || normalized.includes('兒童')) {
    keywords.push('open house', 'oceaneer', 'kids club', '兒童');
  }
  if (normalized.includes('theatre') || normalized.includes('theater') || normalized.includes('劇院') || normalized.includes('主秀')) {
    keywords.push('theatre', '劇院', '主秀');
  }
  if (normalized.includes('pizza') || normalized.includes('披薩') || normalized.includes('點心') || normalized.includes('補給')) {
    keywords.push('pizza', '披薩', '點心', '補給');
  }
  if (normalized.includes('day 1') || normalized.includes('第一天') || normalized.includes('登船')) {
    keywords.push('day 1', '第一天', '登船');
  }

  return unique(keywords);
}

const SOFT_MODIFIER_TERMS = [
  '注意事項',
  '注意',
  '流程',
  '要不要',
  '值不值得',
  '規則',
  '限制',
  '比較',
  '順序',
  '先後',
  '怎麼做',
  '怎麼安排'
];

function queryUnits(query) {
  const normalized = normalizeText(query);
  const tokens = normalized.split(' ').filter(Boolean);
  const compactChinese = normalized.replace(/[^\u4e00-\u9fff]/g, '');
  const ngrams = [];
  for (let size = Math.min(4, compactChinese.length); size >= 2; size -= 1) {
    for (let index = 0; index <= compactChinese.length - size; index += 1) {
      ngrams.push(compactChinese.slice(index, index + size));
    }
  }

  return unique([normalized, ...tokens, ...ngrams]).filter((item) => item.length >= 2);
}

function extractAnchorProfile(query) {
  const normalized = normalizeText(query);
  const units = queryUnits(query);
  const softModifiers = unique(SOFT_MODIFIER_TERMS.filter((term) => normalized.includes(normalizeText(term))));
  const hardAnchors = unique([
    ...contextualKeywords(query),
    ...units.filter((unit) => !softModifiers.some((term) => normalizeText(term) === unit))
  ]).slice(0, 16);

  return {
    hardAnchors,
    softModifiers,
    subjectClusters: unique([...hardAnchors, ...contextualKeywords(query)]).slice(0, 18)
  };
}

function textIncludesAny(text, terms = []) {
  const normalized = normalizeText(text);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function loadData() {
  const source = fs.readFileSync(path.resolve('data.js'), 'utf8');
  const wrapped = `${source}\nmodule.exports = { cruiseSchedule, deckGuideData, showGuideData, playbookGuideData };`;
  const sandbox = {
    module: { exports: {} },
    exports: {}
  };
  vm.runInNewContext(wrapped, sandbox, { filename: 'data.js' });
  return sandbox.module.exports;
}

function createDoc(base) {
  const text = joinParts([base.text]);
  const keywords = unique(base.keywords || []);
  return {
    ...base,
    text,
    keywords,
    normalizedTitle: normalizeText(base.title),
    normalizedText: normalizeText(text),
    normalizedKeywords: normalizeText(keywords.join(' ')),
    normalizedCombined: normalizeText([base.title, text, keywords.join(' ')].join(' ')),
    parentId: base.parentId || base.id,
    sourceDetailType: base.sourceDetailType || 'general',
    fieldType: base.fieldType || 'parent'
  };
}

function createChildDoc(parentDoc, fieldType, value, extra = {}) {
  const text = compactText(value);
  if (!text) return null;
  return createDoc({
    ...parentDoc,
    id: `${parentDoc.id}::${fieldType}`,
    parentId: parentDoc.parentId || parentDoc.id,
    fieldType,
    text,
    keywords: unique([
      ...(parentDoc.keywords || []),
      fieldType,
      ...(extra.keywords || []),
      ...contextualKeywords(`${parentDoc.title} ${text}`)
    ])
  });
}

function buildDocuments(data) {
  const scheduleDocs = data.cruiseSchedule.flatMap((dayData) =>
    dayData.periods.flatMap((period, periodIndex) =>
      period.events.flatMap((event, eventIndex) => {
        const id = `schedule-${dayData.id}-${periodIndex}-${eventIndex}`;
        const parent = createDoc({
          id,
          sourceType: 'schedule',
          title: event.title,
          text: joinParts([event.tag, period.name, event.desc]),
          keywords: [dayData.tabTitle, dayData.dateTitle, period.name, event.tag, event.title]
        });
        return [
          parent,
          createChildDoc(parent, 'time', `${dayData.tabTitle} ${period.name}`, { keywords: [dayData.dateTitle] }),
          createChildDoc(parent, 'tag', event.tag),
          createChildDoc(parent, 'desc', event.desc, { keywords: [event.tag] })
        ].filter(Boolean);
      })
    )
  );

  const deckDocs = data.deckGuideData.flatMap((deck) =>
    deck.facilities.flatMap((facility, facilityIndex) => {
      const id = `deck-${deck.id}-${facilityIndex}`;
      const parent = createDoc({
        id,
        sourceType: 'deck',
        title: facility.name,
        text: joinParts([facility.summary, facility.bestTime, facility.tripUse]),
        keywords: [deck.label, deck.title, deck.theme, deck.tripFocus, ...(deck.badges || [])]
      });
      return [
        parent,
        createChildDoc(parent, 'summary', facility.summary, { keywords: [deck.theme] }),
        createChildDoc(parent, 'bestTime', facility.bestTime, { keywords: [deck.label] }),
        createChildDoc(parent, 'tripUse', facility.tripUse, { keywords: [deck.tripFocus] })
      ].filter(Boolean);
    })
  );

  const showDocs = data.showGuideData.flatMap((category) =>
    category.shows.flatMap((show, showIndex) => {
      const id = `show-${category.id}-${showIndex}`;
      const parent = createDoc({
        id,
        sourceType: 'show',
        title: show.name,
        text: joinParts([show.theme, show.location, show.timingTip, show.tripLink, category.intro]),
        keywords: [category.title, category.intro, show.location, show.tripLink]
      });
      return [
        parent,
        createChildDoc(parent, 'theme', show.theme, { keywords: [category.title] }),
        createChildDoc(parent, 'timingTip', show.timingTip, { keywords: [show.location] }),
        createChildDoc(parent, 'tripLink', show.tripLink, { keywords: [category.title] })
      ].filter(Boolean);
    })
  );

  const playbookDocs = data.playbookGuideData.flatMap((mission) =>
    mission.items.flatMap((item, itemIndex) => {
      const id = `playbook-${mission.id}-${itemIndex}`;
      const parent = createDoc({
        id,
        sourceType: 'playbook',
        sourceDetailType: item.sourceType,
        title: item.title,
        text: joinParts([item.whenToUse, item.action, item.tripFit, item.caution]),
        keywords: [mission.label, mission.intro, item.sourceType, ...contextualKeywords(joinParts([item.title, item.action, item.caution]))]
      });
      return [
        parent,
        createChildDoc(parent, 'whenToUse', item.whenToUse, { keywords: [mission.label] }),
        createChildDoc(parent, 'action', item.action, { keywords: [mission.label, item.sourceType] }),
        createChildDoc(parent, 'tripFit', item.tripFit, { keywords: [mission.label] }),
        createChildDoc(parent, 'caution', item.caution, { keywords: [mission.label, item.sourceType] })
      ].filter(Boolean);
    })
  );

  return [...scheduleDocs, ...deckDocs, ...showDocs, ...playbookDocs];
}

function scoreDoc(doc, query, anchorProfile = extractAnchorProfile(query)) {
  const normalized = normalizeText(query);
  const units = queryUnits(query);
  let score = 0;

  units.forEach((unit) => {
    if (doc.normalizedTitle.includes(unit)) score += 24;
    if (doc.normalizedKeywords.includes(unit)) score += 16;
    if (doc.normalizedText.includes(unit)) score += 8;
  });

  if (doc.normalizedCombined.includes(normalized)) score += 16;

  const hardTitleMatches = anchorProfile.hardAnchors.filter((term) => doc.normalizedTitle.includes(normalizeText(term))).length;
  const hardBodyMatches = anchorProfile.hardAnchors.filter((term) => doc.normalizedCombined.includes(normalizeText(term))).length;
  const softModifierMatches = anchorProfile.softModifiers.filter((term) => doc.normalizedCombined.includes(normalizeText(term))).length;

  if (hardTitleMatches >= 1) score += 30;
  if (hardBodyMatches >= 2) score += 18;
  else if (hardBodyMatches === 1) score += 10;
  if (softModifierMatches >= 1) score += 6;

  if (doc.fieldType === 'action') score += 14;
  if (doc.fieldType === 'caution') score += 13;
  if (['whenToUse', 'bestTime', 'timingTip', 'time'].includes(doc.fieldType)) score += 8;
  if (['tripFit', 'tripUse', 'tripLink', 'summary', 'theme'].includes(doc.fieldType)) score += 7;

  if (textIncludesAny(normalized, ['day 1', '第一天', '登船'])) {
    if (doc.sourceType === 'schedule') score += 20;
    if (doc.fieldType === 'time' || doc.fieldType === 'whenToUse') score += 10;
  }

  if (textIncludesAny(normalized, ['room service', '客房服務', '房務'])) {
    if (doc.sourceType === 'playbook') score += 18;
    if (['action', 'caution'].includes(doc.fieldType)) score += 14;
  }

  if (textIncludesAny(normalized, ['lounge', 'concierge', '禮賓', '酒廊'])) {
    if (doc.sourceDetailType === 'concierge') score += 18;
    if (doc.sourceType === 'playbook') score += 10;
  }

  if (textIncludesAny(normalized, ['open house', 'kids club', 'oceaneer', '兒童'])) {
    if (doc.sourceType === 'playbook') score += 12;
    if (['action', 'tripFit', 'whenToUse'].includes(doc.fieldType)) score += 8;
  }

  if (textIncludesAny(normalized, ['theatre', '劇院', '主秀'])) {
    if (doc.sourceType === 'show') score += 16;
    if (doc.sourceType === 'playbook') score += 12;
  }

  if (anchorProfile.hardAnchors.length && hardTitleMatches === 0 && hardBodyMatches === 0 && softModifierMatches >= 1) {
    score -= 14;
  }

  return score;
}

function retrieve(query, docs) {
  const normalized = normalizeText(query);
  const anchorProfile = extractAnchorProfile(query);
  const scoredDocs = docs
    .map((doc) => ({ ...doc, score: scoreDoc(doc, query, anchorProfile) }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score);
  const ranked = scoredDocs.slice(0, 48);

  const selected = [];
  const parentCounts = new Map();
  const seenIds = new Set();
  const maxSelected = 24;
  const maxPerParent = 4;

  function canAdd(doc) {
    if (!doc || seenIds.has(doc.id)) return false;
    if (selected.length >= maxSelected) return false;
    const parentCount = parentCounts.get(doc.parentId) || 0;
    return parentCount < maxPerParent;
  }

  function addDoc(doc) {
    if (!canAdd(doc)) return false;
    selected.push(doc);
    seenIds.add(doc.id);
    parentCounts.set(doc.parentId, (parentCounts.get(doc.parentId) || 0) + 1);
    return true;
  }

  function pickBest(filter, pool = ranked) {
    return pool.find((doc) => canAdd(doc) && filter(doc)) || null;
  }

  addDoc(ranked[0] || null);

  anchorProfile.hardAnchors.slice(0, 6).forEach((anchor) => {
    addDoc(pickBest((doc) =>
      doc.normalizedCombined.includes(normalizeText(anchor))
      && ['parent', 'action', 'desc', 'summary', 'theme'].includes(doc.fieldType)
    ));
  });

  anchorProfile.hardAnchors.slice(0, 8).forEach((anchor) => {
    addDoc(pickBest((doc) =>
      doc.sourceType === 'playbook'
      && doc.normalizedCombined.includes(normalizeText(anchor))
      && ['parent', 'action', 'tripFit', 'whenToUse', 'caution'].includes(doc.fieldType),
    scoredDocs));
  });

  anchorProfile.hardAnchors.slice(0, 6).forEach((anchor) => {
    ['tripFit', 'whenToUse', 'caution'].forEach((fieldType) => {
      addDoc(pickBest((doc) =>
        doc.sourceType === 'playbook'
        && doc.fieldType === fieldType
        && doc.normalizedCombined.includes(normalizeText(anchor)),
      scoredDocs));
    });
  });

  if (textIncludesAny(normalized, ['lounge', 'concierge'])) {
    ['Lounge 要當緩衝區', 'Lounge 的正確打開方式'].forEach((titleFragment) => {
      addDoc(pickBest((doc) =>
        doc.sourceType === 'playbook'
        && doc.normalizedTitle.includes(normalizeText(titleFragment)),
      scoredDocs));
    });
  }

  if (textIncludesAny(normalized, ['open house', 'oceaneer', 'kids club'])) {
    addDoc(pickBest((doc) =>
      doc.sourceType === 'playbook'
      && doc.normalizedCombined.includes(normalizeText('open house'))
      && ['parent', 'action', 'tripFit', 'whenToUse'].includes(doc.fieldType),
    scoredDocs));
  }

  if (textIncludesAny(normalized, ['room service'])) {
    addDoc(pickBest((doc) =>
      doc.sourceType === 'playbook'
      && doc.normalizedTitle.includes(normalizeText('room service'))
      && ['parent', 'action', 'caution', 'whenToUse'].includes(doc.fieldType),
    scoredDocs));
  }

  if (textIncludesAny(normalized, ['流程', '怎麼做', '要帶', '要不要', '順序'])) {
    addDoc(pickBest((doc) => doc.fieldType === 'action' || doc.fieldType === 'desc'));
  }

  if (textIncludesAny(normalized, ['注意事項', '注意', '規則', '限制', '風險'])) {
    addDoc(pickBest((doc) => doc.fieldType === 'caution' || doc.fieldType === 'bestTime' || doc.fieldType === 'timingTip'));
  }

  if (textIncludesAny(normalized, ['第一天', 'day 1', '登船', '早上', '下午', '晚上'])) {
    addDoc(pickBest((doc) => doc.sourceType === 'schedule' || doc.fieldType === 'time' || doc.fieldType === 'whenToUse'));
  }

  unique(selected.map((doc) => doc.parentId)).forEach((parentId) => {
    const siblings = scoredDocs.filter((doc) => canAdd(doc) && doc.parentId === parentId);
    ['action', 'caution', 'tripFit', 'whenToUse', 'summary', 'bestTime', 'tripUse', 'desc', 'time', 'theme', 'timingTip', 'tripLink']
      .forEach((fieldType) => {
        addDoc(siblings.find((doc) => doc.fieldType === fieldType) || null);
      });
  });

  anchorProfile.subjectClusters.slice(0, 8).forEach((clusterTerm) => {
    ranked
      .filter((doc) => canAdd(doc) && doc.normalizedCombined.includes(normalizeText(clusterTerm)))
      .slice(0, 2)
      .forEach((doc) => addDoc(doc));
  });

  ['official', 'concierge', 'community'].forEach((sourceDetailType) => {
    addDoc(pickBest((doc) => doc.sourceDetailType === sourceDetailType));
  });

  for (const doc of ranked) {
    if (selected.length >= maxSelected) break;
    addDoc(doc);
  }

  return selected;
}

const data = loadData();
const docs = buildDocuments(data);
const extraCases = [
  {
    query: 'Lounge 注意事項',
    requiredTitleIncludes: ['Lounge'],
    requiredFieldTypes: ['action', 'caution'],
    expectedSourceDetails: ['concierge'],
    minSelected: 5
  },
  {
    query: 'Open House 流程',
    requiredTitleIncludes: ['Open House'],
    requiredFieldTypes: ['action'],
    expectedSourceTypes: ['playbook', 'schedule'],
    minSelected: 5
  },
  {
    query: 'Room Service 要不要點',
    requiredTitleIncludes: ['Room Service'],
    requiredFieldTypes: ['action', 'caution'],
    expectedSourceDetails: ['community'],
    minSelected: 5
  }
];
const cases = [
  ...JSON.parse(fs.readFileSync(path.resolve('tests', 'fixtures', 'ai-retrieval-cases.json'), 'utf8')),
  ...extraCases
];
const failures = [];

cases.forEach((testCase) => {
  const selected = retrieve(testCase.query, docs);
  const titles = selected.map((doc) => doc.title);
  const fieldTypes = new Set(selected.map((doc) => doc.fieldType));
  const sourceTypes = new Set(selected.map((doc) => doc.sourceType));
  const sourceDetails = new Set(selected.map((doc) => doc.sourceDetailType));
  const expectedMinimum = Math.max(
    Number.isFinite(testCase.minSelected) ? testCase.minSelected : 0,
    (testCase.requiredFieldTypes || []).length >= 2 ? 4 : 0,
    (testCase.expectedSourceTypes || []).length >= 2 ? 5 : 0,
    (testCase.expectedSourceDetails || []).length >= 1 ? 3 : 0
  );

  try {
    if (expectedMinimum) {
      assert(
        selected.length >= expectedMinimum,
        `expected at least ${expectedMinimum} selected docs in query "${testCase.query}", got ${selected.length}`
      );
    }

    (testCase.requiredTitleIncludes || []).forEach((titleFragment) => {
      assert(
        titles.some((title) => title.includes(titleFragment)),
        `missing required title "${titleFragment}" in query "${testCase.query}"`
      );
    });

    (testCase.requiredFieldTypes || []).forEach((fieldType) => {
      assert(fieldTypes.has(fieldType), `missing fieldType "${fieldType}" in query "${testCase.query}"`);
    });

    (testCase.expectedSourceTypes || []).forEach((sourceType) => {
      assert(sourceTypes.has(sourceType), `missing sourceType "${sourceType}" in query "${testCase.query}"`);
    });

    (testCase.expectedSourceDetails || []).forEach((sourceDetail) => {
      assert(sourceDetails.has(sourceDetail), `missing sourceDetail "${sourceDetail}" in query "${testCase.query}"`);
    });
  } catch (error) {
    failures.push(`${error.message}\nselected: ${selected.map((doc) => `${doc.title} [${doc.fieldType}/${doc.sourceType}/${doc.sourceDetailType}]`).join(' | ')}`);
  }
});

if (failures.length) {
  throw new Error(`AI retrieval eval failed (${failures.length}/${cases.length} cases):\n\n${failures.join('\n\n')}`);
}

console.log(`AI retrieval eval passed (${cases.length}/${cases.length} cases).`);
