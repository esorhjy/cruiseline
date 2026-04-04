# 星海攻略搜尋與 AI 解答規格 (Search Rules)

本文件專門描述目前網站中的 `搜尋` 與 `AI 解答` 功能。重點不是講網站願景，而是回答以下問題：

1. 搜尋目前能搜哪些內容？
2. AI 解答是怎麼根據站內資料回答的？
3. 後續新增內容或新區塊時，要怎麼確保搜尋仍然可用？

---

## 1. 功能定位

目前網站的搜尋分成兩層：

| 模式 | 位置 | 任務定位 | 是否使用雲端模型 |
| :--- | :--- | :--- | :---: |
| 關鍵字搜尋 | 搜尋浮層 `Quick Find` | 直接查找站內相關片段並跳轉 | 否 |
| AI 解答 | 同一個搜尋浮層內的 `AI 解答` 模式 | 先做站內召回，再用 Gemini 整理成自然語言答案 | 是 |

核心原則：

- **原本的本地搜尋必須保留，不能被 AI 取代。**
- **AI 只能根據本站已命中的內容回答，不能外查、不能自由發揮。**
- **AI 回答一定要附引用來源，並可點回原區塊。**

---

## 2. 目前可搜尋的內容來源

### A. 動態資料層

來自 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)：

- `cruiseSchedule`
- `deckGuideData`
- `showGuideData`
- `playbookGuideData`

這四組資料經過 [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js) 建立搜尋索引後，可提供：

- 行程事件
- 甲板設施
- 表演資訊
- 攻略卡片

### B. 靜態區塊層

來自 [index.html](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/index.html) 的靜態內容卡片：

- `#overview`
- `#timeline`
- `#checkin`
- `#facilities`
- `#entertainment`
- `#tips`
- `#local-info`

這些內容不是直接寫在資料層，因此搜尋會在載入時由 DOM 掃描卡片標題與文字。

---

## 3. 搜尋 UI 與互動邏輯

### 浮層位置

- 搜尋入口位於導覽列 `搜尋` 按鈕
- 浮層掛載於 [index.html](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/index.html) 的 `#search-overlay`

### 兩種模式

- `關鍵字搜尋`
  - 直接使用本地索引比對
  - 適合查名詞、地點、設施、固定關鍵字
- `AI 解答`
  - 先做本地站內召回
  - 再把命中的少量片段送去 Gemini 整理
  - 適合自然語言問句

### 點擊搜尋結果後的導覽行為

- 行程結果：切到對應 `Day` tab，捲到事件卡
- 甲板結果：切到對應 `Deck` tab，捲到設施卡
- 表演結果：切到 `表演精華` tab，捲到對應 show 卡
- 攻略結果：切到對應 Playbook mission，展開卡片再捲動
- 靜態卡片：直接捲到該卡

### 重要互動原則

- AI 答案區與搜尋結果區必須共用同一個可捲動容器
- 中文輸入法組字期間不可誤送出
- 按 `Enter` 與按粉紅 `AI 解答` 按鈕必須走同一條 submit 流程

---

## 4. 本地搜尋規則

### 關鍵字搜尋

關鍵字搜尋是純前端、本地、無 AI 的搜尋層。

規則：

- 先做字串正規化：小寫、全半形統一、去標點、壓縮空白
- 支援手工同義詞字典
- 以 `title / keywords / text` 做加權排序
- 命中後顯示原文摘錄，不做 AI 生成摘要

### 搜尋別名維護位置

在 [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)：

- `SEARCH_SYNONYM_GROUPS`

目前已涵蓋例子：

- `禮賓 / concierge / lounge / 酒廊`
- `房務 / room service / 客房服務`
- `杯麵 / baymax`
- `海洋俱樂部 / oceaneer / kids club`
- `爆米花 / popcorn`
- `披薩 / pizza / pizza planet`

### 什麼時候要更新同義詞字典

若未來新增內容時出現以下情況，就應補 synonym：

- 同一設施同時有中英文名稱
- 社群常用稱呼與官方稱呼差很多
- 使用者很可能會用口語找，但資料裡是正式名稱

---

## 5. AI 解答規則

### 整體流程

AI 解答採兩段式：

1. **第一輪本地召回**
   - 前端先用 AI 專用 query parser，把自然語句拆成可搜尋片段
   - 再從本地索引抓出高相關內容
2. **必要時最多一次 rewrite 回補**
   - 若第一輪命中偏弱，但仍有線索
   - 前端會呼叫 Worker 的 `query_rewrite_v1`
   - Gemini 只負責把問句改寫成更適合本站搜尋的關鍵詞
   - 前端再用這些關鍵詞 **只重跑一次** 本地搜尋

