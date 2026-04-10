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
  if (normalized.includes('看秀') || normalized.includes('提早入場') || normalized.includes('主秀')) {
    keywords.push('劇院', 'theatre', '主秀', '提早入場');
  }
  if (normalized.includes('concierge') || normalized.includes('lounge') || normalized.includes('酒廊') || normalized.includes('禮賓')) {
    keywords.push('禮賓', 'concierge', 'lounge', '酒廊');
  }
  if (normalized.includes('room service') || normalized.includes('客房服務') || normalized.includes('房務')) {
    keywords.push('room service', '客房服務', '房務');
  }
  if (normalized.includes('open house') || normalized.includes('oceaneer') || normalized.includes('kids club')) {
    keywords.push('open house', 'oceaneer', 'kids club', '孩子', '兒童');
  }
  if (normalized.includes('披薩') || normalized.includes('pizza') || normalized.includes('補給') || normalized.includes('點心') || normalized.includes('快餐')) {
    keywords.push('披薩', 'pizza', '補給', '點心', '快餐');
  }

  return unique(keywords);
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

function textIncludesAny(text, terms = []) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function scoreDoc(doc, query) {
  const normalized = normalizeText(query);
  const units = queryUnits(query);
  let score = 0;

  units.forEach((unit) => {
    if (doc.normalizedTitle.includes(unit)) score += 28;
    if (doc.normalizedKeywords.includes(unit)) score += 18;
    if (doc.normalizedText.includes(unit)) score += 10;
  });

  if (doc.normalizedCombined.includes(normalized)) score += 16;
  if (doc.fieldType === 'action') score += 12;
  if (doc.fieldType === 'caution') score += 11;
  if (doc.fieldType === 'whenToUse' || doc.fieldType === 'bestTime' || doc.fieldType === 'timingTip') score += 6;

  if (textIncludesAny(normalized, ['第一天', 'day 1', '登船日', '登船後'])) {
    if (doc.sourceType === 'schedule') score += 24;
    if (doc.sourceType === 'playbook') score += 12;
    if (doc.fieldType === 'whenToUse' || doc.fieldType === 'time') score += 10;
  }

  if (textIncludesAny(normalized, ['第二天', 'day 2'])) {
    if (doc.sourceType === 'schedule') score += 20;
  }

  if (textIncludesAny(normalized, ['room service', '房務', '客房服務'])) {
    if (doc.sourceType === 'playbook') score += 20;
    if (doc.fieldType === 'action' || doc.fieldType === 'caution') score += 12;
  }

  if (textIncludesAny(normalized, ['禮賓', 'concierge', 'lounge'])) {
    if (doc.sourceDetailType === 'concierge') score += 24;
    if (doc.sourceType === 'playbook') score += 10;
  }

  if (textIncludesAny(normalized, ['open house', 'kids club', 'oceaneer'])) {
    if (doc.sourceType === 'playbook') score += 14;
  }

  if (textIncludesAny(normalized, ['劇院', 'theatre', '主秀', '看秀'])) {
    if (doc.sourceType === 'show') score += 16;
    if (doc.sourceType === 'playbook') score += 12;
  }

  if (textIncludesAny(normalized, ['孩子', '親子', '兒童'])) {
    if (textIncludesAny(doc.normalizedCombined, ['孩子', '親子', '兒童', 'open house', 'kids club'])) score += 14;
  }

  if (textIncludesAny(normalized, ['先做什麼', '先去', '安排', '怎麼', '要帶'])) {
    if (doc.fieldType === 'action') score += 12;
  }

  if (textIncludesAny(normalized, ['要不要', '會不會', '限制', '注意', '半夜'])) {
    if (doc.fieldType === 'caution') score += 12;
    if (doc.sourceDetailType === 'official') score += 8;
  }

  return score;
}

function retrieve(query, docs) {
  const normalized = normalizeText(query);
  const ranked = docs
    .map((doc) => ({ ...doc, score: scoreDoc(doc, query) }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected = [];
  const parentCounts = new Map();
  const seenIds = new Set();

  function canAdd(doc) {
    if (!doc || seenIds.has(doc.id)) return false;
    const parentCount = parentCounts.get(doc.parentId) || 0;
    return parentCount < 2;
  }

  function addDoc(doc) {
    if (!canAdd(doc)) return false;
    selected.push(doc);
    seenIds.add(doc.id);
    parentCounts.set(doc.parentId, (parentCounts.get(doc.parentId) || 0) + 1);
    return true;
  }

  function pickBest(filter) {
    return ranked.find((doc) => canAdd(doc) && filter(doc)) || null;
  }

  addDoc(ranked[0] || null);

  if (textIncludesAny(normalized, ['怎麼', '先找', '先去', '安排', '要帶', '補', '留什麼'])) {
    addDoc(pickBest((doc) => doc.fieldType === 'action'));
  }

  if (textIncludesAny(normalized, ['要不要', '會不會', '限制', '注意', '半夜', '晚到', '喝完'])) {
    addDoc(pickBest((doc) => doc.fieldType === 'caution'));
  }

  if (textIncludesAny(normalized, ['值得', '省力', '最順'])) {
    addDoc(pickBest((doc) => doc.fieldType === 'tripFit' || doc.fieldType === 'tripUse'));
  }

  if (textIncludesAny(normalized, ['第一天', 'day 1', '登船日', '登船後', '先去', '先做'])) {
    addDoc(pickBest((doc) => doc.sourceType === 'schedule'));
    addDoc(pickBest((doc) => doc.sourceType === 'playbook' && (doc.fieldType === 'action' || doc.fieldType === 'parent')));
  }

  if (textIncludesAny(normalized, ['lounge', 'open house'])) {
    addDoc(pickBest((doc) =>
      doc.sourceType === 'playbook'
      && (doc.normalizedTitle.includes('lounge') || doc.normalizedCombined.includes('open house'))
    ));
  }

  if (textIncludesAny(normalized, ['禮賓', 'concierge'])) {
    addDoc(pickBest((doc) => doc.sourceDetailType === 'concierge' && (doc.fieldType === 'action' || doc.fieldType === 'parent')));
  }

  for (const doc of ranked) {
    if (selected.length >= 6) break;
    addDoc(doc);
  }

  return selected;
}

const data = loadData();
const docs = buildDocuments(data);
const cases = JSON.parse(fs.readFileSync(path.resolve('tests', 'fixtures', 'ai-retrieval-cases.json'), 'utf8'));
const failures = [];

cases.forEach((testCase) => {
  const selected = retrieve(testCase.query, docs);
  const titles = selected.map((doc) => doc.title);
  const fieldTypes = new Set(selected.map((doc) => doc.fieldType));
  const sourceTypes = new Set(selected.map((doc) => doc.sourceType));
  const sourceDetails = new Set(selected.map((doc) => doc.sourceDetailType));

  try {
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
