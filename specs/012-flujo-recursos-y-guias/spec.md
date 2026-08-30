# Spec 012 — Flujo de recursos y guías por situación

## Objetivo

Convertir las dudas del comprador en una guía o descarga útil desde una única sección de Recursos, evitando duplicar documentos en las páginas editoriales.

## Flujo funcional

```text
Página de entrada → situación del usuario → preocupación → recurso recomendado → vista previa → descarga/uso → siguiente acción
```

### Entradas

- Página de origen: `Cómo funciona`, `Qué analizamos`, `Casos reales`, `Demo` o búsqueda.
- Perfil: primera compra, cambio de coche, familiar, uso profesional, presupuesto ajustado o coche ya visto.
- Etapa: definir necesidad, comparar, preparar visita, revisar unidad, negociar o después de comprar.
- Necesidad: documentación, costes, inspección, prueba, vendedor, seguro o trámites.

### Salida

La página de origen no descarga directamente un archivo. Presenta una tarjeta breve y enlaza a `/recursos/` con el recurso seleccionado y su contexto. Recursos muestra:

- Nombre y objetivo.
- Para quién sirve.
- Qué problema ayuda a resolver.
- Tiempo aproximado de uso.
- Formato: guía web, formulario, checklist o PDF.
- Vista previa antes de descargar.
- Descarga o generación del documento.
- Disclaimers y fecha de actualización.

## Catálogo inicial

| Recurso | Situación | Resultado |
|---|---|---|
| Checklist de inspección en frío | Coche ya visto / visita | Ordena qué observar antes de arrancar y durante la primera puesta en marcha |
| Guía de documentos antes de comprar | Todos | Ayuda a pedir y ordenar la información pendiente |
| Calculadora de coste inicial | Presupuesto / cambio | Separa precio anunciado, gastos inmediatos y reserva |
| Preguntas para el vendedor | Primera compra / particular | Prepara una conversación clara sin acusaciones |
| Checklist de prueba de conducción | Visita / comparación | Organiza observaciones durante una prueba autorizada |
| Guía después de comprar | Compra realizada | Recuerda trámites, seguro, mantenimiento inicial y documentación |

## Reglas de experiencia

- Una llamada a la acción principal por bloque.
- Lenguaje comprensible para una persona joven o sin conocimientos mecánicos.
- No exigir datos personales para consultar una guía básica.
- Permitir volver a Recursos sin perder el formulario.
- Mantener la preferencia claro/oscuro y navegación común.
- En móvil, tarjetas grandes, botones accesibles y navegación inferior sin desbordamiento.
- Las descargas digitales incluirán enlace al recurso web; la versión imprimible mostrará `cochecierto.com/recursos`.

## Reglas de confianza

- La guía no certifica el estado de una unidad.
- Una observación no equivale a un diagnóstico.
- Lo no comprobado se marca como pendiente.
- Normativa, garantías, impuestos y seguridad deben enlazar a fuentes oficiales actualizadas.
- Los contenidos derivados de fuentes externas siguen la regla de interpretación propia de la Spec 011.

## Fuera de alcance

Pasarela de pago, envío obligatorio de email, recomendación de una unidad concreta, inspección profesional, integración automática con vendedores o publicación automática de contenidos.
