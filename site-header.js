(function () {
  'use strict';

  function initHeader() {
    var path = window.location.pathname.replace(/\/index\.html$/, '/');
    var isSubdir = /\/[^\/]+\/+$/.test(path) && !path.endsWith('/mvp-valorador/');
    var base = isSubdir ? '../' : './';

    var currentKey = 'home';
    if (path.indexOf('/como-funciona/') !== -1) currentKey = 'como-funciona';
    else if (path.indexOf('/que-analizamos/') !== -1) currentKey = 'que-analizamos';
    else if (path.indexOf('/demo/') !== -1) currentKey = 'demo';
    else if (path.indexOf('/metodologia/') !== -1) currentKey = 'metodologia';
    else if (path.indexOf('/valorador/') !== -1) currentKey = 'valorador';
    else if (path.indexOf('/recursos/') !== -1) currentKey = 'recursos';

    var headerHTML = '<a class="brand-lockup" href="' + base + '" aria-label="CocheCierto, inicio">' +
      '<img src="' + base + 'brand-symbol.svg" alt="CocheCierto" width="36" height="36">' +
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
        mobileBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = navLinks.classList.toggle('is-open');
          mobileBtn.setAttribute('aria-expanded', String(isOpen));
          mobileBtn.textContent = isOpen ? '✕' : '☰';
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

    if (window.CocheCiertoTheme) {
      var isLight = document.documentElement.classList.contains('theme-light');
      var btns = document.querySelectorAll('.theme-toggle-btn');
      btns.forEach(function (btn) { btn.textContent = isLight ? '☾' : '☼'; });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();