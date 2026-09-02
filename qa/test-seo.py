from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = [
    ("index.html", "https://cochecierto.com/"),
    ("que-coche-me-puedo-permitir/index.html", "https://cochecierto.com/que-coche-me-puedo-permitir/"),
    ("que-revisar-coche-segunda-mano/index.html", "https://cochecierto.com/que-revisar-coche-segunda-mano/"),
]


class SeoParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.h1 = 0
        self.meta = {}
        self.canonical = ""
        self.json_ld = 0
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self._in_title = True
        if tag == "h1":
            self.h1 += 1
        if tag == "meta" and attrs.get("name") in {"description", "robots"}:
            self.meta[attrs["name"]] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href", "")
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.json_ld += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data.strip()


for relative, canonical in PUBLIC:
    path = ROOT / relative
    parser = SeoParser()
    parser.feed(path.read_text(encoding="utf-8"))
    assert parser.title and len(parser.title) <= 65, f"title inválido: {relative}"
    assert 120 <= len(parser.meta.get("description", "")) <= 180, f"description inválida: {relative}"
    assert parser.canonical == canonical, f"canonical incorrecta: {relative}"
    assert parser.h1 == 1, f"debe existir un H1: {relative}"
    assert parser.json_ld >= 1, f"falta JSON-LD: {relative}"

sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
assert "que-coche-me-puedo-permitir/" in sitemap
assert "que-revisar-coche-segunda-mano/" in sitemap
assert "mvp-valorador" not in sitemap
assert "tmp/" not in sitemap
print("seo_qa=ok public_pages=3")
