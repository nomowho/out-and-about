const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const notes=JSON.parse(read('src/news-travel-notes.json')),guide=JSON.parse(read('src/aomori-winter.json'));
const news=vm.runInNewContext(read('src/news-data.js')+';NEWS');
assert.equal(Object.keys(notes).length,news.length);
for(const n of news){const t=notes[n.id],html=read('news/'+n.id+'/index.html'),plain=html.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');assert(t,'Missing practical notes '+n.id);assert(t.sources.length);assert(t.sections.flatMap(s=>s.p).join('').length>=150);for(const s of t.sections){assert(plain.includes(s.h));for(const p of s.p)assert(plain.includes(p),n.id+' missing paragraph');}for(const [label,url]of t.sources){assert(url.startsWith('https://'));assert(html.includes(url.replace(/&/g,'&amp;'))||html.includes(url));assert(plain.includes(label));}assert(plain.includes(t.checked.replace(/-/g,'.')));}
const h=read('guides/aomori-winter/index.html'),plain=h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');
for(const term of ['Day 1','Day 2','Day 3','Day 4','Day 5','編輯規劃','不是作者當時','150 分鐘','兩天前預約','JR 路線巴士冬季停駛','6 天'])assert(plain.includes(term),term);
assert(h.includes('rel="canonical" href="https://nomowho.com/guides/aomori-winter/"'));
assert(read('sitemap.xml').includes('https://nomowho.com/guides/aomori-winter/'));
for(const f of ['stories/aomori-top10/index.html','series/tohoku-winter/index.html','category/guide/index.html'])assert(read(f).includes('href="/guides/aomori-winter/"'),f);
for(const b of guide.body.filter(b=>b.src))assert(fs.existsSync(path.join(root,b.src)),b.src);
for(const [full]of h.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)){const href=full.match(/href="([^"#]+)/)[1].split('?')[0];if(href.startsWith('/assets/'))continue;const target=path.join(root,href.endsWith('/')?href+'index.html':href);assert(fs.existsSync(target),href);}
let count=0;for(const dir of ['stories','news','guides']){for(const name of fs.readdirSync(path.join(root,dir))){const f=dir+'/'+name+'/index.html';if(!fs.existsSync(path.join(root,f)))continue;for(const m of read(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){const ld=JSON.parse(m[1]);if(['Article','BlogPosting','NewsArticle'].includes(ld['@type'])){assert(/^\d{4}-\d{2}-\d{2}T00:00:00\+08:00$/.test(ld.datePublished),f);assert(/^\d{4}-\d{2}-\d{2}T00:00:00\+08:00$/.test(ld.dateModified),f);count++;}}}}
assert.equal(count,119);
console.log('PASS 11 sourced news supplements, five-day guide, images/internal links/sitemap and 119 valid Article datetimes');
