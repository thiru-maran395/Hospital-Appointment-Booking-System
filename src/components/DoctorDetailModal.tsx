import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Calendar, 
  ArrowLeft 
} from 'lucide-react';
import { Doctor, Slot } from '../types';
import { useApp } from '../context/AppContext';
import { formatIstDate, formatIstTime, formatIstDateKey } from '../utils/time';
import { Avatar } from './common/Avatar';
import { StatusBadge } from './common/StatusBadge';
import { getRelativeDateString } from '../data/mockData';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctor: Doctor, selectedSlot?: Slot | null) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBook,
}) => {
  const { departments, specializations, slots, currentUser } = useApp();

  const [selectedDateKey, setSelectedDateKey] = useState<string>(getRelativeDateString(1));
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  if (!doctor) return null;

  const dept = departments.find((d) => d.id === doctor.departmentId);
  const spec = specializations.find((s) => s.id === doctor.specializationId);

  // Available dates (e.g. next 4 days from tomorrow)
  const availableDates = [1, 2, 3, 4].map((offset) => {
    const key = getRelativeDateString(offset);
    const dateObj = new Date(key + 'T00:00:00Z');
    const dayLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' });
    const dayNum = dateObj.getUTCDate();
    const count = slots.filter(
      (s) => s.doctorId === doctor.id && formatIstDateKey(s.startUtc) === key && s.status === 'open'
    ).length;
    return { key, dayLabel, dayNum, count };
  });

  // Current date's slots for this doctor
  const daySlots = slots
    .filter(
      (s) => s.doctorId === doctor.id && formatIstDateKey(s.startUtc) === selectedDateKey
    )
    .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;

  // Next available open slot overall
  const nextOpenSlot = slots
    .filter((s) => s.doctorId === doctor.id && s.status === 'open')
    .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime())[0];

  const handleSelectSlot = (slot: Slot) => {
    if (slot.status !== 'open') return;
    setSelectedSlotId(slot.id);
  };

  const handleJumpToNextAvailable = () => {
    if (nextOpenSlot) {
      const key = formatIstDateKey(nextOpenSlot.startUtc);
      setSelectedDateKey(key);
      setSelectedSlotId(nextOpenSlot.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#16302F]/50 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-[#F4F9F8] rounded-3xl max-w-5xl w-full shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] overflow-hidden my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with back link (Wireframe 04) */}
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border-b border-[#D5E5E3] flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1F7A78] hover:text-[#176361] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to doctor results
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAF3F2] text-[#55706E] hover:text-[#16302F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Header Title (Wireframe 04) */}
        <div className="px-6 sm:px-8 pt-6 pb-3 bg-[#FFFFFF]">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
            {doctor.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#4A6663] font-medium mt-0.5">
            {spec?.name || 'Cardiologist'} · {dept?.name || 'Department of Cardiology'}
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Wireframe 04) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-5">
              <div className="flex items-center gap-3">
                <Avatar
                  name={doctor.name}
                  size="xl"
                  className="w-20 h-20 rounded-2xl bg-[#E1F2F0] text-[#1F7A78] text-xl font-bold border border-[#C6E7E4] shadow-xs"
                />
                <StatusBadge status="active" label="Active doctor" size="sm" />
              </div>

              <div>
                <h2 className="font-extrabold text-sm text-[#16302F] mb-1.5">
                  About the doctor
                </h2>
                <p className="text-xs text-[#4A6663] leading-relaxed">
                  {doctor.profileText} Appointments are available through the {dept?.name || 'outpatient'} department.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D5E5E3] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#55706E] font-medium">Gender</span>
                  <span className="text-[#16302F] font-semibold capitalize">{doctor.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#55706E] font-medium">Languages</span>
                  <span className="text-[#16302F] font-semibold">{doctor.languages.join(', ')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#55706E] font-medium">Consultation fee</span>
                  <span className="text-[#16302F] font-bold">₹{doctor.fee} per consultation</span>
                </div>
              </div>
            </div>

            {/* Before you book card (Wireframe 04) */}
            <div className="bg-[#EAF3F2] p-4 rounded-2xl border border-[#D5E5E3] text-xs text-[#4A6663] space-y-1">
              <h3 className="font-bold text-[#16302F]">Before you book</h3>
              <p className="text-[11px] leading-relaxed text-[#55706E]">
                {currentUser 
                  ? 'Booking as ' + currentUser.name + '. Choose a slot on the right to proceed.'
                  : 'Sign in to a verified patient account to continue. You may browse availability before signing in.'}
              </p>
            </div>
          </div>

          {/* Right Column (Wireframe 04: Slot Chooser & Selection) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Slot Chooser Card */}
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-5">
              <div>
                <h2 className="font-extrabold text-base text-[#16302F]">
                  Choose an appointment slot
                </h2>
                <p className="text-xs text-[#55706E] mt-0.5">
                  All times IST (UTC+05:30) · Outpatient consultation
                </p>
              </div>

              {/* Month bar */}
              <div className="flex items-center justify-between text-xs font-bold text-[#16302F] border-b border-[#D5E5E3] pb-2">
                <span>October 2026</span>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded border border-[#D5E5E3] text-[#4A6663] hover:bg-[#EAF3F2] text-[11px] cursor-pointer">
                    ← Previous
                  </button>
                  <button className="px-2 py-1 rounded border border-[#D5E5E3] text-[#4A6663] hover:bg-[#EAF3F2] text-[11px] cursor-pointer">
                    Next →
                  </button>
                </div>
              </div>

              {/* Date Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {availableDates.map((d) => {
                  const isSelected = selectedDateKey === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => {
                        setSelectedDateKey(d.key);
                        setSelectedSlotId(null);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F7A78] text-[#FFFFFF] border-[#1F7A78] shadow-[0_4px_16px_rgba(31,122,120,0.18)]'
                          : 'bg-[#FFFFFF] text-[#16302F] border-[#D5E5E3] hover:bg-[#E1F2F0] hover:border-[#1F7A78]'
                      }`}
                    >
                      <div className="font-bold text-xs">{d.dayLabel} {d.dayNum}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#E1F2F0] font-semibold' : 'text-[#55706E]'}`}>
                        {d.count > 0 ? `${d.count} slots` : 'No slots'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Slot Grid Header & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs border-t border-[#D5E5E3]">
                <span className="font-bold text-[#16302F]">
                  {formatIstDate(selectedDateKey + 'T00:00:00Z')}
                </span>

                {/* Serene Lagoon Slot Legend */}
                <div className="flex items-center gap-3 text-[11px] text-[#55706E]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border-2 border-[#1F7A78] bg-[#FFFFFF] inline-block"></span>
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#1F7A78] inline-block"></span>
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#EEF2F2] border border-[#D5E5E3] inline-block"></span>
                    Unavailable
                  </span>
                </div>
              </div>

              {/* Slot Grid States per Serene Lagoon spec */}
              {daySlots.length === 0 ? (
                <div className="p-8 text-center bg-[#EAF3F2] rounded-xl border border-dashed border-[#D5E5E3] text-xs text-[#55706E]">
                  No slots scheduled for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {daySlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const isOpen = slot.status === 'open';

                    // Unavailable state (booked, held or blocked): #EEF2F2 background, #7A8F8D text, not clickable, with word "Unavailable"
                    if (!isOpen) {
                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl bg-[#EEF2F2] border border-[#D5E5E3] text-center cursor-not-allowed select-none"
                        >
                          <div className="font-mono text-xs font-bold text-[#7A8F8D]">
                            {formatIstTime(slot.startUtc)} IST
                          </div>
                          <div className="text-[10px] text-[#7A8F8D] mt-1 font-medium">
                            Unavailable
                          </div>
                        </div>
                      );
                    }

                    // Selected state: solid --primary background (#1F7A78), white text (#FFFFFF), with a check icon and the word "Selected"
                    if (isSelected) {
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSelectSlot(slot)}
                          className="p-3 rounded-xl bg-[#1F7A78] border-2 border-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)] text-center cursor-pointer flex flex-col items-center justify-center transition-all"
                        >
                          <div className="font-mono text-xs font-bold">
                            {formatIstTime(slot.startUtc)} IST
                          </div>
                          <div className="text-[10px] mt-1 font-bold flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-[#FFFFFF]" />
                            <span>Selected</span>
                          </div>
                        </button>
                      );
                    }

                    // Available state: white background, teal border, teal text. Hover: --primary-soft background (#E1F2F0)
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className="p-3 rounded-xl bg-[#FFFFFF] border-2 border-[#1F7A78] text-[#1F7A78] hover:bg-[#E1F2F0] text-center transition-all cursor-pointer flex flex-col items-center justify-center"
                      >
                        <div className="font-mono text-xs font-bold">
                          {formatIstTime(slot.startUtc)} IST
                        </div>
                        <div className="text-[10px] mt-1 font-semibold">
                          Available
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Next open slot row */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D5E5E3] text-[#55706E]">
                {nextOpenSlot ? (
                  <span>
                    Next open slot: <strong className="text-[#16302F] font-bold">{formatIstDate(nextOpenSlot.startUtc)} · {formatIstTime(nextOpenSlot.startUtc, true)}</strong>
                  </span>
                ) : (
                  <span>No upcoming slots found</span>
                )}

                {nextOpenSlot && (
                  <button
                    onClick={handleJumpToNextAvailable}
                    className="text-[#1F7A78] hover:text-[#176361] hover:underline font-bold cursor-pointer"
                  >
                    Jump to next available
                  </button>
                )}
              </div>
            </div>

            {/* Your selection card (Wireframe 04) */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3">
              <h2 className="font-extrabold text-sm text-[#16302F]">Your selection</h2>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[#55706E] block text-[11px]">Date & time</span>
                  <span className="font-bold text-[#16302F] text-sm">
                    {selectedSlot 
                      ? `${formatIstDate(selectedSlot.startUtc)} · ${formatIstTime(selectedSlot.startUtc)}–${formatIstTime(selectedSlot.endUtc)} IST`
                      : 'No slot selected yet'}
                  </span>
                </div>

                <div>
                  <span className="text-[#55706E] block text-[11px]">Consultation fee</span>
                  <span className="font-bold text-[#16302F] text-sm">₹{doctor.fee}</span>
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={() => {
                    onClose();
                    onBook(doctor, selectedSlot);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedSlot
                      ? 'bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]'
                      : 'bg-[#E3ECEB] text-[#8A9C9A] border border-[#D5E5E3] cursor-not-allowed'
                  }`}
                >
                  Proceed to book
                </button>
              </div>

              <p className="text-[11px] text-[#55706E]">
                A slot is not reserved until you start booking; final availability is checked at confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
