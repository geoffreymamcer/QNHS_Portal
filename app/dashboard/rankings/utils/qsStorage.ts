export interface QualificationStandard {
    id: string;
    positionTitle: string;
    schoolLevel: 'Junior High School' | 'Senior High School';
    education: string;
    training: string;
    experience: string;
    eligibility: string;
}

export const DEFAULT_STANDARDS: QualificationStandard[] = [
    // Junior High School
    {
        id: 'default-jhs-t1',
        positionTitle: 'TEACHER I',
        schoolLevel: 'Junior High School',
        education: "Bachelor of Secondary Education (BSEd) or Bachelor's degree plus 18 professional units in Education",
        training: "None required",
        experience: "None required",
        eligibility: "RA 1080 (Teacher)"
    },
    {
        id: 'default-jhs-t2',
        positionTitle: 'TEACHER II',
        schoolLevel: 'Junior High School',
        education: "Bachelor of Secondary Education (BSEd) or Bachelor's degree plus 18 professional units in Education",
        training: "None required",
        experience: "1 year of relevant experience",
        eligibility: "RA 1080 (Teacher)"
    },
    {
        id: 'default-jhs-t3',
        positionTitle: 'TEACHER III',
        schoolLevel: 'Junior High School',
        education: "Bachelor’s degree; or bachelor’s degree in relevant subjects, or learning area with atleast 18 professional units in Education",
        training: "None required",
        experience: "2 years of teaching experience",
        eligibility: "RA 1080 (Teacher)"
    },
    {
        id: 'default-jhs-mt1',
        positionTitle: 'MASTER TEACHER I',
        schoolLevel: 'Junior High School',
        education: "Bachelor's degree for Teachers or Bachelor's degree with 18 professional units in Education; and 18 units for a Master's degree in Education or its equivalent",
        training: "4 hours of relevant training",
        experience: "1 year as Teacher III or 4 years as Teacher II",
        eligibility: "RA 1080 (Teacher)"
    },

    // Senior High School
    {
        id: 'default-shs-t1',
        positionTitle: 'TEACHER I',
        schoolLevel: 'Senior High School',
        education: "Bachelor's degree in relevant strand/subject, or Bachelor's degree plus 18 professional units in Education",
        training: "None required",
        experience: "None required",
        eligibility: "RA 1080 (Teacher) or provisional (must pass LET within 5 years)"
    },
    {
        id: 'default-shs-t2',
        positionTitle: 'TEACHER II',
        schoolLevel: 'Senior High School',
        education: "Bachelor's degree in relevant strand/subject, or Bachelor's degree plus 18 professional units in Education",
        training: "4 hours of relevant training",
        experience: "1 year of relevant experience",
        eligibility: "RA 1080 (Teacher)"
    },
    {
        id: 'default-shs-t3',
        positionTitle: 'TEACHER III',
        schoolLevel: 'Senior High School',
        education: "Bachelor's degree in relevant strand/subject plus 18 professional units in Education; or Master's degree in relevant strand",
        training: "8 hours of relevant training",
        experience: "2 years of relevant experience",
        eligibility: "RA 1080 (Teacher)"
    },
    {
        id: 'default-shs-mt1',
        positionTitle: 'MASTER TEACHER I',
        schoolLevel: 'Senior High School',
        education: "Master's degree in relevant strand/subject with 18 professional units in Education",
        training: "12 hours of relevant training",
        experience: "3 years of relevant experience",
        eligibility: "RA 1080 (Teacher)"
    }
];

const STORAGE_KEY = 'qnhs_qualification_standards';

export function getCustomStandards(): QualificationStandard[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load qualification standards:', e);
        return [];
    }
}

export function saveCustomStandards(standards: QualificationStandard[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(standards));
    } catch (e) {
        console.error('Failed to save qualification standards:', e);
    }
}

export function getActiveStandards(): QualificationStandard[] {
    const custom = getCustomStandards();
    
    // Combine defaults and custom (custom overrides defaults based on positionTitle + schoolLevel)
    const combined = [...DEFAULT_STANDARDS];
    
    custom.forEach(cust => {
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

export function getStandardsFor(position: string, level: string) {
    const active = getActiveStandards();
    const normalizedPos = position.trim().toLowerCase();
    const normalizedLevel = (level || 'Junior High School').trim();
    
    // Exact match
    const exactMatch = active.find(s => 
        s.positionTitle.toLowerCase() === normalizedPos &&
        s.schoolLevel === normalizedLevel
    );
    if (exactMatch) return exactMatch;
    
    // Soft match (just match title title)
    const titleMatch = active.find(s => 
        s.positionTitle.toLowerCase() === normalizedPos
    );
    if (titleMatch) return titleMatch;

    // Fallback default
    return {
        id: 'fallback',
        positionTitle: position.toUpperCase(),
        schoolLevel: level as any,
        education: "Bachelor's degree in Education or equivalent with professional units",
        training: "None required",
        experience: "None required",
        eligibility: "RA 1080 (Teacher)"
    };
}
