# SKILL — Michele Baldan · Macrociclo 2026–2027

> **Questo repo** è il ciclo annuale di **Michele Baldan** (50 anni). Default: `/` e `/admin/` (stessa pagina ciclo). Non pubblicare un log pubblico in `/allenamenti/` salvo richiesta. Non inventare dati clinici (infortuni, anni di palestra, livello) se non sono stati detti.

> **Token:** `.cursor/rules/skill-router.mdc` + `docs/SKILL-INDEX.md`. Apri questo file per periodizzazione, schede, PDF, principi.

---

## PRIORITÀ PERMANENTE — Trasparenza AI (AI Act UE)

Riferimento: Regolamento (UE) 2024/1689 (AI Act), art. 50. L’obbligo concreto dipende da come si usa l’IA; qui la regola è sempre la chiarezza.

1. Ogni pagina pubblica carica `js/cookie-consent.js` (notice + link `/trasparenza-ai/`).
2. Ogni immagine generata, abbellita o modificata con IA:
   - `data-ai="generated"` | `edited` | `illustrative`
   - marchio **«Foto AI»** (`.ai-photo-wrap` + `.ai-photo-mark`)
   - trafiletto `.fig-credit` / `.ai-media-note` + `.ai-badge` + link `/trasparenza-ai/`
3. Foto documentale reale (ritratto originale di Michele, palestra): **niente** etichetta IA.
4. Figure delle schede: SVG tecnico (`admin/img/esercizi-sprite.svg`), non illustrazioni IA.
5. Pagina normativa: `/trasparenza-ai/`.

Markup: `.cursor/rules/ai-trasparenza.mdc`.

---

## 1. Chi è e cosa non si inventa

| Campo | Valore |
|-------|--------|
| Nome in pagina | Michele Baldan |
| Nome in PDF stampa | **vuoto** (`Atleta: _______________`) |
| Età | 50 |
| Anni palestra / infortuni / livello | solo se forniti; altrimenti `null` |

Il ritratto è la **foto originale** in `admin/img/michele/michele-baldan.webp` — niente `data-ai` né «Foto AI».

---

## 2. Gerarchia (non si cambia)

```
MACROCICLO  ≈ 52 settimane (1 set 2026 – 31 ago 2027)
  MESOCICLO = 1 fase ≈ 13 settimane (4 fasi)
    MICROCICLO = 1 settimana = 3 sedute AB · AC · CB
```

- **4 fasi × 13 settimane.** Deload = **settimana 13 di ogni fase (−40% volume)**. Obbligatorio.
- Stessi esercizi per tutta la fase. Cambiano serie, rep, RIR, recupero, kg.
- Non usare mesocicli da 3–6 settimane (modello “avanzato giovane”).
- Kettlebell **ultimo** se c’è (Halo in **AC**). Mai in apertura.

Date di cambio fase (13 sett.): fine novembre / fine febbraio / fine maggio / fine agosto.

---

## 3. Settimana: 3 sedute, AB – AC / C–B, parte alta ~55%

Non è più lo split a 4 giorni A1–B1–A2–B2.

| Lettera | Ruolo |
|---------|--------|
| **A** | Spinta parte alta (petto, lento, laterali) |
| **B** | Gambe |
| **C** | Tirata parte alta (schiena, deltoide posteriore, braccia) |

| Seduta | Accoppiamento | Contenuto |
|--------|----------------|-----------|
| **AB** | A + B | Spinta alta + gambe **brevi** |
| **AC** | A + C | Giorno parte alta (spinta + tirata). Halo ultimo |
| **CB** | C + B | Gambe **principali** + chiusura braccia |

**Perché AB poi AC, e CB staccato da AB:** AB e AC condividono A (spinta due volte a settimana). CB mette C e B **lontano** da AB così le gambe (B) hanno ~48 ore. Non fare AB e CB in giorni consecutivi.

Settimana tipo: **Lun AB · Mer AC · Ven CB** (alternativa Mar/Gio/Sab).

**Priorità volume:** ~**55% delle serie sulla parte alta** (petto, schiena, spalle, braccia). Gambe e polpacci il resto. Tolleranza 52–60%. Non è la regola Gino (~55% lower).

Le liste esercizi si **chiudono con Michele**. I principi sopra non si negociamo.

---

## 4. Durata seduta

