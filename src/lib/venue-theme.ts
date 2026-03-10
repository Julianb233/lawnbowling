export interface VenueTheme {
  "--venue-primary": string;
  "--venue-secondary": string;
  "--venue-name": string;
  "--venue-logo": string;
}

export interface VenueBranding {
  name: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  logo_url?: string | null;
}

export function getVenueTheme(venue: VenueBranding): VenueTheme {
  return {
    "--venue-primary": venue.primary_color || "#22c55e",
    "--venue-secondary": venue.secondary_color || "#0f172a",
    "--venue-name": venue.name,
    "--venue-logo": venue.logo_url || "",
  };
}
