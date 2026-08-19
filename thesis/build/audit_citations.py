import re
from collections import defaultdict

NAMES = [
    "Oyekan", "Pinto", "Yusuf", "paymentscmi", "Vangavolu", "Budiyanto", "Kathiriya",
    "Alaqidi", "Jayeola", "Impact of FinTech", "go-globe", "Global Payments", "Singh",
    "Osman", "Mabidi", "Markowski", "Privalov", "Homfeldt", "Sandhu", "Nielsen",
    "Sommerville", "Schwaber", "Fowler", "Chen", "Marinho", "Mobile fintech adoption",
]

counts = defaultdict(list)
for ch in ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5"]:
    src = open(ch + ".py", encoding="utf-8").read()
    lines = src.split("\n")
    for i, line in enumerate(lines):
        for n in NAMES:
            if n in line:
                # skip pure data-table lines (dict keys / header lists), heuristic:
                # a real prose citation line contains normal sentence punctuation/spacing
                is_table_data = bool(re.search(r'^\s*(\[|")' + re.escape(n), line.strip())) or \
                                bool(re.search(r'":\s*\[', line)) or "systems = [" in line or "categories = [" in line
                counts[n].append((ch, i + 1, "TABLE-DATA" if is_table_data else "PROSE"))

print(f"{'Reference':30s} {'prose-hits':10s} chapters")
violations = []
for n in NAMES:
    hits = counts[n]
    prose_hits = [h for h in hits if h[2] == "PROSE"]
    chapters = sorted(set(h[0] for h in prose_hits))
    print(f"{n:30s} {len(prose_hits):<10d} {chapters}")
    if len(prose_hits) > 3:  # each real citation event ~ often 1-2 raw line hits (paragraph + fig caption + fig call)
        violations.append(n)

print("\nFlagged for manual review (raw prose-line hits > 3):", violations or "none")
