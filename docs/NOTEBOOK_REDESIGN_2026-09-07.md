# 航程手帳改版紀錄

Build：`2026-09-07-voyage-notebook-v1`

## 內容搬移對照

| 原位置／資料 | 新位置 | 保留方式 |
| --- | --- | --- |
| 封面與航程資料 | 航程第一屏 | 原 `1772539078755-hero.jpg` 不變，保留完整比例、Disney Adventure、日期、同行人數 |
| 36 筆行程 | 航程日期分頁 | 固定資料 ID；外層保留行動與必要提醒，其餘可展開；建議時間不宣稱已確認 |
| 39 筆設施 | 船上探索 > 設施 | 用途優先、甲板第二層；英文名、資格限制保留 |
| 7 筆表演 | 船上探索 > 表演 | 正式英文、地點、入場條件保留 |
| 38 筆攻略 | 船上探索 > 攻略 | tripFit 只呈現一次；行程連到共享介紹 |
| 同行／航班／帳務 3 張卡 | 行前準備 > 同行與交通 | `travel-reference-data.js`，保留舊 ID |
| 預約時程 4 張卡 | 行前準備 > 預約與報到 | 保留各自時點與條件，不改成完成狀態 |
| 入境／接駁 2 張卡 | 行前準備 > 入境與登船 | 保留兩次 SGAC 與待確認接駁 |
| 天氣／匯率／機場 3 張卡 | 行前準備 > 新加坡與機場 | 天氣展開才查；舊匯率明確標成估算，不冒充即時資訊 |
| 舊親子設施 2 張卡 | 禮賓泳池、Oceaneer 主卡 | `redirects` 導向既有穩定 ID，不再重複一套資格說明 |
| 舊 Remember 介紹 | Remember 表演主卡 | 舊 ID 轉向主卡 |
| 舊快餐／角色電影／購物／備品 4 張卡 | 對應日常與房內攻略 | 獨有內容以 `targetId` 附加，保留原 ID 可定位 |
| 舊下船／Navigator 2 張卡 | 下船、登船攻略主卡 | 舊 ID 轉向主卡 |
| 550 筆餐點 | 搜尋 > 中英對照 > 餐點/餐廳 | 完整本地 snapshot 不變；按餐廳、點餐段落篩選；同名合併不刪除 menuVariants |
| 原清單 | 行前準備 > 全部／未完成 | 保留所有勾選 ID 及 `dcl_checklist_status`，不合併完成條件 |
| 船艦數據 | 船上探索 > 設施下方介紹 | 收進詳情，不占第一屏 |

原 120 筆資料主卡與 21 張靜態卡皆有對應位置。靜態卡為 16 筆共享記錄（含 4 筆附加內容）及 5 筆轉向，不依賴目前畫面 DOM 建立搜尋索引。

## 導覽與查詢約定

- `#journey`、`#explore`、`#prepare` 是三個主畫面；`#menu-search`、舊 `#menu-lookup` 直接開菜單 overlay，不新增首頁菜單。
- `#overview`、`#timeline`、`#checkin`、`#checklist`、`#local-info` 導向行前準備；`#facilities`、`#deck-guide`、`#entertainment`、`#playbook`、`#tips` 保留對應探索入口。
- 120 筆主卡的 `id`／`bindingKey` 由資料持有。即使重排行程、設施、表演與攻略，registry binding 與舊卡片連結不變。
- 一般搜尋重開保留 query、篩選與捲動；菜單入口清空 query 並選全部餐廳／段落，不自動叫出手機鍵盤。
- Crew 只更新 pane，不重建結果列表；返回／Escape 先關 Crew，保留原餐點焦點。
- 攻略結果依最終排名直接呈現，不能再以固定來源分組覆蓋排序。

## 離線與載入

- 首頁不請求 `menu-lookup-data.js`，不建立餐點卡。首次進入餐點分類才 lazy load；失敗提供 retry。
- 菜單不列入 core precache，第一次開啟後使用 runtime cache。
- 核心資產以 Service Worker registration scope 判定，支援 `/cruiseline/` 子路徑。
- 不在 Service Worker activate 強制 navigate 所有分頁。真正版本更新仍由頁面的 controllerchange 邏輯處理，避免第一次安裝打斷操作。
- 原完整 PNG 檔保留，但不再快取首頁未使用的大檔；原封面 JPEG 仍是核心離線資產。

## 驗收與重跑

- 原五項回歸測試與 `tests/notebook-data.eval.mjs`：120 個穩定 ID、21 個靜態卡去向、registry、內容限制、搜尋 smoke、build 與 scope cache。
- `tests/notebook.browser.mjs`：1440×900、390×844、360×800，封面完整、日期及第一筆行程可見、無水平溢出、清單持久化、舊連結、搜尋排名導向、菜單 retry、餐廳／段落、描述、Crew 焦點／捲動、返回／前進。
- 本機 browser suite 也驗證 `file://`、runtime cache 後斷網重新載入及全部 550 筆菜單。
- 實測結果區占搜尋面板：桌機 76.2%、390px 手機 70.3%、360px 手機 68.7%，皆高於 65%。
- `PLAYWRIGHT_MODULE` 可指定既有 Playwright 套件；`BROWSER_CHANNEL` 預設 `msedge`。測試自行啟動／關閉暫時伺服器，截圖放系統暫存目錄。
- 部署後用 `TEST_BASE_URL=https://esorhjy.github.io/cruiseline/` 重跑 browser suite；另核對線上 app-build、SW build 及核心／菜單資源 HTTP 200。部署成功不能只用本機測試或 git push 成功判定。

本輪只改資訊呈現與既有查詢行為，沒有重新查核航次、票價、餐廳供應或官方資格。資料事實邊界沿用 `CONTENT_RULES.md` 與 `CONTENT_UPDATE_2026-09-07.md`；不將舊旅客經驗升格為 2027 年正式安排。
