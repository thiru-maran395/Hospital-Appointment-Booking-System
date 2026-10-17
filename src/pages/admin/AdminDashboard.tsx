import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Download, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Search, 
  Filter,
  ShieldAlert,
  Sliders,
  DollarSign,
  UserCheck,
  Megaphone,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatIstDate, formatIstTime, formatIstDateKey } from '../../utils/time';
import { Appointment, Doctor, HospitalHoliday, User } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PendingApprovalBadge } from '../../components/common/Badge';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    doctors,
    patients,
    departments,
    specializations,
    slots,
    holidays,
    auditLogs,
    bookingConfig,
    updateBookingConfig,
    adminReassignAppointment,
    adminBulkReassignFlagged,
    toggleUserActiveStatus,
    updateDoctorFee,
    addHospitalHoliday,
    addAnnouncement,
    cancelAppointment,
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'overview' | 'accounts' | 'doctors' | 'departments' | 'fees' | 'holidays' | 'announcements' | 'audit' | 'reports' | 'booking-rules'
  >('overview');

  // Filters for Overview table
  const [filterDoctorId, setFilterDoctorId] = useState('all');
  const [filterDepartmentId, setFilterDepartmentId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Modals & Action States
  const [reassignAppointment, setReassignAppointment] = useState<Appointment | null>(null);
  const [reassignDoctorId, setReassignDoctorId] = useState(doctors[0]?.id || '');
  const [reassignSlotId, setReassignSlotId] = useState('');
  const [reassignReason, setReassignReason] = useState('Doctor scheduled leave coverage (RL-18)');

  const [overrideAppointment, setOverrideAppointment] = useState<Appointment | null>(null);
  const [overrideReason, setOverrideReason] = useState('Administrative clinical schedule conflict resolution (RL-21)');

  const [notice, setNotice] = useState<string | null>(null);

  // Configuration form state
  const [config, setConfig] = useState(bookingConfig);

  const updateConfig = (patch: Partial<typeof bookingConfig>) => {
    const updated = { ...config, ...patch };
    setConfig(updated);
    updateBookingConfig(patch);
    setNotice('Booking configuration rule updated.');
    setTimeout(() => setNotice(null), 3000);
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (filterDoctorId !== 'all' && a.doctorId !== filterDoctorId) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterDepartmentId !== 'all') {
      const doc = doctors.find((d) => d.id === a.doctorId);
      if (doc?.departmentId !== filterDepartmentId) return false;
    }
    return true;
  });

  // Flagged for reschedule count
  const flaggedCount = appointments.filter((a) => a.flaggedForReschedule && a.status === 'booked').length;

  const handleExecuteReassign = () => {
    if (!reassignAppointment || !reassignSlotId) {
      alert('Please choose a valid target slot.');
      return;
    }

    const res = adminReassignAppointment(reassignAppointment.id, reassignDoctorId, reassignSlotId);
    if (res.success) {
      setNotice(`Appointment ${reassignAppointment.id} reassigned successfully.`);
      setReassignAppointment(null);
      setReassignSlotId('');
      setTimeout(() => setNotice(null), 3500);
    } else {
      alert(res.error || 'Reassignment failed.');
    }
  };

  const handleExecuteForceCancel = () => {
    if (!overrideAppointment) return;

    const res = cancelAppointment({
      appointmentId: overrideAppointment.id,
      reason: `[ADMIN OVERRIDE] ${overrideReason}`,
      isAdminOverride: true,
    });

    if (res.success) {
      setNotice(`Appointment ${overrideAppointment.id} force-cancelled under admin override.`);
      setOverrideAppointment(null);
      setTimeout(() => setNotice(null), 3500);
    } else {
      alert(res.error || 'Force-cancellation failed.');
    }
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Patient,Doctor,StartUTC,EndUTC,Status,Fee,Reason\n" +
      appointments.map(e => `${e.id},"${e.treatedPersonName}","${e.doctorId}",${e.startUtc},${e.endUtc},${e.status},${e.fee},"${e.reasonForVisit}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HABS_Appointments_${formatIstDateKey(new Date().toISOString())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReportToPdf = () => {
    window.print();
  };

  const reassignTargetSlots = slots.filter((s) => s.doctorId === reassignDoctorId && s.status === 'open');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-[#16302F] text-[#FFFFFF] px-4 py-3 rounded-2xl shadow-[0_10px_25px_-5px_rgba(31,122,120,0.25)] flex items-center gap-3 border border-[#D5E5E3]/40 animate-in fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-[#E1F2F0]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Subtitle & Header Row (Wireframe 09) */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#55706E]">
          ADMINISTRATOR WORKSPACE · All times IST (UTC+05:30)
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16302F] tracking-tight">
              Hospital overview
            </h1>
            <p className="text-xs sm:text-sm text-[#4A6663] mt-0.5">
              Manage booking exceptions, availability disruptions and administrative access.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Management Sidebar + Right Content (Wireframe 09) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: MANAGEMENT */}
        <aside className="lg:col-span-3 bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#55706E] uppercase tracking-wider block mb-2">
              MANAGEMENT
            </span>
            <nav className="space-y-1 font-semibold">
              <button
                onClick={() => setAdminTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'overview'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Overview & bookings
              </button>
              <button
                onClick={() => setAdminTab('accounts')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'accounts'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Accounts
              </button>
              <button
                onClick={() => setAdminTab('doctors')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'doctors'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Doctors
              </button>
              <button
                onClick={() => setAdminTab('departments')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'departments'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Departments / specialties
              </button>
              <button
                onClick={() => setAdminTab('fees')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'fees'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Consultation fees
              </button>
              <button
                onClick={() => setAdminTab('holidays')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'holidays'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Hospital holidays
              </button>
              <button
                onClick={() => setAdminTab('announcements')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'announcements'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => setAdminTab('audit')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'audit'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Audit logs
              </button>
              <button
                onClick={() => setAdminTab('reports')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'reports'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => setAdminTab('booking-rules')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  adminTab === 'booking-rules'
                    ? 'bg-[#1F7A78] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#4A6663] hover:text-[#16302F] hover:bg-[#EAF3F2]'
                }`}
              >
                Booking rules
              </button>
            </nav>
          </div>

          <p className="text-[11px] text-[#55706E] pt-3 border-t border-[#D5E5E3] leading-normal">
            Accounts may be activated or deactivated. Never delete accounts or booking history. Role changes require authorized administrative access.
          </p>
        </aside>

        {/* Right Main Content Area */}
        <section className="lg:col-span-9 space-y-6">
          {adminTab === 'overview' && (
            <>
              {/* 4 Top KPI Cards (Wireframe 09) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
                  <span className="text-[#55706E] font-semibold text-xs block">Today's bookings</span>
                  <span className="text-2xl font-black text-[#16302F] mt-1 block">18</span>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
                  <span className="text-[#55706E] font-semibold text-xs block">Cancellations today</span>
                  <span className="text-2xl font-black text-[#B4455A] mt-1 block">3</span>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
                  <span className="text-[#55706E] font-semibold text-xs block">No-shows today</span>
                  <span className="text-2xl font-black text-[#9A5B00] mt-1 block">2</span>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)]">
                  <span className="text-[#55706E] font-semibold text-xs block">Open flagged bookings</span>
                  <span className="text-2xl font-black text-[#B45309] mt-1 block">{flaggedCount || 4}</span>
                </div>
              </div>

              {/* Alert Callout: Exceptions requiring review (Change required / Flagged colours) */}
              <div className="p-4 bg-[#FFEBD6] rounded-2xl border border-[#FEDBB7] text-xs text-[#B45309] space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
                  <span className="font-extrabold text-[#B45309] block">Exceptions requiring review</span>
                </div>
                <p className="leading-relaxed">
                  4 bookings affected by doctor leave or hospital holidays need rescheduling/reassignment. 2 patients have repeated no-show flags for manual review only; do not block patients automatically.
                </p>
              </div>

              {/* Section: All bookings (Wireframe 09) */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                <div>
                  <h2 className="font-extrabold text-base text-[#16302F]">All bookings</h2>
                  <p className="text-xs text-[#55706E] mt-0.5">
                    Cross-hospital view · All times IST (UTC+05:30)
                  </p>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-[#16302F] block text-[11px] mb-1 font-semibold">Doctor</label>
                    <select
                      value={filterDoctorId}
                      onChange={(e) => setFilterDoctorId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                    >
                      <option value="all">All doctors</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#16302F] block text-[11px] mb-1 font-semibold">Department</label>
                    <select
                      value={filterDepartmentId}
                      onChange={(e) => setFilterDepartmentId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                    >
                      <option value="all">All departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#16302F] block text-[11px] mb-1 font-semibold">Date range</label>
                    <select
                      value={filterDateRange}
                      onChange={(e) => setFilterDateRange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                    >
                      <option value="all">All dates</option>
                      <option value="today">Today only</option>
                      <option value="week">Next 7 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#16302F] block text-[11px] mb-1 font-semibold">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                    >
                      <option value="all">All statuses</option>
                      <option value="booked">Confirmed / Booked</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No-show</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 text-xs pt-1">
                  <button
                    onClick={() => {
                      setFilterDoctorId('all');
                      setFilterDepartmentId('all');
                      setFilterStatus('all');
                    }}
                    className="text-[#1F7A78] hover:underline cursor-pointer font-semibold"
                  >
                    Clear all
                  </button>
                  <button
                    className="px-4 py-1.5 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Apply filters
                  </button>
                </div>

                {/* Bookings Table (Wireframe 09) */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D5E5E3] text-[#55706E] font-bold uppercase text-[10px] bg-[#EAF3F2]">
                        <th className="py-2.5 px-3">Reference / patient</th>
                        <th className="py-2.5 px-3">Doctor / department</th>
                        <th className="py-2.5 px-3">Visit · IST</th>
                        <th className="py-2.5 px-3">Status / flag</th>
                        <th className="py-2.5 px-3 text-right">Administrative actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5E5E3] font-medium">
                      {filteredAppointments.slice(0, 6).map((apt) => {
                        const doc = doctors.find((d) => d.id === apt.doctorId);
                        const isFlagged = apt.flaggedForReschedule;

                        return (
                          <tr key={apt.id} className="hover:bg-[#E1F2F0]/40 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-[#16302F] block">{apt.id}</span>
                              <span className="text-[#4A6663] text-[11px]">{apt.treatedPersonName} · Self</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#16302F] block">{doc?.name}</span>
                              <span className="text-[#55706E] text-[11px]">Cardiology</span>
                            </td>
                            <td className="py-3 px-3 text-[#16302F] whitespace-nowrap">
                              {formatIstDate(apt.startUtc)}<br />
                              <span className="font-mono text-[11px] text-[#55706E]">
                                {formatIstTime(apt.startUtc)}–{formatIstTime(apt.endUtc)} IST
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={apt.status} />
                              {isFlagged && (
                                <div className="mt-1">
                                  <StatusBadge status="flagged" label="Doctor leave" size="sm" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                              {apt.status === 'booked' && (
                                <>
                                  {/* Destructive outline button on table */}
                                  <button
                                    onClick={() => setOverrideAppointment(apt)}
                                    className="px-2.5 py-1 rounded border border-[#B4455A] text-[#B4455A] hover:bg-[#FBE9EC] font-bold text-[11px] cursor-pointer transition-colors"
                                  >
                                    Force-cancel
                                  </button>
                                  <button
                                    onClick={() => setReassignAppointment(apt)}
                                    className="px-2.5 py-1 rounded border border-[#D5E5E3] text-[#16302F] hover:bg-[#EAF3F2] font-bold text-[11px] cursor-pointer transition-colors"
                                  >
                                    Reassign
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-[#55706E] pt-2 border-t border-[#D5E5E3]">
                  Every force-cancel, reschedule and reassignment requires a reason and an audit entry. Availability and conflicts are revalidated before applying a change.
                </p>
              </div>

              {/* Bottom 2 Columns: Resolve affected booking + Reports summary (Wireframe 09) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Resolve affected booking · Inline action */}
                <div className="lg:col-span-7 bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
                  <div>
                    <h2 className="font-extrabold text-sm text-[#16302F]">
                      Resolve affected booking · Inline action
                    </h2>
                    <p className="text-[#55706E] text-[11px] mt-0.5">
                      {reassignAppointment 
                        ? `${reassignAppointment.id} · ${reassignAppointment.treatedPersonName} · Doctor leave`
                        : 'Select a flagged booking from the table above to resolve.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#D5E5E3]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#16302F] font-bold block mb-1">Action</label>
                        <select className="w-full p-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer">
                          <option>Reassign doctor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[#16302F] font-bold block mb-1">New doctor / slot</label>
                        <select
                          value={reassignSlotId}
                          onChange={(e) => setReassignSlotId(e.target.value)}
                          className="w-full p-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl cursor-pointer"
                        >
                          <option value="">-- Choose target slot --</option>
                          {reassignTargetSlots.slice(0, 10).map((s) => (
                            <option key={s.id} value={s.id}>
                              {doctors.find(d => d.id === reassignDoctorId)?.name} · {formatIstDate(s.startUtc)} · {formatIstTime(s.startUtc)} IST
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[#16302F] font-bold block mb-1">
                        Reason * · Required for all admin changes
                      </label>
                      <input
                        type="text"
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        className="w-full p-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl"
                      />
                    </div>

                    <div className="p-3 bg-[#EAF3F2] rounded-xl border border-[#D5E5E3] text-[11px] text-[#4A6663] space-y-0.5">
                      <span className="font-bold text-[#16302F] block">Review before applying</span>
                      <p>
                        Transfer to target clinician. Visit stays 22 Oct · 11:00–11:30 IST. Validate fee and patient notification; retain original reference and history.
                      </p>
                    </div>

                    <button
                      onClick={handleExecuteReassign}
                      className="px-5 py-2.5 bg-[#1F7A78] hover:bg-[#176361] active:bg-[#11504E] text-[#FFFFFF] font-bold rounded-xl text-xs cursor-pointer shadow-[0_4px_16px_rgba(31,122,120,0.18)] transition-colors"
                    >
                      Review & apply reassignment
                    </button>

                    <p className="text-[10px] text-[#55706E]">
                      Audit captures who changed what, reason, time and before → after. Bookings are never deleted.
                    </p>
                  </div>
                </div>

                {/* Right: Reports · Summary & Notifications */}
                <div className="lg:col-span-5 space-y-4 text-xs">
                  {/* Reports · Summary (Wireframe 09) */}
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4">
                    <div>
                      <h2 className="font-extrabold text-sm text-[#16302F]">Reports · Summary</h2>
                      <p className="text-[#55706E] text-[11px] mt-0.5">01–20 Oct 2026 · Hospital-wide</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D5E5E3]">
                      <div>
                        <span className="text-[#55706E] block text-[11px]">Cancellation rate</span>
                        <span className="font-black text-[#16302F] text-lg">8.4%</span>
                      </div>
                      <div>
                        <span className="text-[#55706E] block text-[11px]">No-show rate</span>
                        <span className="font-black text-[#16302F] text-lg">3.1%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#55706E]">
                      Share of appointments in the selected reporting period.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleExportCsv}
                        className="px-3.5 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] font-bold text-[#16302F] cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#1F7A78]" />
                        Export CSV
                      </button>
                      <button
                        onClick={exportReportToPdf}
                        className="px-3.5 py-2 rounded-xl border border-[#D5E5E3] hover:bg-[#EAF3F2] font-bold text-[#16302F] cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#1F7A78]" />
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Notification delivery issues · 2 (Error state: #B3261E text, #FDECEA bg) */}
                  <div className="bg-[#FDECEA] p-5 rounded-2xl border border-[#F9C9C5] space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#B3261E]" />
                      <h2 className="font-extrabold text-sm text-[#B3261E]">Notification delivery issues · 2</h2>
                    </div>
                    <p className="text-[11px] text-[#B3261E] leading-relaxed">
                      1 SMS failed · 1 email pending retry. Review delivery and resend through authorized support. Booking status is unchanged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom: Audit activity · Read-only (Wireframe 09) */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-3 text-xs">
                <div>
                  <h2 className="font-extrabold text-sm text-[#16302F]">Audit activity · Read-only</h2>
                  <p className="text-[#55706E] text-[11px]">Who / action / time / before → after</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D5E5E3] text-[#55706E] uppercase font-bold text-[10px] bg-[#EAF3F2]">
                        <th className="py-2.5 px-3">Who</th>
                        <th className="py-2.5 px-3">Time · IST</th>
                        <th className="py-2.5 px-3">Action / reason</th>
                        <th className="py-2.5 px-3">Before → after</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5E5E3] font-medium">
                      <tr>
                        <td className="py-2.5 px-3">
                          <strong className="text-[#16302F] block">Ananya Rao</strong>
                          <span className="text-[#55706E] text-[11px]">Administrator</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#4A6663]">20 Oct 2026 09:50 IST</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#16302F] block">Recorded Dr. Shah's leave</span>
                          <span className="text-[#55706E] text-[11px]">Reason: approved absence</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#4A6663]">
                          23 Oct: Available → Leave, 2 existing bookings flagged for reassignment
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">
                          <strong className="text-[#16302F] block">Dr. Meera Shah</strong>
                          <span className="text-[#55706E] text-[11px]">Doctor</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#4A6663]">20 Oct 2026 10:02 IST</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#16302F] block">Recorded visit outcome</span>
                          <span className="text-[#55706E] text-[11px]">Patient did not attend</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#4A6663] font-mono text-[11px]">
                          HABS-20261020-0118, Confirmed → No-show; slot remains occupied
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Sub-tab: Accounts */}
          {adminTab === 'accounts' && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
              <h2 className="font-extrabold text-base text-[#16302F]">Account Governance (RL-24)</h2>
              <p className="text-[#55706E]">Activate or deactivate accounts. Deletion is prohibited to preserve medical audit trails.</p>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="font-bold text-[#16302F] block">Patients</span>
                  {patients.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-3 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] flex items-center justify-between">
                      <div>
                        <strong className="text-[#16302F] block">{p.name}</strong>
                        <span className="text-[#55706E] text-[11px]">{p.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.active ? (
                          <button
                            onClick={() => toggleUserActiveStatus(p.userId)}
                            className="px-2.5 py-1 rounded-lg border border-[#B4455A] text-[#B4455A] hover:bg-[#FBE9EC] text-xs font-bold cursor-pointer transition-colors"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleUserActiveStatus(p.userId)}
                            className="px-2.5 py-1 rounded-lg border border-[#1F7A78] text-[#1F7A78] hover:bg-[#E1F2F0] text-xs font-bold cursor-pointer transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <StatusBadge status={p.active ? 'active' : 'cancelled'} label={p.active ? 'Active' : 'Inactive'} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-[#16302F] block">Doctors</span>
                  {doctors.map((d) => (
                    <div key={d.id} className="p-3 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] flex items-center justify-between">
                      <div>
                        <strong className="text-[#16302F] block">{d.name}</strong>
                        <span className="text-[#55706E] text-[11px]">Cardiology · Room {d.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.active ? (
                          <button
                            onClick={() => toggleUserActiveStatus(d.userId)}
                            className="px-2.5 py-1 rounded-lg border border-[#B4455A] text-[#B4455A] hover:bg-[#FBE9EC] text-xs font-bold cursor-pointer transition-colors"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleUserActiveStatus(d.userId)}
                            className="px-2.5 py-1 rounded-lg border border-[#1F7A78] text-[#1F7A78] hover:bg-[#E1F2F0] text-xs font-bold cursor-pointer transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <StatusBadge status={d.active ? 'active' : 'cancelled'} label={d.active ? 'Active' : 'Inactive'} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Doctors & Fees */}
          {(adminTab === 'doctors' || adminTab === 'fees') && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
              <h2 className="font-extrabold text-base text-[#16302F]">Doctor Fees & Specializations</h2>
              <div className="divide-y divide-[#D5E5E3]">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <strong className="text-[#16302F] text-sm block">{doc.name}</strong>
                      <span className="text-[#55706E]">{doc.qualifications.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#16302F]">₹{doc.fee}</span>
                      <button
                        onClick={() => {
                          const newFee = doc.fee === 800 ? 850 : 800;
                          updateDoctorFee(doc.id, newFee);
                          setNotice(`Consultation fee for ${doc.name} updated to ₹${newFee}.`);
                        }}
                        className="px-3 py-1 bg-[#EAF3F2] hover:bg-[#E1F2F0] text-[#1F7A78] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Edit fee
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab: Booking Rules */}
          {adminTab === 'booking-rules' && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-6 text-xs">
              <div>
                <PendingApprovalBadge note="Suggested default, pending business confirmation (BRD-HABS-001 DEC-01)" className="mb-2" />
                <h2 className="font-extrabold text-base text-[#16302F]">Configurable Booking Rules</h2>
                <p className="text-[#55706E]">Rule values per BRD-HABS-001 Section 5.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] space-y-1">
                  <span className="font-bold text-[#16302F] block">Slot Hold Time (RL-05)</span>
                  <p className="text-[#55706E] text-[11px]">Suggested: 5–10 mins</p>
                  <input
                    type="number"
                    value={config.slotHoldTimeMinutes}
                    onChange={(e) => updateConfig({ slotHoldTimeMinutes: Number(e.target.value) })}
                    className="w-24 p-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-lg font-bold text-[#16302F]"
                  /> minutes
                </div>

                <div className="p-4 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] space-y-1">
                  <span className="font-bold text-[#16302F] block">Booking Lead Time (RL-06)</span>
                  <p className="text-[#55706E] text-[11px]">Suggested: 1–2 hours</p>
                  <input
                    type="number"
                    value={config.bookingLeadTimeHours}
                    onChange={(e) => updateConfig({ bookingLeadTimeHours: Number(e.target.value) })}
                    className="w-24 p-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-lg font-bold text-[#16302F]"
                  /> hours
                </div>

                <div className="p-4 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] space-y-1">
                  <span className="font-bold text-[#16302F] block">Booking Window (RL-07)</span>
                  <p className="text-[#55706E] text-[11px]">Suggested: 30–60 days</p>
                  <input
                    type="number"
                    value={config.bookingWindowDays}
                    onChange={(e) => updateConfig({ bookingWindowDays: Number(e.target.value) })}
                    className="w-24 p-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-lg font-bold text-[#16302F]"
                  /> days
                </div>

                <div className="p-4 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] space-y-1">
                  <span className="font-bold text-[#16302F] block">Cancellation Cutoff (RL-13)</span>
                  <p className="text-[#55706E] text-[11px]">Proposed: 2 hours</p>
                  <input
                    type="number"
                    value={config.cancelRescheduleCutoffHours}
                    onChange={(e) => updateConfig({ cancelRescheduleCutoffHours: Number(e.target.value) })}
                    className="w-24 p-2 bg-[#FFFFFF] border border-[#D5E5E3] rounded-lg font-bold text-[#16302F]"
                  /> hours before slot
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Holidays */}
          {adminTab === 'holidays' && (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D5E5E3] shadow-[0_4px_16px_rgba(31,122,120,0.06)] space-y-4 text-xs">
              <h2 className="font-extrabold text-base text-[#16302F]">Hospital Holidays (RL-19)</h2>
              <p className="text-[#55706E]">Declaring a holiday blocks consultation slots across all doctors and flags existing bookings for rescheduling.</p>
              <div className="space-y-2 pt-2">
                {holidays.map((h) => (
                  <div key={h.id} className="p-3 bg-[#F4F9F8] rounded-xl border border-[#D5E5E3] flex items-center justify-between">
                    <div>
                      <strong className="text-[#16302F] block">{h.name}</strong>
                      <span className="text-[#55706E] text-[11px]">{h.dateUtc}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#FFEBD6] text-[#B45309] font-bold text-[10px] border border-[#FEDBB7]">
                      Hospital Wide
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Override Force-Cancel Modal (Destructive filled inside modal) */}
      {overrideAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#16302F]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-[0_10px_25px_-5px_rgba(31,122,120,0.18)] border border-[#D5E5E3] animate-in fade-in zoom-in-95 text-xs">
            <h3 className="font-extrabold text-base text-[#B4455A]">
              Admin Override: Force-Cancel {overrideAppointment.id}
            </h3>
            <p className="text-[#4A6663]">
              Bypasses cancellation cutoff. A mandatory reason is recorded in the permanent audit trail (RL-21).
            </p>
            <div>
              <label className="block font-bold text-[#16302F] mb-1">Mandatory Administrative Reason *</label>
              <textarea
                required
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-2 bg-[#F4F9F8] border border-[#D5E5E3] text-[#16302F] rounded-xl resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideAppointment(null)}
                className="px-4 py-2 rounded-xl border border-[#D5E5E3] text-[#16302F] font-bold cursor-pointer hover:bg-[#EAF3F2]"
              >
                Cancel
              </button>
              {/* Filled destructive button only inside modal */}
              <button
                onClick={handleExecuteForceCancel}
                className="px-5 py-2 rounded-xl bg-[#B4455A] hover:bg-[#9E364A] text-[#FFFFFF] font-bold cursor-pointer shadow-xs"
              >
                Confirm Force-Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
