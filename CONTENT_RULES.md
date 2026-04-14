# 星海攻略內容規則手冊 (Content Rules)

本文件是給未來維護內容時使用的實作規則。重點不是解釋網站願景，而是回答三個問題：

1. 新內容應該放到哪一個區塊？
2. 每個區塊的文字應該怎麼寫？
3. 實際要改哪個檔案？

補充：若維護的是搜尋 / AI 解答功能，而不是內容投放規則，請改看 [SEARCH_RULES.md](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/SEARCH_RULES.md)。

---

## 1. 三大核心區塊總覽

| 區塊 | 頁面位置 | 資料來源 | Renderer | 任務定位 |
| :--- | :--- | :--- | :--- | :--- |
| 行程 | `#schedule` | `data.js` 的 `cruiseSchedule` | `script.js` 的 `renderSchedule()` | 告訴使用者「這一天、這個時段要做什麼」 |
| 甲板與表演 | `#deck-guide` | `data.js` 的 `deckGuideData` + `showGuideData` | `script.js` 的 `renderDeckGuide()` | 告訴使用者「哪一層做什麼、何時去最順、哪場秀值得看」 |
| 攻略本 | `#playbook` | `data.js` 的 `playbookGuideData` | `script.js` 的 `renderPlaybookGuide()` | 補充「其他區塊沒講完的進階技巧、SOP、禮賓加值」 |

---

## 2. 目前存放位置

### HTML 掛載點

- [index.html](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/index.html)
  - `#schedule`：每日行程區塊
  - `#deck-guide`：甲板與表演設施介紹
  - `#playbook`：實戰攻略 Playbook

### 資料內容

- [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)
  - `cruiseSchedule`
  - `deckGuideData`
  - `showGuideData`
  - `playbookGuideData`

### 動態渲染邏輯

- [script.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/script.js)
  - `renderSchedule()`
  - `renderDeckGuide()`
  - `renderPlaybookGuide()`

結論：未來新增這三類內容時，主要改的是 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)，不是直接往 [index.html](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/index.html) 塞新文案。

---

## 2.5 搜尋與 AI 解答的關係

內容雖然主要落在 `行程 / 甲板與表演 / 攻略本` 三大區塊，但現在網站另外有一層 `搜尋與 AI 解答` 會讀取這些內容。

因此未來更新內容時要額外記住兩件事：

1. **新資訊仍先決定該放哪個主區塊，不要為了搜尋而新增重複內容。**
2. **若新設施 / 新活動存在常用別名或中英混稱，才需要進一步更新搜尋規則。**

也就是說：

- 內容的主事實來源仍然是 `data.js`
- 搜尋與 AI 只是取用這些內容，不應反過來主導內容結構

補充：AI 現在不是只讀整張卡摘要，而是會把高價值欄位拆成 chunk 使用。因此在維護內容時，欄位本身的可讀性、聚焦度、與資訊密度都會直接影響 AI 長答案品質。

目前搜尋 / AI 的核心規則也已升級為：

- 先做 `query_interpretation_v3`
- 專有名詞與別名先由 `ai-entity-registry.js` 對齊
- 再用 taxonomy + capability graph 決定合法擴張
- 再把命中內容拆成 `primary entity` 與 `support entity`
- 最後用 coverage contract 驗收左欄答案是否真的寫到右欄重要卡片

補充：左欄 AI 生成目前已固定往「三段自然語言攻略文章」收斂，而不是逐卡摘要拼接。這代表內容維護時，請優先提供能讓 AI 重新敘事的素材，而不是把每張卡都寫成很多格式化欄位。

目前 AI 正文的三個主區塊是：

- 行程區塊：負責排程與節奏
- 甲板設施 / 表演區塊：負責設施、服務、場館與表演內容
- 攻略區塊：負責心得、注意事項、小技巧與例外情境

因此內容卡要盡量讓 AI 能從文字中讀出：

- 這段內容是在回答哪個主題
- 它更適合放在三段文章中的哪一區
- 哪些資訊是主體內容
- 哪些資訊只是支援脈絡

因此內容維護時請一併注意：

- 是否能讓 AI 判斷這張卡是在回答「主體本身」，還是在提供「支援脈絡」
- 是否能讓 AI 從文字中讀出能力條件，例如 `游泳 / 吃東西 / 看秀 / 休息`
- 是否有清楚的中英別名、場館名、與可串回主體的關聯

---

## 2.6 專有名詞與關鍵字 metadata 規則

從這一輪開始，內容維護不能再只改標題與自由文字；高價值內容卡必須同時維護 metadata。

### 專有名詞主表

