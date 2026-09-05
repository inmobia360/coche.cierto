# Análisis del informe independiente: distribución responsive del valorador

## Conclusión

El informe describe un problema de composición visual plausible, pero no aporta capturas, URL, mediciones ni una referencia de código que permita confirmar que exista exactamente esa composición en la versión actual. Por tanto, sus afirmaciones deben tratarse como requisitos de revisión y no como defectos ya verificados.

La implementación actual del valorador usa una tarjeta de resultado y varios bloques de informe (`.facts-grid`, `.share-report-card`, métricas y navegación móvil), pero no se ha localizado un componente con las clases o nombres `floating-cards`, `floating-card` o `vehicle-image`. El CSS recomendado por el informe no debe copiarse literalmente: primero hay que mapearlo a la arquitectura real.

Sí hay evidencia de una decisión responsive que conviene revisar: en `valorador/styles.css`, `.report-triad` y `.facts-grid` pasan directamente a una sola columna hasta 760 px, mientras `.report-metrics` y `.timeline-grid` usan dos columnas. Esto no prueba un fallo, pero significa que la regla del informe de usar dos fichas por fila desde 380 px no coincide con la implementación actual y solo debe adoptarse si esas fichas son realmente el bloque al que se refiere.

## Hallazgos clasificados

| Hallazgo del informe | Estado frente al repositorio | Acción |
|---|---|---|
| Fichas demasiado estrechas o texto cortado | No verificable sin captura o ejecución visual | Reproducir en los diez anchos indicados y registrar evidencia |
| Solapamiento de fichas e imagen del coche | No confirmado; no se encontró esa composición en `valorador/` | Localizar el componente real antes de tocar estilos |
| Navegación inferior cubre contenido | Riesgo no confirmado; `.mobile-bottom-nav` solo aparece en una regla de impresión del CSS revisado | Localizar su implementación real y medir altura antes de añadir espacio inferior |
| Quiebres de palabra y anchos fijos | Riesgo a revisar; hay varias rejillas responsive existentes | Auditar `min-width`, `overflow`, `white-space` y columnas |
| Rejillas móviles actuales | Confirmado en CSS: `report-triad` y `facts-grid` son una columna hasta 760 px | Comparar con la jerarquía deseada y con el ancho real del contenido |
| Orden de lectura móvil | Requisito coherente con accesibilidad | Verificar DOM y foco, no solo la posición visual |
| Cambios de identidad visual | El informe pide conservarlos | Bloque de regresión: no modificar colores, textos, iconos ni marca |

## Decisiones de diseño recomendadas

1. Mantener el escritorio como referencia y limitar los cambios a media queries.
2. En móvil, pasar las fichas al flujo normal del documento; reservar el posicionamiento absoluto para decoración no informativa.
3. Usar `minmax(0, 1fr)`, `min-width: 0`, `box-sizing: border-box` y `overflow-wrap` solo cuando evite desbordamiento sin partir palabras de forma ilegible.
4. Aplicar dos columnas desde 380 px y una columna por debajo de 380 px solo si la estructura real contiene tres fichas equivalentes.
5. Mantener la imagen después de las fichas en el DOM móvil, con `width: 100%`, `height: auto` y límites proporcionales.
6. Reservar espacio inferior para la navegación fija usando la altura comprobada y `env(safe-area-inset-bottom)`.

## Riesgos del informe

- Fija valores concretos (`767 px`, `380 px`, `96–112 px`) sin explicar si proceden de la interfaz actual. Deben validarse contra contenido real y no convertirse en constantes obligatorias sin prueba.
- Pide que la imagen siga siendo protagonista, pero también que aparezca después de las fichas en móvil. Esto debe resolverse con jerarquía, tamaño y espaciado, no superponiendo contenido.
- «No modificar textos» puede entrar en conflicto con legibilidad si una etiqueta es demasiado larga. La primera solución debe ser de layout; cualquier cambio de copy requiere revisión de `COPY-MENSAJE`.
- La comparación visual final exige evidencia renderizada en diez anchos. Una inspección del CSS o una prueba a un único ancho no es suficiente.

## Plan de verificación antes de implementar

- Identificar en `valorador/` el bloque exacto que corresponde a la tarjeta, fichas, imagen y navegación.
- Ejecutar la experiencia en 320, 360, 375, 390, 414, 768, 820, 1024, 1280 y 1440 px.
- Tomar capturas antes y después; comprobar desbordamiento horizontal, clipping, solapamientos, foco, lectura y área segura inferior.
- Ejecutar `node --check valorador/app.js` y las comprobaciones de regresión disponibles.
- Si el componente no existe en la versión actual, crear una nueva spec de diseño responsive antes de introducirlo; no añadir una composición visual solo porque el informe la presupone.

## Cambio aplicado tras la evidencia visual

La captura aportada confirma que la composición pertenece a la landing raíz (`index.html` + `landing.css`), no al informe interno de `valorador/`. En `landing.css`, hasta 540 px las fichas conservaban `position: absolute`, `width: 31%` y tipografía de 11 px; esa combinación causaba el recorte visible de «Por comprobar».

Se ha corregido el comportamiento móvil en `landing.css`:

- Las fichas pasan al flujo normal y usan una rejilla de dos columnas desde 380 px.
- «Riesgo pendiente» ocupa toda la fila.
- Por debajo de 380 px las tres fichas pasan a una columna.
- La imagen queda después de las fichas, con ancho fluido y sin solapamiento informativo.
- Se ocultan los conectores decorativos en móvil y se conserva la elevación mediante borde, sombra y radio.
- La navegación inferior ya reserva espacio mediante la regla global de `theme.css`.

La identidad visual, el copy y la composición de escritorio permanecen sin cambios. La comparación posterior debe ejecutarse en un navegador real en los diez anchos del informe; la política del entorno no permitió abrir el archivo local mediante el navegador automatizado, por lo que esa evidencia visual final queda pendiente de una comprobación manual o de staging.
