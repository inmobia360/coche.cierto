from pathlib import Path
import unicodedata

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
DATE = "2 de septiembre de 2026"
VALUATION_URL = "https://cochecierto.com/valorador/"
ORANGE = colors.HexColor("#fc4c02")
NAVY = colors.HexColor("#062033")
MUTED = colors.HexColor("#536b7c")
LINE = colors.HexColor("#d7e1e5")


GUIDES = [
    {
        "file": "guia-cuanto-gastar-en-un-coche.pdf",
        "eyebrow": "GUIA PRACTICA | PRESUPUESTO",
        "title": "Cuanto gastar en un coche sin quedarte sin margen",
        "intro": "Una hoja de trabajo para separar precio, gastos iniciales, coste mensual y reserva antes de mirar anuncios.",
        "sections": [
            ("La regla que evita el error mas comun", [
                "No decidas solo por el precio del anuncio. Antes de comparar coches, separa cuatro cifras: precio del vehiculo, gastos iniciales, coste mensual y reserva protegida.",
                "El resultado debe dejar margen para gastos esenciales, ahorro e imprevistos. Si el coche consume toda tu reserva, el presupuesto es demasiado agresivo aunque la cuota parezca asumible.",
            ]),
            ("Tu hoja de presupuesto", [
                "Ingresos netos mensuales aproximados: ______________________________",
                "Gastos fijos mensuales aproximados: ________________________________",
                "Ahorro disponible: ________________________________________________",
                "Reserva que no quieres utilizar: _________________________________",
                "Kilometros mensuales aproximados: ________________________________",
                "Precio maximo provisional, sujeto a revision: ___________________",
            ]),
            ("Comprueba antes de comprometerte", [
                "El precio de compra no deja la cuenta sin colchón.",
                "La cuota, si existe, esta separada del coste de uso.",
                "Has estimado seguro, energia, mantenimiento, impuestos y puesta a punto.",
                "La reserva protegida sigue disponible despues de comprar.",
                "Has comparado el coste total y no solo la cuota mensual.",
            ]),
        ],
    },
    {
        "file": "guia-que-revisar-coche-usado.pdf",
        "eyebrow": "GUIA PRACTICA | REVISION",
        "title": "Que revisar antes de comprar un coche usado",
        "intro": "Checklist para preparar una visita, ordenar preguntas y distinguir lo confirmado de lo que sigue pendiente.",
        "sections": [
            ("Antes de ir a verlo", [
                "Pide matricula o bastidor cuando proceda y solicita la documentacion disponible.",
                "Compara kilometraje, fechas, titulares, ITV, mantenimiento y lo que afirma el anuncio.",
                "Prepara una lista de preguntas y no entregues una señal por presion o prisa.",
            ]),
            ("Checklist de visita", [
                "Exterior: paneles, diferencias de tono, holguras, cristales y signos de reparacion.",
                "Neumaticos: desgaste uniforme, fecha, medidas y testigos.",
                "Interior: testigos al arrancar, climatizacion, cinturones, elevalunas y olores.",
                "Prueba: arranque en frio si es posible, ruidos, embrague, frenos, direccion y cambios.",
                "Documentacion: permiso, ficha, ITV, cargas y justificantes de mantenimiento.",
            ]),
            ("Como marcar cada punto", [
                "CONFIRMADO: lo has comprobado directamente o existe evidencia suficiente.",
                "PENDIENTE: aun no tienes la informacion necesaria.",
                "NO COINCIDE: el anuncio, el vendedor y la documentacion no encajan.",
                "SEÑAL DE ALERTA: detente y pide una explicacion antes de continuar.",
            ]),
        ],
    },
    {
        "file": "guia-documentacion-coche-usado.pdf",
        "eyebrow": "GUIA PRACTICA | DOCUMENTACION",
        "title": "Documentacion que pedir al vendedor",
        "intro": "Una lista ordenada para reducir sorpresas administrativas y saber que falta antes de pagar o reservar.",
        "sections": [
            ("Documentos y comprobaciones", [
                "Permiso de circulacion y ficha tecnica.",
                "Situacion de la ITV y kilometraje registrado cuando pueda comprobarse.",
                "Identidad y legitimidad de la persona que vende el vehiculo.",
                "Informe oficial y consulta de cargas, limitaciones o incidencias administrativas.",
                "Facturas, historial de mantenimiento y reparaciones relevantes.",
            ]),
            ("Preguntas que conviene dejar por escrito", [
                "¿Que averias, golpes o reparaciones ha tenido?",
                "¿Hay financiacion, reserva de dominio, embargo o carga pendiente?",
                "¿Coinciden kilometros, fechas y titulares con la documentacion?",
                "¿Que incluye exactamente el precio y que gastos quedan fuera?",
                "¿Que garantia o responsabilidad se ofrece y en que condiciones?",
            ]),
            ("No avances si...", [
                "No puedes identificar al vendedor o no facilita la documentacion basica.",
                "Hay contradicciones que no se explican con evidencia.",
                "Te piden una señal urgente antes de revisar el expediente.",
                "El precio o la forma de pago no quedan claros por escrito.",
            ]),
        ],
    },
    {
        "file": "guia-detectar-anuncio-coche-sospechoso.pdf",
        "eyebrow": "GUIA PRACTICA | RIESGO",
        "title": "Como detectar un anuncio de coche sospechoso",
        "intro": "Un filtro practico para analizar coherencia, precio, informacion ausente y señales que justifican frenar.",
        "sections": [
            ("Mira la coherencia, no solo las fotos", [
                "Comprueba si kilometros, año, equipamiento, ubicacion y precio son compatibles entre si.",
                "Busca fotografias repetidas, daños ocultos, matriculas inconsistentes o descripciones demasiado vagas.",
                "Un precio bajo puede tener una explicacion, pero necesita mas comprobaciones, no una decision mas rapida.",
            ]),
            ("Semaforo de señales", [
                "VERDE: datos completos, vendedor identificable y documentacion disponible.",
                "AMBAR: faltan datos relevantes, hay respuestas imprecisas o el precio se aleja del mercado sin explicacion.",
                "ROJO: presion para pagar, identidad dudosa, incoherencias graves, enlaces extraños o negativa a comprobar el coche.",
            ]),
            ("Antes de responder al anuncio", [
                "Pide matricula o bastidor y pregunta por historial, cargas, ITV y mantenimiento.",
                "Solicita una visita en condiciones seguras y evita anticipos sin documentacion.",
                "Compara el anuncio con tu presupuesto y tu uso; que el coche parezca barato no significa que encaje.",
            ]),
        ],
    },
]


