-- 1. Create Admins Table
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    gender TEXT,
    dob DATE,
    profile_pic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Employees Table (Refactored Schema)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL, -- e.g. 2024-001 (Internal System ID)
    photo_url TEXT,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    mid_name TEXT,
    last_name TEXT NOT NULL,
    birthdate DATE,
    sex TEXT,
    tin TEXT,
    civil_service_eligibility TEXT,
    is_deceased BOOLEAN DEFAULT FALSE,
    
    -- Employment Details
    position_title TEXT NOT NULL,
    classification TEXT NOT NULL, -- e.g. Teaching / Non-Teaching
    department TEXT, -- e.g. Mathematics, Administration
    status TEXT, -- e.g. Permanent, Contractual
    level TEXT, -- e.g. Elementary, Secondary
    
    -- Plantilla / Position Info
    item_number TEXT, -- Fixed position slot number
    salary_grade INTEGER, -- e.g. 11, 13
    step INTEGER, -- e.g. 1, 2, 3
    annual_salary_authorized DECIMAL(12, 2),
    annual_salary_actual DECIMAL(12, 2),
    
    -- Area Info
    area_code TEXT,
    area_type TEXT,
    
    -- Assignment / Attribution
    ppa_attribution TEXT, -- P/P/A Attribution
    
    -- Key Dates
    original_appointment_date DATE,
    last_promotion_date DATE,
    retirement_date DATE,
    resigned_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 4. Admins Policies
CREATE POLICY "Admins can view own profile" 
ON admins FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 5. Employees Policies
CREATE POLICY "Admins can manage employees" 
ON employees FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
    )
);

-- 6. Storage Policies
-- Bucket: employee-photos

CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Bucket: employee-photos
CREATE POLICY "Public can view employee photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-photos');

-- New Policy for User Uploads (restricted to owner's folder)
CREATE POLICY "Public can view own uploads"
  ON storage.objects
  FOR SELECT
  TO PUBLIC
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- DUMMY DATA SEED
INSERT INTO employees (
    employee_id, first_name, last_name, position_title, classification, 
    department, salary_grade, item_number, status, level
)
VALUES 
('2024-001', 'John', 'Doe', 'Teacher III', 'Teaching', 'Mathematics', 13, 'OSEC-DECSB-TCH3-540123-2023', 'Permanent', 'Secondary'),
('2024-002', 'Sarah', 'Smith', 'Master Teacher I', 'Teaching', 'Science', 18, 'OSEC-DECSB-MTCH1-540001-2020', 'Permanent', 'Secondary'),
('2024-003', 'Robert', 'Johnson', 'Administrative Officer V', 'Non-Teaching', 'Administration', 18, 'OSEC-DECSB-ADOF5-540012-2015', 'Permanent', 'Secondary');
