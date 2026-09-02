# Reglas de Secretaría para publicar la web

Estas reglas son obligatorias antes de publicar cambios que afecten a componentes compartidos, navegación, cabecera,
footer, service worker o assets comunes.

## Primera carga directa

Secretaría debe comprobar cada URL pública mediante una entrada directa en un contexto limpio, sin depender de una
recarga posterior. La comprobación debe confirmar:

- logo visible y cargado;
- navegación completa, incluida la pestaña “Guías”;
- footer común presente una sola vez;
- enlaces del header y footer resolviendo desde rutas profundas;
- ausencia de errores de consola y de recursos 404;
- service worker con versión vigente.

Una URL que solo se corrige al recargar se considera **fallo de release**, no una validación superada.

## Menú móvil y conversión

En viewport móvil, Secretaría debe comprobar que:

- la barra inferior muestra una sola vez `Inicio`, `Guías`, `Valorar` y `Menú`;
- `Valorar` es el acceso primario y no compite con otro CTA duplicado;
- los textos no se cortan ni generan desplazamiento horizontal;
- `Menú` abre el panel agrupado por intención, permite cerrar con `×`, con el fondo y con `Escape`;
- los enlaces de Guías y Valorador funcionan también desde una URL profunda cargada directamente.

Si el menú aparece incompleto, duplicado o depende de una recarga, el release queda bloqueado.

## Descargas PDF de guías

Las guías prioritarias pueden ofrecer una descarga directa durante la beta. No se debe exigir email para obtener el PDF: primero se entrega utilidad y la captura progresiva solo puede ser opcional, con consentimiento separado para comunicaciones comerciales.

Antes de salir a web, Secretaría debe comprobar en primera carga directa de cada guía:

- el enlace PDF devuelve el archivo correcto y no una página HTML;
- el índice `/guias/` y `/recursos/` muestran el PDF que corresponde a cada contenido;
- el enlace secundario lleva a `/valorador/`;
- el PDF abre, tiene una sola página cuando corresponda, muestra fecha, límites y contacto;
- el CTA del PDF enlaza al valorador;
- se emiten `pdf_view`, `pdf_download` y `pdf_to_valuation_click` sin incluir datos personales;
- no se presenta la guía como tasación, diagnóstico, asesoramiento financiero, aprobación de crédito o garantía.

## Tráfico, dolor y conversión

En toda página pública informativa, excepto las páginas legales, Secretaría debe comprobar que la primera carga:

- deja claro qué duda o riesgo del comprador aborda la página;
- explica en lenguaje sencillo qué ayuda concreta ofrece CocheCierto;
- presenta una única siguiente acción principal coherente con esa intención;
- permite comenzar sin email, cuenta ni documentación cuando el flujo lo permita;
- distingue orientación, estimaciones y datos pendientes de verificar;
- no repite bloques que compitan entre sí ni promete resultados, solvencia, estado mecánico o garantías.

El CTA principal de estas páginas debe conducir al valorador o al recurso específico más cercano a la necesidad detectada.
Secretaría debe revisar también una página profunda de guía y una vista móvil antes de publicar. Si el mensaje no coincide
con lo que realmente entrega el flujo, el cambio queda bloqueado para revisión de COPY-MENSAJE, CONVERSION-CRM y
LEGAL-CONFIANZA.

## Evidencia mínima

La revisión debe guardar las URLs probadas, viewport, resultado de primera carga, resultado de recarga, errores de
consola/red y versión del shell. El release queda bloqueado hasta corregir cualquier diferencia.
