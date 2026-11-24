import { NextRequest, NextResponse } from "next/server";

type AuthPayload = { action?: unknown; email?: unknown; password?: unknown };

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  let body: AuthPayload;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return NextResponse.json({ error: "A valid JSON object is required." }, { status: 400 });
    body = parsed as AuthPayload;
  } catch {
    return NextResponse.json({ error: "A valid JSON body is required." }, { status: 400 });
  }

  if (body.action === "signout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete("urbaniz_access_token");
    return response;
  }
  if (body.action !== "signin" && body.action !== "signup") return NextResponse.json({ error: "Provide a valid sign-in or sign-up request." }, { status: 400 });
  if (typeof body.email !== "string" || typeof body.password !== "string") return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const email = body.email.trim().toLowerCase();
  const password = body.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return NextResponse.json({ error: "Enter a valid email and a password between 8 and 128 characters." }, { status: 400 });

  try {
    const endpoint = body.action === "signup" ? "signup" : "token?grant_type=password";
    const auth = await fetch(`${url}/auth/v1/${endpoint}`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store", signal: AbortSignal.timeout(8000) });
    const result = await auth.json() as { access_token?: string; expires_in?: number; msg?: string; message?: string; error_description?: string };
    if (!auth.ok) return NextResponse.json({ error: result.msg ?? result.message ?? result.error_description ?? "Authentication failed." }, { status: auth.status === 400 ? 400 : 401 });
    if (!result.access_token) return NextResponse.json({ ok: true, confirmationRequired: true, message: "Check your email to confirm your account, then sign in." }, { status: 200 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set("urbaniz_access_token", result.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: Math.min(result.expires_in ?? 3600, 3600) });
    return response;
  } catch {
    return NextResponse.json({ error: "Authentication service is temporarily unavailable." }, { status: 503 });
  }
}
