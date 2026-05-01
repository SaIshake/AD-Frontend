import { useState, useEffect, useCallback } from 'react';
import { API } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';

function Avatar({ name, photo }) {
  if (photo) {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden border border-theme shadow-lg flex-shrink-0">
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  const colors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-red-600', 'from-cyan-500 to-blue-600'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-current/20 theme-transition`}>
      {initials}
    </div>
  );
}

import CreateUserModal from '../components/modals/CreateUserModal.jsx';

function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({ email: user.email || '', department: user.department || '', title: user.title || '', phone: user.phone || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/users/${user.username}`, form);
      onSuccess('User updated');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Modify Account: ${user.displayName}`}
      subtitle={`Update organizational details for ${user.username}`}
      onClose={onClose}
      footer={
        <div className="flex gap-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 h-12">Cancel</button>
          <button type="submit" form="edit-user-form" className="btn-primary flex-1 h-12" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
        <div><label className="label">Email Address</label><input className="input h-11" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Department</label><input className="input h-11" value={form.department} onChange={e => set('department', e.target.value)} /></div>
          <div><label className="label">Job Title</label><input className="input h-11" value={form.title} onChange={e => set('title', e.target.value)} /></div>
        </div>
        <div><label className="label">Direct Phone</label><input className="input h-11" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        {error && <div className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/10 rounded-xl px-4 py-3 animate-shake">{error}</div>}
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/users/${user.username}/reset-password`, { newPassword: password });
      onSuccess('Password reset successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Reset Credentials"
      subtitle={`Update directory password for ${user.displayName}`}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex gap-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 h-12">Cancel</button>
          <button type="submit" form="reset-password-form" className="btn-primary flex-1 h-12" disabled={loading}>
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
        </div>
      }
    >
      <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">New Directory Password</label>
          <input className="input h-11" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoFocus />
        </div>
        {error && <div className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/10 rounded-xl px-4 py-3 animate-shake">{error}</div>}
      </form>
    </Modal>
  );
}

function UserDetailModal({ user, onClose, onAction }) {
  const { can } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (user?.username) {
      API.get(`/audit?limit=10&user=${user.username}`)
        .then(r => setLogs(r.data.logs))
        .catch(() => { })
        .finally(() => setLoadingLogs(false));
    }
  }, [user?.username]);

  if (!user) return null;

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
    <Modal
      title="User Account Details"
      subtitle="View comprehensive Active Directory identity data"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {can('users:update') && <button onClick={() => onAction('edit', user)} className="btn-secondary text-xs h-10 px-4">Edit Profile</button>}
            {can('users:reset-password') && <button onClick={() => onAction('reset', user)} className="btn-secondary text-xs h-10 px-4">Reset Password</button>}
            {can('users:toggle') && (
              <button onClick={() => onAction('toggle', user)} className="btn-secondary text-xs h-10 px-4">
                {user.isEnabled ? 'Disable Access' : 'Enable Access'}
              </button>
            )}
          </div>
          {can('users:delete') && (
            <button onClick={() => onAction('delete', user)} className="text-xs font-bold text-red-500 hover:bg-red-500/5 px-4 py-2 rounded-lg transition-all uppercase tracking-widest">
              Delete User
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Header Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-theme">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-theme shadow-xl flex-shrink-0">
            {user.photo ? (
              <img src={user.photo} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                {user.displayName?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold text-primary tracking-tight truncate">{user.displayName}</div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="text-xs text-secondary font-black tracking-widest uppercase bg-surface-secondary px-2 py-1 rounded-lg border border-theme">{user.username}</span>
              <span className="text-xs text-zinc-500 font-medium truncate italic">{user.userPrincipalName || user.email}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`badge ${user.isEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} font-black text-[10px]`}>
              {user.isEnabled ? '● ACTIVE' : '○ DISABLED'}
            </span>
            {user.isLockedOut && (
              <span className="badge bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-[10px]">
                ⚠ LOCKED
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization & Manager */}
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1">Organizational Placement</div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Company', value: user.company, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { label: 'Department', value: user.department, icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
                { label: 'Job Title', value: user.title, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label: 'Manager', value: user.manager, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-surface-secondary/40 border border-theme rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-primary flex items-center justify-center text-blue-500 shadow-sm border border-theme">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{label}</div>
                    <div className="text-xs text-primary font-bold mt-0.5">{value || 'Not set'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Status */}
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1">Communication & Compliance</div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Work Phone', value: user.phone, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                { label: 'Mobile Phone', value: user.mobile, icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-surface-secondary/40 border border-theme rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-primary flex items-center justify-center text-indigo-500 shadow-sm border border-theme">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{label}</div>
                    <div className="text-xs text-primary font-bold mt-0.5">{value || 'Not set'}</div>
                  </div>
                </div>
              ))}
              <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-3 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">PWD Never Expires</div>
                  <div className={`text-[10px] font-black inline-block px-2 py-0.5 rounded-md ${user.passwordNeverExpires ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/10'}`}>
                    {user.passwordNeverExpires ? 'ENABLED' : 'DISABLED'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Must Change PWD</div>
                  <div className={`text-[10px] font-black inline-block px-2 py-0.5 rounded-md ${user.mustChangePassword ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'}`}>
                    {user.mustChangePassword ? 'REQUIRED' : 'NO ACTION'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="space-y-6">
          {/* Office Address */}
          <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Registered Office Address
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Street', value: user.address?.street },
                { label: 'City', value: user.address?.city },
                { label: 'State', value: user.address?.state },
                { label: 'Zip', value: user.address?.zip },
                { label: 'Country', value: user.address?.country },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{label}</div>
                  <div className="text-xs text-primary font-bold mt-0.5 truncate">{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Security Groups */}
            <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-5 space-y-4">
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Group Memberships ({user.groups?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.groups?.map(g => (
                  <span key={g} className="px-2.5 py-1 bg-surface-primary border border-theme rounded-lg text-[10px] font-bold text-secondary uppercase tracking-tight">{g}</span>
                ))}
              </div>
            </div>

            {/* Time Stamps & Activity */}
            <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-5 space-y-4">
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Audit Timeline
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Created', value: user.whenCreated ? new Date(user.whenCreated).toLocaleDateString() : '—' },
                  { label: 'Pwd Last Set', value: user.pwdLastSet ? new Date(user.pwdLastSet).toLocaleDateString() : '—' },
                  { label: 'Last Logon', value: user.lastLogon ? new Date(user.lastLogon).toLocaleDateString() : '—' },
                  { label: 'Expires', value: user.accountExpires ? new Date(user.accountExpires).toLocaleDateString() : 'NEVER' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-[10px]">
                    <span className="font-black text-zinc-500 uppercase tracking-widest">{label}</span>
                    <span className="font-bold text-primary">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span className="font-black text-zinc-500 uppercase tracking-widest">Bad PWD Count</span>
                  <span className={`font-black px-2 rounded ${user.badPwdCount > 0 ? 'bg-red-500/10 text-red-500' : 'text-zinc-500'}`}>{user.badPwdCount}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Audit History */}
        <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-3 px-1">Recent Account Activity</div>
          <div className="space-y-2">
            {!loadingLogs && logs.length > 0 ? logs.map(log => (
              <div key={log._id} className="flex items-center gap-3 p-2 bg-surface-primary/30 rounded-lg border border-theme/50">
                <div className={`w-1.5 h-6 rounded-full ${log.success ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-primary truncate">{log.action} <span className="opacity-40 mx-1">→</span> {log.target || 'System'}</div>
                  <div className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">{formatTimeAgo(log.timestamp)}</div>
                </div>
              </div>
            )) : (
              <div className="text-[10px] text-zinc-500 italic px-1 opacity-50">
                {loadingLogs ? 'Loading history...' : 'No activity records found'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2 px-1">Directory Distinguished Name (DN)</div>
          <div className="font-mono text-[10px] text-zinc-500 leading-relaxed break-all bg-surface-primary/30 p-3 rounded-xl border border-theme">
            {user.distinguishedName}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const { can } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, enabled, disabled
  const [modal, setModal] = useState(null); // { type, user? }
  const [toast, setToast] = useState('');

  const loadUsers = useCallback(() => {
    setLoading(true);
    API.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = async (type, user) => {
    setModal(null);
    if (type === 'toggle') {
      try {
        await API.patch(`/users/${user.username}/toggle`, { enable: !user.isEnabled });
        showToast(`User ${!user.isEnabled ? 'enabled' : 'disabled'}`);
        loadUsers();
      } catch (err) {
        showToast(err.response?.data?.message || 'Action failed');
      }
    } else if (type === 'delete') {
      if (!confirm(`Delete user "${user.displayName}"? This cannot be undone.`)) return;
      try {
        await API.delete(`/users/${user.username}`);
        showToast('User deleted');
        loadUsers();
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete user');
      }
    } else {
      setModal({ type, user });
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (filter === 'enabled' && u.isEnabled) || (filter === 'disabled' && !u.isEnabled);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in theme-transition">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl animate-slide-up">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-theme">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Active Directory Users</h1>
          <p className="text-secondary font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Manage Domain User accounts and security credentials
          </p>
        </div>
        {can('users:create') && (
          <button onClick={() => setModal({ type: 'create' })} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Provision New User
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input pl-12 h-12" placeholder="Search by name, username, or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5 bg-surface-secondary/30 border border-theme rounded-xl p-1.5">
          {['all', 'enabled', 'disabled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 text-xs rounded-lg font-bold tracking-widest uppercase transition-all ${filter === f ? 'bg-surface-primary text-primary shadow-sm ring-1 ring-theme' : 'text-secondary hover:text-primary'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden shadow-2xl border-theme">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary/50 border-b border-theme">
              <tr>
                <th className="table-th py-5">Directory Identity</th>
                <th className="table-th text-center">Division</th>
                <th className="table-th text-center">Position</th>
                <th className="table-th text-center">Access State</th>
                <th className="table-th text-center">Groups</th>
                <th className="table-th w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-surface-secondary rounded-xl" /><div className="space-y-2"><div className="w-32 h-4 bg-surface-secondary rounded" /><div className="w-24 h-3 bg-surface-secondary rounded opacity-50" /></div></div></td>
                    {[...Array(4)].map((_, j) => <td key={j} className="px-6 py-5"><div className="w-20 h-3 bg-surface-secondary rounded mx-auto" /></td>)}
                    <td />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="w-16 h-16 bg-surface-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-secondary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="text-primary font-bold tracking-tight">No directory results</div>
                    <p className="text-secondary text-xs mt-1 font-medium">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.username} className="table-row group h-20 transition-all hover:bg-surface-secondary/20 cursor-pointer" onClick={() => setModal({ type: 'detail', user: u })}>
                  <td className="table-td px-6">
                    <div className="flex items-center gap-4">
                      <Avatar name={u.displayName} photo={u.photo} />
                      <div className="min-w-0">
                        <div className="font-bold text-primary tracking-tight truncate group-hover:text-blue-500 transition-colors">{u.displayName}</div>
                        <div className="text-[10px] text-secondary font-bold tracking-widest uppercase mt-0.5">{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-center font-medium text-secondary">{u.department || <span className="opacity-20">—</span>}</td>
                  <td className="table-td text-center font-medium text-secondary">{u.title || <span className="opacity-20">—</span>}</td>
                  <td className="table-td text-center">
                    <span className={`badge ${u.isEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'} font-bold text-[10px]`}>
                      {u.isEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="table-td text-center">
                    <div className="flex justify-center flex-wrap gap-1.5">
                      {u.groups?.slice(0, 2).map(g => (
                        <span key={g} className="badge bg-surface-secondary/80 text-secondary border-theme text-[9px] font-bold uppercase tracking-wider">{g}</span>
                      ))}
                      {u.groups?.length > 2 && <span className="badge bg-surface-primary text-blue-500 border-blue-500/20 text-[9px] font-extrabold">+{u.groups.length - 2}</span>}
                    </div>
                  </td>
                  <td className="table-td px-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                      {can('users:update') && (
                        <button onClick={() => handleAction('edit', u)} className="p-2.5 hover:bg-white dark:hover:bg-surface-primary rounded-xl text-secondary hover:text-blue-500 transition-all shadow-sm hover:shadow-md" title="Modify User Account">
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      )}
                      <button onClick={() => setModal({ type: 'detail', user: u })} className="p-2.5 hover:bg-white dark:hover:bg-surface-primary rounded-xl text-secondary hover:text-primary transition-all shadow-sm hover:shadow-md" title="View Extended Details">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'create' && <CreateUserModal onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadUsers(); }} />}
      {modal?.type === 'edit' && <EditUserModal user={modal.user} onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadUsers(); }} />}
      {modal?.type === 'reset' && <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} onSuccess={showToast} />}
      {modal?.type === 'detail' && <UserDetailModal user={modal.user} onClose={() => setModal(null)} onAction={handleAction} />}
    </div>
  );
}
