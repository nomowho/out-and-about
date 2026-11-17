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

  /* Stories：仿 IG 限時動態。點圓圈開全螢幕；點右半換下一張、左半上一張；按住暫停；往下滑或 Esc 關閉 */
  var sdata = $('storiesData');
  if (sdata) {
    var S = JSON.parse(sdata.textContent), DUR = 5000;
    var seen = {}; try { seen = JSON.parse(localStorage.getItem('oa-seen') || '{}'); } catch (e) {}
    var rings = [].slice.call(document.querySelectorAll('.ring'));
    var mark = function () { rings.forEach(function (r) { var st = S[+r.dataset.story]; r.classList.toggle('seen', seen[st.label] === st.date); }); };
    mark();
    /* 「今天／N 天前」 */
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var ago = function (iso) { var d = new Date(iso + 'T00:00:00'), n = Math.round((today - d) / 864e5); return n <= 0 ? '今天' : n === 1 ? '昨天' : n < 7 ? n + ' 天前' : n < 30 ? Math.floor(n / 7) + ' 週前' : iso.replace(/-/g, '.'); };
    [].forEach.call(document.querySelectorAll('[data-ago]'), function (t) { t.textContent = ago(t.getAttribute('datetime')); });

    var box = document.createElement('div');
    box.className = 'sv'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '動態');
    box.innerHTML = '<div class="sv-frame"><div class="sv-bars"></div><div class="sv-top"><span class="sv-av"></span><b class="sv-name"></b><time class="sv-time"></time><button type="button" class="sv-x" aria-label="關閉">✕</button></div>' +
      '<img class="sv-img" alt=""><div class="sv-cap"><p class="sv-text"></p><a class="sv-link" href="#">看文章 ›</a></div>' +
      '<button type="button" class="sv-prev" aria-label="上一則"></button><button type="button" class="sv-next" aria-label="下一則"></button></div>' +
      '<button type="button" class="sv-side l" aria-label="上一組"></button><button type="button" class="sv-side r" aria-label="下一組"></button>';
    document.body.appendChild(box);
    var q = function (c) { return box.querySelector(c); };
    var cur = 0, idx = 0, raf = 0, t0 = 0, elapsed = 0, paused = false, opener = null;
    var bars = q('.sv-bars');
    var preload = function (u) { if (u) { var im = new Image(); im.src = u; } };
    function show() {
      var st = S[cur], it = st.items[idx];
      bars.innerHTML = st.items.map(function (_, k) { return '<i><b style="width:' + (k < idx ? 100 : 0) + '%"></b></i>'; }).join('');
      q('.sv-img').src = it.img;
      q('.sv-img').alt = it.text;
      q('.sv-av').style.backgroundImage = 'url(' + st.items[0].img + ')';
      q('.sv-name').textContent = st.label;
      q('.sv-time').textContent = ago(st.date);
      q('.sv-text').textContent = it.text;
      var ln = q('.sv-link'); ln.hidden = !it.link; if (it.link) ln.href = it.link;
      elapsed = 0; t0 = performance.now();
      preload((st.items[idx + 1] || (S[cur + 1] || { items: [] }).items[0] || {}).img);
      if (idx === st.items.length - 1) { seen[st.label] = st.date; try { localStorage.setItem('oa-seen', JSON.stringify(seen)); } catch (e) {} }
    }
    function tick(now) {
      if (!paused) {
        var p = Math.min(1, (elapsed + now - t0) / DUR), b = bars.children[idx];
        if (b) b.firstChild.style.width = p * 100 + '%';
        if (p >= 1) { next(); }
      }
      raf = requestAnimationFrame(tick);
    }
    function next() { if (idx < S[cur].items.length - 1) { idx++; show(); } else if (cur < S.length - 1) { cur++; idx = 0; show(); } else close(); }
    function prev() { if (idx > 0) { idx--; show(); } else if (cur > 0) { cur--; idx = 0; show(); } else show(); }
    function pause(on) { if (on && !paused) { elapsed += performance.now() - t0; paused = true; } else if (!on && paused) { t0 = performance.now(); paused = false; } box.classList.toggle('paused', paused); }
    function open(i) {
      opener = document.activeElement; cur = i; idx = 0; paused = false;
      box.hidden = false; document.body.classList.add('locked');
      requestAnimationFrame(function () { box.classList.add('open'); });
      show(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      q('.sv-x').focus();
      if (reduce) pause(true);
    }
    function close() {
      cancelAnimationFrame(raf); box.classList.remove('open'); box.hidden = true;
      document.body.classList.remove('locked'); mark();
      if (opener) opener.focus();
    }
    rings.forEach(function (r) { r.addEventListener('click', function () { open(+r.dataset.story); }); });
    q('.sv-x').onclick = close;
    q('.sv-next').onclick = next; q('.sv-prev').onclick = prev;
    box.querySelector('.sv-side.l').onclick = function () { if (cur > 0) { cur--; idx = 0; show(); } };
    box.querySelector('.sv-side.r').onclick = function () { if (cur < S.length - 1) { cur++; idx = 0; show(); } else close(); };
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); else if (e.key === ' ') { e.preventDefault(); pause(!paused); }
    });
    /* 按住暫停；往下滑關閉；左右滑換組 */
    var frame = q('.sv-frame'), hx = 0, hy = 0, held = 0, swiped = false;
    frame.addEventListener('pointerdown', function (e) { if (e.target.closest('.sv-x,.sv-link')) return; hx = e.clientX; hy = e.clientY; swiped = false; held = setTimeout(function () { pause(true); }, 180); });
    frame.addEventListener('pointerup', function (e) {
      clearTimeout(held);
      var dx = e.clientX - hx, dy = e.clientY - hy;
      if (dy > 80 && Math.abs(dy) > Math.abs(dx)) { swiped = true; close(); return; }
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { swiped = true; if (dx < 0) box.querySelector('.sv-side.r').click(); else box.querySelector('.sv-side.l').click(); }
      if (paused) { swiped = true; pause(false); }
    });
    frame.addEventListener('pointercancel', function () { clearTimeout(held); pause(false); });
    frame.addEventListener('click', function (e) { if (swiped && e.target.closest('.sv-prev,.sv-next')) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);
    document.addEventListener('visibilitychange', function () { if (!box.hidden) pause(document.hidden); });
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
