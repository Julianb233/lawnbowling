import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllClubs } from "@/lib/clubs-data";
import { USA_CLUB_CONTACTS } from "@/lib/clubs-contacts-usa";

/**
 * POST /api/clubs/seed
 * Seed clubs and contacts from static data into the database.
 * Admin only.
 *
 * Upserts all clubs (matching by slug) and their contacts into
 * the `clubs` and `club_contacts` tables.
 *
 * Returns: { clubs_seeded, contacts_seeded }
 */
export async function POST() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allClubs = getAllClubs();
  let clubsSeeded = 0;
  let contactsSeeded = 0;

  for (const club of allClubs) {
    // Build the slug — use existing id as slug
    const slug = club.id;

    const clubRow = {
      slug,
      name: club.name,
      city: club.city,
      state_code: club.stateCode,
      state: club.state,
      country_code: club.country ?? club.countryCode ?? "US",
      province: club.province ?? null,
      region: club.region ?? null,
      address: club.address ?? null,
      lat: club.lat ?? null,
      lng: club.lng ?? null,
      website: club.website ?? null,
      phone: club.phone ?? null,
      email: club.email ?? null,
      member_count: club.memberCount ?? null,
      greens: club.greens ?? null,
      rinks: club.rinks ?? null,
      surface_type: club.surfaceType,
      division: club.division ?? null,
      activities: club.activities,
      facilities: club.facilities,
      founded: club.founded ?? null,
      description: club.description ?? null,
      status: club.status,
      has_online_presence: club.hasOnlinePresence,
      facebook_url: club.facebookUrl ?? null,
      instagram_url: club.instagramUrl ?? null,
      youtube_url: club.youtubeUrl ?? null,
      twitter_url: club.twitterUrl ?? null,
      logo_url: club.logoUrl ?? null,
      cover_image_url: club.coverImageUrl ?? null,
      tags: club.tags,
      venue_id: club.venueId ?? null,
      is_featured: club.isFeatured ?? false,
      meta_title: club.metaTitle ?? null,
      meta_description: club.metaDescription ?? null,
    };

    const { data: upsertedClub, error: clubError } = await supabase
      .from("clubs")
      .upsert(clubRow, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (clubError) {
      console.error(`Failed to upsert club ${slug}:`, clubError.message);
      continue;
    }

    clubsSeeded++;

    // Seed contacts — merge from static ClubData.contacts and USA_CLUB_CONTACTS
    const contacts = [
      ...(club.contacts ?? []),
      ...(USA_CLUB_CONTACTS[club.id] ?? []),
    ];

    // Deduplicate by name+role
    const seen = new Set<string>();
    const uniqueContacts = contacts.filter((c) => {
      const key = `${c.name}::${c.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    for (const contact of uniqueContacts) {
      if (!contact.name || !contact.role) continue;

      const contactRow = {
        club_id: upsertedClub.id,
        name: contact.name,
        role: contact.role,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        linkedin_url: contact.linkedinUrl ?? null,
        instagram_url: contact.instagramUrl ?? null,
        facebook_url: contact.facebookUrl ?? null,
        twitter_url: contact.twitterUrl ?? null,
      };

      const { error: contactError } = await supabase
        .from("club_contacts")
        .upsert(contactRow, { onConflict: "club_id,name,role" });

      if (contactError) {
        console.error(
          `Failed to upsert contact ${contact.name} for ${slug}:`,
          contactError.message
        );
        continue;
      }

      contactsSeeded++;
    }
  }

  return NextResponse.json({
    clubs_seeded: clubsSeeded,
    contacts_seeded: contactsSeeded,
  });
}
