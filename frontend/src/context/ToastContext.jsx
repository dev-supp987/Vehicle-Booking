import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: '300px',
                            maxWidth: '450px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '1rem',
                            boxShadow: 'var(--shadow)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            pointerEvents: 'auto',
                            animation: 'slideIn 0.3s ease-out forwards',
                            borderLeft: `4px solid ${toast.type === 'success' ? '#22c55e' :
                                    toast.type === 'error' ? '#ef4444' :
                                        toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
                                }`
                        }}
                    >
                        <div style={{
                            color: toast.type === 'success' ? '#22c55e' :
                                toast.type === 'error' ? '#ef4444' :
                                    toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
                        }}>
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'warning' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
