const API = window.COCHECIERTO_API || 'http://localhost:3000';
const locked = document.querySelector('#locked');
const app = document.querySelector('#app');
const message = document.querySelector('#message');

const transitions = {
  visitor: ['diagnostic_started', 'withdrawn', 'blocked'], diagnostic_started: ['report_requested', 'withdrawn', 'blocked'],
  report_requested: ['report_verified', 'withdrawn', 'blocked'], report_verified: ['request_draft', 'withdrawn', 'blocked'],
  request_draft: ['request_active', 'withdrawn', 'blocked'], request_active: ['shared_manual', 'withdrawn', 'blocked'],
  shared_manual: ['offer_received', 'withdrawn', 'blocked'], offer_received: ['comparison', 'withdrawn', 'blocked'],
  comparison: ['contact_authorized', 'withdrawn', 'blocked'], contact_authorized: ['visit_requested', 'withdrawn', 'blocked'],
  visit_requested: ['test_requested', 'purchased', 'withdrawn', 'blocked'], test_requested: ['purchased', 'withdrawn', 'blocked'],
  purchased: ['aftercare', 'closed', 'blocked'], aftercare: ['closed', 'blocked']
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
const token = () => document.querySelector('#token').value.trim();
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });
const api = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se ha podido completar la operación.');
  return data;
};

function mountControls() {
  if (document.querySelector('#case-form')) return;
  const dealerPanel = document.querySelector('#dealer-form').closest('.panel');
  const casePanel = document.createElement('section'); casePanel.className = 'panel';
  casePanel.innerHTML = '<h2>Abrir caso interno</h2><p class="muted">Usa identificadores internos ya autorizados; no copies datos personales en notas.</p><form id="case-form"><input name="leadId" inputmode="numeric" placeholder="ID de lead (opcional)"><input name="purchaseRequestId" inputmode="numeric" placeholder="ID de petición (opcional)"><select name="stage"><option value="visitor">Visitante</option><option value="diagnostic_started">Diagnóstico iniciado</option><option value="report_requested">Informe solicitado</option></select><button>Crear caso</button></form>';
  dealerPanel.before(casePanel);
  const taskPanel = document.createElement('section'); taskPanel.className = 'panel';
  taskPanel.innerHTML = '<h2>Programar tarea de acompañamiento</h2><p class="muted">Incluye entrega y servicios posteriores sin iniciar comunicaciones automáticas.</p><form id="task-form"><input name="caseId" required inputmode="numeric" placeholder="ID del caso"><select name="taskType"><option value="documentation">Documentación</option><option value="inspection">Inspección</option><option value="insurance">Seguro</option><option value="transfer">Transferencia</option><option value="delivery">Entrega</option><option value="finance_review">Revisión financiera</option><option value="maintenance">Mantenimiento inicial</option><option value="first_service">Primera revisión</option><option value="warranty">Garantía</option><option value="warranty_claim">Reclamación de garantía</option><option value="followup">Seguimiento</option></select><input name="dueAt" type="datetime-local"><input name="notes" maxlength="500" placeholder="Nota operativa sin datos personales"><button>Crear tarea</button></form>';
  dealerPanel.after(taskPanel);
  const detailPanel = document.createElement('section'); detailPanel.className = 'panel';
  detailPanel.innerHTML = '<h2>Ver trazabilidad de un caso</h2><form id="detail-form"><input name="caseId" required inputmode="numeric" placeholder="ID del caso"><button>Consultar detalle</button></form><div id="case-detail" class="empty">Selecciona un caso para consultar sus eventos, concesionarios asociados y tareas.</div>';
  taskPanel.after(detailPanel);
  const linkPanel = document.createElement('section'); linkPanel.className = 'panel';
  linkPanel.innerHTML = '<h2>Asociar concesionario a un caso</h2><p class="muted">Relaciona un caso con un concesionario registrado sin copiar contactos en el expediente.</p><form id="link-form"><input name="caseId" required inputmode="numeric" placeholder="ID del caso"><input name="dealerId" required inputmode="numeric" placeholder="ID del concesionario"><select name="relationshipState"><option value="candidate">Candidato</option><option value="invited">Invitado</option><option value="responded">Respondió</option><option value="selected">Seleccionado</option><option value="declined">Declinó</option><option value="blocked">Bloqueado</option></select><button>Guardar asociación</button></form>';
  detailPanel.after(linkPanel);
  document.querySelector('#case-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const result = await api('/api/crm/cases', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); message.textContent = `Caso #${result.caseId} creado.`; event.currentTarget.reset(); await load(); } catch (error) { message.textContent = error.message; } });
  document.querySelector('#task-form').addEventListener('submit', async (event) => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); try { const result = await api(`/api/crm/cases/${encodeURIComponent(body.caseId)}/aftercare`, { method: 'POST', body: JSON.stringify(body) }); message.textContent = `Tarea #${result.taskId} creada.`; event.currentTarget.reset(); await load(); } catch (error) { message.textContent = error.message; } });
  document.querySelector('#detail-form').addEventListener('submit', async (event) => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); const target = document.querySelector('#case-detail'); target.textContent = 'Consultando…'; try { const result = await api(`/api/crm/cases/${encodeURIComponent(body.caseId)}`); const item = result.case; target.innerHTML = `<h3>Caso #${item.id} · ${escapeHtml(item.stage)}</h3><p>Origen: ${escapeHtml(item.source)} · Prioridad: ${escapeHtml(item.priority)} · Responsable: ${escapeHtml(item.assignedTo || 'sin asignar')}</p><h4>Eventos</h4>${result.events.length ? `<ul>${result.events.map((event) => `<li>${new Date(event.createdAt).toLocaleString('es-ES')} · ${escapeHtml(event.fromStage || 'inicio')} → ${escapeHtml(event.toStage)} · ${escapeHtml(event.reason || 'sin motivo')}</li>`).join('')}</ul>` : '<p>Sin eventos.</p>'}<h4>Concesionarios asociados</h4>${result.dealers.length ? `<ul>${result.dealers.map((dealer) => `<li>${escapeHtml(dealer.tradeName || dealer.legalName)} · ${escapeHtml(dealer.relationshipState)}</li>`).join('')}</ul>` : '<p>Ninguno.</p>'}<h4>Tareas</h4>${result.tasks.length ? `<ul>${result.tasks.map((task) => `<li>${escapeHtml(task.taskType)} · ${escapeHtml(task.status)}${task.dueAt ? ` · ${new Date(task.dueAt).toLocaleString('es-ES')}` : ''}</li>`).join('')}</ul>` : '<p>Sin tareas.</p>'}`; } catch (error) { target.textContent = error.message; } });
  document.querySelector('#link-form').addEventListener('submit', async (event) => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); try { const result = await api(`/api/crm/cases/${encodeURIComponent(body.caseId)}/dealers`, { method: 'POST', body: JSON.stringify(body) }); message.textContent = `Asociación caso #${result.caseId} · concesionario #${result.dealerId} guardada.`; event.currentTarget.reset(); } catch (error) { message.textContent = error.message; } });
}

