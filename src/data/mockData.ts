import {
  User,
  Patient,
  Dependent,
  Department,
  Specialization,
  Doctor,
  WeeklyScheduleRule,
  Appointment,
  ConsultationNote,
  DoctorLeave,
  HospitalHoliday,
  NotificationItem,
  AuditLogEntry,
  Announcement,
  Slot,
} from '../types';
import { generateDoctorSlotsForDate } from '../utils/slotGenerator';

// ==========================================
// 1. Departments & Specializations
// ==========================================
export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-cardio', name: 'Cardiology', code: 'CARD', description: 'Comprehensive cardiac care & heart health', active: true },
  { id: 'dept-neuro', name: 'Neurology', code: 'NEUR', description: 'Brain, spine and nervous system disorders', active: true },
  { id: 'dept-ortho', name: 'Orthopedics', code: 'ORTH', description: 'Joint replacement, trauma & sports injury', active: true },
  { id: 'dept-pedia', name: 'Pediatrics', code: 'PED', description: 'Infant, child and adolescent healthcare', active: true },
  { id: 'dept-derma', name: 'Dermatology', code: 'DERM', description: 'Clinical & aesthetic skin conditions', active: true },
  { id: 'dept-genmed', name: 'General Medicine', code: 'GMED', description: 'Internal medicine & chronic illness care', active: true },
  { id: 'dept-ophta', name: 'Ophthalmology', code: 'OPHT', description: 'Vision care, cataract & cornea clinic', active: true },
];

export const INITIAL_SPECIALIZATIONS: Specialization[] = [
  { id: 'spec-interv-cardio', departmentId: 'dept-cardio', name: 'Interventional Cardiology', active: true },
  { id: 'spec-prevent-cardio', departmentId: 'dept-cardio', name: 'Preventive Heart Care', active: true },
  { id: 'spec-stroke', departmentId: 'dept-neuro', name: 'Stroke & Neuro-rehab', active: true },
  { id: 'spec-epilepsy', departmentId: 'dept-neuro', name: 'Epilepsy & Migraine', active: true },
  { id: 'spec-joint', departmentId: 'dept-ortho', name: 'Joint Replacement', active: true },
  { id: 'spec-sports-inj', departmentId: 'dept-ortho', name: 'Sports Arthroscopy', active: true },
  { id: 'spec-pedia-inf', departmentId: 'dept-pedia', name: 'Pediatric Infectious Diseases', active: true },
  { id: 'spec-derma-auto', departmentId: 'dept-derma', name: 'Autoimmune Dermatology', active: true },
  { id: 'spec-internist', departmentId: 'dept-genmed', name: 'Internal Medicine', active: true },
  { id: 'spec-cornea', departmentId: 'dept-ophta', name: 'Cornea & Cataract Surgery', active: true },
];

// ==========================================
// 2. Demo Users (All 4 Roles)
// ==========================================
export const DEMO_USERS: User[] = [
  {
    id: 'user-pat-1',
    name: 'Aarav Sharma',
    role: 'patient',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    patientId: 'pat-1',
    active: true,
  },
  {
    id: 'user-pat-2',
    name: 'Pooja Iyer',
    role: 'patient',
    email: 'pooja.iyer@example.com',
    phone: '+91 98765 43211',
    patientId: 'pat-2',
    active: true,
  },
  {
    id: 'user-doc-1',
    name: 'Dr. Sarah Jenkins',
    role: 'doctor',
    email: 'sarah.jenkins@habs.org',
    phone: '+91 91234 56780',
    doctorId: 'doc-1',
    active: true,
  },
  {
    id: 'user-doc-2',
    name: 'Dr. Rajesh Nair',
    role: 'doctor',
    email: 'rajesh.nair@habs.org',
    phone: '+91 91234 56781',
    doctorId: 'doc-2',
    active: true,
  },
  {
    id: 'user-recep-1',
    name: 'Sunita Mehra (Reception)',
    role: 'receptionist',
    email: 'reception.desk@habs.org',
    phone: '+91 98111 22334',
    active: true,
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Vikram Seth (Medical Director)',
    role: 'admin',
    email: 'admin@habs.org',
    phone: '+91 99000 11223',
    active: true,
  },
];

