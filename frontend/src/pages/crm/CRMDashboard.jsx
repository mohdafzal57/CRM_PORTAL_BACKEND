/**
 * CRM Dashboard Page
 * Main overview with stats, pipeline, and recent activity
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CRMLayout from '../../components/crm/CRMLayout';
import StatCard from '../../components/crm/StatCard';
import {
    Users,
    Briefcase,
    Phone,
    DollarSign,
    Target,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    Calendar,
    Activity
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CRMDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/crm/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const stageColors = {
        prospecting: 'bg-blue-500',
        qualification: 'bg-yellow-500',
        needs_analysis: 'bg-indigo-500',
        proposal: 'bg-purple-500',
        negotiation: 'bg-orange-500',
        closed_won: 'bg-green-500',
        closed_lost: 'bg-red-500'
    };

    const stageNames = {
        prospecting: 'Prospecting',
        qualification: 'Qualification',
        needs_analysis: 'Analysis',
        proposal: 'Proposal',
        negotiation: 'Negotiation',
        closed_won: 'Won',
        closed_lost: 'Lost'
    };

    const statusColors = {
        new: 'bg-blue-100 text-blue-700',
        contacted: 'bg-yellow-100 text-yellow-700',
        qualified: 'bg-green-100 text-green-700',
        proposal: 'bg-purple-100 text-purple-700',
        negotiation: 'bg-orange-100 text-orange-700',
        lost: 'bg-red-100 text-red-700',
        converted: 'bg-emerald-100 text-emerald-700'
    };

    if (loading) {
        return (
            <CRMLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </CRMLayout>
        );
    }

    if (error) {
        return (
            <CRMLayout>
                <div className="flex flex-col items-center justify-center h-96 text-red-500">
                    <AlertCircle size={48} className="mb-4" />
                    <p>{error}</p>
                    <button 
                        onClick={fetchDashboardStats}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </CRMLayout>
        );
    }

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold">
                        Welcome back, {user?.fullName || user?.name || 'User'}! 👋
                    </h1>
                    <p className="mt-1 text-blue-100">
                        Here's what's happening with your CRM today.
                    </p>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Open Deals"
                        value={stats?.deals?.open || 0}
                        icon={Briefcase}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-500"
                        trend="up"
                        trendValue="+12%"
                        onClick={() => navigate('/crm/deals')}
                    />
                    <StatCard
                        title="Total Leads"
                        value={stats?.leads?.total || 0}
                        icon={Users}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-500"
                        trend="up"
                        trendValue="+8%"
                        onClick={() => navigate('/crm/leads')}
                    />
                    <StatCard
                        title="Tasks Today"
                        value={stats?.activities?.today || 0}
                        icon={CheckCircle}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-500"
                        subtitle={`${stats?.activities?.overdue || 0} overdue`}
                    />
                    <StatCard
                        title="Won Deals Value"
                        value={`$${(stats?.deals?.wonValue || 0).toLocaleString()}`}
                        icon={DollarSign}
                        iconBgColor="bg-yellow-100"
                        iconColor="text-yellow-600"
                        trend="up"
                        trendValue="+23%"
                    />
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="New Leads"
                        value={stats?.leads?.new || 0}
                        icon={Target}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-500"
                        subtitle="Needs follow up"
                    />
                    <StatCard
                        title="Contacted"
                        value={stats?.leads?.contacted || 0}
                        icon={Phone}
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-500"
                        subtitle="In progress"
                    />
                    <StatCard
                        title="Qualified"
                        value={stats?.leads?.qualified || 0}
                        icon={CheckCircle}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-500"
                        subtitle="Ready for proposal"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${stats?.leads?.conversionRate || 0}%`}
                        icon={TrendingUp}
                        iconBgColor="bg-emerald-100"
                        iconColor="text-emerald-500"
                        subtitle="Lead to customer"
                    />
                </div>

                {/* Pipeline & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Deal Pipeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Deal Pipeline
                            </h2>
                            <button 
                                onClick={() => navigate('/crm/deals')}
                                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                                View all <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {stats?.pipeline?.map((stage) => (
                                <div key={stage._id || stage.stage} className="flex items-center gap-4">
                                    <div className="w-24 text-sm text-gray-600">
                                        {stageNames[stage._id || stage.stage] || stage._id || stage.stage}
                                    </div>
                                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                                        <div
                                            className={`h-full ${stageColors[stage._id || stage.stage] || 'bg-gray-500'} 
                                                       flex items-center px-3 transition-all duration-500`}
                                            style={{ 
                                                width: `${Math.min((stage.count / Math.max(stats?.deals?.total || 1, 1)) * 100, 100)}%`,
                                                minWidth: stage.count > 0 ? '40px' : '0'
                                            }}
                                        >
                                            <span className="text-white text-sm font-medium">{stage.count}</span>
                                        </div>
                                    </div>
                                    <div className="w-24 text-right text-sm font-medium text-gray-700">
                                        ${(stage.totalValue || stage.value || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {(!stats?.pipeline || stats.pipeline.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <Briefcase className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No deals in pipeline</p>
                                    <button 
                                        onClick={() => navigate('/crm/deals')}
                                        className="mt-2 text-blue-500 hover:underline text-sm"
                                    >
                                        Create your first deal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Recent Leads
                            </h2>
                            <button 
                                onClick={() => navigate('/crm/leads')}
                                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                                View all <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {stats?.recentLeads?.map((lead) => (
                                <div 
                                    key={lead._id}
                                    onClick={() => navigate('/crm/leads')}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 
                                               transition-colors cursor-pointer"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">
                                            {lead.name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">
                                            {lead.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium
                                                     ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {lead.status}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentLeads || stats.recentLeads.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No recent leads</p>
                                    <button 
                                        onClick={() => navigate('/crm/leads')}
                                        className="mt-2 text-blue-500 hover:underline text-sm"
                                    >
                                        Add your first lead
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Activities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Upcoming Activities
                        </h2>
                        <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                            View calendar <Calendar size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats?.upcomingActivities?.map((activity) => (
                            <div 
                                key={activity._id}
                                className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        activity.type === 'call' ? 'bg-green-100' :
                                        activity.type === 'meeting' ? 'bg-blue-100' :
                                        activity.type === 'email' ? 'bg-purple-100' :
                                        'bg-gray-100'
                                    }`}>
                                        {activity.type === 'call' ? <Phone size={18} className="text-green-600" /> :
                                         activity.type === 'meeting' ? <Calendar size={18} className="text-blue-600" /> :
                                         <Activity size={18} className="text-gray-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{activity.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'No date'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.upcomingActivities || stats.upcomingActivities.length === 0) && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                <Clock className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No upcoming activities</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/crm/leads')}
                            className="flex flex-col items-center p-4 rounded-xl bg-blue-50 
                                       hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                            <Users className="text-blue-500 mb-2" size={24} />
                            <span className="text-sm font-medium text-gray-700">Add Lead</span>
                        </button>
                        <button
                            onClick={() => navigate('/crm/deals')}
                            className="flex flex-col items-center p-4 rounded-xl bg-green-50 
                                       hover:bg-green-100 transition-colors cursor-pointer"
                        >
                            <Briefcase className="text-green-500 mb-2" size={24} />
                            <span className="text-sm font-medium text-gray-700">Create Deal</span>
                        </button>
                        <button
                            onClick={() => navigate('/crm/contacts')}
                            className="flex flex-col items-center p-4 rounded-xl bg-purple-50 
                                       hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                            <Phone className="text-purple-500 mb-2" size={24} />
                            <span className="text-sm font-medium text-gray-700">Add Contact</span>
                        </button>
                        <button
                            onClick={() => navigate('/crm/reports')}
                            className="flex flex-col items-center p-4 rounded-xl bg-orange-50 
                                       hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                            <TrendingUp className="text-orange-500 mb-2" size={24} />
                            <span className="text-sm font-medium text-gray-700">View Reports</span>
                        </button>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
};

export default CRMDashboard;