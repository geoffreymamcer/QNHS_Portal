'use client';

import React, { useState } from 'react';
import { X, User, Users, GraduationCap, Award, Plus, Trash2, Save, ChevronRight, ChevronLeft, MapPin, Contact, Fingerprint, Calendar, CheckCircle2 } from 'lucide-react';
import { createEmployeePds } from './actions';
import { useRouter } from 'next/navigation';

interface AddEmployeePdsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'personal' | 'family' | 'education' | 'eligibility';

export default function AddEmployeePdsModal({ isOpen, onClose }: AddEmployeePdsModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        personalInfo: {
            firstName: '',
            middleName: '',
            lastName: '',
            birthDate: '',
            placeOfBirth: '',
            gender: '',
            civilStatus: '',
            height: '',
            weight: '',
            bloodType: '',
            umid: '',
            pagibig: '',
            philhealth: '',
            philsys: '',
            tin: '',
            agencyEmployeeNo: '',
            citizenship: '',
            resHouseNo: '',
            resStreet: '',
            resSubdivision: '',
            resBarangay: '',
            resCity: '',
            resProvince: '',
            resZipCode: '',
            permHouseNo: '',
            permStreet: '',
            permSubdivision: '',
            permBarangay: '',
            permCity: '',
            permProvince: '',
            permZipCode: '',
            telNo: '',
            mobileNo: '',
            email: '',
        },
        familyBackground: {
            spouseSurname: '',
            spouseFirstName: '',
            spouseMiddleName: '',
            spouseExtension: '',
            spouseOccupation: '',
            spouseEmployer: '',
            spouseTelNo: '',
            fatherSurname: '',
            fatherFirstName: '',
            fatherMiddleName: '',
            fatherExtension: '',
            motherSurname: '',
            motherFirstName: '',
            motherMiddleName: '',
            children: [] as { name: string; birthDate: string }[],
        },
        educationalBackground: [] as {
            level: string;
            schoolName: string;
            degree: string;
            from: string;
            to: string;
            units: string;
            yearGraduated: string;
            honors: string;
        }[],
        civilServiceEligibility: [] as {
            type: string;
            rating: string;
            date: string;
            licenseNumber: string;
            licenseValidUntil: string;
        }[],
    });

    if (!isOpen) return null;

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [name]: value }
        }));
    };

    const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            familyBackground: { ...prev.familyBackground, [name]: value }
        }));
    };

    const addChild = () => {
        setFormData(prev => ({
            ...prev,
            familyBackground: {
                ...prev.familyBackground,
                children: [...prev.familyBackground.children, { name: '', birthDate: '' }]
            }
        }));
    };

    const removeChild = (index: number) => {
        setFormData(prev => ({
            ...prev,
            familyBackground: {
                ...prev.familyBackground,
                children: prev.familyBackground.children.filter((_, i) => i !== index)
            }
        }));
    };

    const updateChild = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newChildren = [...prev.familyBackground.children];
            newChildren[index] = { ...newChildren[index], [field]: value };
            return {
                ...prev,
                familyBackground: { ...prev.familyBackground, children: newChildren }
            };
        });
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            educationalBackground: [
                ...prev.educationalBackground,
                { level: '', schoolName: '', degree: '', from: '', to: '', units: '', yearGraduated: '', honors: '' }
            ]
        }));
    };

    const removeEducation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            educationalBackground: prev.educationalBackground.filter((_, i) => i !== index)
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newEdu = [...prev.educationalBackground];
            newEdu[index] = { ...newEdu[index], [field]: value };
            return { ...prev, educationalBackground: newEdu };
        });
    };

    const addEligibility = () => {
        setFormData(prev => ({
            ...prev,
            civilServiceEligibility: [
                ...prev.civilServiceEligibility,
                { type: '', rating: '', date: '', licenseNumber: '', licenseValidUntil: '' }
            ]
        }));
    };

    const removeEligibility = (index: number) => {
        setFormData(prev => ({
            ...prev,
            civilServiceEligibility: prev.civilServiceEligibility.filter((_, i) => i !== index)
        }));
    };

    const updateEligibility = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newElig = [...prev.civilServiceEligibility];
            newElig[index] = { ...newElig[index], [field]: value };
            return { ...prev, civilServiceEligibility: newElig };
        });
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.personalInfo.lastName || !formData.personalInfo.firstName || !formData.personalInfo.gender || !formData.personalInfo.birthDate) {
            setError('Please fill in all required fields (Surname, First Name, Sex, and Birth Date)');
            setActiveTab('personal');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await createEmployeePds(formData);
            setIsSuccess(true);
            setTimeout(() => {
                router.refresh();
                onClose();
                setIsSuccess(false);
                setActiveTab('personal');
                // Reset form could go here
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'family', label: 'Family Background', icon: Users },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'eligibility', label: 'Eligibility', icon: Award },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-950 flex items-center gap-3">
                            <Fingerprint className="text-blue-600" size={28} />
                            Personal Data Sheet (PDS)
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Detailed employee record following government standards.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={24} /></button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-slate-50/50 p-2 border-b border-slate-100 gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-blue-700 shadow-sm border border-blue-100' 
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">Record Saved Successfully!</h2>
                            <p className="text-slate-500 text-center max-w-xs">The full Personal Data Sheet has been recorded. The dashboard will refresh shortly.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                                    <X className="bg-red-200 rounded-full p-1" size={18} />
                                    {error}
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                    {/* Identity Section */}
                                    <section className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Contact size={14} className="text-blue-600" /> Identity & Basic info
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">SURNAME <span className="text-red-500">*</span></label>
                                                <input name="lastName" value={formData.personalInfo.lastName} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">FIRST NAME <span className="text-red-500">*</span></label>
                                                <input name="firstName" value={formData.personalInfo.firstName} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">MIDDLE NAME</label>
                                                <input name="middleName" value={formData.personalInfo.middleName} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">DATE OF BIRTH <span className="text-red-500">*</span></label>
                                                <input type="date" name="birthDate" value={formData.personalInfo.birthDate} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">PLACE OF BIRTH</label>
                                                <input name="placeOfBirth" value={formData.personalInfo.placeOfBirth} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">SEX AT BIRTH <span className="text-red-500">*</span></label>
                                                <select name="gender" value={formData.personalInfo.gender} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none">
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">CIVIL STATUS</label>
                                        <select name="civilStatus" value={formData.personalInfo.civilStatus} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none">
                                            <option value="">Select</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Separated">Separated</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">CITIZENSHIP</label>
                                        <input name="citizenship" value={formData.personalInfo.citizenship} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="Filipino" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Physical & IDs */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Fingerprint size={14} className="text-blue-600" /> Physical measurements & standard IDs
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">HEIGHT (m)</label>
                                        <input type="number" step="0.01" name="height" value={formData.personalInfo.height} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="1.75" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">WEIGHT (kg)</label>
                                        <input type="number" step="0.1" name="weight" value={formData.personalInfo.weight} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="70.5" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">BLOOD TYPE</label>
                                        <input name="bloodType" value={formData.personalInfo.bloodType} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="O+" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">TIN NUMBER</label>
                                        <input name="tin" value={formData.personalInfo.tin} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">AGENCY EMPLOYEE NO.</label>
                                        <input name="agencyEmployeeNo" value={formData.personalInfo.agencyEmployeeNo} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">UMID ID NO.</label>
                                        <input name="umid" value={formData.personalInfo.umid} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">PAGIBIG ID NO.</label>
                                        <input name="pagibig" value={formData.personalInfo.pagibig} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">PHILHEALTH ID NO.</label>
                                        <input name="philhealth" value={formData.personalInfo.philhealth} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">PHILSYS ID NUMBER</label>
                                        <input name="philsys" value={formData.personalInfo.philsys} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Addresses & Contact */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={14} className="text-blue-600" /> Residential & Permanent Address
                                </h3>
                                
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                    <h4 className="text-[11px] font-black text-slate-700 uppercase">Residential Address</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input name="resHouseNo" value={formData.personalInfo.resHouseNo} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="House/Block/Lot No." />
                                        <input name="resStreet" value={formData.personalInfo.resStreet} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Street" />
                                        <input name="resSubdivision" value={formData.personalInfo.resSubdivision} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Subdivision/Village" />
                                        <input name="resBarangay" value={formData.personalInfo.resBarangay} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Barangay" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input name="resCity" value={formData.personalInfo.resCity} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="City/Municipality" />
                                        <input name="resProvince" value={formData.personalInfo.resProvince} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Province" />
                                        <input name="resZipCode" value={formData.personalInfo.resZipCode} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Zip Code" />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-black text-slate-700 uppercase">Permanent Address</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ 
                                                ...prev, 
                                                personalInfo: { 
                                                    ...prev.personalInfo, 
                                                    permHouseNo: prev.personalInfo.resHouseNo,
                                                    permStreet: prev.personalInfo.resStreet,
                                                    permSubdivision: prev.personalInfo.resSubdivision,
                                                    permBarangay: prev.personalInfo.resBarangay,
                                                    permCity: prev.personalInfo.resCity,
                                                    permProvince: prev.personalInfo.resProvince,
                                                    permZipCode: prev.personalInfo.resZipCode
                                                } 
                                            }))}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                        >
                                            Copy Residential Address
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input name="permHouseNo" value={formData.personalInfo.permHouseNo} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="House/Block/Lot No." />
                                        <input name="permStreet" value={formData.personalInfo.permStreet} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Street" />
                                        <input name="permSubdivision" value={formData.personalInfo.permSubdivision} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Subdivision/Village" />
                                        <input name="permBarangay" value={formData.personalInfo.permBarangay} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Barangay" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input name="permCity" value={formData.personalInfo.permCity} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="City/Municipality" />
                                        <input name="permProvince" value={formData.personalInfo.permProvince} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Province" />
                                        <input name="permZipCode" value={formData.personalInfo.permZipCode} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" placeholder="Zip Code" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">TELEPHONE NUMBER</label>
                                        <input name="telNo" value={formData.personalInfo.telNo} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">MOBILE NUMBER</label>
                                        <input name="mobileNo" value={formData.personalInfo.mobileNo} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">EMAIL ADDRESS</label>
                                        <input type="email" name="email" value={formData.personalInfo.email} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="user@example.com" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'family' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            {/* Spouse */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} className="text-blue-600" /> Spouse Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">SURNAME</label>
                                        <input name="spouseSurname" value={formData.familyBackground.spouseSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">FIRST NAME</label>
                                        <input name="spouseFirstName" value={formData.familyBackground.spouseFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">MIDDLE NAME</label>
                                        <input name="spouseMiddleName" value={formData.familyBackground.spouseMiddleName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">EXTENSION (e.g. Jr.)</label>
                                        <input name="spouseExtension" value={formData.familyBackground.spouseExtension} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">OCCUPATION</label>
                                        <input name="spouseOccupation" value={formData.familyBackground.spouseOccupation} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">EMPLOYER/BUSINESS NAME</label>
                                        <input name="spouseEmployer" value={formData.familyBackground.spouseEmployer} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">TELEPHONE NO.</label>
                                        <input name="spouseTelNo" value={formData.familyBackground.spouseTelNo} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Father */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} className="text-blue-600" /> Father's Name
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">SURNAME</label>
                                        <input name="fatherSurname" value={formData.familyBackground.fatherSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">FIRST NAME</label>
                                        <input name="fatherFirstName" value={formData.familyBackground.fatherFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">MIDDLE NAME</label>
                                        <input name="fatherMiddleName" value={formData.familyBackground.fatherMiddleName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">EXTENSION</label>
                                        <input name="fatherExtension" value={formData.familyBackground.fatherExtension} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Mother */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} className="text-blue-600" /> Mother's Maiden Name
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">SURNAME</label>
                                        <input name="motherSurname" value={formData.familyBackground.motherSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">FIRST NAME</label>
                                        <input name="motherFirstName" value={formData.familyBackground.motherFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 ml-1">MIDDLE NAME</label>
                                        <input name="motherMiddleName" value={formData.familyBackground.motherMiddleName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Children */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} className="text-blue-600" /> Name of Children
                                    </h3>
                                    <button onClick={addChild} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all">
                                        <Plus size={14} /> Add Child
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.familyBackground.children.map((child, index) => (
                                        <div key={index} className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm outline-none" placeholder="Full name of child" />
                                            <input type="date" value={child.birthDate} onChange={(e) => updateChild(index, 'birthDate', e.target.value)} className="w-48 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm outline-none" />
                                            <button onClick={() => removeChild(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                    {formData.familyBackground.children.length === 0 && (
                                        <p className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-2xl">No children records added.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                             <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap size={14} className="text-blue-600" /> Educational Background
                                </h3>
                                <button onClick={addEducation} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all">
                                    <Plus size={14} /> Add Education Level
                                </button>
                            </div>
                            <div className="space-y-6">
                                {formData.educationalBackground.map((edu, index) => (
                                    <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 relative group animate-in slide-in-from-top-4 duration-500">
                                        <button onClick={() => removeEducation(index)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">LEVEL</label>
                                                <input value={edu.level} onChange={(e) => updateEducation(index, 'level', e.target.value)} placeholder="e.g. Elementary, College" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">NAME OF SCHOOL</label>
                                                <input value={edu.schoolName} onChange={(e) => updateEducation(index, 'schoolName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">DEGREE/COURSE</label>
                                                <input value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">FROM</label>
                                                <input value={edu.from} onChange={(e) => updateEducation(index, 'from', e.target.value)} placeholder="Year" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">TO</label>
                                                <input value={edu.to} onChange={(e) => updateEducation(index, 'to', e.target.value)} placeholder="Year" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">HIGHEST UNITS</label>
                                                <input value={edu.units} onChange={(e) => updateEducation(index, 'units', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">YEAR GRADUATED</label>
                                                <input value={edu.yearGraduated} onChange={(e) => updateEducation(index, 'yearGraduated', e.target.value)} placeholder="YYYY" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 ml-1">ACADEMIC HONORS</label>
                                                <input value={edu.honors} onChange={(e) => updateEducation(index, 'honors', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {formData.educationalBackground.length === 0 && (
                                    <p className="text-center py-12 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-3xl">No educational records added. Use the button above to add levels.</p>
                                )}
                            </div>
                        </div>
                    )}

                            {activeTab === 'eligibility' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                     <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Award size={14} className="text-blue-600" /> Civil Service Eligibility
                                        </h3>
                                        <button onClick={addEligibility} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all">
                                            <Plus size={14} /> Add Eligibility
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.civilServiceEligibility.map((elig, index) => (
                                            <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 relative group animate-in slide-in-from-top-4 duration-500">
                                                <button onClick={() => removeEligibility(index)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 ml-1">ELIGIBILITY TYPE</label>
                                                        <input value={elig.type} onChange={(e) => updateEligibility(index, 'type', e.target.value)} placeholder="e.g. RA 1080, BOARD, BAR" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 ml-1">RATING (IF APPLICABLE)</label>
                                                        <input value={elig.rating} onChange={(e) => updateEligibility(index, 'rating', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 ml-1">DATE OF EXAM/CONFERMENT</label>
                                                        <input type="date" value={elig.date} onChange={(e) => updateEligibility(index, 'date', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 ml-1">LICENSE NUMBER</label>
                                                        <input value={elig.licenseNumber} onChange={(e) => updateEligibility(index, 'licenseNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 ml-1">LICENSE VALID UNTIL</label>
                                                        <input type="date" value={elig.licenseValidUntil} onChange={(e) => updateEligibility(index, 'licenseValidUntil', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.civilServiceEligibility.length === 0 && (
                                            <p className="text-center py-12 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-3xl">No eligibility records added. Use the button above to add records.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer and Navigation */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                        {activeTab !== 'personal' && (
                            <button 
                                onClick={() => {
                                    if (activeTab === 'family') setActiveTab('personal');
                                    if (activeTab === 'education') setActiveTab('family');
                                    if (activeTab === 'eligibility') setActiveTab('education');
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white transition-all border border-slate-200"
                            >
                                <ChevronLeft size={18} /> Prev
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                        
                        {activeTab !== 'eligibility' ? (
                            <button 
                                onClick={() => {
                                    if (activeTab === 'personal') setActiveTab('family');
                                    else if (activeTab === 'family') setActiveTab('education');
                                    else if (activeTab === 'education') setActiveTab('eligibility');
                                }}
                                className="flex items-center gap-2 px-12 py-2.5 rounded-xl font-black text-white bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className="flex items-center gap-2 px-16 py-2.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Full PDS'} <Save size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
