// Builds report.html (personal report) and index.html (shareable shell).
// Usage:
//   node report.js           -> report.html with report.json data
//   node report.js --site    -> index.html with no account data, for GitHub Pages
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const safeStringify = (v) => JSON.stringify(v).replace(/<\/script/gi, '<\\/script');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
}

function calcBundle() {
  return {
    gamedata: readJson('gamedata.json'),
    weaponPassives: readJson('weapon-passives.json'),
    setPassives: readJson('set-passives.json'),
    talentPassives: readJson('talent-passives.json'),
    signatureWeapons: readJson('signature-weapons.json'),
  };
}

function emptyReport(calc) {
  const gd = calc.gamedata || {};
  const artMain5 = Object.fromEntries(Object.entries((gd.artMain || {})['5'] || {}).map(([k, arr]) => [k, arr[20] || 0]));
  return {
    boot: true,
    summary: {
      file: '',
      analyzed: 0,
      skipped: [],
      artifacts: 0,
      weapons: 0,
      setNames: gd.setNames || {},
      setEffects: gd.setEffects || {},
      setTwo: Object.fromEntries(Object.entries(gd.sets || {}).map(([k, v]) => [k, v.two])),
      breakpoints: gd.breakpoints || {},
      artMain5,
      maxRoll: {},
      verdicts: {},
      generated: null,
    },
    characters: [],
    artifacts: [],
    weapons: [],
    calc,
  };
}

function renderHtml(data, calc) {
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  const app = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const hash = crypto.createHash('sha1');
  hash.update(app).update(tpl).update(JSON.stringify(calc));
  const calcWithId = { ...calc, buildId: hash.digest('hex').slice(0, 16) };
  const dataWithCalc = { ...data, calc: calcWithId };
  return tpl.replace(/\/\*__(DATA|APP)__\*\//g, (_, key) => ({
    DATA: safeStringify(dataWithCalc),
    APP: app,
  }[key]));
}

function buildReport(jsonPath = path.join(__dirname, 'report.json'), outPath = path.join(__dirname, 'report.html')) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const html = renderHtml(data, calcBundle());
  fs.writeFileSync(outPath, html);
  return { outPath, size: fs.statSync(outPath).size };
}

// Shareable build: bundles public game data (gamedata.json and the passive
// tables) but no account report. Visitors import their own GOOD export.
function buildSite(outPath = path.join(__dirname, 'index.html')) {
  const calc = calcBundle();
  const html = renderHtml(emptyReport(calc), calc);
  fs.writeFileSync(outPath, html);
  return { outPath, size: fs.statSync(outPath).size };
}

if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  if (args.has('--site') || args.has('site')) {
    const r = buildSite(path.join(__dirname, 'index.html'));
    console.log('wrote', r.outPath, (r.size / 1024 / 1024).toFixed(2) + ' MB');
  } else {
    const r = buildReport();
    console.log('wrote', r.outPath, (r.size / 1024 / 1024).toFixed(2) + ' MB');
  }
}

module.exports = { buildReport, buildSite };
