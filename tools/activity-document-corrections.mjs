export const ACTIVITY_SOURCE = {
  file: '活動整理.docx', reviewedAt: '2026-10-02',
  sha256: '0df294d00e42324726c07a0a87847879833dee1f4351da04cf42de1618f21d6c',
  note: '使用者提供的跨航次整理；段落從 1 起算，空段落亦計入。僅增補家庭相關活動，不移植歷史場次。'
};
const normalized = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const unique = values => [...new Set(values.filter(Boolean))];
const catalog = [];
const add = (englishName, zhLabel, venueEnglish, audience, paragraph, descriptionZh = '', participation = 'activity', feeNote = '') => {
  const deckHint = /Oceaneer|Toybox|Fairytale|Workshop|Captain's Deck|nursery/i.test(venueEnglish) ? 'Deck 8'
    : /Edge|Vibe|D Lounge|Baymax/.test(venueEnglish) ? 'Deck 7'
    : /Garden|Wayfinder/.test(venueEnglish) ? 'Deck 10'
    : /Town Square/.test(venueEnglish) ? 'Deck 6' : /Animator|Tiana/.test(venueEnglish) ? 'Deck 5' : '';
  catalog.push({ englishName, zhLabel, venueEnglish, deckHint, audience, paragraph, descriptionZh, participation, feeNote });
};
const families = [
  ['Family Movie Fun Time', '感官友善家庭觀影', 'Baymax Cinemas', 204, '部分燈光保留、音量較低；電影、影廳與字幕逐場確認，OC 不等於保證中文字幕。'],
  ['Family Dance Party', '家庭跳舞派對', 'D Lounge', 177, '可能有角色驚喜，不保證每場都有；場次看 Navigator。'],
  ['Family Dance Party', '家庭跳舞派對', 'Town Square', 180, '文件也列此場地，勿只找 D Lounge；依當日 App。'],
  ['Disney Junior Dance Party', 'Disney Junior 兒童舞會（全齡場）', 'D Lounge', 182, '全齡場可親子一起；不同於 Oceaneer 的 Kids only 場。'],
  ['Character Dance Party', '角色舞蹈派對', 'Disney Imagination Garden', 170, '角色與節目依當航次，不是預約擺拍場。'],
  ['Silent Disco Party', '耳機無聲派對', 'Disney Imagination Garden', 193, '配戴耳機參加的舞會；領取方式、年齡與時間現場確認。'],
  ['Mickey Color Spin Dance Party', '米奇繽紛色彩舞會', 'Disney Imagination Garden', 196, '非每航次都有；僅作 App 查詢名稱。'],
  ['Crafts: Family Crafts', '家庭創意手作', "Animator's Palate", 209, '依 App 場次安排，餐廳白天活動不代表用餐預約。'],
  ['Crafts: Origami Creations', '摺紙手作', 'Town Square', 246, '此為家庭版；同名也可能有 18+ 場，查資格後參加。'],
  ['Learn to Draw', '學畫畫', 'Town Square', 251, '不同場地有家庭、兒童、青少年或 18+ 版本，不能只按名稱判斷。'],
  ['Towel Folding', '折毛巾', 'Navigator 指定場地', 94, '地點與資格依當航次；不與文件列為 18+ 的 Napkin Folding 混用。'],
  ['Family Superstar Karaoke', '家庭卡拉 OK', 'D Lounge', 223, '不同於成人 Krazy Karaoke 或 Edge／Vibe 專屬卡拉 OK。'],
  ['Family Time Game Show', '家庭對抗賽', 'D Lounge', 226, '家庭互動遊戲，規則以主持人說明為準。'],
  ["Jack-Jack's Diaper Dash", '小傑寶寶爬行比賽', 'Navigator 指定場地', 91, '嬰幼兒活動；報名年齡與爬行資格問船員，本次三童可視情況旁觀。'],
  ['Frozen Phrases', '冰雪奇緣比手畫腳', 'Navigator 指定場地', 92, '你說我猜／比手畫腳；另外有 Edge 與 Vibe 專屬版本。'],
  ['Cornhole', '沙包投擲', 'Navigator 指定場地', 103, '地點與年齡依當日活動。']
];
for (const [en, zh, venue, p, desc] of families) add(en, zh, venue,
  /Family|Disney Junior/.test(en) ? 'All Ages / 全齡家庭場' : '依當場年齡資格', p, desc);
