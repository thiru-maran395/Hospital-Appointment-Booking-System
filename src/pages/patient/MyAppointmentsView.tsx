import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Printer, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight,
  User,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatIstDate, formatIstTime, isActionAllowedByCutoff } from '../../utils/time';
import { Appointment } from '../../types';
import { PrintableAppointmentPass } from '../../components/PrintableAppointmentPass';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';

interface MyAppointmentsViewProps {
  onScheduleNew: () => void;
  onOpenDoctorDetails?: (doctorId: string) => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  onScheduleNew,
  onOpenDoctorDetails,
}) => {
  const {
    currentUser,
    currentPatient,
    appointments,
    doctors,
    slots,
    cancelAppointment,
    rescheduleAppointment,
    bookingConfig,
    simulateRescheduleFailure,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'family' | 'profile'>('upcoming');
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Personal scheduling conflict');
  const [cancellationDetails, setCancellationDetails] = useState<string>('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newSelectedSlotId, setNewSelectedSlotId] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const [viewingPassAppointment, setViewingPassAppointment] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Patient appointments
  const userAppointments = appointments.filter((a) => {
    if (currentUser?.role === 'patient') {
      return a.patientId === currentPatient?.id;
    }
    return true;
  });

  const nowMs = Date.now();
  const upcomingApts = userAppointments.filter(
    (a) => a.status === 'booked' && new Date(a.startUtc).getTime() > nowMs
  );
  const pastApts = userAppointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no-show' || new Date(a.startUtc).getTime() <= nowMs
  );

  // Spotlight upcoming appointment
  const spotlightApt = upcomingApts[0] || null;
  const otherUpcomingApts = upcomingApts.slice(1);

  // Check if any booking is flagged for doctor leave
  const flaggedLeaveApt = userAppointments.find((a) => a.flaggedForReschedule && a.status === 'booked');

  const handleConfirmCancel = () => {
    if (!cancellingAppointment) return;
    setCancelError(null);

    const result = cancelAppointment({
      appointmentId: cancellingAppointment.id,
      reason: cancellationReason + (cancellationDetails ? `: ${cancellationDetails}` : ''),
      isAdminOverride: currentUser?.role === 'admin',
    });

    if (result.success) {
      setToastMessage(`Appointment ${cancellingAppointment.id} successfully cancelled.`);
      setCancellingAppointment(null);
      setCancellationDetails('');
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setCancelError(result.error || 'Cancellation failed.');
    }
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingAppointment || !newSelectedSlotId) return;
    setRescheduleError(null);

    const result = rescheduleAppointment({
      appointmentId: reschedulingAppointment.id,
      newSlotId: newSelectedSlotId,
      isAdminOverride: currentUser?.role === 'admin',
      simulateFailure: simulateRescheduleFailure,
    });

    if (result.success) {
      setToastMessage(`Appointment ${reschedulingAppointment.id} successfully rescheduled.`);
      setReschedulingAppointment(null);
      setNewSelectedSlotId('');
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setRescheduleError(result.error || 'Rescheduling failed.');
    }
  };

  const passDoctor = viewingPassAppointment
    ? doctors.find((d) => d.id === viewingPassAppointment.doctorId) || null
    : null;

  const rescheduleDoctorSlots = reschedulingAppointment
    ? slots.filter((s) => s.doctorId === reschedulingAppointment.doctorId && s.status === 'open')
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#16302F] text-[#FFFFFF] px-4 py-3 rounded-2xl shadow-[0_10px_25px_-5px_rgba(31,122,120,0.25)] flex items-center gap-3 border border-[#D5E5E3]/40 animate-in fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-[#E1F2F0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Subtitle & Title Row (Wireframe 07) */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#55706E]">
          PATIENT WORKSPACE · All times IST (UTC+05:30)
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
              Hello, {currentPatient?.name?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'Aarav'}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A6663] mt-0.5">
              Manage appointments for yourself and your linked family members.
            </p>
          </div>

          <button
            onClick={onScheduleNew}
            className="px-5 py-2.5 rounded-xl bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] text-xs font-bold shadow-[0_4px_16px_rgba(31,122,120,0.18)] flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto"
          >
            + Book appointment
          </button>
        </div>
      </div>

      {/* Tab Bar (Wireframe 07) */}
      <div className="flex items-center gap-2 border-b border-[#D5E5E3] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'upcoming' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          Upcoming ({upcomingApts.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'past' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          Past ({pastApts.length})
        </button>
        <button
          onClick={() => setActiveTab('family')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'family' 
              ? 'bg-[#1F7A78] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]' 
              : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
          }`}
        >
          Family & dependents
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

      {/* Doctor Leave Alert Banner (Change required colours: #B45309 text, #FFEBD6 bg) */}
      {flaggedLeaveApt && (
        <div className="p-4 bg-[#FFEBD6] rounded-2xl border border-[#FEDBB7] text-xs text-[#B45309] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-[#B45309] block">
              Doctor leave · Action needed
            </span>
            <p className="leading-relaxed">
              Dr. Rohan Iyer is on leave on 22 Oct 2026. Your appointment ({flaggedLeaveApt.id}) is flagged for rescheduling or admin reassignment, not deleted. Contact support to arrange an alternative.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout (Wireframe 07) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Appointments */}
        <div className="lg:col-span-8 space-y-5">
          {activeTab === 'upcoming' && (
            <>
              {/* Spotlight Upcoming Appointment Card (Wireframe 07) */}
              {spotlightApt ? (
                <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#D5E5E3] pb-3">
                    <span className="font-extrabold text-sm text-[#16302F]">Upcoming appointment</span>
                    <StatusBadge status="confirmed" label="Confirmed" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#16302F]">
                      {doctors.find((d) => d.id === spotlightApt.doctorId)?.name} · Cardiologist
                    </h3>
                    <p className="text-xs text-[#55706E]">
                      {spotlightApt.id} · Department of Cardiology
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-[#D5E5E3]">
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Person treated</span>
                      <span className="font-bold text-[#16302F]">{spotlightApt.treatedPersonName} · Self</span>
                    </div>
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Date & time</span>
                      <span className="font-bold text-[#16302F]">
                        {formatIstDate(spotlightApt.startUtc)} · {formatIstTime(spotlightApt.startUtc, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#55706E] block text-[11px]">Fee / payment</span>
                      <span className="font-bold text-[#16302F]">₹{spotlightApt.fee} · Not paid</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#4A6663] bg-[#EAF3F2] p-3 rounded-xl border border-[#D5E5E3]">
                    <span className="font-bold text-[#16302F]">Reason: </span>
                    {spotlightApt.reasonForVisit}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingPassAppointment(spotlightApt)}
                        className="px-3.5 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] text-xs font-bold cursor-pointer transition-colors"
                      >
                        View confirmation
                      </button>
                      <button
                        onClick={() => {
                          setReschedulingAppointment(spotlightApt);
                          setRescheduleError(null);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] text-xs font-bold cursor-pointer transition-colors"
                      >
                        Reschedule
                      </button>
                      {/* Destructive outline button on card */}
                      <button
                        onClick={() => {
                          setCancellingAppointment(spotlightApt);
                          setCancelError(null);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-[#B4455A] text-[#B4455A] hover:bg-[#FBE9EC] text-xs font-bold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    <span className="text-[11px] text-[#55706E]">
                      Change actions currently permitted under the 2-hour cutoff.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-dashed border-[#D5E5E3] text-center text-xs text-[#55706E]">
                  No upcoming appointments scheduled.
                </div>
              )}

              {/* Other upcoming appointments (Wireframe 07) */}
              {otherUpcomingApts.length > 0 && (
                <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                  <h3 className="font-extrabold text-sm text-[#16302F] border-b border-[#D5E5E3] pb-3">
                    Other upcoming appointments
                  </h3>

                  <div className="divide-y divide-[#D5E5E3] space-y-3">
                    {otherUpcomingApts.map((apt) => {
                      const doc = doctors.find((d) => d.id === apt.doctorId);
                      return (
                        <div key={apt.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#16302F]">{doc?.name} · Cardiology</span>
                              <StatusBadge status={apt.status} />
                              {apt.flaggedForReschedule && (
                                <StatusBadge status="flagged" label="Change required" size="sm" />
                              )}
                            </div>
                            <p className="text-[#55706E] text-[11px] mt-0.5">
                              {apt.id} · {apt.treatedPersonName} · {formatIstDate(apt.startUtc)} · {formatIstTime(apt.startUtc, true)} · ₹{apt.fee} · Not paid
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {apt.flaggedForReschedule ? (
                              <button
                                onClick={() => {
                                  setReschedulingAppointment(apt);
                                  setRescheduleError(null);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-[#D5E5E3] text-[#16302F] font-bold text-xs hover:bg-[#EAF3F2] cursor-pointer"
                              >
                                Get reschedule support
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setReschedulingAppointment(apt)}
                                  className="px-3 py-1.5 rounded-lg border border-[#D5E5E3] text-[#16302F] font-bold text-xs hover:bg-[#EAF3F2] cursor-pointer"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => setCancellingAppointment(apt)}
                                  className="px-3 py-1.5 rounded-lg border border-[#B4455A] text-[#B4455A] font-bold text-xs hover:bg-[#FBE9EC] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past appointments · Preview table (Wireframe 07) */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3">
                <div className="border-b border-[#D5E5E3] pb-3">
                  <h3 className="font-extrabold text-sm text-[#16302F]">
                    Past appointments · Preview
                  </h3>
                  <p className="text-[11px] text-[#55706E] mt-0.5">
                    Select the Past tab to view full history. Labels reflect recorded outcomes.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D5E5E3] text-[#55706E] text-[11px] uppercase font-bold bg-[#EAF3F2]">
                        <th className="py-2.5 px-3">Visit / reference</th>
                        <th className="py-2.5 px-3">Doctor / department</th>
                        <th className="py-2.5 px-3">Patient</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5E5E3]">
                      {pastApts.slice(0, 4).map((apt) => {
                        const doc = doctors.find((d) => d.id === apt.doctorId);
                        return (
                          <tr key={apt.id} className="hover:bg-[#E1F2F0]/40 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-[#16302F] block">{formatIstDate(apt.startUtc)} · {formatIstTime(apt.startUtc)}</span>
                              <span className="font-mono text-[10px] text-[#55706E]">{apt.id}</span>
                            </td>
                            <td className="py-2.5 px-3 text-[#16302F] font-medium">
                              {doc?.name} Cardiology
                            </td>
                            <td className="py-2.5 px-3 text-[#4A6663]">
                              {apt.treatedPersonName} · Self
                            </td>
                            <td className="py-2.5 px-3">
                              <StatusBadge status={apt.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'past' && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
              <h3 className="font-extrabold text-base text-[#16302F] border-b border-[#D5E5E3] pb-3">
                Full Consultation History ({pastApts.length})
              </h3>
              <div className="space-y-3">
                {pastApts.map((apt) => (
                  <div key={apt.id} className="p-4 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#16302F]">{formatIstDate(apt.startUtc)} at {formatIstTime(apt.startUtc, true)}</span>
                      <span className="text-[#55706E] block">{doctors.find(d => d.id === apt.doctorId)?.name} · Ref: {apt.id}</span>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-[#16302F]">Linked Family Members & Dependents</h3>
              <p className="text-[#55706E]">Book consultations on behalf of immediate family members (RL-08, RL-09).</p>
              <div className="p-4 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] space-y-1">
                <span className="font-bold text-[#16302F] block">Ishaan Sharma (Child, 12 years)</span>
                <span className="text-[#55706E]">Relationship: Dependent Child</span>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-[#16302F]">Patient Account Profile</h3>
              <div className="space-y-2">
                <div><span className="text-[#55706E]">Name:</span> <strong className="text-[#16302F]">{currentPatient?.name || 'Aarav Sharma'}</strong></div>
                <div><span className="text-[#55706E]">Email:</span> <strong className="text-[#16302F]">{currentPatient?.email || 'aarav.sharma@example.com'}</strong></div>
                <div><span className="text-[#55706E]">Phone:</span> <strong className="text-[#16302F]">{currentPatient?.phone || '+91 98765 43210'}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar (Reminders, Family, Cancel card) */}
        <div className="lg:col-span-4 space-y-4 text-xs">
          {/* Card: Reminders & updates (Wireframe 07) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3">
            <h3 className="font-extrabold text-sm text-[#16302F]">Reminders & updates</h3>
            <div className="space-y-2 text-[11px] text-[#4A6663]">
              <p>• Next visit: 19 Oct · 10:00 IST.</p>
              <p>• For your 20 Oct · 10:30 IST visit: SMS/email reminder scheduled; confirmation delivery pending.</p>
              {flaggedLeaveApt && (
                <p className="text-[#B45309] font-semibold">• Doctor leave update: action required for 22 Oct.</p>
              )}
            </div>
            <button className="text-[#1F7A78] hover:text-[#176361] font-bold hover:underline cursor-pointer block pt-1">
              Notification preferences
            </button>
          </div>

          {/* Card: Family & profile (Wireframe 07) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3">
            <h3 className="font-extrabold text-sm text-[#16302F]">Family & profile</h3>
            <div className="space-y-1 text-[#16302F]">
              <p className="font-bold">{currentPatient?.name || 'Aarav Sharma'} · Account holder</p>
              <p className="text-[#55706E] text-[11px]">Ishaan Sharma · Linked dependent</p>
            </div>
            <div className="pt-2 border-t border-[#D5E5E3] space-y-1 text-[#1F7A78] font-semibold">
              <button onClick={() => setActiveTab('family')} className="block hover:underline cursor-pointer">
                Manage family / add dependent
              </button>
              <button onClick={() => setActiveTab('profile')} className="block hover:underline cursor-pointer">
                Edit my profile
              </button>
            </div>
            <p className="text-[10px] text-[#55706E] pt-1">
              Only your own and linked dependents' data is visible.
            </p>
          </div>

          {/* Card: Cancel appointment · Inline state (Wireframe 07) */}
          {cancellingAppointment && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#1F7A78] shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#16302F]">Cancel appointment</h3>
                <button
                  onClick={() => setCancellingAppointment(null)}
                  className="text-[#55706E] hover:text-[#16302F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#55706E]">
                Cancelling: <strong className="text-[#16302F]">{cancellingAppointment.id}</strong>
              </p>

              {cancelError && (
                <div className="p-2 bg-[#FDECEA] border border-[#F9C9C5] text-[#B3261E] rounded text-[11px]">
                  {cancelError}
                </div>
              )}

              <div>
                <label className="block text-[#16302F] font-bold text-[11px] mb-1">
                  Cancellation reason *
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-lg text-xs cursor-pointer"
                >
                  <option value="Personal scheduling conflict">Personal scheduling conflict</option>
                  <option value="Condition improved / No longer needed">Condition improved / No longer needed</option>
                  <option value="Seeking alternate specialist">Seeking alternate specialist</option>
                  <option value="Travel / Transportation issue">Travel / Transportation issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[#16302F] font-bold text-[11px] mb-1">
                  Additional details
                </label>
                <input
                  type="text"
                  value={cancellationDetails}
                  onChange={(e) => setCancellationDetails(e.target.value)}
                  placeholder="Optional explanation"
                  className="w-full px-2.5 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-lg text-xs"
                />
              </div>

              {/* Destructive filled button inside confirmation modal */}
              <button
                onClick={handleConfirmCancel}
                className="w-full py-2 bg-[#B4455A] hover:bg-[#9E364A] text-[#FFFFFF] font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
              >
                Confirm cancellation
              </button>

              <p className="text-[10px] text-[#55706E] text-center">
                A reason is required. Appointment remains confirmed until submitted.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#16302F]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5E5E3]">
              <h3 className="font-extrabold text-base text-[#16302F]">
                Reschedule {reschedulingAppointment.id}
              </h3>
              <button
                onClick={() => setReschedulingAppointment(null)}
                className="text-[#55706E] hover:text-[#16302F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[#4A6663]">
              Select an alternative open slot with <strong>{doctors.find(d => d.id === reschedulingAppointment.doctorId)?.name}</strong>. The old slot is released only after the new slot is confirmed.
            </p>

            {rescheduleError && (
              <div className="p-2.5 bg-[#FDECEA] border border-[#F9C9C5] text-[#B3261E] rounded-xl text-xs">
                {rescheduleError}
              </div>
            )}

            <div>
              <label className="block font-bold text-[#16302F] mb-1">Available Slots (IST) *</label>
              {rescheduleDoctorSlots.length === 0 ? (
                <div className="p-4 bg-[#F4F9F8] rounded-xl text-center text-[#55706E] border border-[#D5E5E3]">
                  No open slots found for this doctor.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {rescheduleDoctorSlots.map((slot) => {
                    const isSelected = newSelectedSlotId === slot.id;
                    return (
                      <label
                        key={slot.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1F7A78] text-[#FFFFFF] border-[#1F7A78] shadow-xs'
                            : 'bg-[#FFFFFF] hover:bg-[#E1F2F0] border-[#D5E5E3] text-[#16302F]'
                        }`}
                      >
                        <span className="font-bold">
                          {formatIstDate(slot.startUtc)} · {formatIstTime(slot.startUtc, true)}
                        </span>
                        <input
                          type="radio"
                          name="rescheduleSlot"
                          checked={isSelected}
                          onChange={() => setNewSelectedSlotId(slot.id)}
                          className="accent-[#1F7A78]"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5E5E3]">
              <button
                onClick={() => setReschedulingAppointment(null)}
                className="px-4 py-2 rounded-xl border border-[#D5E5E3] text-[#16302F] font-bold hover:bg-[#EAF3F2] cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={!newSelectedSlotId}
                onClick={handleConfirmReschedule}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  newSelectedSlotId
                    ? 'bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#E3ECEB] text-[#8A9C9A] border border-[#D5E5E3] cursor-not-allowed'
                }`}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Pass Modal */}
      {viewingPassAppointment && passDoctor && (
        <PrintableAppointmentPass
          appointment={viewingPassAppointment}
          doctor={passDoctor}
          onClose={() => setViewingPassAppointment(null)}
        />
      )}
    </div>
  );
};