def styles():
    base = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle("Eyebrow", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=ORANGE, spaceAfter=10, tracking=1.1),
        "title": ParagraphStyle("Title", parent=base["Title"], fontName="Helvetica-Bold", fontSize=23, leading=26, textColor=NAVY, alignment=TA_LEFT, spaceAfter=9),
        "intro": ParagraphStyle("Intro", parent=base["BodyText"], fontName="Helvetica", fontSize=11.5, leading=16, textColor=MUTED, spaceAfter=13),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=NAVY, spaceBefore=10, spaceAfter=5),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=NAVY, spaceAfter=5),
        "small": ParagraphStyle("Small", parent=base["BodyText"], fontName="Helvetica", fontSize=8.4, leading=11, textColor=MUTED),
        "cta": ParagraphStyle("Cta", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=colors.white, alignment=TA_CENTER),
    }


def ascii_text(value):
    """Keep the PDF copy compatible with the built-in Helvetica fonts."""
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")


def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 17 * mm, width - 18 * mm, 17 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 11 * mm, f"cochecierto.com | Actualizada el {DATE} | Orientacion, no asesoramiento profesional")
    canvas.drawRightString(width - 18 * mm, 11 * mm, f"{doc.page}")
    canvas.restoreState()


def header(canvas, doc):
    canvas.saveState()
    width, height = A4
    symbol_x = 20 * mm
    symbol_y = height - 22 * mm
    symbol_size = 11 * mm
    canvas.setStrokeColor(NAVY)
    canvas.setLineWidth(1.8 * mm)
    canvas.setLineCap(1)
    canvas.arc(symbol_x, symbol_y, symbol_x + symbol_size, symbol_y + symbol_size, 55, 305)
    canvas.setStrokeColor(ORANGE)
    canvas.setLineWidth(1.3 * mm)
    canvas.setLineCap(1)
    canvas.setLineJoin(1)
    canvas.line(symbol_x + 5.0 * mm, symbol_y + 5.1 * mm, symbol_x + 6.8 * mm, symbol_y + 6.8 * mm)
    canvas.line(symbol_x + 6.8 * mm, symbol_y + 6.8 * mm, symbol_x + 10.2 * mm, symbol_y + 3.2 * mm)
    text_x = symbol_x + symbol_size + 5 * mm
    canvas.setFont("Helvetica-Bold", 14)
    canvas.setFillColor(NAVY)
    canvas.drawString(text_x, height - 18.2 * mm, "Coche")
    coche_width = canvas.stringWidth("Coche", "Helvetica-Bold", 14)
    canvas.setFillColor(ORANGE)
    canvas.drawString(text_x + coche_width, height - 18.2 * mm, "Cierto")
    canvas.restoreState()


