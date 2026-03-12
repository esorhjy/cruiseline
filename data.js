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
