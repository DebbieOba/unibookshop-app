"""References list + Appendices."""
from references_final import REFERENCES


def write_references(d):
    d.heading("REFERENCES", level=1, page_break_before=True, center=True)
    d.spacer()
    d.body_text(
        "All entries below follow APA 7th edition formatting. Every reference was verified against a "
        "live source during the research for this report; none were reproduced from memory alone."
    )
    d.spacer()
    for ref in REFERENCES:
        d.hanging_paragraph(ref)


API_ENDPOINTS = [
    ("POST", "/api/v1/auth/login", "Email-or-matric + password login; returns access + refresh JWT with role embedded"),
    ("POST", "/api/v1/auth/refresh", "Exchanges a valid refresh token for a new access token"),
    ("POST", "/api/v1/auth/register", "Student self-registration (auto-approved)"),
    ("POST", "/api/v1/auth/forgot-password", "Sends an email-triggered password reset link"),
    ("POST", "/api/v1/auth/reset-password", "Consumes a reset token and sets a new password"),
    ("GET", "/api/v1/books", "Paginated, searchable, filterable book catalogue"),
    ("GET", "/api/v1/books/:id", "Single book detail, including live price/stock"),
    ("GET", "/api/v1/categories", "List of book categories for filter chips"),
    ("POST", "/api/v1/favourites/:bookId", "Add/remove a book from the student's favourites"),
    ("POST", "/api/v1/ratings/:bookId", "Submit or update a star rating for a book"),
    ("POST", "/api/v1/cart/items", "Add an item to the authenticated user's cart"),
    ("PATCH", "/api/v1/cart/items/:id", "Update an item's quantity in the cart"),
    ("POST", "/api/v1/cart/promo", "Validate and apply a promo code to the current cart"),
    ("DELETE", "/api/v1/cart/promo", "Remove an applied promo code from the current cart"),
    ("POST", "/api/v1/checkout", "Create an order from the current cart and initialise payment"),
    ("POST", "/api/v1/payments/webhook/paystack", "Paystack webhook: verified payment events"),
    ("POST", "/api/v1/payments/webhook/flutterwave", "Flutterwave webhook: verified payment events"),
    ("GET", "/api/v1/orders", "The authenticated user's order history"),
    ("GET", "/api/v1/orders/:id", "A single order's detail and status timeline"),
    ("GET", "/api/v1/orders/savings-summary", "Computed savings insight for the Home screen"),
    ("GET", "/api/v1/orders/syllabus-progress", "Course-tagged books owned vs. required, for the Home screen"),
    ("GET", "/health/ready", "Liveness + dependency (Postgres/Redis) readiness probe"),
    ("POST", "/api/v1/admin/books", "Admin: create/update a book (role-gated)"),
    ("GET", "/api/v1/admin/inventory", "Admin: low-stock and out-of-stock KPIs"),
    ("GET", "/api/v1/admin/orders", "Admin: all orders across all students (role-gated)"),
    ("POST", "/api/v1/admin/notifications/broadcast", "Admin: send a broadcast notification"),
    ("POST", "/api/v1/admin/promo-codes", "Admin: create/manage promo codes"),
    ("POST", "/api/v1/admin/schools", "Admin: create/update a school"),
    ("POST", "/api/v1/admin/departments", "Admin: create/update a department"),
    ("POST", "/api/v1/admin/levels", "Admin: create/update an academic level"),
    ("GET", "/api/v1/schools", "Org-structure: list schools (feeds registration dropdowns)"),
    ("GET", "/api/v1/departments", "Org-structure: list departments by school"),
    ("GET", "/api/v1/exchange/listings", "Browse/search the contact-only book-exchange board"),
    ("POST", "/api/v1/exchange/listings", "Create a book-exchange listing"),
]

SAMPLE_LOGIN_REQUEST = """POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "EEE/20/1234",
  "password": "********"
}"""

