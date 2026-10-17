import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  PhoneCall, 
  Clock, 
  Stethoscope,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CountdownTimer } from './CountdownTimer';
import { DEMO_USERS } from '../data/mockData';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  onOpenQuickBook: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenHelp?: () => void;
  onOpenPreVisitGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickBook,
  onOpenAuth,
  onOpenProfile,
  onOpenNotifications,
  onOpenHelp,
  onOpenPreVisitGuide,
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    appointments, 
    activeHoldSlot, 
    holdSecondsRemaining,
    notifications 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Active bookings badge for patient
  const patientBookingsCount = appointments.filter(
    (a) => a.status === 'booked' && (!currentUser?.patientId || a.patientId === currentUser?.patientId)
  ).length;

  const handleSwitchRole = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      if (role === 'doctor') onSelectTab('doctor-dashboard');
      else if (role === 'admin') onSelectTab('admin-dashboard');
      else if (role === 'receptionist') onSelectTab('receptionist-dashboard');
      else onSelectTab('find-doctors');
    }
    setUserDropdownOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setUserDropdownOpen(false);
    onSelectTab('find-doctors');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D5E5E3] shadow-[0_1px_3px_rgba(31,122,120,0.06)]">
      {/* Top subtle bar with emergency and IST status */}
      <div className="bg-[#16302F] text-[#EAF3F2] text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E1F2F0] font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1F7A78] animate-pulse"></span>
              Beetloop OPD Live · All times IST (UTC+05:30)
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[#D5E5E3]/80">
              <Clock className="w-3.5 h-3.5 text-[#E1F2F0]" />
              Mon – Sat 08:00 AM – 08:00 PM
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenHelp}
              className="text-[#EAF3F2] hover:text-[#FFFFFF] transition-colors underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#E1F2F0]" />
              Help & Support
            </button>
            <div className="flex items-center gap-1.5 text-[#FFEBD6] font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-[#FFEBD6]" />
              <span className="hidden sm:inline">24/7 Emergency:</span>
              <a href="tel:918005550199" className="hover:underline text-[#FFFFFF] font-mono">
                +91 800 555 0199
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: + Logo mark + HABS + Beetloop Hospital Appointment Booking System */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => {
              if (currentUser?.role === 'doctor') onSelectTab('doctor-dashboard');
              else if (currentUser?.role === 'admin') onSelectTab('admin-dashboard');
              else if (currentUser?.role === 'receptionist') onSelectTab('receptionist-dashboard');
              else onSelectTab('find-doctors');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1F7A78] hover:bg-[#176361] text-[#FFFFFF] flex items-center justify-center font-black text-xl shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-colors">
              +
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-[#16302F] tracking-tight">HABS</span>
                <span className="text-[11px] font-bold text-[#1F7A78] bg-[#E1F2F0] px-1.5 py-0.5 rounded border border-[#C6E7E4]">
                  Beetloop
                </span>
              </div>
              <p className="text-[10px] text-[#55706E] font-medium leading-none hidden sm:block">
                Hospital Appointment Booking System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (active nav item uses --primary-soft) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('find-doctors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'find-doctors'
                  ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold'
                  : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#1F7A78]" />
              Find a doctor
            </button>

            {/* Patient navigation */}
            {currentUser?.role === 'patient' && (
              <>
                <button
                  onClick={() => onSelectTab('my-appointments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'my-appointments'
                      ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold'
                      : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1F7A78]" />
                  My appointments
                  {patientBookingsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#1F7A78] text-[#FFFFFF] text-[10px] font-bold">
                      {patientBookingsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={onOpenProfile}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2] cursor-pointer"
                >
                  Family & dependents
                </button>
              </>
            )}

            {/* Doctor Navigation */}
            {currentUser?.role === 'doctor' && (
              <button
                onClick={() => onSelectTab('doctor-dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'doctor-dashboard'
                    ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#1F7A78]" />
                Doctor Workspace
              </button>
            )}

            {/* Administrator Navigation */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSelectTab('admin-dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'admin-dashboard'
                    ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A78]" />
                Hospital Overview
              </button>
            )}

            {/* Receptionist Navigation */}
            {currentUser?.role === 'receptionist' && (
              <button
                onClick={() => onSelectTab('receptionist-dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'receptionist-dashboard'
                    ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#1F7A78]" />
                Reception Desk
              </button>
            )}

            <button
              onClick={onOpenHelp}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2] cursor-pointer"
            >
              Help & support
            </button>
          </nav>
        </div>

        {/* Right side of Header */}
        <div className="flex items-center gap-3">
          {/* Active slot hold countdown timer pill */}
          {activeHoldSlot && (
            <div className="hidden lg:block">
              <CountdownTimer secondsRemaining={holdSecondsRemaining} />
            </div>
          )}

          {/* In-app Notification center trigger */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-[#EAF3F2] hover:bg-[#E1F2F0] text-[#1F7A78] relative cursor-pointer transition-colors"
            title="Notifications (SMS, Email, WhatsApp)"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B3261E] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Signed In User Pill vs Signed Out View */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-[#F4F9F8] hover:bg-[#EAF3F2] border border-[#D5E5E3] rounded-xl cursor-pointer text-xs transition-colors"
              >
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-[#16302F] block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] uppercase font-bold text-[#1F7A78] tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[#1F7A78] text-[#FFFFFF] flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#55706E]" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] rounded-2xl shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#D5E5E3] text-xs">
                    <span className="text-[#55706E] uppercase font-bold text-[10px] block">Signed in as:</span>
                    <strong className="text-[#16302F] block truncate">{currentUser.name}</strong>
                    <span className="text-[11px] text-[#4A6663] font-mono block truncate">{currentUser.email}</span>
                  </div>

                  <div className="px-3 py-1.5 border-b border-[#D5E5E3] text-[10px] text-[#55706E] uppercase font-bold">
                    Quick Role Workspace Switch:
                  </div>

                  <button
                    onClick={() => handleSwitchRole('patient')}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-[#E1F2F0] text-[#16302F] flex items-center justify-between cursor-pointer"
                  >
                    <span>Patient (Aarav Sharma)</span>
                    {currentUser.role === 'patient' && <span className="text-[#1F7A78] font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('doctor')}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-[#E1F2F0] text-[#16302F] flex items-center justify-between cursor-pointer"
                  >
                    <span>Doctor (Dr. Meera Shah)</span>
                    {currentUser.role === 'doctor' && <span className="text-[#1F7A78] font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('receptionist')}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-[#E1F2F0] text-[#16302F] flex items-center justify-between cursor-pointer"
                  >
                    <span>Receptionist (Pooja Nair)</span>
                    {currentUser.role === 'receptionist' && <span className="text-[#1F7A78] font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('admin')}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-[#E1F2F0] text-[#16302F] flex items-center justify-between cursor-pointer"
                  >
                    <span>Administrator (Ananya Rao)</span>
                    {currentUser.role === 'admin' && <span className="text-[#1F7A78] font-bold">✓</span>}
                  </button>

                  <div className="border-t border-[#D5E5E3] mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#B4455A] font-bold hover:bg-[#FBE9EC] flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden xl:inline text-[11px] text-[#55706E] font-medium">
                Secure account access · Patients · Doctors · Staff
              </span>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(31,122,120,0.18)] cursor-pointer transition-colors"
              >
                Sign in
              </button>
            </div>
          )}

          {/* Quick Book Button */}
          <button
            onClick={onOpenQuickBook}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] text-xs font-bold shadow-[0_4px_16px_rgba(31,122,120,0.18)] items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#FFFFFF]" />
            Book appointment
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#4A6663] hover:bg-[#EAF3F2] rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D5E5E3] bg-[#FFFFFF] p-4 space-y-2 text-xs font-semibold">
          <button
            onClick={() => { onSelectTab('find-doctors'); setMobileMenuOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg flex items-center gap-2 ${currentTab === 'find-doctors' ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold' : 'text-[#16302F]'}`}
          >
            <Stethoscope className="w-4 h-4 text-[#1F7A78]" />
            Find a doctor
          </button>

          {currentUser?.role === 'patient' && (
            <>
              <button
                onClick={() => { onSelectTab('my-appointments'); setMobileMenuOpen(false); }}
                className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between ${currentTab === 'my-appointments' ? 'bg-[#E1F2F0] text-[#1F7A78] font-bold' : 'text-[#16302F]'}`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1F7A78]" />
                  My appointments
                </div>
                {patientBookingsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#1F7A78] text-[#FFFFFF] text-[10px] font-bold">
                    {patientBookingsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg text-[#16302F] hover:bg-[#EAF3F2]"
              >
                Family & dependents
              </button>
            </>
          )}

          {currentUser?.role === 'doctor' && (
            <button
              onClick={() => { onSelectTab('doctor-dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-lg bg-[#E1F2F0] text-[#1F7A78] font-bold"
            >
              Doctor Workspace
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { onSelectTab('admin-dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-lg bg-[#E1F2F0] text-[#1F7A78] font-bold"
            >
              Hospital Overview
            </button>
          )}

          {currentUser?.role === 'receptionist' && (
            <button
              onClick={() => { onSelectTab('receptionist-dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-lg bg-[#E1F2F0] text-[#1F7A78] font-bold"
            >
              Reception Desk
            </button>
          )}

          <button
            onClick={() => { onOpenHelp?.(); setMobileMenuOpen(false); }}
            className="w-full text-left p-2.5 rounded-lg text-[#16302F] hover:bg-[#EAF3F2]"
          >
            Help & support
          </button>

          <div className="pt-2 border-t border-[#D5E5E3] flex items-center justify-between">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="text-xs text-[#B4455A] font-bold py-1.5 cursor-pointer"
              >
                Sign out ({currentUser.name})
              </button>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-[#1F7A78] text-[#FFFFFF] rounded-xl font-bold cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
