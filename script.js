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
    const AI_QUERY_EXTRA_SYNONYM_GROUPS = [
        ['第一天', 'day 1', 'day1', '登船日', '提早登船', '登船後'],
        ['第二天', 'day 2', 'day2'],
        ['第三天', 'day 3', 'day3'],
        ['第四天', 'day 4', 'day4', '下船日'],
        ['孩子', '小孩', '兒童', '親子'],
        ['open house', 'openhouse', '開放參觀'],
        ['早餐', '早上', 'morning'],
        ['下午', '午後', 'afternoon'],
        ['晚上', '今晚', 'night'],
        ['主秀', '看秀', '劇院提前入場'],
        ['玩水', '泳池', 'splash pad', 'toy story pool'],
        ['補給', '點心', '快餐']
    ];
    const AI_QUERY_STOP_WORDS = [
        '什麼', '怎麼', '如何', '請問', '一下', '值得', '推薦', '安排', '有沒有',
        '可以', '是否', '會不會', '需要', '想問', '最', '先', '去', '做', '呢', '嗎',
        '流程', '注意事項', '要不要', '值不值得', '該不該', '比較', '順序', '先後', '限制', '規則'
    ];
    const searchSynonymMap = buildSynonymMap(SEARCH_SYNONYM_GROUPS);
    const searchDisplayMap = buildDisplayMap(SEARCH_SYNONYM_GROUPS);
    const aiSearchSynonymMap = buildSynonymMap([...SEARCH_SYNONYM_GROUPS, ...AI_QUERY_EXTRA_SYNONYM_GROUPS]);
    const aiSearchDisplayMap = buildDisplayMap([...SEARCH_SYNONYM_GROUPS, ...AI_QUERY_EXTRA_SYNONYM_GROUPS]);
    const AI_SEARCH_MIN_LENGTH = 6;
    const AI_CACHE_TTL = 1000 * 60 * 60 * 12;
    const AI_REWRITE_MAX_ATTEMPTS = 1;
    const AI_REWRITE_MAX_RESULTS = 4;
    const AI_REPORT_DEFAULT_MODE = 'report';
    const AI_REPORT_MAX_RESULTS = 24;
    const AI_REPORT_MAX_PARENTS = 10;
    const AI_REPORT_MAX_PER_PARENT = 4;
    const AI_REPORT_STRONG_EVIDENCE_MIN = 4;
    const AI_RESULT_HIGHLIGHT_LIMIT = 4;
    const SITE_SEARCH_SCHEMA_VERSION = 'site-search-v5';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const searchState = {
        documents: [],
        resultsById: new Map(),
        aiCitationsById: new Map(),
        debounceTimer: null,
        isComposing: false,
        pendingSubmit: false,
        aiPending: false,
        activeMode: 'keyword',
        lastQuery: '',
        lastResults: [],
        lastQueryData: null,
        documentVersion: 'base'
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

    function stripAiStopWords(normalizedQuery) {
        let stripped = normalizedQuery;
        AI_QUERY_STOP_WORDS
            .map(word => normalizeSearchText(word))
            .filter(Boolean)
            .sort((a, b) => b.length - a.length)
            .forEach(word => {
                stripped = stripped.replace(new RegExp(escapeRegExp(word), 'g'), ' ');
            });

        return stripped.replace(/\s+/g, ' ').trim();
    }

    function extractChineseNgrams(text, min = 2, max = 4) {
        const compact = String(text || '').replace(/[^\u4e00-\u9fff]/g, '');
        if (compact.length < min) return [];

        const grams = [];
        for (let size = Math.min(max, compact.length); size >= min; size -= 1) {
            for (let index = 0; index <= compact.length - size; index += 1) {
                const gram = compact.slice(index, index + size);
                if (AI_QUERY_STOP_WORDS.includes(gram)) continue;
                grams.push(gram);
            }
        }

        return uniqueItems(grams).slice(0, 10);
    }

    function hasQueryHint(normalizedQuery, terms = []) {
        return terms.some(term => {
            const normalizedTerm = normalizeSearchText(term);
            return normalizedTerm && normalizedQuery.includes(normalizedTerm);
        });
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

    function getAiAnswerEndpoint() {
        const endpointMeta = document.querySelector('meta[name="ai-answer-endpoint"]');
        return endpointMeta?.content?.trim() || '/api/ai-answer';
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
        const keywords = [];

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

    function createSearchDocumentBase(config) {
        const id = config.id;
        const keywords = Array.isArray(config.keywords) ? uniqueItems(config.keywords.filter(Boolean)) : [];
        const text = joinSearchTextParts([config.text]);
        const structuredText = joinSearchTextParts([config.structuredText || text]);

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
            evidenceRoleHints: Array.isArray(config.evidenceRoleHints) ? config.evidenceRoleHints.filter(Boolean) : [],
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
                const locationLabel = `${deck.label} · ${deck.title}`;
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
                    locationLabel,
                    navTarget,
                    fieldType: 'parent',
                    bestTimeHint: facility.bestTime,
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
                const locationLabel = `表演精華 · ${category.title}`;
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
                    locationLabel,
                    navTarget,
                    fieldType: 'parent',
                    bestTimeHint: show.timingTip,
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
                const locationLabel = `攻略本 · ${mission.label}`;
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
                    locationLabel,
                    navTarget,
                    fieldType: 'parent',
                    timeHint: item.whenToUse,
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

        searchState.documents = docs.map(doc => {
            const normalizedTitle = normalizeSearchText(doc.title);
            const normalizedText = normalizeSearchText(doc.text);
            const normalizedStructuredText = normalizeSearchText(doc.structuredText || doc.text);
            const normalizedKeywords = normalizeSearchText(doc.keywords.join(' '));
            return {
                ...doc,
                normalizedTitle,
                normalizedText,
                normalizedStructuredText,
                normalizedKeywords,
                normalizedCombined: uniqueItems([normalizedTitle, normalizedKeywords, normalizedText, normalizedStructuredText].filter(Boolean)).join(' ')
            };
        });

        searchState.documentVersion = simpleHash(searchState.documents
            .map(doc => `${doc.id}::${doc.normalizedCombined}`)
            .join('||'));
    }

    function getSearchUnits(rawQuery) {
        const normalizedQuery = normalizeSearchText(rawQuery);
        if (!normalizedQuery) {
            return { normalizedQuery: '', units: [], highlightTerms: [] };
        }

        const splitUnits = normalizedQuery.split(' ').filter(Boolean);
        const units = uniqueItems(normalizedQuery.includes(' ') ? [normalizedQuery, ...splitUnits] : splitUnits);
        const highlightTerms = uniqueItems(units.map(unit => searchDisplayMap.get(unit) || unit));

        return { normalizedQuery, units, highlightTerms };
    }

    function buildAiIntents(normalizedQuery) {
        return {
            day1Focus: hasQueryHint(normalizedQuery, ['第一天', 'day 1', 'day1', '登船日', '登船後', '提早登船']),
            day2Focus: hasQueryHint(normalizedQuery, ['第二天', 'day 2', 'day2']),
            day3Focus: hasQueryHint(normalizedQuery, ['第三天', 'day 3', 'day3']),
            day4Focus: hasQueryHint(normalizedQuery, ['第四天', 'day 4', 'day4', '下船日']),
            scheduleFocus: hasQueryHint(normalizedQuery, [
                '第一天', '第二天', '第三天', '第四天', 'day 1', 'day 2', 'day 3', 'day 4',
                '登船日', '下船日', '登船後', '早餐', '早上', '下午', '晚上', '今晚'
            ]),
            actionFocus: hasQueryHint(normalizedQuery, ['怎麼', '如何', '先做什麼', '怎麼安排', '值得先去', '值得先做']),
            deckFocus: hasQueryHint(normalizedQuery, [
                'deck', '甲板', '劇院', 'baymax', 'pizza', 'pool', 'lounge', 'concierge', 'open house', 'oceaneer'
            ]),
            conciergeFocus: hasQueryHint(normalizedQuery, ['禮賓', 'concierge', 'lounge', '酒廊']),
            theatreFocus: hasQueryHint(normalizedQuery, ['劇院', 'theatre', 'theater', '主秀', '看秀', 'remember', '提早入場']),
            roomServiceFocus: hasQueryHint(normalizedQuery, ['room service', '房務', '客房服務']),
            foodFocus: hasQueryHint(normalizedQuery, ['補給', '點心', '快餐', '餐廳', 'pizza', '披薩', '吃什麼']),
            kidFocus: hasQueryHint(normalizedQuery, ['孩子', '小孩', '兒童', '親子', 'kids']),
            comparisonFocus: hasQueryHint(normalizedQuery, ['還是', '比較', '要不要', '先', '優先'])
        };
    }

    function mergeAiIntents(...intentMaps) {
        const merged = {};
        intentMaps.forEach(intentMap => {
            Object.entries(intentMap || {}).forEach(([key, value]) => {
                merged[key] = merged[key] || Boolean(value);
            });
        });
        return merged;
    }

    function getAiSourceGroup(sourceType) {
        return sourceType === 'deck' || sourceType === 'show' ? 'deck-show' : sourceType;
    }

    function getAiSourcePriority(profileType) {
        const priorityMap = {
            sequence: ['schedule', 'playbook', 'deck-show', 'static'],
            'facility-detail': ['deck-show', 'playbook', 'schedule', 'static'],
            'operational-detail': ['playbook', 'deck-show', 'schedule', 'static'],
            'policy-or-tip': ['playbook', 'schedule', 'deck-show', 'static']
        };

        return priorityMap[profileType] || priorityMap['operational-detail'];
    }

    function getAiAnswerSourceLabel(sourceType) {
        const labels = {
            schedule: '行程',
            deck: '甲板 / 設施卡',
            show: '表演 / 場館卡',
            playbook: '攻略本',
            static: '其他資訊'
        };

        return labels[sourceType] || '站內內容';
    }

    function getAiEntityTypeLabel(entityType) {
        const labels = {
            facility: '設施',
            service: '服務',
            schedule: '行程',
            show: '表演',
            playbook: '攻略',
            mixed: '綜合整理'
        };

        return labels[entityType] || '主題';
    }

    function buildAiSlots(normalizedQuery, intents = {}, highlightTerms = []) {
        const day = uniqueItems([
            ...(intents.day1Focus ? ['第一天', 'day 1', '登船日', '登船後'] : []),
            ...(intents.day2Focus ? ['第二天', 'day 2'] : []),
            ...(intents.day3Focus ? ['第三天', 'day 3'] : []),
            ...(intents.day4Focus ? ['第四天', 'day 4', '下船日'] : [])
        ]).slice(0, 6);

        const timeWindow = uniqueItems([
            ...(hasQueryHint(normalizedQuery, ['早餐', '早上', 'morning', '晨間', '上午']) ? ['早餐', '早上', '晨間'] : []),
            ...(hasQueryHint(normalizedQuery, ['中午', '午餐', 'afternoon', '下午', '午後']) ? ['中午', '午餐', '下午'] : []),
            ...(hasQueryHint(normalizedQuery, ['晚餐前', '晚上', '夜間', '秀前', '秀後', '晚餐後', '今晚']) ? ['晚上', '夜間', '晚餐前', '秀前', '秀後'] : []),
            ...(hasQueryHint(normalizedQuery, ['半夜', '宵夜', '深夜']) ? ['半夜', '宵夜', '深夜'] : [])
        ]).slice(0, 6);

        const audience = uniqueItems([
            ...(intents.kidFocus ? ['孩子', '親子', '兒童'] : []),
            ...(hasQueryHint(normalizedQuery, ['全家', '多人', '兩家', '同行']) ? ['全家', '同行'] : []),
            ...(intents.conciergeFocus ? ['禮賓'] : [])
        ]).slice(0, 6);

        const goal = uniqueItems([
            ...(hasQueryHint(normalizedQuery, ['先做什麼', '先去', '順序', '安排', '路線']) ? ['順序', '先做什麼', '安排'] : []),
            ...(hasQueryHint(normalizedQuery, ['省力', '省時', '最順', '方便', '輕鬆']) ? ['省力', '省時', '最順'] : []),
            ...(hasQueryHint(normalizedQuery, ['避排隊', '排隊', '不用排隊']) ? ['避排隊', '排隊'] : []),
            ...(hasQueryHint(normalizedQuery, ['帶什麼', '要帶', '準備什麼']) ? ['要帶什麼', '準備'] : [])
        ]).slice(0, 8);

        const risk = uniqueItems([
            ...(hasQueryHint(normalizedQuery, ['來不及', '晚到', '錯過', '壓線', '趕不上']) ? ['來不及', '晚到', '錯過', '壓線'] : []),
            ...(hasQueryHint(normalizedQuery, ['排隊', '等太久', '卡住']) ? ['排隊', '等太久', '卡住'] : []),
            ...(hasQueryHint(normalizedQuery, ['踩雷', '風險', '注意', '規則', '限制', '要不要']) ? ['踩雷', '注意', '規則', '限制'] : [])
        ]).slice(0, 8);

        const comparison = uniqueItems([
            ...(intents.comparisonFocus || hasQueryHint(normalizedQuery, ['還是', '比較']) ? ['比較', '取捨'] : []),
            ...(hasQueryHint(normalizedQuery, ['要不要', '該不該']) ? ['要不要'] : []),
            ...(hasQueryHint(normalizedQuery, ['先', '優先']) ? ['優先順序'] : [])
        ]).slice(0, 6);

        const entity = uniqueItems([
            ...collectMatchingTerms(normalizedQuery, aiSearchDisplayMap),
            ...(intents.conciergeFocus ? ['禮賓', 'concierge', 'lounge'] : []),
            ...(intents.theatreFocus ? ['劇院', 'theatre', '主秀'] : []),
            ...(intents.roomServiceFocus ? ['room service', '客房服務', '房務'] : []),
            ...(intents.foodFocus ? ['補給', '披薩', '點心', '飲料'] : []),
            ...(intents.kidFocus ? ['open house', 'oceaneer', 'kids club', '孩子'] : []),
            ...highlightTerms
        ]).filter(Boolean).slice(0, 10);

        return {
            day,
            timeWindow,
            audience,
            goal,
            risk,
            comparison,
            entity
        };
    }

    function flattenAiSlots(slots = {}) {
        return uniqueItems([
            ...(slots.day || []),
            ...(slots.timeWindow || []),
            ...(slots.audience || []),
            ...(slots.goal || []),
            ...(slots.risk || []),
            ...(slots.comparison || []),
            ...(slots.entity || [])
        ]).filter(Boolean).slice(0, 18);
    }

    function buildAiAnchorProfile(normalizedQuery, intents = {}, slots = {}, highlightTerms = []) {
        const hardAnchors = uniqueItems([
            ...(slots.entity || []),
            ...(slots.day || []),
            ...(slots.timeWindow || []),
            ...(intents.conciergeFocus ? ['禮賓', 'concierge', 'lounge'] : []),
            ...(intents.theatreFocus ? ['劇院', 'theatre', '主秀'] : []),
            ...(intents.roomServiceFocus ? ['room service', '客房服務'] : []),
            ...(intents.kidFocus ? ['open house', 'oceaneer', 'kids club'] : []),
            ...(intents.foodFocus ? ['補給', '點心', '披薩', 'pizza'] : []),
            ...highlightTerms
        ]).filter(Boolean).slice(0, 14);

        const softModifiers = uniqueItems([
            ...(slots.goal || []),
            ...(slots.risk || []),
            ...(slots.comparison || []),
            ...(slots.audience || []).filter(item => item !== '禮賓'),
            ...(hasQueryHint(normalizedQuery, ['流程', '步驟', '怎麼做']) ? ['流程', '步驟'] : []),
            ...(hasQueryHint(normalizedQuery, ['注意事項', '注意', '限制', '規則']) ? ['注意事項', '限制', '規則'] : []),
            ...(hasQueryHint(normalizedQuery, ['要不要', '值不值得', '該不該']) ? ['要不要', '值不值得'] : []),
            ...(hasQueryHint(normalizedQuery, ['比較', '還是', '先後順序']) ? ['比較', '先後順序'] : [])
        ]).filter(Boolean).slice(0, 14);

        const subjectClusters = uniqueItems([
            ...hardAnchors,
            ...(slots.entity || []).map(term => aiSearchDisplayMap.get(normalizeSearchText(term)) || term),
            ...(intents.conciergeFocus ? ['Lounge', '禮賓酒廊', '優先入場'] : []),
            ...(intents.theatreFocus ? ['劇院', '主秀', '晚秀'] : []),
            ...(intents.roomServiceFocus ? ['Room Service', '宵夜', '早餐'] : []),
            ...(intents.kidFocus ? ['Open House', 'Kids Club', 'Oceaneer'] : [])
        ]).filter(Boolean).slice(0, 16);

        return {
            hardAnchors,
            softModifiers,
            subjectClusters
        };
    }

    function buildAiEvidenceLayers(queryData = {}) {
        const slots = queryData.slots || {};
        const hardAnchors = queryData.hardAnchors || [];
        const softModifiers = queryData.softModifiers || [];
        return {
            core: uniqueItems([
                ...hardAnchors.slice(0, 8),
                ...(slots.day || []).slice(0, 2),
                ...(slots.timeWindow || []).slice(0, 2)
            ]).slice(0, 12),
            extension: uniqueItems([
                ...(queryData.subjectClusters || []).slice(0, 8),
                ...(slots.goal || []).slice(0, 3),
                ...(slots.audience || []).slice(0, 3),
                ...softModifiers.slice(0, 4)
            ]).slice(0, 16),
            rulesLimits: uniqueItems([
                ...(slots.risk || []).slice(0, 4),
                ...softModifiers.filter(item => ['注意事項', '限制', '規則', '要不要', '值不值得'].includes(item))
            ]).slice(0, 10),
            timingContext: uniqueItems([
                ...(slots.day || []),
                ...(slots.timeWindow || [])
            ]).slice(0, 8),
            sourceContrast: uniqueItems([
                ...(queryData.intentProfile?.sourceDetailPriority || []),
                ...(queryData.subjectClusters || []).slice(0, 4)
            ]).slice(0, 8)
        };
    }

    function buildAiSourceDetailPriority(queryData = {}, profileType = 'operational-detail') {
        if (queryData.intents?.conciergeFocus && queryData.intents?.theatreFocus) {
            return ['concierge', 'official', 'community', 'general'];
        }

        if (queryData.intents?.roomServiceFocus) {
            return ['community', 'official', 'concierge', 'general'];
        }

        if (profileType === 'policy-or-tip' || (queryData.slots?.risk || []).length) {
            return ['official', 'concierge', 'community', 'general'];
        }

        if (profileType === 'facility-detail') {
            return ['official', 'concierge', 'community', 'general'];
        }

        if (profileType === 'sequence') {
            return ['community', 'concierge', 'official', 'general'];
        }

        return ['community', 'official', 'concierge', 'general'];
    }

    function buildAiIntentProfile(queryData = {}) {
        const normalizedQuery = queryData.normalizedQuery || '';
        const intents = queryData.intents || {};
        const slots = queryData.slots || {};
        const hardAnchors = queryData.hardAnchors || [];
        const softModifiers = queryData.softModifiers || [];
        const sequenceSignal = intents.scheduleFocus && (
            intents.actionFocus
            || hasQueryHint(normalizedQuery, ['順序', '第一步', '先去', '先做', '先做什麼', '怎麼安排', '路線'])
            || (slots.goal || []).includes('順序')
        );
        const facilitySignal = intents.deckFocus
            || intents.theatreFocus
            || hasQueryHint(normalizedQuery, [
                '哪個設施', '什麼設施', '哪一層', '在哪裡', '哪裡', '電影院', '劇院', '字幕',
                '泳池', '酒廊', '餐廳', '披薩', 'baymax', 'deck'
            ]);
        const operationalSignal = intents.conciergeFocus
            || intents.roomServiceFocus
            || hasQueryHint(normalizedQuery, [
                '特殊服務', '怎麼用', '怎麼做', '技巧', '攻略', '優先入場', '提早進', '怎麼點'
            ]);
        const policySignal = hasQueryHint(normalizedQuery, [
            '注意', '限制', '規則', '該不該', '要不要', '可不可以', '能不能', '多久', '幾點', '會不會', '值得嗎'
        ]) || Boolean((slots.risk || []).length);

        let type = 'operational-detail';
        if (sequenceSignal) {
            type = 'sequence';
        } else if (operationalSignal) {
            type = 'operational-detail';
        } else if (facilitySignal || intents.foodFocus || intents.kidFocus) {
            type = 'facility-detail';
        } else if (policySignal) {
            type = 'policy-or-tip';
        } else if (intents.scheduleFocus) {
            type = 'sequence';
        }

        const focusTerms = uniqueItems([
            ...hardAnchors.slice(0, 10),
            ...(queryData.highlightTerms || []).slice(0, 6),
            ...(queryData.subjectClusters || []).slice(0, 8),
            ...(intents.conciergeFocus ? ['禮賓', 'concierge', 'lounge', '酒廊', '劇院優先入場'] : []),
            ...(intents.roomServiceFocus ? ['room service', '房務', '客房服務', '早餐', '宵夜'] : []),
            ...(intents.theatreFocus ? ['劇院', 'theatre', '主秀', 'remember', '提早入場', '優先入場'] : []),
            ...(intents.foodFocus ? ['補給', '點心', '快餐', '餐廳', '披薩', 'pizza', '漢堡'] : []),
            ...(intents.kidFocus ? ['孩子', '小孩', '兒童', '親子', 'open house', 'oceaneer'] : []),
            ...(sequenceSignal ? ['第一天', '登船日', 'day 1', '順序', '先做什麼'] : []),
            ...softModifiers.slice(0, 4)
        ]).filter(Boolean).slice(0, 12);

        return {
            type,
            sourcePriority: getAiSourcePriority(type),
            sourceDetailPriority: buildAiSourceDetailPriority(queryData, type),
            focusTerms,
            hardAnchors: hardAnchors.slice(0, 12),
            softModifiers: softModifiers.slice(0, 12),
            prefersScheduleContext: type === 'sequence'
                || Boolean(intents.scheduleFocus)
                || Boolean((slots.day || []).length)
                || Boolean((slots.timeWindow || []).length),
            requiresDetailSupport: type === 'sequence' || type === 'operational-detail' || type === 'policy-or-tip',
            requiresActionChunk: type === 'sequence' || type === 'operational-detail' || type === 'policy-or-tip',
            requiresCautionChunk: type === 'operational-detail' || type === 'policy-or-tip' || Boolean((slots.risk || []).length)
        };
    }

    function buildAiExpansionUnits(text) {
        const normalized = normalizeSearchText(text);
        if (!normalized) return [];

        const phraseMatches = collectMatchingTerms(normalized, aiSearchDisplayMap);
        const strippedQuery = stripAiStopWords(normalized);
        const splitUnits = strippedQuery.split(' ').filter(unit => unit.length >= 2);
        const chineseNgrams = extractChineseNgrams(strippedQuery);

        return uniqueItems([
            ...phraseMatches,
            ...splitUnits,
            ...chineseNgrams
        ]).filter(Boolean);
    }

    function normalizeAiRewriteMeta(rewriteMeta = {}) {
        const safeRewriteMeta = rewriteMeta && typeof rewriteMeta === 'object' ? rewriteMeta : {};
        const rewrittenQuery = String(safeRewriteMeta.rewrittenQuery || '').trim();
        const keywords = uniqueItems((safeRewriteMeta.keywords || [])
            .map(item => String(item || '').trim())
            .filter(Boolean))
            .slice(0, 6);
        const alternates = uniqueItems((safeRewriteMeta.alternates || [])
            .map(item => String(item || '').trim())
            .filter(Boolean))
            .slice(0, 4);
        const confidence = ['high', 'medium', 'low'].includes(safeRewriteMeta.confidence) ? safeRewriteMeta.confidence : 'low';

        return {
            rewrittenQuery,
            keywords,
            alternates,
            confidence,
            hintTerms: uniqueItems([...keywords, ...alternates]).slice(0, 4)
        };
    }

    function buildAiQueryBundles(normalizedQuery, rewriteMeta = null, slots = {}, highlightTerms = []) {
        const normalizedRewrite = normalizeAiRewriteMeta(rewriteMeta);
        const anchorProfile = buildAiAnchorProfile(normalizedQuery, buildAiIntents(normalizedQuery), slots, highlightTerms);
        const aliasSeed = uniqueItems([
            ...(anchorProfile.hardAnchors || []),
            ...collectMatchingTerms(normalizedQuery, aiSearchDisplayMap),
            ...highlightTerms,
            ...normalizedRewrite.keywords,
            ...normalizedRewrite.alternates,
            ...deriveContextualKeywords(normalizedQuery)
        ]).slice(0, 14);
        const taskSeed = uniqueItems([
            ...(anchorProfile.hardAnchors || []).slice(0, 8),
            ...(anchorProfile.softModifiers || []).slice(0, 8),
            ...(slots.day || []),
            ...(slots.timeWindow || []),
            ...(slots.audience || []),
            ...(slots.entity || []).slice(0, 4),
            ...(slots.comparison || [])
        ]).slice(0, 14);
        const comparisonSeed = uniqueItems([
            ...(slots.comparison || []),
            ...(slots.entity || []).slice(0, 4),
            ...normalizedRewrite.alternates
        ]).slice(0, 10);

        return {
            precision: buildAiExpansionUnits(uniqueItems([
                ...(anchorProfile.hardAnchors || []).slice(0, 8),
                ...collectMatchingTerms(normalizedQuery, aiSearchDisplayMap).slice(0, 6)
            ]).join(' ')).slice(0, 10),
            alias: buildAiExpansionUnits(aliasSeed.join(' ')).slice(0, 12),
            task: buildAiExpansionUnits(taskSeed.join(' ')).slice(0, 12),
            comparison: buildAiExpansionUnits(comparisonSeed.join(' ')).slice(0, 10)
        };
    }

    function getAiSearchUnits(rawQuery, rewriteMeta = null) {
        const normalizedQuery = normalizeSearchText(rawQuery);
        if (!normalizedQuery) {
            return {
                rawQuery: String(rawQuery || '').trim(),
                normalizedQuery: '',
                units: [],
                queryBundles: {},
                bundleTerms: [],
                highlightTerms: [],
                signalLength: 0,
                intents: {},
                slots: {},
                slotTerms: [],
                rewriteMeta: null
            };
        }

        const normalizedRewrite = normalizeAiRewriteMeta(rewriteMeta);
        const rewriteSeed = [
            normalizedRewrite.rewrittenQuery,
            ...normalizedRewrite.keywords,
            ...normalizedRewrite.alternates
        ].join(' ');

        const baseUnits = buildAiExpansionUnits(normalizedQuery);
        const rewriteUnits = buildAiExpansionUnits(rewriteSeed);
        const units = uniqueItems([
            ...baseUnits,
            ...rewriteUnits
        ]).slice(0, 18);

        const highlightTerms = uniqueItems(
            units.map(unit => aiSearchDisplayMap.get(unit) || searchDisplayMap.get(unit) || unit)
        );

        const intents = mergeAiIntents(
            buildAiIntents(normalizedQuery),
            rewriteSeed ? buildAiIntents(normalizeSearchText(rewriteSeed)) : {}
        );
        const slots = buildAiSlots(normalizedQuery, intents, highlightTerms);
        const anchorProfile = buildAiAnchorProfile(normalizedQuery, intents, slots, highlightTerms);
        const queryBundles = buildAiQueryBundles(normalizedQuery, normalizedRewrite, slots, highlightTerms);
        const bundleTerms = uniqueItems([
            ...(queryBundles.precision || []),
            ...(queryBundles.alias || []),
            ...(queryBundles.task || []),
            ...(queryBundles.comparison || [])
        ]).slice(0, 24);
        const slotTerms = flattenAiSlots(slots);
        const intentProfile = buildAiIntentProfile({
            normalizedQuery,
            highlightTerms,
            intents,
            slots,
            slotTerms,
            bundleTerms,
            hardAnchors: anchorProfile.hardAnchors,
            softModifiers: anchorProfile.softModifiers,
            subjectClusters: anchorProfile.subjectClusters
        });
        const evidenceLayers = buildAiEvidenceLayers({
            normalizedQuery,
            intents,
            slots,
            hardAnchors: anchorProfile.hardAnchors,
            softModifiers: anchorProfile.softModifiers,
            subjectClusters: anchorProfile.subjectClusters,
            intentProfile
        });

        return {
            rawQuery: String(rawQuery || '').trim(),
            normalizedQuery,
            units: units.length ? units : normalizedQuery.split(' ').filter(Boolean),
            queryBundles,
            bundleTerms,
            highlightTerms,
            signalLength: getSearchSignalLength(normalizedQuery),
            intents,
            slots,
            slotTerms,
            hardAnchors: anchorProfile.hardAnchors,
            softModifiers: anchorProfile.softModifiers,
            subjectClusters: anchorProfile.subjectClusters,
            evidenceLayers,
            intentProfile,
            rewriteMeta: normalizedRewrite.keywords.length || normalizedRewrite.alternates.length || normalizedRewrite.rewrittenQuery
                ? normalizedRewrite
                : null
        };
    }

    function buildAiAlternativeFacet(rawQuery, entityTerms = []) {
        const normalizedQuery = normalizeSearchText(rawQuery);
        if (!normalizedQuery) return [];

        const alternatives = [];
        if (normalizedQuery.includes('還是')) {
            normalizedQuery.split('還是')
                .map(part => part.trim())
                .filter(Boolean)
                .forEach(part => {
                    const matchedTerms = collectMatchingTerms(part, aiSearchDisplayMap);
                    if (matchedTerms.length) {
                        alternatives.push(matchedTerms[0]);
                        return;
                    }

                    part.split(' ')
                        .filter(unit => unit.length >= 2)
                        .slice(-2)
                        .forEach(unit => alternatives.push(unit));
                });
        }

        if (normalizedQuery.includes('比較')) {
            collectMatchingTerms(normalizedQuery, aiSearchDisplayMap)
                .slice(0, 4)
                .forEach(term => alternatives.push(term));
        }

        if (normalizedQuery.includes('要不要')) {
            entityTerms
                .map(term => normalizeSearchText(term))
                .filter(Boolean)
                .slice(0, 2)
                .forEach(term => alternatives.push(term));
        }

        return uniqueItems(alternatives
            .map(term => aiSearchDisplayMap.get(term) || searchDisplayMap.get(term) || term)
            .filter(Boolean))
            .slice(0, 6);
    }

    function buildAiReportFacets(queryData = {}) {
        const slots = queryData.slots || {};
        return {
            goal: uniqueItems(slots.goal || []).slice(0, 8),
            time: uniqueItems([
                ...(slots.day || []),
                ...(slots.timeWindow || [])
            ]).slice(0, 8),
            entityPlace: uniqueItems(slots.entity || []).slice(0, 10),
            audience: uniqueItems(slots.audience || []).slice(0, 6),
            risk: uniqueItems(slots.risk || []).slice(0, 8),
            alternatives: buildAiAlternativeFacet(queryData.rawQuery || queryData.normalizedQuery || '', slots.entity || [])
        };
    }

    function countActiveAiFacetNames(facets = {}) {
        return Object.entries(facets)
            .filter(([, values]) => Array.isArray(values) && values.length)
            .map(([facetName]) => facetName);
    }

    function buildAiAnalysisPlanPayload(reportPlan = {}) {
        const facets = reportPlan.facets || {};
        return {
            responseMode: reportPlan.responseMode === 'report' ? 'report' : 'compact',
            intentType: reportPlan.intentType || 'operational-detail',
            facetSummary: {
                goal: Array.isArray(facets.goal) ? facets.goal.slice(0, 8) : [],
                time: Array.isArray(facets.time) ? facets.time.slice(0, 8) : [],
                entityPlace: Array.isArray(facets.entityPlace) ? facets.entityPlace.slice(0, 10) : [],
                audience: Array.isArray(facets.audience) ? facets.audience.slice(0, 6) : [],
                risk: Array.isArray(facets.risk) ? facets.risk.slice(0, 8) : [],
                alternatives: Array.isArray(facets.alternatives) ? facets.alternatives.slice(0, 6) : []
            },
            activeFacetNames: Array.isArray(reportPlan.activeFacetNames) ? reportPlan.activeFacetNames.slice(0, 6) : [],
            activeFacetCount: Number(reportPlan.activeFacetCount || 0),
            triggerReasons: Array.isArray(reportPlan.triggerReasons) ? reportPlan.triggerReasons.slice(0, 6) : [],
            isComparisonQuery: Boolean(reportPlan.isComparisonQuery),
            hasRiskJudgment: Boolean(reportPlan.hasRiskJudgment),
            needsSourceComparison: Boolean(reportPlan.needsSourceComparison),
            rewriteTriggered: Boolean(reportPlan.rewriteTriggered),
            evidenceBudget: Number(reportPlan.evidenceBudget || AI_REPORT_MAX_RESULTS),
            maxParentCards: Number(reportPlan.maxParentCards || AI_REPORT_MAX_PARENTS),
            hardAnchors: Array.isArray(reportPlan.hardAnchors) ? reportPlan.hardAnchors.slice(0, 14) : [],
            softModifiers: Array.isArray(reportPlan.softModifiers) ? reportPlan.softModifiers.slice(0, 14) : [],
            subjectClusters: Array.isArray(reportPlan.subjectClusters) ? reportPlan.subjectClusters.slice(0, 16) : [],
            evidenceLayers: reportPlan.evidenceLayers && typeof reportPlan.evidenceLayers === 'object'
                ? {
                    core: Array.isArray(reportPlan.evidenceLayers.core) ? reportPlan.evidenceLayers.core.slice(0, 12) : [],
                    extension: Array.isArray(reportPlan.evidenceLayers.extension) ? reportPlan.evidenceLayers.extension.slice(0, 16) : [],
                    rulesLimits: Array.isArray(reportPlan.evidenceLayers.rulesLimits) ? reportPlan.evidenceLayers.rulesLimits.slice(0, 10) : [],
                    timingContext: Array.isArray(reportPlan.evidenceLayers.timingContext) ? reportPlan.evidenceLayers.timingContext.slice(0, 8) : [],
                    sourceContrast: Array.isArray(reportPlan.evidenceLayers.sourceContrast) ? reportPlan.evidenceLayers.sourceContrast.slice(0, 8) : []
                }
                : {
                    core: [],
                    extension: [],
                    rulesLimits: [],
                    timingContext: [],
                    sourceContrast: []
                },
            evidenceSummary: {
                selectedChunkCount: Number(reportPlan.selectedChunkCount || 0),
                parentCardCount: Number(reportPlan.parentCardCount || 0),
                sourceTypes: Array.isArray(reportPlan.sourceTypes) ? reportPlan.sourceTypes.slice(0, 6) : [],
                sourceDetailTypes: Array.isArray(reportPlan.sourceDetailTypes) ? reportPlan.sourceDetailTypes.slice(0, 4) : []
            }
        };
    }

    function buildAiReportPlanner(queryData = {}, results = [], selectedResults = [], options = {}) {
        const intentProfile = queryData.intentProfile || buildAiIntentProfile(queryData);
        const facets = buildAiReportFacets(queryData);
        const activeFacetNames = countActiveAiFacetNames(facets);
        const hardAnchors = uniqueItems(queryData.hardAnchors || []).slice(0, 14);
        const softModifiers = uniqueItems(queryData.softModifiers || []).slice(0, 14);
        const subjectClusters = uniqueItems(queryData.subjectClusters || hardAnchors).slice(0, 16);
        const evidenceLayers = buildAiEvidenceLayers({
            ...queryData,
            intentProfile,
            hardAnchors,
            softModifiers,
            subjectClusters
        });
        const normalizedQuery = queryData.normalizedQuery || normalizeSearchText(queryData.rawQuery || '');
        const selectedPool = selectedResults.length ? selectedResults : results.slice(0, 6);
        const parentIds = uniqueItems(selectedPool.map(result => result.parentId || result.id).filter(Boolean));
        const sourceTypes = uniqueItems(selectedPool.map(result => result.sourceType).filter(Boolean));
        const sourceDetailTypes = uniqueItems(selectedPool
            .map(result => result.sourceDetailType || 'general')
            .filter(type => type && type !== 'general'));
        const strongEvidenceCount = selectedResults.filter(result => (result.score || 0) >= 18).length;
        const comparisonSignal = normalizedQuery.includes('還是')
            || normalizedQuery.includes('比較')
            || /先.+還是/.test(normalizedQuery);
        const decisionSignal = normalizedQuery.includes('要不要')
            && (facets.alternatives.length >= 2 || parentIds.length >= 3 || sourceDetailTypes.length >= 2);
        const rewriteTriggered = Boolean(options.rewriteTriggered);
        const hasRiskJudgment = Boolean(facets.risk.length) || intentProfile.type === 'policy-or-tip';
        const triggerReasons = [];

        if (activeFacetNames.length >= 2) {
            triggerReasons.push('多面向問題');
        }
        if (comparisonSignal || decisionSignal) {
            triggerReasons.push('需要比較或取捨');
        }
        if (parentIds.length >= 3) {
            triggerReasons.push('證據橫跨多張卡片');
        }
        if (sourceDetailTypes.length >= 2) {
            triggerReasons.push('來源層級需要對照');
        }
        if (rewriteTriggered) {
            triggerReasons.push('第一輪召回不足，已做受控改寫');
        }
        if (hasRiskJudgment && strongEvidenceCount >= AI_REPORT_STRONG_EVIDENCE_MIN) {
            triggerReasons.push('涉及風險判斷且證據足夠');
        }

        if (!triggerReasons.length && options.defaultResponseMode === 'report') {
            triggerReasons.push('預設詳細報告模式');
        }

        const responseMode = options.defaultResponseMode === 'report'
            ? 'report'
            : (triggerReasons.length ? 'report' : 'compact');

        return {
            responseMode,
            intentType: intentProfile.type,
            facets,
            activeFacetNames,
            activeFacetCount: activeFacetNames.length,
            isComparisonQuery: comparisonSignal || decisionSignal,
            hasRiskJudgment,
            rewriteTriggered,
            triggerReasons,
            selectedChunkCount: selectedResults.length,
            parentCardCount: parentIds.length,
            sourceTypes,
            sourceDetailTypes,
            hardAnchors,
            softModifiers,
            subjectClusters,
            evidenceLayers,
            strongEvidenceCount,
            needsSourceComparison: sourceDetailTypes.length >= 2
                || Boolean(queryData.intents?.conciergeFocus)
                || intentProfile.type === 'policy-or-tip'
                || (hasRiskJudgment && sourceDetailTypes.length >= 1),
            evidenceBudget: responseMode === 'report' ? AI_REPORT_MAX_RESULTS : 8,
            maxParentCards: responseMode === 'report' ? AI_REPORT_MAX_PARENTS : 4
        };
    }

    function sourceTextMatchesUnit(sourceText, unit) {
        if (!sourceText || !unit) return false;
        if (sourceText.includes(unit)) return true;
        const synonyms = searchSynonymMap.get(unit) || [];
        return synonyms.some(synonym => sourceText.includes(synonym));
    }

    function countMatchedUnits(sourceText, units = []) {
        return uniqueItems(units).filter(unit => sourceTextMatchesUnit(sourceText, unit)).length;
    }

    function countMatchedTerms(sourceText, terms = []) {
        return uniqueItems(terms)
            .map(term => normalizeSearchText(term))
            .filter(Boolean)
            .filter(term => sourceText.includes(term))
            .length;
    }

    function scoreMatch(sourceText, term, synonyms, baseWeight, synonymWeight) {
        let score = 0;
        if (!sourceText) return score;

        if (sourceText.includes(term)) {
            score += baseWeight + Math.min(term.length, 8);
        }

        synonyms.forEach(synonym => {
            if (sourceText.includes(synonym)) {
                score += synonymWeight + Math.min(synonym.length, 6);
            }
        });

        return score;
    }

    function scoreDocument(doc, queryData) {
        if (!queryData.units.length) return 0;

        let score = 0;
        let matchedUnits = 0;

        queryData.units.forEach(unit => {
            const synonyms = searchSynonymMap.get(unit) || [];
            const unitScore =
                scoreMatch(doc.normalizedTitle, unit, synonyms, 30, 15) +
                scoreMatch(doc.normalizedKeywords, unit, synonyms, 22, 10) +
                scoreMatch(doc.normalizedText, unit, synonyms, 12, 5);

            if (unitScore > 0) {
                matchedUnits += 1;
                score += unitScore;
            }
        });

        if (doc.normalizedTitle.includes(queryData.normalizedQuery)) {
            score += 28;
        } else if (doc.normalizedCombined.includes(queryData.normalizedQuery)) {
            score += 14;
        }

        if (matchedUnits === queryData.units.length) {
            score += 16;
        } else if (matchedUnits > 1) {
            score += 8;
        }

        return score;
    }

    function scoreDocumentForAi(doc, queryData) {
        const baseScore = scoreDocument(doc, queryData);
        if (baseScore <= 0) return 0;

        let score = baseScore;
        const intentProfile = queryData.intentProfile || buildAiIntentProfile(queryData);
        const sourceGroup = getAiSourceGroup(doc.sourceType);
        const sourcePriorityIndex = intentProfile.sourcePriority.indexOf(sourceGroup);
        const sourceDetailPriorityIndex = (intentProfile.sourceDetailPriority || []).indexOf(doc.sourceDetailType || 'general');
        const titleMatches = countMatchedUnits(doc.normalizedTitle, queryData.units);
        const keywordMatches = countMatchedUnits(doc.normalizedKeywords, queryData.units);
        const weightedFocusTerms = uniqueItems([
            ...(intentProfile.focusTerms || []),
            ...((queryData.bundleTerms || []).slice(0, 10))
        ]);
        const hardAnchors = uniqueItems([
            ...(queryData.hardAnchors || []),
            ...(intentProfile.hardAnchors || [])
        ]).slice(0, 12);
        const softModifiers = uniqueItems([
            ...(queryData.softModifiers || []),
            ...(intentProfile.softModifiers || [])
        ]).slice(0, 12);
        const focusTitleMatches = countMatchedTerms(doc.normalizedTitle, weightedFocusTerms);
        const focusBodyMatches = countMatchedTerms(`${doc.normalizedKeywords} ${doc.normalizedText} ${doc.normalizedStructuredText || ''}`, weightedFocusTerms);
        const hardAnchorTitleMatches = countMatchedTerms(doc.normalizedTitle, hardAnchors);
        const hardAnchorBodyMatches = countMatchedTerms(doc.normalizedCombined, hardAnchors);
        const softModifierMatches = countMatchedTerms(doc.normalizedCombined, softModifiers);
        const slotMatches = countMatchedTerms(doc.normalizedCombined, queryData.slotTerms || []);
        const precisionBundleMatches = countMatchedUnits(doc.normalizedCombined, queryData.queryBundles?.precision || []);
        const aliasBundleMatches = countMatchedUnits(doc.normalizedCombined, queryData.queryBundles?.alias || []);
        const taskBundleMatches = countMatchedUnits(doc.normalizedCombined, queryData.queryBundles?.task || []);
        const comparisonBundleMatches = countMatchedUnits(doc.normalizedCombined, queryData.queryBundles?.comparison || []);
        const fieldType = doc.fieldType || 'parent';
        const roleHints = doc.evidenceRoleHints || [];

        if (sourcePriorityIndex === 0) {
            score += 18;
        } else if (sourcePriorityIndex === 1) {
            score += 10;
        } else if (sourcePriorityIndex === 2) {
            score += 4;
        }

        if (sourceDetailPriorityIndex === 0) {
            score += 16;
        } else if (sourceDetailPriorityIndex === 1) {
            score += 8;
        } else if (sourceDetailPriorityIndex === 2) {
            score += 3;
        }

        if (titleMatches >= 2) {
            score += 14;
        } else if (titleMatches === 1) {
            score += 8;
        }

        if (keywordMatches >= 2) {
            score += 8;
        } else if (keywordMatches === 1) {
            score += 4;
        }

        if (focusTitleMatches >= 1) {
            score += 12;
        } else if (focusBodyMatches >= 2) {
            score += 6;
        }

        if (hardAnchorTitleMatches >= 2) {
            score += 26;
        } else if (hardAnchorTitleMatches === 1) {
            score += 16;
        }

        if (hardAnchorBodyMatches >= 2) {
            score += 18;
        } else if (hardAnchorBodyMatches === 1) {
            score += 10;
        }

        if (softModifierMatches >= 2) {
            score += 8;
        } else if (softModifierMatches === 1) {
            score += 4;
        }

        if (slotMatches >= 2) {
            score += 14;
        } else if (slotMatches === 1) {
            score += 8;
        }

        if (precisionBundleMatches >= 2) {
            score += 18;
        } else if (precisionBundleMatches === 1) {
            score += 10;
        }

        if (taskBundleMatches >= 2) {
            score += 14;
        } else if (taskBundleMatches === 1) {
            score += 7;
        }

        if (aliasBundleMatches >= 2) {
            score += 10;
        } else if (aliasBundleMatches === 1) {
            score += 4;
        }

        if (comparisonBundleMatches >= 1 && (queryData.intents?.comparisonFocus || (queryData.slots?.comparison || []).length)) {
            score += 10;
        }

        if (doc.aiOnly) {
            score += 6;
        } else if (fieldType === 'parent') {
            score += 4;
        }

        if (fieldType === 'action' || fieldType === 'desc') {
            score += 18;
        } else if (fieldType === 'caution') {
            score += 16;
        } else if (fieldType === 'whenToUse' || fieldType === 'time' || fieldType === 'bestTime' || fieldType === 'timingTip') {
            score += 10;
        } else if (fieldType === 'tripFit' || fieldType === 'tripUse' || fieldType === 'tripLink') {
            score += 8;
        }

        if (roleHints.includes('primary-answer')) {
            score += 6;
        }

        if (queryData.intents?.actionFocus) {
            if (intentProfile.type === 'sequence' && doc.sourceType === 'schedule') {
                score += 10;
            }
            if ((intentProfile.type === 'operational-detail' || intentProfile.type === 'policy-or-tip') && doc.sourceType === 'playbook') {
                score += 12;
            }
        }

        if (queryData.intents?.deckFocus && intentProfile.type === 'facility-detail' && sourceGroup === 'deck-show') {
            score += 12;
        }

        if (queryData.intents?.day1Focus && intentProfile.type === 'sequence' && (doc.normalizedKeywords.includes('day 1') || doc.normalizedCombined.includes('登船'))) {
            score += 18;
        }

        if (queryData.intents?.day2Focus && intentProfile.type === 'sequence' && doc.normalizedKeywords.includes('day 2')) {
            score += 14;
        }

        if (queryData.intents?.conciergeFocus && documentIncludesAny(doc, ['禮賓', 'concierge', 'lounge', '酒廊'])) {
            if (doc.sourceType === 'playbook') {
                score += 18;
            } else if (sourceGroup === 'deck-show') {
                score += 10;
            } else if (doc.sourceType === 'schedule') {
                score += intentProfile.type === 'sequence' ? 6 : 1;
            }
        }

        if (queryData.intents?.theatreFocus && documentIncludesAny(doc, ['劇院', 'theatre', 'theater', '主秀', 'remember', '看秀', '提早入場'])) {
            if (doc.sourceType === 'show') {
                score += 22;
            } else if (doc.sourceType === 'playbook') {
                score += 16;
            } else if (doc.sourceType === 'schedule') {
                score += intentProfile.type === 'sequence' ? 12 : 4;
            }
        }

        if (queryData.intents?.roomServiceFocus && documentIncludesAny(doc, ['room service', '房務', '客房服務'])) {
            score += doc.sourceType === 'playbook' ? 22 : 8;
            if (fieldType === 'action' || fieldType === 'caution') {
                score += 16;
            }
        }

        if (queryData.intents?.foodFocus && documentIncludesAny(doc, ['補給', '點心', '快餐', 'pizza', '披薩', '餐'])) {
            if (sourceGroup === 'deck-show') {
                score += 18;
            } else if (doc.sourceType === 'playbook') {
                score += 10;
            } else if (doc.sourceType === 'schedule') {
                score += intentProfile.type === 'sequence' ? 8 : 2;
            }
        }

        if (queryData.intents?.kidFocus && documentIncludesAny(doc, ['孩子', '小孩', '兒童', '親子', 'kids'])) {
            if (doc.sourceType === 'playbook') {
                score += 12;
            } else if (sourceGroup === 'deck-show') {
                score += 10;
            } else {
                score += 6;
            }
        }

        if ((queryData.slots?.goal || []).includes('順序')) {
            if (fieldType === 'time' || fieldType === 'whenToUse' || doc.sourceType === 'schedule') {
                score += 10;
            }
        }

        if ((queryData.slots?.goal || []).includes('省力')) {
            if (fieldType === 'tripFit' || fieldType === 'tripUse' || fieldType === 'action') {
                score += 10;
            }
        }

        if ((queryData.slots?.goal || []).includes('避排隊')) {
            if (fieldType === 'action' || fieldType === 'bestTime' || fieldType === 'timingTip') {
                score += 12;
            }
        }

        if ((queryData.slots?.goal || []).includes('要帶什麼') && documentIncludesAny(doc, ['帶', '房卡', '證明', '文件', '包'])) {
            score += 14;
        }

        if ((queryData.slots?.comparison || []).length && titleMatches >= 1) {
            score += 10;
        }

        if ((queryData.slots?.risk || []).length) {
            if (fieldType === 'caution') {
                score += 20;
            } else if (fieldType === 'bestTime' || fieldType === 'timingTip') {
                score += 10;
            }
            if (doc.sourceDetailType === 'official') {
                score += 8;
            }
        }

        if (intentProfile.type === 'operational-detail' || intentProfile.type === 'policy-or-tip') {
            if (doc.sourceType === 'playbook' && focusBodyMatches >= 1) {
                score += 18;
            }
            if (intentProfile.requiresActionChunk && (fieldType === 'action' || roleHints.includes('sop-action'))) {
                score += 14;
            }
            if (intentProfile.requiresCautionChunk && (fieldType === 'caution' || roleHints.includes('caution-exception'))) {
                score += 10;
            }
            if (doc.sourceType === 'schedule' && titleMatches === 0 && focusTitleMatches === 0) {
                score -= 14;
            }
        }

        if (intentProfile.type === 'facility-detail') {
            if (sourceGroup === 'deck-show' && focusBodyMatches >= 1) {
                score += 18;
            }
            if (fieldType === 'summary' || fieldType === 'theme' || fieldType === 'bestTime') {
                score += 12;
            }
            if (doc.sourceType === 'schedule' && titleMatches === 0 && focusTitleMatches === 0) {
                score -= 12;
            }
        }

        if (intentProfile.type === 'sequence') {
            if (doc.sourceType === 'schedule') {
                score += 8;
            }
            if ((sourceGroup === 'deck-show' || doc.sourceType === 'playbook') && focusBodyMatches >= 1) {
                score += 8;
            }
            if (fieldType === 'action' || fieldType === 'time' || fieldType === 'whenToUse') {
                score += 12;
            }
        }

        if (doc.sourceType === 'schedule' && intentProfile.type !== 'sequence' && doc.normalizedText.length > 260 && titleMatches === 0 && focusTitleMatches === 0) {
            score -= 8;
        }

        if (doc.sourceType === 'static') {
            score -= 6;
        }

        if (hardAnchors.length && hardAnchorTitleMatches === 0 && hardAnchorBodyMatches === 0 && softModifierMatches >= 1) {
            score -= 18;
        }

        return score;
    }

    function documentIncludesAny(doc, terms = []) {
        return terms.some(term => {
            const normalizedTerm = normalizeSearchText(term);
            return normalizedTerm && (
                doc.normalizedTitle.includes(normalizedTerm) ||
                doc.normalizedKeywords.includes(normalizedTerm) ||
                doc.normalizedText.includes(normalizedTerm) ||
                (doc.normalizedStructuredText || '').includes(normalizedTerm)
            );
        });
    }

    function documentTitleIncludesAny(doc, terms = []) {
        return terms.some(term => {
            const normalizedTerm = normalizeSearchText(term);
            return normalizedTerm && doc.normalizedTitle.includes(normalizedTerm);
        });
    }

    function highlightSnippet(text, terms) {
        let html = escapeHtml(text);
        const sortedTerms = uniqueItems(terms.filter(Boolean)).sort((a, b) => b.length - a.length);

        sortedTerms.forEach(term => {
            const safeTerm = escapeHtml(term);
            if (!safeTerm) return;
            html = html.replace(new RegExp(escapeRegExp(safeTerm), 'gi'), match => `<mark>${match}</mark>`);
        });

        return html;
    }

    function truncateSearchPreview(text, maxLength = 110) {
        const normalized = compactSearchText(text);
        if (!normalized) return '';
        return normalized.length > maxLength
            ? `${normalized.slice(0, maxLength - 1).trim()}…`
            : normalized;
    }

    function extractStructuredSearchPairs(text = '') {
        const normalized = compactSearchText(text);
        if (!normalized) return [];

        const pairs = [];
        const pairPattern = /(^|\s)([^：]{1,18})：([^：]+?)(?=(?:\s+[^：]{1,18}：)|$)/g;
        let match;
        while ((match = pairPattern.exec(normalized)) !== null) {
            const label = compactSearchText(match[2]);
            const value = compactSearchText(match[3]);
            if (!label || !value) continue;
            pairs.push([label, value]);
        }

        return pairs;
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
            if (highlights.length >= AI_RESULT_HIGHLIGHT_LIMIT) return;
            pushHighlight(`${label}：${value}`);
        });

        if (!highlights.length) {
            pushHighlight(createPlainExcerpt(result, queryData, 240));
        }

        return highlights.slice(0, AI_RESULT_HIGHLIGHT_LIMIT);
    }

    function getSearchResultMetaChips(result) {
        const chips = [];

        if ((result.sourceDetailType || 'general') !== 'general') {
            chips.push(getAiSourceDetailLabel(result.sourceDetailType || 'general'));
        }

        if (result.fieldType && result.fieldType !== 'parent') {
            chips.push(getAiFieldLabel(result.fieldType));
        }

        if (result.timeHint) {
            chips.push(result.timeHint);
        } else if (result.bestTimeHint) {
            chips.push(result.bestTimeHint);
        }

        return uniqueItems(chips).slice(0, 3);
    }

    function createExcerpt(doc, queryData) {
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

    function getRankedSearchResults(query) {
        const queryData = getSearchUnits(query);
        if (!queryData.normalizedQuery || queryData.normalizedQuery.length < SEARCH_MIN_LENGTH) {
            return { queryData, results: [] };
        }

        const results = searchState.documents
            .filter(doc => !doc.aiOnly)
            .map(doc => ({ ...doc, score: scoreDocument(doc, queryData) }))
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

        return { queryData, results };
    }

    function getAiRankedSearchResults(query, rewriteMeta = null) {
        const queryData = getAiSearchUnits(query, rewriteMeta);
        if (!queryData.normalizedQuery || queryData.signalLength < AI_SEARCH_MIN_LENGTH) {
            return { queryData, results: [] };
        }

        const results = searchState.documents
            .map(doc => ({ ...doc, score: scoreDocumentForAi(doc, queryData) }))
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 48);

        return { queryData, results };
    }

    function safeGetAiRankedSearchResults(query, rewriteMeta = null) {
        try {
            const payload = getAiRankedSearchResults(query, rewriteMeta);
            return {
                ok: true,
                queryData: payload.queryData,
                results: payload.results,
                error: null
            };
        } catch (error) {
            console.error('AI local retrieval failed:', error);
            return {
                ok: false,
                queryData: getAiSearchUnits(query),
                results: [],
                error
            };
        }
    }

    function collapseAiDisplayResults(results = []) {
        const collapsed = new Map();

        results.forEach(result => {
            const key = result.parentId || result.id;
            const existing = collapsed.get(key);
            if (!existing) {
                collapsed.set(key, result);
                return;
            }

            const existingRank = (existing.aiOnly ? 0 : 4) + (existing.fieldType === 'parent' ? 2 : 0);
            const candidateRank = (result.aiOnly ? 0 : 4) + (result.fieldType === 'parent' ? 2 : 0);
            if (candidateRank > existingRank || (candidateRank === existingRank && (result.score || 0) > (existing.score || 0))) {
                collapsed.set(key, result);
            }
        });

        return Array.from(collapsed.values())
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 20);
    }

    function scoreAiSelectionCandidate(result, role, queryData = {}, intentProfile = null) {
        const resolvedProfile = intentProfile || queryData.intentProfile || buildAiIntentProfile(queryData);
        const focusTerms = uniqueItems([
            ...(resolvedProfile.focusTerms || []),
            ...(queryData.slotTerms || [])
        ]);
        let score = result.score || 0;
        const bodyText = `${result.normalizedKeywords} ${result.normalizedText} ${result.normalizedStructuredText || ''}`;
        const focusTitleMatches = countMatchedTerms(result.normalizedTitle, focusTerms);
        const focusBodyMatches = countMatchedTerms(bodyText, focusTerms);
        const fieldType = result.fieldType || 'parent';
        const roleHints = result.evidenceRoleHints || [];
        const sourceGroup = getAiSourceGroup(result.sourceType);

        if (focusTitleMatches >= 1) {
            score += 14;
        } else if (focusBodyMatches >= 1) {
            score += 8;
        }

        if (roleHints.includes(role)) {
            score += 18;
        }

        if (role === 'primary-answer') {
            if (!result.aiOnly) score += 14;
            if (['parent', 'action', 'summary', 'theme', 'desc'].includes(fieldType)) score += 12;
            if (sourceGroup === resolvedProfile.sourcePriority[0]) score += 14;
        }

        if (role === 'core-answer') {
            if (!result.aiOnly) score += 18;
            if (['parent', 'action', 'summary', 'theme', 'desc'].includes(fieldType)) score += 18;
            if (sourceGroup === resolvedProfile.sourcePriority[0]) score += 16;
            if (countMatchedTerms(result.normalizedCombined, queryData.hardAnchors || []) >= 1) {
                score += 18;
            }
        }

        if (role === 'sop-action') {
            if (['action', 'desc', 'tripUse', 'tripLink'].includes(fieldType)) score += 24;
            if (result.sourceType === 'playbook') score += 10;
            if (resolvedProfile.type === 'sequence' && result.sourceType === 'schedule') score += 10;
        }

        if (role === 'same-subject-detail') {
            if (['action', 'tripFit', 'tripUse', 'summary', 'theme', 'desc', 'parent'].includes(fieldType)) score += 18;
            if (countMatchedTerms(result.normalizedCombined, queryData.subjectClusters || []) >= 1) {
                score += 12;
            }
            if (focusBodyMatches >= 1) {
                score += 8;
            }
        }

        if (role === 'caution-exception') {
            if (['caution', 'bestTime', 'timingTip'].includes(fieldType)) score += 24;
            if (result.sourceDetailType === 'official') score += 12;
            if ((queryData.slots?.risk || []).length && ['caution', 'bestTime', 'timingTip'].includes(fieldType)) {
                score += 10;
            }
        }

        if (role === 'rules-limits') {
            if (['caution', 'bestTime', 'timingTip', 'whenToUse', 'action'].includes(fieldType)) score += 24;
            if (result.sourceDetailType === 'official') score += 14;
            if (countMatchedTerms(result.normalizedCombined, queryData.softModifiers || []) >= 1) {
                score += 8;
            }
        }

        if (role === 'context-day') {
            if (result.sourceType === 'schedule') score += 18;
            if (['time', 'whenToUse', 'bestTime', 'timingTip', 'parent'].includes(fieldType)) score += 12;
            if (countMatchedTerms(bodyText, [...(queryData.slots?.day || []), ...(queryData.slots?.timeWindow || [])]) >= 1) {
                score += 10;
            }
        }

        if (role === 'timing-context') {
            if (result.sourceType === 'schedule') score += 20;
            if (['time', 'whenToUse', 'bestTime', 'timingTip', 'desc', 'parent'].includes(fieldType)) score += 14;
            if (countMatchedTerms(bodyText, [...(queryData.slots?.day || []), ...(queryData.slots?.timeWindow || [])]) >= 1) {
                score += 12;
            }
        }

        if (role === 'why-this-works') {
            if (['tripFit', 'tripUse', 'tripLink'].includes(fieldType)) score += 20;
        }

        if (role === 'source-breakdown' && result.sourceType === 'playbook' && result.sourceDetailType !== 'general') {
            score += 16;
        }

        if (role === 'source-compare') {
            if (result.sourceDetailType !== 'general') score += 18;
            if (result.sourceType === 'playbook') score += 10;
            if (['action', 'caution', 'parent', 'desc'].includes(fieldType)) score += 8;
        }

        if (role === 'source-contrast') {
            if (result.sourceDetailType !== 'general') score += 20;
            if (result.sourceType === 'playbook') score += 12;
            if (['action', 'caution', 'parent', 'desc', 'whenToUse'].includes(fieldType)) score += 10;
        }

        if (role === 'bridge-context') {
            if (['time', 'whenToUse', 'bestTime', 'timingTip', 'tripUse', 'tripFit', 'desc'].includes(fieldType)) {
                score += 16;
            }
            if (focusBodyMatches >= 1) {
                score += 8;
            }
        }

        if (role === 'report-support') {
            if (['action', 'caution', 'tripFit', 'tripUse', 'bestTime', 'timingTip', 'whenToUse', 'desc', 'summary', 'theme'].includes(fieldType)) {
                score += 14;
            }
            if (focusBodyMatches >= 1) {
                score += 8;
            }
        }

        if (role === 'facet-goal') {
            if (['action', 'tripUse', 'tripLink', 'tripFit', 'desc', 'parent'].includes(fieldType)) {
                score += 22;
            }
            if (focusBodyMatches >= 1) {
                score += 8;
            }
        }

        if (role === 'facet-time') {
            if (['time', 'whenToUse', 'bestTime', 'timingTip', 'desc', 'parent'].includes(fieldType)) {
                score += 22;
            }
            if (result.sourceType === 'schedule') {
                score += 12;
            }
        }

        if (role === 'facet-entity-place') {
            if (['parent', 'summary', 'theme', 'action', 'desc'].includes(fieldType)) {
                score += 18;
            }
            if (focusTitleMatches >= 1) {
                score += 10;
            }
        }

        if (role === 'facet-audience') {
            if (['tripFit', 'tripUse', 'action', 'summary', 'desc'].includes(fieldType)) {
                score += 18;
            }
        }

        if (role === 'facet-risk') {
            if (['caution', 'bestTime', 'timingTip', 'action'].includes(fieldType)) {
                score += 24;
            }
            if (result.sourceDetailType === 'official') {
                score += 10;
            }
        }

        if (role === 'facet-alternatives') {
            if (['parent', 'action', 'summary', 'theme', 'desc'].includes(fieldType)) {
                score += 18;
            }
            if (focusTitleMatches >= 1) {
                score += 8;
            }
        }

        return score;
    }

    function getAiSelectionConfig(responseMode, intentProfile) {
        const isReport = responseMode === 'report';

        return {
            maxResults: isReport ? AI_REPORT_MAX_RESULTS : 8,
            maxParents: isReport ? AI_REPORT_MAX_PARENTS : 4,
            maxPerParent: isReport ? AI_REPORT_MAX_PER_PARENT : 2,
            maxPerSourceGroup: isReport ? 8 : 3,
            maxSchedule: isReport ? 6 : (intentProfile.type === 'sequence' ? 3 : 2),
            maxStatic: 1
        };
    }

    function matchesAiEvidenceBundleCategory(result, category) {
        const fieldType = result.fieldType || 'parent';
        const role = result.evidenceRole || '';
        const sourceDetailType = result.sourceDetailType || 'general';

        if (category === 'core') {
            return ['primary-answer', 'sop-action', 'core-answer'].includes(role)
                || ['parent', 'action', 'desc'].includes(fieldType);
        }

        if (category === 'detail') {
            return ['why-this-works', 'report-support', 'facet-goal', 'facet-entity-place', 'bridge-context', 'same-subject-detail'].includes(role)
                || ['tripFit', 'tripUse', 'summary', 'theme', 'action', 'desc', 'parent'].includes(fieldType);
        }

        if (category === 'risk') {
            return ['caution-exception', 'facet-risk', 'rules-limits'].includes(role)
                || ['caution', 'bestTime', 'timingTip', 'whenToUse'].includes(fieldType);
        }

        if (category === 'context') {
            return ['context-day', 'facet-time', 'timing-context'].includes(role)
                || result.sourceType === 'schedule'
                || ['time', 'whenToUse', 'bestTime', 'timingTip', 'desc'].includes(fieldType);
        }

        if (category === 'compare') {
            return ['source-compare', 'source-breakdown', 'facet-alternatives', 'source-contrast'].includes(role)
                || sourceDetailType !== 'general';
        }

        return false;
    }

    function getAiEvidenceBundleFillConfig(reportPlan = {}) {
        return [
            {
                category: 'core',
                limit: 6,
                role: 'core-answer',
                filter: candidate => ['parent', 'action', 'desc'].includes(candidate.fieldType || 'parent')
            },
            {
                category: 'detail',
                limit: 8,
                role: 'same-subject-detail',
                filter: candidate => ['action', 'tripFit', 'tripUse', 'summary', 'theme', 'desc', 'parent'].includes(candidate.fieldType || 'parent')
            },
            {
                category: 'risk',
                limit: 4,
                role: 'rules-limits',
                filter: candidate => ['caution', 'bestTime', 'timingTip', 'action', 'whenToUse'].includes(candidate.fieldType || 'parent')
            },
            {
                category: 'context',
                limit: 3,
                role: 'timing-context',
                filter: candidate => candidate.sourceType === 'schedule'
                    || ['time', 'whenToUse', 'bestTime', 'timingTip', 'desc'].includes(candidate.fieldType || 'parent')
            },
            {
                category: 'compare',
                limit: 3,
                role: 'source-contrast',
                filter: candidate => (candidate.sourceDetailType || 'general') !== 'general'
            }
        ];
    }

    function getAiSiblingFieldPriority(sourceType) {
        if (sourceType === 'playbook') {
            return ['action', 'caution', 'tripFit', 'whenToUse', 'parent'];
        }

        if (sourceType === 'schedule') {
            return ['desc', 'time', 'tag', 'parent'];
        }

        if (sourceType === 'deck') {
            return ['summary', 'bestTime', 'tripUse', 'parent'];
        }

        if (sourceType === 'show') {
            return ['theme', 'timingTip', 'tripLink', 'parent'];
        }

        return ['parent'];
    }

    function matchesAiFacetTerms(result, terms = []) {
        return countMatchedTerms(result.normalizedCombined || '', terms) >= 1;
    }

    function selectAiEvidenceResults(results, queryData = {}, options = {}) {
        const responseMode = options.responseMode === 'report' ? 'report' : 'compact';
        const reportPlan = options.reportPlan || buildAiReportPlanner(queryData, results, [], options);
        const selected = [];
        const seenIds = new Set();
        const parentCounts = new Map();
        const sourceCounts = new Map();
        const intentProfile = queryData.intentProfile || buildAiIntentProfile(queryData);
        const selectionConfig = getAiSelectionConfig(responseMode, intentProfile);
        const hardAnchors = uniqueItems(reportPlan.hardAnchors || queryData.hardAnchors || []);
        const softModifiers = uniqueItems(reportPlan.softModifiers || queryData.softModifiers || []);
        const subjectClusters = uniqueItems(reportPlan.subjectClusters || queryData.subjectClusters || hardAnchors);
        const evidenceLayers = reportPlan.evidenceLayers || queryData.evidenceLayers || {};
        const rolePlan = responseMode === 'report'
            ? ['core-answer', 'core-answer', 'timing-context', 'rules-limits', 'same-subject-detail', 'source-contrast']
            : (intentProfile.type === 'sequence'
                ? ['primary-answer', 'sop-action', 'context-day', 'caution-exception']
                : ['primary-answer', 'sop-action', 'caution-exception', 'context-day']);

        const canAddResult = (result) => {
            if (!result || seenIds.has(result.id)) return false;
            if (selected.length >= selectionConfig.maxResults) return false;

            const parentId = result.parentId || result.id;
            const currentParentCount = parentCounts.get(parentId) || 0;
            if (currentParentCount >= selectionConfig.maxPerParent) return false;
            if (!parentCounts.has(parentId) && parentCounts.size >= selectionConfig.maxParents) return false;

            const sourceGroup = getAiSourceGroup(result.sourceType);
            const currentSourceCount = sourceCounts.get(sourceGroup) || 0;
            if (sourceGroup === 'static' && currentSourceCount >= selectionConfig.maxStatic) return false;
            if (sourceGroup === 'schedule' && currentSourceCount >= selectionConfig.maxSchedule) return false;
            if (currentSourceCount >= selectionConfig.maxPerSourceGroup) return false;

            return true;
        };

        const addResult = (result, role) => {
            if (!canAddResult(result)) return false;

            const parentId = result.parentId || result.id;
            const sourceGroup = getAiSourceGroup(result.sourceType);
            seenIds.add(result.id);
            parentCounts.set(parentId, (parentCounts.get(parentId) || 0) + 1);
            sourceCounts.set(sourceGroup, (sourceCounts.get(sourceGroup) || 0) + 1);
            selected.push({
                ...result,
                evidenceRole: role
            });
            return true;
        };

        const pickBestForRole = (role, extraFilter = null) => {
            const candidates = results.filter(result => canAddResult(result) && (!extraFilter || extraFilter(result)));
            if (!candidates.length) return null;

            return [...candidates]
                .sort((a, b) => scoreAiSelectionCandidate(b, role, queryData, intentProfile) - scoreAiSelectionCandidate(a, role, queryData, intentProfile))[0];
        };

        const pickCandidatesForRole = (role, extraFilter = null, limit = 1) => {
            if (limit <= 0) return [];
            return results
                .filter(result => canAddResult(result) && (!extraFilter || extraFilter(result)))
                .sort((a, b) => scoreAiSelectionCandidate(b, role, queryData, intentProfile) - scoreAiSelectionCandidate(a, role, queryData, intentProfile))
                .slice(0, limit);
        };

        const addCandidates = (role, extraFilter = null, limit = 1) => {
            let added = 0;
            pickCandidatesForRole(role, extraFilter, limit).forEach(candidate => {
                if (addResult(candidate, role)) {
                    added += 1;
                }
            });
            return added;
        };

        const matchTerms = (candidate, terms = []) => {
            if (!terms.length) return false;
            return matchesAiFacetTerms(candidate, terms);
        };

        rolePlan.forEach(role => {
            if (role === 'core-answer') {
                addCandidates(role, candidate =>
                    matchTerms(candidate, hardAnchors)
                    && ['parent', 'action', 'desc', 'summary', 'theme'].includes(candidate.fieldType || 'parent'),
                1);
                return;
            }

            if (role === 'timing-context') {
                addCandidates(role, candidate =>
                    (intentProfile.prefersScheduleContext || matchTerms(candidate, evidenceLayers.timingContext || reportPlan.facets?.time || []))
                    && (candidate.sourceType === 'schedule'
                        || ['time', 'whenToUse', 'bestTime', 'timingTip', 'desc'].includes(candidate.fieldType || 'parent')),
                1);
                return;
            }

            if (role === 'rules-limits') {
                addCandidates(role, candidate =>
                    (intentProfile.requiresCautionChunk || matchTerms(candidate, evidenceLayers.rulesLimits || softModifiers))
                    && ['caution', 'bestTime', 'timingTip', 'whenToUse', 'action'].includes(candidate.fieldType || 'parent'),
                1);
                return;
            }

            if (role === 'same-subject-detail') {
                addCandidates(role, candidate =>
                    matchTerms(candidate, subjectClusters)
                    && ['action', 'tripFit', 'tripUse', 'summary', 'theme', 'desc', 'parent'].includes(candidate.fieldType || 'parent'),
                1);
                return;
            }

            if (role === 'source-contrast') {
                addCandidates(role, candidate =>
                    reportPlan.needsSourceComparison
                    && (candidate.sourceDetailType || 'general') !== 'general',
                1);
                return;
            }

            let result = pickBestForRole(role);
            if (!result && role === 'primary-answer') {
                result = results[0] || null;
            }

            if (role === 'primary-answer' && intentProfile.type === 'sequence') {
                result = pickBestForRole(role, candidate =>
                    getAiSourceGroup(candidate.sourceType) === 'schedule' || candidate.fieldType === 'action'
                ) || result;
            }

            if (role === 'sop-action' && intentProfile.requiresActionChunk) {
                result = pickBestForRole(role, candidate =>
                    ['action', 'desc', 'tripUse', 'tripLink'].includes(candidate.fieldType || 'parent')
                ) || result;
            }

            if (role === 'caution-exception' && intentProfile.requiresCautionChunk) {
                result = pickBestForRole(role, candidate =>
                    ['caution', 'bestTime', 'timingTip'].includes(candidate.fieldType || 'parent')
                ) || result;
            }

            if (role === 'context-day' && intentProfile.prefersScheduleContext) {
                result = pickBestForRole(role, candidate =>
                    candidate.sourceType === 'schedule'
                    || ['time', 'whenToUse', 'bestTime', 'timingTip'].includes(candidate.fieldType || 'parent')
                ) || result;
            }

            addResult(result, role);
        });

        if (!selected.length) {
            addResult(results[0] || null, responseMode === 'report' ? 'core-answer' : 'primary-answer');
        }

        if (intentProfile.type === 'sequence' && !selected.some(result => result.sourceType === 'schedule')) {
            addResult(pickBestForRole('timing-context', result => result.sourceType === 'schedule'), 'timing-context');
        }

        if (!selected.some(result => ['action', 'desc', 'tripUse', 'tripLink'].includes(result.fieldType || 'parent'))) {
            addResult(
                pickBestForRole('core-answer', result =>
                    ['action', 'desc', 'tripUse', 'tripLink'].includes(result.fieldType || 'parent')
                ),
                responseMode === 'report' ? 'core-answer' : 'sop-action'
            );
        }

        if (intentProfile.requiresCautionChunk && !selected.some(result => ['caution', 'bestTime', 'timingTip'].includes(result.fieldType || 'parent'))) {
            addResult(
                pickBestForRole('rules-limits', result =>
                    ['caution', 'bestTime', 'timingTip'].includes(result.fieldType || 'parent')
                ),
                responseMode === 'report' ? 'rules-limits' : 'caution-exception'
            );
        }

        if (responseMode === 'report') {
            const facetConfigs = [
                {
                    role: 'core-answer',
                    terms: evidenceLayers.core || hardAnchors,
                    filter: candidate => ['parent', 'action', 'desc', 'summary', 'theme'].includes(candidate.fieldType || 'parent')
                },
                {
                    role: 'same-subject-detail',
                    terms: evidenceLayers.extension || subjectClusters,
                    filter: candidate => ['action', 'tripFit', 'tripUse', 'summary', 'theme', 'desc', 'parent'].includes(candidate.fieldType || 'parent')
                },
                {
                    role: 'rules-limits',
                    terms: evidenceLayers.rulesLimits || softModifiers,
                    filter: candidate => ['caution', 'bestTime', 'timingTip', 'whenToUse', 'action'].includes(candidate.fieldType || 'parent')
                },
                {
                    role: 'timing-context',
                    terms: evidenceLayers.timingContext || reportPlan.facets?.time || [],
                    filter: candidate => candidate.sourceType === 'schedule'
                        || ['time', 'whenToUse', 'bestTime', 'timingTip', 'desc'].includes(candidate.fieldType || 'parent')
                },
                {
                    role: 'source-contrast',
                    terms: evidenceLayers.sourceContrast || [],
                    filter: candidate => (candidate.sourceDetailType || 'general') !== 'general'
                }
            ];

            facetConfigs.forEach(facetConfig => {
                if (selected.length >= selectionConfig.maxResults) return;
                if (!facetConfig.terms?.length && facetConfig.role !== 'source-contrast') return;
                addCandidates(facetConfig.role, candidate =>
                    (!facetConfig.terms?.length || matchTerms(candidate, facetConfig.terms))
                    && (!facetConfig.filter || facetConfig.filter(candidate)),
                facetConfig.role === 'same-subject-detail' ? 3 : 2);
            });

            uniqueItems(selected.map(result => result.parentId || result.id)).forEach(parentId => {
                const siblingPool = results.filter(result => (result.parentId || result.id) === parentId);
                const parentSourceType = siblingPool[0]?.sourceType || 'static';

                getAiSiblingFieldPriority(parentSourceType).forEach(fieldType => {
                    addResult(
                        pickBestForRole('same-subject-detail', candidate =>
                            (candidate.parentId || candidate.id) === parentId
                            && (candidate.fieldType || 'parent') === fieldType
                        ),
                        fieldType === 'action'
                            ? 'core-answer'
                            : fieldType === 'caution'
                                ? 'rules-limits'
                                : fieldType === 'time' || fieldType === 'whenToUse' || fieldType === 'bestTime' || fieldType === 'timingTip'
                                    ? 'timing-context'
                                    : 'same-subject-detail'
                    );
                });
            });

            const bridgeTerms = uniqueItems([
                ...subjectClusters,
                ...(reportPlan.facets?.time || []),
                ...(reportPlan.facets?.audience || []),
                ...hardAnchors.slice(0, 6)
            ]).slice(0, 18);

            results
                .filter(result => canAddResult(result) && matchTerms(result, bridgeTerms))
                .sort((a, b) => scoreAiSelectionCandidate(b, 'bridge-context', queryData, intentProfile) - scoreAiSelectionCandidate(a, 'bridge-context', queryData, intentProfile))
                .slice(0, 8)
                .forEach(result => {
                    addResult(result, ['time', 'whenToUse', 'bestTime', 'timingTip', 'desc'].includes(result.fieldType || 'parent')
                        ? 'timing-context'
                        : 'same-subject-detail');
                });

            if (reportPlan.needsSourceComparison) {
                uniqueItems([
                    ...(reportPlan.sourceDetailTypes || []),
                    ...results
                        .map(result => result.sourceDetailType || 'general')
                        .filter(type => type && type !== 'general')
                ])
                    .slice(0, 4)
                    .forEach(sourceDetailType => {
                        addResult(
                            pickBestForRole('source-contrast', candidate =>
                                (candidate.sourceDetailType || 'general') === sourceDetailType
                                && getAiSourceGroup(candidate.sourceType) !== 'static'
                            ),
                            'source-contrast'
                        );
                    });
            }

            getAiEvidenceBundleFillConfig(reportPlan).forEach(bundleConfig => {
                const bundleTerms = bundleConfig.category === 'core'
                    ? (evidenceLayers.core || hardAnchors)
                    : bundleConfig.category === 'detail'
                        ? (evidenceLayers.extension || subjectClusters)
                        : bundleConfig.category === 'risk'
                            ? (evidenceLayers.rulesLimits || softModifiers)
                            : bundleConfig.category === 'context'
                                ? (evidenceLayers.timingContext || reportPlan.facets?.time || [])
                                : (evidenceLayers.sourceContrast || []);
                while (
                    selected.filter(result => matchesAiEvidenceBundleCategory(result, bundleConfig.category)).length < bundleConfig.limit
                    && selected.length < selectionConfig.maxResults
                ) {
                    const candidate = pickBestForRole(bundleConfig.role, result =>
                        (!bundleTerms.length || matchTerms(result, bundleTerms) || bundleConfig.category === 'compare')
                        && (!bundleConfig.filter || bundleConfig.filter(result))
                    );
                    if (!candidate) break;
                    addResult(candidate, bundleConfig.role);
                }
            });
        }

        results.forEach(result => {
            if (selected.length >= selectionConfig.maxResults) return;
            const role = responseMode === 'report'
                ? (matchTerms(result, subjectClusters) ? 'same-subject-detail' : ((result.evidenceRoleHints || [])[0] || 'supporting'))
                : ((result.evidenceRoleHints || [])[0] || 'supporting');
            addResult(result, role);
        });

        return selected.slice(0, selectionConfig.maxResults);
    }

    function resolveAiEvidencePlan(results, queryData, options = {}) {
        const planningOptions = {
            ...options,
            defaultResponseMode: options.defaultResponseMode || AI_REPORT_DEFAULT_MODE
        };
        const initialPlan = buildAiReportPlanner(queryData, results, results.slice(0, 6), planningOptions);
        let selectedResults = selectAiEvidenceResults(results, queryData, {
            ...planningOptions,
            responseMode: initialPlan.responseMode,
            reportPlan: initialPlan
        });
        let reportPlan = buildAiReportPlanner(queryData, results, selectedResults, planningOptions);

        if (reportPlan.responseMode === 'report' || reportPlan.responseMode !== initialPlan.responseMode) {
            selectedResults = selectAiEvidenceResults(results, queryData, {
                ...planningOptions,
                responseMode: reportPlan.responseMode,
                reportPlan
            });
            reportPlan = buildAiReportPlanner(queryData, results, selectedResults, planningOptions);
        }

        return {
            selectedResults,
            reportPlan
        };
    }

    function getAiRetrievalStatus(queryData, results, selectedResults, reportPlan = null) {
        if (!queryData.normalizedQuery || queryData.signalLength < AI_SEARCH_MIN_LENGTH) {
            return 'insufficient';
        }

        if (!results.length) {
            return 'insufficient';
        }

        const intentProfile = queryData.intentProfile || buildAiIntentProfile(queryData);
        const strongCount = selectedResults.filter(result => result.score >= 18).length;
        const topScore = results[0]?.score || 0;
        const primaryGroup = intentProfile.sourcePriority[0];
        const hasPrimary = selectedResults.some(result => getAiSourceGroup(result.sourceType) === primaryGroup);
        const hasActionChunk = selectedResults.some(result => ['action', 'desc', 'tripUse', 'tripLink'].includes(result.fieldType || 'parent'));
        const hasCautionChunk = selectedResults.some(result => ['caution', 'bestTime', 'timingTip'].includes(result.fieldType || 'parent'));
        const hasSupportingGuide = selectedResults.some(result =>
            getAiSourceGroup(result.sourceType) !== primaryGroup && getAiSourceGroup(result.sourceType) !== 'static'
        );
        const hasWeakEvidence = results.length >= 2 || topScore >= 12;
        const hasIntentSignal = Object.values(queryData.intents || {}).some(Boolean);

        if (intentProfile.type === 'sequence') {
            if (hasPrimary && hasSupportingGuide && hasActionChunk && (strongCount >= 1 || topScore >= 22)) {
                return 'strong';
            }
        } else if (reportPlan?.responseMode === 'report' && hasPrimary && selectedResults.length >= 4 && strongCount >= AI_REPORT_STRONG_EVIDENCE_MIN) {
            return 'strong';
        } else if (hasPrimary && hasActionChunk && (!intentProfile.requiresCautionChunk || hasCautionChunk) && (strongCount >= 1 || topScore >= 24)) {
            return 'strong';
        }

        if (selectedResults.length >= 2 || hasWeakEvidence || hasIntentSignal) {
            return 'rewrite';
        }

        return 'insufficient';
    }

    function mergeAiRankedResults(primaryResults, secondaryResults) {
        const merged = new Map();

        [...primaryResults, ...secondaryResults].forEach(result => {
            const existing = merged.get(result.id);
            if (!existing || existing.score < result.score) {
                merged.set(result.id, result);
            }
        });

        return Array.from(merged.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 48);
    }

    function getAiReportSectionEntries(report = {}) {
        return [
            {
                key: 'executiveSummary',
                title: '先看結論',
                type: 'summary',
                items: Array.isArray(report.executiveSummary) ? report.executiveSummary : []
            },
            {
                key: 'recommendedPlan',
                title: '推薦做法',
                type: 'list',
                items: Array.isArray(report.recommendedPlan) ? report.recommendedPlan : []
            },
            {
                key: 'detailBreakdown',
                title: '細節拆解',
                type: 'list',
                items: Array.isArray(report.detailBreakdown) ? report.detailBreakdown : []
            },
            {
                key: 'decisionAnalysis',
                title: '為什麼這樣安排',
                type: 'list',
                items: Array.isArray(report.decisionAnalysis) ? report.decisionAnalysis : []
            },
            {
                key: 'risksAndFallbacks',
                title: '風險與備案',
                type: 'list',
                items: Array.isArray(report.risksAndFallbacks) ? report.risksAndFallbacks : []
            },
            {
                key: 'topicGroups',
                title: '主題清單',
                type: 'topic-groups',
                items: Array.isArray(report.topicGroups) ? report.topicGroups : []
            },
            {
                key: 'cardHighlights',
                title: '關鍵攻略卡',
                type: 'card-highlights',
                items: Array.isArray(report.cardHighlights) ? report.cardHighlights : []
            },
            {
                key: 'sourceComparison',
                title: '來源差異',
                type: 'comparison',
                items: Array.isArray(report.sourceComparison) ? report.sourceComparison : []
            },
            {
                key: 'unansweredQuestions',
                title: '還缺什麼',
                type: 'list',
                items: Array.isArray(report.unansweredQuestions) ? report.unansweredQuestions : []
            }
        ].filter(section => section.items.length);
    }

    function renderAiReportOutline(sectionEntries = []) {
        if (!sectionEntries.length) return '';

        return `
            <div class="search-ai-report-outline" role="navigation" aria-label="AI 報告段落">
                ${sectionEntries.map(section => `
                    <button type="button" class="search-ai-report-anchor" data-ai-report-anchor="${section.key}">
                        ${escapeHtml(section.title)}
                    </button>
                `).join('')}
            </div>
        `;
    }

    function renderAiReportSection(section, report = {}) {
        const sectionCitationIds = report.sectionCitationIds && typeof report.sectionCitationIds === 'object'
            ? report.sectionCitationIds
            : {};
        const citationCount = Array.isArray(sectionCitationIds[section.key]) ? sectionCitationIds[section.key].length : 0;

        if (section.type === 'card-highlights') {
            return `
                <section class="search-ai-report-section" data-ai-report-section="${section.key}">
                    <div class="search-ai-report-section-header">
                        <h3 class="search-ai-section-title">${escapeHtml(section.title)}</h3>
                        ${citationCount ? `<span class="search-ai-section-meta">${citationCount} 則引用</span>` : ''}
                    </div>
                    <div class="search-ai-card-highlights">
                        ${section.items.map(item => `
                            <article class="search-ai-card-highlight-item">
                                <div class="search-ai-card-highlight-top">
                                    <h4 class="search-ai-card-highlight-title">${escapeHtml(item?.title || '')}</h4>
                                    <div class="search-ai-card-highlight-chips">
                                        <span class="search-ai-source-chip">${escapeHtml(getAiAnswerSourceLabel(item?.sourceType || 'static'))}</span>
                                        <span class="search-ai-source-chip">${escapeHtml(getAiSourceDetailLabel(item?.sourceDetailType || 'general'))}</span>
                                    </div>
                                </div>
                                ${item?.whyRelevant ? `<p class="search-ai-card-highlight-why">${escapeHtml(item.whyRelevant)}</p>` : ''}
                                ${Array.isArray(item?.detailBullets) && item.detailBullets.length ? `
                                    <ul class="search-ai-report-list">
                                        ${item.detailBullets.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
                                    </ul>
                                ` : ''}
                                ${Array.isArray(item?.citationIds) && item.citationIds.length ? `
                                    <div class="search-ai-inline-citations">
                                        ${item.citationIds.map(citationId => {
                                            const citation = searchState.aiCitationsById.get(citationId);
                                            return citation ? `
                                                <button type="button" class="search-ai-citation compact" data-ai-citation-id="${citation.id}">
                                                    <i class="fa-solid fa-link"></i>
                                                    <span>${escapeHtml(citation.title)}</span>
                                                </button>
                                            ` : '';
                                        }).join('')}
                                    </div>
                                ` : ''}
                            </article>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        if (section.type === 'topic-groups') {
            return `
                <section class="search-ai-report-section" data-ai-report-section="${section.key}">
                    <div class="search-ai-report-section-header">
                        <h3 class="search-ai-section-title">${escapeHtml(section.title)}</h3>
                        ${citationCount ? `<span class="search-ai-section-meta">${citationCount} 則引用</span>` : ''}
                    </div>
                    <div class="search-ai-topic-groups">
                        ${section.items.map(item => `
                            <article class="search-ai-topic-group ${item?.groupKind === 'core' ? 'core' : 'extension'}">
                                <div class="search-ai-topic-group-top">
                                    <div>
                                        <h4 class="search-ai-topic-group-title">${escapeHtml(item?.groupTitle || '')}</h4>
                                        ${item?.summary ? `<p class="search-ai-topic-group-summary">${escapeHtml(item.summary)}</p>` : ''}
                                    </div>
                                    <div class="search-ai-card-highlight-chips">
                                        <span class="search-ai-source-chip">${escapeHtml(item?.groupKind === 'core' ? '核心' : '延伸')}</span>
                                        ${item?.entityType ? `<span class="search-ai-source-chip">${escapeHtml(getAiEntityTypeLabel(item.entityType))}</span>` : ''}
                                        ${Array.isArray(item?.sourceMix) ? item.sourceMix
                                            .map(source => getAiSourceDetailLabel(source || 'general'))
                                            .filter(Boolean)
                                            .map(sourceLabel => `<span class="search-ai-source-chip">${escapeHtml(sourceLabel)}</span>`)
                                            .join('') : ''}
                                    </div>
                                </div>
                                ${Array.isArray(item?.detailItems) && item.detailItems.length ? `
                                    <ul class="search-ai-report-list">
                                        ${item.detailItems.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
                                    </ul>
                                ` : ''}
                                ${Array.isArray(item?.citationIds) && item.citationIds.length ? `
                                    <div class="search-ai-inline-citations">
                                        ${item.citationIds.map(citationId => {
                                            const citation = searchState.aiCitationsById.get(citationId);
                                            return citation ? `
                                                <button type="button" class="search-ai-citation compact" data-ai-citation-id="${citation.id}">
                                                    <i class="fa-solid fa-link"></i>
                                                    <span>${escapeHtml(citation.title)}</span>
                                                </button>
                                            ` : '';
                                        }).join('')}
                                    </div>
                                ` : ''}
                            </article>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        if (section.type === 'comparison') {
            return `
                <section class="search-ai-report-section" data-ai-report-section="${section.key}">
                    <div class="search-ai-report-section-header">
                        <h3 class="search-ai-section-title">${escapeHtml(section.title)}</h3>
                        ${citationCount ? `<span class="search-ai-section-meta">${citationCount} 則引用</span>` : ''}
                    </div>
                    <div class="search-ai-source-comparison">
                        ${section.items.map(item => `
                            <article class="search-ai-source-comparison-item">
                                <div class="search-ai-source-comparison-top">
                                    <span class="search-ai-source-chip">${escapeHtml(getAiSourceDetailLabel(item?.sourceDetailType || 'general'))}</span>
                                    ${item?.stance ? `<span class="search-ai-source-comparison-stance">${escapeHtml(item.stance)}</span>` : ''}
                                </div>
                                <p>${escapeHtml(item?.summary || '')}</p>
                                ${item?.confidenceNote ? `<p class="search-ai-note">${escapeHtml(item.confidenceNote)}</p>` : ''}
                            </article>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        const listClass = section.type === 'summary'
            ? 'search-ai-report-summary'
            : 'search-ai-report-list';

        return `
            <section class="search-ai-report-section" data-ai-report-section="${section.key}">
                <div class="search-ai-report-section-header">
                    <h3 class="search-ai-section-title">${escapeHtml(section.title)}</h3>
                    ${citationCount ? `<span class="search-ai-section-meta">${citationCount} 則引用</span>` : ''}
                </div>
                <ul class="${listClass}">
                    ${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </section>
        `;
    }

    function updateSearchWorkspaceLayout() {
        const panel = document.querySelector('#search-overlay .search-panel');
        const panelBody = document.getElementById('search-panel-body');
        const aiAnswer = document.getElementById('search-ai-answer');
        const results = document.getElementById('search-results');
        if (!panel || !panelBody || !aiAnswer || !results) return;

        const workspaceActive = searchState.activeMode === 'ai' && !aiAnswer.hidden;
        panel.classList.toggle('workspace-panel', searchState.activeMode === 'ai');
        panelBody.classList.toggle('workspace-layout', workspaceActive);
        aiAnswer.classList.toggle('workspace-pane', workspaceActive);
        results.classList.toggle('workspace-pane', workspaceActive);
    }

    function renderAiAnswerState(state) {
        const container = document.getElementById('search-ai-answer');
        if (!container) return;

        if (!state) {
            container.hidden = true;
            container.innerHTML = '';
            searchState.aiCitationsById = new Map();
            updateSearchWorkspaceLayout();
            return;
        }

        container.hidden = false;
        updateSearchWorkspaceLayout();

        if (state.type === 'loading') {
            container.innerHTML = `
                <div class="search-ai-card loading">
                    <div class="search-ai-header">
                        <span class="search-ai-badge"><i class="fa-solid fa-sparkles"></i> AI 解答整理中</span>
                    </div>
                    ${state.rewriteInfo?.hintTerms?.length ? `
                        <div class="search-ai-rewrite-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            <span>已依站內常見詞再試一次：${escapeHtml(state.rewriteInfo.hintTerms.join('、'))}</span>
                        </div>
                    ` : ''}
                    <p class="search-ai-summary">${escapeHtml(state.message || '正在根據目前站內命中的內容整理答案，這一步只會讀你網站裡的資料。')}</p>
                    ${state.note ? `<p class="search-ai-note">${escapeHtml(state.note)}</p>` : ''}
                </div>
            `;
            updateSearchWorkspaceLayout();
            return;
        }

        if (state.type === 'info') {
            container.innerHTML = `
                <div class="search-ai-card info">
                    <div class="search-ai-header">
                        <span class="search-ai-badge"><i class="fa-solid fa-circle-info"></i> AI 解答提示</span>
                    </div>
                    <p class="search-ai-summary">${escapeHtml(state.message)}</p>
                    ${state.note ? `<p class="search-ai-note">${escapeHtml(state.note)}</p>` : ''}
                </div>
            `;
            updateSearchWorkspaceLayout();
            return;
        }

        if (state.type === 'error') {
            container.innerHTML = `
                <div class="search-ai-card error">
                    <div class="search-ai-header">
                        <span class="search-ai-badge"><i class="fa-solid fa-triangle-exclamation"></i> AI 解答暫時不可用</span>
                    </div>
                    <p class="search-ai-summary">${escapeHtml(state.message)}</p>
                    ${state.note ? `<p class="search-ai-note">${escapeHtml(state.note)}</p>` : ''}
                </div>
            `;
            updateSearchWorkspaceLayout();
            return;
        }

        const citations = state.citations || [];
        searchState.aiCitationsById = new Map(citations.map(citation => [citation.id, citation]));
        const confidenceLabel = {
            high: '高信心',
            medium: '中等信心',
            low: '低信心'
        };
        const confidence = confidenceLabel[state.confidence] ? state.confidence : '';
        const sections = state.sections && typeof state.sections === 'object' ? state.sections : {};
        const directAnswer = sections.directAnswer || state.answer;
        const recommendedSteps = Array.isArray(sections.recommendedSteps) && sections.recommendedSteps.length
            ? sections.recommendedSteps
            : (state.bullets || []);
        const whyThisWorks = Array.isArray(sections.whyThisWorks) ? sections.whyThisWorks : [];
        const watchOuts = Array.isArray(sections.watchOuts) ? sections.watchOuts : [];
        const sourceBreakdown = Array.isArray(state.sourceBreakdown) ? state.sourceBreakdown : [];
        const report = state.report && typeof state.report === 'object' ? state.report : null;
        const reportSections = report ? getAiReportSectionEntries(report) : [];
        const isReportMode = Boolean(report && reportSections.length);
        const sourceMixLabels = uniqueItems(sourceBreakdown
            .map(item => getAiSourceDetailLabel(item?.type || item?.sourceDetailType || 'general'))
            .filter(Boolean));

        container.innerHTML = `
            <div class="search-ai-card">
                <div class="search-ai-header">
                    <span class="search-ai-badge"><i class="fa-solid fa-sparkles"></i> ${isReportMode ? 'AI 深層報告' : 'AI 解答'}</span>
                    ${confidence ? `<span class="search-ai-confidence ${confidence}">${confidenceLabel[confidence]}</span>` : ''}
                </div>
                ${state.primarySourceType ? `
                    <div class="search-ai-source-hint">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>本次答案主要依據：${escapeHtml(getAiAnswerSourceLabel(state.primarySourceType))}</span>
                    </div>
                ` : ''}
                ${sourceMixLabels.length ? `
                    <div class="search-ai-source-mix">
                        ${sourceMixLabels.map(label => `<span class="search-ai-source-chip">${escapeHtml(label)}</span>`).join('')}
                    </div>
                ` : ''}
                ${state.rewriteInfo?.hintTerms?.length ? `
                    <div class="search-ai-rewrite-note">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>已依站內資料常見詞再試一次：${escapeHtml(state.rewriteInfo.hintTerms.join('、'))}</span>
                    </div>
                ` : ''}
                ${isReportMode && report?.headline ? `<h3 class="search-ai-report-headline">${escapeHtml(report.headline)}</h3>` : ''}
                <p class="search-ai-summary">${escapeHtml(directAnswer)}</p>
                ${isReportMode ? renderAiReportOutline(reportSections) : ''}
                ${isReportMode ? `
                    <div class="search-ai-report-sections">
                        ${reportSections.map(section => renderAiReportSection(section, report)).join('')}
                    </div>
                ` : recommendedSteps.length || whyThisWorks.length || watchOuts.length ? `
                    <div class="search-ai-sections">
                        ${recommendedSteps.length ? `
                            <section class="search-ai-section">
                                <h3 class="search-ai-section-title">建議步驟</h3>
                                <ul class="search-ai-bullets">
                                    ${recommendedSteps.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                </ul>
                            </section>
                        ` : ''}
                        ${whyThisWorks.length ? `
                            <section class="search-ai-section">
                                <h3 class="search-ai-section-title">為什麼這樣排</h3>
                                <ul class="search-ai-bullets">
                                    ${whyThisWorks.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                </ul>
                            </section>
                        ` : ''}
                        ${watchOuts.length ? `
                            <section class="search-ai-section">
                                <h3 class="search-ai-section-title">注意事項</h3>
                                <ul class="search-ai-bullets">
                                    ${watchOuts.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                </ul>
                            </section>
                        ` : ''}
                    </div>
                ` : ''}
                ${sourceBreakdown.length ? `
                    <div class="search-ai-source-breakdown">
                        ${sourceBreakdown.map(item => `
                            <div class="search-ai-source-breakdown-item">
                                <span class="search-ai-source-chip">${escapeHtml(getAiSourceDetailLabel(item?.type || item?.sourceDetailType || 'general'))}</span>
                                <p>${escapeHtml(item?.summary || '')}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${state.insufficientData ? `
                    <p class="search-ai-note">目前命中的站內資料不足以給更完整的回答，建議換更具體的問法，或先看下方關鍵字結果。</p>
                ` : isReportMode ? `
                    <p class="search-ai-note">這份報告只根據目前站內命中的內容整理；跨卡片的統整結論會標示成綜合判斷，不會冒充成單一官方事實。</p>
                ` : state.confidence === 'low' ? `
                    <p class="search-ai-note">目前這段答案是根據少量站內片段整理，建議同時點開下方引用來源快速核對。</p>
                ` : `
                    <p class="search-ai-note">這段回答只根據目前站內命中的內容整理，沒有額外查外部資料。</p>
                `}
                ${state.followUpHint ? `<p class="search-ai-followup">${escapeHtml(state.followUpHint)}</p>` : ''}
                ${state.missingReason ? `<p class="search-ai-note">${escapeHtml(state.missingReason)}</p>` : ''}
                ${citations.length ? `
                    <div class="search-ai-citations">
                        ${citations.map(citation => `
                            <button type="button" class="search-ai-citation" data-ai-citation-id="${citation.id}">
                                <i class="fa-solid fa-link"></i>
                                <span>${escapeHtml(citation.title)}</span>
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        updateSearchWorkspaceLayout();
    }

    function getAiCacheKey(query, chunks, options = {}) {
        const analysisPlan = options.analysisPlan && typeof options.analysisPlan === 'object'
            ? options.analysisPlan
            : null;
        const analysisPlanSignature = analysisPlan
            ? simpleHash(JSON.stringify({
                responseMode: analysisPlan.responseMode,
                intentType: analysisPlan.intentType,
                activeFacetNames: analysisPlan.activeFacetNames || [],
                triggerReasons: analysisPlan.triggerReasons || [],
                evidenceBudget: analysisPlan.evidenceBudget,
                maxParentCards: analysisPlan.maxParentCards,
                evidenceSummary: analysisPlan.evidenceSummary || {},
                facetSummary: analysisPlan.facetSummary || {}
            }))
            : 'compact';
        const chunkSignature = chunks
            .map(chunk => `${chunk.id}:${simpleHash([
                chunk.parentId,
                chunk.title,
                chunk.locationLabel,
                chunk.sourceType,
                chunk.sourceDetailType,
                chunk.fieldType,
                chunk.evidenceRole,
                chunk.structuredText,
                chunk.text
            ].join('::'))}`)
            .join('|');

        return `cruise-ai-answer::${getAiContentVersion()}::${options.responseMode === 'report' ? 'report' : 'compact'}::${analysisPlanSignature}::${normalizeSearchText(query)}::${chunkSignature}`;
    }

    function buildAnswerContext(results, queryData, options = {}) {
        const responseMode = options.responseMode === 'report' ? 'report' : 'compact';
        return results.map(result => {
            const fieldType = result.fieldType || 'parent';
            const preferredExcerptLength = responseMode === 'report'
                ? (['action', 'caution', 'tripFit', 'summary', 'theme'].includes(fieldType) ? 900 : 700)
                : (['action', 'caution', 'tripFit', 'summary', 'theme'].includes(fieldType) ? 480 : 360);
            const excerptSource = {
                title: result.title,
                text: result.structuredText || result.text
            };

            return {
                id: result.id,
                parentId: result.parentId || result.id,
                title: result.title,
                locationLabel: result.locationLabel,
                sectionId: result.sectionId,
                sourceType: result.sourceType,
                sourceDetailType: result.sourceDetailType || 'general',
                fieldType: result.fieldType || 'parent',
                fieldLabel: result.fieldLabel || getAiFieldLabel(result.fieldType || 'parent'),
                evidenceRole: result.evidenceRole || '',
                timeHint: result.timeHint || '',
                bestTimeHint: result.bestTimeHint || '',
                navTarget: result.navTarget,
                structuredText: createPlainExcerpt(excerptSource, queryData, preferredExcerptLength),
                text: createPlainExcerpt(result, queryData, Math.max(320, preferredExcerptLength - 140))
            };
        });
    }

    function getAiContentVersion() {
        return `${SITE_SEARCH_SCHEMA_VERSION}-${searchState.documentVersion || 'base'}`;
    }

    function readAiCache(cacheKey) {
        try {
            const raw = sessionStorage.getItem(cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed?.savedAt || Date.now() - parsed.savedAt > AI_CACHE_TTL) {
                sessionStorage.removeItem(cacheKey);
                return null;
            }
            return parsed.payload || null;
        } catch {
            return null;
        }
    }

    function writeAiCache(cacheKey, payload) {
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
                savedAt: Date.now(),
                payload
            }));
        } catch {
            // ignore cache errors
        }
    }

    async function askAiAnswer(query, chunks, options = {}) {
        const response = await fetch(getAiAnswerEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                mode: 'grounded_qa_v1',
                contentVersion: getAiContentVersion(),
                responseMode: options.responseMode === 'report' ? 'report' : 'compact',
                analysisPlan: options.analysisPlan || null,
                chunks
            })
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
            throw new Error(payload?.error || 'AI 解答服務暫時無法使用。');
        }

        return payload;
    }

    async function askAiRewrite(query, chunks) {
        const response = await fetch(getAiAnswerEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                mode: 'query_rewrite_v1',
                contentVersion: getAiContentVersion(),
                chunks
            })
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
            throw new Error(payload?.error || 'AI 改寫服務暫時無法使用。');
        }

        return normalizeAiRewriteMeta(payload);
    }

    async function requestAiAnswer() {
        const input = document.getElementById('search-input');
        if (!input) return;
        if (searchState.aiPending) return;

        const rawQuery = input.value.trim();
        let rewriteMeta = null;
        let rewriteAttempts = 0;
        let aiSearchPayload = safeGetAiRankedSearchResults(rawQuery);

        if (!aiSearchPayload.ok) {
            renderAiAnswerState({
                type: 'error',
                message: 'AI 解答前置檢索發生錯誤，請重新整理後再試。',
                note: aiSearchPayload.error?.message || '本地召回流程沒有完成，所以這次沒有送出 AI 解答。'
            });
            renderSearchResultsError('AI 模式的本地召回暫時失敗，重新整理頁面後再試一次。');
            return;
        }

        let { queryData, results } = aiSearchPayload;
        let { selectedResults, reportPlan } = resolveAiEvidencePlan(results, queryData, {
            defaultResponseMode: AI_REPORT_DEFAULT_MODE
        });
        let retrievalStatus = getAiRetrievalStatus(queryData, results, selectedResults, reportPlan);
        let displayResults = collapseAiDisplayResults(results);

        searchState.lastQuery = queryData.normalizedQuery;
        searchState.lastQueryData = queryData;
        searchState.lastResults = displayResults;
        searchState.resultsById = new Map(displayResults.map(result => [result.id, result]));
        renderSearchResults(displayResults, queryData);

        if (!queryData.normalizedQuery) {
            renderAiAnswerState({
                type: 'info',
                message: '先輸入一個自然語言問題，例如「第一天提早登船後最值得先做什麼？」'
            });
            return;
        }

        if (queryData.signalLength < AI_SEARCH_MIN_LENGTH) {
            renderAiAnswerState({
                type: 'info',
                message: `AI 解答建議至少輸入 ${AI_SEARCH_MIN_LENGTH} 個字，問法越完整越容易整理出重點。`
            });
            return;
        }

        if (!navigator.onLine) {
            renderAiAnswerState({
                type: 'info',
                message: '目前沒有網路連線，本地搜尋仍可用，但 AI 解答需要連線。',
                note: '你可以先看下方關鍵字結果，恢復連線後再按一次 AI 解答。'
            });
            return;
        }

        if (retrievalStatus === 'rewrite' && rewriteAttempts < AI_REWRITE_MAX_ATTEMPTS) {
            const rewriteSeedResults = selectedResults.length
                ? selectedResults
                : results.slice(0, AI_REWRITE_MAX_RESULTS);
            const rewriteChunks = buildAnswerContext(rewriteSeedResults, queryData).slice(0, AI_REWRITE_MAX_RESULTS);

            if (rewriteChunks.length) {
                renderAiAnswerState({
                    type: 'loading',
                    message: '第一輪命中的線索還不夠集中，正在依站內常見詞換一種方式再找一次。',
                    note: '這一步只會做一次受控改寫，不會無限重試。'
                });

                try {
                    rewriteMeta = await askAiRewrite(rawQuery, rewriteChunks);
                    rewriteAttempts += 1;

                    const secondPass = safeGetAiRankedSearchResults(rawQuery, rewriteMeta);
                    if (!secondPass.ok) {
                        throw secondPass.error || new Error('AI rewrite retrieval failed');
                    }

                    results = mergeAiRankedResults(results, secondPass.results);
                    queryData = secondPass.queryData;
                    ({ selectedResults, reportPlan } = resolveAiEvidencePlan(results, queryData, {
                        defaultResponseMode: AI_REPORT_DEFAULT_MODE,
                        rewriteTriggered: true
                    }));
                    retrievalStatus = getAiRetrievalStatus(queryData, results, selectedResults, reportPlan);
                    displayResults = collapseAiDisplayResults(results);

                    searchState.lastQuery = queryData.normalizedQuery;
                    searchState.lastQueryData = queryData;
                    searchState.lastResults = displayResults;
                    searchState.resultsById = new Map(displayResults.map(result => [result.id, result]));
                    renderSearchResults(displayResults, queryData);
                } catch (error) {
                    rewriteMeta = null;
                    renderAiAnswerState({
                        type: 'info',
                        message: 'AI 改寫這次沒有成功，但我仍保留第一輪命中的站內片段供你快速查看。',
                        note: error.message || '你可以把問法再具體一點，或直接點下方搜尋結果。'
                    });
                }
            }
        }

        if (retrievalStatus === 'insufficient' || selectedResults.length < 2) {
            renderAiAnswerState({
                type: 'info',
                message: '目前站內資料還抓不到足夠證據來整理答案，先看下方搜尋結果或把問題問得更具體一點。',
                note: rewriteMeta?.hintTerms?.length
                    ? `這次已試過相近詞：${rewriteMeta.hintTerms.join('、')}，若還不夠，建議直接問設施、時段或步驟。`
                    : '例如把「第一天先做什麼」改成「第一天提早登船後先去 Lounge 還是 Open House？」會更容易整理出答案。'
            });
            return;
        }

        const analysisPlan = buildAiAnalysisPlanPayload(reportPlan);
        const chunks = buildAnswerContext(selectedResults, queryData, {
            responseMode: reportPlan.responseMode,
            reportPlan
        });
        const cacheKey = getAiCacheKey(rawQuery, chunks, {
            responseMode: reportPlan.responseMode,
            analysisPlan
        });
        const cachedAnswer = readAiCache(cacheKey);
        if (cachedAnswer) {
            if (rewriteMeta && !cachedAnswer.rewriteInfo) {
                cachedAnswer.rewriteInfo = rewriteMeta;
            }
            renderAiAnswerState(cachedAnswer);
            return;
        }

        renderAiAnswerState({
            type: 'loading',
            message: reportPlan.responseMode === 'report'
                ? '正在把多張卡片與不同來源的線索整理成一頁式深層報告，這一步只會讀你網站裡的資料。'
                : '正在根據目前站內命中的內容整理答案，這一步只會讀你網站裡的資料。',
            rewriteInfo: rewriteMeta
        });
        searchState.aiPending = true;

        try {
            const payload = await askAiAnswer(rawQuery, chunks, {
                responseMode: reportPlan.responseMode,
                analysisPlan
            });
            if (!payload.primarySourceType) {
                payload.primarySourceType = selectedResults[0]?.sourceType || '';
            }
            if (rewriteMeta) {
                payload.rewriteInfo = rewriteMeta;
            }
            payload.responseMode = reportPlan.responseMode;
            renderAiAnswerState(payload);
            writeAiCache(cacheKey, payload);
        } catch (error) {
            renderAiAnswerState({
                type: 'error',
                message: 'AI 解答目前沒有成功回應，但原本的關鍵字搜尋結果仍可用。',
                note: error.message || '請稍後再試，或先確認 Worker 與 GEMINI_API_KEY 是否已部署。'
            });
        } finally {
            searchState.aiPending = false;
        }
    }

    function setSearchMode(mode) {
        searchState.activeMode = mode;
        searchState.pendingSubmit = false;
        const modeButtons = document.querySelectorAll('.search-mode-btn');
        const submitBtn = document.getElementById('search-ai-submit');
        const input = document.getElementById('search-input');

        modeButtons.forEach(button => {
            const isActive = button.dataset.searchMode === mode;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (submitBtn) {
            submitBtn.hidden = mode !== 'ai';
        }

        if (input) {
            input.placeholder = mode === 'ai'
                ? '用自然語言提問，例如：第一天提早登船後最值得先做什麼？'
                : '輸入關鍵字，例如：禮賓、Baymax、Room Service';
        }

        renderAiAnswerState(null);
        renderSearchResults(searchState.lastResults, searchState.lastQueryData || searchState.lastQuery);
        updateSearchWorkspaceLayout();
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
                    <p><strong>${searchState.activeMode === 'ai' ? '先用自然語言提問' : '開始搜尋郵輪重點'}</strong></p>
                    <p>${searchState.activeMode === 'ai'
                        ? '例如：第一天提早登船後最值得先做什麼？、禮賓怎麼提早進劇院？'
                        : '可以試試看：禮賓、Baymax、Room Service、Deck 17、爆米花、SGAC。'}</p>
                </div>
            `;
            return;
        }

        if (currentQuery.length < SEARCH_MIN_LENGTH) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>${searchState.activeMode === 'ai' ? '先讓本地搜尋抓到足夠線索' : '再多輸入一點點'}</strong></p>
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
                        const resultHighlights = buildSearchResultHighlights(result, resolvedQueryData);
                        const snippet = createExcerpt(result, resolvedQueryData);

                        return `
                            <button type="button" class="search-result-card" data-result-id="${result.id}">
                                <div class="search-result-meta">
                                    <span>${getSourceLabel(result.sourceType)}</span>
                                    <span>•</span>
                                    <span>${escapeHtml(result.locationLabel)}</span>
                                </div>
                                <h3 class="search-result-title">${escapeHtml(result.title)}</h3>
                                <div class="search-result-location">${escapeHtml(result.locationLabel)}</div>
                                ${metaChips.length ? `
                                    <div class="search-result-chip-row">
                                        ${metaChips.map(chip => `<span class="search-result-chip">${escapeHtml(chip)}</span>`).join('')}
                                    </div>
                                ` : ''}
                                ${resultHighlights.length ? `
                                    <ul class="search-result-highlights">
                                        ${resultHighlights.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                    </ul>
                                ` : ''}
                                ${snippet ? `<div class="search-result-snippet">${snippet}</div>` : ''}
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
        setSearchMode('keyword');
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
        searchState.aiCitationsById = new Map();
        searchState.lastQuery = '';
        searchState.lastResults = [];
        searchState.lastQueryData = null;
        setSearchMode('keyword');
        renderAiAnswerState(null);
    }

    function initializeSearch() {
        const overlay = document.getElementById('search-overlay');
        const trigger = document.getElementById('nav-search-trigger');
        const closeBtn = document.getElementById('search-close-btn');
        const form = document.getElementById('search-form');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        const modeButtons = document.querySelectorAll('.search-mode-btn');
        const aiSubmit = document.getElementById('search-ai-submit');
        const aiAnswer = document.getElementById('search-ai-answer');
        const backdrop = overlay?.querySelector('[data-search-close]');

        if (!overlay || !trigger || !closeBtn || !form || !input || !results || !aiSubmit || !aiAnswer) return;

        prepareSearchDocuments();

        function runSearchPreview(rawValue) {
            if (searchState.activeMode === 'ai') {
                const aiSearchPayload = safeGetAiRankedSearchResults(rawValue);
                if (!aiSearchPayload.ok) {
                    renderAiAnswerState({
                        type: 'error',
                        message: 'AI 模式的前置搜尋暫時發生錯誤，請重新整理後再試。',
                        note: aiSearchPayload.error?.message || '本地召回沒有完成，因此這次先不送出 AI 解答。'
                    });
                    renderSearchResultsError('AI 模式的本地召回暫時失敗。');
                    return;
                }
                const { queryData, results } = aiSearchPayload;
                const displayResults = collapseAiDisplayResults(results);
                searchState.lastQuery = queryData.normalizedQuery;
                searchState.lastQueryData = queryData;
                searchState.lastResults = displayResults;
                searchState.resultsById = new Map(displayResults.map(result => [result.id, result]));
                renderSearchResults(displayResults, queryData);
                return;
            }

            performSearch(rawValue);
        }

        function submitCurrentSearch() {
            searchState.pendingSubmit = false;

            if (searchState.activeMode === 'ai') {
                requestAiAnswer();
                return;
            }

            performSearch(input.value);
        }

        trigger.addEventListener('click', openSearchOverlay);
        closeBtn.addEventListener('click', closeSearchOverlay);
        backdrop?.addEventListener('click', closeSearchOverlay);

        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                setSearchMode(button.dataset.searchMode);
                runSearchPreview(input.value);
            });
        });

        input.addEventListener('input', () => {
            window.clearTimeout(searchState.debounceTimer);
            if (searchState.activeMode === 'ai') {
                renderAiAnswerState(null);
            }

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

        aiAnswer.addEventListener('click', event => {
            const button = event.target.closest('.search-ai-citation');
            if (button) {
                const citation = searchState.aiCitationsById.get(button.dataset.aiCitationId);
                navigateToSearchResult(citation);
                return;
            }

            const anchor = event.target.closest('.search-ai-report-anchor');
            if (!anchor) return;

            const sectionKey = anchor.dataset.aiReportAnchor;
            const target = aiAnswer.querySelector(`[data-ai-report-section="${sectionKey}"]`);
            if (!target) return;

            target.scrollIntoView({
                behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
                block: 'start'
            });
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

        setSearchMode('keyword');
        renderSearchResults([], '');
    }

    initializeSearch();

});
