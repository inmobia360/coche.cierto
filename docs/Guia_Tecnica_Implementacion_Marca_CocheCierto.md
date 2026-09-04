# CocheCierto

## Guía técnica de implementación de marca y diseño digital

**Documento para:** desarrollo frontend, diseño UI/UX, marketing y control de calidad  
**Versión:** 1.0  
**Mercado inicial:** España  
**Estado:** dirección visual aprobada para implementación  
**Marca:** CocheCierto  

---

## 1. Objetivo del documento

Esta guía define cómo implementar la identidad de **CocheCierto** en una plataforma digital escalable. Convierte las decisiones de marca en especificaciones técnicas para evitar interpretaciones diferentes entre diseño, desarrollo y marketing.

El desarrollador deberá utilizar este documento como fuente principal para:

- Configurar los colores, tipografías, espacios y estilos globales.
- Implementar el logotipo y sus variantes.
- Construir la landing, el diagnóstico y las pantallas de resultados.
- Mantener coherencia entre web, aplicación móvil, documentos y campañas.
- Garantizar accesibilidad y funcionamiento responsive.
- Preparar una arquitectura reutilizable de componentes.

La marca debe sentirse como un **asesor digital independiente y fiable**, no como un concesionario, portal de anuncios, financiera o medio de aficionados al motor.

---

## 2. Fundamentos de marca

### 2.1 Posicionamiento

> CocheCierto es un asesor digital independiente que ayuda a elegir, comparar y comprar vehículo mediante el análisis de necesidades, presupuesto, financiación, coste total y riesgo.

### 2.2 Promesa

> **Te ayudamos a elegir con más criterio antes de comprar.**

### 2.3 Eslogan

> **Decide con datos. Compra con seguridad.**

### 2.4 Mensaje principal de producto

> **El coche correcto para tu vida y tu bolsillo.**

### 2.5 Principios de experiencia

1. Explicar antes de pedir una decisión.
2. Mostrar el coste real, no solo el precio o la cuota.
3. Diferenciar hechos, estimaciones y datos faltantes.
4. Advertir sin alarmismo.
5. Permitir que el resultado sea “no comprar todavía”.
6. No alterar recomendaciones orgánicas por acuerdos comerciales.
7. Comunicar cada cifra mediante una consecuencia comprensible.

---

## 3. Concepto visual

La identidad combina dos ideas:

- **Certeza:** representada por la letra C.
- **Decisión validada:** representada por una marca de verificación.

El isotipo consiste en una **C geométrica abierta con un check integrado en el lado derecho**. La construcción debe ser sencilla y legible en tamaños pequeños.

### 3.1 Significados del isotipo

La C puede representar:

- Coche.
- Certeza.
- Criterio.
- Coste real.
- Comparación.

El check representa:

- Diagnóstico completado.
- Compra validada.
- Recomendación explicada.
- Decisión informada.

### 3.2 Elementos que no deben incorporarse

- Silueta de automóvil.
- Cursor o mano haciendo clic.
- Escudo.
- Velocímetro.
- Alas.
- Bandera a cuadros.
- Carretera en perspectiva.
- Llave inglesa.
- Símbolo de euro dentro del logotipo.
- Efectos cromados o metálicos.

Estos recursos desplazarían la percepción hacia concesionario, taller, competición o financiación.

---

## 4. Sistema de logotipo

### 4.1 Logotipo principal

Composición horizontal:

```text
[ Isotipo C + check ]  CocheCierto
```

La palabra debe escribirse siempre como **CocheCierto**, sin espacio y con ambas letras C en mayúscula.

### 4.2 Versión sobre fondo oscuro

- C del isotipo: blanco cálido.
- Check: naranja de acción.
- “Coche”: blanco cálido.
- “Cierto”: naranja de acción.
- Eslogan: blanco con opacidad visual secundaria.

### 4.3 Versión sobre fondo claro

- C del isotipo: azul profundo.
- Check: naranja de acción.
- “Coche”: azul profundo.
- “Cierto”: naranja de acción.
- Eslogan: gris de análisis.

### 4.4 Versión monocromática

Utilizar exclusivamente:

- Todo blanco sobre fondos oscuros.
- Todo azul sobre fondos claros.
- Todo negro únicamente para documentación que lo exija.

No convertir la versión monocromática a escala de grises automática.

### 4.5 Isotipo

El isotipo se utilizará sin palabra en:

- Favicon.
- Icono de aplicación.
- Avatar en redes sociales.
- Indicador de carga.
- Watermark discreto.
- Componentes con espacio limitado.

