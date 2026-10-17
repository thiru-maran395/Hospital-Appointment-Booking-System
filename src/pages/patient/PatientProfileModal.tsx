import React, { useState } from 'react';
import { X, User, Plus, Trash2, CheckCircle2, AlertCircle, HeartHandshake, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Dependent } from '../../types';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentPatient, dependents, addDependent, updatePatientProfile } = useApp();

  // Profile Form state
  const [name, setName] = useState(currentPatient?.name || '');
  const [age, setAge] = useState(currentPatient?.age || 35);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(currentPatient?.gender || 'male');
  const [phone, setPhone] = useState(currentPatient?.phone || '');
  const [email, setEmail] = useState(currentPatient?.email || '');
  const [address, setAddress] = useState(currentPatient?.address || '');

  // Add Dependent subform state (FR-P04, US-07)
  const [showAddDependent, setShowAddDependent] = useState(false);
  const [depName, setDepName] = useState('');
  const [depAge, setDepAge] = useState(10);
  const [depGender, setDepGender] = useState<'male' | 'female' | 'other'>('male');
  const [depRelation, setDepRelation] = useState<Dependent['relationship']>('Child');

  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen || !currentPatient) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Plausible age validation (FR-P03)
    if (age < 0 || age > 125) {
      setError('Please provide a plausible age between 0 and 125 years.');
      return;
    }

    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      setError('All profile fields are mandatory for hospital records compliance.');
      return;
    }

    updatePatientProfile({
      name,
      age,
      gender,
      phone,
      email,
      address,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleCreateDependent = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!depName.trim()) {
      setError('Dependent full name is required.');
      return;
    }

    if (depAge < 0 || depAge > 125) {
      setError('Please enter a plausible age for the dependent.');
      return;
    }

    addDependent({
      guardianPatientId: currentPatient.id,
      name: depName.trim(),
      age: depAge,
      gender: depGender,
      relationship: depRelation,
    });

    // Reset subform
    setDepName('');
    setDepAge(10);
    setShowAddDependent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <User className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Patient Profile & Family Members</h3>
              <p className="text-[11px] text-slate-400">Manage contact details and booking dependents (FR-P03, FR-P04)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          {/* SECTION 1: PRIMARY PATIENT INFO */}
          <form id="profile-edit-form" onSubmit={handleSaveProfile} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Primary Patient Information (FR-P03)
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={125}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address *</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>

          {/* SECTION 2: DEPENDENTS (FR-P04, US-07) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Registered Dependents ({dependents.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select family members during booking so appointments are assigned in their name.
                </p>
              </div>

              {!showAddDependent && (
                <button
                  type="button"
                  onClick={() => setShowAddDependent(true)}
                  className="px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Dependent
                </button>
              )}
            </div>

            {/* List of existing dependents */}
            <div className="grid sm:grid-cols-2 gap-3">
              {dependents.map((dep) => (
                <div
                  key={dep.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">{dep.name}</h5>
                    <p className="text-[11px] text-slate-500">
                      {dep.relationship} • {dep.age} yrs • {dep.gender}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    Active Dependent
                  </span>
                </div>
              ))}
            </div>

            {/* Add Dependent Form Modal / Card */}
            {showAddDependent && (
              <form onSubmit={handleCreateDependent} className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-teal-950 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-teal-600" />
                    New Family Member / Dependent Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddDependent(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={depName}
                      onChange={(e) => setDepName(e.target.value)}
                      placeholder="e.g. Kabir Sharma"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Relationship *</label>
                    <select
                      value={depRelation}
                      onChange={(e) => setDepRelation(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="Child">Child</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={125}
                      value={depAge}
                      onChange={(e) => setDepAge(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={depGender}
                      onChange={(e) => setDepGender(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Consent Declaration (DEC-05) */}
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">Guardian Consent Declaration:</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1 py-0.2 rounded font-normal">
                        Pending approval
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      By adding this dependent, I declare that I am the legal guardian or authorized family representative permitted to book hospital appointments and manage clinical intake for this patient.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddDependent(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold bg-white hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Dependent
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
