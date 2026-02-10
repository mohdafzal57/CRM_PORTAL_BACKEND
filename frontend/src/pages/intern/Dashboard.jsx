import React, { useState, useEffect } from 'react';
import InternLayout from '../../components/InternLayout';
import internApi from '../../services/internApi';
import {
    Clock,
    Calendar,
    FileCheck,
    Zap,
    TrendingUp,
    CheckCircle2,
    PlayCircle,
    Briefcase,
    UserCheck,
    BookOpen
} from 'lucide-react';
// Recharts removed
const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await internApi.getProfile();
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <InternLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </InternLayout>
        );
    }

    const stats = [
        {
            label: 'Internship Domain',
            value: profile?.internship?.domain || 'N/A',
            trend: 'Active',
            icon: Briefcase,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Mentor Assigned',
            value: profile?.internship?.assignedMentor || 'TBD',
            trend: 'Verified',
            icon: UserCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Project Status',
            value: profile?.projectWork?.finalProjectSubmitted ? 'Submitted' : 'Pending',
            trend: profile?.projectWork?.finalProjectSubmitted ? 'Done' : 'In Progress',
            icon: FileCheck,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            label: 'Total Tasks',
            value: profile?.academicWork?.dailyTaskUpdate?.length || 0,
            trend: 'Updates',
            icon: Zap,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        },
    ];

    return (
        <InternLayout>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-[900] text-slate-800 tracking-tight">
                            Intern <span className="text-indigo-600">Module.</span>
                        </h1>
                        <div className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px] font-black">
                            Nexus Interns • {profile?.userId?.fullName} • {profile?.internship?.type || 'Standard'}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-12 px-6 bg-white border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                            <PlayCircle className="w-4 h-4" /> Quick Check-In
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="glass-layer p-8 group hover:border-white transition-all duration-500 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 rounded-lg border border-slate-50">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-600">{stat.trend}</span>
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">{stat.label}</div>
                            <div className="text-xl font-[1000] text-slate-800 tracking-tight relative z-10 truncate">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Recent Task Updates Sidebar - Expanded to full width */}
                    <div className="glass-layer p-10 bg-indigo-600/5 border-indigo-200/20">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-[900] text-slate-800 tracking-tight uppercase tracking-widest text-xs">Recent Updates</h3>
                            <CheckCircle2 className="w-6 h-6 text-indigo-600 opacity-20" />
                        </div>

                        <div className="space-y-4">
                            {profile?.academicWork?.dailyTaskUpdate?.slice(-5).reverse().map((task, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/40 border border-transparent hover:border-white rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 text-white">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black tracking-tight text-slate-800 line-clamp-1">
                                                {task.task}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{new Date(task.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!profile?.academicWork?.dailyTaskUpdate || profile.academicWork.dailyTaskUpdate.length === 0) && (
                                <div className="text-center text-slate-400 text-xs py-10">No recent updates</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </InternLayout>
    );
};

export default Dashboard;
