const cruiseSchedule = [
    {
        id: "day1",
        tabTitle: "Day 1 登船",
        dateTitle: "🌟 Day 1｜登船日（更早登船＋全家一起熟悉郵輪＋Open House）",
        goals: [
            "越早登船越好，把登船日做成「熟悉郵輪＋定錨活動」的一天",
            "優先完成：Open House → 動線熟悉 → 玩水暖身 → 晚餐與首秀節奏"
        ],
        periods: [
            {
                name: "早／中午｜提早登船＋主餐廳午餐＋禮賓報到",
                events: [
                    {
                        time: "10:30–11:30",
                        title: "抵達碼頭、完成報到",
                        tag: "登船流程",
                        tagClass: "tag-boarding",
                        desc: [
                            "<strong>目的：</strong>用禮賓優先登船避開人潮、保留下午完整活動時間",
                            "<strong>提醒：</strong>留意禮賓迎賓小禮與優先動線"
                        ]
                    },
                    {
                        time: "11:45–12:30",
                        title: "坐下式午餐（主餐廳）",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "<strong>建議：</strong>直接前往 Pixar Market 或 Enchanted Summer",
                            "<strong>用餐必確認：</strong> 晚餐第一時段（First Seating）、輪替餐廳順序"
                        ]
                    },
                    {
                        time: "12:30–13:00",
                        title: "禮賓酒廊報到：Concierge Lounge (Deck 17)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>請管家協助確認：</strong>",
                            "出發前 130 天代訂的 Royal Meet & Greet（免費皇家見面會）時段",
                            "當晚 Walt Disney Theatre 主秀「免排隊提前入座」安排"
                        ]
                    }
                ]
            },
            {
                name: "下午｜Open House 放最前＋全家熟悉核心動線＋登船日玩水",
                events: [
                    {
                        time: "13:00–14:00",
                        title: "Disney Oceaneer Club Open House (Deck 8)",
                        tag: "孩子專屬",
                        tagClass: "tag-kids",
                        desc: [
                            "全家一起參加：澤澤、彤妹先熟悉四大沉浸區域",
                            "<strong>必做設定：</strong>取孩密語"
                        ]
                    },
                    {
                        time: "14:00–15:00",
                        title: "全家熟悉郵輪核心動線 (Deck 8 → 7 → 10/11 → 17)",
                        tag: "熟悉郵輪",
                        tagClass: "tag-explore",
                        desc: [
                            "<strong>Deck 7：</strong>帶小寶看 Edge 隱藏入口、了解 大英雄天團電玩樂場",
                            "<strong>Deck 10/11：</strong>確認 Imagination Garden 位置，到花園舞台看表演"
                        ]
                    },
                    {
                        time: "15:00–16:00",
                        title: "Toy Story Pool／Splash Pad (Deck 17)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "<strong>目的：</strong>登船日通常人少，適合暖身玩水",
                            "<strong>點心補給：</strong>披薩星球、吱吱冰飲",
                            "<strong>Woody’s Wide Slide（胡迪與翠絲的瘋狂滑水道入口）（Deck 17/19）</strong>"
                        ]
                    },
                    {
                        time: "16:00–16:30",
                        title: "Mandatory Guest Assembly Drill (安全演練)",
                        tag: "安全演練",
                        tagClass: "tag-safety",
                        desc: [
                            "也就是強制旅客集合演練",
                            "時間是 4:00 PM–4:30 PM"
                        ]
                    }
                ]
            },
            {
                name: "晚間｜第一輪晚餐＋首日晚秀＋宵夜收尾",
                events: [
                    {
                        time: "17:15–19:00",
                        title: "第一時段晚餐：Animator’s Palate（餐廳）",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "經典「黑白變彩色」動畫互動用餐體驗",
                            "若輪到 Animator's Palate：準備互動驚喜（手繪草圖變動畫）",
                            "<strong>提醒：</strong>專屬服務員開始跟隨你們",
                            "<strong>建議：</strong>這晚拍全家正式照片"
                        ]
                    },
                    {
                        time: "19:30–21:00",
                        title: "Walt Disney Theatre 首日晚間大秀 (Deck 5–7)",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "音樂劇《Remember》",
                            "晚間秀建議提早 30 分鐘入場；選中間區域視野最佳。"
                        ]
                    },
                    {
                        time: "21:05–21:40",
                        title: "Concierge Lounge (Deck 17) 宵夜收尾",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "結束完美的第一天"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "day2",
        tabTitle: "Day 2 海上",
        dateTitle: "🦸 Day 2｜海上日（Marvel 主題＋滑水道＋舊京山街區）",
        goals: [
            "上午衝刺激、下午放鬆與合體、晚上看秀"
        ],
        periods: [
            {
                name: "早上｜海景樣台房早餐",
                events: [
                    {
                        time: "07:00–09:00",
                        title: "早餐時間",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "先在海景陽台房享受簡單 room service",
                            "再到正式早餐餐廳吃主食"
                        ]
                    }
                ]
            },
            {
                name: "上午｜同樓層連打（動線最順）",
                events: [
                    {
                        time: "09:00–09:30",
                        title: "Marvel Landing (Deck 18/19)",
                        tag: "刺激設施",
                        tagClass: "tag-thrill",
                        desc: [
                            "<strong>主攻：Ironcycle Test Run（鋼鐵人測試車）</strong>",
                            "接著：皮姆量子賽車、格魯特星系旋轉"
                        ]
                    },
                    {
                        time: "09:30–10:30",
                        title: "Infinity Pool & Bar (Deck 18)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "戶外無邊際泳池與吧台 (Jetfinity Bar)"
                        ]
                    },
                    {
                        time: "10:30–11:00",
                        title: "Wayfinder Bay (Deck 10 船尾)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "海洋奇緣主題露天泳池＋海景",
                            "可順逛：Discovery Reef（買烏蘇拉珍珠奶茶）"
                        ]
                    }
                ]
            },
            {
                name: "中午",
                events: [
                    {
                        time: "11:00–12:00",
                        title: "午餐：Enchanted Summer Restaurant (Deck 6)",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "花園／仲夏意象沉浸式佈景。"
                        ]
                    }
                ]
            },
            {
                name: "下午｜街區電玩＋電影／購物＋下午茶整理狀態",
                events: [
                    {
                        time: "12:00–14:00",
                        title: "舊京山街道 (Deck 7)",
                        tag: "漫步探索",
                        tagClass: "tag-explore",
                        desc: [
                            "全家：刷房卡免費玩 大英雄天團電玩樂場（四款專屬雙人體感遊戲）",
                            "或商店區集中採買 (Deck 6/7)"
                        ]
                    },
                    {
                        time: "14:00–15:00",
                        title: "澤澤、小寶：Deck 7 Edge",
                        tag: "孩子專屬",
                        tagClass: "tag-kids",
                        desc: [
                            "少年會所 (11–14 歲)；其他人逛街"
                        ]
                    },
                    {
                        time: "15:00–15:30",
                        title: "Concierge Lounge 下午茶補給",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>下午茶補給：</strong>三明治、司康",
                            "<strong>目的：</strong>收整晚餐前狀態"
                        ]
                    },
                    {
                        time: "15:30–17:10",
                        title: "Disney Imagination Garden (Deck 10/11)",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "<strong>觀賞：</strong>Avengers Assemble! 特技秀／或 Duffy 大型派對"
                        ]
                    }
                ]
            },
            {
                name: "晚間",
                events: [
                    {
                        time: "17:15–19:00",
                        title: "晚餐：Navigator’s Club (航海家俱樂部)",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "有米奇米妮的船長晚餐。"
                        ]
                    },
                    {
                        time: "19:30–21:15",
                        title: "劇院主秀《Disney Seas the Adventure》",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "百老匯等級主題秀"
                        ]
                    },
                    {
                        time: "21:20–21:50",
                        title: "Concierge Lounge 收尾",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "結束充實的第二天"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "day3",
        tabTitle: "Day 3 海上",
        dateTitle: "💦 Day 3｜海上日（水域大日＋Oceaneer＋皇家見面會＋海上煙火）",
        goals: [
            "水域玩足＋完成公主見面會＋大人禮賓放鬆時間要確保到"
        ],
        periods: [
            {
                name: "早上｜早餐",
                events: [
                    {
                        time: "07:00–08:00",
                        title: "早餐時間",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "到正式早餐餐廳吃主食"
                        ]
                    }
                ]
            },
            {
                name: "上午｜水域集中",
                events: [
                    {
                        time: "08:00–10:00",
                        title: "Toy Story Pool / Splash Pad (Deck 17)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "<strong>Woody’s Wide Slide（滑水道入口在 Deck 19）</strong>",
                            "<strong>目的：</strong>趁早排隊、避免後段失控"
                        ]
                    },
                    {
                        time: "10:00–11:00",
                        title: "Opulence Spa & Fitness Center (Deck 18)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>Spa 水療中心：</strong>禮賓專屬門區＋進階療程 (請禮賓代訂)",
                            "<strong>Fitness Center：</strong>禮賓專用健身空間"
                        ]
                    }
                ]
            },
            {
                name: "中午",
                events: [
                    {
                        time: "11:00–12:00",
                        title: "午餐：Pixar Market (Deck 17)",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "披薩、漢堡快餐"
                        ]
                    }
                ]
            },
            {
                name: "下午｜唯一一次 Oceaneer 完整入場＋大人放鬆窗口",
                events: [
                    {
                        time: "12:30–13:30",
                        title: "Disney Oceaneer Club & Royal Meet & Greet",
                        tag: "亮點活動",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>澤澤、彤妹：</strong>完整參與活動",
                            "<strong>大人帶小寶：</strong>Royal Meet & Greet（免費皇家見面會）"
                        ]
                    },
                    {
                        time: "13:30–15:30",
                        title: "Baymax Cinemas 看電影 (Deck 7)",
                        tag: "休閒時光",
                        tagClass: "tag-highlight",
                        desc: [
                            "在大英雄天團主題劇院看熱門電影"
                        ]
                    },
                    {
                        time: "15:30–16:30",
                        title: "Concierge Sundeck & Pool (Deck 19)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>目的：</strong>最後一次長時段放鬆",
                            "<strong>提醒：</strong>傍晚開始供應啤酒、葡萄酒、香檳暢飲！"
                        ]
                    },
                    {
                        time: "16:30–17:00",
                        title: "回房間收拾行李",
                        tag: "準備返家",
                        tagClass: "tag-prepare",
                        desc: [
                            "整理大型行李放在房門外"
                        ]
                    }
                ]
            },
            {
                name: "晚間｜晚餐＋海上派對煙火＋最後宵夜",
                events: [
                    {
                        time: "17:15–19:00",
                        title: "第一時段晚餐：Hollywood Spotlight Club",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "最後一晚的輪替餐廳美食"
                        ]
                    },
                    {
                        time: "19:00–21:00",
                        title: "Disney Imagination Garden 表演 (Deck 10/11)",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "觀賞：Avengers Assemble! 特技秀／或 Duffy 大型派對"
                        ]
                    },
                    {
                        time: "22:00–23:00",
                        title: "甲板煙火派對：The Lion King (全球獨家)",
                        tag: "絕美煙火",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>獅子王主題海上煙火：Celebration in the Sky</strong>"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "day4",
        tabTitle: "Day 4 下船",
        dateTitle: "🧳 Day 4｜下船日（禮賓節奏）",
        goals: [
            "優雅吃完早餐，憑禮賓通道安靜下船，前往樟宜機場。"
        ],
        periods: [
            {
                name: "下船日｜禮賓優勢",
                events: [
                    {
                        time: "07:00–08:00",
                        title: "Concierge Lounge 早餐 (Deck 17)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "最後一次享受安靜從容的服務"
                        ]
                    },
                    {
                        time: "08:00–09:00",
                        title: "禮賓優先下船通道",
                        tag: "極速通關",
                        tagClass: "tag-boarding",
                        desc: [
                            "避開人潮，順暢撤離並前往機場"
                        ]
                    }
                ]
            }
        ]
    }
];

