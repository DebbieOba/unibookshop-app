"""Chapter Three content + figures. Imported by assemble.py."""
import os
from svg_gen import (
    box, arrow, cylinder, actor, ellipse_uc, diamond, text, wrapped_text,
    figure_frame, label_on_line, rect, PRIMARY, PRIMARY_SOFT, ACCENT, ACCENT_SOFT,
    NEUTRAL, NEUTRAL_SOFT, OK, OK_SOFT, WARN, WARN_SOFT, INK, INK_SOFT, save,
    bar_chart_grouped, check_badge, cloud_icon, phone_icon,
)

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
SHOT_DIR = os.path.join(os.path.dirname(__file__), "..", "screenshots")


def _f(name):
    return os.path.join(FIG_DIR, name)


def _phone_wireframe(title, rows, note):
    """Generic labelled wireframe used as a stand-in until a real screenshot
    is dropped into /screenshots with the matching filename."""
    w, h = 300, 560
    b = rect(0, 0, w, h, fill="#FFFFFF", stroke="#94A3B8", rx=26, sw=3)
    b += rect(10, 10, w - 20, h - 20, fill="#F6FAFE", stroke="#CFE6FA", rx=16)
    b += text(w / 2, 42, title, 14, "middle", "bold", fill="#111827")
    y = 66
    for row in rows:
        b += rect(24, y, w - 48, row[1], fill=row[2], stroke="#CFE6FA", rx=10)
        b += wrapped_text(w / 2, y + row[1] / 2, row[0], 10.5, max_chars=26, fill="#475569")
        y += row[1] + 12
    frame_w, frame_h = 420, 660
    outer = f'<g transform="translate({(frame_w-w)/2},40)">{b}</g>'
    outer += text(frame_w / 2, 24, "WIREFRAME — placeholder pending real screenshot", 11, "middle", "italic", fill="#B45309")
    outer += text(frame_w / 2, frame_h - 16, note, 9.5, "middle", fill="#64748B")
    return frame_w, frame_h, outer


