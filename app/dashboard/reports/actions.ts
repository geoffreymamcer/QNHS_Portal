'use server';

import { createClient } from '@/utils/supabase/server';

export async function getWorkforceSummary() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('*');

    if (error) throw new Error(error.message);

    const total = employees.length;
    const teaching = employees.filter(e => e.classification === 'Teaching').length;
    const nonTeaching = employees.filter(e => e.classification === 'Non-Teaching').length;

    const permanent = employees.filter(e => e.status === 'Permanent').length;
    const nonPermanent = total - permanent;

    const male = employees.filter(e => e.sex === 'Male').length;
    const female = employees.filter(e => e.sex === 'Female').length;

    // Calculate Average Age
    const currentYear = new Date().getFullYear();
    const totalAge = employees.reduce((sum, e) => {
        if (!e.birthdate) return sum;
        const birthYear = new Date(e.birthdate).getFullYear();
        return sum + (currentYear - birthYear);
    }, 0);
    const averageAge = total > 0 ? (totalAge / employees.filter(e => e.birthdate).length).toFixed(1) : 0;

    // Total Salary Cost
    const totalSalaryCost = employees.reduce((sum, e) => sum + (Number(e.annual_salary_actual) || 0), 0);

    return {
        total,
        teaching,
        nonTeaching,
        permanent,
        nonPermanent,
        male,
        female,
        averageAge,
        totalSalaryCost,
        generatedAt: new Date().toLocaleString()
    };
}

export async function getStaffingDistribution() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('department, classification');

    if (error) throw new Error(error.message);

    const distribution: Record<string, { teaching: number; nonTeaching: number; total: number }> = {};

    employees.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        if (!distribution[dept]) {
            distribution[dept] = { teaching: 0, nonTeaching: 0, total: 0 };
        }

        if (emp.classification === 'Teaching') {
            distribution[dept].teaching++;
        } else if (emp.classification === 'Non-Teaching') {
            distribution[dept].nonTeaching++;
        }
        distribution[dept].total++;
    });

    // Convert to array and sort by Department name
    return Object.entries(distribution)
        .map(([name, stats]) => ({
            name,
            ...stats
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getEmploymentStatusSummary() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('status');

    if (error) throw new Error(error.message);

    const statusCounts: Record<string, number> = {
        'Permanent': 0,
        'Contractual': 0,
        'Casual': 0,
        'Job Order': 0,
        'Provisional': 0,
        'Others': 0
    };

    let total = 0;
    employees.forEach(emp => {
        const status = emp.status || 'Others';
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        } else {
            statusCounts['Others']++;
        }
        total++;
    });

    const results = Object.entries(statusCounts)
        .filter(([_, count]) => count > 0 || ['Permanent', 'Contractual'].includes(_)) // Keep core ones even if 0
        .map(([status, count]) => ({
            status,
            count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
        }));

    return {
        data: results,
        total,
        generatedAt: new Date().toLocaleString()
    };
}

export async function getSalaryExpenditure() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('department, annual_salary_authorized, annual_salary_actual');

    if (error) throw new Error(error.message);

    const expenditure: Record<string, { authorized: number; actual: number }> = {};

    employees.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        if (!expenditure[dept]) {
            expenditure[dept] = { authorized: 0, actual: 0 };
        }
        expenditure[dept].authorized += Number(emp.annual_salary_authorized) || 0;
        expenditure[dept].actual += Number(emp.annual_salary_actual) || 0;
    });

    return Object.entries(expenditure)
        .map(([dept, totals]) => ({
            department: dept,
            ...totals,
            variance: totals.authorized - totals.actual
        }))
        .sort((a, b) => a.department.localeCompare(b.department));
}

export async function getPositionSGDistribution() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('position_title, salary_grade');

    if (error) throw new Error(error.message);

    const distribution: Record<string, { sg: string; count: number }> = {};

    employees.forEach(emp => {
        const key = `${emp.position_title}|${emp.salary_grade}`;
        if (!distribution[key]) {
            distribution[key] = {
                sg: emp.salary_grade ? `SG-${emp.salary_grade}` : 'N/A',
                count: 0
            };
        }
        distribution[key].count++;
    });

    return Object.entries(distribution)
        .map(([key, stats]) => ({
            position: key.split('|')[0] || 'Unassigned',
            ...stats
        }))
        .sort((a, b) => {
            // Sort by SG primarily, then position name
            const sgA = parseInt(a.sg.replace(/\D/g, '')) || 0;
            const sgB = parseInt(b.sg.replace(/\D/g, '')) || 0;
            if (sgB !== sgA) return sgB - sgA; // Highest SG first
            return a.position.localeCompare(b.position);
        });
}

export async function getLicenseCompliance() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('license_expiration_date, first_name, last_name, position_title');

    if (error) throw new Error(error.message);

    const currentYear = new Date().getFullYear();
    const stats: Record<string, { total: number; names: string[] }> = {};

    // Initialize years
    [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4].forEach(y => {
        stats[y.toString()] = { total: 0, names: [] };
    });
    stats['Beyond'] = { total: 0, names: [] };
    stats['None/Expired'] = { total: 0, names: [] };

    employees.forEach(emp => {
        if (!emp.license_expiration_date) {
            stats['None/Expired'].total++;
            return;
        }

        const expDate = new Date(emp.license_expiration_date);
        const expYear = expDate.getFullYear();

        if (expDate < new Date()) {
            stats['None/Expired'].total++;
        } else if (expYear >= currentYear && expYear <= currentYear + 4) {
            stats[expYear.toString()].total++;
            if (stats[expYear.toString()].names.length < 3) {
                stats[expYear.toString()].names.push(`${emp.first_name} ${emp.last_name}`);
            }
        } else {
            stats['Beyond'].total++;
        }
    });

    return {
        data: Object.entries(stats).map(([year, info]) => ({
            year,
            count: info.total,
            sampleNames: info.names.join(', ')
        })),
        generatedAt: new Date().toLocaleString()
    };
}

