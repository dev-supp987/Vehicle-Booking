import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../lib/axios';
import { Plus, Car, PenTool as Tool, CheckCircle, Edit2, Trash2 } from 'lucide-react';

const Vehicles = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [formData, setFormData] = useState({ plateNumber: '', model: '', currentLocation: 'Main Garage' });
    const [loading, setLoading] = useState(false);

    const fetchVehicles = async () => {
        try {
            const { data } = await axios.get('/api/vehicles', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setVehicles(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await axios.put(`/api/vehicles/${selectedVehicle.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            } else {
                await axios.post('/api/vehicles', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }
            showToast(`Vehicle ${isEditMode ? 'updated' : 'added'} successfully!`, 'success');
            fetchVehicles();
            closeModal();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error processing request';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
        try {
            await axios.delete(`/api/vehicles/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast('Vehicle removed successfully', 'success');
            fetchVehicles();
        } catch (err) {
            showToast('Error deleting vehicle', 'error');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/vehicles/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast(`Vehicle marked as ${status}`, 'success');
            fetchVehicles();
        } catch (err) { showToast('Error updating vehicle status', 'error'); }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ plateNumber: '', model: '', currentLocation: 'Main Garage' });
        setIsModalOpen(true);
    };

    const openEditModal = (vehicle) => {
        setIsEditMode(true);
        setSelectedVehicle(vehicle);
        setFormData({ plateNumber: vehicle.plateNumber, model: vehicle.model, currentLocation: vehicle.currentLocation });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Fleet Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor company vehicles.</p>
                </div>
                {user.role === 'HR' && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} /> Add Vehicle
                    </button>
                )}
            </div>

            <div className="dashboard-grid" style={{ padding: 0 }}>
                {vehicles.map((v) => (
                    <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '10px' }}>
                                    <Car size={24} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{v.plateNumber}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.model}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    background: v.status === 'Available' ? '#dcfce7' : v.status === 'Under Maintenance' ? '#fee2e2' : '#e0f2fe',
                                    color: v.status === 'Available' ? '#166534' : v.status === 'Under Maintenance' ? '#991b1b' : '#075985'
                                }}>
                                    {v.status}
                                </span>
                                {user.role === 'HR' && (
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                            onClick={() => openEditModal(v)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            title="Edit Vehicle"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            title="Delete Vehicle"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '0.5rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Current Location:</span>
                                <span>{v.currentLocation || 'Main Garage'}</span>
                            </div>
                        </div>

                        {(user.role === 'HR' || user.role === 'Security') && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {v.status === 'Available' ? (
                                    <button className="btn" style={{ flex: 1, fontSize: '0.8rem', border: '1px solid #e2e8f0' }} onClick={() => updateStatus(v.id, 'Under Maintenance')}>
                                        <Tool size={14} /> Send to Maintenance
                                    </button>
                                ) : v.status === 'Under Maintenance' ? (
                                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => updateStatus(v.id, 'Available')}>
                                        <CheckCircle size={14} /> Mark Available
                                    </button>
                                ) : null}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Plate Number</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. ABC-1234"
                            value={formData.plateNumber}
                            onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Vehicle Model</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Toyota Innova"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Main Garage"
                            value={formData.currentLocation}
                            onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" style={{ flex: 1, border: '1px solid #e2e8f0' }} onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Vehicle'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Vehicles;

