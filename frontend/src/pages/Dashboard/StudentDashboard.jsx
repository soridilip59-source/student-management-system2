import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarCheck, 
  Award, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import api from '../../services/api';

export const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
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
        console.error('Failed to load student dashboard:', err);
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
    attendanceRate: 88,
    averagePercentage: 84.5,
    overallGrade: 'A',
    courses: 1,
  };

  const student = stats?.student;
  const attendanceOverview = stats?.attendanceOverview || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h2>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-700/80 rounded-full border border-emerald-400/30">
              Student ID: {student?.studentId || 'STU-2026-001'}
            </span>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Program: <span className="font-semibold text-white">{student?.course?.name || 'Bachelor of Commerce (B.Com)'}</span> • {student?.department || 'Commerce & Accounting'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('reports')}
          className="px-4 py-2 bg-white text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" /> View Report Card
        </button>
      </div>

      {/* 3 Core Metric Cards (PRD Spec: Attendance 87-88%, Average 82-85%, Courses 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Overall Attendance"
          value={`${metrics.attendanceRate}%`}
          subtitle="Presence in assigned lectures"
          icon={CalendarCheck}
          color="emerald"
          trend={{ isPositive: metrics.attendanceRate >= 75, text: metrics.attendanceRate >= 75 ? 'Satisfactory (≥ 75%)' : 'Attendance Warning (< 75%)' }}
        />
        <StatsCard
          title="Academic Score"
          value={`${metrics.averagePercentage}%`}
          subtitle={`Grade ${metrics.overallGrade} • ${metrics.result || 'Pass'}`}
          icon={Award}
          color="brand"
        />
        <StatsCard
          title="Enrolled Courses"
          value={metrics.courses}
          subtitle="Active academic semester"
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Grid: Attendance Gauge & Subject-wise Marks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Visual Progress Gauge */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Attendance Status</h3>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Full Log →
            </button>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">{metrics.attendanceRate}%</span>
                <p className="text-xs text-slate-500 mt-0.5">Calculated as (Present / Total Classes) × 100</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-700">
                  {attendanceOverview.presentClasses || 22} / {attendanceOverview.totalClasses || 25}
                </span>
                <p className="text-[11px] text-slate-500">Classes Attended</p>
              </div>
            </div>

            {/* ASCII / Visual Progress Bar from PRD Section 15 */}
            <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  metrics.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${metrics.attendanceRate}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-600">{attendanceOverview.presentClasses || 22}</span>
                <p className="text-[10px] text-slate-500">Present</p>
              </div>
              <div>
                <span className="text-xs font-bold text-red-500">{attendanceOverview.absentClasses || 3}</span>
                <p className="text-[10px] text-slate-500">Absent</p>
              </div>
              <div>
                <span className="text-xs font-bold text-amber-500">{attendanceOverview.lateClasses || 0}</span>
                <p className="text-[10px] text-slate-500">Late</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Performance Subject Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Academic Marks & Scores</h3>
            <button
              onClick={() => onNavigate('marks')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Detailed Transcript →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentMarks?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No examination scores published yet.</p>
            ) : (
              stats?.recentMarks?.map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.subject}</h4>
                    <p className="text-[11px] text-slate-500">{m.exam?.name || 'Mid-Term Exam'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{m.marksObtained} / {m.maxMarks}</span>
                      <p className="text-[10px] text-slate-500">{m.percentage}%</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 rounded-lg">
                      {m.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
