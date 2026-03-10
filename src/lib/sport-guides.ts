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
    tagline: "The fastest racket sport in the world",
    overview:
      "Badminton is a racket sport played with a shuttlecock (also called a birdie) across a high net. With roots tracing back over 2,000 years to ancient civilizations in Europe and Asia, the modern game was formalized in British India during the 19th century and named after the Duke of Beaufort's Badminton House in Gloucestershire, England. Today it is one of the most popular sports worldwide, with an estimated 220 million people playing regularly.\n\nWhat makes badminton unique is the shuttlecock itself \u2014 its feathered (or synthetic) design creates enormous drag, meaning the birdie decelerates rapidly after being struck. This produces a game of dramatic contrasts: explosive smashes that launch the shuttlecock at over 300 mph off the racket, followed by delicate net shots that barely clear the tape. The sport demands lightning reflexes, exceptional footwork, and both power and finesse. Whether played casually in a backyard or competitively on an indoor court, badminton is accessible, fast-paced, and addictively fun.\n\nBadminton became an Olympic sport in 1992 at the Barcelona Games. It is particularly dominant in Asian countries, with China, Indonesia, Japan, and South Korea producing many of the world's top players. The sport can be played as singles or doubles, with mixed doubles being one of the most exciting formats to watch and play.",
    equipment: [
      {
        name: "Shuttlecock (Birdie)",
        description:
          "A projectile with a cork base and feathered or synthetic skirt. Feathered shuttlecocks are used in competitive play; nylon ones are more durable for recreational use.",
        icon: "\u{1F3F8}",
      },
      {
        name: "Racket",
        description:
          "A lightweight racket (typically 75\u201395 grams) with a thin, tightly-strung frame. Much lighter than tennis rackets, allowing for quick wrist action.",
        icon: "\u{1F3F8}",
      },
      {
        name: "Net",
        description:
          "The net stands 5 feet 1 inch (1.55m) high at the edges and 5 feet (1.524m) at the center. It divides the court in half.",
        icon: "\u{1F3D0}",
      },
      {
        name: "Court Shoes",
        description:
          "Non-marking indoor court shoes with good grip and lateral support. Badminton involves constant lunging and quick direction changes.",
        icon: "\u{1F45F}",
      },
      {
        name: "Comfortable Clothing",
        description:
          "Lightweight, breathable athletic clothing that allows full range of motion. Badminton is an intense cardio workout.",
        icon: "\u{1F455}",
      },
    ],
    courtDiagram: "badminton",
    howToPlay: [
      {
        step: 1,
        title: "Serve the Shuttlecock",
        description:
          "Stand in your service court and hit the shuttlecock underhand diagonally to the opponent's service court. The racket must contact the birdie below your waist, and the entire shuttlecock must be below 1.15 meters at the point of contact.",
      },
      {
        step: 2,
        title: "Return and Rally",
        description:
          "The receiver hits the shuttlecock back over the net. Unlike tennis, the shuttlecock cannot bounce \u2014 it must be struck in the air. Players rally back and forth, keeping the birdie in play.",
      },
      {
        step: 3,
        title: "Use Different Shots",
        description:
          "Develop a repertoire of shots: clears (high and deep), drops (soft shots just over the net), smashes (powerful downward shots), drives (fast and flat), and net shots (delicate plays at the net).",
      },
      {
        step: 4,
        title: "Move to Position",
        description:
          "After each shot, return to your base position in the center of the court. Good footwork is essential \u2014 use a six-point movement pattern to cover all corners efficiently.",
      },
      {
        step: 5,
        title: "Win the Rally",
        description:
          "A rally ends when the shuttlecock hits the ground, goes into the net, lands out of bounds, or a fault is committed. The winner of the rally scores a point regardless of who served.",
      },
      {
        step: 6,
        title: "Score to 21",
        description:
          "Games are played to 21 points using rally scoring. You must win by 2 points. If the score reaches 29-all, the next point wins. Matches are best of 3 games.",
      },
      {
        step: 7,
        title: "Switch Sides",
        description:
          "Players switch ends after each game and when the leading score reaches 11 in the third game. In doubles, service alternates between all four players following a specific rotation.",
      },
    ],
    scoring: {
      system: "Rally point scoring to 21, best of 3 games",
      explanation:
        "Badminton uses rally point scoring, meaning a point is awarded on every rally regardless of which side served. Games are played to 21 points. If the score is tied at 20-all, play continues until one side has a 2-point lead (e.g., 22-20, 23-21). If the score reaches 29-all, the next point wins the game. A match is best of 3 games. The side winning a rally adds a point to its score and serves in the next rally.",
      examples: [
        {
          scenario: "Server wins the rally at 15-12",
          score: "Server scores, now leading 16-12. Server continues to serve.",
        },
        {
          scenario: "Receiver wins the rally at 18-20",
          score: "Receiver scores, now 19-20. Receiver takes over the serve.",
        },
        {
          scenario: "Score reaches 20-20",
          score: "Play continues until someone leads by 2 (e.g., 22-20) or the score reaches 30-29.",
        },
      ],
      tips: [
        "Every rally earns a point \u2014 there is no side-out scoring",
        "The serving side switches service courts after each point they score",
        "In doubles, only one player serves per service turn (not both like in pickleball)",
        "At 20-all, you must win by 2 up to a cap of 30",
      ],
    },
    rules: [
      {
        rule: "Underhand Serve Below the Waist",
        explanation:
          "The serve must be hit underhand with the racket head below the server's hand. The entire shuttlecock must be below 1.15 meters from the court surface at the instant of being hit. The serve must travel diagonally to the opponent's service court.",
      },
      {
        rule: "Shuttlecock Cannot Bounce",
        explanation:
          "Unlike tennis or pickleball, the shuttlecock must be hit before it touches the ground. If the birdie hits the floor on your side, the rally is lost.",
      },
      {
        rule: "Service Court Rules",
        explanation:
          "When the server's score is even, they serve from the right court. When odd, from the left court. In doubles, the same rule applies, and the server alternates courts based on the serving side's score.",
      },
      {
        rule: "Faults",
        explanation:
          "A fault occurs when: the shuttlecock lands out of bounds, goes through or under the net, a player touches the net with their body or racket, the shuttlecock is hit twice in succession by the same side, or the serve is illegal.",
      },
      {
        rule: "Lets",
        explanation:
          "A let is called when the server serves before the receiver is ready, both sides commit a fault simultaneously, or the shuttlecock gets caught on top of the net after passing over it on a serve. The rally is replayed.",
      },
      {
        rule: "Court Boundaries",
        explanation:
          "In singles, the long and narrow court is used (inner sidelines, full length including back tramlines). In doubles, the full width is used but serves must land within the short service line to the back boundary line.",
      },
      {
        rule: "Net Contact",
        explanation:
          "Players cannot touch the net or its supports with their body, racket, or clothing during a rally. You may reach over the net to follow through on a shot, but you cannot strike the shuttlecock on the opponent's side.",
      },
      {
        rule: "Doubles Rotation",
        explanation:
          "In doubles, only the serving side switches courts when they score. The receiving side does not change positions. When the serving side loses a rally, the serve passes to the other team.",
      },
      {
        rule: "Obstructing an Opponent",
        explanation:
          "Players cannot obstruct an opponent from making a legal shot at the shuttlecock. Deliberately distracting or blocking an opponent results in a fault.",
      },
    ],
    beginnerTips: [
      "Focus on your footwork first \u2014 being in the right position is more important than hitting hard. Use small, quick steps to recover to center court after every shot.",
      "Hold the racket with a relaxed grip. A death grip kills your wrist action, which is where most of badminton's power comes from.",
      "Learn the basic grip: the forehand grip (like shaking hands with the racket) and the backhand grip (rotating the thumb onto the flat side of the handle).",
      "Master the clear (high, deep shot to the back of the court) first. It gives you time to recover and is the foundation of rallying.",
      "Always return to the center of the court after playing a shot. This gives you the best coverage of the court.",
      "Aim for accuracy over power. A well-placed drop shot is more effective than a poorly aimed smash.",
      "Watch the shuttlecock all the way onto your racket. Keep your non-racket arm up for balance.",
      "Practice your serve until it is consistent and accurate. A good serve sets up the rally in your favor.",
    ],
    etiquette: [
      "Shake hands or tap rackets with your opponent before and after the match",
      "Return the shuttlecock to the server by hitting it gently to their side, not randomly across the court",
      "Call faults on yourself honestly \u2014 if you touched the net or hit the birdie into your body, own it",
      "Do not celebrate excessively on your opponent's errors \u2014 save celebrations for your own good shots",
      "Wait until the rally is over before retrieving a shuttlecock from an adjacent court",
      "Compliment your opponent's good shots \u2014 a simple nod or 'nice shot' goes a long way",
    ],
    funFacts: [
      "The fastest recorded badminton smash reached 306 mph (493 km/h), hit by Tan Boon Heong of Malaysia in a controlled test \u2014 making it the fastest racket sport in the world by initial racket-to-shuttlecock speed.",
      "Badminton became an official Olympic sport in 1992 at the Barcelona Games. It has been dominated by Asian nations, with China winning the most gold medals.",
      "A shuttlecock has 16 feathers, and top-level feathered shuttlecocks are made from the left wing feathers of a goose. Each bird contributes feathers for only a few birdies.",
      "The longest badminton rally in a competitive match lasted 108 shots \u2014 between Taufik Hidayat and Lee Chong Wei at the 2005 All England Open.",
      "An estimated 220 million people play badminton worldwide, making it the second most popular participation sport in the world after soccer.",
    ],
    difficulty: "Moderate",
    typicalDuration: "20-45 min/match",
    playersNeeded: "2 (singles) or 4 (doubles)",
  },

  racquetball: {
    sport: "racquetball",
    emoji: "\u{1F3BE}",
    name: "Racquetball",
    tagline: "Fast-paced, high-energy indoor racket sport",
    overview:
      "Racquetball is a high-speed indoor racket sport played in an enclosed four-walled court. Unlike tennis or badminton, every wall, the floor, and even the ceiling are in play, creating a fast-paced, three-dimensional game where the ball ricochets unpredictably and rallies are intense. The sport provides one of the best cardiovascular workouts in all of athletics, burning up to 800 calories per hour.\n\nInvented in 1950 by Joe Sobek, a professional handball and tennis player from Greenwich, Connecticut, racquetball was originally called \"paddle rackets.\" Sobek designed a strung racket and a bouncy rubber ball that could be played on existing handball courts. The sport exploded in popularity during the 1970s and 1980s, with dedicated racquetball clubs opening across the United States. Today, there are approximately 5.6 million players in the US alone.\n\nThe beauty of racquetball lies in its simplicity and accessibility. The basic rules are easy to learn, and because the ball bounces off walls, rallies last longer than in many other racket sports. This makes it satisfying for beginners while offering tremendous depth for advanced players who can read wall angles and execute ceiling shots, kill shots, and passing shots with precision.",
    equipment: [
      {
        name: "Racquetball Racket",
        description:
          "A short-handled racket no longer than 22 inches. Modern rackets are made from graphite, aluminum, or composite materials and feature a wrist strap (required during play for safety).",
        icon: "\u{1F3BE}",
      },
      {
        name: "Racquetball",
        description:
          "A hollow, pressurized rubber ball approximately 2.25 inches in diameter. Balls come in different colors indicating speed: blue (standard), green (slower for beginners), red/black (faster for advanced play).",
        icon: "\u{26AA}",
      },
      {
        name: "Protective Eyewear",
        description:
          "Safety goggles or sport glasses are REQUIRED during play. The ball travels at speeds over 100 mph in the enclosed court, making eye protection essential.",
        icon: "\u{1F97D}",
      },
      {
        name: "Court Shoes",
        description:
          "Non-marking indoor court shoes with good cushioning and lateral support. The quick direction changes demand supportive footwear.",
        icon: "\u{1F45F}",
      },
      {
        name: "Glove (Optional)",
        description:
          "A racquetball glove worn on the racket hand improves grip and reduces blisters. Most regular players wear one.",
        icon: "\u{1F9E4}",
      },
    ],
    courtDiagram: "racquetball",
    howToPlay: [
      {
        step: 1,
        title: "Serve the Ball",
        description:
          "Stand in the service zone (between the short line and the service line). Drop the ball, let it bounce once, then hit it toward the front wall. The ball must hit the front wall first and then bounce past the short line before the receiver can return it.",
      },
      {
        step: 2,
        title: "Return the Serve",
        description:
          "The receiver stands behind the receiving line and must return the ball after it crosses the short line. The ball may bounce once off the floor before being returned, or it can be hit in the air (a volley).",
      },
      {
        step: 3,
        title: "Rally Using the Walls",
        description:
          "Hit the ball so it reaches the front wall before touching the floor. The ball can hit any number of side walls, back wall, or ceiling before or after hitting the front wall. This is what makes racquetball unique \u2014 every surface is in play.",
      },
      {
        step: 4,
        title: "Win the Rally",
        description:
          "A rally ends when a player fails to return the ball to the front wall before it bounces twice on the floor, hits themselves with the ball, or commits a fault. Only the server can score a point.",
      },
      {
        step: 5,
        title: "Master Key Shots",
        description:
          "Learn the essential shots: the drive serve (low and fast), ceiling shot (defensive, sends ball high to back wall), kill shot (low to front wall, barely bounces), and passing shot (drives ball past your opponent).",
      },
      {
        step: 6,
        title: "Control Center Court",
        description:
          "After each shot, try to return to center court position (slightly behind the short line). The player who controls center court controls the game by having the best angles to all areas.",
      },
      {
        step: 7,
        title: "Win the Game",
        description:
          "Games 1 and 2 are played to 15 points. If a third game (tiebreaker) is needed, it is played to 11. Only the server can score. A match is best of 3 games.",
      },
    ],
    scoring: {
      system: "Side-out scoring to 15 (games 1 & 2), tiebreaker to 11, best of 3",
      explanation:
        "Racquetball uses side-out scoring, meaning only the serving player or team can score points. If the receiver wins the rally, they gain the serve (a \"side-out\") but do not score a point. The first two games are played to 15 points (no win-by-2 required). If the match is split 1-1, a tiebreaker third game is played to 11 points.",
      examples: [
        {
          scenario: "Server wins the rally at 8-5",
          score: "Server scores, now leads 9-5. Server continues to serve.",
        },
        {
          scenario: "Receiver wins the rally at 12-10",
          score: "No point scored \u2014 it is a side-out. Receiver now becomes the server at 10-12.",
        },
        {
          scenario: "Tiebreaker third game at 10-9",
          score: "Next point by the server wins the game (no win-by-2 needed).",
        },
      ],
      tips: [
        "Only the server scores points \u2014 winning a rally as receiver just earns you the serve",
        "No win-by-2 is required in racquetball \u2014 first to 15 (or 11 in tiebreaker) wins",
        "In doubles, each player on the serving team serves before a side-out (except the first service of the game)",
        "Keep track of the score verbally before each serve",
      ],
    },
    rules: [
      {
        rule: "Serve Must Hit Front Wall First",
        explanation:
          "On the serve, the ball must hit the front wall first before touching any other surface. After hitting the front wall, the ball must cross the short line before bouncing on the floor. The server gets two serve attempts per rally.",
      },
      {
        rule: "Short Serve",
        explanation:
          "A serve that hits the front wall but bounces on the floor before crossing the short line is a \"short serve\" and is a fault. Two faults result in a side-out.",
      },
      {
        rule: "Screen Serve",
        explanation:
          "If the served ball passes so close to the server that the receiver cannot see it clearly, it is a \"screen serve\" and is replayed. A screen serve counts as a fault in some rule sets.",
      },
      {
        rule: "Hinders",
        explanation:
          "A hinder occurs when a player unintentionally blocks an opponent's shot or movement. The rally is replayed. If the interference is avoidable (the player could have moved but didn't), it is a penalty hinder and the rally is awarded to the opponent.",
      },
      {
        rule: "Ball Must Reach Front Wall",
        explanation:
          "Every return must reach the front wall before bouncing on the floor. The ball may hit any combination of side walls, back wall, or ceiling before or after reaching the front wall.",
      },
      {
        rule: "One Bounce Maximum",
        explanation:
          "The ball may bounce on the floor only once before being returned. If the ball bounces twice, the rally is lost. Players may also hit the ball in the air (volley) before it bounces.",
      },
      {
        rule: "Ceiling Shots Are Legal",
        explanation:
          "Players may intentionally hit the ceiling, which sends the ball deep to the back of the court. This is a common defensive strategy to force the opponent out of center court.",
      },
      {
        rule: "Wrist Strap Required",
        explanation:
          "All players must wear the wrist strap attached to the racket handle during play. This prevents the racket from flying out of a player's hand and injuring opponents.",
      },
      {
        rule: "Eyewear Required",
        explanation:
          "Protective eyewear is mandatory in all sanctioned play. The ball can travel over 100 mph in the confined court, making eye protection critical for safety.",
      },
      {
        rule: "Out-of-Court Ball",
        explanation:
          "If the ball hits the front wall and then goes out of the court (above the back wall or through a court opening), it is a side-out or point loss depending on who hit it.",
      },
    ],
    beginnerTips: [
      "Always wear protective eyewear \u2014 this is not optional. The ball moves fast in an enclosed space and eye injuries are the most common safety concern.",
      "Focus on ceiling shots as your go-to defensive shot. Hitting the ceiling near the front wall sends the ball deep and gives you time to recover position.",
      "Control center court. After each shot, move back to a position slightly behind the short line in the center of the court. The player in center court dominates.",
      "Learn to read the walls. Start by watching how the ball bounces off one wall, then progress to multi-wall combinations. This is the unique skill in racquetball.",
      "Use a relaxed grip and snap your wrist through the ball. Power comes from wrist action, not from a stiff arm swing.",
      "Master the drive serve first \u2014 a low, hard serve to the back corner is the most effective basic serve.",
      "Move out of your opponent's way after hitting the ball. Give them a clear path to the ball and the front wall.",
      "Start with a blue ball (standard speed). Green balls are slower and great for learning, but most recreational games use blue.",
    ],
    etiquette: [
      "Always yield to your opponent when they are about to hit the ball \u2014 do not stand in their swing path or block their shot to the front wall",
      "Call hinders on yourself if you block your opponent's shot or movement, even if they don't ask for it",
      "Wear the wrist strap at all times \u2014 a loose racket in an enclosed court is dangerous",
      "Do not swing your racket recklessly near your opponent \u2014 controlled swings are safer in close quarters",
      "Shake hands before and after the match, and agree on the score before each serve",
      "If you hit your opponent with the ball during a rally, check that they are okay before continuing play",
    ],
    funFacts: [
      "Racquetball was invented in 1950 by Joe Sobek, who designed it as a fast-paced sport that could be played on existing handball courts with a strung racket.",
      "The ball can reach speeds of over 160 mph off the racket during professional play. In the enclosed court, this means reaction times are measured in fractions of a second.",
      "Every wall, the floor, and the ceiling are in play \u2014 making racquetball a truly three-dimensional sport unlike any other racket game.",
      "At its peak popularity in the 1980s, there were over 30,000 dedicated racquetball courts in the United States. The sport was once featured on ESPN prime time.",
      "Racquetball is played in over 90 countries and has been featured in the Pan American Games since 1995, with ongoing campaigns for Olympic inclusion.",
    ],
    difficulty: "Moderate",
    typicalDuration: "20-40 min/match",
    playersNeeded: "2 (singles) or 4 (doubles)",
  },

  flag_football: {
    sport: "flag_football",
    emoji: "\u{1F3C8}",
    name: "Flag Football",
    tagline: "All the strategy, none of the tackles",
    overview:
      "Flag football is the non-contact version of American football where instead of tackling the ball carrier, defenders pull a flag or flag belt from their waist to end the play. It preserves all the strategic depth of football \u2014 the route running, passing, play calling, and defensive scheming \u2014 while eliminating the physical collisions that make tackle football inaccessible to many people.\n\nThe sport has experienced explosive growth in recent years. NFL Flag, the league's official youth flag football program, has over 7 million participants. In a landmark moment for the sport, flag football was approved for inclusion in the 2028 Los Angeles Olympic Games, marking the first time any form of American football will be contested at the Olympics. This decision has accelerated the sport's international growth, with federations in over 100 countries now developing competitive flag football programs.\n\nFlag football is typically played 5-on-5 or 7-on-7 on a smaller field than tackle football. The reduced field size and player count create a fast, open game with more opportunities for every player to be involved. It is an outstanding co-ed sport, with many recreational leagues featuring mixed-gender teams. The rules are straightforward enough for newcomers to pick up quickly, while the strategic depth keeps experienced players engaged for years.",
    equipment: [
      {
        name: "Football",
        description:
          "A regulation or youth-sized American football. Smaller footballs are easier to throw and catch for beginners. Leagues typically provide game balls.",
        icon: "\u{1F3C8}",
      },
      {
        name: "Flag Belt",
        description:
          "A belt worn around the waist with two or three detachable flags. When a defender pulls a flag, the ball carrier is \"down.\" Flag belts are typically provided by the league.",
        icon: "\u{1F3F3}\u{FE0F}",
      },
      {
        name: "Cones / Markers",
        description:
          "Used to mark end zones, first-down lines, and no-run zones. Portable and easy to set up on any flat grass or turf field.",
        icon: "\u{1F6A9}",
      },
      {
        name: "Cleats (Optional)",
        description:
          "Rubber-molded cleats provide traction on grass fields. Many leagues allow turf shoes or athletic shoes as well. Metal cleats are typically not allowed.",
        icon: "\u{1F45F}",
      },
      {
        name: "Mouthguard (Optional)",
        description:
          "While flag football is non-contact, incidental collisions can happen. A mouthguard is recommended, and some leagues require them.",
        icon: "\u{1F9B7}",
      },
    ],
    courtDiagram: "flag_football",
    howToPlay: [
      {
        step: 1,
        title: "The Snap",
        description:
          "Each play begins with a snap. The center hikes the ball between their legs to the quarterback. In many flag football leagues, the snap can be made from the center to the QB directly (shotgun) or with the QB under center.",
      },
      {
        step: 2,
        title: "The Play Call",
        description:
          "Before the snap, the quarterback (or team captain) calls the play in the huddle. Receivers are assigned routes (patterns to run), and each player has a specific job on every play.",
      },
      {
        step: 3,
        title: "Pass or Run",
        description:
          "After the snap, the QB can throw the ball to a receiver or hand it off to a runner (if running is allowed). In many leagues, there are \"no-run zones\" near the end zone and first-down markers where the offense must pass.",
      },
      {
        step: 4,
        title: "Advance the Ball",
        description:
          "The offense tries to advance the ball down the field. They typically get 4 downs (attempts) to cross midfield for a first down, then 4 more downs to score a touchdown.",
      },
      {
        step: 5,
        title: "Pull the Flag",
        description:
          "Instead of tackling, defenders stop the ball carrier by pulling one of their flags from the flag belt. The play is dead at the spot where the flag was pulled. The ball carrier must make no attempt to guard or swat at their flags.",
      },
      {
        step: 6,
        title: "Score a Touchdown",
        description:
          "A touchdown is scored when a player carries or catches the ball in the opponent's end zone, worth 6 points. After a touchdown, the scoring team attempts an extra point conversion.",
      },
      {
        step: 7,
        title: "Extra Points",
        description:
          "After a touchdown, the team chooses to attempt a 1-point conversion from the 5-yard line or a 2-point conversion from the 10-yard line. This strategic choice can be the difference in close games.",
      },
      {
        step: 8,
        title: "Defense and Turnovers",
        description:
          "The defense tries to prevent the offense from scoring by pulling flags, intercepting passes, or forcing incomplete passes. An interception can be returned for a touchdown. There are no fumbles in flag football \u2014 the ball is dead where it hits the ground.",
      },
    ],
    scoring: {
      system: "Touchdown (6 pts), extra point (1 or 2 pts), safety (2 pts)",
      explanation:
        "Scoring in flag football mirrors tackle football with slight variations. A touchdown is worth 6 points. After scoring, teams choose between a 1-point conversion attempt from the 5-yard line or a 2-point attempt from the 10-yard line. A safety (defensive team pulls the flag of a ball carrier in their own end zone) is worth 2 points, and the scoring team also receives the ball. Some leagues award additional points for interception returns for touchdowns.",
      examples: [
        {
          scenario: "Receiver catches a pass in the end zone",
          score: "Touchdown! 6 points. Team chooses to go for 2-point conversion from the 10-yard line.",
        },
        {
          scenario: "Team scores TD and converts from the 5-yard line",
          score: "6 + 1 = 7 points total for that possession.",
        },
        {
          scenario: "QB's flag is pulled in their own end zone",
          score: "Safety! Defensive team gets 2 points and receives the ball.",
        },
        {
          scenario: "Defender intercepts a 2-point conversion and returns it",
          score: "Defensive team is awarded 2 points in most league rules.",
        },
      ],
      tips: [
        "Going for 2 is higher risk but can swing a close game \u2014 consider the score and time remaining",
        "There are no field goals in most flag football formats",
        "Some leagues use a continuous clock; others stop the clock on incomplete passes and out-of-bounds",
        "Interceptions returned for touchdowns are worth 6 points plus the conversion attempt",
      ],
    },
    rules: [
      {
        rule: "No Contact",
        explanation:
          "Flag football is strictly non-contact. No tackling, blocking, diving at another player, or screening (shielding a runner). Offensive players cannot stiff-arm or guard their flags. Contact results in a penalty.",
      },
      {
        rule: "Flag Pulling Ends the Play",
        explanation:
          "The play is dead when a defender cleanly pulls a flag from the ball carrier's belt. The ball is spotted where the flag was pulled. If a flag falls off accidentally, the ball carrier is down at that spot.",
      },
      {
        rule: "No Fumbles",
        explanation:
          "If the ball carrier drops the ball, the play is dead at the spot of the drop. There are no fumble recoveries in flag football. This keeps the game safe and eliminates pile-ups.",
      },
      {
        rule: "No-Run Zones",
        explanation:
          "Many leagues designate \"no-run zones\" within 5 yards of the end zone and at midfield. In these zones, the offense must pass the ball. This prevents power running in tight spaces and encourages open play.",
      },
      {
        rule: "Rushing the Quarterback",
        explanation:
          "In most leagues, defenders cannot rush the QB unless they are lined up 7 yards from the line of scrimmage. Some leagues use a designated \"blitz\" player or require a delay before rushing. The QB typically has 7 seconds to throw.",
      },
      {
        rule: "Flag Guarding is Illegal",
        explanation:
          "The ball carrier cannot use their hands, arms, or the ball to prevent a defender from pulling their flag. This is called \"flag guarding\" and results in a penalty \u2014 the play is dead at the spot of the infraction.",
      },
      {
        rule: "Receiving Rules",
        explanation:
          "All players on the field are eligible receivers. A receiver must have at least one foot in bounds when catching the ball. A catch is not complete until the receiver has control of the ball with feet in bounds.",
      },
      {
        rule: "Downs and First Downs",
        explanation:
          "Teams get 4 downs to cross midfield for a first down. Once they cross midfield, they get 4 more downs to score a touchdown. If they fail to convert, the other team takes over at the spot.",
      },
      {
        rule: "Interceptions",
        explanation:
          "Interceptions are live and can be returned by the defensive team. If an interception is returned for a touchdown, it counts as a score. Interceptions on extra-point attempts can also be returned for points.",
      },
      {
        rule: "Overtime",
        explanation:
          "If the game is tied at the end of regulation, each team gets one possession from a set yard line. If still tied, teams alternate single-play attempts until one team scores and the other does not.",
      },
    ],
    beginnerTips: [
      "Learn 3-4 basic passing routes: the slant (diagonal cut inward), the out (cut toward the sideline), the curl (run deep then turn back), and the go/fly (straight deep). These cover most situations.",
      "As a quarterback, throw to where the receiver will be, not where they are. Leading your receiver makes catches easier and keeps the play moving.",
      "Wear your flag belt snugly on your hips, not your waist. Flags should hang at the sides and be easily accessible \u2014 tucking or hiding them is a penalty.",
      "On defense, focus on the ball carrier's hips, not the ball or their upper body. The hips tell you where they are going, making flag pulls much easier.",
      "Communication is everything. Call out defensive assignments, alert teammates to blitzes, and coordinate routes before the snap.",
      "Practice catching with your hands, not your body. Secure the ball with your fingers and pull it into your chest. This leads to fewer drops.",
      "If you are new, play receiver or defensive back first. These positions let you focus on one skill (catching or covering) rather than managing the whole offense.",
      "Stay on your feet \u2014 diving is typically not allowed in flag football for safety reasons. Learn to cut and change direction to avoid flag pulls instead.",
    ],
    etiquette: [
      "Respect the no-contact rule completely \u2014 flag football depends on players honoring the spirit of non-contact play",
      "Call penalties on yourself if you accidentally make contact \u2014 self-officiating is common in recreational leagues",
      "High-five or fist-bump the other team before and after the game, regardless of the outcome",
      "Include everyone in the play calling \u2014 great flag football teams get every player involved, not just the best athlete",
      "Keep the competitive spirit friendly. Arguing calls aggressively goes against the recreational spirit of the game",
      "Pick up your flags quickly after each play and return them to the opposing team if they come off during the play",
    ],
    funFacts: [
      "Flag football will make its Olympic debut at the 2028 Los Angeles Games, marking the first time any form of American football will be in the Olympics. Both men's and women's competitions will be held.",
      "NFL Flag, the official youth flag football program, has over 7 million participants across all 50 US states and 100+ countries, making it one of the largest youth sports programs in the world.",
      "In 2024, the NFL announced that flag football would be the first new sport added to the Summer Olympics in over a decade. The International Federation of American Football (IFAF) worked for over 20 years to achieve this milestone.",
      "Many NFL stars played flag football growing up, including Patrick Mahomes, who credits flag football with developing his scrambling ability and improvisation skills.",
      "Flag football is one of the fastest-growing high school sports in the United States. Several states have added it as an officially sanctioned girls' sport, with over 20 states offering championships.",
    ],
    difficulty: "Easy to Learn",
    typicalDuration: "30-60 min/game",
    playersNeeded: "5v5 or 7v7",
  },
};

export function getGuide(sport: string): SportGuide | undefined {
  return SPORT_GUIDES[sport as Sport];
}

export function getAllGuides(): SportGuide[] {
  return Object.values(SPORT_GUIDES);
}
