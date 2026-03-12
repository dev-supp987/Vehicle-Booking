import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import {
    Car,
    CheckCircle,
    Clock,
    AlertTriangle,
    Navigation,
} from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{
            background: `${color}15`,
            padding: '1rem',
            borderRadius: '12px',
            color: color
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activitiesRes] = await Promise.all([
                    axios.get('/api/dashboard/stats', { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get('/api/dashboard/recent-activities', { headers: { Authorization: `Bearer ${user.token}` } })
                ]);
                setStats(statsRes.data);
                setActivities(activitiesRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };
        fetchData();
    }, [user]);

    const getActivityIcon = (action) => {
        if (action.includes('REGISTER')) return <CheckCircle size={14} color="#22c55e" />;
        if (action.includes('LOGIN')) return <CheckCircle size={14} color="#3b82f6" />;
        if (action.includes('BOOKING')) return <Car size={14} color="#6366f1" />;
        if (action.includes('DEPART')) return <Navigation size={14} color="#0ea5e9" />;
        if (action.includes('RETURN')) return <CheckCircle size={14} color="#22c55e" />;
        return <Clock size={14} color="var(--text-secondary)" />;
    };

    return (
        <Layout>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    Hey, {user.name.split(' ')[0]}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    Here's what's happening with the fleet today.
                </p>
            </div>

            <div className="dashboard-layout">
                {/* Left Side: Stats */}
                <div className="stats-column">
                    <div className="stats-grid">
                        {stats && user.role === 'HR' && (
                            <>
                                <StatCard title="Total Fleet" value={stats.totalVehicles} icon={<Car />} color="#2563eb" />
                                <StatCard title="Ready" value={stats.freeVehicles} icon={<CheckCircle />} color="#22c55e" />
                                <StatCard title="On Mission" value={stats.runningVehicles} icon={<Navigation />} color="#0ea5e9" />
                                <StatCard title="Pending" value={stats.pendingRequests} icon={<Clock />} color="#f59e0b" />
                                <StatCard title="Total Distance" value={`${stats.totalDistance || 0} km`} icon={<Navigation />} color="#8b5cf6" />
                            </>
                        )}
                        {stats && user.role === 'Requester' && (
                            <>
                                <StatCard title="Pnd Approval" value={stats.myPending} icon={<Clock />} color="#f59e0b" />
                                <StatCard title="Approved" value={stats.myApproved} icon={<CheckCircle />} color="#22c55e" />
                                <StatCard title="Active Duty" value={stats.myActive} icon={<Navigation />} color="#0ea5e9" />
                                <StatCard title="Total Trips" value={stats.totalMyBookings} icon={<Car />} color="#6366f1" />
                            </>
                        )}
                        {stats && user.role === 'Security' && (
                            <>
                                <StatCard title="Exit Queue" value={stats.toDepart} icon={<Clock />} color="#f59e0b" />
                                <StatCard title="Outside" value={stats.currentlyOut} icon={<Navigation />} color="#2563eb" />
                                <StatCard title="Movements" value={stats.totalTodayMovements} icon={<CheckCircle />} color="#22c55e" />
                                <StatCard title="Alerts" value="0" icon={<AlertTriangle />} color="#ef4444" />
                            </>
                        )}
                    </div>

                    {/* Quick System Note */}
                    <div className="card note-card">
                        <div className="note-header">
                            <AlertTriangle size={14} /> Quick System Note:
                        </div>
                        <p className="note-text">
                            All reports are currently up to date. No anomalies detected in current fleet movement.
                        </p>
                    </div>
                </div>

                {/* Right Side: Quick Pulse Preview */}
                <div className="card activity-card">
                    <div className="activity-header">
                        <h3 className="activity-title">
                            <Clock size={18} color="var(--primary)" /> Latest Pulse
                        </h3>
                        <Link to="/activities" className="view-hub-link">
                            View Hub →
                        </Link>
                    </div>

                    <div className="activity-list">
                        {activities.slice(0, 3).length > 0 ? activities.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon">
                                    {getActivityIcon(activity.action)}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">
                                        {activity.details}
                                    </div>
                                    <div className="activity-meta">
                                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activity.user?.name.split(' ')[0]}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="no-activity">
                                No recent activity
                            </div>
                        )}
                    </div>

                    <div className="activity-footer">
                        <p>
                            Real-time tracking is active. Check the Activity Hub for full history.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
