// Agenda de Cal.com: los botones "Book a call" abren el calendario en una ventana sobre la página
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "30min", { origin: "https://app.cal.com" });
Cal.config = Cal.config || {};
Cal.config.forwardQueryParams = true;
Cal.ns["30min"]("ui", {
  hideEventTypeDetails: false,
  layout: "month_view",
  cssVarsPerTheme: { light: { "cal-brand": "#1f9e7a" }, dark: { "cal-brand": "#3ccf9f" } }
});

function calConfig() {
  var root = document.documentElement;
  var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  return { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: dark ? "dark" : "light" };
}

// El calendario abre con el mismo tema (claro u oscuro) que tiene la página en ese momento
document.addEventListener("click", function (e) {
  var btn = e.target.closest && e.target.closest("[data-cal-link]");
  if (!btn) return;
  e.preventDefault(); // sin pestaña nueva: el enlace solo es respaldo si Cal.com no carga
  btn.setAttribute("data-cal-config", JSON.stringify(calConfig()));
}, true);

// Precarga: cuando la página termina de cargar, el calendario se prepara en segundo plano para abrir al instante
addEventListener("load", function () {
  setTimeout(function () {
    Cal.ns["30min"]("prerender", { calLink: "fershocastro/30min", type: "modal", config: calConfig() });
  }, 1500);
});
