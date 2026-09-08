export const DOCUMENT_CORRECTIONS = {
  reviewedAt: '2026-09-08',
  sha256: '9ac78d241510ec0e10b7d22877002d75310dfb561f10b902e84c65c495f46a37',
  source: 'FB整理的英文版登船注意事項翻譯.docx',
  sourceUrl: 'https://www.facebook.com/story.php?story_fbid=1594683765384401&id=100045283783712',
  note: '使用者指定為最新來源；未標示原文航次日期，未重新驗證菜單價格。'
};

const DRINK_DESCRIPTIONS = [
  ['bev-buccaneer', "Dead Man's Chest", '雙人分享的海盜主題雞尾酒。'],
  ['bev-garden', 'Teatime Tini', '綠茶與香蘭風味的馬丁尼。'],
  ['bev-taverna', "Bruno's Fizz", '蜜桃與薑風味的無酒精氣泡飲。'],
  ['bev-tiana', 'Beignet Shake', '紐奧良風格的無酒精奶昔。']
];

const normalized = value => String(value || '').normalize('NFKC').toLowerCase()
  .replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');

export function applyDocumentCorrections(payload) {
  const result = structuredClone(payload);
  for (const [restaurantId, englishName, description] of DRINK_DESCRIPTIONS) {
    const matches = result.records.filter(record => record.restaurantId === restaurantId
      && normalized(record.englishName) === normalized(englishName));
    if (!matches.length) throw new Error('Document correction target missing: ' + englishName);
    for (const record of matches) {
      record.descriptionZh = description + '（9/8 附件補充；價格沿用菜單 snapshot，點餐前確認。）';
      record.courseGroup = 'drinks';
      record.courseGroupLabel = '飲料';
      record.crewPhrase = 'Could I order this drink, please?';
    }
  }
  for (const record of result.records) {
    if (record.restaurantId === 'bev-garden') {
      record.aliases = [...new Set([...record.aliases, record.restaurantLabel, record.restaurantEnglish, 'Garden Bar 花園酒吧', 'Garden Bar'])];
      record.restaurantLabel = 'Garden Bar 花園酒吧';
      record.restaurantEnglish = 'Garden Bar';
    }
    if (record.restaurantId === 'animator') {
      record.restaurantEnglish = 'Animator’s Palate / Animator’s Table';
    }
    if (record.restaurantId === 'night4') {
      record.restaurantLabel = '第四晚特別菜單（四晚航程適用）';
    }
    record.searchText = normalized([...new Set([
      record.zhLabel, record.englishName, record.descriptionZh, record.restaurantId,
      record.restaurantLabel, record.restaurantEnglish, record.restaurantGroup,
      record.restaurantGroupLabel, record.menuCategory, record.menuCategoryLabel,
      record.courseGroup, record.courseGroupLabel, record.price,
      ...record.tags, ...record.tagLabels
    ].map(value => String(value || '').trim().replace(/\s+/g, ' ')).filter(Boolean))].join(' '));
  }
  for (const restaurant of result.restaurants) {
    const record = result.records.find(item => item.restaurantId === restaurant.id);
    if (record) {
      restaurant.label = record.restaurantLabel;
      restaurant.englishName = record.restaurantEnglish;
    }
  }
  result.documentCorrections = DOCUMENT_CORRECTIONS;
  return result;
}
