import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications(); // Refresh on open
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate based on related model if needed
        if (notification.relatedModel === 'Task' && notification.relatedId) {
            // Logic to navigate
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            default: return <Info className="w-5 h-5 text-indigo-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-2.5 bg-white/60 hover:bg-white rounded-xl border border-white transition-all shadow-sm relative group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-600' : 'text-slate-500'} group-hover:text-indigo-600 transition-colors`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] border border-white p-2 z-50 animate-in fade-in zoom-in-95 duration-200 slide-in-from-top-4 origin-top-right">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/50">
                        <h3 className="font-extrabold text-slate-800 text-lg">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-1">We'll let you know when something arrives</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 rounded-2xl transition-all cursor-pointer group hover:bg-slate-50 flex gap-4 ${!notification.read ? 'bg-indigo-50/50 border border-indigo-100/50' : 'border border-transparent'}`}
                                >
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${!notification.read ? 'bg-white' : 'bg-slate-100'}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!notification.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="shrink-0 self-center">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-slate-100/50 p-2">
                        <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">
                            View All History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
