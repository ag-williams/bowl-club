/* ============================================
   Bowl Club — homepage photo slideshow
   Fills the right-hand photo column with as many
   photos as fit beside the text, then cycles
   through every photo in assets/images in order.
   ============================================ */

(function () {
  // ---- Settings you can change ----
  var PHOTO_COUNT = 25;        // photos are photo-01.jpg ... photo-25.jpg; raise this when you add more
  var SECONDS_PER_CHANGE = 4;  // how often one of the photos swaps
  var SLOT_SHAPE = 3 / 4;      // each photo spot is about 4 wide by 3 tall

  // Favorites that show up more often: { photo number: extra times per cycle }.
  // The extra appearances are spread evenly through the rotation.
  var EXTRA_APPEARANCES = { 2: 2 };

  var column = document.querySelector('.hero-photos');
  var stack = document.querySelector('.photo-stack');
  if (!column || !stack) return;

  var photos = [];
  for (var i = 1; i <= PHOTO_COUNT; i++) {
    photos.push('assets/images/photo-' + String(i).padStart(2, '0') + '.jpg');
  }

  // Slot each favorite's extra appearances in at evenly spaced points
  Object.keys(EXTRA_APPEARANCES).forEach(function (num) {
    var src = 'assets/images/photo-' + String(num).padStart(2, '0') + '.jpg';
    var extra = EXTRA_APPEARANCES[num];
    var first = photos.indexOf(src);
    if (first === -1) return;
    for (var k = extra; k >= 1; k--) {
      var spot = first + Math.round(k * PHOTO_COUNT / (extra + 1));
      photos.splice(Math.min(spot, photos.length), 0, src);
    }
  });

  // A page can start partway through the photos, e.g. data-start="13"
  var start = (parseInt(column.getAttribute('data-start'), 10) || 1) - 1;
  start = Math.min(Math.max(start, 0), photos.length - 1);

  var next = start;   // which photo comes up next
  var turn = 0;       // which spot changes next
  var timer = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function nextPhoto() {
    var src = photos[next];
    next = (next + 1) % photos.length;
    return src;
  }

  function show(slot, src) {
    var img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.onload = function () {
      slot.appendChild(img);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          img.classList.add('is-visible');
        });
      });
      // remove the photo underneath once the new one has faded in
      setTimeout(function () {
        while (slot.children.length > 1) slot.removeChild(slot.firstChild);
      }, 1400);
    };
    img.src = src;
  }

  function howManyFit() {
    if (window.matchMedia('(max-width: 720px)').matches) return 1;
    var width = column.clientWidth;
    var height = column.clientHeight;
    var gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
    var slotHeight = width * SLOT_SHAPE;
    var count = Math.floor((height + gap) / (slotHeight + gap));
    return Math.max(1, Math.min(count, photos.length));
  }

  function build() {
    var count = howManyFit();
    if (stack.children.length === count) return;

    stack.innerHTML = '';
    next = start;
    turn = 0;
    for (var s = 0; s < count; s++) {
      var slot = document.createElement('div');
      slot.className = 'photo-slot';
      stack.appendChild(slot);
      show(slot, nextPhoto());
    }
  }

  function tick() {
    var slots = stack.children;
    if (!slots.length) return;
    turn = turn % slots.length;
    show(slots[turn], nextPhoto());
    turn++;
  }

  build();
  if (!reduceMotion) timer = setInterval(tick, SECONDS_PER_CHANGE * 1000);

  // Recount when the window is resized (text wraps differently, column changes height)
  var resizeWait;
  window.addEventListener('resize', function () {
    clearTimeout(resizeWait);
    resizeWait = setTimeout(build, 200);
  });
  // Recount once web fonts finish loading, since they change the text's height
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  // Recount once the text from the content/ folder has loaded in
  document.addEventListener('content:loaded', build);
})();
