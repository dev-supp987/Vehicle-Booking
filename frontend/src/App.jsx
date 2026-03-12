import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import TestConfig from './pages/TestConfig';

import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Vehicles from './pages/Vehicles';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Maintenance from './pages/Maintenance';
import Activities from './pages/Activities';
import EmailSettings from './pages/EmailSettings';
import Landing from './pages/Landing';
import DeveloperConsole from './pages/DeveloperConsole';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <ToastProvider>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/test" element={<TestConfig />} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                            <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
                            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                            <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
                            <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
                            <Route path="/email-settings" element={<ProtectedRoute><EmailSettings /></ProtectedRoute>} />
                            <Route path="/developer" element={<ProtectedRoute><DeveloperConsole /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </ToastProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}


export default App;
