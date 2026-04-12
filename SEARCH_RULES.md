# 星海攻略搜尋與 AI 解答規則手冊 (Search Rules)

本文件描述目前網站內建搜尋與 AI 解答層的實作規則。重點不是介紹產品願景，而是回答這三件事：

1. 自然語言問題目前怎麼被理解？
2. 站內資料目前怎麼被召回、篩選、驗收？
3. AI 長答案目前必須遵守哪些 coverage 與來源規則？

補充：若維護的是內容投放規則，而不是搜尋 / AI 邏輯，請改看 [CONTENT_RULES.md](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/CONTENT_RULES.md)。

---

## 1. 目前搜尋架構總覽

目前 AI 搜尋採用的是混合架構，不是「模型自由亂搜」：

1. `AI Query Planner`
2. `Local Retrieval Executor`
3. `Coverage Judge + Gap Fill`
4. `AI Report Writer`
5. `Deterministic Post-process / Backfill`

對應實作檔案：

- [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)
- [worker/ai-answer.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/worker/ai-answer.js)
- [ai-query-taxonomy.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-query-taxonomy.js)

核心原則：

- AI 先做語意規劃，不直接自由搜尋。
- 站內搜尋仍由本地索引執行，確保可控、可追溯、可離線。
- 生成前後都要做 coverage 驗收，不接受「右欄有、左欄沒寫到」。
- 設施 / 甲板 / 表演 / 攻略是主體優先，行程只作為支援層。

---

## 2. Query Understanding：`query_interpretation_v3`

每次 AI 搜尋都會先跑 `query_interpretation_v3`。它只負責產生搜尋規劃 JSON，不直接回答問題。

### 固定輸出欄位

- `canonicalQuery`
- `literalAnchors`
- `canonicalEntities`
- `genericClasses`
- `requiredCapabilities`
- `expandedAliases`
- `expandedCategories`
- `disallowedCategories`
- `coverageHints`
- `answerIntent`
- `breadthProfile`
- `negativeTerms`
- `confidence`

### 解讀原則

- `literalAnchors`
  - 使用者原句中的明確專有名詞、時段、樓層、Day 等硬條件
- `canonicalEntities`
  - 主要主體，例如 `禮賓`、`劇院`、`Room Service`
- `genericClasses`
  - 泛稱類別，例如 `設施`、`服務`、`表演`
- `requiredCapabilities`
  - 問句中真正的能力條件，例如：
    - `swim`
    - `eat`
    - `drink`
    - `watch-show`
    - `kids-play`
    - `rest`
    - `shop`
    - `spa`
- `disallowedCategories`
  - 這題不該擴張到的類別，例如游泳題要排除 `劇院 / 表演 / 商店`
- `coverageHints`
  - `流程 / 注意事項 / 所有細節 / 值不值得 / 要不要`
  - 這些詞只影響回答展開方式，不可縮窄檢索到單一欄位

### Guardrails

本地規則仍保留，但角色改成 guardrails：

- 明確專有名詞優先
- 時間與 Day 優先
- 否定詞與比較詞優先
- AI 可擴張主體與類別，但不可覆蓋明確時段或否定限制

---

## 3. Taxonomy 與 Capability Graph

[ai-query-taxonomy.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-query-taxonomy.js) 現在不只是 alias 表，而是搜尋規劃的合法擴張邊界。

### 目前至少包含

- `entity aliases`
- `generic classes`
- `category families`
- `cluster relations`
- `capabilityProfiles`

### Capability Profiles 的作用

Capability 不等於一般關鍵字，而是問句的硬條件。

例：

- `有哪些設施可以游泳`
  - 主體：`設施`
  - 必要能力：`swim`
  - 可擴張 family：`pool / splash / slide / sundeck pool`
  - 排除 family：`theatre / show / shop`

### 泛稱擴張規則

- `設施 / 地方 / 項目 / 體驗`
  - 預設可展到 `場館 + 服務 + 表演`
- `吃 / 餐點 / 補給`
  - 展到正式餐廳、快餐、自助、Lounge 補給、劇院前小食
- `玩 / 遊戲 / 活動`
  - 展到 kids club、arcade、水區、互動活動、秀場體驗
- `禮賓`
  - 展到 lounge、priority entry、meet & greet、concierge support、sundeck、spa/fitness support
- `劇院 / 表演`
  - 展到 theatre facility、shows、timing tips、entry SOP、queue / seating cautions

注意：

- 泛稱可以廣擴張
- 但一旦有 `requiredCapabilities`，擴張必須受 capability 約束

---

## 4. 搜尋文件與索引原則

站內資料仍然來自 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)，但搜尋層會把它轉成可檢索文件。

### 目前搜尋文件的重要欄位

- `parentId`
- `sourceType`
- `sourceDetailType`
- `fieldType`
- `structuredText`
- `entityFamilies`
- `capabilityTags`
- `supportOfParentIds`

### 來源優先序

一般來說：

1. `deck / facility / show / playbook`
2. `service / static detail`
3. `schedule`

說明：

- 設施 / 甲板 / 表演 / 攻略卡是主體層
- `schedule` 現在屬於支援層
- 行程只能掛在已命中的主體 parent 之下，不可反客為主

---

## 5. Retrieval：四段式流程

### 第一段：Planner

AI 先產生搜尋規劃：

- 主體是什麼
- 需要什麼 capability
- 可以擴張到哪些 family
- 應排除哪些 family
- 使用者要的是短答、清單、流程、比較，還是完整報告

### 第二段：Executor

本地搜尋固定使用 5 束 query bundles：

- `precision`
- `alias`
- `capability`
- `class`
- `task`

排序邏輯：

