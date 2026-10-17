import React from 'react';
import { X, Bell, Mail, Phone, MessageSquare, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIstDateTime } from '../utils/time';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const { notifications, currentUser } = useApp();

  if (!isOpen) return null;

  // Filter relevant notifications for current user role or all for admin
  const userNotifications = notifications.filter(
    (n) => currentUser?.role === 'admin' || n.recipientId === currentUser?.id || n.recipientRole === currentUser?.role
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Simulated Notification Log</h3>
              <p className="text-xs text-slate-400">SMS, Email & WhatsApp Delivery Center (US-14)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No notifications received yet.</p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {notif.channel === 'SMS' && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                      {notif.channel === 'Email' && <Mail className="w-3.5 h-3.5 text-sky-600" />}
                      {notif.channel === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5 text-teal-600" />}
                      <span>{notif.channel}</span>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-semibold">{notif.recipientName}</span>
                  </div>

                  {/* Delivery Status Badge */}
                  <div>
                    {notif.status === 'sent' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Delivered
                      </span>
                    )}
                    {notif.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Failed (Retrying...)
                      </span>
                    )}
                    {notif.status === 'retried' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        <RefreshCw className="w-3 h-3 text-amber-600" />
                        Retried & Sent
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Template: {notif.template}</span>
                  <span>{formatIstDateTime(notif.timestampUtc)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
