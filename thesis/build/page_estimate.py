"""Precise-as-possible page estimate: uses real SVG aspect ratios (exactly
what docx_writer scales to print width), real table row counts, and a
measured words-per-page rate for 12pt Times New Roman / 1.5 line spacing /
A4 with this document's actual margins -- rather than a flat guess."""
import glob
import os
import re

CONTENT_WIDTH_IN = 5.75  # matches docx_writer.CONTENT_WIDTH_IN
PAGE_USABLE_HEIGHT_IN = 9.69  # A4 11.69in - 1in top - 1in bottom margins
WORDS_PER_PAGE = 400  # empirical for 12pt TNR, 1.5 spacing, justified, ~5.75in column

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")

# ---- Figures: real aspect ratio x actual print width (2.6in for screenshot
# wireframes, 5.75in for everything else) ----
total_fig_in = 0.0
fig_count = 0
for path in sorted(glob.glob(os.path.join(FIG_DIR, "*.svg"))):
    if "smoke" in path:
        continue
    svg = open(path, encoding="utf-8").read()
    w = float(re.search(r'width="([\d.]+)"', svg).group(1))
    h = float(re.search(r'height="([\d.]+)"', svg).group(1))
    aspect = h / w
    width_in = 2.6 if "fig_shot_" in path else CONTENT_WIDTH_IN
    height_in = width_in * aspect
    total_fig_in += height_in + 0.35  # + caption line + spacing before/after
    fig_count += 1

print(f"Figures: {fig_count}, total vertical inches (incl. captions): {total_fig_in:.1f}in "
      f"= {total_fig_in/PAGE_USABLE_HEIGHT_IN:.1f} pages worth")

# ---- Tables: real row counts from each chapter/back-matter file ----
TABLES = {
    "Table 1 (Ch.1, problem->response)": 4,
    "Table 2 (Ch.2, feature coverage)": 6,
    "Table 3 (Ch.3, tech stack)": 11,
    "Table 4 (Ch.4, budget)": 7,
    "Table A1 (Appendix, API endpoints, 33 rows)": 33,
    "Table B1 (Appendix, User fields)": 12,
    "Table B2 (Appendix, Book fields)": 10,
    "Table B3 (Appendix, remaining DB tables)": 12,
    "Table D1 (Appendix, usability instrument)": 6,
    "Table D2 (Appendix, functional test cases)": 10,
    "Table G1 (Appendix, full schedule)": 11,
}
ROW_HEIGHT_IN = 0.30  # header + body row incl. cell padding at 9.5-10.5pt
total_table_in = 0.0
for name, rows in TABLES.items():
    h = (rows + 1) * ROW_HEIGHT_IN + 0.35  # +1 header row, + caption/spacing
    total_table_in += h
print(f"Tables: {len(TABLES)}, total vertical inches: {total_table_in:.1f}in "
      f"= {total_table_in/PAGE_USABLE_HEIGHT_IN:.1f} pages worth")

# ---- Body text word counts (already computed by wordcount.py logic) ----
def prose_words(fname):
    src = open(fname, encoding="utf-8").read()
    strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', src)
    blob = " ".join(s for s in strings if len(s) > 35 and "<" not in s and not s.startswith("fig"))
    return len(blob.split())

chapter_words = sum(prose_words(f) for f in ["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py"])

# ---- Front-matter List of Figures / List of Tables now real, one line each ----
import sys
sys.path.insert(0, ".")
from extract_lists import extract
_figs, _tabs = extract(["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py", "back_matter.py"])
lof_lot_in = (len(_figs) + len(_tabs)) * 0.19  # ~1 line each at these settings
print(f"List of Figures/Tables: {len(_figs)} figs + {len(_tabs)} tables = {lof_lot_in:.1f}in extra in front matter")
chapter_text_pages = chapter_words / WORDS_PER_PAGE
print(f"\nChapter body text: {chapter_words} words = {chapter_text_pages:.1f} pages")

fig_pages = total_fig_in / PAGE_USABLE_HEIGHT_IN
table_pages = total_table_in / PAGE_USABLE_HEIGHT_IN
chapters_total = chapter_text_pages + fig_pages + table_pages
print(f"Chapters 1-5 total (text + figures + tables): {chapters_total:.1f} pages")

# ---- Front matter: each section is forced onto its own page via page_break() ----
# title, certification, dedication, acknowledgement, abstract, TOC = 6 fixed single pages;
# List of Figures (53 entries, ~1 page+) and List of Tables (10 entries, <1 page) now real content
lof_pages = max(1, round(len(_figs) * 0.19 / PAGE_USABLE_HEIGHT_IN + 0.5))
lot_pages = 1
front_matter_pages = 6 + lof_pages + lot_pages
print(f"\nFront matter (6 fixed pages + {lof_pages} LOF + {lot_pages} LOT): {front_matter_pages} pages")

# ---- References: 26 hanging-indent entries ----
ref_words = prose_words("back_matter.py")  # includes appendix intros too; refs list itself is short strings, undercounted by the >35-char filter, so estimate directly
n_refs = 26
avg_ref_lines = 2.6  # measured: most APA entries wrap to 2-3 lines at this column width
ref_in = n_refs * (avg_ref_lines * 0.23 + 0.14) + 1.2  # + intro para + heading page
ref_pages = ref_in / PAGE_USABLE_HEIGHT_IN + 1  # +1 for forced page break before References heading
print(f"References: {n_refs} entries = ~{ref_pages:.1f} pages")

# ---- Appendices: intros + the tables already counted above + code listings + glossary ----
appendix_extra_in = (
    6.1   # Listings A1+A2 (login + checkout request/response)
    + 5.3  # Listings C1-C3 (code excerpts)
    + 7.5  # Listing B1 (Prisma schema excerpt, ~42 lines at tight line-height)
    + 3.1  # Appendix E (7-step user-manual walkthrough)
    + 0.45  # Appendix F (data privacy paragraph)
    + 1.2  # short section-intro paragraphs across Appendices A-H
    + 3.5  # Appendix H glossary, 10 terms
)
appendix_pages = 1 + appendix_extra_in / PAGE_USABLE_HEIGHT_IN  # +1 forced page break before "APPENDICES"
print(f"Appendices (extra beyond its 3 tables already counted): ~{appendix_pages:.1f} pages")

# ---- Corrections often missed by a pure word/figure/table sum ----
n_headings = 0
for f in ["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py"]:
    n_headings += open(f, encoding="utf-8").read().count('d.heading(')
heading_extra_in = n_headings * 0.30  # spacing before/after a heading, beyond its own text line
heading_pages = heading_extra_in / PAGE_USABLE_HEIGHT_IN

n_forced_breaks = 7  # 5 chapters + References + Appendices each force a fresh page
partial_page_waste = n_forced_breaks * 0.4  # average unused space at the end of the preceding section

correction_pages = heading_pages + partial_page_waste
print(f"\nPagination corrections: {n_headings} headings (+{heading_pages:.1f}pp), "
      f"{n_forced_breaks} forced page breaks (+{partial_page_waste:.1f}pp) = +{correction_pages:.1f} pages")

total = chapters_total + front_matter_pages + ref_pages + appendix_pages + correction_pages
print(f"\n{'='*50}\nESTIMATED TOTAL: {total:.0f} pages\n{'='*50}")
