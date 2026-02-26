'use client';

import React, { useState } from 'react';
import { X, Upload, User, IdCard, Briefcase, Info, ShieldAlert } from 'lucide-react';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (data: any) => void;
}

import { createEmployee } from './actions';

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeNum: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        birthdate: '',
        civilStatus: '',
        pagibig: '',
        philhealth: '',
        gsis: '',
        accNum: '',
        tin: '',
        position: '',
        classification: 'Teaching',
        department: '',
        contactNo: '',
        email: '',
        hiredDate: '',
        datePromoted: '',
        lastAssign: '',
        retirementDate: '',
        resignedDate: '',
        transferredDate: '',
        isDeceased: 'false',
        fileUrl: '',
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
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-950">Add New Employee</h2>
                        <p className="text-sm text-slate-500 mt-1">Fill in the details to create a new personnel record.</p>
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    {/* Section 1: Personal Info & Photo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Photo Upload Side */}
                        <div className="md:col-span-1 space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-blue-600" />
                                Personnel Photo
                            </p>
                            <div className="aspect-square w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                                {photo ? (
                                    <div className="absolute inset-0">
                                        <img
                                            src={photoPreview || ''}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <p className="text-white text-xs font-bold">Change Photo</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 text-center px-4 leading-tight">
                                            JPG, PNG up to 5MB
                                        </p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setPhoto(file);
                                        if (file) {
                                            setPhotoPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Basic Info Fields */}
                        <div className="md:col-span-3 space-y-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-blue-600" />
                                Personal Details
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">First Name</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} required type="text" placeholder="e.g. Juan" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Last Name</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} required type="text" placeholder="e.g. De la Cruz" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Middle Name</label>
                                    <input name="middleName" value={formData.middleName} onChange={handleInputChange} type="text" placeholder="e.g. Santos" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Sex</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none">
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Birthdate</label>
                                    <input name="birthdate" value={formData.birthdate} onChange={handleInputChange} required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Civil Status</label>
                                    <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none">
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Widowed">Widowed</option>
                                        <option value="Separated">Separated</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Date Hired</label>
                                    <input name="hiredDate" value={formData.hiredDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Identification Numbers */}
                    <div className="space-y-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <IdCard size={14} className="text-blue-600" />
                            Identification & Government Numbers
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1 text-blue-800">System ID</label>
                                <input name="employeeId" value={formData.employeeId} onChange={handleInputChange} required type="text" placeholder="2024-XXXX" className="w-full bg-blue-50/50 border border-blue-100 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Employee No.</label>
                                <input name="employeeNum" value={formData.employeeNum} onChange={handleInputChange} type="text" placeholder="Emp #" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">GSIS Number</label>
                                <input name="gsis" value={formData.gsis} onChange={handleInputChange} type="text" placeholder="0000-0000000-0" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Pag-IBIG MID</label>
                                <input name="pagibig" value={formData.pagibig} onChange={handleInputChange} type="text" placeholder="0000-0000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">PhilHealth No.</label>
                                <input name="philhealth" value={formData.philhealth} onChange={handleInputChange} type="text" placeholder="00-000000000-0" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">TIN Number</label>
                                <input name="tin" value={formData.tin} onChange={handleInputChange} type="text" placeholder="000-000-000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Account No.</label>
                                <input name="accNum" value={formData.accNum} onChange={handleInputChange} type="text" placeholder="Bank account" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 3: Employment Details */}
                    <div className="space-y-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase size={14} className="text-blue-600" />
                            Employment Information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Position</label>
                                <input name="position" value={formData.position} onChange={handleInputChange} required type="text" placeholder="e.g. Teacher III" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Classification</label>
                                <select name="classification" value={formData.classification} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none">
                                    <option value="Teaching">Teaching</option>
                                    <option value="Non-Teaching">Non-Teaching</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Department</label>
                                <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none">
                                    <option value="">Select Department</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="English">English</option>
                                    <option value="Filipino">Filipino</option>
                                    <option value="MAPEH">MAPEH</option>
                                    <option value="AP">AP</option>
                                    <option value="Administration">Administration</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Date Promoted</label>
                                <input name="datePromoted" value={formData.datePromoted} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1 text-amber-700">Last Assignment / Station</label>
                                <input name="lastAssign" value={formData.lastAssign} onChange={handleInputChange} type="text" placeholder="Previous school/office" className="w-full bg-amber-50/30 border border-amber-100 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-amber-600/20 focus:bg-white transition-all outline-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 ml-1 flex items-center gap-1">
                                Service File URL <span className="text-[10px] text-slate-400 font-normal">(Google Drive/Dropbox)</span>
                            </label>
                            <input name="fileUrl" value={formData.fileUrl} onChange={handleInputChange} type="url" placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 4: Status & Separation */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert size={14} className="text-red-600" />
                                Status & Separation Tracking
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isDeceased"
                                    checked={formData.isDeceased === 'true'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isDeceased: e.target.checked ? 'true' : 'false' }))}
                                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-red-600 transition-colors">Is Deceased</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Retirement Date</label>
                                <input name="retirementDate" value={formData.retirementDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1 text-red-700">Resignation Date</label>
                                <input name="resignedDate" value={formData.resignedDate} onChange={handleInputChange} type="date" className="w-full bg-red-50/30 border border-red-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-red-600/20 transition-all outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1 text-indigo-700">Transfer Date</label>
                                <input name="transferredDate" value={formData.transferredDate} onChange={handleInputChange} type="date" className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                </form>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-12 py-2.5 rounded-xl font-extrabold text-white bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : 'Create Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}
