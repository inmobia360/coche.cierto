# Plan — Spec 023

## Fase 0: consolidar el MVP seguro

1. Alinear la página de concesionarios con el modo demo definido en la spec 022.
2. Retirar llamadas externas activas mientras no exista aprobación de proveedor y términos.
3. Unificar la generación de ficha PDF y corregir radios, copy y eventos.
4. Verificar que el enlace desde el informe conserva solo el contexto necesario.
5. Añadir pruebas estáticas y una prueba manual documentada para móvil.

## Fase 1: petición privada manual

1. Definir el contrato de `NeedProfile`, `Request`, `Consent` y `AuditEvent`.
2. Implementar revisión editable y vista previa de datos compartidos.
3. Generar token aleatorio, caducidad, revocación y estado.
4. Crear PDF y vista web con etiquetas de procedencia y pendientes.
5. Compartir mediante Web Share, copiar enlace o descarga, siempre por acción del usuario.

## Fase 2: recepción estructurada

Solo tras aprobar los criterios de activación:

1. Alta y verificación de concesionario.
2. Formulario de oferta y validaciones.
3. Versionado, incompletitud, contradicciones e incidencias.
4. Panel de usuario y panel mínimo de concesionario.

## Fase 3: comparación y contacto

1. Comparación de hasta tres ofertas.
2. Explicación de encaje y pendientes.
3. Consentimiento justo antes de compartir contacto.
4. Visita, prueba, feedback y retirada.

## Regla de entrega

No se implementará la fase siguiente si la anterior no tiene criterios observables, pruebas y revisión de riesgos documentada.
