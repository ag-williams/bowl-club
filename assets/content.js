/* ============================================
   Bowl Club — loads text from the content/ folder

   <div data-content="content/page/file.md"></div>
     → filled with that Markdown file, turned into HTML.

   <div data-content="content/page/file.md" data-cards="card"></div>
     → each "## Heading" in the file becomes its own box,
       using the class named in data-cards ("card" or "feature").
   ============================================ */

(function () {
  function toHTML(text) {
    if (window.marked) return marked.parse(text);
    // Fallback if the Markdown library didn't load: plain paragraphs
    return text.split(/\n\s*\n/).map(function (p) { return '<p>' + p + '</p>'; }).join('');
  }

  // Split the converted text into boxes, starting a new box at each heading
  function toCards(html, className) {
    var source = document.createElement('div');
    source.innerHTML = html;
    var out = document.createDocumentFragment();
    var card = null;

    Array.prototype.slice.call(source.childNodes).forEach(function (node) {
      if (/^H[1-6]$/.test(node.nodeName)) {
        card = document.createElement('div');
        card.className = className;
        var h3 = document.createElement('h3');
        h3.innerHTML = node.innerHTML;
        card.appendChild(h3);
        out.appendChild(card);
      } else if (card) {
        card.appendChild(node);
      } else if (node.nodeType === 1) {
        out.appendChild(node); // text before the first heading
      }
    });
    return out;
  }

  // Links to other websites open in a new tab
  function fixLinks(box) {
    box.querySelectorAll('a[href^="http"]').forEach(function (a) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }

  var boxes = document.querySelectorAll('[data-content]');
  var jobs = Array.prototype.map.call(boxes, function (box) {
    var file = box.getAttribute('data-content');
    var cards = box.getAttribute('data-cards');

    return fetch(file, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error(file + ' not found');
        return response.text();
      })
      .then(function (text) {
        var html = toHTML(text);
        box.innerHTML = '';
        if (cards) box.appendChild(toCards(html, cards));
        else box.innerHTML = html;
        fixLinks(box);
      })
      .catch(function () {
        box.innerHTML = '<p>More info to come soon!</p>';
      });
  });

  // Let other scripts (like the slideshow) know the text is in place
  Promise.all(jobs).then(function () {
    document.dispatchEvent(new Event('content:loaded'));
  });
})();
