// Display relationships only. Content, IDs and historical records stay in their original sources.
window.EXPLORE_PRESENTATION = (() => {
    const facilities = {};
    const add = (suffix, title, area = 'unknown', type = 'facility', deckIds = null) => {
        facilities['search-deck-' + suffix] = {title, area, type, deckIds};
    };
    add('deck5-1', '動畫師的調色盤', 'unknown', 'restaurant');
    add('deck5-2', '蒂安娜河灣酒廊', 'unknown', 'restaurant');
    add('deck5-3', '迪士尼商店與 Too');
    add('deck6-0', '魔法盛夏餐廳', 'unknown', 'restaurant');
    add('deck6-1', '客務中心');
    add('deck6-2', '酒水點心與史迪奇拍照', 'unknown', 'restaurant');
    add('deck6-3', '魔法、皇家宮廷與海盜酒吧', 'unknown', 'restaurant');
    add('deck5-0', '華特迪士尼劇院', 'unknown', 'facility', ['deck6', 'deck7']);
    add('deck6-navigators-club', '航海家俱樂部', 'aft', 'restaurant');
    add('deck7-0', 'Edge 與 Vibe 青少年空間');
    add('deck7-1', '大英雄電玩區');
    add('deck7-2', 'Baymax 四影廳電影院');
    add('deck7-3', 'Alley Cat 咖啡館與商店街', 'unknown', 'mixed');
    add('deck7-4', 'Pics 照片商店');
    add('deck8-0', 'Oceaneer 兒童俱樂部');
    add('deck8-1', '兒童手環與接送');
    add('deck8-2', '皇家友誼茶會');
    add('deck8-3', '好萊塢聚光燈俱樂部', 'aft', 'restaurant');
    add('deck8-nursery', '小小世界育嬰室');
    add('deck9-health-center', '醫務中心', 'forward');
    add('deck9-0', 'Pics 拍照觀景點');
    add('deck9-animators-table', '動畫師餐桌', 'unknown', 'restaurant');
    add('deck10-cosmic-kebabs', '宇宙烤肉快餐', 'unknown', 'restaurant');
    add('deck10-0', '幻想花園舞台', 'mid');
    add('deck10-1', '海洋奇緣灣與探索礁區', 'unknown');
    add('deck10-2', '塔拉奶奶廚房', 'mid', 'restaurant');
    add('deck10-3', '毛克利餐館', 'unknown', 'restaurant');
    add('deck10-4', '史迪奇快餐', 'aft', 'restaurant');
    add('deck10-5', 'Wayfinder 海景酒吧', 'aft', 'restaurant');
    add('deck11-0', '花園舞台上層視角', 'mid');
    add('deck11-1', '花園與波多羅索酒吧', 'unknown', 'restaurant');
    add('deck11-2', 'Palo 義式餐廳', 'unknown', 'restaurant');
    add('deck11-3', '城堡精品店');
    add('deck16-laundry', '自助洗衣房');
    add('deck17-0', '禮賓酒廊', 'forward', 'mixed');
    add('deck17-1', '玩具總動員泳池與戲水區');
    add('deck17-2', '皮克斯市集、披薩與冰品', 'mid', 'restaurant');
    add('deck17-3', 'Market Bar 與商店', 'unknown', 'mixed');
    add('deck18-0', '漫威遊樂設施');
    add('deck18-1', '無邊際泳池與池畔酒吧', 'aft', 'mixed');
    add('deck18-2', '跑道與禮賓健身中心');
    add('deck18-3', 'Opulence 禮賓水療', 'forward');
    add('deck19-0', '禮賓日光甲板與泳池', 'forward', 'mixed');
    add('deck19-1', '胡迪滑水道入口');
    add('deck19-2', '鋼鐵人測試車高空段');
    const essential = {
        'deck7-0':'Edge 11–14 歲；Vibe 14–17 歲，各有資格。',
        'deck8-0':'正式活動限 3–10 歲且能自行如廁；Open House 不是託管。',
        'deck8-nursery':'6 個月至 3 歲，付費且需確認名額。',
        'deck11-2':'10 歲以上，需預約並另付費。',
        'deck17-1':'未滿 12 歲須成人監督；Flying Saucer 限 4–8 歲。',
        'deck18-1':'未滿 12 歲須成人監督；資格與開放依現場。',
        'deck19-1':'赤腳至少 122 公分；不穿水鞋、不帶面罩或鬆散物。'
    };
    for (const [suffix,note] of Object.entries(essential)) facilities['search-deck-'+suffix].essential = note;

    const shows = {
        'search-show-stage-musicals-0': {deckIds:['deck6','deck7'], area:'unknown', title:'Remember', venueId:'theatre'},
        'search-show-stage-musicals-1': {deckIds:['deck6','deck7'], area:'unknown', title:'Disney Seas the Adventure', venueId:'theatre'},
        'search-show-garden-shows-1': {deckIds:['deck6','deck7','deck10'], area:'unknown', title:'Duffy 與好友', venueId:null, locationStatus:'possible'},
        'search-show-garden-shows-0': {deckIds:['deck10','deck11'], area:'mid', title:'Avengers Assemble!', venueId:'garden'},
        'search-show-garden-shows-2': {deckIds:['deck10','deck11'], area:'mid', title:'啟航秀與 Baymax 運動會', venueId:'garden'},
        'search-show-mickey-color-spin': {deckIds:['deck10'], area:'mid', title:'米奇繽紛舞會', venueId:'garden'},
        'search-show-open-air-night-0': {deckIds:['deck10'], area:'aft', title:'Moana 海洋奇緣表演', venueId:'wayfinder'},
        'search-show-open-air-night-1': {deckIds:['deck17','deck18'], area:'unknown', title:'獅子王海上煙火', venueId:'upper', locationStatus:'possible'}
    };
    const topics = [
        {id:'departure', label:'出發與登船'}, {id:'dining', label:'吃喝與點餐'},
        {id:'shows-photos', label:'看秀與拍照'}, {id:'family', label:'帶孩子玩'},
        {id:'daily', label:'房間與日常'}, {id:'concierge', label:'禮賓怎麼用'}, {id:'departure-home', label:'下船與返程'}
    ];
    const playbook = {};
    const tip = (suffix, topic, title, preview) => { playbook['search-playbook-' + suffix] = {topic, title, preview}; };
    tip('pretrip-0','daily','手機時區怎麼設定','手機與 Navigator 對時，避免自動跳時區。');
    tip('pretrip-1','departure','合作飯店接駁怎麼確認','先核對合作資格、集合與行李安排。');
    tip('pretrip-2','departure','帳號與全家資料怎麼備','先備英文資料與照片，減少報到卡關。');
    tip('pretrip-3','departure','線上報到五步驟','事先熟悉資料、付款、交通與條款流程。');
    tip('pretrip-4','departure','電器與充電怎麼帶','先查禁止清單，不把延長線帶上船。');
    tip('pretrip-5','shows-photos','爆米花桶要放哪裡','帶進隨身包；續裝適用與收費先詢問。');
    tip('embark-sprint-0','departure','登船隨身包帶什麼','下午用品別全放托運，換裝與拍照才方便。');
    tip('embark-sprint-1','departure','登船第一圈怎麼走','先核對報到、手環、演練與預約，再安排玩水。');
    tip('embark-sprint-2','concierge','Lounge 如何當中轉站','短休與補水，不把全家動線塞滿。');
    tip('daily-ops-0','dining','免費飲料去哪裝','分清免費飲料機與付費酒吧。');
    tip('daily-ops-1','shows-photos','看秀的爆米花與飲料','先確認禮賓供應，再決定是否買桶。');
    tip('daily-ops-2','daily','購物怎麼少排隊','備購物袋，核對開店、預約與房帳付款。');
    tip('daily-ops-3','dining','房務怎麼點、要等多久','提早點餐；深夜與早餐都要留等候緩衝。');
    tip('daily-ops-4','shows-photos','角色合照與簽名怎麼安排','分清預約、自拍場與路遇互動，不保證能簽名。');
    tip('daily-ops-5','shows-photos','看秀與角色預約怎麼排','先排重要表演，再避開晚餐與見面會衝突。');
    tip('daily-ops-6','shows-photos','拍照套裝與下載期限','先核對涵蓋範圍，航行中檢查並下載照片。');
    tip('daily-ops-7','daily','Navigator 與免費網路','先登入船內網路，再核對 App 預約。');
    tip('daily-ops-8','shows-photos','依樓層找拍照點','把拍照點順路排進動線，場次仍查 App。');
    tip('dining-pairs','dining','輪替與付費餐廳怎麼選','輪替看分配；付費餐廳另核對資格與預約。');
    tip('drink-offers','dining','飲品套裝與咖啡集點','先問適用範圍，再比較是否合用。');
    tip('rainforest-day-pass','daily','雨林水療怎麼安排','核對地點、費用與時段，不和禮賓 Spa 混用。');
    tip('concierge-plus-0','concierge','歡迎午餐與迎賓禮','資格與地點以當航次通知為準。');
    tip('concierge-plus-1','concierge','冰箱飲料如何補充','需要時聯絡禮賓，先核對所住房型權益。');
    tip('concierge-plus-2','concierge','如何聯絡禮賓協助','房內電話也能問，不必全家跑櫃台。');
    tip('concierge-plus-3','concierge','Lounge 休息與角色安排','善用下午茶和分流，角色場次先問團隊。');
    tip('concierge-plus-4','concierge','禮賓供餐與酒水時段','輕食、熱食與付費飲品是不同供應窗口。');
    tip('concierge-plus-5','concierge','24 小時網路何時啟用','需要時才啟用，連續計時權益先核對。');
    tip('concierge-plus-6','shows-photos','禮賓看秀在哪集合','準備房卡與憑證，集合方式依當晚通知。');
    tip('stateroom-family-0','family','兒童手環怎麼領與歸還','登記、接送與可退押金一起核對。');
    tip('stateroom-family-1','daily','房間收納與磁吸掛勾','集中小物，讓房間與走道保持整齊。');
    tip('stateroom-family-2','daily','睡眠與暈船備援','事先準備舒適用品，不自行推定藥物適用。');
    tip('stateroom-family-3','daily','客艙設備與走廊辨向','保險箱、吹風機與網路限制先熟悉。');
    tip('stateroom-family-4','daily','自助洗衣怎麼排','Deck 16 查設備，避開最後一晚才洗。');
    tip('family-planning-0','family','鋼鐵人設施排隊備案','前兩天先觀察，重要晚餐與主秀前停止長隊。');
    tip('family-planning-1','family','家庭室內活動備案','看當場資格，D Lounge 並非每場都適合兒童。');
    tip('family-planning-2','concierge','無菸座位與吸菸區','上船核對指定區域，不推定整間酒廊可吸菸。');
    tip('family-planning-3','departure','全家預約如何核對','禮賓回信後，再確認 App 出席名單與餐飲需求。');
    tip('last-night-0','departure-home','最後一晚的晨間包','護照、衣物與孩子用品不要交運。');
    tip('last-night-1','departure-home','早餐、離房與下船','依當航次通知安排，不把歷史時間當保證。');
    tip('last-night-2','daily','額外小費怎麼給','自願表達感謝，不把旅客建議當固定費率。');
    tip('last-night-3','dining','自帶飲料注意什麼','包裝、手提與酒精政策出發前再確認。');
    const related = {
        'search-playbook-daily-ops-6':['search-playbook-daily-ops-8'],
        'search-playbook-daily-ops-8':['search-playbook-daily-ops-6'],
        'search-playbook-concierge-plus-4':['search-playbook-concierge-plus-3','search-playbook-embark-sprint-2'],
        'search-playbook-concierge-plus-3':['search-playbook-concierge-plus-4'],
        'search-playbook-embark-sprint-2':['search-playbook-concierge-plus-4']
    };
    const venues = [];
    const venue = (id, label, names, deckIds, area = 'unknown', cardId = null) => venues.push({id,label,names,deckIds,area,cardId});
    venue('garden','花園舞台',['Disney Imagination Garden','Garden Stage'],['deck10','deck11'],'mid','search-deck-deck10-0');
    venue('theatre','華特迪士尼劇院',['Walt Disney Theatre'],['deck6','deck7'],'unknown','search-deck-deck5-0');
    venue('wayfinder','Wayfinder Bay',['Wayfinder Bay'],['deck10'],'aft','search-deck-deck10-1');
    venue('cinema','Baymax 電影院',[1,2,3,4].map(n=>'Baymax Cinema '+n),['deck7'],'unknown','search-deck-deck7-2');
    venue('oceaneer','Oceaneer 俱樂部',["Disney's Oceaneer Club",'Marvel W.E.B. Workshop',"Mickey & Minnie Captain's Deck","Andy's Toybox",'Fairytale Hall'],['deck8'],'unknown','search-deck-deck8-0');
    venue('edge','Edge',['Edge'],['deck7'],'unknown','search-deck-deck7-0');
    venue('vibe','Vibe',['Vibe'],['deck7'],'unknown','search-deck-deck7-0');
    venue('photos','Pics 照片商店',['Pics Photo Shop','Disney Studio','Royal Studio'],['deck7'],'unknown','search-deck-deck7-4');
    venue('observatory','Pics 拍照觀景點',['Pics Photo Observatory'],['deck9'],'unknown','search-deck-deck9-0');
    venue('buccaneer','海盜酒吧',['Buccaneer Bar'],['deck6']);
    venue('tiana','蒂安娜酒廊',["Tiana's Bayou Lounge"],['deck5']);
    venue('snacks','Premier Sips & Snacks',['Premier Sips & Snacks'],['deck6']);
    venue('taverna','波多羅索酒吧',['Taverna Portorosso'],['deck11']);
    venue('palate','動畫師的調色盤',["Animator's Palate"],['deck5']);
    venue('nursery','小小世界育嬰室',['It’s a small world nursery'],['deck8']);
    venue('upper','煙火觀賞甲板',['Fireworks Viewing Upper Decks'],['deck17','deck18']);
    venue('deck7','Deck 7',['Deck 7'],['deck7']);
    // Ambiguous or unverified venues intentionally have no inferred floor.
    const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
    function groupActivities(records) {
        const groups = new Map();
        for (const record of records) {
            const key = [record.englishName,record.venueEnglish,record.audience,record.participation,record.participationNote,record.feeNote].map(normalize).join('|');
            if (!groups.has(key)) {
                const place = venues.find(v=>v.names.some(name=>normalize(name)===normalize(record.venueEnglish)));
                groups.set(key,{id:'explore-activity-'+record.id,record,records:[],venue:place || {id:'unknown',label:'地點待確認',deckIds:[],area:'unknown'}});
            }
            groups.get(key).records.push(record);
        }
        return [...groups.values()];
    }
    return {facilities,shows,topics,playbook,related,venues,groupActivities};
})();
