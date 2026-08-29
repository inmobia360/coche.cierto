/**
 * CocheCierto - Scripts interactivos de la Landing
 */
(function () {
  'use strict';

  const quickSubmit = document.querySelector('#heroQuickSubmit');
  if (quickSubmit) {
    quickSubmit.addEventListener('click', () => {
      const intent = document.querySelector('#quickIntent')?.value || 'buy';
      const use = document.querySelector('#quickUse')?.value || 'mixed';
      const budget = document.querySelector('#quickBudget')?.value || '5-8';
      
      const query = new URLSearchParams({ intent, use, budget, skipIntro: '1' }).toString();
      window.location.href = './valorador/?' + query;
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
