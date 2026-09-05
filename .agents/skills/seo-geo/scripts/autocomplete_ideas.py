#!/usr/bin/env python3
"""Free Google Autocomplete keyword suggestions (no API account required)."""
import argparse
import json
import urllib.parse
import urllib.request


def get_suggestions(keyword, language, country):
    query = urllib.parse.urlencode({"client": "firefox", "hl": language, "gl": country, "q": keyword})
    request = urllib.request.Request(f"https://suggestqueries.google.com/complete/search?{query}", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=15) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return [item.strip() for item in payload[1] if isinstance(item, str) and item.strip()]


def main():
    parser = argparse.ArgumentParser(description="Google Autocomplete keyword suggestions")
    parser.add_argument("keyword", help="Seed keyword for autocomplete")
    parser.add_argument("--location", "-loc", type=int, default=2724,
                        help="Location code (default: 2724 = Spain)")
    parser.add_argument("--language", "-lang", default="es",
                        help="Language code (default: es = Spanish)")
    args = parser.parse_args()

    print(f"keyword: {args.keyword}")
    print(f"location: {args.location}")
    print(f"language: {args.language}")
    print()
    
    try:
        suggestions = get_suggestions(args.keyword, args.language, "ES")
    except Exception as error:
        raise SystemExit(f"error: no se pudo consultar Google Autocomplete: {error}") from error
    print(f"autocomplete_suggestions[{len(suggestions)}]:")
    for index, suggestion in enumerate(suggestions, 1):
        print(f"  {index}. {suggestion}")
    print("\nFuente: Google Autocomplete (gratuita; no proporciona volumen ni dificultad).")


if __name__ == "__main__":
    main()
