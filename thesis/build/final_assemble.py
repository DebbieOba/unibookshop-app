import os, sys, zipfile
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
from docx_writer import Docx
import chapter1, chapter2, chapter3, chapter4, chapter5
import front_matter
import back_matter

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
os.makedirs(FIG_DIR, exist_ok=True)
OUT = os.path.join(os.path.dirname(__file__), "..", "output", "CURRICULA_Final_Year_Project.docx")

print("Building figures...")
figs1 = chapter1.build_figures()
figs2 = chapter2.build_figures()
figs3 = chapter3.build_figures()
figs4 = chapter4.build_figures()
figs5 = chapter5.build_figures()
total_figs = len(figs1) + len(figs2) + len(figs3) + len(figs4) + len(figs5)
print(f"Total figures: {total_figs}")

d = Docx()
d.add_footer_part("roman", fmt="lowerRoman")
d.add_footer_part("arabic", fmt="decimal")

front_matter.write(d)
d.close_section(pg_fmt="lowerRoman", start=1, footer_key="roman")

chapter1.write(d, figs1)
chapter2.write(d, figs2)
chapter3.write(d, figs3)
chapter4.write(d, figs4)
chapter5.write(d, figs5)
back_matter.write_references(d)
back_matter.write_appendices(d)

d.final_section(pg_fmt="decimal", start=1, footer_key="arabic")
d.save(OUT, title="Design and Implementation of CURRICULA", author="Final Year Student")
size = os.path.getsize(OUT)
print(f"Wrote {OUT} ({size:,} bytes)")

with zipfile.ZipFile(OUT) as z:
    names = z.namelist()
    for n in names:
        if n.endswith((".xml", ".rels")):
            try:
                ET.fromstring(z.read(n))
            except ET.ParseError as e:
                print("XML ERROR in", n, ":", e)
                raise
    print(f"All {len(names)} XML/rels parts well-formed.")
    media = [n for n in names if n.startswith("word/media/")]
    print(f"Embedded media files: {len(media)}")
