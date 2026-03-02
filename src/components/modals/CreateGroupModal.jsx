import { useState } from 'react';
import { API } from '../../context/AuthContext.jsx';
import Modal from '../Modal.jsx';

export default function CreateGroupModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await API.post('/groups', form);
            onSuccess('Group created');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create New Group"
            subtitle="Define a new security or distribution group"
            onClose={onClose}
            size="sm"
            footer={
                <div className="flex gap-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1 h-12">Cancel</button>
                    <button type="submit" form="create-group-form" className="btn-primary flex-1 h-12" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            }
        >
            <form id="create-group-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="label">Group Name *</label>
                    <input
                        className="input mono h-11"
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="it-helpdesk"
                    />
                </div>
                <div>
                    <label className="label">Description</label>
                    <input
                        className="input h-11"
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Purpose of this group"
                    />
                </div>
                {error && <div className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/10 rounded-xl px-4 py-3 animate-shake">{error}</div>}
            </form>
        </Modal>
    );
}
