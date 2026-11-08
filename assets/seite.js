/* Potenzialanalyse Waldhotel Doldenhorn · Bewegung, Karussell, Zahlenreihe, Seitenzahl-Leiste (16.10.2026) */
(function () {
  'use strict';
  var d = document, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Überschriften: Zeilen nach dem echten Umbruch in Schlitze legen */
  function zeilen(el) {
    if (!el.dataset.text) el.dataset.text = el.textContent.trim();
    var text = el.dataset.text, w = text.split(/\s+/);
    el.textContent = '';
    var spans = w.map(function (x, i) { var s = d.createElement('span'); s.textContent = x + (i < w.length - 1 ? ' ' : ''); el.appendChild(s); return s; });
    var reihen = [], top = null;
    spans.forEach(function (s) { var t = s.offsetTop; if (top === null || Math.abs(t - top) > 4) { reihen.push([]); top = t; } reihen[reihen.length - 1].push(s.textContent); });
    el.textContent = '';
    reihen.forEach(function (r) { var z = d.createElement('span'); z.className = 'z'; var i = d.createElement('span'); i.textContent = r.join(''); z.appendChild(i); el.appendChild(z); });
    el.setAttribute('aria-label', text);
  }
  var zt = [].slice.call(d.querySelectorAll('.zt'));
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { zt.forEach(zeilen); beobachten(); });
  var breite = innerWidth, tz;
  addEventListener('resize', function () { if (innerWidth === breite) return; breite = innerWidth; clearTimeout(tz); tz = setTimeout(function () { zt.forEach(zeilen); }, 180); });

  /* Auftritte: sobald etwas den unteren Rand erreicht, sofort und ohne Staffel */
  function beobachten() {
    var ziele = [].slice.call(d.querySelectorAll('.zt, .zoom, .titel, .zahl'));
    var ohneView = true;   /* Robert 18.10.2026, 18:17 («zu früh, zu schnell»): nicht mehr am Scrollen, nach der Uhr bei einem Fünftel im Bild */
    if (ohneView) ziele = ziele.concat([].slice.call(d.querySelectorAll('[data-steig]')));
    if (ruhig || !('IntersectionObserver' in window)) { ziele.forEach(function (e) { e.classList.add('da'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= innerHeight * 0.2)) { e.target.classList.add('da'); if (e.target.classList.contains('zahl')) zaehlen(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] });
    ziele.forEach(function (e) { io.observe(e); });
    /* Sprung über eine Stelle hinweg (Inhaltsverzeichnis, schnelles Scrollen): alles oberhalb gilt als gesehen */
    var offen = ziele.slice(), wartet = false;
    addEventListener('scroll', function () {
      if (wartet) return; wartet = true;
      requestAnimationFrame(function () { wartet = false;
        offen = offen.filter(function (e) { if (e.classList.contains('da')) return false; if (e.getBoundingClientRect().top < innerHeight) { e.classList.add('da'); if (e.classList.contains('zahl')) zaehlen(e); return false; } return true; });
      });
    }, { passive: true });
  }
  function zaehlen(el) {
    var ziel = parseInt(el.dataset.ziel, 10); if (!ziel || ziel < 10) return;
    var t0 = performance.now(), dauer = 1600;
    (function f(t) { var p = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(ziel * e); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* Karussell: endlos, Pfeile und Wischen; vorne immer die echte Website */
  [].slice.call(d.querySelectorAll('.satz')).forEach(function (satz) {
    var k = satz.querySelector('.karussell'), spur = k.querySelector('.spur'), folien = [].slice.call(spur.children), n = folien.length, i = 0;
    var bu = satz.querySelector('.bu'), z = satz.querySelector('.zaehler b');
    function geh(j) {
      i = (j + n) % n; spur.style.transform = 'translateX(' + (-100 * i) + '%)';
      folien.forEach(function (f, x) { f.classList.toggle('an', x === i); f.setAttribute('aria-hidden', x === i ? 'false' : 'true'); });
      if (bu) bu.textContent = folien[i].dataset.bu || ''; if (z) z.textContent = i + 1;
    }
    satz._geh = geh;
    if (n < 2) return;
    satz.querySelector('.pf-l').addEventListener('click', function () { geh(i - 1); });
    satz.querySelector('.pf-r').addEventListener('click', function () { geh(i + 1); });
    var x0 = null, y0 = null;
    k.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; }, { passive: true });
    k.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) geh(i + (dx < 0 ? 1 : -1)); x0 = null; }, { passive: true });
    k.addEventListener('pointercancel', function () { x0 = null; }, { passive: true });
  });

  /* Zahlenreihe 1-2-3: tauscht nur den Satz, die Fläche bleibt gleich hoch */
  [].slice.call(d.querySelectorAll('.buehne')).forEach(function (b) {
    var knoepfe = [].slice.call(b.querySelectorAll('.zr')), saetze = [].slice.call(b.querySelectorAll('.satz'));
    knoepfe.forEach(function (kn) {
      kn.addEventListener('click', function () {
        var s = +kn.dataset.satz;
        knoepfe.forEach(function (x) { var an = x === kn; x.classList.toggle('an', an); x.setAttribute('aria-selected', an ? 'true' : 'false'); });
        saetze.forEach(function (x, j) { x.classList.toggle('an', j === s); if (j === s && x._geh) x._geh(0); });
      });
    });
  });

  /* Seitenzahl-Leiste: erscheint nach dem Titelblatt, zeigt Seite und Rubrik */
  var leiste = d.querySelector('.leiste'), nr = leiste.querySelector('.ls-nr b'), wo = leiste.querySelector('.ls-wo'),
      rub = [].slice.call(leiste.querySelectorAll('.ls-r')), boegen = [].slice.call(d.querySelectorAll('[data-seite]')), titel = d.querySelector('.titel');
  var sichtbar = new Map();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { leiste.classList.toggle('da', !e.isIntersecting); }); }, { threshold: 0.12 }).observe(titel);
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) sichtbar.set(e.target, e.intersectionRect.height); else sichtbar.delete(e.target); });
      var best = null, h = 0; sichtbar.forEach(function (v, k) { if (v > h) { h = v; best = k; } });
      if (!best) return;
      nr.textContent = best.dataset.seite; var r = best.dataset.rubrik; wo.textContent = r;
      rub.forEach(function (a) { a.classList.toggle('an', a.dataset.rubrik === r); });
    }, { threshold: [0, .1, .25, .5, .75, 1] });
    boegen.forEach(function (b) { io2.observe(b); });
  } else leiste.classList.add('da');
})();
