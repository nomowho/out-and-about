// IndexNow：把這次 commit 改到的頁面通知 Bing / Yandex / Naver 等（Google 不吃 IndexNow，靠 sitemap）
// 用法：node src/indexnow.cjs [commit 範圍，預設 HEAD~1..HEAD]  或  node src/indexnow.cjs --all
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CFG = require('./site.config.json');
const key = fs.readdirSync(ROOT).map(f => f.match(/^([0-9a-f]{32})\.txt$/)).find(Boolean)?.[1];
if (!key) { console.log('indexnow: no key file'); process.exit(0); }
let urls;
if (process.argv[2] === '--all') {
  urls = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
} else {
  const range = process.argv[2] || 'HEAD~1..HEAD';
  const files = execSync(`git -c core.quotepath=off diff --name-only ${range}`, { cwd: ROOT, encoding: 'utf8' }).split('\n')
    .filter(f => f.endsWith('.html') && !f.startsWith('src/') && f !== '404.html');
  urls = files.map(f => CFG.url + '/' + f.replace(/index\.html$/, '').replace(/\.html$/, ''));
  for (const f of ['sitemap.xml', 'feed.xml']) if (files.length) urls.push(`${CFG.url}/${f}`);
}
urls = [...new Set(urls)].slice(0, 10000);
if (!urls.length) { console.log('indexnow: nothing changed'); process.exit(0); }
fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: CFG.domain, key, keyLocation: `${CFG.url}/${key}.txt`, urlList: urls }),
}).then(r => console.log(`indexnow: ${urls.length} urls -> HTTP ${r.status}`)).catch(e => console.log('indexnow failed:', e.message));
