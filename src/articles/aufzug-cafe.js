// Aufzug Café｜由 IG 貼文 DA9s3SHhf1r（2024-10-11，189 讚）改寫；圖卡文字「一秒穿越百年維也納！在復古電梯喝咖啡」「坐在電梯裡喝咖啡？」已併入
// 照片可見：老闆穿電梯服務員制服拉花、木雕金飾的電梯車廂當座位、窗邊的電梯包廂座、吧台上的蛋糕罩、「Vorsicht! Aufzug」牌子
// 查證（2026-11-20）：地址 Wiedner Gürtel 4（維也納中央車站斜對面）；老闆 Christian Tauss 自稱電梯收藏家，把原本的吃角子老虎店改成以老電梯為主題的咖啡館，
//   Falter 2024 年報導為奧地利第一間老電梯主題咖啡館；座位包含 d'Ester 電梯工廠的木車廂、Hanns Füglister 工廠 1906 年的裝飾車廂、
//   前 CA 總部 1911 年 Paternoster 循環電梯的兩節車廂；營業週三至週日 9–17 時（Falter、The Vienna Review、Spotted by Locals）
// ⚠️ IG 原文更正：「四座百年木製電梯」改為各車廂的具體來源；「老闆是電梯修復師」改為「電梯收藏家」（來源說施工是他和家人朋友自己完成）
// 造訪時間：12 月（Nomo 2026-11-20 確認）
// 照片：Nomo 2026-11-28 補上（output/photos/_待補照片/06_奧地利/aufzug-cafe_Aufzug Café/）：首圖＝DSC09521（橫幅，橫式縮圖自動用它）、直式縮圖＝DSC09523（img/aufzug-cafe.jpg，加 cardV:true）；
//   內文用 09514／3603／3620／2F8A4A9D（IG 用過的同一張）／3611／09519／3604；未用：09522（歪斜、與 09523 相近）、3622（與 2F8A 構圖相同）、9D08B609（與 3611 相近）、
//   official.jpg＝DSC03246-2-1024x691（官網照，老闆 Christian Tauss 2026-11-28 回信同意使用官網照片，圖說標「Aufzug Café 提供」；只有 1024px，收到原圖再換）
//   menu.jpg／official.jpg 已列入 journal-exclude.json（菜單屬資訊型、官網照非 Nomo 拍攝）
// 查證（2026-11-28）：門上銘牌「Aufzug-Fabrik Hanns Füglister, Wien」與門檻鑄字見 2F8A 原檔；吧台的電梯服務員就是老闆本人，他為了開店去學了咖啡師（Wien Uncovered 2026-03）
POST_DETAIL['aufzug-cafe'] = {
  seoTitle:'維也納 Aufzug Café：坐在百年老電梯裡喝咖啡，中央車站旁的電梯主題咖啡館',
  dek:'Aufzug Café 在維也納中央車站斜對面，是老闆 Christian Tauss 把自己收藏的老電梯車廂搬進店裡、當成座位的咖啡館。木雕金飾的電梯包廂、1906 年的裝飾車廂，還有兩節 1911 年的循環電梯，坐進去喝杯咖啡，像搭著電梯回到維也納的黃金年代。',
  updated:'2026-11-28',
  cover:'img/aufzug-cafe/cover.jpg',
  cardV:true,   // /stories/ 用直式縮圖 img/aufzug-cafe.jpg（Nomo 指定直式縮圖 DSC09523）
  coverCap:"吧台後面，穿著電梯服務員制服拉花的老闆。",
  place:{
    alt:['Aufzug Café','Aufzug Cafe Wien','Elevator Café Vienna'],
    address:{ streetAddress:'Wiedner Gürtel 4', addressLocality:'Wien', addressCountry:'AT' }
  },
  body:[
    { t:'p', text:'推門進去，吧台後面的老闆戴著一頂鑲金邊的小帽子，穿著一排銀扣的深藍制服，正低頭替一杯咖啡拉花。他的打扮不是隨便穿的，那是以前電梯服務員的制服。這間店的主角，就是那些電梯。' },
    { t:'img', size:'wide', src:'img/aufzug-cafe/glass.jpg', cap:"隔著吧台上的玻璃罐，光折成一道道彩虹。" },
    { t:'h', id:'what', text:'Aufzug Café 這間咖啡館' },
    { t:'p', text:'Aufzug 是德文的「電梯」。老闆 Christian Tauss 是一位老電梯收藏家，他搬到中央車站斜對面的這棟樓之後，把一樓原本的吃角子老虎店改成咖啡館，再把自己蒐集來的老電梯車廂一節一節搬進來，變成客人的座位。據說找不到廠商願意接這種工程，最後是他和家人朋友自己動手完成的。' },
    { t:'p', text:'為了這間店，他還去學了咖啡師，所以吧台後面那位穿制服的電梯服務員，就是老闆本人。店門的玻璃上寫著「Erstes Wiener Aufzug Café」，維也納第一間電梯咖啡館。' },
    { t:'pair', imgs:['img/aufzug-cafe/front.jpg','img/aufzug-cafe/street.jpg'], cap:"左：淺藍色老樓的一樓就是店門。右：靠窗的位子，電車從門口經過。" },
    { t:'h', id:'elevators', text:'Aufzug Café 的電梯來自哪裡' },
    { t:'p', text:'每一節車廂都有自己的身世。有一節是維也納 d’Ester 電梯工廠做的木頭車廂，有一節是 Hanns Füglister 工廠 1906 年的裝飾車廂，木板上雕著花紋、鑲著金色飾條；還有兩節來自前 CA 銀行總部 1911 年的 Paternoster 循環電梯，那種沒有門、一直轉不停讓人自己跳上跳下的老式電梯。' },
    { t:'img', size:'wide', src:'img/aufzug-cafe/official.jpg', cap:"牆邊的木頭車廂，每一節都是座位。照片：Aufzug Café 提供（aufzug.cafe），經店家同意使用。" },
    { t:'p', text:'我坐進其中一節車廂，裡面剛好放得下一張小圓凳和一張大理石小桌，窗格是格子玻璃，點一杯咖啡、一塊蛋糕，就像搭著電梯慢慢升回二十世紀初。' },
    { t:'pair', imgs:['img/aufzug-cafe/lift.jpg','img/aufzug-cafe/table.jpg'], cap:"左：門上的銘牌寫著 Hanns Füglister 電梯工廠，地上的門檻也鑄著同一個名字。右：車廂裡的大理石小桌。" },
    { t:'h', id:'owner', text:'去 Aufzug Café 一定要做的事' },
    { t:'p', text:'跟老闆聊天。他很喜歡分享每一座電梯的故事：在哪裡找到、原本裝在哪棟樓、怎麼修好。他說自己最有興趣的是電梯背後的人，機械反而其次。很少遇到這麼執著又帶點古意的店主，是這趟維也納最難忘的一段咖啡時間。' },
    { t:'pair', imgs:['img/aufzug-cafe/cake.jpg','img/aufzug-cafe/menu.jpg'], cap:"左：鏡子上方掛著「Vorsicht! Aufzug!」（小心電梯）的老牌子。右：窗邊立著的菜單。" },
    { t:'p', text:'→ 同一趟維也納：<a href="/stories/hundertwasser/">百水公寓</a>｜<a href="/stories/secession/">分離派會館</a>' }
  ],
  info:[
    ['名稱','Aufzug Café'],
    ['地址','維也納 Wiedner Gürtel 4（中央車站斜對面）'],
    ['特色','老電梯車廂改成的座位，包含 1906 年裝飾車廂與 1911 年 Paternoster 循環電梯'],
    ['營業','週三至週日 9:00–17:00（以店家公告為準）'],
    ['造訪時間','12 月'],
  ],
  faq:[
    ['Aufzug Café 在哪裡？','在維也納 Wiedner Gürtel 4，維也納中央車站斜對面，搭車抵達後步行即可。'],
    ['Aufzug Café 有什麼特別？','店內座位是老闆收藏的老電梯車廂，包括 1906 年的裝飾車廂與兩節 1911 年的 Paternoster 循環電梯，可以坐在電梯裡喝咖啡。'],
    ['Aufzug Café 的營業時間？','查到的資訊是週三至週日 9:00 到 17:00，出發前建議再確認店家公告。'],
  ],
  sources:[
    ['Falter｜Aufzug Café（奧地利第一間老電梯主題咖啡館、車廂來源、營業時間）','https://www.falter.at/lokal/12554/aufzug-cafe','查閱日期 2026-11-20'],
    ['The Vienna Review｜Aufzug Café','https://www.theviennareview.at/food-drink/12554/aufzug-cafe','查閱日期 2026-11-20'],
    ['Spotted by Locals｜Aufzug Café','https://spottedbylocals.com/vienna/aufzug-cafe','查閱日期 2026-11-20'],
    ['Wien Uncovered｜Aufzug Café（老闆學了咖啡師、穿電梯服務員制服站吧台）','https://wienuncovered.com/en/elevator-cafe-vienna/','查閱日期 2026-11-28'],
  ]
};
