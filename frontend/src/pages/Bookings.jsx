import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../lib/axios';
import CustomDatePicker from '../components/CustomDatePicker';
import { Plus, Eye, CheckCircle, XCircle, Clock, Navigation, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

const BookingStatusBadge = ({ status }) => {
    const colors = {
        Pending: { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
        Approved: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
        Rejected: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
        Running: { bg: 'rgba(14, 165, 233, 0.2)', text: '#0ea5e9' },
        Returned: { bg: 'rgba(100, 116, 139, 0.2)', text: 'var(--text-secondary)' },
    };
    const style = colors[status] || colors.Pending;
    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: style.bg,
            color: style.text
        }}>
            {status}
        </span>
    );
};

const Bookings = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isGateModalOpen, setIsGateModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [gateAction, setGateAction] = useState(null); // 'Departed' or 'Returned'
    const [form, setForm] = useState({
        startTime: null,
        endTime: null,
        purpose: '',
        pickupLocation: '',
        dropLocation: '',
        passengers: 1,
        priority: 'Normal',
        bookingType: 'Official'
    });
    const [actionForm, setActionForm] = useState({
        status: 'Approved',
        remarks: '',
        vehicleId: ''
    });
    const [gateForm, setGateForm] = useState({
        kmReading: ''
    });

    const fetchData = async () => {
        const [bookingsRes, vehiclesRes] = await Promise.all([
            axios.get('/api/bookings', { headers: { Authorization: `Bearer ${user.token}` } }),
            user.role === 'HR' ? axios.get('/api/vehicles', { headers: { Authorization: `Bearer ${user.token}` } }) : Promise.resolve({ data: [] })
        ]);
        setBookings(bookingsRes.data);
        setVehicles(vehiclesRes.data);
    };

    useEffect(() => { fetchData(); }, []);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!form.startTime || !form.endTime) {
            showToast('Please select both start and end times', 'error');
            return;
        }
        try {
            await axios.post('/api/bookings', form, { headers: { Authorization: `Bearer ${user.token}` } });
            showToast('Booking request submitted successfully!', 'success');
            setIsRequestModalOpen(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error creating booking';
            showToast(msg, 'error');
        }
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/bookings/${selectedBooking.id}/status`, actionForm, { headers: { Authorization: `Bearer ${user.token}` } });
            showToast(`Booking ${actionForm.status.toLowerCase()} successfully!`, 'success');
            setIsActionModalOpen(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error updating status';
            showToast(msg, 'error');
        }
    };

    const handleGateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                gateStatus: gateAction,
                startKm: gateAction === 'Departed' ? parseInt(gateForm.kmReading) : undefined,
                endKm: gateAction === 'Returned' ? parseInt(gateForm.kmReading) : undefined
            };

            await axios.put(`/api/bookings/${selectedBooking.id}/gate-status`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
            showToast(`Vehicle marked as ${gateAction.toLowerCase()}!`, 'success');
            setIsGateModalOpen(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error updating gate status';
            showToast(msg, 'error');
        }
    };

    const openGateModal = (booking, action) => {
        setSelectedBooking(booking);
        setGateAction(action);
        setGateForm({ kmReading: '' });
        setIsGateModalOpen(true);
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Bookings Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track and manage vehicle requests.</p>
                </div>
                {user.role === 'Requester' && (
                    <button className="btn btn-primary" onClick={() => setIsRequestModalOpen(true)}>
                        <Plus size={18} /> New Request
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>ID & Purpose</th>
                                <th style={{ padding: '1rem' }}>DateTime</th>
                                <th style={{ padding: '1rem' }}>Requester</th>
                                <th style={{ padding: '1rem' }}>Location</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600' }}>#{booking.id}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.purpose}</div>
                                        <div style={{ marginTop: '0.2rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '4px',
                                                background: booking.bookingType === 'Personal' ? 'rgba(168, 85, 247, 0.1)' : booking.bookingType === 'Guest' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: booking.bookingType === 'Personal' ? '#a855f7' : booking.bookingType === 'Guest' ? '#ec4899' : '#3b82f6',
                                                border: `1px solid ${booking.bookingType === 'Personal' ? 'rgba(168, 85, 247, 0.2)' : booking.bookingType === 'Guest' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                                            }}>
                                                {booking.bookingType}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{format(new Date(booking.startTime), 'MMM d, h:mm a')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>to {format(new Date(booking.endTime), 'h:mm a')}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{booking.requester?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {booking.requester?.employeeId}</div>
                                        {booking.requester?.mobileNumber && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                                                <a href={`tel:${booking.requester.mobileNumber}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }} title="Call Requester">
                                                    📞 <span style={{ textDecoration: 'underline' }}>{booking.requester.mobileNumber}</span>
                                                </a>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <MapPin size={12} /> {booking.pickupLocation} → {booking.dropLocation}
                                        </div>
                                        {(booking.startKm && booking.endKm) && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                                Dist: <strong>{booking.endKm - booking.startKm} km</strong>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <BookingStatusBadge status={booking.status} />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {user.role === 'HR' && booking.status === 'Pending' && (
                                                <button className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }} onClick={() => { setSelectedBooking(booking); setIsActionModalOpen(true); }}>
                                                    Manage
                                                </button>
                                            )}
                                            {user.role === 'Security' && booking.status === 'Approved' && (
                                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openGateModal(booking, 'Departed')}>
                                                    Mark Departure
                                                </button>
                                            )}
                                            {user.role === 'Security' && booking.status === 'Running' && (
                                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success)' }} onClick={() => openGateModal(booking, 'Returned')}>
                                                    Mark Return
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Modal */}
            <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="New Booking Request">
                <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Requester Info (Read-only) */}
                    <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Requester Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Name & ID</div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name} ({user.employeeId})</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.department || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Start Time</label>
                            <CustomDatePicker
                                selected={form.startTime}
                                onChange={date => setForm({ ...form, startTime: date })}
                                placeholderText="Select start time"
                                minDate={new Date()}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>End Time</label>
                            <CustomDatePicker
                                selected={form.endTime}
                                onChange={date => setForm({ ...form, endTime: date })}
                                placeholderText="Select end time"
                                minDate={form.startTime || new Date()}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Booking Type</label>
                        <select
                            className="form-control"
                            style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                            value={form.bookingType}
                            onChange={e => setForm({ ...form, bookingType: e.target.value })}
                            required
                        >
                            <option value="Official">Official</option>
                            <option value="Personal">Personal</option>
                            <option value="Guest">Guest</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Pickup Location</label>
                            <input type="text" style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }} value={form.pickupLocation} onChange={e => setForm({ ...form, pickupLocation: e.target.value })} placeholder="e.g. Office Gate 1" required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Drop Location</label>
                            <input type="text" style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }} value={form.dropLocation} onChange={e => setForm({ ...form, dropLocation: e.target.value })} placeholder="e.g. Site B" required />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Total Members Traveling</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                                value={form.passengers}
                                onChange={e => setForm({ ...form, passengers: parseInt(e.target.value) })}
                                required
                            />
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>(Including requester)</div>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Purpose of Travel</label>
                        <textarea style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required rows={3} placeholder="Provide details about the visit..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center', padding: '1rem' }}>Submit Request</button>
                </form>
            </Modal>


            {/* Gate Modal (Security) */}
            <Modal isOpen={isGateModalOpen} onClose={() => setIsGateModalOpen(false)} title={`Mark Vehicle ${gateAction}`}>
                <form onSubmit={handleGateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Requester Info Summary for Security */}
                    {selectedBooking && (
                        <div style={{ padding: '0.8rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px dashed rgba(59, 130, 246, 0.3)', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requester</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedBooking.requester?.name}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                        {selectedBooking.requester?.mobileNumber ? (
                                            <a href={`tel:${selectedBooking.requester.mobileNumber}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                {selectedBooking.requester.mobileNumber}
                                            </a>
                                        ) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Vehicle:</span> {selectedBooking.vehicle?.plateNumber} - {selectedBooking.vehicle?.model}
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                            {gateAction === 'Departed' ? 'Current Odometer Reading (Start KM)' : 'Current Odometer Reading (End KM)'}
                        </label>
                        <input
                            type="number"
                            min="0"
                            style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }}
                            value={gateForm.kmReading}
                            onChange={e => setGateForm({ ...gateForm, kmReading: e.target.value })}
                            required
                            placeholder="Enter KM reading..."
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center', padding: '1rem' }}>
                        Confirm {gateAction}
                    </button>
                </form>
            </Modal>

            {/* Action Modal (HR) */}
            <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title="Manage Booking Request">
                <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'var(--transition)' }}>

                    {/* Requester Details Summary */}
                    {selectedBooking && (
                        <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Requester Information</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Name</div>
                                    <div style={{ fontWeight: '600' }}>{selectedBooking.requester?.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employee ID</div>
                                    <div style={{ fontWeight: '600' }}>{selectedBooking.requester?.employeeId}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</div>
                                    <div style={{ fontWeight: '600' }}>{selectedBooking.requester?.department || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile</div>
                                    <div style={{ fontWeight: '600' }}>
                                        {selectedBooking.requester?.mobileNumber ? (
                                            <a href={`tel:${selectedBooking.requester.mobileNumber}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                {selectedBooking.requester.mobileNumber}
                                            </a>
                                        ) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Purpose</div>
                                <div style={{ fontWeight: '500', marginTop: '0.2rem' }}>{selectedBooking.purpose}</div>
                            </div>
                            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From</div>
                                    <div style={{ fontWeight: '600' }}>{format(new Date(selectedBooking.startTime), 'MMM d, h:mm a')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>To</div>
                                    <div style={{ fontWeight: '600' }}>{format(new Date(selectedBooking.endTime), 'MMM d, h:mm a')}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Select Action</label>
                        <select style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }} value={actionForm.status} onChange={e => setActionForm({ ...actionForm, status: e.target.value })}>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                        </select>
                    </div>
                    {actionForm.status === 'Approved' && (
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Allocate Vehicle</label>
                            <select style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }} value={actionForm.vehicleId} onChange={e => setActionForm({ ...actionForm, vehicleId: e.target.value })} required>
                                <option value="">Select a vehicle</option>
                                {vehicles.filter(v => v.status === 'Available').map(v => (
                                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.model}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Remarks</label>
                        <textarea style={{ width: '100%', padding: '0.6rem', marginTop: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)' }} value={actionForm.remarks} onChange={e => setActionForm({ ...actionForm, remarks: e.target.value })} required={actionForm.status === 'Rejected'} rows={3} placeholder="Add notes for the requester..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center', padding: '1rem' }}>Save Changes</button>
                </form>
            </Modal>

        </Layout>
    );
};

export default Bookings;
