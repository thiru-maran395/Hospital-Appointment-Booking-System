import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Search, 
  UserPlus, 
  RotateCcw, 
  XCircle, 
  Printer, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, Patient, Doctor } from '../../types';
import { formatIstDate, formatIstTime } from '../../utils/time';
import { StatusBadge } from '../../components/StatusBadge';
import { BookingWizardModal } from '../patient/BookingWizardModal';
import { PrintableAppointmentPass } from '../../components/PrintableAppointmentPass';

export const ReceptionistDashboard: React.FC = () => {
  const { 
    patients, 
    doctors, 
    appointments, 
    cancelAppointment, 
    rescheduleAppointment,
    slots
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState<Patient | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Cancellation modal
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Patient phoned in request to cancel');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reschedule modal
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newSlotId, setNewSlotId] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Pass view
  const [viewingPassApt, setViewingPassApt] = useState<Appointment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const doc = doctors.find((d) => d.id === a.doctorId);
      return (
        a.id.toLowerCase().includes(q) ||
        a.treatedPersonName.toLowerCase().includes(q) ||
        (doc?.name.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const handleBookOnBehalf = (patient: Patient) => {
    setSelectedPatientForBooking(patient);
    setBookingModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancellingAppointment) return;
    setCancelError(null);

    const res = cancelAppointment({
      appointmentId: cancellingAppointment.id,
      reason: cancelReason,
    });

    if (res.success) {
      setNotice(`Appointment ${cancellingAppointment.id} cancelled. Slot returned to availability.`);
      setCancellingAppointment(null);
      setTimeout(() => setNotice(null), 4000);
    } else {
      setCancelError(res.error || 'Cancellation failed.');
    }
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingAppointment || !newSlotId) return;
    setRescheduleError(null);

    const res = rescheduleAppointment({
      appointmentId: reschedulingAppointment.id,
      newSlotId,
    });

    if (res.success) {
      setNotice(`Appointment ${reschedulingAppointment.id} rescheduled atomically. Both slots updated.`);
      setReschedulingAppointment(null);
      setNewSlotId('');
      setTimeout(() => setNotice(null), 4000);
    } else {
      setRescheduleError(res.error || 'Rescheduling failed.');
    }
  };

  const passDoctor = viewingPassApt ? doctors.find((d) => d.id === viewingPassApt.doctorId) || null : null;
  const rescheduleDoctorSlots = reschedulingAppointment
    ? slots.filter((s) => s.doctorId === reschedulingAppointment.doctorId && s.status === 'open')
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Reception Desk Portal (RL-22: Limited Scope)
            </span>
            <span className="text-xs text-slate-500">• Front Desk Assisted Bookings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Outpatient Reception & Patient Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Book, cancel, and reschedule consultations on behalf of walk-in or telephone patients (FR-R01). System configuration and doctor settings are restricted (FR-R02).
          </p>
        </div>
      </div>

      {/* Quick Action: Book on behalf of patient */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-teal-600" />
          <span>Book Appointment on Behalf of Patient (FR-R01)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Select a registered patient to initiate assisted consultation booking with standard rule validations.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {patients.map((pat) => (
            <div
              key={pat.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-3 text-xs"
            >
              <div>
                <strong className="text-slate-900 block font-bold text-sm">{pat.name}</strong>
                <span className="text-slate-500 text-[11px] block">{pat.phone}</span>
                <span className="text-slate-500 text-[11px] block">{pat.email}</span>
              </div>
              <button
                onClick={() => handleBookOnBehalf(pat)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
              >
                Book for {pat.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reception Appointments Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-extrabold text-base text-slate-900">
            All Hospital Bookings Queue ({filteredAppointments.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, ID, doctor..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="block md:hidden space-y-3">
          {filteredAppointments.map((apt) => {
            const doc = doctors.find((d) => d.id === apt.doctorId);
            return (
              <div key={apt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{apt.id}</span>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm">{apt.treatedPersonName}</p>
                  <p className="text-slate-600">Specialist: {doc?.name}</p>
                  <p className="text-slate-500 font-medium">
                    {formatIstDate(apt.startUtc)} at {formatIstTime(apt.startUtc, true)}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                  {apt.status === 'booked' && (
                    <>
                      <button
                        onClick={() => {
                          setReschedulingAppointment(apt);
                          setRescheduleError(null);
                        }}
                        className="flex-1 py-1.5 px-3 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg text-xs font-bold border border-teal-200 text-center cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => {
                          setCancellingAppointment(apt);
                          setCancelError(null);
                        }}
                        className="flex-1 py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-rose-200 text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewingPassApt(apt)}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Print Pass
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="py-2.5 px-3">Ref ID</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Doctor</th>
                <th className="py-2.5 px-3">Schedule (IST)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAppointments.map((apt) => {
                const doc = doctors.find((d) => d.id === apt.doctorId);
                return (
                  <tr key={apt.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{apt.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{apt.treatedPersonName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{doc?.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {formatIstDate(apt.startUtc)} at {formatIstTime(apt.startUtc, true)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={apt.status} />
                      {apt.flaggedForReschedule && (
                        <span className="block text-[10px] text-rose-600 font-bold">Leave Flagged</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {apt.status === 'booked' && (
                        <>
                          <button
                            onClick={() => {
                              setReschedulingAppointment(apt);
                              setRescheduleError(null);
                            }}
                            className="px-2 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded text-[11px] font-bold border border-teal-200 cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setCancellingAppointment(apt);
                              setCancelError(null);
                            }}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold border border-rose-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setViewingPassApt(apt)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Print Pass
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {bookingModalOpen && (
        <BookingWizardModal
          onClose={() => setBookingModalOpen(false)}
          onViewAppointments={() => setBookingModalOpen(false)}
          onOpenAuth={() => {}}
        />
      )}

      {/* Cancel Modal */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-base text-slate-900">
              Cancel Appointment on Behalf of Patient
            </h3>
            {cancelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                {cancelError}
              </div>
            )}
            <textarea
              rows={2}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Mandatory cancellation reason..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setCancellingAppointment(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-base text-slate-900">
              Reschedule: {reschedulingAppointment.id}
            </h3>
            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                {rescheduleError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pick Open Slot *</label>
              <select
                value={newSlotId}
                onChange={(e) => setNewSlotId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs cursor-pointer"
              >
                <option value="">-- Choose Slot --</option>
                {rescheduleDoctorSlots.slice(0, 15).map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatIstDate(s.startUtc)} at {formatIstTime(s.startUtc, true)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setReschedulingAppointment(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!newSlotId}
                onClick={handleConfirmReschedule}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pass Modal */}
      {viewingPassApt && passDoctor && (
        <PrintableAppointmentPass
          appointment={viewingPassApt}
          doctor={passDoctor}
          onClose={() => setViewingPassApt(null)}
        />
      )}
    </div>
  );
};
