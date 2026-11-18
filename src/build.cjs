// Out and About 靜態頁產生器
// 用法：node src/build.cjs   （在專案根目錄執行；輸出直接寫到根目錄，圖片在 img/ 不搬動）
// 資料：src/posts-data.js、src/news-data.js、src/series-data.js、src/articles/<id>.js
// 版面 CSS：從 src/templates/*.html 的 <style> 抽出，再疊上 src/common.css（手機版與共用元件）
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'), SRC = __dirname;
const CFG = JSON.parse(fs.readFileSync(path.join(SRC, 'site.config.json'), 'utf8'));
const SITE = CFG.url.replace(/\/$/, '');           // 正式網址（不含結尾斜線）
const abs = p => SITE + p;
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

/* ── 載入資料 ── */
const code = ['const POST_DETAIL = {};', read('posts-data.js'), read('news-data.js'), read('series-data.js'), read('stories-data.js'), read('geo-data.js'),
  ...fs.readdirSync(path.join(SRC, 'articles')).filter(f => f.endsWith('.js')).map(f => read('articles/' + f)),
  ';({ POSTS, NEWS, SERIES, POST_DETAIL, STORIES, CITIES })'].join('\n');
const { POSTS, NEWS, SERIES, POST_DETAIL, STORIES, CITIES } = vm.runInNewContext(code);
const byId = Object.fromEntries(POSTS.map(p => [p.id, p]));
const postsNew = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
// 外電只上架最新 NEWS_MAX 篇；更舊的自動下架（頁面、sitemap、RSS 都拿掉），原始資料仍留在 news-data.js
const NEWS_MAX = 10;
const newsNew = [...NEWS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, NEWS_MAX);
// 網站版上線日：IG 改寫的文章以這天當作網站版的修改日期（除非文章自己有 updated）
const WEB_LAUNCH = CFG.webLaunch || '2026-11-17';
const TOP7 = [...POSTS].filter(p => p.photo !== false).sort((a, b) => b.likes - a.likes).slice(0, 7);

const CATS = {
  ARCHITECTURE: { zh: '建築', d: '從高第的石頭森林到北歐的當代建築，看人怎麼用空間說故事。' },
  ART:          { zh: '藝術', d: '美術館、雕塑與畫作，走進作品誕生的地方。' },
  HISTORY:      { zh: '歷史', d: '古希臘劇場、羅馬廢墟、神社古寺與城市的傷疤，每個地方都有它的過去式。' },
  NATURE:       { zh: '自然', d: '火山、峽灣、雪地與溪流，把自己交給風景的時刻。' },
  FOOD:         { zh: '美食', d: '從早餐店到海底餐廳，用味道記住一座城市。' },
  GUIDE:        { zh: '指南', d: '一次整理好的行程與必訪清單。' }
};
const REGION_ORDER = ['Japan', 'Taiwan', 'Italy', 'Vatican', 'Spain', 'France', 'Portugal', 'Norway', 'Denmark'];
const REGION_ZH = { Japan: '日本', Taiwan: '台灣', Italy: '義大利', Vatican: '梵蒂岡', Spain: '西班牙', France: '法國', Portugal: '葡萄牙', Norway: '挪威', Denmark: '丹麥' };
const AREA_EN = { '青森': 'AOMORI', '岩手': 'IWATE', '宮城': 'MIYAGI', '山形': 'YAMAGATA', '愛知': 'AICHI', '東京': 'TOKYO', '靜岡': 'SHIZUOKA', '屏東': 'PINGTUNG' };
const areaEn = p => AREA_EN[p.area] || p.area.toUpperCase();
const regions = REGION_ORDER.filter(r => POSTS.some(p => p.region === r));

/* ── 小工具 ── */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '');
// 避免段落最後一行只剩一個字：段尾最後 3 個中文字（含標點）綁在一起不斷行
const noOrphan = h => h.replace(/([　-鿿＀-￯]{3})(<\/(?:p|dd|dt|figcaption|li|h2|h3)>)/g, '<span class="nw">$1</span>$2');
const iso = d => d.replace(/\./g, '-');
const fixLinks = h => h.replace(/post\.html#([\w-]+)/g, '/stories/$1/').replace(/news\.html#([\w-]+)/g, '/news/$1/');
const cut = (s, n) => { s = strip(s); if (s.length <= n) return s; const t = s.slice(0, n); const i = Math.max(t.lastIndexOf('。'), t.lastIndexOf('；')); return i > n * 0.5 ? t.slice(0, i + 1) : t.slice(0, n - 1) + '…'; };
const url = { post: id => `/stories/${id}/`, news: id => `/news/${id}/`, cat: k => `/category/${k.toLowerCase()}/`, series: id => `/series/${id}/`, dest: r => `/destinations/${r.toLowerCase()}/` };
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/* 圖片尺寸（讀 JPEG 檔頭），給 width/height 與 srcset 用 */
const dimCache = {};
function dims(rel) {
  if (rel in dimCache) return dimCache[rel];
  let out = null;
  try {
    const b = fs.readFileSync(path.join(ROOT, rel)); let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xFF) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) { out = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; break; }
      i += 2 + b.readUInt16BE(i + 2);
    }
  } catch (e) {}
  return dimCache[rel] = out;
}
const missing = [];
function img(src, alt, { lazy = true, sizes = '100vw', cls = '', small = false } = {}) {
  const rel = src.replace(/^\//, ''), d = dims(rel), mrel = rel.replace(/\.[^.]+$/, '.m.jpg'), m = dims(mrel), srel = rel.replace(/\.[^.]+$/, '.s.jpg'), sm = small ? dims(srel) : null;
  if (!d) missing.push(rel);
  const parts = [sm && d && sm.w < d.w && (!m || sm.w < m.w) ? `/${srel} ${sm.w}w` : '', d && m && m.w < d.w ? `/${mrel} ${m.w}w` : '', d ? `/${rel} ${d.w}w` : ''].filter(Boolean);   // small＝另加 600px 縮圖（Photo Journal 瀑布流用）
  const srcset = parts.length > 1 ? ` srcset="${parts.join(', ')}" sizes="${sizes}"` : '';
  return `<img src="/${srcset ? mrel : rel}"${srcset} alt="${esc(alt || '')}"${d ? ` width="${d.w}" height="${d.h}"` : ''}${lazy ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async"${cls ? ` class="${cls}"` : ''}>`;
}
const CARD_SIZES = '(max-width:560px) 100vw, (max-width:1000px) 50vw, 380px';
const thumb = (p, lazy = true) => p.photo === false
  ? `<div class="ph"><span>${p.region.toUpperCase()} · ${p.area}</span><b>${p.zh}</b><i>照片整理中</i></div>`
  : img(`img/${p.id}.jpg`, p.zh, { lazy, sizes: CARD_SIZES });
const ogImg = p => abs(p && p.photo !== false ? `/img/${p.id}.jpg` : `/img/${TOP7[0].id}.jpg`);

/* ── 共用版型 ── */
const css = {};
for (const t of ['home', 'post', 'news', 'category']) {
  css[t] = read(`templates/${t}.html`).match(/<style>([\s\S]*?)<\/style>/)[1].trim();
  fs.writeFileSync(path.join(ROOT, 'assets', `${t}.css`), css[t] + '\n');
}
fs.copyFileSync(path.join(SRC, 'common.css'), path.join(ROOT, 'assets', 'common.css'));
fs.copyFileSync(path.join(SRC, 'site.js'), path.join(ROOT, 'assets', 'site.js'));
const ver = Date.now().toString(36);

const navLinks = on => `<a href="/#latest-news"${on === 'NEWS' ? ' class="on" aria-current="page"' : ''}>NEWS</a><a href="/destinations/"${on === 'COUNTRIES' ? ' class="on" aria-current="page"' : ''}>COUNTRIES</a>` +
  Object.keys(CATS).map(k => `<a href="${url.cat(k)}"${on === k ? ' class="on" aria-current="page"' : ''}>${k}</a>`).join('');

const PERSON = { '@type': 'Person', '@id': abs('/#nomo'), name: 'Nomo', url: abs('/about/'), sameAs: ['https://www.instagram.com/nomowho/'], description: '旅遊內容創作者，經營 Instagram @nomowho「我出去一下就回來」，寫建築、藝術、歷史與自然。' };
const ORG = { '@type': 'Organization', '@id': abs('/#org'), name: 'Out and About', alternateName: '我出去一下就回來', url: abs('/'), logo: { '@type': 'ImageObject', url: abs('/assets/logo.png') }, sameAs: ['https://www.instagram.com/nomowho/'] };
const crumbLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });
const listLd = (name, list) => ({ '@type': 'ItemList', name, numberOfItems: list.length, itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(x.u), name: x.n })) });

