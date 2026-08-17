# Michele Baldan — macrociclo 2026–2027

Ciclo annuale: 4 fasi × 13 settimane, **3 schede a settimana (AB · AC · CB)**, priorità parte alta ~55%. PDF anonimo (Atleta a penna). Obiettivo 60 min, tetto 75.

## Online

Repo: https://github.com/michibaldan/allenamenti

- Home: https://michibaldan.github.io/allenamenti/
- Ciclo: https://michibaldan.github.io/allenamenti/admin/

Pages: Settings → Pages → Source = GitHub Actions.

## Locale (si lavora da questa cartella sul PC)

Da PowerShell, nella root del repo:

```bash
python -m http.server 8080
```

Poi apri http://127.0.0.1:8080/

- Home / ciclo: `/`
- Admin e PDF: `/admin/`
- Hub semplice PPL (Push / Pull / Gambe): `/allenamenti/`

## Verifica

`npm run macro:verifica`
