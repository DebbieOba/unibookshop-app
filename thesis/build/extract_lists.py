"""Extracts every d.figure_svg(...)/d.figure_raster(...) call's (number, caption)
and every d.table(...) call's (number, caption) from the chapter source files,
so the List of Figures / List of Tables in the front matter is generated from
the real content rather than left as a manual-update placeholder."""
import re

FIG_CALL = re.compile(
    r'd\.figure_(?:svg|raster)\(\s*[\w\[\]"\'.]+\s*,\s*"((?:[^"\\]|\\.)*)"[\s\S]{0,80}?number="([^"]+)"',
)
TABLE_CAPTION = re.compile(r'caption="((?:[^"\\]|\\.)*)"[\s\S]{0,120}?number="([^"]+)"')


def _unescape(s):
    return s.replace('\\"', '"').replace("\\n", " ")


def extract(chapter_files):
    figures = []
    tables = []
    for fname in chapter_files:
        src = open(fname, encoding="utf-8").read()
        for m in FIG_CALL.finditer(src):
            caption, number = m.group(1), m.group(2)
            figures.append((number, _unescape(caption)))
        for m in TABLE_CAPTION.finditer(src):
            caption, number = m.group(1), m.group(2)
            tables.append((number, _unescape(caption)))
        # build_screenshot_or_wireframe() builds its caption by string-concatenation
        # (caption_var + " [placeholder...]"), which the regex above can't see into;
        # pull those 4 calls out explicitly instead.
        for m in re.finditer(
            r'build_screenshot_or_wireframe\(\s*d,\s*"[^"]+",\s*"[^"]+",\s*\[.*?\],\s*'
            r'"((?:[^"\\]|\\.)*)",\s*"([^"]+)"', src, re.DOTALL,
        ):
            caption, number = m.group(1), m.group(2)
            figures.append((number, _unescape(caption)))
    return figures, tables


def _sort_key(item):
    parts = re.split(r"[.\s]", item[0])
    key = []
    for p in parts:
        try:
            key.append((0, int(p)))
        except ValueError:
            key.append((1, p))
    return key


if __name__ == "__main__":
    figs, tabs = extract(["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py", "back_matter.py"])
    figs.sort(key=_sort_key)
    tabs.sort(key=_sort_key)
    print(f"Figures found: {len(figs)}")
    for n, c in figs:
        print(f"  Figure {n}: {c[:70]}")
    print(f"\nTables found: {len(tabs)}")
    for n, c in tabs:
        print(f"  Table {n}: {c[:70]}")
