import React from 'react';
import { HelpCircle, Clock, CheckCircle2, AlertTriangle, XCircle, FileCheck, AlertCircle } from 'lucide-react';
import { STATUS_STYLES } from '../../styles/tokens';

interface PendingApprovalBadgeProps {
  note?: string;
  className?: string;
}

export const PendingApprovalBadge: React.FC<PendingApprovalBadgeProps> = ({
  note = 'Pending approval · Suggested default value (BRD-HABS-001 DEC-01)',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3F2] text-[#4A6663] border border-[#D5E5E3] cursor-help ${className}`}
      title={note}
    >
      <HelpCircle className="w-3 h-3 text-[#4A6663] shrink-0" />
      <span>Pending approval</span>
    </span>
  );
};

interface ChipProps {
  label: string;
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'accent';
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  const styles = {
    brand: 'bg-[#E1F2F0] text-[#1F7A78] border-[#C6E7E4]',
    neutral: 'bg-[#EAF3F2] text-[#4A6663] border-[#D5E5E3]',
    success: 'bg-[#E1F2F0] text-[#1F7A78] border-[#C6E7E4]',
    warning: 'bg-[#FFEBD6] text-[#B45309] border-[#FEDBB7]',
    danger: 'bg-[#FBE9EC] text-[#B4455A] border-[#F4CAD1]',
    accent: 'bg-[#ECECFB] text-[#5B5FC7] border-[#D5D6F7]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