### 4.6 Tamaños mínimos

| Aplicación | Tamaño mínimo recomendado |
|---|---:|
| Logotipo horizontal web | 140 px de ancho |
| Logotipo horizontal documento | 32 mm de ancho |
| Isotipo interfaz | 24 × 24 px |
| Favicon | 16 × 16 px |
| Icono táctil | 180 × 180 px |
| Icono PWA | 512 × 512 px |

En 16 px puede ser necesario utilizar una variante óptica simplificada del isotipo, con mayor grosor y separación.

### 4.7 Área de seguridad

Definir **X** como el grosor principal de la C. Mantener una distancia libre mínima de **1,5X** alrededor de todo el logotipo.

Ningún texto, borde, fotografía, botón o elemento interactivo debe entrar en esta zona.

### 4.8 Usos incorrectos

- No deformar horizontal o verticalmente.
- No rotar.
- No cambiar el naranja por otro color en una pieza aislada.
- No utilizar degradados dentro del logotipo maestro.
- No añadir sombras intensas.
- No separar el check de la C.
- No colocar el logotipo sobre fondos sin contraste.
- No sustituir la tipografía del wordmark.
- No escribir “Coche Cierto” ni “COCHE CIERTO”.

### 4.9 Archivos que debe recibir el repositorio

```text
/public/brand/
├── logo-horizontal-dark.svg
├── logo-horizontal-light.svg
├── logo-monochrome-white.svg
├── logo-monochrome-blue.svg
├── symbol-dark.svg
├── symbol-light.svg
├── favicon.svg
├── favicon-32.png
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
└── social-share-1200x630.png
```

Los SVG finales deberán utilizar trazados para el wordmark o incluir una estrategia explícita de tipografía. No se deben incrustar imágenes raster dentro de los SVG.

---

## 5. Paleta cromática

### 5.1 Colores maestros

| Token | Nombre | HEX | RGB aproximado | Referencia de impresión |
|---|---|---:|---:|---|
| `brand-blue-900` | Azul profundo | `#00263E` | 0, 38, 62 | Pantone 2965 C aprox. |
| `brand-orange-500` | Naranja acción | `#FC4C02` | 252, 76, 2 | Pantone 1655 C aprox. |
| `neutral-warm-50` | Blanco cálido | `#F7F8F5` | 247, 248, 245 | — |
| `neutral-500` | Gris análisis | `#667085` | 102, 112, 133 | — |
| `neutral-200` | Gris claro | `#D7DCE2` | 215, 220, 226 | — |
| `neutral-950` | Azul negro | `#071521` | 7, 21, 33 | — |

Las referencias Pantone son orientativas. Para producto digital, los valores HEX/RGB son la fuente de verdad. Para impresión deberá aprobarse una prueba física.

### 5.2 Escala azul

| Token | HEX | Uso |
|---|---:|---|
| `blue-950` | `#071521` | Fondo oscuro profundo |
| `blue-900` | `#00263E` | Color principal |
| `blue-800` | `#073653` | Superficie elevada oscura |
| `blue-700` | `#0B496D` | Hover sobre navegación oscura |
| `blue-200` | `#B8D0DF` | Líneas o información suave |
| `blue-100` | `#DCEAF2` | Fondo informativo claro |
| `blue-50` | `#EFF6FA` | Superficie informativa mínima |

### 5.3 Escala naranja

| Token | HEX | Uso |
|---|---:|---|
| `orange-700` | `#B93600` | Texto naranja accesible sobre fondo claro |
| `orange-600` | `#D94100` | Estado activo o pressed |
| `orange-500` | `#FC4C02` | CTA y marca |
| `orange-400` | `#FF6A2B` | Hover sobre fondos oscuros |
| `orange-100` | `#FFE1D4` | Fondo de etiqueta |
| `orange-50` | `#FFF2EC` | Fondo destacado muy suave |

### 5.4 Colores semánticos

Los estados de producto no deben depender únicamente del naranja de marca.

| Estado | Color | HEX |
|---|---|---:|
| Éxito | Verde | `#087F5B` |
| Advertencia | Ámbar | `#B54708` |
| Error | Rojo | `#C92A2A` |
| Información | Azul funcional | `#2563EB` |

Siempre combinar color con texto, icono o patrón. Nunca comunicar “recomendado”, “riesgo” o “error” solo mediante color.

### 5.5 Proporción cromática

- 70 % azul profundo y superficies derivadas.
- 20 % blanco y grises.
- 10 % naranja.

