import React from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Clock, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';

interface PreVisitGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreVisitGuideModal: React.FC<PreVisitGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-sky-800 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Patient Pre-Visit Guide</h2>
              <p className="text-xs text-slate-300">Essential instructions for a seamless clinic consultation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          {/* Checklist 1: What to Bring */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              What to Bring on Consultation Day
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs">
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Government-issued Photo ID (Passport, Driver's License)</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Health Insurance Card & co-pay authorization</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>List of current medications & dietary supplements</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Previous diagnostic lab reports, X-rays, or MRI discs</span>
              </li>
            </ul>
          </div>

          {/* Checklist 2: Arrival & Check-In */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Arrival Time & Self-Service Kiosks
            </h3>
            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <p>
                <strong>Arrive 15 Minutes Early:</strong> Please arrive 15 minutes before your booked time slot to complete initial vitals (blood pressure, temperature, weight) with our nursing staff.
              </p>
              <p>
                <strong>Self-Service Kiosk:</strong> Present the QR code on your Digital Appointment Pass at the Reception Desk or kiosk in your assigned hospital wing to automatically check in.
              </p>
            </div>
          </div>

          {/* Checklist 3: Parking & Directions */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Hospital Parking & Accessibility
            </h3>
            <p className="text-xs text-slate-600">
              Complimentary parking is available in <strong>Parking Garage C (Level 2)</strong>. Wheelchair assistance and electric golf-cart shuttles from the garage to the West Pavilion and North Tower are stationed at Entrance 2.
            </p>
          </div>

          {/* Checklist 4: Rescheduling Policy */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Cancellation & Reschedule Policy
            </div>
            <p className="text-slate-600">
              To respect our doctors' schedules and fellow patients awaiting slots, please notify or reschedule at least <strong>2 hours prior</strong> to your visit via the "My Bookings" tab. Cancelled slots are immediately reopened.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
