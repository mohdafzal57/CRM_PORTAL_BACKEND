import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const info = (message, duration) => addToast(message, 'info', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] max-w-md bg-white/80 backdrop-blur-md border border-l-4 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-full fade-in duration-300 ${toast.type === 'success' ? 'border-emerald-200 border-l-emerald-500' :
                                toast.type === 'error' ? 'border-rose-200 border-l-rose-500' :
                                    toast.type === 'warning' ? 'border-amber-200 border-l-amber-500' :
                                        'border-indigo-200 border-l-indigo-500'
                            }`}
                    >
                        <div className={`mt-0.5 shrink-0 ${toast.type === 'success' ? 'text-emerald-500' :
                            toast.type === 'error' ? 'text-rose-500' :
                                toast.type === 'warning' ? 'text-amber-500' :
                                    'text-indigo-500'
                            }`}>
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                        </div>

                        <div className="flex-1">
                            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-emerald-800' :
                                toast.type === 'error' ? 'text-rose-800' :
                                    toast.type === 'warning' ? 'text-amber-800' :
                                        'text-indigo-800'
                                }`}>
                                {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
                            </p>
                            <p className="text-sm text-slate-600 mt-0.5">{toast.message}</p>
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
