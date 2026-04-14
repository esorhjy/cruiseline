# 星海攻略搜尋與 AI 解答規則手冊 (Search Rules)

本文件是目前 Quick Find 搜尋與 AI 解答層的正式規格。重點不是單看 prompt，而是把 `資料層 -> query understanding -> retrieval -> coverage -> AI 生成 -> 前端呈現` 串成一條可維護流程。

---

## 1. 核心原則

1. 先修資料層，再修搜尋層。
2. 專有名詞先對齊 registry，不再讓散落自由文字主導。
3. 搜尋結果的主體優先順序是：
   - 設施 / 甲板 / 表演 / 攻略卡
   - 行程只作支援層
4. 左欄 AI 解答必須和右欄高價值結果對齊，不能只摘要部分卡片。
5. AI 回答現在以「三段自然語言攻略文章」為主，不再以逐卡摘要作為主要閱讀模式。
6. 遠端 Worker 與前端必須維持版本握手；只改前端但不重部署 Worker 不算完成。

---

## 2. 搜尋與 AI 的權責分工

### 資料來源

搜尋與 AI 解答主要取用以下檔案：

1. [ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js)
2. [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)
3. [ai-query-taxonomy.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-query-taxonomy.js)
4. [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)
5. [worker/ai-answer.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/worker/ai-answer.js)

### 分工

- `ai-entity-registry.js`
  - 專有名詞單一事實來源
  - 管 canonical entity、別名、family、capability、關聯
- `data.js`
  - 站內原始內容與 metadata
- `ai-query-taxonomy.js`
  - 由 registry 驅動的 alias、genericClasses、cluster、capabilityProfiles
- `script.js`
  - 本地 query understanding merge
  - 本地 retrieval、coverage planning、前端 fallback、左欄 rendering
- `worker/ai-answer.js`
  - AI query interpretation
  - grounded answer
  - section-first 長文章生成
  - deterministic fallback

---

## 3. Proper Noun Registry 規則

[ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js) 是所有專有名詞的單一事實來源。

每筆 entity 至少應包含：

- `entityId`
- `officialNameEn`
- `displayNameZh`
- `officialNameZh?`
- `translationType`
- `entityType`
- `categoryFamilies`
- `capabilityTags`
- `aliases`
- `deckHints`
- `area`
- `relatedEntityIds`
- `sourceUrls`
- `sourceAuthority`
- `lastVerifiedDate`

維護規則：

- 英文官方名是 canonical key。
- 中文主顯示名與英文正式名分欄，不要自由拼裝到 title。
- 若中文不是 Disney 官方提供，要標成 `site-localized`。
- 新餐廳、新設施、新表演、新商店、新 concierge 空間，先更新 registry，再更新內容卡或搜尋規則。

---

## 4. 內容卡 Metadata 規則

高價值內容卡至少要補：

- `entityRefs`
- `supportForEntityRefs`
- `keywordHints`
- `contentRole`

### primary / support 分層

- `deck / facility / show / playbook` 通常是 `primary`
- `schedule / SOP / caution / timing` 通常是 `support`

### 維護原則

- 行程卡如果只是在支援某個設施、表演或攻略主體，請掛 `supportForEntityRefs`
- 不要讓 schedule 因為自由文字碰巧命中，就搶走主體位置
- `keywordHints` 只補自然文字不容易帶出的關鍵詞，不要把整段摘要硬塞進去

---

## 5. Query Understanding 規則

每次 AI 搜尋都先跑 `query_interpretation_v3`。

### 必要輸出

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

### 原則

- `literalAnchors`、專有名詞、時間、否定詞優先。
- `requiredCapabilities` 是硬條件，例如：
  - `swim`
  - `eat`
  - `drink`
  - `watch-show`
  - `kids-play`
  - `rest`
  - `shop`
  - `spa`
- `expandedCategories` 只能在 capability 與主體不衝突時擴張。
- `流程 / 注意事項 / 所有細節 / 要不要 / 值不值得`
  - 只決定 section 與 coverage 深度
  - 不可把檢索縮成只剩 action / caution

### fallback

若 `query_interpretation_v3` 失敗，回退到本地 parser + registry-driven taxonomy。

---

## 6. Retrieval Pipeline 規則

目前流程固定為：

1. `AI Query Planner`
2. `Local Retrieval Executor`
3. `Coverage Judge`
4. `Gap Fill`
5. `AI Report Writer`
6. `Deterministic Post-process / Backfill`

### query bundles

- `precision`
- `alias`
- `capability`
- `class`
- `task`

### 排序原則

1. 先保 `precision`
2. 再保 `alias`
3. 再用 `capability + class` 擴張
4. 最後用 `task` 決定 evidence role 與 section

### capability gating

