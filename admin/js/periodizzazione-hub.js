/**
 * Hub periodizzazione — anno / periodo / Fase 1–4 + link PDF
 */
(function () {
  "use strict";

  var HUB_URL = (window.fqUrl ? window.fqUrl("/admin/data/hub-periodizzazione.json") : "/admin/data/hub-periodizzazione.json");

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
      day: "numeric", month: "short", year: "numeric"
    });
  }

  function fillSelect(select, items, valueKey, labelKey) {
    select.innerHTML = "";
    items.forEach(function (item, i) {
      var opt = document.createElement("option");
      opt.value = item[valueKey];
      opt.textContent = item[labelKey];
      if (i === 0) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function renderFasi(macro, annoId, periodoId, root) {
    root.innerHTML = "";
    if (!macro || !macro.fasi || !macro.fasi.length) {
      root.appendChild(el("p", { text: "Nessuna fase in questo macrociclo." }));
      return;
    }

    macro.fasi.forEach(function (fase, i) {
      var card = el("article", { className: "perio-fase-card", id: "fase-" + fase.id });

      var head = el("div", { className: "perio-fase-card__head" });
      head.appendChild(el("span", { className: "perio-fase-card__num", text: "Fase " + (i + 1) }));
      head.appendChild(el("h3", { text: fase.nome }));
      head.appendChild(el("p", {
        className: "perio-fase-card__meta",
        text: formatDate(fase.inizio) + " – " + formatDate(fase.fine) + " · " + fase.settimane + " sett. · RIR " + fase.rir
      }));
      card.appendChild(head);

      card.appendChild(el("div", {
        className: "perio-fase-card__guida",
        html: "<p class=\"perio-fase-card__label\">Spiegazione</p><p>" + (fase.guida || fase.obiettivo) + "</p>"
      }));

      if (fase.schedaIntro) {
        card.appendChild(el("div", {
          className: "perio-fase-card__intro",
          html: "<p class=\"perio-fase-card__label\">Come usare la scheda</p><p>" + fase.schedaIntro + "</p>"
        }));
      }

      card.appendChild(el("p", {
        className: "perio-fase-card__obiettivo",
        html: "<strong>Obiettivo operativo:</strong> " + fase.obiettivo
      }));

      var days = el("ul", { className: "perio-fase-card__days" });
      ["ab", "ac", "cb"].forEach(function (key) {
        var s = fase.sessioni[key];
        if (!s) return;
        var li = el("li");
        var link = el("a", {
          href: (window.fqUrl ? window.fqUrl("/admin/sessione/") : "/admin/sessione/") + "?ciclo=" + encodeURIComponent(fase.id) + "&sessione=" + key + "&anno=" + encodeURIComponent(annoId),
          text: key.toUpperCase() + " — " + s.nome + " (" + s.esercizi.length + " es.)"
        });
        li.appendChild(link);
        days.appendChild(li);
      });
      card.appendChild(days);

      var actions = el("div", { className: "perio-fase-card__actions" });
      var pdfUrl =
        (window.fqUrl ? window.fqUrl("/admin/prototipi/periodizzazione/fase/") : "/admin/prototipi/periodizzazione/fase/") +
        "?anno=" + encodeURIComponent(annoId) +
        "&periodo=" + encodeURIComponent(periodoId) +
        "&fase=" + encodeURIComponent(fase.id);
      actions.appendChild(el("a", {
        className: "btn btn-primary",
        href: pdfUrl,
        target: "_blank",
        rel: "noopener",
        text: "PDF scheda · Fase " + (i + 1)
      }));
      actions.appendChild(el("a", {
        className: "btn btn-ghost",
        href: (window.fqUrl ? window.fqUrl("/admin/sessione/") : "/admin/sessione/") + "?ciclo=" + encodeURIComponent(fase.id) + "&sessione=ab",
        text: "Apri AB online"
      }));
      card.appendChild(actions);

      root.appendChild(card);
    });
  }

  function init() {
    var annoSel = document.getElementById("perio-anno");
    var periodoSel = document.getElementById("perio-periodo");
    var desc = document.getElementById("perio-periodo-desc");
    var grid = document.getElementById("perio-fasi-grid");
    if (!annoSel || !periodoSel || !grid) return;

    var hubCache = null;
    var macroCache = {};

    function currentAnno() {
      return hubCache.anni.find(function (a) { return a.id === annoSel.value; });
    }

    function currentPeriodo(anno) {
      return (anno.periodi || []).find(function (p) { return p.id === periodoSel.value; }) || anno.periodi[0];
    }

    function refreshPeriodi() {
      var anno = currentAnno();
      if (!anno) return;
      fillSelect(periodoSel, anno.periodi, "id", "label");
      var params = new URLSearchParams(window.location.search);
      if (params.get("periodo")) {
        var match = anno.periodi.find(function (p) { return p.id === params.get("periodo"); });
        if (match) periodoSel.value = match.id;
      }
      loadMacro();
    }

    function loadMacro() {
      var anno = currentAnno();
      var periodo = currentPeriodo(anno);
      if (desc) desc.textContent = periodo.descrizione || "";
      grid.innerHTML = "<p class=\"perio-loading\">Caricamento schede…</p>";

      var url = window.fqUrl ? window.fqUrl(anno.macrocicloUrl) : anno.macrocicloUrl;
      var done = function (macro) {
        renderFasi(macro, anno.id, periodo.id, grid);
      };

      if (macroCache[url]) {
        done(macroCache[url]);
        return;
      }
      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (macro) {
          macroCache[url] = macro;
          done(macro);
        })
        .catch(function (err) {
          grid.innerHTML = "<p class=\"admin-error\">Errore: " + err.message + "</p>";
        });
    }

    fetch(HUB_URL)
      .then(function (r) { return r.json(); })
      .then(function (hub) {
        hubCache = hub;
        fillSelect(annoSel, hub.anni, "id", "label");
        var params = new URLSearchParams(window.location.search);
        if (params.get("anno")) {
          var a = hub.anni.find(function (x) { return x.id === params.get("anno"); });
          if (a) annoSel.value = a.id;
        }
        annoSel.addEventListener("change", refreshPeriodi);
        periodoSel.addEventListener("change", loadMacro);
        refreshPeriodi();
      })
      .catch(function (err) {
        grid.innerHTML = "<p class=\"admin-error\">Errore hub: " + err.message + "</p>";
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
