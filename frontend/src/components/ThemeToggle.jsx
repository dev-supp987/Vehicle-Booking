import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: '1px solid var(--border)',
                padding: '0.5rem',
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                position: 'relative',
                width: '64px',
                height: '32px',
                transition: 'var(--transition)',
                outline: 'none'
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div style={{
                position: 'absolute',
                left: theme === 'light' ? '4px' : '36px',
                width: '24px',
                height: '24px',
                background: 'var(--primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.4)'
            }}>
                {theme === 'light' ? (
                    <Sun size={14} color="white" />
                ) : (
                    <Moon size={14} color="white" />
                )}
            </div>
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 8px',
                opacity: 0.5
            }}>
                <Sun size={12} color={theme === 'dark' ? '#94a3b8' : 'transparent'} />
                <Moon size={12} color={theme === 'light' ? '#64748b' : 'transparent'} />
            </div>
        </button>
    );
};

export default ThemeToggle;
