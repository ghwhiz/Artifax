// Core stat + scoring engine. Pure local, no network.
const DATA = require('./gamedata.json');

const SLOTS = ['flower', 'plume', 'sands', 'goblet', 'circlet'];
const SLOT_LABEL = { flower: 'Flower', plume: 'Plume', sands: 'Sands', goblet: 'Goblet', circlet: 'Circlet' };

// Max 5-star substat roll and whether the stat is main-stat scaled.
const MAX = {
  hp: { max: 298.75 }, atk: { max: 19.45 }, def: { max: 23.15 },
  hp_: { max: 0.0583 }, atk_: { max: 0.0583 }, def_: { max: 0.0729 },
  critRate_: { max: 0.0389 }, critDMG_: { max: 0.0777 },
  eleMas: { max: 23.31 }, enerRech_: { max: 0.0648 },
  healing_: { max: 0.359, main: true },
  physical_dmg_: { max: 0.583, main: true },
  pyro_dmg_: { max: 0.466, main: true }, hydro_dmg_: { max: 0.466, main: true },
  cryo_dmg_: { max: 0.466, main: true }, electro_dmg_: { max: 0.466, main: true },
  anemo_dmg_: { max: 0.466, main: true }, geo_dmg_: { max: 0.466, main: true },
  dendro_dmg_: { max: 0.466, main: true },
  skill_dmg_: { max: 0.466, main: true }, burst_dmg_: { max: 0.466, main: true },
  na_dmg_: { max: 0.466, main: true }, plunge_dmg_: { max: 0.466, main: true },
  nightsoul_dmg_: { max: 0.466, main: true },
  electro_res_: { max: 0.4, main: true }, pyro_res_: { max: 0.4, main: true },
  shield_: { max: 0.35, main: true },
};

const ELE_DMG = {
  pyro: 'pyro_dmg_', hydro: 'hydro_dmg_', cryo: 'cryo_dmg_', electro: 'electro_dmg_',
  anemo: 'anemo_dmg_', geo: 'geo_dmg_', dendro: 'dendro_dmg_', physical: 'physical_dmg_',
};

const STAT_LABEL = {
  hp: 'HP', hp_: 'HP%', atk: 'ATK', atk_: 'ATK%', def: 'DEF', def_: 'DEF%',
  critRate_: 'CRIT Rate', critDMG_: 'CRIT DMG', eleMas: 'EM', enerRech_: 'Energy Recharge',
  healing_: 'Healing Bonus', physical_dmg_: 'Physical DMG',
  pyro_dmg_: 'Pyro DMG', hydro_dmg_: 'Hydro DMG', cryo_dmg_: 'Cryo DMG', electro_dmg_: 'Electro DMG',
  anemo_dmg_: 'Anemo DMG', geo_dmg_: 'Geo DMG', dendro_dmg_: 'Dendro DMG',
  na_dmg_: 'Normal/Charged DMG', skill_dmg_: 'Skill DMG', burst_dmg_: 'Burst DMG',
};

const normSet = (s) => (s || '').toLowerCase().replace(/_/g, '');
const KEY_ALIAS = { heal_: 'healing_' };
const normKey = (k) => KEY_ALIAS[k] || k;
const PCT_KEYS = new Set([
  'hp_', 'atk_', 'def_', 'critRate_', 'critDMG_', 'enerRech_', 'healing_',
  'physical_dmg_', 'pyro_dmg_', 'hydro_dmg_', 'cryo_dmg_', 'electro_dmg_',
  'anemo_dmg_', 'geo_dmg_', 'dendro_dmg_', 'skill_dmg_', 'burst_dmg_', 'na_dmg_',
  'plunge_dmg_', 'nightsoul_dmg_', 'electro_res_', 'pyro_res_', 'shield_',
]);

function cdEq(key, val) {
  const m = MAX[key];
  if (!m) return 0;
  return (val / m.max) * (m.main ? 62.1 : 7.77);
}

function parseArtifact(a) {
  return {
    id: a.id || `${a.setKey}|${a.slotKey}|${a.mainStatKey}|${a.level}|${(a.substats || []).map((s) => s.key + ':' + s.value).join(',')}`,
    setKey: a.setKey, set: normSet(a.setKey), slot: a.slotKey,
    main: normKey(a.mainStatKey), level: a.level || 0, rarity: a.rarity || 5,
    subs: (a.substats || []).map((s) => {
      const key = normKey(s.key);
      return { key, val: PCT_KEYS.has(key) ? s.value / 100 : s.value };
    }),
    hidden: (a.unactivatedSubstats || []).map((s) => {
      const key = normKey(s.key);
      return { key, val: PCT_KEYS.has(key) ? s.value / 100 : s.value };
    }),
    totalRolls: a.totalRolls != null ? a.totalRolls : null,
    location: a.location || '', lock: !!a.lock,
  };
}