def build_figures():
    paths = {}

    # 3.1 Agile/Scrum sprint cycle
    b = ""
    cx, cy, r = 260, 150, 110
    stages = ["Sprint\nPlanning", "Daily\nStand-up", "Sprint\nDevelopment", "Sprint\nReview", "Retrospective"]
    import math
    n = len(stages)
    for i, s in enumerate(stages):
        ang = -math.pi / 2 + i * 2 * math.pi / n
        x = cx + r * math.cos(ang)
        y = cy + r * math.sin(ang)
        b += box(x - 70, y - 25, 140, 50, s.replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
        ang2 = -math.pi / 2 + (i + 1) * 2 * math.pi / n
        x2 = cx + r * math.cos(ang2)
        y2 = cy + r * math.sin(ang2)
        b += f'<path d="M{x:.0f},{y:.0f} A{r},{r} 0 0 1 {x2:.0f},{y2:.0f}" fill="none" stroke="#94A3B8" stroke-width="1.5" marker-end="url(#arrow)"/>\n'
    b += text(cx, cy, "2-week\nsprint".replace("\n", " "), 12, "middle", "bold", fill=INK_SOFT)
    svg = figure_frame(560, 320, "Iterative Scrum sprint cycle (Schwaber & Sutherland, 2020) adopted for the CURRICULA build.", "3.1", b)
    paths["fig3_1"] = save(_f("fig3_1_scrum_cycle.svg"), svg)

    # 3.2 Use case diagram
    b = ""
    b += actor(50, 140, "Student")
    b += actor(50, 380, "Admin")
    b += f'<rect x="180" y="30" width="440" height="440" rx="14" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,3"/>\n'
    b += text(400, 20, "CURRICULA System", 12, "middle", "bold")
    student_uc = ["Browse / search catalogue", "Favourite a book", "Add to cart & checkout", "Track order status", "Receive notifications"]
    admin_uc = ["Manage books & inventory", "Manage orders", "Manage org structure", "Send broadcast notifications", "View dashboard KPIs"]
    for i, uc in enumerate(student_uc):
        y = 55 + i * 78
        b += ellipse_uc(400, y, 300, 55, uc)
        b += arrow(100, 150, 260, y, curve=(180, (150 + y) / 2))
    for i, uc in enumerate(admin_uc):
        y = 55 + i * 78
        b += arrow(100, 390, 540, y, curve=(620, (390 + y) / 2))
    svg = figure_frame(700, 500, "Use case diagram: Student and Admin actors against the CURRICULA system boundary.", "3.2", b)
    paths["fig3_2"] = save(_f("fig3_2_use_case.svg"), svg)

    # 3.3 Detailed layered architecture
    b = ""
    b += rect(20, 15, 860, 90, fill=PRIMARY_SOFT, stroke=PRIMARY, rx=10)
    b += text(450, 35, "PRESENTATION LAYER", 11.5, "middle", "bold", fill=PRIMARY)
    for i, m in enumerate(["Student screens", "Admin screens", "Shared UI kit / theme (light+dark)"]):
        b += box(40 + i * 280, 50, 260, 45, m, fill="#FFFFFF", stroke=PRIMARY, size=10.5)
    b += rect(20, 120, 860, 90, fill=ACCENT_SOFT, stroke=ACCENT, rx=10)
    b += text(450, 140, "APPLICATION / API LAYER (NestJS, modular monolith)", 11.5, "middle", "bold", fill=ACCENT)
    for i, m in enumerate(["Auth module", "Catalogue module", "Order module", "Notification module"]):
        b += box(30 + i * 215, 155, 200, 45, m, fill="#FFFFFF", stroke=ACCENT, size=10)
    b += rect(20, 225, 860, 90, fill=OK_SOFT, stroke=OK, rx=10)
    b += text(450, 245, "DATA & INTEGRATION LAYER", 11.5, "middle", "bold", fill=OK)
    for i, m in enumerate(["PostgreSQL\n(Supabase)".replace("\n"," "), "Redis\n(session/cache/cart)".replace("\n"," "), "Cloudinary\n(images)".replace("\n"," "), "FCM + Resend\n(push/email)".replace("\n"," "), "Paystack /\nFlutterwave".replace("\n"," ")]):
        b += box(30 + i * 172, 260, 155, 45, m, fill="#FFFFFF", stroke=OK, size=9.5)
    for x in [170, 450, 730]:
        b += arrow(x, 105, x, 120)
    for x in [130, 450, 770]:
        b += arrow(x, 210, x, 225)
    svg = figure_frame(900, 340, "Detailed three-layer architecture: presentation, application/API, and data/integration (expands Figure 1.5).", "3.3", b)
    paths["fig3_3"] = save(_f("fig3_3_layered_architecture.svg"), svg)

    # 3.4 ERD (simplified)
    b = ""
    entities = {
        "User": (20, 20, 160, 90, ["id (PK)", "email / matric", "role", "departmentId (FK)"]),
        "School": (220, 20, 150, 60, ["id (PK)", "name"]),
        "Department": (410, 20, 160, 75, ["id (PK)", "schoolId (FK)", "name"]),
        "Level": (610, 20, 140, 60, ["id (PK)", "value"]),
        "Book": (20, 160, 170, 105, ["id (PK)", "title", "price", "departmentId (FK)", "levelId (FK)"]),
        "Category": (240, 160, 150, 60, ["id (PK)", "name"]),
        "Cart / CartItem": (20, 310, 190, 75, ["id (PK)", "userId (FK)", "bookId (FK)"]),
        "Order": (260, 310, 170, 90, ["id (PK)", "userId (FK)", "status", "totalAmount"]),
        "OrderItem": (470, 310, 180, 75, ["id (PK)", "orderId (FK)", "bookId (FK)"]),
        "Notification": (700, 160, 170, 75, ["id (PK)", "userId (FK)", "type"]),
    }
    for name, (x, y, w, h, attrs) in entities.items():
        b += rect(x, y, w, h, fill=PRIMARY_SOFT, stroke=PRIMARY, rx=6)
        b += text(x + w / 2, y + 16, name, 11.5, "middle", "bold")
        b += f'<line x1="{x}" y1="{y+22}" x2="{x+w}" y2="{y+22}" stroke="{PRIMARY}" stroke-width="1"/>\n'
        for i, a in enumerate(attrs):
            b += text(x + 8, y + 36 + i * 14, a, 9.5, fill=INK_SOFT)
    rels = [
        ("School", "Department"), ("Department", "Book"), ("Level", "Book"),
        ("User", "Department"), ("Book", "Category"), ("User", "Cart / CartItem"),
        ("Cart / CartItem", "Book"), ("User", "Order"), ("Order", "OrderItem"),
        ("OrderItem", "Book"), ("User", "Notification"),
    ]
    centers = {k: (v[0] + v[2] / 2, v[1] + v[3] / 2) for k, v in entities.items()}
    for a, c in rels:
        x1, y1 = centers[a]
        x2, y2 = centers[c]
        b += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#94A3B8" stroke-width="1.2" stroke-dasharray="2,2"/>\n'
    svg = figure_frame(900, 420, "Simplified entity-relationship diagram of the core CURRICULA schema (conventions after Chen, 1976).", "3.4", b)
    paths["fig3_4"] = save(_f("fig3_4_erd.svg"), svg)

    # 3.5 DFD Context (Level 0)
    b = ""
    b += actor(60, 130, "Student")
    b += actor(60, 320, "Admin")
    b += f'<circle cx="450" cy="220" r="110" fill="{PRIMARY_SOFT}" stroke="{PRIMARY}" stroke-width="1.5"/>\n'
    b += wrapped_text(450, 220, "0. CURRICULA Bookshop Management System", 12.5, weight="bold", max_chars=20)
    b += arrow(120, 145, 350, 190, curve=(230, 150))
    b += label_on_line(120, 145, 350, 190, "browse / order", dy=-8)
    b += arrow(350, 250, 120, 330, curve=(230, 290))
    b += label_on_line(350, 250, 120, 330, "confirmations", dy=14)
    b += arrow(120, 335, 350, 250, curve=(230, 300))
    b += box(760, 100, 170, 55, "Paystack /\nFlutterwave".replace("\n"," "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(560, 190, 760, 130, curve=(660, 140))
    b += box(760, 260, 170, 55, "FCM / Resend\n(notifications)".replace("\n"," "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(560, 250, 760, 290, curve=(660, 300))
    svg = figure_frame(970, 400, "Level-0 (context) data flow diagram: the system as a single process against its external entities.", "3.5", b)
    paths["fig3_5"] = save(_f("fig3_5_dfd_context.svg"), svg)

    # 3.6 DFD Level 1
    b = ""
    procs = ["1. Auth &\nProfile".replace("\n"," "), "2. Catalogue\nBrowse/Search".replace("\n"," "), "3. Cart &\nCheckout".replace("\n"," "), "4. Admin\nManagement".replace("\n"," "), "5. Notification\nDispatch".replace("\n"," ")]
    xs = [40, 220, 400, 580, 760]
    for x, p in zip(xs, procs):
        b += f'<circle cx="{x+70}" cy="70" r="65" fill="{PRIMARY_SOFT}" stroke="{PRIMARY}" stroke-width="1.5"/>\n'
        b += wrapped_text(x + 70, 70, p, 10.5, weight="bold", max_chars=14)
    b += cylinder(60, 220, 150, 60, "D1: Users")
    b += cylinder(240, 220, 150, 60, "D2: Books/Categories")
    b += cylinder(420, 220, 150, 60, "D3: Orders/Cart")
    b += cylinder(600, 220, 150, 60, "D4: Org Structure")
    b += cylinder(770, 220, 150, 60, "D5: Notifications")
    pairs = [(110, 135, 220), (290, 135, 220), (470, 135, 220), (650, 135, 220), (830, 135, 220)]
    for x, y1, y2 in pairs:
        b += arrow(x, y1, x, y2)
    b += arrow(180, 70, 220, 70)
    b += arrow(360, 70, 400, 70)
    b += arrow(540, 70, 580, 70)
    svg = figure_frame(970, 320, "Level-1 data flow diagram decomposing the system into its five core processes and datastores.", "3.6", b)
    paths["fig3_6"] = save(_f("fig3_6_dfd_level1.svg"), svg)

    # 3.7 Sequence diagram: auth
    b = ""
    lanes = ["Student App", "Auth Module", "Redis", "PostgreSQL"]
    lane_x = {l: 90 + i * 230 for i, l in enumerate(lanes)}
    for l, x in lane_x.items():
        b += box(x - 80, 10, 160, 36, l, fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10.5)
        b += f'<line x1="{x}" y1="46" x2="{x}" y2="430" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="3,3"/>\n'
    msgs = [
        ("Student App", "Auth Module", "POST /auth/login (email/matric, password)", 80),
        ("Auth Module", "PostgreSQL", "verify credentials", 130),
        ("PostgreSQL", "Auth Module", "user + role", 180),
        ("Auth Module", "Redis", "store refresh token", 230),
        ("Auth Module", "Student App", "access + refresh JWT (role embedded)", 280),
        ("Student App", "Auth Module", "subsequent requests (Bearer access token)", 340),
        ("Auth Module", "Student App", "401 if expired -> silent refresh flow", 390),
    ]
    for src, dst, label, y in msgs:
        x1, x2 = lane_x[src], lane_x[dst]
        dash = "4,3" if "401" in label else None
        b += arrow(x1, y, x2, y, dash=dash)
        b += label_on_line(x1, y, x2, y, label, dy=-6)
    svg = figure_frame(920, 450, "Sequence diagram: login and JWT-based session handling (role resolved server-side, no manual role picker).", "3.7", b)
    paths["fig3_7"] = save(_f("fig3_7_seq_auth.svg"), svg)

    # 3.8 Sequence diagram: checkout/payment
    b = ""
    lanes2 = ["Student App", "Order Module", "Paystack/\nFlutterwave".replace("\n"," "), "Stock Service"]
    lane_x2 = {l: 90 + i * 230 for i, l in enumerate(lanes2)}
    for l, x in lane_x2.items():
        b += box(x - 90, 10, 175, 36, l, fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10)
        b += f'<line x1="{x}" y1="46" x2="{x}" y2="470" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="3,3"/>\n'
    msgs2 = [
        ("Student App", "Order Module", "POST /checkout (cart, delivery, method)", 80),
        ("Order Module", "Stock Service", "reserve stock", 130),
        ("Order Module", "Paystack/\nFlutterwave".replace("\n"," "), "initialise payment", 180),
        ("Paystack/\nFlutterwave".replace("\n"," "), "Student App", "redirect to payment UI", 230),
        ("Paystack/\nFlutterwave".replace("\n"," "), "Order Module", "webhook: payment success/failed", 290),
        ("Order Module", "Stock Service", "commit stock (or release on failure)", 340),
        ("Order Module", "Student App", "order confirmation + notification", 400),
    ]
    for src, dst, label, y in msgs2:
        x1, x2 = lane_x2[src], lane_x2[dst]
        dash = "4,3" if "webhook" in label else None
        col = ACCENT if "webhook" in label or "release" in label else "#334155"
        b += arrow(x1, y, x2, y, dash=dash, stroke=col)
        b += label_on_line(x1, y, x2, y, label, dy=-6)
    svg = figure_frame(950, 490, "Sequence diagram: checkout through webhook-verified payment, including the stock-release path on a failed/cancelled payment.", "3.8", b)
    paths["fig3_8"] = save(_f("fig3_8_seq_checkout.svg"), svg)

    # 3.9 Deployment diagram
    b = ""
    b += box(20, 20, 190, 90, "Student / Admin\nDevice\n(Expo custom dev client)".replace("\n"," "), fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
    b += arrow(210, 65, 290, 65)
    b += box(290, 20, 190, 90, "NestJS API\n(Node.js runtime,\nsingle deployable)".replace("\n"," "), fill=ACCENT_SOFT, stroke=ACCENT, size=10.5)
    targets = [("Supabase\nPostgreSQL".replace("\n"," "), 20), ("Redis\ninstance".replace("\n"," "), 130), ("Cloudinary\n(media CDN)".replace("\n"," "), 240), ("FCM /\nResend".replace("\n"," "), 350), ("Paystack /\nFlutterwave".replace("\n"," "), 460)]
    for label, x in targets:
        b += box(x + 20, 180, 150, 60, label, fill=OK_SOFT, stroke=OK, size=9.5)
        b += arrow(x + 95, 110, 175 + (x - 20) * 0 + 95, 180, curve=(385, 150))
    svg = figure_frame(680, 260, "Deployment view: one mobile client, one API process, and the managed cloud services it integrates.", "3.9", b)
    paths["fig3_9"] = save(_f("fig3_9_deployment.svg"), svg)

    # 3.10 Testing pyramid
    b = ""
    levels = [("E2E / manual QA\n(happy-path scenarios)".replace("\n"," "), 560, WARN_SOFT, WARN),
              ("Integration tests\n(checkout, stock release, promo codes)".replace("\n"," "), 400, ACCENT_SOFT, ACCENT),
              ("Unit tests\n(services: auth, catalogue, order, notifications)".replace("\n"," "), 240, OK_SOFT, OK)]
    y = 200
    for label, w, fill, stroke in levels:
        x = (680 - w) / 2
        b += box(x, y, w, 55, label, fill=fill, stroke=stroke, size=10.5)
        y -= 70
    svg = figure_frame(680, 260, "Testing pyramid applied to the backend (Marinho et al., 2023, on concentrating test effort on the highest-risk interactions rather than exhaustive combinatorial coverage).", "3.14", b)
    paths["fig3_10"] = save(_f("fig3_10_testing_pyramid.svg"), svg)

    # 3.11 Engineering-level differentiation chart (methodology-specific, distinct from Ch.2's feature checklist)
    categories = ["Local payment\ngateways".replace("\n", " "), "Notification\nchannels".replace("\n", " "),
                  "Admin capability\ndepth (0-3)".replace("\n", " "), "Automated test\nsuites".replace("\n", " ")]
    series = [
        ("Osman et al. (2024)", WARN, [0, 1, 1, 0]),
        ("Oyekan et al. (2024)", ACCENT, [0, 0, 2, 0]),
        ("Generic bookstore", NEUTRAL, [1, 0, 1, 0]),
        ("CURRICULA (this study)", OK, [2, 2, 3, 2]),
    ]
    b = bar_chart_grouped(90, 260, 620, 190, categories, series, y_max=3.4)
    b += text(90, 24, "Engineering differentiators (author's scoring from each system's documented scope)", 11.5, "start", "bold")
    svg = figure_frame(780, 320, "Methodology-level differentiation: CURRICULA against the three closest comparators on four engineering dimensions not already scored in Table 2/Figure 2.11.", "3.15", b)
    paths["fig3_11"] = save(_f("fig3_11_engineering_diff.svg"), svg)

    # 3.16 SDLC six-phase cycle (iterative model, feedback loop back to analysis)
    import math
    b = ""
    phases = [
        ("Requirement\nAnalysis".replace("\n", " "), PRIMARY),
        ("Design", ACCENT),
        ("Implementation\n(Coding)".replace("\n", " "), OK),
        ("Testing", WARN),
        ("Deployment", PRIMARY),
        ("Maintenance", NEUTRAL),
    ]
    cx, cy, r = 300, 190, 145
    n = len(phases)
    centers = []
    for i, (label, color) in enumerate(phases):
        ang = -math.pi / 2 + i * 2 * math.pi / n
        x = cx + r * math.cos(ang)
        y = cy + r * math.sin(ang)
        centers.append((x, y))
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="46" fill="{color}22" stroke="{color}" stroke-width="2"/>\n'
        b += wrapped_text(x, y, label, 11, weight="bold", max_chars=12)
        b += text(x, y + 60, str(i + 1), 11, "middle", "bold", fill=color)
    for i in range(n):
        x1, y1 = centers[i]
        x2, y2 = centers[(i + 1) % n]
        # shrink the line so it starts/ends at each circle's edge, not its centre
        dx, dy = x2 - x1, y2 - y1
        dist = (dx ** 2 + dy ** 2) ** 0.5
        ux, uy = dx / dist, dy / dist
        sx, sy = x1 + ux * 48, y1 + uy * 48
        ex, ey = x2 - ux * 48, y2 - uy * 48
        b += f'<line x1="{sx:.0f}" y1="{sy:.0f}" x2="{ex:.0f}" y2="{ey:.0f}" stroke="#334155" stroke-width="1.8" marker-end="url(#arrow)"/>\n'
    b += text(cx, cy - 6, "Iterate", 12.5, "middle", "bold", fill=INK_SOFT)
    b += text(cx, cy + 12, "each sprint", 10.5, "middle", fill=INK_SOFT)
    svg = figure_frame(600, 420, "The six-phase software development life cycle (after Sommerville, 2016), followed here as an iterative cycle rather than a single linear pass.", "3.16", b)
    paths["fig3_12b"] = save(_f("fig3_12b_sdlc_cycle.svg"), svg)

    # 3.17 SDLC phase -> report section/artefact mapping
    mapping = [
        ("Requirement Analysis", "Section 1.2, 3.2", "Problem statement, use-case diagram (Fig. 3.2)"),
        ("Design", "Section 3.3", "Architecture, ERD, DFDs (Figs. 3.3-3.6)"),
        ("Implementation", "Section 3.5, Appendix C", "Sequence flows, code excerpts"),
        ("Testing", "Section 3.7, Appendix D", "Testing pyramid (Fig. 3.14), test cases"),
        ("Deployment", "Section 3.4.2", "Environment config, health checks, OTA updates"),
        ("Maintenance", "Section 5.5", "Recommendations, known follow-ups"),
    ]
    b = ""
    row_h = 46
    for i, (phase, sect, artefact) in enumerate(mapping):
        y = 15 + i * row_h
        b += box(10, y, 190, row_h - 8, phase, fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
        b += arrow(200, y + (row_h - 8) / 2, 250, y + (row_h - 8) / 2)
        b += box(250, y, 140, row_h - 8, sect, fill=ACCENT_SOFT, stroke=ACCENT, size=10)
        b += arrow(390, y + (row_h - 8) / 2, 440, y + (row_h - 8) / 2)
        b += wrapped_text(660, y + (row_h - 8) / 2, artefact, 9.7, max_chars=38, anchor="middle")
    svg = figure_frame(900, 15 + len(mapping) * row_h + 10, "Mapping of the six SDLC phases onto the specific section and artefact of this report that documents each one.", "3.17", b)
    paths["fig3_12c"] = save(_f("fig3_12c_sdlc_mapping.svg"), svg)

    # 3.18 One sprint as a compressed mini-SDLC
    b = ""
    b += box(20, 20, 860, 60, "Project-level SDLC: ~9 months, 6 phases run once at macro scale (Figure 3.16)", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=11.5)
    b += arrow(450, 80, 450, 110)
    b += text(450, 105, "zoom into one sprint", 10.5, "middle", "italic", fill=INK_SOFT)
    mini = ["Analyse\n(sprint goal)".replace("\n", " "), "Design\n(screens/schema delta)".replace("\n", " "),
            "Code", "Test", "Review &\nRetrospective".replace("\n", " ")]
    xw = 155
    for i, m in enumerate(mini):
        x = 30 + i * (xw + 20)
        b += box(x, 130, xw, 60, m, fill=OK_SOFT, stroke=OK, size=10)
        if i < len(mini) - 1:
            b += arrow(x + xw, 160, x + xw + 20, 160)
    b += f'<path d="M{30+4*(xw+20)+xw-20},190 Q{450},240 {50},190" fill="none" stroke="{OK}" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arrow)"/>\n'
    b += text(450, 245, "next sprint", 10.5, "middle", "italic", fill=OK)
    svg = figure_frame(900, 280, "Each two-week sprint is itself a small, complete pass through the same phases the project runs once at macro scale.", "3.18", b)
    paths["fig3_12d"] = save(_f("fig3_12d_sprint_zoom.svg"), svg)

    # 3.19 DBMS architecture: app -> ORM -> connection pool -> managed Postgres (+ backup)
    b = ""
    b += phone_icon(40, 30, 50, 96)
    b += text(65, 145, "Mobile App", 10.5, "middle", "bold")
    b += arrow(95, 78, 175, 78)
    b += box(175, 45, 170, 66, "NestJS API +\nPrisma ORM".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY, size=11)
    b += arrow(345, 78, 425, 78)
    b += box(425, 45, 150, 66, "Connection Pool\n(PgBouncer, Supabase)".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT, size=9.7)
    b += arrow(575, 78, 655, 78)
    b += cylinder(655, 15, 160, 78, "PostgreSQL\n(primary)".replace("\n", " "))
    b += arrow(735, 93, 735, 140, curve=(690, 115))
    b += cloud_icon(660, 150, 150, 55, fill=NEUTRAL_SOFT, stroke=NEUTRAL)
    b += text(735, 225, "Automated daily backups\n+ point-in-time recovery".replace("\n", " "), 9.5, "middle", fill=INK_SOFT)
    b += box(175, 150, 170, 60, "Redis\n(session/cache/cart, Section 2.3.3)".replace("\n", " "), fill=OK_SOFT, stroke=OK, size=9)
    b += arrow(260, 111, 260, 150, dash="3,3")
    svg = figure_frame(850, 260, "Database management system architecture: the application never opens a raw connection to Postgres, always through Prisma and a pooled connection.", "3.19", b)
    paths["fig3_dbms_arch"] = save(_f("fig3_19_dbms_architecture.svg"), svg)

    return paths


def build_screenshot_or_wireframe(d, filename, title, rows, caption, number, note="Replace by placing a PNG/JPG at thesis/screenshots/ with this filename."):
    real_path_png = os.path.join(SHOT_DIR, filename + ".png")
    real_path_jpg = os.path.join(SHOT_DIR, filename + ".jpg")
    if os.path.exists(real_path_png):
        d.figure_raster(real_path_png, caption, number=number, width_in=2.6)
    elif os.path.exists(real_path_jpg):
        d.figure_raster(real_path_jpg, caption, number=number, width_in=2.6)
    else:
        fw, fh, body = _phone_wireframe(title, rows, note)
        svg = figure_frame(fw, fh, caption + " (placeholder wireframe — real screenshot pending)", number, body)
        path = save(_f(f"fig_shot_{filename}.svg"), svg)
        d.figure_svg(path, caption + " [placeholder wireframe pending a real screenshot]", number=number, width_in=2.6)


def write(d, figs):
    d.heading("CHAPTER THREE", level=1, page_break_before=True)
    d.heading("METHODOLOGY", level=1, center=True)
    d.spacer()

    d.heading("3.0 Introduction", level=2, center=False)
    d.body_text(
        "This chapter documents how CURRICULA was actually built: the development approach followed, "
        "the system's analysis and design artefacts (use case, architecture, entity-relationship, and "
        "data-flow diagrams), the concrete technology choices behind each layer, two representative "
        "sequence flows (authentication and checkout), and the testing strategy used to validate the "
        "system against the problems set out in Chapter One. Where the resulting build departs from "
        "recommended student-project practice, and where it follows it, is noted directly rather than "
        "left for a reader to infer; Mandale et al. (2021) found that undergraduate capstone projects "
        "improve measurably when they deliberately adopt industry practice (version control discipline, "
        "staged testing, structured technical writing) rather than treating the academic exercise as "
        "exempt from it, and this chapter is written on that same assumption."
    )

    d.heading("3.1 Development Methodology", level=2, center=False)
    d.body_text(
        "The system was built iteratively using an Agile approach structured around short, fixed-length "
        "sprints rather than a single up-front specification, for a reason specific to a one-person, "
        "final-year project: requirements around exactly which admin screens were needed, and exactly "
        "which student-facing features mattered most, only became fully clear once early, working "
        "slices of the catalogue and checkout flow existed to react to. A traditional Waterfall "
        "approach, which Sommerville (2016) describes as best suited to projects whose requirements are "
        "stable and fully known in advance, would have committed the project to a complete specification "
        "before any of that feedback was available. Each sprint (Figure 3.1) followed the standard Scrum "
        "cadence described by Schwaber and Sutherland (2020): planning, daily self-review, "
        "development, a review against working software, and a short retrospective, compressed to suit "
        "a single-developer team by merging the daily stand-up into a personal progress log rather than "
        "a synchronous meeting."
    )
    d.figure_svg(figs["fig3_1"], "Iterative Scrum sprint cycle (Schwaber & Sutherland, 2020) adopted for the CURRICULA build.", number="3.1")

    d.heading("3.2 System Analysis", level=2, center=False)
    d.body_text(
        "Two actors interact with the system: the Student, who browses, favourites, orders, and tracks "
        "books; and the Admin, who maintains the catalogue, organisational structure, and order pipeline "
        "that the student-facing views depend on. Figure 3.2 sets these two actors and their principal "
        "use cases against the system boundary. Deliberately, both actors are served by the same "
        "application rather than two separate builds, the single largest structural decision described "
        "in this chapter, and one explicitly justified by the role-based access control literature "
        "reviewed in Section 2.6."
    )
    d.figure_svg(figs["fig3_2"], "Use case diagram: Student and Admin actors against the CURRICULA system boundary.", number="3.2")

    d.heading("3.3 System Design", level=2, center=False)
    d.heading("3.3.1 System Architecture", level=3, center=False)
    d.body_text(
        "Figure 3.3 expands the conceptual sketch given in Figure 1.5 into the three concrete layers "
        "actually implemented: a presentation layer (the Expo/React Native client, serving both student "
        "and admin screens from one codebase, switching by role once the JWT is decoded), an "
        "application layer (the NestJS API, organised as the modular monolith justified in Section "
        "2.3.2, with auth, catalogue, order, and notification concerns kept in separate modules sharing "
        "one deployable process rather than four independently deployed services, the middle ground "
        "Fowler and Lewis (2014) describe between a tangled monolith and the operational overhead of "
        "full microservices), and a data/integration layer combining PostgreSQL as the durable store, "
        "Redis for session and cart state, and the four external services (Cloudinary, Firebase Cloud "
        "Messaging, Resend, and the two payment aggregators) the application layer talks to over HTTP."
    )
    d.figure_svg(figs["fig3_3"], "Detailed three-layer architecture: presentation, application/API, and data/integration (expands Figure 1.5).", number="3.3")

    d.heading("3.3.2 Database Design", level=3, center=False)
    d.body_text(
        "The schema follows conventional entity-relationship modelling (Chen, 1976): a User belongs to "
        "one Department (and, through it, one School), and holds a role that the application layer, not "
        "the client, is the sole authority over. A Book belongs to a Department and a Level and carries "
        "its own price and stock fields, the fields Section 1.2 identified as the ones a student could "
        "not previously see without asking a person. Orders decompose into OrderItems that snapshot a "
        "book's price at the moment of purchase, so a later price change never rewrites the historical "
        "record of what a student actually paid. Figure 3.4 shows the core of this schema; junction and "
        "audit tables (promo codes, exchange listings, audit logs) are omitted from the diagram for "
        "clarity but follow the same conventions."
    )
    d.figure_svg(figs["fig3_4"], "Simplified entity-relationship diagram of the core CURRICULA schema (conventions after Chen, 1976).", number="3.4")

    d.heading("3.3.3 Data Flow Diagrams", level=3, center=False)
    d.body_text(
        "Figure 3.5 gives the context-level (Level 0) view: the system as a single process exchanging "
        "data with its two human actors and its external payment and notification services. Figure 3.6 "
        "decomposes that single process into the five processes actually implemented as NestJS modules, "
        "each reading and writing its own datastore rather than sharing one undifferentiated table space, "
        "a deliberate mirror of the modular boundary described in Section 3.3.1."
    )
    d.figure_svg(figs["fig3_5"], "Level-0 (context) data flow diagram: the system as a single process against its external entities.", number="3.5")
    d.figure_svg(figs["fig3_6"], "Level-1 data flow diagram decomposing the system into its five core processes and datastores.", number="3.6")

    d.heading("3.4 Tools and Technologies", level=2, center=False)
    d.table(
        ["Layer", "Technology", "Reason chosen"],
        [
            ["Mobile client", "Expo SDK 57 / React Native 0.86", "Single codebase for student + admin; mature FCM and OTA-update tooling"],
            ["Client state", "TanStack Query + Zustand", "Server cache and auth/theme state kept in separate, purpose-built stores"],
            ["Forms/validation", "React Hook Form + Zod", "Inline validation without re-render cost on every keystroke"],
            ["Backend framework", "NestJS 11 (Node.js)", "Modular structure maps directly onto the module boundaries in Fig. 3.3"],
            ["ORM / migrations", "Prisma 6", "Type-safe queries; schema-diff migrations reviewable before applying"],
            ["Relational store", "PostgreSQL (Supabase)", "Free managed tier; removes server-provisioning cost for a student project"],
            ["Cache / session", "Redis", "Sub-millisecond session, refresh-token, and cart reads (Section 2.3.3)"],
            ["Media storage", "Cloudinary", "Managed image hosting/transformation for book covers and avatars"],
            ["Payments", "Paystack & Flutterwave", "Webhook-verified Nigerian payment aggregators (Section 2.4)"],
            ["Push notifications", "Firebase Cloud Messaging", "Cross-platform push delivery from one API"],
            ["Transactional email", "Resend + React Email", "Templated, testable email without a mail-server to manage"],
        ],
        caption="Technology stack by architectural layer and the reason each was selected.",
        number="3",
    )
    d.body_text(
        "Two entries in Table 3 reflect choices made against specific comparative evidence rather than "
        "convention. The backend and its client code are both written in TypeScript rather than plain "
        "JavaScript, a decision Bogner and Merkel's (2022) large-scale comparison of GitHub projects "
        "supports directly: TypeScript codebases in their sample showed measurably better code quality "
        "and understandability scores than comparable JavaScript codebases, which matters more for a "
        "solo-maintained project than the raw bug-count difference their study found to be statistically "
        "inconclusive. And the REST API surface documented in Appendix A follows resource-naming and "
        "statelessness conventions consistent with Gowda and Gowda's (2024) best-practice guidance for "
        "scalable, secure API design, rather than an ad hoc endpoint layout that would have made the "
        "client/server contract harder to reason about as the catalogue and order modules grew."
    )
    d.body_text(
        "The mobile client's light/dark theme (Section 1.1's design-system notes) was likewise not a "
        "cosmetic afterthought. Andrew et al.'s (2024) comparison of dark- and light-mode implementations "
        "across popular Android and iOS apps found meaningful variation in how thoroughly apps actually "
        "carried a theme through every screen element rather than leaving some components hard-coded to "
        "one mode, exactly the failure mode CURRICULA's single shared `useTheme()` hook (no hard-coded "
        "hex values anywhere in the UI layer) was built to avoid."
    )

    d.heading("3.4.1 Security Considerations", level=3, center=False)
    d.body_text(
        "Security was treated as a set of specific, addressable decisions tied to this project's actual "
        "attack surface, mapped against the OWASP Foundation's (2021) Top Ten list of the most common "
        "web-application vulnerability classes, rather than a generic checklist appended after the fact. Passwords are hashed "
        "with bcrypt before storage (Appendix B1), a deliberately slow algorithm chosen specifically so "
        "that a leaked database dump cannot be turned into usable passwords through brute-force "
        "guessing at any practical speed. Session state uses short-lived JWT access tokens paired with a "
        "longer-lived refresh token held in Redis, so a stolen access token has a narrow window of "
        "usefulness rather than an indefinite one, and a compromised refresh token can be revoked "
        "server-side by deleting its Redis entry without requiring every user's password to be reset. "
        "Every role check (Appendix C2) reads the role embedded in a server-issued, signed JWT rather "
        "than any value the client sends in a request body, closing off the most common privilege-"
        "escalation mistake in role-gated systems: trusting a client-supplied role field."
    )
    d.body_text(
        "Payment security follows straight from the architectural choice discussed in Section 2.4: "
        "because Paystack and Flutterwave host the actual card-entry screen, card numbers and CVVs never "
        "reach CURRICULA's own servers at all, which keeps this project outside the strictest tier of "
        "PCI-DSS obligations that would apply to a merchant capturing card data directly. What remains "
        "this project's responsibility is verifying that a webhook claiming a successful payment really "
        "originated from the aggregator and not from a forged request to the same endpoint; both "
        "integrations verify a cryptographic signature header (Paystack's X-Paystack-Signature, "
        "Flutterwave's verif-hash) against a shared secret before treating any webhook payload as "
        "trustworthy, and requests that fail that check are rejected before touching order or stock "
        "state at all. The same design also has a data-protection dimension worth naming explicitly: "
        "Nigeria's Data Protection Regulation (National Information Technology Development Agency "
        "[NITDA], 2019) applies to any system processing Nigerian residents' personal data, and "
        "keeping card data entirely off this project's own servers narrows what \"personal data this "
        "system processes\" actually covers to matric numbers, contact details, and order history: a "
        "smaller compliance surface than a system that also custodied payment instruments would carry "
        "(Appendix F)."
    )
    d.body_text(
        "One security-relevant gap is acknowledged rather than hidden: the audit-logging coverage "
        "flagged as a literature-level omission in Section 2.6 is, in this project's own implementation, "
        "still partial. The `AuditLogInterceptor` exists and is wired to the newer promo-code "
        "endpoints, but several original admin surfaces (org-structure CRUD, broadcast notifications) "
        "do not yet route through it. This is recorded here as a known limitation (Section 5.4) rather "
        "than corrected retroactively in this report, since the report's purpose is to describe the "
        "system that was actually built and tested, not a hypothetically completed one."
    )

    d.heading("3.4.2 Deployment and Configuration Management", level=3, center=False)
    d.body_text(
        "The backend deploys as a single Node.js process (Figure 3.9), configured entirely through "
        "environment variables rather than hard-coded values, so the same codebase runs unmodified "
        "against a local development database, a staging environment, and production. Database schema "
        "changes are managed through Prisma's migration mechanism: each schema change is generated as a "
        "reviewable SQL diff before being applied, rather than the schema being altered by hand against "
        "a live database, which keeps a complete, ordered history of every structural change available "
        "for later inspection. Mobile releases follow Expo's managed workflow, which allows most "
        "JavaScript-level changes to reach users as an over-the-air update without a new native binary "
        "submission, reserving a full app-store release cycle for the comparatively rare native-"
        "dependency change (such as the `expo-build-properties` cleartext-traffic fix noted during this "
        "project's own development, which did require a native rebuild)."
    )
    d.body_text(
        "A health-check endpoint (Appendix A1) separates two failure modes that are easy to conflate "
        "during deployment troubleshooting: whether the process is running at all, and whether it can "
        "actually reach its dependencies. `GET /health` answers only the first question; `GET "
        "/health/ready` additionally pings Postgres and Redis directly and returns a failure status if "
        "either is unreachable, a distinction that mattered in practice during this project's own "
        "development when a schema-migration mismatch was initially misdiagnosed as \"the backend is "
        "not connected\" before the readiness check narrowed it to a dependency-level failure instead."
    )

    d.heading("3.5 Implementation Highlights", level=2, center=False)
    d.body_text(
        "Two flows illustrate the implementation more concretely than a static architecture diagram can. "
        "Authentication (Figure 3.7) accepts either an email or a FUTA matric number in one field, "
        "resolves the account's role server-side, and embeds that role in the issued JWT, removing the "
        "manual \"are you a student or an admin\" picker earlier design notes for this project had "
        "originally included. Checkout (Figure 3.8) reserves stock optimistically at the start of "
        "payment, then commits or releases that reservation strictly from the aggregator's webhook, "
        "never from anything the client reports, closing a real bug found during this project's own "
        "testing, in which a cancelled or failed payment had been leaving stock reserved indefinitely "
        "until the corresponding release call was added to the webhook handler."
    )
    d.figure_svg(figs["fig3_7"], "Sequence diagram: login and JWT-based session handling (role resolved server-side, no manual role picker).", number="3.7")
    d.figure_svg(figs["fig3_8"], "Sequence diagram: checkout through webhook-verified payment, including the stock-release path on a failed/cancelled payment.", number="3.8")
    d.body_text(
        "Figure 3.9 situates these flows within their deployment: one mobile client talking to one API "
        "process, which in turn talks outward to five managed cloud services rather than to any "
        "infrastructure the project itself has to operate: a direct response to the "
        "cost-effectiveness requirement set out in Section 1.2."
    )
    d.figure_svg(figs["fig3_9"], "Deployment view: one mobile client, one API process, and the managed cloud services it integrates.", number="3.9")

    d.heading("3.6 Screenshots of the Implemented System", level=2, center=False)
    d.body_text(
        "The following figures show the system as implemented. Where a screen is marked as a wireframe "
        "placeholder, the corresponding live screenshot had not yet been supplied at the time this "
        "chapter was drafted; the layout shown matches the actual shipped screen specification and "
        "should be replaced with the real capture before final submission. Each screen below is chosen "
        "because it ties back to a specific point made earlier in this report, rather than "
        "as a general tour of the application."
    )
    d.body_text(
        "Home (Figure 3.10) is the first screen a returning student sees, and its search bar and "
        "category chips are the direct implementation of the searchable-catalogue objective set in "
        "Section 1.4, the same interaction that replaces the shelf-by-shelf search traced in Figure "
        "1.1. Book Details (Figure 3.11) is arguably the single most important screen in this report's "
        "own argument, since its price field and stock badge are exactly the two pieces of information "
        "Section 1.2 identified as unavailable without a manual query; both are rendered directly from "
        "the Book table's own fields (Appendix B2), not computed or cached separately, so what a "
        "student sees there is never more than one database read away from what an admin last set. "
        "Checkout (Figure 3.12) implements the payment-integration objective and is the screen the "
        "sequence diagram in Figure 3.8 describes step by step. The Admin Dashboard (Figure 3.13) is "
        "included specifically to make the point in Section 3.8 concrete: it is a screen inside the "
        "same application and codebase as the three student screens before it, reachable only because "
        "the authenticated user's role, not a separate login system, resolves to ADMIN."
    )
    build_screenshot_or_wireframe(
        d, "home",
        "Home", [("Greeting + notification bell", 40, "#DCE3F5"), ("Search bar", 40, "#E7EBF0"),
                 ("Category filter chips", 36, "#E7EBF0"), ("Featured books grid", 140, "#F1E6D3"),
                 ("Recommended books grid", 140, "#F1E6D3")],
        "Student Home screen: search, category filters, and featured/recommended book grids.", "3.10",
    )
    build_screenshot_or_wireframe(
        d, "book_details",
        "Book Details", [("Cover image", 150, "#F1E6D3"), ("Title, price, stock badge", 55, "#DCE3F5"),
                          ("Rating stars", 30, "#E7EBF0"), ("Description", 80, "#E7EBF0"),
                          ("Add to Cart button", 45, "#DCEEE5")],
        "Book Details screen showing the live price and stock badge Section 1.2 identifies as the core fix.", "3.11",
    )
    build_screenshot_or_wireframe(
        d, "cart_checkout",
        "Checkout", [("Cart items + quantity stepper", 90, "#E7EBF0"), ("Delivery method (pickup/delivery)", 45, "#DCE3F5"),
                     ("Payment method: Paystack/Flutterwave", 55, "#F1E6D3"), ("Order total", 35, "#E7EBF0"),
                     ("Place Order button", 45, "#DCEEE5")],
        "Checkout screen: delivery method, payment method, and order total before payment handoff.", "3.12",
    )
    build_screenshot_or_wireframe(
        d, "admin_dashboard",
        "Admin Dashboard", [("KPI tiles: users, orders, books", 70, "#F1E6D3"), ("Low-stock alert", 40, "#FBEBD0"),
                            ("Recent orders list", 160, "#E7EBF0"), ("Bottom nav: Dashboard/Books/Orders/More", 40, "#DCE3F5")],
        "Admin Dashboard: KPI tiles and recent-order overview, gated behind the ADMIN role.", "3.13",
    )

    d.heading("3.7 Testing Strategy", level=2, center=False)
    d.body_text(
        "Testing followed the layered strategy summarised in Figure 3.14, weighted toward unit and "
        "integration coverage on the backend rather than exhaustive end-to-end coverage of every "
        "possible state combination. Marinho et al. (2023) evaluated several sampling strategies for "
        "catching resource-interaction failures in mobile applications and found targeted approaches "
        "effective: testing the specific combinations most likely to interact badly, rather than every combination "
        "or a purely random sample, caught a disproportionate share of real failures for a fraction "
        "of the testing effort. This project applied the same logic by concentrating integration-test "
        "effort on the one interaction most likely to fail: checkout, payment webhook, and stock "
        "release acting together, rather than spreading equal effort across every possible module "
        "combination. Unit tests cover the auth, catalogue, order, and "
        "notification services in isolation; integration tests specifically exercise the checkout-to-"
        "webhook-to-stock-release path described in Figure 3.8, since that path was where the real bug "
        "noted in Section 3.5 was originally found. Mobile-side quality assurance followed a comparable "
        "performance-testing methodology for contemporary cross-platform apps: cold-start time, "
        "list-scroll frame rate on the catalogue grid, and network-retry behaviour under a simulated "
        "flaky connection, alongside a manual heuristic walkthrough against the ten usability criteria "
        "introduced in Section 2.5, used here as an evaluation checklist rather than a purely "
        "theoretical reference."
    )
    d.figure_svg(figs["fig3_10"], "Testing pyramid applied to the backend (Marinho et al., 2023, on concentrating test effort on the highest-risk interactions rather than exhaustive combinatorial coverage).", number="3.14")
    d.body_text(
        "Two further points from the wider software-testing literature shaped how this project drew the "
        "line between unit and integration coverage specifically. Trautsch et al. (2020) found that "
        "textbook definitions of \"unit\" versus \"integration\" test scope do not always match how "
        "modern, dependency-heavy projects actually decompose, which is why this project's own unit "
        "tests are defined pragmatically as anything exercising one NestJS service in isolation with its "
        "external dependencies mocked, rather than by a stricter textbook boundary. Aghamohammadi et "
        "al. (2021) argue, separately, that a code-coverage percentage alone is a weak signal of test-suite "
        "effectiveness unless it is weighted by which statements actually correspond to "
        "failure-prone logic, the same reasoning behind concentrating integration-test effort on the "
        "checkout/webhook/stock-release path specifically, rather than treating every module as equally "
        "worth the same coverage target. Grano et al. (2021) reach a compatible conclusion from source-"
        "code-quality indicators rather than coverage percentages: lightweight, static "
        "signals of code complexity predict which test cases are actually worth keeping about as well as "
        "far more expensive dynamic analysis does. This project could not apply that finding as-is at "
        "its own scale, but it is consistent with keeping the test suite small and targeted (Figure 3.14) "
        "rather than exhaustive. Ordering matters too: Zhang et al. (2021) note that integration tests "
        "run in the wrong order can mask a failure one component introduces into another, which is the "
        "specific reason this project's own integration suite always exercises stock reservation before "
        "payment confirmation before stock release, matching the real order those events occur in "
        "production (Figure 3.8), rather than a more convenient test-authoring order."
    )

    d.heading("3.8 How CURRICULA Differs from Existing Systems and Related Work", level=2, center=False)
    d.body_text(
        "Chapter Two compared CURRICULA against the closest reviewed systems on capability coverage "
        "(Table 2, Figures 2.9 and 2.11). This section makes the comparison concrete at the level this "
        "chapter has actually been describing: specific engineering decisions, not just feature "
        "checkboxes, since two systems can tick the same box in a comparison table while differing "
        "substantially in how thoroughly, and how robustly, they actually implement it."
    )
    d.heading("3.8.1 Against the WhatsApp-integrated bookstore (Section 2.2.1)", level=3, center=False)
    d.body_text(
        "The WhatsApp-integrated system reviewed in Section 2.2.1 answers a student's ordering question through messaging "
        "layered over a conventional web listing. That choice is pragmatic: it needed no bespoke "
        "mobile client. It also means price and stock information travels through a general-"
        "purpose chat channel rather than a screen built around it: a student still has to read and "
        "interpret a message rather than see a stock badge rendered against a specific book record. "
        "CURRICULA instead renders price and stock as first-class fields on the Book Details screen "
        "(Figure 3.11), sourced from the same database row an admin edits, with no messaging "
        "intermediary and no interpretation step between the data and the student."
    )
    d.heading("3.8.2 Against the web-based inventory system (Section 2.2.2)", level=3, center=False)
    d.body_text(
        "The web-based inventory system reviewed in Section 2.2.2 is, architecturally, the "
        "administrative half of CURRICULA: a web interface for staff to maintain inventory records. It "
        "has no mobile client and, by its own authors' description, no student-facing surface at all. It solves the owner's "
        "record-keeping problem (Figure 1.2's bottom node) without touching the student's side of the "
        "same interaction. CURRICULA's Section 3.3.1 architecture intentionally keeps that admin "
        "capability but places it beside, not instead of, a student-facing mobile client reading the "
        "identical underlying tables: the two audiences share one data model rather than two systems "
        "that would eventually need to be kept in sync by hand."
    )
    d.heading("3.8.3 Against generic online bookstore / marketplace systems", level=3, center=False)
    d.body_text(
        "The wider population of generic online bookstore builds reviewed in Section 2.2.3, and general "
        "marketplaces such as Jumia or Konga at a much larger scale, solve browse-cart-checkout for an "
        "undifferentiated retail audience. None of the systems found in this review model an "
        "institution's own organisational structure into the catalogue itself. CURRICULA's catalogue is "
        "keyed to FUTA's actual school-department-level hierarchy (Figure 1.6), which is not a cosmetic "
        "difference: it is what lets \"books for 300-level Mechanical Engineering students\" be a single "
        "filtered query rather than a search a student has to perform manually across an undifferentiated "
        "list, and it is what makes the org-structure admin screens in Section 3.4 necessary at all. A "
        "generic bookstore has no equivalent structure to administer in the first place."
    )
    d.body_text(
        "Figure 3.15 restates these three comparisons as a single chart across four engineering "
        "dimensions (local payment gateway integration, notification channels, administrative "
        "capability depth, and automated test coverage), none of which were scored in Chapter Two's "
        "capability checklist, since that checklist recorded only whether a capability existed, not how "
        "substantially it was implemented. On every dimension charted, CURRICULA's score reflects a "
        "specific, cited engineering decision made in this chapter, not an unsupported claim of "
        "superiority: two payment gateways rather than none or one (Section 3.4), push and email "
        "notifications scoped on purpose to avoid the over-frequency risk discussed in Section 2.5, "
        "three layers of admin capability corresponding to the "
        "catalogue, order, and org-structure modules in Figure 3.3, and both unit and integration test "
        "suites targeting the specific failure mode described in Section 3.5, rather than the "
        "informally-tested or untested status the reviewed systems' own publications report."
    )
    d.figure_svg(figs["fig3_11"], "Methodology-level differentiation: CURRICULA against the three closest comparators on four engineering dimensions not already scored in Table 2/Figure 2.11.", number="3.15")

    d.heading("3.9 Software Development Life Cycle (SDLC) Structure", level=2, center=False)
    d.body_text(
        "Section 3.1 named the process framework used to manage this project's work, Scrum, but a "
        "framework for managing work is a distinct thing from the software development life cycle "
        "(SDLC) model that framework is used to run. Sommerville (2016) and, independently, Pressman and "
        "Maxim (2020) both describe the SDLC in terms of the same six recurring activities common to "
        "essentially every software project regardless of process "
        "framework: requirement analysis, design, implementation, testing, deployment, and maintenance. "
        "What differs between SDLC models is not whether these six activities happen, but how many "
        "times, and in what order relative to each other. A Waterfall model (the term, and the original "
        "phase-sequence diagram it describes, traces back to Royce, 1970) runs all six exactly once, "
        "in strict sequence, with each phase formally signed off before the next begins; the Iterative "
        "and Incremental model this project actually followed instead runs a small version of all six "
        "repeatedly, each pass adding or revising a working slice of the system rather than committing "
        "to a complete specification up front (Figure 3.16). That preference is not merely this "
        "project's own habit: it is the same one the original Agile Manifesto (Beck et al., 2001) "
        "codified in stating that working software, delivered frequently, is valued over comprehensive "
        "up-front documentation. The same reasoning Section 3.1 gave for "
        "rejecting Waterfall in favour of Scrum applies equally to rejecting a linear SDLC model in "
        "favour of an iterative one, since the two decisions are really one decision seen from two "
        "angles."
    )
    d.figure_svg(figs["fig3_12b"], "The six-phase software development life cycle (after Sommerville, 2016), followed here as an iterative cycle rather than a single linear pass.", number="3.16")
    d.body_text(
        "Figure 3.17 makes that iterative structure concrete by mapping each of the six phases onto the "
        "specific section of this report, and the specific artefact, where that phase's work is actually "
        "documented: a deliberate cross-check that every phase Sommerville's model requires has a "
        "traceable output in this report, rather than being asserted without evidence. Requirement "
        "analysis is documented twice, in Chapter One's problem statement and again in Section 3.2's "
        "use-case analysis, because requirements were revisited each sprint rather than gathered once; "
        "design work concentrates in Section 3.3's architecture, schema, and data-flow diagrams; "
        "implementation is illustrated rather than exhaustively listed, through the two sequence flows "
        "in Section 3.5 and the code excerpts in Appendix C; testing is documented in Section 3.7 and "
        "Appendix D; deployment in Section 3.4.2; and maintenance, the one phase that, by definition, "
        "extends beyond this report's own writing window, is represented by the recommendations set "
        "out in Section 5.5 rather than by a completed artefact, since maintenance work on a live system "
        "cannot itself be finished before the report describing it is submitted."
    )
    d.figure_svg(figs["fig3_12c"], "Mapping of the six SDLC phases onto the specific section and artefact of this report that documents each one.", number="3.17")
    d.body_text(
        "Figure 3.18 resolves what might otherwise look like a contradiction between Figure 3.1's "
        "two-week sprint cycle and Figure 3.16's six-phase SDLC: they are the same structure viewed at "
        "two different scales. The project as a whole passed through all six SDLC phases many times "
        "over its nine months, but each individual sprint was itself a small, complete pass through "
        "analysis, design, coding, and testing, compressed to fit inside two weeks and scoped to one "
        "sprint goal rather than the whole system. Deployment and maintenance, by contrast, did not "
        "repeat every sprint in the same way. Most sprints shipped an over-the-air JavaScript update "
        "rather than a full deployment cycle (Section 3.4.2), which is one respect in which this "
        "project's actual practice departed from a textbook-uniform reading of the iterative model, in "
        "the direction Section 3.4.2 already argues is appropriate for a Node.js/Expo stack specifically."
    )
    d.figure_svg(figs["fig3_12d"], "Each two-week sprint is itself a small, complete pass through the same phases the project runs once at macro scale.", number="3.18")

    d.heading("3.10 Database Management System", level=2, center=False)
    d.body_text(
        "Section 3.3.2 set out the schema itself: what the data looks like (Figure 3.4). This section "
        "covers the database management system (DBMS) that schema actually runs on: which engine was "
        "chosen and why, how it is hosted and operated, and the indexing, normalisation, and integrity "
        "decisions that govern how efficiently and safely that schema is read and written in practice."
    )
    d.heading("3.10.1 Choice of DBMS", level=3, center=False)
    d.body_text(
        "PostgreSQL was chosen over a document-oriented alternative (MongoDB being the obvious "
        "comparator) because the data this system holds is relentlessly relational rather than "
        "document-shaped, in exactly the sense Codd (1970) originally set the relational model out to "
        "capture: a Book belongs to one Department and one Level, a Department belongs to one "
        "School, an Order decomposes into OrderItems that each reference a Book, and a checkout has to "
        "either fully succeed (payment confirmed, stock decremented, order marked paid) or fully fail, "
        "never leaving the database in a state where an order exists but the stock it consumed does not "
        "match. That last requirement is precisely what a relational DBMS's ACID transaction guarantees "
        "(atomicity, consistency, isolation, durability) are built for, and precisely the property a "
        "document store would require the application layer to reconstruct by hand across multiple "
        "collections. This is not merely a theoretical preference: Salunke and Ouda's (2024) direct "
        "benchmark of the two candidate engines found PostgreSQL completing indexed select queries "
        "roughly nine times faster than MySQL under comparable load, on top of the relational fit "
        "argument above. Redis (Section 2.3.3) supplies the one piece of this system that genuinely benefits "
        "from a non-relational, in-memory store: session state, refresh tokens, and the shopping cart, "
        "so the architecture uses two data stores for two different jobs rather than forcing one engine "
        "to do both adequately."
    )
    d.figure_svg(figs["fig3_dbms_arch"], "Database management system architecture: the application never opens a raw connection to Postgres, always through Prisma and a pooled connection.", number="3.19")

    d.heading("3.10.2 Hosting, Connection Management, and Backup", level=3, center=False)
    d.body_text(
        "The database is hosted on Supabase's managed PostgreSQL tier (Section 1.1's free-tier "
        "cost-effectiveness argument applies directly here), which supplies three operational properties "
        "this project relies on without having to implement them: connection pooling through PgBouncer, "
        "so a burst of concurrent requests during the registration-period demand spike described in "
        "Section 1.2 does not exhaust Postgres's own connection limit; automated daily backups with "
        "point-in-time recovery, so a destructive bug (or a mistaken admin action against Section 3.4.1's "
        "role-gated but still fallible admin screens) is recoverable rather than permanent; and managed "
        "version upgrades, so the database engine itself does not become this project's own patching "
        "responsibility. The application layer never opens a direct, unpooled connection to Postgres; "
        "every query passes through Prisma, which itself talks to the pooled connection Supabase "
        "provides (Figure 3.19)."
    )

    d.heading("3.10.3 Indexing and Normalisation", level=3, center=False)
    d.body_text(
        "The schema follows third-normal-form principles throughout, in the sense standard database "
        "textbooks such as Elmasri and Navathe (2016) define the term. The School-Department-Level "
        "hierarchy is fully normalised rather than repeating a department's school name on every book row, "
        "with exactly one deliberate exception, already noted in Section 3.3.2: OrderItem snapshots a "
        "book's price and compare-at-price at the moment of purchase rather than referencing the current "
        "Book row for both. That is a deliberate denormalisation, not an oversight, because the "
        "alternative (joining to the current Book row for historical order display) would silently "
        "rewrite what a student is shown they paid every time a price later changes, the exact failure "
        "mode Section 1.2 identifies as unacceptable."
    )
    d.table(
        ["Table", "Indexed / constrained column(s)", "Purpose"],
        [
            ["User", "email (unique), matricNumber (unique)", "O(1) lookup at login; prevents duplicate accounts"],
            ["Book", "departmentId, levelId (composite)", "Backs the department/level catalogue filter (Section 1.2)"],
            ["Book", "courseCode", "Backs the syllabus-progress insight (Appendix A)"],
            ["Order", "userId, status", "Backs a student's order history and admin status filtering"],
            ["OrderItem", "orderId (FK, cascade)", "Deleting an order cleanly removes its line items"],
            ["Department", "schoolId (FK, restrict)", "Prevents deleting a School that still has Departments"],
            ["Book", "departmentId, levelId (FK, restrict)", "Prevents deleting org-structure still referenced by books"],
        ],
        caption="Indexes and foreign-key constraints applied to the core schema.",
        number="4",
        col_widths_in=[1.1, 2.1, 2.55],
    )
    d.body_text(
        "The restrict-on-delete constraints in Table 4's lower rows are a direct, mechanical enforcement "
        "of referential integrity: the database itself refuses a query that would delete a School still "
        "referenced by a Department, or a Department still referenced by a Book, rather than relying on "
        "the application layer to remember to check first. This matters specifically for the admin "
        "org-structure screens (Figure 3.21): an admin can attempt to delete a department in error, but "
        "the database, not application-level discipline alone, is the backstop that prevents that error "
        "from orphaning every book already assigned to it."
    )
    build_screenshot_or_wireframe(
        d, "admin_books_form",
        "Add / Edit Book", [("Cover image upload", 90, "#F1E6D3"), ("Title, author, course code", 60, "#DCE3F5"),
                             ("Price + compare-at price", 45, "#E7EBF0"), ("Department + Level pickers", 45, "#DCE3F5"),
                             ("Stock quantity + Pre-order toggle", 45, "#E7EBF0"), ("Save button", 40, "#DCEEE5")],
        "Admin Add/Edit Book form: each field maps directly to a Book column (Appendix B2), the concrete link between this screen and the schema in Figure 3.4.", "3.20",
    )
    build_screenshot_or_wireframe(
        d, "admin_org_structure",
        "Manage Departments", [("School selector", 40, "#DCE3F5"), ("Department list", 130, "#E7EBF0"),
                                ("Add Department form", 70, "#F1E6D3"), ("Delete (blocked if books exist)", 45, "#FBEBD0")],
        "Admin Manage Departments screen: the UI surface for the School-to-Department foreign-key relationship and its restrict-on-delete constraint (Table 4).", "3.21",
    )

    d.heading("3.11 Chapter Summary", level=2, center=False)
    d.body_text(
        "This chapter set out the Agile process used to build CURRICULA and the iterative SDLC "
        "structure that process actually ran (Section 3.9), the analysis and design artefacts that "
        "shaped its architecture, schema, and data flow, the database management system underpinning "
        "that schema (Section 3.10), the concrete technology stack chosen layer by "
        "layer, two representative flows implemented in enough detail to show how Chapter One's "
        "problems are actually closed in code, the testing strategy used to validate the result, and, "
        "concretely, rather than only at the feature-checklist level of Chapter Two, how specific "
        "engineering choices set CURRICULA apart from the three closest comparators in the reviewed "
        "literature. Chapter Four turns from what was built to how long it took and what it cost to "
        "build."
    )
