# SKILL — Michele Baldan · Macrociclo 2026–2027

> **Questo repo** è il ciclo annuale di **Michele Baldan** (53 anni, 65 kg, ~10 anni palestra, natural). Default: `/` e `/admin/` (stessa pagina ciclo). Non pubblicare un log pubblico in `/allenamenti/` salvo richiesta. Non inventare dati clinici (infortuni, punti deboli visivi) se non sono stati detti. Foto in costume: **da caricare dopo**, per verificare le priorità; fino ad allora non descrivere la fisicità.

> **Token:** `.cursor/rules/skill-router.mdc` + `docs/SKILL-INDEX.md`. Apri questo file per periodizzazione, schede, PDF, principi, privacy.

---

## PRIORITÀ PERMANENTE — Trasparenza AI (AI Act UE)

Riferimento: Regolamento (UE) 2024/1689 (AI Act), art. 50. L’obbligo concreto dipende da come si usa l’IA; qui la regola è sempre la chiarezza.

1. Ogni pagina pubblica carica `js/cookie-consent.js` (banner Garante + link `/privacy/` `/cookie/` `/trasparenza-ai/`).
2. Ogni immagine generata, abbellita o modificata con IA:
   - `data-ai="generated"` | `edited` | `illustrative`
   - marchio **«Foto AI»** (`.ai-photo-wrap` + `.ai-photo-mark`)
   - trafiletto `.fig-credit` / `.ai-media-note` + `.ai-badge` + link `/trasparenza-ai/`
3. Foto documentale reale (ritratto originale di Michele, palestra, costume): **niente** etichetta IA.
4. Figure delle schede: SVG tecnico (`admin/img/esercizi-sprite.svg`), non illustrazioni IA.
5. Pagina normativa: `/trasparenza-ai/`.

Markup: `.cursor/rules/ai-trasparenza.mdc`.

---

## PRIORITÀ PERMANENTE — Privacy e cookie (UE + Italia)

Sito personale, noindex, **senza analytics/ads**. Resta obbligatorio essere chiari.

| Norma | Cosa fare qui |
|-------|----------------|
| GDPR (UE) 2016/679 art. 13–22, 77 | Pagine `/privacy/` e `/cookie/`. Titolare: Michele Baldan. Contatto diritti: issue GitHub (niente email in pagina). |
| Codice Privacy D.Lgs. 196/2003 (mod. 101/2018) | Minori: sito non per &lt;14 anni (art. 2-quinquies). Cookie: art. 122. |
| ePrivacy 2002/58/CE + Garante 10 giugno 2021 | Banner: **Accetto** e **Solo necessari** stesso peso. Niente consenso da scroll. Niente pre-spunte su statistica. |
| Hosting extra-SEE | GitHub Pages (USA), Data Privacy Framework. Dichiarato in privacy. |

Regole operative:

- **Niente Google Fonts, Analytics, pixel, embed social** (trasferirebbero IP a terzi senza base). Font di sistema.
- `cookie-consent.js` su ogni HTML pubblico (home, admin, schede, legal). Scelta in `localStorage` `mb-consent-v1`; si ripropone dopo 6 mesi.
- Deploy Pages: riscrivere anche `/privacy/` e `/cookie/` con prefisso `/allenamenti/`.
- Non inventare un indirizzo email del titolare. Non aggiungere tracker «tanto per».

---

## 1. Chi è e cosa non si inventa

| Campo | Valore |
|-------|--------|
| Nome in pagina | Michele Baldan |
| Nome in PDF stampa | **vuoto** (`Atleta: _______________`) |
| Età | **53** |
| Peso | **65 kg** |
| Anni palestra | **~10** (dichiarati) |
| Infortuni | solo se forniti; altrimenti `null` |
| Foto in costume | **non ancora**; quando arrivano, usarle per verificare i punti deboli, non per inventarli prima |

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

## 3. Settimana: 3 sedute, AB – AC / C–B, parte alta ~55% + glutei

Non è più lo split a 4 giorni A1–B1–A2–B2. Non è lo split PPL della scheda Green Soul (quella era 3 giorni × 12 settimane, scadenza 8 mag 2026).

| Lettera | Ruolo |
|---------|--------|
| **A** | Spinta parte alta (petto, lento, laterali, tricipiti) |
| **B** | Gambe **con enfasi glutei** (hip thrust, pressa/affondi, abduzione) |
| **C** | Tirata parte alta (dorso, bicipiti) + chiusura braccia |

