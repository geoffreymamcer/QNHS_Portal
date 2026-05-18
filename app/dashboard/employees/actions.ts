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
        middle_name: formData.get('middleName') as string,
        last_name: formData.get('lastName') as string,
        gender: formData.get('gender') as string,
        birth_date: formData.get('birthdate') as string || null,
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
        authorized_salary: formData.get('salaryAuthorized') ? parseFloat(formData.get('salaryAuthorized') as string) : null,
        actual_salary: formData.get('salaryActual') ? parseFloat(formData.get('salaryActual') as string) : null,
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
        middle_name: formData.get('middleName') as string,
        last_name: formData.get('lastName') as string,
        gender: formData.get('gender') as string,
        birth_date: formData.get('birthdate') as string || null,
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
        authorized_salary: formData.get('salaryAuthorized') ? parseFloat(formData.get('salaryAuthorized') as string) : null,
        actual_salary: formData.get('salaryActual') ? parseFloat(formData.get('salaryActual') as string) : null,
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

    // 1. Get all position_ids currently held by employees
    const { data: occupied } = await supabase
        .from('employees')
        .select('position_id')
        .not('position_id', 'is', null);

    const occupiedIds = occupied?.map(e => (e as any).position_id).filter(Boolean) || [];

    // 2. Fetch positions that are active
    const { data: positions, error } = await supabase
        .from('positions')
        .select(`
            id,
            item_number,
            title,
            classification,
            level,
            area_code,
            area_type,
            is_active,
            departments(name),
            salary_grades(grade, step, salary)
        `)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching vacant positions:', error);
        return [];
    }

    // 3. Filter out occupied ones in memory
    const vacant = positions?.filter(pos => !occupiedIds.includes(pos.id)) || [];

    // 4. Map back to UI structure
    return vacant.map(pos => ({
        id: pos.id,
        item_number: pos.item_number,
        position_title: pos.title,
        classification: pos.classification,
        level: pos.level,
        area_code: pos.area_code,
        area_type: pos.area_type,
        is_active: pos.is_active,
        department: (pos.departments as any)?.name || '',
        salary_grade: (pos.salary_grades as any)?.grade || null,
        step: (pos.salary_grades as any)?.step || null,
        annual_salary_authorized: (pos.salary_grades as any)?.salary || null
    }));
}

/**
 * Ensures a department exists and Returns its UUID ID.
 */
async function ensureDepartmentExists(name: string | null) {
    if (!name || name.trim() === '') return null;
    const trimmedName = name.trim();
    const supabase = await createClient();
    
    // Check if it exists first (to handle possible CASE differences)
    const { data: existing } = await supabase
        .from('departments')
        .select('id')
        .ilike('name', trimmedName)
        .maybeSingle();
        
    if (existing) return existing.id;
    
    // If not found by ILIKE, try to UPSERT it
    // This handles race conditions and unique constraint conflicts
    const { data: upserted, error: upsertError } = await supabase
        .from('departments')
        .upsert({ name: trimmedName }, { onConflict: 'name' })
        .select('id')
        .single();
            
    if (upsertError) {
        console.error('CRITICAL: Department synchronization failed:', upsertError.message);
        throw new Error(`Department data sync failed: ${upsertError.message}`);
    }
    
    return upserted?.id || null;
}

async function getDepartmentIdByName(name: string | null) {
    if (!name) return null;
    const trimmedName = name.trim();
    const supabase = await createClient();
    
    // Perform a case-insensitive check
    const { data, error } = await supabase
        .from('departments')
        .select('id')
        .ilike('name', trimmedName)
        .maybeSingle();
        
    if (error) {
        console.error('Error looking up department ID:', error.message);
        return null;
    }
    
    return data?.id || null;
}

/**
 * Ensures a salary grade exists and has the correct salary value.
 */
async function ensureSalaryGradeExists(grade: number, step: number, salary: number | null) {
    if (!grade) return null;
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('salary_grades')
        .upsert({
            grade,
            step,
            salary: salary || 0
        }, { onConflict: 'grade,step' })
        .select('id')
        .single();
        
    if (error) {
        console.error('Error upserting salary grade:', error.message);
        return null;
    }
    
    return data.id;
}

/**
 * Redone Summary Logic: Positions Sync
 */
