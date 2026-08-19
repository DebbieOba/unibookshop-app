import os, sys, zipfile
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
from docx_writer import Docx
import chapter1
import chapter2

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
os.makedirs(FIG_DIR, exist_ok=True)
OUT = os.path.join(os.path.dirname(__file__), "..", "output", "CURRICULA_Chapters1-2_PREVIEW.docx")

figs1 = chapter1.build_figures()
figs2 = chapter2.build_figures()
print(f"Generated {len(figs1)} Ch1 figures, {len(figs2)} Ch2 figures.")

d = Docx()
d.add_footer_part("roman", fmt="lowerRoman")
d.add_footer_part("arabic", fmt="decimal")

d.heading("(Front matter placeholder — see separate front-matter draft)", level=3, center=True)
d.body_text("Title page, certification, dedication, acknowledgement, abstract, and table of contents "
            "will be assembled once institutional details are confirmed. This preview starts numbering "
            "at Chapter One for review purposes.")
d.close_section(pg_fmt="lowerRoman", start=1, footer_key="roman")

chapter1.write(d, figs1)
chapter2.write(d, figs2)

d.final_section(pg_fmt="decimal", start=1, footer_key="arabic")
d.save(OUT, title="CURRICULA Thesis - Chapters 1-2 Preview", author="Draft")
print("Wrote", OUT, os.path.getsize(OUT), "bytes")

with zipfile.ZipFile(OUT) as z:
    for n in z.namelist():
        if n.endswith((".xml", ".rels")):
            try:
                ET.fromstring(z.read(n))
            except ET.ParseError as e:
                print("XML ERROR in", n, e)
                raise
    print("All XML well-formed. Parts:", len(z.namelist()))
