from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

OUT = Path(__file__).resolve().parents[1] / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
ORANGE = colors.HexColor('#fc4c02')
NAVY = colors.HexColor('#072230')
BLUE = colors.HexColor('#0b5ea8')
GREY = colors.HexColor('#536b78')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Brand', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=17, textColor=NAVY, spaceAfter=2))
styles.add(ParagraphStyle(name='Contact', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=GREY))
styles.add(ParagraphStyle(name='Kicker', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=ORANGE, spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle(name='TitleCC', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=25, leading=29, textColor=NAVY, spaceAfter=10))
styles.add(ParagraphStyle(name='Sub', parent=styles['Normal'], fontSize=10.5, leading=15, textColor=GREY, spaceAfter=12))
styles.add(ParagraphStyle(name='H2CC', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=15, leading=18, textColor=NAVY, spaceBefore=12, spaceAfter=6))
styles.add(ParagraphStyle(name='BodyCC', parent=styles['BodyText'], fontSize=9.5, leading=14, textColor=NAVY, spaceAfter=5))
styles.add(ParagraphStyle(name='SmallCC', parent=styles['BodyText'], fontSize=8, leading=11, textColor=GREY))
styles.add(ParagraphStyle(name='Disclaimer', parent=styles['BodyText'], fontSize=7.5, leading=10, textColor=GREY, borderColor=ORANGE, borderWidth=0.5, borderPadding=7, spaceBefore=10))

def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(ORANGE); canvas.setLineWidth(1.2); canvas.line(18*mm, h-18*mm, w-18*mm, h-18*mm)
    canvas.setFillColor(NAVY); canvas.setFont('Helvetica-Bold', 12); canvas.drawString(18*mm, h-14*mm, 'CocheCierto')
    canvas.setFillColor(GREY); canvas.setFont('Helvetica', 7.5); canvas.drawRightString(w-18*mm, h-14*mm, 'cochecierto.com  ·  hola@cochecierto.com')
    canvas.setStrokeColor(colors.HexColor('#d8e1e5')); canvas.line(18*mm, 16*mm, w-18*mm, 16*mm)
    canvas.setFillColor(GREY); canvas.setFont('Helvetica', 7); canvas.drawString(18*mm, 11*mm, 'Facebook  ·  Instagram  ·  TikTok  ·  YouTube  ·  X')
    canvas.drawRightString(w-18*mm, 11*mm, f'Página {doc.page}')
    canvas.restoreState()

def p(text, style='BodyCC'): return Paragraph(text, styles[style])
def checklist(items):
    return Table([[Paragraph('□', styles['BodyCC']), p(item)] for item in items], colWidths=[8*mm, 155*mm], style=TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),5),('TEXTCOLOR',(0,0),(0,-1),ORANGE)]))
def doc_story(kicker, title, intro, sections, filename):
    path = OUT / filename
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=25*mm, bottomMargin=23*mm, title=title, author='CocheCierto')
    story = [p(kicker, 'Kicker'), p(title, 'TitleCC'), p(intro, 'Sub')]
    for heading, body in sections:
        story += [p(heading, 'H2CC')]
        story += body if isinstance(body, list) else [p(body)]
    story += [p('Repositorio de recursos', 'H2CC'), p('Consulta la versión digital en <link href="https://cochecierto.com/recursos/">cochecierto.com/recursos</link>. En la versión impresa, utiliza la URL completa para acceder a los recursos actualizados.', 'SmallCC')]
    resource_rows = [[p('<b>Recurso</b>', 'SmallCC'), p('<b>Objetivo</b>', 'SmallCC'), p('<b>Qué problema ayuda a resolver</b>', 'SmallCC')]]
    resources = [
        ('Valorador CocheCierto Decide', 'Orientar categoría, uso y presupuesto.', 'Evita empezar a buscar sin saber qué encaja contigo.'),
        ('Informe demo interactivo', 'Mostrar cómo se organiza una decisión de compra.', 'Permite entender el resultado antes de completar el diagnóstico.'),
        ('Checklist de inspección en frío', 'Recordar comprobaciones de unidad y documentación.', 'Reduce olvidos antes de entregar una señal.'),
        ('Guía de diagnóstico de compra', 'Acompañar la planificación y la compra paso a paso.', 'Ayuda a conservar margen y ordenar la decisión.'),
        ('Plantilla de análisis de una unidad', 'Registrar datos, dudas y preguntas de un anuncio.', 'Evita confundir un anuncio con una garantía.'),
        ('Plantilla de búsqueda asistida', 'Definir radio, criterios y mensajes de contacto.', 'Prepara una búsqueda futura sin enviar datos innecesarios.'),
    ]
    for name, objective, purpose in resources:
        link = '<link href="https://cochecierto.com/recursos/">' + name + '</link>'
        resource_rows.append([p(link, 'SmallCC'), p(objective, 'SmallCC'), p(purpose, 'SmallCC')])
    resource_table = Table(resource_rows, colWidths=[48*mm, 52*mm, 63*mm], repeatRows=1)
    resource_table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8f0f4')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#c8d5da')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story.append(resource_table)
    story.append(p('URL para la versión impresa: cochecierto.com/recursos', 'SmallCC'))
    story.append(p('<b>Aviso importante:</b> Este documento es una guía orientativa y no vinculante. CocheCierto no es un asesor certificado, perito, abogado, tasador ni entidad financiera. No garantiza el estado de ningún vehículo ni sustituye la revisión profesional. La decisión y sus consecuencias corresponden al usuario.', 'Disclaimer'))
    story.append(Spacer(1, 8)); story.append(p('Más recursos y asistente digital: <link href="https://cochecierto.com">cochecierto.com</link>  ·  <link href="mailto:hola@cochecierto.com">hola@cochecierto.com</link>  ·  <link href="https://www.instagram.com/somoscochecierto/">Instagram</link>  ·  <link href="https://www.facebook.com/somoscochecierto">Facebook</link>  ·  <link href="https://www.tiktok.com/@somoscochecierto">TikTok</link>  ·  <link href="https://www.youtube.com/@somoscochecierto">YouTube</link>  ·  <link href="https://x.com/cochecierto">X</link>', 'SmallCC'))
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    return path

