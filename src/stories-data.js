// 首頁「Stories 現在動態」：仿 IG 限時動態，一個圓圈一組，點開是全螢幕直式輪播
// 首頁只秀最前面那一組（Nomo 2026-11-17 指示），其他組留著當存檔。新的放最前面。每張：img（直式照片，img/ 底下的路徑）、text（一兩句話）、link（選填，站內文章網址）
// date：這組動態的日期（YYYY.MM.DD），首頁會顯示「今天／N 天前」
const STORIES = [
  { id:'dolomiti', label:'多洛米蒂', date:'2026.11.17', items:[
    { img:'img/dolomiti-2.jpg', text:'' },
    { img:'img/dolomiti-winter/c03.jpg', text:'冬天的樣子：雪原後方的 Odle 群峰。', link:'/stories/dolomiti-winter/' },
    { img:'img/dolomiti-winter/c05.jpg', text:'帶狗散步的人，背後是覆雪的岩峰。秋天那一篇正在寫。', link:'/stories/dolomiti-winter/' }
  ]},
  { id:'sicily', label:'西西里', date:'2026.11.17', items:[
    { img:'img/ear-of-dionysius/cover.jpg', text:'狄奧尼修斯之耳，高約 23 公尺的耳朵形石窟。', link:'/stories/ear-of-dionysius/' },
    { img:'img/etna/summit.jpg', text:'埃特納火山的山頂還在冒煙。', link:'/stories/etna/' },
    { img:'img/taormina/corso.jpg', text:'陶爾米納的主街，傍晚亮起燈飾。', link:'/stories/taormina/' },
    { img:'img/siracusa/archimedes.jpg', text:'錫拉庫薩港邊的阿基米德銅像。', link:'/stories/siracusa/' }
  ]},
  { id:'rome', label:'羅馬', date:'2026.11.17', items:[
    { img:'img/porta-santa/cover.jpg', text:'2025 禧年，朝聖者穿過敞開的聖門。', link:'/stories/porta-santa/' },
    { img:'img/tivoli/canopus.jpg', text:'蒂沃利，哈德良別墅的卡諾普斯。', link:'/stories/tivoli/' },
    { img:'img/alberobello/cover-v.jpg', text:'再往南一點：阿爾貝羅貝洛的石錐屋頂。', link:'/stories/alberobello/' }
  ]},
  { id:'aomori', label:'青森', date:'2026.09.12', items:[
    { img:'img/aomori-top10/01_seiryuji.jpg', text:'暴雪裡的昭和大佛。', link:'/stories/seiryuji/' },
    { img:'img/aomori-top10/02_oirase.jpg', text:'雪中的奧入瀨溪流，石頭像一顆顆白色饅頭。', link:'/stories/oirase/' },
    { img:'img/aomori-top10/06_aomoriken.jpg', text:'戴著雪帽的青森犬。', link:'/stories/aomori-museum/' },
    { img:'img/aomori-top10/11_closing.jpg', text:'暖手時間，一塊蘋果派。', link:'/stories/aomori-top10/' }
  ]}
];
