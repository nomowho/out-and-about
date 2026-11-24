# Facebook 貼文導流追蹤

## 連結規則

每篇貼文使用獨立 `YYYYMMDD_文章id_版次`，例如 `20261125_under_01`。重貼同一篇文章仍須建立新代碼。

- `utm_source=facebook`
- `utm_medium=social`
- `utm_campaign=nomogram_articles`
- `utm_content=20261125_under_01`

網站只接受完整且不重複的四個欄位、上述來源／媒介／活動，以及格式正確、最長 96 字元的代碼；其餘 query、fbclid、fragment 不傳入分析。透過 Google 支援的 `campaign_source/medium/name/content` 設定歸因，`page_location` 和 referrer 繼續使用乾淨網址。DNT/GPC、預覽排除、延後載入維持原設定。

測試代碼前綴 `qa_`，活動固定為 `nomogram_tracking_test`，不與正式 `nomogram_articles` 混用。

## 產生連結與對照表

在專案根目錄執行：

```powershell
node src/maintenance/facebook-links.cjs create --article under --date 2026-11-25 --edition 01 --ledger "C:/Users/nomo/Downloads/Nomo Claude Code/output/facebook-nomogram/post-links.csv"
```

日期為台北時間，正式貼文預設週三或週六 21:00。這只產生草稿紀錄與追蹤網址，**不會替 Facebook 排程或發文**。只能選已備齊照片的既有文章，獨立行程頁可用 `--article aomori-winter`。同一代碼不得重複新增。日期、文章或版次不同會產生不同代碼。

CSV 必須放在公開 repo 外，欄位為貼文代碼、文章路徑、預定時間、追蹤連結、Facebook 網址、狀態。檔案含 UTF-8 BOM，可用 Excel 開啟。對照表只存貼文紀錄，不填讀者資料。

貼文實際排程或發佈後，可更新紀錄（這個指令也不操作 Facebook）：

```powershell
node src/maintenance/facebook-links.cjs record --id 20261125_under_01 --status published --facebook-url "https://www.facebook.com/nomogram/posts/實際貼文編號" --ledger "C:/Users/nomo/Downloads/Nomo Claude Code/output/facebook-nomogram/post-links.csv"
```

狀態可用 draft、scheduled、published、cancelled；published 必須附實際 Facebook 貼文網址。預定時間不等於已建立平台排程。

## GA4 欄位與報表

- 自訂維度「Facebook 貼文代碼」：事件範圍，參數 `fb_post_id`。
- `facebook_landing`：帶有效貼文標記的頁面開啟事件；重新整理會再計一次，不代表獨立人數。
- 同一入口頁的 page_view、正文深度、推薦曝光／點擊與 IG 點擊均附同一 `fb_post_id`。
- 不使用額外跨頁儲存；點進未帶標記的站內文章後，不繼續附加自訂 `fb_post_id`。要分析整段到訪，使用 GA4 內建「Session manual ad content／工作階段手動廣告內容」等活動維度。
- GA4 工作階段來源取決於工作階段起點。既有工作階段中再點別篇貼文，不應把它解讀為另一個新工作階段；逐次入口用 facebook_landing，整段到訪用工作階段維度。

建議探索報表：列為 Facebook 貼文代碼，欄為事件名稱，值為事件計數，篩選 facebook_landing、article_depth_50、article_depth_100、recommendation_click。正式成效排除 `qa_` 開頭代碼。這張表呈現入口文章的行為；深度只代表捲動比例，不等於真的讀完。

另在流量開發／手動活動報表以 source=facebook、medium=social、campaign=nomogram_articles 篩選，使用 Session manual ad content 分辨貼文，查看工作階段與參與工作階段。內建維度不需另建同名自訂維度。

## 驗證與限制

1. 分別開啟兩個 `qa_` 測試連結，確認 GA4 即時事件中能看到兩個不同 fb_post_id；測試活動使用 nomogram_tracking_test。
2. 自訂維度建立後，標準／探索報表需要資料處理時間，不能把沒有即時出現在表格中誤報為資料不存在。
3. 驗證開啟後的正文深度與推薦點擊仍收到事件；追蹤不阻擋正常連結跳轉。
4. Facebook 連結點擊與 GA4 入口／工作階段不會相等。阻擋追蹤、快速離頁、重複點擊與平台定義均可能造成差異。
5. 轉傳仍保留 UTM 時，會歸到原貼文連結，不保證實際開啟的 App 是 Facebook。歷史未標記連結不能回溯還原成每篇貼文。

回歸：`node src/tests/facebook-attribution.cjs`、`node src/tests/facebook-links.cjs`、`node src/tests/analytics.cjs`。

官方文件：
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://support.google.com/analytics/answer/11242870
- https://support.google.com/analytics/answer/14264492