1. 先保 `precision`
2. 再保 `alias`
3. 再用 `capability + class` 擴張
4. 最後用 `task` 決定 evidence role 與回答區段

### 第三段：Coverage Judge

這一層不是寫答案，而是檢查結果夠不夠準。

例：

- 若題目是 `游泳`
- primary results 至少要命中泳池、水區、滑水、sundeck pool
- 若前排結果被 `劇院 / 表演 / 電影院 / 商店` 污染，就視為 coverage fail，必須補搜或重排

### 第四段：Gap Fill

只補缺少的 family 或 support evidence，不做無上限擴張。

要補的通常是：

- 缺少重要 capability family
- 缺少重要 source family
- 缺少已命中的主體之下的 support schedule / SOP / caution

---

## 6. Primary / Support Coverage Plan

目前左右欄都必須從同一份 coverage plan 派生。

### Primary Entity Parents

真正直接回答問題的卡：

- 設施
- 甲板
- 表演
- 攻略主卡

條件：

- 必須符合主體
- 若有 `requiredCapabilities`，必須同時符合 capability

### Support Entity Parents

與 primary entity 有明確關聯的支援卡：

- 行程時段
- SOP
- 補給
- 限制 / 注意事項
- 背景脈絡

規則：

- support 只能附著在已命中的 primary entity 之下
- support 不可取代 primary 成為答案主體

---

## 7. 可見結果 Coverage 契約

目前左欄不可以只依賴模型自由選卡，還必須對齊右欄已顯示的高價值卡片。

### 前端會建立

- `visibleCoverageContract`
- `mustRenderVisibleParents`
- `mustRenderDerivedParents`
- `preferredSupportParents`

### 規則

- 右欄前 N 張、且與主題相符的高價值卡
  - `deck / facility / show / playbook / service`
  - 必須進入左欄 coverage 契約
- inventory / breadth 題下
  - 左欄目標是 100% 覆蓋可見主卡
- 若模型漏寫
  - deterministic backfill 必須把卡補回來

換句話說：

- 右欄是參考來源
- 但其中的高價值相關卡，對左欄來說不是建議，而是硬性 coverage 目標

---

## 8. AI 長答案骨架

AI 長答案目前固定採：

1. `executiveSummary`
2. `fullCardInventory`
3. `topicAppendix`
4. `sourceComparison`
5. `unansweredQuestions`

### `fullCardInventory`

主體層，按 `expandedCategories` 或 `capabilityTags` 分組。

每張卡至少應整理：

- 位置 / 樓層
- 開放時段
- 能做什麼
- 注意事項
- 來源差異

### `topicAppendix`

附錄層，專門承接：

- 流程
- 例外
- 比較
- 社群心得
- 行程串接

### `sourceComparison`

來源必須分開：

- `official`
- `concierge`
- `community`
- `general`

不可混寫成單一事實。

---

## 9. Deterministic Post-process

模型輸出後，不能直接原樣顯示，還要再做 deterministic 驗收。

### 必做檢查

- primary entity coverage 是否足夠
- visible coverage 是否足夠
- capability coverage 是否足夠
- support evidence 是否有掛回 primary entity
- source difference 是否被混寫

### 若不足，必須補齊

- 缺 primary entity
  - 補 inventory item
- 缺 visible card
  - 補 `visible-backfill`
- 缺 derived card
  - 補 `derived-backfill`
- 缺 category coverage
  - 補 appendix
- 缺 support context
  - 補支援 bullets

因此，現在的 AI 長答案是：

- 模型生成
- 加上 deterministic 補齊

而不是完全相信模型第一版輸出。

---

## 10. 調整搜尋品質時，優先檢查什麼

### A. 問題太散、命中太廣

優先檢查：

- `requiredCapabilities` 是否有被正確抽出
- `disallowedCategories` 是否太弱
- `capabilityProfiles` 是否缺對應家族
- `primaryEntityParents` 是否被非 capability family 污染

### B. 右欄有、左欄沒寫

優先檢查：

- `visibleCoverageContract`
- `mustRenderVisibleParents`
- deterministic backfill 是否有補齊

### C. 行程卡消失或過多

優先檢查：

- `schedule` 是否正確落在 support layer
- `supportOfParentIds` 是否有建立
- schedule 是否反客為主搶走 primary inventory

### D. AI 長答案太短

優先檢查：

- `fullCardInventory` 是否有被壓縮
- `topicAppendix` 是否不足
- `coverageHints` 是否觸發 `exhaustive`
- post-process 是否提早接受 coverage 不足的模型輸出

---

## 11. 文件維護邊界

若未來要改搜尋 / AI 解答，優先看這幾個檔案：

- 搜尋規劃與 retrieval：
  - [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)
- AI interpreter 與 report writer：
  - [worker/ai-answer.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/worker/ai-answer.js)
- taxonomy / concept graph / capability profiles：
  - [ai-query-taxonomy.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-query-taxonomy.js)
- 檢索與 coverage 驗收測試：
  - [tests/ai-query-interpretation.smoke.mjs](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/tests/ai-query-interpretation.smoke.mjs)
  - [tests/ai-answer.smoke.mjs](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/tests/ai-answer.smoke.mjs)
  - [tests/ai-retrieval.eval.mjs](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/tests/ai-retrieval.eval.mjs)
  - [tests/ai-visible-coverage.eval.mjs](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/tests/ai-visible-coverage.eval.mjs)
  - [tests/ai-capability-gating.eval.mjs](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/tests/ai-capability-gating.eval.mjs)

若改的是內容本身，而不是搜尋規則，請優先更新 [CONTENT_RULES.md](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/CONTENT_RULES.md) 與 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)。
