/**
 * Pagina sessione dedicata — Blocco 1 dettagliato o vista tabellare
 */
(function () {
  "use strict";

  var MACRO_URL = (window.fqUrl ? window.fqUrl("/admin/data/macrociclo-2026-2027.json") : "/admin/data/macrociclo-2026-2027.json");
  var BLOCCO1_URL = (window.fqUrl ? window.fqUrl("/admin/data/blocco-1-fase1.json") : "/admin/data/blocco-1-fase1.json");
  var CATALOGO_URL = (window.fqUrl ? window.fqUrl("/admin/data/esercizi-catalogo.json") : "/admin/data/esercizi-catalogo.json");
  var BLOCCO1_ID = "ipertrofia-accumulo";

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

  function findFase(data, id) {
    return data.fasi.find(function (f) { return f.id === id; });
  }

  function querySuffix() {
    var anno = new URLSearchParams(window.location.search).get("anno");
    return anno ? "&anno=" + encodeURIComponent(anno) : "";
  }

  function sessionHref(faseId, sessionKey) {
    return "/admin/sessione/?ciclo=" + encodeURIComponent(faseId) +
      "&sessione=" + sessionKey + querySuffix();
  }

  function renderSessionBasic(data, faseId, sessionKey, root) {
    var fase = findFase(data, faseId);
    if (!fase || !fase.sessioni[sessionKey]) {
      root.innerHTML = "<p>Sessione non trovata.</p>";
      return;
    }
    var s = fase.sessioni[sessionKey];
    root.innerHTML = "";
    document.title = sessionKey.toUpperCase() + " · " + fase.nome + " | Admin";

    var nav = el("nav", { className: "admin-breadcrumb" });
    nav.innerHTML = "<a href=\"/admin/\">Dashboard</a> · <strong>" + sessionKey.toUpperCase() + "</strong>";
    root.appendChild(nav);

    var head = el("header", { className: "admin-session-head" });
    var ir = fase.intensitaRecupero || {};
    var lead = (fase.perche ? fase.perche + " " : "") + (s.notaSeduta || fase.obiettivo || "");
    head.innerHTML = "<p class=\"tagline\">" + formatDate(fase.inizio) + " – " + formatDate(fase.fine) +
      " · obiettivo 60 min · tetto 75</p><h1>" + sessionKey.toUpperCase() + " — " + s.nome + "</h1><p class=\"lead\">" + lead + "</p>";
    root.appendChild(head);
    if (ir.intensita || ir.recupero) {
      var irBox = el("aside", { className: "admin-fase__ir" });
      if (ir.intensita) irBox.appendChild(el("p", { html: "<strong>Intensità.</strong> " + ir.intensita }));
      if (ir.recupero) irBox.appendChild(el("p", { html: "<strong>Recupero.</strong> " + ir.recupero }));
      root.appendChild(irBox);
    }

    var actions = el("div", { className: "admin-session-actions no-print" });
    actions.innerHTML =
      "<a class=\"btn btn-primary\" href=\"/admin/sessione/pdf/?ciclo=" + encodeURIComponent(faseId) +
      "&sessione=" + sessionKey + querySuffix() + "\" target=\"_blank\">PDF scheda</a>";
    root.appendChild(actions);

    var tableWrap = el("div", { className: "table-wrap" });
    var table = el("table", { className: "scheda-table admin-session-table" });
    table.innerHTML = "<thead><tr><th>#</th><th>Esercizio</th><th>Gruppo</th><th>S×R</th><th>Peso</th><th>Rec</th><th>RIR</th><th>Note</th></tr></thead>";
    var tbody = el("tbody");
    s.esercizi.forEach(function (ex, i) {
      var tr = el("tr");
      if (ex.progressione) tr.className = "admin-row--prog";
      tr.innerHTML = "<td>" + (i + 1) + "</td><td><strong>" + ex.nome + "</strong></td><td>" + ex.gruppo + "</td><td>" + ex.serie + "×" + ex.ripetizioni + "</td><td>da definire</td><td>" + (ex.recupero || "—") + "</td><td>" + (ex.rir || "—") + "</td><td>" + (ex.note || "—") + "</td>";
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    root.appendChild(tableWrap);

    var links = el("nav", { className: "admin-session-nav" });
    ["ab", "ac", "cb"].forEach(function (k) {
      if (!fase.sessioni[k]) return;
      links.appendChild(el("a", {
        href: sessionHref(faseId, k),
        className: k === sessionKey ? "is-active" : "",
        text: k.toUpperCase()
      }));
    });
    root.appendChild(links);
  }

  function init() {
    var root = document.getElementById("sessione-root");
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var faseId = params.get("ciclo");
    var sessionKey = (params.get("sessione") || "ab").toLowerCase();
    if (!faseId) {
      root.innerHTML = "<p>Parametro <code>ciclo</code> mancante. <a href=\"/admin/\">Dashboard</a>.</p>";
      return;
    }

    if (faseId === BLOCCO1_ID && window.fqSessioneDettaglio) {
      Promise.all([
        fetch(BLOCCO1_URL).then(function (r) { return r.json(); }),
        fetch(CATALOGO_URL).then(function (r) { return r.json(); })
      ])
        .then(function (res) {
          window.fqSessioneDettaglio.renderBlocco1Session(res[0], sessionKey, res[1], root);
        })
        .catch(function (err) { root.innerHTML = "<p>Errore: " + err.message + "</p>"; });
      return;
    }

    fetch(MACRO_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) { renderSessionBasic(data, faseId, sessionKey, root); })
      .catch(function (err) { root.innerHTML = "<p>Errore: " + err.message + "</p>"; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