function mountCaseMetadata() {
  const form = document.querySelector('#case-form'); if (!form || form.querySelector('[name="priority"]')) return;
  const priority = document.createElement('select'); priority.name = 'priority'; priority.innerHTML = '<option value="normal">Prioridad normal</option><option value="high">Prioridad alta</option><option value="low">Prioridad baja</option>';
  const assignee = document.createElement('input'); assignee.name = 'assignedTo'; assignee.placeholder = 'Responsable interno';
  const nextAction = document.createElement('input'); nextAction.name = 'nextActionAt'; nextAction.type = 'datetime-local';
  form.insertBefore(assignee, form.lastElementChild); form.insertBefore(priority, form.lastElementChild); form.insertBefore(nextAction, form.lastElementChild);
}

async function updateDealerStatus(dealerId, status, dataProcessingStatus) {
  try { await api(`/api/crm/dealers/${dealerId}/status`, { method: 'POST', body: JSON.stringify({ status, dataProcessingStatus, verificationStatus: status === 'verified' ? 'approved' : 'pending_review' }) }); message.textContent = `Estado del concesionario #${dealerId} actualizado.`; await load(); } catch (error) { message.textContent = error.message; }
}

async function showDealerContacts(dealerId, target) {
  target.textContent = 'Consultando contactos…';
  try {
    const result = await api(`/api/crm/dealers/${dealerId}/contacts`);
    target.innerHTML = result.contacts.length ? result.contacts.map((contact) => `<div class="contact"><strong>${escapeHtml(contact.contactName)}</strong><span>${escapeHtml(contact.role || 'Sin cargo')} · ${escapeHtml(contact.preferredChannel || 'Canal pendiente')}</span><small>${escapeHtml(contact.email || 'Sin email')} · ${escapeHtml(contact.phone || contact.whatsapp || 'Sin teléfono')}</small><label>Autorización <select class="contact-status" data-dealer-id="${dealerId}" data-contact-id="${contact.id}"><option value="pending_review" ${contact.consentStatus === 'pending_review' ? 'selected' : ''}>Pendiente</option><option value="approved" ${contact.consentStatus === 'approved' ? 'selected' : ''}>Aprobado</option><option value="rejected" ${contact.consentStatus === 'rejected' ? 'selected' : ''}>Rechazado</option></select></label></div>`).join('') : 'Sin contactos activos.';
    target.querySelectorAll('.contact-status').forEach((select) => select.addEventListener('change', async () => { try { await api(`/api/crm/dealers/${select.dataset.dealerId}/contacts/${select.dataset.contactId}/status`, { method: 'POST', body: JSON.stringify({ consentStatus: select.value }) }); message.textContent = 'Autorización del contacto actualizada.'; } catch (error) { message.textContent = error.message; } }));
  } catch (error) { target.textContent = error.message; }
}

