'use client';

import React from 'react';
import { X, User, IdCard, Briefcase, Mail, Calendar, MapPin, Phone, ShieldAlert, FileText, History, ExternalLink } from 'lucide-react';

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header/Banner Area */}
                <div className="relative h-32 bg-gradient-to-r from-blue-700 to-blue-900 px-8 flex items-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                        <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200 overflow-hidden">
                            <div className="h-full w-full rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl overflow-hidden">
                                {employee.photo_url ? (
                                    <img
                                        src={employee.photo_url}
                                        alt={`${employee.first_name} ${employee.last_name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')
                                )}
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-center gap-3">
                                {/* Changed text-white and drop shadow to text-slate-900 */}
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {employee.first_name} {employee.last_name}
                                </h2>
                                {isRetiring && (
                                    <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-slate-100">
                                        RETIRING
                                    </span>
                                )}
                                {employee.is_deceased && (
                                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-slate-100">
                                        DECEASED
                                    </span>
                                )}
                            </div>
                            {/* Changed text-white to text-slate-600 */}
                            <p className="text-slate-600 font-bold text-sm tracking-wide lowercase first-letter:uppercase mt-1">
                                {employee.position} <span className="mx-1 text-slate-300">•</span> {employee.department || employee.dept}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto pt-24 pb-8 px-8 space-y-8 custom-scrollbar">

                    {/* Action Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Record ID</p>
                            <p className="text-sm font-bold text-blue-700 mt-1">#{employee.employee_id}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</p>
                            <p className="text-sm font-bold text-slate-700 mt-1">{employee.position_classification || employee.classification}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel Status</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                <p className="text-sm font-bold text-emerald-700">Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact & Personal */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                                <User size={14} className="text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Age / Birthdate</p>
                                        <p className="text-sm font-semibold text-slate-700">{age} Years Old ({employee.birthdate ? new Date(employee.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'})</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Government Numbers */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                                <IdCard size={14} className="text-blue-600" />
                                Government IDs
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">GSIS ID</p>
                                    <p className="text-sm font-semibold text-slate-700 font-mono">{employee.gsis_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">TIN ID</p>
                                    <p className="text-sm font-semibold text-slate-700 font-mono">{employee.tin || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pag-IBIG MID</p>
                                    <p className="text-sm font-semibold text-slate-700 font-mono">{employee.pagibig_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">PhilHealth</p>
                                    <p className="text-sm font-semibold text-slate-700 font-mono">{employee.philhealth_number || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service & Employment History */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                            <History size={14} className="text-blue-600" />
                            Employment History & Attachments
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Hired Date</p>
                                    <p className="text-sm font-semibold text-slate-700">{employee.hired_date ? new Date(employee.hired_date).toLocaleDateString() : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Last Promoted</p>
                                    <p className="text-sm font-semibold text-slate-700">{employee.date_promoted ? new Date(employee.date_promoted).toLocaleDateString() : '-'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Last Assignment / Station</p>
                                <p className="text-sm font-semibold text-slate-700">{employee.last_assign || 'N/A'}</p>
                            </div>
                        </div>
                        {employee.file_url && (
                            <a
                                href={employee.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors group"
                            >
                                <FileText size={18} />
                                <span className="text-xs font-bold">View Service Record Attachment</span>
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        )}
                    </div>

                    {/* Separation Status (Only show if any field is present) */}
                    {(employee.retirement_date || employee.resigned_date || employee.transferred_date || employee.is_deceased) && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-red-50 pb-2">
                                <ShieldAlert size={14} className="text-red-600" />
                                Status & Separation Records
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {employee.retirement_date && (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Retirement Date</p>
                                        <p className="text-sm font-semibold text-slate-700">{new Date(employee.retirement_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                                {employee.resigned_date && (
                                    <div>
                                        <p className="text-[10px] font-bold text-red-400 uppercase">Resignation Date</p>
                                        <p className="text-sm font-semibold text-red-700">{new Date(employee.resigned_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                                {employee.transferred_date && (
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase">Transfer Date</p>
                                        <p className="text-sm font-semibold text-indigo-700">{new Date(employee.transferred_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Employment Status Notice */}
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-700">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">Assigned to {employee.department || employee.dept} Department</h4>
                            <p className="text-xs text-blue-700 mt-0.5">Currently serving as a {employee.position} with {employee.position_classification || employee.classification} Personnel classification.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
}