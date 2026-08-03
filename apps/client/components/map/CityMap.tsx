"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function CityMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",

      center: [32.5825, 0.3476],

      zoom: 15,
      pitch: 45,
      bearing: -17,
      antialias: true,
    } as maplibregl.MapOptions);

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    new maplibregl.Marker()
      .setLngLat([32.5825, 0.3476])
      .setPopup(
        new maplibregl.Popup().setHTML(
          "<h3>DreamTeQ Urbaniz</h3><p>Smart City Platform</p>"
        )
      )
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}
