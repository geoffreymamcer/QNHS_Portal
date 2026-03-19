'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Filter, ChevronRight, User, X, FileText, Download, DollarSign } from 'lucide-react';
import AddApplicantModal from './AddApplicantModal';
import AddSalaryGradeModal from './AddSalaryGradeModal'; // New Modal
import { getApplicants } from './actions';
import { getSalaryGrades } from './salary-actions'; // New Actions
import { generateIERPDF } from './utils/ierPdfGenerator';

export default function RankingsPage() {
    const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false); // New State
    const [applicants, setApplicants] = useState<any[]>([]);
    const [salaryGrades, setSalaryGrades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchSalaryGrades();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getApplicants();
            setApplicants(data || []);
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
        let position = batch.positions.find((p: any) => p.title === posName);
        if (!position) {
            position = {
                title: posName,
                applicants: []
            };
            batch.positions.push(position);
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

    const getQualificationStandards = (pos: string) => {
        const title = pos.toLowerCase();
        
        // Baseline for Teacher III (as requested)
        const commonTS = {
            education: "Bachelor’s degree; or bachelor’s degree in relevant subjects, or learning area with atleast 18 professional units in Education",
            training: "16 hours of training in any of or a cumulative of the following: curriculum, pedagogy, subject specialization, acquired within the last 5 years.",
            experience: "2 years of teaching experience",
            eligibility: "RA1080 as amended (Teacher - Secondary)"
        };

        if (title.includes('master teacher')) {
            return {
                education: "Master's degree in Education or its equivalent",
                training: "12 hours of relevant training",
                experience: "2 years as Teacher III or 2 years as MT-I (for MT-II)",
                eligibility: "RA 1080 (Teacher)"
            };
        }

        if (title.includes('head teacher')) {
            return {
                education: "Bachelor's degree in Secondary Education; or Bachelor's degree w/ 18 professional units in Education with appropriate field of specialization",
                training: "24 hours of relevant training",
                experience: "HT-I: TIC for 1 yr; or Teacher for 3 yrs",
                eligibility: "RA 1080 (Teacher)"
            };
        }

        if (title.includes('teacher i')) {
            return {
                education: "Bachelor's degree in Secondary Education or any Bachelor's degree with 18 professional units in Education",
                training: "None required",
                experience: "None required",
                eligibility: "RA 1080 (Teacher)"
            };
        }

        if (title.includes('teacher ii')) {
            return {
                education: "Bachelor's degree in Secondary Education or equivalent",
                training: "None required",
                experience: "1 year of relevant experience",
                eligibility: "RA 1080 (Teacher)"
            };
        }

        // Default or Teacher III
        return commonTS;
    };

    const handleGenerateReport = (batch: any, pos: any, action: 'view' | 'download') => {
        // Find salary info for this position
        const salaryInfo = salaryGrades.find(sg => sg.position_title.toLowerCase() === pos.title.toLowerCase());

        generateIERPDF({
            hiringDate: batch.hiringDate,
            position: pos.title,
            salaryGrade: salaryInfo ? `${salaryInfo.grade}` : 'To be determined',
            monthlySalary: salaryInfo ? `PHP ${salaryInfo.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'PHP 0.00',
            qs: getQualificationStandards(pos.title),
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
                        onClick={() => setIsSalaryModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <DollarSign size={20} className="text-blue-600" />
                        Salary Grades
                    </button>
                    <button
                        onClick={() => setIsApplicantModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        New Evaluation
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
                                                    <h3 className="font-bold text-slate-900 tracking-tight">{pos.title}</h3>
                                                    <p className="text-xs text-slate-400 font-medium">{pos.applicants.length} Applicants</p>
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
                                                                    <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover/item:opacity-100">
                                                                        <ChevronRight size={20} />
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
            <AddApplicantModal isOpen={isApplicantModalOpen} onClose={() => {
                setIsApplicantModalOpen(false);
                fetchData();
            }} />
            
            <AddSalaryGradeModal isOpen={isSalaryModalOpen} onClose={() => {
                setIsSalaryModalOpen(false);
                fetchSalaryGrades(); // Refresh salary grade lookup
            }} />
        </div>
    );
}
