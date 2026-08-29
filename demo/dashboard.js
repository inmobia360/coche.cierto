const profiles = {
  novel: { label: 'Conductor novel', title: 'Un primer coche que no te deje sin margen', summary: 'Priorizamos manejo sencillo, seguro asumible y una compra fácil de verificar.', category: 'Utilitario sencillo', budget: '6.000–10.000 €', fit: 82, risk: 34, monthly: '245 €', check: ['Seguro asumible y presupuesto de mantenimiento', 'Prueba en frío y funcionamiento sencillo', 'Historial, ITV y facturas verificables'] },
  student: { label: 'Estudiante', title: 'Moverte sin convertir el coche en una carga', summary: 'El presupuesto manda: dejamos espacio para seguro, combustible y reparaciones.', category: 'Compacto económico', budget: '3.000–6.000 €', fit: 76, risk: 58, monthly: '180 €', check: ['Reserva para seguro y puesta a punto', 'Consumo y etiqueta compatibles con tus trayectos', 'No comprar al límite del presupuesto'] },
  family: { label: 'Familia', title: 'Que el coche encaje también fuera de la pantalla', summary: 'Medimos espacio, seguridad, coste total y cambios previsibles en los próximos años.', category: 'Compacto familiar', budget: '12.000–18.000 €', fit: 91, risk: 29, monthly: '390 €', check: ['Plazas, maletero y sillas infantiles', 'Coste total familiar y mantenimiento', 'Revisar encaje a 3–5 años'] },
  business: { label: 'Profesional o negocio', title: 'Proteger tu disponibilidad y tu coste por kilómetro', summary: 'Una parada puede afectar a tus ingresos: valoramos carga, uso intensivo y continuidad.', category: 'Vehículo profesional', budget: '15.000–25.000 €', fit: 87, risk: 41, monthly: '520 €', check: ['Coste por kilómetro y día parado', 'Carga, etiqueta y acceso a zonas de trabajo', 'Historial de uso intensivo y plan alternativo'] }
};

let current = 'novel';
const tabs = document.querySelector('#profileTabs');
const dashboard = document.querySelector('#dashboard');

if (tabs) {
  tabs.innerHTML = '';
  Object.entries(profiles).forEach(([key, p]) => {
    const b = document.createElement('button');
    b.className = 'profile-tab' + (key === current ? ' active' : '');
    b.type = 'button';
    b.role = 'tab';
    b.textContent = p.label;
    b.onclick = () => { current = key; render(); };
    tabs.append(b);
  });
}

