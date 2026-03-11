"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Search, X } from "lucide-react";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  usage?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // ── Game Structure ──
  {
    term: "End",
    definition:
      "One complete sequence of play: the jack is delivered, all bowls are delivered, and the score is counted. A game consists of multiple ends.",
    category: "Game Structure",
    usage: '"We\'re on the 15th end -- only 6 more to go."',
  },
  {
    term: "Head",
    definition:
      'The area around the jack where bowls have come to rest. "Reading the head" means assessing the positions of all bowls relative to the jack.',
    category: "Game Structure",
    usage: '"Have a look at the head before you bowl."',
  },
  {
    term: "Rink",
    definition:
      "The playing lane on a green (4.3 to 5.8 metres wide). Also used to refer to a team of four players (synonym for Fours).",
    category: "Game Structure",
    usage: '"We\'re playing on rink 3 today."',
  },
  {
    term: "Green",
    definition:
      "The entire playing surface -- a flat, manicured grass or synthetic area typically divided into 6 rinks. Dimensions are 31 to 40 metres in the direction of play.",
    category: "Game Structure",
  },
  {
    term: "Mat",
    definition:
      "The rubber mat (360mm x 600mm minimum) placed on the rink to mark the delivery point. Players must have at least one foot on or over the mat when delivering.",
    category: "Game Structure",
    usage: '"Step up to the mat and take your time."',
  },
  {
    term: "Ditch",
    definition:
      "The trench (200-380mm wide, 50-200mm deep) around the edge of the green. A bowl in the ditch is dead unless it is a toucher.",
    category: "Game Structure",
  },
  {
    term: "Bank",
    definition: "The raised border beyond the ditch surrounding the green.",
    category: "Game Structure",
  },
  {
    term: "Centre Line",
    definition:
      "The line running down the middle of each rink. The jack is centred on this line after delivery.",
    category: "Game Structure",
  },
  {
    term: "Boundary Pegs",
    definition:
      "Markers on the bank that define the edges of each rink on the green.",
    category: "Game Structure",
  },

  // ── Equipment ──
  {
    term: "Bowl",
    definition:
      'The biased ball (112mm to 134mm diameter, up to 1.59 kg) players roll toward the jack. Also historically called a "wood" because bowls were once made of lignum vitae wood.',
    category: "Equipment",
  },
  {
    term: "Jack",
    definition:
      'The small, unbiased target ball (63 to 67mm diameter), coloured white or yellow. Also called the "kitty" or "mark". Must travel at least 23 metres from the mat to be in play.',
    category: "Equipment",
    usage: '"The jack\'s sitting short today -- about 25 metres."',
  },
  {
    term: "Bias",
    definition:
      "The asymmetric weight distribution built into every bowl that causes it to travel in a curved arc rather than a straight line. The curve becomes most pronounced as the bowl slows down.",
    category: "Equipment",
    usage: '"Make sure the bias is facing the right way before you deliver."',
  },
  {
    term: "Disc / Ring",
    definition:
      "Circular markings on each side of a bowl used for identification. The smaller ring indicates the bias side (the side the bowl will curve toward). The larger ring is the non-bias side.",
    category: "Equipment",
  },
  {
    term: "Chalk",
    definition:
      "Spray or stick chalk used to mark a toucher -- a bowl that touched the jack during its original delivery.",
    category: "Equipment",
  },
  {
    term: "Measure / Tape",
    definition:
      "A measuring device used to determine which bowl is closest to the jack when it is not obvious by eye.",
    category: "Equipment",
  },
  {
    term: "Calipers",
    definition:
      "A precision measuring device used for very close bowls where a tape measure is not accurate enough.",
    category: "Equipment",
  },
  {
    term: "Woods",
    definition:
      "An older term for bowls, from the days when they were made of lignum vitae wood. Still used informally by some players.",
    category: "Equipment",
  },
  {
    term: "Kitty",
    definition:
      "An alternative name for the jack (the small target ball). Also sometimes called the mark.",
    category: "Equipment",
  },
  {
    term: "Mark",
    definition:
      "Another name for the jack. Also used as a verb meaning to chalk a toucher.",
    category: "Equipment",
  },

  // ── Delivery and Shots ──
  {
    term: "Draw",
    definition:
      "The most fundamental shot in lawn bowls: rolling a bowl to come to rest near the jack without disturbing other bowls. The bread-and-butter delivery for leads.",
    category: "Delivery & Shots",
    usage: '"Just draw to the jack -- nice and smooth."',
  },
  {
    term: "Drive",
    definition:
      "A fast, forceful delivery intended to blast bowls out of the head or knock the jack into the ditch. A high-risk, high-reward shot typically played by skips.",
    category: "Delivery & Shots",
    usage: '"We\'re down 4 -- time to fire in a drive."',
  },
  {
    term: "Forehand",
    definition:
      "A delivery where the bowl curves from the dominant-hand side inward. For a right-handed player, the bowl travels to the right and curves back left.",
    category: "Delivery & Shots",
  },
  {
    term: "Backhand",
    definition:
      "A delivery where the bowl curves from the non-dominant side. For a right-handed player, the bowl travels to the left and curves back right.",
    category: "Delivery & Shots",
  },
  {
    term: "Weight",
    definition:
      'The force or pace of a delivery. "Good weight" means the bowl was delivered at the correct speed to reach the target area.',
    category: "Delivery & Shots",
    usage: '"That was perfect weight -- right on the money."',
  },
  {
    term: "Line",
    definition:
      "The direction or aiming point of a delivery, accounting for the bowl's bias. Getting the correct line means the bowl will curve back to the target.",
    category: "Delivery & Shots",
  },
  {
    term: "Grass",
    definition:
      'The amount of width given to a delivery to allow for bias. "More grass" means aim wider of the target to allow more room for the bowl to curve.',
    category: "Delivery & Shots",
    usage: '"Take more grass on that side -- you\'re too narrow."',
  },
  {
    term: "Yard On",
    definition:
      "A delivery intended to finish about one yard (roughly one metre) past the jack. Used to gain positional advantage or push through the head gently.",
    category: "Delivery & Shots",
  },
  {
    term: "Trail",
    definition:
      "A shot that moves the jack to a new position, usually backward toward your own back bowls. A tactical shot to change the scoring situation.",
    category: "Delivery & Shots",
    usage: '"Trail the jack back to our bowl sitting behind."',
  },
  {
    term: "Wick",
    definition:
      "When a bowl deflects off another bowl and changes direction. Can be deliberate (a tactical wick shot) or accidental.",
    category: "Delivery & Shots",
    usage: '"Lucky wick -- it deflected right onto the jack!"',
  },
  {
    term: "Promote / Promotion",
    definition:
      "Pushing one of your own team's bowls closer to the jack with a weighted shot. A precise tactical play.",
    category: "Delivery & Shots",
  },
  {
    term: "Block / Blocker",
    definition:
      "A bowl placed deliberately short of the head to obstruct the opponent's line of delivery. Forces the opposition to change hands or play around it.",
    category: "Delivery & Shots",
  },
  {
    term: "Cover",
    definition:
      "A bowl placed behind or to the side of the jack as insurance in case the jack is moved by a later delivery.",
    category: "Delivery & Shots",
  },
  {
    term: "Kill",
    definition:
      "A deliberate attempt to send the jack into the ditch (dead end) or off the rink, resulting in the end being replayed. Used when badly behind on the head.",
    category: "Delivery & Shots",
  },
  {
    term: "Delivery",
    definition:
      "The act of bowling. Players step forward on the mat, swing the arm smoothly, and release the bowl at ground level.",
    category: "Delivery & Shots",
  },
  {
    term: "Foot Fault",
    definition:
      "An illegal delivery where the player does not have at least one foot on or over the mat at the moment of release.",
    category: "Delivery & Shots",
  },
  {
    term: "Dump / Dumping",
    definition:
      "Poor technique where the bowl bounces on landing rather than rolling smoothly onto the green.",
    category: "Delivery & Shots",
  },
  {
    term: "Follow Through",
    definition:
      "The continuation of the arm swing after releasing the bowl, pointing in the direction of the aiming line. Good follow-through promotes accuracy.",
    category: "Delivery & Shots",
  },
  {
    term: "Up-Shot",
    definition:
      "A delivery with slightly more weight than a draw, intended to push or disturb bowls in the head without a full drive.",
    category: "Delivery & Shots",
  },

  // ── Positions and Results ──
  {
    term: "Shot Bowl",
    definition:
      "The bowl currently closest to the jack. The team with the shot bowl is said to be 'holding shot'.",
    category: "Positions & Results",
    usage: '"Their red bowl is shot -- we need to get closer."',
  },
  {
    term: "Holding",
    definition:
      'Your team currently has the bowl closest to the jack. "We\'re holding" means your team has the shot bowl.',
    category: "Positions & Results",
  },
  {
    term: "Up / Down",
    definition:
      '"Up 2" means your team has 2 bowls counting (closer than the opponent\'s nearest). "Down 1" means the opponent has 1 counting.',
    category: "Positions & Results",
    usage: '"We\'re up 3 with two bowls to play."',
  },
  {
    term: "Counting / Counters",
    definition:
      "Bowls that are currently scoring -- closer to the jack than the opponent's nearest bowl.",
    category: "Positions & Results",
    usage: '"We have 3 counting -- great end!"',
  },
  {
    term: "Toucher",
    definition:
      "A bowl that touched the jack during its original delivery. Marked with chalk. A toucher remains live even if it falls into the ditch.",
    category: "Positions & Results",
  },
  {
    term: "Dead Bowl",
    definition:
      "A bowl that has gone into the ditch (without being a toucher), gone off the rink, or is otherwise out of play.",
    category: "Positions & Results",
  },
  {
    term: "Dead End / Burnt End",
    definition:
      "An end that must be replayed because the jack went out of bounds (into the ditch or off the rink).",
    category: "Positions & Results",
  },
  {
    term: "Jack High",
    definition:
      "A bowl that has come to rest level with the jack -- at the same distance from the mat but off to the side.",
    category: "Positions & Results",
    usage: '"That bowl\'s jack high on the forehand side."',
  },
  {
    term: "Short",
    definition:
      "A bowl that stops before reaching the jack. Not enough weight was applied.",
    category: "Positions & Results",
    usage: '"You\'re a bit short -- add a touch more weight next time."',
  },
  {
    term: "Heavy",
    definition:
      "A bowl delivered with too much weight, going past the target area.",
    category: "Positions & Results",
  },
  {
    term: "Narrow",
    definition:
      "A bowl that did not take enough grass -- it curves too far toward the centre line and misses the target on the inside.",
    category: "Positions & Results",
  },
  {
    term: "Wide",
    definition:
      "A bowl that took too much grass -- it finishes too far from the centre, missing the target on the outside.",
    category: "Positions & Results",
  },
  {
    term: "Wrong Bias",
    definition:
      "A bowl delivered with the bias facing the wrong way, causing it to curve away from the target instead of toward it. Considered an embarrassing error.",
    category: "Positions & Results",
  },
  {
    term: "No Score End",
    definition:
      "An end where the closest bowls from each team are equidistant from the jack, resulting in a tied end with no score awarded.",
    category: "Positions & Results",
  },
  {
    term: "Full Count",
    definition:
      "When all of your team's bowls are closer to the jack than any of the opponent's bowls.",
    category: "Positions & Results",
  },
  {
    term: "Shot",
    definition:
      "One point. Also used to describe the closest bowl to the jack (the shot bowl).",
    category: "Positions & Results",
  },

  // ── Player Positions ──
  {
    term: "Lead",
    definition:
      "The player who bowls first in a team. Responsible for placing the mat, delivering the jack, and drawing to the jack. Primarily uses draw shots and values consistency above all.",
    category: "Player Positions",
  },
  {
    term: "Second",
    definition:
      "The player who bowls second in a Fours team. Reinforces the head, adds cover bowls, and traditionally keeps the scorecard. Needs versatility.",
    category: "Player Positions",
  },
  {
    term: "Third / Vice-Skip",
    definition:
      "The player who bowls third. Directs play at the head end when the skip is bowling, measures disputed shots, agrees the count with the opposing third, and provides tactical input.",
    category: "Player Positions",
  },
  {
    term: "Skip",
    definition:
      "The team captain who bowls last. Directs all play from the head end, sets game strategy, and must master all shot types. Also used as a verb: to captain a team.",
    category: "Player Positions",
    usage: '"Who\'s skipping your rink this week?"',
  },

  // ── Game Formats ──
  {
    term: "Singles",
    definition:
      "A game between two individual players, each using 4 bowls. Typically played first to 21 shots. A non-playing marker assists.",
    category: "Game Formats",
  },
  {
    term: "Pairs",
    definition:
      "A game between two teams of 2 (Lead and Skip). Each player uses 4 bowls. Championship games are 21 ends.",
    category: "Game Formats",
  },
  {
    term: "Triples",
    definition:
      "A game between two teams of 3 (Lead, Second, Skip). Each player uses 3 bowls. Championship games are 18 ends.",
    category: "Game Formats",
  },
  {
    term: "Fours",
    definition:
      "A game between two teams of 4 (Lead, Second, Third, Skip). Each player uses 2 bowls. The traditional format for pennant competition. Also called Rinks.",
    category: "Game Formats",
  },
  {
    term: "Sets Play",
    definition:
      "An alternative scoring format where a match is divided into sets (typically 2 sets of 9 ends). Winning 2 sets wins the match, with a 3-end tiebreaker if sets are split.",
    category: "Game Formats",
  },

  // ── Competition and Club ──
  {
    term: "Pennant",
    definition:
      "The main inter-club league competition, run by the state or regional bowls association. Clubs enter sides (teams) that play weekly across a season.",
    category: "Competition & Club",
  },
  {
    term: "Division",
    definition:
      "Skill-based tiers within pennant competition. Division 1 is the strongest. Teams can be promoted or relegated between divisions.",
    category: "Competition & Club",
  },
  {
    term: "Section",
    definition:
      "A group of teams within a division who play each other in a round-robin format during pennant competition.",
    category: "Competition & Club",
  },
  {
    term: "Selection / Selectors",
    definition:
      "The process and people who choose which players play in pennant teams and in which positions. Typically 3 to 5 members including the Club Captain.",
    category: "Competition & Club",
  },
  {
    term: "Roll-Up",
    definition:
      "An informal practice session on the green. Also a social activity -- a chance to practice and chat with fellow members.",
    category: "Competition & Club",
  },
  {
    term: "Tabs-In",
    definition:
      "A social bowls system where players put their name in (a tab or ticket) and teams are drawn randomly at the start time.",
    category: "Competition & Club",
    usage: '"Names in by 12:30 -- we\'ll do the draw at 12:45."',
  },
  {
    term: "Barefoot Bowls",
    definition:
      "Casual lawn bowls played without bowling shoes, often with food and drinks. Popular for corporate events and attracting younger players to the sport.",
    category: "Competition & Club",
  },
  {
    term: "Spider",
    definition:
      "A novelty event where all players bowl simultaneously from the edges of the green toward a jack placed in the centre. The closest bowl wins a prize.",
    category: "Competition & Club",
  },
  {
    term: "Marker",
    definition:
      "A non-playing official who assists in singles games by centring the jack, marking touchers, indicating distances, and measuring when asked.",
    category: "Competition & Club",
  },
  {
    term: "Umpire",
    definition:
      "An official who adjudicates disputes, measures shots when called upon, and enforces the rules of the sport.",
    category: "Competition & Club",
  },
  {
    term: "Walkover",
    definition:
      "A win awarded when the opposing team fails to show up for a scheduled match.",
    category: "Competition & Club",
  },
  {
    term: "Trial End / Practice End",
    definition:
      "Non-scoring ends played at the start of a match for warm-up purposes, allowing players to assess the green speed and conditions.",
    category: "Competition & Club",
  },
  {
    term: "Side",
    definition:
      "A club's full team for a pennant match, consisting of 12 to 16 players divided across 3 to 4 rinks of fours.",
    category: "Competition & Club",
  },
  {
    term: "Round-Robin",
    definition:
      "A tournament format where every team plays every other team once (single round-robin) or twice (double round-robin). The fairest format but time-consuming with many teams.",
    category: "Competition & Club",
  },
  {
    term: "Knockout / Elimination",
    definition:
      "A tournament format where a team is eliminated after losing. Single elimination (one loss and out) or double elimination (must lose twice).",
    category: "Competition & Club",
  },
  {
    term: "Swiss System",
    definition:
      "A tournament format where teams with similar records play each other. All teams play the same number of rounds and nobody is eliminated.",
    category: "Competition & Club",
  },
  {
    term: "Progressive Pairs / Triples",
    definition:
      "A social tournament format with multiple short games (7-8 ends). Winners move up one rink after each game. Partners may rotate. Individual scores accumulate.",
    category: "Competition & Club",
  },
  {
    term: "Commonwealth Games",
    definition:
      "Lawn bowls has been included in the Commonwealth Games since 1930 (men's) and 1986 (women's). One of the sport's highest-profile international events.",
    category: "Competition & Club",
  },
  {
    term: "World Bowls",
    definition:
      "The international governing body for the sport of bowls, founded in 2001. Publishes the Laws of the Sport of Bowls and oversees the World Bowls Championship.",
    category: "Competition & Club",
  },
  {
    term: "Bowls Australia",
    definition:
      "The national governing body for lawn bowls in Australia. State affiliates include Bowls Victoria, Bowls NSW, Bowls WA, Bowls Qld, and others.",
    category: "Competition & Club",
  },
  {
    term: "Sectional Play",
    definition:
      "A tournament structure where teams are divided into groups (sections) for round-robin play, with section winners advancing to knockout rounds.",
    category: "Competition & Club",
  },

  // ── Social / Organizational ──
  {
    term: "Draw (noun)",
    definition:
      "(1) A draw shot. (2) The process of randomly assigning teams and rinks. (3) The published schedule showing who plays whom and on which rink.",
    category: "Social & Organizational",
  },
  {
    term: "Fixture",
    definition:
      "A scheduled match or set of matches, often published weeks in advance as part of a season fixture list.",
    category: "Social & Organizational",
  },
  {
    term: "Availability",
    definition:
      "A player's indication of whether they can play on a given day. Managing availability is a key function for selectors and team organisers.",
    category: "Social & Organizational",
  },
  {
    term: "Pick-a-Partner",
    definition:
      "A format where players choose their own partner rather than being randomly drawn. Typically played as pairs.",
    category: "Social & Organizational",
  },

  // ── Scoring ──
  {
    term: "Shots Differential",
    definition:
      "Total shots scored minus total shots conceded. Used as a tiebreaker in tournaments and pennant ladders.",
    category: "Scoring",
  },
  {
    term: "Extra End",
    definition:
      "One or more additional ends played when a game is tied at the end of regulation play. The first team ahead after an extra end wins.",
    category: "Scoring",
  },
  {
    term: "Rink Points",
    definition:
      "In pennant competition, points earned for each rink result (e.g., 2 points for a rink win, 1 for a draw).",
    category: "Scoring",
  },
  {
    term: "Scorecard",
    definition:
      "The official record of scores for each end. In Fours, the second traditionally keeps the scorecard.",
    category: "Scoring",
  },
  {
    term: "Head-to-Head",
    definition:
      "A tiebreaker method using the result of the direct game between tied teams.",
    category: "Scoring",
  },

  // ── Green Conditions ──
  {
    term: "Green Speed",
    definition:
      "How fast the green is playing. A fast green requires less weight; a slow green requires more. Speed varies with weather, time of day, and maintenance.",
    category: "Green Conditions",
  },
  {
    term: "Running Surface",
    definition:
      "The condition of the green's playing surface, which affects how bowls travel. Can be natural grass or synthetic.",
    category: "Green Conditions",
  },
  {
    term: "Taking Grass",
    definition:
      "Aiming wide of the target to allow for the bowl's bias to bring it back toward the jack. The amount of grass taken depends on green speed and the bowl's bias.",
    category: "Green Conditions",
  },
];

