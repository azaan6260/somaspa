-- Supabase Schema & Seed Data for Soma Spa
-- Copy and run this script in your Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor -> New Query)

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.spa_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read-write access to spa_metadata
DROP POLICY IF EXISTS "Allow public read-write access to spa_metadata" ON public.spa_metadata;
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

DROP POLICY IF EXISTS "Allow public read-write access to employees" ON public.employees;
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

DROP POLICY IF EXISTS "Allow public read-write access to services" ON public.services;
CREATE POLICY "Allow public read-write access to services" ON public.services
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);


-- 4. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

DROP POLICY IF EXISTS "Allow public read-write access to bookings" ON public.bookings;
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

DROP POLICY IF EXISTS "Allow public read-write access to reviews" ON public.reviews;
CREATE POLICY "Allow public read-write access to reviews" ON public.reviews
    AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);


---------------------------------------------------------
-- SEED DATA PRE-POPULATION
-- Inserts or updates all essential Soma Spa details
---------------------------------------------------------

-- A. Insert Spa Metadata (using the specific constant UUID the backend expects)
INSERT INTO public.spa_metadata (id, title, tagline, description, address, phone, email, logo_palette, hours)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Soma Spa',
    'SPA & WELLNESS CENTRE',
    'Welcome to Soma spa and wellness center, a premium holistic oasis combining ancient healing modalities with modern sensory refinement. Indulge in warm customized oils, organic face treatments, and tailored aromatherapies designed to soothe and restore.',
    '19 GH, 2nd Floor, Mittal Kachori building, scheme no 54, Vijay nagar, Indore 452010',
    '+91 89823 71810',
    'hello@somaspaindore.com',
    'sunset-gold',
    '[
      {"day": "Monday", "open": "08:00 AM", "close": "09:30 PM"},
      {"day": "Tuesday", "open": "08:00 AM", "close": "09:30 PM"},
      {"day": "Wednesday", "open": "08:00 AM", "close": "09:30 PM"},
      {"day": "Thursday", "open": "08:00 AM", "close": "09:30 PM"},
      {"day": "Friday", "open": "08:00 AM", "close": "09:30 PM"},
      {"day": "Saturday", "open": "08:00 AM", "close": "09:30 PM"},
      {"day": "Sunday", "open": "08:00 AM", "close": "09:30 PM"}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    logo_palette = EXCLUDED.logo_palette,
    hours = EXCLUDED.hours;


