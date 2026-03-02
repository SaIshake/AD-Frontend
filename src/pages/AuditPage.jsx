import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';

const ACTION_COLORS = {
  login: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  login_failed: 'text-red-500 bg-red-500/10 border-red-500/20',
  login_denied: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  logout: 'text-secondary bg-surface-secondary border-theme',
  createUser: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  updateUser: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  deleteUser: 'text-red-500 bg-red-500/10 border-red-500/20',
  enableUser: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  disableUser: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  resetPassword: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  createGroup: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  deleteGroup: 'text-red-500 bg-red-500/10 border-red-500/20',
  addToGroup: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  removeFromGroup: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  createOU: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 30 });
    if (filterAction) params.append('action', filterAction);
    if (filterUser) params.append('user', filterUser);
    API.get(`/audit?${params}`).then(r => {
      setLogs(r.data.logs);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [page, filterAction, filterUser]);

  const uniqueActions = ['login', 'logout', 'login_failed', 'login_denied', 'createUser', 'updateUser', 'deleteUser', 'resetPassword', 'enableUser', 'disableUser', 'createGroup', 'deleteGroup', 'addToGroup', 'removeFromGroup', 'createOU'];

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in theme-transition">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-theme">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Audit Journal</h1>
          <p className="text-secondary font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            {total} directory events recorded in the immutable log
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Monitoring Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-secondary/20 p-4 border border-theme rounded-2xl">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <input className="input pl-11 h-11" placeholder="Search actor username..." value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }} />
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <select className="input pl-11 h-11 appearance-none cursor-pointer" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
            <option value="">All system actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Log table */}
      <div className="card overflow-hidden shadow-2xl border-theme">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary/50 border-b border-theme">
              <tr>
                <th className="table-th py-5">Event Timeline</th>
                <th className="table-th">Executor</th>
                <th className="table-th">System Event</th>
                <th className="table-th">Object Target</th>
                <th className="table-th text-center">Result</th>
                <th className="table-th">Network Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="w-24 h-3 bg-surface-secondary rounded" /></td>
                    <td className="px-6 py-5"><div className="w-20 h-3 bg-surface-secondary rounded" /></td>
                    <td className="px-6 py-5"><div className="w-28 h-6 bg-surface-secondary rounded-lg" /></td>
                    <td className="px-6 py-5"><div className="w-32 h-3 bg-surface-secondary rounded opacity-50" /></td>
                    <td className="px-6 py-5 text-center"><div className="w-16 h-3 bg-surface-secondary rounded mx-auto" /></td>
                    <td className="px-6 py-5"><div className="w-24 h-3 bg-surface-secondary rounded opacity-50" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center">
                    <div className="w-20 h-20 bg-surface-secondary/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-theme">
                      <svg className="w-10 h-10 text-secondary opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="text-primary font-bold tracking-tight text-lg">No audit events matches</div>
                    <p className="text-secondary text-sm mt-1 max-w-xs mx-auto">Either no logs have been recorded yet or your filters are too restrictive.</p>
                  </td>
                </tr>
              ) : logs.map((log, i) => (
                <tr key={log._id || i} className="table-row hover:bg-surface-secondary/20 transition-all group">
                  <td className="table-td px-6 whitespace-nowrap text-[11px] font-bold text-secondary uppercase tracking-tight">{timeAgo(log.timestamp)}</td>
                  <td className="table-td font-mono text-[11px] text-primary font-bold px-6">{log.performedBy}</td>
                  <td className="table-td px-6">
                    <span className={`badge border text-[9px] font-bold tracking-widest uppercase transition-transform group-hover:scale-105 ${ACTION_COLORS[log.action] || 'text-secondary bg-surface-secondary border-theme'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="table-td px-6">
                    <div className="font-mono text-[10px] text-secondary truncate max-w-xs group-hover:text-primary transition-colors italic opacity-70 group-hover:opacity-100">{log.target}</div>
                  </td>
                  <td className="table-td text-center px-6">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-md">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/5 px-2 py-1 rounded-md" title={log.error}>
                        <span className="w-1 h-1 rounded-full bg-red-500" />
                        Failure
                      </span>
                    )}
                  </td>
                  <td className="table-td font-mono text-[10px] text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity px-6">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 30 && (
          <div className="px-8 py-6 bg-surface-secondary/30 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] font-bold text-secondary tracking-widest uppercase">
              Page <span className="text-primary">{page}</span> of <span className="text-primary">{Math.ceil(total / 30)}</span> registry views
            </span>
            <div className="flex gap-3">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="btn-secondary text-[10px] font-bold uppercase tracking-widest py-2 px-6 rounded-xl disabled:opacity-20 flex items-center gap-2 group">
                <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 30)}
                className="btn-secondary text-[10px] font-bold uppercase tracking-widest py-2 px-6 rounded-xl disabled:opacity-20 flex items-center gap-2 group">
                Next
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
