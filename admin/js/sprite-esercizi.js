/**
 * Sprite figure esercizi — iniezione condivisa
 * Le figure sono <symbol> in /admin/img/esercizi-sprite.svg, richiamate con <use href="#fig-...">.
 * I riferimenti funzionano solo se lo sprite è nel DOM del documento corrente.
 */
(function () {
  "use strict";

  var SPRITE_URL = (window.fqUrl ? window.fqUrl("/admin/img/esercizi-sprite.svg") : "/admin/img/esercizi-sprite.svg");
  var MOUNT_ID = "fq-ex-sprite";
  var pending = null;

  function inject() {
    if (document.getElementById(MOUNT_ID)) return Promise.resolve();
    if (pending) return pending;
    pending = fetch(SPRITE_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("Sprite non disponibile (" + r.status + ")");
        return r.text();
      })
      .then(function (svg) {
        if (document.getElementById(MOUNT_ID)) return;
        var wrap = document.createElement("div");
        wrap.id = MOUNT_ID;
        wrap.setAttribute("aria-hidden", "true");
        wrap.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
        wrap.innerHTML = svg;
        document.body.insertBefore(wrap, document.body.firstChild);
      })
      .catch(function () { /* le figure restano vuote, il resto della pagina funziona */ });
    return pending;
  }

  /**
   * Crea un <svg><use href="#figId"> accessibile.
   * @param {string} figId id del symbol (senza #)
   * @param {string} label nome esercizio per screen reader; se assente la figura è decorativa
   */
  function figure(figId, label) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    if (label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Illustrazione esercizio: " + label);
    } else {
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
    }
    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#" + (figId || "fig-press-incl"));
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + (figId || "fig-press-incl"));
    svg.appendChild(use);
    return svg;
  }

  /**
   * Lookup catalogo per nome scheda (alias inclusi).
   */
  function catalog(catalogo, nome) {
    if (!catalogo || !nome) return {};
    if (catalogo[nome]) return catalogo[nome];
    var n = String(nome).toLowerCase().replace(/\s+/g, " ").trim();
    var keys = Object.keys(catalogo);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === n) return catalogo[keys[i]];
    }
    return {};
  }

  window.fqSprite = { inject: inject, figure: figure, catalog: catalog, URL: SPRITE_URL };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
