/**
 * ResultsCardTemplate — used by @vercel/og (next/og) to render a 1080x1080 PNG.
 * IMPORTANT: Only inline styles allowed. No Tailwind classes. No external CSS.
 * Must use flexbox layout (no grid). Limited CSS subset per satori/OG spec.
 */

interface PlayerResult {
  display_name: string;
  wins: number;
  losses: number;
  draws: number;
  shot_diff: number;
}

export interface ResultsCardProps {
  tournamentName: string;
  date: string;
  format: string;
  clubName?: string;
  accentColor?: string;
  topPlayers: PlayerResult[];
  totalRounds: number;
  totalPlayers: number;
}

export function ResultsCardTemplate({
  tournamentName,
  date,
  format,
  clubName,
  accentColor = "#1B5E20",
  topPlayers,
  totalRounds,
  totalPlayers,
}: ResultsCardProps) {
  const medals = ["1st", "2nd", "3rd"];
  const medalColors = ["#D4A017", "#9CA3AF", "#B45309"];

  return (
    <div
      style={{
        width: "1080px",
        height: "1080px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAFAF9",
        fontFamily: "system-ui, sans-serif",
        padding: "80px",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          backgroundColor: accentColor,
          display: "flex",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              LB
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#71717A",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}
            >
              Tournament Results
            </span>
          </div>
          {clubName && (
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#A1A1AA",
              }}
            >
              {clubName}
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: "52px",
            fontWeight: 900,
            color: "#18181B",
            lineHeight: 1.1,
            display: "flex",
          }}
        >
          {tournamentName}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#71717A",
            }}
          >
            {date}
          </span>
          <span style={{ color: "#D4D4D8", fontSize: "18px" }}>|</span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#71717A",
            }}
          >
            {format}
          </span>
          <span style={{ color: "#D4D4D8", fontSize: "18px" }}>|</span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#71717A",
            }}
          >
            {totalRounds} round{totalRounds !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "#D4D4D8", fontSize: "18px" }}>|</span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#71717A",
            }}
          >
            {totalPlayers} players
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "2px",
          backgroundColor: "#E4E4E7",
          display: "flex",
          marginBottom: "48px",
        }}
      />

      {/* Standings */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "20px",
        }}
      >
        {topPlayers.slice(0, 5).map((player, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "24px 32px",
              backgroundColor: idx < 3 ? "white" : "transparent",
              borderRadius: "20px",
              border: idx < 3 ? "2px solid #E4E4E7" : "none",
            }}
          >
            {/* Position badge */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: idx < 3 ? medalColors[idx] : "#D4D4D8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: 800,
                marginRight: "24px",
                flexShrink: 0,
              }}
            >
              {idx < 3 ? medals[idx] : `${idx + 1}`}
            </div>

            {/* Player name */}
            <div
              style={{
                display: "flex",
                flex: 1,
                fontSize: idx === 0 ? "32px" : "26px",
                fontWeight: idx === 0 ? 900 : 700,
                color: "#18181B",
              }}
            >
              {player.display_name}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: accentColor,
                  }}
                >
                  {player.wins}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#A1A1AA",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Wins
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: player.shot_diff > 0 ? accentColor : player.shot_diff < 0 ? "#EF4444" : "#71717A",
                  }}
                >
                  {player.shot_diff > 0 ? "+" : ""}
                  {player.shot_diff}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#A1A1AA",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Shots
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "40px",
          paddingTop: "24px",
          borderTop: "2px solid #E4E4E7",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#A1A1AA",
          }}
        >
          Generated by Lawn Bowling App
        </span>
      </div>
    </div>
  );
}
