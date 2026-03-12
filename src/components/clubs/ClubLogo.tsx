import Image from "next/image";

/**
 * ClubLogo — renders a club's logo image or a premium gradient avatar with initials.
 *
 * Gradient colors are mapped by US state / country region so clubs from the same
 * area share a family of colors while still looking distinct from other regions.
 */

// State/region gradient palettes
const STATE_GRADIENTS: Record<string, [string, string]> = {
  // West — warm golds and desert tones
  AZ: ["#C2185B", "#E91E63"],
  CA: ["#E65100", "#FF8F00"],
  CO: ["#4A148C", "#7B1FA2"],
  HI: ["#00695C", "#00897B"],
  NV: ["#B71C1C", "#D32F2F"],
  NM: ["#BF360C", "#E64A19"],
  OR: ["#1B5E20", "#2E7D32"],
  UT: ["#E65100", "#EF6C00"],
  WA: ["#0D47A1", "#1565C0"],
  ID: ["#33691E", "#558B2F"],
  MT: ["#4E342E", "#6D4C41"],
  WY: ["#F57F17", "#F9A825"],
  AK: ["#01579B", "#0277BD"],

  // East — classic blues and deep greens
  CT: ["#1A237E", "#283593"],
  DE: ["#0D47A1", "#1565C0"],
  ME: ["#004D40", "#00695C"],
  MD: ["#B71C1C", "#C62828"],
  MA: ["#1B5E20", "#2E7D32"],
  NH: ["#263238", "#37474F"],
  NJ: ["#4A148C", "#6A1B9A"],
  NY: ["#0D47A1", "#1565C0"],
  PA: ["#1A237E", "#283593"],
  RI: ["#01579B", "#0277BD"],
  VT: ["#1B5E20", "#388E3C"],
  VA: ["#311B92", "#4527A0"],
  WV: ["#1565C0", "#1976D2"],
  DC: ["#880E4F", "#AD1457"],

  // South — rich reds and warm tones
  AL: ["#B71C1C", "#C62828"],
  AR: ["#880E4F", "#AD1457"],
  FL: ["#E65100", "#EF6C00"],
  GA: ["#B71C1C", "#D32F2F"],
  KY: ["#0D47A1", "#1565C0"],
  LA: ["#4A148C", "#6A1B9A"],
  MS: ["#1A237E", "#303F9F"],
  NC: ["#01579B", "#0288D1"],
  OK: ["#BF360C", "#E64A19"],
  SC: ["#880E4F", "#C2185B"],
  TN: ["#E65100", "#FF6D00"],
  TX: ["#B71C1C", "#D32F2F"],

  // Midwest — earthy greens and steel blues
  IL: ["#0D47A1", "#1565C0"],
  IN: ["#1A237E", "#283593"],
  IA: ["#33691E", "#558B2F"],
  KS: ["#F57F17", "#FBC02D"],
  MI: ["#0D47A1", "#1976D2"],
  MN: ["#01579B", "#0288D1"],
  MO: ["#1A237E", "#303F9F"],
  NE: ["#BF360C", "#E64A19"],
  ND: ["#1B5E20", "#388E3C"],
  OH: ["#B71C1C", "#D32F2F"],
  SD: ["#01579B", "#0277BD"],
  WI: ["#B71C1C", "#D32F2F"],

  // UK regions
  ENG: ["#1A237E", "#303F9F"],
  SCO: ["#0D47A1", "#1565C0"],
  WAL: ["#B71C1C", "#D32F2F"],
  NIR: ["#1B5E20", "#2E7D32"],

  // Canada
  ON: ["#B71C1C", "#D32F2F"],
  BC: ["#1B5E20", "#2E7D32"],
  AB: ["#0D47A1", "#1565C0"],
  QC: ["#1A237E", "#303F9F"],
  MB: ["#880E4F", "#AD1457"],
  SK: ["#33691E", "#558B2F"],
  NS: ["#01579B", "#0277BD"],
  NB: ["#F57F17", "#FBC02D"],
  PE: ["#1B5E20", "#388E3C"],
  NL: ["#4A148C", "#6A1B9A"],

  // Australia
  NSW: ["#0D47A1", "#1976D2"],
  VIC: ["#1A237E", "#283593"],
  QLD: ["#880E4F", "#AD1457"],
  SA: ["#B71C1C", "#D32F2F"],
  WA_AU: ["#F57F17", "#FBC02D"],
  TAS: ["#1B5E20", "#2E7D32"],
  ACT: ["#0D47A1", "#1565C0"],
  NT: ["#BF360C", "#E64A19"],
};

