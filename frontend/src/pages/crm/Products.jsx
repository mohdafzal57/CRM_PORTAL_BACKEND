/**
 * CRM Products Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight,
    Package, DollarSign, Tag, RefreshCw, ToggleLeft, ToggleRight,
    Box, Layers
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Products = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        category: '',
        type: 'product',
        unitPrice: '',
        costPrice: '',
        taxRate: '',
        unit: 'unit',
        sku: '',
        stockQuantity: '',
        isActive: true
    });

    const canManage = ['ADMIN', 'MANAGER', 'HR'].includes(user.role?.toUpperCase());

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/products`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    category: categoryFilter,
                    type: typeFilter,
                    isActive: activeFilter === 'all' ? undefined : activeFilter,
                    page: pagination.page,
                    limit: 12
                }
            });
            
            if (data.success) {
                setProducts(data.data.products);
                setCategories(data.data.categories || []);
                setPagination(prev => ({
                    ...prev,
                    pages: data.data.pagination.pages,
                    total: data.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, categoryFilter, typeFilter, activeFilter, pagination.page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                unitPrice: parseFloat(formData.unitPrice) || 0,
                costPrice: parseFloat(formData.costPrice) || 0,
                taxRate: parseFloat(formData.taxRate) || 0,
                stockQuantity: parseInt(formData.stockQuantity) || 0
            };

            if (editingProduct) {
                await axios.put(`${API_BASE}/api/crm/products/${editingProduct._id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE}/api/crm/products`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModalOpen(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(error.response?.data?.message || 'Error saving product');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            code: product.code || '',
            description: product.description || '',
            category: product.category || '',
            type: product.type || 'product',
            unitPrice: product.unitPrice?.toString() || '',
            costPrice: product.costPrice?.toString() || '',
            taxRate: product.taxRate?.toString() || '',
            unit: product.unit || 'unit',
            sku: product.sku || '',
            stockQuantity: product.stockQuantity?.toString() || '',
            isActive: product.isActive !== false
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/crm/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(error.response?.data?.message || 'Error deleting product');
        }
    };

    const handleToggleActive = async (product) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE}/api/crm/products/${product._id}/toggle-active`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (error) {
            console.error('Error toggling product status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            description: '',
            category: '',
            type: 'product',
            unitPrice: '',
            costPrice: '',
            taxRate: '',
            unit: 'unit',
            sku: '',
            stockQuantity: '',
            isActive: true
        });
    };

    const typeColors = {
        product: 'bg-blue-100 text-blue-700',
        service: 'bg-green-100 text-green-700',
        subscription: 'bg-purple-100 text-purple-700',
        bundle: 'bg-orange-100 text-orange-700'
    };

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                        <p className="text-gray-500">Manage your products and services ({pagination.total} total)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchProducts} className="p-2 hover:bg-gray-100 rounded-xl">
                            <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {canManage && (
                            <button
                                onClick={() => { setEditingProduct(null); resetForm(); setModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg"
                            >
                                <Plus size={20} />
                                Add Product
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
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
                            <option value="product">Product</option>
                            <option value="service">Service</option>
                            <option value="subscription">Subscription</option>
                            <option value="bundle">Bundle</option>
                        </select>
                        {categories.length > 0 && (
                            <select
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={activeFilter}
                            onChange={(e) => { setActiveFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <Package size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            {canManage && (
                                <button onClick={() => { resetForm(); setModalOpen(true); }} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                                    Add Your First Product
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <div key={product._id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all ${!product.isActive ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${typeColors[product.type] || 'bg-gray-100'}`}>
                                        {product.type === 'service' ? <Layers size={20} /> : <Box size={20} />}
                                    </div>
                                    {canManage && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleActive(product)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg"
                                                title={product.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {product.isActive ? (
                                                    <ToggleRight size={18} className="text-green-500" />
                                                ) : (
                                                    <ToggleLeft size={18} className="text-gray-400" />
                                                )}
                                            </button>
                                            <button onClick={() => handleEdit(product)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                                <Edit2 size={16} className="text-gray-400" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{product.code}</p>
                                
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">Unit Price</span>
                                    <span className="text-lg font-bold text-gray-800">${product.unitPrice?.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Type</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColors[product.type]}`}>
                                        {product.type}
                                    </span>
                                </div>
                                
                                {product.category && (
                                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                                        <Tag size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-500">{product.category}</span>
                                    </div>
                                )}
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
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h2>
                                <button onClick={() => { setModalOpen(false); setEditingProduct(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enterprise License"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            placeholder="Auto-generated"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="product">Product</option>
                                            <option value="service">Service</option>
                                            <option value="subscription">Subscription</option>
                                            <option value="bundle">Bundle</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($) *</label>
                                        <input
                                            type="number"
                                            value={formData.unitPrice}
                                            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="99.99"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
                                        <input
                                            type="number"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                            min="0"
                                            step="0.01"
                                            placeholder="50.00"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            value={formData.taxRate}
                                            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                            min="0"
                                            max="100"
                                            placeholder="10"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="unit">Unit</option>
                                            <option value="hour">Hour</option>
                                            <option value="license">License</option>
                                            <option value="month">Month</option>
                                            <option value="year">Year</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                            min="0"
                                            placeholder="100"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Software / Hardware / Service"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Product description..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">Product is active</label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => { setModalOpen(false); setEditingProduct(null); resetForm(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                                        {submitLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {editingProduct ? 'Update' : 'Create'}
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

export default Products;