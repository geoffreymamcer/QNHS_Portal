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
            .upload(filePath, photoFile, {
                contentType: photoFile.type
            });

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
        photo_url: photoUrl,
        first_name: formData.get('firstName') as string,
        mid_name: formData.get('middleName') as string,
        last_name: formData.get('lastName') as string,
        sex: formData.get('gender') as string,
        birthdate: formData.get('birthdate') as string || null,
        tin: formData.get('tin') as string,
        civil_service_eligibility: formData.get('eligibility') as string,
        is_deceased: formData.get('isDeceased') === 'true',

        position_title: formData.get('positionTitle') as string,
        classification: formData.get('classification') as string,
        department: formData.get('department') as string,
        status: formData.get('status') as string,
        level: formData.get('level') as string,

        item_number: formData.get('itemNumber') as string,
        salary_grade: formData.get('salaryGrade') ? parseInt(formData.get('salaryGrade') as string) : null,
        step: formData.get('step') ? parseInt(formData.get('step') as string) : null,
        annual_salary_authorized: formData.get('salaryAuthorized') ? parseFloat(formData.get('salaryAuthorized') as string) : null,
        annual_salary_actual: formData.get('salaryActual') ? parseFloat(formData.get('salaryActual') as string) : null,
        license_expiration_date: formData.get('licenseExpirationDate') as string || null,

        area_code: formData.get('areaCode') as string,
        area_type: formData.get('areaType') as string,
        ppa_attribution: formData.get('ppaAttribution') as string,

        original_appointment_date: formData.get('appointmentDate') as string || null,
        last_promotion_date: formData.get('promotionDate') as string || null,
        retirement_date: formData.get('retirementDate') as string || null,
        resigned_date: formData.get('resignedDate') as string || null,
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
            .upload(filePath, photoFile, {
                contentType: photoFile.type
            });

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
        photo_url: photoUrl,
        first_name: formData.get('firstName') as string,
        mid_name: formData.get('middleName') as string,
        last_name: formData.get('lastName') as string,
        sex: formData.get('gender') as string,
        birthdate: formData.get('birthdate') as string || null,
        tin: formData.get('tin') as string,
        civil_service_eligibility: formData.get('eligibility') as string,
        is_deceased: formData.get('isDeceased') === 'true',

        position_title: formData.get('positionTitle') as string,
        classification: formData.get('classification') as string,
        department: formData.get('department') as string,
        status: formData.get('status') as string,
        level: formData.get('level') as string,

        item_number: formData.get('itemNumber') as string,
        salary_grade: formData.get('salaryGrade') ? parseInt(formData.get('salaryGrade') as string) : null,
        step: formData.get('step') ? parseInt(formData.get('step') as string) : null,
        annual_salary_authorized: formData.get('salaryAuthorized') ? parseFloat(formData.get('salaryAuthorized') as string) : null,
        annual_salary_actual: formData.get('salaryActual') ? parseFloat(formData.get('salaryActual') as string) : null,
        license_expiration_date: formData.get('licenseExpirationDate') as string || null,

        area_code: formData.get('areaCode') as string,
        area_type: formData.get('areaType') as string,
        ppa_attribution: formData.get('ppaAttribution') as string,

        original_appointment_date: formData.get('appointmentDate') as string || null,
        last_promotion_date: formData.get('promotionDate') as string || null,
        retirement_date: formData.get('retirementDate') as string || null,
        resigned_date: formData.get('resignedDate') as string || null,
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
