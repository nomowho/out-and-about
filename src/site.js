/* Out and About 共用互動：選單、刊頭、閱讀進度、首屏輪播、MORE */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 選單抽屜 */
  var drawer = $('drawer'), btn = $('menuBtn'), x = $('menuClose');
  function openMenu(open) {
    if (!drawer) return;
    if (open) { drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add('open'); }); x.focus(); }
    else { drawer.classList.remove('open'); drawer.hidden = true; btn.focus(); }
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('locked', open);
  }
  if (btn) btn.addEventListener('click', function () { openMenu(true); });
  if (x) x.addEventListener('click', function () { openMenu(false); });
  if (drawer) drawer.addEventListener('click', function (e) { if (e.target.closest('a')) openMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && !drawer.hidden) openMenu(false); });

  /* 刊頭變窄＋閱讀進度 */
  var head = $('head'), bar = $('progress'), ticking = false;
  function onScroll() {
    ticking = false;
    if (head) head.classList.toggle('slim', scrollY > 120);
    if (bar) { var h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* 分類列：把目前分類捲到看得見的位置 */
  var on = document.querySelector('.nav a.on');
  if (on && on.parentElement.scrollWidth > on.parentElement.clientWidth) on.parentElement.scrollLeft = on.offsetLeft - 16;

  /* PICK UP：MORE 每次多 9 篇 */
  var more = $('picksMore');
  if (more) {
    var rest = function () { return document.querySelectorAll('#picks .card[hidden]'); };
    if (!rest().length) more.parentElement.hidden = true;
    more.addEventListener('click', function () {
      var list = rest(), first = list[0];
      for (var i = 0; i < 9 && i < list.length; i++) list[i].hidden = false;
      if (!rest().length) more.parentElement.hidden = true;
      if (first) first.focus({ preventScroll: true });
    });
  }

  /* 首屏輪播：HTML 只有一份，前後各複製一份做無限循環；手機用手指滑 */
  var track = $('track');
  if (track) {
    var orig = [].slice.call(track.children), N = orig.length;
    var clone = function (el) { var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; return c; };
    orig.map(clone).reverse().forEach(function (c) { track.insertBefore(c, track.firstChild); });
    orig.map(clone).forEach(function (c) { track.appendChild(c); });
    var slides = [].slice.call(track.children), pos = N, timer, count = $('count');
    var prev = $('prev'), next = $('next'), wrap = track.parentElement;
    var place = function (animate, dx) {
      track.style.transition = animate ? '' : 'none';
      var s = slides[pos], gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      var xx = wrap.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2) + (dx || 0);
      track.style.transform = 'translateX(' + xx + 'px)';
      var peek = (wrap.clientWidth - s.offsetWidth) / 2 - gap - s.offsetWidth, bw = prev.offsetWidth;
      var ax = peek >= bw + 16 ? (peek - bw) / 2 : 10;
      prev.style.left = ax + 'px'; next.style.right = ax + 'px';
      slides.forEach(function (el, k) { el.classList.toggle('on', k === pos); });
      if (count) count.textContent = (pos % N + 1) + ' / ' + N;
    };
    var go = function (p) { pos = p; place(true); };
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      if (pos < N || pos >= 2 * N) { pos = N + (pos % N); place(false); }
    });
    var auto = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!document.hidden) go(pos + 1); }, 6000); };
    prev.onclick = function () { go(pos - 1); auto(); };
    next.onclick = function () { go(pos + 1); auto(); };
    track.addEventListener('mouseenter', function () { clearInterval(timer); });
    track.addEventListener('mouseleave', auto);
    wrap.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') prev.click(); if (e.key === 'ArrowRight') next.click(); });

    /* 觸控滑動：水平拖曳超過 40px 換頁；有拖曳就不觸發點擊 */
    var sx = 0, sy = 0, dx = 0, dragging = false, moved = false;
    track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; dragging = true; moved = false; clearInterval(timer); }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      dx = e.touches[0].clientX - sx; var dy = e.touches[0].clientY - sy;
      if (!moved && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }   // 直向捲動交還給頁面
      if (Math.abs(dx) > 8) { moved = true; place(false, dx); }
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (moved) { if (dx < -40) go(pos + 1); else if (dx > 40) go(pos - 1); else place(true); }
      dragging = false; auto();
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

    addEventListener('resize', function () { place(false); });
    addEventListener('load', function () { place(false); });
    place(false); auto();
  }
})();