function mainValue(p) {
  const table = DATA.artMain[String(p.rarity)] || DATA.artMain['5'];
  const arr = table && table[p.main];
  return arr ? (arr[p.level] || 0) : 0;
}

function pieceStats(p) {
  const out = { [p.main]: mainValue(p) };
  for (const s of p.subs) out[s.key] = (out[s.key] || 0) + s.val;
  return out;
}

function setCounts(pieces) {
  const c = {};
  for (const p of pieces) c[p.set] = (c[p.set] || 0) + 1;
  return c;
}

function setTwoStats(pieces) {
  const out = {};
  for (const [s, n] of Object.entries(setCounts(pieces))) {
    if (n >= 2 && DATA.sets[s]) for (const [k, v] of Object.entries(DATA.sets[s].two)) out[k] = (out[k] || 0) + v;
  }
  return out;
}

function charBase(charKey, level = 90, asc = 6) {
  const c = DATA.chars[charKey];
  if (!c) return null;
  const out = { hp: 0, atk: 0, def: 0 };
  for (const lc of c.lvlCurves) {
    const curve = (DATA.charCurves[lc.curve] || [])[level] || 0;
    out[lc.key] = (out[lc.key] || 0) + lc.base * curve;
  }
  for (const k of ['hp', 'atk', 'def']) if (c.asc[k]) out[k] += c.asc[k][asc] || 0;
  return out;
}

function weaponStats(weaponKey, level = 90, asc = 6) {
  const w = DATA.weapons[weaponKey];
  if (!w) return null;
  const mcurve = (DATA.weaponCurves[w.mainCurve] || [])[level] || 0;
  let baseAtk = w.mainBase * mcurve;
  if (w.ascAtk) baseAtk += w.ascAtk[asc] || 0;
  let sub = null;
  if (w.subKey) {
    const scurve = (DATA.weaponCurves[w.subCurve] || [])[level] || 0;
    sub = { key: w.subKey, val: w.subBase * scurve };
  }
  return { baseAtk, sub };
}

