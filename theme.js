/**
 * CocheCierto - Gestor Global de Tema (Dark / Light)
 * Sincronización instantánea con localStorage y soporte multi-pestaña.
 */
(function () {
  'use strict';
  const STORAGE_KEY = 'cc-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';
    if (isLight) {
      document.documentElement.classList.add('theme-light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    if (document.body) {
      if (isLight) {
        document.body.classList.add('theme-light');
        document.body.setAttribute('data-theme', 'light');
      } else {
        document.body.classList.remove('theme-light');
        document.body.setAttribute('data-theme', 'dark');
      }
    }
    updateButtons(isLight);
  }

  function updateButtons(isLight) {
    const buttons = document.querySelectorAll('.theme-toggle-btn, .theme-toggle, #themeToggle, .theme-control');
    buttons.forEach(btn => {
      btn.textContent = isLight ? '☾' : '☼';
      btn.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
      btn.title = isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
    });
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains('theme-light') ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Inicialización inmediata
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Vincular eventos al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getPreferredTheme());
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn, .theme-toggle, #themeToggle, .theme-control');
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });
  });

  // Sincronizar cambios entre pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
      applyTheme(e.newValue);
    }
  });

  window.CocheCiertoTheme = { toggle: toggleTheme, apply: applyTheme, get: getPreferredTheme };
})();
