(function () {
  'use strict';

  const profiles = {
    novel: {
      label: 'Primer coche',
      title: 'Un primer coche que no te deje sin margen',
      summary: 'Priorizamos manejo sencillo, seguro asumible y una compra fácil de verificar.',
      category: 'Utilitario sencillo',
      budget: '6.000–10.000 €',
      fit: 82,
      risk: 34,
      monthly: '245 €',
      vehicle: '7.500 €',
      initial: '2.500 €',
      bodyType: 'Utilitario o compacto pequeño',
      maxAge: 'Hasta 10 años',
      cost: [
        ['Provisión de compra', '105 €'],
        ['Combustible', '62 €'],
        ['Seguro', '38 €'],
        ['Mantenimiento', '25 €'],
        ['Impuestos e ITV', '7 €'],
        ['Reserva', '8 €']
      ],
      scenarios: [
        ['Económico', '6.000–7.500 €', '220 €/mes · 10–13 años', 'Alto', 'Menor desembolso, pero exige más revisión inicial.'],
        ['Equilibrado', '8.000–10.000 €', '245 €/mes · 7–10 años', 'Medio', 'Mejor equilibrio entre margen, uso y previsibilidad.'],
        ['Previsible', '11.000–14.000 €', '310 €/mes · 4–7 años', 'Bajo', 'Más inversión para reducir incertidumbre y envejecimiento.']
      ],
      check: [
        'Seguro asumible y presupuesto de mantenimiento',
        'Prueba en frío y funcionamiento sencillo',
        'Historial, ITV y facturas verificables'
      ]
    },
    student: {
      label: 'Presupuesto ajustado',
      title: 'Moverte sin convertir el coche en una carga',
      summary: 'El presupuesto manda: dejamos espacio para seguro, combustible y reparaciones.',
      category: 'Compacto económico',
      budget: '3.000–6.000 €',
      fit: 76,
      risk: 58,
      monthly: '180 €',
      vehicle: '4.500 €',
      initial: '1.500 €',
      bodyType: 'Compacto económico',
      maxAge: 'Hasta 12 años',
      cost: [
        ['Provisión de compra', '70 €'],
        ['Combustible', '45 €'],
        ['Seguro', '35 €'],
        ['Mantenimiento', '18 €'],
        ['Impuestos e ITV', '5 €'],
        ['Reserva', '7 €']
      ],
      scenarios: [
        ['Económico', '3.000–4.500 €', '155 €/mes · 12–16 años', 'Alto', 'Menor desembolso, pero exige más revisión inicial.'],
        ['Equilibrado', '4.500–6.000 €', '180 €/mes · 8–12 años', 'Medio', 'Mejor equilibrio entre margen, uso y previsibilidad.'],
        ['Previsible', '7.000–9.000 €', '235 €/mes · 5–8 años', 'Bajo', 'Más inversión para reducir incertidumbre y envejecimiento.']
      ],
      check: [
        'Reserva para seguro y puesta a punto',
        'Consumo y etiqueta compatibles con tus trayectos',
        'No comprar al límite del presupuesto'
      ]
    },
    family: {
      label: 'Compra familiar',
      title: 'Que el coche encaje también fuera de la pantalla',
      summary: 'Medimos espacio, seguridad, coste total y cambios previsibles en los próximos años.',
      category: 'Compacto familiar',
      budget: '12.000–18.000 €',
      fit: 91,
      risk: 29,
      monthly: '390 €',
      vehicle: '14.000 €',
      initial: '3.800 €',
      bodyType: 'Compacto familiar',
      maxAge: 'Hasta 10 años',
      cost: [
        ['Provisión de compra', '170 €'],
        ['Combustible', '92 €'],
        ['Seguro', '48 €'],
        ['Mantenimiento', '45 €'],
        ['Impuestos e ITV', '12 €'],
        ['Reserva', '23 €']
      ],
      scenarios: [
        ['Económico', '10.000–13.000 €', '345 €/mes · 9–13 años', 'Medio-alto', 'Menor desembolso, pero exige más revisión inicial.'],
        ['Equilibrado', '13.000–18.000 €', '390 €/mes · 5–9 años', 'Medio', 'Mejor equilibrio entre margen, uso y previsibilidad.'],
        ['Previsible', '19.000–25.000 €', '485 €/mes · 2–6 años', 'Bajo', 'Más inversión para reducir incertidumbre y envejecimiento.']
      ],
      check: [
        'Plazas, maletero y sillas infantiles',
        'Coste total familiar y mantenimiento',
        'Revisar encaje a 3–5 años'
      ]
    },
    business: {
      label: 'Uso profesional',
      title: 'Proteger tu disponibilidad y tu coste por kilómetro',
      summary: 'Una parada puede afectar a tus ingresos: valoramos carga, uso intensivo y continuidad.',
      category: 'Vehículo profesional',
      budget: '15.000–25.000 €',
      fit: 87,
      risk: 41,
      monthly: '520 €',
      vehicle: '20.000 €',
      initial: '5.000 €',
      bodyType: 'Furgoneta o vehículo profesional',
      maxAge: 'Hasta 8 años',
      cost: [
        ['Provisión de compra', '230 €'],
        ['Combustible', '135 €'],
        ['Seguro', '62 €'],
        ['Mantenimiento', '58 €'],
        ['Impuestos e ITV', '15 €'],
        ['Reserva', '20 €']
      ],
      scenarios: [
        ['Económico', '12.000–17.000 €', '465 €/mes · 9–13 años', 'Alto', 'Menor desembolso, pero exige más revisión inicial.'],
        ['Equilibrado', '15.000–25.000 €', '520 €/mes · 5–9 años', 'Medio', 'Mejor equilibrio entre margen, uso y previsibilidad.'],
        ['Previsible', '26.000–35.000 €', '680 €/mes · 2–6 años', 'Bajo', 'Más inversión para reducir incertidumbre y envejecimiento.']
      ],
      check: [
        'Coste por kilómetro y día parado',
        'Carga, etiqueta y acceso a zonas de trabajo',
        'Historial de uso intensivo y plan alternativo'
      ]
    }
  };

  let current = 'novel';
  const tabs = document.querySelector('#profileTabs');
  const dashboard = document.querySelector('#dashboard');

  function initTabs() {
    if (!tabs) return;
    tabs.innerHTML = '';
    Object.entries(profiles).forEach(([key, p]) => {
      const b = document.createElement('button');
      b.className = 'profile-tab' + (key === current ? ' active' : '');
      b.type = 'button';
      b.role = 'tab';
      b.id = 'tab-' + key;
      b.textContent = p.label;
      b.setAttribute('aria-selected', String(key === current));
      b.onclick = () => {
        current = key;
        render();
      };
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

    const costItems = p.cost.map(x => '<div><span>' + x[0] + '</span><strong>' + x[1] + '</strong></div>').join('');
    const scenarioCards = p.scenarios.map((s, i) => {
      const isRec = i === 1;
      return [
        '<article class="scenario' + (isRec ? ' recommended' : '') + '">',
        '  <span>' + (isRec ? 'RECOMENDADO' : s[0]) + '</span>',
        '  <h4>' + s[0] + '</h4>',
        '  <strong>' + s[1] + '</strong>',
        '  <small>' + s[2] + '</small>',
        '  <p>' + s[4] + '</p>',
        '</article>'
      ].join('');
    }).join('');

    const checkItems = p.check.map(x => '<li>' + x + '</li>').join('');

    dashboard.innerHTML = [
      '<div class="dashboard-head">',
      '  <div>',
      '    <p class="eyebrow">Situación seleccionada</p>',
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
      '    <strong>Encaje orientativo</strong>',
      '    <small>Se contrasta con uso, necesidades y prioridades</small>',
      '  </article>',
      '  <article>',
      '    <span>Incertidumbre a vigilar</span>',
      '    <strong>Incertidumbre a vigilar</strong>',
      '    <small>Depende de la unidad, documentación y estado real</small>',
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
      '      <strong>—</strong>',
      '      <span>sin porcentaje</span>',
      '    </div>',
      '    <p>La recomendación debe confirmarse con documentación, prueba e inspección independiente si hay dudas.</p>',
      '  </section>',
      '</div>',
      '<section class="panel detail-panel" style="margin-top:14px">',
      '  <p class="eyebrow">Ficha de búsqueda recomendada · simulada</p>',
      '  <h3>Qué buscar en esta situación</h3>',
      '  <div class="search-spec">',
      '    <div><span>Carrocería</span><strong>' + p.bodyType + '</strong></div>',
      '    <div><span>Antigüedad</span><strong>' + p.maxAge + '</strong></div>',
      '    <div><span>Etiqueta</span><strong>C o superior</strong></div>',
      '    <div><span>Reserva inicial</span><strong>' + p.initial + '</strong></div>',
      '  </div>',
      '</section>',
      '<section class="content-grid" style="margin-top:14px">',
      '  <section class="panel">',
      '    <p class="eyebrow">Coste total de propiedad</p>',
      '    <h3>Lo que puede costar cada mes</h3>',
      '    <div class="cost-list">',
      costItems,
      '      <div class="cost-total"><span>Total mensual estimado</span><strong>' + p.monthly + '</strong></div>',
      '    </div>',
      '    <p class="panel-note">Estimación ilustrativa: depende de kilómetros, zona, tarifa, seguro y estado de la unidad.</p>',
      '  </section>',
      '  <section class="panel">',
      '    <p class="eyebrow">Presupuesto desglosado</p>',
      '    <h3>Lo que conviene reservar</h3>',
      '    <div class="cost-list">',
      '      <div><span>Vehículo orientativo</span><strong>' + p.vehicle + '</strong></div>',
      '      <div><span>Transferencia y trámites</span><strong>350 €</strong></div>',
      '      <div><span>Seguro y puesta a punto</span><strong>1.250 €</strong></div>',
      '      <div><span>Colchón para imprevistos</span><strong>900 €</strong></div>',
      '      <div class="cost-total"><span>Presupuesto objetivo</span><strong>' + p.budget + '</strong></div>',
      '    </div>',
      '  </section>',
      '</section>',
      '<section class="panel" style="margin-top:14px">',
      '  <div class="panel-top">',
      '    <div>',
      '      <p class="eyebrow">Tres escenarios de compra</p>',
      '      <h3>Compara antes de elegir</h3>',
      '    </div>',
      '    <span class="hint">Elige según tu prioridad</span>',
      '  </div>',
      '  <div class="scenario-grid">',
      scenarioCards,
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
      '    <p class="panel-note">El informe real incorporará tus respuestas, supuestos editables y una revisión más personalizada.</p>',
      '  </section>',
      '</section>',
      '<div class="demo-disclaimer">Datos simulados para mostrar el formato. El informe real utilizará tus respuestas y diferenciará datos, estimaciones y elementos pendientes de verificar.</div>'
    ].join('\n');
  }

  initTabs();
  render();

})();
