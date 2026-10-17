# Hospital Appointment Booking System (HABS) — Frontend Prototype
**Reference Specification:** BRD-HABS-001 (v0.1 Draft)  
**Implementation:** Responsive, clickable Front-End Prototype with in-browser mock data and simulated async services.

---

## 1. Project Overview
The **Hospital Appointment Booking System (HABS)** prototype simulates a modern healthcare appointment scheduling platform for hospitals and multispecialty clinics. It eliminates double bookings, provides real-time slot holding with visible countdowns, enforces medical business rules, manages doctor clinical queues and leaves, and gives hospital administrators complete operational governance and audit trails.

All times are stored as **UTC** in mock data and displayed in **Indian Standard Time (IST, UTC+05:30)** per requirements **FR-S02** and **RL-10**.

---

## 2. Setup Instructions

### Prerequisites
- Node.js 20+ or 22+
- npm (Node Package Manager)

### Install & Run
```bash
# Install dependencies
npm install

# Start Vite development server on port 3000 (host 0.0.0.0)
npm run dev

# Run TypeScript type-checking / linting
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```
The prototype binds to `http://localhost:3000` or the AI Studio development container URL.

---

## 3. Demo Accounts & Role-Based Access

The prototype includes pre-configured demo accounts covering all 4 roles defined in Section 4 & Section 7.7 of the BRD:

| Role | Demo User Name | Demo Email | Role Capabilities |
|---|---|---|---|
| **Patient** | Aarav Sharma | `aarav.sharma@example.com` | Search doctors, hold slot, book for self/dependents, manage profile, reschedule/cancel own visits, print e-Pass. |
| **Doctor** | Dr. Sarah Jenkins | `sarah.jenkins@habs.org` | View own queue only (RL-20), mark Completed/No-Show (RL-18), add clinical notes, set schedule/breaks, request leave. |
| **Receptionist** | Sunita Mehra | `reception.desk@habs.org` | Assisted booking, rescheduling, and cancellation on behalf of any patient (FR-R01, RL-22). Cannot access admin/doctor settings. |
| **Administrator** | Dr. Vikram Seth | `admin@habs.org` | Administrative override (FR-A07, RL-21), reassign bookings (FR-A08), bulk reassign leave-flagged slots (RSK-07), audit log (RL-23), accounts (RL-24), holidays (RL-19), reports with CSV/PDF export. |

### Demo Credentials
- **Fixed Demo Verification OTP (FR-P01, FR-P02):** `123456`  
  Displayed on-screen for registration and password reset verification.
- **Role Switcher:** Use the floating **"Demo Tools & Role Switcher"** button in the lower-right corner to switch roles instantly without logging out.

---

## 4. Key Business Rules Implemented (RL & DEC IDs)

| Rule ID | Name & Description | Implementation in Prototype |
|---|---|---|
| **RL-01** | Only logged-in patients (or receptionist on behalf) can book | Unauthenticated users trying to book are prompted to log in/register (`BookingWizardModal.tsx`, `AuthModal.tsx`). |
| **RL-02 / RL-03** | Occupied or held slots cannot be booked (Zero Double Bookings) | Atomic validation in `bookingRules.ts` prevents collision. Occupied/held slots are disabled with status badges. |
| **RL-04** | Valid date and time only | Validates future slot boundaries and positive duration. |
| **RL-05** | Slot Hold Time (5-10 mins) with visible countdown | Holds slot for configured duration (`slotHoldTimeMinutes`, default 7 mins). Other users see it as "Held". If expired, releases slot and prompts reselection. |
| **RL-06** | Booking Lead Time (1-2 hours advance notice) | Enforced: `slotStartUtc > now + leadTime` (default 2 hours). |
| **RL-07** | Booking Window (30-60 days ahead) | Enforced: `slotStartUtc < now + bookingWindow` (default 30 days). |
| **RL-08** | No overlapping appointments with different doctors | Checks if the person treated has an overlapping active booking at that time. |
| **RL-09** | Max 1 active appointment per doctor per day | Prevents booking multiple slots with the same doctor on the same calendar day. |
| **DEC-03** | Conflict Check Scope Toggle | Config toggle whether RL-08/RL-09 apply per person treated (dependent) or account holder. Default: `person_treated`. |
| **RL-10 / FR-S02** | UTC storage & IST display | Times stored as UTC ISO 8601; converted via `utcToIst` and displayed as `HH:MM AM/PM IST`. |
| **RL-11 / RL-13** | Cancellation Cutoff (2 hours) & Reason | Refuses cancellation inside cutoff (unless admin override). Mandatory reason required. Slot freed immediately. |
| **RL-12 / RL-14** | Atomic Rescheduling | New slot booked first; old slot released only after new booking succeeds. Demonstratable atomic failure path in Demo Tools. |
| **RL-16** | Doctor Leave Flags Bookings | Existing bookings on leave dates are flagged for rescheduling (never silently deleted) and patients receive simulated alerts. |
| **RL-17** | Schedule Integrity | Doctor schedule updates cannot alter or delete slots with existing bookings. |
| **RL-18** | No-Show Tracking | Marking no-show keeps slot occupied and increments patient `noShowCount`. Triggers admin review flag. |
| **RL-19** | Hospital Holiday Block | Declaring a hospital holiday blocks all doctor slots on that date and flags confirmed appointments. |
| **RL-20 - RL-22** | Role-Based Access Control | Strictly enforced views: Doctor sees own data; Receptionist has no access to settings; Admin has full governance. |
| **RL-23** | Read-Only Audit Log | Immutable, append-only log capturing actor, action, entity, before/after states, and timestamp. |
| **RL-24** | Account Activation/Deactivation | Accounts are toggled active/inactive, never deleted, ensuring medical record retention. |
| **A3 / DEC-02** | Online Payment Disabled | Displays neutral notice: *"Refund per hospital policy (to be defined by Finance)"*. No payment gateway at launch. |

