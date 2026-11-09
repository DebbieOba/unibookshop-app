# ACCOUNT DELETION & DATA ERASURE POLICY
**Document Version:** 1.0  
**Effective Date:** 2026-11-09  
**Review Status:** DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW  
**Compliance Authority:** Google Play User Data Policy & Apple App Review Guideline 5.1.1(v)  

---

### 1. User Right to Account Deletion
BOOKDECK provides every registered user with a straightforward, frictionless method to permanently delete their account and personal information.

### 2. Methods for Requesting Account Deletion
1. **In-App Deletion (Immediate):**
   - Navigate to: **Account Tab $\rightarrow$ Security $\rightarrow$ Delete Account**.
   - Review the confirmation dialogue detailing which records will be permanently purged.
   - Enter your current password to authenticate ownership and confirm deletion.
   - The system immediately invalidates active sessions, revokes JWT tokens, and permanently deletes your personal profile, addresses, notification tokens, and cart contents.
2. **External Web Portal Deletion (No App Required):**
   - Visit: `[INSERT OFFICIAL WEBSITE URL]/delete-account`.
   - Submit your registered email address and password to submit an authenticated erasure request.
   - A verification link will be dispatched to your email to confirm the request if password is unavailable.

### 3. Data Deletion Scope & Retention Exceptions
- **Immediately Purged:** Profile record, avatar photo, delivery addresses, push notification tokens, active sessions, wishlist/favourites, and authentication hashes.
- **Statutory Retention Exceptions (NDPA §25 / CBN Regulations):** Completed past financial purchase records (`Order` and `Payment` receipts) must be maintained for statutory accounting and tax compliance for 7 years. These records are permanently severed from your personal identity by setting `userId = NULL` and removing all personal identifiers.