El naranja debe atraer la atención hacia acciones y conclusiones. No utilizar grandes bloques naranjas de forma continuada.

---

## 6. Tokens CSS

Implementar los colores y estilos como variables globales. No utilizar valores HEX repetidos directamente dentro de componentes.

```css
:root {
  color-scheme: light;

  /* Marca */
  --cc-blue-950: #071521;
  --cc-blue-900: #00263e;
  --cc-blue-800: #073653;
  --cc-blue-700: #0b496d;
  --cc-blue-200: #b8d0df;
  --cc-blue-100: #dceaf2;
  --cc-blue-50: #eff6fa;

  --cc-orange-700: #b93600;
  --cc-orange-600: #d94100;
  --cc-orange-500: #fc4c02;
  --cc-orange-400: #ff6a2b;
  --cc-orange-100: #ffe1d4;
  --cc-orange-50: #fff2ec;

  /* Neutros */
  --cc-white: #ffffff;
  --cc-warm-white: #f7f8f5;
  --cc-gray-50: #f8fafc;
  --cc-gray-100: #eef1f4;
  --cc-gray-200: #d7dce2;
  --cc-gray-500: #667085;
  --cc-gray-700: #344054;
  --cc-gray-900: #101828;

  /* Semánticos */
  --cc-success: #087f5b;
  --cc-warning: #b54708;
  --cc-danger: #c92a2a;
  --cc-info: #2563eb;

  /* Superficies y texto */
  --cc-bg-page: var(--cc-warm-white);
  --cc-bg-dark: var(--cc-blue-950);
  --cc-surface: var(--cc-white);
  --cc-surface-dark: var(--cc-blue-900);
  --cc-text-primary: var(--cc-gray-900);
  --cc-text-secondary: var(--cc-gray-500);
  --cc-text-on-dark: var(--cc-warm-white);
  --cc-border: var(--cc-gray-200);
  --cc-action: var(--cc-orange-500);
  --cc-action-hover: var(--cc-orange-600);
  --cc-focus: #ff8a50;
}
```

### 6.1 Tema oscuro

```css
[data-theme="dark"] {
  color-scheme: dark;
  --cc-bg-page: var(--cc-blue-950);
  --cc-surface: var(--cc-blue-900);
  --cc-text-primary: var(--cc-warm-white);
  --cc-text-secondary: #b8c4cf;
  --cc-border: #23445b;
}
```

El tema oscuro no debe invertir fotografías ni cambiar los colores del logotipo arbitrariamente.

---

## 7. Tipografía

### 7.1 Familias

- **Manrope:** titulares, navegación principal, botones y cifras destacadas.
- **Inter:** cuerpo, formularios, tablas, ayudas y textos extensos.

### 7.2 Carga

Preferir archivos WOFF2 autoalojados para mantener rendimiento, privacidad y control de versiones.

```css
@font-face {
  font-family: "Manrope";
  src: url("/fonts/manrope-variable.woff2") format("woff2");
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
}

@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-variable.woff2") format("woff2");
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
}
```

### 7.3 Escala tipográfica

Utilizar `clamp()` para evitar saltos bruscos.

```css
:root {
  --cc-font-display: clamp(2.5rem, 5vw, 4.75rem);
  --cc-font-h1: clamp(2.25rem, 4vw, 4rem);
  --cc-font-h2: clamp(1.75rem, 3vw, 3rem);
  --cc-font-h3: clamp(1.375rem, 2vw, 2rem);
  --cc-font-body-lg: 1.125rem;
  --cc-font-body: 1rem;
  --cc-font-small: 0.875rem;
  --cc-font-caption: 0.75rem;
}
```

### 7.4 Reglas

- Titulares: Manrope 700, `line-height: 1.08–1.2`.
- Cuerpo: Inter 400, `line-height: 1.5–1.7`.
- Botones: Manrope 650 o 700.
- Cifras: utilizar números tabulares cuando se comparen importes.
- Ancho máximo de párrafo: 65–72 caracteres.
- No utilizar mayúsculas completas en párrafos o botones largos.

---

## 8. Espaciado, rejilla y superficies

### 8.1 Escala de espaciado

```css
:root {
  --cc-space-1: 0.25rem;
  --cc-space-2: 0.5rem;
  --cc-space-3: 0.75rem;
  --cc-space-4: 1rem;
  --cc-space-5: 1.25rem;
  --cc-space-6: 1.5rem;
  --cc-space-8: 2rem;
  --cc-space-10: 2.5rem;
  --cc-space-12: 3rem;
  --cc-space-16: 4rem;
  --cc-space-20: 5rem;
  --cc-space-24: 6rem;
}
```

