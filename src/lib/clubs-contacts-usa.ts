// Club contact and social media enrichment data
// Extracted from research files: USA_CLUBS_WEST.md, USA_CLUBS_EAST.md, USA_CLUBS_SOUTH.md, USA_CLUBS_MIDWEST.md
// Generated: 2026-03-11

export interface ClubContact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

export interface GoverningBodyContact {
  organization: string;
  level: "national" | "division";
  website?: string;
  facebookUrl?: string;
  email?: string;
  phone?: string;
  contacts?: ClubContact[];
}

// ─────────────────────────────────────────────────────────
// Map of club ID to their contacts
// ─────────────────────────────────────────────────────────

export const USA_CLUB_CONTACTS: Record<string, ClubContact[]> = {
  // === ARIZONA ===
  "bell-lawn-bowls-club": [
    { name: "Amy Heidebrink", role: "Contact Person", phone: "623-583-4432", email: "cblbc@gmail.com" },
  ],

  "fairway-mountain-view-lawn-bowls": [
    // Contact via RCSC (Recreation Centers of Sun City)
  ],
  "johnson-lawn-bowls-club": [
    // Contact via website (lawnbowls.scwclubs.com)
  ],
  "lakeview-lawn-bowls-club": [
    // Contact via RCSC (Recreation Centers of Sun City)
  ],
  "leisure-world-mesa-lawn-bowling": [
    // Contact via Leisure World community office
  ],
  "oakmont-lawn-bowls-sun-city-az": [
    // Contact via RCSC (Recreation Centers of Sun City)
  ],
  "paradise-rv-resort-lawn-bowls": [
    { name: "Unknown", role: "Resort Contact", phone: "623-977-0344" },
  ],

  // === CALIFORNIA — PIMD (Northern) ===
  "berkeley-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "510-841-2174", email: "berkeleylawnbowling@gmail.com" },
  ],
  "del-mesa-carmel-lawn-bowling": [
    { name: "Doug Davenport", role: "President", email: "DMCLawnBowling@gmail.com" },
  ],
  "fresno-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "559-224-2240" },
  ],
  "oakland-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "510-625-9937" },
  ],
  "palo-alto-lawn-bowls-club": [
    // Contact via website only
  ],
  "rossmoor-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "925-289-8011" },
  ],
  "san-francisco-lawn-bowling-club": [
    // Contact via website only
  ],
  "san-jose-lawn-bowls-club": [
    // Contact via website/Yelp
  ],
  "santa-clara-lawn-bowls-club": [
    { name: "Michael McClintock", role: "Contact Person", phone: "408-204-0154" },
  ],
  "santa-cruz-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "831-469-4807" },
  ],
  "sunnyvale-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "408-730-7356" },
  ],
  "oakmont-lawn-bowling-santa-rosa": [
    { name: "Unknown", role: "Club Contact", phone: "707-539-1511" },
  ],

  // === CALIFORNIA — Southwest Division (Southern) ===
  "beverly-hills-lawn-bowling-club": [
    { name: "Bill Wolff", role: "Contact Person", email: "info@bhlbc.com", phone: "323-405-1147" },
  ],
  "cambria-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", email: "cambrialbc@gmail.com" },
  ],
  "coronado-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "619-319-5509" },
  ],
  "holmby-park-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "424-425-5996" },
  ],
  "laguna-beach-lawn-bowling-club": [
    // Contact via website
  ],
  "laguna-woods-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "949-951-3027" },
  ],
  "long-beach-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "562-433-9063" },
  ],
  "mackenzie-park-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "805-563-2143", email: "mackenzieparklbc@gmail.com" },
  ],
  "newport-harbor-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "949-640-1022" },
  ],
  "pasadena-lawn-bowling-club": [
    // Contact via website
  ],
  "redlands-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "909-792-4874" },
  ],
  "riverside-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "951-784-7602" },
  ],
  "san-diego-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "619-238-5457" },
  ],
  "santa-anita-bowling-green-club": [
    // Contact via website
  ],
  "santa-barbara-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "805-574-0221", email: "sblawnbowlsclub@gmail.com" },
  ],
  "santa-ana-lawn-bowling-club": [
    { name: "Unknown", role: "City Parks Contact", email: "parksandrecreation@santa-ana.org" },
  ],
  "sun-city-ca-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", email: "suncitylawnbowls22@gmail.com" },
  ],
  "hermosa-beach-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "310-372-9080" },
  ],
  "oxnard-joslyn-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "805-385-8034" },
  ],
  "oaks-north-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "858-487-4832" },
  ],
  "hemet-joslyn-lawn-bowls-club": [
    { name: "Joy Owens", role: "Contact Person", email: "jo4faith51@gmail.com", phone: "951-652-0981" },
  ],
  "pomona-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "909-625-5532" },
  ],

  "santa-monica-lawn-bowls-club": [
    // Contact via club at Douglas Park; no specific person/email in research
  ],

  // === COLORADO ===
  "washington-park-lawn-bowling-club": [
    // Contact via website and Facebook @WPLBC
  ],

  // === HAWAII ===
  "honolulu-lawn-bowls-club": [
    { name: "Tamy DeLeon", role: "President", email: "honolululawnbowlsclub@gmail.com" },
    { name: "Jeanette Koga-Horan", role: "Secretary" },
    { name: "Judy Rasmussen", role: "Events/Tournament Director" },
    { name: "Nancy Miller", role: "Communications Director" },
    { name: "Michael Lauer", role: "Board Director" },
  ],

  // === OREGON ===
  "portland-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "971-808-4825" },
  ],
  "king-city-lawn-bowling-club": [
    // Contact via website
  ],

  // === UTAH ===
  "sunriver-lawn-bowling-club": [
    // Contact via SunRiver community
  ],

  // === WASHINGTON ===
  "jefferson-park-lawn-bowling-club": [
    // Contact via website
  ],
  "spokane-lawn-bowling-club": [
    { name: "Sam", role: "Contact Person", phone: "509-434-4791" },
  ],
  "tacoma-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", email: "tacomalawnbowlingclub@gmail.com" },
  ],

  // === CONNECTICUT ===
  "fernleigh-lawn-bowling-club": [
    // Contact via Facebook or website
  ],
  "greenwich-lawn-bowling-association": [
    // No contact information available
  ],
  "thistle-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", email: "ThistleLBC@gmail.com" },
  ],

  // === DELAWARE ===
  "dupont-country-club-lawn-bowling": [
    { name: "Unknown", role: "Member Services", phone: "(302) 654-4435", email: "memberservices@dupontcountryclub.com" },
  ],

  // === MARYLAND ===
  "leisure-world-md-lawn-bowls": [
    { name: "Unknown", role: "Education & Recreation Dept.", phone: "301-598-1300", email: "recreation@lwmc.com" },
  ],

  // === NEW JERSEY ===
  "essex-county-lawn-bowling-club": [
    { name: "Skip Arculli", role: "Notable Member (World Lawn Bowling Gold Medalist)" },
    { name: "Isabella Forbes", role: "First Woman President (1979)" },
    { name: "Unknown", role: "Club Contact", email: "njbowls1924@gmail.com" },
  ],

  // === NEW YORK ===
  "new-york-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "(212) 920-4352" },
  ],
  "ausable-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "(518) 576-4411" },
  ],

  // === PENNSYLVANIA ===
  "frick-park-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", email: "info@lawnbowlingpittsburgh.org" },
  ],
  "buck-hill-falls-lawn-bowling": [
    // Contact via community website
  ],
  "skytop-lawn-bowling-club": [
    // Contact via Skytop Lodge resort
  ],

  // === VIRGINIA ===
  "chesapeake-bay-lawn-bowls": [
    { name: "Deb Harriman", role: "Lawn Bowling Contact", email: "EdDebH@earthlink.net" },
    { name: "Macey White", role: "General Manager", email: "MaceyWhite@gmail.com" },
  ],

  // === FLORIDA ===
  "clearwater-lawn-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "(727) 641-9144" },
  ],
  "mount-dora-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "(352) 383-2294", email: "mntdoralbc@aol.com" },
  ],
  "st-petersburg-lawn-bowling-club": [
    { name: "Trevor Cleland", role: "Contact Person", email: "stpetebowls@verizon.net" },
    { name: "Unknown", role: "Club Email", email: "stpetelawnbowls@gmail.com" },
  ],
  "sun-city-center-lawn-bowling-club": [
    { name: "Bob", role: "Lessons Coordinator", phone: "(615) 848-3549" },
    { name: "Unknown", role: "Club Contact", phone: "(813) 938-3176", email: "sccbowl@gmail.com" },
  ],
  "sarasota-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", email: "info@sarasotalawnbowling.com" },
  ],
  "delray-beach-lawn-bowling-club": [
    { name: "John M. Everett", role: "Contact Person", phone: "(561) 719-6614" },
    { name: "Miguel Castaneda", role: "Contact Person", phone: "(561) 386-0459" },
    { name: "Liliana Castaneda", role: "Contact Person", phone: "(561) 310-8969" },
  ],
  "lakeland-lawn-bowling-club": [
    { name: "Unknown", role: "Park Contact", phone: "(863) 834-2233", email: "Parks@lakelandgov.net" },
  ],
  "maple-leaf-lawn-bowling-club": [
    { name: "Heather Comba", role: "Club Contact", phone: "(941) 627-6917" },
    { name: "Unknown", role: "Membership Contact", phone: "(941) 235-2252" },
  ],
  "the-villages-lawn-bowls-club": [
    // Contact via website
  ],
  "kings-point-west-lawn-bowling-club": [
    { name: "Jim Blaine", role: "Contact Person", email: "jblaine@tampabay.rr.com" },
  ],

  // === NORTH CAROLINA ===
  "asheville-lawn-bowling-club": [
    { name: "Jack Benatan", role: "Co-Founder" },
    { name: "Nicki Benatan", role: "Co-Founder" },
  ],
  "pinehurst-lawn-bowls-club": [
    { name: "Martha Nilsen", role: "Contact Person", phone: "(860) 857-3334", email: "bowls@pinehurst.com" },
  ],

  // === ARKANSAS ===
  "village-green-bowls-club": [
    { name: "Unknown", role: "Club Contact", phone: "(361) 813-0260", email: "villagegreenbowlsclub@gmail.com" },
  ],

  // === TENNESSEE ===
  "fogg-street-lawn-club": [
    { name: "Unknown", role: "Venue Contact", phone: "(615) 678-6200", email: "info@foggstreet.com" },
  ],

  // === ILLINOIS ===
  "lakeside-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "(773) 610-8569", email: "info@lawnbowlingchicago.com" },
  ],

  // === INDIANA ===
  "fort-wayne-lawn-bowls": [
    // Contact via website — no specific person identified
  ],

  // === MINNESOTA ===
  "brits-pub-lawn-bowling": [
    { name: "Unknown", role: "Manager", phone: "(612) 332-3908", email: "manager@britspub.com" },
  ],
  "brookview-golf-lawn-bowling": [
    { name: "Unknown", role: "Facility Contact", phone: "(763) 512-2300" },
  ],
  "centennial-lakes-lawn-bowling": [
    { name: "Unknown", role: "Facility Contact", phone: "(952) 833-9580", email: "centenniallakes@EdinaMN.gov" },
  ],
  "maddens-gull-lake-lawn-bowling": [
    // Contact via resort main line
  ],

  // === OHIO ===
  "cincinnati-lawn-bowling-club": [
    { name: "Unknown", role: "Club Contact", phone: "(513) 378-6068", email: "info@lawnbowling.org" },
  ],
  "lorain-lakeview-park-lawn-bowling": [
    { name: "Unknown", role: "Park Contact", phone: "(440) 245-1193" },
  ],

  // === WISCONSIN ===
  "milwaukee-lake-park-lawn-bowls-club": [
    // Contact via website contact form
  ],
};

