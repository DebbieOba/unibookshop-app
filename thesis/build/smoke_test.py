import os, sys, zipfile
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
from docx_writer import Docx
from svg_gen import svg_doc, box, arrow, figure_frame, PRIMARY_SOFT, PRIMARY

HERE = os.path.dirname(__file__)
FIG_DIR = os.path.join(HERE, "..", "figures")
os.makedirs(FIG_DIR, exist_ok=True)

body = box(20, 20, 160, 70, "Mobile App", "React Native") + \
       box(240, 20, 160, 70, "API", "NestJS") + \
       arrow(180, 55, 240, 55)
svg = figure_frame(420, 110, "Sample architecture diagram for smoke testing.", 1, body)
svg_path = os.path.join(FIG_DIR, "smoke_fig1.svg")
with open(svg_path, "w", encoding="utf-8") as f:
    f.write(svg)

d = Docx()
d.add_footer_part("roman", fmt="lowerRoman", prefix="")
d.add_footer_part("arabic", fmt="decimal", prefix="")

d.heading("TITLE PAGE", level=1, center=True)
d.body_text("This is the front matter smoke-test paragraph, justified, Times New Roman 12pt, 1.5 line spacing.")
d.close_section(pg_fmt="lowerRoman", start=1, footer_key="roman")

d.heading("CHAPTER ONE", level=1)
d.heading("Introduction", level=2, number="1.0")
d.body_text("Body chapter text starts here on page 1 (arabic).")
d.figure_svg(svg_path, "Sample architecture diagram for smoke testing.", number="1.1")
d.table(["Item", "Cost (₦)"], [["Domain", "15,000"], ["Hosting", "60,000"]], caption="Sample budget line items.", number="1")
d.final_section(pg_fmt="decimal", start=1, footer_key="arabic")

out = os.path.join(HERE, "..", "output", "smoke_test.docx")
os.makedirs(os.path.dirname(out), exist_ok=True)
d.save(out, title="Smoke Test", author="Tester")
print("wrote", out, os.path.getsize(out), "bytes")

# Validate: every XML part must be well-formed, zip must open, required parts present
with zipfile.ZipFile(out) as z:
    names = z.namelist()
    required = ["[Content_Types].xml", "_rels/.rels", "word/document.xml",
                "word/_rels/document.xml.rels", "word/styles.xml", "word/settings.xml"]
    for r in required:
        assert r in names, f"MISSING PART: {r}"
    for n in names:
        if n.endswith(".xml") or n.endswith(".rels"):
            data = z.read(n)
            try:
                ET.fromstring(data)
            except ET.ParseError as e:
                print(f"XML PARSE ERROR in {n}: {e}")
                raise
    print("All XML parts well-formed. Parts:", len(names))
    print(names)
