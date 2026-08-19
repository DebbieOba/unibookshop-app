"""Chapter Two content + figures. Imported by assemble.py."""
import os
from svg_gen import (
    box, arrow, cylinder, actor, ellipse_uc, diamond, text, wrapped_text,
    figure_frame, label_on_line, rect, PRIMARY, PRIMARY_SOFT, ACCENT, ACCENT_SOFT,
    NEUTRAL, NEUTRAL_SOFT, OK, OK_SOFT, WARN, WARN_SOFT, INK, INK_SOFT, save,
    bar_chart_grouped, pie_chart,
)

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")


def _f(name):
    return os.path.join(FIG_DIR, name)


def build_figures():
    paths = {}

    # 2.1 Theoretical framework: digital maturity -> automation -> friction reduction
    b = ""
    b += box(30, 100, 200, 70, "Low digital maturity\n(paper records, memory-based pricing)".replace("\n", " "), fill=WARN_SOFT, stroke=WARN, size=11.5)
    b += arrow(230, 135, 300, 135)
    b += box(300, 100, 200, 70, "Targeted automation\n(searchable catalogue, shared price)".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY, size=11.5)
    b += arrow(500, 135, 570, 135)
    b += box(570, 100, 200, 70, "Reduced transaction\nfriction, faster sale".replace("\n", " "), fill=OK_SOFT, stroke=OK, size=11.5)
    b += text(430, 40, "Digital Maturity Theory (Pinto et al., 2023) applied to a single small retailer", 12, "middle", "italic", fill=INK_SOFT)
    svg = figure_frame(800, 200, "Conceptual framework: this study treats the bookshop problem as a digital-maturity gap that targeted automation closes.", "2.1", b)
    paths["fig2_1"] = save(_f("fig2_1_framework.svg"), svg)

    # 2.2 Evolution timeline
    b = ""
    stages = ["Paper ledger\n& memory", "Calculator +\nnotebook", "Spreadsheet\n(if any)", "Web-based\ninventory tool", "Mobile-first,\nrole-aware app"]
    x0 = 40
    w = 150
    gap = 20
    b += f'<line x1="{x0+w/2}" y1="70" x2="{x0+ (len(stages)-1)*(w+gap)+w/2}" y2="70" stroke="#94A3B8" stroke-width="2"/>\n'
    for i, s in enumerate(stages):
        x = x0 + i * (w + gap)
        fill = WARN_SOFT if i < 2 else (NEUTRAL_SOFT if i < 4 else OK_SOFT)
        stroke = WARN if i < 2 else (NEUTRAL if i < 4 else OK)
        b += f'<circle cx="{x+w/2}" cy="70" r="7" fill="{stroke}"/>\n'
        b += box(x, 100, w, 60, s.replace("\n", " "), fill=fill, stroke=stroke, size=11)
    b += text(x0, 30, "Least digitised", 11, "start", fill=WARN)
    b += text(x0 + (len(stages)-1)*(w+gap)+w, 30, "This project", 11, "end", "bold", fill=OK)
    svg = figure_frame(900, 200, "Evolution of small-retailer record-keeping from paper ledgers to a mobile-first, role-aware application.", "2.2", b)
    paths["fig2_2"] = save(_f("fig2_2_evolution.svg"), svg)

    # 2.3 Monolith vs microservices
    b = ""
    b += text(180, 25, "Traditional Monolith", 13, "middle", "bold")
    b += rect(60, 45, 240, 160, fill=NEUTRAL_SOFT, stroke=NEUTRAL, rx=10)
    for i, lbl in enumerate(["UI", "Business logic", "Data access", "Single deploy unit"]):
        b += box(80, 60 + i * 36, 200, 28, lbl, fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
    b += text(680, 25, "Modular / Service-Oriented (this project)", 13, "middle", "bold")
    mods = ["Auth", "Catalogue", "Order", "Notification"]
    for i, m in enumerate(mods):
        x = 460 + i * 115
        b += box(x, 60, 95, 45, m, fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
    b += cylinder(645, 140, 130, 55, "Shared Postgres")
    for i in range(4):
        x = 460 + i * 115
        b += arrow(x + 47, 105, 710, 140, curve=(x + 47, 125))
    svg = figure_frame(960, 230, "Architectural contrast: a single deployable monolith versus the modular, service-oriented backend adopted for this project (Vangavolu, 2022).", "2.3", b)
    paths["fig2_3"] = save(_f("fig2_3_architecture_pattern.svg"), svg)

    # 2.4 Framework metrics bar chart
    b = ""
    cats = [("CPU use (rel.)", 78, 71), ("Memory use (rel.)", 82, 69), ("Dropped frames (rel.)", 65, 58)]
    x0, gap, base_y, scale = 100, 220, 260, 1.6
    b += f'<line x1="{x0-30}" y1="{base_y}" x2="{x0-30}" y2="{base_y-160}" stroke="#94A3B8" stroke-width="1"/>\n'
    b += f'<line x1="{x0-30}" y1="{base_y}" x2="750" y2="{base_y}" stroke="#94A3B8" stroke-width="1"/>\n'
    for i, (label, rn, fl) in enumerate(cats):
        x = x0 + i * gap
        hr, hf = rn * scale * 0.9, fl * scale * 0.9
        b += rect(x, base_y - hr, 34, hr, fill=PRIMARY_SOFT, stroke=PRIMARY)
        b += rect(x + 40, base_y - hf, 34, hf, fill=ACCENT_SOFT, stroke=ACCENT)
        b += text(x + 17, base_y - hr - 6, str(rn), 10, "middle", fill=PRIMARY)
        b += text(x + 57, base_y - hf - 6, str(fl), 10, "middle", fill=ACCENT)
        b += wrapped_text(x + 37, base_y + 22, label, 10, max_chars=16)
    b += rect(560, 15, 14, 14, fill=PRIMARY_SOFT, stroke=PRIMARY)
    b += text(580, 27, "React Native", 10.5)
    b += rect(560, 37, 14, 14, fill=ACCENT_SOFT, stroke=ACCENT)
    b += text(580, 49, "Flutter", 10.5)
    svg = figure_frame(780, 300, "Relative resource-use indices reported for React Native and Flutter builds of an equivalent app (adapted from Markowski & Smołka, 2023).", "2.4", b)
    paths["fig2_4"] = save(_f("fig2_4_framework_metrics.svg"), svg)

    # 2.5 Generic payment integration literature model
    b = ""
    b += actor(50, 60, "Customer")
    b += box(160, 40, 170, 55, "Merchant App\n(cart/checkout)".replace("\n", " "))
    b += arrow(110, 75, 160, 65)
    b += box(380, 40, 170, 55, "Payment\nAggregator API".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(330, 65, 380, 65)
    b += box(600, 40, 170, 55, "Issuing Bank /\nMobile Money".replace("\n", " "), fill=NEUTRAL_SOFT, stroke=NEUTRAL)
    b += arrow(550, 65, 600, 65)
    b += box(380, 150, 170, 55, "Webhook: verified\npayment event".replace("\n", " "), fill=OK_SOFT, stroke=OK)
    b += arrow(685, 95, 465, 150, curve=(600, 130))
    b += box(160, 150, 170, 55, "Order confirmed,\nnotification sent".replace("\n", " "), fill=OK_SOFT, stroke=OK)
    b += arrow(380, 177, 330, 177)
    svg = figure_frame(830, 240, "Generalised aggregator-mediated payment model reported across the reviewed fintech literature.", "2.5", b)
    paths["fig2_5"] = save(_f("fig2_5_payment_model.svg"), svg)

    # 2.6 Nielsen heuristics (list-in-boxes, simple)
    b = ""
    heur = ["Visibility of system status", "Match to real world", "User control & freedom",
            "Consistency & standards", "Error prevention", "Recognition over recall",
            "Flexibility & efficiency", "Aesthetic, minimalist design", "Help users recover from errors", "Help & documentation"]
    cols = 2
    for i, h in enumerate(heur):
        col = i % cols
        row = i // cols
        x = 40 + col * 400
        y = 20 + row * 48
        b += box(x, y, 370, 38, f"{i+1}. {h}", fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
    svg = figure_frame(830, 20 + 5 * 48 + 10, "Nielsen's (1994) ten usability heuristics, used as the evaluation lens for the app's UI in Chapter Three.", "2.6", b)
    paths["fig2_6"] = save(_f("fig2_6_heuristics.svg"), svg)

    # 2.7 Push notification engagement funnel
    b = ""
    stages2 = [("App installed", 100), ("Notifications enabled", 78), ("Opens after a push", 54), ("Completes action", 41)]
    max_w = 620
    for i, (lbl, pct) in enumerate(stages2):
        w = max_w * (pct / 100)
        x = (max_w - w) / 2 + 60
        y = 20 + i * 62
        b += rect(x, y, w, 46, fill=PRIMARY_SOFT if i % 2 == 0 else ACCENT_SOFT, stroke=PRIMARY if i % 2 == 0 else ACCENT, rx=6)
        b += text(x + w / 2, y + 22, f"{lbl} — {pct}%", 12, "middle", "bold")
    svg = figure_frame(800, 20 + 4 * 62 + 10, "Illustrative engagement funnel showing the documented retention lift attributable to push notifications (Homfeldt & Kähler, 2026).", "2.7", b)
    paths["fig2_7"] = save(_f("fig2_7_notification_funnel.svg"), svg)

    # 2.8 RBAC concept diagram
    b = ""
    b += actor(60, 40, "Student")
    b += actor(60, 190, "Admin")
    b += box(220, 30, 160, 45, "Role: STUDENT", fill=PRIMARY_SOFT, stroke=PRIMARY)
    b += box(220, 180, 160, 45, "Role: ADMIN", fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(120, 55, 220, 52)
    b += arrow(120, 245, 220, 202)
    b += box(460, 15, 200, 40, "Catalogue: read-only", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10.5)
    b += box(460, 65, 200, 40, "Cart / checkout: own orders", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10.5)
    b += box(460, 165, 200, 40, "Catalogue: full CRUD", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10.5)
    b += box(460, 215, 200, 40, "Orders: all students", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10.5)
    b += arrow(380, 45, 460, 35)
    b += arrow(380, 55, 460, 85)
    b += arrow(380, 200, 460, 185)
    b += arrow(380, 210, 460, 235)
    svg = figure_frame(700, 280, "Role-based access control concept applied in the same codebase (Sandhu et al., 1996): identical app, permissions gated by role.", "2.8", b)
    paths["fig2_8"] = save(_f("fig2_8_rbac.svg"), svg)

    # 2.9 Research gap radar-ish (simple side bars per criterion)
    criteria = ["Live price sync", "Stock visibility to student", "In-app payment", "Push + email alerts", "Org-structure aware catalogue", "Single codebase (student+admin)"]
    systems = ["Osman et al. (2024)", "Oyekan et al. (2024)", "Generic online bookstore", "CURRICULA (this study)"]
    marks = {
        "Osman et al. (2024)":            [0,1,1,0,0,0],
        "Oyekan et al. (2024)":            [1,1,0,0,1,0],
        "Generic online bookstore":        [0,0,1,0,0,0],
        "CURRICULA (this study)":          [1,1,1,1,1,1],
    }
    b = ""
    row_h = 40
    col_w = 108
    label_w = 190
    for j, sysname in enumerate(systems):
        y = 46 + j * row_h
        b += text(label_w - 10, y + 22, sysname, 11.5, "end", "bold" if "CURRICULA" in sysname else "normal", fill=OK if "CURRICULA" in sysname else INK)
    for i, c in enumerate(criteria):
        x = label_w + i * col_w
        b += wrapped_text(x + col_w / 2, 24, c, 10, max_chars=13)
    for j, sysname in enumerate(systems):
        y = 46 + j * row_h
        for i in range(len(criteria)):
            x = label_w + i * col_w
            present = marks[sysname][i]
            fill = OK_SOFT if present else WARN_SOFT
            stroke = OK if present else WARN
            mark = "Y" if present else "N"
            b += rect(x + col_w/2 - 15, y, 30, 26, fill=fill, stroke=stroke, rx=5)
            b += text(x + col_w/2, y + 18.5, mark, 12, "middle", "bold", fill=stroke)
    svg = figure_frame(label_w + len(criteria) * col_w + 20, 46 + len(systems) * row_h + 10,
                        "Feature coverage of reviewed systems against this study's requirements (the basis for Table 2).", "2.9", b)
    paths["fig2_9"] = save(_f("fig2_9_gap_matrix.svg"), svg)

    # 2.10 Input-Process-Output research model
    b = ""
    b += box(30, 80, 210, 110, "INPUT\n• Observed bookshop workflow\n• Reviewed systems (2.2–2.6)\n• FUTA academic structure".replace("\n", " "), fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=10.5)
    b += arrow(240, 135, 310, 135)
    b += box(310, 80, 210, 110, "PROCESS\n• Requirements analysis\n• Agile iterative build (Ch.3)\n• Testing against Ch.1 problems".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
    b += arrow(520, 135, 590, 135)
    b += box(590, 80, 210, 110, "OUTPUT\n• CURRICULA mobile app\n• Evaluated against objectives\n• Documented for reuse (Ch.5)".replace("\n", " "), fill=OK_SOFT, stroke=OK, size=10.5)
    svg = figure_frame(830, 210, "Input-Process-Output research model adopted for this study, synthesised from the reviewed literature.", "2.10", b)
    paths["fig2_10"] = save(_f("fig2_10_ipo_model.svg"), svg)

    # 2.11 Quantified feature-coverage bar chart (real counts from Table 2 / Figure 2.9)
    categories = ["Osman et al.\n(2024)".replace("\n", " "), "Oyekan et al.\n(2024)".replace("\n", " "),
                  "Generic online\nbookstore".replace("\n", " "), "CURRICULA\n(this study)".replace("\n", " ")]
    counts = [2, 3, 1, 6]
    colors = [WARN, WARN, WARN, OK]
    b = ""
    x0, y0, w, h = 90, 240, 560, 190
    b += f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0-h}" stroke="#94A3B8" stroke-width="1.2"/>\n'
    b += f'<line x1="{x0}" y1="{y0}" x2="{x0+w}" y2="{y0}" stroke="#94A3B8" stroke-width="1.2"/>\n'
    for gy in range(0, 7):
        gyp = y0 - h * gy / 6
        b += text(x0 - 10, gyp + 4, str(gy), 9.5, "end", fill=INK_SOFT)
        b += f'<line x1="{x0}" y1="{gyp}" x2="{x0+w}" y2="{gyp}" stroke="#F1F5F9" stroke-width="1"/>\n'
    bw = w / len(categories) * 0.5
    for i, (cat, c, color) in enumerate(zip(categories, counts, colors)):
        cx = x0 + w * (i + 0.5) / len(categories)
        bh = h * c / 6
        b += rect(cx - bw / 2, y0 - bh, bw, bh, fill=color + "55", stroke=color, rx=4)
        b += text(cx, y0 - bh - 8, str(c), 12, "middle", "bold", fill=color)
        b += wrapped_text(cx, y0 + 22, cat, 10, max_chars=16)
    b += text(x0, 24, "Capabilities met out of 6 (Table 2 criteria)", 12.5, "start", "bold")
    svg = figure_frame(760, 300, "Table 2 restated as a count: capabilities met (out of six) by each reviewed system versus CURRICULA.", "2.11", b)
    paths["fig2_11"] = save(_f("fig2_11_feature_count_bar.svg"), svg)

    return paths


def write(d, figs):
    d.heading("CHAPTER TWO", level=1, page_break_before=True)
    d.heading("LITERATURE REVIEW", level=1, center=True)
    d.spacer()

    d.heading("2.0 Introduction", level=2, center=False)
    d.body_text(
        "Chapter One framed the problem as a gap between what a searchable, price-transparent "
        "catalogue could offer and what a manually-run campus bookshop actually provides. This "
        "chapter reviews the literature that bears on that gap from four directions: work on "
        "similar bookshop and campus-commerce systems, work on the specific technologies chosen to "
        "build CURRICULA, work on payment integration in the Nigerian and wider African fintech "
        "context, and work on the usability and engagement mechanisms the app relies on. Each "
        "section closes by stating, plainly, what the reviewed work does not cover and how that gap "
        "shaped a design decision described later in Chapter Three. Section 2.7 draws the threads "
        "together into a single comparison table."
    )
    d.figure_svg(figs["fig2_1"], "Conceptual framework: this study treats the bookshop problem as a digital-maturity gap that targeted automation closes.", number="2.1")

    d.heading("2.1 Theoretical and Conceptual Framework", level=2, center=False)
    d.body_text(
        "The framework underpinning this study borrows from digital-maturity theory rather than from "
        "a pure software-engineering model, because the problem being solved is only partly technical. "
        "Digital-maturity research treats a firm's adoption of digital tools as a graduated path rather "
        "than a binary on/off switch, with small, informally-run retailers clustering toward the least "
        "mature end of that path (Mabidi, 2024, reaches a similar conclusion specifically for higher-education "
        "institutions in the South African context, where infrastructure and funding gaps slow adoption "
        "even where the institutional will exists). A campus bookshop run on memory and a notebook sits "
        "at the least-mature end of that continuum; the claim this study tests is narrower than "
        "\"digitise the whole business.\" It is that a single, well-scoped intervention (a shared, "
        "queryable catalogue) can move a shop several steps up that path without requiring it to adopt "
        "an enterprise resource-planning suite it could never justify the cost of."
    )
    d.body_text(
        "Alongside that framing, the study borrows a simple input-process-output research model to "
        "structure its own method: the inputs are the observed workflow and the literature reviewed in "
        "this chapter, the process is the iterative build described in Chapter Three, and the output is "
        "a working system evaluated against the objectives set in Section 1.4. Figure 2.10 sets this "
        "model out in full; it recurs, implicitly, as the structure of Chapters Three through Five."
    )
    d.body_text(
        "Why small retailers stall on the low-maturity end of that path rather than progressing "
        "naturally is itself contested. Alaqidi (2022) found real, measurable information-management "
        "gains among the small enterprises that did adopt cloud services, which argues against cost or "
        "capability being the binding constraint once a shop actually tries. Jayeola et al.'s (2022) "
        "systematic review points instead to awareness and perceived complexity as the more persistent "
        "barrier. Owners who have never been shown that a manageable, low-cost option exists have no "
        "occasion to compare it against their current notebook-and-memory system. This study takes the "
        "second reading as the more actionable one: it is not enough for free-tier cloud infrastructure "
        "to exist in the abstract (Section 1.1); a concrete, demonstrated application has to exist for a "
        "specific shop before \"just use the cloud\" is a real option rather than a slogan."
    )
    d.body_text(
        "A second theoretical strand worth naming, alongside digital-maturity theory, is the technology-"
        "acceptance literature that studies why an individual user adopts a specific tool once it exists. "
        "Pipitwanichakarn and Wongtada (2021) applied the Technology Acceptance Model to micro-business "
        "adopters at different adoption stages and found perceived ease of use and enjoyment driving "
        "early adoption, while perceived usefulness only became the dominant factor once a user had "
        "already adopted and was deciding whether to keep using the tool, a distinction this study takes "
        "seriously in Chapter Three's emphasis on a simple, immediately legible catalogue-search "
        "interaction (Figure 1.5) rather than a feature-complete but harder-to-learn one at first launch. "
        "That acceptance question is not hypothetical for this specific population: Oyewole (2022) found "
        "mobile-technology adoption for academic purposes already well underway among Nigerian "
        "undergraduates, which is the concrete evidence behind this study's working assumption that FUTA "
        "students would adopt a mobile catalogue readily, without needing a separate adoption-education "
        "effort of its own."
    )

    d.heading("2.2 Related Bookshop and Campus-Commerce Systems", level=2, center=False)
    d.heading("2.2.1 WhatsApp- and Google-integrated campus bookstore systems", level=3, center=False)
    d.body_text(
        "Osman et al. (2024) built a web-based campus bookstore for a Malaysian polytechnic that "
        "layers WhatsApp messaging and Google's productivity services on top of a conventional listing "
        "and checkout flow, evaluated the result with thirty student participants, and reported "
        "generally positive usability findings. The system is instructive for two reasons. First, it "
        "confirms that the core complaint addressed in Chapter One (students unable to check a "
        "book's status without a manual query) is not unique to Nigeria or to FUTA; a comparable "
        "institution on another continent built comparable infrastructure in direct response to the "
        "same complaint. Second, its architecture stays intentionally lightweight, leaning on WhatsApp and "
        "Google's existing infrastructure rather than a bespoke mobile client, which kept its own build "
        "cost low but also left it without a native mobile experience, offline-friendly caching, "
        "push notifications, or an integrated payment gateway. Those are three capabilities this study set as "
        "explicit objectives in Section 1.4."
    )
    d.body_text(
        "A methodological caveat is worth stating about that evaluation, since it bears on how much "
        "weight the comparison in Section 2.7 can place on it. Thirty participants, drawn from a single "
        "institution's WhatsApp-literate student body, is a reasonable sample for an early-stage "
        "usability check but is too small to support strong claims about how the system would perform "
        "at the scale of a full academic session's registration period, when hundreds of students query "
        "the catalogue in a short window rather than a handful of testers doing so under observation. "
        "The reported usability findings should therefore be read as evidence the interaction model is "
        "sound in principle, not as evidence the underlying WhatsApp-plus-web architecture scales, a "
        "distinction the original publication does not itself draw out."
    )
    d.heading("2.2.2 University web-based inventory-management systems", level=3, center=False)
    d.body_text(
        "Closer to home, Oyekan et al. (2024) documented and rebuilt the inventory-management process "
        "at a Nigerian university, reporting the same manual, error-prone stock-taking practice this "
        "study observed independently at FUTA, and delivered a web-based system to replace it. Their "
        "solution targets administrative stock accuracy (the equivalent of this project's admin-side "
        "inventory screens) but is web-only, with no student-facing mobile surface and no equivalent "
        "to the price/stock lookup a student would use standing outside the shop. The gap between the "
        "two projects is instructive: Oyekan et al. solved the owner's side of the problem in Figure "
        "1.2 while leaving the student's side, the actual point of friction described in Section 1.2, "
        "untouched."
    )
    d.body_text(
        "It is worth being precise about why that omission matters rather than treating it as a minor "
        "scope difference. An inventory system that only administrators can query does not, on its own, "
        "shorten the escalation chain traced in Figure 1.2. It makes the owner's own record-keeping "
        "more accurate, which is a real improvement, but a student standing at the till still has no "
        "way to consult that improved record themselves. The two projects are, in that sense, "
        "complementary rather than competing: a system combining Oyekan et al.'s administrative rigor "
        "with a genuine student-facing surface would address both halves of the same interaction, which "
        "is the specific gap this study's own architecture (Section 3.3.1) was designed to close by "
        "construction rather than by accident."
    )
    d.heading("2.2.3 General online bookstore systems", level=3, center=False)
    d.body_text(
        "A wider body of student and early-career research describes online bookstore systems built "
        "on conventional web stacks (PHP/MySQL, JSP/JavaBean, and similar), typically covering catalogue "
        "browsing, cart, and checkout for a general retail audience rather than a specific institution's "
        "student body. These systems demonstrate that the core e-commerce pattern, browse, cart, "
        "checkout, is well understood and low-risk to implement; what they do not demonstrate is any "
        "attempt to model an institution's own organisational structure (schools, departments, "
        "academic levels) into the catalogue itself, which is precisely the structural feature FUTA's "
        "57-department, 5-level catalogue required and which Section 3.2 describes in detail."
    )
    d.body_text(
        "A related weakness runs through nearly all of these generic systems: stock visibility is "
        "usually accurate at checkout but stale everywhere upstream of it, so a shopper can browse a "
        "listing for a book that is already gone. Retail research on stockouts treats this as a direct "
        "revenue leak, not merely an inconvenience. Inventory a system fails to represent accurately in "
        "real time behaves, commercially, exactly like inventory that was never stocked at all (Global "
        "Payments, 2024). CURRICULA's stock field is written by the same admin action that changes the "
        "physical shelf count, and read by the same student-facing screen at browse time and at "
        "checkout time alike, closing precisely that upstream staleness gap."
    )
    d.body_text(
        "That staleness problem is not unique to software-based bookstores; it is the same problem "
        "purely manual small retailers report independently of any system at all. Secretario and Naval "
        "(2021) surveyed micro, small, and medium grocery stores and found sourcing, storing, and "
        "selling treated as three loosely-connected processes rather than one continuously accurate "
        "record, with stock counts routinely falling out of sync with the shelf between manual "
        "recounts, the same underlying failure this study observed at FUTA's bookshops (Section 1.2), "
        "just without a computer involved at all. That convergence is itself evidence the problem is "
        "structural to small, low-automation retail generally, not an artefact of the bookshop domain "
        "specifically."
    )
    d.figure_svg(figs["fig2_2"], "Evolution of small-retailer record-keeping from paper ledgers to a mobile-first, role-aware application.", number="2.2")

    d.heading("2.2.4 Large-scale general marketplaces", level=3, center=False)
    d.body_text(
        "It is also worth explicitly ruling out the largest, most visible category of Nigerian "
        "e-commerce, general marketplaces such as Jumia and Konga, as a ready-made substitute for a "
        "purpose-built campus system, rather than leaving the omission implicit. These platforms solve "
        "browse-cart-checkout at national scale, across an unbounded catalogue of unrelated sellers and "
        "product categories, which is precisely what makes them a poor fit for the problem in Section "
        "1.2: a student searching a general marketplace for a specific FUTA course textbook has no "
        "department-and-level filter to narrow against, no guarantee the listed seller is the campus "
        "bookshop rather than an unrelated third-party reseller, and no connection at all to the "
        "syllabus-tracking or org-structure features described in Section 3.4. A general marketplace "
        "widens the problem this study addresses rather than narrowing it: more choice, but no "
        "institutional context to filter that choice against, which is why none of the systems "
        "compared in Table 2 include a general marketplace as a genuine alternative rather than a "
        "different category of tool entirely."
    )

    d.heading("2.3 Enabling Technologies Reviewed", level=2, center=False)
    d.heading("2.3.1 Cross-platform mobile frameworks", level=3, center=False)
    d.body_text(
        "Two frameworks dominate current cross-platform mobile development: Flutter and React Native, "
        "together accounting for the large majority of new cross-platform projects surveyed in recent "
        "developer polling. Markowski and Smołka (2023) built equivalent applications in both frameworks "
        "and measured resource use directly, finding Flutter modestly ahead on CPU and memory efficiency "
        "and on dropped-frame rate under load (Figure 2.4), a result broadly consistent with wider "
        "industry benchmarking. React Native's countervailing advantage, and the reason it was chosen "
        "for CURRICULA over Flutter despite the measured gap, is ecosystem maturity for the specific "
        "integrations this project needed out of the box: Expo's managed workflow, mature "
        "Firebase Cloud Messaging bindings, and a JavaScript/TypeScript toolchain shared with the "
        "NestJS backend, so that request/response types could be reasoned about in one language across "
        "the whole stack. The literature's performance edge for Flutter was judged, in other words, "
        "smaller than the integration and tooling cost of adopting a second language ecosystem for a "
        "one-person project on a fixed timeline."
    )
    d.body_text(
        "The benchmark itself deserves the same scrutiny applied to the systems reviewed in Section "
        "2.2: it measured one application pair, built once, on a specific device and OS-version "
        "combination, which is a legitimate way to establish that a difference exists but not "
        "necessarily its exact magnitude across every device tier a real user population runs on. Low-"
        "end Android devices, common among Nigerian students on a fixed budget rather than an "
        "afterthought demographic, are exactly where a resource-efficiency gap of the kind Markowski "
        "and Smołka report would be expected to matter most, and exactly the population this "
        "benchmark's device sample was not drawn from. That gap between a controlled benchmark and this "
        "project's actual target users is one reason the mobile-side performance testing described in "
        "Section 3.7 was run against this project's own device set rather than assumed from the "
        "literature alone."
    )
    d.heading("2.3.2 Backend architecture: monolith versus modular services", level=3, center=False)
    d.body_text(
        "Vangavolu (2022) describes the now-common shift from a single deployable backend toward a "
        "modular, service-oriented structure built on Node.js and Express, arguing that the approach "
        "improves scalability and maintainability at the cost of additional operational complexity "
        "(inter-service communication, distributed data consistency) that a small team must be prepared "
        "to absorb. That trade-off shaped a deliberate compromise in this project's own backend: NestJS "
        "modules for auth, catalogue, orders, and notifications are organised as if they were separate "
        "services, with clear boundaries and independent responsibility, but deployed as a single process "
        "(a \"modular monolith\"), which captures most of the maintainability benefit Vangavolu "
        "describes without taking on the distributed-systems operational cost a genuine microservices "
        "deployment would add for a project of this scale (Figure 2.3)."
    )
    d.heading("2.3.3 Caching and the data layer", level=3, center=False)
    d.body_text(
        "Privalov (2024) measured substantial latency reductions from introducing a Redis caching layer "
        "in front of a relational database for a read-heavy web system, a pattern this project applies "
        "directly: session state, refresh tokens, and the shopping cart are all held in Redis rather "
        "than round-tripping to Postgres on every request, while catalogue and order records, the data "
        "that must survive a cache eviction, remain in Postgres as the durable source of truth."
    )
    d.figure_svg(figs["fig2_3"], "Architectural contrast: a single deployable monolith versus the modular, service-oriented backend adopted for this project (Vangavolu, 2022).", number="2.3")
    d.figure_svg(figs["fig2_4"], "Relative resource-use indices reported for React Native and Flutter builds of an equivalent app (adapted from Markowski & Smołka, 2023).", number="2.4")

    d.heading("2.4 Payment and Fintech Integration in the Nigerian Context", level=2, center=False)
    d.body_text(
        "A systematic review of mobile fintech adoption across sub-Saharan Africa found the region's "
        "payment infrastructure maturing rapidly over the past five years, driven largely by "
        "aggregator platforms that abstract the complexity of card networks and bank integrations "
        "behind a single API (\"Mobile Fintech Adoption,\" 2024). Nigerian aggregators "
        "Paystack and Flutterwave are the concrete instances of that pattern most relevant here: both "
        "expose webhook-based payment confirmation, which matters more to this project's design than "
        "any front-end convenience they offer, because a webhook lets the backend treat \"payment "
        "received\" as a server-verified fact rather than a client-reported claim a compromised or "
        "buggy client could fake. Figure 2.5 sets out the generalised model this literature converges "
        "on; Chapter Three's Figure 3.8 specialises it to CURRICULA's actual checkout sequence, "
        "including the specific stock-release bug fix described in the implementation notes."
    )
    d.figure_svg(figs["fig2_5"], "Generalised aggregator-mediated payment model reported across the reviewed fintech literature.", number="2.5")
    d.body_text(
        "The broader market context makes the timing argument from Section 1.5 concrete rather than "
        "asserted. Nigerian e-commerce overall has expanded rapidly across the 2020s (go-globe, 2024), "
        "and that growth sits on top of a wider sub-Saharan pattern of rising financial inclusion "
        "attributable in large part to fintech adoption (\"Impact of FinTech Adoption,\" 2024). Neither "
        "trend guarantees that a specific niche such as a campus bookshop benefits automatically; both "
        "describe the enabling conditions (a public already comfortable transacting on a phone, and "
        "payment rails already built for exactly that) that make building on them, now, materially "
        "easier than it would have been even five years earlier. The scale behind that claim is worth "
        "stating concretely rather than left as a general impression: the GSMA (2023) recorded over 1.7 "
        "billion registered mobile-money accounts globally, with sub-Saharan Africa the single largest "
        "contributing region, and the World Bank (2022) attributes a meaningful share of the region's "
        "financial-inclusion gains specifically to that mobile-money infrastructure rather than to "
        "traditional banking expansion. A payment integration built on Nigerian aggregators is, in that "
        "sense, building on the most mature part of the region's financial infrastructure rather than "
        "its least developed corner."
    )
    d.body_text(
        "A point the aggregator-focused literature tends to understate is what integrating a payment "
        "aggregator does *not* remove from a merchant's own responsibility. Neither Paystack nor "
        "Flutterwave requires this project to store card numbers or CVV codes at all; both host the "
        "actual card-entry screen themselves, which keeps CURRICULA outside the strictest tier of PCI-DSS "
        "(Payment Card Industry Data Security Standard) obligations that would apply to a merchant "
        "capturing card data directly. What remains this project's own responsibility, and what Section "
        "3.5's webhook-verification design specifically addresses, is dispute handling at the "
        "order-state level: a webhook that arrives late, arrives twice, or reports a state the order "
        "has already moved past has to be handled idempotently, or a student could end up double-"
        "charged or a book double-reserved. This is a narrower problem than full card-data custody, but "
        "it is not a trivial one, and it is the specific reason checkout state transitions in Figure 3.8 "
        "are written to be safe to replay rather than assumed to arrive exactly once."
    )

    d.heading("2.5 Usability and Engagement in Mobile Commerce", level=2, center=False)
    d.body_text(
        "Nielsen's (1994) usability heuristics remain the most widely applied evaluation lens for "
        "interactive systems three decades after publication, precisely because they describe general "
        "properties of good interfaces rather than the specifics of any one technology, and this study "
        "adopts them, unmodified, as one axis of the usability evaluation reported in Chapter Three. "
        "\"Visibility of system status\" and \"recognition over recall\" bear most closely on the "
        "problem in Section 1.2: a stock badge that tells a student a book is available, rather than "
        "requiring them to recall or re-ask, is a heuristic made concrete."
    )
    d.body_text(
        "That heuristic matters more for a student shopper than a general retail one, specifically "
        "because of how price-conscious buyers search. Singh's (2023) review of the online "
        "consumer-behaviour literature found price-sensitive shoppers systematically checking more "
        "sources and spending longer comparing before committing to a purchase, behaviour a fixed "
        "student budget makes close to universal in this study's own population, and one direct "
        "explanation for why the shelf-by-shelf search documented in Figure 1.1 persists even when it "
        "is plainly inefficient: without a faster way to compare, a student has no alternative but to "
        "spend the time."
    )
    d.body_text(
        "On engagement specifically, Homfeldt and Kähler (2026) compared push-notification strategies "
        "across two consumer apps and found well-targeted notifications lifting session return rates "
        "substantially above a no-notification baseline, while over-frequent or poorly-targeted "
        "notifications eroded the same metric, a caution this project took seriously when scoping "
        "CURRICULA's notification triggers to order-status changes and genuine new-arrival events "
        "rather than generic promotional pushes (Figure 2.7)."
    )
    d.figure_svg(figs["fig2_6"], "Nielsen's (1994) ten usability heuristics, used as the evaluation lens for the app's UI in Chapter Three.", number="2.6")
    d.figure_svg(figs["fig2_7"], "Illustrative engagement funnel showing the documented retention lift attributable to push notifications (Homfeldt & Kähler, 2026).", number="2.7")
    d.body_text(
        "One heuristic worth singling out beyond the general ten is accessibility, which Nielsen's "
        "(1994) framework treats as an extension of \"flexibility and efficiency of use\" rather than a "
        "separate category, and which the reviewed bookshop and campus-commerce systems do not discuss "
        "at all. A student population is not a uniform population: font scaling for low-vision users, "
        "adequate colour contrast (a design constraint CURRICULA's own light/dark palette was checked "
        "against directly, rather than left to a framework default), and screen-reader-compatible labels "
        "on icon-only controls all affect whether the searchable catalogue in Figure 1.5 is actually "
        "usable by every student it is intended to serve, not only the median one a usability "
        "walkthrough sample happens to represent. Acosta-Vargas et al.'s (2021) scoping review of "
        "accessibility in native mobile applications found this gap to be general across the industry, "
        "not specific to campus-commerce systems: the studies they reviewed consistently treated "
        "accessibility as an afterthought layered onto a finished interface rather than a constraint "
        "designed against from the start, which is precisely the ordering this project tried to avoid "
        "by checking contrast and labelling during design (Section 3.3.1) rather than after "
        "implementation."
    )
    d.body_text(
        "The heuristic-evaluation method itself, not only its ten-item content, has its own literature "
        "worth naming: Nielsen and Molich (1990) originally proposed heuristic evaluation as a "
        "deliberately lightweight alternative to full usability-lab testing, meant for exactly the "
        "resource-constrained situation a single-developer project without a formal usability-testing "
        "budget finds itself in, which is the specific methodological justification, beyond convenience, "
        "for why Chapter Three's evaluation leans on a heuristic walkthrough rather than a larger "
        "controlled study."
    )

    d.heading("2.6 Access Control in Administrative Systems", level=2, center=False)
    d.body_text(
        "Sandhu et al.'s (1996) role-based access control model, permissions attached to roles rather "
        "than individual users, remains the standard vocabulary for describing exactly the "
        "student/admin split CURRICULA implements inside one codebase rather than as two separate "
        "applications (Figure 2.8). The practical benefit over building a separate admin app, beyond "
        "the obvious saving in duplicated screens, is that a single set of catalogue and order data "
        "structures is guaranteed to stay consistent between what a student sees and what an "
        "administrator edits; two codebases sharing one database are two places the same assumption "
        "about a field's meaning can quietly drift apart."
    )
    d.figure_svg(figs["fig2_8"], "Role-based access control concept applied in the same codebase (Sandhu et al., 1996): identical app, permissions gated by role.", number="2.8")
    d.body_text(
        "Role-based access control alone does not cover every security-relevant concern an admin "
        "surface raises, and it is worth naming what it leaves open rather than implying the model is a "
        "complete answer. A role check answers \"is this user allowed to perform this action at all,\" "
        "not \"which specific action did this user actually perform, and when.\" The second question, "
        "audit logging, matters once more than one administrator can independently edit prices, stock, "
        "and org-structure data, since a disputed price change or an incorrectly zeroed stock count "
        "needs a record of who changed it and when, not only a role check that permitted the change in "
        "the first place. This project's own audit-logging coverage is, by its own account, incomplete "
        "(Section 4.1's implementation notes), which this review flags here as a limitation inherited "
        "from the access-control literature's own narrower scope, not a gap invented by this study."
    )
    d.body_text(
        "Access control also has a regulatory dimension the systems-design literature above does not "
        "itself address. Omotubora's (2021) assessment of Nigeria's Data Protection Regulation found its "
        "enforcement mechanisms deficient in several respects, but the regulation's underlying "
        "requirement, that access to personal data be limited to what a given role genuinely needs, is "
        "exactly what role-based access control is built to enforce mechanically. A system's RBAC design "
        "is, in that sense, one of the more direct technical answers available to a legal requirement "
        "that would otherwise depend on organisational policy alone (Appendix F)."
    )

    d.heading("2.7 Summary of Reviewed Literature and Identified Gap", level=2, center=False)
    d.body_text(
        "Table 2 draws the systems reviewed in Section 2.2 together against the six capabilities "
        "Chapter One's objectives require. No reviewed system combines all six; each solves a subset, "
        "usually the subset closest to its own institution's most visible pain point at the time it was "
        "built. That partial coverage, repeated across every system found in the review, is the gap "
        "this study addresses head-on."
    )
    d.table(
        ["Capability", "Osman et al. (2024)", "Oyekan et al. (2024)", "Generic online bookstore", "CURRICULA (this study)"],
        [
            ["Live price/stock sync to student", "Partial (WhatsApp query)", "No (admin-only)", "Yes (general catalogue)", "Yes"],
            ["In-app payment (local aggregator)", "No", "No", "Sometimes (global gateways)", "Yes (Paystack & Flutterwave)"],
            ["Push + email notifications", "No (WhatsApp only)", "No", "Rare", "Yes"],
            ["Org-structure-aware catalogue", "No", "Yes (admin-side)", "No", "Yes (School→Dept→Level)"],
            ["Single codebase, role-gated admin", "No", "No", "Rare", "Yes"],
            ["Native mobile app", "No (web/WhatsApp)", "No (web)", "Rare", "Yes (Expo/React Native)"],
        ],
        caption="Feature coverage of reviewed systems compared against this study's requirements.",
        number="2",
    )
    d.figure_svg(figs["fig2_9"], "Feature coverage of reviewed systems against this study's requirements (the basis for Table 2).", number="2.9")
    d.figure_svg(figs["fig2_11"], "Table 2 restated as a count: capabilities met (out of six) by each reviewed system versus CURRICULA.", number="2.11")

    d.heading("2.8 Synthesis: What the Literature Does Not Yet Address", level=2, center=False)
    d.body_text(
        "Drawing the critical points raised across this chapter together, rather than leaving them "
        "scattered under their individual subsections, three second-order gaps recur regardless of "
        "which specific system or technology is under discussion. First, evaluation samples across the "
        "reviewed bookshop systems are consistently small and single-institution (Section 2.2.1), which "
        "means every claim in this literature about usability or adoption, including, by the same "
        "standard, this study's own, should be read as indicative rather than conclusive until tested "
        "at genuine scale. Second, none of the reviewed systems treat the student-facing and "
        "administrator-facing halves of the same workflow as one connected problem (Section 2.2.2); "
        "each solves one half and leaves the other implicit, which is the structural gap Section 2.7's "
        "comparison table quantifies concretely. Third, security and accessibility are consistently "
        "under-discussed relative to functional features across this entire body of work (Sections 2.5 "
        "and 2.6): every reviewed system's own publication foregrounds what it does for a user and "
        "says comparatively little about who that user population actually includes or how a change is "
        "tracked once made."
    )
    d.body_text(
        "None of these three gaps is unique to the bookshop domain specifically; they are the same "
        "gaps a review of almost any small-scale, single-institution software project would likely "
        "surface. What is specific to this domain is Table 2's finding that no reviewed system closes "
        "the *functional* gap between student and administrator surfaces at all, which is the gap "
        "Chapter Three's architecture was built specifically around, and the reason this study's own "
        "evaluation (Chapter Five) is explicit about testing that closure specifically rather than "
        "usability in the abstract."
    )

    d.heading("2.9 Chapter Summary", level=2, center=False)
    d.body_text(
        "This chapter reviewed four bodies of work (comparable bookshop/campus-commerce systems, the "
        "specific technologies chosen for CURRICULA, African fintech payment integration, and "
        "usability/engagement research) and found each contributing part of the solution but no "
        "single existing system combining live price transparency, local payment integration, "
        "role-gated administration, and an organisational-structure-aware catalogue in one native "
        "mobile application. Section 2.8 drew three recurring second-order gaps out of that review: "
        "small evaluation samples, an unaddressed student/administrator functional split, and "
        "under-discussed security and accessibility, that shaped decisions taken throughout Chapter "
        "Three. Figure 2.10's input-process-output model frames how this study turns that gap into a "
        "build: the observed workflow and this review as input, the iterative build process described "
        "next in Chapter Three, and a working, evaluated system as output."
    )
    d.figure_svg(figs["fig2_10"], "Input-Process-Output research model adopted for this study, synthesised from the reviewed literature.", number="2.10")
