import re

total_words = 0
total_emdash = 0
patterns = {
    "it is worth": 0,
    "worth noting": 0,
    "worth stating": 0,
    "This is not": 0,
    "not merely": 0,
    "not only": 0,
    "precisely": 0,
    "deliberately": 0,
    "directly": 0,
    "genuinely": 0,
}

for f in ["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py"]:
    src = open(f, encoding="utf-8").read()
    strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', src)
    blob = " ".join(s for s in strings if len(s) > 35 and "<" not in s and not s.startswith("fig"))
    words = len(blob.split())
    emdash = blob.count("—")
    total_words += words
    total_emdash += emdash
    print(f"{f}: {words} words, {emdash} em-dashes -> 1 per {words/max(emdash,1):.0f} words")
    for p in patterns:
        patterns[p] += blob.lower().count(p.lower())

print(f"\nTOTAL: {total_words} words, {total_emdash} em-dashes -> 1 per {total_words/total_emdash:.0f} words")
print("\nPhrase frequency (potential AI-tell repetition):")
for p, n in sorted(patterns.items(), key=lambda x: -x[1]):
    print(f"  {p!r}: {n} ({total_words/max(n,1):.0f} words/occurrence)")
