const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),code=fs.readFileSync(path.join(root,'src/analytics.js'),'utf8');
function capture(search,navigator={}){
 const ctx={URL,Date,Object,WeakSet,WeakMap,setTimeout(){},clearTimeout(){},requestAnimationFrame(){},innerHeight:500,location:{hostname:'nomowho.com',origin:'https://nomowho.com',pathname:'/stories/under/',search},navigator,document:{currentScript:{dataset:{measurement:'G-EXAMPLE123'}},title:'Under',referrer:'https://www.facebook.com/?private=not-sent',visibilityState:'visible',readyState:'complete',querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({}),head:{appendChild(){}},addEventListener(){}},addEventListener(){}};ctx.window=ctx;
 vm.runInNewContext(code,ctx);return ctx.dataLayer?ctx.dataLayer.map(a=>Array.from(a)):[];
}
const query=id=>'?utm_source=facebook&utm_medium=social&utm_campaign=nomogram_articles&utm_content='+id+'&private=secret&fbclid=private-click-id';
const first=capture(query('20261125_under_01')),second=capture(query('20261128_under_02'));
const config=a=>a.find(x=>x[0]==='config')[2],events=a=>a.filter(x=>x[0]==='event');
assert.equal(config(first).campaign_content,'20261125_under_01','First Facebook post must retain its campaign ID');
assert.equal(config(second).campaign_content,'20261128_under_02','Repeated article must be distinguishable by post ID');
assert.equal(config(first).campaign_source,'facebook');assert.equal(config(first).campaign_medium,'social');assert.equal(config(first).campaign_name,'nomogram_articles');
for(const data of [first,second]){
 assert.equal(data.filter(x=>x[1]==='facebook_landing').length,1);
 assert(events(data).every(x=>x[2].fb_post_id===config(data).campaign_content));
 assert(events(data).every(x=>x[2].page_location==='https://nomowho.com/stories/under/'));
 assert(!JSON.stringify(data).includes('secret'));assert(!JSON.stringify(data).includes('private-click-id'));assert(!JSON.stringify(data).includes('not-sent'));
}
for(const bad of [query('person@example.com'),query('20261125_under_01')+'&utm_content=20261128_under_02',query('20261125_under_01').replace('utm_source=facebook','utm_source=other'),query('20261125_under_01').replace('utm_campaign=nomogram_articles','utm_campaign=secret'),'?utm_source=facebook&utm_content=20261125_under_01','?private=secret']){
 const data=capture(bad);assert(!config(data).campaign_content,'Reject invalid/incomplete/ambiguous campaign');assert(!data.some(x=>x[1]==='facebook_landing'));assert(!JSON.stringify(data).includes('secret'));assert(!JSON.stringify(data).includes('person@'));
}
const qa=capture(query('qa_20261124_under_01').replace('nomogram_articles','nomogram_tracking_test'));
assert.equal(config(qa).campaign_name,'nomogram_tracking_test');assert.equal(config(qa).debug_mode,true);assert(!('debug_mode' in config(first)));
assert(!config(capture(query('qa_20261124_under_01'))).campaign_content,'QA IDs must not enter real campaign');
for(const n of [{globalPrivacyControl:true},{doNotTrack:'1'}])assert.equal(capture(query('20261125_under_01'),n).length,0);
const qaDefaults=qa.find(a=>a[0]==='set');
assert(qaDefaults, 'QA attribution must be available before Google tag initialisation');
assert.equal(qaDefaults[1].debug_mode,true);
assert.equal(qaDefaults[1].campaign_content,'qa_20261124_under_01');
assert(events(qa).every(a=>a[2].debug_mode===true), 'Every QA event must be marked for DebugView');
assert(events(first).every(a=>!('debug_mode' in a[2])), 'Do not mark real visitors as testers');
assert.equal(capture(query('20261125_under_01')+'&preview=editor').length,0);
console.log('PASS Facebook campaign IDs, landing events, rejected parameters and privacy exclusions');
