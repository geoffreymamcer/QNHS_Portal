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

-- 2. Create Positions Table (Permanent Plantilla Slots)
-- Item numbers are permanent. A position is "vacant" when no active employee holds it.
CREATE TABLE positions (
    item_number TEXT PRIMARY KEY,
    position_title TEXT NOT NULL,
    classification TEXT NOT NULL,  -- Teaching / Non-Teaching
    department TEXT,
    level TEXT,                    -- Secondary, Elementary, Senior High
    salary_grade INTEGER,
    annual_salary_authorized DECIMAL(12, 2),
    area_code TEXT,
    area_type TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE = abolished/removed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Employees Table (People who occupy positions)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL,  -- e.g. 2024-001 (Internal System ID)
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
    classification TEXT NOT NULL,  -- e.g. Teaching / Non-Teaching
    department TEXT,               -- e.g. Mathematics, Administration
    status TEXT,                   -- e.g. Permanent, Contractual
    level TEXT,                    -- e.g. Elementary, Secondary

    -- Plantilla / Position Info (soft reference to positions.item_number)
    item_number TEXT,              -- References positions.item_number (no FK to preserve history)
    salary_grade INTEGER,
    step INTEGER,
    annual_salary_authorized DECIMAL(12, 2),
    annual_salary_actual DECIMAL(12, 2),

    -- License / Eligibility Info
    license_expiration_date DATE,

    -- Area Info
    area_code TEXT,
    area_type TEXT,

    -- Assignment / Attribution
    ppa_attribution TEXT,

    -- Key Dates
    original_appointment_date DATE,
    last_promotion_date DATE,
    retirement_date DATE,
    resigned_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 5. Admins Policies
CREATE POLICY "Admins can view own profile"
ON admins FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 6. Positions Policies
CREATE POLICY "Admins can manage positions"
ON positions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
    )
);

-- 7. Employees Policies
CREATE POLICY "Admins can manage employees"
ON employees FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
    )
);

-- 8. Storage Policies
CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'employee-photos' AND
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Public can view employee photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-photos');

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


-- ─────────────────────────────────────────────
-- MIGRATION SCRIPT (Run once in Supabase SQL Editor if upgrading from old schema)
-- ─────────────────────────────────────────────
-- Step 1: Create the positions table (run CREATE TABLE above first)
-- Step 2: Seed positions from existing employee data:
--
-- INSERT INTO positions (
--     item_number, position_title, classification,
--     department, level, salary_grade, annual_salary_authorized
-- )
-- SELECT DISTINCT ON (item_number)
--     item_number, position_title, classification,
--     department, level, salary_grade, annual_salary_authorized
-- FROM employees
-- WHERE item_number IS NOT NULL AND item_number != ''
-- ON CONFLICT (item_number) DO NOTHING;
-- ─────────────────────────────────────────────


-- DUMMY DATA SEED
-- ─────────────────────────────────────────────
-- BULK DUMMY DATA GENERATION (400 Positions & 400 Employees)
-- Run this in Supabase SQL Editor to populate the system for testing.
-- ─────────────────────────────────────────────

DO $$
DECLARE
    i INTEGER;
    v_dept TEXT;
    v_class TEXT;
    v_gender TEXT;
    v_surname TEXT[];
    v_first_name TEXT[];
    v_depts TEXT[] := ARRAY['Mathematics', 'Science', 'English', 'Filipino', 'MAPEH', 'AP', 'TLE', 'ESP', 'Administration'];
BEGIN
    v_surname := ARRAY['Garcia', 'Reyes', 'Dela Cruz', 'Santos', 'Mendoza', 'Bautista', 'Pascual', 'Villanueva', 'Quizon', 'Aquino'];
    v_first_name := ARRAY['Juan', 'Maria', 'Jose', 'Elena', 'Ricardo', 'Liza', 'Manuel', 'Corazon', 'Antonio', 'Teresa'];

    -- 1. Generate 400 Positions
    FOR i IN 1..400 LOOP
        v_dept := v_depts[(i % 9) + 1];
        v_class := CASE WHEN v_dept = 'Administration' THEN 'Non-Teaching' ELSE 'Teaching' END;
        
        INSERT INTO positions (
            item_number, position_title, classification, department, level, salary_grade, annual_salary_authorized
        ) VALUES (
            'OSEC-DECSB-POS-' || LPAD(i::text, 6, '0') || '-2025',
            CASE 
                WHEN v_class = 'Non-Teaching' THEN 'Admin Officer ' || ((i % 5) + 1)
                ELSE 'Teacher ' || ((i % 3) + 1)
            END,
            v_class,
            v_dept,
            'Secondary',
            CASE WHEN v_class = 'Non-Teaching' THEN 10 + (i % 8) ELSE 11 + (i % 5) END,
            300000 + (i * 1000)
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 2. Generate 400 Employees
    FOR i IN 1..400 LOOP
        v_dept := v_depts[(i % 9) + 1];
        v_class := CASE WHEN v_dept = 'Administration' THEN 'Non-Teaching' ELSE 'Teaching' END;
        v_gender := CASE WHEN i % 2 = 0 THEN 'Female' ELSE 'Male' END;
        
        INSERT INTO employees (
            employee_id, first_name, last_name, mid_name, sex, birthdate,
            position_title, classification, department, level, status,
            item_number, salary_grade, original_appointment_date, is_deceased
        ) VALUES (
            '2025-' || LPAD(i::text, 4, '0'),
            v_first_name[(i % 10) + 1],
            v_surname[((i+5) % 10) + 1],
            'D.',
            v_gender,
            DATE '1970-01-01' + (i * INTERVAL '35 days'), -- Distributed ages
            CASE 
                WHEN v_class = 'Non-Teaching' THEN 'Admin Officer ' || ((i % 5) + 1)
                ELSE 'Teacher ' || ((i % 3) + 1)
            END,
            v_class,
            v_dept,
            'Secondary',
            'Permanent',
            'OSEC-DECSB-POS-' || LPAD(i::text, 6, '0') || '-2025',
            CASE WHEN v_class = 'Non-Teaching' THEN 10 + (i % 8) ELSE 11 + (i % 5) END,
            DATE '2010-01-01' + (i * INTERVAL '12 days'),
            (i % 50 = 0) -- Every 50th is deceased
        );

        -- Add some Separation cases (Resigned / Retired)
        IF i % 15 = 0 THEN
            UPDATE employees SET resigned_date = DATE '2025-01-01' + (i * INTERVAL '1 day') 
            WHERE employee_id = '2025-' || LPAD(i::text, 4, '0');
        ELSIF i % 20 = 0 THEN
            UPDATE employees SET retirement_date = DATE '2024-12-01' + (i * INTERVAL '1 day')
            WHERE employee_id = '2025-' || LPAD(i::text, 4, '0');
        END IF;
    END LOOP;
END $$;
