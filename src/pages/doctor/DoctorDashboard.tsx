import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Filter, 
  Lock, 
  ShieldAlert,
  ChevronRight,
  User,
  Building2,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatIstDate, formatIstTime, formatIstDateKey } from '../../utils/time';
import { Appointment, AppointmentStatus } from '../../types';
import { getRelativeDateString } from '../../data/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';

export const DoctorDashboard: React.FC = () => {
  const {
    currentUser,
    doctors,
    appointments,
    markAppointmentStatus,
    addConsultationNote,
    emergencyBlockDay,
    applyDoctorLeave,
  } = useApp();

  const doctor = doctors.find((d) => d.id === currentUser?.doctorId) || doctors[0];

  const [activeTab, setActiveTab] = useState<'schedule' | 'availability' | 'notifications' | 'profile'>('schedule');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(getRelativeDateString(1));
  const [selectedAptForOutcome, setSelectedAptForOutcome] = useState<Appointment | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<AppointmentStatus>('completed');
  const [outcomeNote, setOutcomeNote] = useState<string>('');

  const [slotDuration, setSlotDuration] = useState('30 minutes');
  const [breakTime, setBreakTime] = useState('13:00 – 14:00 IST');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Appointments for this doctor
  const doctorAppointments = appointments.filter((a) => a.doctorId === doctor.id);
  const dayAppointments = doctorAppointments.filter(
    (a) => formatIstDateKey(a.startUtc) === selectedDateKey
  ).sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());

  // KPI Metrics (Wireframe 08)
  const todayKey = getRelativeDateString(0);
  const todayAppointments = doctorAppointments.filter((a) => formatIstDateKey(a.startUtc) === todayKey);
  const bookingsToday = todayAppointments.length;
  const upcomingToday = todayAppointments.filter((a) => a.status === 'booked').length;
  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;
  const noShowsToday = todayAppointments.filter((a) => a.status === 'no-show').length;

  const dayPills = [0, 1, 2, 3, 4].map((offset) => {
    const key = getRelativeDateString(offset);
    const dateObj = new Date(key + 'T00:00:00Z');
    const dayLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' });
    const dayNum = dateObj.getUTCDate();
    const month = dateObj.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' });
    return { key, label: `${dayLabel} ${dayNum} ${month}` };
  });

  const handleSaveOutcome = () => {
    if (!selectedAptForOutcome) return;

    markAppointmentStatus(selectedAptForOutcome.id, outcomeStatus);
    if (outcomeNote.trim()) {
      addConsultationNote(selectedAptForOutcome.id, outcomeNote);
    }

    setToastMessage(`Outcome recorded for ${selectedAptForOutcome.treatedPersonName}: ${outcomeStatus}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEmergencyBlock = () => {
    emergencyBlockDay(doctor.id, selectedDateKey, 'Emergency clinical duty / unscheduled clinic absence');
    setEmergencyModalOpen(false);
    setToastMessage(`Emergency block applied for ${selectedDateKey}. Affected bookings flagged.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#16302F] text-[#FFFFFF] px-4 py-3 rounded-2xl shadow-[0_10px_25px_-5px_rgba(31,122,120,0.25)] flex items-center gap-3 border border-[#D5E5E3]/40 animate-in fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-[#E1F2F0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subtitle & Title Header (Wireframe 08) */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#55706E]">
          DOCTOR WORKSPACE · All times IST (UTC+05:30)
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
              Your schedule, {doctor.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A6663] mt-0.5">
              Department of Cardiology · Only your own appointments and availability are shown.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs (Wireframe 08) */}
      <div className="flex items-center gap-2 border-b border-[#D5E5E3] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'schedule' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          My schedule
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'availability' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          Availability
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'notifications' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          Booking notifications
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          My profile
        </button>
      </div>

      {/* 4 KPI Summary Cards (Wireframe 08) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
          <span className="text-[#55706E] font-semibold text-xs block">Bookings today</span>
          <span className="text-2xl font-black text-[#16302F] mt-1 block">{bookingsToday}</span>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
          <span className="text-[#55706E] font-semibold text-xs block">Upcoming today</span>
          <span className="text-2xl font-black text-[#1F7A78] mt-1 block">{upcomingToday}</span>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
          <span className="text-[#55706E] font-semibold text-xs block">Completed</span>
          <span className="text-2xl font-black text-[#2F6FB0] mt-1 block">{completedToday}</span>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
          <span className="text-[#55706E] font-semibold text-xs block">No-show · Occupied</span>
          <span className="text-2xl font-black text-[#9A5B00] mt-1 block">{noShowsToday}</span>
        </div>
      </div>

      {/* Main 2-Column Layout (Wireframe 08) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Appointments List + Visit Outcome */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card: Appointments Table (Wireframe 08) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-extrabold text-base text-[#16302F]">Appointments</h2>
              
              <div className="flex items-center gap-2 text-xs">
                <button 
                  onClick={() => setSelectedDateKey(getRelativeDateString(1))}
                  className="px-2 py-1 rounded-lg border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] cursor-pointer"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDateKey}
                  onChange={(e) => setSelectedDateKey(e.target.value)}
                  className="px-2.5 py-1 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-lg text-xs font-semibold cursor-pointer"
                />
                <button 
                  onClick={() => setSelectedDateKey(getRelativeDateString(2))}
                  className="px-2 py-1 rounded-lg border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] cursor-pointer"
                >
                  →
                </button>
                <button 
                  onClick={() => setSelectedDateKey(todayKey)}
                  className="px-2.5 py-1 rounded-lg bg-[#EAF3F2] hover:bg-[#E1F2F0] text-[#1F7A78] font-bold cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Day Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {dayPills.map((p) => {
                const isSelected = selectedDateKey === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelectedDateKey(p.key)}
                    className={`px-3 py-1.5 rounded-xl border text-center font-bold whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1F7A78] text-[#FFFFFF] border-[#1F7A78] shadow-xs'
                        : 'bg-[#FFFFFF] text-[#16302F] border-[#D5E5E3] hover:bg-[#EAF3F2]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#55706E]">
              All times IST (UTC+05:30) · 30-minute slots · Select a visit to manage its outcome.
            </p>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D5E5E3] text-[#55706E] uppercase font-bold text-[10px] bg-[#EAF3F2]">
                    <th className="py-2.5 px-3">Time · IST</th>
                    <th className="py-2.5 px-3">Patient / details</th>
                    <th className="py-2.5 px-3">Reason for visit</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E5E3] font-medium">
                  {dayAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#55706E] italic">
                        No appointments scheduled for this date.
                      </td>
                    </tr>
                  ) : (
                    dayAppointments.map((apt) => {
                      const isSelected = selectedAptForOutcome?.id === apt.id;
                      return (
                        <tr 
                          key={apt.id}
                          onClick={() => setSelectedAptForOutcome(apt)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#E1F2F0]' : 'hover:bg-[#EAF3F2]'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#16302F] whitespace-nowrap">
                            {formatIstTime(apt.startUtc)}–{formatIstTime(apt.endUtc)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#16302F] block">{apt.treatedPersonName}</span>
                            <span className="text-[11px] text-[#55706E]">
                              {apt.treatedPersonType === 'dependent' ? 'Dependent' : 'Self'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#4A6663] max-w-xs truncate">
                            {apt.reasonForVisit}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={apt.status} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAptForOutcome(apt);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[#D5E5E3] hover:bg-[#FFFFFF] text-[#16302F] font-bold text-[11px] cursor-pointer"
                            >
                              Review outcome
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Visit outcome · Interactive Outcome Box (Wireframe 08) */}
          {selectedAptForOutcome && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5E5E3] pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[#16302F]">
                    Visit outcome · {selectedAptForOutcome.treatedPersonName}
                  </h3>
                  <p className="text-[11px] text-[#55706E]">
                    {formatIstDate(selectedAptForOutcome.startUtc)} · {formatIstTime(selectedAptForOutcome.startUtc)}–{formatIstTime(selectedAptForOutcome.endUtc)} IST
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOutcomeStatus('completed')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      outcomeStatus === 'completed'
                        ? 'bg-[#2F6FB0] text-[#FFFFFF] shadow-xs'
                        : 'border border-[#D5E5E3] text-[#16302F] hover:bg-[#EAF3F2]'
                    }`}
                  >
                    ✓ Completed
                  </button>
                  <button
                    onClick={() => setOutcomeStatus('cancelled')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      outcomeStatus === 'cancelled'
                        ? 'bg-[#B4455A] text-[#FFFFFF] shadow-xs'
                        : 'border border-[#D5E5E3] text-[#16302F] hover:bg-[#EAF3F2]'
                    }`}
                  >
                    Cancelled
                  </button>
                  <button
                    onClick={() => setOutcomeStatus('no-show')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      outcomeStatus === 'no-show'
                        ? 'bg-[#9A5B00] text-[#FFFFFF] shadow-xs'
                        : 'border border-[#D5E5E3] text-[#16302F] hover:bg-[#EAF3F2]'
                    }`}
                  >
                    No-show
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#16302F] mb-1">
                  Optional consultation note · Authorized staff only
                </label>
                <textarea
                  rows={2}
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  placeholder="Clinical examination findings, follow-up advice..."
                  className="w-full p-2.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl resize-none focus-visible:ring-2 focus-visible:ring-[#6C6FD8]"
                />
                <span className="text-[10px] text-[#55706E] block mt-1">
                  Appointment coordination only. Not a clinical record, diagnosis or prescription.
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveOutcome}
                  className="px-5 py-2 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] font-bold rounded-xl text-xs cursor-pointer shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-colors"
                >
                  Save outcome
                </button>
              </div>
            </div>
          )}

          {/* Card: Booking changes log (Wireframe 08) */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-2 text-xs">
            <h3 className="font-extrabold text-sm text-[#16302F]">Booking changes</h3>
            <p className="text-[#4A6663] text-[11px] leading-relaxed">
              Aarav Sharma booked 20 Oct · 10:30 IST. Neha Verma cancelled 20 Oct · 10:00 IST; reason: unable to attend. Open booking notifications for all changes.
            </p>
          </div>
        </div>

        {/* Right Column: Manage Availability & Leave Impact */}
        <div className="lg:col-span-4 space-y-4 text-xs">
          {/* Card: Manage availability (Wireframe 08) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#16302F]">Manage availability</h3>
              <p className="text-[#55706E] text-[11px] mt-0.5">
                New availability applies only to eligible, unbooked slots.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#D5E5E3]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#55706E] block text-[11px]">Recurring weekly hours</span>
                  <span className="font-bold text-[#16302F]">Mon–Fri · 09:00–13:00 IST</span>
                </div>
                <button className="text-[#1F7A78] font-bold hover:underline cursor-pointer">
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#55706E] block text-[11px] mb-1">Slot duration</label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                    className="w-full p-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#55706E] block text-[11px] mb-1">Break</label>
                  <input
                    type="text"
                    value={breakTime}
                    onChange={(e) => setBreakTime(e.target.value)}
                    className="w-full p-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#D5E5E3] space-y-2">
                <span className="font-bold text-[#16302F] block">Planned leave</span>
                <p className="text-[#55706E] text-[11px]">23 Oct 2026 · Full day</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      applyDoctorLeave({
                        doctorId: doctor.id,
                        startDateUtc: getRelativeDateString(3),
                        endDateUtc: getRelativeDateString(3),
                        reason: 'Conference attendance',
                      });
                      setToastMessage('Planned leave applied for 23 Oct. Affected bookings flagged.');
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] font-bold text-[#16302F] cursor-pointer"
                  >
                    Manage leave
                  </button>
                  {/* Destructive outline button on page */}
                  <button
                    onClick={() => setEmergencyModalOpen(true)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-[#B4455A] text-[#B4455A] hover:bg-[#FBE9EC] font-bold cursor-pointer transition-colors"
                  >
                    Emergency day block
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#55706E] pt-1">
              Booked slots cannot be edited without cancellation or reassignment. Save changes only after reviewing affected appointments.
            </p>
          </div>

          {/* Card: Leave impact · 2 appointments flagged (Wireframe 08) */}
          <div className="bg-[#FFEBD6] p-5 rounded-2xl border border-[#FEDBB7] text-[#B45309] space-y-1">
            <h3 className="font-extrabold text-sm text-[#B45309]">
              Leave impact · 2 appointments flagged
            </h3>
            <p className="text-[11px] leading-relaxed">
              Leave on 23 Oct requires rescheduling or Administrator reassignment. An emergency day block also flags affected bookings and sends notifications; bookings are never deleted.
            </p>
          </div>

          {/* Card: Professional profile (Wireframe 08) */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-2">
            <h3 className="font-extrabold text-sm text-[#16302F]">Professional profile</h3>
            <p className="text-[#4A6663] font-medium">{doctor.name} · Cardiology</p>
            <button className="text-[#1F7A78] font-bold hover:underline cursor-pointer block pt-1">
              Manage my profile
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Block Confirmation Dialog (Destructive filled inside modal) */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#16302F]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] animate-in fade-in zoom-in-95 text-xs">
            <h3 className="font-extrabold text-base text-[#B4455A]">Emergency Day Block</h3>
            <p className="text-[#16302F] leading-relaxed">
              Block all slots on <strong>{selectedDateKey}</strong>? All scheduled appointments will be flagged for priority rescheduling (RL-16).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D5E5E3] text-[#16302F] font-bold cursor-pointer hover:bg-[#EAF3F2]"
              >
                Cancel
              </button>
              {/* Filled destructive button only inside modal */}
              <button
                onClick={handleEmergencyBlock}
                className="px-5 py-2 rounded-xl bg-[#B4455A] hover:bg-[#9E364A] text-[#FFFFFF] font-bold cursor-pointer shadow-xs"
              >
                Confirm Emergency Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
