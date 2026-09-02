# Clarificaciones 020

## Decisiones adoptadas

1. Se reutiliza como base el modelo existente en `coche.cierto/specs/003-informe-estrategia-compra/budget-model.md`.
2. El precio del coche se separa de gastos iniciales, reserva y coste mensual.
3. El coste energético no se inventa por defecto: puede declararlo el usuario por 100 km y, si falta, aparece como pendiente.
4. Los campos desconocidos se muestran como rango o pendiente; nunca se convierten silenciosamente en cero.
5. La salida será orientación económica, no solvencia, crédito ni recomendación financiera.
6. El cálculo básico podrá ejecutarse localmente y no exigirá email.

## Fórmula provisional reutilizada

```text
presupuesto_total = precio_coche + gastos_iniciales + reserva_emergencia
gastos_iniciales = transferencia + seguro_inicial + puesta_al_dia + inspeccion + accesorios_necesarios
coste_mensual = cuota + energia + seguro_mensual + mantenimiento_mensual + impuestos + aparcamiento + peajes
precio_maximo_coche = dinero_total_disponible - gastos_iniciales - reserva_recomendada
```

Los rangos de trámites, seguro, puesta al día, inspección y reserva siguen siendo hipótesis configurables del documento
fuente. No se publicarán como tarifas universales hasta revisar región, fecha, tipo de vendedor, vehículo y perfil.

La política de fuentes y actualización está en `docs/data/cost-reference-policy.md`. MITECO sí aporta presets comparables
en €/100 km con fecha y metodología; seguro y mantenimiento se manejarán como bandas contextuales por sus diferencias de
muestra. No se confundirá una referencia sectorial con el coste del usuario.

## Decisiones aún necesarias

| Decisión | Responsable | Bloquea |
|---|---|---|
| Aprobar rangos y porcentaje de reserva para la primera versión | FINANZAS-TCO + director | Mostrar cifras por defecto |
| Confirmar copy “orientativo” y límites | LEGAL-CONFIANZA | Publicación |
| Confirmar procesamiento local y eventos | SEGURIDAD-DATOS + CONVERSION-CRM | Medición |
| Confirmar puente de contexto hacia el valorador | PRODUCTO-SDD + INGENIERIA | Implementación |

Hasta resolverlas, la Spec está preparada pero la calculadora no debe presentarse como herramienta financiera terminada.
