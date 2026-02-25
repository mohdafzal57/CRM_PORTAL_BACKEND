
/**
 * CRM Header Component
 * Search, notifications, and user profile
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Bell, 
    Moon, 
    Sun, 
    ChevronDown, 
    User, 
    Settings, 
    LogOut,
    HelpCircle,
    Plus
} from 'lucide-react';

const CRMHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    
    const [notifications] = useState([
        { id: 1, text: 'New lead assigned to you', time: '5m ago', unread: true },
        { id: 2, text: 'Deal "Enterprise Plan" moved to negotiation', time: '1h ago', unread: true },
        { id: 3, text: 'Meeting reminder: Client call at 3 PM', time: '2h ago', unread: false },
    ]);
    
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results or filter current page
            console.log('Searching for:', searchQuery);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-12 lg:ml-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search leads, deals, contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 
                                       border border-gray-200 rounded-xl
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </form>

                {/* Right Section */}
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Quick Add Button */}
                    <button 
                        onClick={() => navigate('/crm/leads')}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 
                                   bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Add Lead</span>
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {darkMode ? (
                            <Sun className="text-yellow-500" size={20} />
                        ) : (
                            <Moon className="text-gray-500" size={20} />
                        )}
                    </button>

                    {/* Help */}
                    <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <HelpCircle className="text-gray-500" size={20} />
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setNotificationOpen(!notificationOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                        >
                            <Bell className="text-gray-500" size={20} />
                            {notifications.some(n => n.unread) && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {notificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white 
                                            rounded-xl shadow-lg border border-gray-100
                                            py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    <span className="text-xs text-blue-500 cursor-pointer hover:underline">
                                        Mark all read
                                    </span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer
                                                       ${notif.unread ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {notif.unread && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                )}
                                                <div>
                                                    <p className="text-sm text-gray-700">{notif.text}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 border-t border-gray-100">
                                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium w-full text-center">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 
                                       rounded-xl transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-700">
                                    {user?.fullName || user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role?.toLowerCase()}
                                </p>
                            </div>
                            <ChevronDown className="hidden md:block text-gray-400" size={16} />
                        </button>

                        {/* Profile Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white 
                                            rounded-xl shadow-lg border border-gray-100
                                            py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="font-medium text-gray-800">{user?.fullName || user?.name}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                                <div className="py-1">
                                    <button className="flex items-center gap-3 w-full px-4 py-2 text-left
                                                       text-gray-700 hover:bg-gray-50">
                                        <User size={18} />
                                        <span>My Profile</span>
                                    </button>
                                    <button className="flex items-center gap-3 w-full px-4 py-2 text-left
                                                       text-gray-700 hover:bg-gray-50">
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 py-1">
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-left
                                                   text-red-500 hover:bg-red-50"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CRMHeader;