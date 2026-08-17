(function () {
  "use strict";

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("HTTP " + res.status + " su " + path);
    }
    return res.json();
  }

  function showStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", Boolean(isError));
    el.hidden = !message;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T12:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  window.Hub = {
    loadJSON: loadJSON,
    showStatus: showStatus,
    escapeHtml: escapeHtml,
    formatDate: formatDate
  };
})();
