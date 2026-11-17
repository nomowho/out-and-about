// 國家頁地圖用的城市座標：一個城市一個點，posts 放這個城市的文章 id
// 新增文章時，把 id 加進對應城市；沒有的城市就新增一筆（lat/lng 取該地點大約位置即可）
const CITIES = [
  // 日本
  { id:'aomori',   zh:'青森',       en:'Aomori',     region:'Japan', lat:40.822, lng:140.747, posts:['aomori-top10','aomori-museum'] },
  { id:'hirakawa', zh:'平川',       en:'Hirakawa',   region:'Japan', lat:40.584, lng:140.566, posts:['seiryuji'] },
  { id:'towada',   zh:'十和田・奧入瀨', en:'Towada & Oirase', region:'Japan', lat:40.520, lng:140.975, posts:['towada','oirase','hoshino-oirase'] },
  { id:'ichinoseki', zh:'一關',     en:'Ichinoseki', region:'Japan', lat:38.990, lng:141.250, posts:['geibikei'] },
  { id:'sendai',   zh:'仙台',       en:'Sendai',     region:'Japan', lat:38.254, lng:140.873, posts:['tohoku-luxun'] },
  { id:'iwanuma',  zh:'岩沼',       en:'Iwanuma',    region:'Japan', lat:38.104, lng:140.858, posts:['kaneja'] },
  { id:'yamadera', zh:'山形・山寺', en:'Yamadera',   region:'Japan', lat:38.313, lng:140.437, posts:['yamadera'] },
  { id:'tokyo',    zh:'東京',       en:'Tokyo',      region:'Japan', lat:35.690, lng:139.770, posts:['tokyo-tower','tokyo-kaminarimon'] },
  { id:'izu',      zh:'伊豆修善寺', en:'Shuzenji',   region:'Japan', lat:34.970, lng:138.930, posts:['izu'] },
  { id:'nagoya',   zh:'名古屋',     en:'Nagoya',     region:'Japan', lat:35.180, lng:136.906, posts:['nagoya-morning','aoi-celestie','nagoya-zokei'] },
  { id:'konan',    zh:'江南',       en:'Konan',      region:'Japan', lat:35.332, lng:136.870, posts:['hotei-daibutsu'] },
  // 台灣
  { id:'hengchun', zh:'恆春半島',   en:'Hengchun',   region:'Taiwan', lat:22.030, lng:120.860, posts:['hengchun'] },
  // 義大利
  { id:'roma',     zh:'羅馬',       en:'Rome',       region:'Italy', lat:41.893, lng:12.486, posts:['terme-di-caracalla','scala-santa','borghese','moses','caravaggio','aventine'] },
  { id:'tivoli',   zh:'蒂沃利',     en:'Tivoli',     region:'Italy', lat:41.963, lng:12.798, posts:['tivoli'] },
  { id:'dolomiti', zh:'多洛米蒂',   en:'Dolomites',  region:'Italy', lat:46.600, lng:11.750, posts:['dolomiti-winter'] },
  { id:'alberobello', zh:'阿爾貝羅貝洛', en:'Alberobello', region:'Italy', lat:40.784, lng:17.237, posts:['alberobello'] },
  { id:'matera',   zh:'馬泰拉',     en:'Matera',     region:'Italy', lat:40.666, lng:16.604, posts:['matera'] },
  { id:'taormina', zh:'陶爾米納',   en:'Taormina',   region:'Italy', lat:37.852, lng:15.287, posts:['taormina'] },
  { id:'etna',     zh:'埃特納火山', en:'Mount Etna', region:'Italy', lat:37.751, lng:14.994, posts:['etna'] },
  { id:'catania',  zh:'卡塔尼亞',   en:'Catania',    region:'Italy', lat:37.502, lng:15.087, posts:['catania'] },
  { id:'siracusa', zh:'錫拉庫薩',   en:'Siracusa',   region:'Italy', lat:37.070, lng:15.285, posts:['siracusa','ear-of-dionysius'] },
  // 梵蒂岡
  { id:'vatican',  zh:'梵蒂岡',     en:'Vatican City', region:'Vatican', lat:41.902, lng:12.454, posts:['porta-santa'] },
  // 西班牙
  { id:'barcelona', zh:'巴塞隆納',  en:'Barcelona',  region:'Spain', lat:41.404, lng:2.174, posts:['sagrada-familia','sagrada-familia-2'] },
  // 法國
  { id:'paris',    zh:'巴黎',       en:'Paris',      region:'France', lat:48.861, lng:2.336, posts:['louvre-pyramid'] },
  // 葡萄牙
  { id:'fronteira', zh:'Fronteira', en:'Fronteira',  region:'Portugal', lat:39.057, lng:-7.649, posts:['byrne-portugal'] },
  { id:'peniche',  zh:'貝倫加斯群島', en:'Berlengas', region:'Portugal', lat:39.414, lng:-9.508, posts:['berlengas'] },
  // 挪威
  { id:'oslo',     zh:'奧斯陸',     en:'Oslo',       region:'Norway', lat:59.907, lng:10.755, posts:['munch'] },
  { id:'jevnaker', zh:'Jevnaker',   en:'Jevnaker',   region:'Norway', lat:60.330, lng:10.370, posts:['the-twist'] },
  { id:'lindesnes', zh:'Lindesnes', en:'Lindesnes',  region:'Norway', lat:58.000, lng:7.050, posts:['under'] },
  { id:'kristiansand', zh:'克里斯蒂安桑', en:'Kristiansand', region:'Norway', lat:58.146, lng:7.996, posts:['kunstsilo','kilden'] },
  { id:'stavanger', zh:'斯塔萬格',  en:'Stavanger',  region:'Norway', lat:58.970, lng:5.731, posts:['stavanger'] },
  { id:'preikestolen', zh:'聖壇岩', en:'Preikestolen', region:'Norway', lat:58.986, lng:6.190, posts:['preikestolen'] },
  { id:'bergen',   zh:'卑爾根',     en:'Bergen',     region:'Norway', lat:60.391, lng:5.322, posts:['bergen'] },
  { id:'reine',    zh:'羅浮敦・Reine', en:'Reine',   region:'Norway', lat:67.932, lng:13.089, posts:['reinebringen'] },
  { id:'flakstad', zh:'羅浮敦・Flakstad', en:'Flakstad', region:'Norway', lat:68.090, lng:13.300, posts:['volandstind'] },
  { id:'henningsvaer', zh:'羅浮敦・Henningsvær', en:'Henningsvær', region:'Norway', lat:68.155, lng:14.210, posts:['trevarefabrikken','lofoten-stockfish'] }
];
