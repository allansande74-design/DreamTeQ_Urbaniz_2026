"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function CityMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initMap() {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["places"],
      });

      await loader.load();

      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 0.3476, lng: 32.5825 },
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
      });

      new google.maps.Marker({
        position: { lat: 0.3476, lng: 32.5825 },
        map,
        title: "DreamTeQ Urbaniz",
      });
    }

    initMap().catch(console.error);
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
