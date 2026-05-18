import { createClient } from '@/utils/supabase/server';
import EmployeeClientPage from './EmployeeClientPage';

export default async function EmployeesPage() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select(`
            *,
            employee_pds (
                agency_employee_no
            ),
            employee_eligibility (
                license_valid_until
            ),
            positions (
                title,
                classification,
                item_number,
                area_code,
                area_type,
                departments (
                    name
                ),
                salary_grades (
                    grade,
                    step,
                    salary
                )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching employees:', error);
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-semibold">Failed to load employees. Please try again later.</p>
            </div>
        );
    }

    const mappedEmployees = employees?.map((emp: any) => {
        let license_date = emp.license_expiration_date;
        if (emp.employee_eligibility && emp.employee_eligibility.length > 0) {
            const valid = emp.employee_eligibility.find((el: any) => el.license_valid_until);
            if (valid) {
                license_date = valid.license_valid_until;
            }
        }

        return {
            ...emp,
            // Map consistent naming for the UI
            birthdate: emp.birth_date,
            sex: emp.gender,
            license_expiration_date: license_date,
            agency_employee_no: emp.employee_pds?.agency_employee_no || null,
            position_title: emp.positions?.title || null,
            department: emp.positions?.departments?.name || null,
            classification: emp.positions?.classification || null,
            salary_grade: emp.positions?.salary_grades?.grade || null,
            step: emp.positions?.salary_grades?.step || null,
            item_number: emp.positions?.item_number || null,
            authorized_salary: emp.positions?.salary_grades?.salary || null,
            area_code: emp.positions?.area_code || null,
            area_type: emp.positions?.area_type || null,
        };
    }) || [];

    return <EmployeeClientPage initialEmployees={mappedEmployees} />;
}
