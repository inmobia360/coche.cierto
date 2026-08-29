/**
 * CocheCierto - Scripts interactivos de la Landing
 */
(function () {
  'use strict';

  // Mini-form selección de objetivo
  const miniForm = document.querySelector('#miniForm');
  if (miniForm) {
    const choices = miniForm.querySelectorAll('.mini-choice');
    let selectedIntent = 'change';

    choices.forEach(btn => {
      btn.addEventListener('click', () => {
        choices.forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        selectedIntent = btn.dataset.intent || 'buy';
      });
    });

    const startBtn = document.querySelector('#miniStart');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        window.location.href = './valorador/?intent=' + encodeURIComponent(selectedIntent);
      });
    }
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
