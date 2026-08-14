import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Search, 
  User, 
  Clock, 
  CheckCircle2, 
  Layers,
  FileText
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import api from '../../services/api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedModule) params.append('module', selectedModule);
      params.append('page', page);
      params.append('limit', 15);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalLogs(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule, page]);

  const getModuleBadge = (module) => {
    switch (module) {
      case 'STUDENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ATTENDANCE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MARKS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COURSE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AUTH':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Audit & Compliance Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of record creations, grade entries, attendance submissions, and modifications ({totalLogs} events)
          </p>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Functional Modules</option>
            <option value="STUDENT">Student Management</option>
            <option value="ATTENDANCE">Attendance Tracking</option>
            <option value="MARKS">Marks & Grading</option>
            <option value="COURSE">Courses & Programs</option>
            <option value="TEACHER">Faculty Management</option>
            <option value="AUTH">Authentication</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Activity Description</th>
                <th className="py-3 px-4">Initiated By</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                    <p className="mt-2 text-xs">Loading audit trail...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.action}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getModuleBadge(log.module)}`}>
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {log.details}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{log.performedBy?.name || 'System'}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{log.performerRole || 'Automated'}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalLogs}
            limit={15}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
};
