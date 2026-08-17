/**
 * Renderer dettagliato sessione Blocco 1 — figure SVG, periodizzazione, diario
 */
(function () {
  "use strict";

  var BLOCCO1_URL = (window.fqUrl ? window.fqUrl("/admin/data/blocco-1-fase1.json") : "/admin/data/blocco-1-fase1.json");
  var CATALOGO_URL = (window.fqUrl ? window.fqUrl("/admin/data/esercizi-catalogo.json") : "/admin/data/esercizi-catalogo.json");

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

  function formatDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString("it-IT", {
      day: "numeric", month: "long", year: "numeric"
    });
  }

  function stars(n) {
    return "⭐".repeat(Math.min(n, 5));
  }

  function figureSvg(figId, label) {
    var wrap = el("div", { className: "exercise-card__fig admin-ex-fig" });
    wrap.appendChild(window.fqSprite.figure(figId, label));
    return wrap;
  }

  function renderTable(headers, rows, className) {
    var wrap = el("div", { className: "table-wrap" });
    var table = el("table", { className: className || "scheda-table" });
    var thead = el("thead");
    var hr = el("tr");
    headers.forEach(function (h) { hr.appendChild(el("th", { text: h })); });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (cell) {
        tr.appendChild(el("td", typeof cell === "object" ? cell : { text: cell }));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function renderPriorita(list) {
    var ul = el("ul", { className: "admin-priorita" });
    list.forEach(function (p) {
      ul.appendChild(el("li", { html: stars(p.stelle) + " <strong>" + p.muscolo + "</strong>" }));
    });
    return ul;
  }

  function renderRegole(regole) {
    var wrap = el("div", { className: "admin-regole-grid" });
    var labels = {
      sett1_2: "Settimane 1-2",
      sett3_5: "Settimane 3-5",
      sett3_6: "Settimane 3-6",
      sett6_8: "Settimane 6-8",
      sett7_10: "Settimane 7-10",
      sett9: "Settimana 9",
      sett10_12: "Settimane 10-12",
      sett11_12: "Settimane 11-12",
      sett13: "Settimana 13"
    };
    var order = ["sett1_2", "sett3_5", "sett3_6", "sett6_8", "sett7_10", "sett9", "sett10_12", "sett11_12", "sett13"];
    order.forEach(function (key) {
      if (!regole[key] || !labels[key]) return;
      var card = el("div", { className: "admin-regole-card card" });
      card.appendChild(el("h3", { text: labels[key] }));
      var ul = el("ul");
      regole[key].forEach(function (r) { ul.appendChild(el("li", { text: r })); });
      card.appendChild(ul);
      wrap.appendChild(card);
    });
    return wrap;
  }

  function renderFocus(focus) {
    if (!focus) return null;
    var sec = el("section", { className: "admin-focus" });
    sec.appendChild(el("h2", { text: "Focus tecnico" }));
    Object.keys(focus).forEach(function (nome) {
      var block = el("div", { className: "admin-focus__item" });
      block.appendChild(el("h3", { text: nome }));
      var ul = el("ul");
      focus[nome].forEach(function (line) {
        ul.appendChild(el("li", { html: "✔ " + line }));
      });
      block.appendChild(ul);
      sec.appendChild(block);
    });
    return sec;
  }

  function renderDiario(esercizi) {
    var sec = el("section", { className: "admin-diario" });
    sec.appendChild(el("h2", { text: "Diario allenamento" }));
    sec.innerHTML +=
      "<p>Data: ___________________ · Peso corporeo: ___________ · Durata: _______</p>";
    var headers = ["Esercizio", "Kg", "S1", "S2", "S3", "S4", "RIR reale"];
    var rows = esercizi.map(function (ex) {
      var short = ex.nome.split(" ")[0];
      return [short, "", "", "", "", ex.serie >= 4 ? "" : "—", ""];
    });
    sec.appendChild(renderTable(headers, rows, "admin-diario-table"));
    return sec;
  }

  function renderExerciseCards(esercizi, catalogo) {
    var grid = el("div", { className: "exercise-grid admin-exercise-grid" });
    esercizi.forEach(function (ex) {
      var cat = (window.fqSprite && window.fqSprite.catalog)
        ? window.fqSprite.catalog(catalogo, ex.nome)
        : (catalogo[ex.nome] || {});
      var card = el("article", { className: "exercise-card" + (ex.progressionePrincipale ? " exercise-card--prog" : "") });
      card.appendChild(figureSvg(ex.figura || cat.figura, ex.nome));

      var body = el("div");
      body.appendChild(el("p", {
        className: "exercise-card__meta",
        html: "<strong>" + ex.serie + "×" + ex.ripetizioni + "</strong> · Tempo " + ex.tempo +
          " · Rec " + ex.recupero + (ex.rir ? " · RIR " + ex.rir : "") +
          (ex.progressionePrincipale ? " · <span class=\"tag-prog\">Progressione *</span>" : "")
      }));
      body.appendChild(el("h3", { text: ex.nome }));
      body.appendChild(el("p", {
        className: "exercise-card__muscles",
        html: "<em>Gruppo:</em> " + ex.gruppo + (ex.progressione ? " · <em>Progressione:</em> " + ex.progressione : "")
      }));

      var exec = el("ul", { className: "exercise-card__exec" });
      if (cat.setup) exec.appendChild(el("li", { text: cat.setup }));
      if (cat.movimento) exec.appendChild(el("li", { text: cat.movimento }));
      if (ex.note) exec.appendChild(el("li", { text: ex.note }));
      if (exec.children.length) body.appendChild(exec);

      card.appendChild(body);
      grid.appendChild(card);
    });
    return grid;
  }

  function querySuffix() {
    var anno = new URLSearchParams(window.location.search).get("anno");
    return anno ? "&anno=" + encodeURIComponent(anno) : "";
  }

  function sessionHref(bloccoId, sessionKey) {
    return "/admin/sessione/?ciclo=" + encodeURIComponent(bloccoId) +
      "&sessione=" + sessionKey + querySuffix();
  }

  function renderBlocco1Session(blocco, sessionKey, catalogo, root) {
    var s = blocco.sessioni[sessionKey];
    if (!s) {
      root.innerHTML = "<p>Sessione non trovata.</p>";
      return;
    }

    root.innerHTML = "";
    document.title = s.codice + " – " + blocco.codice + " | Admin";

    var nav = el("nav", { className: "admin-breadcrumb" });
    nav.innerHTML =
      "<a href=\"/admin/\">Dashboard</a> · " +
      "<a href=\"/admin/prototipi/periodizzazione/#schede-hub\">Periodizzazione</a> · " +
      "<strong>" + s.codice + " – " + blocco.codice + "</strong>";
    root.appendChild(nav);

    var head = el("header", { className: "admin-session-head admin-session-head--blocco" });
    head.innerHTML =
      "<p class=\"tagline\">" + blocco.tipo + " · " + formatDate(blocco.inizio) + " – " + formatDate(blocco.fine) + "</p>" +
      "<h1>" + s.codice + " – " + blocco.codice + "</h1>" +
      "<p class=\"lead\">" + s.nome + " · " + blocco.durataSeduta + " · " + blocco.frequenza + "</p>";
    root.appendChild(head);
    if (blocco.intensitaRecupero || s.notaSeduta) {
      var irBox = el("aside", { className: "admin-fase__ir" });
      if (blocco.perche) irBox.appendChild(el("p", { html: "<strong>A cosa serve.</strong> " + blocco.perche }));
      if (blocco.intensitaRecupero) {
        irBox.appendChild(el("p", { html: "<strong>Intensità.</strong> " + blocco.intensitaRecupero.intensita }));
        irBox.appendChild(el("p", { html: "<strong>Recupero.</strong> " + blocco.intensitaRecupero.recupero }));
      }
      if (s.notaSeduta) irBox.appendChild(el("p", { text: s.notaSeduta }));
      root.appendChild(irBox);
    }

    var actions = el("div", { className: "admin-session-actions no-print" });
    actions.innerHTML =
      "<a class=\"btn btn-primary\" href=\"/admin/metodo-blocco1/pdf/\">PDF metodo blocco</a>" +
      "<a class=\"btn btn-primary\" href=\"/admin/sessione/pdf/?ciclo=" + encodeURIComponent(blocco.id) + "&sessione=" + sessionKey + querySuffix() + "\" target=\"_blank\">Stampa scheda con spiegazioni</a>" +
      "<a class=\"btn btn-ghost\" href=\"/admin/prototipi/periodizzazione/fase/?fase=" + encodeURIComponent(blocco.id) + "\" target=\"_blank\">PDF fase completa AB–CB</a>" +
      "<a class=\"btn btn-ghost\" href=\"/admin/mappa-esercizi/\">Mappa esercizi</a>";
    root.appendChild(actions);

    if (s.priorita) {
      var pri = el("section", { className: "admin-section" });
      pri.appendChild(el("h2", { text: "Priorità della seduta" }));
      pri.appendChild(renderPriorita(s.priorita));
      root.appendChild(pri);
    }

    var scheda = el("section", { className: "admin-section" });
    scheda.appendChild(el("h2", { text: "Scheda " + s.codice }));
    scheda.appendChild(renderTable(
      ["Esercizio", "Serie", "Rip.", "RIR", "Tempo", "Recupero", "Progressione"],
      s.esercizi.map(function (ex) {
        return [
          ex.nome + (ex.progressionePrincipale ? " *" : ""),
          String(ex.serie),
          ex.ripetizioni,
          ex.rir || "—",
          ex.tempo,
          ex.recupero,
          ex.progressione || "—"
        ];
      }),
      "scheda-table admin-scheda-table"
    ));
    root.appendChild(scheda);

    var cards = el("section", { className: "admin-section" });
    cards.appendChild(el("h2", { text: "Esercizi con figure" }));
    cards.appendChild(renderExerciseCards(s.esercizi, catalogo));
    root.appendChild(cards);

    var focus = renderFocus(s.focusTecnico);
    if (focus) root.appendChild(focus);

    if (s.volumeSeduta && s.volumeSeduta.length) {
      var vol = el("section", { className: "admin-section" });
      vol.appendChild(el("h2", { text: "Volume della seduta" }));
      vol.appendChild(renderTable(
        ["Gruppo muscolare", "Serie"],
        s.volumeSeduta.map(function (v) { return [v.gruppo, String(v.serie)]; })
      ));
      root.appendChild(vol);
    }

    if (s.notaComplementare) {
      var note = el("aside", { className: "admin-callout card" });
      note.appendChild(el("p", { html: s.notaComplementare }));
      root.appendChild(note);
    }

    root.appendChild(renderDiario(s.esercizi));

    var shared = el("section", { className: "admin-section admin-section--shared" });
    if (blocco.guidaOperativa) {
      shared.appendChild(el("h2", { text: "Come usare il blocco" }));
      shared.appendChild(el("p", {
        html: blocco.guidaOperativa.sintesi +
          " <a class=\"btn btn-ghost btn-sm\" href=\"/admin/metodo-blocco1/pdf/\">PDF / Stampa metodo →</a> · " +
          "<a class=\"btn btn-ghost btn-sm\" href=\"/admin/metodo-blocco1/\">Guida online</a>"
      }));
      if (blocco.guidaOperativa.periodizzazioneIntensita) {
        shared.appendChild(el("h3", { text: "Periodizzazione 13 settimane" }));
        shared.appendChild(renderTable(
          ["Settimane", "RIR", "Volume", "Nota"],
          blocco.guidaOperativa.periodizzazioneIntensita.map(function (p) {
            return [p.settimane, p.intensita, p.volume, p.nota];
          }),
          "scheda-table"
        ));
      }
    } else {
      shared.appendChild(el("h2", { text: "Periodizzazione del blocco (13 settimane)" }));
      shared.appendChild(renderTable(
        ["Fase", "Settimane", "Obiettivo"],
        blocco.periodizzazione.map(function (p) { return [p.fase, p.settimane, p.obiettivo]; }),
        "scheda-table"
      ));
    }
    shared.appendChild(el("h3", { text: "Regole del blocco" }));
    shared.appendChild(renderRegole(blocco.regoleBlocco));
    if (blocco.guida) {
      shared.appendChild(el("h3", { text: "Perché questo blocco" }));
      shared.appendChild(el("p", { text: blocco.guida }));
    }
    root.appendChild(shared);

    var links = el("nav", { className: "admin-session-nav" });
    ["ab", "ac", "cb"].forEach(function (k) {
      links.appendChild(el("a", {
        href: sessionHref(blocco.id, k),
        className: k === sessionKey ? "is-active" : "",
        text: k.toUpperCase()
      }));
    });
    root.appendChild(links);
  }

  window.fqSessioneDettaglio = {
    renderBlocco1Session: renderBlocco1Session,
    BLOCCO1_ID: "ipertrofia-accumulo"
  };
})();