function renderDealers(dealers) {
  const list = document.querySelector('#dealer-list');
  if (!dealers.length) { list.innerHTML = 'Todavía no hay concesionarios registrados.'; return; }
  list.innerHTML = dealers.map((dealer) => `<article class="dealer-row"><div class="row"><strong>${escapeHtml(dealer.tradeName || dealer.legalName)}<br><small>${escapeHtml(dealer.legalName)}</small></strong><span>${escapeHtml(dealer.status)} · ${escapeHtml(dealer.verificationStatus)}</span></div><div class="dealer-actions"><select data-status-id="${dealer.id}"><option value="draft" ${dealer.status === 'draft' ? 'selected' : ''}>Borrador</option><option value="pending_review" ${dealer.status === 'pending_review' ? 'selected' : ''}>Pendiente de revisión</option><option value="verified" ${dealer.status === 'verified' ? 'selected' : ''}>Verificado</option><option value="suspended" ${dealer.status === 'suspended' ? 'selected' : ''}>Suspendido</option></select><select data-processing-id="${dealer.id}"><option value="pending_review" ${dealer.dataProcessingStatus !== 'approved' ? 'selected' : ''}>RGPD pendiente</option><option value="approved" ${dealer.dataProcessingStatus === 'approved' ? 'selected' : ''}>Tratamiento aprobado</option></select><button type="button" class="contacts-button" data-dealer-id="${dealer.id}">Ver contactos restringidos</button></div><div class="dealer-contacts" id="contacts-${dealer.id}" hidden></div></article>`).join('');
  list.querySelectorAll('[data-status-id]').forEach((select) => select.addEventListener('change', () => { const processing = list.querySelector(`[data-processing-id="${select.dataset.statusId}"]`).value; updateDealerStatus(select.dataset.statusId, select.value, processing); }));
  list.querySelectorAll('[data-processing-id]').forEach((select) => select.addEventListener('change', () => { const status = list.querySelector(`[data-status-id="${select.dataset.processingId}"]`).value; updateDealerStatus(select.dataset.processingId, status, select.value); }));
  list.querySelectorAll('.contacts-button').forEach((button) => button.addEventListener('click', () => { const target = document.querySelector(`#contacts-${button.dataset.dealerId}`); target.hidden = !target.hidden; if (!target.hidden) showDealerContacts(button.dataset.dealerId, target); }));
}