若 query 有能力條件，primary results 必須先滿足能力條件，不能讓泛稱沖散結果。

例如：

- `有哪些設施可以游泳`
  - primary 應優先命中 pool / splash / slide / sundeck pool
  - 不可讓 theatre / cinema / shop 跑到前面

---

## 7. Coverage Contract 規則

左欄 AI 解答不能只依賴模型自由選卡，必須遵守 coverage contract。

### 核心欄位

- `mustRenderVisibleParentIds`
- `mustRenderDerivedParentIds`
- `preferredSupportParentIds`
- `mustCoverCategories`
- `preferredClusters`

### 原則

- 右欄高價值可見卡是硬契約的一部分。
- `deck / facility / show / playbook / service` 是高價值主體卡。
- `schedule` 只能作支援脈絡，不得取代主體卡。
- 若模型漏寫主體卡，deterministic backfill 必須補齊。

---

## 8. AI 生成規則

### 目前正式模式

AI 回答已從「逐卡摘要」改為「三段自然語言攻略文章」。

左欄主閱讀模式固定為：

1. `行程區塊`
2. `甲板設施 / 表演區塊`
3. `攻略區塊`

### 生成策略

- 採 `prompt-first prose mode`
- 對模型只要求最小必要結構
- 內部保留 `parentBriefs / fullCardInventory / coverageSummary / topicAppendix` 當素材與 fallback
- 正文不再逐卡渲染

### prompt 規則

Worker 的主 prompt 必須遵守：

- 先用行程資料整理排程攻略
- 再用甲板 / 設施 / 表演整理內容攻略
- 最後用攻略卡整理心得、注意事項、小技巧
- 不要逐卡摘要
- 不要直接貼原始欄位詞
- 不要用資料清單語氣
- 若多張卡重疊，先合併後再敘述
- 若結論是跨卡推導，要標示為 `綜合判斷`

### response shape

`report.longformArticle` 主結構固定為：

- `headline`
- `sections`
- `sourceComparison`
- `unansweredQuestions`

`sections` 固定三組：

- `schedule`
- `deckShow`
- `playbook`

每個 section 至少包含：

- `sectionKey`
- `sectionTitle`
- `narrativeParagraphs`
- `citationIds`
- `renderOrigin`

### fallback 規則

- Gemini 失敗時，Worker 仍要回 `200`
- fallback 必須直接產出 section-first 文章
- `Gemini request failed` 不可當作正文顯示

---

## 9. 前端顯示規則

左欄主體只顯示：

- 精簡理解標籤
- 三段文章正文
- 每段末尾 citations
- 文末來源差異與缺口

不再把以下內容當主閱讀介面：

- 逐卡 title / chips / summary
- 大型 coverage banner
- 大型 summary block
- 大型 meta hint

右欄搜尋結果維持原樣，繼續作對照與跳轉。

---

## 10. Worker 版本握手與部署規則

### 必備欄位

Worker 回應必須包含：

- `workerBuildId`
- `workerSchemaVersion`
- `workerCapabilities`

Worker 必須提供：

- `GET /api/ai-answer?health=1`

### 前端規則

前端每次送 AI 問答時，必須附上：

- `expectedWorkerSchemaVersion`

若遠端 Worker schema 落後：

- 畫面要顯示 mismatch warning
- 不可靜默假裝是新版結果

### release blocker

只要以下任何一項有變更，就必須重新部署 Cloudflare Worker：

- `worker/ai-answer.js` schema
- fallback 邏輯
- section-first 長文章生成
- coverage contract 驗收
- health/version metadata

---

## 11. 維護順序建議

若搜尋或 AI 回答不準，請依這個順序處理：

1. 檢查 [ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js)
2. 檢查 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js) 的 `entityRefs / supportForEntityRefs / contentRole`
3. 檢查 [ai-query-taxonomy.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-query-taxonomy.js) 的類別與 capability 關聯
4. 檢查 [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js) 的 planner / retrieval / coverage
5. 最後才調整 [worker/ai-answer.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/worker/ai-answer.js) prompt 與 fallback

也就是說：

- 先修資料層
- 再修 query understanding
- 再修 retrieval / coverage
- 最後才修 AI 文風

---

## 12. 本輪新增共識

這一輪新增並固定下來的規則是：

- AI 回答主模式改為 `三段自然語言攻略文章`
- 生成策略採 `預設指令驅動 + 最小結構回傳`
- section dossier 只提供整理過的素材，不再把大量 card labels 直接灌進 prompt
- fallback 也必須寫成旅伴式攻略，而不是資料 dump
- 左欄優先顯示正文，meta 資訊降到次要層

後續若再優化文風，請沿著這條路徑做：

- 減少模板句型
- 降低名詞堆疊
- 強化 section 間的自然銜接
- 但不要回退到逐卡摘要模式
