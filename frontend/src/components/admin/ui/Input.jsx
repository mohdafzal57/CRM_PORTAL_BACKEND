import React from 'react';

const Input = ({ label, error, ...props }) => (
  <div className="mb-5 group">
    {label && (
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-indigo-500">
        {label}
      </label>
    )}
    <input
      className={`w-full px-5 py-3 bg-slate-50 border rounded-xl outline-none transition-all duration-200 font-medium text-slate-700 placeholder:text-slate-400 ${error
          ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
          : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300'
        }`}
      {...props}
    />
    {error && <p className="text-rose-500 text-xs font-semibold mt-1.5 ml-1 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-rose-500"></span>
      {error}
    </p>}
  </div>
);

export default Input;