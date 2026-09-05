(() => {
  'use strict';

  const API = window.COCHECIERTO_API || '/api';
  const shownKey = 'cc_exit_feedback_shown_at';
  const completedKey = 'cc_exit_feedback_completed';
  const sessionKey = 'cc_feedback_session';
  const day = 24 * 60 * 60 * 1000;
  const getSessionId = () => {
    let value = sessionStorage.getItem(sessionKey);
    if (!value) { value = crypto.randomUUID(); sessionStorage.setItem(sessionKey, value); }
    return value;
  };
  const device = () => matchMedia('(max-width: 640px)').matches ? 'mobile' : matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop';
  const recentlyHandled = () => Boolean(localStorage.getItem(completedKey)) || Date.now() - Number(localStorage.getItem(shownKey) || 0) < 30 * day;
  const hasReceivedValue = () => Boolean(window.ccReportCompleted || document.querySelector('#screen .card h2, #screen .result, #screen [data-result]'));
  const source = () => new URLSearchParams(location.search).get('utm_source') || null;
  const show = () => {
    if (recentlyHandled() || !hasReceivedValue() || document.querySelector('#cc-exit-feedback') || document.visibilityState !== 'visible') return;
    localStorage.setItem(shownKey, String(Date.now()));
    const modal = document.createElement('dialog');
    modal.id = 'cc-exit-feedback';
    modal.innerHTML = '<form method="dialog" class="cc-feedback-card"><button type="submit" class="cc-feedback-close" value="close" aria-label="Cerrar">×</button><p class="cc-feedback-kicker">Versión beta</p><h2>Antes de irte, ¿te ha ayudado CocheCierto a entender mejor qué coche buscar?</h2><p>Tu opinión nos ayuda a decidir qué mejorar.</p><div class="cc-feedback-actions"><button type="button" data-usefulness="helpful">Sí, me ha ayudado</button><button type="button" data-usefulness="uncertain">Tengo algunas dudas</button><button type="button" data-usefulness="not_yet">Todavía no</button><button type="submit" value="close" class="cc-feedback-secondary">Ahora no</button></div></form>';
    document.body.append(modal);
    modal.showModal();
    const form = modal.querySelector('.cc-feedback-card');
    form.addEventListener('submit', (event) => { if (!event.submitter?.value) event.preventDefault(); });
    modal.querySelectorAll('[data-usefulness]').forEach((button) => button.addEventListener('click', () => showReasons(modal, button.dataset.usefulness)));
    modal.addEventListener('close', () => modal.remove(), { once: true });
  };
  const showReasons = (modal, usefulness) => {
    const title = usefulness === 'helpful' ? '¿Qué parte te resultó más útil?' : usefulness === 'uncertain' ? '¿Qué podríamos mejorar?' : '¿Qué esperabas encontrar?';
    const options = usefulness === 'helpful'
      ? [['understand_budget', 'Entender qué coche puedo permitirme'], ['compare_options', 'Saber qué debo comparar'], ['check_vehicle', 'Saber qué debo comprobar'], ['personal_report', 'El informe personalizado'], ['other', 'Otra cosa']]
      : [['clearer_explanation', 'Una explicación más clara'], ['more_vehicle_info', 'Más información sobre los coches'], ['concrete_recommendations', 'Recomendaciones más concretas'], ['specific_vehicle', 'Poder analizar un coche específico'], ['assisted_search', 'Ayuda para encontrar coches'], ['other', 'Otro motivo']];
    const form = modal.querySelector('.cc-feedback-card');
    const optionsHtml = options.map(([value, label]) => '<label class="cc-feedback-option"><input type="radio" name="feedback-reason" value="' + value + '"> ' + label + '</label>').join('');
    form.innerHTML = '<button type="submit" class="cc-feedback-close" value="close" aria-label="Cerrar">×</button><p class="cc-feedback-kicker">Una pregunta más</p><h2>' + title + '</h2><div class="cc-feedback-reasons">' + optionsHtml + '</div><textarea maxlength="300" placeholder="Comentario opcional (máximo 300 caracteres)" aria-label="Comentario opcional"></textarea><button type="button" id="cc-feedback-send">Enviar opinión</button>';
    form.querySelector('#cc-feedback-send').addEventListener('click', async () => {
      const reason = form.querySelector('input[name="feedback-reason"]:checked')?.value || null;
      const comment = form.querySelector('textarea').value.trim();
      const send = form.querySelector('#cc-feedback-send');
      send.disabled = true;
      try {
        const response = await fetch(API + '/exit-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), page: location.pathname, device: device(), source: source(), completed_report: Boolean(window.ccReportCompleted), usefulness, reason, comment }) });
        if (!response.ok) throw new Error('feedback');
        localStorage.setItem(completedKey, 'true');
        form.innerHTML = '<p class="cc-feedback-kicker">Gracias</p><h2>Opinión recibida.</h2><p>Nos ayudará a mejorar CocheCierto.</p>';
        setTimeout(() => modal.close(), 1200);
      } catch {
        send.disabled = false;
        send.textContent = 'No se pudo enviar · Reintentar';
      }
    });
  };
  let interacted = false;
  ['pointerdown', 'keydown', 'scroll'].forEach((event) => addEventListener(event, () => { interacted = true; }, { once: true, passive: true }));
  setTimeout(() => {
    if (interacted) addEventListener('mouseout', (event) => { if (event.clientY <= 0) show(); }, { once: true });
  }, 25000);
})();