export async function getCSDistribution() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('civil_service_eligibility');

    if (error) throw new Error(error.message);

    const distribution: Record<string, number> = {};

    employees.forEach(emp => {
        const eligibility = emp.civil_service_eligibility || 'None/Not Specified';
        distribution[eligibility] = (distribution[eligibility] || 0) + 1;
    });

    return Object.entries(distribution)
        .map(([type, count]) => ({
            type,
            count
        }))
        .sort((a, b) => b.count - a.count);
}

export async function getVacancyTracking() {
    const supabase = await createClient();

    // Fetch all active positions
    const { data: positions, error: posError } = await supabase
        .from('positions')
        .select('item_number, position_title, department, classification')
        .eq('is_active', true);

    if (posError) throw new Error(posError.message);

    // Fetch all filled item numbers from employees
    const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('item_number')
        .not('item_number', 'is', null);

    if (empError) throw new Error(empError.message);

    const filledItems = new Set(employees.map(emp => emp.item_number));
    const deptStats: Record<string, { total: number; filled: number; vacant: number }> = {};

    positions.forEach(pos => {
        const dept = pos.department || 'Unassigned';
        if (!deptStats[dept]) {
            deptStats[dept] = { total: 0, filled: 0, vacant: 0 };
        }

        deptStats[dept].total++;
        if (filledItems.has(pos.item_number)) {
            deptStats[dept].filled++;
        } else {
            deptStats[dept].vacant++;
        }
    });

    return Object.entries(deptStats)
        .map(([dept, stats]) => ({
            department: dept,
            ...stats,
            occupancyRate: stats.total > 0 ? ((stats.filled / stats.total) * 100).toFixed(1) : '0'
        }))
        .sort((a, b) => a.department.localeCompare(b.department));
}

export async function getAgeDemographics() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('birthdate');

    if (error) throw new Error(error.message);

    const today = new Date();
    const stats: Record<string, number> = {
        'Under 30': 0,
        '30-39': 0,
        '40-49': 0,
        '50-59': 0,
        '60+': 0,
        'Unknown': 0
    };

    employees.forEach(emp => {
        if (!emp.birthdate) {
            stats['Unknown']++;
            return;
        }

        const birthDate = new Date(emp.birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 30) stats['Under 30']++;
        else if (age < 40) stats['30-39']++;
        else if (age < 50) stats['40-49']++;
        else if (age < 60) stats['50-59']++;
        else stats['60+']++;
    });

    const total = employees.length;

    return Object.entries(stats).map(([range, count]) => ({
        range,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
    }));
}

export async function getRetirementProjection() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('first_name, last_name, birthdate, position_title, department');

    if (error) throw new Error(error.message);

    const today = new Date();
    const currentYear = today.getFullYear();
    const projections: any[] = [];

    employees.forEach(emp => {
        if (!emp.birthdate) return;

        const birthDate = new Date(emp.birthdate);
        const year60 = birthDate.getFullYear() + 60;
        const year65 = birthDate.getFullYear() + 65;

        // We care about anyone retiring in the next 10 years or already over 60
        if (year65 >= currentYear && year65 <= currentYear + 10) {
            projections.push({
                name: `${emp.first_name} ${emp.last_name}`,
                position: emp.position_title,
                department: emp.department || 'N/A',
                birthdate: emp.birthdate,
                optionalRetirementYear: year60,
                mandatoryRetirementYear: year65,
                yearsToMandatory: year65 - currentYear
            });
        }
    });

    return projections.sort((a, b) => a.mandatoryRetirementYear - b.mandatoryRetirementYear);
}

export async function getWorkforceMovement() {
    const supabase = await createClient();
    const currentYear = new Date().getFullYear();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('original_appointment_date, last_promotion_date, retirement_date, resigned_date, is_deceased, updated_at');

    if (error) throw new Error(error.message);

    const stats = {
        appointments: 0,
        promotions: 0,
        resignations: 0,
        retirements: 0,
        separations_other: 0 // e.g. deceased
    };

    employees.forEach(emp => {
        const checkYear = (dateStr: string | null) => {
            if (!dateStr) return false;
            return new Date(dateStr).getFullYear() === currentYear;
        };

        if (checkYear(emp.original_appointment_date)) stats.appointments++;
        if (checkYear(emp.last_promotion_date)) stats.promotions++;
        if (checkYear(emp.resigned_date)) stats.resignations++;
        if (checkYear(emp.retirement_date)) stats.retirements++;

        // For deceased, we'll check if they are marked deceased and updated this year since there's no death_date
        if (emp.is_deceased && new Date(emp.updated_at).getFullYear() === currentYear) {
            stats.separations_other++;
        }
    });

    return [
        { category: 'New Appointments', count: stats.appointments, type: 'Inflow' },
        { category: 'Promotions', count: stats.promotions, type: 'Movement' },
        { category: 'Resignations', count: stats.resignations, type: 'Outflow' },
        { category: 'Retirements', count: stats.retirements, type: 'Outflow' },
        { category: 'Other Separations (Deceased/Dropped)', count: stats.separations_other, type: 'Outflow' }
    ];
}
