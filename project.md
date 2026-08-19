# CURRICULA Mobile App (formerly University Bookshop)

# Design Structure, System Architecture & Screen Specification

---

## Contents

1. Complete UI/UX Flow Design (All Screens)
2. System Architecture
3. User Flow Diagram
4. Design System Template
5. Complete Screen Inventory & Specifications

**Technology Stack**

- React Native (Expo)
- Node.js Microservices
- Dark Theme
- Paystack
- Flutterwave

---

# 1. Complete UI/UX Flow Design

The master UI/UX flow serves as the single source of truth for the application.

It consists of:

- Student Journey (16 Screens)
- Admin Journey (10 Screens)

Three navigation flows connect every screen:

- **Main Flow** (Solid Green)
- **Approval Flow** (Dashed Purple)
- **Admin Flow** (Dashed Orange)

---

# 2. System Architecture

The application follows a **Three-Layer Architecture**.

```
React Native Mobile App
        │
        ▼
     API Gateway
        │
        ▼
 Node.js Microservices
        │
        ▼
 Polyglot Databases
```

External integrations include:

- Paystack
- Flutterwave
- Firebase Cloud Messaging (FCM)
- University Student Information System (SIS)

---

## 2.1 Service Decomposition

| Service | Responsibilities | Feeds Screens |
|----------|------------------|--------------|
| Auth Service | Registration, Login (Email or Matric), JWT Authentication, Refresh Tokens, Pending/Approved/Rejected Account States | 3,4,5,6A,6B,A1 |
| Catalogue Service | Books CRUD, Categories, Search, Filters, Ratings, Stock | 8,9,10,A7,A9 |
| Order Service | Cart, Checkout, Payments, Order Lifecycle | 12,13,14,A2,A8 |
| Notification Service | Push Notifications, In-App Notifications, Admin Broadcasts | 15,A10 |
| Admin Service | Schools, Departments, Levels, User Approvals, Dashboard KPIs | A2-A6 |

---

## 2.2 Data Layer

| Storage | Purpose | Key Data |
|----------|---------|----------|
| PostgreSQL | Relational Transactional Data | Users, Orders, Schools, Departments, Levels, Books, Categories, Ratings, Preferences |
| Redis | Fast Cache Layer | Sessions, JWT Refresh Tokens, Cache, Cart |
| Object Storage | Binary Assets | Book Covers, Receipts, Avatars |

---

# 3. User Flow Diagram

Three flow types exist throughout the application.

---

## Main Flow

```
Splash (animated logo + wordmark)
    ↓
Onboarding (3-screen carousel, first launch only)
    ↓
Login (single screen — email or matric number + password;
        backend resolves role from the JWT, no manual role pick)
    ↓
Sign Up (4-step wizard: Account → Personal → Academic → Interests)
    ↓
Pending Approval
    ↓
Home
    ↓
Store
    ↓
Book Details
    ↓
Cart
    ↓
Checkout
    ↓
Order Confirmation
```

Note: the standalone Role Selection and Preferences screens described elsewhere in this
document have been retired — role detection now happens automatically at login (backend
returns `role` in the JWT), and Preferences' fields (Level, Interests) were folded into the
Sign Up wizard's steps 3–4.

---

## Approval Flow

```
Pending Approval
        │
        ├── Approved
        │       ↓
        │  Preferences
        │
        └── Rejected
                ↓
             Login
```

Approval is triggered by an Admin.

---

## Admin Flow

```
Admin Login
      ↓
Dashboard
      ↓
Schools
      ↓
Departments
      ↓
Levels
      ↓
User Approvals
      ↓
Books
      ↓
Orders
      ↓
Inventory
      ↓
Notifications
```

---

## Cross Flow Dependencies

| Admin Produces | Student Consumes |
|---------------|------------------|
| Schools → Departments → Levels | Dropdowns on Registration & Preferences |
| User Approval | Pending → Approved / Rejected |
| Books | Home, Store, Book Details |
| Order Updates | Notifications |
| Broadcast Notifications | Notification Feed |

---

# 4. Design System

The application uses:

- Dark Theme
- Green Primary Color
- Purple Admin Accent
- Orange Warning State

All design tokens live inside:

```
src/theme.ts
```

---

## 4.1 Color Tokens

| Token | Hex |
|--------|------|
| Background | #0A0F0C |
| Surface | #131A16 |
| SurfaceAlt | #1C2420 |
| Border | #26302B |
| Primary | #22C55E |
| Primary Dark | #16A34A |
| Primary Tint | #0F2A1B |
| Admin Accent | #8B5CF6 |
| Admin Tint | #231B36 |
| Warning | #F59E0B |
| Error | #EF4444 |
| Text Primary | #F5F7F6 |
| Text Secondary | #9CA8A1 |
| Text Tertiary | #5C6862 |

---

## 4.2 Typography

### Screen Titles

