import { createClient } from '@/utils/supabase/server';
import DashboardClient from './DashboardClient';
import { Users, GraduationCap } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('*');

    if (error) {
        console.error('Error fetching dashboard data:', error);
        return <div>Error loading dashboard.</div>;
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    const activeEmployeesList = employees.filter(e => {
        const isDeceased = e.is_deceased === true;
        const hasResigned = e.resigned_date && new Date(e.resigned_date) <= now;
        const hasTransferred = e.transferred_date && new Date(e.transferred_date) <= now;
        const hasRetired = e.retirement_date && new Date(e.retirement_date) <= now;
        return !isDeceased && !hasResigned && !hasTransferred && !hasRetired;
    });

    const totalEmployeesCount = activeEmployeesList.length;

    const teachingStaff = activeEmployeesList.filter(e =>
        (e.position_classification || e.classification || '').toLowerCase() === 'teaching'
    ).length;

    const nonTeachingStaff = totalEmployeesCount - teachingStaff;

    const retiringCount = employees.filter(e => {
        if (!e.birthdate || e.is_deceased) return false;
        let targetRetirementDate: Date;
        if (e.retirement_date) {
            targetRetirementDate = new Date(e.retirement_date);
        } else {
            targetRetirementDate = new Date(e.birthdate);
            targetRetirementDate.setFullYear(targetRetirementDate.getFullYear() + 65);
        }
        const threeYearsFromNow = new Date();
        threeYearsFromNow.setFullYear(threeYearsFromNow.getFullYear() + 3);
        return targetRetirementDate > now && targetRetirementDate <= threeYearsFromNow;
    }).length;

    // 3. Attrition This Year (People who left or ARE leaving this year)
    const attritionCount = employees.filter(e => {
        const checkYear = (dateStr: string | null) => dateStr && new Date(dateStr).getFullYear() === currentYear;
        return checkYear(e.retirement_date) || checkYear(e.resigned_date) || checkYear(e.transferred_date) || (e.is_deceased && new Date(e.updated_at).getFullYear() === currentYear);
    }).length;

    const stats = [
        {
            label: 'Total Employees',
            value: totalEmployeesCount,
            change: 'Active personnel',
            color: 'blue',
            icon: <Users className="h-6 w-6 text-blue-600" />
        },
        {
            label: 'Total Teaching Staff',
            value: teachingStaff,
            change: 'Faculty members',
            color: 'indigo',
            icon: <GraduationCap className="h-6 w-6 text-indigo-600" />
        },
        {
            label: 'Total Non-Teaching',
            value: nonTeachingStaff,
            change: 'Admin & Support',
            color: 'amber',
            icon: <Users className="h-6 w-6 text-amber-600" />
        },
        {
            label: 'Retiring in 3 Years',
            value: retiringCount.toString().padStart(2, '0'),
            change: 'Personnel projections',
            color: 'orange',
            icon: <Users className="h-6 w-6 text-orange-600" />
        },
        {
            label: 'Attrition This Year',
            value: attritionCount.toString().padStart(2, '0'),
            change: `Total exits in ${currentYear}`,
            color: 'red',
            icon: <Users className="h-6 w-6 text-red-600" />
        },
    ];

    const uniqueDepts = Array.from(new Set(activeEmployeesList.map(e => e.department || e.dept).filter(Boolean)));
    const deptData = uniqueDepts.map(dept => ({
        name: dept,
        count: activeEmployeesList.filter(e => (e.department || e.dept) === dept).length
    })).sort((a, b) => b.count - a.count).slice(0, 7);

    // Age Distribution
    const ageGroups = { '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
    activeEmployeesList.forEach(e => {
        if (!e.birthdate) return;
        const bDate = new Date(e.birthdate);
        const age = now.getFullYear() - bDate.getFullYear();
        if (age >= 20 && age <= 29) ageGroups['20-29']++;
        else if (age >= 30 && age <= 39) ageGroups['30-39']++;
        else if (age >= 40 && age <= 49) ageGroups['40-49']++;
        else if (age >= 50 && age <= 59) ageGroups['50-59']++;
        else if (age >= 60) ageGroups['60+']++;
    });
    const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

    const maleCount = activeEmployeesList.filter(e => (e.sex || e.gender) === 'Male').length;
    const femaleCount = activeEmployeesList.filter(e => (e.sex || e.gender) === 'Female').length;
    const genderData = [
        { name: 'Male', value: maleCount, color: '#3b82f6' },
        { name: 'Female', value: femaleCount, color: '#ec4899' },
    ].filter(d => d.value > 0);

    // 1. Hiring Trend
    const hiresByYear: Record<number, number> = {};
    activeEmployeesList.forEach(e => {
        if (!e.hired_date) return;
        const year = new Date(e.hired_date).getFullYear();
        hiresByYear[year] = (hiresByYear[year] || 0) + 1;
    });
    const hiringTrendData = Object.keys(hiresByYear).sort().map(year => ({
        year: year,
        hires: hiresByYear[Number(year)]
    }));

    // 2. Separation Trend (Resignations, Retirements, Transfers, Deaths)
    const separationsByYear: Record<number, { resignations: number; retirements: number; transfers: number; deceased: number }> = {};
    employees.forEach(e => {
        const checkAndAdd = (dateStr: string | null, type: 'resignations' | 'retirements' | 'transfers') => {
            if (!dateStr) return;
            const year = new Date(dateStr).getFullYear();
            if (!separationsByYear[year]) separationsByYear[year] = { resignations: 0, retirements: 0, transfers: 0, deceased: 0 };
            separationsByYear[year][type]++;
        };

        checkAndAdd(e.resigned_date, 'resignations');
        checkAndAdd(e.retirement_date, 'retirements');
        checkAndAdd(e.transferred_date, 'transfers');

        if (e.is_deceased) {
            const year = new Date(e.updated_at).getFullYear();
            if (!separationsByYear[year]) separationsByYear[year] = { resignations: 0, retirements: 0, transfers: 0, deceased: 0 };
            separationsByYear[year].deceased++;
        }
    });
    const separationTrendData = Object.keys(separationsByYear).sort().map(year => ({
        year: year,
        resignations: separationsByYear[Number(year)].resignations,
        retirements: separationsByYear[Number(year)].retirements,
        transfers: separationsByYear[Number(year)].transfers,
        deceased: separationsByYear[Number(year)].deceased
    }));

    // 3. Compliance Dashboard
    const complianceMetrics = { 'Pag-IBIG': 0, 'PhilHealth': 0, 'GSIS': 0, 'TIN': 0 };
    activeEmployeesList.forEach(e => {
        if (!e.pagibig_number) complianceMetrics['Pag-IBIG']++;
        if (!e.philhealth_number) complianceMetrics['PhilHealth']++;
        if (!e.gsis_number) complianceMetrics['GSIS']++;
        if (!e.tin) complianceMetrics['TIN']++;
    });
    const complianceData = Object.entries(complianceMetrics).map(([name, count]) => ({ name, count }));

    return (
        <DashboardClient
            stats={stats}
            deptData={deptData}
            ageData={ageData}
            genderData={genderData}
            hiringTrendData={hiringTrendData}
            separationTrendData={separationTrendData}
            complianceData={complianceData}
        />
    );
}
