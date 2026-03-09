/**
 * CRM Reports & Analytics Page
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CRMLayout from '../../components/crm/CRMLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Users, DollarSign, Target, Calendar, Download,
    Filter, RefreshCw, ChevronRight, ArrowUpRight, ArrowDownRight,
    PieChart as PieIcon
} from 'lucide-react';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [summaryStats, setSummaryStats] = useState({
        totalRevenue: 0,
        activeDeals: 0,
        newLeads: 0,
        winRate: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [leadsByStatus, setLeadsByStatus] = useState([]);
    const [timeframe, setTimeframe] = useState('month');

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const [salesRes, leaderboardRes, summaryRes] = await Promise.all([
                api.get('/crm/reports/sales-performance', { params: { groupBy: timeframe } }),
                api.get('/crm/reports/leaderboard'),
                api.get('/crm/reports/summary-stats')
            ]);

            if (salesRes.data.success) {
                setSalesData(salesRes.data.data.salesTrend);
                setLeadsByStatus(salesRes.data.data.leadsByStatus);
            }

            if (leaderboardRes.data.success) {
                setLeaderboard(leaderboardRes.data.data);
            }

            if (summaryRes.data.success) {
                setSummaryStats(summaryRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [timeframe]);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
    );

    const EmptyChartState = ({ message }) => (
        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <PieIcon size={48} className="opacity-20" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );

    return (
        <CRMLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="text-gray-500 text-sm">Real-time performance metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        >
                            <option value="month">Last 12 Months</option>
                            <option value="week">Last 8 Weeks</option>
                            <option value="day">Last 30 Days</option>
                        </select>
                        <button onClick={fetchReportData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Revenue" value={summaryStats.totalRevenue} icon={DollarSign} prefix="$" color="blue" />
                    <StatCard title="Active Deals" value={summaryStats.activeDeals} icon={TrendingUp} color="emerald" />
                    <StatCard title="New Leads" value={summaryStats.newLeads} icon={Users} color="amber" />
                    <StatCard title="Win Rate" value={`${summaryStats.winRate}%`} icon={Target} color="purple" />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" />
                            Sales Performance
                        </h3>
                        <div className="h-[300px] w-full">
                            {salesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="totalValue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No sales data found for this period" />
                            )}
                        </div>
                    </div>

                    {/* Leads by Status */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <PieIcon size={20} className="text-blue-600" />
                            Leads Status Distribution
                        </h3>
                        <div className="h-[300px] w-full">
                            {leadsByStatus.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={leadsByStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {leadsByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No leads data available" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Leaderboard */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Target size={20} className="text-blue-600" />
                            Top Performing Agents (Current Month)
                        </h3>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Agent</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Deals Won</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {leaderboard.map((item, index) => (
                                    <tr key={item.userId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-gray-400 w-4">#{index + 1}</span>
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {item.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.totalDeals}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-gray-900">${item.totalValue.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">No sales record for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
};

export default Reports;
