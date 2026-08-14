import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import api from '../../services/api';

export const TeacherDashboard = ({ onNavigate }) => {
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
        console.error('Failed to load teacher stats:', err);
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

  const metrics = stats?.metrics || { students: 0, courses: 0, attendanceRate: 91 };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Faculty Instruction Console</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Manage course rosters, record student attendance, evaluate exams, and enter scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 bg-white text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-sm flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" /> Mark Attendance
          </button>
          <button
            onClick={() => onNavigate('marks')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl border border-blue-400/30 transition-all flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" /> Enter Marks
          </button>
        </div>
      </div>

      {/* 3 Core Metric Cards (PRD Spec: Students 85, Courses 4, Attendance 91%) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned Students"
          value={metrics.students}
          subtitle="Enrolled in your classes"
          icon={Users}
          color="brand"
        />
        <StatsCard
          title="Assigned Courses"
          value={metrics.courses}
          subtitle="Active curriculum tracks"
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Average Attendance"
          value={`${metrics.attendanceRate}%`}
          subtitle="Student presence rate"
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Grid: Upcoming Exams & Recent Marks Entered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Examinations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Course Examinations</h3>
            </div>
            <button
              onClick={() => onNavigate('exams')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {stats?.upcomingExams?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming examinations scheduled.</p>
            ) : (
              stats?.upcomingExams?.map((exam) => (
                <div
                  key={exam._id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{exam.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {exam.subject} • {exam.course?.code}
                    </p>
                    <span className="text-[10px] text-brand-600 font-medium mt-1 inline-block">
                      Date: {new Date(exam.examDate).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('marks')}
                    className="px-2.5 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    Grade
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Submitted Marks */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Marks Evaluated</h3>
            </div>
            <button
              onClick={() => onNavigate('marks')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Ledger →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentMarks?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No marks recorded recently.</p>
            ) : (
              stats?.recentMarks?.map((mark) => (
                <div key={mark._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{mark.student?.name}</p>
                    <p className="text-[11px] text-slate-500">{mark.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">
                      {mark.marksObtained}/{mark.maxMarks}
                    </span>
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mark.result === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {mark.grade} ({mark.result})
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
