# 星海攻略搜尋與 AI 解答規格 (Search Rules)

本文件描述目前網站中的 `搜尋` 與 `AI 解答` 功能，重點是把「實際已上線的搜尋規則」寫清楚，方便之後維護時直接對照。

本文件回答 4 件事：

1. 搜尋現在會索引哪些內容？
2. AI 目前怎麼理解自然語言問句？
3. AI 會怎麼挑證據卡、整理長答案、處理來源差異？
4. 未來新增資料或調整規則時，哪些地方一定要同步更新？

---

## 1. 功能定位

目前網站的搜尋分成兩層：

| 模式 | 位置 | 任務定位 | 是否使用雲端模型 |
| :--- | :--- | :--- | :---: |
| 關鍵字搜尋 | 搜尋浮層 `Quick Find` | 直接查找站內卡片與片段並跳轉 | 否 |
| AI 解答 | 同一個搜尋浮層內 | 先做站內召回，再由 Worker 依命中證據整理成長答案 | 是 |

核心原則：

- **本地搜尋必須保留，不能被 AI 取代。**
- **AI 只能根據本站已命中的內容回答，不能外查。**
- **AI 回答必須附引用來源，並可點回原區塊。**
- **AI 預設以較完整的報告模式回答；短答只作相容或 fallback。**

---

## 2. 可搜尋的資料來源

### A. 動態資料層

主要來自 [data.js](./data.js)：

- `cruiseSchedule`
- `deckGuideData`
- `showGuideData`
- `playbookGuideData`

這四組資料經過 [script.js](./script.js) 建立搜尋索引後，可提供：

- 每日行程事件
- 甲板與設施導覽
- 表演資訊
- Playbook 攻略卡

### B. 靜態區塊層

來自 [index.html](./index.html) 的靜態 section：

- `#overview`
- `#timeline`
- `#checkin`
- `#facilities`
- `#entertainment`
- `#tips`
- `#local-info`

這些區塊在載入時由 DOM 掃描成靜態搜尋文件。

---

## 3. AI 專用索引單位

AI 解答不再只吃「整張卡片摘要」，而是使用較細的 `parent + field chunks` 結構。

### A. Playbook chunking

每張攻略卡除了 `parent` 卡外，還會拆成：

- `whenToUse`
- `action`
- `tripFit`
- `caution`

這是目前 AI 深層召回最重要的資料來源。

### B. Schedule chunking

行程卡會拆出：

- `time`
- `tag`
- `desc`

### C. Deck / Show chunking

甲板與表演卡會拆出高價值欄位，例如：

- `summary`
- `bestTime`
- `tripUse`
- `theme`
- `timingTip`
- `tripLink`

### D. 每筆 AI 文件會保留的關鍵欄位

AI 檢索與 Worker chunk 會保留這些資訊：

- `id`
- `parentId`
- `title`
- `sourceType`
- `sourceDetailType`
- `fieldType`
- `fieldLabel`
- `structuredText`
- `text`
- `timeHint`
- `bestTimeHint`
- `locationLabel`
- `navTarget`
- `evidenceRole`

其中 `sourceDetailType` 對 Playbook 特別重要，目前會明確區分：

- `official`
- `concierge`
- `community`
- `general`

---

## 4. 搜尋 UI 與互動邏輯

### 搜尋浮層

搜尋入口位於導覽列 `搜尋` 按鈕，浮層掛載於 [index.html](./index.html) 的 `#search-overlay`。

目前 UI 已升級為近全螢幕工作台：

- 桌機：`width: min(1440px, 94vw)`、`height: calc(100vh - 32px)`
- 桌機優先雙欄：
  - 左欄：AI 長答案
  - 右欄：搜尋結果卡片清單
- 手機：改為單欄堆疊，但保留長答案區與結果列表

### 搜尋面板互動原則

- 搜尋列與 AI 操作區固定在上方
- AI 答案區與結果清單都可各自捲動
- 中文輸入法組字期間不可誤送出
- 按 `Enter` 與按 AI 按鈕必須走同一條 submit 流程
- 引用點擊後必須能正確跳到對應卡片

### 結果卡顯示方式

右欄結果卡現在不是只有短 snippet，而是高資訊密度摘要：

- 顯示較長 snippet
- 優先使用 `structuredText`
- 可直接顯示 2 到 4 個重點
- 顯示 `sourceDetailType`、`fieldType`、`timeHint / bestTimeHint`

---

## 5. 本地關鍵字搜尋規則

關鍵字搜尋是純前端、本地、無 AI 的第一層搜尋。

規則：

- 先做字串正規化：小寫、全半形統一、去標點、壓縮空白
- 支援手工同義詞字典
- 以 `title / keywords / text` 做加權排序
- 命中後顯示原文摘錄，不做 AI 生成

### 別名維護位置

主要維護點在 [script.js](./script.js)：

- `SEARCH_SYNONYM_GROUPS`
- `AI_QUERY_EXTRA_SYNONYM_GROUPS`

