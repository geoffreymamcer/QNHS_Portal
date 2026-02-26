'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEmployee(formData: FormData) {
    const supabase = await createClient();
    const photoFile = formData.get('photo') as File | null;
    let photoUrl = '';

    if (photoFile && photoFile.size > 0) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${formData.get('employeeId')}-${Math.random()}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('employee-photos')
            .upload(filePath, photoFile);

        if (uploadError) {
            console.error('Photo upload error:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('employee-photos')
                .getPublicUrl(filePath);
            photoUrl = publicUrl;
        }
    }

    const data = {
        employee_id: formData.get('employeeId') as string,
        employee_num: formData.get('employeeNum') as string,
        first_name: formData.get('firstName') as string,
        mid_name: formData.get('middleName') as string,
        last_name: formData.get('lastName') as string,
        sex: formData.get('gender') as string,
        birthdate: formData.get('birthdate') as string || null,
        civil_status: formData.get('civilStatus') as string,
        pagibig_number: formData.get('pagibig') as string,
        philhealth_number: formData.get('philhealth') as string,
        gsis_number: formData.get('gsis') as string,
        account_number: formData.get('accNum') as string,
        tin: formData.get('tin') as string,
        position: formData.get('position') as string,
        department: formData.get('department') as string,
        position_classification: formData.get('classification') as string,
        email: formData.get('email') as string,
        contact_no: formData.get('contactNo') as string,
        hired_date: formData.get('hiredDate') as string || null,
        date_promoted: formData.get('datePromoted') as string || null,
        last_assign: formData.get('lastAssign') as string,
        retirement_date: formData.get('retirementDate') as string || null,
        resigned_date: formData.get('resignedDate') as string || null,
        transferred_date: formData.get('transferredDate') as string || null,
        is_deceased: formData.get('isDeceased') === 'true',
        file_url: formData.get('fileUrl') as string,
        photo_url: photoUrl,
    };

    const { error } = await supabase.from('employees').insert([data]);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/employees');
}

export async function updateEmployee(id: string, formData: FormData) {
    const supabase = await createClient();
    const photoFile = formData.get('photo') as File | null;
    let photoUrl = formData.get('currentPhotoUrl') as string || '';

    if (photoFile && photoFile.size > 0) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${formData.get('employeeId') || id}-${Math.random()}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('employee-photos')
            .upload(filePath, photoFile);

        if (uploadError) {
            console.error('Photo upload error:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('employee-photos')
                .getPublicUrl(filePath);
            photoUrl = publicUrl;
        }
    }

    const data = {
        employee_id: formData.get('employeeId') as string,
        employee_num: formData.get('employeeNum') as string,
        first_name: formData.get('firstName') as string,
        mid_name: formData.get('middleName') as string,
        last_name: formData.get('lastName') as string,
        sex: formData.get('gender') as string,
        birthdate: formData.get('birthdate') as string || null,
        civil_status: formData.get('civilStatus') as string,
        pagibig_number: formData.get('pagibig') as string,
        philhealth_number: formData.get('philhealth') as string,
        gsis_number: formData.get('gsis') as string,
        account_number: formData.get('accNum') as string,
        tin: formData.get('tin') as string,
        position: formData.get('position') as string,
        department: formData.get('department') as string,
        position_classification: formData.get('classification') as string,
        email: formData.get('email') as string,
        contact_no: formData.get('contactNo') as string,
        hired_date: formData.get('hiredDate') as string || null,
        date_promoted: formData.get('datePromoted') as string || null,
        last_assign: formData.get('lastAssign') as string,
        retirement_date: formData.get('retirementDate') as string || null,
        resigned_date: formData.get('resignedDate') as string || null,
        transferred_date: formData.get('transferredDate') as string || null,
        is_deceased: formData.get('isDeceased') === 'true',
        file_url: formData.get('fileUrl') as string,
        photo_url: photoUrl,
    };

    const { error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/employees');
}

export async function deleteEmployee(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/employees');
}
