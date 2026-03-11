"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Game Structure
  { term: "End", definition: "One complete sequence of play: jack delivered, all bowls delivered, score counted. A game consists of multiple ends.", category: "Game Structure" },
  { term: "Head", definition: 'The area around the jack where bowls have come to rest. "Reading the head" means assessing the positions of all bowls relative to the jack.', category: "Game Structure" },
  { term: "Rink", definition: "The playing lane on a green (4.3-5.8m wide). Also used to refer to a team of four players (synonym for Fours).", category: "Game Structure" },
  { term: "Green", definition: "The entire playing surface, typically divided into 6 rinks.", category: "Game Structure" },
  { term: "Mat", definition: "The rubber mat from which players deliver their bowls.", category: "Game Structure" },
  { term: "Ditch", definition: "The trench around the edge of the green. A bowl in the ditch is dead unless it is a toucher.", category: "Game Structure" },
  { term: "Bank", definition: "The raised border beyond the ditch.", category: "Game Structure" },
  { term: "Centre line", definition: "The line running down the middle of each rink.", category: "Game Structure" },

  // Equipment
  { term: "Bowl", definition: 'The biased ball players roll toward the jack. Also called "wood" (historically).', category: "Equipment" },
  { term: "Jack", definition: 'The small target ball (also "kitty" or "mark"). White or yellow, 63-67mm diameter.', category: "Equipment" },
  { term: "Bias", definition: "The asymmetric weight distribution causing the bowl to curve.", category: "Equipment" },
  { term: "Disc / Ring", definition: "Circular markings on bowls. Small ring = bias side. Large ring = non-bias side.", category: "Equipment" },
  { term: "Chalk", definition: "Used to mark a toucher (bowl that touched the jack during delivery).", category: "Equipment" },
  { term: "Measure / Tape", definition: "Used to determine which bowl is closest to the jack.", category: "Equipment" },
  { term: "Calipers", definition: "Precision measuring device for very close bowls.", category: "Equipment" },

  // Delivery and Shots
  { term: "Draw", definition: "The most fundamental shot: rolling a bowl to come to rest near the jack without disturbing other bowls.", category: "Delivery & Shots" },
  { term: "Drive", definition: "A fast, forceful delivery intended to blast bowls out of the head or knock the jack into the ditch.", category: "Delivery & Shots" },
  { term: "Forehand", definition: "Delivery where the bowl curves from the dominant-hand side inward.", category: "Delivery & Shots" },
  { term: "Backhand", definition: "Delivery where the bowl curves from the non-dominant side.", category: "Delivery & Shots" },
  { term: "Weight", definition: 'The force/pace of a delivery. "Good weight" = correct speed to reach the target.', category: "Delivery & Shots" },
  { term: "Line", definition: "The direction/aiming point of a delivery, accounting for bias.", category: "Delivery & Shots" },
  { term: "Grass", definition: 'The amount of width given to allow for bias. "More grass" = aim wider.', category: "Delivery & Shots" },
  { term: "Yard on", definition: "A delivery intended to finish about one yard past the jack.", category: "Delivery & Shots" },
  { term: "Trail", definition: "A shot that moves the jack to a new position (usually backward toward your back bowls).", category: "Delivery & Shots" },
  { term: "Wick", definition: "When a bowl deflects off another bowl and changes direction.", category: "Delivery & Shots" },
  { term: "Promote", definition: "Pushing one of your own team's bowls closer to the jack with a weighted shot.", category: "Delivery & Shots" },
  { term: "Block / Blocker", definition: "A bowl placed short of the head to obstruct the opponent's line of delivery.", category: "Delivery & Shots" },
  { term: "Cover", definition: "A bowl placed behind or to the side of the jack as insurance in case the jack is moved.", category: "Delivery & Shots" },
  { term: "Kill", definition: "A deliberate attempt to send the jack into the ditch (dead end) or off the rink.", category: "Delivery & Shots" },
  { term: "Foot fault", definition: "When a player does not have at least one foot on or over the mat at the moment of delivery.", category: "Delivery & Shots" },

  // Positions and Results
  { term: "Shot bowl", definition: "The bowl currently closest to the jack.", category: "Positions & Results" },
  { term: "Holding", definition: 'Your team currently has the shot bowl ("we\'re holding").', category: "Positions & Results" },
  { term: "Up / Down", definition: '"Up 2" = your team has 2 bowls counting. "Down 1" = opponent has 1 counting.', category: "Positions & Results" },
  { term: "Counting / Counters", definition: "Bowls that are currently scoring (closer than opponent's nearest).", category: "Positions & Results" },
  { term: "Toucher", definition: "A bowl that touched the jack during its delivery. Marked with chalk. Remains live even if it goes in the ditch.", category: "Positions & Results" },
  { term: "Dead bowl", definition: "A bowl that has gone in the ditch (without being a toucher), off the rink, or is otherwise out of play.", category: "Positions & Results" },
  { term: "Dead end / Burnt end", definition: "An end that must be replayed because the jack went out of bounds.", category: "Positions & Results" },
  { term: "Jack high", definition: "A bowl that has come to rest level with the jack (same distance from the mat, but to the side).", category: "Positions & Results" },
  { term: "Short", definition: "A bowl that stops before reaching the jack.", category: "Positions & Results" },
  { term: "Heavy", definition: "A bowl delivered with too much weight, going past the target.", category: "Positions & Results" },
  { term: "Narrow", definition: "A bowl that did not take enough grass -- it curves too far toward the centre.", category: "Positions & Results" },
  { term: "Wide", definition: "A bowl that took too much grass -- it finishes too far from centre.", category: "Positions & Results" },
  { term: "Wrong bias", definition: "A bowl delivered with the bias facing the wrong way, causing it to curve away from the target. An embarrassing error.", category: "Positions & Results" },
  { term: "Shot", definition: 'One point. Also refers to the closest bowl ("the shot bowl").', category: "Positions & Results" },
  { term: "Full count", definition: "All your team's bowls are closer than any of the opponent's.", category: "Positions & Results" },
  { term: "No score", definition: "A tied end where the equidistant nearest bowls result in no points awarded.", category: "Positions & Results" },

  // Player Positions
  { term: "Lead", definition: "The first player to bowl in each end. Responsible for placing the mat, delivering the jack, and drawing close to it.", category: "Player Positions" },
  { term: "Second", definition: "The second player to bowl (exists only in Fours). Reinforces the head and keeps the scorecard.", category: "Player Positions" },
  { term: "Third / Vice-Skip", definition: "The third player to bowl. Directs play at the head end when the skip is bowling. Measures disputed shots and agrees the count.", category: "Player Positions" },
  { term: "Skip", definition: "The team captain who bowls last. Directs all play, sets strategy, and must master all shot types. Also used as a verb: to captain a team.", category: "Player Positions" },

  // Game Formats
  { term: "Singles", definition: "One player per side, 4 bowls each. Typically first to 21 shots.", category: "Game Formats" },
  { term: "Pairs", definition: "Two players per side (Lead and Skip), 4 bowls each. Usually 21 ends.", category: "Game Formats" },
  { term: "Triples", definition: "Three players per side (Lead, Second, Skip), 3 bowls each. Usually 18 ends.", category: "Game Formats" },
  { term: "Fours", definition: "Four players per side (Lead, Second, Third, Skip), 2 bowls each. Usually 21 ends. Also called Rinks.", category: "Game Formats" },

  // Competition and Club
  { term: "Pennant", definition: "The main inter-club league competition, run by the state/regional association.", category: "Competition & Club" },
  { term: "Division", definition: "Skill-based tiers within pennant competition (Division 1 = strongest).", category: "Competition & Club" },
  { term: "Section", definition: "A group of teams within a division who play each other in round-robin.", category: "Competition & Club" },
  { term: "Selection / Selectors", definition: "The process/people who choose which players play in pennant teams and in which positions.", category: "Competition & Club" },
  { term: "Roll-up", definition: 'An informal practice session (also "roll up").', category: "Competition & Club" },
  { term: "Tabs-in", definition: "A system where players put their name in for social bowls; teams are then drawn randomly.", category: "Competition & Club" },
  { term: "Barefoot bowls", definition: "Casual lawn bowls played without bowling shoes, often with food/drinks. Popular for corporate events and attracting younger players.", category: "Competition & Club" },
  { term: "Spider", definition: "A novelty event where all players bowl simultaneously from the edges toward a central jack.", category: "Competition & Club" },
  { term: "Marker", definition: "A non-playing official who assists in singles games (centres the jack, marks touchers, measures).", category: "Competition & Club" },
  { term: "Umpire", definition: "Official who adjudicates disputes, measures shots, enforces rules.", category: "Competition & Club" },
  { term: "Walkover", definition: "A win awarded when the opposing team fails to show up.", category: "Competition & Club" },
  { term: "Trial end / Practice end", definition: "Non-scoring ends at the start of a match for warm-up.", category: "Competition & Club" },

  // Social / Organizational
  { term: "Draw (noun)", definition: "Three meanings: (1) A draw shot. (2) The process of randomly assigning teams/rinks. (3) The published schedule showing who plays whom.", category: "Social & Organizational" },
  { term: "Fixture", definition: "A scheduled match or set of matches.", category: "Social & Organizational" },
  { term: "Availability", definition: "A player's indication of whether they can play on a given day.", category: "Social & Organizational" },
  { term: "Side", definition: "A club's full team for a pennant match (e.g., 12-16 players across 3-4 rinks).", category: "Social & Organizational" },
  { term: "Progressive Pairs/Triples", definition: "Multiple short games (7-8 ends) where winners move up one rink and partners may rotate between games.", category: "Social & Organizational" },
  { term: "Pick-a-Partner", definition: "A format where players choose their own partner rather than being drawn randomly. Typically played as pairs.", category: "Social & Organizational" },
  { term: "Round-robin", definition: "A tournament format where every team plays every other team. The fairest format but time-consuming with many teams.", category: "Social & Organizational" },
  { term: "Knockout / Elimination", definition: "A tournament format where you lose once (single) or twice (double) and you are out.", category: "Social & Organizational" },
  { term: "Swiss System", definition: "A tournament format where players with similar records play each other. All teams play the same number of rounds.", category: "Social & Organizational" },
  { term: "Sets play", definition: "An alternative scoring system: match divided into sets (typically 2 sets of 9 ends). Win 2 sets to win the match.", category: "Social & Organizational" },
  { term: "Extra end", definition: "Additional end(s) played to break a tie at the end of regulation.", category: "Social & Organizational" },

  // Scoring
  { term: "Shots differential", definition: "Total shots scored minus total shots conceded, used for tie-breaking in multi-game tournaments.", category: "Scoring" },
  { term: "Rink points", definition: "In pennant, points earned for each individual rink result (e.g., 2 points for a rink win, 1 for a draw).", category: "Scoring" },
];

