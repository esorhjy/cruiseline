# 迪士尼探險號星海攻略：專案目標與改造藍圖 (Project Blueprint)

> [!IMPORTANT]
> 本文件定位為「星海實戰攻略」網站的頂層設計與策略藍圖，旨在為 4 大 3 小的禮賓客群提供最極致、防呆且優雅的郵輪旅遊助手。

---

## 1. 專案核心使命 (Mission Statement)

本專案目標不僅是一個資訊網站，更是一個**「數位航行助手 (Digital Sailing Assistant)」**。

* **核心宗旨：** 讓「攻略資訊」在最需要的時候（船上、忙亂中、斷網時）以最直覺的形式出現在家長手中。
* **關鍵對象：** 專為禮賓艙房家庭設計，最大化利用 VIP 特權，最小化行前焦慮。

---

## 2. 改造計畫分析：六階段進化論

### 第一階段：使用者體驗與導覽升級 (UX & Navigation) - **已完成**

* **分析：** 原始內容呈現為冗長的單頁流，資訊檢索效率低。
* **解決方案：**
  * 導入 **Sticky Navbar**（頂部固定導覽），讓「實用工具」與「核心資訊」隨手可得。
  * 實施 **Schedule Tabs**（行程頁籤化），將 4 天行程橫向切分，減少視覺壓力。

### 第二階段：資料 JSON 化與解耦合 (Data Decoupling) - **已完成**

* **分析：** 行程資訊隨官方更新而變動，硬編碼在 HTML 中會導致後續維護困難且容易壞版。
* **解決方案：**
  * 將行程抽離至 `data.js`，採用 **JSON 陣列格式**。
  * 建立 **Dynamic Rendering Engine**（動態渲染邏輯），讓資料與 UI 結構徹底分離。

### 第三階段：離線應用化與 PWA (Offline Capability) - **已完成**

* **分析：** 郵輪公海網路極不穩定，離線載入能力是「實戰攻略」能否發揮作用的關鍵指標。
* **解決方案：** 升級為 PWA (Progressive Web App)，確保即使在飛航模式下也能存取完整的行程與地圖。

### 第四階段：互動打卡與防呆清單 (Interactive Checklist) - **已完成**

* **分析：** 行前準備項目繁瑣且具備時間敏感性（如 130 天預約、40 天辦理登船、前 3 天填寫 SGAC），需要具備進度追蹤與分類提醒功能。
* **解決方案：**
  * **分類化管理：** 將清單拆解為「登船重要手續」、「預約與購買」、「事先準備」三大維度。
  * **狀態持久化：** 利用 `localStorage` 儲存勾選狀態，確保在手機瀏覽器重啟或離線時進度不遺失。

### 第五階段：甲板導覽與表演整合 (Deck Guide & Show Hub) - **已完成**

* **分析：** 原有頁面雖然已具備完整行程、餐飲與娛樂摘要，但甲板資訊仍分散在每日行程與後段說明中，使用者難以快速建立「哪一層做什麼、何時去最順」的空間感。
* **解決方案：**
  * 導入 **單層切換分頁式 Deck Guide**，集中呈現 Deck 5 / 6 / 7 / 8 / 10 / 11 / 17 / 18 / 19 與「表演精華」。
  * 將內容改寫為 **依已知行程重排的旅伴式導覽**，不只是設施百科，而是明確說明「這趟何時會用到」、「哪裡值得提早卡位」。
  * 把 **餐廳、玩水區、禮賓休息點、劇院與花園舞台** 整合進甲板脈絡中，形成更直覺的動線認知。
  * 將表演資訊獨立為 **Show Hub**，聚焦《Remember》、《Disney Seas the Adventure》、《Avengers Assemble!》、《Duffy and The Friend Ship》、《Moana: Call of the Sea》與《The Lion King: Celebration in the Sky》。

### 第六階段：故事書 Hero 與實戰攻略 Playbook - **已完成**

