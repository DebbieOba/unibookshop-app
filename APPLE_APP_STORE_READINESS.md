# BOOKDECK — APPLE APP STORE READINESS GUIDE
**Target Platform:** Apple App Store (iOS)  
**Bundle Identifier:** `com.bookdeck.app`  
**Status: DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW**  
**Compliance Version:** Apple App Store Review Guidelines (2024 / 2025 Edition)  

---

## 1. App Store Review Guideline 5.1.1(v) — Account Deletion

### Apple Requirement:
> *"If your app doesn't include significant account-based features, let people use it without a log-in. If your app supports account creation, you must also offer account deletion within the app."*
> *"The option to delete the account must be easy to find in the app's settings."*
> *"Temporary deactivation or disabling is not sufficient; the account must be fully deleted."*

### BOOKDECK Implementation & Proof:
1. **Discoverability:** Directly accessible in **Profile > Security & Privacy > Delete Account** (`mobile/src/screens/customer/Security/SecurityScreen.tsx`).
2. **In-App Flow:** The deletion is executed entirely within the app without redirecting the user to Safari or external web links.
3. **Security Safeguards:** The user must enter their current account password to prevent unauthorized or accidental deletion.
4. **Immediate Revocation:** The server revokes all active JWT refresh tokens and Redis sessions, cascades and deletes user records, and logs the user out (`useLogout()`) back to the initial auth screen.
5. **Data Erasure:** Stored profile information, avatars, delivery addresses, ratings, and favorites are permanently deleted.

---

## 2. App Store Review Guideline 3.1.5(a) — Physical Goods Exemption from In-App Purchase (IAP)

### Apple Requirement:
> *"Goods and Services Outside of the App: If your app enables people to purchase goods or services that will be consumed outside of the app, you must use other payment methods than in-app purchase, such as Apple Pay or a traditional credit card entry."*

### BOOKDECK Assessment & Justification for App Review:
- BOOKDECK is an e-commerce marketplace for **physical printed academic textbooks and reading materials** that are delivered to physical addresses via courier dispatch.
- BOOKDECK does **NOT** sell digital books (e-books, PDFs) or subscriptions consumed within the app.
- Therefore, pursuant to **Guideline 3.1.5(a)**, BOOKDECK is **exempt from Apple's 30% In-App Purchase (IAP) system** and is legally entitled to integrate standard third-party payment gateways (Paystack & Flutterwave).
- **Reviewer Note:** In App Store Connect Review Notes, explicitly state:
  > *"BOOKDECK facilitates the ordering and physical courier delivery of printed textbooks in Nigeria. All transactions represent physical goods consumed outside the app pursuant to Guideline 3.1.5(a). In-App Purchase (StoreKit) is therefore not utilized."*

---

## 3. App Store Connect — App Privacy Nutrition Labels

When configuring the **App Privacy** section in App Store Connect, declare the following data points:

### Data Used to Track You
- **None:** BOOKDECK does not link user data collected from our app with third-party data for targeted advertising, nor does it share user data with data brokers.

### Data Linked to You

| Data Category | Data Type | Purpose | Linked to Identity? |
|:---|:---|:---|:---:|
| **Contact Info** | Name | App Functionality, Account Management | Yes |
| | Email Address | Account Management, Authentication, Order Updates | Yes |
| | Phone Number | Delivery Logistics & Customer Support | Yes |
| | Physical Address | Courier Delivery Fulfillment | Yes |
| **Financial Info** | Payment History | Order Management, Statutory Accounting | Yes |
| **User Content** | Photos (Profile Picture) | App Functionality (Customization) | Yes |
| **Location** | Coarse / Fine Location | App Functionality (Delivery Address Auto-fill) | Yes |
| **Identifiers** | User ID | App Functionality, Analytics, Account Management | Yes |

---

## 4. iOS Permission Strings (`Info.plist`) Audit

In `mobile/app.json`:
- `NSPhotoLibraryUsageDescription`: *"Allow BOOKDECK to access your photos to set a profile picture."*
- `NSLocationWhenInUseUsageDescription`: *"Allow BOOKDECK to use your location to fill in your delivery address."*
- `bundleIdentifier`: `"com.bookdeck.app"`

---

## 5. App Transport Security (ATS) Pre-Submission Check

> [!CAUTION]
> In `mobile/app.json`, `NSAppTransportSecurity.NSAllowsArbitraryLoads: true` is currently configured for local LAN development.
> **Before submitting to TestFlight or App Store Review:**
> Remove `NSAllowsArbitraryLoads: true` from `infoPlist` or restrict it to `localhost` only. Production API communication must strictly use HTTPS to avoid rejection under Guideline 2.5.4.

