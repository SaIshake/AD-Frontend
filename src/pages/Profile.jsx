import { useState, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext.jsx';

export default function Profile() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        if (user?.username) {
            API.get('/audit?limit=10&user=me')
                .then(r => setLogs(r.data.logs))
                .catch(() => { })
                .finally(() => setLoadingLogs(false));
        }
    }, [user?.username]);

    if (!user) return null;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
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

    const statusItems = [
        { label: 'Account Enabled', value: user.isEnabled, active: user.isEnabled, type: 'boolean' },
        { label: 'Locked Out', value: user.isLockedOut, active: !user.isLockedOut, type: 'boolean' },
        { label: 'Password Never Expires', value: user.passwordNeverExpires, active: !user.passwordNeverExpires, type: 'boolean' },
        { label: 'Must Change Password', value: user.mustChangePassword, active: !user.mustChangePassword, type: 'boolean' },
    ];

    const contactItems = [
        { label: 'Principal Name', value: user.userPrincipalName, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { label: 'Email Address', value: user.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: 'Work Phone', value: user.phone, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
        { label: 'Mobile Phone', value: user.mobile, icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ];

    const orgItems = [
        { label: 'Company', value: user.company, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { label: 'Department', value: user.department, icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
        { label: 'Job Title', value: user.title, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: 'Direct Manager', value: user.manager, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    const timelineItems = [
        { label: 'Account Created', value: formatDate(user.whenCreated) },
        { label: 'Last Logon', value: formatDate(user.lastLogon) },
        { label: 'Password Last Set', value: formatDate(user.pwdLastSet) },
        { label: 'Account Expires', value: formatDate(user.accountExpires) },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-surface-secondary border border-theme rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl opacity-50" />

                <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    {/* Avatar / Photo */}
                    <div className="relative group">
                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative w-32 h-32 md:w-48 md:h-48 bg-surface-primary rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-surface-secondary shadow-2xl">
                            {user.photo ? (
                                <img src={user.photo} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-5xl md:text-7xl font-bold text-white">
                                    {user.displayName?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-4 flex-1">
                        <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight">
                                    {user.displayName}
                                </h1>
                                <div className={`self-center md:self-auto px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border
                  ${user.isEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {user.isEnabled ? 'Account Active' : 'Account Disabled'}
                                </div>
                            </div>
                            <p className="text-xl text-secondary font-medium tracking-wide">
                                {user.userPrincipalName || user.username}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-surface-primary/50 border border-theme rounded-2xl">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <span className="text-sm font-bold text-secondary uppercase tracking-widest">{user.company || 'Corporate'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-surface-primary/50 border border-theme rounded-2xl">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <span className="text-sm font-bold text-secondary uppercase tracking-widest">{user.department || 'Staff'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Account & Contact */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Account Status Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {statusItems.map((item) => (
                            <div key={item.label} className="bg-surface-secondary border border-theme rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm group hover:border-blue-500/30 transition-all">
                                <span className="text-sm font-bold text-secondary">{item.label}</span>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                  ${item.value === item.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {item.value ? 'Yes' : 'No'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-8">
                            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </span>
                                Contact Information
                            </h2>
                            <div className="space-y-6">
                                {contactItems.map((item) => (
                                    <div key={item.label} className="flex gap-4 group">
                                        <div className="w-10 h-10 bg-surface-primary rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-semibold text-primary truncate max-w-[200px]">{item.value || 'Not provided'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-8">
                            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </span>
                                Organization
                            </h2>
                            <div className="space-y-6">
                                {orgItems.map((item) => (
                                    <div key={item.label} className="flex gap-4 group">
                                        <div className="w-10 h-10 bg-surface-primary rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-semibold text-primary">{item.value || 'Not provided'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-6">
                        <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </span>
                            Office Address
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Street', value: user.address?.street },
                                { label: 'City', value: user.address?.city },
                                { label: 'State', value: user.address?.state },
                                { label: 'Zip Code', value: user.address?.zip },
                                { label: 'Country', value: user.address?.country },
                            ].map((item) => (
                                <div key={item.label}>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-sm font-semibold text-primary">{item.value || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-8">
                        <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            Your Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {!loadingLogs && logs.length > 0 ? logs.map((log) => (
                                <div key={log._id} className="flex items-center gap-4 p-4 bg-surface-primary/50 border border-theme rounded-2xl group hover:bg-surface-primary transition-all">
                                    <div className={`w-1.5 h-8 rounded-full ${log.success ? 'bg-emerald-500/30' : 'bg-red-500/30'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-primary truncate">
                                            {log.action} <span className="text-zinc-500 mx-1">→</span> {log.target || 'System'}
                                        </div>
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">
                                            {formatTimeAgo(log.timestamp)}
                                        </div>
                                    </div>
                                    {!log.success && (
                                        <div className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase">Failed</div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-30 italic">
                                    {loadingLogs ? 'Loading activity...' : 'No recorded activity'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Groups, OUs & Timestamps */}
                <div className="space-y-8">
                    {/* Timeline / Activity */}
                    <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-6">
                        <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            Account Timeline
                        </h2>
                        <div className="space-y-4">
                            {timelineItems.map((item) => (
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-theme last:border-0">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                                    <span className="text-sm font-semibold text-primary">{item.value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Failed Login Attempts</span>
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-black
                  ${user.badPwdCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-surface-primary text-secondary'}`}>
                                    {user.badPwdCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Org Units */}
                    <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-6">
                        <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                            </span>
                            Org Units
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {user.ous?.length > 0 ? (
                                [...user.ous].reverse().map((ou, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-surface-primary border border-theme rounded-xl text-xs font-semibold text-secondary">
                                        {ou}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-secondary italic">No OU info</span>
                            )}
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="bg-surface-secondary border border-theme rounded-[2rem] p-8 shadow-xl space-y-6">
                        <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </span>
                            Security Groups
                        </h2>
                        <div className="grid grid-cols-1 gap-2">
                            {user.groups?.map((group, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-surface-primary border border-theme rounded-xl">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                                    <span className="text-xs font-semibold text-secondary truncate">{group}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
