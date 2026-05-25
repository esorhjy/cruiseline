# 專案藍圖

## 產品定位
- 這是一個以迪士尼探險號為主題的站內攻略網站。
- 核心互動是瀏覽內容與使用關鍵字搜尋快速定位資訊。
- 產品方向已明確回歸純關鍵字搜尋，不再提供 AI 搜尋或 AI 生成回答。

## 目前架構
- 靜態前端頁面：
  - `index.html`
  - `style.css`
  - `script.js`
- 本地資料：
  - `data.js`
  - `search-entity-registry.js`
  - `search-keyword-taxonomy.js`
  - `onboard-lookup-data.js`
  - `menu-lookup-data.js`
- 菜單資料產生器：
  - `tools/generate-menu-lookup-data.mjs`
  - 菜單資料採本地 snapshot，不在 runtime 抓外部來源
- Service Worker：
  - `sw.js`
  - 只負責靜態資產快取與離線可用
  - 大型菜單資料不可放進 core precache，需由前端 lazy load 後走 runtime cache

## 搜尋策略
- 搜尋 overlay 是主要快速入口，保留兩個本地工具模式：
  - `攻略搜尋`：站內攻略、設施、行程、表演搜尋
  - `中英對照`：船上設施、活動、餐廳、餐點的中英文快查
- 無 AI 模式
- 無遠端 Worker
- 無 AI 回答面板
- 搜尋面板提供常用 quick chips 與 `登船日快查` 小面板，協助現場快速查到高頻問題。
- 上方導覽列的 `菜單` 不導向首頁 section，必須直接打開搜尋 overlay 並切到 `中英對照 > 餐點/餐廳`。
- 搜尋排序採 `exact-anchor first`：
  1. `literal anchors`
  2. `canonical entity / alias`
  3. `category family / capability`
  4. `support` 類補位
- 搜尋結果先排序，再做去重與主題合併：
  - `same parent`
  - `same entity theme`
  - `schedule cluster`

## 純搜尋的資料基礎
- canonical entity registry
- alias 與 proper noun tokens
- 中英對照 lookup records
- 菜單 snapshot records
- `entityRefs`
- `supportForEntityRefs`
- `categoryFamilies`
- `capabilityTags`
- `entityFamilies`
- 內部搜尋文件欄位：
  - `dedupeKey`
  - `themeEntityId`
  - `isSupportLike`
  - `anchorStrength`
  - `entityBreadth`

## 結果生成原則
- 搜尋結果預設採 `精準優先 + 強力合併`，不是探索型寬結果。
- `deck/show` 主卡優先，其次是核心 `playbook`。
- `schedule` 預設為支援層，只有 query 明確帶時段 / 行程意圖時才升權。
- 綁太多 entity 的泛用攻略卡需吃 `breadth penalty`，不可壓過核心主卡。
- 結果卡採精簡單段式：
  - 一行 meta
  - 標題
  - 一段主摘要
  - 少量 chips
- 不再顯示重複的 highlights、snippet、location 行。

## 菜單與中英對照
- 首頁不可放大型菜單表、菜單瀏覽器或 `#menu-lookup` section。
- 餐點查詢只從搜尋 overlay 的 `中英對照 > 餐點/餐廳` 進入。
- `menu-lookup-data.js` 必須完整保留來源菜單 snapshot，目前驗收基準為 `550` 筆。
- 菜單資料只在使用者進入餐點查詢時 lazy load；首頁初始 resource list 不應包含 `menu-lookup-data.js`。
- 餐點篩選的產品邏輯固定為「先餐廳、再點餐段落」，點餐段落為 `全部 / 前菜 / 主餐 / 飲料 / 甜點 / 兒童/配菜`。
- Crew 溝通卡應留在搜尋 overlay 中，顯示英文菜名、中文確認、餐廳/段落與點餐句。

## 保留與移除

### 保留
- 對純搜尋有幫助的 registry / taxonomy / metadata
- 本機直接開 `index.html` 即可使用的輕量體驗
- 純搜尋測試基線
- 搜尋 overlay 內的中英對照與餐點查詢

### 已移除
- AI 搜尋模式
- AI 回答面板
- Cloudflare Worker
- Wrangler 部署設定
- Worker health/version handshake
- AI 專屬測試與 AI 規則文件
- 首頁大型菜單瀏覽區

## 維護原則
- 優先維護資料命名與 metadata 品質。
- 搜尋若不理想，先修 registry 與內容 metadata，再考慮調整排序、去重或 UI。
- 任何搜尋優化都應優先讓結果更精準、更易讀，而不是更寬。
- 保持本機直接開 `index.html` 就能正常使用，不依賴隱性後端。
- 每次調整內容、搜尋資料或核心資產時，需同步檢查 `index.html` 與 `sw.js` 的 build id。
- 調整菜單 snapshot 時需同步檢查 `menu-lookup-data.js`、產生器、lazy-load 路徑與 smoke tests。
- 不可因菜單資料量增加而把大型資料同步掛回首頁底部 `<script>`。
- 新增高價值攻略卡時，應同步考慮 registry binding 與搜尋 smoke case，而不是只改 `data.js`。

## 測試基線
- `tests/search-entity-registry.eval.mjs`
- `tests/search-keyword.smoke.mjs`
- `tests/search-shell.eval.mjs`
- `tests/content-data-integrity.eval.mjs`

## 近期優化方向
- 純搜尋結果卡的排序微調與弱命中去噪
- 專有名詞、alias、capability 持續補強
- 搜尋 overlay header 與結果列表的可用性優化
- schedule 與支援型攻略卡的進一步去噪
- Hero 圖與動態效果持續維持手機友善，不犧牲離線核心功能
- 若未來菜單體驗仍需擴充，優先強化搜尋 overlay 內的餐廳/段落篩選；只有在明確需要時才另建獨立頁，不回到首頁大型 section。
