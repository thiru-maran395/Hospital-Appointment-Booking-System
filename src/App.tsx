import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { DoctorList } from './components/DoctorList';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { BookingWizardModal } from './pages/patient/BookingWizardModal';
import { MyAppointmentsView } from './pages/patient/MyAppointmentsView';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';
import { DepartmentsView } from './components/DepartmentsView';
import { PreVisitGuideModal } from './components/PreVisitGuideModal';
import { HelpSupportModal } from './components/common/HelpSupportModal';
import { AuthModal } from './pages/auth/AuthModal';
import { PatientProfileModal } from './pages/patient/PatientProfileModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { DemoToolsDrawer } from './components/DemoToolsDrawer';
import { Doctor, Slot } from './types';
import { Building2, ShieldCheck, PhoneCall, Clock, MapPin } from 'lucide-react';

function AppContent() {
  const { currentUser, departments, doctors } = useApp();

  // Active view tab
  const [currentTab, setCurrentTab] = useState<
    'find-doctors' | 'my-appointments' | 'doctor-dashboard' | 'admin-dashboard' | 'receptionist-dashboard' | 'departments'
  >('find-doctors');

  // Search & department filters for doctor list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Modals state
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<Slot | null>(null);
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState<Doctor | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [preVisitGuideOpen, setPreVisitGuideOpen] = useState(false);
  const [helpSupportOpen, setHelpSupportOpen] = useState(false);

  const handleStartBooking = (doctor?: Doctor, slot?: Slot | null) => {
    setSelectedDoctorForBooking(doctor || null);
    setSelectedSlotForBooking(slot || null);
    setBookingWizardOpen(true);
  };

  const handleSelectDepartmentFromView = (deptId: string) => {
    setSelectedDepartment(deptId);
    setCurrentTab('find-doctors');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F9F8] text-[#16302F] font-sans selection:bg-[#1F7A78] selection:text-[#FFFFFF]">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickBook={() => handleStartBooking()}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenHelp={() => setHelpSupportOpen(true)}
        onOpenPreVisitGuide={() => setPreVisitGuideOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'find-doctors' && (
          <>
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              departments={departments as any}
              onOpenQuickBook={() => handleStartBooking()}
            />

            <DoctorList
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              onBookDoctor={(doc) => handleStartBooking(doc)}
              onViewDoctorDetails={(doc) => setSelectedDoctorForDetails(doc)}
            />
          </>
        )}

        {currentTab === 'departments' && (
          <DepartmentsView onSelectDepartment={handleSelectDepartmentFromView} />
        )}

        {currentTab === 'my-appointments' && (
          <MyAppointmentsView 
            onScheduleNew={() => handleStartBooking()} 
            onOpenDoctorDetails={(docId) => {
              const doc = doctors.find((d) => d.id === docId);
              if (doc) setSelectedDoctorForDetails(doc);
            }}
          />
        )}

        {currentTab === 'doctor-dashboard' && (
          <DoctorDashboard />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {currentTab === 'receptionist-dashboard' && (
          <ReceptionistDashboard />
        )}
      </main>

      {/* Modals & Dialogs */}
      {bookingWizardOpen && (
        <BookingWizardModal
          initialDoctor={selectedDoctorForBooking}
          initialSlot={selectedSlotForBooking}
          onClose={() => {
            setBookingWizardOpen(false);
            setSelectedSlotForBooking(null);
          }}
          onViewAppointments={() => {
            setBookingWizardOpen(false);
            setSelectedSlotForBooking(null);
            setCurrentTab('my-appointments');
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {selectedDoctorForDetails && (
        <DoctorDetailModal
          doctor={selectedDoctorForDetails}
          onClose={() => setSelectedDoctorForDetails(null)}
          onBook={(doc, slot) => handleStartBooking(doc, slot)}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PatientProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <NotificationCenterModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />

      <PreVisitGuideModal
        isOpen={preVisitGuideOpen}
        onClose={() => setPreVisitGuideOpen(false)}
      />

      <HelpSupportModal
        isOpen={helpSupportOpen}
        onClose={() => setHelpSupportOpen(false)}
      />

      {/* Floating Demo Tools Drawer for Reviewers */}
      <DemoToolsDrawer />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg tracking-tight">HABS • MetroHealth</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hospital Appointment Booking System (HABS) built strictly according to BRD-HABS-001 (v0.1 Draft). Featuring zero double-booking lock, atomic rescheduling, and role-based clinic governance.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>BRD-HABS-001 Compliant Prototype</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setCurrentTab('find-doctors')} className="hover:text-white cursor-pointer">Doctor Directory</button></li>
                <li><button onClick={() => setCurrentTab('my-appointments')} className="hover:text-white cursor-pointer">My Appointments</button></li>
                <li><button onClick={() => setCurrentTab('doctor-dashboard')} className="hover:text-white cursor-pointer">Doctor Dashboard (RL-20)</button></li>
                <li><button onClick={() => setCurrentTab('admin-dashboard')} className="hover:text-white cursor-pointer">Administrator Console (RL-21)</button></li>
                <li><button onClick={() => setCurrentTab('receptionist-dashboard')} className="hover:text-white cursor-pointer">Reception Desk Queue (RL-22)</button></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Business Rule Highlights</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>• <strong>RL-02/RL-03:</strong> Double-booking prohibited</li>
                <li>• <strong>RL-05:</strong> 7-minute slot hold with live timer</li>
                <li>• <strong>RL-10:</strong> UTC stored, IST displayed</li>
                <li>• <strong>RL-12:</strong> Atomic rescheduling & rollback</li>
                <li>• <strong>RL-16:</strong> Doctor leave flags affected bookings</li>
                <li>• <strong>RL-18:</strong> No-show increments patient count</li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Hospital Address & Care</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>MetroHealth Medical Center, 742 Health Blvd, Bengaluru, Karnataka, 560001</span>
                </div>
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <span>24/7 Hotline: +91 800 555 0199</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MetroHealth Hospital System. Hospital Appointment Booking System.</p>
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-400">India · English · All times IST (UTC+05:30)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
