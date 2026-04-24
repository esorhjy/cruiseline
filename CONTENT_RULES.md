# 內容規則

## 目標
- 內容的第一責任是讓純關鍵字搜尋容易命中、容易排序、容易理解。
- 內容卡應優先提供清楚名稱、別名、分類與關聯，而不是依賴搜尋程式猜測語意。
- 內容寫法要支援「精準優先 + 強力合併」的搜尋結果，不製造多餘重複噪音。

## 命名原則
- 每個高價值設施、表演、餐廳、商店、禮賓服務與場館，都應能對應到 `search-entity-registry.js` 內的一個 canonical entity。
- 標題可以友善，但不能失去專有名詞辨識度。
- 同一名稱若有中英文常用說法，應補 alias，不要在不同卡片裡各寫各的。
- 若站內有本地化中文名稱，仍需能回推英文 canonical entity。

## 建議 metadata
- 主體卡建議補齊：
  - `entityRefs`
  - `keywordHints`
  - `contentRole: 'primary'`
- 支援型內容建議補齊：
  - `supportForEntityRefs`
  - `keywordHints`
  - `contentRole: 'support'`
- 能明確分類的內容，應讓資料層可穩定推得出：
  - `categoryFamilies`
  - `capabilityTags`
  - `entityFamilies`

## 內容撰寫原則

### 主體卡
- 甲板、設施、表演、餐飲、商店等主體卡，應讓使用者一眼看出：
  - 這是什麼
  - 在哪裡
  - 什麼時候適合使用或觀看
  - 亮點或限制是什麼
- 主體卡應盡量承接核心資訊，避免同一件事散在很多張卡裡。

### 行程卡
- 行程卡應提供：
  - 時段
  - 安排重點
  - 與其他設施或表演的串接關係
- 行程卡在搜尋中預設屬於支援層。
- 若同一實體在多個時段重複出現，內容應盡量寫出差異點，而不是整張只換日期或時段。

### 攻略卡
- 攻略卡應提供：
  - 適用情境
  - 建議做法
  - 注意事項
  - 社群心得或實戰提醒
- 若一張攻略卡綁了很多主體 entity，內文應盡量清楚標示適用範圍，避免變成過寬的泛用卡。
- 攻略卡若只是補充某個主體，應更明確標註 `supportForEntityRefs`。

## 關鍵字友善原則
- 內文可以自然提到常見別名，但不要堆滿關鍵字。
- 若一張卡明顯服務某個設施或表演，請用 `entityRefs` 或 `supportForEntityRefs` 關聯，不要只靠字面出現。
- 若內容能清楚對應 `categoryFamilies` 或 `capabilityTags`，請優先在資料層表達，不要把搜尋語意塞進自由文字。

## 去噪與去重友善原則
- 不要用大量欄位標籤式文字堆疊內容，例如：
  - `日期：`
  - `時段：`
  - `重點：`
  - `任務：`
  - `來源層級：`
- 建議在原始內容中就讓敘述盡量自然，方便搜尋結果卡萃取成單段摘要句。
- 同一實體的多張卡若內容高度重複，應優先：
  1. 把核心資訊留在主卡
  2. 讓補充卡只保留差異
- 這有助於搜尋端做 `same parent / same entity theme / schedule cluster` 去重時，仍保留真正有用的資訊。

## 內容維護順序
1. 先確認名稱是否對齊 canonical entity
2. 再補 alias、`entityRefs`、`supportForEntityRefs`
3. 再補 `categoryFamilies`、`capabilityTags`、`entityFamilies`
4. 最後才微調內文語氣或卡片呈現方式
5. 若新增的是高頻現場問題，補一條搜尋 smoke case，避免之後排序回歸

## 不再維護的內容形態
- 不再為 AI 搜尋額外準備 prompt、section dossier、coverage contract 或 AI answer 專屬欄位。
- 不再維護 AI 回答專用的 longform article、citation payload 或 Worker schema 欄位。
- 不再以「給 AI 看」為目標設計資料欄位；資料層的唯一目標是支援純搜尋與內容維護。
