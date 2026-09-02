import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
PORT = 4176


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def main():
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", PORT),
        lambda *args, **kwargs: QuietHandler(*args, directory=ROOT, **kwargs),
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        page.goto(f"http://127.0.0.1:{PORT}/", wait_until="networkidle")

        bar = page.locator(".mobile-bottom-nav")
        assert bar.count() == 1, "Debe existir una barra móvil única"
        assert bar.get_by_text("Inicio", exact=True).is_visible()
        assert bar.get_by_text("Guías", exact=True).is_visible()
        assert bar.get_by_text("Valorar", exact=True).is_visible()
        assert bar.get_by_text("Menú", exact=True).is_visible()
        assert not page.locator(".mobile-menu-btn").is_visible(), "No debe duplicarse la hamburguesa"
        assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")

        page.locator("[data-mobile-menu-open]").click()
        panel = page.locator(".mobile-menu-panel")
        assert panel.is_visible()
        assert panel.get_by_text("Empieza aquí", exact=True).is_visible()
        assert panel.get_by_text("Guías", exact=True).is_visible()
        assert panel.get_by_text("Comenzar valoración", exact=True).is_visible()

        page.keyboard.press("Escape")
        assert not panel.is_visible(), "Escape debe cerrar el menú"
        browser.close()
    server.shutdown()


if __name__ == "__main__":
    main()
    print("mobile_menu_qa=ok")