async function load() {
  message.textContent = 'Consultando…';
  try {
    const [summary, dealers, cases, aftercare] = await Promise.all([api('/api/crm/summary'), api('/api/crm/dealers'), api('/api/crm/cases'), api('/api/crm/aftercare')]);
    const observability = await api('/api/crm/observability').catch(() => ({ events: { byType: {} }, alerts: [{ severity: 'warning', message: 'Instrumentación pendiente', action: 'Aplica la migración CRM 003 para activar métricas de eventos.' }], integrations: { email: 'pendiente de esquema', social: 'pendiente de esquema' } }));
    document.querySelector('#cases').textContent = summary.cases.total || 0; document.querySelector('#dealers').textContent = dealers.dealers.length; document.querySelector('#aftercare').textContent = summary.aftercare.open || 0; document.querySelector('#overdue').textContent = summary.cases.overdue || 0;
    const observationTarget = document.querySelector('#observability');
    const eventRows = Object.entries(observability.events.byType || {}).map(([type, total]) => `<span class="pill">${escapeHtml(type)}: ${total}</span>`).join('');
    const alertRows = (observability.alerts || []).map((alert) => `<div class="alert ${escapeHtml(alert.severity)}"><strong>${escapeHtml(alert.message)}</strong><small>${escapeHtml(alert.action)}</small></div>`).join('');
    observationTarget.innerHTML = `${eventRows || '<p>No hay eventos en el periodo.</p>'}${alertRows || '<p class="ok">Sin alertas operativas.</p>'}<p class="muted">Email: ${escapeHtml(observability.integrations.email)} · Social: ${escapeHtml(observability.integrations.social)}</p>`;
    renderDealers(dealers.dealers);
    const stageSummary = Object.entries(summary.cases.byStage || {}).map(([stage, total]) => `<span class="pill">${escapeHtml(stage)}: ${total}</span>`).join('');
    const rows = cases.cases.map((item) => { const options = (transitions[item.stage] || []).map((stage) => `<option value="${stage}">${stage}</option>`).join(''); return `<div class="row"><strong>Caso #${item.id}<br><small>${escapeHtml(item.stage)}</small></strong><span>${new Date(item.updatedAt).toLocaleDateString('es-ES')} ${options ? `<select data-case-id="${item.id}" class="stage-select"><option value="">Avanzar fase…</option>${options}</select>` : ''}</span></div>`; }).join('');
    const caseList = document.querySelector('#case-list'); caseList.innerHTML = `${stageSummary ? `<div class="stage-summary">${stageSummary}</div>` : ''}${rows || '<div class="empty">Todavía no hay casos registrados.</div>'}`;
    let taskList = document.querySelector('#task-list'); if (!taskList) { const panel = document.createElement('section'); panel.className = 'panel'; panel.innerHTML = '<h2>Tareas abiertas</h2><div id="task-list" class="empty"></div>'; document.querySelector('#app').append(panel); taskList = document.querySelector('#task-list'); }
    taskList.innerHTML = aftercare.tasks.length ? aftercare.tasks.map((task) => `<div class="row"><strong>Caso #${task.caseId}<br><small>${escapeHtml(task.taskType)}</small></strong><span>${escapeHtml(task.stage)} · ${task.dueAt ? new Date(task.dueAt).toLocaleString('es-ES') : 'sin fecha'} <button type="button" data-task-id="${task.id}" class="complete-task">Completar</button></span></div>`).join('') : 'No hay tareas abiertas.';
    taskList.querySelectorAll('.complete-task').forEach((button) => button.addEventListener('click', async () => { try { await api(`/api/crm/aftercare/${button.dataset.taskId}/complete`, { method: 'POST' }); await load(); } catch (error) { message.textContent = error.message; } }));
    caseList.querySelectorAll('.stage-select').forEach((select) => select.addEventListener('change', async () => { if (!select.value) return; try { await api(`/api/crm/cases/${select.dataset.caseId}/events`, { method: 'POST', body: JSON.stringify({ toStage: select.value, reason: 'Actualización desde consola interna' }) }); await load(); } catch (error) { message.textContent = error.message; select.value = ''; } }));
    message.textContent = '';
  } catch (error) { message.textContent = error.message; }
}

document.querySelector('#load').addEventListener('click', load);
document.querySelector('#dealer-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const result = await api('/api/crm/dealers', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); message.textContent = result.message; event.currentTarget.reset(); await load(); } catch (error) { message.textContent = error.message; } });
fetch(`${API}/api/crm/status`).then(async (response) => { const status = await response.json(); if (!response.ok || status.enabled !== true) { const checks = status.checks || {}; const missing = [['MySQL', checks.mysql], ['bandera CRM', checks.featureFlag], ['esquema comprobado', checks.schemaReady], ['credencial interna', checks.adminCredential]].filter(([, ready]) => !ready).map(([label]) => label); throw new Error(`CRM cerrado. Falta: ${missing.join(', ') || 'configuración válida'}.`); } locked.hidden = true; app.hidden = false; mountControls(); mountCaseMetadata(); }).catch((error) => { message.textContent = error.message || 'CRM cerrado o backend local no disponible. La consola permanece protegida.'; });
