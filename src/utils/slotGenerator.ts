import { Slot, WeeklyScheduleRule, DoctorLeave, HospitalHoliday } from '../types';
import { istToUtcIso } from './time';

/**
 * Programmatically generates consultation slots for a doctor across a date range.
 * Follows schedule start to end in steps of slotDurationMinutes, excluding breaks.
 * Ref: BRD-HABS-001 Section 6
 */
export function generateDoctorSlotsForDate(
  doctorRule: WeeklyScheduleRule,
  dateStrIst: string, // "YYYY-MM-DD"
  leaves: DoctorLeave[] = [],
  holidays: HospitalHoliday[] = []
): Slot[] {
  if (!doctorRule.active) return [];

  const [year, month, day] = dateStrIst.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  if (doctorRule.dayOfWeek !== dayOfWeek) {
    return [];
  }

  // Check if date falls in a hospital holiday (RL-19)
  const holiday = holidays.find((h) => h.active && h.dateUtc === dateStrIst);

  // Check if doctor is on leave on this date (RL-16)
  const isDocOnLeave = leaves.some(
    (l) => l.doctorId === doctorRule.doctorId && dateStrIst >= l.startDateUtc && dateStrIst <= l.endDateUtc
  );

  const slots: Slot[] = [];
  const [startHour, startMin] = doctorRule.startTimeUtc.split(':').map(Number);
  const [endHour, endMin] = doctorRule.endTimeUtc.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = doctorRule.slotDurationMinutes || 30;

  let currentMin = startMinutes;
  let slotIndex = 1;

  while (currentMin + duration <= endMinutes) {
    const slotStartMin = currentMin;
    const slotEndMin = currentMin + duration;

    // Check if slot overlaps with any scheduled break
    const isInBreak = doctorRule.breaks.some((brk) => {
      const [bStartH, bStartM] = brk.startUtc.split(':').map(Number);
      const [bEndH, bEndM] = brk.endUtc.split(':').map(Number);
      const breakStart = bStartH * 60 + bStartM;
      const breakEnd = bEndH * 60 + bEndM;
      // Overlap if max(slotStart, breakStart) < min(slotEnd, breakEnd)
      return Math.max(slotStartMin, breakStart) < Math.min(slotEndMin, breakEnd);
    });

    if (!isInBreak) {
      const sH = String(Math.floor(slotStartMin / 60)).padStart(2, '0');
      const sM = String(slotStartMin % 60).padStart(2, '0');
      const eH = String(Math.floor(slotEndMin / 60)).padStart(2, '0');
      const eM = String(slotEndMin % 60).padStart(2, '0');

      // Note: startTimeUtc and endTimeUtc are IST wall-clock strings stored for easy generation
      const startUtc = istToUtcIso(dateStrIst, `${sH}:${sM}`);
      const endUtc = istToUtcIso(dateStrIst, `${eH}:${eM}`);

      let status: Slot['status'] = 'open';
      let blockedReason: string | undefined = undefined;

      if (holiday) {
        status = 'blocked';
        blockedReason = `Hospital Holiday: ${holiday.name}`;
      } else if (isDocOnLeave) {
        status = 'blocked';
        blockedReason = 'Doctor on Approved Leave';
      }

      slots.push({
        id: `slot-${doctorRule.doctorId}-${dateStrIst}-${sH}${sM}`,
        doctorId: doctorRule.doctorId,
        startUtc,
        endUtc,
        status,
        blockedReason,
      });

      slotIndex++;
    }

    currentMin += duration;
  }

  return slots;
}
