import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft,
  CheckCircle2, 
  Download, 
  Printer, 
  Clock,
  ChevronRight,
  ShieldAlert,
  Check
} from 'lucide-react';
import { Doctor, Slot, Appointment } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatIstDate, formatIstTime, formatIstDateKey } from '../../utils/time';
import { CountdownTimer } from '../../components/CountdownTimer';
import { PrintableAppointmentPass } from '../../components/PrintableAppointmentPass';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getRelativeDateString } from '../../data/mockData';

interface BookingWizardModalProps {
  initialDoctor?: Doctor | null;
  initialSlot?: Slot | null;
  onClose: () => void;
  onViewAppointments: () => void;
  onOpenAuth: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  initialDoctor,
  initialSlot,
  onClose,
  onViewAppointments,
  onOpenAuth,
}) => {
  const {
    currentUser,
    currentPatient,
    dependents,
    doctors,
    departments,
    slots,
    activeHoldSlot,
    holdSecondsRemaining,
    holdSlot,
    releaseHoldSlot,
    confirmBooking,
  } = useApp();

  // Selected doctor
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctor ? initialDoctor.id : doctors[0]?.id || ''
  );

  // Selected slot
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    initialSlot ? initialSlot.id : ''
  );

  // If initialSlot wasn't passed, default to Step 1, otherwise Step 2
  const [step, setStep] = useState<number>(initialSlot ? 2 : 1);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    initialSlot ? formatIstDateKey(initialSlot.startUtc) : getRelativeDateString(1)
  );

  // Patient / Dependent selection
  const [selectedTarget, setSelectedTarget] = useState<'self' | string>('self');
  const [reasonForVisit, setReasonForVisit] = useState<string>(
    'Occasional palpitations over the last week; requesting a cardiology consultation.'
  );
  const [reviewedChecks, setReviewedChecks] = useState<boolean>(true);
  const [whatsAppOptIn, setWhatsAppOptIn] = useState<boolean>(false);

  // Status and result
  const [error, setError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [showPassModal, setShowPassModal] = useState<boolean>(false);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const selectedDept = departments.find((d) => d.id === selectedDoctor.departmentId);

  // Available slots for doctor on selected date
  const doctorDateSlots = slots
    .filter(
      (s) => s.doctorId === selectedDoctor.id && formatIstDateKey(s.startUtc) === selectedDateKey
    )
    .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());

  // Automatically acquire a hold when initialSlot is provided
  useEffect(() => {
    if (initialSlot && initialSlot.status === 'open' && !activeHoldSlot) {
      holdSlot(initialSlot.id);
    }
  }, [initialSlot]);

  // When step 1 slot is picked:
  const handleSelectSlotAndHold = (slot: Slot) => {
    if (slot.status !== 'open') return;
    setSelectedSlotId(slot.id);
    const res = holdSlot(slot.id);
    if (res.success) {
      setStep(2);
      setError(null);
    } else {
      setError(res.error || 'Failed to temporarily hold slot. Please try another.');
    }
  };

  const activeSlot = slots.find((s) => s.id === selectedSlotId) || activeHoldSlot;

  // Person treated details
  const isSelf = selectedTarget === 'self';
  const targetDep = !isSelf ? dependents.find((d) => d.id === selectedTarget) : null;
  const treatedPersonName = isSelf
    ? (currentPatient?.name || currentUser?.name || 'Aarav Sharma')
    : (targetDep?.name || 'Dependent');

  const treatedPersonAge = isSelf
    ? (currentPatient?.age || 38)
    : (targetDep?.age || 10);

  const treatedPersonGender = isSelf
    ? (currentPatient?.gender === 'female' ? 'Female' : 'Male')
    : (targetDep?.gender === 'female' ? 'Female' : 'Male');

  const contactPhone = currentPatient?.phone || currentUser?.phone || '+91 98765 43210';
  const contactEmail = currentPatient?.email || currentUser?.email || 'aarav.sharma@example.com';

  // Handle Confirmation
  const handleConfirm = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!activeSlot && !activeHoldSlot) {
      setError('Your temporary slot hold has expired. Please select a slot again.');
      setStep(1);
      return;
    }

    if (!reasonForVisit.trim()) {
      setError('Please provide a brief reason for consultation.');
      return;
    }

    if (!reviewedChecks) {
      setError('Please review and check the booking validation terms.');
      return;
    }

    const res = confirmBooking({
      slotId: activeHoldSlot ? activeHoldSlot.id : selectedSlotId,
      reasonForVisit,
      treatedPersonType: isSelf ? 'patient' : 'dependent',
      dependentId: isSelf ? undefined : targetDep?.id,
      treatedPersonName: isSelf
        ? (currentPatient?.name || currentUser.name)
        : (targetDep?.name || 'Dependent'),
    });

    if (res.success && res.appointment) {
      setConfirmedAppointment(res.appointment);
      setStep(3); // Confirmation step (Wireframe 06)
      setError(null);
    } else {
      setError(res.error || 'Booking validation failed. The slot may have been claimed.');
    }
  };

  const isHoldExpiring = holdSecondsRemaining <= 60 && holdSecondsRemaining > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#16302F]/50 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-[#F4F9F8] rounded-3xl max-w-4xl w-full shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] overflow-hidden my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border-b border-[#D5E5E3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => {
                  if (activeHoldSlot) releaseHoldSlot();
                  setStep(1);
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#1F7A78] hover:text-[#176361] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to slot selection
              </button>
            )}
            {step !== 2 && (
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#55706E]">
                HABS Booking System
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (activeHoldSlot) releaseHoldSlot();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#EAF3F2] text-[#55706E] hover:text-[#16302F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Breadcrumb (Wireframe 05) */}
        {step < 3 && (
          <div className="bg-[#FFFFFF] px-6 sm:px-8 py-3 border-b border-[#D5E5E3] flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
            <span className={step === 1 ? 'text-[#6C6FD8] border-b-2 border-[#6C6FD8] pb-0.5' : 'text-[#16302F]'}>1. Select slot</span>
            <span className="text-[#55706E]">→</span>
            <span className={step === 2 ? 'text-[#6C6FD8] border-b-2 border-[#6C6FD8] pb-0.5' : 'text-[#55706E]'}>2. Patient details</span>
            <span className="text-[#55706E]">→</span>
            <span className="text-[#55706E]">3. Confirm</span>
          </div>
        )}

        {/* Title Area */}
        {step < 3 && (
          <div className="px-6 sm:px-8 pt-6 pb-2 bg-[#FFFFFF]">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
              {step === 1 ? 'Choose consultation slot' : 'Book your appointment'}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A6663] mt-1">
              {step === 1 
                ? 'Select an open time slot to reserve it temporarily.' 
                : 'Review the selected consultation and tell us who the appointment is for.'}
            </p>
          </div>
        )}

        {/* Hold Alert Banner (uses --accent-soft, switches to Change Required when under 1 min) */}
        {step === 2 && activeHoldSlot && (
          <div className={`px-6 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b transition-colors ${
            isHoldExpiring
              ? 'bg-[#FFEBD6] text-[#B45309] border-[#FEDBB7]'
              : 'bg-[#ECECFB] text-[#5B5FC7] border-[#D5D6F7]'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-white font-bold text-[11px] flex items-center gap-1 ${
                isHoldExpiring ? 'bg-[#B45309]' : 'bg-[#5B5FC7]'
              }`}>
                {isHoldExpiring ? 'Hold expiring' : 'Slot temporarily held'}
              </span>
              <CountdownTimer secondsRemaining={holdSecondsRemaining} />
              <span className="hidden md:inline text-[11px] opacity-80">
                · Complete confirmation before the hold expires.
              </span>
            </div>
            <button
              onClick={() => {
                releaseHoldSlot();
                setStep(1);
              }}
              className="text-xs font-bold text-[#1F7A78] hover:text-[#176361] hover:underline cursor-pointer self-start sm:self-auto"
            >
              Choose another slot
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 bg-[#FDECEA] border border-[#F9C9C5] text-[#B3261E] rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B3261E] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: SELECT SLOT IF NOT YET SELECTED ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold text-sm text-[#16302F]">{selectedDoctor.name}</h2>
                    <p className="text-xs text-[#55706E]">{selectedDept?.name} · Fee: ₹{selectedDoctor.fee}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#16302F]">Date:</label>
                    <input
                      type="date"
                      value={selectedDateKey}
                      onChange={(e) => setSelectedDateKey(e.target.value)}
                      className="px-3 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs font-semibold cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {doctorDateSlots.map((slot) => {
                    const isOpen = slot.status === 'open';
                    if (!isOpen) {
                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl bg-[#EEF2F2] border border-[#D5E5E3] text-center cursor-not-allowed select-none"
                        >
                          <div className="font-mono text-xs font-bold text-[#7A8F8D]">{formatIstTime(slot.startUtc)} IST</div>
                          <div className="text-[10px] text-[#7A8F8D] mt-1 font-medium">Unavailable</div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlotAndHold(slot)}
                        className="p-3 rounded-xl bg-[#FFFFFF] border-2 border-[#1F7A78] text-[#1F7A78] hover:bg-[#E1F2F0] text-center transition-all cursor-pointer flex flex-col items-center justify-center"
                      >
                        <div className="font-mono text-xs font-bold">{formatIstTime(slot.startUtc)} IST</div>
                        <div className="text-[10px] mt-1 font-semibold">Available</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: WIREFRAME 05 (APPOINTMENT BOOKING) ================= */}
          {step === 2 && activeSlot && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form & Booking Checks */}
              <div className="lg:col-span-7 space-y-5">
                {/* Card: Who is this appointment for? */}
                <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                  <div>
                    <h2 className="font-extrabold text-base text-[#16302F]">
                      Who is this appointment for?
                    </h2>
                    <p className="text-xs text-[#55706E] mt-0.5">
                      Only your own profile and linked dependents are available.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#16302F]">
                        Patient / dependent *
                      </label>
                      <span className="text-[11px] text-[#1F7A78] font-semibold">
                        + Add dependent
                      </span>
                    </div>
                    <select
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <option value="self">
                        {currentPatient?.name || currentUser?.name || 'Aarav Sharma'} (myself)
                      </option>
                      {dependents.map((dep) => (
                        <option key={dep.id} value={dep.id}>
                          {dep.name} ({dep.relationship})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-[#16302F] mb-1">Patient name *</label>
                      <input
                        type="text"
                        disabled
                        value={treatedPersonName}
                        className="w-full px-3 py-2 bg-[#EAF3F2] border border-[#D5E5E3] rounded-xl font-medium text-[#16302F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16302F] mb-1">Age / gender *</label>
                      <input
                        type="text"
                        disabled
                        value={`${treatedPersonAge} years / ${treatedPersonGender}`}
                        className="w-full px-3 py-2 bg-[#EAF3F2] border border-[#D5E5E3] rounded-xl font-medium text-[#16302F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-[#16302F] mb-1">Mobile number</label>
                      <input
                        type="text"
                        disabled
                        value={contactPhone}
                        className="w-full px-3 py-2 bg-[#EAF3F2] border border-[#D5E5E3] rounded-xl font-medium text-[#16302F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16302F] mb-1">Email</label>
                      <input
                        type="text"
                        disabled
                        value={contactEmail}
                        className="w-full px-3 py-2 bg-[#EAF3F2] border border-[#D5E5E3] rounded-xl font-medium text-[#16302F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#16302F] mb-1">
                      Reason for visit / symptoms *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="Briefly describe symptoms or purpose of consultation..."
                      className="w-full px-3 py-2 text-xs bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl resize-none focus-visible:ring-2 focus-visible:ring-[#6C6FD8]"
                    />
                    <span className="text-[11px] text-[#55706E] block mt-1">
                      Required. Briefly describe the reason for this appointment.
                    </span>
                  </div>
                </div>

                {/* Card: Booking checks */}
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3 text-xs">
                  <h2 className="font-extrabold text-sm text-[#16302F]">Booking checks</h2>
                  <ul className="space-y-1.5 text-[#4A6663] text-[11px] list-disc list-inside">
                    <li>Your slot is subject to a final availability check when you confirm.</li>
                    <li>Overlapping appointments are not permitted.</li>
                    <li>Only one active appointment per doctor, per day is allowed.</li>
                  </ul>
                  <label className="flex items-center gap-2 pt-2 border-t border-[#D5E5E3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewedChecks}
                      onChange={(e) => setReviewedChecks(e.target.checked)}
                      className="rounded border-[#D5E5E3] text-[#1F7A78]"
                    />
                    <span className="font-semibold text-[#16302F] text-xs">
                      I have reviewed the patient details and selected appointment.
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Consultation summary */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
                  <h2 className="font-extrabold text-base text-[#16302F] border-b border-[#D5E5E3] pb-3">
                    Consultation summary
                  </h2>

                  <div>
                    <div className="font-bold text-[#16302F] text-sm">{selectedDoctor.name}</div>
                    <div className="text-[#55706E]">{selectedDept?.name}</div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#D5E5E3]">
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Date</span>
                      <span className="font-bold text-[#16302F]">{formatIstDate(activeSlot.startUtc)}</span>
                    </div>
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Time · IST (UTC+05:30)</span>
                      <span className="font-mono font-bold text-[#16302F]">
                        {formatIstTime(activeSlot.startUtc)}–{formatIstTime(activeSlot.endUtc)} IST
                      </span>
                    </div>
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Person treated</span>
                      <span className="font-bold text-[#16302F]">
                        {treatedPersonName} · {isSelf ? 'Self' : 'Dependent'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Consultation fee</span>
                      <span className="font-bold text-[#16302F] text-base">₹{selectedDoctor.fee}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#EAF3F2] rounded-xl border border-[#D5E5E3] text-[11px] text-[#4A6663] space-y-1">
                    <span className="font-bold text-[#16302F] block">Payment is optional at launch</span>
                    <p className="text-[#55706E]">
                      No online payment is required to confirm. Payment collection policy is pending approval.
                    </p>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="w-full py-3 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] font-bold rounded-xl text-xs cursor-pointer shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-colors"
                  >
                    Confirm booking
                  </button>

                  <p className="text-[11px] text-[#55706E] text-center">
                    A confirmed reference is issued only after successful validation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: WIREFRAME 06 (APPOINTMENT CONFIRMATION) ================= */}
          {step === 3 && confirmedAppointment && (
            <div className="space-y-6">
              {/* Top Confirmation Banner (Wireframe 06) */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E1F2F0] text-[#1F7A78] flex items-center justify-center shrink-0 border border-[#C6E7E4]">
                  <CheckCircle2 className="w-7 h-7 text-[#1F7A78]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#16302F]">
                    Your appointment is confirmed
                  </h1>
                  <p className="text-xs text-[#55706E] mt-0.5">
                    Your consultation is booked. Save the reference below for your visit.
                  </p>
                </div>
              </div>

              {/* 2-Column Details Layout (Wireframe 06) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Details & Change Card */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-5 text-xs">
                    <div className="flex items-center justify-between border-b border-[#D5E5E3] pb-3">
                      <div>
                        <span className="text-[11px] text-[#55706E] block font-medium">Appointment reference</span>
                        <span className="font-mono text-base font-extrabold text-[#16302F]">
                          {confirmedAppointment.id}
                        </span>
                      </div>
                      <StatusBadge status="confirmed" label="Confirmed" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Person treated</span>
                        <span className="font-bold text-[#16302F]">
                          {confirmedAppointment.treatedPersonName} · {treatedPersonAge} years · {treatedPersonGender}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Doctor</span>
                        <span className="font-bold text-[#16302F]">{selectedDoctor.name}</span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Specialization</span>
                        <span className="font-semibold text-[#16302F]">Cardiology</span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Department</span>
                        <span className="font-semibold text-[#16302F]">{selectedDept?.name}</span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Date</span>
                        <span className="font-bold text-[#16302F]">
                          {formatIstDate(confirmedAppointment.startUtc)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Time · IST (UTC+05:30)</span>
                        <span className="font-mono font-bold text-[#16302F]">
                          {formatIstTime(confirmedAppointment.startUtc)}–{formatIstTime(confirmedAppointment.endUtc)} IST
                        </span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Consultation fee</span>
                        <span className="font-bold text-[#16302F]">₹{confirmedAppointment.fee}</span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Payment status</span>
                        <span className="font-semibold text-[#4A6663]">Not paid · Payment optional at launch</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#D5E5E3]">
                      <span className="text-[#55706E] block text-[11px]">Reason for visit</span>
                      <p className="text-[#16302F] italic mt-0.5">
                        "{confirmedAppointment.reasonForVisit}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D5E5E3] flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setShowPassModal(true)}
                        className="px-4 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#1F7A78]" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => setShowPassModal(true)}
                        className="px-4 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#1F7A78]" />
                        Print
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onViewAppointments();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] text-xs font-bold cursor-pointer transition-colors"
                      >
                        View my appointments
                      </button>
                    </div>
                  </div>

                  {/* Need to change your visit card (Wireframe 06) */}
                  <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3 text-xs">
                    <h2 className="font-extrabold text-sm text-[#16302F]">Need to change your visit?</h2>
                    <p className="text-[#55706E] text-[11px]">
                      Manage rescheduling or cancellation from your appointments. Eligibility is checked against the configured cutoff; a cancellation reason is required.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onViewAppointments();
                        }}
                        className="px-4 py-2 rounded-xl border border-[#D5E5E3] text-[#16302F] text-xs font-bold hover:bg-[#EAF3F2] cursor-pointer"
                      >
                        Reschedule appointment
                      </button>
                      {/* Destructive outline button per interaction state specs */}
                      <button
                        onClick={() => {
                          onClose();
                          onViewAppointments();
                        }}
                        className="px-4 py-2 rounded-xl border border-[#B4455A] text-[#B4455A] text-xs font-bold hover:bg-[#FBE9EC] cursor-pointer"
                      >
                        Cancel appointment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Notifications & Before Your Visit */}
                <div className="lg:col-span-5 space-y-4 text-xs">
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                    <div>
                      <h2 className="font-extrabold text-sm text-[#16302F]">Confirmation notifications</h2>
                      <p className="text-[#55706E] text-[11px] mt-0.5">
                        Booking is confirmed independently of message delivery.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#D5E5E3]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A6663] font-medium">SMS · {contactPhone.slice(0, 7)}****</span>
                        <StatusBadge status="pending" label="Delivery pending" size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A6663] font-medium">Email · {contactEmail.slice(0, 3)}***@...</span>
                        <StatusBadge status="pending" label="Delivery pending" size="sm" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#D5E5E3]">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsAppOptIn}
                          onChange={(e) => setWhatsAppOptIn(e.target.checked)}
                          className="mt-0.5 rounded border-[#D5E5E3] text-[#1F7A78]"
                        />
                        <span className="text-[#4A6663] text-[11px] leading-tight">
                          Send appointment updates via WhatsApp (optional consent).
                        </span>
                      </label>
                      <p className="text-[10px] text-[#55706E] mt-1 pl-5">
                        WhatsApp is not enabled until you opt in. Pending delivery does not cancel your appointment.
                      </p>
                    </div>
                  </div>

                  {/* Before your visit card */}
                  <div className="bg-[#EAF3F2] p-5 rounded-2xl border border-[#D5E5E3] text-[11px] text-[#4A6663] space-y-2">
                    <span className="font-bold text-[#16302F] text-xs block">Before your visit</span>
                    <ul className="list-disc list-inside space-y-1 text-[#55706E]">
                      <li>Arrive 15 minutes before your slot time in room {selectedDoctor.roomNumber}.</li>
                      <li>Carry your appointment pass / reference ID for desk verification.</li>
                      <li>Payment of ₹{confirmedAppointment.fee} can be completed offline at the reception desk.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Pass Modal */}
      {showPassModal && confirmedAppointment && (
        <PrintableAppointmentPass
          appointment={confirmedAppointment}
          doctor={selectedDoctor}
          onClose={() => setShowPassModal(false)}
        />
      )}
    </div>
  );
};
