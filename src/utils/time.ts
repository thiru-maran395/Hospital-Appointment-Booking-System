// ==========================================
// Time Conversion & Display Utilities
// Rule: FR-S02, RL-10: All times stored as UTC
// in mock data and displayed in IST (UTC+05:30).
// ==========================================

const IST_OFFSET_MINUTES = 330; // +05:30 = 5 * 60 + 30 = 330 minutes

/**
 * Converts a UTC ISO string or Date into an IST Date object.
 */
export function utcToIst(utcIsoStringOrDate: string | Date): Date {
  const d = typeof utcIsoStringOrDate === 'string' ? new Date(utcIsoStringOrDate) : utcIsoStringOrDate;
  // Get epoch ms and shift by IST offset relative to system timezone
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utcTime + IST_OFFSET_MINUTES * 60000);
}

/**
 * Formats a UTC ISO string into IST time label, e.g. "10:00 AM IST"
 */
export function formatIstTime(utcIsoString: string, includeTimezoneLabel = true): string {
  const istDate = utcToIst(utcIsoString);
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${ampm}${includeTimezoneLabel ? ' IST' : ''}`;
}

/**
 * Formats a UTC ISO string into an IST date string: e.g. "Wed, 22 Oct 2026"
 */
export function formatIstDate(utcIsoString: string): string {
  const istDate = utcToIst(utcIsoString);
  return istDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats UTC ISO string into short date string "YYYY-MM-DD" in IST
 */
export function formatIstDateKey(utcIsoString: string): string {
  const istDate = utcToIst(utcIsoString);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats UTC ISO string into full IST display: "Wed, 22 Oct 2026, 10:30 AM IST"
 */
export function formatIstDateTime(utcIsoString: string): string {
  return `${formatIstDate(utcIsoString)}, ${formatIstTime(utcIsoString, true)}`;
}

/**
 * Helper to construct a UTC ISO string from an IST date ("YYYY-MM-DD") and IST time ("HH:MM")
 */
export function istToUtcIso(istDateStr: string, istTimeStr: string): string {
  const [year, month, day] = istDateStr.split('-').map(Number);
  const [hours, minutes] = istTimeStr.split(':').map(Number);
  // IST Date representation in UTC milliseconds:
  // Date.UTC treats input as UTC, then subtract 330 mins to get the real UTC timestamp
  const epochMs = Date.UTC(year, month - 1, day, hours, minutes, 0) - IST_OFFSET_MINUTES * 60000;
  return new Date(epochMs).toISOString();
}

/**
 * Calculate difference in minutes between two UTC ISO strings
 */
export function diffMinutes(startUtc: string, endUtc: string): number {
  const start = new Date(startUtc).getTime();
  const end = new Date(endUtc).getTime();
  return Math.round((end - start) / (1000 * 60));
}

/**
 * Checks if a given UTC ISO string is in the past relative to now
 */
export function isPastUtc(utcIsoString: string): boolean {
  return new Date(utcIsoString).getTime() <= Date.now();
}

/**
 * Formats seconds remaining into MM:SS for countdown timers (RL-05)
 */
export function formatCountdown(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return '00:00';
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Checks whether an action (cancel/reschedule) is permitted based on the cutoff hours before appointment start.
 */
export function isActionAllowedByCutoff(
  appointmentStartUtc: string,
  cutoffHours: number = 2
): boolean {
  const nowMs = Date.now();
  const startMs = new Date(appointmentStartUtc).getTime();
  const cutoffMs = cutoffHours * 3600 * 1000;
  return startMs - nowMs >= cutoffMs;
}