---

## 5. Reviewer Demo Tools (Section 7.9 Exception Simulators)

Click the **"Demo Tools & Role Switcher"** button (bottom right) to test edge cases:
1. **Quick Role Switcher:** Toggle between Patient, Doctor, Receptionist, and Administrator.
2. **Simulate Simultaneous Booking Collision (RL-02, RL-03):** When checked, any slot selection throws an instantaneous concurrency collision message.
3. **Simulate Reschedule Booking Failure (RL-12 Atomic Rollback):** When checked, rescheduling fails during new slot reservation, confirming the original appointment is unchanged and old slot is NOT released.
4. **Simulate Notification Delivery Failure (US-14):** Logs SMS/Email as failed, then simulates automatic retry via backup gateway.
5. **Expire Slot Hold Immediately (RL-05):** Instantly drains the hold countdown timer to test release and user notification.
6. **Reset All Mock Data:** Clears in-memory mutations and restores factory mock state.

---

## 6. Project Structure

```
habs-frontend-prototype/
├── README.md
├── package.json
├── index.html
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── CountdownTimer.tsx       # Live slot hold countdown (RL-05)
│   │   ├── DemoToolsDrawer.tsx      # Exception testing & role switcher
│   │   ├── DepartmentsView.tsx      # Centers of excellence & specialties
│   │   ├── DoctorCard.tsx           # Doctor profile card with IST availability
│   │   ├── DoctorDetailModal.tsx    # Comprehensive doctor profile
│   │   ├── DoctorList.tsx           # Doctor search & multi-filter grid
│   │   ├── HeroBanner.tsx           # Hospital hero banner & quick search
│   │   ├── Navbar.tsx               # Role-based navigation header
│   │   ├── NotificationCenterModal.tsx # Simulated SMS/Email/WhatsApp log
│   │   ├── PreVisitGuideModal.tsx   # Patient checklist & arrival rules
│   │   ├── PrintableAppointmentPass.tsx # Digital e-Pass with QR code
│   │   └── StatusBadge.tsx          # Status indicators (color + icon + text)
│   ├── context/
│   │   └── AppContext.tsx           # Global state, business rules & API layer
│   ├── data/
│   │   ├── config.ts                # Configurable business rules (Section 5)
│   │   └── mockData.ts              # Typed mock data (patients, doctors, rules)
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx   # Overrides, bulk reassign, audit log, reports
│   │   ├── auth/
│   │   │   └── AuthModal.tsx        # Login, registration with OTP, password reset
│   │   ├── doctor/
│   │   │   └── DoctorDashboard.tsx  # Clinical queue, leave, recurring schedule
│   │   ├── patient/
│   │   │   ├── BookingWizardModal.tsx # 3-step booking flow with hold & e-Pass
│   │   │   ├── MyAppointmentsView.tsx # Cancellation cutoff & atomic reschedule
│   │   │   └── PatientProfileModal.tsx # Profile & dependents management
│   │   └── receptionist/
│   │       └── ReceptionistDashboard.tsx # Assisted booking on behalf of patient
│   ├── types/
│   │   └── index.ts                 # Full domain TypeScript interfaces
│   ├── utils/
│   │   ├── bookingRules.ts          # RL-01 to RL-14 validator functions
│   │   ├── reports.ts               # KPI formulas & CSV/PDF export helpers
│   │   ├── slotGenerator.ts         # Programmatic schedule & slot generator
│   │   └── time.ts                  # UTC to IST conversion & formatting
│   ├── App.tsx                      # View coordination and layout
│   └── main.tsx                     # React 19 entry point
```

