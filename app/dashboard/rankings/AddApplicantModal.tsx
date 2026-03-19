'use client';

import React, { useState } from 'react';
import { X, User, Heart, GraduationCap, Plus, Trash2, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { createApplicant } from './actions';

interface AddApplicantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FormSection = 'profile' | 'background' | 'professional' | 'evaluation';

export default function AddApplicantModal({ isOpen, onClose }: AddApplicantModalProps) {
    const [activeSection, setActiveSection] = useState<FormSection>('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        hiringDate: new Date().toISOString().split('T')[0],
        profile: {
            iesNo: '',
            applicantCode: '',
            appliedPosition: '',
            surname: '', firstname: '', middlename: '', extension: '',
            age: '', sex: '', civilStatus: '',
            religion: '', disability: '', ethnicGroup: ''
        },
        background: {
            email: '',
            contactNo: '',
            address: '',
            education: [] as { level: string, school: string, degree: string, yearGraduated: string }[]
        },
        professional: {
            trainings: [] as { title: string, hours: string }[],
            experiences: [] as { details: string, from: string, to: string }[],
            eligibility: ''
        },
        evaluation: {
            status: '', // Qualified / Disqualified
            performance: '', // Met / Not Met
        }
    });

    if (!isOpen) return null;

    // Handlers
    const addTraining = () => {
        setFormData(prev => ({
            ...prev,
            professional: { ...prev.professional, trainings: [...prev.professional.trainings, { title: '', hours: '' }] }
        }));
    };

    const removeTraining = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            professional: { ...prev.professional, trainings: prev.professional.trainings.filter((_, i) => i !== idx) }
        }));
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            professional: { ...prev.professional, experiences: [...prev.professional.experiences, { details: '', from: '', to: '' }] }
        }));
    };

    const removeExperience = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            professional: { ...prev.professional, experiences: prev.professional.experiences.filter((_, i) => i !== idx) }
        }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            background: { ...prev.background, education: [...prev.background.education, { level: '', school: '', degree: '', yearGraduated: '' }] }
        }));
    };

    const removeEducation = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            background: { ...prev.background, education: prev.background.education.filter((_, i) => i !== idx) }
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createApplicant(formData);
            alert('Initial Evaluation Result successfully registered!');
            onClose();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Plus size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register Evaluation</h2>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Initial Assessment Result</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Stepper Navigation */}
                <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'profile', label: '1. Applicant Profile', icon: <User size={18} /> },
                        { id: 'background', label: '2. Contact & Addresses', icon: <Heart size={18} /> },
                        { id: 'professional', label: '3. Professional Background', icon: <GraduationCap size={18} /> },
                        { id: 'evaluation', label: '4. Evaluation Result', icon: <Save size={18} /> }
                    ].map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => setActiveSection(step.id as FormSection)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all whitespace-nowrap font-bold text-sm ${activeSection === step.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-white hover:shadow-sm'
                                    }`}
                            >
                                {step.icon}
                                {step.label}
                            </button>
                            {idx < 3 && <div className="h-px w-8 bg-slate-200" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    {/* Section 1: Profile */}
                    {activeSection === 'profile' && (
                        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-blue-600 rounded-full" />
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Reference & Context</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <Input label="Hiring Date (Batch)" type="date" value={formData.hiringDate} onChange={(v: string) => setFormData(p => ({ ...p, hiringDate: v }))} />
                                    <Input label="IES Number" placeholder="IES-2024-XXX" value={formData.profile.iesNo} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, iesNo: v } }))} />
                                    <Input label="Applicant Code" placeholder="APP-XXXX" value={formData.profile.applicantCode} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, applicantCode: v } }))} />
                                    <Input label="Position Applied For" placeholder="e.g. Teacher I" value={formData.profile.appliedPosition} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, appliedPosition: v } }))} />
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-blue-600 rounded-full" />
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Identity Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <Input label="Surname" value={formData.profile.surname} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, surname: v } }))} />
                                    <Input label="Firstname" value={formData.profile.firstname} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, firstname: v } }))} />
                                    <Input label="Middlename" value={formData.profile.middlename} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, middlename: v } }))} />
                                    <Input label="Extension" placeholder="e.g. Jr." value={formData.profile.extension} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, extension: v } }))} />

                                    <Input label="Age" type="number" value={formData.profile.age} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, age: v } }))} />
                                    <Select label="Sex" options={['Male', 'Female']} value={formData.profile.sex} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, sex: v } }))} />
                                    <Select label="Civil Status" options={['Single', 'Married', 'Widowed', 'Separated']} value={formData.profile.civilStatus} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, civilStatus: v } }))} />
                                    <Input label="Religion" value={formData.profile.religion} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, religion: v } }))} />
                                    <Input label="Disability" placeholder="None" value={formData.profile.disability} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, disability: v } }))} />
                                    <Input label="Ethnic Group" value={formData.profile.ethnicGroup} onChange={(v: string) => setFormData(p => ({ ...p, profile: { ...p.profile, ethnicGroup: v } }))} />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Section 2: Contact & Address */}
                    {activeSection === 'background' && (
                        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-blue-600 rounded-full" />
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Contact Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Email Address" type="email" value={formData.background.email} onChange={(v: string) => setFormData(p => ({ ...p, background: { ...p.background, email: v } }))} />
                                    <Input label="Contact No." value={formData.background.contactNo} onChange={(v: string) => setFormData(p => ({ ...p, background: { ...p.background, contactNo: v } }))} />
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-blue-600 rounded-full" />
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Address</h3>
                                </div>
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Residential Address</label>
                                    <textarea
                                        className="w-full h-24 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                        placeholder="Block/Lot, Street, Brgy, City, Province, Zip Code"
                                        value={formData.background.address}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, background: { ...p.background, address: e.target.value } }))}
                                    />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Section 3: Professional Background */}
                    {activeSection === 'professional' && (
                        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                            {/* Education */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-1 bg-blue-600 rounded-full" />
                                        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Education</h3>
                                    </div>
                                    <button onClick={addEducation} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">
                                        <Plus size={14} /> Add Education
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.background.education.map((edu, idx) => (
                                        <div key={idx} className="p-6 border border-slate-100 rounded-3xl bg-slate-50 group relative animate-in slide-in-from-bottom-2">
                                            <button onClick={() => removeEducation(idx)} className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all border border-red-50">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Select label="Level" options={['Elementary', 'Secondary', 'College', 'Graduate']} value={edu.level} onChange={(v: string) => {
                                                    const newE = [...formData.background.education]; newE[idx].level = v; setFormData(p => ({ ...p, background: { ...p.background, education: newE } }));
                                                }} />
                                                <Input label="School Name" value={edu.school} onChange={(v: string) => {
                                                    const newE = [...formData.background.education]; newE[idx].school = v; setFormData(p => ({ ...p, background: { ...p.background, education: newE } }));
                                                }} />
                                                <Input label="Degree / Course" value={edu.degree} onChange={(v: string) => {
                                                    const newE = [...formData.background.education]; newE[idx].degree = v; setFormData(p => ({ ...p, background: { ...p.background, education: newE } }));
                                                }} />
                                                <Input label="Year Graduated" value={edu.yearGraduated} onChange={(v: string) => {
                                                    const newE = [...formData.background.education]; newE[idx].yearGraduated = v; setFormData(p => ({ ...p, background: { ...p.background, education: newE } }));
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Training */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-1 bg-amber-500 rounded-full" />
                                        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Training <span className="text-[10px] text-slate-400 normal-case ml-2">(Record trainings with 8+ hours)</span></h3>
                                    </div>
                                    <button onClick={addTraining} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                                        <Plus size={14} /> Add Training
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.professional.trainings.map((t, idx) => (
                                        <div key={idx} className="flex gap-4 items-end group">
                                            <div className="flex-1">
                                                <Input label="Training Title" value={t.title} onChange={(v: string) => {
                                                    const newT = [...formData.professional.trainings]; newT[idx].title = v; setFormData(p => ({ ...p, professional: { ...p.professional, trainings: newT } }));
                                                }} />
                                            </div>
                                            <div className="w-32">
                                                <Input label="Total Hours" type="number" value={t.hours} onChange={(v: string) => {
                                                    const newT = [...formData.professional.trainings]; newT[idx].hours = v; setFormData(p => ({ ...p, professional: { ...p.professional, trainings: newT } }));
                                                }} />
                                            </div>
                                            <button onClick={() => removeTraining(idx)} className="pb-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Experience */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-1 bg-indigo-500 rounded-full" />
                                        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Work Experience</h3>
                                    </div>
                                    <button onClick={addExperience} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                                        <Plus size={14} /> Add Experience
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {formData.professional.experiences.map((exp, idx) => (
                                        <div key={idx} className="p-6 border border-slate-100 rounded-3xl bg-slate-50 group relative">
                                            <button onClick={() => removeExperience(idx)} className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all border border-red-50">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-2">
                                                    <Input label="Work Details (Role/Company)" value={exp.details} onChange={(v: string) => {
                                                        const newE = [...formData.professional.experiences]; newE[idx].details = v; setFormData(p => ({ ...p, professional: { ...p.professional, experiences: newE } }));
                                                    }} />
                                                </div>
                                                <Input label="From Date" type="date" value={exp.from} onChange={(v: string) => {
                                                    const newE = [...formData.professional.experiences]; newE[idx].from = v; setFormData(p => ({ ...p, professional: { ...p.professional, experiences: newE } }));
                                                }} />
                                                <Input label="To Date" type="date" value={exp.to} onChange={(v: string) => {
                                                    const newE = [...formData.professional.experiences]; newE[idx].to = v; setFormData(p => ({ ...p, professional: { ...p.professional, experiences: newE } }));
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Eligibility */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Eligibility</h3>
                                </div>
                                <Input label="Eligibility Records" placeholder="e.g. CS Prof, Licensed Teacher, Career Service Eligibility" value={formData.professional.eligibility} onChange={(v: string) => setFormData(p => ({ ...p, professional: { ...p.professional, eligibility: v } }))} />
                            </section>
                        </div>
                    )}

                    {/* Section 4: Evaluation Remarks */}
                    {activeSection === 'evaluation' && (
                        <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 space-y-10 shadow-inner">
                                <div className="text-center">
                                    <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm mx-auto mb-4 border border-blue-50">
                                        <Save size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Final Evaluation</h3>
                                    <p className="text-slate-400 text-sm font-bold mt-2 italic">Determine the initial screening result</p>
                                </div>

                                <div className="space-y-6">
                                    <Select
                                        label="Qualification Status"
                                        options={['Qualified', 'Disqualified']}
                                        value={formData.evaluation.status}
                                        onChange={(v: string) => setFormData(p => ({ ...p, evaluation: { ...p.evaluation, status: v } }))}
                                    />
                                    <Select
                                        label="Performance Evaluation"
                                        options={['Met', 'Not Met']}
                                        value={formData.evaluation.performance}
                                        onChange={(v: string) => setFormData(p => ({ ...p, evaluation: { ...p.evaluation, performance: v } }))}
                                    />
                                </div>

                                <div className={`p-6 rounded-2xl flex items-center gap-4 transition-all duration-500 ${formData.evaluation.status === 'Qualified' && formData.evaluation.performance === 'Met'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : formData.evaluation.status === 'Disqualified'
                                        ? 'bg-red-50 text-red-700 border border-red-100'
                                        : 'bg-white border border-slate-100 text-slate-400'
                                    }`}>
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${formData.evaluation.status === 'Qualified' ? 'bg-emerald-100' :
                                        formData.evaluation.status === 'Disqualified' ? 'bg-red-100' : 'bg-slate-50'
                                        }`}>?</div>
                                    <div>
                                        <p className="font-black uppercase tracking-widest text-[10px]">Registry Result</p>
                                        <p className="font-bold text-sm tracking-tight capitalize">
                                            {formData.evaluation.status || 'Pending Assessment'} / {formData.evaluation.performance || 'Pending Result'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-10">
                    <div>
                        {activeSection !== 'profile' && (
                            <button
                                onClick={() => {
                                    if (activeSection === 'background') setActiveSection('profile');
                                    else if (activeSection === 'professional') setActiveSection('background');
                                    else if (activeSection === 'evaluation') setActiveSection('professional');
                                }}
                                className="flex items-center gap-2 px-8 py-3 text-slate-500 font-black hover:text-slate-900 transition-colors uppercase tracking-widest text-xs"
                            >
                                <ChevronLeft size={20} strokeWidth={3} /> Previous
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                        <button onClick={onClose} className="px-8 py-3 text-slate-400 hover:text-slate-600 transition-colors" disabled={isSubmitting}>
                            Cancel
                        </button>
                        {activeSection !== 'evaluation' ? (
                            <button
                                onClick={() => {
                                    if (activeSection === 'profile') setActiveSection('background');
                                    else if (activeSection === 'background') setActiveSection('professional');
                                    else if (activeSection === 'professional') setActiveSection('evaluation');
                                }}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:translate-x-1"
                            >
                                Next Section <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`flex items-center gap-3 px-10 py-4 text-white rounded-2xl shadow-lg transition-all active:scale-95 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>Registering...</>
                                ) : (
                                    <>
                                        <Save size={20} strokeWidth={3} /> Register Evaluation
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable Components
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    value: string;
    onChange: (v: string) => void;
}

function Input({ label, value, onChange, type = 'text', placeholder = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                {...props}
            />
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
}

function Select({ label, options, value, onChange, ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none appearance-none"
                {...props}
            >
                <option value="">Select...</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}
