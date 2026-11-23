const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const js=read('src/site.js'),html=read('index.html');
let failed=0;function test(name,fn){try{fn();console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+': '+e.message)}}
test('hero loading waits for first image decode and a paint',()=>{
 const start=js.indexOf('  function whenHeroPainted('),end=js.indexOf('  function loadHeroNear(',start);assert(start>=0&&end>start,'readiness helper missing');
 const frames=[],events={};let loaded=false,decoded;
 const image={complete:false,addEventListener(n,f){events[n]=f},decode(){return {then(f){decoded=f}}}};
 const ready=vm.runInNewContext(js.slice(start,end)+';whenHeroPainted',{requestAnimationFrame:f=>frames.push(f)});
 ready({querySelector:()=>image},()=>loaded=true);assert(!loaded);events.load();assert(!loaded,'load is not a decoded image');decoded();assert(!loaded);frames.shift()();assert(!loaded);frames.shift()();assert(loaded);
});
test('mobile carousel cannot autoplay or load neighbors before first image paint',()=>{assert(js.includes('whenHeroPainted(track'));assert(js.includes('heroReady &&'));assert(js.includes('if (heroReady) loadHeroNear'));});
test('homepage has lightweight mobile images for all ten hero stories',()=>{const hero=html.split('id="track">')[1].split('</section>')[0].replace(/<noscript>[\s\S]*?<\/noscript>/g,'');assert.equal((hero.match(/class="slide"/g)||[]).length,10);assert.equal((hero.match(/media="\(max-width:700px\)" type="image\/webp"/g)||[]).length,10);const m=JSON.parse(read('src/home-images/manifest.json'));assert.equal(Object.keys(m).filter(k=>k.startsWith('hero-')).length,10);for(const [key,v]of Object.entries(m)){assert(v.variants.every(im=>im.width<=720));for(const im of v.variants)assert(fs.existsSync(path.join(root,'assets/home-images',im.file)));}});
test('series photos stay deferred until their section approaches',()=>{const section=html.split('<section class="region tser">')[1].split('</section>')[0].replace(/<noscript>[\s\S]*?<\/noscript>/g,'');assert(!/ fetchpriority="high"/.test(section));assert(!/\ssrc="/.test(section),'series still starts downloads from HTML');assert(js.includes('rootMargin: \'300px\''));});
test('first image can paint without a zoom transition',()=>{assert(read('assets/home.css').includes('.hero-ready .slide img'));assert(!/(^|})\s*\.slide img\{transition:/.test(read('assets/home.css')));});
test('CSS compaction preserves quoted URLs, escapes and calc operators',()=>{const compact=require('../compact-css.cjs');const css='/* remove */\n.a { width: calc(100% - 24px); content: "/* keep */ a  b"; background: url("x a.png"); }';const result=compact(css);assert(!result.includes('remove'));assert(result.includes('calc(100% - 24px)'));assert(result.includes('"/* keep */ a  b"'));assert(result.includes('url("x a.png")'));});
if(failed)process.exit(1);
