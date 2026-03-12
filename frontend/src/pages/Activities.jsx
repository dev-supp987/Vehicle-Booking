import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import {
    Car,
    CheckCircle,
    Clock,
    Navigation,
    FileText,
    Download,
    History
} from 'lucide-react';

const Activities = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const { data } = await axios.get('/api/dashboard/recent-activities', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setActivities(data);
            } catch (err) {
                console.error('Error fetching activities:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user]);

    const getTag = (action) => {
        if (action.includes('LOGIN') || action.includes('REGISTER')) return 'USER';
        if (action.includes('GATE') || action.includes('DEPART') || action.includes('RETURN')) return 'GATE';
        if (action.includes('BOOKING')) return 'BOOKING';
        if (action.includes('USER_STATUS')) return 'ADMIN';
        if (action.includes('VEHICLE')) return 'FLEET';
        return 'SYSTEM';
    };

    const getActivityIcon = (action) => {
        if (action.includes('REGISTER')) return <CheckCircle size={14} color="#3b82f6" />;
        if (action.includes('LOGIN')) return <CheckCircle size={14} color="#3b82f6" />;
        if (action.includes('BOOKING')) return <Car size={14} color="#6366f1" />;
        if (action.includes('DEPART')) return <Navigation size={14} color="#0ea5e9" />;
        if (action.includes('RETURN')) return <CheckCircle size={14} color="#22c55e" />;
        return <Clock size={14} color="var(--text-secondary)" />;
    };

    const downloadLogs = () => {
        if (!activities.length) return;

        const headers = ['Action', 'Details', 'User', 'Time'];
        const rows = activities.map(a => [
            a.action,
            a.details,
            a.user?.name || 'System',
            new Date(a.createdAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${c}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `System_Activities_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                        Activity Hub
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Tracking {activities.length} recent system events.
                    </p>
                </div>
                <button onClick={downloadLogs} className="btn secondary-btn">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="card timeline-card">
                <div className="timeline-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <History size={20} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Pulse</h2>
                    </div>
                    <span className="live-pill">
                        Live Updates
                    </span>
                </div>

                {loading ? (
                    <div className="loading-state">Fetching pulse...</div>
                ) : (
                    <div className="timeline-container">
                        {/* Timeline Line */}
                        <div className="timeline-line" />

                        <div className="timeline-list">
                            {activities.length > 0 ? activities.map((activity) => (
                                <div key={activity.id} className="timeline-item">
                                    <div className="timeline-icon">
                                        {getActivityIcon(activity.action)}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-row">
                                            <div className="activity-details">
                                                {activity.details}
                                            </div>
                                            <span className="activity-tag">
                                                {getTag(activity.action)}
                                            </span>
                                        </div>
                                        <div className="activity-meta">
                                            <span>{activity.user?.name || 'System'}</span>
                                            <span>•</span>
                                            <span>{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="no-activity">
                                    Steady as she goes. No events yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Activities;