// --- 行前準備清單資料 (Phase 4: Interactive Checklist) ---
const checklistData = [
    {
        category: "登船重要手續",
        items: [
            { id: "pay-full", text: "完成全額支付，支付線上小費" },
            { id: "online-checkin", text: "出發前 40 天完成線上辦理登船手續" },
            { id: "concierge-10am", text: "禮賓艙房 10:00 即可抵達碼頭報到" },
            { id: "health-form", text: "登船前完成線上健康問卷填寫" },
            { id: "sgac-twice", text: "新加坡入境卡 (SGAC) 需填寫兩次 (入境+回船)" }
        ]
    },
    {
        category: "預約與購買",
        items: [
            { id: "royal-meet-130d", text: "130 天前禮賓預約：皇家公主見面會" },
            { id: "dinner-table", text: "聯絡管家確認用餐需求 (如併桌安排)" },
            { id: "photo-package", text: "考慮是否預購郵輪拍照套裝 (比較划算)" },
            { id: "wifi-buy", text: "考慮是否預購郵輪 Wi-Fi 上網方案" },
            { id: "kids-club-booking", text: "預定 Oceaneer Club 兒童俱樂部時段" }
        ]
    },
    {
        category: "事先準備",
        items: [
            { id: "passport-expiry", text: "確認護照效期 (6 個月以上) 與旅遊保險" },
            { id: "personal-essentials", text: "攜帶個人備品 (牙刷、拖鞋、常備藥)" },
            { id: "door-decor", text: "準備房門布置磁鐵或給家人的驚喜小禮" },
            { id: "swimsuit-bag", text: "先玩滑道：登船日將泳裝放於隨身包" },
            { id: "last-night-luggage", text: "下船前一晚 10:00 前將大型行李放於門口" }
        ]
    }
];

