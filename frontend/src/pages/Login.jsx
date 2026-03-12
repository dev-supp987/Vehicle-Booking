import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as Common from "../utils/common";
import { Car } from 'lucide-react';
import logo from '../assets/logo.png';


const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading, user, loginwithtoken } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const location = useLocation();
    const token = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);
    const shouldRedirectToSite = !user && !token;
    const displayLoginForm = false;

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useLayoutEffect(() => {

        if (shouldRedirectToSite) {

            Common.redirect('');

        } else {


            if (token) {

                setError('');

                try {

                    loginwithtoken(token);

                } catch (err) {

                    const msg = err.response?.data?.message || 'Invalid or expired token. Please log in again.';
                    setError(msg);
                    showToast(msg, 'error');
                    Common.redirect('');
                }
            } else {

                Common.redirect('');
            }


        }
    }, [shouldRedirectToSite]);

    if (shouldRedirectToSite) return null;

    if (displayLoginForm) return null;

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            showToast('Successfully logged in!', 'success');
            // Redirection is handled by the useEffect [user]
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
            showToast(msg, 'error');
        }
    };

    return null;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '1rem',
            transition: 'var(--transition)'
        }}>
            <div className="card glass login-card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="Gallantt Logo" style={{ height: '60px', marginBottom: '1rem' }} />

                    <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Gallantt Vehicle Desk</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage your transport</p>
                </div>


                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
                        <input
                            type="text"
                            required
                            placeholder="admin@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--background)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>Password</label>
                        <input
                            type="password"

                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</p>}

                    <button
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
