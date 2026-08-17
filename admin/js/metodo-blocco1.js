/**
 * Guida operativa Blocco 1 — distribuzione, RIR, periodizzazione, volumi
 * Schermo: /admin/metodo-blocco1/ · PDF/stampa: /admin/metodo-blocco1/pdf/
 */
(function () {
  "use strict";

  var BLOCCO_URL = (window.fqUrl ? window.fqUrl("/admin/data/blocco-1-fase1.json") : "/admin/data/blocco-1-fase1.json");

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

  function table(headers, rows, className) {
    var wrap = el("div", { className: "table-wrap" });
    var t = el("table", { className: className || "scheda-table admin-metodo-table" });
    var thead = el("thead");
    var hr = el("tr");
    headers.forEach(function (h) { hr.appendChild(el("th", { text: h })); });
    thead.appendChild(hr);
    t.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (cell) {
        tr.appendChild(el("td", typeof cell === "object" ? cell : { text: String(cell) }));
      });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    wrap.appendChild(t);
    return wrap;
  }

  function section(title, children) {
    var sec = el("section", { className: "admin-section admin-metodo-section" });
    sec.appendChild(el("h2", { text: title }));
    (children || []).forEach(function (c) { if (c) sec.appendChild(c); });
    return sec;
  }

  function listItems(items, ordered) {
    var list = el(ordered ? "ol" : "ul", { className: "admin-metodo-list" });
    (items || []).forEach(function (x) { list.appendChild(el("li", { text: x })); });
    return list;
  }

  function renderHead(blocco) {
    var head = el("header", { className: "metodo-a4__head" });
    head.innerHTML =
      "<div class=\"metodo-a4__head-main\">" + blocco.tipo + " · " + blocco.codice + "</div>" +
      "<h1>Metodo Blocco 1 — guida operativa</h1>" +
      "<div class=\"metodo-a4__head-meta\">" +
      "<span><strong>Periodo:</strong> " + formatDate(blocco.inizio) + " – " + formatDate(blocco.fine) + "</span>" +
      "<span><strong>Atleta:</strong> _______________</span>" +
      "<span><strong>Frequenza:</strong> " + blocco.frequenza + "</span>" +
      "</div>";
    return head;
  }

  function renderContent(blocco, container) {
    var g = blocco.guidaOperativa;
    if (!g) {
      container.appendChild(el("p", { text: "Guida operativa non trovata." }));
      return;
    }

    var intro = el("aside", { className: "admin-callout card admin-metodo-intro" });
    intro.appendChild(el("p", { html: "<strong>" + g.sintesi + "</strong>" }));
    if (blocco.guida) intro.appendChild(el("p", { text: blocco.guida }));
    container.appendChild(intro);

    var dist = g.distribuzioneSettimanale;
    var distSec = section("1. Distribuzione settimanale — quando fare ogni scheda", [
      el("p", { className: "admin-metodo-lead", text: dist.schema }),
      table(
        ["Giorno", "Sessione", "Tipo", "Focus"],
        dist.consigliata.map(function (r) {
          return [r.giorno, r.sessione, r.tipo, r.focus];
        })
      )
    ]);
    if (dist.alternative && dist.alternative.length) {
      var alt = el("div", { className: "admin-metodo-alt" });
      alt.appendChild(el("h3", { text: "Alternative" }));
      alt.appendChild(listItems(dist.alternative));
      distSec.appendChild(alt);
    }
    if (dist.regoleRecupero) {
      var rec = el("div", { className: "admin-metodo-rules" });
      rec.appendChild(el("h3", { text: "Regole di recupero" }));
      rec.appendChild(listItems(dist.regoleRecupero));
      distSec.appendChild(rec);
    }
    container.appendChild(distSec);

    var rir = g.regoleRirECedimento;
    container.appendChild(section("2. RIR e cedimento — cosa significa davvero", [
      el("p", { className: "admin-metodo-lead", text: rir.principio }),
      el("h3", { text: "Fondamentali (esercizi con *)" }),
      listItems(rir.fondamentali),
      el("h3", { text: "Isolamento e accessori" }),
      listItems(rir.isolamento),
      table(
        ["Periodo", "Fondamentali *", "Isolamento"],
        (rir.tabellaCedimento || []).map(function (r) {
          return [r.periodo, r.fondamentali, r.isolamento];
        })
      )
    ]));

    container.appendChild(section("3. Periodizzazione — 13 settimane", [
      table(
        ["Settimane", "Intensità (RIR)", "Volume", "Nota"],
        g.periodizzazioneIntensita.map(function (p) {
          return [p.settimane, p.intensita, p.volume, p.nota];
        })
      )
    ]));

    container.appendChild(section("4. Volume settimanale finale", [
      table(
        ["Gruppo muscolare", "Serie", "Note"],
        g.volumeSettimanaleFinale.map(function (v) {
          return [v.gruppo, String(v.serie), v.note || "—"];
        })
      )
    ]));

    container.appendChild(section("5. Volume per seduta — mappa rapida", [
      el("p", { className: "admin-metodo-lead", text: "Ogni riga è una delle tre sessioni (AB · AC · CB)." }),
      table(
        ["Scheda", "Dettaglio volumi (serie efficaci)"],
        g.volumePerSeduta.map(function (v) {
          var parts = [];
          Object.keys(v).forEach(function (k) {
            if (k === "sessione") return;
            parts.push(k + " " + v[k]);
          });
          return [v.sessione, parts.join(" · ")];
        })
      )
    ]));

    var progSec = section("6. Progressione carico e checklist seduta", []);
    progSec.appendChild(listItems(g.progressioneCarico));
    progSec.appendChild(el("h3", { text: "Checklist seduta" }));
    progSec.appendChild(listItems(g.checklistSeduta, true));
    container.appendChild(progSec);

    container.appendChild(el("footer", {
      className: "metodo-a4__foot",
      text: blocco.codice + " · Metodo operativo · Schede AB–CB in /admin/ · * = fondamentale in progressione"
    }));
  }

  function render(blocco, root, opts) {
    opts = opts || {};
    var isPdf = opts.pdf || document.body.classList.contains("admin-metodo-pdf");

    root.innerHTML = "";
    document.title = (isPdf ? "PDF · " : "") + "Metodo Blocco 1 | Admin";

    var article = el("article", { className: "metodo-a4" });
    if (isPdf) article.appendChild(renderHead(blocco));
    renderContent(blocco, article);
    root.appendChild(article);

    if (!isPdf) {
      var nav = el("nav", { className: "admin-session-nav no-print" });
      nav.appendChild(el("a", {
        href: "/admin/metodo-blocco1/pdf/",
        className: "btn btn-primary btn-sm",
        text: "Apri versione PDF / stampa →"
      }));
      ["ab", "ac", "cb"].forEach(function (k) {
        nav.appendChild(el("a", {
          href: "/admin/sessione/?ciclo=" + encodeURIComponent(blocco.id) + "&sessione=" + k,
          text: k.toUpperCase()
        }));
      });
      root.appendChild(nav);
    }
  }

  window.fqMetodoBlocco1 = { render: render };

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("metodo-root");
    if (!root) return;
    var isPdf = document.body.classList.contains("admin-metodo-pdf");
    fetch(BLOCCO_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        render(data, root, { pdf: isPdf });
        if (isPdf && new URLSearchParams(location.search).get("print") === "1") {
          setTimeout(function () { window.print(); }, 400);
        }
      })
      .catch(function () {
        root.innerHTML = "<p>Errore caricamento guida.</p>";
      });
  });
})();
