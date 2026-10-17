import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatCountdown } from '../utils/time';

interface CountdownTimerProps {
  secondsRemaining: number;
  totalDurationSeconds?: number;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  secondsRemaining,
  totalDurationSeconds = 420,
  className = '',
}) => {
  const isExpiringSoon = secondsRemaining <= 60 && secondsRemaining > 0;
  const isExpired = secondsRemaining <= 0;

  // Under one minute remains: switch to Change required colors (#B45309 text, #FFEBD6 bg) and text "Hold expiring"
  // Default: --accent-soft (#ECECFB) background with #5B5FC7 text
  let containerStyle = 'bg-[#ECECFB] text-[#5B5FC7] border border-[#D5D6F7]';
  let labelText = 'Hold expires in:';
  let Icon = Clock;

  if (isExpired) {
    containerStyle = 'bg-[#FDECEA] text-[#B3261E] border border-[#F9C9C5]';
    labelText = 'Hold expired:';
    Icon = AlertCircle;
  } else if (isExpiringSoon) {
    containerStyle = 'bg-[#FFEBD6] text-[#B45309] border border-[#FEDBB7] animate-pulse';
    labelText = 'Hold expiring:';
    Icon = AlertTriangle;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${containerStyle} ${className}`}
      title="Slot Hold Timer (RL-05): This slot is temporarily reserved for you."
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="flex items-center gap-1.5">
        <span className="font-medium opacity-90">{labelText}</span>
        <span className="font-mono text-sm font-extrabold tracking-wider">
          {formatCountdown(secondsRemaining)}
        </span>
      </div>
    </div>
  );
};