- 專有名詞單一事實來源在 [ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js)
- 新的餐廳、設施、表演、商店、concierge 空間或活動名稱，請先更新 registry
- 不要先把別名硬塞進內容卡或搜尋規則

### 命名共識

- 英文官方名是 canonical entity 主鍵
- 中文主顯示名與英文正式名分欄管理，不要自由拼接成一個 title
- 若中文不是 Disney 官方提供，而是站內翻譯，請視為 `site-localized`

### 內容卡 metadata

高價值內容卡至少要補：

- `entityRefs`
- `supportForEntityRefs`
- `keywordHints`
- `contentRole`

規則如下：

- `entityRefs`
  - 這張卡直接在介紹哪些實體
- `supportForEntityRefs`
  - 這張卡在支援哪些 primary entity
- `keywordHints`
  - 只補自由文字不容易自然帶出的關鍵詞
- `contentRole`
  - `primary` 或 `support`

### primary / support 分層

- `deck / facility / show / playbook 主卡` 通常是 `primary`
- `schedule / SOP / caution / timing` 通常是 `support`
- 行程卡若只是某個設施或表演的時段脈絡，請掛 `supportForEntityRefs`
- 不要讓 schedule 單靠自由文字變成答案主體

### 能力條件語意

若內容本身帶有明確能力條件，文字上要清楚說出來，方便 capability gating 命中：

- `游泳`
- `吃`
- `喝`
- `看秀`
- `親子遊戲`
- `休息`
- `購物`
- `SPA / fitness`

---

## 3. 區塊分工規則

### A. 行程 `cruiseSchedule`

#### 主題

以「日期與時段」為核心，幫家長快速掌握當下節奏。

#### 適合放入的內容

- 某一天幾點要去哪裡
- 某時段的主線活動順序
- 該時段最重要的提醒
- 晚餐、演出、玩水、集合演練等時間型內容

#### 不應放入的內容

- 長篇設施百科
- 船上通則或官方制度全文
- 禮賓進階玩法的完整教學
- 與當天時段無關的背景知識

#### 撰寫邏輯

- 先寫「這一天的核心目標」。
- 再按 `periods` 切成早上 / 中午 / 下午 / 晚間。
- 每個 event 都要像行動卡，而不是說明書。
- `title` 要直接點出動作與地點。
- `desc` 最多放 2 到 4 個短 bullet，優先寫：
  - 目的
  - 提醒
  - 這趟的安排理由

#### 文字風格

- 使用「這時候去做什麼」的語氣。
- 以家庭動線與節奏為中心。
- 能說清楚就不要寫成百科。

#### 與 AI 檢索的關係

行程目前在 AI 搜尋裡屬於 `support layer`，不是主體層。

也就是說：

- 行程會用來回答「什麼時段去最順」「哪一段流程會碰到這個主題」
- 但不應取代設施 / 甲板 / 表演 / 攻略卡成為主體答案

因此建議：

- `title` 要清楚點出這段行程在支援哪個主體
- `desc` 要能快速讀出時段、地點、目的與提醒
- 不要把與主題無關的背景資訊塞進同一筆 event

若一筆 schedule event 明顯是在支援某個主體，例如某個劇院、某個禮賓設施、某個補給點，文字上要讓這個關聯足夠清楚，AI 才能把它正確掛回 support context。

#### 判斷標準

如果一條資訊是回答「我們今天幾點做這件事」，放行程。
如果它比較像回答「這個地方到底值不值得去、怎麼去最順」，不要放行程。

#### 結構欄位

- `id`
- `tabTitle`
- `dateTitle`
- `goals`
- `periods[]`
- `periods[].name`
- `periods[].events[]`
- `events[].time`
- `events[].title`
- `events[].tag`
- `events[].tagClass`
- `events[].desc[]`
- `events[].entityRefs?`
- `events[].supportForEntityRefs?`
- `events[].keywordHints?`
- `events[].contentRole?`

---

### B. 甲板與表演 `deckGuideData` / `showGuideData`

#### 主題

以「空間感與選擇判斷」為核心，幫使用者知道哪一層有什麼、何時去最順、哪些表演值得優先安排。

#### 適合放入的內容

- 某層甲板的主題定位
- 與這趟行程直接相關的設施
- 某設施最佳使用時機
- 某場秀的主題、地點、建議卡位時間
- Day 1–4 行程視角下的甲板用途

#### 不應放入的內容

- 精確到分鐘的當日行程節奏
- 官方流程教學
- 行前報到資訊
- 其他地方已完整說明的進階技巧全文

#### 撰寫邏輯

甲板資料不是做百科整理，而是做「旅伴式導覽」。

