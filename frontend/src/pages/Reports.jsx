import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import { Download, Filter, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Reports = () => {
    const { user } = useAuth();
    const [reportData, setReportData] = useState([]);
    const [dateRange, setDateRange] = useState('all'); // all, today, week, month, custom
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);

    const fetchReports = () => {
        setLoading(true);
        let params = {};
        const now = new Date();

        if (dateRange === 'today') {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now);
            end.setHours(23, 59, 59, 999);
            // Send as local ISO-like strings to avoid UTC shifts in backend if it's not strictly UTC
            params.startDate = format(start, "yyyy-MM-dd'T'HH:mm:ss");
            params.endDate = format(end, "yyyy-MM-dd'T'HH:mm:ss");
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            params.startDate = format(weekAgo, "yyyy-MM-dd'T'HH:mm:ss");
        } else if (dateRange === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            params.startDate = format(monthAgo, "yyyy-MM-dd'T'HH:mm:ss");
        } else if (dateRange === 'custom' && customRange.start && customRange.end) {
            params.startDate = customRange.start + 'T00:00:00';
            params.endDate = customRange.end + 'T23:59:59';
        }

        axios.get('/api/dashboard/reports', {
            params,
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => setReportData(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReports();
    }, [dateRange, customRange]);

    const exportToExcel = () => {
        import('xlsx').then(XLSX => {
            const wb = XLSX.utils.book_new();

            // 1. Define Headers
            const headers = [
                'Booking Ref ID',
                'Requester Name',
                'Employee ID',
                'Department',
                'Vehicle Number',
                'Pickup Location',
                'Drop Location',
                'Purpose',
                'Booking Type',
                'Start Date',
                'Start Time',
                'End Date',
                'End Time',
                'Start KM',
                'End KM',
                'Total Distance (KM)',
                'Status'
            ];

            // 2. Map Data
            const dataRows = reportData.map(r => {
                const startDateObj = new Date(r.startTime);
                const endDateObj = new Date(r.endTime);

                return [
                    r.id, // Booking Ref ID
                    r.requester?.name || 'Unknown',
                    r.requester?.employeeId || 'N/A',
                    r.requester?.department || 'N/A',
                    r.vehicle?.plateNumber || 'N/A',
                    r.pickupLocation,
                    r.dropLocation,
                    r.purpose,
                    r.bookingType || 'Official',
                    format(startDateObj, 'yyyy-MM-dd'),
                    format(startDateObj, 'HH:mm'),
                    format(endDateObj, 'yyyy-MM-dd'),
                    format(endDateObj, 'HH:mm'),
                    r.startKm || 0,
                    r.endKm || 0,
                    (r.startKm && r.endKm) ? (r.endKm - r.startKm) : 0,
                    r.status
                ];
            });

            // 3. Create Worksheet with Professional Header Structure
            // Row 1: Company Name
            // Row 2: Report Title & Date
            // Row 3: Empty
            // Row 4: Headers
            // Row 5+: Data

            const wsData = [
                ['GALLANTT VEHICLE DESK - USAGE REPORT'], // Row 1
                [`Generated on: ${format(new Date(), 'PPpp')} | Range: ${dateRange.toUpperCase()}`], // Row 2
                [], // Row 3 (Spacer)
                headers, // Row 4 (Headers)
                ...dataRows // Row 5+
            ];

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // 4. Formatting (Merges and Column Widths)

            // Merge Title Rows
            if (!ws['!merges']) ws['!merges'] = [];
            ws['!merges'].push(
                { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge Row 1 across all columns
                { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }  // Merge Row 2 across all columns
            );

            // Set Column Widths
            ws['!cols'] = [
                { wch: 12 }, // ID
                { wch: 20 }, // Name
                { wch: 12 }, // Emp ID
                { wch: 15 }, // Dept
                { wch: 15 }, // Vehicle
                { wch: 20 }, // Pickup
                { wch: 20 }, // Drop
                { wch: 30 }, // Purpose
                { wch: 12 }, // Type
                { wch: 12 }, // Start Date
                { wch: 10 }, // Start Time
                { wch: 12 }, // End Date
                { wch: 10 }, // End Time
                { wch: 10 }, // Start KM
                { wch: 10 }, // End KM
                { wch: 15 }, // Total KM
                { wch: 12 }  // Status
            ];

            XLSX.utils.book_append_sheet(wb, ws, "Usage Report");

            // 5. Download
            XLSX.writeFile(wb, `Vehicle_Usage_Report_${dateRange.toUpperCase()}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
        });
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Usage Reports</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Download and analyze vehicle utilization data.</p>
                </div>
                <button className="btn btn-primary" onClick={exportToExcel}>
                    <Download size={18} /> Export Excel
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--background)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '250px' }}>
                        <Filter size={16} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Search by department or details..."
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Calendar size={18} color="var(--text-secondary)" />
                        <select
                            className="form-control"
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="all">All Time History</option>
                            <option value="today">Today's Activity</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom Date Range</option>
                        </select>
                    </div>

                    {dateRange === 'custom' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <input
                                type="date"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>to</span>
                            <input
                                type="date"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                            />
                        </div>
                    )}
                </div>

                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Vehicle</th>
                                <th style={{ padding: '1rem' }}>Requester</th>
                                <th style={{ padding: '1rem' }}>From</th>
                                <th style={{ padding: '1rem' }}>To</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Duration</th>
                                <th style={{ padding: '1rem' }}>Start KM</th>
                                <th style={{ padding: '1rem' }}>End KM</th>
                                <th style={{ padding: '1rem' }}>Total (KM)</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="10" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: '500' }}>Refreshing data...</div>
                                    </td>
                                </tr>
                            ) : reportData.length > 0 ? reportData.map((r) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{r.vehicle?.plateNumber || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div>{r.requester?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.requester?.employeeId} | {r.requester?.department}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{r.pickupLocation}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{r.dropLocation}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                                            {r.bookingType}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: '500' }}>{format(new Date(r.startTime), 'MMM d, yyyy')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {format(new Date(r.startTime), 'HH:mm')} - {format(new Date(r.endTime), 'HH:mm')}
                                            ({((new Date(r.endTime) - new Date(r.startTime)) / 3600000).toFixed(1)}h)
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{r.startKm || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{r.endKm || '-'}</td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {(r.startKm && r.endKm) ? (r.endKm - r.startKm) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: r.status === 'Returned' ? 'var(--success)' : (r.status === 'Rejected' ? 'var(--error)' : 'var(--primary)') }}>{r.status}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No usage records found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
