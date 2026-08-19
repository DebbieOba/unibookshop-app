import os, sys, zipfile, re
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
from docx_writer import Docx
import chapter1, chapter2, chapter3, chapter4, chapter5

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
os.makedirs(FIG_DIR, exist_ok=True)
OUT = os.path.join(os.path.dirname(__file__), "..", "output", "CURRICULA_AllChapters_PREVIEW.docx")

figs = {}
word_count = 0
for name, mod in [("ch1", chapter1), ("ch2", chapter2), ("ch3", chapter3), ("ch4", chapter4), ("ch5", chapter5)]:
    src = open(os.path.join(os.path.dirname(__file__), name.replace("ch", "chapter") + ".py"), encoding="utf-8").read()
    strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', src)
    text_blob = " ".join(s for s in strings if len(s) > 40 and not s.startswith("fig") and "<" not in s)
    wc = len(text_blob.split())
    print(f"{name}: approx {wc} words of prose")
    word_count += wc

figs["1"] = chapter1.build_figures()
figs["2"] = chapter2.build_figures()
figs["3"] = chapter3.build_figures()
figs["4"] = chapter4.build_figures()
figs["5"] = chapter5.build_figures()
print("Total figures:", sum(len(f) for f in figs.values()))
print("Approx total prose word count:", word_count)
# rough pages estimate: ~430 words/page body text (12pt TNR, 1.5 spacing, A4) + figures add ~0.5-0.75pp each
approx_text_pages = word_count / 430
approx_fig_pages = sum(len(f) for f in figs.values()) * 0.6
print(f"Rough page estimate: {approx_text_pages:.0f} (text) + {approx_fig_pages:.0f} (figures/tables) = {approx_text_pages+approx_fig_pages:.0f} pages (excludes front matter/refs/appendices)")

d = Docx()
d.add_footer_part("roman", fmt="lowerRoman")
d.add_footer_part("arabic", fmt="decimal")
d.heading("(front matter placeholder)", level=3)
d.close_section(pg_fmt="lowerRoman", start=1, footer_key="roman")
chapter1.write(d, figs["1"])
chapter2.write(d, figs["2"])
chapter3.write(d, figs["3"])
chapter4.write(d, figs["4"])
chapter5.write(d, figs["5"])
d.final_section(pg_fmt="decimal", start=1, footer_key="arabic")
d.save(OUT, title="CURRICULA Thesis - All Chapters Preview", author="Draft")
print("Wrote", OUT, os.path.getsize(OUT), "bytes")

with zipfile.ZipFile(OUT) as z:
    for n in z.namelist():
        if n.endswith((".xml", ".rels")):
            ET.fromstring(z.read(n))
    print("XML OK. Parts:", len(z.namelist()))
