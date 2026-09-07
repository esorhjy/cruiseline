const cruiseSchedule = [
    {
        id: "day1",
        tabTitle: "Day 1 登船",
        dateTitle: "🌟 Day 1｜登船日（更早登船＋全家一起熟悉郵輪＋Open House）",
        goals: [
            "1/25 依核准報到時間登船；先禮賓接待、全家一次 Open House，再熟悉動線",
            "家庭草案，非正式節目表：晚餐與主秀優先 → 已確認預約 → 可替換活動；安全演練不可與玩水重疊"
        ],
        periods: [
            {
                name: "早／中午｜提早登船＋Open House 優先＋禮賓報到",
                events: [
                    {
                        id: "search-schedule-day1-0-0",
                        bindingKey: "day1:0:0",
                        planKind: "confirm",
                        time: "10:30–11:30",
                        title: "抵達碼頭、完成報到",
                        tag: "登船流程",
                        tagClass: "tag-boarding",
                        desc: [
                            "<strong>依確認通知：</strong>報到與交通時間尚須核對，不把合作飯店接送或提早登船當作已訂妥。",
                            "<strong>提醒：</strong>QR code 先截圖或列印；七人與行李的接送車容量、集合點及行李處理方式要先確認。",
                            "<strong>留意：</strong>若另訂 DCL 接駁，依該筆接駁確認信辦理；否則按自行安排的交通與核准報到時間抵達。",
                            "<strong>拍照註記：</strong>登船入口與完成報到前後通常就是第一組正式合照時機，若重視開場照，這段先把全家狀態整理好最省力。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-0-1",
                        bindingKey: "day1:0:1",
                        planKind: "flexible",
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
                        id: "search-schedule-day1-0-2",
                        bindingKey: "day1:0:2",
                        planKind: "confirm",
                        time: "12:30–13:00",
                        title: "禮賓酒廊報到：Concierge Lounge (Deck 17)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>請一併確認：</strong>七人同桌、第一時段（First Seating）、實際輪替餐廳與桌號；保留角色晚宴與動畫互動體驗，爭取較好觀看視線。",
                            "<strong>請管家協助確認：</strong>",
                            "出發前 130 天代訂的 Royal Meet & Greet（免費皇家見面會）時段",
                            "當晚 Walt Disney Theatre 分配場次與禮賓提前入場通知；先排除晚餐衝突，不把禮賓視為所有設施的快速通關。",
                            "<strong>登船補位：</strong>若先被引導回房卻還沒拿到房卡，先看門口信封，再不行就去 Deck 6 Mid 的 Guest Services。",
                            "<strong>登船預約：</strong>先取得 Lounge 角色時刻表，再查看 Baymax 杯麵與 Marvel 設施的預約／候位；杯麵需在舊京山街道登船後預約。",
                            "<strong>座位確認：</strong>詢問 Deck 17 船頭左舷指定吸菸區邊界、無菸座位與日光甲板路線；沒有證據能判定 17108 受影響。"
                        ]
                    }
                ]
            },
            {
                name: "下午｜一次全家 Open House＋熟悉動線＋安全演練",
                events: [
                    {
                        id: "search-schedule-day1-1-0",
                        bindingKey: "day1:1:0",
                        planKind: "confirm",
                        time: "依 Open House 公告",
                        title: "Disney Oceaneer Club Open House (Deck 8)",
                        tag: "孩子專屬",
                        tagClass: "tag-kids",
                        desc: [
                            "全家只安排一次 Open House：小寶 11、澤澤 9、彤妹 8 歲一起熟悉空間。正式活動限 3–10 歲；Open House 是全齡家庭開放，不是託管時段。",
                            "<strong>必做設定：</strong>取孩密語",
                            "<strong>登船優先任務：</strong>先到 Deck 8 FWD 完成報到、領手環，把孩子接送機制一次設定好，後面行程才真的能放手。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-1-1",
                        bindingKey: "day1:1:1",
                        planKind: "flexible",
                        time: "14:00–15:00",
                        title: "全家熟悉郵輪核心動線 (Deck 8 → 7 → 10/11 → 17)",
                        tag: "熟悉郵輪",
                        tagClass: "tag-explore",
                        desc: [
                            "<strong>Deck 7：</strong>帶小寶看 Edge 隱藏入口、了解 大英雄天團電玩樂場",
                            "<strong>Deck 10/11：</strong>確認 Imagination Garden 位置，到花園舞台看表演",
                            "<strong>拍照註記：</strong>Atrium 與主背景布景點也值得一起認位置，之後若要補正式照或 Magic Shots，才不會每次都臨時找點。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-1-2",
                        bindingKey: "day1:1:2",
                        planKind: "flexible",
                        time: "演練外的彈性空檔",
                        title: "Toy Story Pool／Splash Pad (Deck 17)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "<strong>可取消備案：</strong>只有安全演練前後足夠換裝與集合的空檔才玩水，否則移到海上日。",
                            "<strong>共同主線：</strong>Sunnyside Pool 或禮賓泳池，三童都未滿 12 歲，安排成人監督。Flying Saucer 限 4–8 歲，只讓彤妹短暫分流。",
                            "<strong>點心補給：</strong>披薩星球、吱吱冰飲",
                            "<strong>Woody and Jessie’s Wild Slides：</strong>赤腳至少 122 公分；不穿水鞋、不帶浮潛面罩或鬆散物品，依現場量測。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-1-3",
                        bindingKey: "day1:1:3",
                        planKind: "fixed",
                        time: "依當天集合通知",
                        title: "Mandatory Guest Assembly Drill (安全演練)",
                        tag: "安全演練",
                        tagClass: "tag-safety",
                        desc: [
                            "全員必到；先確定集合時間與路線，再決定是否有玩水空檔，不以這份家庭草案代替通知。",
                            "房卡上會寫集合區號，若不確定位置請提早問工作人員。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-1-4",
                        bindingKey: "day1:1:4",
                        planKind: "flexible",
                        time: "依啟航公告／不衝突才去",
                        title: "到甲板上聽啟航汽笛",
                        tag: "啟航儀式",
                        tagClass: "tag-highlight",
                        desc: [
                            "啟航汽笛與甲板活動依當天安排；若與第一時段晚餐重疊，優先保留晚餐。",
                            "離汽笛太近會非常大聲，想體驗氣氛但不必硬卡最近的位置。"
                        ]
                    }
                ]
            },
            {
                name: "晚間｜第一輪晚餐＋首日晚秀＋宵夜收尾",
                events: [
                    {
                        id: "search-schedule-day1-2-0",
                        bindingKey: "day1:2:0",
                        planKind: "fixed",
                        time: "第一時段／依分配",
                        title: "第一時段晚餐：依實際輪替餐廳",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "三晚保留三種輪替體驗，不預先指定每天餐廳；Hollywood Spotlight Club 與 Navigator’s Club 屬同類分流，不能預設都會排到。",
                            "若輪到 Animator's Palate：準備互動驚喜（手繪草圖變動畫）",
                            "<strong>提醒：</strong>專屬服務員開始跟隨你們",
                            "<strong>拍照註記：</strong>晚餐前後通常是最穩的正式全家照窗口，若重視餐廳合照，記得替這段多留 5–10 分鐘。",
                            "<strong>建議：</strong>這晚拍全家正式照片",
                            "<strong>First Seating 提醒：</strong>若晚餐互動或餐廳秀拉長，別吃到最後一刻，否則還是會壓縮後面劇院排隊時間。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-2-1",
                        bindingKey: "day1:2:1",
                        planKind: "fixed",
                        time: "依 App 分配主秀",
                        title: "Walt Disney Theatre 首日晚間大秀 (Deck 5–7)",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "《Remember》與《Disney Seas the Adventure》按正式分配日期觀看，不預設首晚是哪一場。",
                            "先核對晚餐與主秀，再請禮賓確認集合點、提前入場截止與所需證明。",
                            "舊航次通知的演前 40 分鐘集合／30 分鐘截止只供風險試算；19:00 秀的 18:20 集合會與 17:45 晚餐衝突，不照搬。"
                        ]
                    },
                    {
                        id: "search-schedule-day1-2-2",
                        bindingKey: "day1:2:2",
                        planKind: "flexible",
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
            "1/26 先嘗試 Ironcycle、符合資格的滑水道；禮賓甲板用餐或休息，保留重要主秀",
            "皇家見面會依 App 確認時段插入；今天完成 1/28 再入境的 SGAC，最遲明天複核"
        ],
        periods: [
            {
                name: "早上｜海景樣台房早餐",
                events: [
                    {
                        id: "search-schedule-day2-0-0",
                        bindingKey: "day2:0:0",
                        planKind: "flexible",
                        time: "07:00–09:00",
                        title: "早餐時間",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "可在 17108 陽台安排一次 Room Service 早餐或休息餐點，先向禮賓確認菜單、供應與送達時間。",
                            "免配送費不代表所有餐點飲料免費；有預約活動的早晨要預留等餐緩衝。",
                            "若仍想吃主餐，再視精神和時間補正式早餐。"
                        ]
                    }
                ]
            },
            {
                name: "上午｜同樓層連打（動線最順）",
                events: [
                    {
                        id: "search-schedule-day2-1-0",
                        bindingKey: "day2:1:0",
                        planKind: "confirm",
                        time: "09:00–09:30",
                        title: "Marvel Landing (Deck 18/19)",
                        tag: "刺激設施",
                        tagClass: "tag-thrill",
                        desc: [
                            "<strong>主攻：Ironcycle Test Run（鋼鐵人測試車）</strong>",
                            "接著：Pym Quantum Racers 皮姆量子賽車、Groot Galaxy Spin 格魯特星系旋轉；依現場資格與 Navigator 的預約／免預約時段。",
                            "Ironcycle 在 Day 1 或 Day 2 就觀察可玩機會，不只留最後一天；停機就改行程，接近晚餐、主秀或孩子疲累就停止排隊。"
                        ]
                    },
                    {
                        id: "search-schedule-day2-1-1",
                        bindingKey: "day2:1:1",
                        planKind: "flexible",
                        time: "09:30–10:30",
                        title: "Infinity Pool & Bar (Deck 18)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "Infinity Pool 官方目前未設年齡門檻，未滿 12 歲需成人監督；實際仍核對現場時段與告示，不逕稱成人限定。",
                            "Deck 18 船尾左舷 Infinity Pool Sundeck 有指定吸菸區，休息座位與路線先避開該區。"
                        ]
                    },
                    {
                        id: "search-schedule-day2-1-2",
                        bindingKey: "day2:1:2",
                        planKind: "flexible",
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
                        id: "search-schedule-day2-2-0",
                        bindingKey: "day2:2:0",
                        planKind: "flexible",
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
                        id: "search-schedule-day2-3-0",
                        bindingKey: "day2:3:0",
                        planKind: "flexible",
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
                        id: "search-schedule-day2-3-1",
                        bindingKey: "day2:3:1",
                        planKind: "flexible",
                        time: "14:00–15:00",
                        title: "小寶可選 Edge；其他人家庭備案",
                        tag: "孩子專屬",
                        tagClass: "tag-kids",
                        desc: [
                            "Edge 限 11–14 歲，小寶 11 歲符合；澤澤 9 歲、彤妹 8 歲不能當作一般參加者。",
                            "想三人一起就改 Big Hero Arcade 或 D Lounge 家庭活動；Royal Gathering 若確認在此時段，優先調整這個彈性空檔。"
                        ]
                    },
                    {
                        id: "search-schedule-day2-3-2",
                        bindingKey: "day2:3:2",
                        planKind: "flexible",
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
                        id: "search-schedule-day2-3-3",
                        bindingKey: "day2:3:3",
                        planKind: "flexible",
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
                        id: "search-schedule-day2-4-0",
                        bindingKey: "day2:4:0",
                        planKind: "fixed",
                        time: "第一時段／依分配",
                        title: "第一時段晚餐：依當日餐廳與桌號",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "保留角色晚宴與動畫互動餐廳體驗，不要求三晚同時排 Hollywood 與 Navigator’s。",
                            "<strong>拍照註記：</strong>若這晚想補正式餐廳照，最好在進場或甜點前留一個短空檔，不要把拍照擠到衝秀的最後幾分鐘。",
                            "<strong>First Seating 提醒：</strong>若晚餐互動或餐廳秀拉長，別吃到最後一刻，否則還是會壓縮後面劇院排隊時間。"
                        ]
                    },
                    {
                        id: "search-schedule-day2-4-1",
                        bindingKey: "day2:4:1",
                        planKind: "fixed",
                        time: "依 App 分配／開放場次",
                        title: "重要主秀：Remember／Disney Seas the Adventure",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "以實際分配的一場重要演出為當晚主線；其他角色或設施不壓縮主秀入場。",
                            "禮賓集合時間以當晚通知為準，先和晚餐一起核對，不把舊航次 40／30 分鐘規則當保證。"
                        ]
                    },
                    {
                        id: "search-schedule-day2-4-2",
                        bindingKey: "day2:4:2",
                        planKind: "flexible",
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
        dateTitle: "💦 Day 3｜海上日（三童玩水＋Big Hero＋家庭備案＋提早收行李）",
        goals: [
            "1/27 三童共同玩水，Big Hero 遊戲與禮賓角色／D Lounge 擇一；保留補玩空間",
            "晚餐與主秀前停止長隊；下午先收行李、複核七人 1/28 SGAC，不把煙火固定在今晚"
        ],
        periods: [
            {
                name: "早上｜早餐",
                events: [
                    {
                        id: "search-schedule-day3-0-0",
                        bindingKey: "day3:0:0",
                        planKind: "flexible",
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
                        id: "search-schedule-day3-1-0",
                        bindingKey: "day3:1:0",
                        planKind: "flexible",
                        time: "08:00–10:00",
                        title: "Toy Story Pool / Splash Pad (Deck 17)",
                        tag: "玩水活動",
                        tagClass: "tag-water",
                        desc: [
                            "<strong>共同主線：</strong>Sunnyside Pool 或 Concierge Pool；三童都未滿 12 歲，指定成人監督，不以救生員代替家長。",
                            "<strong>滑水道：</strong>Woody and Jessie’s Wild Slides 赤腳至少 122 公分；Flying Saucer 限 4–8 歲，只列彤妹有興趣時短暫分流。"
                        ]
                    },
                    {
                        id: "search-schedule-day3-1-1",
                        bindingKey: "day3:1:1",
                        planKind: "flexible",
                        time: "10:00–11:00",
                        title: "Opulence Spa & Fitness Center (Deck 18)",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "<strong>大人可選：</strong>Spa 或健身只放在已安排另一位成人照顧孩子的空檔；療程需確認預約與費用。",
                            "<strong>不拆隊也可以：</strong>改禮賓甲板用餐、休息或補玩，不為使用權益增加趕場。"
                        ]
                    }
                ]
            },
            {
                name: "中午",
                events: [
                    {
                        id: "search-schedule-day3-2-0",
                        bindingKey: "day3:2:0",
                        planKind: "flexible",
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
                name: "下午｜家庭活動與補玩空間＋提早收行李",
                events: [
                    {
                        id: "search-schedule-day3-3-0",
                        bindingKey: "day3:3:0",
                        planKind: "flexible",
                        time: "12:30–13:30",
                        title: "Big Hero Arcade／D Lounge 家庭活動",
                        tag: "亮點活動",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>三童一起：</strong>Big Hero Arcade 輪流遊戲，或依 Navigator 參加 D Lounge 舞蹈／家庭活動。",
                            "<strong>禮賓備案：</strong>依 Lounge 當天時刻表見角色；D Lounge 旅客曾遇米奇不代表每場都有。",
                            "<strong>皇家見面會：</strong>只依已確認時段插入任何一天，不固定 Day 3 下午；預約仍可能等待，後面不緊接不能遲到的主秀。"
                        ]
                    },
                    {
                        id: "search-schedule-day3-3-1",
                        bindingKey: "day3:3:1",
                        planKind: "flexible",
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
                        id: "search-schedule-day3-3-2",
                        bindingKey: "day3:3:2",
                        planKind: "flexible",
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
                        id: "search-schedule-day3-3-3",
                        bindingKey: "day3:3:3",
                        planKind: "fixed",
                        time: "16:30–17:00",
                        title: "回房間收拾行李",
                        tag: "準備返家",
                        tagClass: "tag-prepare",
                        desc: [
                            "先整理大件行李、核對房帳與七人 SGAC，外放時間依下船通知，不現在就把行李送出。",
                            "護照、藥品、隔日衣物、孩子晨間包與機場用品留隨身；通知司機實際下船集合安排。"
                        ]
                    }
                ]
            },
            {
                name: "晚間｜保留晚餐與主秀＋可選礁區散步",
                events: [
                    {
                        id: "search-schedule-day3-4-0",
                        bindingKey: "day3:4:0",
                        planKind: "fixed",
                        time: "第一時段／依分配",
                        title: "第一時段晚餐：完成三晚輪替體驗",
                        tag: "美食餐飲",
                        tagClass: "tag-dining",
                        desc: [
                            "最後一晚的輪替餐廳美食",
                            "<strong>拍照註記：</strong>最後一晚若還想補正式全家照，這是最穩的收尾窗口，晚餐前先拍會比散場後更從容。"
                        ]
                    },
                    {
                        id: "search-schedule-day3-4-1",
                        bindingKey: "day3:4:1",
                        planKind: "confirm",
                        time: "依當晚節目／有空才補",
                        title: "Disney Imagination Garden 表演 (Deck 10/11)",
                        tag: "精彩看秀",
                        tagClass: "tag-show",
                        desc: [
                            "優先當天分配主秀；有不衝突場次再補 Avengers Assemble! 或 Duffy and The Friend Ship，不因演出主題就保證角色合照。"
                        ]
                    },
                    {
                        id: "search-schedule-day3-4-2",
                        bindingKey: "day3:4:2",
                        planKind: "confirm",
                        time: "依煙火公告／無場次則散步",
                        title: "Celebration in the Sky／Discovery Reef 夜間散步",
                        tag: "絕美煙火",
                        tagClass: "tag-highlight",
                        desc: [
                            "<strong>煙火是跨日候選：</strong>The Lion King: Celebration in the Sky 依本航次公告，可能安排在其他晚上，不固定最後一晚或 22:30。",
                            "沒有煙火或孩子累了，就在 Disney Discovery Reef 探索礁區短散步，取代重複逛街。",
                            "<strong>提醒：</strong>以 Navigator 與現場公告為準，受天氣影響可調整；不要為等煙火延誤行李外放或睡眠。"
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
            "1/28 早餐、下船與前往機場依正式通知；SGAC 提前在 1/26–1/27 完成，接送時間不以優先通道推估"
        ],
        periods: [
            {
                name: "下船日｜禮賓優勢",
                events: [
                    {
                        id: "search-schedule-day4-0-0",
                        bindingKey: "day4:0:0",
                        planKind: "fixed",
                        time: "07:00–08:00",
                        title: "早餐＋最後確認手提物品",
                        tag: "禮賓專屬",
                        tagClass: "tag-concierge",
                        desc: [
                            "先確認下船日早餐供應與分配；想換餐廳先詢問，不以舊航次現場排隊經驗當保證。",
                            "再次檢查七人 SGAC 的抵達日是 1/28；第一次 1/24 入境申報不能代替本次。",
                            "<strong>提醒：</strong>船上通知與 App 仍值得先看；大型行李若前晚已外放，證件、外套、點心與孩子晨間用品要留在手提包，前晚也先核對房帳。"
                        ]
                    },
                    {
                        id: "search-schedule-day4-0-1",
                        bindingKey: "day4:0:1",
                        planKind: "fixed",
                        time: "依放行與交通確認",
                        title: "下船、找行李、前往樟宜機場",
                        tag: "極速通關",
                        tagClass: "tag-boarding",
                        desc: [
                            "禮賓優先通道（如 D Lounge）通常可更快下船，實際以船上通知為準。",
                            "若交給 DCL 帶行李，港口角色吊牌區不一定集中，請預留找行李時間。",
                            "若自己搬行李通常能略早下船，但時間差不必當成保證。",
                            "事先確認可容納七人與實際行李的接送，約定集合點、司機聯絡與延遲處理；接送時間依實際下船調整。"
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
            { id: "pay-full", text: "核對原船費付款與小費是否入帳（兩房各自驗收，不預設已付清）" },
            { id: "both-cabins-balance-202609", text: "高｜9 月禮賓窗口前核對兩房尾款：各家確認餘額、付款入帳與預約資格" },
            { id: "online-checkin", text: "出發前 40 天完成線上辦理登船手續" },
            { id: "concierge-10am", text: "核對本航次禮賓報到通知與抵達時間，不預設 10:00 一定可進港" },
            { id: "health-form", text: "登船前完成線上健康問卷填寫" },
            { id: "sgac-twice", text: "SG Arrival Card (SGAC) 需申報兩次：飛抵入境＋郵輪返抵下船入境" },
            { id: "sgac-arrival-20270124", text: "1/22–1/24｜七人提交 1/24 飛抵新加坡 SGAC，核對抵達日與收件確認" },
            { id: "sgac-return-20270128", text: "1/26–1/28｜七人重新提交 1/28 郵輪返抵 SGAC，計畫 1/26 完成、1/27 複核" },
            { id: "phone-timezone-off", text: "上船前關閉手機自動時區，船上以 Navigator App 時間為準" }
        ]
    },
    {
        category: "預約與購買",
        items: [
            { id: "royal-meet-130d", text: "130 天前向禮賓提出 Royal Gathering 需求，回 App 核對七人名單與確認時段，不只看回信" },
            { id: "dinner-table", text: "請禮賓協調七人同桌、第一時段、角色晚宴與動畫互動體驗、較好視線；以實際輪替為準" },
            { id: "photo-package", text: "付完全額後，先決定要不要預購拍照套裝；若要買，記得在出發前 3 天前完成調整" },
            { id: "wifi-buy", text: "確認是否需要額外 Wi-Fi；禮賓房每位房客含 24 小時連續網路，不必太早啟用" },
            { id: "kids-club-booking", text: "查看一次全家 Oceaneer Open House；正式活動 3–10 歲，不能把開放參觀當作託管" },
            { id: "onboard-reservations", text: "登船後先拿禮賓角色表，再查看 Baymax 杯麵、Ironcycle、Pym、Groot 預約或候位" },
            { id: "photo-two-families-scope", text: "兩家核對攝影套裝範圍：訂房連結不等於另一家獨照／家庭照全包；保留退款就先不下載" }
        ]
    },
    {
        category: "事先準備",
        items: [
            { id: "passport-expiry", text: "高｜核對七人護照效期及英文姓名：船票、機票、入境文件一致，符合官方有效期要求" },
            { id: "hotel-20270124", text: "高｜確認 1/24 新加坡住宿：訂房編號、七人入住名單／房型、取消期限及早餐" },
            { id: "other-family-flights", text: "高｜確認另一家航班：是否同行、抵達／回程時間與兩家集合方式" },
            { id: "ground-transfers-three-legs", text: "高｜安排機場→飯店、飯店→碼頭、碼頭→機場：車可裝七人與全部行李，訂明接送點" },
            { id: "cruise-insurance-review", text: "中高｜核對現有保單：郵輪、海外醫療、緊急運送、延誤／取消；未買 Disney 保險不等於無保障" },
            { id: "school-calendars", text: "中｜核對兩所學校寒假與返校日，三童出國日期不與必到校活動衝突" },
            { id: "children-barefoot-height", text: "先量三童赤腳身高：Wild Slides 至少 122 公分；Flying Saucer 4–8 歲僅彤妹符合" },
            { id: "personal-essentials", text: "攜帶個人備品 (牙刷、購物袋、防曬/曬後舒緩用品、幼童防水小凳、常備藥)" },
            { id: "door-decor", text: "中｜決定門貼採購與分工：確認磁吸材質、門面適用性及官方裝飾規則，避免重複購買" },
            { id: "swimsuit-bag", text: "先玩滑道：登船日將泳裝放於隨身包" },
            { id: "last-night-luggage", text: "1/27 下午先收行李，外放截止依通知；證件、藥品、隔日衣物與孩子晨間包留隨身" }
        ]
    }
];

// --- 甲板與表演設施資料 (Phase 5: Deck Guide) ---
const deckGuideData = [
    {
        id: "deck5",
        label: "Deck 5",
        title: "Deck 5｜劇院主秀與動畫晚餐節奏",
        theme: "劇院主秀、Animator’s Palate、散場後補逛周邊",
        tripFocus: "依 App 分配的晚餐與主秀安排動線，不預設《Remember》在首晚。",
        badges: ["主秀依 App", "先核對晚餐", "散場人潮"],
        facilities: [
            {
                id: "search-deck-deck5-0",
                bindingKey: "deck5:0",
                icon: "fa-solid fa-masks-theater",
                name: "Walt Disney Theatre",
                summary: "《Remember》與《Disney Seas the Adventure》的主劇院；依 App 分配或先到先入場場次觀看。",
                bestTime: "先確認當晚禮賓集合與截止時間，不照搬舊航次演前 40／30 分鐘規則。",
                tripUse: "保留三晚輪替晚餐與重要主秀，先解決衝突再安排角色與排隊。",
                highlight: true
            },
            {
                id: "search-deck-deck5-1",
                bindingKey: "deck5:1",
                icon: "fa-solid fa-palette",
                name: "Animator’s Palate",
                summary: "經典黑白變彩色互動餐廳，晚餐過程本身就是一場秀。",
                bestTime: "第一輪晚餐前 5–10 分鐘先就位拍環境。",
                tripUse: "若輪到這間，適合安排全家正式照與孩子互動畫面。",
                highlight: true
            },
            {
                id: "search-deck-deck5-2",
                bindingKey: "deck5:2",
                icon: "fa-solid fa-music",
                name: "Tiana’s Bayou Lounge",
                summary: "紐奧良爵士氛圍很濃，像是秀前後可以換口味的輕鬆轉場區。",
                bestTime: "晚餐後、看秀前的短空檔最有味道。",
                tripUse: "大人想暫時放鬆時可列入備選，不必當成主線行程。",
                highlight: false
            },
            {
                id: "search-deck-deck5-3",
                bindingKey: "deck5:3",
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
                id: "search-deck-deck6-0",
                bindingKey: "deck6:0",
                icon: "fa-solid fa-utensils",
                name: "Enchanted Summer Restaurant",
                summary: "花園與仲夏氛圍很適合慢慢吃，白天與晚間都各有表情。",
                bestTime: "入座前 5–10 分鐘先到，拍環境最輕鬆。",
                tripUse: "Day 2 午餐如果想從容一點，這層最適合當節奏緩衝。",
                highlight: true
            },
            {
                id: "search-deck-deck6-1",
                bindingKey: "deck6:1",
                icon: "fa-solid fa-headset",
                name: "Guest Services 客務中心",
                summary: "帳單、網路、遺失物、需求協助都在這裡處理，登船日若房卡或現場引導有落差時也常要回來補位。",
                bestTime: "避開開船日下午與最後一晚尖峰。",
                tripUse: "若房卡、Wi-Fi、帳單或現場指引讓人摸不著頭緒，先記得回這裡補位。",
                highlight: true
            },
            {
                id: "search-deck-deck6-2",
                bindingKey: "deck6:2",
                icon: "fa-solid fa-candy-cane",
                name: "Premier Sips & Snacks",
                summary: "劇院入口旁的付費小食站，爆米花與紀念杯很容易讓孩子分心；船頭一帶也可留意 Stitch Magic Shots 這類短拍照點。",
                bestTime: "劇院進場前先買，不要壓最後一刻排隊。",
                tripUse: "看秀前想補個飲料或爆米花時很方便；若當天 App 或現場攝影師有史迪奇特效拍照點，這層可順手排進拍照路線。",
                highlight: false
            },
            {
                id: "search-deck-deck6-3",
                bindingKey: "deck6:3",
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
                id: "search-deck-deck7-0",
                bindingKey: "deck7:0",
                icon: "fa-solid fa-user-secret",
                name: "Edge 隱藏入口 / Vibe 青年會所",
                summary: "Edge 11–14 歲，小寶 11 歲符合，澤澤 9 歲與彤妹 8 歲不符合；Vibe 為 14–17 歲。入口偽裝在街區立面裡。",
                bestTime: "首日先帶孩子走一次，順便確認活動表。",
                tripUse: "Day 1 熟悉位置後，後續孩子比較敢自己回來找活動。",
                highlight: true
            },
            {
                id: "search-deck-deck7-1",
                bindingKey: "deck7:1",
                icon: "fa-solid fa-gamepad",
                name: "Big Hero Arcade",
                summary: "房卡就能啟動的大英雄天團體感電玩，四款遊戲都需要全身互動，是下午最好的放電分流點。",
                bestTime: "避開晚間尖峰，下午更能玩到完整體感機。",
                tripUse: "Day 2 下午很適合全家刷房卡輪流玩四款雙人體感遊戲：Super Fred Kaiju Chaos（怪獸追逐）、Go Go Racers（節奏賽車）、Honey Lemon Chem-Ball Blast（化學球射擊）、Wasabi Speed Slice（電漿切片）。",
                highlight: true
            },
            {
                id: "search-deck-deck7-2",
                bindingKey: "deck7:2",
                icon: "fa-solid fa-film",
                name: "Baymax Cinemas",
                summary: "兩個小影廳節奏安靜，當孩子需要降噪休息時非常好用，也很適合安排在 Baymax 合照前後當室內分流點。",
                bestTime: "片單出來就先看，提早一點進場能挑舒服位置；若孩子或長輩依賴字幕，要先有目前多半沒有字幕的心理準備。",
                tripUse: "Day 3 下午若想切到室內模式，這裡是很穩的備案。",
                highlight: true
            },
            {
                id: "search-deck-deck7-3",
                bindingKey: "deck7:3",
                icon: "fa-solid fa-mug-hot",
                name: "Alley Cat Café / 商店街",
                summary: "咖啡、輕補給與商店街都集中在這一帶，很適合邊走邊補貨，也方便當作 Deck 7 的中繼站。",
                bestTime: "下午或白天比演後散場友善。",
                tripUse: "大人等孩子跑活動時，可以順手買杯咖啡、逛商店街，或把這裡當成 Deck 7 的短休補給點。Deck 7 也是 roaming character 偶爾會經過的流動走廊，剛好路過時值得抬頭多看一眼。",
                highlight: false
            },
            {
                id: "search-deck-deck7-4",
                bindingKey: "deck7:4",
                icon: "fa-solid fa-camera-retro",
                name: "Pics Photo Shop / Disney Cruise Line Photos",
                summary: "這裡是船上檢查、挑選、購買與下載照片的主站；Adventure 實體店名叫 Pics，也常聚集 Duffy、Pixar、Spider-Man、Aladdin、Lion King、Princess、Marvel portraits / Magic Shots 等主題拍照點。",
                bestTime: "下午或晚餐、角色合照後回來看一輪最實用；不要拖到最後一晚才第一次確認照片有沒有入帳。",
                tripUse: "若有買拍照套裝，建議航程中至少回來看幾次 kiosks，確認角色見面、晚餐、背景布景點與 Magic Shots 的照片都有被抓到。Deck 7 船前與中段是照片系統的核心入口，船側戶外甲板也可留意 Mickey、Donald、Chip & Dale 類特效照。",
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
                id: "search-deck-deck8-0",
                bindingKey: "deck8:0",
                icon: "fa-solid fa-child-reaching",
                name: "Disney Oceaneer Club",
                summary: "3–10 歲孩子的沉浸式主場，四大主題區域夠讓首日下午就玩出興趣。",
                bestTime: "依 Navigator 的 Open House 時段，全家只安排一次參觀；不預設 13:00。",
                tripUse: "小寶 11 歲只在全齡 Open House 與家人同遊；澤澤 9、彤妹 8 歲才符合正式 3–10 歲活動。開放參觀不能當作託管交接。",
                highlight: true
            },
            {
                id: "search-deck-deck8-1",
                bindingKey: "deck8:1",
                icon: "fa-solid fa-shield-heart",
                name: "RFID 手環與取孩密語機制",
                summary: "白色防水手環加上房卡與密語的雙重接送機制，是這層最重要的安心感來源。",
                bestTime: "第一次報到就把規則設定完整。",
                tripUse: "這趟家庭行程的關鍵不是只玩，而是讓接送流程一次上軌道。",
                highlight: true
            },
            {
                id: "search-deck-deck8-2",
                bindingKey: "deck8:2",
                icon: "fa-solid fa-crown",
                name: "Royal Society for Friendship and Tea",
                summary: "付費活動雖不是必排，但若孩子超吃公主主題，這裡要提早決定。",
                bestTime: "有意願就提早透過禮賓或系統確認名額。",
                tripUse: "列入願望清單，不和主行程綁死。",
                highlight: false
            },
            {
                id: "search-deck-deck8-3",
                bindingKey: "deck8:3",
                icon: "fa-solid fa-camera-retro",
                name: "Hollywood Spotlight Club",
                summary: "家庭舞會、合照與親子活動常在這裡出現，節奏比俱樂部更開放；Deck 8 船尾電扶梯附近也可留意 Thor’s Hammer / Mjolnir 這類漫威拍照點。",
                bestTime: "留意晚間 Navigator App 活動表。",
                tripUse: "若全家想找一起參與的晚間活動，這層很值得看表補位；孩子若迷漫威，路過船尾時也可以順手確認索爾錘子拍照點是否開放。",
                highlight: false
            }
        ]
    },
    {
        id: "deck9",
        label: "Deck 9",
        title: "Deck 9｜Pics Photo Observatory 拍照背景集中層",
        theme: "Frozen、Star Wars Lightsaber、Rapunzel Lantern、Lifestyle Portraits",
        tripFocus: "這層不是主行程核心，但若有買拍照套裝，Deck 9 船尾很適合列入每日照片檢查路線。",
        badges: ["拍照點快查", "Pics Photo Observatory", "航行中檢查"],
        facilities: [
            {
                id: "search-deck-deck9-0",
                bindingKey: "deck9:0",
                icon: "fa-solid fa-camera-retro",
                name: "Pics Photo Observatory",
                summary: "Deck 9 船尾可作為背景拍照集中點來看，常見整理包含 Frozen、Star Wars Lightsaber、Rapunzel’s Lantern 與 Lifestyle Portraits 等主題。",
                bestTime: "每天看 Navigator App 或現場照片機台時順手確認；不要等最後一晚才第一次補拍。",
                tripUse: "若你們已買或正在考慮拍照套裝，這層適合當作『今天要不要補一組正式背景照』的檢查點；實際背景與攝影師時段仍以當天 App 與現場公告為準。",
                highlight: true
            }
        ]
    },
    {
        id: "deck10",
        label: "Deck 10",
        title: "Deck 10｜花園舞台與快餐動線主戰場",
        theme: "Imagination Garden、Wayfinder Bay、Discovery Reef、快餐群",
        tripFocus: "Day 1 熟悉舞台；海上日依公告挑 Avengers 或 Duffy，晚間可短逛 Discovery Reef，不固定煙火日期。",
        badges: ["花園舞台主場", "快餐分流", "白天活動最多"],
        facilities: [
            {
                id: "search-deck-deck10-0",
                bindingKey: "deck10:0",
                icon: "fa-solid fa-tree-city",
                name: "Disney Imagination Garden",
                summary: "全船最核心的花園舞台，白天活動與夜間表演都靠這裡帶節奏。",
                bestTime: "演前 15–20 分鐘到，想看全景可往樓上環繞區。",
                tripUse: "Day 1、Day 2、Day 3 都會來，這裡是整趟最該先熟的公共空間；若從船頭要去花園舞台，通常先走到 Deck 11 再下樓最穩，若人在船尾，多半可直接沿 Deck 10 走過去。",
                highlight: true
            },
            {
                id: "search-deck-deck10-1",
                bindingKey: "deck10:1",
                icon: "fa-solid fa-water-ladder",
                name: "Wayfinder Bay + Discovery Reef",
                summary: "莫阿娜主題泳池與海景最舒服，旁邊還能順手買到烏蘇拉主題飲品；Discovery Reef 船尾也可留意 Dory & Nemo Statue 這類合照點。",
                bestTime: "白天避開正午曝曬；Discovery Reef 夜間散步可替代重複購物，不壓縮主秀與睡眠。",
                tripUse: "Day 2 上午很適合玩水、拍照、買一杯珍奶當小獎勵；如果當天想補海底總動員主題照片，這一帶可順手檢查。",
                highlight: true
            },
            {
                id: "search-deck-deck10-2",
                bindingKey: "deck10:2",
                icon: "fa-solid fa-bowl-food",
                name: "Gramma Tala’s Kitchen",
                summary: "Deck 10 中段少數偏亞洲口味的補給點，想念熟悉飯食時會比一直吃西式快餐更有安定感。",
                bestTime: "常見窗口大約是 11:00–18:00 與 22:00–00:00；中午與宵夜時段最值得留意當天是否有開。",
                tripUse: "帶小孩家庭若開始想念雞飯、牛肉飯這類亞洲口味，這裡通常最容易救回胃口；點飯時也常能像雜飯一樣自己選配菜，牛肉若能加上炒牛肉會特別下飯。",
                highlight: true
            },
            {
                id: "search-deck-deck10-3",
                bindingKey: "deck10:3",
                icon: "fa-solid fa-drumstick-bite",
                name: "Mowgli’s Eatery",
                summary: "Deck 10 上很值得記住的印度料理快餐點，和一般 buffet 或披薩相比更像一個有主題、有香氣的口味切換站。",
                bestTime: "午餐時段最適合順路補一輪；若白天活動很多，拿完就近找位子比特地排正式餐廳更省節奏。",
                tripUse: "若午餐不想再吃普通 buffet，這裡是很穩的主題小吃替代；烤雞特別值得記住，搭上現場看到的脆薯通常就很有滿足感。",
                highlight: true
            },
            {
                id: "search-deck-deck10-4",
                bindingKey: "deck10:4",
                icon: "fa-solid fa-burger",
                name: "Stitch’s ’Ohana Grill",
                summary: "Deck 10 船尾最有飽足感的快餐主力，漢堡、熱狗和薯條都是這層最容易讓全家快速吃飽的選項。",
                bestTime: "常見營運時段約 10:30–22:00；午晚餐尖峰最多人，若能錯峰拿餐會更舒服。",
                tripUse: "若真的想用高滿足快餐取代一頓正式晚餐，這裡通常是最穩的 fallback；熱狗堡、漢堡都很扛餓，有薯條時也很適合直接順手補一份，真的很餓時可以用社群推薦的心態考慮直接點兩份。",
                highlight: true
            },
            {
                id: "search-deck-deck10-5",
                bindingKey: "deck10:5",
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
                id: "search-deck-deck11-0",
                bindingKey: "deck11:0",
                icon: "fa-solid fa-eye",
                name: "Imagination Garden 上層環繞區",
                summary: "想看整個花園舞台的動態，站在上層環繞區比平面更容易掌握全場；Deck 11 中段也可留意 Sorcerer Mickey Topiary 這類不太打斷行程的拍照點。",
                bestTime: "表演前 15 分鐘先來找邊側或欄杆位。",
                tripUse: "如果不想在人群最前排硬擠，這層是看秀很聰明的角度；某些花園秀開演前約 15 分鐘，後方電梯一帶也可能看到角色或英雄進場準備，其中一台有時還會顯示 PRIORITY SERVICE。若路過魔法師米奇植栽，可順手補一張全家照。",
                highlight: true
            },
            {
                id: "search-deck-deck11-1",
                bindingKey: "deck11:1",
                icon: "fa-solid fa-martini-glass-citrus",
                name: "Garden Bar / Taverna Portorosso",
                summary: "比較像是大人能喘口氣的輕餐與酒吧帶，不必特別為它拉出主行程。",
                bestTime: "傍晚或夜秀前後最有氛圍。",
                tripUse: "若長輩或大人想避開主甲板人潮，這裡很適合慢下來。",
                highlight: false
            },
            {
                id: "search-deck-deck11-2",
                bindingKey: "deck11:2",
                icon: "fa-solid fa-champagne-glasses",
                name: "Palo Trattoria 入口層",
                summary: "成人專屬餐廳入口與候位區，屬於禮賓可協助安排的高級選項。",
                bestTime: "熱門餐期要靠預約，不適合臨時起意。",
                tripUse: "這趟先視為備案，不佔家庭主行程。",
                highlight: false
            },
            {
                id: "search-deck-deck11-3",
                bindingKey: "deck11:3",
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
                id: "search-deck-deck17-0",
                bindingKey: "deck17:0",
                icon: "fa-solid fa-crown",
                name: "Concierge Lounge",
                summary: "禮賓家庭最穩的補給基地；每日供應與酒水節奏請直接看 Playbook「禮賓隱藏加值」卡片。",
                bestTime: "Day 1 報到後先熟路線；每晚晚餐前後再回來做中轉補位。",
                tripUse: "先索取免預約角色時刻表。Deck 17 船頭左舷有指定吸菸區，詢問無菸座位與通往日光甲板路線；不代表室內全區可吸菸，也無證據判定 17108 受影響。",
                highlight: true
            },
            {
                id: "search-deck-deck17-1",
                bindingKey: "deck17:1",
                icon: "fa-solid fa-water",
                name: "Toy Story Pool / Splash Pad / Flying Saucer Splash Zone",
                summary: "三童共同玩水選 Sunnyside Pool：無年齡門檻，未滿 12 歲需成人監督。Flying Saucer Splash Zone 限 4–8 歲，三人僅彤妹符合，不當共同主活動。",
                bestTime: "海上日依開放時段；登船日不得和安全演練重疊。",
                tripUse: "小寶 11、澤澤 9、彤妹 8 歲以 Sunnyside 或禮賓泳池同遊；Wild Slides 另看赤腳 122 公分資格。<a href='https://disneycruise.disney.go.com/en/faq/onboard-activities/pool-restrictions/' target='_blank' rel='noopener noreferrer'>官方泳池與滑水道限制</a>（2026/9/7 核對）。",
                highlight: true
            },
            {
                id: "search-deck-deck17-2",
                bindingKey: "deck17:2",
                icon: "fa-solid fa-pizza-slice",
                name: "Pixar Market Restaurant / Pizza Planet / Wheezy’s Freezies",
                summary: "濕答答也能快速補能量，尤其 Pizza Planet 是最不打斷節奏的披薩補給點之一，剛出爐時表現通常特別好。",
                bestTime: "常見窗口約 10:30–18:00 與 21:00–00:00；下午點心、玩水後與宵夜時段特別好用，先找位子再分工取餐效率最高。",
                tripUse: "玩水中場、下午餓了、孩子只想快點吃點東西時都很好用；它比較像方便補給站，不必神化成必吃目的地，高峰時段仍可能明顯排隊。若要裝免費飲料，記得找泳池另一側的飲料機，不要把旁邊的付費酒吧當成同一區。",
                highlight: true
            },
            {
                id: "search-deck-deck17-3",
                bindingKey: "deck17:3",
                icon: "fa-solid fa-gem",
                name: "Market Bar / 3 Wishes / Palace Treasures",
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
                id: "search-deck-deck18-0",
                bindingKey: "deck18:0",
                icon: "fa-solid fa-bolt",
                name: "Marvel Landing",
                summary: "漫威主題區就是 Day 2 上午最有速度感的開局，適合先衝再慢下來。",
                bestTime: "越早越好，風勢穩時最容易玩得順；Quantum Racers 要避免亂撞卡住全場。",
                tripUse: "Ironcycle 在 Day 1 或 Day 2 就觀察可玩機會；三項設施依 Navigator 預約／候位，不把禮賓當快速通關。接近晚餐、主秀或孩子疲累就停止長隊。",
                highlight: true
            },
            {
                id: "search-deck-deck18-1",
                bindingKey: "deck18:1",
                icon: "fa-solid fa-water-ladder",
                name: "Infinity Pool & Jetfinity Bar",
                summary: "Infinity Pool 官方目前無年齡門檻，未滿 12 歲需成人監督；仍須核對現場時段與告示，不逕稱成人限定。",
                bestTime: "常見時段大約 09:00–23:00；上午玩完設施後或午後放鬆都很適合，夕陽前氣氛也很好，風大要注意保暖。",
                tripUse: "Marvel 設施後可休息；Deck 18 船尾左舷 Infinity Pool Sundeck 有指定吸菸區，先確認無菸座位與路線。",
                highlight: true
            },
            {
                id: "search-deck-deck18-2",
                bindingKey: "deck18:2",
                icon: "fa-solid fa-heart-pulse",
                name: "Running Track / Concierge Fitness Center",
                summary: "若有人真的想晨跑或健身，這層是少數能把運動和海景結合起來的地方。",
                bestTime: "Concierge Fitness Center 06:00–22:00 可用；清晨人最少，傍晚風會比較大。",
                tripUse: "不是主線，但適合早起的大人自己偷一段時間。",
                highlight: false
            },
            {
                id: "search-deck-deck18-3",
                bindingKey: "deck18:3",
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
                id: "search-deck-deck19-0",
                bindingKey: "deck19:0",
                icon: "fa-solid fa-sun",
                name: "Concierge Sundeck & Pool",
                summary: "禮賓泳池各年齡房客可使用，未滿 12 歲需成人監督；適合小寶、澤澤、彤妹共同玩水，開放時間以當天公告為準。",
                bestTime: "11:00–16:30 最適合補 light bites 與 hot items；07:00–22:00 都能回來休息和補基本飲品。",
                tripUse: "可當作 Day 2、Day 3 的中場休息點，重新整理體力；基本免費飲品供應到 22:00，付費酒水則從 11:00–22:00 可點。",
                highlight: true
            },
            {
                id: "search-deck-deck19-1",
                bindingKey: "deck19:1",
                icon: "fa-solid fa-person-swimming",
                name: "Woody’s Wide Slide 入口",
                summary: "正式英文 Woody and Jessie’s Wild Slides；赤腳身高至少 122 公分，不允許水鞋、浮潛面罩與鬆散物品。",
                bestTime: "登船日下午或海上日早段通常排得最輕。",
                tripUse: "先量三童身高，依現場量測與限制決定可玩者，不以年齡推定資格；不符合就改共同泳池。",
                highlight: true
            },
            {
                id: "search-deck-deck19-2",
                bindingKey: "deck19:2",
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
                id: "search-show-stage-musicals-0",
                bindingKey: "stage-musicals:0",
                name: "《Remember》",
                theme: "以瓦力與伊芙為主線，串起可可夜總會、小美人魚、阿拉丁等迪士尼記憶的原創音樂劇。",
                location: "Walt Disney Theatre（Deck 5–7 船頭）",
                timingTip: "建議提早 20–30 分鐘進場，優先搶一樓中間區；若是 First Seating 又遇到餐廳秀或晚餐拖長，更要提早收尾，二樓視野也較容易被前排遮住。",
                tripLink: "列為重要主秀，日期與場次依 App；晚餐、集合時間先核對，不固定 Day 1。"
            },
            {
                id: "search-show-stage-musicals-1",
                bindingKey: "stage-musicals:1",
                name: "《Disney Seas the Adventure》",
                theme: "由經典角色串起的海上百老匯式大秀，節奏熱鬧、全家都容易進入狀況。",
                location: "Walt Disney Theatre（Deck 5–7 船頭）",
                timingTip: "和晚餐時段綁在一起看最順，但 First Seating 若晚餐拖長仍可能壓縮排隊時間；進場時仍建議優先搶一樓區域。",
                tripLink: "列為另一場重要主秀，以 App 分配場次與當晚禮賓通知為準。"
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
                id: "search-show-garden-shows-0",
                bindingKey: "garden-shows:0",
                name: "《Avengers Assemble!》",
                theme: "漫威特技秀，英雄群像加上死侍的吐槽節奏，很適合全家一起看熱鬧。",
                location: "Disney Imagination Garden（Deck 10/11 船中）",
                timingTip: "這場比一般花園秀更值得早到，至少提早 45 分鐘到 Deck 10 MID 中間草皮區卡位最穩；若只是想看英雄進場，開演前約 15 分鐘也可先去 Deck 11 後方電梯一帶碰碰運氣。",
                tripLink: "海上日候選，先保留晚餐與劇院主秀，再挑不衝突的場次；不保證每天演出。"
            },
            {
                id: "search-show-garden-shows-1",
                bindingKey: "garden-shows:1",
                name: "《Duffy and The Friend Ship》",
                theme: "達菲與好友的海上派對，是偏可愛與合照氛圍的大型演出。",
                location: "Disney Imagination Garden（Deck 10/11 船中）",
                timingTip: "若孩子偏愛達菲系，建議提早卡視野好的邊側區。",
                tripLink: "依當次節目安排；達菲或史黛拉兔有主題演出／商店，不代表一定有個別合照。"
            },
            {
                id: "search-show-garden-shows-2",
                bindingKey: "garden-shows:2",
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
                id: "search-show-open-air-night-0",
                bindingKey: "open-air-night:0",
                name: "《Moana: Call of the Sea》",
                theme: "把莫阿娜的航海故事搬進夜間露天海景環境裡，氛圍會比室內劇場更開闊。",
                location: "Wayfinder Bay（船尾戶外舞台區）",
                timingTip: "夜間戶外風較強，提早到場並順手準備薄外套。",
                tripLink: "若 Day 2 晚上想走海景演出路線，這場最值得鎖定。"
            },
            {
                id: "search-show-open-air-night-1",
                bindingKey: "open-air-night:1",
                name: "《The Lion King: Celebration in the Sky》",
                theme: "獅子王主題海上煙火，配樂與旁白都走大型慶典級別的震撼路線。",
                location: "高層戶外甲板與開放視野區",
                timingTip: "日期、時間、觀賞區及天氣調整以本航次 Navigator 與現場公告為準，不沿用其他航次的晚上 10:30。",
                tripLink: "不固定最後一晚；有公告才插入相應日期，無場次可改 Discovery Reef 夜間散步。"
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
                id: "search-playbook-pretrip-0",
                bindingKey: "pretrip:0",
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
                id: "search-playbook-pretrip-1",
                bindingKey: "pretrip:1",
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
                id: "search-playbook-pretrip-2",
                bindingKey: "pretrip:2",
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
                id: "search-playbook-pretrip-3",
                bindingKey: "pretrip:3",
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
                id: "search-playbook-pretrip-4",
                bindingKey: "pretrip:4",
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
                id: "search-playbook-pretrip-5",
                bindingKey: "pretrip:5",
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
                id: "search-playbook-embark-sprint-0",
                bindingKey: "embark-sprint:0",
                title: "隨身包要以『下午先玩』為前提",
                icon: "fa-solid fa-suitcase-rolling",
                sourceType: "community",
                whenToUse: "1/25 登船前一晚收手提行李時。",
                action: "把泳衣、防曬、防滑拖鞋、孩子換洗衣物、行動電源、必要文件、房門磁鐵／裝飾與登船後立刻會用的小物放在同一包，別讓玩水裝備或第一輪要用的物品跟托運行李分開。",
                tripFit: "你們的 Day 1 不是只有報到，而是要接 Open House 與玩水暖身，少一樣都會拖慢全家節奏。",
                caution: "這張卡不取代證件檢查，它只是提醒真正影響心情的通常是『下午要用的東西有沒有跟著上船』。若有攜帶官方允許的飲品或酒類，請依 DCL 最新規則放手提行李，不要寫死舊航次條文。",
                relatedSectionId: "checklist"
            },
            {
                id: "search-playbook-embark-sprint-1",
                bindingKey: "embark-sprint:1",
                title: "登船 3 小時 SOP：只跑第一圈，不要一開始就滿船亂衝",
                icon: "fa-solid fa-route",
                sourceType: "community",
                whenToUse: "真正踏上船後的第一個下午。",
                action: "依登船指引 → 快速補給 → 禮賓接待核對晚餐、主秀與皇家預約 → 先拿 Lounge 角色表，再查看 Baymax 杯麵／Marvel 設施預約 → 一次全家 Oceaneer Open House → 熟悉動線。先圈出安全演練，剩餘空檔才玩水。",
                tripFit: "這條路線能同時滿足大人報到、孩子熟悉環境與第一天放電，最適合你們兩家同行的協作節奏。",
                caution: "房卡與行李常不會同時到位，先別急著把回房當第一優先；接駁客的行李也通常不用停在自助 drop-off。若現場拿到行李吊牌，只撕尾端貼紙固定即可，不要整條撕開。",
                relatedSectionId: "checkin"
            },
            {
                id: "search-playbook-embark-sprint-2",
                bindingKey: "embark-sprint:2",
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
                id: "search-playbook-daily-ops-0",
                bindingKey: "daily-ops:0",
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
                id: "search-playbook-daily-ops-1",
                bindingKey: "daily-ops:1",
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
                id: "search-playbook-daily-ops-2",
                bindingKey: "daily-ops:2",
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
                id: "search-playbook-daily-ops-3",
                bindingKey: "daily-ops:3",
                title: "Room Service 很適合儀式感，但一定要提早下單",
                icon: "fa-solid fa-cheese",
                sourceType: "community",
                whenToUse: "孩子洗好澡、全家回房後想吃點熱食時，或隔天早餐想先靠 room service 墊一下時。",
                action: "先在 Navigator 查 Room Service 菜單，再用房內電話點餐，確認供應、費用與預估送達。17108 陽台可留一次早餐或休息餐點，不必每天為使用 Lounge 來回移動。",
                tripFit: "AsiaOne 2026/6/4 更新報導：6/4 航次起一般送餐每單 US$5，加 18% 小費；禮賓與符合規定的歐陸早餐掛卡訂單免配送費。<a href='https://www.asiaone.com/lifestyle/disney-adventure-cruise-charging-in-room-dining-fees' target='_blank' rel='noopener noreferrer'>收費變動報導</a>。",
                caution: "這是營運報導，不是 2027 報價承諾；免配送費不等於全部餐點、飲品免費。先核對當次菜單與帳單，避免重複加給；等待會浮動，不在等餐後緊接不能遲到的活動。",
                relatedSectionId: "tips"
            },
            {
                id: "search-playbook-daily-ops-4",
                bindingKey: "daily-ops:4",
                title: "角色排隊和空景拍照，都盡量搶早檔",
                icon: "fa-solid fa-camera-retro",
                sourceType: "community",
                whenToUse: "海上日早上與一般 meet-and-greet 前。",
                action: "先拿 Concierge Lounge 免預約角色表，再補孩子最想見、Lounge 沒涵蓋的角色。Baymax 杯麵在 San Fransokyo Street，需登船後預約；Royal Gathering 依確認時段，不固定下午。",
                tripFit: "使用者提供的 goma0609 9/5 遊記摘要（8/20–24 搭乘）提到已預約米妮仍等約 45 分鐘；只作緩衝提醒，非每場預估等待。",
                caution: "預約不代表立即完成，後面不要緊接不能遲到的晚餐／主秀。達菲與史黛拉兔是否合照看當次節目，不能由商店或演出主題推定。<a href='https://disneycruise.disney.go.com/en-ca/faq/booking-reservations/disney-adventure-book-activities-faq/' target='_blank' rel='noopener noreferrer'>官方 Adventure 預約說明</a>。",
                relatedSectionId: "timeline"
            },
            {
                id: "search-playbook-daily-ops-5",
                bindingKey: "daily-ops:5",
                title: "想看的秀先在 Live Shows 點愛心，再排角色見面會",
                icon: "fa-solid fa-heart-circle-check",
                sourceType: "community",
                whenToUse: "登船後第一次開始整理活動、想避免花園秀與晚餐打架時。",
                action: "先核對 App 的正式晚餐與主秀，再把 Live Shows 想看的秀點愛心；接著確認 Onboard Fun／角色與設施預約，最後才補 Big Hero、D Lounge、散步。點愛心只是收藏，不代表預約成功。",
                tripFit: "你們這趟花園舞台和戶外秀很多，先把秀程定下來，再往外排角色與其他活動，整體衝突會少很多。",
                caution: "這不是保證一定自動排得完美，而是先把高優先秀固定下來的實戰技巧；角色場次與開放時間仍以當天 App 顯示為準。",
                relatedSectionId: "entertainment"
            },
            {
                id: "search-playbook-daily-ops-6",
                bindingKey: "daily-ops:6",
                title: "拍照套裝怎麼買才不浪費，下載時機更重要",
                icon: "fa-solid fa-camera",
                sourceType: "official",
                whenToUse: "付完全額船費後，到航程最後一天前都值得再確認一次。",
                action: "拍照套裝可在 My Cruise Plans / Onboard Fun 內查看，一房通常只需一人購買。若想保留最大彈性，重點不是一開始就急著下載，而是先確認照片都有順利進到帳號；官方 FAQ 也建議航程中至少去 Pics 或 kiosks 看幾次，確保角色見面、晚餐與背景點的照片都有被抓到。",
                tripFit: "套裝照片需含至少一位購買房間成員。兩家訂房已連結，不代表另一家的獨照、四人家庭照全包；跨房合併僅有同一家庭未滿 21 歲子女等特定條件，須到 Pics 請工作人員核對。",
                caution: "預購訂單可在出發前 3 天以前線上取消，或航程結束前船上取消，但不得已下載數位照片。若還在決定，先檢視入帳，不要試下載；解鎖／單張數位購買另有不可退款條款。價格與下載期限依當次方案。<a href='https://disneycruise.disney.go.com/en-ca/photos-terms-and-conditions/' target='_blank' rel='noopener noreferrer'>官方攝影條款</a>。",
                relatedSectionId: "entertainment"
            },
            {
                id: "search-playbook-daily-ops-7",
                bindingKey: "daily-ops:7",
                title: "App 出錯先現場問，不要直接放棄",
                icon: "fa-solid fa-triangle-exclamation",
                sourceType: "community",
                whenToUse: "活動預約突然消失、快速服務顯示錯誤或客滿時。",
                action: "若 App 裡的角色見面會或活動預約突然不見，先去 Guest Services 反應；若快餐預約報錯或顯示客滿，也先找座位再去現場問，通常比一直重刷更有效。",
                tripFit: "你們是多人同行，一個小 bug 就可能拖慢整串節奏，所以最重要的是知道『不要只卡在 App 裡』。",
                caution: "這屬常見實測補救，不代表系統一定會出錯；但一旦遇到，第一時間直接找現場工作人員通常最省力。",
                relatedSectionId: ""
            },
            {
                id: "search-playbook-daily-ops-8",
                bindingKey: "daily-ops:8",
                title: "把官方拍照點刻意排進每天動線，才拍得到夠多",
                icon: "fa-solid fa-camera",
                sourceType: "community",
                whenToUse: "每天早上第一次看 Navigator App、準備排今天主線時。",
                action: "官方拍照不是邊走邊自然就會累積，真正有感的做法是每天先看今天有哪些 photo opportunities，再把其中 1–2 個順路塞進行程。除登船入口、每晚晚餐、角色見面會與主背景布景點外，也可按 Deck 掃一輪：Deck 6 Stitch、Deck 7 Pics / Magic Shots、Deck 8 Thor’s Hammer、Deck 9 Pics Photo Observatory、Deck 10 Dory & Nemo、Deck 11 Sorcerer Mickey。",
                tripFit: "首批 4 晚乘客心得裡講得很直接：重點不是有沒有買套裝，而是有沒有刻意把拍照點排進每天動線。若你們很在意全家合照，Deck 9 這種集中背景層就很適合拿來補正式照片。",
                caution: "這不代表每個點都要拍，而是要挑真正符合你們主線的點。實際背景、攝影師與 Magic Shots 仍以當天 App 和現場公告為準；手機版下載畫質通常會比電腦版小，若重視原始畫質，離船前後可再用電腦把檔案重抓一次。",
                relatedSectionId: "timeline"
            }
        ]
    },
    {
        id: "concierge-plus",
        label: "禮賓隱藏加值",
        intro: "這區只放網站其他地方沒明講的 concierge bonus，重點不是『有什麼』，而是『怎麼用才真的省力』。",
        items: [
            {
                id: "search-playbook-concierge-plus-0",
                bindingKey: "concierge-plus:0",
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
                id: "search-playbook-concierge-plus-1",
                bindingKey: "concierge-plus:1",
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
                id: "search-playbook-concierge-plus-2",
                bindingKey: "concierge-plus:2",
                title: "需要省力時，先想到的是管家，不是自己排隊",
                icon: "fa-solid fa-user-tie",
                sourceType: "concierge",
                whenToUse: "遇到限額活動、劇院座位或臨時需求時。",
                action: "若孩子想要限額活動、你們想確認劇院提前入座、或有需要協調的特殊需求，第一步先問管家能不能協助，而不是自己先去碰運氣；人在房內時也可以先按電話上的 Concierge 或 Guest Services，不一定要全家走去 Lounge。",
                tripFit: "禮賓價值最大的地方不是尊榮感，而是把你們從某些排隊與來回溝通裡解放出來。",
                caution: "可協助不等於保證有位或零等待，禮賓不是所有設施的快速通關。岸上團隊回信後仍要在 App 核對實際預約、人數與時段。",
                relatedSectionId: "deck-guide"
            },
            {
                id: "search-playbook-concierge-plus-3",
                bindingKey: "concierge-plus:3",
                title: "Lounge 的正確打開方式：下午茶、中轉站、偶遇角色",
                icon: "fa-solid fa-martini-glass-citrus",
                sourceType: "concierge",
                whenToUse: "午後空檔、晚餐前、看秀後與全家需要安靜休息時。",
                action: "把 Lounge 視為整天可切換節奏的基地：07:00–10:30 晨間輕食、11:00–14:30 午間補給、15:00–16:30 下午茶、17:00–20:00 晚間輕食、20:30–22:00 甜點收尾；它最大的價值是舒服與安靜，不是取代所有餐食。",
                tripFit: "先取得 Lounge 免預約角色時刻表，再補公共場次，減少重複排同一角色；歡迎午餐與角色活動仍可能等待，不把禮賓當零延誤保證。",
                caution: "基本飲品幾乎全天可用，17:00–22:00 通常還有免費 beer / wine / cocktails；但早晨部分 specialty beverages 可能另外計費，不同船與時段供應內容也會有差異。",
                relatedSectionId: "deck-guide"
            },
            {
                id: "search-playbook-concierge-plus-4",
                bindingKey: "concierge-plus:4",
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
                id: "search-playbook-concierge-plus-5",
                bindingKey: "concierge-plus:5",
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
                id: "search-playbook-concierge-plus-6",
                bindingKey: "concierge-plus:6",
                title: "劇院優先入場 SOP",
                icon: "fa-solid fa-door-open",
                sourceType: "concierge",
                whenToUse: "每天核對晚餐與 App 主秀分配時，再確認當晚禮賓通知。",
                action: "全員先到 Deck 5 船頭（forward）集合點，身上帶好金色房卡與 Navigator App 預訂證明，再一起走優先入場流程；實際集合細節仍以當晚禮賓通知信為主。",
                tripFit: "把集合點、時間與證明文件固定成 SOP，最能避免孩子累了時還要臨場找資料。",
                caution: "使用者提供的舊航次通知為演前 40 分鐘集合、30 分鐘截止，不是本航次保證。若 19:00 演出就需 18:20 集合，會與 17:45 晚餐衝突，先請禮賓協調。設好停止排隊時間，不用壓縮晚餐換入場。",
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
                id: "search-playbook-stateroom-family-0",
                bindingKey: "stateroom-family:0",
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
                id: "search-playbook-stateroom-family-1",
                bindingKey: "stateroom-family:1",
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
                id: "search-playbook-stateroom-family-2",
                bindingKey: "stateroom-family:2",
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
                id: "search-playbook-stateroom-family-3",
                bindingKey: "stateroom-family:3",
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
                id: "search-playbook-stateroom-family-4",
                bindingKey: "stateroom-family:4",
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
        id: "family-planning",
        label: "家庭避衝突與備案",
        intro: "2026/9/7 更新：官方限制與家庭安排分開看，旅客心得只用來準備緩衝，不照搬其他航次時刻表。",
        items: [
            {
                id: "search-playbook-family-planning-0",
                bindingKey: "family-planning:0",
                title: "Ironcycle 提早嘗試，晚餐與主秀前停止長隊",
                icon: "fa-solid fa-clock",
                sourceType: "community",
                whenToUse: "Day 1 或 Day 2 先看營運，之後每次排隊前再決定。",
                action: "每天先保留晚餐與主秀，再插已確認預約，最後才補家庭遊戲。以最近一場必到活動倒推換裝、步行與集合時間；若候位無法在那之前結束，就停止等候，孩子疲累也直接換備案。",
                tripFit: "使用者提供 goma0609 8/29 攻略、9/5 分日遊記摘要：夫妻帶 7 歲女兒於 8/20–24 搭乘，整體順利，但 Ironcycle 排隊／系統調整曾壓縮《Remember》入場；不只沿用試航負面預期，也不把設施留最後一天。",
                caution: "遊記原文連結尚待補核，不能把單趟等待推算為 2027 人潮。官方允許部分 Marvel 時段預約、部分免預約；Navigator 與現場才是當日依據，禮賓不保證快速通關。",
                relatedSectionId: "deck-guide"
            },
            {
                id: "search-playbook-family-planning-1",
                bindingKey: "family-planning:1",
                title: "D Lounge 家庭活動：三童一起的室內備案",
                icon: "fa-solid fa-people-group",
                sourceType: "official",
                whenToUse: "海上日想一起玩、戶外停機、太熱或不想長時間排隊時。",
                action: "在 Navigator 搜尋 D Lounge，挑家庭舞蹈、問答或卡拉 OK 等當次活動；亦可換 Big Hero Arcade，晚間改 Discovery Reef 短散步。地點與場次以 App 確認。",
                tripFit: "適合小寶 11、澤澤 9、彤妹 8 歲共同活動，不必為湊行程再安排一次 Oceaneer。使用者提供的 goma0609 9/5 第四天摘要曾記錄未點餐也能觀看舞蹈、當次遇米奇。",
                caution: "<a href='https://disneycruise.disney.go.com/en-eu/onboard-activities/d-lounge-family-club/' target='_blank' rel='noopener noreferrer'>官方確認家庭娛樂定位</a>；旅客個案不代表每場免費、不需點餐或一定有米奇，參加方式依活動公告。",
                relatedSectionId: "entertainment"
            },
            {
                id: "search-playbook-family-planning-2",
                bindingKey: "family-planning:2",
                title: "禮賓吸菸區與無菸座位：上船先問清楚",
                icon: "fa-solid fa-ban-smoking",
                sourceType: "official",
                whenToUse: "Day 1 Concierge Lounge 報到、安排孩子休息點時。",
                action: "詢問 Deck 17 船頭左舷 Concierge Lounge 指定吸菸範圍、無菸座位、通往日光甲板路線及較不受菸味影響的位置；Deck 18 船尾左舷 Infinity Pool Sundeck 也有指定區。",
                tripFit: "禮賓是休息與協調基地，不保證整個周邊無菸味。現無證據能判定 17108 一定受影響，不因這項資訊直接換房。",
                caution: "這不是整間室內 Lounge 可吸菸；官方另列 Deck 7 船頭右舷外甲板。範圍依現場標示。<a href='https://disneycruise.disney.go.com/en-gb/faq/booking-reservations/designated-smoking-areas/' target='_blank' rel='noopener noreferrer'>官方指定吸菸區</a>（2026/9/7 核對）。",
                relatedSectionId: "deck-guide"
            },
            {
                id: "search-playbook-family-planning-3",
                bindingKey: "family-planning:3",
                title: "禮賓回信後，回 App 驗收七人預約",
                icon: "fa-solid fa-list-check",
                sourceType: "community",
                whenToUse: "9 月禮賓預約窗口前後，以及登船當天。",
                action: "先核對兩房付款資格，再提交 Royal Gathering 與餐飲需求；逐項回 App 確認七人名單、日期時間與狀態。晚餐願望寫七人同桌、第一時段、角色晚宴與動畫體驗、較好視線，不指定三晚一定同時排 Hollywood 與 Navigator’s。",
                tripFit: "使用者提供「りーママ」6/24 發文、7 月補充摘要：135 天收到通知、130 天寄需求、123 天 App 看見結果。這只是預約流程經驗，不是入住後評價，也不是本航次保證。",
                caution: "原文待補核。另有使用者整理的 Reddit 首批四晚禮賓家庭肯定 Lounge 與早餐，但午餐慢、角色延誤仍發生；《換日線》凱倫 5/28（5/4–7 三晚搭乘）推薦輪替晚餐、Remember 與夜間礁區。只採作保留晚餐和增加緩衝的參考。",
                relatedSectionId: "timeline"
            }
        ]
    },
    {
        id: "last-night",
        label: "最後一晚與撤船",
        intro: "這組不是重講下船流程，而是把最後一晚真正容易手忙腳亂的決策先幫你排好。",
        items: [
            {
                id: "search-playbook-last-night-0",
                bindingKey: "last-night:0",
                title: "最後一晚先做一個『孩子晨間包』",
                icon: "fa-solid fa-bag-shopping",
                sourceType: "community",
                whenToUse: "大型行李要放門外之前。",
                action: "把隔天早餐後會用到的證件、外套、濕紙巾、簡單點心、孩子換洗衣物與機場路上要用的東西先留在手提包，別等依通知外放行李後才發現還需要翻大箱。",
                tripFit: "這會讓你們下船當天的節奏從容很多，不會在大件行李已經外放後才發現重要物品還在箱內。",
                caution: "孩子最常臨時需要的是外套、零食和小玩具，這三樣特別值得先留下。",
                relatedSectionId: "tips"
            },
            {
                id: "search-playbook-last-night-1",
                bindingKey: "last-night:1",
                title: "撤船日早餐與房務供應，要先分清楚",
                icon: "fa-solid fa-utensils",
                sourceType: "community",
                whenToUse: "最後一晚安排隔天早上的節奏時。",
                action: "下船日早餐、房務供應與集合點先問禮賓；想換餐廳先詢問。1/26–1/27 完成七人 1/28 再入境 SGAC，接送時間依實際放行，預留找行李與通關時間。",
                tripFit: "你們回程航班時間很充裕，真正重要的是早上不要餓著、也不要趕著找吃的。",
                caution: "SGAC 申報窗口包含抵達當天：1/24 入境為 1/22–1/24，1/28 再入境為 1/26–1/28。不要直到港口才找七人加行李的車；司機集合點、容量與延遲處理事先確認。",
                relatedSectionId: "checkin"
            },
            {
                id: "search-playbook-last-night-2",
                bindingKey: "last-night:2",
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
                id: "search-playbook-last-night-3",
                bindingKey: "last-night:3",
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
