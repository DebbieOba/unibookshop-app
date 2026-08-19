"""Chapter Five content + figures: Summary, Conclusion, Recommendations."""
import os
from svg_gen import (
    box, arrow, text, wrapped_text, figure_frame, rect,
    PRIMARY, PRIMARY_SOFT, ACCENT, ACCENT_SOFT, NEUTRAL, NEUTRAL_SOFT,
    OK, OK_SOFT, WARN, WARN_SOFT, INK, INK_SOFT, save,
)

FIG_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")


def _f(name):
    return os.path.join(FIG_DIR, name)


def build_figures():
    paths = {}

    # 5.1 Objectives achievement checklist
    objectives = [
        ("Review existing bookshop/inventory/e-commerce systems", "Achieved — Chapter Two"),
        ("Design a searchable, department/level-aware catalogue", "Achieved — Section 3.3"),
        ("Implement cart-to-checkout with Paystack & Flutterwave", "Achieved — Figure 3.8"),
        ("Implement a role-gated admin interface in one codebase", "Achieved — Section 2.6, 3.2"),
        ("Implement push + email notifications", "Achieved — Section 3.4"),
        ("Evaluate against Chapter One's problems", "Achieved — Section 5.2 below"),
    ]
    b = ""
    for i, (obj, status) in enumerate(objectives):
        y = 20 + i * 55
        b += rect(20, y, 26, 26, fill=OK_SOFT, stroke=OK, rx=5)
        b += text(33, y + 19, "OK", 11, "middle", "bold", fill=OK)
        b += wrapped_text(370, y + 13, obj, 11, max_chars=48, anchor="middle")
        b += text(770, y + 17, status, 10, "middle", "italic", fill=INK_SOFT)
    svg = figure_frame(900, 20 + len(objectives) * 55 + 10, "Objectives set in Section 1.4, checked against where each is demonstrated in this report.", "5.1", b)
    paths["fig5_1"] = save(_f("fig5_1_objectives_checklist.svg"), svg)

    # 5.2 Problem -> solution -> outcome recap
    b = ""
    cols = [
        ("PROBLEM\n(Ch.1)".replace("\n"," "), ["Shelf-by-shelf search", "Owner-only pricing", "Confirmation delays", "No low-cost option"], WARN_SOFT, WARN),
        ("SOLUTION\n(Ch.3)".replace("\n"," "), ["Searchable catalogue", "Server-side price of record", "Live stock/price in-app", "Free-tier cloud stack"], PRIMARY_SOFT, PRIMARY),
        ("OUTCOME\n(Ch.5)".replace("\n"," "), ["Faster book lookup", "Consistent pricing", "No stalled sales", "Adoptable by other shops"], OK_SOFT, OK),
    ]
    colw = 280
    for c, (title, items, fill, stroke) in enumerate(cols):
        x = 20 + c * (colw + 30)
        b += box(x, 10, colw, 40, title, fill=fill, stroke=stroke, size=12)
        for i, it in enumerate(items):
            y = 65 + i * 55
            b += box(x, y, colw, 42, it, fill="#FFFFFF", stroke=stroke, size=10)
        if c < 2:
            b += arrow(x + colw + 4, 280, x + colw + 26, 280)
    svg = figure_frame(950, 320, "Recap: each Chapter One problem, its Chapter Three solution mechanism, and its observed outcome.", "5.2", b)
    paths["fig5_2"] = save(_f("fig5_2_problem_solution_outcome.svg"), svg)

    # 5.3 Limitations map
    lims = [
        "Evaluated at one institution (FUTA) only — generalisation claimed, not yet tested",
        "Exchange/listing feature is contact-only; no in-app payment for peer resale",
        "No offline mode — a connectivity outage stops catalogue browsing entirely",
        "Usability testing sample was small and drawn from one department cohort",
        "Delivery logistics beyond pickup/delivery-method selection were out of scope",
    ]
    b = ""
    for i, l in enumerate(lims):
        y = 20 + i * 52
        b += box(20, y, 40, 38, str(i + 1), fill=WARN_SOFT, stroke=WARN, size=13)
        b += wrapped_text(470, y + 19, l, 11, max_chars=70, anchor="middle")
    svg = figure_frame(900, 20 + len(lims) * 52 + 10, "Limitations acknowledged in this study, stated plainly rather than left implicit.", "5.3", b)
    paths["fig5_3"] = save(_f("fig5_3_limitations.svg"), svg)

    # 5.4 Future work roadmap
    roadmap = [
        ("Near-term", ["Wire remaining audit logging", "Expand automated test coverage", "Add offline-first catalogue cache"]),
        ("Medium-term", ["Multi-institution catalogue support", "In-app peer-to-peer payment for exchange", "Admin analytics dashboard v2"]),
        ("Long-term", ["Federated catalogue across universities", "Recommendation engine on purchase history", "Native delivery-logistics integration"]),
    ]
    b = ""
    colw = 280
    for c, (title, items) in enumerate(roadmap):
        x = 20 + c * (colw + 30)
        b += box(x, 10, colw, 40, title, fill=ACCENT_SOFT, stroke=ACCENT, size=12)
        for i, it in enumerate(items):
            y = 65 + i * 55
            b += box(x, y, colw, 44, it, fill="#FFFFFF", stroke=ACCENT, size=10)
    svg = figure_frame(950, 250, "Recommended future work, grouped by expected time horizon.", "5.4", b)
    paths["fig5_4"] = save(_f("fig5_4_future_work.svg"), svg)

    # 5.5 Contribution to knowledge
    b = ""
    b += box(30, 30, 260, 90, "Documented, reproducible case:\nlow-cost automation closing a\nspecific small-retail price/stock gap".replace("\n"," "), fill=PRIMARY_SOFT, stroke=PRIMARY, size=10.5)
    b += box(330, 30, 260, 90, "Working reference architecture:\nrole-gated single-codebase\nstudent+admin mobile app".replace("\n"," "), fill=ACCENT_SOFT, stroke=ACCENT, size=10.5)
    b += box(630, 30, 260, 90, "Empirical comparison table (Ch.2)\nof reviewed bookshop/e-commerce\nsystems' feature coverage".replace("\n"," "), fill=OK_SOFT, stroke=OK, size=10.5)
    svg = figure_frame(920, 150, "This study's three principal contributions to the existing body of work reviewed in Chapter Two.", "5.5", b)
    paths["fig5_5"] = save(_f("fig5_5_contribution.svg"), svg)

    # 5.6 Before/after KPI comparison (results)
    kpis = [("Median time to confirm price/stock", "~6 min (ask + wait)", "<10 sec (in-app)"),
            ("Sales lost to unreachable owner", "Observed routinely", "Not possible by design"),
            ("Admin price-update propagation", "Manual, undocumented", "Immediate, single source"),
            ("Payment record kept", "Rarely (cash, no receipt)", "Always (order + receipt)")]
    b = ""
    for i, (metric, before, after) in enumerate(kpis):
        y = 20 + i * 60
        b += wrapped_text(230, y + 20, metric, 10.5, max_chars=28, anchor="middle")
        b += box(480, y, 190, 44, before, fill=WARN_SOFT, stroke=WARN, size=9.7)
        b += box(700, y, 190, 44, after, fill=OK_SOFT, stroke=OK, size=9.7)
    b += text(480 + 95, 12, "BEFORE", 11, "middle", "bold", fill=WARN)
    b += text(700 + 95, 12, "AFTER", 11, "middle", "bold", fill=OK)
    svg = figure_frame(920, 20 + len(kpis) * 60 + 10, "Before/after comparison on the four outcomes most directly tied to Chapter One's problem statement.", "5.6", b)
    paths["fig5_6"] = save(_f("fig5_6_kpi_comparison.svg"), svg)

    # 5.7 Recommendation priority matrix (impact vs effort)
    recs = [
        ("Offline catalogue cache", 80, 60, PRIMARY),
        ("Complete audit logging", 40, 25, OK),
        ("Expand test coverage", 55, 35, OK),
        ("Multi-institution catalogue", 90, 90, ACCENT),
        ("In-app exchange payment", 65, 70, ACCENT),
        ("Admin analytics v2", 45, 50, PRIMARY),
    ]
    x0, size = 80, 380
    y0 = size + 40
    b = ""
    b += rect(x0, y0 - size, size, size, fill="none", stroke="#94A3B8", rx=0)
    b += f'<line x1="{x0+size/2}" y1="{y0-size}" x2="{x0+size/2}" y2="{y0}" stroke="#CBD5E1" stroke-width="1"/>\n'
    b += f'<line x1="{x0}" y1="{y0-size/2}" x2="{x0+size}" y2="{y0-size/2}" stroke="#CBD5E1" stroke-width="1"/>\n'
    b += text(x0 + size / 2, y0 + 22, "Effort ->", 11, "middle", "bold")
    b += text(x0 - 45, y0 - size / 2, "Impact ->", 11, "middle", "bold")
    b += text(x0 + 8, y0 - size + 14, "High impact, low effort (do first)", 9, "start", "italic", fill=INK_SOFT)
    for label, effort, impact, color in recs:
        x = x0 + size * (effort / 100)
        y = y0 - size * (impact / 100)
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="7" fill="{color}"/>\n'
        b += wrapped_text(x, y - 14, label, 9.5, max_chars=18)
    svg = figure_frame(x0 + size + 40, y0 + 60, "Recommended future work (Figure 5.4) plotted by expected impact against implementation effort.", "5.7", b)
    paths["fig5_7"] = save(_f("fig5_7_priority_matrix.svg"), svg)

    # 5.8 Study-at-a-glance infographic
    stats = [("9", "months built"), ("1,140", "books catalogued"), ("57", "departments"),
             ("9", "schools"), ("6/6", "objectives met"), ("N269,500", "direct cost")]
    b = ""
    colw = 145
    for i, (num, label) in enumerate(stats):
        x = 10 + i * colw
        b += box(x, 10, colw - 15, 90, "", fill=PRIMARY_SOFT, stroke=PRIMARY)
        b += text(x + (colw - 15) / 2, 55, num, 20, "middle", "bold", fill=PRIMARY)
        b += wrapped_text(x + (colw - 15) / 2, 80, label, 9.5, max_chars=16)
    svg = figure_frame(10 + len(stats) * colw, 120, "CURRICULA at a glance: the study's headline figures.", "5.8", b)
    paths["fig5_8"] = save(_f("fig5_8_at_a_glance.svg"), svg)

    # 5.9 Lessons learned
    lessons = [
        ("Verify server-side, never trust the client", "The stock-release bug (Section 3.5) existed exactly because a client-reported state was briefly trusted."),
        ("Overlap phases deliberately", "Waiting for literature review to 'finish' before designing would have cost real calendar time for no accuracy gain."),
        ("Free-tier services need a fallback plan", "A local network/firewall issue (Section 3, implementation notes) briefly looked like a Supabase outage."),
        ("Scope the exchange feature down, not up", "A full peer-to-peer marketplace was ruled out early precisely so the core catalogue/checkout scope stayed achievable."),
    ]
    b = ""
    for i, (title, note) in enumerate(lessons):
        y = 20 + i * 80
        b += box(20, y, 260, 60, title, fill=PRIMARY_SOFT, stroke=PRIMARY, size=11)
        b += wrapped_text(650, y + 30, note, 10, max_chars=62, anchor="middle")
        b += arrow(280, y + 30, 380, y + 30)
    svg = figure_frame(940, 20 + len(lessons) * 80 + 10, "Practical lessons drawn from the project that would change how a similar build is approached next time.", "5.9", b)
    paths["fig5_9"] = save(_f("fig5_9_lessons_learned.svg"), svg)

    # 5.10 Project journey recap (start to finish)
    journey = ["Problem\nobserved".replace("\n"," "), "Literature\nreviewed".replace("\n"," "),
               "System\ndesigned".replace("\n"," "), "CURRICULA\nbuilt".replace("\n"," "),
               "Tested &\nevaluated".replace("\n"," "), "Documented\n(this report)".replace("\n"," ")]
    b = ""
    xw = 145
    for i, s in enumerate(journey):
        x = 20 + i * (xw + 25)
        b += box(x, 40, xw, 55, s, fill=OK_SOFT, stroke=OK, size=10.5)
        if i < len(journey) - 1:
            b += arrow(x + xw, 67, x + xw + 25, 67)
    svg = figure_frame(20 + len(journey) * (xw + 25), 120, "The project's journey from an observed problem to this completed, documented system.", "5.10", b)
    paths["fig5_10"] = save(_f("fig5_10_journey.svg"), svg)

    return paths


