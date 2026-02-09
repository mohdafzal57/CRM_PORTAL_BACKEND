// src/pages/intern/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import InternLayout from '../../components/InternLayout';
import internApi from '../../services/internApi';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        info: 'bg-blue-100 text-blue-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
            {children}
        </span>
    );
};

export default function Dashboard() {
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

    if (loading) return <InternLayout><div className="flex items-center justify-center min-h-[60vh] text-2xl">⏳ Loading...</div></InternLayout>;

    return (
        <InternLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Intern Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {profile?.userId?.fullName}! Track your internship progress here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Internship Domain</p>
                            <p className="text-xl font-bold text-gray-900">{profile?.internship?.domain || 'Not Assigned'}</p>
                        </div>
                        <div className="text-3xl">💻</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Internship Type</p>
                            <p className="text-xl font-bold text-blue-600">{profile?.internship?.type || 'N/A'}</p>
                        </div>
                        <div className="text-3xl">📅</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Assigned Mentor</p>
                            <p className="text-xl font-bold text-green-600">{profile?.internship?.assignedMentor || 'TBD'}</p>
                        </div>
                        <div className="text-3xl">👨‍🏫</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Recent Task Updates</h2>
                    {profile?.academicWork?.dailyTaskUpdate?.length > 0 ? (
                        <div className="space-y-4">
                            {profile.academicWork.dailyTaskUpdate.slice(-3).reverse().map((task, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xl">✅</div>
                                    <div>
                                        <p className="font-medium text-gray-900">{task.task}</p>
                                        <p className="text-xs text-gray-500">{new Date(task.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No tasks submitted yet.</p>
                    )}
                    <a href="/intern/tasks" className="block text-center mt-4 text-sm text-blue-600 font-medium hover:underline">
                        View All Tasks &rarr;
                    </a>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Milestone Tracking</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Final Project Submitted</span>
                            <Badge variant={profile?.projectWork?.finalProjectSubmitted ? 'success' : 'warning'}>
                                {profile?.projectWork?.finalProjectSubmitted ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Project Title</span>
                            <span className="text-sm text-gray-500">{profile?.projectWork?.projectTitle || 'Not Set'}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </InternLayout>
    );
}
