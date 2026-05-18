create table public.admins (
  id uuid not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  gender public.gender_enum null,
  birth_date date null,
  profile_pic text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint admins_pkey primary key (id),
  constraint admins_email_key unique (email),
  constraint admins_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.applicants (
  id uuid not null default gen_random_uuid (),
  ies_no text not null,
  applicant_code text not null,
  applied_position_id uuid not null,
  first_name text not null,
  middle_name text null,
  last_name text not null,
  name_extension text null,
  birth_date date null,
  gender public.gender_enum null,
  civil_status text null,
  religion text null,
  disability text null,
  ethnic_group text null,
  email text null,
  contact_no text null,
  address text null,
  eligibility text null,
  education jsonb null default '[]'::jsonb,
  trainings jsonb null default '[]'::jsonb,
  experiences jsonb null default '[]'::jsonb,
  status text null,
  performance text null,
  hiring_date date not null default CURRENT_DATE,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint applicants_pkey primary key (id),
  constraint applicants_applicant_code_key unique (applicant_code),
  constraint applicants_ies_no_key unique (ies_no),
  constraint applicants_position_fkey foreign KEY (applied_position_id) references positions (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.departments (
  id uuid not null default gen_random_uuid (),
  name text not null,
  code text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint departments_pkey primary key (id),
  constraint departments_name_key unique (name)
) TABLESPACE pg_default;

create table public.employee_children (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  child_name text not null,
  birth_date date null,
  created_at timestamp with time zone null default now(),
  constraint employee_children_pkey primary key (id),
  constraint employee_children_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.employee_education (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  level text not null,
  school_name text not null,
  degree_course text null,
  attendance_from text null,
  attendance_to text null,
  level_units_earned text null,
  year_graduated text null,
  honors_received text null,
  created_at timestamp with time zone null default now(),
  constraint employee_education_pkey primary key (id),
  constraint employee_education_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.employee_eligibility (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  eligibility_name text not null,
  rating text null,
  exam_date date null,
  exam_place text null,
  license_number text null,
  license_valid_until date null,
  created_at timestamp with time zone null default now(),
  constraint employee_eligibility_pkey primary key (id),
  constraint employee_eligibility_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.employee_family (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  spouse_lastname text null,
  spouse_firstname text null,
  spouse_middlename text null,
  spouse_extension text null,
  spouse_occupation text null,
  spouse_employer text null,
  spouse_tel_no text null,
  father_lastname text null,
  father_firstname text null,
  father_middlename text null,
  father_extension text null,
  mother_maiden_lastname text null,
  mother_firstname text null,
  mother_middlename text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint employee_family_pkey primary key (id),
  constraint employee_family_employee_id_key unique (employee_id),
  constraint employee_family_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.employee_pds (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  place_of_birth text null,
  sex_at_birth text null,
  civil_status text null,
  height_m numeric(5, 2) null,
  weight_kg numeric(5, 2) null,
  blood_type text null,
  umid_no text null,
  pagibig_id_no text null,
  philhealth_no text null,
  philsys_id_no text null,
  tin_no text null,
  agency_employee_no text null,
  citizenship text null,
  res_house_no text null,
  res_street text null,
  res_subdivision text null,
  res_barangay text null,
  res_city text null,
  res_province text null,
  res_zip_code text null,
  perm_house_no text null,
  perm_street text null,
  perm_subdivision text null,
  perm_barangay text null,
  perm_city text null,
  perm_province text null,
  perm_zip_code text null,
  tel_no text null,
  mobile_no text null,
  email text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint employee_pds_pkey primary key (id),
  constraint employee_pds_employee_id_key unique (employee_id),
  constraint employee_pds_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.employees (
  id uuid not null default gen_random_uuid (),
  employee_id text not null,
  position_id uuid null,
  first_name text not null,
  middle_name text null,
  last_name text not null,
  birth_date date null,
  gender public.gender_enum null,
  civil_service_eligibility text null,
  tin text null,
  photo_url text null,
  is_deceased boolean null default false,
  status public.employment_status null default 'Active'::employment_status,
  actual_salary numeric(12, 2) null,
  ppa_attribution text null,
  license_expiration_date date null,
  original_appointment_date date null,
  last_promotion_date date null,
  retirement_date date null,
  resigned_date date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint employees_pkey primary key (id),
  constraint employees_employee_id_key unique (employee_id),
  constraint employees_position_fkey foreign KEY (position_id) references positions (id) on delete set null
) TABLESPACE pg_default;


create table public.positions (
  id uuid not null default gen_random_uuid (),
  item_number text not null,
  title text not null,
  department_id uuid null,
  salary_grade_id uuid null,
  classification text not null,
  level text null,
  area_code text null,
  area_type text null,
  is_active boolean not null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint positions_pkey primary key (id),
  constraint positions_item_number_key unique (item_number),
  constraint positions_department_fkey foreign KEY (department_id) references departments (id) on delete set null,
  constraint positions_salary_fkey foreign KEY (salary_grade_id) references salary_grades (id) on delete set null
) TABLESPACE pg_default;

create table public.salary_grades (
  id uuid not null default gen_random_uuid (),
  grade integer not null,
  step integer not null default 1,
  salary numeric(12, 2) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint salary_grades_pkey primary key (id),
  constraint unique_grade_step unique (grade, step)
) TABLESPACE pg_default;

create table public.employee_work_experience (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  inclusive_date_from date null,
  inclusive_date_to date null,
  position_title text not null,
  department_agency_company text not null,
  status_of_appointment text null,
  is_government_service boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint employee_work_experience_pkey primary key (id),
  constraint employee_work_experience_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;