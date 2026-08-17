/**
 * PDF scheda sessione — layout stampabile con sidebar log
 */
(function () {
  "use strict";

  function u(path) {
    return (window.fqUrl ? window.fqUrl(path) : path);
  }

  var MACRO_URL = u("/admin/data/macrociclo-2026-2027.json");
  var BLOCCO1_URL = u("/admin/data/blocco-1-fase1.json");
  var CATALOGO_URL = u("/admin/data/esercizi-catalogo.json");
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
      day: "numeric", month: "short", year: "numeric"
    });
  }

  function findFase(data, id) {
    return data.fasi.find(function (f) { return f.id === id; });
  }

  function figureSvg(figId, label) {
    var wrap = el("div", { className: "ex-pdf-row__fig" });
    wrap.appendChild(window.fqSprite.figure(figId, label));
    return wrap;
  }

  function buildExerciseLog(ex) {
    var log = el("div", { className: "ex-pdf-log" });
    log.appendChild(el("p", { className: "ex-pdf-log__label", text: "Log" }));
    var sets = el("div", { className: "ex-pdf-log__sets" });
    var n = Math.min(ex.serie || 4, 6);
    for (var s = 1; s <= n; s++) {
      var row = el("div", { className: "ex-pdf-log__set" });
      row.innerHTML =
        "<span>S" + s + "</span>" +
        "<span class=\"ex-pdf-log__kg\">kg: _______</span>" +
        "<span class=\"ex-pdf-log__set-line\"></span>" +
        "<span>rep</span>";
      sets.appendChild(row);
    }
    log.appendChild(sets);
    var note = el("div", { className: "ex-pdf-log__note" });
    note.innerHTML = "Note<div class=\"ex-pdf-log__note-line\"></div>";
    log.appendChild(note);
    return log;
  }

  function adaptBloccoToFase(blocco) {
    var sessioni = {};
    ["ab", "ac", "cb"].forEach(function (key) {
      var s = blocco.sessioni[key];
      if (!s) return;
      sessioni[key] = {
        nome: s.codice + " · " + s.nome,
        esercizi: s.esercizi.map(function (ex) {
          return {
            nome: ex.nome,
            gruppo: ex.gruppo,
            serie: ex.serie,
            ripetizioni: ex.ripetizioni,
            recupero: ex.recupero,
            rir: ex.rir,
            progressione: ex.progressionePrincipale || false,
            note: ex.note,
            figura: ex.figura
          };
        })
      };
    });
    return {
      nome: blocco.nome,
      inizio: blocco.inizio,
      fine: blocco.fine,
      settimane: blocco.settimane,
      rir: blocco.rir || "sett. 6–8: RIR 1",
      obiettivo: blocco.schedaIntro,
      perche: blocco.perche,
      intensitaRecupero: blocco.intensitaRecupero,
      sessioni: sessioni
    };
  }

  function renderPdf(macro, catalogo, faseId, sessionKey, root, blocco) {
    var fase = blocco ? adaptBloccoToFase(blocco) : findFase(macro, faseId);
    if (!fase || !fase.sessioni[sessionKey]) {
      root.innerHTML = "<p>Sessione non trovata.</p>";
      return;
    }
    var s = fase.sessioni[sessionKey];
    root.innerHTML = "";

    document.title = "PDF · " + sessionKey.toUpperCase() + " · " + fase.nome + " | Admin";

    var article = el("article", { className: "scheda-sessione-pdf" });

    var head = el("header", { className: "scheda-sessione-pdf__head" });
    head.innerHTML =
      "<p class=\"scheda-sessione-pdf__brand\">Scheda allenamento</p>" +
      "<h1>" + sessionKey.toUpperCase() + " — " + s.nome + "</h1>" +
      "<div class=\"scheda-sessione-pdf__meta\">" +
      "<span><span class=\"scheda-sessione-pdf__badge\">" + fase.nome + "</span></span>" +
      "<span><strong>Periodo:</strong> " + formatDate(fase.inizio) + " – " + formatDate(fase.fine) + "</span>" +
      "<span><strong>Settimane:</strong> " + fase.settimane + "</span>" +
      "<span><strong>RIR:</strong> " + fase.rir + "</span>" +
      "<span><strong>Atleta:</strong> _______________</span>" +
      "</div>" +
      "<p class=\"scheda-sessione-pdf__obiettivo\">" + (fase.perche || fase.obiettivo || "") + "</p>";
    if (fase.intensitaRecupero) {
      var ir = fase.intensitaRecupero;
      head.innerHTML +=
        "<p class=\"scheda-sessione-pdf__obiettivo\"><strong>Intensità.</strong> " + (ir.intensita || "") + "</p>" +
        "<p class=\"scheda-sessione-pdf__obiettivo\"><strong>Recupero.</strong> " + (ir.recupero || "") +
        " · " + (ir.durataSeduta || "60 min / tetto 75") + "</p>";
    }
    if (s.notaSeduta) {
      head.innerHTML += "<p class=\"scheda-sessione-pdf__obiettivo\">" + s.notaSeduta + "</p>";
    }
    article.appendChild(head);

    var oss = el("div", { className: "scheda-sessione-pdf__osservazioni" });
    oss.innerHTML =
      "<div class=\"scheda-sessione-pdf__osservazioni-label\">Osservazioni / note sessione</div>" +
      "<div class=\"scheda-sessione-pdf__osservazioni-line\"></div>" +
      "<div class=\"scheda-sessione-pdf__osservazioni-line\"></div>";
    article.appendChild(oss);

    var main = el("div", { className: "scheda-sessione-pdf__main" });
    var sessionBar = el("div", { className: "scheda-sessione-pdf__session-bar" });
    sessionBar.innerHTML =
      "<span><strong>Data:</strong> ___/___/___</span>" +
      "<span><strong>Durata:</strong> _______</span>" +
      "<span><strong>RPE medio:</strong> ___</span>";
    main.appendChild(sessionBar);

    s.esercizi.forEach(function (ex) {
      var cat = (window.fqSprite && window.fqSprite.catalog)
        ? window.fqSprite.catalog(catalogo, ex.nome)
        : (catalogo[ex.nome] || {});
      var row = el("div", { className: "ex-pdf-row" + (ex.progressione ? " ex-pdf-row--prog" : "") });

      row.appendChild(figureSvg(ex.figura || cat.figura, ex.nome));

      var body = el("div");
      var nameLine = el("p", { className: "ex-pdf-row__name" });
      nameLine.textContent = ex.nome;
      if (ex.progressione) {
        var badge = el("span", { className: "ex-pdf-row__prog", text: " · Progressione" });
        nameLine.appendChild(badge);
      }
      body.appendChild(nameLine);

      body.appendChild(el("p", {
        className: "ex-pdf-row__muscles",
        html: "<strong>Primario:</strong> " + (cat.primario || ex.gruppo) +
          (cat.secondario ? " · <strong>Secondario:</strong> " + cat.secondario : "")
      }));

      body.appendChild(el("div", {
        className: "ex-pdf-row__params",
        html: "<span><strong>" + ex.serie + "×" + ex.ripetizioni + "</strong></span>" +
          "<span class=\"target-kg\">kg: _______</span>" +
          "<span>Rec " + ex.recupero + "</span>" +
          "<span>RIR " + ex.rir + "</span>" +
          (ex.tecnica ? "<span>" + ex.tecnica + "</span>" : "")
      }));

      var tech = el("ul", { className: "ex-pdf-row__tech" });
      if (cat.setup) tech.appendChild(el("li", { html: "<strong>Setup:</strong> " + cat.setup }));
      if (cat.movimento) tech.appendChild(el("li", { html: "<strong>Movimento:</strong> " + cat.movimento }));
      if (cat.errori) tech.appendChild(el("li", { html: "<strong>Evita:</strong> " + cat.errori }));
      if (ex.note) tech.appendChild(el("li", { html: "<strong>Nota scheda:</strong> " + ex.note }));
      body.appendChild(tech);

      row.appendChild(body);
      row.appendChild(buildExerciseLog(ex));
      main.appendChild(row);
    });
    article.appendChild(main);

    article.appendChild(el("footer", {
      className: "scheda-sessione-pdf__foot",
      text: fase.nome + " · " + sessionKey.toUpperCase() + " · pesi da definire dopo test massimali"
    }));

    root.appendChild(article);
  }

  function init() {
    var root = document.getElementById("pdf-root");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var faseId = params.get("ciclo");
    var sessionKey = (params.get("sessione") || "ab").toLowerCase();

    var printBtn = document.getElementById("pdf-print-btn");
    if (printBtn) {
      printBtn.addEventListener("click", function () { window.print(); });
    }

    var spriteReady = (window.fqSprite && window.fqSprite.inject)
      ? window.fqSprite.inject()
      : Promise.resolve();

    if (!faseId) {
      root.innerHTML = "<p>Parametro ciclo mancante. <a href=\"" + u("/admin/") + "\">Dashboard</a></p>";
      return;
    }

    if (faseId === BLOCCO1_ID) {
      Promise.all([
        spriteReady,
        fetch(BLOCCO1_URL).then(function (r) { return r.json(); }),
        fetch(CATALOGO_URL).then(function (r) { return r.json(); })
      ])
        .then(function (res) { renderPdf(null, res[2], faseId, sessionKey, root, res[1]); })
        .catch(function (err) { root.innerHTML = "<p>Errore: " + err.message + "</p>"; });
      return;
    }

    Promise.all([
      spriteReady,
      fetch(MACRO_URL).then(function (r) { return r.json(); }),
      fetch(CATALOGO_URL).then(function (r) { return r.json(); })
    ])
      .then(function (res) { renderPdf(res[1], res[2], faseId, sessionKey, root, null); })
      .catch(function (err) { root.innerHTML = "<p>Errore: " + err.message + "</p>"; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
