const fs=require('fs'),vm=require('vm'),assert=require('assert');const code=fs.readFileSync(require('path').join(__dirname,'../analytics.js'),'utf8');
function run(opts={}){
 const events={},timers=[],raf=[],observed=[],nodes=[],clicks={},image={};
 const body={getBoundingClientRect:()=>({top:opts.top??-500,height:2000})};
 const rec={href:'https://nomowho.com/stories/under/?private=not-sent',getAttribute:()=>'/stories/under/'};
 const ctx={URL,Date,Object,WeakSet,WeakMap,clearTimeout(){},setTimeout:f=>{timers.push(f);return timers.length},requestAnimationFrame:f=>raf.push(f),innerHeight:500,location:{hostname:opts.host||'nomowho.com',origin:'https://nomowho.com',pathname:'/stories/the-twist/',search:'?private=secret'},navigator:opts.navigator||{},document:{currentScript:{dataset:{measurement:'G-EXAMPLE123'}},title:'Test article',referrer:'https://example.com/path?private=secret',visibilityState:'visible',readyState:'complete',querySelector:()=>body,querySelectorAll:()=>[rec],createElement:()=>image,head:{appendChild:n=>nodes.push(n)},addEventListener:(n,f)=>clicks[n]=f},addEventListener:(n,f,o)=>events[n]=f,IntersectionObserver:class{constructor(f){observed.push(f)}observe(){}unobserve(){}}};ctx.window=ctx;
 vm.runInNewContext(code,ctx);return {ctx,events,timers,raf,observed,nodes,clicks,rec};
}
const r=run();r.raf.shift()();r.raf.shift()();let entries=()=>r.ctx.dataLayer.map(a=>Array.from(a));
assert(entries().some(a=>a[1]==='page_view'));assert(!JSON.stringify(entries()).includes('secret'));assert(!JSON.stringify(entries()).includes('not-sent'));
assert.equal(entries().filter(a=>a[1]==='article_depth_25').length,1);assert.equal(entries().filter(a=>a[1]==='article_depth_50').length,1);
r.events.scroll();r.raf.shift()();assert.equal(entries().filter(a=>a[1]==='article_depth_50').length,1);
r.observed[0]([{target:r.rec,isIntersecting:true,intersectionRatio:.8}]);r.timers.at(-1)();r.observed[0]([{target:r.rec,isIntersecting:true,intersectionRatio:.8}]);assert.equal(entries().filter(a=>a[1]==='recommendation_view').length,1);
let prevented=false;r.clicks.click({target:{closest:()=>r.rec},preventDefault:()=>prevented=true});assert.equal(entries().filter(a=>a[1]==='recommendation_click').length,1);assert(!prevented);
r.clicks.click({target:{closest:()=>({href:'https://www.instagram.com/nomowho/?private=secret'})}});assert(entries().some(a=>a[1]==='instagram_click'));assert(!JSON.stringify(entries()).includes('secret'));
assert.equal(r.nodes.length,0);r.timers[0]();assert.equal(r.nodes.length,1);assert(r.nodes[0].src.startsWith('https://www.googletagmanager.com/gtag/js?id=G-'));
for(const options of [{navigator:{globalPrivacyControl:true}},{navigator:{doNotTrack:'1'}},{host:'localhost'}])assert(!run(options).ctx.dataLayer);
console.log('PASS GA4: sanitised URLs, depth deduplication, visible recommendations, normal links, deferred tag, DNT/GPC and preview exclusion');