function page({ file, title, desc, canonical, type = 'website', image, style, nav = '', main, ld = [], bodyCls = '', extraHead = '', progress = false, footNote = 'Text &amp; photography by Nomo' }) {
  const html = `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="Nomo">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${abs(canonical)}">
<link rel="alternate" hreflang="zh-Hant-TW" href="${abs(canonical)}">
<link rel="alternate" hreflang="x-default" href="${abs(canonical)}">
<link rel="alternate" type="application/rss+xml" title="Out and About" href="${abs('/feed.xml')}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Out and About｜我出去一下就回來">
<meta property="og:locale" content="zh_TW">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(canonical)}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/logo.png">
${extraHead}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,700&family=Montserrat:wght@300;500;700;800&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+JP:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/${style}.css?v=${ver}">
<link rel="stylesheet" href="/assets/common.css?v=${ver}">
${ld.map(x => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="${bodyCls}">
<a class="skip" href="#main">跳到主要內容</a>
<header class="head" id="head">
  <div class="bar">
    <div class="tools"><button type="button" id="menuBtn" aria-label="開啟選單" aria-expanded="false" aria-controls="drawer"><i class="burger" aria-hidden="true"></i><span>Menu</span></button></div>
    <a class="logo" href="/" aria-label="Out and About 首頁"><b>Out and About</b><small>我出去一下就回來</small></a>
    <div class="tools r">${progress ? `<button type="button" class="share" id="shareBtn" aria-label="分享這篇文章" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14.5V3.5M7.75 7.5 12 3.25l4.25 4.25"/><path d="M8.5 10.5H6v10h12v-10h-2.5"/></svg><span>Share</span></button><div class="sharemenu" id="shareMenu" hidden><button type="button" data-share="copy">複製連結</button><a data-share="line" target="_blank" rel="noopener">LINE</a><a data-share="fb" target="_blank" rel="noopener">Facebook</a><a data-share="x" target="_blank" rel="noopener">X</a></div>` : ""}<a class="en ig" href="https://www.instagram.com/nomowho/" rel="me noopener">Instagram</a></div>
  </div>
  <nav class="nav" aria-label="分類">${navLinks(nav)}</nav>
  ${progress ? '<div class="progress" id="progress"></div>' : ''}
</header>
<div class="drawer" id="drawer" hidden>
  <div class="drawer-in">
    <button type="button" class="drawer-x" id="menuClose" aria-label="關閉選單">✕</button>
    <p class="drawer-h">CATEGORY</p>
    <ul><li><a href="/#latest-news"><b>NEWS</b><span>世界旅遊新訊</span></a></li>
      ${Object.entries(CATS).map(([k, v]) => `<li><a href="${url.cat(k)}"><b>${k}</b><span>${v.zh}</span></a></li>`).join('')}</ul>
    <p class="drawer-h">SERIES</p>
    <ul class="sm">${SERIES.map(s => `<li><a href="${url.series(s.id)}">${s.t}</a></li>`).join('')}</ul>
    <p class="drawer-h"><a href="/journal/">PHOTO JOURNAL</a></p>
    <p class="drawer-h"><a href="/destinations/">COUNTRIES</a></p>
    <ul class="sm two">${regions.map(r => `<li><a href="${url.dest(r)}">${REGION_ZH[r]}</a></li>`).join('')}</ul>
    <p class="drawer-foot"><a href="/about/">關於 Out and About</a><a href="https://www.instagram.com/nomowho/" rel="me noopener">Instagram @nomowho</a></p>
  </div>
</div>
<main id="main">${noOrphan(fixLinks(main))}</main>
<footer>
  <a class="logo" href="/"><b>Out and About</b><small>我出去一下就回來</small></a>
  <nav aria-label="頁尾"><a href="/about/">ABOUT</a>${navLinks('')}<a href="https://www.instagram.com/nomowho/" rel="me noopener">INSTAGRAM</a></nav>
  <p>© 2026 Nomo · ${footNote}</p>
</footer>
<script src="/assets/site.js?v=${ver}" defer></script>
${CFG.cfBeacon ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${CFG.cfBeacon}"}'></script>` : ''}
</body>
</html>
`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return html;
}

/* ── 卡片 ── */
const postCard = (p, { extra = '', place = true, hidden = false, cls = '', cover = false } = {}) => `
  <a class="card${cls ? ' ' + cls : ''}"${hidden ? ' hidden' : ''} href="${url.post(p.id)}">
    <figure>${extra}${cover && POST_DETAIL[p.id] && POST_DETAIL[p.id].cover ? img(POST_DETAIL[p.id].cover, p.zh, { sizes: '(max-width:1000px) 100vw, 560px' }) : thumb(p)}</figure>
    <div class="meta"><span class="cat">${p.cat}</span><time datetime="${iso(p.date)}">${p.date}</time></div>
    <h3>${p.title}</h3>${place ? `<div class="place">${p.zh}，${p.area}</div>` : ''}
  </a>`;
const newsCard = (n, isNew) => `
  <a class="card tcard" href="${url.news(n.id)}">
    <div class="meta"><span class="cat">NEWS · ${n.region}</span><time datetime="${iso(n.date)}">${n.date}</time>${isNew ? '<span class="new">NEW</span>' : ''}</div>
    <h3>${n.title}</h3>
    <div class="src">${n.place}｜編譯自 ${n.src}</div>
  </a>`;

const sitemap = [];   // { loc, lastmod, images[] }

/* ── 文章頁 ── */
/* 直式靠邊圖（side）要有足夠的文字在旁邊繞排，否則桌機會留一大塊空白：
   後面文字不夠 → 往上移到前一段文字的開頭；前後都不夠 → 改成置中直式圖（tall） */
const SIDE_MIN = 200;
const plainLen = b => b.t === 'p' ? strip(b.text).length : 0;
// 正文結尾落款「我出去一下就回來」：放在最後一段正文之後；文末的「→ 延伸閱讀」連結排在落款下方（外電頁不使用）
// 落款連到關於頁：每篇文章多一條指向作者介紹的內部連結（E-E-A-T）
const SIGNOFF = '<p class="signoff"><a href="/about/" aria-label="我出去一下就回來：關於 Out and About 與作者 Nomo"><span class="zh">我出去一下就回來</span><span class="en" lang="en">Out and About</span></a></p>';
function withSignoff(htmls) {
  let i = htmls.length;
  while (i > 0 && /^<p>→/.test(htmls[i - 1])) i--;
  return [...htmls.slice(0, i), SIGNOFF, ...htmls.slice(i)].join('');
}

function layoutSides(body) {
  const out = body.map(b => ({ ...b }));
  for (let i = 0; i < out.length; i++) {
    const b = out[i];
    if (b.t !== 'img' || b.size !== 'side') continue;
    let after = 0; for (let j = i + 1; j < out.length && out[j].t === 'p'; j++) after += plainLen(out[j]);
    if (after >= SIDE_MIN) continue;
    let k = i - 1, before = 0; while (k >= 0 && out[k].t === 'p') { before += plainLen(out[k]); k--; }
    if (before + after >= SIDE_MIN && k + 1 < i) {
      out.splice(i, 1); out.splice(k + 1, 0, b);           // 移到這段文字最前面，讓文字在旁邊繞排
    } else {
      b.size = 'tall';
    }
  }
  return out;
}
function block(b) {
  if (b.t === 'p') return `<p>${b.text}</p>`;
  if (b.t === 'h') return `<h2 id="${b.id}">${b.text}</h2>`;
  if (b.t === 'route') return `<ol class="route">${b.items.map(([n, d]) => `<li><b>${n}</b><span>${d}</span></li>`).join('')}</ol>`;
  if (b.t === 'quote') return `<blockquote><p lang="ja">${b.text}</p>${b.note ? `<cite>${b.note}</cite>` : ''}</blockquote>`;
  if (b.t === 'img') {
    const size = b.size || 'wide';
    const sizes = size === 'full' ? '100vw' : (size === 'side' || size === 'tall') ? '(max-width:900px) 100vw, 440px' : '(max-width:1000px) 100vw, 980px';
    return `<figure class="${size}">${img(b.src, b.cap, { sizes })}${b.cap ? `<figcaption>${b.cap}</figcaption>` : ''}</figure>`;
  }
  if (b.t === 'pair') {
    const caps = (b.cap || '').split(/右：/);
    const alts = caps.length === 2 ? [caps[0].replace(/^左：/, '').replace(/[。\s]+$/, ''), caps[1].replace(/[。\s]+$/, '')] : [b.cap || '', b.cap || ''];
    // imgs 裡的某一格可以是陣列：那一格改成上下兩張疊放
    const cell = (s, i) => Array.isArray(s)
      ? `<div class="stack">${s.map(x => img(x, alts[i], { sizes: '(max-width:700px) 50vw, 490px' })).join('')}</div>`
      : img(s, alts[i], { sizes: '(max-width:700px) 50vw, 490px' });
    return `<figure class="pair"><div class="two">${b.imgs.map(cell).join('')}</div>${b.cap ? `<figcaption>${b.cap}</figcaption>` : ''}</figure>`;
  }
  return '';
}
// 景點實體：文章有 place 欄位時補上別名、官網、座標與 sameAs（維基數據等），讓搜尋引擎對得上是哪一個地點
function placeLd(p, d) {
  const pl = d.place || {};
  const o = { '@type': 'TouristAttraction', name: p.zh };
  if (pl.alt) o.alternateName = pl.alt;
  if (pl.url) o.url = pl.url;
  if (pl.sameAs) o.sameAs = pl.sameAs;
  o.address = Object.assign({ '@type': 'PostalAddress', addressRegion: p.area, addressCountry: p.region }, pl.address || {});
  if (pl.geo) o.geo = { '@type': 'GeoCoordinates', latitude: pl.geo[0], longitude: pl.geo[1] };
  return o;
}
const authorBox = hasSrc => `<aside class="author" aria-label="關於作者"><b>文・攝影｜Nomo</b><p>旅遊內容創作者，經營 Instagram @nomowho「我出去一下就回來」。文章由親自走訪的紀錄改寫${hasSrc ? '，年代、數字與開放資訊的出處列在上方「資料來源」' : ''}。</p><a href="/about/">關於 Out and About ›</a></aside>`;
const modOf = (p, d) => d.updated || (iso(p.date) > WEB_LAUNCH ? iso(p.date) : WEB_LAUNCH);

for (const p of POSTS) {
  const d = POST_DETAIL[p.id];
  if (!d) { console.warn('no article for', p.id); continue; }
  const title = d.seoTitle || p.title, desc = cut(d.dek, 155);
  const cover = d.cover || null;
  const images = [cover, ...d.body.flatMap(b => b.src ? [b.src] : (b.imgs || []).flat())].filter(Boolean);
  const related = [...POSTS.filter(x => x.id !== p.id && x.region === p.region && x.area === p.area),
    ...POSTS.filter(x => x.id !== p.id && x.region === p.region && x.area !== p.area),
    ...POSTS.filter(x => x.id !== p.id && x.region !== p.region && x.cat === p.cat)].slice(0, 3);
  const head = `
      <nav class="crumb" aria-label="位置"><a href="/">TOP</a><i>›</i><a href="${url.cat(p.cat)}">${p.cat}</a><i>›</i><a href="${url.dest(p.region)}">${REGION_ZH[p.region] || p.region}</a></nav>
      <div class="meta"><a href="${url.cat(p.cat)}">${p.cat}</a><span>· ${areaEn(p)}</span><time datetime="${iso(p.date)}">${p.date}</time></div>
      <h1>${title}</h1>
      <p class="dek">${d.dek}</p>
      <div class="by"><span>文・攝影｜<b>Nomo</b></span>${d.visit ? `<span>造訪｜${d.visit}</span>` : ''}<span>${d.updated ? '更新' : '網站版'}｜<time datetime="${modOf(p, d)}">${modOf(p, d).replace(/-/g, '.')}</time></span><span>地點｜${p.zh}，${p.area}</span></div>`;
  const split = d.coverLayout === 'split';
  const top = !cover
    ? `<header class="ahead noimg">${head}</header>`
    : split
      ? `<section class="split"><header class="ahead">${head}</header><figure>${img(cover, d.coverCap || p.zh, { lazy: false, sizes: '(max-width:900px) 100vw, 44vw' })}${d.coverCap ? `<figcaption>${d.coverCap}</figcaption>` : ''}</figure></section>`
      : `<div class="cover">${img(cover, d.coverCap || p.zh, { lazy: false, sizes: '100vw' })}</div>${d.coverCap ? `<p class="covercap">${d.coverCap}</p>` : ''}<header class="ahead">${head}</header>`;
  const heads = d.body.filter(b => b.t === 'h');
  const main = `<article>${top}
      <nav class="toc" aria-label="目次"><div class="in"><h2>CONTENTS 目次</h2><ol>
        ${heads.map(b => `<li><a href="#${b.id}">${b.text}</a></li>`).join('')}
        ${d.info ? '<li><a href="#info">旅行資訊</a></li>' : ''}${d.faq ? '<li><a href="#qa">常見問題</a></li>' : ''}${d.sources ? '<li><a href="#sources">資料來源</a></li>' : ''}
      </ol></div></nav>
      <div class="body">${withSignoff(layoutSides(d.body).map(block))}</div>
      ${d.info ? `<section class="info" id="info"><div class="in"><h2><span class="en">Travel Info</span><span>旅行資訊</span></h2><dl>${d.info.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><p class="note">開放時間與費用可能調整，出發前請以官方公告為準。</p></div></section>` : ''}
      ${d.faq ? `<section class="qa" id="qa"><h2><span class="en">Q&amp;A</span><span>常見問題</span></h2><dl>${d.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl></section>` : ''}
      ${d.sources ? `<section class="refs" id="sources"><h2><span class="en">Sources</span><span>資料來源</span></h2><ol>${d.sources.map(([t, h, note]) => `<li><a href="${h}" target="_blank" rel="noopener">${t}</a>${note ? `<span>${note}</span>` : ''}</li>`).join('')}</ol></section>` : ''}
      ${authorBox(!!d.sources)}
      <aside class="orig"><div class="in"><p><b>ORIGINALLY ON INSTAGRAM</b>這篇最早以圖卡形式發在 @nomowho，網站版補上了交通、時間與常見問題。</p><a href="${p.ig ? `https://www.instagram.com/nomowho/p/${p.ig}/` : 'https://www.instagram.com/nomowho/'}" target="_blank" rel="noopener">看 IG 原貼文</a></div></aside>
    </article>
    ${related.length ? `<section class="more"><div class="box">
      <div class="sh"><h2>More Stories</h2><span>接著讀</span></div>
      <div class="grid">${related.map(x => postCard(x, { place: false })).join('')}</div>
    </div></section>` : ''}`;
  const u = url.post(p.id);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': abs(u) + '#article', headline: cut(title, 110), name: title, description: desc,
      image: images.length ? images.slice(0, 6).map(s => abs('/' + s)) : [ogImg(p)], inLanguage: 'zh-Hant-TW',
      datePublished: iso(p.date), dateModified: modOf(p, d), articleSection: `${p.cat} ${CATS[p.cat] ? CATS[p.cat].zh : ''}`.trim(),
      keywords: [p.zh, p.area, REGION_ZH[p.region] || p.region, CATS[p.cat] ? CATS[p.cat].zh : p.cat, '旅遊'].join(', '),
      mainEntityOfPage: { '@type': 'WebPage', '@id': abs(u) }, isPartOf: { '@id': abs('/#website') },
      author: PERSON, publisher: ORG,
      about: placeLd(p, d) },
    crumbLd([['Out and About', '/'], [p.cat, url.cat(p.cat)], [title, u]])
  ];
  if (d.faq) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) });
  page({ file: `stories/${p.id}/index.html`, title: `${title}｜Out and About`, desc, canonical: u, type: 'article', image: cover ? abs('/' + cover) : ogImg(p), style: 'post', nav: p.cat, main, ld, progress: true,
    extraHead: `<meta property="article:published_time" content="${iso(p.date)}">\n${true ? `<meta property="article:modified_time" content="${modOf(p, d)}">\n` : ''}<meta property="article:author" content="Nomo">\n<meta property="article:section" content="${p.cat}">\n` });
  sitemap.push({ loc: u, lastmod: modOf(p, d), images: images.map(s => abs('/' + s)) });
}

/* ── 外電頁 ── */
newsNew.forEach(n => {
  const i = newsNew.indexOf(n);
  const others = [...newsNew.slice(i + 1), ...newsNew.slice(0, i)].slice(0, 3);
  const picks = TOP7.slice(0, 3);
  const u = url.news(n.id), desc = cut(n.dek || n.title, 155);
  const main = `<article>
    <div class="box"><nav class="crumb" aria-label="位置"><a href="/">TOP</a>›<a href="/#latest-news">NEWS</a>›<span>${n.region}</span></nav></div>
    <header class="ahead">
      <div class="meta"><span>NEWS · ${n.region}</span><time datetime="${iso(n.date)}">${n.date}</time></div>
      <h1>${n.title}</h1>
      ${n.dek ? `<p class="dek">${n.dek}</p>` : ''}
      <p class="by">編譯｜<b>Nomo</b>　${n.place}　資料來源 ${n.src}</p>
    </header>
    <div class="wrap">
      <div class="body">
        ${n.body.map(s => `${s.h ? `<h2>${s.h}</h2>` : ''}${s.p.map(t => `<p>${t}</p>`).join('')}`).join('')}
        ${n.faq && n.faq.length ? `<section class="qa" aria-labelledby="qa-h"><h2 id="qa-h"><span class="en">Q&amp;A</span><span>常見問題</span></h2><dl>${n.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl></section>` : ''}
        ${n.also ? `<div class="also"><b>ALSO</b>${n.also}</div>` : ''}
        <div class="source">
          本文由 Nomo 依下列報導編譯改寫，內容與數據以原文為準。Nomo 是旅遊內容創作者，經營 Instagram @nomowho「我出去一下就回來」。<br>
          原文：<b>${n.src}</b>〈${n.srcTitle}〉${n.srcAuthor ? `，${n.srcAuthor}` : ''}，${n.date}　<a href="${n.url}" target="_blank" rel="noopener nofollow">原文出處</a>
        </div>
      </div>
      ${n.facts ? `<aside class="side"><div class="facts"><h3>Fact Sheet<small>重點速查</small></h3><dl>${n.facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div><p class="place">● ${n.place}</p></aside>` : ''}
    </div></article>
    <section class="more"><div class="box">
      <div class="sh"><h2>More News</h2><span>更多世界旅遊新訊</span><a href="/#latest-news">All News</a></div>
      <div class="grid">${others.map(x => newsCard(x)).join('')}</div>
    </div></section>
    <section class="more plain"><div class="box">
      <div class="sh"><h2>PICK UP</h2><span>編輯精選・我出去一下</span></div>
      <div class="grid">${picks.map(x => postCard(x, { place: false })).join('')}</div>
    </div></section>`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'NewsArticle', '@id': abs(u) + '#article', headline: cut(n.title, 110), description: desc, inLanguage: 'zh-Hant-TW',
      datePublished: iso(n.date), dateModified: iso(n.date), image: [ogImg(null)], mainEntityOfPage: { '@type': 'WebPage', '@id': abs(u) },
      author: PERSON, publisher: ORG, contentLocation: { '@type': 'Place', name: n.place },
      isBasedOn: { '@type': 'NewsArticle', headline: n.srcTitle, url: n.url, publisher: { '@type': 'Organization', name: n.src } } },
    crumbLd([['Out and About', '/'], ['NEWS', '/#latest-news'], [n.title, u]])
  ];
  if (n.faq && n.faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: n.faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) });
  page({ file: `news/${n.id}/index.html`, title: `${n.title}｜Out and About`, desc, canonical: u, type: 'article', image: ogImg(null), style: 'news', nav: 'NEWS', main, ld, progress: true,
    footNote: '世界旅遊新訊編譯自國際媒體，著作權屬原刊登媒體', extraHead: `<meta property="article:published_time" content="${iso(n.date)}">\n` });
  sitemap.push({ loc: u, lastmod: iso(n.date), images: [] });
});

/* ── 列表頁（分類／系列／目的地） ── */
function listPage({ file, u, label, h1, desc, posts, lead, nav, crumb, groups, othersTitle, othersZh, others }) {
  const grid = list => `<div class="grid">${list.map(p => postCard(p)).join('')}</div>`;
  const main = `
    <section class="top">${lead ? `<div class="bg" style="background-image:url(/img/${lead.id}.m.jpg)"></div>` : ''}<div class="box">
      <nav class="crumb" aria-label="位置"><a href="/">TOP</a>›<span>${crumb}</span>›<span>${h1}</span></nav>
      <div class="grid2">
        <div><div class="label">${label}</div><h1>${h1}</h1><p>${desc}</p><div class="count">${posts.length} ${posts.length === 1 ? 'STORY' : 'STORIES'}</div></div>
        ${lead ? `<a href="${url.post(lead.id)}" aria-label="${esc(lead.title)}"><figure>${img(`img/${lead.id}.jpg`, lead.zh, { lazy: false, sizes: '(max-width:900px) 100vw, 600px' })}</figure></a>` : ''}
      </div>
    </div></section>
    <section class="list box">${groups ? `<nav class="areas" id="areas" aria-label="依地區篩選"><a href="#areas" data-area="" class="on" aria-current="true">全部<small>${posts.length}</small></a>${groups.map(([g, list]) => `<a href="#${encodeURIComponent(g)}" data-area="${esc(g)}">${g}<small>${list.length}</small></a>`).join('')}</nav>` + groups.map(([g, list]) => `<div class="grpsec" data-area="${esc(g)}"><h2 class="grp" id="${esc(g)}">${g}<small>${list.length}</small></h2>${grid(list)}</div>`).join('') : grid(posts)}</section>
    <section class="others box">
      <div class="sh"><h2>${othersTitle}</h2><span>${othersZh}</span></div>
      <div class="rail">${others.map(o => `<a class="s" href="${o.u}"><figure>${o.img ? img(o.img, o.t, { sizes: '(max-width:900px) 50vw, 270px' }) : ''}</figure><div><h3>${o.t}</h3><span>${o.n} ${o.n === 1 ? 'STORY' : 'STORIES'} ›</span></div></a>`).join('')}</div>
    </section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': abs(u), name: h1, description: desc, inLanguage: 'zh-Hant-TW', isPartOf: { '@id': abs('/#website') },
    mainEntity: listLd(h1, posts.map(p => ({ u: url.post(p.id), n: (POST_DETAIL[p.id] || {}).seoTitle || p.title }))) },
    crumbLd([['Out and About', '/'], [h1, u]])];
  page({ file, title: `${h1}｜${posts.length} 篇旅行文章｜Out and About`, desc: `${desc}共 ${posts.length} 篇，包括${posts.slice(0, 8).map(p => p.zh).join('、')}等，每篇附旅行資訊與常見問題。`.slice(0, 155), canonical: u, image: ogImg(lead), style: 'category', nav, main, ld });
  sitemap.push({ loc: u, lastmod: posts.length ? iso([...posts].sort((a, b) => b.date.localeCompare(a.date))[0].date) : BUILD_DATE, images: [] });
}
const leadOf = list => [...list].filter(p => p.photo !== false).sort((a, b) => b.likes - a.likes)[0];
const cardImg = p => p ? `img/${p.id}.jpg` : null;
for (const [k, c] of Object.entries(CATS)) {
  const posts = postsNew.filter(p => p.cat === k);
  listPage({ file: `category/${k.toLowerCase()}/index.html`, u: url.cat(k), label: 'CATEGORY　分類', h1: `${k} ${c.zh}`, desc: c.d, posts, lead: leadOf(posts), nav: k, crumb: 'CATEGORY',
    othersTitle: 'Other Categories', othersZh: '其他分類',
    others: Object.entries(CATS).filter(([x]) => x !== k).map(([x, v]) => { const l = POSTS.filter(p => p.cat === x); return { u: url.cat(x), t: `${x}　${v.zh}`, n: l.length, img: cardImg(leadOf(l)) }; }) });
}
for (const s of SERIES) {
  const posts = s.ids.map(i => byId[i]).filter(Boolean);
  listPage({ file: `series/${s.id}/index.html`, u: url.series(s.id), label: 'SERIES　系列專題', h1: s.t, desc: s.d, posts, lead: byId[s.img] || leadOf(posts), nav: '', crumb: 'SERIES',
    othersTitle: 'More Series', othersZh: '其他系列專題',
    others: SERIES.filter(x => x.id !== s.id).map(x => ({ u: url.series(x.id), t: x.t, n: x.ids.length, img: fs.existsSync(path.join(ROOT, 'img', x.img + '.jpg')) ? `img/${x.img}.jpg` : null })) });
}
for (const r of regions) {
  const posts = postsNew.filter(p => p.region === r);
  const areas = [...new Set(posts.map(p => p.area))];
  listPage({ file: `destinations/${r.toLowerCase()}/index.html`, u: url.dest(r), label: `COUNTRY　${r.toUpperCase()}`, h1: `${REGION_ZH[r]}旅行`, desc: `在${REGION_ZH[r]}走過的地方：${areas.join('、')}。`, posts, lead: leadOf(posts), nav: 'COUNTRIES', crumb: '<a href="/destinations/">COUNTRIES</a>',
    groups: areas.length > 1 ? areas.map(a => [a, posts.filter(p => p.area === a)]) : null,
    othersTitle: 'Other Countries', othersZh: '其他國家',
    others: regions.filter(x => x !== r).map(x => { const l = POSTS.filter(p => p.region === x); return { u: url.dest(x), t: `${REGION_ZH[x]}`, n: l.length, img: cardImg(leadOf(l)) }; }) });
}

