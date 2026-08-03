-- 0. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 1. Parking Structures / Lots
CREATE TABLE IF NOT EXISTS public.parking_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_spots INT NOT NULL,
    location extensions.geography(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Individual Parking Slots (Updated via IoT sensors)
CREATE TABLE IF NOT EXISTS public.parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.parking_lots(id) ON DELETE CASCADE,
    spot_number TEXT NOT NULL,
    is_occupied BOOLEAN DEFAULT false,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;

-- Read policies for public/client access
CREATE POLICY "Allow public read access to parking lots" 
    ON public.parking_lots FOR SELECT USING (true);

CREATE POLICY "Allow public read access to parking spots" 
    ON public.parking_spots FOR SELECT USING (true);
