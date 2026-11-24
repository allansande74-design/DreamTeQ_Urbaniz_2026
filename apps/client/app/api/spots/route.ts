import { NextResponse } from "next/server";

const spots = [
  { id: "p1", name: "Market Street Garage", address: "120 Market St · Civic Center", distance: "2 min walk", price: 4.5, available: 18, total: 120, type: "Garage", rating: 4.9, x: 54, y: 37, features: ["Covered", "EV charging"] },
  { id: "p2", name: "Hayes Valley Lot", address: "8 Octavia Blvd · Hayes Valley", distance: "5 min walk", price: 3, available: 7, total: 42, type: "Open lot", rating: 4.7, x: 31, y: 54, features: ["24/7 access"] },
  { id: "p3", name: "Civic Center Plaza", address: "355 McAllister St · Downtown", distance: "4 min walk", price: 5, available: 23, total: 96, type: "Garage", rating: 4.8, x: 69, y: 58, features: ["Covered", "Security"] },
  { id: "p4", name: "Van Ness & Grove", address: "450 Grove St · Civic Center", distance: "7 min walk", price: 2.5, available: 3, total: 28, type: "Street parking", rating: 4.5, x: 25, y: 28, features: ["Street level"] },
  { id: "p5", name: "Fulton Street Garage", address: "550 Fulton St · Hayes Valley", distance: "8 min walk", price: 3.5, available: 12, total: 84, type: "Garage", rating: 4.8, x: 78, y: 30, features: ["Covered", "EV charging"] },
];

export function GET() {
  return NextResponse.json({ spots, updatedAt: new Date().toISOString(), source: "urbaniz-demo" }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } });
}
