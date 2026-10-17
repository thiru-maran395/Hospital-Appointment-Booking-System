import React from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Calendar,
  Send
} from 'lucide-react';

export type AlertType = 
  | 'change-required'
  | 'doctor-leave'
  | 'slot-held'
  | 'delivery-pending'
  | 'delivery-failed'
  | 'awaiting-verification'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

interface AlertProps {
  type?: AlertType;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  action,
  className = '',
}) => {
  const config = {
    'change-required': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    },
    'doctor-leave': {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      icon: <Calendar className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    },
    'slot-held': {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-900',
      icon: <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />,
    },
    'delivery-pending': {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      icon: <Send className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />,
    },
    'delivery-failed': {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    },
    'awaiting-verification': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    },
    'info': {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-900',
      icon: <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />,
    },
    'success': {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
    },
    'warning': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    },
    'danger': {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div className={`p-4 rounded-2xl border ${config.bg} ${config.border} ${config.text} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {config.icon}
          <div className="space-y-1 text-xs leading-relaxed">
            <span className="font-bold text-sm block">{title}</span>
            <div className="opacity-95">{children}</div>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
