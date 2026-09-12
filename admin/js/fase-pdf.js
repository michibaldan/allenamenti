/**
 * PDF una fase (AB–CB) da macrociclo — anonimo, kg blank
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

  function render(macro, fase, root, blocco, periodo) {
    root.innerHTML = "";
    document.title = "PDF · " + fase.nome + (periodo ? " · " + periodo.label : "") + " | Scheda";

    var article = el("article", { className: "scheda-a4 scheda-a4--admin" });
    var tipo = blocco ? blocco.tipo : "Periodizzazione";

    var head = el("header", { className: "scheda-a4__head" });
    head.innerHTML =
      "<div class=\"scheda-a4__head-main\"><strong>Scheda allenamento</strong> · " + tipo + "</div>" +
      "<div class=\"scheda-a4__head-period\"><span class=\"scheda-a4__badge\">" +
      (periodo ? periodo.settimane + " sett." : fase.settimane + " sett.") +
      "</span> <strong>" + fase.nome + (periodo ? " · " + periodo.label : "") + "</strong></div>" +
      "<div class=\"scheda-a4__head-meta\">" +
      "<span><strong>Atleta:</strong> _______________</span>" +
      "<span><strong>Periodo:</strong> " + formatDate(fase.inizio) + " – " + formatDate(fase.fine) + "</span>" +
      "<span><strong>RIR:</strong> " + (periodo ? periodo.rir : (fase.rir || "")) + "</span>" +
      (periodo ? "<span><strong>Rep *:</strong> " + periodo.repFondamentali + "</span>" : "") +
      "</div>";
    article.appendChild(head);

    var intro = el("div", { className: "scheda-a4__osservazioni scheda-a4__intro-fase" });
    var introHtml = "<div class=\"scheda-a4__osservazioni-label\">Spiegazione fase (leggi prima di allenarti)</div>" +
      "<p class=\"scheda-a4__intro-text\">" + (fase.guida || fase.obiettivo) + "</p>";
    if (blocco && blocco.periodizzazione) {
      introHtml += "<p class=\"scheda-a4__intro-text\"><strong>Periodizzazione:</strong> ";
      introHtml += blocco.periodizzazione.map(function (p) {
        return p.fase + " (sett. " + p.settimane + ")";
      }).join(" → ");
      introHtml += "</p>";
    }
    if (fase.schedaIntro) introHtml += "<p class=\"scheda-a4__intro-text\">" + fase.schedaIntro + "</p>";
    if (fase.perche) {
      introHtml += "<p class=\"scheda-a4__intro-text\"><strong>A cosa serve.</strong> " + fase.perche + "</p>";
    }
    if (fase.intensitaRecupero) {
      var ir = fase.intensitaRecupero;
      introHtml += "<p class=\"scheda-a4__intro-text\"><strong>Intensità.</strong> " + (ir.intensita || "") + "</p>";
      introHtml += "<p class=\"scheda-a4__intro-text\"><strong>Recupero.</strong> " + (ir.recupero || "") +
        " · " + (ir.durataSeduta || "75 min / tetto 90") + "</p>";
    }
    intro.innerHTML = introHtml;

    var topBlock = el("div", { className: "scheda-a4__top" });
    topBlock.appendChild(intro);

    if (blocco && blocco.guidaOperativa) {
      var g = blocco.guidaOperativa;
      var metodo = el("div", { className: "scheda-a4__osservazioni scheda-a4__metodo" });
      var mh = "<div class=\"scheda-a4__osservazioni-label\">Metodo — distribuzione e RIR</div>";
      mh += "<p class=\"scheda-a4__intro-text\"><strong>" + g.sintesi + "</strong></p>";
      if (g.distribuzioneSettimanale && g.distribuzioneSettimanale.consigliata) {
        mh += "<p class=\"scheda-a4__intro-text\"><strong>Settimana tipo:</strong> ";
        mh += g.distribuzioneSettimanale.consigliata
          .filter(function (r) { return r.sessione !== "Riposo"; })
          .map(function (r) { return r.giorno.slice(0, 3) + " " + r.sessione; })
          .join(" · ");
        mh += "</p>";
      }
      if (g.periodizzazioneIntensita) {
        mh += "<table class=\"scheda-a4__mini-table\"><thead><tr><th>Sett.</th><th>RIR</th><th>Vol.</th></tr></thead><tbody>";
        g.periodizzazioneIntensita.forEach(function (p) {
          mh += "<tr><td>" + p.settimane + "</td><td>" + p.intensita + "</td><td>" + p.volume + "</td></tr>";
        });
        mh += "</tbody></table>";
      }
      if (g.regoleRirECedimento && g.regoleRirECedimento.principio) {
        mh += "<p class=\"scheda-a4__intro-text\"><em>" + g.regoleRirECedimento.principio + "</em></p>";
      }
      metodo.innerHTML = mh;
      topBlock.appendChild(metodo);
    }
    article.appendChild(topBlock);

    var grid = el("div", { className: "scheda-a4__grid" });
    var sessioni = periodo && periodo.sessioni ? periodo.sessioni : (blocco && blocco.sessioni ? blocco.sessioni : fase.sessioni);
    ["ab", "ac", "cb"].forEach(function (key) {
      var day = sessioni[key];
      if (!day) return;
      var quad = el("section", { className: "scheda-a4__quad" });
      quad.appendChild(el("h2", { text: key.toUpperCase() + " · " + day.nome }));
      var table = el("table");
      table.innerHTML = "<thead><tr><th>Esercizio</th><th>S×R</th><th>RIR</th><th>Rec</th><th>kg</th><th>Reps</th><th>Note</th></tr></thead>";
      var tbody = el("tbody");
      day.esercizi.forEach(function (ex) {
        var tr = el("tr");
        var nome = ex.nome + (ex.progressione || ex.progressionePrincipale ? " *" : "");
        tr.innerHTML =
          "<td>" + nome + "</td>" +
          "<td>" + ex.serie + "×" + ex.ripetizioni + "</td>" +
          "<td>" + (ex.rir || "") + "</td>" +
          "<td>" + (ex.recupero || "") + "</td>" +
          "<td></td><td></td>" +
          "<td>" + (ex.tecnica || ex.note || "") + "</td>";
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      quad.appendChild(table);
      grid.appendChild(quad);
    });
    article.appendChild(grid);

    article.appendChild(el("footer", {
      className: "scheda-a4__foot",
      text: fase.nome + " · * = progressione · kg da compilare dopo massimali · uso palestra"
    }));

    root.appendChild(article);
  }

  function init() {
    var root = document.getElementById("fase-pdf-root");
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var annoId = params.get("anno") || "2026-2027";
    var faseId = params.get("fase");
    var periodoId = params.get("periodo");
    if (!faseId) {
      root.innerHTML = "<p>Parametro <code>fase</code> mancante. <a href=\"/admin/prototipi/periodizzazione/\">Torna all’hub</a></p>";
      return;
    }

    fetch(HUB_URL)
      .then(function (r) { return r.json(); })
      .then(function (hub) {
        var anno = hub.anni.find(function (a) { return a.id === annoId; }) || hub.anni[0];
        return fetch(window.fqUrl ? window.fqUrl(anno.macrocicloUrl) : anno.macrocicloUrl).then(function (r) { return r.json(); });
      })
      .then(function (macro) {
        var fase = macro.fasi.find(function (f) { return f.id === faseId; });
        if (!fase) {
          root.innerHTML = "<p>Fase non trovata. <a href=\"/admin/prototipi/periodizzazione/\">Hub</a></p>";
          return;
        }
        var bloccoUrl = window.fqBlocchi && window.fqBlocchi.urlFor(faseId);
        if (!bloccoUrl) {
          render(macro, fase, root, null, null);
          return;
        }
        return fetch(bloccoUrl).then(function (r) { return r.json(); }).then(function (blocco) {
          var periodo = null;
          if (window.fqPeriodi && window.fqPeriodi.hasPeriodi(blocco)) {
            periodo = window.fqPeriodi.get(blocco, periodoId) ||
              window.fqPeriodi.get(blocco, window.fqPeriodi.defaultId(blocco));
          }
          render(macro, fase, root, blocco, periodo);
        });
      })
      .catch(function (err) {
        root.innerHTML = "<p>Errore: " + err.message + "</p>";
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
