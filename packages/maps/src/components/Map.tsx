"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function CityMap() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const map = new maplibregl.Map({
      container: container.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [32.5825, 0.3476],
      zoom: 13,
    });

    map.on("load", () => {
      console.log("Map loaded");
    });

    map.on("error", (e) => {
      console.error("Map error:", e);
    });

    map.addControl(new maplibregl.NavigationControl());

    new maplibregl.Marker()
      .setLngLat([32.5825, 0.3476])
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div
      ref={container}
      style={{
        width: "100vw",
        height: "100vh",
        border: "2px solid red",
      }}
    />
  );
}