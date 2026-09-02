from playwright.sync_api import sync_playwright


URL = "http://127.0.0.1:8765/valorador/"


def complete(page, professional=False):
    page.goto(URL)
    if professional:
        page.get_by_role("button", name="Trabajo o negocio").click()
    page.get_by_role("button", name="Comenzar diagnóstico").click()
    answers = ["Comprar", "Ciudad", "Menos de 10.000", "1–2", "En la calle"]
    if professional:
        answers = ["Comprar", "Trabajo", "Soy autónomo", "Personas", "Un día", "Menos de 10.000", "1–2", "En la calle"]
    for answer in answers:
        page.get_by_text(answer, exact=True).last.click()
        page.get_by_role("button", name="Continuar").click()
    page.get_by_text("Hasta 3.000 €", exact=True).click()
    page.get_by_role("button", name="Continuar").click()
    page.get_by_text("Averías", exact=True).click()
    page.get_by_role("button", name="Continuar").click()
    page.get_by_text("Baja", exact=True).click()
    page.get_by_role("button", name="Ver mi orientación").click()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto(URL)
    assert page.locator(".valuator-seo-extended").count() == 0
    assert page.get_by_role("button", name="Comenzar diagnóstico").count() == 1

    page.get_by_role("button", name="Comenzar diagnóstico").click()
    assert page.locator("input[type=radio]").count() == 3
    assert page.get_by_role("button", name="Continuar").is_disabled()
    page.get_by_text("Comprar", exact=True).click()
    assert not page.get_by_role("button", name="Continuar").is_disabled()
    page.get_by_role("button", name="Continuar").click()
    assert page.locator("legend").count() == 1

    complete(page)
    assert "Informe de decisión" in page.locator("#screen").inner_text()
    assert "Revisa tus respuestas" not in page.locator("#screen").inner_text()

    complete(page, professional=True)
    assert "profesional" in page.locator("#screen").inner_text()
    browser.close()

print("valuator_low_friction=ok")
