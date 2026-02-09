// src/pages/intern/Tasks.jsx
import React, { useState, useEffect } from 'react';
import InternLayout from '../../components/InternLayout';
import internApi from '../../services/internApi';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        {children}
    </div>
);

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const [dailyRes, assignedRes] = await Promise.all([
                internApi.getTasks(),
                internApi.getAssignedTasks()
            ]);
            setTasks(dailyRes.data.reverse()); // Show latest first
            setAssignedTasks(assignedRes.data.reverse());
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await internApi.updateAssignedTaskStatus(taskId, newStatus);
            // Optimistic update
            setAssignedTasks(assignedTasks.map(t =>
                t._id === taskId ? { ...t, status: newStatus } : t
            ));
        } catch (err) {
            alert('Failed to update status');
        }
    };



    return (
        <InternLayout>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                <p className="text-gray-500 mt-1">Manage your assigned tasks and submit daily updates.</p>
            </div>

            {/* Assigned Tasks Section */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📋 Admin Assigned Tasks
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{assignedTasks.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p>Loading assigned tasks...</p>
                    ) : assignedTasks.length === 0 ? (
                        <div className="col-span-full bg-gray-50 p-6 rounded-xl text-center text-gray-500 border border-dashed">
                            No tasks assigned by admin yet.
                        </div>
                    ) : (
                        assignedTasks.map(task => (
                            <div key={task._id} className="bg-white border border-l-4 border-l-blue-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{task.description || 'No description provided.'}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Limit'}</span>
                                    {task.status !== 'Completed' && (
                                        <select
                                            className="bg-gray-50 border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                            value={task.status}
                                            onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900">Daily Work Log History</h2>
            </div>

            <div className="mt-6">
                {/* Task History */}
                <div>
                    <Card>
                        <h2 className="text-lg font-semibold mb-6">Task History</h2>
                        {loading ? (
                            <div className="text-center py-12">⏳ Loading tasks...</div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No tasks found. Start by adding one!</div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((t, idx) => (
                                    <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                {new Date(t.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                t.status === 'Blocked' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-800">{t.task}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </InternLayout>
    );
}
