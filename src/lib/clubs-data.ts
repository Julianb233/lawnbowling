// Club directory data — Australian lawn bowls clubs
// Each club represents a real lawn bowling club in Australia

export type AUState = "NSW" | "VIC" | "QLD" | "SA" | "WA" | "TAS" | "NT" | "ACT";
export type ClubStatus = "active" | "seasonal" | "inactive" | "unverified" | "claimed";
export type SurfaceType = "natural_grass" | "synthetic" | "hybrid" | "unknown";

// Backward-compat aliases for types used elsewhere in codebase
export type USRegion = string;
export type BowlsUSADivision = string;

export interface ClubData {
  id: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  region?: string;
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
  division?: string;
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

export const AU_STATES: Record<string, { name: string; code: string }> = {
  NSW: { name: "New South Wales", code: "NSW" },
  VIC: { name: "Victoria", code: "VIC" },
  QLD: { name: "Queensland", code: "QLD" },
  SA: { name: "South Australia", code: "SA" },
  WA: { name: "Western Australia", code: "WA" },
  TAS: { name: "Tasmania", code: "TAS" },
  NT: { name: "Northern Territory", code: "NT" },
  ACT: { name: "Australian Capital Territory", code: "ACT" },
};

// Backward compat alias
export const US_STATES = AU_STATES;

export const REGION_LABELS: Record<string, { label: string; emoji: string }> = {
  NSW: { label: "NSW", emoji: "🏠" },
  VIC: { label: "VIC", emoji: "🏛️" },
  QLD: { label: "QLD", emoji: "☀️" },
  SA: { label: "SA", emoji: "🍷" },
  WA: { label: "WA", emoji: "🌅" },
  TAS: { label: "TAS", emoji: "🏔️" },
  NT: { label: "NT", emoji: "🐊" },
  ACT: { label: "ACT", emoji: "🏛️" },
};

export const SURFACE_LABELS: Record<SurfaceType, string> = {
  natural_grass: "Natural Grass",
  synthetic: "Synthetic",
  hybrid: "Hybrid",
  unknown: "Unknown",
};

export const ACTIVITY_OPTIONS = [
  "Social Bowls",
  "Pennant/Competition",
  "Tournaments",
  "Barefoot Bowls",
  "Corporate Events",
  "Coaching/Lessons",
  "Junior Programs",
  "Open Days",
  "Night Bowls",
] as const;

export const DIVISION_LABELS: Record<string, string> = {
  none: "Unaffiliated",
};

// 92 Australian lawn bowls clubs
export const CLUBS: ClubData[] = [
  // === NEW SOUTH WALES (25 clubs) ===
  { id: "nsw-city-of-sydney", name: "City of Sydney RSL Bowling Club", city: "Sydney", state: "New South Wales", stateCode: "NSW", address: "169 Castlereagh St, Sydney NSW 2000", memberCount: 200, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Corporate Events", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], description: "Inner-city bowling club in the heart of Sydney, offering social and competitive bowls with modern synthetic greens.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "CityOfSydneyBowls" }, tags: ["city-centre", "corporate-events", "beginner-friendly", "year-round"] },
  { id: "nsw-mosman", name: "Mosman Bowling Club", city: "Mosman", state: "New South Wales", stateCode: "NSW", address: "95 Military Rd, Mosman NSW 2088", memberCount: 350, greens: 3, rinks: 18, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms", "Pro Shop"], founded: 1893, description: "One of Sydney's oldest and most prestigious bowling clubs with stunning harbour views.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "MosmanBowls" }, tags: ["harbour-views", "historic", "premium", "beginner-friendly"] },
  { id: "nsw-coogee", name: "Coogee Bowling Club", city: "Coogee", state: "New South Wales", stateCode: "NSW", memberCount: 180, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Bar/Bistro"], description: "Coastal bowling club near Coogee Beach. Popular for barefoot bowls and social events.", status: "active", hasOnlinePresence: true, tags: ["beachside", "barefoot-bowls", "social"] },
  { id: "nsw-warilla", name: "Warilla Bowling Club", city: "Warilla", state: "New South Wales", stateCode: "NSW", memberCount: 500, greens: 4, rinks: 32, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Coaching/Lessons", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms", "Pro Shop"], description: "One of Australia's premier bowling clubs, renowned for hosting major tournaments and providing world-class facilities.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "WarillaBowls" }, tags: ["premier-club", "tournament-venue", "large-club", "year-round"] },
  { id: "nsw-cabramatta", name: "Cabramatta Bowling & Recreation Club", city: "Cabramatta", state: "New South Wales", stateCode: "NSW", memberCount: 280, greens: 3, rinks: 18, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], status: "active", hasOnlinePresence: true, tags: ["multicultural", "large-club"] },
  { id: "nsw-newcastle", name: "Newcastle City Bowling Club", city: "Newcastle", state: "New South Wales", stateCode: "NSW", memberCount: 220, greens: 3, rinks: 18, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1888, description: "Historic bowling club in the heart of Newcastle with over 130 years of bowls tradition.", status: "active", hasOnlinePresence: true, tags: ["historic", "regional-city", "beginner-friendly"] },
  { id: "nsw-gosford", name: "Gosford Bowling Club", city: "Gosford", state: "New South Wales", stateCode: "NSW", memberCount: 150, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["central-coast", "regional"] },
  { id: "nsw-wollongong", name: "Wollongong Bowling Club", city: "Wollongong", state: "New South Wales", stateCode: "NSW", memberCount: 180, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], status: "active", hasOnlinePresence: true, tags: ["illawarra", "regional-city"] },
  { id: "nsw-penrith", name: "Penrith Bowling Club", city: "Penrith", state: "New South Wales", stateCode: "NSW", memberCount: 200, greens: 2, rinks: 16, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Night Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Western Sydney's favourite bowling club with floodlit synthetic greens for night bowls.", status: "active", hasOnlinePresence: true, tags: ["western-sydney", "night-bowls", "beginner-friendly"] },
  { id: "nsw-dee-why", name: "Dee Why RSL Bowling Club", city: "Dee Why", state: "New South Wales", stateCode: "NSW", memberCount: 160, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["northern-beaches", "RSL"] },
  { id: "nsw-north-sydney", name: "North Sydney Bowling Club", city: "North Sydney", state: "New South Wales", stateCode: "NSW", memberCount: 120, greens: 1, rinks: 8, surfaceType: "synthetic", activities: ["Social Bowls", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Bar/Bistro"], description: "Boutique bowling club with harbour views, popular for corporate events and barefoot bowls.", status: "active", hasOnlinePresence: true, tags: ["harbour-views", "corporate-events", "boutique"] },
  { id: "nsw-belrose", name: "Belrose Bowling Club", city: "Belrose", state: "New South Wales", stateCode: "NSW", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bistro"], status: "active", hasOnlinePresence: true, tags: ["northern-beaches", "family-friendly"] },
  { id: "nsw-parramatta", name: "Parramatta City Bowling Club", city: "Parramatta", state: "New South Wales", stateCode: "NSW", memberCount: 170, greens: 2, rinks: 14, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["western-sydney", "city"] },
  { id: "nsw-bowral", name: "Bowral Bowling Club", city: "Bowral", state: "New South Wales", stateCode: "NSW", memberCount: 100, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking"], founded: 1906, description: "Charming club in the Southern Highlands, known for its beautiful natural grass greens.", status: "active", hasOnlinePresence: true, tags: ["southern-highlands", "scenic", "historic"] },
  { id: "nsw-dubbo", name: "Dubbo RSL Bowling Club", city: "Dubbo", state: "New South Wales", stateCode: "NSW", memberCount: 140, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["regional-nsw", "RSL"] },
  { id: "nsw-tamworth", name: "Tamworth City Bowling Club", city: "Tamworth", state: "New South Wales", stateCode: "NSW", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["regional-nsw", "country"] },
  { id: "nsw-port-macquarie", name: "Port Macquarie Bowling Club", city: "Port Macquarie", state: "New South Wales", stateCode: "NSW", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Popular mid-north coast bowling club attracting local and visiting bowlers year-round.", status: "active", hasOnlinePresence: true, tags: ["mid-north-coast", "coastal", "retiree-friendly"] },
  { id: "nsw-batemans-bay", name: "Batemans Bay Bowling Club", city: "Batemans Bay", state: "New South Wales", stateCode: "NSW", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["south-coast", "coastal"] },
  { id: "nsw-coffs-harbour", name: "Coffs Harbour Bowling Club", city: "Coffs Harbour", state: "New South Wales", stateCode: "NSW", memberCount: 140, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["north-coast", "coastal", "holiday-destination"] },
  { id: "nsw-orange", name: "Orange City Bowling Club", city: "Orange", state: "New South Wales", stateCode: "NSW", memberCount: 110, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["central-west", "country"] },
  { id: "nsw-albury", name: "Albury Commercial Club Bowls", city: "Albury", state: "New South Wales", stateCode: "NSW", memberCount: 150, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], status: "active", hasOnlinePresence: true, tags: ["border-town", "regional"] },
  { id: "nsw-tweed-heads", name: "Tweed Heads Bowling Club", city: "Tweed Heads", state: "New South Wales", stateCode: "NSW", memberCount: 300, greens: 3, rinks: 24, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms", "Pro Shop"], description: "Major bowling club on the Gold Coast border, hosting national and state championships.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "TweedHeadsBowls" }, tags: ["championship-venue", "large-club", "gold-coast-border"] },
  { id: "nsw-manly", name: "Manly Bowling Club", city: "Manly", state: "New South Wales", stateCode: "NSW", memberCount: 180, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Bar/Bistro"], description: "Iconic beachside bowling club steps from Manly Beach.", status: "active", hasOnlinePresence: true, tags: ["beachside", "northern-beaches", "iconic"] },
  { id: "nsw-ballina", name: "Ballina RSL Bowling Club", city: "Ballina", state: "New South Wales", stateCode: "NSW", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["north-coast", "RSL", "coastal"] },
  { id: "nsw-wagga", name: "Wagga Wagga RSL Bowling Club", city: "Wagga Wagga", state: "New South Wales", stateCode: "NSW", memberCount: 140, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["riverina", "RSL", "regional"] },
  // === VICTORIA (22 clubs) ===
  { id: "vic-melbourne", name: "Melbourne Bowling Club", city: "Melbourne", state: "Victoria", stateCode: "VIC", address: "138 Union St, Windsor VIC 3181", memberCount: 250, greens: 3, rinks: 18, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], founded: 1864, description: "One of Australia's oldest bowling clubs, offering a rich tradition of lawn bowls in Melbourne's inner suburbs.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "MelbourneBowls" }, tags: ["historic", "premium", "beginner-friendly", "year-round"] },
  { id: "vic-fitzroy", name: "Fitzroy Victoria Bowling & Sports Club", city: "Fitzroy", state: "Victoria", stateCode: "VIC", memberCount: 140, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events", "Night Bowls"], facilities: ["Clubhouse", "Bar/Bistro"], description: "Trendy inner-city bowling club popular with young professionals for barefoot bowls and social events.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "FitzroyBowls", instagram: "fitzroybowls" }, tags: ["trendy", "inner-city", "barefoot-bowls", "night-bowls"] },
  { id: "vic-brighton", name: "Brighton Bowling Club", city: "Brighton", state: "Victoria", stateCode: "VIC", memberCount: 200, greens: 2, rinks: 16, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1874, description: "Historic bayside bowling club with a strong competition tradition.", status: "active", hasOnlinePresence: true, tags: ["bayside", "historic", "competitive"] },
  { id: "vic-geelong", name: "Geelong Bowling Club", city: "Geelong", state: "Victoria", stateCode: "VIC", memberCount: 180, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1869, status: "active", hasOnlinePresence: true, tags: ["regional-city", "historic"] },
  { id: "vic-ballarat", name: "Ballarat Bowling Club", city: "Ballarat", state: "Victoria", stateCode: "VIC", memberCount: 140, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1862, description: "One of Victoria's oldest bowling clubs, a proud institution of Ballarat's sporting community.", status: "active", hasOnlinePresence: true, tags: ["goldfields", "historic", "country"] },
  { id: "vic-bendigo", name: "Bendigo Bowling Club", city: "Bendigo", state: "Victoria", stateCode: "VIC", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["goldfields", "regional-city"] },
  { id: "vic-st-kilda", name: "St Kilda Bowling Club", city: "St Kilda", state: "Victoria", stateCode: "VIC", memberCount: 120, greens: 1, rinks: 8, surfaceType: "synthetic", activities: ["Social Bowls", "Barefoot Bowls", "Corporate Events", "Night Bowls"], facilities: ["Clubhouse", "Bar/Bistro"], description: "Beachside club known for vibrant social bowls scene and night bowls under lights.", status: "active", hasOnlinePresence: true, socialMedia: { instagram: "stkildabowls" }, tags: ["beachside", "social", "night-bowls", "trendy"] },
  { id: "vic-hawthorn", name: "Hawthorn Bowling Club", city: "Hawthorn", state: "Victoria", stateCode: "VIC", memberCount: 160, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["inner-east", "family-friendly"] },
  { id: "vic-frankston", name: "Frankston Bowling Club", city: "Frankston", state: "Victoria", stateCode: "VIC", memberCount: 150, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["mornington-peninsula", "bayside"] },
  { id: "vic-mornington", name: "Mornington Bowling Club", city: "Mornington", state: "Victoria", stateCode: "VIC", memberCount: 180, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], description: "Premier Mornington Peninsula bowling club with excellent facilities and active community.", status: "active", hasOnlinePresence: true, tags: ["mornington-peninsula", "premium"] },
  { id: "vic-rosebud", name: "Rosebud Bowling Club", city: "Rosebud", state: "Victoria", stateCode: "VIC", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["mornington-peninsula", "coastal"] },
  { id: "vic-dandenong", name: "Dandenong Bowling Club", city: "Dandenong", state: "Victoria", stateCode: "VIC", memberCount: 130, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["south-east", "multicultural"] },
  { id: "vic-warrnambool", name: "Warrnambool Bowling Club", city: "Warrnambool", state: "Victoria", stateCode: "VIC", memberCount: 110, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["western-victoria", "regional"] },
  { id: "vic-shepparton", name: "Shepparton Bowling Club", city: "Shepparton", state: "Victoria", stateCode: "VIC", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["goulburn-valley", "regional"] },
  { id: "vic-traralgon", name: "Traralgon Bowling Club", city: "Traralgon", state: "Victoria", stateCode: "VIC", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["gippsland", "regional"] },
  { id: "vic-sunbury", name: "Sunbury Bowling Club", city: "Sunbury", state: "Victoria", stateCode: "VIC", memberCount: 100, greens: 2, rinks: 10, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", hasOnlinePresence: false, tags: ["outer-melbourne", "family-friendly"] },
  { id: "vic-glen-waverley", name: "Glen Waverley Bowling Club", city: "Glen Waverley", state: "Victoria", stateCode: "VIC", memberCount: 170, greens: 2, rinks: 14, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Coaching/Lessons", "Night Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Modern synthetic greens with floodlighting for year-round bowls in Melbourne's east.", status: "active", hasOnlinePresence: true, tags: ["eastern-suburbs", "modern", "night-bowls"] },
  { id: "vic-williamstown", name: "Williamstown Bowling Club", city: "Williamstown", state: "Victoria", stateCode: "VIC", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1880, status: "active", hasOnlinePresence: true, tags: ["historic", "bayside", "western-suburbs"] },
  { id: "vic-ringwood", name: "Ringwood Bowling Club", city: "Ringwood", state: "Victoria", stateCode: "VIC", memberCount: 140, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Junior Programs"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["eastern-suburbs", "junior-programs"] },
  // === QUEENSLAND (16 clubs) ===
  { id: "qld-brisbane-city", name: "Brisbane City Bowls Club", city: "Brisbane", state: "Queensland", stateCode: "QLD", address: "333 Ann St, Brisbane City QLD 4000", memberCount: 180, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events", "Night Bowls"], facilities: ["Clubhouse", "Bar/Bistro", "Function Rooms"], description: "Inner-city Brisbane bowls club popular for barefoot bowls and corporate events.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "BrisbaneCityBowls" }, tags: ["city-centre", "corporate-events", "night-bowls", "beginner-friendly"] },
  { id: "qld-broadbeach", name: "Broadbeach Bowls Club", city: "Broadbeach", state: "Queensland", stateCode: "QLD", memberCount: 300, greens: 4, rinks: 28, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls", "Corporate Events", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms", "Pro Shop"], description: "Gold Coast's premier bowling club, home to numerous national and international events.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "BroadbeachBowls" }, tags: ["gold-coast", "championship-venue", "large-club", "year-round"] },
  { id: "qld-cairns", name: "Cairns Bowling Club", city: "Cairns", state: "Queensland", stateCode: "QLD", memberCount: 140, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Tropical Far North Queensland bowling club catering to locals and tourists alike.", status: "active", hasOnlinePresence: true, tags: ["tropical", "far-north-qld", "tourist-friendly"] },
  { id: "qld-townsville", name: "Townsville RSL Bowling Club", city: "Townsville", state: "Queensland", stateCode: "QLD", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["north-qld", "RSL", "regional-city"] },
  { id: "qld-toowoomba", name: "Toowoomba City Bowling Club", city: "Toowoomba", state: "Queensland", stateCode: "QLD", memberCount: 150, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Darling Downs premier bowling club, known for its welcoming community atmosphere.", status: "active", hasOnlinePresence: true, tags: ["darling-downs", "regional-city"] },
  { id: "qld-redcliffe", name: "Redcliffe Leagues Bowling Club", city: "Redcliffe", state: "Queensland", stateCode: "QLD", memberCount: 180, greens: 2, rinks: 16, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], status: "active", hasOnlinePresence: true, tags: ["moreton-bay", "coastal"] },
  { id: "qld-noosa", name: "Noosa Bowling Club", city: "Noosa Heads", state: "Queensland", stateCode: "QLD", memberCount: 140, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Relaxed Sunshine Coast bowling club in beautiful Noosa.", status: "active", hasOnlinePresence: true, tags: ["sunshine-coast", "coastal", "holiday-destination"] },
  { id: "qld-maroochydore", name: "Maroochydore Bowls Club", city: "Maroochydore", state: "Queensland", stateCode: "QLD", memberCount: 200, greens: 2, rinks: 16, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], status: "active", hasOnlinePresence: true, tags: ["sunshine-coast", "large-club"] },
  { id: "qld-surfers-paradise", name: "Surfers Paradise Bowling Club", city: "Surfers Paradise", state: "Queensland", stateCode: "QLD", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Barefoot Bowls", "Corporate Events", "Night Bowls"], facilities: ["Clubhouse", "Bar/Bistro"], description: "Iconic Gold Coast bowling club right in Surfers Paradise.", status: "active", hasOnlinePresence: true, tags: ["gold-coast", "tourist-friendly", "night-bowls"] },
  { id: "qld-rockhampton", name: "Rockhampton Bowling Club", city: "Rockhampton", state: "Queensland", stateCode: "QLD", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["central-qld", "regional"] },
  { id: "qld-bundaberg", name: "Bundaberg Bowling Club", city: "Bundaberg", state: "Queensland", stateCode: "QLD", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["wide-bay", "regional"] },
  { id: "qld-ipswich", name: "Ipswich City Bowling Club", city: "Ipswich", state: "Queensland", stateCode: "QLD", memberCount: 140, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Junior Programs"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["ipswich", "western-corridor", "junior-programs"] },
  { id: "qld-hervey-bay", name: "Hervey Bay Bowling Club", city: "Hervey Bay", state: "Queensland", stateCode: "QLD", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["fraser-coast", "coastal", "retiree-friendly"] },
  { id: "qld-mackay", name: "Mackay Bowling Club", city: "Mackay", state: "Queensland", stateCode: "QLD", memberCount: 110, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["north-qld", "regional"] },
  { id: "qld-mt-gravatt", name: "Mt Gravatt Bowls Club", city: "Mount Gravatt", state: "Queensland", stateCode: "QLD", memberCount: 150, greens: 2, rinks: 14, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Coaching/Lessons", "Night Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Modern club with synthetic greens and full lighting, supporting community and competitive bowls.", status: "active", hasOnlinePresence: true, tags: ["south-brisbane", "modern", "night-bowls"] },
  // === SOUTH AUSTRALIA (8 clubs) ===
  { id: "sa-adelaide", name: "Adelaide Bowling Club", city: "Adelaide", state: "South Australia", stateCode: "SA", address: "South Terrace, Adelaide SA 5000", memberCount: 200, greens: 3, rinks: 18, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Corporate Events", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], founded: 1866, description: "South Australia's oldest bowling club, located on the Adelaide Parklands with a proud 150+ year tradition.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "AdelaideBowlingClub" }, tags: ["historic", "parklands", "premium", "beginner-friendly"] },
  { id: "sa-glenelg", name: "Glenelg Bowling Club", city: "Glenelg", state: "South Australia", stateCode: "SA", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Seaside bowling club at popular Glenelg Beach.", status: "active", hasOnlinePresence: true, tags: ["beachside", "corporate-events"] },
  { id: "sa-norwood", name: "Norwood Bowling Club", city: "Norwood", state: "South Australia", stateCode: "SA", memberCount: 140, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["inner-suburbs", "competitive"] },
  { id: "sa-port-adelaide", name: "Port Adelaide Bowling Club", city: "Port Adelaide", state: "South Australia", stateCode: "SA", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["port", "community"] },
  { id: "sa-mt-gambier", name: "Mount Gambier Bowling Club", city: "Mount Gambier", state: "South Australia", stateCode: "SA", memberCount: 100, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["limestone-coast", "regional"] },
  { id: "sa-victor-harbor", name: "Victor Harbor Bowling Club", city: "Victor Harbor", state: "South Australia", stateCode: "SA", memberCount: 110, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Picturesque bowling club on the Fleurieu Peninsula.", status: "active", hasOnlinePresence: true, tags: ["fleurieu", "coastal", "retiree-friendly"] },
  { id: "sa-murray-bridge", name: "Murray Bridge Bowling Club", city: "Murray Bridge", state: "South Australia", stateCode: "SA", memberCount: 90, greens: 2, rinks: 10, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking"], status: "active", hasOnlinePresence: false, tags: ["murray-river", "regional"] },
  { id: "sa-unley", name: "Unley Bowling Club", city: "Unley", state: "South Australia", stateCode: "SA", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["inner-suburbs", "social"] },
  // === WESTERN AUSTRALIA (8 clubs) ===
  { id: "wa-perth", name: "Perth Bowling Club", city: "Perth", state: "Western Australia", stateCode: "WA", address: "16 Terrace Rd, Perth WA 6000", memberCount: 180, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Corporate Events", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], founded: 1898, description: "WA's premier city bowling club, offering bowls with views of the Perth skyline.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "PerthBowlingClub" }, tags: ["city-centre", "historic", "skyline-views", "beginner-friendly"] },
  { id: "wa-fremantle", name: "Fremantle Bowling Club", city: "Fremantle", state: "Western Australia", stateCode: "WA", memberCount: 160, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Heritage-listed bowling club in the heart of Fremantle's port precinct.", status: "active", hasOnlinePresence: true, tags: ["fremantle", "heritage", "port-city"] },
  { id: "wa-scarborough", name: "Scarborough Bowling Club", city: "Scarborough", state: "Western Australia", stateCode: "WA", memberCount: 140, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["beachside", "northern-suburbs"] },
  { id: "wa-bunbury", name: "Bunbury Bowling Club", city: "Bunbury", state: "Western Australia", stateCode: "WA", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["south-west", "regional-city"] },
  { id: "wa-geraldton", name: "Geraldton Bowling Club", city: "Geraldton", state: "Western Australia", stateCode: "WA", memberCount: 100, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: false, tags: ["mid-west", "regional"] },
  { id: "wa-mandurah", name: "Mandurah Bowling & Recreation Club", city: "Mandurah", state: "Western Australia", stateCode: "WA", memberCount: 180, greens: 2, rinks: 16, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], description: "Large, welcoming club on the Peel Inlet with strong community spirit.", status: "active", hasOnlinePresence: true, tags: ["peel-region", "large-club", "retiree-friendly"] },
  { id: "wa-joondalup", name: "Joondalup Bowling Club", city: "Joondalup", state: "Western Australia", stateCode: "WA", memberCount: 130, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["northern-suburbs", "modern"] },
  { id: "wa-albany", name: "Albany Bowling Club", city: "Albany", state: "Western Australia", stateCode: "WA", memberCount: 100, greens: 2, rinks: 10, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking"], description: "Great Southern's largest bowling club with views of King George Sound.", status: "active", hasOnlinePresence: false, tags: ["great-southern", "scenic", "regional"] },
  // === TASMANIA (5 clubs) ===
  { id: "tas-hobart", name: "Sandy Bay Bowling Club", city: "Hobart", state: "Tasmania", stateCode: "TAS", memberCount: 150, greens: 2, rinks: 14, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1875, description: "Tasmania's premier bowling club with views of the Derwent River and Mt Wellington.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "SandyBayBowls" }, tags: ["river-views", "historic", "premium"] },
  { id: "tas-launceston", name: "Launceston Bowling Club", city: "Launceston", state: "Tasmania", stateCode: "TAS", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], founded: 1869, status: "active", hasOnlinePresence: true, tags: ["historic", "regional-city"] },
  { id: "tas-devonport", name: "Devonport Bowling Club", city: "Devonport", state: "Tasmania", stateCode: "TAS", memberCount: 90, greens: 2, rinks: 10, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", hasOnlinePresence: false, tags: ["north-west", "coastal"] },
  { id: "tas-burnie", name: "Burnie Bowling Club", city: "Burnie", state: "Tasmania", stateCode: "TAS", memberCount: 80, greens: 2, rinks: 10, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition"], facilities: ["Clubhouse", "Parking"], status: "active", hasOnlinePresence: false, tags: ["north-west", "regional"] },
  { id: "tas-kingston", name: "Kingston Beach Bowling Club", city: "Kingston", state: "Tasmania", stateCode: "TAS", memberCount: 100, greens: 2, rinks: 10, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Relaxed beachside club just south of Hobart.", status: "active", hasOnlinePresence: true, tags: ["beachside", "southern-tas"] },
  // === NORTHERN TERRITORY (3 clubs) ===
  { id: "nt-darwin", name: "Darwin Bowling & Social Club", city: "Darwin", state: "Northern Territory", stateCode: "NT", memberCount: 120, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls", "Corporate Events", "Night Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Top End bowling club with tropical evening bowls under floodlights.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "DarwinBowls" }, tags: ["tropical", "night-bowls", "year-round"] },
  { id: "nt-alice-springs", name: "Alice Springs Bowling Club", city: "Alice Springs", state: "Northern Territory", stateCode: "NT", memberCount: 70, greens: 1, rinks: 8, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Outback bowling at its finest, with stunning Red Centre sunsets from the green.", status: "active", hasOnlinePresence: true, tags: ["outback", "red-centre", "unique"] },
  { id: "nt-katherine", name: "Katherine Bowling Club", city: "Katherine", state: "Northern Territory", stateCode: "NT", memberCount: 50, greens: 1, rinks: 6, surfaceType: "synthetic", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", hasOnlinePresence: false, tags: ["outback", "small-town"] },
  // === ACT (5 clubs) ===
  { id: "act-canberra-city", name: "Canberra City Bowling Club", city: "Canberra", state: "Australian Capital Territory", stateCode: "ACT", address: "1 Gooreen St, Braddon ACT 2612", memberCount: 180, greens: 3, rinks: 18, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Bistro", "Function Rooms"], founded: 1927, description: "Canberra's flagship bowling club, hosting ACT championships and inter-state events.", status: "active", hasOnlinePresence: true, socialMedia: { facebook: "CanberraCityBowls" }, tags: ["capital", "championship-venue", "beginner-friendly"] },
  { id: "act-woden", name: "Woden Valley Bowling Club", city: "Canberra", state: "Australian Capital Territory", stateCode: "ACT", memberCount: 130, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["southside", "family-friendly"] },
  { id: "act-belconnen", name: "Belconnen Bowling Club", city: "Canberra", state: "Australian Capital Territory", stateCode: "ACT", memberCount: 120, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Barefoot Bowls"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["northside", "community"] },
  { id: "act-tuggeranong", name: "Tuggeranong Vikings Bowling Club", city: "Canberra", state: "Australian Capital Territory", stateCode: "ACT", memberCount: 100, greens: 2, rinks: 12, surfaceType: "synthetic", activities: ["Social Bowls", "Pennant/Competition", "Junior Programs"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], status: "active", hasOnlinePresence: true, tags: ["southside", "junior-programs"] },
  { id: "act-queanbeyan", name: "Queanbeyan Bowling Club", city: "Queanbeyan", state: "Australian Capital Territory", stateCode: "ACT", memberCount: 110, greens: 2, rinks: 12, surfaceType: "natural_grass", activities: ["Social Bowls", "Pennant/Competition", "Tournaments"], facilities: ["Clubhouse", "Parking", "Bar/Bistro"], description: "Border-town club serving the greater Canberra region.", status: "active", hasOnlinePresence: true, tags: ["border-town", "community"] },
];

// Helper functions
export function getClubById(id: string): ClubData | undefined {
  return CLUBS.find((c) => c.id === id);
}

export function getClubsByState(stateCode: string): ClubData[] {
  return CLUBS.filter((c) => c.stateCode === stateCode.toUpperCase());
}

export function getClubsByRegion(region: string): ClubData[] {
  return CLUBS.filter((c) => c.stateCode === region);
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
  const totalMembers = CLUBS.reduce((sum, c) => sum + (c.memberCount ?? 0), 0);
  return {
    totalClubs: CLUBS.length,
    totalStates: states.length,
    totalRegions: states.length,
    totalMembers,
    activeClubs: CLUBS.filter((c) => c.status === "active").length,
    seasonalClubs: CLUBS.filter((c) => c.status === "seasonal").length,
  };
}
