-- PDS Schema Extensions

-- 1. Detailed Personal Info (One-to-one with employees)
CREATE TABLE public.employee_pds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  place_of_birth text,
  sex_at_birth text,
  civil_status text,
  height_m numeric(5,2),
  weight_kg numeric(5,2),
  blood_type text,
  
  -- IDs
  umid_no text,
  pagibig_id_no text,
  philhealth_no text,
  philsys_id_no text,
  tin_no text,
  agency_employee_no text,
  
  citizenship text,
  
  -- Addresses
  res_house_no text,
  res_street text,
  res_subdivision text,
  res_barangay text,
  res_city text,
  res_province text,
  res_zip_code text,
  
  perm_house_no text,
  perm_street text,
  perm_subdivision text,
  perm_barangay text,
  perm_city text,
  perm_province text,
  perm_zip_code text,
  
  tel_no text,
  mobile_no text,
  email text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_pds_pkey PRIMARY KEY (id),
  CONSTRAINT employee_pds_employee_id_key UNIQUE (employee_id)
) TABLESPACE pg_default;

-- 2. Family Background
CREATE TABLE public.employee_family (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Spouse
  spouse_lastname text,
  spouse_firstname text,
  spouse_middlename text,
  spouse_extension text,
  spouse_occupation text,
  spouse_employer text,
  spouse_tel_no text,
  
  -- Father
  father_lastname text,
  father_firstname text,
  father_middlename text,
  father_extension text,
  
  -- Mother
  mother_maiden_lastname text,
  mother_firstname text,
  mother_middlename text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_family_pkey PRIMARY KEY (id),
  CONSTRAINT employee_family_employee_id_key UNIQUE (employee_id)
) TABLESPACE pg_default;

-- 3. Children (One-to-many)
CREATE TABLE public.employee_children (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  child_name text NOT NULL,
  birth_date date,
  
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_children_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 4. Education (One-to-many)
CREATE TABLE public.employee_education (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  level text NOT NULL, -- e.g., 'Elementary', 'Secondary', 'Vocational', 'College', 'Graduate'
  school_name text NOT NULL,
  degree_course text,
  attendance_from text,
  attendance_to text,
  level_units_earned text,
  year_graduated text,
  honors_received text,
  
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_education_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 5. Eligibility (One-to-many)
CREATE TABLE public.employee_eligibility (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  eligibility_name text NOT NULL,
  rating text,
  exam_date date,
  exam_place text,
  license_number text,
  license_valid_until date,
  
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_eligibility_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE employee_pds ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_family ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_eligibility ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified: Admins can manage everything)
CREATE POLICY "Admins can manage employee_pds" ON employee_pds FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "Admins can manage employee_family" ON employee_family FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "Admins can manage employee_children" ON employee_children FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "Admins can manage employee_education" ON employee_education FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "Admins can manage employee_eligibility" ON employee_eligibility FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
