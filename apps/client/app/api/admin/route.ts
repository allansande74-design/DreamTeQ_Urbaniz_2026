import { NextRequest, NextResponse } from "next/server";

type AdminUser = { app_metadata?: { role?: string } };
type SpotInput = { id?: unknown; name?: unknown; address?: unknown; latitude?: unknown; longitude?: unknown; hourlyRate?: unknown; capacity?: unknown; type?: unknown; features?: unknown; isActive?: unknown };

async function authorize(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return { error: NextResponse.json({ error: "Admin backend is not configured." }, { status: 503 }) };
  const token = request.cookies.get("urbaniz_access_token")?.value;
  if (!token) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  try {
    const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
    const user = await response.json() as AdminUser;
    if (user.app_metadata?.role !== "admin") return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
    return { url, anonKey, serviceKey, token };
  } catch {
    return { error: NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 }) };
  }
}

function isValidSpot(body: SpotInput) {
  return typeof body.name === "string" && body.name.trim().length >= 2 && body.name.trim().length <= 120
    && typeof body.address === "string" && body.address.trim().length >= 2 && body.address.trim().length <= 240
    && typeof body.latitude === "number" && Number.isFinite(body.latitude) && body.latitude >= -90 && body.latitude <= 90
    && typeof body.longitude === "number" && Number.isFinite(body.longitude) && body.longitude >= -180 && body.longitude <= 180
    && typeof body.hourlyRate === "number" && Number.isFinite(body.hourlyRate) && body.hourlyRate >= 0 && body.hourlyRate <= 10000
    && typeof body.capacity === "number" && Number.isInteger(body.capacity) && body.capacity >= 0 && body.capacity <= 100000
    && (body.type === "Garage" || body.type === "Lot" || body.type === "Street")
    && (body.features === undefined || Array.isArray(body.features) && body.features.length <= 20 && body.features.every((feature) => typeof feature === "string" && feature.length <= 50))
    && (body.isActive === undefined || typeof body.isActive === "boolean")
    && (body.id === undefined || typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id));
}

export async function GET(request: NextRequest) {
  const auth = await authorize(request);
  if ("error" in auth) return auth.error;
  const base = `${auth.url}/rest/v1`;
  try {
    const [inventoryResponse, reservationsResponse, reservationCountResponse] = await Promise.all([
      fetch(`${base}/parking_spot_availability?select=id,name,address,latitude,longitude,hourly_rate,available,capacity,type,features,is_active,updated_at&order=name.asc`, { headers: { apikey: auth.serviceKey, Authorization: `Bearer ${auth.serviceKey}` }, cache: "no-store", signal: AbortSignal.timeout(7000) }),
      fetch(`${base}/parking_reservations?select=id,spot_id,status,created_at,expires_at&order=created_at.desc&limit=100`, { headers: { apikey: auth.serviceKey, Authorization: `Bearer ${auth.serviceKey}` }, cache: "no-store", signal: AbortSignal.timeout(7000) }),
      fetch(`${base}/parking_reservations?select=id&status=eq.held&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`, { method: "HEAD", headers: { apikey: auth.serviceKey, Authorization: `Bearer ${auth.serviceKey}`, Prefer: "count=exact", Range: "0-0" }, cache: "no-store", signal: AbortSignal.timeout(7000) }),
    ]);
    if (!inventoryResponse.ok || !reservationsResponse.ok || !reservationCountResponse.ok) return NextResponse.json({ error: "Could not load operations data." }, { status: 502 });
    const spots = await inventoryResponse.json();
    const reservations = await reservationsResponse.json();
    const range = reservationCountResponse.headers.get("content-range");
    const activeReservations = Number(range?.split("/")[1] ?? 0);
    return NextResponse.json({ spots, reservations, metrics: { locations: spots.length, activeLocations: spots.filter((spot: { is_active: boolean }) => spot.is_active).length, availableSpaces: spots.reduce((sum: number, spot: { available: number }) => sum + spot.available, 0), activeReservations, recentReservations: reservations.length }, fetchedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Operations service is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const auth = await authorize(request);
  if ("error" in auth) return auth.error;
  let body: SpotInput;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return NextResponse.json({ error: "Provide a valid parking location." }, { status: 400 });
    body = parsed as SpotInput;
  } catch { return NextResponse.json({ error: "Provide a valid JSON request body." }, { status: 400 }); }
  if (!isValidSpot(body)) return NextResponse.json({ error: "Check the location fields, coordinates, rate, capacity, and parking type." }, { status: 400 });
  const record = { ...(typeof body.id === "string" ? { id: body.id } : {}), name: (body.name as string).trim(), address: (body.address as string).trim(), latitude: body.latitude, longitude: body.longitude, hourly_rate: body.hourlyRate, capacity: body.capacity, type: body.type, features: body.features ?? [], is_active: body.isActive ?? true, updated_at: new Date().toISOString() };
  try {
    const endpoint = `${auth.url}/rest/v1/parking_spots${body.id ? `?id=eq.${encodeURIComponent(body.id)}` : ""}`;
    const response = await fetch(endpoint, { method: body.id ? "PATCH" : "POST", headers: { apikey: auth.serviceKey, Authorization: `Bearer ${auth.serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(record), cache: "no-store", signal: AbortSignal.timeout(7000) });
    if (!response.ok) return NextResponse.json({ error: "Could not save this location. Check the database configuration." }, { status: 502 });
    const rows = await response.json() as unknown[];
    if (body.id && rows.length === 0) return NextResponse.json({ error: "Parking location not found." }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: body.id ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Inventory service is temporarily unavailable." }, { status: 503 });
  }
}
