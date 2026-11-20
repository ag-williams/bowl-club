/* ============================================
   Bowl Club — homepage statistics
   Reads content/home/stats.md (lines like "bowls served: 1,200")
   and builds a tile for each stat. Numbers count up when the
   section scrolls into view.

   Each tile's image is picked from its label (see imageFor below).
   Stats without an image yet show the PLACEHOLDER.
   ============================================ */

(function () {
  var grid = document.querySelector('[data-stats]');
  if (!grid) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Placeholder image for any stat that doesn't have its own image yet
  var PLACEHOLDER = 'assets/images/placeholder-stew.webp';

  // Picks a tile's image from words in its label
  function imageFor(label) {
    var l = label.toLowerCase();
    if (/pound|lb/.test(l)) return 'assets/images/stat-carrot.webp';
    if (/hour/.test(l)) return 'assets/images/stat-bread.webp';
    return PLACEHOLDER;
  }

  function parse(text) {
    return text.split('\n').map(function (line) {
      if (/^\s*#/.test(line)) return null;
      var m = line.match(/^\s*(.+?)\s*:\s*([\d,.]*)\s*(\+?)\s*$/);
      if (!m) return null;
      var value = m[2] ? parseFloat(m[2].replace(/,/g, '')) : NaN;
      return { label: m[1], value: value, plus: m[3] };
    }).filter(Boolean);
  }

  function format(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function countUp(el, stat) {
    if (isNaN(stat.value)) { el.textContent = '—'; return; }
    var end = stat.value;
    if (reduceMotion) { el.textContent = format(end) + stat.plus; return; }
    var duration = 1800;
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // fast start, gentle finish
      el.textContent = format(end * eased) + (p === 1 ? stat.plus : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function build(stats) {
    grid.innerHTML = '';
    stats.forEach(function (stat) {
      var tile = document.createElement('div');
      tile.className = 'stat';
      tile.innerHTML =
        '<img class="stat-art' + (imageFor(stat.label) === PLACEHOLDER ? ' image-placeholder' : '') +
          '" src="' + imageFor(stat.label) + '" alt="" width="96" height="96">' +
        '<p class="stat-number">' + (isNaN(stat.value) ? '—' : '0') + '</p>' +
        '<p class="stat-label"></p>';
      tile.querySelector('.stat-label').textContent = stat.label;
      grid.appendChild(tile);
    });

    var started = false;
    function start() {
      if (started) return;
      started = true;
      grid.classList.add('is-counted');
      grid.querySelectorAll('.stat-number').forEach(function (el, i) {
        countUp(el, stats[i]);
      });
    }

    if ('IntersectionObserver' in window) {
      var watch = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          start();
          watch.disconnect();
        }
      }, { threshold: 0.35 });
      watch.observe(grid);
    } else {
      start();
    }
  }

  fetch(grid.getAttribute('data-stats'), { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
    .then(function (text) { build(parse(text)); })
    .catch(function () { grid.closest('section').hidden = true; });
})();
