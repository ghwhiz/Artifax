// Generates gamedata.json from a local Genshin Optimizer checkout + GGArtifact presets.
// One-time build step. No network access.
const fs = require('fs');
const path = require('path');

const GO = process.env.GO_REPO || 'C:/Users/Grant/AppData/Local/Temp/opencode/genshin-optimizer';
const GG = process.env.GG_REPO || 'C:/Users/Grant/AppData/Local/Temp/opencode/GenshinTools';
const OUT = path.join(__dirname, 'gamedata.json');

const all = JSON.parse(fs.readFileSync(GO + '/libs/gi/stats/src/allStat_gen.json', 'utf8'));
const presets = JSON.parse(fs.readFileSync(GG + '/src/config/presets/builds/[GGArtifact] 全角色配装 AllCharacterBuilds.json', 'utf8'));

// 2pc half-set -> stat map (from GGArtifact artifact2pc.ts HALF_SET_STATS)
const HALF_STATS = {
  'cryo%-15': { cryo_dmg_: 0.15 }, 'hp%-20': { hp_: 0.2 }, 'def%-30': { def_: 0.3 },
  'electro%-15': { electro_dmg_: 0.15 }, 'geo%-15': { geo_dmg_: 0.15 }, 'em-80': { eleMas: 80 },
  'atk%-18': { atk_: 0.18 }, 'phys%-25': { physical_dmg_: 0.25 }, 'hydro%-15': { hydro_dmg_: 0.15 },
  'heal%-15': { healing_: 0.15 }, 'pyro%-15': { pyro_dmg_: 0.15 }, 'er-20': { enerRech_: 0.2 },
  'anemo%-15': { anemo_dmg_: 0.15 }, 'dendro%-15': { dendro_dmg_: 0.15 }, 'cr-12': { critRate_: 0.12 },
  'skill-dmg%-20': { skill_dmg_: 0.2 }, 'burst-dmg%-20': { burst_dmg_: 0.2 },
  'na-ca-dmg%-15': { na_dmg_: 0.15 }, 'nightsoul-dmg%-15': { nightsoul_dmg_: 0.15 },
  'nightsoul-energy-6': {}, 'plunge-dmg%-25': { plunge_dmg_: 0.25 },
  'electro-res-40': { electro_res_: 0.4 }, 'pyro-res-40': { pyro_res_: 0.4 },
  'shield-35': { shield_: 0.35 },
};
// half-set id -> set ids (from GGArtifact resources.ts)
const HALF_SETS = [
  ['atk%-18', ['brave_heart','echoes_of_an_offering','resolution_of_sojourner','gladiators_finale','vermillion_hereafter','shimenawas_reminiscence','nighttime_whispers_in_the_echoing_woods','fragment_of_harmonic_whimsy','unfinished_reverie','a_day_carved_from_rising_winds','disenchantment_in_deep_shadow','scarlet_proof','heart_of_the_furnace']],
  ['em-80', ['instructor','wanderers_troupe','gilded_dreams','flower_of_paradise_lost','night_of_the_skys_unveiling','aubade_of_morningstar_and_moon']],
  ['er-20', ['scholar','the_exile','emblem_of_severed_fate','silken_moons_serenade','celestial_gift']],
  ['heal%-15', ['oceanhued_clam','maiden_beloved','song_of_days_past']],
  ['anemo%-15', ['viridescent_venerer','desert_pavilion_chronicle']],
  ['cryo%-15', ['blizzard_strayer','finale_of_the_deep_galleries']],
  ['def%-30', ['husk_of_opulent_dreams','defenders_will']],
  ['hp%-20', ['tenacity_of_the_millelith','vourukashas_glow']],
  ['hydro%-15', ['heart_of_depth','nymphs_dream']],
  ['phys%-25', ['bloodstained_chivalry','pale_flame']],
  ['cr-12', ['berserker']],
  ['dendro%-15', ['deepwood_memories']],
  ['electro%-15', ['thundering_fury']],
  ['geo%-15', ['archaic_petra']],
  ['pyro%-15', ['crimson_witch_of_flames']],
  ['skill-dmg%-20', ['gambler', 'golden_troupe']],
  ['burst-dmg%-20', ['noblesse_oblige']],
  ['na-ca-dmg%-15', ['martial_artist', 'marechaussee_hunter']],
  ['nightsoul-dmg%-15', ['obsidian_codex']],
  ['nightsoul-energy-6', ['scroll_of_the_hero_of_cinder_city']],
  ['plunge-dmg%-25', ['long_nights_oath']],
  ['electro-res-40', ['thundersoother']],
  ['pyro-res-40', ['lavawalker']],
  ['shield-35', ['retracing_bolide']],
];
const normSet = (s) => s.toLowerCase().replace(/_/g, '');
const sets = {};
for (const [hid, ids] of HALF_SETS) {
  const stats = HALF_STATS[hid] || {};
  for (const id of ids) sets[normSet(id)] = { id, half: hid, two: stats };
}
// Human-readable set names + 2pc/4pc descriptions.
const artEn = JSON.parse(fs.readFileSync(GG + '/src/generated/catalog/artifact_en.json', 'utf8'));
const setNames = {}, setEffects = {};
for (const [id, v] of Object.entries(artEn)) {
  setNames[normSet(id)] = v.name;
  setEffects[normSet(id)] = { two: v.effect2 || '', four: v.effect4 || '' };
}
const char4 = JSON.parse(fs.readFileSync(GG + '/src/generated/catalog/character_4_en.json', 'utf8'));
const char5 = JSON.parse(fs.readFileSync(GG + '/src/generated/catalog/character_5_en.json', 'utf8'));
const charStats = JSON.parse(fs.readFileSync(GG + '/src/generated/catalog/character_stats.json', 'utf8'));
const charMetaByNorm = {};
const charStatsByNorm = {};
for (const [id, v] of Object.entries({ ...char4, ...char5 })) charMetaByNorm[normSet(id)] = v;
for (const [id, v] of Object.entries(charStats)) charStatsByNorm[normSet(id)] = v;
const stripHtml = (s) => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
const wpEn = JSON.parse(fs.readFileSync(GG + '/src/generated/catalog/weapon_en.json', 'utf8'));
const wpByNorm = {};
for (const [id, v] of Object.entries(wpEn)) wpByNorm[normSet(id)] = v;
const weaponDesc = {};

