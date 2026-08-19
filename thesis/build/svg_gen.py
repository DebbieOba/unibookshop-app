"""Reusable SVG primitives for the thesis figures.

Pure stdlib (just string building) — no rendering dependency at all, which
sidesteps this machine's Application Control policy blocking third-party
compiled packages (numpy/lxml/Pillow). SVG text is real text (not rasterised
glyphs), so labels are always crisp and there is no bitmap-font risk.
"""

FONT = "Calibri, 'Segoe UI', Arial, sans-serif"

# A restrained, colour-blind-considerate palette reused across every figure
# so the report reads as one visual system.
INK = "#1F2937"
INK_SOFT = "#475569"
LINE = "#334155"
PRIMARY = "#3B4E8F"
PRIMARY_SOFT = "#DCE3F5"
ACCENT = "#B4894A"
ACCENT_SOFT = "#F1E6D3"
NEUTRAL = "#64748B"
NEUTRAL_SOFT = "#E7EBF0"
OK = "#2F7D5C"
OK_SOFT = "#DCEEE5"
WARN = "#B45309"
WARN_SOFT = "#FBEBD0"
BG = "#FFFFFF"


def esc(s: str) -> str:
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def svg_doc(width, height, body, bg=BG):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" font-family="{FONT}">\n'
        f'<rect x="0" y="0" width="{width}" height="{height}" fill="{bg}"/>\n'
        f"{_defs()}\n{body}\n</svg>"
    )


def _defs():
    return (
        "<defs>"
        '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" '
        'markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0,0 L10,5 L0,10 z" fill="{LINE}"/></marker>'
        '<marker id="arrowAccent" viewBox="0 0 10 10" refX="9" refY="5" '
        'markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0,0 L10,5 L0,10 z" fill="{ACCENT}"/></marker>'
        "</defs>"
    )


def text(x, y, s, size=13, anchor="start", weight="normal", fill=INK, style="normal"):
    return (
        f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" '
        f'font-weight="{weight}" font-style="{style}" fill="{fill}">{esc(s)}</text>\n'
    )


def wrapped_text(x, y, s, size=12, max_chars=28, anchor="middle", weight="normal",
                  fill=INK, line_h=None):
    """Very simple greedy word-wrap for labels inside boxes."""
    line_h = line_h or size + 4
    words = s.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if len(trial) > max_chars and cur:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    out = ""
    start_y = y - (len(lines) - 1) * line_h / 2
    for i, ln in enumerate(lines):
        out += text(x, start_y + i * line_h, ln, size, anchor, weight, fill)
    return out


def rect(x, y, w, h, fill=PRIMARY_SOFT, stroke=PRIMARY, rx=8, sw=1.5, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>\n'
    )


