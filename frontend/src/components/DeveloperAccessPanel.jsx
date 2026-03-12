import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import { Shield, Check, X, Search, Key, Sliders } from 'lucide-react';
import Modal from './Modal';

const DeveloperAccessPanel = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Permissions Drawer State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [permissionsForm, setPermissionsForm] = useState({});

    // Password Reset Modal State
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [userToReset, setUserToReset] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/auth/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (perm) => {
        setPermissionsForm(prev => ({
            ...prev,
            [perm]: !prev[perm]
        }));
    };

    const savePermissions = async () => {
        try {
            await axios.put(`/api/auth/users/${selectedUser.id}/permissions`, {
                permissions: permissionsForm,
                isSuperAdmin: permissionsForm.isSuperAdmin
            });
            setIsPermissionsOpen(false);
            fetchUsers();
            alert('Permissions updated successfully');
        } catch (error) {
            alert('Failed to update permissions: ' + (error.response?.data?.message || error.message));
        }
    };

    const openPermissionsDrawer = (user) => {
        setSelectedUser(user);
        setPermissionsForm({
            ...user.permissions,
            isSuperAdmin: user.isSuperAdmin
        });
        setIsPermissionsOpen(true);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/auth/users/${userToReset.id}/reset-password`, {
                newPassword: resetPassword
            });
            setIsResetOpen(false);
            setResetPassword('');
            setUserToReset(null);
            alert('Password reset successfully');
        } catch (error) {
            alert('Failed to reset password: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || !user.isSuperAdmin) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Shield size={48} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                <h2 style={{ marginTop: '1rem' }}>Restricted Access</h2>
                <p>This content is only available to Super Administrators.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>User Access Control</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--surface)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <Search size={16} color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '200px' }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Super Admin</th>
                                <th style={{ padding: '1rem' }}>Permissions</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{u.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {u.isSuperAdmin ?
                                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem' }}><Check size={14} /> Yes</span> :
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No</span>
                                        }
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                            {u.permissions && Object.keys(u.permissions).map(p => (
                                                u.permissions[p] && (
                                                    <span key={p} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(218, 41, 28, 0.1)', color: 'var(--primary)' }}>
                                                        {p}
                                                    </span>
                                                )
                                            ))}
                                            {(!u.permissions || Object.values(u.permissions).every(v => !v)) && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Default</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button className="btn" title="Manage Permissions" onClick={() => openPermissionsDrawer(u)} style={{ padding: '0.4rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                                <Sliders size={16} />
                                            </button>
                                            <button className="btn" title="Reset Password" onClick={() => { setUserToReset(u); setIsResetOpen(true); }} style={{ padding: '0.4rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--error)' }}>
                                                <Key size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Access Dragger (Permissions Drawer) */}
            {isPermissionsOpen && (
                <>
                    <div
                        onClick={() => setIsPermissionsOpen(false)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)', zIndex: 999
                        }}
                    />
                    <div style={{
                        position: 'fixed', top: 0, right: 0, height: '100%', width: '400px',
                        background: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: '-4px 0 25px rgba(0,0,0,0.15)',
                        zIndex: 1000, padding: '2rem', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Manage Access</h2>
                            <button onClick={() => setIsPermissionsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(218, 41, 28, 0.05)', borderRadius: '8px', border: '1px solid rgba(218, 41, 28, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--primary)' }}>Super Admin Status</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grant full system access</div>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={permissionsForm.isSuperAdmin || false}
                                            onChange={(e) => setPermissionsForm({ ...permissionsForm, isSuperAdmin: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: '600' }}>Granular Permissions</h3>
                            {['canManageBookings', 'canViewReports', 'canManageUsers', 'canManageSystem'].map(perm => (
                                <div key={perm} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{perm.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={permissionsForm[perm] || false}
                                            onChange={() => handlePermissionToggle(perm)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={savePermissions}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </>
            )}

            <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset User Password">
                <form onSubmit={handlePasswordReset}>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Resetting password for <strong>{userToReset?.name}</strong>.
                        </p>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem' }}>New Password</label>
                        <input
                            type="text"
                            className="form-control"
                            value={resetPassword}
                            onChange={e => setResetPassword(e.target.value)}
                            placeholder="Enter new password"
                            style={{ width: '100%', padding: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Update Password
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default DeveloperAccessPanel;
