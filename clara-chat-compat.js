(() => {
  'use strict';
  const panel = document.querySelector('#clara-panel');
  if (!panel || panel.dataset.compatReady) return;
  panel.dataset.compatReady = 'true';
  const API = window.COCHECIERTO_API || 'https://api.cochecierto.com/api';
  const path = location.pathname;
  const feedback = document.createElement('div');
  feedback.className = 'clara-question clara-feedback';
  feedback.hidden = true;
  feedback.innerHTML = '<p><strong>¿Te está ayudando?</strong></p><div class="clara-buttons"><button type="button" data-feedback="helpful">Sí, lo entiendo mejor</button><button type="button" data-feedback="uncertain">Tengo una duda</button><button type="button" data-feedback="not_yet">Todavía no</button></div><small class="clara-note" role="status"></small>';
  panel.append(feedback);
  const showFeedback = () => { feedback.hidden = false; };
  const observer = new MutationObserver(() => {
    if (panel.querySelector('[data-href]')) showFeedback();
  });
  observer.observe(panel, { childList: true, subtree: true });
  feedback.querySelectorAll('[data-feedback]').forEach((button) => button.addEventListener('click', async () => {
    const note = feedback.querySelector('.clara-note');
    try {
      const response = await fetch(API + '/exit-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: crypto.randomUUID(), page: path, device: matchMedia('(max-width:640px)').matches ? 'mobile' : 'desktop', usefulness: button.dataset.feedback, reason: 'clara_chat' }) });
      if (!response.ok) throw new Error('feedback');
      note.textContent = 'Gracias. Tu respuesta queda registrada.';
    } catch { note.textContent = 'No se pudo guardar ahora. Puedes intentarlo más tarde.'; }
  }));
})();
