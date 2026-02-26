'use client';

import React from 'react';
import { X, User, IdCard, Briefcase, Calendar, MapPin, ShieldAlert, FileText, History, ExternalLink, Banknote, GraduationCap } from 'lucide-react';

interface ViewEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

export default function ViewEmployeeModal({ isOpen, onClose, employee }: ViewEmployeeModalProps) {
    if (!isOpen || !employee) return null;

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 0;
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(employee.birthdate);
    const isRetiring = age >= 60;
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header/Banner Area */}
                <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 px-8 flex items-end pb-6 border-b border-slate-200">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-end gap-8">
                        <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200 overflow-hidden shrink-0">
                            <div className="h-full w-full rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-4xl overflow-hidden">
                                {employee.photo_url ? (
                                    <img src={employee.photo_url} alt={employee.first_name} className="w-full h-full object-cover" />
                                ) : (
                                    (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')
                                )}
                            </div>
                        </div>

                        <div className="mb-2 space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                                    {employee.first_name} {employee.mid_name ? `${employee.mid_name[0]}. ` : ''}{employee.last_name}
                                </h2>
                                <div className="flex gap-2">
                                    {isRetiring && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200">RETIRING</span>}
                                    {employee.is_deceased && <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-200">DECEASED</span>}
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-200 uppercase">{employee.status}</span>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-slate-500 flex items-center gap-2">
                                {employee.position_title}
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                <span className="text-blue-600">{employee.department}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">

                    {/* Top Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Item Number</p>
                            <p className="text-sm font-bold text-slate-700 font-mono tracking-tighter truncate" title={employee.item_number}>{employee.item_number || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary Grade / Step</p>
                            <p className="text-sm font-bold text-slate-700">SG {employee.salary_grade || '??'} - Step {employee.step || '?'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classification</p>
                            <p className="text-sm font-bold text-slate-700">{employee.classification}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level / Station</p>
                            <p className="text-sm font-bold text-slate-700">{employee.level} Division</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Column 1: Personal & Eligibility */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} /> Personal Information
                                </h3>
                                <div className="space-y-4 px-1">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Birthdate & Age</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {employee.birthdate ? new Date(employee.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            <span className="text-slate-400 ml-2">({age} y/o)</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sex / Gender</p>
                                        <p className="text-sm font-semibold text-slate-700">{employee.sex || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">TIN Number</p>
                                        <p className="text-sm font-semibold text-slate-700 font-mono tracking-wider">{employee.tin || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <IdCard size={14} /> Eligibility
                                </h3>
                                <div className="px-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">CS Eligibility</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">{employee.civil_service_eligibility || 'None Stated'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Compensation & Area */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                    <Banknote size={14} /> Compensation
                                </h3>
                                <div className="space-y-4 px-1">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Annual (Authorized)</p>
                                        <p className="text-lg font-black text-slate-800">{employee.annual_salary_authorized ? formatCurrency(employee.annual_salary_authorized) : '₱ 0.00'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Annual (Actual)</p>
                                        <p className="text-lg font-black text-emerald-700">{employee.annual_salary_actual ? formatCurrency(employee.annual_salary_actual) : '₱ 0.00'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={14} /> Location & PPA
                                </h3>
                                <div className="space-y-4 px-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Area Code</p>
                                            <p className="text-sm font-semibold text-slate-700">{employee.area_code || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Area Type</p>
                                            <p className="text-sm font-semibold text-slate-700">{employee.area_type || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">P/P/A Attribution</p>
                                        <p className="text-sm font-semibold text-slate-700 italic">{employee.ppa_attribution || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Chronology */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} /> Service History
                            </h3>
                            <div className="space-y-6 px-1 relative">
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100" />

                                <div className="relative pl-8">
                                    <div className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Original Appointment</p>
                                    <p className="text-sm font-semibold text-slate-700">{employee.original_appointment_date ? new Date(employee.original_appointment_date).toLocaleDateString() : 'No Record'}</p>
                                </div>

                                <div className="relative pl-8">
                                    <div className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Last Promotion</p>
                                    <p className="text-sm font-semibold text-slate-700">{employee.last_promotion_date ? new Date(employee.last_promotion_date).toLocaleDateString() : 'None'}</p>
                                </div>

                                {(employee.retirement_date || employee.resigned_date) && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-white" />
                                        <p className="text-[10px] font-bold text-red-400 uppercase">Separation Schedule</p>
                                        <p className="text-sm font-semibold text-red-700">
                                            {employee.retirement_date ? `Retired: ${new Date(employee.retirement_date).toLocaleDateString()}` : ''}
                                            {employee.resigned_date ? `Resigned: ${new Date(employee.resigned_date).toLocaleDateString()}` : ''}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                    >
                        Return to List
                    </button>
                </div>
            </div>
        </div>
    );
}