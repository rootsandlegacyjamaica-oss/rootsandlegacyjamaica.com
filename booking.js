(function () {
  var el = document.getElementById('cal-booking-iframe');
  var hint = document.getElementById('cal-booking-setup-hint');
  var wrap = document.querySelector('.booking-embed-wrap');
  var raw = typeof window.CAL_BOOKING_URL === 'string' ? window.CAL_BOOKING_URL.trim() : '';

  if (!raw) {
    if (hint) hint.hidden = false;
    if (wrap) wrap.style.display = 'none';
    return;
  }

  if (hint) hint.hidden = true;
  if (wrap) wrap.style.display = '';

  var url;
  try {
    url = new URL(raw);
  } catch (e) {
    if (el) el.src = raw;
    return;
  }

  if (!url.searchParams.has('embed')) {
    url.searchParams.set('embed', 'true');
  }

  var theme = window.CAL_EMBED_THEME;
  if (theme && !url.searchParams.has('theme')) {
    url.searchParams.set('theme', theme);
  }

  var brand = window.CAL_EMBED_BRAND_COLOR;
  if (brand && !url.searchParams.has('brandColor')) {
    url.searchParams.set('brandColor', String(brand).replace(/^#/, ''));
  }

  if (el) el.src = url.toString();
})();
