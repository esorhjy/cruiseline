import fs from 'node:fs';
import https from 'node:https';
import vm from 'node:vm';
import { applyDocumentCorrections } from './menu-document-corrections.mjs';

const VERSION = '2026-05-25-menu-restaurant-v2';
const SOURCE_PAGE_URL = 'https://sachiko620702.github.io/disney/#menu';
const SOURCE_DATA_URL = 'https://sachiko620702.github.io/disney/data/menuData.js';
const SOURCE_APP_URL = 'https://sachiko620702.github.io/disney/app.js';
const OUTPUT_PATH = new URL('../menu-lookup-data.js', import.meta.url);

const RESTAURANT_GROUP_LABELS = {
  rotational: '主餐廳',
  sulley: '怪獸餐廳',
  palo: 'Palo',
  beverage: '酒吧飲品'
};

const RESTAURANT_ENGLISH_NAMES = {
  nav: 'Navigator / Hollywood',
  pixar: 'Enchanted Summer / Pixar Market',
  animator: "Animator's Palate",
  night4: 'Night 4 Specials',
  'sulley-steak': "Mike & Sulley's Steakhouse",
  'sulley-omakase': "Mike & Sulley's Omakase",
  'sulley-teppan': "Mike & Sulley's Teppanyaki",
  'sulley-sushi': "Mike & Sulley's Sushi",
  'palo-brunch': 'Palo Brunch',
  'palo-dinner': 'Palo Dinner'
};

const CATEGORY_LABELS = {
  'add-ons': '加點',
  angus: 'Angus 牛排',
  appetizers: '前菜',
  asian: '亞洲料理',
  beer: '啤酒',
  'beer-bucket': '啤酒桶',
  bread: '麵包',
  cocktails: '雞尾酒',
  coffee: '咖啡',
  'coffee-cocktails': '咖啡雞尾酒',
  'cold-brew': '冷萃咖啡',
  'craft-beer': '精釀啤酒',
  desserts: '甜點',
  'dinner-appetizers': '晚餐前菜',
  'dinner-desserts': '晚餐甜點',
  drinks: '飲品',
  eggs: '蛋料理',
  entrees: '主餐',
  espresso: '義式咖啡',
  food: '餐點',
  freezies: '冰沙',
  handrolls: '手捲',
  juice: '果汁',
  kids: '兒童餐',
  'large-format': '大瓶酒',
  meats: '肉類',
  'milk-tea': '奶茶',
  mocktails: 'Mocktails',
  'non-alcoholic': '無酒精飲品',
  omakase: 'Omakase',
  'omakase-course': 'Omakase 套餐',
  pasta: '義大利麵',
  pastries: '糕點',
  pizza: '披薩',
  rum: '蘭姆酒',
  sake: '清酒',
  'seafood-cold': '冷海鮮',
  set: '套餐',
  'set-appetizers': '套餐前菜',
  'set-desserts': '套餐甜點',
  'set-entrees': '套餐主餐',
  sharing: '分享餐點',
  sides: '配菜',
  smoothie: '果昔',
  sparkling: '氣泡酒',
  sushi: '壽司',
  tea: '茶',
  'teppan-premium': '鐵板燒 Premium',
  'teppan-zen': '鐵板燒 Zen',
  truffle: '松露',
  wagyu: '和牛',
  whiskey: '威士忌',
  wine: '葡萄酒',
  'wine-pairings': '葡萄酒搭配'
};

const TAG_LABELS = {
  alcoholic: '酒精',
  coffee: '咖啡',
  dessert: '甜點',
  'dessert-vegan': '純素甜點',
  kids: '兒童',
  'kids-disney': '迪士尼兒童餐',
  meat: '肉類',
  'meat-beef': '牛肉',
  'no-sugar': '無糖',
  'non-alcoholic': '無酒精',
  pork: '豬肉',
  seafood: '海鮮',
  'seafood-meat': '海鮮與肉類',
  vegan: '純素',
  vegetarian: '素食'
};

const COURSE_GROUPS = [
  { id: 'all', label: '全部' },
  { id: 'appetizer', label: '前菜' },
  { id: 'entree', label: '主餐' },
  { id: 'drinks', label: '飲料' },
  { id: 'dessert', label: '甜點' },
  { id: 'kids-side', label: '兒童/配菜' }
];

