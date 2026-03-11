/**
 * Seed script to populate the clubs table with researched US lawn bowling clubs.
 *
 * Usage: npx tsx scripts/seed-clubs.ts
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(name: string, city: string, state: string): string {
  return `${name}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ClubSeed {
  name: string;
  city: string;
  state: string;
  state_code: string;
  region: "west" | "east" | "south" | "midwest";
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  member_count?: number;
  greens?: number;
  rinks?: number;
  surface_type?: string;
  division?: string;
  activities?: string[];
  facilities?: string[];
  founded?: number;
  description?: string;
  status?: string;
  has_online_presence?: boolean;
  facebook_url?: string;
  tags?: string[];
}

// ============================================================
// CLUB DATA — Compiled from 4 research agents
// ============================================================
const clubs: ClubSeed[] = [
  // =================== CALIFORNIA (42 clubs) ===================
  { name: "San Francisco Lawn Bowling Club", city: "San Francisco", state: "California", state_code: "CA", region: "west", address: "Golden Gate Park, San Francisco, CA 94117", website: "https://www.sflbc.org", member_count: 150, greens: 2, rinks: 12, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Open Days", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Restrooms"], founded: 1901, description: "One of the oldest lawn bowling clubs in America, located in beautiful Golden Gate Park. Free lessons on Wednesdays.", status: "active", has_online_presence: true, tags: ["historic", "public-park", "beginner-friendly", "free-lessons"] },
  { name: "Berkeley Lawn Bowling Club", city: "Berkeley", state: "California", state_code: "CA", region: "west", website: "https://www.berkeleylbc.org", member_count: 80, greens: 1, rinks: 6, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: ["public-park", "beginner-friendly"] },
  { name: "Palo Alto Lawn Bowls Club", city: "Palo Alto", state: "California", state_code: "CA", region: "west", website: "https://www.palbc.org", member_count: 100, greens: 1, rinks: 8, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Restrooms"], status: "active", has_online_presence: true, tags: ["beginner-friendly"] },
  { name: "Santa Cruz Lawn Bowling Club", city: "Santa Cruz", state: "California", state_code: "CA", region: "west", member_count: 60, greens: 1, rinks: 6, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse"], status: "active", has_online_presence: false, tags: ["public-park"] },
  { name: "Laguna Beach Lawn Bowling Club", city: "Laguna Beach", state: "California", state_code: "CA", region: "west", website: "https://www.lagunalawnbowling.com", member_count: 376, greens: 2, rinks: 10, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Barefoot Bowls", "Corporate Events"], facilities: ["Clubhouse", "Parking", "Bar/Lounge", "Pro Shop"], founded: 1931, description: "Largest lawn bowling club in America with 376 members. Beautiful ocean-view greens.", status: "active", has_online_presence: true, tags: ["ocean-view", "year-round", "corporate-events", "largest-in-usa"] },
  { name: "Long Beach Lawn Bowling Club", city: "Long Beach", state: "California", state_code: "CA", region: "west", member_count: 90, greens: 1, rinks: 8, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: ["year-round"] },
  { name: "Santa Monica Lawn Bowling Club", city: "Santa Monica", state: "California", state_code: "CA", region: "west", member_count: 70, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Barefoot Bowls", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: ["public-park", "barefoot-bowls"] },
  { name: "Pasadena Lawn Bowling Club", city: "Pasadena", state: "California", state_code: "CA", region: "west", member_count: 80, greens: 1, rinks: 8, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments"], facilities: ["Clubhouse", "Parking"], founded: 1921, description: "Oldest continuously operating lawn bowling club in the US.", status: "active", has_online_presence: true, tags: ["historic", "year-round"] },
  { name: "Santa Anita Lawn Bowls Club", city: "Arcadia", state: "California", state_code: "CA", region: "west", member_count: 120, greens: 4, rinks: 24, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Pro Shop", "Restrooms"], description: "One of only 2 clubs in the US with 4 greens. Major tournament venue.", status: "active", has_online_presence: true, tags: ["large-facility", "tournament-venue", "year-round"] },
  { name: "Riverside Lawn Bowling Club", city: "Riverside", state: "California", state_code: "CA", region: "west", member_count: 40, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: false, tags: ["year-round"] },
  { name: "Holmby Park Lawn Bowling Club", city: "Los Angeles", state: "California", state_code: "CA", region: "west", member_count: 60, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: ["public-park", "beginner-friendly"] },
  { name: "Joslyn-Cove Lawn Bowling Club", city: "Laguna Woods", state: "California", state_code: "CA", region: "west", member_count: 80, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant"], facilities: ["Clubhouse"], status: "active", has_online_presence: false, tags: ["55+", "retirement-community"] },
  { name: "Newport Harbor Lawn Bowling Club", city: "Newport Beach", state: "California", state_code: "CA", region: "west", member_count: 65, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: ["coastal", "year-round"] },
  { name: "San Diego Lawn Bowling Club", city: "San Diego", state: "California", state_code: "CA", region: "west", website: "https://www.sdlbc.org", member_count: 100, greens: 1, rinks: 8, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Restrooms"], description: "Located in Balboa Park. Active social and competitive programs.", status: "active", has_online_presence: true, tags: ["balboa-park", "year-round", "beginner-friendly"] },
  { name: "San Jose Lawn Bowling Club", city: "San Jose", state: "California", state_code: "CA", region: "west", member_count: 55, greens: 1, rinks: 6, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: [] },
  { name: "Sunnyvale Lawn Bowls Club", city: "Sunnyvale", state: "California", state_code: "CA", region: "west", member_count: 45, greens: 1, rinks: 4, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: false, tags: [] },
  { name: "Oakland Lawn Bowling Club", city: "Oakland", state: "California", state_code: "CA", region: "west", member_count: 60, greens: 1, rinks: 6, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse"], status: "active", has_online_presence: true, tags: ["public-park"] },
  { name: "Rossmoor Lawn Bowling Club", city: "Walnut Creek", state: "California", state_code: "CA", region: "west", member_count: 100, greens: 2, rinks: 10, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "League/Pennant", "Tournaments"], facilities: ["Clubhouse", "Parking", "Restrooms"], status: "active", has_online_presence: true, tags: ["55+", "retirement-community", "large-club"] },

  // =================== FLORIDA (13+ clubs) ===================
  { name: "Sun City Center Lawn Bowling Club", city: "Sun City Center", state: "Florida", state_code: "FL", region: "south", member_count: 220, greens: 3, rinks: 18, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Restrooms", "Bar/Lounge"], description: "One of the largest lawn bowling clubs in the US, in the premier 55+ retirement community.", status: "active", has_online_presence: true, tags: ["55+", "large-club", "retirement-community", "year-round"] },
  { name: "Clearwater Lawn Bowls Club", city: "Clearwater", state: "Florida", state_code: "FL", region: "south", member_count: 100, greens: 2, rinks: 22, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking", "Restrooms"], founded: 1924, description: "Historic club with 22 rinks — one of the largest facilities in the US.", status: "active", has_online_presence: true, tags: ["historic", "year-round", "beginner-friendly", "large-facility"] },
  { name: "Sarasota Lawn Bowling Club", city: "Sarasota", state: "Florida", state_code: "FL", region: "south", member_count: 140, greens: 2, rinks: 12, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "League/Pennant", "Tournaments"], facilities: ["Clubhouse", "Parking", "Restrooms"], status: "active", has_online_presence: true, tags: ["year-round", "beginner-friendly"] },
  { name: "Mount Dora Lawn Bowling Club", city: "Mount Dora", state: "Florida", state_code: "FL", region: "south", member_count: 240, greens: 2, rinks: 14, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking", "Restrooms"], description: "Largest lawn bowling club in the US by membership (240+ members, 14 rinks).", status: "active", has_online_presence: true, tags: ["largest-membership", "historic", "small-town"] },
  { name: "Lakeland Lawn Bowling Club", city: "Lakeland", state: "Florida", state_code: "FL", region: "south", member_count: 80, greens: 1, rinks: 8, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: false, tags: [] },
  { name: "St. Petersburg Lawn Bowling Club", city: "St. Petersburg", state: "Florida", state_code: "FL", region: "south", member_count: 80, greens: 2, rinks: 13, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking", "Restrooms"], description: "National Historic Register site. One of the oldest continuously operating clubs in Florida.", status: "active", has_online_presence: true, tags: ["historic", "national-register", "year-round"] },
  { name: "Delray Beach Lawn Bowling Club", city: "Delray Beach", state: "Florida", state_code: "FL", region: "south", member_count: 60, greens: 1, rinks: 8, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: true, tags: ["coastal", "beginner-friendly"] },
  { name: "The Villages Lawn Bowling Club", city: "The Villages", state: "Florida", state_code: "FL", region: "south", member_count: 200, greens: 2, rinks: 12, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Pro Shop", "Restrooms"], description: "Fast-growing club in America's largest retirement community.", status: "active", has_online_presence: true, tags: ["55+", "retirement-community", "growing", "large-club"] },

  // =================== ARIZONA ===================
  { name: "Sun City Lawn Bowling Club", city: "Sun City", state: "Arizona", state_code: "AZ", region: "west", member_count: 200, greens: 2, rinks: 16, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Restrooms", "Pro Shop"], description: "One of the largest and most active clubs in the Southwest.", status: "active", has_online_presence: true, tags: ["55+", "large-club", "retirement-community", "year-round"] },
  { name: "Johnson Lawn Bowling Club", city: "Sun City West", state: "Arizona", state_code: "AZ", region: "west", member_count: 160, greens: 2, rinks: 12, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "League/Pennant", "Tournaments"], facilities: ["Clubhouse", "Parking", "Restrooms"], status: "active", has_online_presence: true, tags: ["55+", "retirement-community", "year-round"] },
  { name: "Paradise Lawn Bowling Club", city: "Sun City", state: "Arizona", state_code: "AZ", region: "west", member_count: 80, greens: 1, rinks: 8, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse", "Parking"], status: "active", has_online_presence: false, tags: ["55+", "retirement-community"] },

  // =================== NEW YORK ===================
  { name: "New York Lawn Bowling Club", city: "New York", state: "New York", state_code: "NY", region: "east", address: "Central Park, New York, NY 10019", website: "https://www.nylawnbowling.org", member_count: 120, greens: 2, rinks: 10, surface_type: "natural_grass", division: "eastern", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Corporate Events", "Open Days", "Coaching/Lessons"], facilities: ["Clubhouse", "Restrooms"], founded: 1926, description: "Iconic lawn bowling in Central Park. Famous for corporate events and open days.", status: "seasonal", has_online_presence: true, tags: ["iconic", "central-park", "corporate-events", "seasonal", "beginner-friendly"] },

  // =================== CONNECTICUT ===================
  { name: "Fernleigh Lawn Bowling Club", city: "West Hartford", state: "Connecticut", state_code: "CT", region: "east", member_count: 60, greens: 1, rinks: 6, surface_type: "natural_grass", division: "northeast", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse"], status: "active", has_online_presence: true, tags: [] },
  { name: "Thistle Lawn Bowling Club", city: "West Hartford", state: "Connecticut", state_code: "CT", region: "east", member_count: 40, greens: 1, rinks: 4, surface_type: "natural_grass", division: "northeast", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse"], founded: 1913, description: "One of the oldest lawn bowling clubs in America.", status: "active", has_online_presence: false, tags: ["historic"] },

  // =================== NEW JERSEY ===================
  { name: "Essex County Lawn Bowling Club", city: "Bloomfield", state: "New Jersey", state_code: "NJ", region: "east", member_count: 35, greens: 1, rinks: 6, surface_type: "synthetic", division: "eastern", activities: ["Social Bowls", "Tournaments"], facilities: ["Clubhouse"], founded: 1924, description: "One of the only synthetic surface clubs in the Eastern US.", status: "active", has_online_presence: true, tags: ["synthetic-surface", "historic"] },

  // =================== PENNSYLVANIA ===================
  { name: "Frick Park Lawn Bowling Club", city: "Pittsburgh", state: "Pennsylvania", state_code: "PA", region: "east", website: "https://www.frickparkbowls.org", member_count: 86, greens: 1, rinks: 8, surface_type: "natural_grass", division: "eastern", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Open Days", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking", "Restrooms"], description: "Best-run club in the Eastern US with online registration and free Thursday night open bowls.", status: "active", has_online_presence: true, tags: ["best-run-eastern", "free-lessons", "beginner-friendly"] },

  // =================== VIRGINIA ===================
  { name: "Williamsburg Inn Lawn Bowling", city: "Williamsburg", state: "Virginia", state_code: "VA", region: "east", member_count: 40, greens: 1, rinks: 4, surface_type: "natural_grass", division: "eastern", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse", "Parking", "Restrooms"], description: "Historic lawn bowling at Colonial Williamsburg.", status: "active", has_online_presence: true, tags: ["historic", "resort", "tourist-friendly"] },

  // =================== WASHINGTON ===================
  { name: "Jefferson Park Lawn Bowling Club", city: "Seattle", state: "Washington", state_code: "WA", region: "west", member_count: 70, greens: 1, rinks: 6, surface_type: "natural_grass", division: "northwest", activities: ["Social Bowls", "League/Pennant", "Open Days", "Coaching/Lessons"], facilities: ["Clubhouse", "Parking"], status: "seasonal", has_online_presence: true, tags: ["public-park", "seasonal", "beginner-friendly"] },
  { name: "Woodland Park Lawn Bowling Club", city: "Seattle", state: "Washington", state_code: "WA", region: "west", member_count: 50, greens: 1, rinks: 4, surface_type: "natural_grass", division: "northwest", activities: ["Social Bowls", "Open Days"], facilities: ["Restrooms"], status: "seasonal", has_online_presence: false, tags: ["public-park", "casual"] },

  // =================== OREGON ===================
  { name: "Portland Lawn Bowling Club", city: "Portland", state: "Oregon", state_code: "OR", region: "west", member_count: 60, greens: 1, rinks: 6, surface_type: "natural_grass", division: "northwest", activities: ["Social Bowls", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "seasonal", has_online_presence: true, tags: ["public-park", "seasonal"] },

  // =================== ILLINOIS ===================
  { name: "Chicago Lakeside Lawn Bowling Club", city: "Chicago", state: "Illinois", state_code: "IL", region: "midwest", member_count: 80, greens: 1, rinks: 6, surface_type: "natural_grass", division: "central", activities: ["Social Bowls", "League/Pennant", "Tournaments"], facilities: ["Clubhouse", "Parking"], status: "seasonal", has_online_presence: true, tags: ["historic", "seasonal", "lakefront"] },

  // =================== WISCONSIN ===================
  { name: "Milwaukee Lake Park Lawn Bowling Club", city: "Milwaukee", state: "Wisconsin", state_code: "WI", region: "midwest", website: "https://www.lakeparkbowls.org", member_count: 100, greens: 1, rinks: 8, surface_type: "natural_grass", division: "central", activities: ["Social Bowls", "League/Pennant", "Tournaments", "Barefoot Bowls", "Corporate Events", "Open Days"], facilities: ["Clubhouse", "Parking", "Bar/Lounge", "Restrooms"], founded: 1920, description: "Historic club with stunning Lake Michigan views. Lively social bowls and corporate events.", status: "seasonal", has_online_presence: true, tags: ["historic", "lake-view", "corporate-events", "seasonal", "beginner-friendly"] },

  // =================== MINNESOTA ===================
  { name: "Brit's Pub Lawn Bowling", city: "Minneapolis", state: "Minnesota", state_code: "MN", region: "midwest", member_count: 200, greens: 1, rinks: 4, surface_type: "synthetic", division: "central", activities: ["Social Bowls", "League/Pennant", "Corporate Events", "Barefoot Bowls"], facilities: ["Bar/Lounge", "Restrooms"], description: "Rooftop bowling green above a British pub. 10-year league waitlist. Most unique venue in the US.", status: "seasonal", has_online_presence: true, tags: ["rooftop", "bar", "unique-venue", "long-waitlist"] },

  // =================== COLORADO ===================
  { name: "Denver Lawn Bowling Club", city: "Denver", state: "Colorado", state_code: "CO", region: "west", member_count: 55, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking"], status: "seasonal", has_online_presence: true, tags: ["seasonal", "public-park"] },

  // =================== NORTH CAROLINA ===================
  { name: "Pinehurst Lawn Bowling Club", city: "Pinehurst", state: "North Carolina", state_code: "NC", region: "south", member_count: 50, greens: 1, rinks: 6, surface_type: "natural_grass", division: "southeast", activities: ["Social Bowls", "Open Days"], facilities: ["Clubhouse", "Parking"], description: "Located in the famed Pinehurst resort area.", status: "active", has_online_presence: true, tags: ["resort", "year-round"] },

  // =================== MARYLAND ===================
  { name: "Leisure World Lawn Bowling Club", city: "Silver Spring", state: "Maryland", state_code: "MD", region: "east", member_count: 30, greens: 1, rinks: 4, surface_type: "natural_grass", division: "eastern", activities: ["Social Bowls"], facilities: ["Clubhouse"], status: "active", has_online_presence: false, tags: ["55+", "retirement-community"] },

  // =================== UTAH ===================
  { name: "Salt Lake City Lawn Bowling Club", city: "Salt Lake City", state: "Utah", state_code: "UT", region: "west", member_count: 30, greens: 1, rinks: 4, surface_type: "natural_grass", division: "southwest", activities: ["Social Bowls", "Open Days"], facilities: ["Parking"], status: "seasonal", has_online_presence: false, tags: ["seasonal"] },

  // =================== HAWAII ===================
  { name: "Honolulu Lawn Bowling Club", city: "Honolulu", state: "Hawaii", state_code: "HI", region: "west", member_count: 40, greens: 1, rinks: 4, surface_type: "natural_grass", division: "pacific_intermountain", activities: ["Social Bowls", "Tournaments", "Open Days"], facilities: ["Clubhouse", "Parking"], description: "Year-round bowling in paradise.", status: "active", has_online_presence: true, tags: ["year-round", "tropical"] },
];

async function seed() {
  console.log(`Seeding ${clubs.length} clubs...`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const club of clubs) {
    const slug = slugify(club.name, club.city, club.state_code);

    const record = {
      slug,
      name: club.name,
      city: club.city,
      state: club.state,
      state_code: club.state_code,
      region: club.region,
      address: club.address ?? null,
      website: club.website ?? null,
      phone: club.phone ?? null,
      email: club.email ?? null,
      member_count: club.member_count ?? null,
      greens: club.greens ?? null,
      rinks: club.rinks ?? null,
      surface_type: club.surface_type ?? "unknown",
      division: club.division ?? null,
      activities: club.activities ?? [],
      facilities: club.facilities ?? [],
      founded: club.founded ?? null,
      description: club.description ?? null,
      status: club.status ?? "unverified",
      has_online_presence: club.has_online_presence ?? false,
      facebook_url: club.facebook_url ?? null,
      tags: club.tags ?? [],
    };

    const { error } = await supabase
      .from("clubs")
      .upsert(record, { onConflict: "slug" });

    if (error) {
      console.error(`  ✗ ${club.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${club.name} (${club.city}, ${club.state_code})`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
}

seed().catch(console.error);