function render() {
  const p = profiles[current];
  if (!dashboard) return;
  document.querySelectorAll('.profile-tab').forEach((b, i) => {
    const active = Object.keys(profiles)[i] === current;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });

  const checkItems = p.check.map(x => '<li>' + x + '</li>').join('');

  dashboard.innerHTML = [
    '<div class="dashboard-head">',
    '  <div>',
    '    <p class="eyebrow">Perfil seleccionado</p>',
    '    <h2>' + p.title + '</h2>',
    '    <p>' + p.summary + '</p>',
    '  </div>',
    '  <div class="simulated">',
    '    <span>SIMULADO</span>',
    '    <small>Ejemplo orientativo</small>',
    '  </div>',
    '</div>',
    '<div class="metric-grid">',
    '  <article>',
    '    <span>Encaje con tu situación</span>',
    '    <strong>' + p.fit + '%</strong>',
    '    <i><b style="width:' + p.fit + '%"></b></i>',
    '    <small>Uso, necesidades y prioridades</small>',
    '  </article>',
    '  <article>',
    '    <span>Incertidumbre a vigilar</span>',
    '    <strong>' + p.risk + '%</strong>',
    '    <i class="risk"><b style="width:' + p.risk + '%"></b></i>',
    '    <small>Cuanto más bajo, más previsible</small>',
    '  </article>',
    '  <article>',
    '    <span>Coste mensual de referencia</span>',
    '    <strong>' + p.monthly + '</strong>',
    '    <small>Antes de conocer una unidad concreta</small>',
    '  </article>',
    '  <article>',
    '    <span>Categoría a estudiar</span>',
    '    <strong class="metric-text">' + p.category + '</strong>',
    '    <small>La recomendación no sustituye una inspección</small>',
    '  </article>',
    '</div>',
    '<div class="content-grid">',
    '  <section class="panel budget-panel">',
    '    <div class="panel-top">',
    '      <div>',
    '        <p class="eyebrow">Presupuesto total</p>',
    '        <h3>Lo que realmente debes reservar</h3>',
    '      </div>',
    '      <strong>' + p.budget + '</strong>',
    '    </div>',
    '    <div class="budget-chart">',
    '      <span class="car" style="width:58%">Coche</span>',
    '      <span class="setup" style="width:14%">Puesta a punto</span>',
    '      <span class="insurance" style="width:11%">Seguro</span>',
    '      <span class="buffer" style="width:17%">Reserva</span>',
    '    </div>',
    '    <div class="chart-legend">',
    '      <span><i class="dot car-dot"></i>Vehículo</span>',
    '      <span><i class="dot setup-dot"></i>Inicial</span>',
    '      <span><i class="dot insurance-dot"></i>Seguro</span>',
    '      <span><i class="dot buffer-dot"></i>Colchón</span>',
    '    </div>',
    '    <p class="panel-note">El precio del anuncio no cuenta toda la historia. El informe separa cada partida para que puedas decidir con margen.</p>',
    '  </section>',
    '  <section class="panel score-panel">',
    '    <p class="eyebrow">Lectura rápida</p>',
    '    <h3>Un punto de partida, no una promesa</h3>',
    '    <div class="score-ring" style="--score:' + p.fit + '%">',
    '      <strong>' + p.fit + '</strong>',
    '      <span>encaje</span>',
    '    </div>',
    '    <p>La recomendación debe confirmarse con documentación, prueba e inspección independiente si hay dudas.</p>',
    '  </section>',
    '</div>',
    '<section class="panel" style="margin-top:14px">',
    '  <div class="panel-top">',
    '    <div>',
    '      <p class="eyebrow">Tres escenarios de compra</p>',
    '      <h3>Compara antes de elegir</h3>',
    '    </div>',
    '    <span class="hint">Elige según tu prioridad</span>',
    '  </div>',
    '  <div class="scenario-grid">',
    '    <article class="scenario">',
    '      <span>ESCENARIO 1</span>',
    '      <h4>Económico</h4>',
    '      <strong>Menor desembolso</strong>',
    '      <small>Más revisión inicial</small>',
    '    </article>',
    '    <article class="scenario recommended">',
    '      <span>RECOMENDADO</span>',
    '      <h4>Equilibrado</h4>',
    '      <strong>Mejor balance</strong>',
    '      <small>Coste y previsibilidad</small>',
    '    </article>',
    '    <article class="scenario">',
    '      <span>ESCENARIO 3</span>',
    '      <h4>Previsible</h4>',
    '      <strong>Menor incertidumbre</strong>',
    '      <small>Mayor inversión inicial</small>',
    '    </article>',
    '  </div>',
    '</section>',
    '<section class="content-grid lower">',
    '  <section class="panel">',
    '    <p class="eyebrow">Checklist personalizado</p>',
    '    <h3>Llega preparado a la visita</h3>',
    '    <ul class="checklist">' + checkItems + '</ul>',
    '  </section>',
    '  <section class="panel future">',
    '    <p class="eyebrow">Perspectiva a 3–5 años</p>',
    '    <h3>Compra pensando en lo que puede cambiar</h3>',
    '    <p>Revisa kilómetros, familia, actividad, ZBE, mantenimiento y facilidad de reventa antes de enamorarte de un anuncio.</p>',
    '    <a href="../valorador/">Aplicar mi caso real →</a>',
    '  </section>',
    '</section>',
    '<div class="demo-disclaimer">Datos simulados para mostrar el formato. El informe real utilizará tus respuestas y diferenciará datos, estimaciones y elementos pendientes de verificar.</div>'
  ].join('\n');
}

render();

const printBtn = document.querySelector('#printReport');
if (printBtn) printBtn.onclick = () => window.print();

const shareBtn = document.querySelector('#shareReport');
if (shareBtn) {
  shareBtn.onclick = async () => {
    const data = { title: 'CocheCierto · Informe demo', text: 'Explora este informe demo de CocheCierto.', url: location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch(e) {}
    } else {
      try { await navigator.clipboard.writeText(location.href); alert('Enlace copiado para compartirlo.'); } catch(e) { alert(location.href); }
    }
  };
}
