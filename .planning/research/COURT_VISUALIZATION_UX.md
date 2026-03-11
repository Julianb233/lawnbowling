# Court Visualization UX Research: Lawn Bowling Green Visualization

*Research Date: 2026-03-11*
*Purpose: Design a revolutionary interactive bowling green visualization — something no one has ever seen in lawn bowls software*

---

## 1. Competitive Analysis: Best Sports Visualization UIs

### 1.1 NBA Player Tracking (Second Spectrum / Hawk-Eye)

**What they do:** Real-time optical tracking of all 10 players + ball at sub-second latency using ceiling-mounted cameras. Second Spectrum's "Dragon" platform synthesizes millions of on-court data points into "mesh" data — a unified model of spatial relationships.

**Visualization highlights:**
- Bird's-eye court view with animated player dots (color-coded by team)
- Shot trajectory arcs overlaid on the court
- Heat maps showing player positioning tendencies per game/quarter
- Passing network diagrams connecting player nodes
- "Ghost" overlays showing predicted vs. actual player movement
- Fan-facing: augmented NBA League Pass with real-time shot probability overlays

**What we can steal:**
- The bird's-eye court with animated elements is directly transferable to a bowling green
- Real-time dot positions on a field representation
- The concept of "tap to zoom into a zone" (tap a rink to see the head)

### 1.2 Tennis Hawk-Eye / GameSetMap

**What they do:** Track ball position with millimeter accuracy. GameSetMap turns Hawk-Eye data into interactive visualizations for coaches.

**Visualization highlights:**
- Court heat maps showing serve/return placement frequency
- Color gradient from cool (blue/green) to hot (red/orange) for density
- Shot placement scatter plots overlaid on a court diagram
- Ball trajectory arcs showing path, spin, and speed
- Side-by-side comparison views (player A vs player B placement)

**What we can steal:**
- Heat map concept → "Where does this player's bowls tend to land relative to the jack?"
- Scatter plot overlay → Bowl landing positions over multiple ends
- The clean court diagram with overlaid data points is exactly what we need

### 1.3 Cricket Scoring Apps

**What they do:** Real-time ball-by-ball scoring with field visualizations.

**Visualization highlights:**
- Wagon wheel: radial lines from batter showing shot directions and distances
- Pitch map: heat map of where bowler's deliveries landed
- Field placement editor: drag fielders to positions on an overhead field diagram
- Worm graph: two-line chart comparing run rates over time

**What we can steal:**
- The wagon wheel concept → "Bowl trajectory wheel" showing all bowls from one end
- Pitch map → Bowl landing zone heat map around the jack
- Field placement editor UX → Drag-to-position bowl markers on the rink

### 1.4 Curling Stone Tracking

**What they do:** The closest sport to lawn bowls. Track stone positions and trajectories on the sheet.

**Key systems:**
- **i-enter Stone Tracking System** (Japan): 12 ceiling cameras tracking stone positions at the Kitami Curling Hall. Used by Olympic-level curlers. Visualizes trajectories in real-time.
- **SPECTO Curling** (Finland): LIDAR-based tracking measuring speed and position at any point on the sheet. Available as permanent install or mobile unit.
- **Academic systems**: Machine learning-based stone detection from broadcast cameras, used at All Japan Championships 2017 for live trajectory overlays.

**Visualization highlights:**
- Overhead view of the "house" (target rings) with stone positions
- Color-coded stones (red/yellow) with team identification
- Trajectory lines showing curl path from hack to house
- Distance measurements from button (center) to each stone
- Shot replay with animated trajectory

**What we can steal:** EVERYTHING. Curling's "house view" is directly analogous to our "head view."
- The house = the cluster of bowls around the jack
- Stones = bowls
- Button = jack
- The overhead visualization of stone positions relative to the button IS what we need to build

### 1.5 Golf Shot Tracking (Arccos / Toptracer)

**What they do:** Track every shot a golfer hits, overlay on course maps with analytics.

**Visualization highlights:**
- **Arccos**: Aerial course map with shot positions plotted as connected dots. Color-coded by club. Advanced slope/contour visualization for greens. AI caddie recommends club based on player history.
- **Toptracer**: Real-time ball flight trajectory visualization (the TV graphic). High-res imaging creates detailed path maps.
- Strokes Gained analytics with course-overlay heat maps
- Round-over-round comparison on same hole

