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

    const generatedId = `QNHS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const data = {
        employee_id: generatedId,
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

export async function getVacantPositions() {
    const supabase = await createClient();

    // 1. Get all item_numbers currently held by active employees
    const { data: occupiedItems } = await supabase
        .from('employees')
        .select('item_number')
        .is('resigned_date', null)
        .is('retirement_date', null)
        .eq('is_deceased', false);

    const occupiedList = occupiedItems?.map(e => e.item_number).filter(Boolean) || [];

    // 2. Fetch positions that are active and not in the occupied list
    let query = supabase
        .from('positions')
        .select('*')
        .eq('is_active', true)
        .order('item_number');

    if (occupiedList.length > 0) {
        // Construct the in filter string correctly with quotes for item numbers
        const inFilter = `(${occupiedList.map(item => `"${item}"`).join(',')})`;
        query = query.not('item_number', 'in', inFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getUniqueDepartments() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('departments')
        .select('name');

    if (error) throw new Error(error.message);

    const uniqueDepts = Array.from(new Set(data.map(d => d.name))).sort();
    return uniqueDepts;
}

export async function createPosition(formData: FormData) {
    const supabase = await createClient();

    const data = {
        item_number: formData.get('itemNumber') as string,
        position_title: formData.get('positionTitle') as string,
        classification: formData.get('classification') as string,
        department: formData.get('department') as string,
        level: formData.get('level') as string,
        salary_grade: formData.get('salaryGrade') ? parseInt(formData.get('salaryGrade') as string) : null,
        annual_salary_authorized: formData.get('salaryAuthorized') ? parseFloat(formData.get('salaryAuthorized') as string) : null,
        area_code: formData.get('areaCode') as string,
        area_type: formData.get('areaType') as string,
        is_active: true
    };

    const { error } = await supabase.from('positions').insert([data]);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard/reports'); // Also revalidate reports since they use this data
}

export async function createEmployeePds(payload: any) {
    const supabase = await createClient();

    const generatedId = `QNHS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Helper to convert empty string to null
    const toNull = (val: any) => val === '' ? null : val;

    try {
        console.log('Starting PDS creation for:', payload.personalInfo.firstName, payload.personalInfo.lastName);

        // 1. Create the base employee record first
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .insert([{
                employee_id: generatedId,
                first_name: payload.personalInfo.firstName,
                middle_name: toNull(payload.personalInfo.middleName),
                last_name: payload.personalInfo.lastName,
                birth_date: toNull(payload.personalInfo.birthDate),
                gender: toNull(payload.personalInfo.gender),
                tin: toNull(payload.personalInfo.tin),
                status: 'Active'
            }])
            .select()
            .single();

        if (empError) throw new Error(`Base employee record failed: ${empError.message}`);

        const employeeUuid = employee.id;

        // 2. Insert PDS details
        const { error: pdsError } = await supabase
            .from('employee_pds')
            .insert([{
                employee_id: employeeUuid,
                place_of_birth: toNull(payload.personalInfo.placeOfBirth),
                sex_at_birth: toNull(payload.personalInfo.gender),
                civil_status: toNull(payload.personalInfo.civilStatus),
                height_m: payload.personalInfo.height ? parseFloat(payload.personalInfo.height) : null,
                weight_kg: payload.personalInfo.weight ? parseFloat(payload.personalInfo.weight) : null,
                blood_type: toNull(payload.personalInfo.bloodType),
                umid_no: toNull(payload.personalInfo.umid),
                pagibig_id_no: toNull(payload.personalInfo.pagibig),
                philhealth_no: toNull(payload.personalInfo.philhealth),
                philsys_id_no: toNull(payload.personalInfo.philsys),
                tin_no: toNull(payload.personalInfo.tin),
                agency_employee_no: toNull(payload.personalInfo.agencyEmployeeNo),
                citizenship: toNull(payload.personalInfo.citizenship),
                res_house_no: toNull(payload.personalInfo.resHouseNo),
                res_street: toNull(payload.personalInfo.resStreet),
                res_subdivision: toNull(payload.personalInfo.resSubdivision),
                res_barangay: toNull(payload.personalInfo.resBarangay),
                res_city: toNull(payload.personalInfo.resCity),
                res_province: toNull(payload.personalInfo.resProvince),
                res_zip_code: toNull(payload.personalInfo.resZipCode),
                perm_house_no: toNull(payload.personalInfo.permHouseNo),
                perm_street: toNull(payload.personalInfo.permStreet),
                perm_subdivision: toNull(payload.personalInfo.permSubdivision),
                perm_barangay: toNull(payload.personalInfo.permBarangay),
                perm_city: toNull(payload.personalInfo.permCity),
                perm_province: toNull(payload.personalInfo.permProvince),
                perm_zip_code: toNull(payload.personalInfo.permZipCode),
                tel_no: toNull(payload.personalInfo.telNo),
                mobile_no: toNull(payload.personalInfo.mobileNo),
                email: toNull(payload.personalInfo.email)
            }]);

        if (pdsError) throw new Error(`PDS info failed: ${pdsError.message}`);

        // 3. Insert Family
        const { error: familyError } = await supabase
            .from('employee_family')
            .insert([{
                employee_id: employeeUuid,
                spouse_lastname: toNull(payload.familyBackground.spouseSurname),
                spouse_firstname: toNull(payload.familyBackground.spouseFirstName),
                spouse_middlename: toNull(payload.familyBackground.spouseMiddleName),
                spouse_extension: toNull(payload.familyBackground.spouseExtension),
                spouse_occupation: toNull(payload.familyBackground.spouseOccupation),
                spouse_employer: toNull(payload.familyBackground.spouseEmployer),
                spouse_tel_no: toNull(payload.familyBackground.spouseTelNo),
                father_lastname: toNull(payload.familyBackground.fatherSurname),
                father_firstname: toNull(payload.familyBackground.fatherFirstName),
                father_middlename: toNull(payload.familyBackground.fatherMiddleName),
                father_extension: toNull(payload.familyBackground.fatherExtension),
                mother_maiden_lastname: toNull(payload.familyBackground.motherSurname),
                mother_firstname: toNull(payload.familyBackground.motherFirstName),
                mother_middlename: toNull(payload.familyBackground.motherMiddleName)
            }]);

        if (familyError) throw new Error(`Family background failed: ${familyError.message}`);

        // 4. Insert Children
        if (payload.familyBackground.children?.length > 0) {
            const children = payload.familyBackground.children
                .filter((c: any) => c.name.trim() !== '')
                .map((c: any) => ({
                    employee_id: employeeUuid,
                    child_name: c.name,
                    birth_date: toNull(c.birthDate)
                }));

            if (children.length > 0) {
                const { error: childError } = await supabase.from('employee_children').insert(children);
                if (childError) throw new Error(`Children records failed: ${childError.message}`);
            }
        }

        // 5. Insert Education
        if (payload.educationalBackground?.length > 0) {
            const education = payload.educationalBackground
                .filter((e: any) => e.schoolName.trim() !== '')
                .map((e: any) => ({
                    employee_id: employeeUuid,
                    level: e.level,
                    school_name: e.schoolName,
                    degree_course: toNull(e.degree),
                    attendance_from: toNull(e.from),
                    attendance_to: toNull(e.to),
                    level_units_earned: toNull(e.units),
                    year_graduated: toNull(e.yearGraduated),
                    honors_received: toNull(e.honors)
                }));

            if (education.length > 0) {
                const { error: eduError } = await supabase.from('employee_education').insert(education);
                if (eduError) throw new Error(`Education records failed: ${eduError.message}`);
            }
        }

        // 6. Insert Eligibility
        if (payload.civilServiceEligibility?.length > 0) {
            const eligibility = payload.civilServiceEligibility
                .filter((e: any) => e.type.trim() !== '')
                .map((e: any) => ({
                    employee_id: employeeUuid,
                    eligibility_name: e.type,
                    rating: toNull(e.rating),
                    exam_date: toNull(e.date),
                    license_number: toNull(e.licenseNumber),
                    license_valid_until: toNull(e.licenseValidUntil)
                }));

            if (eligibility.length > 0) {
                const { error: eligError } = await supabase.from('employee_eligibility').insert(eligibility);
                if (eligError) throw new Error(`Eligibility records failed: ${eligError.message}`);
            }
        }

        console.log('PDS created successfully for:', employeeUuid);
        revalidatePath('/dashboard/employees');
        return { success: true };
    } catch (err: any) {
        console.error('Error in createEmployeePds:', err.message);
        throw err;
    }
}



