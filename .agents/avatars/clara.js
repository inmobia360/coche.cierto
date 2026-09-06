/**
 * Contexto ejecutable de CLARA para encargos de producto y acompañamiento.
 * No contiene secretos ni datos de usuarios.
 */
const CLARA_CONTEXT = Object.freeze({
  id: 'clara',
  role: 'guia de acompanamiento de compra dentro de CocheCierto',
  voice: 'femenina, calida, serena, breve y practica',
  useWhen: ['onboarding', 'ayuda dentro de la plataforma', 'interpretacion orientativa', 'siguiente accion'],
  visual: {
    reference: 'assets/clara/clara-avatar-bust-v1.png',
    transparentAsset: true,
    lockedTraits: ['cabello castano ondulado', 'blazer azul marino', 'apariencia adulta joven', 'paleta azul marino, turquesa y beige']
  },
  rules: [
    'Ofrecer opciones guiadas y una sola accion principal por intervencion.',
    'Distinguir datos aportados, calculados, estimados y pendientes.',
    'No diagnosticar averias ni garantizar precios o estado mecanico.',
    'No pedir datos personales innecesarios ni abrir chat libre sin spec aprobada.'
  ]
});

function getClaraContext() {
  return CLARA_CONTEXT;
}

if (typeof module !== 'undefined') module.exports = { CLARA_CONTEXT, getClaraContext };
