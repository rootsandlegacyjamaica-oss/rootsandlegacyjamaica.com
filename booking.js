(function () {
  var el = document.getElementById('cal-booking-iframe');
  var hint = document.getElementById('cal-booking-setup-hint');
  var wrap = document.querySelector('.booking-embed-wrap');
  var url = typeof window.CAL_BOOKING_URL === 'string' ? window.CAL_BOOKING_URL.trim() : '';

  if (!url) {
    if (hint) hint.hidden = false;
    if (wrap) wrap.style.display = 'none';
    return;
  }

  if (hint) hint.hidden = true;
  if (wrap) wrap.style.display = '';
  if (!url.includes('embed=')) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'embed=true';
  }
  if (el) el.src = url;
})();
