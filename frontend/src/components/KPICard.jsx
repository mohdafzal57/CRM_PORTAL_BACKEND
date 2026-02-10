import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, trendType, color }) => {
    return (
        <div className="group relative card-glass overflow-hidden p-8 hover:border-indigo-200">
            <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color?.replace('bg-', '')} transition-transform duration-500 group-hover:scale-110 shadow-inner`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${trendType === 'up'
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        : 'text-rose-600 bg-rose-50 border-rose-100'
                        }`}>
                        {trendType === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</div>
                <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </div>
    );
};

export default KPICard;
