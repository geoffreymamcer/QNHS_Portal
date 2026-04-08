'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, User, Briefcase, Info, Save, GraduationCap, Banknote, MapPin, CheckCircle2, Users, Award, Fingerprint, ChevronRight, ChevronLeft, Plus, Trash2, PlusCircle, ShieldAlert } from 'lucide-react';
import { updateEmployeeFullProfile, getVacantPositions, getUniqueDepartments, getEmployeeFullProfile, getPdsDropdownValues } from './actions';
import { useRouter } from 'next/navigation';

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

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any; // Base employee data from table
}

type TabType = 'summary' | 'personal' | 'family' | 'education' | 'eligibility';

// Helper Component for consistent Dropdown implementation
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
    const [isCustom, setIsCustom] = useState(Boolean(value) && !options.includes(value!));

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'ADD_NEW_VALUE') {
            setIsCustom(true);
        } else {
            setIsCustom(false);
            onChange(name, val);
        }
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tight">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            {!isCustom ? (
                <div className="relative group">
                    <select 
                        value={value ?? ''} 
                        onChange={handleSelectChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-600/5 focus:border-blue-200 appearance-none"
                    >
                        <option value="">{placeholder || `Select ${label}`}</option>
                        {options.map((opt, i) => (
                            <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                        ))}
                        <option value="ADD_NEW_VALUE" className="text-blue-600 font-bold bg-blue-50">+ Add New / Other...</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={14} className="rotate-90" />
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <input 
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={`Type ${label.toLowerCase()}...`}
                        className="w-full bg-blue-50/50 border border-blue-200 rounded-xl py-2.5 px-4 text-sm outline-none ring-4 ring-blue-600/5 focus:ring-blue-600/10 transition-all pr-10"
                        autoFocus
                    />
                    <button 
                        type="button"
                        onClick={() => setIsCustom(false)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('summary');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullProfileLoading, setIsFullProfileLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Dropdown values from database
    const [dropVals, setDropVals] = useState<any>({
        citizenships: [], bloodTypes: [], cities: [], provinces: [], zipCodes: [],
        eduLevels: [], schools: [], degrees: [], yearsFrom: [], yearsTo: [], units: [], honors: []
    });

    const [vacantPositions, setVacantPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [isManualItem, setIsManualItem] = useState(false);

    const [formData, setFormData] = useState({
        summary: {
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
        },
        personalInfo: {
            employeeId: '',
            firstName: '',
            middleName: '',
            lastName: '',
            birthDate: '',
            gender: '',
            tin: '',
            eligibility: '',
            licenseExpirationDate: '',
            isDeceased: 'false',
            placeOfBirth: '',
            civilStatus: '',
            height: '',
            weight: '',
            bloodType: '',
            umid: '',
            pagibig: '',
            philhealth: '',
            philsys: '',
            agencyEmployeeNo: '',
            citizenship: '',
            resHouseNo: '', resStreet: '', resSubdivision: '', resBarangay: '', resCity: '', resProvince: '', resZipCode: '',
            permHouseNo: '', permStreet: '', permSubdivision: '', permBarangay: '', permCity: '', permProvince: '', permZipCode: '',
            telNo: '', mobileNo: '', email: '',
        },
        familyBackground: {
            spouseSurname: '', spouseFirstName: '', spouseMiddleName: '', spouseExtension: '',
            spouseOccupation: '', spouseEmployer: '', spouseTelNo: '',
            fatherSurname: '', fatherFirstName: '', fatherMiddleName: '', fatherExtension: '',
            motherSurname: '', motherFirstName: '', motherMiddleName: '',
            children: [] as { name: string; birthDate: string }[],
        },
        educationalBackground: [] as {
            level: string; schoolName: string; degree: string; from: string; to: string; units: string; yearGraduated: string; honors: string;
        }[],
        civilServiceEligibility: [] as {
            type: string; rating: string; date: string; licenseNumber: string; licenseValidUntil: string;
        }[],
    });

    useEffect(() => {
        if (isOpen && employee?.id) {
            loadInitialData();
            fetchFullProfile(employee.id);
        }
    }, [isOpen, employee?.id]);

    const loadInitialData = async () => {
        try {
            const [posData, deptData, dropData] = await Promise.all([
                getVacantPositions(),
                getUniqueDepartments(),
                getPdsDropdownValues()
            ]);
            setVacantPositions(posData);
            setDepartments(deptData);
            setDropVals(dropData);
        } catch (err) {
            console.error('Error loading modal requirements:', err);
        }
    };

    const fetchFullProfile = async (uuid: string) => {
        setIsFullProfileLoading(true);
        try {
            const profile = await getEmployeeFullProfile(uuid);
            const pds = profile.pds || {};
            const family = profile.family || {};
            
            setFormData({
                summary: {
                    positionTitle: profile.position_title || '',
                    classification: profile.classification || 'Teaching',
                    department: profile.department || '',
                    status: profile.status || 'Permanent',
                    level: profile.level || 'Junior High School',
                    itemNumber: profile.item_number || '',
                    salaryGrade: profile.salary_grade?.toString() || '',
                    step: profile.step?.toString() || '1',
                    salaryAuthorized: profile.annual_salary_authorized?.toString() || '',
                    salaryActual: profile.annual_salary_actual?.toString() || '',
                    areaCode: profile.area_code || '',
                    areaType: profile.area_type || '',
                    ppaAttribution: profile.ppa_attribution || '',
                    appointmentDate: profile.original_appointment_date || '',
                    promotionDate: profile.last_promotion_date || '',
                    retirementDate: profile.retirement_date || '',
                    resignedDate: profile.resigned_date || '',
                },
                personalInfo: {
                    employeeId: profile.employee_id || '',
                    firstName: profile.first_name || '',
                    middleName: profile.middle_name || '',
                    lastName: profile.last_name || '',
                    birthDate: profile.birthdate || '',
                    gender: profile.sex || '',
                    tin: profile.tin || '',
                    eligibility: profile.civil_service_eligibility || '',
                    licenseExpirationDate: profile.license_expiration_date || '',
                    isDeceased: profile.is_deceased ? 'true' : 'false',
                    placeOfBirth: pds.place_of_birth || '',
                    civilStatus: pds.civil_status || '',
                    height: pds.height_m?.toString() || '',
                    weight: pds.weight_kg?.toString() || '',
                    bloodType: pds.blood_type || '',
                    umid: pds.umid_no || '',
                    pagibig: pds.pagibig_id_no || '',
                    philhealth: pds.philhealth_no || '',
                    philsys: pds.philsys_id_no || '',
                    agencyEmployeeNo: pds.agency_employee_no || '',
                    citizenship: pds.citizenship || '',
                    resHouseNo: pds.res_house_no || '', resStreet: pds.res_street || '', resSubdivision: pds.res_subdivision || '', resBarangay: pds.res_barangay || '', resCity: pds.res_city || '', resProvince: pds.res_province || '', resZipCode: pds.res_zip_code || '',
                    permHouseNo: pds.perm_house_no || '', permStreet: pds.perm_street || '', permSubdivision: pds.perm_subdivision || '', permBarangay: pds.perm_barangay || '', permCity: pds.perm_city || '', permProvince: pds.perm_province || '', permZipCode: pds.perm_zip_code || '',
                    telNo: pds.tel_no || '', mobileNo: pds.mobile_no || '', email: pds.email || '',
                },
                familyBackground: {
                    spouseSurname: family.spouse_lastname || '', spouseFirstName: family.spouse_firstname || '', spouseMiddleName: family.spouse_middlename || '', spouseExtension: family.spouse_extension || '',
                    spouseOccupation: family.spouse_occupation || '', spouseEmployer: family.spouse_employer || '', spouseTelNo: family.spouse_tel_no || '',
                    fatherSurname: family.father_lastname || '', fatherFirstName: family.father_firstname || '', fatherMiddleName: family.father_middlename || '', fatherExtension: family.father_extension || '',
                    motherSurname: family.mother_maiden_lastname || '', motherFirstName: family.mother_firstname || '', motherMiddleName: family.mother_middlename || '',
                    children: profile.children.map((c: any) => ({ name: c.child_name, birthDate: c.birth_date })) || [],
                },
                educationalBackground: profile.education?.map((e: any) => ({
                    level: e.level || '', 
                    schoolName: e.school_name || '', 
                    degree: e.degree_course || '', 
                    from: e.attendance_from || '', 
                    to: e.attendance_to || '', 
                    units: e.level_units_earned || '', 
                    yearGraduated: e.year_graduated || '', 
                    honors: e.honors_received || ''
                })) || [],
                civilServiceEligibility: profile.eligibility?.map((e: any) => ({
                    type: e.eligibility_name || '', 
                    rating: e.rating || '', 
                    date: e.exam_date || '', 
                    licenseNumber: e.license_number || '', 
                    licenseValidUntil: e.license_valid_until || ''
                })) || [],
            });
        } catch (err) {
            console.error('Error fetching full profile:', err);
        } finally {
            setIsFullProfileLoading(false);
        }
    };

    const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, summary: { ...prev.summary, [name]: value } }));
    };

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
    };

    const updatePersonalInfoValue = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
    };

    const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, familyBackground: { ...prev.familyBackground, [name]: value } }));
    };

    const updateChildren = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newChildren = [...prev.familyBackground.children];
            newChildren[index] = { ...newChildren[index], [field]: value };
            return { ...prev, familyBackground: { ...prev.familyBackground, children: newChildren } };
        });
    };

    const updateEducation = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newEdu = [...prev.educationalBackground];
            newEdu[index] = { ...newEdu[index], [field]: value };
            return { ...prev, educationalBackground: newEdu };
        });
    };

    const updateEligibility = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newElig = [...prev.civilServiceEligibility];
            newElig[index] = { ...newElig[index], [field]: value };
            return { ...prev, civilServiceEligibility: newElig };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await updateEmployeeFullProfile(employee.id, formData);
            setIsSuccess(true);
            setTimeout(() => {
                router.refresh();
                onClose();
                setIsSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to update full profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !employee) return null;

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'summary', label: 'Summary', icon: Briefcase },
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'family', label: 'Family', icon: Users },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'eligibility', label: 'Eligibility', icon: Award },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-6xl h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between bg-white relative z-20">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600/10 rounded-2xl text-blue-600">
                                <Fingerprint size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personnel Record Evolution</h2>
                        </div>
                        <p className="text-slate-400 font-bold text-xs mt-1 lowercase tracking-widest pl-1">ID: {employee.employee_id} • Editing Comprehensive Profile</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-50 border-b border-slate-100 p-2 gap-1.5 mx-6 my-4 rounded-[2rem]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar relative">
                    {isFullProfileLoading ? (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
                            <div className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Record...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                            <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Record Updated</h3>
                            <p className="text-slate-500 font-bold mt-2">All PDS changes have been permanently synchronized.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 py-4">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                                    <ShieldAlert size={18} /> {error}
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="space-y-10">
                                    {/* Assignment details */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-blue-600 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment & Basic Data</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5 md:col-span-1"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Position Title</label><input name="positionTitle" value={formData.summary.positionTitle} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Classification</label><select name="classification" value={formData.summary.classification} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none"><option value="Teaching">Teaching</option><option value="Non-Teaching">Non-Teaching</option></select></div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Department</label>
                                                <select name="department" value={formData.summary.department} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none">
                                                    <option value="">Select Department</option>
                                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Item Number (Select Vacant)</label>
                                                <select name="itemNumber" value={formData.summary.itemNumber} onChange={handleSummaryChange} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl py-3 px-4 text-sm outline-none text-emerald-800 font-bold">
                                                    <option value={employee.item_number}>{employee.position_title} (Current)</option>
                                                    <option value="">— Transfer to Vacant —</option>
                                                    {vacantPositions.map(p => <option key={p.item_number} value={p.item_number}>{p.position_title} | SG{p.salary_grade} ({p.item_number})</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Salary Grade</label><input type="number" name="salaryGrade" value={formData.summary.salaryGrade} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Step</label><input type="number" name="step" value={formData.summary.step} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-emerald-600 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Chronology & Attribution</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Date Appointed</label><input type="date" name="appointmentDate" value={formData.summary.appointmentDate} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Last Promotion</label><input type="date" name="promotionDate" value={formData.summary.promotionDate} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Retirement</label><input type="date" name="retirementDate" value={formData.summary.retirementDate} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase text-red-700">Resigned On</label><input type="date" name="resignedDate" value={formData.summary.resignedDate} onChange={handleSummaryChange} className="w-full bg-red-50/50 border border-red-100 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Area Code</label><input name="areaCode" value={formData.summary.areaCode} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Area Type</label><input name="areaType" value={formData.summary.areaType} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">P/P/A Attribution</label><input name="ppaAttribution" value={formData.summary.ppaAttribution} onChange={handleSummaryChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none" /></div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div className="space-y-10">
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-blue-600 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Personal Information</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Surname</label><input name="lastName" value={formData.personalInfo.lastName} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">First Name</label><input name="firstName" value={formData.personalInfo.firstName} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Middle Name</label><input name="middleName" value={formData.personalInfo.middleName} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tighter">Place of Birth</label><input name="placeOfBirth" value={formData.personalInfo.placeOfBirth} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tighter">Civil Status</label>
                                                <select name="civilStatus" value={formData.personalInfo.civilStatus} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm">
                                                    <option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option><option value="Separated">Separated</option>
                                                </select>
                                            </div>
                                            <PdsSelect label="Citizenship" name="citizenship" value={formData.personalInfo.citizenship} options={dropVals.citizenships} onChange={updatePersonalInfoValue} />
                                            <PdsSelect label="Blood Type" name="bloodType" value={formData.personalInfo.bloodType} options={dropVals.bloodTypes} onChange={updatePersonalInfoValue} />
                                        </div>
                                    </section>

                                    <hr className="border-slate-100" />

                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-amber-500 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID Registration & Addresses</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">TIN</label><input name="tin" value={formData.personalInfo.tin} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">PhilHealth</label><input name="philhealth" value={formData.personalInfo.philhealth} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Pag-Ibig</label><input name="pagibig" value={formData.personalInfo.pagibig} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">UMID</label><input name="umid" value={formData.personalInfo.umid} onChange={handlePersonalInfoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                        </div>
                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                                            <h5 className="text-[10px] font-black uppercase text-slate-700 tracking-widest pl-1">Residential Address</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <input placeholder="Hse/Lot" name="resHouseNo" value={formData.personalInfo.resHouseNo} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm" />
                                                <input placeholder="Street" name="resStreet" value={formData.personalInfo.resStreet} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm" />
                                                <input placeholder="Subdivision" name="resSubdivision" value={formData.personalInfo.resSubdivision} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm" />
                                                <input placeholder="Barangay" name="resBarangay" value={formData.personalInfo.resBarangay} onChange={handlePersonalInfoChange} className="bg-white border-slate-200 rounded-xl py-2 px-3 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <PdsSelect label="City" name="resCity" value={formData.personalInfo.resCity} options={dropVals.cities} onChange={updatePersonalInfoValue} className="bg-white" />
                                                <PdsSelect label="Province" name="resProvince" value={formData.personalInfo.resProvince} options={dropVals.provinces} onChange={updatePersonalInfoValue} className="bg-white" />
                                                <PdsSelect label="Zip Code" name="resZipCode" value={formData.personalInfo.resZipCode} options={dropVals.zipCodes} onChange={updatePersonalInfoValue} className="bg-white" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'family' && (
                                <div className="space-y-10">
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-pink-500 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spouse & Parents Information</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Spouse Surname</label><input name="spouseSurname" value={formData.familyBackground.spouseSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Spouse First Name</label><input name="spouseFirstName" value={formData.familyBackground.spouseFirstName} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5 md:col-span-2"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Spouse Occupation</label><input name="spouseOccupation" value={formData.familyBackground.spouseOccupation} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Father Surname</label><input name="fatherSurname" value={formData.familyBackground.fatherSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">Mother Maiden Surname</label><input name="motherSurname" value={formData.familyBackground.motherSurname} onChange={handleFamilyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" /></div>
                                            <div className="space-y-1.5 flex items-end">
                                                <button onClick={() => setFormData(p => ({ ...p, familyBackground: { ...p.familyBackground, children: [...p.familyBackground.children, { name: '', birthDate: '' }] } }))} type="button" className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all">+ Add Child Registry Entry</button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.familyBackground.children.map((child, i) => (
                                                <div key={i} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                    <input placeholder="Child full name" value={child.name} onChange={(e) => updateChildren(i, 'name', e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                                                    <input type="date" value={child.birthDate} onChange={(e) => updateChildren(i, 'birthDate', e.target.value)} className="w-48 bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                                                    <button type="button" onClick={() => setFormData(p => ({ ...p, familyBackground: { ...p.familyBackground, children: p.familyBackground.children.filter((_, idx) => idx !== i) } }))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'education' && (
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-blue-600 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Educational Attainment History</h4></div>
                                        <button onClick={() => setFormData(p => ({ ...p, educationalBackground: [...p.educationalBackground, { level: '', schoolName: '', degree: '', from: '', to: '', units: '', yearGraduated: '', honors: '' }] }))} type="button" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest"><Plus size={14} /> Add Education level</button>
                                    </div>
                                    <div className="space-y-8">
                                        {formData.educationalBackground.map((edu, i) => (
                                            <div key={i} className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-900/5">
                                                <button onClick={() => setFormData(p => ({ ...p, educationalBackground: p.educationalBackground.filter((_, idx) => idx !== i) }))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                                    <PdsSelect label="Level" name="level" value={edu.level} options={dropVals.eduLevels} onChange={(_, v) => updateEducation(i, 'level', v)} className="bg-white" />
                                                    <PdsSelect label="School Name" name="schoolName" value={edu.schoolName} options={dropVals.schools} onChange={(_, v) => updateEducation(i, 'schoolName', v)} className="md:col-span-2 bg-white" />
                                                    <PdsSelect label="Degree/Course" name="degree" value={edu.degree} options={dropVals.degrees} onChange={(_, v) => updateEducation(i, 'degree', v)} className="bg-white" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                                    <PdsSelect label="From" name="from" value={edu.from} options={dropVals.yearsFrom} onChange={(_, v) => updateEducation(i, 'from', v)} placeholder="Year" className="bg-white" />
                                                    <PdsSelect label="To" name="to" value={edu.to} options={dropVals.yearsTo} onChange={(_, v) => updateEducation(i, 'to', v)} placeholder="Year" className="bg-white" />
                                                    <PdsSelect label="Units Earned" name="units" value={edu.units} options={dropVals.units} onChange={(_, v) => updateEducation(i, 'units', v)} className="bg-white" />
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Year Graduated</label><input placeholder="YYYY" value={edu.yearGraduated} onChange={(e) => updateEducation(i, 'yearGraduated', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm outline-none" /></div>
                                                    <PdsSelect label="Honors" name="honors" value={edu.honors} options={dropVals.honors} onChange={(_, v) => updateEducation(i, 'honors', v)} className="bg-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'eligibility' && (
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3"><div className="h-1.5 w-8 bg-emerald-600 rounded-full" /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Civil Service & Board Eligibility</h4></div>
                                        <button onClick={() => setFormData(p => ({ ...p, civilServiceEligibility: [...p.civilServiceEligibility, { type: '', rating: '', date: '', licenseNumber: '', licenseValidUntil: '' }] }))} type="button" className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest"><Plus size={14} /> Add Record</button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.civilServiceEligibility.map((elig, i) => (
                                            <div key={i} className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 flex gap-8 items-start relative group">
                                                <button onClick={() => setFormData(p => ({ ...p, civilServiceEligibility: p.civilServiceEligibility.filter((_, idx) => idx !== i) }))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                                                <div className="flex-1 grid grid-cols-2 gap-6">
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Eligibility Type</label><input placeholder="RA 1080 (Teacher)" value={elig.type} onChange={(e) => updateEligibility(i, 'type', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none shadow-sm" /></div>
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Rating</label><input placeholder="85.40%" value={elig.rating} onChange={(e) => updateEligibility(i, 'rating', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none shadow-sm" /></div>
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Exam Date</label><input type="date" value={elig.date} onChange={(e) => updateEligibility(i, 'date', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none shadow-sm" /></div>
                                                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase ml-1">License No.</label><input value={elig.licenseNumber} onChange={(e) => updateEligibility(i, 'licenseNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none shadow-sm font-mono tracking-widest" /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-10 py-7 bg-white border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-20">
                    <div className="flex gap-3">
                        {activeTab !== 'summary' && (
                            <button 
                                onClick={() => {
                                    const curr = tabs.findIndex(t => t.id === activeTab);
                                    if (curr > 0) setActiveTab(tabs[curr-1].id);
                                }}
                                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 border border-slate-100 transition-all font-mono"
                            >
                                <ChevronLeft size={16} /> Return Back
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Dismiss</button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isLoading || isFullProfileLoading}
                            className="flex items-center gap-3 px-16 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-blue-700 hover:bg-blue-800 shadow-2xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 min-w-[240px]"
                        >
                            {isLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            {isLoading ? 'Syncing Record...' : 'Complete Synchronization'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
