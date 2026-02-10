import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import io from 'socket.io-client';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { info, error } = useToast();
    const [socket, setSocket] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket.io integration for real-time notifications
    useEffect(() => {
        // Initialize socket connection using the underlying variable from api service if available, 
        // or create a new reliable connection
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Notification Socket Connected:', newSocket.id);
        });

        newSocket.on('notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            info(newNotification.message);
        });

        return () => newSocket.close();
    }, [info]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
