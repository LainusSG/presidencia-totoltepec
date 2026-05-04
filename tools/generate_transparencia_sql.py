from __future__ import annotations

import json
import re
import subprocess
from html import escape
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "transparencia.html"
SQL_PATH = ROOT / "migrar-transparencia.sql"


class Element:
    def __init__(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tag = tag.lower()
        self.attrs = {key.lower(): value or "" for key, value in attrs}
        self.children: list[Element | str] = []

    def attr(self, name: str) -> str:
        return self.attrs.get(name, "")


class Parser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Element("root", [])
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        element = Element(tag, attrs)
        self.stack[-1].children.append(element)
        if tag.lower() not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(element)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        self.stack[-1].children.append(data)


def classes(element: Element) -> set[str]:
    return set(element.attr("class").split())


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", repair_text(value or "")).strip()


def repair_text(value: str) -> str:
    if "Ã" not in value and "Â" not in value and "â" not in value:
        return value
    try:
        return value.encode("latin1").decode("utf-8")
    except UnicodeError:
        return value


def clean_path(value: str) -> str:
    return (value or "").replace("\\", "/").strip()


def text_content(node: Element | str) -> str:
    if isinstance(node, str):
        return repair_text(node)
    return "".join(text_content(child) for child in node.children)


def children_elements(element: Element) -> list[Element]:
    return [child for child in element.children if isinstance(child, Element)]


def find_first(element: Element, predicate) -> Element | None:
    if predicate(element):
        return element
    for child in children_elements(element):
        found = find_first(child, predicate)
        if found:
            return found
    return None


def find_all(element: Element, predicate) -> list[Element]:
    found = []
    if predicate(element):
        found.append(element)
    for child in children_elements(element):
        found.extend(find_all(child, predicate))
    return found


def has_descendant(element: Element, predicate) -> bool:
    return any(predicate(child) or has_descendant(child, predicate) for child in children_elements(element))


def closest_tag(element: Element, target: str, parents: dict[int, Element]) -> bool:
    current = parents.get(id(element))
    while current:
        if current.tag == target:
            return True
        current = parents.get(id(current))
    return False


def build_parents(element: Element, parents: dict[int, Element]) -> None:
    for child in children_elements(element):
        parents[id(child)] = element
        build_parents(child, parents)


def serialize(node: Element | str) -> str:
    if isinstance(node, str):
        return escape(repair_text(node), quote=False)
    attrs = "".join(
        f' {key}="{escape(value, quote=True)}"'
        for key, value in node.attrs.items()
        if value != ""
    )
    return f"<{node.tag}{attrs}>" + "".join(serialize(child) for child in node.children) + f"</{node.tag}>"


def inner_html(element: Element) -> str:
    return "".join(serialize(child) for child in element.children)


def create_id(prefix: str, counter: dict[str, int]) -> str:
    counter[prefix] = counter.get(prefix, 0) + 1
    return f"{prefix}-{counter[prefix]}"


def create_node(title: str, counter: dict[str, int]) -> dict:
    return {
        "id": create_id("node", counter),
        "title": clean_text(title),
        "data": "",
        "children": [],
        "documents": [],
    }


def get_orga_title(element: Element) -> str:
    title = find_first(element, lambda item: "organigrama" in classes(item))
    return clean_text(text_content(title if title else element))


def is_category_block(element: Element) -> bool:
    return (
        element.attr("id") == "conac"
        and not has_descendant(element, lambda item: item.tag == "a" and bool(item.attr("href")))
        and not has_descendant(element, lambda item: item.tag in {"h1", "h2", "h3", "h4", "h5", "h6"})
    )


def ensure_general(nodes: list[dict], counter: dict[str, int]) -> dict:
    for node in nodes:
        if node["title"] == "GENERAL":
            return node
    general = create_node("GENERAL", counter)
    nodes.append(general)
    return general


def add_document(node: dict, link: Element, counter: dict[str, int]) -> None:
    href = clean_path(link.attr("href"))
    title = clean_text(text_content(link)) or Path(href).stem or "DOCUMENTO"
    node["documents"].append({
        "id": create_id("doc", counter),
        "title": title,
        "data": href,
        "href": href,
    })


def read_documents_block(block: Element, parent_node: dict, counter: dict[str, int], parents: dict[int, Element]) -> None:
    active_node = parent_node
    for child in children_elements(block):
        if child.tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            active_node = create_node(text_content(child), counter)
            parent_node["children"].append(active_node)
            continue

        if child.tag == "p" and not closest_tag(child, "a", parents):
            text = clean_text(text_content(child))
            if text:
                active_node = create_node(text, counter)
                parent_node["children"].append(active_node)
            continue

        if child.tag == "a":
            add_document(active_node, child, counter)
            continue

        for link in find_all(child, lambda item: item.tag == "a" and bool(item.attr("href"))):
            add_document(active_node, link, counter)


def collect_pdfs(nodes: list[dict]) -> list[dict]:
    pdfs: dict[str, dict] = {}
    for node in nodes:
        for document in node["documents"]:
            href = clean_path(document.get("href") or document.get("data") or "")
            if href:
                pdfs[href.lower()] = {"title": document["title"], "href": href}
        pdfs.update({item["href"].lower(): item for item in collect_pdfs(node["children"])})
    return sorted(pdfs.values(), key=lambda item: item["title"])


def parse_transparencia(source: str) -> dict:
    parser = Parser()
    parser.feed(source)
    parents: dict[int, Element] = {}
    build_parents(parser.root, parents)

    info = find_first(parser.root, lambda item: item.tag == "div" and "info" in classes(item))
    if not info:
        raise RuntimeError("No se encontro .info en transparencia.html")

    parsed = {"introHtml": "", "nodes": []}
    counter: dict[str, int] = {}
    current_top = None
    current_section = None

    for child in children_elements(info):
        if "orga" in classes(child):
            title = get_orga_title(child)
            if title == "TRANSPARENCIA":
                current_section = None
                continue
            if not title:
                current_section = current_top
                continue
            if not current_top:
                current_top = create_node("GENERAL", counter)
                parsed["nodes"].append(current_top)
            current_section = create_node(title, counter)
            current_top["children"].append(current_section)
            continue

        if "pdf" not in classes(child):
            continue

        if child.attr("id") == "transparencia":
            parsed["introHtml"] = inner_html(child)
            continue

        if is_category_block(child):
            current_top = create_node(text_content(child), counter)
            current_section = current_top
            parsed["nodes"].append(current_top)
            continue

        if has_descendant(child, lambda item: (item.tag == "a" and bool(item.attr("href"))) or item.tag in {"h1", "h2", "h3", "h4", "h5", "h6"}):
            read_documents_block(child, current_section or current_top or ensure_general(parsed["nodes"], counter), counter, parents)

    return parsed


def sql_quote(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def main() -> None:
    source = HTML_PATH.read_text(encoding="utf-8")
    parsed = parse_transparencia(source)

    if not parsed["nodes"]:
        source = subprocess.check_output(
            ["git", "show", "HEAD:transparencia.html"],
            cwd=ROOT,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        parsed = parse_transparencia(source)

    nodes_json = json.dumps(parsed["nodes"], ensure_ascii=False, separators=(",", ":"))
    pdfs_json = json.dumps(collect_pdfs(parsed["nodes"]), ensure_ascii=False, separators=(",", ":"))
    intro_html = parsed["introHtml"]

    sql = f"""INSERT INTO transparencia_data (
  id,
  intro_html,
  nodes_json,
  pdfs_json,
  schema_version
) VALUES (
  1,
  {sql_quote(intro_html)},
  {sql_quote(nodes_json)},
  {sql_quote(pdfs_json)},
  'v3'
)
ON DUPLICATE KEY UPDATE
  intro_html = VALUES(intro_html),
  nodes_json = VALUES(nodes_json),
  pdfs_json = VALUES(pdfs_json),
  schema_version = VALUES(schema_version);
"""
    SQL_PATH.write_text(sql, encoding="utf-8")
    print(f"SQL generado: {SQL_PATH}")
    print(f"Registros principales: {len(parsed['nodes'])}")
    print(f"PDFs detectados: {len(json.loads(pdfs_json))}")


if __name__ == "__main__":
    main()
