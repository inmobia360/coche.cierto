from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:4177"
ROUTES = [
    "/",
    "/como-funciona/",
    "/que-analizamos/",
    "/guias/",
    "/guias/cuanto-gastar-en-un-coche/",
    "/guias/que-revisar-antes-de-comprar-un-coche-usado/",
    "/recursos/",
    "/recursos/checklist-inspeccion.html",
    "/que-coche-me-puedo-permitir/",
    "/que-revisar-coche-segunda-mano/",
    "/valorador/",
    "/demo/",
    "/casos-reales/",
    "/quienes-somos/",
    "/legal/",
]


def local_href(href):
    parsed = urlparse(href or "")
    if parsed.scheme or parsed.netloc or href.startswith("#"):
        return None
    return parsed.path or "/"


def assert_no_horizontal_overflow(page, route):
    assert page.evaluate(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth"
    ), f"overflow horizontal en {route}"


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    console_errors = []
    failed_requests = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("requestfailed", lambda request: failed_requests.append(request.url))

    for route in ROUTES:
        page.goto(BASE + route, wait_until="networkidle")
        assert page.url.startswith(BASE), f"redirección externa inesperada en {route}"
        assert page.locator(".site-header").count() == 1, f"header ausente/duplicado en {route}"
        assert page.locator(".mobile-bottom-nav").count() == 1, f"barra móvil ausente/duplicada en {route}"
        assert page.locator(".mobile-bottom-primary").get_by_text("Valorar", exact=True).count() == 1
        assert page.locator("footer.legal-footer").count() == 1, f"footer en {route}"
        assert_no_horizontal_overflow(page, route)

        for href in page.locator("a[href]").evaluate_all("els => els.map(el => el.href)"):
            local_path = local_href(href)
            if local_path is None:
                continue
            response = context.request.get(BASE + local_path)
            assert response.status == 200, f"{route} enlaza a {local_path} con HTTP {response.status}"

        page.locator("[data-mobile-menu-open]").click()
        panel = page.locator(".mobile-menu-panel")
        assert panel.is_visible(), f"menú no abre en {route}"
        assert panel.locator("a[href$='/guias/']").count() == 1, f"Guías no disponible en {route}"
        page.keyboard.press("Escape")
        assert not panel.is_visible(), f"menú no cierra en {route}"

    page.goto(BASE + "/", wait_until="networkidle")
    page.locator(".mobile-bottom-primary").click()
    assert page.url.endswith("/valorador/"), f"CTA móvil no lleva al valorador: {page.url}"

    page.goto(BASE + "/guias/cuanto-gastar-en-un-coche/", wait_until="networkidle")
    assert page.locator("a[href$='/valorador/']").count() >= 1, "La guía no ofrece siguiente paso al valorador"
    assert not console_errors, f"errores de consola: {console_errors}"
    assert not failed_requests, f"recursos fallidos: {failed_requests}"
    browser.close()

print("url_flow_qa=ok")
