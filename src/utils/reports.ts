import { Appointment, Doctor, Patient, AuditLogEntry, NotificationItem } from '../types';
import { formatIstDateTime } from './time';

export interface ReportMetrics {
  totalAppointments: number;
  bookedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  flaggedCount: number;
  cancellationRate: number; // percentage
  noShowRate: number;       // percentage
}

/**
 * Calculates hospital appointment KPIs based on BRD formulas:
 * - Cancellation rate = cancelled appointments / all appointments booked in the period
 * - No-show rate = no-show appointments / appointments whose time has passed and that were not cancelled
 */
export function calculateReportMetrics(appointments: Appointment[]): ReportMetrics {
  const total = appointments.length;
  if (total === 0) {
    return {
      totalAppointments: 0,
      bookedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      noShowCount: 0,
      flaggedCount: 0,
      cancellationRate: 0,
      noShowRate: 0,
    };
  }

  const bookedCount = appointments.filter((a) => a.status === 'booked').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;
  const noShowCount = appointments.filter((a) => a.status === 'no-show').length;
  const flaggedCount = appointments.filter((a) => a.flaggedForReschedule).length;

  // Cancellation rate
  const cancellationRate = total > 0 ? (cancelledCount / total) * 100 : 0;

  // No-show denominator: appointments whose time has passed and that were not cancelled
  const nowMs = Date.now();
  const pastNonCancelled = appointments.filter(
    (a) => new Date(a.startUtc).getTime() <= nowMs && a.status !== 'cancelled'
  ).length;

  const noShowRate = pastNonCancelled > 0 ? (noShowCount / pastNonCancelled) * 100 : 0;

  return {
    totalAppointments: total,
    bookedCount,
    completedCount,
    cancelledCount,
    noShowCount,
    flaggedCount,
    cancellationRate: Math.round(cancellationRate * 10) / 10,
    noShowRate: Math.round(noShowRate * 10) / 10,
  };
}

/**
 * Export table data to CSV file download
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((val) => {
          const str = String(val ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger print dialog with custom stylesheet for clean report PDF output
 */
export function exportReportToPdf() {
  window.print();
}
