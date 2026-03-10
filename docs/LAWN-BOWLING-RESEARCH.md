# Lawn Bowling (Bowls) — Comprehensive Research Document

**Purpose:** Domain knowledge reference for building tournament management and player matching software for lawn bowling clubs.
**Date:** March 10, 2026

---

## 1. Game Formats and Team Sizes

Lawn bowls is played in four formats, defined by team size. The number of bowls each player delivers per end decreases as team size increases, keeping the total bowls per team roughly constant.

| Format | Players per team | Bowls per player | Typical game length | Total bowls per team per end |
|--------|-----------------|------------------|---------------------|------------------------------|
| **Singles** | 1 | 4 | First to 21 shots, or 21–25 ends | 4 |
| **Pairs** | 2 | 4 | 21 ends | 8 |
| **Triples** | 3 | 3 | 18 ends | 9 |
| **Fours (Rinks)** | 4 | 2 | 21 ends | 8 |

### Key rules across all formats

- The **jack** (small white/yellow target ball) is rolled first by the lead to set the target distance.
- Players from opposing teams alternate deliveries.
- After all bowls are delivered, the **end** is scored: the team with the closest bowl to the jack earns one **shot** (point) for every bowl they have closer than the opponent's nearest bowl.
- After scoring, the next end begins from the opposite end of the rink.
- The mat and jack positions can vary end to end, adding tactical variety.

### Scoring systems

There are three main scoring approaches used in competitions:

1. **Shots-based (traditional):** The winner is the first to reach a target number of shots (e.g., 21 in singles) or the team with more total shots after a fixed number of ends.
2. **Sets play:** Used in professional/World Bowls Tour events. Each set consists of a fixed number of ends (often 9). The player/team with more shots in a set wins that set. Match is best-of-three or best-of-five sets.
3. **Points-per-game (tournament):** In multi-game tournament days, teams earn points for wins (e.g., 10 points for a win, 8 for a draw, 0 for a loss) plus their shot differential. This allows ranking across multiple games.

### Score capping

In tournament play, a common rule is that no team can receive a game score higher than 1.5 times the number of ends played. For example, in a 10-end game, the maximum recordable margin is 15 shots. This prevents blowout scores from distorting overall standings.

---

## 2. Player Positions and Roles

In team formats (pairs, triples, fours), each player has a designated position with specific duties. The positions play in fixed order every end.

### Lead

- **Plays first** in each end.
- **Places the mat** and **delivers the jack** to set the target distance for the end.
- Primary job: draw bowls as close to the jack as possible to establish an early advantage.
- Must be an excellent, consistent draw player with reliable line and weight.
- The lead "sets the table" for the rest of the team.
- In pairs: also acts as vice and measures at the end.

### Second

- Plays after the lead.
- Transitional role: reinforces good positions established by the lead or adjusts based on what the opponent's lead has done.
- Must be a strong draw player but may also need to play positional/cover bowls.
- In fours: keeps the scorecard and maintains the scoreboard.
- Acts as a communication bridge between the head (where bowls land) and the skip.

### Third (Vice-Skip)

- Plays third in the order.
- Often called the "tactical engine" of the team.
- **Takes charge of the head** when the skip is delivering bowls.
- Responsible for **measuring** disputed shots at the end of each end.
- Must have thorough knowledge of the **Laws of the Sport** and conditions of play.
- Communicates head position, shot options, and tactical information to the skip.
- In triples: this role is combined with some skip-like responsibilities.
- Agrees the score with the opposing third/vice after each end.

### Skip (Captain)

- **Plays last** in each end — the pressure position.
- **Directs team strategy** from the head end, using hand signals and verbal instructions to guide teammates.
- Responsible for reading the overall state of the game: score, conditions, momentum, opponent tendencies.
- Makes tactical decisions: whether to draw, trail the jack, drive, or play positional bowls.
- Must be versatile — capable of every shot type (draw, weighted, drive, trail).
- Has final say on all tactical decisions.
- In club settings, skips are often the most experienced players.

### Position assignments — software implications

