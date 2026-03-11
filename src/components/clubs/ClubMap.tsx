"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Navigation } from "lucide-react";
import {
  getAllClubs,
  searchClubs,
  COUNTRIES,
  REGION_LABELS,
  type ClubData,
  type USRegion,
  type CountryCode,
} from "@/lib/clubs-data";

// Leaflet types (loaded dynamically)
type LeafletModule = typeof import("leaflet");

const DEFAULT_CENTER: [number, number] = [30, -20]; // World view
const DEFAULT_ZOOM = 3;

const COUNTRY_COLORS: Record<string, string> = {
  US: "#1B5E20",
  GB: "#1565C0",
  CA: "#C62828",
  AU: "#F57F17",
  NZ: "#000000",
  ZA: "#2E7D32",
};

interface ClubMapProps {
  fullScreen?: boolean;
  /** When true, hides internal filter UI and uses parent-provided filter props */
  hideFilters?: boolean;
  region?: USRegion | "all";
  stateFilter?: string | "all";
  activity?: string | "all";
  searchQuery?: string;
}

export function ClubMap({
  fullScreen = false,
  hideFilters = false,
  region: parentRegion,
  stateFilter: parentState,
  activity: parentActivity,
  searchQuery: parentSearch,
}: ClubMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const [ready, setReady] = useState(false);
  const [activeCountry, setActiveCountry] = useState<CountryCode | "all">("all");
  const [activeRegion, setActiveRegion] = useState<USRegion | "all">("all");
  const [activeActivity, setActiveActivity] = useState<string | "all">("all");

  // Use parent filters when hideFilters is true, otherwise use internal state
  const effectiveRegion = hideFilters ? (parentRegion ?? "all") : activeRegion;
  const effectiveState = hideFilters ? (parentState ?? "all") : "all";
  const effectiveActivity = hideFilters ? (parentActivity ?? "all") : activeActivity;
  const effectiveSearch = hideFilters ? (parentSearch ?? "") : "";

  const allClubs = useMemo(() => getAllClubs(), []);

  const activities = useMemo(() => {
    const set = new Set<string>();
    allClubs.forEach((c) => c.activities.forEach((a) => set.add(a)));
    return [...set].sort();
  }, [allClubs]);

  const countries = useMemo(() => {
    return [...new Set(allClubs.map((c) => (c.country ?? c.countryCode ?? "US") as CountryCode))].sort();
  }, [allClubs]);

  const filteredClubs = useMemo(() => {
    let clubs = effectiveSearch.length > 1
      ? searchClubs(effectiveSearch).filter((c) => c.lat != null && c.lng != null)
      : allClubs.filter((c) => c.lat != null && c.lng != null);
    if (activeCountry !== "all") {
      clubs = clubs.filter((c) => (c.country ?? c.countryCode ?? "US") === activeCountry);
    }
    if (effectiveRegion !== "all") {
      clubs = clubs.filter((c) => c.region === effectiveRegion);
    }
    if (effectiveState !== "all") {
      clubs = clubs.filter((c) => c.stateCode === effectiveState);
    }
    if (effectiveActivity !== "all") {
      clubs = clubs.filter((c) => c.activities.includes(effectiveActivity));
    }
    return clubs;
  }, [allClubs, activeCountry, effectiveRegion, effectiveState, effectiveActivity, effectiveSearch]);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Add Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add MarkerCluster CSS
    if (!document.getElementById("markercluster-css")) {
      const mc = document.createElement("link");
      mc.id = "markercluster-css";
      mc.rel = "stylesheet";
      mc.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
      document.head.appendChild(mc);
    }
    if (!document.getElementById("markercluster-default-css")) {
      const mcd = document.createElement("link");
      mcd.id = "markercluster-default-css";
      mcd.rel = "stylesheet";
      mcd.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
      document.head.appendChild(mcd);
    }

    // Brand-colored cluster icons
    if (!document.getElementById("markercluster-brand-css")) {
      const style = document.createElement("style");
      style.id = "markercluster-brand-css";
      style.textContent = `
        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background-color: rgba(27, 94, 32, 0.25);
        }
        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background-color: #1B5E20;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          font-family: system-ui, -apple-system, sans-serif;
        }
      `;
      document.head.appendChild(style);
    }

    let cancelled = false;

    import("leaflet").then(async (L) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      // Dynamically import markercluster after leaflet
      await import("leaflet.markercluster");

      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      markersRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      }).addTo(map);
      leafletRef.current = L;
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        leafletRef.current = null;
        setReady(false);
      }
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    const L = leafletRef.current;
    if (!ready || !L || !markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    if (filteredClubs.length === 0) return;

    filteredClubs.forEach((club) => {
      const cc = (club.country ?? club.countryCode ?? "US") as string;
      const color = COUNTRY_COLORS[cc] || "#1B5E20";
      const flag = COUNTRIES[cc as CountryCode]?.flag ?? "";

      const icon = L.divIcon({
        className: "club-marker-icon",
        html: `<div style="
          width:12px;height:12px;border-radius:50%;
          background:${color};border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
          cursor:pointer;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const contacts = (club.contacts ?? []).slice(0, 3).map((c) => {
        const links = [
          c.email ? `<a href="mailto:${c.email}" style="color:#1B5E20;text-decoration:none;">${c.email}</a>` : "",
          c.linkedinUrl ? `<a href="${c.linkedinUrl}" target="_blank" rel="noopener" style="color:#0077B5;text-decoration:none;">LinkedIn</a>` : "",
          c.instagramUrl ? `<a href="${c.instagramUrl}" target="_blank" rel="noopener" style="color:#E4405F;text-decoration:none;">Instagram</a>` : "",
          c.facebookUrl ? `<a href="${c.facebookUrl}" target="_blank" rel="noopener" style="color:#1877F2;text-decoration:none;">Facebook</a>` : "",
          c.twitterUrl ? `<a href="${c.twitterUrl}" target="_blank" rel="noopener" style="color:#1DA1F2;text-decoration:none;">Twitter</a>` : "",
        ].filter(Boolean);
        return `<div style="margin-top:4px;font-size:11px;line-height:1.4;">
          <strong>${c.name}</strong> <span style="color:#888;">— ${c.role}</span>
          ${c.phone ? `<br/><span style="color:#555;">${c.phone}</span>` : ""}
          ${links.length ? `<br/>${links.join(" · ")}` : ""}
        </div>`;
      }).join("");

      const stateLabel = club.province || club.state;
      const popup = `
        <div style="min-width:200px;max-width:300px;font-family:system-ui,-apple-system,sans-serif;">
          <div style="font-size:14px;font-weight:700;color:#111;">${flag} ${club.name}</div>
          <div style="font-size:11px;color:#666;margin-top:2px;">${club.city}, ${stateLabel}</div>
          ${club.founded ? `<div style="font-size:10px;color:#999;">Est. ${club.founded}</div>` : ""}
          <div style="display:flex;gap:8px;margin-top:6px;font-size:11px;color:#444;">
            ${club.memberCount ? `<span>${club.memberCount} members</span>` : ""}
            ${club.greens ? `<span>${club.greens} green${club.greens > 1 ? "s" : ""}</span>` : ""}
            ${club.rinks ? `<span>${club.rinks} rinks</span>` : ""}
          </div>
          ${contacts ? `
            <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e5e5;">
              <div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Contacts</div>
              ${contacts}
            </div>
          ` : ""}
          <div style="margin-top:8px;display:flex;gap:6px;">
            ${club.website ? `<a href="${club.website}" target="_blank" rel="noopener" style="font-size:11px;color:#1B5E20;font-weight:600;text-decoration:none;">Website →</a>` : ""}
            <a href="/clubs/${club.stateCode.toLowerCase()}/${club.id}" style="font-size:11px;color:#1B5E20;font-weight:600;text-decoration:none;">View Club →</a>
          </div>
        </div>
      `;

      L.marker([club.lat!, club.lng!], { icon })
        .bindPopup(popup, { maxWidth: 320 })
        .addTo(markersRef.current!);
    });

    // Fit bounds
    if (filteredClubs.length > 1) {
      const bounds = L.latLngBounds(
        filteredClubs.map((c) => [c.lat!, c.lng!] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (filteredClubs.length === 1) {
      mapRef.current.setView([filteredClubs[0].lat!, filteredClubs[0].lng!], 12);
    }
  }, [filteredClubs, ready]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 8, { animate: true });
      },
      () => { /* user denied */ }
    );
  }, []);

  return (
    <div className={`relative ${fullScreen ? "h-full" : "aspect-video rounded-2xl overflow-hidden border border-zinc-200"}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#1B5E20] border-t-transparent" />
        </div>
      )}

      {/* Filters overlay — hidden when parent provides filters */}
      {!hideFilters && (
        <div className="absolute left-3 right-16 top-3 z-[1000] sm:left-3 sm:right-auto sm:max-w-sm">
          <div className="rounded-xl border border-zinc-200 bg-white/95 p-2.5 shadow-lg backdrop-blur">
            <p className="mb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {filteredClubs.length} clubs shown
            </p>

            {/* Country filter */}
            {countries.length > 1 && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                <FilterChip active={activeCountry === "all"} onClick={() => { setActiveCountry("all"); setActiveRegion("all"); }} label="All Countries" />
                {countries.map((cc) => (
                  <FilterChip key={cc} active={activeCountry === cc} onClick={() => { setActiveCountry(cc); setActiveRegion("all"); }} label={`${COUNTRIES[cc]?.flag ?? ""} ${COUNTRIES[cc]?.name ?? cc}`} />
                ))}
              </div>
            )}

            {/* Region filter (US only) */}
            {(activeCountry === "all" || activeCountry === "US") && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                <FilterChip active={activeRegion === "all"} onClick={() => setActiveRegion("all")} label="All Regions" small />
                {(Object.keys(REGION_LABELS) as USRegion[]).map((r) => (
                  <FilterChip key={r} active={activeRegion === r} onClick={() => setActiveRegion(r)} label={`${REGION_LABELS[r].label}`} small />
                ))}
              </div>
            )}

            {/* Activity filter */}
            <div className="flex flex-wrap gap-1">
              <FilterChip active={activeActivity === "all"} onClick={() => setActiveActivity("all")} label="All Activities" small />
              {activities.slice(0, 5).map((a) => (
                <FilterChip key={a} active={activeActivity === a} onClick={() => setActiveActivity(a)} label={a} small />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Locate me */}
      <button
        onClick={handleLocateMe}
        className="absolute bottom-4 right-3 z-[1000] flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 touch-manipulation"
        title="Find clubs near me"
      >
        <Navigation className="h-4.5 w-4.5 text-[#1B5E20]" />
      </button>

      {/* Legend */}
      {countries.length > 1 && (
        <div className="absolute bottom-4 left-3 z-[1000] rounded-lg border border-zinc-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {countries.map((cc) => (
              <div key={cc} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: COUNTRY_COLORS[cc] || "#1B5E20" }} />
                <span className="text-[10px] font-medium text-zinc-600">{COUNTRIES[cc]?.name ?? cc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border font-medium transition-colors touch-manipulation ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } ${
        active
          ? "border-[#1B5E20] bg-[#1B5E20] text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