// ─────────────────────────────────────────────────────────
// Club social media URLs not already in the main clubs-data.ts
// Only includes socials that are MISSING from the main data
// ─────────────────────────────────────────────────────────

export const USA_CLUB_SOCIALS: Record<
  string,
  {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
  }
> = {
  // === CALIFORNIA ===
  "beverly-hills-lawn-bowling-club": {
    instagramUrl: "https://instagram.com/bhlbc", // mentioned as "active Instagram"
    facebookUrl: "https://facebook.com/bhlbc",
  },
  "laguna-beach-lawn-bowling-club": {
    instagramUrl: "https://instagram.com/lagunabeachlawnbowlingclub",
    facebookUrl: "https://facebook.com/lagunabeachlawnbowlingclub",
  },
  "long-beach-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/longbeachlbc",
  },
  "holmby-park-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/losangeleslawnbowling",
  },
  "coronado-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/coronadolawnbowling",
  },
  "san-diego-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/sandiegolawnbowling",
  },
  "santa-anita-bowling-green-club": {
    facebookUrl: "https://facebook.com/santaanitalawnbowling",
  },
  "santa-barbara-lawn-bowls-club": {
    facebookUrl: "https://facebook.com/santabarbaralbc",
  },
  "sun-city-ca-lawn-bowls-club": {
    facebookUrl: "https://facebook.com/suncitylawnbowls",
  },
  "oxnard-joslyn-lawn-bowls-club": {
    facebookUrl: "https://facebook.com/oxnardlbc",
    instagramUrl: "https://instagram.com/oxnardlbc",
  },
  "pomona-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/pomonalawnbowlingclub",
  },
  "redlands-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/redlandslawnbowlingclub",
  },
  "riverside-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/riversidelawnbowlingclub",
  },
  "pasadena-lawn-bowling-club": {
    instagramUrl: "https://instagram.com/pasadenalawnbowling",
    facebookUrl: "https://facebook.com/pasadenalawnbowling",
  },
  "oakland-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/oaklandlawnbowlingclub",
  },
  "berkeley-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/berkeleylawnbowling",
  },

  // === OREGON ===
  "portland-lawn-bowling-club": {
    instagramUrl: "https://instagram.com/portlandlawnbowling",
  },

  // === WASHINGTON ===
  "tacoma-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/tacomabowls",
    instagramUrl: "https://instagram.com/tacomabowls",
  },
  "jefferson-park-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/seattlebowls",
  },

  // === NEW JERSEY ===
  "essex-county-lawn-bowling-club": {
    // facebookUrl already in clubs-data
  },

  // === NEW YORK ===
  "new-york-lawn-bowling-club": {
    // facebookUrl and instagramUrl already in clubs-data
  },

  // === PENNSYLVANIA ===
  "frick-park-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/frickparklawnbowlingclub",
    twitterUrl: "https://twitter.com/frickparklbc",
    // instagramUrl already in clubs-data
  },
  "skytop-lawn-bowling-club": {
    // instagramUrl already in clubs-data (@skytoplodge)
  },

  // === VIRGINIA ===
  "chesapeake-bay-lawn-bowls": {
    facebookUrl: "https://www.facebook.com/ChesapeakeBayCroquetClub/",
  },

  // === FLORIDA ===
  "clearwater-lawn-bowls-club": {
    // facebookUrl already in clubs-data
  },
  "mount-dora-lawn-bowling-club": {
    // facebookUrl already in clubs-data
  },
  "st-petersburg-lawn-bowling-club": {
    // facebookUrl already in clubs-data
  },
  "sun-city-center-lawn-bowling-club": {
    // facebookUrl already in clubs-data (group)
  },
  "lakeland-lawn-bowling-club": {
    // facebookUrl already in clubs-data
  },
  "kings-point-west-lawn-bowling-club": {
    // facebookUrl already in clubs-data
  },

  // === NORTH CAROLINA ===
  "asheville-lawn-bowling-club": {
    // No specific social media URLs extracted
  },

  // === WISCONSIN ===
  "milwaukee-lake-park-lawn-bowls-club": {
    // facebookUrl already in clubs-data
  },

  // === OHIO ===
  "cincinnati-lawn-bowling-club": {
    facebookUrl: "https://facebook.com/cincinnatilawnbowling",
  },
};