### AI 問句分型 (Intent Profile)

AI 不再把所有問題都當成同一種搜尋，而是先判斷問題意圖，再決定應優先抓哪一種區塊。

目前分成 4 類：

| 意圖類型 | 代表問題 | 預設主來源順序 |
| :--- | :--- | :--- |
| `sequence` | `第一天提早登船後最值得先做什麼？` | `schedule > playbook > deck/show > static` |
| `facility-detail` | `Baymax 電影院有字幕嗎？` | `deck/show > playbook > schedule > static` |
| `operational-detail` | `禮賓有什麼特殊服務？` | `playbook > deck/show > schedule > static` |
| `policy-or-tip` | `Room Service 半夜怎麼點比較穩？` | `playbook > schedule > deck/show > static` |

判斷原則：

- 問 `順序 / 第一步 / 怎麼安排 / 先做什麼`，偏向 `sequence`
- 問 `某設施 / 哪一層 / 有沒有字幕 / 在哪裡`，偏向 `facility-detail`
- 問 `怎麼做 / 特殊服務 / 技巧 / 優先入場 / 房務 / 禮賓`，偏向 `operational-detail`
- 問 `限制 / 注意事項 / 該不該 / 穩不穩`，偏向 `policy-or-tip`

### 重要限制

- AI 改寫最多一次
- 不允許無限重試
- 不做外部網路搜尋
- 不做 File Search / embeddings / vector DB
- 若站內沒有資料，AI 必須明說資料不足

### AI 的回答來源

AI 只會讀取前端送出的命中片段 `chunks`，每筆片段包含：

- `id`
- `title`
- `locationLabel`
- `sectionId`
- `sourceType`
- `navTarget`
- `text excerpt`

Gemini 不會收到整站全文，也不會自己搜尋網站。

### 證據卡選取原則 (Precision-first)

AI 解答現在不是固定先抓 `schedule`，而是採「精準度優先」：

1. 先依 `intent profile` 選 1 張主證據卡
2. 再補 1 到 2 張支援卡
3. 最後才補背景卡，總數不超過 6 張

具體規則：

- `operational-detail / policy-or-tip`
  - 主證據優先 `playbook`
  - 若問題明顯指向設施，再補 `deck/show`
  - `schedule` 只能當背景，不可當第一張
- `facility-detail`
  - 主證據優先 `deck/show`
  - `playbook` 作為技巧補充
  - `schedule` 只有在問題明確帶有 `Day 1 / Day 2 / 早餐 / 晚上` 時才補
- `sequence`
  - 主證據可以是 `schedule`
  - 但必須至少補 1 張 `playbook` 或 `deck/show` 細節卡
  - 不允許只靠單張 schedule 直接進 QA

### 卡片精細度 (Specificity Score)

AI 排序時除了原本的關鍵字分數，還會另外看「卡片是不是夠具體」。

加分方向：

- 標題直接命中設施名、服務名、規則詞
- `playbook` 命中操作詞
- `deck/show` 命中設施或表演名
- 文字較聚焦，像單張攻略卡或單一設施卡

扣分方向：

- `static` 維持低權重
- `schedule` 若只是大面積日程總覽、沒有命中具體設施或動作詞，會被壓低
- 同一題已經命中更精準的 `playbook / deck / show` 時，廣泛的 schedule 卡不應排在前面

### AI 回答模式

目前 Worker 支援兩種模式：

- `grounded_qa_v1`
  - 根據 chunks 生成回答
- `query_rewrite_v1`
  - 把口語問句改寫成適合本站搜尋的詞，不直接回答

### AI 回答輸出要求

回答必須固定包含：

- `answer`
- `bullets`
- `citations`
- `confidence`
- `primarySourceType`
- `missingReason`（可選）
- `insufficientData`

### `primarySourceType` 的用途

AI 回答卡會顯示「本次答案主要依據：哪一種區塊」，目前可能值為：

- `schedule`
- `deck`
- `show`
- `playbook`
- `static`

這個欄位的目的是讓使用者與維護者都能快速判斷：

- 這次答案是偏「順序整理」
- 還是偏「設施細節」
- 或是偏「攻略技巧」

### Worker 的回答合約

Worker 在 `grounded_qa_v1` 內必須遵守這些規則：

- 只能根據傳入 chunks 回答
- 若 chunks 同時有總覽型與細節型內容，要優先依據最具體的卡片
- `schedule` 只能補充順序與時段，不可蓋過 `playbook / deck / show`
- 若問題是 `怎麼做 / 特殊服務 / 需要注意什麼`
  - 應優先整理規則、技巧、細節
  - 不應先講大範圍介紹