**What we can steal:**
- The aerial map with overlaid data points concept
- Shot history visualization → Bowl history per end
- The premium feel of Arccos's dashboard (dark mode, gradients, beautiful charts)

### 1.6 Soccer/Football Analytics (StatsBomb / Opta)

**What they do:** Player position tracking, passing networks, shot maps.

**Visualization highlights:**
- **Player heat maps**: Gaussian blur overlay on pitch showing positioning intensity
- **Passing networks**: Nodes at average positions, edges showing pass frequency/direction
- **xG shot maps**: Circles on pitch showing shot quality (size = probability)
- **Possession value models**: Grid overlays showing territorial control
- Interactive pitch that updates as you scrub through time

**What we can steal:**
- Heat map rendering technique (Gaussian blur on data points)
- The concept of time-scrubbing through a match
- Grid overlay for spatial analysis

### 1.7 Existing Bowls/Bocce Apps

**Current state of the art (which is poor):**
- **Bowls Score Card**: Simple digital scorecard. No visualization at all.
- **rollUp Scorecard**: Score entry only. No spatial visualization.
- **Bowls Buddy**: Training drill tracker. No game visualization.
- **Bocce Toolkit AR**: Uses ARKit to measure which ball is closer to the pallino. Clever use of AR but limited to measurement — no persistent visualization or replay.
- **Bocce Scoreboard Deluxe**: Digital scoreboard simulation. No court visualization.
- **Kazo Vision**: Professional LED scoreboard system for competitions. Hardware-focused, no software visualization.
- **PlayPass**: Club management software. Scheduling only, no game visualization.

**Key finding: NOBODY is doing spatial visualization for lawn bowls.** Every existing app is either a scorecard or a management tool. There is no interactive head visualization, no bowl position tracking, no trajectory replay. This is a completely empty market.

---

## 2. The Opportunity: What Would Dominate

### 2.1 The Gap

Every sport with a spatial element now has visualization technology except lawn bowls:
- Basketball → Second Spectrum
- Tennis → Hawk-Eye
- Cricket → Wagon wheels, pitch maps
- Curling → Stone tracking
- Golf → Shot tracking maps
- Soccer → Heat maps, xG

Lawn bowls has... paper scorecards digitized into apps. That's it.

### 2.2 What Would Be Revolutionary

A **real-time interactive bowling green visualization** with three layers:

**Layer 1 — The Green Map (Club Level)**
An overhead view of the entire bowling green showing all rinks (typically 6-8 rinks side by side). Each rink shows:
- Rink number
- Current teams playing
- Live score
- Status indicator (in progress / completed / waiting)
- Tap a rink to drill into Layer 2

**Layer 2 — The Rink View (Game Level)**
A zoomed overhead view of a single rink (31-40m long, 4.3-5.8m wide). Shows:
- The jack position (small yellow circle)
- All bowls in play (color-coded by team)
- The mat position at the delivery end
- End number and score
- Swipe between ends to see history
- Pinch to zoom into the head

**Layer 3 — The Head View (Shot Level)**
A close-up overhead view of the cluster of bowls around the jack. This is the money view — the thing no one has built. Shows:
- Jack as a prominent yellow circle
- Each bowl as a colored circle with player initial
- Distance lines from each bowl to the jack
- Auto-calculated shot count
- Bowl arrival order (subtle numbered indicators)
- Touch to see which bowl belongs to which player
- Animated replay of bowls arriving one by one

### 2.3 Advanced Features (Phase 2+)

- **Bowl trajectory animation**: Curved paths showing the biased line each bowl took
- **Heat maps**: Over multiple games, where does a player's bowls tend to cluster?
- **"Measure" mode**: AR or tap-to-measure showing exactly which bowl is closer
- **Shot suggestions**: AI recommending where to place the next bowl
- **Spectator mode**: Live head view that updates in real-time for people watching from the clubhouse
- **TV mode integration**: Display the head view on the clubhouse TV between score updates

---

## 3. Technical Approach

### 3.1 Rendering Technology Decision

