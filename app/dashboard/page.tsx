import { createClient } from '@/utils/supabase/server';
import DashboardClient from './DashboardClient';
import { Users, GraduationCap, ShieldAlert, UserPlus, UserX, Skull, Briefcase } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch employees and positions in parallel
    const [{ data: employees, error }, { data: positions, error: posError }] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('positions').select('item_number, is_active'),
    ]);

    if (error || posError) {
        console.error('Error fetching dashboard data:', error || posError);
        return <div>Error loading dashboard.</div>;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const allEmployees = employees ?? [];
    const allPositions = positions ?? [];

    // -------------------------
    // Active Employees
    // -------------------------
    const activeEmployeesList = allEmployees.filter(e => {
        const isDeceased = e.is_deceased === true;
        const hasResigned = e.resigned_date && new Date(e.resigned_date) <= now;
        const hasRetired = e.retirement_date && new Date(e.retirement_date) <= now;
        return !isDeceased && !hasResigned && !hasRetired;
    });

    const totalEmployeesCount = activeEmployeesList.length;

    // -------------------------
    // KPI: Vacant Positions
    // -------------------------
    // A position is "vacant" if it is active and no currently-active employee holds its item_number
    const activeItemNumbers = new Set(
        activeEmployeesList.map(e => e.item_number).filter(Boolean)
    );
    const activePositions = allPositions.filter(p => p.is_active !== false);
    const vacantPositionsCount = activePositions.filter(
        p => !activeItemNumbers.has(p.item_number)
    ).length;
    const totalPositionsCount = activePositions.length;

    // -------------------------
    // KPI: License Expiring This Year
    // -------------------------
    const licenseExpiringCount = activeEmployeesList.filter(e => {
        if (!e.license_expiration_date) return false;
        return new Date(e.license_expiration_date).getFullYear() === currentYear;
    }).length;

    // -------------------------
    // KPI: Retiring This Year
    // -------------------------
    const retiringThisYearCount = allEmployees.filter(e => {
        if (e.is_deceased) return false;
        if (e.retirement_date) {
            return new Date(e.retirement_date).getFullYear() === currentYear;
        }
        if (e.birthdate) {
            return (currentYear - new Date(e.birthdate).getFullYear()) === 65;
        }
        return false;
    }).length;

    // -------------------------
    // KPI: Newly Hired This Year
    // -------------------------
    const newlyHiredCount = allEmployees.filter(e => {
        if (!e.original_appointment_date) return false;
        return new Date(e.original_appointment_date).getFullYear() === currentYear;
    }).length;

    // -------------------------
    // KPI: Deceased
    // -------------------------
    const deceasedCount = allEmployees.filter(e => e.is_deceased === true).length;

    // -------------------------
    // Classification counts
    // -------------------------
    const teachingCount = activeEmployeesList.filter(e =>
        (e.classification || '').toLowerCase() === 'teaching'
    ).length;
    const nonTeachingCount = totalEmployeesCount - teachingCount;

    // -------------------------
    // Stats Cards
    // -------------------------
    const stats = [
        {
            label: 'Total Active Employees',
            value: totalEmployeesCount,
            change: 'Currently active personnel',
            color: 'blue',
            icon: <Users className="h-6 w-6 text-blue-600" />,
        },
        {
            label: 'Vacant Positions',
            value: `${vacantPositionsCount} / ${totalPositionsCount}`,
            change: 'Unfilled plantilla slots',
            color: 'violet',
            icon: <Briefcase className="h-6 w-6 text-violet-600" />,
        },
        {
            label: 'License Expiring',
            value: licenseExpiringCount.toString().padStart(2, '0'),
            change: `Expiring in ${currentYear}`,
            color: 'amber',
            icon: <ShieldAlert className="h-6 w-6 text-amber-600" />,
        },
        {
            label: 'Retiring This Year',
            value: retiringThisYearCount.toString().padStart(2, '0'),
            change: `Retiring in ${currentYear}`,
            color: 'rose',
            icon: <UserX className="h-6 w-6 text-rose-600" />,
        },
        {
            label: 'Newly Hired',
            value: newlyHiredCount.toString().padStart(2, '0'),
            change: `Appointed in ${currentYear}`,
            color: 'emerald',
            icon: <UserPlus className="h-6 w-6 text-emerald-600" />,
        },
        {
            label: 'Deceased',
            value: deceasedCount.toString().padStart(2, '0'),
            change: 'On record',
            color: 'slate',
            icon: <Skull className="h-6 w-6 text-slate-500" />,
        },
        {
            label: 'Teaching / Non-Teaching',
            value: `${teachingCount} / ${nonTeachingCount}`,
            change: 'Classification headcount',
            color: 'indigo',
            icon: <GraduationCap className="h-6 w-6 text-indigo-600" />,
        },
    ];

    // -------------------------
    // Chart: Employees per Department
    // -------------------------
    const uniqueDepts = Array.from(new Set(activeEmployeesList.map(e => e.department).filter(Boolean)));
    const deptData = uniqueDepts.map(dept => ({
        name: dept,
        count: activeEmployeesList.filter(e => e.department === dept).length
    })).sort((a, b) => b.count - a.count).slice(0, 8);

    // -------------------------
    // Chart: Age Distribution
    // -------------------------
    const ageGroups: Record<string, number> = { '20–29': 0, '30–39': 0, '40–49': 0, '50–59': 0, '60+': 0 };
    activeEmployeesList.forEach(e => {
        if (!e.birthdate) return;
        const age = currentYear - new Date(e.birthdate).getFullYear();
        if (age >= 20 && age <= 29) ageGroups['20–29']++;
        else if (age >= 30 && age <= 39) ageGroups['30–39']++;
        else if (age >= 40 && age <= 49) ageGroups['40–49']++;
        else if (age >= 50 && age <= 59) ageGroups['50–59']++;
        else if (age >= 60) ageGroups['60+']++;
    });
    const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

    // -------------------------
    // Chart: Gender Distribution
    // -------------------------
    const maleCount = activeEmployeesList.filter(e => e.sex === 'Male').length;
    const femaleCount = activeEmployeesList.filter(e => e.sex === 'Female').length;
    const genderData = [
        { name: 'Male', value: maleCount, color: '#3b82f6' },
        { name: 'Female', value: femaleCount, color: '#ec4899' },
    ].filter(d => d.value > 0);

    // -------------------------
    // Chart: Employment Status Pie
    // -------------------------
    const statusCounts: Record<string, number> = {};
    activeEmployeesList.forEach(e => {
        const s = e.status || 'Unknown';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const STATUS_COLORS = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#64748b'];
    const statusData = Object.entries(statusCounts)
        .map(([name, value], i) => ({ name, value, color: STATUS_COLORS[i % STATUS_COLORS.length] }))
        .sort((a, b) => b.value - a.value);

    // -------------------------
    // Chart: Classification Donut
    // -------------------------
    const classificationCounts: Record<string, number> = {};
    activeEmployeesList.forEach(e => {
        const c = e.classification || 'Unknown';
        classificationCounts[c] = (classificationCounts[c] || 0) + 1;
    });
    const CLASSIFICATION_COLORS = ['#1d4ed8', '#4f46e5', '#0891b2', '#64748b'];
    const classificationData = Object.entries(classificationCounts)
        .map(([name, value], i) => ({ name, value, color: CLASSIFICATION_COLORS[i % CLASSIFICATION_COLORS.length] }))
        .sort((a, b) => b.value - a.value);

    // -------------------------
    // Chart: Hiring Trend (Line)
    // -------------------------
    const hiresByYear: Record<number, number> = {};
    activeEmployeesList.forEach(e => {
        if (!e.original_appointment_date) return;
        const year = new Date(e.original_appointment_date).getFullYear();
        hiresByYear[year] = (hiresByYear[year] || 0) + 1;
    });
    const hiringTrendData = Object.keys(hiresByYear)
        .map(Number)
        .sort()
        .map(year => ({ year: String(year), hires: hiresByYear[year] }));

    // -------------------------
    // Chart: Retirement Forecast (Bar) — next 5 years
    // -------------------------
    const retirementForecast: Record<number, number> = {};
    for (let y = currentYear; y <= currentYear + 4; y++) {
        retirementForecast[y] = 0;
    }
    allEmployees.forEach(e => {
        if (e.is_deceased) return;
        let retYear: number | null = null;
        if (e.retirement_date) {
            retYear = new Date(e.retirement_date).getFullYear();
        } else if (e.birthdate) {
            retYear = new Date(e.birthdate).getFullYear() + 65;
        }
        if (retYear !== null && retYear >= currentYear && retYear <= currentYear + 4) {
            retirementForecast[retYear]++;
        }
    });
    const retirementForecastData = Object.entries(retirementForecast).map(([year, count]) => ({
        year: String(year),
        count,
    }));

    // -------------------------
    // Chart: Separation Trend (Line)
    // -------------------------
    const separationsByYear: Record<number, { resignations: number; retirements: number; deceased: number }> = {};
    allEmployees.forEach(e => {
        const addToYear = (dateStr: string | null, type: 'resignations' | 'retirements') => {
            if (!dateStr) return;
            const year = new Date(dateStr).getFullYear();
            if (!separationsByYear[year]) separationsByYear[year] = { resignations: 0, retirements: 0, deceased: 0 };
            separationsByYear[year][type]++;
        };
        addToYear(e.resigned_date, 'resignations');
        addToYear(e.retirement_date, 'retirements');
        if (e.is_deceased) {
            const year = new Date(e.updated_at).getFullYear();
            if (!separationsByYear[year]) separationsByYear[year] = { resignations: 0, retirements: 0, deceased: 0 };
            separationsByYear[year].deceased++;
        }
    });
    const separationTrendData = Object.keys(separationsByYear)
        .map(Number)
        .sort()
        .map(year => ({
            year: String(year),
            resignations: separationsByYear[year].resignations,
            retirements: separationsByYear[year].retirements,
            deceased: separationsByYear[year].deceased,
        }));

    return (
        <DashboardClient
            stats={stats}
            deptData={deptData}
            ageData={ageData}
            genderData={genderData}
            statusData={statusData}
            classificationData={classificationData}
            hiringTrendData={hiringTrendData}
            retirementForecastData={retirementForecastData}
            separationTrendData={separationTrendData}
        />
    );
}