// --- 甲板與表演設施資料 (Phase 5: Deck Guide) ---
const deckGuideData = [
    {
        id: "deck5",
        label: "Deck 5",
        title: "Deck 5｜首日晚秀與動畫晚餐節奏",
        theme: "劇院主秀、Animator’s Palate、散場後補逛周邊",
        tripFocus: "Day 1 晚餐加上《Remember》最容易把整個晚間都待在這一帶。",
        badges: ["Day 1 首日晚秀", "晚餐前先卡位", "散場後人潮最明顯"],
        facilities: [
            {
                icon: "fa-solid fa-masks-theater",
                name: "Walt Disney Theatre",
                summary: "百老匯等級大劇場，首日晚間秀《Remember》就是這趟最有儀式感的開場。",
                bestTime: "開演前 20–30 分鐘進場，優先找中間區。",
                tripUse: "Day 1 晚餐後直接來這裡，節奏最順。",
                highlight: true
            },
            {
                icon: "fa-solid fa-palette",
                name: "Animator’s Palate",
                summary: "經典黑白變彩色互動餐廳，晚餐過程本身就是一場秀。",
                bestTime: "第一輪晚餐前 5–10 分鐘先就位拍環境。",
                tripUse: "若輪到這間，適合安排全家正式照與孩子互動畫面。",
                highlight: true
            },
            {
                icon: "fa-solid fa-music",
                name: "Tiana’s Bayou Lounge",
                summary: "紐奧良爵士氛圍很濃，像是秀前後可以換口味的輕鬆轉場區。",
                bestTime: "晚餐後、看秀前的短空檔最有味道。",
                tripUse: "大人想暫時放鬆時可列入備選，不必當成主線行程。",
                highlight: false
            },
            {
                icon: "fa-solid fa-bag-shopping",
                name: "World of Disney / World of Disney Too",
                summary: "探險號限定與迪士尼皮克斯周邊最集中的一層。",
                bestTime: "開航日下午比演後散場好逛得多。",
                tripUse: "可和 Deck 7 商店街一起安排，但不建議秀後硬擠。",
                highlight: false
            }
        ]
    },
    {
        id: "deck6",
        label: "Deck 6",
        title: "Deck 6｜餐廳補位與客務支援層",
        theme: "Enchanted Summer、客務中心、酒吧與秀前補給",
        tripFocus: "這層更像機動支援層，午餐、需求處理、臨時補給都很實用。",
        badges: ["Day 2 午餐點", "客務中心備援", "秀前爆米花補給"],
        facilities: [
            {
                icon: "fa-solid fa-utensils",
                name: "Enchanted Summer / Enchanted Restaurant",
                summary: "花園與仲夏氛圍很適合慢慢吃，白天與晚間都各有表情。",
                bestTime: "入座前 5–10 分鐘先到，拍環境最輕鬆。",
                tripUse: "Day 2 午餐如果想從容一點，這層最適合當節奏緩衝。",
                highlight: true
            },
            {
                icon: "fa-solid fa-headset",
                name: "Guest Services 客務中心",
                summary: "帳單、網路、遺失物、需求協助都在這裡處理。",
                bestTime: "避開開船日下午與最後一晚尖峰。",
                tripUse: "若房卡、Wi-Fi 或帳單有狀況，先記得回這裡補位。",
                highlight: true
            },
            {
                icon: "fa-solid fa-candy-cane",
                name: "Premier Sips & Snacks",
                summary: "劇院入口旁的付費小食站，爆米花與紀念杯很容易讓孩子分心。",
                bestTime: "劇院進場前先買，不要壓最後一刻排隊。",
                tripUse: "看秀前想補個飲料或爆米花時很方便。",
                highlight: false
            },
            {
                icon: "fa-solid fa-wand-magic-sparkles",
                name: "Spellbound / Royal Court Lounge / Buccaneer Bar",
                summary: "這層的大人系空間很多，適合把它視為備用夜生活清單。",
                bestTime: "熱門晚場要早到，無酒精版本可現場詢問。",
                tripUse: "不排主線，但若長輩或大人想單飛半小時，這層最容易安排。",
                highlight: false
            }
        ]
    },
    {
        id: "deck7",
        label: "Deck 7",
        title: "Deck 7｜舊京山街道與電玩電影分流",
        theme: "San Fransokyo Street、Edge、Big Hero 6 Arcade、雙影廳",
        tripFocus: "Day 1 熟悉動線、Day 2 下午電玩分流、Day 3 看電影都離不開這層。",
        badges: ["Day 1 探索", "Day 2 電玩分流", "看秀後短休"],
        facilities: [
            {
                icon: "fa-solid fa-user-secret",
                name: "Edge 隱藏入口 / Vibe 青年會所",
                summary: "入口偽裝在街區立面裡，本身就像一個孩子會記住的彩蛋。",
                bestTime: "首日先帶孩子走一次，順便確認活動表。",
                tripUse: "Day 1 熟悉位置後，後續孩子比較敢自己回來找活動。",
                highlight: true
            },
            {
                icon: "fa-solid fa-gamepad",
                name: "Big Hero 6 Arcade",
                summary: "房卡就能啟動的大英雄天團體感電玩，是下午最好的放電分流點。",
                bestTime: "避開晚間尖峰，下午更能玩到完整體感機。",
                tripUse: "Day 2 下午很適合全家刷房卡輪流玩四款雙人體感遊戲。",
                highlight: true
            },
            {
                icon: "fa-solid fa-film",
                name: "Baymax Cinemas",
                summary: "兩個小影廳節奏安靜，當孩子需要降噪休息時非常好用。",
                bestTime: "片單出來就先看，提早一點進場能挑舒服位置。",
                tripUse: "Day 3 下午若想切到室內模式，這裡是很穩的備案。",
                highlight: true
            },
            {
                icon: "fa-solid fa-mug-hot",
                name: "Alley Cat Café / Pics Photo Shop / 商店街",
                summary: "咖啡、照片取件與周邊都集中在同一帶，很適合邊走邊補貨。",
                bestTime: "下午或白天比演後散場友善。",
                tripUse: "大人等孩子跑活動時，可以順手處理照片與小型採買。",
                highlight: false
            }
        ]
    },
    {
        id: "deck8",
        label: "Deck 8",
        title: "Deck 8｜Oceaneer 報到與親子安全核心",
        theme: "海洋俱樂部、RFID 手環、取孩密語、晚間親子活動",
        tripFocus: "Day 1 Open House 的任務很明確：先讓孩子熟悉，再把接送規則一次設定好。",
        badges: ["Day 1 Open House", "RFID 手環", "取孩密語"],
        facilities: [
            {
                icon: "fa-solid fa-child-reaching",
                name: "Disney Oceaneer Club",
                summary: "3–10 歲孩子的沉浸式主場，四大主題區域夠讓首日下午就玩出興趣。",
                bestTime: "Day 1 下午一開放就先帶著走一次完整動線。",
                tripUse: "澤澤、彤妹先把空間熟起來，後面家長才有餘裕拆隊。",
                highlight: true
            },
            {
                icon: "fa-solid fa-shield-heart",
                name: "RFID 手環與取孩密語機制",
                summary: "白色防水手環加上房卡與密語的雙重接送機制，是這層最重要的安心感來源。",
                bestTime: "第一次報到就把規則設定完整。",
                tripUse: "這趟家庭行程的關鍵不是只玩，而是讓接送流程一次上軌道。",
                highlight: true
            },
            {
                icon: "fa-solid fa-crown",
                name: "Royal Society for Friendship and Tea / 主題活動",
                summary: "付費活動雖不是必排，但若孩子超吃公主主題，這裡要提早決定。",
                bestTime: "有意願就提早透過禮賓或系統確認名額。",
                tripUse: "列入願望清單，不和主行程綁死。",
                highlight: false
            },
            {
                icon: "fa-solid fa-camera-retro",
                name: "Hollywood Spotlight Club",
                summary: "家庭舞會、合照與親子活動常在這裡出現，節奏比俱樂部更開放。",
                bestTime: "留意晚間 Navigator App 活動表。",
                tripUse: "若全家想找一起參與的晚間活動，這層很值得看表補位。",
                highlight: false
            }
        ]
    },
    {
        id: "deck10",
        label: "Deck 10",
        title: "Deck 10｜花園舞台與快餐動線主戰場",
        theme: "Imagination Garden、Wayfinder Bay、Discovery Reef、快餐群",
        tripFocus: "Day 1 熟悉舞台、Day 2 看 Avengers、Day 3 看 Duffy 與煙火前集結都會繞回這一圈。",
        badges: ["花園舞台主場", "快餐分流", "白天活動最多"],
        facilities: [
            {
                icon: "fa-solid fa-tree-city",
                name: "Disney Imagination Garden",
                summary: "全船最核心的舞台廣場，白天活動與夜間表演都靠這裡帶節奏。",
                bestTime: "演前 15–20 分鐘到，想看全景可往樓上環繞區。",
                tripUse: "Day 1、Day 2、Day 3 都會來，這裡是整趟最該先熟的公共空間。",
                highlight: true
            },
            {
                icon: "fa-solid fa-water-ladder",
                name: "Wayfinder Bay + Discovery Reef",
                summary: "莫阿娜主題泳池與海景最舒服，旁邊還能順手買到烏蘇拉主題飲品。",
                bestTime: "上午或秀前空檔比較舒服，避開正午最熱。",
                tripUse: "Day 2 上午很適合玩水、拍照、買一杯珍奶當小獎勵。",
                highlight: true
            },
            {
                icon: "fa-solid fa-bowl-food",
                name: "Mowgli’s Eatery / Stitch’s ’Ohana Grill / Flavors of Asia",
                summary: "這層快餐密度很高，最適合先佔位再分頭取餐。",
                bestTime: "錯峰吃最省時間，中午尖峰盡量提早或延後。",
                tripUse: "若不想回主餐廳，這裡是全家分工取餐效率最高的地方。",
                highlight: true
            },
            {
                icon: "fa-solid fa-spa",
                name: "Spa / Fitness Center / Wayfinder Bar",
                summary: "大人系節奏主要在這一帶，適合把它當成機動備案而不是主軸。",
                bestTime: "早晨最安靜，熱門療程需提早預約。",
                tripUse: "若大人想偷一段自己的時間，這層最有機會安排出空檔。",
                highlight: false
            }
        ]
    },
    {
        id: "deck11",
        label: "Deck 11",
        title: "Deck 11｜花園俯瞰視角與輕大人感補位",
        theme: "花園舞台上層視角、Garden Bar、Palo 入口與商店補位",
        tripFocus: "這層不是主行程核心，但它是看花園舞台與調整節奏的舒服上層。",
        badges: ["舞台俯瞰位", "大人感補位", "秀前緩衝"],
        facilities: [
            {
                icon: "fa-solid fa-eye",
                name: "Imagination Garden 上層環繞區",
                summary: "想看整個花園舞台的動態，站在上層環繞區比平面更容易掌握全場。",
                bestTime: "表演前 15 分鐘先來找邊側或欄杆位。",
                tripUse: "如果不想在人群最前排硬擠，這層是看秀很聰明的角度。",
                highlight: true
            },
            {
                icon: "fa-solid fa-martini-glass-citrus",
                name: "Garden Bar / Taverna Portorosso",
                summary: "比較像是大人能喘口氣的輕餐與酒吧帶，不必特別為它拉出主行程。",
                bestTime: "傍晚或夜秀前後最有氛圍。",
                tripUse: "若長輩或大人想避開主甲板人潮，這裡很適合慢下來。",
                highlight: false
            },
            {
                icon: "fa-solid fa-champagne-glasses",
                name: "Palo Trattoria 入口層",
                summary: "成人專屬餐廳入口與候位區，屬於禮賓可協助安排的高級選項。",
                bestTime: "熱門餐期要靠預約，不適合臨時起意。",
                tripUse: "這趟先視為備案，不佔家庭主行程。",
                highlight: false
            },
            {
                icon: "fa-solid fa-crown",
                name: "Castle Collection",
                summary: "比較偏公主系與禮品型周邊，適合快速補買小物。",
                bestTime: "白天或下午順逛最舒服。",
                tripUse: "可和 Deck 10/7 商店區一起安排，不必獨立跑一趟。",
                highlight: false
            }
        ]
    },
    {
        id: "deck17",
        label: "Deck 17",
        title: "Deck 17｜家庭補給主場與禮賓回氣站",
        theme: "Concierge Lounge、Toy Story Pool、Pixar Market、披薩與冰沙",
        tripFocus: "這趟最常反覆回來的就是這層，玩水、吃東西、看完秀後退場休息都很實用。",
        badges: ["預設主頁", "玩水補給主場", "禮賓回氣站"],
        facilities: [
            {
                icon: "fa-solid fa-crown",
                name: "Concierge Lounge",
                summary: "禮賓家庭最穩的補給基地，點心、飲品與安靜座位都讓節奏很舒服。",
                bestTime: "秀前、秀後、孩子需要降躁的時候最有價值。",
                tripUse: "Day 1 報到、Day 1 宵夜、Day 4 早餐都會回到這裡。",
                highlight: true
            },
            {
                icon: "fa-solid fa-water",
                name: "Toy Story Pool / Splash Pad / Flying Saucer Splash Zone",
                summary: "最適合家庭暖身與放電的玩具總動員水區，孩子很容易一待就不想走。",
                bestTime: "登船日下午或海上日早段，人通常比較友善。",
                tripUse: "Day 1 暖身玩水、Day 3 再衝一次，這層是你們的固定回訪點。",
                highlight: true
            },
            {
                icon: "fa-solid fa-pizza-slice",
                name: "Pixar Market / Pizza Planet / Wheezy’s Freezies",
                summary: "濕答答也能快速補能量，幾乎是家長最省力的一站式解法。",
                bestTime: "先找位子再分工取餐，效率最高。",
                tripUse: "玩水中場、下午餓了、孩子只想快點吃點東西時都很好用。",
                highlight: true
            },
            {
                icon: "fa-solid fa-gem",
                name: "Market Bar / Wishes Treasures / Palace Treasures",
                summary: "想順手補看精品或喝一杯可以留意，但不需要和主行程綁太死。",
                bestTime: "非用餐尖峰或晚上較鬆。",
                tripUse: "主要還是陪襯用途，真正核心依舊是玩水與補給。",
                highlight: false
            }
        ]
    },
    {
        id: "deck18",
        label: "Deck 18",
        title: "Deck 18｜刺激設施與高空海景切換層",
        theme: "Marvel Landing、Infinity Pool、跑道、禮賓 Spa / 健身",
        tripFocus: "Day 2 上午的刺激行程幾乎直接鎖定這層與上一層，是早上衝一波最好的區域。",
        badges: ["Day 2 上午主場", "刺激設施", "高空海景"],
        facilities: [
            {
                icon: "fa-solid fa-bolt",
                name: "Marvel Landing",
                summary: "漫威主題區就是 Day 2 上午最有速度感的開局，適合先衝再慢下來。",
                bestTime: "越早越好，風勢穩時最容易玩得順。",
                tripUse: "Day 2 先攻 Ironcycle 與周邊設施，早上完成最省排隊。",
                highlight: true
            },
            {
                icon: "fa-solid fa-water-ladder",
                name: "Infinity Pool & Jetfinity Bar",
                summary: "無邊際泳池配海景視野很強，屬於玩完刺激後立刻放鬆的完美切換。",
                bestTime: "上午或夕陽前氣氛都很好，風大要注意保暖。",
                tripUse: "Day 2 Marvel 行程之後順接最自然，不用再跨太多層。",
                highlight: true
            },
            {
                icon: "fa-solid fa-heart-pulse",
                name: "Running Track / Concierge Fitness Center",
                summary: "若有人真的想晨跑或健身，這層是少數能把運動和海景結合起來的地方。",
                bestTime: "清晨人最少，傍晚風會比較大。",
                tripUse: "不是主線，但適合早起的大人自己偷一段時間。",
                highlight: false
            },
            {
                icon: "fa-solid fa-spa",
                name: "Opulence Spa – Elemis at Sea",
                summary: "較進階的大人享受都在這層，熱門時段最好讓禮賓先幫忙看位。",
                bestTime: "熱門檔提前預約，不要現場碰運氣。",
                tripUse: "可列入願望清單，不占親子主流程。",
                highlight: false
            }
        ]
    },
    {
        id: "deck19",
        label: "Deck 19",
        title: "Deck 19｜禮賓避峰據點與滑水道入口層",
        theme: "Concierge Sundeck、Woody’s Wide Slide 入口、Ironcycle 高空視角",
        tripFocus: "想避開主甲板人潮時，這層是禮賓家庭最有價值的退場與再出發據點。",
        badges: ["禮賓避峰", "滑水道入口", "高空視野打卡"],
        facilities: [
            {
                icon: "fa-solid fa-sun",
                name: "Concierge Sundeck & Pool / Sundeck Dining",
                summary: "禮賓專屬空間的最大價值不是奢華，而是能在最吵的時候快速抽離。",
                bestTime: "中途孩子累了、秀後太擠、想安靜喝點東西時。",
                tripUse: "可當作 Day 2、Day 3 的中場休息點，重新整理體力。",
                highlight: true
            },
            {
                icon: "fa-solid fa-person-swimming",
                name: "Woody’s Wide Slide 入口",
                summary: "從 19 樓入口一路滑回 17 樓，透明段伸出船外的視覺刺激感很強。",
                bestTime: "登船日下午或海上日早段通常排得最輕。",
                tripUse: "和 Deck 17 玩水區打包成一組玩最順，先確認身高限制。",
                highlight: true
            },
            {
                icon: "fa-solid fa-jet-fighter-up",
                name: "Ironcycle Test Run 高空段 / 打卡視野",
                summary: "這裡的高空軌道與風勢會直接影響體驗，能玩時請把握。",
                bestTime: "早上看公告，風大時不要硬等。",
                tripUse: "Day 2 早段最值得上來，能玩就先玩掉。",
                highlight: true
            }
        ]
    }
];