* **分析：** 當網站內容逐步完整後，首頁雖然資訊齊全，但情緒記憶點與「進階攻略」仍分散。使用者第一次打開網站，缺少一個能同時建立旅程氛圍與快速進入實戰技巧的主入口。
* **解決方案：**
  * 將首頁開場升級為 **Storybook Hero**，保留深海軍藍主視覺，導入本地圖片作為故事書式主畫面，讓網站一打開就有「準備啟航」的情緒感。
  * 將 Hero 從單純文字區升級為 **左文案 / 右主視覺** 的分欄結構，提升首頁辨識度與收藏感。
  * 新增 **實戰攻略 Playbook**，集中收納原本散落於筆記中的「進階使用術」，並用 mission chips + 可展開攻略卡的方式呈現。
  * 將攻略內容依 **官方規則 / 禮賓加值 / 社群心得** 明確分級，避免使用者誤把經驗談當成官方保證。
  * 對既有資訊進行 **去重與 cross-link 化**，讓 Playbook 成為「補強模組」，而不是第二份重複攻略。

### 第七階段：站內搜尋與 AI 解答層 (Search & Grounded AI Answers) - **已完成**

* **分析：** 當行程、甲板、Playbook 與靜態卡片逐步變多後，單靠滑動與導覽列已不足以支援船上快速查找。使用者需要一個能直接問「第一天先做什麼」「禮賓有什麼特殊服務」的快速入口。
* **解決方案：**
  * 新增 **Quick Find 搜尋浮層**，保留單頁架構不變，但讓使用者可從任意位置快速叫出搜尋面板。
  * 導入 **本地語意化關鍵字搜尋**，同時索引 `cruiseSchedule`、`deckGuideData`、`showGuideData`、`playbookGuideData` 與重要靜態 section。
  * 搜尋結果支援 **自動跳轉與自動展開**，可直達對應的 Day、Deck、Playbook mission 或靜態卡片。
  * 在不破壞原搜尋的前提下，新增 **Gemini grounded AI 解答模式**，並已進一步升級成 **AI 規劃 + 本地搜尋執行 + Coverage Judge 補搜 + AI 報告生成** 的混合架構。
  * AI Query Planner 已升級為 `query_interpretation_v3`：
    * 先抽出 `canonicalEntities`
    * 再判斷 `requiredCapabilities`
    * 再決定 `expandedCategories / disallowedCategories / answerIntent`
    * 避免泛稱擴張把問題沖散
  * AI 檢索策略已升級為 **主體優先 + capability gating + coverage contract**：
    * 設施 / 甲板 / 表演 / 攻略卡作為 `primary entities`
    * 行程只作為 `support context`
    * 右欄高價值可見卡會升級成左欄的 coverage 契約，避免「右欄有、左欄沒寫」
  * AI 回答模式已升級為 **預設完整報告模式**，以 `executiveSummary + fullCardInventory + topicAppendix + sourceComparison` 重組多張卡片，而不是只回精簡摘要。
  * AI 解答嚴格限制為 **只根據站內命中的內容回答**，並附引用來源、來源層級與信心提示，避免外部幻覺。
  * 搜尋面板已升級為 **近全螢幕雙欄工作台**，讓左側 AI 長答案與右側搜尋結果卡可以並排對照閱讀，並逐步對齊左右欄 coverage。
  * 針對中文輸入法、長答案與快取更新，補強 **form submit、composition 保護、單次 rewrite 回補、可捲動答案區、fallback 報告骨架、Service Worker 更新策略與快取版控**，確保實際可用性。

---

## 3. 建置關鍵邏輯與原則 (Design Principles)

補充說明：

* 內容投放規則與三大互動區塊分工，請參考 [CONTENT_RULES.md](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/CONTENT_RULES.md)。
* 搜尋與 AI 解答的維護規格，請參考 [SEARCH_RULES.md](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/SEARCH_RULES.md)。

### A. 關鍵邏輯：資料驅動 (Data-Driven Logic)

