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
  var head = $('head'), bar = $('progress'), ticking = false, lastY = scrollY, navOff = false, navT = 0;
  function setNav(off) { if (off === navOff) return; navOff = off; navT = Date.now(); head.classList.toggle('navoff', off); }
  function onScroll() {
    ticking = false;
    if (head) head.classList.toggle('slim', scrollY > 120);
    /* 文章頁：往下讀時收起分類列，往上滑或回到頂端再出現（切換後 400ms 內不反向，避免頁面高度變化造成抖動） */
    if (head && bar) {
      var y = scrollY, d = y - lastY, now = Date.now();
      var nearEnd = y + innerHeight >= document.documentElement.scrollHeight - 80;
      if (now - navT > 400) {
        if (y < 200) setNav(false);
        else if (d > 8 && !navOff) setNav(true);
        else if (d < -8 && navOff && !nearEnd) setNav(false);
      }
      if (Math.abs(d) > 8 || y < 200) lastY = y;
    }
    if (bar) { var h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();


  /* 文末 More Stories：手機左右滑＋短線指示 */
  [].forEach.call(document.querySelectorAll('.more:not(.plain) .grid'), function (g) {
    var cards = g.children; if (cards.length < 2) return;
    var d = document.createElement('div'); d.className = 'dashes';
    for (var i = 0; i < cards.length; i++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', '第 ' + (i + 1) + ' 篇');
      b.onclick = function () { g.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' }); };
      d.appendChild(b);
    })(i);
    g.parentNode.insertBefore(d, g.nextSibling);
    var mark = function () {
      var k = 0, best = 1e9, x = g.scrollLeft;
      for (var i = 0; i < cards.length; i++) { var dd = Math.abs(cards[i].offsetLeft - cards[0].offsetLeft - x); if (dd < best) { best = dd; k = i; } }
      if (x + g.clientWidth >= g.scrollWidth - 4) k = cards.length - 1;
      [].forEach.call(d.children, function (b, i) { b.classList.toggle('on', i === k); });
    };
    g.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true }); mark();
  });

  /* 刊頭分享：手機用系統分享面板（LINE、IG、訊息⋯），不支援就跳出小選單 */
  var sb = $('shareBtn'), sm = $('shareMenu');
  if (sb) {
    var canon = document.querySelector('link[rel=canonical]'), url = canon ? canon.href : location.href;
    var h1 = document.querySelector('main h1'), ttl = (h1 ? h1.textContent : document.title).trim();
    var enc = encodeURIComponent;
    var links = { line: 'https://social-plugins.line.me/lineit/share?url=' + enc(url), fb: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url), x: 'https://twitter.com/intent/tweet?url=' + enc(url) + '&text=' + enc(ttl) };
    [].forEach.call(sm.querySelectorAll('a[data-share]'), function (a) { a.href = links[a.getAttribute('data-share')]; });
    var toast = function (msg) { var t = document.createElement('div'); t.className = 'sharetoast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); requestAnimationFrame(function () { t.classList.add('on'); }); setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }, 1800); };
    var menu = function (open) { sm.hidden = !open; sb.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    var coarse = matchMedia('(pointer:coarse)').matches;
    sb.addEventListener('click', function (e) {
      e.stopPropagation();
      if (navigator.share && coarse) { navigator.share({ title: ttl, url: url }).catch(function () {}); return; }
      menu(sm.hidden);
    });
    sm.querySelector('[data-share=copy]').addEventListener('click', function () {
      var done = function () { menu(false); toast('已複製連結'); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('複製這個連結', url); menu(false); });
      else { prompt('複製這個連結', url); menu(false); }
    });
    sm.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
    document.addEventListener('click', function (e) { if (!sm.hidden && !sm.contains(e.target)) menu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sm.hidden) { menu(false); sb.focus(); } });
  }

  /* 國家頁：依地區篩選（網址 #地區 可直接帶入，例如從國家總覽點「青森」） */
  var areas = $('areas');
  if (areas) {
    var chips = [].slice.call(areas.querySelectorAll('a')), secs = [].slice.call(document.querySelectorAll('.grpsec, .masonry .jp'));
    var pick = function (name, scroll) {
      if (name && !secs.some(function (x) { return x.getAttribute('data-area') === name; })) name = '';
      chips.forEach(function (c) { var on = c.getAttribute('data-area') === name; c.classList.toggle('on', on); if (on) { c.setAttribute('aria-current', 'true'); if (c.scrollIntoView && areas.scrollWidth > areas.clientWidth) areas.scrollLeft = c.offsetLeft - 20; } else c.removeAttribute('aria-current'); });
      secs.forEach(function (x) { x.hidden = !!name && x.getAttribute('data-area') !== name; });
      areas.classList.toggle('filtered', !!name);
      areas.dispatchEvent(new Event('areachange'));
      if (scroll) areas.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    var fromHash = function () { var h = decodeURIComponent(location.hash.slice(1)); return h === 'areas' ? '' : h; };
    areas.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return; e.preventDefault();
      var name = a.getAttribute('data-area');
      history.replaceState(null, '', name ? '#' + encodeURIComponent(name) : location.pathname);
      pick(name, true);
    });
    addEventListener('hashchange', function () { pick(fromHash(), true); });
    if (location.hash) { pick(fromHash(), false); setTimeout(function () { areas.scrollIntoView({ block: 'start' }); }, 0); }
  }

  /* Photo Journal：瀑布流（每張放進目前最矮的那一欄，欄底較齊）＋每隔幾張穿插一張橫式滿版；篩選或換欄數時重排 */
  var jw = document.querySelector('.journal');
  if (jw) {
    var jall = [].slice.call(jw.querySelectorAll('.jp'));
    var cols = function () { return innerWidth > 1100 ? 4 : innerWidth > 700 ? 3 : 2; };
    var ratio = function (it) { var im = it.querySelector('img'); var w = +im.getAttribute('width'), h = +im.getAttribute('height'); return w && h ? h / w : 1.25; };
    var lastK = 0;
    var jlayout = function () {
      var K = cols(), EVERY = K * 2; lastK = K;
      var frag = document.createDocumentFragment(), run = [], sim = [];
      var reset = function () { sim = []; for (var i = 0; i < K; i++) sim.push(0); }; reset();
      var flush = function () {
        if (!run.length) return;
        var blk = document.createElement('div'); blk.className = 'masonry m' + K;
        var cs = [], hs = [];
        for (var i = 0; i < K; i++) { var c = document.createElement('div'); c.className = 'mcol'; blk.appendChild(c); cs.push(c); hs.push(0); }
        run.forEach(function (it) { var k = hs.indexOf(Math.min.apply(null, hs)); cs[k].appendChild(it); hs[k] += ratio(it) + 0.12; });
        frag.appendChild(blk); run = []; reset();
      };
      var n = Infinity;
      jall.forEach(function (it) {
        var im = it.querySelector('img');
        if (it.hidden) { frag.appendChild(it); return; }
        var spread = Math.max.apply(null, sim) - Math.min.apply(null, sim);
        if (it.hasAttribute('data-feat') || it.hasAttribute('data-land') && (n === Infinity || (n >= EVERY && spread < 0.5 + 0.08 * (n - EVERY)))) {   // 欄底差不多齊了才插滿版
          flush(); it.classList.add('feat'); if (im) im.sizes = '(max-width:1100px) 100vw, 1100px';
          frag.appendChild(it); n = 0;
        } else {
          it.classList.remove('feat'); if (im) im.sizes = '(max-width:700px) 50vw, (max-width:1100px) 33vw, 300px';
          run.push(it); n++; var k = sim.indexOf(Math.min.apply(null, sim)); sim[k] += ratio(it) + 0.12;
        }
      });
      flush();
      jw.innerHTML = ''; jw.appendChild(frag); evenUp();
    };
    /* 每段瀑布流的欄底對齊：較短的欄把差距平均分給欄內每張照片（裁切 object-fit），每張只多一點點 */
    var evenUp = function () {
      [].forEach.call(jw.querySelectorAll('.masonry'), function (b) {
        var cs = [].slice.call(b.children);
        [].forEach.call(b.querySelectorAll('figure'), function (fg) { fg.style.height = ''; fg.classList.remove('fill'); });
        for (var pass = 0; pass < 4; pass++) {   // 拉高一欄可能影響鄰欄量測，重複到全部齊為止
        var hs = cs.map(function (c) { return c.getBoundingClientRect().height; }), mx = Math.max.apply(null, hs), changed = false;
        cs.forEach(function (c, i) {
          var d = mx - hs[i]; if (d < 2) return; changed = true;
          var fgs = [].slice.call(c.querySelectorAll('figure')), hh = fgs.map(function (fg) { return fg.getBoundingClientRect().height; });
          var tot = hh.reduce(function (x, y) { return x + y; }, 0); if (!tot) return;
          fgs.forEach(function (fg, k) { fg.style.height = (hh[k] + d * hh[k] / tot) + 'px'; fg.classList.add('fill'); });
        });
        if (!changed) break;
        }
      });
    };
    jlayout();
    addEventListener('load', evenUp); if (document.fonts && document.fonts.ready) document.fonts.ready.then(evenUp);
    var ev; jw.addEventListener('load', function () { clearTimeout(ev); ev = setTimeout(evenUp, 120); }, true);   // 延遲載入的照片若實際比例和標記不同，載入後再對齊一次
    var jareas = $('areas'); if (jareas) jareas.addEventListener('areachange', jlayout);
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (cols() !== lastK) jlayout(); else evenUp(); }, 150); });
  }
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
      q('.sv-av').style.backgroundImage = 'url(/img/story-avatar.jpg)';
      q('.sv-name').textContent = st.label;
      q('.sv-time').textContent = ago(st.date);
      q('.sv-text').textContent = it.text; q('.sv-text').hidden = !it.text;
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

  /* 國家頁旅行地圖：縮小看國家、放大看城市 */
  var mapEl = $('tripmap'), mapData = $('mapData');
  if (mapEl && mapData) {
    var startMap = function () {
      if (!window.L) return setTimeout(startMap, 120);
      var D = JSON.parse(mapData.textContent), L = window.L;
      var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      var map = L.map(mapEl, { scrollWheelZoom: false, worldCopyJump: true, zoomSnap: 1, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 14,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      var pin = function (n, cls, label) {
        var size = cls === 'country' ? Math.min(64, 34 + n * 1.6) : Math.min(46, 26 + n * 3);
        return L.divIcon({ className: 'tm-pin ' + cls, iconSize: [size, size], iconAnchor: [size / 2, size / 2],
          html: '<span class="n">' + n + '</span>' + (label ? '<span class="lb">' + esc(label) + '</span>' : '') });
      };
      /* 國家層：位置取該國城市的平均 */
      var countryLayer = L.layerGroup(), all = [];
      /* 城市層：靠太近的城市自動合併成一顆，數字是篇數合計，點了放大 */
      var cityLayer = L.markerClusterGroup ? L.markerClusterGroup({
        maxClusterRadius: 44, showCoverageOnHover: false, spiderfyOnMaxZoom: true, zoomToBoundsOnClick: true,
        iconCreateFunction: function (cl) {
          var n = cl.getAllChildMarkers().reduce(function (a, m) { return a + (m.options.posts || 0); }, 0);
          return pin(n, 'city cluster');
        }
      }) : L.layerGroup();
      /* 國家太近會疊在一起：縮小時把梵蒂岡併進義大利，放大到城市層再分開 */
      var MERGE = { Vatican: 'Italy' };
      var groups = [];
      D.countries.forEach(function (c) {
        var host = MERGE[c.r];
        if (host) return;
        var members = [c].concat(D.countries.filter(function (x) { return MERGE[x.r] === c.r; }));
        groups.push({ r: members.map(function (m) { return m.r; }), zh: members.map(function (m) { return m.zh; }).join('・'), n: members.reduce(function (a, m) { return a + m.n; }, 0) });
      });
      groups.forEach(function (c) {
        var cs = D.cities.filter(function (x) { return c.r.indexOf(x.r) > -1; });
        if (!cs.length) return;
        var lat = cs.reduce(function (a, x) { return a + x.lat; }, 0) / cs.length;
        var lng = cs.reduce(function (a, x) { return a + x.lng; }, 0) / cs.length;
        var bounds = L.latLngBounds(cs.map(function (x) { return [x.lat, x.lng]; }));
        L.marker([lat, lng], { icon: pin(c.n, 'country', c.zh), title: c.zh + '，' + c.n + ' 篇', keyboard: true })
          .on('click', function () { map.flyToBounds(bounds.pad(cs.length > 1 ? 0.35 : 0), { maxZoom: cs.length > 1 ? 9 : 8, duration: 0.8 }); })
          .addTo(countryLayer);
      });
      /* 城市層：點開列出文章 */
      D.cities.forEach(function (c) {
        all.push([c.lat, c.lng]);
        var html = '<div class="tm-pop"><p class="tm-h"><b>' + esc(c.zh) + '</b><span>' + esc(c.en) + '・' + c.posts.length + ' 篇</span></p>' +
          c.posts.map(function (p) {
            return '<a class="tm-item" href="' + p.u + '">' + (p.img ? '<img src="' + p.img + '" alt="" loading="lazy">' : '<i class="tm-ph"></i>') +
              '<span><em>' + esc(p.cat) + '</em>' + esc(p.t) + '</span></a>';
          }).join('') + '</div>';
        L.marker([c.lat, c.lng], { icon: pin(c.posts.length, 'city', c.zh), title: c.zh, keyboard: true, posts: c.posts.length })
          .bindPopup(html, { maxWidth: 280, minWidth: 220, autoPanPadding: [20, 60] })
          .addTo(cityLayer);
      });
      var CITY_ZOOM = 5;
      var sync = function () {
        var z = map.getZoom();
        if (z >= CITY_ZOOM) { if (map.hasLayer(countryLayer)) map.removeLayer(countryLayer); if (!map.hasLayer(cityLayer)) map.addLayer(cityLayer); }
        else { if (map.hasLayer(cityLayer)) map.removeLayer(cityLayer); if (!map.hasLayer(countryLayer)) map.addLayer(countryLayer); }
        mapEl.classList.toggle('show-labels', z >= 7);
      };
      map.on('zoomend', sync);
      map.fitBounds(L.latLngBounds(all).pad(0.08), { maxZoom: 3 });
      if (map.getZoom() >= CITY_ZOOM) map.setZoom(CITY_ZOOM - 1);
      sync();
      /* 點一下地圖才開滾輪縮放，避免捲頁面時被地圖卡住 */
      map.once('focus click', function () { map.scrollWheelZoom.enable(); });
      setTimeout(function () { map.invalidateSize(); }, 300);
    };
    startMap();
  }

  /* 首屏輪播：不複製投影片（iOS Safari 對超寬圖層會漏畫，複製的頭尾變空白），
     改成「旋轉 DOM」：目前這張永遠排在中間，換頁動畫結束後把頭尾那張搬到另一端，兩邊永遠有鄰居可滑 */
  var track = $('track');
  if (track) {
    var N = track.children.length, M = Math.floor(N / 2), c = 0, timer, settle, count = $('count');
    var prev = $('prev'), next = $('next'), wrap = track.parentElement;
    var place = function (animate, dx) {
      track.style.transition = animate ? '' : 'none';
      var s = track.children[c], gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      var xx = wrap.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2) + (dx || 0);
      track.style.transform = 'translateX(' + xx + 'px)';
      var peek = (wrap.clientWidth - s.offsetWidth) / 2 - gap - s.offsetWidth, bw = prev.offsetWidth;
      var ax = peek >= bw + 16 ? (peek - bw) / 2 : 10;
      prev.style.left = ax + 'px'; next.style.right = ax + 'px';
      [].forEach.call(track.children, function (el, k) { el.classList.toggle('on', k === c); });
      if (count) count.textContent = (+s.getAttribute('data-i') + 1) + ' / ' + N;
    };
    var normalize = function () {
      clearTimeout(settle);
      if (c === M) return;
      while (c > M) { track.appendChild(track.firstElementChild); c--; }
      while (c < M) { track.insertBefore(track.lastElementChild, track.firstElementChild); c++; }
      place(false); void track.offsetWidth;
    };
    var go = function (d) { normalize(); c += d; place(true); settle = setTimeout(normalize, 900); };
    track.addEventListener('transitionend', function (e) { if (e.target === track) normalize(); });
    var auto = function () { clearInterval(timer); timer = setInterval(function () { if (!document.hidden) go(1); }, 3000); };   // Nomo 指定：每 3 秒往左換一篇
    prev.onclick = function () { go(-1); auto(); };
    next.onclick = function () { go(1); auto(); };
    track.addEventListener('mouseenter', function () { clearInterval(timer); });
    track.addEventListener('mouseleave', auto);
    wrap.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') prev.click(); if (e.key === 'ArrowRight') next.click(); });

    /* 觸控滑動：水平拖曳超過 40px 換頁；有拖曳就不觸發點擊 */
    var sx = 0, sy = 0, dx = 0, dragging = false, moved = false;
    track.addEventListener('touchstart', function (e) { normalize(); sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; dragging = true; moved = false; clearInterval(timer); }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      dx = e.touches[0].clientX - sx; var dy = e.touches[0].clientY - sy;
      if (!moved && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }   // 直向捲動交還給頁面
      if (Math.abs(dx) > 8) { moved = true; place(false, dx); }
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (moved) { if (dx < -40) go(1); else if (dx > 40) go(-1); else place(true); }
      dragging = false; auto();
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

    addEventListener('resize', function () { place(false); });
    addEventListener('load', function () { place(false); });
    normalize(); place(false); auto();
  }
})();
