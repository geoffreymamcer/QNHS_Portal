'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

interface DashboardClientProps {
    stats: {
        label: string;
        value: string | number;
        change: string;
        color: string;
        icon: React.ReactNode;
    }[];
    deptData: { name: string; count: number }[];
    ageData: { name: string; value: number }[];
    genderData: { name: string; value: number; color: string }[];
    hiringTrendData: { year: string; hires: number }[];
    separationTrendData: { year: string; resignations: number; retirements: number; transfers: number; deceased: number }[];
    complianceData: { name: string; count: number }[];
}

export default function DashboardClient({
    stats,
    deptData,
    ageData,
    genderData,
    hiringTrendData,
    separationTrendData,
    complianceData
}: DashboardClientProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-blue-950">Overview Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Here's what's happening at Quezon National High School today.
                </p>
            </div>

            {/* Row 1: Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-extrabold text-blue-950">{stat.value}</h3>
                            <p className="text-[10px] font-medium text-slate-500 pb-1">{stat.change}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2: Main Distribution Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Employees per Department (Bar Chart) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-blue-950 mb-6">Employees per Department</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Age Distribution (Bar) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                        <h3 className="text-base font-bold text-blue-950 mb-4">Age Distribution</h3>
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gender Distribution (Pie) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                        <h3 className="text-base font-bold text-blue-950 mb-4">Gender Distribution</h3>
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Trends & Compliance */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Hiring Trend (Line) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-blue-950 mb-2">Hiring Trend</h3>
                    <p className="text-[11px] text-slate-500 mb-6">Growth of faculty over time</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hiringTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Line type="monotone" dataKey="hires" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Separation Trend (Line) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-blue-950 mb-2">Staffing Gap Forecast</h3>
                    <p className="text-[11px] text-slate-500 mb-6">Resignations & Retirements per year</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={separationTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                <Line type="monotone" dataKey="resignations" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                                <Line type="monotone" dataKey="retirements" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                                <Line type="monotone" dataKey="transfers" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                                <Line type="monotone" dataKey="deceased" stroke="#6b7280" strokeWidth={2} dot={{ fill: '#6b7280', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Compliance (Bar) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-blue-950 mb-2">Compliance Status</h3>
                    <p className="text-[11px] text-slate-500 mb-6">Records with missing Gov IDs</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={complianceData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
