// FreshCheck site: language switch, scroll reveals and the small looping demos.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Language (initial value is set inline in <head> to avoid a flash)
  var buttons = document.querySelectorAll('.lang button');
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === lang)); });
    try { localStorage.setItem('fc-lang', lang); } catch (e) {}
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.set); }); });
  setLang(root.getAttribute('data-lang') || 'en');

  // Nav hairline once the page scrolls
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveals
  var targets = document.querySelectorAll('.reveal, .stagger, .ring');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  // Floating pills land after the phone
  var pills = document.querySelectorAll('.pill');
  setTimeout(function () { pills.forEach(function (p) { p.classList.add('on'); }); }, reduce ? 0 : 1300);

  // Shopping list: tick items one by one, then start over
  var list = document.querySelector('.checks');
  if (list && !reduce) {
    var items = list.querySelectorAll('li');
    var i = 0;
    setInterval(function () {
      if (i < items.length) { items[i].classList.add('done'); i++; }
      else { items.forEach(function (li) { li.classList.remove('done'); }); i = 0; }
    }, 1400);
  }

  // Table of contents: highlight the section in view
  var links = document.querySelectorAll('.toc a');
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var active = byId[e.target.id];
        if (!active) return;
        links.forEach(function (a) { a.classList.toggle('active', a === active); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.prose article[id]').forEach(function (s) { spy.observe(s); });
  }
})();