-- B. Insert Employee/Therapist Details
INSERT INTO public.employees (id, name, role, specialty, experience, rating, avatar_url, salary, status, attendance, salaries_paid)
VALUES
('siddharth', 'Siddharth Nair', 'Senior Therapist', 'Ayurvedic Treatments & Pain Management', '8 Years', 4.9, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 35000, 'Active', '{}'::jsonb, '{}'::jsonb),
('aarti', 'Aarti Holkar', 'Therapist', 'Organic Skin Facials & Aromatherapy', '6 Years', 4.8, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', 28000, 'Active', '{}'::jsonb, '{}'::jsonb),
('manoj', 'Manoj Yadav', 'Senior Therapist', 'Deep Tissue & Nirvana Hot Stones', '7 Years', 4.9, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 32000, 'Active', '{}'::jsonb, '{}'::jsonb),
('elena', 'Elena Gonsalves', 'Therapist', 'Aroma Harmony & Swedish Relaxation', '5 Years', 4.7, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 25000, 'Active', '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    specialty = EXCLUDED.specialty,
    experience = EXCLUDED.experience,
    rating = EXCLUDED.rating,
    avatar_url = EXCLUDED.avatar_url,
    salary = EXCLUDED.salary,
    status = EXCLUDED.status,
    attendance = EXCLUDED.attendance,
    salaries_paid = EXCLUDED.salaries_paid;


-- C. Insert All 20+ Spa Services & Therapies
INSERT INTO public.services (id, name, duration, price, category, description, benefits, image_url)
VALUES
('fullbody45', 'Full Body Massage Promo', '45 Mins', 999, 'massage', 'A comprehensive full body therapeutic massage designed to relax all major muscle groups and relieve stress at an exclusive, budget-friendly promotional price.', ARRAY['Improves blood circulation', 'Relieves overall body fatigue', 'Relaxes tight muscles', 'Promotes deep, sound sleep'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('swedish60', 'Swedish Massage', '60 Mins', 1999, 'massage', 'Classic Swedish massage using long gliding strokes, kneading, and friction techniques on the more superficial layers of muscles.', ARRAY['Promotes full-body relaxation', 'Reduces physical and mental stress', 'Eases superficial muscle tension', 'Improves oxygen flow in blood'], 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800'),
('deeptissue60', 'Deep Tissue Massage', '60 Mins', 2499, 'massage', 'Focuses on realigning deeper layers of muscles and connective tissue. Highly recommended for chronically tense and contracted areas like stiff necks and sore shoulders.', ARRAY['Releases chronic muscle tightness and knots', 'Reduces pain and muscle spasms', 'Improves blood flow to muscle tissues', 'Aids in athletic recovery and posture'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('balinese60', 'Balinese Massage', '60 Mins', 2499, 'massage', 'A traditional Indonesian holistic treatment combining gentle stretches, acupressure, reflexology, and aromatherapy to stimulate the flow of blood and energy.', ARRAY['Stimulates blood and lymph circulation', 'Deeply relaxing, soothing, and calming', 'Relieves joint and muscle stiffness', 'Uplifts energy and mental clarity'], 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'),
('aroma45', 'Aromatherapy Massage', '45 Mins', 2199, 'massage', 'Combines the physiological benefits of professional massage therapy with the healing, balancing effects of premium therapeutic essential oils.', ARRAY['Calms the nervous system and mind', 'Uplifts mood and reduces anxiety', 'Aromatherapy benefits via inhalation and absorption', 'Promotes absolute mental peace'], 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800'),
('thai45', 'Thai Massage', '45 Mins', 2999, 'massage', 'An interactive, energizing therapy using passive stretching, gentle rhythmic pressure, and yoga-like postures to improve flexibility and energy flow.', ARRAY['Increases flexibility and range of motion', 'Boosts whole-body energy levels', 'Relieves tight joints and back tension', 'Improves overall posture'], 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'),
('hotstone90', 'Hot Stone Therapy', '90 Mins', 3999, 'massage', 'Smooth, heated volcanic basalt stones are strategically placed on key energy meridians and used to slide along muscles, dissolving deep stiffness.', ARRAY['Melts away chronic muscle tension', 'Incredibly grounding for mental fatigue', 'Improves sleep patterns', 'Enhances deep blood flow'], 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'),
('foot30', 'Foot Reflexology', '30 Mins', 799, 'wellness', 'Focused stimulation of specific reflex points on the feet corresponding to internal body systems, restoring physical equilibrium.', ARRAY['Relieves tired, aching feet', 'Improves lower leg circulation', 'Promotes full-body relaxation', 'Reduces everyday stress and anxiety'], 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'),
('headneck30', 'Head, Neck & Shoulder Massage', '30 Mins', 899, 'massage', 'A highly targeted, stress-relieving massage focusing on the primary areas holding tension from desk work and heavy device use.', ARRAY['Relieves neck and shoulder stiffness', 'Alleviates tension headaches', 'Improves upper body alignment and comfort', 'Highly relaxing in a short 30-minute window'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('bodyscrub45', 'Body Scrub', '45 Mins', 1499, 'wellness', 'A gentle yet effective full-body exfoliation treatment using herbal and natural scrubs to remove dead skin cells and reveal healthy skin.', ARRAY['Exfoliates dead skin cells thoroughly', 'Improves skin elasticity and local circulation', 'Leaves skin silky, soft, and glowing', 'Prepares skin to absorb moisturizing oils'], 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'),
('bodypolishing60', 'Body Polishing', '60 Mins', 2499, 'wellness', 'A premium full-body hydration and polishing ritual that exfoliates, hydrates, and leaves your skin with a beautiful, satin-smooth gleam.', ARRAY['Deeply hydrates and nourishes skin layers', 'Evens skin tone and smoothens texture', 'Promotes cell renewal', 'Leaves a gorgeous luminous, radiant shine'], 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'),
('couple90', 'Couple Spa Package', '90 Mins', 4999, 'package', 'A luxurious shared wellness escape. Enjoy side-by-side aromatherapy massages with custom relaxing music, Private ambient lighting, and organic teas.', ARRAY['Shared relaxing experience in a private couple''s suite', 'Relieves stress, muscle tension, and travel fatigue', 'Includes organic fruit platters and herbal tea', 'Perfect premium wellness gift for partners in Indore'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('aromaspa45', 'Aroma Spa', '45 Mins', 1200, 'massage', 'A soothing, aromatic lighter therapy using pure herbal essential oils to relieve immediate stress and ease muscle fatigue.', ARRAY['Soothes nervous tension and mental strain', 'Calming lavender and eucalyptus essential oil aroma', 'Excellent high-value, budget-friendly wellness option', 'Restores calm and energy to a busy mind'], 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800'),
('somaspa60', 'Soma Spa Therapy', '60 Mins', 2199, 'massage', 'Our signature full-body treatment combining special custom oils with personalized deep massage strokes for complete rejuvenation.', ARRAY['Exclusive signature therapeutic experience', 'Relieves persistent body aches and joint pain', 'Balances inner flow and relieves anxiety', 'Promotes absolute physical and mental harmony'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('abhyanga', 'Abhyanga – Full Body Ayurvedic Oil Massage', '60 Mins', 2200, 'ayurveda', 'A deeply restorative full-body massage using warm herbal oils custom-blended according to your Ayurvedic Dosha.', ARRAY['Pacifies Vata, Pitta, and Kapha imbalances', 'Increases lymphatic circulation and flushes toxins', 'Improves skin texture and physical stability', 'Promotes deep, sound sleep'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('shirodhara', 'Shirodhara – Warm Herbal Oil Therapy for Relaxation', '45 Mins', 2500, 'ayurveda', 'A unique treatment where warm medicated herbal oil is poured in a continuous, gentle stream over the forehead (third eye).', ARRAY['Ultimate stress, anxiety, and mental tension relief', 'Improves sleep quality and combats chronic insomnia', 'Deeply calms the central nervous system', 'Enhances mental clarity, concentration, and focus'], 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'),
('shiroabhyanga', 'Shiro Abhyanga – Head & Scalp Massage', '30 Mins', 999, 'ayurveda', 'Focused scalp, head, and neck massage with specialized cooling Ayurvedic herbs and oils to release mental pressure.', ARRAY['Combats mental fatigue, stress, and tension headaches', 'Nourishes hair roots and dry scalp deeply', 'Improves sleep quality and patterns', 'Induces a high state of calm and clarity'], 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'),
('padabhyanga', 'Padabhyanga – Ayurvedic Foot Massage', '30 Mins', 899, 'ayurveda', 'An ancient Ayurvedic foot massage using warm herbal oils or medicated ghee on vital energy points of the feet.', ARRAY['Relieves stiffness and fatigue in feet and calf muscles', 'Calms the nervous system and improves sleep patterns', 'Stimulates internal organ wellness via reflex points', 'Enhances vision and eyes wellness according to classics'], 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'),
('mukhabhyanga', 'Mukhabhyanga – Ayurvedic Face Massage', '30 Mins', 1199, 'ayurveda', 'A traditional Ayurvedic facial massage utilizing specialized herbal oils to nourish skin and relax facial muscles.', ARRAY['Brings a natural radiant glow to facial skin', 'Relieves local facial muscle tension and stress', 'Improves local circulation and skin suppleness', 'Nourishes dry skin layers deeply'], 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'),
('pizhichil', 'Pizhichil – Warm Medicated Oil Bath Therapy', '60 Mins', 3500, 'ayurveda', 'Often called the ''King of Ayurvedic Therapies'', this combines synchronized massage with a continuous pour of warm medicated oils all over the body.', ARRAY['Highly beneficial for joint pain, stiffness, and arthritis', 'Strengthens muscles and tones nervous pathways', 'Deeply detoxifies and rejuvenates cells', 'Combats persistent body fatigue and stiffness'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('elakizhi', 'Elakizhi – Herbal Poultice Massage', '45 Mins', 2199, 'ayurveda', 'A therapeutic massage using warm herbal bags containing fresh medicinal leaves fried in herbal oils, patted over the body.', ARRAY['Relieves chronic back pain and muscle/joint pain', 'Combats muscle cramps, spasms, and stiffness', 'Improves blood circulation and skin tone', 'Highly effective for nerve-related stiffness'], 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'),
('njavarakizhi', 'Njavarakizhi – Rice Bolus Rejuvenation Therapy', '60 Mins', 2600, 'ayurveda', 'A unique rejuvenation process where the body is massaged using warm linen bags containing cooked Njavara medicinal rice with herbal decoctions.', ARRAY['Strengthens body tissues, muscles, and nerves', 'Slows down physical aging and rejuvenates skin cells', 'Improves skin luster, texture, and smoothness', 'Eases chronic physical weakness and joint stiffness'], 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'),
('udwarthanam', 'Udwarthanam – Herbal Powder Body Massage', '45 Mins', 1999, 'ayurveda', 'A dynamic dry deep massage using warm herbal powders rubbed upwards to break down subcutaneous fat and stimulate circulation.', ARRAY['Excellent for healthy weight management and cellulite reduction', 'Exfoliates dead skin cells and cleanses pores deeply', 'Improves skin complexion and muscle firmness', 'Eliminates body odors and heavy toxins'], 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'),
('katibasti', 'Kati Basti – Lower Back Oil Therapy', '30 Mins', 1299, 'ayurveda', 'A reservoir of warm medicated herbal oil is created over the lower back region using a herbal dough boundary.', ARRAY['Alleviates lower back pain, spasms, and stiffness', 'Nourishes the lumbar spine, discs, and nerves', 'Relieves sciatic nerve irritation and pain', 'Increases mobility and strength of the lower back'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('greevabasti', 'Greeva Basti – Neck Oil Therapy', '30 Mins', 1299, 'ayurveda', 'Warm medicated oil is pooled over the neck region in a custom herbal dough ring to nourish the cervical spine.', ARRAY['Relieves cervical spondylosis stiffness and pain', 'Eases severe neck and upper shoulder tension', 'Reduces tension headaches from long screen hours', 'Lubricates and relaxes neck joints and ligaments'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'),
('janubasti', 'Janu Basti – Knee Oil Therapy', '30 Mins', 1299, 'ayurveda', 'Warm medicated oil is retained over the knee joint inside a herbal dough border to lubricate and strengthen knee structures.', ARRAY['Relieves knee pain and osteoarthritis stiffness', 'Improves knee joint mobility and flexibility', 'Strengthens knee joint tissues, ligaments, and cartilage', 'Increases local circulation to the knee joint'], 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'),
('netratarpana', 'Netra Tarpana – Eye Rejuvenation Therapy', '30 Mins', 1499, 'ayurveda', 'A pool of warm, highly purified medicated ghee is retained over the eyes using a dough barrier to wash and nourish the eyes.', ARRAY['Relieves severe eye strain from computer screens and devices', 'Improves dry eyes, redness, and itching sensations', 'Enhances vision clarity and eye muscle wellness', 'Highly relaxing for the entire ocular region'], 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'),
('marmatherapy', 'Marma Therapy – Vital Energy Point Massage', '45 Mins', 1999, 'ayurveda', 'Ancient energy point stimulation using custom herbal essential oils to release physical and emotional blocks.', ARRAY['Stimulates the 107 vital energy points of the body', 'Balances Prana flow and harmonizes mind-body', 'Combats general fatigue, anxiety, and stress', 'Strengthens the nervous system and immunity'], 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'),
('swedana', 'Herbal Steam Therapy (Swedana) – Herbal', '20 Mins', 699, 'ayurveda', 'A therapeutic steam bath using custom fresh herbal decoctions to open up body sweat pores and flush deep toxins.', ARRAY['Flushes deep cellular toxins through active sweating', 'Reduces physical stiffness, pain, and soreness', 'Improves blood circulation and softens skin', 'Complements and enhances other Ayurvedic body massages'], 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    duration = EXCLUDED.duration,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    benefits = EXCLUDED.benefits,
    image_url = EXCLUDED.image_url;


-- D. Insert Sample Bookings (Leads)
INSERT INTO public.bookings (id, name, email, phone, service, date, time, therapist, status, notes, created_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'Rajesh Sharma', 'rajesh@example.com', '9876543210', 'Abhyanga – Full Body Ayurvedic Oil Massage', '2026-07-05', '11:00 AM', 'Siddharth Nair', 'Confirmed', 'Prefers medium pressure, warm herbal tea post-therapy.', '2026-07-01 10:00:00+00'),
('22222222-2222-2222-2222-222222222222', 'Priyanka Joshi', 'priyanka@example.com', '9823456789', 'Mukhabhyanga – Ayurvedic Face Massage', '2026-07-06', '03:30 PM', 'Aarti Holkar', 'Confirmed', 'Has slight sandalwood allergy; swap with lavender if needed.', '2026-07-01 14:30:00+00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    service = EXCLUDED.service,
    date = EXCLUDED.date,
    time = EXCLUDED.time,
    therapist = EXCLUDED.therapist,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    created_at = EXCLUDED.created_at;


-- E. Insert Sample Customer Reviews
INSERT INTO public.reviews (name, location, rating, comment, date, service)
VALUES
('Aditi Rao', 'Vijay Nagar, Indore', 5, 'The Shirodhara therapy here is absolutely transcendental. Siddharth Nair made me feel extremely relaxed. Best wellness clinic in Indore!', '2026-07-02', 'Shirodhara – Warm Herbal Oil Therapy for Relaxation'),
('Rohan Kapoor', 'Palasia, Indore', 5, 'Great deep tissue massage! Manoj Yadav really knows how to relieve back knots. The ambiance of Soma Spa is incredibly beautiful and high end.', '2026-07-03', 'Deep Tissue Massage');
