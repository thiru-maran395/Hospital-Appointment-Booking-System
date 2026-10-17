import React, { useState } from 'react';
import { Doctor } from '../types';
import { DoctorCard } from './DoctorCard';
import { useApp } from '../context/AppContext';
import { getRelativeDateString } from '../data/mockData';

interface DoctorListProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (val: string) => void;
  onBookDoctor: (doctor: Doctor) => void;
  onViewDoctorDetails: (doctor: Doctor) => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  onBookDoctor,
  onViewDoctorDetails,
}) => {
  const { doctors, departments, specializations, slots } = useApp();

  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [feeRange, setFeeRange] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(getRelativeDateString(1));
  const [sortBy, setSortBy] = useState<'next-available' | 'fee-low' | 'fee-high' | 'experience'>('next-available');

  const allLanguages = Array.from(new Set(doctors.flatMap((d) => d.languages)));

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    if (!doc.active) return false;

    // Search query by doctor name or keywords
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchText = doc.profileText.toLowerCase().includes(q);
      if (!matchName && !matchText) return false;
    }

    // Specialization filter
    if (selectedSpecialization !== 'all' && doc.specializationId !== selectedSpecialization) {
      return false;
    }

    // Department filter
    if (selectedDepartment !== 'all' && doc.departmentId !== selectedDepartment) {
      return false;
    }

    // Gender filter
    if (selectedGender !== 'all' && doc.gender !== selectedGender) {
      return false;
    }

    // Language filter
    if (selectedLanguage !== 'all' && !doc.languages.includes(selectedLanguage)) {
      return false;
    }

    // Fee range filter
    if (feeRange === '500-750' && (doc.fee < 500 || doc.fee > 750)) return false;
    if (feeRange === '751-1000' && (doc.fee < 751 || doc.fee > 1000)) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'fee-low') return a.fee - b.fee;
    if (sortBy === 'fee-high') return b.fee - a.fee;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    return 0;
  });

  const doctorsWithSlotsCount = filteredDoctors.filter((doc) =>
    slots.some((s) => s.doctorId === doc.id && s.status === 'open')
  ).length;

  const handleResetFilters = () => {
    setSelectedDepartment('all');
    setSelectedSpecialization('all');
    setSelectedGender('all');
    setSelectedLanguage('all');
    setFeeRange('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Microcopy */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
          Find a doctor
        </h1>
        <p className="text-xs sm:text-sm text-[#4A6663] mt-1">
          Search active specialists and choose a consultation time that works for you.
        </p>
      </div>

      {/* Top Search Bar (Wireframe 03) */}
      <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-[#16302F] mb-1">
              Specialization
            </label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs font-medium cursor-pointer"
            >
              <option value="all">All specializations</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-[#16302F] mb-1">
              Doctor name
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Any doctor"
              className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs font-medium placeholder-[#55706E]/60"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              className="w-full py-2 px-4 rounded-xl bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] text-xs font-bold shadow-[0_4px_16px_rgba(31,122,120,0.18)] cursor-pointer transition-colors"
            >
              Search doctors
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Wireframe 03 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Refine results */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D5E5E3] pb-3">
            <h2 className="font-extrabold text-sm text-[#16302F]">Refine results</h2>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#1F7A78] hover:text-[#176361] hover:underline font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16302F] mb-1">
              Consultation fee
            </label>
            <select
              value={feeRange}
              onChange={(e) => setFeeRange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs cursor-pointer"
            >
              <option value="all">All fees (₹500 – ₹1,000)</option>
              <option value="500-750">₹500 – ₹750</option>
              <option value="751-1000">₹751 – ₹1,000</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16302F] mb-1">
              Availability date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16302F] mb-1">
              Doctor gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs cursor-pointer"
            >
              <option value="all">Any gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16302F] mb-1">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs cursor-pointer"
            >
              <option value="all">All languages</option>
              {allLanguages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="w-full py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] text-[#16302F] text-xs font-bold cursor-pointer transition-colors"
          >
            Apply filters
          </button>

          <p className="text-[11px] text-[#55706E] leading-normal pt-2 border-t border-[#D5E5E3]">
            All availability is shown in IST (UTC+05:30). Unavailable doctors remain visible for reference.
          </p>
        </aside>

        {/* Right Content: Doctor Cards Stack */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-[#16302F] text-sm">
              {filteredDoctors.length} doctors · {doctorsWithSlotsCount} with open slots
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[#55706E] font-medium">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D5E5E3] text-[#16302F] rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="next-available">Next available</option>
                <option value="fee-low">Fee: Low to High</option>
                <option value="fee-high">Fee: High to Low</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="bg-[#FFFFFF] p-12 text-center rounded-2xl border border-dashed border-[#D5E5E3] space-y-3">
              <div className="text-sm font-bold text-[#16302F]">No doctors matched your criteria</div>
              <p className="text-xs text-[#55706E]">Try adjusting the department, fee, or language filter.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#1F7A78] hover:bg-[#176361] text-[#FFFFFF] rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onBook={onBookDoctor}
                  onViewDetails={onViewDoctorDetails}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
