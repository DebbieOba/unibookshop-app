"""Chapter Four content + figures: Research timeline and budget."""
import os
from svg_gen import (
    box, arrow, text, wrapped_text, figure_frame, rect,
    PRIMARY, PRIMARY_SOFT, ACCENT, ACCENT_SOFT, NEUTRAL, NEUTRAL_SOFT,
    OK, OK_SOFT, WARN, WARN_SOFT, INK, INK_SOFT, save,
)

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")


def _f(name):
    return os.path.join(FIG_DIR, name)


MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
# Aug (col 10) is the post-defence corrections/binding buffer, outside the
# core 9-month research programme (Nov = M1 ... Jul = M9), consistent with
# both "9 months" and "November to August" as given.

TASKS = [
    ("Literature Review", 1, 8, PRIMARY),
    ("System Design & Core Module Development (architecture, schema, algorithms)", 4, 6, ACCENT),
    ("Project (Interim) Seminar", 5, 5, WARN),
    ("Unit Testing & Module Analysis", 5, 6, ACCENT),
    ("Project Progress Review", 6, 6, WARN),
    ("Integration & System Testing", 6, 7, ACCENT),
    ("Result Collation, Analysis & Interpretation", 6, 7, OK),
    ("Report Writing", 5, 8, PRIMARY),
    ("Final Seminar", 9, 9, WARN),
    ("External Defence", 9, 9, WARN),
    ("Post-defence corrections & binding (buffer)", 10, 10, NEUTRAL),
]