* **單一事實來源 (Single Source of Truth)：** 網頁不直接儲存行程內容，而是透過 JavaScript 讀取 JSON 物件。
* **階層化展示：** 從「每日目標」->「時段標頭」->「具體事件」、以及「甲板主題」->「關鍵設施」->「這趟用途」、再到「任務類別」->「攻略卡」->「何時用 / 這趟怎麼用 / 避免踩雷」進行階層式渲染，讓資訊呈現具備清楚節奏感。
* **模組化擴充：** 新功能優先採用獨立資料源與獨立 renderer，例如 `cruiseSchedule`、`checklistData`、`deckGuideData`、`showGuideData`、`playbookGuideData`，確保互動區塊彼此不干擾。
* **搜尋可追溯性：** 搜尋與 AI 解答都必須回到站內原文，保留 `搜尋命中 -> 跳轉定位 -> 使用者自行核對` 的路徑，不可讓模型成為唯一資訊來源。
* **主體優先、能力約束：** 自然語言問句中的主體詞、專有名詞與 `requiredCapabilities` 先決定 primary results，再決定可擴張類別，避免泛稱把答案沖散。
* **主體與支援分層：** 設施 / 甲板 / 表演 / 攻略卡是主體層，schedule 僅作支援層，不可反客為主。
* **左右欄 coverage 對齊：** 右欄已顯示的高價值卡會升級成左欄答案的 coverage contract，不接受模型只摘要部分卡片。
* **長答案可掃讀：** 當 AI 已命中多張高價值卡時，優先整理成 `完整盤點 + 深入附錄`，而不是主動壓回過短答案。

### B. 設計原則：Premium & Magicial

* **視覺優雅性 (Elegance)：** 拒絕平庸色彩，採用迪士尼經典海軍監、皇家金與晚宴紅，配合毛玻璃效果 (Glassmorphism)。
* **響應式防呆 (Mobile-First Optimization)：** 確保導覽列在手機上收合為漢堡選單，行程表按鈕面積加大，適合在移動中的船體上操作。
* **微動畫 (Micro-interactions)：** 透過水波紋背景、倒數計時跳動、魔法彩蛋 (confetti) 建立迪士尼特有的「驚喜感」。
* **情境開場 (Story-first Landing)：** Hero 不只是標題區，而是承擔「建立情緒、提示這趟旅行主題」的第一入口，強化首頁記憶點。
* **互動攻略化 (Interactive Guidance)：** 當內容量增大時，優先採用 tab、chips、accordion、badge 與 cross-link 這類互動模組，讓資訊保持可掃讀，而不是持續堆長文。
* **搜尋優先取用 (Search-first Retrieval)：** 當單頁內容持續增長時，優先提升搜尋、定位、引用與摘要能力，而不是無限制再擴充導航層級。

---

## 4. 目標里程碑 (Milestones)

| 階段 | 現狀 | 核心成果 |
| :--- | :---: | :--- |
| **重構** | ✅ | CSS/JS 外部化，程式碼清潔度 100% |
| **Phase 1** | ✅ | 導入導覽系統、行程切換頁籤 |
| **Phase 2** | ✅ | 資料 JSON 化動態生成、最新行程同步 |
| **Phase 3** | ✅ | 加入 Manifest/Service Worker 實現離線查閱 |
| **Phase 4** | ✅ | 實作三段式互動 Checklist、localStorage 持久化 |
| **Phase 5** | ✅ | 新增甲板與表演分頁導覽、依行程重寫設施動線與看秀節奏 |
| **Phase 6** | ✅ | 首頁升級故事書 Hero、本地主視覺圖片整合、實作 Playbook 互動攻略區塊 |
| **Phase 7** | ✅ | 新增 Quick Find 搜尋浮層、本地語意化搜尋、Gemini grounded AI 解答、`query_interpretation_v3`、capability gating、左右欄 coverage 對齊與完整長報告模式 |

---

## 5. 總結

本網站的開發邏輯始於「內容整理」，成於「結構重整」，並已進一步演化為兼具 **情緒開場、空間導航、實戰攻略、搜尋檢索與離線可用性** 的數位航行助手。我們堅持 **「內容與排版分離」**、**「資料驅動渲染」**、**「體驗導航化」**、**「互動攻略化」** 與 **「搜尋可追溯」** 五大原則，確保這份攻略不只是資訊完整，而是真的能陪伴兩家人順利完成 2027 年的星海航行。

目前專案已完成核心功能、主視覺、進階攻略體系與搜尋 / AI 解答層的建置，可視為本階段正式收尾；後續若再擴充，將以內容精修、搜尋品質、使用效率與維護性優化為主，而不再以大幅新增版塊為優先。
