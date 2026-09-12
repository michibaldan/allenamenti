/**
 * Mappa fase macrociclo → JSON dettaglio
 */
(function () {
  "use strict";

  var MAP = {
    "ipertrofia-accumulo": "/admin/data/blocco-1-fase1.json",
    "tensione-forza": "/admin/data/blocco-2-fase2.json",
    "ipertrofia-classica-ii": "/admin/data/blocco-3-fase3.json",
    "ricondizionamento": "/admin/data/blocco-4-fase4.json"
  };

  function u(path) {
    return window.fqUrl ? window.fqUrl(path) : path;
  }

  window.fqBlocchi = {
    map: MAP,
    urlFor: function (faseId) {
      return MAP[faseId] ? u(MAP[faseId]) : null;
    },
    hasDetail: function (faseId) {
      return !!MAP[faseId];
    }
  };
})();
