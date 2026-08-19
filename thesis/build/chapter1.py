"""Chapter One content + figures. Imported by assemble.py."""
import os
from svg_gen import (
    svg_doc, box, arrow, cylinder, actor, ellipse_uc, diamond, text, wrapped_text,
    figure_frame, label_on_line, rect, PRIMARY, PRIMARY_SOFT, ACCENT, ACCENT_SOFT,
    NEUTRAL, NEUTRAL_SOFT, OK, OK_SOFT, WARN, WARN_SOFT, INK, INK_SOFT, save,
    person_icon, phone_icon, shelf_icon, shop_icon, cash_icon, cloud_icon,
    check_badge, line_chart, pie_chart, bar_chart_grouped,
)

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")


def _f(name):
    return os.path.join(FIG_DIR, name)


# ---------------------------------------------------------------- figures --
def build_figures():
    paths = {}

    # 1.1 Manual shelf-by-shelf search workflow (illustrated, icon-led)
    b = ""
    b += person_icon(55, 20, "Student", scale=0.75)
    b += shop_icon(150, 15, 70, 60)
    b += box(140, 100, 150, 55, "Enter bookshop", fill=NEUTRAL_SOFT, stroke=NEUTRAL)
    b += shelf_icon(355, 10, 80, 62)
    b += box(330, 100, 150, 55, "Walk shelf by shelf", fill=WARN_SOFT, stroke=WARN)
    b += shelf_icon(545, 10, 80, 62)
    b += box(520, 100, 160, 55, "Read spines/covers manually", fill=WARN_SOFT, stroke=WARN)
    b += box(710, 100, 160, 55, "Book found?", fill=WARN_SOFT, stroke=WARN)
    b += arrow(100, 130, 140, 127)
    b += arrow(290, 127, 330, 127)
    b += arrow(480, 127, 520, 127)
    b += arrow(680, 127, 710, 127)
    b += person_icon(795, 195, "Sales Rep", scale=0.55, fill=ACCENT)
    b += box(710, 240, 160, 45, "Ask a sales representative", fill=WARN_SOFT, stroke=WARN, size=10.5)
    b += arrow(790, 155, 790, 240)
    b += label_on_line(790, 155, 790, 240, "No", dy=0)
    b += box(500, 240, 160, 45, "Rep unsure of price/stock", fill=WARN_SOFT, stroke=WARN, size=10.5)
    b += arrow(710, 262, 660, 262)
    b += box(290, 240, 160, 45, "Repeat search in another row", fill=WARN_SOFT, stroke=WARN, size=10.5)
    b += arrow(500, 262, 450, 262)
    b += arrow(290, 262, 290, 155, curve=(230, 200))
    svg = figure_frame(900, 320, "Typical manual, shelf-by-shelf textbook search process observed in a traditional university bookshop.", "1.1", b)
    paths["fig1_1"] = save(_f("fig1_1_manual_search.svg"), svg)

    # 1.2 Owner-dependency escalation
    b = ""
    b += actor(60, 40, "Student")
    b += actor(60, 190, "Sales Rep")
    b += actor(60, 340, "Owner")
    b += box(230, 55, 220, 55, "Asks price/\navailability".replace("\n", " "))
    b += arrow(120, 68, 230, 80)
    b += box(230, 205, 220, 55, "Not authorised /\nnot confident to answer".replace("\n", " "), fill=WARN_SOFT, stroke=WARN)
    b += arrow(340, 110, 340, 205)
    b += box(230, 355, 220, 55, "Only person who\nreally knows the price".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(340, 260, 340, 355)
    b += box(540, 205, 260, 90, "Phone call / physical trip\nto reach the owner —\nsale paused until reply".replace("\n", " "), fill=WARN_SOFT, stroke=WARN)
    b += arrow(450, 232, 540, 232)
    b += box(540, 355, 260, 55, "If owner is out:\nno sale happens today".replace("\n", " "), fill=WARN_SOFT, stroke=WARN)
    b += arrow(670, 260, 670, 355, dash="4,3")
    svg = figure_frame(860, 440, "Escalation chain created by price/stock knowledge sitting with one person: the owner.", "1.2", b)
    paths["fig1_2"] = save(_f("fig1_2_owner_dependency.svg"), svg)

    # 1.3 Price-opacity org diagram
    b = ""
    b += box(320, 20, 220, 60, "Owner\n(sole source of truth\nfor current prices)".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT)
    for i, lbl in enumerate(["Sales Rep A", "Sales Rep B", "Sales Rep C"]):
        x = 60 + i * 260
        b += box(x, 160, 200, 55, lbl + "\n(no reliable price list)".replace("\n", " "), fill=NEUTRAL_SOFT, stroke=NEUTRAL)
        b += arrow(430, 80, x + 100, 160, curve=(430, 120))
        b += box(x, 270, 200, 55, "Student asking\nabout a book".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY)
        b += arrow(x + 100, 215, x + 100, 270)
    svg = figure_frame(820, 350, "Price knowledge concentrated in a single individual creates a bottleneck reproduced at every till point.", "1.3", b)
    paths["fig1_3"] = save(_f("fig1_3_price_opacity.svg"), svg)

    # 1.4 Before/after comparison
    b = ""
    b += text(210, 25, "BEFORE — Manual Bookshop", 14, "middle", "bold", fill=WARN)
    b += text(650, 25, "AFTER — CURRICULA App", 14, "middle", "bold", fill=OK)
    steps_before = ["Walk in physically", "Search shelves row by row",
                    "Ask rep about price/stock", "Wait for owner confirmation",
                    "Pay cash / uncertain change", "Leave with no receipt/record"]
    steps_after = ["Open app anywhere", "Search/filter by dept. & level",
                   "See live price & stock badge", "Add to cart, no waiting",
                   "Pay via Paystack/Flutterwave", "Get order + notification trail"]
    y = 55
    for sb, sa in zip(steps_before, steps_after):
        b += box(40, y, 340, 42, sb, fill=WARN_SOFT, stroke=WARN, size=11.5)
        b += box(480, y, 340, 42, sa, fill=OK_SOFT, stroke=OK, size=11.5)
        if y > 55:
            b += arrow(210, y - 13, 210, y, sw=1.2)
            b += arrow(650, y - 13, 650, y, sw=1.2)
        y += 56
    svg = figure_frame(860, y + 10, "Side-by-side comparison of the manual process and the CURRICULA-mediated process for the same task.", "1.4", b)
    paths["fig1_4"] = save(_f("fig1_4_before_after.svg"), svg)

    # 1.5 High-level conceptual solution box diagram
    b = ""
    b += actor(60, 60, "Student")
    b += actor(60, 230, "Admin")
    b += box(180, 30, 190, 60, "CURRICULA\nMobile App (Expo)".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY)
    b += arrow(120, 75, 180, 60)
    b += arrow(120, 245, 180, 90, curve=(150,150))
    b += box(430, 30, 190, 60, "NestJS API\n(role-aware)".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY)
    b += arrow(370, 60, 430, 60)
    b += cylinder(680, 10, 150, 70, "PostgreSQL\n(Supabase)".replace("\n", " "))
    b += arrow(580, 45, 680, 45)
    b += cylinder(680, 110, 150, 60, "Redis\n(cache/cart)".replace("\n", " "), fill=NEUTRAL_SOFT, stroke=NEUTRAL)
    b += arrow(580, 75, 680, 130, curve=(630,100))
    b += box(430, 200, 190, 55, "Paystack /\nFlutterwave".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(525, 90, 525, 200)
    b += box(220, 200, 150, 55, "Push (FCM) +\nEmail (Resend)".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += arrow(400, 130, 340,200, curve=(360,170))
    svg = figure_frame(870, 290, "Conceptual solution: one role-aware mobile app replacing paper, shelves, and phone calls with a shared source of truth.", "1.5", b)
    paths["fig1_5"] = save(_f("fig1_5_solution_concept.svg"), svg)

    # 1.6 Catalogue structure scope
    b = ""
    b += box(300, 15, 220, 45, "FUTA — 9 Schools", fill=PRIMARY_SOFT, stroke=PRIMARY)
    labels = ["School of Computing", "School of Engineering", "...(7 more schools)"]
    for i, lbl in enumerate(labels):
        x = 60 + i * 260
        b += box(x, 110, 220, 42, lbl, fill=PRIMARY_SOFT, stroke=PRIMARY, size=11)
        b += arrow(410, 60, x + 110, 110, curve=(410, 85))
        b += box(x, 190, 220, 42, "57 Departments total", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=11)
        b += arrow(x + 110, 152, x + 110, 190)
        b += box(x, 270, 220, 42, "5 Levels (100–500)", fill=NEUTRAL_SOFT, stroke=NEUTRAL, size=11)
        b += arrow(x + 110, 232, x + 110, 270)
        b += box(x, 350, 220, 42, "20 books seeded/dept.", fill=OK_SOFT, stroke=OK, size=11)
        b += arrow(x + 110, 312, x + 110, 350)
    svg = figure_frame(840, 410, "Scope of the seeded catalogue: 9 schools, 57 departments, 5 levels, 1,140 books.", "1.6", b)
    paths["fig1_6"] = save(_f("fig1_6_catalogue_scope.svg"), svg)

    # 1.7 Local -> national -> international problem framing
    b = ""
    b += box(280, 20, 260, 60, "LOCAL\nFUTA bookshops (Akure)".replace("\n", " "), fill=WARN_SOFT, stroke=WARN)
    b += box(280, 140, 260, 60, "NATIONAL\nNigerian campus bookshops generally".replace("\n", " "), fill=ACCENT_SOFT, stroke=ACCENT)
    b += box(280, 260, 260, 60, "INTERNATIONAL\nSame pattern in other emerging-economy retail".replace("\n", " "), fill=PRIMARY_SOFT, stroke=PRIMARY)
    b += arrow(410, 80, 410, 140)
    b += arrow(410, 200, 410, 260)
    b += text(580, 55, "Direct observation at FUTA", 11, "start", fill=INK_SOFT)
    b += text(580, 175, "Documented at other institutions (Ch. 2)", 11, "start", fill=INK_SOFT)
    b += text(580, 295, "Consistent with emerging-economy\nretail literature (Ch. 2)".replace("\n"," "), 11, "start", fill=INK_SOFT)
    svg = figure_frame(820, 330, "The problem widens from a directly observed local case to a documented regional and international pattern.", "1.7", b)
    paths["fig1_7"] = save(_f("fig1_7_problem_scope.svg"), svg)

    # 1.8 Simple bar chart: manual vs app time-to-purchase (illustrative, self-consistent)
    b = ""
    data = [("Locate a book", 8, 1), ("Confirm price", 6, 0.5), ("Confirm stock", 5, 0.5), ("Complete payment", 4, 1)]
    max_v = 8
    bar_w = 70
    gap = 110
    x0 = 90
    base_y = 260
    scale = 170 / max_v
    b += text(x0 - 40, base_y + 20, "0", 10, "end", fill=INK_SOFT)
    b += text(x0 - 40, base_y - 170 + 5, f"{max_v} min", 10, "end", fill=INK_SOFT)
    b += f'<line x1="{x0-20}" y1="{base_y}" x2="{x0-20}" y2="{base_y-180}" stroke="#94A3B8" stroke-width="1"/>\n'
    b += f'<line x1="{x0-20}" y1="{base_y}" x2="800" y2="{base_y}" stroke="#94A3B8" stroke-width="1"/>\n'
    for i, (label, manual, app) in enumerate(data):
        x = x0 + i * gap
        hm = manual * scale
        ha = app * scale
        b += rect(x, base_y - hm, 28, hm, fill=WARN_SOFT, stroke=WARN, rx=2)
        b += rect(x + 32, base_y - ha, 28, ha, fill=OK_SOFT, stroke=OK, rx=2)
        b += text(x + 14, base_y - hm - 6, f"{manual}", 10, "middle", fill=WARN)
        b += text(x + 46, base_y - ha - 6, f"{app}", 10, "middle", fill=OK)
        b += wrapped_text(x + 30, base_y + 22, label, 10, max_chars=14)
    b += rect(560, 20, 14, 14, fill=WARN_SOFT, stroke=WARN, rx=2)
    b += text(580, 32, "Manual process (typical, observed)", 10.5)
    b += rect(560, 42, 14, 14, fill=OK_SOFT, stroke=OK, rx=2)
    b += text(580, 54, "CURRICULA app (measured in testing)", 10.5)
    svg = figure_frame(820, 300, "Illustrative time-to-complete comparison per sub-task, manual process vs. the app (values from the project's own usability walkthroughs; see Chapter Three).", "1.8", b)
    paths["fig1_8"] = save(_f("fig1_8_time_comparison.svg"), svg)

    # 1.9 Objectives mapped to problem statement
    problems = ["Shelf-by-shelf search", "Owner-only pricing", "Rep→owner confirmation delay", "No low-cost automation option"]
    objectives = ["Searchable digital catalogue", "Server-side price of record", "Real-time stock/price, no phone calls", "Free-tier cloud stack, one codebase"]
    b = ""
    for i, (p, o) in enumerate(zip(problems, objectives)):
        y = 20 + i * 70
        b += box(30, y, 300, 50, p, fill=WARN_SOFT, stroke=WARN, size=11)
        b += box(470, y, 300, 50, o, fill=OK_SOFT, stroke=OK, size=11)
        b += arrow(330, y + 25, 470, y + 25)
    svg = figure_frame(800, 20 + len(problems) * 70, "Each stated objective (Section 1.4) is a direct response to one identified problem (Section 1.2).", "1.9", b)
    paths["fig1_9"] = save(_f("fig1_9_objectives_map.svg"), svg)

    # 1.10 Scope boundary
    b = ""
    b += rect(30, 20, 380, 320, fill=OK_SOFT, stroke=OK, rx=10)
    b += text(220, 45, "IN SCOPE", 13, "middle", "bold", fill=OK)
    in_items = ["Student catalogue browse/search/filter", "Cart, checkout, Paystack & Flutterwave",
                "Admin catalogue & inventory CRUD", "Push + email notifications",
                "Org-structure (School→Dept→Level)", "FUTA's 57-department catalogue seed"]
    for i, it in enumerate(in_items):
        b += text(55, 75 + i * 40, "• " + it, 11, fill=INK)
    b += rect(430, 20, 380, 320, fill=WARN_SOFT, stroke=WARN, rx=10)
    b += text(620, 45, "OUT OF SCOPE", 13, "middle", "bold", fill=WARN)
    out_items = ["Physical delivery logistics/couriering", "Multi-university catalogue federation",
                 "Peer-to-peer payment splitting", "Digital book lending/reading",
                 "Warehouse robotics or IoT shelving", "Non-FUTA institutional rollout (this study)"]
    for i, it in enumerate(out_items):
        b += text(455, 75 + i * 40, "• " + it, 11, fill=INK)
    svg = figure_frame(840, 360, "Boundary of the present study: what the system does and deliberately does not attempt.", "1.10", b)
    paths["fig1_10"] = save(_f("fig1_10_scope.svg"), svg)

    # 1.11 Real trend chart: Nigeria e-commerce market growth
    years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
    values = [9.2, 10.6, 12.4, 15.0, 19.8, 25.9, 33.0]  # US$ billions; 2023/2026 anchors are reported figures
    b = line_chart(90, 260, 680, 210, [("Nigeria e-commerce market (US$ bn)", PRIMARY, values)],
                   years, y_max=36, y_unit="$")
    b += text(90, 24, "Nigeria E-Commerce Market Size, 2020-2026", 13, "start", "bold")
    svg = figure_frame(820, 300, "Nigeria's e-commerce market growth (anchor figures for 2023 and 2026 as reported by paymentscmi, 2024; intervening years interpolated for illustration).", "1.11", b)
    paths["fig1_11"] = save(_f("fig1_11_market_growth.svg"), svg)

    return paths


# ---------------------------------------------------------------- content --
def write(d, figs):
    d.heading("CHAPTER ONE", level=1, page_break_before=True)
    d.heading("INTRODUCTION", level=1, center=True)
    d.spacer()

    d.heading("1.0 Introduction", level=2, center=False)
    d.body_text(
        "Every university term begins with the same small, repeated inconvenience: a student who "
        "needs a specific textbook has to find it. In principle this should be trivial: the book "
        "either exists in the bookshop or it does not, and it either costs what the student can afford "
        "or it does not. In practice, at a great many campus bookshops, neither fact is available to "
        "the student without first locating a person who happens to know it. This report is about that "
        "gap between what ought to be a two-second lookup and what is, today, a process that can "
        "consume the better part of an afternoon."
    )
    d.body_text(
        "The system developed alongside this report, CURRICULA, is a mobile application built for "
        "students of the Federal University of Technology, Akure (FUTA) that turns a physical, "
        "memory-dependent bookshop into a searchable, price-transparent catalogue, while giving the "
        "bookshop's own staff a parallel set of tools to keep that catalogue current. The remainder of "
        "this chapter sets out, in turn, the background against which the problem arises, the problem "
        "itself in the specific forms it was observed to take, the aim and objectives that follow from "
        "it, why the work is worth doing, and the boundaries within which it was carried out."
    )
    d.figure_svg(figs["fig1_5"], "Conceptual solution: one role-aware mobile app replacing paper, shelves, and phone calls with a shared source of truth.", number="1.5")

    d.heading("1.1 Background of the Study", level=2, center=False)
    d.body_text(
        "University bookshops occupy an odd middle ground in campus commerce. Most are small enough "
        "to run on paper records, a calculator, and one proprietor's memory, yet the population they "
        "serve (an entire faculty's incoming and returning students) is large enough that the resulting "
        "bottlenecks are felt by hundreds of people every registration period. FUTA's "
        "bookshops, like most of their counterparts across Nigerian tertiary institutions, sell "
        "course-specific textbooks organised loosely by department and level, restocked in bursts "
        "around the start of each semester, and priced according to whatever the proprietor last "
        "decided, often without a written, shareable list."
    )
    d.body_text(
        "This arrangement is not unique to Akure. Oyekan et al. (2024) documented near-identical "
        "manual inventory practices at another Nigerian university and built a web-based system in "
        "response. Two independent projects converging on the same complaint, at two different "
        "institutions, is itself evidence that the problem is structural rather than "
        "anecdotal. More broadly, Pinto et al. (2023) found that retail firms in emerging economies "
        "cluster heavily toward the lower end of a digital-maturity scale, with small, owner-operated "
        "outlets consistently the least digitised segment, a description that fits a campus bookshop "
        "almost exactly. Nigeria's wider retail sector has, in the same period, been moving the "
        "opposite way at the aggregate level: mobile-first e-commerce now accounts for the "
        "majority of online transaction volume in the country (paymentscmi, 2024), and Yusuf (2026) "
        "found e-commerce adoption among Nigerian enterprises rising even as infrastructural and "
        "cost barriers persist. The campus bookshop, in other words, sits at the unmodernised edge of a "
        "market that is digitising quickly everywhere else."
    )
    d.figure_svg(figs["fig1_11"], "Nigeria's e-commerce market growth (anchor figures for 2023 and 2026 as reported by paymentscmi, 2024; intervening years interpolated for illustration).", number="1.11")
    d.body_text(
        "Before any of this gets labelled an \"AI\" or \"automation\" problem in the fashionable sense, its "
        "actual character deserves stating plainly: it is an organisational and "
        "economic one. A bookshop that cannot tell a student a price without finding its owner is not "
        "failing because it lacks a recommendation engine or a chatbot. It is failing because it never "
        "built a shared, written record of its own stock and pricing that more than one person could "
        "consult. That is a solvable data-management problem, and it is the one this project set out "
        "to solve. Automation of catalogue lookup and order processing, not artificial intelligence, "
        "is the operative technology, and the report uses that vocabulary throughout on purpose."
    )
    d.body_text(
        "The technical means for closing that gap have also become far more accessible than they were "
        "even five years ago. Cross-platform frameworks such as React Native let a single codebase "
        "serve both Android and iOS users, and Vangavolu (2022) describes an equivalent consolidation on "
        "the backend side with Node.js and Express. Cloud database tiers such as Supabase's free "
        "Postgres offering remove the traditional server-provisioning cost barrier for a student "
        "project, and Nigerian payment aggregators, Paystack and Flutterwave among them, have turned "
        "card and bank-transfer collection into a matter of API integration rather than a merchant-banking "
        "negotiation. None of this infrastructure existed in an affordable form for a lone final-year "
        "project a decade ago. All of it does now, which is what makes a working solution to a "
        "long-standing problem a realistic undertaking within a single academic session."
    )
    d.body_text(
        "That affordability is not automatic, though, and the reasons cloud infrastructure that is "
        "technically free still goes unused by small Nigerian retailers are worth being honest about. Alaqidi "
        "(2022) found that small enterprises adopting cloud services saw genuine gains in information-"
        "management performance, yet Jayeola et al.'s (2022) systematic review of the same adoption "
        "question found awareness and perceived complexity, not price, as the more persistent barrier. "
        "A small shop owner who has never heard that a managed database can be free has no reason to go "
        "looking for one. The same gap shows up on the payment side: sub-Saharan Africa's mobile money "
        "and fintech ecosystem has grown quickly enough that financial inclusion is rising even among "
        "previously unbanked populations, but growth at the ecosystem level has not automatically reached "
        "every retail niche within it (\"Impact of FinTech Adoption,\" 2024). "
        "Nigeria's own e-commerce sector illustrates the same unevenness at a national scale. Overall "
        "online retail has grown rapidly through the 2020s (go-globe, 2024), yet that growth is "
        "concentrated in general marketplaces and large platforms, not in the narrow, institution-specific "
        "niche a campus bookshop occupies. None of this counts as a case against the technology. It is a case "
        "for someone within the affected community (in this instance, a student who has stood in the "
        "queue described in Section 1.2) to build the bridge rather than waiting for the market to build "
        "it unprompted."
    )
    d.body_text(
        "The friction Section 1.2 describes is also not evenly distributed across the academic "
        "calendar, which is worth noting since it shapes how severely the problem is actually felt. "
        "Demand for course textbooks concentrates sharply in the first two to three weeks of each "
        "semester, when hundreds of students across FUTA's 57 departments are simultaneously trying to "
        "identify and buy the specific texts their own department and level require. A manual, "
        "one-person-memory pricing system that is merely inconvenient in week six of the semester "
        "becomes a genuine bottleneck in week one, when the volume of simultaneous price and stock "
        "queries is at its highest and the owner's own attention is most stretched across the shop "
        "floor. This seasonality is precisely why the catalogue's org-structure awareness (Figure 1.6) "
        "matters as much as its existence: a searchable catalogue that still returned results for every "
        "department at once, rather than narrowing immediately to a student's own department and level, "
        "would recreate a smaller version of the same overload during exactly the period it needs to "
        "perform best."
    )

    d.heading("1.2 Problem Statement", level=2, center=False)
    d.body_text(
        "The problem addressed by this study was not assumed in advance; it was pieced together from "
        "direct observation of how students and staff actually behave inside a campus bookshop, and it "
        "is presented here as a set of related symptoms of one underlying cause rather than as a single "
        "abstract statement."
    )
    d.body_text(
        "The first and most visible symptom is physical: a student who wants a specific book has no way "
        "to know, before walking in, whether the bookshop stocks it. The usual recourse is to search "
        "shelf by shelf, row by row, reading spines and covers until the title turns up or the search is "
        "abandoned. There is no catalogue at the door, no printed stock list, and no way, critically, "
        "to check from a hostel room or a lecture hall before making the trip at all. Figure 1.1 sets "
        "out this process as it was observed."
    )
    d.figure_svg(figs["fig1_1"], "Typical manual, shelf-by-shelf textbook search process observed in a traditional university bookshop.", number="1.1")
    d.body_text(
        "The second symptom concerns price, and it is more corrosive than the first because it "
        "cannot be solved by patience alone. In the bookshops observed for this study, pricing "
        "knowledge was concentrated almost entirely in the proprietor. Sales representatives, often "
        "the only staff physically present when a student asks, were frequently unable to quote a "
        "confident, current price, either because prices changed without being communicated to them or "
        "because no shared price list existed for them to consult in the first place. Figure 1.3 "
        "illustrates this concentration: every till point ultimately traces back to one person's memory."
    )
    d.figure_svg(figs["fig1_3"], "Price knowledge concentrated in a single individual creates a bottleneck reproduced at every till point.", number="1.3")
    d.body_text(
        "The third symptom follows from the second: when a representative cannot answer, the "
        "only remaining option is to escalate to the owner, by phone if the owner is off-site or in "
        "person if not. Sales, in this arrangement, do not merely slow down while the confirmation is "
        "sought. They stop outright, because Nigerian campus bookshops observed for this study rarely "
        "authorise staff to quote or adjust a price independently. If the owner is unreachable, "
        "travelling, or simply asleep, the sale is lost for that visit, not merely delayed (Figure 1.2)."
    )
    d.figure_svg(figs["fig1_2"], "Escalation chain created by price/stock knowledge sitting with one person: the owner.", number="1.2")
    d.body_text(
        "A fourth consideration, and one that shaped the technical approach taken in Chapter Three "
        "more than any other, is cost. A sale lost to an unreachable owner (Figure 1.2) is, in effect, "
        "the same lost-revenue event retail research documents under stockouts more broadly. Inventory "
        "that exists but cannot be confirmed to a buyer in time is worth no more to the shop than "
        "inventory that truly is not there (Global Payments, 2024). Whatever is proposed to close "
        "this gap has to be affordable "
        "enough that an ordinary campus bookshop, not a well-capitalised retail chain, could plausibly "
        "adopt something like it, and efficient enough on ordinary student-grade smartphones that "
        "network cost and device capability are not themselves new barriers. A solution that merely "
        "substitutes an expensive point-of-sale terminal and a paid enterprise database for the "
        "existing manual process has not actually solved the affordability half of the problem. It has "
        "just moved it, which is why the technology choices described later in this report lean "
        "on free-tier cloud services and open-source frameworks rather than commercial retail-automation "
        "platforms."
    )
    d.body_text(
        "Nothing about this problem is specific to one bookshop, or even to FUTA, and that claim is "
        "worth stating plainly rather than left implicit. The pattern (manual stock records, "
        "owner-concentrated pricing knowledge, escalation delays, and an absence of any low-cost "
        "digital alternative) is general enough that "
        "a solution built around it should transfer with minor configuration to another university's "
        "bookshop, or indeed to any small retail outlet organised around a similarly narrow, "
        "well-defined catalogue (stationery shops and pharmacies share much of the same structure). "
        "Figure 1.7 places the problem on a local-to-international continuum: it was observed directly "
        "at FUTA, it matches experience independently documented at another Nigerian university, and it "
        "is consistent with the broader finding that small retail firms in emerging economies as a "
        "class lag the digital-maturity curve. Both bodies of work are examined in full in Chapter Two."
    )
    d.figure_svg(figs["fig1_7"], "The problem widens from a directly observed local case to a documented regional and international pattern.", number="1.7")
    d.body_text(
        "Table 1 summarises the four symptoms against the specific mechanism CURRICULA uses to remove "
        "each one; the underlying design decisions are described fully in Chapter Three."
    )
    d.table(
        ["#", "Observed problem", "Root cause", "How CURRICULA addresses it"],
        [
            ["1", "Shelf-by-shelf physical search", "No searchable catalogue exists", "Search + department/level filters, browsable from anywhere"],
            ["2", "Only the owner reliably knows prices", "No shared, written price record", "Price is a server-side field every screen reads identically"],
            ["3", "Sales stall pending owner confirmation", "Staff not authorised/equipped to confirm independently", "Stock and price are live in the app; no phone call needed"],
            ["4", "No affordable automation option adopted", "Commercial POS/retail systems cost more than a small shop can justify", "Free-tier Postgres/Redis, open-source RN/NestJS stack (Ch. 3)"],
        ],
        caption="Mapping of observed problems to root causes and the corresponding system response.",
        number="1",
    )
    d.figure_svg(figs["fig1_4"], "Side-by-side comparison of the manual process and the CURRICULA-mediated process for the same task.", number="1.4")
    d.body_text(
        "Figure 1.8 puts approximate numbers to that comparison, sub-task by sub-task, drawn from this "
        "project's own usability walkthrough (Appendix D) rather than assumed. The largest single gain "
        "shows up in the first step, locating a book at all, exactly because that step is where the "
        "manual process has no shortcut available; every other manual sub-task at least has the option "
        "of asking someone, however unreliably, whereas an unfindable book simply ends the visit."
    )
    d.figure_svg(figs["fig1_8"], "Illustrative time-to-complete comparison per sub-task, manual process vs. the app (values from the project's own usability walkthroughs; see Chapter Three).", number="1.8")
    d.body_text(
        "It would be a mistake to read this problem statement as implying carelessness on the "
        "proprietor's part, and it is worth being explicit about why the manual system persists rather "
        "than simply asserting that it is inefficient. Keeping pricing knowledge personally, rather than "
        "written and shared, is a rational response to a real business risk: a written, staff-accessible "
        "price list is also a price list a competitor, or a student negotiating informally, can exploit "
        "more easily than an unwritten one only the owner controls. The manual system is not an "
        "oversight; it is a low-trust equilibrium that has historically been cheaper to maintain than "
        "the cost of building a system both accurate and secure enough to share safely. What changes "
        "that calculation is not persuading an owner to trust staff more, but removing the trade-off "
        "entirely: a system where price and stock are shared with students openly, verified "
        "server-side, and editable only by an authenticated admin session (Section 3.4.1) gives the "
        "owner the transparency benefit without the exposure risk a paper list would have carried. "
        "Any adoption strategy for a system like CURRICULA has to make that reassurance explicit to a "
        "prospective adopting bookshop, not assume it is obvious."
    )

    d.heading("1.3 Aim", level=2, center=False)
    d.body_text(
        "The aim of this study is to design, build, and evaluate a mobile-based, role-aware bookshop "
        "management application that gives university students self-service access to accurate, "
        "current book prices and stock availability, and gives bookshop staff the tools to keep that "
        "information current, without requiring the proprietor's continuous physical presence."
    )

    d.heading("1.4 Objectives", level=2, center=False)
    d.body_text("In pursuit of that aim, the study set out to:")
    obj_items = [
        "review existing bookshop, inventory-management, and campus e-commerce systems to establish what a comparable solution should and should not repeat (Chapter Two);",
        "design a searchable digital catalogue, organised by school, department, and academic level, that lets a student check a book's price and stock status without staff intervention;",
        "implement a secure cart-to-checkout pipeline integrated with Nigerian payment aggregators (Paystack and Flutterwave) so that a confirmed order carries a verified payment, not a promise of one;",
        "implement a parallel administrative interface, inside the same application and gated by role rather than shipped as a separate app, through which staff maintain catalogue, price, and stock data;",
        "implement push and email notifications so that order-status changes and new-arrival announcements reach a student without a follow-up visit; and",
        "evaluate the resulting system against the problems identified in Section 1.2, using functional testing and a usability comparison against the manual baseline (Chapter Three, Chapter Five).",
    ]
    for it in obj_items:
        d.bullet(it)
    d.spacer()
    d.figure_svg(figs["fig1_9"], "Each stated objective (Section 1.4) is a direct response to one identified problem (Section 1.2).", number="1.9")

    d.heading("1.5 Motivation and Justification", level=2, center=False)
    d.body_text(
        "Three things justify treating this as worth a dedicated project rather than a problem "
        "individual bookshops should simply muddle through. First is scale of nuisance: the manual "
        "process described in Section 1.2 does not fail catastrophically, it fails constantly, in small "
        "increments, for every student who cannot get a fast answer to a simple question, every "
        "semester, at every affected bookshop. Small, frequent frictions of this kind are exactly the "
        "category of problem software is good at removing, because the cost of building the fix is "
        "paid once while the friction it removes recurs indefinitely."
    )
    d.body_text(
        "Second is timing. The enabling technologies discussed in Section 1.1 (free-tier managed "
        "databases, mature cross-platform mobile frameworks, and locally-relevant payment aggregators) "
        "have only become simultaneously available, affordable, and reliable within the last few years. "
        "A project of this kind proposed in 2016 would have needed to build or pay for infrastructure "
        "that today simply exists, ready to be composed. A systematic review of mobile fintech adoption "
        "across sub-Saharan Africa (\"Mobile Fintech Adoption,\" 2024) points to the same "
        "window: the region's payment rails matured enough, recently enough, that building on them is "
        "now the obvious choice rather than a risk."
    )
    d.body_text(
        "Third, and most directly, is personal and institutional relevance: the researcher is a member "
        "of the community the system serves, has observed the problem first-hand at FUTA, and had "
        "direct access to the environment in which to validate a proposed solution, an advantage a "
        "purely theoretical or externally commissioned project would not have had. Building the system "
        "for FUTA specifically, with FUTA's actual 9-school, 57-department, 5-level academic structure "
        "seeded into its catalogue, keeps the evaluation grounded in a real institutional context rather "
        "than a synthetic one."
    )
    d.figure_svg(figs["fig1_6"], "Scope of the seeded catalogue: 9 schools, 57 departments, 5 levels, 1,140 books.", number="1.6")
    d.body_text(
        "A fourth, smaller point is about who the customer actually is. Students are price-sensitive "
        "shoppers by circumstance rather than preference, and the wider literature on online consumer "
        "behaviour finds exactly that sensitivity driving how price-conscious buyers search before they "
        "commit to a purchase (Singh, 2023), a pattern this study's own observation confirms in "
        "miniature every time a student walks an extra row of shelves rather than risk paying a price "
        "they cannot first confirm. A peer institution's own recent investment in a comparable "
        "system (Osman et al., 2024) is a further, practical signal that this is not a problem this "
        "study invented to justify a convenient build; it is one other universities were independently "
        "spending resources to solve around the same time."
    )
    d.body_text(
        "Finally, because the problem and the proposed mechanism are general rather than FUTA-specific "
        "(Section 1.2), the justification extends beyond this one institution: a working, documented "
        "solution here is a template other university bookshops, and structurally similar small "
        "retailers, could adopt with configuration changes rather than a rebuild from first "
        "principles."
    )

    d.heading("1.6 Scope of the Study", level=2, center=False)
    d.body_text(
        "The study is bounded on purpose, both to keep the resulting system buildable within one "
        "academic session and to keep its evaluation honest about what was and was not tested. "
        "In scope: a student-facing catalogue with search, department/level filtering, favourites, "
        "ratings, cart, checkout through Paystack and Flutterwave, order tracking, and push/email "
        "notifications; and an admin-facing surface, inside the same application and gated by role, "
        "covering book and inventory CRUD, order management, organisational-structure (school, "
        "department, level) maintenance, and broadcast notifications. The catalogue seeded for "
        "evaluation covers FUTA's full academic structure: nine schools, fifty-seven departments, five "
        "levels, twenty books per department."
    )
    d.body_text(
        "Out of scope, and flagged here rather than left implicit: physical delivery logistics beyond "
        "an in-app pickup/delivery-method selection, federation of multiple universities' catalogues "
        "into one shared store, peer-to-peer payment splitting for the informal book-exchange feature "
        "built alongside the core system, digital lending or e-book reading, and any warehouse-level "
        "automation such as RFID shelving or robotics. That last exclusion is worth drawing out, given how often "
        "\"inventory automation\" in the retail literature refers to exactly that heavier infrastructure "
        "(Budiyanto & Muslim, 2024; Kathiriya, 2025), rather than the software-only, phone-in-your-hand "
        "automation this project pursues. Rollout beyond FUTA was likewise not attempted within this "
        "study; Section 1.5 argues the design should generalise, but that claim is not itself tested "
        "here."
    )
    d.figure_svg(figs["fig1_10"], "Boundary of the present study: what the system does and deliberately does not attempt.", number="1.10")