// ==========================================
// 3. Patients & Dependents
// ==========================================
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    userId: 'user-pat-1',
    name: 'Aarav Sharma',
    age: 38,
    gender: 'male',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.com',
    address: 'Flat 402, Lotus Towers, Indiranagar, Bengaluru, 560038',
    verificationStatus: 'verified',
    active: true,
    noShowCount: 0,
  },
  {
    id: 'pat-2',
    userId: 'user-pat-2',
    name: 'Pooja Iyer',
    age: 31,
    gender: 'female',
    phone: '+91 98765 43211',
    email: 'pooja.iyer@example.com',
    address: 'B-12, Green Glen Layout, Bellandur, Bengaluru, 560103',
    verificationStatus: 'verified',
    active: true,
    noShowCount: 1,
  },
  {
    id: 'pat-3',
    userId: 'user-pat-3',
    name: 'Ramesh Kulkarni',
    age: 62,
    gender: 'male',
    phone: '+91 98765 43212',
    email: 'ramesh.k@example.com',
    address: '15/A, 4th Cross, Malleshwaram, Bengaluru, 560003',
    verificationStatus: 'verified',
    active: true,
    noShowCount: 3, // High no-show count for admin flag report demonstration!
  },
  {
    id: 'pat-4',
    userId: 'user-pat-4',
    name: 'Deepa Roy',
    age: 45,
    gender: 'female',
    phone: '+91 98765 43213',
    email: 'deepa.roy@example.com',
    address: '78, 1st Main, Koramangala 3rd Block, Bengaluru, 560034',
    verificationStatus: 'verified',
    active: true,
    noShowCount: 2, // Flags DEC-04
  },
];

export const INITIAL_DEPENDENTS: Dependent[] = [
  {
    id: 'dep-1',
    guardianPatientId: 'pat-1',
    name: 'Kabir Sharma',
    age: 7,
    gender: 'male',
    relationship: 'Child',
  },
  {
    id: 'dep-2',
    guardianPatientId: 'pat-1',
    name: 'Meera Sharma',
    age: 68,
    gender: 'female',
    relationship: 'Parent',
  },
  {
    id: 'dep-3',
    guardianPatientId: 'pat-2',
    name: 'Arjun Iyer',
    age: 4,
    gender: 'male',
    relationship: 'Child',
  },
];

