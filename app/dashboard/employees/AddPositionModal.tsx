'use client';

import React, { useState } from 'react';
import { X, Briefcase, Hash, GraduationCap, Banknote, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { createPosition } from './actions';

interface AddPositionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddPositionModal({ isOpen, onClose }: AddPositionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        itemNumber: '',
        positionTitle: '',
        classification: 'Teaching',
        department: '',
        level: 'Junior High School',
        salaryGrade: '',
        salaryAuthorized: '',
        areaCode: '04', // Default for Quezon
        areaType: 'R'   // Default for Region
    });

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

            await createPosition(data);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                // Reset form
                setFormData({
                    itemNumber: '',
                    positionTitle: '',
                    classification: 'Teaching',
                    department: '',
                    level: 'Junior High School',
                    salaryGrade: '',
                    salaryAuthorized: '',
                    areaCode: '04',
                    areaType: 'R'
                });
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create position. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Add New Plantilla Item</h2>
                            <p className="text-blue-100 text-xs mt-0.5">Register a new position in the school establishment.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {error && (
                        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                            <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                <CheckCircle size={48} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Position Created!</h3>
                            <p className="text-slate-500 mt-2">The new plantilla item has been successfully added.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Item Identification Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Hash size={14} className="text-blue-600" />
                                        Item Number
                                    </label>
                                    <input
                                        required
                                        name="itemNumber"
                                        value={formData.itemNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. OSEC-DECSB-TCH1-001"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Briefcase size={14} className="text-blue-600" />
                                        Position Title
                                    </label>
                                    <input
                                        required
                                        name="positionTitle"
                                        value={formData.positionTitle}
                                        onChange={handleChange}
                                        placeholder="e.g. Teacher I"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Classification Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <GraduationCap size={14} className="text-blue-600" />
                                        Classification
                                    </label>
                                    <select
                                        name="classification"
                                        value={formData.classification}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="Teaching">Teaching</option>
                                        <option value="Non-Teaching">Non-Teaching</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Department</label>
                                    <input
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="e.g. Mathematics"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Level</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="Junior High School">Junior High School</option>
                                        <option value="Senior High School">Senior High School</option>
                                    </select>
                                </div>
                            </div>

                            {/* Salary Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Banknote size={14} className="text-blue-600" />
                                        Salary Grade
                                    </label>
                                    <input
                                        type="number"
                                        name="salaryGrade"
                                        value={formData.salaryGrade}
                                        onChange={handleChange}
                                        placeholder="e.g. 11"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Annual Salary (Authorized)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="salaryAuthorized"
                                        value={formData.salaryAuthorized}
                                        onChange={handleChange}
                                        placeholder="e.g. 324000"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Area Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <MapPin size={14} className="text-blue-600" />
                                        Area Code
                                    </label>
                                    <input
                                        name="areaCode"
                                        value={formData.areaCode}
                                        onChange={handleChange}
                                        placeholder="04"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Area Type</label>
                                    <input
                                        name="areaType"
                                        value={formData.areaType}
                                        onChange={handleChange}
                                        placeholder="R"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] bg-blue-700 hover:bg-blue-800 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Create Position'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
