'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createApplicant(data: any) {
    const supabase = await createClient();

    const { error } = await supabase.from('applicants').insert([{
        ies_no: data.profile.iesNo,
        applicant_code: data.profile.applicantCode,
        hiring_date: data.hiringDate,
        applied_position: data.profile.appliedPosition,

        // Profile
        surname: data.profile.surname,
        firstname: data.profile.firstname,
        middlename: data.profile.middlename,
        extension: data.profile.extension,
        age: parseInt(data.profile.age) || null,
        sex: data.profile.sex,
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

    const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('hiring_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching applicants:', error);
        throw new Error(error.message);
    }

    return data;
}