for (const venue of ['D Lounge', "Tiana's Bayou Lounge"]) {
  for (const [en, zh] of [['KnowsMore Presents Trivia', '萬事通知識問答'], ['Disney Tunes Trivia', '迪士尼歌曲問答'],
    ['Decades Music Trivia', '跨世代音樂問答'], ['Marvel Trivia', '漫威問答'], ['Movie Music Trivia', '電影音樂問答']]) {
    add(en, zh, venue, '依當場年齡資格（另有 18+ 版本）', 300, '先查 Navigator 是否標示 18+；這筆是家庭選場參考，不保證每場可帶孩子。');
  }
}
add('Family Bingo', '家庭賓果', 'D Lounge', '依當場年齡資格', 214, '購卡後參加，先確認費用；不同於兒童俱樂部的遊戲版。', 'activity', '付費購卡；金額現場確認');
add('Bingo Pre-Sales', '賓果預售購卡', 'D Lounge', '依當場年齡資格', 216, '這是購卡時段，不是正式賓果；不保證固定提前 45 分鐘。', 'pre-sales', '付費購卡；金額現場確認');
for (const [en, zh] of [['Captain Jack Sparrow', '傑克船長'], ['Duffy and Friends', '達菲與好友'], ['Disney Pal', '迪士尼朋友'],
  ['Toy Story', '玩具總動員'], ['Marvels', '漫威'], ['Frozen', '冰雪奇緣'], ['Zootopia', '動物方程式'], ['Moana', '海洋奇緣']]) {
  add(`Selfie at Sea: ${en}`, `海上舞台自拍：${zh}`, 'Navigator 指定場地', '依當場年齡資格', 326,
    '與舞台上的角色自拍，不等於一對一預約合照或簽名；地點可能在花園或 Wayfinder Bay，依 App。');
}
const youth = {
  "Disney's Oceaneer Club": ['Kids / 3–10 歲', 362, `
Ice Breakers|破冰遊戲
Meet Your Counselors|認識輔導員
Talent Show Prep|才藝表演準備
Talent Show|才藝表演
Animation Cels|動畫賽璐珞片手作
Craft Corner|手工藝角落
Make a Card for Someone Special|手作心意卡片
Spring Crafts|春季手作
Sport Crafts|運動主題手作
4 Square Competition|四格球挑戰
Elephant Soccer|大象足球
GAGA Ball|蓋加球淘汰賽
Game Challenge|遊戲挑戰
Parachute Games|彩虹傘遊戲
Relays Games|趣味接力
Ultimate Challenge|終極挑戰
Wacky Relays|瘋狂接力
A to Z Scavenger Hunt|英文字母尋寶
Bingo|兒童賓果遊戲
Detective School|偵探學校
Dory's Memory Game|多莉記憶遊戲
Human Bingo|人物尋找賓果
Pictionary Challenge|你畫我猜
Search for the Snugly Duckling|Snugly Duckling 主題尋寶
Scavenger Hunt|尋寶遊戲
Springtime Scavenger Hunt|春季尋寶
Cosmic Goo with Stitch|史迪奇史萊姆活動
Dance Party|兒童舞蹈派對
Disney Junior Dance Party|Disney Junior 兒童舞會
Eco-Chase with Black Panther|黑豹生態追逐任務
Hula Hoop Jam|呼拉圈派對
Lightning McQueen's Piston Cup|閃電麥坤活塞盃挑戰
Minnie's Captain Academy|米妮船長學園
Once Upon a Time|公主說故事
Spider-Man's Web Warriors|蜘蛛人吐絲特訓
Woody's Round Up|胡迪牛仔大會`],
  Edge: ['Tweens / 11–14 歲', 426, `
Ice Breakers|破冰遊戲
Meet Your Counselors|認識輔導員
Animation Cels|動畫賽璐珞片手作
Craft Corner|手工藝角落
Learn to Draw|學畫畫
4 Square Competition|四格球挑戰
GAGA Ball|蓋加球淘汰賽
Edge @ Ping Pong Tournament|Edge 乒乓球賽
Game Challenge|遊戲挑戰
Switch Challenge|Switch 遊戲挑戰
Video Game Challenge|電玩挑戰
Bring It!|問答與大冒險
Cards Tournament|桌遊卡牌大賽
Pictionary Challenge|你畫我猜
Trivia Challenge|知識問答
Ultimate Team Trials (Edge)|Edge 團隊考驗
Chillin' in Edge|Edge 自由放鬆
Edge Karaoke|Edge 卡拉 OK
Edge Movie Night|Edge 電影之夜
Tween Choice|少年投票選活動
KnowsMore Presents Trivia-Edge|Edge 萬事通知識問答
Gotcha Registration|Gotcha 事先報名
Gotcha!|Gotcha 生存遊戲
Gotcha II|Gotcha 續場遊戲
Bingo|少年賓果遊戲
Frozen Phrases|冰雪奇緣比手畫腳
Final Farewell|告別派對
Ms Marvel's AvengerCon|驚奇少女復仇者聯盟展`],
  Vibe: ['Teens / 14–17 歲', 476, `
Ice Breakers|破冰遊戲
Profiles|自我介紹
Meet Your Counselors|認識輔導員
Animation Cels|動畫賽璐珞片手作
Craft Corner|手工藝角落
Learn to Draw|學畫畫
4 Square Competition|四格球挑戰
Foosball Tournament|手足球賽
GAGA Ball|蓋加球淘汰賽
Vibe @ Ping Pong Tournament|Vibe 乒乓球賽
Game Challenge|遊戲挑戰
Switch Challenge|Switch 遊戲挑戰
Video Game Challenge|電玩挑戰
Bring It!|問答與大冒險
Board Game Challenge|桌遊挑戰
Cards Tournament|桌遊卡牌大賽
Pictionary Challenge|你畫我猜
Trivia Challenge|知識問答
Ultimate Team Trials (Vibe)|Vibe 團隊考驗
Chillin' in Vibe|Vibe 自由放鬆
Vibe Karaoke|Vibe 卡拉 OK
Teens Choice|青少年投票選活動
KnowsMore Presents Trivia-Vibe|Vibe 萬事通知識問答
Gotcha Registration|Gotcha 事先報名
Gotcha!|Gotcha 生存遊戲
Gotcha II|Gotcha 續場遊戲
Bingo|青少年賓果遊戲
Frozen Phrases|冰雪奇緣比手畫腳
Final Farewell|告別派對
Ms Marvel's AvengerCon|驚奇少女復仇者聯盟展`]
};
for (const [venue, [audience, paragraph, list]] of Object.entries(youth)) {
  for (const line of list.trim().split('\n')) {
    const [en, zh] = line.split('|');
    add(en, zh, venue, audience, paragraph,
      en.startsWith('Gotcha') ? '須先確認報名資格與完成登記，再參加遊戲；Registration、Gotcha! 與 Gotcha II 是不同階段，不保證固定時刻。'
        : '依 Navigator 的當次年齡、報名與活動說明參加；角色現身與場次不保證。',
      en === 'Gotcha Registration' ? 'registration' : 'secured-youth',
      en === 'Bingo' ? '文件列免費遊戲版；不同於 D Lounge 付費購卡' : '費用依當次活動確認');
  }
}
for (const venue of ["Disney's Oceaneer Club", 'Edge', 'Vibe', "It's a small world nursery", "Mickey & Minnie Captain's Deck", "Andy's Toybox", 'Fairytale Hall', 'Marvel W.E.B. Workshop']) {
  add('Youth Activities Open House', '兒少設施開放參觀', venue, 'All Ages / 全齡 Open House', 143,
    '由家長陪同參觀，不是託管；同時間不同子區可分別是 Open House 或 Kids only，逐區看 App 與入口標示。', 'open-house');
  if (["Disney's Oceaneer Club", 'Edge', 'Vibe'].includes(venue)) add('Youth Activities Open House & Registration', '兒少設施開放參觀與登記', venue, 'All Ages / 全齡 Open House', 143, '參觀與正式活動登記不同；資格、手環或貼紙依場館核對。', 'open-house');
}

