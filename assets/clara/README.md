# Biblioteca visual de Clara

Versión: `v1` · Fecha: 2026-09-06 · Estado: propuesta aprobada para beta

La ficha `Clara_ficha de personaje.png` y `Clara_ficha de personaje_01.png` son la referencia canónica. Los assets de esta carpeta son piezas independientes derivadas de esa referencia; no deben regenerarse desde cero sin comparar rostro, cabello, vestuario, paleta y estilo.

## Assets

| Archivo | Uso | Postura/intención |
|---|---|---|
| `clara-avatar-bust-v1.png` | Botón flotante y avatar pequeño | Bienvenida neutral |
| `clara-welcome-v1.png` | Onboarding y portada de paso | Presentar el siguiente paso |
| `clara-listening-v1.png` | Duda o ayuda contextual | Escucha y empatía |
| `clara-checklist-v1.png` | Resultado, checklist o diapositiva | Explicar comprobaciones |
| `clara-reassure-v1.png` | Confirmación o cierre | Acompañar sin prometer |
| `clara-pointing-v1.png` | Tarjeta con CTA o instrucción | Señalar una acción |

## Texto de interfaz reutilizable

### Botón flotante

- Etiqueta: `Pregunta a Clara`
- Alternativa accesible: `Abrir ayuda guiada de Clara`
- No abrir chat libre automáticamente.

### Bienvenida

- Título: `Clara te acompaña`
- Texto: `Te guío con el siguiente paso para decidir con más criterio.`
- CTA: `Empezar orientación`

### Paso de diagnóstico

- Título: `Empieza por tu situación`
- Texto: `Responde con aproximaciones. No necesitas tenerlo todo decidido.`
- CTA: `Continuar`

### Resultado

- Título: `Ahora entiende qué significa`
- Texto: `Separaremos lo que has aportado, lo que hemos calculado y lo que aún debes comprobar.`
- CTA: `Ver la explicación`

### Visita

- Título: `Prepara la visita`
- Texto: `Antes de desplazarte, reúne documentos, preguntas y una comprobación independiente si hay dudas.`
- CTA: `Abrir checklist`

### Opinión breve

- Pregunta: `¿Te está ayudando?`
- Opciones: `Sí, lo entiendo mejor` · `Tengo una duda` · `Todavía no`
- Comentario opcional: `Escribe una opinión breve`
- Confirmación: `Gracias. Tu respuesta nos ayuda a mejorar.`

## Reglas de consistencia

- Mantener rostro, cabello castaño ondulado, blazer azul marino, camiseta crema y pendientes dorados.
- Usar azul oscuro, turquesa, crema y naranja de CocheCierto.
- No añadir logotipos de fabricantes, matrículas, documentos ni personas identificables.
- No usar una pose de celebración para comunicar una estimación, garantía o aprobación.
- Mantener textos fuera de la imagen para permitir adaptación responsive y accesibilidad.
- Versionar cualquier nueva pose como `clara-<uso>-v2.png` y conservar la anterior.

## Fuente y revisión

Fuente visual: ficha aportada por el propietario del proyecto, recibida el 2026-09-06. Generación: built-in `image_gen`, usando ambas fichas como referencias de identidad. Revisión pendiente: prueba visual en el botón flotante real y aprobación final de uso en campañas.
