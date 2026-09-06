/**
 * CocheCierto - Componente Universal de Cabecera y Navegación
 */
(function () {
  'use strict';

  function initHeader() {
    // Las páginas legales no incluyen el gestor de tema por separado; aplicamos
    // aquí la preferencia guardada antes de construir la cabecera.
    var savedTheme = localStorage.getItem('cc-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.classList.toggle('theme-light', savedTheme === 'light');
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (document.body) document.body.classList.toggle('theme-light', savedTheme === 'light');
    }
    applyKnownLegalIdentity();
    var path = window.location.pathname.replace(/\/index\.html$/, '/');
    var isSubdir = /\/[^\/]+\/+$/.test(path) && !path.endsWith('/mvp-valorador/');
    var pathParts = path.split('/').filter(Boolean);
    // En documentos .html el último segmento es el archivo, no un directorio.
    // Así los enlaces del footer mantienen la misma raíz en todas las URLs.
    var pathDepth = path.endsWith('/') ? pathParts.length : Math.max(0, pathParts.length - 1);
    // Una guía anidada necesita subir tantos niveles como segmentos tenga la ruta.
    // Ejemplo: /guias/tema/ → ../../; una sección simple conserva ../.
    var base = pathDepth ? '../'.repeat(pathDepth) : './';
    var navIcon = function (name) {
      var paths = {home:'<path d="M4 10.5 12 4l8 6.5v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 20v-6h6v6"/>',scan:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M8 11h6M11 8v6"/>',report:'<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',method:'<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',tools:'<path d="m14.7 6.3 3-3 2 2-3 3M4 20l7.8-7.8 2 2L6 22H4z"/><path d="m13 5 6 6"/>'};
      return '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + paths[name] + '</svg>';
    };

    var currentKey = 'home';
    if (path.indexOf('/como-funciona/') !== -1) currentKey = 'como-funciona';
    else if (path.indexOf('/que-analizamos/') !== -1) currentKey = 'que-analizamos';
    else if (path.indexOf('/demo/') !== -1) currentKey = 'demo';
    else if (path.indexOf('/casos-reales/') !== -1) currentKey = 'casos-reales';
    else if (path.indexOf('/valorador/') !== -1) currentKey = 'valorador';
    else if (path.indexOf('/recursos/') !== -1) currentKey = 'recursos';
    else if (path.indexOf('/guias/') !== -1) currentKey = 'guias';

    var mobileMenuHTML = '<div class="mobile-menu-backdrop" data-mobile-menu-close hidden></div>' +
      '<aside class="mobile-menu-panel" id="mobile-menu-panel" aria-label="Menú principal" aria-hidden="true" hidden>' +
      '<div class="mobile-menu-head"><strong>Explora CocheCierto</strong><button type="button" class="mobile-menu-close" data-mobile-menu-close aria-label="Cerrar menú">×</button></div>' +
      '<div class="mobile-menu-group"><span>Empieza aquí</span><a class="mobile-menu-link" href="' + base + 'valorador/">' + navIcon('report') + '<span><strong>Crear mi valoración</strong><small>Ordena tu necesidad y tu presupuesto</small></span></a><a class="mobile-menu-link" href="' + base + 'que-coche-me-puedo-permitir/">' + navIcon('tools') + '<span><strong>Calcular qué coche puedo asumir</strong><small>Separa precio, gastos y reserva</small></span></a></div>' +
      '<div class="mobile-menu-group"><span>Aprende antes de decidir</span><a class="mobile-menu-link" href="' + base + 'como-funciona/">' + navIcon('home') + '<span><strong>Cómo funciona</strong><small>Conoce el método de CocheCierto</small></span></a><a class="mobile-menu-link" href="' + base + 'que-analizamos/">' + navIcon('scan') + '<span><strong>Qué analizamos</strong><small>Datos, costes y comprobaciones</small></span></a><a class="mobile-menu-link" href="' + base + 'guias/">' + navIcon('method') + '<span><strong>Guías</strong><small>Respuestas para comprar con criterio</small></span></a><a class="mobile-menu-link" href="' + base + 'recursos/">' + navIcon('tools') + '<span><strong>Recursos</strong><small>Checklists y herramientas útiles</small></span></a></div>' +
      '<div class="mobile-menu-group"><span>Comprueba el método</span><a class="mobile-menu-link" href="' + base + 'demo/">' + navIcon('report') + '<span><strong>Informe demo</strong><small>Mira el tipo de resultado</small></span></a><a class="mobile-menu-link" href="' + base + 'casos-reales/">' + navIcon('report') + '<span><strong>Casos prácticos</strong><small>Ejemplos de decisiones</small></span></a></div>' +
      '<div class="mobile-menu-group"><span>Confianza</span><a class="mobile-menu-link" href="' + base + 'quienes-somos/">Quiénes somos</a><a class="mobile-menu-link" href="' + base + 'legal/">Información legal</a><a class="mobile-menu-link" href="mailto:hola@cochecierto.com">Contacto</a></div>' +
      '</aside>' +
      '<nav class="mobile-bottom-nav" aria-label="Accesos rápidos"><a href="' + base + '">' + navIcon('home') + '<span>Inicio</span></a><a href="' + base + 'guias/">' + navIcon('method') + '<span>Guías</span></a><a class="mobile-bottom-primary" href="' + base + 'valorador/">' + navIcon('report') + '<span>Valorar</span></a><button type="button" class="mobile-bottom-menu" data-mobile-menu-open aria-controls="mobile-menu-panel" aria-expanded="false">☰<span>Menú</span></button></nav>';

    var headerHTML = '<a class="brand-lockup" href="/" aria-label="CocheCierto, inicio">' +
      '<img src="/' + (document.documentElement.classList.contains('theme-light') ? 'brand-symbol-light.svg' : 'brand-symbol.svg') + '" alt="CocheCierto" width="36" height="36" onerror="this.onerror=null;this.src=\'/favicon.svg\';">' +
      '<span>Coche<strong>Cierto</strong></span>' +
      '</a>' +
      '<nav class="nav-links" aria-label="Navegación principal">' +
      '<a href="' + base + 'como-funciona/"' + (currentKey === 'como-funciona' ? ' aria-current="page"' : '') + '>' + navIcon('home') + '<span>Cómo funciona</span></a>' +
      '<a href="' + base + 'que-analizamos/"' + (currentKey === 'que-analizamos' ? ' aria-current="page"' : '') + '>' + navIcon('scan') + '<span>Qué analizamos</span></a>' +
      '<a href="' + base + 'demo/"' + (currentKey === 'demo' ? ' aria-current="page"' : '') + '>' + navIcon('report') + '<span>Informe demo</span></a>' +
      '<a href="' + base + 'casos-reales/"' + (currentKey === 'casos-reales' ? ' aria-current="page"' : '') + '>' + navIcon('report') + '<span>Casos prácticos</span></a>' +
      '<a href="' + base + 'recursos/"' + (currentKey === 'recursos' ? ' aria-current="page"' : '') + '>' + navIcon('tools') + '<span>Recursos</span></a>' +
      '<a href="' + base + 'guias/"' + (currentKey === 'guias' ? ' aria-current="page"' : '') + '>' + navIcon('method') + '<span>Guías</span></a>' +
      '</nav>' +
      '<div class="header-actions">' +
      '<a class="nav-cta" href="' + base + 'valorador/">' + (currentKey === 'valorador' ? 'Crear mi valoración gratuita' : 'Crear mi valoración gratuita') + '</a>' +
      '<button class="theme-toggle-btn" type="button" aria-label="Cambiar tema" title="Cambiar tema">☼</button>' +
      '<button class="mobile-menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>' +
      '</div>' + mobileMenuHTML;

    var header = document.querySelector('.site-header, .landing-nav, .demo-nav, .brand');
    var container = document.querySelector('.landing-shell, .site-shell, .page, .demo-app, .app, body');

    if (header) {
      header.className = 'site-header';
      header.innerHTML = headerHTML;
    } else if (container) {
      header = document.createElement('header');
      header.className = 'site-header';
      header.innerHTML = headerHTML;
      container.prepend(header);
    }

    if (header) {
      var mobileBtn = header.querySelector('.mobile-menu-btn');
      var navLinks = header.querySelector('.nav-links');
      var mobilePanel = header.querySelector('.mobile-menu-panel');
      var mobileBackdrop = header.querySelector('.mobile-menu-backdrop');
      var quickMenuBtn = header.querySelector('[data-mobile-menu-open]');
      var closeMobileMenu = function () {
        if (!mobilePanel) return;
        mobilePanel.hidden = true;
        mobilePanel.setAttribute('aria-hidden', 'true');
        if (mobileBackdrop) mobileBackdrop.hidden = true;
        if (mobileBtn) { mobileBtn.setAttribute('aria-expanded', 'false'); mobileBtn.setAttribute('aria-label', 'Abrir menú'); mobileBtn.textContent = '☰'; }
        if (quickMenuBtn) quickMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      };
      var openMobileMenu = function () {
        if (!mobilePanel) return;
        mobilePanel.hidden = false;
        mobilePanel.setAttribute('aria-hidden', 'false');
        if (mobileBackdrop) mobileBackdrop.hidden = false;
        if (mobileBtn) { mobileBtn.setAttribute('aria-expanded', 'true'); mobileBtn.setAttribute('aria-label', 'Cerrar menú'); mobileBtn.textContent = '✕'; }
        if (quickMenuBtn) quickMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        var firstLink = mobilePanel.querySelector('a, button');
        if (firstLink) firstLink.focus();
      };
      if (mobileBtn && navLinks) {
        mobileBtn.setAttribute('aria-controls', 'primary-navigation');
        navLinks.id = 'primary-navigation';
        mobileBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (mobilePanel && !mobilePanel.hidden) closeMobileMenu(); else if (mobilePanel) openMobileMenu();
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () {
            closeMobileMenu();
          });
        });

        document.addEventListener('click', function (e) {
          if (!header.contains(e.target) && mobilePanel && !mobilePanel.hidden) closeMobileMenu();
        });
      }
      if (quickMenuBtn) quickMenuBtn.addEventListener('click', openMobileMenu);
      if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);
      if (mobilePanel) {
        mobilePanel.querySelectorAll('a, [data-mobile-menu-close]').forEach(function (link) { link.addEventListener('click', closeMobileMenu); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !mobilePanel.hidden) closeMobileMenu(); });
      }

      // Todas las URLs públicas usan este único footer. Retiramos restos
      // estáticos de las plantillas antiguas para evitar duplicados.
      document.querySelectorAll('.landing-footer, .demo-footer').forEach(function (legacyFooter) {
        legacyFooter.remove();
      });
      var footer = document.querySelector('.legal-footer');
      if (!footer) {
        footer = document.createElement('footer');
        footer.className = 'legal-footer';
        (document.querySelector('.site-shell') || document.body).appendChild(footer);
      }
      if (!footer.innerHTML.trim()) {
        var socialProfiles = [
          { name: 'Facebook', username: 'somoscochecierto', url: 'https://www.facebook.com/somoscochecierto', icon: '<path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1z"/>' },
          { name: 'Instagram', username: 'somoscochecierto', url: 'https://www.instagram.com/somoscochecierto/', icon: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>' },
          { name: 'YouTube', username: '@somoscochecierto', url: 'https://www.youtube.com/@somoscochecierto', icon: '<path d="M21 8.2a2.8 2.8 0 0 0-2-2C17.2 5.7 12 5.7 12 5.7s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.6 12 29 29 0 0 0 3 15.8a2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .4-3.8A29 29 0 0 0 21 8.2z"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/>' },
          { name: 'TikTok', username: '@somoscochecierto', url: 'https://www.tiktok.com/@somoscochecierto', icon: '<path d="M14 4v10.2a3.8 3.8 0 1 1-3-3.7V7.3A7 7 0 1 0 17 14V8.8a7.1 7.1 0 0 0 3 1V7a4.7 4.7 0 0 1-3-3z"/>' },
          { name: 'X', username: '@cochecierto', url: 'https://x.com/cochecierto', icon: '<path d="M5 4h3.7l3.5 4.7L16.2 4H20l-6 7.2L20.5 20h-3.7l-4-5.2L8 20H4.2l6.4-7.7z"/>' }
        ];
        var socialLinks = socialProfiles.map(function (profile) {
          return '<a class="social-link" href="' + profile.url + '" target="_blank" rel="noopener noreferrer" aria-label="' + profile.name + ' · ' + profile.username + '" title="' + profile.name + ' · ' + profile.username + '"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + profile.icon + '</svg><span class="social-link-name">' + profile.name + '</span></a>';
        }).join('');
        footer.innerHTML = '<div class="footer-inner"><div class="footer-brand"><strong>CocheCierto</strong><span>Información clara para decidir mejor antes de comprar.</span></div><div class="footer-social" aria-label="Redes sociales"><span class="footer-social-label">Síguenos</span>' + socialLinks + '</div><nav class="footer-legal" aria-label="Información legal"><a href="' + base + 'legal/">Información legal</a><a href="' + base + 'legal/aviso-legal.html">Aviso legal</a><a href="' + base + 'legal/privacidad.html">Privacidad</a><a href="' + base + 'legal/cookies.html">Cookies</a><a href="' + base + 'legal/condiciones.html">Condiciones</a><a href="' + base + 'legal/accesibilidad.html">Accesibilidad</a><a href="' + base + 'quienes-somos/">Quiénes somos</a><a href="' + base + 'politica-editorial/">Política editorial</a><a href="mailto:hola@cochecierto.com">Contacto</a></nav><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' CocheCierto · Todos los derechos reservados</span><span>Decide con datos. Compra con más criterio.</span></div></div>';
      }

      // Regla global de conversión: mostrar el problema, la ayuda disponible
      // y un siguiente paso de baja fricción en cada página pública informativa.
      var isLegalPage = document.body.classList.contains('legal-page') || !!document.querySelector('.legal-page');
      var isHomePage = path === '/' || path === '/index.html' || path === '';
      var isValuatorPage = path.indexOf('/valorador/') !== -1;
      var isInternalCopy = path.indexOf('/coche.cierto/') !== -1 || path.indexOf('/mvp-valorador/') !== -1 || path.indexOf('/coche.subasta/') !== -1;
      if (!isLegalPage && !isHomePage && !isValuatorPage && !isInternalCopy && !document.querySelector('.conversion-orientation')) {
        var conversionCopy = {
          pain: '¿No sabes por dónde empezar?',
          solution: 'Ordena tu uso, presupuesto y comprobaciones antes de comparar coches.',
          action: 'Crear mi valoración gratuita →'
        };
        if (path.indexOf('/guias/') !== -1) {
          conversionCopy.pain = '¿Esta guía responde a tu caso?';
          conversionCopy.solution = 'Convierte lo que has leído en una orientación práctica para tu compra.';
        } else if (path.indexOf('/recursos/') !== -1) {
          conversionCopy.pain = '¿No sabes qué recurso necesitas?';
          conversionCopy.solution = 'Responde unas preguntas y empieza por el paso que más encaja contigo.';
        } else if (path.indexOf('/analizar-coche/') !== -1) {
          conversionCopy.pain = '¿Tienes un anuncio y te faltan datos?';
          conversionCopy.solution = 'Define primero tu presupuesto y tus criterios antes de desplazarte a verlo.';
        } else if (path.indexOf('/demo') !== -1 || path.indexOf('/casos-reales/') !== -1) {
          conversionCopy.pain = '¿Quieres aplicar este ejemplo a tu situación?';
          conversionCopy.solution = 'Crea una orientación inicial con tus datos, sin registrarte para ver el resultado.';
        }
        var orientation = document.createElement('section');
        orientation.className = 'conversion-orientation';
        orientation.setAttribute('aria-label', 'Siguiente paso recomendado');
        orientation.innerHTML = '<div class="conversion-orientation-copy"><span class="conversion-orientation-kicker">Siguiente paso</span><strong>' + conversionCopy.pain + '</strong><span>' + conversionCopy.solution + '</span><small>Sin email para empezar · Resultado orientativo · No es asesoramiento financiero ni garantía.</small></div><a class="conversion-orientation-cta" href="' + base + 'valorador/">' + conversionCopy.action + '</a>';
        header.insertAdjacentElement('afterend', orientation);
      }

      if (!document.querySelector('.beta-notice')) {
        var beta = document.createElement('aside');
        beta.className = 'beta-notice';
        beta.setAttribute('role', 'status');
        beta.innerHTML = '<strong>Versión beta</strong><span>Estamos probando CocheCierto. Los resultados son orientativos y pueden cambiar mientras validamos la plataforma.</span>';
        (document.querySelector('.site-shell') || document.body).prepend(beta);
      }
      var betaNotice = document.querySelector('.beta-notice');
      if (betaNotice && !betaNotice.dataset.autoHideScheduled) {
        betaNotice.dataset.autoHideScheduled = 'true';
        window.setTimeout(function () {
          if (betaNotice.isConnected) betaNotice.remove();
        }, 10000);
      }
    }

    if (!document.querySelector('link[rel="manifest"]')) {
      var manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = base + 'manifest.webmanifest';
      document.head.appendChild(manifest);
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      var appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);
      var appleStatus = document.createElement('meta');
      appleStatus.name = 'apple-mobile-web-app-status-bar-style';
      appleStatus.content = 'black-translucent';
      document.head.appendChild(appleStatus);
    }

    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register(base + 'sw.js').catch(function () {});
    }

    setupCookieConsent();
    setupInstallPrompt();

    if (window.CocheCiertoTheme) {
      var isLight = document.documentElement.classList.contains('theme-light');
      var btns = document.querySelectorAll('.theme-toggle-btn');
      btns.forEach(function (btn) { btn.textContent = isLight ? '☾' : '☼'; });
    }
  }

  function applyKnownLegalIdentity() {
    if (!document.querySelector('.legal-page')) return;
    var replacements = {
      '[FECHA]': '30/08/2026',
      '[VERSIÓN]': '0.1 beta',
      '[NOMBRE O RAZÓN SOCIAL]': 'Juan Yero (particular)',
      '[NIF]': '49707460K',
      '[DOMICILIO]': 'Rúa López Ferreiro 8, 32001, Ourense',
      '[TELÉFONO, SI PROCEDE]': '+34 698 132 323',
      '[TITULAR]': 'Juan Yero',
      '[GRATUITO / INFORMES / OTROS]': 'beta gratuita',
      '[HOSTING, EMAIL, PAGOS U OTROS]': 'Hosting y correo electrónico: Hostinger; analítica: Google Analytics; pagos: no activos en beta',
      '[LISTA DE PROVEEDORES]': 'Hostinger para hosting y correo electrónico; Google Analytics para analítica'
    };
    var roots = document.querySelectorAll('.legal-page, .legal-copy');
    roots.forEach(function (root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var value = node.nodeValue;
        Object.keys(replacements).forEach(function (key) { value = value.split(key).join(replacements[key]); });
        node.nodeValue = value;
      });
    });
  }

  function setupCookieConsent() {
    var key = 'cochecierto_cookie_preferences_v1';
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (saved) return;
    var banner = document.createElement('aside');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferencias de cookies');
    banner.innerHTML = '<div><strong>Tu privacidad importa</strong><p>Usamos cookies técnicas para que la web funcione. Las cookies opcionales solo se activarán si las aceptas.</p><a href="/legal/cookies.html">Ver política de cookies</a></div><div class="cookie-actions"><button type="button" data-cookie="reject">Rechazar opcionales</button><button type="button" data-cookie="configure">Configurar</button><button type="button" class="primary" data-cookie="accept">Aceptar opcionales</button></div>';
    document.body.appendChild(banner);
    function save(mode) { var preferences = {necessary:true, analytics:mode === 'accept', marketing:mode === 'accept', at:new Date().toISOString()}; localStorage.setItem(key, JSON.stringify(preferences)); if (preferences.analytics) enableAnalytics(preferences); banner.remove(); }
    banner.querySelector('[data-cookie="reject"]').onclick = function () { save('reject'); };
    banner.querySelector('[data-cookie="accept"]').onclick = function () { save('accept'); };
    banner.querySelector('[data-cookie="configure"]').onclick = function () {
      var panel = document.createElement('div');
      panel.className = 'cookie-settings';
      panel.setAttribute('role', 'dialog');
      panel.innerHTML = '<div class="cookie-settings-card"><h2>Configura tus cookies</h2><p>Las cookies técnicas son necesarias. Las demás son opcionales.</p><label><input type="checkbox" checked disabled> Técnicas <small>Siempre activas</small></label><label><input type="checkbox" data-category="analytics"> Analítica <small>[Proveedor pendiente]</small></label><label><input type="checkbox" data-category="marketing"> Marketing <small>[Proveedor pendiente]</small></label><button type="button" data-save-cookies>Guardar preferencias</button></div>';
      document.body.appendChild(panel);
      panel.querySelector('[data-save-cookies]').onclick = function () { var preferences = {necessary:true, analytics:panel.querySelector('[data-category="analytics"]').checked, marketing:panel.querySelector('[data-category="marketing"]').checked, at:new Date().toISOString()}; localStorage.setItem(key, JSON.stringify(preferences)); if (preferences.analytics) enableAnalytics(preferences); panel.remove(); banner.remove(); };
    };
  }

  // The Measurement ID is intentionally empty until the owner creates the GA4
  // property. It is public configuration, never a secret; consent still gates
  // loading the Google script and sending events.
  function enableAnalytics(preferences) {
    if (!preferences || preferences.analytics !== true || window.__cocheciertoAnalyticsLoaded) return;
    var measurementId = window.COCHECIERTO_GA4_MEASUREMENT_ID || '';
    if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;
    window.__cocheciertoAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
    window.trackCocheCierto('page_view');
  }

  function setupInstallPrompt() {
    var isAppleTablet = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    var isMobileDevice = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) || isAppleTablet;
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!isMobileDevice || isStandalone) return;
    var deferredPrompt;
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
      if (document.querySelector('.install-app-prompt')) return;
      var prompt = document.createElement('aside');
      prompt.className = 'install-app-prompt';
      prompt.setAttribute('role', 'status');
      prompt.innerHTML = '<div><strong>Usa CocheCierto como una app</strong><span>Accede más rápido desde tu móvil o tablet.</span></div><button type="button" class="install-app-button">Añadir</button><button type="button" class="install-app-close" aria-label="Cerrar aviso">×</button>';
      document.body.appendChild(prompt);
      prompt.querySelector('.install-app-button').addEventListener('click', function () {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () { prompt.remove(); deferredPrompt = null; });
      });
      prompt.querySelector('.install-app-close').addEventListener('click', function () { prompt.remove(); });
    });

    var isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
    if (isAppleMobile && !document.querySelector('.install-app-prompt')) {
      var iosPrompt = document.createElement('aside');
      iosPrompt.className = 'install-app-prompt install-app-prompt-ios';
      iosPrompt.setAttribute('role', 'status');
      iosPrompt.innerHTML = '<div><strong>Añade CocheCierto a tu pantalla de inicio</strong><span>Pulsa Compartir y después “Añadir a pantalla de inicio” para usarlo como una app.</span></div><button type="button" class="install-app-close" aria-label="Cerrar aviso">×</button>';
      document.body.appendChild(iosPrompt);
      iosPrompt.querySelector('.install-app-close').addEventListener('click', function () { iosPrompt.remove(); });
    }
  }

  if (document.readyState === 'loading') {
  window.trackCocheCierto = function(name, detail) {
    try {
      const preferences = JSON.parse(localStorage.getItem('cochecierto_cookie_preferences_v1') || '{}');
      if (preferences.analytics !== true) return;
      const safeDetail = detail && typeof detail === 'object' ? Object.fromEntries(Object.entries(detail).filter(([key]) => !/email|phone|name|address|answer|location/i.test(key))) : undefined;
      if (typeof window.gtag === 'function') window.gtag('event', name, safeDetail);
      window.dispatchEvent(new CustomEvent('cochecierto:conversion', { detail: { name, ...safeDetail } }));
    } catch (_) {}
  };
  document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    try { enableAnalytics(JSON.parse(localStorage.getItem('cochecierto_cookie_preferences_v1') || '{}')); } catch (_) {}
    document.addEventListener('click', function(event) {
      const cta = event.target.closest('a[href*="/valorador/"]');
      if (cta) window.trackCocheCierto('view_cta', { label: cta.textContent.trim().slice(0, 80) });
      if (event.target.closest('#start, #miniStart')) window.trackCocheCierto('start_diagnosis');
      if (event.target.closest('#next')) window.trackCocheCierto('question_completed');
      if (event.target.closest('#downloadReport, #makeDealerSheet')) window.trackCocheCierto('result_viewed');
    });
    document.addEventListener('submit', function(event) { if (event.target.matches('#lead, #emailGate')) window.trackCocheCierto('email_introduced'); });
  });
  } else {
    initHeader();
  }
})();
