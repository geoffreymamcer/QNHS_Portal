'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Loader2, DollarSign, Edit2, RotateCcw } from 'lucide-react';
import { getSalaryGrades, upsertSalaryGrade, deleteSalaryGrade, updateSalaryGrade } from './salary-actions';

interface SalaryGrade {
    grade: number;
    position_title: string;
    salary: number;
}

interface AddSalaryGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddSalaryGradeModal({ isOpen, onClose }: AddSalaryGradeModalProps) {
    const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingOriginal, setEditingOriginal] = useState<{ grade: number, title: string } | null>(null);
    const [formData, setFormData] = useState<SalaryGrade>({
        grade: 1,
        position_title: '',
        salary: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetchGrades();
        }
    }, [isOpen]);

    const fetchGrades = async () => {
        setIsLoading(true);
        try {
            const data = await getSalaryGrades();
            setSalaryGrades(data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.position_title || formData.salary <= 0) return;

        setIsSaving(true);
        try {
            if (isEditing && editingOriginal) {
                await updateSalaryGrade(
                    editingOriginal.grade,
                    editingOriginal.title,
                    formData.grade,
                    formData.position_title,
                    formData.salary
                );
            } else {
                await upsertSalaryGrade(formData.grade, formData.position_title, formData.salary);
            }
            resetForm();
            await fetchGrades();
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save salary grade.');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ grade: 1, position_title: '', salary: 0 });
        setIsEditing(false);
        setEditingOriginal(null);
    };

    const handleEdit = (item: SalaryGrade) => {
        setFormData({ ...item });
        setEditingOriginal({ grade: item.grade, title: item.position_title });
        setIsEditing(true);
        const form = document.getElementById('salary-form');
        form?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (grade: number, title: string) => {
        if (!confirm(`Delete salary record for ${title} (SG ${grade})?`)) return;
        
        try {
            await deleteSalaryGrade(grade, title);
            await fetchGrades();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-blue-950 tracking-tight">Manage Salary Grades</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pricing & Position Tiers</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Entry Form */}
                    <form id="salary-form" onSubmit={handleSave} className={`${isEditing ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-100/50'} p-6 rounded-[2rem] border space-y-4 transition-colors duration-300`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-amber-700' : 'text-blue-900'}`}>
                                {isEditing ? 'Edit Existing Record' : 'Register New Allocation'}
                            </h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700"
                                >
                                    <RotateCcw size={12} /> Cancel Edit
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Salary Grade</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="33"
                                    required
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="SG"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Position Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.position_title}
                                    onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="e.g. Teacher I"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monthly Salary (PHP)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.salary || ''}
                                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`w-full flex items-center justify-center gap-2 py-3 ${isEditing ? 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-700' : 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-700'} text-white rounded-2xl font-bold text-sm shadow-lg transition-all disabled:opacity-50`}
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Save size={18} /> : <Plus size={18} />}
                                    {isEditing ? 'Update Record' : 'Add Grade'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* List */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Registry of Salary Grades</h3>
                        
                        {isLoading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="mx-auto text-blue-600 animate-spin" size={32} />
                            </div>
                        ) : salaryGrades.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                <DollarSign className="mx-auto text-slate-200" size={48} />
                                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">No records found</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {salaryGrades.map((item, idx) => (
                                    <div key={idx} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 font-black text-xs">
                                                {item.grade}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{item.position_title}</p>
                                                <p className="text-xs font-bold text-blue-600">₱{item.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.grade, item.position_title)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Close Registry
                    </button>
                </div>
            </div>
        </div>
    );
}