def write(d, figs):
    d.heading("CHAPTER FIVE", level=1, page_break_before=True)
    d.heading("SUMMARY, CONCLUSION, AND RECOMMENDATIONS", level=1, center=True)
    d.spacer()

    d.heading("5.0 Introduction", level=2, center=False)
    d.body_text(
        "This closing chapter draws the report to a conclusion: it summarises what was built and why, "
        "states plainly what was and was not achieved against the objectives set in Section 1.4, "
        "acknowledges the study's limitations rather than leaving them implicit, and recommends both "
        "immediate next steps for CURRICULA itself and a general path for institutions or researchers "
        "looking to repeat this approach elsewhere."
    )

    d.heading("5.1 Summary of the Study", level=2, center=False)
    d.body_text(
        "The problem this study set out to solve was narrow and concrete: a student at a campus "
        "bookshop, FUTA's among them, had no reliable way to check a book's price or availability "
        "without finding a person who happened to know it, and that person was frequently the shop's "
        "owner alone, reachable only by phone or in-person escalation (Section 1.2). Chapter Two "
        "reviewed the closest comparable systems in the literature and found each solving part of that "
        "problem (a WhatsApp-integrated ordering layer here, an admin-side inventory rebuild there) "
        "but none combining live price transparency, local payment integration, role-gated "
        "administration, and an institution-aware catalogue in one native mobile application (Table 2). "
        "Chapter Three documented the system built to close that gap: CURRICULA, a React Native/NestJS "
        "application serving FUTA's 57-department, 5-level academic structure, integrated with Paystack "
        "and Flutterwave for payment and Firebase/Resend for notification, built and tested across the "
        "nine-month, N269,500 programme documented in Chapter Four."
    )
    d.figure_svg(figs["fig5_8"], "CURRICULA at a glance: the study's headline figures.", number="5.8")

    d.heading("5.2 Summary of Findings", level=2, center=False)
    d.body_text(
        "Measured against the six objectives set in Section 1.4, all six were met to the extent this "
        "single-institution study could test them (Figure 5.1). The catalogue lookup that previously "
        "required a physical search or a staff query is now a search-and-filter operation a student "
        "performs unassisted; price and stock are read from the same server-side fields an admin edits, "
        "removing the owner-dependency escalation traced in Figure 1.2; checkout is verified by "
        "aggregator webhook rather than trusted on the client's word, closing the specific stock-release "
        "bug documented in Section 3.5; and the entire stack was built and operated within free-tier "
        "cloud service limits, directly answering the cost-effectiveness requirement Section 1.2 set as "
        "a condition of any acceptable solution, not an optional nicety."
    )
    d.figure_svg(figs["fig5_1"], "Objectives set in Section 1.4, checked against where each is demonstrated in this report.", number="5.1")
    d.figure_svg(figs["fig5_2"], "Recap: each Chapter One problem, its Chapter Three solution mechanism, and its observed outcome.", number="5.2")
    d.body_text(
        "Figure 5.6 restates that comparison as a direct before/after contrast on the four outcomes closest "
        "to Chapter One's original complaint. None of these four figures were drawn from a formal, "
        "instrumented before/after field trial (a genuine field trial was outside this study's scope), "
        "but each is grounded either in this study's own direct observation of the manual process "
        "(Section 1.2) or in its own testing of the built system (Section 3.7), rather than assumed."
    )
    d.figure_svg(figs["fig5_6"], "Before/after comparison on the four outcomes most directly tied to Chapter One's problem statement.", number="5.6")

    d.heading("5.2.1 Discussion", level=3, center=False)
    d.body_text(
        "It is worth pausing on why all six objectives being met is a modest result rather than a "
        "sweeping one, since overstating it would misrepresent what a single-institution study can "
        "actually support. Meeting an objective, in the terms Section 1.4 set them, meant demonstrating "
        "that a specific mechanism exists and functions: a searchable catalogue exists and returns "
        "correct results, a checkout completes and is webhook-verified, a role-gated admin screen exists "
        "and enforces its role check. None of the six objectives were phrased, deliberately, as claims "
        "about population-level outcomes (\"reduces average time-to-purchase by X%\" or \"increases "
        "student satisfaction by Y points\"), exactly because a single-developer project without a "
        "field-trial budget could not have measured such claims credibly. The usability walkthrough "
        "(Appendix D) and the before/after comparison (Figure 5.6) are the closest this study comes to "
        "an outcome measurement, and both are explicitly small-sample and self-administered rather than "
        "independently observed at scale."
    )
    d.body_text(
        "Read against the literature reviewed in Chapter Two, this result sits comfortably alongside "
        "rather than above the reviewed comparators: the WhatsApp-integrated system's own evaluation "
        "(Section 2.2.1) drew on thirty participants; this study's own usability walkthrough (Appendix "
        "D) is smaller still. What "
        "distinguishes this study's findings is not sample size or statistical strength (neither this "
        "project nor the closest reviewed comparators claim that) but the structural completeness "
        "argued for in Section 2.7's comparison table: every capability CURRICULA implements was "
        "verified to function (Chapter Three's testing), even where how well it is *received* by a full "
        "student population remains, honestly, untested at scale."
    )
    d.body_text(
        "The stock-release bug documented in Section 3.5 deserves a specific mention in this "
        "discussion, because it is the one finding in this study that was neither planned nor "
        "anticipated by the literature review, and arguably the most practically important thing this "
        "project's testing turned up. It illustrates a general point about server-authoritative design "
        "that Section 2.4's discussion of webhook verification argues abstractly: a system that trusts "
        "a client-reported state, even briefly, creates exactly the kind of quiet, hard-to-notice defect "
        "a cancelled payment leaving stock permanently reserved represents. The fact that this project's "
        "own integration testing (Figure 3.14) caught it before the system was evaluated, rather than "
        "after, is itself a small piece of evidence for the layered testing strategy Chapter Three "
        "argued for over relying on manual QA alone."
    )

    d.heading("5.3 Conclusion", level=2, center=False)
    d.body_text(
        "The central claim this report has argued is a modest one: that a campus bookshop's core "
        "friction is a data-sharing problem before it is anything more technically ambitious, and that "
        "closing it does not require the enterprise retail-automation infrastructure the wider "
        "literature on RFID and warehouse-scale systems tends to assume (Section 1.6). A searchable "
        "catalogue, a server-side price of record, and a payment integration already built for the "
        "Nigerian market were sufficient to remove the specific frictions documented in Section 1.2. "
        "Read against Pinto et al.'s (2023) finding that small emerging-economy retailers cluster at the "
        "least digitally mature end of their sector, this project is best understood as one documented "
        "step along exactly that maturity path for one small retailer: modest in scope, but concrete "
        "and, per Chapter Three's testing, working."
    )
    d.body_text(
        "Four practical lessons from the build are worth carrying into any similar project (Figure "
        "5.9): verify state changes server-side rather than trusting a client's report, since the one "
        "confirmed production bug in this project came from doing the opposite; deliberately overlap "
        "adjacent phases rather than sequencing them strictly, since waiting for one activity to fully "
        "finish before starting the next cost real calendar time in early planning drafts of this "
        "schedule for no corresponding gain in accuracy; treat a free-tier cloud dependency as a "
        "single point of failure until proven otherwise, since a plain network-configuration issue on "
        "one development machine was briefly mistaken for a genuine service outage; and scope an "
        "adjacent feature down rather than up when time is fixed, which is the specific reasoning "
        "behind keeping the book-exchange feature contact-only rather than a full marketplace."
    )
    d.figure_svg(figs["fig5_9"], "Practical lessons drawn from the project that would change how a similar build is approached next time.", number="5.9")

    d.heading("5.4 Limitations", level=2, center=False)
    d.body_text(
        "Five limitations bound how far these conclusions should be read. The evaluation is grounded in "
        "one institution; the claim that the approach generalises to other campus bookshops (Section "
        "1.5) is argued from structural similarity, not demonstrated by a second deployment. The "
        "book-exchange feature is deliberately contact-only and carries no in-app payment, a scope "
        "decision made explicitly rather than an oversight (see the project's implementation notes). "
        "The application has no offline mode, so a connectivity interruption stops catalogue access "
        "outright rather than degrading gracefully. Usability testing drew on a modest, single-cohort "
        "sample, which limits how confidently its findings generalise across FUTA's full student body. "
        "And delivery logistics were scoped only as far as an in-app method selection, not an "
        "integrated courier or tracking system."
    )
    d.figure_svg(figs["fig5_3"], "Limitations acknowledged in this study, stated plainly rather than left implicit.", number="5.3")

    d.heading("5.5 Recommendations", level=2, center=False)
    d.body_text(
        "For CURRICULA specifically: complete the audit-logging coverage flagged as outstanding in the "
        "project's own implementation notes, expand automated test coverage into the modules "
        "(notifications, most of admin) that currently have the thinnest coverage, and add an "
        "offline-tolerant catalogue cache so a network blip degrades the experience rather than halting "
        "it. For institutions considering a comparable system: the technology stack argued for in "
        "Chapter Three (a modular-monolith backend on free-tier managed services, a single "
        "cross-platform mobile codebase, and a local payment aggregator) is a reasonable default "
        "starting point, though Yusuf's (2026) finding that infrastructural and cost barriers persist "
        "even as Nigerian e-commerce adoption grows is a reminder that connectivity and device access, "
        "not software architecture, may be the binding constraint at a different institution. For "
        "future researchers: Figure 5.4 groups concrete next steps by time horizon, from near-term "
        "hardening of the current system through to a longer-term, multi-institution federated "
        "catalogue that would let this study's generalisation claim actually be tested rather than "
        "merely argued."
    )
    d.figure_svg(figs["fig5_4"], "Recommended future work, grouped by expected time horizon.", number="5.4")
    d.body_text(
        "Not every near-term item is equally worth doing first. Figure 5.7 plots the same "
        "recommendations by expected impact against implementation effort: completing audit logging "
        "and expanding test coverage sit in the high-impact, low-effort quadrant and are recommended as "
        "the immediate next steps, ahead of the structurally larger multi-institution catalogue work, "
        "which promises the largest impact but also carries the largest effort and is better suited to "
        "a follow-on project than an incremental addition to this one."
    )
    d.figure_svg(figs["fig5_7"], "Recommended future work (Figure 5.4) plotted by expected impact against implementation effort.", number="5.7")

    d.heading("5.6 Contribution to Knowledge", level=2, center=False)
    d.body_text(
        "This study contributes, first, a documented and reproducible case of low-cost automation "
        "closing a specific, previously under-addressed small-retail friction; second, a working "
        "reference architecture for a role-gated, single-codebase student-and-admin mobile application "
        "that other final-year projects facing a similar dual-audience requirement can adapt directly; "
        "and third, the comparison in Table 2, which did not exist in this consolidated form prior to "
        "this study and which future work in this specific niche can extend rather than rebuild from "
        "scratch."
    )
    d.figure_svg(figs["fig5_5"], "This study's three principal contributions to the existing body of work reviewed in Chapter Two.", number="5.5")
    d.body_text(
        "Figure 5.10 closes the report where Chapter One began: an observed problem, worked through "
        "review, design, build, and test, into the documented system this report describes."
    )
    d.figure_svg(figs["fig5_10"], "The project's journey from an observed problem to this completed, documented system.", number="5.10")
