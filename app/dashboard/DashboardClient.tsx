'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

interface StatCard {
    label: string;
    value: string | number;
    change: string;
    color: string;
    icon: React.ReactNode;
}

interface DashboardClientProps {
    stats: StatCard[];
    deptData: { name: string; count: number }[];
    ageData: { name: string; value: number }[];
    genderData: { name: string; value: number; color: string }[];
    statusData: { name: string; value: number; color: string }[];
    classificationData: { name: string; value: number; color: string }[];
    hiringTrendData: { year: string; hires: number }[];
    retirementForecastData: { year: string; count: number }[];
    separationTrendData: { year: string; resignations: number; retirements: number; deceased: number }[];
}

const CARD_ACCENT: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-slate-100 text-slate-500 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
};

const TOOLTIP_STYLE: React.CSSProperties = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
};

export default function DashboardClient({
    stats,
    deptData,
    ageData,
    genderData,
    statusData,
    classificationData,
    hiringTrendData,
    retirementForecastData,
    separationTrendData,
}: DashboardClientProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-blue-950">Overview Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Here&apos;s what&apos;s happening at Quezon National High School today.
                </p>
            </div>

            {/* ── Row 1: KPI Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {stats.map((stat) => {
                    const accent = CARD_ACCENT[stat.color] ?? CARD_ACCENT.slate;
                    return (
                        <div
                            key={stat.label}
                            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between min-h-[130px]"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-xl border ${accent} group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right leading-tight max-w-[90px]">
                                    {stat.label}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-blue-950 leading-none">{stat.value}</h3>
                                <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.change}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Row 2: Dept Bar + Classification Donut + Employment Status Pie ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Employees per Department */}
                <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-bold text-blue-950">Employees per Department</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Active staff distribution</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} layout="vertical" margin={{ left: 8, right: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    width={100}
                                />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="count" fill="#1d4ed8" radius={[0, 6, 6, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Classification Donut */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-base font-bold text-blue-950">Staff Classification</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Teaching vs. Non-Teaching breakdown</p>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={classificationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {classificationData.map((entry, index) => (
                                        <Cell key={`cls-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employment Status Pie */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-base font-bold text-blue-950">Employment Status</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Permanent, Contractual &amp; others</p>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`status-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Row 3: Hiring Trend + Retirement Forecast ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Hiring Trend */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-bold text-blue-950">Hiring Trend</h3>
                    <p className="text-[11px] text-slate-400 mb-5">New appointments per year</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hiringTrendData} margin={{ left: -10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Line
                                    type="monotone"
                                    dataKey="hires"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Retirement Forecast */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-bold text-blue-950">Retirement Forecast</h3>
                    <p className="text-[11px] text-slate-400 mb-5">Upcoming retirements — next 5 years</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={retirementForecastData} margin={{ left: -10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#fff1f2' }} contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={36} name="Retirements" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Row 4: Age Distribution + Gender + Separation Trend ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Age Distribution */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-base font-bold text-blue-950">Age Distribution</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Active employees by age group</p>
                    <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} name="Employees" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gender Distribution */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-base font-bold text-blue-950">Gender Distribution</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Active employees by sex</p>
                    <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`gender-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Separation Trend */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-bold text-blue-950">Staffing Gap Forecast</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Resignations &amp; retirements per year</p>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={separationTrendData} margin={{ left: -10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                <Line type="monotone" dataKey="resignations" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="retirements" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="deceased" stroke="#6b7280" strokeWidth={2} dot={{ fill: '#6b7280', r: 3, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
