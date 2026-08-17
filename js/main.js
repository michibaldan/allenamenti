(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Marchio «Foto AI» su tutte le immagini con data-ai (AI Act UE) */
  document.querySelectorAll('img[data-ai]').forEach(function (img) {
    if (img.closest(".ai-photo-wrap")) return;
    var wrap = document.createElement("span");
    wrap.className = "ai-photo-wrap";
    var mark = document.createElement("span");
    mark.className = "ai-photo-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "Foto AI";
    var parent = img.parentNode;
    parent.insertBefore(wrap, img);
    wrap.appendChild(img);
    wrap.appendChild(mark);
  });
})();
