import { BookingConfig } from '../types';

// ==============================================================
// Configurable Business Rules (BRD-HABS-001 Section 5)
// Notice: Values marked "Suggested default, pending business confirmation" (DEC-01)
// ==============================================================

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
  // RL-05: Slot hold time (5 to 10 mins).
  slotHoldTimeMinutes: 7,

  // RL-06: Booking lead time (1 to 2 hours). No slot starting inside this window.
  bookingLeadTimeHours: 2,

  // RL-07: Booking window (30 to 60 days ahead).
  bookingWindowDays: 30,

  // RL-13: Cancellation/reschedule cutoff time (2 hours before slot start).
  cancelRescheduleCutoffHours: 2,

  // RL-14: Reschedule limit per appointment (Value TBD). Set as placeholder 'TBD' or numeric.
  rescheduleLimitPerAppointment: 'TBD',

  // DEC-04: No-show count triggering an administrator review flag (Value TBD).
  noShowFlagThreshold: 'TBD',

  // DEC-03: Whether RL-08/RL-09 apply per account holder or per person treated.
  // Default is 'person_treated' pending business decision.
  conflictCheckScope: 'person_treated',

  // A3, DEC-02: Online payment optional & disabled at launch.
  onlinePaymentEnabled: false,
};

// Fixed Demo Credentials for quick testing (documented in README)
export const DEMO_OTP = '123456';
export const OTP_EXPIRY_SECONDS = 180; // 3 minutes
export const MAX_OTP_ATTEMPTS = 3;
export const MAX_OTP_RESENDS = 2;

// Refund Policy text per BRD (A3, DEC-02):
export const REFUND_POLICY_NOTICE = 'Refund per hospital policy (to be defined by Finance).';
