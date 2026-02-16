import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const HRLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { path: '/hr', label: 'Dashboard', icon: '📊' },
    { path: '/hr/take-attendance', label: 'Take Attendance', icon: '✅' },
    { path: '/hr/attendance', label: 'Attendance Records', icon: '📅' },
    { path: '/hr/employees', label: 'Employees', icon: '👥' },
    { path: '/hr/leaves', label: 'Leave Management', icon: '🏖️' },
    { path: '/hr/interns', label: 'Interns', icon: '🎓' },
    { path: '/hr/reports', label: 'Reports', icon: '📈' },
    { path: '/hr/profile', label: 'My Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-emerald-700 to-emerald-900 text-white transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4 border-b border-emerald-600 flex items-center justify-between">
          {sidebarOpen && <div><h1 className="text-xl font-bold">HR Portal</h1><p className="text-emerald-300 text-xs">Human Resources</p></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-emerald-600 rounded-lg">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path ? 'bg-white text-emerald-800 shadow-lg' : 'hover:bg-emerald-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold">
              {user.fullName?.charAt(0) || 'H'}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{user.fullName || 'HR User'}</p>
                <p className="text-emerald-300 text-xs truncate">{user.email}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={handleLogout} className="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium">
              🚪 Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {menuItems.find(i => location.pathname === i.path)?.label || 'HR Dashboard'}
              </h2>
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default HRLayout;