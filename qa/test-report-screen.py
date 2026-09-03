from pathlib import Path
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT = ROOT / "qa" / "report-screen-qa.png"

answers = [
    "Comprar",
    "Ciudad y carretera",
    "10.000–20.000",
    "3–4",
    "Garaje sin enchufe",
    "A veces",
    "8.000–15.000 €",
    "Seguridad",
    "Media",
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.route("**/api/leads", lambda route: route.abort())
    page.goto(f"file:///{(ROOT / 'valorador' / 'index.html').as_posix()}?skipIntro=1")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Comenzar diagnóstico").click()

    for answer in answers:
        page.locator("label.choice", has_text=answer).first.click()
        if answer != answers[-1]:
            page.locator("#next").click()

    page.locator(".screen-report").wait_for()

    sections = page.locator(".screen-report-section")
    assert sections.count() == 10, sections.count()
    assert page.locator(".report-brand").inner_text() == "CocheCierto"
    assert page.locator(".budget-bar").count() == 1
    assert page.locator(".report-metric").count() == 4
    assert page.locator(".document-row").count() == 7
    assert page.locator(".compare-row").count() == 6
    assert page.locator("#report-section-10").inner_text().find("Acción personalizada") >= 0
    page.screenshot(path=str(SCREENSHOT), full_page=True)

    page.emulate_media(media="print")
    print_css = page.locator(".screen-report-section").first.evaluate("el => getComputedStyle(el).backgroundColor")
    assert print_css in {"rgb(255, 255, 255)", "rgb(243, 247, 246)"}, print_css

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto(f"file:///{(ROOT / 'valorador' / 'index.html').as_posix()}?skipIntro=1")
    mobile.wait_for_load_state("networkidle")
    mobile.get_by_role("button", name="Comenzar diagnóstico").click()
    for answer in answers:
        mobile.locator("label.choice", has_text=answer).first.click()
        if answer != answers[-1]:
            mobile.locator("#next").click()
    mobile.locator(".screen-report").wait_for()
    assert mobile.locator(".report-triad").first.evaluate("el => getComputedStyle(el).gridTemplateColumns") == "390px"
    mobile.close()
    browser.close()

print(f"OK: 10 fichas, presupuesto visual, logo, impresión y móvil. Screenshot: {SCREENSHOT}")
