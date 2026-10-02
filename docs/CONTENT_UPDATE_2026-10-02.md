# 2026/10/2 手冊與活動文件整合

## 範圍與來源

本輪是內容校正與查詢增補，不是改版或重新排航程。文件中的指示只當攻略素材，不作專案操作命令。保留航程／船上探索／行前準備三畫面、38 行程事件、132 主卡與所有舊 ID、清單儲存鍵、菜單 snapshot。`preview.html` 不改動、不納入交付。

| 文件 | 查核方式與邊界 | SHA-256 |
|---|---|---|
| DisneyAdventure手冊公版_0831.pdf | 27 頁影像手冊，渲染核讀；菜單主要核對 p.9–25。封面為 2026/9/24–9/28 四晚航次，不是本次 2027 航程。 | `055fa72056c7a47cb8f17ae08fad63c7851b23c1cb90b10e1652c612f5afc8db` |
| 活動整理.docx | 740 段落的跨航次整理；段落編號從 1 起算、空段亦計入，不是頁碼。只增補家庭相關項目。 | `0df294d00e42324726c07a0a87847879833dee1f4351da04cf42de1618f21d6c` |

原件保留在使用者桌面，不複製原 PDF／DOCX 到公開網站。中文是便於查詢的譯名，不冒稱官方繁體譯名。所有文件時間、價格與活動供應仍須查當航次 Navigator／現場通知。

## 整合對照

| 主題／來源 | 決策 | 網站落點 |
|---|---|---|
| 劇院入場，DOCX ¶6–17 | 修正「所有主秀固定預排」；區分已指派與當航次自由入場，不搬歷史時刻 | 既有劇院卡、Remember／Seas 卡與主秀 intro |
| Duffy，DOCX ¶24–62 | 補劇院／花園不同場地；沿用原 ID，不以表演等同預約合照 | 表演卡與 registry |
| 電影，DOCX ¶73–76、204–207 | 補 Family Movie Fun Time；字幕逐場確認，OC 不推定中文字幕 | Deck 7 電影院、活動查詢 |
| 兒少設施，DOCX ¶143–168、362–526 | 修正完整名稱與年齡；同時段子區可有不同開放模式，Open House 不是託管 | 既有 Oceaneer／Edge／Vibe 卡、活動查詢 |
| 家庭舞會、手作、卡拉 OK、Trivia，DOCX ¶170–303 | 摘要集中既有家庭活動卡；完整名稱和不同資格放查詢，不逐項加主卡 | Playbook family-planning:1、活動查詢 |
| Selfie at Sea，DOCX ¶326–340 | 舞台自拍不是一對一預約合照或保證簽名；已有相同活動先補原記錄 | 角色攻略、活動查詢 |
| 客房早餐，PDF p.18–19 | 補掛牌、選餐與送餐窗口；03:00 截止／06:00–09:30 是文件表單，當次表單優先 | 既有 Room Service 卡及菜單查詢 |
| 歡迎午餐，PDF p.4、9、20 | 不固定 Hollywood 或 Navigator’s；依各房資格與當次通知 | Day 1 原午餐事件、餐廳卡、禮賓午餐攻略 |
| 禮賓菜單，PDF p.21–25 | 輕食、現點熱食、全日菜單是不同窗口；全日菜單不等於 24 小時供餐 | Lounge 原卡、禮賓攻略與分餐段菜單 |
| Wheezy，PDF p.16 | 免費霜淇淋與付費飲品分開；飲品原 snapshot 不重加 | Deck 17 既有卡、霜淇淋查詢 |
| 緊急聯絡，PDF p.27 + 官方確認 | 船上先找船員／醫務；新加坡陸地與駐外急難分開 | 既有 local-info 群組，新增 `search-static-local-info-emergency` |

### 活動增補帳

原 507 筆全保留。201 筆既有中／英文名稱修正或還原，舊文字保留 `originalWording` 與搜尋別名；其餘既有記錄不因本輪家庭範圍而刪除。最終新增 43 筆，總計 550 筆活動查詢記錄，不是 550 個固定場次。

| DOCX 來源段落起點 | 新增數 | 內容 |
|---|---:|---|
| ¶143 | 5 | 各場館 Open House／登記與子區版本 |
| ¶182、193、196 | 3 | 全齡 Disney Junior、Silent Disco、Mickey Color Spin |
| ¶251 | 1 | Town Square 學畫畫版本 |
| ¶300 | 8 | 家庭選場用 Trivia 名稱／場地版本，仍逐場查 18+ |
| ¶326 | 4 | 原資料沒有的 Selfie at Sea 主題；其餘補原活動 |
| ¶362 | 12 | Oceaneer 兒童手作、遊戲、主題活動 |
| ¶426 | 6 | Edge 遊戲、電影與問答 |
| ¶476 | 4 | Vibe 手作、桌遊與問答 |
| **合計** | **43** | **507 + 43 = 550** |

去重時將 Garden Stage 視為 Disney Imagination Garden 同場地別名；文件未提供新場地時，先補已有公開活動，不另造一筆「Navigator 指定場地」。因此比初步候選 52 筆少 9 筆。Gotcha Registration 與正式遊戲、兒童 Bingo 與付費 Family Bingo、全齡與 Kids only 仍分開。

活動列的 `sourceRefs` 可回查段落；`audience / participation / participationNote / feeNote` 保留資格與費用邊界。90s Music Trivia 只修既有截斷英文，不新增成人活動。

