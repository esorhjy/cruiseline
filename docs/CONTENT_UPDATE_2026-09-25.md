# 逐層攻略整合：動線、服務位置與現場備案

## 來源與查核邊界
- 使用者附件「Disney Adventure 探險號逐層設施、動線與親子攻略」，整理日期 2026/9/25。
- 原影片：柒柒夫妻543，2026/8/8 發布，[Disney Adventure 全船攻略](https://www.youtube.com/watch?v=UNViUQjf1uY)。本輪讀取使用者提供的影片整理，未逐格觀看，不將整理冒稱官方公告。
- [官方醫務資訊](https://disneycruise.disney.go.com/en-eu/guest-services/health-center/)：規劃查核確認 Adventure 在 Deck 9 Forward，醫療可能收費；實作直接開啟逾時，但官方搜尋索引再次取得位置表與收費說明。未增加診療、價格或用藥結論。
- [官方洗衣資訊](https://disneycruise.disney.go.com/en-ca/guest-services/laundry-services/)：本輪確認 Adventure 在 Deck 16，洗烘與用品付費、提供熨燙設備，時間看 Navigator。船頭分區僅影片線索，未聲稱官網確認。
- [Baymax 官方頁面](https://disneycruise.disney.go.com/en-id/onboard-activities/baymax-cinema/)：官方搜尋索引列四廳；直接開啟逾時，記錄為索引佐證，而非整頁查核。
- [官方泳池資格](https://disneycruise.disney.go.com/en/faq/onboard-activities/pool-restrictions/)：本輪確認 Infinity Pool 無最低年齡，未滿 12 歲須成人監督；影片成人限定說法不覆蓋官網，現場再看告示。

## 原有／補強／新增對照
| 落點 | 處理 | 內容邊界 |
| --- | --- | --- |
| Deck 5 商店 | 更新原卡 | 品項不同、先查開店；模型簽名詢問供應、截止及領取，不保證買到就可簽。 |
| Deck 6 劇院、客務 | 更新原卡 | 下層 6／上層 7 為影片入口線索，5 樓禮賓集合按通知。許願井僅找路線索。 |
| Deck 7 Baymax | 更新原卡及 registry | 雙影廳改四廳，不複製電影卡。 |
| Deck 8 Hollywood | 更新原卡 | 在可通行樓層移到船尾電梯，不穿越受管制兒童區。 |
| Deck 9 醫務 | 新卡 search-deck-deck9-health-center | 官方位置、尋求協助及可能收費，不新增醫療行程。 |
| Deck 9 Animator’s Table | 更新原卡及樓層摘要 | 留念畫作、硬式資料夾；試筆／塗色是旅客技巧，不貼到 Palate。 |
| Deck 10 花園 | 已有，保留 | 船頭經 11 樓下到花園的路線不重寫。 |
| Deck 10 Mowgli／Stitch | 更新原卡 | 烤餅、素食詢問；排隊曝曬、室內座位與替代餐點，不承諾品項。 |
| Deck 10 Cosmic Kebabs | 新卡 search-deck-deck10-cosmic-kebabs | 沿用 entity，中東風味替代，未填固定菜單或營業時間。 |
| Deck 11 花園上層 | 更新原卡 | 全景／遮陽與離角色遠的取捨，不堵演員電梯。 |
| Deck 16 洗衣 | 新分頁、新卡 search-deck-deck16-laundry | 排在 11／17 之間；主卡管位置設備，Playbook 管洗衣時機與取衣。 |
| Deck 17 食物／玩水 | 更新原卡 | Pizza 時段不套到 Pixar；手機保管、換衣、防曬與停開備案。 |
| Deck 18 Infinity | 更新原卡 | 保留資格；熱狗供應與費用先問，不保證免費。 |
| Moana 表演 | 更新原卡 | 座位依現場、不久曬；無合適場次或太熱就換活動。 |
| 角色、D Lounge | 更新原攻略 | Baymax 不預期簽名、不追逐；變裝服務分開、亮粉詢問；晚間逐場看資格。 |
| 隨身包／準備 | 更新攻略、新增 checklist artwork-folder | 簽名本、筆與硬式資料夾；新鍵預設未完成，不繼承舊狀態。 |

## 不變與不採用
- 38 個行程事件不增刪，只補 Day 1 動畫晚餐資料夾、Day 3 Hollywood 船尾電梯、Day 3 Moana 曝曬／室內備案。
- Option 6 順序、20:15 晚餐（可能調整 15 分鐘）、1/27 08:30 Royal Gathering 保留；Moana 仍為早餐換裝後候選，不保證上午演出。
- 原 129 個 ID、bindingKey、舊連結及原清單鍵保留；三卡加入後 132 主卡。550 筆菜單 snapshot、原封面與三畫面不變。
- 不採用醫療費／用藥、免費贈品、保證公主名額、跨家庭攝影共享、固定補貨日期。
- 不合併 Edge／Vibe／Oceaneer／Nursery 年齡，不把 D Lounge 全館標成人限定；Duffy 拍攝仍看當場告示。
- Palo、城堡商店、未實訪 Spa 位置不搬動；不新增 12–15 客房空白分頁、影片全文區塊、AI／API。

## 搜尋與驗收
- 新增 health-center、self-service-laundry 實體；cosmic-kebabs 沿用。三張設施 primary binding，洗衣攻略 support。
- 使用既有「服務」篩選，中英對照／Crew 由 registry 生成；taxonomy 已動態讀 registry，不維護重複別名字典。
- 增加畫作資料夾、Hollywood 船尾電梯、劇院上下層入口 hints；不改搜尋排序。
- 新 tests/deck-guide-update.eval.mjs 鎖定原 129 個 ID 雜湊、38 行程與新查詢；舊 boarding 測試保留原 120 ID、原清單鍵及菜單 snapshot 驗收。
- 執行既有資料、家庭行程、搜尋、notebook 與字體瀏覽器回歸；增測 Deck 16 服務、手機新卡、搜尋跳轉及離線內容。
- Build：2026-09-25-deck-guide-v1，同步 index 核心資產與 Service Worker。
- 瀏覽器測試是本機自動化模擬，不等於手機實機、船上網路或正式部署；本輪不提交 preview.html。

### 本輪驗收結果
- 5 個核心 JS 語法檢查、8 組資料／搜尋／家庭行程測試通過，git diff 空白檢查通過。
- Notebook 瀏覽器回歸通過 1440、390、360px：Deck 16 排序與服務篩選、新卡搜尋跳轉、Crew、清單持久化與新資料夾預設未勾選皆通過，未發現頁面 JavaScript 例外。
- file:// 開啟、離線重載、離線新卡搜尋與菜單 runtime cache 通過；550 筆菜單仍完整，首頁不預載菜單。
- Typography 回歸通過，含 200% 字體放大與使用者文字間距覆寫；本輪未改 CSS 或版型。
- 尚未 commit、push 或驗證正式網站部署。
