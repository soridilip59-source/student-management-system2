import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, User, Phone, ArrowLeft, ShieldCheck, Shield, BookOpen, Users } from 'lucide-react';

export const RegisterPage = ({ onNavigateLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(formData);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-tr from-brand-600 to-sky-400 rounded-2xl shadow-xl shadow-brand-500/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Create an Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Join EduTrack Academic Management Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Register As Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    formData.role === 'student'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('teacher')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    formData.role === 'teacher'
                      ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Teacher</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    formData.role === 'admin'
                      ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'teacher' ? 'e.g. Dr. Sarah Jenkins' : formData.role === 'admin' ? 'e.g. Administrator' : 'e.g. Rahul Sharma'}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555-0199"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/30 disabled:opacity-50"
            >
              {loading ? 'Registering...' : `Register as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={onNavigateLogin}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
