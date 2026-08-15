import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Users, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  GraduationCap
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import api from '../../services/api';

export const StudentList = () => {
  const { isAdmin, isTeacher } = useAuth();
  const canManageStudents = isAdmin || isTeacher;
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal states
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCourse) params.append('course', selectedCourse);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedGender) params.append('gender', selectedGender);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.students || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalStudents(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setCourses(res.data.courses || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCourse, selectedStatus, selectedGender, page]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? All associated attendance and marks records will also be permanently deleted.`)) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student.');
      }
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('sms_token');
    const params = new URLSearchParams();
    if (selectedCourse) params.append('course', selectedCourse);
    if (selectedStatus) params.append('status', selectedStatus);

    window.open(`/api/reports/students/csv?${params.toString()}&token=${token}`, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Graduated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Suspended':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Students Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, academic standing, and profiles ({totalStudents} total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-subtle"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          {canManageStudents && (
            <button
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20"
            >
              <UserPlus className="w-4 h-4" /> Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student name, ID, email, or department..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Course Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-36">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div className="w-full md:w-32">
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                    <p className="mt-2 text-xs">Loading student records...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No students found matching current criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e0f2fe&color=0369a1`}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {student.studentId}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{student.course?.name || 'N/A'}</span>
                      <span className="block text-[10px] text-slate-500">{student.course?.code}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {student.department}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentId(student._id);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManageStudents && (
                          <button
                            onClick={() => {
                              setEditingStudent(student);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(student._id, student.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="border-t border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalStudents}
            limit={10}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {/* Modals */}
      <StudentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        studentId={selectedStudentId}
      />

      {canManageStudents && (
        <StudentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          student={editingStudent}
          onSaved={fetchStudents}
        />
      )}
    </div>
  );
};