- Players typically have a **preferred position** (lead, second, third, skip) based on skill set.
- A player's position preference is critical data for team formation algorithms.
- Some players can play multiple positions; flexibility should be tracked.
- Skill level may vary by position — a strong lead may be a weaker skip.
- In "draw" (random) tournaments, players are typically categorized into position pools (skips pool, leads pool, etc.) before random assignment.

---

## 3. Tournament Formats

### 3.1 Club Championships (Structured)

Traditional knockout/elimination format run over weeks or months within a club.

- Separate championships for singles, pairs, triples, and fours.
- Entry is usually by nomination (players form their own teams for pairs/triples/fours).
- Draw is made at the start; matches are played by agreed dates.
- Winners advance through rounds to a final.
- **Software need:** Bracket generation, deadline tracking, result entry, automatic advancement.

### 3.2 Draw Tournaments (Random Partner Assignment)

The signature social format of lawn bowls. Very common at clubs.

**How it works:**
1. Players register individually (not as teams).
2. On tournament day, the **drawmaster** collects name tags and sorts players into position pools (skips, leads, etc.) based on ability.
3. In front of all participants, skip names are drawn randomly and placed on a draw board against rink numbers.
4. Each skip then randomly picks their team members from the remaining name tags.
5. Teams are formed fresh for each round — you play with different partners each game.
6. After each round, scores are recorded and teams are re-drawn. "Winners play winners, losers play losers" is a common re-draw principle.

**Scoring:** Individual cumulative points across all games. Typical points: win/loss points + shot differential. The overall winner is the individual with the highest total.

**Variants:**
- **Blind Pairs:** Partners not revealed until game time. Maximizes social mixing.
- **Mix and Mingle:** 4 games of 7 ends with different partners each game. Supports 12–48 participants.
- **Half-day option:** Some tournaments allow players to register for AM only (2 games) or full day (4 games).

**Software need:** Random team generation respecting position pools, rink assignment avoiding repeats, per-round score entry, cumulative individual standings, printable draw sheets.

### 3.3 Pick-a-Partner Events

Players choose their own partner(s) before the tournament.

**How it works:**
1. One player registers a team (e.g., a pairs team of 2).
2. They name their chosen partner(s) at registration.
3. The tournament organizer assigns teams to rinks and rounds.
4. Format may be round robin, Swiss, or knockout depending on entries.

**Software need:** Team registration (not individual), partner invitation/confirmation flow, team-based scheduling.

### 3.4 Round Robin

Every team plays every other team (or as many as time allows).

- Best for smaller fields (8 or fewer teams).
- Each match is typically shorter (e.g., 8–10 ends) to fit multiple games in a day.
- Final standings by win/loss record, then shot differential as tiebreaker.
- **Rink constraint:** No team should play on the same rink twice. No two teams should meet more than once.
- **Software need:** Round robin schedule generation with rink constraints, automatic standings calculation.

### 3.5 Knockout / Elimination

- Single elimination: lose once, you're out.
- Double elimination: players get a second chance through a losers bracket.
- Common for club championships and inter-club competitions.
- **Software need:** Bracket generation (handling byes for non-power-of-2 entries), result tracking, bracket display.

### 3.6 Section Play (Pools + Finals)

- Teams divided into sections/pools of 4–6.
- Round robin within sections.
- Top teams from each section advance to knockout finals.
- Common for larger tournaments (16+ teams).
- **Software need:** Pool generation (balanced seeding), within-pool scheduling, cross-pool finals bracket.

### 3.7 Specialty / Social Formats

These add variety to club calendars:

- **Powerplay:** Each team designates one end per game where their score doubles. Declaration happens after jack is rolled but before first bowl is delivered.
- **Tiger Skins:** Ends grouped into segments (e.g., ends 1–3, 4–6, 7–8) with bonus points for each segment winner.
- **Scroungers:** Individual play, 3 bowls each, up to 4 players per rink. Points: 4 for closest to jack, 3 for second, 2 for third, 1 for fourth.
- **Handicap Fours:** Teams receive starting scores (0–4 points) based on division, enabling mixed-skill competition.
- **Medley:** Alternating fours and pairs games throughout the day, with meal breaks built in.
- **Progressive Triples:** Partners rotate between rounds; individual scoring with position-based rankings (best skip, best second, best lead).
- **Super Sixes:** 6-player teams playing both fours and pairs within the same competition.

