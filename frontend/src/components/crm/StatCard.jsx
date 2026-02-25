/**
 * Reusable Stats Card Component for CRM Dashboard
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    bgColor = 'bg-blue-500',
    iconBgColor = 'bg-blue-100',
    iconColor = 'text-blue-500',
    subtitle,
    onClick
}) => {
    return (
        <div 
            className={`bg-white rounded-xl shadow-sm border border-gray-100 
                        p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                        ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                    
                    {/* Trend indicator */}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-3 text-sm font-medium
                                        ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{trendValue}</span>
                            <span className="text-gray-400 font-normal">vs last month</span>
                        </div>
                    )}
                </div>

                {/* Icon */}
                {Icon && (
                    <div className={`${iconBgColor} p-3 rounded-xl`}>
                        <Icon className={iconColor} size={24} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;