import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Patient,
  Dependent,
  Department,
  Specialization,
  Doctor,
  Slot,
  Appointment,
  ConsultationNote,
  DoctorLeave,
  HospitalHoliday,
  NotificationItem,
  AuditLogEntry,
  Announcement,
  BookingConfig,
  WeeklyScheduleRule,
  AppointmentStatus,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_PATIENTS,
  INITIAL_DEPENDENTS,
  INITIAL_DEPARTMENTS,
  INITIAL_SPECIALIZATIONS,
  INITIAL_DOCTORS,
  INITIAL_SCHEDULE_RULES,
  INITIAL_HOLIDAYS,
  INITIAL_LEAVES,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATION_NOTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOG,
  INITIAL_ANNOUNCEMENTS,
  generateInitialSlots,
} from '../data/mockData';
import { DEFAULT_BOOKING_CONFIG, DEMO_OTP } from '../data/config';
import { validateBookingSlot, validateCancellationCutoff, validateRescheduleRules } from '../utils/bookingRules';
import { generateDoctorSlotsForDate } from '../utils/slotGenerator';
import { formatIstDateKey, formatIstTime, formatIstDate } from '../utils/time';

interface AppContextType {
  // Current user & authentication
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  patients: Patient[];
  currentPatient: Patient | null;
  dependents: Dependent[];
  addDependent: (dependent: Omit<Dependent, 'id'>) => void;
  updatePatientProfile: (updates: Partial<Patient>) => void;

  // Masters
  departments: Department[];
  specializations: Specialization[];
  doctors: Doctor[];
  scheduleRules: WeeklyScheduleRule[];
  holidays: HospitalHoliday[];
  leaves: DoctorLeave[];
  config: BookingConfig;
  updateConfig: (newConfig: Partial<BookingConfig>) => void;
  bookingConfig: BookingConfig;
  updateBookingConfig: (newConfig: Partial<BookingConfig>) => void;

  // Slots & Appointments
  slots: Slot[];
  appointments: Appointment[];
  activeHoldSlot: Slot | null;
  holdSecondsRemaining: number;
  consultationNotes: ConsultationNote[];

  // Notifications & Audit Log
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  announcements: Announcement[];

  // Booking Journey actions (7.1)
  holdSlot: (slotId: string) => { success: boolean; error?: string };
  releaseHoldSlot: (slotId?: string) => void;
  confirmBooking: (params: {
    slotId: string;
    treatedPersonType: 'patient' | 'dependent';
    dependentId?: string;
    treatedPersonName: string;
    reasonForVisit: string;
    bookingOnBehalfPatientId?: string; // For receptionist role
  }) => { success: boolean; appointment?: Appointment; error?: string };

  // Cancellation & Rescheduling (7.2)
  cancelAppointment: (params: {
    appointmentId: string;
    reason: string;
    isAdminOverride?: boolean;
  }) => { success: boolean; error?: string };

  rescheduleAppointment: (params: {
    appointmentId: string;
    newSlotId: string;
    isAdminOverride?: boolean;
    simulateFailure?: boolean; // Demo tools toggle
  }) => { success: boolean; appointment?: Appointment; error?: string };

  // Doctor Actions (7.3)
  markAppointmentStatus: (
    appointmentId: string,
    status: AppointmentStatus,
    noteText?: string
  ) => { success: boolean; error?: string };

  addConsultationNote: (appointmentId: string, text: string) => void;

  applyDoctorLeave: (params: {
    doctorId: string;
    startDateUtc: string;
    endDateUtc: string;
    reason: string;
  }) => { success: boolean; affectedAppointments: Appointment[] };

  emergencyBlockDay: (doctorId: string, dateUtc: string, reason: string) => {
    success: boolean;
    affectedAppointments: Appointment[];
  };

  updateDoctorSchedule: (newRule: WeeklyScheduleRule) => { success: boolean; error?: string };

  // Admin Actions (7.4)
  adminReassignAppointment: (appointmentId: string, targetDoctorId: string, targetSlotId: string) => {
    success: boolean;
    error?: string;
  };

  adminBulkReassignFlagged: (targetDoctorId: string) => { reassignedCount: number };

  toggleUserActiveStatus: (userId: string) => void;
  addDoctor: (newDoctor: Omit<Doctor, 'id'>) => void;
  updateDoctorFee: (doctorId: string, newFee: number) => void;
  addHospitalHoliday: (dateUtc: string, name: string) => { affectedCount: number };
  addAnnouncement: (title: string, content: string, targetAudience: Announcement['targetAudience']) => void;

