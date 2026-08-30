/**
 * CocheCierto - Scripts interactivos de la Landing
 */
(function () {
  'use strict';

  const quickSubmit = document.querySelector('#heroQuickSubmit');
  if (quickSubmit) {
    quickSubmit.addEventListener('click', () => {
      const intent = document.querySelector('#quickIntent')?.value || 'buy';
      const windowValue = document.querySelector('#quickWindow')?.value || '0-3';
      const use = document.querySelector('#quickUse')?.value || 'mixed';
      
      const query = new URLSearchParams({ intent, window: windowValue, use, skipIntro: '1' }).toString();
      const nextUrl = './valorador/?' + query;
      window.location.href = nextUrl;
    });
  }

  // FAQ Accordion
  document.querySelectorAll('.faq-list details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        document.querySelectorAll('.faq-list details').forEach(other => {
          if (other !== detail && other.open) {
            other.open = false;
          }
        });
      }
    });
  });
})();
