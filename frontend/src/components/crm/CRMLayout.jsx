/**
 * CRM Layout Component
 * Wraps all CRM pages with sidebar and header
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CRMSidebar from './CRMSidebar';
import CRMHeader from './CRMHeader';

const CRMLayout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <CRMSidebar />
            
            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Header */}
                <CRMHeader />
                
                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default CRMLayout;