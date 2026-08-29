(function () {
  'use strict';

  const PANEL_ID = 'arl-panel';
  const SETTINGS_KEY = 'arl-settings';
  const DEFAULTS = { kmWeight: 0.35, ageWeight: 0.25, evidenceWeight: 0.4, maxKm: 220000, maxAge: 15 };

  const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const number = (value) => Number((value || '').replace(/[^0-9]/g, '')) || 0;
  const rowValue = (label) => {
    const rows = [...document.querySelectorAll('tr')];
    const row = rows.find((item) => clean(item.innerText).toLowerCase().startsWith(label.toLowerCase()));
    return row ? clean(row.innerText).replace(new RegExp('^' + label + '\\s*', 'i'), '').replace(/^:/, '').trim() : '';
  };
  const currentYear = new Date().getFullYear();

  function cardData(card) {
    const text = clean(card.innerText);
    const link = card.querySelector('a[href*="/merchant/car/"]');
    const href = link?.href || '';
    const title = clean(link?.innerText || card.querySelector('h2, h3')?.innerText || '').split('La subasta')[0];
    return {
      title, ref: (href.match(/\/car\/([^?]+)/) || [])[1] || '', href,
      km: number((text.match(/([\d.]+)\s*km/i) || [])[1]),
      year: number((text.match(/1ª Matriculación:\s*\d{1,2}\/(\d{4})/i) || [])[1]),
      price: number((text.match(/(?:Puja mínima|Precio Auto1):\s*([\d.]+)\s*€/i) || [])[1]),
      fuel: clean((text.match(/Combustible:\s*([^\n]+)/i) || [])[1]),
      transmission: clean((text.match(/Caja de cambios:\s*([^\n]+)/i) || [])[1]),
      location: clean((text.match(/Ubicación:\s*([^\n]+)/i) || [])[1]),
      accident: /con accidente/i.test(text),
      returnPremium: /derecho de devolución premium/i.test(text),
      text
    };
  }

  function detailData() {
    const body = clean(document.body.innerText);
    return {
      title: clean(document.querySelector('h1, h2')?.innerText || document.title),
      ref: rowValue('Referencia'), km: number(rowValue('Lectura cuentakilómetros')),
      year: number(rowValue('1ª Matriculación').match(/\d{4}/)?.[0]),
      price: number((body.match(/(?:Puja mínima|Precio Auto1)\s*:?\s*([\d.]+)\s*€/i) || [])[1]),
      accident: /Daños previos \/ accidente\s*Sí/i.test(body) || /Con accidente/i.test(body),
      returnPremium: /Derecho de Devolución Premium/i.test(body),
      testIssue: /Problema encontrado/i.test(body),
      noMaintenance: /Sin libro de mantenimiento/i.test(body),
      noKeys: /Llaves\s*0/i.test(body),
      damageCount: number((body.match(/DAÑOS\s*\((\d+)\)/i) || [])[1]),
      noEmission: /Tipo de Emisiones:\s*Ninguna indicación/i.test(body),
      cocMissing: /COC:\s*No/i.test(body),
      body
    };
  }

  function score(data, settings) {
    const age = data.year ? Math.max(0, currentYear - data.year) : settings.maxAge;
    const kmRisk = Math.min(1, (data.km || settings.maxKm) / settings.maxKm);
    const ageRisk = Math.min(1, age / settings.maxAge);
    let evidenceRisk = 0;
    if (data.accident) evidenceRisk += 0.35;
    if (data.testIssue) evidenceRisk += 0.22;
    if (data.damageCount) evidenceRisk += Math.min(0.22, data.damageCount * 0.022);
    if (data.noMaintenance) evidenceRisk += 0.12;
    if (data.noKeys) evidenceRisk += 0.05;
    if (data.noEmission || data.cocMissing) evidenceRisk += 0.04;
    if (data.returnPremium) evidenceRisk -= 0.06;
    evidenceRisk = Math.max(0, Math.min(1, evidenceRisk));
    const risk = Math.round(100 * (kmRisk * settings.kmWeight + ageRisk * settings.ageWeight + evidenceRisk * settings.evidenceWeight));
    return { risk: Math.max(0, Math.min(100, risk)), age, evidenceRisk };
  }

  function verdict(risk) {
    if (risk <= 25) return ['Riesgo bajo', 'low'];
    if (risk <= 50) return ['Riesgo medio', 'medium'];
    if (risk <= 70) return ['Riesgo alto', 'high'];
    return ['Riesgo crítico', 'critical'];
  }

  function mountPanel(html) {
    document.getElementById(PANEL_ID)?.remove();
    const panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.innerHTML = html;
    document.body.appendChild(panel);
  }

  function detailPanel(data, settings) {
    const result = score(data, settings); const [label, level] = verdict(result.risk);
    const factors = [];
    if (data.km > settings.maxKm) factors.push(`Kilometraje elevado: ${data.km.toLocaleString('es-ES')} km`);
    if (result.age >= 12) factors.push(`Antigüedad alta: ${result.age} años`);
    if (data.accident) factors.push('Consta accidente o daños previos');
    if (data.testIssue) factors.push('La prueba dinámica registra un problema');
    if (data.damageCount) factors.push(`${data.damageCount} grupos de daños declarados`);
    if (data.noMaintenance) factors.push('Sin libro de mantenimiento');
    if (data.noKeys) factors.push('No hay llaves declaradas');
    if (!factors.length) factors.push('No se han detectado señales críticas en los datos visibles');
    mountPanel(`<div class="arl-kicker">AUTO1 / LENS</div><div class="arl-head"><h2>Diagnóstico de compra</h2><button class="arl-close" aria-label="Cerrar">×</button></div><div class="arl-gauge ${level}"><span>${result.risk}</span><small>/ 100 riesgo</small></div><div class="arl-verdict ${level}">${label}</div><p class="arl-note">Puntuación orientativa basada únicamente en la ficha visible. Un número bajo es mejor.</p><div class="arl-section"><h3>Qué está pesando</h3><ul>${factors.map((x) => `<li>${x}</li>`).join('')}</ul></div><div class="arl-meta"><span>${data.ref || 'Sin referencia'}</span><span>${data.km ? data.km.toLocaleString('es-ES') + ' km' : 'KM no visible'}</span><span>${data.price ? data.price.toLocaleString('es-ES') + ' €' : 'Precio no visible'}</span></div><button class="arl-copy">Copiar ficha para comparar</button>`);
    document.querySelector('.arl-close').onclick = () => document.getElementById(PANEL_ID)?.remove();
    document.querySelector('.arl-copy').onclick = async () => { await navigator.clipboard?.writeText(`${data.title} (${data.ref}) — riesgo ${result.risk}/100 — ${label}`); document.querySelector('.arl-copy').textContent = 'Copiado'; };
  }

  function listPanel(data, settings) {
    const ranked = data.map((item) => ({ ...item, result: score(item, settings) })).sort((a, b) => a.result.risk - b.result.risk).slice(0, 5);
    mountPanel(`<div class="arl-kicker">AUTO1 / LENS</div><div class="arl-head"><h2>Compra con menos riesgo</h2><button class="arl-close" aria-label="Cerrar">×</button></div><p class="arl-note">Ordenado con los coches visibles en esta página. Abre una ficha para el diagnóstico completo.</p><div class="arl-ranking">${ranked.map((item, i) => { const [label, level] = verdict(item.result.risk); return `<a href="${item.href}" class="arl-rank"><b>${String(i + 1).padStart(2, '0')}</b><span><strong>${item.title || item.ref}</strong><small>${item.km ? item.km.toLocaleString('es-ES') + ' km' : 'KM n/d'} · ${item.price ? item.price.toLocaleString('es-ES') + ' €' : 'precio n/d'}</small></span><em class="${level}">${item.result.risk}</em></a>`; }).join('')}</div><div class="arl-legend"><span><i class="low"></i>bajo</span><span><i class="medium"></i>medio</span><span><i class="high"></i>alto</span></div>`);
    document.querySelector('.arl-close').onclick = () => document.getElementById(PANEL_ID)?.remove();
  }

  async function init() {
    const settings = { ...DEFAULTS, ...(await chrome.storage.sync.get(DEFAULTS)) };
    const isDetail = /\/merchant\/car\/[^/]+/.test(location.pathname);
    if (isDetail) detailPanel(detailData(), settings);
    else {
      const cards = [...document.querySelectorAll('a[href*="/es/app/merchant/car/"]')].map((a) => a.closest('li, article, [role="listitem"]') || a.parentElement?.parentElement).filter(Boolean);
      const unique = [...new Set(cards)].map(cardData).filter((x) => x.href && (x.km || x.price || x.title));
      if (unique.length) listPanel(unique, settings);
    }
  }
  init();
  let lastPath = location.pathname;
  const refreshOnRouteChange = () => {
    if (location.pathname !== lastPath) { lastPath = location.pathname; setTimeout(init, 500); }
  };
  new MutationObserver(refreshOnRouteChange).observe(document.body, { childList: true, subtree: true });
})();
