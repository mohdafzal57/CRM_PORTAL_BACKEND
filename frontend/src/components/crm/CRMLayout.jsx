/**
 * CRM Layout Component
 * Wraps all CRM pages with sidebar and header
 */

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CRMSidebar from './CRMSidebar';
import CRMHeader from './CRMHeader';

const CRMLayout = ({ children }) => {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <CRMSidebar isCollapsed={sidebarCollapsed} />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen`}>
                {/* Header */}
                <CRMHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} isSidebarCollapsed={sidebarCollapsed} />

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default CRMLayout;