### 什麼時候要補同義詞

若未來新增內容時出現以下情況，就應補 synonym：

- 中英文名稱並存
- 官方名稱與社群口語差很多
- 使用者高機率會用口語搜尋，但資料中使用正式名稱

---

## 6. AI 查詢理解規則

AI 解答不是直接把原句丟給模型，而是先在前端做 query understanding。

### A. `hard anchors + soft modifiers`

目前查詢理解的核心規則是：

- `hard anchors`
  - 專有名詞、主體詞、明確地點、服務名、Day / 時段
  - 例如 `Room Service`、`Open House`、`Lounge`、`Day 1`
- `soft modifiers`
  - 輔助描述詞、限制詞、問題形式
  - 例如 `注意事項`、`流程`、`要不要`、`值不值得`、`比較`

排序原則：

- **先保住 hard anchors 命中**
- **soft modifiers 只做 rerank，不主導排除**
- 如果一張卡只命中輔助描述詞、完全沒命中主體，會被降權

### B. `subjectClusters`

除了 hard anchors，前端還會產生 `subjectClusters`，把同主題的相關詞彙併成一組，作為後續：

- sibling expansion
- bridge expansion
- same-subject detail 補抓

### C. 問題 facet 拆解

AI 目前會把問句拆成這些 facet：

- `goal`
- `time`
- `entityPlace`
- `audience`
- `risk`
- `alternatives`

### D. evidence layers

前端還會額外產生 AI 證據規劃層：

- `core`
- `extension`
- `rulesLimits`
- `timingContext`
- `sourceContrast`

這些 layer 不是給使用者看的，而是給證據卡選取與 Worker prompt 使用。

---

## 7. AI 檢索流程

### A. 第一輪本地召回

前端會先跑多組 query bundles，再合併排序結果。目標不是只抓「字面最高分」，而是先抓主體卡，再補同主題細節卡。

### B. 單次 rewrite 回補

若第一輪召回不足，但仍有可用 seed evidence，前端會：

1. 取最多 `4` 張 rewrite seed 結果
2. 呼叫 Worker `query_rewrite_v1`
3. 只重跑 **一次** 本地搜尋

限制：

- rewrite 最多一次
- 不允許無限重試
- 不允許外部網路搜尋

### C. 預設回答模式

目前 AI 搜尋預設模式是：

- `report` 為主
- `compact` 僅作相容、fallback 或資料不足時使用

目前主要配置：

- 預設模式：`report`
- `AI_REPORT_MAX_RESULTS = 24`
- `AI_REPORT_MAX_PARENTS = 10`
- `AI_REPORT_MAX_PER_PARENT = 4`

---

## 8. 證據卡選取規則

AI 現在不是固定抓前幾張高分卡，而是依角色與層次補齊證據。

### A. report mode 的主要 evidence roles

目前 report mode 會優先補這些角色：

- `core-answer`
- `same-subject-detail`
- `rules-limits`
- `timing-context`
- `source-contrast`

### B. sibling expansion

命中 parent card 後，會優先補同 parent 的高價值欄位。

例如：

- `playbook`：`action + caution + whenToUse + tripFit`
- `schedule`：`time + desc`
- `deck/show`：`summary + bestTime + tripUse / timingTip / tripLink`

### C. bridge expansion

若問題跨多張卡，還會補抓：

- 同一 `entity`
- 同一 `day / time`
- 同一 `navTarget`
- 同一 `sourceDetailType`

### D. 精準度優先原則

- `playbook / deck / show` 這類細節卡優先於廣泛 schedule 總覽
- `schedule` 主要提供順序、時段與上下文
- 若問題是技巧、限制、服務細節，廣泛總覽卡不能蓋過高精度攻略卡

---

## 9. Worker 模式與請求合約

目前 Worker 主要支援兩種模式：

- `grounded_qa_v1`
- `query_rewrite_v1`

### A. `grounded_qa_v1`

前端送給 Worker 的重要資料：

- `query`
- `chunks`
- `responseMode`
- `analysisPlan`

其中 `analysisPlan` 目前至少包含：

- `responseMode`
- `intentType`
- `activeFacetNames`
- `triggerReasons`
- `hardAnchors`
- `softModifiers`
- `subjectClusters`
- `facetSummary`
- `evidenceLayers`
- `evidenceSummary`

### B. `query_rewrite_v1`

用途是把自然語言問句整理成較適合本站搜尋的 query，不直接回答問題。

---

## 10. AI 回答輸出規格

### A. Top-level 相容欄位

目前回傳會保留這些欄位：

- `answer`
- `bullets`
- `citations`
- `confidence`
- `primarySourceType`
- `missingReason`
- `insufficientData`
- `sections`
- `sourceBreakdown`
- `followUpHint`

### B. `sections`

`sections` 目前主要包含：

- `directAnswer`
- `recommendedSteps`
- `whyThisWorks`
- `watchOuts`

### C. `report`

在 `report` 模式下，AI 會另外回傳結構化長報告，主要欄位包含：

