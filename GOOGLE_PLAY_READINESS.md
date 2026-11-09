# BOOKDECK — GOOGLE PLAY STORE READINESS GUIDE
**Target Platform:** Google Play Store (Android)  
**Package Name:** `com.bookdeck.app`  
**Status: DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW**  
**Compliance Version:** Google Play Developer Policy (2024 / 2025 Edition)  

---

## 1. Google Play Data Safety Section Declarations

When completing the Google Play Console **Data Safety Form**, fill in the answers exactly as specified below based on BOOKDECK's verified codebase:

### Question 1: Does your app collect or share any of the required user data types?
- **Answer:** **Yes**

### Question 2: Is all of the user data collected by your app encrypted in transit?
- **Answer:** **Yes** (All production communication with `https://bookdeck-backend-hepr.onrender.com/api/v1` uses HTTPS/TLS 1.3).

### Question 3: Do you provide a way for users to request that their data be deleted?
- **Answer:** **Yes**
- **In-App Deletion:** Yes (Users navigate to *Profile > Security & Privacy > Delete Account*).
- **Web Deletion URL:** `https://bookdeck.com.ng/delete-account.html` (or `https://[INSERT OFFICIAL DOMAIN]/delete-account.html`).
- **Retention Disclaimer:** Yes (Financial transaction ledgers retained for up to 7 years in compliance with Central Bank of Nigeria statutory anti-money laundering and tax regulations).

---

## 2. Itemized Data Types Collected & Shared

### A. Location
- **Data Types:** Approximate location (`ACCESS_COARSE_LOCATION`), Precise location (`ACCESS_FINE_LOCATION`).
- **Collected:** Yes.
- **Shared:** No.
- **Processed Ephemerally:** Yes (Used only at checkout/address creation to assist in street and state auto-fill).
- **Required or Optional:** Optional (Users can enter addresses manually).
- **Purposes:** App functionality, Delivery fulfillment.

### B. Personal Info
- **Data Types:**
  - **Name:** Collected, encrypted in transit, linked to user, used for App functionality and Account management.
  - **Email Address:** Collected, encrypted in transit, linked to user, used for Authentication, Account management, and Order notifications.
  - **Phone Number:** Collected (Optional/profile), encrypted in transit, linked to user, used for Courier delivery contact.
  - **Physical Address:** Collected, encrypted in transit, linked to user, used for Book parcel dispatch.
  - **User IDs:** Collected (Internal UUID), encrypted in transit, linked to user.

### C. Financial Info
- **Data Types:**
  - **Purchase History:** Collected (Orders, timestamps, amounts, delivery method), encrypted in transit, linked to user, used for App functionality, Order tracking, and Statutory tax records.
  - **Payment Info (Card numbers / CVV):** **NOT COLLECTED BY BOOKDECK**. Managed entirely by PCI-DSS Level 1 certified third parties (Paystack & Flutterwave).

### D. Photos and Videos
- **Data Types:** Photos (Profile avatar upload via `expo-image-picker`).
- **Collected:** Yes (when selected by user).
- **Shared:** Stored in secure cloud storage (Cloudinary) via authenticated API.
- **Purposes:** Account customization.

---

## 3. Account Deletion Requirement Compliance

Google Play requires all apps that allow account creation to provide both an **in-app deletion method** and an **external web-based deletion URL**.

1. **In-App Flow:**
   - Location: `mobile/src/screens/customer/Security/SecurityScreen.tsx`
   - Authentication: Password challenge.
   - Outcome: All user tokens, sessions, cart, addresses, favorites, and profile PII are wiped.
2. **Web Portal URL (Mandatory for Play Console):**
   - URL: `https://[INSERT OFFICIAL DOMAIN]/delete-account.html`
   - File Location: `website/public/delete-account.html`
   - Meets Google Play criteria:
     - Plainly explains what data is deleted (profile, credentials, addresses, search history).
     - Explains what data is retained and why (CBN 7-year financial accounting exception).
     - Allows unauthenticated or off-device users to submit deletion requests.

---

## 4. Android Permissions Audit

In `mobile/app.json`:
- `android.permission.ACCESS_COARSE_LOCATION` (Used for delivery auto-fill)
- `android.permission.ACCESS_FINE_LOCATION` (Used for delivery auto-fill)
- **REMOVED:** `android.permission.RECORD_AUDIO` (Pruned to strictly adhere to Google Play's *Data Minimization & Unnecessary Permissions* policy).

---

## 5. Network Security & Production Build Pre-requisites

> [!WARNING]
> In `mobile/app.json`, `usesCleartextTraffic` is set to `true` for local development emulators.
> **Before generating production Android App Bundles (`.aab` via EAS Build):**
> 1. Set `"usesCleartextTraffic": false` in `expo-build-properties`.
> 2. Verify all API requests point strictly to `https://`.

