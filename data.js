const cruiseSchedule = [
    {
        id: "day1",
        tabTitle: "Day 1 登船",
        dateTitle: "🌟 Day 1｜登船日",
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
                        tag: "禮賓優先",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>目的：</strong>用禮賓優先登船避開人潮、保留下午完整活動時間",
                            "<strong>提醒：</strong>留意禮賓迎賓小禮與優先動線"
                        ]
                    },
                    {
                        time: "11:45–12:30",
                        title: "坐下式午餐（主餐廳）",
                        tag: "精緻午餐",
                        tagClass: "tag-food",
                        desc: [
                            "<strong>建議：</strong>直接前往 Pixar Market 或 Enchanted Summer",
                            "<strong>用餐必確認：</strong> 晚餐第一時段（First Seating）、輪替餐廳順序"
                        ]
                    },
                    {
                        time: "12:30–13:10",
                        title: "禮賓酒廊報到 (Deck 17)",
                        tag: "管家協助",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>地點：</strong>Concierge Lounge（阿拉丁主題）",
                            "<strong>請管家協助確認：</strong>出發前 130 天代訂的 Royal Meet & Greet（免費皇家見面會）時段",
                            "當晚 Walt Disney Theatre 主秀「免排隊提前入座」安排"
                        ]
                    }
                ]
            },
            {
                name: "下午｜Open House 放最前＋全家熟悉核心動線＋登船日玩水",
                events: [
                    {
                        time: "13:20–14:10",
                        title: "Disney Oceaneer Club Open House (Deck 8)",
                        tag: "全員參加",
                        tagClass: "tag-kids",
                        desc: [
                            "全家一起參加：澤澤、彤妹先熟悉四大沉浸區域",
                            "<strong>必做設定：</strong>取孩密語"
                        ]
                    },
                    {
                        time: "14:20–15:00",
                        title: "全家熟悉郵輪核心動線",
                        tag: "核心動線",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>Deck 7：</strong>帶小寶看 Edge 隱藏入口（舊京山街道商店立面）、了解 大英雄天團電玩樂場",
                            "<strong>Deck 10/11：</strong>確認 Imagination Garden 與花園舞台位置，到花園舞台看表演"
                        ]
                    },
                    {
                        time: "15:00–16:00",
                        title: "Toy Story Pool／Splash Pad (Deck 17)",
                        tag: "玩水暖身",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>目的：</strong>登船日通常人少，適合暖身玩水",
                            "<strong>點心補給：</strong>披薩星球、吱吱冰飲",
                            "<strong>Concierge Sundeck & Pool (Deck 19)：</strong>讓孩子認識禮賓專屬區域；大人先鎖定躺椅與傍晚酒水動線"
                        ]
                    },
                    {
                        time: "16:00–16:30",
                        title: "強制旅客集合演練 (Assembly Drill)",
                        tag: "強制參加",
                        tagClass: "tag-alert",
                        desc: [
                            "全船旅客必須參加的安全演習",
                            "時間是 4:00 PM–4:30 PM，務必準時"
                        ]
                    }
                ]
            },
            {
                name: "晚間｜第一輪晚餐＋首日晚秀＋宵夜收尾",
                events: [
                    {
                        time: "17:15–19:00",
                        title: "第一時段晚餐（輪替餐廳）",
                        tag: "精緻晚餐",
                        tagClass: "tag-food",
                        desc: [
                            "<strong>提醒：</strong>專屬服務員開始跟隨你們",
                            "<strong>建議：</strong>這晚拍全家正式照片"
                        ]
                    },
                    {
                        time: "19:30–21:00",
                        title: "Walt Disney Theatre 首日晚間大秀 (Deck 5–7)",
                        tag: "魔法之夜",
                        tagClass: "tag-highlight",
                        desc: [
                            "享受百老匯級別的開場大秀"
                        ]
                    },
                    {
                        time: "21:05–21:40",
                        title: "Concierge Lounge 宵夜與收尾 (Deck 17)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "返回酒廊享用宵夜，結束完美的第一天"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "day2",
        tabTitle: "Day 2 海上",
        dateTitle: "🦸 Day 2｜海上冒險日 (Marvel 主題)",
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
                        tag: "朝食補充",
                        tagClass: "tag-food",
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
                        time: "09:00–10:40",
                        title: "Marvel Landing (Deck 18/19)",
                        tag: "激戰區",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>主攻：</strong>Ironcycle Test Run（鋼鐵人測試車）",
                            "<strong>接著：</strong>皮姆量子賽車、格魯特星系旋轉"
                        ]
                    },
                    {
                        time: "10:45–11:20",
                        title: "Woody’s Wide Slide (Deck 17/19)",
                        tag: "滑水道",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>目的：</strong>趁早排隊、避免後段失控"
                        ]
                    },
                    {
                        time: "11:25–12:00",
                        title: "Concierge Sundeck & Pool (Deck 19)",
                        tag: "禮賓放鬆",
                        tagClass: "tag-concierge",
                        desc: [
                            "休息補給與放鬆"
                        ]
                    }
                ]
            },
            {
                name: "中午",
                events: [
                    {
                        time: "12:10–13:10",
                        title: "午餐：Pixar Market (Deck 17)",
                        tag: "精緻午餐",
                        tagClass: "tag-food",
                        desc: [
                            "享用披薩、漢堡等快餐美味"
                        ]
                    }
                ]
            },
            {
                name: "下午｜街區電玩＋電影／購物＋下午茶整理狀態",
                events: [
                    {
                        time: "13:20–14:10",
                        title: "Disney Imagination Garden (Deck 10/11)",
                        tag: "花園表演",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>觀賞：</strong>Avengers Assemble! 特技秀／或 Duffy 大型派對（依當日安排擇一）"
                        ]
                    },
                    {
                        time: "14:20–15:10",
                        title: "舊京山街道 (Deck 7)",
                        tag: "街區電玩",
                        tagClass: "tag-kids",
                        desc: [
                            "<strong>小寶：</strong>進 Edge 交朋友",
                            "<strong>全家：</strong>刷房卡免費玩 大英雄天團電玩樂場（體感雙人遊戲）"
                        ]
                    },
                    {
                        time: "15:15–16:20",
                        title: "Baymax Cinemas 影片／或採買 (Deck 6/7)",
                        tag: "採買與電影",
                        tagClass: "tag-highlight",
                        desc: [
                            "看短片或是到商店區集中採買"
                        ]
                    },
                    {
                        time: "16:25–17:10",
                        title: "Concierge Lounge 下午茶 (Deck 17)",
                        tag: "禮賓下午茶",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>下午茶補給：</strong>三明治、司康",
                            "<strong>目的：</strong>收整晚餐前狀態"
                        ]
                    }
                ]
            },
            {
                name: "晚間",
                events: [
                    {
                        time: "17:15–19:00",
                        title: "輪替餐廳晚餐",
                        tag: "精緻晚餐",
                        tagClass: "tag-food",
                        desc: [
                            "享用第二晚的輪替餐廳主題餐飲"
                        ]
                    },
                    {
                        time: "19:30–21:15",
                        title: "劇院主秀 (Deck 5–7)",
                        tag: "魔法之夜",
                        tagClass: "tag-highlight",
                        desc: [
                            "觀賞今晚的重頭戲"
                        ]
                    },
                    {
                        time: "21:20–21:50",
                        title: "Concierge Lounge 收尾 (Deck 17)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "返回酒廊享用宵夜，結束第二天"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "day3",
        tabTitle: "Day 3 水域",
        dateTitle: "💦 Day 3｜水域與皇家日",
        goals: [
            "水域玩足＋完成公主見面會＋大人禮賓放鬆時間要確保到"
        ],
        periods: [
            {
                name: "上午｜水域集中",
                events: [
                    {
                        time: "09:00–10:40",
                        title: "Wayfinder Bay (Deck 17 船尾)",
                        tag: "海洋奇緣",
                        tagClass: "tag-highlight",
                        desc: [
                            "海洋奇緣主題露天泳池＋無敵海景",
                            "<strong>可順逛：</strong>Discovery Reef（買烏蘇拉珍珠奶茶）"
                        ]
                    },
                    {
                        time: "10:50–11:40",
                        title: "Toy Story Pool／Splash Pad (Deck 17)",
                        tag: "水上活動",
                        tagClass: "tag-highlight",
                        desc: [
                            "把握人少時刻盡情玩水"
                        ]
                    },
                    {
                        time: "11:45–12:10",
                        title: "Concierge Lounge 首戰收尾",
                        tag: "禮賓補給",
                        tagClass: "tag-concierge",
                        desc: [
                            "回酒廊補水與享用小點心"
                        ]
                    }
                ]
            },
            {
                name: "中午",
                events: [
                    {
                        time: "12:10–13:10",
                        title: "午餐",
                        tag: "精緻午餐",
                        tagClass: "tag-food",
                        desc: [
                            "選擇喜歡的主題餐廳或快餐區享用午飯"
                        ]
                    }
                ]
            },
            {
                name: "下午｜Oceaneer 托育＋大人放鬆＋皇家見面會",
                events: [
                    {
                        time: "13:20–14:20",
                        title: "Disney Oceaneer Club (Deck 8)",
                        tag: "分流活動",
                        tagClass: "tag-kids",
                        desc: [
                            "<strong>澤澤、彤妹：</strong>完整參與互動關卡",
                            "<strong>大人專屬時間（擇一或分流）：</strong> Spellbound（Deck 6黑魔法酒吧） 或 Opulence Spa（水療桑拿短時段）",
                            "<strong>小寶：</strong>Deck 7 看電影或玩街機（自由活動）"
                        ]
                    },
                    {
                        time: "14:40–15:30",
                        title: "Royal Meet & Greet 皇家見面會",
                        tag: "核心特權",
                        tagClass: "tag-alert",
                        desc: [
                            "<strong>免費皇家公主見面會：</strong>由禮賓預約完成的最重要合影時刻！"
                        ]
                    },
                    {
                        time: "15:40–16:30",
                        title: "Concierge Sundeck & Pool (Deck 19)",
                        tag: "禮賓放鬆",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>目的：</strong>最後一次長時間使用專屬甲板",
                            "<strong>提醒：</strong>傍晚開始供應啤酒、葡萄酒、香檳暢飲！"
                        ]
                    }
                ]
            },
            {
                name: "晚間｜晚餐＋海上派對煙火＋最後宵夜",
                events: [
                    {
                        time: "17:15–19:00",
                        title: "第一時段晚餐（輪替餐廳）",
                        tag: "精緻晚餐",
                        tagClass: "tag-food",
                        desc: [
                            "若輪到 Animator's Palate：準備互動驚喜（手繪草圖變動畫）"
                        ]
                    },
                    {
                        time: "21:00–22:00",
                        title: "Disney Imagination Garden (Deck 10/11)",
                        tag: "花園派對",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>觀賞：</strong>Avengers Assemble! 特技秀／或 Duffy 大型派對（依當日安排擇一）"
                        ]
                    },
                    {
                        time: "22:00–23:00",
                        title: "The Lion King: Celebration in the Sky",
                        tag: "唯一煙火",
                        tagClass: "tag-alert",
                        desc: [
                            "甲板派對與<strong>獅子王主題全球獨家海上煙火</strong>！"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "day4",
        tabTitle: "Day 4 下船",
        dateTitle: "🧳 Day 4｜依依不捨下船日",
        goals: [
            "優雅吃完早餐，憑禮賓通道安靜撤離，銜接星宇航空回程。"
        ],
        periods: [
            {
                name: "早上｜禮賓節奏",
                events: [
                    {
                        time: "07:00–08:00",
                        title: "Concierge Lounge 早餐 (Deck 17)",
                        tag: "最後享受",
                        tagClass: "tag-concierge",
                        desc: [
                            "避開人潮，在酒廊安靜從容地享用早餐"
                        ]
                    },
                    {
                        time: "08:00–09:00",
                        title: "禮賓優先下船通道",
                        tag: "極速通關",
                        tagClass: "tag-alert",
                        desc: [
                            "憑專屬通道下船，順暢通關，無壓力前往樟宜機場",
                            "別忘了登船前三天與下船當日都要填寫 SGAC 入境卡！"
                        ]
                    }
                ]
            }
        ]
    }
];
