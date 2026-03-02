import { useState, useEffect, useCallback } from 'react';
import { API } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';

import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';

function ManageMembersModal({ group, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    API.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const memberDNs = new Set(group.members || []);
  const members = users.filter(u => u.distinguishedName && memberDNs.has(u.distinguishedName));
  const filtered = members.filter(u => !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addUsername.trim()) return;
    setActionLoading('add');
    try {
      await API.post(`/groups/${group.name}/members`, { username: addUsername });
      onSuccess('User added to group');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add user');
    } finally {
      setActionLoading('');
    }
  };

  const handleRemove = async (username) => {
    setActionLoading(username);
    try {
      await API.delete(`/groups/${group.name}/members/${username}`);
      onSuccess('User removed from group');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Modal
      title="Group Membership"
      subtitle={`Manage directory users assigned to ${group.name}`}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex justify-end">
          <button onClick={onClose} className="btn-secondary px-8 h-12">Close Manager</button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input className="input flex-1 mono h-12" placeholder="Enter username to enroll..." value={addUsername} onChange={e => setAddUsername(e.target.value)} />
          <button type="submit" className="btn-primary h-12 px-6" disabled={actionLoading === 'add'}>
            {actionLoading === 'add' ? 'Adding...' : 'Enroll Member'}
          </button>
        </form>

        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input pl-11 py-2 text-sm h-11" placeholder="Filter current enrolled members..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-14 bg-surface-secondary/50 rounded-xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 bg-surface-secondary/20 border border-theme border-dashed rounded-2xl shadow-inner">
              <div className="text-secondary font-bold text-sm">{members.length === 0 ? 'No active members' : 'No matching results'}</div>
            </div>
          ) : filtered.map(u => (
            <div key={u.username} className="flex items-center gap-4 px-4 py-3 bg-surface-secondary/40 border border-theme rounded-xl hover:bg-surface-secondary/60 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-surface-primary border border-theme flex items-center justify-center text-sm font-bold text-blue-500 shadow-sm group-hover:scale-105 transition-transform">
                {u.displayName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-primary font-bold truncate tracking-tight">{u.displayName}</div>
                <div className="text-[10px] text-secondary font-bold uppercase tracking-widest">{u.username}</div>
              </div>
              <button onClick={() => handleRemove(u.username)} disabled={actionLoading === u.username}
                className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function GroupDetailModal({ group, onClose, onMembers }) {
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  const isSecurity = group.groupType?.type === 'Security';
  const accentColor = isSecurity ? 'blue' : 'amber';

  const handleCopyDN = () => {
    navigator.clipboard.writeText(group.distinguishedName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimeInfo = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    const relative = diff < 60 ? 'Just now' :
      diff < 3600 ? `${Math.floor(diff / 60)}m ago` :
        diff < 86400 ? `${Math.floor(diff / 3600)}h ago` :
          `${Math.floor(diff / 86400)}d ago`;

    return { relative, absolute: d.toLocaleString() };
  };

  const createdTime = formatTimeInfo(group.createdAt);
  const updatedTime = formatTimeInfo(group.updatedAt);

  return (
    <Modal
      title="Group Account Intelligence"
      subtitle="Deep-dive into directory security object metadata"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex gap-4 w-full">
          <button onClick={onClose} className="btn-secondary flex-1 h-12 font-bold uppercase tracking-widest text-xs">Close Analysis</button>
          <button onClick={() => onMembers(group)} className="btn-primary flex-1 h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20">Manage Enrollments</button>
        </div>
      }
    >
      <div className={`space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar border-l-4 border-${accentColor}-500/30 pl-6`}>
        {/* Header Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-theme">
          <div className={`w-20 h-20 rounded-2xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 flex items-center justify-center shadow-xl shadow-${accentColor}-500/5`}>
            {isSecurity ? (
              <svg className={`w-10 h-10 text-${accentColor}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            ) : (
              <svg className={`w-10 h-10 text-${accentColor}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-3xl font-black text-primary tracking-tighter uppercase truncate">{group.name}</div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`badge bg-${accentColor}-500/10 text-${accentColor}-500 border-${accentColor}-500/20 font-black text-[10px] tracking-widest`}>
                {group.groupType?.type || 'DISTRIBUTION'}
              </span>
              <span className="badge bg-zinc-500/10 text-zinc-500 border-zinc-500/20 font-black text-[10px] tracking-widest">
                {group.groupType?.scope || 'GLOBAL'} SCOPE
              </span>
            </div>
          </div>
        </div>

        {/* Quick Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1">Configuration</div>
            <div className="space-y-3">
              <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-4">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-1">SAM Account Name</div>
                <div className="text-sm text-primary font-bold font-mono">{group.sAMAccountName}</div>
              </div>
              <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-4">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-1">Managed By</div>
                <div className="text-sm text-primary font-bold">{group.managedBy || 'N/A — No custodian assigned'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1">Audit Trail</div>
            <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-4 flex flex-col justify-between h-[108px]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Date Provisioned</span>
                <span className="text-xs text-primary font-bold" title={createdTime.absolute}>{createdTime.relative}</span>
              </div>
              <div className="flex justify-between items-center border-t border-theme pt-3">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Last Update</span>
                <span className="text-xs text-primary font-bold" title={updatedTime.absolute}>{updatedTime.relative}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {group.description && (
          <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Object Description
            </div>
            <div className="text-sm text-zinc-500 font-medium italic leading-relaxed">
              "{group.description}"
            </div>
          </div>
        )}

        {/* Distinguished Name */}
        <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-5 group/dn relative">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2">Canonical LDAP Path</div>
          <div className="font-mono text-[10px] text-zinc-500 break-all leading-relaxed pr-10">
            {group.distinguishedName}
          </div>
          <button
            onClick={handleCopyDN}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-primary rounded-xl transition-all border border-transparent hover:border-theme shadow-sm"
          >
            {copied ? (
              <span className="text-[10px] font-black text-emerald-500 px-1">COPIED!</span>
            ) : (
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            )}
          </button>
        </div>

        {/* Membership Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1 flex items-center justify-between">
              <span>Direct Members</span>
              <span className="badge bg-zinc-500/10 text-zinc-500 border-zinc-500/10">{group.memberCount}</span>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {group.members?.length > 0 ? group.members.map((m, i) => {
                const cn = m.match(/^CN=([^,]+)/i)?.[1] || m;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface-primary/50 border border-theme rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-theme flex items-center justify-center text-[10px] font-black text-blue-500 uppercase">
                      {cn.charAt(0)}
                    </div>
                    <div className="text-[10px] font-bold text-primary truncate flex-1">{cn}</div>
                  </div>
                );
              }) : (
                <div className="text-[10px] text-zinc-500 italic py-4 pl-1 opacity-50">Empty organization population</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1">Inheritance (Member Of)</div>
            <div className="flex flex-wrap gap-2">
              {group.memberOf?.length > 0 ? group.memberOf.map((g, i) => (
                <span key={i} className="px-3 py-1.5 bg-surface-secondary/50 border border-theme rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-tight shadow-sm">
                  {g}
                </span>
              )) : (
                <div className="text-[10px] text-zinc-500 italic py-4 pl-1 opacity-50 text-center w-full">No detected parent memberships</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function GroupsPage() {
  const { can } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const loadGroups = useCallback(() => {
    setLoading(true);
    API.get('/groups').then(r => setGroups(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDelete = async (group) => {
    if (!confirm(`Delete group "${group.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/groups/${group.name}`);
      showToast('Group deleted');
      loadGroups();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = groups.filter(g =>
    !search || g.name?.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in theme-transition">
      {/* ToastNotification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl animate-slide-up">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-theme">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Active Directory Groups</h1>
          <p className="text-secondary font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Manage groups, security distributions, and memberships
          </p>
        </div>
        {can('groups:create') && (
          <button onClick={() => setModal({ type: 'create' })} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Provision New Group
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="input pl-12 h-12" placeholder="Search directory group library..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-surface-secondary/30" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-surface-secondary/20 border-2 border-theme border-dashed rounded-3xl">
            <div className="text-primary font-bold tracking-tight">No directory results</div>
            <p className="text-secondary text-sm mt-1">Try broadening your search criteria</p>
          </div>
        ) : filtered.map(g => (
          <div key={g.name}
            className="card group p-6 flex flex-col gap-4 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all theme-transition cursor-pointer active:scale-[0.99]"
            onClick={() => setModal({ type: 'detail', group: g })}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${g.groupType?.type === 'Security' ? 'blue' : 'amber'}-500/10 border border-${g.groupType?.type === 'Security' ? 'blue' : 'amber'}-500/20 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  {g.groupType?.type === 'Security' ? (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  ) : (
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div>
                  <div className={`font-bold text-primary tracking-tight group-hover:text-${g.groupType?.type === 'Security' ? 'blue' : 'amber'}-500 transition-colors uppercase text-sm mb-0.5`}>{g.name}</div>
                  <div className="flex gap-1.5 items-center">
                    <div className="text-[9px] text-zinc-500 font-black tracking-widest bg-zinc-500/10 px-1.5 py-0.5 rounded uppercase">
                      {g.groupType?.scope || 'Global'}
                    </div>
                    <div className="text-[10px] text-secondary font-bold tracking-widest bg-surface-secondary px-2 py-0.5 rounded-md flex items-center gap-1.5 w-max">
                      <span className={`w-1 h-1 rounded-full bg-${g.groupType?.type === 'Security' ? 'blue' : 'amber'}-500`} />
                      {g.memberCount} MEMBERS
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                {can('groups:manage-members') && (
                  <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'members', group: g }); }} className="p-2.5 bg-surface-primary border border-theme hover:text-blue-500 rounded-xl transition-all shadow-sm hover:shadow-md" title="Manage Membership">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </button>
                )}
                {can('groups:delete') && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(g); }} className="p-2.5 bg-surface-primary border border-theme hover:text-red-500 rounded-xl transition-all shadow-sm hover:shadow-md" title="Decommission Group">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
            {g.description && <p className="text-xs text-secondary font-medium leading-relaxed line-clamp-2 opacity-80">{g.description}</p>}
            <div className="mt-auto pt-4 border-t border-theme/50 flex flex-col gap-0.5">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Canonical Identity</span>
              <div className="font-mono text-[10px] text-zinc-400 truncate opacity-60 hover:opacity-100 transition-opacity cursor-default">{g.distinguishedName}</div>
            </div>
          </div>
        ))}
      </div>

      {modal?.type === 'create' && <CreateGroupModal onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadGroups(); }} />}
      {modal?.type === 'detail' && <GroupDetailModal group={modal.group} onClose={() => setModal(null)} onMembers={g => setModal({ type: 'members', group: g })} />}
      {modal?.type === 'members' && <ManageMembersModal group={modal.group} onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadGroups(); }} />}
    </div>
  );
}