### 8.2 Contenedor

```css
.cc-container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}

@media (min-width: 768px) {
  .cc-container {
    width: min(100% - 3rem, 1200px);
  }
}
```

### 8.3 Radios

```css
:root {
  --cc-radius-sm: 0.5rem;
  --cc-radius-md: 0.75rem;
  --cc-radius-lg: 1rem;
  --cc-radius-xl: 1.5rem;
  --cc-radius-pill: 999px;
}
```

### 8.4 Sombras

Las sombras deben ser suaves y funcionales.

```css
:root {
  --cc-shadow-sm: 0 1px 2px rgb(0 38 62 / 0.08);
  --cc-shadow-md: 0 8px 24px rgb(0 38 62 / 0.10);
  --cc-shadow-lg: 0 20px 48px rgb(0 38 62 / 0.14);
}
```

Evitar resplandores naranjas, sombras negras intensas y efectos 3D.

---

## 9. Botones y enlaces

### 9.1 Botón primario

- Fondo: naranja `#FC4C02`.
- Texto: verificar contraste; cuando el blanco no alcance el nivel previsto en el tamaño aplicado, utilizar azul negro `#071521`.
- Hover: naranja `#D94100` con texto blanco o el par de contraste validado.
- Altura mínima recomendada: 48 px.
- Radio: 10–12 px.
- No utilizar degradado.

```css
.cc-button-primary {
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 0;
  border-radius: var(--cc-radius-md);
  background: var(--cc-orange-500);
  color: var(--cc-blue-950);
  font: 700 1rem/1 "Manrope", sans-serif;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease;
}

.cc-button-primary:hover {
  background: var(--cc-orange-400);
}

.cc-button-primary:active {
  transform: translateY(1px);
}

.cc-button-primary:focus-visible {
  outline: 3px solid var(--cc-focus);
  outline-offset: 3px;
}
```

### 9.2 Botón secundario

- Fondo transparente.
- Borde azul o blanco según superficie.
- No competir visualmente con el CTA principal.

### 9.3 Enlaces

- Los enlaces en cuerpo de texto deben distinguirse mediante color y subrayado.
- No utilizar únicamente naranja como indicador.
- Mantener estado `focus-visible` claramente perceptible.

### 9.4 Etiquetas de botones recomendadas

- `Comenzar diagnóstico`
- `Analizar un coche`
- `Comparar alternativas`
- `Ver recomendación detallada`
- `Guardar informe`

Evitar:

- `Comprar ahora`
- `Aprovechar oferta`
- `Última oportunidad`
- `Pedir mi coche`

---

## 10. Formularios y diagnóstico

### 10.1 Principio

El diagnóstico debe sentirse breve, progresivo y seguro. No mostrar un formulario extenso en una sola página.

### 10.2 Estructura

1. Motivo de compra.
2. Presupuesto e ingresos.
3. Forma de pago y financiación.
4. Uso y kilometraje.
5. Pasajeros y espacio.
6. Residencia, aparcamiento y recarga.
7. Preferencias.
8. Vehículos o anuncios concretos.

### 10.3 Campos

- Etiqueta visible encima del campo.
- Ayuda contextual solo cuando sea necesaria.
- Error debajo del campo, asociado mediante `aria-describedby`.
- No utilizar el placeholder como sustituto de la etiqueta.
- Mostrar unidades: €, km/año, meses, años, litros o kWh.
- Formatear importes sin alterar el valor accesible.

### 10.4 Progreso

Mostrar:

- Nombre de la etapa.
- Número de paso.
- Progreso total.
- Posibilidad de volver atrás.
- Guardado automático cuando exista cuenta o sesión persistente.

No utilizar únicamente una barra sin texto.

### 10.5 Privacidad contextual

Junto a ingresos, financiación y localización, explicar por qué se solicita el dato y cómo mejora la recomendación.

---

## 11. Pantalla del Índice CocheCierto

### 11.1 Jerarquía

1. Veredicto en lenguaje natural.
2. Puntuación de 0 a 100.
3. Nivel de confianza del diagnóstico.
4. Tres razones principales.
5. Coste mensual y coste total.
6. Riesgos y condiciones.
7. Alternativas.
8. Próxima acción.

### 11.2 Puntuación

El círculo o medidor es una ayuda visual. El valor debe existir también como texto HTML.

