import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Calendar,
    FileText,
    Clock,
    Settings,
    Bell,
    ChevronDown,
    Menu,
    LogOut,
    ChevronRight,
    ArrowLeft,
    CheckSquare,
    BarChart3
} from 'lucide-react';
import NotificationDropdown from './ui/NotificationDropdown';

const InternLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const navigation = [
        { name: 'Overview', path: '/intern/dashboard', icon: LayoutDashboard },
        { name: 'Attendance', path: '/intern/attendance', icon: Clock },
        { name: 'My Profile', path: '/intern/profile', icon: User },
        { name: 'Daily Tasks', path: '/intern/tasks', icon: CheckSquare },
        { name: 'Progress Reports', path: '/intern/reports', icon: BarChart3 },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen zoho-bg-pattern font-sans overflow-hidden">
            {/* Sidebar Overlay for Mobile */}
            {!isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 h-screen transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-72 p-6 translate-x-0' : '-translate-x-full lg:w-20 lg:p-3 lg:translate-x-0'
                    }`}
            >
                <div className={`h-full glass-layer flex flex-col shadow-2xl shadow-indigo-200/20 border-white/60 ${isSidebarOpen ? 'p-6' : 'p-3'}`}>
                    <div className={`flex items-center ${isSidebarOpen ? 'mb-12 px-4' : 'mb-8 justify-center'}`}>
                        {isSidebarOpen ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                    <span className="text-white font-black text-xl">N</span>
                                </div>
                                <span className="text-xl font-black text-slate-800 tracking-tighter">Nexus Intern</span>
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <span className="text-white font-black text-2xl">N</span>
                            </div>
                        )}
                    </div>

                    <nav className={`flex-1 ${isSidebarOpen ? 'space-y-2' : 'space-y-3'}`}>
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    isSidebarOpen
                                        ? `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative ${isActive
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                            : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                                        }`
                                        : `flex items-center justify-center py-3 rounded-2xl transition-all group relative ${isActive
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                            : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                                        }`
                                }
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {isSidebarOpen && <span className="text-sm font-bold tracking-tight">{item.name}</span>}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-6 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-slate-100/50">
                        <button
                            onClick={handleLogout}
                            className={isSidebarOpen
                                ? `flex items-center gap-4 w-full px-5 py-4 logout-btn hover:text-rose-600 hover:bg-white/5 rounded-2xl transition-all group`
                                : `flex items-center justify-center w-full py-3 logout-btn hover:text-rose-600 hover:bg-white/5 rounded-2xl transition-all group`
                            }
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            {isSidebarOpen && <span className="text-sm font-bold tracking-tight">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
                {/* Header - Sticky with Glass Effect */}
                <header className="px-10 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/40">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-white/60 hover:bg-white rounded-xl border border-white transition-all shadow-sm"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <NotificationDropdown />
                        </div>

                        <div className="h-8 w-px bg-slate-200/50 mx-1"></div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pr-2 pl-4 py-2 hover:bg-white/80 rounded-[1.25rem] transition-all border border-transparent hover:border-white hover:shadow-xl hover:shadow-indigo-500/5 group"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-[13px] font-[900] text-slate-800 leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{user?.fullName || user?.name || 'Intern'}</div>
                                    <div className="text-[9px] text-indigo-500 font-bold uppercase mt-1 tracking-[0.2em]">Intern Portal</div>
                                </div>
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/30 overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{(user?.fullName || user?.name || 'I').charAt(0)}</span>
                                    )}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] border border-white p-3 z-20 animate-in fade-in zoom-in-95 duration-500 slide-in-from-top-4">
                                        <div className="p-6 bg-slate-50/50 rounded-[2rem] mb-2 border border-slate-100/50">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/20">
                                                    {(user?.fullName || user?.name || 'I').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-black text-slate-800 leading-tight">{user?.fullName || user?.name}</div>
                                                    <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">Intern Access</div>
                                                </div>
                                            </div>
                                            <div className="bg-white/60 p-3 rounded-xl border border-white/50">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Email</div>
                                                <div className="text-xs font-bold text-slate-600 truncate">{user?.email}</div>
                                            </div>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            <button
                                                onClick={() => {
                                                    navigate('/intern/profile');
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-2xl transition-all group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                    <span>My Profile</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                            </button>

                                            <div className="h-px bg-slate-100 mx-4 my-2"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-between px-5 py-4 text-sm font-black text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group/logout"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="uppercase tracking-widest text-[11px]">Sign Out</span>
                                                </div>
                                                <ArrowLeft className="w-4 h-4 opacity-0 group-hover/logout:opacity-100 translate-x-2 group-hover/logout:translate-x-0 transition-all rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 px-10 pt-10 pb-10">
                    {children}
                </div> {/* Using children prop as per original code */}
            </main>
        </div>
    );
};

export default InternLayout;
