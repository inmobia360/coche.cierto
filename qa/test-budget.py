from pathlib import Path
import subprocess
import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = subprocess.Popen([sys.executable, "-m", "http.server", "4174"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

try:
    for _ in range(20):
        try:
            urllib.request.urlopen("http://127.0.0.1:4174/que-coche-me-puedo-permitir/", timeout=1).close()
            break
        except OSError:
            time.sleep(0.25)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for viewport in ({"width": 390, "height": 844}, {"width": 1440, "height": 900}):
            page = browser.new_page(viewport=viewport)
            errors = []
            events = []
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            page.goto("http://127.0.0.1:4174/que-coche-me-puedo-permitir/", wait_until="networkidle")
            page.expose_function("recordEvent", lambda event: events.append(event))
            page.evaluate("window.addEventListener('cochecierto:event', e => window.recordEvent(e.detail))")

            assert page.get_by_role("heading", name="¿Qué coche puedes asumir sin quedarte sin margen?").is_visible()
            assert page.get_by_role("button", name="Calcular mi referencia").is_visible()
            assert page.locator("body").evaluate("el => el.scrollWidth <= el.clientWidth")
            page.get_by_role("button", name="Calcular mi referencia").click()
            assert page.get_by_role("alert").is_visible()

            values = {"income": "2400", "fixed": "1300", "savings": "12000", "reserve": "2500", "km": "1000"}
            for name, value in values.items():
                page.locator(f"[name='{name}']").fill(value)
            page.locator("[name='use']").select_option("mixed")
            page.get_by_role("button", name="Calcular mi referencia").click()
            if errors:
                print("page_errors=", errors)
            assert page.locator(".result-number small").is_visible()
            assert page.get_by_role("link", name="Crear mi valoración gratuita").is_visible()
            assert page.get_by_label("Ingresos netos al mes (€)").is_visible()
            assert page.get_by_label("Uso principal").is_visible()
            assert {event["name"] for event in events} >= {"tool_start", "tool_complete"}
            assert not any("email" in event or "income" in event or "savings" in event for event in events)
            assert page.locator("body").evaluate("el => el.scrollWidth <= el.clientWidth")
            assert not errors, errors
            page.keyboard.press("Tab")
            assert page.locator(":focus").count() == 1
            page.screenshot(path=str(ROOT / "qa" / f"budget-{viewport['width']}.png"), full_page=True)
            page.close()
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)

print("budget_qa=ok")