def build(guide):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    path = OUTPUT / guide["file"]
    doc = BaseDocTemplate(str(path), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=26 * mm, bottomMargin=21 * mm, title=guide["title"], author="CocheCierto")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="guide", frames=frame, onPage=lambda canvas, page_doc: (header(canvas, page_doc), footer(canvas, page_doc)))])
    s = styles()
    story = [Paragraph(ascii_text(guide["eyebrow"]), s["eyebrow"]), Paragraph(ascii_text(guide["title"]), s["title"]), Paragraph(ascii_text(guide["intro"]), s["intro"]), HRFlowable(width="100%", thickness=1, color=LINE), Spacer(1, 4 * mm)]
    for heading, items in guide["sections"]:
        blocks = [Paragraph(ascii_text(heading), s["h2"])]
        for item in items:
            blocks.append(Paragraph(ascii_text(f"- {item}"), s["body"]))
        story.append(KeepTogether(blocks))
    story.extend([
        Spacer(1, 2 * mm),
        Paragraph("Siguiente paso", s["h2"]),
        Paragraph("Ordena tu situacion con una orientacion personalizada sobre uso, presupuesto, coste y comprobaciones.", s["body"]),
        Table([[Paragraph(f'<link href="{VALUATION_URL}">Crear mi valoracion gratuita</link>', s["cta"])]], colWidths=[doc.width], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), ORANGE), ("BOX", (0, 0), (-1, -1), 0, ORANGE), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)])),
        Spacer(1, 3 * mm),
        Paragraph("Fuentes y limites", s["h2"]),
        Paragraph("Este recurso resume buenas practicas y criterios de comprobacion. No es una tasacion, un diagnostico mecanico, asesoramiento legal o financiero, una aprobacion de credito ni una garantia sobre el vehiculo. Las referencias pueden cambiar; consulta siempre las fuentes oficiales y verifica tu caso.", s["small"]),
        Spacer(1, 2 * mm),
        Paragraph("CocheCierto no vende coches ni cobra comisiones por recomendar una unidad. Contacto: hola@cochecierto.com", s["small"]),
    ])
    doc.build(story)


for guide in GUIDES:
    build(guide)
print(f"created_pdfs={len(GUIDES)} output={OUTPUT}")