// Fallback gradient by country
const COUNTRY_GRADIENTS: Record<string, [string, string]> = {
  US: ["#1B5E20", "#2E7D32"],
  GB: ["#1A237E", "#303F9F"],
  CA: ["#B71C1C", "#D32F2F"],
  AU: ["#F57F17", "#FBC02D"],
  NZ: ["#263238", "#455A64"],
  ZA: ["#1B5E20", "#388E3C"],
};

const DEFAULT_GRADIENT: [string, string] = ["#1B5E20", "#2E7D32"];

function getGradient(stateCode: string, country?: string): [string, string] {
  return (
    STATE_GRADIENTS[stateCode] ??
    (country ? COUNTRY_GRADIENTS[country] : undefined) ??
    DEFAULT_GRADIENT
  );
}

function getInitials(name: string): string {
  // Remove common suffixes to get meaningful initials
  const cleaned = name
    .replace(/\b(lawn\s*bowl(s|ing)?|club|bowls|bowling|association|society)\b/gi, "")
    .trim();
  const words = (cleaned || name).split(/\s+/).filter(Boolean);
  if (words.length === 0) return "LB";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface ClubLogoProps {
  name: string;
  stateCode: string;
  country?: string;
  logoUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  xs: { container: 24, text: "text-[8px]", imgClass: "h-6 w-6" },
  sm: { container: 32, text: "text-[10px]", imgClass: "h-8 w-8" },
  md: { container: 48, text: "text-sm", imgClass: "h-12 w-12" },
  lg: { container: 64, text: "text-lg", imgClass: "h-16 w-16" },
  xl: { container: 80, text: "text-xl", imgClass: "h-20 w-20" },
};

export function ClubLogo({
  name,
  stateCode,
  country,
  logoUrl,
  size = "md",
  className = "",
}: ClubLogoProps) {
  const s = SIZES[size];
  const initials = getInitials(name);
  const [from, to] = getGradient(stateCode, country);

  if (logoUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border border-[#0A2E12]/10 ${s.imgClass} ${className}`}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes={`${s.container}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full shadow-sm ${s.imgClass} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      aria-label={`${name} logo`}
    >
      <span
        className={`font-black tracking-tight text-white/95 select-none ${s.text}`}
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
      >
        {initials}
      </span>
    </div>
  );
}

/**
 * Cover image mapping — assigns scenic bowling images to clubs
 * based on a deterministic hash so each club gets a consistent image
 * but they rotate through the available set.
 */
const COVER_IMAGES_BY_REGION: Record<string, string[]> = {
  west: [
    "/images/scenery-golden-hour-green.jpg",
    "/images/scenery-overhead-bowls-jack.jpg",
    "/images/scenery-clubhouse-dusk.jpg",
  ],
  east: [
    "/images/heritage-clubhouse-tea.jpg",
    "/images/scenery-morning-dew-green.jpg",
    "/images/heritage-wooden-bench-green.jpg",
  ],
  south: [
    "/images/scenery-golden-hour-green.jpg",
    "/images/scenery-clubhouse-dusk.jpg",
    "/images/heritage-scoreboard.jpg",
  ],
  midwest: [
    "/images/scenery-morning-dew-green.jpg",
    "/images/heritage-wooden-bench-green.jpg",
    "/images/scenery-overhead-bowls-jack.jpg",
  ],
  // International fallbacks
  default: [
    "/images/scenery-golden-hour-green.jpg",
    "/images/scenery-morning-dew-green.jpg",
    "/images/scenery-clubhouse-dusk.jpg",
    "/images/heritage-clubhouse-tea.jpg",
    "/images/heritage-wooden-bench-green.jpg",
    "/images/heritage-scoreboard.jpg",
    "/images/heritage-weathered-bowls-patina.jpg",
    "/images/scenery-overhead-bowls-jack.jpg",
  ],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getClubCoverImage(
  clubId: string,
  region?: string,
): string {
  const images = COVER_IMAGES_BY_REGION[region ?? ""] ?? COVER_IMAGES_BY_REGION.default;
  return images[hashString(clubId) % images.length];
}
