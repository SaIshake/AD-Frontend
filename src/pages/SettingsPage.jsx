import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API } from '../context/AuthContext.jsx';

// ── Permission checkbox group ──────────────────────────────────────
function PermissionGroup({ group, selected, onChange }) {
  const allChecked = group.permissions.every(p => selected.includes(p));
  const someChecked = group.permissions.some(p => selected.includes(p));

  const toggleGroup = () => {
    if (allChecked) {
      onChange(selected.filter(p => !group.permissions.includes(p)));
    } else {
      onChange([...new Set([...selected, ...group.permissions])]);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-surface-primary/50 border border-theme rounded-xl transition-all hover:bg-surface-primary">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={allChecked}
          ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
          onChange={toggleGroup}
          className="w-5 h-5 rounded-md border-theme bg-surface-secondary text-blue-600 focus:ring-blue-500/20 transition-all checked:bg-blue-600 cursor-pointer"
        />
        <span className="text-sm font-bold text-primary tracking-tight">{group.label}</span>
      </div>
      <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.permissions.map(p => (
          <label key={p} className="flex items-center gap-2.5 group cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(p)}
              onChange={e => {
                if (e.target.checked) onChange([...selected, p]);
                else onChange(selected.filter(x => x !== p));
              }}
              className="w-4 h-4 rounded border-theme bg-surface-secondary text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
            />
            <span className="text-xs text-secondary group-hover:text-primary transition-colors font-medium">{p}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Role Mapping Modal ─────────────────────────────────────────────
function RoleMappingModal({ mapping, permissionGroups, availableADGroups, onClose, onSave }) {
  const isEdit = !!mapping;
  const [form, setForm] = useState({
    adGroup: mapping?.adGroup || '',
    label: mapping?.label || '',
    permissions: mapping?.permissions || [],
    isActive: mapping?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(mapping?.adGroup || '');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter groups based on search text
  const filteredGroups = (availableADGroups || [])
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 100);

  const handleSubmit = async () => {
    if (!form.adGroup.trim()) return setError('AD Group name is required');
    if (!form.permissions.length) return setError('Select at least one permission');

    setError('');
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mapping');
    } finally {
      setLoading(false);
    }
  };

  const selectAll = () => {
    const all = permissionGroups.flatMap(g => g.permissions);
    setForm(f => ({ ...f, permissions: all }));
  };

  const clearAll = () => setForm(f => ({ ...f, permissions: [] }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-primary border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-theme">
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight">
              {isEdit ? 'Edit Role Mapping' : 'New Role Mapping'}
            </h2>
            <p className="text-xs text-secondary mt-1 font-medium">Configure access control for AD groups</p>
          </div>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary hover:bg-surface-secondary rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
          {/* AD Group Selection */}
          <div className="relative">
            <label className="label">AD Group Name</label>

            {isEdit ? (
              <div className="w-full bg-surface-secondary border border-theme rounded-xl px-4 py-3 text-sm text-secondary font-bold tracking-tight">
                {form.adGroup}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="input pl-11"
                  placeholder="Search Active Directory groups..."
                  value={search}
                  onFocus={() => setShowDropdown(true)}
                  onChange={e => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                />

                {showDropdown && (search.length > 0 || filteredGroups.length > 0) && (
                  <div className="absolute z-50 w-full mt-2 bg-surface-primary border border-theme rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto glass">
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map(g => (
                        <button
                          key={g.distinguishedName}
                          className="w-full text-left px-5 py-3 text-sm text-secondary hover:bg-surface-secondary hover:text-primary transition-all flex flex-col gap-0.5"
                          onClick={() => {
                            setForm(f => ({ ...f, adGroup: g.name }));
                            setSearch(g.name);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="font-bold tracking-tight text-primary">{g.name}</span>
                          {g.description && <span className="text-[10px] text-zinc-500 font-medium truncate italic">{g.description}</span>}
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-6 text-sm text-zinc-500 italic text-center font-medium">
                        No matching groups found in Directory
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {!isEdit && <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest pl-1">Assign permissions to this Active Directory group</p>}
          </div>

          {/* Label */}
          <div>
            <label className="label">Display Label (Optional)</label>
            <input
              className="input"
              placeholder="e.g. Help Desk Admins"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            />
          </div>

          {/* Active toggle */}
          {isEdit && (
            <div className="flex items-center justify-between p-4 bg-surface-secondary/50 border border-theme rounded-2xl">
              <div>
                <span className="block text-sm text-primary font-bold tracking-tight">Mapping Status</span>
                <span className="block text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">Active or Inactive</span>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner ${form.isActive ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Permissions Mapping</label>
              <div className="flex gap-4">
                <button type="button" onClick={selectAll} className="text-xs font-bold text-blue-500 hover:text-blue-400 active:scale-95 transition-all">SELECT ALL</button>
                <button type="button" onClick={clearAll} className="text-xs font-bold text-zinc-400 hover:text-zinc-500 active:scale-95 transition-all">CLEAR ALL</button>
              </div>
            </div>
            <div className="bg-surface-secondary/30 border border-theme rounded-2xl p-6 space-y-6 max-h-[350px] overflow-y-auto theme-transition">
              {permissionGroups.map(group => (
                <PermissionGroup
                  key={group.label}
                  group={group}
                  selected={form.permissions}
                  onChange={perms => setForm(f => ({ ...f, permissions: perms }))}
                />
              ))}
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Access Controls</span>
              <span className="text-[11px] text-blue-500 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md">{form.permissions.length} PERMISSION(S) SELECTED</span>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-2 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-theme flex gap-4 bg-surface-secondary/10">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Mapping'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Mapping Modal ─────────────────────────────────────────────
function ViewMappingModal({ mapping, permissionGroups, onClose, onEdit, canManage }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-primary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-theme">
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight">{mapping.label || mapping.adGroup}</h2>
            <p className="text-xs text-secondary font-bold tracking-widest uppercase mt-1">{mapping.adGroup}</p>
          </div>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary hover:bg-surface-secondary rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-secondary/50 border border-theme rounded-2xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mapping.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-400'}`} />
                <span className="text-sm text-primary font-bold">{mapping.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="bg-surface-secondary/50 border border-theme rounded-2xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Permissions</div>
              <div className="text-sm text-primary font-bold">{mapping.permissions.length} Assigned</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 pl-1">Detailed Access Permissions</div>
            <div className="space-y-4">
              {permissionGroups.map(group => {
                const groupPerms = group.permissions.filter(p => mapping.permissions.includes(p));
                if (groupPerms.length === 0) return null;
                return (
                  <div key={group.label} className="bg-surface-secondary/30 border border-theme rounded-2xl p-5">
                    <div className="text-xs font-bold text-primary mb-3 flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {group.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {groupPerms.map(p => (
                        <span key={p} className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-theme flex gap-4 bg-surface-secondary/10">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 justify-center"
          >
            Close
          </button>
          {canManage && (
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="btn-primary flex-1 justify-center"
            >
              Edit Mapping
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────
export default function SettingsPage() {
  const { can } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [availableADGroups, setAvailableADGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', mapping? }
  const [viewModal, setViewModal] = useState(null); // null | mapping
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, adGroupsRes] = await Promise.all([
        API.get('/settings/roles'),
        API.get('/settings/permissions'),
        API.get('/groups'),
      ]);
      setMappings(rolesRes.data.mappings);
      setPermissionGroups(permsRes.data.groups);

      // Filter groups that are already mapped
      const mappedNames = rolesRes.data.mappings.map(m => m.adGroup.toLowerCase());
      const filtered = adGroupsRes.data.filter(g => !mappedNames.includes(g.name.toLowerCase()));
      setAvailableADGroups(filtered);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => {
    if (modal.mode === 'create') {
      await API.post('/settings/roles', form);
      showToast('Role mapping created');
    } else {
      await API.put(`/settings/roles/${modal.mapping._id}`, form);
      showToast('Role mapping updated');
    }
    await fetchData();
  };

  const handleDelete = async (e, mapping) => {
    e.stopPropagation();
    setDeleteTarget(mapping);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/settings/roles/${deleteTarget._id}`);
      showToast('Role mapping deleted');
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-fade-in theme-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-theme">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Role Mappings</h1>
          <p className="text-secondary font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Synchronize Active Directory groups with application permissions
          </p>
        </div>
        {can('settings:manage') && (
          <button
            type="button"
            onClick={() => setModal({ mode: 'create' })}
            className="btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Mapping
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 text-sm text-blue-600 dark:text-blue-400 shadow-sm glass">
        <div className="p-2 bg-blue-500/10 rounded-xl flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="leading-relaxed font-medium">
          Access Policy: Users must be members of the <span className="font-bold underline">webappaccess</span> group to authenticate.
          Individual permissions are aggregated from all active mappings below.
          <span className="block mt-1 opacity-75 font-bold uppercase tracking-widest text-[10px]">Changes synchronize on next session login</span>
        </div>
      </div>

      {/* Mappings table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-32 bg-surface-secondary/20 border-2 border-theme border-dashed rounded-3xl animate-fade-in">
          <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-xl font-bold text-primary">No role mappings yet</div>
          <p className="text-sm text-secondary mt-2 max-w-[320px] mx-auto font-medium leading-relaxed">Create a mapping to link Active Directory groups with specific application authorization levels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mappings.map(mapping => (
            <div
              key={mapping._id}
              onClick={() => setViewModal(mapping)}
              className={`group card p-6 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.995] theme-transition ${!mapping.isActive ? 'opacity-60 saturate-50' : ''}`}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-primary tracking-tight group-hover:text-blue-500 transition-colors">{mapping.adGroup}</span>
                    {mapping.label && mapping.label !== mapping.adGroup && (
                      <span className="text-sm text-secondary font-semibold bg-surface-secondary px-2.5 py-0.5 rounded-lg">— {mapping.label}</span>
                    )}
                    {!mapping.isActive && (
                      <span className="badge bg-zinc-200 dark:bg-zinc-800 text-zinc-500">Disabled</span>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {mapping.permissions.slice(0, 6).map(p => (
                      <span key={p} className="text-[10px] bg-surface-secondary text-secondary border border-theme px-2.5 py-1 rounded-md font-bold uppercase tracking-wider group-hover:border-blue-500/20 transition-all">
                        {p}
                      </span>
                    ))}
                    {mapping.permissions.length > 6 && (
                      <span className="text-[10px] text-zinc-400 font-bold bg-surface-secondary px-2.5 py-1 rounded-md border border-theme uppercase tracking-wider">
                        +{mapping.permissions.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  {can('settings:manage') && (
                    <div className="flex items-center gap-2 bg-surface-secondary/50 p-1.5 rounded-xl border border-theme shadow-sm">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModal({ mode: 'edit', mapping }); }}
                        className="p-2.5 text-secondary hover:text-blue-500 hover:bg-white dark:hover:bg-surface-primary rounded-lg transition-all shadow-sm hover:shadow-md active:scale-90"
                        title="Edit Configuration"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, mapping)}
                        className="p-2.5 text-secondary hover:text-red-500 hover:bg-white dark:hover:bg-surface-primary rounded-lg transition-all shadow-sm hover:shadow-md active:scale-90"
                        title="Remove Mapping"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="p-3 text-secondary group-hover:text-blue-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <ViewMappingModal
          mapping={viewModal}
          permissionGroups={permissionGroups}
          onClose={() => setViewModal(null)}
          onEdit={() => setModal({ mode: 'edit', mapping: viewModal })}
          canManage={can('settings:manage')}
        />
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <RoleMappingModal
          mapping={modal.mapping}
          permissionGroups={permissionGroups}
          availableADGroups={availableADGroups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-primary border border-theme rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary text-center tracking-tight mb-2">Delete Mapping?</h3>
            <p className="text-sm text-secondary text-center font-medium mb-8 leading-relaxed">
              Are you sure you want to remove the mapping for <span className="font-bold text-primary underline">{deleteTarget.adGroup}</span>?
              This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={confirmDelete}
                className="btn-danger w-full justify-center py-3">
                Confirm Delete
              </button>
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="btn-secondary w-full justify-center py-3">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3 z-50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {toast}
        </div>
      )}
    </div>
  );
}
