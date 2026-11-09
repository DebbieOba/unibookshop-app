# INITIAL APPLICATION COMPLIANCE AUDIT & DATA INVENTORY
**Project:** BOOKDECK  
**Jurisdiction:** Nigeria (NDPA 2023, NDPC GAID 2025) & Global Mobile App Stores (Google Play, Apple App Store)  
**Audit Date:** 2026-11-09  

---

## 1. Personal Data Inventory & Mapping

| Data Category | Specific Information | Collection Source | Processing Purpose | Lawful Basis (NDPA §25) | Storage Location | Third-Party Recipients | Retention Period | Deletion Procedure |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identity Data** | Full Name, Profile Avatar URL | Registration form / Edit Profile screen | Account creation, identification, order dispatch | Contractual Necessity | PostgreSQL (`Profile.fullName`, `avatarUrl`) | Cloudinary (Images only) | Active life of account + 12 months | Complete erasure via Account Deletion API |
| **Contact Data** | Email Address, Phone Number | Registration, Profile, Delivery forms | Auth credentials, order confirmations, OTP verification | Contractual Necessity / Legal Obligation | PostgreSQL (`User.email`, `Profile.phone`), Redis (OTP) | Resend (Email), Termii (SMS) | Active life of account + 6 years (Tax/Invoicing) | Anonymized on account deletion; masked for tax logs |
| **Authentication Data** | Argon2id Password Hash, Refresh Token Hash | Login & Registration | Secure account session management | Legitimate Interests / Security | PostgreSQL (`User.passwordHash`, `hashedRefreshToken`), Redis | None | Active session; invalidated upon logout/password reset | Immediate purge on deletion |
| **Delivery Data** | Street Address, City, State, Delivery Instructions | Checkout address form | Fulfillment and logistics dispatch of physical books | Contractual Necessity | PostgreSQL (`Address` table) | Dispatch Logistics | Active life of account | Hard deleted on address or account deletion |
| **Financial / Payment Data** | Transaction Reference, Order Amount, Payment Status, Payment Channel | Checkout session with Paystack/Flutterwave | Order payment verification and invoice ledgering | Contractual Necessity / CBN Regulatory Compliance | PostgreSQL (`Order.totalAmount`, `Payment` table) | Paystack Payments Ltd, Flutterwave Inc | 7 years (Statutory CBN/FIRS financial accounting) | PII unlinked upon user deletion; financial record retained for tax audit |
| **Device / Usage Data** | Push Notification Token, IP Address, User Agent | Mobile app launch, Audit interceptor | Push notifications, security audit logs | Legitimate Interests (Security & Fraud Prevention) | PostgreSQL (`User.pushToken`, `AuditLog`) | None | 90 days rolling audit logs | Truncated / deleted automatically |

---

## 2. Gap Analysis & Vulnerability Findings

- **GAP-01 (CRITICAL - Platform Mandatory):** In-app account deletion is completely missing in mobile app, violating Apple App Store Guideline 5.1.1(v) and Google Play User Data Policy.
- **GAP-02 (CRITICAL - Platform Mandatory):** External web-based account deletion URL is missing from website, violating Google Play Account Deletion requirement.
- **GAP-03 (HIGH - Legally Compulsory):** Data subject export (Right to Data Portability, NDPA §38) missing from backend and mobile frontend.
- **GAP-04 (HIGH - Legally Compulsory):** Mobile legal screens (`PrivacyPolicyScreen.tsx`) reference deleted academic taxonomies (`matric number`, `department`, `level`) rather than actual bookstore operations.
- **GAP-05 (MEDIUM - Recommended Best Practice):** Absence of explicit cookie and analytics consent banner on marketing website.