export async function getEmployeeFullProfile(employeeUuid: string) {
    const supabase = await createClient();

    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeUuid)
        .single();

    if (empError) throw new Error(empError.message);

    const { data: pds } = await supabase.from('employee_pds').select('*').eq('employee_id', employeeUuid).single();
    const { data: family } = await supabase.from('employee_family').select('*').eq('employee_id', employeeUuid).single();
    const { data: children } = await supabase.from('employee_children').select('*').eq('employee_id', employeeUuid);
    const { data: education } = await supabase.from('employee_education').select('*').eq('employee_id', employeeUuid).order('year_graduated', { ascending: false });
    const { data: eligibility } = await supabase.from('employee_eligibility').select('*').eq('employee_id', employeeUuid);

    return {
        ...employee,
        pds,
        family,
        children: children || [],
        education: education || [],
        eligibility: eligibility || []
    };
}

export async function getPdsDropdownValues() {
    const supabase = await createClient();

    // 1. Personal PDS fields
    const { data: pdsData } = await supabase
        .from('employee_pds')
        .select('citizenship, blood_type, res_city, res_province, res_zip_code, perm_city, perm_province, perm_zip_code');

    // 2. Education fields
    const { data: eduData } = await supabase
        .from('employee_education')
        .select('level, school_name, degree_course, attendance_from, attendance_to, level_units_earned, honors_received');

    const unique = (arr: (string | null | undefined)[]) => {
        const seen = new Set<string>();
        const results: string[] = [];
        
        arr.filter(Boolean).forEach(val => {
            const trimmed = val!.trim();
            if (!trimmed) return;
            const lower = trimmed.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                results.push(trimmed);
            }
        });
        
        return results.sort((a, b) => a.localeCompare(b));
    };

    return {
        citizenships: unique(pdsData?.map(d => d.citizenship) || []),
        bloodTypes: unique(pdsData?.map(d => d.blood_type) || []),
        cities: unique([
            ...(pdsData?.map(d => d.res_city) || []),
            ...(pdsData?.map(d => d.perm_city) || [])
        ]),
        provinces: unique([
            ...(pdsData?.map(d => d.res_province) || []),
            ...(pdsData?.map(d => d.perm_province) || [])
        ]),
        zipCodes: unique([
            ...(pdsData?.map(d => d.res_zip_code) || []),
            ...(pdsData?.map(d => d.perm_zip_code) || [])
        ]),
        eduLevels: unique(eduData?.map(d => d.level) || []),
        schools: unique(eduData?.map(d => d.school_name) || []),
        degrees: unique(eduData?.map(d => d.degree_course) || []),
        yearsFrom: unique(eduData?.map(d => d.attendance_from) || []),
        yearsTo: unique(eduData?.map(d => d.attendance_to) || []),
        units: unique(eduData?.map(d => d.level_units_earned) || []),
        honors: unique(eduData?.map(d => d.honors_received) || []),
    };
}
