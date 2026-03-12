import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Send, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from '../lib/axios';

const EmailSettings = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState({
        adminEmail: '',
        securityEmail: '',
        ccEmails: '',
        emailEnabled: false,
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: 'Vehicle Booking System'
    });

    const [testEmail, setTestEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/email/config', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfig(response.data);
        } catch (error) {
            console.error('Failed to fetch email config:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/email/config', config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Email configuration saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setMessage({ type: 'error', text: 'Please enter a test email address' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/email/test',
                { testEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Test email sent successfully! Check your inbox.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send test email' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn icon-btn"
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={24} style={{ color: 'var(--primary)' }} />
                            Email Configuration
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure email notifications for booking lifecycle events</p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {message && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email Status */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>General Settings</h2>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                            <input
                                type="checkbox"
                                checked={config.emailEnabled}
                                onChange={(e) => setConfig({ ...config, emailEnabled: e.target.checked })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: '500' }}>Enable Email Notifications</span>
                        </label>
                    </div>

                    {/* Recipient Emails */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recipients</h2>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Admin Email</label>
                                <input
                                    type="email"
                                    value={config.adminEmail}
                                    onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                                    placeholder="admin@example.com"
                                    className="form-control"
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                                    Receives notifications for vehicle departures and returns
                                </small>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Security Guard Email</label>
                                <input
                                    type="email"
                                    value={config.securityEmail}
                                    onChange={(e) => setConfig({ ...config, securityEmail: e.target.value })}
                                    placeholder="security@example.com"
                                    className="form-control"
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                                    Receives approved booking notifications
                                </small>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                                    CC Emails (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={config.ccEmails}
                                    onChange={(e) => setConfig({ ...config, ccEmails: e.target.value })}
                                    placeholder="email1@example.com, email2@example.com"
                                    className="form-control"
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                                    Comma-separated list of emails to CC on all notifications
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* SMTP Settings */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>SMTP Configuration</h2>

                        <div className="dashboard-grid" style={{ padding: 0, gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>SMTP Host</label>
                                <input
                                    type="text"
                                    value={config.smtpHost}
                                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                                    placeholder="smtp.gmail.com"
                                    className="form-control"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>SMTP Port</label>
                                <input
                                    type="number"
                                    value={config.smtpPort}
                                    onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                                    className="form-control"
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                                    Usually 587 for TLS or 465 for SSL
                                </small>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>SMTP Username</label>
                                <input
                                    type="email"
                                    value={config.smtpUser}
                                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                                    placeholder="your-email@gmail.com"
                                    className="form-control"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>SMTP Password</label>
                                <input
                                    type="password"
                                    value={config.smtpPassword}
                                    onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                                    placeholder="Enter to update, leave blank to keep current"
                                    className="form-control"
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                                    For Gmail, use an App Password
                                </small>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>From Email</label>
                                <input
                                    type="email"
                                    value={config.fromEmail}
                                    onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                                    placeholder="noreply@example.com"
                                    className="form-control"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>From Name</label>
                                <input
                                    type="text"
                                    value={config.fromName}
                                    onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Test Email */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Test Configuration</h2>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter email to send test"
                                className="form-control"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleTestEmail}
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
                                Send Test
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ padding: '1rem 3rem', fontSize: '1rem' }}
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default EmailSettings;
