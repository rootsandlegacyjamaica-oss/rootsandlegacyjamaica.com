(function () {
  var hint = document.getElementById('cal-booking-setup-hint');
  var wrap = document.querySelector('.booking-embed-wrap');
  var el = document.getElementById('booking-cal-inline');

  function calLink() {
    var explicit = typeof window.CAL_CAL_LINK === 'string' ? window.CAL_CAL_LINK.trim() : '';
    if (explicit) return explicit;
    var raw = typeof window.CAL_BOOKING_URL === 'string' ? window.CAL_BOOKING_URL.trim() : '';
    if (!raw) return '';
    try {
      return new URL(raw).pathname.replace(/^\/+/, '');
    } catch (e) {
      return raw.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
    }
  }

  function hex(v, fallback) {
    var s = (v || fallback || '').toString().trim();
    return s.charAt(0) === '#' ? s : '#' + s.replace(/^#/, '');
  }

  var link = calLink();
  if (!link) {
    if (hint) hint.hidden = false;
    if (wrap) wrap.style.display = 'none';
    return;
  }

  if (hint) hint.hidden = true;
  if (wrap) wrap.style.display = '';

  var ns = window.CAL_EMBED_NAMESPACE || 'portlandia';
  var theme = window.CAL_EMBED_THEME || 'light';
  var brandLight = hex(window.CAL_EMBED_BRAND_LIGHT, '1f4d3a');
  var brandDark = hex(window.CAL_EMBED_BRAND_DARK, 'c8a96a');

  (function (C, A, L) {
    var p = function (a, ar) {
      a.q.push(ar);
    };
    var d = C.document;
    C.Cal =
      C.Cal ||
      function () {
        var cal = C.Cal;
        var ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          var api = function () {
            p(api, arguments);
          };
          var namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  Cal('init', ns, { origin: 'https://app.cal.com' });

  Cal.ns[ns]('inline', {
    elementOrSelector: '#booking-cal-inline',
    config: {
      layout: 'month_view',
      useSlotsViewOnSmallScreen: 'true',
      theme: theme,
    },
    calLink: link,
  });

  Cal.ns[ns]('ui', {
    theme: theme,
    cssVarsPerTheme: {
      light: { 'cal-brand': brandLight },
      dark: { 'cal-brand': brandDark },
    },
    hideEventTypeDetails: false,
    layout: 'month_view',
  });
})();
