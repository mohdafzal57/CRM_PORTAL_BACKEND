import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled,
  loading,
  type = 'button',
  className = ''
}) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:border-slate-300',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-5 py-2.5 rounded-xl font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;