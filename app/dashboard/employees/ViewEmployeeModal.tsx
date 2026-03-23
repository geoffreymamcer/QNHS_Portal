'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, User, IdCard, Briefcase, Calendar, MapPin, 
    ShieldAlert, FileText, History, ExternalLink, 
    Banknote, GraduationCap, Users, Award, 
    Fingerprint, Contact, Loader2, CheckCircle2 
} from 'lucide-react';
import { getEmployeeFullProfile } from './actions';

interface ViewEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

type TabType = 'general' | 'pds' | 'family' | 'education' | 'eligibility';

export default function ViewEmployeeModal({ isOpen, onClose, employee }: ViewEmployeeModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [fullData, setFullData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && employee?.id) {
            fetchFullProfile();
        }
        // Reset tab when opening for a new employee
        if (isOpen) setActiveTab('general');
    }, [isOpen, employee?.id]);

    const fetchFullProfile = async () => {
        setIsLoading(true);
        try {
            const data = await getEmployeeFullProfile(employee.id);
            setFullData(data);
        } catch (error) {
            console.error('Error fetching full profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'general', label: 'Summary', icon: FileText },
        { id: 'pds', label: 'PDS Info', icon: Fingerprint },
        { id: 'family', label: 'Family', icon: Users },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'eligibility', label: 'Eligibility', icon: Award },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header/Banner Area */}
                <div className="relative h-44 bg-gradient-to-br from-slate-50 to-slate-100 px-8 flex items-end pb-6 border-b border-slate-200">
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

                {/* Navigation Tabs */}
                <div className="px-8 bg-slate-50/50 border-b border-slate-200 flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all whitespace-nowrap font-bold text-xs uppercase tracking-widest ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-500 hover:bg-white hover:text-slate-700'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                    {isLoading && (
                        <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                            <Loader2 size={12} className="animate-spin" /> Fetching PDS...
                        </div>
                    )}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {activeTab === 'general' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Top Stats Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Item Number</p>
                                    <p className="text-sm font-bold text-slate-700 font-mono tracking-tighter truncate" title={employee.item_number}>{employee.item_number || 'N/A'}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Salary Grade / Step</p>
                                    <p className="text-sm font-bold text-slate-700">SG {employee.salary_grade || '??'} - Step {employee.step || '?'}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Classification</p>
                                    <p className="text-sm font-bold text-slate-700">{employee.classification}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Level / Station</p>
                                    <p className="text-sm font-bold text-slate-700">{employee.level} Division</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {/* Column 1: Personal & Eligibility */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} /> Basic Information
                                        </h3>
                                        <div className="space-y-4 px-1">
                                            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Birthdate & Age</p>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {formatDate(employee.birthdate)}
                                                    <span className="text-slate-400 ml-2">({age} y/o)</span>
                                                </p>
                                            </div>
                                            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Sex / Gender</p>
                                                <p className="text-sm font-semibold text-slate-700">{employee.sex || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">TIN Number</p>
                                                <p className="text-sm font-semibold text-slate-700 font-mono tracking-wider">{employee.tin || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                            <IdCard size={14} /> Primary Eligibility
                                        </h3>
                                        <div className="space-y-4 px-1">
                                            <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Main Record</p>
                                                <p className="text-sm font-semibold text-slate-700 mt-1">{employee.civil_service_eligibility || 'None Stated'}</p>
                                            </div>
                                            <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">License Expiration</p>
                                                <p className="text-sm font-semibold text-slate-700 mt-1">
                                                    {formatDate(employee.license_expiration_date)}
                                                </p>
                                            </div>
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
                                            <div className="p-5 bg-amber-50/30 rounded-3xl border border-amber-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Annual (Authorized)</p>
                                                <p className="text-xl font-black text-slate-800">{employee.annual_salary_authorized ? formatCurrency(employee.annual_salary_authorized) : '₱ 0.00'}</p>
                                            </div>
                                            <div className="p-5 bg-emerald-50/30 rounded-3xl border border-emerald-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Annual (Actual)</p>
                                                <p className="text-xl font-black text-emerald-700">{employee.annual_salary_actual ? formatCurrency(employee.annual_salary_actual) : '₱ 0.00'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin size={14} /> Location & PPA
                                        </h3>
                                        <div className="space-y-4 px-1">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Area Code</p>
                                                    <p className="text-sm font-semibold text-slate-700">{employee.area_code || 'N/A'}</p>
                                                </div>
                                                <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Area Type</p>
                                                    <p className="text-sm font-semibold text-slate-700">{employee.area_type || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
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
                                    <div className="space-y-10 px-1 relative pb-4">
                                        <div className="absolute left-2.5 top-2 bottom-8 w-0.5 bg-slate-100" />

                                        <div className="relative pl-10">
                                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Original Appointment</p>
                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDate(employee.original_appointment_date)}</p>
                                        </div>

                                        <div className="relative pl-10">
                                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Last Promotion</p>
                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDate(employee.last_promotion_date)}</p>
                                        </div>

                                        {(employee.retirement_date || employee.resigned_date) && (
                                            <div className="relative pl-10">
                                                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-red-500 ring-4 ring-red-50" />
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Separation Schedule</p>
                                                <p className="text-sm font-bold text-red-700 mt-0.5 capitalize">
                                                    {employee.retirement_date ? `Retired: ${formatDate(employee.retirement_date)}` : ''}
                                                    {employee.resigned_date ? `Resigned: ${formatDate(employee.resigned_date)}` : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pds' && (
                         <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {/* Detailed Personal info */}
                             <section className="space-y-6">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <Contact size={14} /> Personal Details & Identifiers
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Place of Birth</p>
                                        <p className="text-sm font-bold text-slate-700">{fullData?.pds?.place_of_birth || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Citizenship</p>
                                        <p className="text-sm font-bold text-slate-700">{fullData?.pds?.citizenship || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Civil Status</p>
                                        <p className="text-sm font-bold text-slate-700">{fullData?.pds?.civil_status || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Blood Type</p>
                                        <p className="text-sm font-bold text-slate-700 uppercase">{fullData?.pds?.blood_type || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Height (m) / Weight (kg)</p>
                                        <p className="text-sm font-bold text-slate-700">{fullData?.pds?.height_m || '?' } m / {fullData?.pds?.weight_kg || '?' } kg</p>
                                    </div>
                                    <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200 col-span-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">PhilSys ID</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono italic">{fullData?.pds?.philsys_id_no || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200 col-span-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">UMID No</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono">{fullData?.pds?.umid_no || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200 col-span-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Pag-IBIG ID</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono">{fullData?.pds?.pagibig_id_no || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">PhilHealth No</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono">{fullData?.pds?.philhealth_no || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Agency Employee No</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono">{fullData?.pds?.agency_employee_no || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-[10px] font-black text-blue-400 uppercase">Email Address</p>
                                        <p className="text-sm font-bold text-blue-700">{fullData?.pds?.email || 'N/A'}</p>
                                    </div>
                                </div>
                             </section>

                             {/* Addresses */}
                             <section className="space-y-6">
                                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={14} /> Full Address & Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-emerald-50/20 rounded-[2rem] border border-emerald-50">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-3 px-1">Residential Address</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed px-1">
                                            {fullData?.pds?.res_house_no ? `${fullData.pds.res_house_no}, ` : ''}
                                            {fullData?.pds?.res_street ? `${fullData.pds.res_street}, ` : ''}
                                            {fullData?.pds?.res_subdivision ? `${fullData.pds.res_subdivision}, ` : ''}
                                            {fullData?.pds?.res_barangay}, {fullData?.pds?.res_city}, {fullData?.pds?.res_province} {fullData?.pds?.res_zip_code}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 px-1">Permanent Address</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed px-1">
                                            {fullData?.pds?.perm_house_no ? `${fullData.pds.perm_house_no}, ` : ''}
                                            {fullData?.pds?.perm_street ? `${fullData.pds.perm_street}, ` : ''}
                                            {fullData?.pds?.perm_subdivision ? `${fullData.pds.perm_subdivision}, ` : ''}
                                            {fullData?.pds?.perm_barangay}, {fullData?.pds?.perm_city}, {fullData?.pds?.perm_province} {fullData?.pds?.perm_zip_code}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Telephone No.</p>
                                        <p className="text-sm font-bold text-slate-700">{fullData?.pds?.tel_no || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Mobile No.</p>
                                        <p className="text-sm font-bold text-slate-700 italic">{fullData?.pds?.mobile_no || 'N/A'}</p>
                                    </div>
                                </div>
                             </section>
                         </div>
                    )}

                    {activeTab === 'family' && (
                         <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {/* Parents */}
                                 <section className="space-y-6">
                                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} /> Parents Information
                                    </h3>
                                    <div className="p-6 bg-blue-50/20 rounded-[2rem] border border-blue-50 space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Father's Name</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {fullData?.family?.father_firstname} {fullData?.family?.father_middlename} {fullData?.family?.father_lastname} {fullData?.family?.father_extension}
                                                {(!fullData?.family?.father_firstname && !fullData?.family?.father_lastname) && 'N/A'}
                                            </p>
                                        </div>
                                        <hr className="border-blue-100/50" />
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Mother's Maiden Name</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {fullData?.family?.mother_firstname} {fullData?.family?.mother_middlename} {fullData?.family?.mother_maiden_lastname}
                                                {(!fullData?.family?.mother_firstname && !fullData?.family?.mother_maiden_lastname) && 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                 </section>

                                 {/* Spouse */}
                                 <section className="space-y-6">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} /> Spouse Information
                                    </h3>
                                    <div className="p-6 bg-indigo-50/20 rounded-[2rem] border border-indigo-50 space-y-4">
                                        {fullData?.family?.spouse_firstname ? (
                                            <>
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Name</p>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {fullData.family.spouse_firstname} {fullData.family.spouse_middlename} {fullData.family.spouse_lastname} {fullData.family.spouse_extension}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Occupation</p>
                                                        <p className="text-xs font-bold text-slate-700">{fullData.family.spouse_occupation || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Employer</p>
                                                        <p className="text-xs font-bold text-slate-700">{fullData.family.spouse_employer || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm font-bold text-slate-400 text-center py-6">No spouse information recorded.</p>
                                        )}
                                    </div>
                                 </section>
                             </div>

                             {/* Children */}
                             <section className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} /> Children Registry
                                </h3>
                                {fullData?.children?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {fullData.children.map((child: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{child.child_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Born: {formatDate(child.birth_date)}</p>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
                                        <Users size={40} className="mb-2 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No children recorded</p>
                                    </div>
                                )}
                             </section>
                         </div>
                    )}

                    {activeTab === 'education' && (
                         <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <section className="space-y-8 pb-10">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap size={14} /> Educational Background History
                                </h3>
                                {fullData?.education?.length > 0 ? (
                                    <div className="space-y-6 relative">
                                        <div className="absolute left-6 top-0 bottom-4 w-1 bg-slate-50" />
                                        {fullData.education.map((edu: any, idx: number) => (
                                            <div key={idx} className="relative pl-16">
                                                <div className="absolute left-3 top-0 h-6 w-6 rounded-full bg-white border-4 border-blue-500 shadow-sm z-10" />
                                                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter">{edu.level}</span>
                                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">{edu.attendance_from} - {edu.attendance_to}</span>
                                                            </div>
                                                            <h4 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase">{edu.school_name}</h4>
                                                            <p className="text-sm font-bold text-slate-500 mt-1 italic">{edu.degree_course || 'No degree specified'}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase">Year Graduated</p>
                                                            <p className="text-xl font-black text-slate-800">{edu.year_graduated || 'N/A'}</p>
                                                            {edu.honors_received && (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black border border-amber-100 mt-2">
                                                                    <Award size={10} /> {edu.honors_received}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                                        <GraduationCap size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest italic text-center">No educational background records found in PDS.</p>
                                    </div>
                                )}
                             </section>
                         </div>
                    )}

                    {activeTab === 'eligibility' && (
                         <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <section className="space-y-6">
                                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <Award size={14} /> Civil Service Eligibility Records
                                </h3>
                                {fullData?.eligibility?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {fullData.eligibility.map((elig: any, idx: number) => (
                                            <div key={idx} className="p-6 bg-emerald-50/20 rounded-[2rem] border border-emerald-50 space-y-4 hover:shadow-lg transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-base font-black text-slate-800 uppercase leading-tight mb-1">{elig.eligibility_name}</h4>
                                                        <p className="text-xs font-bold text-emerald-600">Rating: {elig.rating || 'N/A'}</p>
                                                    </div>
                                                    <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                                        <Award size={20} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100/50">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Exam Date</p>
                                                        <p className="text-xs font-bold text-slate-700">{formatDate(elig.exam_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">License No.</p>
                                                        <p className="text-xs font-bold text-slate-700 font-mono italic">{elig.license_number || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">License Valid Until</p>
                                                        <p className="text-xs font-bold text-slate-700">{formatDate(elig.license_valid_until)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                                        <Award size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest italic">No eligibility records recorded in PDS.</p>
                                    </div>
                                )}
                             </section>
                         </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Internal Employee Record System v2.0
                    </p>
                    <button
                        onClick={onClose}
                        className="px-10 py-2.5 rounded-2xl bg-white border border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                    >
                        Return to List
                    </button>
                </div>
            </div>
        </div>
    );
}