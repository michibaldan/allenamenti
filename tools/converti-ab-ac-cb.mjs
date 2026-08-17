#!/usr/bin/env node
/**
 * Converte A1–B2 (4 giorni, ~55% lower) → AB / AC / CB
 * (3 giorni, ~55% parte alta, 60 min / tetto 75).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const MACRO = join(REPO, "admin/data/macrociclo-2026-2027.json");
const BLOCCO = join(REPO, "admin/data/blocco-1-fase1.json");
const HUB = join(REPO, "admin/data/hub-periodizzazione.json");
const MESO = join(REPO, "admin/data/mesocicli.json");
const FIGURE = join(REPO, "admin/data/figure-schede-fase1.json");
const CATALOGO = join(REPO, "admin/data/esercizi-catalogo.json");

const SESSIONI = ["ab", "ac", "cb"];
const catalogo = JSON.parse(readFileSync(CATALOGO, "utf8"));
const macro = JSON.parse(readFileSync(MACRO, "utf8"));
const blocco = JSON.parse(readFileSync(BLOCCO, "utf8"));
const hub = JSON.parse(readFileSync(HUB, "utf8"));
const meso = JSON.parse(readFileSync(MESO, "utf8"));

function clone(ex) {
  return JSON.parse(JSON.stringify(ex));
}

function allEx(sessioni) {
  const out = [];
  for (const s of Object.values(sessioni || {})) {
    for (const e of s.esercizi || []) out.push(e);
  }
  return out;
}

function findEx(sessioni, pattern, opts = {}) {
  const matches = allEx(sessioni).filter((e) => pattern.test(e.nome || ""));
  if (!matches.length) {
    if (opts.optional) return null;
    throw new Error("Esercizio non trovato: " + pattern);
  }
  if (opts.preferProgressione) {
    const p = matches.find((e) => e.progressione || e.progressionePrincipale);
    if (p) return clone(p);
  }
  if (opts.preferLongerName) {
    matches.sort((a, b) => (b.nome || "").length - (a.nome || "").length);
  }
  return clone(matches[0]);
}

function patch(ex, extra) {
  Object.assign(ex, extra);
  ex.peso = "—";
  if (ex.progressionePrincipale && extra.progressione === undefined) {
    ex.progressione = true;
  }
  return ex;
}

function isLower(ex) {
  return /gambe|polpacci|glutei|femorali|quadricipiti|catena posteriore|adduttori|abduttori/i.test(
    ex.gruppo || ""
  ) || /pressa|extension|squat|leg curl|doktor|stacco|affondo|polpacci|rumeno|hip thrust|trap bar|omega/i.test(
    ex.nome || ""
  );
}

const INTENSITA = {
  "ipertrofia-accumulo": {
    perche:
      "Costruire tessuto e abituare tendini e tecnica. Non è la fase dei record: è la base da cui partono le altre tre.",
    intensita:
      "Sett. 1–2 RIR 3–2 · 3–5 RIR 2 · 6–8 RIR 1 · 9 scarico −25% · 10–12 picco controllato (cedimento solo sull’ultima serie dei *) · 13 deload −40%.",
    recupero:
      "Fondamentali * 2–2,5 min. Isolamento ~60 s. Accoppia l’isolamento durante il riposo dei * per chiudere in ~60 min (tetto 75).",
    rir: "sett. 6–8: RIR 1",
  },
  "tensione-forza": {
    perche:
      "Trasformare la base in carico. Stessi esercizi: scendono le ripetizioni, salgono i kg.",
    intensita:
      "Sett. 1–6 tensione 6–8 rep, RIR 1–2. Sett. 7–12 forza 4–6, RIR 1–2. Sett. 13 deload −40%.",
    recupero:
      "Sui * 2,5–3 min: il recupero lungo è il metodo, non tempo perso. Isolamento 60–75 s. Tetto 75 min.",
    rir: "RIR 1–2",
  },
  "ipertrofia-classica-ii": {
    perche:
      "Riconvertire la forza nuova in volume. I kg della fase 2 restano, le ripetizioni tornano su.",
    intensita:
      "8–12 rep, RIR 1–2, volume pieno. Eventuale +1 serie sui * nelle sett. 9–12. Deload sett. 13.",
    recupero:
      "Come fase 1: * 2–2,5 min, isolamento ~60 s, accoppiamenti per stare ≤75 min.",
    rir: "RIR 1–2",
  },
  ricondizionamento: {
    perche:
      "Chiudere l’anno integri, non bruciati. Mantenimento, non peaking.",
    intensita:
      "10–12 rep, RIR 2–3, niente cedimento. Deload sett. 13 prima del macrociclo successivo.",
    recupero:
      "Recuperi un po’ più corti va bene (seduta più facile). Tetto comunque 75 min. Deload 13 resta obbligatorio.",
    rir: "RIR 2–3",
  },
};

const SCHEDA_INTRO =
  "3 allenamenti/settimana: Lun AB · Mer AC · Ven CB (o Mar/Gio/Sab). AB e AC condividono A (spinta). CB chiude C e B, lontano da AB così le gambe recuperano. Priorità parte alta ~55% delle serie. Obiettivo 60 min, tetto 75. Halo sempre ultimo se presente. Pesi a penna. PDF anonimo.";

function buildSessioni(src) {
  const panca = findEx(src, /panca inclinata/i, { preferProgressione: true });
  const croci = findEx(src, /croci/i);
  const laterali = findEx(src, /alzate laterali/i);
  const pressa = findEx(src, /pressa/i, { preferProgressione: true });
  const legcurl = findEx(src, /leg curl/i);
  const calfPiedi = findEx(src, /polpacci in piedi/i);

  const lat = findEx(src, /lat machine/i);
  const rematore = findEx(src, /rematore/i, { preferProgressione: true, preferLongerName: true });
  const lento = findEx(src, /lento avanti/i, { preferProgressione: true });
  const scott = findEx(src, /scott/i);
  const halo = findEx(src, /halo/i);
  const reverse = findEx(src, /reverse pec/i, { optional: true });

  const trap = findEx(src, /trap bar|stacco omega/i, { preferProgressione: true });
  const hip = findEx(src, /hip thrust/i);
  const legext = findEx(src, /leg extension/i);
  const hammer = findEx(src, /martello|hammer/i);
  const calfSeduto = findEx(src, /polpacci seduto/i);

  const abEx = [
    patch(panca, {
      serie: 4,
      progressione: true,
      recupero: panca.recupero || "150 sec",
      note: [panca.note, "AB: spinta A. Accoppia croci o laterali nel recupero."].filter(Boolean).join(" · "),
    }),
    patch(croci, {
      serie: 3,
      recupero: "60 sec",
      note: [croci.note, "Isolamento petto — recuperi corti."].filter(Boolean).join(" · "),
    }),
    patch(laterali, {
      serie: 3,
      recupero: "60 sec",
      note: [laterali.note, "Deltoide laterale: priorità parte alta."].filter(Boolean).join(" · "),
    }),
    patch(pressa, {
      serie: 4,
      progressione: true,
      recupero: pressa.recupero || "150 sec",
      note: [pressa.note, "AB: gambe B brevi. Accoppia leg curl nel recupero."].filter(Boolean).join(" · "),
    }),
    patch(legcurl, {
      serie: 3,
      recupero: "75 sec",
      note: [legcurl.note, "Femorali in AB, volume contenuto."].filter(Boolean).join(" · "),
    }),
    patch(calfPiedi, {
      serie: 3,
      recupero: "60 sec",
      note: [calfPiedi.note, "Polpacci in piedi — ROM completo."].filter(Boolean).join(" · "),
    }),
  ];

  const acEx = [
    patch(lat, {
      serie: 4,
      recupero: lat.recupero || "120 sec",
      note: [lat.note, "AC: tirata C. Accoppia curl nel recupero."].filter(Boolean).join(" · "),
    }),
    patch(rematore, {
      serie: 3,
      recupero: rematore.recupero || "120 sec",
      note: [rematore.note, "Trazione orizzontale."].filter(Boolean).join(" · "),
    }),
    patch(lento, {
      serie: 3,
      progressione: true,
      recupero: lento.recupero && /180|150|144/.test(String(lento.recupero)) ? lento.recupero : "150 sec",
      note: [lento.note, "AC: spinta A (spalle). Recupero pieno sui *."].filter(Boolean).join(" · "),
    }),
  ];
  if (reverse) {
    acEx.push(
      patch(reverse, {
        serie: 3,
        recupero: "60 sec",
        note: [reverse.note, "Equilibrio deltoide posteriore."].filter(Boolean).join(" · "),
      })
    );
  }
  acEx.push(
    patch(scott, {
      serie: 3,
      recupero: "60 sec",
      note: [scott.note, "Bicipiti in AC (parte alta)."].filter(Boolean).join(" · "),
    }),
    patch(halo, {
      serie: 2,
      recupero: "60 sec",
      progressione: false,
      note: "Finisher kettlebell — sempre ultimo esercizio della seduta. Halo lento, core attivo.",
    })
  );

  const cbEx = [
    patch(trap, {
      serie: 4,
      progressione: true,
      recupero: trap.recupero && /180|150/.test(String(trap.recupero)) ? trap.recupero : "150 sec",
      note: [trap.note, "CB: gambe B principali. Recupero pieno."].filter(Boolean).join(" · "),
    }),
    patch(hip, {
      serie: 3,
      recupero: "90 sec",
      note: [hip.note, "Dominante anca."].filter(Boolean).join(" · "),
    }),
    patch(legext, {
      serie: 3,
      recupero: "75 sec",
      note: [legext.note, "Quadricipiti — accoppia col curl martello."].filter(Boolean).join(" · "),
    }),
    patch(hammer, {
      serie: 3,
      recupero: "60 sec",
      note: [hammer.note, "CB: chiusura C (braccia)."].filter(Boolean).join(" · "),
    }),
    patch(calfSeduto, {
      serie: 3,
      recupero: "60 sec",
      note: [calfSeduto.note, "Soleo, complementare ai polpacci in piedi di AB."].filter(Boolean).join(" · "),
    }),
  ];

  return {
    ab: {
      nome: "AB · Spinta A + gambe B brevi",
      codice: "AB",
      accoppiamento: "A + B",
      notaSeduta:
        "Spinta parte alta (petto, laterali) + gambe brevi (pressa, curl, polpacci). Non accostare a CB: entrambi toccano B.",
      durataMinuti: { obiettivo: 60, tetto: 75 },
      esercizi: abEx,
    },
    ac: {
      nome: "AC · Spinta A + tirata C",
      codice: "AC",
      accoppiamento: "A + C",
      notaSeduta:
        "Giorno parte alta: spalle/lento (A) + schiena (C). Halo ultimo. Separa AB e CB.",
      durataMinuti: { obiettivo: 60, tetto: 75 },
      esercizi: acEx,
    },
    cb: {
      nome: "CB · Tirata C + gambe B",
      codice: "CB",
      accoppiamento: "C + B",
      notaSeduta:
        "Gambe principali (trap, hip, extension) + chiusura braccia. Lontano da AB per recuperare B.",
      durataMinuti: { obiettivo: 60, tetto: 75 },
      esercizi: cbEx,
    },
  };
}

function upperPct(sessioni) {
  let total = 0;
  let lower = 0;
  for (const s of Object.values(sessioni)) {
    for (const ex of s.esercizi) {
      const sets = Number(ex.serie) || 0;
      total += sets;
      if (isLower(ex)) lower += sets;
    }
  }
  const upper = total - lower;
  return { total, lower, upper, pctUpper: (100 * upper) / total };
}

const profilo = {
  nomeStampa: "Michele Baldan",
  notaNome: "Nome in pagina ciclo. PDF stampa: campo Atleta vuoto.",
  eta: 50,
  anniPalestra: null,
  livello: null,
  obiettivoAnno: "Parte alta ~55% del volume serie · 3 sedute/settimana · 60–75 min",
  giorniSettimana: 3,
  split: "AB – AC / C–B",
  prioritaVolume: "parte alta ~55%",
  attrezzaturaBase:
    "Multipower, manubri, cavi, leg machines, kettlebell (finisher Halo in AC, sempre ultimo). Da confermare con Michele.",
  limitiInfortuni: null,
  dataInizio: "2026-09-01",
  preferenzaMeseCambioFase: "fine novembre / fine febbraio / fine maggio / fine agosto (13 sett.)",
  prioritaMuscolari: "Parte alta del corpo (~55% delle serie settimanali)",
  kettlebellFinisher: "sì in AC (Halo), sempre ultimo esercizio",
  durataSeduta: "obiettivo 60 min, tetto 75 min",
  toneImmagini:
    "Ritratto: usare la foto originale se disponibile (niente data-ai). Figure schede: SVG tecnico.",
};

macro.macrociclo.nome = "Macrociclo 2026–2027 · Michele Baldan";
macro.macrociclo.descrizione =
  "Ciclo annuale di Michele Baldan: 4 fasi × 13 settimane, 3 sedute/settimana (AB · AC · CB). Priorità parte alta ~55%. Deload = settimana 13 di ogni fase. Pesi a penna. PDF anonimo.";
macro.macrociclo.frequenza = "3 sessioni/settimana";
macro.macrociclo.lineeGuida =
  "4 fasi × ~13 sett. · 3 sedute (AB–AC / C–B) · ~55% serie parte alta · 60 min / tetto 75 · Deload sett. 13 · Stessi esercizi per tutta la fase · Pesi blank · PDF anonimo";
macro.macrociclo.profilo = profilo;

for (const fase of macro.fasi) {
  const ir = INTENSITA[fase.id];
  if (!ir) throw new Error("Manca intensità per " + fase.id);
  const sessioni = buildSessioni(fase.sessioni);
  const vol = upperPct(sessioni);
  if (vol.pctUpper < 52 || vol.pctUpper > 62) {
    throw new Error(fase.id + " parte alta " + vol.pctUpper.toFixed(1) + "% (atteso ~55%)");
  }
  fase.sessioni = sessioni;
  fase.rir = ir.rir;
  fase.perche = ir.perche;
  fase.intensitaRecupero = {
    intensita: ir.intensita,
    recupero: ir.recupero,
    durataSeduta: "obiettivo 60 min, tetto 75 min",
    deload: "settimana 13 · −40% volume",
    split: "AB – AC / C–B",
  };
  fase.obiettivo = SCHEDA_INTRO;
  fase.schedaIntro = SCHEDA_INTRO;
  const guidaBase = fase.guida || "";
  fase.guida = ir.perche + " " + ir.intensita + " " + ir.recupero + (guidaBase && !guidaBase.includes("AB") ? " " + guidaBase : "");
  console.log(
    fase.id,
    "upper",
    vol.upper + "/" + vol.total,
    vol.pctUpper.toFixed(1) + "%"
  );
}

writeFileSync(MACRO, JSON.stringify(macro, null, 2) + "\n");

const bloccoSessioni = buildSessioni(blocco.sessioni);
blocco.sessioni = {};
for (const key of SESSIONI) {
  const s = bloccoSessioni[key];
  blocco.sessioni[key] = {
    codice: s.codice,
    nome: s.nome.replace(/^[ABC]{2}\s*·\s*/, ""),
    accoppiamento: s.accoppiamento,
    notaSeduta: s.notaSeduta,
    durataMinuti: s.durataMinuti,
    esercizi: s.esercizi.map((ex) => {
      const row = { ...ex };
      if (row.progressione === true && row.progressionePrincipale === undefined) {
        row.progressionePrincipale = true;
      }
      return row;
    }),
  };
}

