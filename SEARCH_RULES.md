# 搜尋規則

## 目標
- 網站只保留純關鍵字搜尋，不再保留任何 AI 搜尋、AI 回答、遠端 Worker 或版本握手流程。
- 搜尋體驗以「簡單、快速、可預期」為優先，讓使用者輸入關鍵字後直接看到最核心、最可用的卡片。
- 搜尋結果採 `強力合併 + 精準優先`，先保住專有名詞與主體卡，再少量補充支援內容。

## 搜尋輸入
- 使用者輸入關鍵字後，直接走單一路徑的站內搜尋。
- 不存在模式切換，也不存在 AI submit 分支。
- 搜尋最短長度為 `2` 個字元。
- `file://` 直接開啟 `index.html` 時也必須可正常搜尋，不依賴後端。

## 搜尋資料來源
- 行程：`cruiseSchedule`
- 甲板與設施：`deckGuideData`
- 表演：`showGuideData`
- 攻略：`playbookGuideData`
- 專有名詞與 alias registry：`search-entity-registry.js`
- 搜尋 taxonomy：`search-keyword-taxonomy.js`

## 搜尋資料層
- 每張搜尋文件應盡量能推得出或提供：
  - `canonicalEntityIds`
  - `properNounTokens`
  - `aliasTokens`
  - `categoryFamilies`
  - `capabilityTags`
  - `entityRefs`
  - `supportForEntityRefs`
  - `entityFamilies`
- 純搜尋內部會另外推導以下排序與去重欄位：
  - `dedupeKey`
  - `themeEntityId`
  - `isSupportLike`
  - `anchorStrength`
  - `entityBreadth`
- 這些欄位只服務搜尋排序、分群與去重，不是前台內容欄位。

## 命名與 metadata 維護
- 英文正式名稱作為 canonical entity 的主鍵基礎。
- 中文名稱可作為顯示名稱與搜尋 alias，但必須能對應回 canonical entity。
- 若同一設施、表演或服務有多種叫法，優先在 registry 補 alias，不要在搜尋程式中硬寫特殊規則。
- 若搜尋不準，優先檢查：
  1. canonical entity 是否對齊
  2. alias 是否完整
  3. `categoryFamilies`、`capabilityTags`、`entityRefs` 是否齊全
  4. 最後才調整排序公式

## 排序策略

### 1. Exact-anchor first
- 搜尋會先拆出三層訊號：
  - `literal anchors`
    - 原始關鍵字
    - 中英專有名詞
    - 明確物件詞，例如 `deck`、`theatre`、`room service`
  - `entity/category matches`
    - canonical entity
    - alias
    - `entityRefs`
    - `categoryFamilies`
    - `capabilityTags`
  - `support matches`
    - schedule
    - static
    - 支援型攻略卡
- 排序固定採：
  1. `literal anchors`
  2. `canonical entity / alias`
  3. `category / capability`
  4. `support` 類補位

### 2. Breadth penalty
- 對綁很多 `canonicalEntityIds` 的泛用攻略卡套用 `breadth penalty`。
- 若 query 沒有精準命中其 title / proper noun，而該卡綁了很多 entity，必須降權。
- 目的：
  - 避免爆米花桶、泛用行前攻略、廣義禮賓提醒等卡片在 `concierge`、`劇院` 這類 query 下衝到前排。

### 3. Schedule 預設為支援層
- 若 query 沒有明確 `Day / 晚上 / 下午 / 登船 / 下船 / 行程 / 時段` 訊號，`schedule` 一律視為 support。
- `schedule` 不可壓過 deck / show / playbook 主卡。
- 只有 query 明確在問行程或時段時，schedule 才可升權。

## 去重與主題合併
- 搜尋結果採 `rank -> dedupe -> render`，不直接渲染原始 top-N 排序。
- 去重規則分三層：
  1. `same parent`
     - 同 `parentId` 只保留一張
  2. `same entity theme`
     - 同一 query 下，若多張卡指向同一核心 entity，優先保留最核心的 1 張主卡，其他只在需要時保留 1 張補充卡
  3. `schedule cluster`
     - 同一實體、同一天 / 同時段 / 同 query 主題的 schedule 強力合併，只保留最具代表性的一張

### 結果配額
- 前排結果配額固定為：
  - `primary` 最多 `6`
  - `playbook` 最多 `3`
  - `schedule` 最多 `1`
  - 其他 support 最多 `1`
- 預設最多顯示 `10` 張。
- 這些上限的目的是讓主卡穩定在前排，避免支援卡或重複 schedule 洗版。

## 結果卡呈現
- 每張結果卡只保留：
  - 一行 `source label + location` meta
  - `title`
  - 一段 `summaryLine`
  - 可選 `1-2` 個 chips
- 不再同時顯示：
  - `highlights`
  - `snippet`
  - 重複的 location 行
- `summaryLine` 依來源類型決定：
  - `schedule`
    - `日期/時段 + 這段行程真正做什麼`
  - `deck/show`
    - `這個設施/表演是什麼 + 何時最值得看/用`
  - `playbook`
    - `這張攻略最核心的做法或提醒`
- 長欄位標籤如 `日期：/ 時段：/ 重點：/ 任務：/ 來源層級：` 不直接裸露；渲染前應先轉成自然摘要句。

## UI 原則
- 搜尋 overlay 保留，但走精簡版工作台。
- 不顯示：
  - AI 按鈕
  - 模式切換
  - AI 回答區
  - AI 版本提示
- Header 保持精簡，第一屏盡量直接看到結果卡。
- `行程 / 甲板與表演 / 攻略本` 分組可保留，但只顯示經過去重後的高品質結果；若某組沒有高品質命中，可不顯示該組。

## 明確不保留的能力
- 不可讓前端依賴 `/api/ai-answer` 或任何遠端 AI endpoint。
- 不可保留 AI mode、AI answer state、AI session cache、Worker schema version 檢查。
- 不可再引入 Cloudflare Worker、Wrangler 或 AI 回答部署鏈路。
- 不可把搜尋結果退回成寬鬆探索式清單；本專案的搜尋預設是精準優先，不是廣撒網。

## 維護順序
1. 先修 canonical entity 與命名
2. 再補 alias / category / capability / entity metadata
3. 再調整排序與去重
4. 最後才微調卡片 UI 與 spacing

## 驗收
- 中英專有名詞能命中正確主卡：
  - `concierge`
  - `禮賓`
  - `Concierge Sundeck`
  - `Baymax Cinemas`
  - `Walt Disney Theatre`
- 泛稱與 capability 查詢能靠 metadata 命中合理結果：
  - `有哪些設施可以游泳`
  - `有哪些禮賓設施`
  - `劇院有哪些表演`
- 同主題 schedule 卡不可在前排重複洗版。
- 泛用攻略卡不可因綁很多 entity 就壓過核心主卡。
- 每張結果卡只保留一段主摘要，不再同時出現 highlights 與 snippet。
- 本機直接開 `index.html` 時，不應對任何 AI endpoint 發出請求。
