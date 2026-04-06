/**
 * Scrape all Bowls Scotland clubs from their official district pages.
 * URL pattern: https://www.bowlsscotland.com/club-finder/districts/district-{N}
 * Districts 1-32
 *
 * Output: scripts/data/scotland-clubs.json
 *
 * Usage: npx tsx scripts/scrape-scotland-clubs.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.bowlsscotland.com/club-finder/districts/district-";

const DISTRICT_NAMES: Record<number, string> = {
  1: "Highlands & Islands",
  2: "Sutherland & Ross",
  3: "Moray & Banff",
  4: "Aberdeenshire North",
  5: "Aberdeen City",
  6: "Angus",
  7: "Perth & Kinross",
  8: "Fife North",
  9: "Fife South",
  10: "Stirling & Clackmannan",
  11: "West Lothian",
  12: "East Dunbartonshire & Cumbernauld",
  13: "Midlothian & East Lothian",
  14: "Borders",
  15: "Dumfries & Galloway East",
  16: "Dumfries & Galloway West",
  17: "Ayrshire South",
  18: "Ayrshire North",
  19: "Renfrewshire",
  20: "Lanarkshire North",
  21: "Glasgow West",
  22: "Glasgow North East",
  23: "Glasgow South",
  24: "Lanarkshire South",
  25: "Dunbartonshire",
  26: "Argyll",
  27: "Highland Central",
  28: "Edinburgh",
  29: "Western Isles",
  30: "Clackmannanshire & Falkirk",
  31: "East Lothian & Borders",
  32: "South Ayrshire & Arran",
};

interface ScrapedClub {
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

function extractPostcode(text: string): string | null {
  const match = text.match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/i);
  return match ? match[0].toUpperCase().replace(/\s+/, " ") : null;
}

function extractTown(addressParts: string[]): string | null {
  // The town is typically the second-to-last part before the postcode
  // Address format: Street, Region, Town, Postcode
  for (let i = addressParts.length - 1; i >= 0; i--) {
    const part = addressParts[i].trim();
    // Skip postcodes, empty parts, and region-level names
    if (part.match(/^[A-Z]{1,2}\d/i)) continue;
    if (part.length < 3) continue;
    if (part.match(/^(Highlands|Scotland|Glasgow|Edinburgh)$/i)) continue;
    return part;
  }
  return addressParts.length > 0 ? addressParts[0].trim() : null;
}

async function scrapeDistrict(districtNum: number): Promise<ScrapedClub[]> {
  const url = `${BASE_URL}${districtNum}`;
  const clubs: ScrapedClub[] = [];
  const districtName = DISTRICT_NAMES[districtNum] || `District ${districtNum}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  District ${districtNum}: HTTP ${response.status}`);
      return clubs;
    }

    const html = await response.text();

    // HTML structure:
    // <span class="club-name">Club Name</span>
    // <div class="club-details">
    //   <p>
    //     Street<br />Region<br />Town<br />POSTCODE<br />
    //     <span class="phone">Try Bowls Club, BowlsMark Gold</span><br />
    //     <span class="email"><a href="mailto:email">email</a></span><br />
    //     <a href="url">Website Link</a><br />
    //   </p>
    // </div>

    // Extract each club block using regex
    const clubRegex = /<span class="club-name">(.*?)<\/span>\s*<div class="club-details">\s*<p>([\s\S]*?)<\/p>/gi;

    let match;
    while ((match = clubRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const detailsHtml = match[2];

      // Extract email
      const emailMatch = detailsHtml.match(/mailto:([^"]+)/i);
      const email = emailMatch ? emailMatch[1].trim() : null;

      // Extract website
      const websiteMatch = detailsHtml.match(/<a\s+href="(https?:\/\/[^"]+)"[^>]*>(?:Website Link|Club Website)/i);
      const website = websiteMatch ? websiteMatch[1] : null;

      // Extract BowlsMark and Try Bowls from phone span
      const phoneMatch = detailsHtml.match(/<span class="phone">(.*?)<\/span>/i);
      const phoneText = phoneMatch ? phoneMatch[1] : "";
      let bowlsmark: string | null = null;
      if (phoneText.match(/Gold/i)) bowlsmark = "Gold";
      else if (phoneText.match(/Silver/i)) bowlsmark = "Silver";
      else if (phoneText.match(/Bronze/i)) bowlsmark = "Bronze";
      const tryBowls = phoneText.toLowerCase().includes("try bowls");

      // Extract address: everything before the first <span> or <a> tag, split by <br />
      const addressHtml = detailsHtml
        .split(/<span/i)[0]
        .split(/<a /i)[0];

      const addressParts = addressHtml
        .replace(/<br\s*\/?>/gi, "|")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .split("|")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const fullAddress = addressParts.join(", ");
      const postcode = extractPostcode(fullAddress);
      const town = extractTown(addressParts);

      clubs.push({
        name,
        district: districtNum,
        district_name: districtName,
        address: fullAddress || null,
        postcode,
        town,
        email,
        website,
        bowlsmark,
        try_bowls: tryBowls,
      });
    }

    console.log(`  District ${districtNum} (${districtName}): ${clubs.length} clubs`);
  } catch (err: any) {
    console.warn(`  District ${districtNum}: Error - ${err.message}`);
  }

  return clubs;
}

async function main() {
  console.log("Scraping Bowls Scotland clubs from official directory...\n");

  const allClubs: ScrapedClub[] = [];
  const BATCH_SIZE = 8;

  for (let batch = 1; batch <= 32; batch += BATCH_SIZE) {
    const districtNums = [];
    for (let d = batch; d < Math.min(batch + BATCH_SIZE, 33); d++) {
      districtNums.push(d);
    }

    const batchResults = await Promise.all(
      districtNums.map((d) => scrapeDistrict(d))
    );

    for (const clubs of batchResults) {
      allClubs.push(...clubs);
    }
  }

  console.log(`\nTotal Scotland clubs scraped: ${allClubs.length}`);

  // Write output
  const outDir = resolve(__dirname, "data");
  mkdirSync(outDir, { recursive: true });

  const outPath = resolve(outDir, "scotland-clubs.json");
  writeFileSync(outPath, JSON.stringify(allClubs, null, 2), "utf-8");
  console.log(`Written to: ${outPath}`);

  // Stats
  const withAddr = allClubs.filter((c) => c.address).length;
  const withPost = allClubs.filter((c) => c.postcode).length;
  const withEmail = allClubs.filter((c) => c.email).length;
  const withWeb = allClubs.filter((c) => c.website).length;
  const withBM = allClubs.filter((c) => c.bowlsmark).length;
  console.log(`\nData quality:`);
  console.log(`  With address:   ${withAddr}/${allClubs.length}`);
  console.log(`  With postcode:  ${withPost}/${allClubs.length}`);
  console.log(`  With email:     ${withEmail}/${allClubs.length}`);
  console.log(`  With website:   ${withWeb}/${allClubs.length}`);
  console.log(`  With BowlsMark: ${withBM}/${allClubs.length}`);

  // Breakdown by district
  console.log("\nBreakdown:");
  const byDistrict = new Map<number, number>();
  for (const club of allClubs) {
    byDistrict.set(club.district, (byDistrict.get(club.district) || 0) + 1);
  }
  for (const [d, count] of [...byDistrict.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  D${d} ${DISTRICT_NAMES[d] || "?"}: ${count} clubs`);
  }
}

main().catch((err) => {
  console.error("Scrape failed:", err);
  process.exit(1);
});
