/**
 * CRM Leads Management Page
 * Full CRUD operations with filtering, search, and pagination
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
    Mail,
    Phone,
    Building,
    MoreVertical,
    RefreshCw,
    Download,
    Upload,
    Eye,
    ArrowUpDown,
    Calendar,
    DollarSign,
    Tag
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Leads = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [viewingLead, setViewingLead] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        status: 'new',
        source: 'website',
        priority: 'medium',
        estimatedValue: '',
        notes: ''
    });

    // Check permissions based on role
    const canWrite = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'].includes(user.role?.toUpperCase());
    const canDelete = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch leads from API
    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/leads`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: debouncedSearch,
                    status: statusFilter,
                    source: sourceFilter,
                    page: pagination.page,
                    limit: 10,
                    sortBy,
                    sortOrder
                }
            });
            
            if (data.success) {
                setLeads(data.data.leads);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter, sourceFilter, pagination.page, sortBy, sortOrder]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Handle form submission (create/update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : 0
            };

            if (editingLead) {
                await axios.put(`${API_BASE}/api/crm/leads/${editingLead._id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE}/api/crm/leads`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModalOpen(false);
            setEditingLead(null);
            resetForm();
            fetchLeads();
        } catch (error) {
            console.error('Error saving lead:', error);
            alert(error.response?.data?.message || 'Error saving lead');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Handle edit button click
    const handleEdit = (lead) => {
        setEditingLead(lead);
        setFormData({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            company: lead.company || '',
            position: lead.position || '',
            status: lead.status || 'new',
            source: lead.source || 'website',
            priority: lead.priority || 'medium',
            estimatedValue: lead.estimatedValue?.toString() || '',
            notes: lead.notes || ''
        });
        setModalOpen(true);
    };

    // Handle view button click
    const handleView = async (lead) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/leads/${lead._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setViewingLead(data.data);
                setViewModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching lead details:', error);
            // Fallback to showing basic lead data
            setViewingLead({ lead, activities: [] });
            setViewModalOpen(true);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/crm/leads/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeads();
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert(error.response?.data?.message || 'Error deleting lead');
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedLeads.length === 0) return;
        if (!window.confirm(`Delete ${selectedLeads.length} selected leads?`)) return;

        try {
            const token = localStorage.getItem('token');
            await Promise.all(
                selectedLeads.map(id => 
                    axios.delete(`${API_BASE}/api/crm/leads/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );
            setSelectedLeads([]);
            fetchLeads();
        } catch (error) {
            console.error('Error deleting leads:', error);
            alert('Error deleting some leads');
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            position: '',
            status: 'new',
            source: 'website',
            priority: 'medium',
            estimatedValue: '',
            notes: ''
        });
    };

    // Toggle sort column
    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(l => l._id));
        }
    };

    // Toggle single select
    const toggleSelect = (id) => {
        setSelectedLeads(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Status color mapping
    const statusColors = {
        new: 'bg-blue-100 text-blue-700',
        contacted: 'bg-yellow-100 text-yellow-700',
        qualified: 'bg-green-100 text-green-700',
        proposal: 'bg-purple-100 text-purple-700',
        negotiation: 'bg-orange-100 text-orange-700',
        lost: 'bg-red-100 text-red-700',
        converted: 'bg-emerald-100 text-emerald-700'
    };

    // Priority color mapping
    const priorityColors = {
        low: 'bg-gray-100 text-gray-600',
        medium: 'bg-blue-100 text-blue-600',
        high: 'bg-orange-100 text-orange-600',
        urgent: 'bg-red-100 text-red-600'
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                        <p className="text-gray-500">
                            Manage your sales leads ({pagination.total} total)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedLeads.length > 0 && canDelete && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white 
                                           rounded-xl hover:bg-red-600 transition-colors"
                            >
                                <Trash2 size={18} />
                                Delete ({selectedLeads.length})
                            </button>
                        )}
                        <button
                            onClick={fetchLeads}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {canWrite && (
                            <button
                                onClick={() => {
                                    setEditingLead(null);
                                    resetForm();
                                    setModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white 
                                           rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                            >
                                <Plus size={20} />
                                Add Lead
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 
                                           rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500
                                           bg-white text-gray-800"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl
                                           focus:outline-none focus:ring-2 focus:ring-blue-500
                                           bg-white text-gray-800"
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="proposal">Proposal</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="lost">Lost</option>
                                <option value="converted">Converted</option>
                            </select>

                            <select
                                value={sourceFilter}
                                onChange={(e) => {
                                    setSourceFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl
                                           focus:outline-none focus:ring-2 focus:ring-blue-500
                                           bg-white text-gray-800"
                            >
                                <option value="all">All Sources</option>
                                <option value="website">Website</option>
                                <option value="referral">Referral</option>
                                <option value="social_media">Social Media</option>
                                <option value="advertisement">Advertisement</option>
                                <option value="cold_call">Cold Call</option>
                                <option value="email_campaign">Email Campaign</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Users size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No leads found</p>
                            <p className="text-sm">Try adjusting your filters or add a new lead</p>
                            {canWrite && (
                                <button
                                    onClick={() => {
                                        setEditingLead(null);
                                        resetForm();
                                        setModalOpen(true);
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                                >
                                    Add Your First Lead
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.length === leads.length && leads.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th 
                                            className="px-4 py-4 text-left text-xs font-semibold text-gray-500 
                                                       uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => toggleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Lead
                                                <ArrowUpDown size={14} />
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th 
                                            className="px-4 py-4 text-left text-xs font-semibold text-gray-500 
                                                       uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => toggleSort('status')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Status
                                                <ArrowUpDown size={14} />
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Assigned To
                                        </th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leads.map((lead) => (
                                        <tr 
                                            key={lead._id} 
                                            className={`hover:bg-gray-50 transition-colors
                                                       ${selectedLeads.includes(lead._id) ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.includes(lead._id)}
                                                    onChange={() => toggleSelect(lead._id)}
                                                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full 
                                                                    flex items-center justify-center flex-shrink-0">
                                                        <span className="text-blue-600 font-semibold">
                                                            {lead.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{lead.name}</p>
                                                        <p className="text-sm text-gray-500 capitalize">{lead.source?.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="flex-shrink-0" />
                                                        <span className="truncate max-w-[180px]">{lead.email}</span>
                                                    </div>
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Phone size={14} className="flex-shrink-0" />
                                                            {lead.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {lead.company ? (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Building size={14} className="flex-shrink-0" />
                                                        <span className="truncate max-w-[150px]">{lead.company}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize
                                                                 ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize
                                                                 ${priorityColors[lead.priority] || 'bg-gray-100 text-gray-600'}`}>
                                                    {lead.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {lead.assignedTo?.fullName || lead.assignedTo?.name || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleView(lead)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                    {canWrite && (
                                                        <button
                                                            onClick={() => handleEdit(lead)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} className="text-gray-500" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(lead._id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
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
                            <p className="text-sm text-gray-500">
                                Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
                                    {pagination.page}
                                </span>
                                <span className="text-gray-400">of {pagination.pages}</span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingLead ? 'Edit Lead' : 'Add New Lead'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setModalOpen(false);
                                        setEditingLead(null);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 234 567 8900"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Company */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            placeholder="Acme Inc."
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Position */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            placeholder="Marketing Manager"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Estimated Value */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Value ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.estimatedValue}
                                            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                                            min="0"
                                            placeholder="10000"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="proposal">Proposal</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="lost">Lost</option>
                                            <option value="converted">Converted</option>
                                        </select>
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Source
                                        </label>
                                        <select
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="website">Website</option>
                                            <option value="referral">Referral</option>
                                            <option value="social_media">Social Media</option>
                                            <option value="advertisement">Advertisement</option>
                                            <option value="cold_call">Cold Call</option>
                                            <option value="email_campaign">Email Campaign</option>
                                            <option value="trade_show">Trade Show</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={3}
                                            placeholder="Add any relevant notes about this lead..."
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalOpen(false);
                                            setEditingLead(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-xl 
                                                   hover:bg-blue-600 transition-colors disabled:opacity-50
                                                   disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submitLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {editingLead ? 'Update Lead' : 'Create Lead'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Details Modal */}
                {viewModalOpen && viewingLead && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold text-gray-800">Lead Details</h2>
                                <button
                                    onClick={() => {
                                        setViewModalOpen(false);
                                        setViewingLead(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Lead Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {(viewingLead.lead?.name || viewingLead.name)?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {viewingLead.lead?.name || viewingLead.name}
                                        </h3>
                                        <p className="text-gray-500">
                                            {viewingLead.lead?.company || viewingLead.company || 'No company'}
                                            {(viewingLead.lead?.position || viewingLead.position) && 
                                                ` • ${viewingLead.lead?.position || viewingLead.position}`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize
                                                             ${statusColors[viewingLead.lead?.status || viewingLead.status]}`}>
                                                {viewingLead.lead?.status || viewingLead.status}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize
                                                             ${priorityColors[viewingLead.lead?.priority || viewingLead.priority]}`}>
                                                {viewingLead.lead?.priority || viewingLead.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lead Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Mail size={16} />
                                            <span className="text-sm">Email</span>
                                        </div>
                                        <p className="font-medium text-gray-800">
                                            {viewingLead.lead?.email || viewingLead.email}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Phone size={16} />
                                            <span className="text-sm">Phone</span>
                                        </div>
                                        <p className="font-medium text-gray-800">
                                            {viewingLead.lead?.phone || viewingLead.phone || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Tag size={16} />
                                            <span className="text-sm">Source</span>
                                        </div>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {(viewingLead.lead?.source || viewingLead.source)?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <DollarSign size={16} />
                                            <span className="text-sm">Estimated Value</span>
                                        </div>
                                        <p className="font-medium text-gray-800">
                                            ${(viewingLead.lead?.estimatedValue || viewingLead.estimatedValue || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Calendar size={16} />
                                            <span className="text-sm">Created</span>
                                        </div>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(viewingLead.lead?.createdAt || viewingLead.createdAt)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Users size={16} />
                                            <span className="text-sm">Assigned To</span>
                                        </div>
                                        <p className="font-medium text-gray-800">
                                            {viewingLead.lead?.assignedTo?.fullName || 
                                             viewingLead.assignedTo?.fullName || 
                                             viewingLead.lead?.assignedTo?.name || 
                                             viewingLead.assignedTo?.name || 
                                             '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {(viewingLead.lead?.notes || viewingLead.notes) && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                                        <p className="text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                                            {viewingLead.lead?.notes || viewingLead.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Activities Section */}
                                {viewingLead.activities && viewingLead.activities.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3">Recent Activities</h4>
                                        <div className="space-y-3">
                                            {viewingLead.activities.map((activity, index) => (
                                                <div 
                                                    key={activity._id || index}
                                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                                                >
                                                    <div className={`p-2 rounded-lg ${
                                                        activity.type === 'call' ? 'bg-green-100' :
                                                        activity.type === 'email' ? 'bg-blue-100' :
                                                        activity.type === 'meeting' ? 'bg-purple-100' :
                                                        'bg-gray-100'
                                                    }`}>
                                                        <Phone size={16} className={
                                                            activity.type === 'call' ? 'text-green-600' :
                                                            activity.type === 'email' ? 'text-blue-600' :
                                                            activity.type === 'meeting' ? 'text-purple-600' :
                                                            'text-gray-600'
                                                        } />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">{activity.title}</p>
                                                        {activity.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {formatDate(activity.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setViewModalOpen(false);
                                            setViewingLead(null);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Close
                                    </button>
                                    {canWrite && (
                                        <button
                                            onClick={() => {
                                                setViewModalOpen(false);
                                                handleEdit(viewingLead.lead || viewingLead);
                                            }}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-xl 
                                                       hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <Edit2 size={16} />
                                            Edit Lead
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CRMLayout>
    );
};

export default Leads;