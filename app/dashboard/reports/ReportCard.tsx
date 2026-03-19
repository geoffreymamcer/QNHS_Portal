'use client';

import React from 'react';
import { FileText, Download, Eye, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    lastGenerated?: string;
    category: string;
    trend?: string;
    isPriority?: boolean;
    onDownload?: () => void;
    onView?: () => void;
}

export default function ReportCard({
    title,
    description,
    icon,
    lastGenerated = 'Never',
    category,
    trend,
    isPriority = false,
    onDownload,
    onView
}: ReportCardProps) {
    return (
        <div className="group relative bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 overflow-hidden">
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 group-hover:bg-blue-50" />

            <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        {icon}
                    </div>
                    {isPriority && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-100">
                            <AlertCircle size={10} />
                            Requested
                        </span>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Clock size={12} />
                            LAST: {lastGenerated.toUpperCase()}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                <TrendingUp size={12} />
                                {trend}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onView}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Preview Content"
                        >
                            <Eye size={20} />
                        </button>
                        <button
                            onClick={onDownload}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                            title="Download PDF"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hover Indicator Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-all rounded-l-3xl" />
        </div>
    );
}
