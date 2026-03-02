import { useState } from 'react';
import { API } from '../../context/AuthContext.jsx';
import Modal from '../Modal.jsx';

export default function CreateUserModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ firstName: '', lastName: '', username: '', password: '', email: '', department: '', title: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await API.post('/users', form);
            onSuccess('User created successfully');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Provision New User"
            subtitle="Create a new account in the Active Directory"
            onClose={onClose}
            footer={
                <div className="flex gap-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1 h-12">Cancel</button>
                    <button type="submit" form="create-user-form" className="btn-primary flex-1 h-12" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            }
        >
            <form id="create-user-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">First Name *</label><input className="input h-11" required value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
                    <div><label className="label">Last Name *</label><input className="input h-11" required value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
                </div>
                <div><label className="label">Username *</label><input className="input mono h-11" required value={form.username} onChange={e => set('username', e.target.value)} placeholder="jsmith" /></div>
                <div><label className="label">Password *</label><input className="input h-11" type="password" required value={form.password} onChange={e => set('password', e.target.value)} /></div>
                <div><label className="label">Email Address</label><input className="input h-11" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@domain.com" /></div>
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
