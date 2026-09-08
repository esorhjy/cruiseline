# 中文閱讀字級基線

Build：`2026-09-08-readable-type-v1`

## 問題與選擇

舊手機樣式將中英對照 meta 縮到 9px、地點與底部導覽縮到 11px，多數提醒為 12–14px。這不是螢幕解析度不足，而是 CSS 明確縮小文字。不能只改 body 字級，讓元件內的小字覆寫繼續存在。

以下是本專案的設計基線，不是 W3C 規定的唯一最佳字級。數值以瀏覽器預設根字級 16px 計算；全站字級使用 rem，接受使用者的根字級設定與縮放，不隨 viewport 寬度縮字。

| 用途 | 預設字級 | 實作 |
| --- | --- | --- |
| 行程提醒、設施說明、攻略、清單、餐點描述、英文菜名 | 17px | `--text-body: 1.0625rem` |
| 搜尋輸入、餐廳選單、分類、時間、主要操作 | 16px | `--text-control: 1rem` |
| 來源、狀態、底部導覽、短輔助標籤 | 至少 14px | `--text-meta: .875rem` |
| 正式名稱附註、結果地點 | 15px | `.9375rem` |
| 行程／餐點／設施標題 | 20px | `1.25rem` |
| Crew 英文名稱 | 32px | `2rem`，允許換行與捲動 |

- 中文優先使用 `PingFang TC`、`Microsoft JhengHei`、`Noto Sans TC`，再由 `system-ui`／`sans-serif` 備援；保留 `lang="zh-TW"`。
- 不下載整套大型中文字型、不新增外部字型依賴，保留離線與首頁速度。不同系統使用各自可用的黑體，不承諾完全相同的字面或換行。
- 正文無單位行高 1.75，標題 1.4；字距維持 0。長段落限制閱讀寬度，不把文字強制左右對齊。
- 狹窄手機餐點卡使用整欄顯示文字，Crew 按鈕另置，不把中英菜名夾在窄欄內。
- 時間與安排狀態在手機同列；移除封面重複的假期小標語。原圖、主標題、日期與同行人數不變，不用縮圖或縮字換取首屏空間。
- 主導覽、清單標頭與時間允許換行；手機底部導覽留白隨 rem 增長。搜尋控制區過高時可捲動，不裁切控制，讓結果區保有空間。
- 正常字級、鍵盤關閉、快捷收合時，搜尋結果區至少占面板 65%。使用者放大時優先確保內容與操作可達，不強迫維持第一屏卡片數。

## 驗收

- `tests/search-shell.eval.mjs` 防止固定 px 字級或禁止縮放的 viewport 設定回歸。
- `tests/typography.browser.mjs` 驗證 360×800、390×844、768×900、844×390、1440×900 的計算字級、水平溢出、正常首屏、搜尋占比及 Crew 操作。
- 同一測試將根字級改成 200%，驗證文字確實變大；再模擬使用者覆寫行距／字距／段距，檢查搜尋與 Crew 可操作。這不是完整 WCAG 合規稽核，也不等於實體 iPhone／Android 測試。
- 保留原 `tests/notebook.browser.mjs` 的搜尋、菜單 550 筆、焦點、捲動、返回、file URL 與離線回歸。
- 使用 `PLAYWRIGHT_MODULE` 指定既有套件，可用 `TEST_BASE_URL` 測部署網址；截圖存於系統暫存目錄的 `cruise-typography-qa`。

## 依據

- [W3C 中文排版需求](https://www.w3.org/International/clreq/)：中文與西文混排、行高及排版需求的背景參考；不能把書籍印刷字級直接當手機最佳值。
- [W3C 文字縮放](https://www.w3.org/WAI/WCAG21/Understanding/resize-text)：文字放大至 200% 不應損失內容或功能。
- [W3C 文字間距](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)：使用者覆寫間距後仍需保留內容與功能；不是要求所有網站預設使用相同間距。
- [MDN font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-family)：字型依指定順序與可用字形選用，最後保留 generic fallback。
