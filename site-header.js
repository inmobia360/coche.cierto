/**
 * CocheCierto - Componente Universal de Cabecera y Navegación
 */
(function () {
  'use strict';

  function initHeader() {
    var path = window.location.pathname.replace(/\/index\.html$/, '/');
    var isSubdir = /\/[^\/]+\/+$/.test(path) && !path.endsWith('/mvp-valorador/');
    var pathParts = path.split('/').filter(Boolean);
    var base = pathParts.length ? '../' : './';

    var currentKey = 'home';
    if (path.indexOf('/como-funciona/') !== -1) currentKey = 'como-funciona';
    else if (path.indexOf('/que-analizamos/') !== -1) currentKey = 'que-analizamos';
    else if (path.indexOf('/demo/') !== -1) currentKey = 'demo';
    else if (path.indexOf('/metodologia/') !== -1) currentKey = 'metodologia';
    else if (path.indexOf('/valorador/') !== -1) currentKey = 'valorador';
    else if (path.indexOf('/recursos/') !== -1) currentKey = 'recursos';

    var headerHTML = '<a class="brand-lockup" href="' + base + '" aria-label="CocheCierto, inicio">' +
      '<img src="' + base + (document.documentElement.classList.contains('theme-light') ? 'brand-symbol-light.svg' : 'brand-symbol.svg') + '" alt="CocheCierto" width="36" height="36">' +
      '<span>Coche<strong>Cierto</strong></span>' +
      '</a>' +
      '<nav class="nav-links" aria-label="Navegación principal">' +
      '<a href="' + base + 'como-funciona/"' + (currentKey === 'como-funciona' ? ' aria-current="page"' : '') + '>Cómo funciona</a>' +
      '<a href="' + base + 'que-analizamos/"' + (currentKey === 'que-analizamos' ? ' aria-current="page"' : '') + '>Qué analizamos</a>' +
      '<a href="' + base + 'demo/"' + (currentKey === 'demo' ? ' aria-current="page"' : '') + '>Informe demo</a>' +
      '<a href="' + base + 'metodologia/"' + (currentKey === 'metodologia' ? ' aria-current="page"' : '') + '>Metodología</a>' +
      '<a href="' + base + 'recursos/"' + (currentKey === 'recursos' ? ' aria-current="page"' : '') + '>Recursos</a>' +
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

    setupInstallPrompt();

    if (window.CocheCiertoTheme) {
      var isLight = document.documentElement.classList.contains('theme-light');
      var btns = document.querySelectorAll('.theme-toggle-btn');
      btns.forEach(function (btn) { btn.textContent = isLight ? '☾' : '☼'; });
    }
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
