import React from 'react';
import { X, HelpCircle, Phone, Clock, Calendar, ShieldCheck, FileText, AlertCircle } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Beetloop Patient Help & Support</h3>
              <p className="text-xs text-slate-400">Hospital Appointment Booking System (HABS)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Key Guidelines */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Booking & Visit Policies
            </h4>
            
            <div className="grid gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Timezone & Consultation Slots
                </span>
                <p className="text-slate-600 leading-relaxed">
                  All consultations and available slots are scheduled and displayed in <strong>Indian Standard Time (IST, UTC+05:30)</strong>. Slots are generated in 30-minute standard blocks.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  Cancellation & Rescheduling Cutoff (RL-13)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Appointments can be rescheduled or cancelled online up to <strong>2 hours prior</strong> to the scheduled consultation time. Cancellations inside the 2-hour window require hospital reception or administrative override.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Zero Double-Booking Guarantee
                </span>
                <p className="text-slate-600 leading-relaxed">
                  When a slot is selected, a 7-minute hold is placed with an active countdown. Once confirmed, the slot is locked atomically to guarantee zero double bookings.
                </p>
              </div>
            </div>
          </div>

          {/* Urgent Medical Needs Notice */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Emergency Care Notice:
            </span>
            <p className="text-[11px] leading-relaxed">
              HABS is for scheduled outpatient appointments only. If you are experiencing chest pain, severe breathlessness, stroke symptoms, or acute trauma, please proceed directly to the Beetloop Emergency Room or call our 24/7 hotline.
            </p>
          </div>

          {/* Contact Numbers */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Beetloop Reception & OPD Desk</span>
              <span className="text-slate-500 text-[11px]">Mon – Sat: 08:00 AM – 08:00 PM IST</span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
              <Phone className="w-4 h-4 text-teal-600" />
              <span>+91 800 555 0199</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
