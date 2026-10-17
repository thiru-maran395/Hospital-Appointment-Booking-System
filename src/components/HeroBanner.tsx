import React from 'react';
import { Search, ShieldAlert, Sparkles, CheckCircle2, Award, Clock } from 'lucide-react';
import { Department } from '../types';
import { StatusBadge } from './common/StatusBadge';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (val: string) => void;
  departments: Department[];
  onOpenQuickBook: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  departments,
  onOpenQuickBook,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#E6F4F1] to-[#EDEBFB] text-[#16302F] pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#D5E5E3]">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F2F0] border border-[#C6E7E4] text-[#1F7A78] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#1F7A78]" />
              Real-Time Hospital Booking Engine
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#16302F]">
              Compassionate Care, <br className="hidden sm:inline" />
              <span className="text-[#1F7A78]">
                Guaranteed No Double Bookings
              </span>
            </h1>

            <p className="text-[#4A6663] text-sm sm:text-base max-w-2xl leading-relaxed">
              Find credentialed specialists, verify live consultation availability, and secure your hospital slot instantly. Automated reminders, printable e-Passes, and zero waiting room confusion.
            </p>

            {/* Value Props Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs font-medium text-[#16302F]">
              <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-xl p-2.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A78] shrink-0" />
                <span className="text-[11px] font-semibold">Zero Double Booking</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-xl p-2.5 shadow-2xs">
                <Clock className="w-4 h-4 text-[#1F7A78] shrink-0" />
                <span className="text-[11px] font-semibold">Instant Reschedule</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-xl p-2.5 shadow-2xs col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-[#1F7A78] shrink-0" />
                <span className="text-[11px] font-semibold">Verified Specialists</span>
              </div>
            </div>
          </div>

          {/* Quick Find & Filter Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 text-[#16302F] shadow-[0_4px_16px_rgba(31,122,120,0.08)] border border-[#D5E5E3]">
              <div className="flex items-center justify-between pb-3 border-b border-[#D5E5E3] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E1F2F0] text-[#1F7A78] border border-[#C6E7E4] flex items-center justify-center font-bold">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#16302F] text-sm">Quick Doctor Finder</h2>
                    <p className="text-xs text-[#55706E]">Filter by specialty, doctor or condition</p>
                  </div>
                </div>
                <StatusBadge status="active" label="Live Slots" size="sm" />
              </div>

              <div className="space-y-3.5">
                {/* Search Input */}
                <div>
                  <label className="block text-xs font-bold text-[#16302F] mb-1">
                    Search Doctor or Condition
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Dr. Jenkins, Cardiology, Chest pain..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[#F4F9F8] border border-[#D5E5E3] rounded-xl text-[#16302F] placeholder-[#55706E]/60 transition-all"
                    />
                    <Search className="w-4 h-4 text-[#55706E] absolute left-3 top-2.5" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2 text-xs text-[#55706E] hover:text-[#16302F] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#16302F] mb-1">
                    Medical Specialty / Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl transition-all cursor-pointer"
                  >
                    <option value="all">All Specialties ({departments.length})</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={onOpenQuickBook}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] font-bold text-xs shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Instant Booking Wizard</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Emergency reminder notice */}
              <div className="mt-4 pt-3 border-t border-[#D5E5E3] flex items-start gap-2 text-xs text-[#B45309] bg-[#FFEBD6] p-2.5 rounded-xl border border-[#FEDBB7]">
                <ShieldAlert className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  <strong>Need emergency care?</strong> If you are experiencing sudden severe symptoms, visit our ER directly or call 24/7 hotline +91 800 555 0199 or emergency 108/112.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
