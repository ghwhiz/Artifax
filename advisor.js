// CLI: node advisor.js [export.json] [--beam 200] [--perSlot 60] [--out report.json]
const fs = require('fs');
const path = require('path');
const { analyze } = require('./optimize');

function latestExport() {
  const dir = path.resolve(__dirname, '..');
  const files = fs.readdirSync(dir).filter((f) => /^genshin_export_.*\.json$/.test(f)).sort();
  return files.length ? path.join(dir, files[files.length - 1]) : null;
}

const args = process.argv.slice(2);
let file = args[0] && !args[0].startsWith('--') ? args[0] : latestExport();
const getArg = (name, d) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : d; };
const out = getArg('out', path.join(__dirname, 'report.json'));
const opts = { beam: +getArg('beam', 200), perSlot: +getArg('perSlot', 60) };

if (!file || !fs.existsSync(file)) { console.error('No export file found. Pass one explicitly.'); process.exit(1); }
console.log('Reading', file);
const t0 = Date.now();
const result = analyze(file, opts);
const ms = Date.now() - t0;
fs.writeFileSync(out, JSON.stringify(result));
const rep = require('./report').buildReport(out);
console.log(`Done in ${(ms / 1000).toFixed(1)}s -> ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Report: ${rep.outPath} (${(rep.size / 1024 / 1024).toFixed(2)} MB)`);
console.log('Analyzed characters:', result.summary.analyzed, '| artifacts:', result.summary.artifacts);
console.log('Verdicts:', result.summary.verdicts);
console.log('Skipped:', result.summary.skipped);
console.log('\nTop 10 by artifact score (level-independent):');
for (const c of result.characters.slice(0, 10)) {
  console.log(` ${c.key.padEnd(22)} ${String(c.score).padStart(3)}/300  ${c.stats.atk} ATK  ${c.stats.cr}% CR  ${c.stats.cd}% CD  ${c.stats.er}% ER  [${c.build.name || c.build.id}]`);
}
