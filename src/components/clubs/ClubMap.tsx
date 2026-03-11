"use client";

import { useState, useMemo, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Navigation } from "lucide-react";
import {
  CLUBS,
  type ClubData,
  type USRegion,
} from "@/lib/clubs-data";
import { ClubMapMarker } from "./ClubMapMarker";
import { ClubMapFilters } from "./ClubMapFilters";

// Center of continental US
const DEFAULT_CENTER = { lat: 39.5, lng: -98.35 };
const DEFAULT_ZOOM = 4;

interface ClubMapProps {
  fullScreen?: boolean;
}

export function ClubMap({ fullScreen = false }: ClubMapProps) {
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<USRegion | "all">("all");
  const [activeActivity, setActiveActivity] = useState<string | "all">("all");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  const activities = useMemo(() => {
    const set = new Set<string>();
    CLUBS.forEach((c) => c.activities.forEach((a) => set.add(a)));
    return [...set].sort();
  }, []);

  const filteredClubs = useMemo(() => {
    let clubs: ClubData[] = CLUBS.filter((c) => c.lat && c.lng);
    if (activeRegion !== "all") {
      clubs = clubs.filter((c) => c.region === activeRegion);
    }
    if (activeActivity !== "all") {
      clubs = clubs.filter((c) => c.activities.includes(activeActivity));
    }
    return clubs;
  }, [activeRegion, activeActivity]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMapZoom(8);
      },
      () => {
        // Silently fail — user denied location
      }
    );
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 ${fullScreen ? "h-full" : "aspect-video rounded-2xl"}`}>
        <div className="text-center p-8">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            Map unavailable — Google Maps API key not configured
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${fullScreen ? "h-full" : "aspect-video rounded-2xl overflow-hidden"}`}>
      <APIProvider apiKey={apiKey}>
        <Map
          center={mapCenter}
          zoom={mapZoom}
          onCenterChanged={(e) => setMapCenter(e.detail.center)}
          onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
          mapId="club-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="h-full w-full"
        >
          {filteredClubs.map((club) => (
            <ClubMapMarker
              key={club.id}
              club={club}
              isSelected={selectedClub === club.id}
              onSelect={setSelectedClub}
            />
          ))}
        </Map>
      </APIProvider>

      <ClubMapFilters
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        activeActivity={activeActivity}
        onActivityChange={setActiveActivity}
        activities={activities}
        clubCount={filteredClubs.length}
      />

      {/* Locate me button */}
      <button
        onClick={handleLocateMe}
        className="absolute bottom-6 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 touch-manipulation"
        title="Find clubs near me"
      >
        <Navigation className="h-5 w-5 text-[#1B5E20]" />
      </button>
    </div>
  );
}
