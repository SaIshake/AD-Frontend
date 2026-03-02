import { useState } from 'react';
import { API } from '../../context/AuthContext.jsx';
import Modal from '../Modal.jsx';

export default function CreateOUModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', description: '', parentDN: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await API.post('/ous', form);
            onSuccess('Organizational Unit created successfully');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create OU');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Provision Organizational Unit"
            subtitle="Create a new logical container in the directory"
            onClose={onClose}
            size="sm"
            footer={
                <div className="flex gap-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1 h-12">Cancel</button>
                    <button type="submit" form="create-ou-form" className="btn-primary flex-1 h-12" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Unit'}
                    </button>
                </div>
            }
        >
            <form id="create-ou-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="label">Canonical Name *</label>
                        <input className="input mono h-11" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Engineering Department" />
                    </div>
                    <div>
                        <label className="label">Brief Description</label>
                        <input className="input h-11" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Purpose of this unit" />
                    </div>
                    <div>
                        <label className="label">Parent Path (Optional)</label>
                        <input className="input mono text-xs h-11" value={form.parentDN} onChange={e => setForm(f => ({ ...f, parentDN: e.target.value }))} placeholder="OU=Managed,DC=domain,DC=local" />
                    </div>
                </div>

                {error && <div className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/10 rounded-xl px-4 py-3 animate-shake">{error}</div>}
            </form>
        </Modal>
    );
}