---

## 4. Club Operations

### 4.1 Typical club structure

A club with ~220 members is mid-to-large for a community bowling club. In Australia, there are over 2,000 clubs with approximately 240,000+ registered players nationally (averaging ~120 per club, but sizes range from 50 to 500+). New Zealand has 500+ clubs with 43,240 adult playing members.

**Membership categories typically include:**
- Full playing members (compete in pennant/championship)
- Social/casual members (social roll-ups, corporate events)
- Life members
- Junior members (where applicable)
- Associate/reciprocal members from other clubs

**Club governance:**
- Management committee (President, Vice President, Secretary, Treasurer)
- Subcommittees: Greens, Tournaments/Match, Coaching, Social/Hospitality, Building/Grounds
- Annual General Meeting with reports and elections
- Greens Director manages playing surface quality and scheduling

### 4.2 How clubs currently manage registration and team formation

**Current state (mostly manual):**
- Tournament entries via sign-up sheets posted on the clubhouse noticeboard.
- Players write their name on the sheet by a closing date.
- For "pick a partner" events, one player writes both names.
- The drawmaster or match committee manually creates the draw (often using spreadsheets, dedicated software like PAMI, or pen-and-paper).
- Results are recorded on paper scorecards, then transcribed to a whiteboard or spreadsheet.
- Championship draws are posted on the noticeboard; players arrange match times by phone.

**Pain points the software should solve:**
- Manual sign-up sheets miss absent members (you must physically visit the club to sign up).
- Draw creation is time-consuming and error-prone.
- No visibility into who has signed up until you visit the club.
- Last-minute withdrawals cause scrambling to rebalance teams.
- Result recording and standings calculation is tedious.
- No historical data on player performance or pairings.

### 4.3 Green and rink allocation

**Physical layout:**
- A standard bowling green is 40m x 40m (approximately 120ft x 120ft).
- Each green is divided into **rinks** (lanes) — typically **6 to 8 rinks per green**.
- Rinks are marked by boundary pegs and numbered.
- Clubs may have 1 to 4 greens, with larger clubs having 2–3.
- A club with 2 greens and 7 rinks each has 14 rinks available simultaneously.

**Allocation considerations:**
- Tournament format determines rinks needed (e.g., 16 fours teams = 8 rinks needed per round).
- Rinks are allocated to avoid teams replaying on the same rink.
- Some rinks play differently (edges vs. center, sun exposure, slope) — experienced drawmasters account for this.
- Green maintenance schedules may take rinks out of service.
- **Software need:** Rink inventory management, constraint-based allocation (no repeat rinks for same team), capacity planning (max teams based on available rinks).

### 4.4 Pennant (inter-club league) competition

- Club teams compete against other clubs on a weekly/fortnightly schedule.
- Multiple divisions based on skill level.
- Teams of fours (most common), with clubs fielding multiple sides (e.g., 4 teams of 4 = 16 players per match day).
- Home and away fixtures across a season.
- Managed at the district/regional association level, not individual clubs.
- **Software relevance:** Player availability tracking for selectors, team sheet generation, but the competition draw itself comes from the association.

---

## 5. iPad / Kiosk Usage at the Clubhouse

### 5.1 Use case: Tournament check-in kiosk

An iPad mounted or placed on a stand in the clubhouse entrance or near the greens serves as a central check-in and information point.

**Check-in flow:**
1. Player arrives at the club for a tournament.
2. Taps their name on the iPad screen (list of registered players) or scans a QR code.
3. System confirms check-in and displays their rink assignment, team, and start time.
4. If using a draw tournament format, check-in feeds into the drawmaster's pool — only checked-in players are included in the draw.
5. Late arrivals can check in; system accommodates them in subsequent rounds.

