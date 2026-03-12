import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import EditUserModal from '../components/EditUserModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../lib/axios';
import { UserPlus, Mail, Shield, Briefcase, Hash, Phone, Key } from 'lucide-react';

const Users = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Requester',
        department: '',
        mobileNumber: '',
        employeeId: ''
    });

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await axios.patch(`/api/auth/users/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast(`User ${currentStatus ? 'deactivated' : 'activated'} successfully!`, 'success');
            fetchUsers();
        } catch (err) {
            console.error('Toggle status error details:', err);
            const msg = err.response?.data?.message || err.message || 'Error updating user status';
            showToast(msg, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/users', form, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast(`User ${form.name} created successfully!`, 'success');
            setIsModalOpen(false);
            setForm({
                name: '', email: '', password: '', role: 'Requester',
                department: '', mobileNumber: '', employeeId: ''
            });
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error creating user. Please try again.';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }

    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>User Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage system access and roles.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} /> Add New User
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1.2rem' }}>Employee</th>
                                <th style={{ padding: '1.2rem' }}>Role/Dept</th>
                                <th style={{ padding: '1.2rem' }}>Contact</th>
                                <th style={{ padding: '1.2rem' }}>Status</th>
                                <th style={{ padding: '1.2rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {u.employeeId}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{u.role}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.department}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{u.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {u.mobileNumber ? (
                                                <a href={`tel:${u.mobileNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {u.mobileNumber}
                                                </a>
                                            ) : ''}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: u.isActive ? '#dcfce7' : '#fee2e2',
                                            color: u.isActive ? '#166534' : '#991b1b'
                                        }}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn"
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)'
                                            }}
                                            onClick={() => {
                                                setEditingUser(u);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn"
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                border: '1px solid var(--border)',
                                                color: u.isActive ? '#ef4444' : '#22c55e'
                                            }}
                                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                                            disabled={u.id === user.id}
                                        >
                                            {u.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New User">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Briefcase size={14} /> Full Name
                            </label>
                            <input
                                type="text"
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Hash size={14} /> Employee ID
                            </label>
                            <input
                                type="text"
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.employeeId}
                                onChange={e => setForm({ ...form, employeeId: e.target.value })}
                                placeholder="EMP102"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Mail size={14} /> Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="user@gallantt.com"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Key size={14} /> Login Password
                            </label>
                            <input
                                type="password"
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Shield size={14} /> Account Role
                            </label>
                            <select
                                className="form-control"
                                style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="Requester">Requester (Employee)</option>
                                <option value="HR">HR / Administrator</option>
                                <option value="Security">Security Guard</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Briefcase size={14} /> Department
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                                placeholder="Logistics / HR / IT"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={14} /> Mobile Number
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: '100%', padding: '0.7rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                            value={form.mobileNumber}
                            onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', justifyContent: 'center', padding: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Create User Account'}
                    </button>
                </form>
            </Modal>

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={editingUser}
                onUpdate={fetchUsers}
            />
        </Layout >
    );
};

export default Users;