function canonicalName(value, venue) {
  let name = String(value || '').replace(/[’‘]/g, "'").trim()
    .replace(/\s*\(\d+(?:hr)?(?:\d+)?(?:min|mon)?\)\s*$/i, '')
    .replace(/^Lighting McQueen/, 'Lightning McQueen').replace(/^GABA Ball$/, 'GAGA Ball')
    .replace(/^Games Challenge$/, 'Game Challenge').replace(/^Chillin's in Vibe$/, "Chillin' in Vibe")
    .replace(/^Disney Jr Dance Party$/i, 'Disney Junior Dance Party');
  if (name === 'Ultimate Team Trials' && ['Edge', 'Vibe'].includes(venue)) name += ` (${venue})`;
  return name;
}
const venueKey = venue => normalized(venue) === 'garden stage' ? 'disney imagination garden' : normalized(venue);
const key = (name, venue) => normalized(name) + '|' + venueKey(venue);
const sourceRef = paragraph => `${ACTIVITY_SOURCE.file} ¶${paragraph} 起（跨航次整理；時間與資格看 Navigator）`;

export function applyActivityDocument(payload) {
  const result = structuredClone(payload);
  // Existing source rows and historical timestamps remain intact; only display facts are corrected.
  const oldRecords = result.records.filter(r => !r.documentSupplement);
  const map = new Map(catalog.map(item => [key(item.englishName, item.venueEnglish), item]));
  const covered = new Set();
  for (const record of oldRecords) {
    const original = { en: record.englishName, zh: record.zhLabel };
    if (!record.originalWording) record.originalWording = original;
    const originalLabel = record.originalWording.zh;
    if (!record.audience) record.audience = /18\+/.test(originalLabel) ? 'Adults / 18 歲以上'
      : /all ages/i.test(originalLabel) ? 'All Ages / 全齡'
      : /^Kids/i.test(originalLabel) ? 'Kids / 3–10 歲'
      : /^Tweens/i.test(originalLabel) ? 'Tweens / 11–14 歲'
      : /^Teens/i.test(originalLabel) ? 'Teens / 14–17 歲' : '依當場年齡資格';
    if (!record.participation) record.participation = /open house/i.test(originalLabel) ? 'open-house'
      : /registration/i.test(originalLabel) ? 'registration' : 'activity';
    if (/^Youth Activities Open House/i.test(record.originalWording.en)) {
      record.audience = 'All Ages / 全齡 Open House';
      record.participationNote = '家長陪同參觀，不是託管；登記資格依各場館核對。';
    }
    let name = record.originalWording.en;
    if (name === 's Music Trivia' && /90s Music Trivia/.test(originalLabel)) {
      record.englishName = name = '90s Music Trivia';
      record.aliases = unique([...(record.aliases || []), record.originalWording.en]);
      record.sourceRefs = unique([...(record.sourceRefs || []), sourceRef(313)]);
    }
    if (/^(Kids|Tweens|Teens|Open house)$/i.test(name)) name = originalLabel.replace(/^.*?：\s*/, '');
    if (name === 'Bingo') name = originalLabel.replace(/^.*?：\s*/, '');
    name = canonicalName(name, record.venueEnglish);
    if (record.id === 'onboard-090') name = 'Family Movie Fun Time';
    const openHouse = /open house/i.test(originalLabel);
    const venue = record.id === 'onboard-090' ? 'Baymax Cinemas' : record.venueEnglish;
    // A source without a venue adds detail to an existing public event, not a duplicate card.
    const item = map.get(key(name, venue)) || (!youth[venue]
      ? map.get(key(name.replace(/^Selfie at Sea: Disney Pals$/, 'Selfie at Sea: Disney Pal'), 'Navigator 指定場地')) : null);
    if (!item || /18\+/.test(originalLabel)) {
      if (/^(Kids|Tweens|Teens|Open house|Bingo)$/i.test(record.originalWording.en) && name) {
        record.englishName = name;
        record.aliases = unique([...(record.aliases || []), record.originalWording.en, originalLabel]);
      }
      continue;
    }
    const isYouth = !!youth[venue] || /nursery|Toybox|Fairytale|Workshop|Captain's Deck/i.test(venue);
    record.englishName = item.englishName;
    record.zhLabel = item.zhLabel;
    record.aliases = unique([...(record.aliases || []), originalLabel, record.originalWording.en, item.zhLabel]);
    record.audience = openHouse && isYouth ? 'All Ages / 全齡 Open House' : item.audience;
    record.participation = openHouse && isYouth ? 'open-house' : item.participation;
    record.participationNote = record.participation === 'open-house' ? '家長陪同參觀，不是託管；限當次開放區域。'
      : record.participation === 'registration' ? '事先報名，非正式遊戲場。' : '依 Navigator 當次資格與報名規則。';
    record.feeNote = item.feeNote;
    record.descriptionZh = item.descriptionZh;
    record.sourceRefs = unique([...(record.sourceRefs || []), sourceRef(item.paragraph)]);
    record.crewPhrase = 'Could you confirm the age requirement and how to join this activity?';
    if (record.id === 'onboard-090') record.descriptionZh += ' 原紀錄片名 Zootopia 2 僅為歷史場次，不保證重映。';
    if (record.participation === item.participation && record.audience === item.audience) covered.add(key(item.englishName, item.venueEnglish));
  }
  const additions = catalog.filter(item => !covered.has(key(item.englishName, item.venueEnglish))).map(item => {
    const slug = value => normalized(value).replace(/[^a-z0-9]+/g, '-');
    return {
      id: `onboard-doc-${slug(item.venueEnglish)}-${slug(item.englishName)}`,
      category: youth[item.venueEnglish] || item.participation === 'open-house' ? 'youth' : 'activity',
      zhLabel: item.zhLabel, englishName: item.englishName, venueEnglish: item.venueEnglish, deckHint: item.deckHint,
      audience: item.audience, participation: item.participation,
      participationNote: item.participation === 'open-house' ? '家長陪同參觀，不是託管；限當次開放區域。' : item.participation === 'registration' ? '事先報名，非正式遊戲場。' : '依 Navigator 當次資格與報名規則。',
      feeNote: item.feeNote, descriptionZh: item.descriptionZh,
      crewPhrase: 'Could you confirm the age requirement and how to join this activity?',
      sourceDayLabel: '', sourceTimeHint: '', sourceRefs: [sourceRef(item.paragraph)],
      aliases: [item.zhLabel, '家庭活動'], documentSupplement: true
    };
  });
  result.records = [...oldRecords, ...additions];
  result.version = '2026-10-02-family-activities-v1';
  result.documentSource = ACTIVITY_SOURCE;
  result.baseRecordCount = oldRecords.length;
  result.supplementCount = additions.length;
  result.recordsCount = result.records.length;
  return result;
}