/* ── 國家總覽 /destinations/ ── */
{
  const u = '/destinations/';
  const cards = regions.map(r => {
    const l = postsNew.filter(p => p.region === r), lead = leadOf(l), areas = [...new Set(l.map(p => p.area))];
    return { r, l, lead, areas };
  }).sort((a, b) => b.l.length - a.l.length);
  const desc = `Nomo 走過的 ${regions.length} 個國家：${cards.map(c => `${REGION_ZH[c.r]}（${c.l.length} 篇）`).join('、')}。依國家找旅行文章。`;
  const main = `
    <section class="top"><div class="box">
      <nav class="crumb" aria-label="位置"><a href="/">TOP</a>›<span>COUNTRIES</span></nav>
      <div class="label">COUNTRIES　國家</div><h1>依國家找旅行</h1><p>${cards.length} 個國家、${POSTS.length} 篇文章。點國家看那裡的所有旅行。</p>
    </div></section>
    <section class="mapwrap box" aria-label="旅行地圖">
      <div class="maphead"><h2>Map</h2><span>旅行地圖</span><p>放大地圖會從國家展開到城市，點圓點看那裡的文章。</p></div>
      <div id="tripmap" class="tripmap" role="region" aria-label="旅行地圖，可放大縮小"></div>
      <noscript><p>這張地圖需要 JavaScript；也可以直接從下方的國家清單進入。</p></noscript>
    </section>
    <script type="application/json" id="mapData">${JSON.stringify({
      countries: regions.map(r => ({ r, zh: REGION_ZH[r], u: url.dest(r), n: POSTS.filter(p => p.region === r).length })),
      cities: CITIES.map(c => ({ zh: c.zh, en: c.en, r: c.region, lat: c.lat, lng: c.lng,
        posts: c.posts.map(id => byId[id]).filter(Boolean).map(p => ({ t: p.zh, s: p.title, u: url.post(p.id), cat: p.cat,
          img: p.photo === false ? '' : (fs.existsSync(path.join(ROOT, 'img', p.id + '.m.jpg')) ? '/img/' + p.id + '.m.jpg' : '/img/' + p.id + '.jpg') })) }))
    }).replace(/</g, '\\u003c')}</script>
    <section class="list box"><div class="grid countries">${cards.map(c => `
      <div class="card country"><a class="cv" href="${url.dest(c.r)}">
        <figure>${c.lead ? img(`img/${c.lead.id}.jpg`, REGION_ZH[c.r], { sizes: CARD_SIZES }) : `<div class="ph"><span>${c.r.toUpperCase()}</span><b>${REGION_ZH[c.r]}</b><i>照片整理中</i></div>`}</figure>
        <div class="meta"><span class="cat">${c.r.toUpperCase()}</span><span>${c.l.length} ${c.l.length === 1 ? 'STORY' : 'STORIES'}</span></div>
        <h3>${REGION_ZH[c.r]}</h3></a><div class="place areas-in">${c.areas.map(a => `<a href="${url.dest(c.r)}${c.areas.length > 1 ? '#' + encodeURIComponent(a) : ''}">${a}</a>`).join('<span aria-hidden="true">・</span>')}</div>
      </div>`).join('')}</div></section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': abs(u), name: '依國家找旅行', description: desc, inLanguage: 'zh-Hant-TW', isPartOf: { '@id': abs('/#website') },
    mainEntity: listLd('國家', cards.map(c => ({ u: url.dest(c.r), n: `${REGION_ZH[c.r]}旅行` }))) }, crumbLd([['Out and About', '/'], ['COUNTRIES', u]])];
  page({ file: 'destinations/index.html', title: `依國家找旅行｜${cards.length} 個國家｜Out and About`, desc, canonical: u, image: ogImg(cards[0].lead), style: 'category', nav: 'COUNTRIES', main, ld,
    extraHead: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">\n<script defer src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>\n<script defer src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js"></script>\n' });
  sitemap.push({ loc: u, lastmod: BUILD_DATE, images: [] });
}

/* ── 已取消的分類：舊網址轉到新分類 ── */
for (const [oldCat, newCat] of [['faith', 'history']]) {
  const to = url.cat(newCat.toUpperCase());
  const out = path.join(ROOT, 'category', oldCat, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `<!DOCTYPE html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><title>已移到 ${newCat.toUpperCase()}｜Out and About</title><link rel="canonical" href="${abs(to)}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p><a href="${to}">這個分類已併入 ${newCat.toUpperCase()}，請點這裡</a></p></body></html>\n`);
}

