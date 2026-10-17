import React from 'react';
import { Doctor } from '../types';
import { useApp } from '../context/AppContext';
import { formatIstDate, formatIstTime } from '../utils/time';
import { Avatar } from './common/Avatar';
import { StatusBadge } from './common/StatusBadge';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  onViewDetails: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBook,
  onViewDetails,
}) => {
  const { slots, departments, specializations } = useApp();

  const dept = departments.find((d) => d.id === doctor.departmentId);
  const spec = specializations.find((s) => s.id === doctor.specializationId);

  // Find next open slot
  const doctorOpenSlots = slots
    .filter((s) => s.doctorId === doctor.id && s.status === 'open')
    .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());

  const nextSlot = doctorOpenSlots[0];
  const isAvailable = doctorOpenSlots.length > 0;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#D5E5E3] p-5 sm:p-6 shadow-[0_4px_16px_rgba(31,122,120,0.06)] hover:shadow-[0_4px_16px_rgba(31,122,120,0.12)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Left: Avatar + Details */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="shrink-0">
          <Avatar
            name={doctor.name}
            size="xl"
            className="w-16 h-16 rounded-2xl bg-[#E1F2F0] text-[#1F7A78] text-lg font-bold border border-[#C6E7E4] flex items-center justify-center shadow-xs"
          />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 
              onClick={() => onViewDetails(doctor)}
              className="font-bold text-base sm:text-lg text-[#16302F] hover:text-[#1F7A78] cursor-pointer transition-colors"
            >
              {doctor.name}
            </h3>
            <StatusBadge status="active" label="Active doctor" size="sm" />
          </div>

          <p className="text-xs sm:text-sm text-[#4A6663] font-medium">
            {spec?.name || 'Cardiologist'} · {dept?.name || 'Department of Cardiology'}
          </p>

          <p className="text-xs text-[#55706E]">
            {doctor.gender === 'female' ? 'Female' : 'Male'} · {doctor.languages.join(', ')}
          </p>

          <div className="pt-1 text-xs">
            {nextSlot ? (
              <span className="text-[#4A6663] font-medium">
                Next available: <strong className="text-[#1F7A78] font-bold">{formatIstDate(nextSlot.startUtc)} · {formatIstTime(nextSlot.startUtc, true)}</strong>
              </span>
            ) : (
              <span className="text-[#55706E] italic">
                No open slots in the selected period
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Fee + Action Buttons */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#D5E5E3]">
        <div className="text-left md:text-right">
          <div className="text-xl sm:text-2xl font-bold text-[#16302F]">
            ₹{doctor.fee}
          </div>
          <span className="text-[11px] text-[#55706E] block -mt-0.5">
            per consultation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(doctor)}
            className="px-4 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] text-xs font-semibold cursor-pointer transition-colors"
          >
            Profile
          </button>
          
          {isAvailable ? (
            <button
              onClick={() => onBook(doctor)}
              className="px-5 py-2 rounded-xl bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] text-xs font-bold shadow-[0_4px_16px_rgba(31,122,120,0.18)] cursor-pointer transition-colors"
            >
              Book appointment
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2 rounded-xl bg-[#E3ECEB] text-[#8A9C9A] border border-[#D5E5E3] text-xs font-bold cursor-not-allowed"
            >
              No slots
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
