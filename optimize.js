// Reads a GOOD export, optimizes every owned character/build, and rates every artifact.
const fs = require('fs');
const path = require('path');
const E = require('./engine');
const D = E.DATA;
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const WEAPON_PASSIVES = JSON.parse(fs.readFileSync(path.join(__dirname, 'weapon-passives.json'), 'utf8'));
const SET_PASSIVES = JSON.parse(fs.readFileSync(path.join(__dirname, 'set-passives.json'), 'utf8'));
const TALENT_PASSIVES = JSON.parse(fs.readFileSync(path.join(__dirname, 'talent-passives.json'), 'utf8'));
const SIGNATURE_WEAPONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'signature-weapons.json'), 'utf8'));

function resolveVal(spec, ref) {
  if (spec == null) return 0;
  if (typeof spec === 'number') return spec;
  if (Array.isArray(spec)) return spec[Math.max(0, Math.min(4, ref - 1))] ?? spec[0];
  if (spec.r1 != null) return spec.r1 + ((spec.r5 != null ? spec.r5 : spec.r1) - spec.r1) * ((ref - 1) / 4);
  return 0;
}
function resolveMap(obj, ref) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) out[k] = resolveVal(v, ref);
  return out;
}
function resolveEffects(part, ref, fallbackNote) {
  const out = {
    stats: resolveMap(part && part.stats, ref),
    conversions: ((part && part.conversions) || []).map((c) => ({ ...c, ratio: resolveVal(c.ratio, ref) })),
    damage: resolveMap(part && part.damage, ref),
    note: (part && part.note) || fallbackNote || '',
  };
  // These two are part of the general stat sheet, not damage-only.
  for (const k of ['dmg_', 'critDMG_']) {
    if (out.damage[k] != null) {
      out.stats[k] = (out.stats[k] || 0) + out.damage[k];
      delete out.damage[k];
    }
  }
  return out;
}
function effectsPresent(e) {
  if (!e) return false;
  return Object.keys(e.stats || {}).some((k) => Math.abs(e.stats[k]) > 1e-12)
    || (e.conversions || []).length > 0
    || Object.keys(e.damage || {}).some((k) => Math.abs(e.damage[k]) > 1e-12);
}
function mergeEffects(a, b) {
  const out = {
    stats: { ...((a && a.stats) || {}) },
    conversions: [...((a && a.conversions) || [])],
    damage: { ...((a && a.damage) || {}) },
    note: (b && b.note) || (a && a.note) || '',
  };
  for (const [k, v] of Object.entries((b && b.stats) || {})) out.stats[k] = (out.stats[k] || 0) + v;
  out.conversions.push(...((b && b.conversions) || []));
  for (const [k, v] of Object.entries((b && b.damage) || {})) out.damage[k] = (out.damage[k] || 0) + v;
  return out;
}
function resolvePassive(def, ref) {
  if (!def) return null;
  const note = def.note || '';
  let alwaysDef = {};
  let conditionalDef = def;
  if (def.always === true) {
    alwaysDef = def;
    conditionalDef = {};
  } else if (def.always && typeof def.always === 'object') {
    alwaysDef = def.always;
    conditionalDef = def;
  }
  const alwaysBase = resolveEffects(alwaysDef, ref, note);
  let always = alwaysBase;
  let options = null;
  let optionsAlways = false;
  let baseConditional = resolveEffects({}, ref, note);
  if (def.always === true && def.options && def.options.length) {
    optionsAlways = true;
    options = def.options.map((o, i) => ({
      ...resolveEffects(o, ref, note),
      label: o.label || `Option ${i + 1}`,
    }));
    always = mergeEffects(alwaysBase, options[0]);
    conditionalDef = {};
  } else {
    options = (conditionalDef.options && conditionalDef.options.length)
      ? conditionalDef.options.map((o, i) => ({
        ...resolveEffects(o, ref, note),
        label: o.label || `Option ${i + 1}`,
      }))
      : null;
    baseConditional = resolveEffects(conditionalDef, ref, note);
  }
  const selected = options && !optionsAlways ? options[0] : baseConditional;
  return {
    enabled: true,
    optionIndex: 0,
    options,
    optionsAlways,
    always,
    alwaysBase,
    stats: selected.stats,
    conversions: selected.conversions,
    damage: selected.damage,
    note,
    hasConditional: !!(options && !optionsAlways) || effectsPresent(baseConditional),
  };
}
function filledDesc(weaponKey, ref) {
  const d = D.weaponDesc && D.weaponDesc[weaponKey];
  if (!d) return '';
  let s = (d.template || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const vals = (d.refinements && d.refinements[Math.max(0, Math.min(4, (ref || 1) - 1))]) || [];
  s = s.replace(/\{(\d+)\}/g, (_, i) => vals[+i] != null ? vals[+i] : `{${i}}`);
  s = s.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}

function loadExport(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const seen = new Set();
  const artifacts = (j.artifacts || []).map((a) => {
    const p = E.parseArtifact(a);
    if (seen.has(p.id)) { let n = 2; while (seen.has(p.id + '#' + n)) n++; p.id = p.id + '#' + n; }
    seen.add(p.id);
    return p;
  });
  return {
    chars: (j.characters || []).map((c) => ({ key: c.key, level: c.level, ascension: c.ascension, constellation: c.constellation })),
    weapons: (j.weapons || []).map((w) => ({ key: w.key, level: w.level, ascension: w.ascension, refinement: w.refinement, location: w.location })),
    artifacts,
    raw: j,
  };
}

function fallbackBuild(goKey) {
  const c = D.chars[goKey];
  const scaling = c.asc.hp_ ? 'hp_' : c.asc.def_ ? 'def_' : 'atk_';
  const dmg = E.ELE_DMG[c.ele] || null;
  return {
    id: 'fallback', name: 'Generic (auto)', set: null, comp: '4pc', roles: ['dps'], styles: [],
    subs: [{ key: 'critRate_', w: 100 }, { key: 'critDMG_', w: 100 }, { key: scaling, w: 100 }, { key: 'enerRech_', w: 40 }, { key: 'eleMas', w: 25 }],
    sands: [{ key: scaling, w: 100 }],
    goblet: dmg ? [{ key: dmg, w: 100 }] : [{ key: scaling, w: 100 }],
    circlet: [{ key: 'critRate_', w: 100 }, { key: 'critDMG_', w: 100 }],
    normalizer: 0,
  };
}

function optimizeCore(charKey, weaponKey, build, pool, opts, ctx, offSlot) {
  const perSlot = opts.perSlot || 60, beamSize = opts.beam || 200;
  const bySlot = {};
  for (const slot of E.SLOTS) {
    let source = pool.filter((p) => p.slot === slot);
    if (offSlot != null && slot !== offSlot) source = source.filter((p) => p.set === build.set);
    bySlot[slot] = source
      .map((p) => ({ p, sc: E.pieceScore(p, build) }))
      .sort((a, b) => b.sc - a.sc)
      .slice(0, perSlot);
    if (build.set && !bySlot[slot].some((x) => x.p.set === build.set)) {
      const cand = source.filter((p) => p.set === build.set)
        .map((p) => ({ p, sc: E.pieceScore(p, build) }))
        .sort((a, b) => b.sc - a.sc)[0];
      if (cand) bySlot[slot].push(cand);
    }
    if (!bySlot[slot].length) return null;
  }
  let beams = [{ pieces: [], score: 0 }];
  for (const slot of E.SLOTS) {
    const next = [];
    for (const b of beams) {
      for (const { p, sc } of bySlot[slot]) {
        const progress = build.set && p.set === build.set ? 6 : 0;
        next.push({ pieces: [...b.pieces, p], score: b.score + sc + progress });
      }
    }
    next.sort((a, b) => b.score - a.score);
    beams = next.slice(0, beamSize);
  }
  let best = null;
  for (const b of beams) {
    const st = E.computeStats(charKey, weaponKey, b.pieces, ctx);
    if (!st) continue;
    const total = E.comboScore(b.pieces, build, st);
    if (!best || total > best.total) best = { pieces: b.pieces, total, stats: st };
  }
  return best;
}

function optimize(charKey, weaponKey, build, pool, opts = {}, ctx = {}) {
  // A 4-piece target build must actually use four pieces of that set.
  if (build.comp === '4pc' && build.set) {
    const have = {};
    for (const p of pool) if (p.set === build.set) have[p.slot] = true;
    if (E.SLOTS.every((s) => have[s])) {
      let best = null;
      for (const offSlot of E.SLOTS) {
        const r = optimizeCore(charKey, weaponKey, build, pool, opts, ctx, offSlot);
        if (r && (!best || r.total > best.total)) best = r;
      }
      if (best) return best;
    }
  }
  return optimizeCore(charKey, weaponKey, build, pool, opts, ctx, null);
}

function findUpgrades(charKey, weaponKey, build, best, pool, topN = 50, ctx = {}) {
  const out = [];
  for (const slot of E.SLOTS) {
    const chosen = best.pieces.find((p) => p.slot === slot);
    const others = best.pieces.filter((p) => p.slot !== slot);
    const cands = pool.filter((p) => p.slot === slot)
      .map((p) => ({ p, sc: E.pieceScore(p, build) }))
      .sort((a, b) => b.sc - a.sc)
      .slice(0, topN);
    let alt = null;
    for (const { p } of cands) {
      if (chosen && p.id === chosen.id) continue;
      const st = E.computeStats(charKey, weaponKey, [...others, p], ctx);
      const total = E.comboScore([...others, p], build, st);
      if (!alt || total > alt.total) alt = { p, total, stats: st };
    }
    if (alt && alt.total > best.total + 1) out.push({ slot, from: chosen, to: alt.p, gain: Math.round(alt.total - best.total) });
  }
  return out;
}

function scalingKey(build, goKey) {
  const c = D.chars[goKey];
  const opts = ['atk_', 'hp_', 'def_'].map((k) => ({ k, w: E.subWeight(build, k) })).sort((a, b) => b.w - a.w);
  if (opts[0].w > 0) return opts[0].k;
  return c.asc.hp_ ? 'hp_' : c.asc.def_ ? 'def_' : 'atk_';
}
function damageKeyForBuild(build, goKey) {
  const goblet = (build.goblet || []).filter((x) => x.key && x.key.endsWith('_dmg_')).sort((a, b) => b.w - a.w)[0];
  if (goblet) return goblet.key;
  const sub = (build.subs || []).filter((x) => x.key && x.key.endsWith('_dmg_')).sort((a, b) => b.w - a.w)[0];
  if (sub) return sub.key;
  return E.ELE_DMG[D.chars[goKey].ele] || null;
}

function syntheticStats(build, goKey, weaponKey, ctx, totalRolls, rollScale, mainsOverride) {
  const c = D.chars[goKey];
  const scaling = scalingKey(build, goKey);
  const mains = mainsOverride || {
    flower: 'hp',
    plume: 'atk',
    sands: (build.sands[0] && build.sands[0].key) || scaling,
    goblet: (build.goblet[0] && build.goblet[0].key) || (ctx.damageKey || E.ELE_DMG[c.ele] || scaling),
    circlet: (build.circlet[0] && build.circlet[0].key) || 'critRate_',
  };
  const mainVal = (main) => ((D.artMain['5'] || {})[main] || [])[20] || 0;
  let setA = build.set, setB = '__off__';
  if (build.comp === '2pc+2pc' && build.set) {
    const two = D.sets[build.set] && D.sets[build.set].two;
    const alt = two && Object.keys(D.sets).find((k) => k !== build.set && JSON.stringify(D.sets[k].two) === JSON.stringify(two));
    if (alt) setB = alt;
  }
  const setFor = (i) => {
    if (!build.set) return '__off__';
    if (build.comp === '2pc+2pc') return i < 2 ? setA : setB;
    return i < 4 ? build.set : '__off__';
  };
  const pieces = E.SLOTS.map((slot, i) => ({
    slot,
    main: mains[slot],
    mainVal: mainVal(mains[slot]),
    subs: [],
    set: setFor(i),
    level: 20,
    rarity: 5,
    hidden: [],
  }));
  const basePieces = pieces.map((p) => ({ ...p, subs: [] }));
  const baseSt = E.computeStats(goKey, weaponKey, basePieces, ctx);
  const erGoal = E.erTarget(build);
  const erRollVal = ((E.MAX.enerRech_ && E.MAX.enerRech_.max) || 0.0648) * rollScale;
  const erRolls = Math.max(0, Math.min(totalRolls, Math.ceil(Math.max(0, erGoal - baseSt.er) / erRollVal)));
  const remaining = Math.max(0, totalRolls - erRolls);
  const weights = E.buildWeights(build);
  const entries = Object.entries(weights).filter(([k, w]) => w > 0 && k !== 'enerRech_');
  const sum = entries.reduce((a, [, w]) => a + w, 0);
  const subs = [];
  if (erRolls > 0) subs.push({ key: 'enerRech_', val: erRolls * erRollVal });
  if (sum > 0 && remaining > 0) {
    const exact = entries.map(([k, w]) => ({ k, v: (remaining * w) / sum }));
    const counts = exact.map((x) => Math.floor(x.v));
    let rem = remaining - counts.reduce((a, b) => a + b, 0);
    const order = exact.map((x, i) => ({ i, frac: x.v - Math.floor(x.v) })).sort((a, b) => b.frac - a.frac);
    for (let j = 0; j < rem; j++) counts[order[j % order.length].i]++;
    exact.forEach((x, i) => {
      if (counts[i] > 0) subs.push({ key: x.k, val: counts[i] * ((E.MAX[x.k] && E.MAX[x.k].max) || 0) * rollScale });
    });
  }
  const bonus = { slot: '__bonus', main: null, mainVal: 0, subs, set: '__none', level: 20, rarity: 5, hidden: [] };
  return E.computeStats(goKey, weaponKey, [...pieces, bonus], ctx);
}

function syntheticBest(build, goKey, weaponKey, ctx, totalRolls, rollScale) {
  const c = D.chars[goKey];
  const scaling = scalingKey(build, goKey);
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const sands = uniq((build.sands || []).map((x) => x.key)).slice(0, 2);
  const goblet = uniq((build.goblet || []).map((x) => x.key)).slice(0, 2);
  const circlet = uniq((build.circlet || []).map((x) => x.key)).slice(0, 2);
  const sOpts = sands.length ? sands : [scaling];
  const gOpts = goblet.length ? goblet : [E.ELE_DMG[c.ele] || scaling];
  const cOpts = circlet.length ? circlet : ['critRate_'];
  if (cOpts.includes('critDMG_') && !cOpts.includes('critRate_')) cOpts.push('critRate_');
  else if (cOpts.includes('critRate_') && !cOpts.includes('critDMG_')) cOpts.push('critDMG_');
  const wCR = E.subWeight(build, 'critRate_'), wCD = E.subWeight(build, 'critDMG_');
  const useCrit = wCR > 0 && wCD > 0;
  let best = null;
  for (const s of sOpts) for (const g of gOpts) for (const cc of cOpts) {
    const st = syntheticStats(build, goKey, weaponKey, ctx, totalRolls, rollScale, { flower: 'hp', plume: 'atk', sands: s, goblet: g, circlet: cc });
    if (!st) continue;
    const scalingVal = scaling === 'hp_' ? st.hp : scaling === 'def_' ? st.def : st.atk;
    const baseVal = scaling === 'hp_' ? st.baseHP : scaling === 'def_' ? st.baseDEF : st.baseATK;
    const cr = Math.min(st.cr, 1);
    const crit = cr * Math.min(st.cd, 2 * cr);
    const score = useCrit
      ? crit * (1 + st.dmg) * (baseVal ? scalingVal / baseVal : 1)
      : scalingVal + st.hp / 10 + st.def * 2 + st.em;
    if (!best || score > best.score) best = { st, score, mains: { flower: 'hp', plume: 'atk', sands: s, goblet: g, circlet: cc } };
  }
  return best || { st: syntheticStats(build, goKey, weaponKey, ctx, totalRolls, rollScale), mains: null };
}

function targets(build, stats, goKey, weaponKey, ctx) {
  const scaling = scalingKey(build, goKey);
  const byStat = {};
  const bpRaw = D.breakpoints[norm(goKey)];
  if (bpRaw) {
    for (const b of (Array.isArray(bpRaw) ? bpRaw : [bpRaw])) {
      byStat[b.stat] = { min: b.value, ideal: b.value, note: b.note, source: b.source };
    }
  }
  if (E.subWeight(build, 'enerRech_') > 0) {
    const er = E.erTarget(build);
    byStat.enerRech_ = { min: er, ideal: er, note: 'Build ER target from the ER stat weight', source: 'build' };
  }
  const withCond = { ...ctx };
  const noCond = {
    ...ctx,
    weaponPassive: ctx.weaponPassive ? { ...ctx.weaponPassive, enabled: false } : null,
    setPassive: ctx.setPassive ? { ...ctx.setPassive, enabled: false } : null,
    talentPassive: ctx.talentPassive ? { ...ctx.talentPassive, enabled: false } : null,
  };
  const best = syntheticBest(build, goKey, weaponKey, withCond, 45, 1.0);
  const mains = best.mains;
  const minD = roundStats(syntheticStats(build, goKey, weaponKey, noCond, 24, 0.85, mains));
  const goodD = roundStats(syntheticStats(build, goKey, weaponKey, withCond, 24, 0.85, mains));
  const maxD = roundStats(best.st);
  if (!byStat.critRate_) {
    for (const st of [minD, goodD, maxD]) st.cr = Math.min(100, Math.floor(st.cr));
  }
  for (const k of ['hp', 'atk', 'def', 'cr', 'cd', 'er', 'em', 'dmg', 'healing']) {
    goodD[k] = Math.max(goodD[k], minD[k]);
    maxD[k] = Math.max(maxD[k], goodD[k]);
  }
  const statKey = scaling === 'hp_' ? 'hp' : scaling === 'def_' ? 'def' : 'atk';
  const t = {
    min: minD,
    good: goodD,
    max: maxD,
    ideal: maxD,
    byStat,
    er: { min: minD.er / 100, good: goodD.er / 100, max: maxD.er / 100 },
    cr: { min: minD.cr / 100, good: goodD.cr / 100, max: maxD.cr / 100 },
    cd: { min: minD.cd / 100, good: goodD.cd / 100, max: maxD.cd / 100 },
    scaling: { key: scaling, min: minD[statKey], good: goodD[statKey], max: maxD[statKey] },
    em: { min: minD.em, good: goodD.em, max: maxD.em },
    dmg: { min: minD.dmg / 100, good: goodD.dmg / 100, max: maxD.dmg / 100 },
  };
  if (byStat[statKey]) {
    t.scaling.min = Math.max(t.scaling.min, byStat[statKey].min);
    t.scaling.max = Math.max(t.scaling.max, byStat[statKey].ideal);
  }
  if (byStat.eleMas) t.em = { ...t.em, min: Math.max(t.em.min, byStat.eleMas.min), max: Math.max(t.em.max, byStat.eleMas.ideal) };
  if (byStat.enerRech_) t.er = { ...t.er, min: Math.max(t.er.min, byStat.enerRech_.min), max: Math.max(t.er.max, byStat.enerRech_.ideal) };
  return t;
}

function roundStats(s) {
  return {
    hp: Math.round(s.hp), atk: Math.round(s.atk), def: Math.round(s.def),
    cr: +(s.cr * 100).toFixed(1), cd: +(s.cd * 100).toFixed(1), er: +(s.er * 100).toFixed(1),
    em: Math.round(s.em), dmg: +(s.dmg * 100).toFixed(1), healing: +(s.healing * 100).toFixed(1),
  };
}

function serializePiece(p) {
  return { id: p.id, setKey: p.setKey, set: p.set, slot: p.slot, main: p.main, mainVal: E.mainValue(p), level: p.level, rarity: p.rarity, subs: p.subs, hidden: p.hidden || [], totalRolls: p.totalRolls, location: p.location, lock: p.lock };
}
const CN_NAMES = {
  '冰伤流': 'Cryo DMG', '物伤流': 'Physical DMG', '火伤流': 'Pyro DMG', '雷伤流': 'Electro DMG',
  '水伤流': 'Hydro DMG', '风伤流': 'Anemo DMG', '岩伤流': 'Geo DMG', '草伤流': 'Dendro DMG',
  '烈绽放': 'Burgeon', '超绽放': 'Hyperbloom', '绽放': 'Bloom', '蒸发': 'Vaporize', '融化': 'Melt',
  '冻结': 'Freeze', '感电': 'Electro-Charged', '超载': 'Overload', '扩散': 'Swirl',
  '带芙': 'with Furina', '纯色': 'Mono-element', '辅助': 'Support', '输出': 'DPS',
  '充能': 'ER', '精通': 'EM', '护盾': 'Shield', '治疗': 'Healing',
};

function buildLabel(b) {
  let name = b.name && b.name !== b.id ? b.name : '';
  if (name && /[\u4e00-\u9fff]/.test(name)) name = CN_NAMES[name] || '';
  const setName = b.set ? (D.setNames[b.set] || b.set) : 'Custom';
  const base = name ? `${name} · ${setName}` : setName;
  const slotOpts = (arr, n) => (arr || []).slice(0, n).map((x) => E.STAT_LABEL[x.key] || x.key);
  const mains = [...slotOpts(b.sands, 1), ...slotOpts(b.goblet, 2), ...slotOpts(b.circlet, 1)];
  const unique = [...new Set(mains)];
  const comp = b.comp === '2pc+2pc' ? ' (2pc+2pc)' : '';
  return base + comp + (unique.length ? ' · ' + unique.join(' / ') : '');
}
function serializeBuild(b) {
  return { id: b.id, label: buildLabel(b), name: b.name, set: b.set, comp: b.comp, roles: b.roles, subs: b.subs, sands: b.sands, goblet: b.goblet, circlet: b.circlet, idealRaw: E.idealRaw(b) };
}

function buildCandidates(best, build, pool, n = 5) {
  const out = {};
  for (const slot of E.SLOTS) {
    const chosen = best.pieces.find((p) => p.slot === slot);
    if (!chosen) { out[slot] = []; continue; }
    const chosenScore = E.pieceScore(chosen, build);
    const all = pool.filter((p) => p.slot === slot).map((p) => {
      const pot = E.projectArtifact(p, build);
      return { p, score: E.pieceScore(p, build), projected: pot.projected };
    });
    const maxedAll = all.filter((x) => x.p.level >= 20 && x.p.id !== chosen.id);
    const isSame = (p) => build.set && p.set === build.set;
    const maxedSame = maxedAll.filter((x) => isSame(x.p)).sort((a, b2) => b2.score - a.score).slice(0, 3);
    const maxedOther = maxedAll.filter((x) => !isSame(x.p)).sort((a, b2) => b2.score - a.score).slice(0, 2);
    const potAll = all.filter((x) => x.p.level < 20 && x.p.id !== chosen.id);
    let potSame = potAll.filter((x) => isSame(x.p)).sort((a, b2) => b2.projected - a.projected).slice(0, 3);
    let potOther = potAll.filter((x) => !isSame(x.p) && x.projected >= chosenScore - 8).sort((a, b2) => b2.projected - a.projected).slice(0, 2);
    if (potSame.length + potOther.length < 3) {
      const used = new Set([...potSame, ...potOther].map((x) => x.p.id));
      const extra = potAll.filter((x) => !used.has(x.p.id)).sort((a, b2) => b2.projected - a.projected).slice(0, 3 - (potSame.length + potOther.length));
      potOther = [...potOther, ...extra];
    }
    const chosenPot = E.projectArtifact(chosen, build);
    const mk = (x, kind) => ({ ...serializePiece(x.p), score: Math.round(x.score), projected: Math.round(x.projected), kind, sameSet: !!isSame(x.p) });
    out[slot] = [
      { ...serializePiece(chosen), score: Math.round(chosenScore), projected: Math.round(chosenPot.projected), kind: 'chosen', sameSet: !!isSame(chosen) },
      ...maxedSame.map((x) => mk(x, 'maxed')),
      ...maxedOther.map((x) => mk(x, 'maxed')),
      ...potSame.map((x) => mk(x, 'potential')),
      ...potOther.map((x) => mk(x, 'potential')),
    ];
  }
  return out;
}

function bestOwnedWeapon(weapons, key, charKey) {
  const arr = weapons.filter((w) => w.key === key);
  if (!arr.length) return null;
  const equipped = arr.find((w) => w.location === charKey);
  if (equipped) return equipped;
  const score = (w) => (w.location ? 0 : 1) + (w.level || 0) * 1000 + (w.refinement || 1) * 10;
  return arr.slice().sort((a, b) => score(b) - score(a))[0] || null;
}
function weaponInfo(key, owned) {
  const w = D.weapons[key];
  const level = owned && owned.level ? owned.level : 90;
  const ascension = owned && owned.ascension != null ? owned.ascension : 6;
  const refinement = owned && owned.refinement ? owned.refinement : 1;
  const st = E.weaponStats(key, level, ascension);
  return {
    key,
    name: (D.weaponDesc[key] && D.weaponDesc[key].name) || key.replace(/([a-z])([A-Z])/g, '$1 $2'),
    type: w ? w.type : null,
    rarity: w ? w.rarity : 3,
    level,
    ascension,
    refinement,
    location: owned ? (owned.location || '') : '',
    baseAtk: st ? st.baseAtk : 0,
    sub: st ? st.sub : null,
    passive: resolvePassive(WEAPON_PASSIVES[key], refinement),
    desc: filledDesc(key, refinement),
    preview: !owned,
  };
}
function signatureFor(goKey, recKeys) {
  const mapped = SIGNATURE_WEAPONS[norm(goKey)];
  if (mapped === false) return null;
  if (mapped && recKeys.includes(mapped)) return mapped;
  const charRarity = (D.chars[goKey] && D.chars[goKey].rarity) || 4;
  const fiveStars = recKeys.filter((k) => D.weapons[k] && D.weapons[k].rarity === 5);
  if (charRarity >= 5 && fiveStars.length === 1) return fiveStars[0];
  return null;
}
function recommendedWeaponsFor(charKey, goKey, weapons) {
  const recKeys = (D.recommendedWeapons && D.recommendedWeapons[norm(goKey)]) || [];
  if (!recKeys.length) return [];
  const sig = signatureFor(goKey, recKeys);
  const seen = new Set();
  const out = [];
  recKeys.forEach((key, order) => {
    if (seen.has(key)) return;
    seen.add(key);
    const owned = bestOwnedWeapon(weapons, key, charKey);
    out.push({ ...weaponInfo(key, owned), signature: key === sig, order });
  });
  return out.sort((a, b) => (b.signature - a.signature) || (b.rarity - a.rarity) || (a.order - b.order));
}

function percentile(sorted, value) {
  if (!sorted.length) return 0;
  let lo = 0, hi = sorted.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < value) lo = mid + 1; else hi = mid; }
  return lo / sorted.length;
}

