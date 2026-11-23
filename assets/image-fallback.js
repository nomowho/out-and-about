/* Independently recover deferred photos if shared interactions fail. */
addEventListener('load', function () {
  function recover(section) {
    section.querySelectorAll('source[data-srcset]').forEach(function (s) { s.srcset = s.dataset.srcset; });
    section.querySelectorAll('img[data-src]').forEach(function (im) { im.loading = 'lazy'; if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src; });
  }
  var series = document.querySelector('.tser'), hero = document.querySelector('.hero #track');
  if (series && series.dataset.imagesReady !== 'true') recover(series);
  if (hero && !hero.classList.contains('images-managed')) recover(hero);
}, { once:true });
