const fs = require('fs');

const before = JSON.parse(fs.readFileSync('./lighthouse-before.json', 'utf-8'));
const after = JSON.parse(fs.readFileSync('./lighthouse-after.json', 'utf-8'));

console.log('================ CATEGORY SCORES ================');
console.log('Category         | Before | After  | Change');
console.log('-----------------+--------+--------+--------');

const cats = ['performance', 'accessibility', 'best-practices', 'seo'];
cats.forEach(c => {
  const bScore = Math.round((before.categories[c]?.score || 0) * 100);
  const aScore = Math.round((after.categories[c]?.score || 0) * 100);
  const diff = aScore - bScore;
  const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
  console.log(`${c.padEnd(16)} | ${String(bScore).padStart(6)} | ${String(aScore).padStart(6)} | ${diffStr.padStart(6)}`);
});

console.log('\n================ CORE METRICS ================');
console.log('Metric                  | Before   | After    | Score (B -> A)');
console.log('------------------------+----------+----------+---------------');
const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
];

metrics.forEach(m => {
  const bVal = before.audits[m]?.displayValue || 'N/A';
  const aVal = after.audits[m]?.displayValue || 'N/A';
  const bScore = Math.round((before.audits[m]?.score || 0) * 100);
  const aScore = Math.round((after.audits[m]?.score || 0) * 100);
  console.log(`${m.padEnd(23)} | ${bVal.padEnd(8)} | ${aVal.padEnd(8)} | ${bScore}% -> ${aScore}%`);
});

console.log('\n================ AUDIT SPECIFIC COMPARISON ================');
const auditChecks = ['button-name', 'color-contrast', 'render-blocking-insight', 'bootup-time'];
auditChecks.forEach(a => {
  const bScore = before.audits[a] ? Math.round((before.audits[a].score || 0) * 100) : 'N/A';
  const aScore = after.audits[a] ? Math.round((after.audits[a].score || 0) * 100) : 'N/A';
  console.log(`${a}: Before=${bScore}% -> After=${aScore}%`);
});
