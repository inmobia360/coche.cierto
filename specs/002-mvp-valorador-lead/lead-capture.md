# Captación de lead y consentimiento — MVP

## Principio

Primero se entrega una recomendación útil. El contacto se solicita solo para guardar o recibir el resultado, nunca como condición oculta para usar el diagnóstico.

## Formulario mínimo

| Campo | Obligatorio | Uso |
|---|---:|---|
| Email | Sí para enviar/guardar | Entregar el resultado y responder a la petición |
| Teléfono | No | Facilitar contacto humano si el usuario lo ofrece |
| Nombre | No | Personalizar comunicación |
| Intención | Sí, derivado | Comprar, cambiar o informarse |
| Plazo | Sí, derivado | 0–3, 3–6, +6 meses o desconocido |
| Categoría recomendada | Sí, derivado | Contexto del lead |
| Versión del diagnóstico | Sí, técnico | Reproducibilidad |

No solicitar DNI, nómina, matrícula, dirección exacta ni datos de solvencia en este MVP.

## Consentimientos

### Consentimiento necesario

Texto orientativo: “Acepto que se utilicen mis datos para guardar y enviarme el resultado que he solicitado, según la política de privacidad.”

Debe ser obligatorio únicamente cuando el usuario solicite envío o guardado personalizado. La política debe estar enlazada y explicar responsable, finalidad, conservación y derechos.

### Consentimiento comercial

Casilla independiente y desmarcada por defecto: “Quiero recibir novedades, recomendaciones y ayuda relacionada con la compra de coche.”

No debe estar preseleccionada, mezclada con el consentimiento necesario ni condicionar la entrega del resultado.

### Contacto telefónico

Si el usuario proporciona teléfono, pedir autorización específica para contacto telefónico o WhatsApp en una casilla separada. El teléfono no debe implicar permiso comercial universal.

## Modelo lógico

```json
{
  "lead_id": "uuid",
  "created_at": "ISO-8601",
  "source": "valorador-mvp",
  "intent": "buy|change|inform",
  "purchase_window": "0-3|3-6|6+|unknown",
  "recommended_category": "compacto",
  "recommendation_version": "002-mvp-v1",
  "questionnaire_version": "v1",
  "email": "...",
  "phone": null,
  "name": null,
  "consent_result": true,
  "consent_commercial": false,
  "consent_phone": false
}
```

El esquema es conceptual. No almacenar respuestas completas hasta definir base legal, retención y necesidad de cada campo.

## Estados del lead

- `anonymous_started`: inició sin contacto.
- `completed_anonymous`: completó y vio resultado sin contacto.
- `result_requested`: solicitó guardar o recibir resultado.
- `contactable`: contacto validado según el canal permitido.
- `commercial_opt_in`: aceptó comunicaciones comerciales.
- `qualified`: revisión interna confirma intención y datos mínimos.

No convertir automáticamente todo contacto en lead comercial.

## Validación

- Validar formato de email y normalizar sin alterar el valor original mostrado.
- Evitar duplicados obvios durante una misma sesión sin bloquear al usuario.
- Mostrar confirmación de qué se enviará y por qué.
- Permitir borrar o solicitar modificación de datos mediante un canal definido.
- Registrar fecha, versión de textos y finalidad aceptada para auditoría.
- No enviar datos a CRM, email marketing o partners hasta elegir proveedor y revisar contrato/RGPD.