### 5.2 Use case: Live draw display

- After check-in closes, the drawmaster triggers the automated draw on the iPad.
- The iPad (or a connected TV screen) displays the draw: teams, rink assignments, round times.
- Players gather around to see their assignments — replicating the traditional "draw board" experience digitally.

### 5.3 Use case: Score entry

- After each end or each game, the vice/third enters the score on the iPad.
- Alternatively, one iPad per green with players entering scores after each game.
- Real-time standings update and display on a leaderboard screen.

### 5.4 Use case: Social roll-up sign-in

- For non-tournament days, players arriving for a casual roll-up check in on the iPad.
- Once enough players check in, the system can auto-generate teams and rink assignments.
- Replaces the "put your name tag in the bucket and wait for the drawmaster" process.

### 5.5 Use case: Event registration

- Upcoming tournament flyers displayed on the iPad.
- Players can register for future events directly on the kiosk (especially useful for members without smartphones).
- Shows current registration count and remaining spots.

### 5.6 Technical considerations for kiosk mode

- **iPad Guided Access / Kiosk mode:** Lock the iPad to the web app; prevent users from exiting.
- **Auto-sleep prevention:** Keep screen on during club hours.
- **Large touch targets:** Many lawn bowls players are older adults; UI must have large buttons, readable fonts (16px+), high contrast.
- **Offline resilience:** Club WiFi may be unreliable; app should queue actions and sync when connectivity returns.
- **Authentication:** Kiosk should not require individual login — it operates as a shared device. Individual identification via tap-on-name or PIN, not full auth flow.
- **Screen rotation:** Support both landscape (wall-mounted) and portrait (stand) orientations.

---

## 6. Existing Software Landscape

Understanding competitors and existing tools:

| Software | Description | Strengths | Gaps |
|----------|-------------|-----------|------|
| **PAMI** | Desktop tournament management (Windows). Used since 2011. | Handles 8–48 team draws, multiple formats, results calculation. | Desktop-only, no mobile/web, no player self-service. |
| **BowlsManager** | Web-based club management. | Membership database, fixtures, competitions. | UK-focused, may lack tournament-day operations. |
| **Playpass** | Generic sports league/tournament SaaS. | Online registration, payments, scheduling. | Not bowls-specific, lacks draw tournament logic. |
| **Lawn Bowling Club Manager** | Club websites + management. | Member registration, result entry on tablet. | Limited tournament format support. |
| **Global Lawn Bowls** | All-in-one tournament management. | Automated draws, real-time scoring, leaderboards. | Newer entrant, unclear adoption. |
| **Getagameofbowls** | Spreadsheet templates + format ideas. | Free, creative formats. | Not software — just templates. |

### Key differentiation opportunity

No existing solution combines:
1. **Player self-service registration** (mobile + kiosk)
2. **Automated draw generation** respecting position pools and rink constraints
3. **Real-time check-in** feeding into tournament operations
4. **Live scoring and leaderboard** accessible on any device
5. **Partner matching** for casual play (the "Pick a Partner" value proposition)
6. **PWA** with offline support suitable for club WiFi environments

---

## 7. Data Model Implications

Based on this research, the core entities for lawn bowling tournament software include:

### Player
- Name, contact, membership number
- Preferred position(s): lead, second, third, skip
- Skill level / grading (often club-assigned)
- Position flexibility (can play multiple positions)
- Availability preferences

### Tournament / Event
- Format: draw, pick-a-partner, knockout, round robin, section play, social
- Game format: singles, pairs, triples, fours
- Scoring method: shots, sets, points-per-game
- Number of rounds / ends per game
- Score cap (if applicable)
- Entry fee, registration deadline
- Maximum entries (constrained by rinks x rounds)

### Team (per round in draw tournaments)
- Members with assigned positions
- Generated fresh per round in draw formats
- Fixed for the event in pick-a-partner/championship formats

### Rink
- Green number + rink number (e.g., Green A, Rink 3)
- Status: available, maintenance, reserved
- Capacity: 1 game at a time

