import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useState, useEffect } from 'react';
import CreateUserModal from './modals/CreateUserModal.jsx';
import CreateGroupModal from './modals/CreateGroupModal.jsx';
import CreateOUModal from './modals/CreateOUModal.jsx';

const navItems = [
  {
    to: '/', label: 'Dashboard', exact: true,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    permission: null,
  },
  {
    to: '/users', label: 'Users', exact: false,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    permission: 'users:read',
  },
  {
    to: '/groups', label: 'Groups', exact: false,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    permission: 'groups:read',
  },
  {
    to: '/ous', label: 'Org Units', exact: false,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    permission: 'ous:read',
  },
  {
    to: '/audit', label: 'Audit Log', exact: false,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    permission: 'audit:read',
  },
  {
    to: '/settings', label: 'Settings', exact: false,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    permission: 'settings:read',
  },
  {
    to: '/profile', label: 'My Profile', exact: false,
    icon: (
      <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    permission: null,
  },
];

export default function Layout() {
  const { user, logout, can } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dcStatus, setDcStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await API.get('/status');
        setDcStatus(data.online ? 'online' : 'offline');
      } catch (err) {
        setDcStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-primary theme-transition">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface-secondary border-r border-theme flex flex-col shadow-xl z-20">
        {/* Brand */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-base font-bold text-primary tracking-tight">AD Manager</div>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-500 border
                  ${dcStatus === 'online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    dcStatus === 'offline' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' :
                      'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                  <span className={`w-1 h-1 rounded-full ${dcStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : dcStatus === 'offline' ? 'bg-red-500' : 'bg-zinc-500'}`} />
                  {dcStatus}
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-600 font-bold uppercase tracking-widest px-1">Control Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
          {navItems.map(item => {
            if (item.permission && !can(item.permission)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `group sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
                }
              >
                {item.icon}
                <span className="flex-1 tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Quick Provisioning */}
          <div className="mt-8 pt-6 border-t border-theme px-2">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Quick Provision</h3>
            <div className="space-y-1">
              {can('users:create') && (
                <button onClick={() => setModal('user')} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-secondary hover:text-primary hover:bg-surface-primary rounded-xl transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  New User
                </button>
              )}
              {can('groups:create') && (
                <button onClick={() => setModal('group')} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-secondary hover:text-primary hover:bg-surface-primary rounded-xl transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  New Group
                </button>
              )}
              {can('ous:create') && (
                <button onClick={() => setModal('ou')} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-secondary hover:text-primary hover:bg-surface-primary rounded-xl transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  New Unit
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Theme & User segment */}
        <div className="p-4 border-t border-theme space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-primary border border-theme hover:bg-surface-secondary transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="text-zinc-500 group-hover:text-blue-500 transition-colors">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M15.657 8c0 2.02-1.637 3.657-3.657 3.657S8.343 10.02 8.343 8s1.637-3.657 3.657-3.657S15.657 5.98 15.657 8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-zinc-700' : 'bg-blue-100'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-surface-primary border border-transparent hover:border-theme transition-all group/user">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover/user:scale-110 transition-transform">
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-primary truncate tracking-tight group-hover/user:text-blue-500 transition-colors">{user?.displayName || user?.username}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">{user?.username}</div>
            </div>
            <svg className="w-4 h-4 text-zinc-500 group-hover/user:text-blue-500 translate-x-1 opacity-0 group-hover/user:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button onClick={handleLogout} className="w-full btn-secondary justify-center text-xs py-2.5 rounded-xl border-red-500/10 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 theme-transition relative">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl animate-slide-up">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20" />
            {toast}
          </div>
        )}

        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Global Modals */}
      {modal === 'user' && <CreateUserModal onClose={() => setModal(null)} onSuccess={showToast} />}
      {modal === 'group' && <CreateGroupModal onClose={() => setModal(null)} onSuccess={showToast} />}
      {modal === 'ou' && <CreateOUModal onClose={() => setModal(null)} onSuccess={showToast} />}
    </div>
  );
}
