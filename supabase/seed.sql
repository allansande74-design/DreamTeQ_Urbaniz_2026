-- Clear existing records
TRUNCATE public.parking_spots, public.parking_lots RESTART IDENTITY CASCADE;

-- Insert Nairobi Parking Lots with PostGIS WGS84 Geometries (lng, lat)
INSERT INTO public.parking_lots (name, total_spots, location) VALUES
  ('Nairobi CBD Central Hub', 150, ST_SetSRID(ST_MakePoint(36.8219, -1.2921), 4326)),
  ('Westlands Commercial Plaza', 200, ST_SetSRID(ST_MakePoint(36.8044, -1.2676), 4326)),
  ('Upper Hill Financial Lot', 120, ST_SetSRID(ST_MakePoint(36.8142, -1.2990), 4326)),
  ('Kilimani Urban Parking', 80, ST_SetSRID(ST_MakePoint(36.7885, -1.2895), 4326));

-- Insert Sample Parking Spots for CBD Central Hub
WITH cbd_lot AS (SELECT id FROM public.parking_lots WHERE name = 'Nairobi CBD Central Hub' LIMIT 1)
INSERT INTO public.parking_spots (lot_id, spot_number, is_occupied) VALUES
  ((SELECT id FROM cbd_lot), 'A-101', false),
  ((SELECT id FROM cbd_lot), 'A-102', true),
  ((SELECT id FROM cbd_lot), 'A-103', false),
  ((SELECT id FROM cbd_lot), 'A-104', true);