- citation 必須對應實際片段，不能自由生成

### 信心分級原則

- `high`
  - 命中片段集中，且能清楚回答
- `medium`
  - 命中片段足夠，但仍需使用者點引用核對
- `low`
  - 只有少量站內片段，先給最佳努力答案，但必須明示保守性

---

## 6. 相關檔案位置

### 前端

- [index.html](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/index.html)
  - 搜尋浮層結構
  - `ai-answer-endpoint` meta
- [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)
  - 搜尋索引建立
  - 關鍵字搜尋
  - AI 檢索、rewrite、結果跳轉
- [style.css](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/style.css)
  - 搜尋面板樣式
  - AI 答案卡樣式
  - 命中高亮與捲動區塊
- [sw.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/sw.js)
  - 搜尋與 AI 前端快取版本控制

### Worker / 部署

- [worker/ai-answer.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/worker/ai-answer.js)
  - Gemini Worker 主邏輯
- [wrangler.toml](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/wrangler.toml)
  - Worker 部署設定
- [/.dev.vars.example](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/.dev.vars.example)
  - 本機需要的環境變數範例
- [/.gitignore](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/.gitignore)
  - 確保本機 secret 不進 git

---

## 7. 後續維護規則

### A. 新增內容時，何時需要同步搜尋

#### 不需要額外改搜尋的情況

若只是：

- 更新 `data.js` 內容
- 修改靜態卡片文案
- 新增既有區塊中的新事件 / 新卡片 / 新設施

通常搜尋會自動涵蓋，不需要另外建索引表。

#### 需要同步改搜尋的情況

若有以下任一情況，請同步更新 [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)：

1. 新增全新的資料來源類型  
   例如未來新增 `packingGuideData`、`photoGuideData`

2. 新增新的靜態 section  
   需要更新 `buildStaticSearchDocuments()` 的 `sectionConfigs`

3. 新功能需要點搜尋結果後自動切頁 / 展開  
   需要補新的 `navTarget.type` 與 `navigateToSearchResult()` 行為

4. 新設施或新活動有常用別名  
   需要更新 `SEARCH_SYNONYM_GROUPS` 或 `AI_QUERY_EXTRA_SYNONYM_GROUPS`

5. 某類問題的主來源應改變  
   需要更新 `buildAiIntentProfile()`、`scoreDocumentForAi()`、`selectAiEvidenceResults()`

### B. 新增同義詞的原則

- 先補高頻、真正常搜尋的詞
- 不要把太多低價值近義詞全塞進去
- 一組 synonym 只保留 2 到 6 個最常用名稱

### C. AI 解答不要做的事

- 不要改成整站全文直接送模型
- 不要讓模型產 HTML
- 不要讓模型自己外查
- 不要把 AI 回答當成單一真相來源，引用跳轉必須保留

---

## 8. 測試清單

### 關鍵字搜尋

- `禮賓`
- `Baymax`
- `Room Service`
- `Deck 17`
- `爆米花`
- `SGAC`

### AI 解答

- `第一天提早登船後最值得先做什麼？`
- `禮賓有什麼特殊服務？`
- `禮賓怎麼提早進劇院？`
- `Room Service 半夜要怎麼點比較穩？`
- `Deck 17 有哪些適合孩子的補給？`
- `Baymax 電影院有字幕嗎？`

### 拒答

- `賭場在哪裡？`
- `停靠哪些港口？`

### 互動

- 按 `Enter` 可正常送出
- 中文輸入法組字不會誤送出
- AI 答案可往下捲
- citation 點擊後可正確跳轉

### 精準度驗收

- `禮賓有什麼特殊服務？`
  - 主來源應優先來自 `playbook concierge-plus`
- `Baymax 電影院有字幕嗎？`
  - 主來源應優先來自 `Deck 7 / Baymax Cinemas`
- `Room Service 半夜怎麼點比較穩？`
  - 主來源應優先來自 `playbook daily-ops`
- `第一天提早登船後最值得先做什麼？`
  - 可以先抓 `schedule Day 1`
  - 但必須補 `playbook / deck` 的細節卡，不可只有行程總覽

---

## 9. 一句話維護原則

**搜尋負責找到最精準的原文卡片，AI 只負責根據已命中的原文整理答案。**

只要後續維持這個分工，網站就能同時保有：

- 可預期的本地搜尋
- 可控的 AI 自然語言回答
- 可追溯的引用跳轉
