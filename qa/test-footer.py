import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
PORT = 4175
URLS = [
    "/",
    "/como-funciona/",
    "/demo/",
    "/recursos/checklist-inspeccion.html",
    "/legal/aviso-legal.html",
    "/que-coche-me-puedo-permitir/",
    "/que-revisar-coche-segunda-mano/",
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), lambda *args, **kwargs: QuietHandler(*args, directory=ROOT, **kwargs))
threading.Thread(target=server.serve_forever, daemon=True).start()

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    for url in URLS:
        page.goto(f"http://127.0.0.1:{PORT}{url}", wait_until="networkidle")
        assert page.locator("footer.legal-footer").count() == 1, url
        assert page.locator("footer.landing-footer, footer.demo-footer").count() == 0, url
        assert page.locator("footer.legal-footer a[href$='/legal/']").count() == 1, url
        assert page.locator(".nav-links a[href$='/guias/']").count() == 1, url
        assert page.locator(".brand-lockup img").evaluate("img => img.complete && img.naturalWidth > 0"), url
    browser.close()

server.shutdown()
print("footer_qa=ok")
