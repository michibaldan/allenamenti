(function () {
  "use strict";

  const status = document.getElementById("status");
  const nomeEl = document.getElementById("nome");
  const leadEl = document.getElementById("lead");
  const statsEl = document.getElementById("stats");
  const cicloEl = document.getElementById("ciclo-teaser");

  function stat(label, value) {
    return (
      "<div class=\"stat\"><dt>" +
      Hub.escapeHtml(label) +
      "</dt><dd>" +
      Hub.escapeHtml(value) +
      "</dd></div>"
    );
  }

  Promise.all([
    Hub.loadJSON("data/profilo.json"),
    Hub.loadJSON("data/ciclo-attivo.json")
  ])
    .then(function (results) {
      const profilo = results[0];
      const ciclo = results[1];

      document.title = profilo.nome + " — hub allenamenti";
      nomeEl.textContent = profilo.nome;
      leadEl.textContent =
        profilo.obiettivo +
        ". " +
        profilo.allenamenti_settimana +
        " sedute a settimana, circa " +
        profilo.durata_seduta_min +
        " minuti, in " +
        profilo.attrezzatura +
        ".";

      statsEl.innerHTML = [
        stat("Età", profilo.eta + " anni"),
        stat("Altezza", profilo.altezza_cm + " cm"),
        stat("Peso", profilo.peso_kg + " kg"),
        stat("Livello", profilo.livello),
        stat("Sedute", profilo.allenamenti_settimana + " / settimana"),
        stat("Durata", profilo.durata_seduta_min + " min"),
        stat("Attrezzatura", profilo.attrezzatura),
        stat("Limitazioni", profilo.limitazioni)
      ].join("");

      cicloEl.innerHTML =
        "<p class=\"kicker\">Ciclo attivo</p>" +
        "<h2>" +
        Hub.escapeHtml(ciclo.nome) +
        "</h2>" +
        "<p class=\"lead\">" +
        Hub.escapeHtml(ciclo.settimane + " settimane · fase " + ciclo.fase) +
        "</p>" +
        "<p class=\"note\">" +
        Hub.escapeHtml(ciclo.split) +
        ". Dal " +
        Hub.escapeHtml(Hub.formatDate(ciclo.inizio)) +
        " al " +
        Hub.escapeHtml(Hub.formatDate(ciclo.fine)) +
        ".</p>";

      Hub.showStatus(status, "");
    })
    .catch(function (err) {
      Hub.showStatus(
        status,
        "Impossibile caricare i dati. Apri il sito da GitHub Pages o con un server locale: da file:// il browser blocca il fetch. Dettaglio: " +
          err.message,
        true
      );
    });
})();
