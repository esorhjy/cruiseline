window.AI_QUERY_TAXONOMY = {
    version: '2026-04-12-v1',
    aliases: [
        {
            canonical: '禮賓',
            terms: ['禮賓', 'concierge', 'concierge service', 'concierge services', 'concierge lounge', 'lounge', '酒廊', '管家']
        },
        {
            canonical: '劇院',
            terms: ['劇院', 'theatre', 'theater', 'show', 'shows', '主秀', '晚秀', 'walt disney theatre', '迪士尼劇院']
        },
        {
            canonical: 'Room Service',
            terms: ['room service', '客房服務', '房務', '送餐', '宵夜']
        },
        {
            canonical: 'Open House',
            terms: ['open house', 'openhouse', '開放參觀']
        },
        {
            canonical: 'Oceaneer Club',
            terms: ['oceaneer', 'oceaneer club', 'kids club', '海洋俱樂部', '兒童俱樂部']
        },
        {
            canonical: '餐廳',
            terms: ['餐廳', 'restaurant', 'restaurants', 'dining', '用餐']
        },
        {
            canonical: '商店',
            terms: ['商店', 'shop', 'shops', 'shopping', '購物']
        },
        {
            canonical: '遊戲',
            terms: ['遊戲', 'game', 'games', 'arcade', '娛樂']
        },
        {
            canonical: '泳池',
            terms: ['泳池', 'pool', 'pools', 'slide', '滑水道', '水區']
        },
        {
            canonical: 'Baymax',
            terms: ['baymax', '杯麵']
        }
    ],
    genericClasses: [
        {
            canonical: '設施',
            terms: ['設施', '內容', '項目', '地方', '體驗'],
            expandsTo: ['場館', '服務', '表演']
        },
        {
            canonical: '餐飲',
            terms: ['吃', '餐點', '餐廳', '補給', '飲料'],
            expandsTo: ['正式餐廳', '快餐', 'Lounge 補給', '劇院前小食']
        },
        {
            canonical: '遊玩',
            terms: ['玩', '遊戲', '活動'],
            expandsTo: ['兒童俱樂部', '互動活動', '水區', '秀場體驗']
        },
        {
            canonical: '服務',
            terms: ['服務', '支援', '協助'],
            expandsTo: ['禮賓服務', 'Lounge', 'Room Service', '下船支援']
        },
        {
            canonical: '表演',
            terms: ['表演', '秀', 'shows', 'show', '劇院'],
            expandsTo: ['劇院主秀', '劇院場館', '進場攻略']
        }
    ],
    categoryFamilies: [
        {
            id: 'venue',
            label: '場館',
            terms: ['場館', '設施', '地方', '甲板', '在哪裡', '位置'],
            keywords: ['場館', '設施', '甲板', '位置', 'deck', '在哪裡', '區域']
        },
        {
            id: 'service',
            label: '服務',
            terms: ['服務', '協助', '支援', '禮賓', '管家'],
            keywords: ['服務', '協助', '支援', '禮賓', '管家', '預約', 'support']
        },
        {
            id: 'show',
            label: '表演',
            terms: ['表演', '秀', '劇院', '主秀', 'show', 'shows'],
            keywords: ['表演', '秀', '劇院', '主秀', 'theatre', 'theater', 'show', 'shows']
        },
        {
            id: 'restaurant',
            label: '餐廳',
            terms: ['餐廳', 'restaurant', 'restaurants', 'dining'],
            keywords: ['餐廳', 'restaurant', 'dining', '晚餐', '早餐', '午餐']
        },
        {
            id: 'quick-service',
            label: '快餐',
            terms: ['快餐', '速食', '補給', '小食'],
            keywords: ['快餐', '補給', '點心', 'pizza', '披薩', 'snack']
        },
        {
            id: 'shop',
            label: '商店',
            terms: ['商店', 'shop', 'shopping', '購物'],
            keywords: ['商店', 'shop', 'shopping', '購物']
        },
        {
            id: 'game',
            label: '遊戲',
            terms: ['遊戲', 'game', 'games', 'arcade'],
            keywords: ['遊戲', 'arcade', 'game', '娛樂', '互動']
        },
        {
            id: 'pool',
            label: '泳池',
            terms: ['泳池', 'pool', 'slide', '滑水道', '水區'],
            keywords: ['泳池', 'pool', 'slide', '滑水道', '水區', '玩水']
        },
        {
            id: 'kids-club',
            label: '兒童俱樂部',
            terms: ['kids club', 'oceaneer', '兒童俱樂部', '海洋俱樂部'],
            keywords: ['kids club', 'oceaneer', 'open house', '兒童', '親子']
        },
        {
            id: 'lounge',
            label: '酒廊',
            terms: ['lounge', '酒廊', 'bar', '禮賓酒廊'],
            keywords: ['lounge', '酒廊', 'bar', '下午茶', '補給', '酒水']
        },
        {
            id: 'spa-fitness',
            label: 'Spa / 健身',
            terms: ['spa', 'fitness', '健身', '水療'],
            keywords: ['spa', 'fitness', '健身', '水療']
        }
    ],
    clusterRelations: [
        {
            key: 'concierge-service',
            label: '禮賓服務群',
            triggers: ['禮賓', 'concierge', 'lounge', '酒廊'],
            relatedEntities: ['禮賓', 'Concierge Lounge'],
            relatedCategories: ['服務', '酒廊', '表演'],
            relatedTerms: ['優先入場', 'priority seating', 'Royal Meet & Greet', '管家協助', '下午茶', '補給', '下船優先', 'sundeck', 'fitness', 'spa']
        },
        {
            key: 'theatre-experience',
            label: '劇院體驗群',
            triggers: ['劇院', 'theatre', 'theater', 'show', 'shows', '主秀', 'walt disney theatre'],
            relatedEntities: ['劇院', 'Walt Disney Theatre'],
            relatedCategories: ['表演', '場館', '服務'],
            relatedTerms: ['Remember', 'Disney Seas the Adventure', '優先入場', '進場', '座位', '視野', '晚秀', '演出時間', '爆米花']
        },
        {
            key: 'room-service',
            label: 'Room Service 群',
            triggers: ['room service', '客房服務', '房務'],
            relatedEntities: ['Room Service'],
            relatedCategories: ['服務', '餐廳'],
            relatedTerms: ['宵夜', '早餐', '送餐', '點餐', '菜單', '夜間']
        },
        {
            key: 'kids-club',
            label: '兒童俱樂部群',
            triggers: ['open house', 'oceaneer', 'kids club', '兒童俱樂部', '海洋俱樂部'],
            relatedEntities: ['Open House', 'Oceaneer Club'],
            relatedCategories: ['兒童俱樂部', '遊戲', '場館'],
            relatedTerms: ['親子', '孩子', '活動', '報到', '流程', '開放參觀']
        }
    ],
    supportedSourceTypes: ['schedule', 'deck', 'show', 'playbook', 'static']
};
