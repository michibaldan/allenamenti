#!/usr/bin/env node
/**
 * Sincronizza fasi del macrociclo da admin/data/blocco-*.json (AB/AC/CB)
 *
 * node tools/sync-blocco-macrociclo.mjs --all
 * node tools/sync-blocco-macrociclo.mjs --file admin/data/blocco-2-fase2.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const ADMIN = join(REPO, "admin/data");
const MACRO = join(ADMIN, "macrociclo-2026-2027.json");
const INDEX = join(ADMIN, "blocchi-index.json");
const KEYS = ["ab", "ac", "cb"];

function toMacroEx(ex) {
  return {
    nome: ex.nome,
    gruppo: ex.gruppo,
    serie: ex.serie,
    ripetizioni: ex.ripetizioni,
    peso: "—",
    recupero: ex.recupero,
    rir: ex.rir || "vedi regole blocco",
    tempo: ex.tempo,
    figura: ex.figura,
    progressione: ex.progressionePrincipale || false,
    note: [ex.progressione, ex.note].filter(Boolean).join(" · ") || null,
  };
}

function syncBlocco(bloccoPath) {
  const blocco = JSON.parse(readFileSync(bloccoPath, "utf8"));
  const macro = JSON.parse(readFileSync(MACRO, "utf8"));
  const faseIdx = macro.fasi.findIndex((f) => f.id === blocco.id);
  if (faseIdx === -1) throw new Error("Fase non trovata nel macrociclo: " + blocco.id);

  const sessioni = {};
  for (const key of KEYS) {
    const s = blocco.sessioni[key];
    if (!s) continue;
    sessioni[key] = {
      nome: (s.codice ? s.codice + " · " : "") + s.nome,
      codice: s.codice || key.toUpperCase(),
      accoppiamento: s.accoppiamento,
      notaSeduta: s.notaSeduta,
      durataMinuti: { obiettivo: 75, tetto: 90 },
      esercizi: s.esercizi.map(toMacroEx),
    };
  }

  const rirSummary =
    blocco.periodizzazione?.map((p) => `sett. ${p.settimane}: ${p.rir}`).join(" · ") ||
    macro.fasi[faseIdx].rir;

  macro.fasi[faseIdx] = {
    ...macro.fasi[faseIdx],
    nome: blocco.nome,
    inizio: blocco.inizio,
    fine: blocco.fine,
    settimane: blocco.settimane,
    rir: rirSummary,
    obiettivo: blocco.schedaIntro,
    guida: blocco.guida,
    schedaIntro: blocco.schedaIntro,
    perche: blocco.perche || macro.fasi[faseIdx].perche,
    intensitaRecupero: blocco.intensitaRecupero || macro.fasi[faseIdx].intensitaRecupero,
    sessioni,
  };

  writeFileSync(MACRO, JSON.stringify(macro, null, 2) + "\n");
  console.log("OK macrociclo ←", blocco.id);
}

const args = process.argv.slice(2);
const index = JSON.parse(readFileSync(INDEX, "utf8"));
const allFiles = Object.values(index.blocchi).map((f) => join(ADMIN, f));

let files = [];
if (args.includes("--all")) {
  files = allFiles.filter((f) => !f.includes("blocco-1-fase1"));
} else if (args.includes("--file")) {
  files = [join(REPO, args[args.indexOf("--file") + 1])];
} else {
  console.error("Uso: node tools/sync-blocco-macrociclo.mjs --all | --file path/blocco-N.json");
  process.exit(1);
}

files.forEach(syncBlocco);
