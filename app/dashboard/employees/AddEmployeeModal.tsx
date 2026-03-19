'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, User, Briefcase, Info, ShieldAlert, GraduationCap, Banknote, MapPin, CheckCircle } from 'lucide-react';
import { createEmployee, getVacantPositions, getUniqueDepartments } from './actions';

interface Position {
    item_number: string;
    position_title: string;
    classification: string;
    department: string | null;
    level: string | null;
    salary_grade: number | null;
    annual_salary_authorized: number | null;
    area_code: string | null;
    area_type: string | null;
    is_active: boolean;
}

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
        licenseExpirationDate: '',
        isDeceased: 'false',

        positionTitle: '',
        classification: 'Teaching',
        department: '',
        status: 'Permanent',
        level: 'Junior High School',

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
    const [vacantPositions, setVacantPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);

    const [isManualItemNumber, setIsManualItemNumber] = useState(false);
    const [isManualDept, setIsManualDept] = useState(false);
    const [isManualStatus, setIsManualStatus] = useState(false);
    const [isManualClass, setIsManualClass] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [posData, deptData] = await Promise.all([
                    getVacantPositions(),
                    getUniqueDepartments()
                ]);
                setVacantPositions(posData);
                setDepartments(deptData);
            } catch (err) {
                console.error('Error loading modal data:', err);
            }
        };
        if (isOpen) loadData();
    }, [isOpen]);

    const handlePositionSelect = (itemNumber: string) => {
        const pos = vacantPositions.find(p => p.item_number === itemNumber);
        if (!pos) {
            setFormData(prev => ({ ...prev, itemNumber: '', positionTitle: '', salaryGrade: '', salaryAuthorized: '' }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            itemNumber: pos.item_number,
            positionTitle: pos.position_title,
            classification: pos.classification,
            department: pos.department || prev.department,
            salaryGrade: pos.salary_grade?.toString() || prev.salaryGrade,
            salaryAuthorized: pos.annual_salary_authorized?.toString() || prev.salaryAuthorized,
            areaCode: pos.area_code || prev.areaCode,
            areaType: pos.area_type || prev.areaType,
        }));
    };

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
                <form onSubmit={handleSubmit} id="add-employee-form" className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">

                    {/* Section 1: Plantilla & Salary (Items 1-5) */}
                    <div className="space-y-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Banknote size={14} className="text-blue-600" />
                            Step 1: Plantilla & Salary
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-emerald-700 ml-1 flex items-center gap-1.5">
                                    <CheckCircle size={12} />
                                    (1) ITEM NUMBER
                                </label>
                                {isManualItemNumber ? (
                                    <div className="flex gap-2">
                                        <input
                                            name="itemNumber"
                                            value={formData.itemNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter Item Number"
                                            className="w-full bg-emerald-50/40 border border-emerald-100 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-emerald-600/10 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsManualItemNumber(false);
                                                setFormData(prev => ({ ...prev, itemNumber: '', positionTitle: '', salaryGrade: '' }));
                                            }}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Use Dropdown"
                                        >
                                            <Briefcase size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        value={formData.itemNumber}
                                        onChange={(e) => {
                                            if (e.target.value === 'ADD_NEW') {
                                                setIsManualItemNumber(true);
                                                setFormData(prev => ({ ...prev, itemNumber: '', positionTitle: '', salaryGrade: '' }));
                                            } else {
                                                handlePositionSelect(e.target.value);
                                            }
                                        }}
                                        className="w-full bg-emerald-50/40 border border-emerald-100 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-emerald-600/10 transition-all outline-none"
                                    >
                                        <option value="">— Select Vacant Position —</option>
                                        {vacantPositions.map(pos => (
                                            <option key={pos.item_number} value={pos.item_number}>
                                                {pos.item_number} ({pos.position_title})
                                            </option>
                                        ))}
                                        <option value="ADD_NEW" className="font-bold text-blue-600 italic">➕ Add New Item Number...</option>
                                    </select>
                                )}
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(2) POSITION TITLE & SG</label>
                                <div className="flex gap-2">
                                    <input name="positionTitle" value={formData.positionTitle} readOnly={!isManualItemNumber} onChange={handleInputChange} type="text" placeholder="Title" className={`flex-1 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none transition-all ${isManualItemNumber ? 'bg-white focus:ring-4 focus:ring-blue-600/5' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`} />
                                    <input name="salaryGrade" value={formData.salaryGrade} readOnly={!isManualItemNumber} onChange={handleInputChange} type="text" placeholder="SG" className={`w-20 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-center outline-none transition-all ${isManualItemNumber ? 'bg-white focus:ring-4 focus:ring-blue-600/5' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(3) ANNUAL SALARY — AUTHORIZED</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input name="salaryAuthorized" value={formData.salaryAuthorized} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(4) ANNUAL SALARY — ACTUAL</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input name="salaryActual" value={formData.salaryActual} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(5) STEP</label>
                                <input name="step" value={formData.step} onChange={handleInputChange} type="number" min="1" max="8" placeholder="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Area & Level (Items 6-9) */}
                    <div className="space-y-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin size={14} className="text-blue-600" />
                            Step 2: Assignment Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(6) AREA CODE</label>
                                <input name="areaCode" value={formData.areaCode} onChange={handleInputChange} type="text" placeholder="Code" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(7) AREA TYPE</label>
                                <input name="areaType" value={formData.areaType} onChange={handleInputChange} type="text" placeholder="Type" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(8) LEVEL</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                >
                                    <option value="Junior High School">Junior High School</option>
                                    <option value="Senior High School">Senior High School</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(9) P/P/A ATTRIBUTION</label>
                                <input name="ppaAttribution" value={formData.ppaAttribution} onChange={handleInputChange} type="text" placeholder="Program Attribution" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 3: Personnel Identity (Items 10-13) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-1 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Upload size={14} className="text-blue-600" />
                                Photo Upload
                            </p>
                            <div className="aspect-square w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-blue-400 transition-all cursor-pointer">
                                {photo ? (
                                    <div className="absolute inset-0">
                                        <img src={photoPreview || ''} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-600 transition-all">
                                        <Upload size={24} />
                                    </div>
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
                                <User size={14} className="text-blue-600" />
                                Step 3: Personnel Identity
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(10) NAME OF INCUMBENT</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} required type="text" placeholder="First Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                    <input name="middleName" value={formData.middleName} onChange={handleInputChange} type="text" placeholder="Middle Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} required type="text" placeholder="Last Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">(11) SEX</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">(12) DATE OF BIRTH</label>
                                    <input name="birthdate" value={formData.birthdate} onChange={handleInputChange} required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">(13) TIN</label>
                                    <input name="tin" value={formData.tin} onChange={handleInputChange} type="text" placeholder="000-000-000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-mono" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 4: Service Records (Items 14-17) */}
                    <div className="space-y-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <GraduationCap size={14} className="text-blue-600" />
                            Step 4: Government Service Records
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(14) DATE OF ORIGINAL APPOINTMENT</label>
                                <input name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(15) DATE OF LAST PROMOTION</label>
                                <input name="promotionDate" value={formData.promotionDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(16) STATUS</label>
                                {isManualStatus ? (
                                    <div className="flex gap-2">
                                        <input name="status" value={formData.status} onChange={handleInputChange} placeholder="Enter Status" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                        <button type="button" onClick={() => setIsManualStatus(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
                                    </div>
                                ) : (
                                    <select name="status" value={formData.status} onChange={(e) => e.target.value === 'ADD_NEW' ? setIsManualStatus(true) : handleInputChange(e)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none">
                                        <option value="Permanent">Permanent</option>
                                        <option value="Provisional">Provisional</option>
                                        <option value="Substitute">Substitute</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Contractual">Contractual</option>
                                        <option value="ADD_NEW" className="font-bold text-blue-600 italic">➕ Add New Status...</option>
                                    </select>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">(17) CIVIL SERVICE ELIGIBILITY</label>
                                <input name="eligibility" value={formData.eligibility} onChange={handleInputChange} type="text" placeholder="e.g. RA 1080" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 5: Secondary System Data (Mandatory non-sequential fields) */}
                    <div className="space-y-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldAlert size={14} className="text-blue-600" />
                            Step 5: System & Tracking Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">SYSTEM RECORD ID</label>
                                <input name="employeeId" value={formData.employeeId} onChange={handleInputChange} required type="text" placeholder="2024-XXXX" className="w-full bg-blue-50/50 border border-blue-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-600/10 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">CLASSIFICATION</label>
                                {isManualClass ? (
                                    <div className="flex gap-2">
                                        <input name="classification" value={formData.classification} onChange={handleInputChange} placeholder="Enter Class" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                        <button type="button" onClick={() => setIsManualClass(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
                                    </div>
                                ) : (
                                    <select name="classification" value={formData.classification} onChange={(e) => e.target.value === 'ADD_NEW' ? setIsManualClass(true) : handleInputChange(e)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 outline-none">
                                        <option value="Teaching">Teaching</option>
                                        <option value="Non-Teaching">Non-Teaching</option>
                                        <option value="ADD_NEW" className="font-bold text-blue-600 italic">➕ Add New Class...</option>
                                    </select>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">DEPARTMENT</label>
                                {isManualDept ? (
                                    <div className="flex gap-2">
                                        <input name="department" value={formData.department} onChange={handleInputChange} placeholder="Enter Dept" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" />
                                        <button type="button" onClick={() => setIsManualDept(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
                                    </div>
                                ) : (
                                    <select name="department" value={formData.department} onChange={(e) => e.target.value === 'ADD_NEW' ? setIsManualClass(true) : handleInputChange(e)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-blue-600/5 outline-none">
                                        <option value="">Select Department</option>
                                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                        <option value="ADD_NEW" className="font-bold text-blue-600 italic">➕ Add New Dept...</option>
                                    </select>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">LICENSE EXPIRATION</label>
                                <input name="licenseExpirationDate" value={formData.licenseExpirationDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/5 outline-none" />
                            </div>
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