const categories = [
  "Game Structure",
  "Equipment",
  "Delivery & Shots",
  "Positions & Results",
  "Player Positions",
  "Game Formats",
  "Scoring",
  "Competition & Club",
  "Social & Organizational",
  "Green Conditions",
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const termRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredTerms = useMemo(() => {
    let terms = [...glossaryTerms];

    if (activeCategory) {
      terms = terms.filter((t) => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    for (const term of filteredTerms) {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return groups;
  }, [filteredTerms]);

  const activeLetters = useMemo(() => {
    return new Set(Object.keys(groupedTerms));
  }, [groupedTerms]);

  const scrollToLetter = (letter: string) => {
    const el = termRefs.current[letter];
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
      <LearnBreadcrumb items={[{ label: "Glossary" }]} />

      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
          Lawn Bowling{" "}
          <span className="text-[#1B5E20]">Glossary</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Over {glossaryTerms.length} lawn bowling terms defined and explained.
          Search by keyword, browse alphabetically, or filter by category.
        </p>
      </header>

      {/* Sticky Search + A-Z Nav */}
      <div className="sticky top-16 z-40 bg-white pb-3 pt-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search terms, definitions, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white py-4 pl-12 pr-12 text-[16px] text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            aria-label="Search glossary terms"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-400"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* A-Z Navigation -- always visible */}
        <nav
          aria-label="Alphabetical navigation"
          className="mt-3 flex flex-wrap gap-1"
        >
          {alphabet.map((letter) => {
            const isActive = activeLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => isActive && scrollToLetter(letter)}
                disabled={!isActive}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition ${
                  isActive
                    ? "bg-[#1B5E20]/10 text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white active:scale-95"
                    : "bg-zinc-100 text-zinc-300 cursor-default"
                }`}
                aria-label={
                  isActive
                    ? `Jump to letter ${letter}`
                    : `No terms starting with ${letter}`
                }
              >
                {letter}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Category Filter */}
      <div className="mb-6 mt-2">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Filter by Category
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === null
                ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-[#1B5E20]/40 hover:text-[#1B5E20]"
            }`}
          >
            All ({glossaryTerms.length})
          </button>
          {categories.map((cat) => {
            const count = glossaryTerms.filter(
              (t) => t.category === cat
            ).length;
            return (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat
                    ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-[#1B5E20]/40 hover:text-[#1B5E20]"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Showing {filteredTerms.length} of {glossaryTerms.length} terms
        {search && (
          <>
            {" "}
            matching &ldquo;
            <span className="font-medium text-zinc-700">{search}</span>
            &rdquo;
          </>
        )}
        {activeCategory && (
          <>
            {" "}
            in{" "}
            <span className="font-medium text-zinc-700">{activeCategory}</span>
          </>
        )}
      </p>

      {/* Glossary Terms */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center">
          <Search className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
          <p className="text-lg font-semibold text-zinc-700">No terms found</p>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Try a different search term or clear your filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory(null);
            }}
            className="mt-4 rounded-lg bg-[#1B5E20] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2E7D32] transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {alphabet.map((letter) => {
            const terms = groupedTerms[letter];
            if (!terms || terms.length === 0) return null;
            return (
              <section
                key={letter}
                ref={(el) => {
                  termRefs.current[letter] = el;
                }}
              >
                <div className="sticky top-[12rem] z-30 mb-4 flex items-center gap-3 bg-white pb-2 pt-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20] text-lg font-bold text-white">
                    {letter}
                  </div>
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-sm text-zinc-400">
                    {terms.length} term{terms.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {terms.map((t) => (
                    <div
                      key={t.term}
                      className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm transition hover:border-[#1B5E20]/20 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {t.term}
                        </h3>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {t.category}
                        </span>
                      </div>
                      <p className="mt-2 text-[15px] leading-relaxed text-zinc-700">
                        {t.definition}
                      </p>
                      {t.usage && (
                        <p className="mt-3 rounded-lg border border-[#1B5E20]/10 bg-[#1B5E20]/5 px-4 py-2.5 text-[14px] italic text-[#1B5E20]">
                          {t.usage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-8 text-center shadow-xl shadow-green-900/15">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Ready to Put Your Knowledge Into Practice?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[16px] text-green-100/80">
          Now that you know the lingo, sign up to find games, track your
          scores, and connect with bowlers near you.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-[16px] font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
          >
            Sign Up Free
            <ChevronRight className="h-5 w-5" />
          </Link>
          <Link
            href="/bowls"
            className="rounded-2xl border-2 border-white/30 px-8 py-4 text-[16px] font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
          >
            Find a Game
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Link
          href="/learn/formats"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous: Game Formats
        </Link>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
        >
          Back to Learning Hub
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