doc_story('INFORME 1 · GRATUITO', 'Diagnóstico de compra', 'Tu punto de partida para saber qué coche estudiar, cuánto margen necesitas y qué comprobar antes de comprar.', [
    ('Tu perfil', [p('Categoría a estudiar: ________________________________________________'), p('Uso principal: ____________________  Personas: __________  Km/año: __________')]),
    ('Presupuesto con margen', [p('Presupuesto total disponible: __________________ €'), checklist(['Separar precio del coche, trámites, seguro y puesta a punto.', 'Guardar una reserva para mantenimiento e imprevistos.', 'No decidir por cuota o precio anunciado sin calcular el coste total.'])]),
    ('Antes de mirar anuncios', [checklist(['Definir tamaño, plazas, maletero y tipo de uso.', 'Comprobar compatibilidad con trayectos y zonas de bajas emisiones.', 'Comparar varias unidades equivalentes.', 'Anotar qué datos faltan en cada anuncio.'])]),
    ('Antes de entregar una señal', [checklist(['Pedir historial, ITV, facturas, cargas y garantía por escrito.', 'Ver el vehículo en frío y realizar una prueba.', 'Solicitar una inspección independiente si hay dudas.', 'No entregar dinero sin condiciones y documentación claras.'])]),
    ('Después de comprar', [checklist(['Formalizar contrato y conservar justificantes.', 'Gestionar transferencia, seguro e impuestos.', 'Revisar niveles, mantenimiento y elementos de seguridad.', 'Guardar una carpeta con toda la documentación.'])]),
], 'informe-1-diagnostico-compra.pdf')

doc_story('INFORME 2 · PLANTILLA', 'Análisis de una unidad', 'Ficha para estudiar un anuncio concreto sin confundir los datos publicados con una garantía sobre el vehículo.', [
    ('Identificación del anuncio', [p('URL: ______________________________________________________________'), p('Vendedor: __________________________  Fecha de consulta: ______________'), p('Marca/modelo anunciado: __________________  Año: ______  Km: ______')]),
    ('Datos que faltan', [checklist(['Historial de mantenimiento y facturas.', 'Número de propietarios y uso anterior.', 'ITV, cargas, siniestros o reparaciones.', 'Garantía, condiciones de venta y gastos adicionales.'])]),
    ('Preguntas al vendedor', [checklist(['¿Qué mantenimiento se ha realizado y cuándo?', '¿Hay alguna avería, testigo o reparación pendiente?', '¿Puedo ver la documentación antes de desplazarme?', '¿Acepta una revisión independiente?', '¿Qué incluye exactamente la garantía?'])]),
    ('Revisión durante la visita', [checklist(['Carrocería, neumáticos, cristales y luces.', 'Arranque en frío, frenos, dirección y cambio.', 'Climatización, equipamiento y ayudas electrónicas.', 'Coincidencia entre documentación, kilometraje y unidad.', 'No pagar hasta resolver las dudas importantes.'])]),
    ('Decisión provisional', [p('Encaja con mi perfil:  □ Sí  □ No  □ Pendiente'), p('Dudas críticas: _____________________________________________________'), p('Siguiente acción: __________________________________________________')]),
], 'informe-2-analisis-unidad.pdf')

doc_story('INFORME 3 · PLANTILLA PREMIUM', 'Búsqueda asistida y contacto', 'Brief para solicitar opciones cercanas y preparar contactos con particulares o concesionarios. Esta función se activará cuando existan las integraciones autorizadas.', [
    ('Criterios de búsqueda', [p('Radio máximo: __________ km  Zona aproximada: ________________________'), p('Categoría/tamaño: __________________  Presupuesto total: ______________'), p('Uso: __________________  Km/año: __________  Fecha objetivo: __________')]),
    ('Qué debería recibir', [checklist(['Dos opciones comparables y sus fuentes.', 'Enlace al anuncio y fecha de consulta.', 'Distancia aproximada y datos de contacto públicos.', 'Diferencias frente a mi perfil y preguntas pendientes.', 'Aviso claro cuando un dato no se haya podido verificar.'])]),
    ('Mensajes de contacto', [p('Particular: “Hola, estoy valorando un vehículo con estas características: ____________________. ¿Podrías confirmar ____________________ y compartir la documentación disponible? También me gustaría saber si aceptarías una revisión independiente.”'), p('Concesionario: “Busco una unidad con este perfil: ____________________. ¿Podéis enviarme opciones, precio total, garantía y condiciones por escrito?”')]),
    ('Seguimiento', [checklist(['Registrar cuándo se contactó y por qué canal.', 'No enviar datos personales innecesarios.', 'Comparar ofertas con las mismas condiciones.', 'No aceptar una oferta sin verificar unidad y documentación.', 'Revisar cualquier mensaje generado por IA antes de enviarlo.'])]),
], 'informe-3-busqueda-asistida.pdf')
