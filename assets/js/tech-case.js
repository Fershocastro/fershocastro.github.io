// Plantilla "tech" para casos UX: tema, aparición, barra de pasos, cuadrícula del encabezado y calendario del contacto
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tema claro / oscuro
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  // Aparición suave al hacer scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Cuadrícula del encabezado: filas parejas que cierran justo en el borde inferior
  function fitGrid() {
    document.querySelectorAll('.case-frame').forEach(function (f) {
      var h = f.getBoundingClientRect().height;
      f.style.setProperty('--row', (h / Math.max(1, Math.round(h / 80))) + 'px');
    });
  }
  fitGrid();
  addEventListener('resize', fitGrid);

  // Barra de pasos: marca el capítulo actual, los ya vistos y el avance de lectura
  var links = [].slice.call(document.querySelectorAll('.stepper a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var bar = document.querySelector('.stepper .progress');
  var main = document.querySelector('main');
  function onScroll() {
    var line = innerHeight * 0.35, current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    links.forEach(function (a, i) {
      a.classList.toggle('active', i === current);
      a.classList.toggle('done', i < current);
    });
    if (current >= 0 && links[current].scrollIntoView && !onScroll.lock) {
      var ol = links[current].closest('ol'), r = links[current].getBoundingClientRect(), o = ol.getBoundingClientRect();
      if (r.left < o.left || r.right > o.right) ol.scrollTo({ left: links[current].offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (bar && main) {
      var m = main.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -m.top / (m.height - innerHeight)));
      bar.style.width = (p * 100).toFixed(2) + '%';
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Calendario isométrico del panel de contacto
  var cal = document.getElementById('ctaCal');
  if (cal) {
    var NS = 'http://www.w3.org/2000/svg';
    var el = function (svg, tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
    var P = function (list) { return list.map(function (p) { return (230 + (p[0] - p[1]) * 0.866).toFixed(1) + ',' + (120 + (p[0] + p[1]) * 0.5 - p[2]).toFixed(1); }).join(' '); };
    var S = 44, G = 8, H = 5, cols = 5, rows = 4, tiles = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var x = c * (S + G) - 120, y = r * (S + G) - 60;
      var g = el(cal, 'g', { 'class': 'cal-tile' });
      el(g, 'polygon', { 'class': 'side', points: P([[x, y + S, H], [x + S, y + S, H], [x + S, y + S, 0], [x, y + S, 0]]) });
      el(g, 'polygon', { 'class': 'side2', points: P([[x + S, y, H], [x + S, y + S, H], [x + S, y + S, 0], [x + S, y, 0]]) });
      el(g, 'polygon', { 'class': 'top', points: P([[x, y, H], [x + S, y, H], [x + S, y + S, H], [x, y + S, H]]) });
      tiles.push(g);
    }
    var pickTag = el(cal, 'g', { 'class': 'tag on cal-tag' });
    el(pickTag, 'rect', { x: 0, y: -12, width: 105, height: 24 });
    el(pickTag, 'text', { x: 9, y: 4 }).textContent = 'BOOK A SLOT';
    var last = -1;
    var pick = function () {
      tiles.forEach(function (t) { t.classList.remove('pick', 'glow'); });
      var panel = cal.closest('.cta-panel').getBoundingClientRect();
      var ok = tiles.map(function (t, j) { return j; }).filter(function (j) {
        var b = tiles[j].getBoundingClientRect();
        return j !== last && b.left > panel.left + 20 && b.right + 30 < panel.right && b.top - 50 > panel.top && b.bottom + 10 < panel.bottom;
      });
      if (!ok.length) return;
      var i = ok[Math.floor(Math.random() * ok.length)]; last = i;
      [i - 1, i + cols].forEach(function (j) { if (tiles[j] && j !== i) tiles[j].classList.add('glow'); });
      tiles[i].classList.add('pick');
      var box = tiles[i].getBBox();
      pickTag.setAttribute('transform', 'translate(' + (box.x + box.width / 2 - 52) + ',' + (box.y - 30) + ')');
    };
    pick();
    if (!reduce) setInterval(pick, 2200);
  }
})();

// Formato de reporte: índice con avance por fase, porcentaje leído y volver arriba
(function () {
  var secs = [].slice.call(document.querySelectorAll('.r-sec'));
  if (!secs.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var links = secs.map(function (s) { return document.querySelector('.rail a[href="#' + s.id + '"]'); });
  var totalN = document.querySelector('.rail .total .n');
  var totalBar = document.querySelector('.rail .total .track i');
  var mCur = document.querySelector('.mbar .cur');
  var mBar = document.querySelector('.mbar .track i');
  var fab = document.querySelector('.fab, .float-top');
  var report = document.querySelector('.report');

  function update() {
    var line = innerHeight * 0.4, current = 0;
    secs.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (line - r.top) / r.height));
      if (r.bottom <= innerHeight) p = 1;
      if (r.top <= line) current = i;
      var a = links[i];
      if (a) {
        a.style.setProperty('--p', (p * 100).toFixed(1) + '%');
        a.classList.toggle('done', p >= 1);
      }
    });
    links.forEach(function (a, i) { if (a) a.classList.toggle('active', i === current); });
    var rr = report.getBoundingClientRect();
    var t = rr.bottom <= innerHeight ? 1 : Math.min(1, Math.max(0, (line - rr.top) / rr.height));
    var pct = Math.round(t * 100);
    if (totalN) totalN.textContent = pct + '%';
    if (totalBar) totalBar.style.width = pct + '%';
    if (mBar) mBar.style.width = pct + '%';
    if (mCur) {
      var s = secs[current];
      mCur.innerHTML = '<b>' + s.dataset.step + '</b> / ' + String(secs.length - 1).padStart(2, '0') + ' · ' + s.dataset.name;
    }
    if (fab) fab.classList.toggle('show', scrollY > innerHeight * 0.8);
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  document.querySelectorAll('[data-top]').forEach(function (b) {
    b.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  });
})();
