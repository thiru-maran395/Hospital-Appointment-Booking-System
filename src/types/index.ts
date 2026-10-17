// ==========================================
// HABS (Hospital Appointment Booking System)
// Core Domain Models & Type Definitions
// Ref: BRD-HABS-001 (v0.1 Draft)
// ==========================================

export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
  doctorId?: string;
  patientId?: string;
  active: boolean;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  verificationStatus: 'verified' | 'pending';
  active: boolean;
  noShowCount: number;
}

export interface Dependent {
  id: string;
  guardianPatientId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  relationship: 'Child' | 'Spouse' | 'Parent' | 'Sibling' | 'Other';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
}

export interface Specialization {
  id: string;
  departmentId: string;
  name: string;
  active: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  departmentId: string;
  specializationId: string;
  fee: number;
  gender: 'male' | 'female' | 'other';
  languages: string[];
  profileText: string;
  experienceYears: number;
  qualifications: string[];
  roomNumber: string;
  avatar: string;
  active: boolean;
}

export type SlotStatus = 'open' | 'held' | 'booked' | 'blocked';

export interface WeeklyScheduleRule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  startTimeUtc: string; // "04:30" (corresponds to 10:00 AM IST)
  endTimeUtc: string;   // "09:30" (corresponds to 03:00 PM IST)
  slotDurationMinutes: number; // e.g. 30
  breaks: {
    startUtc: string; // "07:00"
    endUtc: string;   // "07:30"
    label: string;
  }[];
  active: boolean;
}

export interface Slot {
  id: string;
  doctorId: string;
  startUtc: string; // ISO 8601 string in UTC, e.g. "2026-10-18T04:30:00Z"
  endUtc: string;   // ISO 8601 string in UTC, e.g. "2026-10-18T05:00:00Z"
  status: SlotStatus;
  heldByUserId?: string;
  holdExpiresAtUtc?: string; // ISO string when hold expires
  blockedReason?: string;
  appointmentId?: string;
}

export type AppointmentStatus = 'booked' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string; // e.g. "HABS-2026-001"
  patientId: string;
  treatedPersonType: 'patient' | 'dependent';
  dependentId?: string;
  treatedPersonName: string;
  doctorId: string;
  slotId: string;
  startUtc: string;
  endUtc: string;
  reasonForVisit: string;
  status: AppointmentStatus;
  rescheduleCount: number;
  cancellationReason?: string;
  fee: number;
  paymentStatus: 'unpaid' | 'paid_offline' | 'refund_pending_policy';
  flaggedForReschedule?: boolean; // Set when doctor takes leave or hospital holiday declared
  flagReason?: string;
  createdByUserId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ConsultationNote {
  id: string;
  appointmentId: string;
  doctorId: string;
  authorName: string;
  text: string;
  timestampUtc: string;
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  startDateUtc: string; // "2026-10-20"
  endDateUtc: string;   // "2026-10-21"
  reason: string;
  status: 'approved' | 'active';
}

export interface HospitalHoliday {
  id: string;
  dateUtc: string; // "2026-10-25"
  name: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  channel: 'SMS' | 'Email' | 'WhatsApp';
  template: string;
  message: string;
  status: 'sent' | 'failed' | 'retried';
  timestampUtc: string;
  appointmentId?: string;
  isRead: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  beforeValues?: Record<string, any>;
  afterValues?: Record<string, any>;
  timestampUtc: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'patients' | 'doctors' | 'staff';
  createdAtUtc: string;
  active: boolean;
}

// Configurable rule values per Section 5 of BRD
export interface BookingConfig {
  slotHoldTimeMinutes: number;         // Suggested default: 7 mins (range 5-10, RL-05)
  bookingLeadTimeHours: number;        // Suggested default: 2 hours (range 1-2, RL-06)
  bookingWindowDays: number;           // Suggested default: 30 days (range 30-60, RL-07)
  cancelRescheduleCutoffHours: number; // 2 hours (RL-13)
  rescheduleLimitPerAppointment: number | 'TBD'; // Placeholder 'TBD' (RL-14)
  noShowFlagThreshold: number | 'TBD'; // Placeholder 'TBD' (DEC-04)
  conflictCheckScope: 'person_treated' | 'account_holder'; // Open point DEC-03: default per person treated
  onlinePaymentEnabled: false;         // Disabled at launch per A3, DEC-02
}