function computeStats(charKey, weaponKey, pieces, ctx = {}) {
  const c = DATA.chars[charKey];
  if (!c) return null;
  const charLevel = ctx.charLevel == null ? 90 : ctx.charLevel;
  const charAsc = ctx.charAsc == null ? 6 : ctx.charAsc;
  const w = weaponKey ? weaponStats(weaponKey, ctx.weaponLevel == null ? 90 : ctx.weaponLevel, ctx.weaponAsc == null ? 6 : ctx.weaponAsc) : null;
  const src = { artifact: {}, setTwo: {}, setFour: {}, asc: {}, weaponSub: {}, weaponPassive: {}, talent: {}, conversion: {} };
  const addTo = (obj, o) => { for (const [k, val] of Object.entries(o)) obj[k] = (obj[k] || 0) + val; };
  for (const p of pieces) addTo(src.artifact, pieceStats(p));
  addTo(src.setTwo, setTwoStats(pieces));
  for (const [k, arr] of Object.entries(c.asc)) {
    if (!['hp', 'atk', 'def'].includes(k)) src.asc[k] = (src.asc[k] || 0) + (arr[charAsc] || 0);
  }
  if (w && w.sub) src.weaponSub[w.sub.key] = (src.weaponSub[w.sub.key] || 0) + w.sub.val;
  const addPassiveStats = (target, p) => {
    if (!p) return;
    addTo(target, (p.always && p.always.stats) || {});
    if (p.enabled !== false) addTo(target, p.stats || {});
  };
  const passive = ctx.weaponPassive;
  addPassiveStats(src.weaponPassive, passive);
  const setPassive = ctx.setPassive;
  const setCount = setPassive && ctx.setPassiveSet ? (setCounts(pieces)[ctx.setPassiveSet] || 0) : 0;
  const setActive = !!(setPassive && setCount >= 4);
  if (setActive) addPassiveStats(src.setFour, setPassive);
  const talent = ctx.talentPassive;
  addPassiveStats(src.talent, talent);

  const v = {};
  for (const [s, o] of Object.entries(src)) {
    if (s === 'conversion') continue;
    addTo(v, o);
  }

  const base = charBase(charKey, charLevel, charAsc);
  const baseHP = base.hp, baseATK = base.atk + (w ? w.baseAtk : 0), baseDEF = base.def;
  const hp0 = baseHP * (1 + (v.hp_ || 0)) + (v.hp || 0);
  const atk0 = baseATK * (1 + (v.atk_ || 0)) + (v.atk || 0);
  const def0 = baseDEF * (1 + (v.def_ || 0)) + (v.def || 0);
  const em0 = v.eleMas || 0;
  const er0 = 1 + (v.enerRech_ || 0);
  const goblet = pieces.find((p) => p.slot === 'goblet');
  const damageKey = (goblet && goblet.main && goblet.main.endsWith('_dmg_'))
    ? goblet.main
    : (ctx.damageKey || ELE_DMG[c.ele] || null);
  for (const pss of [passive, setActive ? setPassive : null, talent]) {
    if (!pss) continue;
    const conversions = [...((pss.always && pss.always.conversions) || [])];
    if (pss.enabled !== false) conversions.push(...(pss.conversions || []));
    for (const conv of conversions) {
      const fromVal = conv.from === 'hp' ? hp0 : conv.from === 'eleMas' ? em0 : conv.from === 'def' ? def0 : conv.from === 'er' ? er0 : conv.from === 'atk' ? atk0 : 0;
      const raw = fromVal - (conv.above || 0);
      if (raw <= 0) continue;
      let add = raw * (conv.ratio || 0);
      if (conv.cap != null) add = Math.min(add, conv.cap);
      v[conv.to] = (v[conv.to] || 0) + add;
      src.conversion[conv.to] = (src.conversion[conv.to] || 0) + add;
    }
  }
  const hp = baseHP * (1 + (v.hp_ || 0)) + (v.hp || 0);
  const atk = baseATK * (1 + (v.atk_ || 0)) + (v.atk || 0);
  const def = baseDEF * (1 + (v.def_ || 0)) + (v.def || 0);
  const em = v.eleMas || 0;
  const crRaw = 0.05 + (v.critRate_ || 0);
  const cr = Math.min(1, crRaw);
  const cd = 0.5 + (v.critDMG_ || 0);
  const er = 1 + (v.enerRech_ || 0);
  const dmg = (damageKey ? (v[damageKey] || 0) : 0) + (v.dmg_ || 0);

  const pctSources = ['asc', 'artifact', 'setTwo', 'setFour', 'talent', 'weaponSub', 'weaponPassive', 'conversion'];
  const flatSources = ['artifact', 'setTwo', 'setFour', 'talent', 'weaponPassive', 'conversion'];
  const addSources = ['asc', 'artifact', 'setTwo', 'setFour', 'talent', 'weaponSub', 'weaponPassive', 'conversion'];
  const val = (s, k) => (src[s] && src[s][k]) || 0;
  const pctObj = (k) => { const o = {}; for (const s of pctSources) o[s] = val(s, k); return o; };
  const flatObj = (k) => { const o = {}; for (const s of flatSources) o[s] = val(s, k); return o; };
  const addObj = (stat, baseVal) => {
    const o = { base: baseVal, total: 0 };
    for (const s of addSources) o[s] = val(s, stat);
    o.total = o.base + addSources.reduce((a, s) => a + o[s], 0);
    return o;
  };
  const dmgObj = () => {
    const o = { base: 0, total: 0 };
    for (const s of addSources) { o[s] = (damageKey ? val(s, damageKey) : 0) + val(s, 'dmg_'); o.total += o[s]; }
    return o;
  };
  const bd = {
    hp: { base: baseHP, pct: pctObj('hp_'), flat: flatObj('hp'), total: hp },
    atk: { charBase: base.atk, weaponBase: w ? w.baseAtk : 0, pct: pctObj('atk_'), flat: flatObj('atk'), total: atk },
    def: { base: baseDEF, pct: pctObj('def_'), flat: flatObj('def'), total: def },
    cr: addObj('critRate_', 0.05),
    cd: addObj('critDMG_', 0.5),
    er: addObj('enerRech_', 1),
    em: addObj('eleMas', 0),
    dmg: dmgObj(),
    healing: addObj('healing_', 0),
  };
  return { hp, atk, def, cr, crRaw, cd, er, em, dmg, damageKey, healing: v.healing_ || 0, raw: v, baseHP, baseATK, baseDEF, breakdown: bd };
}

function buildWeights(build) {
  if (build._w) return build._w;
  const w = {};
  for (const s of build.subs) w[s.key] = Math.max(w[s.key] || 0, s.w);
  build._w = w;
  return w;
}

