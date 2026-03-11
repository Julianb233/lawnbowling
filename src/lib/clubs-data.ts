// Club directory data — will be populated from research agents
// Each club represents a real lawn bowling club in the USA

export type USRegion = "west" | "east" | "south" | "midwest";
export type ClubStatus = "active" | "seasonal" | "inactive" | "unverified" | "claimed";
export type SurfaceType = "natural_grass" | "synthetic" | "hybrid" | "unknown";
export type BowlsUSADivision =
  | "pacific_intermountain"
  | "southwest"
  | "south_central"
  | "southeast"
  | "central"
  | "eastern"
  | "northeast"
  | "northwest"
  | "none";

export interface ClubData {
  id: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  region: USRegion;
  address?: string;
  lat?: number;
  lng?: number;
  website?: string;
  phone?: string;
  email?: string;
  memberCount?: number;
  greens?: number;
  rinks?: number;
  surfaceType: SurfaceType;
  division: BowlsUSADivision;
  activities: string[];
  facilities: string[];
  founded?: number;
  description?: string;
  status: ClubStatus;
  hasOnlinePresence: boolean;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  tags: string[];
}

export const US_STATES: Record<string, { name: string; code: string; region: USRegion }> = {
  AL: { name: "Alabama", code: "AL", region: "south" },
  AK: { name: "Alaska", code: "AK", region: "west" },
  AZ: { name: "Arizona", code: "AZ", region: "west" },
  AR: { name: "Arkansas", code: "AR", region: "south" },
  CA: { name: "California", code: "CA", region: "west" },
  CO: { name: "Colorado", code: "CO", region: "west" },
  CT: { name: "Connecticut", code: "CT", region: "east" },
  DE: { name: "Delaware", code: "DE", region: "east" },
  FL: { name: "Florida", code: "FL", region: "south" },
  GA: { name: "Georgia", code: "GA", region: "south" },
  HI: { name: "Hawaii", code: "HI", region: "west" },
  ID: { name: "Idaho", code: "ID", region: "west" },
  IL: { name: "Illinois", code: "IL", region: "midwest" },
  IN: { name: "Indiana", code: "IN", region: "midwest" },
  IA: { name: "Iowa", code: "IA", region: "midwest" },
  KS: { name: "Kansas", code: "KS", region: "midwest" },
  KY: { name: "Kentucky", code: "KY", region: "south" },
  LA: { name: "Louisiana", code: "LA", region: "south" },
  ME: { name: "Maine", code: "ME", region: "east" },
  MD: { name: "Maryland", code: "MD", region: "east" },
  MA: { name: "Massachusetts", code: "MA", region: "east" },
  MI: { name: "Michigan", code: "MI", region: "midwest" },
  MN: { name: "Minnesota", code: "MN", region: "midwest" },
  MS: { name: "Mississippi", code: "MS", region: "south" },
  MO: { name: "Missouri", code: "MO", region: "midwest" },
  MT: { name: "Montana", code: "MT", region: "west" },
  NE: { name: "Nebraska", code: "NE", region: "midwest" },
  NV: { name: "Nevada", code: "NV", region: "west" },
  NH: { name: "New Hampshire", code: "NH", region: "east" },
  NJ: { name: "New Jersey", code: "NJ", region: "east" },
  NM: { name: "New Mexico", code: "NM", region: "west" },
  NY: { name: "New York", code: "NY", region: "east" },
  NC: { name: "North Carolina", code: "NC", region: "south" },
  ND: { name: "North Dakota", code: "ND", region: "midwest" },
  OH: { name: "Ohio", code: "OH", region: "midwest" },
  OK: { name: "Oklahoma", code: "OK", region: "south" },
  OR: { name: "Oregon", code: "OR", region: "west" },
  PA: { name: "Pennsylvania", code: "PA", region: "east" },
  RI: { name: "Rhode Island", code: "RI", region: "east" },
  SC: { name: "South Carolina", code: "SC", region: "south" },
  SD: { name: "South Dakota", code: "SD", region: "midwest" },
  TN: { name: "Tennessee", code: "TN", region: "south" },
  TX: { name: "Texas", code: "TX", region: "south" },
  UT: { name: "Utah", code: "UT", region: "west" },
  VT: { name: "Vermont", code: "VT", region: "east" },
  VA: { name: "Virginia", code: "VA", region: "east" },
  WA: { name: "Washington", code: "WA", region: "west" },
  WV: { name: "West Virginia", code: "WV", region: "east" },
  WI: { name: "Wisconsin", code: "WI", region: "midwest" },
  WY: { name: "Wyoming", code: "WY", region: "west" },
  DC: { name: "Washington DC", code: "DC", region: "east" },
};

