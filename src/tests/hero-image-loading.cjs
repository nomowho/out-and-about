const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync(require('path').join(__dirname, '../site.js'), 'utf8');
const start = source.indexOf('  function loadHeroNear(track, current, total)');
const end = source.indexOf('  /* 手機首屏', start);
assert(start >= 0 && end > start);
const load = vm.runInNewContext(source.slice(start, end) + ';loadHeroNear');
function fixture() {
  const slides = Array.from({length:10}, (_, i) => {
    const im = {dataset:{src:`${i}.jpg`,srcset:`${i}.jpg 1080w`},removeAttribute(k){delete this.dataset[k==='data-src'?'src':'srcset'];}};
    const mobile = {dataset:{srcset:`${i}-mobile.jpg 720w`},removeAttribute(){delete this.dataset.srcset;}};
    return {im,mobile,getAttribute(){return String(i)},querySelectorAll(q){return q.startsWith('source') ? (mobile.dataset.srcset?[mobile]:[]) : (im.dataset.src?[im]:[])}};
  });
  return {children:slides};
}
const track = fixture();
const loaded = () => track.children.flatMap((s,i)=>s.im.src?[i]:[]);
load(track,0,10);
assert.deepEqual(loaded(),[0,1,9],'Initial load must only include current, previous and next');
assert(!track.children[4].mobile.srcset,'Distant mobile sources must stay deferred');
load(track,1,10);
assert.deepEqual(loaded(),[0,1,2,9],'Advancing one slide must add only the next neighbor');
const reverse = fixture();
load(reverse,9,10);
assert.deepEqual(reverse.children.flatMap((s,i)=>s.im.src?[i]:[]),[0,8,9],'Preloading must wrap around both ends');
console.log('PASS Hero images: three initial slides, incremental preloading, mobile source deferral and circular neighbors');
