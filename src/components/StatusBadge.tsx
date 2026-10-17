import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserX, 
  Lock, 
  AlertTriangle, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AppointmentStatus, SlotStatus } from '../types';

interface StatusBadgeProps {
  status: AppointmentStatus | SlotStatus | 'flagged';
  label?: string;
  className?: string;
}

/**
 * Status indicator applying Section 3 rule:
 * "Status indicators (colour plus text/icon, never colour alone):
 * Booked, Completed, Cancelled, No-show; slot states Open, Held, Booked, Blocked; Flagged for rescheduling."
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  switch (status) {
    case 'booked':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{label || 'Booked'}</span>
        </span>
      );

    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{label || 'Completed'}</span>
        </span>
      );

    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{label || 'Cancelled'}</span>
        </span>
      );

    case 'no-show':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}>
          <UserX className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{label || 'No-show'}</span>
        </span>
      );

    case 'open':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 ${className}`}>
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{label || 'Open'}</span>
        </span>
      );

    case 'held':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 animate-pulse ${className}`}>
          <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>{label || 'Held'}</span>
        </span>
      );

    case 'blocked':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300 ${className}`}>
          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{label || 'Blocked'}</span>
        </span>
      );

    case 'flagged':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 animate-bounce-subtle ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{label || 'Flagged for Rescheduling'}</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 ${className}`}>
          {label || status}
        </span>
      );
  }
};
