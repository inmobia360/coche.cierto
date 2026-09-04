(function () {
  'use strict';
  const requestBox = document.querySelector('#offerRequest');
  const panel = document.querySelector('#offerFormPanel');
  const form = document.querySelector('#offerForm');
  const feedback = document.querySelector('#offerFeedback');
  const api = window.COCHECIERTO_API || (location.hostname.endsWith('cochecierto.com') ? 'https://api.cochecierto.com/api' : '/api');
  const token = new URLSearchParams(window.location.search).get('token');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const emit = (name) => document.dispatchEvent(new CustomEvent('cochecierto:event', { detail: { name, source_page: 'dealer-offer', version: 'p2-v2' } }));
  const message = (title, body) => { requestBox.innerHTML = `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p>`; };
  if (!/^[a-f0-9]{64}$/i.test(token || '')) { message('Invitación no disponible', 'El enlace no es válido o está incompleto.'); emit('dealer_invite_invalid'); return; }
  fetch(`${api}/purchase-offer-invites/${encodeURIComponent(token)}`).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.message || 'unavailable'); return payload; }).then((payload) => {
    const request = payload.request || {}, profile = request.profile || {};
    const rows = [['Zona aproximada', request.area], ['Radio', `${request.radius || 'Por concretar'} km`], ['Categoría', profile.category], ['Carrocería', profile.body], ['Uso', profile.usage], ['Kilómetros', profile.kilometres], ['Personas', profile.people], ['Presupuesto', profile.budget], ['Prioridad', profile.priority], ['ZBE', profile.zbe]].filter(([, value]) => value);
    requestBox.innerHTML = `<h2>Necesidad autorizada</h2><p>Prepara una propuesta ajustada a estos datos. Lo que no aparece aquí no está autorizado para compartirlo.</p><dl>${rows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>`;
    panel.hidden = false;
    if (!payload.offersEnabled) { const submit = form.querySelector('button[type="submit"]'); submit.disabled = true; submit.setAttribute('aria-disabled', 'true'); feedback.textContent = 'La recepción digital está preparada, pero aún no está activa para este piloto.'; }
    emit('dealer_invite_viewed');
  }).catch((error) => { message('Invitación no disponible', error.message === 'unavailable' ? 'Ha caducado, se ha retirado o no está activa.' : 'No se ha podido consultar la invitación.'); emit('dealer_invite_unavailable'); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); feedback.textContent = 'Enviando para revisión…';
    const offer = Object.fromEntries(new FormData(form).entries());
    try { const response = await fetch(`${api}/purchase-offer-invites/${encodeURIComponent(token)}/offers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offer }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || 'No disponible'); feedback.textContent = `Oferta recibida para revisión (versión ${payload.version}).`; form.reset(); emit('dealer_offer_submitted'); } catch (error) { feedback.textContent = error.message === 'La recepción de ofertas aún no está activa.' ? error.message : 'No se ha podido registrar la oferta. No se ha enviado al comprador.'; emit('dealer_offer_submission_failed'); }
  });
})();
