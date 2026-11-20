// 系列專題：首頁 SERIES 色帶、首頁專題大圖與 /series/ 頁共用
// ids：手動列出文章；或用 region（國家）／cat（分類）自動收錄，build 時依日期新到舊排（新文章會自動加入）
// img：卡片用的文章 id（img/<id>.jpg）；wide：首頁專題大圖（橫式）。沒有照片的系列（目前挪威）首頁先不出現，專題頁照常
// 首頁順序＝這裡的排列順序（Nomo 11-20 指定，不再依篇數自動排）
// 2026-11-20 Nomo 調整：刪除「歐洲建築巡禮」「建築與美術館」（舊網址轉到建築散策），新增深見系列＋建築散策＋藝術漫遊
const SERIES = [
  { id:'japan', t:'深見　日本', en:'JAPAN', tag:'從雪國走到喫茶店', wide:'img/tokyo-kaminarimon/wide.jpg', widePos:'50% 50%', img:'seiryuji',
    d:'從東北的雪國到東京、名古屋、伊豆，一個國家慢慢走。',
    intro:'日本是我去最多次的國家，但每次都還有沒看過的角落。從青森的雪地大佛、奧入瀨的溪流，到東京鐵塔、淺草雷門，再到名古屋的喫茶店早餐與伊豆的古寺，這個系列收錄我在日本走過的地方，寫給想看見觀光地圖以外那一面的人。',
    region:'Japan' },
  { id:'italy-drive', t:'深見　義大利', en:'ITALY', tag:'從阿爾卑斯山走到西西里', wide:'img/alberobello/cover-v.jpg', widePos:'50% 62%', img:'dolomiti-2',
    d:'從北邊的多洛米蒂到南邊的西西里，一路往深處走。',
    intro:'義大利很長，從北邊雪白的多洛米蒂山區，到羅馬的古蹟與教堂、普利亞的蘑菇屋、馬泰拉的石窟城，一路往南走到西西里的火山與古希臘遺跡。這個系列收錄我在義大利走過的地方，看兩千年的歷史怎麼和日常生活疊在一起。',
    region:'Italy' },
  { id:'portugal', t:'深見　葡萄牙', en:'PORTUGAL', tag:'大西洋邊上的葡萄牙', wide:'img/berlengas/cover.jpg', widePos:'50% 22%', img:'berlengas',
    d:'大西洋外海的碉堡小島，和阿連特茹平原上的建築。',
    intro:'葡萄牙的風景，總和大西洋脫不了關係。從佩尼謝外海、只能搭船抵達的貝倫加斯群島與海上碉堡，到阿連特茹平原上的現代建築，這個系列收錄我在葡萄牙走過的地方，寫給想避開人潮、往海邊與內陸走得更遠一點的人。',
    region:'Portugal' },
  { id:'norway', t:'深見　挪威', en:'NORWAY', tag:'峽灣、建築與北極圈', wide:null, img:null,
    d:'從奧斯陸、南岸到羅弗敦群島，照片整理中。',
    intro:'挪威的風景很大，人很少。從奧斯陸的孟克美術館、耶夫納克橫跨河面的美術館 The Twist，到南岸的海底餐廳 Under、斯塔萬格的聖壇岩，一路往北到羅弗敦群島的山與鱈魚乾。這個系列收錄我在挪威走過的地方，照片正在整理中。',
    region:'Norway' },
  { id:'architecture-walk', t:'建築散策', en:'ARCHITECTURE', tag:'為一棟建築，出發一趟旅行', wide:'img/byrne-portugal/cover.jpg', widePos:'50% 50%', img:'tokyo-tower',
    d:'從高第的聖家堂到山本理顯的校園，看建築怎麼改變一座城市。',
    intro:'有些旅行，是為了一棟建築才出發的。從巴塞隆納蓋了一百多年的聖家堂、羅浮宮的玻璃金字塔、東京鐵塔，到山本理顯的名古屋造形大學與永山祐子的 AOI CELESTIE，這個系列整理我走過的建築，記下空間、光線和人之間的關係。',
    cat:'ARCHITECTURE' },
  { id:'art-wander', t:'藝術漫遊', en:'ART', tag:'把美術館排進行程第一站', wide:'img/borghese/hall.jpg', widePos:'50% 45%', img:'aomori-museum',
    d:'從貝尼尼、卡拉瓦喬到奈良美智，看一件作品怎麼留住一個時代。',
    intro:'一件好作品，值得專程去看一次。從羅馬博爾蓋塞美術館裡貝尼尼的大理石雕像、米開朗基羅的摩西、卡拉瓦喬的祭壇畫，到雪地裡的青森縣立美術館與奈良美智的青森犬，這個系列收錄我走過的美術館與教堂，看藝術怎麼留住一個時代。',
    cat:'ART' },
  { id:'tohoku-winter', t:'冬日限定　日本東北', en:'TOHOKU', tag:'東北，冬天去才對', wide:'img/oirase/content-01_card.jpg', widePos:'50% 50%', img:'towada',
    d:'十二月底的青森、岩手、宮城、山形，雪把一切都變安靜。',
    intro:'十二月底，我沿著青森、岩手、宮城、山形一路往北。雪把聲音都收走了，只剩奧入瀨的溪水、青龍寺大佛肩上的積雪，和猊鼻溪小船裡的暖桌火鍋。這個系列收錄十段冬日旅程，從神社、美術館到溫泉旅館，寫給想在最冷的季節認識東北的人。',
    ids:['aomori-top10','seiryuji','towada','oirase','hoshino-oirase','aomori-museum','geibikei','kaneja','tohoku-luxun','yamadera'] },
  { id:'nagoya', t:'被低估的城市　名古屋', en:'NAGOYA', tag:'名古屋，比你想的有趣', wide:'img/hotei-daibutsu/cover.jpg', widePos:'50% 47%', img:'nagoya-morning',
    d:'早餐、大學、大佛，名古屋比你想的有趣。',
    intro:'很多人只把名古屋當轉運站，我卻在這裡待得比預期還久。從昭和喫茶店到精品咖啡的早餐文化、永山祐子的藍色屋頂 AOI CELESTIE、山本理顯的校園，到被電車戴上墨鏡的布袋大佛，這個系列寫給願意多停一天、慢慢認識名古屋的人。',
    ids:['nagoya-morning','aoi-celestie','nagoya-zokei','hotei-daibutsu'] }
];
