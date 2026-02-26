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

-- 2. Create Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL, -- e.g. 2024-001
    photo_url TEXT,
    employee_num TEXT,
    first_name TEXT NOT NULL,
    mid_name TEXT,
    last_name TEXT NOT NULL,
    sex TEXT,
    birthdate DATE,
    civil_status TEXT,
    pagibig_number TEXT,
    philhealth_number TEXT,
    gsis_number TEXT,
    account_number TEXT,
    tin TEXT,
    position TEXT,
    position_classification TEXT,
    department TEXT,
    contact_no TEXT,
    hired_date DATE,
    date_promoted DATE,
    last_assign TEXT,
    email TEXT,
    retirement_date DATE,
    resigned_date DATE,
    transferred_date DATE,
    is_deceased BOOLEAN DEFAULT FALSE,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 4. Admins Policies
-- Admins can only see their own profile
CREATE POLICY "Admins can view own profile" 
ON admins FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 5. Employees Policies
-- Only users in the 'admins' table can manage employees
CREATE POLICY "Admins can manage employees" 
ON employees FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
    )
);

-- 6. Storage Policies (Run in Supabase SQL Editor)
-- Replace 'employee-photos' with your bucket name if different

-- Allow authenticated admins to upload photos
CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Allow public to view photos (for publicUrl access)
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-photos');

-- Allow admins to update photos
CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Allow admins to delete photos
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-------------------------------------------------------------------------------
-- HOW TO CREATE AN ADMIN ACCOUNT:
-------------------------------------------------------------------------------
-- 1. Go to Supabase Dashboard > Authentication > Users.
-- 2. Click "Add User" and create an account with an email and password.
-- 3. Copy the 'User ID' (UUID) of the newly created user.
-- 4. Run the following SQL with your data:

/*
INSERT INTO admins (id, name, email, gender, dob)
VALUES (
    'INSERT_COPIED_UUID_HERE', 
    'Your Full Name', 
    'your.email@qnhs.edu.ph', 
    'Male/Female', 
    '1990-01-01'
);
*/

-------------------------------------------------------------------------------
-- DUMMY DATA SEED (OPTIONAL)
-------------------------------------------------------------------------------
-- Run this to populate the table with initial sample data for testing.

INSERT INTO employees (employee_id, first_name, last_name, position, department, position_classification, email, birthdate)
VALUES 
('2024-001', 'John', 'Doe', 'Teacher III', 'Mathematics', 'Teaching', 'john.doe@qnhs.edu.ph', '1985-06-15'),
('2024-002', 'Sarah', 'Smith', 'Master Teacher I', 'Science', 'Teaching', 'sarah.smith@qnhs.edu.ph', '1962-09-20'),
('2024-003', 'Robert', 'Johnson', 'Administrative Officer V', 'Administrative', 'Non-Teaching', 'robert.johnson@qnhs.edu.ph', '1978-03-12'),
('2024-004', 'Maria', 'Garcia', 'Teacher II', 'English', 'Teaching', 'maria.garcia@qnhs.edu.ph', '1992-11-25'),
('2024-005', 'James', 'Wilson', 'Head Teacher III', 'MAPEH', 'Teaching', 'james.wilson@qnhs.edu.ph', '1980-01-05');
