import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Printer, 
  Download, 
  GraduationCap, 
  Award, 
  CalendarCheck, 
  CheckCircle, 
  Search,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

export const ReportCards = () => {
  const { user, isStudent } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load students list for selector
  useEffect(() => {
    const fetchStudents = async () => {
      if (isStudent && user?.profile?._id) {
        setSelectedStudentId(user.profile._id);
      } else {
        try {
          const res = await api.get('/students?limit=100');
          if (res.data.success) {
            setStudents(res.data.students || []);
            if (res.data.students?.length > 0 && !selectedStudentId) {
              setSelectedStudentId(res.data.students[0]._id);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchStudents();
  }, [isStudent, user]);

  // Fetch report card data whenever selectedStudentId changes
  useEffect(() => {
    const fetchReportCard = async () => {
      if (!selectedStudentId) return;
      setLoading(true);
      try {
        const res = await api.get(`/marks/report-card/${selectedStudentId}`);
        if (res.data.success) {
          setReportData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to generate report card:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportCard();
  }, [selectedStudentId]);

  const handlePrint = () => {
    window.print();
  };

  const student = reportData?.student;
  const summary = reportData?.summary || {};
  const subjects = reportData?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Controls Header (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Report Cards & Transcripts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official institutional transcript generation with grades and GPA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isStudent && (
            <div className="w-64">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official Academic Transcript Card (Rendered & Formatted for Print) */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-2 text-xs">Generating Official Transcript...</p>
        </div>
      ) : reportData && student ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-12 max-w-4xl mx-auto printable-card">
          {/* Institution Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2.5 bg-slate-900 text-white rounded-2xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  EduTrack Academic Institute
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  Affiliated Higher Education Board & University Center
                </p>
              </div>
            </div>
            <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mt-3">
              Official Student Academic Transcript & Performance Card
            </p>
          </div>

          {/* Student Profile Metadata Box */}
          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
              <strong className="text-slate-900 font-bold text-sm">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student ID</span>
              <strong className="text-slate-900 font-mono">{student.studentId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Track</span>
              <strong className="text-slate-900">{student.course}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Department</span>
              <strong className="text-slate-900">{student.department}</strong>
            </div>
          </div>

          {/* Scores Table */}
          <div className="mt-6">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 border-r border-slate-300">#</th>
                  <th className="py-3 px-4 border-r border-slate-300">Subject / Course Module</th>
                  <th className="py-3 px-4 border-r border-slate-300 text-center">Max Marks</th>
                  <th className="py-3 px-4 border-r border-slate-300 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 border-r border-slate-300 text-center">Percentage</th>
                  <th className="py-3 px-4 border-r border-slate-300 text-center">Letter Grade</th>
                  <th className="py-3 px-4 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No evaluation scores on file for this student.
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 border-r border-slate-200 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 border-r border-slate-200 font-bold">{sub.subject}</td>
                      <td className="py-3 px-4 border-r border-slate-200 text-center">{sub.maxMarks}</td>
                      <td className="py-3 px-4 border-r border-slate-200 text-center font-bold">{sub.marksObtained}</td>
                      <td className="py-3 px-4 border-r border-slate-200 text-center">{sub.percentage}%</td>
                      <td className="py-3 px-4 border-r border-slate-200 text-center font-black">{sub.grade}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${sub.result === 'Pass' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {sub.result}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Academic Aggregate Summary Box */}
          <div className="mt-6 p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Aggregate Score</span>
              <p className="text-xl font-black">
                {summary.totalMarksObtained} / {summary.totalMaxMarks} ({summary.overallPercentage}%)
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cumulative GPA</span>
              <p className="text-xl font-black text-brand-300">{summary.gpa} / 4.0</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Overall Letter Grade</span>
              <p className="text-xl font-black text-emerald-400">{summary.overallGrade}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Final Standing</span>
              <p className="text-xl font-black uppercase text-emerald-300">{summary.overallResult}</p>
            </div>
          </div>

          {/* Signature & Authentication Footer */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-3 gap-8 text-center text-xs">
            <div>
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-400">
                Dr. S. Jenkins
              </div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-800">
                Department Dean
              </div>
            </div>

            <div>
              <div className="h-10 flex items-end justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-brand-500 text-brand-600 flex items-center justify-center text-[9px] font-bold uppercase rotate-12">
                  SEAL
                </div>
              </div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-800">
                Institution Registrar
              </div>
            </div>

            <div>
              <div className="h-10 flex items-end justify-center font-mono text-[11px] text-slate-500">
                {new Date().toLocaleDateString()}
              </div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-800">
                Date of Issue
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-red-500 text-center py-10">Could not retrieve student report data.</p>
      )}
    </div>
  );
};
