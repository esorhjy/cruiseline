document.addEventListener('DOMContentLoaded', function () {

    let setScheduleTab = () => {};
    let setDeckGuideTab = () => {};
    let setPlaybookMission = () => {};

    const SEARCH_MIN_LENGTH = 2;
    const SEARCH_GROUP_ICONS = {
        '行程': 'fa-solid fa-calendar-days',
        '甲板與表演': 'fa-solid fa-compass',
        '攻略本': 'fa-solid fa-book-open-reader',
        '中英對照': 'fa-solid fa-language',
        '其他資訊': 'fa-solid fa-folder-open'
    };
    const LOOKUP_CATEGORY_LABELS = {
        all: '全部',
        facility: '設施',
        activity: '活動',
        dining: '餐點/餐廳',
        photo: '拍照',
        kids: '兒童/青少年',
        show: '表演',
        service: '服務',
        shop: '購物',
        wellness: 'Spa / 健身'
    };
    const LOOKUP_CATEGORY_EN_LABELS = {
        all: 'All',
        facility: 'Facilities',
        activity: 'Activities',
        dining: 'Dining',
        photo: 'Photos',
        kids: 'Kids / Teens',
        show: 'Shows',
        service: 'Services',
        shop: 'Shopping',
        wellness: 'Spa / Fitness'
    };
    const MENU_RESTAURANT_GROUP_LABELS = {
        rotational: '主餐廳',
        sulley: '怪獸餐廳',
        palo: 'Palo',
        beverage: '酒吧飲品'
    };
    const MENU_COURSE_FILTERS = [
        { id: 'all', label: '全部', match: () => true },
        { id: 'appetizer', label: '前菜', match: record => record.courseGroup === 'appetizer' },
        { id: 'entree', label: '主餐', match: record => record.courseGroup === 'entree' },
        { id: 'drinks', label: '飲料', match: record => record.courseGroup === 'drinks' },
        { id: 'dessert', label: '甜點', match: record => record.courseGroup === 'dessert' },
        { id: 'kids-side', label: '兒童/配菜', match: record => record.courseGroup === 'kids-side' }
    ];
    const LOOKUP_MODE_PLACEHOLDER = '輸入中文或英文，例如：客務中心、海南雞飯、Magic Shot、Oceaneer';
    const GUIDE_MODE_PLACEHOLDER = '輸入關鍵字，例如：禮賓、Baymax、Room Service';
    const SEARCH_SYNONYM_GROUPS = [
        ['禮賓', 'concierge', 'lounge', '酒廊', '管家'],
        ['房務', 'room service', '客房服務', '客房餐點', '房務餐點'],
        ['海洋俱樂部', 'oceaneer', 'kids club', '兒童俱樂部'],
        ['杯麵', 'baymax'],
        ['爆米花', 'popcorn'],
        ['登船', '上船', '登船日', '第一天', 'day 1', 'check in', 'check-in', 'qr', 'sgac'],
        ['下船', '撤船', '離船', '最後一天', 'self assist', 'express walk off'],
        ['煙火', 'lion king', '獅子王'],
        ['披薩', 'pizza', 'pizza planet'],
        ['拍照', '照片', 'photo', 'photos', 'shutters', 'photo package', '無限拍', '照片下載', 'photo spot', 'magic shots', 'pics photo observatory', 'deck 9 photos', '光劍', '天燈', '冰雪奇緣拍照', 'mjolnir'],
        ['花園舞台', 'imagination garden', 'disney imagination garden', '幻想花園'],
        ['手環', 'rfid', '取孩密語', '兒童手環'],
        ['avengers', 'avengers assemble', '復仇者'],
        ['劇院', 'theatre', 'theater', 'remember'],
        ['行前清單', 'checklist', '清單'],
        ['房卡', 'key to the world'],
        ['滑水道', 'woodys wide slide', "woody's wide slide"],
        ['甲板', 'deck'],
        ['酒吧', 'bar']
    ];
    const SEARCH_CAPABILITY_PROFILES = [
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
    ];
    const searchSynonymMap = buildSynonymMap(SEARCH_SYNONYM_GROUPS);
    const searchDisplayMap = buildDisplayMap(SEARCH_SYNONYM_GROUPS);
    const APP_BUILD_ID = document.documentElement?.dataset?.appBuild || window.__DCL_GUIDE_BUILD__ || 'local-dev';
    window.__DCL_GUIDE_BUILD__ = APP_BUILD_ID;
    const searchEntityRegistry = normalizeAiEntityRegistry(window.SEARCH_ENTITY_REGISTRY || {});
    const searchKeywordTaxonomy = normalizeAiQueryTaxonomy({
        ...(window.SEARCH_KEYWORD_TAXONOMY || {}),
        capabilityProfiles: [
            ...(((window.SEARCH_KEYWORD_TAXONOMY || {}).capabilityProfiles) || []),
            ...SEARCH_CAPABILITY_PROFILES
        ]
    });
    const aiEntityRegistry = searchEntityRegistry;
    const aiQueryTaxonomy = searchKeywordTaxonomy;
    const SEARCH_RESULT_HIGHLIGHT_LIMIT = 4;
    const SEARCH_MAX_RESULTS = 10;
    const SEARCH_PRIMARY_RESULT_LIMIT = 6;
    const SEARCH_PLAYBOOK_RESULT_LIMIT = 3;
    const SEARCH_SCHEDULE_RESULT_LIMIT = 1;
    const SEARCH_SUPPORT_RESULT_LIMIT = 1;
    const SEARCH_SCHEDULE_INTENT_TERMS = [
        'day',
        'days',
        '行程',
        '排程',
        '安排',
        '時段',
        '時間',
        '什麼時候',
        '何時',
        '上午',
        '下午',
        '晚間',
        '晚上',
        '早上',
        '早／中午',
        '中午',
        '登船',
        '上船',
        '登船日',
        '第一天',
        '下船',
        '撤船',
        '離船',
        '最後一天',
        'schedule',
        'itinerary',
        'when'
    ];
    const SEARCH_BROAD_QUERY_TERMS = [
        '有哪些',
        '有什麼',
        '哪些',
        '設施',
        '服務',
        '表演',
        '活動',
        '餐廳',
        '商店',
        '劇院',
        '泳池',
        '游泳',
        '玩水',
        '可以玩',
        '能玩',
        'facility',
        'facilities',
        'service',
        'services',
        'show',
        'shows',
        'restaurant',
        'restaurants',
        'shop',
        'shops'
    ];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const searchState = {
        documents: [],
        lookupRecords: [],
        resultsById: new Map(),
        lookupResultsById: new Map(),
        debounceTimer: null,
        mode: 'guide',
        lookupCategory: 'all',
        lookupDiningFilter: 'all',
        lookupRestaurantFilter: 'all',
        shortcutOpen: false,
        activeCrewRecordId: '',
        isComposing: false,
        pendingSubmit: false,
        lastQuery: '',
        lastResults: [],
        lastQueryData: null
    };
    const menuDataLoadState = {
        status: Array.isArray(window.MENU_LOOKUP_DATA?.records) ? 'ready' : 'idle',
        promise: null,
        error: null
    };
    const MENU_LOOKUP_DATA_SCRIPT_PATH = 'menu-lookup-data.js';
    const runtimeState = { scrollTicking: false };
    const notebookState = {
        view: 'journey', exploreTab: 'facilities', purpose: 'all', deck: 'all',
        checklistFilter: 'all', scroll: {}, day: 'day1', ready: false
    };
    let openNotebookSearch = () => {};
    let savedChecklistStatus = {};
    let notebookReturnFocus = null;
    let crewReturnFocus = null;

    function buildSynonymMap(groups) {
        const map = new Map();
        groups.forEach(group => {
            const normalizedGroup = uniqueItems(group.map(item => normalizeSearchText(item)).filter(Boolean));
            normalizedGroup.forEach(term => {
                map.set(term, normalizedGroup.filter(candidate => candidate !== term));
            });
        });
        return map;
    }

    function buildDisplayMap(groups) {
        const map = new Map();
        groups.forEach(group => {
            group.forEach(item => {
                const normalized = normalizeSearchText(item);
                if (normalized && !map.has(normalized)) {
                    map.set(normalized, item);
                }
            });
        });
        return map;
    }

    function isMenuLookupDataReady() {
        return Array.isArray(window.MENU_LOOKUP_DATA?.records) && window.MENU_LOOKUP_DATA.records.length > 0;
    }

    function syncMenuDataLoadStateFromWindow() {
        if (isMenuLookupDataReady()) {
            menuDataLoadState.status = 'ready';
            menuDataLoadState.error = null;
        }
        return menuDataLoadState.status;
    }

    function getMenuLookupDataScriptSrc() {
        const buildId = window.__DCL_GUIDE_BUILD__ || document.documentElement?.dataset?.appBuild || 'local-dev';
        return `${MENU_LOOKUP_DATA_SCRIPT_PATH}?v=${encodeURIComponent(buildId)}`;
    }

    function loadMenuLookupData(options = {}) {
        const retry = Boolean(options.retry);
        syncMenuDataLoadStateFromWindow();
        if (menuDataLoadState.status === 'ready') {
            return Promise.resolve(window.MENU_LOOKUP_DATA);
        }
        if (menuDataLoadState.status === 'loading' && menuDataLoadState.promise) {
            return menuDataLoadState.promise;
        }
        if (menuDataLoadState.status === 'error' && !retry) {
            return Promise.reject(menuDataLoadState.error || new Error('Menu lookup data failed to load.'));
        }
        if (!document.createElement || !document.head?.appendChild) {
            const error = new Error('This browser cannot load the menu data script dynamically.');
            menuDataLoadState.status = 'error';
            menuDataLoadState.error = error;
            return Promise.reject(error);
        }

        const previousScript = document.querySelector?.('[data-menu-lookup-data-script]');
        if (previousScript && retry) {
            previousScript.remove();
        }

        menuDataLoadState.status = 'loading';
        menuDataLoadState.error = null;
        menuDataLoadState.promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = getMenuLookupDataScriptSrc();
            script.async = true;
            script.dataset.menuLookupDataScript = 'true';
            script.onload = () => {
                if (!isMenuLookupDataReady()) {
                    const error = new Error('Menu lookup data loaded, but no records were found.');
                    menuDataLoadState.status = 'error';
                    menuDataLoadState.error = error;
                    menuDataLoadState.promise = null;
                    reject(error);
                    return;
                }
                menuDataLoadState.status = 'ready';
                menuDataLoadState.error = null;
                menuDataLoadState.promise = null;
                prepareLookupRecords();
                syncSearchModeUi();
                resolve(window.MENU_LOOKUP_DATA);
            };
            script.onerror = () => {
                const error = new Error(`Could not load ${MENU_LOOKUP_DATA_SCRIPT_PATH}.`);
                menuDataLoadState.status = 'error';
                menuDataLoadState.error = error;
                menuDataLoadState.promise = null;
                script.remove();
                reject(error);
            };
            document.head.appendChild(script);
        });

        return menuDataLoadState.promise;
    }

    function ensureMenuLookupDataLoaded(options = {}) {
        return loadMenuLookupData(options).then(data => {
            prepareLookupRecords();
            syncSearchModeUi();
            return data;
        });
    }

    function normalizeSearchText(text) {
        return String(text || '')
            .toLowerCase()
            .normalize('NFKC')
            .replace(/[\u2019']/g, '')
            .replace(/\u3000/g, ' ')
            .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeRegExp(text) {
        return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function uniqueItems(items) {
        return [...new Set(items)];
    }

    function truncateSearchPreview(text, maxLength = 180) {
        const normalized = compactSearchText(text);
        if (!normalized) return '';
        if (normalized.length <= maxLength) return normalized;
        return `${normalized.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
    }

    function highlightSnippet(text, terms = []) {
        const source = String(text || '');
        if (!source) return '';

        const candidates = uniqueItems((Array.isArray(terms) ? terms : [])
            .map(term => String(term || '').trim())
            .filter(Boolean))
            .sort((a, b) => b.length - a.length);

        if (!candidates.length) {
            return escapeHtml(source);
        }

        const pattern = candidates.map(escapeRegExp).join('|');
        if (!pattern) {
            return escapeHtml(source);
        }

        const regex = new RegExp(pattern, 'gi');
        let cursor = 0;
        let html = '';
        let match = regex.exec(source);

        while (match) {
            const [matched] = match;
            const start = match.index;
            if (start > cursor) {
                html += escapeHtml(source.slice(cursor, start));
            }
            html += `<mark>${escapeHtml(matched)}</mark>`;
            cursor = start + matched.length;
            match = regex.exec(source);
        }

        if (cursor < source.length) {
            html += escapeHtml(source.slice(cursor));
        }

        return html;
    }

    function simpleHash(text) {
        let hash = 0;
        const normalized = String(text || '');
        for (let index = 0; index < normalized.length; index += 1) {
            hash = ((hash * 31) + normalized.charCodeAt(index)) >>> 0;
        }
        return hash.toString(36);
    }

    function getSearchSignalLength(text) {
        return normalizeSearchText(text).replace(/\s+/g, '').length;
    }

    function collectMatchingTerms(normalizedQuery, displayMap) {
        if (!normalizedQuery) return [];
        return Array.from(displayMap.keys())
            .filter(term => term.length >= 2 && normalizedQuery.includes(term))
            .sort((a, b) => b.length - a.length);
    }

    function hasQueryHint(normalizedQuery, terms = []) {
        return terms.some(term => {
            const normalizedTerm = normalizeSearchText(term);
            return normalizedTerm && normalizedQuery.includes(normalizedTerm);
        });
    }

    function hasAnyNormalizedTerm(normalizedField = '', terms = []) {
        if (!normalizedField || !Array.isArray(terms) || !terms.length) return false;
        return terms.some(term => {
            const normalizedTerm = normalizeSearchText(term);
            return normalizedTerm && normalizedField.includes(normalizedTerm);
        });
    }

    function countNormalizedTermMatches(normalizedField = '', terms = []) {
        if (!normalizedField || !Array.isArray(terms) || !terms.length) return 0;
        return uniqueItems(terms
            .map(term => normalizeSearchText(term))
            .filter(Boolean))
            .filter(term => normalizedField.includes(term))
            .length;
    }

    function detectSearchScheduleIntent(normalizedQuery = '') {
        return hasQueryHint(normalizedQuery, SEARCH_SCHEDULE_INTENT_TERMS);
    }

    function detectBroadSearchIntent(normalizedQuery = '') {
        return hasQueryHint(normalizedQuery, SEARCH_BROAD_QUERY_TERMS);
    }

    function getScheduleEventId(dayId, periodIndex, eventIndex) {
        return cruiseSchedule.find(day => day.id === dayId)?.periods[periodIndex]?.events[eventIndex]?.id || `search-schedule-${dayId}-${periodIndex}-${eventIndex}`;
    }

    function getDeckFacilityId(deckId, facilityIndex) {
        return deckGuideData.find(deck => deck.id === deckId)?.facilities[facilityIndex]?.id || `search-deck-${deckId}-${facilityIndex}`;
    }

    function getShowItemId(categoryId, showIndex) {
        return showGuideData.find(group => group.id === categoryId)?.shows[showIndex]?.id || `search-show-${categoryId}-${showIndex}`;
    }

    function getPlaybookItemId(missionId, itemIndex) {
        return playbookGuideData.find(group => group.id === missionId)?.items[itemIndex]?.id || `search-playbook-${missionId}-${itemIndex}`;
    }

    function getStaticCardId(sectionId, cardIndex) {
        return `search-static-${sectionId}-${cardIndex}`;
    }

    function getStickyOffset() {
        const stickyNav = document.querySelector('.sticky-nav');
        return stickyNav ? stickyNav.offsetHeight + 18 : 96;
    }

    function scrollToTarget(target) {
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - getStickyOffset();
        window.scrollTo({
            top: Math.max(top, 0),
            behavior: 'smooth'
        });
        pulseSearchTarget(target);
    }

    function pulseSearchTarget(target) {
        if (!target) return;
        target.classList.remove('search-hit');
        void target.offsetWidth;
        target.classList.add('search-hit');
        window.setTimeout(() => target.classList.remove('search-hit'), 2600);
    }

    function waitForTargetAndScroll(targetId) {
        const attemptScroll = (triesLeft = 12) => {
            const target = document.getElementById(targetId);
            if (target) {
                scrollToTarget(target);
                return;
            }
            if (triesLeft > 0) {
                window.setTimeout(() => attemptScroll(triesLeft - 1), 120);
            }
        };

        attemptScroll();
    }

    // 1. 捲動相關 UI
    const progressBar = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    function updateScrollUi() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (progressBar) {
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            progressBar.style.width = `${scrolled}%`;
        }

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('show', window.scrollY > 300);
        }
    }

    function scheduleScrollUiUpdate() {
        if (runtimeState.scrollTicking) return;
        runtimeState.scrollTicking = true;
        window.requestAnimationFrame(() => {
            runtimeState.scrollTicking = false;
            updateScrollUi();
        });
    }

    if (progressBar || backToTopBtn) {
        window.addEventListener('scroll', scheduleScrollUiUpdate, { passive: true });
        updateScrollUi();
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' }));
    }

    // 5. 新加坡天氣
    async function fetchSingaporeWeather() {
        const tempEl = document.getElementById('w-temp');
        const descEl = document.getElementById('w-desc');
        if (!tempEl || !descEl) return;
        if (window.location?.protocol === 'file:') {
            tempEl.innerText = '--°C';
            descEl.innerHTML = "<i class='fa-solid fa-location-dot'></i> 本機模式不載入即時天氣";
            return;
        }

        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=1.2897&longitude=103.8501&current_weather=true');
            if (!response.ok) throw new Error('Weather API error');
            const data = await response.json();
            const temp = Math.round(data.current_weather.temperature);
            const weatherCode = data.current_weather.weathercode;
            tempEl.innerText = `${temp}°C`;
            let desc = "多雲";
            let icon = "<i class='fa-solid fa-cloud' style='color:#546681;'></i>";
            if (weatherCode <= 1) { desc = "晴朗"; icon = "<i class='fa-solid fa-sun' style='color:#F3B500;'></i>"; }
            else if (weatherCode <= 3) { desc = "晴時多雲"; icon = "<i class='fa-solid fa-cloud-sun' style='color:#F3B500;'></i>"; }
            else if (weatherCode <= 67) { desc = "陣雨"; icon = "<i class='fa-solid fa-cloud-rain' style='color:#0A3A70;'></i>"; }
            else if (weatherCode >= 95) { desc = "雷陣雨"; icon = "<i class='fa-solid fa-cloud-bolt' style='color:#E11837;'></i>"; }
            descEl.innerHTML = `${icon} ${desc}`;
        } catch (error) {
            tempEl.innerText = "--°C";
            descEl.innerHTML = "<i class='fa-solid fa-circle-exclamation'></i> 暫時無法取得天氣";
        }
    }


    // 9. 動態渲染行程表資料
    function renderSchedule() {
        if (typeof cruiseSchedule === 'undefined') return;
        cruiseSchedule.forEach(day => {
            const root = document.getElementById(day.id);
            if (!root) return;
            const events = day.periods.flatMap(period => period.events);
            const priorities = events.filter(event => event.planKind === 'fixed').slice(0, 3);
            root.innerHTML = `
                <div class="day-priorities" aria-label="當日優先事項">
                    <span>今日保留</span>
                    ${priorities.map(event => `<a href="#${event.id}">${escapeHtml(event.title.split('：')[0])}</a>`).join('')}
                </div>
                <details class="day-goals"><summary>當日安排重點</summary><ul>${day.goals.map(goal => `<li>${goal}</li>`).join('')}</ul></details>
                <div class="schedule-list">
                    ${day.periods.map((period, pi) => `
                        <h3 class="period-header">${escapeHtml(period.name)}</h3>
                        ${period.events.map((event, ei) => {
                            const id = getScheduleEventId(day.id, pi, ei);
                            const kind = event.planKind || 'flexible';
                            const labels = {fixed: '固定保留', confirm: '依確認安排', flexible: '彈性活動'};
                            const binding = getAiEntityBinding('scheduleEvents', event.bindingKey);
                            const important = event.desc.filter(text => /限 |限[0-9]|至少|不得|不以救生員|成人監督|不等於|不是託管|不能|必到/.test(text));
                            const visible = uniqueItems([event.desc[0], ...important]);
                            return `<article class="schedule-item" id="${id}" data-search-id="${id}">
                                <div class="schedule-time">${/^\d/.test(event.time) ? '<small>建議時段</small>' : ''}${escapeHtml(event.time)}<span class="plan-kind ${kind}">${labels[kind]}</span></div>
                                <div class="schedule-content">
                                    <h4 class="schedule-title">${event.title}</h4>
                                    <ul class="schedule-essential">${visible.map(text => `<li>${text}</li>`).join('')}</ul>
                                    ${renderEntityLinks(binding?.entityRefs)}
                                    ${event.desc.some(text => !visible.includes(text)) ? `<details class="event-detail"><summary>行動細節 <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary><ul>${event.desc.filter(text => !visible.includes(text)).map(text => `<li>${text}</li>`).join('')}</ul></details>` : ''}
                                </div>
                            </article>`;
                        }).join('')}
                    `).join('')}
                </div>`;
        });
    }

    // 執行渲染
    renderSchedule();

    // 10. 行前準備清單渲染與邏輯 (Phase 4)
    function readChecklistStatus() {
        try {
            const data = JSON.parse(localStorage.getItem('dcl_checklist_status') || '{}');
            return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
        } catch {
            const notice = document.getElementById('checklist-storage-status');
            if (notice) notice.textContent = '無法讀取裝置記錄；本次勾選仍可使用。';
            return {};
        }
    }

    function updateChecklistVisibility() {
        const root = document.getElementById('checklist-grid');
        if (!root) return;
        root.querySelectorAll('.checklist-item').forEach(row => {
            row.hidden = notebookState.checklistFilter === 'pending' && Boolean(savedChecklistStatus[row.dataset.id]);
        });
        root.querySelectorAll('.checklist-category').forEach(group => {
            group.hidden = !Array.from(group.querySelectorAll('.checklist-item')).some(row => !row.hidden);
        });
        const items = checklistData.flatMap(group => group.items);
        const done = items.filter(item => savedChecklistStatus[item.id]).length;
        document.getElementById('checklist-progress').textContent = `${done} / ${items.length} 已完成`;
        let empty = root.querySelector('.checklist-empty');
        if (!empty) {
            empty = document.createElement('p');
            empty.className = 'checklist-empty';
            empty.textContent = '待辦都完成了，準備迎接海上假期。';
            root.appendChild(empty);
        }
        empty.hidden = !(notebookState.checklistFilter === 'pending' && done === items.length);
    }

    function renderChecklist() {
        const root = document.getElementById('checklist-grid');
        if (!root || typeof checklistData === 'undefined') return;
        savedChecklistStatus = readChecklistStatus();
        root.innerHTML = checklistData.map(group => `
            <section class="checklist-category"><h3>${group.category}</h3>
                ${group.items.map(item => `<label class="checklist-item" data-id="${escapeHtml(item.id)}">
                    <input type="checkbox" ${savedChecklistStatus[item.id] ? 'checked' : ''}>
                    <span>${item.text}</span>
                </label>`).join('')}
            </section>`).join('');
        root.addEventListener('change', event => {
            const row = event.target.closest('[data-id]');
            if (!row) return;
            savedChecklistStatus = { ...readChecklistStatus(), ...savedChecklistStatus, [row.dataset.id]: event.target.checked };
            try { localStorage.setItem('dcl_checklist_status', JSON.stringify(savedChecklistStatus)); }
            catch { document.getElementById('checklist-storage-status').textContent = '此裝置無法儲存；關閉頁面後勾選可能不保留。'; }
            updateChecklistVisibility();
        });
        document.querySelectorAll('[data-checklist-filter]').forEach(button => {
            button.addEventListener('click', () => {
                notebookState.checklistFilter = button.dataset.checklistFilter;
                document.querySelectorAll('[data-checklist-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
                updateChecklistVisibility();
            });
        });
        updateChecklistVisibility();
    }

    renderChecklist();

    // 11. 甲板與表演設施導覽 (Phase 5)
    function renderDeckGuide() {
        const root = document.getElementById('deck-guide-content');
        const select = document.getElementById('deck-filter');
        if (!root || !select || typeof deckGuideData === 'undefined') return;
        const purposes = [
            ['all', '全部'], ['swim', '玩水'], ['eat', '餐飲'], ['kids-play', '親子'],
            ['watch-show', '看秀'], ['photo', '拍照'], ['rest', '休息'], ['shop', '購物'], ['service', '服務']
        ];
        select.innerHTML = '<option value="all">全部甲板</option>' + deckGuideData.map(deck => `<option value="${deck.id}">${deck.label}</option>`).join('');
        const filters = document.getElementById('facility-purpose-filters');
        filters.innerHTML = purposes.map(([id, label]) => `<button type="button" data-purpose="${id}" aria-pressed="${id === 'all'}">${label}</button>`).join('');

        function update(target = notebookState.deck) {
            if (target === 'shows') notebookState.exploreTab = 'shows';
            else notebookState.deck = target;
            const renderKey = [notebookState.exploreTab, notebookState.deck, notebookState.purpose].join(':');
            if (root.dataset.renderKey === renderKey) return;
            root.dataset.renderKey = renderKey;
            const shows = notebookState.exploreTab === 'shows';
            document.getElementById('facility-controls').hidden = shows;
            const count = document.getElementById('facility-result-count');
            if (shows) {
                count.textContent = `${showGuideData.reduce((total, group) => total + group.shows.length, 0)} 場表演 · 時間依本航次公告`;
                root.innerHTML = showGuideData.map(category => `<section class="performance-category">
                    <h2>${category.title}</h2><p class="group-note">${category.intro}</p>
                    <div class="facility-grid">${category.shows.map((show, index) => {
                        const binding = getAiEntityBinding('shows', show.bindingKey);
                        return `<article class="show-item" id="${show.id}">
                            <div class="item-eyebrow"><i class="fa-solid fa-masks-theater" aria-hidden="true"></i> ${escapeHtml(show.location)}</div>
                            <h3>${show.name}</h3>${getBilingualStripMarkup(getPrimaryEntityForBinding('shows', show.bindingKey), show.name)}
                            <p>${show.theme}</p>
                            <p class="essential-note">${show.timingTip}</p>
                            <details><summary>觀賞安排</summary><p>${show.tripLink}</p>${show.sourceNote ? `<p class="group-note">${escapeHtml(show.sourceNote)}</p>` : ''}${renderEntityLinks(binding?.entityRefs, show.id)}</details>
                        </article>`;
                    }).join('')}</div></section>`).join('');
                return;
            }
            const facilities = deckGuideData.flatMap(deck => deck.facilities.map(facility => ({deck, facility})))
                .filter(({deck}) => notebookState.deck === 'all' || deck.id === notebookState.deck)
                .filter(({facility}) => facilityMatchesPurpose(facility, notebookState.purpose));
            count.textContent = `${facilities.length} 個地點`;
            select.value = notebookState.deck;
            filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.purpose === notebookState.purpose)));
            root.innerHTML = '<div class="facility-grid">' + facilities.map(({deck, facility}) => {
                const entity = getPrimaryEntityForBinding('deckFacilities', facility.bindingKey);
                return `<article class="facility-card" id="${facility.id}" data-search-id="${facility.id}">
                    <div class="item-eyebrow"><i class="${facility.icon}" aria-hidden="true"></i> ${escapeHtml(deck.label)}${entity?.area ? ' · ' + escapeHtml(entity.area) : ''}</div>
                    <h3>${facility.name}</h3>${getBilingualStripMarkup(entity, facility.name)}
                    <p>${facility.summary}</p>
                    ${/不得|禁止|不允許/.test(facility.bestTime) ? `<p class="essential-note">${facility.bestTime}</p>` : ''}
                    ${/限|至少|監督|122|不能|年齡/.test(facility.tripUse) ? `<p class="essential-note">${facility.tripUse}</p>` : ''}
                    <details><summary>安排與提醒 <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
                        ${facility.sourceNote ? `<p class="group-note">${escapeHtml(facility.sourceNote)}</p>` : ''}
                        ${/不得|禁止|不允許/.test(facility.bestTime) ? '' : `<p>${facility.bestTime}</p>`}
                        ${/限|至少|監督|122|不能|年齡/.test(facility.tripUse) ? '' : `<p>${facility.tripUse}</p>`}
                        ${entity ? `<button type="button" class="text-command" data-search-mode-target="lookup" data-lookup-category="${getEntityLookupCategory(entity)}" data-search-query="${escapeHtml(entity.officialNameEn)}"><i class="fa-solid fa-language" aria-hidden="true"></i> 中英對照</button>` : ''}
                    </details>
                </article>`;
            }).join('') + '</div>' + (!facilities.length ? '<p class="empty-state">這個甲板沒有符合用途的地點，可改選全部甲板。</p>' : '')
                + `<details class="ship-about"><summary>甲板介紹與動線 <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary>${deckGuideData.filter(deck => notebookState.deck === 'all' || deck.id === notebookState.deck).map(deck => `<section id="${deck.id}" class="deck-context"><h3>${deck.label} · ${deck.title}</h3><p>${deck.theme}</p><p>${deck.tripFocus}</p><p class="group-note">${deck.badges.join(' · ')}</p></section>`).join('')}</details>`;
        }
        filters.addEventListener('click', event => {
            const button = event.target.closest('[data-purpose]');
            if (!button) return;
            notebookState.purpose = button.dataset.purpose;
            update();
        });
        select.addEventListener('change', () => update(select.value));
        setDeckGuideTab = update;
        update();
    }

    function facilityMatchesPurpose(facility, purpose) {
        if (purpose === 'all') return true;
        const binding = getAiEntityBinding('deckFacilities', facility.bindingKey);
        const entities = (binding?.entityRefs || []).map(getAiEntityRegistryEntry).filter(Boolean);
        const text = normalizeSearchText([facility.name, facility.summary, ...entities.flatMap(entity => [entity.entityType, ...entity.categoryFamilies, ...entity.capabilityTags])].join(' '));
        const terms = {
            swim: ['swim','pool','玩水','泳池','slides'], eat: ['eat','drink','餐廳','快餐','酒廊','restaurant','bar'],
            'kids-play': ['kids','遊戲','兒童','arcade','marvel','親子'], 'watch-show': ['watch show','表演','劇院'],
            photo: ['photo','拍照','pics'], rest: ['rest','休息','lounge','spa'], shop: ['shop','商店','購物'],
            service: ['service','服務','rfid','手環']
        };
        return (terms[purpose] || []).some(term => text.includes(term));
    }

    renderDeckGuide();

    // 12. 實戰攻略 Playbook
    function renderPlaybookGuide() {
        const missionsContainer = document.getElementById('playbook-missions');
        const contentContainer = document.getElementById('playbook-content');
        if (!missionsContainer || !contentContainer || typeof playbookGuideData === 'undefined') return;

        const sourceMeta = {
            'provided-document': { label: '附件更新 · 9/8 整理', icon: 'fa-solid fa-file-lines' },
            official: { label: '規則與適用條件', icon: 'fa-solid fa-circle-info' },
            concierge: { label: '禮賓安排 · 依通知', icon: 'fa-solid fa-crown' },
            community: { label: '旅客經驗 · 非保證', icon: 'fa-solid fa-comments' }
        };
        let activeMission = playbookGuideData[0]?.id;

        missionsContainer.innerHTML = playbookGuideData.map(mission => `
            <button type="button" class="playbook-mission-btn ${mission.id === activeMission ? 'active' : ''}" data-playbook-mission="${mission.id}">
                <i class="fa-solid fa-compass" aria-hidden="true"></i>
                <span>${mission.label}</span>
            </button>
        `).join('');

        const missionButtons = missionsContainer.querySelectorAll('.playbook-mission-btn');

        function buildItemMarkup(item, missionId, itemIndex) {
            const source = sourceMeta[item.sourceType] || sourceMeta.community;
            const id = getPlaybookItemId(missionId, itemIndex);
            const binding = getAiEntityBinding('playbookItems', item.bindingKey);
            const supplements = (window.TRAVEL_REFERENCE_DATA?.records || []).filter(record => record.targetId === id);
            return `<details class="playbook-card" id="${id}" data-search-id="${id}">
                <summary class="playbook-summary">
                    <i class="${item.icon}" aria-hidden="true"></i>
                    <span><span class="item-eyebrow">${source.label}</span><h3>${item.title}</h3><span class="playbook-preview">${item.whenToUse}</span></span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </summary>
                <div class="playbook-body">
                    <p class="playbook-action">${item.action}</p>
                    <p class="essential-note">${item.caution}</p>
                    <p class="playbook-context">${item.tripFit}</p>
                    ${item.sourceNote ? `<p class="group-note">${escapeHtml(item.sourceNote)}</p>` : ''}
                    ${supplements.map(record => `<div id="${record.id}" class="reference-supplement">${record.bodyHtml}</div>`).join('')}
                    ${renderEntityLinks(binding?.entityRefs, id)}
                    ${item.relatedSectionId ? `<a class="text-command" href="#${item.relatedSectionId}">相關資料 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>` : ''}
                </div>
            </details>`;
        }

        function updatePlaybook(targetId, options = {}) {
            activeMission = targetId;
            missionButtons.forEach(button => {
                button.classList.toggle('active', button.dataset.playbookMission === activeMission);
            });

            const mission = playbookGuideData.find(item => item.id === activeMission) || playbookGuideData[0];
            if (!mission) return;

            contentContainer.innerHTML = `
                <div class="playbook-panel-header">
                    <div class="playbook-panel-copy">
                        <h3>${mission.label}</h3>
                        <p>${mission.intro}</p>
                    </div>
                </div>
                <div class="playbook-grid">
                    ${mission.items.map((item, itemIndex) => buildItemMarkup(item, mission.id, itemIndex)).join('')}
                </div>
            `;

            if (options.openItemId) {
                const detail = document.getElementById(options.openItemId);
                if (detail) detail.open = true;
            }
        }

        missionButtons.forEach(button => {
            button.addEventListener('click', () => {
                updatePlaybook(button.dataset.playbookMission);
            });
        });

        contentContainer.addEventListener('click', event => {
            const link = event.target.closest('[data-playbook-priority]');
            if (!link) return;

            event.preventDefault();
            const itemId = link.dataset.playbookPriority;
            const detail = document.getElementById(itemId);
            if (!detail) return;

            detail.open = true;
            waitForTargetAndScroll(itemId);
        });

        setPlaybookMission = updatePlaybook;
        updatePlaybook(activeMission);
    }

    renderPlaybookGuide();

    // 13. 行程表頁籤切換
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateScheduleTab(targetId) {
        notebookState.day = targetId;
        tabBtns.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tab') === targetId);
            button.setAttribute('aria-selected', String(button.getAttribute('data-tab') === targetId));
        });
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetId);
            content.hidden = content.id !== targetId;
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activateScheduleTab(btn.getAttribute('data-tab'));
        });
    });

    setScheduleTab = activateScheduleTab;

    // 15. 全站搜尋
    function stripHtmlTags(text) {
        return String(text || '').replace(/<[^>]+>/g, ' ');
    }

    function getSectionLabel(sectionId) {
        const labels = {
            'quick-start': '攻略速讀入口',
            overview: '團隊核心資訊',
            timeline: '禮賓預約黃金時間軸',
            checkin: '零失誤通關與登船實戰',
            facilities: '兒童育樂與水區防雷',
            entertainment: '娛樂大秀與極致餐飲',
            tips: '購物、隱藏預算與離船',
            'local-info': '在地資訊與小工具'
        };
        return labels[sectionId] || '其他資訊';
    }

    function getSourceLabel(sourceType) {
        const labels = {
            schedule: '行程',
            deck: '甲板',
            show: '表演',
            playbook: '攻略本',
            static: '其他資訊'
        };
        return labels[sourceType] || '內容';
    }

    function deriveContextualKeywords(text) {
        const normalized = normalizeSearchText(text);
        const keywords = collectTaxonomyContextualTerms(normalized);
        const entityRefs = inferEntityRefsFromText([text], 6);

        keywords.push(
            ...collectEntityRegistryProperNounTokens(entityRefs),
            ...collectEntityRegistryAliasTokens(entityRefs)
        );

        if (!normalized) return keywords;

        if (normalized.includes('看秀') || normalized.includes('提早入場') || normalized.includes('主秀')) {
            keywords.push('劇院', 'theatre', '主秀', '提早入場');
        }

        if (normalized.includes('concierge') || normalized.includes('lounge') || normalized.includes('酒廊') || normalized.includes('禮賓')) {
            keywords.push('禮賓', 'concierge', 'lounge', '酒廊');
        }

        if (normalized.includes('room service') || normalized.includes('客房服務') || normalized.includes('房務')) {
            keywords.push('room service', '客房服務', '房務', '客房餐點', '菜單');
        }

        if (normalized.includes('open house') || normalized.includes('oceaneer') || normalized.includes('kids club')) {
            keywords.push('open house', 'oceaneer', 'kids club', '孩子', '兒童');
        }

        if (normalized.includes('披薩') || normalized.includes('pizza') || normalized.includes('補給') || normalized.includes('點心') || normalized.includes('快餐')) {
            keywords.push('披薩', 'pizza', '補給', '點心', '快餐');
        }

        if (normalized.includes('上船') || normalized.includes('登船')) {
            keywords.push('登船日', '第一天', 'Day 1', 'Open House', 'Oceaneer', '手環', '玩水', 'Toy Story Pool', 'Concierge Lounge');
        }

        if (normalized.includes('照片') || normalized.includes('拍照') || normalized.includes('photo')) {
            keywords.push('拍照套裝', 'Photo Package', '照片下載', 'Pics Photo Shop', 'Disney Cruise Line Photos', 'Shutters');
        }

        if (normalized.includes('最後一天') || normalized.includes('下船') || normalized.includes('撤船') || normalized.includes('離船')) {
            keywords.push('最後一天', '下船', '撤船日', '早餐', 'Self-Assist', 'Express Walk-off', 'SGAC');
        }

        if (normalized.includes('花園舞台') || normalized.includes('imagination garden') || normalized.includes('幻想花園')) {
            keywords.push('花園舞台', 'Disney Imagination Garden', 'Deck 10', 'Deck 11', '動線');
        }

        if (normalized.includes('手環') || normalized.includes('rfid') || normalized.includes('取孩')) {
            keywords.push('RFID', '手環', 'Oceaneer Club', 'Kids Club', '取孩密語');
        }

        return uniqueItems(keywords);
    }

    function compactSearchText(value) {
        if (Array.isArray(value)) {
            return value.map(item => compactSearchText(item)).filter(Boolean).join(' ');
        }

        return stripHtmlTags(String(value || ''))
            .replace(/\s+/g, ' ')
            .trim();
    }

    function sanitizeSearchTextArray(items = [], maxItems = 8, maxLength = 80) {
        return uniqueItems((Array.isArray(items) ? items : [])
            .map(item => compactSearchText(item).slice(0, maxLength))
            .filter(Boolean))
            .slice(0, maxItems);
    }

    function sanitizeEntityId(value) {
        return compactSearchText(value).toLowerCase();
    }

    function sanitizeEntityRefArray(items = [], maxItems = 12) {
        return uniqueItems((Array.isArray(items) ? items : [])
            .map(item => sanitizeEntityId(item))
            .filter(Boolean))
            .slice(0, maxItems);
    }

    function normalizeAiEntityRegistry(rawRegistry = {}) {
        const rawEntities = Array.isArray(rawRegistry.entities) ? rawRegistry.entities : [];
        const normalizedEntities = rawEntities
            .map(entry => {
                const entityId = sanitizeEntityId(entry?.entityId);
                const officialNameEn = compactSearchText(entry?.officialNameEn);
                const displayNameZh = compactSearchText(entry?.displayNameZh);
                const officialNameZh = compactSearchText(entry?.officialNameZh);
                const entityType = compactSearchText(entry?.entityType);
                if (!entityId || !officialNameEn || !displayNameZh || !entityType) {
                    return null;
                }

                return {
                    entityId,
                    officialNameEn,
                    displayNameZh,
                    officialNameZh,
                    translationType: compactSearchText(entry?.translationType) || 'site-localized',
                    entityType,
                    categoryFamilies: sanitizeSearchTextArray(entry?.categoryFamilies, 8, 60),
                    capabilityTags: uniqueItems((Array.isArray(entry?.capabilityTags) ? entry.capabilityTags : [])
                        .map(item => compactSearchText(item).toLowerCase())
                        .filter(Boolean))
                        .slice(0, 8),
                    aliases: sanitizeSearchTextArray(entry?.aliases, 16, 120),
                    deckHints: sanitizeSearchTextArray(entry?.deckHints, 8, 40),
                    area: compactSearchText(entry?.area),
                    relatedEntityIds: sanitizeEntityRefArray(entry?.relatedEntityIds, 12),
                    sourceUrls: sanitizeSearchTextArray(entry?.sourceUrls, 8, 200),
                    sourceAuthority: compactSearchText(entry?.sourceAuthority) || 'official',
                    lastVerifiedDate: compactSearchText(entry?.lastVerifiedDate) || compactSearchText(rawRegistry.lastVerifiedDate)
                };
            })
            .filter(Boolean);

        const entityLookup = new Map(normalizedEntities.map(entry => [entry.entityId, entry]));
        const tokenLookup = new Map();

        const pushToken = (token, entityId) => {
            const normalizedToken = normalizeSearchText(token);
            if (!normalizedToken || normalizedToken.length < 2) return;
            if (!tokenLookup.has(normalizedToken)) {
                tokenLookup.set(normalizedToken, new Set());
            }
            tokenLookup.get(normalizedToken).add(entityId);
        };

        normalizedEntities.forEach(entry => {
            [
                entry.officialNameEn,
                entry.displayNameZh,
                entry.officialNameZh,
                ...entry.aliases,
                entry.area
            ].filter(Boolean).forEach(token => pushToken(token, entry.entityId));
        });

        const tokenEntries = Array.from(tokenLookup.entries())
            .map(([token, entityIds]) => ({
                token,
                entityIds: Array.from(entityIds),
                length: token.replace(/\s+/g, '').length
            }))
            .sort((left, right) => right.length - left.length);

        const normalizeBindingMap = (rawMap = {}, defaultRole = 'primary') => {
            const bindingMap = new Map();
            Object.entries(rawMap || {}).forEach(([bindingKey, binding]) => {
                const normalizedBindingKey = compactSearchText(bindingKey);
                if (!normalizedBindingKey || !binding || typeof binding !== 'object') return;
                bindingMap.set(normalizedBindingKey, {
                    entityRefs: sanitizeEntityRefArray(binding.entityRefs, 12),
                    supportForEntityRefs: sanitizeEntityRefArray(binding.supportForEntityRefs, 12),
                    keywordHints: sanitizeSearchTextArray(binding.keywordHints, 16, 80),
                    contentRole: compactSearchText(binding.contentRole) || defaultRole
                });
            });
            return bindingMap;
        };

        const bindings = {
            deckFacilities: normalizeBindingMap(rawRegistry.bindings?.deckFacilities, 'primary'),
            shows: normalizeBindingMap(rawRegistry.bindings?.shows, 'primary'),
            scheduleEvents: normalizeBindingMap(rawRegistry.bindings?.scheduleEvents, 'support'),
            playbookItems: normalizeBindingMap(rawRegistry.bindings?.playbookItems, 'primary')
        };

        return {
            version: compactSearchText(rawRegistry.version) || 'registry-v1',
            lastVerifiedDate: compactSearchText(rawRegistry.lastVerifiedDate),
            entities: normalizedEntities,
            entityLookup,
            tokenLookup,
            tokenEntries,
            bindings
        };
    }

    function getAiEntityRegistryEntry(entityId) {
        return aiEntityRegistry.entityLookup.get(sanitizeEntityId(entityId)) || null;
    }

    function getAiEntityBinding(bindingGroup, bindingKey) {
        const group = aiEntityRegistry.bindings?.[bindingGroup];
        if (!(group instanceof Map)) return null;
        return group.get(compactSearchText(bindingKey)) || null;
    }

    function getPrimaryEntityForBinding(bindingGroup, bindingKey) {
        const binding = getAiEntityBinding(bindingGroup, bindingKey);
        const entityId = binding?.entityRefs?.[0];
        return entityId ? getAiEntityRegistryEntry(entityId) : null;
    }

    function getBilingualStripMarkup(entity, title = '') {
        if (!entity?.officialNameEn || !entity?.displayNameZh) return '';
        const englishInTitle = normalizeSearchText(title).includes(normalizeSearchText(entity.officialNameEn));
        const chineseInTitle = normalizeSearchText(title).includes(normalizeSearchText(entity.displayNameZh));
        if (englishInTitle && chineseInTitle) return '';
        return `
            <div class="bilingual-strip">
                <span class="bilingual-strip-label">${englishInTitle ? '中文' : '英文 / English'}</span>
                ${englishInTitle ? '' : `<span class="bilingual-strip-en">${escapeHtml(entity.officialNameEn)}</span>`}
                ${chineseInTitle ? '' : `<span class="bilingual-strip-zh">${escapeHtml(entity.displayNameZh)}</span>`}
            </div>
        `;
    }

    function getLookupCategoryLabel(category) {
        return LOOKUP_CATEGORY_LABELS[category] || LOOKUP_CATEGORY_LABELS.activity;
    }

    function getLookupCategoryDisplayLabel(category) {
        const zhLabel = getLookupCategoryLabel(category);
        const enLabel = LOOKUP_CATEGORY_EN_LABELS[category] || LOOKUP_CATEGORY_EN_LABELS.activity;
        return `${enLabel} / ${zhLabel}`;
    }

    function getLookupSourceDisplayLabel(sourceType) {
        if (sourceType === 'entity') return 'Official name / 正式名稱';
        if (sourceType === 'menu-item') return 'Menu item / 餐點菜名';
        return 'Activity index / 活動索引';
    }

    function getMenuDiningFilterEntry(filterId) {
        return getMenuCourseEntry(filterId);
    }

    function getMenuCourseEntry(courseId) {
        const normalized = compactSearchText(courseId || 'all');
        return MENU_COURSE_FILTERS.find(course => course.id === normalized) || MENU_COURSE_FILTERS[0];
    }

    function getMenuRestaurantOptions() {
        const configured = Array.isArray(window.MENU_LOOKUP_DATA?.restaurants)
            ? window.MENU_LOOKUP_DATA.restaurants
            : [];
        if (configured.length) {
            return configured
                .map(restaurant => ({
                    id: compactSearchText(restaurant.id),
                    label: compactSearchText(restaurant.label),
                    englishName: compactSearchText(restaurant.englishName),
                    group: compactSearchText(restaurant.group),
                    groupLabel: compactSearchText(restaurant.groupLabel) || MENU_RESTAURANT_GROUP_LABELS[restaurant.group] || compactSearchText(restaurant.group),
                    order: Number.isFinite(restaurant.order) ? restaurant.order : 999,
                    count: Number.isFinite(restaurant.count) ? restaurant.count : 0
                }))
                .filter(restaurant => restaurant.id && restaurant.label)
                .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
        }
        if (!isMenuLookupDataReady()) {
            return [];
        }

        const restaurantMap = new Map();
        getMenuLookupRecords().forEach(record => {
            if (!record.restaurantId || restaurantMap.has(record.restaurantId)) return;
            restaurantMap.set(record.restaurantId, {
                id: record.restaurantId,
                label: record.restaurantLabel,
                englishName: record.restaurantEnglish,
                group: record.restaurantGroup,
                groupLabel: record.restaurantGroupLabel,
                order: record.restaurantOrder || 999,
                count: 0
            });
        });
        getMenuLookupRecords().forEach(record => {
            const entry = restaurantMap.get(record.restaurantId);
            if (entry) entry.count += 1;
        });
        return Array.from(restaurantMap.values())
            .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    }

    function getMenuRestaurantEntry(restaurantId) {
        const normalized = compactSearchText(restaurantId || 'all');
        if (normalized === 'all') {
            const sourceCount = Number(window.MENU_LOOKUP_DATA?.recordsCount || window.MENU_LOOKUP_DATA?.sourceCount || 0);
            return { id: 'all', label: '全部餐廳', englishName: 'All restaurants', group: 'all', groupLabel: '全部', order: 0, count: sourceCount };
        }
        return getMenuRestaurantOptions().find(restaurant => restaurant.id === normalized) || {
            id: normalized,
            label: normalized,
            englishName: '',
            group: 'unknown',
            groupLabel: '',
            order: 999,
            count: 0
        };
    }

    function lookupRecordMatchesRestaurantFilter(record, restaurantId) {
        const normalized = compactSearchText(restaurantId || 'all');
        if (normalized === 'all') return true;
        return record.sourceType === 'menu-item' && record.restaurantId === normalized;
    }

    function isMenuDrinkRecord(record = {}) {
        return record.courseGroup === 'drinks'
            || record.restaurantGroup === 'beverage'
            || (record.tags || []).some(tag => ['coffee', 'non-alcoholic', 'alcoholic'].includes(tag))
            || ['drinks', 'non-alcoholic', 'cocktails', 'coffee', 'beer', 'wine', 'rum', 'whiskey', 'sake'].includes(record.menuCategory);
    }

    function getMenuItemCrewPhrase(record = {}) {
        if (isMenuDrinkRecord(record)) return 'Could I order this drink, please?';
        return compactSearchText(record.crewPhrase) || 'Could I order this, please?';
    }

    function lookupRecordMatchesDiningFilter(record, filterId) {
        const normalized = compactSearchText(filterId || 'all');
        if (normalized === 'all') return true;
        if (record.sourceType !== 'menu-item') return false;
        return Boolean(getMenuCourseEntry(normalized).match(record));
    }

    function getLookupRecordLocation(record = {}) {
        if (record.sourceType === 'menu-item') {
            return uniqueItems([
                record.restaurantLabel,
                record.courseGroupLabel || record.menuCategoryLabel,
                record.price
            ].filter(Boolean)).join(' • ');
        }
        return uniqueItems([record.deckHint, record.venueEnglish].filter(Boolean)).join(' • ');
    }

    function getLookupResultChipLabels(result = {}) {
        if (result.sourceType === 'menu-item') {
            return uniqueItems([
                ...(Array.isArray(result.tagLabels) ? result.tagLabels.slice(0, 2) : []),
                result.occurrenceCount > 1 ? `合併 ${result.occurrenceCount} 筆` : ''
            ].filter(Boolean)).slice(0, 5);
        }
        return uniqueItems([
            result.occurrenceCount > 1 ? `合併 ${result.occurrenceCount} 筆` : ''
        ].filter(Boolean));
    }

    function getEntityLookupCategory(entry = {}) {
        const families = new Set((entry.categoryFamilies || []).map(item => compactSearchText(item)));
        const capabilities = new Set((entry.capabilityTags || []).map(item => compactSearchText(item).toLowerCase()));
        const entityType = compactSearchText(entry.entityType).toLowerCase();

        if (families.has('攝影') || capabilities.has('photo') || entityType.includes('photo')) return 'photo';
        if (families.has('兒童俱樂部') || capabilities.has('kids-play') || entityType.includes('kids')) return 'kids';
        if (families.has('餐廳') || families.has('快餐') || families.has('酒廊') || capabilities.has('eat') || capabilities.has('drink')) return 'dining';
        if (families.has('表演') || entityType === 'show') return 'show';
        if (families.has('服務') || entityType === 'service') return 'service';
        if (families.has('商店') || entityType === 'shop') return 'shop';
        if (families.has('Spa / 健身') || capabilities.has('spa')) return 'wellness';
        if (families.has('活動') || entityType === 'activity') return 'activity';
        return 'facility';
    }

    function getOnboardLookupCategory(rawCategory = '') {
        const category = compactSearchText(rawCategory).toLowerCase();
        const categoryMap = {
            youth: 'kids',
            photo: 'photo',
            show: 'show',
            movie: 'show',
            music: 'activity',
            adult: 'activity',
            other: 'activity',
            game: 'activity',
            shop: 'shop',
            trivia: 'activity',
            wellness: 'wellness',
            craft: 'activity'
        };
        return categoryMap[category] || 'activity';
    }

    function getCategorySearchHints(category) {
        const hints = {
            dining: ['餐廳', '餐點', '吃', 'food', 'restaurant', 'dining', 'bar', 'lounge'],
            activity: ['活動', '節目', 'activity', 'activities', 'game', 'party'],
            facility: ['設施', '地方', '地點', 'facility', 'venue', 'deck'],
            photo: ['拍照', '照片', 'photo', 'photos', 'magic shot', 'magic shots'],
            kids: ['兒童', '青少年', '小孩', 'kids', 'youth', 'oceaneer', 'edge', 'vibe'],
            show: ['表演', '電影', '看秀', 'show', 'movie', 'theatre', 'cinema'],
            service: ['服務', '協助', 'service', 'help'],
            shop: ['商店', '購物', 'shop', 'shopping'],
            wellness: ['spa', 'fitness', '健身', '運動']
        };
        return hints[category] || [];
    }

    function buildLookupSearchText(parts = []) {
        return normalizeSearchText(uniqueItems(parts.map(compactSearchText).filter(Boolean)).join(' '));
    }

    function inferEntityRefsFromText(textParts = [], limit = 8) {
        const normalized = normalizeSearchText(textParts.join(' '));
        if (!normalized) return [];

        const matched = [];
        aiEntityRegistry.tokenEntries.forEach(entry => {
            if (!normalized.includes(entry.token)) return;
            matched.push(...entry.entityIds);
        });

        return sanitizeEntityRefArray(matched, limit);
    }

    function resolveEntityRefs(config = {}) {
        const explicit = sanitizeEntityRefArray(config.entityRefs, config.limit || 10);
        if (explicit.length) {
            return explicit;
        }

        return inferEntityRefsFromText([
            config.title,
            config.text,
            config.structuredText,
            ...(Array.isArray(config.keywords) ? config.keywords : []),
            config.locationLabel,
            config.groupLabel
        ], config.limit || 10);
    }

    function collectEntityRegistryProperNounTokens(entityRefs = []) {
        return uniqueItems((Array.isArray(entityRefs) ? entityRefs : [])
            .map(entityId => getAiEntityRegistryEntry(entityId))
            .filter(Boolean)
            .flatMap(entry => [entry.displayNameZh, entry.officialNameEn, entry.officialNameZh])
            .map(item => compactSearchText(item))
            .filter(Boolean))
            .slice(0, 24);
    }

    function collectEntityRegistryAliasTokens(entityRefs = []) {
        return uniqueItems((Array.isArray(entityRefs) ? entityRefs : [])
            .map(entityId => getAiEntityRegistryEntry(entityId))
            .filter(Boolean)
            .flatMap(entry => [...(entry.aliases || []), ...(entry.deckHints || []), entry.area])
            .map(item => compactSearchText(item))
            .filter(Boolean))
            .slice(0, 24);
    }

    function collectEntityRegistryCategoryFamilies(entityRefs = []) {
        return uniqueItems((Array.isArray(entityRefs) ? entityRefs : [])
            .map(entityId => getAiEntityRegistryEntry(entityId))
            .filter(Boolean)
            .flatMap(entry => entry.categoryFamilies || []))
            .slice(0, 8);
    }

    function collectEntityRegistryCapabilityTags(entityRefs = []) {
        return uniqueItems((Array.isArray(entityRefs) ? entityRefs : [])
            .map(entityId => getAiEntityRegistryEntry(entityId))
            .filter(Boolean)
            .flatMap(entry => entry.capabilityTags || []))
            .slice(0, 8);
    }

    function collectEntityRegistryEntityFamilies(entityRefs = []) {
        return uniqueItems((Array.isArray(entityRefs) ? entityRefs : [])
            .map(entityId => getAiEntityRegistryEntry(entityId))
            .filter(Boolean)
            .flatMap(entry => [entry.entityType]))
            .slice(0, 8);
    }

    function normalizeAiQueryTaxonomy(rawTaxonomy = {}) {
        const rawAliases = Array.isArray(rawTaxonomy.aliases) ? rawTaxonomy.aliases : [];
        const rawGenericClasses = Array.isArray(rawTaxonomy.genericClasses) ? rawTaxonomy.genericClasses : [];
        const rawCategoryFamilies = Array.isArray(rawTaxonomy.categoryFamilies) ? rawTaxonomy.categoryFamilies : [];
        const rawClusterRelations = Array.isArray(rawTaxonomy.clusterRelations) ? rawTaxonomy.clusterRelations : [];
        const rawRelatedEdges = Array.isArray(rawTaxonomy.relatedEdges) ? rawTaxonomy.relatedEdges : [];
        const rawCapabilityProfiles = Array.isArray(rawTaxonomy.capabilityProfiles) ? rawTaxonomy.capabilityProfiles : [];

        const aliases = rawAliases
            .map(entry => {
                const canonical = compactSearchText(entry?.canonical);
                const terms = uniqueItems([canonical, ...(Array.isArray(entry?.terms) ? entry.terms : [])]
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const normalizedTerms = uniqueItems(terms
                    .map(term => normalizeSearchText(term))
                    .filter(Boolean));
                return canonical && normalizedTerms.length
                    ? {
                        canonical,
                        terms,
                        normalizedCanonical: normalizeSearchText(canonical),
                        normalizedTerms
                    }
                    : null;
            })
            .filter(Boolean);

        const genericClasses = rawGenericClasses
            .map(entry => {
                const canonical = compactSearchText(entry?.canonical);
                const terms = uniqueItems([canonical, ...(Array.isArray(entry?.terms) ? entry.terms : [])]
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const expandsTo = uniqueItems((Array.isArray(entry?.expandsTo) ? entry.expandsTo : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const normalizedTerms = uniqueItems(terms
                    .map(term => normalizeSearchText(term))
                    .filter(Boolean));
                return canonical && normalizedTerms.length
                    ? {
                        canonical,
                        terms,
                        expandsTo,
                        normalizedCanonical: normalizeSearchText(canonical),
                        normalizedTerms
                    }
                    : null;
            })
            .filter(Boolean);

        const categoryFamilies = rawCategoryFamilies
            .map(entry => {
                const id = compactSearchText(entry?.id) || compactSearchText(entry?.label);
                const label = compactSearchText(entry?.label) || compactSearchText(entry?.id);
                const terms = uniqueItems([label, id, ...(Array.isArray(entry?.terms) ? entry.terms : [])]
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const keywords = uniqueItems([...(Array.isArray(entry?.keywords) ? entry.keywords : []), ...terms]
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const normalizedTerms = uniqueItems(terms
                    .map(term => normalizeSearchText(term))
                    .filter(Boolean));
                return label && normalizedTerms.length
                    ? {
                        id: id || label,
                        label,
                        terms,
                        keywords,
                        normalizedId: normalizeSearchText(id || label),
                        normalizedLabel: normalizeSearchText(label),
                        normalizedTerms
                    }
                    : null;
            })
            .filter(Boolean);

        const clusterRelations = rawClusterRelations
            .map(entry => {
                const key = compactSearchText(entry?.key) || compactSearchText(entry?.label);
                const label = compactSearchText(entry?.label) || compactSearchText(entry?.key);
                const triggers = uniqueItems([label, ...(Array.isArray(entry?.triggers) ? entry.triggers : [])]
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const relatedEntities = uniqueItems((Array.isArray(entry?.relatedEntities) ? entry.relatedEntities : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const relatedCategories = uniqueItems((Array.isArray(entry?.relatedCategories) ? entry.relatedCategories : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const relatedTerms = uniqueItems((Array.isArray(entry?.relatedTerms) ? entry.relatedTerms : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const normalizedTriggers = uniqueItems(triggers
                    .map(term => normalizeSearchText(term))
                    .filter(Boolean));
                return key && normalizedTriggers.length
                    ? {
                        key,
                        label: label || key,
                        triggers,
                        normalizedKey: normalizeSearchText(key),
                        normalizedTriggers,
                        relatedEntities,
                        relatedCategories,
                        relatedTerms
                    }
                    : null;
            })
            .filter(Boolean);

        const relatedEdges = rawRelatedEdges
            .map(entry => {
                const source = compactSearchText(entry?.source);
                const target = compactSearchText(entry?.target);
                const relation = compactSearchText(entry?.relation);
                const terms = uniqueItems((Array.isArray(entry?.terms) ? entry.terms : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                return source && target
                    ? {
                        source,
                        target,
                        relation: relation || 'related',
                        terms,
                        normalizedSource: normalizeSearchText(source),
                        normalizedTarget: normalizeSearchText(target)
                    }
                    : null;
            })
            .filter(Boolean);

        const capabilityProfiles = rawCapabilityProfiles
            .map(entry => {
                const id = compactSearchText(entry?.id || entry?.label).toLowerCase();
                const label = compactSearchText(entry?.label || entry?.id || id);
                const terms = uniqueItems([label, id, ...(Array.isArray(entry?.terms) ? entry.terms : [])]
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const categoryFamilies = uniqueItems((Array.isArray(entry?.categoryFamilies) ? entry.categoryFamilies : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const signalCategoryFamilies = uniqueItems((Array.isArray(entry?.signalCategoryFamilies) ? entry.signalCategoryFamilies : categoryFamilies)
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const preferredSourceTypes = uniqueItems((Array.isArray(entry?.preferredSourceTypes) ? entry.preferredSourceTypes : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const disallowedCategories = uniqueItems((Array.isArray(entry?.disallowedCategories) ? entry.disallowedCategories : [])
                    .map(term => compactSearchText(term))
                    .filter(Boolean));
                const normalizedTerms = uniqueItems(terms
                    .map(term => normalizeSearchText(term))
                    .filter(Boolean));
                return id && normalizedTerms.length
                    ? {
                        id,
                        label,
                        terms,
                        normalizedId: normalizeSearchText(id),
                        normalizedLabel: normalizeSearchText(label),
                        normalizedTerms,
                        categoryFamilies,
                        signalCategoryFamilies,
                        preferredSourceTypes,
                        disallowedCategories
                    }
                    : null;
            })
            .filter(Boolean);

        const aliasLookup = new Map();
        const genericClassLookup = new Map();
        const categoryLookup = new Map();
        const clusterKeyLookup = new Map();
        const clusterTriggerLookup = new Map();
        const relatedEdgeLookup = new Map();
        const capabilityLookup = new Map();

        aliases.forEach(entry => {
            entry.normalizedTerms.forEach(term => aliasLookup.set(term, entry.canonical));
        });

        genericClasses.forEach(entry => {
            entry.normalizedTerms.forEach(term => genericClassLookup.set(term, entry.canonical));
        });

        categoryFamilies.forEach(entry => {
            [entry.normalizedId, entry.normalizedLabel, ...entry.normalizedTerms].forEach(term => {
                if (term) categoryLookup.set(term, entry.label);
            });
        });

        clusterRelations.forEach(entry => {
            clusterKeyLookup.set(entry.normalizedKey, entry);
            entry.normalizedTriggers.forEach(term => {
                if (!clusterTriggerLookup.has(term)) {
                    clusterTriggerLookup.set(term, new Set());
                }
                clusterTriggerLookup.get(term).add(entry.key);
            });
        });

        relatedEdges.forEach(entry => {
            [entry.normalizedSource, entry.normalizedTarget].filter(Boolean).forEach(term => {
                if (!relatedEdgeLookup.has(term)) {
                    relatedEdgeLookup.set(term, new Set());
                }
                relatedEdgeLookup.get(term).add(entry);
            });
        });

        capabilityProfiles.forEach(entry => {
            [entry.normalizedId, entry.normalizedLabel, ...entry.normalizedTerms].forEach(term => {
                if (term) capabilityLookup.set(term, entry.id);
            });
        });

        return {
            version: compactSearchText(rawTaxonomy.version) || 'fallback',
            aliases,
            genericClasses,
            categoryFamilies,
            clusterRelations,
            relatedEdges,
            capabilityProfiles,
            supportedSourceTypes: uniqueItems((Array.isArray(rawTaxonomy.supportedSourceTypes) ? rawTaxonomy.supportedSourceTypes : [])
                .map(term => compactSearchText(term))
                .filter(Boolean)),
            aliasLookup,
            genericClassLookup,
            categoryLookup,
            clusterKeyLookup,
            clusterTriggerLookup,
            relatedEdgeLookup,
            capabilityLookup
        };
    }

    function getSerializableAiQueryTaxonomy() {
        return {
            version: aiQueryTaxonomy.version,
            aliases: aiQueryTaxonomy.aliases.map(entry => ({
                canonical: entry.canonical,
                terms: entry.terms
            })),
            genericClasses: aiQueryTaxonomy.genericClasses.map(entry => ({
                canonical: entry.canonical,
                terms: entry.terms,
                expandsTo: entry.expandsTo
            })),
            categoryFamilies: aiQueryTaxonomy.categoryFamilies.map(entry => ({
                id: entry.id,
                label: entry.label,
                terms: entry.terms,
                keywords: entry.keywords
            })),
            clusterRelations: aiQueryTaxonomy.clusterRelations.map(entry => ({
                key: entry.key,
                label: entry.label,
                triggers: entry.triggers,
                relatedEntities: entry.relatedEntities,
                relatedCategories: entry.relatedCategories,
                relatedTerms: entry.relatedTerms
            })),
            relatedEdges: aiQueryTaxonomy.relatedEdges.map(entry => ({
                source: entry.source,
                target: entry.target,
                relation: entry.relation,
                terms: entry.terms
            })),
            capabilityProfiles: aiQueryTaxonomy.capabilityProfiles.map(entry => ({
                id: entry.id,
                label: entry.label,
                terms: entry.terms,
                categoryFamilies: entry.categoryFamilies,
                preferredSourceTypes: entry.preferredSourceTypes,
                disallowedCategories: entry.disallowedCategories
            })),
            supportedSourceTypes: aiQueryTaxonomy.supportedSourceTypes
        };
    }

    function resolveTaxonomyEntityName(value) {
        const normalized = normalizeSearchText(value);
        if (!normalized) return '';
        return aiQueryTaxonomy.aliasLookup.get(normalized) || '';
    }

    function resolveTaxonomyGenericClassName(value) {
        const normalized = normalizeSearchText(value);
        if (!normalized) return '';
        return aiQueryTaxonomy.genericClassLookup.get(normalized) || '';
    }

    function resolveTaxonomyCategoryLabel(value) {
        const normalized = normalizeSearchText(value);
        if (!normalized) return '';
        return aiQueryTaxonomy.categoryLookup.get(normalized) || '';
    }

    function getTaxonomyEntityEntry(canonical) {
        const normalized = normalizeSearchText(canonical);
        return aiQueryTaxonomy.aliases.find(entry => entry.normalizedCanonical === normalized) || null;
    }

    function getTaxonomyGenericClassEntry(canonical) {
        const normalized = normalizeSearchText(canonical);
        return aiQueryTaxonomy.genericClasses.find(entry => entry.normalizedCanonical === normalized) || null;
    }

    function getTaxonomyCategoryEntry(label) {
        const normalized = normalizeSearchText(label);
        return aiQueryTaxonomy.categoryFamilies.find(entry => entry.normalizedLabel === normalized || entry.normalizedId === normalized) || null;
    }

    function getTaxonomyClusterEntry(key) {
        const normalized = normalizeSearchText(key);
        return aiQueryTaxonomy.clusterRelations.find(entry => entry.normalizedKey === normalized) || null;
    }

    function resolveTaxonomyCapabilityId(value) {
        const normalized = normalizeSearchText(value);
        if (!normalized) return '';
        return aiQueryTaxonomy.capabilityLookup.get(normalized) || '';
    }

    function getTaxonomyCapabilityEntry(value) {
        const capabilityId = resolveTaxonomyCapabilityId(value) || compactSearchText(value).toLowerCase();
        if (!capabilityId) return null;
        return aiQueryTaxonomy.capabilityProfiles.find(entry => entry.id === capabilityId) || null;
    }

    function getTaxonomyCapabilityLabel(value) {
        return getTaxonomyCapabilityEntry(value)?.label || compactSearchText(value);
    }

    function getCapabilitySignalCategoryFamilies(capabilityEntry) {
        if (!capabilityEntry || typeof capabilityEntry !== 'object') return [];
        const families = Array.isArray(capabilityEntry.signalCategoryFamilies) && capabilityEntry.signalCategoryFamilies.length
            ? capabilityEntry.signalCategoryFamilies
            : capabilityEntry.categoryFamilies;
        return Array.isArray(families) ? families : [];
    }

    function getTaxonomyClusterKeysForTerm(value) {
        const normalized = normalizeSearchText(value);
        if (!normalized) return [];
        const matched = new Set();

        if (aiQueryTaxonomy.clusterTriggerLookup.has(normalized)) {
            aiQueryTaxonomy.clusterTriggerLookup.get(normalized).forEach(key => matched.add(key));
        }

        aiQueryTaxonomy.clusterRelations.forEach(entry => {
            const relatedTerms = uniqueItems([
                ...entry.relatedEntities,
                ...entry.relatedCategories,
                ...entry.relatedTerms
            ]).map(term => normalizeSearchText(term)).filter(Boolean);
            if (relatedTerms.includes(normalized)) {
                matched.add(entry.key);
            }
        });

        return Array.from(matched);
    }

    function collectTaxonomyContextualTerms(normalizedQuery = '') {
        if (!normalizedQuery) return [];

        const terms = new Set();
        const matchedTerms = collectMatchingTerms(normalizedQuery, searchDisplayMap);
        const splitUnits = normalizedQuery.split(' ').filter(Boolean);

        uniqueItems([normalizedQuery, ...matchedTerms, ...splitUnits]).forEach((term) => {
            const compactTerm = compactSearchText(term);
            const entityName = resolveTaxonomyEntityName(term);
            const genericClass = resolveTaxonomyGenericClassName(term);
            const categoryLabel = resolveTaxonomyCategoryLabel(term);
            const capabilityId = resolveTaxonomyCapabilityId(term);
            const clusterKeys = getTaxonomyClusterKeysForTerm(term);

            if (compactTerm) terms.add(compactTerm);
            if (entityName) terms.add(entityName);
            if (genericClass) {
                terms.add(genericClass);
                expandTaxonomyCategoryTerms(getTaxonomyGenericClassEntry(genericClass)?.expandsTo || []).forEach((value) => terms.add(value));
            }
            if (categoryLabel) {
                terms.add(categoryLabel);
                expandTaxonomyCategoryTerms([categoryLabel]).forEach((value) => terms.add(value));
            }
            if (capabilityId) {
                terms.add(capabilityId);
                const capabilityEntry = getTaxonomyCapabilityEntry(capabilityId);
                (capabilityEntry?.categoryFamilies || []).forEach((value) => terms.add(value));
            }
            expandTaxonomyClusterTerms(clusterKeys).forEach((value) => terms.add(value));
            expandTaxonomyRelatedTerms([term, entityName, genericClass, categoryLabel].filter(Boolean)).forEach((value) => terms.add(value));
        });

        return uniqueItems(Array.from(terms).map(compactSearchText).filter(Boolean)).slice(0, 32);
    }

    function expandTaxonomyCategoryTerms(labels = []) {
        return uniqueItems(labels.flatMap(label => {
            const entry = getTaxonomyCategoryEntry(label);
            if (!entry) return compactSearchText(label) ? [compactSearchText(label)] : [];
            return uniqueItems([entry.label, ...entry.terms, ...entry.keywords]);
        }).map(term => compactSearchText(term)).filter(Boolean)).slice(0, 24);
    }

    function expandTaxonomyClusterTerms(clusterKeys = []) {
        return uniqueItems(clusterKeys.flatMap(key => {
            const entry = getTaxonomyClusterEntry(key);
            if (!entry) return [];
            return uniqueItems([
                entry.label,
                ...entry.relatedEntities,
                ...entry.relatedCategories,
                ...entry.relatedTerms
            ]);
        }).map(term => compactSearchText(term)).filter(Boolean)).slice(0, 24);
    }

    function expandTaxonomyRelatedTerms(terms = []) {
        const normalizedTerms = uniqueItems((Array.isArray(terms) ? terms : [])
            .map(term => normalizeSearchText(term))
            .filter(Boolean));
        const expanded = new Set();

        normalizedTerms.forEach(term => {
            const entries = aiQueryTaxonomy.relatedEdgeLookup.get(term);
            if (!entries) return;
            entries.forEach(entry => {
                expanded.add(entry.source);
                expanded.add(entry.target);
                (entry.terms || []).forEach(item => expanded.add(item));
            });
        });

        return uniqueItems(Array.from(expanded).map(term => compactSearchText(term)).filter(Boolean)).slice(0, 24);
    }

    function inferAiCapabilityTags(config = {}) {
        const normalized = normalizeSearchText([
            config.title,
            config.text,
            config.structuredText,
            config.locationLabel,
            config.groupLabel,
            ...(Array.isArray(config.keywords) ? config.keywords : []),
            ...(Array.isArray(config.categoryFamilies) ? config.categoryFamilies : [])
        ].filter(Boolean).join(' '));
        const categoryFamilies = Array.isArray(config.categoryFamilies) ? config.categoryFamilies : [];

        return aiQueryTaxonomy.capabilityProfiles
            .filter(entry => {
                const termMatch = entry.normalizedTerms.some(term => normalized.includes(term));
                const categoryMatch = getCapabilitySignalCategoryFamilies(entry).some(label => categoryFamilies.includes(label));
                return termMatch || categoryMatch;
            })
            .map(entry => entry.id)
            .slice(0, 6);
    }

    function inferAiEntityFamilies(config = {}) {
        const families = new Set();

        if (config.sourceType === 'deck') {
            families.add('facility');
            families.add('deck');
        } else if (config.sourceType === 'show') {
            families.add('show');
            families.add('venue');
        } else if (config.sourceType === 'playbook') {
            families.add((config.sourceDetailType || 'general') === 'general' ? 'playbook' : 'service');
        } else if (config.sourceType === 'schedule') {
            families.add('schedule');
            families.add('timing');
        } else {
            families.add('static');
        }

        (Array.isArray(config.capabilityTags) ? config.capabilityTags : []).forEach(capabilityId => {
            families.add(capabilityId);
        });

        return Array.from(families).slice(0, 6);
    }

    function inferAiAnswerIntent(normalizedQuery = '', coverageHints = []) {
        if (coverageHints.includes('comparison') || hasQueryHint(normalizedQuery, ['比較', '還是', '要不要', '值不值得'])) {
            return 'comparison';
        }
        if (coverageHints.includes('all-processes')) {
            return 'process';
        }
        if (coverageHints.includes('inventory') || coverageHints.includes('all-details')) {
            return 'inventory';
        }
        return 'answer';
    }

    function detectAiRequiredCapabilities(normalizedQuery = '', context = {}) {
        const required = new Set();
        const normalized = normalizeSearchText(normalizedQuery);
        const seedTerms = uniqueItems([
            ...(context.literalAnchors || []),
            ...(context.canonicalEntities || [])
        ])
            .map(term => normalizeSearchText(term))
            .filter(Boolean);

        aiQueryTaxonomy.capabilityProfiles.forEach(entry => {
            if (entry.normalizedTerms.some(term => normalized.includes(term))) {
                required.add(entry.id);
                return;
            }
            if (entry.normalizedTerms.some(term => seedTerms.includes(term))) {
                required.add(entry.id);
            }
        });

        return Array.from(required).slice(0, 4);
    }

    function detectAiDisallowedCategories(normalizedQuery = '', requiredCapabilities = []) {
        const disallowed = new Set();
        requiredCapabilities.forEach(capabilityId => {
            const capability = getTaxonomyCapabilityEntry(capabilityId);
            (capability?.disallowedCategories || []).forEach(categoryLabel => disallowed.add(categoryLabel));
        });

        if (hasQueryHint(normalizedQuery, ['不要', '排除', '扣掉'])) {
            if (hasQueryHint(normalizedQuery, ['劇院', 'theatre', 'show', 'shows'])) {
                disallowed.add('表演');
            }
            if (hasQueryHint(normalizedQuery, ['商店', 'shop', 'shopping'])) {
                disallowed.add('商店');
            }
        }

        return Array.from(disallowed).slice(0, 8);
    }

    function resultMatchesCapability(result, capabilityId) {
        if (!result || !capabilityId) return false;
        const capability = getTaxonomyCapabilityEntry(capabilityId);
        if (!capability) return false;

        if ((result.capabilityTags || []).includes(capability.id)) {
            return true;
        }

        if ((result.categoryFamilies || []).some(label => getCapabilitySignalCategoryFamilies(capability).includes(label))) {
            return true;
        }

        if (Array.isArray(result.canonicalEntityIds) && result.canonicalEntityIds.length) {
            return false;
        }

        const sourceText = result.normalizedCombined || normalizeSearchText([
            result.title,
            result.text,
            result.structuredText,
            ...(result.keywords || [])
        ].join(' '));

        return capability.normalizedTerms.some(term => sourceText.includes(term));
    }

    function resultMatchesRequiredCapability(result, requiredCapabilities = []) {
        return (Array.isArray(requiredCapabilities) ? requiredCapabilities : []).some(capabilityId =>
            resultMatchesCapability(result, capabilityId)
        );
    }

    function resultMatchesDisallowedCategory(result, disallowedCategories = []) {
        return (Array.isArray(disallowedCategories) ? disallowedCategories : []).some(categoryLabel =>
            resultMatchesCategory(result, categoryLabel)
        );
    }

    function inferAiCategoryFamilies(config = {}) {
        const normalized = normalizeSearchText([
            config.title,
            config.text,
            config.structuredText,
            config.locationLabel,
            config.groupLabel,
            ...(Array.isArray(config.keywords) ? config.keywords : [])
        ].filter(Boolean).join(' '));
        const categories = new Set();

        aiQueryTaxonomy.categoryFamilies.forEach(entry => {
            const matched = uniqueItems([entry.label, ...entry.terms, ...entry.keywords])
                .map(term => normalizeSearchText(term))
                .filter(Boolean)
                .some(term => normalized.includes(term));
            if (matched) {
                categories.add(entry.label);
            }
        });

        if (config.sourceType === 'show') {
            categories.add('表演');
            categories.add('場館');
        }
        if (config.sourceType === 'deck') {
            categories.add('場館');
        }
        if (config.sourceType === 'schedule') {
            categories.add('時間脈絡');
        }
        if (config.sourceType === 'playbook') {
            categories.add('服務');
            if ((config.sourceDetailType || 'general') === 'concierge') {
                categories.add('酒廊');
            }
        }
        if (!categories.size && config.sourceType === 'static') {
            categories.add('場館');
        }

        return Array.from(categories).slice(0, 6);
    }

    function joinSearchTextParts(parts = []) {
        return parts
            .map(part => compactSearchText(part))
            .filter(Boolean)
            .join(' ');
    }

    function buildStructuredSearchText(pairs = []) {
        return pairs
            .map(([label, value]) => {
                const normalizedValue = compactSearchText(value);
                return normalizedValue ? `${label}：${normalizedValue}` : '';
            })
            .filter(Boolean)
            .join(' ');
    }

    function extractStructuredSearchPairs(text) {
        const normalized = String(text || '')
            .replace(/\r\n/g, '\n')
            .replace(/\u3000/g, ' ')
            .trim();

        if (!normalized) return [];

        const pairs = [];
        const seen = new Set();
        const segments = normalized
            .split(/\n|；|;/)
            .map(segment => segment.trim())
            .filter(Boolean);

        segments.forEach(segment => {
            const match = segment.match(/^([^:：]{1,24})\s*[:：]\s*(.+)$/);
            if (!match) return;

            const label = compactSearchText(match[1]);
            const value = compactSearchText(match[2]);
            if (!label || !value) return;

            const key = `${label}::${value}`;
            if (seen.has(key)) return;
            seen.add(key);
            pairs.push([label, value]);
        });

        return pairs;
    }

    function getAiFieldLabel(fieldType) {
        const labels = {
            parent: '完整卡片',
            time: '時間 / 時段',
            tag: '活動標籤',
            desc: '行程重點',
            summary: '重點摘要',
            bestTime: '最佳時機',
            tripUse: '這趟怎麼用',
            theme: '亮點',
            timingTip: '時機提醒',
            tripLink: '旅程連結',
            whenToUse: '適用時機',
            action: '建議做法',
            tripFit: '這趟為什麼適合',
            caution: '注意事項'
        };

        return labels[fieldType] || '內容重點';
    }

    function getAiSourceDetailLabel(sourceDetailType) {
        const labels = {
            'provided-document': '附件更新',
            official: '官方規則',
            concierge: '禮賓加值',
            community: '社群實戰',
            general: '站內整理'
        };

        return labels[sourceDetailType] || '站內整理';
    }

    function toCoverageAnchorKey(value, fallback = '') {
        const normalized = normalizeSearchText(value || '');
        if (!normalized) return fallback;
        return normalized
            .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, ' ')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || fallback;
    }

    function inferCoverageAnchorKeys(config = {}) {
        const normalized = normalizeSearchText([
            config.title,
            config.text,
            config.structuredText,
            Array.isArray(config.keywords) ? config.keywords.join(' ') : '',
            config.locationLabel,
            config.groupLabel
        ].filter(Boolean).join(' '));
        const hasTheatre = hasQueryHint(normalized, ['walt disney theatre', '劇院', 'theatre', 'theater', '主秀', '看秀']);
        const hasLounge = hasQueryHint(normalized, ['concierge lounge', '禮賓酒廊', 'lounge', 'concierge', '酒廊']);
        const hasRoomService = hasQueryHint(normalized, ['room service', '客房服務', '房務']);
        const hasOpenHouse = hasQueryHint(normalized, ['open house', 'oceaneer', 'kids club', '兒童俱樂部']);

        let entityKey = '';
        let venueKey = '';
        let seriesKey = '';
        let sourceClusterKey = '';

        if (hasTheatre) {
            entityKey = 'walt-disney-theatre';
            venueKey = 'walt-disney-theatre';
            sourceClusterKey = 'theatre-experience';
        } else if (hasLounge) {
            entityKey = 'concierge-lounge';
            venueKey = 'concierge-lounge';
            sourceClusterKey = 'concierge-service';
        } else if (hasRoomService) {
            entityKey = 'room-service';
            sourceClusterKey = 'room-service';
        } else if (hasOpenHouse) {
            entityKey = 'open-house';
            sourceClusterKey = 'kids-club';
        }

        if (config.sourceType === 'show') {
            seriesKey = config.seriesKey || (venueKey ? `${venueKey}-shows` : toCoverageAnchorKey(config.groupLabel || config.locationLabel || config.title, 'show-series'));
        } else if (config.sourceType === 'playbook' && venueKey === 'walt-disney-theatre') {
            seriesKey = config.seriesKey || 'walt-disney-theatre-support';
        } else if (config.sourceType === 'deck' && venueKey === 'walt-disney-theatre') {
            seriesKey = config.seriesKey || 'walt-disney-theatre-venue';
        }

        if (!entityKey) {
            entityKey = config.entityKey || toCoverageAnchorKey(config.title || config.groupLabel || config.locationLabel, toCoverageAnchorKey(config.sourceType || 'topic', 'topic'));
        }
        if (!venueKey) {
            venueKey = config.venueKey || '';
        }
        if (!seriesKey) {
            seriesKey = config.seriesKey || '';
        }
        if (!sourceClusterKey) {
            sourceClusterKey = config.sourceClusterKey || venueKey || entityKey || toCoverageAnchorKey(config.groupLabel || config.title, 'topic-cluster');
        }

        return {
            entityKey,
            venueKey,
            seriesKey,
            sourceClusterKey
        };
    }

    function createSearchDocumentBase(config) {
        const id = config.id;
        const seedKeywords = Array.isArray(config.keywords) ? uniqueItems(config.keywords.filter(Boolean)) : [];
        const text = joinSearchTextParts([config.text]);
        const structuredText = joinSearchTextParts([config.structuredText || text]);
        const entityRefs = resolveEntityRefs({
            ...config,
            text,
            structuredText,
            keywords: seedKeywords
        });
        const supportForEntityRefs = sanitizeEntityRefArray(config.supportForEntityRefs, 10);
        const registryProperNounTokens = collectEntityRegistryProperNounTokens(entityRefs);
        const registryAliasTokens = collectEntityRegistryAliasTokens(entityRefs);
        const keywords = uniqueItems([
            ...(Array.isArray(config.keywordHints) ? config.keywordHints : []),
            ...seedKeywords,
            ...registryProperNounTokens,
            ...registryAliasTokens
        ]).slice(0, 24);
        const registryCategoryFamilies = collectEntityRegistryCategoryFamilies(entityRefs);
        const categoryFamilies = inferAiCategoryFamilies({
            ...config,
            text,
            structuredText,
            keywords
        });
        const mergedCategoryFamilies = uniqueItems(
            registryCategoryFamilies.length
                ? [
                    ...registryCategoryFamilies,
                    ...categoryFamilies.filter(label => registryCategoryFamilies.includes(label) || label === '時間脈絡')
                ]
                : categoryFamilies
        ).slice(0, 8);
        const registryCapabilityTags = collectEntityRegistryCapabilityTags(entityRefs);
        const capabilityTags = inferAiCapabilityTags({
            ...config,
            text,
            structuredText,
            keywords,
            categoryFamilies: mergedCategoryFamilies
        });
        const mergedCapabilityTags = uniqueItems(
            registryCapabilityTags.length
                ? [
                    ...registryCapabilityTags,
                    ...capabilityTags.filter(capabilityId => registryCapabilityTags.includes(capabilityId))
                ]
                : capabilityTags
        ).slice(0, 8);
        const registryEntityFamilies = collectEntityRegistryEntityFamilies(entityRefs);
        const entityFamilies = inferAiEntityFamilies({
            ...config,
            categoryFamilies: mergedCategoryFamilies,
            capabilityTags: mergedCapabilityTags
        });
        const mergedEntityFamilies = uniqueItems([
            ...entityFamilies,
            ...registryEntityFamilies
        ]).slice(0, 8);
        const anchorKeys = inferCoverageAnchorKeys({
            ...config,
            text,
            structuredText,
            keywords
        });
        const normalizedLocationLabel = compactSearchText(config.locationLabel);
        const themeEntityId = entityRefs[0] || config.entityKey || anchorKeys.entityKey || (config.parentId || id);
        const entityBreadth = Math.max(1, entityRefs.length || 0);
        const isSupportLike = ['schedule', 'static'].includes(config.sourceType)
            || compactSearchText(config.contentRole) === 'support';
        const anchorStrength = themeEntityId && entityRefs[0] === themeEntityId ? 2 : 1;

        return {
            id,
            parentId: config.parentId || id,
            sourceType: config.sourceType,
            sourceDetailType: config.sourceDetailType || 'general',
            sectionId: config.sectionId,
            groupLabel: config.groupLabel,
            title: config.title,
            text,
            structuredText,
            keywords,
            locationLabel: config.locationLabel,
            navTarget: config.navTarget,
            fieldType: config.fieldType || 'parent',
            fieldLabel: config.fieldLabel || getAiFieldLabel(config.fieldType || 'parent'),
            timeHint: compactSearchText(config.timeHint),
            bestTimeHint: compactSearchText(config.bestTimeHint),
            normalizedLocationLabel,
            categoryFamilies: mergedCategoryFamilies,
            capabilityTags: mergedCapabilityTags,
            entityFamilies: mergedEntityFamilies,
            canonicalEntityIds: entityRefs,
            properNounTokens: registryProperNounTokens,
            aliasTokens: registryAliasTokens,
            supportOfEntityIds: supportForEntityRefs,
            supportOfParentIds: Array.isArray(config.supportOfParentIds) ? uniqueItems(config.supportOfParentIds.filter(Boolean)).slice(0, 10) : [],
            evidenceRoleHints: Array.isArray(config.evidenceRoleHints) ? config.evidenceRoleHints.filter(Boolean) : [],
            entityKey: config.entityKey || entityRefs[0] || anchorKeys.entityKey,
            venueKey: config.venueKey || anchorKeys.venueKey,
            seriesKey: config.seriesKey || anchorKeys.seriesKey,
            sourceClusterKey: config.sourceClusterKey || anchorKeys.sourceClusterKey,
            contentRole: compactSearchText(config.contentRole) || (supportForEntityRefs.length ? 'support' : 'primary'),
            dedupeKey: `${config.sourceType || 'content'}:${config.parentId || id}`,
            themeEntityId,
            isSupportLike,
            anchorStrength,
            entityBreadth,
            aiOnly: Boolean(config.aiOnly)
        };
    }

    function createAiFieldDocument(parentDoc, fieldType, fieldValue, options = {}) {
        const normalizedValue = compactSearchText(fieldValue);
        if (!normalizedValue) return null;

        const fieldLabel = options.fieldLabel || getAiFieldLabel(fieldType);
        return createSearchDocumentBase({
            ...parentDoc,
            id: `${parentDoc.id}::${fieldType}`,
            parentId: parentDoc.parentId || parentDoc.id,
            text: normalizedValue,
            entityRefs: parentDoc.canonicalEntityIds || [],
            supportForEntityRefs: parentDoc.supportOfEntityIds || [],
            contentRole: parentDoc.contentRole || 'primary',
            structuredText: buildStructuredSearchText([
                ['主題', parentDoc.title],
                [fieldLabel, normalizedValue],
                ...(options.extraStructuredPairs || [])
            ]),
            keywords: uniqueItems([
                ...(parentDoc.keywords || []),
                fieldLabel,
                ...(options.keywords || []),
                ...deriveContextualKeywords(`${parentDoc.title} ${normalizedValue}`)
            ]),
            fieldType,
            fieldLabel,
            aiOnly: true,
            evidenceRoleHints: options.evidenceRoleHints || [],
            timeHint: options.timeHint || parentDoc.timeHint || '',
            bestTimeHint: options.bestTimeHint || parentDoc.bestTimeHint || ''
        });
    }

    function buildScheduleSearchDocuments() {
        return cruiseSchedule.flatMap(dayData =>
            dayData.periods.flatMap((period, periodIndex) =>
                period.events.flatMap((event, eventIndex) => {
                    const eventId = getScheduleEventId(dayData.id, periodIndex, eventIndex);
                    const binding = getAiEntityBinding('scheduleEvents', event.bindingKey || `${dayData.id}:${periodIndex}:${eventIndex}`);
                    const locationLabel = `${dayData.tabTitle} · ${period.name}`;
                    const navTarget = {
                        type: 'schedule',
                        dayId: dayData.id,
                        itemId: eventId
                    };
                    const parentDoc = createSearchDocumentBase({
                        id: eventId,
                        sourceType: 'schedule',
                        sourceDetailType: 'general',
                        sectionId: 'schedule',
                        groupLabel: '行程',
                        title: event.title,
                        text: joinSearchTextParts([event.tag, period.name, event.desc]),
                        structuredText: buildStructuredSearchText([
                            ['日期', dayData.tabTitle],
                            ['時段', period.name],
                            ['標籤', event.tag],
                            ['重點', event.desc]
                        ]),
                        keywords: [dayData.tabTitle, dayData.dateTitle, period.name, event.tag, event.title],
                        entityRefs: binding?.entityRefs || [],
                        supportForEntityRefs: binding?.supportForEntityRefs || [],
                        keywordHints: binding?.keywordHints || [],
                        contentRole: binding?.contentRole || 'support',
                        locationLabel,
                        navTarget,
                        fieldType: 'parent',
                        fieldLabel: getAiFieldLabel('parent'),
                        timeHint: `${dayData.tabTitle} ${period.name}`,
                        evidenceRoleHints: ['primary-answer', 'context-day']
                    });

                    const childDocs = [
                        createAiFieldDocument(parentDoc, 'time', `${dayData.tabTitle} ${period.name}`, {
                            keywords: [dayData.dateTitle, period.name],
                            evidenceRoleHints: ['context-day']
                        }),
                        createAiFieldDocument(parentDoc, 'tag', event.tag, {
                            keywords: [event.title],
                            evidenceRoleHints: ['primary-answer']
                        }),
                        createAiFieldDocument(parentDoc, 'desc', event.desc, {
                            keywords: [event.title, event.tag],
                            evidenceRoleHints: ['primary-answer', 'sop-action', 'context-day']
                        })
                    ].filter(Boolean);

                    return [parentDoc, ...childDocs];
                })
            )
        );
    }

    function buildDeckSearchDocuments() {
        return deckGuideData.flatMap(deck =>
            deck.facilities.flatMap((facility, facilityIndex) => {
                const facilityId = getDeckFacilityId(deck.id, facilityIndex);
                const binding = getAiEntityBinding('deckFacilities', facility.bindingKey || `${deck.id}:${facilityIndex}`);
                const locationLabel = `${deck.label} · ${deck.title}`;
                const normalizedFacility = normalizeSearchText([facility.name, facility.summary, facility.tripUse, deck.title, deck.theme].join(' '));
                const isTheatreFacility = hasQueryHint(normalizedFacility, ['walt disney theatre', '劇院', 'theatre', '主秀']);
                const navTarget = {
                    type: 'deck',
                    tabId: deck.id,
                    itemId: facilityId
                };
                const parentDoc = createSearchDocumentBase({
                    id: facilityId,
                    sourceType: 'deck',
                    sourceDetailType: 'general',
                    sectionId: 'deck-guide',
                    groupLabel: '甲板與表演',
                    title: facility.name,
                    text: joinSearchTextParts([facility.summary, facility.bestTime, facility.tripUse]),
                    structuredText: buildStructuredSearchText([
                        ['甲板', deck.label],
                        ['區域', deck.title],
                        ['重點摘要', facility.summary],
                        ['最佳時機', facility.bestTime],
                        ['這趟怎麼用', facility.tripUse]
                    ]),
                    keywords: [deck.label, deck.title, deck.theme, deck.tripFocus, ...deck.badges],
                    entityRefs: binding?.entityRefs || [],
                    supportForEntityRefs: binding?.supportForEntityRefs || [],
                    keywordHints: binding?.keywordHints || [],
                    contentRole: binding?.contentRole || 'primary',
                    locationLabel,
                    navTarget,
                    fieldType: 'parent',
                    bestTimeHint: facility.bestTime,
                    entityKey: isTheatreFacility ? 'walt-disney-theatre' : '',
                    venueKey: isTheatreFacility ? 'walt-disney-theatre' : '',
                    seriesKey: isTheatreFacility ? 'walt-disney-theatre-venue' : '',
                    sourceClusterKey: isTheatreFacility ? 'theatre-experience' : '',
                    evidenceRoleHints: ['primary-answer']
                });

                const childDocs = [
                    createAiFieldDocument(parentDoc, 'summary', facility.summary, {
                        keywords: [deck.theme, deck.tripFocus],
                        evidenceRoleHints: ['primary-answer']
                    }),
                    createAiFieldDocument(parentDoc, 'bestTime', facility.bestTime, {
                        keywords: [deck.label],
                        evidenceRoleHints: ['context-day', 'caution-exception'],
                        bestTimeHint: facility.bestTime
                    }),
                    createAiFieldDocument(parentDoc, 'tripUse', facility.tripUse, {
                        keywords: [deck.tripFocus, ...deck.badges],
                        evidenceRoleHints: ['sop-action', 'why-this-works']
                    })
                ].filter(Boolean);

                return [parentDoc, ...childDocs];
            })
        );
    }

    function buildShowSearchDocuments() {
        return showGuideData.flatMap(category =>
            category.shows.flatMap((show, showIndex) => {
                const showId = getShowItemId(category.id, showIndex);
                const binding = getAiEntityBinding('shows', show.bindingKey || `${category.id}:${showIndex}`);
                const locationLabel = `表演精華 · ${category.title}`;
                const normalizedShow = normalizeSearchText([show.name, show.location, show.theme, category.title, category.intro].join(' '));
                const isTheatreShow = hasQueryHint(normalizedShow, ['walt disney theatre', '劇院', 'theatre', '主秀']);
                const navTarget = {
                    type: 'show',
                    tabId: 'shows',
                    itemId: showId
                };
                const parentDoc = createSearchDocumentBase({
                    id: showId,
                    sourceType: 'show',
                    sourceDetailType: 'general',
                    sectionId: 'deck-guide',
                    groupLabel: '甲板與表演',
                    title: show.name,
                    text: joinSearchTextParts([show.theme, show.location, show.timingTip, show.tripLink, category.intro]),
                    structuredText: buildStructuredSearchText([
                        ['表演分類', category.title],
                        ['亮點', show.theme],
                        ['位置', show.location],
                        ['時機提醒', show.timingTip],
                        ['旅程連結', show.tripLink]
                    ]),
                    keywords: [category.title, category.intro, show.location, show.tripLink],
                    entityRefs: binding?.entityRefs || [],
                    supportForEntityRefs: binding?.supportForEntityRefs || [],
                    keywordHints: binding?.keywordHints || [],
                    contentRole: binding?.contentRole || 'primary',
                    locationLabel,
                    navTarget,
                    fieldType: 'parent',
                    bestTimeHint: show.timingTip,
                    entityKey: isTheatreShow ? 'walt-disney-theatre' : '',
                    venueKey: isTheatreShow ? 'walt-disney-theatre' : '',
                    seriesKey: isTheatreShow ? 'walt-disney-theatre-shows' : '',
                    sourceClusterKey: isTheatreShow ? 'theatre-experience' : '',
                    evidenceRoleHints: ['primary-answer']
                });

                const childDocs = [
                    createAiFieldDocument(parentDoc, 'theme', show.theme, {
                        keywords: [show.location, category.title],
                        evidenceRoleHints: ['primary-answer']
                    }),
                    createAiFieldDocument(parentDoc, 'timingTip', show.timingTip, {
                        keywords: [show.location, category.title],
                        evidenceRoleHints: ['context-day', 'caution-exception'],
                        bestTimeHint: show.timingTip
                    }),
                    createAiFieldDocument(parentDoc, 'tripLink', show.tripLink, {
                        keywords: [category.title, category.intro],
                        evidenceRoleHints: ['sop-action', 'why-this-works']
                    })
                ].filter(Boolean);

                return [parentDoc, ...childDocs];
            })
        );
    }

    function buildPlaybookSearchDocuments() {
        return playbookGuideData.flatMap(mission =>
            mission.items.map((item, itemIndex) => {
                const itemId = getPlaybookItemId(mission.id, itemIndex);
                const binding = getAiEntityBinding('playbookItems', item.bindingKey || `${mission.id}:${itemIndex}`);
                const locationLabel = `攻略本 · ${mission.label}`;
                const normalizedPlaybook = normalizeSearchText([item.title, item.whenToUse, item.action, item.tripFit, item.caution, mission.label].join(' '));
                const isTheatrePlaybook = hasQueryHint(normalizedPlaybook, ['walt disney theatre', '劇院', 'theatre', '主秀', '優先入場', '看秀']);
                const isLoungePlaybook = hasQueryHint(normalizedPlaybook, ['lounge', 'concierge', '禮賓', '酒廊']);
                const navTarget = {
                    type: 'playbook',
                    missionId: mission.id,
                    itemId
                };
                const combinedText = joinSearchTextParts([item.title, item.whenToUse, item.action, item.tripFit, item.caution]);
                const parentDoc = createSearchDocumentBase({
                    id: itemId,
                    sourceType: 'playbook',
                    sourceDetailType: item.sourceType || 'general',
                    sectionId: 'playbook',
                    groupLabel: '攻略本',
                    title: item.title,
                    text: joinSearchTextParts([item.whenToUse, item.action, item.tripFit, item.caution]),
                    structuredText: buildStructuredSearchText([
                        ['任務', mission.label],
                        ['來源層級', getAiSourceDetailLabel(item.sourceType || 'general')],
                        ['適用時機', item.whenToUse],
                        ['建議做法', item.action],
                        ['這趟為什麼適合', item.tripFit],
                        ['注意事項', item.caution]
                    ]),
                    keywords: [mission.label, mission.intro, item.sourceType, ...deriveContextualKeywords(combinedText)],
                    entityRefs: binding?.entityRefs || [],
                    supportForEntityRefs: binding?.supportForEntityRefs || [],
                    keywordHints: binding?.keywordHints || [],
                    contentRole: binding?.contentRole || 'primary',
                    locationLabel,
                    navTarget,
                    fieldType: 'parent',
                    timeHint: item.whenToUse,
                    entityKey: isTheatrePlaybook
                        ? 'walt-disney-theatre'
                        : (isLoungePlaybook ? 'concierge-lounge' : ''),
                    venueKey: isTheatrePlaybook
                        ? 'walt-disney-theatre'
                        : (isLoungePlaybook ? 'concierge-lounge' : ''),
                    seriesKey: isTheatrePlaybook ? 'walt-disney-theatre-support' : '',
                    sourceClusterKey: isTheatrePlaybook
                        ? 'theatre-experience'
                        : (isLoungePlaybook ? 'concierge-service' : ''),
                    evidenceRoleHints: ['primary-answer']
                });

                const childDocs = [
                    createAiFieldDocument(parentDoc, 'whenToUse', item.whenToUse, {
                        keywords: [mission.label, mission.intro],
                        evidenceRoleHints: ['context-day'],
                        timeHint: item.whenToUse
                    }),
                    createAiFieldDocument(parentDoc, 'action', item.action, {
                        keywords: [mission.label, mission.intro, item.sourceType],
                        evidenceRoleHints: ['primary-answer', 'sop-action']
                    }),
                    createAiFieldDocument(parentDoc, 'tripFit', item.tripFit, {
                        keywords: [mission.label, mission.intro],
                        evidenceRoleHints: ['why-this-works']
                    }),
                    createAiFieldDocument(parentDoc, 'caution', item.caution, {
                        keywords: [mission.label, mission.intro, item.sourceType],
                        evidenceRoleHints: ['caution-exception']
                    })
                ].filter(Boolean);

                return [parentDoc, ...childDocs];
            }).flat()
        );
    }

    function buildStaticSearchDocuments() {
        return (window.TRAVEL_REFERENCE_DATA?.records || []).map(record => {
            const sectionLabel = getSectionLabel(record.sectionId);
            const text = compactSearchText(record.title + ' ' + record.bodyHtml);
            return {
                id: record.id, parentId: record.id, sourceType: 'static', sourceDetailType: 'general',
                sectionId: record.sectionId, groupLabel: '其他資訊', title: record.title,
                text, structuredText: text, keywords: [sectionLabel, record.title],
                locationLabel: sectionLabel, navTarget: { type: 'static', itemId: record.id },
                fieldType: 'parent', fieldLabel: getAiFieldLabel('parent'),
                timeHint: '', bestTimeHint: '', evidenceRoleHints: [], aiOnly: false
            };
        });
    }

    function prepareSearchDocuments() {
        const docs = [
            ...buildScheduleSearchDocuments(),
            ...buildDeckSearchDocuments(),
            ...buildShowSearchDocuments(),
            ...buildPlaybookSearchDocuments(),
            ...buildStaticSearchDocuments()
        ];
        const baseDocuments = docs.map(doc => {
            const normalizedTitle = normalizeSearchText(doc.title);
            const normalizedText = normalizeSearchText(doc.text);
            const normalizedStructuredText = normalizeSearchText(doc.structuredText || doc.text);
            const normalizedKeywords = normalizeSearchText(doc.keywords.join(' '));
            const normalizedProperNouns = normalizeSearchText((doc.properNounTokens || []).join(' '));
            const normalizedAliases = normalizeSearchText((doc.aliasTokens || []).join(' '));
            const normalizedCategories = normalizeSearchText((doc.categoryFamilies || []).join(' '));
            const normalizedCapabilities = normalizeSearchText((doc.capabilityTags || []).join(' '));
            const normalizedEntityFamilies = normalizeSearchText((doc.entityFamilies || []).join(' '));
            const normalizedEntityRefs = normalizeSearchText((doc.canonicalEntityIds || []).join(' '));
            return {
                ...doc,
                normalizedTitle,
                normalizedText,
                normalizedStructuredText,
                normalizedKeywords,
                normalizedProperNouns,
                normalizedAliases,
                normalizedCategories,
                normalizedCapabilities,
                normalizedEntityFamilies,
                normalizedEntityRefs,
                normalizedCombined: uniqueItems([
                    normalizedTitle,
                    normalizedKeywords,
                    normalizedProperNouns,
                    normalizedAliases,
                    normalizedText,
                    normalizedStructuredText,
                    normalizedCategories,
                    normalizedCapabilities,
                    normalizedEntityFamilies,
                    normalizedEntityRefs
                ].filter(Boolean)).join(' ')
            };
        });

        const primaryParents = baseDocuments.filter(doc =>
            (doc.fieldType || 'parent') === 'parent'
            && !['schedule', 'static'].includes(doc.sourceType)
        );
        const parentIdsByEntity = new Map();

        primaryParents.forEach(doc => {
            (doc.canonicalEntityIds || []).forEach(entityId => {
                if (!parentIdsByEntity.has(entityId)) {
                    parentIdsByEntity.set(entityId, new Set());
                }
                parentIdsByEntity.get(entityId).add(doc.parentId || doc.id);
            });
        });

        searchState.documents = baseDocuments.map(doc => {
            const explicitSupportParents = uniqueItems((doc.supportOfEntityIds || [])
                .flatMap(entityId => Array.from(parentIdsByEntity.get(entityId) || [])));
            const inferredSupportParents = ['schedule', 'static'].includes(doc.sourceType)
                ? uniqueItems(primaryParents
                    .filter(parentDoc => {
                        const sharedAnchor = [
                            doc.entityKey,
                            doc.venueKey,
                            doc.seriesKey,
                            doc.sourceClusterKey
                        ].filter(Boolean).some(anchor =>
                            [parentDoc.entityKey, parentDoc.venueKey, parentDoc.seriesKey, parentDoc.sourceClusterKey].includes(anchor)
                        );
                        const sharedCapability = (doc.capabilityTags || []).some(capabilityId =>
                            (parentDoc.capabilityTags || []).includes(capabilityId)
                        );
                        const sharedCategory = (doc.categoryFamilies || []).some(categoryLabel =>
                            (parentDoc.categoryFamilies || []).includes(categoryLabel)
                        );
                        return sharedAnchor || sharedCapability || sharedCategory;
                    })
                    .map(parentDoc => parentDoc.parentId || parentDoc.id))
                    .slice(0, 10)
                : (doc.supportOfParentIds || []).slice(0, 10);
            const supportOfParentIds = uniqueItems([
                ...explicitSupportParents,
                ...inferredSupportParents
            ]).slice(0, 12);

            return {
                ...doc,
                supportOfParentIds,
                normalizedSupportParents: normalizeSearchText(supportOfParentIds.join(' '))
            };
        });

        prepareLookupRecords();
    }

    function createLookupRecord(config = {}) {
        const englishName = compactSearchText(config.englishName);
        const zhLabel = compactSearchText(config.zhLabel);
        if (!englishName || !zhLabel) return null;

        const category = compactSearchText(config.category) || 'activity';
        const aliases = sanitizeSearchTextArray(config.aliases, 18, 140);
        const deckHint = compactSearchText(config.deckHint);
        const venueEnglish = compactSearchText(config.venueEnglish);
        const crewPhrase = compactSearchText(config.crewPhrase) || 'Could you help us find this?';
        const sourceType = ['entity', 'onboard-activity', 'menu-item'].includes(config.sourceType)
            ? config.sourceType
            : 'onboard-activity';
        const restaurantId = compactSearchText(config.restaurantId);
        const restaurantLabel = compactSearchText(config.restaurantLabel);
        const restaurantEnglish = compactSearchText(config.restaurantEnglish);
        const restaurantGroup = compactSearchText(config.restaurantGroup);
        const restaurantGroupLabel = compactSearchText(config.restaurantGroupLabel);
        const menuCategory = compactSearchText(config.menuCategory);
        const menuCategoryLabel = compactSearchText(config.menuCategoryLabel);
        const courseGroup = compactSearchText(config.courseGroup);
        const courseGroupLabel = compactSearchText(config.courseGroupLabel);
        const descriptionZh = compactSearchText(config.descriptionZh);
        const restaurantOrder = Number.isFinite(config.restaurantOrder) ? config.restaurantOrder : 999;
        const sourceRecordIndex = Number.isFinite(config.sourceRecordIndex) ? config.sourceRecordIndex : 0;
        const price = compactSearchText(config.price);
        const tags = sanitizeSearchTextArray(config.tags, 12, 80).map(tag => tag.toLowerCase());
        const tagLabels = sanitizeSearchTextArray(config.tagLabels, 12, 80);
        const categoryHints = getCategorySearchHints(category);
        const searchText = buildLookupSearchText([
            englishName,
            zhLabel,
            venueEnglish,
            deckHint,
            restaurantId,
            restaurantLabel,
            restaurantEnglish,
            restaurantGroup,
            restaurantGroupLabel,
            menuCategory,
            menuCategoryLabel,
            courseGroup,
            courseGroupLabel,
            descriptionZh,
            price,
            crewPhrase,
            config.searchText,
            getLookupCategoryLabel(category),
            ...(config.categoryAliases || []),
            ...categoryHints,
            ...tags,
            ...tagLabels,
            ...aliases
        ]);

        return {
            id: compactSearchText(config.id) || `lookup-${simpleHash(`${englishName}-${zhLabel}`)}`,
            sourceType,
            category,
            zhLabel,
            englishName,
            venueEnglish,
            deckHint,
            restaurantId,
            restaurantLabel,
            restaurantEnglish,
            restaurantGroup,
            restaurantGroupLabel,
            menuCategory,
            menuCategoryLabel,
            courseGroup,
            courseGroupLabel,
            descriptionZh,
            restaurantOrder,
            sourceRecordIndex,
            price,
            tags,
            tagLabels,
            aliases,
            crewPhrase,
            sourceDayLabel: compactSearchText(config.sourceDayLabel),
            sourceTimeHint: compactSearchText(config.sourceTimeHint),
            searchText,
            normalizedEnglishName: normalizeSearchText(englishName),
            normalizedZhLabel: normalizeSearchText(zhLabel),
            normalizedVenueEnglish: normalizeSearchText(venueEnglish),
            normalizedDeckHint: normalizeSearchText(deckHint),
            normalizedRestaurant: normalizeSearchText([restaurantId, restaurantLabel, restaurantEnglish, restaurantGroupLabel].join(' ')),
            normalizedMenuCategory: normalizeSearchText([menuCategory, menuCategoryLabel, courseGroup, courseGroupLabel, ...tags, ...tagLabels].join(' ')),
            normalizedDescriptionZh: normalizeSearchText(descriptionZh)
        };
    }

    function buildEntityLookupRecords() {
        return (aiEntityRegistry.entities || [])
            .map(entry => createLookupRecord({
                id: `entity-${entry.entityId}`,
                sourceType: 'entity',
                category: getEntityLookupCategory(entry),
                zhLabel: entry.displayNameZh,
                englishName: entry.officialNameEn,
                venueEnglish: entry.area,
                deckHint: (entry.deckHints || []).join(' / '),
                aliases: [
                    entry.officialNameZh,
                    ...(entry.aliases || []),
                    ...(entry.categoryFamilies || []),
                    ...(entry.capabilityTags || [])
                ],
                categoryAliases: [entry.entityType],
                crewPhrase: 'Could you help us find this?'
            }))
            .filter(Boolean);
    }

    function buildOnboardActivityLookupRecords() {
        const rawRecords = Array.isArray(window.ONBOARD_LOOKUP_DATA?.records)
            ? window.ONBOARD_LOOKUP_DATA.records
            : [];

        return rawRecords
            .map(record => {
                const category = getOnboardLookupCategory(record.category);
                return createLookupRecord({
                    id: record.id ? `activity-${record.id}` : '',
                    sourceType: 'onboard-activity',
                    category,
                    zhLabel: record.zhLabel,
                    englishName: record.englishName,
                    venueEnglish: record.venueEnglish,
                    deckHint: record.deckHint,
                    aliases: [
                        ...(Array.isArray(record.aliases) ? record.aliases : []),
                        record.sourceDayLabel,
                        record.sourceTimeHint
                    ],
                    categoryAliases: [record.category],
                    crewPhrase: record.crewPhrase || 'Where is this activity?',
                    sourceDayLabel: record.sourceDayLabel,
                    sourceTimeHint: record.sourceTimeHint
                });
            })
            .filter(Boolean);
    }

    function buildMenuItemLookupRecords() {
        const rawRecords = Array.isArray(window.MENU_LOOKUP_DATA?.records)
            ? window.MENU_LOOKUP_DATA.records
            : [];

        return rawRecords
            .map(record => createLookupRecord({
                id: record.id ? `menu-${record.id}` : '',
                sourceType: 'menu-item',
                category: 'dining',
                zhLabel: record.zhLabel,
                englishName: record.englishName,
                venueEnglish: record.restaurantEnglish,
                deckHint: record.restaurantLabel,
                restaurantId: record.restaurantId,
                restaurantLabel: record.restaurantLabel,
                restaurantEnglish: record.restaurantEnglish,
                restaurantGroup: record.restaurantGroup,
                restaurantGroupLabel: record.restaurantGroupLabel,
                menuCategory: record.menuCategory,
                menuCategoryLabel: record.menuCategoryLabel,
                courseGroup: record.courseGroup,
                courseGroupLabel: record.courseGroupLabel,
                descriptionZh: record.descriptionZh,
                restaurantOrder: record.restaurantOrder,
                sourceRecordIndex: record.sourceRecordIndex,
                price: record.price,
                tags: record.tags,
                tagLabels: record.tagLabels,
                searchText: record.searchText,
                aliases: [
                    ...(Array.isArray(record.aliases) ? record.aliases : []),
                    ...aiEntityRegistry.entities
                        .filter(entity => normalizeSearchText(entity.officialNameEn) === normalizeSearchText(record.restaurantEnglish || record.restaurantLabel))
                        .flatMap(entity => [entity.displayNameZh, ...entity.aliases]),
                    record.restaurantId,
                    record.restaurantLabel,
                    record.restaurantEnglish,
                    record.restaurantGroup,
                    record.restaurantGroupLabel,
                    record.menuCategory,
                    record.menuCategoryLabel,
                    record.courseGroup,
                    record.courseGroupLabel,
                    record.descriptionZh,
                    record.price
                ],
                categoryAliases: ['menu', '菜單', '餐點', '點餐'],
                crewPhrase: getMenuItemCrewPhrase(record)
            }))
            .filter(Boolean);
    }

    function prepareLookupRecords() {
        searchState.lookupRecords = [
            ...buildEntityLookupRecords(),
            ...buildOnboardActivityLookupRecords(),
            ...buildMenuItemLookupRecords()
        ];
    }

    function lookupCategoryMatches(record, category) {
        if (!category || category === 'all') return true;
        if (record.category === category) return true;
        if (category === 'facility') return ['facility', 'service', 'shop', 'wellness'].includes(record.category);
        if (category === 'activity') return ['activity', 'show', 'kids', 'photo'].includes(record.category) && record.sourceType === 'onboard-activity';
        if (category === 'dining') return record.category === 'dining';
        return false;
    }

    function scoreLookupRecord(record, normalizedQuery, selectedCategory, selectedDiningFilter = 'all', selectedRestaurantFilter = 'all') {
        const categoryMatch = lookupCategoryMatches(record, selectedCategory);
        if (!categoryMatch) return 0;
        if (selectedCategory === 'dining' && !lookupRecordMatchesDiningFilter(record, selectedDiningFilter)) return 0;
        if (selectedCategory === 'dining' && !lookupRecordMatchesRestaurantFilter(record, selectedRestaurantFilter)) return 0;

        if (!normalizedQuery) {
            if (!selectedCategory || selectedCategory === 'all') return 0;
            if (record.sourceType === 'entity') return 30;
            if (record.sourceType === 'menu-item') return (selectedDiningFilter && selectedDiningFilter !== 'all') || (selectedRestaurantFilter && selectedRestaurantFilter !== 'all') ? 26 : 20;
            return 18;
        }

        const queryUnits = normalizedQuery.split(' ').filter(Boolean);
        let score = 0;
        if (record.normalizedEnglishName === normalizedQuery || record.normalizedZhLabel === normalizedQuery) score += 160;
        if (record.normalizedEnglishName.includes(normalizedQuery)) score += 110;
        if (record.normalizedZhLabel.includes(normalizedQuery)) score += 105;
        if (record.normalizedVenueEnglish.includes(normalizedQuery) || record.normalizedDeckHint.includes(normalizedQuery)) score += 76;
        if (record.normalizedRestaurant.includes(normalizedQuery) || record.normalizedMenuCategory.includes(normalizedQuery)) score += 72;
        if (record.normalizedDescriptionZh.includes(normalizedQuery)) score += 46;
        if (record.searchText.includes(normalizedQuery)) score += 68;

        queryUnits.forEach(unit => {
            if (unit.length < 2) return;
            if (record.normalizedEnglishName.includes(unit)) score += 22;
            if (record.normalizedZhLabel.includes(unit)) score += 20;
            if (record.normalizedDescriptionZh.includes(unit)) score += 8;
            if (record.searchText.includes(unit)) score += 12;
        });

        if (score === 0) return 0;
        if (record.sourceType === 'entity') score += 12;
        if (record.sourceType === 'menu-item') score += 10;
        if (selectedCategory && selectedCategory !== 'all') score += 10;
        if (selectedDiningFilter && selectedDiningFilter !== 'all') score += 8;
        if (selectedRestaurantFilter && selectedRestaurantFilter !== 'all') score += 8;
        return score;
    }

    function mergeLookupResults(scoredResults = []) {
        const merged = new Map();
        scoredResults.forEach(result => {
            const key = (result.sourceType === 'menu-item' ? 'menu:' : '') + (normalizeSearchText(result.englishName) || result.id);
            const existing = merged.get(key);
            if (!existing) {
                merged.set(key, {
                    ...result,
                    occurrenceCount: 1,
                    menuVariants: result.sourceType === 'menu-item' ? [result] : [],
                    sampleVenues: uniqueItems([getLookupRecordLocation(result), result.venueEnglish, result.deckHint].filter(Boolean)),
                    sourceHints: uniqueItems([result.sourceDayLabel, result.sourceTimeHint].filter(Boolean))
                });
                return;
            }

            existing.score = Math.max(existing.score, result.score);
            existing.occurrenceCount += 1;
            if (result.sourceType === 'menu-item') existing.menuVariants.push(result);
            existing.sampleVenues = uniqueItems([
                ...(existing.sampleVenues || []),
                getLookupRecordLocation(result),
                result.venueEnglish,
                result.deckHint
            ].filter(Boolean)).slice(0, 4);
            existing.sourceHints = uniqueItems([
                ...(existing.sourceHints || []),
                result.sourceDayLabel,
                result.sourceTimeHint
            ].filter(Boolean)).slice(0, 4);
            if (existing.sourceType !== 'entity' && result.sourceType === 'entity') {
                Object.assign(existing, {
                    sourceType: result.sourceType,
                    category: result.category,
                    zhLabel: result.zhLabel,
                    venueEnglish: result.venueEnglish || existing.venueEnglish,
                    deckHint: result.deckHint || existing.deckHint,
                    crewPhrase: result.crewPhrase || existing.crewPhrase,
                    aliases: uniqueItems([...(existing.aliases || []), ...(result.aliases || [])]).slice(0, 18)
                });
            }
        });

        return Array.from(merged.values())
            .sort((a, b) => b.score - a.score || Number(b.sourceType === 'entity') - Number(a.sourceType === 'entity') || (a.restaurantOrder ?? 999) - (b.restaurantOrder ?? 999) || (a.sourceRecordIndex ?? 0) - (b.sourceRecordIndex ?? 0) || a.englishName.localeCompare(b.englishName));
    }

    function getBilingualLookupResults(query = '', options = {}) {
        const normalizedQuery = normalizeSearchText(query);
        const selectedCategory = compactSearchText(options.category || searchState.lookupCategory || 'all');
        const selectedDiningFilter = compactSearchText(options.diningFilter || searchState.lookupDiningFilter || 'all');
        const selectedRestaurantFilter = compactSearchText(options.restaurantFilter || searchState.lookupRestaurantFilter || 'all');
        const scoredResults = (searchState.lookupRecords || [])
            .map(record => ({ ...record, score: scoreLookupRecord(record, normalizedQuery, selectedCategory, selectedDiningFilter, selectedRestaurantFilter) }))
            .filter(record => record.score > 0);

        return {
            queryData: {
                normalizedQuery,
                selectedCategory,
                selectedDiningFilter,
                selectedRestaurantFilter
            },
            results: mergeLookupResults(scoredResults)
        };
    }

    function getSearchUnits(rawQuery) {
        const normalizedQuery = normalizeSearchText(rawQuery);
        if (!normalizedQuery) {
            return {
                normalizedQuery: '',
                literalAnchors: [],
                units: [],
                highlightTerms: [],
                contextualKeywords: [],
                canonicalEntities: [],
                requiredCapabilities: [],
                disallowedCategories: [],
                categoryHints: [],
                broadIntent: false,
                scheduleIntent: false
            };
        }

        const splitUnits = normalizedQuery.split(' ').filter(Boolean);
        const matchingTerms = collectMatchingTerms(normalizedQuery, searchDisplayMap);
        const focusedMatchingTerms = matchingTerms.filter(term =>
            !(normalizedQuery !== term && normalizedQuery.length > term.length && normalizedQuery.includes(term))
            && !matchingTerms.some(other => other !== term && other.length > term.length && other.includes(term))
        );
        const literalAnchors = uniqueItems([
            ...(normalizedQuery.includes(' ') ? [normalizedQuery] : []),
            ...focusedMatchingTerms,
            ...splitUnits.filter(unit => unit.length >= 2)
        ]).slice(0, 12);
        const canonicalEntities = inferEntityRefsFromText([rawQuery], 6);
        const requiredCapabilities = detectAiRequiredCapabilities(normalizedQuery, {
            literalAnchors: focusedMatchingTerms,
            canonicalEntities
        });
        const scheduleIntent = detectSearchScheduleIntent(normalizedQuery);
        const broadIntent = detectBroadSearchIntent(normalizedQuery);
        const entityContextualKeywords = uniqueItems([
            ...collectEntityRegistryProperNounTokens(canonicalEntities),
            ...collectEntityRegistryAliasTokens(canonicalEntities)
        ]
            .map(term => normalizeSearchText(term))
            .filter(term => term && term.length >= 2))
            .slice(0, 12);
        const derivedContextualKeywords = uniqueItems(deriveContextualKeywords(rawQuery)
            .map(term => normalizeSearchText(term))
            .filter(term => term && term.length >= 2))
            .slice(0, 16);
        const contextualKeywords = uniqueItems([
            ...entityContextualKeywords,
            ...((!canonicalEntities.length || requiredCapabilities.length || scheduleIntent || broadIntent)
                ? derivedContextualKeywords
                : [])
        ]).slice(0, 16);
        const disallowedCategories = detectAiDisallowedCategories(normalizedQuery, requiredCapabilities);
        const categoryHints = uniqueItems([
            ...literalAnchors
                .map(term => resolveTaxonomyCategoryLabel(term))
                .filter(Boolean),
            ...focusedMatchingTerms
                .map(term => resolveTaxonomyCategoryLabel(term))
                .filter(Boolean),
            ...((!canonicalEntities.length || requiredCapabilities.length || broadIntent)
                ? contextualKeywords
                .map(term => resolveTaxonomyCategoryLabel(term))
                .filter(Boolean)
                : []),
            ...requiredCapabilities.flatMap(capabilityId => {
                const capabilityEntry = getTaxonomyCapabilityEntry(capabilityId);
                return getCapabilitySignalCategoryFamilies(capabilityEntry);
            })
        ]).slice(0, 8);
        const units = uniqueItems([
            ...(normalizedQuery.includes(' ') ? [normalizedQuery] : []),
            ...splitUnits,
            ...focusedMatchingTerms,
            ...entityContextualKeywords,
            ...((!canonicalEntities.length || requiredCapabilities.length || scheduleIntent || broadIntent)
                ? contextualKeywords
                : [])
        ]);
        const highlightTerms = uniqueItems([
            ...units,
            ...literalAnchors,
            ...collectEntityRegistryProperNounTokens(canonicalEntities),
            ...collectEntityRegistryAliasTokens(canonicalEntities).slice(0, 6)
        ].map(unit => searchDisplayMap.get(unit) || unit));

        return {
            normalizedQuery,
            literalAnchors,
            units,
            highlightTerms,
            contextualKeywords,
            canonicalEntities,
            requiredCapabilities,
            disallowedCategories,
            categoryHints,
            broadIntent,
            scheduleIntent
        };
    }

    function resultMatchesCategory(result, categoryLabel) {
        const normalizedLabel = compactSearchText(categoryLabel);
        if (!result || !normalizedLabel) return false;

        if ((result.categoryFamilies || []).includes(normalizedLabel)) {
            return true;
        }

        const categoryEntry = getTaxonomyCategoryEntry(categoryLabel);
        if (!categoryEntry) return false;

        const sourceText = result.normalizedCombined || normalizeSearchText([
            result.title,
            result.text,
            result.structuredText,
            ...(result.keywords || []),
            ...(result.categoryFamilies || [])
        ].join(' '));

        return uniqueItems([categoryEntry.label, ...categoryEntry.terms, ...categoryEntry.keywords])
            .map(term => normalizeSearchText(term))
            .filter(Boolean)
            .some(term => sourceText.includes(term));
    }

    function scoreNormalizedField(normalizedField = '', terms = [], weight = 0) {
        if (!normalizedField || !Array.isArray(terms) || !terms.length || !weight) return 0;
        return terms.reduce((total, term) => {
            const normalizedTerm = normalizeSearchText(term);
            if (!normalizedTerm) return total;
            if (normalizedField === normalizedTerm) return total + (weight * 1.4);
            if (normalizedField.includes(normalizedTerm)) return total + weight;
            return total;
        }, 0);
    }

    function getSearchResultSourceBucket(doc) {
        if (!doc) return 'support';
        if (doc.sourceType === 'schedule' || doc.sourceType === 'static' || doc.isSupportLike) {
            return 'support';
        }
        if (doc.sourceType === 'playbook') {
            return 'playbook';
        }
        return 'primary';
    }

    function countCanonicalEntityMatches(doc, canonicalEntities = []) {
        if (!doc || !Array.isArray(canonicalEntities) || !canonicalEntities.length) return 0;
        return canonicalEntities.filter(entityId => (doc.canonicalEntityIds || []).includes(entityId)).length;
    }

    function countSupportEntityMatches(doc, canonicalEntities = []) {
        if (!doc || !Array.isArray(canonicalEntities) || !canonicalEntities.length) return 0;
        return canonicalEntities.filter(entityId => (doc.supportOfEntityIds || []).includes(entityId)).length;
    }

    function documentHasLiteralAnchorHit(doc, literalAnchors = []) {
        if (!doc || !Array.isArray(literalAnchors) || !literalAnchors.length) return false;
        return [
            doc.normalizedTitle,
            doc.normalizedProperNouns,
            doc.normalizedAliases,
            doc.normalizedKeywords
        ].some(field => hasAnyNormalizedTerm(field, literalAnchors));
    }

    function documentHasStrongLiteralAnchorHit(doc, literalAnchors = []) {
        if (!doc || !Array.isArray(literalAnchors) || !literalAnchors.length) return false;
        return [
            doc.normalizedTitle,
            doc.normalizedProperNouns,
            doc.normalizedAliases
        ].some(field => hasAnyNormalizedTerm(field, literalAnchors));
    }

    function extractScheduleDayKey(result) {
        const normalized = normalizeSearchText([
            result?.timeHint,
            result?.locationLabel,
            result?.title
        ].join(' '));
        if (!normalized) return 'general';

        const dayMatch = normalized.match(/day\s*\d+/);
        if (dayMatch) {
            return dayMatch[0].replace(/\s+/g, '');
        }
        if (normalized.includes('登船')) return 'embark';
        if (normalized.includes('下船')) return 'disembark';
        if (normalized.includes('海上')) return 'sea-day';
        return normalized.split(' ')[0] || 'general';
    }

    function scoreDocument(doc, queryData = {}) {
        if (!doc || !queryData.normalizedQuery) return 0;

        const literalAnchors = Array.isArray(queryData.literalAnchors) ? queryData.literalAnchors : [];
        const units = Array.isArray(queryData.units) ? queryData.units : [];
        const contextualKeywords = Array.isArray(queryData.contextualKeywords)
            ? queryData.contextualKeywords.filter(term => !units.includes(term))
            : [];
        const canonicalEntities = Array.isArray(queryData.canonicalEntities) ? queryData.canonicalEntities : [];
        const requiredCapabilities = Array.isArray(queryData.requiredCapabilities) ? queryData.requiredCapabilities : [];
        const disallowedCategories = Array.isArray(queryData.disallowedCategories) ? queryData.disallowedCategories : [];
        const categoryHints = Array.isArray(queryData.categoryHints) ? queryData.categoryHints : [];
        const scheduleIntent = Boolean(queryData.scheduleIntent);
        const entityBreadth = Math.max(1, Number(doc.entityBreadth) || 1);
        const literalTitleHit = hasAnyNormalizedTerm(doc.normalizedTitle, literalAnchors);
        const literalProperHit = hasAnyNormalizedTerm(doc.normalizedProperNouns, literalAnchors);
        const literalAliasHit = hasAnyNormalizedTerm(doc.normalizedAliases, literalAnchors);
        const literalKeywordHit = hasAnyNormalizedTerm(doc.normalizedKeywords, literalAnchors);
        const exactKeywordPhraseHit = getSearchSignalLength(queryData.normalizedQuery) >= 4
            && hasAnyNormalizedTerm(doc.normalizedKeywords, [queryData.normalizedQuery]);
        const strongLiteralAnchorHit = literalTitleHit || literalProperHit || literalAliasHit;
        const directAnchorHit = literalTitleHit || literalProperHit || literalAliasHit || literalKeywordHit;
        const canonicalEntityMatchCount = countCanonicalEntityMatches(doc, canonicalEntities);
        const supportEntityMatchCount = countSupportEntityMatches(doc, canonicalEntities);
        const capabilityHitCount = requiredCapabilities.filter(capabilityId => resultMatchesCapability(doc, capabilityId)).length;
        const sourceBucket = getSearchResultSourceBucket(doc);
        const weakKeywordOnlyHit = literalKeywordHit
            && !exactKeywordPhraseHit
            && !literalTitleHit
            && !literalProperHit
            && !literalAliasHit
            && !canonicalEntityMatchCount
            && !supportEntityMatchCount;
        let categoryHitCount = 0;

        let score = 0;

        if (doc.normalizedTitle === queryData.normalizedQuery) score += 240;
        if (doc.normalizedProperNouns === queryData.normalizedQuery) score += 220;
        if (doc.normalizedAliases === queryData.normalizedQuery) score += 200;

        score += scoreNormalizedField(doc.normalizedTitle, [queryData.normalizedQuery], 130);
        score += scoreNormalizedField(doc.normalizedProperNouns, [queryData.normalizedQuery], 120);
        score += scoreNormalizedField(doc.normalizedAliases, [queryData.normalizedQuery], 110);
        score += scoreNormalizedField(doc.normalizedKeywords, [queryData.normalizedQuery], 18);
        score += scoreNormalizedField(doc.normalizedCategories, [queryData.normalizedQuery], 56);
        score += scoreNormalizedField(doc.normalizedCapabilities, [queryData.normalizedQuery], 56);
        score += scoreNormalizedField(doc.normalizedEntityFamilies, [queryData.normalizedQuery], 46);
        score += scoreNormalizedField(doc.normalizedCombined, [queryData.normalizedQuery], 6);

        score += scoreNormalizedField(doc.normalizedTitle, units, 34);
        score += scoreNormalizedField(doc.normalizedProperNouns, units, 32);
        score += scoreNormalizedField(doc.normalizedAliases, units, 28);
        score += scoreNormalizedField(doc.normalizedKeywords, units, 4);
        score += scoreNormalizedField(doc.normalizedCombined, units, 2);

        score += scoreNormalizedField(doc.normalizedProperNouns, contextualKeywords, 10);
        score += scoreNormalizedField(doc.normalizedAliases, contextualKeywords, 10);
        score += scoreNormalizedField(doc.normalizedCategories, contextualKeywords, 8);
        score += scoreNormalizedField(doc.normalizedCapabilities, contextualKeywords, 8);
        score += scoreNormalizedField(doc.normalizedCombined, contextualKeywords, 1);

        if (directAnchorHit) {
            score += 96;
        }
        if (literalTitleHit) score += 88;
        if (literalProperHit) score += 72;
        if (literalAliasHit) score += 56;
        if (literalKeywordHit) score += 28;
        if (exactKeywordPhraseHit) score += 96;

        if (canonicalEntityMatchCount) {
            const entityMatchWeight = Math.max(20, 76 - Math.max(0, entityBreadth - 1) * 16);
            score += canonicalEntityMatchCount * entityMatchWeight;
        }

        if (supportEntityMatchCount) {
            const supportWeight = Math.max(8, 28 - Math.max(0, entityBreadth - 1) * 6);
            score += supportEntityMatchCount * supportWeight;
        }

        categoryHints.forEach(categoryLabel => {
            if (resultMatchesCategory(doc, categoryLabel)) {
                categoryHitCount += 1;
                score += 28;
            }
        });

        if (capabilityHitCount) {
            score += capabilityHitCount * 52;
        }
        requiredCapabilities.forEach(capabilityId => {
            if (!resultMatchesCapability(doc, capabilityId) && (doc.fieldType || 'parent') === 'parent' && !['schedule', 'static'].includes(doc.sourceType)) {
                score -= 32;
            }
        });
        if (requiredCapabilities.length && !capabilityHitCount && !literalTitleHit && !literalProperHit && !literalAliasHit) {
            score -= doc.sourceType === 'playbook' ? 160 : 120;
        }

        if (disallowedCategories.length && resultMatchesDisallowedCategory(doc, disallowedCategories)) {
            score -= 96;
        }

        if ((doc.fieldType || 'parent') === 'parent') {
            score += 18;
        } else {
            score += 6;
        }

        if (doc.sourceType === 'deck') score += 18;
        if (doc.sourceType === 'show') score += categoryHints.includes('表演') ? 28 : 14;
        if (doc.sourceType === 'playbook') score += directAnchorHit ? 14 : 6;
        if (doc.sourceType === 'schedule') score += scheduleIntent ? 6 : -34;
        if (doc.sourceType === 'static') score -= 12;

        if (requiredCapabilities.length && doc.sourceType === 'schedule' && !(doc.supportOfParentIds || []).length) {
            score -= 10;
        }

        if (!scheduleIntent && sourceBucket === 'support') {
            score -= 22;
        }

        if (canonicalEntities.length && !strongLiteralAnchorHit && !canonicalEntityMatchCount && !supportEntityMatchCount) {
            score -= doc.sourceType === 'playbook' ? 180 : 120;
        }

        if (weakKeywordOnlyHit) {
            score -= doc.sourceType === 'playbook' ? 280 : 220;
            if (entityBreadth > 1) {
                score -= (entityBreadth - 1) * 36;
            }
        }

        if (doc.sourceType === 'playbook' && entityBreadth >= 4 && !directAnchorHit) {
            score -= 140;
        } else if (entityBreadth >= 6 && !directAnchorHit) {
            score -= 72;
        }

        if (doc.sourceType === 'playbook' && entityBreadth >= 3 && canonicalEntityMatchCount && !literalTitleHit && !literalProperHit && !literalAliasHit) {
            score -= (entityBreadth - 2) * 44;
        }

        if (doc.sourceType === 'playbook'
            && canonicalEntityMatchCount
            && entityBreadth > canonicalEntityMatchCount + 1
            && !strongLiteralAnchorHit) {
            score -= (entityBreadth - canonicalEntityMatchCount) * 30;
        }

        if (doc.sourceType === 'playbook'
            && entityBreadth >= 5
            && canonicalEntityMatchCount <= 1
            && !strongLiteralAnchorHit) {
            score -= 180 + (entityBreadth - 5) * 20;
        }

        if (doc.sourceType === 'playbook'
            && canonicalEntityMatchCount
            && entityBreadth >= 4
            && (canonicalEntityMatchCount / entityBreadth) < 0.5
            && !strongLiteralAnchorHit) {
            score -= 220;
        }

        if (doc.sourceType === 'playbook'
            && canonicalEntities.length
            && canonicalEntityMatchCount === 1
            && entityBreadth >= 4
            && !strongLiteralAnchorHit) {
            score -= 220;
        }

        const hasSearchEvidence = directAnchorHit
            || canonicalEntityMatchCount
            || supportEntityMatchCount
            || capabilityHitCount
            || categoryHitCount
            || hasAnyNormalizedTerm(doc.normalizedCombined, [queryData.normalizedQuery])
            || hasAnyNormalizedTerm(doc.normalizedCombined, units)
            || hasAnyNormalizedTerm(doc.normalizedCombined, contextualKeywords);

        if (!hasSearchEvidence) {
            return 0;
        }

        return Math.max(0, Math.round(score));
    }

    function buildSearchResultHighlights(result, queryData = {}) {
        const highlights = [];
        const seen = new Set();
        const pairs = extractStructuredSearchPairs(result.structuredText || result.text);
        const preferredLabelsBySource = {
            schedule: ['日期', '時段', '活動標籤', '行程重點', '重點', '時間 / 時段'],
            deck: ['重點摘要', '最佳時機', '這趟怎麼用', '內容重點'],
            show: ['亮點', '時機提醒', '旅程連結', '內容重點'],
            playbook: ['適用時機', '建議做法', '這趟為什麼適合', '注意事項', '內容重點'],
            static: ['內容重點']
        };
        const preferredLabels = preferredLabelsBySource[result.sourceType] || ['內容重點'];

        const pushHighlight = (text) => {
            const normalized = truncateSearchPreview(text, 180);
            if (!normalized || seen.has(normalized)) return;
            seen.add(normalized);
            highlights.push(normalized);
        };

        if (result.fieldType && result.fieldType !== 'parent') {
            pushHighlight(`${result.fieldLabel || getAiFieldLabel(result.fieldType)}：${result.text}`);
        }

        preferredLabels.forEach(label => {
            const pair = pairs.find(([pairLabel]) => pairLabel === label);
            if (pair) {
                pushHighlight(`${pair[0]}：${pair[1]}`);
            }
        });

        if (result.timeHint) {
            pushHighlight(`時段提示：${result.timeHint}`);
        }

        if (result.bestTimeHint) {
            pushHighlight(`最佳時機：${result.bestTimeHint}`);
        }

        pairs.forEach(([label, value]) => {
            if (highlights.length >= SEARCH_RESULT_HIGHLIGHT_LIMIT) return;
            pushHighlight(`${label}：${value}`);
        });

        if (!highlights.length) {
            pushHighlight(createPlainExcerpt(result, queryData, 240));
        }

        return highlights.slice(0, SEARCH_RESULT_HIGHLIGHT_LIMIT);
    }

    function getSearchResultMetaChips(result) {
        const chips = [];

        if ((result.sourceDetailType || 'general') !== 'general') {
            chips.push(getAiSourceDetailLabel(result.sourceDetailType || 'general'));
        }

        if (result.sourceType === 'deck' || result.sourceType === 'show') {
            if (result.bestTimeHint) {
                chips.push(truncateSearchPreview(result.bestTimeHint, 36));
            }
        } else if (result.sourceType === 'playbook' && result.timeHint) {
            chips.push(truncateSearchPreview(result.timeHint, 36));
        }

        return uniqueItems(chips).slice(0, 2);
    }

    function createExcerpt(doc, queryData) {
        const rawSource = [doc.title, doc.structuredText || doc.text].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        const lowerSource = rawSource.toLowerCase();
        const searchTerms = uniqueItems([
            ...queryData.highlightTerms,
            ...queryData.units.map(unit => searchDisplayMap.get(unit) || unit),
            ...(queryData.canonicalEntities || []),
            ...(queryData.expandedCategories || []).slice(0, 4),
            ...(queryData.clusterExpansions || []).slice(0, 6)
        ]).filter(Boolean);

        let matchIndex = -1;
        searchTerms.forEach(term => {
            const index = lowerSource.indexOf(String(term).toLowerCase());
            if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
                matchIndex = index;
            }
        });

        const start = matchIndex === -1 ? 0 : Math.max(matchIndex - 42, 0);
        const end = Math.min(start + 180, rawSource.length);
        const snippet = `${start > 0 ? '…' : ''}${rawSource.slice(start, end).trim()}${end < rawSource.length ? '…' : ''}`;
        return highlightSnippet(snippet, searchTerms);
    }

    function createPlainExcerpt(doc, queryData, maxLength = 420) {
        const rawSource = [doc.title, doc.structuredText || doc.text].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        const lowerSource = rawSource.toLowerCase();
        const searchTerms = uniqueItems([
            ...queryData.highlightTerms,
            ...queryData.units.map(unit => searchDisplayMap.get(unit) || unit)
        ]).filter(Boolean);

        let matchIndex = -1;
        searchTerms.forEach(term => {
            const index = lowerSource.indexOf(String(term).toLowerCase());
            if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
                matchIndex = index;
            }
        });

        const start = matchIndex === -1 ? 0 : Math.max(matchIndex - 36, 0);
        const end = Math.min(start + maxLength, rawSource.length);
        return `${start > 0 ? '…' : ''}${rawSource.slice(start, end).trim()}${end < rawSource.length ? '…' : ''}`;
    }

    function getStructuredSearchValue(result, labels = []) {
        const normalizedLabels = uniqueItems((Array.isArray(labels) ? labels : [])
            .map(label => compactSearchText(label))
            .filter(Boolean));
        if (!normalizedLabels.length) return '';

        const pairs = extractStructuredSearchPairs(result?.structuredText || result?.text);
        const match = pairs.find(([label]) => normalizedLabels.includes(compactSearchText(label)));
        return compactSearchText(match?.[1] || '');
    }

    function cleanSearchSummaryFragment(text, options = {}) {
        let value = compactSearchText(text);
        if (!value) return '';

        const repeatedTerms = uniqueItems([
            options.title,
            options.locationLabel,
            options.timeHint,
            options.bestTimeHint
        ].map(item => compactSearchText(item)).filter(Boolean));

        repeatedTerms.forEach(term => {
            const normalizedTerm = normalizeSearchText(term);
            const normalizedValue = normalizeSearchText(value);
            if (normalizedTerm && normalizedValue.startsWith(normalizedTerm)) {
                value = value.slice(term.length).trim();
            }
        });

        return value
            .replace(/^(日期|時段|時間 \/ 時段|標籤|活動標籤|重點|行程重點|內容重點|重點摘要|最佳時機|時機提醒|這趟怎麼用|旅程連結|任務|來源層級|適用時機|建議做法|這趟為什麼適合|注意事項)\s*[:：]\s*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[；;]+/g, '；')
            .trim();
    }

    function joinSearchSummaryFragments(fragments = [], maxLength = 180) {
        const cleaned = uniqueItems((Array.isArray(fragments) ? fragments : [])
            .map(fragment => compactSearchText(fragment))
            .filter(Boolean));
        if (!cleaned.length) return '';

        const joined = cleaned
            .map(fragment => fragment.replace(/[。．]+$/g, '').trim())
            .filter(Boolean)
            .join('；');

        return truncateSearchPreview(joined, maxLength);
    }

    function buildSearchResultSummaryLine(result, queryData = {}) {
        if (!result) return '';

        if (result.sourceType === 'schedule') {
            const desc = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['重點', '行程重點', '內容重點']) || result.text,
                result
            );
            const tag = cleanSearchSummaryFragment(getStructuredSearchValue(result, ['標籤', '活動標籤']), result);
            return joinSearchSummaryFragments([
                desc,
                tag && desc && !normalizeSearchText(desc).includes(normalizeSearchText(tag)) ? `主題偏向 ${tag}` : ''
            ], 150) || createPlainExcerpt(result, queryData, 150);
        }

        if (result.sourceType === 'deck' || result.sourceType === 'show') {
            const summary = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['重點摘要', '內容重點', '亮點']) || result.text,
                result
            );
            const timing = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['最佳時機', '時機提醒']) || result.bestTimeHint,
                result
            );
            const usage = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['這趟怎麼用', '旅程連結']),
                result
            );
            return joinSearchSummaryFragments([
                summary,
                timing ? `最適合 ${timing}` : '',
                usage
            ], 165) || createPlainExcerpt(result, queryData, 165);
        }

        if (result.sourceType === 'playbook') {
            const when = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['適用時機']) || result.timeHint,
                result
            );
            const action = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['建議做法', '內容重點']) || result.text,
                result
            );
            const caution = cleanSearchSummaryFragment(
                getStructuredSearchValue(result, ['注意事項']),
                result
            );
            return joinSearchSummaryFragments([
                when && action ? `${when} 時最適合這樣做：${action}` : '',
                !when ? action : '',
                caution ? `記得 ${caution}` : ''
            ], 172) || createPlainExcerpt(result, queryData, 172);
        }

        return createPlainExcerpt(result, queryData, 160);
    }

    function cleanSearchResultLocationLabel(result) {
        const sourceLabel = compactSearchText(getSourceLabel(result?.sourceType));
        let location = compactSearchText(result?.locationLabel);
        if (!location) return '';

        if (sourceLabel && location.startsWith(`${sourceLabel} · `)) {
            location = location.slice(sourceLabel.length + 3).trim();
        }

        const repeatedDeckPattern = location.match(/^([^·•｜|]+)\s*[·•]\s*\1\s*[｜|]\s*(.+)$/);
        if (repeatedDeckPattern) {
            location = `${compactSearchText(repeatedDeckPattern[1])}｜${compactSearchText(repeatedDeckPattern[2])}`;
        }

        return location;
    }

    function getSearchResultMetaLine(result) {
        const parts = [getSourceLabel(result.sourceType)];
        const location = cleanSearchResultLocationLabel(result);
        if (location) {
            parts.push(location);
        }
        return parts.join(' • ');
    }

    function getSearchResultSortTier(result, queryData = {}) {
        const sourceBucket = getSearchResultSourceBucket(result);
        const literalAnchors = Array.isArray(queryData.literalAnchors) ? queryData.literalAnchors : [];
        const literalTitleHit = hasAnyNormalizedTerm(result?.normalizedTitle, literalAnchors);
        const fullPhraseAnchorHit = getSearchSignalLength(queryData.normalizedQuery) >= 4 && (hasAnyNormalizedTerm(result?.normalizedTitle, [queryData.normalizedQuery])
            || hasAnyNormalizedTerm(result?.normalizedProperNouns, [queryData.normalizedQuery])
            || hasAnyNormalizedTerm(result?.normalizedAliases, [queryData.normalizedQuery]));
        const fullKeywordPhraseHit = getSearchSignalLength(queryData.normalizedQuery) >= 4
            && hasAnyNormalizedTerm(result?.normalizedKeywords, [queryData.normalizedQuery]);
        const strongLiteralAnchorHit = documentHasStrongLiteralAnchorHit(result, literalAnchors);
        const entityMatchCount = countCanonicalEntityMatches(result, queryData.canonicalEntities || []);
        const entityMatchRatio = entityMatchCount / Math.max(1, Number(result.entityBreadth) || 1);
        const strongEntityHit = entityMatchCount > 0 && ((Number(result.entityBreadth) || 1) <= 2 || entityMatchRatio >= 0.45);
        const capabilityHit = (queryData.requiredCapabilities || []).some(capabilityId => resultMatchesCapability(result, capabilityId));
        const hasCanonicalFocus = (queryData.canonicalEntities || []).length > 0;
        const effectiveStrongLiteralHit = result?.sourceType === 'playbook' && (Number(result.entityBreadth) || 1) >= 4
            ? literalTitleHit
            : strongLiteralAnchorHit;
        const strongHit = effectiveStrongLiteralHit || strongEntityHit || capabilityHit;

        if (sourceBucket === 'playbook' && (fullPhraseAnchorHit || fullKeywordPhraseHit)) return 0;
        if (sourceBucket === 'primary' && (fullPhraseAnchorHit || strongEntityHit || capabilityHit)) return 0;
        if (sourceBucket === 'playbook' && strongHit) return 1;
        if (queryData.scheduleIntent && result.sourceType === 'schedule' && strongHit) return 2;
        if (sourceBucket === 'primary' && documentHasLiteralAnchorHit(result, literalAnchors)) return 2;
        if (queryData.scheduleIntent && !hasCanonicalFocus && sourceBucket === 'primary') return 6;
        if (sourceBucket === 'primary') return 3;
        if (sourceBucket === 'playbook' && (effectiveStrongLiteralHit || documentHasLiteralAnchorHit(result, literalAnchors))) return 4;
        if (sourceBucket === 'playbook') return 5;
        if (result.sourceType === 'schedule') return queryData.scheduleIntent ? 6 : 8;
        return 8;
    }

    function compareSearchResults(a, b, queryData = {}) {
        const tierDiff = getSearchResultSortTier(a, queryData) - getSearchResultSortTier(b, queryData);
        if (tierDiff !== 0) return tierDiff;

        if (b.score !== a.score) return b.score - a.score;

        if ((a.entityBreadth || 1) !== (b.entityBreadth || 1)) {
            return (a.entityBreadth || 1) - (b.entityBreadth || 1);
        }

        return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hant');
    }

    function dedupeSearchResults(rankedResults = [], queryData = {}) {
        const scheduleIntent = Boolean(queryData.scheduleIntent);
        const broadIntent = Boolean(queryData.broadIntent);
        const literalAnchors = Array.isArray(queryData.literalAnchors) ? queryData.literalAnchors : [];
        const canonicalEntities = Array.isArray(queryData.canonicalEntities) ? queryData.canonicalEntities : [];
        const requiredCapabilities = Array.isArray(queryData.requiredCapabilities) ? queryData.requiredCapabilities : [];
        const strictEntityFocus = canonicalEntities.length > 0 && !broadIntent && !scheduleIntent && !(queryData.requiredCapabilities || []).length;
        const parentSeen = new Set();
        const themeBuckets = new Map();
        const sourceCounts = {
            primary: 0,
            playbook: 0,
            schedule: 0,
            support: 0
        };
        const selected = [];
        const groupedScheduleKeys = new Set();
        const sorted = [...rankedResults].sort((a, b) => compareSearchResults(a, b, queryData));
        const relaxedFillThreshold = sorted.length
            ? Math.max(110, Math.round((sorted[0].score || 0) * 0.16))
            : 110;

        const canSelectResult = (result) => {
            if (parentSeen.has(result.parentId || result.id)) return false;

            const sourceBucket = getSearchResultSourceBucket(result);
            const themeId = result.themeEntityId || result.parentId || result.id;
            const literalTitleHit = hasAnyNormalizedTerm(result?.normalizedTitle, literalAnchors);
            const strongLiteralAnchorHit = documentHasStrongLiteralAnchorHit(result, literalAnchors);
            const canonicalEntityMatchCount = countCanonicalEntityMatches(result, canonicalEntities);
            const supportEntityMatchCount = countSupportEntityMatches(result, canonicalEntities);
            const entityBreadth = Math.max(1, Number(result.entityBreadth) || 1);
            const entityMatchRatio = canonicalEntityMatchCount / entityBreadth;
            const effectiveStrongLiteralHit = result.sourceType === 'playbook' && entityBreadth >= 4
                ? literalTitleHit
                : strongLiteralAnchorHit;
            const capabilityHitCount = requiredCapabilities.filter(capabilityId => resultMatchesCapability(result, capabilityId)).length;
            const themeState = themeBuckets.get(themeId) || { primary: false, playbook: false, support: false };

            if (sourceBucket === 'primary' && themeState.primary) return false;
            if (sourceBucket === 'playbook' && themeState.playbook) return false;
            if (sourceBucket === 'support' && result.sourceType !== 'schedule' && themeState.support) return false;

            if (sourceBucket === 'primary' && sourceCounts.primary >= SEARCH_PRIMARY_RESULT_LIMIT) return false;
            if (sourceBucket === 'playbook' && sourceCounts.playbook >= SEARCH_PLAYBOOK_RESULT_LIMIT) return false;
            if (sourceBucket === 'support' && result.sourceType === 'schedule' && sourceCounts.schedule >= SEARCH_SCHEDULE_RESULT_LIMIT) return false;
            if (sourceBucket === 'support' && result.sourceType !== 'schedule' && sourceCounts.support >= SEARCH_SUPPORT_RESULT_LIMIT) return false;

            if (result.sourceType === 'schedule' && !scheduleIntent && (sourceCounts.primary + sourceCounts.playbook) >= 5) {
                return false;
            }

            if (requiredCapabilities.some(capabilityId => capabilityId !== 'watch-show')
                && result.sourceType === 'show'
                && !effectiveStrongLiteralHit) {
                return false;
            }

            if (requiredCapabilities.length && !capabilityHitCount && !effectiveStrongLiteralHit && !canonicalEntityMatchCount) {
                return false;
            }

            if (strictEntityFocus) {
                if (sourceBucket === 'primary' && !effectiveStrongLiteralHit && !canonicalEntityMatchCount && !supportEntityMatchCount) {
                    return false;
                }

                if (result.sourceType === 'playbook' && !effectiveStrongLiteralHit) {
                    if (!canonicalEntityMatchCount) {
                        return false;
                    }
                    if (entityBreadth >= 4 && entityMatchRatio < 0.5) {
                        return false;
                    }
                }
            }

            if (result.sourceType === 'schedule') {
                const scheduleClusterKey = scheduleIntent
                    ? `schedule:${themeId}:${extractScheduleDayKey(result)}`
                    : `schedule:${themeId}`;
                if (groupedScheduleKeys.has(scheduleClusterKey)) return false;
            }

            return true;
        };

        const markResultSelected = (result) => {
            const sourceBucket = getSearchResultSourceBucket(result);
            const themeId = result.themeEntityId || result.parentId || result.id;
            const themeState = themeBuckets.get(themeId) || { primary: false, playbook: false, support: false };

            if (sourceBucket === 'primary') themeState.primary = true;
            if (sourceBucket === 'playbook') themeState.playbook = true;
            if (sourceBucket === 'support' && result.sourceType !== 'schedule') themeState.support = true;
            themeBuckets.set(themeId, themeState);

            if (sourceBucket === 'primary') sourceCounts.primary += 1;
            if (sourceBucket === 'playbook') sourceCounts.playbook += 1;
            if (sourceBucket === 'support' && result.sourceType === 'schedule') sourceCounts.schedule += 1;
            if (sourceBucket === 'support' && result.sourceType !== 'schedule') sourceCounts.support += 1;

            if (result.sourceType === 'schedule') {
                const scheduleClusterKey = scheduleIntent
                    ? `schedule:${themeId}:${extractScheduleDayKey(result)}`
                    : `schedule:${themeId}`;
                groupedScheduleKeys.add(scheduleClusterKey);
            }

            parentSeen.add(result.parentId || result.id);
            selected.push(result);
        };

        sorted.forEach(result => {
            if (selected.length >= SEARCH_MAX_RESULTS) return;
            if (!canSelectResult(result)) return;
            markResultSelected(result);
        });

        if (selected.length < Math.min(SEARCH_MAX_RESULTS, 6)) {
            sorted.forEach(result => {
                if (selected.length >= SEARCH_MAX_RESULTS) return;
                if (parentSeen.has(result.parentId || result.id)) return;
                if ((result.score || 0) < relaxedFillThreshold) return;
                parentSeen.add(result.parentId || result.id);
                selected.push(result);
            });
        }

        return selected;
    }

    function getRankedSearchResults(query) {
        const queryData = getSearchUnits(query);
        if (!queryData.normalizedQuery || queryData.normalizedQuery.length < SEARCH_MIN_LENGTH) {
            return { queryData, results: [] };
        }

        const rankedResults = searchState.documents
            .filter(doc => !doc.aiOnly)
            .map(doc => ({ ...doc, score: scoreDocument(doc, queryData) }))
            .filter(doc => doc.score > 0)
            .sort((a, b) => compareSearchResults(a, b, queryData));

        const results = dedupeSearchResults(rankedResults, queryData);

        return { queryData, results };
    }

    function getLookupResultMetaLine(result) {
        if (result.sourceType === 'menu-item') return '餐點 / Menu item';
        const parts = [
            getLookupSourceDisplayLabel(result.sourceType),
            getLookupCategoryDisplayLabel(result.category)
        ];
        return parts.join(' • ');
    }

    function buildCrewDisplayCard(record) {
        if (!record) return '';
        const location = getLookupRecordLocation(record);
        const phraseLabel = record.sourceType === 'menu-item'
            ? 'Ordering phrase / 點餐句'
            : 'Question / 問句';
        const sourceNote = record.sourceType === 'onboard-activity' && (record.sourceDayLabel || record.sourceTimeHint)
            ? `<p class="lookup-crew-source"><span class="lookup-inline-label">Source note / 來源索引</span>${escapeHtml(uniqueItems([record.sourceDayLabel, record.sourceTimeHint].filter(Boolean)).join(' · '))}，不作為本航程正式時刻。</p>`
            : '';
        return `
            <section class="lookup-crew-card" aria-live="polite">
                <button type="button" class="lookup-crew-close" data-lookup-crew-close aria-label="關閉 Crew 顯示卡">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="lookup-crew-kicker">Show this to Crew <span>給船員看</span></div>
                <h3>${escapeHtml(record.englishName)}</h3>
                <p class="lookup-crew-zh"><span class="lookup-inline-label">Chinese check / 中文確認</span>${escapeHtml(record.zhLabel)}</p>
                ${location ? `<p class="lookup-crew-location"><i class="fa-solid fa-location-dot"></i><span class="lookup-inline-label">Location / 地點</span>${escapeHtml(location)}</p>` : ''}
                <p class="lookup-crew-phrase"><span class="lookup-inline-label">${escapeHtml(phraseLabel)}</span>${escapeHtml(record.crewPhrase)}</p>
                ${sourceNote}
                <div class="lookup-crew-actions">
                    <button type="button" data-copy-text="${escapeHtml(record.englishName)}">
                        <i class="fa-regular fa-copy"></i> 複製英文名稱
                    </button>
                    <button type="button" data-copy-text="${escapeHtml(record.crewPhrase)}">
                        <i class="fa-regular fa-message"></i> 複製短句
                    </button>
                </div>
            </section>
        `;
    }

    function renderLookupMenuLoadState(status = menuDataLoadState.status, error = menuDataLoadState.error) {
        const container = document.getElementById('search-results');
        if (!container) return;
        const isLoading = status === 'loading';
        const isError = status === 'error';
        container.innerHTML = `
            <div class="search-empty-state search-menu-load-state">
                <p><strong>${isError ? '菜單資料無法載入' : '正在準備餐點中英對照'}</strong></p>
                <p>${isError ? escapeHtml(error?.message || '請確認 menu-lookup-data.js 已部署，或稍後再試。') : '請稍候。'}</p>
                <button type="button" class="menu-load-button" data-menu-load-action="${isError ? 'retry-search' : 'load-search'}">
                    <i class="fa-solid fa-utensils"></i>
                    ${isLoading ? '載入中...' : (isError ? '重新載入菜單' : '載入菜單資料')}
                </button>
            </div>
        `;
    }

    function renderLookupResults(results, queryContext = {}) {
        const container = document.getElementById('search-results');
        if (!container) return;
        const normalizedQuery = queryContext.normalizedQuery || '';
        const selectedCategory = queryContext.selectedCategory || searchState.lookupCategory || 'all';

        if (!normalizedQuery && selectedCategory === 'all') {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>切到中英對照了</strong></p>
                    <p>可查設施、活動、餐點與服務。</p>
                </div>
            `;
            return;
        }

        if (!results.length) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>目前沒有找到中英對照</strong></p>
                    <p>可以換成較短的詞，例如：餐廳、Oceaneer、Magic Shot、Guest Services。</p>
                </div>
            `;
            return;
        }

        const cards = results.map(result => {
            const location = getLookupRecordLocation(result);
            const chipLabels = getLookupResultChipLabels(result);
            return `
                <article class="lookup-result-card">
                    <div class="lookup-result-main">
                        <div class="lookup-result-meta">${escapeHtml(getLookupResultMetaLine(result))}</div>
                        <h3>${escapeHtml(result.zhLabel)}</h3>
                        <p class="lookup-result-en">${escapeHtml(result.englishName)}</p>
                        ${location ? `<p class="lookup-result-location"><span class="lookup-inline-label">Location / 地點</span>${escapeHtml(location)}</p>` : ''}
                        ${result.sourceType === 'menu-item' ? `<details class="menu-lookup-description" data-menu-description-id="${escapeHtml(result.id)}"><summary>餐點說明${result.menuVariants?.length > 1 ? '與各餐廳版本' : ''}</summary>${(result.menuVariants || [result]).map(variant => `<div class="menu-variant"><strong>${escapeHtml(variant.restaurantLabel)} · ${escapeHtml(variant.courseGroupLabel)}${variant.price ? ' · ' + escapeHtml(variant.price) : ''}</strong><p>${escapeHtml(variant.descriptionZh || '來源未提供其他描述。')}</p></div>`).join('')}</details>` : ''}
                        <div class="lookup-result-chips">
                            ${chipLabels.map(label => `<span class="${label.startsWith('合併') ? 'lookup-count' : ''}">${escapeHtml(label)}</span>`).join('')}
                        </div>
                    </div>
                    <button type="button" class="lookup-crew-trigger" data-lookup-id="${escapeHtml(result.id)}">
                        <i class="fa-solid fa-language"></i>
                        給 Crew 看
                    </button>
                </article>
            `;
        }).join('');

        container.innerHTML = `
            <section class="search-group lookup-group">
                <div class="search-group-title">
                    <i class="fa-solid fa-language"></i>
                    <span>${results.length} 項中英對照</span>
                </div>
                <div class="lookup-workspace">
                    <div class="lookup-result-column">
                        <div class="lookup-result-list">
                            ${cards}
                        </div>
                    </div>
                    <aside class="lookup-crew-pane" hidden aria-label="給 Crew 看"></aside>
                </div>
            </section>
        `;
    }

    function getMenuLookupRecords() {
        if (!isMenuLookupDataReady()) {
            return [];
        }
        if (!searchState.lookupRecords.length) {
            prepareSearchDocuments();
        }
        let records = (searchState.lookupRecords || []).filter(record => record.sourceType === 'menu-item');
        if (!records.length) {
            prepareLookupRecords();
            records = (searchState.lookupRecords || []).filter(record => record.sourceType === 'menu-item');
        }
        return records;
    }

    function scoreMenuQuickRecord(record, normalizedQuery, index) {
        if (!normalizedQuery) return Math.max(8, 64 - Math.floor(index / 3));
        const units = normalizedQuery.split(' ').filter(Boolean);
        let score = 0;
        if (record.normalizedEnglishName === normalizedQuery || record.normalizedZhLabel === normalizedQuery) score += 180;
        if (record.normalizedEnglishName.includes(normalizedQuery)) score += 125;
        if (record.normalizedZhLabel.includes(normalizedQuery)) score += 120;
        if (record.normalizedRestaurant.includes(normalizedQuery)) score += 82;
        if (record.normalizedMenuCategory.includes(normalizedQuery)) score += 76;
        if (record.searchText.includes(normalizedQuery)) score += 70;
        units.forEach(unit => {
            if (unit.length < 2) return;
            if (record.normalizedEnglishName.includes(unit)) score += 24;
            if (record.normalizedZhLabel.includes(unit)) score += 22;
            if (record.normalizedRestaurant.includes(unit)) score += 16;
            if (record.normalizedMenuCategory.includes(unit)) score += 14;
            if (record.searchText.includes(unit)) score += 10;
        });
        return score;
    }

    function getMenuQuickResults(query = '', restaurantId = 'all', courseId = 'all', limit = Infinity) {
        const normalizedQuery = normalizeSearchText(query);
        const selectedRestaurant = getMenuRestaurantEntry(restaurantId).id;
        const selectedCourse = getMenuCourseEntry(courseId).id;
        const records = getMenuLookupRecords()
            .map((record, index) => ({
                ...record,
                menuQuickIndex: index,
                menuQuickScore: scoreMenuQuickRecord(record, normalizedQuery, index)
            }))
            .filter(record => selectedRestaurant === 'all' || record.restaurantId === selectedRestaurant)
            .filter(record => selectedCourse === 'all' || record.courseGroup === selectedCourse)
            .filter(record => !normalizedQuery || record.menuQuickScore > 0)
            .sort((a, b) => {
                if (normalizedQuery && b.menuQuickScore !== a.menuQuickScore) {
                    return b.menuQuickScore - a.menuQuickScore;
                }
                return (a.restaurantOrder || 999) - (b.restaurantOrder || 999)
                    || (a.sourceRecordIndex || a.menuQuickIndex) - (b.sourceRecordIndex || b.menuQuickIndex)
                    || a.englishName.localeCompare(b.englishName);
            });

        return Number.isFinite(limit) ? records.slice(0, limit) : records;
    }

    function getMenuQuickSections(results = [], selectedRestaurant = 'all') {
        const sectionMap = new Map();
        const restaurantMode = compactSearchText(selectedRestaurant || 'all') === 'all';
        results.forEach(record => {
            const key = restaurantMode ? record.restaurantId : record.courseGroup;
            if (!sectionMap.has(key)) {
                sectionMap.set(key, {
                    id: key,
                    title: restaurantMode ? record.restaurantLabel : (record.courseGroupLabel || record.menuCategoryLabel),
                    subtitle: restaurantMode ? record.restaurantGroupLabel : getMenuRestaurantEntry(record.restaurantId).label,
                    order: restaurantMode ? (record.restaurantOrder || 999) : MENU_COURSE_FILTERS.findIndex(course => course.id === record.courseGroup),
                    records: []
                });
            }
            sectionMap.get(key).records.push(record);
        });
        return Array.from(sectionMap.values())
            .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    }

    function renderSearchResults(results, queryContext) {
        const container = document.getElementById('search-results');
        if (!container) return;
        const resolvedQueryData = typeof queryContext === 'object' && queryContext?.normalizedQuery
            ? queryContext
            : getSearchUnits(queryContext);
        const currentQuery = resolvedQueryData.normalizedQuery;

        if (!currentQuery) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>開始搜尋郵輪重點</strong></p>
                    <p>可以試試看：禮賓、Baymax、Room Service、Deck 17、爆米花、SGAC。</p>
                </div>
            `;
            return;
        }

        if (currentQuery.length < SEARCH_MIN_LENGTH) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>再多輸入一點點</strong></p>
                    <p>至少輸入 ${SEARCH_MIN_LENGTH} 個字元，搜尋結果會更準。</p>
                </div>
            `;
            return;
        }

        if (!results.length) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>目前沒有找到相符內容</strong></p>
                    <p>可以換成常見別名試試，例如：禮賓 / Concierge、杯麵 / Baymax、房務 / Room Service。</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <section class="search-group">
                <div class="search-group-title">${results.length} 項攻略</div>
                <div class="search-group-list">
                    ${results.map(result => {
                        const summaryLine = buildSearchResultSummaryLine(result, resolvedQueryData);
                        const metaLine = getSearchResultMetaLine(result);
                        return `<button type="button" class="search-result-card" data-result-id="${result.id}">
                            <div class="search-result-meta">${escapeHtml(metaLine)}</div>
                            <h3 class="search-result-title">${escapeHtml(result.title)}</h3>
                            ${summaryLine ? `<div class="search-result-summary">${escapeHtml(summaryLine)}</div>` : ''}
                        </button>`;
                    }).join('')}
                </div>
            </section>`;
    }

    function renderSearchResultsError(message) {
        const container = document.getElementById('search-results');
        if (!container) return;

        container.innerHTML = `
            <div class="search-empty-state">
                <p><strong>搜尋暫時發生錯誤</strong></p>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }

    function performSearch(query) {
        const { queryData, results } = getRankedSearchResults(query);
        searchState.lastQuery = queryData.normalizedQuery;
        searchState.lastQueryData = queryData;
        searchState.lastResults = results;
        searchState.resultsById = new Map(results.map(result => [result.id, result]));
        renderSearchResults(results, queryData);
    }

    function performLookupSearch(query) {
        if (searchState.lookupCategory === 'dining' && !isMenuLookupDataReady()) {
            const queryData = getSearchUnits(query);
            searchState.lastQuery = queryData.normalizedQuery;
            searchState.lastQueryData = queryData;
            searchState.lastResults = [];
            searchState.lookupResultsById = new Map();
            renderLookupMenuLoadState(menuDataLoadState.status === 'error' ? 'error' : 'loading', menuDataLoadState.error);
            ensureMenuLookupDataLoaded()
                .then(() => {
                    if (searchState.mode === 'lookup' && searchState.lookupCategory === 'dining') performLookupSearch(document.getElementById('search-input')?.value || '');
                })
                .catch(error => {
                    if (searchState.mode === 'lookup' && searchState.lookupCategory === 'dining') renderLookupMenuLoadState('error', error);
                });
            return;
        }

        const { queryData, results } = getBilingualLookupResults(query, {
            category: searchState.lookupCategory,
            diningFilter: searchState.lookupDiningFilter,
            restaurantFilter: searchState.lookupRestaurantFilter
        });
        searchState.lastQuery = queryData.normalizedQuery;
        searchState.lastQueryData = queryData;
        searchState.lastResults = results;
        searchState.lookupResultsById = new Map(results.map(result => [result.id, result]));
        if (searchState.activeCrewRecordId && !searchState.lookupResultsById.has(searchState.activeCrewRecordId)) {
            searchState.activeCrewRecordId = '';
        }
        renderLookupResults(results, queryData);
    }

    function performActiveSearch(query) {
        hideCrewPreview(false);
        const body = document.getElementById('search-panel-body');
        if (body) body.scrollTop = 0;
        if (searchState.mode === 'lookup') {
            performLookupSearch(query);
            return;
        }
        performSearch(query);
    }

    function setSearchToolMode(mode, options = {}) {
        searchState.mode = mode === 'lookup' ? 'lookup' : 'guide';
        if (options.lookupCategory) {
            searchState.lookupCategory = compactSearchText(options.lookupCategory) || 'all';
        }
        if (options.lookupDiningFilter) {
            searchState.lookupDiningFilter = getMenuDiningFilterEntry(options.lookupDiningFilter).id;
        }
        if (options.lookupRestaurantFilter) {
            searchState.lookupRestaurantFilter = getMenuRestaurantEntry(options.lookupRestaurantFilter).id;
        }
        if (searchState.lookupCategory !== 'dining') {
            searchState.lookupDiningFilter = 'all';
            searchState.lookupRestaurantFilter = 'all';
        }
        if (searchState.mode === 'lookup') {
            searchState.shortcutOpen = false;
        }
        searchState.activeCrewRecordId = '';
        syncSearchModeUi();
    }

    function setLookupCategory(category) {
        searchState.lookupCategory = compactSearchText(category) || 'all';
        if (searchState.lookupCategory !== 'dining') {
            searchState.lookupDiningFilter = 'all';
            searchState.lookupRestaurantFilter = 'all';
        }
        searchState.activeCrewRecordId = '';
        syncSearchModeUi();
    }

    function setLookupDiningFilter(filterId) {
        searchState.lookupCategory = 'dining';
        searchState.lookupDiningFilter = getMenuDiningFilterEntry(filterId).id;
        searchState.activeCrewRecordId = '';
        syncSearchModeUi();
    }

    function setLookupRestaurantFilter(restaurantId) {
        searchState.lookupCategory = 'dining';
        searchState.lookupRestaurantFilter = getMenuRestaurantEntry(restaurantId).id;
        searchState.activeCrewRecordId = '';
        syncSearchModeUi();
    }

    function setShortcutDrawerOpen(isOpen) {
        searchState.shortcutOpen = Boolean(isOpen) && searchState.mode !== 'lookup';
        syncSearchModeUi();
    }

    function renderLookupDiningControls() {
        const select = document.getElementById('lookup-menu-restaurant-select');
        const courseRow = document.getElementById('lookup-menu-course-row');
        const focusedCourse = document.activeElement?.dataset?.lookupDiningFilter;
        const isReady = isMenuLookupDataReady();
        if (select) {
            const restaurants = getMenuRestaurantOptions();
            select.innerHTML = [
                `<option value="all">全部餐廳</option>`,
                ...restaurants.map(restaurant => `<option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.label)}</option>`)
            ].join('');
            select.disabled = !isReady;
            const selectedRestaurant = getMenuRestaurantEntry(searchState.lookupRestaurantFilter).id;
            const hasSelectedOption = Array.from(select.options).some(option => option.value === selectedRestaurant);
            if (!hasSelectedOption && selectedRestaurant !== 'all') {
                select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(selectedRestaurant)}">${escapeHtml(selectedRestaurant)}</option>`);
            }
            select.value = selectedRestaurant;
        }
        if (courseRow) {
            courseRow.innerHTML = MENU_COURSE_FILTERS.map(course => `
                <button type="button" class="${course.id === searchState.lookupDiningFilter ? 'active' : ''}" data-lookup-dining-filter="${escapeHtml(course.id)}" ${isReady ? '' : 'disabled'}>
                    ${escapeHtml(course.label)}
                </button>
            `).join('');
            if (focusedCourse) courseRow.querySelector(`[data-lookup-dining-filter="${focusedCourse}"]`)?.focus({preventScroll: true});
        }
    }

    function syncSearchModeUi() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        const modeButtons = document.querySelectorAll('[data-search-tool-mode]');
        const lookupCategoryRow = document.getElementById('lookup-category-row');
        const lookupDiningFilterRow = document.getElementById('lookup-dining-filter-row');
        const lookupRestaurantSelect = document.getElementById('lookup-menu-restaurant-select');
        const categoryButtons = lookupCategoryRow?.querySelectorAll('[data-lookup-category]') || [];
        const diningFilterButtons = lookupDiningFilterRow?.querySelectorAll('[data-lookup-dining-filter]') || [];
        const shortcutToggle = document.getElementById('search-shortcut-toggle');
        const shortcutDrawer = document.getElementById('search-shortcut-drawer');

        if (overlay) {
            overlay.dataset.searchMode = searchState.mode;
        }

        modeButtons.forEach(button => {
            const isActive = button.dataset.searchToolMode === searchState.mode;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        if (input) {
            input.placeholder = searchState.mode === 'lookup' ? LOOKUP_MODE_PLACEHOLDER : GUIDE_MODE_PLACEHOLDER;
        }

        if (lookupCategoryRow) {
            lookupCategoryRow.hidden = searchState.mode !== 'lookup';
        }

        if (lookupDiningFilterRow) {
            lookupDiningFilterRow.hidden = searchState.mode !== 'lookup' || searchState.lookupCategory !== 'dining';
        }

        renderLookupDiningControls();

        categoryButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.lookupCategory === searchState.lookupCategory);
        });

        diningFilterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.lookupDiningFilter === searchState.lookupDiningFilter);
        });

        if (lookupRestaurantSelect) {
            lookupRestaurantSelect.value = getMenuRestaurantEntry(searchState.lookupRestaurantFilter).id;
        }

        if (shortcutToggle) {
            const canShowShortcuts = searchState.mode !== 'lookup';
            shortcutToggle.hidden = !canShowShortcuts;
            shortcutToggle.classList.toggle('active', searchState.shortcutOpen && canShowShortcuts);
            shortcutToggle.setAttribute('aria-expanded', searchState.shortcutOpen && canShowShortcuts ? 'true' : 'false');
        }

        if (shortcutDrawer) {
            shortcutDrawer.hidden = !(searchState.shortcutOpen && searchState.mode !== 'lookup');
        }
    }

    async function copyTextToClipboard(text, button) {
        const value = String(text || '').trim();
        let copied = false;
        try { if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(value); copied = true;} } catch {}
        if (!copied) {
            const textarea = document.createElement('textarea');
            textarea.value = value; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
            document.querySelector('.lookup-crew-pane')?.appendChild(textarea);
            textarea.select();
            try { copied = document.execCommand('copy'); } catch {}
            textarea.remove();
        }
        if (button) {
            const original = button.innerHTML;
            button.textContent = copied ? '已複製' : '無法複製，請選取英文文字';
            button.focus({preventScroll: true});
            window.setTimeout(() => {if (button.isConnected) button.innerHTML = original;}, 2000);
        }
    }

    function navigateToSearchResult(result) {
        if (!result?.navTarget) return;
        closeSearchOverlay({fromRoute: true});
        history.replaceState(null, '', '#' + result.navTarget.itemId);
        navigateNotebook(result.navTarget.itemId);
    }

    function setSearchBackgroundInert(isOpen) {
        document.querySelectorAll('main, .sticky-nav, .mobile-nav, .notebook-footer, #back-to-top').forEach(element => { element.inert = isOpen; });
    }

    function openSearchOverlay(options = {}) {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        if (!overlay || !input || !overlay.hidden) return;
        notebookReturnFocus = document.activeElement;
        searchState.returnScroll = window.scrollY;
        searchState.returnHash = ['#search','#menu-search','#menu-lookup','#crew'].includes(window.location.hash) ? '#' + notebookState.view : window.location.hash || '#journey';
        searchState.isComposing = false;
        searchState.pendingSubmit = false;
        overlay.hidden = false;
        document.body.classList.add('search-open');
        setSearchBackgroundInert(true);
        syncSearchModeUi();
        if (!options.fromRoute) {
            history.pushState({search: true}, '', options.menu ? '#menu-search' : '#search');
            searchState.historyEntry = true;
        } else searchState.historyEntry = Boolean(history.state?.search);
        if ((!searchState.lastQueryData || normalizeSearchText(input.value) !== searchState.lastQuery) && !options.skipSearch) performActiveSearch(input.value);
        if (options.focusInput !== false) input.focus({preventScroll: true});
        else document.getElementById('search-close-btn').focus({preventScroll: true});
    }

    function closeSearchOverlay(options = {}) {
        const overlay = document.getElementById('search-overlay');
        if (!overlay || overlay.hidden) return;
        const wasCrew = window.location.hash === '#crew';
        hideCrewPreview(false);
        overlay.hidden = true;
        document.body.classList.remove('search-open');
        setSearchBackgroundInert(false);
        searchState.isComposing = false;
        searchState.pendingSubmit = false;
        clearTimeout(searchState.debounceTimer);
        notebookReturnFocus?.focus?.({preventScroll: true});
        window.scrollTo({top: searchState.returnScroll || 0, behavior: 'instant'});
        if (!options.fromRoute) {
            searchState.closingHash = searchState.returnHash || '#journey';
            if (searchState.historyEntry) history.go(wasCrew ? -2 : -1);
            else {
                history.replaceState(null, '', searchState.returnHash || '#journey');
                searchState.closingHash = null;
            }
        }
    }

    function showCrewPreview(id, trigger) {
        const record = searchState.lookupResultsById.get(id);
        const pane = document.querySelector('.lookup-crew-pane');
        if (!pane || !record) return;
        searchState.activeCrewRecordId = id;
        crewReturnFocus = trigger;
        pane.innerHTML = buildCrewDisplayCard(record);
        pane.hidden = false;
        pane.closest('.lookup-workspace').classList.add('has-crew-preview');
        if (window.matchMedia('(max-width: 760px)').matches) {
            pane.setAttribute('role', 'dialog'); pane.setAttribute('aria-modal', 'true');
            pane.closest('.lookup-workspace').querySelector('.lookup-result-column').inert = true;
            document.querySelector('.search-command-bar').inert = true;
        }
        if (window.location.hash !== '#crew') history.pushState({crew: true, lookupId: id}, '', '#crew');
        pane.querySelector('[data-lookup-crew-close]').focus({preventScroll: true});
    }

    function hideCrewPreview(restore = true) {
        const pane = document.querySelector('.lookup-crew-pane');
        searchState.activeCrewRecordId = '';
        if (pane) {
            pane.hidden = true;
            pane.closest('.lookup-workspace')?.classList.remove('has-crew-preview');
            const column = pane.closest('.lookup-workspace')?.querySelector('.lookup-result-column');
            if (column) column.inert = false;
        }
        const command = document.querySelector('.search-command-bar');
        if (command) command.inert = false;
        if (restore) {
            crewReturnFocus?.focus?.({preventScroll: true});
            if (window.location.hash === '#crew') history.back();
        }
    }

    function initializeSearch() {
        const overlay = document.getElementById('search-overlay');
        const trigger = document.getElementById('nav-search-trigger');
        const closeBtn = document.getElementById('search-close-btn');
        const form = document.getElementById('search-form');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        const modeButtons = document.querySelectorAll('[data-search-tool-mode]');
        const lookupCategoryRow = document.getElementById('lookup-category-row');
        const lookupDiningFilterRow = document.getElementById('lookup-dining-filter-row');
        const lookupRestaurantSelect = document.getElementById('lookup-menu-restaurant-select');
        const shortcutToggle = document.getElementById('search-shortcut-toggle');
        const backdrop = overlay?.querySelector('[data-search-close]');

        if (!overlay || !trigger || !closeBtn || !form || !input || !results) return;

        prepareSearchDocuments();
        syncSearchModeUi();

        function runSearchPreview(rawValue) {
            performActiveSearch(rawValue);
        }

        function submitCurrentSearch() {
            searchState.pendingSubmit = false;
            performActiveSearch(input.value);
        }

        function applySearchQuery(query, options = {}) {
            const nextQuery = String(query || '').trim();
            if (options.mode || options.lookupCategory) {
                setSearchToolMode(options.mode || searchState.mode, {
                    lookupCategory: options.lookupCategory || 'all',
                    lookupDiningFilter: options.lookupDiningFilter || 'all',
                    lookupRestaurantFilter: options.lookupRestaurantFilter || 'all'
                });
            }
            input.value = nextQuery;
            if (overlay.hidden) openSearchOverlay({...options, menu: options.lookupCategory === 'dining' && !nextQuery, skipSearch: true, focusInput: options.focusInput ?? Boolean(nextQuery)});
            performActiveSearch(nextQuery);
            if (options.focusInput ?? Boolean(nextQuery)) input.focus({preventScroll: true});
        }
        openNotebookSearch = applySearchQuery;

        trigger.addEventListener('click', () => openSearchOverlay());
        closeBtn.addEventListener('click', () => closeSearchOverlay());
        backdrop?.addEventListener('click', () => searchState.activeCrewRecordId ? hideCrewPreview() : closeSearchOverlay());

        document.addEventListener('click', event => {
            const chip = event.target.closest('[data-search-query]');
            if (!chip) return;

            event.preventDefault();
            const query = chip.hasAttribute('data-search-query')
                ? chip.dataset.searchQuery
                : (chip.textContent || '');
            applySearchQuery(query, {
                mode: chip.dataset.searchModeTarget,
                lookupCategory: chip.dataset.lookupCategory,
                lookupDiningFilter: chip.dataset.lookupDiningFilter,
                lookupRestaurantFilter: chip.dataset.lookupRestaurantFilter
            });
            setShortcutDrawerOpen(false);
        });

        shortcutToggle?.addEventListener('click', () => {
            setShortcutDrawerOpen(!searchState.shortcutOpen);
        });

        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                setSearchToolMode(button.dataset.searchToolMode);
                performActiveSearch(input.value);
            });
        });

        lookupCategoryRow?.addEventListener('click', event => {
            const button = event.target.closest('[data-lookup-category]');
            if (!button) return;
            setSearchToolMode('lookup', { lookupCategory: button.dataset.lookupCategory });
            performLookupSearch(input.value);
        });

        lookupDiningFilterRow?.addEventListener('click', event => {
            const button = event.target.closest('[data-lookup-dining-filter]');
            if (!button) return;
            setSearchToolMode('lookup', {
                lookupCategory: 'dining',
                lookupDiningFilter: button.dataset.lookupDiningFilter
            });
            performLookupSearch(input.value);
        });

        lookupRestaurantSelect?.addEventListener('change', () => {
            setSearchToolMode('lookup', {
                lookupCategory: 'dining',
                lookupRestaurantFilter: lookupRestaurantSelect.value
            });
            performLookupSearch(input.value);
        });

        input.addEventListener('input', () => {
            window.clearTimeout(searchState.debounceTimer);
            if (searchState.isComposing) {
                return;
            }

            searchState.debounceTimer = window.setTimeout(() => {
                runSearchPreview(input.value);
            }, 110);
        });

        input.addEventListener('compositionstart', () => {
            searchState.isComposing = true;
            searchState.pendingSubmit = false;
            window.clearTimeout(searchState.debounceTimer);
        });

        input.addEventListener('compositionend', () => {
            searchState.isComposing = false;
            runSearchPreview(input.value);

            if (searchState.pendingSubmit) {
                submitCurrentSearch();
            }
        });

        form.addEventListener('submit', event => {
            event.preventDefault();

            if (searchState.isComposing) {
                searchState.pendingSubmit = true;
                return;
            }

            submitCurrentSearch();
        });

        results.addEventListener('click', event => {
            const loadButton = event.target.closest('[data-menu-load-action]');
            if (loadButton) {
                event.preventDefault();
                renderLookupMenuLoadState('loading');
                ensureMenuLookupDataLoaded({ retry: loadButton.dataset.menuLoadAction === 'retry-search' })
                    .then(() => {
                        performLookupSearch(input.value);
                    })
                    .catch(error => {
                        renderLookupMenuLoadState('error', error);
                    });
                return;
            }

            const copyButton = event.target.closest('[data-copy-text]');
            if (copyButton) {
                event.preventDefault();
                event.stopPropagation();
                copyTextToClipboard(copyButton.dataset.copyText || '', copyButton);
                return;
            }

            const lookupButton = event.target.closest('.lookup-crew-trigger');
            if (lookupButton) {
                event.preventDefault();
                window.clearTimeout(searchState.debounceTimer);
                if (normalizeSearchText(input.value) !== searchState.lastQuery) performActiveSearch(input.value);
                showCrewPreview(lookupButton.dataset.lookupId || '', lookupButton);
                return;
            }

            const crewCloseButton = event.target.closest('[data-lookup-crew-close]');
            if (crewCloseButton) {
                event.preventDefault();
                event.stopPropagation();
                hideCrewPreview();
                return;
            }

            const button = event.target.closest('.search-result-card');
            if (!button) return;

            const result = searchState.resultsById.get(button.dataset.resultId);
            navigateToSearchResult(result);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !overlay.hidden) {
                event.preventDefault();
                if (searchState.activeCrewRecordId) hideCrewPreview(); else closeSearchOverlay();
            }
            if (event.key === 'Tab' && !overlay.hidden) {
                const pane = overlay.querySelector('.lookup-crew-pane:not([hidden])');
                const root = pane && window.matchMedia('(max-width: 760px)').matches ? pane : overlay;
                const focusable = Array.from(root.querySelectorAll('button, input, select, a[href], summary')).filter(element => !element.disabled && !element.closest('[hidden], [inert]') && element.getClientRects().length);
                const first = focusable[0], last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last?.focus();}
                else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first?.focus();}
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                openSearchOverlay();
            }
        });

        renderSearchResults([], '');
    }

    function getEntityDestination(entityId) {
        for (const [groups, field, bindingGroup] of [[showGuideData, 'shows', 'shows'], [deckGuideData, 'facilities', 'deckFacilities']]) {
            for (const group of groups) {
                const item = group[field].find(record => getAiEntityBinding(bindingGroup, record.bindingKey)?.entityRefs.includes(entityId));
                if (item) return item.id;
            }
        }
        return '';
    }

    function renderEntityLinks(entityIds = [], excludeId = '') {
        const destinations = new Set();
        const links = entityIds.map(id => {
            const entity = getAiEntityRegistryEntry(id);
            const destination = getEntityDestination(id);
            if (!entity || !destination || destination === excludeId || destinations.has(destination)) return '';
            destinations.add(destination);
            return `<a href="#${destination}"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(entity.displayNameZh)}</a>`;
        }).filter(Boolean).slice(0, 3);
        return links.length ? `<div class="entity-links">${links.join('')}</div>` : '';
    }

    function setExploreTab(tab) {
        notebookState.exploreTab = ['shows','playbook'].includes(tab) ? tab : 'facilities';
        document.querySelectorAll('[data-explore-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.exploreTab === notebookState.exploreTab)));
        document.getElementById('playbook').hidden = notebookState.exploreTab !== 'playbook';
        document.getElementById('deck-guide').hidden = notebookState.exploreTab === 'playbook';
        document.getElementById('ship-stats').hidden = notebookState.exploreTab !== 'facilities';
        if (notebookState.exploreTab !== 'playbook') setDeckGuideTab(notebookState.exploreTab === 'shows' ? 'shows' : notebookState.deck);
    }

    function renderTravelReferences() {
        const root = document.getElementById('travel-reference-content');
        if (!root) return;
        const records = (window.TRAVEL_REFERENCE_DATA?.records || []).filter(record => !record.targetId);
        const labels = { overview: '同行與交通', timeline: '預約與報到', checkin: '入境與登船', 'local-info': '新加坡與機場' };
        root.innerHTML = Object.entries(labels).map(([section, label]) => `
            <section class="reference-group" id="${section}"><h3>${label}</h3>
                ${records.filter(record => record.sectionId === section).map(record => `<details class="reference-item" id="${record.id}"><summary>${escapeHtml(record.title)}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary><div class="reference-body">${record.bodyHtml}</div></details>`).join('')}
            </section>`).join('');
    }

    function revealNotebookTarget(id) {
        const target = document.getElementById(id);
        if (!target) return;
        if (target.tagName === 'DETAILS') target.open = true;
        let parent = target.parentElement;
        while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
        target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
        scrollToTarget(target);
    }

    function navigateNotebook(rawHash, options = {}) {
        if (!notebookState.ready) return;
        let id = String(rawHash || 'journey').replace(/^#/, '');
        const references = window.TRAVEL_REFERENCE_DATA || {};
        if (searchState.closingHash === '#' + id) {
            searchState.closingHash = null;
            window.scrollTo({top: searchState.returnScroll || 0, behavior: 'instant'});
            return;
        }
        if (id === 'crew') {
            const lookupId = history.state?.lookupId;
            const trigger = Array.from(document.querySelectorAll('[data-lookup-id]')).find(button => button.dataset.lookupId === lookupId);
            if (trigger) showCrewPreview(lookupId, trigger);
            else {
                history.replaceState(null, '', '#search');
                openSearchOverlay({fromRoute: true, focusInput: false});
            }
            return;
        }
        if (id === 'search' || id === 'menu-search' || id === 'menu-lookup') {
            if (searchState.activeCrewRecordId) {
                hideCrewPreview(false);
                crewReturnFocus?.focus?.({preventScroll: true});
            }
            if (document.getElementById('search-overlay').hidden) {
                if (id === 'search') openSearchOverlay({fromRoute: true});
                else openNotebookSearch('', {mode: 'lookup', lookupCategory: 'dining', lookupDiningFilter: 'all', lookupRestaurantFilter: 'all', fromRoute: true, focusInput: false});
            }
            return;
        }
        if (!document.getElementById('search-overlay').hidden) {
            const returning = '#' + id === searchState.returnHash;
            closeSearchOverlay({fromRoute: true});
            if (returning) return;
        }
        id = references.redirects?.[id] || id;
        const supplement = references.records?.find(record => record.id === id && record.targetId);
        const routeId = supplement?.targetId || id;
        let view = ['explore', 'prepare'].includes(id) ? id : references.legacySections?.[id] || 'journey';
        let focusId = null;
        let tab = null;
        let matched = false;
        for (const day of cruiseSchedule) {
            if (id === day.id || day.periods.some(period => period.events.some(event => event.id === id))) {
                view = 'journey'; setScheduleTab(day.id); focusId = id; matched = true;
            }
        }
        for (const deck of deckGuideData) {
            if (deck.id === id || deck.facilities.some(item => item.id === routeId)) {
                view = 'explore'; tab = 'facilities'; notebookState.deck = deck.id; notebookState.purpose = 'all'; focusId = routeId; matched = true;
            }
        }
        for (const group of showGuideData) {
            if (group.shows.some(item => item.id === routeId)) { view = 'explore'; tab = 'shows'; focusId = routeId; matched = true; }
        }
        for (const mission of playbookGuideData) {
            if (mission.items.some(item => item.id === routeId)) {
                view = 'explore'; tab = 'playbook'; setPlaybookMission(mission.id, {openItemId: routeId}); focusId = id; matched = true;
            }
        }
        if (view === 'shows' || id === 'explore/shows') {view = 'explore'; tab = 'shows';}
        if (view === 'playbook' || id === 'explore/playbook') {view = 'explore'; tab = 'playbook';}
        if (id === 'facilities') {tab = 'facilities'; notebookState.purpose = 'all'; notebookState.deck = 'all';}
        if (id === 'tips') setPlaybookMission('daily-ops');
        if (references.records?.some(record => record.id === id && !record.targetId)) {view = 'prepare'; focusId = id;}
        if (['overview','timeline','checkin','local-info','checklist','ship-stats'].includes(id)) focusId = id;
        if (notebookState.view !== view) notebookState.scroll[notebookState.view] = window.scrollY;
        notebookState.view = view;
        document.querySelectorAll('[data-view]').forEach(element => {element.hidden = element.dataset.view !== view;});
        document.querySelectorAll('[data-view-link]').forEach(link => {
            if (link.dataset.viewLink === view) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        });
        if (view === 'explore') setExploreTab(tab || notebookState.exploreTab);
        if (options.push) history.pushState(null, '', '#' + String(rawHash).replace(/^#/, ''));
        if (focusId) requestAnimationFrame(() => revealNotebookTarget(focusId));
        else if (options.scroll !== false) window.scrollTo({top: notebookState.scroll[view] || 0, behavior: 'instant'});
    }

    function initializeNotebook() {
        if (!document.getElementById('main-content')) return;
        // The notebook restores each view itself, including after dialog history entries.
        history.scrollRestoration = 'manual';
        renderTravelReferences();
        notebookState.ready = true;
        const singaporeDate = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
        const travelDates = {'2027-01-25':'day1','2027-01-26':'day2','2027-01-27':'day3','2027-01-28':'day4'};
        setScheduleTab(travelDates[singaporeDate] || 'day1');
        document.querySelectorAll('[data-explore-tab]').forEach(button => button.addEventListener('click', () => {
            setExploreTab(button.dataset.exploreTab);
            history.replaceState(null, '', button.dataset.exploreTab === 'facilities' ? '#explore' : '#explore/' + button.dataset.exploreTab);
        }));
        document.addEventListener('click', event => {
            const link = event.target.closest('a[href^="#"]');
            if (!link || link.hasAttribute('data-search-query')) return;
            const hash = link.getAttribute('href');
            if (hash === '#main-content') return;
            event.preventDefault();
            navigateNotebook(hash, {push: true});
        });
        window.addEventListener('hashchange', () => navigateNotebook(window.location.hash));
        navigateNotebook(window.location.hash, {scroll: false});
        document.getElementById('prepare').addEventListener('toggle', event => {
            if (event.target.open && event.target.querySelector('#weather-widget')) fetchSingaporeWeather();
        }, true);
    }

    if (window.__SEARCH_TEST_HOOKS__ && typeof window.__SEARCH_TEST_HOOKS__ === 'object') {
        Object.assign(window.__SEARCH_TEST_HOOKS__, {
            prepareSearchDocuments,
            getRankedSearchResults,
            getSearchUnits,
            buildSearchResultHighlights,
            createExcerpt,
            buildSearchResultSummaryLine,
            getSearchResultMetaLine,
            getBilingualLookupResults,
            buildCrewDisplayCard,
            getLookupRecords: () => searchState.lookupRecords.slice(),
            getMenuLookupRecords,
            getMenuQuickResults,
            getMenuRestaurantOptions,
            getSearchUiState: () => ({ mode: searchState.mode, query: searchState.lastQuery, category: searchState.lookupCategory }),
            getSearchDocuments: () => searchState.documents.slice()
        });
    }

    if (!window.__SEARCH_SKIP_BOOTSTRAP__) {
        initializeSearch();
        initializeNotebook();
    }

});