// ─────────────────────────────────────────────────────────
// Bowls USA Governing Body Contacts
// ─────────────────────────────────────────────────────────

export const USA_GOVERNING_BODIES: GoverningBodyContact[] = [
  {
    organization: "Bowls USA",
    level: "national",
    website: "https://www.bowlsusa.us/",
  },
  {
    organization: "Southwest Division (SWD)",
    level: "division",
    website: "https://swlawnbowls.org/",
  },
  {
    organization: "Pacific Inter-Mountain Division (PIMD)",
    level: "division",
    website: "https://pimdlawnbowls.org/",
  },
  {
    organization: "Northwest Division (NWD)",
    level: "division",
    website: "https://bowlsnw.com/",
  },
  {
    organization: "South Central Division (SCD)",
    level: "division",
    website: "https://www.scdlawnbowls.com/",
  },
  {
    organization: "Northeast Division",
    level: "division",
    website: "https://www.bowlsnortheast.com/",
    facebookUrl: "https://www.facebook.com/bowlsnortheastUSA/",
  },
  {
    organization: "Southeast Division (SED)",
    level: "division",
    website: "https://sedlawnbowls.org/",
  },
  {
    organization: "Central Division",
    level: "division",
    website: "https://www.lawnbowlscentral.com/",
  },
];

