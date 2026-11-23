/* Lightweight GA4 events; public measurement ID is supplied by the build. */
(function () {
  'use strict';
  var tag = document.currentScript, id = tag && tag.dataset.measurement;
  if (!id || !/^G-[A-Z0-9]+$/.test(id) || location.hostname !== 'nomowho.com' || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  var page = location.origin + location.pathname;
  var referrer = ''; try { var ref = new URL(document.referrer); referrer = ref.origin + ref.pathname; } catch (_) {}
  gtag('js', new Date());
  gtag('config', id, { send_page_view: false, page_location: page, page_referrer: referrer, allow_google_signals: false, allow_ad_personalization_signals: false });
  function event(name, values) { gtag('event', name, Object.assign({ page_location: page, page_referrer: referrer }, values || {})); }
  event('page_view', { page_title: document.title });
  // Start after the first render, without competing with the main photo request.
  var loaded = false;
  function load() { if (loaded) return; loaded = true; var script = document.createElement('script'); script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(script); }
  var afterLoad = function () { requestAnimationFrame(function () { requestAnimationFrame(function () { if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 }); else setTimeout(load, 1500); }); }); };
  if (document.readyState === 'complete') afterLoad(); else addEventListener('load', afterLoad, { once: true });
  addEventListener('pagehide', load, { once: true });
  var body = document.querySelector('article .body'), sent = {}, queued = false;
  var source = location.pathname;
  function depth() {
    queued = false; if (!body || document.visibilityState === 'hidden') return;
    var rect = body.getBoundingClientRect(), ratio = Math.max(0, Math.min(1, (innerHeight - rect.top) / rect.height));
    [25, 50, 75, 100].forEach(function (n) { if (ratio * 100 >= n && !sent[n]) { sent[n] = true; event('article_depth_' + n, { article_path: source, percent_scrolled: n }); } });
  }
  addEventListener('scroll', function () { if (!queued && body) { queued = true; requestAnimationFrame(depth); } }, { passive: true });
  addEventListener('resize', depth, { passive: true }); depth();
  function destination(a) { try { var u = new URL(a.href); return u.origin + u.pathname; } catch (_) { return ''; } }
  var recommendations = [].slice.call(document.querySelectorAll('.related-reading a[href], .more a.card[href]'));
  var seen = new WeakSet(), timers = new WeakMap();
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = entry.target; clearTimeout(timers.get(a));
        if (!entry.isIntersecting || entry.intersectionRatio < .5 || seen.has(a)) return;
        timers.set(a, setTimeout(function () { if (document.visibilityState !== 'hidden') { seen.add(a); event('recommendation_view', { article_path: source, link_url: destination(a), link_position: recommendations.indexOf(a) + 1 }); observer.unobserve(a); } }, 1000));
      });
    }, { threshold: [.5] });
    recommendations.forEach(function (a) { observer.observe(a); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (!a) return;
    if (recommendations.indexOf(a) !== -1) event('recommendation_click', { article_path: source, link_url: destination(a), link_position: recommendations.indexOf(a) + 1 });
    try { var u = new URL(a.href); if (u.hostname === 'instagram.com' || u.hostname === 'www.instagram.com') event('instagram_click', { article_path: source, link_url: destination(a) }); } catch (_) {}
  });
}());
