import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  UserCheck,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_OTP, MAX_OTP_ATTEMPTS, MAX_OTP_RESENDS } from '../../data/config';
import { DEMO_USERS } from '../../data/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { setCurrentUser } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Sign-in fields (Wireframe 01)
  const [identifier, setIdentifier] = useState('aarav.sharma@example.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields (Wireframe 02)
  const [regFullName, setRegFullName] = useState('Aarav Sharma');
  const [regAge, setRegAge] = useState(34);
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regPhone, setRegPhone] = useState('+91 98765 43210');
  const [regEmail, setRegEmail] = useState('aarav.sharma@example.com');
  const [regPassword, setRegPassword] = useState('Password@123');
  const [regConfirmPassword, setRegConfirmPassword] = useState('Password@123');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  // OTP Verification state (Wireframe 02 right column)
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState(DEMO_OTP);
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Validation feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier
    );

    if (found) {
      setCurrentUser(found);
      onClose();
    } else {
      const guest = {
        id: `user-${Date.now()}`,
        name: identifier.split('@')[0],
        role: 'patient' as const,
        email: identifier,
        phone: '+91 98765 43210',
        active: true,
      };
      setCurrentUser(guest);
      onClose();
    }
  };

  const handleQuickDemoRole = (role: 'patient' | 'doctor' | 'admin' | 'receptionist') => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (regPassword !== regConfirmPassword) {
      setFeedback('Passwords do not match. Please re-enter.');
      return;
    }

    if (!privacyConsent) {
      setFeedback('Please accept the privacy notice consent to continue.');
      return;
    }

    // Advance to Step 2 OTP verification (Wireframe 02)
    setRegStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== DEMO_OTP) {
      setOtpAttempts((prev) => prev + 1);
      setFeedback(`Invalid OTP code entered. (Demo code: ${DEMO_OTP})`);
      return;
    }

    const newUser = {
      id: `user-pat-${Date.now()}`,
      name: regFullName,
      role: 'patient' as const,
      email: regEmail,
      phone: regPhone,
      active: true,
    };
    setCurrentUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#16302F]/50 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-[#FFFFFF] rounded-3xl max-w-4xl w-full shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] overflow-hidden my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border-b border-[#D5E5E3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1F7A78] text-[#FFFFFF] flex items-center justify-center font-bold text-sm shadow-xs">
              +
            </div>
            <span className="font-extrabold text-sm text-[#16302F] tracking-tight">HABS</span>
            <span className="text-xs text-[#55706E]">· Secure account access</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAF3F2] text-[#55706E] hover:text-[#16302F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#F4F9F8]">
          {/* ================= WIREFRAME 01: LOGIN ================= */}
          {mode === 'login' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Soft gradient from #E6F4F1 to #EDEBFB (Wireframe 01) */}
              <div className="lg:col-span-6 bg-gradient-to-br from-[#E6F4F1] to-[#EDEBFB] p-6 sm:p-7 rounded-2xl border border-[#D5E5E3] space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A6663] block mb-1">
                      PATIENT & STAFF ACCESS
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight leading-tight">
                      Your next appointment starts here.
                    </h1>
                    <p className="text-xs text-[#4A6663] mt-2 leading-relaxed">
                      Find the right specialist, choose an available slot and manage appointments for you and your family.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-xs text-[#1F7A78] mt-0.5">01</span>
                      <p className="text-xs text-[#16302F] font-medium">Search active doctors by specialty and availability</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-xs text-[#1F7A78] mt-0.5">02</span>
                      <p className="text-xs text-[#16302F] font-medium">Book a consultation with a verified patient account</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-xs text-[#1F7A78] mt-0.5">03</span>
                      <p className="text-xs text-[#16302F] font-medium">Keep your family's appointments in one place</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D5E5E3]/80 space-y-2">
                  <span className="text-[10px] font-bold text-[#4A6663] uppercase tracking-wider block">
                    Quick demo role sign-in
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoRole('patient')}
                      className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E5E3] hover:border-[#1F7A78] hover:bg-[#E1F2F0] text-left cursor-pointer transition-colors shadow-2xs"
                    >
                      <strong className="block text-[#16302F]">Aarav Sharma</strong>
                      <span className="text-[11px] text-[#1F7A78] font-semibold">Patient Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoRole('doctor')}
                      className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E5E3] hover:border-[#1F7A78] hover:bg-[#E1F2F0] text-left cursor-pointer transition-colors shadow-2xs"
                    >
                      <strong className="block text-[#16302F]">Dr. Meera Shah</strong>
                      <span className="text-[11px] text-[#1F7A78] font-semibold">Doctor Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoRole('admin')}
                      className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E5E3] hover:border-[#1F7A78] hover:bg-[#E1F2F0] text-left cursor-pointer transition-colors shadow-2xs"
                    >
                      <strong className="block text-[#16302F]">Ananya Rao</strong>
                      <span className="text-[11px] text-[#1F7A78] font-semibold">Administrator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoRole('receptionist')}
                      className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E5E3] hover:border-[#1F7A78] hover:bg-[#E1F2F0] text-left cursor-pointer transition-colors shadow-2xs"
                    >
                      <strong className="block text-[#16302F]">Pooja Nair</strong>
                      <span className="text-[11px] text-[#1F7A78] font-semibold">Receptionist</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#55706E] pt-1">
                    Appointment access only. For urgent medical needs, contact your hospital directly.
                  </p>
                </div>
              </div>

              {/* Right Column: Card (Wireframe 01) */}
              <div className="lg:col-span-6 bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#16302F]">Sign in to HABS</h2>
                  <p className="text-xs text-[#55706E] mt-0.5">
                    Use the phone number or email linked to your account.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#16302F] mb-1">
                      Phone number or email
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="aarav.sharma@example.com"
                      className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#16302F]">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-[#55706E] hover:underline cursor-pointer"
                      >
                        {showPassword ? 'Hide password' : 'Show password'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl font-medium"
                    />
                  </div>

                  {feedback && (
                    <div className="p-3 bg-[#FDECEA] rounded-xl border border-[#F9C9C5] text-[#B3261E] space-y-0.5">
                      <span className="font-bold block">Notice</span>
                      <p className="text-[11px]">{feedback}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] font-bold rounded-xl text-xs cursor-pointer shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-colors"
                  >
                    Sign in
                  </button>

                  <div className="pt-2 text-center text-xs text-[#55706E]">
                    New to HABS?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-bold text-[#1F7A78] hover:underline cursor-pointer"
                    >
                      Create patient account
                    </button>
                  </div>
                </form>

                <p className="text-[11px] text-[#55706E] pt-3 border-t border-[#D5E5E3] leading-normal">
                  Doctor or Administrator? Use your hospital-issued credentials here. Your assigned role determines your workspace; roles cannot be selected at sign-in.
                </p>
              </div>
            </div>
          )}

          {/* ================= WIREFRAME 02: REGISTRATION ================= */}
          {mode === 'register' && (
            <div className="space-y-6">
              {/* Stepper Breadcrumb (Wireframe 02) */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  regStep === 1 ? 'bg-[#1F7A78] text-[#FFFFFF]' : 'bg-[#EAF3F2] text-[#4A6663]'
                }`}>
                  1 · Patient details
                </span>
                <span className="text-[#55706E]">→</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  regStep === 2 ? 'bg-[#1F7A78] text-[#FFFFFF]' : 'bg-[#EAF3F2] text-[#4A6663]'
                }`}>
                  2 · Contact verification
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
                  Create your patient account
                </h1>
                <p className="text-xs sm:text-sm text-[#4A6663] mt-0.5">
                  Enter your details, then verify your contact to activate your account.
                </p>
              </div>

              {/* 2-Column Registration (Wireframe 02) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Patient details form */}
                <div className="lg:col-span-7 bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
                  <h2 className="font-extrabold text-sm text-[#16302F]">Patient details</h2>
                  <p className="text-[#55706E] text-[11px]">Fields marked * are required.</p>

                  <form onSubmit={handleRegisterSubmit} id="reg-form" className="space-y-3">
                    <div>
                      <label className="block font-bold text-[#16302F] mb-1">Full name *</label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#16302F] mb-1">Age *</label>
                        <input
                          type="number"
                          required
                          value={regAge}
                          onChange={(e) => setRegAge(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#16302F] mb-1">Gender *</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#16302F] mb-1">Mobile number</label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#16302F] mb-1">Email address</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#16302F] mb-1">Password *</label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#16302F] mb-1">Confirm password *</label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#EAF3F2] rounded-xl border border-[#D5E5E3] text-[11px] text-[#4A6663] space-y-1">
                      <span className="font-bold text-[#16302F] block">Privacy notice</span>
                      <p>
                        Your contact and basic details are used to manage accounts, appointments and service notifications.
                      </p>
                    </div>

                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyConsent}
                        onChange={(e) => setPrivacyConsent(e.target.checked)}
                        className="mt-0.5 rounded border-[#D5E5E3] text-[#1F7A78]"
                      />
                      <span className="text-[#16302F] font-semibold text-[11px]">
                        I have read the privacy notice and consent to the use of my details for appointment services. *
                      </span>
                    </label>

                    {regStep === 1 && (
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] font-bold rounded-xl text-xs cursor-pointer shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-colors"
                      >
                        Continue to verification
                      </button>
                    )}
                  </form>
                </div>

                {/* Right Column: Verify your contact (Wireframe 02) */}
                <div className="lg:col-span-5 bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
                  <div>
                    <h2 className="font-extrabold text-sm text-[#16302F]">Verify your contact</h2>
                    <p className="text-[#55706E] text-[11px] mt-0.5">
                      Integrated OTP verification · Code sent
                    </p>
                  </div>

                  <StatusBadge status="awaiting" label="Awaiting verification" size="sm" />

                  <p className="text-[#4A6663] text-[11px]">
                    Enter the one-time code sent to <strong>{regPhone.slice(0, 6)}******</strong>
                  </p>

                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <label className="block font-bold text-[#16302F] mb-1">
                        6-digit verification code *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full text-center font-mono font-bold text-base tracking-widest px-3 py-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                      />
                      <span className="text-[10px] text-[#55706E] block mt-1">
                        Demo OTP is fixed to <strong className="underline text-[#1F7A78]">{DEMO_OTP}</strong>.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={regStep === 1}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        regStep === 2
                          ? 'bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] shadow-[0_4px_16px_rgba(31,122,120,0.18)]'
                          : 'bg-[#E3ECEB] text-[#8A9C9A] border border-[#D5E5E3] cursor-not-allowed'
                      }`}
                    >
                      Verify contact
                    </button>
                  </form>

                  <div className="p-3 bg-[#EAF3F2] rounded-xl border border-[#D5E5E3] text-[11px] text-[#4A6663] space-y-0.5">
                    <span className="font-bold text-[#16302F] block">Account not active yet</span>
                    <p className="text-[#55706E]">
                      Your account activates only after successful OTP verification. Booking remains unavailable until then.
                    </p>
                  </div>

                  <div className="pt-2 text-center text-[#55706E]">
                    Already registered?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="font-bold text-[#1F7A78] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
