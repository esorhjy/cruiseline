# 搜尋規則

## 目標
- 網站只保留純關鍵字搜尋，不再保留任何 AI 搜尋、AI 回答、遠端 Worker 或版本握手流程。
- 搜尋體驗以「簡單、快速、可預期」為優先，讓使用者輸入關鍵字後直接看到最核心、最可用的卡片。
- 搜尋結果採 `強力合併 + 精準優先`，先保住專有名詞與主體卡，再少量補充支援內容。

## 搜尋輸入
- 使用者輸入關鍵字後，依目前本地工具模式執行搜尋。
- 不存在 AI 模式、AI submit 分支或遠端回答流程。
- 搜尋 overlay 可保留兩個本地工具模式：`攻略搜尋` 與 `中英對照`；這不是 AI mode。
- 搜尋最短長度為 `2` 個字元。
- `file://` 直接開啟 `index.html` 時也必須可正常搜尋，不依賴後端。
- 搜尋面板可提供 quick chips；它們可預填關鍵字，也可切到 `中英對照` 的指定分類或篩選。
- 若沒有足夠搜尋證據，不應用基礎分數硬湊結果；未知 query 應顯示無結果狀態。

## 搜尋資料來源
- 行程：`cruiseSchedule`
- 甲板與設施：`deckGuideData`
- 表演：`showGuideData`
- 攻略：`playbookGuideData`
- 專有名詞與 alias registry：`search-entity-registry.js`
- 搜尋 taxonomy：`search-keyword-taxonomy.js`
- 船上設施/活動中英對照：`onboard-lookup-data.js`
- 完整菜單中英對照 snapshot：`menu-lookup-data.js`

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
- 若某張卡需要服務自然語句查詢，例如 `上船先做什麼` 或 `最後一天早餐`，優先在 registry binding 補 `keywordHints`。
- `keywordHints` 屬高價值查詢錨點，排序上可高於泛用欄位文字，但不可拿來堆疊無關詞。

## 中英對照與菜單查詢
- `中英對照` 模式服務船上溝通場景，結果卡需快速顯示中文確認、正式英文名稱、地點/Deck/餐廳與 Crew 用短句。
- `中英對照` 可有分類列；`餐點/餐廳` 類別需顯示餐廳 selector 與點餐段落 chips。
- 餐點資料不可在首頁同步載入；只有進入 `餐點/餐廳` 查詢時，才 lazy load `menu-lookup-data.js`。
- 上方導覽列的 `菜單` 必須直接開啟搜尋 overlay，切到 `中英對照 > 餐點/餐廳`，並維持空白 query 的餐點瀏覽狀態。
- 首頁不可再新增 `#menu-lookup`、大型菜單表或餐點瀏覽器 section。
- 餐點瀏覽與篩選邏輯固定為「先餐廳、再點餐段落」：
  - 餐廳來自 `menu-lookup-data.js` 的 restaurant metadata。
  - 點餐段落固定為 `全部 / 前菜 / 主餐 / 飲料 / 甜點 / 兒童/配菜`。
  - 空白 query 在餐點分類下可顯示餐廳/餐點結果；這是中英對照模式的例外，不適用一般攻略搜尋的空白狀態。
- `menu-lookup-data.js` 應由 `tools/generate-menu-lookup-data.mjs` 產生並保留完整來源 snapshot，目前 smoke test 基準為 `550` 筆。
- 同一英文菜名重複出現時，結果可合併顯示常見餐廳或分類，避免洗版。

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
  - AI 模式切換（攻略搜尋／中英對照切換必須保留）
  - AI 回答區
  - AI 版本提示
- Header 保持精簡，第一屏盡量直接看到結果卡。
- 攻略結果依搜尋引擎的最終排名逐張呈現，來源放在卡片 meta；不可再用固定的行程／甲板／攻略分組順序覆蓋排名，導致支援型行程跑到核心主卡前面。
- `中英對照` 模式下，結果區仍需優先；分類、餐廳 selector、點餐段落 chips 必須保持 compact。
- Crew 大字卡不可預設插在結果列表頂部；桌機用右側 preview pane，手機用 bottom sheet / overlay。

## 明確不保留的能力
- 不可讓前端依賴 `/api/ai-answer` 或任何遠端 AI endpoint。
- 不可保留 AI mode、AI answer state、AI session cache、Worker schema version 檢查。
- 不可再引入 Cloudflare Worker、Wrangler 或 AI 回答部署鏈路。
- 不可把搜尋結果退回成寬鬆探索式清單；本專案的搜尋預設是精準優先，不是廣撒網。
- 不可把菜單資料改回首頁同步載入，或把 `menu-lookup-data.js` 放回首頁底部 script。
- 不可把 `menu-lookup-data.js` 放進 Service Worker core precache；大型菜單資料只能 lazy load 後走 runtime cache。

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
- 重要高頻查詢需納入 smoke test：
  - `Room Service`
  - `photo package`
  - `花園舞台怎麼走`
  - `最後一天早餐`
  - `上船先做什麼`
  - `海南雞飯`
  - `Palo`
  - `Bacha`
  - `珍奶`
- `index.html` 與 `sw.js` 的 build id 必須一致，離線核心資產需包含 `data.js`、registry、taxonomy、`onboard-lookup-data.js` 與首頁 hero 圖。
- `menu-lookup-data.js` 必須線上 200 且含完整 `550` 筆，但不可在首頁初始 resource list 出現。
- 導覽列 `菜單` 驗收：點擊後搜尋 overlay 開啟、模式為 `lookup`、分類為 `dining`、餐點資料才開始載入。

## 航程手帳查詢基線
- 一般搜尋關閉／重開，保留本次 query、分類與結果捲動位置；明確點擊菜單入口則重設為空 query、全部餐廳與全部段落。
- 菜單入口不得自動 focus 搜尋框，避免手機只想瀏覽卻彈出鍵盤。
- 結果區在鍵盤關閉時占搜尋面板至少 65%；快捷抽屜預設收合。手機分類與段落橫向捲動，不能自動換成多排。
- 不為結果占比縮小中文字級：控制項至少 1rem、meta 至少 .875rem、英文名稱 1.0625rem。小手機結果文字使用整欄，Crew 另列；字級放大或低高度螢幕時讓控制區可捲動，不能直接裁掉篩選功能。
- Crew 只更新右側 pane 或手機 bottom sheet，不能重新渲染整份結果；關閉後恢復位置及觸發按鈕焦點。Escape／返回先關 Crew，再關搜尋。
- 中英對照不設 24／48 筆硬上限。所有符合條件的結果都可瀏覽；同名餐點保留全部 menuVariants，不可因去重失去餐廳版本、描述或價格。
- lookup 的來源與分類加分只能加在有文字命中的結果上，不能使未知 query 回傳一整份菜單。空白分類瀏覽另依既有規則處理。
- 餐點需繼承對應餐廳的 registry aliases，使「珍奶」等中文別稱確實匹配相關菜單，而非依低分湊數。
- 共享旅程資料由 travel-reference-data.js 建立索引，不依賴可見 DOM；搜尋結果必須先切到對應 view／分頁，再展開舊連結轉向後的內容。