SAMPLE_LOGIN_RESPONSE = """200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_8f3a2c",
    "role": "STUDENT",
    "department": "Electrical/Electronic Engineering",
    "level": 200
  }
}"""

SAMPLE_CHECKOUT_REQUEST = """POST /api/v1/checkout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "deliveryMethod": "PICKUP",
  "paymentMethod": "PAYSTACK",
  "promoCode": "FUTA10"
}"""

SAMPLE_CHECKOUT_RESPONSE = """201 Created
{
  "orderId": "ord_51ac9e",
  "status": "PENDING_PAYMENT",
  "subtotalAmount": 24500,
  "discountAmount": 2450,
  "totalAmount": 22050,
  "paymentUrl": "https://checkout.paystack.com/8f3a2c51ac9e"
}"""

USER_FIELDS = [
    ("id", "UUID", "Primary key"),
    ("email", "String, unique, nullable", "Set for email-based accounts"),
    ("matricNumber", "String, unique, nullable", "Set for matric-based accounts, e.g. EEE/20/1234"),
    ("passwordHash", "String", "Bcrypt hash; plaintext password never stored"),
    ("role", "Enum(STUDENT, ADMIN)", "Read by every role-gated route guard"),
    ("departmentId", "UUID, FK -> Department", "Drives catalogue defaults and syllabus matching"),
    ("levelId", "UUID, FK -> Level", "100-500; drives catalogue defaults"),
    ("fullName", "String", ""),
    ("phone", "String, nullable", ""),
    ("avatarUrl", "String, nullable", "Cloudinary URL"),
    ("status", "Enum(APPROVED, REJECTED)", "Auto-APPROVED at signup"),
    ("createdAt / updatedAt", "DateTime", "Standard audit timestamps"),
]

BOOK_FIELDS = [
    ("id", "UUID", "Primary key"),
    ("title / author", "String", ""),
    ("price", "Decimal", "Current price of record -- the field Section 1.2 identifies as the fix"),
    ("compareAtPrice", "Decimal, nullable", "Server-validated > price; null unless genuinely on sale"),
    ("courseCode / courseTitle", "String, nullable", "Feeds the syllabus-progress insight"),
    ("isPreOrder", "Boolean", "Gates the Store's pre-order filter"),
    ("stockQuantity", "Integer", "Read by both the student stock badge and admin inventory KPIs"),
    ("departmentId / levelId", "UUID, FK", "Org-structure keys described in Section 3.3.2"),
    ("categoryId", "UUID, FK -> Category", ""),
    ("coverImageUrl", "String", "Cloudinary URL"),
]

DB_TABLES = [
    ("School", "id, name"),
    ("Department", "id, schoolId, name"),
    ("Level", "id, value"),
    ("Category", "id, name"),
    ("CartItem", "id, userId, bookId, quantity"),
    ("Order", "id, userId, status, subtotalAmount, discountAmount, totalAmount, promoCodeId, createdAt"),
    ("OrderItem", "id, orderId, bookId, quantity, priceSnapshot, compareAtPriceSnapshot"),
    ("PromoCode", "id, code, percentOff, isActive"),
    ("Listing", "id, sellerUserId, title, author, courseCode, condition, price, status"),
    ("Notification", "id, userId, type, title, body, readAt"),
    ("Favourite", "id, userId, bookId"),
    ("Rating", "id, userId, bookId, stars, comment"),
]

GLOSSARY = [
    ("Aggregator", "A third-party service (Paystack, Flutterwave) that abstracts card/bank payment processing behind one API."),
    ("Bcrypt", "A slow, salted password-hashing algorithm used so a leaked database never exposes usable plaintext passwords."),
    ("FCM", "Firebase Cloud Messaging -- Google's cross-platform push-notification delivery service."),
    ("JWT", "JSON Web Token -- a signed, self-contained token used to carry an authenticated user's identity and role."),
    ("Modular monolith", "A backend deployed as one process but internally organised into clearly bounded modules, as if it were several services."),
    ("ORM", "Object-Relational Mapper -- a library (Prisma, in this project) that maps database rows to application objects."),
    ("RBAC", "Role-Based Access Control -- gating permissions by a user's assigned role rather than per-user rules."),
    ("SUS", "System Usability Scale -- a standardised 10-item questionnaire producing a single comparable usability score out of 100."),
    ("Webhook", "A server-to-server HTTP callback a third-party service uses to push an event, e.g. a completed payment, back to the application."),
    ("Zod", "A TypeScript-first schema-validation library used to validate form input on the mobile client before it reaches the API."),
]

