#!/usr/bin/env node
/**
 * Genera blocco-2/3/4 da fasi-2-3-4.json + parametri PI (da blocco-1).
 * NON tocca blocco-1. Sessioni AB / AC / CB.
 *
 * node tools/genera-blocchi-2-3-4.mjs
 * node tools/sync-blocco-macrociclo.mjs --all
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const ADMIN = join(REPO, "admin/data");
const BLOCCO1 = join(ADMIN, "blocco-1-fase1.json");
const FASI234 = join(ADMIN, "fasi-2-3-4.json");
const MACRO = join(ADMIN, "macrociclo-2026-2027.json");
const KEYS = ["ab", "ac", "cb"];

const template = JSON.parse(readFileSync(BLOCCO1, "utf8"));
const fasiSrc = JSON.parse(readFileSync(FASI234, "utf8"));
const macro = JSON.parse(readFileSync(MACRO, "utf8"));

const FIGURA_BY_KEY = {
  "panca piana": "fig-press-piano",
  inclinata: "fig-press-incl",
  croci: "fig-croci",
  "chest press converg": "fig-chest-converg",
  "chest press": "fig-chest",
  chest: "fig-chest",
  lento: "fig-lento",
  "alzate laterali ai cavi": "fig-alzate-cavi",
  alzate: "fig-alzate",
  "lat machine presa neutra": "fig-lat-neutro",
  lat: "fig-lat",
  pulley: "fig-pulley-basso",
  rematore: "fig-rematore",
  pressa: "fig-pressa",
  squat: "fig-squat",
  trap: "fig-trapbar",
  rumeno: "fig-rdl",
  hip: "fig-hip",
  affond: "fig-affondi",
  "leg curl": "fig-legcurl",
  abduzione: "fig-doktor",
  scott: "fig-curl-scott",
  martello: "fig-curl-mart",
  "curl bilanciere": "fig-curl-ez",
  halo: "fig-halo",
  pushdown: "fig-pushdown",
  tricip: "fig-pushdown",
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function figuraFor(nome, fallback) {
  if (fallback) return fallback;
  const n = nome.toLowerCase();
  for (const [k, v] of Object.entries(FIGURA_BY_KEY)) {
    if (n.includes(k)) return v;
  }
  return "fig-generic";
}

function defaultTempo(nome) {
  const n = nome.toLowerCase();
  if (n.includes("alzate") || n.includes("croci") || n.includes("abduzione")) return "2-1-3-1";
  if (n.includes("curl") || n.includes("tricip")) return "2-1-2-1";
  return "3-1-X-1";
}

function macroExToBlocco(ex) {
  return {
    nome: ex.nome,
    gruppo: ex.gruppo,
    serie: ex.serie,
    ripetizioni: ex.ripetizioni,
    tempo: ex.tempo || defaultTempo(ex.nome),
    recupero: ex.recupero || "90 sec",
    progressione: ex.progressione === true ? "Progressione principale *" : (ex.note || "").split(" · ")[0] || "",
    rir: ex.rir || "1-2",
    figura: figuraFor(ex.nome, ex.figura),
    progressionePrincipale: ex.progressione === true,
    note: ex.note || "",
  };
}

function volumeFromEsercizi(esercizi) {
  const map = {};
  esercizi.forEach((ex) => {
    const g = ex.gruppo || "Altro";
    map[g] = (map[g] || 0) + (Number(ex.serie) || 0);
  });
  return Object.entries(map).map(([gruppo, serie]) => ({ gruppo, serie }));
}

function sessionsFromFase(fase) {
  const out = {};
  for (const key of KEYS) {
    const src = fase.sessioni[key];
    const tpl = template.sessioni[key];
    const esercizi = src.esercizi.map(macroExToBlocco);
    out[key] = {
      codice: tpl.codice,
      nome: src.nome.replace(/^(AB|AC|CB)\s*[·•]\s*/i, ""),
      priorita: tpl.priorita,
      esercizi,
      volumeSeduta: volumeFromEsercizi(esercizi),
      notaComplementare: src.notaSeduta || tpl.notaComplementare,
      notaSeduta: src.notaSeduta || tpl.notaSeduta,
      accoppiamento: src.accoppiamento || tpl.accoppiamento,
    };
  }
  return out;
}

