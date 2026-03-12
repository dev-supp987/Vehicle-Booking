import React, { useState } from 'react';
import axios from '../lib/axios';

const TestConfig = () => {
    const [status, setStatus] = useState('Idle');
    const [seedStatus, setSeedStatus] = useState('Idle');
    const apiUrl = import.meta.env.VITE_API_URL;

    const testConnection = async () => {
        setStatus('Connecting...');
        try {
            const res = await axios.get('/');
            setStatus('Success: ' + JSON.stringify(res.data));
        } catch (err) {
            setStatus('Error: ' + (err.message || 'Unknown error'));
            console.error(err);
        }
    };

    const runSeed = async () => {
        setSeedStatus('Seeding...');
        try {
            const res = await axios.get('/api/seed');
            setSeedStatus('Success: ' + JSON.stringify(res.data));
        } catch (err) {
            setSeedStatus('Error: ' + (err.message || 'Unknown error'));
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Diagnostics</h1>
            <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem' }}>
                <strong>VITE_API_URL:</strong> {apiUrl ? apiUrl : <span style={{ color: 'red' }}>NOT SET (This is a problem!)</span>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={testConnection} style={{ padding: '0.5rem 1rem' }}>Test Connection</button>
                <button onClick={runSeed} style={{ padding: '0.5rem 1rem' }}>Seed Database</button>
            </div>

            <div>
                <h3>Connection Status:</h3>
                <pre>{status}</pre>
            </div>

            <div>
                <h3>Seed Status:</h3>
                <pre>{seedStatus}</pre>
            </div>
        </div>
    );
};

export default TestConfig;
