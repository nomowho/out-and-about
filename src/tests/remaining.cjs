const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {signature,record}=require('../content-dates.cjs');
const page='<title>A</title><meta name="description" content="B"><main><p>Hello world.</p><a href="/stories/under/">Under</a></main>';
assert.equal(signature(page),signature(page+'<style>body{color:red}</style>'));
assert.notEqual(signature(page),signature(page.replace('Hello world','Changed text')));
const before={hash:'same',date:'2026-11-17'};
assert.equal(record(before,'same','2026-11-20','2026-11-24').date,'2026-11-17');
assert.equal(record(before,'changed','2026-11-20','2026-11-24').date,'2026-11-24');
console.log('PASS content dates ignore deployments and respond to content edits');
const js=read('src/site.js');
const start=js.indexOf('    var pick = function'),end=js.indexOf('    if (searchForm)',start);
const make=(areas,text)=>({hidden:false,parentNode:null,textContent:text,getAttribute:n=>n==='data-area'?areas:text,classList:{toggle(){}}});
const secs=[make('art architecture','挪威 The Twist'),make('food architecture','挪威 Under'),make('art','日本 青森')];
const ctx={secs,chips:[],areas:{classList:{toggle(){}},dispatchEvent(){}},searchInput:{value:'挪威'},searchStatus:{},normalizeSearch:s=>s.normalize('NFKC').toLowerCase().trim(),Event:class{},selectedArea:''};
vm.runInNewContext(js.slice(start,end)+';this.pick=pick;',ctx);
ctx.pick('art',false);assert.deepEqual(secs.map(x=>x.hidden),[false,true,true]);
ctx.searchInput.value='ＵＮＤＥＲ';ctx.pick('architecture',false);assert.deepEqual(secs.map(x=>x.hidden),[true,false,true]);
ctx.searchInput.value='';ctx.pick('',false);assert(secs.every(x=>!x.hidden));
console.log('PASS keyword search combines category and Unicode/case normalization');
const html=read('stories/index.html');assert.equal((html.match(/data-search=/g)||[]).length,107);assert(html.includes('role="search" hidden'));assert(!/<h3>/.test(html.split('id="all">')[1].split('</section>')[0]));
const firstPhoto=html.split('id="all">')[1].match(/<img[^>]+>/)[0];assert(firstPhoto.includes('fetchpriority="high"'));assert(!firstPhoto.includes('loading="lazy"'));
const guides=JSON.parse(read('src/series-guides.json'));assert.equal(Object.keys(guides).length,8);for(const id of Object.keys(guides)){const h=read('series/'+id+'/index.html');assert(h.includes('旅行規劃'));assert.equal(guides[id].length,3);}
console.log('PASS all 107 articles remain crawlable, eight guides have contextual links');
const home=read('index.html');assert.equal((home.match(/<noscript>/g)||[]).length,17);assert(home.includes('image-fallback.js'));
const media=JSON.parse(read('src/mobile-images/manifest.json'));
for(const [rel,variants]of Object.entries(media)){assert(variants.every(v=>v.width<=720));for(const v of variants)assert(fs.existsSync(path.join(root,'assets/mobile-images',v.file)));}
for(const id of ['under','aomori-top10','sagrada-familia'])assert(read('stories/'+id+'/index.html').includes('media="(max-width:700px)" type="image/webp"'));
console.log('PASS no-JS image fallback and mobile-only WebP delivery');
