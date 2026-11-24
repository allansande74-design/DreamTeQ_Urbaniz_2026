import { NextResponse } from "next/server";

const spotIds = new Set(["p1", "p2", "p3", "p4", "p5"]);

export async function POST(request: Request) {
  let body: { spotId?: unknown };
  try {
    body = await request.json() as { spotId?: unknown };
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }
  if (typeof body.spotId !== "string" || !spotIds.has(body.spotId)) {
    return NextResponse.json({ error: "Please select a valid parking spot." }, { status: 400 });
  }
  return NextResponse.json({ code: `URB-${crypto.randomUUID().slice(0, 4).toUpperCase()}`, spotId: body.spotId, status: "held", expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