- Sans Bold
- 24–28pt
- Text Primary

### Section Headers

- Sans SemiBold
- 16–18pt

### Body

- Sans Regular
- 14pt

### Labels

- Sans Regular
- 11–12pt

### Prices & Statistics

- Sans Bold
- 16–24pt
- Green

---

## Spacing Scale

```
4
8
12
16
24
32
```

---

## Corner Radius

Inputs & Buttons

```
10px
```

Cards

```
14px
```

Pills

```
Fully Rounded
```

---

## Buttons

Student

- Green

Admin

- Purple

Height

```
48px
```

---

## Status Colors

Processing

```
Orange
```

Completed

```
Green
```

Cancelled

```
Red
```

---

# 5. Screen Inventory

Total Screens

- Student: 16
- Admin: 10

Grand Total

**26 Screens**

---

# Student Screens

## 1. Splash

Components

- Logo
- Wordmark
- Loading Spinner

Routes

- Role Selection
- Home
- Pending
- Admin Dashboard

---

## 2. Role Selection

Components

- Student Card
- Admin Card

Routes

Student

```
Login
```

Admin

```
Admin Login
```

---

## 3. Student Login

Components

- Email / Matric Toggle
- Password
- Forgot Password
- Login Button
- Sign Up Link

Routes

- Home
- Sign Up

---

## 4. Student Sign Up

Components

- Full Name
- Email
- Matric Number
- Department
- Password

Routes

Pending Approval

---

## 5. Pending Approval

Components

- Clock Icon
- Pending Message
- Go To Login

Automatically polls approval status.

Routes

- Approved
- Rejected

---

## 6A. Approved

Components

- Success Checkmark
- Continue Button

Routes

Preferences

---

## 6B. Rejected

Components

- Rejection Icon
- Contact Admin Message

Routes

Login

---

## 7. Preference Selection

Components

Department

Level

Interest Chips

- Engineering
- Computer Science
- Business
- Medicine
- Law
- Arts

Routes

Home

---

# Main Student App

---

## 8. Home

Components

- Greeting
- Notification Bell
- Search
- Filters
- Featured Books
- Recommended Books

Routes

- Store
- Notifications
- Tabs

---

## 9. Store

Components

- Search
- Filter
- Categories
- Book Grid

Routes

Book Details

---

## 10. Book Details

Components

- Book Cover
- Rating
- Price
- Stock Badge
- Description
- Favourite
- Add To Cart

Routes

- Favourite
- Cart

---

## 11. Favourite

Components

- Saved Books
- Remove Favourite

Routes

Book Details

---

## 12. Cart

Components

- Cart Items
- Quantity Stepper
- Shipping
- Total

Routes

Checkout

---

## 13. Checkout

Components

Delivery Method

- Pick Up
- Delivery

Payment Methods

- Paystack
- Flutterwave

Address

Place Order

Routes

Payment

---

## 14. Order Confirmation

Components

- Success Check
- Order ID
- Receipt
- Payment Method

Routes

Orders

Notifications

---

## 15. Notifications

Components

- Approval Notifications
- Order Updates
- New Arrivals
- Mark All Read

Supports deep linking.

---

## 16. Settings

Components

- Profile
- Address
- Notification Preferences
- Change Password
- Theme
- Help
- About
- Logout

Routes

Role Selection

---

# Admin Screens

---

## A1. Admin Login

Components

- Email
- Password
- Login Button

Routes

Dashboard

---

## A2. Dashboard

Displays

- Total Users
- Pending Approvals
- Total Books
- Total Orders
- Recent Orders

Routes

A3–A10

---

## A3. Manage Schools

Components

- Schools List
- Add School

Routes

Departments

---

## A4. Manage Departments

Components

- Department List
- Add Department

Routes

Levels

---

## A5. Manage Levels

Components

- Levels List
- Add Level

Provides dropdown data for:

- Registration
- Preferences

---

## A6. User Approvals

Components

- Student Cards
- Approve
- Reject

Controls approval flow.

---

## A7. Add/Edit Books

Components

- Upload Cover
- Title
- Author
- Category
- Price
- Stock Quantity

Updates

- Store
- Inventory

---

## A8. Orders

Components

Order Tabs

- All
- Processing
- Completed
- Cancelled

Routes

Order Details

---

## A9. Inventory

Displays

- Total Books
- Low Stock
- Out of Stock

Routes

Book Editor

---

## A10. Notifications

Components

- Announcement Type
- Message
- Audience
- Send Button

Broadcasts notifications to all students.

---

# Navigation Summary

## Student Bottom Navigation

- Home
- Store
- Favourite
- Settings

---

## Admin Bottom Navigation

- Dashboard
- Books
- Orders
- More

---

# Overall Totals

| Journey | Screens |
|----------|----------|
| Student | 16 |
| Admin | 10 |

## Total Screens

**26**

---