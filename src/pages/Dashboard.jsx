import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CreateUserModal from '../components/modals/CreateUserModal.jsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';
import CreateOUModal from '../components/modals/CreateOUModal.jsx';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card p-6 flex items-start gap-4 hover:translate-y--1 transition-transform duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-secondary text-xs font-bold uppercase tracking-widest">{label}</div>
        <div className="text-3xl font-bold text-primary mt-1 tracking-tight">{value}</div>
        {sub && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, can } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const loadData = () => {
    setLoading(true);
    const pStats = API.get('/stats').then(r => setStats(r.data));
    const pLogs = API.get('/audit?limit=5').then(r => setLogs(r.data.logs));
    Promise.allSettled([pStats, pLogs]).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTimeAgo = (at) => {
    const d = new Date(at);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl animate-slide-up">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20" />
          {toast}
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">
            {greeting()}, <span className="text-blue-500">{user?.displayName?.split(' ')[0] || user?.username}</span>
          </h1>
          <p className="text-secondary font-medium mt-2 text-lg">
            Welcome to the Active Directory Management Control Center.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-secondary/50 p-2 rounded-2xl border border-theme shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="pr-4">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Time</div>
            <div className="text-sm font-bold text-primary">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>

      {/* Provisioning Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-full mb--4">
          <h2 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] pl-1">Provisioning Quick Actions</h2>
        </div>

        {can('users:create') && (
          <button
            onClick={() => setModal('user')}
            className="group card p-6 text-left flex items-center gap-5 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <div className="font-bold text-primary text-lg tracking-tight group-hover:text-blue-500 transition-colors">Add New User</div>
              <div className="text-xs text-secondary font-medium opacity-75">Provision directory account</div>
            </div>
          </button>
        )}

        {can('groups:create') && (
          <button
            onClick={() => setModal('group')}
            className="group card p-6 text-left flex items-center gap-5 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <div className="font-bold text-primary text-lg tracking-tight group-hover:text-purple-500 transition-colors">Create Group</div>
              <div className="text-xs text-secondary font-medium opacity-75">Define security distribution</div>
            </div>
          </button>
        )}

        {can('ous:create') && (
          <button
            onClick={() => setModal('ou')}
            className="group card p-6 text-left flex items-center gap-5 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <div>
              <div className="font-bold text-primary text-lg tracking-tight group-hover:text-amber-500 transition-colors">Provision OU</div>
              <div className="text-xs text-secondary font-medium opacity-75">New logical container</div>
            </div>
          </button>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard color="bg-blue-500/10 text-blue-500" label="Active Users" value={stats?.enabledUsers || '...'} sub={`${stats?.disabledUsers || 0} disabled accounts`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard color="bg-purple-500/10 text-purple-500" label="Directory Groups" value={stats?.totalGroups || '...'} sub="Security units" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <StatCard color="bg-amber-500/10 text-amber-500" label="Org Units" value={stats?.totalOUs || '...'} sub="Logical structure" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>} />
        <StatCard color="bg-emerald-500/10 text-emerald-500" label="Server Status" value="Online" sub="DC Synchronization" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
      </div>

      {/* Directory Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-primary tracking-tight">Recent Activity</h3>
            <Link to="/audit" className="text-xs font-bold text-blue-500 hover:underline uppercase tracking-widest">View Full Log</Link>
          </div>
          <div className="card divide-y divide-theme overflow-hidden border-theme">
            {logs?.length > 0 ? logs.map((log) => (
              <div key={log._id} className="p-4 flex items-center gap-4 hover:bg-surface-secondary/30 transition-colors">
                <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-primary font-medium truncate">
                    {log.action} <span className="text-secondary opacity-50 px-1">→</span> {log.target || 'System'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                    {log.performedBy} • {formatTimeAgo(log.timestamp)}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-50">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-primary tracking-tight">Quick Navigation</h3>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Jump to Section</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { to: '/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-500' },
              { to: '/groups', label: 'Groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-purple-500' },
              { to: '/ous', label: 'Org Units', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', color: 'text-amber-500' },
              { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z', color: 'text-zinc-500' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="card p-5 group flex flex-col items-center gap-3 hover:bg-surface-secondary/50 transition-all active:scale-95 border-theme">
                <div className={`p-3 bg-surface-secondary rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'user' && <CreateUserModal onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadData(); }} />}
      {modal === 'group' && <CreateGroupModal onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadData(); }} />}
      {modal === 'ou' && <CreateOUModal onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadData(); }} />}
    </div>
  );
}
