#!/usr/bin/env node
/**
 * Checklist SKILL — Michele Baldan: 3 sedute, parte alta ~55%, deload 13
 * Uso: node tools/verifica-macrociclo.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const macro = JSON.parse(readFileSync(join(REPO, "admin/data/macrociclo-2026-2027.json"), "utf8"));
const blocco = JSON.parse(readFileSync(join(REPO, "admin/data/blocco-1-fase1.json"), "utf8"));
const catalogo = JSON.parse(readFileSync(join(REPO, "admin/data/esercizi-catalogo.json"), "utf8"));
const hub = JSON.parse(readFileSync(join(REPO, "admin/data/hub-periodizzazione.json"), "utf8"));
const meso = JSON.parse(readFileSync(join(REPO, "admin/data/mesocicli.json"), "utf8"));

const KEYS = ["ab", "ac", "cb"];
const errors = [];
const ok = [];

function fail(msg) {
  errors.push(msg);
}
function pass(msg) {
  ok.push(msg);
}

function lookupCat(nome) {
  if (catalogo[nome]) return catalogo[nome];
  const n = (nome || "").toLowerCase();
  for (const key of Object.keys(catalogo)) {
    if (key.toLowerCase() === n) return catalogo[key];
  }
  return null;
}

function isLower(ex) {
  return /gambe|polpacci|glutei|femorali|quadricipiti|catena posteriore|adduttori|abduttori/i.test(
    ex.gruppo || ""
  ) || /pressa|extension|squat|leg curl|doktor|stacco|affondo|polpacci|rumeno|hip thrust|trap bar|omega/i.test(
    ex.nome || ""
  );
}

function isKb(nome) {
  return /halo|catch ball|kettlebell/i.test(nome || "");
}

if (macro.macrociclo.profilo?.giorniSettimana !== 3) {
  fail("giorniSettimana deve essere 3");
} else pass("3 giorni/settimana");

if (!/parte alta/i.test(macro.macrociclo.profilo?.prioritaVolume || macro.macrociclo.lineeGuida || "")) {
  fail("manca priorità parte alta");
} else pass("priorità parte alta in linee guida");

if (macro.fasi.length !== 4) fail("Attese 4 fasi, trovate " + macro.fasi.length);
else pass("4 fasi macro");

macro.fasi.forEach((f) => {
  if (f.settimane < 12) fail(f.id + " ha " + f.settimane + " sett. (<12)");
  else pass(f.id + " · " + f.settimane + " sett.");
  if (!f.perche) fail(f.id + " manca perche");
  if (!f.intensitaRecupero?.intensita || !f.intensitaRecupero?.recupero) {
    fail(f.id + " manca intensitaRecupero");
  } else pass(f.id + " intensità/recupero");
  KEYS.forEach((k) => {
    if (!f.sessioni[k]) fail(f.id + " manca sessione " + k);
  });
  if (f.sessioni.a1 || f.sessioni.b1) fail(f.id + " ha ancora chiavi A1/B1");
  let total = 0;
  let lower = 0;
  for (const s of Object.values(f.sessioni)) {
    if ((s.esercizi || []).length > 7) fail(f.id + " " + s.nome + " ha " + s.esercizi.length + " esercizi (>7, rischio >75 min)");
    for (const ex of s.esercizi) {
      const sets = Number(ex.serie) || 0;
      total += sets;
      if (isLower(ex)) lower += sets;
      if (ex.peso && ex.peso !== "—" && ex.peso !== "-") {
        fail(f.id + " " + ex.nome + " ha peso non blank: " + ex.peso);
      }
      const cat = lookupCat(ex.nome);
      const fig = ex.figura || cat?.figura;
      if (!fig) fail(f.id + " " + ex.nome + " senza figura");
      if (/\d+\s*kg/i.test(ex.note || "") && !/da definire/i.test(ex.note || "")) {
        fail(f.id + " " + ex.nome + " nota con kg esempio: " + ex.note);
      }
    }
    const last = s.esercizi[s.esercizi.length - 1];
    const kb = s.esercizi.filter((e) => isKb(e.nome));
    if (kb.length && !isKb(last.nome)) {
      fail(f.id + " " + s.nome + ": kettlebell non è ultimo");
    }
  }
  const upper = total - lower;
  const pct = (100 * upper) / total;
  if (pct < 52 || pct > 62) fail(f.id + " parte alta " + pct.toFixed(1) + "% (atteso ~55%)");
  else pass(f.id + " parte alta " + pct.toFixed(1) + "% (" + upper + "/" + total + ")");
});

KEYS.forEach((k) => {
  if (!blocco.sessioni[k]) {
    fail("blocco manca " + k);
    return;
  }
  blocco.sessioni[k].esercizi.forEach((ex) => {
    if (!ex.figura && !lookupCat(ex.nome)?.figura) fail("blocco " + k + " " + ex.nome + " senza figura");
  });
  const last = blocco.sessioni[k].esercizi.at(-1);
  const kb = blocco.sessioni[k].esercizi.filter((e) => isKb(e.nome));
  if (kb.length && !isKb(last.nome)) fail("blocco " + k + ": kettlebell non ultimo");
});
if (!/60/.test(blocco.durataSeduta || "") || !/75/.test(blocco.durataSeduta || "")) {
  fail("blocco durataSeduta deve citare 60 e 75 min");
} else pass("Blocco 1 durata 60/75");
pass("Blocco 1 AB–CB con figure");

if (!hub.anni?.length) fail("hub-periodizzazione.json senza anni");
else pass("hub anni: " + hub.anni.map((a) => a.id).join(", "));
if (hub.profilo?.giorniSettimana !== 3) fail("hub giorniSettimana != 3");

const deloadOk = (meso.periodizzazioneAnnuale || []).every((p) => p.deload === true);
if (!deloadOk) fail("mesocicli.periodizzazioneAnnuale: deload non true su tutte le fasi");
else pass("periodizzazioneAnnuale · deload su 4 fasi");

console.log(ok.map((x) => "OK  " + x).join("\n"));
if (errors.length) {
  console.error(errors.map((x) => "ERR " + x).join("\n"));
  process.exit(1);
}
console.log("CHECKLIST SUPERATA");
