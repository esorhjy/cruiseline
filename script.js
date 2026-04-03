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
    const searchSynonymMap = buildSynonymMap(SEARCH_SYNONYM_GROUPS);
    const searchDisplayMap = buildDisplayMap(SEARCH_SYNONYM_GROUPS);
    const searchState = {
        documents: [],
        resultsById: new Map(),
        debounceTimer: null
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

    // 1. 滾動進度條
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        });
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

    // 3. 回到頂端按鈕
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
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

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            if (countdownContainer) countdownContainer.innerHTML = "<div class='countdown-item' style='width:auto; padding: 10px 30px;'><span class='cd-num' style='font-size: 1.8rem;'>✨ 魔法已啟航！ ✨</span></div>";
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
    setInterval(updateCountdown, 1000);
    updateCountdown();

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
        createConfetti();
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
    document.addEventListener('mousemove', (e) => {
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

    // 8. 漂浮泡泡
    function createMickeyBubble() {
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
    setInterval(createMickeyBubble, 6000);

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

    function buildScheduleSearchDocuments() {
        return cruiseSchedule.flatMap(dayData =>
            dayData.periods.flatMap((period, periodIndex) =>
                period.events.map((event, eventIndex) => ({
                    id: getScheduleEventId(dayData.id, periodIndex, eventIndex),
                    sourceType: 'schedule',
                    sectionId: 'schedule',
                    groupLabel: '行程',
                    title: event.title,
                    text: [event.tag, period.name, ...event.desc.map(stripHtmlTags)].join(' '),
                    keywords: [dayData.tabTitle, dayData.dateTitle, period.name, event.tag, event.title],
                    locationLabel: `${dayData.tabTitle} · ${period.name}`,
                    navTarget: {
                        type: 'schedule',
                        dayId: dayData.id,
                        itemId: getScheduleEventId(dayData.id, periodIndex, eventIndex)
                    }
                }))
            )
        );
    }

    function buildDeckSearchDocuments() {
        return deckGuideData.flatMap(deck =>
            deck.facilities.map((facility, facilityIndex) => ({
                id: getDeckFacilityId(deck.id, facilityIndex),
                sourceType: 'deck',
                sectionId: 'deck-guide',
                groupLabel: '甲板與表演',
                title: facility.name,
                text: [facility.summary, facility.bestTime, facility.tripUse].join(' '),
                keywords: [deck.label, deck.title, deck.theme, deck.tripFocus, ...deck.badges],
                locationLabel: `${deck.label} · ${deck.title}`,
                navTarget: {
                    type: 'deck',
                    tabId: deck.id,
                    itemId: getDeckFacilityId(deck.id, facilityIndex)
                }
            }))
        );
    }

    function buildShowSearchDocuments() {
        return showGuideData.flatMap(category =>
            category.shows.map((show, showIndex) => ({
                id: getShowItemId(category.id, showIndex),
                sourceType: 'show',
                sectionId: 'deck-guide',
                groupLabel: '甲板與表演',
                title: show.name,
                text: [show.theme, show.location, show.timingTip, show.tripLink, category.intro].join(' '),
                keywords: [category.title, category.intro, show.location, show.tripLink],
                locationLabel: `表演精華 · ${category.title}`,
                navTarget: {
                    type: 'show',
                    tabId: 'shows',
                    itemId: getShowItemId(category.id, showIndex)
                }
            }))
        );
    }

    function buildPlaybookSearchDocuments() {
        return playbookGuideData.flatMap(mission =>
            mission.items.map((item, itemIndex) => ({
                id: getPlaybookItemId(mission.id, itemIndex),
                sourceType: 'playbook',
                sectionId: 'playbook',
                groupLabel: '攻略本',
                title: item.title,
                text: [item.whenToUse, item.action, item.tripFit, item.caution].join(' '),
                keywords: [mission.label, mission.intro, item.sourceType],
                locationLabel: `攻略本 · ${mission.label}`,
                navTarget: {
                    type: 'playbook',
                    missionId: mission.id,
                    itemId: getPlaybookItemId(mission.id, itemIndex)
                }
            }))
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
                    sourceType: 'static',
                    sectionId: config.sectionId,
                    groupLabel: '其他資訊',
                    title,
                    text,
                    keywords: [sectionLabel, title],
                    locationLabel: sectionLabel,
                    navTarget: {
                        type: 'static',
                        itemId: card.id
                    }
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
            const normalizedKeywords = normalizeSearchText(doc.keywords.join(' '));
            return {
                ...doc,
                normalizedTitle,
                normalizedText,
                normalizedKeywords,
                normalizedCombined: uniqueItems([normalizedTitle, normalizedKeywords, normalizedText].filter(Boolean)).join(' ')
            };
        });
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

    function createExcerpt(doc, queryData) {
        const rawSource = [doc.title, doc.text].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
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

        const start = matchIndex === -1 ? 0 : Math.max(matchIndex - 28, 0);
        const end = Math.min(start + 120, rawSource.length);
        const snippet = `${start > 0 ? '…' : ''}${rawSource.slice(start, end).trim()}${end < rawSource.length ? '…' : ''}`;
        return highlightSnippet(snippet, searchTerms);
    }

    function renderSearchResults(results, query) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (!query) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <p><strong>開始搜尋郵輪重點</strong></p>
                    <p>可以試試看：禮賓、Baymax、Room Service、Deck 17、爆米花、SGAC。</p>
                </div>
            `;
            return;
        }

        if (query.length < SEARCH_MIN_LENGTH) {
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
            .map(groupLabel => `
                <section class="search-group">
                    <div class="search-group-title">
                        <i class="${SEARCH_GROUP_ICONS[groupLabel] || 'fa-solid fa-magnifying-glass'}"></i>
                        <span>${groupLabel}</span>
                    </div>
                    <div class="search-group-list">
                        ${groupedResults.get(groupLabel).map(result => `
                            <button type="button" class="search-result-card" data-result-id="${result.id}">
                                <div class="search-result-meta">
                                    <span>${getSourceLabel(result.sourceType)}</span>
                                    <span>•</span>
                                    <span>${result.locationLabel}</span>
                                </div>
                                <h3 class="search-result-title">${escapeHtml(result.title)}</h3>
                                <div class="search-result-location">${escapeHtml(result.locationLabel)}</div>
                                <div class="search-result-snippet">${createExcerpt(result, getSearchUnits(query))}</div>
                            </button>
                        `).join('')}
                    </div>
                </section>
            `).join('');
    }

    function performSearch(query) {
        const queryData = getSearchUnits(query);
        if (!queryData.normalizedQuery || queryData.normalizedQuery.length < SEARCH_MIN_LENGTH) {
            searchState.resultsById = new Map();
            renderSearchResults([], queryData.normalizedQuery);
            return;
        }

        const results = searchState.documents
            .map(doc => ({ ...doc, score: scoreDocument(doc, queryData) }))
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 16);

        searchState.resultsById = new Map(results.map(result => [result.id, result]));
        renderSearchResults(results, queryData.normalizedQuery);
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
        if (!overlay || !input) return;

        overlay.hidden = false;
        document.body.classList.add('search-open');
        renderSearchResults([], '');
        window.setTimeout(() => input.focus(), 40);
    }

    function closeSearchOverlay() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        if (!overlay || overlay.hidden) return;

        overlay.hidden = true;
        document.body.classList.remove('search-open');
        if (input) input.value = '';
        searchState.resultsById = new Map();
    }

    function initializeSearch() {
        const overlay = document.getElementById('search-overlay');
        const trigger = document.getElementById('nav-search-trigger');
        const closeBtn = document.getElementById('search-close-btn');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        const backdrop = overlay?.querySelector('[data-search-close]');

        if (!overlay || !trigger || !closeBtn || !input || !results) return;

        prepareSearchDocuments();

        trigger.addEventListener('click', openSearchOverlay);
        closeBtn.addEventListener('click', closeSearchOverlay);
        backdrop?.addEventListener('click', closeSearchOverlay);

        input.addEventListener('input', () => {
            window.clearTimeout(searchState.debounceTimer);
            searchState.debounceTimer = window.setTimeout(() => {
                performSearch(input.value);
            }, 110);
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

    initializeSearch();

});
