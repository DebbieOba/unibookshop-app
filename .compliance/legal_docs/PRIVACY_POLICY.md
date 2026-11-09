# PRIVACY POLICY
**Document Version:** 2.0  
**Effective Date:** 2026-11-09  
**Review Status:** DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW  
**Jurisdiction:** Federal Republic of Nigeria (governed by the Nigeria Data Protection Act 2023)  
**Responsible Entity:** [INSERT VERIFIED REGISTERED BUSINESS NAME] (Operating as "BOOKDECK")  
**Registered Address:** [INSERT OFFICIAL BUSINESS ADDRESS]  
**Contact / Privacy Office:** [INSERT OFFICIAL PRIVACY CONTACT EMAIL]  

---

### 1. Introduction
[INSERT VERIFIED REGISTERED BUSINESS NAME] ("BOOKDECK", "we", "us", or "our") provides an online multi-tenant bookstore commerce platform via mobile applications (Android and iOS) and web services. We respect your privacy and are committed to protecting personal data pursuant to the **Nigeria Data Protection Act 2023 (NDPA)** and applicable international guidelines.

### 2. Information We Collect
We collect personal information necessary to deliver physical and digital bookstore services:
- **Account Identification:** Full Name, Email Address, Phone Number, Password (stored exclusively as memory-hard Argon2id hashes).
- **Delivery & Logistics Information:** Shipping street address, city, state, and phone contact for order delivery.
- **Transaction & Order Records:** Purchased book titles, quantity, purchase timestamps, order totals, and payment references issued by our payment providers. We **never** collect, process, or store credit/debit card numbers, CVVs, or card PINs.
- **Device & Technical Identifiers:** Push notification tokens, device OS version, IP address, and security audit logs for fraud prevention.

### 3. Lawful Bases for Processing
Under Section 25 of the NDPA 2023, we process personal information on the following lawful bases:
- **Performance of a Contract:** Processing your orders, deliveries, and customer account maintenance.
- **Legal Obligation:** Maintaining financial invoices, order records, and statutory transaction histories pursuant to Nigerian tax laws and Central Bank of Nigeria (CBN) regulations.
- **Legitimate Interests:** Protecting platform security, preventing payment fraud, and ensuring service availability.
- **Consent:** Delivering optional promotional updates or push notifications (which you may withdraw at any time).

### 4. Third-Party Data Disclosures
We share personal data strictly with trusted service providers necessary for business operations:
- **Payment Intermediaries:** Paystack Payments Limited and Flutterwave Inc. (CBN-licensed payment processors).
- **Object Storage & CDN:** Cloudinary Inc. (for secure book image and avatar hosting).
- **Transactional Communications:** Resend Inc. (email delivery) and Termii (SMS delivery).
- We **never** sell, rent, or trade your personal data to data brokers or third-party advertisers.

### 5. Data Subject Rights (NDPA 2023 §34–§39)
As a user in Nigeria, you enjoy statutory rights regarding your personal data:
- **Right to Access & Data Portability:** You may view and download a machine-readable copy of your profile and order data directly via the app's Account settings (`GET /api/v1/users/me/export`).
- **Right to Rectification:** You may correct or update your profile details and delivery addresses anytime.
- **Right to Erasure (Account Deletion):** You may delete your account and personal profile at any time in-app or via our public deletion page (`/delete-account`).
- **Right to Lodge a Complaint:** You may lodge a complaint with the **Nigeria Data Protection Commission (NDPC)** (ndpc.gov.ng) if you believe your rights have been infringed.

### 6. Data Retention and Security
We retain personal profile information while your account remains active. Financial transaction records are retained for statutory periods (7 years) pursuant to financial regulations, after which they are permanently unlinked and anonymized. We implement industry-standard cryptographic controls (TLS 1.3 in transit, Argon2id hashing, and restricted role-based database access).