/* ── 首頁 ── */
{
  const groups = {};
  POSTS.forEach(p => { (groups[p.region] ??= {}); groups[p.region][p.area] = (groups[p.region][p.area] || 0) + 1; });
  const tohoku = ['oirase', 'hoshino-oirase', 'kaneja', 'geibikei'].map(i => byId[i]).filter(Boolean);
  const FIRST = 9;
  const main = `
<h1 class="vh">Out and About｜我出去一下就回來：Nomo 的旅行雜誌</h1>
<section class="hero" aria-label="精選文章" aria-roledescription="carousel">
  <div class="track" id="track">${TOP7.map((p, i) => `
    <a class="slide" href="${url.post(p.id)}" data-i="${i}">
      <figure>${img(`img/${p.id}.jpg`, p.zh, { lazy: i > 1, sizes: '(max-width:700px) 84vw, 480px' })}</figure>
      <div class="cap"><div class="meta"><span class="cat">${p.cat}</span><time datetime="${iso(p.date)}">${p.date}</time></div><h2>${p.title}</h2></div>
    </a>`).join('')}</div>
  <button class="arr l" id="prev" type="button" aria-label="上一則"><svg viewBox="0 0 34 14" aria-hidden="true"><path d="M34 7H1M7 1 1 7l6 6"/></svg></button>
  <button class="arr r" id="next" type="button" aria-label="下一則"><svg viewBox="0 0 34 14" aria-hidden="true"><path d="M0 7h33M27 1l6 6-6 6"/></svg></button>
</section>
<div class="pager"><div class="in"><span class="count" id="count">1 / ${TOP7.length}</span></div></div>

<section class="pick" id="latest-news">
  <div class="band">
    <div class="sh"><h2>Latest</h2><span>世界旅遊新訊</span><span class="note">編譯自國際旅遊媒體</span></div>
    <div class="grid" id="news">${newsNew.slice(0, 6).map((n, i) => newsCard(n, i === 0)).join('')}</div>
  </div>
  <aside class="side">
    <div class="dbl stories journal-entry" id="journal">
      <h3>Photo Journal<small>攝影日誌</small></h3>
      <ul class="rings one"><li><a class="ring" href="/journal/" aria-label="打開 Photo Journal 攝影日誌，看全部旅行照片">
          <span class="av"><img src="/img/story-avatar.jpg" alt="Nomo" width="400" height="400" decoding="async"></span>
        </a></li></ul>
      <p class="bio"><span lang="en">🪐 Drifting through the world, framing the moment, exploring beyond.</span>在世界亂走，拍下眼前，無盡探索。</p>
    </div>
    <a class="ig" href="https://www.instagram.com/nomowho/" rel="me noopener">在 Instagram 追蹤 @nomowho</a>
  </aside>
</section>

<section class="latest box" aria-label="編輯精選">
  <div class="sh"><h2>PICK UP</h2><span>編輯精選・我出去一下</span></div>
  <div class="grid" id="picks">${(() => { /* 桌機中間大圖：取最新一篇「文章封面（主圖）是直式」的文章放第一（Nomo 11-18） */ const L = [...postsNew], k = CFG.pickCenter && L.some(p => p.id === CFG.pickCenter) ? L.findIndex(p => p.id === CFG.pickCenter) /* site.config.json 的 pickCenter 可指定中間那篇 */ : L.findIndex(p => { const c = p.photo !== false && POST_DETAIL[p.id] && POST_DETAIL[p.id].cover, d = c && dims(c); return d && d.h > d.w * 1.1; }); if (k > 0) L.unshift(...L.splice(k, 1)); return L; })().map((p, i) => postCard(p, { hidden: i >= FIRST, cls: i === 0 ? 'pk-big' : i < 5 ? 'pk-side' : i < FIRST ? 'dt-more' : '', cover: i === 0 })).join('')}</div>
  <div class="morewrap"><button class="morebtn" id="picksMore" type="button">MORE<small>看更多旅行</small></button></div>
</section>

<section class="region">
  <div class="dash"></div>
  <h2>TOHOKU</h2>
  <p class="sub">東北，冬天去才對</p>
  <div class="row">${tohoku.map(p => postCard(p, { extra: `<span class="vlab">${p.cat[0] + p.cat.slice(1).toLowerCase()}</span>` })).join('')}</div>
  <a class="viewmore" href="${url.series('tohoku-winter')}">View More　›</a>
</section>

<section class="series">
  <div class="box"><div class="sh"><h2>SERIES</h2><span>系列專題</span></div></div>
  <div class="rail">${SERIES.map(s => `
    <a class="s" href="${url.series(s.id)}">
      <figure>${img(`img/${s.img}.jpg`, s.t, { sizes: '(max-width:700px) 72vw, 300px' })}<span class="stk" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="7.5" y="7.5" width="12" height="10" rx="1.6"/><path d="M4.5 14.5V6.1c0-.9.7-1.6 1.6-1.6h10.4"/></svg></span></figure>
      <div class="k">SERIES · ${s.ids.length} ${s.ids.length === 1 ? 'STORY' : 'STORIES'}</div>
      <h3>${s.t}</h3>
      <div class="by">BY NOMO</div>
      ${(() => { const d = s.ids.map(id => byId[id]).filter(Boolean).map(p => p.date).sort().pop(); if (!d) return ''; const [y, m, dd] = d.split('.').map(Number); return `<time datetime="${iso(d)}">${y}年${m}月${dd}日</time>`; })()}
    </a>`).join('')}</div>
</section>

<section class="dest box" id="dest">
  <div class="sh"><h2>Destinations</h2><span>去過的地方</span></div>
  <div class="cols">${regions.map(r => `
    <div class="col"><h3><a href="${url.dest(r)}">${r.toUpperCase()}　${REGION_ZH[r]}</a></h3><ul>
      ${Object.entries(groups[r]).map(([a, n]) => `<li><a href="${url.dest(r)}${Object.keys(groups[r]).length > 1 ? '#' + encodeURIComponent(a) : ''}">${a}</a><span>${n}</span></li>`).join('')}
    </ul></div>`).join('')}</div>
</section>`;
  const desc = 'Out and About（我出去一下就回來）是 Nomo 的旅行雜誌：親自走訪的建築、藝術、歷史、自然與信仰之地，每篇附交通、旅行資訊與常見問題，另有每日世界旅遊新訊。';
  const ld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': abs('/#website'), url: abs('/'), name: 'Out and About', alternateName: ['我出去一下就回來', 'Out and About 旅行雜誌'], description: desc, inLanguage: 'zh-Hant-TW', publisher: { '@id': abs('/#org') }, author: { '@id': abs('/#nomo') } },
    ORG, PERSON,
    Object.assign({ '@id': abs('/#latest') }, listLd('最新旅行文章', postsNew.slice(0, 20).map(p => ({ u: url.post(p.id), n: (POST_DETAIL[p.id] || {}).seoTitle || p.title }))))
  ] }];
  page({ file: 'index.html', title: 'Out and About｜我出去一下就回來・Nomo 的旅行雜誌', desc, canonical: '/', image: ogImg(TOP7[0]), style: 'home', nav: '', main, ld, bodyCls: 'home' });
  sitemap.unshift({ loc: '/', lastmod: BUILD_DATE, images: [] });
}

