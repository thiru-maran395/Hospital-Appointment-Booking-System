import React from 'react';
import { 
  HeartPulse, 
  Brain, 
  Bone, 
  Baby, 
  Sparkles, 
  Stethoscope, 
  Eye, 
  Ear,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DepartmentsViewProps {
  onSelectDepartment: (deptId: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ onSelectDepartment }) => {
  const { departments, doctors, specializations } = useApp();

  const getIcon = (code: string) => {
    switch (code) {
      case 'CARD': return <HeartPulse className="w-7 h-7 text-rose-500" />;
      case 'NEUR': return <Brain className="w-7 h-7 text-indigo-500" />;
      case 'ORTH': return <Bone className="w-7 h-7 text-amber-500" />;
      case 'PED': return <Baby className="w-7 h-7 text-sky-500" />;
      case 'DERM': return <Sparkles className="w-7 h-7 text-teal-500" />;
      case 'GMED': return <Stethoscope className="w-7 h-7 text-blue-500" />;
      case 'OPHT': return <Eye className="w-7 h-7 text-emerald-500" />;
      default: return <Stethoscope className="w-7 h-7 text-sky-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider px-3 py-1 bg-sky-50 rounded-full border border-sky-100">
          Centers of Clinical Excellence
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hospital Medical Specialties & Departments
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          From advanced interventional cardiology to pediatric medicine, our multidisciplinary clinics offer care with strict zero double-booking concurrency.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept) => {
          const docCount = doctors.filter((d) => d.departmentId === dept.id).length;
          const deptSpecs = specializations.filter((s) => s.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept.id)}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-50 transition-all">
                  {getIcon(dept.code)}
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                    {dept.name}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    {docCount} Registered Specialist{docCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {dept.description}
                </p>

                {deptSpecs.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Sub-Specializations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {deptSpecs.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                <span>View Specialists & Book</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
