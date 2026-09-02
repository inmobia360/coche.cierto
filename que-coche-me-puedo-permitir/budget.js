(function () {
  'use strict';

  var form = document.querySelector('#budget-form');
  var result = document.querySelector('#budget-result');
  var error = document.querySelector('#form-error');
  var euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  var assumptions = { initialLow: 1100, initialHigh: 2700, monthlyShareLow: 0.15, monthlyShareHigh: 0.25, reserveFloor: 1000 };
  var started = false;

  function money(value) { return euro.format(Math.max(0, Math.round(value))); }
  function value(name) { return Number(form.elements[name].value); }
  function plural(value, singular, pluralForm) { return value === 1 ? singular : pluralForm; }
  function track(name, detail) {
    window.dispatchEvent(new CustomEvent('cochecierto:event', { detail: { name: name, source_page: 'que-coche-me-puedo-permitir', ...detail } }));
  }
  function validate() {
    var fields = ['income', 'fixed', 'savings', 'reserve', 'km'];
    var invalid = fields.some(function (name) { return !Number.isFinite(value(name)) || value(name) < 0; });
    var use = form.elements.use.value;
    if (invalid || !use) return 'Completa los campos con importes iguales o superiores a cero y selecciona tu uso principal.';
    if (value('fixed') > value('income')) return 'Tus gastos fijos superan tus ingresos declarados. Revisa las cifras antes de calcular.';
    if (value('reserve') > value('savings')) return 'La reserva que quieres conservar no puede superar tu ahorro disponible.';
    if (form.elements.energy.value !== '' && form.elements.energyReference.value !== '') return 'Elige una referencia energética o tu coste propio, no ambos.';
    if (form.elements.energy.value !== '' && (!Number.isFinite(value('energy')) || value('energy') < 0)) return 'El coste de energía debe ser un importe igual o superior a cero.';
    return '';
  }
  function render(data) {
    var margin = data.income - data.fixed;
    var monthlyLow = margin * assumptions.monthlyShareLow;
    var monthlyHigh = margin * assumptions.monthlyShareHigh;
    var reserve = Math.max(data.reserve, assumptions.reserveFloor);
    var cashMax = data.savings - reserve - assumptions.initialHigh;
    var monthlyEnergy = data.energy === null ? null : data.km / 100 * data.energy;
    var status = cashMax <= 0 || monthlyHigh <= 0 ? 'Conviene frenar y proteger margen' : 'Ya tienes una referencia para comparar';
    var professional = data.use === 'professional' ? '<li>Si el coche es una herramienta de trabajo, añade coste de parada, sustitución y fiscalidad con un profesional.</li>' : '';
    var finance = data.purchase === 'finance' ? '<li>En financiación, suma entrada, comisiones, cuotas y posible cuota final. No compares solo la cuota mensual.</li>' : '';
    result.innerHTML = '<div class="result-top"><div class="card-kicker">Tu referencia beta</div><h2>' + status + '</h2></div>' +
      '<div class="result-number">' + money(cashMax) + '<small>precio máximo provisional del coche</small></div>' +
      '<div class="metric-row"><div><strong>' + money(monthlyLow) + '–' + money(monthlyHigh) + '</strong><span>margen mensual de referencia</span></div><div><strong>' + money(reserve) + '</strong><span>reserva protegida en este cálculo</span></div></div>' +
      '<h3>Cómo sale</h3><ul class="result-list"><li>Margen tras gastos fijos: <strong>' + money(margin) + '</strong> al mes.</li><li>Gastos iniciales beta: <strong>' + money(assumptions.initialLow) + '–' + money(assumptions.initialHigh) + '</strong>.</li><li>Uso declarado: <strong>' + (data.use === 'professional' ? 'profesional' : data.use === 'city' ? 'ciudad' : data.use === 'road' ? 'carretera' : 'mixto') + '</strong> · ' + data.km.toLocaleString('es-ES') + ' km/mes.</li><li>' + (monthlyEnergy === null ? 'Coste energético: <strong>pendiente</strong>; introduce tu coste real cuando lo conozcas.' : 'Coste energético declarado: <strong>' + money(monthlyEnergy) + '</strong> al mes.') + '</li>' + finance + professional + '</ul>' +
      '<div class="result-callout"><strong>Tu siguiente paso</strong><p>Usa esta cifra como techo provisional, compara el coste total y conserva margen para la unidad concreta.</p><a class="button" href="../valorador/?source=budget-tool&intent=budget">Crear mi valoración gratuita</a></div>' +
      '<p class="muted result-footnote">El precio máximo es provisional y la reserva es la cantidad que este cálculo intenta conservar; ninguna de las dos cifras es una garantía. Esto no es asesoramiento financiero, una tasación, un peritaje ni una aprobación de crédito. Cambia los supuestos cuando tengas seguro, financiación y costes reales.</p>';
    result.querySelector('a').addEventListener('click', function () {
      track('valuation_start', { intent: 'budget' });
      track('next_action', { action: 'start_valuation', intent: 'budget' });
    });
    track('tool_complete', { purchase: data.purchase, use: data.use });
  }
  form.querySelectorAll('input, select').forEach(function (field) {
    field.addEventListener('input', function () {
      if (!started) { started = true; track('tool_start', { use: form.elements.use.value || 'unknown' }); }
    }, { once: true });
  });
  track('landing_view', { page_version: 'mvp-v1' });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var message = validate();
    error.hidden = !message;
    error.textContent = message;
    if (message) return;
    var selectedEnergy = form.elements.energyReference.value;
    render({ income: value('income'), fixed: value('fixed'), savings: value('savings'), reserve: value('reserve'), km: value('km'), energy: selectedEnergy !== '' ? Number(selectedEnergy) : (form.elements.energy.value === '' ? null : value('energy')), use: form.elements.use.value, purchase: form.elements.purchase.value });
  });
}());