/* ── 關於／404 ── */
{
  const main = `<article class="about">
    <header class="ahead noimg"><div class="meta"><span>About</span></div><h1>關於我出去一下就回來</h1>
      <p class="motto"><span>走得遠一點，看得深一些。</span><span lang="en">Go Further. Look Closer.</span></p></header>
    <div class="body">
      <p>Out and About，中文叫「我出去一下就回來」，是一份關於旅行、風景與文化的個人誌。</p>
      <p>旅行對我而言，不只是抵達某個地方，更是試著理解一座城市的性格、一棟建築的故事，以及那些藏在日常風景裡的歷史。</p>
      <p>這裡記錄我親自走過的地方，從山海之間的自然景色，到城市裡的建築、藝術、信仰與餐桌。以影像收藏瞬間，以文字延續旅程。</p>
      <p class="pull">一半故事，一半旅行資訊。</p>
      <p>希望這些記錄，不只陪你規劃下一趟旅程，也讓你在出發之前，就對世界多一點好奇。</p>
      <h2 id="who">Who am I？</h2>
      <p>我是 Nomo，住在台灣，喜歡旅行、攝影，也喜歡那些有故事的地方。</p>
      <p>比起走遍多少景點，我更在意一個地方為什麼長成現在的模樣。</p>
      <p>旅行前，我習慣先讀一些歷史；旅行時，用鏡頭記下眼前；回來之後，再把沿途的發現整理成文字。</p>
      <p>有時是建築背後的時代，有時是美術館裡的一幅畫，也可能只是山谷裡一道剛好落下的光。</p>
      <p>Instagram：<a href="https://www.instagram.com/nomowho/" rel="me noopener">@nomowho</a></p>
      <h2 id="what">這裡寫些什麼？</h2>
      <p>這裡的文章從真實旅程出發，結合旅行故事、文化背景與實用資訊。</p>
      <p>關於建築、藝術、歷史、自然與信仰，也關於城市裡的食物和生活。</p>
      <p>除了記錄值得停留的風景，也整理交通、路線、開放時間與旅途中真正需要知道的細節。</p>
      <p>資訊可能隨時間改變，因此會盡可能標示參訪時間、更新內容與資料來源；若發現有誤，也會持續修正。</p>
      <h2 id="policy">編輯原則</h2>
      <p>STORIES 的文章都來自我自己走過的地方，照片除了特別標示的以外都是我拍的；圖說開頭寫「插畫｜」的是插畫，不是現場照片。</p>
      <p>年代、數字、開放時間與票價，會對照官方網站或可靠的資料來源；有查證的文章，出處列在文末的「資料來源」，並標上查閱日期。頁首的「更新」日期，是這篇文章最後一次改動內容的時間。</p>
      <p>NEWS 世界旅遊新訊是編譯自國際媒體的報導，整理過程使用 AI 工具協助，每一篇都標明原始媒體並附上原文連結，著作權屬於原刊登媒體。這個單元只保留最新 10 篇。</p>
      <h2 id="contact">更正與聯絡</h2>
      <p>如果你發現哪裡寫錯了，或開放資訊已經改變，歡迎到 Instagram <a href="https://www.instagram.com/nomowho/" rel="me noopener">@nomowho</a> 私訊告訴我，確認後會更正並更新日期。</p>
      <p class="pull">旅行終究會結束，但好奇心可以一直在路上。</p>
    </div></article>`;
  const desc = 'Out and About（我出去一下就回來）是 Nomo 的旅行、風景與文化個人誌：走得遠一點，看得深一些。親自走過的建築、藝術、歷史、自然與信仰，一半故事，一半旅行資訊。';
  page({ file: 'about/index.html', title: '關於我出去一下就回來｜Out and About', desc, canonical: '/about/', image: ogImg(TOP7[0]), style: 'post', nav: '', main,
    ld: [{ '@context': 'https://schema.org', '@type': 'AboutPage', '@id': abs('/about/'), name: '關於我出去一下就回來', inLanguage: 'zh-Hant-TW', mainEntity: PERSON, isPartOf: { '@id': abs('/#website') } }, crumbLd([['Out and About', '/'], ['關於', '/about/']])] });
  sitemap.push({ loc: '/about/', lastmod: BUILD_DATE, images: [] });

  /* ── Photo Journal /journal/：全站照片瀑布流，點照片進文章 ── */
  {
    const J_MAX = 6;   // 每篇最多取幾張，避免單篇洗版
    // 精選規則（Nomo 11-18）：只放有主題、美、構圖好的照片；資訊型（告示、菜單、地圖、便當特寫）與插畫一律不放 → 名單在 src/journal-exclude.json
    const J_LAYOUT = fs.existsSync(path.join(__dirname, 'journal-layout.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'journal-layout.json'), 'utf8')) : {};
    const J_FEAT = new Set(J_LAYOUT.feature || []), J_NOFEAT = new Set(J_LAYOUT.nofeature || []);
    const J_SKIP = new Set(fs.existsSync(path.join(__dirname, 'journal-exclude.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'journal-exclude.json'), 'utf8')) : []);
    if (process.env.JOURNAL_DUMP) { const all = []; postsNew.filter(p => p.photo !== false && POST_DETAIL[p.id]).forEach(p => { const d = POST_DETAIL[p.id]; if (d.cover) all.push([p.id, d.cover, d.coverCap || '']); d.body.forEach(bk => { if (bk.src) all.push([p.id, bk.src, bk.cap || '']); else if (bk.imgs) bk.imgs.flat().forEach(x => all.push([p.id, x, ''])); }); }); fs.writeFileSync(process.env.JOURNAL_DUMP, JSON.stringify(all.filter(([, src]) => fs.existsSync(path.join(ROOT, src))))); }
    const items = [];
    postsNew.filter(p => p.photo !== false && POST_DETAIL[p.id]).forEach(p => {
      const d = POST_DETAIL[p.id], list = [];
      if (d.cover) list.push([d.cover, d.coverCap || '']);
      d.body.forEach(bk => { if (bk.src) list.push([bk.src, bk.cap || '']); else if (bk.imgs) bk.imgs.flat().forEach(x => list.push([x, ''])); });
      const ok = list.filter(([src, cap]) => fs.existsSync(path.join(ROOT, src)) && !J_SKIP.has(src) && !/^插畫/.test(cap));
      const must = ok.filter(([src]) => J_FEAT.has(src)), rest = ok.filter(([src]) => !J_FEAT.has(src)).slice(0, Math.max(0, J_MAX - must.length));   // 指定滿版的一定收，其餘補到 J_MAX
      ok.filter(x => must.includes(x) || rest.includes(x)).forEach(([src, cap]) => items.push({ p, src, cap }));
    });
    { // 小圖隨機排列（固定種子）、滿版照 feature 順序平均穿插（Nomo 11-18：照片牆不必照地點，滿版固定那 11 張）
      let h = 2166136261; for (const ch of String(J_LAYOUT.seed || 'nomowho')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
      const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1e6) / 1e6; };
      const feats = [...J_FEAT].map(src => items.find(it => it.src === src)).filter(Boolean);
      const others = items.filter(it => !J_FEAT.has(it.src));
      for (let i = others.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [others[i], others[k]] = [others[k], others[i]]; }
      const per = Math.ceil(others.length / Math.max(1, feats.length)); items.length = 0;
      feats.forEach((ft, i) => { items.push(ft, ...others.slice(i * per, (i + 1) * per)); });
      if (!feats.length) items.push(...others);
    }
    const jRegions = regions.filter(r => items.some(it => it.p.region === r));
    const u = '/journal/';
    const strip = t => String(t).replace(/<[^>]+>/g, '');
    const main = `
    <section class="top jtop"><div class="box">
      <nav class="crumb" aria-label="位置"><a href="/">TOP</a>›<span>PHOTO JOURNAL</span></nav>
      <div class="label">PHOTO JOURNAL　攝影日誌</div><h1>在世界亂走，拍下眼前</h1>
    </div></section>
    <section class="list box">
      <nav class="areas jfilter" id="areas" aria-label="依國家篩選"><a href="#areas" data-area="" class="on" aria-current="true">全部<small>${items.length}</small></a>${jRegions.map(r => `<a href="#${r.toLowerCase()}" data-area="${r.toLowerCase()}">${REGION_ZH[r]}<small>${items.filter(it => it.p.region === r).length}</small></a>`).join('')}</nav>
      <div class="journal" id="masonry"><div class="jraw">${items.map(it => `
        <a class="jp" href="${url.post(it.p.id)}" data-area="${it.p.region.toLowerCase()}"${(() => { const d = dims(it.src); return J_FEAT.has(it.src) ? ' data-land="1" data-feat="1"' : ''; })()}><figure>${img(it.src, strip(it.cap) || it.p.zh, { sizes: J_FEAT.has(it.src) ? '(max-width:1060px) 100vw, 1000px' : '(max-width:700px) 50vw, (max-width:1100px) 33vw, 300px', small: !J_FEAT.has(it.src), lazy: it !== items[0] })}</figure><span class="jc"><b>${it.p.zh}</b>${it.p.area}</span></a>`).join('')}
      </div></div>
    </section>`;
    const desc = `Nomo 的旅行攝影日誌：${items.length} 張照片，走過${jRegions.map(r => REGION_ZH[r]).join('、')}，每張都連到背後的旅行故事。`;
    page({ file: 'journal/index.html', title: `Photo Journal 攝影日誌｜${items.length} 張旅行照片｜Out and About`, desc, canonical: u, image: ogImg(postsNew[0]), style: 'category', nav: '', main,
      ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': abs(u), name: 'Photo Journal 攝影日誌', description: desc, inLanguage: 'zh-Hant-TW', isPartOf: { '@id': abs('/#website') }, author: PERSON }] });
    sitemap.push({ loc: u, lastmod: BUILD_DATE, images: items.slice(0, 20).map(it => abs('/' + it.src)) });
  }
  const h404 = page({ file: '404.html', title: '找不到這一頁｜Out and About', desc: '這個網址沒有內容。', canonical: '/404.html', image: ogImg(TOP7[0]), style: 'category', nav: '',
    main: `<div class="notfound"><h1>找不到這一頁</h1><p>可能是網址改了，下面是最新的文章。</p><p><a href="/">回首頁</a></p></div>
    <section class="list box"><div class="grid">${postsNew.slice(0, 6).map(p => postCard(p)).join('')}</div></section>` });
  fs.writeFileSync(path.join(ROOT, '404.html'), h404.replace('content="index, follow', 'content="noindex, follow'));
}

/* ── sitemap / robots / llms / feed ── */
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemap.map(s => `<url><loc>${abs(s.loc)}</loc><lastmod>${s.lastmod}</lastmod>${s.images.slice(0, 20).map(i => `<image:image><image:loc>${xml(i)}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);
const BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Amazonbot', 'CCBot', 'Bytespider', 'meta-externalagent', 'DuckAssistBot'];
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `# Out and About：歡迎搜尋引擎與 AI 助理讀取、引用（請附出處）
User-agent: *
Allow: /

${BOTS.map(b => `User-agent: ${b}\nAllow: /\n`).join('\n')}
Sitemap: ${abs('/sitemap.xml')}
`);
const mdBody = d => d.body.map(b => b.t === 'h' ? `\n## ${strip(b.text)}\n` : b.t === 'p' ? strip(b.text) + '\n' : b.t === 'route' ? b.items.map(([n, t], i) => `${i + 1}. ${strip(n)}：${strip(t)}`).join('\n') + '\n' : b.t === 'quote' ? `> ${strip(b.text)}${b.note ? `（${strip(b.note)}）` : ''}\n` : '').filter(Boolean).join('\n');
fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# Out and About｜我出去一下就回來

> Nomo 的繁體中文旅行雜誌。文章由親自走訪的紀錄改寫，年代、數字與開放資訊對照官方資料查證；每篇附旅行資訊與常見問題。另有每日「世界旅遊新訊」，編譯自國際旅遊媒體並附原文出處。作者：Nomo（Instagram @nomowho）。引用時請標示出處與連結。

完整內文（純文字）：${abs('/llms-full.txt')}

${Object.entries(CATS).map(([k, c]) => { const l = postsNew.filter(p => p.cat === k); return l.length ? `## ${k} ${c.zh}\n\n${l.map(p => `- [${POST_DETAIL[p.id].seoTitle || p.title}](${abs(url.post(p.id))}): ${cut(POST_DETAIL[p.id].dek, 120)}`).join('\n')}\n` : ''; }).join('\n')}
## NEWS 世界旅遊新訊

${newsNew.map(n => `- [${n.title}](${abs(url.news(n.id))}): ${cut(n.dek || '', 120)}`).join('\n')}

## Optional

- [關於 Out and About](${abs('/about/')})
- [Sitemap](${abs('/sitemap.xml')})
- [RSS](${abs('/feed.xml')})
`);
fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), `# Out and About｜我出去一下就回來（完整內文）\n\n作者：Nomo（Instagram @nomowho）　網站：${abs('/')}\n\n` +
  postsNew.map(p => { const d = POST_DETAIL[p.id]; return `---\n\n# ${d.seoTitle || p.title}\n\n網址：${abs(url.post(p.id))}\n地點：${p.zh}，${p.area}，${REGION_ZH[p.region] || p.region}　分類：${p.cat}　發佈：${iso(p.date)}　更新：${modOf(p, d)}　作者：Nomo\n\n${strip(d.dek)}\n\n${mdBody(d)}\n${d.info ? `## 旅行資訊\n\n${d.info.map(([k, v]) => `- ${strip(k)}：${strip(v)}`).join('\n')}\n\n` : ''}${d.faq ? `## 常見問題\n\n${d.faq.map(([q, a]) => `Q：${strip(q)}\nA：${strip(a)}\n`).join('\n')}\n` : ''}${d.sources ? `## 資料來源\n\n${d.sources.map(([t, h]) => `- ${strip(t)}：${h}`).join('\n')}\n\n` : ''}`; }).join('\n') +
  newsNew.map(n => `---\n\n# ${n.title}\n\n網址：${abs(url.news(n.id))}\n類型：世界旅遊新訊（編譯）　地點：${n.place}　發佈：${iso(n.date)}　原文：${n.src}〈${n.srcTitle}〉 ${n.url}\n\n${strip(n.dek || '')}\n\n${n.body.map(s => `${s.h ? `## ${strip(s.h)}\n\n` : ''}${s.p.map(strip).join('\n\n')}`).join('\n\n')}\n\n${n.faq && n.faq.length ? `## 常見問題\n\n${n.faq.map(([q, a]) => `Q：${strip(q)}\nA：${strip(a)}\n`).join('\n')}\n` : ''}`).join('\n'));
const feedItems = [...postsNew.map(p => ({ t: POST_DETAIL[p.id].seoTitle || p.title, u: url.post(p.id), d: strip(POST_DETAIL[p.id].dek), date: p.date, c: p.cat })),
  ...newsNew.map(n => ({ t: n.title, u: url.news(n.id), d: strip(n.dek || ''), date: n.date, c: 'NEWS' }))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40);
fs.writeFileSync(path.join(ROOT, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Out and About｜我出去一下就回來</title><link>${abs('/')}</link><description>Nomo 的旅行雜誌</description><language>zh-TW</language>
<atom:link href="${abs('/feed.xml')}" rel="self" type="application/rss+xml"/>
${feedItems.map(f => `<item><title>${xml(f.t)}</title><link>${abs(f.u)}</link><guid isPermaLink="true">${abs(f.u)}</guid><pubDate>${new Date(iso(f.date) + 'T09:00:00+08:00').toUTCString()}</pubDate><category>${f.c}</category><description>${xml(f.d)}</description></item>`).join('\n')}
</channel></rss>
`);
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');
if (CFG.domain) fs.writeFileSync(path.join(ROOT, 'CNAME'), CFG.domain + '\n');

{ const keep = new Set(newsNew.map(n => n.id)); const nd = path.join(ROOT, 'news');
  if (fs.existsSync(nd)) for (const e of fs.readdirSync(nd, { withFileTypes: true })) if (e.isDirectory() && !keep.has(e.name)) { fs.rmSync(path.join(nd, e.name), { recursive: true, force: true }); console.log('news retired:', e.name); } }
console.log(`built: ${POSTS.length} stories, ${newsNew.length}/${NEWS.length} news, ${Object.keys(CATS).length} categories, ${SERIES.length} series, ${regions.length} destinations → ${SITE}`);
if (missing.length) console.warn('MISSING IMAGES:', [...new Set(missing)]);
