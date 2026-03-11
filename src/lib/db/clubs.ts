import { createClient } from "@/lib/supabase/server";

export interface Club {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  state_code: string;
  region: "west" | "east" | "south" | "midwest";
  address: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  member_count: number | null;
  greens: number | null;
  rinks: number | null;
  surface_type: "natural_grass" | "synthetic" | "hybrid" | "unknown";
  division: string | null;
  activities: string[];
  facilities: string[];
  founded: number | null;
  description: string | null;
  status: "active" | "seasonal" | "inactive" | "unverified" | "claimed";
  has_online_presence: boolean;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  tags: string[];
  claimed_by: string | null;
  claimed_at: string | null;
  venue_id: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export async function listClubs(opts?: {
  region?: string;
  stateCode?: string;
  activity?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("clubs")
    .select("*", { count: "exact" })
    .order("state", { ascending: true })
    .order("name", { ascending: true });

  if (opts?.region) {
    query = query.eq("region", opts.region);
  }
  if (opts?.stateCode) {
    query = query.eq("state_code", opts.stateCode);
  }
  if (opts?.activity) {
    query = query.contains("activities", [opts.activity]);
  }
  if (opts?.search) {
    query = query.or(
      `name.ilike.%${opts.search}%,city.ilike.%${opts.search}%,state.ilike.%${opts.search}%`
    );
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }
  if (opts?.offset) {
    query = query.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { clubs: (data ?? []) as Club[], total: count ?? 0 };
}

export async function getClubBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Club;
}

export async function getClubsByState(stateCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("state_code", stateCode.toUpperCase())
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Club[];
}

export async function getClubStats() {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("clubs")
    .select("state_code, region, status, member_count", { count: "exact" });

  if (error) throw error;

  const clubs = data ?? [];
  const states = new Set(clubs.map((c) => c.state_code));
  const regions = new Set(clubs.map((c) => c.region));
  const totalMembers = clubs.reduce((sum, c) => sum + (c.member_count ?? 0), 0);

  return {
    totalClubs: count ?? 0,
    totalStates: states.size,
    totalRegions: regions.size,
    totalMembers,
    activeClubs: clubs.filter((c) => c.status === "active").length,
    seasonalClubs: clubs.filter((c) => c.status === "seasonal").length,
  };
}

export async function getFeaturedClubs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("is_featured", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Club[];
}

export async function getStatesWithClubCounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("state_code, state");

  if (error) throw error;

  const counts: Record<string, { name: string; count: number }> = {};
  for (const row of data ?? []) {
    if (!counts[row.state_code]) {
      counts[row.state_code] = { name: row.state, count: 0 };
    }
    counts[row.state_code].count++;
  }

  return Object.entries(counts)
    .map(([code, info]) => ({ code, name: info.name, count: info.count }))
    .sort((a, b) => b.count - a.count);
}