| Seduta | Accoppiamento | Contenuto (fase 1, liste chiuse) |
|--------|----------------|-----------|
| **AB** | A + B | Panca inclinata, croci, laterali, **hip thrust**, pressa, pushdown |
| **AC** | A + C | Lat, rematore, lento, chest press, Scott, pushdown, **Halo ultimo** |
| **CB** | C + B | Trap bar, **hip thrust volume**, affondi, leg curl, **abduzione glutei**, martello |

**Perché AB poi AC, e CB staccato da AB:** AB e AC condividono A (petto/tricipiti due volte). CB mette B **lontano** da AB così glutei e gambe hanno ~48 ore. Non fare AB e CB in giorni consecutivi.

Settimana tipo: **Lun AB · Mer AC · Ven CB** (alternativa Mar/Gio/Sab).

**Priorità volume (dichiarate da Michele):** petto, dorso, spalle, bicipiti, tricipiti, gambe; **glutei in enfasi** sul lower. Parte alta resta **52–62%** delle serie (non è la regola Gino ~55% lower). Petto e tricipiti 2× (AB+AC), bicipiti 2× (AC+CB), glutei 2× (AB+CB).

Le liste esercizi si **chiudono con Michele**. I principi sopra non si negociamo. Dopo le foto in costume si possono ritoccare volumi, non lo split.

---

## 4. Durata seduta

- **Obiettivo 75 minuti**
- **Tetto 90 minuti** (mai oltre; dichiarato da Michele)

Come si sta nel tempo: pochi esercizi (6–7), accoppiamenti (isolamento nel recupero dei *), non aggiungere movimenti. Recuperi lunghi sui * restano: si accoppia, non si taglia il riposo dei fondamentali.

---

## 5. Le 4 fasi — a cosa servono, intensità, recupero

Ogni fase in pagina ciclo **e** in testa alle schede/PDF deve mostrare: perché, intensità, recupero, deload 13.

### Fase 1 · Ipertrofia accumulo (set–nov)

**Perché:** costruire tessuto e tecnica. Non è la fase dei record.

- Intensità: sett. 1–2 RIR 3–2 → 3–5 RIR 2 → 6–8 RIR 1 → 9 −25% volume → 10–12 picco controllato (cedimento solo ultima serie dei *) → **13 deload −40%**
- Recupero: * 2–2,5 min · isolamento ~60 s · accoppiamenti per ≤90 min

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
- Recupero: può essere un po’ più corto (seduta più facile); tetto 90 resta

JSON: `fase.perche` + `fase.intensitaRecupero` in `admin/data/macrociclo-2026-2027.json`.

---

## 6. PDF e schede

| Cosa | Path |
|------|------|
| Ciclo (home = admin) | `/` · `/admin/` |
| Scheda online | `/admin/sessione/?ciclo=<fase-id>&sessione=ab\|ac\|cb` |
| PDF sessione | `/admin/sessione/pdf/?ciclo=<id>&sessione=ab` |
| PDF fase (3 schede) | `/admin/prototipi/periodizzazione/fase/?fase=<id>` |
| Ciclo spiegato | `/ciclo/` — 4 mesocicli, glossario, PDF per fase |
| Privacy / cookie | `/privacy/` · `/cookie/` |

PDF:

- A4, margini stretti, kg **vuoti** (`_______`)
- **Atleta: _______________** (niente “Michele Baldan” in stampa)
- Log S1–Sn + note
- In testa: perché della fase + intensità + recupero + durata 75/90
- Figure SVG dal catalogo
- **Stampa palestra:** testo più grande dell’originale compatto; **max 2 facciate A4** per scheda sessione e PDF fase. Figure SVG visibili, log a due colonne, intro compatta.

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
- Cartella locale canonica: `C:\Users\Utente\progetti\allenamenti` (origin `michibaldan/allenamenti`). `Michele-allenamenti` è copia di lavoro: allinearla, non farla divergere.

---

## 8. Checklist nuova fase / scheda

- [ ] 13 settimane, deload 13
- [ ] 3 sessioni `ab` `ac` `cb`, ordine AB → AC → CB
- [ ] Parte alta 52–62% serie, glutei in enfasi sul lower
- [ ] Durata obiettivo 75 / tetto 90, accoppiamenti in nota
- [ ] `perche` + `intensitaRecupero` in JSON **e** in UI/PDF
- [ ] Pesi `—` / kg blank, PDF anonimo
- [ ] Halo ultimo in AC se presente
- [ ] Figure da catalogo
- [ ] Nessun dato clinico inventato; foto costume solo se fornite
- [ ] Privacy/cookie: niente font/analytics di terza parte; banner e pagine legal allineate
