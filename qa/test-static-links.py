from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {"coche.cierto", "mvp-valorador", "tmp", ".git", ".git-sync"}


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if tag in {"a", "link"} and key == "href":
                self.links.append(value)
            if tag in {"script", "img", "source"} and key == "src":
                self.links.append(value)


def is_external(value):
    parsed = urlparse(value or "")
    return parsed.scheme in {"http", "https", "mailto", "tel", "javascript", "data"} or value.startswith("#")


def resolve(source, value):
    value = value.split("?", 1)[0].split("#", 1)[0]
    if value.startswith("/"):
        return ROOT / value.lstrip("/")
    return (source.parent / value).resolve()


def exists_route(path):
    if path.is_file():
        return True
    return (path / "index.html").is_file()


broken = []
checked = 0
for html in ROOT.rglob("*.html"):
    if any(part in EXCLUDED for part in html.relative_to(ROOT).parts):
        continue
    parser = LinkParser()
    parser.feed(html.read_text(encoding="utf-8", errors="replace"))
    for value in parser.links:
        if not value or is_external(value):
            continue
        target = resolve(html, value)
        checked += 1
        if not exists_route(target):
            broken.append(f"{html.relative_to(ROOT)} -> {value} ({target.relative_to(ROOT) if target.is_relative_to(ROOT) else target})")

header = (ROOT / "site-header.js").read_text(encoding="utf-8")
generated = [
    "valorador/", "que-coche-me-puedo-permitir/", "como-funciona/", "que-analizamos/",
    "guias/", "recursos/", "demo/", "casos-reales/", "quienes-somos/", "legal/"
]
for route in generated:
    target = ROOT / route / "index.html"
    assert target.is_file(), f"site-header.js genera ruta inexistente: {route}"
assert "mobile-bottom-nav" in header and "data-mobile-menu-open" in header

assert not broken, "Enlaces rotos:\n" + "\n".join(broken)
print(f"static_links_qa=ok checked={checked} generated_routes={len(generated)}")
