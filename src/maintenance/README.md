# SEO 與效能維護（2026-11-23）

## 這批變更

- 待補照片的 55 篇 `src/articles/*.js` 原始檔不更動。全站共用版型與建置結果仍會更新。
- `series-guides.json` 為八個專題提供地區、選點與時間預留建議。這些是編輯規劃，不能當成作者實際走過的日程。
- `/stories/` 保留完整 107 篇可爬取連結，搜尋與分類同時篩選；JavaScript 沒執行時仍有完整文章清單。基準手機效能 96，暫不另外拆分頁。
- `mobile-images/manifest.json` 對照手機 WebP 檔。只有寬度 700px 以下的 `<source>` 使用，桌機 `<img>` 與 JPEG srcset 保留。687 個縮圖共約 67.5 MB，來源衍生圖約 117.2 MB，減少約 42.4%；這是整組檔案統計，不是每次載入量。
- 重新產生：`python src/optimize-mobile-images.py`，然後建置。上傳原照片或變更用途後需要重新產生；不放大來源圖片。
- 首頁延遲照片有 `noscript` 備援；獨立 `image-fallback.js` 可在主要互動程式未初始化時恢復圖片。

## 更新日期

`content-dates.json` 必須提交版本控制。分類、專題、首頁等依主要文字與連結變化記錄日期；樣式、腳本版本、重新部署或跨日建置不刷新日期。文章和新聞以各自內容資料的 hash 追蹤修改，文章可保留明確的 `updated`。文章修改日期同步供可見日期、結構化資料與 sitemap 使用。舊資料首次建立基準時沿用既有日期，不猜測歷史日期。

## GA4

專用資源：**我出去一下就回來｜nomowho.com**，資源 ID `565546680`，串流 `nomowho.com 網站`。公開評估 ID 放在 `site.config.json.ga4`，不是密鑰。加強型評估已關閉，未啟用 Google Signals 或廣告個人化。

`analytics.js` 僅在正式網域執行，預覽排除。DNT 或 GPC 開啟時不載入。移除網址查詢參數、片段與 referrer 的查詢參數，不記錄搜尋框文字。Google 標籤延後到初次載入後空閒時載入。

| 事件 | 意義 |
|---|---|
| `page_view` | 頁面瀏覽 |
| `article_depth_25/50/75/100` | 正文捲動到指定比例，每頁每門檻一次；不代表真的逐字讀完 |
| `recommendation_view` | 推薦連結至少 50% 可見且停留一秒，每連結一次 |
| `recommendation_click` | 點擊文末文字推薦或 More Stories 卡片 |
| `instagram_click` | 點向 instagram.com 的連結 |

參數 `article_path` 為來源文章，`link_url` 為目的文章／IG，`link_position` 為推薦順序。先用即時報表驗證，再用長期資料評估。追蹤會受瀏覽器拒絕追蹤、廣告阻擋及快速離頁影響，不能當成全部訪客的完整紀錄。GA4 不會提高 Google 搜尋排名。

## GSC 成效比較

私人 GSC CSV/ZIP 與報告都必須放在公開 repo 外。首次基準的圖表合計為 9 點擊、257 曝光；只有短時間樣本，不能當成長期成效。

累積 2–4 週後，從同一 GSC 資源匯出前後等長、完整且不重疊日期，搜尋類型、國家、裝置條件保持一致：

```powershell
python src/maintenance/gsc-compare.py C:/private/before.zip C:/private/after.zip --out C:/private/comparison.json
```

工具檢查日期與篩選條件，合計以圖表資料為準，CTR 差異為百分點；查詢／網頁／裝置／國家分別比較。查詢可能匿名，表格加總不能替代圖表總計。位置變動也會影響 CTR，不能把所有差異歸因於摘要。

尚未發生的搜尋成效不預先填數字，未建立自動排程。

## 驗證

既有測試：`phase1.cjs`、`phase2.cjs`、`hero-image-loading.cjs`、`mobile-home-scroll.cjs`、`meta-description.cjs`、`related-reading.cjs`。
本批：`remaining.cjs`、`analytics.cjs`、`gsc-compare.py`。

手機實驗室基準：Under 91 / LCP 3.210s；青森 TOP10 93 / 2.798s；聖家堂 98 / 2.409s；全部文章 96 / 2.184s。都是 2026-11-23 的單次 Lighthouse 測量，CLS 0，並非真實使用者 Core Web Vitals。

參考：[GA4 事件](https://developers.google.com/analytics/devguides/collection/ga4/events)、[Google CSP 文件](https://developers.google.com/tag-platform/security/guides/csp)、[sitemap lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)。

## 上線後實測與收件確認

最終手機效能：Under 93（LCP 2.663s）、青森 TOP10 97（2.379s）、聖家堂 96（2.223s）、全部文章 93（2.583s）、首頁 93（2.850s）。桌機首頁 100（0.710s）。這些頁面的無障礙、最佳做法與 SEO 稽核為 100。GA4 會增加外部腳本成本，不能宣稱每頁分數都比基準高。

GA4 即時報表已看到四個文章深度事件、推薦曝光、推薦點擊及 IG 點擊；本次為驗證事件。自訂維度『來源文章』對應 article_path；目的連結使用 GA4 既有 link_url，不另建重複維度。

實際模擬主互動腳本 404，備援恢復首頁十張與專題八張照片。391px 手機版搜尋加分類篩選無橫向溢出，正式首頁維持十篇與八組專題。

## Facebook 每篇貼文歸因（2026-11-24）

新增安全活動欄位與 facebook_landing／fb_post_id，保留乾淨網址與原隱私設定。規則、外部 CSV 對照工具、測試活動和報表判讀見 [facebook-attribution.md](facebook-attribution.md)。這批僅建立追蹤，不排程或發佈 Facebook 貼文。