- `title`：要先說這層的角色，例如首日晚秀層、親子安全核心、快餐主戰場。
- `theme`：用 2 到 4 個關鍵設施或功能收束主題。
- `tripFocus`：直接點出這趟何時會用到這層。
- `badges`：濃縮成 3 個左右的行程關聯標籤。
- `facilities`：每張卡只保留真正有用的判斷資訊：
  - 這是什麼
  - 什麼時候去最好
  - 這趟為什麼會用到

表演資料同理：

- `intro` 要先說整個表演群組的看法。
- `shows` 裡每場都必須回答：
  - 這是什麼秀
  - 在哪裡看
  - 什麼時候該到
  - 跟這趟哪一天最相關

#### 文字風格

- 像熟門熟路的旅伴帶路。
- 強調「何時用、值不值得排」。
- 不寫成船艦官方設施手冊。

#### 與 AI 檢索的關係

AI 目前會特別重視這些欄位：

- `summary`
- `bestTime`
- `tripUse`
- `theme`
- `timingTip`
- `tripLink`

因此建議：

- `summary` 要先寫最核心的用途，不要只寫抽象形容詞
- `bestTime` 要盡量具體到時段或場景
- `tripUse / tripLink` 要直接回答「這趟為什麼值得排」
- 不要把三種不同判斷混成一大段文字
- 若某張卡涉及明確能力條件，例如 `游泳 / 吃 / 看秀 / 休息 / 購物`，也要在文字中清楚寫出，讓 capability gating 能正確命中

#### 判斷標準

如果一條資訊是在回答「這個地方有什麼特色、什麼時候去最順」，放甲板與表演。
如果它是在回答「今天下午 3 點我們要不要去」，那是行程。
如果它是在回答「有哪些老手技巧」，那是攻略本。

#### 結構欄位

`deckGuideData`

- `id`
- `label`
- `title`
- `theme`
- `tripFocus`
- `badges[]`
- `facilities[]`
- `facilities[].icon`
- `facilities[].name`
- `facilities[].summary`
- `facilities[].bestTime`
- `facilities[].tripUse`
- `facilities[].highlight`
- `facilities[].entityRefs?`
- `facilities[].keywordHints?`
- `facilities[].contentRole?`

`showGuideData`

- `id`
- `title`
- `icon`
- `intro`
- `shows[]`
- `shows[].name`
- `shows[].theme`
- `shows[].location`
- `shows[].timingTip`
- `shows[].tripLink`
- `shows[].entityRefs?`
- `shows[].keywordHints?`
- `shows[].contentRole?`

---

### C. 攻略本 `playbookGuideData`

#### 主題

以「其他地方沒講完的進階使用術」為核心，只收錄真正能讓旅程更順的補強內容。

#### 適合放入的內容

- 行前防雷技巧
- 登船日 SOP
- 船上省時省力技巧
- 禮賓加值玩法
- 客艙與親子小撇步
- 最後一晚與撤船決策補充

#### 不應放入的內容

- 已經在其他區塊完整存在的基本規則全文
- 純設施介紹
- 純時間表
- 需要即時更新但沒有明確來源保證的硬性規則

#### 撰寫邏輯

Playbook 是補強模組，不是第二份總整理。

- 一張卡只講一件進階技巧。
- 每張卡都必須明確標示來源屬性：
  - `official`
  - `concierge`
  - `community`
- 每張卡都要能回答 4 件事：
  - `whenToUse`：何時用
  - `action`：這趟怎麼用
  - `tripFit`：這趟最有感的原因
  - `caution`：避免踩雷

若這件事基本規則已在其他區塊有完整說明，這裡只保留進階觀點，並填入 `relatedSectionId` 做 cross-link。

#### 與 AI 檢索的關係

Playbook 是目前 AI 深層解答最重要的細節來源，因此以下 4 欄必須盡量寫清楚、彼此分工明確：

- `whenToUse`
- `action`
- `tripFit`
- `caution`

原因是 AI 會把這 4 欄拆成獨立 chunk 使用。

建議寫法：

- `whenToUse`
  - 回答什麼情境、什麼時段、哪一類人最需要
- `action`
  - 回答實際 SOP、順序、操作方式
- `tripFit`
  - 回答這趟為什麼特別有感、值不值得做
- `caution`
  - 回答限制、例外、容易踩雷的點

避免寫法：

- 四欄都在重複同一件事
- `action` 只有空泛結論，沒有具體操作
- `caution` 寫成新的主流程，導致欄位角色混亂
- `tripFit` 完全沒有回答「為什麼這趟值得」

