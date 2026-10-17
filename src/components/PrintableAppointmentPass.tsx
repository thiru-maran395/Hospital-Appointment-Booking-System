import React from 'react';
import { X, Printer, Download, QrCode, Building2, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { Appointment, Doctor } from '../types';
import { formatIstDate, formatIstTime } from '../utils/time';
import { StatusBadge } from './StatusBadge';

interface PrintableAppointmentPassProps {
  appointment: Appointment | null;
  doctor: Doctor | null;
  onClose: () => void;
}

export const PrintableAppointmentPass: React.FC<PrintableAppointmentPassProps> = ({
  appointment,
  doctor,
  onClose,
}) => {
  if (!appointment || !doctor) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Actions Bar (hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span className="font-extrabold text-sm text-white">Digital Appointment Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable E-Pass Content */}
        <div className="p-6 sm:p-8 space-y-6 bg-white" id="printable-habs-pass">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black">
                  +
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">METROHEALTH</h1>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Hospital Appointment Booking System (HABS)
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Appointment Reference ID
              </span>
              <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {appointment.id}
              </span>
            </div>
          </div>

          {/* QR Code and Patient Overview */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <QrCode className="w-24 h-24 text-slate-900" />
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase font-bold">
                Scan at Kiosk
              </span>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Patient Details</span>
                <h3 className="text-lg font-extrabold text-slate-900">{appointment.treatedPersonName}</h3>
                <p className="text-xs text-slate-600">
                  {appointment.treatedPersonType === 'dependent' ? 'Dependent Consultation' : 'Registered Patient'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <StatusBadge status={appointment.status} />
                <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                  Fee: ₹{appointment.fee}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {appointment.paymentStatus === 'paid_offline' ? 'Paid Offline' : 'Pay at Desk B'}
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Schedule & Doctor Details in IST */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-sky-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Consultation Schedule (IST)
              </span>
              <p className="text-sm font-black text-slate-900">{formatIstDate(appointment.startUtc)}</p>
              <p className="text-xs font-bold text-sky-700">{formatIstTime(appointment.startUtc, true)}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Consulting Specialist
              </span>
              <p className="text-sm font-bold text-slate-900">{doctor.name}</p>
              <p className="text-xs text-slate-600">Room: <strong className="text-slate-900">{doctor.roomNumber}</strong></p>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Recorded Reason for Visit / Symptoms:</span>
            <p className="text-slate-800 italic font-medium">"{appointment.reasonForVisit}"</p>
          </div>

          {/* Pre-visit guidelines notice */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Patient Instructions:
            </p>
            <p>1. Please arrive 15 minutes before your time slot to record nursing vitals.</p>
            <p>2. Bring government photo identification and any relevant previous medical records or prescriptions.</p>
            <p>3. To reschedule or cancel, use HABS online portal at least 2 hours prior to slot time (RL-13).</p>
          </div>
        </div>

        {/* Footer (hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">Press Print or Save PDF to retain pass</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
