/**
 * CocheCierto - Scripts interactivos de la Landing
 */
(function () {
  'use strict';

  // Barra de Valoración Rápida en Hero
  const quickSubmit = document.querySelector('#heroQuickSubmit');
  if (quickSubmit) {
    quickSubmit.addEventListener('click', () => {
      const intent = document.querySelector('#quickIntent')?.value || 'buy';
      const budget = document.querySelector('#quickBudget')?.value || '12000';
      const fuel = document.querySelector('#quickFuel')?.value || 'any';
      
      const query = new URLSearchParams({ intent, budget, fuel }).toString();
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
