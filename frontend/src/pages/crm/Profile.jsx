import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CRMLayout from '../../components/crm/CRMLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Shield, Save, Camera, Loader2 } from 'lucide-react';

const Profile = () => {
    const { success, error } = useToast();
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: userLocal.fullName || userLocal.name || '',
        email: userLocal.email || '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/api/auth/profile', form);
            if (res.data.success) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                success('Profile updated successfully!');
            }
        } catch (err) {
            error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CRMLayout>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
                    <p className="text-gray-500">Manage your profile details and account settings</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-12 mb-8 flex items-end justify-between">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                                        {form.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <button className="absolute bottom--2 -right-2 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-500 hover:text-blue-500 transition-colors">
                                    <Camera size={18} />
                                </button>
                            </div>
                            <div className="flex-1 ml-6 mb-2">
                                <h2 className="text-xl font-bold text-gray-900">{form.name}</h2>
                                <p className="text-gray-500 capitalize">{userLocal.role?.toLowerCase()} Account</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="yourname@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Shield size={16} className="text-gray-400" />
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={userLocal.role || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed capitalize"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
};

export default Profile;