// ==========================================
// 4. Doctors (Various Genders, Languages, and One Fully Unavailable)
// ==========================================
export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    userId: 'user-doc-1',
    name: 'Dr. Sarah Jenkins',
    departmentId: 'dept-cardio',
    specializationId: 'spec-interv-cardio',
    fee: 800,
    gender: 'female',
    languages: ['English', 'Hindi'],
    profileText: 'Senior Consultant Cardiologist specializing in preventive heart assessments and coronary angioplasty with 15+ years of clinical excellence.',
    experienceYears: 16,
    qualifications: ['MBBS', 'MD (Gen Med)', 'DM (Cardiology)', 'FACC'],
    roomNumber: 'Suite 304, West Wing',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    active: true,
  },
  {
    id: 'doc-2',
    userId: 'user-doc-2',
    name: 'Dr. Rajesh Nair',
    departmentId: 'dept-neuro',
    specializationId: 'spec-stroke',
    fee: 950,
    gender: 'male',
    languages: ['English', 'Malayalam', 'Tamil', 'Hindi'],
    profileText: 'Chief Neurologist leading stroke rehabilitation, complex migraine protocols, and neuro-muscular disorders.',
    experienceYears: 19,
    qualifications: ['MBBS', 'MD', 'DM (Neurology)', 'FRCP (Edin)'],
    roomNumber: 'Room 412, North Tower',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    active: true,
  },
  {
    id: 'doc-3',
    userId: 'user-doc-3',
    name: 'Dr. Elena Rostova',
    departmentId: 'dept-ortho',
    specializationId: 'spec-joint',
    fee: 900,
    gender: 'female',
    languages: ['English', 'Russian'],
    profileText: 'Orthopedic surgeon recognized for minimally invasive robotic knee and hip joint replacements with accelerated recovery.',
    experienceYears: 14,
    qualifications: ['MBBS', 'MS (Ortho)', 'Fellowship in Robotic Arthroplasty'],
    roomNumber: 'Room 108, Ground Floor',
    avatar: 'https://images.unsplash.com/photo-1594824813627-86c55d04523e?auto=format&fit=crop&q=80&w=300',
    active: true,
  },
  {
    id: 'doc-4',
    userId: 'user-doc-4',
    name: 'Dr. David Kim',
    departmentId: 'dept-pedia',
    specializationId: 'spec-pedia-inf',
    fee: 650,
    gender: 'male',
    languages: ['English', 'Korean'],
    profileText: 'Lead Pediatrician dedicated to warm child diagnostics, childhood immunization, and adolescent growth medicine.',
    experienceYears: 12,
    qualifications: ['MBBS', 'MD (Pediatrics)', 'FAAP'],
    roomNumber: 'Suite 201, Children Pavilion',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    active: true,
  },
  {
    id: 'doc-5',
    userId: 'user-doc-5',
    name: 'Dr. Maya Patel',
    departmentId: 'dept-derma',
    specializationId: 'spec-derma-auto',
    fee: 750,
    gender: 'female',
    languages: ['English', 'Hindi', 'Gujarati'],
    profileText: 'Clinical dermatologist specialized in severe eczema, autoimmune dermatitis, and advanced dermoscopy.',
    experienceYears: 11,
    qualifications: ['MBBS', 'MD (Dermatology & Venereology)'],
    roomNumber: 'Suite 218, 2nd Floor',
    avatar: 'https://images.unsplash.com/photo-1559839734-6014e2d3df24?auto=format&fit=crop&q=80&w=300',
    active: true,
  },
  {
    id: 'doc-6',
    userId: 'user-doc-6',
    name: 'Dr. Robert Chen',
    departmentId: 'dept-genmed',
    specializationId: 'spec-internist',
    fee: 600,
    gender: 'male',
    languages: ['English', 'Mandarin'],
    profileText: 'Internal medicine specialist treating multi-system geriatric disorders, hypertension, and type 2 diabetes management.',
    experienceYears: 22,
    qualifications: ['MBBS', 'MD (Internal Med)', 'FACP'],
    roomNumber: 'Room 102, Main OPD',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    active: true,
  },
  // Doctor 7: Explicitly has NO OPEN SLOTS / Unavailable (as required by BRD section 6 & 7.1.4)
  {
    id: 'doc-7',
    userId: 'user-doc-7',
    name: 'Dr. Ananya Sharma',
    departmentId: 'dept-ophta',
    specializationId: 'spec-cornea',
    fee: 850,
    gender: 'female',
    languages: ['English', 'Hindi', 'Bengali'],
    profileText: 'Cornea transplant and laser eye microsurgeon. Currently fully booked / on sabbatical.',
    experienceYears: 13,
    qualifications: ['MBBS', 'MS (Ophthalmology)', 'FRCS (Edin)'],
    roomNumber: 'Room 310, Eye Center',
    avatar: 'https://images.unsplash.com/photo-1594824813615-18a705e4fb73?auto=format&fit=crop&q=80&w=300',
    active: true, // Active doctor but has no schedule / 0 available slots!
  },
];

// ==========================================
// 5. Weekly Schedule Rules
// ==========================================
export const INITIAL_SCHEDULE_RULES: WeeklyScheduleRule[] = [
  // Dr. Sarah Jenkins (Mon to Fri, 10:00 to 14:00 IST = 04:30 to 08:30 UTC, 30 min slots, break 12:00-12:30 IST)
  ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({
    id: `rule-doc1-day${dayOfWeek}`,
    doctorId: 'doc-1',
    dayOfWeek,
    startTimeUtc: '10:00', // Wall-clock IST time
    endTimeUtc: '14:00',
    slotDurationMinutes: 30,
    breaks: [{ startUtc: '12:00', endUtc: '12:30', label: 'Lunch Break' }],
    active: true,
  })),
  // Dr. Rajesh Nair (Mon, Wed, Fri, 09:30 to 13:30 IST)
  ...[1, 3, 5].map((dayOfWeek) => ({
    id: `rule-doc2-day${dayOfWeek}`,
    doctorId: 'doc-2',
    dayOfWeek,
    startTimeUtc: '09:30',
    endTimeUtc: '13:30',
    slotDurationMinutes: 30,
    breaks: [{ startUtc: '11:30', endUtc: '12:00', label: 'Tea Break' }],
    active: true,
  })),
  // Dr. Elena Rostova (Tue, Thu, Sat, 11:00 to 15:00 IST)
  ...[2, 4, 6].map((dayOfWeek) => ({
    id: `rule-doc3-day${dayOfWeek}`,
    doctorId: 'doc-3',
    dayOfWeek,
    startTimeUtc: '11:00',
    endTimeUtc: '15:00',
    slotDurationMinutes: 30,
    breaks: [{ startUtc: '13:00', endUtc: '13:30', label: 'Lunch Break' }],
    active: true,
  })),
  // Dr. David Kim (Mon, Tue, Thu, Fri, 09:00 to 13:00 IST)
  ...[1, 2, 4, 5].map((dayOfWeek) => ({
    id: `rule-doc4-day${dayOfWeek}`,
    doctorId: 'doc-4',
    dayOfWeek,
    startTimeUtc: '09:00',
    endTimeUtc: '13:00',
    slotDurationMinutes: 30,
    breaks: [],
    active: true,
  })),
  // Dr. Maya Patel (Mon, Wed, Sat, 14:00 to 17:00 IST)
  ...[1, 3, 6].map((dayOfWeek) => ({
    id: `rule-doc5-day${dayOfWeek}`,
    doctorId: 'doc-5',
    dayOfWeek,
    startTimeUtc: '14:00',
    endTimeUtc: '17:00',
    slotDurationMinutes: 30,
    breaks: [],
    active: true,
  })),
  // Dr. Robert Chen (Mon to Fri, 09:00 to 12:00 IST)
  ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({
    id: `rule-doc6-day${dayOfWeek}`,
    doctorId: 'doc-6',
    dayOfWeek,
    startTimeUtc: '09:00',
    endTimeUtc: '12:00',
    slotDurationMinutes: 30,
    breaks: [],
    active: true,
  })),
  // doc-7 has NO schedule rules => 0 slots generated => shown as unavailable!
];