| Technology | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **SVG** | DOM-based (easy interaction), scales perfectly, CSS animations, accessibility, React-friendly | Slow with 100+ elements, no shader effects | **Best for Layer 1 (Green Map) and Layer 2 (Rink View)** |
| **HTML Canvas 2D** | Fast rendering, good for many objects, pixel-perfect control | No DOM = harder interaction, manual hit testing | Good fallback if SVG is too slow |
| **React Three Fiber (Three.js)** | True 3D, spectacular visuals, physically-based rendering, camera controls | Heavy bundle, complex, overkill for 2D overhead | **Best for Layer 3 (Head View) if we want 3D** |
| **Framer Motion + SVG** | Already in the project stack, smooth animations, gesture support, spring physics | Limited to 2D | **Best for animations within SVG** |

**Recommended approach: SVG + Framer Motion for all layers, with optional R3F upgrade for 3D Head View.**

Rationale:
1. The app already uses Framer Motion extensively
2. SVG gives us perfect scaling on all devices (iPad kiosk to iPhone to TV)
3. SVG elements are in the DOM → accessible, clickable, testable
4. For the head view, we only need to render ~20 objects (8-16 bowls + 1 jack + distance lines)
5. Framer Motion's `motion.circle`, `motion.line`, `motion.path` give us beautiful animations
6. If we later want a "3D head view" as a premium wow feature, we can add R3F for just that component

### 3.2 Data Model

New Supabase tables needed:

```sql
-- Bowl positions within an end (for head visualization)
CREATE TABLE bowl_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_score_id UUID REFERENCES tournament_scores(id) ON DELETE CASCADE,
  end_number INT NOT NULL,
  bowl_index INT NOT NULL,          -- Order bowled (1-16 for fours)
  team TEXT NOT NULL CHECK (team IN ('a', 'b')),
  player_id UUID REFERENCES players(id),
  position_x FLOAT NOT NULL,        -- Relative position on rink (0-1 normalized)
  position_y FLOAT NOT NULL,        -- Relative position on rink (0-1 normalized)
  is_jack BOOLEAN DEFAULT FALSE,    -- True if this is the jack position
  distance_to_jack FLOAT,           -- Measured or estimated distance in cm
  is_shot BOOLEAN DEFAULT FALSE,    -- True if this bowl is counting as a shot
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tournament_score_id, end_number, bowl_index)
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE bowl_positions;
```

### 3.3 Input Method for Bowl Positions

The key UX challenge: how do players/officials record bowl positions?

**Option A — Tap-to-Place (Recommended for v1)**
1. After an end is completed, score entry person opens "Head View"
2. They see the rink/head area as a blank canvas
3. Tap to place the jack (yellow)
4. Tap to place each bowl (alternating team colors)
5. The app auto-calculates which bowls are shots
6. Takes 15-30 seconds per end — fast enough for tournament use

**Option B — Photo + AI Detection (Future)**
1. Take a photo of the head from above
2. Computer vision detects bowl positions and colors
3. Auto-populates the head diagram
4. Human confirms/adjusts

**Option C — AR Measurement (Future)**
1. Like Bocce Toolkit AR but better
2. Point phone at the head
3. AR overlay shows distances and shot count
4. Positions auto-recorded

### 3.4 Component Architecture

```
src/
  components/
    green-viz/
      GreenMap.tsx          -- Layer 1: Full green with all rinks
      RinkView.tsx          -- Layer 2: Single rink overhead
      HeadView.tsx          -- Layer 3: Close-up head visualization
      HeadEditor.tsx        -- Tap-to-place bowl positioning interface
      BowlMarker.tsx        -- Individual bowl circle component
      JackMarker.tsx        -- Jack circle component
      DistanceLine.tsx      -- Line from bowl to jack with measurement
      TrajectoryPath.tsx    -- Curved path showing bowl trajectory
      RinkOutline.tsx       -- SVG outline of a rink with markings
      EndTimeline.tsx       -- Horizontal timeline to scrub between ends
      ShotCounter.tsx       -- Shows "Team A: 3 shots" count
```

### 3.5 Libraries

Already in the project:
- **Framer Motion** (`motion` from `framer-motion`) — Used throughout the app
- **Tailwind CSS v4** — For utility styling
- **Radix UI** — For accessible interactive elements
- **cn()** utility — For conditional classnames

To add:
- No additional libraries needed for SVG approach!
- Optional: `@react-three/fiber` + `@react-three/drei` if we pursue 3D head view later

---

## 4. Wireframe Descriptions

### 4.1 Green Map (Layer 1) — `/bowls/[id]/green`