```html
<section class="cc-score" aria-labelledby="score-title">
  <h2 id="score-title">Índice CocheCierto</h2>
  <p class="cc-score__value">
    <strong>87</strong><span aria-hidden="true">/100</span>
  </p>
  <p class="cc-score__label">Recomendado</p>
  <p>Una opción sólida para tus necesidades y presupuesto.</p>
</section>
```

### 11.3 Clasificación

| Intervalo | Veredicto | Tratamiento |
|---:|---|---|
| 85–100 | Recomendado | Éxito + texto |
| 70–84 | Buena opción con condiciones | Información + condiciones |
| 50–69 | Existen alternativas mejores | Advertencia moderada |
| 0–49 | Compra de riesgo | Riesgo + explicación |

El naranja de marca puede destacar la puntuación, pero la clasificación debe incorporar etiqueta e icono.

### 11.4 Nivel de confianza

Mostrar como:

- Alto: datos suficientes y recientes.
- Medio: existen estimaciones relevantes.
- Bajo: faltan datos que pueden cambiar la conclusión.

No mostrar un resultado categórico cuando el nivel sea bajo.

---

## 12. Tarjetas de análisis

Cada tarjeta debe contener:

- Nombre de la dimensión.
- Valor o puntuación.
- Explicación breve.
- Estado textual.
- Enlace para ampliar información.

Dimensiones iniciales:

- Ajuste a necesidades.
- Asequibilidad.
- Coste total a cinco años.
- Financiación.
- Fiabilidad.
- Seguridad.
- Riesgo general.
- Valor futuro.
- Compatibilidad con ZBE.

### 12.1 Ejemplo

```html
<article class="cc-analysis-card">
  <header>
    <h3>Coste total a cinco años</h3>
    <strong>8,6/10</strong>
  </header>
  <p class="cc-status cc-status--positive">Muy competitivo</p>
  <p>El coste estimado se mantiene por debajo de alternativas equivalentes.</p>
  <a href="/metodologia/coste-total">Cómo se calcula</a>
</article>
```

---

## 13. Landing principal

### 13.1 Header

- Logotipo a la izquierda.
- Navegación: `Cómo funciona`, `Comparar`, `Coste total`, `Financiación`, `Recursos`.
- CTA: `Comenzar diagnóstico`.
- Menú móvil accesible.
- Header sticky solo si no reduce excesivamente la superficie útil.

### 13.2 Hero

**Eyebrow:**  
Asesor independiente para comprar coche

**H1:**  
El coche correcto para tu vida y tu bolsillo

**Texto:**  
Analizamos tus necesidades, presupuesto, financiación, coste total y riesgos para ayudarte a decidir con seguridad.

**CTA principal:**  
Comenzar diagnóstico

**CTA secundario:**  
Ver un ejemplo de análisis

### 13.3 Visual del hero

Utilizar una representación abstracta de datos, comparativas o diagnóstico. No utilizar como recurso principal un automóvil aislado con apariencia de catálogo.

### 13.4 Secciones

1. Cómo funciona.
2. Qué analiza CocheCierto.
3. Ejemplo de resultado.
4. Nuevo frente a usado.
5. Financiación y coste real.
6. Principios de independencia.
7. Testimonios o casos validados.
8. Preguntas frecuentes.
9. CTA final.

---

## 14. Navegación y arquitectura

### 14.1 Rutas iniciales

```text
/
/diagnostico
/comparar
/analizar-coche
/resultado/:id
/coste-total
/financiacion
/metodologia
/independencia
/recursos
/cuenta
/privacidad
/cookies
/terminos
```

### 14.2 Arquitectura preparada para escala

No codificar el país directamente en componentes. Preparar configuración para:

- Idioma.
- Moneda.
- Impuestos.
- Combustibles.
- Etiquetas ambientales.
- Unidades.
- Fuentes de precios.
- Reglas de financiación.
- Periodo de coste total.

Ejemplo:

```ts
type MarketConfig = {
  locale: string;
  currency: string;
  distanceUnit: "km" | "mi";
  energyUnits: Array<"l/100km" | "kWh/100km" | "mpg">;
  environmentalScheme?: string;
  defaultTcoYears: number;
};
```

---

## 15. Responsive design

### 15.1 Breakpoints orientativos

| Nombre | Desde |
|---|---:|
| Móvil | 0 px |
| Móvil grande | 480 px |
| Tablet | 768 px |
| Escritorio | 1024 px |
| Escritorio amplio | 1280 px |

Diseñar mobile-first. Los componentes deben responder al espacio disponible y no depender únicamente del ancho del dispositivo.