def box(x, y, w, h, label, sub=None, fill=PRIMARY_SOFT, stroke=PRIMARY,
        size=13, sub_size=10.5, text_fill=INK):
    out = rect(x, y, w, h, fill, stroke)
    if sub:
        out += wrapped_text(x + w / 2, y + h / 2 - 6, label, size, weight="bold",
                             fill=text_fill, max_chars=max(10, w // 7))
        out += wrapped_text(x + w / 2, y + h / 2 + 14, sub, sub_size, fill=INK_SOFT,
                             max_chars=max(12, w // 6))
    else:
        out += wrapped_text(x + w / 2, y + h / 2, label, size, weight="bold",
                             fill=text_fill, max_chars=max(10, w // 7))
    return out


def cylinder(x, y, w, h, label, fill=ACCENT_SOFT, stroke=ACCENT):
    ell = h * 0.16
    out = f'<path d="M{x},{y+ell} v{h-2*ell} a{w/2},{ell} 0 0 0 {w},0 v-{h-2*ell}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>\n'
    out += f'<ellipse cx="{x+w/2}" cy="{y+ell}" rx="{w/2}" ry="{ell}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>\n'
    out += wrapped_text(x + w / 2, y + h / 2 + ell / 2, label, 11.5, weight="bold",
                         max_chars=max(10, w // 6))
    return out


def actor(x, y, label, fill=NEUTRAL):
    """Filled person-silhouette actor (head centred at (x,y)) -- reads as a
    small illustration rather than a bare UML stick figure."""
    return person_icon(x, y, label, scale=0.62, fill=fill)


def ellipse_uc(x, y, w, h, label, fill=PRIMARY_SOFT, stroke=PRIMARY):
    out = f'<ellipse cx="{x}" cy="{y}" rx="{w/2}" ry="{h/2}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>\n'
    out += wrapped_text(x, y, label, 11, weight="bold", max_chars=max(10, w // 7))
    return out


def arrow(x1, y1, x2, y2, stroke=LINE, sw=1.6, dash=None, marker="arrow", curve=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    if curve:
        path = f"M{x1},{y1} Q{curve[0]},{curve[1]} {x2},{y2}"
        return f'<path d="{path}" fill="none" stroke="{stroke}" stroke-width="{sw}"{d} marker-end="url(#{marker})"/>\n'
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" '
        f'stroke-width="{sw}"{d} marker-end="url(#{marker})"/>\n'
    )


def label_on_line(x1, y1, x2, y2, s, size=10.5, fill=INK_SOFT, dy=-6, bg=BG):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + dy
    w = max(24, len(s) * size * 0.56)
    out = f'<rect x="{mx-w/2}" y="{my-size-2}" width="{w}" height="{size+6}" fill="{bg}" opacity="0.92"/>\n'
    out += text(mx, my, s, size, "middle", fill=fill)
    return out


def diamond(x, y, w, h, label, fill=WARN_SOFT, stroke=WARN):
    pts = f"{x+w/2},{y} {x+w},{y+h/2} {x+w/2},{y+h} {x},{y+h/2}"
    out = f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>\n'
    out += wrapped_text(x + w / 2, y + h / 2, label, 10.5, weight="bold", max_chars=14)
    return out


def person_icon(x, y, label=None, scale=1.0, fill=NEUTRAL, skin="#E8C4A0"):
    """A simple but reasonably realistic filled person silhouette (head +
    shoulders/torso), used in place of a bare stick-figure for a less
    'flowchart-generated' look. (x,y) is the top of the head."""
    s = scale
    out = f'<circle cx="{x}" cy="{y+11*s}" r="{11*s}" fill="{skin}" stroke="{fill}" stroke-width="{1.4*s}"/>\n'
    out += (
        f'<path d="M{x-20*s},{y+62*s} '
        f'C{x-20*s},{y+30*s} {x-14*s},{y+20*s} {x},{y+20*s} '
        f'C{x+14*s},{y+20*s} {x+20*s},{y+30*s} {x+20*s},{y+62*s} Z" '
        f'fill="{fill}" stroke="{fill}" stroke-width="1"/>\n'
    )
    if label:
        out += text(x, y + 80 * s, label, 11.5 * s, "middle", "bold", fill=INK)
    return out


def phone_icon(x, y, w=54, h=104, screen_fill=PRIMARY_SOFT, frame=INK):
    """A simple rounded smartphone glyph with a screen highlight."""
    out = rect(x, y, w, h, fill=frame, stroke=frame, rx=10, sw=0)
    out += rect(x + 4, y + 10, w - 8, h - 20, fill=screen_fill, stroke="none", rx=3)
    out += f'<circle cx="{x+w/2}" cy="{y+h-7}" r="3.2" fill="{BG}"/>\n'
    return out


def shelf_icon(x, y, w=90, h=70, fill=ACCENT_SOFT, stroke=ACCENT):
    """A little bookshelf: a frame with 3 shelves and coloured 'book' ticks."""
    out = rect(x, y, w, h, fill="none", stroke=stroke, rx=4, sw=2)
    book_colors = [PRIMARY, ACCENT, OK, WARN, NEUTRAL]
    for row in range(2):
        ry = y + 6 + row * (h / 2 - 4)
        bx = x + 6
        i = 0
        while bx < x + w - 8:
            bw = 6 + (i % 3) * 2
            bh = (h / 2) - 14
            out += rect(bx, ry + ((h / 2 - 14) - bh), bw, bh, fill=book_colors[i % len(book_colors)], stroke="none", rx=1)
            bx += bw + 2
            i += 1
        out += f'<line x1="{x}" y1="{ry + h/2 - 8}" x2="{x+w}" y2="{ry + h/2 - 8}" stroke="{stroke}" stroke-width="1.5"/>\n'
    return out


def shop_icon(x, y, w=90, h=70, fill=PRIMARY_SOFT, stroke=PRIMARY):
    """A small storefront glyph: awning + door + window."""
    out = f'<path d="M{x},{y+18} L{x+w/2},{y} L{x+w},{y+18} Z" fill="{ACCENT}" stroke="{stroke}" stroke-width="1.5"/>\n'
    out += rect(x + 4, y + 18, w - 8, h - 18, fill=fill, stroke=stroke, rx=2)
    out += rect(x + w / 2 - 12, y + h - 28, 24, 28, fill=BG, stroke=stroke, rx=2)
    out += rect(x + 10, y + 26, w - 20, 18, fill=BG, stroke=stroke, rx=2)
    return out


def cash_icon(x, y, w=64, h=42, fill=OK_SOFT, stroke=OK, symbol="N"):
    out = rect(x, y, w, h, fill=fill, stroke=stroke, rx=6)
    out += f'<circle cx="{x+w/2}" cy="{y+h/2}" r="{h/2-8}" fill="none" stroke="{stroke}" stroke-width="1.3"/>\n'
    out += text(x + w / 2, y + h / 2 + 5, symbol, 13, "middle", "bold", fill=stroke)
    return out


def cloud_icon(x, y, w=90, h=50, fill=NEUTRAL_SOFT, stroke=NEUTRAL):
    r = h / 2.6
    out = (
        f'<g>'
        f'<circle cx="{x+r}" cy="{y+h-r}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.3"/>'
        f'<circle cx="{x+r*1.9}" cy="{y+h-r*1.7}" r="{r*1.15}" fill="{fill}" stroke="{stroke}" stroke-width="1.3"/>'
        f'<circle cx="{x+r*3.1}" cy="{y+h-r}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.3"/>'
        f'<rect x="{x+r*0.6}" y="{y+h-r*1.6}" width="{r*3}" height="{r*1.6}" fill="{fill}"/>'
        f'</g>'
    )
    return out


def check_badge(x, y, r=12, fill=OK, ok=True):
    out = f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>\n'
    if ok:
        out += f'<path d="M{x-r*0.5},{y} l{r*0.3},{r*0.35} l{r*0.55},-{r*0.55}" stroke="{BG}" stroke-width="{max(2,r*0.22)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n'
    else:
        d = r * 0.4
        out += f'<line x1="{x-d}" y1="{y-d}" x2="{x+d}" y2="{y+d}" stroke="{BG}" stroke-width="{max(2,r*0.22)}" stroke-linecap="round"/>\n'
        out += f'<line x1="{x+d}" y1="{y-d}" x2="{x-d}" y2="{y+d}" stroke="{BG}" stroke-width="{max(2,r*0.22)}" stroke-linecap="round"/>\n'
    return out


def line_chart(x0, y0, w, h, series, x_labels, y_max=None, y_unit="", title=None):
    """A real line/trend chart: series = [(label, color, [values...])]."""
    all_vals = [v for _, _, vals in series for v in vals]
    y_max = y_max or max(all_vals) * 1.15
    out = ""
    if title:
        out += text(x0 + w / 2, y0 - 14, title, 12.5, "middle", "bold")
    out += f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0-h}" stroke="#94A3B8" stroke-width="1.2"/>\n'
    out += f'<line x1="{x0}" y1="{y0}" x2="{x0+w}" y2="{y0}" stroke="#94A3B8" stroke-width="1.2"/>\n'
    n = len(x_labels)
    for i, lbl in enumerate(x_labels):
        gx = x0 + w * i / (n - 1 if n > 1 else 1)
        out += text(gx, y0 + 18, lbl, 10, "middle", fill=INK_SOFT)
        out += f'<line x1="{gx}" y1="{y0}" x2="{gx}" y2="{y0-h}" stroke="#F1F5F9" stroke-width="1"/>\n'
    for gy_frac in (0, 0.25, 0.5, 0.75, 1.0):
        gy = y0 - h * gy_frac
        out += text(x0 - 10, gy + 4, f"{y_unit}{y_max*gy_frac:,.0f}", 9.5, "end", fill=INK_SOFT)
        out += f'<line x1="{x0}" y1="{gy}" x2="{x0+w}" y2="{gy}" stroke="#F1F5F9" stroke-width="1"/>\n'
    for label, color, values in series:
        pts = []
        for i, v in enumerate(values):
            gx = x0 + w * i / (n - 1 if n > 1 else 1)
            gy = y0 - h * (v / y_max)
            pts.append((gx, gy))
        path_d = "M" + " L".join(f"{px:.1f},{py:.1f}" for px, py in pts)
        out += f'<path d="{path_d}" fill="none" stroke="{color}" stroke-width="2.4"/>\n'
        for px, py in pts:
            out += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="4" fill="{color}"/>\n'
    legend_x = x0 + w - 10
    for i, (label, color, _) in enumerate(series):
        ly = y0 - h + 4 + i * 18
        out += f'<circle cx="{legend_x-90}" cy="{ly}" r="5" fill="{color}"/>\n'
        out += text(legend_x - 78, ly + 4, label, 10.5, "start", fill=INK)
    return out


def pie_chart(cx, cy, r, slices, start_angle=-90):
    """slices = [(label, value, color)]. Returns SVG path wedges + a legend
    stacked to the right of the pie."""
    import math
    total = sum(v for _, v, _ in slices)
    out = ""
    ang = math.radians(start_angle)
    for label, v, color in slices:
        frac = v / total
        sweep = frac * 2 * math.pi
        x1, y1 = cx + r * math.cos(ang), cy + r * math.sin(ang)
        ang2 = ang + sweep
        x2, y2 = cx + r * math.cos(ang2), cy + r * math.sin(ang2)
        large = 1 if sweep > math.pi else 0
        out += (
            f'<path d="M{cx},{cy} L{x1:.1f},{y1:.1f} '
            f'A{r},{r} 0 {large} 1 {x2:.1f},{y2:.1f} Z" '
            f'fill="{color}" stroke="{BG}" stroke-width="2"/>\n'
        )
        ang = ang2
    lx, ly = cx + r + 40, cy - r + 10
    for label, v, color in slices:
        out += rect(lx, ly, 14, 14, fill=color, stroke=color, rx=3)
        out += text(lx + 22, ly + 12, f"{label} ({v/total*100:.0f}%)", 10.5, fill=INK)
        ly += 24
    return out


def bar_chart_grouped(x0, y0, w, h, categories, series, y_max=None, y_unit=""):
    """categories: [str]; series: [(label, color, [values per category])]."""
    n_cat = len(categories)
    n_ser = len(series)
    all_vals = [v for _, _, vals in series for v in vals]
    y_max = y_max or max(all_vals) * 1.2
    out = f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0-h}" stroke="#94A3B8" stroke-width="1.2"/>\n'
    out += f'<line x1="{x0}" y1="{y0}" x2="{x0+w}" y2="{y0}" stroke="#94A3B8" stroke-width="1.2"/>\n'
    group_w = w / n_cat
    bar_w = group_w / (n_ser + 1)
    for gi, cat in enumerate(categories):
        gx = x0 + gi * group_w
        for si, (label, color, values) in enumerate(series):
            bx = gx + (si + 0.5) * bar_w
            bh = h * (values[gi] / y_max)
            out += rect(bx, y0 - bh, bar_w * 0.85, bh, fill=color + "55", stroke=color, rx=3)
            out += text(bx + bar_w * 0.42, y0 - bh - 6, f"{values[gi]:g}", 9.5, "middle", fill=color)
        out += wrapped_text(gx + group_w / 2, y0 + 20, cat, 10, max_chars=16)
    legend_x = x0
    for i, (label, color, _) in enumerate(series):
        lx = legend_x + i * 170
        out += rect(lx, y0 - h - 22, 14, 14, fill=color + "55", stroke=color, rx=3)
        out += text(lx + 20, y0 - h - 11, label, 10.5, fill=INK)
    return out


def figure_frame(width, height, caption, number, body, title=None):
    """Wraps a diagram body with a light border + APA-style figure caption
    baked into the SVG canvas itself (belt-and-braces if the caption text
    below the image in the doc ever gets separated)."""
    pad_bottom = 34
    total_h = height + pad_bottom
    out = f'<rect x="0.5" y="0.5" width="{width-1}" height="{height-1}" fill="none" stroke="#CBD5E1" stroke-width="1"/>\n'
    out += body
    out += (
        f'<text x="{width/2}" y="{height+22}" font-size="11.5" text-anchor="middle" '
        f'font-style="italic" fill="{INK_SOFT}">{esc(f"Figure {number}. {caption}")}</text>\n'
    )
    return svg_doc(width, total_h, out)


def save(path, svg_text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_text)
    return path
