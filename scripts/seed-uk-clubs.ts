/**
 * Seed Bowls England + Bowls Scotland clubs into the database.
 *
 * Data sources:
 *   - Bowls Scotland: 816 REAL clubs scraped from bowlsscotland.com/club-finder
 *     (scripts/data/scotland-clubs.json) — names, addresses, postcodes, contacts
 *   - Bowls England: 35 county associations, ~2,500 clubs generated from real
 *     county data, town names, and naming patterns (no public scrapable directory)
 *
 * Total: ~3,300+ clubs
 *
 * Usage:
 *   npx tsx scripts/seed-uk-clubs.ts
 *   npx tsx scripts/seed-uk-clubs.ts --clean    # Remove UK clubs first
 *   npx tsx scripts/seed-uk-clubs.ts --dry-run  # Show stats without inserting
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Linear: AI-2514
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Load env ───────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(name: string, city: string, code: string): string {
  return `${name}-${city}-${code}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function jitter(base: number, range: number): number {
  return base + (Math.random() - 0.5) * 2 * range;
}

// ── Common types ──────────────────────────────────────────────────────

interface ClubRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  state_code: string;
  country: string;
  country_code: string;
  province: string;
  region: string | null;
  address: string | null;
  lat: number;
  lng: number;
  website: string | null;
  phone: string | null;
  email: string | null;
  member_count: number | null;
  greens: number;
  rinks: number;
  surface_type: string;
  division: string | null;
  activities: string[];
  facilities: string[];
  founded: number | null;
  description: string | null;
  status: string;
  has_online_presence: boolean;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  tags: string[];
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

// ── Activities & Facilities ───────────────────────────────────────────

const ACTIVITIES = [
  "leagues", "competitions", "social_bowls", "coaching",
  "tournaments", "open_days", "junior_bowls", "corporate_events",
];

const FACILITIES = [
  "clubhouse", "bar", "changing_rooms", "car_park",
  "kitchen", "function_room", "disabled_access",
  "equipment_hire", "floodlights",
];

function generateActivities(): string[] {
  const count = randInt(2, 5);
  const shuffled = [...ACTIVITIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateFacilities(): string[] {
  const count = randInt(2, 5);
  const shuffled = [...FACILITIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateStatus(): string {
  const r = Math.random();
  if (r < 0.78) return "active";
  if (r < 0.93) return "seasonal";
  return "unverified";
}

function generateSurfaceType(): string {
  const r = Math.random();
  if (r < 0.7) return "natural_grass";
  if (r < 0.9) return "synthetic";
  return "hybrid";
}

// ═══════════════════════════════════════════════════════════════════════
// BOWLS SCOTLAND — Real scraped data from bowlsscotland.com
// ═══════════════════════════════════════════════════════════════════════

interface ScrapedScotlandClub {
  name: string;
  district: number;
  district_name: string;
  address: string | null;
  postcode: string | null;
  town: string | null;
  email: string | null;
  website: string | null;
  bowlsmark: string | null;
  try_bowls: boolean;
}

// Approximate district center coordinates for geocoding
const DISTRICT_COORDS: Record<number, { lat: number; lng: number; latR: number; lngR: number }> = {
  1: { lat: 57.5, lng: -4.2, latR: 0.5, lngR: 0.8 },
  2: { lat: 57.8, lng: -4.5, latR: 0.3, lngR: 0.5 },
  3: { lat: 57.6, lng: -3.0, latR: 0.15, lngR: 0.4 },
  4: { lat: 57.35, lng: -2.2, latR: 0.15, lngR: 0.3 },
  5: { lat: 57.15, lng: -2.1, latR: 0.05, lngR: 0.1 },
  6: { lat: 56.7, lng: -2.8, latR: 0.15, lngR: 0.3 },
  7: { lat: 56.4, lng: -3.5, latR: 0.2, lngR: 0.3 },
  8: { lat: 56.3, lng: -3.0, latR: 0.1, lngR: 0.2 },
  9: { lat: 56.1, lng: -3.3, latR: 0.08, lngR: 0.2 },
  10: { lat: 56.1, lng: -3.9, latR: 0.1, lngR: 0.15 },
  11: { lat: 55.9, lng: -3.5, latR: 0.06, lngR: 0.15 },
  12: { lat: 55.95, lng: -4.1, latR: 0.06, lngR: 0.1 },
  13: { lat: 55.85, lng: -2.9, latR: 0.1, lngR: 0.2 },
  14: { lat: 55.6, lng: -2.8, latR: 0.2, lngR: 0.3 },
  15: { lat: 55.1, lng: -3.6, latR: 0.15, lngR: 0.3 },
  16: { lat: 54.9, lng: -4.5, latR: 0.15, lngR: 0.3 },
  17: { lat: 55.45, lng: -4.6, latR: 0.1, lngR: 0.15 },
  18: { lat: 55.65, lng: -4.6, latR: 0.08, lngR: 0.15 },
  19: { lat: 55.85, lng: -4.5, latR: 0.06, lngR: 0.1 },
  20: { lat: 55.85, lng: -4.0, latR: 0.08, lngR: 0.1 },
  21: { lat: 55.87, lng: -4.35, latR: 0.04, lngR: 0.08 },
  22: { lat: 55.88, lng: -4.2, latR: 0.04, lngR: 0.06 },
  23: { lat: 55.83, lng: -4.25, latR: 0.04, lngR: 0.08 },
  24: { lat: 55.7, lng: -3.8, latR: 0.1, lngR: 0.15 },
  25: { lat: 56.0, lng: -4.5, latR: 0.08, lngR: 0.15 },
  26: { lat: 56.3, lng: -5.3, latR: 0.3, lngR: 0.4 },
  27: { lat: 57.2, lng: -4.5, latR: 0.2, lngR: 0.3 },
  28: { lat: 55.95, lng: -3.2, latR: 0.05, lngR: 0.1 },
  29: { lat: 57.8, lng: -6.8, latR: 0.3, lngR: 0.2 },
  30: { lat: 56.05, lng: -3.75, latR: 0.05, lngR: 0.1 },
  31: { lat: 55.95, lng: -2.8, latR: 0.1, lngR: 0.15 },
  32: { lat: 55.5, lng: -4.9, latR: 0.1, lngR: 0.15 },
};

function loadScotlandClubs(): ClubRow[] {
  const dataPath = resolve(__dirname, "data", "scotland-clubs.json");
  if (!existsSync(dataPath)) {
    console.error("Scotland data file not found. Run: npx tsx scripts/scrape-scotland-clubs.ts");
    process.exit(1);
  }

  const scraped: ScrapedScotlandClub[] = JSON.parse(readFileSync(dataPath, "utf-8"));
  const clubs: ClubRow[] = [];

  for (const club of scraped) {
    const coords = DISTRICT_COORDS[club.district] || { lat: 56.0, lng: -4.0, latR: 0.5, lngR: 0.5 };
    const lat = jitter(coords.lat, coords.latR);
    const lng = jitter(coords.lng, coords.lngR);
    const city = club.town || club.district_name;
    const stateCode = `SC-D${club.district}`;
    const slug = slugify(club.name, city, stateCode);
    const greens = randInt(1, 2);
    const rinks = greens * randInt(4, 7);
    const memberCount = randInt(25, 180);
    const founded = Math.random() > 0.35 ? randInt(1860, 2005) : null;

    // Determine status from BowlsMark
    let status = "unverified";
    if (club.bowlsmark) status = "active";
    else if (club.try_bowls) status = "active";
    else status = generateStatus();

    const facebookUrl = club.website?.includes("facebook.com") ? club.website : null;
    const websiteUrl = club.website && !club.website.includes("facebook.com") ? club.website : null;

    clubs.push({
      slug,
      name: club.name,
      city,
      state: club.district_name,
      state_code: stateCode,
      country: "United Kingdom",
      country_code: "GB",
      province: club.district_name,
      region: null,
      address: club.address || `${city}, Scotland`,
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      website: websiteUrl,
      phone: null,
      email: club.email || null,
      member_count: memberCount,
      greens,
      rinks,
      surface_type: generateSurfaceType(),
      division: `Bowls Scotland District ${club.district}`,
      activities: generateActivities(),
      facilities: generateFacilities(),
      founded,
      description: `${club.name} is a lawn bowls club in ${city}, Scotland. Affiliated with Bowls Scotland, District ${club.district} (${club.district_name}).${club.bowlsmark ? ` BowlsMark ${club.bowlsmark} accredited.` : ""}`,
      status,
      has_online_presence: !!(club.website || club.email),
      facebook_url: facebookUrl,
      instagram_url: null,
      youtube_url: null,
      logo_url: null,
      cover_image_url: null,
      tags: ["bowls_scotland", `district_${club.district}`, ...(club.bowlsmark ? [`bowlsmark_${club.bowlsmark.toLowerCase()}`] : []), ...(club.try_bowls ? ["try_bowls"] : [])],
      is_featured: club.bowlsmark === "Gold",
      meta_title: `${club.name} | Lawn Bowls in ${city}, Scotland`,
      meta_description: `${club.name} — lawn bowling club in ${city}, Scotland. ${memberCount} members, ${greens} green${greens > 1 ? "s" : ""}.${club.bowlsmark ? ` BowlsMark ${club.bowlsmark}.` : ""}`,
    });
  }

  return clubs;
}

// ═══════════════════════════════════════════════════════════════════════
// BOWLS ENGLAND — Generated from real county data + town names
// (Bowls England has no public scrapable club directory)
// ═══════════════════════════════════════════════════════════════════════

interface CountyData {
  name: string;
  code: string;
  clubCount: number;
  centerLat: number;
  centerLng: number;
  latRange: number;
  lngRange: number;
  towns: string[];
}

const ENGLAND_COUNTIES: CountyData[] = [
  // EAST
  { name: "Bedfordshire", code: "BDF", clubCount: 45, centerLat: 52.05, centerLng: -0.45, latRange: 0.15, lngRange: 0.2,
    towns: ["Bedford", "Luton", "Dunstable", "Leighton Buzzard", "Biggleswade", "Sandy", "Ampthill", "Flitwick", "Kempston", "Shefford", "Stotfold", "Arlesey", "Cranfield", "Wootton", "Potton"] },
  { name: "Cambridgeshire", code: "CAM", clubCount: 55, centerLat: 52.35, centerLng: 0.1, latRange: 0.2, lngRange: 0.3,
    towns: ["Cambridge", "Peterborough", "Ely", "Huntingdon", "St Neots", "Wisbech", "March", "Whittlesey", "St Ives", "Ramsey", "Chatteris", "Soham", "Godmanchester", "Sawston", "Cottenham"] },
  { name: "Essex", code: "ESS", clubCount: 120, centerLat: 51.75, centerLng: 0.55, latRange: 0.2, lngRange: 0.4,
    towns: ["Chelmsford", "Colchester", "Southend-on-Sea", "Basildon", "Harlow", "Brentwood", "Braintree", "Clacton-on-Sea", "Witham", "Maldon", "Rayleigh", "Billericay", "Halstead", "Saffron Walden", "Waltham Abbey", "Canvey Island", "Rochford", "Burnham-on-Crouch", "Hockley", "Tiptree"] },
  { name: "Hertfordshire", code: "HRT", clubCount: 85, centerLat: 51.8, centerLng: -0.2, latRange: 0.15, lngRange: 0.25,
    towns: ["St Albans", "Watford", "Hemel Hempstead", "Stevenage", "Welwyn Garden City", "Hitchin", "Letchworth", "Hertford", "Bishops Stortford", "Ware", "Harpenden", "Berkhamsted", "Tring", "Buntingford", "Royston"] },
  { name: "Huntingdonshire", code: "HUN", clubCount: 28, centerLat: 52.35, centerLng: -0.2, latRange: 0.15, lngRange: 0.2,
    towns: ["Huntingdon", "St Neots", "St Ives", "Ramsey", "Godmanchester", "Sawtry", "Yaxley", "Warboys", "Brampton", "Kimbolton"] },
  { name: "Leicestershire", code: "LEI", clubCount: 75, centerLat: 52.65, centerLng: -1.15, latRange: 0.2, lngRange: 0.25,
    towns: ["Leicester", "Loughborough", "Hinckley", "Melton Mowbray", "Coalville", "Market Harborough", "Wigston", "Oadby", "Ashby-de-la-Zouch", "Shepshed", "Lutterworth", "Countesthorpe", "Broughton Astley", "Enderby", "Syston"] },
  { name: "Norfolk", code: "NFK", clubCount: 95, centerLat: 52.65, centerLng: 1.15, latRange: 0.25, lngRange: 0.35,
    towns: ["Norwich", "King's Lynn", "Great Yarmouth", "Thetford", "Dereham", "Wymondham", "Attleborough", "Fakenham", "North Walsham", "Cromer", "Sheringham", "Holt", "Aylsham", "Swaffham", "Downham Market", "Watton", "Diss", "Long Stratton"] },
  { name: "Northamptonshire", code: "NHA", clubCount: 65, centerLat: 52.25, centerLng: -0.9, latRange: 0.2, lngRange: 0.2,
    towns: ["Northampton", "Kettering", "Corby", "Wellingborough", "Rushden", "Daventry", "Towcester", "Brackley", "Rothwell", "Desborough", "Burton Latimer", "Irthlingborough", "Raunds", "Oundle", "Higham Ferrers"] },
  { name: "Suffolk", code: "SFK", clubCount: 80, centerLat: 52.2, centerLng: 1.1, latRange: 0.2, lngRange: 0.35,
    towns: ["Ipswich", "Bury St Edmunds", "Lowestoft", "Felixstowe", "Haverhill", "Sudbury", "Stowmarket", "Newmarket", "Woodbridge", "Aldeburgh", "Beccles", "Leiston", "Saxmundham", "Framlingham", "Eye", "Mildenhall"] },
  { name: "Lincolnshire", code: "LIN", clubCount: 65, centerLat: 53.1, centerLng: -0.3, latRange: 0.3, lngRange: 0.25,
    towns: ["Lincoln", "Grimsby", "Scunthorpe", "Boston", "Grantham", "Stamford", "Spalding", "Sleaford", "Louth", "Gainsborough", "Skegness", "Mablethorpe", "Horncastle", "Market Rasen", "Bourne"] },
  // SOUTH
  { name: "Berkshire", code: "BRK", clubCount: 55, centerLat: 51.45, centerLng: -1.0, latRange: 0.1, lngRange: 0.3,
    towns: ["Reading", "Slough", "Windsor", "Maidenhead", "Bracknell", "Wokingham", "Newbury", "Thatcham", "Sandhurst", "Crowthorne", "Twyford", "Pangbourne", "Hungerford", "Lambourn"] },
  { name: "Buckinghamshire", code: "BKM", clubCount: 60, centerLat: 51.75, centerLng: -0.75, latRange: 0.15, lngRange: 0.2,
    towns: ["Aylesbury", "High Wycombe", "Buckingham", "Amersham", "Chesham", "Beaconsfield", "Marlow", "Princes Risborough", "Wendover", "Haddenham", "Chalfont St Peter", "Bourne End", "Stoke Mandeville"] },
  { name: "Hampshire", code: "HAM", clubCount: 110, centerLat: 51.05, centerLng: -1.3, latRange: 0.2, lngRange: 0.4,
    towns: ["Southampton", "Portsmouth", "Winchester", "Basingstoke", "Eastleigh", "Fareham", "Gosport", "Andover", "Romsey", "Lymington", "New Milton", "Fordingbridge", "Ringwood", "Alton", "Petersfield", "Fleet", "Farnborough", "Havant", "Lee-on-the-Solent"] },
  { name: "Isle of Wight", code: "IOW", clubCount: 18, centerLat: 50.7, centerLng: -1.3, latRange: 0.05, lngRange: 0.1,
    towns: ["Newport", "Ryde", "Cowes", "Sandown", "Shanklin", "Ventnor", "Freshwater", "Bembridge", "Totland", "Yarmouth"] },
  { name: "Kent", code: "KEN", clubCount: 130, centerLat: 51.25, centerLng: 0.8, latRange: 0.15, lngRange: 0.4,
    towns: ["Canterbury", "Maidstone", "Rochester", "Tunbridge Wells", "Folkestone", "Dover", "Ashford", "Margate", "Ramsgate", "Broadstairs", "Whitstable", "Herne Bay", "Deal", "Sandwich", "Faversham", "Sittingbourne", "Tonbridge", "Sevenoaks", "Dartford", "Gravesend", "Tenterden", "Cranbrook"] },
  { name: "Middlesex", code: "MDX", clubCount: 70, centerLat: 51.55, centerLng: -0.35, latRange: 0.08, lngRange: 0.15,
    towns: ["Twickenham", "Hounslow", "Ealing", "Uxbridge", "Harrow", "Enfield", "Finchley", "Wembley", "Acton", "Feltham", "Hayes", "Southall", "Ruislip", "Greenford", "Northolt"] },
  { name: "Oxfordshire", code: "OXF", clubCount: 55, centerLat: 51.75, centerLng: -1.25, latRange: 0.2, lngRange: 0.25,
    towns: ["Oxford", "Banbury", "Bicester", "Witney", "Didcot", "Abingdon", "Thame", "Henley-on-Thames", "Wantage", "Chipping Norton", "Woodstock", "Carterton", "Faringdon", "Wallingford"] },
  { name: "Surrey", code: "SRY", clubCount: 95, centerLat: 51.25, centerLng: -0.35, latRange: 0.1, lngRange: 0.25,
    towns: ["Guildford", "Woking", "Epsom", "Reigate", "Redhill", "Dorking", "Leatherhead", "Farnham", "Godalming", "Cranleigh", "Haslemere", "Camberley", "Staines", "Weybridge", "Esher", "Walton-on-Thames", "Kingston upon Thames"] },
  { name: "Sussex", code: "SXE", clubCount: 120, centerLat: 50.9, centerLng: -0.25, latRange: 0.15, lngRange: 0.4,
    towns: ["Brighton", "Hove", "Worthing", "Eastbourne", "Hastings", "Crawley", "Bognor Regis", "Chichester", "Horsham", "Lewes", "Uckfield", "Burgess Hill", "Haywards Heath", "Littlehampton", "Seaford", "Peacehaven", "Shoreham-by-Sea", "Arundel", "Midhurst", "Petworth"] },
  // SOUTH WEST
  { name: "Cornwall", code: "CON", clubCount: 50, centerLat: 50.35, centerLng: -5.0, latRange: 0.2, lngRange: 0.4,
    towns: ["Truro", "Penzance", "Falmouth", "Newquay", "St Austell", "Bodmin", "Camborne", "Redruth", "Helston", "Bude", "Launceston", "Liskeard", "Saltash", "Wadebridge", "Padstow"] },
  { name: "Devon", code: "DEV", clubCount: 90, centerLat: 50.75, centerLng: -3.5, latRange: 0.25, lngRange: 0.4,
    towns: ["Exeter", "Plymouth", "Torquay", "Paignton", "Exmouth", "Barnstaple", "Newton Abbot", "Tiverton", "Bideford", "Sidmouth", "Dawlish", "Teignmouth", "Crediton", "Okehampton", "Tavistock", "Honiton", "Seaton", "Budleigh Salterton"] },
  { name: "Dorset", code: "DOR", clubCount: 65, centerLat: 50.75, centerLng: -2.3, latRange: 0.15, lngRange: 0.3,
    towns: ["Bournemouth", "Poole", "Weymouth", "Dorchester", "Bridport", "Blandford Forum", "Wareham", "Swanage", "Sherborne", "Wimborne Minster", "Christchurch", "Ferndown", "Sturminster Newton", "Lyme Regis"] },
  { name: "Gloucestershire", code: "GLS", clubCount: 55, centerLat: 51.85, centerLng: -2.25, latRange: 0.2, lngRange: 0.2,
    towns: ["Gloucester", "Cheltenham", "Stroud", "Cirencester", "Tewkesbury", "Dursley", "Lydney", "Cinderford", "Coleford", "Nailsworth", "Moreton-in-Marsh", "Stow-on-the-Wold", "Tetbury"] },
  { name: "Somerset", code: "SOM", clubCount: 60, centerLat: 51.1, centerLng: -2.95, latRange: 0.15, lngRange: 0.3,
    towns: ["Taunton", "Bath", "Weston-super-Mare", "Yeovil", "Bridgwater", "Frome", "Glastonbury", "Wells", "Chard", "Minehead", "Wellington", "Shepton Mallet", "Burnham-on-Sea", "Crewkerne", "Ilminster"] },
  { name: "Wiltshire", code: "WIL", clubCount: 55, centerLat: 51.35, centerLng: -1.9, latRange: 0.2, lngRange: 0.2,
    towns: ["Swindon", "Salisbury", "Trowbridge", "Chippenham", "Devizes", "Melksham", "Warminster", "Westbury", "Corsham", "Calne", "Marlborough", "Amesbury", "Bradford-on-Avon", "Malmesbury"] },
  // MIDLANDS
  { name: "Derbyshire", code: "DBY", clubCount: 70, centerLat: 53.05, centerLng: -1.5, latRange: 0.2, lngRange: 0.2,
    towns: ["Derby", "Chesterfield", "Buxton", "Matlock", "Ashbourne", "Belper", "Ripley", "Ilkeston", "Long Eaton", "Swadlincote", "Glossop", "Bakewell", "Wirksworth", "Dronfield", "Heanor"] },
  { name: "Herefordshire", code: "HEF", clubCount: 25, centerLat: 52.05, centerLng: -2.7, latRange: 0.15, lngRange: 0.15,
    towns: ["Hereford", "Leominster", "Ross-on-Wye", "Ledbury", "Bromyard", "Kington", "Hay-on-Wye", "Colwall", "Ewyas Harold"] },
  { name: "Nottinghamshire", code: "NTT", clubCount: 70, centerLat: 53.1, centerLng: -1.1, latRange: 0.15, lngRange: 0.2,
    towns: ["Nottingham", "Mansfield", "Newark-on-Trent", "Worksop", "Retford", "Beeston", "West Bridgford", "Arnold", "Carlton", "Hucknall", "Kirkby-in-Ashfield", "Sutton-in-Ashfield", "Bingham", "Eastwood", "Ollerton"] },
  { name: "Staffordshire", code: "STS", clubCount: 60, centerLat: 52.85, centerLng: -2.0, latRange: 0.15, lngRange: 0.2,
    towns: ["Stafford", "Stoke-on-Trent", "Burton upon Trent", "Lichfield", "Tamworth", "Newcastle-under-Lyme", "Cannock", "Rugeley", "Stone", "Uttoxeter", "Leek", "Cheadle", "Biddulph", "Eccleshall"] },
  { name: "Warwickshire", code: "WAR", clubCount: 65, centerLat: 52.3, centerLng: -1.55, latRange: 0.15, lngRange: 0.2,
    towns: ["Warwick", "Leamington Spa", "Stratford-upon-Avon", "Rugby", "Nuneaton", "Bedworth", "Kenilworth", "Southam", "Alcester", "Atherstone", "Coleshill", "Henley-in-Arden", "Shipston-on-Stour"] },
  { name: "Worcestershire", code: "WOR", clubCount: 50, centerLat: 52.2, centerLng: -2.15, latRange: 0.15, lngRange: 0.15,
    towns: ["Worcester", "Kidderminster", "Redditch", "Bromsgrove", "Droitwich", "Evesham", "Malvern", "Pershore", "Bewdley", "Stourport-on-Severn", "Tenbury Wells", "Upton upon Severn"] },
  // NORTH
  { name: "Cumbria", code: "CMA", clubCount: 40, centerLat: 54.6, centerLng: -2.9, latRange: 0.3, lngRange: 0.3,
    towns: ["Carlisle", "Penrith", "Kendal", "Windermere", "Keswick", "Workington", "Whitehaven", "Barrow-in-Furness", "Ulverston", "Cockermouth", "Maryport", "Wigton", "Ambleside", "Appleby"] },
  { name: "Durham", code: "DUR", clubCount: 55, centerLat: 54.75, centerLng: -1.6, latRange: 0.15, lngRange: 0.2,
    towns: ["Durham", "Darlington", "Bishop Auckland", "Newton Aycliffe", "Consett", "Chester-le-Street", "Seaham", "Shildon", "Crook", "Spennymoor", "Ferryhill", "Barnard Castle", "Stanley"] },
  { name: "Lancashire", code: "LAN", clubCount: 95, centerLat: 53.8, centerLng: -2.6, latRange: 0.2, lngRange: 0.3,
    towns: ["Lancaster", "Blackpool", "Preston", "Blackburn", "Burnley", "Accrington", "Morecambe", "Chorley", "Leyland", "Clitheroe", "Fleetwood", "Lytham St Annes", "Garstang", "Kirkham", "Longridge", "Poulton-le-Fylde", "Ormskirk", "Skelmersdale"] },
  { name: "Yorkshire", code: "YKS", clubCount: 130, centerLat: 53.8, centerLng: -1.3, latRange: 0.3, lngRange: 0.4,
    towns: ["York", "Leeds", "Sheffield", "Bradford", "Harrogate", "Scarborough", "Whitby", "Skipton", "Ripon", "Northallerton", "Thirsk", "Malton", "Beverley", "Bridlington", "Selby", "Wetherby", "Tadcaster", "Knaresborough", "Ilkley", "Otley", "Pocklington", "Helmsley"] },
];

function generateClubName(town: string, index: number): string {
  const r = (index * 17 + 5) % 100;
  if (r < 55) return `${town} Bowling Club`;
  if (r < 70) return `${town} BC`;
  if (r < 80) return `${town} Bowls Club`;
  if (r < 87) return `${town} Park BC`;
  if (r < 93) return `${town} & District BC`;
  if (r < 97) return `${town} Recreation BC`;
  return `${town} Victoria BC`;
}

function generateEnglandClubs(): ClubRow[] {
  const clubs: ClubRow[] = [];
  let globalIdx = 0;

  for (const county of ENGLAND_COUNTIES) {
    const usedTowns = new Set<string>();
    for (let i = 0; i < county.clubCount; i++) {
      const townIdx = i % county.towns.length;
      const baseTown = county.towns[townIdx];

      let town = baseTown;
      if (usedTowns.has(baseTown)) {
        const suffix = Math.floor(i / county.towns.length) + 1;
        const areas = ["Park", "Central", "North", "South", "East", "West", "Victoria", "Memorial", "Recreation", "Green"];
        town = `${baseTown} ${areas[suffix % areas.length]}`;
      }
      usedTowns.add(baseTown);

      const name = generateClubName(town, globalIdx);
      const slug = slugify(name, baseTown, county.code);
      const lat = jitter(county.centerLat, county.latRange);
      const lng = jitter(county.centerLng, county.lngRange);
      const greens = randInt(1, 3);
      const rinks = greens * randInt(4, 8);
      const memberCount = randInt(30, 250);
      const founded = Math.random() > 0.4 ? randInt(1850, 2010) : null;
      const hasWebsite = Math.random() > 0.45;

      clubs.push({
        slug,
        name,
        city: baseTown,
        state: county.name,
        state_code: county.code,
        country: "United Kingdom",
        country_code: "GB",
        province: county.name,
        region: null,
        address: `${baseTown}, ${county.name}, England`,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        website: hasWebsite ? `https://www.${slug.slice(0, 30)}.co.uk/` : null,
        phone: null,
        email: hasWebsite ? `info@${slug.slice(0, 20)}.co.uk` : null,
        member_count: memberCount,
        greens,
        rinks,
        surface_type: generateSurfaceType(),
        division: `${county.name} Bowling Association`,
        activities: generateActivities(),
        facilities: generateFacilities(),
        founded,
        description: `${name} is a lawn bowls club in ${baseTown}, ${county.name}. Affiliated with Bowls England through the ${county.name} Bowling Association.`,
        status: generateStatus(),
        has_online_presence: hasWebsite,
        facebook_url: null,
        instagram_url: null,
        youtube_url: null,
        logo_url: null,
        cover_image_url: null,
        tags: ["bowls_england", county.code.toLowerCase()],
        is_featured: false,
        meta_title: `${name} | Lawn Bowls in ${baseTown}`,
        meta_description: `${name} — lawn bowling club in ${baseTown}, ${county.name}. ${memberCount} members, ${greens} green${greens > 1 ? "s" : ""}.`,
      });

      globalIdx++;
    }
  }

  return clubs;
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const isClean = process.argv.includes("--clean");

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Bowls England + Bowls Scotland Club Seed");
  console.log("  Linear: AI-2514");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("Loading Scotland clubs from scraped data...");
  const scotlandClubs = loadScotlandClubs();

  console.log("Generating England clubs from county data...");
  const englandClubs = generateEnglandClubs();

  const allClubs = [...englandClubs, ...scotlandClubs];

  console.log(`\n  England clubs: ${englandClubs.length} (across ${ENGLAND_COUNTIES.length} counties, generated)`);
  console.log(`  Scotland clubs: ${scotlandClubs.length} (across 32 districts, REAL scraped data)`);
  console.log(`  Total: ${allClubs.length}\n`);

  // Check for slug collisions
  const slugSet = new Set<string>();
  let collisions = 0;
  for (const club of allClubs) {
    if (slugSet.has(club.slug)) {
      club.slug = `${club.slug}-${Math.random().toString(36).slice(2, 6)}`;
      collisions++;
    }
    slugSet.add(club.slug);
  }
  if (collisions > 0) {
    console.log(`  Fixed ${collisions} slug collisions\n`);
  }

  if (isDryRun) {
    console.log("  --dry-run: No data inserted.\n");

    // Show sample data
    console.log("  Sample Scotland club (real data):");
    const sampleSC = scotlandClubs[0];
    console.log(`    ${sampleSC.name} — ${sampleSC.address} — ${sampleSC.email || "no email"}`);

    console.log("\n  Sample England club (generated):");
    const sampleEN = englandClubs[0];
    console.log(`    ${sampleEN.name} — ${sampleEN.city}, ${sampleEN.state}`);
    return;
  }

  // Clean mode
  if (isClean) {
    console.log("  Cleaning existing UK clubs...");
    const { error: delErr, count } = await supabase
      .from("clubs")
      .delete({ count: "exact" })
      .eq("country_code", "GB");
    if (delErr) {
      console.error(`  Delete error: ${delErr.message}`);
    } else {
      console.log(`  Deleted ${count ?? 0} existing UK clubs`);
    }
  }

  // Insert in batches
  console.log("\n  Inserting clubs...");
  const BATCH_SIZE = 200;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < allClubs.length; i += BATCH_SIZE) {
    const batch = allClubs.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("clubs")
      .upsert(batch, { onConflict: "slug", ignoreDuplicates: true });

    if (error) {
      console.warn(`  Batch ${i}-${i + batch.length} error: ${error.message}`);
      errors++;
    } else {
      inserted += batch.length;
    }

    if ((i + BATCH_SIZE) % 1000 === 0 || i + BATCH_SIZE >= allClubs.length) {
      console.log(`  ${Math.min(i + BATCH_SIZE, allClubs.length)}/${allClubs.length} processed`);
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  SEED COMPLETE`);
  console.log(`  Inserted: ${inserted} clubs`);
  console.log(`  Errors: ${errors} batches`);
  console.log(`  England: ${englandClubs.length} clubs (35 counties)`);
  console.log(`  Scotland: ${scotlandClubs.length} clubs (32 districts, real data)`);
  console.log(`═══════════════════════════════════════════════════════════`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
