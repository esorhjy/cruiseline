// Presentation only: original itinerary text, IDs and booking facts stay in data.js.
window.JOURNEY_PRESENTATION_DATA = {
    events: {
        'search-schedule-day1-0-0': {
            shortTitle: '抵達碼頭、完成報到', location: '集合點與交通依確認信', status: 'pending',
            essentialNote: '先備好 QR code；接送與核准報到時間仍須核對。',
            targets: [{id: 'search-playbook-embark-sprint-1', label: '登船流程'}]
        },
        'search-schedule-day1-0-1': {
            shortTitle: '登船午餐', location: '依當日開放餐廳與接待通知', status: 'reserved',
            essentialNote: '歡迎午餐先核對各房資格與場地；下午用品留隨身包。',
            targets: [{id: 'search-playbook-concierge-plus-0', label: '歡迎午餐'}, {id: 'search-deck-deck10-4', label: '史迪奇快餐'}, {id: 'search-deck-deck6-0', label: '魔法盛夏餐廳'}]
        },
        'search-schedule-day1-0-2': {
            shortTitle: '禮賓酒廊報到', location: 'Deck 17 船頭', status: 'reserved',
            essentialNote: '先核對晚餐桌號、主秀集合及角色安排。',
            targets: [{id: 'search-deck-deck17-0', label: '禮賓酒廊'}]
        },
        'search-schedule-day1-1-0': {
            shortTitle: '兒童俱樂部 Open House', location: 'Deck 8', status: 'pending', timeLabel: '依開放場次',
            essentialNote: 'Open House 全齡開放、不是託管；正式活動限 3–10 歲且須能自行如廁，不帶私人物品。',
            targets: [{id: 'search-deck-deck8-0', label: '俱樂部資格'}, {id: 'search-playbook-stateroom-family-0', label: '領手環與接送'}]
        },
        'search-schedule-day1-1-1': {
            shortTitle: '熟悉郵輪核心動線', location: 'Deck 8 → 7 → 10/11 → 17', status: 'reserved',
            essentialNote: '小寶若參加 Edge，先登記取得房卡貼紙。',
            targets: [{id: 'search-deck-deck7-0', label: '青少年空間'}, {id: 'search-deck-deck10-0', label: '花園舞台動線'}]
        },
        'search-schedule-day1-1-2': {
            shortTitle: '全家玩水備案', location: 'Deck 17／禮賓泳池', status: 'reserved', timeLabel: '演練外空檔',
            essentialNote: '全程成人監督，預留換裝與演練集合。Flying Saucer 限 4–8 歲；Wild Slides 赤腳至少 122 公分，不穿水鞋、不帶面罩或鬆散物。',
            targets: [{id: 'search-deck-deck17-1', label: '泳池與嬉水區'}, {id: 'search-deck-deck19-1', label: '滑道限制'}]
        },
        'search-schedule-day1-1-3': {
            shortTitle: '全員安全演練', location: '房卡集合區／App 通知', status: 'pending', timeLabel: '依集合通知',
            essentialNote: '全員必到，孩子與長者也須每人刷卡；不可與玩水重疊。',
            targets: [{id: 'search-playbook-embark-sprint-1', label: '登船提醒'}]
        },
        'search-schedule-day1-1-4': {
            shortTitle: '聽啟航汽笛', location: '開放甲板依公告', status: 'pending', timeLabel: '依啟航公告',
            essentialNote: '不與晚餐衝突才去；勿靠汽笛太近。', targets: []
        },
        'search-schedule-day1-2-1': {
            shortTitle: '首日晚間主秀', location: '華特迪士尼劇院 · Deck 6–7', status: 'pending', timeLabel: '依 App 場次',
            essentialNote: '首晚節目尚未指定；依通知核對禮賓集合，再接晚餐。',
            targets: [{id: 'search-deck-deck5-0', label: '劇院與入口'}, {id: 'search-playbook-concierge-plus-6', label: '禮賓入場'}]
        },
        'search-schedule-day1-2-0': {
            shortTitle: '晚餐 · 動畫師餐桌', location: 'Animator’s Table · Deck 9', status: 'confirmed',
            essentialNote: '可能調整 15 分鐘；按最終時間提前 5 分鐘到場，可帶畫作資料夾。',
            targets: [{id: 'search-deck-deck9-animators-table', label: '查看餐廳'}],
            menu: [{id: 'animator', label: '晚餐菜單（配對共用）'}]
        },
        'search-schedule-day1-2-2': {
            shortTitle: '禮賓酒廊甜點收尾', location: 'Deck 17 船頭', status: 'reserved', timeLabel: '晚餐後有空才去',
            essentialNote: '仍在 20:30–22:00 供應內才去，不為甜點提早離席。',
            targets: [{id: 'search-deck-deck17-0', label: '酒廊供應'}]
        },
        'search-schedule-day2-0-0': {
            shortTitle: '早餐', location: '房內送餐或開放餐廳', status: 'reserved',
            essentialNote: '預留等餐緩衝；免配送費不等於所有品項免費。',
            targets: [{id: 'search-playbook-daily-ops-3', label: '客房早餐怎麼點'}],
            menu: [{id: 'room-service', label: '客房送餐菜單'}, {id: 'main-breakfast', label: '主餐廳早餐參考'}]
        },
        'search-schedule-day2-1-0': {
            shortTitle: '漫威設施與鋼鐵人測試車', location: 'Marvel Landing · Deck 18/19', status: 'pending',
            essentialNote: '先查資格與預約／免預約時段；停機或排隊影響主秀就改備案。',
            targets: [{id: 'search-deck-deck18-0', label: '漫威設施'}, {id: 'search-playbook-family-planning-0', label: '排隊備案'}]
        },
        'search-schedule-day2-1-1': {
            shortTitle: '無邊際泳池休息', location: 'Infinity Pool · Deck 18', status: 'reserved',
            essentialNote: '未滿 12 歲須成人監督；依現場告示，避開船尾左舷吸菸區。',
            targets: [{id: 'search-deck-deck18-1', label: '泳池與限制'}]
        },
        'search-schedule-day2-1-2': {
            shortTitle: '海洋奇緣灣、探索礁區', location: 'Wayfinder Bay · Deck 10 船尾', status: 'reserved',
            essentialNote: '', targets: [{id: 'search-deck-deck10-1', label: '查看地點'}]
        },
        'search-schedule-day2-2-0': {
            shortTitle: '午餐 · 魔法盛夏餐廳', location: 'Enchanted Summer · Deck 6', status: 'reserved',
            essentialNote: '當日供應依 App／餐廳確認。',
            targets: [{id: 'search-deck-deck6-0', label: '查看餐廳'}]
        },
        'search-schedule-day2-3-0': {
            shortTitle: '舊京山街道、體感遊戲', location: 'Deck 7', status: 'reserved',
            essentialNote: '', targets: [{id: 'search-deck-deck7-1', label: '大英雄電玩'}, {id: 'search-deck-deck7-3', label: '商店街'}]
        },
        'search-schedule-day2-3-1': {
            shortTitle: '小寶可選 Edge／全家備案', location: 'Edge · Deck 7', status: 'reserved',
            essentialNote: 'Edge 限 11–14 歲，僅小寶符合；三童一起改電玩或 D Lounge。',
            targets: [{id: 'search-deck-deck7-0', label: 'Edge 資格'}, {id: 'search-playbook-family-planning-1', label: '家庭活動備案'}]
        },
        'search-schedule-day2-3-2': {
            shortTitle: '禮賓酒廊下午茶', location: 'Deck 17 船頭', status: 'reserved',
            essentialNote: '下午茶供應至 16:30。', targets: [{id: 'search-deck-deck17-0', label: '酒廊供應'}]
        },
        'search-schedule-day2-3-3': {
            shortTitle: '花園舞台候選節目', location: 'Deck 10/11 船中', status: 'pending',
            essentialNote: '先選不與主秀、晚餐衝突的場次；Duffy 地點另查 App。',
            targets: [{id: 'search-show-garden-shows-0', label: 'Avengers'}, {id: 'search-show-garden-shows-2', label: '啟航秀／Baymax'}, {id: 'search-show-garden-shows-1', label: 'Duffy'}]
        },
        'search-schedule-day2-4-1': {
            shortTitle: '重要劇院主秀', location: '華特迪士尼劇院 · Deck 6–7', status: 'pending', timeLabel: '依 App 場次',
            essentialNote: '以本航次分配／開放場次為準，先核對晚餐與集合時間。',
            targets: [{id: 'search-show-stage-musicals-0', label: 'Remember'}, {id: 'search-show-stage-musicals-1', label: 'Disney Seas the Adventure'}]
        },
        'search-schedule-day2-4-0': {
            shortTitle: '晚餐 · 魔法盛夏餐廳', location: 'Enchanted Summer · Deck 6', status: 'confirmed',
            essentialNote: '可能調整 15 分鐘；按最終時間提前 5 分鐘到場，桌號查 App。',
            targets: [{id: 'search-deck-deck6-0', label: '查看餐廳'}], menu: [{id: 'pixar', label: '晚餐菜單（配對共用）'}]
        },
        'search-schedule-day2-4-2': {
            shortTitle: '禮賓酒廊收尾', location: 'Deck 17 船頭', status: 'reserved', timeLabel: '晚餐後有空才去',
            essentialNote: '仍在 20:30–22:00 供應內才去，不為甜點提早離席。',
            targets: [{id: 'search-deck-deck17-0', label: '酒廊供應'}]
        },
        'search-schedule-day3-royal-gathering': {
            shortTitle: '公主見面會', location: 'Royal Gathering · 報到地點查預約', status: 'confirmed',
            essentialNote: '1/27 08:30 已確認；報到時間與參加名單另查預約，不預設活動長度。',
            targets: [{id: 'search-playbook-daily-ops-4', label: '角色合照攻略'}]
        },
        'search-schedule-day3-0-0': {
            shortTitle: '合照後吃早餐', location: '依當時開放餐廳', status: 'reserved',
            essentialNote: '核對早餐供應；吃完回房換泳裝。', targets: [],
            menu: [{id: 'main-breakfast', label: '主餐廳早餐參考'}]
        },
        'search-schedule-day3-moana': {
            shortTitle: '換裝後看 Moana（候選）', location: 'Wayfinder Bay · Deck 10 船尾', status: 'pending', timeLabel: '早餐、換裝後',
            essentialNote: '場次待確認，不保證上午；無法銜接就改活動，不為搶位久曬。',
            targets: [{id: 'search-show-open-air-night-0', label: '查看表演'}]
        },
        'search-schedule-day3-1-0': {
            shortTitle: '全家玩水', location: 'Deck 17／禮賓泳池', status: 'reserved', timeLabel: 'Moana 後／無場次備案',
            essentialNote: '未滿 12 歲須成人監督。Wild Slides 赤腳至少 122 公分；Flying Saucer 限 4–8 歲，僅彤妹符合。',
            targets: [{id: 'search-deck-deck17-1', label: '泳池與嬉水區'}, {id: 'search-deck-deck19-1', label: '滑道限制'}]
        },
        'search-schedule-day3-1-1': {
            shortTitle: '大人 Spa／健身備案', location: 'Deck 18 船頭', status: 'reserved', timeLabel: '有空與照顧人力才去',
            essentialNote: '先安排成人照顧孩子；療程另確認預約及費用。',
            targets: [{id: 'search-deck-deck18-3', label: 'Opulence Spa'}, {id: 'search-deck-deck18-2', label: '健身空間'}]
        },
        'search-schedule-day3-2-0': {
            shortTitle: '午餐 · 皮克斯市集', location: 'Pixar Market · Deck 17', status: 'reserved', timeLabel: '依早餐、演出彈性安排',
            essentialNote: '自助餐與披薩等快餐是不同餐飲點。', targets: [{id: 'search-deck-deck17-2', label: '查看餐飲點'}]
        },
        'search-schedule-day3-3-0': {
            shortTitle: '體感遊戲／家庭活動', location: '電玩 Deck 7／D Lounge 依 App', status: 'reserved',
            essentialNote: '依孩子精神選擇；家庭活動不保證角色出席。',
            targets: [{id: 'search-deck-deck7-1', label: '大英雄電玩'}, {id: 'search-playbook-family-planning-1', label: 'D Lounge'}]
        },
        'search-schedule-day3-3-1': {
            shortTitle: 'Baymax 電影院休息', location: 'Deck 7', status: 'reserved',
            essentialNote: '片單、字幕與場次依當日公告。', targets: [{id: 'search-deck-deck7-2', label: '查看影廳'}]
        },
        'search-schedule-day3-3-2': {
            shortTitle: '禮賓日光甲板放鬆', location: 'Deck 19 船頭', status: 'reserved',
            essentialNote: '輕食／熱食供應至 16:30；晚間免費酒精在 Lounge。',
            targets: [{id: 'search-deck-deck19-0', label: '查看日光甲板'}]
        },
        'search-schedule-day3-3-3': {
            shortTitle: '回房收行李、核對返程', location: '客艙', status: 'reserved',
            essentialNote: '護照、房卡與隔日用品留手提；核對各房行李期限、手環退款與七人 SGAC。',
            targets: [{id: 'search-playbook-last-night-0', label: '晨間包'}, {id: 'search-playbook-last-night-1', label: '下船安排'}]
        },
        'search-schedule-day3-4-1': {
            shortTitle: '補看花園或劇院表演', location: '依當日節目場地', status: 'pending', timeLabel: '有空且有場次才補',
            essentialNote: '優先當天主秀；演出不等於角色合照。',
            targets: [{id: 'search-show-garden-shows-0', label: 'Avengers'}, {id: 'search-show-garden-shows-1', label: 'Duffy'}]
        },
        'search-schedule-day3-4-0': {
            shortTitle: '晚餐 · 好萊塢聚光燈', location: 'Hollywood Spotlight Club · Deck 8 船尾', status: 'confirmed',
            essentialNote: '可能調整 15 分鐘；提前 5 分鐘到場。走船尾電梯，不穿越管制兒童區。',
            targets: [{id: 'search-deck-deck8-3', label: '查看餐廳'}], menu: [{id: 'nav', label: '餐廳菜單（配對共用）'}]
        },
        'search-schedule-day3-4-2': {
            shortTitle: '煙火候選／探索礁區散步', location: '煙火甲板依公告／礁區 Deck 10', status: 'pending', timeLabel: '依煙火公告',
            essentialNote: '不固定最後一晚；無場次就散步，不影響行李外放。',
            targets: [{id: 'search-show-open-air-night-1', label: '煙火資訊'}, {id: 'search-deck-deck10-1', label: '探索礁區'}]
        },
        'search-schedule-day4-0-0': {
            shortTitle: '早餐、最後核對手提物品', location: '依當日早餐餐廳', status: 'reserved',
            essentialNote: '核對離房／下船通知與七人 1/28 SGAC；護照、房卡留手提。',
            targets: [{id: 'search-playbook-last-night-1', label: '撤船日早餐'}], menu: [{id: 'main-breakfast', label: '主餐廳早餐參考'}]
        },
        'search-schedule-day4-0-1': {
            shortTitle: '下船、領行李、前往機場', location: '碼頭 → 樟宜機場', status: 'pending', timeLabel: '依放行與接送確認',
            essentialNote: '預留找行李時間，核對七人與行李的接送容量；通道與放行依通知。',
            targets: [{id: 'search-playbook-last-night-1', label: '下船流程'}]
        }
    },
    // Restaurant IDs are existing menu filters, including shared rotational menus.
    menusByCard: {
        'search-deck-deck5-1': [{id: 'animator', label: '晚餐菜單（配對共用）'}],
        'search-deck-deck9-animators-table': [{id: 'animator', label: '晚餐菜單（配對共用）'}],
        'search-deck-deck6-0': [{id: 'pixar', label: '晚餐菜單（配對共用）'}],
        'search-deck-deck8-3': [{id: 'nav', label: '餐廳菜單（配對共用）'}],
        'search-deck-deck6-navigators-club': [{id: 'nav', label: '餐廳菜單（配對共用）'}],
        'search-deck-deck5-2': [{id: 'bev-tiana', label: 'Tiana 飲品'}],
        'search-deck-deck6-3': [{id: 'bev-spellbound', label: 'Spellbound 飲品'}, {id: 'bev-buccaneer', label: 'Buccaneer 飲品'}],
        'search-deck-deck7-3': [{id: 'bev-alleycat', label: 'Alley Cat 飲品'}],
        'search-deck-deck10-2': [{id: 'gramma-tala', label: '塔拉奶奶廚房菜單'}],
        'search-deck-deck10-3': [{id: 'mowgli', label: '毛克利餐館菜單'}],
        'search-deck-deck10-4': [{id: 'stitch-grill', label: '史迪奇快餐菜單'}],
        'search-deck-deck10-cosmic-kebabs': [{id: 'cosmic-kebabs', label: '宇宙烤肉菜單'}],
        'search-deck-deck10-5': [{id: 'bev-wayfinder', label: 'Wayfinder 飲品'}],
        'search-deck-deck11-1': [{id: 'bev-garden', label: 'Garden Bar 飲品'}, {id: 'bev-taverna', label: 'Taverna 飲品'}],
        'search-deck-deck11-2': [{id: 'palo-brunch', label: 'Palo 早午餐'}, {id: 'palo-dinner', label: 'Palo 晚餐'}],
        'search-deck-deck17-0': [{id: 'concierge-food', label: '酒廊餐點'}, {id: 'bev-concierge', label: '酒廊飲品'}],
        'search-deck-deck17-2': [{id: 'pixar', label: 'Pixar 晚餐（配對共用）'}, {id: 'pizza-planet', label: 'Pizza Planet'}, {id: 'wheezy-soft-serve', label: 'Wheezy 霜淇淋'}, {id: 'bev-wheezy', label: 'Wheezy 付費飲品'}],
        'search-deck-deck18-1': [{id: 'bev-infinity', label: '池畔飲品'}],
        'search-deck-deck19-0': [{id: 'concierge-sundeck-food', label: '日光甲板餐點'}]
    }
};
