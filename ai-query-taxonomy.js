(function () {
    const registry = Array.isArray(window.AI_ENTITY_REGISTRY?.entities)
        ? window.AI_ENTITY_REGISTRY.entities
        : [];

    const uniqueItems = (items) => [...new Set((Array.isArray(items) ? items : []).filter(Boolean))];
    const compactSearchText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    function buildRegistryAliases() {
        return registry.map((entry) => {
            const canonical = compactSearchText(entry.displayNameZh || entry.officialNameZh || entry.officialNameEn);
            const terms = uniqueItems([
                entry.displayNameZh,
                entry.officialNameZh,
                entry.officialNameEn,
                ...(entry.aliases || []),
                ...(entry.deckHints || []),
                entry.area
            ].map(compactSearchText));

            return canonical && terms.length
                ? {
                    canonical,
                    entityId: entry.entityId,
                    entityType: entry.entityType,
                    officialNameEn: compactSearchText(entry.officialNameEn),
                    displayNameZh: compactSearchText(entry.displayNameZh),
                    terms
                }
                : null;
        }).filter(Boolean);
    }

    function buildRegistryEdges() {
        const entityMap = new Map(registry.map((entry) => [entry.entityId, entry]));
        return registry.flatMap((entry) =>
            (entry.relatedEntityIds || []).map((targetId) => {
                const target = entityMap.get(targetId);
                if (!target) return null;
                return {
                    source: compactSearchText(entry.displayNameZh || entry.officialNameEn),
                    target: compactSearchText(target.displayNameZh || target.officialNameEn),
                    relation: 'registry-related',
                    terms: uniqueItems([
                        ...(entry.categoryFamilies || []),
                        ...(target.categoryFamilies || []),
                        entry.area,
                        target.area
                    ].map(compactSearchText))
                };
            }).filter(Boolean)
        );
    }

    window.AI_QUERY_TAXONOMY = {
        version: '2026-04-13-v3',
        aliases: [
            ...buildRegistryAliases(),
            {
                canonical: '禮賓',
                terms: ['禮賓', 'concierge', 'concierge service', 'concierge services', 'concierge lounge', 'lounge', '酒廊', '禮賓酒廊', '管家']
            },
            {
                canonical: '劇院',
                terms: ['劇院', 'theatre', 'theater', 'show', 'shows', '表演', '主秀', 'walt disney theatre', 'walt disney theater', '華特迪士尼劇院']
            },
            {
                canonical: 'Room Service',
                terms: ['room service', '客房服務', '房務', '送餐', '宵夜', '早餐送餐']
            },
            {
                canonical: 'Open House',
                terms: ['open house', 'openhouse', '開放參觀', '兒童俱樂部開放參觀']
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
                terms: ['遊戲', 'game', 'games', 'arcade', '電玩']
            },
            {
                canonical: '泳池',
                terms: ['泳池', 'pool', 'pools', 'slide', '水區', '滑水道']
            }
        ],
        genericClasses: [
            {
                canonical: '設施',
                terms: ['設施', '地方', '項目', '體驗', '內容'],
                expandsTo: ['場館', '服務', '表演']
            },
            {
                canonical: '餐飲',
                terms: ['吃', '餐點', '餐廳', '補給', '飲料', '用餐'],
                expandsTo: ['餐廳', '快餐', '酒廊']
            },
            {
                canonical: '遊戲活動',
                terms: ['玩', '遊戲', '活動', '娛樂'],
                expandsTo: ['遊戲', '泳池', '兒童俱樂部', '表演']
            },
            {
                canonical: '服務',
                terms: ['服務', '流程', '注意事項', '規則', '限制'],
                expandsTo: ['服務', '酒廊', '時間脈絡']
            },
            {
                canonical: '表演',
                terms: ['表演', '劇院', '秀', '主秀', 'shows'],
                expandsTo: ['表演', '場館', '服務', '時間脈絡']
            },
            {
                canonical: '購物',
                terms: ['商店', '購物', '紀念品'],
                expandsTo: ['商店', '場館']
            }
        ],
        categoryFamilies: [
            { id: 'venue', label: '場館', terms: ['場館', '設施', '地點', '甲板', '樓層', '區域'], keywords: ['場館', '設施', '地點', 'deck', '樓層', '區域', '在哪裡'] },
            { id: 'service', label: '服務', terms: ['服務', '流程', '規則', '限制', '支援'], keywords: ['服務', '流程', '規則', '限制', '支援', 'support'] },
            { id: 'show', label: '表演', terms: ['表演', '秀', '主秀', '劇院', 'shows'], keywords: ['表演', '秀', '劇院', 'theatre', 'theater', 'show', 'shows'] },
            { id: 'restaurant', label: '餐廳', terms: ['餐廳', '正式餐廳', 'dining', 'restaurant'], keywords: ['餐廳', '正式餐廳', 'dining', 'restaurant', '晚餐', '用餐'] },
            { id: 'quick-service', label: '快餐', terms: ['快餐', '點心', '補給', '披薩', 'snack'], keywords: ['快餐', '點心', '補給', '披薩', 'pizza', 'snack'] },
            { id: 'shop', label: '商店', terms: ['商店', '購物', 'shop', 'shopping'], keywords: ['商店', '購物', 'shop', 'shopping', '紀念品'] },
            { id: 'game', label: '遊戲', terms: ['遊戲', '電玩', 'arcade', 'game'], keywords: ['遊戲', '電玩', 'arcade', 'game'] },
            { id: 'pool', label: '泳池', terms: ['泳池', '滑水道', '水區', 'pool', 'slide'], keywords: ['泳池', '滑水道', '水區', 'pool', 'slide'] },
            { id: 'kids-club', label: '兒童俱樂部', terms: ['兒童俱樂部', 'kids club', 'oceaneer', 'open house'], keywords: ['兒童俱樂部', 'kids club', 'oceaneer', 'open house', '開放參觀'] },
            { id: 'lounge', label: '酒廊', terms: ['酒廊', 'lounge', 'bar', '禮賓酒廊'], keywords: ['酒廊', 'lounge', 'bar', '禮賓酒廊', '下午茶', '補給'] },
            { id: 'spa-fitness', label: 'Spa / 健身', terms: ['spa', 'fitness', '健身', '芳療'], keywords: ['spa', 'fitness', '健身', '芳療'] },
            { id: 'timing-context', label: '時間脈絡', terms: ['時間', '時段', '幾點', '早上', '下午', '晚上'], keywords: ['時間', '時段', '幾點', '早上', '下午', '晚上', 'timing'] }
        ],
        clusterRelations: [
            {
                key: 'concierge-service',
                label: '禮賓服務群',
                triggers: ['禮賓', 'concierge', 'lounge', '酒廊'],
                relatedEntities: ['Concierge Lounge 禮賓酒廊', 'Concierge Sundeck & Pool 禮賓陽光甲板', 'Royal Meet & Greet'],
                relatedCategories: ['服務', '酒廊', '泳池'],
                relatedTerms: ['優先入場', 'priority seating', '禮賓協助', '下午茶', '補給', 'sundeck', 'fitness']
            },
            {
                key: 'theatre-experience',
                label: '劇院體驗群',
                triggers: ['劇院', 'theatre', 'theater', 'show', 'shows', '表演', 'walt disney theatre'],
                relatedEntities: ['華特迪士尼劇院', '《Remember》', '《Disney Seas the Adventure》'],
                relatedCategories: ['表演', '場館', '服務', '時間脈絡'],
                relatedTerms: ['優先入場', '排隊', '座位', '時機提醒', '晚秀']
            },
            {
                key: 'dining-coverage',
                label: '餐飲盤點群',
                triggers: ['餐廳', '餐飲', '補給', '快餐', 'pizza'],
                relatedEntities: ['動畫師的調色盤餐廳', 'Enchanted Summer 仲夏奇緣餐廳', 'Pixar Market Restaurant'],
                relatedCategories: ['餐廳', '快餐', '酒廊'],
                relatedTerms: ['正式餐廳', '快餐', '補給', '披薩', '點心', '飲料']
            },
            {
                key: 'facility-breadth',
                label: '設施廣擴張群',
                triggers: ['設施', '地方', '項目', '體驗'],
                relatedEntities: ['華特迪士尼劇院', 'Concierge Lounge 禮賓酒廊', 'Wayfinder Bay 海景灣'],
                relatedCategories: ['場館', '服務', '表演', '餐廳', '商店', '遊戲', '泳池'],
                relatedTerms: ['甲板', '活動', '商店', '泳池', '餐廳', '劇院', '服務據點']
            }
        ],
        relatedEdges: [
            {
                source: '禮賓',
                target: '劇院',
                relation: 'concierge-to-show-support',
                terms: ['優先入場', 'priority seating', '看秀', '主秀']
            },
            {
                source: '設施',
                target: '場館',
                relation: 'generic-to-family',
                terms: ['甲板', '區域', '樓層', '在哪裡']
            },
            {
                source: '設施',
                target: '服務',
                relation: 'generic-to-family',
                terms: ['流程', '使用方式', '規則', '限制']
            },
            ...buildRegistryEdges()
        ],
        capabilityProfiles: [
            {
                id: 'swim',
                label: '游泳 / 玩水',
                terms: ['游泳', '玩水', '泳池', '水區', '滑水', '滑水道', 'splash', 'pool', 'pools', 'swim', 'swimming', 'waterslide', 'water slide', 'sundeck pool'],
                categoryFamilies: ['泳池', '場館'],
                signalCategoryFamilies: ['泳池'],
                preferredSourceTypes: ['deck', 'playbook', 'schedule'],
                disallowedCategories: ['表演', '商店']
            },
            {
                id: 'eat',
                label: '吃 / 餐點',
                terms: ['吃', '餐點', '餐廳', '補給', '吃什麼', '用餐', 'dining', 'restaurant', 'restaurants', 'food'],
                categoryFamilies: ['餐廳', '快餐', '酒廊'],
                signalCategoryFamilies: ['餐廳', '快餐', '酒廊'],
                preferredSourceTypes: ['deck', 'playbook', 'schedule'],
                disallowedCategories: ['表演']
            },
            {
                id: 'drink',
                label: '飲品 / 酒水',
                terms: ['喝', '飲料', '酒水', '酒吧', '雞尾酒', 'wine', 'beer', 'cocktail', 'drink', 'drinks', 'bar'],
                categoryFamilies: ['酒廊', '快餐'],
                signalCategoryFamilies: ['酒廊'],
                preferredSourceTypes: ['deck', 'playbook'],
                disallowedCategories: ['表演']
            },
            {
                id: 'watch-show',
                label: '看秀 / 看表演',
                terms: ['看秀', '看表演', '表演', '主秀', '劇院', 'show', 'shows', 'theatre', 'theater', 'cinema', 'movie'],
                categoryFamilies: ['表演', '場館', '時間脈絡'],
                signalCategoryFamilies: ['表演'],
                preferredSourceTypes: ['show', 'playbook', 'deck', 'schedule'],
                disallowedCategories: ['商店']
            },
            {
                id: 'kids-play',
                label: '親子 / 遊戲',
                terms: ['玩', '遊戲', '活動', '親子', '孩子', '小孩', '兒童', 'kids', 'kid', 'arcade', 'open house', 'oceaneer'],
                categoryFamilies: ['遊戲', '兒童俱樂部', '場館'],
                signalCategoryFamilies: ['遊戲', '兒童俱樂部'],
                preferredSourceTypes: ['deck', 'playbook', 'schedule'],
                disallowedCategories: ['商店']
            },
            {
                id: 'rest',
                label: '休息 / 放鬆',
                terms: ['休息', '放鬆', '休憩', 'chill', 'relax', 'lounge', 'spa', 'quiet'],
                categoryFamilies: ['酒廊', '場館', 'Spa / 健身'],
                signalCategoryFamilies: ['酒廊', 'Spa / 健身'],
                preferredSourceTypes: ['deck', 'playbook'],
                disallowedCategories: []
            },
            {
                id: 'shop',
                label: '購物',
                terms: ['買東西', '購物', '商店', 'shop', 'shops', 'shopping'],
                categoryFamilies: ['商店', '場館'],
                signalCategoryFamilies: ['商店'],
                preferredSourceTypes: ['deck', 'schedule'],
                disallowedCategories: ['表演']
            },
            {
                id: 'spa',
                label: 'Spa / 健身',
                terms: ['spa', '健身', 'fitness', '按摩', '美容'],
                categoryFamilies: ['Spa / 健身', '場館', '服務'],
                signalCategoryFamilies: ['Spa / 健身'],
                preferredSourceTypes: ['deck', 'playbook'],
                disallowedCategories: ['表演']
            }
        ],
        supportedSourceTypes: ['deck', 'show', 'playbook', 'schedule', 'static']
    };
})();