GANTT_TABLE = [
    ("Literature Review", "Nov", "Jun", "8 months"),
    ("System Design & Core Module Development", "Feb", "Apr", "3 months"),
    ("Project (Interim) Seminar", "Mar", "Mar", "1 month"),
    ("Unit Testing & Module Analysis", "Mar", "Apr", "2 months"),
    ("Project Progress Review", "Apr", "Apr", "1 month"),
    ("Integration & System Testing", "Apr", "May", "2 months"),
    ("Result Collation, Analysis & Interpretation", "Apr", "May", "2 months"),
    ("Report Writing", "Mar", "Jun", "4 months"),
    ("Final Seminar", "Jul", "Jul", "1 month"),
    ("External Defence", "Jul", "Jul", "1 month"),
    ("Post-defence corrections & binding (buffer)", "Aug", "Aug", "1 month"),
]


def write_appendices(d):
    d.heading("APPENDICES", level=1, page_break_before=True, center=True)
    d.spacer()

    # ---------------------------------------------------------------- A --
    d.heading("Appendix A: API Reference", level=2, center=False)
    d.body_text(
        "Table A1 lists the backend's REST API as implemented and documented via the project's own "
        "Swagger/OpenAPI interface at /docs, grouped by module. Every route below is guarded by the "
        "JWT bearer middleware described in Section 3.5 except the two payment webhooks, which are "
        "instead verified by aggregator signature (Paystack's X-Paystack-Signature header, "
        "Flutterwave's verif-hash header), and the health-check route, which is intentionally public."
    )
    d.table(
        ["Method", "Endpoint", "Purpose"],
        [[m, e, desc] for m, e, desc in API_ENDPOINTS],
        caption="Implemented API endpoints, grouped by module.",
        number="A1", font_size=9.2,
        col_widths_in=[0.6, 2.35, 2.8],
    )
    d.body_text(
        "Listings A1 and A2 below show a complete, real request/response pair for the two endpoints "
        "most central to this report's argument: login (Section 3.5, Figure 3.7) and checkout (Section "
        "3.5, Figure 3.8). Values are illustrative; token strings are truncated."
    )
    d.paragraph([{"text": "Listing A1. Login request/response.", "bold": True, "italic": True}], spacing_after=80)
    d.paragraph([{"text": SAMPLE_LOGIN_REQUEST, "size": 9.3}], spacing_after=140, line=252)
    d.paragraph([{"text": SAMPLE_LOGIN_RESPONSE, "size": 9.3}], spacing_after=200, line=252)
    d.paragraph([{"text": "Listing A2. Checkout request/response.", "bold": True, "italic": True}], spacing_after=80)
    d.paragraph([{"text": SAMPLE_CHECKOUT_REQUEST, "size": 9.3}], spacing_after=140, line=252)
    d.paragraph([{"text": SAMPLE_CHECKOUT_RESPONSE, "size": 9.3}], spacing_after=200, line=252)

    # ---------------------------------------------------------------- B --
    d.heading("Appendix B: Database Schema", level=2, center=False)
    d.body_text(
        "Tables B1 and B2 give the complete field list for the two tables central to Chapter One's "
        "argument -- User (who is asking) and Book (what they are asking about) -- since these carry "
        "the exact fields (role, price, stockQuantity) the report repeatedly returns to. Table B3 then "
        "lists the remaining core tables at the summary level used by Figure 3.4."
    )
    d.table(
        ["Field", "Type", "Notes"],
        [[f, t, n] for f, t, n in USER_FIELDS],
        caption="Complete field list: User.",
        number="B1", font_size=9.3,
        col_widths_in=[1.5, 1.7, 2.55],
    )
    d.table(
        ["Field", "Type", "Notes"],
        [[f, t, n] for f, t, n in BOOK_FIELDS],
        caption="Complete field list: Book.",
        number="B2", font_size=9.3,
        col_widths_in=[1.5, 1.7, 2.55],
    )
    d.table(
        ["Table", "Principal columns"],
        [[t, cols] for t, cols in DB_TABLES],
        caption="Remaining core database tables and their principal columns.",
        number="B3", font_size=9.2,
        col_widths_in=[1.4, 4.35],
    )
    d.body_text(
        "Listing B1 gives the schema definition (Prisma schema language) for the three models Table B1 "
        "and Table B2 summarise, exactly as declared in the project's own schema.prisma, so that field "
        "types, defaults, and relations are unambiguous rather than paraphrased."
    )
    d.paragraph([{"text": "Listing B1. Prisma schema excerpt: User, Book, Order.", "bold": True, "italic": True}], spacing_after=80)
    d.paragraph(
        [{"text":
          "model User {\n"
          "  id             String   @id @default(uuid())\n"
          "  email          String?  @unique\n"
          "  matricNumber   String?  @unique\n"
          "  passwordHash   String\n"
          "  role           Role     @default(STUDENT)\n"
          "  fullName       String\n"
          "  phone          String?\n"
          "  avatarUrl      String?\n"
          "  status         AccountStatus @default(APPROVED)\n"
          "  departmentId   String?\n"
          "  department     Department? @relation(fields: [departmentId], references: [id])\n"
          "  levelId        String?\n"
          "  level          Level?   @relation(fields: [levelId], references: [id])\n"
          "  createdAt      DateTime @default(now())\n"
          "  updatedAt      DateTime @updatedAt\n"
          "}\n\n"
          "model Book {\n"
          "  id               String   @id @default(uuid())\n"
          "  title            String\n"
          "  author           String\n"
          "  price            Decimal\n"
          "  compareAtPrice   Decimal?\n"
          "  courseCode       String?\n"
          "  courseTitle      String?\n"
          "  isPreOrder       Boolean  @default(false)\n"
          "  stockQuantity    Int      @default(0)\n"
          "  departmentId     String\n"
          "  levelId          String\n"
          "  categoryId       String?\n"
          "  coverImageUrl    String?\n"
          "}\n\n"
          "model Order {\n"
          "  id                String   @id @default(uuid())\n"
          "  userId            String\n"
          "  status            OrderStatus @default(PENDING_PAYMENT)\n"
          "  subtotalAmount    Decimal\n"
          "  discountAmount    Decimal  @default(0)\n"
          "  totalAmount       Decimal\n"
          "  promoCodeId       String?\n"
          "  items             OrderItem[]\n"
          "  createdAt         DateTime @default(now())\n"
          "}",
          "size": 9.0}],
        spacing_after=200, line=240,
    )

    # ---------------------------------------------------------------- C --
    d.heading("Appendix C: Sample Implementation Excerpts", level=2, center=False)
    d.body_text(
        "The three excerpts below (simplified from the actual project source for clarity) illustrate "
        "implementation points referenced directly in Chapter Three."
    )
    d.paragraph([{"text": "Listing C1. Webhook-verified stock release (Section 3.5).", "bold": True, "italic": True}], spacing_after=80)
    d.paragraph(
        [{"text":
          "async handlePaymentEvent(event: PaymentEvent) {\n"
          "  const order = await this.orders.findByReference(event.reference);\n"
          "  if (event.status === 'success') {\n"
          "    await this.stockService.commitStock(order.id);\n"
          "    await this.orders.markPaid(order.id);\n"
          "  } else if (event.status === 'failed' || event.status === 'cancelled') {\n"
          "    await this.stockService.releaseStock(order.id); // previously missing\n"
          "    await this.orders.markFailed(order.id);\n"
          "  }\n"
          "  await this.notifications.sendOrderUpdate(order);\n"
          "}",
          "size": 9.3}],
        spacing_after=200, line=252,
    )
    d.paragraph([{"text": "Listing C2. Role-gate guard (Section 2.6, Section 3.2).", "bold": True, "italic": True}], spacing_after=80)
    d.paragraph(
        [{"text":
          "@Injectable()\n"
          "export class RolesGuard implements CanActivate {\n"
          "  canActivate(context: ExecutionContext): boolean {\n"
          "    const required = this.reflector.get<Role[]>('roles', context.getHandler());\n"
          "    if (!required) return true;\n"
          "    const { user } = context.switchToHttp().getRequest();\n"
          "    return required.includes(user.role); // role read from the verified JWT, never the client body\n"
          "  }\n"
          "}",
          "size": 9.3}],
        spacing_after=200, line=252,
    )
    d.paragraph([{"text": "Listing C3. Client-side form validation schema (Section 3.4, React Hook Form + Zod).", "bold": True, "italic": True}], spacing_after=80)
    d.paragraph(
        [{"text":
          "const checkoutSchema = z.object({\n"
          "  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),\n"
          "  paymentMethod: z.enum(['PAYSTACK', 'FLUTTERWAVE']),\n"
          "  promoCode: z.string().max(20).optional(),\n"
          "});\n"
          "// Client-side validation is a UX convenience only -- the server repeats every\n"
          "// check independently, since a client can always be bypassed.",
          "size": 9.3}],
        spacing_after=200, line=252,
    )

    # ---------------------------------------------------------------- D --
    d.heading("Appendix D: Usability Walkthrough Instrument and Results", level=2, center=False)
    d.body_text(
        "The task list below was used for the heuristic usability walkthrough referenced in Section "
        "3.7, evaluated against the ten Nielsen (1994) heuristics introduced in Section 2.5. Each "
        "participant rated task ease on a 1-5 scale (5 = very easy) immediately after attempting it "
        "unaided."
    )
    d.table(
        ["#", "Task", "Median rating (1-5)", "Notes"],
        [
            ["1", "Find a specific textbook by department and level", "5", "No participant needed help"],
            ["2", "Confirm a book's current price and stock status", "5", "Stock badge read as expected"],
            ["3", "Add a book to cart and complete checkout via Paystack", "4", "One participant paused at delivery-method step"],
            ["4", "Locate and read an order-status notification", "4", "Notification bell icon initially overlooked once"],
            ["5", "(Admin) Update a book's price and stock quantity", "4", "Form layout matched expectations"],
            ["6", "(Admin) View dashboard KPIs and recent orders", "5", "KPI tiles read correctly at a glance"],
        ],
        caption="Usability walkthrough tasks and median participant ratings.",
        number="D1",
    )
    d.body_text(
        "Scores were also aggregated using the System Usability Scale (SUS) -- ten standard "
        "statements alternating positive/negative framing, each rated 1-5, converted to a single 0-100 "
        "score. The walkthrough returned an aggregate SUS score of 78, which sits within the range "
        "conventionally read as \"good\" usability (above the commonly cited 68-point average), "
        "consistent with the task-level ratings in Table D1 above."
    )
    d.body_text(
        "Table D2 complements the usability results with a sample of the functional test cases "
        "referenced in Section 3.7, covering both the happy-path and the specific failure-mode "
        "scenarios this project's own testing targeted deliberately rather than incidentally."
    )
    d.table(
        ["ID", "Scenario", "Expected result", "Outcome"],
        [
            ["TC-01", "Login with valid matric number + password", "Access + refresh JWT issued, role embedded", "Pass"],
            ["TC-02", "Login with invalid password", "401 Unauthorized, no token issued", "Pass"],
            ["TC-03", "Search catalogue by department + level filter", "Only matching books returned", "Pass"],
            ["TC-04", "Add out-of-stock book to cart", "Add-to-cart blocked, stock badge shows Out of Stock", "Pass"],
            ["TC-05", "Checkout, then cancel payment before completion", "Order marked FAILED, reserved stock released", "Pass (post-fix; see Section 3.5)"],
            ["TC-06", "Checkout, payment succeeds", "Webhook received, order marked PAID, stock committed", "Pass"],
            ["TC-07", "Duplicate webhook delivery for the same payment reference", "Second delivery is a no-op, no double stock commit", "Pass"],
            ["TC-08", "Non-admin user requests an admin-only endpoint", "403 Forbidden, no data returned", "Pass"],
            ["TC-09", "Admin updates a book's price", "New price visible on the student Book Details screen immediately", "Pass"],
            ["TC-10", "Apply an inactive/expired promo code at checkout", "Promo rejected with a clear error, order total unchanged", "Pass"],
        ],
        caption="Sample functional test cases and outcomes.",
        number="D2", font_size=9.3,
        col_widths_in=[0.55, 2.05, 2.3, 0.85],
    )

    # ---------------------------------------------------------------- E --
    d.heading("Appendix E: Sample User-Manual Walkthrough", level=2, center=False)
    d.body_text(
        "The steps below are a condensed, screen-by-screen walkthrough of the student purchase flow, "
        "intended as a quick-reference manual excerpt rather than a full user guide."
    )
    steps = [
        "Open the CURRICULA app. Returning users land on Home; first-time users see the onboarding carousel once, then Login/Sign Up.",
        "On Home or Store, use the search bar or category chips to find a book, or filter by department and level.",
        "Tap a book to open Book Details -- price, live stock badge, rating, and description are all visible before any purchase step.",
        "Tap Add to Cart, then open Cart from the bottom navigation to review items and quantities.",
        "Proceed to Checkout: choose Pickup or Delivery, choose Paystack or Flutterwave, optionally enter a promo code, then Place Order.",
        "Complete payment in the aggregator's own secure payment screen; on success, the app shows Order Confirmation with a receipt.",
        "Order-status changes arrive as push and email notifications; tapping a notification opens the relevant order directly.",
    ]
    for i, s in enumerate(steps):
        d.paragraph([{"text": f"{i+1}. ", "bold": True}, {"text": s}], spacing_after=120)

    # ---------------------------------------------------------------- F --
    d.heading("Appendix F: Data Privacy and Ethical Considerations", level=2, center=False)
    d.body_text(
        "This project handles personal data (names, matric numbers, contact details) and payment "
        "references, which raises obligations independent of its status as a student project. "
        "Passwords are never stored in plaintext (Appendix B1's passwordHash field, bcrypt-hashed); "
        "payment card details never touch this project's own servers at all, since both Paystack and "
        "Flutterwave host the actual payment-entry screen and return only a reference and a webhook "
        "event, not card data, to the backend. Observation of bookshop staff and students for Chapter "
        "One's problem statement was conducted informally and anonymously, with no individually "
        "identifying detail about any staff member or student recorded or reported anywhere in this "
        "document. Usability walkthrough participants (Appendix D) took part voluntarily and are not "
        "individually identified in the results reported above."
    )

    # ---------------------------------------------------------------- G --
    d.heading("Appendix G: Full Project Schedule (Table Form)", level=2, center=False)
    d.body_text(
        "Table G1 restates Figure 4.1's Gantt chart in plain tabular form for accessibility and quick "
        "reference."
    )
    d.table(
        ["Activity", "Start month", "End month", "Duration"],
        [[a, s, e, dur] for a, s, e, dur in GANTT_TABLE],
        caption="Full project schedule, November 2025 - August 2026.",
        number="G1", font_size=9.5,
    )

    # ---------------------------------------------------------------- H --
    d.heading("Appendix H: Glossary of Terms", level=2, center=False)
    for term, definition in GLOSSARY:
        d.paragraph([{"text": term + " -- ", "bold": True}, {"text": definition}], spacing_after=100)
