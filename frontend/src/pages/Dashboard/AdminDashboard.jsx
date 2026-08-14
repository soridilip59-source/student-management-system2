import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  TrendingUp, 
  UserPlus, 
  PlusCircle, 
  FileText, 
  CalendarCheck,
  Activity,
  Award
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import api from '../../services/api';

export const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    students: 0,
    teachers: 0,
    courses: 0,
    users: 0,
    overallAttendanceRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 to-sky-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Institutional Overview</h2>
          <p className="text-xs text-brand-100 mt-1">
            Real-time analytics and management control center for admissions, faculty, and academic records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-brand-700 text-xs font-semibold rounded-xl hover:bg-brand-50 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
          <button
            onClick={() => onNavigate('courses')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-700/80 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl border border-brand-400/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Course
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-700/80 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl border border-brand-400/30 transition-all"
          >
            <FileText className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>

      {/* 4 Core PRD Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={metrics.students}
          subtitle="Enrolled active learners"
          icon={Users}
          color="brand"
          trend={{ isPositive: true, text: '+12% this term' }}
        />
        <StatsCard
          title="Faculty Teachers"
          value={metrics.teachers}
          subtitle="Academic instructors"
          icon={GraduationCap}
          color="purple"
        />
        <StatsCard
          title="Active Courses"
          value={metrics.courses}
          subtitle="Programs & degree tracks"
          icon={BookOpen}
          color="emerald"
        />
        <StatsCard
          title="System Users"
          value={metrics.users}
          subtitle="Registered accounts"
          icon={UserCheck}
          color="amber"
        />
      </div>

      {/* Secondary Row: Course Breakdown & Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Enrollment Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment by Course</h3>
              <p className="text-xs text-slate-500">Distribution across active academic faculties</p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View all courses →
            </button>
          </div>

          <div className="space-y-4">
            {stats?.studentsByCourse?.map((c, idx) => {
              const maxCount = Math.max(...stats.studentsByCourse.map((item) => item.count), 1);
              const percentage = Math.round((c.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{c.courseName}</span>
                    <span className="font-bold text-slate-600">{c.count} students</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance & Demographic Gauge */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Attendance Overview</h3>
            <p className="text-xs text-slate-500">Campus-wide attendance rate</p>

            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-extrabold text-brand-600 tracking-tight">
                {metrics.overallAttendanceRate}%
              </div>
              <p className="text-xs font-medium text-slate-600 mt-1">Average Attendance</p>
              
              <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.overallAttendanceRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('attendance')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
            >
              <CalendarCheck className="w-4 h-4" /> Open Attendance Tracker
            </button>
          </div>
        </div>
      </div>

      {/* Third Row: Recent Students & Recent Activities / Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recently Enrolled Students</h3>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Directory →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentStudents?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No students enrolled yet.</p>
            ) : (
              stats?.recentStudents?.map((student) => (
                <div key={student._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e0f2fe&color=0369a1`}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                      <p className="text-[11px] text-slate-500">{student.studentId} • {student.course?.code || 'General'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {student.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Audit Activities</h3>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Full Log →
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentActivities?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No activity recorded yet.</p>
            ) : (
              stats?.recentActivities?.map((act) => (
                <div key={act._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{act.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{act.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    By: <span className="font-medium text-slate-600">{act.performedBy?.name || 'System'}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
