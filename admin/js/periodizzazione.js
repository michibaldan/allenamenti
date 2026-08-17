/**
 * Periodizzazione admin — rendering da mesocicli.json
 * @deprecated Sostituito da periodizzazione-hub.js (hub unificato). Non referenziato in HTML.
 */
(function () {
  "use strict";

  var DATA_URL = "/admin/data/mesocicli.json";
  var FIGURE_IDS = {
    "panca-piana": "fig-press-piano",
    "panca-inclinata": "fig-press-incl",
    "croci-cavi": "fig-croci",
    "lat-machine": "fig-lat",
    "rematore": "fig-rematore",
    "lento-avanti": "fig-lento",
    "alzate-laterali": "fig-alzate",
    "squat": "fig-squat",
    "pressa": "fig-pressa",
    "leg-extension": "fig-legext",
    "leg-curl": "fig-legcurl",
    "stacco-rdl": "fig-rdl",
    "hip-thrust": "fig-hip",
    "curl-bicipiti": "fig-curl",
    "curl-martello": "fig-curl-mart",
    "trazioni": "fig-trazioni",
    "chest-press": "fig-chest"
  };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function listItems(arr) {
    return el("ul", null, (arr || []).map(function (item) {
      return el("li", { text: item });
    }));
  }

  function findCiclo(data, id) {
    return data.cicli.find(function (c) { return c.id === id; });
  }

  function renderTheory(data, root) {
    root.innerHTML = "";

    var heading = el("h3", { className: "perio-live__title", text: "Date e fasi dal file dati (anno corrente)" });
    root.appendChild(heading);
    root.appendChild(el("p", {
      className: "perio-live__lead",
      text: "Questa tabella si aggiorna da mesocicli.json · periodizzazioneAnnuale. Sopra trovi il perché; qui i nomi ufficiali e le durate."
    }));

    var tableWrap = el("div", { className: "perio-table-wrap" });
    var table = el("table", { className: "perio-table" });
    table.innerHTML = "<thead><tr><th>#</th><th>Fase</th><th>Durata</th><th>Obiettivo</th><th>Perché in questa posizione</th></tr></thead>";
    var tbody = el("tbody");
    data.periodizzazioneAnnuale.forEach(function (row) {
      var ciclo = findCiclo(data, row.ciclo);
      var nome = row.nome || (ciclo ? ciclo.nome : row.ciclo);
      var tr = el("tr");
      tr.innerHTML =
        "<td>" + row.successione + "</td>" +
        "<td><strong>" + nome + "</strong></td>" +
        "<td>" + row.durata + "</td>" +
        "<td>" + row.obiettivo + "</td>" +
        "<td>" + row.motivo + "</td>";
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    root.appendChild(tableWrap);

    if (data.split) {
      var splitBox = el("div", { className: "perio-split-box" });
      splitBox.appendChild(el("h4", { text: data.split.nome }));
      splitBox.appendChild(el("p", { text: data.split.frequenza }));
      splitBox.appendChild(el("p", { html: "<small>" + data.split.progressione + "</small>" }));
      root.appendChild(splitBox);
    }
  }

  function exerciseFigure(id) {
    var figId = FIGURE_IDS[id] || "fig-press-piano";
    var wrap = el("div", { className: "exercise-card__fig" });
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 80 80");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + figId);
    svg.appendChild(use);
    wrap.appendChild(svg);
    return wrap;
  }

  function renderExerciseCard(base, scheda, data) {
    var card = el("article", { className: "exercise-card" });
    card.appendChild(exerciseFigure(scheda.id));

    var body = el("div");
    var meta = el("p", { className: "exercise-card__meta" });
    meta.innerHTML = "<strong>" + scheda.serie + "×" + scheda.ripetizioni + "</strong> · Rec " + scheda.recupero + " · RIR " + scheda.rir;
    if (scheda.tecnica) meta.innerHTML += " · " + scheda.tecnica;
    body.appendChild(meta);

    var title = el("h3");
    title.textContent = base.nome;
    if (scheda.progressione) {
      var badge = el("span", { className: "exercise-card__progression", text: "Progressione" });
      title.appendChild(badge);
    }
    body.appendChild(title);

    body.appendChild(el("p", { className: "exercise-card__muscles", html: "<em>Gruppo:</em> " + base.gruppo }));
    if (scheda.note) body.appendChild(el("p", { className: "exercise-card__muscles", text: scheda.note }));

    var tech = el("div", { className: "exercise-tech-grid" });
    [
      ["Postura iniziale", base.posturaIniziale],
      ["Postura finale", base.posturaFinale],
      ["Arco di movimento", base.arcoMovimento]
    ].forEach(function (pair) {
      var block = el("div");
      block.appendChild(el("h4", { text: pair[0] }));
      block.appendChild(el("p", { text: pair[1] }));
      tech.appendChild(block);
    });
    var errBlock = el("div");
    errBlock.appendChild(el("h4", { text: "Errori da evitare" }));
    errBlock.appendChild(listItems(base.errori));
    tech.appendChild(errBlock);
    var sugBlock = el("div");
    sugBlock.appendChild(el("h4", { text: "Suggerimenti tecnici" }));
    sugBlock.appendChild(listItems(base.suggerimenti));
    tech.appendChild(sugBlock);
    body.appendChild(tech);
    card.appendChild(body);
    return card;
  }

  function renderSchede(data, root, initialId) {
    root.innerHTML = "";
    var tabs = el("div", { className: "ciclo-tabs", role: "tablist" });
    var content = el("div", { id: "schede-content" });
    root.appendChild(tabs);
    root.appendChild(content);

    function showCiclo(id) {
      var ciclo = findCiclo(data, id);
      if (!ciclo) return;
      tabs.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-active", b.dataset.ciclo === id);
      });
      content.innerHTML = "";
      content.appendChild(el("h2", { text: ciclo.nome }));
      content.appendChild(el("p", { className: "ciclo-card__meta", text: ciclo.obiettivo }));

      Object.keys(ciclo.allenamenti || {}).forEach(function (dayKey) {
        var day = ciclo.allenamenti[dayKey];
        if (!day) return;
        var section = el("section", { className: "day-block" });
        var head = el("div", { className: "day-block__head" });
        head.appendChild(el("h2", { text: dayKey }));
        head.appendChild(el("span", { className: "day-block__tag", text: day.nome }));
        section.appendChild(head);
        var grid = el("div", { className: "exercise-grid" });
        day.esercizi.forEach(function (ex) {
          var base = data.eserciziBase[ex.id];
          if (base) grid.appendChild(renderExerciseCard(base, ex, data));
        });
        section.appendChild(grid);
        content.appendChild(section);
      });
    }

    data.cicli.forEach(function (ciclo) {
      var btn = el("button", {
        type: "button",
        role: "tab",
        "data-ciclo": ciclo.id,
        text: ciclo.nome
      });
      btn.addEventListener("click", function () { showCiclo(ciclo.id); });
      tabs.appendChild(btn);
    });

    showCiclo(initialId || data.cicli[0].id);
  }

  function renderPdf(data, root, initialId) {
    root.innerHTML = "";
    var select = el("div", { className: "pdf-cycle-select" });
    var printArea = el("div", { id: "pdf-print-area" });
    root.appendChild(select);
    root.appendChild(printArea);

    function renderSheet(id) {
      var ciclo = findCiclo(data, id);
      if (!ciclo) return;
      select.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-active", b.dataset.ciclo === id);
      });
      printArea.innerHTML = "";

      var article = el("article", { className: "scheda-a4 scheda-a4--admin" });
      var head = el("header", { className: "scheda-a4__head" });
      head.innerHTML = "<div class=\"scheda-a4__head-main\"><strong>Scheda allenamento</strong> · periodizzazione</div>" +
        "<div class=\"scheda-a4__head-period\"><span class=\"scheda-a4__badge\">" + ciclo.durata + "</span> <strong>" + ciclo.nome + "</strong> — " + ciclo.obiettivo + "</div>" +
        "<div class=\"scheda-a4__head-meta\"><span><strong>Atleta:</strong> _______________</span><span><strong>Data inizio:</strong> ___/___/___</span><span><strong>RIR target:</strong> " + ciclo.intensita + "</span></div>";
      article.appendChild(head);

      var oss = el("div", { className: "scheda-a4__osservazioni" });
      oss.innerHTML =
        "<div class=\"scheda-a4__osservazioni-label\">Osservazioni / note fase</div>" +
        "<div class=\"scheda-a4__osservazioni-line\"></div>" +
        "<div class=\"scheda-a4__osservazioni-line\"></div>";
      article.appendChild(oss);

      var grid = el("div", { className: "scheda-a4__grid" });
      Object.keys(ciclo.allenamenti || {}).forEach(function (dayKey) {
        var day = ciclo.allenamenti[dayKey];
        if (!day) return;
        var quad = el("section", { className: "scheda-a4__quad" });
        quad.appendChild(el("h2", { text: dayKey + " · " + day.nome }));
        var table = el("table");
        table.innerHTML = "<thead><tr><th>Esercizio</th><th>S×R</th><th>RIR</th><th>Rec</th><th>kg</th><th>Reps</th><th>Note</th></tr></thead>";
        var tbody = el("tbody");
        day.esercizi.forEach(function (ex) {
          var base = data.eserciziBase[ex.id];
          var tr = el("tr");
          var nome = base ? base.nome : ex.id;
          if (ex.progressione) nome += " *";
          tr.innerHTML = "<td>" + nome + "</td><td>" + ex.serie + "×" + ex.ripetizioni + "</td><td>" + ex.rir + "</td><td>" + ex.recupero + "</td><td></td><td></td><td>" + (ex.tecnica || ex.note || "") + "</td>";
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        quad.appendChild(table);
        grid.appendChild(quad);
      });
      article.appendChild(grid);
      article.appendChild(el("footer", { className: "scheda-a4__foot", text: ciclo.nome + " · * = progressione · colonna kg da compilare dopo massimali" }));
      printArea.appendChild(article);
    }

    data.cicli.forEach(function (ciclo) {
      var btn = el("button", { type: "button", "data-ciclo": ciclo.id, text: ciclo.nome });
      btn.addEventListener("click", function () { renderSheet(ciclo.id); });
      select.appendChild(btn);
    });

    renderSheet(initialId || data.cicli[0].id);
  }

  function init() {
    var mode = document.body.dataset.perioMode;
    var root = document.getElementById("perio-root");
    if (!mode || !root) return;

    var params = new URLSearchParams(window.location.search);
    var cicloId = params.get("ciclo");

    fetch(DATA_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (mode === "theory") renderTheory(data, root);
        else if (mode === "schede") renderSchede(data, root, cicloId);
        else if (mode === "pdf") renderPdf(data, root, cicloId);
      })
      .catch(function (err) {
        root.innerHTML = "<p class=\"admin-error\">Errore caricamento dati: " + err.message + "</p>";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
