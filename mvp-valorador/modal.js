document.addEventListener('DOMContentLoaded', function () {
  var modal = document.createElement('div');
  modal.className = 'valuator-modal';
  modal.id = 'valuatorModal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'valuatorModalTitle');
  modal.innerHTML = '<div class="valuator-backdrop" data-close-valuator></div><div class="valuator-dialog"><button class="valuator-close" type="button" aria-label="Cerrar valoración">×</button><p class="eyebrow">CocheCierto Decide · 5 minutos</p><h2 id="valuatorModalTitle">¿Qué quieres hacer ahora?</h2><div class="modal-choices"><button class="mini-choice selected" data-modal-intent="buy" type="button" aria-pressed="true">Comprar</button><button class="mini-choice" data-modal-intent="change" type="button" aria-pressed="false">Cambiar mi coche</button><button class="mini-choice" data-modal-intent="inform" type="button" aria-pressed="false">Solo informarme</button></div><button class="button mini-submit" id="modalStart" type="button">Continuar</button><p class="mini-note">Sin registro para empezar · Puedes salir cuando quieras</p></div>';
  document.body.append(modal);

  var open = document.querySelector('#openValuator');
  var start = modal.querySelector('#modalStart');
  var dialog = modal.querySelector('.valuator-dialog');
  var lastFocus;

  function selectIntent(intent) {
    modal.querySelectorAll('[data-modal-intent]').forEach(function (btn) {
      var isSel = btn.dataset.modalIntent === intent;
      btn.classList.toggle('selected', isSel);
      btn.setAttribute('aria-pressed', String(isSel));
    });
  }

  function show() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    var closeBtn = modal.querySelector('.valuator-close');
    if (closeBtn) closeBtn.focus();
  }

  function hide() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    var frame = dialog.querySelector('iframe');
    if (frame) {
      frame.remove();
      dialog.classList.remove('valuator-dialog--flow');
      dialog.querySelector('.eyebrow').hidden = false;
      dialog.querySelector('#valuatorModalTitle').hidden = false;
      dialog.querySelector('.modal-choices').hidden = false;
      dialog.querySelector('#modalStart').hidden = false;
      dialog.querySelector('.mini-note').hidden = false;
    }
    if (lastFocus) lastFocus.focus();
  }

  function startFlow(event) {
    if (event) event.preventDefault();
    var selected = modal.querySelector('.selected');
    var intent = selected ? (selected.dataset.modalIntent || 'buy') : 'buy';
    dialog.querySelector('.eyebrow').hidden = true;
    dialog.querySelector('#valuatorModalTitle').hidden = true;
    dialog.querySelector('.modal-choices').hidden = true;
    start.hidden = true;
    dialog.querySelector('.mini-note').hidden = true;
    dialog.classList.add('valuator-dialog--flow');
    var frame = document.createElement('iframe');
    frame.src = './valorador/?intent=' + intent + '&skipIntro=1';
    frame.title = 'Formulario de valoración CocheCierto';
    frame.loading = 'eager';
    dialog.append(frame);
    frame.addEventListener('load', function () {
      try {
        frame.contentWindow.document.querySelector('#screen').focus();
      } catch (e) {}
    }, { once: true });
  }

  if (open) open.addEventListener('click', show);
  if (start) start.addEventListener('click', startFlow);

  modal.querySelectorAll('[data-close-valuator]').forEach(function (x) {
    x.addEventListener('click', hide);
  });
  var closeBtn = modal.querySelector('.valuator-close');
  if (closeBtn) closeBtn.addEventListener('click', hide);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) hide();
  });

  modal.querySelectorAll('[data-modal-intent]').forEach(function (button) {
    button.addEventListener('click', function () {
      selectIntent(button.dataset.modalIntent);
    });
  });
});