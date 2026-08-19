"""Counts distinct cited references per chapter by checking, for each known
reference's short-form surname/key, whether it appears anywhere in that
chapter's prose (crude but effective substring presence check -- good enough
since our reference short-forms are distinctive)."""
import re
from references_final import REFERENCES

# Build a short "key" per reference: first author's surname (or organisation
# name / distinctive title word for no-author entries).
KEYS = []
for ref in REFERENCES:
    m = re.match(r'^([A-Za-zÀ-ÿ.\'-]+)', ref)
    key = m.group(1)
    KEYS.append(key)

for ch in ["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py"]:
    src = open(ch, encoding="utf-8").read()
    present = [k for k in KEYS if k in src]
    print(f"{ch}: {len(present)} distinct references present")
    print("   ", ", ".join(present))