const COURSE_CATEGORY_MAP = {
  appetizer: ['bread', 'appetizers', 'set-appetizers', 'dinner-appetizers', 'sharing', 'seafood-cold'],
  entree: ['entrees', 'set-entrees', 'meats', 'wagyu', 'angus', 'teppan-zen', 'teppan-premium', 'omakase-course', 'omakase', 'sushi', 'handrolls', 'pasta', 'pizza', 'asian', 'food', 'eggs', 'set'],
  drinks: ['drinks', 'non-alcoholic', 'cocktails', 'mocktails', 'coffee', 'espresso', 'cold-brew', 'coffee-cocktails', 'beer', 'beer-bucket', 'craft-beer', 'wine', 'rum', 'whiskey', 'sake', 'freezies', 'wine-pairings', 'large-format', 'juice', 'milk-tea', 'smoothie', 'sparkling', 'tea'],
  dessert: ['desserts', 'dinner-desserts', 'pastries', 'set-desserts'],
  'kids-side': ['kids', 'sides', 'add-ons', 'truffle']
};

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Request failed for ${url}: ${response.statusCode}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      response.on('error', reject);
    }).on('error', reject);
  });
}

function compactText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeText(value) {
  return compactText(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function uniqueItems(items) {
  return [...new Set(items.map(compactText).filter(Boolean))];
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'item';
}

function parseMenuData(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(`${source}\nthis.menuData = menuData;`, sandbox, { filename: 'remote-menuData.js' });
  if (!Array.isArray(sandbox.menuData)) {
    throw new Error('menuData.js did not expose a menuData array');
  }
  return sandbox.menuData;
}

function parseRestaurantMeta(appSource) {
  const start = appSource.indexOf('const restaurantMeta =');
  if (start < 0) throw new Error('restaurantMeta not found in app.js');
  const literalStart = appSource.indexOf('{', start);
  const literalEnd = appSource.indexOf('};', literalStart);
  if (literalStart < 0 || literalEnd < 0) throw new Error('restaurantMeta literal could not be parsed');
  const literal = appSource.slice(literalStart, literalEnd + 1);
  const sandbox = {};
  vm.runInNewContext(`this.restaurantMeta = ${literal};`, sandbox, { filename: 'remote-app-restaurantMeta.js' });
  return sandbox.restaurantMeta || {};
}

function resolveCourseGroup(category, tags = []) {
  const normalizedCategory = compactText(category);
  const normalizedTags = tags.map((tag) => compactText(tag).toLowerCase());
  if (COURSE_CATEGORY_MAP.drinks.includes(normalizedCategory)) return 'drinks';
  if (normalizedTags.some((tag) => ['kids', 'kids-disney'].includes(tag))) return 'kids-side';
  if (normalizedTags.some((tag) => ['dessert', 'dessert-vegan'].includes(tag))) return 'dessert';

  const entry = Object.entries(COURSE_CATEGORY_MAP)
    .find(([, categories]) => categories.includes(normalizedCategory));
  return entry?.[0] || 'entree';
}

function getCourseLabel(courseGroup) {
  return COURSE_GROUPS.find((group) => group.id === courseGroup)?.label || '主餐';
}

function isDrinkCourse(courseGroup) {
  return courseGroup === 'drinks';
}

function buildSearchText(parts) {
  return normalizeText(uniqueItems(parts).join(' '));
}

function buildRecord(raw, index, restaurantMeta) {
  const restaurantId = compactText(raw.restaurant);
  const meta = restaurantMeta[restaurantId] || {};
  const restaurantLabel = compactText(meta.name) || restaurantId;
  const restaurantGroup = compactText(meta.group) || 'other';
  const restaurantGroupLabel = RESTAURANT_GROUP_LABELS[restaurantGroup] || restaurantGroup;
  const restaurantOrder = Number.isFinite(meta.order) ? meta.order : 999;
  const menuCategory = compactText(raw.category);
  const tags = Array.isArray(raw.tag)
    ? raw.tag.map(compactText).filter(Boolean)
    : compactText(raw.tag).split(',').map(compactText).filter(Boolean);
  const tagLabels = uniqueItems(tags.map((tag) => TAG_LABELS[tag] || tag));
  const courseGroup = resolveCourseGroup(menuCategory, tags);
  const courseGroupLabel = getCourseLabel(courseGroup);
  const englishName = compactText(raw.name_en);
  const zhLabel = compactText(raw.name_zh);
  const descriptionZh = compactText(raw.desc);
  const price = compactText(raw.price);
  const restaurantEnglish = RESTAURANT_ENGLISH_NAMES[restaurantId] || restaurantLabel;
  const menuCategoryLabel = CATEGORY_LABELS[menuCategory] || menuCategory;
  const aliases = uniqueItems([
    restaurantLabel,
    restaurantEnglish,
    restaurantGroupLabel,
    menuCategoryLabel,
    courseGroupLabel,
    menuCategory,
    courseGroup,
    ...tags,
    ...tagLabels
  ]);

  return {
    id: `menu-${restaurantId}-${menuCategory}-${slugify(englishName)}-${index + 1}`,
    sourceType: 'menu-item',
    zhLabel,
    englishName,
    descriptionZh,
    restaurantId,
    restaurantLabel,
    restaurantEnglish,
    restaurantGroup,
    restaurantGroupLabel,
    restaurantOrder,
    menuCategory,
    menuCategoryLabel,
    courseGroup,
    courseGroupLabel,
    price,
    tags,
    tagLabels,
    aliases,
    crewPhrase: isDrinkCourse(courseGroup)
      ? 'Could I order this drink, please?'
      : 'Could I order this, please?',
    searchText: buildSearchText([
      zhLabel,
      englishName,
      descriptionZh,
      restaurantId,
      restaurantLabel,
      restaurantEnglish,
      restaurantGroup,
      restaurantGroupLabel,
      menuCategory,
      menuCategoryLabel,
      courseGroup,
      courseGroupLabel,
      price,
      ...tags,
      ...tagLabels
    ]),
    sourceRecordIndex: index
  };
}

function buildRestaurants(records, restaurantMeta) {
  return Object.entries(restaurantMeta)
    .map(([id, meta]) => ({
      id,
      label: compactText(meta.name) || id,
      englishName: RESTAURANT_ENGLISH_NAMES[id] || compactText(meta.name) || id,
      group: compactText(meta.group) || 'other',
      groupLabel: RESTAURANT_GROUP_LABELS[meta.group] || compactText(meta.group) || '其他',
      order: Number.isFinite(meta.order) ? meta.order : 999,
      count: records.filter((record) => record.restaurantId === id).length
    }))
    .filter((restaurant) => restaurant.count > 0)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

async function buildPayload() {
  if (process.argv.includes('--local-corrections')) {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(OUTPUT_PATH, 'utf8'), sandbox);
    const payload = sandbox.window.MENU_LOOKUP_DATA;
    if (payload.records.length !== payload.sourceCount) throw new Error('Incomplete local snapshot');
    for (const record of payload.records) {
      record.courseGroup = resolveCourseGroup(record.menuCategory, record.tags);
      record.courseGroupLabel = getCourseLabel(record.courseGroup);
      record.crewPhrase = isDrinkCourse(record.courseGroup)
        ? 'Could I order this drink, please?' : 'Could I order this, please?';
    }
    return payload;
  }
  const menuSource = await fetchText(SOURCE_DATA_URL);
  const appSource = await fetchText(SOURCE_APP_URL);
  const rawRecords = parseMenuData(menuSource);
  const restaurantMeta = parseRestaurantMeta(appSource);
  const records = rawRecords.map((raw, index) => buildRecord(raw, index, restaurantMeta));
  const restaurants = buildRestaurants(records, restaurantMeta);

  return {
    version: VERSION,
    sourcePageUrl: SOURCE_PAGE_URL,
    sourceUrl: SOURCE_DATA_URL,
    sourceDataUrl: SOURCE_DATA_URL,
    generatedAt: new Date().toISOString().slice(0, 10),
    sourceCount: rawRecords.length,
    recordsCount: records.length,
    restaurantGroups: Object.entries(RESTAURANT_GROUP_LABELS).map(([id, label]) => ({ id, label })),
    courseGroups: COURSE_GROUPS,
    restaurants,
    records
  };
}

const payload = applyDocumentCorrections(await buildPayload());

fs.writeFileSync(
  OUTPUT_PATH,
  `window.MENU_LOOKUP_DATA = ${JSON.stringify(payload, null, 2)};\n`,
  'utf8'
);

console.log(`Wrote ${payload.records.length} menu records to ${OUTPUT_PATH.pathname}`);