const categories = [
  "Game Structure",
  "Equipment",
  "Delivery & Shots",
  "Player Positions",
  "Positions & Results",
  "Game Formats",
  "Competition & Club",
  "Social & Organizational",
  "Scoring",
];

export function GlossaryClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;

    if (activeCategory) {
      terms = terms.filter((t) => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
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

  const letters = Object.keys(groupedTerms).sort();

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
      <LearnBreadcrumb items={[{ label: "Glossary" }]} />

      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
          Lawn Bowling{" "}
          <span className="text-[#1B5E20]">Glossary</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
          Over {glossaryTerms.length} terms used in lawn bowls, organized
          alphabetically and by category. Use the search box to quickly find
          any term.
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3.5 pl-12 pr-10 text-[16px] text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "border-[#1B5E20] bg-[#1B5E20] text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          All ({glossaryTerms.length})
        </button>
        {categories.map((cat) => {
          const count = glossaryTerms.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-zinc-500">
        Showing {filteredTerms.length} of {glossaryTerms.length} terms
        {search && (
          <>
            {" "}
            matching &ldquo;{search}&rdquo;
          </>
        )}
        {activeCategory && (
          <>
            {" "}
            in <strong>{activeCategory}</strong>
          </>
        )}
      </p>

      {/* Alpha Jump Links */}
      {!search && !activeCategory && (
        <div className="mb-6 flex flex-wrap gap-1">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
            const hasTerms = groupedTerms[letter];
            return (
              <a
                key={letter}
                href={hasTerms ? `#letter-${letter}` : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                  hasTerms
                    ? "bg-[#1B5E20]/10 text-[#1B5E20] hover:bg-[#1B5E20]/20"
                    : "bg-zinc-100 text-zinc-300 cursor-default"
                }`}
              >
                {letter}
              </a>
            );
          })}
        </div>
      )}

      {/* Glossary Terms */}
      {filteredTerms.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-500">
            No terms match your search. Try a different search term or clear
            the category filter.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
              <div className="sticky top-16 z-10 mb-3 flex items-center gap-3 bg-white/95 backdrop-blur-sm py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B5E20] text-lg font-bold text-white">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>
              <div className="space-y-2">
                {groupedTerms[letter].map((term) => (
                  <div
                    key={term.term}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 transition-colors hover:border-zinc-300"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="flex-1">
                        <h3 className="text-[16px] font-bold text-zinc-900">
                          {term.term}
                        </h3>
                        <p className="mt-1 text-[15px] leading-relaxed text-zinc-600">
                          {term.definition}
                        </p>
                      </div>
                      <span className="mt-1 shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-500 sm:mt-0">
                        {term.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Hub
        </Link>
      </div>
    </div>
  );
}
