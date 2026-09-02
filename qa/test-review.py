from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4177"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    events = []
    page.add_init_script("""window.addEventListener('cochecierto:event', event => window.__events = (window.__events || []).concat(event.detail))""")
    page.on("console", lambda msg: None)
    page.goto(BASE + "/que-revisar-coche-segunda-mano/", wait_until="networkidle")
    assert page.locator("#review-items .review-item").count() == 8
    assert page.locator("#review-items input[value='pending']").count() == 8
    page.locator("#review-items input[value='confirmed']").first.click()
    page.locator("#review-form").get_by_role("button", name="Ver resumen").click()
    assert "pendientes" in page.locator("#review-result").inner_text().lower()
    assert page.locator("#review-result .review-counts").count() == 1
    names = page.evaluate("() => (window.__events || []).map(event => event.name)")
    assert "landing_view" in names and "tool_start" in names and "tool_complete" in names
    assert page.locator("a[href*='source=review-checklist'][href*='intent=risk']").count() == 1
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    browser.close()

print("review_qa=ok items=8 local_events=3+")
