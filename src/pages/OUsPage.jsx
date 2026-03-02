import { useState, useEffect, useCallback } from 'react';
import { API } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';

import CreateOUModal from '../components/modals/CreateOUModal.jsx';

import {
  Folder,
  ChevronRight,
  Users,
  Shield,
  Clock,
  MapPin,
  Copy,
  Check,
  Info,
  LayoutGrid,
  Settings,
  Monitor
} from 'lucide-react';

function OUDetailModal({ ou, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!ou) return null;

  const handleCopyDN = () => {
    navigator.clipboard.writeText(ou.distinguishedName);
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

  const createdTime = formatTimeInfo(ou.createdAt);
  const updatedTime = formatTimeInfo(ou.updatedAt);

  return (
    <Modal
      title="OU Hierarchy Analysis"
      subtitle="Comprehensive view of container identity and child objects"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1 h-12 font-bold uppercase tracking-widest text-xs">Dismiss Analysis</button>
        </div>
      }
    >
      <div className="space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar border-l-4 border-amber-500/30 pl-6">

        {/* Breadcrumb Path */}
        <div className="flex items-center flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-surface-secondary/30 p-3 rounded-xl border border-theme">
          <MapPin size={12} className="text-amber-500" />
          {ou.path?.map((node, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={i === ou.path.length - 1 ? 'text-amber-500 font-black' : 'opacity-60'}>{node}</span>
              {i < ou.path.length - 1 && <ChevronRight size={10} className="opacity-30" />}
            </div>
          ))}
        </div>

        {/* Header Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-theme">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xl shadow-amber-500/5">
            <Folder size={40} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-3xl font-black text-primary tracking-tighter uppercase truncate">{ou.name}</div>
            <div className="badge bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-[10px] tracking-widest mt-2">
              ORGANIZATIONAL UNIT
            </div>
          </div>
        </div>

        {/* Contents Summary (Stat Cards) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-5 flex items-center gap-4 group hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-0.5">Users</div>
              <div className="text-2xl font-black text-primary tracking-tight">{ou.userCount || 0}</div>
            </div>
          </div>
          <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-5 flex items-center gap-4 group hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-0.5">Groups</div>
              <div className="text-2xl font-black text-primary tracking-tight">{ou.groupCount || 0}</div>
            </div>
          </div>
          <div className="bg-surface-secondary/40 border border-theme rounded-2xl p-5 flex items-center gap-4 group hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Monitor size={24} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-0.5">Computers</div>
              <div className="text-2xl font-black text-primary tracking-tight">{ou.computerCount || 0}</div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1 flex items-center gap-2">
              <Info size={14} className="text-amber-500" /> Administrative Info
            </div>
            <div className="space-y-3">
              {ou.description && (
                <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-4">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-1">Description</div>
                  <div className="text-sm text-zinc-500 font-medium italic italic">"{ou.description}"</div>
                </div>
              )}
              <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-4">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-1 tracking-widest">Managed By</div>
                <div className="text-sm text-primary font-bold">{ou.managedBy || 'N/A — No custodian assigned'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1 flex items-center gap-2">
              <Clock size={14} className="text-amber-500" /> Time Metrics
            </div>
            <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-4 flex flex-col justify-between h-[108px]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Registered</span>
                <span className="text-xs text-primary font-bold" title={createdTime.absolute}>{createdTime.relative}</span>
              </div>
              <div className="flex justify-between items-center border-t border-theme pt-3">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Last Update</span>
                <span className="text-xs text-primary font-bold" title={updatedTime.absolute}>{updatedTime.relative}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distinguished Name */}
        <div className="bg-surface-secondary/20 border border-theme rounded-2xl p-5 group/dn relative">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2 flex items-center gap-2">
            <LayoutGrid size={12} className="text-amber-500" /> Canonical Identity path
          </div>
          <div className="font-mono text-[10px] text-zinc-500 break-all leading-relaxed pr-10">
            {ou.distinguishedName}
          </div>
          <button
            onClick={handleCopyDN}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-primary rounded-xl transition-all border border-transparent hover:border-theme shadow-sm"
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} className="text-secondary opacity-60 hover:opacity-100" />
            )}
          </button>
        </div>

        {/* Child OUs & Linked GPOs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1 flex items-center justify-between">
              <span>Logical Child Units</span>
              <span className="badge bg-amber-500/10 text-amber-500 border-amber-500/10">{(ou.childOUs || []).length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ou.childOUs?.length > 0 ? ou.childOUs.map((child, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-surface-secondary/40 border border-theme rounded-xl text-[10px] font-black text-amber-500 uppercase tracking-tight shadow-sm">
                  <Folder size={10} />
                  {child}
                </div>
              )) : (
                <div className="text-[10px] text-zinc-500 italic py-4 pl-1 opacity-50">No nested directory containers</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black pl-1 flex items-center justify-between">
              <span>Policy Assignments (GPO)</span>
              <span className="badge bg-emerald-500/10 text-emerald-500 border-emerald-500/10">{(ou.linkedGPOs || []).length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ou.linkedGPOs?.length > 0 ? ou.linkedGPOs.map((gpo, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-tight shadow-sm">
                  <Settings size={10} />
                  {gpo.length > 20 ? gpo.substring(0, 20) + '...' : gpo}
                </div>
              )) : (
                <div className="text-[10px] text-zinc-500 italic py-4 pl-1 opacity-50">No policies linked to this container</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function OUsPage() {
  const { can } = useAuth();
  const [ous, setOus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { type, ou? }
  const [toast, setToast] = useState('');

  const loadOUs = useCallback(() => {
    setLoading(true);
    API.get('/ous').then(r => setOus(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOUs(); }, [loadOUs]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = ous.filter(o =>
    !search || o.name?.toLowerCase().includes(search.toLowerCase()) || o.distinguishedName?.toLowerCase().includes(search.toLowerCase())
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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-theme">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Organizational Units</h1>
          <p className="text-secondary font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Manage domain logical structure and hierarchy
          </p>
        </div>
        {can('ous:create') && (
          <button onClick={() => setModal({ type: 'create' })} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Provision New OU
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="input pl-12 h-12" placeholder="Search directory hierarchy..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden shadow-2xl border-theme">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary/50 border-b border-theme">
              <tr>
                <th className="table-th py-5">Organizational Identity</th>
                <th className="table-th">Description</th>
                <th className="table-th">Distinguished Name</th>
                <th className="table-th text-center">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-surface-secondary rounded-xl" /><div className="w-32 h-4 bg-surface-secondary rounded" /></div></td>
                    <td className="px-6 py-5"><div className="w-40 h-3 bg-surface-secondary rounded" /></td>
                    <td className="px-6 py-5"><div className="w-56 h-3 bg-surface-secondary rounded opacity-50" /></td>
                    <td className="px-6 py-5"><div className="w-20 h-3 bg-surface-secondary rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="w-16 h-16 bg-surface-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-secondary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="text-primary font-bold tracking-tight">No OU results</div>
                    <p className="text-secondary text-xs mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : filtered.map(o => (
                <tr key={o.distinguishedName}
                  className="table-row group h-20 hover:bg-surface-secondary/20 transition-all cursor-pointer"
                  onClick={() => setModal({ type: 'detail', ou: o })}
                >
                  <td className="table-td px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm shadow-amber-500/5">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                      </div>
                      <span className="font-bold text-primary tracking-tight group-hover:text-blue-500 transition-colors uppercase text-sm">{o.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-secondary font-medium italic opacity-80">{o.description || <span className="opacity-20 not-italic">—</span>}</td>
                  <td className="table-td max-w-xs">
                    <div className="font-mono text-[10px] text-secondary truncate bg-surface-secondary/30 px-2 py-1 rounded-md border border-theme/50 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-all">
                      {o.distinguishedName}
                    </div>
                  </td>
                  <td className="table-td text-center text-secondary font-bold text-[10px] tracking-widest">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.type === 'create' && <CreateOUModal onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadOUs(); }} />}
      {modal?.type === 'detail' && <OUDetailModal ou={modal.ou} onClose={() => setModal(null)} />}
    </div>
  );
}
