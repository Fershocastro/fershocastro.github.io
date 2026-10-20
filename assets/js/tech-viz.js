// Gráficos isométricos reutilizables para los casos UX.
// Uso: <svg data-viz="fragmented"></svg> o <svg data-viz="layers" data-layers="Atoms|Round 01;Molecules|Round 02;Organisms|Round 03" data-total="35"></svg>
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function el(parent, tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
  function projector(ox, oy) {
    return function (list) { return list.map(function (p) { return (ox + (p[0] - p[1]) * 0.866).toFixed(1) + ',' + (oy + (p[0] + p[1]) * 0.5 - p[2]).toFixed(1); }).join(' '); };
  }
  function box(g, P, x, y, z, w, d, h, cls) {
    var t = z + h;
    el(g, 'polygon', { 'class': 'side ' + (cls || ''), points: P([[x, y + d, t], [x + w, y + d, t], [x + w, y + d, z], [x, y + d, z]]) });
    el(g, 'polygon', { 'class': 'side2 ' + (cls || ''), points: P([[x + w, y, t], [x + w, y + d, t], [x + w, y + d, z], [x + w, y, z]]) });
    el(g, 'polygon', { 'class': 'top ' + (cls || ''), points: P([[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]]) });
  }
  function label(svg, x, y, text, anchor, cls) {
    var t = el(svg, 'text', { x: x, y: y, 'text-anchor': anchor || 'start', 'class': cls || '' });
    t.textContent = text; return t;
  }

  var makers = {
    // Antes: piezas sueltas y duplicadas. Después: una sola pila ordenada.
    fragmented: function (svg) {
      svg.setAttribute('viewBox', '0 0 560 230');
      var L = projector(130, 120), R = projector(430, 150);
      var bits = [[-70, -40, 0, 22, 22, 18], [-20, -70, 10, 30, 18, 8], [20, -20, -10, 18, 30, 24], [-60, 20, 20, 26, 26, 10], [10, 30, 0, 22, 22, 18], [40, -60, 30, 16, 16, 16], [-30, 60, -5, 30, 14, 12]];
      bits.forEach(function (b, i) {
        var g = el(svg, 'g', { 'class': 'float' + (i % 3 ? ' d' + (i % 3) : '') });
        box(g, L, b[0], b[1], b[2], b[3], b[4], b[5], 'loose');
      });
      label(svg, 130, 222, 'BEFORE · FRAGMENTED', 'middle', 'mut');
      el(svg, 'path', { 'class': 'dash', d: 'M250 120 H322' });
      el(svg, 'polygon', { points: '322,116 330,120 322,124', 'class': 'acc' });
      ['Components', 'Tokens', 'Foundations'].forEach(function (n, i) {
        box(svg, R, -55, -55, i * 22, 110, 110, 10);
      });
      var c = R([[55, -55, 49]]).split(',');
      el(svg, 'path', { 'class': 'lead', d: 'M' + c[0] + ' ' + c[1] + ' h18' });
      label(svg, 430, 222, 'AFTER · ONE SYSTEM', 'middle', 'acc');
    },
    // Capas de diseño atómico apiladas, con el total al lado.
    layers: function (svg) {
      svg.setAttribute('viewBox', '0 0 500 250');
      var P = projector(160, 150);
      var items = (svg.dataset.layers || '').split(';').map(function (s) { return s.split('|'); });
      items.forEach(function (it, i) {
        var g = el(svg, 'g', { 'class': 'layer float' + (i ? ' d' + i : '') });
        var size = 150 - i * 26, off = -size / 2;
        box(g, P, off, off, i * 42, size, size, 12, i === items.length - 1 ? 'hi' : '');
        var c = P([[size / 2 + off + size, off, i * 42 + 6]]).split(',');
        var y = +c[1];
        var x0 = 345;
        el(svg, 'path', { 'class': 'lead', d: 'M' + (P([[-off, off, i * 42 + 6]]).split(',')[0]) + ' ' + y + ' H' + (x0 - 8) });
        label(svg, x0, y - 2, it[0].toUpperCase());
        label(svg, x0, y + 13, it[1] || '', 'start', 'mut');
      });
      if (svg.dataset.total) {
        label(svg, 345, 236, '= ' + svg.dataset.total + ' COMPONENTS', 'start', 'acc');
      }
    }
  };

  // Retícula de 100 cuadros con N llenos (porcentajes)
  document.querySelectorAll('.dots100[data-value]').forEach(function (d) {
    var v = +d.dataset.value, html = '';
    for (var i = 0; i < 100; i++) html += '<i' + (i < v ? ' class="on"' : '') + '></i>';
    d.innerHTML = html;
  });

  document.querySelectorAll('svg[data-viz]').forEach(function (svg) {
    var m = makers[svg.dataset.viz];
    if (m) { svg.classList.add('iso'); m(svg); }
  });
})();
