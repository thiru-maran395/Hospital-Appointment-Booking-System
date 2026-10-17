import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subtitle?: string;
}

const SERENE_PALETTES = [
  { bg: 'bg-[#E1F2F0]', text: 'text-[#1F7A78]', border: 'border-[#C6E7E4]' },
  { bg: 'bg-[#ECECFB]', text: 'text-[#5B5FC7]', border: 'border-[#D5D6F7]' },
  { bg: 'bg-[#EAF3F2]', text: 'text-[#4A6663]', border: 'border-[#D5E5E3]' },
  { bg: 'bg-[#E4EEF9]', text: 'text-[#2F6FB0]', border: 'border-[#C6DCF3]' },
  { bg: 'bg-[#FFF1D6]', text: 'text-[#9A5B00]', border: 'border-[#FFE3B3]' },
  { bg: 'bg-[#FFEBD6]', text: 'text-[#B45309]', border: 'border-[#FEDBB7]' },
];

function getInitials(name: string): string {
  if (!name) return '??';
  // Strip Dr. / Mr. / Ms.
  const clean = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SERENE_PALETTES.length;
  return SERENE_PALETTES[index];
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const initials = getInitials(name);
  const palette = getPalette(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
  }[size];

  return (
    <div
      className={`shrink-0 rounded-2xl flex items-center justify-center font-bold tracking-tight border select-none ${sizeClasses} ${palette.bg} ${palette.text} ${palette.border} ${className}`}
      aria-label={name}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
