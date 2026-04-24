(function () {
    const registry = Array.isArray(window.SEARCH_ENTITY_REGISTRY?.entities)
        ? window.SEARCH_ENTITY_REGISTRY.entities
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
            ].map(compactSearchText).filter(Boolean));

            return canonical && terms.length
                ? {
                    canonical,
                    entityId: entry.entityId,
                    entityType: entry.entityType,
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
                    ].map(compactSearchText).filter(Boolean))
                };
            }).filter(Boolean)
        );
    }

    const categoryFamilies = uniqueItems(
        registry.flatMap((entry) => entry.categoryFamilies || []).map(compactSearchText).filter(Boolean)
    ).map((label) => ({
        id: label,
        label,
        terms: [label],
        keywords: [label]
    }));

    window.SEARCH_KEYWORD_TAXONOMY = {
        version: '2026-04-24-keyword-search-v3',
        aliases: buildRegistryAliases(),
        genericClasses: [
            { canonical: '設施', terms: ['設施', '地方', '項目', '體驗'], expandsTo: ['場館', '服務', '表演'] },
            { canonical: '服務', terms: ['服務', '幫忙', '協助'], expandsTo: ['服務', '酒廊'] },
            { canonical: '表演', terms: ['表演', '主秀', '節目', 'show', 'shows'], expandsTo: ['表演', '場館'] },
            { canonical: '餐飲', terms: ['餐飲', '餐廳', '吃', '用餐', 'food'], expandsTo: ['餐廳', '快餐', '酒廊'] },
            { canonical: '購物', terms: ['購物', '商店', 'shop', 'shopping'], expandsTo: ['商店'] },
            { canonical: '拍照', terms: ['拍照', '攝影', '照片', '合照', 'photo', 'photos', 'photography', 'shutters', 'pics', 'magic shots', 'photo package', '照片下載'], expandsTo: ['攝影', '服務', '商店'] },
            { canonical: '登船日', terms: ['登船日', '上船', '第一天', 'day 1', 'embarkation'], expandsTo: ['服務', '兒童俱樂部', '泳池'] },
            { canonical: '下船日', terms: ['下船', '離船', '撤船', '最後一天', 'self assist', 'express walk off'], expandsTo: ['服務', '餐廳'] }
        ],
        categoryFamilies,
        clusterRelations: [],
        relatedEdges: buildRegistryEdges(),
        capabilityProfiles: [],
        supportedSourceTypes: ['schedule', 'deck', 'show', 'playbook', 'static']
    };
})();
