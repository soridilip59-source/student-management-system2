import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  BookOpen, 
  Edit, 
  Trash2, 
  Award,
  Layers
} from 'lucide-react';
import { TeacherFormModal } from './TeacherFormModal';
import api from '../../services/api';

export const TeacherList = () => {
  const { isAdmin } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);

      const res = await api.get(`/teachers?${params.toString()}`);
      if (res.data.success) {
        setTeachers(res.data.teachers || []);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTeachers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, department]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove faculty member "${name}"?`)) {
      try {
        await api.delete(`/teachers/${id}`);
        fetchTeachers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete faculty member.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Instructors</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic professors, lecturers, and their assigned course cohorts ({teachers.length} total)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingTeacher(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20"
          >
            <UserPlus className="w-4 h-4" /> Add Faculty Member
          </button>
        )}
      </div>

      {/* Search & Department Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, employee ID, or subject..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="w-full sm:w-60">
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Filter by Department..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-2 text-xs">Loading faculty records...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No faculty members found.
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Avatar and Main Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=e0e7ff&color=4338ca`}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/10"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{teacher.name}</h3>
                      <span className="text-[11px] font-semibold text-brand-600">{teacher.employeeId}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{teacher.designation}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTeacher(teacher);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit Teacher"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id, teacher.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Teacher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Qualification & Dept */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.qualification || 'Master Degree'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone || '+1 555-0142'}</span>
                  </div>
                </div>

                {/* Assigned Courses Badges */}
                <div className="mt-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Courses
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.assignedCourses?.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No courses assigned yet</span>
                    ) : (
                      teacher.assignedCourses.map((c) => (
                        <span
                          key={c._id}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-lg"
                        >
                          {c.code || c.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Department Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 truncate">{teacher.department}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {teacher.status || 'Active'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isAdmin && (
        <TeacherFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          teacher={editingTeacher}
          onSaved={fetchTeachers}
        />
      )}
    </div>
  );
};
