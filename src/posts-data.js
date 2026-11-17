// IG 最新 20 篇貼文（2026-11-16 從 IG 抓取，likes＝當日按讚數；原始文案存在 100_Todo/drafts/data/ig-latest20-2026-11-16.json）
// 首頁首屏：按讚數前 7 名；PICK UP：全部 20 篇（新到舊）
const POSTS = [
  { id:'dolomiti-winter',    ig:'Ddjk1TSEshH', likes:929,  cat:'NATURE',       date:'2026.09.21', region:'Italy', area:'Dolomiti',  zh:'多洛米蒂',           title:'為什麼都沒人介紹過冬天的多洛米蒂？' },
  { id:'aomori-top10',       ig:'DdMbnYWEg5E', likes:2681, cat:'GUIDE',        date:'2026.09.12', region:'Japan', area:'青森',       zh:'青森冬日必訪 TOP10',  title:'青森冬日必訪 TOP10：除了蘋果跟雪，這裡還有什麼？' },
  { id:'geibikei',           ig:'Dc8iHDiEvy_', likes:265,  cat:'NATURE',       date:'2026.09.06', region:'Japan', area:'岩手',       zh:'猊鼻溪',             title:'窩著暖桌吃火鍋，穿進大雪裡的百米峭壁' },
  { id:'aomori-museum',      ig:'DctJPoikhen', likes:1114, cat:'ART',          date:'2026.08.31', region:'Japan', area:'青森',       zh:'青森縣立美術館',      title:'青森犬戴上厚厚白帽子，冬天才看得到' },
  { id:'seiryuji',           ig:'DcpcZuFkmCA', likes:9081, cat:'FAITH',       date:'2026.08.29', region:'Japan', area:'青森',       zh:'青龍寺昭和大佛',      title:'看起來像千年古寺，卻是昭和才誕生的日本最大青銅坐佛' },
  { id:'hoshino-oirase',     ig:'DcbgFMskoOG', likes:501,  cat:'NATURE',         date:'2026.08.24', region:'Japan', area:'青森',       zh:'星野奧入瀨溪流飯店',  title:'冬天讓森林沉入冬眠，只有火、溪流與溫泉還醒著' },
  { id:'towada',             ig:'DcDl99xEsAQ', likes:1086, cat:'FAITH',       date:'2026.08.15', region:'Japan', area:'青森',       zh:'十和田神社',          title:'十和田湖的人龍之戰：打了七天七夜的傳說' },
  { id:'oirase',             ig:'Dap4pvRkq92', likes:157,  cat:'NATURE',       date:'2026.07.11', region:'Japan', area:'青森',       zh:'奧入瀨溪流',          title:'流水、冰、雪三態同框，苔蘚在雪下仍然翠綠' },
  { id:'tohoku-luxun',       ig:'Daew5llEgR6', likes:453,  cat:'HISTORY',      date:'2026.07.06', region:'Japan', area:'宮城',       zh:'東北大學六號教室',    title:'一堂細菌學的幻燈片，催生出中國現代文學之父' },
  { id:'kaneja',             ig:'DaXbmuDEs5T', likes:461,  cat:'FAITH',       date:'2026.07.04', region:'Japan', area:'宮城',       zh:'金蛇水神社',          title:'牡丹叢裡藏著金蛇，日本財運最靈的能量磁場' },
  { id:'yamadera',           ig:'DaGTjMrkgBK', likes:3347, cat:'FAITH',       date:'2026.06.27', region:'Japan', area:'山形',       zh:'山寺',               title:'感受松尾芭蕉的千古名句，日本最強能量場域' },
  { id:'sagrada-familia-2',  ig:'DZ13jmgj5BU', likes:344,  cat:'ARCHITECTURE', date:'2026.06.21', region:'Spain', area:'Barcelona', zh:'聖家堂（內部）',      title:'早晨與黃昏的光，穿過 500 片彩繪玻璃，種出一座外星森林' },
  { id:'sagrada-familia',    ig:'DZwqI0CkuJY', likes:332,  cat:'ARCHITECTURE', date:'2026.06.19', region:'Spain', area:'Barcelona', zh:'聖家堂',              title:'蓋了 144 年的巨石管風琴' },
  { id:'nagoya-zokei',       ig:'DZSxecuEmEk', likes:1093, cat:'ARCHITECTURE', date:'2026.06.07', region:'Japan', area:'愛知',       zh:'名古屋造形大學',      title:'普立茲克得主山本理顯，把校園解構成流動的創意' },
  { id:'hotei-daibutsu',     ig:'DZNS79mEv3f', likes:596,  cat:'HISTORY',      date:'2026.06.05', region:'Japan', area:'愛知',       zh:'布袋大佛',            title:'沒人幫祂設計，電車卻每天替祂戴上墨鏡' },
  { id:'nagoya-morning',     ig:'DZAhKUxkqQA', likes:469,  cat:'FOOD',         date:'2026.05.31', region:'Japan', area:'愛知',       zh:'名古屋早餐',          title:'昭和老靈魂 vs 精品新浪潮，名古屋早餐的兩種面孔' },
  { id:'tokyo-kaminarimon',  ig:'DYuS-BQEvwu', likes:649,  cat:'HISTORY',      date:'2026.05.24', region:'Japan', area:'東京',       zh:'淺草三社祭',          title:'三個漁夫撈起一尊觀音，淺草雷門從此而生' },
  { id:'tokyo-tower',        ig:'DYpbP2yEn0T', likes:4808, cat:'ARCHITECTURE', date:'2026.05.22', region:'Japan', area:'東京',       zh:'東京鐵塔',            title:'東京鐵塔為什麼是 333 公尺？累計 22 萬人次、543 天蓋成的戰後地標' },
  { id:'izu',                ig:'DYhsG1ykmZW', likes:291,  cat:'FAITH',         date:'2026.05.19', region:'Japan', area:'靜岡',       zh:'伊豆修善寺',          title:'富士山絕景、千年溫泉小鎮，和一碗讓人閉嘴的鰻魚飯' },
  { id:'terme-di-caracalla', ig:'DX9nMlLEsEm', likes:2044, cat:'HISTORY',      date:'2026.05.05', region:'Italy', area:'Roma',      zh:'卡拉卡拉浴場',        title:'殺了弟弟之後，他蓋了全羅馬最奢華的澡堂' },
  // ── 更早的 30 篇（2026-11-16 加入；photo:false＝等 Nomo 提供原始照片，先用文字卡暫代）──
  { id:'porta-santa', ig:'DXvkXtDEpWS', likes:1222, photo:true, cat:'HISTORY', date:'2026.04.29', region:'Vatican', area:'Vatican City', zh:'聖伯多祿大殿聖門', title:'走進去，罪孽全消：每 25 年才打開一次的聖門' },
  { id:'alberobello', ig:'DXnluXPEjxT', likes:2579, photo:true, cat:'ARCHITECTURE', date:'2026.04.26', region:'Italy', area:'Puglia', zh:'阿爾貝羅貝洛', title:'義大利最強「逃稅」建築，住在可愛的蘑菇裡是因為窮？' },
  { id:'matera', ig:'DWqf4fnko-7', likes:529, photo:true, cat:'HISTORY', date:'2026.04.06', region:'Italy', area:'Basilicata', zh:'馬泰拉', title:'從貧民窟到 007 片場，被放生九千年的石窟城' },
  { id:'taormina', ig:'DWEo35mEnhN', likes:471, photo:true, cat:'HISTORY', date:'2026.03.19', region:'Italy', area:'Sicilia', zh:'陶爾米納', title:'諸神在西西里的懸崖包廂：陶爾米納古希臘劇場' },
  { id:'siracusa', ig:'DV1CQnREgE3', likes:327, photo:true, cat:'HISTORY', date:'2026.03.13', region:'Italy', area:'Sicilia', zh:'錫拉庫薩', title:'古希臘最偉大的城市在西西里？阿基米德的故鄉錫拉庫薩' },
  { id:'ear-of-dionysius', ig:'DVd0kzaEj0R', likes:2883, photo:true, cat:'HISTORY', date:'2026.03.04', region:'Italy', area:'Sicilia', zh:'狄奧尼修斯之耳', title:'上帝遺落在西西里的耳朵，居然是暴君的竊聽器' },
  { id:'etna', ig:'DVRHKGCknNz', likes:203, photo:true, cat:'NATURE', date:'2026.02.27', region:'Italy', area:'Sicilia', zh:'埃特納火山', title:'西西里的冰與火之歌：去歐洲最活躍的火山' },
  { id:'catania', ig:'DVOgnOBkkpX', likes:250, photo:true, cat:'ARCHITECTURE', date:'2026.02.26', region:'Italy', area:'Sicilia', zh:'卡塔尼亞', title:'西西里島的黑色巴洛克：用火山岩蓋起來的城市' },
  { id:'tivoli', ig:'DTVAtJgkjM0', likes:318, photo:true, cat:'ARCHITECTURE', date:'2026.01.10', region:'Italy', area:'Lazio', zh:'蒂沃利', title:'古羅馬皇帝的水樂園，美到連丹麥都來借名字' },
  { id:'scala-santa', ig:'DSfa56ykkwq', likes:6781, photo:true, cat:'HISTORY', date:'2025.12.20', region:'Italy', area:'Roma', zh:'聖階', title:'耶穌受審前走過的 28 階，跪著爬上羅馬的聖階' },
  { id:'borghese', ig:'DREdslJEqWJ', likes:327, photo:false, cat:'ART', date:'2025.11.15', region:'Italy', area:'Roma', zh:'博爾蓋塞美術館', title:'羅馬最滿足的兩小時：看貝尼尼把大理石捏成肉' },
  { id:'moses', ig:'DQZpFbKkmB6', likes:761, photo:false, cat:'ART', date:'2025.10.29', region:'Italy', area:'Roma', zh:'米開朗基羅摩西像', title:'比大衛還震撼？米開朗基羅的巔峰之作摩西像' },
  { id:'hengchun', ig:'DQLMiqlEjOK', likes:156, photo:false, cat:'NATURE', date:'2025.10.23', region:'Taiwan', area:'屏東', zh:'恆春欖仁溪', title:'跟著老鷹飛過欖仁溪：恆春的秋天是被風推著走的' },
  { id:'caravaggio', ig:'DQCSIC8kkGz', likes:264, photo:false, cat:'ART', date:'2025.10.20', region:'Italy', area:'Roma', zh:'聖路易吉法國人教堂', title:'羅馬免費看卡拉瓦喬：三幅用光寫成的聖經' },
  { id:'aventine', ig:'DPYN2nnEvYx', likes:1561, photo:false, cat:'HISTORY', date:'2025.10.04', region:'Italy', area:'Roma', zh:'亞文提諾山', title:'羅馬的奈米景點：一眼看見三個國家的鑰匙孔' },
  { id:'louvre-pyramid', ig:'DPEq8hpki9x', likes:181, photo:false, cat:'ARCHITECTURE', date:'2025.09.26', region:'France', area:'Paris', zh:'羅浮宮倒金字塔', title:'讓光與時間靜靜下墜：羅浮宮的倒金字塔' },
  { id:'byrne-portugal', ig:'DO2qItPkj88', likes:174, photo:false, cat:'ARCHITECTURE', date:'2025.09.20', region:'Portugal', area:'Alentejo', zh:'阿托萊魯什戰役解說中心', title:'朝聖 Gonçalo Byrne 的紅色混凝土：阿托萊魯什戰役解說中心' },
  { id:'berlengas', ig:'DOjCzGFEvbL', likes:179, photo:false, cat:'NATURE', date:'2025.09.13', region:'Portugal', area:'Peniche', zh:'貝倫加斯群島', title:'大西洋上的海上碉堡：貝倫加斯群島' },
  { id:'munch', ig:'DOdmoSGEs_r', likes:115, photo:false, cat:'ART', date:'2025.09.11', region:'Norway', area:'Oslo', zh:'孟克美術館', title:'奧斯陸港邊的沙蟲：孟克美術館與《吶喊》' },
  { id:'the-twist', ig:'C_p04DwBvvK', likes:482, photo:false, cat:'ART', date:'2025.09.07', region:'Norway', area:'Jevnaker', zh:'The Twist 美術館', title:'被巨人扭轉的橋：橫跨河面的漂浮美術館 The Twist' },
  { id:'under', ig:'C_XmPDEhft9', likes:310, photo:false, cat:'FOOD', date:'2025.08.31', region:'Norway', area:'Lindesnes', zh:'Under 海底餐廳', title:'全世界最美的海底餐廳 Under：在海平面下吃米其林' },
  { id:'kunstsilo', ig:'DM-i1q_Bnnl', likes:109, photo:false, cat:'ART', date:'2025.08.05', region:'Norway', area:'Kristiansand', zh:'Kunstsilo 美術館', title:'1935 年的穀倉變成美術館：斯卡格拉克海峽畔的 Kunstsilo' },
  { id:'kilden', ig:'DM4j60HhbS-', likes:124, photo:false, cat:'ARCHITECTURE', date:'2025.08.03', region:'Norway', area:'Kristiansand', zh:'Kilden 表演藝術中心', title:'送給大海的禮物盒：Kilden 表演藝術中心' },
  { id:'preikestolen', ig:'DMajndyBKd7', likes:136, photo:false, cat:'NATURE', date:'2025.07.22', region:'Norway', area:'Rogaland', zh:'聖壇岩', title:'懸在峽灣上 604 公尺的石壇：挪威聖壇岩' },
  { id:'stavanger', ig:'DLuuNh0Bi7E', likes:120, photo:false, cat:'HISTORY', date:'2025.07.05', region:'Norway', area:'Stavanger', zh:'斯塔萬格三劍紀念碑', title:'三把巨劍插進峽灣：斯塔萬格與維京人的統一之戰' },
  { id:'bergen', ig:'DLnNW0nBrf4', likes:110, photo:false, cat:'HISTORY', date:'2025.07.02', region:'Norway', area:'Bergen', zh:'卑爾根', title:'一年下兩百多天雨的城市：卑爾根把雨過成生活' },
  { id:'lofoten-stockfish', ig:'DLCkhwDBTK3', likes:108, photo:false, cat:'FOOD', date:'2025.06.18', region:'Norway', area:'Lofoten', zh:'羅浮敦鱈魚乾', title:'風乾的藝術：羅浮敦群島的鱈魚乾架' },
  { id:'volandstind', ig:'DK3j6V4BfCl', likes:136, photo:false, cat:'NATURE', date:'2025.06.13', region:'Norway', area:'Lofoten', zh:'Volandstind', title:'羅浮敦的馬特洪峰：雲霧裡的 Volandstind' },
  { id:'reinebringen', ig:'DKhfyZRB6_y', likes:123, photo:false, cat:'NATURE', date:'2025.06.05', region:'Norway', area:'Lofoten', zh:'Reinebringen', title:'北極圈最危險的風景步道：爬上 Reinebringen' },
  { id:'trevarefabrikken', ig:'DJRmcQqhJ1M', likes:169, photo:false, cat:'ARCHITECTURE', date:'2025.05.05', region:'Norway', area:'Lofoten', zh:'Trevarefabrikken', title:'北極圈裡的靈魂工廠：老木工廠改成的旅館 Trevarefabrikken' }
];
// 首屏：有照片的文章中，按讚數前 7 名（photo:false 的等原始照片到了才會進首屏）
const TOP7 = [...POSTS].filter(p => p.photo !== false).sort((a, b) => b.likes - a.likes).slice(0, 7);

// 卡片圖：有照片用 img/<id>.jpg；photo:false 先用灰色文字卡暫代
function thumb(p) {
  if (p.photo === false) return `<div class="ph"><span>${p.region.toUpperCase()} · ${p.area}</span><b>${p.zh}</b><i>照片整理中</i></div>`;
  return `<img src="img/${p.id}.jpg" alt="${p.zh}" loading="lazy">`;
}
