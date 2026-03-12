import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, BarChart2, ArrowRight, Zap } from 'lucide-react';
import logo from '../assets/logo.png';
import ThemeToggle from '../components/ThemeToggle';


const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-brand">
                    <img src={logo} alt="Gallantt Logo" className="nav-logo" />
                    <span className="brand-text">Vehicle Desk</span>
                </div>
                <div className="nav-actions">
                    <ThemeToggle />
                    <button onClick={() => navigate('/login')} className="btn btn-primary sign-in-btn">
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-glow"></div>

                <div className="hero-content">
                    <div className="new-tag">
                        <Zap size={16} /> New: Enhanced Fleet Monitoring Enabled
                    </div>
                    <h1 className="hero-title">
                        Enterprise Mobility,<br />
                        <span className="highlight">Perfectly Managed.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Gallantt Vehicle Desk is the complete transport management platform designed for efficiency.
                        Streamline bookings, monitor fleet health, and manage security in one seamless interface.
                    </p>
                    <div className="hero-actions">
                        <button onClick={() => navigate('/login')} className="btn btn-primary start-btn">
                            Get Started <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="features-section">
                <div className="feature-card">
                    <div className="feature-icon"><Zap size={32} /></div>
                    <h3 className="feature-title">Instant Bookings</h3>
                    <p className="feature-text">Request vehicles with just a few clicks. Real-time approval workflow keeps projects moving fast.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Shield size={32} /></div>
                    <h3 className="feature-title">Gate Security</h3>
                    <p className="feature-text">Integrated security portal for digital logging of all vehicle departures and arrivals.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><BarChart2 size={32} /></div>
                    <h3 className="feature-title">Smart Logistics</h3>
                    <p className="feature-text">Comprehensive reports and analytics on fleet utilization and maintenance schedules.</p>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; 2026 Gallantt Vehicle Desk. All rights reserved.</p>
            </footer>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};

export default Landing;
