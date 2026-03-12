import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as Common from "../utils/common";
import {
    LayoutDashboard,
    Car,    
    Calendar,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    UserPlus,
    Settings,
    History,
    Mail,
    Menu,
    X,
    Edit, // Added Edit Icon
    Shield
} from 'lucide-react';
import logo from '../assets/logo.png';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';

const Layout = ({ children }) => {

    const { user } = useAuth();
    const location = useLocation();
    

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Close sidebar and profile dropdown on route change
    React.useEffect(() => {
        setIsSidebarOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.user-profile-trigger') && !event.target.closest('.profile-dropdown')) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Requester', 'HR', 'Security'] },
        { name: 'My Bookings', path: '/bookings', icon: <Calendar size={20} />, roles: ['Requester'] },
        { name: 'All Bookings', path: '/bookings', icon: <Calendar size={20} />, roles: ['HR', 'Security'] },
        { name: 'Vehicles', path: '/vehicles', icon: <Car size={20} />, roles: ['HR', 'Security'] },
        { name: 'Reports', path: '/reports', icon: <FileText size={20} />, roles: ['HR'] },
        { name: 'Activity Hub', path: '/activities', icon: <History size={20} />, roles: ['HR', 'Security', 'Requester'] },
        { name: 'Users', path: '/users', icon: <UserPlus size={20} />, roles: ['HR'] },
        { name: 'Maintenance', path: '/maintenance', icon: <Settings size={20} />, roles: ['HR'] },
        { name: 'Email Settings', path: '/email-settings', icon: <Mail size={20} />, roles: ['HR'] },
    ];


    const handleLogout = () => {

       Common.redirect('');
    };

    return (
        <div className="app-container">
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <img src={logo} alt="Gallantt Logo" className="logo" />
                        <button className="close-btn mobile-only" onClick={() => setIsSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>
                    <div>
                        <div className="brand-name">Gallantt</div>
                        <div className="brand-sub">Vehicle Desk</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.filter(item => {
                        if (item.superAdminOnly) return user.isSuperAdmin;
                        return item.roles.includes(user.role) || (user.isSuperAdmin && !item.roles.includes('Requester')); // Show all admin stuff to super admin
                    }).map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {React.cloneElement(item.icon, { color: location.pathname === item.path ? 'var(--primary)' : 'currentColor' })}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Navbar */}
                <header className="top-navbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="menu-btn mobile-only"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="page-title">
                            {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                        <ThemeToggle />

                        <div
                            className="user-profile-trigger"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                cursor: 'pointer',
                                padding: '0.4rem',
                                borderRadius: '8px',
                                transition: 'background 0.2s',
                                userSelect: 'none'
                            }}
                        >
                            <div className="user-info desktop-only" style={{ textAlign: 'right' }}>
                                <div className="user-name" style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                                <div className="user-role" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.role}</div>
                            </div>

                            <div className="user-avatar" style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--border)'
                            }}>
                                <User size={20} color="var(--primary)" />
                            </div>
                        </div>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="profile-dropdown" style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                marginTop: '0.5rem',
                                width: '240px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                </div>

                                <div style={{ padding: '0.5rem' }}>
                                    <div style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <div><strong>ID:</strong> {user.employeeId || 'N/A'}</div>
                                        <div><strong>Dept:</strong> {user.department || 'N/A'}</div>
                                    </div>

                                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>

                                    <button
                                        onClick={() => { setIsProfileOpen(false); setIsModalOpen(true); }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                            padding: '0.6rem 0.8rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            borderRadius: '6px',
                                            transition: 'background 0.2s',
                                            marginBottom: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'var(--background)'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <Edit size={16} />
                                        Edit Profile
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                            padding: '0.6rem 0.8rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--error)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            borderRadius: '6px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'var(--background)'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>

            <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Layout;
