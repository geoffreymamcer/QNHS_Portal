'use client';

import React from 'react';
import {
    Users,
    BarChart3,
    ShieldCheck,
    CalendarRange,
    Wallet,
    Map,
    PieChart,
    UserCheck,
    Scale,
    Activity,
    Stethoscope,
    FileCheck
} from 'lucide-react';
import ReportCard from './ReportCard';
import { getWorkforceSummary, getStaffingDistribution, getEmploymentStatusSummary, getSalaryExpenditure, getPositionSGDistribution, getLicenseCompliance, getCSDistribution, getVacancyTracking, getAgeDemographics, getRetirementProjection, getWorkforceMovement } from './actions';
import { generateWorkforcePDF, generateStaffingPDF, generateStatusPDF, generateSalaryPDF, generatePositionSGPDF, generateLicensePDF, generateCSPDF, generateVacancyPDF, generateAgePDF, generateRetirementPDF, generateMovementPDF } from './utils/pdfGenerator';

export default function ReportsPage() {
    const handleWorkforce = async (action: 'download' | 'view') => {
        try {
            const data = await getWorkforceSummary();
            generateWorkforcePDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleStaffing = async (action: 'download' | 'view') => {
        try {
            const data = await getStaffingDistribution();
            generateStaffingPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleStatus = async (action: 'download' | 'view') => {
        try {
            const data = await getEmploymentStatusSummary();
            generateStatusPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleSalary = async (action: 'download' | 'view') => {
        try {
            const data = await getSalaryExpenditure();
            generateSalaryPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handlePositionSG = async (action: 'download' | 'view') => {
        try {
            const data = await getPositionSGDistribution();
            generatePositionSGPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleLicense = async (action: 'download' | 'view') => {
        try {
            const data = await getLicenseCompliance();
            generateLicensePDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleCS = async (action: 'download' | 'view') => {
        try {
            const data = await getCSDistribution();
            generateCSPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleVacancy = async (action: 'download' | 'view') => {
        try {
            const data = await getVacancyTracking();
            generateVacancyPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleAge = async (action: 'download' | 'view') => {
        try {
            const data = await getAgeDemographics();
            generateAgePDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleRetirement = async (action: 'download' | 'view') => {
        try {
            const data = await getRetirementProjection();
            generateRetirementPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    const handleMovement = async (action: 'download' | 'view') => {
        try {
            const data = await getWorkforceMovement();
            generateMovementPDF(data, action);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${action} report. Please try again.`);
        }
    };

    return (
        <div className="space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-blue-950 tracking-tight">Institutional Reports</h1>
                <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">
                    Access aggregated workforce intelligence and statistical summaries. These reports are designed for organizational planning and government compliance.
                </p>
            </div>

            {/* Category 1: Organizational Overview */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">Organizational Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        title="Workforce Summary"
                        description="Top management overview of total counts, gender ratios, average age, and total salary costs."
                        icon={<Users size={24} />}
                        lastGenerated="Today, 09:30 AM"
                        category="Organizational"
                        trend="+2.4% vs Last Month"
                        onDownload={() => handleWorkforce('download')}
                        onView={() => handleWorkforce('view')}
                    />
                    <ReportCard
                        title="Staffing Distribution"
                        description="Deployment breakdown by Department, Classification, and Level for planning and balancing."
                        icon={<BarChart3 size={24} />}
                        lastGenerated="Yesterday"
                        category="Organizational"
                        onDownload={() => handleStaffing('download')}
                        onView={() => handleStaffing('view')}
                    />
                    <ReportCard
                        title="Employment Status Summary"
                        description="HR stability indicator showing counts of Permanent, Provisional, and Contractual staff."
                        icon={<UserCheck size={24} />}
                        lastGenerated="Mar 01, 2026"
                        category="Organizational"
                        isPriority
                        onDownload={() => handleStatus('download')}
                        onView={() => handleStatus('view')}
                    />
                </div>
            </section>

            {/* Category 2: Financial Reports */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-emerald-600 rounded-full" />
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">Financial Reports</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        title="Salary Expenditure Summary"
                        description="Total authorized vs actual salary costs by department and classification with variance tracking."
                        icon={<Wallet size={24} />}
                        lastGenerated="Today, 08:15 AM"
                        category="Financial"
                        trend="On Budget"
                        onDownload={() => handleSalary('download')}
                        onView={() => handleSalary('view')}
                    />
                    <ReportCard
                        title="Position & SG Distribution"
                        description="Inventory of position titles mapped to Salary Grades for budget review and promotion planning."
                        icon={<Scale size={24} />}
                        lastGenerated="Feb 28, 2026"
                        category="Financial"
                        onDownload={() => handlePositionSG('download')}
                        onView={() => handlePositionSG('view')}
                    />
                </div>
            </section>

            {/* Category 3: Compliance & Risk */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-amber-600 rounded-full" />
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">Compliance & Risk</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        title="License Compliance Summary"
                        description="Aggregated view of PRC and professional license health grouped by expiration years (2026-2030)."
                        icon={<ShieldCheck size={24} />}
                        lastGenerated="Mar 01, 2026"
                        category="Compliance"
                        isPriority
                        onDownload={() => handleLicense('download')}
                        onView={() => handleLicense('view')}
                    />
                    <ReportCard
                        title="CS Eligibility Distribution"
                        description="Workforce eligibility mapping (RA 1080, Professional, Sub-professional) for archival audits."
                        icon={<FileCheck size={24} />}
                        lastGenerated="Feb 15, 2026"
                        category="Compliance"
                        onDownload={() => handleCS('download')}
                        onView={() => handleCS('view')}
                    />
                    <ReportCard
                        title="Vacancy & Filled Position Tracking"
                        description="Plantilla health check comparing total items against filled and vacant slots."
                        icon={<Activity size={24} />}
                        lastGenerated="Just Now"
                        category="Compliance"
                        trend="Live Status"
                        onDownload={() => handleVacancy('download')}
                        onView={() => handleVacancy('view')}
                    />
                </div>
            </section>

            {/* Category 4: Planning & Demographics */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-purple-600 rounded-full" />
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">Planning & Demographics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        title="Age Demographics Analysis"
                        description="Workforce aging report grouped from Under 30 up to 60+ for succession planning."
                        icon={<PieChart size={24} />}
                        lastGenerated="Mar 02, 2026"
                        category="Planning"
                        onDownload={() => handleAge('download')}
                        onView={() => handleAge('view')}
                    />
                    <ReportCard
                        title="Retirement Projection Summary"
                        description="Aggregated forecast of expected retirees for the next 5-10 years based on birth records."
                        icon={<CalendarRange size={24} />}
                        lastGenerated="Mar 02, 2026"
                        category="Planning"
                        isPriority
                        onDownload={() => handleRetirement('download')}
                        onView={() => handleRetirement('view')}
                    />
                    <ReportCard
                        title="Workforce Movement Summary"
                        description="Statistical view of promotions, appointments, resignations, and retirements for the current fiscal year."
                        icon={<BarChart3 size={24} />}
                        lastGenerated="Mar 02, 2026"
                        category="Planning"
                        onDownload={() => handleMovement('download')}
                        onView={() => handleMovement('view')}
                    />
                </div>
            </section>
        </div>
    );
}
