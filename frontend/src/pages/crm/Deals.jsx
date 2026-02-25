/**
 * CRM Deals Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    DollarSign,
    Calendar,
    RefreshCw,
    Eye,
    TrendingUp
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Deals = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        value: '',
        stage: 'prospecting',
        probability: 10,
        expectedCloseDate: '',
        notes: ''
    });

    const canWrite = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'].includes(user.role?.toUpperCase());
    const canDelete = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDeals = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/deals`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: debouncedSearch,
                    stage: stageFilter,
                    page: pagination.page,
                    limit: 12
                }
            });
            
            if (data.success) {
                setDeals(data.data.deals);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, stageFilter, pagination.page]);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                value: Number(formData.value),
                probability: Number(formData.probability)
            };

            if (editingDeal) {
                await axios.put(`${API_BASE}/api/crm/deals/${editingDeal._id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE}/api/crm/deals`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModalOpen(false);
            setEditingDeal(null);
            resetForm();
            fetchDeals();
        } catch (error) {
            console.error('Error saving deal:', error);
            alert(error.response?.data?.message || 'Error saving deal');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (deal) => {
        setEditingDeal(deal);
        setFormData({
            title: deal.title || '',
            value: deal.value?.toString() || '',
            stage: deal.stage || 'prospecting',
            probability: deal.probability || 10,
            expectedCloseDate: deal.expectedCloseDate ? 
                new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
            notes: deal.notes || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this deal?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/crm/deals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDeals();
        } catch (error) {
            console.error('Error deleting deal:', error);
            alert(error.response?.data?.message || 'Error deleting deal');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            value: '',
            stage: 'prospecting',
            probability: 10,
            expectedCloseDate: '',
            notes: ''
        });
    };

    const stageColors = {
        prospecting: 'bg-blue-100 text-blue-700',
        qualification: 'bg-yellow-100 text-yellow-700',
        needs_analysis: 'bg-indigo-100 text-indigo-700',
        proposal: 'bg-purple-100 text-purple-700',
        negotiation: 'bg-orange-100 text-orange-700',
        closed_won: 'bg-green-100 text-green-700',
        closed_lost: 'bg-red-100 text-red-700'
    };

    const stageNames = {
        prospecting: 'Prospecting',
        qualification: 'Qualification',
        needs_analysis: 'Needs Analysis',
        proposal: 'Proposal',
        negotiation: 'Negotiation',
        closed_won: 'Closed Won',
        closed_lost: 'Closed Lost'
    };

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
                        <p className="text-gray-500">
                            Track your sales pipeline ({pagination.total} deals)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchDeals}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {canWrite && (
                            <button
                                onClick={() => {
                                    setEditingDeal(null);
                                    resetForm();
                                    setModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white 
                                           rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                            >
                                <Plus size={20} />
                                Add Deal
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
                                placeholder="Search deals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 
                                           rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={stageFilter}
                            onChange={(e) => {
                                setStageFilter(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Stages</option>
                            <option value="prospecting">Prospecting</option>
                            <option value="qualification">Qualification</option>
                            <option value="needs_analysis">Needs Analysis</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="closed_won">Closed Won</option>
                            <option value="closed_lost">Closed Lost</option>
                        </select>
                    </div>
                </div>

                {/* Deals Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <Briefcase size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No deals found</p>
                            <p className="text-sm">Start building your pipeline</p>
                            {canWrite && (
                                <button
                                    onClick={() => {
                                        setEditingDeal(null);
                                        resetForm();
                                        setModalOpen(true);
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                                >
                                    Create Your First Deal
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deals.map((deal) => (
                            <div
                                key={deal._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 
                                           hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 text-lg truncate">
                                            {deal.title}
                                        </h3>
                                        <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full 
                                                        ${stageColors[deal.stage] || 'bg-gray-100 text-gray-600'}`}>
                                            {stageNames[deal.stage] || deal.stage}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        {canWrite && (
                                            <button
                                                onClick={() => handleEdit(deal)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <Edit2 size={16} className="text-gray-400" />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(deal._id)}
                                                className="p-2 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <DollarSign size={18} />
                                            <span className="text-sm">Value</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-800">
                                            ${deal.value?.toLocaleString() || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Probability</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${deal.probability || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 w-10 text-right">
                                                {deal.probability || 0}%
                                            </span>
                                        </div>
                                    </div>

                                    {deal.expectedCloseDate && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={18} />
                                                <span className="text-sm">Close Date</span>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-600">
                                                    {deal.owner?.fullName?.charAt(0)?.toUpperCase() || 
                                                     deal.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {deal.owner?.fullName || deal.owner?.name || 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                        <span className="text-sm text-gray-500">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.pages}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Create/Edit Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingDeal ? 'Edit Deal' : 'Add New Deal'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setModalOpen(false);
                                        setEditingDeal(null);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deal Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Enterprise License Deal"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Value ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            required
                                            min="0"
                                            placeholder="50000"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Probability (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.probability}
                                            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stage
                                        </label>
                                        <select
                                            value={formData.stage}
                                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="prospecting">Prospecting</option>
                                            <option value="qualification">Qualification</option>
                                            <option value="needs_analysis">Needs Analysis</option>
                                            <option value="proposal">Proposal</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="closed_won">Closed Won</option>
                                            <option value="closed_lost">Closed Lost</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expected Close Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expectedCloseDate}
                                            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        placeholder="Add notes about this deal..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalOpen(false);
                                            setEditingDeal(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-xl 
                                                   hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {editingDeal ? 'Update' : 'Create'}
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

export default Deals;