function subWeight(build, key) {
  const w = buildWeights(build);
  if (w[key] != null) return w[key];
  if (key === 'hp') return (w.hp_ || 0) * 0.3;
  if (key === 'atk') return (w.atk_ || 0) * 0.3;
  if (key === 'def') return (w.def_ || 0) * 0.3;
  return 0;
}

function slotWeights(build, slot) {
  return slot === 'sands' ? build.sands : slot === 'goblet' ? build.goblet : slot === 'circlet' ? build.circlet : null;
}

function pieceScore(p, build) {
  let score = 0;
  const sw = slotWeights(build, p.slot);
  if (sw) {
    const mw = sw.find((x) => x.key === p.main);
    if (mw) score += 62.1 * mw.w / 100;
  }
  for (const s of p.subs) {
    const w = subWeight(build, s.key);
    if (w) score += cdEq(s.key, s.val) * w / 100;
  }
  return score;
}

function setBonusScore(pieces, build) {
  const c = setCounts(pieces);
  let s = 0;
  if (build.set) {
    const n = c[build.set] || 0;
    if (n >= 4 && build.comp === '4pc') s += 45;
    else if (n >= 4) s += 18;
    else if (n >= 2) s += 8;
  }
  if (build.comp === '2pc+2pc') {
    let twos = 0;
    for (const [k, n] of Object.entries(c)) if (n >= 2 && DATA.sets[k]) twos++;
    if (twos >= 2) s += 14;
  }
  return s;
}

function erTarget(build) {
  const w = subWeight(build, 'enerRech_');
  return w >= 80 ? 1.6 : w >= 50 ? 1.45 : w > 0 ? 1.25 : 1.0;
}

function comboScore(pieces, build, stats) {
  let s = 0;
  for (const p of pieces) s += pieceScore(p, build);
  s += setBonusScore(pieces, build);
  const pen = Math.max(0, erTarget(build) - stats.er) * 300;
  return s - pen;
}

// Theoretical ideal raw score for the 300-point normalization.
function idealRaw(build) {
  let main = 0;
  for (const slot of SLOTS) {
    const sw = slotWeights(build, slot);
    if (sw && sw.length) main += 62.1 * Math.max(...sw.map((x) => x.w)) / 100;
  }
  const weights = build.subs.map((s) => s.w).sort((a, b) => b - a).slice(0, 4);
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;
  const perRoll = weights.reduce((a, w) => a + (w / wsum) * 7.77, 0);
  const subs = 9 * perRoll * 5;
  return main + subs + (build.set ? 45 : 0);
}

function score300(raw, build) {
  return Math.round((raw / idealRaw(build)) * 300);
}

// Project an unmaxed artifact to +20. Returns current / expected / ceiling scores.
function projectArtifact(p, build) {
  const current = pieceScore(p, build);
  const remaining = Math.max(0, 5 - Math.floor(p.level / 4));
  const weights = buildWeights(build);
  const topW = Math.max(0, ...Object.values(weights));
  const hidden = p.hidden || [];
  const unknown4 = p.subs.length < 4 && hidden.length === 0;
  const allSubs = [...p.subs, ...hidden];
  const n = unknown4 ? 4 : Math.max(1, allSubs.length);
  let expSum = 0;
  for (const s of allSubs) {
    const w = subWeight(build, s.key) || 0;
    expSum += 0.85 * 7.77 * w / 100;
  }
  if (unknown4) expSum += 0.85 * 7.77 * topW / 100;
  const expPerRoll = expSum / n;
  let unlock = 0;
  for (const h of hidden) unlock += cdEq(h.key, h.val) * subWeight(build, h.key) / 100;
  if (unknown4) unlock = 0.85 * 7.77 * topW / 100;
  const rollsAfter = Math.max(0, remaining - (unknown4 ? 1 : hidden.length));
  const projected = current + unlock + rollsAfter * expPerRoll;
  const ceiling = current + unlock + rollsAfter * (7.77 * topW / 100);
  return { current, projected, ceiling, remaining, unlock, rollsAfter };
}

module.exports = {
  DATA, SLOTS, SLOT_LABEL, STAT_LABEL, MAX, ELE_DMG,
  normSet, cdEq, parseArtifact, mainValue, pieceStats, setCounts, setTwoStats,
  computeStats, charBase, weaponStats, buildWeights, subWeight, pieceScore, setBonusScore, erTarget,
  comboScore, idealRaw, score300, projectArtifact,
};
