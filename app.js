(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SLOT = { flower: 'Flower', plume: 'Plume', sands: 'Sands', goblet: 'Goblet', circlet: 'Circlet' };
  const SLOTS = ['flower', 'plume', 'sands', 'goblet', 'circlet'];
  const SLOT_GLYPH = { flower: '✿', plume: '➶', sands: '⌛', goblet: '⚱', circlet: '♛' };
  const SET_NOTE = {
    blizzardstrayer: '+20% CRIT Rate vs Cryo-affected enemies, +40% vs Frozen.',
    marechausseehunter: 'up to +36% CRIT Rate from HP changes.',
    obsidiancodex: '+40% CRIT Rate during Nightsoul\u2019s Blessing.',
    emblemofseveredfate: 'Elemental Burst DMG increased based on Energy Recharge.',
    goldentroupe: '+25% Elemental Skill DMG, +25% more while off-field.',
    crimsonwitchofflames: 'stacking Pyro DMG and reaction bonuses.',
    shimenawasreminiscence: '+50% Normal/Charged/Plunge DMG at the cost of 15 Energy.',
    gladiatorsfinale: '+35% Normal Attack DMG for sword/claymore/polearm users.',
    wandererstroupe: '+35% Charged Attack DMG for catalyst/bow users.',
    viridescentvenerer: 'Swirl DMG bonus and elemental RES shred.',
    deepwoodmemories: 'Dendro RES shred.',
    huskofopulentdreams: 'stacking DEF and Geo DMG.',
    vermillionhereafter: 'stacking ATK after losing HP.',
    desertpavilionchronicle: 'Normal/Charged/Plunge speed and DMG.',
    nymphsdream: 'stacking Hydro DMG and ATK.',
    heartofdepth: 'Hydro DMG after Skill use.',
    thunderingfury: 'reaction DMG bonuses.',
    gildedreams: 'EM and ATK/DMG based on party composition.',
    flowerofparadiselost: 'bloom reaction DMG bonuses.',
  };
  const STAT = {
    hp: 'HP', hp_: 'HP%', atk: 'ATK', atk_: 'ATK%', def: 'DEF', def_: 'DEF%',
    critRate_: 'CRIT Rate', critDMG_: 'CRIT DMG', eleMas: 'EM', enerRech_: 'Energy Recharge',
    healing_: 'Healing Bonus', physical_dmg_: 'Physical DMG', pyro_dmg_: 'Pyro DMG', hydro_dmg_: 'Hydro DMG',
    cryo_dmg_: 'Cryo DMG', electro_dmg_: 'Electro DMG', anemo_dmg_: 'Anemo DMG', geo_dmg_: 'Geo DMG',
    dendro_dmg_: 'Dendro DMG', na_dmg_: 'NA/CA DMG', ca_dmg_: 'Charged Attack DMG', plunge_dmg_: 'Plunge DMG',
    skill_dmg_: 'Skill DMG', burst_dmg_: 'Burst DMG',
    dmg_: 'All Elemental DMG', lunar_dmg_: 'Lunar Reaction DMG', lunar_critDMG_: 'Lunar Reaction CRIT DMG',
    skill_critRate_: 'Skill CRIT Rate', burst_critRate_: 'Burst CRIT Rate', na_critRate_: 'NA/CA CRIT Rate',
    plunge_critDMG_: 'Plunge CRIT DMG', shield_: 'Shield Strength',
  };
  const PCT = new Set(['hp_', 'atk_', 'def_', 'critRate_', 'critDMG_', 'enerRech_', 'healing_', 'physical_dmg_', 'pyro_dmg_', 'hydro_dmg_', 'cryo_dmg_', 'electro_dmg_', 'anemo_dmg_', 'geo_dmg_', 'dendro_dmg_', 'na_dmg_', 'ca_dmg_', 'plunge_dmg_', 'skill_dmg_', 'burst_dmg_']);
  const SHORT_STAT = { hp: 'HP', hp_: 'HP%', atk: 'ATK', atk_: 'ATK%', def: 'DEF', def_: 'DEF%', critRate_: 'CR', critDMG_: 'CD', eleMas: 'EM', enerRech_: 'ER', healing_: 'Heal', physical_dmg_: 'Phys', pyro_dmg_: 'Pyro', hydro_dmg_: 'Hydro', cryo_dmg_: 'Cryo', electro_dmg_: 'Electro', anemo_dmg_: 'Anemo', geo_dmg_: 'Geo', dendro_dmg_: 'Dendro', na_dmg_: 'NA/CA', ca_dmg_: 'CA', plunge_dmg_: 'Plunge', skill_dmg_: 'Skill', burst_dmg_: 'Burst' };
  const shortStatLabel = (k) => SHORT_STAT[k] || statLabel(k);
  const setLabel = (s) => (R.summary.setNames && R.summary.setNames[s]) || String(s || '').replace(/([a-z])([A-Z])/g, '$1 $2');
  const camel = (s) => String(s || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  const charLabel = (k) => camel(k);
  const ELE_LABEL = { anemo: 'Anemo', geo: 'Geo', electro: 'Electro', dendro: 'Dendro', hydro: 'Hydro', pyro: 'Pyro', cryo: 'Cryo' };
  const WEAPON_LABEL = { sword: 'Sword', claymore: 'Claymore', polearm: 'Polearm', bow: 'Bow', catalyst: 'Catalyst' };
  const REGION_LABEL = { mondstadt: 'Mondstadt', liyue: 'Liyue', inazuma: 'Inazuma', sumeru: 'Sumeru', fontaine: 'Fontaine', natlan: 'Natlan', 'nod-krai': 'Nod-Krai', nodkrai: 'Nod-Krai', nodKrai: 'Nod-Krai', snezhnaya: 'Snezhnaya', unknown: 'Unknown' };
  const REGION_RELEASE_DATE = { mondstadt: '2020-09-28', liyue: '2020-09-28', inazuma: '2021-07-21', sumeru: '2022-08-24', fontaine: '2023-08-16', natlan: '2024-08-28', 'nod-krai': '2025-09-10', nodkrai: '2025-09-10', nodKrai: '2025-09-10', snezhnaya: '9998-12-31', unknown: '9999-12-31' };
  const REGION_TIE_ORDER = { mondstadt: 0, liyue: 1, inazuma: 2, sumeru: 3, fontaine: 4, natlan: 5, 'nod-krai': 6, nodkrai: 6, nodKrai: 6, snezhnaya: 7, unknown: 8 };
  const eleLabel = (e) => ELE_LABEL[e] || (e ? e.charAt(0).toUpperCase() + e.slice(1) : 'Unknown');
  const weaponLabel = (w) => WEAPON_LABEL[w] || (w ? w.charAt(0).toUpperCase() + w.slice(1) : 'Unknown');
  const regionLabel = (r) => REGION_LABEL[r] || (r ? r.charAt(0).toUpperCase() + r.slice(1) : 'Unknown');
  const regionReleaseCompare = (a, b) => {
    const da = REGION_RELEASE_DATE[a] || '9997-12-31';
    const db = REGION_RELEASE_DATE[b] || '9997-12-31';
    if (da !== db) return da.localeCompare(db);
    const ta = REGION_TIE_ORDER[a] == null ? 50 : REGION_TIE_ORDER[a];
    const tb = REGION_TIE_ORDER[b] == null ? 50 : REGION_TIE_ORDER[b];
    return ta - tb || regionLabel(a).localeCompare(regionLabel(b));
  };
  const statLabel = (k) => STAT[k] || k;
  const fmtSub = (s) => `${statLabel(s.key)} <b>${PCT.has(s.key) ? (s.val * 100).toFixed(1) + '%' : Math.round(s.val)}</b>`;
  const hiddenLine = (p) => (p.hidden && p.hidden.length) ? `<div class="subs" style="color:var(--warn)">${p.hidden.map(fmtSub).join(' · ')}</div>` : '';
  const nf = (n) => Math.round(n).toLocaleString();

  const state = { tab: 'chars', subtab: 'artifacts', char: null, build: 0, verdict: 'ALL', slot: 'ALL', set: 'ALL', cleanSort: null, cleanSortDir: 1, search: '', limit: 300, setOff: false, setOption: 0, talentOff: false, talentOption: 0, listMode: 'search', filterEle: [], filterWeapon: [], filterRegion: [], sortChar: 'score', sortDir: -1, passiveOpen: {}, weaponKey: null, weaponTargets: {}, showAllStats: false, loadoutMode: 'recommended', slotCompare: {}, pickSlot: 'flower', pickId: null };
  const hasReport = () => !!(R && !R.boot && Array.isArray(R.characters) && R.characters.length > 0);
  let savedSession = false;
  const SETTINGS_KEY = 'artifactAdvisor.settings';
  function loadSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveSettings(patch) {
    const next = { ...loadSettings(), ...patch };
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) { /* storage unavailable */ }
    return next;
  }
  let SETTINGS = loadSettings();

  // ---- Local session cache (IndexedDB) ----
  const SESSION_DB_NAME = 'artifactAdvisor';
  const SESSION_STORE = 'session';
  const SESSION_SCHEMA = 1;
  let sessionDbPromise = null;
  let gameDataHashValue = null;

  function openSessionDb() {
    if (sessionDbPromise) return sessionDbPromise;
    sessionDbPromise = new Promise((resolve) => {
      try {
        if (!window.indexedDB) return resolve(null);
        const req = indexedDB.open(SESSION_DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(SESSION_STORE)) db.createObjectStore(SESSION_STORE, { keyPath: 'key' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
    return sessionDbPromise;
  }

  function sessionRequest(mode, fn) {
    return openSessionDb().then((db) => new Promise((resolve, reject) => {
      if (!db) return resolve(null);
      let tx;
      try {
        tx = db.transaction(SESSION_STORE, mode);
      } catch (e) {
        return reject(e);
      }
      let req;
      try {
        req = fn(tx.objectStore(SESSION_STORE));
      } catch (e) {
        return reject(e);
      }
      tx.oncomplete = () => resolve(req ? req.result : null);
      tx.onerror = () => reject(tx.error || new Error('Could not read local storage'));
      tx.onabort = () => reject(tx.error || new Error('Local storage transaction aborted'));
    }));
  }
  const sessionGet = (key) => sessionRequest('readonly', (store) => store.get(key));
  const sessionPut = (value) => sessionRequest('readwrite', (store) => store.put(value));
  const sessionDelete = (key) => sessionRequest('readwrite', (store) => store.delete(key));

  function hashText(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }
  function gameDataHash() {
    if (gameDataHashValue != null) return gameDataHashValue;
    try {
      gameDataHashValue = hashText(JSON.stringify((R.calc && R.calc.gamedata) || {}));
    } catch (e) {
      gameDataHashValue = 'unknown';
    }
    return gameDataHashValue;
  }
  const sessionBuildId = () => (R.calc && R.calc.buildId) || 'dev';
  function setSavedSession(on) {
    savedSession = !!on;
    renderDataMenu();
  }
  function setDataMenuOpen(open) {
    const menu = $('#dataMenu');
    const btn = $('#dataMenuBtn');
    if (menu) menu.classList.toggle('hide', !open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  async function persistSession(rawText, file, result) {
    const buildId = sessionBuildId();
    const gamedataHash = gameDataHash();
    const savedAt = Date.now();
    let saved = false;
    try {
      await sessionPut({ key: 'export', buildId, gamedataHash, schema: SESSION_SCHEMA, savedAt, file: file || '', raw: rawText });
      saved = true;
    } catch (e) {
      console.warn('Could not save this export in the browser.', e);
    }
    try {
      await sessionPut({ key: 'analysis', buildId, gamedataHash, schema: SESSION_SCHEMA, savedAt, file: file || '', result });
      saved = true;
    } catch (e) {
      console.warn('Could not cache the analysis in the browser.', e);
    }
    setSavedSession(saved);
    return saved;
  }

  async function clearSession() {
    try {
      await Promise.all([sessionDelete('export'), sessionDelete('analysis')]);
    } catch (e) {
      /* storage unavailable */
    }
    setSavedSession(false);
  }

  async function readSession() {
    try {
      const [analysis, savedExport] = await Promise.all([sessionGet('analysis'), sessionGet('export')]);
      return { analysis, savedExport };
    } catch (e) {
      return {};
    }
  }

  function applyLeftWidth() {
    const canResize = window.innerWidth > 820;
    if (canResize && typeof SETTINGS.leftWidthPct === 'number') {
      const pct = Math.max(15, Math.min(30, SETTINGS.leftWidthPct));
      document.documentElement.style.setProperty('--left-w', pct + 'vw');
    } else {
      document.documentElement.style.removeProperty('--left-w');
    }
  }
  function initLeftResize() {
    const handle = $('#colResize');
    const leftcol = $('.leftcol');
    if (!handle || !leftcol) return;
    let dragging = false;
    let startX = 0;
    let startPct = 0;
    const onMove = (e) => {
      if (!dragging) return;
      const pct = Math.max(15, Math.min(30, startPct + ((e.clientX - startX) / window.innerWidth) * 100));
      document.documentElement.style.setProperty('--left-w', pct.toFixed(2) + 'vw');
      handle.dataset.pct = String(pct);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('resizing');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const pct = Math.max(15, Math.min(30, parseFloat(handle.dataset.pct || startPct)));
      SETTINGS = saveSettings({ leftWidthPct: Math.round(pct * 100) / 100 });
    };
    handle.addEventListener('pointerdown', (e) => {
      if (window.innerWidth <= 820) return;
      e.preventDefault();
      const r = leftcol.getBoundingClientRect();
      startX = e.clientX;
      startPct = Math.max(15, Math.min(30, (r.width / window.innerWidth) * 100));
      handle.dataset.pct = String(startPct);
      dragging = true;
      document.body.classList.add('resizing');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
    window.addEventListener('resize', applyLeftWidth);
    applyLeftWidth();
  }

  function buildName(b) {
    if (b.label) return b.label;
    const mains = [b.sands && b.sands[0], b.goblet && b.goblet[0], b.circlet && b.circlet[0]].filter(Boolean).map((x) => statLabel(x.key));
    const base = b.name || (b.set ? setLabel(b.set) : 'Custom');
    return base + (mains.length ? ' · ' + mains.join(' / ') : '');
  }

  function grade(value, target) {
    if (!target || target.min == null) return null;
    const min = target.min;
    const max = target.max;
    if (max != null && max > 0 && value >= max) return { letter: 'S', cls: 's' };
    if (value >= min) return { letter: 'A', cls: 'good' };
    if (value >= min * 0.95) return { letter: 'B', cls: 'warn' };
    if (value >= min * 0.9) return { letter: 'C', cls: 'warn' };
    if (value >= min * 0.82) return { letter: 'D', cls: 'bad' };
    return { letter: 'F', cls: 'bad' };
  }

  function bdRows(sections) {
    return sections.map(([title, rows]) => {
      if (!rows.length) return '';
      return `<div class="bdsec">${title}</div>` + rows.map(([name, val]) => `<div class="bdrow"><span>${name}</span><span>${val}</span></div>`).join('');
    }).join('');
  }
  function bdAdditive(b, pct = true, baseName = 'Character') {
    if (!b) return '';
    const f = (v) => pct ? (v * 100).toFixed(1) + '%' : nf(v);
    const baseRows = b.base ? [[baseName, f(b.base)]] : [];
    const mods = [];
    if (b.asc) mods.push(['Ascension', f(b.asc)]);
    if (b.weaponSub) mods.push(['Weapon', f(b.weaponSub)]);
    if (b.artifact) mods.push(['Artifacts', f(b.artifact)]);
    const setVal = (b.setTwo || 0) + (b.setFour || 0);
    if (setVal) mods.push(['Set', f(setVal)]);
    if (b.talent) mods.push(['Talent', f(b.talent)]);
    if (b.weaponPassive) mods.push(['Passive', f(b.weaponPassive)]);
    if (b.conversion) mods.push(['Conversion', f(b.conversion)]);
    return bdRows([['Base', baseRows], ['Modifiers', mods]]);
  }
  function bdScaling(b, isAtk) {
    if (!b) return '';
    const baseRows = isAtk ? [['Character', nf(b.charBase)], ['Weapon', nf(b.weaponBase)]] : [['Character', nf(b.base)]];
    const mods = [];
    const pctLabels = [['asc', 'Ascension'], ['artifact', 'Artifacts'], ['setTwo', 'Set'], ['setFour', 'Set'], ['talent', 'Talent'], ['weaponSub', 'Weapon'], ['weaponPassive', 'Passive'], ['conversion', 'Conversion']];
    const pctSum = {};
    for (const [k, label] of pctLabels) pctSum[label] = (pctSum[label] || 0) + (b.pct[k] || 0);
    for (const [label, v] of Object.entries(pctSum)) if (v) mods.push([label, `+${(v * 100).toFixed(1)}%`]);
    const flatLabels = [['artifact', 'Flat artifacts'], ['setTwo', 'Flat set'], ['setFour', 'Flat set'], ['talent', 'Talent'], ['weaponPassive', 'Flat passive'], ['conversion', 'Conversion']];
    const flatSum = {};
    for (const [k, label] of flatLabels) flatSum[label] = (flatSum[label] || 0) + (b.flat[k] || 0);
    for (const [label, v] of Object.entries(flatSum)) if (v) mods.push([label, `+${nf(v)}`]);
    return bdRows([['Base', baseRows], ['Modifiers', mods]]);
  }
  function statCard(label, value, target, gradeInfo, bd) {
    const letter = gradeInfo && gradeInfo.letter;
    const gradeCls = gradeInfo && gradeInfo.cls;
    return `<div class="stat" tabindex="0"><div class="stathead"><div class="k">${label}${letter ? `<span class="statGrade ${gradeCls}">${letter}</span>` : ''}</div><div class="v">${value}</div>${target ? `<div class="targets">${target}</div>` : ''}</div>${bd ? `<div class="stat-pop"><div class="bd">${bd}</div></div>` : ''}</div>`;
  }
  function bindStatPopups() {
    $$('#statGrid .stat').forEach((el) => {
      if (el.dataset.popBound) return;
      el.dataset.popBound = '1';
      const place = () => {
        const pop = el.querySelector('.stat-pop');
        if (!pop) return;
        const r = el.getBoundingClientRect();
        const w = pop.offsetWidth || Math.min(280, window.innerWidth - 24);
        const h = pop.offsetHeight || 100;
        let left = r.left;
        if (left + w > window.innerWidth - 12) left = Math.max(12, r.right - w);
        let top = r.bottom + 3;
        if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 3);
        pop.style.setProperty('--pop-left', left + 'px');
        pop.style.setProperty('--pop-top', top + 'px');
      };
      el.addEventListener('mouseenter', place);
      el.addEventListener('focus', place);
    });
  }

  function statCards(b) {
    const s = b.stats, t = b.targets, bd = b.breakdown;
    const gs = b.gradeStats;
    const gv = gs ? { hp: gs.hp, atk: gs.atk, def: gs.def, cr: gs.cr, cd: gs.cd, er: gs.er, em: gs.em, dmg: gs.dmg } : { hp: s.hp, atk: s.atk, def: s.def, cr: s.cr / 100, cd: s.cd / 100, er: s.er / 100, em: s.em, dmg: s.dmg / 100 };
    const tv = { hp: s.hp, atk: s.atk, def: s.def, cr: s.cr / 100, cd: s.cd / 100, er: s.er / 100, em: s.em, dmg: s.dmg / 100 };
    const cards = [];
    const pctv = (v) => (+v).toFixed(1) + '%';
    const pct0 = (v) => (+v * 100).toFixed(0) + '%';
    const line = (bpKey, gKey, fmt, bpFmt) => {
      const bp = t.byStat && t.byStat[bpKey];
      const mn = t.min ? t.min[gKey] : null;
      const gd = t.good ? t.good[gKey] : null;
      const mx = t.max ? t.max[gKey] : null;
      const bpVal = bp ? (bpKey === 'enerRech_' ? bp.min * 100 : bp.min) : null;
      const plus = (gKey === 'cr' && mx != null && mx >= 100) ? '' : '+';
      const parts = [];
      if (bp) {
        parts.push(`min ${(bpFmt || fmt)(bp.min)}`);
        if (gd != null && gd > bpVal + 0.05 && (mx == null || gd < mx - 0.05)) parts.push(`good ${fmt(gd)}`);
        if (mx != null) parts.push(`max ${fmt(mx)}${plus}${mx < bpVal - 0.05 ? ' ⚠' : ''}`);
      } else {
        if (mn != null) parts.push(`min ${fmt(mn)}`);
        if (mx != null) parts.push(`max ${fmt(mx)}${plus}`);
      }
      return parts.join('<br>');
    };
    const minFor = (bpKey, gKey, scale, allow = true) => {
      const bp = t.byStat && t.byStat[bpKey];
      if (bp) return bp.min;
      if (!allow) return null;
      const mn = t.min ? t.min[gKey] : null;
      return mn == null ? null : mn * scale;
    };
    const build = b.build || {};
    const isScaling = (k) => !!(t.scaling && t.scaling.key === k);
    const hasBp = (k) => !!(t.byStat && t.byStat[k]);
    const weighted = (k) => {
      if (subW(build, k) > 0) return true;
      for (const arr of [build.subs, build.sands, build.goblet, build.circlet]) {
        for (const x of arr || []) if (x.key === k && x.w > 0) return true;
      }
      return false;
    };
    const pick = (bpKey, key) => (hasBp(bpKey) ? tv[key] : gv[key]);
    const scaling = (t.scaling && t.scaling.key) || 'atk_';
    const all = !!b.showAll;
    const maxOf = (key, scale = 1) => (t.max && t.max[key] != null ? t.max[key] * scale : null);
    const showHp = all || scaling === 'hp_' || weighted('hp_') || weighted('hp') || hasBp('hp');
    const passiveAtk = !!(bd && bd.atk && (
      (bd.atk.flat && (bd.atk.flat.conversion || bd.atk.flat.talent))
      || (bd.atk.pct && (bd.atk.pct.conversion || bd.atk.pct.talent))
    ));
    const passiveEm = !!(bd && bd.em && (bd.em.weaponPassive || bd.em.talent || bd.em.conversion));
    const showAtk = all || scaling === 'atk_' || weighted('atk_') || weighted('atk') || hasBp('atk') || passiveAtk || !!(b.hints && b.hints.atk);
    const showDef = all || scaling === 'def_' || weighted('def_') || weighted('def') || hasBp('def');
    const showCrit = all || weighted('critRate_') || weighted('critDMG_') || hasBp('critRate_') || hasBp('critDMG_');
    const showEr = all || weighted('enerRech_') || hasBp('enerRech_') || (t.er && t.er.min > 1.001);
    const showEm = all || weighted('eleMas') || hasBp('eleMas') || passiveEm || !!(b.hints && b.hints.em);
    const showDmg = all || (build.goblet || []).some((x) => x.key && x.key.endsWith('_dmg_') && x.w > 0)
      || (build.subs || []).some((x) => x.key && x.key.endsWith('_dmg_') && x.w > 0)
      || !!(t.max && t.max.dmg > 0);
    const showHealing = all || weighted('healing_') || !!(t.max && t.max.healing > 0);
    if (showHp) {
      const hpLine = (all || isScaling('hp_') || hasBp('hp')) ? line('hp', 'hp', nf) : '';
      const hpMin = minFor('hp', 'hp', 1, all || isScaling('hp_') || hasBp('hp'));
      cards.push(statCard('HP', nf(s.hp), hpLine, hpMin != null ? grade(pick('hp', 'hp'), { min: hpMin, max: maxOf('hp') }) : null, bd && bdScaling(bd.hp, false)));
    }
    if (showAtk) {
      const atkLine = (all || isScaling('atk_') || hasBp('atk')) ? line('atk', 'atk', nf) : '';
      const atkMin = minFor('atk', 'atk', 1, all || isScaling('atk_') || hasBp('atk'));
      cards.push(statCard('ATK', nf(s.atk), atkLine, atkMin != null ? grade(pick('atk', 'atk'), { min: atkMin, max: maxOf('atk') }) : null, bd && bdScaling(bd.atk, true)));
    }
    if (showDef) {
      const defLine = (all || isScaling('def_') || hasBp('def')) ? line('def', 'def', nf) : '';
      const defMin = minFor('def', 'def', 1, all || isScaling('def_') || hasBp('def'));
      cards.push(statCard('DEF', nf(s.def), defLine, defMin != null ? grade(pick('def', 'def'), { min: defMin, max: maxOf('def') }) : null, bd && bdScaling(bd.def, false)));
    }
    if (showCrit) {
      const crWarn = s.crRaw && s.crRaw > 1.001 ? `<span style="color:var(--warn)"> · overcap ${(s.crRaw * 100).toFixed(0)}%</span>` : '';
      const crMin = minFor('cr', 'cr', 1 / 100, all || showCrit);
      cards.push(statCard('CRIT Rate', s.cr + '%', line('cr', 'cr', pctv) + crWarn, crMin != null ? grade(pick('critRate_', 'cr'), { min: crMin, max: maxOf('cr', 1 / 100) }) : null, bd && bdAdditive(bd.cr, true)));
      const cdMin = minFor('cd', 'cd', 1 / 100, all || showCrit);
      cards.push(statCard('CRIT DMG', s.cd + '%', line('cd', 'cd', pctv), cdMin != null ? grade(pick('critDMG_', 'cd'), { min: cdMin, max: maxOf('cd', 1 / 100) }) : null, bd && bdAdditive(bd.cd, true)));
    }
    if (showEr) {
      const erMin = minFor('enerRech_', 'er', 1 / 100, all || showEr);
      cards.push(statCard('Energy Recharge', s.er + '%', line('enerRech_', 'er', pctv, pct0), erMin != null ? grade(pick('enerRech_', 'er'), { min: erMin, max: maxOf('er', 1 / 100) }) : null, bd && bdAdditive(bd.er, true)));
    }
    if (showEm) {
      const emLine = (all || (t.max && t.max.em > 0)) ? line('eleMas', 'em', nf) : '';
      const emMin = minFor('eleMas', 'em', 1, all || showEm);
      cards.push(statCard('Elemental Mastery', nf(s.em), emLine, emMin != null ? grade(pick('eleMas', 'em'), { min: emMin, max: maxOf('em') }) : null, bd && bdAdditive(bd.em, false)));
    }
    if (showDmg) {
      const dmgMin = minFor('dmg', 'dmg', 1 / 100, all || showDmg);
      const dmgLabel = DMG_LABEL[s.damageKey] || 'Elemental / Phys DMG';
      cards.push(statCard(dmgLabel, s.dmg + '%', line('dmg', 'dmg', pctv), dmgMin != null ? grade(pick('dmg', 'dmg'), { min: dmgMin, max: maxOf('dmg', 1 / 100) }) : null, bd && bdAdditive(bd.dmg, true)));
    }
    if (showHealing) cards.push(statCard('Healing Bonus', s.healing + '%', '', null, bd && bdAdditive(bd.healing, true)));
    return cards.join('');
  }
  function helpq(text) {
    return `<span class="helpq" tabindex="0" data-tip="${esc(text)}">?</span>`;
  }
  function helpqRight(text) {
    return `<span class="helpq help-right" tabindex="0" data-tip="${esc(text)}">?</span>`;
  }
  function showHelpTip(el) {
    const tip = $('#helpTip');
    const text = el && el.dataset ? el.dataset.tip : '';
    if (!tip || !text) return;
    tip.textContent = text;
    tip.classList.add('show');
    const r = el.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let left = Math.max(12, Math.min(r.left, window.innerWidth - 12 - w));
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 12) top = r.top - h - 6;
    top = Math.max(12, Math.min(top, window.innerHeight - 12 - h));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideHelpTip() {
    const tip = $('#helpTip');
    if (tip) tip.classList.remove('show');
  }
  function targetHelpText(t) {
    const entries = Object.entries(t.byStat || {}).filter(([, v]) => v.note);
    const base = 'Min = 24-roll build with weapon base/substat and always-active passives, but no conditional weapon/set/character passives (out-of-combat). Max = 45-roll build with conditional passives at their default (usually max) stacks. Kit breakpoints replace the min; "good" appears only when it adds a goal between a kit min and max.';
    if (!entries.length) return base;
    const val = (k, v) => k === 'enerRech_' ? (v * 100).toFixed(0) + '%' : nf(v);
    const labels = entries.map(([k, v]) => `${statLabel(k)} ${val(k, v.min)}${v.source === 'build' ? ' (build target)' : ''} — ${v.note} (${v.source || 'kit'})`).join(' · ');
    return `${base} Breakpoints: ${labels}`;
  }

  // ---- Browser-side stat + score math (mirrors engine.js) ----
  const MAXC = {
    hp: { max: 298.75 }, atk: { max: 19.45 }, def: { max: 23.15 },
    hp_: { max: 0.0583 }, atk_: { max: 0.0583 }, def_: { max: 0.0729 },
    critRate_: { max: 0.0389 }, critDMG_: { max: 0.0777 }, eleMas: { max: 23.31 }, enerRech_: { max: 0.0648 },
    healing_: { max: 0.359, main: 1 }, physical_dmg_: { max: 0.583, main: 1 },
    pyro_dmg_: { max: 0.466, main: 1 }, hydro_dmg_: { max: 0.466, main: 1 }, cryo_dmg_: { max: 0.466, main: 1 },
    electro_dmg_: { max: 0.466, main: 1 }, anemo_dmg_: { max: 0.466, main: 1 }, geo_dmg_: { max: 0.466, main: 1 }, dendro_dmg_: { max: 0.466, main: 1 },
  };
  const ELE = { pyro: 'pyro_dmg_', hydro: 'hydro_dmg_', cryo: 'cryo_dmg_', electro: 'electro_dmg_', anemo: 'anemo_dmg_', geo: 'geo_dmg_', dendro: 'dendro_dmg_', physical: 'physical_dmg_' };
  const DMG_LABEL = {
    pyro_dmg_: 'Pyro DMG', hydro_dmg_: 'Hydro DMG', cryo_dmg_: 'Cryo DMG', electro_dmg_: 'Electro DMG',
    anemo_dmg_: 'Anemo DMG', geo_dmg_: 'Geo DMG', dendro_dmg_: 'Dendro DMG', physical_dmg_: 'Physical DMG',
    dmg_: 'Elemental DMG',
  };
  const wcache = new WeakMap();
  const cdeq = (k, v) => { const m = MAXC[k]; return m ? (v / m.max) * (m.main ? 62.1 : 7.77) : 0; };
  function weightsOf(b) {
    if (wcache.has(b)) return wcache.get(b);
    const w = {};
    for (const s of b.subs) w[s.key] = Math.max(w[s.key] || 0, s.w);
    wcache.set(b, w);
    return w;
  }
  function subW(b, k) {
    const w = weightsOf(b);
    if (w[k] != null) return w[k];
    if (k === 'hp') return (w.hp_ || 0) * 0.3;
    if (k === 'atk') return (w.atk_ || 0) * 0.3;
    if (k === 'def') return (w.def_ || 0) * 0.3;
    return 0;
  }
  function pieceSc(p, b) {
    let score = 0;
    const sw = p.slot === 'sands' ? b.sands : p.slot === 'goblet' ? b.goblet : p.slot === 'circlet' ? b.circlet : null;
    if (sw) { const mw = sw.find((x) => x.key === p.main); if (mw) score += 62.1 * mw.w / 100; }
    for (const s of p.subs) { const w = subW(b, s.key); if (w) score += cdeq(s.key, s.val) * w / 100; }
    return score;
  }
  function setBonusSc(pieces, b) {
    const c = {};
    for (const p of pieces) c[p.set] = (c[p.set] || 0) + 1;
    let s = 0;
    if (b.set) {
      const n = c[b.set] || 0;
      if (n >= 4 && b.comp === '4pc') s += 45; else if (n >= 4) s += 18; else if (n >= 2) s += 8;
    }
    if (b.comp === '2pc+2pc') {
      let twos = 0;
      for (const [k, n] of Object.entries(c)) if (n >= 2 && R.summary.setTwo[k]) twos++;
      if (twos >= 2) s += 14;
    }
    return s;
  }
  function comboSc(pieces, b) {
    let s = 0;
    for (const p of pieces) s += pieceSc(p, b);
    return s + setBonusSc(pieces, b);
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
  function selectPassive(p, idx, enabled) {
    if (!p) return null;
    const opt = p.options ? (p.options[idx] || p.options[0]) : null;
    if (p.optionsAlways && opt) {
      return {
        ...p,
        enabled,
        always: mergeEffects(p.alwaysBase || p.always, opt),
        stats: {},
        conversions: [],
        damage: {},
      };
    }
    return {
      ...p,
      enabled,
      stats: opt ? opt.stats : (p.stats || {}),
      conversions: opt ? opt.conversions : (p.conversions || []),
      damage: opt ? opt.damage : (p.damage || {}),
    };
  }
  function passiveTouchesStat(p, keys) {
    if (!p) return false;
    for (const e of [p.always, p, ...(p.options || [])]) {
      if (!e) continue;
      if (Object.keys(e.stats || {}).some((k) => keys.includes(k))) return true;
      if ((e.conversions || []).some((cv) => keys.includes(cv.to))) return true;
    }
    return false;
  }
  function passiveFor(ctx, mode) {
    return selectPassive(ctx.weaponPassive, mode.weaponOption || 0, !mode.weaponOff);
  }
  function setPassiveFor(ctx, pieces, mode) {
    const p = ctx.setPassive;
    if (!p) return null;
    const setId = ctx.setPassiveSet;
    if (!setId || pieces.filter((x) => x.set === setId).length < 4) return null;
    return selectPassive(p, mode.setOption || 0, !mode.setOff);
  }
  function talentPassiveFor(ctx, mode) {
    return selectPassive(ctx.talentPassive, mode.talentOption || 0, !mode.talentOff);
  }
  function computeStats(pieces, ctx, mode) {
    const src = { artifact: {}, setTwo: {}, setFour: {}, asc: {}, weaponSub: {}, weaponPassive: {}, talent: {}, conversion: {} };
    const addTo = (obj, o) => { for (const [k, val] of Object.entries(o)) obj[k] = (obj[k] || 0) + val; };
    for (const p of pieces) {
      const ps = {};
      if (p.main) ps[p.main] = (ps[p.main] || 0) + (p.mainVal || 0);
      for (const s of p.subs) ps[s.key] = (ps[s.key] || 0) + s.val;
      addTo(src.artifact, ps);
    }
    const counts = {};
    for (const p of pieces) counts[p.set] = (counts[p.set] || 0) + 1;
    for (const [set, n] of Object.entries(counts)) {
      if (n >= 2 && R.summary.setTwo[set]) addTo(src.setTwo, R.summary.setTwo[set]);
    }
    addTo(src.asc, ctx.asc || {});
    if (ctx.weapon && ctx.weapon.sub) addTo(src.weaponSub, { [ctx.weapon.sub.key]: ctx.weapon.sub.val });
    const wp = passiveFor(ctx, mode);
    const sp = setPassiveFor(ctx, pieces, mode);
    const tp = talentPassiveFor(ctx, mode);
    const addPassive = (target, p) => {
      if (!p) return;
      addTo(target, (p.always && p.always.stats) || {});
      if (p.enabled !== false) addTo(target, p.stats || {});
    };
    addPassive(src.weaponPassive, wp);
    addPassive(src.setFour, sp);
    addPassive(src.talent, tp);
    const v = {};
    for (const [s, o] of Object.entries(src)) {
      if (s === 'conversion') continue;
      addTo(v, o);
    }
    const baseHP = ctx.base.hp, baseATK = ctx.base.atk + ((ctx.weapon && ctx.weapon.baseAtk) || 0), baseDEF = ctx.base.def;
    const hp0 = baseHP * (1 + (v.hp_ || 0)) + (v.hp || 0);
    const atk0 = baseATK * (1 + (v.atk_ || 0)) + (v.atk || 0);
    const def0 = baseDEF * (1 + (v.def_ || 0)) + (v.def || 0);
    const em0 = v.eleMas || 0;
    const er0 = 1 + (v.enerRech_ || 0);
    for (const pss of [wp, sp, tp]) {
      if (!pss) continue;
      const conversions = [...((pss.always && pss.always.conversions) || [])];
      if (pss.enabled !== false) conversions.push(...(pss.conversions || []));
      for (const c of conversions) {
        const fromVal = c.from === 'hp' ? hp0 : c.from === 'eleMas' ? em0 : c.from === 'def' ? def0 : c.from === 'er' ? er0 : c.from === 'atk' ? atk0 : 0;
        const raw = fromVal - (c.above || 0);
        if (raw <= 0) continue;
        let add = raw * (c.ratio || 0);
        if (c.cap != null) add = Math.min(add, c.cap);
        v[c.to] = (v[c.to] || 0) + add;
        src.conversion[c.to] = (src.conversion[c.to] || 0) + add;
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
    const goblet = pieces.find((p) => p.slot === 'goblet');
    const damageKey = (goblet && goblet.main && goblet.main.endsWith('_dmg_'))
      ? goblet.main
      : (ctx.damageKey || ELE[ctx.ele] || 'dmg_');
    const dmg = (v[damageKey] || 0) + (v.dmg_ || 0);
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
      for (const s of addSources) { o[s] = val(s, damageKey) + val(s, 'dmg_'); o.total += o[s]; }
      return o;
    };
    return {
      hp, atk, def, cr, crRaw, cd, er, em, dmg, damageKey,
      baseHP, baseATK, baseDEF,
      healing: v.healing_ || 0,
      raw: v,
      breakdown: {
        hp: { base: baseHP, pct: pctObj('hp_'), flat: flatObj('hp'), total: hp },
        atk: { charBase: ctx.base.atk, weaponBase: (ctx.weapon && ctx.weapon.baseAtk) || 0, pct: pctObj('atk_'), flat: flatObj('atk'), total: atk },
        def: { base: baseDEF, pct: pctObj('def_'), flat: flatObj('def'), total: def },
        cr: addObj('critRate_', 0.05),
        cd: addObj('critDMG_', 0.5),
        er: addObj('enerRech_', 1),
        em: addObj('eleMas', 0),
        dmg: dmgObj(),
        healing: addObj('healing_', 0),
      },
    };
  }
  function erTargetOf(b) {
    const w = weightsOf(b);
    const x = w.enerRech_ || 0;
    return x >= 80 ? 1.6 : x >= 50 ? 1.45 : x > 0 ? 1.25 : 1.0;
  }
  function scoreOf(pieces, br, mode) {
    const st = computeStats(pieces, br.ctx, mode);
    const raw = comboSc(pieces, br.build) - Math.max(0, erTargetOf(br.build) - st.er) * 300;
    return Math.round((raw / (br.build.idealRaw || 1)) * 300);
  }

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const TARGET_MODE_ON = { weaponOff: false, weaponOption: 0, setOff: false, setOption: 0, talentOff: false, talentOption: 0 };
  const TARGET_MODE_OFF = { weaponOff: true, weaponOption: 0, setOff: true, setOption: 0, talentOff: true, talentOption: 0 };
  function roundTargetStats(s) {
    return {
      hp: Math.round(s.hp), atk: Math.round(s.atk), def: Math.round(s.def),
      cr: +(s.cr * 100).toFixed(1), cd: +(s.cd * 100).toFixed(1), er: +(s.er * 100).toFixed(1),
      em: Math.round(s.em), dmg: +(s.dmg * 100).toFixed(1), healing: +(s.healing * 100).toFixed(1),
    };
  }
  function scalingKeyFor(build, c) {
    const opts = ['atk_', 'hp_', 'def_'].map((k) => ({ k, w: subW(build, k) })).sort((a, b) => b.w - a.w);
    if (opts[0].w > 0) return opts[0].k;
    return c.charScaling || 'atk_';
  }
  function damageKeyForBuildClient(build, goKey) {
    const goblet = (build.goblet || []).filter((x) => x.key && x.key.endsWith('_dmg_')).sort((a, b) => b.w - a.w)[0];
    if (goblet) return goblet.key;
    const sub = (build.subs || []).filter((x) => x.key && x.key.endsWith('_dmg_')).sort((a, b) => b.w - a.w)[0];
    if (sub) return sub.key;
    return ELE[GD().chars[goKey].ele] || null;
  }
  function syntheticStatsFor(build, ctx, c, mode, totalRolls, rollScale, mainsOverride) {
    const scaling = scalingKeyFor(build, c);
    const mains = mainsOverride || {
      flower: 'hp',
      plume: 'atk',
      sands: (build.sands[0] && build.sands[0].key) || scaling,
      goblet: (build.goblet[0] && build.goblet[0].key) || (ctx.damageKey || ELE[c.ele] || scaling),
      circlet: (build.circlet[0] && build.circlet[0].key) || 'critRate_',
    };
    const mainVal = (main) => (R.summary.artMain5 && R.summary.artMain5[main]) || 0;
    let setA = build.set, setB = '__off__';
    if (build.comp === '2pc+2pc' && build.set) {
      const two = JSON.stringify((R.summary.setTwo && R.summary.setTwo[build.set]) || {});
      const alt = Object.keys(R.summary.setTwo || {}).find((k) => k !== build.set && JSON.stringify(R.summary.setTwo[k] || {}) === two);
      if (alt) setB = alt;
    }
    const setFor = (i) => {
      if (!build.set) return '__off__';
      if (build.comp === '2pc+2pc') return i < 2 ? setA : setB;
      return i < 4 ? build.set : '__off__';
    };
    const pieces = SLOTS.map((slot, i) => ({
      slot,
      main: mains[slot],
      mainVal: mainVal(mains[slot]),
      subs: [],
      set: setFor(i),
      level: 20,
      rarity: 5,
      hidden: [],
    }));
    const baseSt = computeStats(pieces, ctx, mode);
    const erGoal = erTargetOf(build);
    const erRollVal = ((R.summary.maxRoll && R.summary.maxRoll.enerRech_) || 0.0648) * rollScale;
    const erRolls = Math.max(0, Math.min(totalRolls, Math.ceil(Math.max(0, erGoal - baseSt.er) / erRollVal)));
    const remaining = Math.max(0, totalRolls - erRolls);
    const weights = weightsOf(build);
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
        if (counts[i] > 0) subs.push({ key: x.k, val: counts[i] * ((R.summary.maxRoll && R.summary.maxRoll[x.k]) || 0) * rollScale });
      });
    }
    const bonus = { slot: '__bonus', main: null, mainVal: 0, subs, set: '__none', level: 20, rarity: 5, hidden: [] };
    return computeStats([...pieces, bonus], ctx, mode);
  }
  function syntheticBestFor(build, ctx, c, mode, totalRolls, rollScale) {
    const scaling = scalingKeyFor(build, c);
    const uniq = (a) => [...new Set(a.filter(Boolean))];
    const sands = uniq((build.sands || []).map((x) => x.key)).slice(0, 2);
    const goblet = uniq((build.goblet || []).map((x) => x.key)).slice(0, 2);
    const circlet = uniq((build.circlet || []).map((x) => x.key)).slice(0, 2);
    const sOpts = sands.length ? sands : [scaling];
    const gOpts = goblet.length ? goblet : [ELE[c.ele] || scaling];
    const cOpts = circlet.length ? circlet : ['critRate_'];
    if (cOpts.includes('critDMG_') && !cOpts.includes('critRate_')) cOpts.push('critRate_');
    else if (cOpts.includes('critRate_') && !cOpts.includes('critDMG_')) cOpts.push('critDMG_');
    const useCrit = subW(build, 'critRate_') > 0 && subW(build, 'critDMG_') > 0;
    let best = null;
    for (const s of sOpts) for (const g of gOpts) for (const cc of cOpts) {
      const st = syntheticStatsFor(build, ctx, c, mode, totalRolls, rollScale, { flower: 'hp', plume: 'atk', sands: s, goblet: g, circlet: cc });
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
    return best || { st: syntheticStatsFor(build, ctx, c, mode, totalRolls, rollScale), mains: null };
  }
  function targetsFor(build, ctx, c) {
    const scaling = scalingKeyFor(build, c);
    const byStat = {};
    const bpRaw = R.summary.breakpoints && R.summary.breakpoints[norm(c.goKey)];
    if (bpRaw) {
      for (const b of (Array.isArray(bpRaw) ? bpRaw : [bpRaw])) {
        byStat[b.stat] = { min: b.value, ideal: b.value, note: b.note, source: b.source };
      }
    }
    if (subW(build, 'enerRech_') > 0) {
      const er = erTargetOf(build);
      byStat.enerRech_ = { min: er, ideal: er, note: 'Build ER target from the ER stat weight', source: 'build' };
    }
    const best = syntheticBestFor(build, ctx, c, TARGET_MODE_ON, 45, 1.0);
    const minD = roundTargetStats(syntheticStatsFor(build, ctx, c, TARGET_MODE_OFF, 24, 0.85, best.mains));
    const goodD = roundTargetStats(syntheticStatsFor(build, ctx, c, TARGET_MODE_ON, 24, 0.85, best.mains));
    const maxD = roundTargetStats(best.st);
    if (!byStat.critRate_) for (const st of [minD, goodD, maxD]) st.cr = Math.min(100, Math.floor(st.cr));
    for (const k of ['hp', 'atk', 'def', 'cr', 'cd', 'er', 'em', 'dmg', 'healing']) {
      goodD[k] = Math.max(goodD[k], minD[k]);
      maxD[k] = Math.max(maxD[k], goodD[k]);
    }
    const statKey = scaling === 'hp_' ? 'hp' : scaling === 'def_' ? 'def' : 'atk';
    const t = {
      min: minD, good: goodD, max: maxD, ideal: maxD, byStat,
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
  function statCardsFor(st, t, gs, build, hints) {
    const s = {
      hp: Math.round(st.hp), atk: Math.round(st.atk), def: Math.round(st.def),
      cr: +(st.cr * 100).toFixed(1), crRaw: st.crRaw || st.cr, cd: +(st.cd * 100).toFixed(1), er: +(st.er * 100).toFixed(1),
      em: Math.round(st.em), dmg: +(st.dmg * 100).toFixed(1), damageKey: st.damageKey, healing: +(st.healing * 100).toFixed(1),
    };
    return statCards({ stats: s, targets: t, breakdown: st.breakdown, gradeStats: gs, build, hints, showAll: !!(hints && hints.showAll) });
  }
  function deltaText(sel, rec) {
    const rows = [
      ['ATK', Math.round(sel.atk - rec.atk)], ['HP', Math.round(sel.hp - rec.hp)], ['DEF', Math.round(sel.def - rec.def)],
      ['CR', +((sel.cr - rec.cr) * 100).toFixed(1)], ['CD', +((sel.cd - rec.cd) * 100).toFixed(1)],
      ['ER', +((sel.er - rec.er) * 100).toFixed(1)], ['EM', Math.round(sel.em - rec.em)],
      ['DMG', +((sel.dmg - rec.dmg) * 100).toFixed(1)],
    ];
    return rows.filter(([, v]) => Math.abs(v) >= 0.1).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(' · ');
  }
  function breaks4pc(pieces, bd) {
    if (!bd.set || bd.comp !== '4pc') return false;
    return pieces.filter((p) => p.set === bd.set).length < 4;
  }
  function cleanSkillName(s) {
    return String(s || '').replace(/^[AEQ]\.\s*/, '');
  }
  function talentBonuses(c) {
    const out = { auto: { n: 0, con: null }, skill: { n: 0, con: null }, burst: { n: 0, con: null } };
    const skills = c.skills || [];
    for (const idx of [2, 4]) {
      if ((c.constellation || 0) <= idx) continue;
      const desc = ((c.constellations || [])[idx] || {}).desc || '';
      const m = desc.match(/Increases the Level of (.+?) by 3/i);
      if (!m) continue;
      const target = m[1].toLowerCase();
      const si = skills.findIndex((s) => {
        const clean = cleanSkillName(s).toLowerCase();
        return clean === target || clean.includes(target) || target.includes(clean);
      });
      let key = null;
      const skill = si >= 0 ? skills[si] : '';
      if (/^A\./i.test(skill)) key = 'auto';
      else if (/^E\./i.test(skill)) key = 'skill';
      else if (/^Q\./i.test(skill)) key = 'burst';
      if (!key) {
        if (target.includes('normal attack')) key = 'auto';
        else if (target.includes('elemental skill')) key = 'skill';
        else if (target.includes('elemental burst')) key = 'burst';
      }
      if (key) {
        out[key].n += 3;
        out[key].con = idx + 1;
      }
    }
    return out;
  }
  function talentsPane(c, br) {
    const t = c.talents || {};
    const bonuses = talentBonuses(c);
    const skills = c.skills && c.skills.length ? c.skills : ['Normal Attack', 'Elemental Skill', 'Elemental Burst'];
    const findSkill = (prefix, fallback) => {
      const i = skills.findIndex((s) => new RegExp(`^${prefix}\\.\\s*`, 'i').test(s));
      const idx = i >= 0 ? i : fallback;
      return { name: skills[idx] || '', idx };
    };
    const auto = findSkill('A', 0);
    const skill = findSkill('E', 1);
    const burst = findSkill('Q', 2);
    const levels = [
      ['Normal Attack', auto.name, t.auto || 1, bonuses.auto, auto.idx],
      ['Elemental Skill', skill.name, t.skill || 1, bonuses.skill, skill.idx],
      ['Elemental Burst', burst.name, t.burst || 1, bonuses.burst, burst.idx],
    ];
    const descs = c.skillDescs || [];
    const rows = levels.map(([label, skillName, base, bonus, descIdx]) => {
      const eff = Math.min(15, base + bonus.n);
      const bonusText = bonus.n ? `Base ${base} · C${bonus.con} +${bonus.n}` : `Base ${base}`;
      return `<details class="talentCard">
        <summary class="talentSummary">
          <span class="talentName"><b>${esc(label)}</b><span class="small muted">${esc(cleanSkillName(skillName))}</span></span>
          <span class="talentLevels"><b>Lv ${eff}</b><span>${bonusText}</span></span>
        </summary>
        <div class="talentDesc">${descs[descIdx] ? esc(descs[descIdx]) : 'No description available.'}</div>
      </details>`;
    }).join('');
    const passives = (c.passives || []).map((p) => `<div class="conCard">
      <div class="conTop"><span class="conName">${esc(p.name)}</span></div>
      <div class="conDesc">${esc(p.desc)}</div>
    </div>`).join('');
    const modeled = br && br.ctx && br.ctx.talentPassive && br.ctx.talentPassive.note;
    return `<h2 style="margin:0 0 6px">Talents</h2>
      <div class="small muted" style="margin-bottom:10px">Talent levels affect ability damage and healing multipliers. They do not change the character stat sheet; modeled character and constellation passives are already included in the Artifacts view.</div>
      ${rows}
      ${modeled ? `<div class="talentModeled"><b>Modeled character passive:</b> ${esc(modeled)}</div>` : ''}
      <h3 style="margin:16px 0 8px">Passive Talents</h3>
      <div class="conGrid">${passives || '<div class="muted small">No passive data for this character.</div>'}</div>`;
  }
  function constellationsPane(c) {
    const count = c.constellation || 0;
    const list = c.constellations || [];
    if (!list.length) return '<h2 style="margin:0 0 6px">Constellation</h2><div class="small muted">No constellation data for this character.</div>';
    const cards = list.map((co, i) => {
      const n = i + 1;
      const unlocked = n <= count;
      return `<div class="conCard ${unlocked ? 'unlocked' : 'locked'}">
        <div class="conTop"><span class="conName">${esc(co.name || `Constellation ${n}`)}</span><span class="conBadge">${unlocked ? 'Unlocked' : 'Locked'}</span></div>
        <div class="conDesc">${esc(co.desc || '')}</div>
      </div>`;
    }).join('');
    return `<h2 style="margin:0 0 6px">Constellation · C${count}</h2>
      <div class="small muted" style="margin-bottom:10px">${count} / 6 unlocked. Modeled constellation stat effects are included under Character Passives in the Artifacts view.</div>
      <div class="conGrid">${cards}</div>`;
  }
  function fmtPassiveVal(k, v) {
    return ['atk', 'hp', 'def', 'eleMas'].includes(k) ? nf(v) : (v * 100).toFixed(1) + '%';
  }
  function passiveFrom(c) {
    return c.from === 'hp' ? 'HP' : c.from === 'eleMas' ? 'EM' : c.from === 'er' ? 'ER' : c.from === 'atk' ? 'ATK' : c.from === 'def' ? 'DEF' : c.from;
  }
  function convSummary(c) {
    const to = statLabel(c.to);
    const from = passiveFrom(c);
    const above = c.above != null ? (c.from === 'er' ? ` above ${(c.above * 100).toFixed(0)}%` : ` above ${nf(c.above)}`) : '';
    if (c.cap != null) return `${from} → ${to} ${fmtPassiveVal(c.to, c.cap)}${above}`;
    return `${from} → ${to} ${(c.ratio * 100).toFixed(1)}% of ${from}${above}`;
  }
  function effectParts(e) {
    const parts = [];
    for (const [k, v] of Object.entries((e && e.stats) || {})) if (Math.abs(v) > 1e-9) parts.push(`${statLabel(k)} ${fmtPassiveVal(k, v)}`);
    for (const c of (e && e.conversions) || []) parts.push(convSummary(c));
    for (const [k, v] of Object.entries((e && e.damage) || {})) if (Math.abs(v) > 1e-9) parts.push(`${statLabel(k)} ${fmtPassiveVal(k, v)}`);
    return parts;
  }
  function passiveSummary(p) {
    if (!p) return { always: '', conditional: '' };
    const always = effectParts(p.always);
    const cond = p.hasConditional ? effectParts(p) : [];
    return {
      always: always.join(' · '),
      conditional: cond.join(' · '),
    };
  }
  function pcard(key, title, on, pillId, summary, body, optionsHtml, hasToggle, toggleTitle) {
    const open = state.passiveOpen[key] ? ' open' : '';
    const always = (summary && summary.always) || '';
    const conditional = (summary && summary.conditional) || '';
    const pill = hasToggle ? `<button class="pill toggle ${on ? 'on' : 'off'}" id="${pillId}" title="${esc(toggleTitle || 'Toggle conditional ' + title)}">${on ? 'On' : 'Off'}</button>` : '<span class="pillph" aria-hidden="true"></span>';
    return `<details class="pcard" data-card="${key}"${open}><summary class="phead">${pill}<span class="pname">${title}</span><span class="palways" title="${esc(always)}">${esc(always)}</span><span class="pcond" title="${esc(conditional)}">${esc(conditional)}</span>${optionsHtml || ''}</summary><div class="pbody">${body}</div></details>`;
  }
  function effectBody(e, heading, muted) {
    const parts = effectParts(e);
    if (!parts.length) return '';
    const stats = Object.entries((e && e.stats) || {}).filter(([, v]) => Math.abs(v) > 1e-9).map(([k, v]) => `${statLabel(k)} ${fmtPassiveVal(k, v)}`).join(' · ');
    const conv = ((e && e.conversions) || []).map(convSummary).join(' · ');
    const dmg = Object.entries((e && e.damage) || {}).filter(([, v]) => Math.abs(v) > 1e-9).map(([k, v]) => `${statLabel(k)} ${fmtPassiveVal(k, v)}`).join(' · ');
    return `<div class="small ${muted ? 'muted' : ''}"><b>${heading}</b></div>
      ${stats ? `<div class="small"><b>In stats:</b> ${stats}</div>` : ''}
      ${conv ? `<div class="small"><b>Conversions:</b> ${conv}</div>` : ''}
      ${dmg ? `<div class="small"><b>Damage-only (not in stat sheet):</b> ${dmg}</div>` : ''}`;
  }
  function passiveBody(p, desc) {
    if (!p) return `${desc ? `<div class="small muted">${esc(desc)}</div>` : ''}<div class="small muted">No stat-sheet effect modeled.</div>`;
    const always = effectBody(p.always, 'Always active');
    const cond = p.hasConditional ? effectBody(p, p.enabled === false ? 'Conditional (currently off)' : 'Conditional', p.enabled === false) : '';
    const any = always || cond;
    return `${always}${cond}
      ${!any ? '<div class="small muted">No stat-sheet effect modeled.</div>' : ''}
      ${p.note ? `<div class="small muted">${esc(p.note)}</div>` : ''}
      ${desc ? `<div class="small muted">${esc(desc)}</div>` : ''}`;
  }

  // ---- Client-side import + analysis ----
  const GD = () => (R.calc && R.calc.gamedata) || {};
  const normKeyClient = (k) => (k === 'heal_' ? 'healing_' : k);
  const normSetClient = (s) => (s || '').toLowerCase().replace(/_/g, '');
  function enrichArtifactPiece(a) {
    const rarity = String(a.rarity || 5);
    const mainTable = ((GD().artMain || {})[rarity] || {})[a.main] || [];
    return {
      ...a,
      set: normSetClient(a.setKey),
      mainVal: mainTable[a.level] != null ? mainTable[a.level] : ((R.summary.artMain5 || {})[a.main] || 0),
      kind: 'equipped',
    };
  }
  const PCT_KEYS = new Set([
    'hp_', 'atk_', 'def_', 'critRate_', 'critDMG_', 'enerRech_', 'healing_',
    'physical_dmg_', 'pyro_dmg_', 'hydro_dmg_', 'cryo_dmg_', 'electro_dmg_',
    'anemo_dmg_', 'geo_dmg_', 'dendro_dmg_', 'skill_dmg_', 'burst_dmg_', 'na_dmg_',
    'plunge_dmg_', 'nightsoul_dmg_', 'electro_res_', 'pyro_res_', 'shield_',
  ]);
  const CN_NAMES = {
    '冰伤流': 'Cryo DMG', '物伤流': 'Physical DMG', '火伤流': 'Pyro DMG', '雷伤流': 'Electro DMG',
    '水伤流': 'Hydro DMG', '风伤流': 'Anemo DMG', '岩伤流': 'Geo DMG', '草伤流': 'Dendro DMG',
    '烈绽放': 'Burgeon', '超绽放': 'Hyperbloom', '绽放': 'Bloom', '蒸发': 'Vaporize', '融化': 'Melt',
    '冻结': 'Freeze', '感电': 'Electro-Charged', '超载': 'Overload', '扩散': 'Swirl',
    '带芙': 'with Furina', '纯色': 'Mono-element', '辅助': 'Support', '输出': 'DPS',
    '充能': 'ER', '精通': 'EM', '护盾': 'Shield', '治疗': 'Healing',
  };
  const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

  function resolveValClient(spec, ref) {
    if (spec == null) return 0;
    if (typeof spec === 'number') return spec;
    if (Array.isArray(spec)) return spec[Math.max(0, Math.min(4, ref - 1))] ?? spec[0];
    if (spec.r1 != null) return spec.r1 + ((spec.r5 != null ? spec.r5 : spec.r1) - spec.r1) * ((ref - 1) / 4);
    return 0;
  }
  function resolveMapClient(obj, ref) {
    const out = {};
    for (const [k, v] of Object.entries(obj || {})) out[k] = resolveValClient(v, ref);
    return out;
  }
  function resolveEffectsClient(part, ref, fallbackNote) {
    const out = {
      stats: resolveMapClient(part && part.stats, ref),
      conversions: ((part && part.conversions) || []).map((c) => ({ ...c, ratio: resolveValClient(c.ratio, ref) })),
      damage: resolveMapClient(part && part.damage, ref),
      note: (part && part.note) || fallbackNote || '',
    };
    for (const k of ['dmg_', 'critDMG_']) {
      if (out.damage[k] != null) {
        out.stats[k] = (out.stats[k] || 0) + out.damage[k];
        delete out.damage[k];
      }
    }
    return out;
  }
  function effectsPresentClient(e) {
    if (!e) return false;
    return Object.keys(e.stats || {}).some((k) => Math.abs(e.stats[k]) > 1e-12)
      || (e.conversions || []).length > 0
      || Object.keys(e.damage || {}).some((k) => Math.abs(e.damage[k]) > 1e-12);
  }
  function resolvePassiveClient(def, ref) {
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
    const alwaysBase = resolveEffectsClient(alwaysDef, ref, note);
    let always = alwaysBase;
    let options = null;
    let optionsAlways = false;
    let baseConditional = resolveEffectsClient({}, ref, note);
    if (def.always === true && def.options && def.options.length) {
      optionsAlways = true;
      options = def.options.map((o, i) => ({ ...resolveEffectsClient(o, ref, note), label: o.label || `Option ${i + 1}` }));
      always = mergeEffects(alwaysBase, options[0]);
      conditionalDef = {};
    } else {
      options = (conditionalDef.options && conditionalDef.options.length)
        ? conditionalDef.options.map((o, i) => ({ ...resolveEffectsClient(o, ref, note), label: o.label || `Option ${i + 1}` }))
        : null;
      baseConditional = resolveEffectsClient(conditionalDef, ref, note);
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
      hasConditional: !!(options && !optionsAlways) || effectsPresentClient(baseConditional),
    };
  }
  function filledDescClient(key, ref) {
    const d = GD().weaponDesc && GD().weaponDesc[key];
    if (!d) return '';
    let s = (d.template || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
    const vals = (d.refinements && d.refinements[Math.max(0, Math.min(4, (ref || 1) - 1))]) || [];
    s = s.replace(/\{(\d+)\}/g, (_, i) => vals[+i] != null ? vals[+i] : `{${i}}`);
    return s.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function mainValueClient(p) {
    const table = GD().artMain && (GD().artMain[String(p.rarity)] || GD().artMain['5']);
    const arr = table && table[p.main];
    return arr ? (arr[p.level] || 0) : 0;
  }
  function parseArtifactClient(a) {
    const p = {
      id: a.id || `${a.setKey}|${a.slotKey}|${a.mainStatKey}|${a.level}|${(a.substats || []).map((s) => s.key + ':' + s.value).join(',')}`,
      setKey: a.setKey,
      set: normSetClient(a.setKey),
      slot: a.slotKey,
      main: normKeyClient(a.mainStatKey),
      level: a.level || 0,
      rarity: a.rarity || 5,
      subs: (a.substats || []).map((s) => {
        const key = normKeyClient(s.key);
        return { key, val: PCT_KEYS.has(key) ? s.value / 100 : s.value };
      }),
      hidden: (a.unactivatedSubstats || []).map((s) => {
        const key = normKeyClient(s.key);
        return { key, val: PCT_KEYS.has(key) ? s.value / 100 : s.value };
      }),
      totalRolls: a.totalRolls != null ? a.totalRolls : null,
      location: a.location || '',
      lock: !!a.lock,
    };
    p.mainVal = mainValueClient(p);
    return p;
  }
  function loadExportClient(raw) {
    const seen = new Set();
    const artifacts = (raw.artifacts || []).map((a) => {
      const p = parseArtifactClient(a);
      if (seen.has(p.id)) {
        let n = 2;
        while (seen.has(p.id + '#' + n)) n++;
        p.id = p.id + '#' + n;
      }
      seen.add(p.id);
      return p;
    });
    return {
      chars: (raw.characters || []).map((c) => ({ key: c.key, level: c.level, ascension: c.ascension, constellation: c.constellation })),
      weapons: (raw.weapons || []).map((w) => ({ key: w.key, level: w.level, ascension: w.ascension, refinement: w.refinement, location: w.location })),
      artifacts,
    };
  }
  function charBaseClient(goKey, level = 90, asc = 6) {
    const c = GD().chars[goKey];
    if (!c) return null;
    const out = { hp: 0, atk: 0, def: 0 };
    for (const lc of c.lvlCurves) {
      const curve = (GD().charCurves[lc.curve] || [])[level] || 0;
      out[lc.key] = (out[lc.key] || 0) + lc.base * curve;
    }
    for (const k of ['hp', 'atk', 'def']) if (c.asc[k]) out[k] += c.asc[k][asc] || 0;
    return out;
  }
  function weaponStatsClient(key, level = 90, asc = 6) {
    const w = GD().weapons[key];
    if (!w) return null;
    const mcurve = (GD().weaponCurves[w.mainCurve] || [])[level] || 0;
    let baseAtk = w.mainBase * mcurve;
    if (w.ascAtk) baseAtk += w.ascAtk[asc] || 0;
    let sub = null;
    if (w.subKey) {
      const scurve = (GD().weaponCurves[w.subCurve] || [])[level] || 0;
      sub = { key: w.subKey, val: w.subBase * scurve };
    }
    return { baseAtk, sub };
  }
  function projectArtifactClient(p, build) {
    const current = pieceSc(p, build);
    const remaining = Math.max(0, 5 - Math.floor(p.level / 4));
    const weights = weightsOf(build);
    const topW = Math.max(0, ...Object.values(weights));
    const hidden = p.hidden || [];
    const unknown4 = p.subs.length < 4 && hidden.length === 0;
    const allSubs = [...p.subs, ...hidden];
    const n = unknown4 ? 4 : Math.max(1, allSubs.length);
    let expSum = 0;
    for (const s of allSubs) {
      const w = subW(build, s.key) || 0;
      expSum += 0.85 * 7.77 * w / 100;
    }
    if (unknown4) expSum += 0.85 * 7.77 * topW / 100;
    const expPerRoll = expSum / n;
    let unlock = 0;
    for (const h of hidden) unlock += cdeq(h.key, h.val) * subW(build, h.key) / 100;
    if (unknown4) unlock = 0.85 * 7.77 * topW / 100;
    const rollsAfter = Math.max(0, remaining - (unknown4 ? 1 : hidden.length));
    return {
      current,
      projected: current + unlock + rollsAfter * expPerRoll,
      ceiling: current + unlock + rollsAfter * (7.77 * topW / 100),
      remaining,
      unlock,
      rollsAfter,
    };
  }
  function idealRawClient(build) {
    let main = 0;
    for (const slot of SLOTS) {
      const sw = slot === 'sands' ? build.sands : slot === 'goblet' ? build.goblet : slot === 'circlet' ? build.circlet : null;
      if (sw && sw.length) main += 62.1 * Math.max(...sw.map((x) => x.w)) / 100;
    }
    const weights = build.subs.map((s) => s.w).sort((a, b) => b - a).slice(0, 4);
    const wsum = weights.reduce((a, b) => a + b, 0) || 1;
    const perRoll = weights.reduce((a, w) => a + (w / wsum) * 7.77, 0);
    return main + 9 * perRoll * 5 + (build.set ? 45 : 0);
  }
  function buildLabelClient(b) {
    let name = b.name && b.name !== b.id ? b.name : '';
    if (name && /[\u4e00-\u9fff]/.test(name)) name = CN_NAMES[name] || '';
    const setName = b.set ? (GD().setNames[b.set] || b.set) : 'Custom';
    const base = name ? `${name} · ${setName}` : setName;
    const slotOpts = (arr, n) => (arr || []).slice(0, n).map((x) => statLabel(x.key));
    const mains = [...slotOpts(b.sands, 1), ...slotOpts(b.goblet, 2), ...slotOpts(b.circlet, 1)];
    const unique = [...new Set(mains)];
    const comp = b.comp === '2pc+2pc' ? ' (2pc+2pc)' : '';
    return base + comp + (unique.length ? ' · ' + unique.join(' / ') : '');
  }
  function serializePieceClient(p) {
    return {
      id: p.id, setKey: p.setKey, set: p.set, slot: p.slot, main: p.main, mainVal: mainValueClient(p),
      level: p.level, rarity: p.rarity, subs: p.subs, hidden: p.hidden || [], totalRolls: p.totalRolls, location: p.location, lock: p.lock,
    };
  }
  function serializeBuildClient(b) {
    return {
      id: b.id, label: buildLabelClient(b), name: b.name, set: b.set, comp: b.comp, roles: b.roles,
      subs: b.subs, sands: b.sands, goblet: b.goblet, circlet: b.circlet, idealRaw: idealRawClient(b),
    };
  }
  function fallbackBuildClient(goKey) {
    const c = GD().chars[goKey];
    const scaling = c.asc.hp_ ? 'hp_' : c.asc.def_ ? 'def_' : 'atk_';
    const dmg = ELE[c.ele] || null;
    return {
      id: 'fallback', name: 'Generic (auto)', set: null, comp: '4pc', roles: ['dps'], styles: [],
      subs: [{ key: 'critRate_', w: 100 }, { key: 'critDMG_', w: 100 }, { key: scaling, w: 100 }, { key: 'enerRech_', w: 40 }, { key: 'eleMas', w: 25 }],
      sands: [{ key: scaling, w: 100 }],
      goblet: dmg ? [{ key: dmg, w: 100 }] : [{ key: scaling, w: 100 }],
      circlet: [{ key: 'critRate_', w: 100 }, { key: 'critDMG_', w: 100 }],
      normalizer: 0,
    };
  }
  function bestOwnedWeaponClient(weapons, key, charKey) {
    const arr = weapons.filter((w) => w.key === key);
    if (!arr.length) return null;
    const equipped = arr.find((w) => w.location === charKey);
    if (equipped) return equipped;
    const score = (w) => (w.location ? 0 : 1) + (w.level || 0) * 1000 + (w.refinement || 1) * 10;
    return arr.slice().sort((a, b) => score(b) - score(a))[0] || null;
  }
  function weaponInfoClient(key, owned) {
    const w = GD().weapons[key];
    const level = owned && owned.level ? owned.level : 90;
    const ascension = owned && owned.ascension != null ? owned.ascension : 6;
    const refinement = owned && owned.refinement ? owned.refinement : 1;
    const st = weaponStatsClient(key, level, ascension);
    return {
      key,
      name: (GD().weaponDesc[key] && GD().weaponDesc[key].name) || key.replace(/([a-z])([A-Z])/g, '$1 $2'),
      type: w ? w.type : null,
      rarity: w ? w.rarity : 3,
      level,
      ascension,
      refinement,
      location: owned ? (owned.location || '') : '',
      baseAtk: st ? st.baseAtk : 0,
      sub: st ? st.sub : null,
      passive: resolvePassiveClient((R.calc.weaponPassives || {})[key], refinement),
      desc: filledDescClient(key, refinement),
      preview: !owned,
    };
  }
  function signatureForClient(goKey, recKeys) {
    const mapped = (R.calc.signatureWeapons || {})[norm(goKey)];
    if (mapped === false) return null;
    if (mapped && recKeys.includes(mapped)) return mapped;
    const charRarity = (GD().chars[goKey] && GD().chars[goKey].rarity) || 4;
    const fiveStars = recKeys.filter((k) => GD().weapons[k] && GD().weapons[k].rarity === 5);
    if (charRarity >= 5 && fiveStars.length === 1) return fiveStars[0];
    return null;
  }
  function recommendedWeaponsForClient(charKey, goKey, weapons) {
    const recKeys = (GD().recommendedWeapons && GD().recommendedWeapons[norm(goKey)]) || [];
    if (!recKeys.length) return [];
    const sig = signatureForClient(goKey, recKeys);
    const seen = new Set();
    const out = [];
    recKeys.forEach((key, order) => {
      if (seen.has(key)) return;
      seen.add(key);
      const owned = bestOwnedWeaponClient(weapons, key, charKey);
      out.push({ ...weaponInfoClient(key, owned), signature: key === sig, order });
    });
    return out.sort((a, b) => (b.signature - a.signature) || (b.rarity - a.rarity) || (a.order - b.order));
  }
  function percentileClient(sorted, value) {
    if (!sorted.length) return 0;
    let lo = 0, hi = sorted.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < value) lo = mid + 1; else hi = mid; }
    return lo / sorted.length;
  }
  function optimizeCoreClient(build, pool, ctx, mode, offSlot) {
    const perSlot = 60, beamSize = 200;
    const bySlot = {};
    for (const slot of SLOTS) {
      let source = pool.filter((p) => p.slot === slot);
      if (offSlot != null && slot !== offSlot) source = source.filter((p) => p.set === build.set);
      bySlot[slot] = source.map((p) => ({ p, sc: pieceSc(p, build) })).sort((a, b) => b.sc - a.sc).slice(0, perSlot);
      if (build.set && !bySlot[slot].some((x) => x.p.set === build.set)) {
        const cand = source.filter((p) => p.set === build.set).map((p) => ({ p, sc: pieceSc(p, build) })).sort((a, b) => b.sc - a.sc)[0];
        if (cand) bySlot[slot].push(cand);
      }
      if (!bySlot[slot].length) return null;
    }
    let beams = [{ pieces: [], score: 0 }];
    for (const slot of SLOTS) {
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
      const st = computeStats(b.pieces, ctx, mode);
      if (!st) continue;
      const total = comboSc(b.pieces, build) - Math.max(0, erTargetOf(build) - st.er) * 300;
      if (!best || total > best.total) best = { pieces: b.pieces, total, stats: st };
    }
    return best;
  }
  function optimizeClient(build, pool, ctx, mode) {
    if (build.comp === '4pc' && build.set) {
      const have = {};
      for (const p of pool) if (p.set === build.set) have[p.slot] = true;
      if (SLOTS.every((s) => have[s])) {
        let best = null;
        for (const offSlot of SLOTS) {
          const r = optimizeCoreClient(build, pool, ctx, mode, offSlot);
          if (r && (!best || r.total > best.total)) best = r;
        }
        if (best) return best;
      }
    }
    return optimizeCoreClient(build, pool, ctx, mode, null);
  }
  function buildCandidatesClient(best, build, pool) {
    const out = {};
    for (const slot of SLOTS) {
      const chosen = best.pieces.find((p) => p.slot === slot);
      if (!chosen) { out[slot] = []; continue; }
      const chosenScore = pieceSc(chosen, build);
      const all = pool.filter((p) => p.slot === slot).map((p) => {
        const pot = projectArtifactClient(p, build);
        return { p, score: pieceSc(p, build), projected: pot.projected };
      });
      const maxedAll = all.filter((x) => x.p.level >= 20 && x.p.id !== chosen.id);
      const isSame = (p) => build.set && p.set === build.set;
      const maxedSame = maxedAll.filter((x) => isSame(x.p)).sort((a, b) => b.score - a.score).slice(0, 3);
      const maxedOther = maxedAll.filter((x) => !isSame(x.p)).sort((a, b) => b.score - a.score).slice(0, 2);
      const potAll = all.filter((x) => x.p.level < 20 && x.p.id !== chosen.id);
      const potSame = potAll.filter((x) => isSame(x.p)).sort((a, b) => b.projected - a.projected).slice(0, 3);
      let potOther = potAll.filter((x) => !isSame(x.p) && x.projected >= chosenScore - 8).sort((a, b) => b.projected - a.projected).slice(0, 2);
      if (potSame.length + potOther.length < 3) {
        const used = new Set([...potSame, ...potOther].map((x) => x.p.id));
        const extra = potAll.filter((x) => !used.has(x.p.id)).sort((a, b) => b.projected - a.projected).slice(0, 3 - (potSame.length + potOther.length));
        potOther = [...potOther, ...extra];
      }
      const chosenPot = projectArtifactClient(chosen, build);
      const mk = (x, kind) => ({ ...serializePieceClient(x.p), score: Math.round(x.score), projected: Math.round(x.projected), kind, sameSet: !!isSame(x.p) });
      out[slot] = [
        { ...serializePieceClient(chosen), score: Math.round(chosenScore), projected: Math.round(chosenPot.projected), kind: 'chosen', sameSet: !!isSame(chosen) },
        ...maxedSame.map((x) => mk(x, 'maxed')),
        ...maxedOther.map((x) => mk(x, 'maxed')),
        ...potSame.map((x) => mk(x, 'potential')),
        ...potOther.map((x) => mk(x, 'potential')),
      ];
    }
    return out;
  }
  function roundStatsClient(s) {
    return {
      hp: Math.round(s.hp), atk: Math.round(s.atk), def: Math.round(s.def),
      cr: +(s.cr * 100).toFixed(1), cd: +(s.cd * 100).toFixed(1), er: +(s.er * 100).toFixed(1),
      em: Math.round(s.em), dmg: +(s.dmg * 100).toFixed(1), healing: +(s.healing * 100).toFixed(1),
    };
  }
  async function analyzeClient(raw, onProgress = () => {}) {
    const gd = GD();
    if (!gd.chars) throw new Error('This page is missing its game data. Reload the page and try again.');
    const { chars, weapons, artifacts } = loadExportClient(raw);
    const pool = artifacts;
    const used = new Map();
    const charResults = [];
    const skipped = [];
    const charBuildPairs = [];

    onProgress(2, 'Preparing character data…');
    await yieldToUI();

    for (let ci = 0; ci < chars.length; ci++) {
      const c = chars[ci];
      onProgress(4 + 78 * (ci / Math.max(1, chars.length)), `Analyzing ${c.key}`, `${ci + 1} / ${chars.length}`);
      await yieldToUI();
      const goKey = gd.charNorm[norm(c.key)];
      if (!goKey) { skipped.push({ key: c.key, reason: 'no game data (new/unreleased)' }); continue; }
      const wObj = weapons.find((w) => w.location === c.key) || null;
      const weapon = wObj ? wObj.key : null;
      const passive = weapon ? resolvePassiveClient((R.calc.weaponPassives || {})[weapon], wObj ? wObj.refinement : 1) : null;
      const tpDef = (R.calc.talentPassives || {})[goKey];
      const talentPassive = tpDef && (tpDef.constellation == null || (c.constellation || 0) >= tpDef.constellation)
        ? resolvePassiveClient(tpDef, 1)
        : null;
      const charAsc = c.ascension == null ? 6 : c.ascension;
      const base = charBaseClient(goKey, c.level || 90, charAsc);
      const charScaling = gd.chars[goKey].asc.hp_ ? 'hp_' : gd.chars[goKey].asc.def_ ? 'def_' : 'atk_';
      const charMeta = { ...c, ele: gd.chars[goKey].ele, charScaling };
      const ascExtra = {};
      for (const [k, arr] of Object.entries(gd.chars[goKey].asc)) {
        if (!['hp', 'atk', 'def'].includes(k)) ascExtra[k] = arr[charAsc] || 0;
      }
      const ctx = {
        charLevel: c.level || 90,
        charAsc,
        base,
        asc: ascExtra,
        weapon: weapon ? weaponStatsClient(weapon, wObj && wObj.level ? wObj.level : 90, wObj && wObj.ascension != null ? wObj.ascension : 6) : null,
        ele: gd.chars[goKey].ele,
        weaponLevel: wObj && wObj.level ? wObj.level : 90,
        weaponAsc: wObj && wObj.ascension != null ? wObj.ascension : 6,
        weaponPassive: passive,
        talentPassive,
      };
      let builds = gd.builds[norm(c.key)];
      if (!builds || !builds.length) builds = [fallbackBuildClient(goKey)];
      for (const b of builds) charBuildPairs.push({ char: c.key, goKey, build: b });

      const results = [];
      for (const b of builds) {
        const setDef = b.comp === '4pc' ? (R.calc.setPassives || {})[b.set] : null;
        const setPassive = setDef ? resolvePassiveClient(setDef, 1) : null;
        const buildCtx = { ...ctx, damageKey: damageKeyForBuildClient(b, goKey), setPassive, setPassiveSet: b.set };
        const r = optimizeClient(b, pool, buildCtx, TARGET_MODE_ON);
        if (!r) continue;
        const rOff = passive ? optimizeClient(b, pool, buildCtx, { ...TARGET_MODE_ON, weaponOff: true }) : r;
        const cands = buildCandidatesClient(r, b, pool);
        if (passive && rOff) {
          for (const slot of SLOTS) {
            const off = rOff.pieces.find((p) => p.slot === slot);
            if (off && !cands[slot].some((x) => x.id === off.id)) {
              const pot = projectArtifactClient(off, b);
              cands[slot].push({
                ...serializePieceClient(off), score: Math.round(pieceSc(off, b)), projected: Math.round(pot.projected),
                kind: 'chosen-off', sameSet: !!(b.set && off.set === b.set),
              });
            }
          }
        }
        results.push({
          build: serializeBuildClient(b),
          pieces: r.pieces.map(serializePieceClient),
          stats: roundStatsClient(r.stats),
          score: Math.round((r.total / idealRawClient(b)) * 300),
          targets: targetsFor(b, buildCtx, charMeta),
          off: passive && rOff ? {
            pieces: rOff.pieces.map(serializePieceClient),
            stats: roundStatsClient(rOff.stats),
            score: Math.round((rOff.total / idealRawClient(b)) * 300),
            targets: targetsFor(b, buildCtx, charMeta),
          } : null,
          ctx: {
            base,
            asc: ascExtra,
            weapon: ctx.weapon,
            ele: ctx.ele,
            damageKey: buildCtx.damageKey,
            weaponPassive: passive,
            setPassive,
            setPassiveSet: b.set,
            talentPassive,
          },
          slotCandidates: cands,
        });
        const usedPieces = rOff && rOff !== r ? [...r.pieces, ...rOff.pieces] : r.pieces;
        for (const p of usedPieces) {
          const arr = used.get(p.id) || [];
          arr.push({ char: c.key, build: buildLabelClient(b) + (rOff && rOff !== r && rOff.pieces.includes(p) ? ' (passive off)' : '') });
          used.set(p.id, arr);
        }
      }
      if (!results.length) { skipped.push({ key: c.key, reason: 'no artifacts for a slot' }); continue; }
      const def = results[0];
      charResults.push({
        key: c.key, goKey, level: c.level, constellation: c.constellation || 0, ele: gd.chars[goKey].ele, weaponType: gd.chars[goKey].weaponType,
        region: gd.chars[goKey].region || 'unknown',
        releaseDate: gd.chars[goKey].releaseDate || null,
        charScaling: gd.chars[goKey].asc.hp_ ? 'hp_' : gd.chars[goKey].asc.def_ ? 'def_' : 'atk_',
        talents: c.talent || { auto: 1, skill: 1, burst: 1 },
        skills: gd.chars[goKey].skills || [],
        skillDescs: gd.chars[goKey].skillDescs || [],
        passives: gd.chars[goKey].passives || [],
        constellations: gd.chars[goKey].constellations || [],
        recommendedWeapons: recommendedWeaponsForClient(c.key, goKey, weapons),
        weapon, weaponLevel: wObj ? wObj.level : null, weaponRefine: wObj ? wObj.refinement : null,
        weaponDesc: weapon ? filledDescClient(weapon, wObj ? wObj.refinement : 1) : '',
        builds: results,
        defaultBuild: 0,
        build: def.build, pieces: def.pieces, stats: def.stats, score: def.score, targets: def.targets,
      });
    }

    onProgress(84, 'Scoring artifacts…');
    await yieldToUI();
    const artResults = [];
    for (let i = 0; i < artifacts.length; i++) {
      const p = artifacts[i];
      let fit = null;
      for (const pair of charBuildPairs) {
        const sc = pieceSc(p, pair.build);
        if (!fit || sc > fit.score) fit = { char: pair.char, build: pair.build, score: sc };
      }
      const pot = projectArtifactClient(p, fit ? fit.build : fallbackBuildClient('Ganyu'));
      artResults.push({ p, fit, pot });
      if (i % 100 === 0) {
        onProgress(84 + 8 * (i / Math.max(1, artifacts.length)), 'Scoring artifacts…', `${i} / ${artifacts.length}`);
        await yieldToUI();
      }
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
        r.fitPct = percentileClient(byFit, r.fit ? r.fit.score : 0);
        r.potPct = percentileClient(byPot, r.pot.projected);
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
    const bestBySetSlotMain = new Map();
    for (const r of artResults) {
      const k = r.p.set + '|' + r.p.slot + '|' + r.p.main;
      const cur = bestBySetSlotMain.get(k);
      if (!cur || r.pot.projected > cur.pot.projected) bestBySetSlotMain.set(k, r);
    }
    for (const r of artResults) {
      if (r.verdict === 'SALVAGE' && bestBySetSlotMain.get(r.p.set + '|' + r.p.slot + '|' + r.p.main) === r) r.verdict = 'REVIEW';
    }

    onProgress(94, 'Building report…');
    await yieldToUI();
    const artifactsOut = artResults.map((r) => ({
      id: r.p.id, setKey: r.p.setKey, slot: r.p.slot, main: r.p.main, level: r.p.level, rarity: r.p.rarity,
      subs: r.p.subs, hidden: r.p.hidden || [], totalRolls: r.p.totalRolls, location: r.p.location, lock: r.p.lock,
      fit: r.fit ? { char: r.fit.char, build: buildLabelClient(r.fit.build), score: Math.round(r.fit.score) } : null,
      current: Math.round(r.pot.current), projected: Math.round(r.pot.projected), ceiling: Math.round(r.pot.ceiling),
      fitPct: +(r.fitPct * 100).toFixed(0), potPct: +(r.potPct * 100).toFixed(0),
      usedBy: r.usedBy, verdict: r.verdict,
    }));
    const weaponsOut = weapons.map((w) => weaponInfoClient(w.key, w));
    const maxRoll = (R.summary && R.summary.maxRoll) || {};
    const summary = {
      file: raw.file || raw.name || 'Imported export',
      chars: chars.length,
      analyzed: charResults.length,
      skipped,
      artifacts: artifacts.length,
      weapons: weaponsOut.length,
      setNames: gd.setNames,
      setEffects: gd.setEffects,
      setTwo: Object.fromEntries(Object.entries(gd.sets).map(([k, v]) => [k, v.two])),
      breakpoints: gd.breakpoints,
      artMain5: Object.fromEntries(Object.entries(gd.artMain['5'] || {}).map(([k, arr]) => [k, arr[20] || 0])),
      maxRoll,
      verdicts: artifactsOut.reduce((a, r) => { a[r.verdict] = (a[r.verdict] || 0) + 1; return a; }, {}),
      generated: new Date().toISOString(),
    };
    onProgress(100, 'Done');
    return {
      summary,
      characters: charResults.sort((a, b) => b.score - a.score),
      artifacts: artifactsOut,
      weapons: weaponsOut,
      calc: R.calc,
    };
  }

  function setImportProgress(pct, stage, detail) {
    const bar = $('#importBar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    if ($('#importStage')) $('#importStage').textContent = stage || '';
    if ($('#importDetail')) $('#importDetail').textContent = detail || '';
  }
  function showImportOverlay() {
    const ov = $('#importOverlay');
    if (ov) ov.classList.remove('hide');
    const close = $('#importCloseBtn');
    if (close) close.classList.add('hide');
    const choose = $('#importChooseBtn');
    if (choose) choose.classList.add('hide');
    const note = $('#importNote');
    if (note) note.classList.add('hide');
    setImportProgress(0, 'Reading export…', '');
  }
  function hideImportOverlay() {
    const ov = $('#importOverlay');
    if (ov) ov.classList.add('hide');
  }

  // ---- Shareable site boot flow ----
  const looksLikeGamedata = (v) => !!(v && typeof v === 'object' && v.chars && v.weapons
    && v.artMain && !Array.isArray(v.characters) && !Array.isArray(v.artifacts));
  function showBootPrompt(stage) {
    const ov = $('#importOverlay');
    if (ov) ov.classList.remove('hide');
    $('#importTitle').textContent = 'Load your GOOD export';
    $('#importBar').style.width = '0%';
    $('#importStage').textContent = stage || 'This page has no account data. Choose your GOOD JSON export to build a report.';
    $('#importDetail').textContent = 'Everything is calculated locally in this browser. The file is never uploaded.';
    const note = $('#importNote');
    if (note) {
      note.classList.remove('hide');
      note.innerHTML = '<b>Need a GOOD file?</b> Export your account from Genshin Optimizer (or any GOOD-compatible exporter) and choose the JSON file here.';
    }
    $('#importChooseBtn').classList.remove('hide');
    $('#importCloseBtn').classList.remove('hide');
  }
  function startBoot() {
    showBootPrompt();
  }

  function applyReport(result) {
    R = result;
    state.baseKey = null;
    state.char = null;
    state.build = 0;
    state.weaponKey = null;
    state.weaponTargets = {};
    state.sel = {};
    state.modeKey = null;
    state.slotCompare = {};
    state.limit = 300;
    state.verdict = 'ALL';
    state.slot = 'ALL';
    state.set = 'ALL';
    state.cleanSort = null;
    state.cleanSortDir = 1;
    state.filterEle = [];
    state.filterWeapon = [];
    state.filterRegion = [];
    refreshFilterOptions();
    applyListMode({ animate: false });
    renderChips();
    syncHeaderHeight();
    renderCharList({ scrollActive: true });
    renderChar();
    showTab('chars');
  }

  function showRestoreOverlay(file) {
    const ov = $('#importOverlay');
    if (ov) ov.classList.remove('hide');
    $('#importTitle').textContent = 'Restoring your last export';
    $('#importStage').textContent = file ? `Reading ${file}…` : 'Reading your saved export…';
    $('#importDetail').textContent = 'Recalculating in this browser.';
    $('#importNote').classList.add('hide');
    $('#importChooseBtn').classList.add('hide');
    $('#importCloseBtn').classList.add('hide');
    $('#importBar').style.width = '0%';
  }

  async function restoreSession() {
    const { analysis, savedExport } = await readSession();
    const buildId = sessionBuildId();
    const cached = analysis && analysis.schema === SESSION_SCHEMA && analysis.buildId === buildId
      && analysis.result && Array.isArray(analysis.result.characters) && analysis.result.characters.length
      && analysis.gamedataHash === gameDataHash();
    if (cached) {
      applyReport(analysis.result);
      setSavedSession(true);
      return true;
    }
    if (savedExport && savedExport.raw) {
      showRestoreOverlay(savedExport.file);
      try {
        const result = await analyzeClient(JSON.parse(savedExport.raw), (pct, stage, detail) => setImportProgress(pct, stage, detail));
        applyReport(result);
        await persistSession(savedExport.raw, savedExport.file, result);
        hideImportOverlay();
        return true;
      } catch (err) {
        console.warn('Could not restore the saved export.', err);
        await clearSession();
        if (!hasReport()) startBoot();
        else hideImportOverlay();
        return false;
      }
    }
    if (!hasReport()) startBoot();
    return false;
  }

  function syncHeaderHeight() {
    const h = document.querySelector('header');
    if (h) document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
  }
  function lastImportText() {
    if (!hasReport()) return 'No export loaded';
    const file = String((R.summary && R.summary.file) || '').split(/[\\/]/).pop();
    const match = file.match(/genshin_export_(\d{4}-\d{2}-\d{2})(?:_(\d{2})-(\d{2}))?/);
    let when = match ? `${match[1]}${match[2] ? ` ${match[2]}:${match[3]}` : ''}` : '';
    if (!when && R.summary && R.summary.generated) {
      try { when = new Date(R.summary.generated).toLocaleString(); } catch (e) { when = ''; }
    }
    return when ? `Last import: ${when}` : 'Last import: unknown';
  }
  function renderDataMenu() {
    const date = $('#dataMenuDate');
    if (date) date.textContent = lastImportText();
    const imp = $('#dataMenuImport');
    const forget = $('#forgetBtn');
    if (imp) imp.classList.toggle('hide', savedSession);
    if (forget) forget.classList.toggle('hide', !savedSession);
  }
  function renderChips() {
    renderDataMenu();
    if (!hasReport()) {
      $('#chips').innerHTML = '<span class="chip">No export loaded</span>';
      return;
    }
    const v = R.summary.verdicts || {};
    $('#chips').innerHTML = [
      `<span class="chip"><b>${R.summary.analyzed}</b> chars</span>`,
      `<span class="chip"><b>${nf(R.summary.artifacts)}</b> artifacts</span>`,
      `<span class="chip"><b>${v.KEEP || 0}</b> keep</span>`,
      `<span class="chip"><b>${v.LEVEL || 0}</b> level</span>`,
      `<span class="chip"><b>${v.SALVAGE || 0}</b> salvage</span>`,
    ].join('');
  }

  const SORT_DEFS = [
    ['name', 'Name', 1],
    ['level', 'Lv', -1],
    ['release', 'Release', -1],
    ['score', 'Score', -1],
  ];
  function chooseInitialCharacter() {
    if (SETTINGS.lastCharacter && R.characters.some((c) => c.key === SETTINGS.lastCharacter)) return SETTINGS.lastCharacter;
    if (R.characters.some((c) => c.key === 'Amber')) return 'Amber';
    return (R.characters[0] || {}).key;
  }
  function renderSortChips() {
    const el = $('#charSortChips');
    if (!el) return;
    el.innerHTML = SORT_DEFS.map(([key, label]) => {
      const on = state.sortChar === key;
      return `<button class="sortchip ${on ? 'on' : ''}" data-sort="${key}">${label}${on ? ` ${state.sortDir < 0 ? '↓' : '↑'}` : ''}</button>`;
    }).join('');
    $$('#charSortChips .sortchip').forEach((b) => b.onclick = () => {
      const key = b.dataset.sort;
      if (state.sortChar === key) state.sortDir *= -1;
      else {
        state.sortChar = key;
        state.sortDir = (SORT_DEFS.find((x) => x[0] === key) || [,, -1])[2];
      }
      renderSortChips();
      renderCharList();
    });
  }
  function charListData() {
    const filterMode = state.listMode === 'filters';
    const q = filterMode ? '' : ($('#charSearch').value || '').toLowerCase();
    const eleF = filterMode ? state.filterEle : [];
    const weaponF = filterMode ? state.filterWeapon : [];
    const regionF = filterMode ? state.filterRegion : [];
    const list = R.characters.filter((c) => {
      if (eleF.length && !eleF.includes(c.ele)) return false;
      if (weaponF.length && !weaponF.includes(c.weaponType)) return false;
      if (regionF.length && !regionF.includes(c.region)) return false;
      if (q && !(c.key.toLowerCase().includes(q) || charLabel(c.key).toLowerCase().includes(q))) return false;
      return true;
    });
    const base = {
      score: (a, b) => a.score - b.score,
      level: (a, b) => a.level - b.level,
      name: (a, b) => charLabel(a.key).localeCompare(charLabel(b.key)),
      release: (a, b) => String(a.releaseDate || '').localeCompare(String(b.releaseDate || '')) || charLabel(a.key).localeCompare(charLabel(b.key)),
    }[state.sortChar] || ((a, b) => a.score - b.score);
    const dir = state.sortDir || -1;
    list.sort((a, b) => {
      const v = base(a, b);
      return v ? dir * v : charLabel(a.key).localeCompare(charLabel(b.key));
    });
    return list;
  }
  function scrollActiveCharacterIntoView() {
    const list = $('#charList');
    const active = $('#charList .crow.on');
    if (!list || !active) return;
    const ar = active.getBoundingClientRect();
    const br = list.getBoundingClientRect();
    if (ar.top < br.top) list.scrollTop -= (br.top - ar.top);
    else if (ar.bottom > br.bottom) list.scrollTop += (ar.bottom - br.bottom);
  }
  function renderCharList(opts = {}) {
    const listEl = $('#charList');
    const keepTop = listEl.scrollTop;
    const list = charListData();
    let changed = false;
    if (list.length && !list.some((c) => c.key === state.char)) {
      const preferred = [SETTINGS.lastCharacter, 'Amber'].find((k) => k && list.some((c) => c.key === k));
      state.char = preferred || list[0].key;
      state.build = 0;
      changed = true;
    }
    listEl.innerHTML = list.map((c) => `
      <div class="crow ${c.key === state.char ? 'on' : ''}" data-char="${esc(c.key)}">
        <div><div class="nm">${esc(charLabel(c.key))}</div><div class="sub">C${c.constellation == null ? 0 : c.constellation} · Lv ${c.level}</div></div>
        <div class="score">${c.score}</div>
      </div>`).join('') || `<div class="muted" style="padding:8px">${hasReport() ? 'No match' : 'Import an export to see characters.'}</div>`;
    $$('#charList .crow').forEach((el) => el.onclick = () => {
      state.char = el.dataset.char;
      state.build = 0;
      SETTINGS = saveSettings({ lastCharacter: state.char });
      renderCharList();
      renderChar();
    });
    if (opts.scrollActive) scrollActiveCharacterIntoView();
    else listEl.scrollTop = keepTop;
    if (changed) renderChar();
  }

  function renderChar() {
    hideHelpTip();
    const c = (R.characters || []).find((x) => x.key === state.char) || (R.characters || [])[0];
    if (!c) {
      $('#identityCard').innerHTML = '<div class="sideTitle">Character</div><div class="muted small">No account data loaded.</div>';
      $('#weaponSide').innerHTML = '<div class="sideTitle">Weapon</div><div class="muted small">No account data loaded.</div>';
      if (hasReport()) {
        $('#charDetail').innerHTML = '<div class="muted">No characters analyzed.</div>';
      } else {
        $('#charDetail').innerHTML = `<div class="bootEmpty">
          <h2>Load your GOOD export</h2>
          <p>This page ships without account data. Choose a GOOD JSON export to calculate artifacts, builds, targets, weapons, and cleanup verdicts for your own account.</p>
          <p>Everything runs locally in your browser; the file is never uploaded.</p>
          <button class="btn" id="bootImportBtn">Choose GOOD export</button>
        </div>`;
        const btn = $('#bootImportBtn');
        if (btn) btn.onclick = () => $('#importFile').click();
      }
      return;
    }
    state.char = c.key;
    const br = c.builds[state.build] || c.builds[0];
    const bd = br.build;
    const candMap = br.slotCandidates || Object.fromEntries(SLOTS.map((s) => [s, br.pieces.filter((p) => p.slot === s)]));
    const equippedBySlot = {};
    for (const a of (R.artifacts || []).filter((x) => x.location === c.key)) {
      equippedBySlot[a.slot] = (candMap[a.slot] || []).find((p) => p.id === a.id) || enrichArtifactPiece(a);
    }
    const pieceById = {};
    for (const arr of Object.values(candMap)) for (const p of arr) pieceById[p.id] = p;
    for (const p of Object.values(equippedBySlot)) pieceById[p.id] = p;
    for (const b of c.builds) for (const p of b.pieces) pieceById[p.id] = p;

    const baseKey = c.key + '|' + state.build;
    if (state.baseKey !== baseKey) {
      state.baseKey = baseKey;
      state.passiveOff = false;
      state.passiveOption = 0;
      state.setOff = false;
      state.setOption = 0;
      state.talentOff = false;
      state.talentOption = 0;
      state.weaponKey = null;
      state.weaponTargets = {};
      state.modeKey = null;
    }
    const rawOwned = (R.weapons || []).filter((w) => w.type === c.weaponType);
    const byWeaponKey = new Map();
    const copyScore = (w) => (w.location === c.key ? 1e12 : 0) + (w.level || 0) * 1000 + (w.refinement || 1) * 10 + (w.location ? 0 : 1);
    for (const w of rawOwned) {
      const cur = byWeaponKey.get(w.key);
      if (!cur || copyScore(w) > copyScore(cur)) byWeaponKey.set(w.key, w);
    }
    const equippedCopy = rawOwned.find((w) => w.key === c.weapon && w.location === c.key) || rawOwned.find((w) => w.key === c.weapon);
    if (equippedCopy) byWeaponKey.set(c.weapon, equippedCopy);
    const ownedWeapons = [...byWeaponKey.values()];
    const equippedWeapon = ownedWeapons.find((w) => w.key === c.weapon) || (c.weapon ? {
      key: c.weapon,
      name: camel(c.weapon),
      type: c.weaponType,
      level: c.weaponLevel || 90,
      ascension: 6,
      refinement: c.weaponRefine || 1,
      location: c.key,
      baseAtk: br.ctx.weapon ? br.ctx.weapon.baseAtk : 0,
      sub: br.ctx.weapon ? br.ctx.weapon.sub : null,
      passive: br.ctx.weaponPassive,
      desc: c.weaponDesc || '',
    } : null);
    const recommendedWeapons = (c.recommendedWeapons || []).filter((w) => w.type === c.weaponType);
    const signatureKeys = new Set(recommendedWeapons.filter((w) => w.signature).map((w) => w.key));
    const isBis = (w) => !!w && signatureKeys.has(w.key);
    const weaponMap = new Map();
    for (const w of recommendedWeapons) weaponMap.set(w.key, w);
    for (const w of ownedWeapons) if (!weaponMap.has(w.key)) weaponMap.set(w.key, w);
    if (equippedWeapon) weaponMap.set(equippedWeapon.key, equippedWeapon);
    const selectedWeapon = (state.weaponKey && weaponMap.get(state.weaponKey)) || equippedWeapon || null;
    const activeCtx = {
      ...br.ctx,
      weapon: selectedWeapon ? { baseAtk: selectedWeapon.baseAtk, sub: selectedWeapon.sub } : null,
      weaponPassive: selectedWeapon ? selectedWeapon.passive : null,
      weaponLevel: selectedWeapon ? selectedWeapon.level : null,
      weaponAsc: selectedWeapon ? selectedWeapon.ascension : null,
    };
    const activeBr = { ...br, ctx: activeCtx };
    let t;
    if (selectedWeapon && selectedWeapon.key === c.weapon) {
      t = br.targets;
    } else {
      const tk = c.key + '|' + state.build + '|' + (selectedWeapon ? selectedWeapon.key : '__none__');
      if (!state.weaponTargets[tk]) state.weaponTargets[tk] = targetsFor(br.build, activeCtx, c);
      t = state.weaponTargets[tk];
    }
    const rec = state.passiveOff && br.off ? br.off : br;
    const modeKey = baseKey;
    if (state.modeKey !== modeKey) {
      if (state.loadoutMode !== 'equipped') state.loadoutMode = 'recommended';
      state.sel = {};
      if (state.loadoutMode === 'equipped') {
        for (const s of SLOTS) if (equippedBySlot[s]) state.sel[s] = equippedBySlot[s];
      } else {
        for (const p of rec.pieces) state.sel[p.slot] = p;
      }
      state.modeKey = modeKey;
      state.slotCompare = {};
      state.pickSlot = 'flower';
      state.pickId = null;
    }
    if (state.loadoutMode !== 'equipped') {
      for (const s of SLOTS) if (!state.sel[s]) { const p = rec.pieces.find((x) => x.slot === s); if (p) state.sel[s] = p; }
    }

    const selectedKey = selectedWeapon ? selectedWeapon.key : '__none__';
    const weaponMeta = (w) => `Lv ${w.level}${w.refinement ? ` R${w.refinement}` : ''}`;
    const weaponBadges = (w) => {
      if (!w) return '';
      const badges = `${isBis(w) ? '<span class="wbadge bis">BIS</span>' : ''}${w.preview ? '<span class="wbadge try">TRY</span>' : ''}`;
      return badges ? `<span class="wbadges">${badges}</span>` : '';
    };
    const weaponItem = (w) => {
      if (w.none) return `<button type="button" class="weaponItem none ${selectedWeapon ? '' : 'on'}" data-weapon="__none__"><span class="wname">No weapon equipped in game</span><span class="wmeta">Base stats only</span></button>`;
      return `<button type="button" class="weaponItem r${w.rarity || 3} ${w.key === selectedKey ? 'on' : ''}" data-weapon="${esc(w.key)}" title="${esc(w.name)}"><span class="wname" title="${esc(w.name)}">${esc(w.name)}</span>${weaponBadges(w)}<span class="wmeta">${esc(weaponMeta(w))}</span></button>`;
    };
    const weaponSection = (label, items) => items.length
      ? `<div class="weaponSection"><div class="weaponSectionLabel">${esc(label)}</div>${items.map(weaponItem).join('')}</div>`
      : '';
    const recommendedRest = recommendedWeapons.filter((w) => !equippedWeapon || w.key !== equippedWeapon.key);
    const signatureRecs = recommendedRest.filter((w) => w.signature);
    const fiveRecs = recommendedRest.filter((w) => !w.signature && w.rarity === 5);
    const fourRecs = recommendedRest.filter((w) => !w.signature && w.rarity === 4);
    const threeRecs = recommendedRest.filter((w) => !w.signature && w.rarity === 3);
    const lowerRecs = recommendedRest.filter((w) => !w.signature && w.rarity < 3);
    const recommendedKeys = new Set(recommendedWeapons.map((w) => w.key));
    const otherOwned = ownedWeapons
      .filter((w) => (!equippedWeapon || w.key !== equippedWeapon.key) && !recommendedKeys.has(w.key))
      .sort((a, b) => (b.rarity || 0) - (a.rarity || 0) || b.level - a.level || (b.refinement || 1) - (a.refinement || 1) || a.name.localeCompare(b.name));
    const weaponMenu = [
      weaponSection(isBis(equippedWeapon) ? 'Equipped in game · Signature BIS' : 'Equipped in game', equippedWeapon ? [equippedWeapon] : [{ none: true }]),
      weaponSection('Signature BIS', signatureRecs),
      weaponSection('5-star recommendations', fiveRecs),
      weaponSection('4-star recommendations', fourRecs),
      weaponSection('3-star recommendations', threeRecs),
      weaponSection('Other recommendations', lowerRecs),
      weaponSection('Other owned weapons', otherOwned),
    ].join('');
    const weaponSummary = selectedWeapon
      ? `${selectedWeapon.key === c.weapon ? 'Equipped' : selectedWeapon.preview ? 'TRY' : 'Trial'}: ${selectedWeapon.name} Lv ${selectedWeapon.level}${selectedWeapon.refinement ? ` R${selectedWeapon.refinement}` : ''}`
      : 'No weapon equipped in game';
    const weaponButton = `<button type="button" id="weaponBtn" class="weaponBtn r${selectedWeapon ? selectedWeapon.rarity : 0}" title="${esc(weaponSummary)}"><span class="wname" title="${esc(selectedWeapon ? selectedWeapon.name : 'No weapon equipped in game')}">${esc(selectedWeapon ? selectedWeapon.name : 'No weapon equipped in game')}</span>${weaponBadges(selectedWeapon)}<span class="wmeta">${esc(selectedWeapon ? weaponMeta(selectedWeapon) : 'Base stats only')}</span><span class="caret">▾</span></button>`;
    const weaponMenuHtml = `<div class="weaponMenu hide" id="weaponMenu">${weaponMenu}</div>`;
    const mode = {
      weaponOff: state.passiveOff,
      weaponOption: state.passiveOption || 0,
      setOff: state.setOff,
      setOption: state.setOption || 0,
      talentOff: state.talentOff,
      talentOption: state.talentOption || 0,
    };
    const recSt = computeStats(rec.pieces, activeCtx, mode);
    const recScore = scoreOf(rec.pieces, activeBr, mode);
    const wp = activeCtx.weaponPassive;
    const wpSel = selectPassive(wp, state.passiveOption || 0, !state.passiveOff);
    const set4 = R.summary.setEffects && R.summary.setEffects[bd.set] ? R.summary.setEffects[bd.set].four : '';
    const weaponCard = pcard('weapon', 'Weapon Passive', !state.passiveOff, 'wpToggle',
      passiveSummary(wpSel),
      passiveBody(wpSel, selectedWeapon ? selectedWeapon.desc : c.weaponDesc),
      wp && wp.options ? `<select id="wpOption" class="pselect inline">${wp.options.map((o, i) => `<option value="${i}" ${i === (state.passiveOption || 0) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>` : '',
      !!(wp && wp.hasConditional),
      'Toggle conditional weapon passive');
    const sp = activeCtx.setPassive;
    const spSel = selectPassive(sp, state.setOption || 0, !state.setOff);
    const setTwoStats = bd.comp === '4pc' && bd.set ? (R.summary.setTwo[bd.set] || {}) : {};
    const setAlwaysStats = { ...((spSel && spSel.always && spSel.always.stats) || {}) };
    for (const [k, v] of Object.entries(setTwoStats)) setAlwaysStats[k] = (setAlwaysStats[k] || 0) + v;
    const setDisplay = {
      always: {
        stats: setAlwaysStats,
        conversions: (spSel && spSel.always && spSel.always.conversions) || [],
        damage: (spSel && spSel.always && spSel.always.damage) || {},
        note: (spSel && spSel.always && spSel.always.note) || '',
      },
      stats: (spSel && spSel.stats) || {},
      conversions: (spSel && spSel.conversions) || [],
      damage: (spSel && spSel.damage) || {},
      options: (spSel && spSel.options) || null,
      hasConditional: !!(spSel && spSel.hasConditional),
      enabled: !state.setOff,
      note: (spSel && spSel.note) || '',
    };
    const setOptions = sp && sp.options ? `<select id="setOption" class="pselect inline">${sp.options.map((o, i) => `<option value="${i}" ${i === (state.setOption || 0) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>` : '';
    const setCount = (bd.set ? 1 : 0) + (sp ? 1 : 0);
    const setCard4 = bd.comp === '4pc' ? pcard('set', setCount > 1 ? 'Set Passives' : 'Set Passive', !state.setOff, 'setToggle',
      passiveSummary(setDisplay),
      passiveBody(setDisplay, set4),
      setOptions,
      !!(sp && sp.hasConditional),
      'Toggle conditional 4-piece set passive') : '';
    let setTwoCard = '';
    if (bd.comp === '2pc+2pc') {
      const cnt = {};
      for (const p of rec.pieces) cnt[p.set] = (cnt[p.set] || 0) + 1;
      let twoSets = Object.keys(cnt).filter((s) => cnt[s] >= 2 && s !== '__off__' && s !== '__none__');
      if (!twoSets.length && bd.set) twoSets = [bd.set];
      const twoStats = {};
      for (const s of twoSets) for (const [k, v] of Object.entries(R.summary.setTwo[s] || {})) twoStats[k] = (twoStats[k] || 0) + v;
      const twoDesc = twoSets.map((s) => R.summary.setEffects[s]?.two).filter(Boolean).join(' ');
      const twoDisplay = {
        always: { stats: twoStats, conversions: [], damage: {}, note: twoDesc },
        stats: {}, conversions: [], damage: {},
        options: null,
        hasConditional: false,
        enabled: true,
        note: twoDesc,
      };
      setTwoCard = pcard('set', twoSets.length > 1 ? 'Set Passives' : 'Set Passive', true, '',
        passiveSummary(twoDisplay),
        passiveBody(twoDisplay, ''),
        '',
        false);
    }
    const tp = activeCtx.talentPassive;
    const tpSel = selectPassive(tp, state.talentOption || 0, !state.talentOff);
    const talentOptions = tp && tp.options ? `<select id="talentOption" class="pselect inline">${tp.options.map((o, i) => `<option value="${i}" ${i === (state.talentOption || 0) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>` : '';
    const talentCard = pcard('talent', 'Character Passives', !state.talentOff, 'talentToggle',
      passiveSummary(tpSel),
      tp ? passiveBody(tpSel, '') : '<div class="small muted">No stat-sheet character passive modeled for this character.</div>',
      talentOptions,
      !!(tp && tp.hasConditional),
      'Toggle conditional character passive');

    const buildChips = `<div class="buildchips" id="buildChips">
      <button type="button" class="buildchip ${state.loadoutMode === 'equipped' ? 'on' : ''}" data-loadout="equipped">Equipped</button>
      ${c.builds.map((x, i) => `<button type="button" class="buildchip ${state.loadoutMode !== 'equipped' && state.build === i ? 'on' : ''}" data-build="${i}" title="${esc(buildName(x.build))}">${esc(buildName(x.build))}</button>`).join('')}
    </div>`;

    const candidatePieces = (slot) => {
      const map = new Map();
      for (const p of candMap[slot] || []) map.set(p.id, p);
      if (equippedBySlot[slot] && !map.has(equippedBySlot[slot].id)) map.set(equippedBySlot[slot].id, equippedBySlot[slot]);
      if (state.sel[slot] && !map.has(state.sel[slot].id)) map.set(state.sel[slot].id, state.sel[slot]);
      const list = [...map.values()]
        .sort((a, b) => ((b.level >= 20) - (a.level >= 20)) || ((b.score || 0) - (a.score || 0)) || ((b.projected || 0) - (a.projected || 0)));
      const capped = list.slice(0, 12);
      const current = state.sel[slot];
      if (current && !capped.some((p) => p.id === current.id)) {
        if (capped.length >= 12) capped[11] = current;
        else capped.push(current);
      }
      return capped;
    };
    const artSubMax = (p, key) => {
      const table = ((GD().artSub || {})[String(p.rarity || 5)] || (GD().artSub || {})['5'] || {})[key];
      if (table && table.length) return table[table.length - 1];
      return (R.summary.maxRoll && R.summary.maxRoll[key]) || 0;
    };
    const artRollInfo = (p) => {
      const subs = p.subs || [];
      let units = 0;
      for (const s of subs) {
        const max = artSubMax(p, s.key);
        if (max) units += s.val / max;
      }
      const upgrades = Math.floor((p.level || 0) / 4);
      const startingLines = p.totalRolls != null
        ? Math.max(3, Math.min(4, p.totalRolls - upgrades))
        : Math.max(3, Math.min(4, Math.round(units - upgrades)));
      const rolls = Math.max(0, upgrades - (startingLines === 3 ? 1 : 0));
      const useful = new Set(((br.build && br.build.subs) || []).filter((x) => x.w > 0).map((x) => x.key));
      let score = 0;
      for (const s of subs) {
        if (!useful.has(s.key)) continue;
        const max = artSubMax(p, s.key);
        if (max) score += s.val / max;
      }
      return { rolls, score };
    };
    const artValue = (s) => PCT.has(s.key) ? (s.val * 100).toFixed(1) + '%' : Math.round(s.val);
    const artDelta = (key, delta) => {
      const pct = PCT.has(key);
      const abs = Math.abs(delta);
      if (pct ? abs < 0.0005 : abs < 0.5) return null;
      return {
        txt: `${delta > 0 ? '+' : '-'}${pct ? (abs * 100).toFixed(1) + '%' : Math.round(abs)}`,
        cls: delta > 0 ? 'up' : 'down',
      };
    };
    const artifactStatCard = (p, showOn = false, other = null) => {
      if (!p) return '<div class="artifactStatCard empty"><div class="artStatName">Empty</div><div class="artStatSubs"><span class="artSub"></span><span class="artSub"></span><span class="artSub"></span><span class="artSub"></span></div></div>';
      const info = artRollInfo(p);
      const mainVal = p.mainVal != null ? fmtPassiveVal(p.main, p.mainVal) : '';
      const mainCmp = other && other.main === p.main ? artDelta(p.main, (p.mainVal || 0) - (other.mainVal || 0)) : null;
      const allSubs = [...(p.subs || []), ...((p.hidden || []).map((h) => ({ ...h, hidden: true })))].slice(0, 4);
      const otherSubs = other ? [...(other.subs || []), ...((other.hidden || []).map((h) => ({ ...h, hidden: true })))].slice(0, 4) : [];
      const otherMap = new Map();
      for (const o of otherSubs) if (!otherMap.has(o.key)) otherMap.set(o.key, o);
      const used = new Set();
      const rows = [];
      for (const s of allSubs) {
        const o = otherMap.get(s.key);
        if (o) {
          used.add(o.key);
          rows.push({ cur: s, other: o, matched: true, delta: artDelta(s.key, s.val - o.val) });
        } else {
          const spare = otherSubs.find((x) => !used.has(x.key) && !allSubs.some((c) => c.key === x.key));
          if (spare) used.add(spare.key);
          rows.push({ cur: s, other: spare || null, matched: false, delta: null });
        }
      }
      if (other) {
        for (const o of otherSubs) {
          if (!used.has(o.key) && !allSubs.some((c) => c.key === o.key)) rows.push({ cur: null, other: o, matched: false, delta: null });
        }
      }
      const subs = Array.from({ length: 4 }, (_, i) => {
        const row = rows[i];
        if (!row) return '<span class="artSub"></span>';
        const { cur, other: o, matched, delta } = row;
        const curName = cur ? shortStatLabel(cur.key) : '';
        const curVal = cur ? artValue(cur) : '';
        const otherName = o && !matched ? shortStatLabel(o.key) : '';
        const otherVal = o && !matched ? artValue(o) : '';
        return `<span class="artSub ${cur && cur.hidden ? 'hiddenSub' : ''}" title="${cur && cur.hidden ? 'Unactivated substat' : ''}">
          <span class="artSubName"><span class="artSubCurName">${curName}</span>${otherName ? `<span class="artSubOtherName">${otherName}</span>` : ''}</span>
          <span class="artSubVals">${otherVal ? `<span class="artSubOtherVal">${otherVal}</span>` : ''}${delta ? `<span class="artSubDelta ${delta.cls}">${delta.txt}</span>` : ''}${curVal ? `<span class="artSubVal ${delta ? delta.cls : ''}">${curVal}</span>` : ''}</span>
        </span>`;
      }).join('');
      return `<div class="artifactStatCard">
        <div class="artStatName" title="${esc(setLabel(p.setKey))} · useful roll score ${info.score.toFixed(1)}"><span class="artNameText">${esc(setLabel(p.setKey))}</span><span class="artNameScore">${info.score.toFixed(1)}</span></div>
        <div class="artStatMain" title="${esc(statLabel(p.main))} ${mainVal}"><span class="artMainLabel">${esc(shortStatLabel(p.main))}</span>${mainCmp ? `<span class="artMainDelta ${mainCmp.cls}">${mainCmp.txt}</span>` : ''}<span class="artMainVal ${mainCmp ? mainCmp.cls : ''}">${mainVal}</span></div>
        <div class="artStatSubs">${subs}</div>
        ${showOn ? `<div class="artStatOn">${p.location ? `On ${esc(charLabel(p.location))}` : 'Free'}</div>` : ''}
      </div>`;
    };
    const slotStats = (slot) => {
      const p = state.sel[slot] || null;
      const eq = equippedBySlot[slot] || null;
      let other = null;
      if (eq) other = (p && p.id === eq.id) ? (state.slotCompare[slot] || null) : eq;
      return `<div class="slotStats cell ${state.pickSlot === slot ? 'sel' : ''}" data-art-slot="${slot}">${artifactStatCard(p, false, other)}</div>`;
    };
    const circleSlot = (slot, idx) => {
      const p = state.sel[slot] || null;
      const eq = equippedBySlot[slot] || null;
      const saved = state.slotCompare[slot] || null;
      const info = p ? artRollInfo(p) : null;
      const isEq = !!(p && eq && p.id === eq.id);
      const canSwitch = !!(eq && (!p || p.id !== eq.id || !!saved));
      return `<div class="circleSlotWrap" data-slot="${slot}" style="--slot-delay:${idx * 35}ms">
        <div class="circleSlot r${p ? p.rarity || 5 : 0} ${p ? 'filled' : 'empty'} ${state.pickSlot === slot ? 'sel' : ''}" data-art-slot="${slot}" tabindex="0" title="${p ? `${esc(setLabel(p.setKey))} · ${esc(statLabel(p.main))} · +${p.level} · ${info.rolls} rolls` : 'Empty slot'}">
          <span class="circleGlyph">${p ? SLOT_GLYPH[slot] : '·'}</span>
          ${info ? `<span class="circleRolls">${info.rolls}</span>` : ''}
          <span class="circleLevel">${p ? `+${p.level}` : '—'}</span>
          ${canSwitch ? `<button type="button" class="circleEquipToggle ${isEq && saved ? 'on' : ''}" data-slot="${slot}" title="${isEq ? 'Switch to the previewed artifact' : 'Switch to the in-game equipped artifact'}">⇄</button>` : ''}
        </div>
      </div>`;
    };
    const slotsLayout = () => `<div class="loadoutU">
        ${slotStats('flower')}
        <div class="slotCluster">
          <div class="slotClusterRow">${circleSlot('flower', 0)}${circleSlot('plume', 1)}</div>
          <div class="slotClusterRow">${circleSlot('sands', 2)}${circleSlot('goblet', 3)}${circleSlot('circlet', 4)}</div>
        </div>
        ${slotStats('plume')}
        ${slotStats('sands')}
        ${slotStats('goblet')}
        ${slotStats('circlet')}
      </div>`;
    const previewPiece = () => {
      const cands = candidatePieces(state.pickSlot);
      return (state.pickId && cands.find((p) => p.id === state.pickId)) || state.sel[state.pickSlot] || cands[0] || null;
    };
    const pickerItem = (p, preview) => {
      const isSel = !!(preview && preview.id === p.id);
      const current = !!(state.sel[state.pickSlot] && state.sel[state.pickSlot].id === p.id);
      const info = artRollInfo(p);
      return `<button type="button" class="pickerItem r${p.rarity || 5} ${isSel ? 'sel' : ''} ${current ? 'current' : ''}" draggable="true" data-pick-slot="${state.pickSlot}" data-pick-id="${esc(p.id)}" title="${esc(setLabel(p.setKey))} · ${esc(statLabel(p.main))} · +${p.level} · ${info.rolls} rolls${current ? ' · equipped now' : ''}">
        <span class="pickerGlyph">${SLOT_GLYPH[state.pickSlot]}</span>
        <span class="pickerRolls">${info.rolls}</span>
        <span class="pickerLevel">${p.level >= 20 ? '+20' : `+${p.level}`}</span>
      </button>`;
    };
    const pickerDetail = (p) => {
      if (!p) return '<div class="pickerDetail muted small">No artifact selected.</div>';
      const cur = state.sel[state.pickSlot];
      const other = cur && p && cur.id !== p.id ? cur : null;
      return `<div class="pickerDetail">${artifactStatCard(p, true, other)}</div>`;
    };
    const pickerInner = () => {
      const cands = candidatePieces(state.pickSlot);
      const preview = previewPiece();
      return `<div class="pickerHead"><b>${SLOT[state.pickSlot]} candidates</b><span>${cands.length} pieces · click to preview, drag onto the slot to equip</span></div>
        <div class="pickerBody">
          <div class="pickerList">${cands.map((p) => pickerItem(p, preview)).join('') || '<div class="small muted">No artifacts</div>'}</div>
          ${pickerDetail(preview)}
        </div>`;
    };
    const loadoutBlock = `<div class="loadoutBlock">
      <div class="loadoutHead">
        <h3>Artifact loadout ${helpq('Two top artifacts with stats beside them and three bottom artifacts with stats below. Click a circular slot to choose it, then click a candidate to preview its stats or drag it onto the slot to equip it. A changed slot gets a Prev/Now switch.')}</h3>
        <div class="loadoutActions">${state.loadoutMode === 'custom' ? '<span class="pill">Custom</span>' : ''}<button type="button" class="btn slim" id="loadoutReset">Reset</button></div>
      </div>
      ${buildChips}
      <div class="artifactSlots" id="artifactSlots">${slotsLayout()}</div>
      <div class="artifactPicker" id="artifactPicker">${pickerInner()}</div>
      <div class="small muted loadoutHint">Select a slot to see its candidate list. Drag a candidate onto its slot to equip it.</div>
    </div>`;

    const maxedRows = SLOTS.map((slot) => {
      const allCands = (candMap[slot] || []).filter((p) => p.kind === 'maxed');
      const chosen = rec.pieces.find((p) => p.slot === slot);
      const chosenSame = !!(chosen && bd.set && chosen.set === bd.set);
      const sameSetCands = allCands.filter((p) => p.sameSet);
      const cands = (chosenSame && sameSetCands.length) ? sameSetCands : allCands;
      if (!cands.length) return `<tr><td>${SLOT[slot]}</td><td colspan="5" class="muted">No +20 alternative in your inventory.</td></tr>`;
      let best = null;
      for (const p of cands) {
        const combo = rec.pieces.map((x) => (x.slot === slot ? p : x));
        const st = computeStats(combo, activeCtx, mode);
        const sc = scoreOf(combo, activeBr, mode);
        if (!best || sc > best.sc) best = { p, st, sc, combo };
      }
      const d = deltaText(best.st, recSt);
      const delta = best.sc - recScore;
      const warn = breaks4pc(best.combo, bd) ? '<br><span style="color:var(--warn)">⚠ breaks the 4-piece set</span>' : '';
      const idx = (candMap[slot] || []).findIndex((x) => x.id === best.p.id);
      return `<tr><td>${SLOT[slot]}</td><td><b>${esc(setLabel(best.p.setKey))}</b> · ${esc(statLabel(best.p.main))}<div class="subs">${best.p.subs.map(fmtSub).join(' · ')}</div>${hiddenLine(best.p)}</td><td>+${best.p.level}</td><td>${best.sc} <span class="muted">(${delta >= 0 ? '+' : ''}${delta})</span></td><td class="subs">${d || 'no change'}${warn}</td><td><button class="btn previewBtn" data-slot="${slot}" data-idx="${idx}">Preview</button></td></tr>`;
    }).join('');

    const potentialRows = SLOTS.map((slot) => {
      const recPiece = rec.pieces.find((p) => p.slot === slot);
      const chosenCand = (candMap[slot] || []).find((p) => recPiece && p.id === recPiece.id);
      const chosenProjected = chosenCand ? chosenCand.projected : 0;
      const allPot = (candMap[slot] || []).filter((p) => p.kind === 'potential');
      const same = allPot.filter((p) => p.sameSet)
        .map((p) => ({ p, gain: p.projected - chosenProjected }))
        .filter((x) => x.gain >= -10)
        .sort((a, b) => b.gain - a.gain).slice(0, 2);
      const other = allPot.filter((p) => !p.sameSet)
        .map((p) => ({ p, gain: p.projected - chosenProjected }))
        .filter((x) => x.gain >= 5)
        .sort((a, b) => b.gain - a.gain).slice(0, 2);
      const cands = [...same, ...other];
      if (!cands.length) return `<tr><td>${SLOT[slot]}</td><td colspan="5" class="muted">No unleveled piece is likely to beat the current piece.</td></tr>`;
      if (!cands.length) return `<tr><td>${SLOT[slot]}</td><td colspan="5" class="muted">No unleveled candidates.</td></tr>`;
      return cands.map((x, i) => {
        const idx = (candMap[slot] || []).findIndex((y) => y.id === x.p.id);
        const combo = rec.pieces.map((y) => (y.slot === slot ? x.p : y));
        const breaks = breaks4pc(combo, bd);
        const note = x.gain >= 0
          ? (breaks ? '⚠ Beats it on raw stats, but breaks the 4-piece set' : 'Could beat the current piece at +20')
          : (breaks ? '⚠ Behind, and breaks the 4-piece set' : 'Close, but currently behind');
        return `<tr><td>${i === 0 ? SLOT[slot] : ''}</td><td><b>${esc(setLabel(x.p.setKey))}</b> · ${esc(statLabel(x.p.main))} · +${x.p.level}<div class="subs">${x.p.subs.map(fmtSub).join(' · ')}</div>${hiddenLine(x.p)}</td><td>${x.p.score}</td><td>${x.p.projected} <span class="muted">(${x.gain >= 0 ? '+' : ''}${Math.round(x.gain)})</span></td><td class="subs">${note}</td><td><button class="btn previewBtn" data-slot="${slot}" data-idx="${idx}">Preview</button></td></tr>`;
      }).join('');
    }).join('');

    const idTag = (kind, val, label) => {
      const title = kind === 'element' ? 'Element' : kind === 'weapon' ? 'Weapon' : 'Region';
      return `<span class="idTag" title="${esc(title)}: ${esc(label)}"><img src="${filterIconSrc(kind, val)}" alt=""><span>${esc(label)}</span></span>`;
    };
    const weaponStatHtml = selectedWeapon
      ? `<div class="weaponSideStats">
          <div><span>Base ATK</span><b>${nf(selectedWeapon.baseAtk)}</b></div>
          ${selectedWeapon.sub ? `<div><span>${esc(statLabel(selectedWeapon.sub.key))}</span><b>${fmtPassiveVal(selectedWeapon.sub.key, selectedWeapon.sub.val)}</b></div>` : ''}
        </div>`
      : '<div class="small muted" style="margin-top:6px">No weapon equipped.</div>';
    $('#identityCard').innerHTML = `
      <div class="idName">${esc(charLabel(c.key))}</div>
      <div class="idSub">Lv ${c.level} · C${c.constellation == null ? 0 : c.constellation}</div>
      <div class="idTags">
        ${c.ele ? idTag('element', c.ele, eleLabel(c.ele)) : ''}
        ${c.weaponType ? idTag('weapon', c.weaponType, weaponLabel(c.weaponType)) : ''}
        ${c.region ? idTag('region', c.region, regionLabel(c.region)) : ''}
      </div>
      <div class="scorebox" id="scoreNow"></div>`;
    const weaponStatus = selectedWeapon
      ? (selectedWeapon.key === c.weapon
        ? 'Equipped in game'
        : selectedWeapon.preview
          ? 'Previewing, you do not own this weapon.'
          : selectedWeapon.location
            ? `Equipped on ${charLabel(selectedWeapon.location)}`
            : 'Trial weapon · not equipped')
      : 'No weapon equipped';
    $('#weaponSide').innerHTML = `
      <div class="sideTitle">Weapon ${helpqRight('Weapon trials update stats, targets, passive cards, and swap tables. Artifacts stay as currently selected. Recommended weapons you do not own are TRY weapons at Lv 90 R1. The line under the picker shows whether the selected weapon is equipped in game, equipped on another character, or unequipped.')}</div>
      <div class="weaponPick" id="weaponPick">${weaponButton}${weaponMenuHtml}</div>
      <div class="weaponStatus">${esc(weaponStatus)}</div>
      ${weaponStatHtml}`;
    $('#charDetail').innerHTML = `
      <div class="buildbar">
        <span class="small muted">Target build ${helpq(targetHelpText(t))}</span>
        <span class="pill">${esc(bd.comp)}</span>
        <span class="pill">${bd.set ? esc(setLabel(bd.set)) : 'no set'}</span>
        <span class="pill" id="loadoutModePill">${state.loadoutMode === 'equipped' ? 'Equipped artifacts' : state.loadoutMode === 'custom' ? 'Custom loadout' : 'Recommended loadout'}</span>
      </div>
      ${loadoutBlock}
      ${weaponCard}
      ${setCard4}
      ${setTwoCard}
      ${talentCard}
      <div class="statHeadRow">
        <span class="small muted">Stats ${helpq('Only stats relevant to the selected build are shown by default. Switch to all stats to include every stat. The S/A/B/C/D/F badge grades the value against the min/max targets. Hover a stat card for about a second to see its full source breakdown.')}</span>
        <button type="button" class="btn slim ${state.showAllStats ? 'on' : ''}" id="showAllStats">${state.showAllStats ? 'Build stats only' : 'Show all stats'}</button>
      </div>
      <div class="statgrid" id="statGrid"></div>
      <div class="small" id="deltaLine" style="margin:-6px 0 14px"></div>
      <h3 style="margin:18px 0 6px">Best +20 swap per slot ${helpq('The best max-level piece you own for each slot, preferring the target set, and what swapping it in would do to the recommended build.')}</h3>
      <table><thead><tr><th>Slot</th><th>Candidate</th><th>Level</th><th>Score</th><th>Stat change</th><th></th></tr></thead><tbody>${maxedRows}</tbody></table>
      <h3 style="margin:18px 0 6px">Unleveled pieces worth rolling ${helpq('Unleveled pieces whose projected +20 score is close to or better than the current piece. Projected scores assume average rolls.')}</h3>
      <table><thead><tr><th>Slot</th><th>Candidate</th><th>Now</th><th>Projected</th><th>Note</th><th></th></tr></thead><tbody>${potentialRows}</tbody></table>`;
    $('#talentPane').innerHTML = talentsPane(c, br);
    $('#constellationPane').innerHTML = constellationsPane(c);
    showSubtab(state.subtab);

    function refresh() {
      const pieces = SLOTS.map((s) => state.sel[s]).filter(Boolean);
      const st = computeStats(pieces, activeCtx, mode);
      const gs = computeStats(pieces, { ...activeCtx, weaponPassive: null, talentPassive: null }, mode);
      const sc = scoreOf(pieces, activeBr, mode);
      const d = deltaText(st, recSt);
      const warn = breaks4pc(pieces, bd) ? ' · <span style="color:var(--warn)">⚠ breaks the 4-piece set</span>' : '';
      const charRarity = (GD().chars[c.goKey] && GD().chars[c.goKey].rarity) || c.rarity || 4;
      const rarity = charRarity >= 5 ? 5 : 4;
      $('#scoreNow').innerHTML = `<div class="scoreTop"><div class="scoreCopy"><div class="muted small">Artifact score</div><div class="score" style="font-size:18px"><b>${sc}</b> / 300</div></div><img class="rarityStars" src="icons/rarity/${rarity}.png" alt="${rarity}-star character" title="${rarity}-star character"></div><div class="scorebar" style="margin-left:0"><i style="width:${Math.min(100, sc / 3)}%"></i></div>`;
      const hintAtk = passiveTouchesStat(activeCtx.weaponPassive, ['atk', 'atk_']) || passiveTouchesStat(activeCtx.talentPassive, ['atk', 'atk_']);
      const hintEm = passiveTouchesStat(activeCtx.weaponPassive, ['eleMas']) || passiveTouchesStat(activeCtx.talentPassive, ['eleMas']);
      $('#statGrid').innerHTML = statCardsFor(st, t, null, br.build, { atk: hintAtk, em: hintEm, showAll: state.showAllStats });
      bindStatPopups();
      $('#deltaLine').innerHTML = (d ? `<span class="muted">vs recommended:</span> ${d}` : '') + warn;
    }

    function bindPicker() {
      const picker = $('#artifactPicker');
      if (!picker) return;
      picker.querySelectorAll('.pickerItem').forEach((el) => {
        el.onclick = (e) => {
          e.preventDefault();
          state.pickSlot = el.dataset.pickSlot;
          state.pickId = el.dataset.pickId;
          updatePicker();
        };
        el.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', el.dataset.pickId);
          e.dataTransfer.effectAllowed = 'copy';
          state.pickSlot = el.dataset.pickSlot;
          state.pickId = el.dataset.pickId;
        };
      });
    }
    function updatePicker() {
      const picker = $('#artifactPicker');
      if (!picker) return;
      picker.innerHTML = pickerInner();
      bindPicker();
    }
    function setSlotPiece(slot, p) {
      if (!p) return;
      const current = state.sel[slot];
      if (current && current.id === p.id) return;
      state.sel[slot] = p;
      state.slotCompare[slot] = null;
      state.pickSlot = slot;
      state.pickId = p.id;
      state.loadoutMode = 'custom';
      updateLoadout(slot);
    }
    function toggleEquipped(slot) {
      const eq = equippedBySlot[slot];
      if (!eq) return;
      const current = state.sel[slot];
      if (current && current.id === eq.id) {
        const other = state.slotCompare[slot];
        if (!other) return;
        state.sel[slot] = other;
      } else {
        state.slotCompare[slot] = current || null;
        state.sel[slot] = eq;
      }
      state.pickSlot = slot;
      state.pickId = state.sel[slot] ? state.sel[slot].id : null;
      state.loadoutMode = 'custom';
      updateLoadout(slot);
    }
    function updateLoadout(slotAnimate) {
      const slotsEl = $('#artifactSlots');
      if (slotsEl) {
        slotsEl.classList.add('noEnter');
        slotsEl.innerHTML = slotsLayout();
      }
      const pickerEl = $('#artifactPicker');
      if (pickerEl) pickerEl.innerHTML = pickerInner();
      const modePill = $('#loadoutModePill');
      if (modePill) modePill.textContent = state.loadoutMode === 'equipped' ? 'Equipped artifacts' : state.loadoutMode === 'custom' ? 'Custom loadout' : 'Recommended loadout';
      bindLoadout();
      refresh();
      if (slotAnimate) {
        const el = document.querySelector(`#artifactSlots .circleSlotWrap[data-slot="${slotAnimate}"]`);
        if (el) {
          el.classList.add('slotDropIn');
          setTimeout(() => el.classList.remove('slotDropIn'), 420);
        }
      }
    }
    function bindLoadout() {
      const slotsEl = $('#artifactSlots');
      if (slotsEl) {
        slotsEl.querySelectorAll('[data-art-slot]').forEach((el) => {
          const slot = el.dataset.artSlot;
          el.onclick = (e) => {
            e.preventDefault();
            state.pickSlot = slot;
            state.pickId = null;
            updateLoadout();
          };
          el.ondragover = (e) => { e.preventDefault(); el.classList.add('dragOver'); };
          el.ondragleave = () => el.classList.remove('dragOver');
          el.ondrop = (e) => {
            e.preventDefault();
            el.classList.remove('dragOver');
            const p = pieceById[e.dataTransfer.getData('text/plain')];
            if (p && p.slot === slot) setSlotPiece(slot, p);
          };
        });
        slotsEl.querySelectorAll('.circleEquipToggle').forEach((btn) => {
          btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleEquipped(btn.dataset.slot); };
        });
      }
      bindPicker();
    }
    function animateLoadoutOut(cb) {
      const el = $('#artifactSlots');
      if (!el) { cb(); return; }
      el.classList.add('leaving');
      setTimeout(cb, 160);
    }
    $$('.buildchip').forEach((btn) => btn.onclick = () => {
      if (btn.dataset.loadout === 'equipped') {
        if (state.loadoutMode === 'equipped') return;
        animateLoadoutOut(() => {
          state.loadoutMode = 'equipped';
          state.modeKey = null;
          state.slotCompare = {};
          state.pickSlot = 'flower';
          state.pickId = null;
          renderChar();
        });
      } else {
        const i = +btn.dataset.build;
        if (state.build === i && state.loadoutMode === 'recommended') return;
        animateLoadoutOut(() => {
          state.build = i;
          state.loadoutMode = 'recommended';
          state.modeKey = null;
          state.slotCompare = {};
          state.pickSlot = 'flower';
          state.pickId = null;
          renderChar();
        });
      }
    });
    const loadoutReset = $('#loadoutReset');
    if (loadoutReset) loadoutReset.onclick = () => animateLoadoutOut(() => {
      state.loadoutMode = 'recommended';
      state.modeKey = null;
      state.slotCompare = {};
      state.pickSlot = 'flower';
      state.pickId = null;
      renderChar();
    });
    const showAllBtn = $('#showAllStats');
    if (showAllBtn) showAllBtn.onclick = () => { state.showAllStats = !state.showAllStats; renderChar(); };
    if ($('#weaponBtn')) $('#weaponBtn').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const menu = $('#weaponMenu');
      if (menu) menu.classList.toggle('hide');
    };
    $$('#weaponMenu .weaponItem').forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = el.dataset.weapon;
        state.weaponKey = val === '__none__' ? null : (val || null);
        state.passiveOff = false;
        state.passiveOption = 0;
        renderChar();
      };
    });
    const bindToggle = (sel, fn) => { const el = $(sel); if (el) el.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fn(); renderChar(); }; };
    bindToggle('#wpToggle', () => { state.passiveOff = !state.passiveOff; });
    bindToggle('#setToggle', () => { state.setOff = !state.setOff; });
    bindToggle('#talentToggle', () => { state.talentOff = !state.talentOff; });
    if ($('#wpOption')) $('#wpOption').onchange = (e) => { state.passiveOption = +e.target.value; renderChar(); };
    if ($('#setOption')) $('#setOption').onchange = (e) => { state.setOption = +e.target.value; renderChar(); };
    if ($('#talentOption')) $('#talentOption').onchange = (e) => { state.talentOption = +e.target.value; renderChar(); };
    $$('.phead select').forEach((s) => { s.onclick = (e) => e.stopPropagation(); });
    $$('.pcard').forEach((d) => { d.ontoggle = () => { state.passiveOpen[d.dataset.card] = d.open; }; });
    $$('.previewBtn').forEach((btn) => btn.onclick = () => {
      const slot = btn.dataset.slot;
      const p = (candMap[slot] || [])[+btn.dataset.idx];
      if (p) setSlotPiece(slot, p);
    });
    bindLoadout();
    refresh();
  }

  function cleanUsedBy(a) {
    return [...new Set([...(a.location ? [a.location] : []), ...(a.usedBy || []).map((u) => u.char)])];
  }
  const CLEAN_SORTS = {
    artifact: {
      dir: 1,
      cmp: (a, b) => setLabel(a.setKey).localeCompare(setLabel(b.setKey))
        || (SLOT[a.slot] || '').localeCompare(SLOT[b.slot] || '')
        || statLabel(a.main).localeCompare(statLabel(b.main))
        || a.level - b.level,
    },
    bestfit: {
      dir: 1,
      cmp: (a, b) => (a.fit ? charLabel(a.fit.char) : '\uffff').localeCompare(b.fit ? charLabel(b.fit.char) : '\uffff')
        || ((a.fit && a.fit.score) || 0) - ((b.fit && b.fit.score) || 0),
    },
    fit: { dir: -1, cmp: (a, b) => ((a.fit && a.fit.score) || 0) - ((b.fit && b.fit.score) || 0) },
    projected: { dir: -1, cmp: (a, b) => a.projected - b.projected },
    potential: { dir: -1, cmp: (a, b) => a.potPct - b.potPct },
    usedby: {
      dir: 1,
      cmp: (a, b) => {
        const ua = cleanUsedBy(a), ub = cleanUsedBy(b);
        return (ua.length ? charLabel(ua[0]) : '\uffff').localeCompare(ub.length ? charLabel(ub[0]) : '\uffff');
      },
    },
    verdict: {
      dir: 1,
      cmp: (a, b) => ({ KEEP: 0, LEVEL: 1, REVIEW: 2, SALVAGE: 3 }[a.verdict] ?? 9) - ({ KEEP: 0, LEVEL: 1, REVIEW: 2, SALVAGE: 3 }[b.verdict] ?? 9),
    },
  };
  function updateCleanHeaders() {
    $$('#cleanHead th[data-sort]').forEach((th) => {
      const on = state.cleanSort === th.dataset.sort;
      if (on) {
        th.dataset.dir = state.cleanSortDir > 0 ? 'asc' : 'desc';
        th.setAttribute('aria-sort', state.cleanSortDir > 0 ? 'ascending' : 'descending');
      } else {
        th.removeAttribute('data-dir');
        th.setAttribute('aria-sort', 'none');
      }
    });
  }
  function cleanFiltered() {
    const q = state.search.toLowerCase();
    let arr = R.artifacts.filter((a) => {
      if (state.verdict !== 'ALL' && a.verdict !== state.verdict) return false;
      if (state.slot !== 'ALL' && a.slot !== state.slot) return false;
      if (state.set !== 'ALL' && a.setKey !== state.set) return false;
      if (q) {
        const hay = [a.setKey, a.main, ...(a.subs || []).map((s) => s.key), ...(a.hidden || []).map((s) => s.key), a.fit && a.fit.char, a.fit && charLabel(a.fit.char), a.fit && a.fit.build, ...(a.usedBy || []).flatMap((u) => [u.char, charLabel(u.char)])].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const spec = state.cleanSort && CLEAN_SORTS[state.cleanSort];
    if (spec) {
      const dir = (state.cleanSortDir || spec.dir) < 0 ? -1 : 1;
      arr.sort((a, b) => dir * spec.cmp(a, b) || a.projected - b.projected);
    } else {
      arr.sort((a, b) => a.projected - b.projected);
    }
    return arr;
  }

  function renderClean() {
    updateCleanHeaders();
    const arr = cleanFiltered();
    $('#cleanCount').textContent = `${arr.length} matching · showing ${Math.min(state.limit, arr.length)}`;
    const rows = arr.slice(0, state.limit).map((a) => {
      const uc = cleanUsedBy(a);
      return `<tr>
      <td><b>${esc(setLabel(a.setKey))}</b><br><span class="muted">${SLOT[a.slot] || a.slot} · ${esc(statLabel(a.main))} · +${a.level}</span><div class="subs">${a.subs.map(fmtSub).join(' · ')}${a.hidden && a.hidden.length ? ` · <span style="color:var(--warn)">${a.hidden.map(fmtSub).join(' · ')}</span>` : ''}</div></td>
      <td>${a.fit ? `${esc(charLabel(a.fit.char))}<br><span class="muted">${esc(a.fit.build)}</span>` : '—'}</td>
      <td>${a.fit ? a.fit.score : '—'}</td>
      <td>${a.projected}<br><span class="muted">now ${a.current}</span></td>
      <td>${a.potPct}%</td>
      <td>${uc.length ? uc.slice(0, 2).map((x) => esc(charLabel(x))).join(', ') + (uc.length > 2 ? ` +${uc.length - 2}` : '') : '<span class="muted">—</span>'}</td>
      <td><span class="badge v-${a.verdict}">${a.verdict}</span></td>
    </tr>`;
    }).join('');
    $('#cleanBody').innerHTML = rows || '<tr><td colspan="7" class="muted">No artifacts match.</td></tr>';
    $('#moreBtn').style.display = arr.length > state.limit ? '' : 'none';
  }

  function showSubtab(tab) {
    state.subtab = tab;
    $$('#charSubtabs .subtab').forEach((b) => b.classList.toggle('on', b.dataset.subtab === tab));
    $('#charDetail').classList.toggle('hide', tab !== 'artifacts');
    $('#talentPane').classList.toggle('hide', tab !== 'talents');
    $('#constellationPane').classList.toggle('hide', tab !== 'constellation');
  }
  function showTab(tab) {
    hideHelpTip();
    state.tab = tab;
    document.body.classList.toggle('chars-active', tab === 'chars');
    $$('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $('#tab-chars').classList.toggle('hide', tab !== 'chars');
    $('#tab-clean').classList.toggle('hide', tab !== 'clean');
    if (tab === 'clean') renderClean();
  }

  function filterIconSrc(kind, val) {
    if (kind === 'region') {
      const file = val === 'nodKrai' ? 'nod-krai' : val === 'unknown' ? 'unknown' : String(val).toLowerCase();
      return `icons/region/${file}.png`;
    }
    return `icons/${kind}/${val}.webp`;
  }
  function filterCount() {
    return state.filterEle.length + state.filterWeapon.length + state.filterRegion.length;
  }
  function updateFilterClear() {
    const btn = $('#clearFiltersBtn');
    if (!btn) return;
    const n = filterCount();
    btn.classList.toggle('show', n > 0 && state.listMode === 'filters');
    btn.disabled = n === 0;
    btn.title = n ? `Clear all filters (${n} selected)` : 'Clear all filters';
    btn.setAttribute('aria-label', n ? `Clear all ${n} filters` : 'Clear all filters');
  }
  function applyListMode(opts = {}) {
    const view = $('#listModeView');
    const btn = $('#listModeBtn');
    if (!view || !btn) return;
    const filterMode = state.listMode === 'filters';
    view.classList.toggle('filters', filterMode);
    btn.classList.toggle('filters', filterMode);
    btn.classList.toggle('on', filterMode);
    btn.setAttribute('aria-expanded', String(filterMode));
    btn.title = filterMode ? 'Hide filters' : 'Show filters';
    const searchPane = $('.searchPane');
    const filterPane = $('.filterPane');
    if (searchPane) {
      searchPane.inert = filterMode;
      if (filterMode) searchPane.setAttribute('aria-hidden', 'true');
      else searchPane.removeAttribute('aria-hidden');
    }
    if (filterPane) {
      filterPane.inert = !filterMode;
      if (!filterMode) filterPane.setAttribute('aria-hidden', 'true');
      else filterPane.removeAttribute('aria-hidden');
    }
    const menu = $('#filterMenu');
    const h = filterMode ? Math.max(30, Math.ceil(menu ? menu.scrollHeight : 30)) : 30;
    if (opts.animate === false) {
      view.classList.add('noanim');
      view.style.height = h + 'px';
      void view.offsetHeight;
      view.classList.remove('noanim');
    } else {
      view.style.height = h + 'px';
    }
    updateFilterClear();
  }
  function renderCharFilters() {
    const groups = [
      { kind: 'element', key: 'filterEle', label: 'element', vals: [...new Set(R.characters.map((c) => c.ele))], name: eleLabel },
      { kind: 'weapon', key: 'filterWeapon', label: 'weapon type', vals: [...new Set(R.characters.map((c) => c.weaponType))], name: weaponLabel },
      { kind: 'region', key: 'filterRegion', label: 'region', vals: [...new Set(R.characters.map((c) => c.region))], name: regionLabel },
    ];
    const el = $('#charFilters');
    if (!el) return;
    el.innerHTML = groups.map((g) => {
      const vals = g.vals.slice().sort(g.kind === 'region'
        ? regionReleaseCompare
        : (a, b) => g.name(a).localeCompare(g.name(b)));
      const active = state[g.key] || [];
      const icons = vals.map((v) => {
        const on = active.includes(v);
        return `<button type="button" class="filterIcon ${on ? 'on' : ''}" data-filter="${g.key}" data-val="${esc(v)}" title="${esc(g.name(v))}${on ? ' (click to remove)' : ''}" aria-pressed="${on}"><img src="${filterIconSrc(g.kind, v)}" alt=""></button>`;
      }).join('');
      return `<div class="filterRow" role="group" aria-label="Filter by ${esc(g.label)}">${icons}</div>`;
    }).join('');
    $$('#charFilters .filterIcon').forEach((b) => b.onclick = () => {
      const key = b.dataset.filter;
      const val = b.dataset.val;
      const arr = state[key] || (state[key] = []);
      const at = arr.indexOf(val);
      if (at >= 0) arr.splice(at, 1);
      else arr.push(val);
      renderCharFilters();
      renderCharList();
    });
    applyListMode({ animate: false });
  }
  function refreshFilterOptions() {
    renderCharFilters();
    const sets = [...new Set(R.artifacts.map((a) => a.setKey))].sort();
    $('#setFilter').innerHTML = `<option value="ALL">All sets</option>` + sets.map((s) => `<option value="${esc(s)}">${esc(setLabel(s))}</option>`).join('');
    $('#setFilter').value = state.set;
  }

  function init() {
    state.listMode = SETTINGS.listMode === 'filters' ? 'filters' : 'search';
    renderChips();
    syncHeaderHeight();
    initLeftResize();
    window.addEventListener('resize', syncHeaderHeight);
    window.addEventListener('resize', () => applyListMode({ animate: false }));
    refreshFilterOptions();
    applyListMode({ animate: false });
    renderSortChips();
    $('#listModeBtn').onclick = () => {
      state.listMode = state.listMode === 'filters' ? 'search' : 'filters';
      SETTINGS = saveSettings({ listMode: state.listMode });
      applyListMode();
      renderCharList();
    };
    $('#clearFiltersBtn').onclick = () => {
      state.filterEle = [];
      state.filterWeapon = [];
      state.filterRegion = [];
      renderCharFilters();
      renderCharList();
    };
    if (window.ResizeObserver && $('#filterMenu')) {
      const ro = new ResizeObserver(() => applyListMode({ animate: false }));
      ro.observe($('#filterMenu'));
    }

    state.char = chooseInitialCharacter();
    document.body.classList.add('chars-active');
    renderCharList({ scrollActive: true });
    renderChar();
    $('#dataMenuBtn').onclick = (e) => {
      e.stopPropagation();
      hideHelpTip();
      setDataMenuOpen($('#dataMenu').classList.contains('hide'));
    };
    $('#dataMenuImport').onclick = () => {
      setDataMenuOpen(false);
      $('#importFile').click();
    };
    $('#importChooseBtn').onclick = () => $('#importFile').click();
    $('#importFile').onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      e.target.value = '';
      showImportOverlay();
      $('#importTitle').textContent = 'Importing export';
      try {
        const text = await file.text();
        const raw = JSON.parse(text);
        if (looksLikeGamedata(raw)) throw new Error('That file is the game-data bundle, not a GOOD export.');
        const wasBoot = !hasReport();
        const result = await analyzeClient(raw, (pct, stage, detail) => setImportProgress(pct, stage, detail));
        applyReport(result);
        const saved = await persistSession(text, file.name, result);
        $('#importTitle').textContent = 'Import complete';
        const skippedText = R.summary.skipped.length ? ` · ${R.summary.skipped.length} skipped` : '';
        setImportProgress(100, `${R.summary.analyzed} characters · ${R.summary.artifacts} artifacts${skippedText}`, saved
          ? 'Stats, targets, weapons, and cleanup verdicts were recalculated. Saved in this browser for reload.'
          : 'Stats, targets, weapons, and cleanup verdicts were recalculated. This browser could not save the export.');
        $('#importCloseBtn').classList.remove('hide');
        $('#importNote').classList.add('hide');
        $('#importChooseBtn').classList.add('hide');
        if (wasBoot) hideImportOverlay();
      } catch (err) {
        console.error(err);
        $('#importTitle').textContent = 'Import failed';
        setImportProgress(100, 'Could not process this file.', String((err && err.message) || err));
        $('#importCloseBtn').classList.remove('hide');
        if (!hasReport()) $('#importChooseBtn').classList.remove('hide');
      }
    };
    $('#forgetBtn').onclick = async () => {
      setDataMenuOpen(false);
      await clearSession();
      location.reload();
    };
    $('#importCloseBtn').onclick = hideImportOverlay;
    const helpTarget = (e) => (e.target instanceof Element ? e.target.closest('[data-tip]') : null);
    document.addEventListener('mouseover', (e) => { const h = helpTarget(e); if (h) showHelpTip(h); });
    document.addEventListener('mouseout', (e) => { const h = helpTarget(e); if (h) hideHelpTip(); });
    document.addEventListener('focusin', (e) => { const h = helpTarget(e); if (h) showHelpTip(h); });
    document.addEventListener('focusout', (e) => { const h = helpTarget(e); if (h) hideHelpTip(); });
    document.addEventListener('scroll', hideHelpTip, true);
    window.addEventListener('resize', hideHelpTip);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDataMenuOpen(false); });
    document.addEventListener('click', (e) => {
      if (!$('#weaponPick') || !e.target.closest('#weaponPick')) {
        const menu = $('#weaponMenu');
        if (menu) menu.classList.add('hide');
      }
      if (!(e.target instanceof Element) || !e.target.closest('.dataMenuWrap')) setDataMenuOpen(false);
    });

    $$('.tab[data-tab]').forEach((b) => b.onclick = () => showTab(b.dataset.tab));
    $$('#charSubtabs .subtab').forEach((b) => b.onclick = () => { hideHelpTip(); showSubtab(b.dataset.subtab); });
    showSubtab(state.subtab);
    $('#charSearch').oninput = renderCharList;

    const slots = ['ALL', 'flower', 'plume', 'sands', 'goblet', 'circlet'];
    $('#slotFilter').innerHTML = slots.map((s) => `<option value="${s}">${s === 'ALL' ? 'All slots' : SLOT[s]}</option>`).join('');

    const verdicts = ['ALL', 'KEEP', 'LEVEL', 'REVIEW', 'SALVAGE'];
    $('#verdictBtns').innerHTML = verdicts.map((v) => `<button class="btn ${v === 'ALL' ? 'on' : ''}" data-v="${v}">${v}</button>`).join(' ');
    $$('#verdictBtns .btn').forEach((b) => b.onclick = () => {
      state.verdict = b.dataset.v;
      state.limit = 300;
      state.cleanSort = null;
      state.cleanSortDir = 1;
      $$('#verdictBtns .btn').forEach((x) => x.classList.toggle('on', x === b));
      renderClean();
    });
    $$('#cleanHead th[data-sort]').forEach((th) => th.onclick = () => {
      const key = th.dataset.sort;
      if (state.cleanSort === key) state.cleanSortDir *= -1;
      else {
        state.cleanSort = key;
        state.cleanSortDir = (CLEAN_SORTS[key] && CLEAN_SORTS[key].dir) || 1;
      }
      renderClean();
    });

    $('#slotFilter').onchange = (e) => { state.slot = e.target.value; state.limit = 300; renderClean(); };
    $('#setFilter').onchange = (e) => { state.set = e.target.value; state.limit = 300; renderClean(); };
    $('#cleanSearch').oninput = (e) => { state.search = e.target.value; state.limit = 300; renderClean(); };
    $('#moreBtn').onclick = () => { state.limit += 300; renderClean(); };

    restoreSession();
  }

  init();
})();
