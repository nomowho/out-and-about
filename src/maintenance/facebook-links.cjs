// Create tracking links and maintain an external CSV; never posts to Facebook.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'../..');
const COLS=['post_id','article_path','scheduled_at','tracking_url','facebook_url','status'];
function makeLink({articlePath,date,edition='01',test=false}){
 if(!/^\/(?:stories\/[a-z0-9]+(?:-[a-z0-9]+)*|guides\/aomori-winter)\/$/.test(articlePath||''))throw Error('Invalid article path');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))throw Error('Invalid date');
 const d=new Date(date+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)throw Error('Invalid date');
 if(!test&&![3,6].includes(d.getUTCDay()))throw Error('Choose Wednesday or Saturday (Taipei 21:00)');
 if(!/^\d{2}$/.test(edition)||edition==='00')throw Error('Invalid edition (01–99)');
 const slug=articlePath.split('/').at(-2),postId=(test?'qa_':'')+date.replace(/-/g,'')+'_'+slug+'_'+edition;
 const url=new URL('https://nomowho.com'+articlePath);
 for(const [k,v]of Object.entries({utm_source:'facebook',utm_medium:'social',utm_campaign:test?'nomogram_tracking_test':'nomogram_articles',utm_content:postId}))url.searchParams.set(k,v);
 return {post_id:postId,article_path:articlePath,scheduled_at:test?'':date+'T21:00:00+08:00',tracking_url:url.href,facebook_url:'',status:test?'test':'draft'};
}
function privatePath(file){
 const full=path.resolve(file),relative=path.relative(ROOT,full);
 if(relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw Error('Keep the ledger outside the public repository');
 if(path.extname(full).toLowerCase()!=='.csv')throw Error('Ledger must be a CSV file');return full;
}
function parseCSV(input){
 const out=[];let row=[],field='',quoted=false;
 const text=input.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
 else if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));if(row.some(Boolean))out.push(row);row=[];field='';}else field+=c;}
 if(quoted)throw Error('Unclosed CSV quote');if(field||row.length){row.push(field.replace(/\r$/,''));out.push(row);}return out;
}
function readLedger(file){
 const full=privatePath(file);if(!fs.existsSync(full))return [];
 const [headers,...rows]=parseCSV(fs.readFileSync(full,'utf8'));if(JSON.stringify(headers)!==JSON.stringify(COLS))throw Error('Unexpected ledger columns; preserve original file');
 return rows.map(row=>{if(row.length!==COLS.length)throw Error('Invalid CSV row');return Object.fromEntries(COLS.map((k,i)=>[k,row[i]]));});
}
const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
function writeLedger(file,rows){const full=privatePath(file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,'\uFEFF'+[COLS,...rows.map(r=>COLS.map(c=>r[c]))].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n','utf8');}
function addRecord(file,row){const rows=readLedger(file);if(rows.some(r=>r.post_id===row.post_id))throw Error('Duplicate post ID; use another edition or inspect the existing record');rows.push(row);writeLedger(file,rows);return row;}
function updateRecord(file,id,{status,facebook_url}){
 const rows=readLedger(file),row=rows.find(r=>r.post_id===id);if(!row)throw Error('Unknown post ID');
 if(!['draft','scheduled','published','cancelled'].includes(status))throw Error('Invalid status');
 if(facebook_url){const u=new URL(facebook_url);if(u.protocol!=='https:'||!['facebook.com','www.facebook.com'].includes(u.hostname)||u.username||u.password)throw Error('Use a public Facebook post URL');u.hash='';u.searchParams.delete('fbclid');facebook_url=u.href;}
 if(status==='published'&&!facebook_url&&!row.facebook_url)throw Error('Published record requires a Facebook post URL');
 row.status=status;if(facebook_url)row.facebook_url=facebook_url;writeLedger(file,rows);return row;
}
function main(args){
 const command=args.shift(),options={};for(let i=0;i<args.length;i++){if(!args[i].startsWith('--'))throw Error('Expected an option');const k=args[i].slice(2);if(Object.hasOwn(options,k))throw Error('Duplicate option');if(k==='test')options[k]=true;else{if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing value for '+k);options[k]=args[++i];}}
 if(!options.ledger)throw Error('Supply --ledger with a CSV path outside the public repo');
 let row;if(command==='create'){
   const id=options.article;if(!id)throw Error('Supply --article');
   const posts=vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/posts-data.js'),'utf8')+';POSTS');
   const articlePath=id==='aomori-winter'?'/guides/aomori-winter/':'/stories/'+id+'/';
   if(id!=='aomori-winter'&&!posts.some(p=>p.id===id&&p.photo!==false))throw Error('Choose an existing article with ready photos');
   row=makeLink({articlePath,date:options.date,edition:options.edition||'01',test:!!options.test});
   if(!fs.existsSync(path.join(ROOT,articlePath,'index.html')))throw Error('Build the article before generating its link');
   addRecord(options.ledger,row);
 }else if(command==='record')row=updateRecord(options.ledger,options.id,{status:options.status,facebook_url:options['facebook-url']});
 else throw Error('Use create or record. This tool does not publish or schedule Facebook posts.');
 console.log(JSON.stringify(row,null,2));
}
module.exports={makeLink,addRecord,updateRecord,readLedger};
if(require.main===module)try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}
