(() => {
  'use strict';

  const resources = [
    {
      id: 'budget-guide',
      phase: 'presupuesto',
      title: 'Cuánto gastar en un coche',
      format: 'Guía web · PDF',
      description: 'Separa el precio del coche, los gastos iniciales y la reserva que conviene conservar.',
      href: '../guias/cuanto-gastar-en-un-coche/',
      downloadHref: '../output/pdf/guia-cuanto-gastar-en-un-coche.pdf',
      cta: 'Abrir guía de presupuesto',
      tags: ['budget', 'unknown-budget', 'tight-budget']
    },
    {
      id: 'hidden-costs',
      phase: 'presupuesto',
      title: 'Gastos ocultos al comprar un coche usado',
      format: 'Guía web',
      description: 'Comprueba qué costes pueden aparecer después del precio anunciado.',
      href: '../guias/gastos-ocultos-comprar-coche-segunda-mano/',
      cta: 'Revisar gastos ocultos',
      tags: ['budget', 'tight-budget']
    },
    {
      id: 'powertrain-guide',
      phase: 'búsqueda',
      title: 'Gasolina o diésel según tus kilómetros',
      format: 'Guía web',
      description: 'Relaciona kilómetros, trayectos y ZBE antes de elegir motorización.',
      href: '../guias/gasolina-o-diesel-segun-kilometros/',
      cta: 'Comparar motorizaciones',
      tags: ['zbe', 'high-km', 'road']
    },
    {
      id: 'suspicious-ad',
      phase: 'búsqueda',
      title: 'Detectar un anuncio sospechoso',
      format: 'Guía web · PDF',
      description: 'Filtra información ausente, incoherencias y señales para frenar antes de avanzar.',
      href: '../guias/detectar-anuncio-coche-sospechoso/',
      downloadHref: '../output/pdf/guia-detectar-anuncio-coche-sospechoso.pdf',
      cta: 'Filtrar anuncios',
      tags: ['search', 'risk']
    },
    {
      id: 'seller-documents',
      phase: 'antes de visitar',
      title: 'Documentación que pedir al vendedor',
      format: 'Guía web · PDF',
      description: 'Prepara la solicitud de historial, ITV, titularidad, cargas y facturas.',
      href: '../guias/documentacion-pedir-al-vendedor/',
      downloadHref: '../output/pdf/guia-documentacion-coche-usado.pdf',
      cta: 'Pedir la documentación',
      tags: ['documents', 'visit', 'risk']
    },
    {
      id: 'dgt-report',
      phase: 'antes de visitar',
      title: 'Informe oficial de la DGT',
      format: 'Fuente oficial',
      description: 'Consulta la situación administrativa del vehículo antes de comprometer tiempo o dinero.',
      href: 'https://sede.dgt.gob.es/',
      cta: 'Ir a la DGT',
      external: true,
      tags: ['documents', 'risk', 'visit']
    },
    {
      id: 'cold-inspection',
      phase: 'visita',
      title: 'Checklist de inspección en frío',
      format: 'Checklist interactiva · PDF',
      description: 'Registra lo que puedes observar, lo que falta confirmar y cuándo pedir una inspección profesional.',
      href: '../recursos/checklist-inspeccion.html',
      downloadHref: '../output/pdf/guia-que-revisar-coche-usado.pdf',
      cta: 'Abrir checklist de visita',
      tags: ['visit', 'inspection']
    },
    {
      id: 'used-car-review',
      phase: 'visita',
      title: 'Qué revisar en un coche usado',
      format: 'Checklist web · PDF',
      description: 'Ordena documentación, prueba, historial y señales de alerta antes de pagar.',
      href: '../que-revisar-coche-segunda-mano/',
      downloadHref: '../output/pdf/guia-que-revisar-coche-usado.pdf',
      cta: 'Ver comprobaciones',
      tags: ['visit', 'inspection', 'risk']
    },
    {
      id: 'guarantee-guide',
      phase: 'decisión',
      title: 'Garantía de un coche de segunda mano',
      format: 'Guía web',
      description: 'Revisa las condiciones por escrito y conserva la documentación de la operación.',
      href: '../guias/garantia-coche-segunda-mano/',
      cta: 'Revisar garantías',
      tags: ['decision', 'professional-seller']
    }
  ];

  const phases = [
    { id: 'presupuesto', label: '1. Presupuesto', description: 'Saber cuánto puedes comprometer sin quedarte sin margen.' },
    { id: 'búsqueda', label: '2. Búsqueda', description: 'Aplicar filtros y descartar anuncios antes de desplazarte.' },
    { id: 'antes de visitar', label: '3. Documentación', description: 'Pedir lo necesario antes de perder tiempo o entregar una señal.' },
    { id: 'visita', label: '4. Visita', description: 'Observar, probar y registrar lo que sigue pendiente.' },
    { id: 'decisión', label: '5. Decisión', description: 'Avanzar solo cuando la información y las condiciones estén claras.' }
  ];

  function recommendations(answers, useType) {
    const a = answers || {};
    const tags = new Set(['budget', 'search', 'documents', 'visit']);
    if (!a.budget || a.budget === 'unknown') tags.add('unknown-budget');
    if (a.budget === 'under-3' || a.budget === '3-5') tags.add('tight-budget');
    if (a.zbe === 'yes' || a.zbe === 'sometimes') tags.add('zbe');
    if (a.km === 'high' || a.km === 'very-high') tags.add('high-km');
    if (a.use === 'road') tags.add('road');
    if (a.risk === 'low' || a.risk === 'unknown') tags.add('risk');
    if (useType === 'professional' || a.use === 'work') tags.add('professional-seller');

    const preferred = [
      a.budget === 'unknown' || a.budget === 'under-3' || a.budget === '3-5' ? 'budget-guide' : 'hidden-costs',
      a.zbe === 'yes' || a.zbe === 'sometimes' || a.km === 'high' || a.km === 'very-high' ? 'powertrain-guide' : 'suspicious-ad',
      'seller-documents',
      'cold-inspection',
      useType === 'professional' ? 'guarantee-guide' : 'used-car-review'
    ];
    return preferred.map(id => resources.find(resource => resource.id === id)).filter(Boolean).filter(resource => resource.tags.some(tag => tags.has(tag)) || ['seller-documents', 'cold-inspection'].includes(resource.id)).slice(0, 4);
  }

  window.CocheCiertoResources = { resources, phases, recommendations };
})();