async function ensurePositionExists(itemNumber: string | null, details: any, resolvedDepartmentId?: string | null) {
    if (!itemNumber) return null;
    const supabase = await createClient();
    
    // 1. Resolve Foreign Keys
    // If we already resolved the deptId in the main loop, use it
    const departmentId = resolvedDepartmentId !== undefined 
        ? resolvedDepartmentId 
        : await getDepartmentIdByName(details.department);
    
    if (!departmentId && details.department) {
        console.warn(`Warning: Could not resolve department ID for "${details.department}"`);
    }

    const sgId = await ensureSalaryGradeExists(
        parseInt(details.salaryGrade || '0'), 
        parseInt(details.step || '1'),
        details.salaryAuthorized ? parseFloat(details.salaryAuthorized) : null
    );
    
    // 2. Upsert Position Details
    const { data: pos, error: posError } = await supabase
        .from('positions')
        .upsert({
            item_number: itemNumber,
            title: details.positionTitle,
            classification: details.classification,
            department_id: departmentId,
            salary_grade_id: sgId,
            level: details.level,
            area_code: details.areaCode,
            area_type: details.areaType,
            is_active: true
        }, { onConflict: 'item_number' })
        .select('id')
        .single();
            
    if (posError) {
        console.error('Core Position Sync Error:', posError.message);
        throw new Error(`Position synchronization failed: ${posError.message}`);
    }
    
    return pos.id;
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

        // 7. Insert Work Experience
        if (payload.workExperience?.length > 0) {
            const experience = payload.workExperience
                .filter((e: any) => e.positionTitle.trim() !== '')
                .map((e: any) => ({
                    employee_id: employeeUuid,
                    inclusive_date_from: toNull(e.from),
                    inclusive_date_to: toNull(e.to),
                    position_title: e.positionTitle,
                    department_agency_company: e.department,
                    status_of_appointment: toNull(e.status),
                    is_government_service: e.isGovernment === 'Yes'
                }));

            if (experience.length > 0) {
                const { error: expError } = await supabase.from('employee_work_experience').insert(experience);
                if (expError) throw new Error(`Work experience records failed: ${expError.message}`);
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
        .select(`
            *,
            positions (
                *,
                departments(name),
                salary_grades(grade, step, salary)
            )
        `)
        .eq('id', employeeUuid)
        .single();

    if (empError) {
        console.error('Error fetching employee profile:', empError.message);
        throw new Error(empError.message);
    }

    const { data: pds } = await supabase.from('employee_pds').select('*').eq('employee_id', employeeUuid).single();
    const { data: family } = await supabase.from('employee_family').select('*').eq('employee_id', employeeUuid).single();
    const { data: children } = await supabase.from('employee_children').select('*').eq('employee_id', employeeUuid);
    const { data: education } = await supabase.from('employee_education').select('*').eq('employee_id', employeeUuid).order('year_graduated', { ascending: false });
    const { data: eligibility } = await supabase.from('employee_eligibility').select('*').eq('employee_id', employeeUuid);
    const { data: experience } = await supabase.from('employee_work_experience').select('*').eq('employee_id', employeeUuid).order('inclusive_date_from', { ascending: false });

    const pos = (employee as any)?.positions || {};

    return {
        ...employee,
        // Map consistent naming for the UI
        birthdate: employee.birth_date,
        sex: employee.gender,
        
        // Map nested position data back to the flat structure the UI expects
        item_number: pos.item_number || '',
        position_title: pos.title || '',
        classification: pos.classification || 'Teaching',
        department: pos.departments?.name || '',
        level: pos.level || '',
        area_code: pos.area_code || '',
        area_type: pos.area_type || '',
        salary_grade: pos.salary_grades?.grade || null,
        step: pos.salary_grades?.step || null,
        authorized_salary: pos.salary_grades?.salary || null,
        
        pds,
        family,
        children: children || [],
        education: education || [],
        eligibility: eligibility || [],
        workExperience: (experience || []).map(exp => ({
            from: exp.inclusive_date_from,
            to: exp.inclusive_date_to,
            positionTitle: exp.position_title,
            department: exp.department_agency_company,
            status: exp.status_of_appointment,
            isGovernment: exp.is_government_service ? 'Yes' : 'No'
        }))
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

export async function updateEmployeeFullProfile(employeeUuid: string, payload: any) {
    const supabase = await createClient();
    const toNull = (val: any) => val === '' ? null : val;

    try {
        // 0. Ensure department exists and capture its unique ID
        let resolvedDeptId = null;
        if (payload.summary.department) {
            resolvedDeptId = await ensureDepartmentExists(payload.summary.department);
        }

        // 0.1 Ensure position exists and pass the already-resolved department ID
        const positionId = await ensurePositionExists(payload.summary.itemNumber, payload.summary, resolvedDeptId);

        // 1. Update Core Employee Record (Redone Mapping)
        const { error: empError } = await supabase
            .from('employees')
            .update({
                employee_id: payload.personalInfo.employeeId,
                first_name: payload.personalInfo.firstName,
                middle_name: toNull(payload.personalInfo.middleName),
                last_name: payload.personalInfo.lastName,
                birth_date: toNull(payload.personalInfo.birthDate),
                gender: toNull(payload.personalInfo.gender),
                tin: toNull(payload.personalInfo.tin),
                civil_service_eligibility: toNull(payload.personalInfo.eligibility),
                license_expiration_date: toNull(payload.personalInfo.licenseExpirationDate),
                is_deceased: payload.personalInfo.isDeceased === 'true',
                
                // Link to Position
                position_id: positionId,
                
                // Summary/Financial Data (Employees Table)
                status: toNull(payload.summary.status),
                actual_salary: payload.summary.salaryActual ? parseFloat(payload.summary.salaryActual) : null,
                ppa_attribution: toNull(payload.summary.ppaAttribution),
                
                // Service Chronology (Employees Table)
                original_appointment_date: toNull(payload.summary.appointmentDate),
                last_promotion_date: toNull(payload.summary.promotionDate),
                retirement_date: toNull(payload.summary.retirementDate),
                resigned_date: toNull(payload.summary.resignedDate),
            })
            .eq('id', employeeUuid);

        if (empError) throw new Error(`Core update failed: ${empError.message}`);

        // 2. Upsert PDS Details
        const { error: pdsError } = await supabase
            .from('employee_pds')
            .upsert({
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
            }, { onConflict: 'employee_id' });

        if (pdsError) throw new Error(`PDS update failed: ${pdsError.message}`);

        // 3. Upsert Family Information
        const { error: familyError } = await supabase
            .from('employee_family')
            .upsert({
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
            }, { onConflict: 'employee_id' });

        if (familyError) throw new Error(`Family update failed: ${familyError.message}`);

        // 4. Children (Delete and Re-insert)
        await supabase.from('employee_children').delete().eq('employee_id', employeeUuid);
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
                if (childError) throw new Error(`Children update failed: ${childError.message}`);
            }
        }

        // 5. Education (Delete and Re-insert)
        await supabase.from('employee_education').delete().eq('employee_id', employeeUuid);
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
                if (eduError) throw new Error(`Education update failed: ${eduError.message}`);
            }
        }

        // 6. Eligibility (Delete and Re-insert)
        await supabase.from('employee_eligibility').delete().eq('employee_id', employeeUuid);
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
                if (eligError) throw new Error(`Eligibility update failed: ${eligError.message}`);
            }
        }

        // 7. Work Experience (Delete and Re-insert)
        await supabase.from('employee_work_experience').delete().eq('employee_id', employeeUuid);
        if (payload.workExperience?.length > 0) {
            const experience = payload.workExperience
                .filter((e: any) => e.positionTitle.trim() !== '')
                .map((e: any) => ({
                    employee_id: employeeUuid,
                    inclusive_date_from: toNull(e.from),
                    inclusive_date_to: toNull(e.to),
                    position_title: e.positionTitle,
                    department_agency_company: e.department,
                    status_of_appointment: toNull(e.status),
                    is_government_service: e.isGovernment === 'Yes'
                }));
            if (experience.length > 0) {
                const { error: expError } = await supabase.from('employee_work_experience').insert(experience);
                if (expError) throw new Error(`Work experience update failed: ${expError.message}`);
            }
        }

        revalidatePath('/dashboard/employees');
        return { success: true };
    } catch (err: any) {
        throw new Error(err.message || 'Full Profile update failed');
    }
}
