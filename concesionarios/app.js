(function () {
  'use strict';

  const form = document.querySelector('#dealerForm');
  const results = document.querySelector('#dealerResults');
  const sheet = document.querySelector('#dealerSheet');
  const demoPlaces = [
    { name: 'Opción local de prueba · Centro', distance: 2.4, address: 'Resultado simulado para validar el recorrido' },
    { name: 'Opción local de prueba · Norte', distance: 6.8, address: 'Resultado simulado para validar el recorrido' },
    { name: 'Opción local de prueba · Sur', distance: 9.7, address: 'Resultado simulado para validar el recorrido' }
  ];

  let profile = null;
  try { profile = JSON.parse(sessionStorage.getItem('cochecierto:dealer-profile') || 'null'); } catch (_) { profile = null; }
  const profileFields = [
    ['category', 'Categoría'], ['body', 'Carrocería'], ['usage', 'Uso principal'], ['kilometres', 'Kilómetros declarados'],
    ['people', 'Personas habituales'], ['budget', 'Presupuesto declarado'], ['priority', 'Prioridad'], ['zbe', 'ZBE o restricciones']
  ];
  let activeProfile = { ...(profile || {}) };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent('cochecierto:event', { detail: { name, source_page: 'dealer-search', version: 'p0-v2', ...detail } }));
  }

  if (profile) {
    const context = document.createElement('p');
    context.className = 'dealer-context';
    context.innerHTML = `<strong>Tu guía:</strong> ${escapeHtml(profile.category || 'necesidad de movilidad')} · ${escapeHtml(profile.body || 'categoría por concretar')}. La ficha usará tus necesidades, no una marca o modelo.`;
    document.querySelector('#search-title').after(context);
  }

  function pdfText(value) {
    return String(value || 'Por concretar').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').slice(0, 108);
  }

  function downloadPdf(area, radius) {
    const rows = [
      'COCHECIERTO | FICHA DE NECESIDADES PARA SOLICITAR OFERTA', `Zona aproximada: ${area} | Radio: ${radius} km`, '',
      'OBJETIVO DE LA PETICION', 'Preparar una oferta ajustada a necesidades reales y evitar extras innecesarios.', 'No se solicita una marca, modelo o precio concreto.', '',
      'NECESIDADES DECLARADAS', `Categoria: ${pdfText(activeProfile?.category)}`, `Carroceria: ${pdfText(activeProfile?.body)}`, `Uso principal: ${pdfText(activeProfile?.usage)}`, `Kilometros declarados: ${pdfText(activeProfile?.kilometres)}`, `Personas habituales: ${pdfText(activeProfile?.people)}`, `Presupuesto declarado: ${pdfText(activeProfile?.budget)}`, `Prioridad: ${pdfText(activeProfile?.priority)}`, `ZBE o restricciones: ${pdfText(activeProfile?.zbe)}`, '',
      'DATOS QUE DEBE INCLUIR LA OFERTA', '- Vehiculo propuesto, version, motor y equipamiento incluido.', '- Precio final desglosado, impuestos y gastos adicionales.', '- Disponibilidad, plazo de entrega y condiciones de reserva.', '- Garantia, historial, kilometraje y estado si es usado.', '- Financiacion solo si se solicita: cuota, TAE, plazo y coste total.', '- Extras separados de lo necesario; pendientes claramente indicados.', '',
      'CocheCierto | Documento orientativo. No es una oferta, tasacion, garantia ni asesoramiento financiero.'
    ];
    const escapePdf = (value) => String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const content = ['BT', '/F1 9 Tf', '50 790 Td', ...rows.map((row, index) => `(${escapePdf(row)}) Tj${index < rows.length - 1 ? ' 0 -13 Td' : ''}`), 'ET'].join('\n');
    const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
    let output = '%PDF-1.4\n'; const offsets = [0];
    objects.forEach((object, index) => { offsets[index + 1] = output.length; output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const start = output.length;
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([output], { type: 'application/pdf' })); const link = document.createElement('a');
    link.href = url; link.download = 'ficha-oferta-ajustada-cochecierto.pdf'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); emit('dealer_pdf_downloaded', {});
  }

  function render(area, radius, category) {
    const list = demoPlaces.filter((place) => place.distance <= radius).sort((a, b) => a.distance - b.distance);
    results.hidden = false;
    results.innerHTML = `<h2>Opciones de prueba en ${escapeHtml(area)} · hasta ${radius} km</h2><p class="dealer-note">Modo demo: estas tarjetas no representan negocios reales ni disponibilidad confirmada. La búsqueda real se activará solo después de revisar proveedor, licencia, privacidad y atribución.</p>${list.length ? list.map((place, index) => `<article class="dealer-card"><h3>${escapeHtml(place.name)}</h3><p>${place.distance.toLocaleString('es-ES')} km · ${escapeHtml(place.address)}</p><small>Categoría seleccionada: ${escapeHtml(category)} · resultado simulado</small><div class="dealer-card-actions"><button type="button" data-channel="Ficha local" data-position="${index}">Preparar ficha</button></div></article>`).join('') : '<p>No hay resultados demo en este radio. Prueba a ampliarlo.</p>'}<section class="dealer-preview" aria-labelledby="dealer-preview-title"><h2 id="dealer-preview-title">Revisa y corrige tu ficha</h2><p class="dealer-note">Puedes corregir lo incompleto sin repetir el diagnóstico. Solo se incluirán estos campos; no se guardan nombre, email, teléfono ni ubicación exacta.</p><div class="dealer-profile-grid">${profileFields.map(([key, label]) => `<label>${label}<input data-profile-key="${key}" maxlength="120" value="${escapeHtml(activeProfile[key] || '')}" placeholder="Por concretar"></label>`).join('')}</div></section><div class="dealer-results-actions"><button class="button secondary" id="makeDealerSheet" type="button">Descargar ficha para enviar a concesionarios (PDF)</button><p class="dealer-note">Se descarga en tu dispositivo para que tú decidas con quién compartirla.</p><label class="dealer-consent"><input id="saveRequestConsent" type="checkbox"> Acepto guardar esta ficha privada para poder revisarla o retirarla.</label><label class="dealer-consent"><input id="manualShareConsent" type="checkbox"> Acepto compartir manualmente la ficha con destinatarios que yo elija; no se enviará automáticamente.</label><p class="dealer-note">Recibir ofertas y autorizar contacto con un concesionario son decisiones posteriores y permanecen desactivadas en esta fase.</p><button class="button secondary" id="createPrivateRequest" type="button">Crear enlace privado</button><p id="privateRequestFeedback" class="dealer-note" aria-live="polite"></p></div>`;
    emit('dealer_results_viewed', { radius, result_count: list.length, category });
    results.querySelectorAll('[data-profile-key]').forEach((input) => input.addEventListener('input', () => {
      activeProfile[input.dataset.profileKey] = input.value.trim().slice(0, 120);
      try { sessionStorage.setItem('cochecierto:dealer-profile', JSON.stringify(activeProfile)); } catch (_) {}
    }));
    results.querySelectorAll('[data-channel]').forEach((button) => button.addEventListener('click', () => emit('dealer_contact_click', { channel: button.dataset.channel, dealer_position: Number(button.dataset.position) + 1 })));
    document.querySelector('#makeDealerSheet').addEventListener('click', () => {
      sheet.innerHTML = `<p class="eyebrow">CocheCierto · ficha de necesidades</p><h1>Búsqueda de vehículo en ${escapeHtml(area)}</h1><p>Zona aproximada: ${escapeHtml(area)} · Radio: ${radius} km</p><h2>Qué necesito</h2><p>Solicito opciones que encajen con mi uso, necesidades de espacio, presupuesto total y prioridades declaradas en mi guía de compra.</p><h2>Qué debe confirmar el vendedor</h2><ul><li>Disponibilidad y características por escrito.</li><li>Historial, documentación, garantía y condiciones.</li><li>Costes iniciales y elementos incluidos.</li><li>Posibilidad de prueba e inspección independiente.</li></ul><p class="dealer-sheet-foot">Esta ficha no recomienda una marca, modelo ni precio concreto. Es una ayuda para explicar necesidades y no constituye una oferta ni una garantía.</p>`;
      sheet.setAttribute('aria-hidden', 'false'); emit('dealer_pdf_started', {}); downloadPdf(area, radius);
    });
    document.querySelector('#createPrivateRequest').addEventListener('click', async () => {
      const consent = document.querySelector('#manualShareConsent');
      const saveConsent = document.querySelector('#saveRequestConsent');
      const feedback = document.querySelector('#privateRequestFeedback');
      if (!saveConsent.checked) { feedback.textContent = 'Confirma primero que aceptas guardar la ficha privada.'; return; }
      if (!consent.checked) { feedback.textContent = 'Confirma por separado que compartirás la ficha manualmente.'; return; }
      activeProfile = Object.fromEntries(profileFields.map(([key]) => [key, document.querySelector(`[data-profile-key="${key}"]`).value.trim().slice(0, 120)]));
      feedback.textContent = 'Guardando la petición privada…';
      try {
        const api = window.COCHECIERTO_API || (location.hostname.endsWith('cochecierto.com') ? 'https://api.cochecierto.com/api' : '/api');
        const response = await fetch(`${api}/purchase-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ area, radius, profile: activeProfile, consent: { saveRequest: true, manualShare: true, receiveOffers: false } }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'No disponible');
        feedback.innerHTML = `Petición creada. Guarda primero tu <a href="${escapeHtml(payload.ownerUrl)}" target="_blank" rel="noopener">enlace de propietario</a>. Después puedes compartir el <a href="${escapeHtml(payload.shareUrl)}" target="_blank" rel="noopener">enlace de solo lectura</a>.<br><button type="button" class="button secondary" id="copyPrivateShare">Copiar enlace de solo lectura</button> <button type="button" class="button secondary" id="sharePrivateRequest">Compartir desde este dispositivo</button>`;
        document.querySelector('#copyPrivateShare').addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(payload.shareUrl); feedback.insertAdjacentHTML('beforeend', '<br>Enlace copiado.'); }
          catch (_) { feedback.insertAdjacentHTML('beforeend', '<br>No se pudo copiar automáticamente; abre el enlace y cópialo manualmente.'); }
        });
        document.querySelector('#sharePrivateRequest').addEventListener('click', async () => {
          if (!navigator.share) { feedback.insertAdjacentHTML('beforeend', '<br>Tu navegador no ofrece compartir directamente; usa el enlace de solo lectura.'); return; }
          try { await navigator.share({ title: 'Petición de necesidades CocheCierto', text: 'Petición anonimizada para preparar una oferta', url: payload.shareUrl }); }
          catch (_) { /* El usuario puede cancelar el diálogo de compartir. */ }
        });
        emit('private_request_created');
      } catch (error) {
        feedback.textContent = error.message === 'Las peticiones privadas aún no están configuradas.' ? error.message : 'No se ha podido guardar la petición. No se ha enviado a ningún concesionario.';
        emit('private_request_creation_failed');
      }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(form); const area = String(data.get('area') || '').trim(); const radius = Number(data.get('radius')) / 1000; const category = String(data.get('category') || 'dealer');
    if (!area || !Number.isFinite(radius)) return; emit('nearby_search_started', { radius, category, mode: 'demo' }); render(area, radius, category);
  });
})();
