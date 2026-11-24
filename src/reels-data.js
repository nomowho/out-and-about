// 首頁 Reels 區（Nomo 11-24）：順序＝這裡的排列；封面存 img/reels/<code>.jpg（取自 IG 官方嵌入頁的 9:16 封面）
// 新增：貼 IG Reels 網址的 code、標題、地點；封面用 Playwright 抓 /reel/<code>/embed/ 的 EmbeddedMediaImage
const REELS = [
  { code:'DMajndyBKd7', t:'懸浮在峽灣上的石壇', place:'聖壇岩 Preikestolen・挪威' },
  { code:'DOBl1KpktuJ', t:'全世界最美的海底餐廳', place:'Under Lindesnes・挪威' },
  { code:'DOTMyaREqy-', t:'被巨人扭轉的漂浮美術館', place:'The Twist・挪威' },
  { code:'DWyg5DQks5X', t:'從貧民窟到 007 片場的石窟城', place:'馬泰拉 Matera・義大利' },
  { code:'DWOvzV9kvIm', t:'西西里島的大亨小傳', place:'陶爾米納 Taormina・義大利' },
  { code:'DVoGJXzAU6U', t:'普羅米修斯式的衝突', place:'狄奧尼修斯之耳・義大利' },
  { code:'DQLMiqlEjOK', t:'跟著老鷹飛過欖仁溪', place:'欖仁溪・屏東恆春' },
  { code:'DPJylbxEqN9', t:'騎偉士牌穿越永恆之城', place:'Vespa in Roma・義大利' },
  { code:'DOjCzGFEvbL', t:'大西洋上自生而成的海上碉堡', place:'貝倫加斯群島 Berlengas・葡萄牙' }
];
