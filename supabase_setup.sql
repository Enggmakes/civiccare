-- ============================================================================
-- CivicCare: Supabase Database Setup & Initial Migration Script
-- Project Reference: soxepjypgtbcjiiurhmk
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/soxepjypgtbcjiiurhmk/sql/new
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE report_status_enum AS ENUM (
        'Submitted',
        'AI_Verified',
        'Routed',
        'In Progress',
        'Resolved',
        'Closed',
        'Duplicate'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level_enum AS ENUM (
        'Low',
        'Medium',
        'High',
        'Critical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255),
    sla_hours INTEGER DEFAULT 48,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Issue Categories Table
CREATE TABLE IF NOT EXISTS public.issue_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    default_department_id UUID REFERENCES public.departments(id),
    default_severity severity_level_enum DEFAULT 'Medium',
    icon_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Reports Table (Main Civic Tickets Entity)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. '#CC20241026'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(50) NOT NULL, -- 'Pothole', 'Garbage', 'Streetlight', 'Water Leak', 'Broken Road', 'Others'
    severity severity_level_enum NOT NULL DEFAULT 'Medium',
    status report_status_enum NOT NULL DEFAULT 'Submitted',
    formatted_address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    primary_image_url TEXT,
    department_name VARCHAR(150) DEFAULT 'Road Maintenance Dept.',
    subscriber_count INTEGER DEFAULT 1,
    ai_confidence NUMERIC(4,3) DEFAULT 0.940,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Report Status History Table (Milestone Progress Timeline)
CREATE TABLE IF NOT EXISTS public.report_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    step INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    remarks TEXT,
    is_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Seed Initial Departments
INSERT INTO public.departments (id, code, name, contact_email, sla_hours) VALUES
('b3a985d2-6d43-4f51-b844-3d0d8bb00101', 'ROAD_MAINTENANCE', 'Road Maintenance Department', 'roads@mcgm.gov.in', 48),
('b3a985d2-6d43-4f51-b844-3d0d8bb00102', 'SOLID_WASTE', 'Solid Waste Management Department', 'waste@mcgm.gov.in', 24),
('b3a985d2-6d43-4f51-b844-3d0d8bb00103', 'PUBLIC_LIGHTING', 'Electrical & Public Lighting Department', 'lighting@mcgm.gov.in', 36),
('b3a985d2-6d43-4f51-b844-3d0d8bb00104', 'WATER_SUPPLY', 'Water Supply & Sewerage Department', 'water@mcgm.gov.in', 24)
ON CONFLICT (code) DO NOTHING;

-- 8. Seed Initial Issue Categories
INSERT INTO public.issue_categories (code, name, default_department_id, default_severity, icon_name) VALUES
('POTHOLE', 'Pothole', 'b3a985d2-6d43-4f51-b844-3d0d8bb00101', 'High', 'alert-circle'),
('GARBAGE', 'Garbage', 'b3a985d2-6d43-4f51-b844-3d0d8bb00102', 'Medium', 'trash-2'),
('STREETLIGHT', 'Streetlight', 'b3a985d2-6d43-4f51-b844-3d0d8bb00103', 'High', 'zap'),
('WATER_LEAK', 'Water Leak', 'b3a985d2-6d43-4f51-b844-3d0d8bb00104', 'Medium', 'droplets'),
('BROKEN_ROAD', 'Broken Road', 'b3a985d2-6d43-4f51-b844-3d0d8bb00101', 'High', 'alert-triangle'),
('OTHERS', 'Others', 'b3a985d2-6d43-4f51-b844-3d0d8bb00101', 'Low', 'grid')
ON CONFLICT (code) DO NOTHING;

-- 9. Seed Sample Report Records Matching image.png (Screens 3, 7, 8, 9)
INSERT INTO public.reports (
    id,
    ticket_number,
    title,
    description,
    category_id,
    severity,
    status,
    formatted_address,
    latitude,
    longitude,
    primary_image_url,
    department_name,
    subscriber_count,
    ai_confidence,
    created_at
) VALUES 
(
    'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b',
    '#CC20241026',
    'Pothole on MG Road',
    'Large pothole on the main road near city mall. It is causing problems for vehicles.',
    'Pothole',
    'High',
    'In Progress',
    'MG Road, Andheri West, Mumbai, Maharashtra',
    19.1197,
    72.8397,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    'Road Maintenance Dept.',
    3,
    0.942,
    NOW() - INTERVAL '2 hours'
),
(
    'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4c',
    '#CC20241025',
    'Overflowing garbage bin',
    'Municipal garbage bin overflowing near local bus stop, foul smell spreading.',
    'Garbage',
    'Medium',
    'Submitted',
    'Linking Road, Bandra West, Mumbai',
    19.0596,
    72.8295,
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    'Solid Waste Management Dept.',
    1,
    0.910,
    NOW() - INTERVAL '1 day'
),
(
    'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4d',
    '#CC20241024',
    'Broken streetlight',
    'Main street lamp post damaged with exposed wiring hanging near sidewalk.',
    'Streetlight',
    'High',
    'Resolved',
    'Hiranandani Gardens, Powai, Mumbai',
    19.1176,
    72.9060,
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    'Electrical & Lighting Dept.',
    5,
    0.965,
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (ticket_number) DO NOTHING;

-- 10. Enable Row Level Security (RLS) with Permissive Access for Mobile App Anon Key
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;

-- Allow Anon & Authenticated users to read all public reports
DROP POLICY IF EXISTS "Public read access on reports" ON public.reports;
CREATE POLICY "Public read access on reports"
    ON public.reports FOR SELECT
    USING (true);

-- Allow Anon & Authenticated users to insert reports
DROP POLICY IF EXISTS "Public insert access on reports" ON public.reports;
CREATE POLICY "Public insert access on reports"
    ON public.reports FOR INSERT
    WITH CHECK (true);

-- Allow Anon & Authenticated users to update reports (e.g., upvoting or status)
DROP POLICY IF EXISTS "Public update access on reports" ON public.reports;
CREATE POLICY "Public update access on reports"
    ON public.reports FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policies for reference tables
DROP POLICY IF EXISTS "Public read on departments" ON public.departments;
CREATE POLICY "Public read on departments"
    ON public.departments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public read on categories" ON public.issue_categories;
CREATE POLICY "Public read on categories"
    ON public.issue_categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public insert on categories" ON public.issue_categories;
CREATE POLICY "Public insert on categories"
    ON public.issue_categories FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public read on status history" ON public.report_status_history;
CREATE POLICY "Public read on status history"
    ON public.report_status_history FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public insert on status history" ON public.report_status_history;
CREATE POLICY "Public insert on status history"
    ON public.report_status_history FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public update on status history" ON public.report_status_history;
CREATE POLICY "Public update on status history"
    ON public.report_status_history FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 11. Create Storage Bucket for Citizen Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Allow public upload and download
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Public Storage Upload" ON storage.objects;
CREATE POLICY "Public Storage Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'report-images');

-- 12. Create Civic Helplines Directory Table (Zero-Bundle Dynamic Lookup)
CREATE TABLE IF NOT EXISTS public.civic_helplines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    number VARCHAR(30) NOT NULL,
    desc_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & public read access
ALTER TABLE public.civic_helplines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read on civic_helplines" ON public.civic_helplines;
CREATE POLICY "Public read on civic_helplines"
    ON public.civic_helplines FOR SELECT
    USING (true);

-- Seed Initial Maharashtra Civic Authorities & Talukas
INSERT INTO public.civic_helplines (city, district, name, number, desc_text) VALUES
('Ahilyanagar', 'Ahilyanagar', 'Ahilyanagar Municipal Corporation', '18002330241', 'Civic grievances & 24x7 control room'),
('Parner', 'Ahilyanagar', 'Parner Nagar Panchayat Control', '02488221235', 'Taluka civic & emergency control'),
('Junnar', 'Pune', 'Junnar Municipal Council Control', '02132222035', 'Taluka municipal & civic helpline'),
('Pune', 'Pune', 'PMC 24x7 Citizen Care Helpline', '18001030222', 'Potholes, sanitation & water supply'),
('Pimpri-Chinchwad', 'Pune', 'PCMC Sarathi Grievance Center', '02067333333', 'Drainage, waste & road repairs'),
('Mumbai', 'Mumbai', 'BMC 24x7 Civic Disaster & Grievance', '1916', 'Potholes, flooding, open manholes'),
('Thane', 'Thane', 'TMC Disaster & Grievance Control', '1800222391', 'Civic hazards & municipal aid'),
('Navi Mumbai', 'Thane', 'NMMC Citizen Grievance Cell', '1800222309', 'Municipal complaints & disaster dispatch'),
('Palghar', 'Palghar', 'Palghar Municipal Council Control', '02525252322', 'Civic grievances & local council'),
('Nashik', 'Nashik', 'Nashik Municipal Corporation Control', '02532575631', 'Civic disaster & sanitation hotline'),
('Nagpur', 'Nagpur', 'NMC Citizen Care Center', '07122567035', 'Grievance & civic emergency helpline'),
('Chhatrapati Sambhajinagar', 'Chhatrapati Sambhajinagar', 'CSMC 24x7 Grievance Helpline', '02402333536', 'Municipal disaster & civic control')
ON CONFLICT DO NOTHING;

