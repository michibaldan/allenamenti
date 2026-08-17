#!/usr/bin/env node
/**
 * Verifica ~55% serie sulla PARTE ALTA (non lower).
 * Per ricostruire AB/AC/CB: node tools/converti-ab-ac-cb.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const data = JSON.parse(readFileSync(join(REPO, "admin/data/macrociclo-2026-2027.json"), "utf8"));

function isLower(ex) {
  return /gambe|polpacci|glutei|femorali|quadricipiti|catena posteriore|adduttori/i.test(
    ex.gruppo || ""
  ) || /pressa|extension|squat|leg curl|stacco|polpacci|rumeno|hip thrust|trap bar|omega/i.test(
    ex.nome || ""
  );
}

let fail = false;
for (const f of data.fasi) {
  let total = 0;
  let lower = 0;
  for (const s of Object.values(f.sessioni)) {
    for (const ex of s.esercizi) {
      const n = Number(ex.serie) || 0;
      total += n;
      if (isLower(ex)) lower += n;
    }
  }
  const pct = (100 * (total - lower)) / total;
  const line = f.id + " parte alta " + pct.toFixed(1) + "%";
  if (pct < 52 || pct > 62) {
    console.error("ERR " + line);
    fail = true;
  } else console.log("OK  " + line);
}
if (fail) process.exit(1);
console.log("OK  priorità parte alta ~55%");
