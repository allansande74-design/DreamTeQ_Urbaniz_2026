"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tansyxqwtaopgzqnwdvo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbnN5eHF3dGFvcGd6cW53ZHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MjUwNjksImV4cCI6MjEwMTMwMTA2OX0.oaZNOoGilTZVQzRXo8bpF3D-9y8XnQ4H8ynIu9chL-U";
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default function CityMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize MapLibre GL
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [36.8219, -1.2921], // Nairobi default center [lng, lat]
      zoom: 12,
      pitch: 45,
      bearing: -17,
      antialias: true,
    } as maplibregl.MapOptions);

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Fetch parking lots from Supabase
    async function loadParkingLots() {
      try {
        const { data: lots, error } = await supabase
          .from("parking_lots")
          .select("id, name, total_spots, location");

        if (error) {
          console.error("Failed to fetch parking lots:", error.message);
          return;
        }

        if (lots && mapRef.current) {
          lots.forEach((lot) => {
            // PostGIS Point parsing if available, or default fallback
            let coords: [number, number] = [36.8219, -1.2921];
            if (lot.location && typeof lot.location === "object" && "coordinates" in lot.location) {
              const geo = lot.location as { coordinates: [number, number] };
              coords = geo.coordinates;
            }

            // Create interactive popup & marker
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
              <div style="color: #111; padding: 4px;">
                <strong style="font-size: 14px;">\</strong><br/>
                <span>Total Spots: \</span>
              </div>
            );

            new maplibregl.Marker({ color: "#2563eb" })
              .setLngLat(coords)
              .setPopup(popup)
              .addTo(mapRef.current!);
          });
        }
      } finally {
        setLoading(false);
      }
    }

    map.on("load", () => {
      loadParkingLots();
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {loading && (
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "4px",
          fontSize: "12px"
        }}>
          Syncing Supabase parking data...
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