- **Obiettivo 60 minuti**
- **Tetto 75 minuti** (mai oltre)

Come si sta nel tempo: pochi esercizi (5–6), accoppiamenti (isolamento nel recupero dei *), non aggiungere movimenti. Recuperi lunghi sui * restano: si accoppia, non si taglia il riposo dei fondamentali.

---

## 5. Le 4 fasi — a cosa servono, intensità, recupero

Ogni fase in pagina ciclo **e** in testa alle schede/PDF deve mostrare: perché, intensità, recupero, deload 13.

### Fase 1 · Ipertrofia accumulo (set–nov)

**Perché:** costruire tessuto e tecnica. Non è la fase dei record.

- Intensità: sett. 1–2 RIR 3–2 → 3–5 RIR 2 → 6–8 RIR 1 → 9 −25% volume → 10–12 picco controllato (cedimento solo ultima serie dei *) → **13 deload −40%**
- Recupero: * 2–2,5 min · isolamento ~60 s · accoppiamenti per ≤75 min

### Fase 2 · Tensione + forza (dic–feb)

**Perché:** gli stessi esercizi, meno rep, più kg.

- Intensità: 1–6 tensione 6–8, RIR 1–2 · 7–12 forza 4–6, RIR 1–2 · **13 deload**
- Recupero: * **2,5–3 min** (il recupero lungo è il metodo) · isolamento 60–75 s

### Fase 3 · Ipertrofia II (mar–mag)

**Perché:** la forza nuova torna volume.

- Intensità: 8–12, RIR 1–2, volume pieno (eventuale +1 serie sui * in 9–12) · **13 deload**
- Recupero: come fase 1

### Fase 4 · Ricondizionamento (giu–ago)

**Perché:** chiudere l’anno integri, non bruciati.

- Intensità: 10–12, RIR 2–3, niente cedimento · **13 deload**
- Recupero: può essere un po’ più corto (seduta più facile); tetto 75 resta

JSON: `fase.perche` + `fase.intensitaRecupero` in `admin/data/macrociclo-2026-2027.json`.

---

## 6. PDF e schede

| Cosa | Path |
|------|------|
| Ciclo (home = admin) | `/` · `/admin/` |
| Scheda online | `/admin/sessione/?ciclo=<fase-id>&sessione=ab\|ac\|cb` |
| PDF sessione | `/admin/sessione/pdf/?ciclo=<id>&sessione=ab` |
| PDF fase (3 schede) | `/admin/prototipi/periodizzazione/fase/?fase=<id>` |

PDF:

- A4, margini stretti, kg **vuoti** (`_______`)
- **Atleta: _______________** (niente “Michele Baldan” in stampa)
- Log S1–Sn + note
- In testa: perché della fase + intensità + recupero + durata 60/75
- Figure SVG dal catalogo

Dati: `admin/data/macrociclo-2026-2027.json`, `blocco-1-fase1.json` (dettaglio fase 1), `esercizi-catalogo.json`, `hub-periodizzazione.json`.

Chiavi sessione: **`ab` `ac` `cb`**. Default `ab`.

---

## 7. Pagine e cosa non fare

- Lavoro default: ciclo e admin. **Non** sitemap di `/admin/` se si pubblica un hub pubblico.
- Non linkare un diario/newsletter Gino-Ginevra: questo sito non è La Forza Quotidiana.
- Non deployare su `raasautomazioni.it`. URL: `https://michibaldan.github.io/allenamenti/`
- Repo: `https://github.com/michibaldan/allenamenti`
- Verifica: `npm run macro:verifica` (`tools/verifica-macrociclo.mjs`)
- Conversione split: `node tools/converti-ab-ac-cb.mjs` (non rilanciare se i JSON sono già AB/AC/CB senza bisogno)

---

## 8. Checklist nuova fase / scheda

- [ ] 13 settimane, deload 13
- [ ] 3 sessioni `ab` `ac` `cb`, ordine AB → AC → CB
- [ ] Parte alta ~55% serie (52–60%)
- [ ] Durata obiettivo 60 / tetto 75, accoppiamenti in nota
- [ ] `perche` + `intensitaRecupero` in JSON **e** in UI/PDF
- [ ] Pesi `—` / kg blank, PDF anonimo
- [ ] Halo ultimo in AC se presente
- [ ] Figure da catalogo
- [ ] Nessun dato clinico inventato
