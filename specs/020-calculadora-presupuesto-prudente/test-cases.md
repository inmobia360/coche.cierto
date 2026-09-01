# Casos de prueba 020

| Caso | Entrada | Resultado esperado |
|---|---|---|
| A | Presupuesto total superior a gastos y reserva | Precio máximo inferior al dinero disponible; se muestran componentes |
| B | Ahorro insuficiente para gastos iniciales | Estado vulnerable y recomendación de reducir/aplazar; no precio engañoso |
| C | Gastos vacíos o no numéricos | Error comprensible; no calcular con cero silencioso |
| D | Kilómetros cero o negativos | Validación; no coste energético negativo |
| E | Cifras extremas | Límite de entrada y mensaje para revisar datos |
| F | Compra financiada | Entrada, cuotas, comisiones y cuota final separados; no comparar solo cuota |
| G | Uso profesional | Permitir coste de parada como dato pendiente/opcional, sin cálculo fiscal automático |
| H | Acepta resultado básico | Ve CTA al valorador sin email y conserva solo contexto permitido |
| I | Navegación por teclado | Todos los campos, errores y resultado son accesibles |
| J | Móvil | Sin desbordamiento y con resultado legible |