### Game (Match)
- Teams involved
- Rink assigned
- Round number
- Score per end (optional granularity)
- Final score (shots for, shots against)
- Winner

### Round
- Part of a tournament
- Set of concurrent games
- Time slot

### Standings / Leaderboard
- Per-player in draw tournaments
- Per-team in pick-a-partner / championship
- Calculated from: wins, losses, shot differential, head-to-head

---

## 8. Key Terminology Glossary

| Term | Definition |
|------|-----------|
| **Jack** | Small target ball (white or yellow) delivered at the start of each end |
| **Bowl** | The large biased ball players deliver (also called a "wood") |
| **End** | One round of play where all players deliver all their bowls; analogous to an inning |
| **Shot** | A point scored; one shot per bowl closer to jack than opponent's nearest |
| **Head** | The cluster of bowls around the jack at the playing end |
| **Rink** | A lane on the bowling green; the playing strip |
| **Green** | The entire playing surface, divided into rinks |
| **Mat** | The small mat from which players deliver their bowls |
| **Draw (shot)** | A gently weighted delivery intended to come to rest near the jack |
| **Drive** | A fast, forceful delivery intended to scatter bowls or move the jack |
| **Trail** | Moving the jack to a new position by hitting it with a bowl |
| **Dead end** | An end that is void (jack knocked off the rink); may be replayed or scored 0-0 |
| **Measure** | Using calipers/tape to determine which bowl is closest when too close to judge by eye |
| **Pennant** | Inter-club league competition (Australian term) |
| **Roll-up** | Casual practice or social play session |
| **Drawmaster** | The person responsible for creating team draws and managing tournament logistics |
| **Marker** | In singles, a neutral person who stands at the head end to assist with information |

---

## Sources

- [Olympics.com — Lawn Bowls Rules](https://www.olympics.com/en/news/lawn-bowls-rules-regulations-how-to-play)
- [Premier Bowls Wear — Categories of Lawn Bowls](https://premierbowlswear.com.au/blog/what-are-the-categories-of-lawn-bowls/)
- [Bowls International — Formats of Play](https://bowlsinternational.keypublishing.com/formats-of-play/)
- [Bowls Alberta — How to Play](https://www.bowlsalberta.com/about-our-sport/how-to-play/)
- [Jack High Bowls — Player Positions Guide](https://www.jackhighbowls.com/help/lawn-bowls-player-positions/)
- [The Bowls Academy — Roles & Responsibilities](https://www.thebowlsacademy.com/blog/lead-second-third-skip-roles-responsibilities-explained)
- [Masonian Bowls Club — Player Roles](https://www.masonianbowlsclub.co.uk/player-roles-and-positions)
- [Glenelg Bowling Club — Roles Within the Team](https://glenelg.bowls.com.au/homepage/bowling/rules-of-bowls/roles-within-the-team/)
- [The Greenbowler — How to Run a Tournament as Drawmaster](https://greenbowler.blogspot.com/2014/10/how-to-run-lawn-bowls-tournament-as.html)
- [Getagameofbowls — Tournament Ideas](https://www.getagameofbowls.com/ggtour.php)
- [PAMI — Tournament Management System](https://pamibowls.com/contents/)
- [BowlsManager — Club Management System](https://www.bowlsmanager.com/)
- [Playpass — Lawn Bowls Management Software](https://playpass.com/sports-software/lawn-bowls-management)
- [Jack High Bowls — Scoring Explained](https://www.jackhighbowls.com/help/how-do-points-work-in-lawn-bowls/)
- [Wikipedia — Bowls](https://en.wikipedia.org/wiki/Bowls)
- [World Bowls — Laws of the Sport](https://www.worldbowls.com/wp-content/uploads/2022/08/Crystal_Mark_Second_Edition.pdf)
- [Bowls Australia — Membership & Participation](https://bowls.com.au/club-support/membership-and-participation/)
- [Bowls New Zealand — About Us](https://bowlsnewzealand.co.nz/about-us/)
- [Milwaukee Lawn Bowling — Tournaments](https://milwaukeelawnbowls.com/tournaments/)