```
+------------------------------------------------------------------+
| BOWLS TOURNAMENT NAME                        Round 2 of 3         |
| March 11, 2026                               12 ends per game     |
+------------------------------------------------------------------+
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+  +--------+      |
|  | RINK 1 |  | RINK 2 |  | RINK 3 |  | RINK 4 |  | RINK 5 |     |
|  |        |  |        |  |        |  |        |  |        |      |
|  | Smith  |  | Jones  |  | Brown  |  | Davis  |  | Wilson |      |
|  |   vs   |  |   vs   |  |   vs   |  |   vs   |  |   vs   |      |
|  | Clark  |  | White  |  | Green  |  | Adams  |  | Thomas |      |
|  |        |  |        |  |        |  |        |  |        |      |
|  | 12 - 8 |  | 6 - 14 |  | 10-10  |  | 15 - 3 |  | 7 - 11 |    |
|  | End 8  |  | End 10 |  | End 7  |  | FINAL  |  | End 9  |     |
|  |   [*]  |  |   [*]  |  |   [*]  |  |   [v]  |  |   [*]  |     |
|  +--------+  +--------+  +--------+  +--------+  +--------+      |
|                                                                    |
|  [*] = in progress (pulsing green dot)                            |
|  [v] = completed (checkmark)                                       |
+------------------------------------------------------------------+
```

Each rink is a tall, narrow rectangle (matching real proportions). Tapping a rink transitions to the Rink View with a smooth zoom animation.

