'use client'; // Keeping it client-friendly since we can invoke it from the Client Components

import { createClient } from '@/utils/supabase/client';
import { QualificationStandard, DEFAULT_STANDARDS } from './utils/qsStorage';

/**
 * Fetches all custom qualification standards from the Supabase database table.
 * If the table does not exist or has an error, it returns an empty array.
 */
export async function getQualificationStandardsDb(): Promise<QualificationStandard[]> {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('qualification_standards')
            .select('*')
            .order('position_title', { ascending: true });

        if (error) {
            console.warn('qualification_standards table might not exist yet:', error.message);
            return [];
        }

        // Map database fields to the UI interface format
        return (data || []).map(item => ({
            id: item.id,
            positionTitle: item.position_title,
            schoolLevel: item.school_level,
            education: item.education,
            training: item.training,
            experience: item.experience,
            eligibility: item.eligibility
        }));
    } catch (e) {
        console.error('Failed to fetch qualification standards from DB:', e);
        return [];
    }
}

/**
 * Saves or updates a qualification standard in the database.
 */
export async function upsertQualificationStandardDb(standard: Omit<QualificationStandard, 'id'> & { id?: string }) {
    const supabase = createClient();
    
    // If it's a default record, we do not want to pass the default-id to Supabase (we want Supabase to generate a new uuid or match key)
    const isNewOrOverride = !standard.id || standard.id.startsWith('default-');
    
    const dbPayload = {
        position_title: standard.positionTitle.trim().toUpperCase(),
        school_level: standard.schoolLevel,
        education: standard.education.trim(),
        training: standard.training.trim(),
        experience: standard.experience.trim(),
        eligibility: standard.eligibility.trim(),
        updated_at: new Date().toISOString()
    };

    if (!isNewOrOverride && standard.id) {
        // Update existing custom record
        const { error } = await supabase
            .from('qualification_standards')
            .update(dbPayload)
            .eq('id', standard.id);
            
        if (error) {
            console.error('Error updating qualification standard in DB:', error);
            throw new Error(error.message);
        }
    } else {
        // Upsert by position_title and school_level to trigger unique constraint or insert new
        const { error } = await supabase
            .from('qualification_standards')
            .upsert([
                {
                    ...dbPayload,
                    created_at: new Date().toISOString()
                }
            ], { onConflict: 'position_title, school_level' });

        if (error) {
            console.error('Error upserting qualification standard in DB:', error);
            throw new Error(error.message);
        }
    }
}

/**
 * Deletes a custom qualification standard from the database.
 */
export async function deleteQualificationStandardDb(id: string) {
    if (id.startsWith('default-')) {
        throw new Error('Default standards cannot be deleted.');
    }
    
    const supabase = createClient();
    const { error } = await supabase
        .from('qualification_standards')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting qualification standard from DB:', error);
        throw new Error(error.message);
    }
}

/**
 * High-performance helper to load combined defaults and database-persisted qualification standards.
 */
export async function getCombinedStandardsDb(): Promise<QualificationStandard[]> {
    const dbStandards = await getQualificationStandardsDb();
    
    // Merge defaults and custom db records (db records override defaults)
    const combined = [...DEFAULT_STANDARDS];
    
    dbStandards.forEach(cust => {
        const matchIdx = combined.findIndex(def => 
            def.positionTitle.toLowerCase() === cust.positionTitle.toLowerCase() &&
            def.schoolLevel === cust.schoolLevel
        );
        if (matchIdx !== -1) {
            combined[matchIdx] = cust;
        } else {
            combined.push(cust);
        }
    });
    
    return combined;
}
