// src/pages/intern/Profile.jsx
import React, { useState, useEffect } from 'react';
import InternLayout from '../../components/InternLayout';
import internApi from '../../services/internApi';
import { useToast } from '../../context/ToastContext';

const Card = ({ children, title, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        {title && <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">{title}</h2>}
        {children}
    </div>
);

const Input = ({ label, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            {...props}
        />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-inter"
            {...props}
        >
            <option value="">Select Option</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        personal: { gender: '', dob: '', photo: '' },
        education: { collegeName: '', course: '', branch: '', yearSemester: '', collegeIdNumber: '' },
        internship: { domain: '', type: '', startDate: '', endDate: '', mode: '', assignedBatch: '', dailyWorkingHours: '' },
        projectWork: { projectTitle: '' }
    });
    const { success: showSuccess, error: showError } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await internApi.getProfile();
            setProfile(res.data);
            if (res.data) {
                // Map data to form, handling nulls
                setFormData({
                    personal: {
                        gender: res.data.personal?.gender || '',
                        dob: res.data.personal?.dob ? new Date(res.data.personal.dob).toISOString().split('T')[0] : '',
                        photo: res.data.personal?.photo || ''
                    },
                    education: {
                        collegeName: res.data.education?.collegeName || '',
                        course: res.data.education?.course || '',
                        branch: res.data.education?.branch || '',
                        yearSemester: res.data.education?.yearSemester || '',
                        collegeIdNumber: res.data.education?.collegeIdNumber || ''
                    },
                    internship: {
                        domain: res.data.internship?.domain || '',
                        type: res.data.internship?.type || '',
                        startDate: res.data.internship?.startDate ? new Date(res.data.internship.startDate).toISOString().split('T')[0] : '',
                        endDate: res.data.internship?.endDate ? new Date(res.data.internship.endDate).toISOString().split('T')[0] : '',
                        mode: res.data.internship?.mode || '',
                        assignedBatch: res.data.internship?.assignedBatch || '',
                        dailyWorkingHours: res.data.internship?.dailyWorkingHours || ''
                    },
                    projectWork: {
                        projectTitle: res.data.projectWork?.projectTitle || ''
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await internApi.updateProfile(formData);
            showSuccess('Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            console.error('Update error:', err);
            showError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <InternLayout><div className="flex items-center justify-center min-h-[60vh] text-2xl">⏳ Loading...</div></InternLayout>;

    return (
        <InternLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your professional and academic information.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {profile?.internId?.substring(4)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Intern ID</p>
                        <p className="font-mono text-gray-900">{profile?.internId}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Details */}
                    <Card title="👤 Personal Details">
                        <Select
                            label="Gender"
                            value={formData.personal.gender}
                            onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, gender: e.target.value } })}
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' }
                            ]}
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={formData.personal.dob}
                            onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, dob: e.target.value } })}
                        />
                        <Input
                            label="Full Name (View Only)"
                            value={profile?.userId?.fullName || ''}
                            disabled
                            className="bg-gray-50 text-gray-500"
                        />
                        <Input
                            label="Email ID (View Only)"
                            value={profile?.userId?.email || ''}
                            disabled
                            className="bg-gray-50 text-gray-500"
                        />
                        <Input
                            label="Mobile Number (View Only)"
                            value={profile?.userId?.mobile || ''}
                            disabled
                            className="bg-gray-50 text-gray-500"
                        />
                    </Card>

                    {/* Education Details */}
                    <Card title="🎓 Academic Background">
                        <Input
                            label="College / University Name"
                            placeholder="Enter college name"
                            value={formData.education.collegeName}
                            onChange={(e) => setFormData({ ...formData, education: { ...formData.education, collegeName: e.target.value } })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Course"
                                placeholder="e.g. BTech, BCA"
                                value={formData.education.course}
                                onChange={(e) => setFormData({ ...formData, education: { ...formData.education, course: e.target.value } })}
                            />
                            <Input
                                label="Branch"
                                placeholder="e.g. CS, IT"
                                value={formData.education.branch}
                                onChange={(e) => setFormData({ ...formData, education: { ...formData.education, branch: e.target.value } })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Year / Semester"
                                placeholder="e.g. 3rd Year"
                                value={formData.education.yearSemester}
                                onChange={(e) => setFormData({ ...formData, education: { ...formData.education, yearSemester: e.target.value } })}
                            />
                            <Input
                                label="College ID Number"
                                placeholder="Roll No / ID"
                                value={formData.education.collegeIdNumber}
                                onChange={(e) => setFormData({ ...formData, education: { ...formData.education, collegeIdNumber: e.target.value } })}
                            />
                        </div>
                    </Card>
                </div>

                {/* Internship Details */}
                <Card title="💼 Internship Details (Managed by Admin)">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input
                            label="Internship Domain"
                            value={formData.internship.domain}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Internship Type"
                            value={formData.internship.type}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Mode"
                            value={formData.internship.mode}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Start Date"
                            type="date"
                            value={formData.internship.startDate}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={formData.internship.endDate}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Daily Working Hours"
                            type="number"
                            value={formData.internship.dailyWorkingHours}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Assigned Batch"
                            value={formData.internship.assignedBatch}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Assigned Mentor"
                            value={profile?.internship?.assignedMentor || 'TBD'}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </Card>

                {/* Project Work */}
                <Card title="🚀 Project Details (Update via Task Submission)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Project Title"
                            value={formData.projectWork.projectTitle}
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <div className="flex items-center pt-8">
                            <span className="text-sm font-medium text-gray-700 mr-4">Final Project Submitted:</span>
                            <span className={`px-4 py-1 rounded-full text-sm font-bold ${profile?.projectWork?.finalProjectSubmitted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {profile?.projectWork?.finalProjectSubmitted ? 'YES' : 'NO'}
                            </span>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pb-12">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : '💾 Save Profile Information'}
                    </button>
                </div>
            </form>

        </InternLayout>
    );
}