function analyze(file, opts = {}) {
  const { chars, weapons, artifacts } = loadExport(file);
  const pool = artifacts;
  const used = new Map();
  const charResults = [];
  const skipped = [];
  const charBuildPairs = [];

  for (const c of chars) {
    const goKey = D.charNorm[norm(c.key)];
    if (!goKey) { skipped.push({ key: c.key, reason: 'no game data (new/unreleased)' }); continue; }
    const wObj = weapons.find((w) => w.location === c.key) || null;
    const weapon = wObj ? wObj.key : null;
    const passive = weapon ? resolvePassive(WEAPON_PASSIVES[weapon], wObj ? wObj.refinement : 1) : null;
    const tpDef = TALENT_PASSIVES[goKey];
    const talentPassive = tpDef && (tpDef.constellation == null || (c.constellation || 0) >= tpDef.constellation)
      ? resolvePassive(tpDef, 1)
      : null;
    const ctx = {
      charLevel: c.level || 90, charAsc: c.ascension == null ? 6 : c.ascension,
      weaponLevel: wObj && wObj.level ? wObj.level : 90,
      weaponAsc: wObj && wObj.ascension != null ? wObj.ascension : 6,
      weaponPassive: passive,
      talentPassive,
    };
    let builds = D.builds[norm(c.key)];
    if (!builds || !builds.length) builds = [fallbackBuild(goKey)];
    for (const b of builds) charBuildPairs.push({ char: c.key, goKey, build: b });

    const results = [];
    for (const b of builds) {
      const setDef = b.comp === '4pc' ? SET_PASSIVES[b.set] : null;
      const setPassive = setDef ? resolvePassive(setDef, 1) : null;
      const buildCtx = { ...ctx, damageKey: damageKeyForBuild(b, goKey), setPassive, setPassiveSet: b.set };
      const r = optimize(goKey, weapon, b, pool, opts, buildCtx);
      if (!r) continue;
      const rOff = passive ? optimize(goKey, weapon, b, pool, opts, { ...buildCtx, weaponPassive: passive ? { ...passive, enabled: false } : null }) : r;
      const ascExtra = {};
      for (const [k, arr] of Object.entries(D.chars[goKey].asc)) {
        if (!['hp', 'atk', 'def'].includes(k)) ascExtra[k] = arr[ctx.charAsc] || 0;
      }
      const cands = buildCandidates(r, b, pool);
      if (passive && rOff) {
        for (const slot of E.SLOTS) {
          const off = rOff.pieces.find((p) => p.slot === slot);
          if (off && !cands[slot].some((x) => x.id === off.id)) {
            const pot = E.projectArtifact(off, b);
            cands[slot].push({ ...serializePiece(off), score: Math.round(E.pieceScore(off, b)), projected: Math.round(pot.projected), kind: 'chosen-off', sameSet: !!(b.set && off.set === b.set) });
          }
        }
      }
      results.push({
        build: serializeBuild(b), pieces: r.pieces.map(serializePiece),
        stats: roundStats(r.stats), score: E.score300(r.total, b),
        targets: targets(b, r.stats, goKey, weapon, buildCtx),
        off: passive && rOff ? { pieces: rOff.pieces.map(serializePiece), stats: roundStats(rOff.stats), score: E.score300(rOff.total, b), targets: targets(b, rOff.stats, goKey, weapon, buildCtx) } : null,
        ctx: {
          base: E.charBase(goKey, ctx.charLevel, ctx.charAsc),
          asc: ascExtra,
          weapon: weapon ? E.weaponStats(weapon, ctx.weaponLevel, ctx.weaponAsc) : null,
          ele: D.chars[goKey].ele,
          damageKey: buildCtx.damageKey,
          weaponPassive: passive,
          setPassive,
          setPassiveSet: b.set,
          talentPassive,
        },
        slotCandidates: cands,
        _raw: r.total,
      });
      const usedPieces = rOff && rOff !== r ? [...r.pieces, ...rOff.pieces] : r.pieces;
      for (const p of usedPieces) {
        const arr = used.get(p.id) || [];
        arr.push({ char: c.key, build: buildLabel(b) + (rOff && rOff !== r && rOff.pieces.includes(p) ? ' (passive off)' : '') });
        used.set(p.id, arr);
      }
    }
    if (!results.length) { skipped.push({ key: c.key, reason: 'no artifacts for a slot' }); continue; }
    const def = results[0];
    charResults.push({
      key: c.key, goKey, level: c.level, constellation: c.constellation || 0, ele: D.chars[goKey].ele, weaponType: D.chars[goKey].weaponType, region: D.chars[goKey].region || 'unknown',
      releaseDate: D.chars[goKey].releaseDate || null,
      charScaling: D.chars[goKey].asc.hp_ ? 'hp_' : D.chars[goKey].asc.def_ ? 'def_' : 'atk_',
      talents: c.talent || { auto: 1, skill: 1, burst: 1 },
      skills: D.chars[goKey].skills || [],
      skillDescs: D.chars[goKey].skillDescs || [],
      passives: D.chars[goKey].passives || [],
      constellations: D.chars[goKey].constellations || [],
      recommendedWeapons: recommendedWeaponsFor(c.key, goKey, weapons),
      weapon, weaponLevel: wObj ? wObj.level : null, weaponRefine: wObj ? wObj.refinement : null,
      weaponDesc: weapon ? filledDesc(weapon, wObj ? wObj.refinement : 1) : '',
      builds: results.map(({ _raw, ...r }) => r),
      defaultBuild: 0,
      build: def.build, pieces: def.pieces, stats: def.stats, score: def.score, targets: def.targets,
    });
  }

  // Per-artifact best fit across all character builds.
  const artResults = [];
  for (const p of artifacts) {
    let fit = null;
    for (const pair of charBuildPairs) {
      const sc = E.pieceScore(p, pair.build);
      if (!fit || sc > fit.score) fit = { char: pair.char, build: pair.build, score: sc };
    }
    const pot = E.projectArtifact(p, fit ? fit.build : fallbackBuild('Ganyu'));
    artResults.push({ p, fit, pot });
  }

  const groups = new Map();
  for (const r of artResults) {
    const bucket = r.p.level >= 20 ? 'max' : 'unmax';
    const k = r.p.slot + '|' + r.p.main + '|' + bucket;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  for (const arr of groups.values()) {
    const byFit = arr.map((r) => (r.fit ? r.fit.score : 0)).sort((a, b) => a - b);
    const byPot = arr.map((r) => r.pot.projected).sort((a, b) => a - b);
    for (const r of arr) {
      r.fitPct = percentile(byFit, r.fit ? r.fit.score : 0);
      r.potPct = percentile(byPot, r.pot.projected);
      const u = used.get(r.p.id) || [];
      r.usedBy = u;
      if (u.length || r.p.location) r.verdict = 'KEEP';
      else if (r.p.level < 20 && r.potPct >= 0.85) r.verdict = 'LEVEL';
      else if (r.fitPct >= 0.75) r.verdict = 'KEEP';
      else {
        const ff = r.p.level >= 20 ? 0.2 : 0.35;
        const fp = r.p.level >= 20 ? 0.3 : 0.5;
        r.verdict = (r.fitPct < ff && r.potPct < fp) ? 'SALVAGE' : 'REVIEW';
      }
    }
  }
  // Safety guard: never salvage the best piece you own for a set + slot + main-stat combo.
  const bestBySetSlotMain = new Map();
  for (const r of artResults) {
    const k = r.p.set + '|' + r.p.slot + '|' + r.p.main;
    const cur = bestBySetSlotMain.get(k);
    if (!cur || r.pot.projected > cur.pot.projected) bestBySetSlotMain.set(k, r);
  }
  for (const r of artResults) {
    if (r.verdict === 'SALVAGE' && bestBySetSlotMain.get(r.p.set + '|' + r.p.slot + '|' + r.p.main) === r) r.verdict = 'REVIEW';
  }

  const artifactsOut = artResults.map((r) => ({
    id: r.p.id, setKey: r.p.setKey, slot: r.p.slot, main: r.p.main, level: r.p.level, rarity: r.p.rarity,
    subs: r.p.subs, hidden: r.p.hidden || [], totalRolls: r.p.totalRolls, location: r.p.location, lock: r.p.lock,
    fit: r.fit ? { char: r.fit.char, build: buildLabel(r.fit.build), score: Math.round(r.fit.score) } : null,
    current: Math.round(r.pot.current), projected: Math.round(r.pot.projected), ceiling: Math.round(r.pot.ceiling),
    fitPct: +(r.fitPct * 100).toFixed(0), potPct: +(r.potPct * 100).toFixed(0),
    usedBy: r.usedBy, verdict: r.verdict,
  }));

  const weaponsOut = weapons.map((w) => {
    const st = E.weaponStats(w.key, w.level || 90, w.ascension == null ? 6 : w.ascension);
    const ref = w.refinement || 1;
    return {
      key: w.key,
      name: (D.weaponDesc[w.key] && D.weaponDesc[w.key].name) || w.key.replace(/([a-z])([A-Z])/g, '$1 $2'),
      type: (D.weapons[w.key] && D.weapons[w.key].type) || null,
      rarity: D.weapons[w.key] && D.weapons[w.key].rarity,
      level: w.level || 90,
      ascension: w.ascension == null ? 6 : w.ascension,
      refinement: ref,
      location: w.location || '',
      baseAtk: st ? st.baseAtk : 0,
      sub: st ? st.sub : null,
      passive: resolvePassive(WEAPON_PASSIVES[w.key], ref),
      desc: filledDesc(w.key, ref),
    };
  });

  const summary = {
    file, chars: chars.length, analyzed: charResults.length, skipped,
    artifacts: artifacts.length,
    weapons: weaponsOut.length,
    setNames: D.setNames,
    setEffects: D.setEffects,
    setTwo: Object.fromEntries(Object.entries(D.sets).map(([k, v]) => [k, v.two])),
    breakpoints: D.breakpoints,
    artMain5: Object.fromEntries(Object.entries(D.artMain['5'] || {}).map(([k, arr]) => [k, arr[20] || 0])),
    maxRoll: Object.fromEntries(Object.entries(E.MAX).map(([k, v]) => [k, v.max])),
    verdicts: artifactsOut.reduce((a, r) => { a[r.verdict] = (a[r.verdict] || 0) + 1; return a; }, {}),
    generated: new Date().toISOString(),
  };
  return { summary, characters: charResults.sort((a, b) => b.score - a.score), artifacts: artifactsOut, weapons: weaponsOut };
}

module.exports = { analyze, loadExport, optimize, fallbackBuild, targets };
