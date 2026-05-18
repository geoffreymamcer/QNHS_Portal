'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, Edit2, Trash2, RotateCcw, Save } from 'lucide-react';
import { QualificationStandard } from './utils/qsStorage';
import { 
    getCombinedStandardsDb, 
    upsertQualificationStandardDb, 
    deleteQualificationStandardDb 
} from './qs-actions';

interface QualificationStandardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

export default function QualificationStandardsModal({ isOpen, onClose, onSaved }: QualificationStandardsModalProps) {
    const [standards, setStandards] = useState<QualificationStandard[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        positionTitle: '',
        schoolLevel: 'Junior High School' as 'Junior High School' | 'Senior High School',
        education: '',
        training: '',
        experience: '',
        eligibility: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadStandards();
        }
    }, [isOpen]);

    const loadStandards = async () => {
        try {
            const data = await getCombinedStandardsDb();
            setStandards(data);
        } catch (e) {
            console.error('Failed to load standards:', e);
        }
    };

    const resetForm = () => {
        setFormData({
            positionTitle: '',
            schoolLevel: 'Junior High School',
            education: '',
            training: '',
            experience: '',
            eligibility: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEdit = (item: QualificationStandard) => {
        setFormData({
            positionTitle: item.positionTitle,
            schoolLevel: item.schoolLevel,
            education: item.education,
            training: item.training,
            experience: item.experience,
            eligibility: item.eligibility
        });
        setIsEditing(true);
        setEditingId(item.id);
    };

    const handleDelete = async (id: string) => {
        if (id.startsWith('default-')) {
            alert('Default standards cannot be deleted, but you can edit/override them!');
            return;
        }
        
        if (confirm('Are you sure you want to delete this custom qualification standard?')) {
            try {
                await deleteQualificationStandardDb(id);
                await loadStandards();
                resetForm();
                if (onSaved) onSaved();
            } catch (e: any) {
                alert(`Error deleting record: ${e.message}`);
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.positionTitle.trim()) return;

        setIsSaving(true);
        try {
            await upsertQualificationStandardDb({
                id: editingId || undefined,
                positionTitle: formData.positionTitle,
                schoolLevel: formData.schoolLevel,
                education: formData.education,
                training: formData.training,
                experience: formData.experience,
                eligibility: formData.eligibility
            });

            await loadStandards();
            resetForm();
            if (onSaved) onSaved();
        } catch (error: any) {
            console.error('Failed to save qualification standard:', error);
            alert(`Error saving qualification standard: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                            <Award size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-blue-950 tracking-tight">Manage Qualification Standards</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Entry Form */}
                    <form id="qs-form" onSubmit={handleSave} className={`${isEditing ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-100/50'} p-6 rounded-[2rem] border space-y-5 transition-colors duration-300`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-amber-700' : 'text-blue-900'}`}>
                                {isEditing ? 'Edit Qualification Standard' : 'Register New Standard'}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teaching Position</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.positionTitle}
                                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g. Teacher I"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">School Level</label>
                                <select
                                    value={formData.schoolLevel}
                                    onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                >
                                    <option value="Junior High School">Junior High School</option>
                                    <option value="Senior High School">Senior High School</option>
                                </select>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Education Requirements</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Education criteria..."
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Training Requirements</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.training}
                                    onChange={(e) => setFormData({ ...formData, training: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Training criteria..."
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience Requirements</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Experience criteria..."
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Eligibility Requirements</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.eligibility}
                                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Eligibility criteria..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                                    isEditing 
                                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                }`}
                            >
                                <Save size={16} /> {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Standard'}
                            </button>
                        </div>
                    </form>

                    {/* Registry List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Configured Qualification Standards</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{standards.length} Records</span>
                        </div>

                        <div className="space-y-3">
                            {standards.map((item) => {
                                const isCustom = !item.id.startsWith('default-');
                                return (
                                    <div 
                                        key={item.id} 
                                        className="p-5 border border-slate-150 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 rounded-3xl transition-all space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <h5 className="font-extrabold text-blue-950 text-sm tracking-tight">{item.positionTitle}</h5>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                                    item.schoolLevel.includes('Senior') 
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                }`}>
                                                    {item.schoolLevel === 'Senior High School' ? 'SHS' : 'JHS'}
                                                </span>
                                                {!isCustom && (
                                                    <span className="text-[8px] bg-slate-100 text-slate-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Default</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Standard"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {isCustom && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Custom Standard"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Education:</span>
                                                <p className="leading-relaxed text-slate-700">{item.education}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Training:</span>
                                                <p className="leading-relaxed text-slate-700">{item.training}</p>
                                            </div>
                                            <div className="space-y-0.5 md:col-span-2 mt-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience:</span>
                                                <p className="leading-relaxed text-slate-700">{item.experience}</p>
                                            </div>
                                            <div className="space-y-0.5 md:col-span-2 mt-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Eligibility:</span>
                                                <p className="leading-relaxed text-slate-700">{item.eligibility}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
