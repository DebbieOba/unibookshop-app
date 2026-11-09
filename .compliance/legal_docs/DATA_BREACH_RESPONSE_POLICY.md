# DATA BREACH RESPONSE POLICY & PROCEDURAL PLAN
**Document Version:** 1.0  
**Effective Date:** 2026-11-09  
**Review Status:** DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW  
**Governing Statute:** Nigeria Data Protection Act 2023, Sections 40 & 41  

---

### 1. Purpose & Incident Scope
This policy establishes standard operating procedures for detecting, containing, investigating, and reporting any personal data breach affecting BOOKDECK users, employees, or systems.

### 2. Breach Response Lifecycle
1. **Identification & Initial Assessment:** Any anomalous system behavior, database credential leak, unauthorized access, or loss of device must be immediately reported to the Incident Response Lead at `[INSERT OFFICIAL PRIVACY CONTACT EMAIL]`.
2. **Containment & Eradication:** Immediate revocation of compromised API tokens, database connection credentials, and invalidation of user JWT sessions via Redis token flush.
3. **Statutory Reporting to NDPC (72-Hour Rule):**
   - Pursuant to Section 40(2) of the NDPA 2023, where a personal data breach is likely to result in a risk to the rights and freedoms of individuals, the Data Controller **must notify the Nigeria Data Protection Commission (NDPC) without undue delay and, where feasible, not later than 72 hours** after becoming aware of it.
4. **Communication to Affected Data Subjects:**
   - Where the breach is likely to result in high risk to data subjects (e.g., credential theft, identity compromise), notice must be dispatched via registered email without undue delay detailing:
     - Nature of the breach.
     - Contact details of the DPO.
     - Likely consequences.
     - Measures taken or recommended for users to mitigate risk (e.g., password reset).

