import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  FileSpreadsheet, 
  Save, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  BookOpen,
  User,
  Layers
} from 'lucide-react';
import api from '../../services/api';

export const MarksEntry = ({ initialExamId }) => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { studentId: { marksObtained: 85, remarks: '' } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Student view state
  const [studentMarks, setStudentMarks] = useState([]);

  // Fetch Exams list
  useEffect(() => {
    const fetchExamsList = async () => {
      try {
        const res = await api.get('/exams');
        if (res.data.success) {
          setExams(res.data.exams || []);
          if (res.data.exams?.length > 0 && !selectedExamId) {
            setSelectedExamId(res.data.exams[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (!isStudent) {
      fetchExamsList();
    }
  }, [isStudent, selectedExamId]);

  // If student role, fetch their own marks directly
  useEffect(() => {
    const fetchStudentOwnMarks = async () => {
      if (isStudent) {
        setLoading(true);
        try {
          const res = await api.get('/marks');
          if (res.data.success) {
            setStudentMarks(res.data.marks || []);
          }
        } catch (err) {
          console.error('Failed to load marks:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudentOwnMarks();
  }, [isStudent]);

  // Load Exam details and enrolled students for Teacher / Admin
  useEffect(() => {
    const fetchExamAndStudents = async () => {
      if (!selectedExamId || isStudent) return;
      setLoading(true);
      setSaveSuccess('');

      try {
        // 1. Get Exam Details
        const examRes = await api.get(`/exams/${selectedExamId}`);
        const examDoc = examRes.data.data;
        setSelectedExam(examDoc);

        // 2. Get Enrolled Students for this exam's course
        const studentRes = await api.get(`/students?course=${examDoc.course?._id || examDoc.course}&limit=100`);
        const courseStudents = studentRes.data.students || [];
        setStudents(courseStudents);

        // 3. Get existing marks submitted for this exam
        const marksRes = await api.get(`/marks?exam=${selectedExamId}`);
        const existingMarks = marksRes.data.marks || [];

        const initialMap = {};
        courseStudents.forEach((student) => {
          const existing = existingMarks.find((m) => m.student?._id === student._id);
          initialMap[student._id] = {
            marksObtained: existing ? existing.marksObtained : 0,
            remarks: existing ? existing.remarks : '',
          };
        });

        setMarksMap(initialMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamAndStudents();
  }, [selectedExamId, isStudent]);

  const calculateGradeHelper = (obtained, max) => {
    if (!max || max === 0) return { grade: 'F', result: 'Fail', pct: 0 };
    const pct = parseFloat(((obtained / max) * 100).toFixed(1));

    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';

    const result = pct >= 40 ? 'Pass' : 'Fail';
    return { grade, result, pct };
  };

  const handleScoreChange = (studentId, value) => {
    const num = Math.max(0, Math.min(Number(value) || 0, selectedExam?.maxMarks || 100));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: num,
      },
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setSaveSuccess('');

    try {
      const records = Object.entries(marksMap).map(([studentId, data]) => ({
        studentId,
        marksObtained: Number(data.marksObtained),
        remarks: data.remarks,
      }));

      const res = await api.post('/marks/bulk', {
        examId: selectedExamId,
        records,
      });

      if (res.data.success) {
        setSaveSuccess(`Grades recorded and saved successfully for ${records.length} students!`);
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('sms_token');
    window.open(`/api/reports/marks/csv?exam=${selectedExamId}&token=${token}`, '_blank');
  };

  if (isStudent) {
    // ---------------- STUDENT'S PERSONAL MARKS VIEW ----------------
    let totalObtained = 0;
    let totalMax = 0;
    studentMarks.forEach((m) => {
      totalObtained += m.marksObtained;
      totalMax += m.maxMarks;
    });
    const overallPct = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
    const { grade: ovGrade, result: ovResult } = calculateGradeHelper(totalObtained, totalMax);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Academic Results & Grades</h2>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive examination performance and score ledger</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold rounded-xl">
              Average: {overallPct}% ({ovGrade})
            </span>
          </div>
        </div>

        {/* Big Scorecard Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-50 border-2 border-brand-500 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-brand-700">{ovGrade}</span>
              <span className="text-[10px] text-brand-600 font-bold uppercase">{ovResult}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Overall Academic Performance</h3>
              <p className="text-xs text-slate-500 mt-1">
                Aggregated Marks: <strong className="text-slate-900">{totalObtained} / {totalMax}</strong> ({overallPct}%)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-600">Total Exams Completed:</span>
            <p className="text-2xl font-extrabold text-slate-900">{studentMarks.length}</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            Subject-wise Examination Scores
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Examination</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentMarks.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">No examination scores recorded yet.</td></tr>
              ) : (
                studentMarks.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{m.subject}</td>
                    <td className="py-3 px-4 text-slate-500">{m.exam?.name}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.marksObtained} / {m.maxMarks}</td>
                    <td className="py-3 px-4">{m.percentage}%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 font-bold border border-brand-200">
                        {m.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4">
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
    );
  }

  // ---------------- TEACHER / ADMIN MARKS ENTRY VIEW ----------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examination Marks & Grading Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-calculates percentages, letter grades (A+, A, B+, etc.), and pass/fail standing instantly
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
            onClick={handleSaveMarks}
            disabled={saving || students.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Grades'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Select Exam Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Select Examination
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name} — {ex.subject} ({ex.course?.code})
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="flex items-center gap-4 text-xs bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-500 block text-[10px]">Subject</span>
              <strong className="text-slate-900">{selectedExam.subject}</strong>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-500 block text-[10px]">Max Marks</span>
              <strong className="text-slate-900">{selectedExam.maxMarks}</strong>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-500 block text-[10px]">Passing Score</span>
              <strong className="text-slate-900">{selectedExam.passMarks} ({((selectedExam.passMarks / selectedExam.maxMarks) * 100).toFixed(0)}%)</strong>
            </div>
          </div>
        )}
      </div>

      {/* Grade Scale Reference Ribbon from PRD */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300">Grade Matrix:</span>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span><strong>90–100</strong> → A+</span>
          <span><strong>80–89</strong> → A</span>
          <span><strong>70–79</strong> → B+</span>
          <span><strong>60–69</strong> → B</span>
          <span><strong>50–59</strong> → C</span>
          <span><strong>40–49</strong> → D</span>
          <span><strong>&lt;40</strong> → F</span>
        </div>
      </div>

      {/* Marks Interactive Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4 w-36">Score Obtained</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Teacher Note</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                    <p className="mt-2 text-xs">Loading examination grading ledger...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No students found for this examination course cohort.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const marksVal = marksMap[student._id]?.marksObtained || 0;
                  const { grade, result, pct } = calculateGradeHelper(marksVal, selectedExam?.maxMarks || 100);

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
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={selectedExam?.maxMarks || 100}
                            value={marksVal}
                            onChange={(e) => handleScoreChange(student._id, e.target.value)}
                            className="w-20 px-2.5 py-1 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <span className="text-slate-400 text-xs">/ {selectedExam?.maxMarks || 100}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {pct}%
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-bold border border-brand-200">
                          {grade}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-semibold ${result === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {result}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={marksMap[student._id]?.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMarksMap((prev) => ({
                              ...prev,
                              [student._id]: {
                                ...prev[student._id],
                                remarks: val,
                              },
                            }));
                          }}
                          placeholder="Feedback..."
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
