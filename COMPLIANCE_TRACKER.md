# BOOKDECK COMPLIANCE & APP STORE READINESS TRACKER
**Status: DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW**  
**Jurisdiction:** Federal Republic of Nigeria (NDPA 2023, FCCPA 2018, Cybercrimes Act 2015, CBN Regulations)  
**Distribution Platforms:** Google Play Store (Android) & Apple App Store (iOS)  
**Last Updated:** November 2026  

---

## 1. Requirement Categorization Key

- **Category A (Legally Compulsory):** Mandatory under Nigerian statutory law (NDPA 2023, GAID 2025, FCCPA 2018, Cybercrimes Act 2015, CBN Payment Regulations). Failure to comply entails statutory fines, NDPC enforcement orders, or operational suspension.
- **Category B (Platform Mandatory):** Mandatory under Google Play Developer Policies and Apple App Store Review Guidelines. Non-compliance results in app rejection or removal from app stores.
- **Category C (Recommended Best Practice):** Industry standard technical security, UX clarity, and proactive governance recommendations.

---

## 2. Master Compliance Matrix

| ID | Requirement Description | Category | Legal / Platform Reference | Status | Evidence / Code Location | Action Taken / Pending Legal Review |
|:---|:---|:---:|:---|:---:|:---|:---|
| **COMP-01** | Lawful Basis for Personal Data Processing | **Category A** | NDPA 2023 §25; GAID 2025 | **PASS** | `backend/src/modules/users/`, `.compliance/legal_docs/PRIVACY_POLICY.md` | Defined contract performance (§25(1)(b)), legal obligation (§25(1)(c)), and consent (§25(1)(a)). |
| **COMP-02** | Privacy Policy Accessibility (In-App & Web) | **Category A & B** | NDPA 2023 §27; Apple 5.1.1(i); Google Play User Data | **PASS** | `mobile/src/screens/customer/Legal/PrivacyPolicyScreen.tsx`, `website/public/delete-account.html` | In-app screen updated with NDPA citations; public policy available online. |
| **COMP-03** | Data Subject Access Request (DSAR) - Data Portability | **Category A** | NDPA 2023 §38; GDPR Art. 20 | **PASS** | `backend/src/modules/users/controllers/users.controller.ts` (`GET /users/me/export`), `mobile/src/screens/customer/Security/SecurityScreen.tsx` | Implemented JSON machine-readable export of all user personal data, profile, addresses, and orders. |
| **COMP-04** | In-App Account & Data Deletion | **Category B** | Apple App Store Guideline 5.1.1(v) | **PASS** | `backend/src/modules/users/services/users.service.ts` (`deleteAccount`), `mobile/src/screens/customer/Security/SecurityScreen.tsx` | End-to-end password-confirmed in-app deletion button immediately revokes sessions and erases PII. |
| **COMP-05** | External Web Account Deletion Portal | **Category B** | Google Play User Data Policy (May 2024 Mandate) | **PASS** | `website/public/delete-account.html` | Hosted web page allowing users to request account and data deletion outside the mobile app. |
| **COMP-06** | Financial Audit Records Retention (7-Year Law) | **Category A** | CBN Guidelines; Companies & Allied Matters Act (CAMA); FIRS Tax Law | **PASS** | `backend/src/modules/users/services/users.service.ts` (Order anonymization logic) | When deleting accounts with financial orders, personal addresses & PII are scrubbed while order ledger is preserved. |
| **COMP-07** | Prohibition of Raw Cardholder Data Storage | **Category A & B** | PCI DSS v4.0; CBN Payment System Regulations | **PASS** | `backend/src/modules/order/`, `schema.prisma` | Zero PAN/CVV storage in database; tokens and references managed exclusively by Paystack and Flutterwave. |
| **COMP-08** | Digital Payment Security (Webhook Verification) | **Category A** | Cybercrimes Act §14-19; CBN Electronic Payments Guide | **PASS** | `backend/src/modules/order/controllers/checkout.controller.ts` | HMAC-SHA512 digital signature verification on all Paystack and Flutterwave incoming webhook notifications. |
| **COMP-09** | Password Hashing & Credential Protection | **Category A & C** | Cybercrimes Act 2015 §30; NDPA 2023 §39 | **PASS** | `backend/src/modules/users/services/users.service.ts`, `backend/src/modules/auth/` | Industry-leading Argon2id cryptographic password hashing with memory and iteration cost hardening. |
| **COMP-10** | Session Revocation & Invalidation | **Category B & C** | OWASP Mobile ASVS; Apple Guideline 5.1.1 | **PASS** | `backend/src/modules/auth/`, `UsersService.deleteAccount` | Redis token revocation invalidates refresh tokens and carts on logout or account deletion. |
| **COMP-11** | Local Mobile Storage of Secrets | **Category C** | OWASP MASVS-STORAGE | **PASS** | `mobile/src/lib/authStore.ts` | Secure tokens stored in hardware-backed `expo-secure-store` (iOS Keychain / Android Keystore). |
| **COMP-12** | Permission Minimization (Removal of Audio Recording) | **Category B** | Google Play Developer Policy; Apple Guideline 5.1.1 | **PASS** | `mobile/app.json` | Removed unused `android.permission.RECORD_AUDIO` and duplicate permissions; retained only location permissions for delivery. |
| **COMP-13** | Location Data Usage Justification | **Category B** | Apple Guideline 5.1.5; Google Play Location Policy | **PASS** | `mobile/app.json` (`locationWhenInUsePermission`) | Clear in-app disclosure: "Allow BOOKDECK to use your location to fill in your delivery address." |
| **COMP-14** | Cleartext Traffic & App Transport Security | **Category B** | Apple ATS; Google Play Network Security Config | **REVIEW REQUIRED** | `mobile/app.json` (`usesCleartextTraffic`, `NSAllowsArbitraryLoads`) | Allowed in dev; production builds must disable cleartext and enforce `https://bookdeck-backend-hepr.onrender.com`. |
| **COMP-15** | Book Condition & Warranty Disclosure | **Category A** | FCCPA 2018 §114-133 | **PASS** | `mobile/src/components/BookCard.tsx`, `.compliance/legal_docs/TERMS_AND_CONDITIONS.md` | Conditions explicitly surfaced (New, Like New, Good, Fair); warranties defined in Terms. |
| **COMP-16** | Dispute Resolution & Refund Mechanism | **Category A** | FCCPA 2018 §120; CBN Consumer Protection Framework | **REVIEW REQUIRED** | `.compliance/legal_docs/TERMS_AND_CONDITIONS.md` | Defined 48-hour return window for misrepresented books; requires Nigerian consumer legal review. |
| **COMP-17** | Data Breach Response & NDPC Notification (72h) | **Category A** | NDPA 2023 §40; NDPC GAID 2025 | **PASS** | `.compliance/legal_docs/DATA_BREACH_RESPONSE_POLICY.md` | Formal incident response protocol establishing 72-hour statutory notification to NDPC and affected subjects. |
| **COMP-18** | Third-Party Sub-processor Disclosure | **Category A & B** | NDPA 2023 §31-33; Apple App Privacy; Google Play Data Safety | **PASS** | `.compliance/legal_docs/THIRD_PARTY_SERVICES_DISCLOSURE.md` | Disclosed Paystack, Flutterwave, Cloudinary, Resend, Termii, Supabase, and Render. |
| **COMP-19** | Minors & Age Restriction Governance | **Category A & B** | NDPA 2023 §32; Child Rights Act 2003 | **REVIEW REQUIRED** | `.compliance/legal_docs/PRIVACY_POLICY.md`, `BUSINESS_LEGAL_INFORMATION_REQUIRED.md` | Requires age 18 or parental consent; pending business verification of minimum age enforcement. |
| **COMP-20** | Cross-Border Data Transfer Safeguards | **Category A** | NDPA 2023 §41-43; GAID 2025 | **REVIEW REQUIRED** | `.compliance/audit/INITIAL_AUDIT_REPORT.md` | Cloudinary, Resend, Supabase, and Render store data outside Nigeria; requires standard contractual clauses (SCC). |
| **COMP-21** | In-App Purchase (IAP) Exemption for Physical Goods | **Category B** | Apple App Store Review Guideline 3.1.5(a) | **PASS** | `mobile/src/screens/customer/Order/CheckoutScreen.tsx` | BOOKDECK sells physical books; explicitly permitted to use direct gateway checkout (Paystack) outside Apple IAP. |
| **COMP-22** | Registration of Data Controller with NDPC | **Category A** | NDPA 2023 §44-47; GAID 2025 | **REVIEW REQUIRED** | `BUSINESS_LEGAL_INFORMATION_REQUIRED.md` | Formal filing required with NDPC if processing personal data of major importance (>10,000 individuals). |
| **COMP-23** | Designation of Data Protection Officer (DPO) | **Category A** | NDPA 2023 §32; GAID 2025 | **REVIEW REQUIRED** | `BUSINESS_LEGAL_INFORMATION_REQUIRED.md` | DPO name and contact placeholder created; company must appoint a certified DPO / DPCO. |
| **COMP-24** | Secure Cookie & HTTP Header Hardening | **Category C** | OWASP ASVS 4.0; Cybercrimes Act 2015 | **PASS** | `backend/src/main.ts` | Helmet security headers, CORS origin allowlisting, and global validation pipes with whitelist enabled. |
| **COMP-25** | API Rate Limiting & DoS Protection | **Category C** | OWASP API Security Top 10 | **PASS** | `backend/src/modules/auth/` | Rate limiting applied to login, registration, and OTP authentication endpoints. |

---

## 3. Executive Compliance Summary

- **Total Assessed Requirements:** 25
- **PASS (Verified in Code & Documentation):** 19 (76%)
- **REVIEW REQUIRED (Awaiting Legal Counsel / Company Registration):** 6 (24%)
- **FAIL:** 0 (0%)
- **NOT APPLICABLE:** 0 (0%)

> [!IMPORTANT]
> All technical safeguards (in-app deletion, web deletion portal, DSAR export, password confirmation, argon2 hashing, token revocation, permission pruning, webhook HMAC verification) have been compiled and verified in code. Outstanding items are business credentials and formal legal signatures recorded in `BUSINESS_LEGAL_INFORMATION_REQUIRED.md` and `LEGAL_REVIEW_REQUIRED.md`.

