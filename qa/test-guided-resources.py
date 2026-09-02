from playwright.sync_api import sync_playwright


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto("http://127.0.0.1:8765/valorador/?skipIntro=1")
    page.wait_for_load_state("networkidle")

    while page.locator("#next").count():
        page.locator(".choice").first.click()
        page.locator("#next").click()
        page.wait_for_timeout(50)

    page.wait_for_selector("[data-guided-resources]")
    assert page.get_by_text("Tu ruta de compra").count() == 1
    assert page.get_by_role("button", name="Guardar mi guía").count() == 1
    assert page.locator("[data-guided-resources] a").count() >= 3
    assert page.locator("body").evaluate("document.body.scrollWidth <= window.innerWidth")

    print("guided-resources: OK")
    print("resource-links:", page.locator("[data-guided-resources] a").count())
    browser.close()
