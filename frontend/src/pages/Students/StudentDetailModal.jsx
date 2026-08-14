import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award, 
  CalendarCheck, 
  CheckCircle, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';

export const StudentDetailModal = ({ isOpen, onClose, studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/students/${studentId}`);
          if (res.data.success) {
            setData(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load student details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const student = data?.student;
  const stats = data?.academicStats || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Comprehensive Profile" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : student ? (
        <div className="space-y-6">
          {/* Header Identity Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl">
            <img
              src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0284c7&color=fff`}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-500/30"
            />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg font-bold text-white">{student.name}</h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full inline-block">
                  {student.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {student.course?.name} ({student.course?.code}) • {student.department}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Enrolled: {new Date(student.admissionDate).toLocaleDateString()} • Status: <span className="font-semibold text-emerald-400">{student.status}</span>
              </p>
            </div>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <span className="text-xs text-emerald-700 font-medium">Attendance Rate</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{stats.attendancePercentage}%</p>
              <span className="text-[10px] text-emerald-600">{stats.presentClasses} of {stats.totalClasses} classes</span>
            </div>

            <div className="p-3.5 bg-brand-50 border border-brand-100 rounded-xl text-center">
              <span className="text-xs text-brand-700 font-medium">Academic Average</span>
              <p className="text-xl font-bold text-brand-800 mt-0.5">{stats.overallPercentage}%</p>
              <span className="text-[10px] text-brand-600">Grade: {stats.overallGrade} ({stats.overallResult})</span>
            </div>

            <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-xl text-center">
              <span className="text-xs text-purple-700 font-medium">Exams Evaluated</span>
              <p className="text-xl font-bold text-purple-800 mt-0.5">{stats.totalExamsTaken || 0}</p>
              <span className="text-[10px] text-purple-600">Total papers completed</span>
            </div>
          </div>

          {/* Personal & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email: <strong className="text-slate-900">{student.email}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Phone: <strong className="text-slate-900">{student.phone || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Gender: <strong className="text-slate-900">{student.gender}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>City: <strong className="text-slate-900">{student.address?.city || 'Metropolis'}, {student.address?.state || 'NY'}</strong></span>
            </div>
          </div>

          {/* Academic Marks Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-600" /> Examination Scorecard
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Exam</th>
                    <th className="py-2.5 px-3">Marks</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.recentMarks?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-slate-400">No marks entered yet</td>
                    </tr>
                  ) : (
                    data.recentMarks.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-semibold text-slate-900">{m.subject}</td>
                        <td className="py-2 px-3 text-slate-500">{m.exam?.name || 'Mid-Term'}</td>
                        <td className="py-2 px-3 font-bold">{m.marksObtained} / {m.maxMarks}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                            {m.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`font-semibold ${m.result === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {m.result}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-red-500 text-center py-6">Could not load student information.</p>
      )}
    </Modal>
  );
};
