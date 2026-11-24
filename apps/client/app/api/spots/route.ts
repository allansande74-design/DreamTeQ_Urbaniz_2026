import { NextResponse } from "next/server";

const samples = [
  { id: "demo-market-garage", name: "Market Street Garage", address: "120 Market St · Civic Center", latitude: 37.7757, longitude: -122.4182, hourlyRate: 4.5, available: 18, capacity: 120, type: "Garage", features: ["Covered", "EV charging"], updatedAt: new Date().toISOString() },
  { id: "demo-hayes-lot", name: "Hayes Valley Lot", address: "8 Octavia Blvd · Hayes Valley", latitude: 37.7753, longitude: -122.4248, hourlyRate: 3, available: 7, capacity: 42, type: "Lot", features: ["24/7 access"], updatedAt: new Date().toISOString() },
  { id: "demo-civic-garage", name: "Civic Center Plaza", address: "355 McAllister St · Downtown", latitude: 37.7801, longitude: -122.4158, hourlyRate: 5, available: 23, capacity: 96, type: "Garage", features: ["Covered", "Security"], updatedAt: new Date().toISOString() },
  { id: "demo-van-ness", name: "Van Ness & Grove", address: "450 Grove St · Civic Center", latitude: 37.7774, longitude: -122.4192, hourlyRate: 2.5, available: 3, capacity: 28, type: "Street", features: ["Street level"], updatedAt: new Date().toISOString() },
];

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Demo listings are opt-in for local UI work and are never served in production.
    if (process.env.NODE_ENV !== "production" && process.env.URBANIZ_DEMO_MODE === "true") {
      return NextResponse.json({ spots: samples, source: "demo", updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "Parking inventory is not configured.", code: "INVENTORY_NOT_CONFIGURED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const response = await fetch(`${url}/rest/v1/parking_spot_availability?select=id,name,address,latitude,longitude,hourly_rate,available,capacity,type,features,updated_at&is_active=eq.true&order=name.asc`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!response.ok) return NextResponse.json({ error: "Parking inventory is temporarily unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
    const rows = await response.json() as Array<{ id: string; name: string; address: string; latitude: number; longitude: number; hourly_rate: number; available: number; capacity: number; type: string; features: string[]; updated_at: string }>;
    const spots = rows.map((row) => ({ id: row.id, name: row.name, address: row.address, latitude: row.latitude, longitude: row.longitude, hourlyRate: row.hourly_rate, available: row.available, capacity: row.capacity, type: row.type, features: row.features ?? [], updatedAt: row.updated_at }));
    return NextResponse.json({ spots, source: "live", updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=30" } });
  } catch {
    return NextResponse.json({ error: "Parking inventory is temporarily unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
