(function () {
  "use strict";
  function injectFooter() {
    var footer = document.querySelector(".site-footer .wrap") || document.querySelector(".site-footer");
    if (!footer || footer.querySelector(".ai-site-notice")) return;
    var ai = document.createElement("p");
    ai.className = "ai-site-notice";
    ai.setAttribute("role", "note");
    ai.innerHTML =
      'Il ritratto in home è una <strong>foto originale</strong>. Le figure degli esercizi sono SVG tecnici. ' +
      'Dettagli: <a href="' + (window.fqUrl ? window.fqUrl("/trasparenza-ai/") : "/trasparenza-ai/") + '">Trasparenza AI (AI Act UE)</a>.';
    footer.appendChild(ai);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectFooter);
  else injectFooter();
})();
