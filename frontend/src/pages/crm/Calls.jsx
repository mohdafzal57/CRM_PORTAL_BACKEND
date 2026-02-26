/**
 * CRM Calls Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight,
    Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock,
    RefreshCw, User, Calendar
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Calls = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCall, setEditingCall] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        callType: 'outbound',
        status: 'completed',
        callPurpose: 'follow_up',
        callResult: '',
        startTime: '',
        duration: '',
        phoneNumber: '',
        contactName: '',
        contactEmail: '',
        notes: '',
        followUpDate: '',
        followUpAction: ''
    });

    const canWrite = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'].includes(user.role?.toUpperCase());
    const canDelete = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    const fetchCalls = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/calls`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    status: statusFilter,
                    callType: typeFilter,
                    page: pagination.page,
                    limit: 10
                }
            });
            
            if (data.success) {
                setCalls(data.data.calls);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, typeFilter, pagination.page]);

    useEffect(() => {
        fetchCalls();
    }, [fetchCalls]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                startTime: new Date(formData.startTime),
                duration: formData.duration ? parseInt(formData.duration) * 60 : 0, // Convert minutes to seconds
                followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined
            };

            if (editingCall) {
                await axios.put(`${API_BASE}/api/crm/calls/${editingCall._id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE}/api/crm/calls`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModalOpen(false);
            setEditingCall(null);
            resetForm();
            fetchCalls();
        } catch (error) {
            console.error('Error saving call:', error);
            alert(error.response?.data?.message || 'Error saving call');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (call) => {
        setEditingCall(call);
        setFormData({
            subject: call.subject || '',
            callType: call.callType || 'outbound',
            status: call.status || 'completed',
            callPurpose: call.callPurpose || 'follow_up',
            callResult: call.callResult || '',
            startTime: call.startTime ? new Date(call.startTime).toISOString().slice(0, 16) : '',
            duration: call.duration ? Math.floor(call.duration / 60).toString() : '',
            phoneNumber: call.phoneNumber || '',
            contactName: call.contactName || '',
            contactEmail: call.contactEmail || '',
            notes: call.notes || '',
            followUpDate: call.followUpDate ? new Date(call.followUpDate).toISOString().split('T')[0] : '',
            followUpAction: call.followUpAction || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this call log?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/crm/calls/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCalls();
        } catch (error) {
            console.error('Error deleting call:', error);
        }
    };

    const resetForm = () => {
        const now = new Date();
        setFormData({
            subject: '',
            callType: 'outbound',
            status: 'completed',
            callPurpose: 'follow_up',
            callResult: '',
            startTime: now.toISOString().slice(0, 16),
            duration: '',
            phoneNumber: '',
            contactName: '',
            contactEmail: '',
            notes: '',
            followUpDate: '',
            followUpAction: ''
        });
    };

    const typeIcons = {
        outbound: <PhoneOutgoing size={18} className="text-blue-500" />,
        inbound: <PhoneIncoming size={18} className="text-green-500" />,
        missed: <PhoneMissed size={18} className="text-red-500" />,
        scheduled: <Phone size={18} className="text-purple-500" />
    };

    const statusColors = {
        scheduled: 'bg-purple-100 text-purple-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        no_answer: 'bg-yellow-100 text-yellow-700',
        busy: 'bg-orange-100 text-orange-700',
        failed: 'bg-gray-100 text-gray-700'
    };

    const resultColors = {
        interested: 'bg-green-100 text-green-700',
        not_interested: 'bg-red-100 text-red-700',
        callback: 'bg-blue-100 text-blue-700',
        no_answer: 'bg-yellow-100 text-yellow-700',
        left_voicemail: 'bg-purple-100 text-purple-700',
        wrong_number: 'bg-gray-100 text-gray-700'
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Calls</h1>
                        <p className="text-gray-500">Log and track your calls ({pagination.total} total)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchCalls} className="p-2 hover:bg-gray-100 rounded-xl">
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {canWrite && (
                            <button
                                onClick={() => { setEditingCall(null); resetForm(); setModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg"
                            >
                                <Plus size={20} />
                                Log Call
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by subject, contact..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="outbound">Outbound</option>
                            <option value="inbound">Inbound</option>
                            <option value="missed">Missed</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="no_answer">No Answer</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Calls Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : calls.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Phone size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No calls logged</p>
                            {canWrite && (
                                <button onClick={() => { resetForm(); setModalOpen(true); }} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                                    Log Your First Call
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date/Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Result</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {calls.map((call) => (
                                        <tr key={call._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {typeIcons[call.callType]}
                                                    <span className="capitalize text-sm">{call.callType}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">{call.subject}</p>
                                                <p className="text-sm text-gray-500 capitalize">{call.callPurpose?.replace('_', ' ')}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-gray-800">{call.contactName || '-'}</p>
                                                        <p className="text-sm text-gray-500">{call.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">
                                                        {new Date(call.startTime).toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock size={14} />
                                                    <span className="text-sm">{formatDuration(call.duration)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {call.callResult ? (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${resultColors[call.callResult] || 'bg-gray-100 text-gray-600'}`}>
                                                        {call.callResult?.replace('_', ' ')}
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[call.status]}`}>
                                                        {call.status?.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {canWrite && (
                                                        <button onClick={() => handleEdit(call)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                            <Edit2 size={16} className="text-gray-500" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => handleDelete(call._id)} className="p-2 hover:bg-red-50 rounded-lg">
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && pagination.pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingCall ? 'Edit Call' : 'Log Call'}
                                </h2>
                                <button onClick={() => { setModalOpen(false); setEditingCall(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                        placeholder="Follow-up call with prospect"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Call Type</label>
                                        <select
                                            value={formData.callType}
                                            onChange={(e) => setFormData({ ...formData, callType: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="outbound">Outbound</option>
                                            <option value="inbound">Inbound</option>
                                            <option value="missed">Missed</option>
                                            <option value="scheduled">Scheduled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                        <select
                                            value={formData.callPurpose}
                                            onChange={(e) => setFormData({ ...formData, callPurpose: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="prospecting">Prospecting</option>
                                            <option value="follow_up">Follow Up</option>
                                            <option value="demo">Demo</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="support">Support</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                                        <input
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            min="0"
                                            placeholder="15"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                        <input
                                            type="text"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="+1 234 567 8900"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Result</label>
                                    <select
                                        value={formData.callResult}
                                        onChange={(e) => setFormData({ ...formData, callResult: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select result...</option>
                                        <option value="interested">Interested</option>
                                        <option value="not_interested">Not Interested</option>
                                        <option value="callback">Callback Requested</option>
                                        <option value="no_answer">No Answer</option>
                                        <option value="left_voicemail">Left Voicemail</option>
                                        <option value="wrong_number">Wrong Number</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        placeholder="Call notes and key points discussed..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                                        <input
                                            type="date"
                                            value={formData.followUpDate}
                                            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Action</label>
                                        <input
                                            type="text"
                                            value={formData.followUpAction}
                                            onChange={(e) => setFormData({ ...formData, followUpAction: e.target.value })}
                                            placeholder="Send proposal"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => { setModalOpen(false); setEditingCall(null); resetForm(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                                        {submitLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {editingCall ? 'Update' : 'Log Call'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CRMLayout>
    );
};

export default Calls;