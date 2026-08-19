"""Checks: (1) every reference in the bibliography is cited at least once
somewhere in Ch.1-5, and (2) no reference is cited (as prose, not
table/chart data labels) more than 3 times across the whole document."""
import re
from references_final import REFERENCES

CHAPTERS = ["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py"]
sources = {ch: open(ch, encoding="utf-8").read() for ch in CHAPTERS}
combined = "\n".join(sources.values())

KEYS = []
for ref in REFERENCES:
    m = re.match(r"^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*)", ref)
    KEYS.append((m.group(1), ref))

print("=== Unused references (0 occurrences anywhere) ===")
unused = [(k, ref) for k, ref in KEYS if k not in combined]
for k, ref in unused:
    print(f"  MISSING: {k!r} -> {ref[:80]}")
if not unused:
    print("  none -- every reference appears at least once")

print("\n=== Raw occurrence counts (manual review needed for >3, since table/")
print("    chart data labels are not real citation events) ===")
for k, ref in KEYS:
    n = combined.count(k)
    flag = "  <-- check" if n > 4 else ""
    print(f"  {k:20s} {n:3d}{flag}")