### 菜單增補帳

原 550 snapshot 的 ID、順序、英文名稱與價格不變；95 筆主餐廳中文菜名與配對餐廳名稱校正。原描述不因 PDF 較短而刪掉，舊譯名作別名。新增 184 筆，總計 734 筆，分餐廳與餐段保存。

| PDF 頁碼 | 新增數 | 內容 |
|---|---:|---|
| p.9 | 21 | 登船午餐 |
| p.10 | 27 | 當日開放主餐廳早餐 |
| p.11／12／13 | 1／2／1 | 各餐廳冰淇淋選擇、Animator 蘑菇燉飯缺口 |
| p.14 | 8 | Stitch’s ’Ohana Grill |
| p.15 | 26 | Mowgli’s Eatery 12、Gramma Tala’s Kitchen 14 |
| p.16 | 6 | Wheezy 霜淇淋 1、Pizza Planet 5 |
| p.17 | 12 | Cosmic Kebabs；原飲品不重加 |
| p.18／19 | 13／11 | 客房早餐掛牌／一般餐點 |
| p.20 | 21 | 禮賓歡迎午餐，地點依通知 |
| p.21／22／23／24 | 8／6／5／9 | 禮賓早餐、午後、晚間與全日餐點 |
| p.25 | 7 | 禮賓日光甲板餐點 |
| **合計** | **184** | **550 + 184 = 734** |

配菜／醬料的一組可選項合列，不宣稱逐一品項總數；不同餐廳或餐段仍保留版本。`sourceCount=550` 專指原 snapshot，`recordsCount=734` 為總量，`supplementCount=184`。未列價格保持空值，未列標籤不推定過敏原或飲食保證；所有價格皆不是 2027 報價。

## 衝突、不採用與保留

- PDF 的 Wheezy Deck 12 誤植不採用，保留 Deck 17；醫務中心保留 Deck 9 船頭，不採用 p.27 船中標記。
- PDF p.13 的 `Sived Gex Scoup` 與同頁菜名不一致，不新增不明菜名或重複牛肉薄片。
- DOCX ¶322 在 Vibe 段落誤寫 Trivia-Edge，採同文件 ¶515 的 Trivia-Vibe，場館資格不混用。
- PDF Palo 成年限制、網路入口與現行較新基線不同，不覆蓋 Palo 10+、dclwifi.com、US$25 手環可退押金。
- 成人品飲、SPA、珠寶推廣不擴充；舊查詢項目保留，不因本輪範圍刪除。
- 角色出現、簽名、歷史電影片名、醫療費用、贈品與固定名額不作保證。菜單／時刻表不能推定免費。
- 原三晚 20:15（可能調整 15 分鐘）、Option 6 順序、1/27 08:30 Royal Gathering 完整保留；Moana 仍待場次。Day 2 客房早餐早起策略保留。

### 2026/10/2 官方交叉查核

- [DCL Adventure 活動預訂說明](https://disneycruise.disney.go.com/en-ca/faq/booking-reservations/disney-adventure-book-activities-faq/)：已指派與自由入場場次須分開。
- [DCL 友善旅遊資訊](https://disneycruise.disney.go.com/en-sg/guest-services/neurodivergent-guest-support/)：Family Movie Fun Time 部分燈光、較低音量，以及兒少分齡。不是本航次場次保證。
- [DCL Health Center](https://disneycruise.disney.go.com/en-eu/guest-services/health-center/)：Adventure 醫務位於 Deck 9 Forward。
- [新加坡政府聯絡資訊](https://www.gov.sg/contact-us/)：陸地救護／消防 995、警察 999。
- [領務局新加坡資訊](https://www.boca.gov.tw/sp-foof-areacp-10-fa952-1.html)：駐新加坡代表處急難救助 +65 9638 9436，非一般旅遊客服。

## 維護與驗收

可重複執行，不需 API、不重抓外站：

```powershell
node tools/update-activity-document.mjs
node tools/generate-menu-lookup-data.mjs --local-corrections
node tests/handbook-update.eval.mjs
```

活動修正規則在 `tools/activity-document-corrections.mjs`；菜單依序套用原 `tools/menu-document-corrections.mjs` 與新 `tools/handbook-menu-supplements.mjs`。來源雜湊在規則及資料中，手動增補明細可由上述表與每筆 `sourceRefs` 核算。

驗收不只放寬數量：原 507 活動 ID 的雜湊、550 菜單 ID／英文／價格／順序的雜湊均不變；原主卡與清單鍵沿用既有資料測試。活動完整名稱、跨年齡不誤合併、Crew 資格、餐段／來源、空價格與未知飲食標籤另有斷言。

本機瀏覽器 QA：1440、390、360 寬度，查詢與跳轉、Crew／返回焦點及捲動、清單持久化、菜單延遲載入／404 重試、file://、Service Worker 離線核心資料及已載入菜單均通過。手機是瀏覽器模擬，不是實機。

字級 QA：360、390、768、844、1440 寬度，正文 17px、200% 文字放大與間距覆寫通過；新欄位沿用原樣式，不縮字。不宣稱完整 WCAG 合規。

Build ID 同步為 `2026-10-02-handbook-v1`；大型菜單仍排除核心 precache，使用後才 runtime cache。本輪未 commit、push 或部署，線上版本與 HTTP 200 需於正式部署後另驗。
