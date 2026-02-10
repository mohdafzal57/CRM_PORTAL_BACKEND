import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ label, options, error, ...props }) => (
  <div className="mb-5 group">
    {label && (
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-indigo-500">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        className={`w-full px-5 py-3 bg-slate-50 border rounded-xl outline-none appearance-none transition-all duration-200 font-medium text-slate-700 cursor-pointer ${error
            ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
            : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300'
          }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
    {error && <p className="text-rose-500 text-xs font-semibold mt-1.5 ml-1 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-rose-500"></span>
      {error}
    </p>}
  </div>
);

export default Select;