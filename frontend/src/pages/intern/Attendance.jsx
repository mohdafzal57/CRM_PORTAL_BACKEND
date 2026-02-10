import React, { useState, useEffect } from 'react';
import InternLayout from '../../components/InternLayout';
import internApi from '../../services/internApi';
import { useNavigate } from 'react-router-dom';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100'
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
            {children}
        </span>
    );
};

import { useToast } from '../../context/ToastContext';

export default function Attendance() {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [todayRecord, setTodayRecord] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [locationError, setLocationError] = useState(null);
    const { success: showSuccess, error: showError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchAttendanceData();
        return () => clearInterval(timer);
    }, []);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const res = await internApi.getAttendanceHistory();
            setHistory(res.data || []);

            // Check if there's a record for today
            const today = new Date().toISOString().split('T')[0];
            const todayRec = res.data?.find(rec => new Date(rec.date).toISOString().split('T')[0] === today);
            setTodayRecord(todayRec);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            address: 'Location Captured' // You might want to use a geocoding service here
                        });
                    },
                    (error) => {
                        reject(error);
                    }
                );
            }
        });
    };

    const handleCheckIn = async () => {
        try {
            setLocationError(null);
            const location = await getLocation();
            await internApi.checkIn(location);
            await fetchAttendanceData();
            await internApi.checkIn(location);
            await fetchAttendanceData();
            showSuccess('Check-In Successful! Have a productive day!');
        } catch (err) {
            console.error('Check-in error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error checking in';
            showError(errorMsg);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLocationError(null);
            const location = await getLocation();
            await internApi.checkOut(location);
            await fetchAttendanceData();
            await internApi.checkOut(location);
            await fetchAttendanceData();
            showSuccess('Check-Out Successful! See you tomorrow!');
        } catch (err) {
            console.error('Check-out error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error checking out';
            showError(errorMsg);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PRESENT': return 'success';
            case 'ABSENT': return 'danger';
            case 'LATE': return 'warning';
            case 'HALF_DAY': return 'info';
            default: return 'default';
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <InternLayout><div className="flex justify-center p-10">Loading...</div></InternLayout>;

    return (
        <InternLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                <p className="text-gray-500 mt-1">Mark your daily attendance and view history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Check-In/Out Card */}
                <Card className="lg:col-span-1">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Today's Action</h2>
                        <div className="text-4xl font-bold text-blue-600 mb-6">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-gray-500 mb-6">
                            {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        {locationError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                                ⚠️ {locationError}
                            </div>
                        )}

                        <div className="space-y-4">
                            {!todayRecord ? (
                                <Button onClick={handleCheckIn} className="w-full py-4 text-lg">
                                    📍 Check In
                                </Button>
                            ) : !todayRecord.checkOut?.time ? (
                                <div>
                                    <div className="mb-4 text-green-600 font-medium">
                                        Checked in at {formatTime(todayRecord.checkIn?.time)}
                                    </div>
                                    <Button onClick={handleCheckOut} variant="danger" className="w-full py-4 text-lg">
                                        👋 Check Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                                    <div className="font-bold text-lg">Fully Marked!</div>
                                    <div className="text-sm mt-1">
                                        In: {formatTime(todayRecord.checkIn?.time)} <br />
                                        Out: {formatTime(todayRecord.checkOut?.time)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Statistics Card */}
                <Card className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4"> attendance Statistics (Last 30 Days)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {history.filter(r => r.status === 'PRESENT').length}
                            </div>
                            <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {history.filter(r => r.status === 'LATE').length}
                            </div>
                            <div className="text-sm text-gray-600">Late</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {history.filter(r => r.status === 'ABSENT').length}
                            </div>
                            <div className="text-sm text-gray-600">Absent</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {history.reduce((acc, curr) => acc + (curr.workHours || 0), 0) / 60}h
                            </div>
                            <div className="text-sm text-gray-600">Total Hours</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* History Table */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="pb-3 text-gray-500 font-medium">Date</th>
                                <th className="pb-3 text-gray-500 font-medium">Check In</th>
                                <th className="pb-3 text-gray-500 font-medium">Check Out</th>
                                <th className="pb-3 text-gray-500 font-medium">Work Hours</th>
                                <th className="pb-3 text-gray-500 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map((record) => (
                                <tr key={record._id} className="group hover:bg-gray-50">
                                    <td className="py-3">
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 font-mono text-sm">{formatTime(record.checkIn?.time)}</td>
                                    <td className="py-3 font-mono text-sm">{formatTime(record.checkOut?.time)}</td>
                                    <td className="py-3">
                                        {record.workHours ? `${Math.floor(record.workHours / 60)}h ${record.workHours % 60}m` : '-'}
                                    </td>
                                    <td className="py-3">
                                        <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>



        </InternLayout >
    );
}