**Design notes:**
- Grass-green background with subtle texture
- White dashed lines separating rinks (like the real green)
- Rink numbers at both ends
- Team names are abbreviated (skip's last name)
- Score prominently displayed
- Status dot pulses for active games
- Landscape orientation ideal (matches green shape)

### 4.2 Rink View (Layer 2) — `/bowls/[id]/rink/[rink]`

```
+------------------------------------------------------------------+
|  < Back to Green    RINK 3 — End 7 of 12    Score: 10-10          |
+------------------------------------------------------------------+
|                                                                    |
|  Team A: Brown (S), Lee (V), Patel (2), Kim (L)                  |
|  Team B: Green (S), Hall (V), Scott (2), Young (L)               |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |  MAT                                                          | |
|  |   [=]                                                         | |
|  |                                                               | |
|  |                                                               | |
|  |                                                               | |
|  |                        * o O                                  | |
|  |                      o   *   O                                | |
|  |                        O * o                                  | |
|  |                          *                                    | |
|  |                        JACK                                   | |
|  |                                                               | |
|  |                                                               | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  [< End 6]  [ End 7 ]  [End 8 >]    [Enter Score] [Edit Head]   |
+------------------------------------------------------------------+
```

**Design notes:**
- Rink drawn to scale (long and narrow)
- Bowls shown as circles (Team A = red, Team B = blue)
- Jack = small yellow circle
- The head area is magnified slightly to be visible
- Bowl size indicates proximity (larger = closer to viewer, like perspective)
- End navigation at bottom — swipe or tap arrows
- "Edit Head" opens the HeadEditor for positioning bowls

### 4.3 Head View (Layer 3) — Modal overlay or zoom from Rink View

```
+------------------------------------------------------------------+
|                     HEAD VIEW — End 7                              |
|                     Team A: 3 shots                                |
+------------------------------------------------------------------+
|                                                                    |
|                                                                    |
|              B2 -------- 32cm --------+                           |
|             /                          |                           |
|           A1 --- 12cm ---+            |                           |
|          /                |            |                           |
|        A3 --- 8cm --+    |            |                           |
|       /              |    |            |                           |
|     A2 - 5cm -+     |    |            |                           |
|               |     |    |            |                           |
|              [JACK] |    |            |                           |
|               |     |    |            |                           |
|     B1 - 6cm -+     |    |            |                           |
|                      |    |            |                           |
|              B3 ----+    |            |                           |
|                          |            |                           |
|                   A4 ---+            |                           |
|                                       |                           |
|                                B4 ---+                            |
|                                                                    |
|  [Replay Animation]  [Measure Mode]  [Share Screenshot]          |
+------------------------------------------------------------------+
```

Actually rendered as a circular/radial view:

```
+------------------------------------------------------------------+
|                     HEAD VIEW — End 7                              |
|                  Team A: 3 shots (5cm, 8cm, 12cm)                 |
+------------------------------------------------------------------+
|                                                                    |
|                          B4                                        |
|                                                                    |
|                    A4          B2                                  |
|                                                                    |
|              B3          A1                                        |
|                                                                    |
|                    A3                                              |
|                       A2    JACK                                   |
|                          B1                                        |
|                                                                    |
|                                                                    |
|  Distance rings: 10cm --- 20cm --- 30cm --- 40cm                  |
|                                                                    |
|  A2: 5cm  |  B1: 6cm  |  A3: 8cm  |  A1: 12cm  [3 shots A]     |
|                                                                    |
|  [Replay]  [Measure]  [Share]  [Close]                           |
+------------------------------------------------------------------+
```

**Design notes:**
- Jack is center of the view with concentric distance rings (like curling house)
- Bowls positioned relative to jack using polar coordinates
- Team A bowls = solid red circles with player initial
- Team B bowls = solid blue circles with player initial
- Distance lines from each bowl to jack (dashed, subtle)
- Bowls that are "shots" (counting) have a golden glow/ring
- Distance value displayed next to each bowl
- Bottom bar shows ordered list: closest to furthest
- "Replay" button animates bowls arriving one at a time in delivery order
- "Share" generates a screenshot image for social media

### 4.4 Head Editor (Tap-to-Place Interface)

```
+------------------------------------------------------------------+
|                  PLACE BOWLS — End 7, Rink 3                      |
|                  Tap to place each element                         |
+------------------------------------------------------------------+
|                                                                    |
|  Place: [JACK]  [A-Lead]  [B-Lead]  [A-2nd]  [B-2nd] ...        |
|                  ^active                                           |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |                                                               | |
|  |                                                               | |
|  |                                                               | |
|  |                    (tap anywhere to place)                    | |
|  |                                                               | |
|  |                           *  <-- jack placed                  | |
|  |                                                               | |
|  |                                                               | |
|  |                                                               | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Already placed:  JACK [*]  A-Lead [o]                            |
|  Next: B-Lead                                                      |
|                                                                    |
|  [Undo Last]  [Clear All]  [Save & Calculate]                    |
+------------------------------------------------------------------+
```

**Design notes:**
- Sequential placement: jack first, then bowls in delivery order
- Each tap places the current bowl at that position
- Placed bowls are draggable for adjustment
- Undo removes the last placed bowl
- "Save & Calculate" auto-computes distances and shot count
- Large touch targets for iPad kiosk use
- Visual feedback: ripple effect on tap, bowl drops in with spring animation

---

## 5. Integration with Existing App

### 5.1 Entry Points

The visualization integrates at several points in the existing app:

| Entry Point | Location | How It Opens |
|------------|----------|--------------|
| Tournament detail page | `/bowls/[id]` | New "Green View" tab alongside existing tabs |
| Live scores page | `/bowls/[id]/live` | "View Head" button next to each rink score |
| Score entry page | `/bowls/[id]/scores` | "Record Head" button after entering end scores |
| TV scoreboard | `/tv` | Auto-cycle through head views between score displays |
| Admin courts page | `/admin/courts` | Visual rink management instead of plain list |
| Kiosk mode | `/kiosk/bowls/[id]` | Spectator-mode green view for the clubhouse |

### 5.2 New Routes

```
/bowls/[id]/green           -- Full green map (Layer 1)
/bowls/[id]/green/[rink]    -- Single rink view (Layer 2)
/bowls/[id]/green/[rink]/head/[end]  -- Head view for specific end (Layer 3)
```

### 5.3 Realtime Integration

The app already uses Supabase Realtime for live score updates (see `src/app/bowls/[id]/live/page.tsx`). The green visualization would subscribe to the same channels:

```typescript
// Subscribe to bowl position updates for live head view
const channel = supabase
  .channel(`head-${tournamentId}-${rink}-${end}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bowl_positions',
    filter: `tournament_score_id=eq.${scoreId}`,
  }, (payload) => {
    // Animate new bowl appearing on the head view
    addBowlWithAnimation(payload.new);
  })
  .subscribe();
```

### 5.4 Data Flow

```
Score Entry Page          Head Editor           Green Map
     |                       |                      |
     | (enter end score)     | (place bowls)        | (view all rinks)
     v                       v                      v
tournament_scores -----> bowl_positions -------> Live Updates
     |                       |                      |
     | (Supabase Realtime)   | (Supabase Realtime)  |
     v                       v                      v
