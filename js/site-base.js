/**
 * Prefisso sito: '' in locale o su dominio root,
 * '/allenamenti' su GitHub Pages (michibaldan.github.io/allenamenti/).
 */
(function () {
  "use strict";
  var p = window.location.pathname || "";
  var host = window.location.hostname || "";
  var base = "";
  var i = p.indexOf("/admin/");
  if (i > 0) {
    base = p.slice(0, i);
  } else if (/\.github\.io$/i.test(host)) {
    var seg = p.split("/").filter(Boolean)[0];
    if (seg) base = "/" + seg;
  }
  window.FQ_BASE = base;
  window.fqUrl = function (path) {
    if (!path) return base || "/";
    if (path.charAt(0) !== "/") path = "/" + path;
    return base + path;
  };
})();
