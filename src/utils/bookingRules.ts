import { Appointment, Slot, BookingConfig } from '../types';
import { formatIstDateKey } from './time';

export interface BookingValidationResult {
  valid: boolean;
  error?: string;
  ruleId?: string;
}

/**
 * Validates whether a candidate slot meets all booking rules.
 * Ref: BRD-HABS-001 Section 7.1 (RL-01 to RL-09)
 */
export function validateBookingSlot({
  slot,
  doctorId,
  treatedPersonId,
  isDependent,
  patientAppointments,
  config,
  isAdminOverride = false,
}: {
  slot: Slot;
  doctorId: string;
  treatedPersonId: string;
  isDependent: boolean;
  patientAppointments: Appointment[];
  config: BookingConfig;
  isAdminOverride?: boolean;
}): BookingValidationResult {
  if (isAdminOverride) {
    return { valid: true };
  }

  const nowMs = Date.now();
  const slotStartMs = new Date(slot.startUtc).getTime();
  const slotEndMs = new Date(slot.endUtc).getTime();

  // RL-04: Valid date and time only.
  if (isNaN(slotStartMs) || isNaN(slotEndMs) || slotEndMs <= slotStartMs) {
    return { valid: false, error: 'Invalid slot date and time.', ruleId: 'RL-04' };
  }

  // RL-06: No past slots and none starting inside the lead time.
  // Booking cutoff formula: slot start > now + lead time
  const leadTimeMs = config.bookingLeadTimeHours * 3600 * 1000;
  if (slotStartMs <= nowMs) {
    return {
      valid: false,
      error: 'Cannot book a time slot in the past.',
      ruleId: 'RL-06',
    };
  }
  if (slotStartMs < nowMs + leadTimeMs) {
    return {
      valid: false,
      error: `Booking requires at least ${config.bookingLeadTimeHours} hours advance lead time (RL-06).`,
      ruleId: 'RL-06',
    };
  }

  // RL-07: Nothing beyond the booking window.
  const maxWindowMs = config.bookingWindowDays * 24 * 3600 * 1000;
  if (slotStartMs > nowMs + maxWindowMs) {
    return {
      valid: false,
      error: `Cannot book appointments beyond the ${config.bookingWindowDays}-day advance window (RL-07).`,
      ruleId: 'RL-07',
    };
  }

  // RL-02, RL-03: An occupied, held, or blocked slot cannot be booked.
  if (slot.status === 'booked') {
    return {
      valid: false,
      error: 'This slot has already been booked by another patient (RL-02, RL-03).',
      ruleId: 'RL-02',
    };
  }
  if (slot.status === 'held') {
    return {
      valid: false,
      error: 'This slot is currently held by another user in active checkout (RL-03, RL-05).',
      ruleId: 'RL-03',
    };
  }
  if (slot.status === 'blocked') {
    return {
      valid: false,
      error: `Doctor is unavailable during this time (${slot.blockedReason || 'Blocked'}).`,
      ruleId: 'RL-02',
    };
  }

  // Active appointments for collision check
  const activeAppointments = patientAppointments.filter(
    (a) => a.status === 'booked'
  );

  // DEC-03: Check if conflict applies per person treated or account holder
  const targetAppointments = activeAppointments.filter((a) => {
    if (config.conflictCheckScope === 'person_treated') {
      if (isDependent) {
        return a.treatedPersonType === 'dependent' && a.dependentId === treatedPersonId;
      } else {
        return a.treatedPersonType === 'patient' && a.patientId === treatedPersonId;
      }
    }
    // Account holder scope: all appointments under this account
    return true;
  });

  const slotDateKey = formatIstDateKey(slot.startUtc);

  for (const existing of targetAppointments) {
    const existingStartMs = new Date(existing.startUtc).getTime();
    const existingEndMs = new Date(existing.endUtc).getTime();

    // RL-08: No overlapping appointments with different doctors.
    // Overlap condition: max(start1, start2) < min(end1, end2)
    const overlaps = Math.max(slotStartMs, existingStartMs) < Math.min(slotEndMs, existingEndMs);
    if (overlaps) {
      return {
        valid: false,
        error: `Schedule conflict: You already have an overlapping appointment (${existing.id}) at this time (RL-08).`,
        ruleId: 'RL-08',
      };
    }

    // RL-09: Only one active appointment per doctor per day.
    const existingDateKey = formatIstDateKey(existing.startUtc);
    if (existing.doctorId === doctorId && existingDateKey === slotDateKey) {
      return {
        valid: false,
        error: `Limit reached: You already have an active appointment with this doctor on ${slotDateKey} (RL-09). Only one booking per doctor per day is permitted.`,
        ruleId: 'RL-09',
      };
    }
  }

  return { valid: true };
}

/**
 * Validates cancellation cutoff.
 * Ref: RL-11, RL-13: Cutoff 2 hours before slot start.
 */
export function validateCancellationCutoff(
  appointmentStartUtc: string,
  config: BookingConfig,
  isAdminOverride = false
): BookingValidationResult {
  if (isAdminOverride) {
    return { valid: true };
  }

  const nowMs = Date.now();
  const startMs = new Date(appointmentStartUtc).getTime();
  const cutoffMs = config.cancelRescheduleCutoffHours * 3600 * 1000;

  if (startMs <= nowMs) {
    return {
      valid: false,
      error: 'Cannot cancel an appointment whose consultation time has already passed (RL-13).',
      ruleId: 'RL-13',
    };
  }

  if (startMs - nowMs < cutoffMs) {
    return {
      valid: false,
      error: `Cancellation cutoff passed: Appointments cannot be cancelled within ${config.cancelRescheduleCutoffHours} hours of start time (RL-13). Please contact hospital administration for assistance.`,
      ruleId: 'RL-13',
    };
  }

  return { valid: true };
}

/**
 * Validates rescheduling rules (cutoff + reschedule limit).
 * Ref: RL-12, RL-13, RL-14
 */
export function validateRescheduleRules(
  appointment: Appointment,
  config: BookingConfig,
  isAdminOverride = false
): BookingValidationResult {
  if (isAdminOverride) {
    return { valid: true };
  }

  // RL-13: Cutoff check
  const cutoffCheck = validateCancellationCutoff(appointment.startUtc, config, isAdminOverride);
  if (!cutoffCheck.valid) {
    return {
      valid: false,
      error: `Rescheduling cutoff passed: Appointments cannot be rescheduled within ${config.cancelRescheduleCutoffHours} hours of start time (RL-13). An administrator can override this restriction.`,
      ruleId: 'RL-13',
    };
  }

  // RL-14: Reschedule limit check (placeholder TBD)
  if (typeof config.rescheduleLimitPerAppointment === 'number') {
    if (appointment.rescheduleCount >= config.rescheduleLimitPerAppointment) {
      return {
        valid: false,
        error: `Reschedule limit of ${config.rescheduleLimitPerAppointment} changes reached for this appointment (RL-14).`,
        ruleId: 'RL-14',
      };
    }
  }

  return { valid: true };
}
