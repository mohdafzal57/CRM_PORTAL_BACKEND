/**
 * CRM Quotes Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight,
    FileText, DollarSign, Calendar, RefreshCw, Eye, Copy,
    CheckCircle, XCircle, Send, Download, Minus, User
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Quotes = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState(null);
    const [viewingQuote, setViewingQuote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        status: 'draft',
        expiryDate: '',
        items: [{ productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
        notes: '',
        termsAndConditions: '',
        shippingCost: 0,
        billingAddress: {
            name: '',
            company: '',
            email: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    const canWrite = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'].includes(user.role?.toUpperCase());
    const canDelete = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    const fetchQuotes = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/quotes`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    status: statusFilter,
                    page: pagination.page,
                    limit: 10
                }
            });
            
            if (data.success) {
                setQuotes(data.data.quotes);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, pagination.page]);

    useEffect(() => {
        fetchQuotes();
        fetchProducts();
    }, [fetchQuotes]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/products/list/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            
            // Calculate item totals
            const items = formData.items.map(item => {
                const subtotal = item.quantity * item.unitPrice;
                const discountAmount = (subtotal * (item.discount || 0)) / 100;
                const afterDiscount = subtotal - discountAmount;
                const taxAmount = (afterDiscount * (item.tax || 0)) / 100;
                return {
                    ...item,
                    total: afterDiscount + taxAmount
                };
            });

            const submitData = {
                ...formData,
                items,
                expiryDate: new Date(formData.expiryDate),
                shippingCost: parseFloat(formData.shippingCost) || 0
            };

            if (editingQuote) {
                await axios.put(`${API_BASE}/api/crm/quotes/${editingQuote._id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE}/api/crm/quotes`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModalOpen(false);
            setEditingQuote(null);
            resetForm();
            fetchQuotes();
        } catch (error) {
            console.error('Error saving quote:', error);
            alert(error.response?.data?.message || 'Error saving quote');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleView = async (quote) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/quotes/${quote._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setViewingQuote(data.data);
                setViewModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            setViewingQuote(quote);
            setViewModalOpen(true);
        }
    };

    const handleEdit = (quote) => {
        setEditingQuote(quote);
        setFormData({
            title: quote.title || '',
            status: quote.status || 'draft',
            expiryDate: quote.expiryDate ? new Date(quote.expiryDate).toISOString().split('T')[0] : '',
            items: quote.items?.length > 0 ? quote.items.map(item => ({
                productName: item.productName || '',
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                discount: item.discount || 0,
                tax: item.tax || 0
            })) : [{ productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
            notes: quote.notes || '',
            termsAndConditions: quote.termsAndConditions || '',
            shippingCost: quote.shippingCost || 0,
            billingAddress: quote.billingAddress || {
                name: '',
                company: '',
                email: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quote?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/crm/quotes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert(error.response?.data?.message || 'Error deleting quote');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE}/api/crm/quotes/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchQuotes();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleClone = async (id) => {
        if (!window.confirm('Create a new revision of this quote?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/crm/quotes/${id}/clone`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error cloning quote:', error);
            alert(error.response?.data?.message || 'Error cloning quote');
        }
    };

    const handleConvertToDeal = async (id) => {
        if (!window.confirm('Convert this quote to a deal?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/crm/quotes/${id}/convert-to-deal`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuotes();
            alert('Deal created successfully!');
        } catch (error) {
            console.error('Error converting to deal:', error);
            alert(error.response?.data?.message || 'Error converting to deal');
        }
    };

    const resetForm = () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        
        setFormData({
            title: '',
            status: 'draft',
            expiryDate: futureDate.toISOString().split('T')[0],
            items: [{ productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
            notes: '',
            termsAndConditions: '',
            shippingCost: 0,
            billingAddress: {
                name: '',
                company: '',
                email: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const selectProduct = (index, productId) => {
        const product = products.find(p => p._id === productId);
        if (product) {
            const newItems = [...formData.items];
            newItems[index] = {
                ...newItems[index],
                productName: product.name,
                unitPrice: product.unitPrice,
                tax: product.taxRate || 0
            };
            setFormData({ ...formData, items: newItems });
        }
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => {
            const subtotal = item.quantity * item.unitPrice;
            const discount = (subtotal * (item.discount || 0)) / 100;
            return sum + (subtotal - discount);
        }, 0);
    };

    const calculateTotalDiscount = () => {
        return formData.items.reduce((sum, item) => {
            const subtotal = item.quantity * item.unitPrice;
            return sum + (subtotal * (item.discount || 0)) / 100;
        }, 0);
    };

    const calculateTax = () => {
        return formData.items.reduce((sum, item) => {
            const subtotal = item.quantity * item.unitPrice;
            const discount = (subtotal * (item.discount || 0)) / 100;
            const afterDiscount = subtotal - discount;
            return sum + (afterDiscount * (item.tax || 0)) / 100;
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() + (parseFloat(formData.shippingCost) || 0);
    };

    const statusColors = {
        draft: 'bg-gray-100 text-gray-700',
        pending: 'bg-yellow-100 text-yellow-700',
        sent: 'bg-blue-100 text-blue-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        expired: 'bg-orange-100 text-orange-700',
        revised: 'bg-purple-100 text-purple-700'
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
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
                        <h1 className="text-2xl font-bold text-gray-800">Quotes</h1>
                        <p className="text-gray-500">Create and manage sales quotes ({pagination.total} total)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchQuotes} className="p-2 hover:bg-gray-100 rounded-xl">
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {canWrite && (
                            <button
                                onClick={() => { setEditingQuote(null); resetForm(); setModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg"
                            >
                                <Plus size={20} />
                                Create Quote
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
                                placeholder="Search quotes..."
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
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="sent">Sent</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                {/* Quotes Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : quotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No quotes found</p>
                            <p className="text-sm">Create your first quote to get started</p>
                            {canWrite && (
                                <button
                                    onClick={() => { resetForm(); setModalOpen(true); }}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                                >
                                    Create Your First Quote
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Quote #</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {quotes.map((quote) => (
                                        <tr key={quote._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-blue-500" />
                                                    <span className="font-medium text-gray-800">{quote.quoteNumber}</span>
                                                    {quote.version > 1 && (
                                                        <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                                                            v{quote.version}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800 truncate max-w-[200px]">{quote.title}</p>
                                                <p className="text-sm text-gray-500">{quote.items?.length || 0} items</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-semibold text-gray-800">
                                                    <DollarSign size={16} className="text-green-500" />
                                                    {(quote.grandTotal || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusColors[quote.status]}`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">{formatDate(quote.expiryDate)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium text-blue-600">
                                                            {quote.owner?.fullName?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-600">{quote.owner?.fullName || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleView(quote)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                                        title="View"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                    
                                                    {quote.status === 'draft' && canWrite && (
                                                        <button
                                                            onClick={() => handleStatusChange(quote._id, 'sent')}
                                                            className="p-2 hover:bg-blue-50 rounded-lg"
                                                            title="Send Quote"
                                                        >
                                                            <Send size={16} className="text-blue-500" />
                                                        </button>
                                                    )}
                                                    
                                                    {quote.status === 'sent' && canWrite && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(quote._id, 'accepted')}
                                                                className="p-2 hover:bg-green-50 rounded-lg"
                                                                title="Mark Accepted"
                                                            >
                                                                <CheckCircle size={16} className="text-green-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(quote._id, 'rejected')}
                                                                className="p-2 hover:bg-red-50 rounded-lg"
                                                                title="Mark Rejected"
                                                            >
                                                                <XCircle size={16} className="text-red-500" />
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {quote.status === 'accepted' && canWrite && !quote.deal && (
                                                        <button
                                                            onClick={() => handleConvertToDeal(quote._id)}
                                                            className="p-2 hover:bg-green-50 rounded-lg"
                                                            title="Convert to Deal"
                                                        >
                                                            <DollarSign size={16} className="text-green-500" />
                                                        </button>
                                                    )}
                                                    
                                                    {canWrite && (
                                                        <button
                                                            onClick={() => handleClone(quote._id)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                                            title="Clone/Revise"
                                                        >
                                                            <Copy size={16} className="text-gray-500" />
                                                        </button>
                                                    )}
                                                    
                                                    {canWrite && quote.status === 'draft' && (
                                                        <button
                                                            onClick={() => handleEdit(quote)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} className="text-gray-500" />
                                                        </button>
                                                    )}
                                                    
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(quote._id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg"
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
                                Page {pagination.page} of {pagination.pages}
                            </p>
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

                {/* Create/Edit Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingQuote ? 'Edit Quote' : 'Create Quote'}
                                </h2>
                                <button
                                    onClick={() => { setModalOpen(false); setEditingQuote(null); resetForm(); }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quote Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="Website Development Project"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiry Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Billing Address */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Billing Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={formData.billingAddress.name}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    billingAddress: { ...formData.billingAddress, name: e.target.value }
                                                })}
                                                placeholder="John Doe"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Company</label>
                                            <input
                                                type="text"
                                                value={formData.billingAddress.company}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    billingAddress: { ...formData.billingAddress, company: e.target.value }
                                                })}
                                                placeholder="Acme Inc."
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.billingAddress.email}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    billingAddress: { ...formData.billingAddress, email: e.target.value }
                                                })}
                                                placeholder="john@example.com"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-gray-700">Line Items</h3>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                                        >
                                            <Plus size={16} />
                                            Add Item
                                        </button>
                                    </div>
                                    
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                                            <div className="col-span-3">Product/Service</div>
                                            <div className="col-span-3">Description</div>
                                            <div className="col-span-1 text-center">Qty</div>
                                            <div className="col-span-2 text-right">Price</div>
                                            <div className="col-span-1 text-center">Disc%</div>
                                            <div className="col-span-1 text-center">Tax%</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        
                                        {/* Items */}
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t border-gray-100 items-center">
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        value={item.productName}
                                                        onChange={(e) => updateItem(index, 'productName', e.target.value)}
                                                        placeholder="Product name"
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        list={`products-${index}`}
                                                    />
                                                    <datalist id={`products-${index}`}>
                                                        {products.map(p => (
                                                            <option key={p._id} value={p.name} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Description"
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        min="1"
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <input
                                                        type="number"
                                                        value={item.discount}
                                                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        max="100"
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <input
                                                        type="number"
                                                        value={item.tax}
                                                        onChange={(e) => updateItem(index, 'tax', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        max="100"
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="col-span-1 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={formData.items.length === 1}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg disabled:opacity-30"
                                                    >
                                                        <Minus size={16} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-2 p-4 bg-gray-50 rounded-xl">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(calculateSubtotal() + calculateTotalDiscount())}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Discount:</span>
                                            <span className="font-medium text-red-500">-{formatCurrency(calculateTotalDiscount())}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tax:</span>
                                            <span className="font-medium">{formatCurrency(calculateTax())}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Shipping:</span>
                                            <input
                                                type="number"
                                                value={formData.shippingCost}
                                                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                                                min="0"
                                                step="0.01"
                                                className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                            <span>Total:</span>
                                            <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes & Terms */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={3}
                                            placeholder="Additional notes for the client..."
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                                        <textarea
                                            value={formData.termsAndConditions}
                                            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                            rows={3}
                                            placeholder="Payment terms, delivery conditions..."
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => { setModalOpen(false); setEditingQuote(null); resetForm(); }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {editingQuote ? 'Update Quote' : 'Create Quote'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Quote Modal */}
                {viewModalOpen && viewingQuote && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{viewingQuote.title}</h2>
                                    <p className="text-sm text-gray-500">{viewingQuote.quoteNumber}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusColors[viewingQuote.status]}`}>
                                        {viewingQuote.status}
                                    </span>
                                    <button
                                        onClick={() => { setViewModalOpen(false); setViewingQuote(null); }}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Quote Info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                                        <p className="font-medium">{formatDate(viewingQuote.issueDate)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                                        <p className="font-medium">{formatDate(viewingQuote.expiryDate)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Owner</p>
                                        <p className="font-medium">{viewingQuote.owner?.fullName || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Version</p>
                                        <p className="font-medium">v{viewingQuote.version || 1}</p>
                                    </div>
                                </div>

                                {/* Billing Info */}
                                {viewingQuote.billingAddress?.name && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bill To</h4>
                                        <p className="text-gray-800 font-medium">{viewingQuote.billingAddress.name}</p>
                                        {viewingQuote.billingAddress.company && (
                                            <p className="text-gray-600">{viewingQuote.billingAddress.company}</p>
                                        )}
                                        {viewingQuote.billingAddress.email && (
                                            <p className="text-gray-500 text-sm">{viewingQuote.billingAddress.email}</p>
                                        )}
                                    </div>
                                )}

                                {/* Items Table */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Line Items</h4>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {viewingQuote.items?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-gray-800">{item.productName}</p>
                                                            {item.description && (
                                                                <p className="text-sm text-gray-500">{item.description}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal:</span>
                                            <span>{formatCurrency(viewingQuote.subtotal)}</span>
                                        </div>
                                        {viewingQuote.totalDiscount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Discount:</span>
                                                <span className="text-red-500">-{formatCurrency(viewingQuote.totalDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tax:</span>
                                            <span>{formatCurrency(viewingQuote.totalTax)}</span>
                                        </div>
                                        {viewingQuote.shippingCost > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Shipping:</span>
                                                <span>{formatCurrency(viewingQuote.shippingCost)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                            <span>Grand Total:</span>
                                            <span className="text-blue-600">{formatCurrency(viewingQuote.grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {viewingQuote.notes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                                        <p className="text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                                            {viewingQuote.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Terms */}
                                {viewingQuote.termsAndConditions && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h4>
                                        <p className="text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap text-sm">
                                            {viewingQuote.termsAndConditions}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => { setViewModalOpen(false); setViewingQuote(null); }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Close
                                </button>
                                {canWrite && viewingQuote.status === 'draft' && (
                                    <button
                                        onClick={() => {
                                            setViewModalOpen(false);
                                            handleEdit(viewingQuote);
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
                                    >
                                        <Edit2 size={16} />
                                        Edit Quote
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CRMLayout>
    );
};

export default Quotes;