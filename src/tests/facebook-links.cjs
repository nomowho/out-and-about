const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const toolPath=path.join(__dirname,'../maintenance/facebook-links.cjs');
assert(fs.existsSync(toolPath),'Facebook link generator must exist');
const {makeLink,addRecord,updateRecord,readLedger}=require(toolPath);
const a=makeLink({articlePath:'/stories/under/',date:'2026-11-25',edition:'01'});
const b=makeLink({articlePath:'/stories/under/',date:'2026-11-28',edition:'02'});
assert.equal(a.post_id,'20261125_under_01');assert.notEqual(a.post_id,b.post_id);
assert.equal(new URL(a.tracking_url).searchParams.get('utm_content'),a.post_id);
assert.equal(a.scheduled_at,'2026-11-25T21:00:00+08:00');assert.equal(a.status,'draft');assert.equal(a.facebook_url,'');
assert.throws(()=>makeLink({articlePath:'/stories/under/',date:'2026-11-24',edition:'01'}),/Wednesday|Saturday/);
assert.throws(()=>makeLink({articlePath:'/stories/under/',date:'2026-02-30',edition:'01'}),/date/);
assert.throws(()=>makeLink({articlePath:'https://evil.example/path',date:'2026-11-25',edition:'01'}),/article/);
assert.throws(()=>makeLink({articlePath:'/stories/under/',date:'2026-11-25',edition:'person@example.com'}),/edition/);
assert.throws(()=>makeLink({articlePath:'/stories/'+('a'.repeat(100))+'/',date:'2026-11-25',edition:'01'}),/length/);
const qa=makeLink({articlePath:'/stories/under/',date:'2026-11-24',edition:'01',test:true});assert(qa.post_id.startsWith('qa_'));assert.equal(qa.status,'test');assert.equal(qa.scheduled_at,'');assert.equal(new URL(qa.tracking_url).searchParams.get('utm_campaign'),'nomogram_tracking_test');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nomogram-links-')),ledger=path.join(dir,'post-links.csv');
try{
 addRecord(ledger,a);addRecord(ledger,b);assert.equal(readLedger(ledger).length,2);assert.throws(()=>addRecord(ledger,a),/Duplicate/);
 assert.throws(()=>updateRecord(ledger,a.post_id,{status:'published',facebook_url:'https://evil.example/'}),/Facebook/);
 updateRecord(ledger,a.post_id,{status:'published',facebook_url:'https://www.facebook.com/nomogram/posts/123456789'});assert.equal(readLedger(ledger)[0].status,'published');assert.equal(readLedger(ledger)[1].tracking_url,b.tracking_url);
 assert.throws(()=>addRecord(path.resolve(__dirname,'../../src/maintenance/private-ledger.csv'),a),/outside/);
}finally{assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(dir).startsWith('nomogram-links-'));fs.rmSync(dir,{recursive:true,force:true});}
console.log('PASS unique links, weekday/date validation, private CSV ledger, duplicate guard and publication records');
