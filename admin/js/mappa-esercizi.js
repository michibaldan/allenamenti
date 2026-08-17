/**
 * Mappa esercizi Blocco 1 — griglia figure SVG + scheda tecnica
 */
(function () {
  "use strict";

  var BLOCCO_URL = (window.fqUrl ? window.fqUrl("/admin/data/blocco-1-fase1.json") : "/admin/data/blocco-1-fase1.json");
  var CATALOGO_URL = (window.fqUrl ? window.fqUrl("/admin/data/esercizi-catalogo.json") : "/admin/data/esercizi-catalogo.json");

  function okJson(r) {
    if (!r.ok) throw new Error("Dati non disponibili (" + r.status + ")");
    return r.json();
  }

  function uniqueExercises(blocco) {
    var seen = {};
    var list = [];
    ["ab", "ac", "cb"].forEach(function (key) {
      (blocco.sessioni[key] && blocco.sessioni[key].esercizi || []).forEach(function (ex) {
        if (!seen[ex.nome]) {
          seen[ex.nome] = true;
          list.push({ nome: ex.nome, figura: ex.figura, sessione: key.toUpperCase() });
        }
      });
    });
    return list.sort(function (a, b) { return a.nome.localeCompare(b.nome, "it"); });
  }

  function render(blocco, catalogo, root) {
    root.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "admin-mappa-grid";

    uniqueExercises(blocco).forEach(function (item) {
      var cat = (window.fqSprite && window.fqSprite.catalog)
        ? window.fqSprite.catalog(catalogo, item.nome)
        : (catalogo[item.nome] || {});
      var card = document.createElement("article");
      card.className = "admin-mappa-card card";

      var badge = document.createElement("span");
      badge.className = "admin-mappa-card__session";
      badge.textContent = item.sessione;
      card.appendChild(badge);

      var fig = document.createElement("div");
      fig.className = "admin-mappa-card__fig";
      fig.appendChild(window.fqSprite.figure(item.figura || cat.figura, item.nome));
      card.appendChild(fig);

      var h = document.createElement("h2");
      h.textContent = item.nome;
      card.appendChild(h);

      if (cat.primario) {
        var p = document.createElement("p");
        p.className = "admin-mappa-card__meta";
        p.innerHTML = "<strong>Primario:</strong> " + cat.primario + (cat.secondario ? " · <strong>Secondario:</strong> " + cat.secondario : "");
        card.appendChild(p);
      }
      if (cat.movimento) {
        var m = document.createElement("p");
        m.className = "admin-mappa-card__mov";
        m.textContent = cat.movimento;
        card.appendChild(m);
      }

      grid.appendChild(card);
    });

    root.appendChild(grid);
    var back = document.createElement("p");
    back.className = "admin-back";
    back.innerHTML = "<a href=\"/admin/sessione/?ciclo=ipertrofia-accumulo&sessione=ab\">← AB Blocco 1</a> · <a href=\"/admin/\">Ciclo</a>";
    root.appendChild(back);
  }

  function init() {
    var root = document.getElementById("mappa-root");
    if (!root) return;
    window.fqSprite.inject().then(function () {
      return Promise.all([
        fetch(BLOCCO_URL).then(okJson),
        fetch(CATALOGO_URL).then(okJson)
      ]);
    }).then(function (res) {
      render(res[0], res[1], root);
    }).catch(function (err) {
      root.innerHTML = "<p>Errore: " + err.message + "</p>";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
