import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Loading,
  Modal
} from '../../components/admin/ui';
import * as api from '../../services/adminApi';

// Constants
const INITIAL_FORM_DATA = {
  fullName: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  mobile: '',
  department: '',
  designation: ''
};

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'HR', label: 'HR' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'INTERN', label: 'Intern' }
];

const INTERNSHIP_TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Winter', label: 'Winter' },
  { value: '45 Days', label: '45 Days' },
  { value: '3 Months', label: '3 Months' },
  { value: '6 Months', label: '6 Months' }
];

const INITIAL_INTERN_DATA = {
  internship: {
    domain: '',
    type: '',
    startDate: '',
    endDate: '',
    mode: 'Offline',
    assignedBatch: '',
    dailyWorkingHours: '',
    assignedMentor: ''
  },
  projectWork: {
    projectTitle: '',
    finalProjectSubmitted: false
  }
};

const UserManagement = () => {
  // User Management State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formLoading, setFormLoading] = useState(false);

  // Intern Profile Modal State
  const [internModalOpen, setInternModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [internLoading, setInternLoading] = useState(false);
  const [internSaving, setInternSaving] = useState(false);
  const [internData, setInternData] = useState(INITIAL_INTERN_DATA);

  // Task Assignment Modal State
  const [taskAssignmentModalOpen, setTaskAssignmentModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });

  // Fetch users on filter change
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // API Functions
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getUsers({ page, limit: 10, ...filters });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        await api.updateUser(editingUser._id, formData);
      } else {
        await api.createUser(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchUsers(pagination.current);
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || 'Error saving user';
      alert(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    const action = user.isActive ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    try {
      await api.toggleUserStatus(user._id);
      fetchUsers(pagination.current);
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleDeleteUser = async (user) => {
    const userName = user.name || user.fullName;
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      await api.deleteUser(user._id);
      fetchUsers(pagination.current);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  // Modal Functions
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || user.name || '',
      email: user.email,
      role: user.role,
      mobile: user.mobile || '',
      department: user.department || '',
      designation: user.designation || ''
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData(INITIAL_FORM_DATA);
  };

  // Intern Profile Functions
  const openInternModal = async (userId) => {
    try {
      const sanitizedId = String(userId).split(':')[0].trim();
      setInternLoading(true);
      setInternModalOpen(true);

      const response = await api.getInternDetails(sanitizedId);
      const data = response.data.data;

      setSelectedIntern(data);
      setInternData({
        internship: {
          domain: data.internship?.domain || '',
          type: data.internship?.type || '',
          startDate: data.internship?.startDate
            ? new Date(data.internship.startDate).toISOString().split('T')[0]
            : '',
          endDate: data.internship?.endDate
            ? new Date(data.internship.endDate).toISOString().split('T')[0]
            : '',
          dailyWorkingHours: data.internship?.dailyWorkingHours || '',
          assignedMentor: data.internship?.assignedMentor || '',
          assignedBatch: data.internship?.assignedBatch || '',
          mode: data.internship?.mode || 'Offline'
        },
        projectWork: {
          projectTitle: data.projectWork?.projectTitle || '',
          finalProjectSubmitted: data.projectWork?.finalProjectSubmitted || false
        },
        academicWork: data.academicWork || {},
        assignedTasks: data.assignedTasks || []
      });
    } catch (err) {
      console.error('Error fetching intern details:', err);
      if (err.response) {
        alert(`Error: ${err.response.data.message || 'Failed to fetch intern details'}`);
      } else {
        alert('Error fetching intern details (Network or Server Error)');
      }
      setInternModalOpen(false);
    } finally {
      setInternLoading(false);
    }
  };

  const handleInternUpdate = async (e) => {
    e.preventDefault();
    setInternSaving(true);
    try {
      await api.updateInternDetailsByAdmin(selectedIntern.userId._id, internData);
      alert('Intern details updated successfully');
      setInternModalOpen(false);
    } catch (err) {
      alert('Error updating intern details');
    } finally {
      setInternSaving(false);
    }
  };

  // Task Assignment Functions
  const openTaskAssignmentModal = async (userId) => {
    try {
      const sanitizedId = String(userId).split(':')[0].trim();
      setInternLoading(true);
      setTaskAssignmentModalOpen(true);

      const response = await api.getInternDetails(sanitizedId);
      const data = response.data.data;

      setSelectedIntern(data);
      setInternData((prev) => ({
        ...prev,
        assignedTasks: data.assignedTasks || [],
        academicWork: data.academicWork || {}
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to fetch intern details');
      setTaskAssignmentModalOpen(false);
    } finally {
      setInternLoading(false);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) {
      alert('Task title is required');
      return;
    }
    try {
      await api.assignTaskToIntern(selectedIntern.userId._id, newTask);
      alert('Task assigned successfully');
      setNewTask({ title: '', description: '', dueDate: '' });

      // Refresh data
      const response = await api.getInternDetails(selectedIntern.userId._id);
      const data = response.data.data;

      setSelectedIntern(data);
      setInternData((prev) => ({
        ...prev,
        assignedTasks: data.assignedTasks || [],
        academicWork: data.academicWork || {}
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to assign task');
    }
  };

  // Helper function for filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Get task status badge variant
  const getTaskStatusVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage employees, interns, and staff</p>
        </div>
        <Button onClick={() => { resetForm(); setModalOpen(true); }}>
          ➕ Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="HR">HR</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="INTERN">Intern</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <Button variant="secondary" onClick={() => fetchUsers(1)}>
            🔄 Refresh
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <Loading />
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="info">{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{user.department || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {user.role?.toUpperCase() === 'INTERN' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openInternModal(user._id)}
                                className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600"
                                title="View Intern Profile"
                              >
                                👤
                              </button>
                              <button
                                type="button"
                                onClick={() => openTaskAssignmentModal(user._id)}
                                className="p-2 hover:bg-teal-50 rounded-lg text-teal-600"
                                title="Assign Tasks & View Reports"
                              >
                                📋
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleStatus(user)}
                            className={`p-2 rounded-lg ${
                              user.isActive
                                ? 'hover:bg-red-50 text-red-600'
                                : 'hover:bg-green-50 text-green-600'
                            }`}
                            title={user.isActive ? 'Disable' : 'Enable'}
                          >
                            {user.isActive ? '🚫' : '✅'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                Page {pagination.current} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => fetchUsers(pagination.current - 1)}
                  disabled={pagination.current <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fetchUsers(pagination.current + 1)}
                  disabled={pagination.current >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name *"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <Select
            label="Role *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={ROLE_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <Input
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setModalOpen(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Intern Profile Modal */}
      <Modal
        isOpen={internModalOpen}
        onClose={() => setInternModalOpen(false)}
        title="Intern Full Profile"
      >
        {internLoading ? (
          <Loading />
        ) : selectedIntern ? (
          <>
            <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
              <p className="text-sm font-bold text-blue-600 mb-1">
                INTERN ID: {selectedIntern.internId}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {selectedIntern.userId?.fullName}
              </p>
              <p className="text-sm text-gray-500">{selectedIntern.userId?.email}</p>
            </div>

            <form onSubmit={handleInternUpdate} className="space-y-6">
              {/* Internship Settings */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 border-b pb-1">
                  🏢 Internship Settings (Admin Decides)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Domain"
                    value={internData.internship.domain}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, domain: e.target.value }
                      })
                    }
                  />
                  <Select
                    label="Type"
                    value={internData.internship.type}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, type: e.target.value }
                      })
                    }
                    options={INTERNSHIP_TYPE_OPTIONS}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Assigned Mentor"
                    value={internData.internship.assignedMentor}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, assignedMentor: e.target.value }
                      })
                    }
                  />
                  <Input
                    label="Assigned Batch"
                    value={internData.internship.assignedBatch}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, assignedBatch: e.target.value }
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={internData.internship.startDate}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, startDate: e.target.value }
                      })
                    }
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={internData.internship.endDate}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, endDate: e.target.value }
                      })
                    }
                  />
                  <Input
                    label="Daily Hours"
                    type="number"
                    value={internData.internship.dailyWorkingHours}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        internship: { ...internData.internship, dailyWorkingHours: e.target.value }
                      })
                    }
                  />
                </div>

                {/* Project Status */}
                <h3 className="font-bold text-gray-700 border-b pb-1 pt-2">
                  🚀 Project Status
                </h3>
                <Input
                  label="Project Title"
                  value={internData.projectWork.projectTitle}
                  onChange={(e) =>
                    setInternData({
                      ...internData,
                      projectWork: { ...internData.projectWork, projectTitle: e.target.value }
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="finalSubmitted"
                    checked={internData.projectWork.finalProjectSubmitted}
                    onChange={(e) =>
                      setInternData({
                        ...internData,
                        projectWork: {
                          ...internData.projectWork,
                          finalProjectSubmitted: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="finalSubmitted" className="text-sm font-medium text-gray-700">
                    Final Project Submitted
                  </label>
                </div>

                {/* Academic Info */}
                <h3 className="font-bold text-gray-700 border-b pb-1 pt-2">
                  🎓 Academic Info (View Only)
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p className="text-gray-500">College:</p>
                  <p className="font-medium">{selectedIntern.education?.collegeName || '-'}</p>
                  <p className="text-gray-500">Course:</p>
                  <p className="font-medium">{selectedIntern.education?.course || '-'}</p>
                  <p className="text-gray-500">Branch:</p>
                  <p className="font-medium">{selectedIntern.education?.branch || '-'}</p>
                  <p className="text-gray-500">Year/Sem:</p>
                  <p className="font-medium">{selectedIntern.education?.yearSemester || '-'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setInternModalOpen(false)}
                >
                  Close
                </Button>
                <Button type="submit" loading={internSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </Modal>

      {/* Task Assignment & Reports Modal */}
      <Modal
        isOpen={taskAssignmentModalOpen}
        onClose={() => setTaskAssignmentModalOpen(false)}
        title="Intern Tasks & Reports"
        size="lg"
      >
        {internLoading ? (
          <Loading />
        ) : selectedIntern ? (
          <div className="space-y-6 h-[70vh] overflow-y-auto pr-2">
            {/* Intern Info Header */}
            <div className="bg-teal-50 p-4 rounded-xl mb-4 border border-teal-100">
              <p className="text-sm font-bold text-teal-600 mb-1">MANAGING TASKS FOR:</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedIntern.userId?.fullName}
              </p>
            </div>

            {/* Assign Task Section */}
            <div className="bg-gray-50 p-4 rounded-xl border">
              <h3 className="font-bold text-gray-800 mb-3">➕ Assign New Task</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Task Description"
                  rows="2"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <div className="flex justify-between items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAssignTask}>Assign Task</Button>
                </div>
              </div>
            </div>

            {/* Assigned Tasks List */}
            <div>
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">
                📋 Assigned Tasks History
              </h3>
              <div className="space-y-2">
                {internData.assignedTasks?.length > 0 ? (
                  internData.assignedTasks
                    .slice()
                    .reverse()
                    .map((task, idx) => (
                      <div
                        key={idx}
                        className="bg-white border p-3 rounded-lg shadow-sm flex justify-between items-start"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getTaskStatusVariant(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No tasks assigned yet.</p>
                )}
              </div>
            </div>

            {/* Daily Reports View */}
            <div>
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">📅 Daily Work Log</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {internData.academicWork?.dailyTaskUpdate?.length > 0 ? (
                  [...internData.academicWork.dailyTaskUpdate].reverse().map((update, idx) => (
                    <div key={idx} className="text-sm p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-gray-700">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            update.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {update.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{update.task}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No daily updates submitted.</p>
                )}
              </div>
            </div>

            {/* Weekly Reports View */}
            <div>
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">📊 Weekly Reports</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {internData.academicWork?.weeklyProgressReport?.length > 0 ? (
                  [...internData.academicWork.weeklyProgressReport].reverse().map((report, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-3 bg-indigo-50 rounded-lg border border-indigo-100"
                    >
                      <p className="font-bold text-indigo-800 mb-1">Week {report.weekNumber}</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{report.report}</p>
                      <p className="text-xs text-indigo-400 mt-2 text-right">
                        Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No weekly reports submitted.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
};

export default UserManagement;