'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Search, Filter, ChevronRight, User, X, FileText, Download, DollarSign, Award, Edit } from 'lucide-react';
import AddApplicantModal from './AddApplicantModal';
import AddSalaryGradeModal from './AddSalaryGradeModal'; // New Modal
import QualificationStandardsModal from './QualificationStandardsModal';
import { getApplicants, checkIsAdmin } from './actions';
import { getSalaryGrades } from './salary-actions'; // New Actions
import { generateIERPDF } from './utils/ierPdfGenerator';
import { getCombinedStandardsDb } from './qs-actions';

export default function RankingsPage() {
    const router = useRouter();
    const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false); // New State
    const [isQSModalOpen, setIsQSModalOpen] = useState(false);
    const [editingApplicant, setEditingApplicant] = useState<any | null>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [salaryGrades, setSalaryGrades] = useState<any[]>([]);
    const [qsStandards, setQsStandards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchData();
        fetchSalaryGrades();
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const admin = await checkIsAdmin();
            setIsAdmin(admin);
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getApplicants();
            setApplicants(data || []);
            
            const qs = await getCombinedStandardsDb();
            setQsStandards(qs || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSalaryGrades = async () => {
        try {
            const grades = await getSalaryGrades();
            setSalaryGrades(grades || []);
        } catch (error) {
            console.error('Salary grades fetch error:', error);
        }
    };

    const getQsForPosition = (title: string, level: string) => {
        const normalizedPos = title.trim().toLowerCase();
        const normalizedLevel = (level || 'Junior High School').trim();
        
        const exactMatch = qsStandards.find(s => 
            s.positionTitle.toLowerCase() === normalizedPos &&
            s.schoolLevel === normalizedLevel
        );
        if (exactMatch) return exactMatch;
        
        const titleMatch = qsStandards.find(s => 
            s.positionTitle.toLowerCase() === normalizedPos
        );
        if (titleMatch) return titleMatch;

        return {
            education: "Bachelor's degree in Education or equivalent with professional units",
            training: "None required",
            experience: "None required",
            eligibility: "RA 1080 (Teacher)"
        };
    };

    // Grouping Logic: Batch -> Position -> Applicants
    const groupedBatches = applicants.reduce((acc: any[], curr) => {
        const dateStr = new Date(curr.hiring_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        let batch = acc.find(b => b.hiringDate === dateStr);
        if (!batch) {
            batch = {
                batchId: `BATCH-${curr.hiring_date}`,
                hiringDate: dateStr,
                rawDate: curr.hiring_date,
                positions: []
            };
            acc.push(batch);
        }

        const posName = curr.applied_position || 'Unspecified Position';
        const level = curr.school_level || 'Junior High School';
        const key = `${posName} - ${level}`;

        let position = batch.positions.find((p: any) => p.key === key);
        if (!position) {
            position = {
                key,
                title: posName,
                level,
                salaryGrade: curr.salary_grade || null,
                salary: curr.salary || null,
                applicants: []
            };
            batch.positions.push(position);
        } else if (!position.salaryGrade && curr.salary_grade) {
            position.salaryGrade = curr.salary_grade;
            position.salary = curr.salary;
        }

        position.applicants.push(curr);
        return acc;
    }, []);

    const stats = {
        total: applicants.length,
        qualified: applicants.filter(a => a.status === 'Qualified').length,
        disqualified: applicants.filter(a => a.status === 'Disqualified').length,
        pending: applicants.filter(a => !a.status).length
    };

    const handleGenerateReport = (batch: any, pos: any, action: 'view' | 'download') => {
        if (!isAdmin) {
            router.push('/login');
            return;
        }

        // 1. Get salary info from position object (fetched from database via foreign keys)
        let grade = pos.salaryGrade;
        let salary = pos.salary;

        // 2. Fallback to salaryGrades array if not resolved directly on the position group
        if (!grade || !salary) {
            const fallback = salaryGrades.find(sg => 
                sg.position_title?.toLowerCase() === pos.title.toLowerCase() ||
                (sg as any).title?.toLowerCase() === pos.title.toLowerCase()
            );
            if (fallback) {
                grade = fallback.grade;
                salary = fallback.salary;
            }
        }

        // 3. Determine monthly salary (if database stored annual, divide by 12)
        let monthlyValue = salary || 0;
        if (monthlyValue > 100000) {
            monthlyValue = monthlyValue / 12;
        }

        generateIERPDF({
            hiringDate: batch.hiringDate,
            position: pos.title,
            schoolLevel: pos.level,
            salaryGrade: grade ? `${grade}` : 'To be determined',
            monthlySalary: monthlyValue > 0 
                ? `PHP ${monthlyValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                : 'PHP 0.00',
            qs: getQsForPosition(pos.title, pos.level),
            applicants: pos.applicants
        }, action);
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-blue-950 tracking-tight">Initial Evaluation Results</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">
                        Official registry of initial qualification assessments, performance evaluations, and applicant profiling.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (!isAdmin) {
                                router.push('/login');
                            } else {
                                setIsSalaryModalOpen(true);
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <DollarSign size={20} className="text-blue-600" />
                        Salary Grades
                    </button>
                    <button
                        onClick={() => {
                            if (!isAdmin) {
                                router.push('/login');
                            } else {
                                setIsQSModalOpen(true);
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Award size={20} className="text-blue-600" />
                        Qualification Standards
                    </button>
                    <button
                        onClick={() => setIsApplicantModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        New Applicant
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Evaluated', value: stats.total, icon: <Users size={20} />, color: 'blue' },
                    { label: 'Qualified', value: stats.qualified, icon: <User size={20} />, color: 'emerald' },
                    { label: 'Disqualified', value: stats.disqualified, icon: <X size={20} />, color: 'red' },
                    { label: 'Pending Assessment', value: stats.pending, icon: <Search size={20} />, color: 'amber' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                            stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                                    'bg-amber-50 text-amber-600'
                            }`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Batch List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">Evaluation Batches</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Plus size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                        <p className="text-sm font-bold text-slate-500">Sorted by: Hiring Date</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Loading applicants...</p>
                    </div>
                ) : groupedBatches.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] py-20 text-center">
                        <Users className="mx-auto text-slate-200" size={64} />
                        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-sm">No applicants found</p>
                        <button onClick={() => setIsApplicantModalOpen(true)} className="mt-6 text-blue-600 font-black hover:underline underline-offset-8">Register the first evaluation</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupedBatches.map((batch, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex items-center gap-4 px-4">
                                    <div className="px-4 py-2 bg-blue-950 text-white rounded-xl font-black text-sm shadow-lg">
                                        BATCH: {batch.hiringDate}
                                    </div>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>

                                {batch.positions.map((pos: any, j: number) => (
                                    <div key={j} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-200 transition-all shadow-sm">
                                        <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm italic font-black text-blue-600 text-[10px] uppercase border border-slate-100">
                                                    IER
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 tracking-tight">{pos.title}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                            pos.level?.includes('Senior') 
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                        }`}>
                                                            {pos.level === 'Senior High School' ? 'SHS' : 'JHS'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{pos.applicants.length} Applicants</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleGenerateReport(batch, pos, 'view')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                >
                                                    <FileText size={14} /> View IER
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateReport(batch, pos, 'download')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-sm transition-all"
                                                >
                                                    <Download size={14} /> Download PDF
                                                </button>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-slate-50">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead className="bg-slate-50 border-y border-slate-100">
                                                        <tr className="text-left">
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IES Number</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Age/Sex</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Performance</th>
                                                            <th className="px-6 py-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {pos.applicants.map((applicant: any) => (
                                                            <tr key={applicant.id} className="hover:bg-blue-50/30 transition-colors group/item">
                                                                <td className="px-6 py-4 font-bold text-slate-900">{applicant.ies_no}</td>
                                                                <td className="px-6 py-4 text-sm font-bold text-slate-500">{applicant.applicant_code}</td>
                                                                <td className="px-6 py-4 font-bold text-slate-900">{applicant.firstname} {applicant.surname}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-black text-slate-700">{applicant.age}y/o</span>
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{applicant.sex}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${applicant.status === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {applicant.status || 'Pending'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${applicant.performance === 'Met' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                                                        }`}>
                                                                        {applicant.performance || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => {
                                                                            const fullName = `${applicant.firstname} ${applicant.surname}`;
                                                                            if (window.confirm(`Are you ${fullName}?`)) {
                                                                                setEditingApplicant(applicant);
                                                                            }
                                                                        }}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-100 transition-all shadow-sm active:scale-95 border border-blue-100"
                                                                    >
                                                                        <Edit size={12} /> Edit
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddApplicantModal isOpen={isApplicantModalOpen || editingApplicant !== null} editingApplicant={editingApplicant} onClose={() => {
                setIsApplicantModalOpen(false);
                setEditingApplicant(null);
                fetchData();
            }} />

            {isAdmin && (
                <AddSalaryGradeModal isOpen={isSalaryModalOpen} onClose={() => {
                    setIsSalaryModalOpen(false);
                    fetchSalaryGrades(); // Refresh salary grade lookup
                }} />
            )}

            {isAdmin && (
                <QualificationStandardsModal isOpen={isQSModalOpen} onClose={() => {
                    setIsQSModalOpen(false);
                    fetchData(); // Refresh data to immediately reflect any updated qualification standards
                }} />
            )}
        </div>
    );
}
