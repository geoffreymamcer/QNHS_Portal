'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSalaryGrades() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('salary_grades')
        .select('*')
        .order('grade', { ascending: true })
        .order('position_title', { ascending: true });

    if (error) {
        console.error('Error fetching salary grades:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function upsertSalaryGrade(grade: number, position_title: string, salary: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('salary_grades')
        .upsert({ 
            grade, 
            position_title, 
            salary, 
            updated_at: new Date().toISOString() 
        })
        .select()
        .single();

    if (error) {
        console.error('Error upserting salary grade:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/rankings');
    return data;
}

export async function updateSalaryGrade(
    oldGrade: number, 
    oldTitle: string, 
    newGrade: number, 
    newTitle: string, 
    salary: number
) {
    const supabase = await createClient();

    // If PK changed, we need to delete old and insert new to avoid key conflicts/orphans
    if (oldGrade !== newGrade || oldTitle !== newTitle) {
        // Delete old
        const { error: delError } = await supabase
            .from('salary_grades')
            .delete()
            .match({ grade: oldGrade, position_title: oldTitle });
        
        if (delError) throw new Error(delError.message);

        // Insert new
        return upsertSalaryGrade(newGrade, newTitle, salary);
    }

    // Otherwise just upsert
    return upsertSalaryGrade(newGrade, newTitle, salary);
}

export async function deleteSalaryGrade(grade: number, position_title: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('salary_grades')
        .delete()
        .match({ grade, position_title });

    if (error) {
        console.error('Error deleting salary grade:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/rankings');
    return { success: true };
}