def build_figures():
    paths = {}

    # 4.1 Gantt chart
    left = 320
    col_w = 58
    row_h = 34
    top = 50
    b = ""
    b += text(left + len(MONTHS) * col_w / 2, 24, "Month", 12, "middle", "bold")
    for i, m in enumerate(MONTHS):
        x = left + i * col_w
        shade = "#F1F5F9" if i == 9 else "#FFFFFF"
        b += rect(x, top - 22, col_w, len(TASKS) * row_h + 22, fill=shade, stroke="#E2E8F0", rx=0)
        b += text(x + col_w / 2, top - 6, m, 10.5, "middle", "bold", fill=(NEUTRAL if i == 9 else INK))
    for j, (label, m1, m2, color) in enumerate(TASKS):
        y = top + j * row_h
        b += wrapped_text(left - 10, y + row_h / 2, label, 9.7, max_chars=46, anchor="end", fill=INK)
        x1 = left + (m1 - 1) * col_w + 4
        w = (m2 - m1 + 1) * col_w - 8
        b += rect(x1, y + 6, w, row_h - 12, fill=color + "33", stroke=color, rx=6, sw=1.4)
    for j in range(len(TASKS) + 1):
        b += f'<line x1="{left-300}" y1="{top+j*row_h}" x2="{left+len(MONTHS)*col_w}" y2="{top+j*row_h}" stroke="#EDF2F7" stroke-width="1"/>\n'
    svg = figure_frame(left + len(MONTHS) * col_w + 20, top + len(TASKS) * row_h + 20,
                        "Project Gantt chart, November 2025 - August 2026 (August reserved as the post-defence corrections/binding buffer).", "4.1", b)
    paths["fig4_1"] = save(_f("fig4_1_gantt.svg"), svg)

    # 4.2 Work breakdown structure (tree)
    b = ""
    b += box(360, 10, 260, 45, "CURRICULA Final-Year Project", fill=PRIMARY_SOFT, stroke=PRIMARY, size=12)
    branches = [
        ("Research & Design", 40, ["Literature review", "Requirements analysis", "Architecture/ERD/DFD"]),
        ("Build", 340, ["Backend modules", "Mobile screens", "Payment/notification integration"]),
        ("Verification", 640, ["Unit/integration testing", "Usability walkthrough", "Bug fixes"]),
        ("Dissemination", 900, ["Report writing", "Seminars", "External defence"]),
    ]
    for label, x, subs in branches:
        b += box(x, 90, 220, 40, label, fill=ACCENT_SOFT, stroke=ACCENT, size=11)
        b += arrow(490, 55, x + 110, 90, curve=(490, 72))
        for k, s in enumerate(subs):
            y = 150 + k * 46
            b += box(x - 10, y, 240, 36, s, fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=9.7)
            b += arrow(x + 110, 130, x + 110, y)
    svg = figure_frame(1160, 300, "Work breakdown structure: four phases decomposed into their constituent tasks.", "4.2", b)
    paths["fig4_2"] = save(_f("fig4_2_wbs.svg"), svg)

    # 4.3 Budget breakdown bar chart
    items = [
        ("Internet data (9 mo.)", 135000),
        ("Printing & binding", 45000),
        ("Transport (supervision visits)", 30000),
        ("Cloud overage buffer", 20000),
        ("Domain / misc. subscriptions", 15000),
        ("Contingency (10%)", 24500),
    ]
    max_v = max(v for _, v in items)
    x0, bar_h, gap = 260, 30, 14
    b = ""
    for i, (label, v) in enumerate(items):
        y = 20 + i * (bar_h + gap)
        w = 480 * (v / max_v)
        b += text(x0 - 12, y + bar_h / 2 + 4, label, 10.5, "end")
        b += rect(x0, y, w, bar_h, fill=PRIMARY_SOFT, stroke=PRIMARY, rx=5)
        b += text(x0 + w + 8, y + bar_h / 2 + 4, f"N{v:,.0f}", 10.5, fill=INK_SOFT)
    svg = figure_frame(820, 20 + len(items) * (bar_h + gap) + 10, "Direct out-of-pocket project cost by category (Table 5).", "4.3", b)
    paths["fig4_3"] = save(_f("fig4_3_budget_bars.svg"), svg)

    # 4.4 Cumulative cost curve (S-curve, illustrative)
    cum = [5, 15, 30, 48, 95, 155, 195, 230, 255, 269.5]  # in thousands, cumulative to month
    x0, y0, w, h = 60, 250, 700, 220
    b = ""
    b += f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0-h}" stroke="#94A3B8" stroke-width="1"/>\n'
    b += f'<line x1="{x0}" y1="{y0}" x2="{x0+w}" y2="{y0}" stroke="#94A3B8" stroke-width="1"/>\n'
    max_c = max(cum)
    pts = []
    for i, c in enumerate(cum):
        x = x0 + i * (w / (len(cum) - 1))
        y = y0 - h * (c / max_c)
        pts.append((x, y))
        b += text(x, y0 + 16, MONTHS[i], 9.5, "middle", fill=INK_SOFT)
    path_d = "M" + " L".join(f"{x:.0f},{y:.0f}" for x, y in pts)
    b += f'<path d="{path_d}" fill="none" stroke="{PRIMARY}" stroke-width="2.2"/>\n'
    for x, y in pts:
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="3.5" fill="{PRIMARY}"/>\n'
    b += text(x0, y0 - h - 10, "Cumulative spend (N'000)", 11, "start", "bold")
    svg = figure_frame(820, 300, "Cumulative project spend across the timeline (illustrative S-curve typical of build-then-test projects).", "4.4", b)
    paths["fig4_4"] = save(_f("fig4_4_cost_curve.svg"), svg)

    # 4.5 Milestone timeline (diamonds on a line)
    milestones = [("Topic approved", 1), ("Design frozen", 4), ("Core build complete", 6),
                  ("System testing complete", 7), ("Draft report complete", 8), ("External defence", 9)]
    x0, x1, y = 40, 900, 100
    b = f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="#94A3B8" stroke-width="2"/>\n'
    for label, m in milestones:
        x = x0 + (x1 - x0) * (m - 1) / 8
        b += f'<circle cx="{x:.0f}" cy="{y}" r="7" fill="{OK}"/>\n'
        yb = 60 if int(m) % 2 else 130
        b += wrapped_text(x, yb, label, 10, max_chars=16)
        b += f'<line x1="{x:.0f}" y1="{y-7 if yb<y else y+7}" x2="{x:.0f}" y2="{yb + (12 if yb<y else -12)}" stroke="#CBD5E1" stroke-width="1"/>\n'
    svg = figure_frame(940, 180, "Key project milestones mapped to the Gantt chart's month numbering.", "4.5", b)
    paths["fig4_5"] = save(_f("fig4_5_milestones.svg"), svg)

    # 4.6 Effort distribution donut-ish (rings via arcs simplified as stacked bar)
    effort = [("Design & literature", 25, PRIMARY), ("Backend build", 25, ACCENT),
              ("Mobile build", 25, OK), ("Testing & reporting", 25, WARN)]
    x0, y0, wtot = 40, 80, 700
    b = ""
    x = x0
    for label, pct, color in effort:
        w = wtot * pct / 100
        b += rect(x, y0, w, 60, fill=color + "33", stroke=color, rx=4)
        b += text(x + w / 2, y0 + 35, f"{pct}%", 13, "middle", "bold", fill=color)
        b += wrapped_text(x + w / 2, y0 + 90, label, 10, max_chars=14)
        x += w
    svg = figure_frame(780, 200, "Approximate distribution of total effort across the four project phases.", "4.6", b)
    paths["fig4_6"] = save(_f("fig4_6_effort_distribution.svg"), svg)

    # 4.7 Risk register (severity-coded)
    risks = [
        ("Supabase network access blocked on dev machine", "Medium", "Occurred", OK),
        ("Prisma query-engine binary locked by running dev server", "Low", "Occurred", OK),
        ("Payment aggregator sandbox downtime during testing", "Medium", "Monitored", WARN),
        ("Scope creep from stakeholder-requested extra features", "Medium", "Monitored", WARN),
        ("Single-developer bus-factor (no backup contributor)", "High", "Accepted", ACCENT),
    ]
    b = ""
    for i, (risk, sev, status, color) in enumerate(risks):
        y = 20 + i * 46
        b += rect(20, y, 130, 34, fill=color + "33", stroke=color, rx=6)
        b += text(85, y + 22, sev, 11, "middle", "bold", fill=color)
        b += wrapped_text(560, y + 17, risk, 10.5, max_chars=58)
        b += text(940, y + 22, status, 10, "middle", "italic", fill=INK_SOFT)
    svg = figure_frame(1020, 20 + len(risks) * 46 + 10, "Risk register: identified risks, severity, and how each was ultimately handled.", "4.7", b)
    paths["fig4_7"] = save(_f("fig4_7_risk_register.svg"), svg)

    # 4.8 Cost comparison: this project vs a commissioned equivalent
    bars = [("This project\n(direct cost)".replace("\n"," "), 269500, OK),
            ("Commissioned\n(low estimate)".replace("\n"," "), 1350000, WARN),
            ("Commissioned\n(high estimate)".replace("\n"," "), 2250000, WARN)]
    max_v = 2250000
    x0, w_col, gap = 80, 160, 90
    b = ""
    b += f'<line x1="{x0-20}" y1="260" x2="{x0-20}" y2="30" stroke="#94A3B8" stroke-width="1"/>\n'
    b += f'<line x1="{x0-20}" y1="260" x2="750" y2="260" stroke="#94A3B8" stroke-width="1"/>\n'
    for i, (label, v, color) in enumerate(bars):
        x = x0 + i * (w_col + gap)
        h = 220 * (v / max_v)
        b += rect(x, 260 - h, w_col, h, fill=color + "33", stroke=color, rx=6)
        b += text(x + w_col / 2, 260 - h - 10, f"N{v:,.0f}", 11.5, "middle", "bold", fill=color)
        b += wrapped_text(x + w_col / 2, 282, label, 10.5, max_chars=18)
    svg = figure_frame(800, 320, "This project's direct cost against an estimated commissioned-equivalent build at prevailing 2026 Nigerian contract-developer rates.", "4.8", b)
    paths["fig4_8"] = save(_f("fig4_8_cost_comparison.svg"), svg)

    # 4.9 Critical path
    path_tasks = ["Literature\nReview".replace("\n"," "), "System\nDesign".replace("\n"," "),
                  "Core\nBuild".replace("\n"," "), "Integration\nTesting".replace("\n"," "),
                  "Report\nWriting".replace("\n"," "), "External\nDefence".replace("\n"," ")]
    b = ""
    xw = 140
    for i, t in enumerate(path_tasks):
        x = 20 + i * (xw + 30)
        b += box(x, 60, xw, 55, t, fill=WARN_SOFT, stroke=WARN, size=10.5)
        if i < len(path_tasks) - 1:
            b += arrow(x + xw, 87, x + xw + 30, 87)
    b += text(20, 30, "Critical path (any slippage here delays the defence date directly)", 11.5, "start", "bold", fill=WARN)
    svg = figure_frame(20 + len(path_tasks) * (xw + 30), 150, "Critical path through the schedule: the sequence of tasks with zero slack.", "4.9", b)
    paths["fig4_9"] = save(_f("fig4_9_critical_path.svg"), svg)

    # 4.10 Budget as percentage share (alternative view of Table 5)
    shares = [("Internet data", 50.1, PRIMARY), ("Printing & binding", 16.7, ACCENT),
              ("Transport", 11.1, OK), ("Cloud buffer", 7.4, WARN),
              ("Domain/misc.", 5.6, NEUTRAL), ("Contingency", 9.1, "#94A3B8")]
    x0, y0, wtot = 30, 60, 700
    b = ""
    x = x0
    for label, pct, color in shares:
        w = wtot * pct / 100
        b += rect(x, y0, w, 50, fill=color + "33", stroke=color, rx=3)
        if w > 45:
            b += text(x + w / 2, y0 + 30, f"{pct}%", 10.5, "middle", "bold", fill=color)
        x += w
    y = y0 + 70
    for i, (label, pct, color) in enumerate(shares):
        cx = 30 + (i % 3) * 250
        cy = y + (i // 3) * 30
        b += rect(cx, cy, 14, 14, fill=color + "33", stroke=color, rx=3)
        b += text(cx + 22, cy + 12, f"{label} ({pct}%)", 10)
    svg = figure_frame(760, y + 70, "Direct project cost expressed as a percentage share of the total (Table 5).", "4.10", b)
    paths["fig4_10"] = save(_f("fig4_10_budget_share.svg"), svg)

    return paths


def write(d, figs):
    d.heading("CHAPTER FOUR", level=1, page_break_before=True)
    d.heading("RESEARCH TIMELINE AND BUDGET", level=1, center=True)
    d.spacer()

    d.heading("4.0 Introduction", level=2, center=False)
    d.body_text(
        "This chapter sets out how the nine-month research and development programme behind "
        "CURRICULA was scheduled, and what it cost to run. Both are presented as they were actually "
        "planned rather than reconstructed after the fact, on the view that a timeline is only useful "
        "to a reader if it is realistic enough to be repeated by someone else attempting a comparable "
        "project."
    )

    d.heading("4.1 Research Timeline", level=2, center=False)
    d.body_text(
        "The programme runs across nine core months, November through July, with August held back "
        "specifically as a post-defence corrections-and-binding buffer rather than folded into the "
        "nine, a distinction worth keeping explicit, since a defence date that is also the report's "
        "final deadline leaves no room to act on examiners' corrections. Literature review runs "
        "longest of any single activity (Months 1-8) because the reference pool underpinning Chapters "
        "One and Two was extended continuously as design decisions in Chapter Three raised new "
        "questions (a Redis-caching claim needing its own supporting source, a framework choice "
        "needing a comparative benchmark) rather than closed off after an initial literature survey. "
        "System design and core module development follow directly from the requirements settled by "
        "the literature review and run Months 4-6, overlapping on purpose with the tail of the "
        "literature review rather than waiting for it to finish outright, since architecture decisions "
        "(Section 3.3.1) were themselves informed by the technology-comparison literature reviewed in "
        "Section 2.3."
    )
    d.body_text(
        "Testing is split deliberately into two passes rather than one. Unit-level testing and module "
        "analysis (Months 5-6) validate each backend service in isolation as it is completed; "
        "integration and system testing (Months 6-7) exercise the cross-module flows that unit tests "
        "alone cannot catch, checkout through webhook-verified payment being the flow most worth "
        "testing end-to-end per Section 3.7. Result collation and analysis (Months 6-7) runs "
        "alongside the second testing pass rather than after it, since the usability walkthrough "
        "results referenced in Chapter Five were gathered as testing progressed, not in a single "
        "batch at the end. Report writing spans Months 5-8, again overlapping earlier "
        "activity: chapters covering completed work (Chapters One through Three) were drafted while "
        "later chapters' underlying activity (testing, results) was still in progress, which is what "
        "made an eight-month writing window realistic rather than compressed."
    )
    d.figure_svg(figs["fig4_2"], "Work breakdown structure: four phases decomposed into their constituent tasks.", number="4.2")
    d.figure_svg(figs["fig4_5"], "Key project milestones mapped to the Gantt chart's month numbering.", number="4.5")
    d.figure_svg(figs["fig4_6"], "Approximate distribution of total effort across the four project phases.", number="4.6")

    d.heading("4.1.1 Resource Allocation and Stakeholder Communication", level=3, center=False)
    d.body_text(
        "A single-developer project still has to allocate scarce time across genuinely different kinds "
        "of work, and Figure 4.6's even 25/25/25/25 split across design-and-literature, backend build, "
        "mobile build, and testing-and-reporting is a planning simplification worth being honest about: "
        "in practice, effort shifted role by role within a week rather than following that split evenly "
        "day to day, with backend and mobile work often running in the same week rather than in strict "
        "sequence, since a mobile screen frequently could not be finished until the API endpoint it "
        "called was already working. The 25/25/25/25 figure should therefore be read as an aggregate "
        "planning allocation, not a claim that each quarter of the calendar was spent on exactly one "
        "activity to the exclusion of the others."
    )
    d.body_text(
        "Stakeholder communication was necessarily lighter than a multi-person project would require, "
        "but was not absent: the project supervisor received progress updates aligned to the milestones "
        "in Figure 4.5 rather than on a fixed weekly cadence, which matched the genuinely uneven pace of "
        "a build that moved in bursts around exam periods and other coursework commitments rather than "
        "at a constant rate. Bookshop staff consulted during the observation period underlying Section "
        "1.2 were kept informally aware that the observations might inform a student project, but were "
        "not treated as ongoing project stakeholders with a formal reporting line, since the system was "
        "built as an academic exercise evaluated against its own objectives (Section 1.4) rather than as "
        "a commissioned deliverable for the observed bookshop specifically."
    )

    d.heading("4.2 Gantt Chart", level=2, center=False)
    d.body_text(
        "Figure 4.1 lays the schedule described above against the ten-month Nov-Aug window, with the "
        "final column shaded to mark it as the post-defence buffer rather than active research time."
    )
    d.figure_svg(figs["fig4_1"], "Project Gantt chart, November 2025 - August 2026 (August reserved as the post-defence corrections/binding buffer).", number="4.1")

    d.heading("4.2.1 Critical Path and Risk Management", level=3, center=False)
    d.body_text(
        "Figure 4.9 traces the sequence of tasks with no schedule slack: a delay to literature review, "
        "system design, core build, integration testing, or report writing pushes the external defence "
        "date directly, since none of these six activities has slack time built in against the fixed "
        "nine-month window. Table 5's contingency line and the risk register in Figure 4.7 exist "
        "specifically to protect that path. The highest-severity entry, a single-developer bus factor "
        "with no backup contributor, was accepted rather than mitigated, since a one-person final-year "
        "project has no realistic way to add a second contributor mid-programme; the practical response "
        "was simply to keep documentation (this report, and the project's own implementation notes) "
        "current enough that the work would remain resumable by someone else if it had to be."
    )
    d.figure_svg(figs["fig4_7"], "Risk register: identified risks, severity, and how each was ultimately handled.", number="4.7")
    d.figure_svg(figs["fig4_9"], "Critical path through the schedule: the sequence of tasks with zero slack.", number="4.9")

    d.heading("4.3 Budget", level=2, center=False)
    d.body_text(
        "The budget below covers direct, out-of-pocket cost only. It excludes the researcher's own "
        "labour, which the project treats as sunk academic time rather than a billable cost, and it "
        "excludes hardware already owned before the project began (a personal laptop and an Android "
        "test device). Every paid cloud service used in the build (Supabase Postgres, Redis, "
        "Cloudinary, Firebase Cloud Messaging, Resend, and both payment aggregators' sandbox/live "
        "modes) was used within its respective free tier for the duration of development; the "
        "\"cloud overage buffer\" line exists only to cover the risk of exceeding a free-tier quota "
        "during the heaviest testing weeks, not a cost that was certain to be incurred."
    )
    d.table(
        ["#", "Item", "Basis of estimate", "Cost (N)"],
        [
            ["1", "Internet data subscription", "9 months x ~N15,000/month, development + testing use", "135,000"],
            ["2", "Printing & binding", "3 draft copies + final bound copies, standard campus print rates", "45,000"],
            ["3", "Transport", "Supervision meetings + on-site bookshop observation visits", "30,000"],
            ["4", "Cloud overage buffer", "Contingency only; all services used within free tiers to date", "20,000"],
            ["5", "Domain / misc. subscriptions", "Optional landing-page domain, misc. developer tooling", "15,000"],
            ["6", "Contingency (10% of items 1-5)", "Standard 10% provisioning for a fixed-budget student project", "24,500"],
            ["", "TOTAL", "", "269,500"],
        ],
        caption="Estimated direct project cost, November 2025 - August 2026.",
        number="5",
    )
    d.body_text(
        "It is worth stating the counterfactual explicitly, since it is the strongest practical argument "
        "for the whole approach: valued at prevailing 2026 contract rates for a junior Nigerian mobile/"
        "backend developer (commonly quoted in the range of N150,000-N250,000 per month for comparable "
        "scope), the roughly nine months of build work documented in Chapter Three would cost an "
        "external client well over a million naira to commission from scratch. That gap between what "
        "this project actually cost, on a student budget, and what commissioning the same system would "
        "cost on the open market, is not incidental to the argument in Section 1.2 about low-cost "
        "automation for small bookshops. It is close to the whole of it."
    )
    d.figure_svg(figs["fig4_8"], "This project's direct cost against an estimated commissioned-equivalent build at prevailing 2026 Nigerian contract-developer rates.", number="4.8")
    d.figure_svg(figs["fig4_3"], "Direct out-of-pocket project cost by category (Table 5).", number="4.3")
    d.figure_svg(figs["fig4_10"], "Direct project cost expressed as a percentage share of the total (Table 5).", number="4.10")
    d.figure_svg(figs["fig4_4"], "Cumulative project spend across the timeline (illustrative S-curve typical of build-then-test projects).", number="4.4")

    d.heading("4.3.1 Budget Sensitivity", level=3, center=False)
    d.body_text(
        "Table 5's total is a point estimate, and it is worth stating which lines it is most sensitive "
        "to rather than presenting it as a single fixed number. Internet data (Item 1) is both the "
        "largest line and the most exposed to circumstances outside this project's control. A "
        "prolonged period of unusually heavy testing, or a data-price increase mid-programme, would "
        "move this line more than any other, which is exactly why it was budgeted at a steady monthly "
        "rate across all nine months rather than assumed to shrink once initial development slowed. The "
        "cloud-overage buffer (Item 4) is, by contrast, closer to a true contingency than a certain "
        "cost: every managed service actually used in this build stayed within its free tier for the "
        "duration of development (Section 3.4), so that line represents risk provisioning rather than a "
        "cost this project is confident it will actually incur. If both of those lines are stripped out "
        "as the most speculative, the remaining, most-certain-to-be-incurred cost is closer to "
        "N114,500 (printing/binding, transport, and domain/misc. subscriptions together), which is a "
        "useful lower bound for any future project attempting a similarly scoped build on a tighter "
        "budget than this one had available."
    )
    d.body_text(
        "The commissioned-equivalent comparison in Figure 4.8 is similarly a range rather than a single "
        "figure, and deliberately so: contract rates for comparable scope vary with a developer's "
        "seniority, whether payment integration and admin tooling are quoted as in-scope or as separate "
        "add-ons, and whether ongoing maintenance is included. The range shown (roughly N1.35 million to "
        "N2.25 million) brackets a junior-to-mid-level quote for the scope documented in Chapter Three; "
        "a senior contractor, or a scope that also included the exchange-listing feature's originally-"
        "considered full marketplace variant (ruled out in Section 1.6), would plausibly quote higher "
        "still."
    )

    d.heading("4.3.2 Cost-Effectiveness Compared to the Literature", level=3, center=False)
    d.body_text(
        "Section 2.1 reviewed literature finding that cost is not, in fact, the most-cited barrier to "
        "small-retailer technology adoption. Awareness and perceived complexity were found to matter "
        "more once a genuinely free option exists. This project's own budget is offered as a direct, "
        "concrete data point on the other half of that argument: N269,500 in total out-of-pocket cost "
        "across a nine-month build (Table 5) is a small enough figure, relative to even a modest campus "
        "bookshop's monthly turnover, that cost alone cannot be the reason a comparable system would go "
        "unbuilt at another institution. What this budget cannot speak to, and what Section 2.1's "
        "literature suggests may matter more, is whether a bookshop owner without this project's own "
        "technical background would know such a low-cost path exists at all, or would default to "
        "assuming any custom software necessarily costs what a commercial vendor would quote (Figure "
        "4.8's upper estimate). That gap between actual cost and perceived cost is, in the end, as much "
        "a communication problem for future adopters as it is a technical one, which is why Section "
        "5.5's recommendations address dissemination alongside further development."
    )
    d.body_text(
        "A further point worth making explicit is what this budget does not include, since a reader "
        "comparing it against a commercial quote should compare like with like. The N269,500 figure "
        "excludes the researcher's own time (Section 4.3), ongoing hosting cost beyond the free tiers "
        "used during development, and any cost associated with training bookshop staff to use the admin "
        "screens described in Section 3.6, all of which a real institutional adoption would need to "
        "budget for separately, even though this project's own build did not need to."
    )

    d.heading("4.4 Chapter Summary", level=2, center=False)
    d.body_text(
        "The project ran a nine-month core schedule (November-July) with an August corrections buffer, "
        "front-loaded on literature review and design, overlapping build, testing, and writing "
        "activity rather than sequencing them strictly, and cost approximately N269,500 in direct, "
        "out-of-pocket terms, a figure that stays low specifically because the technology choices "
        "justified in Chapters Two and Three lean on free-tier managed services rather than paid "
        "infrastructure. Chapter Five closes the report with the study's conclusions, its "
        "recommendations, and a summary of what was and was not achieved against the objectives set in "
        "Section 1.4."
    )
