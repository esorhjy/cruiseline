document.addEventListener('DOMContentLoaded', function () {

    let setScheduleTab = () => {};
    let setDeckGuideTab = () => {};
    let setPlaybookMission = () => {};

    const SEARCH_MIN_LENGTH = 2;
    const SEARCH_GROUP_ICONS = {
        '行程': 'fa-solid fa-calendar-days',
        '甲板與表演': 'fa-solid fa-compass',
        '攻略本': 'fa-solid fa-book-open-reader',
        '其他資訊': 'fa-solid fa-folder-open'
    };
    const SEARCH_SYNONYM_GROUPS = [
        ['禮賓', 'concierge', 'lounge', '酒廊', '管家'],
        ['房務', 'room service', '客房服務'],
        ['海洋俱樂部', 'oceaneer', 'kids club', '兒童俱樂部'],
        ['杯麵', 'baymax'],
        ['爆米花', 'popcorn'],
        ['登船', 'check in', 'check-in', 'qr', 'sgac'],
        ['煙火', 'lion king', '獅子王'],
        ['披薩', 'pizza', 'pizza planet'],
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
        '下船',
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
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const searchState = {
        documents: [],
        resultsById: new Map(),
        debounceTimer: null,
        isComposing: false,
        pendingSubmit: false,
        lastQuery: '',
        lastResults: [],
        lastQueryData: null
    };
    const runtimeState = {
        bubbleTimer: null,
        countdownTimer: null,
        scrollTicking: false
    };

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

    function shouldPauseAmbientEffects() {
        return document.hidden || prefersReducedMotion.matches;
    }

    function canUseCursorSparkles() {
        return finePointerQuery.matches && !shouldPauseAmbientEffects();
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
        return `search-schedule-${dayId}-${periodIndex}-${eventIndex}`;
    }

    function getDeckFacilityId(deckId, facilityIndex) {
        return `search-deck-${deckId}-${facilityIndex}`;
    }

    function getShowItemId(categoryId, showIndex) {
        return `search-show-${categoryId}-${showIndex}`;
    }

    function getPlaybookItemId(missionId, itemIndex) {
        return `search-playbook-${missionId}-${itemIndex}`;
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

    // 2. 元素淡入動畫
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.id === 'ship-stats') {
                    animateShipStats();
                }
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    function animateShipStats() {
        const numbers = document.querySelectorAll('.stat-number');
        numbers.forEach(num => {
            const target = +num.getAttribute('data-target');
            const increment = target / 50;
            let count = 0;
            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    num.innerText = Math.ceil(count).toLocaleString();
                    setTimeout(updateCount, 30);
                } else {
                    num.innerText = target.toLocaleString();
                }
            };
            updateCount();
        });
        const bars = document.querySelectorAll('.stat-progress-fill');
        bars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            if (bar) bar.style.width = width + '%';
        });
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. 倒數計時
    const targetDate = new Date("2027-01-25T11:00:00+08:00").getTime();
    const cdDays = document.getElementById("cd-days");
    const cdHours = document.getElementById("cd-hours");
    const cdMinutes = document.getElementById("cd-minutes");
    const cdSeconds = document.getElementById("cd-seconds");
    const countdownContainer = document.getElementById("countdown");

    function stopCountdownTimer() {
        if (runtimeState.countdownTimer) {
            window.clearInterval(runtimeState.countdownTimer);
            runtimeState.countdownTimer = null;
        }
    }

    function syncCountdownTimer() {
        if (!countdownContainer) return;
        if (shouldPauseAmbientEffects()) {
            stopCountdownTimer();
            return;
        }
        if (runtimeState.countdownTimer) return;

        runtimeState.countdownTimer = window.setInterval(() => {
            if (!document.hidden) {
                updateCountdown();
            }
        }, 1000);
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            if (countdownContainer) countdownContainer.innerHTML = "<div class='countdown-item' style='width:auto; padding: 10px 30px;'><span class='cd-num' style='font-size: 1.8rem;'>✨ 魔法已啟航！ ✨</span></div>";
            stopCountdownTimer();
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (cdDays) cdDays.innerText = days.toString().padStart(2, '0');
        if (cdHours) cdHours.innerText = hours.toString().padStart(2, '0');
        if (cdMinutes) cdMinutes.innerText = minutes.toString().padStart(2, '0');
        if (cdSeconds) cdSeconds.innerText = seconds.toString().padStart(2, '0');
    }
    updateCountdown();
    syncCountdownTimer();

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
    fetchSingaporeWeather();

    // 6. 魔法彩蛋
    let eggClicks = 0;
    const eggTrigger = document.getElementById('easter-egg-trigger');
    if (eggTrigger) {
        eggTrigger.addEventListener('click', () => {
            eggClicks++;
            eggTrigger.style.transform = `scale(${1 + eggClicks * 0.05})`;
            if (eggClicks === 3) {
                triggerMagic();
                eggClicks = 0;
                setTimeout(() => { eggTrigger.style.transform = 'scale(1)'; }, 1000);
            }
        });
    }

    function triggerMagic() {
        const modal = document.createElement('div');
        modal.className = 'magic-modal';
        modal.innerHTML = `
            <div class="magic-modal-content">
                <div class="mickey-shape" style="font-size: 45px; color: var(--dcl-gold); margin: 0 auto 15px;"></div>
                <h2 style="color: var(--dcl-navy); font-size: 1.8rem; margin-bottom: 15px;">✨ 專屬魔法解鎖 ✨</h2>
                <p style="color: var(--text-gray); font-size: 1.15rem; line-height: 1.6;"><strong>小寶、澤澤、彤妹：</strong><br>準備好跟我們一起迎接<br>最棒的迪士尼海上探險了嗎？</p>
                <button class="modal-close-btn" style="margin-top: 25px; padding: 12px 30px; background: var(--dcl-red); color: white; border: none; border-radius: 30px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(225, 24, 55, 0.4); transition: transform 0.2s;">進入魔法世界</button>
            </div>`;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close-btn').onclick = () => modal.remove();
        if (!prefersReducedMotion.matches) {
            createConfetti();
        }
    }

    function createConfetti() {
        const colors = ['#E11837', '#F3B500', '#0A3A70', '#FFFFFF'];
        const container = document.createElement('div');
        container.style.position = 'fixed'; container.style.top = '0'; container.style.left = '0';
        container.style.width = '100vw'; container.style.height = '100vh';
        container.style.pointerEvents = 'none'; container.style.zIndex = '9999';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            const color = colors[Math.floor(Math.random() * colors.length)];
            if (Math.random() > 0.5) {
                particle.innerHTML = '<i class="fa-solid fa-star"></i>';
                particle.style.color = color;
                particle.style.fontSize = (Math.random() * 12 + 10) + 'px';
            } else {
                particle.innerHTML = '<div class="mickey-shape"></div>';
                particle.style.color = color;
                particle.style.fontSize = (Math.random() * 15 + 10) + 'px';
            }
            container.appendChild(particle);
        }
        setTimeout(() => container.remove(), 6000);
    }

    // 7. 游標魔法 (PC)
    let lastSparkleTime = 0;
    if (finePointerQuery.matches) {
        document.addEventListener('mousemove', (e) => {
            if (!canUseCursorSparkles()) return;
            const now = Date.now();
            if (now - lastSparkleTime < 60) return;
            lastSparkleTime = now;
            if (Math.random() > 0.4) {
                const sparkle = document.createElement('i');
                sparkle.className = 'fa-solid fa-star cursor-sparkle';
                sparkle.style.left = e.clientX + 'px';
                sparkle.style.top = e.clientY + 'px';
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 800);
            }
        });
    }

    // 8. 漂浮泡泡
    function createMickeyBubble() {
        if (shouldPauseAmbientEffects()) return;
        const bubble = document.createElement('div');
        bubble.className = 'mickey-shape mickey-bubble';
        bubble.style.left = Math.random() * 90 + 'vw';
        const size = Math.random() * 20 + 20;
        bubble.style.fontSize = `${size}px`;
        bubble.addEventListener('click', function () {
            this.classList.add('bubble-pop');
            this.innerHTML = '<i class="fa-solid fa-sparkles"></i>';
            setTimeout(() => this.remove(), 300);
        });
        document.body.appendChild(bubble);
        setTimeout(() => { if (document.body.contains(bubble)) bubble.remove(); }, 12000);
    }

    function stopBubbleLoop() {
        if (runtimeState.bubbleTimer) {
            window.clearInterval(runtimeState.bubbleTimer);
            runtimeState.bubbleTimer = null;
        }
    }

    function syncBubbleLoop() {
        if (shouldPauseAmbientEffects()) {
            stopBubbleLoop();
            return;
        }
        if (runtimeState.bubbleTimer) return;

        runtimeState.bubbleTimer = window.setInterval(() => {
            if (!document.hidden) {
                createMickeyBubble();
            }
        }, 6000);
    }

    syncBubbleLoop();

    function syncAmbientRuntime() {
        updateCountdown();
        syncCountdownTimer();
        syncBubbleLoop();
    }

    document.addEventListener('visibilitychange', () => {
        syncAmbientRuntime();
    });

    if (typeof prefersReducedMotion.addEventListener === 'function') {
        prefersReducedMotion.addEventListener('change', syncAmbientRuntime);
    } else if (typeof prefersReducedMotion.addListener === 'function') {
        prefersReducedMotion.addListener(syncAmbientRuntime);
    }

    // 9. 動態渲染行程表資料
    function renderSchedule() {
        if (typeof cruiseSchedule === 'undefined') return;

        cruiseSchedule.forEach(dayData => {
            const container = document.getElementById(dayData.id);
            if (!container) return;

            // 清空容器 (防範二次渲染)
            container.innerHTML = '';

            // 1. 生成標題與目標
            let html = `
                <div class="day-header">
                    <h3>${dayData.dateTitle}</h3>
                </div>
                <div class="day-goal">
                    <strong>核心目標：</strong>
                    <ul style="margin: 5px 0 0 20px; padding: 0;">
                        ${dayData.goals.map(g => `<li>${g}</li>`).join('')}
                    </ul>
                </div>
                <div class="schedule-list">
            `;

            // 2. 生成各個時段 (Periods)
            dayData.periods.forEach((period, periodIndex) => {
                html += `
                    <div class="period-header">
                        <h4>${period.name}</h4>
                    </div>
                `;

                // 3. 生成時段內的事件 (Events)
                period.events.forEach((event, eventIndex) => {
                    const eventId = getScheduleEventId(dayData.id, periodIndex, eventIndex);
                    html += `
                        <div class="schedule-item" id="${eventId}" data-search-id="${eventId}">
                            <div class="schedule-time">${event.time}</div>
                            <div class="schedule-marker"></div>
                            <div class="schedule-content">
                                <span class="schedule-tag ${event.tagClass}">${event.tag}</span>
                                <span class="schedule-title">${event.title}</span>
                                <ul class="schedule-desc-list">
                                    ${event.desc.map(d => `<li>${d}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                });
            });

            html += `</div>`; // Close .schedule-list
            container.innerHTML = html;
        });
    }

    // 執行渲染
    renderSchedule();

    // 10. 行前準備清單渲染與邏輯 (Phase 4)
    function renderChecklist() {
        const grid = document.getElementById('checklist-grid');
        if (!grid || typeof checklistData === 'undefined') return;

        // 讀取本地儲存狀態
        const savedStatus = JSON.parse(localStorage.getItem('dcl_checklist_status') || '{}');

        checklistData.forEach(category => {
            const catDiv = document.createElement('div');
            catDiv.className = 'checklist-category';
            
            catDiv.innerHTML = `
                <h3><i class="fa-solid fa-star"></i> ${category.category}</h3>
                <div class="checklist-items"></div>
            `;
            
            const itemsDiv = catDiv.querySelector('.checklist-items');
            
            category.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = `checklist-item ${savedStatus[item.id] ? 'checked' : ''}`;
                itemDiv.dataset.id = item.id;
                
                itemDiv.innerHTML = `
                    <div class="checklist-checkbox"></div>
                    <div class="checklist-item-text">${item.text}</div>
                `;
                
                itemDiv.addEventListener('click', () => {
                    const isChecked = itemDiv.classList.toggle('checked');
                    
                    // 更新本地儲存
                    const currentStatus = JSON.parse(localStorage.getItem('dcl_checklist_status') || '{}');
                    currentStatus[item.id] = isChecked;
                    localStorage.setItem('dcl_checklist_status', JSON.stringify(currentStatus));
                });
                
                itemsDiv.appendChild(itemDiv);
            });
            
            grid.appendChild(catDiv);
        });
    }

    renderChecklist();

    // 11. 甲板與表演設施導覽 (Phase 5)
    function renderDeckGuide() {
        const tabsContainer = document.getElementById('deck-tabs');
        const contentContainer = document.getElementById('deck-guide-content');
        if (!tabsContainer || !contentContainer || typeof deckGuideData === 'undefined' || typeof showGuideData === 'undefined') return;

        const tabs = [
            ...deckGuideData.map(deck => ({ id: deck.id, label: deck.label })),
            { id: 'shows', label: '表演精華' }
        ];

        const defaultDeck = deckGuideData.find(deck => deck.id === 'deck17') || deckGuideData[0];
        let activeTab = defaultDeck.id;

        tabsContainer.innerHTML = tabs.map(tab => `
            <button type="button" class="deck-tab-btn ${tab.id === activeTab ? 'active' : ''}" data-deck-tab="${tab.id}">
                ${tab.label}
            </button>
        `).join('');

        const tabButtons = tabsContainer.querySelectorAll('.deck-tab-btn');

        function buildDeckMarkup(deck) {
            return `
                <div class="deck-info-header">
                    <div class="deck-info-copy">
                        <span class="deck-kicker">${deck.label}</span>
                        <h3>${deck.title}</h3>
                        <div class="deck-theme">${deck.theme}</div>
                    </div>
                    <div class="deck-trip-focus">
                        <i class="fa-solid fa-route"></i>
                        <span>${deck.tripFocus}</span>
                    </div>
                </div>
                <div class="deck-badges">
                    ${deck.badges.map(badge => `
                        <span class="deck-badge">
                            <i class="fa-solid fa-star"></i>${badge}
                        </span>
                    `).join('')}
                </div>
                <div class="facility-grid">
                    ${deck.facilities.map((facility, facilityIndex) => {
                        const facilityId = getDeckFacilityId(deck.id, facilityIndex);
                        return `
                        <article class="facility-card ${facility.highlight ? 'highlight' : ''}" id="${facilityId}" data-search-id="${facilityId}">
                            <div class="facility-icon">
                                <i class="${facility.icon}"></i>
                            </div>
                            <div class="facility-content">
                                <span class="facility-name">${facility.name}</span>
                                <p class="facility-desc">${facility.summary}</p>
                                <div class="facility-meta">
                                    <span><i class="fa-regular fa-clock"></i> 最佳時機：${facility.bestTime}</span>
                                    <span><i class="fa-solid fa-wand-magic-sparkles"></i> 這趟用途：${facility.tripUse}</span>
                                </div>
                            </div>
                        </article>
                    `;
                    }).join('')}
                </div>
            `;
        }

        function buildShowMarkup() {
            return `
                <div class="performance-grid">
                    ${showGuideData.map(category => `
                        <section class="performance-category">
                            <h3><i class="${category.icon}"></i> ${category.title}</h3>
                            <p class="performance-intro">${category.intro}</p>
                            ${category.shows.map((show, showIndex) => {
                                const showId = getShowItemId(category.id, showIndex);
                                return `
                                <article class="show-item" id="${showId}" data-search-id="${showId}">
                                    <span class="show-title">${show.name}</span>
                                    <p class="show-desc">${show.theme}</p>
                                    <div class="show-meta">
                                        <span><i class="fa-solid fa-location-dot"></i> ${show.location}</span>
                                        <span><i class="fa-regular fa-clock"></i> ${show.timingTip}</span>
                                        <span><i class="fa-solid fa-calendar-check"></i> ${show.tripLink}</span>
                                    </div>
                                </article>
                            `;
                            }).join('')}
                        </section>
                    `).join('')}
                </div>
            `;
        }

        function updateDeckGuide(targetId) {
            activeTab = targetId;
            tabButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.deckTab === activeTab);
            });

            if (activeTab === 'shows') {
                contentContainer.innerHTML = buildShowMarkup();
                return;
            }

            const deck = deckGuideData.find(item => item.id === activeTab) || defaultDeck;
            contentContainer.innerHTML = buildDeckMarkup(deck);
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                updateDeckGuide(button.dataset.deckTab);
            });
        });

        setDeckGuideTab = updateDeckGuide;
        updateDeckGuide(activeTab);
    }

    renderDeckGuide();

    // 12. 實戰攻略 Playbook
    function renderPlaybookGuide() {
        const missionsContainer = document.getElementById('playbook-missions');
        const contentContainer = document.getElementById('playbook-content');
        if (!missionsContainer || !contentContainer || typeof playbookGuideData === 'undefined') return;

        const relatedSectionLabels = {
            checklist: '行前防呆清單',
            timeline: '準備時間軸',
            checkin: '通關與登船',
            facilities: '兒童育樂',
            'deck-guide': '甲板導覽',
            entertainment: '娛樂大秀',
            tips: '購物、預算與離船',
            'local-info': '在地工具'
        };

        const sourceMeta = {
            official: { label: '官方規則', icon: 'fa-solid fa-shield-heart' },
            concierge: { label: '禮賓加值', icon: 'fa-solid fa-crown' },
            community: { label: '社群心得', icon: 'fa-solid fa-comments' }
        };

        const missionIcons = {
            pretrip: 'fa-solid fa-passport',
            'embark-sprint': 'fa-solid fa-bolt',
            'daily-ops': 'fa-solid fa-wand-magic-sparkles',
            'concierge-plus': 'fa-solid fa-crown',
            'stateroom-family': 'fa-solid fa-bed',
            'last-night': 'fa-solid fa-anchor'
        };

        let activeMission = playbookGuideData[0]?.id;

        missionsContainer.innerHTML = playbookGuideData.map(mission => `
            <button type="button" class="playbook-mission-btn ${mission.id === activeMission ? 'active' : ''}" data-playbook-mission="${mission.id}">
                <i class="${missionIcons[mission.id] || 'fa-solid fa-compass'}"></i>
                <span>${mission.label}</span>
            </button>
        `).join('');

        const missionButtons = missionsContainer.querySelectorAll('.playbook-mission-btn');

        function buildItemMarkup(item, missionId, itemIndex) {
            const source = sourceMeta[item.sourceType] || sourceMeta.community;
            const relatedLabel = item.relatedSectionId ? relatedSectionLabels[item.relatedSectionId] : '';
            const itemId = getPlaybookItemId(missionId, itemIndex);
            const relatedMarkup = relatedLabel ? `
                <a class="playbook-related-link" href="#${item.relatedSectionId}">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    延伸看法：這張是進階玩法，基本資訊已整理在「${relatedLabel}」
                </a>
            ` : '';

            return `
                <details class="playbook-card source-${item.sourceType}" id="${itemId}" data-search-id="${itemId}">
                    <summary class="playbook-summary">
                        <div class="playbook-card-icon">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="playbook-card-head">
                            <span class="playbook-source-chip ${item.sourceType}">
                                <i class="${source.icon}"></i>${source.label}
                            </span>
                            <h4>${item.title}</h4>
                            <p class="playbook-preview">${item.tripFit}</p>
                        </div>
                        <span class="playbook-toggle" aria-hidden="true">
                            <i class="fa-solid fa-chevron-down"></i>
                        </span>
                    </summary>
                    <div class="playbook-body">
                        <div class="playbook-meta-grid">
                            <div class="playbook-meta-block">
                                <span class="playbook-meta-label">何時用</span>
                                <p>${item.whenToUse}</p>
                            </div>
                            <div class="playbook-meta-block">
                                <span class="playbook-meta-label">這趟怎麼用</span>
                                <p>${item.action}</p>
                            </div>
                        </div>
                        <div class="playbook-emphasis">
                            <div class="playbook-note playbook-tripfit">
                                <i class="fa-solid fa-route"></i>
                                <div>
                                    <span class="playbook-meta-label">這趟最有感的原因</span>
                                    <p>${item.tripFit}</p>
                                </div>
                            </div>
                            <div class="playbook-note playbook-caution">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <div>
                                    <span class="playbook-meta-label">避免踩雷</span>
                                    <p>${item.caution}</p>
                                </div>
                            </div>
                        </div>
                        ${relatedMarkup}
                    </div>
                </details>
            `;
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
                        <span class="playbook-kicker">Captain's Pocket Guide</span>
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

        setPlaybookMission = updatePlaybook;
        updatePlaybook(activeMission);
    }

    renderPlaybookGuide();

    // 13. 行程表頁籤切換
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateScheduleTab(targetId) {
        tabBtns.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tab') === targetId);
        });
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetId);
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activateScheduleTab(btn.getAttribute('data-tab'));
        });
    });

    setScheduleTab = activateScheduleTab;

    // 14. 導覽列與漢堡選單
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 15. 全站搜尋
    function stripHtmlTags(text) {
        return String(text || '').replace(/<[^>]+>/g, ' ');
    }

    function getSectionLabel(sectionId) {
        const labels = {
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
            keywords.push('room service', '客房服務', '房務');
        }

        if (normalized.includes('open house') || normalized.includes('oceaneer') || normalized.includes('kids club')) {
            keywords.push('open house', 'oceaneer', 'kids club', '孩子', '兒童');
        }

        if (normalized.includes('披薩') || normalized.includes('pizza') || normalized.includes('補給') || normalized.includes('點心') || normalized.includes('快餐')) {
            keywords.push('披薩', 'pizza', '補給', '點心', '快餐');
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
            ...seedKeywords,
            ...(Array.isArray(config.keywordHints) ? config.keywordHints : []),
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
                    const binding = getAiEntityBinding('scheduleEvents', `${dayData.id}:${periodIndex}:${eventIndex}`);
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
                const binding = getAiEntityBinding('deckFacilities', `${deck.id}:${facilityIndex}`);
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
                const binding = getAiEntityBinding('shows', `${category.id}:${showIndex}`);
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
                const binding = getAiEntityBinding('playbookItems', `${mission.id}:${itemIndex}`);
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
        const sectionConfigs = [
            { sectionId: 'overview', selector: '.card' },
            { sectionId: 'timeline', selector: '.timeline-content' },
            { sectionId: 'checkin', selector: '.card' },
            { sectionId: 'facilities', selector: '.card' },
            { sectionId: 'entertainment', selector: '.card' },
            { sectionId: 'tips', selector: '.card' },
            { sectionId: 'local-info', selector: '.card' }
        ];

        return sectionConfigs.flatMap(config => {
            const section = document.getElementById(config.sectionId);
            if (!section) return [];

            const sectionLabel = getSectionLabel(config.sectionId);
            const cards = section.querySelectorAll(config.selector);
            return Array.from(cards).map((card, cardIndex) => {
                if (!card.id) {
                    card.id = getStaticCardId(config.sectionId, cardIndex);
                }

                const titleNode = card.querySelector('h3, h4');
                const title = titleNode ? titleNode.textContent.trim() : sectionLabel;
                const text = card.textContent.replace(/\s+/g, ' ').trim();

                return {
                    id: card.id,
                    parentId: card.id,
                    sourceType: 'static',
                    sourceDetailType: 'general',
                    sectionId: config.sectionId,
                    groupLabel: '其他資訊',
                    title,
                    text,
                    structuredText: text,
                    keywords: [sectionLabel, title],
                    locationLabel: sectionLabel,
                    navTarget: {
                        type: 'static',
                        itemId: card.id
                    },
                    fieldType: 'parent',
                    fieldLabel: getAiFieldLabel('parent'),
                    timeHint: '',
                    bestTimeHint: '',
                    evidenceRoleHints: [],
                    aiOnly: false
                };
            });
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
        const literalAnchors = uniqueItems([
            ...(normalizedQuery.includes(' ') ? [normalizedQuery] : []),
            ...matchingTerms,
            ...splitUnits.filter(unit => unit.length >= 2)
        ]).slice(0, 12);
        const canonicalEntities = inferEntityRefsFromText([rawQuery], 6);
        const requiredCapabilities = detectAiRequiredCapabilities(normalizedQuery, {
            literalAnchors: matchingTerms,
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
            ...matchingTerms
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
            ...matchingTerms,
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
        const strongLiteralAnchorHit = literalTitleHit || literalProperHit || literalAliasHit;
        const directAnchorHit = literalTitleHit || literalProperHit || literalAliasHit || literalKeywordHit;
        const canonicalEntityMatchCount = countCanonicalEntityMatches(doc, canonicalEntities);
        const supportEntityMatchCount = countSupportEntityMatches(doc, canonicalEntities);
        const capabilityHitCount = requiredCapabilities.filter(capabilityId => resultMatchesCapability(doc, capabilityId)).length;
        const sourceBucket = getSearchResultSourceBucket(doc);
        const weakKeywordOnlyHit = literalKeywordHit
            && !literalTitleHit
            && !literalProperHit
            && !literalAliasHit
            && !canonicalEntityMatchCount
            && !supportEntityMatchCount;

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
        const strongLiteralAnchorHit = documentHasStrongLiteralAnchorHit(result, literalAnchors);
        const entityMatchCount = countCanonicalEntityMatches(result, queryData.canonicalEntities || []);
        const entityMatchRatio = entityMatchCount / Math.max(1, Number(result.entityBreadth) || 1);
        const strongEntityHit = entityMatchCount > 0 && ((Number(result.entityBreadth) || 1) <= 2 || entityMatchRatio >= 0.45);
        const capabilityHit = (queryData.requiredCapabilities || []).some(capabilityId => resultMatchesCapability(result, capabilityId));
        const effectiveStrongLiteralHit = result?.sourceType === 'playbook' && (Number(result.entityBreadth) || 1) >= 4
            ? literalTitleHit
            : strongLiteralAnchorHit;
        const strongHit = effectiveStrongLiteralHit || strongEntityHit || capabilityHit;

        if (sourceBucket === 'primary' && strongHit) return 0;
        if (sourceBucket === 'playbook' && strongHit) return 1;
        if (queryData.scheduleIntent && result.sourceType === 'schedule' && strongHit) return 2;
        if (sourceBucket === 'primary' && documentHasLiteralAnchorHit(result, literalAnchors)) return 2;
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

        const groupedResults = new Map();
        results.forEach(result => {
            if (!groupedResults.has(result.groupLabel)) {
                groupedResults.set(result.groupLabel, []);
            }
            groupedResults.get(result.groupLabel).push(result);
        });

        const groupOrder = ['行程', '甲板與表演', '攻略本', '其他資訊'];
        container.innerHTML = groupOrder
            .filter(groupLabel => groupedResults.has(groupLabel))
            .map(groupLabel => {
                const cards = groupedResults.get(groupLabel)
                    .map(result => {
                        const metaChips = getSearchResultMetaChips(result);
                        const summaryLine = buildSearchResultSummaryLine(result, resolvedQueryData);
                        const metaLine = getSearchResultMetaLine(result);

                        return `
                            <button type="button" class="search-result-card" data-result-id="${result.id}">
                                <div class="search-result-meta">${escapeHtml(metaLine)}</div>
                                <h3 class="search-result-title">${escapeHtml(result.title)}</h3>
                                ${metaChips.length ? `
                                    <div class="search-result-chip-row">
                                        ${metaChips.map(chip => `<span class="search-result-chip">${escapeHtml(chip)}</span>`).join('')}
                                    </div>
                                ` : ''}
                                ${summaryLine ? `<div class="search-result-summary">${escapeHtml(summaryLine)}</div>` : ''}
                            </button>
                        `;
                    })
                    .join('');

                return `
                    <section class="search-group">
                        <div class="search-group-title">
                            <i class="${SEARCH_GROUP_ICONS[groupLabel] || 'fa-solid fa-magnifying-glass'}"></i>
                            <span>${groupLabel}</span>
                        </div>
                        <div class="search-group-list">
                            ${cards}
                        </div>
                    </section>
                `;
            }).join('');
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

    function navigateToSearchResult(result) {
        if (!result?.navTarget) return;

        closeSearchOverlay();

        window.setTimeout(() => {
            const { navTarget } = result;

            if (navTarget.type === 'schedule') {
                setScheduleTab(navTarget.dayId);
                waitForTargetAndScroll(navTarget.itemId);
                return;
            }

            if (navTarget.type === 'deck') {
                setDeckGuideTab(navTarget.tabId);
                waitForTargetAndScroll(navTarget.itemId);
                return;
            }

            if (navTarget.type === 'show') {
                setDeckGuideTab(navTarget.tabId);
                waitForTargetAndScroll(navTarget.itemId);
                return;
            }

            if (navTarget.type === 'playbook') {
                setPlaybookMission(navTarget.missionId, { openItemId: navTarget.itemId });
                waitForTargetAndScroll(navTarget.itemId);
                return;
            }

            waitForTargetAndScroll(navTarget.itemId);
        }, 140);
    }

    function openSearchOverlay() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        const panelBody = document.getElementById('search-panel-body');
        if (!overlay || !input) return;

        searchState.isComposing = false;
        searchState.pendingSubmit = false;
        overlay.hidden = false;
        document.body.classList.add('search-open');
        renderSearchResults([], '');
        if (panelBody) panelBody.scrollTop = 0;
        window.setTimeout(() => input.focus(), 40);
    }

    function closeSearchOverlay() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        const panelBody = document.getElementById('search-panel-body');
        if (!overlay || overlay.hidden) return;

        overlay.hidden = true;
        document.body.classList.remove('search-open');
        if (input) input.value = '';
        if (panelBody) panelBody.scrollTop = 0;
        searchState.isComposing = false;
        searchState.pendingSubmit = false;
        searchState.resultsById = new Map();
        searchState.lastQuery = '';
        searchState.lastResults = [];
        searchState.lastQueryData = null;
    }

    function initializeSearch() {
        const overlay = document.getElementById('search-overlay');
        const trigger = document.getElementById('nav-search-trigger');
        const closeBtn = document.getElementById('search-close-btn');
        const form = document.getElementById('search-form');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        const backdrop = overlay?.querySelector('[data-search-close]');

        if (!overlay || !trigger || !closeBtn || !form || !input || !results) return;

        prepareSearchDocuments();

        function runSearchPreview(rawValue) {
            performSearch(rawValue);
        }

        function submitCurrentSearch() {
            searchState.pendingSubmit = false;
            performSearch(input.value);
        }

        trigger.addEventListener('click', openSearchOverlay);
        closeBtn.addEventListener('click', closeSearchOverlay);
        backdrop?.addEventListener('click', closeSearchOverlay);

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
            const button = event.target.closest('.search-result-card');
            if (!button) return;

            const result = searchState.resultsById.get(button.dataset.resultId);
            navigateToSearchResult(result);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !overlay.hidden) {
                closeSearchOverlay();
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                openSearchOverlay();
            }
        });

        renderSearchResults([], '');
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
            getSearchDocuments: () => searchState.documents.slice()
        });
    }

    if (!window.__SEARCH_SKIP_BOOTSTRAP__) {
        initializeSearch();
    }

});

