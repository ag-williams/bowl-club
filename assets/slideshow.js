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

  var column = document.querySelector('.hero-photos');
  var stack = document.querySelector('.photo-stack');
  if (!column || !stack) return;

  var photos = [];
  for (var i = 1; i <= PHOTO_COUNT; i++) {
    photos.push('assets/images/photo-' + String(i).padStart(2, '0') + '.jpg');
  }

  var next = 0;       // which photo comes up next
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
    next = 0;
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
})();
