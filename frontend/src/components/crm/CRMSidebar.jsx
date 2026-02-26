/**
 * CRM Sidebar Navigation
 * Light blue gradient theme matching Zoho CRM style
 */
import { ClipboardList, ShoppingCart } from "lucide-react";
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
// import {
//     Home,
//     Users,
//     Briefcase,
//     Contact,
//     Building2,
//     CheckSquare,
//     FileText,
//     BarChart3,
//     Settings,
//     LogOut,
//     X,
//     Menu,
//     ChevronLeft,
//     Calendar,
//     Target,
//     TrendingUp
// } from 'lucide-react';
import {
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    ChevronLeft,
    Contact,
    Home,
    LogOut,
    Menu,
    Package,
    Target,
    TrendingUp,
    X
} from 'lucide-react';

// const menuItems = [
//     { path: '/crm', name: 'Dashboard', icon: Home, exact: true },
//     { path: '/crm/leads', name: 'Leads', icon: Target },
//     { path: '/crm/deals', name: 'Deals', icon: Briefcase },
//     { path: '/crm/contacts', name: 'Contacts', icon: Contact },
//     { path: '/crm/accounts', name: 'Accounts', icon: Building2 },
//     { path: '/crm/activities', name: 'Activities', icon: CheckSquare },
//     { path: '/crm/calendar', name: 'Calendar', icon: Calendar },
//     { path: '/crm/reports', name: 'Reports', icon: FileText },
//     { path: '/crm/analytics', name: 'Analytics', icon: BarChart3 },
// ];

const menuItems = [
    { path: '/crm', name: 'Dashboard', icon: Home, exact: true },
    { path: '/crm/leads', name: 'Leads', icon: Target },
    { path: '/crm/deals', name: 'Deals', icon: Briefcase },
    { path: '/crm/contacts', name: 'Contacts', icon: Contact },
    { path: '/crm/accounts', name: 'Accounts', icon: Building2 },
    { path: '/crm/meetings', name: 'Meetings', icon: Calendar },
    // { path: '/crm/calls', name: 'Calls', icon: Phone },
    { path: '/crm/products', name: 'Products', icon: Package },
    // { path: '/crm/quotes', name: 'Quotes', icon: FileText },
    { path: '/crm/reports', name: 'Reports', icon: BarChart3 },
    { path: "/crm/work-queue", name: "Work Queue", icon: ClipboardList },
    { path: "/crm/orders", name: "Orders", icon: ShoppingCart }
];

const CRMSidebar = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBackToMain = () => {
        const role = user.role?.toUpperCase();
        const dashboards = {
            'ADMIN': '/admin',
            'HR': '/hr',
            'MANAGER': '/manager/dashboard',
            'EMPLOYEE': '/employee/dashboard',
            'INTERN': '/intern/dashboard'
        };
        navigate(dashboards[role] || '/login');
    };

    const NavItem = ({ item }) => {
        const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
        
        return (
            <NavLink
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl mx-2 mb-1
                    transition-all duration-200 font-medium
                    ${isActive 
                        ? 'bg-white/20 text-white shadow-lg border-l-4 border-white' 
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }
                `}
            >
                <item.icon size={20} />
                <span>{item.name}</span>
            </NavLink>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Logo & Back Button */}
            <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">CRM Pro</h1>
                        <p className="text-xs text-blue-200">Sales Dashboard</p>
                    </div>
                </div>
                <button
                    onClick={handleBackToMain}
                    className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to Main Dashboard
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                            {user?.fullName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                            {user?.fullName || user?.name || 'User'}
                        </p>
                        <p className="text-xs text-blue-200 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl
                               text-blue-100 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-xl shadow-lg"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`
                lg:hidden fixed inset-y-0 left-0 z-50 w-64
                bg-gradient-to-b from-blue-500 to-blue-700
                transform transition-transform duration-300
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
                >
                    <X size={20} />
                </button>
                <div className="h-full flex flex-col">
                    <SidebarContent />
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 
                              bg-gradient-to-b from-blue-500 to-blue-700 
                              flex-col shadow-xl z-30">
                <SidebarContent />
            </aside>
        </>
    );
};

export default CRMSidebar;