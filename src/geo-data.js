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
  { id:'oslo',     zh:'奧斯陸',     en:'Oslo',       region:'Norway', lat:59.907, lng:10.755, posts:['munch','oslo-people'] },
  { id:'jevnaker', zh:'Jevnaker',   en:'Jevnaker',   region:'Norway', lat:60.330, lng:10.370, posts:['the-twist'] },
  { id:'lindesnes', zh:'Lindesnes', en:'Lindesnes',  region:'Norway', lat:58.000, lng:7.050, posts:['under'] },
  { id:'kristiansand', zh:'克里斯蒂安桑', en:'Kristiansand', region:'Norway', lat:58.146, lng:7.996, posts:['kunstsilo','kilden'] },
  { id:'stavanger', zh:'斯塔萬格',  en:'Stavanger',  region:'Norway', lat:58.970, lng:5.731, posts:['stavanger'] },
  { id:'preikestolen', zh:'聖壇岩', en:'Preikestolen', region:'Norway', lat:58.986, lng:6.190, posts:['preikestolen'] },
  { id:'bergen',   zh:'卑爾根',     en:'Bergen',     region:'Norway', lat:60.391, lng:5.322, posts:['bergen'] },
  { id:'reine',    zh:'羅浮敦・Reine', en:'Reine',   region:'Norway', lat:67.932, lng:13.089, posts:['reinebringen','reine'] },
  { id:'flakstad', zh:'羅浮敦・Flakstad', en:'Flakstad', region:'Norway', lat:68.090, lng:13.300, posts:['volandstind','lofoten-e10'] },
  { id:'henningsvaer', zh:'羅浮敦・Henningsvær', en:'Henningsvær', region:'Norway', lat:68.155, lng:14.210, posts:['trevarefabrikken','lofoten-stockfish','henningsvaer'] },
  // 挪威（追加）
  { id:'a-village', zh:'羅浮敦・Å', en:'Å', region:'Norway', lat:67.879, lng:12.983, posts:['a-lofoten'] },
  // 日本・山陰
  { id:'tottori', zh:'鳥取', en:'Tottori', region:'Japan', lat:35.54, lng:134.228, posts:['ueda-shoji-museum','tottori-dunes'] },
  { id:'misasa', zh:'三朝・三德山', en:'Misasa', region:'Japan', lat:35.398, lng:133.89, posts:['nageiredo'] },
  { id:'izumo', zh:'出雲', en:'Izumo', region:'Japan', lat:35.402, lng:132.686, posts:['izumo-taisha'] },
  { id:'yasugi', zh:'安來', en:'Yasugi', region:'Japan', lat:35.384, lng:133.191, posts:['adachi-museum'] },
  // 台灣（追加）
  { id:'yehliu', zh:'野柳', en:'Yehliu', region:'Taiwan', lat:25.206, lng:121.69, posts:['yehliu'] },
  { id:'shitiwan', zh:'花蓮豐濱', en:'Fengbin', region:'Taiwan', lat:23.47, lng:121.51, posts:['shitiwan-118'] },
  // 義大利（追加）
  { id:'como', zh:'科莫', en:'Como', region:'Italy', lat:45.81, lng:9.086, posts:['como-christmas'] },
  // 法國（追加）
  { id:'saint-remy', zh:'聖雷米', en:'Saint-Rémy-de-Provence', region:'France', lat:43.789, lng:4.832, posts:['van-gogh-saint-remy'] },
  { id:'roussillon', zh:'胡西雍', en:'Roussillon', region:'France', lat:43.902, lng:5.293, posts:['roussillon'] },
  { id:'fontaine-de-vaucluse', zh:'碧泉村', en:'Fontaine-de-Vaucluse', region:'France', lat:43.922, lng:5.128, posts:['fontaine-de-vaucluse'] },
  { id:'pont-du-gard', zh:'嘉德水道橋', en:'Pont du Gard', region:'France', lat:43.947, lng:4.535, posts:['pont-du-gard'] },
  // 葡萄牙（追加）
  { id:'lisboa', zh:'里斯本', en:'Lisbon', region:'Portugal', lat:38.716, lng:-9.14, posts:['pasteis-de-belem','tram-28','maat','champalimaud'] },
  { id:'sintra', zh:'辛特拉', en:'Sintra', region:'Portugal', lat:38.797, lng:-9.39, posts:['monserrate','regaleira'] },
  { id:'porto', zh:'波多', en:'Porto', region:'Portugal', lat:41.147, lng:-8.611, posts:['livraria-lello'] },
  { id:'braga', zh:'布拉加', en:'Braga', region:'Portugal', lat:41.554, lng:-8.377, posts:['bom-jesus'] },
  { id:'marco-de-canaveses', zh:'Marco de Canaveses', en:'Marco de Canaveses', region:'Portugal', lat:41.185, lng:-8.15, posts:['obras-do-fidalgo'] },
  { id:'arouca', zh:'阿羅卡', en:'Arouca', region:'Portugal', lat:40.929, lng:-8.247, posts:['paiva-arouca'] },
  { id:'ovar', zh:'奧瓦爾', en:'Ovar', region:'Portugal', lat:40.88, lng:-8.64, posts:['cortegaca'] },
  { id:'nazare', zh:'納札雷', en:'Nazaré', region:'Portugal', lat:39.601, lng:-9.071, posts:['nazare'] },
  { id:'tomar', zh:'托馬爾', en:'Tomar', region:'Portugal', lat:39.603, lng:-8.418, posts:['tomar'] },
  { id:'marvao', zh:'馬爾旺', en:'Marvão', region:'Portugal', lat:39.394, lng:-7.377, posts:['marvao'] },
  { id:'evora', zh:'艾佛拉', en:'Évora', region:'Portugal', lat:38.571, lng:-7.908, posts:['evora'] },
  { id:'benagil', zh:'貝納吉爾', en:'Benagil', region:'Portugal', lat:37.087, lng:-8.426, posts:['benagil'] },
  // 奧地利
  { id:'salzburg', zh:'薩爾茲堡', en:'Salzburg', region:'Austria', lat:47.8, lng:13.044, posts:['salzburg'] },
  { id:'hallstatt', zh:'哈修塔特', en:'Hallstatt', region:'Austria', lat:47.562, lng:13.649, posts:['hallstatt'] },
  { id:'wien', zh:'維也納', en:'Vienna', region:'Austria', lat:48.208, lng:16.373, posts:['vienna-christmas','vienna-library','secession','hundertwasser','belvedere','aufzug-cafe'] },
  // 德國
  { id:'koenigssee', zh:'國王湖', en:'Königssee', region:'Germany', lat:47.553, lng:12.977, posts:['koenigssee','eiskapelle'] },
  // 匈牙利
  { id:'budapest', zh:'布達佩斯', en:'Budapest', region:'Hungary', lat:47.507, lng:19.046, posts:['budapest-parliament'] },
  { id:'szentendre', zh:'聖安德烈', en:'Szentendre', region:'Hungary', lat:47.669, lng:19.076, posts:['szentendre'] },
  // 瑞典
  { id:'stockholm', zh:'斯德哥爾摩', en:'Stockholm', region:'Sweden', lat:59.329, lng:18.069, posts:['skogskyrkogarden','sweden-stations','nordiska-museet'] },
  { id:'malmo', zh:'馬爾默', en:'Malmö', region:'Sweden', lat:55.605, lng:13.004, posts:['malmo','anonymouse'] },
  // 丹麥
  { id:'copenhagen', zh:'哥本哈根', en:'Copenhagen', region:'Denmark', lat:55.676, lng:12.568, posts:['forgotten-giants','urban-rigger'] },
  // 法羅群島
  { id:'faroe', zh:'法羅群島', en:'Faroe Islands', region:'Faroe', lat:62.01, lng:-6.771, posts:['faroe-winter'] },
  // 俄羅斯
  { id:'moscow', zh:'莫斯科', en:'Moscow', region:'Russia', lat:55.754, lng:37.62, posts:['st-basil'] }
];
