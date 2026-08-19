import re

total = 0
for f in ["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py",
          "front_matter.py", "back_matter.py"]:
    src = open(f, encoding="utf-8").read()
    strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', src)
    blob = " ".join(s for s in strings if len(s) > 35 and "<" not in s and not s.startswith("fig"))
    wc = len(blob.split())
    total += wc
    print(f, wc)
print("TOTAL prose words (approx):", total)
print("Rough body pages at ~430 words/page (12pt TNR, 1.5 spacing, A4):", round(total / 430))
