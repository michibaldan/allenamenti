#!/usr/bin/env node
/**
 * Allinea macrociclo amico: figure da catalogo, pesi blank, note senza kg esempio.
 * Uso: node tools/allinea-amico.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const MACRO = join(REPO, "admin/data/macrociclo-2026-2027.json");
const BLOCCO = join(REPO, "admin/data/blocco-1-fase1.json");
const CATALOGO = join(REPO, "admin/data/esercizi-catalogo.json");
const HUB = join(REPO, "admin/data/hub-periodizzazione.json");
const MESO = join(REPO, "admin/data/mesocicli.json");
const FIGURE = join(REPO, "admin/data/figure-schede-fase1.json");

const catalogo = JSON.parse(readFileSync(CATALOGO, "utf8"));
const macro = JSON.parse(readFileSync(MACRO, "utf8"));
const blocco = JSON.parse(readFileSync(BLOCCO, "utf8"));
const hub = JSON.parse(readFileSync(HUB, "utf8"));
const meso = JSON.parse(readFileSync(MESO, "utf8"));

function lookupCat(nome) {
  if (!nome) return null;
  if (catalogo[nome]) return { key: nome, ...catalogo[nome] };
  const n = nome.toLowerCase().replace(/\s+/g, " ").trim();
  for (const key of Object.keys(catalogo)) {
    if (key.toLowerCase() === n) return { key, ...catalogo[key] };
  }
  return null;
}

function stripKg(note) {
  if (!note) return null;
  const n = String(note)
    .replace(/palestra Arturo/gi, "palestra")
    .replace(/Multipower Technogym/gi, "Multipower")
    .replace(/\d+\s*→\s*\d+(?:\s*→\s*\d+)?\s*kg/gi, "carichi da definire")
    .replace(/\d+\s*\/\s*\d+\s*kg/gi, "carichi da definire")
    .replace(/@?\s*\d+(?:[.,]\d+)?\s*kg(?:\/manubrio)?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;])/g, "$1")
    .replace(/·\s*·/g, "·")
    .trim();
  return n || null;
}

function isKettlebell(nome) {
  return /halo|catch ball|kettlebell/i.test(nome || "");
}

const missing = [];

function stampFigura(ex) {
  const cat = lookupCat(ex.nome);
  if (!cat) {
    missing.push(ex.nome);
    return ex;
  }
  ex.figura = ex.figura || cat.figura;
  return ex;
}

function blankPeso(ex) {
  ex.peso = "—";
  if (ex.note) ex.note = stripKg(ex.note);
  return stampFigura(ex);
}

for (const fase of macro.fasi) {
  for (const key of ["ab", "ac", "cb"]) {
    const s = fase.sessioni[key];
    if (!s) continue;
    s.esercizi = s.esercizi.map(blankPeso);
    const kbIdx = s.esercizi.findIndex((e) => isKettlebell(e.nome));
    if (kbIdx >= 0 && kbIdx !== s.esercizi.length - 1) {
      const [kb] = s.esercizi.splice(kbIdx, 1);
      s.esercizi.push(kb);
    }
  }
}

macro.macrociclo.nome = "Macrociclo 2026–2027 · Michele Baldan";
macro.macrociclo.descrizione =
  "Ciclo annuale di Michele Baldan: 4 fasi × 13 settimane, 3 sedute/settimana (AB · AC · CB). Priorità parte alta ~55%. Deload = settimana 13. Pesi a penna. PDF anonimo.";
macro.macrociclo.lineeGuida =
  "4 fasi × ~13 sett. · 3 sedute (AB–AC / C–B) · ~55% serie parte alta · 60 min / tetto 75 · Deload sett. 13 · Pesi blank · PDF anonimo";
if (macro.macrociclo.profilo) {
  macro.macrociclo.profilo.giorniSettimana = 3;
  macro.macrociclo.profilo.prioritaVolume = "parte alta ~55%";
  macro.macrociclo.profilo.durataSeduta = "obiettivo 60 min, tetto 75 min";
  macro.macrociclo.profilo.kettlebellFinisher = "sì in AC (Halo), sempre ultimo esercizio";
}

delete macro.macrociclo.pesoPartenza;

for (const key of ["ab", "ac", "cb"]) {
  const s = blocco.sessioni[key];
  s.esercizi = s.esercizi.map((ex) => {
    const cat = lookupCat(ex.nome);
    if (!cat) missing.push("blocco:" + ex.nome);
    else ex.figura = ex.figura || cat.figura;
    if (ex.note) ex.note = stripKg(ex.note);
    if (ex.progressione) ex.progressione = stripKg(ex.progressione) || ex.progressione;
    return ex;
  });
  const kbIdx = s.esercizi.findIndex((e) => isKettlebell(e.nome));
  if (kbIdx >= 0 && kbIdx !== s.esercizi.length - 1) {
    const [kb] = s.esercizi.splice(kbIdx, 1);
    s.esercizi.push(kb);
  }
}

blocco.schedaIntro =
  "3 allenamenti/settimana: Lun AB · Mer AC · Ven CB. Priorità parte alta ~55%. Obiettivo 60 min, tetto 75. Halo in AC sempre ultimo. Pesi a penna. PDF anonimo.";

hub.anni = [
  {
    id: "2026-2027",
    label: "2026 – 2027 · base amico",
    macrocicloUrl: "/admin/data/macrociclo-2026-2027.json",
    periodi: [
      {
        id: "set26-ago27",
        label: "Settembre 2026 → Agosto 2027",
        descrizione:
          "Ciclo annuale Michele Baldan: 4×13 sett., AB·AC·CB, deload sett. 13, parte alta ~55%. Pesi vuoti.",
      },
    ],
  },
];
hub._nota =
  "Repo amico: un solo anno in hub. Non inventare dati clinici. STEP B aggiorna solo JSON + catalogo/figure.";
hub.profilo = macro.macrociclo.profilo;

if (meso.periodizzazioneAnnuale) {
  meso.periodizzazioneAnnuale.forEach((p) => {
    p.deload = true;
  });
}

const figureRows = [];
for (const key of ["ab", "ac", "cb"]) {
  const s = blocco.sessioni[key];
  s.esercizi.forEach((ex) => {
    const cat = lookupCat(ex.nome) || {};
    figureRows.push({
      sessione: key.toUpperCase(),
      idEsercizio: ex.figura || cat.figura || "",
      nome: ex.nome,
      pathSvgSymbol: "/admin/img/esercizi-sprite.svg#" + (ex.figura || cat.figura || ""),
      pathImgWebp: null,
      briefVisuale: cat.setup || ex.note || "",
      stile: "SVG tecnico",
      dataAi: null,
    });
  });
}

writeFileSync(MACRO, JSON.stringify(macro, null, 2) + "\n");
writeFileSync(BLOCCO, JSON.stringify(blocco, null, 2) + "\n");
writeFileSync(HUB, JSON.stringify(hub, null, 2) + "\n");
writeFileSync(MESO, JSON.stringify(meso, null, 2) + "\n");
writeFileSync(FIGURE, JSON.stringify({ generatedFrom: "blocco-1-fase1.json", stile: "SVG tecnico", rows: figureRows }, null, 2) + "\n");

if (missing.length) {
  console.error("Figure/catalogo mancanti:", [...new Set(missing)]);
  process.exit(1);
}
console.log("OK allinea-amico · figure Fase 1:", figureRows.length);
