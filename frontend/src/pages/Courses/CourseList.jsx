import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Users, 
  Clock, 
  Layers, 
  Edit, 
  Trash2, 
  GraduationCap
} from 'lucide-react';
import { CourseFormModal } from './CourseFormModal';
import api from '../../services/api';

export const CourseList = () => {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);

      const res = await api.get(`/courses?${params.toString()}`);
      if (res.data.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, department]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete course "${name}"?`)) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete course.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Courses & Academic Programs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curriculum tracks, degree pathways, subjects, and faculty assignments ({courses.length} total)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingCourse(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20"
          >
            <PlusCircle className="w-4 h-4" /> Add Course Program
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title, course code (e.g. BCOM101), or department..."
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

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-2 text-xs">Loading academic course catalog...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No courses found matching your query.
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Badge & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold font-mono bg-brand-50 text-brand-700 border border-brand-200 rounded-lg">
                    {course.code}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit Course"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(course._id, course.name)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {course.description || 'Comprehensive curriculum with specialized core modules.'}
                </p>

                {/* Duration & Dept Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-900">{course.enrolledCount || 0} Students</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="mt-2.5 text-xs text-slate-600 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
                  <span>Lead: <strong className="text-slate-800">{course.assignedTeacher?.name || 'Unassigned'}</strong></span>
                </div>

                {/* Subjects list tags */}
                {course.subjects?.length > 0 && (
                  <div className="mt-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Core Subjects ({course.subjects.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {course.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{course.department}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {course.status || 'Active'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isAdmin && (
        <CourseFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          course={editingCourse}
          onSaved={fetchCourses}
        />
      )}
    </div>
  );
};
