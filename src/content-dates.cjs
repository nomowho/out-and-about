// Dates follow meaningful page content, not deployments, CSS or build time.
const crypto = require('crypto');
function signature(html) {
 const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/)||[])[1] || '';
 const text = main.replace(/<noscript>[\s\S]*?<\/noscript>/g,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const links = [...main.matchAll(/href="([^"]+)"/g)].map(x=>x[1]);
 const title = (html.match(/<title>([\s\S]*?)<\/title>/)||[])[1];
 const description = (html.match(/<meta name="description" content="([^"]*)"/)||[])[1];
 return crypto.createHash('sha256').update(JSON.stringify([title,description,text,links])).digest('hex');
}
function record(previous, hash, fallback, today) {
 if (!previous) return {hash,date:fallback};
 return previous.hash===hash ? previous : {hash,date:today};
}
module.exports={signature,record};