blocco.frequenza = "3 allenamenti/settimana";
blocco.durataSeduta = "obiettivo 60 minuti · tetto 75 minuti";
blocco.schedaIntro = SCHEDA_INTRO;
blocco.valutazioneProgramma = {
  note:
    "Volume settimanale AB+AC+CB. Priorità parte alta ~55% delle serie. Deload sett. 13 non incluso. Le liste esercizi si chiudono con Michele; i principi non cambiano.",
};
blocco.guidaOperativa = {
  ...blocco.guidaOperativa,
  titolo: "Metodo Blocco 1 — come usare le 3 schede",
  sintesi:
    "Stesso programma per 13 settimane: cambiano solo RIR, volume (settimana 9 e 13) e kg. Tre schede: AB, AC, CB. Non mescolare gli esercizi tra sedute.",
  distribuzioneSettimanale: {
    schema: "AB – AC / C–B · 3 giorni + 4 riposi",
    consigliata: [
      { giorno: "Lunedì", sessione: "AB", tipo: "A+B", focus: "Spinta parte alta + gambe brevi" },
      { giorno: "Martedì", sessione: "Riposo", tipo: "—", focus: "Recupero" },
      { giorno: "Mercoledì", sessione: "AC", tipo: "A+C", focus: "Parte alta: spinta e tirata · Halo ultimo" },
      { giorno: "Giovedì", sessione: "Riposo", tipo: "—", focus: "Recupero" },
      { giorno: "Venerdì", sessione: "CB", tipo: "C+B", focus: "Gambe principali + chiusura braccia" },
      { giorno: "Sabato", sessione: "Riposo", tipo: "—", focus: "Recupero" },
      { giorno: "Domenica", sessione: "Riposo", tipo: "—", focus: "Recupero" },
    ],
    alternative: [
      "Mar AB · Gio AC · Sab CB",
      "Lun AB · Gio AC · Sab CB (se il mercoledì non è libero)",
    ],
    regoleRecupero: [
      "Non fare AB e CB in due giorni consecutivi: entrambi toccano B (gambe)",
      "AC sta in mezzo: condivide A con AB e C con CB, e dà 48 ore alle gambe",
      "Se salti una seduta: riprendi da quella saltata, non comprimere AB e CB nello stesso giorno",
      "Ordine fisso: AB → AC → CB",
      "Obiettivo 60 min, tetto 75: accoppia isolamento durante il recupero dei *",
    ],
  },
  regoleRirECedimento: {
    ...blocco.guidaOperativa?.regoleRirECedimento,
    principio:
      "Il RIR stampato è il target nelle settimane 6–8. Non significa cedimento su tutte le serie.",
    fondamentali: [
      "Esercizi con *: Panca inclinata AB, Pressa AB, Lento AC, Trap bar CB",
      "Settimane 1–8: nessuna serie a cedimento sui fondamentali",
      "Settimane 10–12: solo l’ultima serie di ogni * può andare a RIR 0–1",
      "Settimana 13: RIR 4–5, mai cedimento",
    ],
  },
};

