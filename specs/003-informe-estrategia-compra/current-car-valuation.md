# Módulo opcional — Valoración orientativa del coche actual

## Activación

Solo se muestra al final del informe cuando la intención declarada sea `cambiar`. Nunca bloquea el resultado principal.

## Datos MVP

- marca y modelo;
- año;
- kilometraje;
- combustible y cambio;
- carrocería;
- estado general;
- ITV;
- mantenimiento e historial;
- provincia.
- deuda o financiación pendiente, si existe;
- gastos previstos de preparación/venta, si los conoce.
- vía prevista: vender a particular, entregar a profesional o todavía no lo sé.

## Resultado

Mostrar rango bajo, probable y alto; factores que lo explican; precio orientativo de publicación; y presupuesto neto estimado para cambiar, restando gastos o deuda pendiente solo si el usuario los declara.

`presupuesto_neto = valor_venta_estimado_por_canal - deuda_pendiente - gastos_venta`

El valor probable de entrega profesional puede ser inferior al de venta a particular a cambio de rapidez y menor gestión. La diferencia debe mostrarse como hipótesis orientativa, no como tarifa fija.

Si el resultado es negativo, mostrar que puede existir deuda residual y no presentarlo como entrada disponible.

## Reglas

- No dar una cifra exacta como verdad.
- No afirmar valor de tasación, precio garantizado ni oferta de compra.
- Indicar que estado, demanda local, historial y revisión física pueden cambiar el rango.
- Fotos, matrícula/VIN y conexión con proveedores quedan fuera del MVP.
- La valoración no debe solicitar contacto antes de entregar el rango.

## Conversión

Después del rango ofrecer: guardar valoración, recibir informe, analizar opciones de cambio o solicitar una valoración profesional. El contacto y el consentimiento comercial siguen siendo separados.
