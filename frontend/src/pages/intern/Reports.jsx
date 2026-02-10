// src/pages/intern/Reports.jsx
import React, { useState, useEffect } from 'react';
import InternLayout from '../../components/InternLayout';
import internApi from '../../services/internApi';
import { useToast } from '../../context/ToastContext';

const Card = ({ children, title, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        {title && <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>}
        {children}
    </div>
);

export default function Reports() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReport, setNewReport] = useState({ weekNumber: '', report: '' });
    const { success: showSuccess, error: showError } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await internApi.getProfile();
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await internApi.submitReport(newReport);
            setNewReport({ weekNumber: '', report: '' });
            fetchProfile();
            showSuccess('Report submitted successfully');
        } catch (err) {
            showError('Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <InternLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Progress & Feedback</h1>
                <p className="text-gray-500 mt-1">Submit weekly reports and review mentor feedback.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Report Submission */}
                <div>
                    <Card title="📈 Submit Weekly Progress">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. 1, 2, 3..."
                                    value={newReport.weekNumber}
                                    onChange={(e) => setNewReport({ ...newReport, weekNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Report</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                                    placeholder="Share your learnings, achievements and challenges this week..."
                                    value={newReport.report}
                                    onChange={(e) => setNewReport({ ...newReport, report: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 shadow-md"
                            >
                                {submitting ? 'Submitting...' : '🚀 Submit Weekly Report'}
                            </button>
                        </form>
                    </Card>

                    <div className="mt-8">
                        <Card title="📜 Report History">
                            {profile?.academicWork?.weeklyProgressReport?.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {profile.academicWork.weeklyProgressReport.slice().reverse().map((r, idx) => (
                                        <div key={idx} className="py-4 first:pt-0">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-blue-600">Week {r.weekNumber}</span>
                                                <span className="text-xs text-gray-400">{new Date(r.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3">{r.report}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No reports submitted yet.</p>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Mentor Feedback */}
                <div>
                    <Card title="💬 Mentor Feedback">
                        {profile?.academicWork?.mentorFeedback?.length > 0 ? (
                            <div className="space-y-4">
                                {profile.academicWork.mentorFeedback.slice().reverse().map((f, idx) => (
                                    <div key={idx} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 relative">
                                        <div className="absolute top-4 right-4 text-2xl opacity-20">❝</div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {f.mentor?.charAt(0) || 'M'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{f.mentor || 'Mentor'}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(f.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 italic">"{f.feedback}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">🙊</div>
                                <p className="text-gray-500">No feedback from mentor yet. Keep up the good work!</p>
                            </div>
                        )}
                    </Card>

                    <div className="mt-8">
                        <Card title="🎯 Final Project Status">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                                <span className="font-medium">Title</span>
                                <span className="text-blue-600 font-bold">{profile?.projectWork?.projectTitle || 'Not Assigned'}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="font-medium">Submitted</span>
                                <span className={`font-bold ${profile?.projectWork?.finalProjectSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                                    {profile?.projectWork?.finalProjectSubmitted ? '✅ YES' : '❌ NO'}
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

        </InternLayout>
    );
}
