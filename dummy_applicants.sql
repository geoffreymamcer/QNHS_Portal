-- 1. Ensure reference positions exist first so foreign keys match perfectly
INSERT INTO public.positions (item_number, title, classification, is_active)
VALUES 
  ('ITEM-T1-100', 'Teacher I', 'Teaching', true),
  ('ITEM-T2-200', 'Teacher II', 'Teaching', true),
  ('ITEM-T3-300', 'Teacher III', 'Teaching', true),
  ('ITEM-MT1-400', 'Master Teacher I', 'Teaching', true)
ON CONFLICT (item_number) DO UPDATE 
SET title = EXCLUDED.title, is_active = true;

-- 2. Populate teaching Applicants sharing the EXACT same hiring date (e.g., '2026-05-18')
WITH pos_ids AS (
  SELECT id, title FROM public.positions
)
INSERT INTO public.applicants (
  ies_no,
  applicant_code,
  applied_position_id,
  first_name,
  middle_name,
  last_name,
  name_extension,
  birth_date,
  gender,
  civil_status,
  religion,
  disability,
  ethnic_group,
  email,
  contact_no,
  address,
  eligibility,
  education,
  trainings,
  experiences,
  status,
  performance,
  hiring_date
)
VALUES
  (
    'IES-2026-001',
    'APP-2026-001',
    (SELECT id FROM pos_ids WHERE title = 'Teacher I' LIMIT 1),
    'John', 'Santos', 'Dela Cruz', NULL,
    '1996-04-12', 'Male', 'Single', 'Roman Catholic', 'None', 'Tagalog',
    'john.delacruz@email.com', '09171234567', 'Brgy. Ibabang Iyam, Lucena City',
    'LET (Licensure Examination for Teachers)',
    '[{"level": "College", "school": "Southern Luzon State University", "degree": "Bachelor of Secondary Education (BSEd)", "yearGraduated": "2018"}]'::jsonb,
    '[{"title": "National Training on Pedagogy and Curriculum Development", "hours": "40"}]'::jsonb,
    '[{"details": "Substitute Teacher at Lucena West Elementary School", "from": "2020-06-01", "to": "2021-03-31"}]'::jsonb,
    'Qualified', 'Met', '2026-05-18'
  ),
  (
    'IES-2026-002',
    'APP-2026-002',
    (SELECT id FROM pos_ids WHERE title = 'Teacher II' LIMIT 1),
    'Maria Clara', 'Luna', 'Salazar', NULL,
    '1993-08-24', 'Female', 'Married', 'Roman Catholic', 'None', 'Bicolano',
    'maria.salazar@email.com', '09187654321', 'Red V, Lucena City',
    'LET (Licensure Examination for Teachers)',
    '[{"level": "College", "school": "Philippine Normal University", "degree": "Bachelor of Elementary Education (BEEd)", "yearGraduated": "2015"}]'::jsonb,
    '[{"title": "Seminar on Classroom Management and Inclusivity", "hours": "24"}]'::jsonb,
    '[{"details": "Teacher I at DepEd Division of Quezon", "from": "2016-06-01", "to": "2023-05-31"}]'::jsonb,
    'Qualified', 'Met', '2026-05-18'
  ),
  (
    'IES-2026-003',
    'APP-2026-003',
    (SELECT id FROM pos_ids WHERE title = 'Teacher III' LIMIT 1),
    'Angelica', 'Reyes', 'Santos', NULL,
    '1990-11-05', 'Female', 'Single', 'Roman Catholic', 'None', 'Tagalog',
    'angelica.santos@email.com', '09228889999', 'Iyam, Lucena City',
    'LET (Licensure Examination for Teachers)',
    '[{"level": "College", "school": "Sacred Heart College", "degree": "BS Secondary Education", "yearGraduated": "2012"}]'::jsonb,
    '[{"title": "Advanced Educational Leadership Workshop", "hours": "32"}]'::jsonb,
    '[{"details": "Teacher II at Quezon National High School", "from": "2015-01-01", "to": "2025-12-31"}]'::jsonb,
    'Qualified', 'Met', '2026-05-18'
  ),
  (
    'IES-2026-004',
    'APP-2026-004',
    (SELECT id FROM pos_ids WHERE title = 'Teacher I' LIMIT 1),
    'Sarah', 'Grace', 'Ocampo', NULL,
    '1998-01-15', 'Female', 'Single', 'Christian', 'None', 'Tagalog',
    'sarah.ocampo@email.com', '09159998888', 'Brgy. Gulang-Gulang, Lucena City',
    'LET (Licensure Examination for Teachers)',
    '[{"level": "College", "school": "Manuel S. Enverga University", "degree": "Bachelor of Secondary Education", "yearGraduated": "2020"}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'Qualified', 'Not Met', '2026-05-18'
  )
ON CONFLICT (ies_no) DO NOTHING;
