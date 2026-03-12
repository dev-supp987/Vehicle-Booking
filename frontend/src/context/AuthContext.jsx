import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } finally {
            setLoading(false);
        }
    };

    const loginwithtoken = async (token) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/loginwithtoken', { token });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (userData) => {
        setLoading(true);
        try {
            const { data } = await axios.put('/api/auth/profile', userData);
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile,loginwithtoken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