const showGuideData = [
    {
        id: "stage-musicals",
        title: "華特迪士尼劇院主秀",
        icon: "fa-solid fa-masks-theater",
        intro: "最值得提早卡位的大秀都集中在劇院，晚餐節奏只要抓順，這幾場幾乎就是整趟旅程的晚間主軸。",
        shows: [
            {
                name: "《Remember》",
                theme: "以瓦力與伊芙為主線，串起可可夜總會、小美人魚、阿拉丁等迪士尼記憶的原創音樂劇。",
                location: "Walt Disney Theatre（Deck 5–7 船頭）",
                timingTip: "建議提早 20–30 分鐘進場，優先選中間區。",
                tripLink: "Day 1 晚餐後直接銜接，是首日晚間最重要的一場。"
            },
            {
                name: "《Disney Seas the Adventure》",
                theme: "由經典角色串起的海上百老匯式大秀，節奏熱鬧、全家都容易進入狀況。",
                location: "Walt Disney Theatre（Deck 5–7 船頭）",
                timingTip: "和晚餐時段綁在一起看最順，仍建議提早入座。",
                tripLink: "適合作為另一晚的正式看秀主線，沿用 Day 1 的進場策略即可。"
            }
        ]
    },
    {
        id: "garden-shows",
        title: "花園舞台 / 派對秀",
        icon: "fa-solid fa-wand-magic-sparkles",
        intro: "第 10/11 層的花園舞台是白天到夜晚最常啟動全船氣氛的地方，真正好看的不是只衝最前面，而是提早卡好能兼顧視野與退場的位子。",
        shows: [
            {
                name: "《Avengers Assemble!》",
                theme: "漫威特技秀，英雄群像加上死侍的吐槽節奏，很適合全家一起看熱鬧。",
                location: "Disney Imagination Garden（Deck 10/11 船中）",
                timingTip: "提早 15–20 分鐘到，樓上環繞區較容易掌握全景。",
                tripLink: "Day 2 下午最對味，和 Marvel Landing 主題可以串成完整的一天。"
            },
            {
                name: "《Duffy and The Friend Ship》",
                theme: "達菲與好友的海上派對，是偏可愛與合照氛圍的大型演出。",
                location: "Disney Imagination Garden（Deck 10/11 船中）",
                timingTip: "若孩子偏愛達菲系，建議提早卡視野好的邊側區。",
                tripLink: "Day 3 下午很適合安排這場，和花園舞台活動自然接在一起。"
            },
            {
                name: "《Let’s Set Sail》/《Baymax Super Exercise Expo》",
                theme: "一場偏啟航儀式感、一場偏歡樂體操互動，都是氣氛型活動。",
                location: "Disney Imagination Garden（Deck 10/11 船中）",
                timingTip: "想參與感高就提早到前排，想輕鬆看就站樓上。",
                tripLink: "Day 1 登船後與 Day 2 白天都值得留意 Navigator App。"
            }
        ]
    },
    {
        id: "open-air-night",
        title: "戶外海景音樂劇 / 煙火",
        icon: "fa-solid fa-fire",
        intro: "這一類表演最吃天氣、風勢與現場節奏，建議把它們當成海上日的晚間高潮來安排，而不是最後一刻才決定去哪裡看。",
        shows: [
            {
                name: "《Moana: Call of the Sea》",
                theme: "把莫阿娜的航海故事搬進夜間露天海景環境裡，氛圍會比室內劇場更開闊。",
                location: "Wayfinder Bay（船尾戶外舞台區）",
                timingTip: "夜間戶外風較強，提早到場並順手準備薄外套。",
                tripLink: "若 Day 2 晚上想走海景演出路線，這場最值得鎖定。"
            },
            {
                name: "《The Lion King: Celebration in the Sky》",
                theme: "獅子王主題海上煙火，配樂與旁白都走大型慶典級別的震撼路線。",
                location: "高層戶外甲板與開放視野區",
                timingTip: "先找好不會被人潮壓縮的視角，並留意當天即時公告。",
                tripLink: "Day 3 晚間是你們目前行程裡最明確的壓軸安排。"
            }
        ]
    }
];
