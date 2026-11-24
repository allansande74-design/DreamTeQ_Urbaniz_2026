import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!url || !anonKey) return NextResponse.json({ error: "Reservations are not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) return NextResponse.json({ error: "A valid Idempotency-Key UUID is required." }, { status: 400 });
  let body: { spotId?: unknown };
  try { body = await request.json() as { spotId?: unknown }; } catch { return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 }); }
  if (typeof body.spotId !== "string" || body.spotId.length > 100) return NextResponse.json({ error: "Please select a valid parking location." }, { status: 400 });
  const token = request.cookies.get("urbaniz_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Sign in to reserve parking." }, { status: 401 });
  try {
    const auth = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!auth.ok) return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });
    const response = await fetch(`${url}/rest/v1/rpc/reserve_parking_spot`, { method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify({ p_spot_id: body.spotId, p_idempotency_key: idempotencyKey }), cache: "no-store", signal: AbortSignal.timeout(8000) });
    const result = await response.json().catch(() => null) as { code?: string; expires_at?: string; error?: string; message?: string } | null;
    if (!response.ok) {
      const status = response.status === 409 ? 409 : response.status === 404 ? 404 : 502;
      return NextResponse.json({ error: status === 409 ? "No spaces are currently available." : status === 404 ? "This parking location is no longer available." : "Reservation could not be completed. Please retry." }, { status, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ code: result?.code, expiresAt: result?.expires_at }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Reservation service is temporarily unavailable. No booking was made." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
