import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../lib/axios';
import { Trash2, RefreshCcw, Lock, FileText, History, Shield, Activity as ActivityIcon } from 'lucide-react';
import DeveloperAccessPanel from '../components/DeveloperAccessPanel';

const Maintenance = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const handleAuth = (e) => {
        e.preventDefault();
        if (password === 'Dev@Gallantt2026') {
            setIsAuthenticated(true);
            showToast('Developer Mode Activated', 'success');
        } else {
            showToast('Invalid Developer Password', 'error');
        }
    };

    const handleClearData = async () => {
        if (!window.confirm('Are you sure? This will delete all record older than 7 days.')) return;
        setLoading(true);
        try {
            const { data } = await axios.post('/api/maintenance/clear-data', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast(data.message, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Cleanup failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetVehicles = async () => {
        if (!window.confirm('Reset all vehicles to Available?')) return;
        setLoading(true);
        try {
            const { data } = await axios.post('/api/maintenance/reset-vehicles', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast(data.message, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Reset failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderAuthScreen = () => (
        <Layout>
            <div style={{
                maxWidth: '400px',
                margin: '5rem auto',
                textAlign: 'center',
                padding: '2rem',
                background: 'var(--surface)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--border)'
            }}>
                <Lock size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>Maintenance Access</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Enter password to access system maintenance tools.
                </p>
                <form onSubmit={handleAuth}>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Maintenance Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Unlock Tools
                    </button>
                </form>
            </div>
        </Layout>
    );

    if (!isAuthenticated) return renderAuthScreen();

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#DA291C' }}>
                        System Maintenance
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Advanced tools for system health and administration.</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('general')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'general' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <RefreshCcw size={18} /> General
                </button>
                {/* Only show Developer tab if user is SuperAdmin */}
                {user.isSuperAdmin && (
                    <button
                        onClick={() => setActiveTab('developer')}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'developer' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'developer' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === 'developer' ? '600' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Shield size={18} /> Developer Access
                    </button>
                )}
            </div>

            {activeTab === 'general' && (
                <>
                    <div className="dashboard-grid" style={{ padding: 0, marginBottom: '2rem' }}>
                        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '12px' }}>
                                    <Trash2 size={24} color="#ef4444" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem' }}>7-Day Data Clearance</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Purge logs and completed bookings older than 7 days.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClearData}
                                className="btn btn-primary"
                                style={{ background: '#ef4444', width: '100%' }}
                                disabled={loading}
                            >
                                Run Cleanup
                            </button>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.8rem', borderRadius: '12px' }}>
                                    <RefreshCcw size={24} color="#0ea5e9" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem' }}>Reset Fleet Status</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Force all vehicles back to 'Available' status.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleResetVehicles}
                                className="btn"
                                style={{ border: '1px solid var(--border)', width: '100%' }}
                                disabled={loading}
                            >
                                Reset Vehicles
                            </button>
                        </div>
                    </div>

                    {/* Link to Activity Hub */}
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <FileText size={40} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>System Audit Trail</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                            Detailed audit logs, user actions, and system events have been moved to the dedicated Activity Hub for better visibility.
                        </p>
                        <Link to="/activities" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <History size={18} /> Open Activity Hub
                        </Link>
                    </div>
                </>
            )}

            {activeTab === 'developer' && user.isSuperAdmin && (
                <DeveloperAccessPanel />
            )}

        </Layout>
    );
};

export default Maintenance;