function stripWaveReps(raw) {
  const s = String(raw || "");
  if (!s.includes("→")) return s;
  const m = s.match(/^([^(→]+)/);
  return m ? m[1].trim() : s.split("→").pop().trim().replace(/\s·.*/, "").trim();
}

function applyPeriodEx(ex, def) {
  const next = { ...ex };
  if (ex.progressionePrincipale) {
    next.ripetizioni = def.repFondamentali;
    if (def.serieStarDelta) next.serie = ex.serie + def.serieStarDelta;
  } else {
    next.ripetizioni = stripWaveReps(ex.ripetizioni);
  }
  if (def.serieScale && def.serieScale !== 1) {
    next.serie = Math.max(1, Math.round((next.serie || ex.serie) * def.serieScale));
  }
  if (def.serieAccDelta && !ex.progressionePrincipale) {
    next.serie = Math.max(1, (next.serie || ex.serie) + def.serieAccDelta);
  }
  if (def.rirOverride) next.rir = def.rirOverride;
  return next;
}

function cloneSessioniForPeriod(blocco, def) {
  const out = {};
  for (const key of KEYS) {
    const s = blocco.sessioni[key];
    if (!s) continue;
    const esercizi = s.esercizi.map((ex) => applyPeriodEx(ex, def));
    out[key] = {
      codice: s.codice,
      nome: s.nome,
      priorita: s.priorita,
      esercizi,
      focusTecnico: s.focusTecnico,
      volumeSeduta: volumeFromEsercizi(esercizi),
      notaComplementare: s.notaComplementare,
      notaSeduta: s.notaSeduta,
      accoppiamento: s.accoppiamento,
    };
  }
  return out;
}

function buildPeriodi(defs, blocco, regoleBlocco) {
  return defs.map((def) => {
    const regole = {};
    (def.regoleKeys || []).forEach((k) => {
      if (regoleBlocco[k]) regole[k] = regoleBlocco[k];
    });
    return {
      id: def.id,
      label: def.label,
      settimane: def.settimane,
      repFondamentali: def.repFondamentali,
      rir: def.rir,
      sintesi: def.sintesi,
      regoleBlocco: regole,
      sessioni: cloneSessioniForPeriod(blocco, def),
    };
  });
}

const META = {
  "tensione-forza": {
    file: "blocco-2-fase2.json",
    codice: "BLOCCO 2",
    tipo: "TENSIONE • FORZA",
    durataSeduta: "obiettivo 75 minuti · tetto 90 minuti",
    periodizzazione: [
      { fase: "Adattamento", settimane: "1-2", rir: "3-2", obiettivo: "Transizione post-deload Fase 1" },
      { fase: "Tensione meccanica", settimane: "3-6", rir: "2", obiettivo: "6–8 rep · progressione kg" },
      { fase: "Transizione forza", settimane: "7-8", rir: "2", obiettivo: "5–6 rep sui *" },
      { fase: "Forza", settimane: "9-10", rir: "1-2", obiettivo: "5 rep sui * · kg in salita" },
      { fase: "Picco forza", settimane: "11-12", rir: "1-2", obiettivo: "4 rep sui * · carico massimo blocco (PI)" },
      { fase: "Deload", settimane: "13", rir: "4-5", obiettivo: "−40% volume" },
    ],
    regoleBlocco: {
      sett1_2: ["RIR 3-2 · 6–8 rep · rotazione vs Fase 1", "Trova kg di lavoro post-deload"],
      sett3_6: ["RIR 2 · tensione 6–8", "Progressione sui *"],
      sett7_8: ["RIR 2 · 5–6 rep sui *", "Recuperi 150–180 s"],
      sett9_10: ["RIR 1-2 · 5 rep sui *", "Aumenta kg se completi le serie col RIR target"],
      sett11_12: ["RIR 1-2 · 4 rep sui * (picco PI)", "Ultima serie * opz. RIR 0–1"],
      sett13: ["Deload −40% · RIR 4-5", "Obbligatorio prima di Fase 3"],
    },
    guidaOperativa: {
      titolo: "Metodo Blocco 2 — tensione e forza",
      sintesi:
        "Stessi esercizi della fase 1 (AB · AC · CB). Rep *: 6–8 → 5–6 → 5 → 4. Glutei 2×. Halo ultimo in AC. 4 periodi × 3 sedute = 12 schede.",
      periodizzazioneIntensita: [
        { settimane: "1-6", intensita: "RIR 3-2 → 2", volume: "100%", nota: "Tensione 6–8" },
        { settimane: "7-8", intensita: "RIR 2", volume: "100%", nota: "5–6 rep *" },
        { settimane: "9-10", intensita: "RIR 1-2", volume: "100%", nota: "5 rep *" },
        { settimane: "11-12", intensita: "RIR 1-2", volume: "100%", nota: "Picco 4 rep" },
        { settimane: "13", intensita: "RIR 4-5", volume: "−40%", nota: "Deload" },
      ],
    },
    periodi: [
      { id: "sett-1-6", label: "Tensione · sett. 1–6", settimane: "1-6", repFondamentali: "6-8", rir: "3-2 → 2", sintesi: "Adattamento e tensione. Fondamentali * a 6–8.", regoleKeys: ["sett1_2", "sett3_6"] },
      { id: "sett-7-8", label: "Transizione · sett. 7–8", settimane: "7-8", repFondamentali: "5-6", rir: "2", sintesi: "Verso la forza: * a 5–6, recuperi lunghi.", regoleKeys: ["sett7_8"] },
      { id: "sett-9-10", label: "Forza · sett. 9–10", settimane: "9-10", repFondamentali: "5", rir: "1-2", sintesi: "5 rep sui * · kg in salita se RIR ok.", regoleKeys: ["sett9_10"] },
      { id: "sett-11-12", label: "Picco forza · sett. 11–12", settimane: "11-12", repFondamentali: "4", rir: "1-2", sintesi: "Picco PI: 4 rep sui * a carico massimo del blocco.", regoleKeys: ["sett11_12"] },
    ],
  },
  "ipertrofia-classica-ii": {
    file: "blocco-3-fase3.json",
    codice: "BLOCCO 3",
    tipo: "IPERTROFIA II • ACCUMULO",
    durataSeduta: "obiettivo 75 minuti · tetto 90 minuti",
    periodizzazione: [
      { fase: "Reintroduzione", settimane: "1-5", rir: "2", obiettivo: "8–10 rep · terzo schema" },
      { fase: "Accumulo intenso", settimane: "6-8", rir: "1", obiettivo: "8 rep · RIR 1" },
      { fase: "Scarico parziale", settimane: "9", rir: "2", obiettivo: "−25% serie" },
      { fase: "Saturazione", settimane: "10-12", rir: "1", obiettivo: "+1 serie sui *" },
      { fase: "Deload", settimane: "13", rir: "4-5", obiettivo: "−40%" },
    ],
    regoleBlocco: {
      sett1_5: ["RIR 2 · 8–10 rep sui * · carico moderato post-forza", "Inclinata e pressa di nuovo *"],
      sett6_8: ["RIR 1 · 8 rep", "Progressione kg se tetto ×2 sedute"],
      sett9: ["Scarico −25% serie", "RIR 2"],
      sett10_12: ["+1 serie sui *", "RIR 1"],
      sett13: ["Deload −40%", "RIR 4-5"],
    },
    guidaOperativa: {
      titolo: "Metodo Blocco 3 — ipertrofia II",
      sintesi:
        "Stessa lista AB · AC · CB. Rientro volume 8–12. Eventuale +1 serie sui * in 9–12. 3 schede.",
      periodizzazioneIntensita: [
        { settimane: "1-5", intensita: "RIR 2", volume: "100%", nota: "8–10" },
        { settimane: "6-8", intensita: "RIR 1", volume: "100%", nota: "8 rep" },
        { settimane: "9", intensita: "RIR 2", volume: "−25%", nota: "Scarico" },
        { settimane: "10-12", intensita: "RIR 1", volume: "110% sui *", nota: "+1 serie *" },
        { settimane: "13", intensita: "RIR 4-5", volume: "−40%", nota: "Deload" },
      ],
    },
    periodi: [
      { id: "sett-1-5", label: "Reintroduzione · sett. 1–5", settimane: "1-5", repFondamentali: "8-10", rir: "2", sintesi: "Rientro 8–10 sui * dopo la forza.", regoleKeys: ["sett1_5"] },
      { id: "sett-6-8", label: "Accumulo · sett. 6–8", settimane: "6-8", repFondamentali: "8", rir: "1", sintesi: "8 rep, RIR 1, volume pieno.", regoleKeys: ["sett6_8"], rirOverride: "1" },
      { id: "sett-9", label: "Scarico · sett. 9", settimane: "9", repFondamentali: "8", rir: "2", sintesi: "−25% serie, RIR 2.", regoleKeys: ["sett9"], serieScale: 0.75, rirOverride: "2" },
      { id: "sett-10-12", label: "Saturazione · sett. 10–12", settimane: "10-12", repFondamentali: "8", rir: "1", sintesi: "+1 serie sui * (accumulo PI).", regoleKeys: ["sett10_12"], serieStarDelta: 1, rirOverride: "1" },
    ],
  },
  ricondizionamento: {
    file: "blocco-4-fase4.json",
    codice: "BLOCCO 4",
    tipo: "RICONDIZIONAMENTO • ESTIVO",
    durataSeduta: "obiettivo 75 minuti · tetto 90 minuti",
    periodizzazione: [
      { fase: "Mantenimento", settimane: "1-4", rir: "2-3", obiettivo: "10–12 · macchine" },
      { fase: "Mantenimento", settimane: "5-8", rir: "2-3", obiettivo: "Stessi kg" },
      { fase: "Estate", settimane: "9-10", rir: "2-3", obiettivo: "Flessibilità calendario" },
      { fase: "Chiusura", settimane: "11-12", rir: "2-3", obiettivo: "Opz. −1 serie accessori" },
      { fase: "Deload", settimane: "13", rir: "3", obiettivo: "−40%" },
    ],
    regoleBlocco: {
      sett1_4: ["RIR 2-3 · 10–12 · quarto schema", "Frequenza > intensità"],
      sett5_8: ["Mantieni kg", "Zero peaking"],
      sett9_10: ["RIR 2-3", "Riprendi AB→AC→CB se salti sedute"],
      sett11_12: ["Opz. −1 serie accessori se caldo/fatica", "Niente cedimento"],
      sett13: ["Deload −40% · RIR 3", "Preparazione nuovo anno"],
    },
    guidaOperativa: {
      titolo: "Metodo Blocco 4 — ricondizionamento",
      sintesi:
        "Stessa lista AB · AC · CB. 10–12 rep, RIR 2–3. Glutei restano. 3 schede.",
      periodizzazioneIntensita: [
        { settimane: "1-4", intensita: "RIR 2-3", volume: "~85%", nota: "Avvio" },
        { settimane: "5-8", intensita: "RIR 2-3", volume: "~85%", nota: "Mantenimento" },
        { settimane: "9-10", intensita: "RIR 2-3", volume: "~85%", nota: "Estate" },
        { settimane: "11-12", intensita: "RIR 2-3", volume: "~80%", nota: "−1 accessori opz." },
        { settimane: "13", intensita: "RIR 3", volume: "−40%", nota: "Deload" },
      ],
    },
    periodi: [
      { id: "sett-1-4", label: "Avvio · sett. 1–4", settimane: "1-4", repFondamentali: "10-12", rir: "2-3", sintesi: "Quarto schema, macchine, 10–12.", regoleKeys: ["sett1_4"] },
      { id: "sett-5-8", label: "Mantenimento · sett. 5–8", settimane: "5-8", repFondamentali: "10-12", rir: "2-3", sintesi: "Stessi kg, zero peaking.", regoleKeys: ["sett5_8"] },
      { id: "sett-9-10", label: "Estate · sett. 9–10", settimane: "9-10", repFondamentali: "10-12", rir: "2-3", sintesi: "Flessibilità se viaggi; riprendi AB–CB.", regoleKeys: ["sett9_10"] },
      { id: "sett-11-12", label: "Chiusura · sett. 11–12", settimane: "11-12", repFondamentali: "10-12", rir: "2-3", sintesi: "Opz. −1 serie sugli accessori.", regoleKeys: ["sett11_12"], serieAccDelta: -1 },
    ],
  },
};

for (const faseSrc of fasiSrc.fasi) {
  const meta = META[faseSrc.id];
  if (!meta) continue;
  const dates = macro.fasi.find((f) => f.id === faseSrc.id);

  const b = {
    id: faseSrc.id,
    codice: meta.codice,
    tipo: meta.tipo,
    nome: faseSrc.nome,
    inizio: dates.inizio,
    fine: dates.fine,
    settimane: faseSrc.settimane || 13,
    frequenza: "3 allenamenti/settimana",
    durataSeduta: meta.durataSeduta,
    guida: faseSrc.guida,
    schedaIntro: faseSrc.schedaIntro,
    perche: faseSrc.perche,
    intensitaRecupero: faseSrc.intensitaRecupero,
    rotazioneDaFase1: faseSrc.rotazioneDaFase1 || faseSrc.rotazioneDaFase2 || faseSrc.rotazioneDaFase3 || null,
    periodizzazione: meta.periodizzazione,
    recuperi: template.recuperi,
    regoleBlocco: meta.regoleBlocco,
    guidaOperativa: {
      ...clone(template.guidaOperativa || {}),
      ...meta.guidaOperativa,
    },
    sessioni: sessionsFromFase(faseSrc),
  };

  if (faseSrc.id === "tensione-forza") {
    b.periodi = buildPeriodi(meta.periodi, b, meta.regoleBlocco);
  }

  writeFileSync(join(ADMIN, meta.file), JSON.stringify(b, null, 2) + "\n");
  const nPeriodi = (b.periodi || []).length;
  if (nPeriodi) {
    console.log("OK", meta.file, "·", nPeriodi, "periodi ×", KEYS.length, "sedute =", nPeriodi * KEYS.length, "schede");
  } else {
    console.log("OK", meta.file, "· 3 schede AB AC CB (niente periodi)");
  }
}