  // Demo Tools
  simulateSimultaneousCollision: boolean;
  setSimulateSimultaneousCollision: (val: boolean) => void;
  simulateRescheduleFailure: boolean;
  setSimulateRescheduleFailure: (val: boolean) => void;
  simulateNotificationFailure: boolean;
  setSimulateNotificationFailure: (val: boolean) => void;
  expireHoldNow: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'habs_prototype_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user (default: patient Aarav Sharma for immediate usability)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [dependents, setDependents] = useState<Dependent[]>(INITIAL_DEPENDENTS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [specializations, setSpecializations] = useState<Specialization[]>(INITIAL_SPECIALIZATIONS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [scheduleRules, setScheduleRules] = useState<WeeklyScheduleRule[]>(INITIAL_SCHEDULE_RULES);
  const [holidays, setHolidays] = useState<HospitalHoliday[]>(INITIAL_HOLIDAYS);
  const [leaves, setLeaves] = useState<DoctorLeave[]>(INITIAL_LEAVES);
  const [slots, setSlots] = useState<Slot[]>(() => generateInitialSlots());
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>(INITIAL_CONSULTATION_NOTES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [config, setConfig] = useState<BookingConfig>(DEFAULT_BOOKING_CONFIG);

  // Active slot hold state (RL-05)
  const [activeHoldSlot, setActiveHoldSlot] = useState<Slot | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(0);

  // Demo Tools flags
  const [simulateSimultaneousCollision, setSimulateSimultaneousCollision] = useState<boolean>(false);
  const [simulateRescheduleFailure, setSimulateRescheduleFailure] = useState<boolean>(false);
  const [simulateNotificationFailure, setSimulateNotificationFailure] = useState<boolean>(false);

  // Sync current patient profile
  const currentPatient = patients.find((p) => p.userId === currentUser?.id) || null;

  // Persist current user in local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [currentUser]);

  // Append audit log helper (RL-23: read-only immutable log)
  const logAudit = useCallback((action: string, entity: string, entityId: string, before?: any, after?: any) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System Auto',
      userRole: currentUser?.role || 'patient',
      action,
      entity,
      entityId,
      beforeValues: before,
      afterValues: after,
      timestampUtc: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  }, [currentUser]);

