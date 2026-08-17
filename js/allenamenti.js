(function () {
  "use strict";

  const status = document.getElementById("status");
  const cicloEl = document.getElementById("ciclo");
  const weekEl = document.getElementById("settimana");
  const schedeEl = document.getElementById("schede");

  function dayCard(day, schede) {
    const scheda = day.scheda_id
      ? schede.find(function (s) {
          return s.id === String(day.scheda_id);
        })
      : null;
    const on = Boolean(scheda);
    const title = scheda ? scheda.titolo : "Off";
    const href = scheda ? "../schede/" + scheda.file : "";
    const inner =
      "<span class=\"g\">" +
      Hub.escapeHtml(day.giorno) +
      "</span><strong>" +
      Hub.escapeHtml(title) +
      "</strong><p>" +
      Hub.escapeHtml(day.focus) +
      "</p>";
    if (href) {
      return "<a class=\"day on\" href=\"" + href + "\">" + inner + "</a>";
    }
    return "<div class=\"day\">" + inner + "</div>";
  }

  Promise.all([
    Hub.loadJSON("../data/ciclo-attivo.json"),
    Hub.loadJSON("../data/schede.json")
  ])
    .then(function (results) {
      const ciclo = results[0];
      const schede = results[1].schede || [];

      document.title = ciclo.nome + " — programma";

      cicloEl.innerHTML =
        "<p class=\"kicker\">Ciclo attivo</p>" +
        "<h1>" +
        Hub.escapeHtml(ciclo.nome) +
        "</h1>" +
        "<p class=\"lead\">" +
        Hub.escapeHtml(ciclo.split) +
        "</p>" +
        "<div class=\"meta-row\">" +
        "<span class=\"pill\">Fase <strong>" +
        Hub.escapeHtml(ciclo.fase) +
        "</strong></span>" +
        "<span class=\"pill\">Durata <strong>" +
        Hub.escapeHtml(ciclo.settimane + " settimane") +
        "</strong></span>" +
        "<span class=\"pill\">Dal <strong>" +
        Hub.escapeHtml(Hub.formatDate(ciclo.inizio)) +
        "</strong></span>" +
        "<span class=\"pill\">Al <strong>" +
        Hub.escapeHtml(Hub.formatDate(ciclo.fine)) +
        "</strong></span>" +
        "</div>" +
        "<p class=\"note\">" +
        Hub.escapeHtml(ciclo.progressione) +
        "</p>" +
        "<p class=\"note\">" +
        Hub.escapeHtml(ciclo.note) +
        "</p>";

      weekEl.innerHTML = (ciclo.settimana_tipo || [])
        .map(function (day) {
          return dayCard(day, schede);
        })
        .join("");

      schedeEl.innerHTML = schede
        .map(function (s) {
          return (
            "<a class=\"scheda-link\" href=\"../schede/" +
            Hub.escapeHtml(s.file) +
            "\"><small>Scheda " +
            Hub.escapeHtml(s.id) +
            " · " +
            Hub.escapeHtml(s.durata_min + " min") +
            "</small><strong>" +
            Hub.escapeHtml(s.titolo) +
            "</strong><span>" +
            Hub.escapeHtml(s.sottotitolo) +
            " · " +
            Hub.escapeHtml(s.esercizi.length + " esercizi") +
            "</span></a>"
          );
        })
        .join("");

      Hub.showStatus(status, "");
    })
    .catch(function (err) {
      Hub.showStatus(
        status,
        "Impossibile caricare il programma. Usa GitHub Pages o un server locale. Dettaglio: " +
          err.message,
        true
      );
    });
})();