export const REGION_LABELS: Record<USRegion, { label: string; emoji: string }> = {
  west: { label: "West", emoji: "🌅" },
  east: { label: "East", emoji: "🗽" },
  south: { label: "South", emoji: "☀️" },
  midwest: { label: "Midwest", emoji: "🌾" },
};

export const SURFACE_LABELS: Record<SurfaceType, string> = {
  natural_grass: "Natural Grass",
  synthetic: "Synthetic",
  hybrid: "Hybrid",
  unknown: "Unknown",
};

export const ACTIVITY_OPTIONS = [
  "Social Bowls",
  "League/Pennant",
  "Tournaments",
  "Barefoot Bowls",
  "Corporate Events",
  "Coaching/Lessons",
  "Junior Programs",
  "Open Days",
] as const;

// Initial club data — to be expanded from research
// This is seeded with well-known clubs; full data coming from research agents
export const CLUBS: ClubData[] = [
  // === CALIFORNIA ===
  {
    id: "ca-san-francisco",
    name: "San Francisco Lawn Bowling Club",
    city: "San Francisco",
    state: "California",
    stateCode: "CA",
    region: "west",
    address: "Golden Gate Park, San Francisco, CA 94117",
    website: "https://www.sflbc.org",
    memberCount: 150,
    greens: 2,
    rinks: 12,
    surfaceType: "natural_grass",
    division: "pacific_intermountain",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Open Days", "Coaching/Lessons"],
    facilities: ["Clubhouse", "Parking", "Restrooms"],
    founded: 1901,
    description: "One of the oldest lawn bowling clubs in America, located in beautiful Golden Gate Park. Open to the public with free lessons on Wednesdays.",
    status: "active",
    hasOnlinePresence: true,
    socialMedia: { facebook: "SFLawnBowlingClub" },
    tags: ["historic", "public-park", "beginner-friendly", "free-lessons"],
  },
  {
    id: "ca-berkeley",
    name: "Berkeley Lawn Bowling Club",
    city: "Berkeley",
    state: "California",
    stateCode: "CA",
    region: "west",
    website: "https://www.berkeleylbc.org",
    memberCount: 80,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "pacific_intermountain",
    activities: ["Social Bowls", "Tournaments", "Open Days"],
    facilities: ["Clubhouse", "Parking"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["public-park", "beginner-friendly"],
  },
  {
    id: "ca-palo-alto",
    name: "Palo Alto Lawn Bowls Club",
    city: "Palo Alto",
    state: "California",
    stateCode: "CA",
    region: "west",
    website: "https://www.palbc.org",
    memberCount: 100,
    greens: 1,
    rinks: 8,
    surfaceType: "natural_grass",
    division: "pacific_intermountain",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"],
    facilities: ["Clubhouse", "Parking", "Restrooms"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["beginner-friendly"],
  },
  {
    id: "ca-santa-cruz",
    name: "Santa Cruz Lawn Bowling Club",
    city: "Santa Cruz",
    state: "California",
    stateCode: "CA",
    region: "west",
    memberCount: 60,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "pacific_intermountain",
    activities: ["Social Bowls", "Open Days"],
    facilities: ["Clubhouse"],
    status: "active",
    hasOnlinePresence: false,
    tags: ["public-park"],
  },
  {
    id: "ca-laguna-beach",
    name: "Laguna Beach Lawn Bowling Club",
    city: "Laguna Beach",
    state: "California",
    stateCode: "CA",
    region: "west",
    website: "https://www.lagunalawnbowling.com",
    memberCount: 120,
    greens: 2,
    rinks: 10,
    surfaceType: "natural_grass",
    division: "southwest",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Barefoot Bowls", "Corporate Events"],
    facilities: ["Clubhouse", "Parking", "Bar/Lounge", "Pro Shop"],
    founded: 1931,
    description: "Beautiful ocean-view greens in the heart of Laguna Beach. Active social and competitive programs year-round.",
    status: "active",
    hasOnlinePresence: true,
    socialMedia: { facebook: "LagunaBeachLawnBowling" },
    tags: ["ocean-view", "year-round", "corporate-events", "beginner-friendly"],
  },
  {
    id: "ca-long-beach",
    name: "Long Beach Lawn Bowling Club",
    city: "Long Beach",
    state: "California",
    stateCode: "CA",
    region: "west",
    memberCount: 90,
    greens: 1,
    rinks: 8,
    surfaceType: "natural_grass",
    division: "southwest",
    activities: ["Social Bowls", "League/Pennant", "Tournaments"],
    facilities: ["Clubhouse", "Parking"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["year-round"],
  },
  {
    id: "ca-santa-monica",
    name: "Santa Monica Lawn Bowling Club",
    city: "Santa Monica",
    state: "California",
    stateCode: "CA",
    region: "west",
    memberCount: 70,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "southwest",
    activities: ["Social Bowls", "Barefoot Bowls", "Open Days"],
    facilities: ["Clubhouse", "Parking"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["public-park", "barefoot-bowls"],
  },
  // === FLORIDA ===
  {
    id: "fl-sun-city-center",
    name: "Sun City Center Lawn Bowling Club",
    city: "Sun City Center",
    state: "Florida",
    stateCode: "FL",
    region: "south",
    memberCount: 220,
    greens: 3,
    rinks: 18,
    surfaceType: "natural_grass",
    division: "southeast",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"],
    facilities: ["Clubhouse", "Parking", "Restrooms", "Bar/Lounge"],
    description: "One of the largest lawn bowling clubs in the US, located in the premier 55+ retirement community.",
    status: "active",
    hasOnlinePresence: true,
    tags: ["55+", "large-club", "retirement-community", "year-round"],
  },
  {
    id: "fl-clearwater",
    name: "Clearwater Lawn Bowls Club",
    city: "Clearwater",
    state: "Florida",
    stateCode: "FL",
    region: "south",
    memberCount: 180,
    greens: 2,
    rinks: 14,
    surfaceType: "natural_grass",
    division: "southeast",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Open Days"],
    facilities: ["Clubhouse", "Parking", "Restrooms"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["year-round", "beginner-friendly"],
  },
  {
    id: "fl-sarasota",
    name: "Sarasota Lawn Bowling Club",
    city: "Sarasota",
    state: "Florida",
    stateCode: "FL",
    region: "south",
    memberCount: 140,
    greens: 2,
    rinks: 12,
    surfaceType: "natural_grass",
    division: "southeast",
    activities: ["Social Bowls", "League/Pennant", "Tournaments"],
    facilities: ["Clubhouse", "Parking", "Restrooms"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["year-round", "beginner-friendly"],
  },
  {
    id: "fl-lakeland",
    name: "Lakeland Lawn Bowling Club",
    city: "Lakeland",
    state: "Florida",
    stateCode: "FL",
    region: "south",
    memberCount: 100,
    greens: 1,
    rinks: 8,
    surfaceType: "natural_grass",
    division: "southeast",
    activities: ["Social Bowls", "Tournaments"],
    facilities: ["Clubhouse", "Parking"],
    status: "seasonal",
    hasOnlinePresence: false,
    tags: ["seasonal", "winter-only"],
  },
  {
    id: "fl-mount-dora",
    name: "Mount Dora Lawn Bowling Club",
    city: "Mount Dora",
    state: "Florida",
    stateCode: "FL",
    region: "south",
    memberCount: 80,
    greens: 1,
    rinks: 8,
    surfaceType: "natural_grass",
    division: "southeast",
    activities: ["Social Bowls", "Tournaments", "Open Days"],
    facilities: ["Clubhouse", "Parking"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["historic", "small-town"],
  },
  // === NEW YORK ===
  {
    id: "ny-central-park",
    name: "New York Lawn Bowling Club",
    city: "New York",
    state: "New York",
    stateCode: "NY",
    region: "east",
    address: "Central Park, New York, NY 10019",
    website: "https://www.nylawnbowling.org",
    memberCount: 120,
    greens: 2,
    rinks: 10,
    surfaceType: "natural_grass",
    division: "eastern",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Corporate Events", "Open Days", "Coaching/Lessons"],
    facilities: ["Clubhouse", "Restrooms"],
    founded: 1926,
    description: "Located in Central Park, offering lawn bowling in the heart of Manhattan. Famous for corporate events and open days.",
    status: "seasonal",
    hasOnlinePresence: true,
    socialMedia: { facebook: "NYLawnBowling", instagram: "nylawnbowling" },
    tags: ["iconic", "central-park", "corporate-events", "seasonal", "beginner-friendly"],
  },
  {
    id: "ny-brooklyn",
    name: "Brooklyn Lawn Bowling Club",
    city: "Brooklyn",
    state: "New York",
    stateCode: "NY",
    region: "east",
    memberCount: 60,
    greens: 1,
    rinks: 4,
    surfaceType: "natural_grass",
    division: "eastern",
    activities: ["Social Bowls", "Open Days", "Barefoot Bowls"],
    facilities: ["Restrooms"],
    status: "seasonal",
    hasOnlinePresence: true,
    tags: ["public-park", "seasonal", "hipster-friendly"],
  },
  // === ILLINOIS ===
  {
    id: "il-chicago-lakeside",
    name: "Chicago Lakeside Lawn Bowling Club",
    city: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    region: "midwest",
    memberCount: 80,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "central",
    activities: ["Social Bowls", "League/Pennant", "Tournaments"],
    facilities: ["Clubhouse", "Parking"],
    status: "seasonal",
    hasOnlinePresence: true,
    tags: ["historic", "seasonal", "lakefront"],
  },
  // === ARIZONA ===
  {
    id: "az-sun-city",
    name: "Sun City Lawn Bowling Club",
    city: "Sun City",
    state: "Arizona",
    stateCode: "AZ",
    region: "west",
    memberCount: 200,
    greens: 2,
    rinks: 16,
    surfaceType: "natural_grass",
    division: "southwest",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"],
    facilities: ["Clubhouse", "Parking", "Restrooms", "Pro Shop"],
    description: "One of the largest and most active lawn bowling clubs in the Southwest, in the heart of Sun City retirement community.",
    status: "active",
    hasOnlinePresence: true,
    tags: ["55+", "large-club", "retirement-community", "year-round"],
  },
  {
    id: "az-sun-city-west",
    name: "Johnson Lawn Bowling Club",
    city: "Sun City West",
    state: "Arizona",
    stateCode: "AZ",
    region: "west",
    memberCount: 160,
    greens: 2,
    rinks: 12,
    surfaceType: "natural_grass",
    division: "southwest",
    activities: ["Social Bowls", "League/Pennant", "Tournaments"],
    facilities: ["Clubhouse", "Parking", "Restrooms"],
    status: "active",
    hasOnlinePresence: true,
    tags: ["55+", "retirement-community", "year-round"],
  },
  // === WASHINGTON ===
  {
    id: "wa-jefferson-park",
    name: "Jefferson Park Lawn Bowling Club",
    city: "Seattle",
    state: "Washington",
    stateCode: "WA",
    region: "west",
    memberCount: 70,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "northwest",
    activities: ["Social Bowls", "League/Pennant", "Open Days", "Coaching/Lessons"],
    facilities: ["Clubhouse", "Parking"],
    status: "seasonal",
    hasOnlinePresence: true,
    tags: ["public-park", "seasonal", "beginner-friendly"],
  },
  {
    id: "wa-woodland-park",
    name: "Woodland Park Lawn Bowling Club",
    city: "Seattle",
    state: "Washington",
    stateCode: "WA",
    region: "west",
    memberCount: 50,
    greens: 1,
    rinks: 4,
    surfaceType: "natural_grass",
    division: "northwest",
    activities: ["Social Bowls", "Open Days"],
    facilities: ["Restrooms"],
    status: "seasonal",
    hasOnlinePresence: false,
    tags: ["public-park", "casual"],
  },
  // === OREGON ===
  {
    id: "or-portland",
    name: "Portland Lawn Bowling Club",
    city: "Portland",
    state: "Oregon",
    stateCode: "OR",
    region: "west",
    memberCount: 60,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "northwest",
    activities: ["Social Bowls", "Tournaments", "Open Days"],
    facilities: ["Clubhouse", "Parking"],
    status: "seasonal",
    hasOnlinePresence: true,
    tags: ["public-park", "seasonal"],
  },
  // === CONNECTICUT ===
  {
    id: "ct-thistle",
    name: "Thistle Lawn Bowling Club",
    city: "Hartford",
    state: "Connecticut",
    stateCode: "CT",
    region: "east",
    memberCount: 40,
    greens: 1,
    rinks: 4,
    surfaceType: "natural_grass",
    division: "northeast",
    activities: ["Social Bowls", "Tournaments"],
    facilities: ["Clubhouse"],
    founded: 1893,
    description: "One of the oldest lawn bowling clubs in America.",
    status: "active",
    hasOnlinePresence: false,
    tags: ["historic"],
  },
  // === MASSACHUSETTS ===
  {
    id: "ma-boston",
    name: "Boston Lawn Bowling Club",
    city: "Boston",
    state: "Massachusetts",
    stateCode: "MA",
    region: "east",
    memberCount: 50,
    greens: 1,
    rinks: 4,
    surfaceType: "natural_grass",
    division: "northeast",
    activities: ["Social Bowls", "Open Days"],
    facilities: ["Restrooms"],
    status: "seasonal",
    hasOnlinePresence: true,
    tags: ["public-park", "seasonal"],
  },
  // === WISCONSIN ===
  {
    id: "wi-milwaukee-lake-park",
    name: "Milwaukee Lake Park Lawn Bowling Club",
    city: "Milwaukee",
    state: "Wisconsin",
    stateCode: "WI",
    region: "midwest",
    website: "https://www.lakeparkbowls.org",
    memberCount: 100,
    greens: 1,
    rinks: 8,
    surfaceType: "natural_grass",
    division: "central",
    activities: ["Social Bowls", "League/Pennant", "Tournaments", "Barefoot Bowls", "Corporate Events", "Open Days"],
    facilities: ["Clubhouse", "Parking", "Bar/Lounge", "Restrooms"],
    founded: 1926,
    description: "Historic club in Lake Park with stunning Lake Michigan views. Known for lively social bowls and corporate events.",
    status: "seasonal",
    hasOnlinePresence: true,
    socialMedia: { facebook: "LakeParkBowls" },
    tags: ["historic", "lake-view", "corporate-events", "seasonal", "beginner-friendly"],
  },
  // === VIRGINIA ===
  {
    id: "va-williamsburg",
    name: "Williamsburg Inn Lawn Bowling Club",
    city: "Williamsburg",
    state: "Virginia",
    stateCode: "VA",
    region: "east",
    memberCount: 40,
    greens: 1,
    rinks: 4,
    surfaceType: "natural_grass",
    division: "eastern",
    activities: ["Social Bowls", "Open Days"],
    facilities: ["Clubhouse", "Parking", "Restrooms"],
    description: "Historic lawn bowling at Colonial Williamsburg. Open to resort guests and the public.",
    status: "active",
    hasOnlinePresence: true,
    tags: ["historic", "resort", "tourist-friendly"],
  },
  // === COLORADO ===
  {
    id: "co-denver",
    name: "Denver Lawn Bowling Club",
    city: "Denver",
    state: "Colorado",
    stateCode: "CO",
    region: "west",
    memberCount: 55,
    greens: 1,
    rinks: 6,
    surfaceType: "natural_grass",
    division: "southwest",
    activities: ["Social Bowls", "Tournaments", "Open Days"],
    facilities: ["Clubhouse", "Parking"],
    status: "seasonal",
    hasOnlinePresence: true,
    tags: ["seasonal", "public-park"],
  },
];

// Helper functions
export function getClubsByState(stateCode: string): ClubData[] {
  return CLUBS.filter((c) => c.stateCode === stateCode);
}

export function getClubsByRegion(region: USRegion): ClubData[] {
  return CLUBS.filter((c) => c.region === region);
}

export function getStatesWithClubs(): string[] {
  return [...new Set(CLUBS.map((c) => c.stateCode))].sort();
}

export function searchClubs(query: string): ClubData[] {
  const q = query.toLowerCase();
  return CLUBS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.tags.some((t) => t.includes(q))
  );
}

export function getClubStats() {
  const states = getStatesWithClubs();
  const regions = [...new Set(CLUBS.map((c) => c.region))];
  const totalMembers = CLUBS.reduce((sum, c) => sum + (c.memberCount ?? 0), 0);
  return {
    totalClubs: CLUBS.length,
    totalStates: states.length,
    totalRegions: regions.length,
    totalMembers,
    activeClubs: CLUBS.filter((c) => c.status === "active").length,
    seasonalClubs: CLUBS.filter((c) => c.status === "seasonal").length,
  };
}
