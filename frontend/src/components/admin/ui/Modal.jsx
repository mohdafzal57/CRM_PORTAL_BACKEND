import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'bg-slate-900/40 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] w-full ${sizes[size]} max-h-[90vh] overflow-hidden border border-white/40 ring-1 ring-slate-900/5 transition-all duration-300 custom-scrollbar flex flex-col ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-95 group"
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    `}</style>
    </div>
  );
};

export default Modal;