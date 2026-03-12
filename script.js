document.addEventListener('DOMContentLoaded', function () {

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

        cruiseSchedule.forEach((dayData, index) => {
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
            dayData.periods.forEach(period => {
                html += `
                    <div class="period-header">
                        <h4>${period.name}</h4>
                    </div>
                `;

                // 3. 生成時段內的事件 (Events)
                period.events.forEach(event => {
                    html += `
                        <div class="schedule-item">
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
                    ${deck.facilities.map(facility => `
                        <article class="facility-card ${facility.highlight ? 'highlight' : ''}">
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
                    `).join('')}
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
                            ${category.shows.map(show => `
                                <article class="show-item">
                                    <span class="show-title">${show.name}</span>
                                    <p class="show-desc">${show.theme}</p>
                                    <div class="show-meta">
                                        <span><i class="fa-solid fa-location-dot"></i> ${show.location}</span>
                                        <span><i class="fa-regular fa-clock"></i> ${show.timingTip}</span>
                                        <span><i class="fa-solid fa-calendar-check"></i> ${show.tripLink}</span>
                                    </div>
                                </article>
                            `).join('')}
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

        updateDeckGuide(activeTab);
    }

    renderDeckGuide();

    // 12. 行程表頁籤切換
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有 active 狀態
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 加上當前的 active
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 13. 導覽列與漢堡選單
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

});
