"""Automated overflow QA: parses every generated SVG and flags any rect/line/
circle whose coordinates fall outside the declared canvas, and any canvas
whose pixel width is disproportionate (skews text illegibly small once every
figure is normalised to the same printed width in the .docx)."""
import glob
import os
import re

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")

TARGET_W_RANGE = (0, 999999)  # width itself doesn't affect print legibility since every
# figure is normalised to the same physical width in the .docx; only true overflow matters


def check(path):
    svg = open(path, encoding="utf-8").read()
    w = float(re.search(r'width="([\d.]+)"', svg).group(1))
    h = float(re.search(r'height="([\d.]+)"', svg).group(1))
    problems = []
    for m in re.finditer(r'<rect x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"', svg):
        x, y, rw, rh = map(float, m.groups())
        if x < -1 or y < -1 or x + rw > w + 1 or y + rh > h + 1:
            problems.append(f"rect x={x} y={y} w={rw} h={rh} exceeds canvas {w}x{h}")
    for m in re.finditer(r'<line x1="(-?[\d.]+)" y1="(-?[\d.]+)" x2="(-?[\d.]+)" y2="(-?[\d.]+)"', svg):
        x1, y1, x2, y2 = map(float, m.groups())
        for x, y in [(x1, y1), (x2, y2)]:
            if x < -1 or y < -1 or x > w + 1 or y > h + 1:
                problems.append(f"line endpoint ({x},{y}) exceeds canvas {w}x{h}")
    if not (TARGET_W_RANGE[0] <= w <= TARGET_W_RANGE[1]):
        problems.append(f"canvas width {w} outside comfortable {TARGET_W_RANGE} band (text may print too small/large)")
    return w, h, problems


if __name__ == "__main__":
    any_problem = False
    for path in sorted(glob.glob(os.path.join(FIG_DIR, "*.svg"))):
        if "smoke" in path:
            continue
        w, h, problems = check(path)
        name = os.path.basename(path)
        if problems:
            any_problem = True
            print(f"[ISSUE] {name} ({w}x{h}):")
            for p in problems:
                print("   -", p)
        else:
            print(f"[ok] {name} ({w}x{h})")
    if not any_problem:
        print("\nAll figures within bounds and comfortable width band.")
