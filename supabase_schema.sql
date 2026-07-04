-- Supabase Schema for Soma Spa
-- Copy and run this script in your Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor)

-- 1. Create spa_metadata table
CREATE TABLE IF NOT EXISTS public.spa_metadata (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_palette TEXT,
    hours JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (optional, or disable if you want public access for simplicity)
ALTER TABLE public.spa_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write access to spa_metadata" ON public.spa_metadata
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialty TEXT,
    experience TEXT,
    rating NUMERIC DEFAULT 5.0,
    avatar_url TEXT,
    salary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    attendance JSONB DEFAULT '{}'::jsonb,
    salaries_paid JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write access to employees" ON public.employees
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration TEXT,
    price NUMERIC DEFAULT 0,
    category TEXT NOT NULL,
    description TEXT,
    benefits TEXT[] DEFAULT '{}'::text[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write access to services" ON public.services
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    therapist TEXT DEFAULT 'Any Available Therapist',
    status TEXT DEFAULT 'Confirmed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write access to bookings" ON public.bookings
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT DEFAULT 'Indore',
    rating NUMERIC DEFAULT 5,
    comment TEXT,
    date TEXT,
    service TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write access to reviews" ON public.reviews
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
