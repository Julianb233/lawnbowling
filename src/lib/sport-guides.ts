import type { Sport } from "./types";

export interface SportGuide {
  sport: Sport;
  emoji: string;
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

export const SPORT_GUIDES: Record<Sport, SportGuide> = {
  pickleball: {
    sport: "pickleball",
    emoji: "\u{1F3D3}",
    name: "Pickleball",
    tagline: "America's fastest-growing sport — easy to learn, hard to put down",
    overview:
      "Pickleball is a paddle sport that combines elements of tennis, badminton, and ping-pong. Played on a court roughly a quarter the size of a tennis court, it's accessible to players of all ages and athletic abilities. The game uses a perforated polymer ball (similar to a wiffle ball) and solid paddles made of wood or composite materials. Whether you're a seasoned athlete or a complete beginner, pickleball offers fast-paced, social gameplay that keeps you coming back for more.\n\nInvented in 1965 on Bainbridge Island, Washington, pickleball has exploded in popularity across the United States and beyond. Its smaller court size means less ground to cover, making it easier on joints while still providing an excellent workout. The game can be played as singles or doubles, though doubles is by far the most popular format.",
    equipment: [
      {
        name: "Paddle",
        description:
          "Solid paddle made of wood, graphite, or composite materials. Larger sweet spot than a ping-pong paddle.",
        icon: "\u{1F3D3}",
      },
      {
        name: "Pickleball",
        description:
          "Perforated polymer ball, similar to a wiffle ball. Outdoor balls have 40 smaller holes; indoor balls have 26 larger holes.",
        icon: "\u{26BE}",
      },
      {
        name: "Net",
        description:
          "34 inches high at the center, 36 inches at the sidelines. Similar to a tennis net but lower.",
        icon: "\u{1F3D0}",
      },
      {
        name: "Court Shoes",
        description:
          "Non-marking court shoes with good lateral support. Running shoes are not recommended.",
        icon: "\u{1F45F}",
      },
    ],
    courtDiagram: "pickleball",
    howToPlay: [
      {
        step: 1,
        title: "Serve the Ball",
        description:
          "Stand behind the baseline and serve underhand diagonally to the opponent's service court. The paddle must contact the ball below your waist. The serve must clear the net and land beyond the opponent's kitchen (non-volley zone).",
      },
      {
        step: 2,
        title: "Return the Serve",
        description:
          "The receiving team must let the serve bounce once before returning it. This is the first bounce of the two-bounce rule.",
      },
      {
        step: 3,
        title: "Two-Bounce Rule",
        description:
          "After the return, the serving team must also let the ball bounce once before hitting it. After these two bounces, both teams can volley (hit the ball out of the air) or play off the bounce.",
      },
      {
        step: 4,
        title: "Rally and Score",
        description:
          "Hit the ball back and forth over the net. Points are scored by the serving team when the opposing team commits a fault (hits the ball out, into the net, or violates a rule).",
      },
      {
        step: 5,
        title: "Kitchen Rule",
        description:
          "You cannot volley (hit the ball without it bouncing) while standing in the kitchen — the 7-foot zone on each side of the net. You can enter the kitchen to play a ball that has bounced.",
      },
      {
        step: 6,
        title: "Win the Game",
        description:
          "Games are typically played to 11 points, win by 2. In tournament play, games may go to 15 or 21.",
      },
    ],
    scoring: {
      system: "Rally scoring to 11, win by 2",
      explanation:
        "In traditional pickleball, only the serving team can score points. In rally scoring (increasingly popular), either team can score on any rally. In doubles, each player on a team gets to serve before the serve passes to the other team (except at the start of the game, where only one player serves). The score is called as three numbers: serving team's score, receiving team's score, and server number (1 or 2).",
      examples: [
        {
          scenario: "Server calls '4-2-1'",
          score:
            "Serving team has 4 points, receiving team has 2 points, server #1 is serving",
        },
        {
          scenario: "Server calls '7-7-2'",
          score:
            "Both teams tied at 7, server #2 is serving (if they lose the rally, serve goes to other team)",
        },
        {
          scenario: "Score reaches 10-10",
          score: "Game continues — must win by 2 (e.g., 12-10, 13-11)",
        },
      ],
      tips: [
        "Only the serving team scores in traditional rules",
        "Always call the score before serving — it's required",
        "Server #1 starts from the right side of the court",
        "At the start of the game, only one player serves for the first serving team",
      ],
    },
    rules: [
      {
        rule: "Two-Bounce Rule",
        explanation:
          "The ball must bounce once on each side before volleys are allowed. The serve must bounce, then the return must bounce. After that, volleys are fair game.",
      },
      {
        rule: "Non-Volley Zone (Kitchen)",
        explanation:
          "The 7-foot zone on each side of the net is the kitchen. You cannot volley while standing in this zone or on its line. If your momentum carries you into the kitchen after a volley, it's a fault.",
      },
      {
        rule: "Underhand Serve",
        explanation:
          "The serve must be made underhand with the paddle contacting the ball below the waist. The serve must be diagonal and clear the kitchen line.",
      },
      {
        rule: "Faults",
        explanation:
          "A fault occurs when: the ball is hit out of bounds, doesn't clear the net, is volleyed from the kitchen, or the serve lands in the kitchen. A fault by the serving team results in a side-out (serve goes to the other team).",
      },
      {
        rule: "Line Calls",
        explanation:
          "A ball landing on any line is IN, except the kitchen line on a serve, which is OUT. Players are responsible for calling lines on their own side.",
      },
      {
        rule: "Double Bounce on Serve",
        explanation:
          "If the serve hits the net and lands in the correct service court, it's a let and is replayed. If it hits the net and goes out or into the kitchen, it's a fault.",
      },
    ],
    beginnerTips: [
      "Master the dink — a soft shot that arcs just over the net into the opponent's kitchen. This is the most important shot in pickleball.",
      "Get to the kitchen line as fast as you can after serving or returning. The team that controls the kitchen line usually wins.",
      "Patience wins games. Don't try to slam every ball — wait for the right opportunity.",
      "Keep your paddle up and ready between shots. A \"ready position\" with the paddle at chest height helps you react quickly.",
      "Aim for your opponent's feet. Low shots are hard to return with power.",
      "Communicate with your doubles partner. Call 'mine' or 'yours' to avoid confusion.",
      "Practice the third shot drop — the shot after the return. A soft drop into the kitchen lets you move forward to the net.",
    ],
    etiquette: [
      "Call the score clearly before every serve — all three numbers",
      "Tap paddles with your opponents before and after the game (like a handshake)",
      "Don't slam the ball when your opponent isn't ready",
      "Call 'out' balls promptly and honestly — give your opponent the benefit of the doubt",
      "Return stray balls to the correct court by rolling them under the net",
      "Wait for play to stop on adjacent courts before retrieving a ball that has rolled over",
      "Compliment good shots — 'nice shot' or 'good rally' keeps the mood positive",
    ],
    funFacts: [
      "Pickleball was invented in 1965 by three dads — Joel Pritchard, Bill Bell, and Barney McCallum — on Bainbridge Island, Washington.",
      "The name might come from the Pritchard family's dog 'Pickles,' or from the term 'pickle boat' in rowing (a crew made up of leftover players).",
      "Pickleball is the fastest-growing sport in America for the third year running, with over 48 million players.",
      "The longest recorded pickleball rally lasted 16,046 consecutive hits over 6+ hours.",
    ],
    difficulty: "Easy to Learn",
    typicalDuration: "15-25 minutes per game",
    playersNeeded: "2 (singles) or 4 (doubles)",
  },

  lawn_bowling: {
    sport: "lawn_bowling",
    emoji: "\u{1F3B3}",
    name: "Lawn Bowling",
    tagline: "An ancient game of precision, strategy, and bias",
    overview:
      "Lawn bowling (also called bowls) is one of the world's oldest sports, dating back thousands of years. Players roll biased bowls (not perfectly round) toward a small white target ball called the jack. The bias causes the bowls to curve as they slow down, adding a fascinating element of strategy and skill.\n\nUnlike many sports, lawn bowling rewards finesse over power. The game is played on a flat, closely-mown grass surface called a green, divided into individual lanes called rinks. It's a wonderfully social sport that welcomes players of all ages and abilities — from casual afternoon games to fiercely competitive tournaments.",
    equipment: [
      {
        name: "Bowls",
        description:
          "Biased balls that are slightly flattened, causing them to curve as they lose speed. Each player uses 4 bowls (2 in some formats). They come in various sizes to fit your hand.",
        icon: "\u{26AB}",
      },
      {
        name: "Jack",
        description:
          "A small white or yellow target ball. The jack is rolled first to set the target for each end.",
        icon: "\u{26AA}",
      },
      {
        name: "Mat",
        description:
          "A small rubber mat placed on the rink. All bowls must be delivered with one foot on the mat.",
        icon: "\u{1F7E9}",
      },
      {
        name: "Flat-Soled Shoes",
        description:
          "Smooth, flat-soled shoes are required to protect the green. Heeled or cleated shoes will damage the playing surface.",
        icon: "\u{1F45F}",
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

  tennis: {
    sport: "tennis",
    emoji: "\u{1F3BE}",
    name: "Tennis",
    tagline: "The classic racket sport — power, finesse, and fierce competition",
    overview:
      "Tennis is one of the world's most popular and storied racket sports. Played on a rectangular court with a net in the middle, players use strung rackets to hit a felt-covered rubber ball back and forth. The game can be played as singles (one vs. one) or doubles (two vs. two).\n\nTennis combines explosive power with delicate touch, demanding speed, agility, and mental toughness. From baseline rallies to serve-and-volley tactics, the sport offers endless strategic depth. Whether you're playing a casual set with friends or competing in a local league, tennis provides an outstanding full-body workout and a lifetime of enjoyment.",
    equipment: [
      {
        name: "Racket",
        description:
          "A strung frame used to hit the ball. Rackets come in different sizes, weights, and string tensions. Beginners should choose a lighter racket with a larger head.",
        icon: "\u{1F3BE}",
      },
      {
        name: "Tennis Balls",
        description:
          "Pressurized felt-covered rubber balls. New balls have more bounce; they gradually lose pressure over time.",
        icon: "\u{1F7E1}",
      },
      {
        name: "Court",
        description:
          "A 78-foot long by 27-foot wide (singles) or 36-foot wide (doubles) rectangular court. Surfaces include hard court, clay, and grass.",
        icon: "\u{1F3DF}\u{FE0F}",
      },
      {
        name: "Court Shoes",
        description:
          "Tennis-specific shoes with lateral support, durability on the toe, and a non-marking sole. Running shoes lack the side-to-side support needed.",
        icon: "\u{1F45F}",
      },
    ],
    courtDiagram: "tennis",
    howToPlay: [
      {
        step: 1,
        title: "Serve to Start",
        description:
          "Stand behind the baseline on the right side (deuce court). Toss the ball up and hit it over the net into the diagonally opposite service box. You get two attempts — if both miss, it's a double fault and your opponent wins the point.",
      },
      {
        step: 2,
        title: "Return the Serve",
        description:
          "The receiver stands on the opposite side and must return the serve after it bounces once in the service box. After the return, the ball can be hit before or after it bounces (except on the serve).",
      },
      {
        step: 3,
        title: "Rally",
        description:
          "Players hit the ball back and forth over the net. The ball must land within the court boundaries (singles or doubles lines, depending on the format). A point ends when someone hits the ball into the net, out of bounds, or fails to return it.",
      },
      {
        step: 4,
        title: "Score Points",
        description:
          "Points follow an unusual sequence: 0 (love), 15, 30, 40, then game. If both players reach 40 (deuce), one player must win two consecutive points to take the game.",
      },
      {
        step: 5,
        title: "Win Sets and the Match",
        description:
          "Win 6 games (with at least a 2-game lead) to win a set. If it reaches 6-6, a tiebreak is played. Win 2 out of 3 sets (or 3 out of 5 in Grand Slams) to win the match.",
      },
    ],
    scoring: {
      system: "Love-15-30-40-Game, sets to 6, match best of 3",
      explanation:
        "Tennis uses a unique scoring system. Points within a game go: love (0), 15, 30, 40. If both players reach 40, it's called 'deuce.' From deuce, a player must win two consecutive points — the first gives them 'advantage,' and the second wins the game. Six games win a set (must lead by 2), and most matches are best of 3 sets.",
      examples: [
        {
          scenario: "Server has won 2 points, receiver 1 point",
          score: "30-15 (server's score is always called first)",
        },
        {
          scenario: "Both players have won 3 points each",
          score:
            "Deuce (40-40) — next point gives 'advantage' to the winner",
        },
        {
          scenario: "Player A leads 5-4 in games, wins the next game",
          score:
            "Player A wins the set 6-4",
        },
        {
          scenario: "Games are tied 6-6",
          score:
            "Tiebreak: first to 7 points (win by 2), alternating serves every 2 points",
        },
      ],
      tips: [
        "The server's score is always called first",
        "Tiebreak scoring uses regular numbers (1, 2, 3...) not the love/15/30/40 system",
        "In a tiebreak, players switch sides every 6 points",
        "Some casual matches use 'no-ad' scoring — at deuce, the next point wins the game",
      ],
    },
    rules: [
      {
        rule: "Serve Rules",
        explanation:
          "You must serve from behind the baseline, alternating between the deuce (right) and ad (left) courts each point. The ball must land in the diagonally opposite service box. You get two attempts per point.",
      },
      {
        rule: "Let Serve",
        explanation:
          "If the serve clips the net but still lands in the correct service box, it's a 'let' and the serve is replayed. There's no limit on the number of lets.",
      },
      {
        rule: "In or Out",
        explanation:
          "A ball that hits any part of the line is IN. In professional tennis, electronic line-calling is used. In recreational play, players call lines on their own side of the net.",
      },
      {
        rule: "Net Play",
        explanation:
          "You cannot reach over the net to hit the ball — the ball must cross to your side first. You also cannot touch the net or the net post with your body, racket, or clothing during a point.",
      },
      {
        rule: "Double Bounce",
        explanation:
          "If the ball bounces twice on your side before you hit it, you lose the point. You can hit the ball before it bounces (a volley) at any time after the serve return.",
      },
      {
        rule: "Switching Sides",
        explanation:
          "Players switch ends of the court after every odd-numbered game (1, 3, 5, etc.) to account for sun, wind, and court conditions.",
      },
    ],
    beginnerTips: [
      "Focus on consistency over power. Getting the ball in play is more important than hitting winners.",
      "Move your feet! Good footwork is the foundation of every great shot. Get to the ball early.",
      "Watch the ball all the way onto your racket strings. Most errors come from taking your eye off the ball.",
      "Practice your serve — it's the only shot you have complete control over. Develop a reliable second serve.",
      "Learn the continental grip for serves and volleys, and the eastern or semi-western grip for groundstrokes.",
      "Hit cross-court as your default shot — it gives you more court to aim at and keeps the ball lower over the net.",
      "Recover to the center of the baseline after each shot (or the center of possible returns) to cover the most court.",
    ],
    etiquette: [
      "Call 'out' clearly and promptly for balls landing on your side — give your opponent the benefit of the doubt",
      "Return balls to the server by hitting them gently to their side, not randomly",
      "Wait for play to finish on adjacent courts before walking behind them to retrieve a ball",
      "Shake hands at the net after the match and thank your opponent",
      "Don't make excessive noise or throw your racket — respect the game and your opponent",
      "If you're unsure about a line call, play the point over or call it in for your opponent",
      "Keep score out loud and agree on the score before each point if there's any confusion",
    ],
    funFacts: [
      "The term 'love' for zero likely comes from the French word 'l'oeuf' (egg), because an egg looks like a zero.",
      "The fastest serve ever recorded was 163.7 mph (263.4 km/h) by Sam Groth in 2012.",
      "The longest tennis match in history lasted 11 hours and 5 minutes — John Isner vs Nicolas Mahut at Wimbledon in 2010, with a final score of 6-4, 3-6, 6-7, 7-6, 70-68.",
      "Tennis was one of the original sports in the first modern Olympic Games in 1896 in Athens.",
    ],
    difficulty: "Moderate",
    typicalDuration: "30-90 minutes per match",
    playersNeeded: "2 (singles) or 4 (doubles)",
  },
  badminton: {
    sport: "badminton",
    emoji: "\u{1F3F8}",
    name: "Badminton",
    tagline: "Fast reflexes, light rackets, and a shuttlecock that can fly over 200 mph",
    overview:
      "Badminton is a racquet sport played with a lightweight shuttlecock over a net. It can be played as singles or doubles. The game demands quick reflexes, agility, and strategic shot placement. Badminton is one of the most popular sports worldwide and has been an Olympic sport since 1992.",
    equipment: [
      { name: "Racket", description: "A lightweight racket (80-100g) with a strung head.", icon: "racket" },
      { name: "Shuttlecock", description: "A feathered or synthetic projectile hit back and forth over the net.", icon: "shuttlecock" },
      { name: "Court Shoes", description: "Non-marking shoes with good grip for quick lateral movement.", icon: "shoes" },
    ],
    courtDiagram: "badminton-court",
    howToPlay: [
      { step: 1, title: "Serve", description: "Serve diagonally underhand from below the waist." },
      { step: 2, title: "Rally", description: "Hit the shuttlecock back and forth over the net." },
      { step: 3, title: "Score", description: "Score a point when the opponent fails to return the shuttlecock." },
    ],
    scoring: {
      system: "Rally Scoring to 21",
      explanation: "A point is scored on every rally. Games are played to 21 points with a 2-point lead required. Best of 3 games wins the match.",
      examples: [
        { scenario: "Opponent fails to return shuttlecock", score: "You score 1 point" },
        { scenario: "Shuttlecock lands out of bounds on your hit", score: "Opponent scores 1 point" },
      ],
      tips: ["At 20-20, play continues until one side leads by 2 points.", "At 29-29, the next point wins."],
    },
    rules: [
      { rule: "Underhand Serve", explanation: "The serve must be hit below the server's waist with the racket pointing downward." },
      { rule: "Rally Scoring", explanation: "A point is scored on every serve, regardless of who served." },
      { rule: "In/Out", explanation: "The shuttlecock must land within the court boundaries. Lines are in." },
      { rule: "Net Play", explanation: "Players must not touch the net with their body or racket during play." },
    ],
    beginnerTips: [
      "Focus on footwork — good positioning beats power.",
      "Use a variety of shots: clears, drops, smashes, and net shots.",
      "Return to center court after each shot.",
    ],
    etiquette: [
      "Shake hands or tap rackets before and after each match.",
      "Call shuttlecocks in or out honestly.",
      "Wait for opponents to be ready before serving.",
    ],
    funFacts: [
      "A badminton smash can exceed 200 mph, making it the fastest racquet sport.",
      "The modern game originated in British India in the 19th century.",
    ],
    difficulty: "Moderate",
    typicalDuration: "20-45 minutes per match",
    playersNeeded: "2 (singles) or 4 (doubles)",
  },
  racquetball: {
    sport: "racquetball",
    emoji: "\u{1F3BE}",
    name: "Racquetball",
    tagline: "Fast-paced indoor action with walls in play",
    overview:
      "Racquetball is played in an enclosed court where the ball can bounce off any wall. It combines elements of handball and squash, providing an intense cardiovascular workout. The enclosed court makes for fast, dynamic rallies that keep players moving.",
    equipment: [
      { name: "Racquet", description: "A short-handled racquet with a wrist strap (required for safety).", icon: "racket" },
      { name: "Ball", description: "A hollow rubber ball designed for indoor court play.", icon: "ball" },
      { name: "Goggles", description: "Protective eyewear is required in competitive play.", icon: "goggles" },
    ],
    courtDiagram: "racquetball-court",
    howToPlay: [
      { step: 1, title: "Serve", description: "Bounce the ball and hit it to the front wall so it lands behind the short line." },
      { step: 2, title: "Rally", description: "Hit the ball to the front wall before it bounces twice on the floor." },
      { step: 3, title: "Score", description: "Only the server can score points. Games are played to 15." },
    ],
    scoring: {
      system: "Side-Out Scoring to 15",
      explanation: "Only the server can score points. If the server loses a rally, the serve passes to the opponent. Matches are best of 3 games (15, 15, 11 for tiebreaker).",
      examples: [
        { scenario: "Server wins the rally", score: "Server scores 1 point" },
        { scenario: "Receiver wins the rally", score: "Side out — receiver now serves" },
      ],
      tips: ["The tiebreaker third game is played to 11 points.", "There is no win-by-2 rule in racquetball."],
    },
    rules: [
      { rule: "Front Wall Serve", explanation: "The ball must hit the front wall first on a serve and land behind the short line." },
      { rule: "Wall Play", explanation: "The ball can bounce off any wall during a rally, but must hit the front wall before the floor." },
      { rule: "Side-Out Scoring", explanation: "Only the server scores points. Losing a rally as server means a side-out." },
      { rule: "Hinders", explanation: "If a player obstructs an opponent's shot, a hinder is called and the rally is replayed." },
    ],
    beginnerTips: [
      "Control center court for the best positioning.",
      "Use ceiling shots to reset rallies.",
      "Always wear protective eyewear.",
    ],
    etiquette: [
      "Give your opponent room to hit — avoid blocking shots.",
      "Call hinders (obstructions) fairly.",
      "Wear proper court shoes with non-marking soles.",
    ],
    funFacts: [
      "Racquetball was invented in 1950 by Joe Sobek, a professional handball and tennis player.",
      "The ball can travel over 150 mph off the front wall.",
    ],
    difficulty: "Moderate",
    typicalDuration: "20-45 minutes per match",
    playersNeeded: "2 (singles) or 4 (doubles)",
  },
  flag_football: {
    sport: "flag_football",
    emoji: "\u{1F3C8}",
    name: "Flag Football",
    tagline: "All the strategy of football without the tackles",
    overview:
      "Flag football is a non-contact version of American football where instead of tackling, defensive players pull flags from the ball carrier's belt. It emphasizes speed, agility, and passing, making it accessible to a wide range of ages and skill levels. Flag football will debut as an Olympic sport at the 2028 Los Angeles Games.",
    equipment: [
      { name: "Flag Belt", description: "A belt with detachable flags worn by each player.", icon: "belt" },
      { name: "Football", description: "A standard or youth-size football.", icon: "football" },
      { name: "Cleats", description: "Athletic shoes with cleats for traction on grass or turf.", icon: "shoes" },
    ],
    courtDiagram: "flag-football-field",
    howToPlay: [
      { step: 1, title: "Snap", description: "The center snaps the ball to the quarterback." },
      { step: 2, title: "Pass or Run", description: "The quarterback throws to a receiver or hands off the ball." },
      { step: 3, title: "Score", description: "Reach the end zone for a touchdown (6 points)." },
    ],
    scoring: {
      system: "Touchdowns and Extra Points",
      explanation: "A touchdown is worth 6 points. After a touchdown, teams attempt an extra point (1 point from the 5-yard line, or 2 points from the 10-yard line). Some leagues also allow safeties (2 points).",
      examples: [
        { scenario: "Ball carrier reaches end zone", score: "Touchdown — 6 points" },
        { scenario: "Extra point conversion from 5 yards", score: "1 additional point" },
      ],
      tips: ["Some leagues play with a running clock to keep games moving.", "Interceptions returned for touchdowns are common game-changers."],
    },
    rules: [
      { rule: "No Contact", explanation: "No tackling, blocking, or physical contact is allowed." },
      { rule: "Flag Pull", explanation: "A play ends when a defender pulls the ball carrier's flag from their belt." },
      { rule: "Team Size", explanation: "Teams typically have 5 or 7 players per side on the field." },
      { rule: "First Downs", explanation: "First downs are earned by crossing midfield or specific yard markers." },
    ],
    beginnerTips: [
      "Communication is key — call out assignments before the snap.",
      "Quick cuts and changes of direction beat speed alone.",
      "Practice flag pulling technique to make clean defensive stops.",
    ],
    etiquette: [
      "Play with good sportsmanship — no contact means no excuses.",
      "Respect the referee's calls.",
      "Shake hands with the opposing team after the game.",
    ],
    funFacts: [
      "Flag football will be an Olympic sport starting at the 2028 LA Games.",
      "Over 20 million people play flag football in the United States.",
    ],
    difficulty: "Easy to Learn",
    typicalDuration: "40-60 minutes per game",
    playersNeeded: "10-14 (5v5 or 7v7)",
  },
};

export function getGuide(sport: string): SportGuide | undefined {
  return SPORT_GUIDES[sport as Sport];
}

export function getAllGuides(): SportGuide[] {
  return Object.values(SPORT_GUIDES);
}
