import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarCheck, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Save, 
  Download, 
  Check, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';

export const AttendanceTracker = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: { status: 'Present', remarks: '' } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // Student view state
  const [studentStats, setStudentStats] = useState(null);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setCourses(res.data.courses || []);
          if (res.data.courses?.length > 0 && !selectedCourse) {
            setSelectedCourse(res.data.courses[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (!isStudent) {
      fetchCourses();
    }
  }, [isStudent]);

  // Load student attendance stats for student role
  useEffect(() => {
    const fetchStudentAttendance = async () => {
      if (isStudent && user?.profile?._id) {
        setLoading(true);
        try {
          const res = await api.get(`/attendance/student/${user.profile._id}`);
          if (res.data.success) {
            setStudentStats(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load student attendance:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudentAttendance();
  }, [isStudent, user]);

  // Load students and existing attendance for selected course & date
  useEffect(() => {
    const fetchCohortAndAttendance = async () => {
      if (!selectedCourse || isStudent) return;
      setLoading(true);
      setSaveSuccess('');

      try {
        // 1. Get enrolled students in course
        const studentRes = await api.get(`/students?course=${selectedCourse}&limit=100`);
        const courseStudents = studentRes.data.students || [];
        setStudents(courseStudents);

        // 2. Get existing attendance for this date & course
        const attRes = await api.get(`/attendance?course=${selectedCourse}&date=${selectedDate}`);
        const existingRecords = attRes.data.attendance || [];

        const initialMap = {};
        courseStudents.forEach((student) => {
          const existing = existingRecords.find((r) => r.student?._id === student._id);
          initialMap[student._id] = {
            status: existing ? existing.status : 'Present',
            remarks: existing ? existing.remarks : '',
          };
        });

        setAttendanceMap(initialMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCohortAndAttendance();
  }, [selectedCourse, selectedDate, isStudent]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = {
        ...attendanceMap[s._id],
        status,
      };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess('');

    try {
      const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks,
      }));

      const res = await api.post('/attendance/bulk', {
        courseId: selectedCourse,
        date: selectedDate,
        records,
      });

      if (res.data.success) {
        setSaveSuccess(`Successfully marked attendance for ${records.length} students on ${selectedDate}!`);
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('sms_token');
    window.open(`/api/reports/attendance/csv?course=${selectedCourse}&token=${token}`, '_blank');
  };

  // Status counter calculations
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'Present').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'Late').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'Absent').length;
  const leaveCount = Object.values(attendanceMap).filter((a) => a.status === 'Leave').length;

  if (isStudent) {
    // ---------------- STUDENT'S PERSONAL ATTENDANCE VIEW ----------------
    const summary = studentStats?.summary || { percentage: 88, present: 22, total: 25, absent: 3, late: 0, leave: 0 };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Academic Attendance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time attendance tracking and lecture presence report</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl">
            Overall: {summary.percentage}%
          </span>
        </div>

        {/* Big Gauge Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-500 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-emerald-700">{summary.percentage}%</span>
                <span className="text-[10px] text-emerald-600 font-semibold uppercase">Presence</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Status: {summary.percentage >= 75 ? 'Good Standing' : 'Below 75% Requirement'}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You have attended <strong className="text-slate-900">{summary.present + summary.late}</strong> out of <strong className="text-slate-900">{summary.total}</strong> recorded lectures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-lg font-bold text-emerald-600">{summary.present}</span>
                <p className="text-[10px] text-slate-500">Present</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-lg font-bold text-red-500">{summary.absent}</span>
                <p className="text-[10px] text-slate-500">Absent</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-lg font-bold text-amber-500">{summary.late}</span>
                <p className="text-[10px] text-slate-500">Late</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            Recent Class Attendance Records
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentStats?.recentRecords?.length === 0 ? (
                <tr><td colSpan="3" className="py-8 text-center text-slate-400">No attendance records found.</td></tr>
              ) : (
                studentStats?.recentRecords?.map((r) => (
                  <tr key={r._id}>
                    <td className="py-3 px-4 font-semibold text-slate-900">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                        r.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{r.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ---------------- TEACHER / ADMIN ATTENDANCE MARKING VIEW ----------------
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Management Sheet</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select course and date to record and update daily class attendance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-subtle"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Course select */}
          <div className="w-full sm:w-64">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-full sm:w-44">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium hidden lg:inline">Quick Set:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Live Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Present</span>
            <p className="text-lg font-bold text-emerald-600">{presentCount}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Absent</span>
            <p className="text-lg font-bold text-red-600">{absentCount}</p>
          </div>
          <XCircle className="w-5 h-5 text-red-500" />
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Late</span>
            <p className="text-lg font-bold text-amber-600">{lateCount}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Leave</span>
            <p className="text-lg font-bold text-blue-600">{leaveCount}</p>
          </div>
          <AlertCircle className="w-5 h-5 text-blue-500" />
        </div>
      </div>

      {/* Attendance Interactive Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                    <p className="mt-2 text-xs">Loading course roster...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    No students currently enrolled in this course.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student._id]?.status || 'Present';

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e0f2fe&color=0369a1`}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{student.name}</span>
                            <span className="block text-[10px] text-slate-500">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {student.studentId}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {['Present', 'Absent', 'Late', 'Leave'].map((status) => {
                            const isSelected = currentStatus === status;
                            let style = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

                            if (isSelected) {
                              if (status === 'Present') style = 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm';
                              if (status === 'Absent') style = 'bg-red-600 text-white border-red-600 font-bold shadow-sm';
                              if (status === 'Late') style = 'bg-amber-500 text-white border-amber-500 font-bold shadow-sm';
                              if (status === 'Leave') style = 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm';
                            }

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(student._id, status)}
                                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${style}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={attendanceMap[student._id]?.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [student._id]: {
                                ...prev[student._id],
                                remarks: val,
                              },
                            }));
                          }}
                          placeholder="Add note..."
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
