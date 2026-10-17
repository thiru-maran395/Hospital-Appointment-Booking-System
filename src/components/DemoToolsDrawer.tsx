import React, { useState } from 'react';
import { 
  Wrench, 
  X, 
  RotateCcw, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import { DEMO_OTP } from '../data/config';
import { UserRole } from '../types';

export const DemoToolsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentUser,
    setCurrentUser,
    activeHoldSlot,
    holdSecondsRemaining,
    expireHoldNow,
    simulateSimultaneousCollision,
    setSimulateSimultaneousCollision,
    simulateRescheduleFailure,
    setSimulateRescheduleFailure,
    simulateNotificationFailure,
    setSimulateNotificationFailure,
    resetAllData,
  } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <>
      {/* Floating Demo Tools Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold transition-all hover:scale-105 cursor-pointer group"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <Wrench className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform" />
        <span>Demo Tools & Role Switcher</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Reviewer Demo Tools</h3>
                  <p className="text-[11px] text-slate-400">BRD-HABS-001 Exception & Role Verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-6 flex-1 text-xs text-slate-700">
              {/* Quick Role Switcher */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    Quick Role Switcher (RL-20 - RL-22)
                  </label>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    Current: {currentUser?.role.toUpperCase() || 'GUEST'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {DEMO_USERS.map((user) => {
                    const isSelected = currentUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleRoleSelect(user.role)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 text-sky-950 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] uppercase font-bold text-sky-700">
                            {user.role}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                        </div>
                        <span className="font-semibold text-xs truncate">{user.name}</span>
                        <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Demo Fixed OTP Notice */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Fixed Demo Verification OTP (FR-P01)
                </span>
                <p className="text-emerald-800 text-[11px]">
                  For registration and password reset verification, enter mock OTP:{' '}
                  <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 text-xs">
                    {DEMO_OTP}
                  </strong>
                </p>
              </div>

              {/* Exception Testing: Collision & Atomic Failure */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Exception Simulators (Section 7.9)
                </label>

                {/* 1. Simultaneous Booking Collision */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Simulate Simultaneous Booking Collision
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Triggers instant collision error when attempting to hold or book a slot (RL-02, RL-03).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateSimultaneousCollision}
                    onChange={(e) => setSimulateSimultaneousCollision(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 2. Reschedule Failure Atomic Rollback */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Simulate Reschedule Booking Failure
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Verifies atomic behavior (RL-12, US-06): If the new slot booking fails, the original appointment is unchanged and old slot is NOT released.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateRescheduleFailure}
                    onChange={(e) => setSimulateRescheduleFailure(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 3. Notification Delivery Failure & Retry */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Simulate Notification Gateway Failure
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Logs SMS/Email notification as 'failed' then automatically retries without invalidating the booking (US-14).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateNotificationFailure}
                    onChange={(e) => setSimulateNotificationFailure(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Slot Hold Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Slot Hold Controls (RL-05)
                </label>
                {activeHoldSlot ? (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-purple-900">Active Slot Hold:</span>
                      <span className="font-mono font-bold text-purple-700">{holdSecondsRemaining}s left</span>
                    </div>
                    <button
                      onClick={expireHoldNow}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Expire Hold Immediately (Test Expiry Fallback)
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No slot currently held. Select a slot in the booking flow to activate the hold timer.</p>
                )}
              </div>
            </div>

            {/* Footer Reset */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">In-memory mock store</span>
              <button
                onClick={() => {
                  if (window.confirm('Reset all mock data, bookings, and audit logs to factory state?')) {
                    resetAllData();
                    setIsOpen(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Mock Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
