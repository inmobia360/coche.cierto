(function () {
  'use strict';
  const DEFAULTS = { maxKm: 220000, maxAge: 15, minimumMargin: 0.12, contingency: 1000 };
  function score(vehicle, settings = DEFAULTS) {
    const age = vehicle.year ? Math.max(0, new Date().getFullYear() - vehicle.year) : settings.maxAge;
    const kmRisk = Math.min(1, (vehicle.km || settings.maxKm) / settings.maxKm);
    const ageRisk = Math.min(1, age / settings.maxAge);
    let evidenceRisk = 0;
    if (vehicle.accident) evidenceRisk += 0.35;
    if (vehicle.testIssue) evidenceRisk += 0.22;
    if (vehicle.damageCount) evidenceRisk += Math.min(0.22, vehicle.damageCount * 0.022);
    if (vehicle.noMaintenance) evidenceRisk += 0.12;
    if (vehicle.noKeys) evidenceRisk += 0.05;
    if (vehicle.noEmission || vehicle.cocMissing) evidenceRisk += 0.04;
    if (vehicle.returnPremium) evidenceRisk -= 0.06;
    evidenceRisk = Math.max(0, Math.min(1, evidenceRisk));
    return { risk: Math.round(100 * (kmRisk * .35 + ageRisk * .25 + evidenceRisk * .4)), age, evidenceRisk };
  }
  function verdict(risk) { return risk <= 25 ? ['Riesgo bajo', 'low'] : risk <= 50 ? ['Riesgo medio', 'medium'] : risk <= 70 ? ['Riesgo alto', 'high'] : ['Riesgo crítico', 'critical']; }
  globalThis.SUBASTA_ENGINE = { DEFAULTS, score, verdict };
})();


