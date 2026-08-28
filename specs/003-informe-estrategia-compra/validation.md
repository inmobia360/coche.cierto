# Validación T6 — Perfiles iniciales

## Casos sintéticos

| Caso | Perfil | Respuestas clave | Resultado esperado |
|---|---|---|---|
| V1 | Primer coche con poco dinero | Privado, ciudad, 1–2 personas, presupuesto hasta 3.000 €, riesgo bajo | Utilitario/compacto sencillo, advertencia de reserva y no gastar todo en el coche |
| V2 | Familia | Privado, mixto, 3–4 personas, carga frecuente, presupuesto 15–25k | Familiar o SUV compacto, prioridad espacio/seguridad, checklist documental |
| V3 | Autónomo intensivo | Profesional, trabajo, +30.000 km, herramientas, parada crítica | Familiar robusto o vehículo de trabajo, coste/km, plan de sustitución y revisión fiscal |
| V4 | Usuario indeciso | Informarse, uso mixto, presupuesto desconocido, riesgo desconocido | Resultado provisional, confianza baja y preguntas pendientes visibles |
| V5 | Usuario urbano con carga | Privado, ciudad/mixto, garaje con enchufe, ZBE | Híbrido enchufable o eléctrico a estudiar, validando carga real y normativa |

## Comprobaciones realizadas

- Sintaxis JavaScript: `node --check mvp-valorador/app.js` — OK.
- El recorrido incluye ocasión activa y nuevo deshabilitado como “próximamente”.
- El recorrido profesional añade preguntas condicionales de actividad, carga y parada.
- El resultado muestra tres escenarios, checklist, futuro y confianza.
- El consentimiento comercial aparece separado del consentimiento de resultado.
- No se integra CRM, marketplace ni proveedores externos.

## Pendiente de validación humana

- Entrevistas y pruebas de finalización con compradores reales.
- Comprensión de las preguntas y del concepto de presupuesto total.
- Aceptación del resultado por autónomos y empresas.
- Conversión a lead y calidad comercial.
- Revisión legal de textos de consentimiento y retención.
- Ajuste de pesos y rangos con datos de mercado fechados.

## Decisión

El prototipo es apto para pruebas internas y entrevistas, pero no para medir negocio real ni para publicar como asesoramiento financiero o mecánico.
