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
                name: "早／中午｜提早登船＋Open House 優先＋禮賓報到",
                events: [
                    {
                        time: "10:30–11:30",
                        title: "抵達碼頭、完成報到",
                        tag: "登船流程",
                        tagClass: "tag-boarding",
                        desc: [
                            "<strong>目的：</strong>若住 DCL 合作飯店，可先聯繫安排接駁，通常會比一般自到客更早進入登船節奏。",
                            "<strong>提醒：</strong>QR code 先截圖或列印最穩；接駁車行李通常另有處理，不用停在自助 drop-off。",
                            "<strong>留意：</strong>飯店前一晚會公告集合時間與行李外放時間，早上照組別集合即可。"
                        ]
                    },
                    {
                        time: "11:45–12:30",
                        title: "快速補給（自助餐／Concierge Lounge）",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "<strong>決策理由：</strong>避免首日高價值時段被長午餐吃掉，保留 Open House 與設施熟悉時間。",
                            "<strong>建議：</strong>以快速補給為主，優先選自助餐或 Concierge Lounge，控制用餐節奏。",
                            "<strong>提醒：</strong>房卡與行李常會分批到房，必備品務必先放隨身包。"
                        ]
                    },
                    {
                        time: "12:30–13:00",
                        title: "禮賓酒廊報到：Concierge Lounge (Deck 17)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>請一併確認：</strong>晚餐第一時段（First Seating）、輪替餐廳順序。",
                            "<strong>請管家協助確認：</strong>",
                            "出發前 130 天代訂的 Royal Meet & Greet（免費皇家見面會）時段",
                            "當晚 Walt Disney Theatre 主秀「免排隊提前入座」安排",
                            "<strong>登船補位：</strong>若先被引導回房卻還沒拿到房卡，先看門口信封，再不行就去 Deck 6 Mid 的 Guest Services。",
                            "<strong>中午左右：</strong>留意 Navigator App 是否已開通，首日若有商品販售或活動預約要盡快看。"
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
                            "也就是強制旅客集合演練，每個人都必須到，不要遲到。",
                            "房卡上會寫集合區號，若不確定位置請提早問工作人員。"
                        ]
                    },
                    {
                        time: "17:25–17:35",
                        title: "到甲板上聽啟航汽笛",
                        tag: "啟航儀式",
                        tagClass: "tag-highlight",
                        desc: [
                            "大約 5:30 左右會以汽笛播放音樂，第一次搭船很值得到甲板上感受一次。",
                            "離汽笛太近會非常大聲，想體驗氣氛但不必硬卡最近的位置。"
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
                            "<strong>建議：</strong>這晚拍全家正式照片",
                            "<strong>First Seating 提醒：</strong>若晚餐互動或餐廳秀拉長，別吃到最後一刻，否則還是會壓縮後面劇院排隊時間。"
                        ]
                    },
                    {
                        time: "19:30–21:00",
                        title: "Walt Disney Theatre 首日晚間大秀 (Deck 5–7)",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "音樂劇《Remember》",
                            "晚間秀建議提早 30 分鐘入場；選中間區域視野最佳。",
                            "若當晚 Navigator App 顯示可走禮賓提前入場，演前 40 分鐘到 Deck 5 forward 電梯大廳集合，帶金色房卡與 App 證明。"
                        ]
                    },
                    {
                        time: "21:05–21:40",
                        title: "Concierge Lounge (Deck 17) 宵夜收尾",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "結束完美的第一天",
                            "這段剛好可接上 Lounge 20:30–22:00 的 Dessert Treats。"
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
                            "若早餐想靠 room service，建議預約 07:00 左右或更早。",
                            "超過 08:00 後較容易晚到，會壓縮上午設施或預約行程。",
                            "若仍想吃主餐，再視精神和時間補正式早餐。"
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
                            "<strong>目的：</strong>收整晚餐前狀態",
                            "<strong>提醒：</strong>Lounge 下午茶實際供應到 16:30。"
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
                            "有米奇米妮的船長晚餐。",
                            "<strong>First Seating 提醒：</strong>若晚餐互動或餐廳秀拉長，別吃到最後一刻，否則還是會壓縮後面劇院排隊時間。"
                        ]
                    },
                    {
                        time: "19:30–21:15",
                        title: "劇院主秀《Disney Seas the Adventure》",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "百老匯等級主題秀",
                            "若當晚 Navigator App 顯示可走禮賓提前入場，演前 40 分鐘到 Deck 5 forward 電梯大廳集合，帶金色房卡與 App 證明。"
                        ]
                    },
                    {
                        time: "21:20–21:50",
                        title: "Concierge Lounge 收尾",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "結束充實的第二天",
                            "這段剛好可接上 Lounge 20:30–22:00 的 Dessert Treats。"
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
                            "在大英雄天團主題劇院看熱門電影",
                            "若有安排 Baymax 合照，前後切到室內休息會很順。"
                        ]
                    },
                    {
                        time: "15:30–16:30",
                        title: "Concierge Sundeck & Pool (Deck 19)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>目的：</strong>最後一次長時段放鬆",
                            "<strong>補給：</strong>11:00–16:30 可補輕食與熱食。",
                            "<strong>提醒：</strong>晚間免費酒精主場在 Concierge Lounge，不是在 Sundeck。"
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
                            "<strong>獅子王主題海上煙火：Celebration in the Sky</strong>",
                            "接近 10:30 會直接施放，通常不太暖場，先找空曠少遮擋的位置。"
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
                        title: "早餐＋最後確認手提物品",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "早餐可依家庭節奏二選一：餐廳早餐（較完整）或 Lounge 冷食早餐（較快）。",
                            "<strong>提醒：</strong>大型行李若前晚已外放，證件、外套、點心與孩子晨間用品要留在手提包；前晚先核對房帳。"
                        ]
                    },
                    {
                        time: "08:00–09:00",
                        title: "下船、找行李、前往樟宜機場",
                        tag: "極速通關",
                        tagClass: "tag-boarding",
                        desc: [
                            "禮賓優先通道（如 D Lounge）通常可更快下船，實際以船上通知為準。",
                            "若交給 DCL 帶行李，港口角色吊牌區不一定集中，請預留找行李時間。",
                            "若自己搬行李通常能略早下船，但時間差不必當成保證。",
                            "接港口後續交通時，Grab、limo 或行李推車都可現場再決定。"
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
            { id: "sgac-twice", text: "新加坡入境卡 (SGAC) 需填寫兩次 (入境+回船)" },
            { id: "phone-timezone-off", text: "上船前關閉手機自動時區，船上以 Navigator App 時間為準" }
        ]
    },
    {
        category: "預約與購買",
        items: [
            { id: "royal-meet-130d", text: "130 天前禮賓預約：皇家公主見面會" },
            { id: "dinner-table", text: "聯絡管家確認用餐需求 (如併桌安排)" },
            { id: "photo-package", text: "考慮是否預購郵輪拍照套裝 (比較划算)" },
            { id: "wifi-buy", text: "確認是否需要額外 Wi-Fi；禮賓房每位房客含 24 小時連續網路，不必太早啟用" },
            { id: "kids-club-booking", text: "預定 Oceaneer Club 兒童俱樂部時段" }
        ]
    },
    {
        category: "事先準備",
        items: [
            { id: "passport-expiry", text: "確認護照效期 (6 個月以上) 與旅遊保險" },
            { id: "personal-essentials", text: "攜帶個人備品 (牙刷、購物袋、防曬/曬後舒緩用品、幼童防水小凳、常備藥)" },
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
                summary: "探險號限定與迪士尼皮克斯周邊最集中的一層，兩邊店面可一路拿著商品逛完再集中結帳。",
                bestTime: "開航日下午比演後散場好逛得多，首日若能提早買最省排隊。",
                tripUse: "可和 Deck 7 商店街一起安排；先自備購物袋，若能直接入房帳通常會比現場刷卡順。",
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
                summary: "帳單、網路、遺失物、需求協助都在這裡處理，登船日若房卡或現場引導有落差時也常要回來補位。",
                bestTime: "避開開船日下午與最後一晚尖峰。",
                tripUse: "若房卡、Wi-Fi、帳單或現場指引讓人摸不著頭緒，先記得回這裡補位。",
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
                summary: "房卡就能啟動的大英雄天團體感電玩，四款遊戲都需要全身互動，是下午最好的放電分流點。",
                bestTime: "避開晚間尖峰，下午更能玩到完整體感機。",
                tripUse: "Day 2 下午很適合全家刷房卡輪流玩四款雙人體感遊戲：Super Fred Kaiju Chaos（怪獸追逐）、Go Go Racers（節奏賽車）、Honey Lemon Chem-Ball Blast（化學球射擊）、Wasabi Speed Slice（電漿切片）。",
                highlight: true
            },
            {
                icon: "fa-solid fa-film",
                name: "Baymax Cinemas",
                summary: "兩個小影廳節奏安靜，當孩子需要降噪休息時非常好用，也很適合安排在 Baymax 合照前後當室內分流點。",
                bestTime: "片單出來就先看，提早一點進場能挑舒服位置；若孩子或長輩依賴字幕，要先有目前多半沒有字幕的心理準備。",
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
                summary: "全船最核心的花園舞台，白天活動與夜間表演都靠這裡帶節奏。",
                bestTime: "演前 15–20 分鐘到，想看全景可往樓上環繞區。",
                tripUse: "Day 1、Day 2、Day 3 都會來，這裡是整趟最該先熟的公共空間；若從船頭要去花園舞台，通常先走到 Deck 11 再下樓最穩，若人在船尾，多半可直接沿 Deck 10 走過去。",
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
                name: "Gramma Tala’s Kitchen",
                summary: "Deck 10 中段少數偏亞洲口味的補給點，想念熟悉飯食時會比一直吃西式快餐更有安定感。",
                bestTime: "常見窗口大約是 11:00–18:00 與 22:00–00:00；中午與宵夜時段最值得留意當天是否有開。",
                tripUse: "帶小孩家庭若開始想念雞飯、牛肉飯這類亞洲口味，這裡通常最容易救回胃口；點飯時也常能像雜飯一樣自己選配菜，牛肉若能加上炒牛肉會特別下飯。",
                highlight: true
            },
            {
                icon: "fa-solid fa-burger",
                name: "Stitch’s ’Ohana Grill",
                summary: "Deck 10 船尾最有飽足感的快餐主力，漢堡、熱狗和薯條都是這層最容易讓全家快速吃飽的選項。",
                bestTime: "常見營運時段約 10:30–22:00；午晚餐尖峰最多人，若能錯峰拿餐會更舒服。",
                tripUse: "若真的想用高滿足快餐取代一頓正式晚餐，這裡通常是最穩的 fallback；漢堡份量普遍偏大，真的很餓時可以用社群推薦的心態考慮直接點兩份。",
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
                summary: "禮賓家庭最穩的補給基地；每日供應與酒水節奏請直接看 Playbook「禮賓隱藏加值」卡片。",
                bestTime: "Day 1 報到後先熟路線；每晚晚餐前後再回來做中轉補位。",
                tripUse: "把 Lounge 當集合與節奏切換點即可，詳細時段與注意事項不在這裡重複。",
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
                summary: "濕答答也能快速補能量，尤其 Pizza Planet 幾乎是最不打斷節奏的披薩補給點，剛出爐時表現通常特別好。",
                bestTime: "常見窗口約 10:30–18:00 與 21:00–00:00；下午點心、玩水後與宵夜時段特別好用，先找位子再分工取餐效率最高。",
                tripUse: "玩水中場、下午餓了、孩子只想快點吃點東西時都很好用；披薩通常不用排太久，常常變成先拿一片、又順手補第二片第三片的家庭補給站。若要裝免費飲料，記得找泳池另一側的飲料機，不要把旁邊的付費酒吧當成同一區。",
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
                bestTime: "越早越好，風勢穩時最容易玩得順；Quantum Racers 要避免亂撞卡住全場。",
                tripUse: "Day 2 先攻 Ironcycle 與周邊設施，早上完成最省排隊。",
                highlight: true
            },
            {
                icon: "fa-solid fa-water-ladder",
                name: "Infinity Pool & Jetfinity Bar",
                summary: "無邊際泳池配海景視野很強，除了看海和放鬆，池邊 bar 也常被熟門熟路的人當成隱藏補給點。",
                bestTime: "常見時段大約 09:00–23:00；上午玩完設施後或午後放鬆都很適合，夕陽前氣氛也很好，風大要注意保暖。",
                tripUse: "Day 2 Marvel 行程之後順接最自然，不用再跨太多層；若孩子在 Deck 18 玩到一半餓了，池邊常可順手補免費 hotdog 麵包，不必急著離開這層找食物。",
                highlight: true
            },
            {
                icon: "fa-solid fa-heart-pulse",
                name: "Running Track / Concierge Fitness Center",
                summary: "若有人真的想晨跑或健身，這層是少數能把運動和海景結合起來的地方。",
                bestTime: "Concierge Fitness Center 06:00–22:00 可用；清晨人最少，傍晚風會比較大。",
                tripUse: "不是主線，但適合早起的大人自己偷一段時間。",
                highlight: false
            },
            {
                icon: "fa-solid fa-spa",
                name: "Opulence Spa – Elemis at Sea",
                summary: "較進階的大人享受都在這層，熱門時段最好讓禮賓先幫忙看位。",
                bestTime: "Spa 區 08:00–22:00 開放，熱門檔提前預約，不要現場碰運氣。",
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
                summary: "禮賓專屬空間的最大價值不是奢華，而是能在最吵的時候快速抽離；整區 07:00–22:00 開放。",
                bestTime: "11:00–16:30 最適合補 light bites 與 hot items；07:00–22:00 都能回來休息和補基本飲品。",
                tripUse: "可當作 Day 2、Day 3 的中場休息點，重新整理體力；基本免費飲品供應到 22:00，付費酒水則從 11:00–22:00 可點。",
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
        intro: "最值得提早卡位的大秀都集中在劇院，通常會依晚餐時段自動分流，不一定會出現在可預約清單裡；就算已經預排到時段，晚餐節奏一拉長，還是可能壓縮排隊搶位時間。",
        shows: [
            {
                name: "《Remember》",
                theme: "以瓦力與伊芙為主線，串起可可夜總會、小美人魚、阿拉丁等迪士尼記憶的原創音樂劇。",
                location: "Walt Disney Theatre（Deck 5–7 船頭）",
                timingTip: "建議提早 20–30 分鐘進場，優先搶一樓中間區；若是 First Seating 又遇到餐廳秀或晚餐拖長，更要提早收尾，二樓視野也較容易被前排遮住。",
                tripLink: "Day 1 晚餐後直接銜接，是首日晚間最重要的一場。"
            },
            {
                name: "《Disney Seas the Adventure》",
                theme: "由經典角色串起的海上百老匯式大秀，節奏熱鬧、全家都容易進入狀況。",
                location: "Walt Disney Theatre（Deck 5–7 船頭）",
                timingTip: "和晚餐時段綁在一起看最順，但 First Seating 若晚餐拖長仍可能壓縮排隊時間；進場時仍建議優先搶一樓區域。",
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
                timingTip: "通常約 10:30 準時施放、暖場不多；先找空曠少遮擋的位置，並留意當天即時公告。",
                tripLink: "Day 3 晚間是你們目前行程裡最明確的壓軸安排。"
            }
        ]
    }
];

