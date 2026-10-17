// ============================================================================
// HABS Design Tokens — "Serene Lagoon" Palette
// Calm, peaceful, unique, easy on the eyes.
// Every color is defined once here and as CSS variables in index.css.
// Meets WCAG 2.1 AA contrast requirements everywhere.
// ============================================================================

export const TOKENS = {
  // Brand and accent
  primary: '#1F7A78',         // Soft deep teal: primary buttons, active tab/nav, selected slot, links, key icons
  primaryHover: '#176361',
  primaryPressed: '#11504E',
  primarySoft: '#E1F2F0',     // Tinted backgrounds for selected rows, active nav item, info highlights
  accent: '#6C6FD8',          // Gentle lavender: secondary highlights, focus rings, step indicator, "held" states
  accentSoft: '#ECECFB',

  // Surfaces and lines
  bg: '#F4F9F8',              // Misty mint page background
  surface: '#FFFFFF',         // Cards, tables, modals
  surfaceMuted: '#EAF3F2',    // Table headers, side menu, disabled fields
  border: '#D5E5E3',          // Soft hairline borders (no heavy black outlines)
  heroGradient: 'linear-gradient(135deg, #E6F4F1 0%, #EDEBFB 100%)',

  // Shadows
  shadowSoft: '0 4px 16px rgba(31, 122, 120, 0.08)',
  shadowSm: '0 1px 3px rgba(31, 122, 120, 0.06)',
  shadowLg: '0 10px 25px -5px rgba(31, 122, 120, 0.12)',

  // Text
  text: '#16302F',            // Deep green-charcoal (never pure black)
  textSecondary: '#4A6663',
  textMuted: '#55706E',       // Captions & helper text (>= 4.5:1 contrast on white)
  textOnPrimary: '#FFFFFF',

  // Interaction
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C6FD8] focus-visible:ring-offset-2',
  buttonDisabled: 'bg-[#E3ECEB] text-[#8A9C9A] cursor-not-allowed border-[#D5E5E3]',
  buttonPrimary: 'bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.12)]',
  buttonDestructiveOutline: 'border border-[#B4455A] text-[#B4455A] hover:bg-[#FBE9EC] active:bg-[#FBE9EC]',
  buttonDestructiveFilled: 'bg-[#B4455A] hover:bg-[#9E364A] text-[#FFFFFF] shadow-[0_4px_16px_rgba(180,69,90,0.15)]',
} as const;

// Status styling definitions: paired with an icon and text label
export interface StatusStyle {
  text: string;
  bg: string;
  border: string;
  iconColor: string;
}

export const STATUS_STYLES = {
  // Booked / Confirmed / Active / Success
  booked: {
    text: 'text-[#1F7A78]',
    bg: 'bg-[#E1F2F0]',
    border: 'border-[#C6E7E4]',
    iconColor: '#1F7A78',
  },
  confirmed: {
    text: 'text-[#1F7A78]',
    bg: 'bg-[#E1F2F0]',
    border: 'border-[#C6E7E4]',
    iconColor: '#1F7A78',
  },
  active: {
    text: 'text-[#1F7A78]',
    bg: 'bg-[#E1F2F0]',
    border: 'border-[#C6E7E4]',
    iconColor: '#1F7A78',
  },
  success: {
    text: 'text-[#1F7A78]',
    bg: 'bg-[#E1F2F0]',
    border: 'border-[#C6E7E4]',
    iconColor: '#1F7A78',
  },

  // Completed
  completed: {
    text: 'text-[#2F6FB0]',
    bg: 'bg-[#E4EEF9]',
    border: 'border-[#C6DCF3]',
    iconColor: '#2F6FB0',
  },

  // Cancelled
  cancelled: {
    text: 'text-[#B4455A]',
    bg: 'bg-[#FBE9EC]',
    border: 'border-[#F4CAD1]',
    iconColor: '#B4455A',
  },

  // No-show
  noShow: {
    text: 'text-[#9A5B00]',
    bg: 'bg-[#FFF1D6]',
    border: 'border-[#FFE3B3]',
    iconColor: '#9A5B00',
  },

  // Held / Awaiting verification / Pending
  held: {
    text: 'text-[#5B5FC7]',
    bg: 'bg-[#ECECFB]',
    border: 'border-[#D5D6F7]',
    iconColor: '#5B5FC7',
  },
  pending: {
    text: 'text-[#5B5FC7]',
    bg: 'bg-[#ECECFB]',
    border: 'border-[#D5D6F7]',
    iconColor: '#5B5FC7',
  },

  // Change required / Doctor leave / Flagged
  flagged: {
    text: 'text-[#B45309]',
    bg: 'bg-[#FFEBD6]',
    border: 'border-[#FEDBB7]',
    iconColor: '#B45309',
  },
  changeRequired: {
    text: 'text-[#B45309]',
    bg: 'bg-[#FFEBD6]',
    border: 'border-[#FEDBB7]',
    iconColor: '#B45309',
  },

  // Delivery failed / Error
  error: {
    text: 'text-[#B3261E]',
    bg: 'bg-[#FDECEA]',
    border: 'border-[#F9C9C5]',
    iconColor: '#B3261E',
  },

  // Info / Pending approval notes
  info: {
    text: 'text-[#4A6663]',
    bg: 'bg-[#EAF3F2]',
    border: 'border-[#D5E5E3]',
    iconColor: '#4A6663',
  },
} as const;
