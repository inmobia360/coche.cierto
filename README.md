# Auto1 Risk Lens

Extensión Chrome Manifest V3 para priorizar vehículos visibles en Auto1 por riesgo orientativo.

## Qué hace el MVP

- En la lista de coches, añade un panel lateral con los cinco vehículos visibles de menor riesgo.
- En una ficha, calcula una puntuación 0–100 y explica los factores detectados.
- Usa solo texto visible en la página: kilometraje, año, precio, accidente, daños, prueba dinámica, mantenimiento, llaves, emisiones, COC y devolución Premium.
- Guarda dos criterios configurables desde el popup: kilometraje y antigüedad de referencia.

## Instalación local

1. Abre `chrome://extensions`.
2. Activa **Modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y selecciona esta carpeta.
4. Abre o recarga una lista de Auto1 y entra en una ficha.

El precio se muestra como contexto, pero no penaliza por sí solo a un coche caro: el objetivo es riesgo, no precio mínimo. La puntuación no sustituye una inspección mecánica ni una comprobación documental. La ausencia de datos se trata como incertidumbre, no como una garantía de buen estado.