const playbookGuideData = [
    {
        id: "pretrip",
        label: "行前防雷",
        intro: "把最容易卡在報到前的錯誤先排除。這區只保留網站其他地方沒講清楚的技術準備、資料整理與老手小技巧。",
        items: [
            {
                title: "手機時間不要自己亂跳，進入公海後一律跟 Navigator App 對時",
                icon: "fa-solid fa-clock",
                sourceType: "community",
                whenToUse: "上船前先設定好，進入公海後每天再確認一次。",
                action: "上船前先把手機自動調整時區關掉；之後看船上活動、集合或演出時間時，都以 Disney Cruise Line Navigator App 顯示的時間為準。",
                tripFit: "這趟從新加坡出發，海上行進時手機可能因為鄰近海域訊號或時區判定自己跳 1 小時，但船上活動節奏未必跟著手機變。",
                caution: "這是非常高風險的實戰提醒：若手機自己跳時區，最容易直接錯過活動、集合或預約時間，所以不要只相信手機狀態列上的時間。",
                relatedSectionId: "checkin"
            },
            {
                title: "住 DCL 合作飯店的話，接駁車要提早打電話確認",
                icon: "fa-solid fa-hotel",
                sourceType: "community",
                whenToUse: "訂好合作飯店後、出發前就先處理。",
                action: "若入住 DCL 合作飯店，可主動聯繫 DCL 登記接駁，確認旅客資料與付款方式；到飯店後再去 DCL 櫃檯看隔天集合組別、時間與行李外放規則。",
                tripFit: "這趟若住聖淘沙香格里拉，接駁能把從飯店到碼頭的焦慮感降很多，也更容易接上較早的登船節奏。",
                caution: "這屬合作飯店實務流程，不是所有住宿都適用；實際集合時間與上船時段仍以當地 DCL 櫃檯通知為準。",
                relatedSectionId: "checkin"
            },
            {
                title: "英文帳號加上兩家人資料夾，先整理再開搶",
                icon: "fa-solid fa-folder-tree",
                sourceType: "community",
                whenToUse: "出發前 40 天線上報到前，就先整理完成。",
                action: "用全英文姓名的 Disney 帳號綁好訂位代號，並把兩家人的英文地址、緊急聯絡人、Security Photo、護照頁和航班號碼集中成一個資料夾，報到時直接複製貼上最穩。",
                tripFit: "你們這趟是兩家三童一起作業，真正拖慢速度的通常不是系統本身，而是邊填邊找資料。",
                caution: "英文帳號較穩屬高實用社群心得，不是官方保證，但很值得提早採用。",
                relatedSectionId: "timeline"
            },
            {
                title: "線上報到五步驟不要在倒數時才想",
                icon: "fa-solid fa-list-ol",
                sourceType: "official",
                whenToUse: "40 天前開放的那一刻直接照流程走。",
                action: "先把 Guest Info、Onboard Account、Travel Plan、Port Arrival Time、Cruise Contract 五步驟要填的內容準備好，完成後把 QR 碼截圖存進手機或 Apple Wallet。",
                tripFit: "這張卡不是重講最早到港時段，而是讓你在開放瞬間不需要邊翻資料邊想下一步。",
                caution: "照片若顯示 Pending 通常是人工審核中，不代表上傳失敗。",
                relatedSectionId: "checkin"
            },
            {
                title: "禁帶電器先排雷，充電頭走輕量化",
                icon: "fa-solid fa-plug-circle-xmark",
                sourceType: "official",
                whenToUse: "開始打包行李時就先檢查，不要到碼頭才被退件。",
                action: "延長線、多孔插座與電源分接器都先排除；如果只是多人充電，改帶 USB 多孔充電頭會更穩。",
                tripFit: "兩家人加上手機、手錶、行動電源很多，最容易在『怕不夠插』這件事上帶錯設備。",
                caution: "安檢對供電設備很敏感，不要賭看起來像是可以通過的灰色地帶。",
                relatedSectionId: "checklist"
            },
            {
                title: "爆米花桶先進隨身包，不要上船後才想起來",
                icon: "fa-solid fa-bucket",
                sourceType: "community",
                whenToUse: "出發前收隨身行李時一起放進去。",
                action: "若你們已經有園區爆米花桶，直接把它當成這趟的看秀補給工具，上船後就能自然串進影城、劇院與甲板活動。",
                tripFit: "這趟看秀很多、孩子也多，有自己的桶能把『排隊買零食』變成固定補給節奏。",
                caution: "續杯販售點與價格仍以當船營運為準，這張卡偏向老乘客常用技巧。",
                relatedSectionId: "entertainment"
            }
        ]
    },
    {
        id: "embark-sprint",
        label: "登船日 3 小時",
        intro: "這區不是再重講登船流程，而是把 Day 1 最容易失控的前三小時整理成家庭版節奏卡。",
        items: [
            {
                title: "隨身包要以『下午先玩』為前提",
                icon: "fa-solid fa-suitcase-rolling",
                sourceType: "community",
                whenToUse: "1/25 登船前一晚收手提行李時。",
                action: "把泳衣、防曬、防滑拖鞋、孩子換洗衣物、行動電源和必要文件放在同一包，別讓玩水裝備跟托運行李分開。",
                tripFit: "你們的 Day 1 不是只有報到，而是要接 Open House 與玩水暖身，少一樣都會拖慢全家節奏。",
                caution: "這張卡不取代證件檢查，它只是提醒真正影響心情的通常是『下午要用的東西有沒有跟著上船』。",
                relatedSectionId: "checklist"
            },
            {
                title: "登船 3 小時 SOP：只跑第一圈，不要一開始就滿船亂衝",
                icon: "fa-solid fa-route",
                sourceType: "community",
                whenToUse: "真正踏上船後的第一個下午。",
                action: "把節奏固定成：接駁車下車後直接跟指引前進 → QR code 安檢與 check-in → 坐下式午餐 → 禮賓 Lounge 短補給 → Kids Club Open House → 水區放電，只保留最重要的第一圈。",
                tripFit: "這條路線能同時滿足大人報到、孩子熟悉環境與第一天放電，最適合你們兩家同行的協作節奏。",
                caution: "房卡與行李常不會同時到位，先別急著把回房當第一優先；接駁客的行李也通常不用停在自助 drop-off。若現場拿到行李吊牌，只撕尾端貼紙固定即可，不要整條撕開。",
                relatedSectionId: "checkin"
            },
            {
                title: "Lounge 要當緩衝區，不要把它當正餐替代",
                icon: "fa-solid fa-couch",
                sourceType: "concierge",
                whenToUse: "每天下午或秀前後需要重新集合時。",
                action: "把 Lounge 當成 15–20 分鐘的補水、降噪、等人與重新同步的中轉站；有點心就補一輪，但主餐與正式演出仍照原節奏走。",
                tripFit: "對兩家三童來說，最難的不是有沒有吃到，而是全員能不能重新同步；Lounge 正好是最好用的集合點。",
                caution: "點心多半是冷盤與輕食，不要因為下午茶吃太滿，把輪替晚餐的儀式感擠掉。",
                relatedSectionId: "deck-guide"
            }
        ]
    },
    {
        id: "daily-ops",
        label: "船上省時省力",
        intro: "這組是整趟旅程最值得反覆翻看的日常攻略，目標是少排一次隊、多留一點玩的體力。",
        items: [
            {
                title: "免費飲料站比套票更值得先熟",
                icon: "fa-solid fa-glass-water",
                sourceType: "official",
                whenToUse: "Day 1 熟悉船上動線時就先記住位置。",
                action: "主餐廳、自助餐與泳池飲料站的汽水、茶、咖啡與水本來就能用，先帶一個隨行水瓶，通常比急著買飲料套票更實用；若人在披薩星球附近，記得免費飲料機通常在泳池另一側，不是緊鄰的付費酒吧吧台。",
                tripFit: "你們多是親子行程，真正高頻補給的是水、汽水和熱飲，不是整天跑酒吧。",
                caution: "罐裝飲料、酒吧飲品與部分房務項目仍可能另外計費，不要把免費飲料站和全部飲品混為一談；若大人常喝啤酒，專屬啤酒杯加 token 玩法通常比每次重買杯子更划算。",
                relatedSectionId: ""
            },
            {
                title: "爆米花桶加免費汽水，就是最順手的觀影組合",
                icon: "fa-solid fa-film",
                sourceType: "community",
                whenToUse: "準備進 Baymax Cinemas、劇院或夜間甲板活動前。",
                action: "若打算這趟連看幾場秀，通常 Day 1 就先買桶最划算；之後先去續杯爆米花，再從免費飲料站補汽水或水，兩樣帶著進場，會比臨時在付費攤位排隊更從容；中午左右若 App 一開通，也順手先看當天商品販售或活動預約。",
                tripFit: "這趟有劇院、影廳和煙火夜，多一個穩定補給流程就少一個孩子臨時喊餓的插曲。",
                caution: "各販售點營運時間和當船杯桶政策可能不同，進場前先看一眼 App 與現場營業狀況；劇院與秀場通常不適合拍照錄影，補給拿好後就專心看演出最穩。",
                relatedSectionId: "entertainment"
            },
            {
                title: "首日購物不要空手上陣，袋子和入房帳都能救節奏",
                icon: "fa-solid fa-bag-shopping",
                sourceType: "community",
                whenToUse: "Day 1 下午第一次進 World of Disney / Too 時。",
                action: "先自備能裝貨的袋子，兩間店可以一路拿著商品逛完再集中結帳；若現場排隊或刷卡機卡住，能入房帳時通常更省時間。",
                tripFit: "探險號首日商店很容易一逛就雙手抱滿，提早準備會比臨時找袋子或等刷卡機更從容。",
                caution: "首日商品販售與結帳動線可能依當船安排調整，別把社群分享的晚間時段當成固定保證。",
                relatedSectionId: "tips"
            },
            {
                title: "Room Service 很適合儀式感，但一定要提早下單",
                icon: "fa-solid fa-cheese",
                sourceType: "community",
                whenToUse: "孩子洗好澡、全家回房後想吃點熱食時，或隔天早餐想先靠 room service 墊一下時。",
                action: "App 內的 Room Service 入口通常藏得很深，可先走 Explore -> Dining and lounges -> 滑到最底下 -> Room Service 看菜單；真要點餐多半還是直接打給 room service team。一般情況下，電話可能要先等 10–20 分鐘才接到客服，點完餐再等約 30–40 分鐘送達。若想 12 點前後剛好吃到，通常在看完秀、回房整理一下就該先打，不要等真的餓了才叫；可先把小桌子打開，方便工作人員把餐點送進房，若要自己搬整盤進房也可以，但托盤通常偏重。",
                tripFit: "這會把『還要不要再去找東西吃』變成簡單、固定又很有記憶點的收尾儀式，特別適合孩子洗完澡後直接在房內安靜補一輪。",
                caution: "小費可用社群常見抓法：每項約 1–2 USD 或每托盤約 5 USD；吃完後托盤可放門外或留房內等房務收走。一般情況下可能是 10–20 分鐘接通、30–40 分鐘送達，但半夜高峰也可能接線超過 30 分鐘、送來已是 1–2 小時後；早餐若排超過 08:00 也較容易晚到而卡住上午預約。菜單仍以當次供應為準，wonton soup noodle 與可嘗試詢問的 cookie & milk 偏推薦，Dan Dan noodle 則屬主觀不推；熱食送到時也可能已經變溫，先有這個預期會比較舒服。",
                relatedSectionId: "tips"
            },
            {
                title: "角色排隊和空景拍照，都盡量搶早檔",
                icon: "fa-solid fa-camera-retro",
                sourceType: "community",
                whenToUse: "海上日早上與一般 meet-and-greet 前。",
                action: "角色合照通常提早 10–15 分鐘排最省時間；若想拍空景，D2、D3 的 07:30–08:30 是最容易拍到乾淨甲板的時段。",
                tripFit: "這種『早點去就省很多力』的節奏，比臨時在人潮中硬排更適合多孩家庭。",
                caution: "Royal Gathering 本身仍回到原本的時間軸與預約邏輯，新區塊只補一般排隊節奏。",
                relatedSectionId: "timeline"
            },
            {
                title: "App 出錯先現場問，不要直接放棄",
                icon: "fa-solid fa-triangle-exclamation",
                sourceType: "community",
                whenToUse: "活動預約突然消失、快速服務顯示錯誤或客滿時。",
                action: "若 App 裡的角色見面會或活動預約突然不見，先去 Guest Services 反應；若快餐預約報錯或顯示客滿，也先找座位再去現場問，通常比一直重刷更有效。",
                tripFit: "你們是多人同行，一個小 bug 就可能拖慢整串節奏，所以最重要的是知道『不要只卡在 App 裡』。",
                caution: "這屬常見實測補救，不代表系統一定會出錯；但一旦遇到，第一時間直接找現場工作人員通常最省力。",
                relatedSectionId: ""
            }
        ]
    },
    {
        id: "concierge-plus",
        label: "禮賓隱藏加值",
        intro: "這區只放網站其他地方沒明講的 concierge bonus，重點不是『有什麼』，而是『怎麼用才真的省力』。",
        items: [
            {
                title: "歡迎午宴與迎賓小禮，是登船情緒的第一個加速器",
                icon: "fa-solid fa-gift",
                sourceType: "concierge",
                whenToUse: "Day 1 剛登船、全家還在適應節奏的那段時間。",
                action: "把迎賓小禮與歡迎午宴視為『進入度假模式』的起點，不必安排成大事，但很適合拿來穩住孩子情緒與大人節奏。",
                tripFit: "這種被照顧到的開場感，對第一次把兩家人一起帶上船特別有幫助。",
                caution: "實際形式可能依船上安排微調，不要把時間卡得過死。",
                relatedSectionId: "checkin"
            },
            {
                title: "房內冰箱的軟飲與瓶水，用完就請管家補",
                icon: "fa-solid fa-bottle-water",
                sourceType: "concierge",
                whenToUse: "每天回房、孩子玩水後或睡前最常用到。",
                action: "把房內冰箱當作固定補給點，喝完就直接請管家補齊，不用等到真的見底才想起來。",
                tripFit: "這會讓房間變成真正的回血站，尤其孩子回房後常常先找水和冷飲。",
                caution: "不要假設每次都會自動補到你要的節奏，主動開口通常更快。",
                relatedSectionId: ""
            },
            {
                title: "需要省力時，先想到的是管家，不是自己排隊",
                icon: "fa-solid fa-user-tie",
                sourceType: "concierge",
                whenToUse: "遇到限額活動、劇院座位或臨時需求時。",
                action: "若孩子想要限額活動、你們想確認劇院提前入座、或有需要協調的特殊需求，第一步先問管家能不能協助，而不是自己先去碰運氣；人在房內時也可以先按電話上的 Concierge 或 Guest Services，不一定要全家走去 Lounge。",
                tripFit: "禮賓價值最大的地方不是尊榮感，而是把你們從某些排隊與來回溝通裡解放出來。",
                caution: "可協助不等於保證一定有位，越早提出越有機會。",
                relatedSectionId: "deck-guide"
            },
            {
                title: "Lounge 的正確打開方式：下午茶、中轉站、偶遇角色",
                icon: "fa-solid fa-martini-glass-citrus",
                sourceType: "concierge",
                whenToUse: "午後空檔、晚餐前、看秀後與全家需要安靜休息時。",
                action: "把 Lounge 視為整天可切換節奏的基地：07:00–10:30 晨間輕食、11:00–14:30 午間補給、15:00–16:30 下午茶、17:00–20:00 晚間輕食、20:30–22:00 甜點收尾；它最大的價值是舒服與安靜，不是取代所有餐食。",
                tripFit: "這種『進可補給、退可躲人潮』的空間，很適合兩家同行時當作每日中轉站。",
                caution: "基本飲品幾乎全天可用，17:00–22:00 通常還有免費 beer / wine / cocktails；但早晨部分 specialty beverages 可能另外計費，不同船與時段供應內容也會有差異。",
                relatedSectionId: "deck-guide"
            },
            {
                title: "禮賓每日供應與酒水時段怎麼用",
                icon: "fa-solid fa-wine-glass",
                sourceType: "concierge",
                whenToUse: "Day 1 報到後先熟悉一次；之後每晚晚餐前後固定回來。",
                action: "把 Lounge 當全天中轉站：17:00–22:00 酒水時段先補位、再去晚餐或晚間活動，回程再做一次短休整隊。",
                tripFit: "兩家同行時，先在 Lounge 同步全員狀態再移動，通常比邊走邊等人更省力。",
                caution: "每日供應內容與酒水項目會依當航次與現場營運調整，先看當天告示與服務人員說明。",
                relatedSectionId: "deck-guide"
            },
            {
                title: "24 小時網路方案不要太早開",
                icon: "fa-solid fa-wifi",
                sourceType: "concierge",
                whenToUse: "登船後第一次真的需要正式上網前。",
                action: "每位房客通常都有一台裝置的 24 小時網路權益；先連上 DCL-GUEST，再用瀏覽器進 login.com 完成註冊，需要時再啟用就好。",
                tripFit: "這趟不必一上船就急著把網路開掉，真正要查資料、傳照片或長時間聯絡時再啟用，會比白白浪費在登船日更有感。",
                caution: "通知上的 continuous 比較安全的理解是『一旦啟用就會連續倒數 24 小時』，先不要假設能拆成全航程分段使用。",
                relatedSectionId: ""
            },
            {
                title: "劇院優先入場 SOP",
                icon: "fa-solid fa-door-open",
                sourceType: "concierge",
                whenToUse: "每次主秀當晚、開演前 40 分鐘。",
                action: "全員先到 Deck 5 船頭（forward）集合點，身上帶好金色房卡與 Navigator App 預訂證明，再一起走優先入場流程；實際集合細節仍以當晚禮賓通知信為主。",
                tripFit: "把集合點、時間與證明文件固定成 SOP，最能避免孩子累了時還要臨場找資料。",
                caution: "若錯過集合或壓線到場，優先通道可能關閉並改回一般入場；演前 30 分鐘後通常不建議再壓線。現場常可拿免費新鮮爆米花；若想兼顧舞台與左右螢幕，社群常把第二區第一排視為很穩的視野選擇，但仍以當晚現場座位狀況為準。",
                relatedSectionId: "entertainment"
            }
        ]
    },
    {
        id: "stateroom-family",
        label: "客艙與親子神隊友",
        intro: "這裡放的是最容易被忽略、但一旦做對就能讓全家舒服很多的客艙與孩子攻略。",
        items: [
            {
                title: "RFID 手環的進階用法：整天戴、最後記得還",
                icon: "fa-solid fa-id-badge",
                sourceType: "official",
                whenToUse: "Day 1 領取手環後到最後一次使用兒童俱樂部前。",
                action: "登船前可先在 App 完成兒童俱樂部基本註冊，上船後再到俱樂部入口或指定註冊區報到領手環。手環防水，可以讓孩子整天戴著去跑活動和玩水；若暫時不進俱樂部，也可以先拿下。等到最後一次參加俱樂部或離船前，再記得一併歸還。",
                tripFit: "你們的重點不是只拿到手環，而是讓接送與定位流程一路維持順暢，不必每天重新適應。",
                caution: "若遺失可能會收費，但各船型金額可能不同，Adventure 仍以船上實際公告為準。",
                relatedSectionId: "facilities"
            },
            {
                title: "磁吸掛勾很值得，它會直接提升客艙秩序感",
                icon: "fa-solid fa-magnet",
                sourceType: "community",
                whenToUse: "一進房整理泳衣、lanyard 和濕物時。",
                action: "艙壁是金屬，帶幾顆小而有力的磁吸掛勾，就能把泳衣、掛牌與小包分流掛好，不用全堆在椅子或沙發上。",
                tripFit: "多孩家庭最怕房內一濕就亂，掛起來比疊起來更省心。",
                caution: "挑強力但小顆的款式就好，太大太重反而占空間。",
                relatedSectionId: "checklist"
            },
            {
                title: "睡眠與暈船備援包，別等孩子不舒服才開始補救",
                icon: "fa-solid fa-moon",
                sourceType: "community",
                whenToUse: "出發前打包藥品與睡前用品時。",
                action: "白噪音以手機 App 最穩，暈船備援則把薑糖、薄鹽餅乾、手環或藥物先放進固定小包；若孩子還小，也可考慮帶輕便防水小凳應付偏高的浴室馬桶。",
                tripFit: "這種看起來不起眼的小包，往往比多帶一套衣服更能救 Day 2、Day 3 的狀態。",
                caution: "若要攜帶額外裝置型白噪音機，建議放隨身行李並預留人工檢視空間；孩子在走道小斜坡與高馬桶周邊也要多提醒。",
                relatedSectionId: ""
            },
            {
                title: "房內與走廊的實用細節，比你以為的更有用",
                icon: "fa-solid fa-bed",
                sourceType: "community",
                whenToUse: "一進房到第一晚安頓下來的那段時間。",
                action: "房內可善用床底收納行李，衣櫃衣架數量不少，水龍頭的水通常可直接喝；吹風機雖堪用，但要持續按壓才會運作，保險箱則是先輸入密碼再轉把手，和一般飯店習慣剛好相反。走廊地毯上的米奇頭方向固定朝船頭，也能拿來快速辨認 FWD。",
                tripFit: "這些小細節會直接決定房間是不是好整理、孩子回房後能不能快速補水與收心。",
                caution: "Wi-Fi 整體可用，但影音平台支援度不一定一致，別把它當成完整串流網路來安排；若不買 Wi-Fi、只連船內網路時，iMessage、WhatsApp、LINE 的文字訊息通常可先用，但圖片、影片與完整串流仍不穩。餐廳區域收訊可能偏弱，自備漫遊網卡 Day 1 也不一定立刻有訊號，常要等離岸後再恢復得比較穩。",
                relatedSectionId: "tips"
            },
            {
                title: "洗衣時間抓在晚餐或看秀時，最不打擾主行程",
                icon: "fa-solid fa-shirt",
                sourceType: "community",
                whenToUse: "海上日出現濕衣、泳衣堆積時。",
                action: "把自助洗衣安排在大家進晚餐或看表演的時段，並用 App 先看機台狀態，再決定要不要立刻去處理。",
                tripFit: "這能把家務感壓到最低，不會占掉本來屬於白天玩樂的黃金時間。",
                caution: "不要等到最後一晚才想一次洗完，否則容易遇到他人也在收尾整理。",
                relatedSectionId: "tips"
            }
        ]
    },
    {
        id: "last-night",
        label: "最後一晚與撤船",
        intro: "這組不是重講下船流程，而是把最後一晚真正容易手忙腳亂的決策先幫你排好。",
        items: [
            {
                title: "最後一晚先做一個『孩子晨間包』",
                icon: "fa-solid fa-bag-shopping",
                sourceType: "community",
                whenToUse: "大型行李要放門外之前。",
                action: "把隔天早餐後會用到的證件、外套、濕紙巾、簡單點心、孩子換洗衣物與機場路上要用的東西先留在手提包，別等行李 22:00 外放後才發現還需要翻大箱。",
                tripFit: "這會讓你們下船當天的節奏從容很多，不會在大件行李已經外放後才發現重要物品還在箱內。",
                caution: "孩子最常臨時需要的是外套、零食和小玩具，這三樣特別值得先留下。",
                relatedSectionId: "tips"
            },
            {
                title: "撤船日早餐與房務供應，要先分清楚",
                icon: "fa-solid fa-utensils",
                sourceType: "community",
                whenToUse: "最後一晚安排隔天早上的節奏時。",
                action: "把撤船日早餐預設成餐廳節奏，若怕孩子起床後先餓，可以前一晚就留簡單點心在房內；若行李交給 DCL 帶下船，也把港口找行李和轉車時間一起算進去。",
                tripFit: "你們回程航班時間很充裕，真正重要的是早上不要餓著、也不要趕著找吃的。",
                caution: "撤船日的房務供應常和一般早晨不同，別用平常的節奏去預期；港口現場若行李多，也可再看要不要用推車、Grab 或 limo。",
                relatedSectionId: "checkin"
            },
            {
                title: "額外小費信封是感謝工具，不用變成床頭壓力",
                icon: "fa-solid fa-envelope-open-text",
                sourceType: "community",
                whenToUse: "最後一晚想額外謝謝服務人員時。",
                action: "基本小費如果已經在船費或帳單內處理好，就不用再床頭分散留現金；若特別想感謝某位房務或餐飲人員，再把現金放進信封或當面交給對方即可。",
                tripFit: "這能把『想表達謝意』和『怕自己漏給或重複給』拆開來看，心情會輕鬆很多。",
                caution: "先確認你們的每日小費是否已經預付，再決定額外加給，避免誤會成基本小費還沒處理。",
                relatedSectionId: "tips"
            },
            {
                title: "密封汽水能自帶，酒精規則則一定要最後再核對",
                icon: "fa-solid fa-wine-bottle",
                sourceType: "official",
                whenToUse: "最後確認手提行李與陽台宵夜計畫時。",
                action: "若家人有固定想喝的口味，可以把未開封汽水放進手提行李；至於酒精攜帶量、品項與規則，出發前最後再以官網最新條款確認。",
                tripFit: "這能讓房內與陽台的補給更自由，但又不必為了少量需求去買整套飲料方案。",
                caution: "酒精政策時效性高，不要照其他船或舊攻略的經驗直接套用到 2027/1/25 這趟。",
                relatedSectionId: "tips"
            }
        ]
    }
];