- `headline`
- `executiveSummary`
- `recommendedPlan`
- `detailBreakdown`
- `decisionAnalysis`
- `risksAndFallbacks`
- `topicGroups`
- `cardHighlights`
- `sourceComparison`
- `unansweredQuestions`
- `sectionCitationIds`

### D. `topicGroups`

`topicGroups` 是目前長答案的主顯示結構，不是附屬資訊。

每組至少包含：

- `groupTitle`
- `groupKind`
  - `core`
  - `extension`
- `entityType`
  - `facility`
  - `service`
  - `schedule`
  - `show`
  - `playbook`
  - `mixed`
- `summary`
- `detailItems`
- `sourceMix`
- `citationIds`

原則：

- `topicGroups` 優先負責展開大量細節
- `cardHighlights` 保留向下相容與 fallback 用途

### E. `sourceComparison`

若證據涉及不同來源層級，必須分開呈現：

- `official`
- `concierge`
- `community`
- `general`

不可把不同來源混成單一「好像都是同一個規則」的敘述。

---

## 11. AI 回答風格與內容規則

目前 AI 長答案的處理原則是：

- 先給核心結論
- 再給可執行的清單
- 再補同主題的大量細節摘要
- 盡量把已命中的同主題卡片細節都盤出來
- 不再主動壓成過短摘要

具體要求：

- 優先用列表整理
- 同主題卡盡量合併整理，不只摘一句
- 若有足夠證據，應該展開較長的細節清單
- 非單一卡直接陳述的結論，應標成 `綜合判斷` 或等價概念

---

## 12. Fallback 與穩定性規則

如果模型輸出不完整，Worker 不會直接放空白，而會自動補：

- `executiveSummary`
- `recommendedPlan`
- `detailBreakdown`
- `decisionAnalysis`
- `risksAndFallbacks`
- `topicGroups`
- `cardHighlights`
- `sourceComparison`

也就是說，即使模型漏掉部分結構，前端仍應該收到一份可讀的長報告骨架。

---

## 13. 相關檔案位置

### 前端

- [index.html](./index.html)
  - 搜尋浮層結構
- [script.js](./script.js)
  - 搜尋索引建立
  - query understanding
  - evidence selection
  - AI 搜尋流程
- [style.css](./style.css)
  - 搜尋工作台樣式
  - 長答案區塊樣式
  - `topicGroups` 顯示樣式

### Worker / 測試

- [worker/ai-answer.js](./worker/ai-answer.js)
  - Worker 主邏輯
  - prompt / schema / fallback / normalization
- [tests/ai-answer.smoke.mjs](./tests/ai-answer.smoke.mjs)
  - AI Worker smoke checks
- [tests/ai-retrieval.eval.mjs](./tests/ai-retrieval.eval.mjs)
  - 檢索規則 baseline
- [tests/fixtures/ai-retrieval-cases.json](./tests/fixtures/ai-retrieval-cases.json)
  - retrieval 測試題庫

---

## 14. 後續維護規則

若未來新增內容或規則變動，以下情況必須同步更新搜尋規格：

1. 新增全新資料來源類型
2. 新增新的靜態 section
3. 新增新的 `sourceDetailType`
4. 新增常用別名或高頻口語稱呼
5. 調整 evidence roles、report schema 或 fallback 規則
6. 調整 AI 預設回答模式

具體維護點：

- 前端檢索規則：更新 [script.js](./script.js)
- Worker 合約：更新 [worker/ai-answer.js](./worker/ai-answer.js)
- 文件：同步更新本檔
- 測試：同步更新 smoke / retrieval eval

---

## 15. 測試清單

### 關鍵字搜尋

- `禮賓`
- `Baymax`
- `Room Service`
- `Deck 17`
- `爆米花`
- `SGAC`

### AI 解答

- `第一天提早登船後最值得先做什麼？`
- `第一天提早登船後先去 Lounge 還是 Open House？`
- `禮賓有什麼特殊服務？`
- `禮賓怎麼提早進劇院？`
- `Room Service 半夜要怎麼點比較穩？`
- `Deck 17 有哪些適合孩子的補給？`
- `Baymax 電影院有字幕嗎？`

### Query relaxation 驗收

- `Lounge 注意事項`
  - 不能只命中 `caution`
  - 也要把 Lounge 主題卡與相關內容帶進來
- `Open House 流程`
  - 不能只回單一卡流程
- `Room Service 要不要點`
  - 要同時抓到操作、時段、社群心得與限制

### Long report 驗收

- 回答應包含 `topicGroups`
- 長答案可順暢捲動
- 右欄搜尋結果卡不被擠掉
- citation 點擊仍可正確跳轉

### 自動化驗證

- `node tests/ai-answer.smoke.mjs`
- `node tests/ai-retrieval.eval.mjs`

---

## 16. 一句話維護原則

**搜尋負責先把主體抓準、把同主題細節補齊；AI 只負責根據已命中的站內證據整理成可追溯的長答案。**