Live Scores Page         Head View              TV Scoreboard
```

---

## 6. Phased Implementation Plan

### Phase 1: Static Head View (MVP)
- `HeadView` component with SVG bowls + jack
- Manual "tap to place" bowl positioning
- Auto-calculate shot count
- Distance rings around jack
- Integrate into score entry flow
- **Effort: ~3-4 days**

### Phase 2: Green Map + Rink View
- Full green map showing all rinks
- Tap-to-zoom into rink
- End-by-end navigation
- Realtime updates
- **Effort: ~2-3 days**

### Phase 3: Animations + Polish
- Bowl arrival replay animation (Framer Motion spring physics)
- Smooth zoom transitions between layers
- Share/screenshot feature
- TV mode integration
- **Effort: ~2-3 days**

### Phase 4: Advanced Analytics
- Bowl heat maps over multiple games
- Player tendency analysis
- Historical head comparisons
- **Effort: ~3-5 days**

### Phase 5: 3D Head View (Wow Factor)
- React Three Fiber 3D rendering of the head
- Camera orbit controls
- Physically accurate bowl shapes (biased ellipsoid)
- Grass texture on the ground
- Shadow casting
- **Effort: ~5-7 days**

---

## 7. Design Inspiration Summary

| Source | Key Insight | Application to Lawn Bowls |
|--------|------------|--------------------------|
| NBA Second Spectrum | Bird's-eye court with animated player dots | Green map with animated bowl positions |
| Curling stone tracking | Overhead "house" view with stone positions + distances | Head view with bowl positions + distances to jack |
| Tennis Hawk-Eye | Heat maps of ball placement over time | Bowl landing heat maps per player |
| Cricket wagon wheel | Radial shot direction visualization | Bowl trajectory visualization from mat to head |
| Golf Arccos | Course map with shot overlay, premium dark UI | Green map with rink overlay, polished aesthetic |
| Soccer xG maps | Circle size = data value on a field diagram | Bowl circle glow = proximity to jack |
| Bocce Toolkit AR | AR measurement of closest ball | Future AR mode for measuring shots |
| Arccos slope visualization | Contour/gradient overlays on terrain | Potential green surface contour overlay |

---

## 8. Why This Would Win

1. **First mover**: Zero competitors have any spatial visualization. We'd be the only product with this.
2. **Spectator engagement**: Clubhouse TVs could show live head views — people would actually watch.
3. **Tournament differentiation**: Clubs using our app would run visually stunning tournaments.
4. **Social sharing**: "Look at this incredible head from today's game" → shareable screenshots.
5. **Data moat**: Bowl position data over time creates a unique dataset no one else has.
6. **Premium feature**: This is the feature that justifies the paid tier.
7. **Press-worthy**: "The app that brought Hawk-Eye to lawn bowls" is a story media would cover.
8. **iPad kiosk killer feature**: A live green view on the club's iPad kiosk would be incredible.

---

## 9. Technical Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bowl position input is too slow | Users won't bother recording head positions | Make tap-to-place ultra-fast (<20 sec per end). Provide "quick mode" for just shot count without exact positions. |
| SVG performance on older iPads | Green map with many bowls may lag | Limit animation complexity. Use CSS transforms over SVG attribute animation. Virtualize off-screen rinks. |
| Accuracy of tap-to-place positions | Positions won't match reality exactly | Frame it as approximate visualization, not measurement tool. Optional fine-tune drag after placement. |
| 3D view (R3F) bundle size | Adding Three.js adds ~500KB to bundle | Dynamic import (`next/dynamic`) so it only loads on the head view page. |
| Realtime subscription limits | Too many active channels for large tournaments | Aggregate updates server-side, broadcast per-rink instead of per-bowl. |

---

## 10. Recommended Next Steps

1. **Build the `HeadView` component first** — it's the most visually impressive and technically simplest piece (just SVG circles + lines)
2. **Create the `bowl_positions` table** in Supabase
3. **Build the `HeadEditor` tap-to-place interface** — this is the main UX challenge
4. **Integrate into the existing score entry flow** — add a "Record Head" button
5. **Add the Green Map** as a new route `/bowls/[id]/green`
6. **Polish with Framer Motion animations** — bowl arrival, zoom transitions
7. **Add to TV mode** — cycle head views on the clubhouse display

This feature alone could make Lawnbowl.app the most visually advanced lawn bowling software in the world. No existing product comes close to offering spatial visualization of the head, and the curling industry has already proven that spectators and players love this kind of data.
