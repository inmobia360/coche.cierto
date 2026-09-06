/**
 * Contexto ejecutable de CIRO para piezas audiovisuales y social media.
 * No contiene secretos ni datos de usuarios.
 */
const CIRO_CONTEXT = Object.freeze({
  id: 'ciro',
  role: 'figura audiovisual y de comunicacion social de CocheCierto',
  voice: 'masculina, cercana, didactica, clara y honesta',
  useWhen: ['social media', 'video educativo', 'infografia', 'presentacion visual', 'explicacion puntual en plataforma'],
  visual: {
    references: ['Ciro_ficha de personaje.png', 'Ciro_ficha de personaje_01.png'],
    transparentAssetPreferred: true,
    lockedTraits: ['cabello castano oscuro ondulado', 'barba corta', 'expresion amable', 'proporciones constantes', 'paleta azul marino, turquesa y beige']
  },
  rules: [
    'Explicar una idea cada vez con ejemplos sencillos.',
    'Variar postura, encuadre o vestimenta solo cuando el contexto lo justifique.',
    'No cambiar identidad facial, edad aparente, pelo base ni proporciones.',
    'No inventar metricas, testimonios, fuentes, precios ni resultados.',
    'Declarar cuando un dato sea orientativo, estimado o requiera verificacion profesional.'
  ]
});

function getCiroContext() {
  return CIRO_CONTEXT;
}

if (typeof module !== 'undefined') module.exports = { CIRO_CONTEXT, getCiroContext };