### 15.2 Móvil

- Una columna.
- CTA principal visible sin bloquear contenido.
- Campos con teclado y tipo de entrada adecuados.
- Tablas convertidas en tarjetas o scroll accesible.
- Puntuación antes del detalle.
- Navegación principal dentro de un diálogo o disclosure correctamente implementado.

### 15.3 Escritorio

- Contenedor máximo de 1200 px.
- Hero en dos columnas.
- Resultado con resumen sticky opcional y contenido principal.
- Comparador con columnas alineadas.

---

## 16. Accesibilidad

El objetivo mínimo es **WCAG 2.2 nivel AA**. La implementación deberá validarse contra la [especificación de W3C](https://www.w3.org/TR/WCAG22/).

### 16.1 Requisitos

- Contraste mínimo validado para texto, controles y estados.
- Navegación completa mediante teclado.
- Foco visible y consistente.
- Orden de tabulación lógico.
- Landmarks semánticos.
- Un único `h1` descriptivo por página.
- Etiquetas visibles en formularios.
- Errores anunciables y asociados al campo.
- Botones con nombre accesible.
- Iconos decorativos con `aria-hidden="true"`.
- Gráficos acompañados de texto o tabla.
- Respeto a `prefers-reduced-motion`.
- Zoom al 200 % sin pérdida funcional.
- No bloquear orientación o escalado móvil.

### 16.2 Tamaños táctiles

Aunque WCAG 2.2 AA establece un mínimo contextual de 24 × 24 CSS px, se recomienda implementar controles principales de **44–48 px** para una experiencia más cómoda.

### 16.3 ARIA

Utilizar primero HTML nativo. Aplicar ARIA solo cuando la semántica nativa no sea suficiente. Seguir los patrones oficiales de [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/).

---

## 17. Movimiento y microinteracciones

### Permitido

- Transiciones de 120–200 ms.
- Cambio suave de color.
- Desplazamiento de 1–2 px al pulsar.
- Animación progresiva del índice cuando no genere retraso.
- Skeletons discretos durante cálculos.

### Evitar

- Rebotes repetitivos.
- Pulsos constantes en botones.
- Fondos con partículas que consuman recursos en móvil.
- Contadores largos que retrasen el resultado.
- Animaciones que simulen urgencia.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 18. Iconografía e ilustración

### 18.1 Iconos

- Estilo lineal.
- Trazo consistente.
- Terminales redondeados.
- Vista `24 × 24`.
- No mezclar librerías diferentes en una misma interfaz.
- No depender del icono para explicar una acción.

### 18.2 Visualización de datos

- Utilizar barras, comparativas y escalas simples.
- Mostrar valores exactos junto al gráfico.
- No utilizar gráficos 3D.
- No truncar ejes de manera engañosa.
- Indicar periodos, unidades y supuestos.
- Preparar texto alternativo o tabla equivalente.

### 18.3 Fotografía

Priorizar escenarios reales:

- Familias usando el coche.
- Conducción urbana.
- Aparcamiento.
- Carga y espacio.
- Revisión de un vehículo usado.
- Recarga eléctrica.

Evitar fotografía de lujo, velocidad, conducción peligrosa o personas posando como en un concesionario.

---

## 19. SEO, metadatos y marca

### 19.1 Título inicial

```html
<title>CocheCierto | Elige coche nuevo o usado con datos</title>
```

### 19.2 Descripción

```html
<meta
  name="description"
  content="Compara coche nuevo y usado según tu presupuesto, financiación, uso, coste total y riesgos. Decide con datos y compra con seguridad."
/>
```

### 19.3 Open Graph

Preparar una imagen de 1200 × 630 px con:

- Logotipo.
- Claim principal.
- Fondo azul profundo.
- Detalle naranja.
- Sin texto pequeño.

### 19.4 Datos estructurados

Implementar únicamente schemas que describan contenido real. No utilizar valoraciones agregadas si no se dispone de reseñas auténticas y verificables.

---

## 20. Rendimiento

### Requisitos

- SVG optimizado para logotipos e iconos.
- AVIF o WebP para fotografía, con fallback si es necesario.
- Dimensiones declaradas para evitar saltos de layout.
- Lazy loading debajo del primer viewport.
- Fuentes WOFF2 con subconjuntos necesarios.
- Evitar librerías de animación para interacciones simples.
- Separar el cálculo pesado del hilo principal cuando proceda.
- Cargar la experiencia básica incluso si fallan servicios analíticos.

### Objetivos orientativos

- LCP ≤ 2,5 s en condiciones representativas.
- CLS ≤ 0,1.
- INP ≤ 200 ms.
- JavaScript inicial limitado y medido.

Estos objetivos deberán medirse con datos de laboratorio y posteriormente con datos reales de usuarios.

---

## 21. Privacidad y confianza

### Reglas de interfaz

- No marcar casillas de marketing por defecto.
- Separar consentimiento necesario y promocional.
- Explicar el uso de ingresos y datos económicos.
- Permitir borrar o exportar diagnósticos.
- No mostrar información económica sensible en URLs.
- No incluir datos personales en herramientas de analítica sin base válida.
- Identificar resultados patrocinados.
- Mostrar fecha o vigencia de precios y cálculos.

### Mensaje visible

> Tus datos se utilizan para personalizar el diagnóstico. No vendemos tu información personal ni modificamos la recomendación para favorecer un coche concreto.

El texto final deberá validarse jurídicamente antes de producción.

---

## 22. Estructura de componentes

Ejemplo independiente del framework:

```text
/src/components/
├── brand/
│   ├── Logo
│   ├── BrandMark
│   └── BrandSignature
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Checkbox
│   ├── RadioCard
│   ├── Badge
│   ├── Tooltip
│   ├── Alert
│   ├── Modal
│   └── Progress
├── diagnosis/
│   ├── DiagnosisStepper
│   ├── QuestionGroup
│   ├── BudgetInput
│   └── DiagnosisSummary
├── results/
│   ├── CocheCiertoScore
│   ├── ConfidenceLevel
│   ├── AnalysisCard
│   ├── CostBreakdown
│   ├── RiskList
│   └── AlternativeCard
└── layout/
    ├── Header
    ├── Footer
    ├── Container
    └── Section
```

Cada componente debe documentar:

- Propiedades.
- Estados.
- Variantes.
- Comportamiento responsive.
- Requisitos de accesibilidad.
- Ejemplo de uso.

---

## 23. Estados obligatorios

Todos los componentes interactivos deben diseñarse e implementarse en:

- Default.
- Hover.
- Focus visible.
- Active/pressed.
- Disabled.
- Loading.
- Success.
- Warning.
- Error.
- Empty.

El estado disabled no debe ser la única manera de explicar por qué una acción no está disponible.

---

## 24. Contenido y formato de datos

### 24.1 Moneda

Utilizar `Intl.NumberFormat`.

```ts
const money = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
```

### 24.2 Fechas

Mostrar formato local y conservar ISO 8601 en datos internos.

### 24.3 Estimaciones

Toda estimación deberá indicar:

- Intervalo o margen cuando sea relevante.
- Fecha de cálculo.
- Periodo analizado.
- Supuestos principales.
- Datos faltantes.

### 24.4 Lenguaje

Preferir:

- “Coste estimado”.
- “Según los datos disponibles”.
- “Buena opción con condiciones”.
- “Necesitamos comprobar”.

Evitar:

- “Garantizado”.
- “Sin riesgo”.
- “La mejor compra”.
- “Precio definitivo”, salvo que realmente lo sea.

---

## 25. Analítica de producto

Medir eventos sin registrar información sensible innecesaria.

### Eventos recomendados

```text
diagnosis_started
diagnosis_step_completed
diagnosis_abandoned
diagnosis_completed
vehicle_added
comparison_started
comparison_completed
report_viewed
report_downloaded
alternative_viewed
methodology_opened
financing_details_opened
cta_clicked
```

Cada evento debe incluir únicamente propiedades necesarias, documentadas y revisadas.

### Métrica principal

> Porcentaje de usuarios que completan un diagnóstico y declaran que les ayudó a confirmar, cambiar, negociar o aplazar una compra.

---

## 26. Pruebas y control de calidad

### 26.1 Visual

- Logotipo correcto en fondos claros y oscuros.
- Colores provenientes de tokens.
- Sin valores arbitrarios dentro de componentes.
- Tipografía y pesos correctos.
- Espaciado consistente.
- Sin desbordamientos a 320 px.
- Zoom al 200 %.
- Modos claro y oscuro.

### 26.2 Funcional

- Formularios utilizables con teclado.
- Progreso conservado al volver atrás.
- Errores asociados a sus campos.
- Cálculos consistentes entre pantallas e informe.
- Moneda y unidades correctas.
- Estados vacíos y fallos de red.
- Navegación sin JavaScript cuando sea razonablemente posible.

### 26.3 Accesibilidad

- Auditoría automatizada.
- Prueba manual de teclado.
- Lectura básica con lector de pantalla.
- Contraste de todas las combinaciones.
- Foco visible.
- Nombres accesibles.
- Orden semántico de encabezados.
- Equivalente textual de gráficos.

### 26.4 Navegadores

Definir una matriz basada en analítica. Inicialmente comprobar:

- Chrome actual y anterior.
- Edge actual y anterior.
- Firefox actual y anterior.
- Safari actual y anterior.
- Safari iOS.
- Chrome Android.

---

## 27. Criterios de aceptación

La implementación de marca se considerará terminada cuando:

- [ ] El logotipo dispone de variantes claras, oscuras y monocromáticas.
- [ ] El favicon funciona desde 16 px.
- [ ] Todos los colores proceden de tokens globales.
- [ ] Manrope e Inter cargan con `font-display: swap`.
- [ ] La landing es responsive desde 320 px.
- [ ] El diagnóstico puede completarse solo con teclado.
- [ ] La pantalla de resultado explica la puntuación mediante texto.
- [ ] Los estados no dependen únicamente del color.
- [ ] Los CTA usan el naranja de forma consistente.
- [ ] No hay patrones visuales de concesionario o urgencia comercial.
- [ ] Se valida contraste y foco visible.
- [ ] Se prueban estados de carga, error y ausencia de datos.
- [ ] Las métricas de rendimiento están dentro de los objetivos acordados.
- [ ] Los resultados patrocinados se identifican.
- [ ] Los cálculos muestran fecha, periodo y supuestos.

---

## 28. Orden recomendado de implementación

### Sprint 1 — Fundamentos

1. Incorporar archivos maestros de marca.
2. Configurar fuentes.
3. Crear tokens globales.
4. Implementar contenedor, rejilla y tipografía.
5. Configurar Storybook o catálogo equivalente si el proyecto lo utiliza.

### Sprint 2 — Componentes

1. Botones y enlaces.
2. Campos y selección.
3. Tarjetas, badges y alertas.
4. Header, footer y navegación móvil.
5. Estados y accesibilidad.

### Sprint 3 — Landing

1. Header y hero.
2. Cómo funciona.
3. Ejemplo de diagnóstico.
4. Confianza e independencia.
5. Preguntas frecuentes.
6. SEO y social share.

### Sprint 4 — Diagnóstico

1. Stepper.
2. Preguntas y validación.
3. Persistencia.
4. Resumen previo.
5. Estados de cálculo.

### Sprint 5 — Resultados

1. Índice CocheCierto.
2. Nivel de confianza.
3. Desglose de coste.
4. Riesgos.
5. Alternativas.
6. Informe descargable.

### Sprint 6 — Calidad

1. Accesibilidad.
2. Responsive.
3. Rendimiento.
4. Navegadores.
5. Analítica.
6. Revisión visual final.

---

## 29. Decisiones pendientes antes de producción

- Registro y validación jurídica del nombre.
- Logotipo vectorial final convertido a curvas.
- Licencia o procedencia definitiva de las fuentes.
- Política de modo oscuro.
- Fuente y vigencia de datos automovilísticos.
- Fórmula y ponderaciones del Índice CocheCierto.
- Política de resultados patrocinados.
- Textos jurídicos y de privacidad.
- Países, monedas e idiomas de la primera versión.
- Tecnología del frontend y sistema de componentes.

Estas decisiones no bloquean el prototipo visual, pero sí deben resolverse antes del lanzamiento comercial.

---

## 30. Resumen para el desarrollador

La interfaz debe construirse como una plataforma de diagnóstico fiable:

- Azul profundo para estructura y confianza.
- Naranja para acciones y conclusiones destacadas.
- Blanco y grises para lectura y respiración.
- Manrope para identidad; Inter para contenido.
- C con check como símbolo principal.
- Diseño mobile-first y modular.
- Resultado explicado, no una puntuación aislada.
- Accesibilidad WCAG 2.2 AA.
- Componentes reutilizables y tokens centralizados.
- Preparación para distintos países, monedas y reglas.

La comprobación final de cada decisión es sencilla:

> **¿Ayuda este elemento al usuario a entender, comparar o decidir con mayor seguridad?**

Si la respuesta es no, el elemento debe simplificarse o eliminarse.

---

## Referencias técnicas

- [Web Content Accessibility Guidelines 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices Guide — W3C](https://www.w3.org/WAI/ARIA/apg/)
- [Patrones de componentes accesibles — W3C](https://www.w3.org/WAI/ARIA/apg/patterns/)

