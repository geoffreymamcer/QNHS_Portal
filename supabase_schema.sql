-- ENUMS for standardizing fixed values (Optional but highly recommended)
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other', 'Prefer Not to Say');
CREATE TYPE employment_status AS ENUM ('Active', 'Resigned', 'Retired', 'Terminated', 'On Leave');

-- 1. Lookups / Reference Tables
-- Extracted from your string fields to ensure data consistency
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE TABLE public.salary_grades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grade integer NOT NULL,
  step integer NOT NULL DEFAULT 1,
  salary numeric(12, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT salary_grades_pkey PRIMARY KEY (id),
  CONSTRAINT unique_grade_step UNIQUE (grade, step) -- A grade+step should only have one salary
) TABLESPACE pg_default;

-- 2. Positions Table
-- Cleaned up: Uses UUID as Primary Key, links to Lookups, removed redundant employee data
CREATE TABLE public.positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_number text NOT NULL,
  title text NOT NULL,
  department_id uuid NULL,
  salary_grade_id uuid NULL,
  classification text NOT NULL,
  level text NULL,
  area_code text NULL,
  area_type text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT positions_pkey PRIMARY KEY (id),
  CONSTRAINT positions_item_number_key UNIQUE (item_number),
  CONSTRAINT positions_department_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL,
  CONSTRAINT positions_salary_fkey FOREIGN KEY (salary_grade_id) REFERENCES public.salary_grades(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 3. Employees Table
-- Cleaned up: Standardized names, removed duplicated position data, linked to Positions table
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  position_id uuid NULL, -- THIS replaces classification, department, level, item_number, area_code
  
  -- Personal Details
  first_name text NOT NULL,
  middle_name text NULL,
  last_name text NOT NULL,
  birth_date date NULL,
  gender gender_enum NULL,
  civil_service_eligibility text NULL,
  tin text NULL,
  photo_url text NULL,
  is_deceased boolean DEFAULT false,

  -- Employment & Salary Details
  status employment_status DEFAULT 'Active',
  actual_salary numeric(12, 2) NULL, -- Only needed if different from the salary_grade amount
  ppa_attribution text NULL,
  license_expiration_date date NULL,

  -- Dates
  original_appointment_date date NULL,
  last_promotion_date date NULL,
  retirement_date date NULL,
  resigned_date date NULL,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_employee_id_key UNIQUE (employee_id),
  CONSTRAINT employees_position_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 4. Applicants Table
-- Cleaned up: Standardized names to match employees, linked applied position to the actual positions table
CREATE TABLE public.applicants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ies_no text NOT NULL,
  applicant_code text NOT NULL,
  applied_position_id uuid NOT NULL, -- Replaced string with Foreign Key
  
  -- Standardized Personal Details
  first_name text NOT NULL,
  middle_name text NULL,
  last_name text NOT NULL,
  name_extension text NULL,
  birth_date date NULL, -- Replaced "age" (Age should be calculated dynamically from birth_date)
  gender gender_enum NULL,
  civil_status text NULL,
  religion text NULL,
  disability text NULL,
  ethnic_group text NULL,
  
  -- Contact Details
  email text NULL,
  contact_no text NULL,
  address text NULL,
  
  -- Resume Details
  eligibility text NULL,
  education jsonb DEFAULT '[]'::jsonb,
  trainings jsonb DEFAULT '[]'::jsonb,
  experiences jsonb DEFAULT '[]'::jsonb,
  
  status text NULL,
  performance text NULL,
  hiring_date date NOT NULL DEFAULT CURRENT_DATE,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applicants_pkey PRIMARY KEY (id),
  CONSTRAINT applicants_applicant_code_key UNIQUE (applicant_code),
  CONSTRAINT applicants_ies_no_key UNIQUE (ies_no),
  CONSTRAINT applicants_position_fkey FOREIGN KEY (applied_position_id) REFERENCES public.positions(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 5. Admins Table
-- Cleaned up: Standardized names to match everyone else
CREATE TABLE public.admins (
  id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  gender gender_enum NULL,
  birth_date date NULL,
  profile_pic text NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_email_key UNIQUE (email),
  CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;


-- ENABLE RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_grades ENABLE ROW LEVEL SECURITY;

-- 5. Admins Policies
DROP POLICY IF EXISTS "Admins can view own profile" ON admins;
CREATE POLICY "Admins can view own profile"
ON admins FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 6. Positions Policies
DROP POLICY IF EXISTS "Admins can manage positions" ON positions;
CREATE POLICY "Admins can manage positions"
ON positions FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- 7. Employees Policies
DROP POLICY IF EXISTS "Admins can manage employees" ON employees;
CREATE POLICY "Admins can manage employees"
ON employees FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- 11. Applicants Policies
DROP POLICY IF EXISTS "Admins can manage applicants" ON applicants;
CREATE POLICY "Admins can manage applicants"
ON applicants FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- 12. Salary Grades Policies
DROP POLICY IF EXISTS "Admins can manage salary grades" ON salary_grades;
CREATE POLICY "Admins can manage salary grades"
ON salary_grades FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view salary grades" ON salary_grades;
CREATE POLICY "Authenticated users can view salary grades"
ON salary_grades FOR SELECT
TO authenticated
USING (TRUE);

-- 8. Storage Policies
DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;
CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Public can view employee photos" ON storage.objects;
CREATE POLICY "Public can view employee photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-photos');

DROP POLICY IF EXISTS "Public can view own uploads" ON storage.objects;
CREATE POLICY "Public can view own uploads"
  ON storage.objects
  FOR SELECT
  TO PUBLIC
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;
CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);