---

## 7. Manual Test Script (Section 11)

### 7.1 Patient Booking Journey
1. Open the app as Patient (**Aarav Sharma**).
2. Click **"Book Slot"** or pick a doctor card.
3. Observe step 1: Doctor profile, IST fee (₹800), and 14-day date picker.
4. Pick a date; observe step 2: Slots displayed in **IST** (e.g., `10:00 AM IST`).
5. Click an open slot: The **7-minute hold timer** activates immediately in the header and checkout.
6. Observe step 3: Select treated person (**Self** or dependent **Kabir Sharma**). Enter reason for visit.
7. Click **"Confirm & Lock Booking"**:
   - Status changes to **Booked**.
   - Slot is locked against double booking.
   - Digital e-Pass renders with QR code and reference ID (e.g. `HABS-2026-007`).
   - Click **"Print / Download PDF Pass"** to test print layout.

### 7.2 Cancellation & Rescheduling
1. Navigate to **"My Bookings"**.
2. **Cancellation test:**
   - Click **"Cancel"** on an upcoming appointment.
   - Enter mandatory cancellation reason.
   - Click **"Confirm Cancellation"**.
   - Notice that the slot returns to availability immediately and refund notice is shown.
3. **Rescheduling test (Atomic):**
   - Click **"Reschedule"** on an active appointment.
   - Select a new open slot and confirm.
   - Observe the atomic swap: new slot locked, old slot freed, reschedule count incremented.
   - In Demo Tools, check **"Simulate Reschedule Failure"** and retry: observe error message and verify the original appointment remains intact (**Atomic Rollback**).

### 7.3 Doctor Dashboard
1. Switch to **Doctor (Dr. Sarah Jenkins)** via the Demo Tools drawer.
2. View the daily patient appointment schedule (Day and List views).
3. Mark an appointment as **Completed** or **No-Show** (notice patient no-show counter increments).
4. Add a clinical diagnosis note and verify it is saved.
5. Go to **"Leave & Emergency"**:
   - Pick future dates and click **"Preview Affected Bookings"**.
   - Verify affected appointments are displayed.
   - Click **"Confirm Leave & Flag Appointments"**: existing bookings are marked **Flagged for Rescheduling** (RL-16) and simulated WhatsApp alerts are dispatched.

### 7.4 Administrator Dashboard
1. Switch to **Administrator (Dr. Vikram Seth)**.
2. Check KPI cards: Total Bookings, Cancellation Rate, No-Show Rate, Flagged Bookings.
3. Go to **"Flagged Bookings & Bulk Reassign"**:
   - Choose a target doctor and click **"Execute Bulk Reassign"**.
   - Verify all flagged bookings are transferred to open slots.
4. Go to **"All Appointments"** and test **"Override Cancel"**:
   - Supply mandatory administrative reason.
   - Bypasses cutoff and writes permanent entry to the **Audit Log**.
5. Go to **"Audit Log"** and observe read-only immutable log entries.
6. Go to **"Reports & Export"**: Click **"Export CSV"** and verify spreadsheet download.
7. Go to **"Booking Rules Settings"**: Adjust hold time or lead time, and test the conflict scope toggle (DEC-03).

### 7.5 Receptionist View
1. Switch to **Receptionist (Sunita Mehra)**.
2. Verify that **Doctor settings, Account governance, and Booking rules** menus are strictly hidden (RL-22).
3. Click **"Book for Aarav"** to initiate assisted booking on behalf of a patient (FR-R01).

---

## 8. Known Limitations & Out of Scope
- **No Backend Database:** Data is held in-memory and local storage during the session. State can be reset via the Demo Tools drawer.
- **No Real Payment Gateway:** Online payment is disabled at launch per BRD Section 5 (A3, DEC-02).
- **Simulated Communications:** SMS, WhatsApp, and Email alerts are logged and previewable in the Notification Center rather than dispatched via live SMS gateways.
- **Out of Scope (per BRD):** Electronic medical records (EMR), billing & insurance claims adjudication, teleconsultation video calls, pharmacy inventory, and native mobile apps.
