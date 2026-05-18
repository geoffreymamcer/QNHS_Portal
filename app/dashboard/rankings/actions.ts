'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPositions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('positions')
        .select('id, title, item_number')
        .eq('is_active', true)
        .order('title', { ascending: true });

    if (error) {
        console.error('Error fetching positions:', error);
        throw new Error(error.message);
    }
    return data;
}

export async function createApplicant(data: any) {
    const supabase = await createClient();

    // Resolve or dynamically create the position ID to satisfy the foreign key constraint
    let positionId = null;
    const selectedLevel = data.profile.schoolLevel || 'Junior High School';

    if (data.profile.appliedPosition) {
        const titleTrimmed = data.profile.appliedPosition.trim();
        
        // 1. Check if a position with this exact title and level already exists (case-insensitive)
        const { data: existingPos } = await supabase
            .from('positions')
            .select('id')
            .ilike('title', titleTrimmed)
            .eq('level', selectedLevel)
            .limit(1)
            .maybeSingle();

        if (existingPos) {
            positionId = existingPos.id;
        } else {
            // 2. Query any existing position with the same title to inherit its classification and salary grade
            const { data: basePos } = await supabase
                .from('positions')
                .select('salary_grade_id, classification')
                .ilike('title', titleTrimmed)
                .limit(1)
                .maybeSingle();

            // 3. Dynamically create the position with a temporary item number and the correct level
            const tempItemNumber = `TEMP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
            const { data: newPos, error: createError } = await supabase
                .from('positions')
                .insert([{
                    item_number: tempItemNumber,
                    title: titleTrimmed,
                    classification: basePos?.classification || 'Teaching',
                    salary_grade_id: basePos?.salary_grade_id || null,
                    level: selectedLevel,
                    is_active: true
                }])
                .select('id')
                .single();

            if (createError) {
                console.error('Error auto-creating position:', createError);
                throw new Error(`Failed to create new position: ${createError.message}`);
            }
            positionId = newPos.id;
        }
    }

    // Map age to a birth date date type
    let birthDate = null;
    if (data.profile.age) {
        const ageNum = parseInt(data.profile.age);
        if (!isNaN(ageNum)) {
            const birthYear = new Date().getFullYear() - ageNum;
            birthDate = `${birthYear}-01-01`;
        }
    }

    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const generatedIesNo = data.profile.iesNo?.trim() || `IES-${currentYear}-${randomSeq}`;
    const generatedAppCode = data.profile.applicantCode?.trim() || `APP-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from('applicants').insert([{
        ies_no: generatedIesNo,
        applicant_code: generatedAppCode,
        hiring_date: data.hiringDate,
        applied_position_id: positionId || null,

        // Profile
        last_name: data.profile.surname,
        first_name: data.profile.firstname,
        middle_name: data.profile.middlename,
        name_extension: data.profile.extension,
        birth_date: birthDate,
        gender: data.profile.sex || null,
        civil_status: data.profile.civilStatus,
        religion: data.profile.religion,
        disability: data.profile.disability,
        ethnic_group: data.profile.ethnicGroup,

        // Contact
        email: data.background.email,
        contact_no: data.background.contactNo,
        address: data.background.address,

        // Professional
        eligibility: data.professional.eligibility,
        education: data.background.education,
        trainings: data.professional.trainings,
        experiences: data.professional.experiences,

        // Evaluation
        status: data.evaluation.status,
        performance: data.evaluation.performance
    }]);

    if (error) {
        console.error('Error creating applicant:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/rankings');
}

export async function getApplicants() {
    const supabase = await createClient();

    // Database self-healing: Automatically link any position missing a salary_grade_id
    try {
        const { data: unlinkedPos } = await supabase
            .from('positions')
            .select('id, title')
            .is('salary_grade_id', null);

        if (unlinkedPos && unlinkedPos.length > 0) {
            const { data: sgs } = await supabase
                .from('salary_grades')
                .select('id, grade, step');

            if (sgs && sgs.length > 0) {
                for (const pos of unlinkedPos) {
                    const titleLower = pos.title.toLowerCase();
                    let targetGrade = 0;
                    if (titleLower.includes('teacher iii')) {
                        targetGrade = 13;
                    } else if (titleLower.includes('teacher ii')) {
                        targetGrade = 12;
                    } else if (titleLower.includes('teacher i')) {
                        targetGrade = 11;
                    }

                    if (targetGrade > 0) {
                        // Match with step 3 (default) or step 1
                        let matchedSg = sgs.find(sg => sg.grade === targetGrade && sg.step === 3);
                        if (!matchedSg) {
                            matchedSg = sgs.find(sg => sg.grade === targetGrade);
                        }

                        if (matchedSg) {
                            await supabase
                                .from('positions')
                                .update({ salary_grade_id: matchedSg.id })
                                .eq('id', pos.id);
                            console.log(`Self-healed: Linked position "${pos.title}" (ID: ${pos.id}) to Salary Grade ${matchedSg.grade} Step ${matchedSg.step}`);
                        }
                    }
                }
            }
        }
    } catch (healError) {
        console.error('Database self-healing error:', healError);
    }

    const { data, error } = await supabase
        .from('applicants')
        .select(`
            *,
            positions:applied_position_id (
                title,
                level,
                salary_grades (
                    grade,
                    salary
                )
            )
        `)
        .order('hiring_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching applicants:', error);
        throw new Error(error.message);
    }

    // Helper to calculate age from birth date
    const calculateAge = (birthDateStr: string | null) => {
        if (!birthDateStr) return 0;
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Normalize database response to match the expected UI types (Rule 5: Separation of Concerns)
    const normalized = (data || []).map(item => ({
        id: item.id,
        ies_no: item.ies_no,
        applicant_code: item.applicant_code,
        hiring_date: item.hiring_date,
        applied_position: item.positions?.title || 'Unspecified Position',
        school_level: (item.positions as any)?.level || 'Junior High School',
        salary_grade: (item.positions as any)?.salary_grades?.grade || null,
        salary: (item.positions as any)?.salary_grades?.salary || null,
        
        // Profile mapping
        firstname: item.first_name,
        middlename: item.middle_name,
        surname: item.last_name,
        extension: item.name_extension,
        age: calculateAge(item.birth_date),
        sex: item.gender,
        civil_status: item.civil_status,
        religion: item.religion,
        disability: item.disability,
        ethnic_group: item.ethnic_group,

        // Background / Contact
        email: item.email,
        contact_no: item.contact_no,
        address: item.address,
        education: item.education || [],

        // Professional / Evaluation
        eligibility: item.eligibility,
        trainings: item.trainings || [],
        experiences: item.experiences || [],
        status: item.status,
        performance: item.performance,
        created_at: item.created_at,
        updated_at: item.updated_at
    }));

    return normalized;
}

export async function checkIsAdmin() {
    const supabase = await createClient();
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (error || !data) return false;
        return true;
    } catch (err) {
        console.error('Error verifying admin status:', err);
        return false;
    }
}