// Helper to calculate future date string "YYYY-MM-DD"
export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// 6. Leaves & Hospital Holidays
// ==========================================
// Hospital Holiday: 5 days from today
export const INITIAL_HOLIDAYS: HospitalHoliday[] = [
  {
    id: 'hol-1',
    dateUtc: getRelativeDateString(5),
    name: 'National Healthcare Holiday (Gandhi Jayanti / Hospital Day)',
    active: true,
  },
];

// Doctor Leave: Dr. Rajesh Nair on leave 3 days from today (affects existing booking!)
export const INITIAL_LEAVES: DoctorLeave[] = [
  {
    id: 'leave-doc2-1',
    doctorId: 'doc-2',
    startDateUtc: getRelativeDateString(3),
    endDateUtc: getRelativeDateString(3),
    reason: 'Attending International Neurological Conference',
    status: 'approved',
  },
];

// ==========================================
// 7. Initial Programmatic Slots
// ==========================================
export function generateInitialSlots(): Slot[] {
  const allSlots: Slot[] = [];
  // Generate for the next 14 days
  for (let offset = 0; offset <= 14; offset++) {
    const dateStr = getRelativeDateString(offset);
    for (const rule of INITIAL_SCHEDULE_RULES) {
      const slots = generateDoctorSlotsForDate(rule, dateStr, INITIAL_LEAVES, INITIAL_HOLIDAYS);
      allSlots.push(...slots);
    }
  }
  return allSlots;
}

