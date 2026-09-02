(function () {
  'use strict';

  function emit(name, details) {
    var payload = Object.assign({
      event: name,
      page: window.location.pathname,
      occurred_at: new Date().toISOString()
    }, details || {});

    window.dispatchEvent(new CustomEvent('cc:conversion', { detail: payload }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var downloads = document.querySelectorAll('[data-pdf-download]');
    if (!downloads.length) return;

    downloads.forEach(function (download) {
      var guide = download.getAttribute('data-pdf-name') || 'guide-pdf';
      emit('pdf_view', { guide: guide });

      download.addEventListener('click', function () {
        emit('pdf_download', { guide: guide });
      });
    });

    document.querySelectorAll('[data-pdf-to-valuation]').forEach(function (valuation) {
      valuation.addEventListener('click', function () {
        var guide = valuation.getAttribute('data-pdf-name') || 'guide-pdf';
        emit('pdf_to_valuation_click', { guide: guide });
      });
    });
  });
}());
