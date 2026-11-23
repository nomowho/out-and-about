const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const code=['const POST_DETAIL={};',read('src/posts-data.js'),...fs.readdirSync(path.join(root,'src/articles')).filter(n=>n.endsWith('.js')).map(n=>read('src/articles/'+n)),';({POSTS,POST_DETAIL})'].join('\n');
const {POSTS,POST_DETAIL}=vm.runInNewContext(code);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const extract=(h,attribute,name)=>{const m=h.match(new RegExp('<meta '+attribute+'="'+name+'" content="([^"]*)">'));assert(m,'Missing '+name);return m[1]};
let custom=0,fallback=0;
for(const id of ['sagrada-familia','kaneja','matera'])assert(POST_DETAIL[id].metaDescription,'Missing dedicated search description for '+id);
for(const p of POSTS){
 const d=POST_DETAIL[p.id],h=read('stories/'+p.id+'/index.html');
 const meta=extract(h,'name','description'),og=extract(h,'property','og:description'),twitter=extract(h,'name','twitter:description');
 const visibleDek=h.match(/<p class="dek">([\s\S]*?)<\/p>/);assert(visibleDek,'Missing visible introduction: '+p.id);assert.equal(visibleDek[1].replace(/<[^>]+>/g,''),d.dek.replace(/<[^>]+>/g,''),'Visible introduction changed: '+p.id);
 assert.equal(og,twitter,'Social descriptions disagree: '+p.id);
 const article=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(v=>v['@type']==='BlogPosting');
 assert.equal(esc(article.description),og,'Article/social description changed: '+p.id);
 if(typeof d.metaDescription==='string'&&d.metaDescription.trim()){
  custom++;assert.equal(meta,esc(d.metaDescription.trim()),'Dedicated summary not used: '+p.id);
  assert.notEqual(meta,og,'Search summary still equals the introduction: '+p.id);
 }else{fallback++;assert.equal(meta,og,'Legacy fallback changed: '+p.id);}
}
console.log('PASS search descriptions: '+custom+' dedicated, '+fallback+' legacy fallback; all '+POSTS.length+' visible introductions and social/schema descriptions preserved');
