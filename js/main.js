(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    }
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") setOpen(false);
    });
  }

  document.querySelectorAll("img[data-ai]").forEach(function (img) {
    if (img.closest(".ai-photo-wrap")) return;
    var wrap = document.createElement("span");
    wrap.className = "ai-photo-wrap";
    var mark = document.createElement("span");
    mark.className = "ai-photo-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "Foto AI";
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    wrap.appendChild(mark);
  });
})();
