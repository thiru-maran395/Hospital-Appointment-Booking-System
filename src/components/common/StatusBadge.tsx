import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Check, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export type StatusType = 
  | 'booked' 
  | 'confirmed' 
  | 'active' 
  | 'success'
  | 'completed'
  | 'cancelled'
  | 'no-show' 
  | 'noshow'
  | 'held' 
  | 'awaiting' 
  | 'pending'
  | 'flagged' 
  | 'leave' 
  | 'change_required'
  | 'error' 
  | 'failed'
  | 'info' 
  | 'pending_approval';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  icon,
  className = '',
  size = 'md',
}) => {
  let textClass = 'text-[#1F7A78]';
  let bgClass = 'bg-[#E1F2F0]';
  let borderClass = 'border-[#C6E7E4]';
  let defaultLabel = 'Active';
  let DefaultIcon = CheckCircle2;

  switch (status) {
    case 'booked':
    case 'confirmed':
    case 'active':
    case 'success':
      textClass = 'text-[#1F7A78]';
      bgClass = 'bg-[#E1F2F0]';
      borderClass = 'border-[#C6E7E4]';
      defaultLabel = status === 'active' ? 'Active' : status === 'booked' ? 'Booked' : 'Confirmed';
      DefaultIcon = CheckCircle2;
      break;

    case 'completed':
      textClass = 'text-[#2F6FB0]';
      bgClass = 'bg-[#E4EEF9]';
      borderClass = 'border-[#C6DCF3]';
      defaultLabel = 'Completed';
      DefaultIcon = FileCheck;
      break;

    case 'cancelled':
      textClass = 'text-[#B4455A]';
      bgClass = 'bg-[#FBE9EC]';
      borderClass = 'border-[#F4CAD1]';
      defaultLabel = 'Cancelled';
      DefaultIcon = XCircle;
      break;

    case 'no-show':
    case 'noshow':
      textClass = 'text-[#9A5B00]';
      bgClass = 'bg-[#FFF1D6]';
      borderClass = 'border-[#FFE3B3]';
      defaultLabel = 'No-show';
      DefaultIcon = Clock;
      break;

    case 'held':
    case 'awaiting':
    case 'pending':
      textClass = 'text-[#5B5FC7]';
      bgClass = 'bg-[#ECECFB]';
      borderClass = 'border-[#D5D6F7]';
      defaultLabel = status === 'held' ? 'Held' : 'Pending';
      DefaultIcon = Clock;
      break;

    case 'flagged':
    case 'leave':
    case 'change_required':
      textClass = 'text-[#B45309]';
      bgClass = 'bg-[#FFEBD6]';
      borderClass = 'border-[#FEDBB7]';
      defaultLabel = 'Flagged';
      DefaultIcon = AlertTriangle;
      break;

    case 'error':
    case 'failed':
      textClass = 'text-[#B3261E]';
      bgClass = 'bg-[#FDECEA]';
      borderClass = 'border-[#F9C9C5]';
      defaultLabel = 'Failed';
      DefaultIcon = AlertCircle;
      break;

    case 'info':
    case 'pending_approval':
      textClass = 'text-[#4A6663]';
      bgClass = 'bg-[#EAF3F2]';
      borderClass = 'border-[#D5E5E3]';
      defaultLabel = status === 'pending_approval' ? 'Pending Approval' : 'Info';
      DefaultIcon = HelpCircle;
      break;
  }

  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${textClass} ${bgClass} ${borderClass} ${paddingClass} ${className}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <DefaultIcon className={`${iconSizeClass} shrink-0`} />
      )}
      <span className="capitalize">{label || defaultLabel}</span>
    </span>
  );
};
