import React from 'react';

const Loading = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-4xl mb-4">⏳</div>
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);

export default Loading;