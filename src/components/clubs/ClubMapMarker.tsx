"use client";

import { useCallback } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import Link from "next/link";
import { MapPin, Users, Leaf, CircleDot, Navigation } from "lucide-react";
import { SURFACE_LABELS, type ClubData } from "@/lib/clubs-data";

interface ClubMapMarkerProps {
  club: ClubData;
  isSelected: boolean;
  onSelect: (clubId: string | null) => void;
}

export function ClubMapMarker({ club, isSelected, onSelect }: ClubMapMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleClick = useCallback(() => {
    onSelect(isSelected ? null : club.id);
  }, [club.id, isSelected, onSelect]);

  if (!club.lat || !club.lng) return null;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: club.lat, lng: club.lng }}
        onClick={handleClick}
        title={club.name}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md transition-transform ${
            isSelected
              ? "scale-125 border-[#1B5E20] bg-[#1B5E20]"
              : "border-white bg-[#1B5E20] hover:scale-110"
          }`}
        >
          <CircleDot className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => onSelect(null)}
          maxWidth={300}
        >
          <div className="p-1">
            <h3 className="text-sm font-bold text-[#0A2E12]">{club.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#3D5A3E]">
              <MapPin className="h-3 w-3" />
              <span>
                {club.city}, {club.stateCode}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {club.memberCount && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                  <Users className="h-2.5 w-2.5" />
                  {club.memberCount}
                </span>
              )}
              {club.surfaceType !== "unknown" && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#1B5E20]/5 px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                  <Leaf className="h-2.5 w-2.5" />
                  {SURFACE_LABELS[club.surfaceType]}
                </span>
              )}
              {club.greens && (
                <span className="rounded-full bg-[#0A2E12]/5 px-2 py-0.5 text-xs font-medium text-[#3D5A3E]">
                  {club.greens} green{club.greens !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {club.description && (
              <p className="mt-2 text-xs text-[#3D5A3E] line-clamp-2">
                {club.description}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <Link
                href={`/clubs/${club.stateCode.toLowerCase()}/${club.id}`}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#1B5E20] px-3 py-2 text-xs font-bold text-white hover:bg-[#145218] transition-colors"
              >
                View Club
              </Link>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${club.lat},${club.lng}&destination_place_id=${encodeURIComponent(club.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-[#0A2E12]/10 px-2.5 py-2 text-xs font-medium text-[#3D5A3E] hover:bg-[#0A2E12]/5 transition-colors"
                title="Get directions"
              >
                <Navigation className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
