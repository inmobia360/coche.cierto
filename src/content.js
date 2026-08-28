(function () {
  'use strict';
  const ID = 'subasta-panel';
  const clean = (v) => (v || '').replace(/\s+/g, ' ').trim();
  const num = (v) => Number((v || '').replace(/[^0-9]/g, '')) || 0;
  const row = (label) => [...document.querySelectorAll('tr')].find((r) => clean(r.innerText).toLowerCase().startsWith(label.toLowerCase()));
  const value = (label) => { const r = row(label); return r ? clean(r.innerText).replace(new RegExp('^' + label + '\\s*:?\\s*', 'i'), '') : ''; };
  function detail() {
    const body = clean(document.body.innerText);
    return { title: clean(document.querySelector('h1,h2')?.innerText || document.title), ref: value('Referencia'), km: num(value('Lectura cuentakilómetros')), year: num(value('1ª Matriculación').match(/\d{4}/)?.[0]), price: num((body.match(/(?:Puja mínima|Precio Auto1)\s*:?\s*([\d.]+)\s*€/i) || [])[1]), accident: /Daños previos \/ accidente\s*Sí/i.test(body), testIssue: /Problema encontrado/i.test(body), noMaintenance: /Sin libro de mantenimiento/i.test(body), noKeys: /Llaves\s*0/i.test(body), damageCount: num((body.match(/DAÑOS\s*\((\d+)\)/i) || [])[1]), noEmission: /Tipo de Emisiones:\s*Ninguna indicación/i.test(body), cocMissing: /COC:\s*No/i.test(body), returnPremium: /Derecho de Devolución Premium/i.test(body) };
  }
  function card(el) {
    const text = clean(el.innerText); const a = el.querySelector('a[href*="/merchant/car/"]'); const href = a?.href || '';
    return { title: clean(a?.innerText || '').split('La subasta')[0], ref: (href.match(/\/car\/([^?]+)/) || [])[1] || '', href, km: num((text.match(/([\d.]+)\s*km/i) || [])[1]), year: num((text.match(/1ª Matriculación:\s*\d{1,2}\/(\d{4})/i) || [])[1]), price: num((text.match(/(?:Puja mínima|Precio Auto1):\s*([\d.]+)\s*€/i) || [])[1]) };
  }
  function panel(html) { document.getElementById(ID)?.remove(); const p = document.createElement('aside'); p.id = ID; p.innerHTML = html; document.body.append(p); p.querySelector('.subasta-close').onclick = () => p.remove(); }
  function init() {
    chrome.storage.sync.get(SUBASTA_ENGINE.DEFAULTS).then((settings) => {
      if (/\/merchant\/car\/[^/]+/.test(location.pathname)) {
        const v = detail(); const r = SUBASTA_ENGINE.score(v, settings); const [label, level] = SUBASTA_ENGINE.verdict(r.risk); const why = [v.accident && 'accidente o daños previos', v.testIssue && 'problema en prueba dinámica', v.noMaintenance && 'sin libro de mantenimiento', v.km > settings.maxKm && 'kilometraje elevado'].filter(Boolean);
        panel(`<div class="subasta-kicker">SUBASTA / DIAGNÓSTICO</div><div class="subasta-head"><h2>${v.title || 'Vehículo'}</h2><button class="subasta-close">×</button></div><div class="subasta-gauge ${level}">${r.risk}<small>/100</small></div><strong class="subasta-verdict ${level}">${label}</strong><p class="subasta-note">Puntuación orientativa basada en los datos visibles de la ficha.</p><h3>Señales detectadas</h3><ul>${(why.length ? why : ['sin señales críticas visibles']).map((x) => `<li>${x}</li>`).join('')}</ul><div class="subasta-meta">${v.ref || 'sin referencia'} · ${v.km ? v.km.toLocaleString('es-ES') + ' km' : 'km n/d'} · ${v.price ? v.price.toLocaleString('es-ES') + ' €' : 'precio n/d'}</div>`);
      } else {
        const seen = [...new Set([...document.querySelectorAll('a[href*="/es/app/merchant/car/"]')].map((a) => a.closest('li,article,[role="listitem"]') || a.parentElement?.parentElement).filter(Boolean))].map(card).filter((v) => v.href);
        const top = seen.map((v) => ({ ...v, result: SUBASTA_ENGINE.score(v, settings) })).sort((a, b) => a.result.risk - b.result.risk).slice(0, 5);
        panel(`<div class="subasta-kicker">SUBASTA / RANKING</div><div class="subasta-head"><h2>Menor riesgo visible</h2><button class="subasta-close">×</button></div><p class="subasta-note">Ordena los vehículos cargados en esta página. Abre una ficha para ver el diagnóstico.</p><div class="subasta-list">${top.map((v, i) => `<a href="${v.href}"><b>${String(i + 1).padStart(2, '0')}</b><span>${v.title || v.ref}<small>${v.km ? v.km.toLocaleString('es-ES') + ' km' : 'km n/d'} · ${v.price ? v.price.toLocaleString('es-ES') + ' €' : 'precio n/d'}</small></span><em>${v.result.risk}</em></a>`).join('')}</div>`);
      }
    });
  }
  init(); let last = location.pathname; new MutationObserver(() => { if (location.pathname !== last) { last = location.pathname; setTimeout(init, 500); } }).observe(document.body, { childList: true, subtree: true });
})();


