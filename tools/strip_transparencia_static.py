from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "transparencia.html"


def find_matching_div_end(source: str, start: int) -> int:
    pattern = re.compile(r"<(/?)div\b[^>]*>", re.IGNORECASE)
    depth = 0

    for match in pattern.finditer(source, start):
        closing = match.group(1) == "/"
        if closing:
            depth -= 1
            if depth == 0:
                return match.start()
        else:
            depth += 1

    raise RuntimeError("No se encontro cierre de .info")


def main() -> None:
    source = HTML_PATH.read_text(encoding="utf-8")
    match = re.search(r'<div\s+class=["\']info["\']\s*>', source, re.IGNORECASE)

    if not match:
        raise RuntimeError("No se encontro <div class=\"info\">")

    content_start = match.end()
    content_end = find_matching_div_end(source, match.start())
    replacement = "\n                <!-- Los registros de transparencia se cargan desde MySQL con transparencia-admin.js. -->\n            "
    updated = source[:content_start] + replacement + source[content_end:]
    HTML_PATH.write_text(updated, encoding="utf-8")
    print("transparencia.html actualizado: registros estaticos removidos")


if __name__ == "__main__":
    main()
