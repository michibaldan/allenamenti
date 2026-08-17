(function () {
  "use strict";

  const status = document.getElementById("status");
  const root = document.getElementById("scheda");
  const printBtn = document.getElementById("stampa");
  const schedaId = document.body.getAttribute("data-scheda");

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  function exCard(ex) {
    return (
      "<article class=\"ex\">" +
      "<div class=\"ex-top\">" +
      "<span class=\"num\">" +
      Hub.escapeHtml(ex.ordine) +
      "</span>" +
      "<div><h3>" +
      Hub.escapeHtml(ex.nome) +
      "</h3><p class=\"gruppo\">" +
      Hub.escapeHtml(ex.gruppo) +
      "</p></div></div>" +
      "<dl class=\"ex-grid\">" +
      "<div><dt>Serie</dt><dd>" +
      Hub.escapeHtml(ex.serie) +
      "</dd></div>" +
      "<div><dt>Ripetizioni</dt><dd>" +
      Hub.escapeHtml(ex.ripetizioni) +
      "</dd></div>" +
      "<div><dt>Recupero</dt><dd>" +
      Hub.escapeHtml(ex.recupero_sec + " s") +
      "</dd></div>" +
      "<div><dt>Intensità</dt><dd>" +
      Hub.escapeHtml(ex.intensita) +
      "</dd></div>" +
      "</dl>" +
      "<p class=\"note\">" +
      Hub.escapeHtml(ex.note) +
      "</p></article>"
    );
  }

  Promise.all([
    Hub.loadJSON("../data/schede.json"),
    Hub.loadJSON("../data/profilo.json")
  ])
    .then(function (results) {
      const schede = results[0].schede || [];
      const profilo = results[1];
      const scheda = schede.find(function (s) {
        return s.id === String(schedaId);
      });

      if (!scheda) {
        throw new Error("Scheda " + schedaId + " non trovata in schede.json");
      }

      document.title = scheda.titolo + " — " + profilo.nome;

      const printLine = document.getElementById("print-meta");
      if (printLine) {
        printLine.textContent =
          profilo.nome +
          " · " +
          scheda.titolo +
          " · " +
          scheda.durata_min +
          " min · da stampare o salvare in PDF";
      }

      root.innerHTML =
        "<p class=\"kicker\">Scheda " +
        Hub.escapeHtml(scheda.id) +
        "</p>" +
        "<h1>" +
        Hub.escapeHtml(scheda.titolo) +
        "</h1>" +
        "<p class=\"lead\">" +
        Hub.escapeHtml(scheda.sottotitolo) +
        " · circa " +
        Hub.escapeHtml(scheda.durata_min + " minuti") +
        "</p>" +
        "<div class=\"panel stack\">" +
        "<h2>Riscaldamento</h2>" +
        "<p class=\"note\">" +
        Hub.escapeHtml(scheda.riscaldamento) +
        "</p></div>" +
        "<div class=\"esercizi stack\">" +
        scheda.esercizi.map(exCard).join("") +
        "</div>" +
        "<div class=\"panel stack\">" +
        "<h2>Note della seduta</h2>" +
        "<p class=\"note\">" +
        Hub.escapeHtml(scheda.note_scheda) +
        "</p></div>";

      Hub.showStatus(status, "");
    })
    .catch(function (err) {
      Hub.showStatus(
        status,
        "Impossibile caricare la scheda. Usa GitHub Pages o un server locale. Dettaglio: " +
          err.message,
        true
      );
    });
})();