// Character level-90 base stats
const chars = {};
for (const [key, c] of Object.entries(all.char.data)) {
  const base = { hp: 0, atk: 0, def: 0 };
  for (const lc of c.lvlCurves || []) {
    const curve = (all.char.expCurve[lc.curve] || [])[90] || 0;
    base[lc.key] = (base[lc.key] || 0) + lc.base * curve;
  }
  for (const k of Object.keys(base)) if (c.ascensionBonus && c.ascensionBonus[k]) base[k] += c.ascensionBonus[k][6] || 0;
  const meta = charMetaByNorm[normSet(key)] || {};
  chars[key] = {
    ele: c.ele, weaponType: c.weaponType, rarity: c.rarity, region: c.region || 'unknown',
    releaseDate: (charStatsByNorm[normSet(key)] || {}).releaseDate || null,
    lvlCurves: c.lvlCurves || [], asc: c.ascensionBonus || {}, base,
    skills: (meta.skills || []).map((x) => x.name),
    skillDescs: (meta.skills || []).map((x) => stripHtml(x.descHtml)),
    passives: (meta.passives || []).map((x) => ({ name: x.name, desc: stripHtml(x.descHtml) })),
    constellations: (meta.constellations || []).map((x) => ({ name: x.name, desc: stripHtml(x.descHtml) })),
  };
}
const charNorm = {};
for (const k of Object.keys(chars)) charNorm[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = k;
const normChar = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Weapon level-90 base ATK + substat
const weapons = {};
const weaponByNorm = {};
for (const [key, w] of Object.entries(all.weapon.data)) {
  const m = w.mainStat || (w.lvlCurves || [])[0];
  if (!m) continue;
  const mcurve = (all.weapon.expCurve[m.curve] || [])[90] || 0;
  let baseAtk = m.base * mcurve;
  if (w.ascensionBonus && w.ascensionBonus.atk) baseAtk += w.ascensionBonus.atk[6] || 0;
  const s = w.subStat;
  let sub = null;
  if (s && s.type) {
    const scurve = (all.weapon.expCurve[s.curve] || [])[90] || 0;
    sub = { key: s.type, val: s.base * scurve };
  }
  weapons[key] = {
    type: w.weaponType, rarity: w.rarity,
    mainBase: m.base, mainCurve: m.curve,
    subKey: s && s.type ? s.type : null, subBase: s ? s.base : 0, subCurve: s ? s.curve : null,
    ascAtk: (w.ascensionBonus && w.ascensionBonus.atk) || null,
    baseAtk, sub,
  };
  const g = wpByNorm[normSet(key)];
  weaponDesc[key] = g ? { name: g.name, template: g.descHtmlTpl || '', refinements: g.refinements || [] } : null;
  weaponByNorm[normSet(key)] = key;
}

// GGArtifact's per-character recommended weapon list.
const recommendedWeapons = {};
for (const [charId, ids] of Object.entries(presets.characterWeapons || {})) {
  const mapped = ids.map((id) => weaponByNorm[normSet(id)]).filter(Boolean);
  if (mapped.length) recommendedWeapons[normChar(charId)] = mapped;
}

// Artifact main/sub values by rarity
const artMain = {}, artSub = {};
for (const r of ['4', '5']) {
  artMain[r] = all.art.main[r] || {};
  if (artMain[r].heal_ && !artMain[r].healing_) artMain[r].healing_ = artMain[r].heal_;
  artSub[r] = all.art.sub[r] || {};
}

// GGArtifact build presets
const statMap = {
  'cd': 'critDMG_', 'cr': 'critRate_', 'atk%': 'atk_', 'hp%': 'hp_', 'def%': 'def_',
  'em': 'eleMas', 'er': 'enerRech_', 'heal%': 'healing_', 'phys%': 'physical_dmg_',
  'pyro%': 'pyro_dmg_', 'hydro%': 'hydro_dmg_', 'cryo%': 'cryo_dmg_', 'electro%': 'electro_dmg_',
  'anemo%': 'anemo_dmg_', 'geo%': 'geo_dmg_', 'dendro%': 'dendro_dmg_',
};
const mapWeights = (arr) => (arr || []).map((x) => ({ key: statMap[x.stat] || x.stat, w: x.weight })).filter((x) => x.w > 0);
const builds = {};
const byId = {};
for (const b of Object.values(presets.builds)) {
  if (!b.characterId) continue;
  const build = {
    id: b.id, name: b.name || '', set: b.artifactSet ? normSet(b.artifactSet) : null,
    comp: b.composition || '4pc', roles: b.roles || [], styles: b.styles || [],
    subs: mapWeights(b.substats),
    sands: mapWeights(b.sandsWeights), goblet: mapWeights(b.gobletWeights), circlet: mapWeights(b.circletWeights),
    normalizer: b.normalizer || 0,
  };
  const cid = normChar(b.characterId);
  (builds[cid] ||= []).push(build);
  byId[b.id] = build;
}
// Preserve GGArtifact's intended order (primary build first).
const ordered = {};
for (const [char, ids] of Object.entries(presets.characterBuilds)) {
  const arr = ids.map((id) => byId[id]).filter(Boolean);
  if (arr.length) ordered[normChar(char)] = arr;
}

// Fallback generic build for characters without a preset
function fallbackBuild(c) {
  const scaling = c.asc.hp_ ? 'hp_' : c.asc.def_ ? 'def_' : 'atk_';
  const subs = [
    { key: 'critRate_', w: 100 }, { key: 'critDMG_', w: 100 }, { key: scaling, w: 100 },
    { key: 'enerRech_', w: 40 }, { key: 'eleMas', w: 25 },
  ];
  const dmg = c.ele && c.ele !== 'physical' ? c.ele + '_dmg_' : 'physical_dmg_';
  return {
    id: 'fallback', name: 'Generic DPS (auto)', set: null, comp: '4pc', roles: ['dps'], styles: [],
    subs, sands: [{ key: scaling, w: 100 }], goblet: [{ key: dmg, w: 100 }],
    circlet: [{ key: 'critRate_', w: 100 }, { key: 'critDMG_', w: 100 }], normalizer: 0,
  };
}

const data = { chars, charNorm, charCurves: all.char.expCurve, weaponCurves: all.weapon.expCurve, weapons, weaponDesc, recommendedWeapons, artMain, artSub, sets, setNames, setEffects, builds: ordered, fallbackBuild: true, breakpoints: JSON.parse(fs.readFileSync(path.join(__dirname, 'breakpoints.json'), 'utf8')) };
fs.writeFileSync(OUT, JSON.stringify(data));
console.log('wrote', OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB');
console.log('verify Ganyu', chars.Ganyu);
console.log('verify Amos', weapons.AmosBow);
console.log('builds for ganyu', (builds.ganyu || []).length, 'total chars with builds', Object.keys(builds).length);