// ─────────────────────────────────────────────────────────
// Additional clubs found in research but NOT in clubs-data.ts
// These contacts are for reference / future club additions
// ─────────────────────────────────────────────────────────

export const USA_UNLISTED_CLUB_CONTACTS: Record<string, { clubName: string; state: string; contacts: ClubContact[] }> = {
  "sun-n-fun-lawn-bowling-club": {
    clubName: "Sun-n-Fun Lawn Bowling Club",
    state: "FL",
    contacts: [
      { name: "Barb Westermeier", role: "Contact Person", phone: "(703) 403-2112", email: "sunoutdoors7125@sfrmail.com" },
    ],
  },
  "world-parkway-otow-lawn-bowling-club": {
    clubName: "World Parkway (OTOW) Lawn Bowling Club",
    state: "FL",
    contacts: [
      { name: "Sandy Wall", role: "Contact Person", phone: "(727) 725-9683" },
    ],
  },
  "casta-del-sol-lawn-bowling-club": {
    clubName: "Casta del Sol Lawn Bowling Club",
    state: "CA",
    contacts: [
      // Contact via community office only
    ],
  },
  "friendly-valley-lawn-bowls-club": {
    clubName: "Friendly Valley Lawn Bowls Club",
    state: "CA",
    contacts: [
      { name: "Unknown", role: "Club Contact", phone: "805-252-3223" },
    ],
  },
  "the-groves-lawn-bowling-club": {
    clubName: "The Groves Lawn Bowling Club",
    state: "CA",
    contacts: [
      { name: "Woody Ameel", role: "President", email: "woodyjoya@gmail.com" },
    ],
  },
};
