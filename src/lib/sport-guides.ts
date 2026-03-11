import type { Sport } from "./types";

export interface SportGuide {
  sport: Sport;
  name: string;
  tagline: string;
  overview: string;
  equipment: { name: string; description: string; icon: string }[];
  courtDiagram: string;
  howToPlay: { step: number; title: string; description: string }[];
  scoring: {
    system: string;
    explanation: string;
    examples: { scenario: string; score: string }[];
    tips: string[];
  };
  rules: { rule: string; explanation: string }[];
  beginnerTips: string[];
  etiquette: string[];
  funFacts: string[];
  difficulty: "Easy to Learn" | "Moderate" | "Challenging";
  typicalDuration: string;
  playersNeeded: string;
}

export const SPORT_GUIDES: Partial<Record<Sport, SportGuide>> = {
  lawn_bowling: {
    sport: "lawn_bowling",
    name: "Lawn Bowling",
    tagline: "An ancient game of precision, strategy, and bias",
    overview:
      "Lawn bowling (also called bowls) is one of the world's oldest sports, dating back thousands of years. Players roll biased bowls (not perfectly round) toward a small white target ball called the jack. The bias causes the bowls to curve as they slow down, adding a fascinating element of strategy and skill.\n\nUnlike many sports, lawn bowling rewards finesse over power. The game is played on a flat, closely-mown grass surface called a green, divided into individual lanes called rinks. It's a wonderfully social sport that welcomes players of all ages and abilities — from casual afternoon games to fiercely competitive tournaments.",
    equipment: [
      {
        name: "Bowls",
        description:
          "Biased balls that are slightly flattened, causing them to curve as they lose speed. Each player uses 4 bowls (2 in some formats). They come in various sizes to fit your hand.",
        icon: "\u26AB",
      },
      {
        name: "Jack",
        description:
          "A small white or yellow target ball. The jack is rolled first to set the target for each end.",
        icon: "\u26AA",
      },
      {
        name: "Mat",
        description:
          "A small rubber mat placed on the rink. All bowls must be delivered with one foot on the mat.",
        icon: "\uD83D\uDFE9",
      },
      {
        name: "Flat-Soled Shoes",
        description:
          "Smooth, flat-soled shoes are required to protect the green. Heeled or cleated shoes will damage the playing surface.",
        icon: "\uD83D\uDC5F",
      },
    ],
    courtDiagram: "lawn_bowling",
    howToPlay: [
      {
        step: 1,
        title: "Set Up the End",
        description:
          "Place the mat on the center line of the rink. The first player rolls the jack down the rink — it must travel at least 23 meters and be centered on the rink by the marker.",
      },
      {
        step: 2,
        title: "Deliver Your Bowl",
        description:
          "Stand on the mat with one foot and roll your bowl down the green. The bowl has a bias (one side is heavier) that causes it to curve. Choose forehand or backhand delivery depending on which way you want the bowl to curve.",
      },
      {
        step: 3,
        title: "Alternate Turns",
        description:
          "Players take turns delivering their bowls, trying to get as close to the jack as possible. You can also try to knock your opponent's bowls away from the jack.",
      },
      {
        step: 4,
        title: "Score the End",
        description:
          "After all bowls are delivered, the end is scored. The player/team with the bowl closest to the jack scores 1 point for each of their bowls that is closer than the opponent's nearest bowl.",
      },
      {
        step: 5,
        title: "Play Multiple Ends",
        description:
          "Pick up the bowls, move the mat to the other end, and play the next end in the opposite direction. A game typically consists of 18 or 21 ends.",
      },
    ],
    scoring: {
      system: "Closest to jack scores — 1 point per bowl closer than opponent's nearest",
      explanation:
        "At the end of each \"end\" (round), the team or player with the bowl nearest to the jack scores points. They receive 1 point for every bowl they have that is closer to the jack than the opponent's closest bowl. Only one team scores per end.",
      examples: [
        {
          scenario: "Your bowl is closest, and your second bowl is next closest",
          score:
            "You score 2 points for that end (two bowls closer than opponent's best)",
        },
        {
          scenario:
            "Your bowl is closest, but opponent's bowl is second closest",
          score:
            "You score 1 point (only one of your bowls is closer than their nearest)",
        },
        {
          scenario: "Opponent's bowl is closest to the jack",
          score:
            "You score 0 — the opponent scores based on how many of their bowls are closer than your best",
        },
      ],
      tips: [
        "Measuring devices are used when it's too close to call by eye",
        "A 'toucher' (bowl that touches the jack) stays live even in the ditch",
        "If the jack is knocked into the ditch, the end is still live (as long as it stays within the rink)",
        "Games are often played to a set number of ends (18 or 21) or to a target score",
      ],
    },
    rules: [
      {
        rule: "Delivery from the Mat",
        explanation:
          "All bowls must be delivered with at least one foot on or over the mat at the moment of release. You cannot step off the mat before the bowl leaves your hand.",
      },
      {
        rule: "Bias and Direction",
        explanation:
          "Bowls have a built-in bias that makes them curve. You must use this bias — bowling with the bias on the wrong side (running the wrong way) is poor form. The small circle or logo on the bowl indicates the bias side.",
      },
      {
        rule: "Bowl Must Stay in the Rink",
        explanation:
          "A bowl must come to rest within the boundaries of the rink. If it goes into the ditch without touching the jack, it is 'dead' and removed from play for that end.",
      },
      {
        rule: "Jack Displacement",
        explanation:
          "If the jack is knocked out of the rink boundaries, the end is declared dead and replayed. If knocked into the ditch but within rink boundaries, play continues.",
      },
      {
        rule: "Touchers",
        explanation:
          "A bowl that touches the jack during its initial delivery is marked with chalk and is called a 'toucher.' Touchers remain live even if they end up in the ditch.",
      },
    ],
    beginnerTips: [
      "Learn the bias — hold the bowl so the small emblem or disc faces the direction you want it to curve TOWARD.",
      "Focus on a smooth, consistent delivery. Bend your knees, keep your arm straight, and follow through.",
      "Start with draw shots (rolling close to the jack) before attempting drives (fast, aggressive shots).",
      "Use both forehand and backhand deliveries to approach the jack from different angles.",
      "Watch the line of other players' bowls to understand how the green is playing — pace and turn vary with conditions.",
      "Keep your eye on the target (the jack or your aiming point), not on your bowl during delivery.",
    ],
    etiquette: [
      "Stand still and stay behind the mat or behind the head while your opponent is bowling",
      "Never walk on the green with street shoes — flat-soled bowling shoes only",
      "Keep noise to a minimum during deliveries",
      "Compliment good bowls — say 'good bowl' or clap lightly",
      "Don't kick or step on the bowls",
      "Wait until the end is scored before picking up any bowls",
      "Shake hands before and after the game",
    ],
    funFacts: [
      "Lawn bowling dates back over 7,000 years — stone balls were found in ancient Egyptian tombs that were likely used for an early form of the game.",
      "Sir Francis Drake reportedly insisted on finishing his game of bowls before heading out to fight the Spanish Armada in 1588.",
      "The bias in bowls was originally created by weighting one side with lead. Modern bowls use asymmetric shaping instead.",
      "Lawn bowling is one of the original Commonwealth Games sports and has been included in every Games since 1930.",
    ],
    difficulty: "Easy to Learn",
    typicalDuration: "1-2 hours per game",
    playersNeeded: "2 (singles), 4 (pairs), 6 (triples), or 8 (fours)",
  },
};

export function getGuide(sport: string): SportGuide | undefined {
  return SPORT_GUIDES[sport as Sport];
}

export function getAllGuides(): SportGuide[] {
  return Object.values(SPORT_GUIDES);
}
