/**
 * CocheCierto - Scripts interactivos de la Landing
 */
(function () {
  'use strict';

  let selectedIntent = 'change';

  const pillButtons = document.querySelectorAll('.hero-pill-btn');
  pillButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pillButtons.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      selectedIntent = btn.dataset.intent || 'change';
    });
  });

  const quickSubmit = document.querySelector('#heroQuickSubmit');
  if (quickSubmit) {
    quickSubmit.addEventListener('click', () => {
      window.location.href = './valorador/?intent=' + encodeURIComponent(selectedIntent) + '&skipIntro=1';
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
