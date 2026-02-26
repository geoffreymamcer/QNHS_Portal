'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, User, IdCard, Briefcase, Info, Save, ShieldAlert, GraduationCap, Banknote, MapPin } from 'lucide-react';
import { updateEmployee } from './actions';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: any) => void;
    employee: any;
}

export default function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps) {
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

    useEffect(() => {
        if (employee) {
            setFormData({
                employeeId: employee.employee_id || '',
                firstName: employee.first_name || '',
                middleName: employee.mid_name || '',
                lastName: employee.last_name || '',
                gender: employee.sex || '',
                birthdate: employee.birthdate || '',
                tin: employee.tin || '',
                eligibility: employee.civil_service_eligibility || '',
                isDeceased: employee.is_deceased ? 'true' : 'false',

                positionTitle: employee.position_title || '',
                classification: employee.classification || 'Teaching',
                department: employee.department || '',
                status: employee.status || 'Permanent',
                level: employee.level || 'Secondary',

                itemNumber: employee.item_number || '',
                salaryGrade: employee.salary_grade?.toString() || '',
                step: employee.step?.toString() || '1',
                salaryAuthorized: employee.annual_salary_authorized?.toString() || '',
                salaryActual: employee.annual_salary_actual?.toString() || '',

                areaCode: employee.area_code || '',
                areaType: employee.area_type || '',
                ppaAttribution: employee.ppa_attribution || '',

                appointmentDate: employee.original_appointment_date || '',
                promotionDate: employee.last_promotion_date || '',
                retirementDate: employee.retirement_date || '',
                resignedDate: employee.resigned_date || '',
            });
            setPhotoPreview(employee.photo_url || null);
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

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
            if (employee.photo_url) data.append('currentPhotoUrl', employee.photo_url);

            await updateEmployee(employee.id, data);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update employee record');
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
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-blue-950">Edit Personnel Record</h2>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">
                                ID: {employee.employee_id}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Update government plantilla requirements and service records.</p>
                        {error && (
                            <p className="text-xs font-bold text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100 italic">
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
                                Photo & Avatar
                            </p>
                            <div className="aspect-square w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-blue-400 transition-all cursor-pointer">
                                <div className="absolute inset-0">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-4xl">
                                            {(formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                </div>
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
                                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Middle Name</label>
                                    <input name="middleName" value={formData.middleName} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Last Name</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
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
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 ml-1 text-blue-800">System Record ID</label>
                                    <input name="employeeId" value={formData.employeeId} onChange={handleInputChange} required type="text" className="w-full bg-blue-50/50 border border-blue-100 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all outline-none font-bold" />
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
                                <input name="positionTitle" value={formData.positionTitle} onChange={handleInputChange} required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none" />
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
                                <input name="eligibility" value={formData.eligibility} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
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
                                <input name="itemNumber" value={formData.itemNumber} onChange={handleInputChange} type="text" className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-emerald-600/20 focus:bg-white transition-all outline-none font-mono" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Salary Grade</label>
                                <input name="salaryGrade" value={formData.salaryGrade} onChange={handleInputChange} type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
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
                                    <input name="areaCode" value={formData.areaCode} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Area Type</label>
                                    <input name="areaType" value={formData.areaType} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">P/P/A Attribution</label>
                                <input name="ppaAttribution" value={formData.ppaAttribution} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">TIN Number</label>
                                <input name="tin" value={formData.tin} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-mono" />
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
                    <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95">Discard Changes</button>
                    <button type="submit" onClick={handleSubmit} disabled={isLoading} className="flex items-center justify-center gap-3 px-16 py-3 rounded-xl font-black text-white bg-blue-700 hover:bg-blue-800 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 min-w-[220px]">
                        {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