  // Append simulated notification helper (7.6, US-14)
  const sendNotification = useCallback(
    (
      recipientId: string,
      recipientName: string,
      recipientRole: User['role'],
      channel: 'SMS' | 'Email' | 'WhatsApp',
      template: string,
      message: string,
      appointmentId?: string
    ) => {
      const isFailed = simulateNotificationFailure;
      const status: NotificationItem['status'] = isFailed ? 'failed' : 'sent';

      const notif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        recipientId,
        recipientName,
        recipientRole,
        channel,
        template,
        message,
        status,
        timestampUtc: new Date().toISOString(),
        appointmentId,
        isRead: false,
      };

      setNotifications((prev) => [notif, ...prev]);

      // If simulated failure, automatically schedule a simulated retry
      if (isFailed) {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notif.id
                ? {
                    ...n,
                    status: 'retried',
                    message: `${n.message} (Retried successfully via fallback gateway)`,
                  }
                : n
            )
          );
        }, 3000);
      }
    },
    [simulateNotificationFailure]
  );

  // -------------------------------------------------------------
  // Countdown Timer for Active Slot Hold (RL-05, US-04)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!activeHoldSlot || holdSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setHoldSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Hold expired! Release slot automatically (RL-05)
          setSlots((currentSlots) =>
            currentSlots.map((s) =>
              s.id === activeHoldSlot.id && s.status === 'held'
                ? { ...s, status: 'open', heldByUserId: undefined, holdExpiresAtUtc: undefined }
                : s
            )
          );
          setActiveHoldSlot(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHoldSlot, holdSecondsRemaining]);

  // -------------------------------------------------------------
  // Feature 7.1: Patient Booking Actions
  // -------------------------------------------------------------
  const holdSlot = (slotId: string): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Please log in to hold and book an appointment (RL-01, US-03).' };
    }

    // Release any previous hold by this user first
    if (activeHoldSlot && activeHoldSlot.id !== slotId) {
      releaseHoldSlot(activeHoldSlot.id);
    }

    const targetSlot = slots.find((s) => s.id === slotId);
    if (!targetSlot) {
      return { success: false, error: 'Slot not found.' };
    }

    // RL-02, RL-03: Occupied or held slot check
    if (targetSlot.status === 'booked') {
      return { success: false, error: 'This slot has already been booked by another patient (RL-02).' };
    }
    if (targetSlot.status === 'held' && targetSlot.heldByUserId !== currentUser.id) {
      return { success: false, error: 'This slot is currently held by another user in active checkout (RL-03, RL-05).' };
    }
    if (targetSlot.status === 'blocked') {
      return { success: false, error: `This slot is unavailable: ${targetSlot.blockedReason || 'Blocked by hospital'}.` };
    }

    // Demo tools simulated collision
    if (simulateSimultaneousCollision) {
      return {
        success: false,
        error: 'Simultaneous booking collision simulated! Another patient secured this slot milliseconds earlier. Please select another slot.',
      };
    }

    const holdDurationSec = config.slotHoldTimeMinutes * 60;
    const expiresAtUtc = new Date(Date.now() + holdDurationSec * 1000).toISOString();

    const updatedSlot: Slot = {
      ...targetSlot,
      status: 'held',
      heldByUserId: currentUser.id,
      holdExpiresAtUtc: expiresAtUtc,
    };

    setSlots((prev) => prev.map((s) => (s.id === slotId ? updatedSlot : s)));
    setActiveHoldSlot(updatedSlot);
    setHoldSecondsRemaining(holdDurationSec);

    return { success: true };
  };

  const releaseHoldSlot = (slotId?: string) => {
    const idToRelease = slotId || activeHoldSlot?.id;
    if (!idToRelease) return;

    setSlots((prev) =>
      prev.map((s) =>
        s.id === idToRelease && s.status === 'held'
          ? { ...s, status: 'open', heldByUserId: undefined, holdExpiresAtUtc: undefined }
          : s
      )
    );
    if (activeHoldSlot?.id === idToRelease) {
      setActiveHoldSlot(null);
      setHoldSecondsRemaining(0);
    }
  };

  const confirmBooking = ({
    slotId,
    treatedPersonType,
    dependentId,
    treatedPersonName,
    reasonForVisit,
    bookingOnBehalfPatientId,
  }: {
    slotId: string;
    treatedPersonType: 'patient' | 'dependent';
    dependentId?: string;
    treatedPersonName: string;
    reasonForVisit: string;
    bookingOnBehalfPatientId?: string;
  }): { success: boolean; appointment?: Appointment; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Authentication required to confirm booking (RL-01).' };
    }

    // Determine target patient
    const targetPatientId =
      currentUser.role === 'receptionist' && bookingOnBehalfPatientId
        ? bookingOnBehalfPatientId
        : currentPatient?.id;

    if (!targetPatientId) {
      return { success: false, error: 'Patient profile not selected.' };
    }

    const targetPatient = patients.find((p) => p.id === targetPatientId);
    if (!targetPatient) {
      return { success: false, error: 'Patient record not found.' };
    }

    const targetSlot = slots.find((s) => s.id === slotId);
    if (!targetSlot) {
      return { success: false, error: 'Selected time slot does not exist.' };
    }

    // Validate rules RL-01 through RL-09
    const validation = validateBookingSlot({
      slot: targetSlot,
      doctorId: targetSlot.doctorId,
      treatedPersonId: treatedPersonType === 'dependent' && dependentId ? dependentId : targetPatientId,
      isDependent: treatedPersonType === 'dependent',
      patientAppointments: appointments,
      config,
      isAdminOverride: currentUser.role === 'admin',
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Ensure slot is held by this user or open
    if (targetSlot.status === 'held' && targetSlot.heldByUserId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, error: 'Slot hold has expired or been claimed by another patient (RL-05).' };
    }

    const doctor = doctors.find((d) => d.id === targetSlot.doctorId);
    if (!doctor) {
      return { success: false, error: 'Doctor not found.' };
    }

    const newAppointmentId = `HABS-2026-${String(appointments.length + 1).padStart(3, '0')}`;

    const newAppointment: Appointment = {
      id: newAppointmentId,
      patientId: targetPatientId,
      treatedPersonType,
      dependentId,
      treatedPersonName,
      doctorId: targetSlot.doctorId,
      slotId: targetSlot.id,
      startUtc: targetSlot.startUtc,
      endUtc: targetSlot.endUtc,
      reasonForVisit,
      status: 'booked',
      rescheduleCount: 0,
      fee: doctor.fee,
      paymentStatus: 'unpaid',
      createdByUserId: currentUser.id,
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
    };

    // Atomic update of slot state to BOOKED
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'booked',
              appointmentId: newAppointmentId,
              heldByUserId: undefined,
              holdExpiresAtUtc: undefined,
            }
          : s
      )
    );

    setAppointments((prev) => [newAppointment, ...prev]);

    // Clear active hold
    setActiveHoldSlot(null);
    setHoldSecondsRemaining(0);

    // Audit Log (FR-A10, RL-23)
    logAudit('BOOK_APPOINTMENT', 'Appointment', newAppointmentId, null, {
      patientId: targetPatientId,
      doctorId: doctor.id,
      slotId: targetSlot.id,
      fee: doctor.fee,
    });

    // Simulated notifications to Patient and Doctor (FR-P10, FR-P15)
    sendNotification(
      targetPatient.userId,
      targetPatient.name,
      'patient',
      'SMS',
      'BOOKING_CONFIRMATION',
      `MetroHealth: Confirmed! Visit with ${doctor.name} for ${treatedPersonName} on ${formatIstDate(targetSlot.startUtc)} at ${formatIstTime(targetSlot.startUtc)}. Ref: ${newAppointmentId}. Room: ${doctor.roomNumber}.`,
      newAppointmentId
    );

    sendNotification(
      doctor.userId,
      doctor.name,
      'doctor',
      'Email',
      'NEW_PATIENT_BOOKED',
      `New consultation booked: ${treatedPersonName} on ${formatIstDate(targetSlot.startUtc)} at ${formatIstTime(targetSlot.startUtc)}. Reason: ${reasonForVisit}.`,
      newAppointmentId
    );

    return { success: true, appointment: newAppointment };
  };

  // -------------------------------------------------------------
  // Feature 7.2: Cancellation & Rescheduling
  // -------------------------------------------------------------
  const cancelAppointment = ({
    appointmentId,
    reason,
    isAdminOverride = false,
  }: {
    appointmentId: string;
    reason: string;
    isAdminOverride?: boolean;
  }): { success: boolean; error?: string } => {
    const existing = appointments.find((a) => a.id === appointmentId);
    if (!existing) {
      return { success: false, error: 'Appointment not found.' };
    }

    if (existing.status !== 'booked') {
      return { success: false, error: `Appointment is already marked as ${existing.status}.` };
    }

    // Role check: Only admin, patient owner, or receptionist
    const isOwner = currentPatient?.id === existing.patientId;
    const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'receptionist';
    if (!isOwner && !isStaff) {
      return { success: false, error: 'You are not authorized to cancel this appointment.' };
    }

    // Validate cutoff (RL-11, RL-13)
    const cutoffCheck = validateCancellationCutoff(existing.startUtc, config, isAdminOverride);
    if (!cutoffCheck.valid) {
      return { success: false, error: cutoffCheck.error };
    }

    if (!reason || !reason.trim()) {
      return { success: false, error: 'Cancellation reason is mandatory (RL-11).' };
    }

    // Update appointment status to cancelled
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'cancelled',
              cancellationReason: reason,
              paymentStatus: a.paymentStatus === 'paid_offline' ? 'refund_pending_policy' : a.paymentStatus,
              updatedAtUtc: new Date().toISOString(),
            }
          : a
      )
    );

    // Release slot immediately so other patients can book (RL-11)
    setSlots((prev) =>
      prev.map((s) =>
        s.id === existing.slotId
          ? { ...s, status: 'open', appointmentId: undefined, heldByUserId: undefined }
          : s
      )
    );

    // Audit log
    logAudit('CANCEL_APPOINTMENT', 'Appointment', appointmentId, { status: 'booked' }, { status: 'cancelled', reason });

    const doctor = doctors.find((d) => d.id === existing.doctorId);
    const patient = patients.find((p) => p.id === existing.patientId);

    // Simulated notifications
    if (patient) {
      sendNotification(
        patient.userId,
        patient.name,
        'patient',
        'SMS',
        'CANCELLATION_CONFIRMED',
        `MetroHealth: Appointment ${appointmentId} with ${doctor?.name || 'Doctor'} has been cancelled. Slot released. Notice: Refund per hospital policy (to be defined by Finance).`,
        appointmentId
      );
    }
    if (doctor) {
      sendNotification(
        doctor.userId,
        doctor.name,
        'doctor',
        'Email',
        'APPOINTMENT_CANCELLED',
        `Notice: Consultation ${appointmentId} with ${existing.treatedPersonName} on ${formatIstDate(existing.startUtc)} at ${formatIstTime(existing.startUtc)} was cancelled. Reason: ${reason}.`,
        appointmentId
      );
    }

    return { success: true };
  };

  const rescheduleAppointment = ({
    appointmentId,
    newSlotId,
    isAdminOverride = false,
    simulateFailure = false,
  }: {
    appointmentId: string;
    newSlotId: string;
    isAdminOverride?: boolean;
    simulateFailure?: boolean;
  }): { success: boolean; appointment?: Appointment; error?: string } => {
    const existing = appointments.find((a) => a.id === appointmentId);
    if (!existing) {
      return { success: false, error: 'Appointment record not found.' };
    }

    // Role check
    const isOwner = currentPatient?.id === existing.patientId;
    const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'receptionist';
    if (!isOwner && !isStaff) {
      return { success: false, error: 'Not authorized to reschedule this appointment.' };
    }

    // Check reschedule limits and cutoff (RL-12, RL-13, RL-14)
    const ruleCheck = validateRescheduleRules(existing, config, isAdminOverride);
    if (!ruleCheck.valid) {
      return { success: false, error: ruleCheck.error };
    }

    const candidateSlot = slots.find((s) => s.id === newSlotId);
    if (!candidateSlot) {
      return { success: false, error: 'Selected new slot does not exist.' };
    }

    // Validate new slot
    const slotValidation = validateBookingSlot({
      slot: candidateSlot,
      doctorId: candidateSlot.doctorId,
      treatedPersonId: existing.treatedPersonType === 'dependent' && existing.dependentId ? existing.dependentId : existing.patientId,
      isDependent: existing.treatedPersonType === 'dependent',
      patientAppointments: appointments.filter((a) => a.id !== appointmentId),
      config,
      isAdminOverride,
    });

    if (!slotValidation.valid) {
      return { success: false, error: slotValidation.error };
    }

    // ATOMIC BEHAVIOUR (7.2, US-06):
    // New slot is booked first, and old slot is released ONLY AFTER new booking succeeds.
    // If the new booking fails (e.g. simulated failure), original appointment is UNCHANGED.
    if (simulateFailure || simulateRescheduleFailure) {
      return {
        success: false,
        error: 'Simulated Network/Collision Error during atomic reschedule: New slot booking failed. Original appointment remains confirmed and unchanged (ATOMIC ROLLBACK).',
      };
    }

    const oldSlotId = existing.slotId;
    const updatedAppointment: Appointment = {
      ...existing,
      slotId: newSlotId,
      startUtc: candidateSlot.startUtc,
      endUtc: candidateSlot.endUtc,
      rescheduleCount: existing.rescheduleCount + 1,
      flaggedForReschedule: false,
      flagReason: undefined,
      updatedAtUtc: new Date().toISOString(),
    };

    // Update appointment
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updatedAppointment : a)));

    // Atomically lock new slot AND release old slot
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === newSlotId) {
          return { ...s, status: 'booked', appointmentId };
        }
        if (s.id === oldSlotId) {
          return { ...s, status: 'open', appointmentId: undefined, heldByUserId: undefined };
        }
        return s;
      })
    );

    // Audit Log
    logAudit('RESCHEDULE_APPOINTMENT', 'Appointment', appointmentId, { slotId: oldSlotId }, { slotId: newSlotId, rescheduleCount: updatedAppointment.rescheduleCount });

    const doctor = doctors.find((d) => d.id === candidateSlot.doctorId);
    const patient = patients.find((p) => p.id === existing.patientId);

    if (patient) {
      sendNotification(
        patient.userId,
        patient.name,
        'patient',
        'SMS',
        'RESCHEDULE_CONFIRMED',
        `MetroHealth: Reschedule confirmed! Visit ${appointmentId} moved to ${formatIstDate(candidateSlot.startUtc)} at ${formatIstTime(candidateSlot.startUtc)} with ${doctor?.name || 'Doctor'}.`,
        appointmentId
      );
    }

    return { success: true, appointment: updatedAppointment };
  };

  // -------------------------------------------------------------
  // Feature 7.3: Doctor Actions
  // -------------------------------------------------------------
  const markAppointmentStatus = (
    appointmentId: string,
    status: AppointmentStatus,
    noteText?: string
  ): { success: boolean; error?: string } => {
    const existing = appointments.find((a) => a.id === appointmentId);
    if (!existing) {
      return { success: false, error: 'Appointment not found.' };
    }

    // RL-18: If marked No-show, slot remains occupied and patient no-show count is incremented
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status, updatedAtUtc: new Date().toISOString() } : a))
    );

    if (status === 'no-show') {
      setPatients((prev) =>
        prev.map((p) => (p.id === existing.patientId ? { ...p, noShowCount: p.noShowCount + 1 } : p))
      );
    }

    if (noteText && noteText.trim()) {
      addConsultationNote(appointmentId, noteText);
    }

    logAudit(`MARK_${status.toUpperCase()}`, 'Appointment', appointmentId, { status: existing.status }, { status });

    return { success: true };
  };

  const addConsultationNote = (appointmentId: string, text: string) => {
    if (!text.trim()) return;
    const note: ConsultationNote = {
      id: `note-${Date.now()}`,
      appointmentId,
      doctorId: currentUser?.doctorId || 'doc-1',
      authorName: currentUser?.name || 'Doctor',
      text: text.trim(),
      timestampUtc: new Date().toISOString(),
    };
    setConsultationNotes((prev) => [note, ...prev]);
    logAudit('ADD_CONSULTATION_NOTE', 'ConsultationNote', note.id, null, { appointmentId });
  };

  const applyDoctorLeave = (params: {
    doctorId: string;
    startDateUtc: string; // "YYYY-MM-DD"
    endDateUtc: string;   // "YYYY-MM-DD"
    reason: string;
  }): { success: boolean; affectedAppointments: Appointment[] } => {
    // Identify existing bookings on those dates (RL-16, US-09)
    const affected = appointments.filter((a) => {
      if (a.doctorId !== params.doctorId || a.status !== 'booked') return false;
      const aptDate = formatIstDateKey(a.startUtc);
      return aptDate >= params.startDateUtc && aptDate <= params.endDateUtc;
    });

    const newLeave: DoctorLeave = {
      id: `leave-${Date.now()}`,
      doctorId: params.doctorId,
      startDateUtc: params.startDateUtc,
      endDateUtc: params.endDateUtc,
      reason: params.reason,
      status: 'approved',
    };

    setLeaves((prev) => [...prev, newLeave]);

    // Flag affected bookings for rescheduling (RL-16) - never silently deleted
    setAppointments((prev) =>
      prev.map((a) => {
        if (affected.some((aff) => aff.id === a.id)) {
          return {
            ...a,
            flaggedForReschedule: true,
            flagReason: `Doctor on leave: ${params.reason} (RL-16)`,
            updatedAtUtc: new Date().toISOString(),
          };
        }
        return a;
      })
    );

    // Block all open slots on those days
    setSlots((prev) =>
      prev.map((s) => {
        if (s.doctorId !== params.doctorId) return s;
        const slotDate = formatIstDateKey(s.startUtc);
        if (slotDate >= params.startDateUtc && slotDate <= params.endDateUtc) {
          return {
            ...s,
            status: s.status === 'booked' ? 'booked' : 'blocked',
            blockedReason: `Doctor on Leave: ${params.reason}`,
          };
        }
        return s;
      })
    );

    // Notify affected patients offering reschedule or refund
    affected.forEach((aff) => {
      const patient = patients.find((p) => p.id === aff.patientId);
      if (patient) {
        sendNotification(
          patient.userId,
          patient.name,
          'patient',
          'WhatsApp',
          'LEAVE_ALERT',
          `URGENT HABS Alert: Your doctor will be on leave on your appointment date. Booking ${aff.id} is flagged for priority rescheduling or refund.`,
          aff.id
        );
      }
    });

    logAudit('APPLY_DOCTOR_LEAVE', 'DoctorLeave', newLeave.id, null, {
      doctorId: params.doctorId,
      affectedCount: affected.length,
    });

    return { success: true, affectedAppointments: affected };
  };

  const emergencyBlockDay = (
    doctorId: string,
    dateUtc: string,
    reason: string
  ): { success: boolean; affectedAppointments: Appointment[] } => {
    return applyDoctorLeave({
      doctorId,
      startDateUtc: dateUtc,
      endDateUtc: dateUtc,
      reason: `Emergency Block: ${reason} (FR-D07)`,
    });
  };

  const updateDoctorSchedule = (newRule: WeeklyScheduleRule): { success: boolean; error?: string } => {
    // RL-17: Schedule changes never alter existing confirmed bookings!
    setScheduleRules((prev) => prev.map((r) => (r.id === newRule.id ? newRule : r)));
    logAudit('UPDATE_SCHEDULE_RULE', 'WeeklyScheduleRule', newRule.id, null, newRule);
    return { success: true };
  };

  // -------------------------------------------------------------
  // Feature 7.4: Administrator Actions
  // -------------------------------------------------------------
  const adminReassignAppointment = (
    appointmentId: string,
    targetDoctorId: string,
    targetSlotId: string
  ): { success: boolean; error?: string } => {
    const existing = appointments.find((a) => a.id === appointmentId);
    if (!existing) {
      return { success: false, error: 'Appointment not found.' };
    }

    const targetSlot = slots.find((s) => s.id === targetSlotId);
    if (!targetSlot || targetSlot.status !== 'open') {
      return { success: false, error: 'Target slot is not open for reassignment.' };
    }

    const newDoctor = doctors.find((d) => d.id === targetDoctorId);
    if (!newDoctor) {
      return { success: false, error: 'Target doctor not found.' };
    }

    const oldSlotId = existing.slotId;
    const oldDoctorId = existing.doctorId;

    const updated: Appointment = {
      ...existing,
      doctorId: targetDoctorId,
      slotId: targetSlotId,
      startUtc: targetSlot.startUtc,
      endUtc: targetSlot.endUtc,
      fee: newDoctor.fee,
      flaggedForReschedule: false,
      flagReason: undefined,
      updatedAtUtc: new Date().toISOString(),
    };

    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updated : a)));

    // Update slots
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === targetSlotId) return { ...s, status: 'booked', appointmentId };
        if (s.id === oldSlotId) return { ...s, status: 'open', appointmentId: undefined };
        return s;
      })
    );

    logAudit('ADMIN_REASSIGN_APPOINTMENT', 'Appointment', appointmentId, { doctorId: oldDoctorId, slotId: oldSlotId }, { doctorId: targetDoctorId, slotId: targetSlotId });

    // Notify Patient & both Doctors (FR-A08)
    const patient = patients.find((p) => p.id === existing.patientId);
    if (patient) {
      sendNotification(
        patient.userId,
        patient.name,
        'patient',
        'SMS',
        'ADMIN_REASSIGNMENT',
        `MetroHealth Notice: Your appointment ${appointmentId} was reassigned to ${newDoctor.name} on ${formatIstDate(targetSlot.startUtc)} at ${formatIstTime(targetSlot.startUtc)}.`,
        appointmentId
      );
    }

    return { success: true };
  };

  const adminBulkReassignFlagged = (targetDoctorId: string): { reassignedCount: number } => {
    const flagged = appointments.filter((a) => a.flaggedForReschedule && a.status === 'booked');
    const availableSlots = slots.filter((s) => s.doctorId === targetDoctorId && s.status === 'open');

    let count = 0;
    for (let i = 0; i < Math.min(flagged.length, availableSlots.length); i++) {
      adminReassignAppointment(flagged[i].id, targetDoctorId, availableSlots[i].id);
      count++;
    }
    return { reassignedCount: count };
  };

  const toggleUserActiveStatus = (userId: string) => {
    // RL-24: Accounts are activated or deactivated, NEVER deleted
    setPatients((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, active: !p.active } : p))
    );
    setDoctors((prev) =>
      prev.map((d) => (d.userId === userId ? { ...d, active: !d.active } : d))
    );
    logAudit('TOGGLE_USER_STATUS', 'User', userId, null, { toggledBy: currentUser?.name });
  };

  const addDoctor = (newDoc: Omit<Doctor, 'id'>) => {
    const id = `doc-${doctors.length + 1}`;
    const doctorObj: Doctor = { ...newDoc, id };
    setDoctors((prev) => [...prev, doctorObj]);
    logAudit('ADD_DOCTOR', 'Doctor', id, null, doctorObj);
  };

  const updateDoctorFee = (doctorId: string, newFee: number) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, fee: newFee } : d))
    );
    logAudit('UPDATE_DOCTOR_FEE', 'Doctor', doctorId, null, { newFee });
  };

  const addHospitalHoliday = (dateUtc: string, name: string): { affectedCount: number } => {
    const holiday: HospitalHoliday = {
      id: `hol-${Date.now()}`,
      dateUtc,
      name,
      active: true,
    };
    setHolidays((prev) => [...prev, holiday]);

    // Block all doctor slots on that date (RL-19)
    const affected = appointments.filter((a) => a.status === 'booked' && formatIstDateKey(a.startUtc) === dateUtc);

    setAppointments((prev) =>
      prev.map((a) => {
        if (affected.some((aff) => aff.id === a.id)) {
          return {
            ...a,
            flaggedForReschedule: true,
            flagReason: `Hospital Holiday declared: ${name} (RL-19)`,
            updatedAtUtc: new Date().toISOString(),
          };
        }
        return a;
      })
    );

    setSlots((prev) =>
      prev.map((s) => {
        if (formatIstDateKey(s.startUtc) === dateUtc) {
          return { ...s, status: s.status === 'booked' ? 'booked' : 'blocked', blockedReason: `Holiday: ${name}` };
        }
        return s;
      })
    );

    logAudit('ADD_HOSPITAL_HOLIDAY', 'HospitalHoliday', holiday.id, null, { dateUtc, name, affectedBookings: affected.length });

    return { affectedCount: affected.length };
  };

  const addAnnouncement = (title: string, content: string, targetAudience: Announcement['targetAudience']) => {
    const anc: Announcement = {
      id: `anc-${Date.now()}`,
      title,
      content,
      targetAudience,
      createdAtUtc: new Date().toISOString(),
      active: true,
    };
    setAnnouncements((prev) => [anc, ...prev]);
    logAudit('BROADCAST_ANNOUNCEMENT', 'Announcement', anc.id, null, anc);
  };

  const updateConfig = (newCfg: Partial<BookingConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
    logAudit('UPDATE_BOOKING_CONFIG', 'BookingConfig', 'global', config, newCfg);
  };

  const addDependent = (dep: Omit<Dependent, 'id'>) => {
    const newDep: Dependent = { ...dep, id: `dep-${Date.now()}` };
    setDependents((prev) => [...prev, newDep]);
    logAudit('ADD_DEPENDENT', 'Dependent', newDep.id, null, newDep);
  };

  const updatePatientProfile = (updates: Partial<Patient>) => {
    if (!currentPatient) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === currentPatient.id ? { ...p, ...updates } : p))
    );
    logAudit('UPDATE_PROFILE', 'Patient', currentPatient.id, null, updates);
  };

  // Demo tools immediate hold expire
  const expireHoldNow = () => {
    if (activeHoldSlot) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === activeHoldSlot.id && s.status === 'held'
            ? { ...s, status: 'open', heldByUserId: undefined, holdExpiresAtUtc: undefined }
            : s
        )
      );
      setActiveHoldSlot(null);
      setHoldSecondsRemaining(0);
    }
  };

  // Reset all state to clean initial mock state
  const resetAllData = () => {
    localStorage.clear();
    setPatients(INITIAL_PATIENTS);
    setDependents(INITIAL_DEPENDENTS);
    setDoctors(INITIAL_DOCTORS);
    setScheduleRules(INITIAL_SCHEDULE_RULES);
    setHolidays(INITIAL_HOLIDAYS);
    setLeaves(INITIAL_LEAVES);
    setSlots(generateInitialSlots());
    setAppointments(INITIAL_APPOINTMENTS);
    setConsultationNotes(INITIAL_CONSULTATION_NOTES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOG);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setConfig(DEFAULT_BOOKING_CONFIG);
    setActiveHoldSlot(null);
    setHoldSecondsRemaining(0);
    setCurrentUser(DEMO_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        patients,
        currentPatient,
        dependents,
        addDependent,
        updatePatientProfile,
        departments,
        specializations,
        doctors,
        scheduleRules,
        holidays,
        leaves,
        config,
        updateConfig,
        bookingConfig: config,
        updateBookingConfig: updateConfig,
        slots,
        appointments,
        activeHoldSlot,
        holdSecondsRemaining,
        consultationNotes,
        notifications,
        auditLogs,
        announcements,
        holdSlot,
        releaseHoldSlot,
        confirmBooking,
        cancelAppointment,
        rescheduleAppointment,
        markAppointmentStatus,
        addConsultationNote,
        applyDoctorLeave,
        emergencyBlockDay,
        updateDoctorSchedule,
        adminReassignAppointment,
        adminBulkReassignFlagged,
        toggleUserActiveStatus,
        addDoctor,
        updateDoctorFee,
        addHospitalHoliday,
        addAnnouncement,
        simulateSimultaneousCollision,
        setSimulateSimultaneousCollision,
        simulateRescheduleFailure,
        setSimulateRescheduleFailure,
        simulateNotificationFailure,
        setSimulateNotificationFailure,
        expireHoldNow,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
