/**
 * CRM Accounts Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight,
    Building2, Globe, Phone, Mail, MapPin, MoreVertical, RefreshCw,
    Download, Eye, User, Briefcase, TrendingUp
} from 'lucide-react';

const Accounts = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [viewingAccount, setViewingAccount] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        website: '',
        phone: '',
        email: '',
        employees: '',
        annualRevenue: '',
        type: 'prospect',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        description: ''
    });

    const canWrite = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'].includes(user.role?.toUpperCase());
    const canDelete = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/crm/accounts', {
                params: {
                    search: searchQuery,
                    industry: industryFilter,
                    type: typeFilter,
                    page: pagination.page,
                    limit: 10
                }
            });

            if (data.success) {
                setAccounts(data.data.accounts);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, industryFilter, typeFilter, pagination.page]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            if (editingAccount) {
                await api.put(`/crm/accounts/${editingAccount._id}`, formData);
            } else {
                await api.post('/crm/accounts', formData);
            }
            setModalOpen(false);
            fetchAccounts();
        } catch (error) {
            console.error('Error saving account:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this account?')) return;
        try {
            await api.delete(`/crm/accounts/${id}`);
            fetchAccounts();
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name || '',
            industry: account.industry || '',
            website: account.website || '',
            phone: account.phone || '',
            email: account.email || '',
            employees: account.employees || '',
            annualRevenue: account.annualRevenue || '',
            type: account.type || 'prospect',
            address: account.address || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            },
            description: account.description || ''
        });
        setModalOpen(true);
    };

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
                        <p className="text-gray-500 text-sm">Manage your client companies and organizations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setEditingAccount(null);
                                setFormData({
                                    name: '', industry: '', website: '', phone: '', email: '',
                                    employees: '', annualRevenue: '', type: 'prospect',
                                    address: { street: '', city: '', state: '', zipCode: '', country: '' },
                                    description: ''
                                });
                                setModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-shadow shadow-sm active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Add Account</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <select
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Industries</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Services">Services</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="prospect">Prospect</option>
                        <option value="customer">Customer</option>
                        <option value="partner">Partner</option>
                    </select>
                    <button
                        onClick={() => fetchAccounts()}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Accounts Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading accounts...</td>
                                    </tr>
                                ) : accounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No accounts found.</td>
                                    </tr>
                                ) : (
                                    accounts.map((account) => (
                                        <tr key={account._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                        {account.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{account.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Globe size={12} /> {account.website || 'No website'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                                    {account.industry || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${account.type === 'customer' ? 'bg-emerald-50 text-emerald-700' :
                                                        account.type === 'prospect' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {account.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                        {account.assignedTo?.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-sm text-gray-600">{account.assignedTo?.fullName || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(account)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(account._id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{accounts.length}</span> of <span className="font-medium">{pagination.total}</span> accounts
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-medium px-4">Page {pagination.page} of {pagination.pages}</span>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">{editingAccount ? 'Edit Account' : 'Add New Account'}</h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Name</label>
                                        <input
                                            name="name" value={formData.name} onChange={handleInputChange} required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</label>
                                        <input
                                            name="industry" value={formData.industry} onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                                        <select
                                            name="type" value={formData.type} onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        >
                                            <option value="prospect">Prospect</option>
                                            <option value="customer">Customer</option>
                                            <option value="partner">Partner</option>
                                            <option value="competitor">Competitor</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website</label>
                                        <input
                                            name="website" value={formData.website} onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                                        <input
                                            name="phone" value={formData.phone} onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                        <input
                                            name="email" value={formData.email} onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleInputChange} rows="3"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                                    ></textarea>
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={submitLoading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50">
                                        {submitLoading ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
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

export default Accounts;
