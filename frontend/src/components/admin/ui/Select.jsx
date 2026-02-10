import React from 'react';

const Select = ({ label, options, error, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <select
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-300' : 'border-gray-200'
      }`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Select;