// ==========================================
// 8. Initial Appointments (Upcoming, Past, Completed, Cancelled, Flagged)
// ==========================================
export const INITIAL_APPOINTMENTS: Appointment[] = [
  // 1. Upcoming confirmed appointment for Aarav Sharma with Dr. Sarah Jenkins (Tomorrow at 10:00 AM IST)
  {
    id: 'HABS-2026-001',
    patientId: 'pat-1',
    treatedPersonType: 'patient',
    treatedPersonName: 'Aarav Sharma',
    doctorId: 'doc-1',
    slotId: `slot-doc-1-${getRelativeDateString(1)}-1000`,
    startUtc: new Date(Date.now() + 86400000).toISOString(),
    endUtc: new Date(Date.now() + 86400000 + 1800000).toISOString(),
    reasonForVisit: 'Exertional chest tightness and shortness of breath during morning jogging.',
    status: 'booked',
    rescheduleCount: 0,
    fee: 800,
    paymentStatus: 'unpaid',
    createdByUserId: 'user-pat-1',
    createdAtUtc: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAtUtc: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  // 2. Upcoming appointment for Aarav Sharma's Dependent (Kabir Sharma, age 7) with Dr. David Kim (2 days ahead)
  {
    id: 'HABS-2026-002',
    patientId: 'pat-1',
    treatedPersonType: 'dependent',
    dependentId: 'dep-1',
    treatedPersonName: 'Kabir Sharma (Child)',
    doctorId: 'doc-4',
    slotId: `slot-doc-4-${getRelativeDateString(2)}-0930`,
    startUtc: new Date(Date.now() + 86400000 * 2).toISOString(),
    endUtc: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
    reasonForVisit: 'Childhood seasonal persistent cough and mild night wheezing.',
    status: 'booked',
    rescheduleCount: 0,
    fee: 650,
    paymentStatus: 'unpaid',
    createdByUserId: 'user-pat-1',
    createdAtUtc: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAtUtc: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  // 3. FLAGGED FOR RESCHEDULE: Appointment for Pooja Iyer with Dr. Rajesh Nair on leave date (3 days ahead)
  // RL-16: Existing booking flagged for rescheduling when doctor takes leave!
  {
    id: 'HABS-2026-003',
    patientId: 'pat-2',
    treatedPersonType: 'patient',
    treatedPersonName: 'Pooja Iyer',
    doctorId: 'doc-2',
    slotId: `slot-doc-2-${getRelativeDateString(3)}-1000`,
    startUtc: new Date(Date.now() + 86400000 * 3).toISOString(),
    endUtc: new Date(Date.now() + 86400000 * 3 + 1800000).toISOString(),
    reasonForVisit: 'Chronic unilateral throbbing migraine with visual aura.',
    status: 'booked',
    rescheduleCount: 0,
    fee: 950,
    paymentStatus: 'paid_offline',
    flaggedForReschedule: true,
    flagReason: 'Doctor on Approved Leave: Attending International Neurological Conference (RL-16)',
    createdByUserId: 'user-pat-2',
    createdAtUtc: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAtUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  // 4. Past Completed appointment with consultation note
  {
    id: 'HABS-2026-004',
    patientId: 'pat-1',
    treatedPersonType: 'patient',
    treatedPersonName: 'Aarav Sharma',
    doctorId: 'doc-6',
    slotId: `slot-doc-6-${getRelativeDateString(-5)}-0900`,
    startUtc: new Date(Date.now() - 86400000 * 5).toISOString(),
    endUtc: new Date(Date.now() - 86400000 * 5 + 1800000).toISOString(),
    reasonForVisit: 'Annual preventive blood work review & routine lipid checkup.',
    status: 'completed',
    rescheduleCount: 0,
    fee: 600,
    paymentStatus: 'paid_offline',
    createdByUserId: 'user-pat-1',
    createdAtUtc: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAtUtc: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  // 5. Past No-Show appointment (Ramesh Kulkarni with Dr. Sarah Jenkins)
  {
    id: 'HABS-2026-005',
    patientId: 'pat-3',
    treatedPersonType: 'patient',
    treatedPersonName: 'Ramesh Kulkarni',
    doctorId: 'doc-1',
    slotId: `slot-doc-1-${getRelativeDateString(-2)}-1100`,
    startUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
    endUtc: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    reasonForVisit: 'Follow up for anti-hypertensive medication review.',
    status: 'no-show',
    rescheduleCount: 0,
    fee: 800,
    paymentStatus: 'unpaid',
    createdByUserId: 'user-pat-3',
    createdAtUtc: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAtUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  // 6. Past Cancelled appointment
  {
    id: 'HABS-2026-006',
    patientId: 'pat-2',
    treatedPersonType: 'patient',
    treatedPersonName: 'Pooja Iyer',
    doctorId: 'doc-5',
    slotId: `slot-doc-5-${getRelativeDateString(-1)}-1430`,
    startUtc: new Date(Date.now() - 86400000).toISOString(),
    endUtc: new Date(Date.now() - 86400000 + 1800000).toISOString(),
    reasonForVisit: 'Skin allergy rash evaluation.',
    status: 'cancelled',
    cancellationReason: 'Patient travel emergency (RL-11)',
    rescheduleCount: 1,
    fee: 750,
    paymentStatus: 'refund_pending_policy',
    createdByUserId: 'user-pat-2',
    createdAtUtc: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAtUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// ==========================================
// 9. Consultation Notes (Visible only to author & authorized roles)
// ==========================================
export const INITIAL_CONSULTATION_NOTES: ConsultationNote[] = [
  {
    id: 'note-1',
    appointmentId: 'HABS-2026-004',
    doctorId: 'doc-6',
    authorName: 'Dr. Robert Chen',
    text: 'Patient presented for annual health screening. BP: 122/78 mmHg. Fasting blood sugar within normal limits (94 mg/dL). Recommended continuing Mediterranean diet and 30 mins daily walking. Repeat lipid profile in 12 months.',
    timestampUtc: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// ==========================================
// 10. Notifications (Simulated SMS / Email / WhatsApp)
// ==========================================
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    recipientId: 'user-pat-1',
    recipientName: 'Aarav Sharma',
    recipientRole: 'patient',
    channel: 'SMS',
    template: 'BOOKING_CONFIRMATION',
    message: 'HABS: Your appointment with Dr. Sarah Jenkins is confirmed for tomorrow 10:00 AM IST. Ref: HABS-2026-001. Room 304.',
    status: 'sent',
    timestampUtc: new Date(Date.now() - 3600000 * 24).toISOString(),
    appointmentId: 'HABS-2026-001',
    isRead: false,
  },
  {
    id: 'notif-2',
    recipientId: 'user-pat-2',
    recipientName: 'Pooja Iyer',
    recipientRole: 'patient',
    channel: 'WhatsApp',
    template: 'DOCTOR_LEAVE_ALERT',
    message: 'HABS Urgent: Dr. Rajesh Nair will be on approved leave on your appointment date. Your booking HABS-2026-003 is flagged for free priority rescheduling or hospital refund.',
    status: 'sent',
    timestampUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
    appointmentId: 'HABS-2026-003',
    isRead: false,
  },
  {
    id: 'notif-3',
    recipientId: 'user-doc-1',
    recipientName: 'Dr. Sarah Jenkins',
    recipientRole: 'doctor',
    channel: 'Email',
    template: 'NEW_BOOKING_ROSTER',
    message: 'New consultation booked: Aarav Sharma scheduled for tomorrow 10:00 AM IST. Symptoms: Exertional chest tightness.',
    status: 'sent',
    timestampUtc: new Date(Date.now() - 3600000 * 24).toISOString(),
    appointmentId: 'HABS-2026-001',
    isRead: true,
  },
  {
    id: 'notif-4',
    recipientId: 'user-pat-3',
    recipientName: 'Ramesh Kulkarni',
    recipientRole: 'patient',
    channel: 'SMS',
    template: 'NO_SHOW_NOTICE',
    message: 'HABS: You were marked as No-Show for appointment HABS-2026-005 with Dr. Sarah Jenkins. Please contact the clinic to reschedule.',
    status: 'sent',
    timestampUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
    appointmentId: 'HABS-2026-005',
    isRead: true,
  },
  {
    id: 'notif-5',
    recipientId: 'user-pat-4',
    recipientName: 'Deepa Roy',
    recipientRole: 'patient',
    channel: 'Email',
    template: 'REMINDER_FAILED_RETRY',
    message: 'HABS: 24-Hour Visit Reminder. Gateway timeout on initial attempt; successfully retried via backup SMTP server.',
    status: 'retried',
    timestampUtc: new Date(Date.now() - 3600000 * 6).toISOString(),
    isRead: true,
  },
];

// ==========================================
// 11. Read-Only Audit Log (RL-23)
// ==========================================
export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'audit-001',
    userId: 'user-pat-1',
    userName: 'Aarav Sharma',
    userRole: 'patient',
    action: 'BOOK_APPOINTMENT',
    entity: 'Appointment',
    entityId: 'HABS-2026-001',
    afterValues: { doctorId: 'doc-1', status: 'booked', fee: 800 },
    timestampUtc: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'audit-002',
    userId: 'user-admin-1',
    userName: 'Dr. Vikram Seth (Medical Director)',
    userRole: 'admin',
    action: 'APPROVE_LEAVE',
    entity: 'DoctorLeave',
    entityId: 'leave-doc2-1',
    afterValues: { doctorId: 'doc-2', reason: 'Conference', flaggedAppointments: ['HABS-2026-003'] },
    timestampUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'audit-003',
    userId: 'user-doc-1',
    userName: 'Dr. Sarah Jenkins',
    userRole: 'doctor',
    action: 'MARK_NO_SHOW',
    entity: 'Appointment',
    entityId: 'HABS-2026-005',
    beforeValues: { status: 'booked' },
    afterValues: { status: 'no-show', patientNoShowCountIncrement: 1 },
    timestampUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// ==========================================
// 12. Announcements (FR-A09)
// ==========================================
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Hospital OPD Timings & New Robotic Joint Wing Open',
    content: 'MetroHealth is proud to announce the launch of our advanced robotic joint replacement center under Dr. Elena Rostova.',
    targetAudience: 'all',
    createdAtUtc: new Date(Date.now() - 86400000 * 3).toISOString(),
    active: true,
  },
];
