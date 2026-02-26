'use client';

import React, { useState } from 'react';
import { X, Upload, User, IdCard, Briefcase, Info, ShieldAlert, GraduationCap, Banknote, MapPin } from 'lucide-react';
import { createEmployee } from './actions';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (data: any) => void;
}

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        birthdate: '',
        tin: '',
        eligibility: '',
        isDeceased: 'false',

        positionTitle: '',
        classification: 'Teaching',
        department: '',
        status: 'Permanent',
        level: 'Secondary',

        itemNumber: '',
        salaryGrade: '',
        step: '1',
        salaryAuthorized: '',
        salaryActual: '',

        areaCode: '',
        areaType: '',
        ppaAttribution: '',

        appointmentDate: '',
        promotionDate: '',
        retirementDate: '',
        resignedDate: '',
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            if (photo) data.append('photo', photo);

            await createEmployee(data);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create employee record');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-950">Add New Personnel</h2>
                        <p className="text-sm text-slate-500 mt-1">Complete the government plantilla requirements for new records.</p>
                        {error && (
                            <p className="text-xs font-bold text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                ⚠️ {error}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">

                    {/* Section 1: Identity & Photo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-1 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User size={14} className="text-blue-600" />
                                Photo Upload
                            </p>
                            <div className="aspect-square w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                                {photo ? (
                                    <div className="absolute inset-0">
                                        <img src={photoPreview || ''} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <p className="text-white text-xs font-bold">Change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-600 transition-all">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 text-center px-4">JPG/PNG MAX 5MB</p>
                                    </>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setPhoto(file);
                                    if (file) setPhotoPreview(URL.createObjectURL(file));
                                }} />
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Info size={14} className="text-blue-600" />
                                Basic Identity
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">First Name</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} required type="text" placeholder="Juan" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Middle Name</label>
                                    <input name="middleName" value={formData.middleName} onChange={handleInputChange} type="text" placeholder="Santos" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Last Name</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} required type="text" placeholder="De la Cruz" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Birthdate</label>
                                    <input name="birthdate" value={formData.birthdate} onChange={handleInputChange} required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Sex</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 ml-1 text-blue-800">System Record ID</label>
                                    <input name="employeeId" value={formData.employeeId} onChange={handleInputChange} required type="text" placeholder="2024-XXXX" className="w-full bg-blue-50/50 border border-blue-100 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all outline-none font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Position & Assignment */}
                    <div className="space-y-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Briefcase size={14} className="text-blue-600" />
                            Assignment & Position details
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Position Title</label>
                                <input name="positionTitle" value={formData.positionTitle} onChange={handleInputChange} required type="text" placeholder="e.g. Teacher III" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Classification</label>
                                <select name="classification" value={formData.classification} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                    <option value="Teaching">Teaching</option>
                                    <option value="Non-Teaching">Non-Teaching</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Department</label>
                                <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                    <option value="">Select Department</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="English">English</option>
                                    <option value="Filipino">Filipino</option>
                                    <option value="MAPEH">MAPEH</option>
                                    <option value="AP">AP</option>
                                    <option value="TLE">TLE</option>
                                    <option value="ESP">ESP</option>
                                    <option value="Administration">Administration</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Status of Appointment</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                    <option value="Permanent">Permanent</option>
                                    <option value="Provisional">Provisional</option>
                                    <option value="Substitute">Substitute</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Contractual">Contractual</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Level</label>
                                <select name="level" value={formData.level} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                    <option value="Secondary">Secondary</option>
                                    <option value="Elementary">Elementary</option>
                                    <option value="Senior High">Senior High</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Civil Service Eligibility</label>
                                <input name="eligibility" value={formData.eligibility} onChange={handleInputChange} type="text" placeholder="e.g. RA 1080 (LET)" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 3: Salary & Itemization */}
                    <div className="space-y-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Banknote size={14} className="text-blue-600" />
                            Salary & Itemization (Plantilla)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600 ml-1 text-emerald-700">Item Number (Fixed)</label>
                                <input name="itemNumber" value={formData.itemNumber} onChange={handleInputChange} type="text" placeholder="OSEC-DECSB-..." className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-emerald-600/20 focus:bg-white transition-all outline-none font-mono" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Salary Grade</label>
                                <input name="salaryGrade" value={formData.salaryGrade} onChange={handleInputChange} type="number" placeholder="11" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Step</label>
                                <select name="step" value={formData.step} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Annual Salary (Authorized)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input name="salaryAuthorized" value={formData.salaryAuthorized} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Annual Salary (Actual)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input name="salaryActual" value={formData.salaryActual} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 4: Area & Service Tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin size={14} className="text-blue-600" />
                                Area & Attribution
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Area Code</label>
                                    <input name="areaCode" value={formData.areaCode} onChange={handleInputChange} type="text" placeholder="Code" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Area Type</label>
                                    <input name="areaType" value={formData.areaType} onChange={handleInputChange} type="text" placeholder="Type" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">P/P/A Attribution</label>
                                <input name="ppaAttribution" value={formData.ppaAttribution} onChange={handleInputChange} type="text" placeholder="Program/Project/Activity" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">TIN Number</label>
                                <input name="tin" value={formData.tin} onChange={handleInputChange} type="text" placeholder="000-000-000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-mono" />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <GraduationCap size={14} className="text-blue-600" />
                                Service Chronology
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Original Appointment</label>
                                    <input name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Last Promotion</label>
                                    <input name="promotionDate" value={formData.promotionDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Retirement Date</label>
                                    <input name="retirementDate" value={formData.retirementDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-red-700 ml-1">Resignation Date</label>
                                    <input name="resignedDate" value={formData.resignedDate} onChange={handleInputChange} type="date" className="w-full bg-red-50/30 border border-red-100 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-red-600/10 transition-all outline-none" />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                                <input
                                    type="checkbox"
                                    checked={formData.isDeceased === 'true'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isDeceased: e.target.checked ? 'true' : 'false' }))}
                                    className="w-5 h-5 rounded-lg text-red-600 focus:ring-red-500 border-slate-300"
                                />
                                <span className="text-sm font-bold text-red-900">Mark Personnel as Deceased</span>
                            </label>
                        </div>
                    </div>

                </form>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isLoading} className="px-16 py-3 rounded-xl font-black text-white bg-blue-700 hover:bg-blue-800 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 min-w-[200px]">
                        {isLoading ? <div className="flex items-center gap-3"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</div> : 'Finalize Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}
