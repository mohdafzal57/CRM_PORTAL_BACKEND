/**
 * CRM Meetings Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight,
    Calendar, Clock, MapPin, Video, Users, RefreshCw, Eye,
    CheckCircle, XCircle, Phone
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Meetings = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        meetingType: 'online',
        status: 'scheduled',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        location: '',
        meetingLink: '',
        notes: ''
    });

    const canWrite = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'].includes(user.role?.toUpperCase());
    const canDelete = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    const fetchMeetings = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/meetings`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    status: statusFilter,
                    page: pagination.page,
                    limit: 10
                }
            });
            
            if (data.success) {
                setMeetings(data.data.meetings);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, pagination.page]);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                startDate: new Date(`${formData.startDate}T${formData.startTime}`),
                endDate: new Date(`${formData.endDate || formData.startDate}T${formData.endTime}`)
            };

            if (editingMeeting) {
                await axios.put(`${API_BASE}/api/crm/meetings/${editingMeeting._id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE}/api/crm/meetings`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModalOpen(false);
            setEditingMeeting(null);
            resetForm();
            fetchMeetings();
        } catch (error) {
            console.error('Error saving meeting:', error);
            alert(error.response?.data?.message || 'Error saving meeting');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (meeting) => {
        setEditingMeeting(meeting);
        const startDate = new Date(meeting.startDate);
        const endDate = new Date(meeting.endDate);
        
        setFormData({
            title: meeting.title || '',
            description: meeting.description || '',
            meetingType: meeting.meetingType || 'online',
            status: meeting.status || 'scheduled',
            startDate: startDate.toISOString().split('T')[0],
            startTime: meeting.startTime || startDate.toTimeString().slice(0, 5),
            endDate: endDate.toISOString().split('T')[0],
            endTime: meeting.endTime || endDate.toTimeString().slice(0, 5),
            location: meeting.location || '',
            meetingLink: meeting.meetingLink || '',
            notes: meeting.notes || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/crm/meetings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMeetings();
        } catch (error) {
            console.error('Error deleting meeting:', error);
            alert(error.response?.data?.message || 'Error deleting meeting');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE}/api/crm/meetings/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMeetings();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const resetForm = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
            title: '',
            description: '',
            meetingType: 'online',
            status: 'scheduled',
            startDate: today,
            startTime: '09:00',
            endDate: today,
            endTime: '10:00',
            location: '',
            meetingLink: '',
            notes: ''
        });
    };

    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        rescheduled: 'bg-yellow-100 text-yellow-700',
        no_show: 'bg-gray-100 text-gray-700'
    };

    const typeIcons = {
        online: <Video size={16} />,
        in_person: <MapPin size={16} />,
        phone: <Phone size={16} />,
        video_conference: <Video size={16} />
    };

    const formatDateTime = (date, time) => {
        const d = new Date(date);
        return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${time || d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Meetings</h1>
                        <p className="text-gray-500">Schedule and manage your meetings ({pagination.total} total)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchMeetings} className="p-2 hover:bg-gray-100 rounded-xl">
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {canWrite && (
                            <button
                                onClick={() => { setEditingMeeting(null); resetForm(); setModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg"
                            >
                                <Plus size={20} />
                                Schedule Meeting
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
                                placeholder="Search meetings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rescheduled">Rescheduled</option>
                            <option value="no_show">No Show</option>
                        </select>
                    </div>
                </div>

                {/* Meetings List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 bg-white rounded-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Calendar size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">No meetings scheduled</p>
                                {canWrite && (
                                    <button
                                        onClick={() => { resetForm(); setModalOpen(true); }}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                                    >
                                        Schedule Your First Meeting
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        meetings.map((meeting) => (
                            <div key={meeting._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${
                                            meeting.meetingType === 'online' ? 'bg-blue-100' :
                                            meeting.meetingType === 'in_person' ? 'bg-green-100' :
                                            'bg-purple-100'
                                        }`}>
                                            {typeIcons[meeting.meetingType] || <Calendar size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 text-lg">{meeting.title}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {formatDateTime(meeting.startDate, meeting.startTime)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {meeting.startTime} - {meeting.endTime}
                                                </div>
                                                {meeting.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {meeting.location}
                                                    </div>
                                                )}
                                            </div>
                                            {meeting.description && (
                                                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{meeting.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusColors[meeting.status]}`}>
                                            {meeting.status?.replace('_', ' ')}
                                        </span>
                                        
                                        <div className="flex items-center gap-1">
                                            {meeting.status === 'scheduled' && canWrite && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(meeting._id, 'completed')}
                                                        className="p-2 hover:bg-green-50 rounded-lg"
                                                        title="Mark Completed"
                                                    >
                                                        <CheckCircle size={18} className="text-green-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(meeting._id, 'cancelled')}
                                                        className="p-2 hover:bg-red-50 rounded-lg"
                                                        title="Cancel"
                                                    >
                                                        <XCircle size={18} className="text-red-500" />
                                                    </button>
                                                </>
                                            )}
                                            {canWrite && (
                                                <button onClick={() => handleEdit(meeting)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Edit2 size={18} className="text-gray-500" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(meeting._id)} className="p-2 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={18} className="text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {meeting.meetingLink && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <a 
                                            href={meeting.meetingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                                        >
                                            <Video size={16} />
                                            Join Meeting
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.pages}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
                                </h2>
                                <button onClick={() => { setModalOpen(false); setEditingMeeting(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Meeting with Client"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.meetingType}
                                            onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="online">Online</option>
                                            <option value="in_person">In Person</option>
                                            <option value="phone">Phone</option>
                                            <option value="video_conference">Video Conference</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="rescheduled">Rescheduled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End *</label>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                required
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Office Room 101 / Google Meet"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={formData.meetingLink}
                                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Meeting agenda and notes..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => { setModalOpen(false); setEditingMeeting(null); resetForm(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                                        {submitLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {editingMeeting ? 'Update' : 'Schedule'}
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

export default Meetings;