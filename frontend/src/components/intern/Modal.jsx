import React from 'react';
import { X } from 'lucide-react'; // Assuming you have lucide-react or similar, but I'll use simple ASCII or confirm icons

// Simple Button component for the modal if not imported from elsewhere or if we want to keep it self-contained
const Button = ({ children, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 ${className}`}
    >
        {children}
    </button>
);

const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all scale-100 opacity-100">
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
                    {type === 'success' ? (
                        <span className="text-3xl">✅</span>
                    ) : (
                        <span className="text-3xl">⚠️</span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-center mb-6">{message}</p>
                <Button onClick={onClose} className="w-full justify-center py-3">
                    Okay, Got it!
                </Button>
            </div>
        </div>
    );
};

export default Modal;
