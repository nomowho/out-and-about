# Out and About｜我出去一下就回來

Nomo 的旅行雜誌（靜態網站）。根目錄就是網站輸出，`src/` 是原始資料與產生器。

- 建置：`node src/build.cjs`
- 建置＋發佈：`bash src/publish.sh "訊息"`
- 本機預覽：`npx serve . -l 4335`
- 網址設定：`src/site.config.json`（`url` 正式網址、`domain` 會寫成 CNAME）

## 內容放哪裡
- 文章清單：`src/posts-data.js`（分類 cat、按讚數、photo）
- 文章內文：`src/articles/<id>.js`
- 外電：`src/news-data.js`（最新放最前面；正式站不放原站照片）
- 系列：`src/series-data.js`
- 照片：`img/<id>.jpg`（卡片圖）、`img/<id>/`（內文圖）；每張要有同名 `.m.jpg`（寬 1080 的手機版）
- 樣式：`src/templates/*.html` 的 `<style>`（各版型）＋ `src/common.css`（手機版與共用）
