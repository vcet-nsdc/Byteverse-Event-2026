const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lighthouse-before.json', 'utf-8'));
const audits = data.audits;

console.log('--- METRICS ---');
['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].forEach(m => {
  if (audits[m]) console.log(m, audits[m].displayValue, 'Score:', audits[m].score);
});

console.log('\n--- FAILING AUDITS (score < 1) ---');
for (const [id, a] of Object.entries(audits)) {
  if (a.score !== null && a.score < 1) {
    console.log(`[${id}] Score: ${Math.round(a.score * 100)}% | ${a.title} | ${a.displayValue || ''}`);
    if (a.details && a.details.items && a.details.items.length > 0) {
      console.log('  Items count:', a.details.items.length);
      a.details.items.slice(0, 3).forEach((item, idx) => {
        const desc = item.url || item.node?.snippet || item.node?.selector || JSON.stringify(item).slice(0, 120);
        console.log(`   #${idx + 1}:`, desc);
      });
    }
  }
}
