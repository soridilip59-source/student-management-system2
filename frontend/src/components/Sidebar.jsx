import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'teachers',
      label: 'Faculty & Teachers',
      icon: GraduationCap,
      roles: ['admin'],
    },
    {
      id: 'courses',
      label: 'Courses & Syllabus',
      icon: BookOpen,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'attendance',
      label: isStudent ? 'My Attendance' : 'Attendance Tracker',
      icon: CalendarCheck,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'exams',
      label: 'Exams & Schedule',
      icon: Award,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'marks',
      label: isStudent ? 'My Marks & Results' : 'Marks Entry Ledger',
      icon: FileSpreadsheet,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'reports',
      label: 'Academic Reports & PDF',
      icon: Sparkles,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: ShieldAlert,
      roles: ['admin'],
    },
    {
      id: 'profile',
      label: 'Account & Settings',
      icon: Settings,
      roles: ['admin', 'teacher', 'student'],
    },
  ];

  const allowedItems = navigationItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-sky-400 rounded-xl shadow-md shadow-brand-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-tight text-white">
                EduTrack <span className="text-brand-400">SMS</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Academic Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-2 bg-slate-800/70 border border-slate-700/50 rounded-lg flex items-center justify-between">
            <span className="text-xs text-slate-400">Access Tier</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          EduTrack v2.0 • MERN Stack System
        </div>
      </aside>
    </>
  );
};
