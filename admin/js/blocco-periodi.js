/**
 * Periodi rep fasi 2–4 (4 periodi × AB/AC/CB + PDF riassunto = 16 schede)
 */
(function () {
  "use strict";

  function list(blocco) {
    return blocco && blocco.periodi ? blocco.periodi : [];
  }

  function hasPeriodi(blocco) {
    return list(blocco).length > 0;
  }

  function get(blocco, periodoId) {
    if (!periodoId || !blocco || !blocco.periodi) return null;
    for (var i = 0; i < blocco.periodi.length; i++) {
      if (blocco.periodi[i].id === periodoId) return blocco.periodi[i];
    }
    return null;
  }

  function defaultId(blocco) {
    var items = list(blocco);
    return items.length ? items[0].id : null;
  }

  function resolveSessioni(blocco, periodoId) {
    var p = get(blocco, periodoId);
    if (p && p.sessioni) return p.sessioni;
    return blocco.sessioni;
  }

  function queryExtra(periodoId, anno) {
    var q = "";
    if (periodoId) q += "&periodo=" + encodeURIComponent(periodoId);
    if (anno) q += "&anno=" + encodeURIComponent(anno);
    return q;
  }

  function u(path) {
    return window.fqUrl ? window.fqUrl(path) : path;
  }

  function sessionUrl(faseId, sessionKey, periodoId, anno) {
    return u("/admin/sessione/?ciclo=" + encodeURIComponent(faseId) +
      "&sessione=" + sessionKey + queryExtra(periodoId, anno));
  }

  function sessionPdfUrl(faseId, sessionKey, periodoId, anno) {
    return u("/admin/sessione/pdf/?ciclo=" + encodeURIComponent(faseId) +
      "&sessione=" + sessionKey + queryExtra(periodoId, anno));
  }

  function fasePdfUrl(faseId, periodoId, anno) {
    var q = "fase=" + encodeURIComponent(faseId);
    if (anno) q += "&anno=" + encodeURIComponent(anno);
    if (periodoId) q += "&periodo=" + encodeURIComponent(periodoId);
    return u("/admin/prototipi/periodizzazione/fase/?" + q);
  }

  window.fqPeriodi = {
    list: list,
    hasPeriodi: hasPeriodi,
    get: get,
    defaultId: defaultId,
    resolveSessioni: resolveSessioni,
    sessionUrl: sessionUrl,
    sessionPdfUrl: sessionPdfUrl,
    fasePdfUrl: fasePdfUrl
  };
})();
