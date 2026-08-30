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
    var base = pathParts.length ? '../' : './';
    var navIcon = function (name) {
      var paths = {home:'<path d="M4 10.5 12 4l8 6.5v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 20v-6h6v6"/>',scan:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M8 11h6M11 8v6"/>',report:'<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',method:'<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',tools:'<path d="m14.7 6.3 3-3 2 2-3 3M4 20l7.8-7.8 2 2L6 22H4z"/><path d="m13 5 6 6"/>'};
      return '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + paths[name] + '</svg>';
    };

    var currentKey = 'home';
    if (path.indexOf('/como-funciona/') !== -1) currentKey = 'como-funciona';
    else if (path.indexOf('/que-analizamos/') !== -1) currentKey = 'que-analizamos';
    else if (path.indexOf('/demo/') !== -1) currentKey = 'demo';
    else if (path.indexOf('/metodologia/') !== -1) currentKey = 'metodologia';
    else if (path.indexOf('/valorador/') !== -1) currentKey = 'valorador';
    else if (path.indexOf('/recursos/') !== -1) currentKey = 'recursos';

    var headerHTML = '<a class="brand-lockup" href="/" aria-label="CocheCierto, inicio">' +
      '<img src="/' + (document.documentElement.classList.contains('theme-light') ? 'brand-symbol-light.svg' : 'brand-symbol.svg') + '" alt="CocheCierto" width="36" height="36">' +
      '<span>Coche<strong>Cierto</strong></span>' +
      '</a>' +
      '<nav class="nav-links" aria-label="Navegación principal">' +
      '<a href="' + base + 'como-funciona/"' + (currentKey === 'como-funciona' ? ' aria-current="page"' : '') + '>' + navIcon('home') + '<span>Cómo funciona</span></a>' +
      '<a href="' + base + 'que-analizamos/"' + (currentKey === 'que-analizamos' ? ' aria-current="page"' : '') + '>' + navIcon('scan') + '<span>Qué analizamos</span></a>' +
      '<a href="' + base + 'demo/"' + (currentKey === 'demo' ? ' aria-current="page"' : '') + '>' + navIcon('report') + '<span>Informe demo</span></a>' +
      '<a href="' + base + 'metodologia/"' + (currentKey === 'metodologia' ? ' aria-current="page"' : '') + '>' + navIcon('method') + '<span>Metodología</span></a>' +
      '<a href="' + base + 'recursos/"' + (currentKey === 'recursos' ? ' aria-current="page"' : '') + '>' + navIcon('tools') + '<span>Recursos</span></a>' +
      '</nav>' +
      '<div class="header-actions">' +
      '<a class="nav-cta" href="' + base + 'valorador/">' + (currentKey === 'valorador' ? 'Diagnóstico activo' : 'Comenzar valoración') + '</a>' +
      '<button class="theme-toggle-btn" type="button" aria-label="Cambiar tema" title="Cambiar tema">☼</button>' +
      '<button class="mobile-menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>' +
      '</div>';

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
      if (mobileBtn && navLinks) {
        mobileBtn.setAttribute('aria-controls', 'primary-navigation');
        navLinks.id = 'primary-navigation';
        mobileBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = navLinks.classList.toggle('is-open');
          mobileBtn.setAttribute('aria-expanded', String(isOpen));
          mobileBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
          mobileBtn.textContent = isOpen ? '✕' : '☰';
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () {
            navLinks.classList.remove('is-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileBtn.setAttribute('aria-label', 'Abrir menú');
            mobileBtn.textContent = '☰';
          });
        });

        document.addEventListener('click', function (e) {
          if (!header.contains(e.target) && navLinks.classList.contains('is-open')) {
            navLinks.classList.remove('is-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileBtn.textContent = '☰';
          }
        });
      }

      if (!document.querySelector('.legal-footer')) {
        var footer = document.createElement('footer');
        footer.className = 'legal-footer';
        footer.innerHTML = '<nav aria-label="Información legal"><a href="' + base + 'legal/">Información legal</a> · <a href="' + base + 'legal/aviso-legal.html">Aviso legal</a> · <a href="' + base + 'legal/privacidad.html">Privacidad</a> · <a href="' + base + 'legal/cookies.html">Cookies</a> · <a href="' + base + 'legal/condiciones.html">Condiciones</a> · <a href="' + base + 'legal/accesibilidad.html">Accesibilidad</a> · <a href="mailto:hola@cochecierto.com">Contacto</a></nav>';
        (document.querySelector('.site-shell') || document.body).appendChild(footer);
      }

      if (!document.querySelector('.beta-notice')) {
        var beta = document.createElement('aside');
        beta.className = 'beta-notice';
        beta.setAttribute('role', 'status');
        beta.innerHTML = '<strong>Versión beta</strong><span>Estamos probando CocheCierto. Los resultados son orientativos y pueden cambiar mientras validamos la plataforma.</span>';
        (document.querySelector('.site-shell') || document.body).prepend(beta);
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
    function save(mode) { localStorage.setItem(key, JSON.stringify({necessary:true, analytics:mode === 'accept', marketing:mode === 'accept', at:new Date().toISOString()})); banner.remove(); }
    banner.querySelector('[data-cookie="reject"]').onclick = function () { save('reject'); };
    banner.querySelector('[data-cookie="accept"]').onclick = function () { save('accept'); };
    banner.querySelector('[data-cookie="configure"]').onclick = function () {
      var panel = document.createElement('div');
      panel.className = 'cookie-settings';
      panel.setAttribute('role', 'dialog');
      panel.innerHTML = '<div class="cookie-settings-card"><h2>Configura tus cookies</h2><p>Las cookies técnicas son necesarias. Las demás son opcionales.</p><label><input type="checkbox" checked disabled> Técnicas <small>Siempre activas</small></label><label><input type="checkbox" data-category="analytics"> Analítica <small>[Proveedor pendiente]</small></label><label><input type="checkbox" data-category="marketing"> Marketing <small>[Proveedor pendiente]</small></label><button type="button" data-save-cookies>Guardar preferencias</button></div>';
      document.body.appendChild(panel);
      panel.querySelector('[data-save-cookies]').onclick = function () { localStorage.setItem(key, JSON.stringify({necessary:true, analytics:panel.querySelector('[data-category="analytics"]').checked, marketing:panel.querySelector('[data-category="marketing"]').checked, at:new Date().toISOString()})); panel.remove(); banner.remove(); };
    };
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
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
