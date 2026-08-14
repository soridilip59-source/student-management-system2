import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import api from '../../services/api';

export const CourseFormModal = ({ isOpen, onClose, course, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'Commerce & Accounting',
    duration: '3 Years',
    description: '',
    assignedTeacher: '',
    subjectsStr: '',
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('/teachers');
        if (res.data.success) {
          setTeachers(res.data.teachers || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        code: course.code || '',
        department: course.department || 'Commerce & Accounting',
        duration: course.duration || '3 Years',
        description: course.description || '',
        assignedTeacher: course.assignedTeacher?._id || course.assignedTeacher || '',
        subjectsStr: course.subjects?.map((s) => s.name).join(', ') || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        department: 'Commerce & Accounting',
        duration: '3 Years',
        description: '',
        assignedTeacher: teachers[0]?._id || '',
        subjectsStr: '',
      });
    }
    setError('');
  }, [course, isOpen, teachers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const subjects = formData.subjectsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, index) => ({
          name,
          code: `${formData.code || 'SUB'}${101 + index}`,
          credits: 3,
        }));

      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        department: formData.department,
        duration: formData.duration,
        description: formData.description,
        assignedTeacher: formData.assignedTeacher || undefined,
        subjects,
      };

      if (course) {
        await api.put(`/courses/${course._id}`, payload);
      } else {
        await api.post('/courses', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? 'Edit Course Program' : 'Create New Course Program'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Bachelor of Commerce (B.Com)"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
            <input
              type="text"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. BCOM101"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Duration *</label>
            <input
              type="text"
              name="duration"
              required
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 3 Years, 4 Years"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
            <input
              type="text"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Commerce & Accounting"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Lead Teacher</label>
            <select
              name="assignedTeacher"
              value={formData.assignedTeacher}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">None Assigned</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subjects / Modules (Comma Separated)
          </label>
          <input
            type="text"
            name="subjectsStr"
            value={formData.subjectsStr}
            onChange={handleChange}
            placeholder="e.g. Financial Accounting, Economics, Statistics, Business Law"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description</label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide brief curriculum objectives..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
