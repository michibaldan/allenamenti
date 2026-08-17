(function () {
  "use strict";

  var KEY = "mb-consent-v1";
  var MAX_MS = 180 * 24 * 60 * 60 * 1000;
  var banner, modal;

  function u(path) {
    return window.fqUrl ? window.fqUrl(path) : path;
  }

  function load() {
    try {
      var rec = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!rec || !rec.ts) return null;
      var t = Date.parse(rec.ts);
      if (!t || Date.now() - t > MAX_MS) return null;
      return rec;
    } catch (e) {
      return null;
    }
  }

  function save(choice) {
    var rec = {
      ts: new Date().toISOString(),
      necessari: true,
      statistica: false,
      terzeParti: false,
      scelta: choice
    };
    localStorage.setItem(KEY, JSON.stringify(rec));
    hide();
  }

  function hide() {
    if (banner) banner.classList.remove("is-visible");
    if (modal) modal.classList.remove("is-visible");
  }

  function injectFooter() {
    var footer = document.querySelector(".site-footer .wrap") || document.querySelector(".site-footer");
    if (!footer) return;
    if (!footer.querySelector(".legal-links")) {
      var links = document.createElement("p");
      links.className = "legal-links";
      links.innerHTML =
        '<a href="' + u("/privacy/") + '">Privacy</a> · ' +
        '<a href="' + u("/cookie/") + '">Cookie</a> · ' +
        '<a href="' + u("/trasparenza-ai/") + '">Trasparenza AI</a> · ' +
        '<button type="button" class="linkish" id="mb-cookie-prefs">Preferenze cookie</button>';
      footer.appendChild(links);
    }
    if (!footer.querySelector(".ai-site-notice")) {
      var ai = document.createElement("p");
      ai.className = "ai-site-notice";
      ai.setAttribute("role", "note");
      ai.innerHTML =
        'Ritratto in home: <strong>foto originale</strong>. Figure schede: SVG tecnici. ' +
        '<a href="' + u("/trasparenza-ai/") + '">Trasparenza AI (AI Act UE)</a>.';
      footer.appendChild(ai);
    }
    var pref = document.getElementById("mb-cookie-prefs");
    if (pref) pref.addEventListener("click", openModal);
  }

  function buildBanner() {
    banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "cookie-banner-title");
    banner.innerHTML =
      '<div class="wrap cookie-banner__inner">' +
      '<p class="cookie-banner__text" id="cookie-banner-title">' +
      "Questo sito usa <strong>solo cookie tecnici</strong> e <code>localStorage</code> per ricordare la tua scelta. " +
      "Niente profilazione, niente ads, niente analytics. " +
      'Dettagli: <a href="' + u("/cookie/") + '">informativa cookie</a> e ' +
      '<a href="' + u("/privacy/") + '">privacy</a> (GDPR, ePrivacy, Garante).' +
      "</p>" +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn cookie-banner__btn cookie-banner__btn--choice" id="mb-c-reject">Solo necessari</button>' +
      '<button type="button" class="btn cookie-banner__btn cookie-banner__btn--choice" id="mb-c-accept">Accetto</button>' +
      '<button type="button" class="btn btn-ghost cookie-banner__btn cookie-banner__btn--alt" id="mb-c-more">Personalizza</button>' +
      "</div></div>";
    document.body.appendChild(banner);
    document.getElementById("mb-c-accept").addEventListener("click", function () { save("accetto"); });
    document.getElementById("mb-c-reject").addEventListener("click", function () { save("necessari"); });
    document.getElementById("mb-c-more").addEventListener("click", openModal);
  }

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "cookie-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML =
      '<div class="cookie-modal__backdrop" data-close="1"></div>' +
      '<div class="cookie-modal__panel panel-raised">' +
      "<h2>Preferenze cookie</h2>" +
      "<p class=\"cookie-modal__legal\">Provvedimento Garante 10 giugno 2021: rifiutare è facile quanto accettare. Qui non ci sono cookie di profilazione da accendere.</p>" +
      '<div class="cookie-pref"><div><strong>Necessari</strong><span class="cookie-pref__tag"> sempre attivi</span>' +
      "<p>Tecnici di hosting (GitHub Pages) e localStorage del consenso. Base: art. 6.1.f GDPR + ePrivacy cookie tecnici.</p></div>" +
      "<input type=\"checkbox\" checked disabled aria-label=\"Cookie necessari, sempre attivi\"></div>" +
      '<div class="cookie-pref"><div><strong>Statistica</strong><span class="cookie-pref__tag"> non usati</span>' +
      "<p>Nessun Google Analytics, Matomo o pixel. La casella resta spenta.</p></div>" +
      "<input type=\"checkbox\" disabled aria-label=\"Statistica non in uso\"></div>" +
      '<div class="cookie-pref"><div><strong>Terze parti / font</strong><span class="cookie-pref__tag"> non usati</span>' +
      "<p>Niente font da Google né social plugin. Il sito usa font di sistema.</p></div>" +
      "<input type=\"checkbox\" disabled aria-label=\"Terze parti non in uso\"></div>" +
      '<div class="cookie-modal__actions">' +
      '<button type="button" class="btn cookie-banner__btn cookie-banner__btn--choice" id="mb-m-save">Salva solo necessari</button>' +
      "</div></div>";
    document.body.appendChild(modal);
    modal.addEventListener("click", function (ev) {
      if (ev.target.getAttribute("data-close")) modal.classList.remove("is-visible");
    });
    document.getElementById("mb-m-save").addEventListener("click", function () { save("necessari"); });
  }

  function openModal() {
    if (modal) modal.classList.add("is-visible");
  }

  function start() {
    injectFooter();
    buildBanner();
    buildModal();
    if (!load()) banner.classList.add("is-visible");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