另外，`sourceType` 目前不只是內容標籤，也會直接影響 AI 的來源分層與 `sourceComparison` 呈現，因此必須正確填寫：

- `official`
- `concierge`
- `community`

若這張攻略卡明顯是某個主體的 SOP、補強、或注意事項，也要在文字上保持關聯清楚，方便 AI 在長答案中把它掛在對應的主體卡之下，而不是獨立漂浮成無上下文的技巧片段。

#### 文字風格

- 像口袋攻略卡。
- 強調省力、避雷、加值。
- 不把社群心得寫成官方保證。

#### 判斷標準

如果一條資訊是回答「基本規則是什麼」，先不要放 Playbook。
如果它是回答「知道基本規則後，老手會怎麼用得更順」，才放 Playbook。

#### 結構欄位

- `id`
- `label`
- `intro`
- `items[]`
- `items[].title`
- `items[].icon`
- `items[].sourceType`
- `items[].whenToUse`
- `items[].action`
- `items[].tripFit`
- `items[].caution`
- `items[].relatedSectionId`
- `items[].entityRefs?`
- `items[].supportForEntityRefs?`
- `items[].keywordHints?`
- `items[].contentRole?`

---

## 4. 新內容投放決策樹

### 問題一：這條資訊是時間表，還是空間判斷，還是進階技巧？

- 有明確日期、時段、先後順序：放 `cruiseSchedule`
- 重點是甲板、設施、表演的使用時機：放 `deckGuideData` 或 `showGuideData`
- 重點是省力、避雷、禮賓加值、親子技巧：放 `playbookGuideData`

### 問題二：這條資訊是否已在網站其他區塊存在？

- 已有完整基礎說明：不要重寫全文
- 若仍有補充價值：改寫成 Playbook 進階卡，並加 `relatedSectionId`
- 若只是同一件事的另一種說法：不要新增

### 問題三：這條資訊是不是會隨政策變動？

- 若非常時效性：寫成提醒或注意事項，不寫死數字與保證句
- 若是本趟已確認安排：可直接寫入行程或甲板用途

---

## 5. 實際維護流程

### 新增行程內容時

1. 先確認是否真的屬於某一天某個時段。
2. 若提到特定設施 / 表演 / concierge 空間，先確認 [ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js) 是否已有對應實體。
3. 編輯 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js) 的 `cruiseSchedule`。
4. 補上 `supportForEntityRefs`，讓 AI 知道這段行程是在支援哪個主體。
5. 若只是延伸介紹，不要塞進 `desc` 太長。
6. 超過行程卡該承載的內容，改放甲板或 Playbook。

### 新增甲板或表演內容時

1. 先判斷是甲板導覽還是表演精華。
2. 先確認相關實體是否已存在於 [ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js)。
3. 編輯 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js) 的 `deckGuideData` 或 `showGuideData`。
4. 補上 `entityRefs`，必要時補 `keywordHints`。
5. 只保留和這趟行程有關的設施，不做全船百科。
6. 每張卡都要帶出「最佳時機」與「這趟用途」。

### 新增攻略內容時

1. 先檢查網站其他區塊是否已寫過基本規則。
2. 若沒有，先思考它是不是應該放別的區塊。
3. 若提到明確設施 / 表演 / concierge 服務，先確認 registry 是否已有 entity。
4. 確定是進階技巧後，再編輯 `playbookGuideData`。
5. 必填 `sourceType` 與 `caution`。
6. 盡量補上 `entityRefs` 或 `supportForEntityRefs`，避免 AI 只能靠自由文字猜關聯。
7. 如果有對應主區塊，補 `relatedSectionId`。

---

## 6. 三大區塊的內容邊界一句話版

- 行程：`今天什麼時候去哪裡做什麼`
- 甲板與表演：`這個地方值不值得去、何時去最順`
- 攻略本：`知道基本規則後，怎麼玩得更省力、更像老手`

---

## 7. 建議維護原則

- 優先改 [data.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/data.js)，不要先改 HTML。
- 若涉及新的專有名詞、正式名稱、雙語別名，先改 [ai-entity-registry.js](/G:/我的雲端硬碟/10-個人生活資料/2027迪士尼郵輪/ai-entity-registry.js)。
- 新增內容前先問自己：這條是主線、導覽，還是補強？
- 若內容開始重複，保留一個主入口，其餘地方只留短提示與連結。
- 行程重節奏，甲板重判斷，攻略重技巧，三者不要混寫。
- 若一張卡已明確對應實體，請補 `entityRefs` / `supportForEntityRefs`，不要只留自由文字。
- 若未來新增第四類大型內容，先更新本文件，再更新資料。
