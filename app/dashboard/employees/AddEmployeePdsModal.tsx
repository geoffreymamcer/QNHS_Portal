'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Users, GraduationCap, Award, Plus, Trash2, Save, ChevronRight, ChevronLeft, MapPin, Contact, Fingerprint, Calendar, CheckCircle2, Search, PlusCircle } from 'lucide-react';
import { createEmployeePds, getPdsDropdownValues } from './actions';
import { useRouter } from 'next/navigation';

interface AddEmployeePdsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'personal' | 'family' | 'education' | 'eligibility';

// Helper Component for the requested Select implementation
const PdsSelect = ({ 
    label, 
    name, 
    value, 
    options, 
    onChange, 
    placeholder, 
    required = false,
    className = ""
}: { 
    label: string, 
    name: string, 
    value: string, 
    options: string[], 
    onChange: (name: string, value: string) => void,
    placeholder?: string,
    required?: boolean,
    className?: string
}) => {
    // Determine if the current value is NOT in the database list
    // If it's not and it's not empty, it's a "custom" value
    const [isCustom, setIsCustom] = useState(!options.includes(value) && value !== '');

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'ADD_NEW_VALUE') {
            setIsCustom(true);
            // Optionally clear or keep. Keep current value if switching to custom
        } else {
            setIsCustom(false);
            onChange(name, val);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(name, e.target.value);
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tight">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            {!isCustom ? (
                <div className="relative group">
                    <select 
                        value={value} 
                        onChange={handleSelectChange}
                        required={required && !isCustom}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-600/5 focus:border-blue-200 appearance-none"
                    >
                        <option value="">{placeholder || `Select ${label}`}</option>
                        {options.map((opt, i) => (
                            <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                        ))}
                        <option value="ADD_NEW_VALUE" className="text-blue-600 font-bold bg-blue-50">
                            + Add New / Other...
                        </option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                        <ChevronRight size={14} className="rotate-90" />
                    </div>
                </div>
            ) : (
                <div className="relative animate-in slide-in-from-top-1 duration-200">
                    <input 
                        name={name}
                        value={value}
                        onChange={handleInputChange}
                        placeholder={`Type ${label.toLowerCase()}...`}
                        className="w-full bg-blue-50/50 border border-blue-200 rounded-xl py-2.5 px-4 text-sm outline-none ring-4 ring-blue-600/5 focus:ring-blue-600/10 focus:border-blue-400 transition-all pr-10"
                        autoFocus
                        required={required}
                    />
                    <button 
                        type="button"
                        onClick={() => {
                            setIsCustom(false);
                            // If user cancels, we might want to clear or reset to empty
                            if (!options.includes(value)) onChange(name, '');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Back to list"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute -top-2 left-6 px-2 bg-white text-[9px] font-black text-blue-500 uppercase tracking-widest border border-blue-100 rounded-full">
                        Custom Entry
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AddEmployeePdsModal({ isOpen, onClose }: AddEmployeePdsModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Dropdown values from database
    const [dropVals, setDropVals] = useState<any>({
        citizenships: [],
        bloodTypes: [],
        cities: [],
        provinces: [],
        zipCodes: [],
        eduLevels: [],
        schools: [],
        degrees: [],
        yearsFrom: [],
        yearsTo: [],
        units: [],
        honors: [],
    });

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

    useEffect(() => {
        if (isOpen) {
            fetchDropdowns();
        }
    }, [isOpen]);

    const fetchDropdowns = async () => {
        try {
            const data = await getPdsDropdownValues();
            setDropVals(data);
        } catch (err) {
            console.error('Failed to fetch PDS dropdowns:', err);
        }
    };

    if (!isOpen) return null;

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [name]: value }
        }));
    };

    // Helper for PdsSelect component
    const updatePersonalInfoValue = (name: string, value: string) => {
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

    const updateEducationValue = (index: number, field: string, value: string) => {
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
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/20 to-transparent">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-950 flex items-center gap-3">
                            <div className="p-2 bg-blue-600/10 rounded-xl">
                                <Fingerprint className="text-blue-600" size={24} />
                            </div>
                            Personal Data Sheet (PDS)
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Detailed employee record following government standards.</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-slate-50 border-b border-slate-100 p-1.5 gap-1 mx-4 my-4 rounded-2xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/5 ring-1 ring-slate-100' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-100 animate-bounce">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Record Perfected!</h2>
                            <p className="text-slate-500 text-center max-w-xs font-semibold">The full Personal Data Sheet has been recorded. The dashboard will refresh shortly.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in shake duration-500">
                                    <X className="bg-red-200 rounded-full p-1" size={18} />
                                    {error}
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                    {/* Identity Section */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-blue-600 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Identity & Basic info</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">SURNAME <span className="text-red-500">*</span></label>
                                                <input name="lastName" value={formData.personalInfo.lastName} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">FIRST NAME <span className="text-red-500">*</span></label>
                                                <input name="firstName" value={formData.personalInfo.firstName} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">MIDDLE NAME</label>
                                                <input name="middleName" value={formData.personalInfo.middleName} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">DATE OF BIRTH <span className="text-red-500">*</span></label>
                                                <input type="date" name="birthDate" value={formData.personalInfo.birthDate} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">PLACE OF BIRTH</label>
                                                <input name="placeOfBirth" value={formData.personalInfo.placeOfBirth} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1">SEX AT BIRTH <span className="text-red-500">*</span></label>
                                                <select name="gender" value={formData.personalInfo.gender} onChange={handlePersonalInfoChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 appearance-none">
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">CIVIL STATUS</label>
                                                <select name="civilStatus" value={formData.personalInfo.civilStatus} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 appearance-none">
                                                    <option value="">Select</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Widowed">Widowed</option>
                                                    <option value="Separated">Separated</option>
                                                </select>
                                            </div>
                                            <PdsSelect 
                                                label="CITIZENSHIP" 
                                                name="citizenship" 
                                                value={formData.personalInfo.citizenship} 
                                                options={[...dropVals.citizenships, "Filipino"]} 
                                                onChange={updatePersonalInfoValue} 
                                                placeholder="Select or Type"
                                            />
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    {/* Physical & IDs */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-emerald-600 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Physical & Standard IDs</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">HEIGHT (m)</label>
                                                <input type="number" step="0.01" name="height" value={formData.personalInfo.height} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="1.75" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">WEIGHT (kg)</label>
                                                <input type="number" step="0.1" name="weight" value={formData.personalInfo.weight} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" placeholder="70.5" />
                                            </div>
                                            <PdsSelect 
                                                label="BLOOD TYPE" 
                                                name="bloodType" 
                                                value={formData.personalInfo.bloodType} 
                                                options={[...dropVals.bloodTypes, "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} 
                                                onChange={updatePersonalInfoValue} 
                                            />
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">TIN NUMBER</label>
                                                <input name="tin" value={formData.personalInfo.tin} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">AGENCY EMPLOYEE NO.</label>
                                                <input name="agencyEmployeeNo" value={formData.personalInfo.agencyEmployeeNo} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">UMID ID NO.</label>
                                                <input name="umid" value={formData.personalInfo.umid} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">PAGIBIG ID NO.</label>
                                                <input name="pagibig" value={formData.personalInfo.pagibig} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">PHILHEALTH ID NO.</label>
                                                <input name="philhealth" value={formData.personalInfo.philhealth} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">PHILSYS ID NUMBER</label>
                                                <input name="philsys" value={formData.personalInfo.philsys} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    {/* Addresses & Contact */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-amber-500 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Address & Contact Information</h3>
                                        </div>
                                        
                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest pl-1">Residential Address</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">House/Lot No.</label><input name="resHouseNo" value={formData.personalInfo.resHouseNo} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Street</label><input name="resStreet" value={formData.personalInfo.resStreet} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Subdivision</label><input name="resSubdivision" value={formData.personalInfo.resSubdivision} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Barangay</label><input name="resBarangay" value={formData.personalInfo.resBarangay} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <PdsSelect label="CITY/MUNICIPALITY" name="resCity" value={formData.personalInfo.resCity} options={dropVals.cities} onChange={updatePersonalInfoValue} className="bg-white" />
                                                <PdsSelect label="PROVINCE" name="resProvince" value={formData.personalInfo.resProvince} options={dropVals.provinces} onChange={updatePersonalInfoValue} className="bg-white" />
                                                <PdsSelect label="ZIP CODE" name="resZipCode" value={formData.personalInfo.resZipCode} options={dropVals.zipCodes} onChange={updatePersonalInfoValue} className="bg-white" />
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                                            <div className="flex items-center justify-between pl-1">
                                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Permanent Address</h4>
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
                                                    className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                                                >
                                                    <PlusCircle size={12} /> Same as residential
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">House/Lot No.</label><input name="permHouseNo" value={formData.personalInfo.permHouseNo} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Street</label><input name="permStreet" value={formData.personalInfo.permStreet} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Subdivision</label><input name="permSubdivision" value={formData.personalInfo.permSubdivision} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Barangay</label><input name="permBarangay" value={formData.personalInfo.permBarangay} onChange={handlePersonalInfoChange} className="w-full bg-white border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-300" /></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <PdsSelect label="CITY/MUNICIPALITY" name="permCity" value={formData.personalInfo.permCity} options={dropVals.cities} onChange={updatePersonalInfoValue} className="bg-white" />
                                                <PdsSelect label="PROVINCE" name="permProvince" value={formData.personalInfo.permProvince} options={dropVals.provinces} onChange={updatePersonalInfoValue} className="bg-white" />
                                                <PdsSelect label="ZIP CODE" name="permZipCode" value={formData.personalInfo.permZipCode} options={dropVals.zipCodes} onChange={updatePersonalInfoValue} className="bg-white" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">TELEPHONE NUMBER</label>
                                                <input name="telNo" value={formData.personalInfo.telNo} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">MOBILE NUMBER</label>
                                                <input name="mobileNo" value={formData.personalInfo.mobileNo} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">EMAIL ADDRESS</label>
                                                <input type="email" name="email" value={formData.personalInfo.email} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 transition-all" placeholder="user@example.com" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'family' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                    {/* Spouse */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-blue-600 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Spouse Information</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">SURNAME</label><input name="spouseSurname" value={formData.familyBackground.spouseSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">FIRST NAME</label><input name="spouseFirstName" value={formData.familyBackground.spouseFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">MIDDLE NAME</label><input name="spouseMiddleName" value={formData.familyBackground.spouseMiddleName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">EXTENSION</label><input name="spouseExtension" value={formData.familyBackground.spouseExtension} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" placeholder="Jr., Sr." /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">OCCUPATION</label><input name="spouseOccupation" value={formData.familyBackground.spouseOccupation} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">EMPLOYER NAME</label><input name="spouseEmployer" value={formData.familyBackground.spouseEmployer} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">TELEPHONE NO.</label><input name="spouseTelNo" value={formData.familyBackground.spouseTelNo} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    {/* Father */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-slate-600 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Father's Name</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">SURNAME</label><input name="fatherSurname" value={formData.familyBackground.fatherSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">FIRST NAME</label><input name="fatherFirstName" value={formData.familyBackground.fatherFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">MIDDLE NAME</label><input name="fatherMiddleName" value={formData.familyBackground.fatherMiddleName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">EXTENSION</label><input name="fatherExtension" value={formData.familyBackground.fatherExtension} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    {/* Mother */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-pink-500 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Mother's Maiden Name</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">SURNAME</label><input name="motherSurname" value={formData.familyBackground.motherSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">FIRST NAME</label><input name="motherFirstName" value={formData.familyBackground.motherFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">MIDDLE NAME</label><input name="motherMiddleName" value={formData.familyBackground.motherMiddleName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5" /></div>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    {/* Children */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-8 bg-indigo-600 rounded-full" />
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Name of Children</h3>
                                            </div>
                                            <button onClick={addChild} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all active:scale-95 shadow-sm shadow-blue-900/5">
                                                <Plus size={14} /> Add child entry
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {formData.familyBackground.children.map((child, index) => (
                                                <div key={index} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 items-end animate-in fade-in slide-in-from-top-2 duration-300 group">
                                                    <div className="flex-1 space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full name of child</label>
                                                        <input value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm outline-none focus:border-blue-300" placeholder="John Doe Jr." />
                                                    </div>
                                                    <div className="w-48 space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Birth date</label>
                                                        <input type="date" value={child.birthDate} onChange={(e) => updateChild(index, 'birthDate', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm outline-none focus:border-blue-300" />
                                                    </div>
                                                    <button onClick={() => removeChild(index)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group-hover:scale-105">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.familyBackground.children.length === 0 && (
                                                <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 space-y-2">
                                                    <Users size={32} className="opacity-10" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">No child records registered</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'education' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 pb-10">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-blue-600 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Educational History</h3>
                                        </div>
                                        <button onClick={addEducation} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all active:scale-95">
                                            <Plus size={14} /> Add new level
                                        </button>
                                    </div>
                                    <div className="space-y-10">
                                        {formData.educationalBackground.map((edu, index) => (
                                            <div key={index} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8 relative group animate-in slide-in-from-top-4 duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                                                <button onClick={() => removeEducation(index)} className="absolute top-6 right-8 p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={20} />
                                                </button>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <PdsSelect 
                                                        label="LEVEL" 
                                                        name="level" 
                                                        value={edu.level} 
                                                        options={[...dropVals.eduLevels, "Elementary", "Secondary", "College", "Graduate Studies"]} 
                                                        onChange={(_, v) => updateEducationValue(index, 'level', v)} 
                                                        className="bg-white"
                                                    />
                                                    <PdsSelect 
                                                        label="NAME OF SCHOOL" 
                                                        name="schoolName" 
                                                        value={edu.schoolName} 
                                                        options={dropVals.schools} 
                                                        onChange={(_, v) => updateEducationValue(index, 'schoolName', v)} 
                                                        className="md:col-span-2 bg-white"
                                                    />
                                                    <PdsSelect 
                                                        label="DEGREE/COURSE" 
                                                        name="degree" 
                                                        value={edu.degree} 
                                                        options={dropVals.degrees} 
                                                        onChange={(_, v) => updateEducationValue(index, 'degree', v)} 
                                                        className="bg-white"
                                                    />
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                                    <PdsSelect 
                                                        label="FROM" 
                                                        name="from" 
                                                        value={edu.from} 
                                                        options={dropVals.yearsFrom} 
                                                        onChange={(_, v) => updateEducationValue(index, 'from', v)} 
                                                        className="bg-white"
                                                        placeholder="Year"
                                                    />
                                                    <PdsSelect 
                                                        label="TO" 
                                                        name="to" 
                                                        value={edu.to} 
                                                        options={dropVals.yearsTo} 
                                                        onChange={(_, v) => updateEducationValue(index, 'to', v)} 
                                                        className="bg-white"
                                                        placeholder="Year"
                                                    />
                                                    <PdsSelect 
                                                        label="HIGHEST UNITS" 
                                                        name="units" 
                                                        value={edu.units} 
                                                        options={dropVals.units} 
                                                        onChange={(_, v) => updateEducationValue(index, 'units', v)} 
                                                        className="bg-white"
                                                    />
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">YEAR GRADUATED</label>
                                                        <input value={edu.yearGraduated} onChange={(e) => updateEducationValue(index, 'yearGraduated', e.target.value)} placeholder="YYYY" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400" />
                                                    </div>
                                                    <PdsSelect 
                                                        label="ACADEMIC HONORS" 
                                                        name="honors" 
                                                        value={edu.honors} 
                                                        options={dropVals.honors} 
                                                        onChange={(_, v) => updateEducationValue(index, 'honors', v)} 
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {formData.educationalBackground.length === 0 && (
                                            <div className="py-24 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 space-y-3">
                                                <GraduationCap size={48} className="opacity-10" />
                                                <p className="text-sm font-black uppercase tracking-[0.2em] italic opacity-40">No educational record clusters</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'eligibility' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-8 bg-emerald-600 rounded-full" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Civil Service Eligibility</h3>
                                        </div>
                                        <button onClick={addEligibility} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 shadow-sm">
                                            <Plus size={14} /> Add new record
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.civilServiceEligibility.map((elig, index) => (
                                            <div key={index} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 relative group animate-in slide-in-from-top-4 duration-500 hover:bg-white hover:shadow-xl transition-all">
                                                <button onClick={() => removeEligibility(index)} className="absolute top-6 right-8 p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={20} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">ELIGIBILITY TYPE</label>
                                                        <input value={elig.type} onChange={(e) => updateEligibility(index, 'type', e.target.value)} placeholder="e.g. RA 1080, BOARD, BAR" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-emerald-600/5" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">RATING (IF APPLICABLE)</label>
                                                        <input value={elig.rating} onChange={(e) => updateEligibility(index, 'rating', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-emerald-600/5 font-mono" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tighter">DATE OF EXAM</label><input type="date" value={elig.date} onChange={(e) => updateEligibility(index, 'date', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" /></div>
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tighter">LICENSE NUMBER</label><input value={elig.licenseNumber} onChange={(e) => updateEligibility(index, 'licenseNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none font-mono tracking-widest" /></div>
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tighter">VALID UNTIL</label><input type="date" value={elig.licenseValidUntil} onChange={(e) => updateEligibility(index, 'licenseValidUntil', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none" /></div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.civilServiceEligibility.length === 0 && (
                                            <div className="py-24 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 space-y-3">
                                                <Award size={48} className="opacity-10" />
                                                <p className="text-sm font-black uppercase tracking-[0.2em] italic opacity-40">No CS Eligibility records</p>
                                            </div>
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
                                className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-white transition-all border border-transparent hover:border-slate-200 shadow-sm shadow-blue-950/5"
                            >
                                <ChevronLeft size={18} /> Previous Tab
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Dismiss</button>
                        
                        {activeTab !== 'eligibility' ? (
                            <button 
                                onClick={() => {
                                    if (activeTab === 'personal') setActiveTab('family');
                                    else if (activeTab === 'family') setActiveTab('education');
                                    else if (activeTab === 'education') setActiveTab('eligibility');
                                }}
                                className="flex items-center gap-2 px-14 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className="flex items-center gap-2 px-16 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Finalizing...' : 'Sync Full PDS'} <Save size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