if (blocco.regoleBlocco?.sett6_8) {
  blocco.regoleBlocco.sett6_8 = blocco.regoleBlocco.sett6_8.map((line) =>
    line.replace(/Leg Extension B1/i, "Leg Extension CB")
  );
}
if (blocco.guidaOperativa?.checklistSeduta) {
  blocco.guidaOperativa.checklistSeduta = [
    "1. Riscaldamento 8–10 min",
    "2. Esercizi nell’ordine della scheda; accoppia isolamento nel recupero dei *",
    "3. Chiudi in 60 min se puoi, mai oltre 75",
    "4. Annota kg, rep e RIR reale (PDF: campo Atleta vuoto)",
    "5. Finisher Halo in AC sempre ultimo",
  ];
}

writeFileSync(BLOCCO, JSON.stringify(blocco, null, 2) + "\n");

hub.anni[0].periodi[0].descrizione =
  "Ciclo annuale di Michele Baldan: 4 fasi × 13 settimane, 3 sedute AB·AC·CB, parte alta ~55%, deload in settimana 13.";
hub.profilo = profilo;
hub._nota =
  "Nome in pagina ciclo; PDF stampa resta anonimo (Atleta: _______). Non inventare dati clinici mancanti.";
writeFileSync(HUB, JSON.stringify(hub, null, 2) + "\n");

