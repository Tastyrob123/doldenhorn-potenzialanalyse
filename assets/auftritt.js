/* Auftritte für Seiten ohne eigene (Anleitungen, Mappen, Mails). Prüf-Chat «Auftritte» 18.10.2026 nach Robert 17:46: «… stell das bitte überall sicher».
   Überschriften, Absätze, Listen, Bilder und Knöpfe schweben herein, sobald sie am unteren Rand auftauchen, Bilder zoomen in ihren Rahmen.
   Nur Bewegung, alles ist von Anfang an deckend, einmal (kein Rücksprung). Was schon einen eigenen Auftritt hat ([data-r], .da-Logik), bleibt unberührt.
   Gestaltung in auftritt.css. Wahl der Teile: data-teile am Skript, sonst der Standard unten. */
(function () {
  if (!('IntersectionObserver' in window) || !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var skript = document.currentScript;
  var TEILE = (skript && skript.getAttribute('data-teile')) || 'h1, h2, h3, h4, p, li, figure, img, blockquote, table, dl, .kn, a.knopf, button.bild';
  var OHNE = 'header, nav, dialog, [data-r], [data-au-ohne], .au, svg, template' + ((skript && skript.getAttribute('data-ohne')) ? ', ' + skript.getAttribute('data-ohne') : '');   /* data-ohne: was auf dieser Seite schon eigene Bewegung hat */
  /* data-fenster="3000": Seiten, die ihren Inhalt erst nach dem Laden zeichnen (Werkzeuge), werden so lange nachgesehen; was später beim Arbeiten neu gezeichnet wird, steht sofort ruhig da */
  var FENSTER = +(skript && skript.getAttribute('data-fenster')) || 0, io = null, alle = [];
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}   /* jede Seite öffnet oben */
  if (!location.hash) window.scrollTo(0, 0);
  function los() {
    var wurzel = document.querySelector(skript && skript.getAttribute('data-wurzel') || 'body');
    if (!wurzel) return;
    suche(wurzel);
    if (FENSTER && window.MutationObserver) {
      var plan = 0, mo = new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(function () { plan = 0; suche(wurzel); }); });
      mo.observe(wurzel, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, FENSTER);
    }
    addEventListener('beforeprint', function () { alle.forEach(function (e) { e.classList.add('au--da'); }); });
    /* am Seitenende kommt, was noch aussteht (eine kurze letzte Zeile erreicht ihr Fünftel sonst nie) */
    addEventListener('scroll', function () {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      alle.forEach(function (e) { if (!e.classList.contains('au--da') && e.getBoundingClientRect().top < window.innerHeight + 60) { e.classList.add('au--da'); if (io) io.unobserve(e); } });
    }, { passive: true });
  }
  function suche(wurzel) {
    var teile = [].slice.call(wurzel.querySelectorAll(TEILE)).filter(function (e) {
      if (e.closest(OHNE)) return false;
      for (var x = e.parentElement; x && x !== wurzel; x = x.parentElement) if (x.classList.contains('au')) return false;
      var r = e.getBoundingClientRect(); return r.width > 12 && r.height > 8;
    });
    if (!teile.length) return;
    teile.forEach(function (e) { e.classList.add('au'); if (e.tagName === 'FIGURE') e.classList.add('au--bild'); if (/^(IMG|FIGURE|TABLE|BLOCKQUOTE)$/.test(e.tagName) || !/^(H[1-6]|P|LI|DT|DD|A|BUTTON|SPAN|SMALL|B|EM)$/.test(e.tagName)) e.classList.add('au--block'); alle.push(e); });
    document.documentElement.classList.add('au-an');
    if (!io) io = new IntersectionObserver(function (es) {
      var k = 0;   /* was gemeinsam auftaucht, kommt in Reihen 0,12 s auseinander (höchstens vier Schritte) */
      es.forEach(function (x) { if (x.isIntersecting && (x.intersectionRatio >= 0.2 || x.intersectionRect.height >= window.innerHeight * 0.2)) { x.target.style.setProperty('--au-i', Math.min(k++, 4)); x.target.classList.add('au--da'); io.unobserve(x.target); } });
    }, { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] });   /* los bei einem Fünftel im Bild, oben weit offen (Robert 18.10.2026, 18:17) */
    /* Was beim Laden schon im Bild ist, braucht erst seine Ausgangslage, sonst springt es ohne Weg an den Platz */
    void document.body.offsetHeight;
    requestAnimationFrame(function () { requestAnimationFrame(function () { teile.forEach(function (e) { io.observe(e); }); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
