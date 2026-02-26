import { createClient } from '@/utils/supabase/server';
import EmployeeClientPage from './EmployeeClientPage';

export default async function EmployeesPage() {
    const supabase = await createClient();

    const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching employees:', error);
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-semibold">Failed to load employees. Please try again later.</p>
            </div>
        );
    }

    return <EmployeeClientPage initialEmployees={employees || []} />;
}