meso.split = {
  nome: "AB – AC / C–B · 3 giorni · priorità parte alta",
  descrizione:
    "Tre sedute. A = spinta parte alta, B = gambe, C = tirata parte alta. AB e AC condividono A (petto/spalle due volte a settimana). CB mette C e B lontano da AB così le gambe recuperano. Circa 55% delle serie sulla parte alta. Obiettivo 60 min, tetto 75.",
  giorni: {
    AB: "A + B — spinta parte alta + gambe brevi",
    AC: "A + C — spinta e tirata parte alta (Halo ultimo)",
    CB: "C + B — chiusura tirata/braccia + gambe principali",
  },
  frequenza: "3 allenamenti a settimana con almeno 48 ore tra AB e CB",
  progressione:
    "Su ogni giornata, l’esercizio principale (*) segue progressione a carico fisso: tetto rep col RIR target per 2 sedute di fila → +kg.",
  prioritaVolume: "parte alta ~55%",
  durataSeduta: "obiettivo 60 min, tetto 75 min",
};
if (meso.periodizzazioneAnnuale) {
  meso.periodizzazioneAnnuale.forEach((p) => {
    p.deload = true;
  });
}
writeFileSync(MESO, JSON.stringify(meso, null, 2) + "\n");

function lookupCat(nome) {
  if (catalogo[nome]) return catalogo[nome];
  const n = (nome || "").toLowerCase();
  for (const key of Object.keys(catalogo)) {
    if (key.toLowerCase() === n) return catalogo[key];
  }
  return null;
}

const figureRows = [];
for (const key of SESSIONI) {
  for (const ex of blocco.sessioni[key].esercizi) {
    const cat = lookupCat(ex.nome) || {};
    const fig = ex.figura || cat.figura || "";
    figureRows.push({
      sessione: key.toUpperCase(),
      idEsercizio: fig,
      nome: ex.nome,
      pathSvgSymbol: fig ? "/admin/img/esercizi-sprite.svg#" + fig : "",
      pathImgWebp: null,
      briefVisuale: cat.setup || ex.note || "",
      stile: "SVG tecnico",
      dataAi: null,
    });
  }
}
writeFileSync(
  FIGURE,
  JSON.stringify({ generatedFrom: "blocco-1-fase1.json", stile: "SVG tecnico", rows: figureRows }, null, 2) + "\n"
);

console.log("OK converti AB/AC/CB");
