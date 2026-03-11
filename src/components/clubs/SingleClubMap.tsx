"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface SingleClubMapProps {
  lat?: number;
  lng?: number;
  clubName: string;
  address?: string;
}

export function SingleClubMap({ lat, lng, clubName, address }: SingleClubMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!lat || !lng || typeof window === "undefined" || !mapRef.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      L.marker([lat, lng])
        .bindPopup(`<strong>${clubName}</strong>${address ? `<br/><span style="font-size:12px;color:#666;">${address}</span>` : ""}`)
        .addTo(map)
        .openPopup();

      mapInstanceRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setReady(false);
      }
    };
  }, [lat, lng, clubName, address]);

  if (!lat || !lng) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-zinc-100">
        <div className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-zinc-400" />
          <p className="mt-2 text-sm font-medium text-zinc-500">
            {address ?? "Location not available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <div ref={mapRef} className="h-full w-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#1B5E20] border-t-transparent" />
          </div>
        )}
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <MapPin className="h-4 w-4" />
        Get Directions
      </a>
    </div>
  );
}
