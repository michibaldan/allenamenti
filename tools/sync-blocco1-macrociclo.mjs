#!/usr/bin/env node
/**
 * Sincronizza Fase 1 del macrociclo da admin/data/blocco-1-fase1.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const MACRO = join(REPO, "admin/data/macrociclo-2026-2027.json");
const BLOCCO = join(REPO, "admin/data/blocco-1-fase1.json");

const macro = JSON.parse(readFileSync(MACRO, "utf8"));
const blocco = JSON.parse(readFileSync(BLOCCO, "utf8"));

const faseIdx = macro.fasi.findIndex((f) => f.id === blocco.id);
if (faseIdx === -1) throw new Error("Fase non trovata: " + blocco.id);

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
    progressione: ex.progressionePrincipale || false,
    figura: ex.figura || null,
    note: [ex.progressione, ex.note].filter(Boolean).join(" · ") || null,
  };
}

const sessioni = {};
for (const key of ["ab", "ac", "cb"]) {
  const s = blocco.sessioni[key];
  sessioni[key] = {
    nome: s.codice + " · " + s.nome,
    esercizi: s.esercizi.map(toMacroEx),
  };
}

macro.fasi[faseIdx] = {
  ...macro.fasi[faseIdx],
  nome: blocco.nome,
  inizio: blocco.inizio,
  fine: blocco.fine,
  settimane: blocco.settimane,
  rir: "sett. 6–8: RIR 1 (vedi Metodo Blocco 1)",
  obiettivo: blocco.schedaIntro,
  guida: blocco.guida,
  schedaIntro: blocco.schedaIntro,
  sessioni,
};

writeFileSync(MACRO, JSON.stringify(macro, null, 2) + "\n");
console.log("OK — Fase 1 sincronizzata in macrociclo-2026-2027.json");
