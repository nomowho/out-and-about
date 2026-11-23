const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
let pages=0,links=0;
for(const section of ['stories','news']){
  for(const dir of fs.readdirSync(path.join(root,section),{withFileTypes:true}).filter(x=>x.isDirectory())){
    const file=path.join(root,section,dir.name,'index.html');
    if(!fs.existsSync(file))continue;
    const h=fs.readFileSync(file,'utf8');
    if(!h.includes('"@type":"BlogPosting"')&&!h.includes('"@type":"NewsArticle"'))continue;
    const nav=h.match(/<nav class="related-reading"[^>]*>([\s\S]*?)<\/nav>/);
    assert(nav,`${section}/${dir.name}: missing inline recommendations`);
    const ids=[...nav[1].matchAll(/href="(?:https:\/\/nomowho\.com)?\/stories\/([^/"?#]+)\//g)].map(x=>x[1]);
    assert(new Set(ids).size>=3,`${section}/${dir.name}: fewer than three distinct stories`);
    assert.equal(ids.length,new Set(ids).size,`${section}/${dir.name}: duplicate recommendations`);
    assert(!ids.includes(dir.name),`${section}/${dir.name}: self recommendation`);
    for(const id of ids)assert(fs.existsSync(path.join(root,'stories',id,'index.html')),`${dir.name}: broken target ${id}`);
    assert(h.indexOf(nav[0])<h.indexOf('<section class="info"')||!h.includes('<section class="info"'),`${dir.name}: links are too far below the body`);
    pages++;links+=ids.length;
  }
}
assert(pages>=107,'Article coverage unexpectedly incomplete');
console.log(`PASS inline reading links: ${pages} articles, ${links} valid links; three or more distinct recommendations per article`);
