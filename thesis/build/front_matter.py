"""Front matter: title page, certification, dedication, acknowledgement,
abstract, table of contents, list of figures, list of tables.

Personal/institutional fields the user has not yet supplied are left as
clearly bracketed placeholders -- swap them out before submission.
"""

PLACEHOLDER = {
    "university": "FEDERAL UNIVERSITY OF TECHNOLOGY, AKURE",
    "university_short": "FUTA",
    "faculty": "[Your School/Faculty, e.g., School of Computing]",
    "department": "[Your Department, e.g., Department of Software Engineering]",
    "programme": "[Your Degree Programme, e.g., B.Tech. Software Engineering]",
    "student_name": "[Your Full Name]",
    "matric_no": "[Your Matriculation Number]",
    "supervisor": "[Supervisor's Name and Title]",
    "hod": "[Head of Department's Name and Title]",
    "month_year": "August 2026",
    "title": "DESIGN AND IMPLEMENTATION OF CURRICULA: A MOBILE-BASED AUTOMATED "
              "BOOKSHOP MANAGEMENT SYSTEM FOR UNIVERSITY STUDENTS",
}


def write(d, p=None):
    p = p or PLACEHOLDER

    # ---- Title page ----
    d.spacer(); d.spacer(); d.spacer()
    d.paragraph([{"text": p["title"], "bold": True, "size": 15}], align="center", spacing_after=280)
    d.paragraph("BY", align="center", spacing_after=120)
    d.paragraph([{"text": p["student_name"], "bold": True, "size": 13}], align="center", spacing_after=60)
    d.paragraph([{"text": p["matric_no"], "size": 12}], align="center", spacing_after=280)
    d.paragraph(
        f"A project report submitted to the {p['department']}, {p['faculty']}, "
        f"{p['university']}, in partial fulfilment of the requirements for the award of "
        f"{p['programme']}.",
        align="center",
    )
    d.spacer(); d.spacer()
    d.paragraph([{"text": p["month_year"], "bold": True, "size": 12}], align="center")
    d.page_break()

    # ---- Certification ----
    d.heading("CERTIFICATION", level=1, center=True)
    d.spacer()
    d.body_text(
        f"This is to certify that this project was carried out by {p['student_name']} "
        f"({p['matric_no']}) in the {p['department']}, {p['faculty']}, {p['university']}, "
        f"under my supervision, and is approved as meeting the requirements for the award of "
        f"{p['programme']}."
    )
    d.spacer(); d.spacer()
    d.paragraph("_______________________________", spacing_after=40)
    d.paragraph(f"{p['supervisor']}", spacing_after=20)
    d.paragraph("Project Supervisor", spacing_after=20)
    d.paragraph("Date: ______________________", spacing_after=280)
    d.paragraph("_______________________________", spacing_after=40)
    d.paragraph(f"{p['hod']}", spacing_after=20)
    d.paragraph("Head of Department", spacing_after=20)
    d.paragraph("Date: ______________________")
    d.page_break()

    # ---- Dedication ----
    d.heading("DEDICATION", level=1, center=True)
    d.spacer()
    d.paragraph(
        "This work is dedicated to every student who has ever walked an extra row of shelves "
        "looking for a book they were not sure the shop even had, and to the family whose support "
        "made the time to build something about it possible.",
        align="center",
    )
    d.page_break()

    # ---- Acknowledgement ----
    d.heading("ACKNOWLEDGEMENT", level=1, center=True)
    d.spacer()
    d.body_text(
        "I am grateful to God for strength and clarity through the course of this project. My "
        f"sincere thanks go to my supervisor, {p['supervisor']}, for the guidance, patience, and "
        f"critical feedback that shaped this work from a rough idea into a finished system and "
        f"report. I thank the Head of Department, {p['hod']}, and the entire academic staff of the "
        f"{p['department']} for the training that made this project possible."
    )
    d.body_text(
        "I thank my family for their unwavering support, encouragement, and patience throughout "
        "this programme, and my friends and course-mates for the countless conversations, "
        "informal usability testing, and moral support along the way. Finally, I thank the "
        "bookshop staff and students who patiently answered questions during the observation that "
        "grounded Chapter One in a real workplace rather than an assumed one."
    )
    d.page_break()

    # ---- Abstract ----
    d.heading("ABSTRACT", level=1, center=True)
    d.spacer()
    d.body_text(
        "University bookshops in Nigeria, and at the Federal University of Technology, Akure "
        "(FUTA) specifically, are typically run on paper records and a proprietor's memory: a "
        "student wanting to know whether a textbook is in stock, and at what price, usually has no "
        "way to find out without searching the shelves in person and, failing that, asking a sales "
        "representative who is frequently unable to give a confident answer without the owner's "
        "confirmation. This study designed, built, and evaluated CURRICULA, a mobile bookshop "
        "management application intended to close that gap. The system, built on a React Native "
        "(Expo) mobile client and a NestJS/PostgreSQL backend, gives students a searchable "
        "catalogue organised by school, department, and academic level, with live price and stock "
        "visibility, cart-based checkout integrated with the Paystack and Flutterwave payment "
        "aggregators, and push/email notifications; and gives bookshop staff a role-gated "
        "administrative interface, inside the same codebase, for maintaining that catalogue and "
        "processing orders directly. An Agile, sprint-based methodology was followed across a "
        "nine-month development programme, and the resulting system was validated through unit and "
        "integration testing, a heuristic usability walkthrough, and a comparison against the "
        "manual baseline it replaces. The literature reviewed found related bookshop and campus-"
        "commerce systems each addressing part of this problem but none combining live price "
        "transparency, local payment integration, role-gated administration, and an institution-"
        "aware catalogue in a single native application. The completed system met all six "
        "objectives set for it, was built and operated within free-tier cloud service limits at a "
        "direct cost of approximately N269,500, and is argued, on structural grounds, to generalise "
        "to comparably organised small retailers beyond FUTA, though that generalisation was not "
        "itself tested within this single-institution study."
    )
    d.body_text(
        [{"text": "Keywords: ", "bold": True},
         {"text": "bookshop automation; mobile commerce; inventory management; university e-commerce; "
                   "React Native; NestJS; Paystack; Flutterwave; role-based access control."}]
    )
    d.page_break()

    # ---- Table of Contents ----
    d.heading("TABLE OF CONTENTS", level=1, center=True)
    d.spacer()
    d.toc_field()
    d.page_break()

    # ---- List of Figures ----
    from extract_lists import extract, _sort_key
    figs, tabs = extract(["chapter1.py", "chapter2.py", "chapter3.py", "chapter4.py", "chapter5.py", "back_matter.py"])
    figs.sort(key=_sort_key)
    tabs.sort(key=_sort_key)

    d.heading("LIST OF FIGURES", level=1, center=True)
    d.spacer()
    for number, caption in figs:
        d.paragraph(
            [{"text": f"Figure {number}. ", "bold": True}, {"text": caption}],
            spacing_after=90, line=276,
        )
    d.page_break()

    # ---- List of Tables ----
    d.heading("LIST OF TABLES", level=1, center=True)
    d.spacer()
    for number, caption in tabs:
        d.paragraph(
            [{"text": f"Table {number}. ", "bold": True}, {"text": caption}],
            spacing_after=90, line=276,
        )
