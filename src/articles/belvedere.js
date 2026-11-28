// 美景宮｜歷史建築篇。原本由 IG 貼文 DBVKLqXBZO8（2024-10-20，152 讚）改寫成一篇以克林姆為主的文章；
//   2026-11-28 Nomo 補照片時指示拆成兩篇：本篇（原網址 /stories/belvedere/）講宮殿歷史與建築，克林姆畫作移到 belvedere-klimt.js
// 照片：Nomo 2026-11-28 補上（output/photos/_待補照片/06_奧地利/belvedere_美景宮/），Nomo 指定封面＝DSC09472（水池倒影）；
//   直式縮圖＝DSC09621（img/belvedere.jpg，cardV:true）；內文 09421 gate／09434 lion＋09435 iron／09475 sun／09530 roof／09477 pavilion／
//   09539 view／09572 axis／09545 lower／09627 spider／09740 atlas＋09724 stair／09733 marble／09707 ceiling／09705 window／
//   09718 gallery＋09722 visitor／IMG_4069 napoleon；未用：09580（花園小徑，與 axis 重複）、09632（小天使噴泉）、09642（施瓦岑貝格廣場蘇聯紀念碑，不在美景宮內）、IMG_4030（木雕十字架，認不出是哪件作品）
//   09722 畫面裡的人應是同行者，圖說只寫房間不寫人
// 造訪時間：EXIF 為 12 月 24 日（Sony 相機時鐘是台灣時間，換算維也納當地約早上 9 點到下午 2 點半；iPhone 12:49 起拍畫作），文中寫「平安夜」、info 只寫 12 月
//   鐵門後的紅色大數字＝新年拍照裝置，圖說不寫年份
// 查證（2026-11-28）：belvedere.at 年表（1712 下宮動工、1717 完工上宮動工、1718 花園完工 Girard、1719 接見鄂圖曼大使 Ibrahim Pasha、1720 委託 Carlone 畫大理石廳天頂、
//   1723 上宮落成、1732 Sala Terrena 改建、1736 親王過世姪女 Victoria 繼承、1752 瑪麗亞・特蕾莎購入、1770 瑪麗亞・安東尼雅婚禮慶典、1776 決定遷入皇家畫廊、1777 畫廊啟用、
//   1891 藝術史博物館開幕後收藏遷出、1896 斐迪南大公官邸、1903 現代美術館、1945 大理石廳被炸、1955-05-15 國家條約）；
//   Austria-Forum（名稱由來＝義大利文「美麗的景色」、上宮比下宮高約 23 公尺、雕像主題＝從冥界升到奧林帕斯、上層花圃人面獅身、下層八位繆思＋卡莉歐碧與海克力斯、
//   屋頂被比作「土耳其帳篷」、四尊亞特拉斯、費格爾那句話是在大理石廳說的不是陽台、布魯克納 1896-10-11 在 Kustodenstöckl 過世）；
//   Wikipedia（Carlone 天頂＝把歐根親王比作阿波羅與繆思的領袖；拿破崙畫 1803 年版送米蘭、1816 年被奧地利沒收、1834 年進美景宮）
//   ⚠️ 推論註記：Louise Bourgeois 展期 2023-09-22～2024-01-28，花園的蜘蛛依 El País 報導屬同一展；雕塑為暫時展出作品，若日後需要可撤圖
POST_DETAIL['belvedere'] = {
  seoTitle:'維也納美景宮歷史與建築：歐根親王的巴洛克夏宮、從冥界走到奧林帕斯的花園，到 1955 年簽下國家條約的大理石廳',
  dek:'美景宮（Belvedere）是打敗鄂圖曼的歐根親王在維也納城南山坡上蓋的巴洛克夏宮：下宮 1712 年動工，上宮 1723 年完成，中間是一整座法式花園。親王死後由瑪麗亞・特蕾莎買下，上宮在 1777 年成為世界最早的公共美術館之一；1955 年 5 月 15 日，奧地利在上宮的大理石廳簽下國家條約，重新成為獨立國家。',
  updated:'2026-11-28',
  cover:'img/belvedere/cover.jpg',
  cardV:true,   // /stories/ 用直式縮圖 img/belvedere.jpg（DSC09621 花園中軸線）
  coverCap:'冬天的水池很安靜，整座上美景宮都倒映在裡面。',
  place:{
    alt:['Belvedere','Schloss Belvedere','Upper Belvedere','Oberes Belvedere','Lower Belvedere','Unteres Belvedere','美景宮','觀景宮'],
    url:'https://www.belvedere.at/en',
    address:{ streetAddress:'Prinz-Eugen-Straße 27', addressLocality:'Wien', postalCode:'1030', addressCountry:'AT' },
    geo:[48.1915, 16.3809]
  },
  body:[
    { t:'p', text:'平安夜那天早上，我從上美景宮的正門走進去。鐵門頂上頂著一頂黑色的皇冠，門柱上的石獅抱著金色盾徽，門外的行道樹葉子全掉光了。這座宮殿最早的主人，是一位打了一輩子仗的將軍。' },
    { t:'img', size:'wide', src:'img/belvedere/gate.jpg', cap:'鐵門後面已經立好紅色的大數字，等著跟新年合照。' },
    { t:'h', id:'eugene', text:'歐根親王：被法王拒絕的將軍' },
    { t:'p', text:'歐根親王（Prince Eugene of Savoy）1663 年生在巴黎，想加入路易十四的軍隊被拒絕，1683 年轉投神聖羅馬帝國皇帝利奧波德一世，一加入就碰上鄂圖曼大軍圍攻維也納，參加了解圍的卡倫山戰役。1693 年他升為帝國元帥，1697 年在森塔戰役大敗土耳其人，1703 年當上宮廷戰爭委員會主席，成了哈布斯堡最倚重的將領。' },
    { t:'p', text:'也是 1697 年，他在維也納城牆外的 Rennweg 買下一塊坡地，之後陸續把旁邊的地也買進來。1704 年開始整地，1712 年下宮動工，1717 年下宮完成、上宮接著開工，1723 年上宮落成。兩座宮殿都出自巴洛克建築師希爾德布蘭特（Johann Lukas von Hildebrandt）。' },
    { t:'pair', imgs:['img/belvedere/lion.jpg','img/belvedere/iron.jpg'], cap:'左：門柱上的石獅抱著金色盾徽，頭頂還有一頂皇冠。右：隔著鐵門的捲花看上宮。' },
    { t:'h', id:'name', text:'「美景宮」這個名字的由來' },
    { t:'p', text:'Belvedere 是義大利文的「美麗的景色」。整座宮殿蓋在城南一路往上爬的斜坡上，上宮比下宮高了大約 23 公尺，站在上宮前面往北看，花園、下宮、教堂的圓頂和維也納的屋頂全排在眼前，名字就是從這片景色來的。在歐根親王的年代，這裡還只是他城外的夏宮。' },
    { t:'img', size:'wide', src:'img/belvedere/view.jpg', cap:'從上宮往下看，下宮和教堂圓頂後面就是整片維也納。' },
    { t:'h', id:'garden', text:'從冥界走到奧林帕斯山的花園' },
    { t:'p', text:'花園由法國造園師多明尼克・吉拉德（Dominique Girard）規劃，他在凡爾賽學過水利和造園，1718 年整座巴洛克花園完工。上下宮的高低差，讓花園分成好幾層，用階梯和跌水串起來，雕像也照著高度安排：從最下面的冥界，一路爬升到最上面的奧林帕斯山。' },
    { t:'p', text:'下層花圃兩側站著八位繆思，第九位卡莉歐碧和海克力斯站在一起，還有火與水的寓意像、阿波羅與達芙妮；上層花圃則交給了人面獅身像。整套雕像是在替主人說故事，把歐根親王比作阿波羅，從凡間一路升上眾神住的地方。' },
    { t:'img', size:'wide', src:'img/belvedere/axis.jpg', cap:'站在花園中軸線上，台階、雕像和上宮左右對稱，冬天的灌木也剪得整整齊齊。' },
    { t:'h', id:'upper', text:'上美景宮的屋頂為什麼像帳篷' },
    { t:'p', text:'上宮是整座園區的門面，用來接待貴客和辦宴會。1719 年，鄂圖曼帝國的大使易卜拉欣帕夏（Ibrahim Pasha）就是在這裡被接見的。正面拉得很長，中間是三道大拱門的主樓，兩端是圓頂的角樓，每一段都有自己的屋頂，綠色的銅瓦一塊一塊隆起來，有人看了會聯想到一排「土耳其帳篷」。一位打了一輩子土耳其人的將軍，蓋出來的宮殿被說像對手的營帳。' },
    { t:'img', size:'wide', src:'img/belvedere/sun.jpg', cap:'早上的太陽剛好照在上宮正面，綠色屋頂一塊一塊隆起。' },
    { t:'p', text:'上宮前面那一大池水也是設計的一部分。美景宮官方的說法是，水池把整片立面倒映出來，宮殿看起來就多了一倍。' },
    { t:'img', size:'wide', src:'img/belvedere/roof.jpg', cap:'屋簷上站滿了雕像，正中間還頂著一面金色盾徽。' },
    { t:'h', id:'sala-terrena', text:'撐住天花板的四尊巨人' },
    { t:'img', size:'side', src:'img/belvedere/pavilion.jpg', cap:'三道拱門後面就是 Sala Terrena，四尊巨人在裡面撐著天花板。' },
    { t:'p', text:'從花園那一側的三道拱門走進上宮，第一個廳叫 Sala Terrena，是花園廳和門廳的結合。宮殿蓋好沒多久，這裡的結構就出了問題，1732 年希爾德布蘭特動手改建，加上拱頂，再用四尊亞特拉斯（Atlas）巨人柱把天花板撐住，一直撐到今天。' },
    { t:'p', text:'旁邊的白色大樓梯往上通到二樓，牆面和拱頂全是白色灰泥浮雕，扶手邊掛著黑鐵大燈籠，一路把人帶到宮殿正中央的大理石廳。' },
    { t:'pair', imgs:['img/belvedere/atlas.jpg','img/belvedere/stair.jpg'], cap:'左：四尊亞特拉斯之一，從 1732 年扛到現在。右：白色大樓梯往上通到大理石廳。' },
    { t:'h', id:'marble-hall', text:'大理石廳：「奧地利自由了！」' },
    { t:'p', text:'大理石廳在上宮正中央，挑高兩層，紅色大理石壁柱配金色灰泥。天花板的濕壁畫是 Carlo Carlone 在 1720 年受託畫的，主題是把歐根親王比作阿波羅、繆思的領袖；四周以假亂真的建築透視壁畫，則出自 Gaetano Fanti。二戰末期，這個廳被炸彈打壞了一部分，1945 年起才慢慢修復。' },
    { t:'img', size:'wide', src:'img/belvedere/ceiling.jpg', cap:'抬頭看，水晶燈、橢圓窗和金色灰泥全擠在一起。' },
    { t:'p', text:'1955 年 5 月 15 日，美、英、法、蘇四國外長和奧地利外長費格爾（Leopold Figl）在這個廳裡簽下《奧地利國家條約》，結束戰後十年的四國占領，奧地利重新成為獨立國家。新聞片裡，費格爾站在陽台上高舉條約，花園裡擠滿歡呼的人，這一幕成了奧地利現代史最有名的畫面。' },
    { t:'p', text:'不過那句有名的「奧地利自由了！」（Österreich ist frei!）並不是在陽台上喊的。陽台上沒有擴音設備，他是在大理石廳裡簽完字之後，當場說出這句話。' },
    { t:'pair', imgs:['img/belvedere/marble.jpg','img/belvedere/window.jpg'], cap:'左：從上面往下看大理石廳，底下的人都變得好小。右：逆光的窗邊，大家都在找看得到維也納的那個角度。' },
    { t:'h', id:'museum', text:'世界最早的公共美術館之一' },
    { t:'p', text:'1736 年 4 月 21 日，歐根親王在市區 Himmelpfortgasse 的宮邸過世，沒有留下有效的遺囑，美景宮由姪女維多利亞公主繼承。1752 年，瑪麗亞・特蕾莎把整片產業買了下來；1770 年 4 月 17 日，她的女兒瑪麗亞・安東尼雅要嫁給法國王儲，也就是後來的瑪麗・安東妮和路易十六，美景宮為此辦了一場盛大的慶典。' },
    { t:'p', text:'1776 年，瑪麗亞・特蕾莎和兒子約瑟夫二世決定把皇家畫廊從霍夫堡的 Stallburg 搬進上宮，並且開放給一般民眾參觀。畫廊在 1777 年啟用，美景宮成了世界最早的公共美術館之一。一百多年後，1891 年藝術史博物館開幕，皇家收藏搬了過去，美景宮空了一陣子。' },
    { t:'pair', imgs:['img/belvedere/gallery.jpg','img/belvedere/visitor.jpg'], cap:'左：「通往啟蒙之路」展區，掛的是十八、十九世紀的畫。右：鑲木地板配高高的木門，房間本身就很好看。' },
    { t:'p', text:'1896 年，皇帝法蘭茲・約瑟夫把上宮撥給皇儲法蘭茲・斐迪南大公當官邸，他在這裡一直住到 1914 年在塞拉耶佛遇刺，那場暗殺引爆了第一次世界大戰。同一年秋天，作曲家布魯克納在宮殿旁的管理員宿舍過世，那間房子是皇帝體恤他行動不便，前一年才撥給他住的。' },
    { t:'p', text:'1903 年，下宮開了「現代美術館」（Moderne Galerie），專門收奧地利的當代藝術，後來一路擴大成今天的奧地利美景宮美術館（Österreichische Galerie Belvedere），收藏從中世紀排到現在。克林姆的《吻》，就是在 1908 年被買進這間現代美術館的。' },
    { t:'p', text:'上宮裡還有一幅很難錯過的大畫：法國畫家大衛的《拿破崙越過阿爾卑斯山》。大衛前後畫了五個版本，維也納這一幅是 1803 年送到米蘭的那一版，1816 年被奧地利人沒收，1834 年掛進美景宮。拿破崙要求把他畫成「在烈馬上保持冷靜」，實際翻越大聖伯納山口時，他是由嚮導牽著騾子帶過去的。拿破崙兩度攻進維也納，他最有名的一張畫像，最後留在了哈布斯堡的宮殿裡。' },
    { t:'img', size:'side', src:'img/belvedere/napoleon.jpg', cap:'石頭上刻著 BONAPARTE，旁邊是漢尼拔和查理曼，三個翻過阿爾卑斯山的人。' },
    { t:'h', id:'lower', text:'下美景宮與花園裡的大蜘蛛' },
    { t:'p', text:'從上宮沿著花園一路往下走到底，就是下美景宮。這裡才是歐根親王真正住的地方，旁邊還有他專用的私人花園和橘園；下宮現在主要拿來辦特展。' },
    { t:'img', size:'wide', src:'img/belvedere/lower.jpg', cap:'下美景宮的紅屋頂後面，就是維也納市區。' },
    { t:'p', text:'2023 年是上宮落成 300 年，美景宮在下宮辦了 Louise Bourgeois 的大展，花園裡也放了一隻她招牌的大蜘蛛雕塑。我去的時候還在展期內，那隻蜘蛛就站在冬天的草地上，八隻腳撐在剪成圓球的灌木之間，背後是下宮的紅屋頂。' },
    { t:'img', size:'side', src:'img/belvedere/spider.jpg', cap:'巴洛克花園裡突然冒出一隻大蜘蛛，腳邊的圓球灌木看起來像它下的蛋。' },
    { t:'h', id:'tips', text:'美景宮怎麼逛' },
    { t:'p', text:'上宮和下宮是兩棟分開的建築，中間隔著整座花園。花園不用門票，冬天早上七點就開門，可以先在花園裡走一圈，從下宮一路爬坡到上宮，順著雕像從「冥界」走到「奧林帕斯」。我是早上先逛花園、拍外觀，中午過後才進上宮看畫。' },
    { t:'p', text:'上宮每天 9:00 到 18:00 開放，下宮是 10:00 到 18:00，兩棟各有各的門票。克林姆的《吻》和大理石廳都在上宮，如果時間只夠看一棟，就選上宮。' },
    { t:'p', text:'→ 美景宮裡的克林姆：<a href="/stories/belvedere-klimt/">《吻》、《茱蒂絲》與全世界最多的克林姆</a>｜同一趟維也納：<a href="/stories/aufzug-cafe/">Aufzug Café</a>｜<a href="/stories/secession/">分離派會館</a>' }
  ],
  info:[
    ['名稱','美景宮（Schloss Belvedere）：上美景宮、下美景宮、橘園、宮廷馬廄與巴洛克花園'],
    ['地址','上宮 Prinz-Eugen-Straße 27；下宮 Rennweg 6（皆為 1030 Wien）'],
    ['興建','下宮 1712–1717、上宮 1717–1723，建築師希爾德布蘭特；花園由 Dominique Girard 規劃，1718 年完成'],
    ['開放','上宮每天 9:00–18:00、下宮每天 10:00–18:00；花園免費（以官網公告為準）'],
    ['必看','Sala Terrena 的四尊亞特拉斯、大理石廳、花園中軸線、大衛《拿破崙越過阿爾卑斯山》、克林姆《吻》'],
    ['造訪時間','12 月'],
  ],
  faq:[
    ['美景宮是誰蓋的？','是哈布斯堡的名將歐根親王（Prince Eugene of Savoy）委託巴洛克建築師希爾德布蘭特興建的夏宮，下宮 1712 年動工，上宮 1723 年完成。'],
    ['「美景宮」這個名字是什麼意思？','Belvedere 是義大利文的「美麗的景色」。宮殿蓋在維也納城南的斜坡上，上宮比下宮高約 23 公尺，從上宮可以俯瞰花園與整座城市。'],
    ['上美景宮和下美景宮有什麼不同？','下宮是歐根親王實際居住的地方，現在多用來辦特展；上宮是接待貴客與辦宴會的主建築，大理石廳與克林姆的《吻》都在上宮。'],
    ['奧地利國家條約是在美景宮簽的嗎？','是。1955 年 5 月 15 日，四國外長與奧地利外長費格爾在上美景宮的大理石廳簽下《奧地利國家條約》，奧地利重新獨立。'],
    ['美景宮的花園要門票嗎？','不用。花園免費開放，冬季早上 7 點開門；要進上宮、下宮的美術館才需要買票，兩棟各有各的門票。'],
    ['美景宮為什麼是世界最早的公共美術館之一？','1776 年瑪麗亞・特蕾莎與約瑟夫二世決定把皇家畫廊搬進上宮並開放給一般民眾，畫廊在 1777 年啟用。'],
  ],
  sources:[
    ['Belvedere｜History and Architecture（建造年表、Girard 花園、Carlone 與 Fanti、1732 年 Sala Terrena、1777 年畫廊啟用、1896 年斐迪南大公、1903 年現代美術館、1945 年轟炸、1955 年國家條約）','https://www.belvedere.at/en/belvedere/history-and-architecture','查閱日期 2026-11-28'],
    ['Austria-Forum｜Schloss Belvedere（名稱由來、23 公尺高低差、花園雕像從冥界到奧林帕斯、土耳其帳篷、四尊亞特拉斯、費格爾那句話在大理石廳、布魯克納）','https://austria-forum.org/af/AustriaWiki/Schloss_Belvedere','查閱日期 2026-11-28'],
    ['Wikipedia｜Belvedere, Vienna（Carlone 天頂畫以歐根親王為阿波羅、雕像計畫）','https://en.wikipedia.org/wiki/Belvedere,_Vienna','查閱日期 2026-11-28'],
    ['Wikipedia｜Austrian State Treaty（1955 年四國與奧地利簽約、結束占領）','https://en.wikipedia.org/wiki/Austrian_State_Treaty','查閱日期 2026-11-28'],
    ['Wikipedia｜Napoleon Crossing the Alps（五個版本、1803 年米蘭版、1816 年沒收、1834 年進美景宮、騾子與「在烈馬上保持冷靜」）','https://en.wikipedia.org/wiki/Napoleon_Crossing_the_Alps','查閱日期 2026-11-28'],
    ['Belvedere｜Louise Bourgeois: Persistent Antagonism（300 週年特展，2023-09-22～2024-01-28，下美景宮）','https://www.belvedere.at/en/louise-bourgeois-0','查閱日期 2026-11-28'],
    ['El País｜Louise Bourgeois in Vienna: The webs of the ‘spider woman’（2023-10-23，花園裡的蜘蛛）','https://english.elpais.com/culture/2023-10-23/louise-bourgeois-in-vienna-the-webs-of-the-spider-woman.html','查閱日期 2026-11-28'],
    ['Belvedere｜Visit（上宮、下宮開放時間）','https://www.belvedere.at/en/visit','查閱日期 2026-11-28'],
    ['Vienna PASS｜Upper Belvedere（2026-11-01～2027-02-28 花園每天 7:00–17:30）','https://www.viennapass.de/en/sights/upper-belvedere','查閱日期 2026-11-28'],
    ['Visiting Vienna｜Belvedere gardens（花園免費、清晨開門）','https://www.visitingvienna.com/sights/museums/belvedere-sites/baroque-gardens/','查閱日期 2026-11-28'],
    ['Austria.info｜Belvedere Palaces','https://www.austria.info/en/austria-s-beauty-secrets/belvedere/belvedere-palaces','查閱日期 2026-11-20'],
  ]
};
